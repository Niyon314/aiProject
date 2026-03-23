package repository

import (
	"context"
	"testing"
	"time"

	"couple-home/backend/internal/models"
	"couple-home/backend/pkg/utils"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// setupTestChoreDB - 创建测试数据库
func setupTestChoreDB() (*gorm.DB, *ChoreRepository, error) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		return nil, nil, err
	}

	// 自动迁移
	err = db.AutoMigrate(
		&models.Chore{},
		&models.ChoreTemplate{},
		&models.UserStats{},
	)
	if err != nil {
		return nil, nil, err
	}

	repo := NewChoreRepository(db)
	return db, repo, nil
}

// TestGetChores - 测试获取任务列表
func TestGetChores(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建测试数据
	chores := []models.Chore{
		{ID: utils.GenerateID(), Name: "任务 1", Icon: "🍽️", Type: models.ChoreTypeDaily, Points: 10, DueDate: time.Now().Add(24 * time.Hour), Status: models.ChoreStatusPending},
		{ID: utils.GenerateID(), Name: "任务 2", Icon: "🧹", Type: models.ChoreTypeWeekly, Points: 30, DueDate: time.Now().Add(7 * 24 * time.Hour), Status: models.ChoreStatusClaimed, Assignee: models.AssigneeUser},
		{ID: utils.GenerateID(), Name: "任务 3", Icon: "🗑️", Type: models.ChoreTypeDaily, Points: 10, DueDate: time.Now().Add(48 * time.Hour), Status: models.ChoreStatusCompleted, Assignee: models.AssigneePartner},
	}

	for i := range chores {
		err := repo.CreateChore(ctx, &chores[i])
		assert.NoError(t, err)
	}

	// 测试获取所有任务
	allChores, err := repo.GetChores(ctx, nil, nil, nil, nil)
	assert.NoError(t, err)
	assert.Len(t, allChores, 3)

	// 测试按状态筛选
	status := models.ChoreStatusPending
	filteredChores, err := repo.GetChores(ctx, &status, nil, nil, nil)
	assert.NoError(t, err)
	assert.Len(t, filteredChores, 1)
	assert.Equal(t, "任务 1", filteredChores[0].Name)

	// 测试按认领人筛选
	assignee := models.AssigneeUser
	filteredChores, err = repo.GetChores(ctx, nil, &assignee, nil, nil)
	assert.NoError(t, err)
	assert.Len(t, filteredChores, 1)
	assert.Equal(t, "任务 2", filteredChores[0].Name)
}

// TestGetChoreByID - 测试根据 ID 获取任务
func TestGetChoreByID(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建任务
	chore := &models.Chore{ID: utils.GenerateID(),
		Name:     "测试任务",
		Icon:     "✅",
		Type:     models.ChoreTypeDaily,
		Points:   10,
		DueDate:  time.Now().Add(24 * time.Hour),
		Status:   models.ChoreStatusPending,
	}
	err = repo.CreateChore(ctx, chore)
	assert.NoError(t, err)

	// 测试获取
	foundChore, err := repo.GetChoreByID(ctx, chore.ID)
	assert.NoError(t, err)
	assert.Equal(t, chore.ID, foundChore.ID)
	assert.Equal(t, "测试任务", foundChore.Name)

	// 测试不存在的任务
	_, err = repo.GetChoreByID(ctx, "non-existent")
	assert.Error(t, err)
}

// TestCreateChore - 测试创建任务
func TestCreateChore(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	chore := &models.Chore{ID: utils.GenerateID(),
		Name:     "新任务",
		Icon:     "🎯",
		Type:     models.ChoreTypeDaily,
		Points:   15,
		DueDate:  time.Now().Add(24 * time.Hour),
		Status:   models.ChoreStatusPending,
	}

	err = repo.CreateChore(ctx, chore)
	assert.NoError(t, err)
	assert.NotEmpty(t, chore.ID)
	assert.NotZero(t, chore.CreatedAt)
}

// TestUpdateChore - 测试更新任务
func TestUpdateChore(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建任务
	chore := &models.Chore{ID: utils.GenerateID(),
		Name:     "原任务",
		Icon:     "📝",
		Type:     models.ChoreTypeDaily,
		Points:   10,
		DueDate:  time.Now().Add(24 * time.Hour),
		Status:   models.ChoreStatusPending,
	}
	err = repo.CreateChore(ctx, chore)
	assert.NoError(t, err)

	// 更新任务
	chore.Name = "更新后的任务"
	chore.Points = 20
	err = repo.UpdateChore(ctx, chore)
	assert.NoError(t, err)

	// 验证更新
	updated, err := repo.GetChoreByID(ctx, chore.ID)
	assert.NoError(t, err)
	assert.Equal(t, "更新后的任务", updated.Name)
	assert.Equal(t, 20, updated.Points)
}

// TestClaimChore - 测试认领任务
func TestClaimChore(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建任务
	chore := &models.Chore{ID: utils.GenerateID(),
		Name:     "待认领任务",
		Icon:     "🙋",
		Type:     models.ChoreTypeDaily,
		Points:   10,
		DueDate:  time.Now().Add(24 * time.Hour),
		Status:   models.ChoreStatusPending,
	}
	err = repo.CreateChore(ctx, chore)
	assert.NoError(t, err)

	// 认领任务
	err = repo.ClaimChore(ctx, chore.ID, models.AssigneeUser)
	assert.NoError(t, err)

	// 验证
	claimed, err := repo.GetChoreByID(ctx, chore.ID)
	assert.NoError(t, err)
	assert.Equal(t, models.AssigneeUser, claimed.Assignee)
	assert.Equal(t, models.ChoreStatusClaimed, claimed.Status)
	assert.NotNil(t, claimed.ClaimedAt)
}

// TestCompleteChore - 测试完成打卡
func TestCompleteChore(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建任务
	chore := &models.Chore{ID: utils.GenerateID(),
		Name:     "待完成任务",
		Icon:     "✅",
		Type:     models.ChoreTypeDaily,
		Points:   10,
		DueDate:  time.Now().Add(24 * time.Hour),
		Status:   models.ChoreStatusClaimed,
		Assignee: models.AssigneeUser,
	}
	err = repo.CreateChore(ctx, chore)
	assert.NoError(t, err)

	// 完成打卡
	proofPhoto := "https://example.com/photo.jpg"
	notes := "完成备注"
	now := time.Now()
	err = repo.CompleteChore(ctx, chore.ID, now, &proofPhoto, &notes, 12)
	assert.NoError(t, err)

	// 验证
	completed, err := repo.GetChoreByID(ctx, chore.ID)
	assert.NoError(t, err)
	assert.Equal(t, models.ChoreStatusCompleted, completed.Status)
	assert.Equal(t, proofPhoto, *completed.ProofPhoto)
	assert.Equal(t, notes, *completed.Notes)
	assert.Equal(t, 12, completed.ActualPoints)
	assert.NotNil(t, completed.CompletedAt)
}

// TestGetStats - 测试获取统计数据
func TestGetStats(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建统计数据
	stats := &models.UserStats{
		UserID:         "user",
		TotalPoints:    100,
		CompletedTasks: 5,
	}
	err = repo.CreateUserStats(ctx, stats)
	assert.NoError(t, err)

	// 获取统计
	foundStats, err := repo.GetStats(ctx, "user")
	assert.NoError(t, err)
	assert.Equal(t, "user", foundStats.UserID)
	assert.Equal(t, 100, foundStats.TotalPoints)
	assert.Equal(t, 5, foundStats.CompletedTasks)
}

// TestUpdateUserStats - 测试更新统计数据
func TestUpdateUserStats(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建统计数据
	stats := &models.UserStats{
		UserID:         "user",
		TotalPoints:    100,
		CompletedTasks: 5,
	}
	err = repo.CreateUserStats(ctx, stats)
	assert.NoError(t, err)

	// 更新
	stats.TotalPoints = 200
	stats.CompletedTasks = 10
	err = repo.UpdateUserStats(ctx, stats)
	assert.NoError(t, err)

	// 验证
	updated, err := repo.GetStats(ctx, "user")
	assert.NoError(t, err)
	assert.Equal(t, 200, updated.TotalPoints)
	assert.Equal(t, 10, updated.CompletedTasks)
}

// TestGetLeaderboard - 测试获取排行榜
func TestGetLeaderboard(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建测试数据
	stats := []models.UserStats{
		{UserID: "user1", TotalPoints: 500, WeekPoints: 100},
		{UserID: "user2", TotalPoints: 300, WeekPoints: 150},
		{UserID: "user3", TotalPoints: 700, WeekPoints: 50},
	}
	for i := range stats {
		err := repo.CreateUserStats(ctx, &stats[i])
		assert.NoError(t, err)
	}

	// 测试总排行榜
	leaderboard, err := repo.GetLeaderboard(ctx, 10)
	assert.NoError(t, err)
	assert.Len(t, leaderboard, 3)
	assert.Equal(t, "user3", leaderboard[0].UserID) // 总积分最高
	assert.Equal(t, 700, leaderboard[0].TotalPoints)

	// 测试周排行榜
	weeklyLeaderboard, err := repo.GetWeeklyLeaderboard(ctx, 10)
	assert.NoError(t, err)
	assert.Len(t, weeklyLeaderboard, 3)
	assert.Equal(t, "user2", weeklyLeaderboard[0].UserID) // 周积分最高
	assert.Equal(t, 150, weeklyLeaderboard[0].WeekPoints)
}

// TestGetOverdueChores - 测试获取逾期任务
func TestGetOverdueChores(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建测试数据
	chores := []models.Chore{
		{ID: utils.GenerateID(), Name: "逾期任务 1", Type: models.ChoreTypeDaily, Points: 10, DueDate: time.Now().Add(-48 * time.Hour), Status: models.ChoreStatusPending},
		{ID: utils.GenerateID(), Name: "逾期任务 2", Type: models.ChoreTypeDaily, Points: 10, DueDate: time.Now().Add(-24 * time.Hour), Status: models.ChoreStatusClaimed},
		{ID: utils.GenerateID(), Name: "正常任务", Type: models.ChoreTypeDaily, Points: 10, DueDate: time.Now().Add(24 * time.Hour), Status: models.ChoreStatusPending},
	}
	for i := range chores {
		err := repo.CreateChore(ctx, &chores[i])
		assert.NoError(t, err)
	}

	// 获取逾期任务
	overdue, err := repo.GetOverdueChores(ctx)
	assert.NoError(t, err)
	assert.Len(t, overdue, 2)
}

// TestMarkAsOverdue - 测试标记逾期
func TestMarkAsOverdue(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建任务
	chore := &models.Chore{ID: utils.GenerateID(),
		Name:     "测试任务",
		Type:     models.ChoreTypeDaily,
		Points:   10,
		DueDate:  time.Now().Add(-48 * time.Hour),
		Status:   models.ChoreStatusPending,
	}
	err = repo.CreateChore(ctx, chore)
	assert.NoError(t, err)

	// 标记逾期
	err = repo.MarkAsOverdue(ctx, []string{chore.ID})
	assert.NoError(t, err)

	// 验证
	updated, err := repo.GetChoreByID(ctx, chore.ID)
	assert.NoError(t, err)
	assert.Equal(t, models.ChoreStatusOverdue, updated.Status)
}

// TestChoreTemplates - 测试模板 CRUD
func TestChoreTemplates(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建模板
	template := &models.ChoreTemplate{
		ID:              utils.GenerateID(),
		Name:            "每日洗碗",
		Icon:            "🍽️",
		Type:            models.ChoreTypeDaily,
		Points:          10,
		DefaultAssignee: models.AssigneeUser,
		IsActive:        true,
	}
	err = repo.CreateChoreTemplate(ctx, template)
	assert.NoError(t, err)
	assert.NotEmpty(t, template.ID)

	// 获取模板
	found, err := repo.GetChoreTemplateByID(ctx, template.ID)
	assert.NoError(t, err)
	assert.Equal(t, "每日洗碗", found.Name)

	// 获取所有模板
	templates, err := repo.GetChoreTemplates(ctx, nil)
	assert.NoError(t, err)
	assert.Len(t, templates, 1)

	// 更新模板
	template.Points = 15
	err = repo.UpdateChoreTemplate(ctx, template)
	assert.NoError(t, err)

	updated, err := repo.GetChoreTemplateByID(ctx, template.ID)
	assert.NoError(t, err)
	assert.Equal(t, 15, updated.Points)

	// 删除模板（软删除）
	err = repo.DeleteChoreTemplate(ctx, template.ID)
	assert.NoError(t, err)

	// 验证删除
	templates, err = repo.GetChoreTemplates(ctx, nil)
	assert.NoError(t, err)
	assert.Len(t, templates, 0)
}

// TestGetUserStreakInfo - 测试获取连续打卡信息
func TestGetUserStreakInfo(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建测试数据
	now := time.Now()
	chores := []models.Chore{
		{ID: utils.GenerateID(), Name: "任务 1", Type: models.ChoreTypeDaily, Points: 10, DueDate: now, Status: models.ChoreStatusCompleted, Assignee: models.AssigneeUser, CompletedAt: &now},
		{ID: utils.GenerateID(), Name: "任务 2", Type: models.ChoreTypeDaily, Points: 10, DueDate: now.Add(-24 * time.Hour), Status: models.ChoreStatusCompleted, Assignee: models.AssigneeUser, CompletedAt: &[]time.Time{now.Add(-24 * time.Hour)}[0]},
		{ID: utils.GenerateID(), Name: "任务 3", Type: models.ChoreTypeDaily, Points: 10, DueDate: now.Add(-48 * time.Hour), Status: models.ChoreStatusCompleted, Assignee: models.AssigneeUser, CompletedAt: &[]time.Time{now.Add(-48 * time.Hour)}[0]},
	}
	for i := range chores {
		err := repo.CreateChore(ctx, &chores[i])
		assert.NoError(t, err)
	}

	// 获取连续信息
	current, longest, err := repo.GetUserStreakInfo(ctx, "user")
	assert.NoError(t, err)
	assert.GreaterOrEqual(t, current, 0)
	assert.GreaterOrEqual(t, longest, current)
}

// TestResetWeeklyPoints - 测试重置周积分
func TestResetWeeklyPoints(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建测试数据
	stats := &models.UserStats{
		UserID:     "user",
		WeekPoints: 100,
	}
	err = repo.CreateUserStats(ctx, stats)
	assert.NoError(t, err)

	// 重置
	err = repo.ResetWeeklyPoints(ctx)
	assert.NoError(t, err)

	// 验证
	updated, err := repo.GetStats(ctx, "user")
	assert.NoError(t, err)
	assert.Equal(t, 0, updated.WeekPoints)
}

// TestAddPointsToUser - 测试添加积分
func TestAddPointsToUser(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建测试数据
	stats := &models.UserStats{
		UserID:      "user",
		TotalPoints: 100,
		WeekPoints:  50,
	}
	err = repo.CreateUserStats(ctx, stats)
	assert.NoError(t, err)

	// 添加积分
	err = repo.AddPointsToUser(ctx, "user", 30)
	assert.NoError(t, err)

	// 验证
	updated, err := repo.GetStats(ctx, "user")
	assert.NoError(t, err)
	assert.Equal(t, 130, updated.TotalPoints)
	assert.Equal(t, 80, updated.WeekPoints)
}

// TestGetChoresByDateRange - 测试按日期范围获取任务
func TestGetChoresByDateRange(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建测试数据
	now := time.Now()
	chores := []models.Chore{
		{ID: utils.GenerateID(), Name: "今天", Type: models.ChoreTypeDaily, Points: 10, DueDate: now},
		{ID: utils.GenerateID(), Name: "明天", Type: models.ChoreTypeDaily, Points: 10, DueDate: now.Add(24 * time.Hour)},
		{ID: utils.GenerateID(), Name: "后天", Type: models.ChoreTypeDaily, Points: 10, DueDate: now.Add(48 * time.Hour)},
	}
	for i := range chores {
		err := repo.CreateChore(ctx, &chores[i])
		assert.NoError(t, err)
	}

	// 按范围获取
	start := now
	end := now.Add(36 * time.Hour)
	filtered, err := repo.GetChoresByDateRange(ctx, start, end)
	assert.NoError(t, err)
	assert.Len(t, filtered, 2) // 今天和明天
}

// TestGetChoresByAssignee - 测试按认领人获取任务
func TestGetChoresByAssignee(t *testing.T) {
	_, repo, err := setupTestChoreDB()
	assert.NoError(t, err)

	ctx := context.Background()

	// 创建测试数据
	chores := []models.Chore{
		{ID: utils.GenerateID(), Name: "用户任务 1", Type: models.ChoreTypeDaily, Points: 10, DueDate: time.Now(), Assignee: models.AssigneeUser, Status: models.ChoreStatusClaimed},
		{ID: utils.GenerateID(), Name: "用户任务 2", Type: models.ChoreTypeDaily, Points: 10, DueDate: time.Now(), Assignee: models.AssigneeUser, Status: models.ChoreStatusCompleted},
		{ID: utils.GenerateID(), Name: "伴侣任务", Type: models.ChoreTypeDaily, Points: 10, DueDate: time.Now(), Assignee: models.AssigneePartner, Status: models.ChoreStatusClaimed},
	}
	for i := range chores {
		err := repo.CreateChore(ctx, &chores[i])
		assert.NoError(t, err)
	}

	// 按认领人获取
	userChores, err := repo.GetChoresByAssignee(ctx, models.AssigneeUser)
	assert.NoError(t, err)
	assert.Len(t, userChores, 2)
}
