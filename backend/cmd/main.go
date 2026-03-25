package main

import (
	"log"

	"couple-home/backend/config"
	"couple-home/backend/internal/handlers"
	"couple-home/backend/internal/repository"
	"couple-home/backend/internal/service"
	"couple-home/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Set Gin mode
	gin.SetMode(cfg.Server.Mode)

	// Initialize database
	db, err := initDatabase(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Auto migrate models
	if err := db.AutoMigrate(
		&models.FridgeItem{},
		&models.Recipe{},
		&models.RecipeIngredient{},
		&models.Bill{},
		&models.CommonFund{},
		&models.FundContribution{},
		&models.UserPreferences{},
		&models.RecipeVote{},
		&models.MealVote{},
		&models.MealOption{},
		&models.UserVote{},
		&models.Chore{},
		&models.ChoreTemplate{},
		&models.UserStats{},
		&models.Schedule{},
		&models.Anniversary{},
		&models.ThemeConfig{},
		&models.WishlistItem{},
		&models.WishlistContribution{},
		&models.Movie{},
		&models.Diary{},
		&models.Reminder{},
		&models.MealWish{},
		&models.MealHistory{},
	); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Initialize repositories
	fridgeRepo := repository.NewFridgeRepository(db)
	recipeRepo := repository.NewRecipeRepository(db)
	billRepo := repository.NewBillRepository(db)
	fundRepo := repository.NewFundRepository(db)
	mealRepo := repository.NewMealRepository(db)
	choreRepo := repository.NewChoreRepository(db)
	scheduleRepo := repository.NewScheduleRepository(db)
	anniversaryRepo := repository.NewAnniversaryRepository(db)
	settingsRepo := repository.NewSettingsRepository(db)

	// Initialize services
	fridgeService := service.NewFridgeService(fridgeRepo)
	recipeService := service.NewRecipeService(recipeRepo)
	billService := service.NewBillService(billRepo, fundRepo)
	fundService := service.NewFundService(fundRepo)
	mealService := service.NewMealService(mealRepo, recipeRepo)
	choreService := service.NewChoreService(choreRepo)
	scheduleService := service.NewScheduleService(scheduleRepo)
	anniversaryService := service.NewAnniversaryService(anniversaryRepo)
	themeService := service.NewThemeService(settingsRepo)

	// Initialize handlers
	fridgeHandler := handlers.NewFridgeHandler(fridgeService)
	recipeHandler := handlers.NewRecipeHandler(recipeService)
	billHandler := handlers.NewBillHandler(billService)
	fundHandler := handlers.NewFundHandler(fundService)
	mealHandler := handlers.NewMealHandler(mealService)
	choreHandler := handlers.NewChoreHandler(choreService)
	scheduleHandler := handlers.NewScheduleHandler(scheduleService)
	anniversaryHandler := handlers.NewAnniversaryHandler(anniversaryService)
	statisticsHandler := handlers.NewStatisticsHandler(db)
	themeHandler := handlers.NewThemeHandler(themeService)

	// Initialize router
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API routes
	api := router.Group("/api")
	{
		// Fridge routes
		fridge := api.Group("/fridge")
		{
			fridge.GET("", fridgeHandler.GetAllItems)
			fridge.GET("/expiring", fridgeHandler.GetExpiringItems)
			fridge.GET("/:id", fridgeHandler.GetItem)
			fridge.POST("", fridgeHandler.AddItem)
			fridge.PUT("/:id", fridgeHandler.UpdateItem)
			fridge.DELETE("/:id", fridgeHandler.DeleteItem)
		}

		// Recipe routes
		recipes := api.Group("/recipes")
		{
			recipes.GET("", recipeHandler.GetAllRecipes)
			recipes.GET("/random", recipeHandler.GetRandomRecipes)
			recipes.GET("/:id", recipeHandler.GetRecipe)
			recipes.POST("/recommend", recipeHandler.RecommendRecipes)
			recipes.POST("/:id/vote", recipeHandler.VoteRecipe)
		}

		// Meal vote routes (legacy, kept for compatibility)
		meals := api.Group("/meals")
		{
			meals.GET("/today", mealHandler.GetTodayVote)
			meals.POST("/today", mealHandler.CreateTodayVote)
			meals.POST("/:id/vote", mealHandler.SubmitVote)
			meals.GET("/:id/votes", mealHandler.GetVoteResult)
			meals.GET("/history", mealHandler.GetHistoricalVotes)
		}

		// Meal wish routes (new - 想吃清单)
		mealWishHandler := handlers.NewMealWishHandler(db)
		meal := api.Group("/meal")
		{
			meal.GET("/wishes", mealWishHandler.GetWishes)
			meal.POST("/wishes", mealWishHandler.AddWish)
			meal.PUT("/wishes/:id", mealWishHandler.UpdateWish)
			meal.DELETE("/wishes/:id", mealWishHandler.DeleteWish)
			meal.POST("/wishes/:id/done", mealWishHandler.MarkDone)
			meal.GET("/recommend", mealWishHandler.GetRecommendation)
			meal.GET("/history", mealWishHandler.GetHistory)
			meal.POST("/history", mealWishHandler.AddHistory)
		}

		// Chore routes
		chores := api.Group("/chores")
		{
			chores.GET("", choreHandler.GetChores)
			chores.POST("", choreHandler.CreateChore)
			chores.POST("/:id/claim", choreHandler.ClaimChore)
			chores.POST("/:id/complete", choreHandler.CompleteChore)
			chores.GET("/stats", choreHandler.GetStats)
			chores.GET("/leaderboard", choreHandler.GetLeaderboard)
			
			// Chore templates
			templates := chores.Group("/templates")
			{
				templates.GET("", choreHandler.GetChoreTemplates)
				templates.POST("", choreHandler.CreateChoreTemplate)
				templates.DELETE("/:id", choreHandler.DeleteChoreTemplate)
			}
		}

		// Bill routes
		bills := api.Group("/bills")
		{
			bills.GET("", billHandler.GetAllBills)
			bills.GET("/:id", billHandler.GetBill)
			bills.GET("/stats", billHandler.GetStats)
			bills.GET("/range", billHandler.GetBillsByDateRange)
			bills.POST("", billHandler.CreateBill)
			bills.PUT("/:id", billHandler.UpdateBill)
			bills.DELETE("/:id", billHandler.DeleteBill)

			// Fund routes
			fund := bills.Group("/fund")
			{
				fund.GET("", fundHandler.GetAllFunds)
				fund.GET("/:id", fundHandler.GetFund)
				fund.GET("/:id/contributions", fundHandler.GetFundContributions)
				fund.POST("", fundHandler.CreateFund)
				fund.PUT("/:id", fundHandler.UpdateFund)
				fund.POST("/contribute", fundHandler.ContributeToFund)
			}
		}

		// Schedule routes
		schedules := api.Group("/schedules")
		{
			schedules.GET("", scheduleHandler.GetSchedules)
			schedules.POST("", scheduleHandler.CreateSchedule)
			schedules.GET("/upcoming", scheduleHandler.GetUpcoming)
			schedules.GET("/:id", scheduleHandler.GetScheduleByID)
			schedules.PUT("/:id", scheduleHandler.UpdateSchedule)
			schedules.DELETE("/:id", scheduleHandler.DeleteSchedule)
			schedules.PATCH("/:id/status", scheduleHandler.UpdateScheduleStatus)
		}

		// Anniversary routes
		anniversaries := api.Group("/anniversaries")
		{
			anniversaries.GET("", anniversaryHandler.GetAnniversaries)
			anniversaries.POST("", anniversaryHandler.CreateAnniversary)
			anniversaries.GET("/upcoming", anniversaryHandler.GetUpcoming)
			anniversaries.GET("/days", anniversaryHandler.GetDaysTogether)
			anniversaries.GET("/:id", anniversaryHandler.GetAnniversaryByID)
			anniversaries.PUT("/:id", anniversaryHandler.UpdateAnniversary)
			anniversaries.DELETE("/:id", anniversaryHandler.DeleteAnniversary)
			anniversaries.GET("/:id/progress", anniversaryHandler.GetAnniversaryProgress)
		}

		// Wishlist routes
		wishlistHandler := handlers.NewWishlistHandler(db)
		wishlist := api.Group("/wishlist")
		{
			wishlist.GET("", wishlistHandler.GetWishlist)
			wishlist.GET("/stats", wishlistHandler.GetWishlistStats)
			wishlist.POST("", wishlistHandler.CreateWishlistItem)
			wishlist.POST("/:id/contribute", wishlistHandler.ContributeToWishlist)
			wishlist.PUT("/:id/complete", wishlistHandler.CompleteWishlistItem)
			wishlist.DELETE("/:id", wishlistHandler.DeleteWishlistItem)
		}

		// Movie routes
		movieHandler := handlers.NewMovieHandler(db)
		movies := api.Group("/movies")
		{
			movies.GET("", movieHandler.GetMovies)
			movies.GET("/stats", movieHandler.GetMovieStats)
			movies.POST("", movieHandler.CreateMovie)
			movies.PUT("/:id/watched", movieHandler.MarkWatched)
			movies.PUT("/:id/rate", movieHandler.RateMovie)
			movies.DELETE("/:id", movieHandler.DeleteMovie)
		}

		// Diary routes
		diaryHandler := handlers.NewDiaryHandler(db)
		diaries := api.Group("/diaries")
		{
			diaries.GET("", diaryHandler.GetDiaries)
			diaries.GET("/month/:month", diaryHandler.GetDiariesByMonth)
			diaries.GET("/:id", diaryHandler.GetDiaryByID)
			diaries.POST("", diaryHandler.CreateDiary)
			diaries.PUT("/:id", diaryHandler.UpdateDiary)
			diaries.DELETE("/:id", diaryHandler.DeleteDiary)
			diaries.POST("/:id/photos", diaryHandler.UploadPhotos)
			diaries.PUT("/:id/privacy", diaryHandler.UpdatePrivacy)
		}

		// Reminder routes
		handlers.RegisterReminderRoutes(api, db)

		// Statistics routes
		statistics := api.Group("/statistics")
		{
			statistics.GET("/overview", statisticsHandler.GetOverview)
			statistics.GET("/spending", statisticsHandler.GetSpendingTrend)
			statistics.GET("/categories", statisticsHandler.GetCategories)
			statistics.GET("/chores", statisticsHandler.GetChoresContribution)
		}

		// Settings routes
		settings := api.Group("/settings")
		{
			// Theme routes
			themes := settings.Group("/theme")
			{
				themes.GET("", themeHandler.GetThemeConfig)
				themes.PUT("", themeHandler.UpdateThemeConfig)
				themes.POST("/reset", themeHandler.ResetThemeConfig)
			}
			settings.GET("/themes", themeHandler.GetAvailableThemes)
		}
	}

	// Seed data if empty
	seedData(db)

	// Start server
	log.Printf("Server starting on port %s", cfg.Server.Port)
	if err := router.Run(":" + cfg.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func initDatabase(cfg *config.Config) (*gorm.DB, error) {
	var db *gorm.DB
	var err error

	if cfg.Database.Driver == "sqlite" {
		db, err = gorm.Open(sqlite.Open(cfg.Database.DSN), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
	} else {
		// PostgreSQL support
		// dsn := "host=" + cfg.Database.Host +
		// 	" user=" + cfg.Database.User +
		// 	" password=" + cfg.Database.Password +
		// 	" dbname=" + cfg.Database.DBName +
		// 	" port=" + cfg.Database.Port +
		// 	" sslmode=disable"
		// db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		log.Println("PostgreSQL support available, configure driver import")
		return nil, err
	}

	if err != nil {
		return nil, err
	}

	return db, nil
}

func seedData(db *gorm.DB) {
	// Check if recipes exist
	var count int64
	db.Model(&models.Recipe{}).Count(&count)
	if count > 0 {
		return
	}

	log.Println("Seeding initial data...")

	// Seed recipes
	recipes := []models.Recipe{
		{
			ID:       "recipe001",
			Name:     "番茄炒蛋",
			Icon:     "🍳",
			CookTime: 15,
			Difficulty: "easy",
			Cost:     15.0,
			Tags:     `["quick","chinese","vegetarian-friendly"]`,
			Ingredients: []models.RecipeIngredient{
				{ID: "ing001", RecipeID: "recipe001", Name: "番茄", Quantity: 3, Unit: "个", Icon: "🍅", Category: "vegetable"},
				{ID: "ing002", RecipeID: "recipe001", Name: "鸡蛋", Quantity: 4, Unit: "个", Icon: "🥚", Category: "egg"},
				{ID: "ing003", RecipeID: "recipe001", Name: "葱", Quantity: 1, Unit: "根", Icon: "🌿", Category: "vegetable"},
			},
		},
		{
			ID:       "recipe002",
			Name:     "红烧肉",
			Icon:     "🥩",
			CookTime: 90,
			Difficulty: "medium",
			Cost:     45.0,
			Tags:     `["chinese","meat","comfort-food"]`,
			Ingredients: []models.RecipeIngredient{
				{ID: "ing004", RecipeID: "recipe002", Name: "五花肉", Quantity: 500, Unit: "克", Icon: "🥩", Category: "meat"},
				{ID: "ing005", RecipeID: "recipe002", Name: "冰糖", Quantity: 50, Unit: "克", Icon: "🍬", Category: "condiment"},
				{ID: "ing006", RecipeID: "recipe002", Name: "生姜", Quantity: 3, Unit: "片", Icon: "🫚", Category: "condiment"},
			},
		},
		{
			ID:       "recipe003",
			Name:     "清蒸鱼",
			Icon:     "🐟",
			CookTime: 30,
			Difficulty: "medium",
			Cost:     35.0,
			Tags:     `["chinese","seafood","healthy"]`,
			Ingredients: []models.RecipeIngredient{
				{ID: "ing007", RecipeID: "recipe003", Name: "鲈鱼", Quantity: 1, Unit: "条", Icon: "🐟", Category: "seafood"},
				{ID: "ing008", RecipeID: "recipe003", Name: "葱", Quantity: 2, Unit: "根", Icon: "🌿", Category: "vegetable"},
				{ID: "ing009", RecipeID: "recipe003", Name: "生姜", Quantity: 5, Unit: "片", Icon: "🫚", Category: "condiment"},
			},
		},
		{
			ID:       "recipe004",
			Name:     "麻婆豆腐",
			Icon:     "🌶️",
			CookTime: 25,
			Difficulty: "easy",
			Cost:     20.0,
			Tags:     `["spicy","chinese","vegetarian-friendly","quick"]`,
			Ingredients: []models.RecipeIngredient{
				{ID: "ing010", RecipeID: "recipe004", Name: "豆腐", Quantity: 1, Unit: "块", Icon: "🧊", Category: "staple"},
				{ID: "ing011", RecipeID: "recipe004", Name: "豆瓣酱", Quantity: 2, Unit: "勺", Icon: "🌶️", Category: "condiment"},
				{ID: "ing012", RecipeID: "recipe004", Name: "花椒", Quantity: 1, Unit: "勺", Icon: "🌶️", Category: "condiment"},
			},
		},
		{
			ID:       "recipe005",
			Name:     "炒饭",
			Icon:     "🍚",
			CookTime: 20,
			Difficulty: "easy",
			Cost:     18.0,
			Tags:     `["quick","chinese","staple","leftover-friendly"]`,
			Ingredients: []models.RecipeIngredient{
				{ID: "ing013", RecipeID: "recipe005", Name: "米饭", Quantity: 2, Unit: "碗", Icon: "🍚", Category: "staple"},
				{ID: "ing014", RecipeID: "recipe005", Name: "鸡蛋", Quantity: 2, Unit: "个", Icon: "🥚", Category: "egg"},
				{ID: "ing015", RecipeID: "recipe005", Name: "火腿", Quantity: 100, Unit: "克", Icon: "🥓", Category: "meat"},
			},
		},
	}

	for _, recipe := range recipes {
		db.Create(&recipe)
	}

	// Seed initial fund
	fund := models.CommonFund{
		ID:            "fund001",
		Name:          "家庭旅行基金",
		TargetAmount:  10000.0,
		CurrentAmount: 0.0,
		MonthlyGoal:   1000.0,
	}
	db.Create(&fund)

	log.Println("Seed data completed")
}
