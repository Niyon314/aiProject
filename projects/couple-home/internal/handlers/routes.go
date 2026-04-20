package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RegisterAllRoutes 注册所有路由
func RegisterAllRoutes(r *gin.Engine, db *gorm.DB, apiKey, apiBase string) {
	// 创建照片墙处理器
	photoHandler := NewPhotoHandler(db)

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

		// 照片墙路由
		api.POST("/photos/upload", photoHandler.UploadPhoto)
		api.POST("/photos/upload-multi", photoHandler.UploadPhotos)
		api.GET("/photos/upload-progress/:session_id", photoHandler.GetUploadProgress)
		api.GET("/photos/timeline", photoHandler.GetPhotoTimeline)
		api.GET("/photos", photoHandler.GetPhotos)
		api.GET("/photos/:id", photoHandler.GetPhoto)
		api.DELETE("/photos/:id", photoHandler.DeletePhoto)
		api.POST("/photos/:id/like", photoHandler.LikePhoto)
		api.POST("/photos/:id/comment", photoHandler.AddComment)
		api.GET("/photos/:id/comments", photoHandler.GetComments)
		api.DELETE("/photos/comments/:id", photoHandler.DeleteComment)
		api.POST("/photos/:id/filter", photoHandler.ApplyFilter)
		api.POST("/photos/generate-month-video", photoHandler.GenerateMonthVideo)
		api.GET("/photos/month-videos", photoHandler.GetMonthVideos)
	}

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Couple Home API is running",
		})
	})
}
