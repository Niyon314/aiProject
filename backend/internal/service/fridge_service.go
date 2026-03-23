package service

import (
	"context"
	"time"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/repository"
	"couple-home/backend/pkg/utils"
)

// FridgeService - 冰箱业务逻辑层
type FridgeService struct {
	repo *repository.FridgeRepository
}

func NewFridgeService(repo *repository.FridgeRepository) *FridgeService {
	return &FridgeService{repo: repo}
}

func (s *FridgeService) GetAllItems(ctx context.Context) ([]models.FridgeItem, error) {
	return s.repo.GetAll(ctx)
}

func (s *FridgeService) GetItem(ctx context.Context, id string) (*models.FridgeItem, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *FridgeService) AddItem(ctx context.Context, item *models.FridgeItem) error {
	item.ID = utils.GenerateID()
	item.AddedAt = time.Now()
	return s.repo.Create(ctx, item)
}

func (s *FridgeService) UpdateItem(ctx context.Context, item *models.FridgeItem) error {
	return s.repo.Update(ctx, item)
}

func (s *FridgeService) DeleteItem(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *FridgeService) GetExpiringItems(ctx context.Context, days int) ([]models.FridgeItem, error) {
	return s.repo.GetExpiring(ctx, days)
}

func (s *FridgeService) GetItemsByCategory(ctx context.Context, category string) ([]models.FridgeItem, error) {
	return s.repo.GetByCategory(ctx, category)
}

// CheckExpiryStatus - 检查食材是否临期
func (s *FridgeService) CheckExpiryStatus(item *models.FridgeItem) string {
	if item.ExpiryDate == nil {
		return "unknown"
	}
	
	now := time.Now()
	daysUntilExpiry := int(item.ExpiryDate.Sub(now).Hours() / 24)
	
	if daysUntilExpiry < 0 {
		return "expired"
	} else if daysUntilExpiry <= 2 {
		return "urgent"
	} else if daysUntilExpiry <= 7 {
		return "soon"
	}
	return "fresh"
}
