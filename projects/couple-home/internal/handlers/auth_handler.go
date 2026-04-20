package handlers

import (
	"couple-home/internal/middleware"
	"couple-home/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AuthHandler 认证处理器
type AuthHandler struct {
	authService *services.AuthService
}

// NewAuthHandler 创建认证处理器
func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Register 用户注册
// POST /api/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req services.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "参数错误：" + err.Error(),
		})
		return
	}

	user, err := h.authService.Register(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// 生成令牌对
	tokenPair, err := h.authService.GenerateTokenPair(*user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "生成令牌失败",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": gin.H{
			"user": gin.H{
				"id":       user.ID,
				"username": user.Username,
				"nickname": user.Nickname,
				"avatar":   user.Avatar,
			},
			"tokens": tokenPair,
		},
	})
}

// Login 用户登录
// POST /api/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req services.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "参数错误：" + err.Error(),
		})
		return
	}

	tokenPair, err := h.authService.Login(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": tokenPair,
	})
}

// RefreshToken 刷新令牌
// POST /api/auth/refresh
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req services.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "参数错误：" + err.Error(),
		})
		return
	}

	tokenPair, err := h.authService.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": tokenPair,
	})
}

// Logout 用户登出
// POST /api/auth/logout
func (h *AuthHandler) Logout(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "参数错误：" + err.Error(),
		})
		return
	}

	if err := h.authService.Logout(c.Request.Context(), req.RefreshToken); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "登出失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "登出成功",
	})
}

// GetCurrentUser 获取当前用户信息
// GET /api/auth/me
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "未认证",
		})
		return
	}

	user, err := h.authService.GetUserByID(c.Request.Context(), userID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "用户不存在",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"nickname": user.Nickname,
			"avatar":   user.Avatar,
			"created_at": user.CreatedAt,
		},
	})
}

// RegisterAuthRoutes 注册认证路由
func RegisterAuthRoutes(r *gin.RouterGroup, authService *services.AuthService) {
	handler := NewAuthHandler(authService)
	authMiddleware := middleware.NewAuthMiddleware(authService)

	// 公开路由 (不需要认证)
	r.POST("/auth/register", handler.Register)
	r.POST("/auth/login", handler.Login)
	r.POST("/auth/refresh", handler.RefreshToken)

	// 需要认证的路由
	auth := r.Group("")
	auth.Use(authMiddleware.Auth())
	{
		auth.POST("/auth/logout", handler.Logout)
		auth.GET("/auth/me", handler.GetCurrentUser)
	}
}
