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
	ErrScheduleNotFound     = errors.New("schedule not found")
	ErrInvalidScheduleType  = errors.New("invalid schedule type")
	ErrInvalidStatus        = errors.New("invalid status")
	ErrInvalidReminder      = errors.New("invalid reminder type")
	ErrInvalidTimeRange     = errors.New("end time must be after start time")
)

// ScheduleService - 日程业务逻辑层
type ScheduleService struct {
	repo *repository.ScheduleRepository
}

// NewScheduleService - 创建日程服务
func NewScheduleService(repo *repository.ScheduleRepository) *ScheduleService {
	return &ScheduleService{repo: repo}
}

// GetSchedules - 获取日程列表
func (s *ScheduleService) GetSchedules(ctx context.Context, status *models.ScheduleStatus, scheduleType *models.ScheduleType, startDate, endDate *time.Time) ([]models.Schedule, error) {
	return s.repo.GetSchedules(ctx, status, scheduleType, startDate, endDate)
}

// GetScheduleByID - 根据 ID 获取日程
func (s *ScheduleService) GetScheduleByID(ctx context.Context, id string) (*models.Schedule, error) {
	schedule, err := s.repo.GetScheduleByID(ctx, id)
	if err != nil {
		return nil, ErrScheduleNotFound
	}
	return schedule, nil
}

// CreateSchedule - 创建日程
func (s *ScheduleService) CreateSchedule(ctx context.Context, schedule *models.Schedule) error {
	// 验证日程类型
	if !isValidScheduleType(schedule.Type) {
		return ErrInvalidScheduleType
	}

	// 验证状态
	if schedule.Status == "" {
		schedule.Status = models.ScheduleStatusPlanned
	} else if !isValidScheduleStatus(schedule.Status) {
		return ErrInvalidStatus
	}

	// 验证提醒类型
	if schedule.Reminder == "" {
		schedule.Reminder = models.ReminderTypeNone
	} else if !isValidReminderType(schedule.Reminder) {
		return ErrInvalidReminder
	}

	// 验证时间范围
	if schedule.EndTime.Before(schedule.StartTime) || schedule.EndTime.Equal(schedule.StartTime) {
		return ErrInvalidTimeRange
	}

	// 生成 ID
	schedule.ID = utils.GenerateID()

	// 设置默认参与者
	if schedule.Participants == "" {
		schedule.Participants = `["user", "partner"]`
	}

	return s.repo.CreateSchedule(ctx, schedule)
}

// UpdateSchedule - 更新日程
func (s *ScheduleService) UpdateSchedule(ctx context.Context, schedule *models.Schedule) error {
	// 验证日程是否存在
	_, err := s.repo.GetScheduleByID(ctx, schedule.ID)
	if err != nil {
		return ErrScheduleNotFound
	}

	// 验证日程类型
	if !isValidScheduleType(schedule.Type) {
		return ErrInvalidScheduleType
	}

	// 验证状态
	if !isValidScheduleStatus(schedule.Status) {
		return ErrInvalidStatus
	}

	// 验证提醒类型
	if !isValidReminderType(schedule.Reminder) {
		return ErrInvalidReminder
	}

	// 验证时间范围
	if schedule.EndTime.Before(schedule.StartTime) || schedule.EndTime.Equal(schedule.StartTime) {
		return ErrInvalidTimeRange
	}

	return s.repo.UpdateSchedule(ctx, schedule)
}

// DeleteSchedule - 删除日程
func (s *ScheduleService) DeleteSchedule(ctx context.Context, id string) error {
	// 验证日程是否存在
	_, err := s.repo.GetScheduleByID(ctx, id)
	if err != nil {
		return ErrScheduleNotFound
	}

	return s.repo.DeleteSchedule(ctx, id)
}

// GetUpcomingSchedules - 获取即将开始的日程
func (s *ScheduleService) GetUpcomingSchedules(ctx context.Context, days int) ([]models.Schedule, error) {
	if days <= 0 {
		days = 7 // default to 7 days
	}
	return s.repo.GetUpcomingSchedules(ctx, days)
}

// GetSchedulesByDate - 获取指定日期的日程
func (s *ScheduleService) GetSchedulesByDate(ctx context.Context, date time.Time) ([]models.Schedule, error) {
	return s.repo.GetSchedulesByDate(ctx, date)
}

// UpdateScheduleStatus - 更新日程状态
func (s *ScheduleService) UpdateScheduleStatus(ctx context.Context, id string, status models.ScheduleStatus) error {
	// 验证状态
	if !isValidScheduleStatus(status) {
		return ErrInvalidStatus
	}

	// 验证日程是否存在
	_, err := s.repo.GetScheduleByID(ctx, id)
	if err != nil {
		return ErrScheduleNotFound
	}

	return s.repo.UpdateScheduleStatus(ctx, id, status)
}

// GetSchedulesInDateRange - 获取日期范围内的日程
func (s *ScheduleService) GetSchedulesInDateRange(ctx context.Context, start, end time.Time) ([]models.Schedule, error) {
	return s.repo.GetSchedulesInDateRange(ctx, start, end)
}

// isValidScheduleType - 验证日程类型
func isValidScheduleType(scheduleType models.ScheduleType) bool {
	return scheduleType == models.ScheduleTypeDate ||
		scheduleType == models.ScheduleTypeWork ||
		scheduleType == models.ScheduleTypeFamily ||
		scheduleType == models.ScheduleTypeFriend ||
		scheduleType == models.ScheduleTypeOther
}

// isValidScheduleStatus - 验证日程状态
func isValidScheduleStatus(status models.ScheduleStatus) bool {
	return status == models.ScheduleStatusPlanned ||
		status == models.ScheduleStatusCompleted ||
		status == models.ScheduleStatusCancelled
}

// isValidReminderType - 验证提醒类型
func isValidReminderType(reminder models.ReminderType) bool {
	return reminder == models.ReminderTypeNone ||
		reminder == models.ReminderType1h ||
		reminder == models.ReminderType1d ||
		reminder == models.ReminderType1w
}

// ParseParticipants - 解析参与者 JSON 字符串
func ParseParticipants(participantsStr string) ([]string, error) {
	if participantsStr == "" {
		return []string{}, nil
	}

	var participants []string
	err := json.Unmarshal([]byte(participantsStr), &participants)
	if err != nil {
		// If parsing fails, return default
		return []string{"user", "partner"}, nil
	}
	return participants, nil
}

// FormatParticipants - 格式化参与者为 JSON 字符串
func FormatParticipants(participants []string) (string, error) {
	data, err := json.Marshal(participants)
	if err != nil {
		return "", fmt.Errorf("failed to marshal participants: %w", err)
	}
	return string(data), nil
}
