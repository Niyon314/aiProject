package services

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"time"

	"couple-home/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// AuthService 认证服务
type AuthService struct {
	db           *gorm.DB
	jwtSecret    []byte
	accessTokenTTL  time.Duration
	refreshTokenTTL time.Duration
}

// TokenPair 令牌对
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"` // 秒
}

// Claims JWT 声明
type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// RegisterRequest 注册请求
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=6,max=50"`
	Nickname string `json:"nickname"`
}

// LoginRequest 登录请求
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// RefreshRequest 刷新令牌请求
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// NewAuthService 创建认证服务
func NewAuthService(db *gorm.DB, jwtSecret string) *AuthService {
	return &AuthService{
		db:              db,
		jwtSecret:       []byte(jwtSecret),
		accessTokenTTL:  24 * time.Hour, // Access token 24 小时
		refreshTokenTTL: 7 * 24 * time.Hour, // Refresh token 7 天
	}
}

// generateSecureToken 生成安全随机令牌
func generateSecureToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(bytes), nil
}

// Register 用户注册
func (s *AuthService) Register(ctx context.Context, req RegisterRequest) (*models.User, error) {
	// 检查用户名是否已存在
	var existingUser models.User
	if err := s.db.WithContext(ctx).Where("username = ?", req.Username).First(&existingUser).Error; err == nil {
		return nil, errors.New("用户名已存在")
	}

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("密码加密失败")
	}

	// 创建用户
	user := &models.User{
		Username: req.Username,
		Password: string(hashedPassword),
		Nickname: req.Nickname,
	}

	if err := s.db.WithContext(ctx).Create(user).Error; err != nil {
		return nil, errors.New("创建用户失败：" + err.Error())
	}

	return user, nil
}

// Login 用户登录
func (s *AuthService) Login(ctx context.Context, req LoginRequest) (*TokenPair, error) {
	// 查找用户
	var user models.User
	if err := s.db.WithContext(ctx).Where("username = ?", req.Username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户名或密码错误")
		}
		return nil, errors.New("登录失败")
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("用户名或密码错误")
	}

	// 生成令牌对
	return s.GenerateTokenPair(user)
}

// RefreshToken 刷新访问令牌
func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (*TokenPair, error) {
	// 验证刷新令牌
	var storedToken models.RefreshToken
	if err := s.db.WithContext(ctx).Where("token = ?", refreshToken).First(&storedToken).Error; err != nil {
		return nil, errors.New("无效的刷新令牌")
	}

	// 检查是否过期
	if storedToken.ExpiresAt.Before(time.Now()) {
		// 删除过期的令牌
		s.db.WithContext(ctx).Delete(&storedToken)
		return nil, errors.New("刷新令牌已过期")
	}

	// 查找用户
	var user models.User
	if err := s.db.WithContext(ctx).First(&user, storedToken.UserID).Error; err != nil {
		return nil, errors.New("用户不存在")
	}

	// 删除旧的刷新令牌
	s.db.WithContext(ctx).Delete(&storedToken)

	// 生成新的令牌对
	return s.GenerateTokenPair(user)
}

// Logout 登出 (删除刷新令牌)
func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
	return s.db.WithContext(ctx).Where("token = ?", refreshToken).Delete(&models.RefreshToken{}).Error
}

// GenerateTokenPair 生成令牌对 (公开方法)
func (s *AuthService) GenerateTokenPair(user models.User) (*TokenPair, error) {
	// 生成访问令牌
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, err
	}

	// 生成刷新令牌
	refreshToken, err := s.generateRefreshToken(user.ID)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(s.accessTokenTTL.Seconds()),
	}, nil
}

// generateAccessToken 生成访问令牌
func (s *AuthService) generateAccessToken(user models.User) (string, error) {
	claims := Claims{
		UserID:   user.ID,
		Username: user.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.accessTokenTTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "couple-home",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

// generateRefreshToken 生成刷新令牌
func (s *AuthService) generateRefreshToken(userID uint) (string, error) {
	token, err := generateSecureToken()
	if err != nil {
		return "", err
	}

	// 存储刷新令牌到数据库
	refreshToken := &models.RefreshToken{
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(s.refreshTokenTTL),
	}

	if err := s.db.Create(refreshToken).Error; err != nil {
		return "", errors.New("保存刷新令牌失败")
	}

	return token, nil
}

// ValidateToken 验证访问令牌
func (s *AuthService) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return s.jwtSecret, nil
	})

	if err != nil {
		return nil, errors.New("无效的令牌")
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("无效的令牌声明")
	}

	return claims, nil
}

// GetUserByID 根据 ID 获取用户
func (s *AuthService) GetUserByID(ctx context.Context, userID uint) (*models.User, error) {
	var user models.User
	if err := s.db.WithContext(ctx).First(&user, userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
