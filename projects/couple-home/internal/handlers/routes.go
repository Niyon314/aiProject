package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RegisterAllRoutes 注册所有路由
func RegisterAllRoutes(r *gin.Engine, db *gorm.DB, apiKey, apiBase string) {
	// API 路由组
	api := r.Group("/api")
	{
		// 注册各个模块的路由
		RegisterCalendarRoutes(api, db)
		RegisterMessageRoutes(api, db)
		RegisterPointsRoutes(api, db)
		RegisterWishlistRoutes(api, db)
		RegisterDiaryRoutes(api, db)
		RegisterReminderRoutes(api, db)

		// AI 菜谱推荐路由
		RegisterRecipeAIRoutes(api, apiKey, apiBase)
	}

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Couple Home API is running",
		})
	})
}
