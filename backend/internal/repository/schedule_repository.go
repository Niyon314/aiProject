package repository

import (
	"context"
	"time"

	"couple-home/backend/internal/models"
	"gorm.io/gorm"
)

// ScheduleRepository - 日程数据访问层
type ScheduleRepository struct {
	db *gorm.DB
}

// NewScheduleRepository - 创建日程仓库
func NewScheduleRepository(db *gorm.DB) *ScheduleRepository {
	return &ScheduleRepository{db: db}
}

// GetSchedules - 获取日程列表
// 支持按状态、类型、日期范围筛选
func (r *ScheduleRepository) GetSchedules(ctx context.Context, status *models.ScheduleStatus, scheduleType *models.ScheduleType, startDate, endDate *time.Time) ([]models.Schedule, error) {
	var schedules []models.Schedule
	query := r.db.WithContext(ctx)

	if status != nil {
		query = query.Where("status = ?", *status)
	}
	if scheduleType != nil {
		query = query.Where("type = ?", *scheduleType)
	}
	if startDate != nil {
		query = query.Where("start_time >= ?", *startDate)
	}
	if endDate != nil {
		query = query.Where("start_time <= ?", *endDate)
	}

	err := query.Order("start_time ASC, created_at ASC").Find(&schedules).Error
	return schedules, err
}

// GetScheduleByID - 根据 ID 获取日程
func (r *ScheduleRepository) GetScheduleByID(ctx context.Context, id string) (*models.Schedule, error) {
	var schedule models.Schedule
	err := r.db.WithContext(ctx).First(&schedule, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &schedule, nil
}

// CreateSchedule - 创建日程
func (r *ScheduleRepository) CreateSchedule(ctx context.Context, schedule *models.Schedule) error {
	return r.db.WithContext(ctx).Create(schedule).Error
}

// UpdateSchedule - 更新日程
func (r *ScheduleRepository) UpdateSchedule(ctx context.Context, schedule *models.Schedule) error {
	return r.db.WithContext(ctx).Save(schedule).Error
}

// DeleteSchedule - 删除日程（软删除）
func (r *ScheduleRepository) DeleteSchedule(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Schedule{}, "id = ?", id).Error
}

// GetUpcomingSchedules - 获取即将开始的日程
// 返回从今天开始的未来 N 天内的日程
func (r *ScheduleRepository) GetUpcomingSchedules(ctx context.Context, days int) ([]models.Schedule, error) {
	var schedules []models.Schedule
	now := time.Now()
	endDate := now.AddDate(0, 0, days)

	err := r.db.WithContext(ctx).
		Where("start_time >= ? AND start_time <= ? AND status = ?", now, endDate, models.ScheduleStatusPlanned).
		Order("start_time ASC").
		Find(&schedules).Error
	return schedules, err
}

// GetSchedulesByDate - 获取指定日期的日程
func (r *ScheduleRepository) GetSchedulesByDate(ctx context.Context, date time.Time) ([]models.Schedule, error) {
	var schedules []models.Schedule
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.AddDate(0, 0, 1)

	err := r.db.WithContext(ctx).
		Where("start_time >= ? AND start_time < ? AND status = ?", startOfDay, endOfDay, models.ScheduleStatusPlanned).
		Order("start_time ASC").
		Find(&schedules).Error
	return schedules, err
}

// GetSchedulesByParticipant - 获取参与者的日程
func (r *ScheduleRepository) GetSchedulesByParticipant(ctx context.Context, participant string) ([]models.Schedule, error) {
	var schedules []models.Schedule
	// Search for participant in JSON array string
	err := r.db.WithContext(ctx).
		Where("participants LIKE ? AND status = ?", "%"+participant+"%", models.ScheduleStatusPlanned).
		Order("start_time ASC").
		Find(&schedules).Error
	return schedules, err
}

// GetSchedulesByType - 获取指定类型的日程
func (r *ScheduleRepository) GetSchedulesByType(ctx context.Context, scheduleType models.ScheduleType) ([]models.Schedule, error) {
	var schedules []models.Schedule
	err := r.db.WithContext(ctx).
		Where("type = ? AND status = ?", scheduleType, models.ScheduleStatusPlanned).
		Order("start_time ASC").
		Find(&schedules).Error
	return schedules, err
}

// GetSchedulesInDateRange - 获取日期范围内的日程
func (r *ScheduleRepository) GetSchedulesInDateRange(ctx context.Context, start, end time.Time) ([]models.Schedule, error) {
	var schedules []models.Schedule
	err := r.db.WithContext(ctx).
		Where("start_time >= ? AND start_time <= ?", start, end).
		Order("start_time ASC").
		Find(&schedules).Error
	return schedules, err
}

// UpdateScheduleStatus - 更新日程状态
func (r *ScheduleRepository) UpdateScheduleStatus(ctx context.Context, id string, status models.ScheduleStatus) error {
	return r.db.WithContext(ctx).
		Model(&models.Schedule{}).
		Where("id = ?", id).
		Update("status", status).Error
}

// GetDB - 获取数据库实例（用于复杂查询）
func (r *ScheduleRepository) GetDB() *gorm.DB {
	return r.db
}
