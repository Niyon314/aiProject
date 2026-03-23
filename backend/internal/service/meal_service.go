package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/repository"
	"couple-home/backend/pkg/utils"
)

// 错误定义
var (
	ErrVoteNotFound      = errors.New("vote not found")
	ErrVoteAlreadyExists = errors.New("vote already exists for today")
	ErrAlreadyVoted      = errors.New("already voted")
	ErrVoteNotCompleted  = errors.New("vote not completed yet")
	ErrInvalidMealType   = errors.New("invalid meal type, must be lunch or dinner")
	ErrNoMatchFound      = errors.New("no matching option found")
)

// MealService - 吃饭投票业务逻辑层
type MealService struct {
	repo         *repository.MealRepository
	recipeRepo   *repository.RecipeRepository
}

func NewMealService(repo *repository.MealRepository, recipeRepo *repository.RecipeRepository) *MealService {
	return &MealService{
		repo:       repo,
		recipeRepo: recipeRepo,
	}
}

// GetTodayVote - 获取今日投票
func (s *MealService) GetTodayVote(ctx context.Context, date string, mealType string) (*models.MealVote, error) {
	if !isValidMealType(mealType) {
		return nil, ErrInvalidMealType
	}

	vote, err := s.repo.GetTodayVote(ctx, date, mealType)
	if err != nil {
		return nil, ErrVoteNotFound
	}

	return vote, nil
}

// CreateTodayVote - 创建今日投票
// 从菜谱库随机选择 3-5 个选项创建投票
func (s *MealService) CreateTodayVote(ctx context.Context, date string, mealType string, optionCount int) (*models.MealVote, error) {
	if !isValidMealType(mealType) {
		return nil, ErrInvalidMealType
	}

	// 限制选项数量在 3-5 之间
	if optionCount < 3 {
		optionCount = 3
	} else if optionCount > 5 {
		optionCount = 5
	}

	// 检查是否已存在今日投票
	existing, _ := s.repo.GetTodayVote(ctx, date, mealType)
	if existing != nil {
		return existing, nil
	}

	// 从菜谱库随机获取菜谱
	recipes, err := s.recipeRepo.GetRandom(ctx, optionCount)
	if err != nil {
		return nil, fmt.Errorf("failed to get random recipes: %w", err)
	}

	// 如果菜谱数量不足，返回错误
	if len(recipes) < 3 {
		return nil, fmt.Errorf("not enough recipes in database, need at least 3")
	}

	// 创建投票记录
	vote := &models.MealVote{
		ID:       utils.GenerateID(),
		Date:     date,
		MealType: mealType,
		Status:   "pending",
		Options:  make([]models.MealOption, 0, len(recipes)),
	}

	// 将菜谱转换为投票选项
	for _, recipe := range recipes {
		option := models.MealOption{
			ID:         utils.GenerateID(),
			VoteID:     vote.ID,
			RecipeID:   recipe.ID,
			Name:       recipe.Name,
			Icon:       recipe.Icon,
			CookTime:   recipe.CookTime,
			Difficulty: recipe.Difficulty,
			Cost:       recipe.Cost,
			Tags:       recipe.Tags,
		}
		vote.Options = append(vote.Options, option)
	}

	// 保存到数据库
	if err := s.repo.CreateVote(ctx, vote); err != nil {
		return nil, fmt.Errorf("failed to create vote: %w", err)
	}

	return vote, nil
}

// SubmitVote - 提交投票
func (s *MealService) SubmitVote(ctx context.Context, voteID, voter, optionID, voteType string) (*models.MealVote, error) {
	// 验证投票类型
	if !isValidVoteType(voteType) {
		return nil, fmt.Errorf("invalid vote type, must be like, dislike, or veto")
	}

	// 获取投票记录
	vote, err := s.repo.GetVoteByID(ctx, voteID)
	if err != nil {
		return nil, ErrVoteNotFound
	}

	// 检查选项是否存在
	optionExists := false
	for _, opt := range vote.Options {
		if opt.ID == optionID {
			optionExists = true
			break
		}
	}
	if !optionExists {
		return nil, fmt.Errorf("option not found")
	}

	// 创建用户投票
	userVote := &models.UserVote{
		ID:       utils.GenerateID(),
		VoteID:   voteID,
		Voter:    voter,
		OptionID: optionID,
		VoteType: voteType,
	}

	// 提交投票
	if err := s.repo.SubmitVote(ctx, userVote); err != nil {
		return nil, fmt.Errorf("failed to submit vote: %w", err)
	}

	// 更新选项计数
	s.updateOptionCounts(ctx, voteID, optionID, voteType)

	// 检查是否双方都已投票
	bothVoted, err := s.checkBothVoted(ctx, voteID)
	if err != nil {
		return nil, err
	}

	// 如果双方都已投票，计算匹配结果
	if bothVoted {
		result, err := s.calculateMatch(ctx, vote)
		if err != nil {
			return nil, err
		}

		// 更新投票状态和结果
		if result != nil {
			if err := s.repo.SetVoteResult(ctx, voteID, result.ID); err != nil {
				return nil, err
			}
			if err := s.repo.UpdateVoteStatus(ctx, voteID, "completed"); err != nil {
				return nil, err
			}
			vote.ResultID = &result.ID
			vote.Result = result
			vote.Status = "completed"
		} else {
			if err := s.repo.UpdateVoteStatus(ctx, voteID, "voted"); err != nil {
				return nil, err
			}
			vote.Status = "voted"
		}
	} else {
		if err := s.repo.UpdateVoteStatus(ctx, voteID, "voted"); err != nil {
			return nil, err
		}
		vote.Status = "voted"
	}

	// 重新加载投票数据
	vote, err = s.repo.GetVoteResult(ctx, voteID)
	if err != nil {
		return nil, err
	}

	return vote, nil
}

// GetVoteResult - 获取投票结果
func (s *MealService) GetVoteResult(ctx context.Context, voteID string) (*models.MealVote, error) {
	vote, err := s.repo.GetVoteResult(ctx, voteID)
	if err != nil {
		return nil, ErrVoteNotFound
	}

	return vote, nil
}

// updateOptionCounts - 更新选项计数
func (s *MealService) updateOptionCounts(ctx context.Context, voteID, optionID, voteType string) {
	// 统计各类型投票数
	likeCount := 0
	dislikeCount := 0
	vetoCount := 0

	// 这里简化处理，实际应该查询数据库统计
	// 由于我们刚提交了一票，直接更新计数
	switch voteType {
	case "like":
		likeCount = 1
	case "dislike":
		dislikeCount = 1
	case "veto":
		vetoCount = 1
	}

	s.repo.UpdateOptionCounts(ctx, optionID, likeCount, dislikeCount, vetoCount)
}

// checkBothVoted - 检查双方是否都已投票
func (s *MealService) checkBothVoted(ctx context.Context, voteID string) (bool, error) {
	// 查询该投票的所有用户投票记录
	var userVotes []models.UserVote
	err := s.repo.GetDB().WithContext(ctx).
		Where("vote_id = ?", voteID).
		Find(&userVotes).Error
	
	if err != nil {
		return false, err
	}

	// 检查是否有 user 和 partner 的投票
	hasUser := false
	hasPartner := false

	for _, uv := range userVotes {
		if uv.Voter == "user" {
			hasUser = true
		} else if uv.Voter == "partner" {
			hasPartner = true
		}
	}

	return hasUser && hasPartner, nil
}

// calculateMatch - 计算匹配结果
// 匹配规则：
// 1. 双方 Like 同一选项 → 直接匹配 ✅
// 2. 一方 Like，一方 Dislike → 不匹配
// 3. 任意一方 Veto → 该选项淘汰 ❌
// 4. 无共同 Like → 推荐双方都不反对的最高分选项
func (s *MealService) calculateMatch(ctx context.Context, vote *models.MealVote) (*models.MealOption, error) {
	// 获取双方投票
	userVote := vote.UserVote
	partnerVote := vote.PartnerVote

	if userVote == nil || partnerVote == nil {
		return nil, nil
	}

	// 规则 1: 双方 Like 同一选项 → 直接匹配
	if userVote.VoteType == "like" && partnerVote.VoteType == "like" {
		if userVote.OptionID == partnerVote.OptionID {
			// 找到该选项
			for i := range vote.Options {
				if vote.Options[i].ID == userVote.OptionID {
					return &vote.Options[i], nil
				}
			}
		}
	}

	// 规则 3: 任意一方 Veto → 该选项淘汰
	// 收集被 veto 的选项
	vetoedOptions := make(map[string]bool)
	if userVote.VoteType == "veto" {
		vetoedOptions[userVote.OptionID] = true
	}
	if partnerVote.VoteType == "veto" {
		vetoedOptions[partnerVote.OptionID] = true
	}

	// 规则 4: 无共同 Like → 推荐双方都不反对的最高分选项
	// 评分标准：Like=3 分，Dislike=0 分，Veto=-100 分（直接淘汰）
	type scoredOption struct {
		option *models.MealOption
		score  int
	}

	var scored []scoredOption
	for i := range vote.Options {
		opt := &vote.Options[i]
		
		// 如果被 veto，直接跳过
		if vetoedOptions[opt.ID] {
			continue
		}

		score := 0

		// 用户评分
		if userVote.OptionID == opt.ID {
			if userVote.VoteType == "like" {
				score += 3
			}
		} else if userVote.VoteType == "dislike" {
			score -= 1
		}

		// 伴侣评分
		if partnerVote.OptionID == opt.ID {
			if partnerVote.VoteType == "like" {
				score += 3
			}
		} else if partnerVote.VoteType == "dislike" {
			score -= 1
		}

		scored = append(scored, scoredOption{option: opt, score: score})
	}

	// 如果没有可选项，返回 nil
	if len(scored) == 0 {
		return nil, nil
	}

	// 按分数排序，返回最高分的选项
	bestScore := scored[0]
	for _, s := range scored[1:] {
		if s.score > bestScore.score {
			bestScore = s
		}
	}

	// 如果最高分 <= 0，说明没有合适的选项
	if bestScore.score <= 0 {
		return nil, nil
	}

	return bestScore.option, nil
}

// isValidMealType - 验证餐食类型
func isValidMealType(mealType string) bool {
	return mealType == "lunch" || mealType == "dinner"
}

// isValidVoteType - 验证投票类型
func isValidVoteType(voteType string) bool {
	return voteType == "like" || voteType == "dislike" || voteType == "veto"
}

// GetMealTagsAsArray - 将标签字符串转换为数组
func GetMealTagsAsArray(tagsStr string) []string {
	if tagsStr == "" {
		return []string{}
	}
	var tags []string
	json.Unmarshal([]byte(tagsStr), &tags)
	return tags
}
