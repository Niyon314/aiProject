package repository

import (
	"context"
	"time"

	"couple-home/backend/internal/models"
	"gorm.io/gorm"
)

// BillRepository - 账单数据访问层
type BillRepository struct {
	db *gorm.DB
}

func NewBillRepository(db *gorm.DB) *BillRepository {
	return &BillRepository{db: db}
}

func (r *BillRepository) GetAll(ctx context.Context) ([]models.Bill, error) {
	var bills []models.Bill
	err := r.db.WithContext(ctx).Order("date DESC, created_at DESC").Find(&bills).Error
	return bills, err
}

func (r *BillRepository) GetByID(ctx context.Context, id string) (*models.Bill, error) {
	var bill models.Bill
	err := r.db.WithContext(ctx).First(&bill, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &bill, nil
}

func (r *BillRepository) Create(ctx context.Context, bill *models.Bill) error {
	return r.db.WithContext(ctx).Create(bill).Error
}

func (r *BillRepository) Update(ctx context.Context, bill *models.Bill) error {
	return r.db.WithContext(ctx).Save(bill).Error
}

func (r *BillRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Bill{}, "id = ?", id).Error
}

func (r *BillRepository) GetByDateRange(ctx context.Context, start, end time.Time) ([]models.Bill, error) {
	var bills []models.Bill
	err := r.db.WithContext(ctx).
		Where("date BETWEEN ? AND ?", start, end).
		Order("date DESC").
		Find(&bills).Error
	return bills, err
}

func (r *BillRepository) GetByPayer(ctx context.Context, payer string) ([]models.Bill, error) {
	var bills []models.Bill
	err := r.db.WithContext(ctx).Where("payer = ?", payer).Order("date DESC").Find(&bills).Error
	return bills, err
}

func (r *BillRepository) GetStats(ctx context.Context) (map[string]float64, error) {
	stats := make(map[string]float64)
	
	// Total amount
	var total float64
	err := r.db.WithContext(ctx).Model(&models.Bill{}).Select("COALESCE(SUM(amount), 0)").Scan(&total).Error
	if err != nil {
		return nil, err
	}
	stats["total"] = total
	
	// Amount by payer
	var userTotal, partnerTotal float64
	r.db.WithContext(ctx).Model(&models.Bill{}).Where("payer = ?", "user").Select("COALESCE(SUM(amount), 0)").Scan(&userTotal)
	r.db.WithContext(ctx).Model(&models.Bill{}).Where("payer = ?", "partner").Select("COALESCE(SUM(amount), 0)").Scan(&partnerTotal)
	stats["user_total"] = userTotal
	stats["partner_total"] = partnerTotal
	
	// Shared amount
	var sharedTotal float64
	r.db.WithContext(ctx).Model(&models.Bill{}).Where("is_shared = ?", true).Select("COALESCE(SUM(amount), 0)").Scan(&sharedTotal)
	stats["shared_total"] = sharedTotal
	
	return stats, nil
}

func (r *BillRepository) GetMonthlyStats(ctx context.Context, year, month int) (map[string]float64, error) {
	stats := make(map[string]float64)
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.Local)
	endDate := startDate.AddDate(0, 1, 0)
	
	var total float64
	err := r.db.WithContext(ctx).
		Model(&models.Bill{}).
		Where("date >= ? AND date < ?", startDate, endDate).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total).Error
	if err != nil {
		return nil, err
	}
	stats["monthly_total"] = total
	
	return stats, nil
}
