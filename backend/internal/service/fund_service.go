package service

import (
	"context"
	"time"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/repository"
)

// FundService - 基金业务逻辑层
type FundService struct {
	fundRepo *repository.FundRepository
}

func NewFundService(fundRepo *repository.FundRepository) *FundService {
	return &FundService{fundRepo: fundRepo}
}

func (s *FundService) GetAllFunds(ctx context.Context) ([]models.CommonFund, error) {
	return s.fundRepo.GetAll(ctx)
}

func (s *FundService) GetFund(ctx context.Context, id string) (*models.CommonFund, error) {
	return s.fundRepo.GetByID(ctx, id)
}

func (s *FundService) CreateFund(ctx context.Context, fund *models.CommonFund) error {
	fund.ID = generateID()
	fund.CreatedAt = time.Now()
	return s.fundRepo.Create(ctx, fund)
}

func (s *FundService) UpdateFund(ctx context.Context, fund *models.CommonFund) error {
	fund.UpdatedAt = time.Now()
	return s.fundRepo.Update(ctx, fund)
}

// ContributeToFund - 存入基金
func (s *FundService) ContributeToFund(ctx context.Context, fundID, contributor string, amount float64, note *string) error {
	fund, err := s.fundRepo.GetByID(ctx, fundID)
	if err != nil {
		return err
	}

	// Create contribution record
	contribution := &models.FundContribution{
		ID:          generateID(),
		FundID:      fundID,
		Amount:      amount,
		Contributor: contributor,
		Note:        note,
		CreatedAt:   time.Now(),
	}

	if err := s.fundRepo.CreateContribution(ctx, contribution); err != nil {
		return err
	}

	// Update fund total
	newTotal := fund.CurrentAmount + amount
	return s.fundRepo.UpdateAmount(ctx, fundID, newTotal)
}

// GetFundContributions - 获取基金存入记录
func (s *FundService) GetFundContributions(ctx context.Context, fundID string) ([]models.FundContribution, error) {
	return s.fundRepo.GetContributions(ctx, fundID)
}

// GetFundProgress - 获取基金进度
func (s *FundService) GetFundProgress(ctx context.Context, fundID string) (map[string]interface{}, error) {
	fund, err := s.fundRepo.GetByID(ctx, fundID)
	if err != nil {
		return nil, err
	}

	progress := 0.0
	if fund.TargetAmount > 0 {
		progress = (fund.CurrentAmount / fund.TargetAmount) * 100
	}

	monthlyProgress := 0.0
	if fund.MonthlyGoal > 0 {
		monthlyProgress = (fund.CurrentAmount / fund.MonthlyGoal) * 100
	}

	return map[string]interface{}{
		"fund":             fund,
		"progress_percent": progress,
		"remaining":        fund.TargetAmount - fund.CurrentAmount,
		"monthly_progress": monthlyProgress,
	}, nil
}
