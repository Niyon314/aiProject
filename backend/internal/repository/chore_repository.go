package repository

import (
	"context"
	"time"

	"couple-home/backend/internal/models"
	"gorm.io/gorm"
)

// ChoreRepository - 家务任务数据访问层
type ChoreRepository struct {
	db *gorm.DB
}

// NewChoreRepository - 创建家务任务仓库
func NewChoreRepository(db *gorm.DB) *ChoreRepository {
	return &ChoreRepository{db: db}
}

// GetChores - 获取任务列表
// 支持按状态、认领人、日期范围筛选
func (r *ChoreRepository) GetChores(ctx context.Context, status *models.ChoreStatus, assignee *models.Assignee, startDate, endDate *time.Time) ([]models.Chore, error) {
	var chores []models.Chore
	query := r.db.WithContext(ctx)

	if status != nil {
		query = query.Where("status = ?", *status)
	}
	if assignee != nil {
		query = query.Where("assignee = ?", *assignee)
	}
	if startDate != nil {
		query = query.Where("due_date >= ?", *startDate)
	}
	if endDate != nil {
		query = query.Where("due_date <= ?", *endDate)
	}

	err := query.Order("due_date ASC, created_at ASC").Find(&chores).Error
	return chores, err
}

// GetChoreByID - 根据 ID 获取任务
func (r *ChoreRepository) GetChoreByID(ctx context.Context, id string) (*models.Chore, error) {
	var chore models.Chore
	err := r.db.WithContext(ctx).First(&chore, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &chore, nil
}

// CreateChore - 创建任务
func (r *ChoreRepository) CreateChore(ctx context.Context, chore *models.Chore) error {
	return r.db.WithContext(ctx).Create(chore).Error
}

// UpdateChore - 更新任务
func (r *ChoreRepository) UpdateChore(ctx context.Context, chore *models.Chore) error {
	return r.db.WithContext(ctx).Save(chore).Error
}

// ClaimChore - 认领任务
// 更新任务的认领人和状态
func (r *ChoreRepository) ClaimChore(ctx context.Context, id string, assignee models.Assignee) error {
	now := time.Now()
	return r.db.WithContext(ctx).
		Model(&models.Chore{}).
		Where("id = ? AND status = ?", id, models.ChoreStatusPending).
		Updates(map[string]interface{}{
			"assignee":     assignee,
			"status":       models.ChoreStatusClaimed,
			"claimed_at":   now,
			"updated_at":   now,
		}).Error
}

// CompleteChore - 完成打卡
// 更新任务状态为已完成，记录完成时间和照片
func (r *ChoreRepository) CompleteChore(ctx context.Context, id string, completedAt time.Time, proofPhoto *string, notes *string, actualPoints int) error {
	return r.db.WithContext(ctx).
		Model(&models.Chore{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":        models.ChoreStatusCompleted,
			"completed_at":  completedAt,
			"proof_photo":   proofPhoto,
			"notes":         notes,
			"actual_points": actualPoints,
			"updated_at":    time.Now(),
		}).Error
}

// GetStats - 获取用户统计数据
func (r *ChoreRepository) GetStats(ctx context.Context, userID string) (*models.UserStats, error) {
	var stats models.UserStats
	err := r.db.WithContext(ctx).First(&stats, "user_id = ?", userID).Error
	if err != nil {
		return nil, err
	}
	return &stats, nil
}

// UpdateUserStats - 更新用户统计数据
func (r *ChoreRepository) UpdateUserStats(ctx context.Context, stats *models.UserStats) error {
	return r.db.WithContext(ctx).Save(stats).Error
}

// CreateUserStats - 创建用户统计数据
func (r *ChoreRepository) CreateUserStats(ctx context.Context, stats *models.UserStats) error {
	return r.db.WithContext(ctx).Create(stats).Error
}

// GetLeaderboard - 获取排行榜
// 按总积分降序排列
func (r *ChoreRepository) GetLeaderboard(ctx context.Context, limit int) ([]models.UserStats, error) {
	var stats []models.UserStats
	err := r.db.WithContext(ctx).
		Order("total_points DESC, week_points DESC").
		Limit(limit).
		Find(&stats).Error
	return stats, err
}

// GetWeeklyLeaderboard - 获取周排行榜
// 按本周积分降序排列
func (r *ChoreRepository) GetWeeklyLeaderboard(ctx context.Context, limit int) ([]models.UserStats, error) {
	var stats []models.UserStats
	err := r.db.WithContext(ctx).
		Order("week_points DESC, total_points DESC").
		Limit(limit).
		Find(&stats).Error
	return stats, err
}

// GetChoresByDateRange - 获取指定日期范围内的任务
func (r *ChoreRepository) GetChoresByDateRange(ctx context.Context, start, end time.Time) ([]models.Chore, error) {
	var chores []models.Chore
	err := r.db.WithContext(ctx).
		Where("due_date >= ? AND due_date <= ?", start, end).
		Order("due_date ASC").
		Find(&chores).Error
	return chores, err
}

// GetChoresByAssignee - 获取指定认领人的任务
func (r *ChoreRepository) GetChoresByAssignee(ctx context.Context, assignee models.Assignee) ([]models.Chore, error) {
	var chores []models.Chore
	err := r.db.WithContext(ctx).
		Where("assignee = ?", assignee).
		Order("due_date ASC").
		Find(&chores).Error
	return chores, err
}

// GetOverdueChores - 获取逾期未完成的任务
func (r *ChoreRepository) GetOverdueChores(ctx context.Context) ([]models.Chore, error) {
	var chores []models.Chore
	err := r.db.WithContext(ctx).
		Where("due_date < ? AND status IN ?", time.Now(), []models.ChoreStatus{models.ChoreStatusPending, models.ChoreStatusClaimed}).
		Order("due_date ASC").
		Find(&chores).Error
	return chores, err
}

// MarkAsOverdue - 将任务标记为逾期
func (r *ChoreRepository) MarkAsOverdue(ctx context.Context, ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).
		Model(&models.Chore{}).
		Where("id IN ?", ids).
		Update("status", models.ChoreStatusOverdue).Error
}

// GetChoreTemplates - 获取所有任务模板
func (r *ChoreRepository) GetChoreTemplates(ctx context.Context, isActive *bool) ([]models.ChoreTemplate, error) {
	var templates []models.ChoreTemplate
	query := r.db.WithContext(ctx)
	if isActive != nil {
		query = query.Where("is_active = ?", *isActive)
	}
	err := query.Order("type, name").Find(&templates).Error
	return templates, err
}

// GetChoreTemplateByID - 根据 ID 获取模板
func (r *ChoreRepository) GetChoreTemplateByID(ctx context.Context, id string) (*models.ChoreTemplate, error) {
	var template models.ChoreTemplate
	err := r.db.WithContext(ctx).First(&template, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &template, nil
}

// CreateChoreTemplate - 创建任务模板
func (r *ChoreRepository) CreateChoreTemplate(ctx context.Context, template *models.ChoreTemplate) error {
	return r.db.WithContext(ctx).Create(template).Error
}

// UpdateChoreTemplate - 更新任务模板
func (r *ChoreRepository) UpdateChoreTemplate(ctx context.Context, template *models.ChoreTemplate) error {
	return r.db.WithContext(ctx).Save(template).Error
}

// DeleteChoreTemplate - 删除任务模板（软删除）
func (r *ChoreRepository) DeleteChoreTemplate(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.ChoreTemplate{}, "id = ?", id).Error
}

// GetUserCompletedChoresCount - 获取用户已完成任务数量
func (r *ChoreRepository) GetUserCompletedChoresCount(ctx context.Context, userID string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.Chore{}).
		Where("assignee = ? AND status = ?", userID, models.ChoreStatusCompleted).
		Count(&count).Error
	return count, err
}

// GetUserStreakInfo - 获取用户连续打卡信息
// 返回当前连续天数和最长连续天数
func (r *ChoreRepository) GetUserStreakInfo(ctx context.Context, userID string) (currentStreak, longestStreak int, err error) {
	// 获取用户所有已完成的任务，按完成时间排序
	var chores []models.Chore
	err = r.db.WithContext(ctx).
		Where("assignee = ? AND status = ?", userID, models.ChoreStatusCompleted).
		Order("completed_at DESC").
		Find(&chores).Error
	if err != nil {
		return 0, 0, err
	}

	if len(chores) == 0 {
		return 0, 0, nil
	}

	// 计算当前连续天数
	currentStreak = 1
	longestStreak = 1
	tempStreak := 1

	for i := 1; i < len(chores); i++ {
		if chores[i].CompletedAt == nil || chores[i-1].CompletedAt == nil {
			continue
		}
		
		// 计算两个任务完成时间的间隔（天数）
		diff := chores[i-1].CompletedAt.Sub(*chores[i].CompletedAt).Hours() / 24
		
		if diff <= 1.5 { // 允许 1.5 天的浮动
			tempStreak++
			if tempStreak > longestStreak {
				longestStreak = tempStreak
			}
		} else {
			// 检查是否是当前连续 streak 的起点
			if i == 1 && diff <= 1.5 {
				currentStreak = tempStreak
			}
			tempStreak = 1
		}
	}

	// 检查第一个任务是否是今天或昨天完成的，以确定当前 streak
	if len(chores) > 0 && chores[0].CompletedAt != nil {
		diff := time.Now().Sub(*chores[0].CompletedAt).Hours() / 24
		if diff <= 1.5 {
			currentStreak = tempStreak
		} else {
			currentStreak = 0
		}
	}

	return currentStreak, longestStreak, nil
}

// ResetWeeklyPoints - 重置所有用户的本周积分（每周调用一次）
func (r *ChoreRepository) ResetWeeklyPoints(ctx context.Context) error {
	return r.db.WithContext(ctx).
		Model(&models.UserStats{}).
		UpdateColumn("week_points", 0).Error
}

// AddPointsToUser - 给用户添加积分
func (r *ChoreRepository) AddPointsToUser(ctx context.Context, userID string, points int) error {
	return r.db.WithContext(ctx).
		Model(&models.UserStats{}).
		Where("user_id = ?", userID).
		UpdateColumn("total_points", gorm.Expr("total_points + ?", points)).
		UpdateColumn("week_points", gorm.Expr("week_points + ?", points)).Error
}

// GetDB - 获取数据库实例（用于复杂查询）
func (r *ChoreRepository) GetDB() *gorm.DB {
	return r.db
}
