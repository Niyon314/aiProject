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

// setupTestChoreDB - 创建测试数据库
func setupTestChoreDB() (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// 自动迁移
	err = db.AutoMigrate(
		&models.Chore{},
		&models.ChoreTemplate{},
		&models.UserStats{},
	)
	if err != nil {
		return nil, err
	}

	return db, nil
}

// setupTestChoreService - 创建测试服务
func setupTestChoreService() (*ChoreService, *gorm.DB, error) {
	db, err := setupTestChoreDB()
	if err != nil {
		return nil, nil, err
	}

	repo := repository.NewChoreRepository(db)
	service := NewChoreService(repo)

	return service, db, nil
}

// TestCreateChore - 测试创建任务
func TestCreateChore(t *testing.T) {
	service, _, err := setupTestChoreService()
	assert.NoError(t, err)

	ctx := context.Background()

	// 测试正常创建
	chore := &models.Chore{
		Name:     "洗碗",
		Icon:     "🍽️",
		Type:     models.ChoreTypeDaily,
		Points:   10,
		DueDate:  time.Now().Add(24 * time.Hour),
		Assignee: models.AssigneeNone,
		Status:   models.ChoreStatusPending,
	}

	err = service.CreateChore(ctx, chore)
	assert.NoError(t, err)
	assert.NotEmpty(t, chore.ID)
	assert.Equal(t, models.ChoreStatusPending, chore.Status)

	// 测试无效类型
	invalidChore := &models.Chore{
		Name:    "测试",
		Type:    "invalid",
		Points:  10,
		DueDate: time.Now(),
	}
	err = service.CreateChore(ctx, invalidChore)
	assert.Equal(t, ErrInvalidChoreType, err)

	// 测试无效积分
	invalidPointsChore := &models.Chore{
		Name:    "测试",
		Type:    models.ChoreTypeDaily,
		Points:  0,
		DueDate: time.Now(),
	}
	err = service.CreateChore(ctx, invalidPointsChore)
	assert.Equal(t, ErrInvalidPoints, err)
}

// TestClaimChore - 测试认领任务
func TestClaimChore(t *testing.T) {
	service, _, err := setupTestChoreService()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建任务
	chore := &models.Chore{
		Name:     "拖地",
		Icon:     "🧹",
		Type:     models.ChoreTypeWeekly,
		Points:   30,
		DueDate:  time.Now().Add(7 * 24 * time.Hour),
		Assignee: models.AssigneeNone,
		Status:   models.ChoreStatusPending,
	}
	err = service.CreateChore(ctx, chore)
	assert.NoError(t, err)

	// 测试正常认领
	claimedChore, err := service.ClaimChore(ctx, chore.ID, models.AssigneeUser)
	assert.NoError(t, err)
	assert.Equal(t, models.AssigneeUser, claimedChore.Assignee)
	assert.Equal(t, models.ChoreStatusClaimed, claimedChore.Status)

	// 测试重复认领
	_, err = service.ClaimChore(ctx, chore.ID, models.AssigneePartner)
	assert.Equal(t, ErrChoreAlreadyClaimed, err)

	// 测试无效认领人
	chore2 := &models.Chore{
		Name:     "倒垃圾",
		Icon:     "🗑️",
		Type:     models.ChoreTypeDaily,
		Points:   10,
		DueDate:  time.Now().Add(24 * time.Hour),
		Status:   models.ChoreStatusPending,
	}
	err = service.CreateChore(ctx, chore2)
	assert.NoError(t, err)

	_, err = service.ClaimChore(ctx, chore2.ID, "invalid")
	assert.Equal(t, ErrInvalidAssignee, err)
}

// TestCompleteChore - 测试完成打卡
func TestCompleteChore(t *testing.T) {
	service, _, err := setupTestChoreService()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建任务
	chore := &models.Chore{
		Name:     "洗衣服",
		Icon:     "👕",
		Type:     models.ChoreTypeWeekly,
		Points:   30,
		DueDate:  time.Now().Add(7 * 24 * time.Hour),
		Status:   models.ChoreStatusPending,
	}
	err = service.CreateChore(ctx, chore)
	assert.NoError(t, err)

	// 认领
	_, err = service.ClaimChore(ctx, chore.ID, models.AssigneeUser)
	assert.NoError(t, err)

	// 测试正常完成
	proofPhoto := "https://example.com/photo.jpg"
	notes := "今天洗了两桶衣服"
	completedChore, err := service.CompleteChore(ctx, chore.ID, models.AssigneeUser, &proofPhoto, &notes)
	assert.NoError(t, err)
	assert.Equal(t, models.ChoreStatusCompleted, completedChore.Status)
	assert.NotNil(t, completedChore.CompletedAt)
	assert.Equal(t, proofPhoto, *completedChore.ProofPhoto)
	assert.Equal(t, notes, *completedChore.Notes)

	// 测试重复完成
	_, err = service.CompleteChore(ctx, chore.ID, models.AssigneeUser, nil, nil)
	assert.Equal(t, ErrChoreAlreadyCompleted, err)
}

// TestCalculatePoints - 测试积分计算
func TestCalculatePoints(t *testing.T) {
	service, _, err := setupTestChoreService()
	assert.NoError(t, err)

	now := time.Now()

	// 提前完成（120%）
	dueDate := now.Add(2 * time.Hour)
	points := service.calculatePoints(100, dueDate, now)
	assert.Equal(t, 120, points)

	// 按时完成（100%）
	dueDate = now.Add(-12 * time.Hour)
	points = service.calculatePoints(100, dueDate, now)
	assert.Equal(t, 100, points)

	// 逾期完成（50%）
	dueDate = now.Add(-48 * time.Hour)
	points = service.calculatePoints(100, dueDate, now)
	assert.Equal(t, 50, points)

	// 最低 1 分
	dueDate = now.Add(-48 * time.Hour)
	points = service.calculatePoints(1, dueDate, now)
	assert.Equal(t, 1, points)
}

// TestGetStats - 测试获取统计数据
func TestGetStats(t *testing.T) {
	service, _, err := setupTestChoreService()
	assert.NoError(t, err)

	ctx := context.Background()

	// 测试获取不存在的用户统计
	stats, err := service.GetStats(ctx, "user")
	assert.NoError(t, err)
	assert.Equal(t, "user", stats.UserID)
	assert.Equal(t, 0, stats.TotalPoints)
}

// TestGetLeaderboard - 测试获取排行榜
func TestGetLeaderboard(t *testing.T) {
	service, _, err := setupTestChoreService()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建测试数据
	stats1 := &models.UserStats{UserID: "user", TotalPoints: 500, WeekPoints: 100}
	stats2 := &models.UserStats{UserID: "partner", TotalPoints: 300, WeekPoints: 150}
	service.repo.CreateUserStats(ctx, stats1)
	service.repo.CreateUserStats(ctx, stats2)

	// 测试总排行榜
	entries, err := service.GetLeaderboard(ctx, false)
	assert.NoError(t, err)
	assert.Len(t, entries, 2)
	assert.Equal(t, 1, entries[0].Rank)
	assert.Equal(t, "user", entries[0].UserID)

	// 测试周排行榜
	entries, err = service.GetLeaderboard(ctx, true)
	assert.NoError(t, err)
	assert.Len(t, entries, 2)
	assert.Equal(t, 1, entries[0].Rank)
	assert.Equal(t, "partner", entries[0].UserID) // partner 周积分更高
}

// TestMarkOverdueChores - 测试标记逾期任务
func TestMarkOverdueChores(t *testing.T) {
	service, _, err := setupTestChoreService()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建逾期任务
	overdueChore := &models.Chore{
		Name:     "过期任务",
		Icon:     "⏰",
		Type:     models.ChoreTypeDaily,
		Points:   10,
		DueDate:  time.Now().Add(-48 * time.Hour),
		Status:   models.ChoreStatusPending,
	}
	err = service.CreateChore(ctx, overdueChore)
	assert.NoError(t, err)

	// 标记逾期
	count, err := service.MarkOverdueChores(ctx)
	assert.NoError(t, err)
	assert.Equal(t, 1, count)

	// 验证状态已更新
	chore, err := service.GetChoreByID(ctx, overdueChore.ID)
	assert.NoError(t, err)
	assert.Equal(t, models.ChoreStatusOverdue, chore.Status)
}

// TestTemplateToChore - 测试模板转换
func TestTemplateToChore(t *testing.T) {
	service, _, err := setupTestChoreService()
	assert.NoError(t, err)

	template := models.ChoreTemplate{
		ID:              "template-001",
		Name:            "每日洗碗",
		Icon:            "🍽️",
		Type:            models.ChoreTypeDaily,
		Points:          10,
		DefaultAssignee: models.AssigneeUser,
	}

	dueDate := time.Now()
	chore := service.templateToChore(template, dueDate)

	assert.NotEmpty(t, chore.ID)
	assert.Equal(t, template.Name, chore.Name)
	assert.Equal(t, template.Icon, chore.Icon)
	assert.Equal(t, template.Type, chore.Type)
	assert.Equal(t, template.Points, chore.Points)
	assert.Equal(t, template.DefaultAssignee, chore.Assignee)
	assert.Equal(t, dueDate, chore.DueDate)
	assert.Equal(t, &template.ID, chore.TemplateID)
}

// TestUpdateUserStats - 测试更新用户统计
func TestUpdateUserStats(t *testing.T) {
	service, _, err := setupTestChoreService()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建任务并完成
	dueDate := time.Now().Add(24 * time.Hour)
	chore := &models.Chore{
		Name:     "测试任务",
		Icon:     "✅",
		Type:     models.ChoreTypeDaily,
		Points:   10,
		DueDate:  dueDate,
		Assignee: models.AssigneeUser,
		Status:   models.ChoreStatusClaimed,
	}
	err = service.CreateChore(ctx, chore)
	assert.NoError(t, err)

	_, err = service.ClaimChore(ctx, chore.ID, models.AssigneeUser)
	assert.NoError(t, err)

	_, err = service.CompleteChore(ctx, chore.ID, models.AssigneeUser, nil, nil)
	assert.NoError(t, err)

	// 验证统计更新
	stats, err := service.GetStats(ctx, "user")
	assert.NoError(t, err)
	assert.Greater(t, stats.TotalPoints, 0)
	assert.Equal(t, 1, stats.CompletedTasks)
}

// TestIsValidChoreType - 测试任务类型验证
func TestIsValidChoreType(t *testing.T) {
	assert.True(t, isValidChoreType(models.ChoreTypeDaily))
	assert.True(t, isValidChoreType(models.ChoreTypeWeekly))
	assert.True(t, isValidChoreType(models.ChoreTypeMonthly))
	assert.True(t, isValidChoreType(models.ChoreTypeOnce))
	assert.False(t, isValidChoreType("invalid"))
	assert.False(t, isValidChoreType(""))
}
