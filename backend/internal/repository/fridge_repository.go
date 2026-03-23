package repository

import (
	"context"
	"time"

	"couple-home/backend/internal/models"
	"gorm.io/gorm"
)

// FridgeRepository - 冰箱数据访问层
type FridgeRepository struct {
	db *gorm.DB
}

func NewFridgeRepository(db *gorm.DB) *FridgeRepository {
	return &FridgeRepository{db: db}
}

func (r *FridgeRepository) GetAll(ctx context.Context) ([]models.FridgeItem, error) {
	var items []models.FridgeItem
	err := r.db.WithContext(ctx).Order("added_at DESC").Find(&items).Error
	return items, err
}

func (r *FridgeRepository) GetByID(ctx context.Context, id string) (*models.FridgeItem, error) {
	var item models.FridgeItem
	err := r.db.WithContext(ctx).First(&item, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *FridgeRepository) Create(ctx context.Context, item *models.FridgeItem) error {
	return r.db.WithContext(ctx).Create(item).Error
}

func (r *FridgeRepository) Update(ctx context.Context, item *models.FridgeItem) error {
	return r.db.WithContext(ctx).Save(item).Error
}

func (r *FridgeRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.FridgeItem{}, "id = ?", id).Error
}

func (r *FridgeRepository) GetExpiring(ctx context.Context, days int) ([]models.FridgeItem, error) {
	var items []models.FridgeItem
	expiryThreshold := time.Now().AddDate(0, 0, days)
	err := r.db.WithContext(ctx).
		Where("expiry_date IS NOT NULL AND expiry_date <= ?", expiryThreshold).
		Order("expiry_date ASC").
		Find(&items).Error
	return items, err
}

func (r *FridgeRepository) GetByCategory(ctx context.Context, category string) ([]models.FridgeItem, error) {
	var items []models.FridgeItem
	err := r.db.WithContext(ctx).Where("category = ?", category).Find(&items).Error
	return items, err
}
