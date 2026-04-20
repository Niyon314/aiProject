package handlers

import (
	"net/http"
	"time"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/service"
	"github.com/gin-gonic/gin"
)

// MealHandler - 吃饭投票 HTTP 处理器
type MealHandler struct {
	service *service.MealService
}

func NewMealHandler(svc *service.MealService) *MealHandler {
	return &MealHandler{service: svc}
}

// GetTodayVoteRequest - 获取今日投票请求
type GetTodayVoteRequest struct {
	Date     string `json:"date" form:"date"`     // YYYY-MM-DD，默认为今天
	MealType string `json:"mealType" form:"mealType" binding:"required"` // lunch/dinner
}

// CreateTodayVoteRequest - 创建今日投票请求
type CreateTodayVoteRequest struct {
	Date        string `json:"date" form:"date"`           // YYYY-MM-DD，默认为今天
	MealType    string `json:"mealType" form:"mealType" binding:"required"` // lunch/dinner
	OptionCount int    `json:"optionCount" form:"optionCount"` // 选项数量，默认 3-5
}

// SubmitVoteRequest - 提交投票请求
type SubmitVoteRequest struct {
	Voter    string `json:"voter" binding:"required"`     // user/partner
	OptionID string `json:"optionId" binding:"required"`  // 选择的选项 ID
	VoteType string `json:"type" binding:"required"`      // like/dislike/veto
}

// GetTodayVote - 获取今日投票
// GET /api/meals/today?mealType=lunch|dinner&date=YYYY-MM-DD
func (h *MealHandler) GetTodayVote(c *gin.Context) {
	var req GetTodayVoteRequest
	
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 默认使用今天日期
	if req.Date == "" {
		req.Date = time.Now().Format("2006-01-02")
	}

	vote, err := h.service.GetTodayVote(c.Request.Context(), req.Date, req.MealType)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "today's vote not found, please create it first"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": vote})
}

// CreateTodayVote - 创建今日投票
// POST /api/meals/today
func (h *MealHandler) CreateTodayVote(c *gin.Context) {
	var req CreateTodayVoteRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 默认使用今天日期
	if req.Date == "" {
		req.Date = time.Now().Format("2006-01-02")
	}

	// 默认选项数量为 3-5
	if req.OptionCount < 3 {
		req.OptionCount = 3
	} else if req.OptionCount > 5 {
		req.OptionCount = 5
	}

	vote, err := h.service.CreateTodayVote(c.Request.Context(), req.Date, req.MealType, req.OptionCount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": vote, "message": "vote created successfully"})
}

// SubmitVote - 提交投票
// POST /api/meals/:id/vote
func (h *MealHandler) SubmitVote(c *gin.Context) {
	voteID := c.Param("id")

	var req SubmitVoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	vote, err := h.service.SubmitVote(c.Request.Context(), voteID, req.Voter, req.OptionID, req.VoteType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 如果双方都已投票，发送 WebSocket 通知
	if vote.Status == "completed" || vote.Status == "voted" {
		// 检查是否双方都投票了（通过检查 partnerVote 是否存在）
		if vote.PartnerVote != nil && vote.UserVote != nil {
			matchSuccess := vote.Result != nil
			resultName := ""
			if vote.Result != nil {
				resultName = vote.Result.Name
			}
			SendVoteUpdateNotification(vote.ID, vote.MealType, vote.Date, matchSuccess, resultName)
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": vote, "message": "vote submitted successfully"})
}

// GetVoteResult - 获取投票结果
// GET /api/meals/:id/votes
func (h *MealHandler) GetVoteResult(c *gin.Context) {
	voteID := c.Param("id")

	vote, err := h.service.GetVoteResult(c.Request.Context(), voteID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "vote not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": vote})
}

// GetHistoricalVotes - 获取历史投票记录
// GET /api/meals/history
func (h *MealHandler) GetHistoricalVotes(c *gin.Context) {
	// TODO: Implement GetHistoricalVotes in service
	c.JSON(http.StatusOK, gin.H{"data": []interface{}{}, "message": "not implemented yet"})
}

// VoteResultResponse - 投票结果响应
type VoteResultResponse struct {
	ID           string           `json:"id"`
	Date         string           `json:"date"`
	MealType     string           `json:"mealType"`
	Status       string           `json:"status"`
	Options      []MealOptionDTO  `json:"options"`
	UserVote     *UserVoteDTO     `json:"userVote,omitempty"`
	PartnerVote  *UserVoteDTO     `json:"partnerVote,omitempty"`
	Result       *MealOptionDTO   `json:"result,omitempty"`
	MatchSuccess bool             `json:"matchSuccess"`
	Message      string           `json:"message"`
}

// MealOptionDTO - 选项数据传输对象
type MealOptionDTO struct {
	ID         string   `json:"id"`
	RecipeID   string   `json:"recipeId"`
	Name       string   `json:"name"`
	Icon       string   `json:"icon"`
	CookTime   int      `json:"cookTime"`
	Difficulty string   `json:"difficulty"`
	Cost       float64  `json:"cost"`
	Tags       []string `json:"tags"`
	IsSelected bool     `json:"isSelected"` // 是否被当前用户选择
}

// UserVoteDTO - 用户投票数据传输对象
type UserVoteDTO struct {
	OptionID string `json:"optionId"`
	Type     string `json:"type"`
	Timestamp time.Time `json:"timestamp"`
	OptionName string `json:"optionName,omitempty"` // 选项名称（仅在自己投票后可见）
}

// ToVoteResultResponse - 转换为响应对象
func ToVoteResultResponse(vote *models.MealVote, currentVoter string) *VoteResultResponse {
	resp := &VoteResultResponse{
		ID:       vote.ID,
		Date:     vote.Date,
		MealType: vote.MealType,
		Status:   vote.Status,
		Options:  make([]MealOptionDTO, 0, len(vote.Options)),
	}

	// 转换选项
	for _, opt := range vote.Options {
		dto := MealOptionDTO{
			ID:         opt.ID,
			RecipeID:   opt.RecipeID,
			Name:       opt.Name,
			Icon:       opt.Icon,
			CookTime:   opt.CookTime,
			Difficulty: opt.Difficulty,
			Cost:       opt.Cost,
			Tags:       service.GetMealTagsAsArray(opt.Tags),
			IsSelected: false,
		}

		// 检查是否被当前用户选择
		if vote.UserVote != nil && vote.UserVote.OptionID == opt.ID && currentVoter == "user" {
			dto.IsSelected = true
		}
		if vote.PartnerVote != nil && vote.PartnerVote.OptionID == opt.ID && currentVoter == "partner" {
			dto.IsSelected = true
		}

		resp.Options = append(resp.Options, dto)
	}

	// 转换用户投票
	if vote.UserVote != nil {
		resp.UserVote = &UserVoteDTO{
			OptionID:   vote.UserVote.OptionID,
			Type:       vote.UserVote.VoteType,
			Timestamp:  vote.UserVote.Timestamp,
		}
		// 获取选项名称
		for _, opt := range vote.Options {
			if opt.ID == vote.UserVote.OptionID {
				resp.UserVote.OptionName = opt.Name
				break
			}
		}
	}

	// 转换伴侣投票（仅在自己投票后可见）
	if vote.PartnerVote != nil && vote.UserVote != nil {
		resp.PartnerVote = &UserVoteDTO{
			OptionID:   vote.PartnerVote.OptionID,
			Type:       vote.PartnerVote.VoteType,
			Timestamp:  vote.PartnerVote.Timestamp,
		}
		// 获取选项名称
		for _, opt := range vote.Options {
			if opt.ID == vote.PartnerVote.OptionID {
				resp.PartnerVote.OptionName = opt.Name
				break
			}
		}
	}

	// 转换结果
	if vote.Result != nil {
		resp.Result = &MealOptionDTO{
			ID:         vote.Result.ID,
			RecipeID:   vote.Result.RecipeID,
			Name:       vote.Result.Name,
			Icon:       vote.Result.Icon,
			CookTime:   vote.Result.CookTime,
			Difficulty: vote.Result.Difficulty,
			Cost:       vote.Result.Cost,
			Tags:       service.GetMealTagsAsArray(vote.Result.Tags),
		}
		resp.MatchSuccess = true
		resp.Message = "💕 完美匹配！"
	} else {
		resp.MatchSuccess = false
		if vote.Status == "completed" {
			resp.Message = "😅 没有完美匹配，推荐备选方案"
		} else {
			resp.Message = "等待伴侣投票..."
		}
	}

	return resp
}
