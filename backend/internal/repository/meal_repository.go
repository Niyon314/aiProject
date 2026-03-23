package repository

import (
	"context"
	"time"

	"couple-home/backend/internal/models"
	"gorm.io/gorm"
)

// MealRepository - 吃饭投票数据访问层
type MealRepository struct {
	db *gorm.DB
}

func NewMealRepository(db *gorm.DB) *MealRepository {
	return &MealRepository{db: db}
}

// GetTodayVote - 获取今日投票
// 根据日期和餐食类型获取今天的投票记录
func (r *MealRepository) GetTodayVote(ctx context.Context, date string, mealType string) (*models.MealVote, error) {
	var vote models.MealVote
	err := r.db.WithContext(ctx).
		Preload("Options").
		Preload("UserVote").
		Preload("PartnerVote").
		Preload("Result").
		Where("date = ? AND meal_type = ?", date, mealType).
		First(&vote).Error
	
	if err != nil {
		return nil, err
	}
	
	return &vote, nil
}

// CreateVote - 创建投票
// 创建一个新的投票记录，包含多个选项
func (r *MealRepository) CreateVote(ctx context.Context, vote *models.MealVote) error {
	return r.db.WithContext(ctx).Create(vote).Error
}

// SubmitVote - 提交投票
// 为用户提交投票，如果已存在则更新
func (r *MealRepository) SubmitVote(ctx context.Context, userVote *models.UserVote) error {
	// 检查是否已存在该用户的投票
	existing := &models.UserVote{}
	err := r.db.WithContext(ctx).
		Where("vote_id = ? AND voter = ?", userVote.VoteID, userVote.Voter).
		First(existing).Error
	
	if err == nil {
		// 更新现有投票
		existing.OptionID = userVote.OptionID
		existing.VoteType = userVote.VoteType
		return r.db.WithContext(ctx).Save(existing).Error
	}
	
	// 创建新投票
	return r.db.WithContext(ctx).Create(userVote).Error
}

// GetVoteResult - 获取投票结果
// 获取投票的完整信息，包括所有选项和双方投票
func (r *MealRepository) GetVoteResult(ctx context.Context, voteID string) (*models.MealVote, error) {
	var vote models.MealVote
	err := r.db.WithContext(ctx).
		Preload("Options").
		Preload("UserVote").
		Preload("PartnerVote").
		Preload("Result").
		First(&vote, "id = ?", voteID).Error
	
	if err != nil {
		return nil, err
	}
	
	return &vote, nil
}

// GetVoteByID - 根据 ID 获取投票
func (r *MealRepository) GetVoteByID(ctx context.Context, voteID string) (*models.MealVote, error) {
	var vote models.MealVote
	err := r.db.WithContext(ctx).
		Preload("Options").
		First(&vote, "id = ?", voteID).Error
	
	if err != nil {
		return nil, err
	}
	
	return &vote, nil
}

// UpdateVoteStatus - 更新投票状态
func (r *MealRepository) UpdateVoteStatus(ctx context.Context, voteID string, status string) error {
	return r.db.WithContext(ctx).
		Model(&models.MealVote{}).
		Where("id = ?", voteID).
		Update("status", status).Error
}

// SetVoteResult - 设置投票结果
func (r *MealRepository) SetVoteResult(ctx context.Context, voteID string, resultID string) error {
	return r.db.WithContext(ctx).
		Model(&models.MealVote{}).
		Where("id = ?", voteID).
		Update("result_id", resultID).Error
}

// UpdateOptionCounts - 更新选项计数
func (r *MealRepository) UpdateOptionCounts(ctx context.Context, optionID string, likeCount, dislikeCount, vetoCount int) error {
	return r.db.WithContext(ctx).
		Model(&models.MealOption{}).
		Where("id = ?", optionID).
		Updates(map[string]interface{}{
			"like_count":     likeCount,
			"dislike_count":  dislikeCount,
			"veto_count":     vetoCount,
			"updated_at":     time.Now(),
		}).Error
}

// GetHistoricalVotes - 获取历史投票记录
func (r *MealRepository) GetHistoricalVotes(ctx context.Context, limit int) ([]models.MealVote, error) {
	var votes []models.MealVote
	err := r.db.WithContext(ctx).
		Preload("Result").
		Where("status = ?", "completed").
		Order("date DESC, created_at DESC").
		Limit(limit).
		Find(&votes).Error
	
	return votes, err
}

// DeleteTodayVote - 删除今日投票（用于重新创建）
func (r *MealRepository) DeleteTodayVote(ctx context.Context, date string, mealType string) error {
	return r.db.WithContext(ctx).
		Where("date = ? AND meal_type = ?", date, mealType).
		Delete(&models.MealVote{}).Error
}

// GetDB - 获取数据库实例（用于复杂查询）
func (r *MealRepository) GetDB() *gorm.DB {
	return r.db
}
