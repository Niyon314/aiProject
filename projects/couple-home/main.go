package main

import (
	"couple-home/internal/handlers"
	"couple-home/internal/middleware"
	"couple-home/internal/models"
	"couple-home/internal/services"
	"flag"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	// 命令行参数
	port := flag.String("port", "8080", "服务器端口")
	dbPath := flag.String("db", "couple_home.db", "数据库文件路径")
	jwtSecret := flag.String("jwt-secret", os.Getenv("JWT_SECRET"), "JWT 密钥")
	apiKey := flag.String("api-key", os.Getenv("AI_API_KEY"), "AI API 密钥")
	apiBase := flag.String("api-base", os.Getenv("AI_API_BASE"), "AI API 基础 URL")
	flag.Parse()

	// 如果未提供 JWT 密钥，使用默认值 (生产环境应该使用环境变量)
	if *jwtSecret == "" {
		*jwtSecret = "couple-home-jwt-secret-change-in-production"
		log.Println("警告：使用默认 JWT 密钥，生产环境请设置 JWT_SECRET 环境变量")
	}

	// 初始化数据库
	db, err := initDatabase(*dbPath)
	if err != nil {
		log.Fatalf("数据库初始化失败：%v", err)
	}

	// 初始化认证服务
	authService := services.NewAuthService(db, *jwtSecret)

	// 创建 Gin 引擎
	r := gin.Default()

	// 配置 CORS
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// 注册认证路由
	handlers.RegisterAuthRoutes(r.Group("/api"), authService)

	// 创建认证中间件
	authMiddleware := middleware.NewAuthMiddleware(authService)

	// 注册其他业务路由 (需要认证)
	api := r.Group("/api")
	api.Use(authMiddleware.Auth())
	{
		handlers.RegisterCalendarRoutes(api, db)
		handlers.RegisterMessageRoutes(api, db)
		handlers.RegisterPointsRoutes(api, db)
		handlers.RegisterWishlistRoutes(api, db)
		handlers.RegisterDiaryRoutes(api, db)
		handlers.RegisterReminderRoutes(api, db)
		handlers.RegisterRecipeAIRoutes(api, *apiKey, *apiBase)
	}

	// 健康检查 (不需要认证)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Couple Home API is running",
		})
	})

	// 启动服务器
	log.Printf("服务器启动在端口 %s", *port)
	if err := r.Run(":" + *port); err != nil {
		log.Fatalf("服务器启动失败：%v", err)
	}
}

// initDatabase 初始化数据库
func initDatabase(dbPath string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// 自动迁移数据库表
	err = db.AutoMigrate(
		&models.User{},
		&models.RefreshToken{},
		// 添加其他模型...
	)
	if err != nil {
		return nil, err
	}

	return db, nil
}
