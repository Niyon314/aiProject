package service

import (
	"context"
	"testing"
	"time"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/repository"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// setupTestDB - 创建测试数据库
func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open test database: %v", err)
	}

	// Auto migrate all models
	err = db.AutoMigrate(
		&models.MealVote{},
		&models.MealOption{},
		&models.UserVote{},
		&models.Recipe{},
		&models.RecipeIngredient{},
	)
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	return db
}

// setupTestData - 准备测试数据
func setupTestData(db *gorm.DB) error {
	// 创建测试菜谱
	recipes := []models.Recipe{
		{
			ID:         "recipe001",
			Name:       "番茄炒蛋",
			Icon:       "🍳",
			CookTime:   15,
			Difficulty: "easy",
			Cost:       15.0,
			Tags:       `["quick","chinese","vegetarian-friendly"]`,
			Ingredients: []models.RecipeIngredient{
				{ID: "ing001", RecipeID: "recipe001", Name: "番茄", Quantity: 3, Unit: "个", Icon: "🍅", Category: "vegetable"},
				{ID: "ing002", RecipeID: "recipe001", Name: "鸡蛋", Quantity: 4, Unit: "个", Icon: "🥚", Category: "egg"},
			},
		},
		{
			ID:         "recipe002",
			Name:       "红烧肉",
			Icon:       "🥩",
			CookTime:   90,
			Difficulty: "medium",
			Cost:       45.0,
			Tags:       `["chinese","meat","comfort-food"]`,
			Ingredients: []models.RecipeIngredient{
				{ID: "ing003", RecipeID: "recipe002", Name: "五花肉", Quantity: 500, Unit: "克", Icon: "🥩", Category: "meat"},
			},
		},
		{
			ID:         "recipe003",
			Name:       "清蒸鱼",
			Icon:       "🐟",
			CookTime:   30,
			Difficulty: "medium",
			Cost:       35.0,
			Tags:       `["chinese","seafood","healthy"]`,
			Ingredients: []models.RecipeIngredient{
				{ID: "ing004", RecipeID: "recipe003", Name: "鲈鱼", Quantity: 1, Unit: "条", Icon: "🐟", Category: "seafood"},
			},
		},
		{
			ID:         "recipe004",
			Name:       "麻婆豆腐",
			Icon:       "🌶️",
			CookTime:   25,
			Difficulty: "easy",
			Cost:       20.0,
			Tags:       `["spicy","chinese","vegetarian-friendly","quick"]`,
			Ingredients: []models.RecipeIngredient{
				{ID: "ing005", RecipeID: "recipe004", Name: "豆腐", Quantity: 1, Unit: "块", Icon: "🧊", Category: "staple"},
			},
		},
		{
			ID:         "recipe005",
			Name:       "炒饭",
			Icon:       "🍚",
			CookTime:   20,
			Difficulty: "easy",
			Cost:       18.0,
			Tags:       `["quick","chinese","staple","leftover-friendly"]`,
			Ingredients: []models.RecipeIngredient{
				{ID: "ing006", RecipeID: "recipe005", Name: "米饭", Quantity: 2, Unit: "碗", Icon: "🍚", Category: "staple"},
			},
		},
	}

	for _, recipe := range recipes {
		if err := db.Create(&recipe).Error; err != nil {
			return err
		}
	}

	return nil
}

// TestMealService_CreateTodayVote - 测试创建今日投票
func TestMealService_CreateTodayVote(t *testing.T) {
	db := setupTestDB(t)
	err := setupTestData(db)
	assert.NoError(t, err)

	mealRepo := repository.NewMealRepository(db)
	recipeRepo := repository.NewRecipeRepository(db)
	service := NewMealService(mealRepo, recipeRepo)

	ctx := context.Background()
	today := time.Now().Format("2006-01-02")

	t.Run("成功创建午餐投票", func(t *testing.T) {
		vote, err := service.CreateTodayVote(ctx, today, "lunch", 3)
		
		assert.NoError(t, err)
		assert.NotNil(t, vote)
		assert.Equal(t, today, vote.Date)
		assert.Equal(t, "lunch", vote.MealType)
		assert.Equal(t, "pending", vote.Status)
		assert.GreaterOrEqual(t, len(vote.Options), 3)
		assert.LessOrEqual(t, len(vote.Options), 5)
	})

	t.Run("成功创建晚餐投票", func(t *testing.T) {
		vote, err := service.CreateTodayVote(ctx, today, "dinner", 4)
		
		assert.NoError(t, err)
		assert.NotNil(t, vote)
		assert.Equal(t, "dinner", vote.MealType)
		assert.GreaterOrEqual(t, len(vote.Options), 3)
	})

	t.Run("无效的餐食类型", func(t *testing.T) {
		_, err := service.CreateTodayVote(ctx, today, "breakfast", 3)
		
		assert.Error(t, err)
		assert.Equal(t, ErrInvalidMealType, err)
	})

	t.Run("选项数量自动调整", func(t *testing.T) {
		// 小于 3 应该调整为 3
		vote, err := service.CreateTodayVote(ctx, "2026-03-24", "lunch", 1)
		assert.NoError(t, err)
		assert.GreaterOrEqual(t, len(vote.Options), 3)

		// 大于 5 应该调整为 5
		vote2, err := service.CreateTodayVote(ctx, "2026-03-25", "lunch", 10)
		assert.NoError(t, err)
		assert.LessOrEqual(t, len(vote2.Options), 5)
	})

	t.Run("重复创建返回已有投票", func(t *testing.T) {
		vote1, err := service.CreateTodayVote(ctx, today, "lunch", 3)
		assert.NoError(t, err)

		vote2, err := service.CreateTodayVote(ctx, today, "lunch", 4)
		assert.NoError(t, err)

		assert.Equal(t, vote1.ID, vote2.ID)
	})
}

// TestMealService_SubmitVote - 测试提交投票
func TestMealService_SubmitVote(t *testing.T) {
	db := setupTestDB(t)
	err := setupTestData(db)
	assert.NoError(t, err)

	mealRepo := repository.NewMealRepository(db)
	recipeRepo := repository.NewRecipeRepository(db)
	service := NewMealService(mealRepo, recipeRepo)

	ctx := context.Background()
	today := time.Now().Format("2006-01-02")

	// 创建投票
	vote, err := service.CreateTodayVote(ctx, today, "lunch", 3)
	assert.NoError(t, err)
	assert.NotNil(t, vote)

	t.Run("用户成功投票-like", func(t *testing.T) {
		optionID := vote.Options[0].ID
		
		result, err := service.SubmitVote(ctx, vote.ID, "user", optionID, "like")
		
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, "voted", result.Status)
		assert.NotNil(t, result.UserVote)
		assert.Equal(t, optionID, result.UserVote.OptionID)
		assert.Equal(t, "like", result.UserVote.VoteType)
	})

	t.Run("伴侣成功投票-like-匹配成功", func(t *testing.T) {
		// 获取最新的投票状态
		vote, _ = service.GetVoteResult(ctx, vote.ID)
		optionID := vote.Options[0].ID
		
		result, err := service.SubmitVote(ctx, vote.ID, "partner", optionID, "like")
		
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, "completed", result.Status)
		assert.NotNil(t, result.Result)
		assert.Equal(t, optionID, result.Result.ID)
	})

	t.Run("无效的投票类型", func(t *testing.T) {
		vote2, _ := service.CreateTodayVote(ctx, "2026-03-24", "dinner", 3)
		
		_, err := service.SubmitVote(ctx, vote2.ID, "user", vote2.Options[0].ID, "invalid")
		
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "invalid vote type")
	})

	t.Run("不存在的投票", func(t *testing.T) {
		_, err := service.SubmitVote(ctx, "non-existent-id", "user", "option1", "like")
		
		assert.Error(t, err)
		assert.Equal(t, ErrVoteNotFound, err)
	})
}

// TestMealService_CalculateMatch - 测试匹配算法
func TestMealService_CalculateMatch(t *testing.T) {
	db := setupTestDB(t)
	err := setupTestData(db)
	assert.NoError(t, err)

	mealRepo := repository.NewMealRepository(db)
	recipeRepo := repository.NewRecipeRepository(db)
	service := NewMealService(mealRepo, recipeRepo)

	ctx := context.Background()

	t.Run("双方 Like 同一选项-完美匹配", func(t *testing.T) {
		today := time.Now().Format("2006-01-02")
		vote, _ := service.CreateTodayVote(ctx, today, "lunch", 3)
		
		// 双方都 Like 第一个选项
		service.SubmitVote(ctx, vote.ID, "user", vote.Options[0].ID, "like")
		result, _ := service.SubmitVote(ctx, vote.ID, "partner", vote.Options[0].ID, "like")
		
		assert.Equal(t, "completed", result.Status)
		assert.NotNil(t, result.Result)
		assert.Equal(t, vote.Options[0].ID, result.Result.ID)
	})

	t.Run("一方 Like 一方 Dislike-无匹配", func(t *testing.T) {
		vote, _ := service.CreateTodayVote(ctx, "2026-03-25", "dinner", 3)
		
		// 用户 Like 第一个，伴侣 Dislike 第一个
		service.SubmitVote(ctx, vote.ID, "user", vote.Options[0].ID, "like")
		result, _ := service.SubmitVote(ctx, vote.ID, "partner", vote.Options[0].ID, "dislike")
		
		// 应该没有完美匹配
		assert.Equal(t, "voted", result.Status)
	})

	t.Run("一方 Veto-选项淘汰", func(t *testing.T) {
		vote, _ := service.CreateTodayVote(ctx, "2026-03-26", "lunch", 3)
		
		// 用户 Veto 第一个选项
		service.SubmitVote(ctx, vote.ID, "user", vote.Options[0].ID, "veto")
		result, _ := service.SubmitVote(ctx, vote.ID, "partner", vote.Options[0].ID, "like")
		
		// Veto 的选项不应该被选中
		if result.Result != nil {
			assert.NotEqual(t, vote.Options[0].ID, result.Result.ID)
		}
	})
}

// TestMealService_GetTodayVote - 测试获取今日投票
func TestMealService_GetTodayVote(t *testing.T) {
	db := setupTestDB(t)
	err := setupTestData(db)
	assert.NoError(t, err)

	mealRepo := repository.NewMealRepository(db)
	recipeRepo := repository.NewRecipeRepository(db)
	service := NewMealService(mealRepo, recipeRepo)

	ctx := context.Background()
	today := time.Now().Format("2006-01-02")

	t.Run("获取已创建的投票", func(t *testing.T) {
		// 先创建投票
		createdVote, _ := service.CreateTodayVote(ctx, today, "lunch", 3)
		
		// 获取投票
		vote, err := service.GetTodayVote(ctx, today, "lunch")
		
		assert.NoError(t, err)
		assert.NotNil(t, vote)
		assert.Equal(t, createdVote.ID, vote.ID)
	})

	t.Run("获取不存在的投票", func(t *testing.T) {
		_, err := service.GetTodayVote(ctx, "2099-01-01", "lunch")
		
		assert.Error(t, err)
		assert.Equal(t, ErrVoteNotFound, err)
	})

	t.Run("无效的餐食类型", func(t *testing.T) {
		_, err := service.GetTodayVote(ctx, today, "breakfast")
		
		assert.Error(t, err)
		assert.Equal(t, ErrInvalidMealType, err)
	})
}

// TestIsValidMealType - 测试餐食类型验证
func TestIsValidMealType(t *testing.T) {
	tests := []struct {
		mealType string
		expected bool
	}{
		{"lunch", true},
		{"dinner", true},
		{"breakfast", false},
		{"snack", false},
		{"", false},
		{"Lunch", false}, // 大小写敏感
	}

	for _, tt := range tests {
		t.Run(tt.mealType, func(t *testing.T) {
			result := isValidMealType(tt.mealType)
			assert.Equal(t, tt.expected, result)
		})
	}
}

// TestIsValidVoteType - 测试投票类型验证
func TestIsValidVoteType(t *testing.T) {
	tests := []struct {
		voteType string
		expected bool
	}{
		{"like", true},
		{"dislike", true},
		{"veto", true},
		{"neutral", false},
		{"", false},
		{"Like", false}, // 大小写敏感
	}

	for _, tt := range tests {
		t.Run(tt.voteType, func(t *testing.T) {
			result := isValidVoteType(tt.voteType)
			assert.Equal(t, tt.expected, result)
		})
	}
}

// TestGetMealTagsAsArray - 测试标签解析
func TestGetMealTagsAsArray(t *testing.T) {
	t.Run("正常解析", func(t *testing.T) {
		tagsStr := `["chinese","quick","vegetarian"]`
		tags := GetMealTagsAsArray(tagsStr)
		
		assert.Len(t, tags, 3)
		assert.Contains(t, tags, "chinese")
		assert.Contains(t, tags, "quick")
		assert.Contains(t, tags, "vegetarian")
	})

	t.Run("空字符串", func(t *testing.T) {
		tags := GetMealTagsAsArray("")
		assert.Empty(t, tags)
	})

	t.Run("空数组", func(t *testing.T) {
		tags := GetMealTagsAsArray("[]")
		assert.Empty(t, tags)
	})
}

// TestMealService_GetVoteResult - 测试获取投票结果
func TestMealService_GetVoteResult(t *testing.T) {
	db := setupTestDB(t)
	err := setupTestData(db)
	assert.NoError(t, err)

	mealRepo := repository.NewMealRepository(db)
	recipeRepo := repository.NewRecipeRepository(db)
	service := NewMealService(mealRepo, recipeRepo)

	ctx := context.Background()
	today := time.Now().Format("2006-01-02")

	t.Run("获取投票详情", func(t *testing.T) {
		vote, _ := service.CreateTodayVote(ctx, today, "dinner", 3)
		
		result, err := service.GetVoteResult(ctx, vote.ID)
		
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, vote.ID, result.ID)
		assert.GreaterOrEqual(t, len(result.Options), 3)
	})

	t.Run("获取不存在的投票", func(t *testing.T) {
		_, err := service.GetVoteResult(ctx, "non-existent-id")
		
		assert.Error(t, err)
	})
}

// TestMealService_CompleteVotingFlow - 测试完整投票流程
func TestMealService_CompleteVotingFlow(t *testing.T) {
	db := setupTestDB(t)
	err := setupTestData(db)
	assert.NoError(t, err)

	mealRepo := repository.NewMealRepository(db)
	recipeRepo := repository.NewRecipeRepository(db)
	service := NewMealService(mealRepo, recipeRepo)

	ctx := context.Background()
	today := time.Now().Format("2006-01-02")

	t.Run("完整投票流程-匹配成功", func(t *testing.T) {
		// 1. 创建投票
		vote, err := service.CreateTodayVote(ctx, today, "lunch", 3)
		assert.NoError(t, err)
		assert.Equal(t, "pending", vote.Status)

		// 2. 用户投票
		votedVote, err := service.SubmitVote(ctx, vote.ID, "user", vote.Options[0].ID, "like")
		assert.NoError(t, err)
		assert.Equal(t, "voted", votedVote.Status)
		assert.NotNil(t, votedVote.UserVote)

		// 3. 伴侣投票（同一选项）
		finalVote, err := service.SubmitVote(ctx, vote.ID, "partner", vote.Options[0].ID, "like")
		assert.NoError(t, err)
		assert.Equal(t, "completed", finalVote.Status)
		assert.NotNil(t, finalVote.Result)
		assert.Equal(t, vote.Options[0].ID, finalVote.Result.ID)
	})

	t.Run("完整投票流程-不同选项 Like", func(t *testing.T) {
		vote, _ := service.CreateTodayVote(ctx, "2026-03-27", "dinner", 3)

		// 用户 Like 第一个选项
		service.SubmitVote(ctx, vote.ID, "user", vote.Options[0].ID, "like")
		
		// 伴侣 Like 第二个选项
		finalVote, _ := service.SubmitVote(ctx, vote.ID, "partner", vote.Options[1].ID, "like")
		
		// 应该没有完美匹配，但可能有推荐
		assert.Contains(t, []string{"voted", "completed"}, finalVote.Status)
	})
}
