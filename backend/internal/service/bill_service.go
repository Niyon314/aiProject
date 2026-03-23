package service

import (
	"context"
	"errors"
	"time"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/repository"
	"couple-home/backend/pkg/utils"
)

var (
	ErrInvalidRating = errors.New("rating must be between 1 and 5")
	ErrInsufficientFunds = errors.New("insufficient funds")
)

// BillService - 账单业务逻辑层
type BillService struct {
	billRepo *repository.BillRepository
	fundRepo *repository.FundRepository
}

func NewBillService(billRepo *repository.BillRepository, fundRepo *repository.FundRepository) *BillService {
	return &BillService{
		billRepo: billRepo,
		fundRepo: fundRepo,
	}
}

func (s *BillService) GetAllBills(ctx context.Context) ([]models.Bill, error) {
	return s.billRepo.GetAll(ctx)
}

func (s *BillService) GetBill(ctx context.Context, id string) (*models.Bill, error) {
	return s.billRepo.GetByID(ctx, id)
}

func (s *BillService) CreateBill(ctx context.Context, bill *models.Bill) error {
	bill.ID = utils.GenerateID()
	bill.CreatedAt = time.Now()
	return s.billRepo.Create(ctx, bill)
}

func (s *BillService) UpdateBill(ctx context.Context, bill *models.Bill) error {
	bill.UpdatedAt = time.Now()
	return s.billRepo.Update(ctx, bill)
}

func (s *BillService) DeleteBill(ctx context.Context, id string) error {
	return s.billRepo.Delete(ctx, id)
}

func (s *BillService) GetStats(ctx context.Context) (map[string]interface{}, error) {
	stats, err := s.billRepo.GetStats(ctx)
	if err != nil {
		return nil, err
	}

	total := stats["total"]
	userTotal := stats["user_total"]
	partnerTotal := stats["partner_total"]
	sharedTotal := stats["shared_total"]

	// Calculate contribution percentages
	var userPercent, partnerPercent float64
	if total > 0 {
		userPercent = (userTotal / total) * 100
		partnerPercent = (partnerTotal / total) * 100
	}

	return map[string]interface{}{
		"total":              total,
		"user_total":         userTotal,
		"partner_total":      partnerTotal,
		"user_percentage":    userPercent,
		"partner_percentage": partnerPercent,
		"shared_total":       sharedTotal,
	}, nil
}

func (s *BillService) GetMonthlyStats(ctx context.Context, year, month int) (map[string]interface{}, error) {
	stats, err := s.billRepo.GetMonthlyStats(ctx, year, month)
	if err != nil {
		return nil, err
	}
	// Convert map[string]float64 to map[string]interface{}
	result := make(map[string]interface{})
	for k, v := range stats {
		result[k] = v
	}
	return result, nil
}

// GetBillsByDateRange - 获取指定日期范围的账单
func (s *BillService) GetBillsByDateRange(ctx context.Context, start, end time.Time) ([]models.Bill, error) {
	return s.billRepo.GetByDateRange(ctx, start, end)
}
