package middleware

import (
	"couple-home/internal/services"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware JWT 认证中间件
type AuthMiddleware struct {
	authService *services.AuthService
}

// NewAuthMiddleware 创建认证中间件
func NewAuthMiddleware(authService *services.AuthService) *AuthMiddleware {
	return &AuthMiddleware{
		authService: authService,
	}
}

// Auth 认证中间件处理函数
func (m *AuthMiddleware) Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从 Authorization header 获取 token
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "未提供认证令牌",
			})
			c.Abort()
			return
		}

		// 检查 Bearer 前缀
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "认证格式错误，应为 Bearer <token>",
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// 验证令牌
		claims, err := m.authService.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "无效的认证令牌",
			})
			c.Abort()
			return
		}

		// 将用户信息存入上下文
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("claims", claims)

		c.Next()
	}
}

// OptionalAuth 可选认证中间件 (有 token 则验证，没有也继续)
func (m *AuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.Next()
			return
		}

		tokenString := parts[1]
		claims, err := m.authService.ValidateToken(tokenString)
		if err != nil {
			c.Next()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("claims", claims)

		c.Next()
	}
}
