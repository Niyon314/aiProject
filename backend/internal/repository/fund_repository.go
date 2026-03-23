package repository

import (
	"context"

	"couple-home/backend/internal/models"
	"gorm.io/gorm"
)

// FundRepository - 基金数据访问层
type FundRepository struct {
	db *gorm.DB
}

func NewFundRepository(db *gorm.DB) *FundRepository {
	return &FundRepository{db: db}
}

func (r *FundRepository) GetAll(ctx context.Context) ([]models.CommonFund, error) {
	var funds []models.CommonFund
	err := r.db.WithContext(ctx).Order("created_at DESC").Find(&funds).Error
	return funds, err
}

func (r *FundRepository) GetByID(ctx context.Context, id string) (*models.CommonFund, error) {
	var fund models.CommonFund
	err := r.db.WithContext(ctx).First(&fund, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &fund, nil
}

func (r *FundRepository) Create(ctx context.Context, fund *models.CommonFund) error {
	return r.db.WithContext(ctx).Create(fund).Error
}

func (r *FundRepository) Update(ctx context.Context, fund *models.CommonFund) error {
	return r.db.WithContext(ctx).Save(fund).Error
}

func (r *FundRepository) UpdateAmount(ctx context.Context, id string, amount float64) error {
	return r.db.WithContext(ctx).
		Model(&models.CommonFund{}).
		Where("id = ?", id).
		Update("current_amount", amount).Error
}

func (r *FundRepository) CreateContribution(ctx context.Context, contribution *models.FundContribution) error {
	return r.db.WithContext(ctx).Create(contribution).Error
}

func (r *FundRepository) GetContributions(ctx context.Context, fundID string) ([]models.FundContribution, error) {
	var contributions []models.FundContribution
	err := r.db.WithContext(ctx).Where("fund_id = ?", fundID).Order("created_at DESC").Find(&contributions).Error
	return contributions, err
}
