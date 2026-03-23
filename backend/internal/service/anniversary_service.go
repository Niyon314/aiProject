package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/repository"
	"couple-home/backend/pkg/utils"
)

// 错误定义
var (
	ErrAnniversaryNotFound = errors.New("anniversary not found")
	ErrInvalidAnniversaryType = errors.New("invalid anniversary type")
	ErrInvalidYear         = errors.New("invalid year")
)

// AnniversaryService - 纪念日业务逻辑层
type AnniversaryService struct {
	repo *repository.AnniversaryRepository
}

// NewAnniversaryService - 创建纪念日服务
func NewAnniversaryService(repo *repository.AnniversaryRepository) *AnniversaryService {
	return &AnniversaryService{repo: repo}
}

// GetAnniversaries - 获取纪念日列表
func (s *AnniversaryService) GetAnniversaries(ctx context.Context, anniversaryType *models.AnniversaryType) ([]models.Anniversary, error) {
	return s.repo.GetAnniversaries(ctx, anniversaryType)
}

// GetAnniversaryByID - 根据 ID 获取纪念日
func (s *AnniversaryService) GetAnniversaryByID(ctx context.Context, id string) (*models.Anniversary, error) {
	anniversary, err := s.repo.GetAnniversaryByID(ctx, id)
	if err != nil {
		return nil, ErrAnniversaryNotFound
	}
	return anniversary, nil
}

// CreateAnniversary - 创建纪念日
func (s *AnniversaryService) CreateAnniversary(ctx context.Context, anniversary *models.Anniversary) error {
	// 验证纪念日类型
	if !isValidAnniversaryType(anniversary.Type) {
		return ErrInvalidAnniversaryType
	}

	// 验证年份
	if anniversary.Year < 1900 || anniversary.Year > time.Now().Year() {
		return ErrInvalidYear
	}

	// 设置默认提醒天数
	if anniversary.ReminderDays == "" {
		anniversary.ReminderDays = `[7, 3, 1]`
	}

	anniversary.ID = utils.GenerateID()
	return s.repo.CreateAnniversary(ctx, anniversary)
}

// UpdateAnniversary - 更新纪念日
func (s *AnniversaryService) UpdateAnniversary(ctx context.Context, anniversary *models.Anniversary) error {
	// 验证纪念日是否存在
	_, err := s.repo.GetAnniversaryByID(ctx, anniversary.ID)
	if err != nil {
		return ErrAnniversaryNotFound
	}

	// 验证纪念日类型
	if !isValidAnniversaryType(anniversary.Type) {
		return ErrInvalidAnniversaryType
	}

	// 验证年份
	if anniversary.Year < 1900 || anniversary.Year > time.Now().Year() {
		return ErrInvalidYear
	}

	return s.repo.UpdateAnniversary(ctx, anniversary)
}

// DeleteAnniversary - 删除纪念日
func (s *AnniversaryService) DeleteAnniversary(ctx context.Context, id string) error {
	// 验证纪念日是否存在
	_, err := s.repo.GetAnniversaryByID(ctx, id)
	if err != nil {
		return ErrAnniversaryNotFound
	}

	return s.repo.DeleteAnniversary(ctx, id)
}

// GetUpcomingAnniversaries - 获取即将到来的纪念日
func (s *AnniversaryService) GetUpcomingAnniversaries(ctx context.Context, days int) ([]models.Anniversary, error) {
	if days <= 0 {
		days = 30 // default to 30 days
	}
	return s.repo.GetUpcomingAnniversaries(ctx, days)
}

// GetDaysTogether - 计算在一起天数
// 查找类型为 relationship 的纪念日开始日期，计算到现在多少天
func (s *AnniversaryService) GetDaysTogether(ctx context.Context) (int, error) {
	// 获取所有恋爱相关纪念日
	anniversaries, err := s.repo.GetRelationshipAnniversaries(ctx)
	if err != nil {
		return 0, err
	}

	if len(anniversaries) == 0 {
		return 0, nil
	}

	// 使用最早的恋爱纪念日作为开始日期
	earliestDate := anniversaries[0].Date
	for _, ann := range anniversaries {
		if ann.Date.Before(earliestDate) {
			earliestDate = ann.Date
		}
	}

	// 计算天数
	days := DaysTogether(earliestDate)
	return days, nil
}

// GetAnniversaryInfo - 获取纪念日详细信息（包含倒计时和周年数）
func (s *AnniversaryService) GetAnniversaryInfo(ctx context.Context, id string) (map[string]interface{}, error) {
	anniversary, err := s.repo.GetAnniversaryByID(ctx, id)
	if err != nil {
		return nil, ErrAnniversaryNotFound
	}

	now := time.Now()
	nextDate := s.getNextOccurrence(anniversary.Date, now)
	daysUntil := DaysUntil(nextDate)
	
	// 计算周年数
	years := nextDate.Year() - anniversary.Year
	
	// 如果是生日，计算年龄
	age := 0
	if anniversary.Type == models.AnniversaryTypeBirthday {
		age = nextDate.Year() - anniversary.Year
	}

	info := map[string]interface{}{
		"id":           anniversary.ID,
		"name":         anniversary.Name,
		"icon":         anniversary.Icon,
		"type":         anniversary.Type,
		"date":         anniversary.Date,
		"year":         anniversary.Year,
		"isLunar":      anniversary.IsLunar,
		"notes":        anniversary.Notes,
		"nextDate":     nextDate,
		"daysUntil":    daysUntil,
		"years":        years,
		"age":          age,
	}

	return info, nil
}

// getNextOccurrence - 计算下一个纪念日日期
func (s *AnniversaryService) getNextOccurrence(anniversaryDate, now time.Time) time.Time {
	nextDate := time.Date(now.Year(), anniversaryDate.Month(), anniversaryDate.Day(), 0, 0, 0, 0, anniversaryDate.Location())
	
	// 如果今年的日期已过，移到明年
	if nextDate.Before(now) {
		nextDate = nextDate.AddDate(1, 0, 0)
	}
	
	return nextDate
}

// GetAnniversariesByType - 获取指定类型的纪念日
func (s *AnniversaryService) GetAnniversariesByType(ctx context.Context, anniversaryType models.AnniversaryType) ([]models.Anniversary, error) {
	return s.repo.GetAnniversariesByType(ctx, anniversaryType)
}

// isValidAnniversaryType - 验证纪念日类型
func isValidAnniversaryType(anniversaryType models.AnniversaryType) bool {
	return anniversaryType == models.AnniversaryTypeFestival ||
		anniversaryType == models.AnniversaryTypeBirthday ||
		anniversaryType == models.AnniversaryTypeRelationship ||
		anniversaryType == models.AnniversaryTypeOther
}

// ParseReminderDays - 解析提醒天数 JSON 字符串
func ParseReminderDays(reminderDaysStr string) ([]int, error) {
	if reminderDaysStr == "" {
		return []int{7, 3, 1}, nil
	}

	var reminderDays []int
	err := json.Unmarshal([]byte(reminderDaysStr), &reminderDays)
	if err != nil {
		// If parsing fails, return default
		return []int{7, 3, 1}, nil
	}
	return reminderDays, nil
}

// FormatReminderDays - 格式化提醒天数为 JSON 字符串
func FormatReminderDays(reminderDays []int) (string, error) {
	data, err := json.Marshal(reminderDays)
	if err != nil {
		return "", fmt.Errorf("failed to marshal reminder days: %w", err)
	}
	return string(data), nil
}

// DaysTogether - 计算在一起天数
// 从开始日期到现在经过了多少天
func DaysTogether(startDate time.Time) int {
	now := time.Now()
	duration := now.Sub(startDate)
	return int(duration.Hours() / 24)
}

// DaysUntil - 计算距离目标日期还有多少天
func DaysUntil(targetDate time.Time) int {
	now := time.Now()
	duration := targetDate.Sub(now)
	days := int(duration.Hours() / 24)
	if days < 0 {
		return 0 // 已过期
	}
	return days
}

// GetAnniversaryProgress - 获取纪念日进度（用于进度条显示）
// 返回当前年在纪念日周期中的进度（0-100）
func GetAnniversaryProgress(anniversaryDate time.Time) float64 {
	now := time.Now()
	
	// 计算今年的纪念日日期
	thisYearDate := time.Date(now.Year(), anniversaryDate.Month(), anniversaryDate.Day(), 0, 0, 0, 0, anniversaryDate.Location())
	lastYearDate := thisYearDate.AddDate(-1, 0, 0)
	nextYearDate := thisYearDate.AddDate(1, 0, 0)
	
	// 确定当前周期的开始和结束
	var periodStart, periodEnd time.Time
	if now.Before(thisYearDate) {
		periodStart = lastYearDate
		periodEnd = thisYearDate
	} else {
		periodStart = thisYearDate
		periodEnd = nextYearDate
	}
	
	// 计算进度
	totalDuration := periodEnd.Sub(periodStart)
	elapsedDuration := now.Sub(periodStart)
	
	progress := (elapsedDuration.Hours() / totalDuration.Hours()) * 100
	if progress > 100 {
		progress = 100
	}
	if progress < 0 {
		progress = 0
	}
	
	return progress
}
