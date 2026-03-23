package repository

import (
	"context"
	"testing"

	"couple-home/backend/internal/models"
	"couple-home/backend/pkg/utils"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// setupTestMealDB - 创建测试数据库
func setupTestMealDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open test database: %v", err)
	}

	// Auto migrate models
	err = db.AutoMigrate(
		&models.MealVote{},
		&models.MealOption{},
		&models.UserVote{},
	)
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	return db
}

// TestMealRepository_GetTodayVote - 测试获取今日投票
func TestMealRepository_GetTodayVote(t *testing.T) {
	db := setupTestMealDB(t)
	repo := NewMealRepository(db)
	ctx := context.Background()

	t.Run("获取存在的投票", func(t *testing.T) {
		// 创建测试数据
		vote := &models.MealVote{
			ID:       utils.GenerateID(),
			Date:     "2026-03-23",
			MealType: "lunch",
			Status:   "pending",
			Options: []models.MealOption{
				{
					ID:         utils.GenerateID(),
					RecipeID:   "recipe001",
					Name:       "番茄炒蛋",
					Icon:       "🍳",
					CookTime:   15,
					Difficulty: "easy",
					Cost:       15.0,
				},
			},
		}
		err := db.Create(vote).Error
		assert.NoError(t, err)

		// 获取投票
		result, err := repo.GetTodayVote(ctx, "2026-03-23", "lunch")
		
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, vote.ID, result.ID)
		assert.Len(t, result.Options, 1)
	})

	t.Run("获取不存在的投票", func(t *testing.T) {
		result, err := repo.GetTodayVote(ctx, "2099-01-01", "lunch")
		
		assert.Error(t, err)
		assert.Nil(t, result)
	})
}

// TestMealRepository_CreateVote - 测试创建投票
func TestMealRepository_CreateVote(t *testing.T) {
	db := setupTestMealDB(t)
	repo := NewMealRepository(db)
	ctx := context.Background()

	t.Run("成功创建投票", func(t *testing.T) {
		vote := &models.MealVote{
			ID:       utils.GenerateID(),
			Date:     "2026-03-23",
			MealType: "dinner",
			Status:   "pending",
			Options: []models.MealOption{
				{
					ID:         utils.GenerateID(),
					RecipeID:   "recipe001",
					Name:       "红烧肉",
					Icon:       "🥩",
					CookTime:   90,
					Difficulty: "medium",
					Cost:       45.0,
				},
				{
					ID:         utils.GenerateID(),
					RecipeID:   "recipe002",
					Name:       "清蒸鱼",
					Icon:       "🐟",
					CookTime:   30,
					Difficulty: "medium",
					Cost:       35.0,
				},
			},
		}

		err := repo.CreateVote(ctx, vote)
		
		assert.NoError(t, err)
		assert.NotEmpty(t, vote.ID)
		
		// 验证数据库中有数据
		var count int64
		db.Model(&models.MealVote{}).Count(&count)
		assert.Equal(t, int64(1), count)
		
		var optionCount int64
		db.Model(&models.MealOption{}).Count(&optionCount)
		assert.Equal(t, int64(2), optionCount)
	})
}

// TestMealRepository_SubmitVote - 测试提交投票
func TestMealRepository_SubmitVote(t *testing.T) {
	db := setupTestMealDB(t)
	repo := NewMealRepository(db)
	ctx := context.Background()

	// 创建测试投票
	vote := &models.MealVote{
		ID:       utils.GenerateID(),
		Date:     "2026-03-23",
		MealType: "lunch",
		Status:   "pending",
		Options: []models.MealOption{
			{
				ID:         utils.GenerateID(),
				RecipeID:   "recipe001",
				Name:       "番茄炒蛋",
				Icon:       "🍳",
				CookTime:   15,
				Difficulty: "easy",
				Cost:       15.0,
			},
		},
	}
	err := db.Create(vote).Error
	assert.NoError(t, err)

	t.Run("首次投票-创建", func(t *testing.T) {
		userVote := &models.UserVote{
			ID:       utils.GenerateID(),
			VoteID:   vote.ID,
			Voter:    "user",
			OptionID: vote.Options[0].ID,
			VoteType: "like",
		}

		err := repo.SubmitVote(ctx, userVote)
		
		assert.NoError(t, err)
		
		// 验证投票已保存
		var savedVote models.UserVote
		err = db.Where("vote_id = ? AND voter = ?", vote.ID, "user").First(&savedVote).Error
		assert.NoError(t, err)
		assert.Equal(t, "like", savedVote.VoteType)
	})

	t.Run("重复投票-更新", func(t *testing.T) {
		userVote := &models.UserVote{
			ID:       utils.GenerateID(),
			VoteID:   vote.ID,
			Voter:    "user",
			OptionID: vote.Options[0].ID,
			VoteType: "dislike", // 改为 dislike
		}

		err := repo.SubmitVote(ctx, userVote)
		
		assert.NoError(t, err)
		
		// 验证投票已更新
		var savedVote models.UserVote
		err = db.Where("vote_id = ? AND voter = ?", vote.ID, "user").First(&savedVote).Error
		assert.NoError(t, err)
		assert.Equal(t, "dislike", savedVote.VoteType)
	})
}

// TestMealRepository_GetVoteResult - 测试获取投票结果
func TestMealRepository_GetVoteResult(t *testing.T) {
	db := setupTestMealDB(t)
	repo := NewMealRepository(db)
	ctx := context.Background()

	// 创建测试数据
	voteID := utils.GenerateID()
	optionID := utils.GenerateID()
	userVoteID := utils.GenerateID()
	partnerVoteID := utils.GenerateID()
	
	vote := &models.MealVote{
		ID:       voteID,
		Date:     "2026-03-23",
		MealType: "dinner",
		Status:   "completed",
		Options: []models.MealOption{
			{
				ID:         optionID,
				RecipeID:   "recipe001",
				Name:       "番茄炒蛋",
				Icon:       "🍳",
				CookTime:   15,
				Difficulty: "easy",
				Cost:       15.0,
			},
		},
		UserVote: &models.UserVote{
			ID:       userVoteID,
			VoteID:   voteID,
			Voter:    "user",
			OptionID: optionID,
			VoteType: "like",
		},
		PartnerVote: &models.UserVote{
			ID:       partnerVoteID,
			VoteID:   voteID,
			Voter:    "partner",
			OptionID: optionID,
			VoteType: "like",
		},
	}
	
	err := db.Create(vote).Error
	assert.NoError(t, err)

	t.Run("获取完整投票结果", func(t *testing.T) {
		result, err := repo.GetVoteResult(ctx, vote.ID)
		
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, vote.ID, result.ID)
		assert.Len(t, result.Options, 1)
	})

	t.Run("获取不存在的投票", func(t *testing.T) {
		result, err := repo.GetVoteResult(ctx, "non-existent-id")
		
		assert.Error(t, err)
		assert.Nil(t, result)
	})
}

// TestMealRepository_UpdateVoteStatus - 测试更新投票状态
func TestMealRepository_UpdateVoteStatus(t *testing.T) {
	db := setupTestMealDB(t)
	repo := NewMealRepository(db)
	ctx := context.Background()

	vote := &models.MealVote{
		ID:       utils.GenerateID(),
		Date:     "2026-03-23",
		MealType: "lunch",
		Status:   "pending",
	}
	err := db.Create(vote).Error
	assert.NoError(t, err)

	t.Run("更新状态为 voted", func(t *testing.T) {
		err := repo.UpdateVoteStatus(ctx, vote.ID, "voted")
		
		assert.NoError(t, err)
		
		var updated models.MealVote
		db.First(&updated, vote.ID)
		assert.Equal(t, "voted", updated.Status)
	})

	t.Run("更新状态为 completed", func(t *testing.T) {
		err := repo.UpdateVoteStatus(ctx, vote.ID, "completed")
		
		assert.NoError(t, err)
		
		var updated models.MealVote
		db.First(&updated, vote.ID)
		assert.Equal(t, "completed", updated.Status)
	})
}

// TestMealRepository_SetVoteResult - 测试设置投票结果
func TestMealRepository_SetVoteResult(t *testing.T) {
	db := setupTestMealDB(t)
	repo := NewMealRepository(db)
	ctx := context.Background()

	option := models.MealOption{
		ID:         utils.GenerateID(),
		RecipeID:   "recipe001",
		Name:       "番茄炒蛋",
		Icon:       "🍳",
		CookTime:   15,
		Difficulty: "easy",
		Cost:       15.0,
	}
	
	vote := &models.MealVote{
		ID:       utils.GenerateID(),
		Date:     "2026-03-23",
		MealType: "lunch",
		Status:   "completed",
		Options:  []models.MealOption{option},
	}
	err := db.Create(vote).Error
	assert.NoError(t, err)

	t.Run("设置投票结果", func(t *testing.T) {
		err := repo.SetVoteResult(ctx, vote.ID, option.ID)
		
		assert.NoError(t, err)
		
		var updated models.MealVote
		db.Preload("Result").First(&updated, vote.ID)
		assert.NotNil(t, updated.ResultID)
		assert.Equal(t, option.ID, *updated.ResultID)
	})
}

// TestMealRepository_UpdateOptionCounts - 测试更新选项计数
func TestMealRepository_UpdateOptionCounts(t *testing.T) {
	db := setupTestMealDB(t)
	repo := NewMealRepository(db)
	ctx := context.Background()

	option := models.MealOption{
		ID:           utils.GenerateID(),
		RecipeID:     "recipe001",
		Name:         "番茄炒蛋",
		Icon:         "🍳",
		CookTime:     15,
		Difficulty:   "easy",
		Cost:         15.0,
		LikeCount:    0,
		DislikeCount: 0,
		VetoCount:    0,
	}
	err := db.Create(&option).Error
	assert.NoError(t, err)

	t.Run("更新计数", func(t *testing.T) {
		err := repo.UpdateOptionCounts(ctx, option.ID, 2, 1, 0)
		
		assert.NoError(t, err)
		
		var updated models.MealOption
		db.First(&updated, option.ID)
		assert.Equal(t, 2, updated.LikeCount)
		assert.Equal(t, 1, updated.DislikeCount)
		assert.Equal(t, 0, updated.VetoCount)
	})
}

// TestMealRepository_GetVoteByID - 测试根据 ID 获取投票
func TestMealRepository_GetVoteByID(t *testing.T) {
	db := setupTestMealDB(t)
	repo := NewMealRepository(db)
	ctx := context.Background()

	vote := &models.MealVote{
		ID:       utils.GenerateID(),
		Date:     "2026-03-23",
		MealType: "lunch",
		Status:   "pending",
		Options: []models.MealOption{
			{
				ID:         utils.GenerateID(),
				RecipeID:   "recipe001",
				Name:       "番茄炒蛋",
				Icon:       "🍳",
				CookTime:   15,
				Difficulty: "easy",
				Cost:       15.0,
			},
		},
	}
	err := db.Create(vote).Error
	assert.NoError(t, err)

	t.Run("获取存在的投票", func(t *testing.T) {
		result, err := repo.GetVoteByID(ctx, vote.ID)
		
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, vote.ID, result.ID)
	})

	t.Run("获取不存在的投票", func(t *testing.T) {
		result, err := repo.GetVoteByID(ctx, "non-existent-id")
		
		assert.Error(t, err)
		assert.Nil(t, result)
	})
}

// TestMealRepository_GetHistoricalVotes - 测试获取历史投票
func TestMealRepository_GetHistoricalVotes(t *testing.T) {
	db := setupTestMealDB(t)
	repo := NewMealRepository(db)
	ctx := context.Background()

	// 创建多个历史投票
	votes := []models.MealVote{
		{ID: utils.GenerateID(), Date: "2026-03-20", MealType: "lunch", Status: "completed"},
		{ID: utils.GenerateID(), Date: "2026-03-21", MealType: "dinner", Status: "completed"},
		{ID: utils.GenerateID(), Date: "2026-03-22", MealType: "lunch", Status: "completed"},
		{ID: utils.GenerateID(), Date: "2026-03-23", MealType: "lunch", Status: "pending"}, // 未完成的
	}
	
	for i := range votes {
		db.Create(&votes[i])
	}

	t.Run("获取历史投票", func(t *testing.T) {
		results, err := repo.GetHistoricalVotes(ctx, 10)
		
		assert.NoError(t, err)
		// 应该只返回 completed 状态的投票
		assert.GreaterOrEqual(t, len(results), 3)
		assert.LessOrEqual(t, len(results), 3)
		
		// 验证按日期降序排列
		for i := 0; i < len(results)-1; i++ {
			assert.GreaterOrEqual(t, results[i].Date, results[i+1].Date)
		}
	})

	t.Run("限制返回数量", func(t *testing.T) {
		results, err := repo.GetHistoricalVotes(ctx, 2)
		
		assert.NoError(t, err)
		assert.LessOrEqual(t, len(results), 2)
	})
}

// TestMealRepository_DeleteTodayVote - 测试删除今日投票
func TestMealRepository_DeleteTodayVote(t *testing.T) {
	db := setupTestMealDB(t)
	repo := NewMealRepository(db)
	ctx := context.Background()

	vote := &models.MealVote{
		ID:       utils.GenerateID(),
		Date:     "2026-03-23",
		MealType: "lunch",
		Status:   "pending",
	}
	err := db.Create(vote).Error
	assert.NoError(t, err)

	t.Run("删除今日投票", func(t *testing.T) {
		err := repo.DeleteTodayVote(ctx, "2026-03-23", "lunch")
		
		assert.NoError(t, err)
		
		var count int64
		db.Model(&models.MealVote{}).Where("date = ? AND meal_type = ?", "2026-03-23", "lunch").Count(&count)
		assert.Equal(t, int64(0), count)
	})

	t.Run("删除不存在的投票", func(t *testing.T) {
		err := repo.DeleteTodayVote(ctx, "2099-01-01", "lunch")
		
		assert.NoError(t, err) // GORM 删除不存在的数据不会报错
	})
}

// TestMealRepository_ConcurrentVoting - 测试并发投票场景
func TestMealRepository_ConcurrentVoting(t *testing.T) {
	db := setupTestMealDB(t)
	repo := NewMealRepository(db)
	ctx := context.Background()

	vote := &models.MealVote{
		ID:       utils.GenerateID(),
		Date:     "2026-03-23",
		MealType: "lunch",
		Status:   "pending",
		Options: []models.MealOption{
			{
				ID:         utils.GenerateID(),
				RecipeID:   "recipe001",
				Name:       "番茄炒蛋",
				Icon:       "🍳",
				CookTime:   15,
				Difficulty: "easy",
				Cost:       15.0,
			},
		},
	}
	err := db.Create(vote).Error
	assert.NoError(t, err)

	t.Run("双方同时投票", func(t *testing.T) {
		done := make(chan bool, 2)
		
		// 用户投票
		go func() {
			userVote := &models.UserVote{
				ID:       utils.GenerateID(),
				VoteID:   vote.ID,
				Voter:    "user",
				OptionID: vote.Options[0].ID,
				VoteType: "like",
			}
			err := repo.SubmitVote(ctx, userVote)
			assert.NoError(t, err)
			done <- true
		}()
		
		// 伴侣投票
		go func() {
			partnerVote := &models.UserVote{
				ID:       utils.GenerateID(),
				VoteID:   vote.ID,
				Voter:    "partner",
				OptionID: vote.Options[0].ID,
				VoteType: "like",
			}
			err := repo.SubmitVote(ctx, partnerVote)
			assert.NoError(t, err)
			done <- true
		}()
		
		// 等待两个投票完成
		<-done
		<-done
		
		// 验证双方投票都已保存
		var count int64
		db.Model(&models.UserVote{}).Where("vote_id = ?", vote.ID).Count(&count)
		assert.Equal(t, int64(2), count)
	})
}
