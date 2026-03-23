package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/repository"
	"couple-home/backend/pkg/utils"
)

// 错误定义
var (
	ErrChoreNotFound      = errors.New("chore not found")
	ErrChoreAlreadyClaimed = errors.New("chore already claimed")
	ErrChoreAlreadyCompleted = errors.New("chore already completed")
	ErrInvalidAssignee    = errors.New("invalid assignee")
	ErrInvalidChoreType   = errors.New("invalid chore type")
	ErrInvalidPoints      = errors.New("invalid points calculation")
)

// ChoreService - 家务任务业务逻辑层
type ChoreService struct {
	repo *repository.ChoreRepository
}

// NewChoreService - 创建家务任务服务
func NewChoreService(repo *repository.ChoreRepository) *ChoreService {
	return &ChoreService{repo: repo}
}

// GetChores - 获取任务列表
func (s *ChoreService) GetChores(ctx context.Context, status *models.ChoreStatus, assignee *models.Assignee, startDate, endDate *time.Time) ([]models.Chore, error) {
	return s.repo.GetChores(ctx, status, assignee, startDate, endDate)
}

// GetChoreByID - 根据 ID 获取任务
func (s *ChoreService) GetChoreByID(ctx context.Context, id string) (*models.Chore, error) {
	chore, err := s.repo.GetChoreByID(ctx, id)
	if err != nil {
		return nil, ErrChoreNotFound
	}
	return chore, nil
}

// CreateChore - 创建任务
func (s *ChoreService) CreateChore(ctx context.Context, chore *models.Chore) error {
	// 验证任务类型
	if !isValidChoreType(chore.Type) {
		return ErrInvalidChoreType
	}

	// 验证积分
	if chore.Points <= 0 {
		return ErrInvalidPoints
	}

	// 设置初始状态
	if chore.Status == "" {
		chore.Status = models.ChoreStatusPending
	}
	if chore.Assignee == "" {
		chore.Assignee = models.AssigneeNone
	}

	chore.ID = utils.GenerateID()
	return s.repo.CreateChore(ctx, chore)
}

// ClaimChore - 认领任务
func (s *ChoreService) ClaimChore(ctx context.Context, id string, assignee models.Assignee) (*models.Chore, error) {
	// 验证认领人
	if assignee != models.AssigneeUser && assignee != models.AssigneePartner {
		return nil, ErrInvalidAssignee
	}

	// 获取任务
	chore, err := s.repo.GetChoreByID(ctx, id)
	if err != nil {
		return nil, ErrChoreNotFound
	}

	// 检查是否已被认领
	if chore.Status != models.ChoreStatusPending {
		return nil, ErrChoreAlreadyClaimed
	}

	// 认领任务
	if err := s.repo.ClaimChore(ctx, id, assignee); err != nil {
		return nil, fmt.Errorf("failed to claim chore: %w", err)
	}

	// 重新获取更新后的任务
	chore, err = s.repo.GetChoreByID(ctx, id)
	if err != nil {
		return nil, ErrChoreNotFound
	}

	return chore, nil
}

// CompleteChore - 完成打卡
func (s *ChoreService) CompleteChore(ctx context.Context, id string, assignee models.Assignee, proofPhoto *string, notes *string) (*models.Chore, error) {
	// 获取任务
	chore, err := s.repo.GetChoreByID(ctx, id)
	if err != nil {
		return nil, ErrChoreNotFound
	}

	// 检查是否已完成
	if chore.Status == models.ChoreStatusCompleted {
		return nil, ErrChoreAlreadyCompleted
	}

	// 验证认领人（只能完成自己认领的任务）
	if chore.Assignee != assignee {
		return nil, errors.New("can only complete your own claimed chores")
	}

	// 计算积分
	now := time.Now()
	actualPoints := s.calculatePoints(chore.Points, chore.DueDate, now)

	// 更新任务状态
	if err := s.repo.CompleteChore(ctx, id, now, proofPhoto, notes, actualPoints); err != nil {
		return nil, fmt.Errorf("failed to complete chore: %w", err)
	}

	// 更新用户统计
	if err := s.updateUserStats(ctx, string(assignee), chore.Points, actualPoints, chore.DueDate, now); err != nil {
		return nil, fmt.Errorf("failed to update user stats: %w", err)
	}

	// 重新获取更新后的任务
	chore, err = s.repo.GetChoreByID(ctx, id)
	if err != nil {
		return nil, ErrChoreNotFound
	}

	return chore, nil
}

// calculatePoints - 计算积分
// 规则：
// - 按时完成：100% 基础分
// - 提前完成：120% 基础分
// - 逾期完成：50% 基础分
// - 上传照片：+5 分额外奖励
func (s *ChoreService) calculatePoints(basePoints int, dueDate, completedAt time.Time) int {
	points := 0

	// 计算时间差（小时）
	hoursDiff := dueDate.Sub(completedAt).Hours()

	if hoursDiff > 0 {
		// 提前完成：120%
		points = int(float64(basePoints) * 1.2)
	} else if hoursDiff >= -24 {
		// 按时完成（24 小时内）：100%
		points = basePoints
	} else {
		// 逾期完成：50%
		points = int(float64(basePoints) * 0.5)
	}

	// 确保至少有 1 分
	if points < 1 {
		points = 1
	}

	return points
}

// updateUserStats - 更新用户统计数据
func (s *ChoreService) updateUserStats(ctx context.Context, userID string, basePoints, actualPoints int, dueDate, completedAt time.Time) error {
	// 获取或创建用户统计
	stats, err := s.repo.GetStats(ctx, userID)
	if err != nil {
		// 如果不存在，创建新的统计
		stats = &models.UserStats{
			UserID: userID,
		}
		if err := s.repo.CreateUserStats(ctx, stats); err != nil {
			return err
		}
	}

	// 更新统计数据
	stats.TotalPoints += actualPoints
	stats.WeekPoints += actualPoints
	stats.CompletedTasks++

	// 判断是否按时完成
	hoursDiff := dueDate.Sub(completedAt).Hours()
	if hoursDiff > 0 {
		stats.EarlyTasks++
	} else if hoursDiff >= -24 {
		stats.OnTimeTasks++
	} else {
		stats.LateTasks++
	}

	// 计算按时完成率
	totalCompleted := stats.OnTimeTasks + stats.EarlyTasks + stats.LateTasks
	if totalCompleted > 0 {
		stats.OnTimeRate = float64(stats.OnTimeTasks+stats.EarlyTasks) / float64(totalCompleted) * 100
	}

	// 更新连续打卡
	currentStreak, longestStreak, err := s.repo.GetUserStreakInfo(ctx, userID)
	if err == nil {
		stats.CurrentStreak = currentStreak
		stats.LongestStreak = longestStreak
	}

	return s.repo.UpdateUserStats(ctx, stats)
}

// GetStats - 获取用户统计数据
func (s *ChoreService) GetStats(ctx context.Context, userID string) (*models.UserStats, error) {
	stats, err := s.repo.GetStats(ctx, userID)
	if err != nil {
		// 如果不存在，返回默认统计
		return &models.UserStats{
			UserID: userID,
		}, nil
	}
	return stats, nil
}

// GetLeaderboard - 获取排行榜
func (s *ChoreService) GetLeaderboard(ctx context.Context, weekly bool) ([]models.LeaderboardEntry, error) {
	var stats []models.UserStats
	var err error

	if weekly {
		stats, err = s.repo.GetWeeklyLeaderboard(ctx, 10)
	} else {
		stats, err = s.repo.GetLeaderboard(ctx, 10)
	}

	if err != nil {
		return nil, err
	}

	// 转换为排行榜条目
	entries := make([]models.LeaderboardEntry, 0, len(stats))
	for i, stat := range stats {
		entries = append(entries, models.LeaderboardEntry{
			UserID:      stat.UserID,
			TotalPoints: stat.TotalPoints,
			WeekPoints:  stat.WeekPoints,
			Rank:        i + 1,
		})
	}

	return entries, nil
}

// GetOverdueChores - 获取逾期未完成的任务
func (s *ChoreService) GetOverdueChores(ctx context.Context) ([]models.Chore, error) {
	return s.repo.GetOverdueChores(ctx)
}

// MarkOverdueChores - 标记逾期任务
func (s *ChoreService) MarkOverdueChores(ctx context.Context) (int, error) {
	// 获取所有逾期未完成的任务
	chores, err := s.repo.GetOverdueChores(ctx)
	if err != nil {
		return 0, err
	}

	if len(chores) == 0 {
		return 0, nil
	}

	// 提取 ID
	ids := make([]string, 0, len(chores))
	for _, chore := range chores {
		ids = append(ids, chore.ID)
	}

	// 标记为逾期
	if err := s.repo.MarkAsOverdue(ctx, ids); err != nil {
		return 0, err
	}

	return len(chores), nil
}

// CreateChoresFromTemplates - 从模板创建任务（用于每周生成）
func (s *ChoreService) CreateChoresFromTemplates(ctx context.Context, templates []models.ChoreTemplate, weekStart time.Time) ([]models.Chore, error) {
	chores := make([]models.Chore, 0, len(templates))

	for _, template := range templates {
		// 计算截止日期
		var dueDate time.Time
		switch template.Type {
		case models.ChoreTypeDaily:
			// 每日任务：创建 7 天的任务
			for i := 0; i < 7; i++ {
				dueDate = weekStart.AddDate(0, 0, i)
				chore := s.templateToChore(template, dueDate)
				chores = append(chores, *chore)
			}
		case models.ChoreTypeWeekly:
			// 每周任务：截止日期为周日
			dueDate = weekStart.AddDate(0, 0, 6) // 周日
			chore := s.templateToChore(template, dueDate)
			chores = append(chores, *chore)
		case models.ChoreTypeMonthly:
			// 每月任务：截止日期为月末
			dueDate = weekStart.AddDate(0, 1, -1) // 下个月最后一天
			chore := s.templateToChore(template, dueDate)
			chores = append(chores, *chore)
		}
	}

	// 批量创建
	for i := range chores {
		if err := s.repo.CreateChore(ctx, &chores[i]); err != nil {
			return nil, fmt.Errorf("failed to create chore %s: %w", chores[i].Name, err)
		}
	}

	return chores, nil
}

// templateToChore - 将模板转换为任务
func (s *ChoreService) templateToChore(template models.ChoreTemplate, dueDate time.Time) *models.Chore {
	return &models.Chore{
		ID:           utils.GenerateID(),
		Name:         template.Name,
		Icon:         template.Icon,
		Type:         template.Type,
		Points:       template.Points,
		Assignee:     template.DefaultAssignee,
		DueDate:      dueDate,
		Status:       models.ChoreStatusPending,
		TemplateID:   &template.ID,
		ActualPoints: 0,
	}
}

// GetChoreTemplates - 获取所有任务模板
func (s *ChoreService) GetChoreTemplates(ctx context.Context, isActive *bool) ([]models.ChoreTemplate, error) {
	return s.repo.GetChoreTemplates(ctx, isActive)
}

// CreateChoreTemplate - 创建任务模板
func (s *ChoreService) CreateChoreTemplate(ctx context.Context, template *models.ChoreTemplate) error {
	if !isValidChoreType(template.Type) {
		return ErrInvalidChoreType
	}

	template.ID = utils.GenerateID()
	return s.repo.CreateChoreTemplate(ctx, template)
}

// UpdateChoreTemplate - 更新任务模板
func (s *ChoreService) UpdateChoreTemplate(ctx context.Context, template *models.ChoreTemplate) error {
	return s.repo.UpdateChoreTemplate(ctx, template)
}

// DeleteChoreTemplate - 删除任务模板
func (s *ChoreService) DeleteChoreTemplate(ctx context.Context, id string) error {
	return s.repo.DeleteChoreTemplate(ctx, id)
}

// isValidChoreType - 验证任务类型
func isValidChoreType(choreType models.ChoreType) bool {
	return choreType == models.ChoreTypeDaily ||
		choreType == models.ChoreTypeWeekly ||
		choreType == models.ChoreTypeMonthly ||
		choreType == models.ChoreTypeOnce
}

// ResetWeeklyStats - 重置每周统计（每周调用一次）
func (s *ChoreService) ResetWeeklyStats(ctx context.Context) error {
	return s.repo.ResetWeeklyPoints(ctx)
}

// SwapChores - 交换两个任务（需要双方同意）
func (s *ChoreService) SwapChores(ctx context.Context, choreID1, choreID2 string) error {
	// 获取两个任务
	chore1, err := s.repo.GetChoreByID(ctx, choreID1)
	if err != nil {
		return ErrChoreNotFound
	}

	chore2, err := s.repo.GetChoreByID(ctx, choreID2)
	if err != nil {
		return ErrChoreNotFound
	}

	// 检查状态
	if chore1.Status != models.ChoreStatusClaimed || chore2.Status != models.ChoreStatusClaimed {
		return errors.New("can only swap claimed chores")
	}

	// 交换认领人
	temp := chore1.Assignee
	chore1.Assignee = chore2.Assignee
	chore2.Assignee = temp

	// 保存更新
	if err := s.repo.UpdateChore(ctx, chore1); err != nil {
		return err
	}

	return s.repo.UpdateChore(ctx, chore2)
}
