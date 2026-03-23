package repository

import (
	"context"
	"time"

	"couple-home/backend/internal/models"
	"gorm.io/gorm"
)

// AnniversaryRepository - 纪念日数据访问层
type AnniversaryRepository struct {
	db *gorm.DB
}

// NewAnniversaryRepository - 创建纪念日仓库
func NewAnniversaryRepository(db *gorm.DB) *AnniversaryRepository {
	return &AnniversaryRepository{db: db}
}

// GetAnniversaries - 获取纪念日列表
// 支持按类型筛选
func (r *AnniversaryRepository) GetAnniversaries(ctx context.Context, anniversaryType *models.AnniversaryType) ([]models.Anniversary, error) {
	var anniversaries []models.Anniversary
	query := r.db.WithContext(ctx)

	if anniversaryType != nil {
		query = query.Where("type = ?", *anniversaryType)
	}

	err := query.Order("date ASC, created_at ASC").Find(&anniversaries).Error
	return anniversaries, err
}

// GetAnniversaryByID - 根据 ID 获取纪念日
func (r *AnniversaryRepository) GetAnniversaryByID(ctx context.Context, id string) (*models.Anniversary, error) {
	var anniversary models.Anniversary
	err := r.db.WithContext(ctx).First(&anniversary, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &anniversary, nil
}

// CreateAnniversary - 创建纪念日
func (r *AnniversaryRepository) CreateAnniversary(ctx context.Context, anniversary *models.Anniversary) error {
	return r.db.WithContext(ctx).Create(anniversary).Error
}

// UpdateAnniversary - 更新纪念日
func (r *AnniversaryRepository) UpdateAnniversary(ctx context.Context, anniversary *models.Anniversary) error {
	return r.db.WithContext(ctx).Save(anniversary).Error
}

// DeleteAnniversary - 删除纪念日（软删除）
func (r *AnniversaryRepository) DeleteAnniversary(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Anniversary{}, "id = ?", id).Error
}

// GetUpcomingAnniversaries - 获取即将到来的纪念日
// 返回未来 N 天内的纪念日
func (r *AnniversaryRepository) GetUpcomingAnniversaries(ctx context.Context, days int) ([]models.Anniversary, error) {
	var anniversaries []models.Anniversary
	now := time.Now()
	
	// Get all anniversaries and filter by upcoming date
	err := r.db.WithContext(ctx).
		Where("deleted_at IS NULL").
		Order("date ASC").
		Find(&anniversaries).Error
	
	if err != nil {
		return nil, err
	}

	// Filter upcoming anniversaries in Go (considering yearly recurrence)
	upcoming := make([]models.Anniversary, 0)
	for _, ann := range anniversaries {
		nextDate := r.getNextOccurrence(ann.Date, now)
		daysUntil := int(nextDate.Sub(now).Hours() / 24)
		
		if daysUntil >= 0 && daysUntil <= days {
			upcoming = append(upcoming, ann)
		}
	}

	return upcoming, nil
}

// getNextOccurrence - 计算下一个纪念日日期（考虑年份）
func (r *AnniversaryRepository) getNextOccurrence(anniversaryDate, now time.Time) time.Time {
	nextDate := time.Date(now.Year(), anniversaryDate.Month(), anniversaryDate.Day(), 0, 0, 0, 0, anniversaryDate.Location())
	
	// If this year's date has passed, move to next year
	if nextDate.Before(now) {
		nextDate = nextDate.AddDate(1, 0, 0)
	}
	
	return nextDate
}

// GetAnniversariesByType - 获取指定类型的纪念日
func (r *AnniversaryRepository) GetAnniversariesByType(ctx context.Context, anniversaryType models.AnniversaryType) ([]models.Anniversary, error) {
	var anniversaries []models.Anniversary
	err := r.db.WithContext(ctx).
		Where("type = ?", anniversaryType).
		Order("date ASC").
		Find(&anniversaries).Error
	return anniversaries, err
}

// GetRelationshipAnniversaries - 获取恋爱相关纪念日
func (r *AnniversaryRepository) GetRelationshipAnniversaries(ctx context.Context) ([]models.Anniversary, error) {
	var anniversaries []models.Anniversary
	err := r.db.WithContext(ctx).
		Where("type = ?", models.AnniversaryTypeRelationship).
		Order("date ASC").
		Find(&anniversaries).Error
	return anniversaries, err
}

// GetDB - 获取数据库实例（用于复杂查询）
func (r *AnniversaryRepository) GetDB() *gorm.DB {
	return r.db
}
