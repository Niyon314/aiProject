package handlers

import (
	"errors"
	"net/http"
	"time"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/service"
	"github.com/gin-gonic/gin"
)

// ChoreHandler - 家务任务 HTTP 处理器
type ChoreHandler struct {
	service *service.ChoreService
}

// NewChoreHandler - 创建家务任务处理器
func NewChoreHandler(svc *service.ChoreService) *ChoreHandler {
	return &ChoreHandler{service: svc}
}

// GetChoresRequest - 获取任务列表请求参数
type GetChoresRequest struct {
	Status   string `form:"status"`    // pending/claimed/completed/overdue
	Assignee string `form:"assignee"`  // user/partner
	Start    string `form:"start"`     // YYYY-MM-DD
	End      string `form:"end"`       // YYYY-MM-DD
}

// CreateChoreRequest - 创建任务请求
type CreateChoreRequest struct {
	Name       string `json:"name" binding:"required"`
	Icon       string `json:"icon"`
	Type       string `json:"type" binding:"required"` // daily/weekly/monthly/once
	Points     int    `json:"points" binding:"required,min=1"`
	Assignee   string `json:"assignee"`
	DueDate    string `json:"dueDate" binding:"required"` // YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS
	TemplateID string `json:"templateId"`
}

// ClaimChoreRequest - 认领任务请求
type ClaimChoreRequest struct {
	Assignee string `json:"assignee" binding:"required,oneof=user partner"`
}

// CompleteChoreRequest - 完成打卡请求
type CompleteChoreRequest struct {
	Assignee   string  `json:"assignee" binding:"required,oneof=user partner"`
	ProofPhoto *string `json:"proofPhoto"`
	Notes      *string `json:"notes"`
}

// GetChores - 获取任务列表
// GET /api/chores?status=pending&assignee=user&start=2026-03-23&end=2026-03-30
func (h *ChoreHandler) GetChores(c *gin.Context) {
	var req GetChoresRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 解析参数
	var status *models.ChoreStatus
	var assignee *models.Assignee
	var startDate, endDate *time.Time

	if req.Status != "" {
		s := models.ChoreStatus(req.Status)
		status = &s
	}
	if req.Assignee != "" {
		a := models.Assignee(req.Assignee)
		assignee = &a
	}
	if req.Start != "" {
		t, err := time.Parse("2006-01-02", req.Start)
		if err == nil {
			startDate = &t
		}
	}
	if req.End != "" {
		t, err := time.Parse("2006-01-02", req.End)
		if err == nil {
			endDate = &t
		}
	}

	// 获取任务列表
	chores, err := h.service.GetChores(c.Request.Context(), status, assignee, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": chores})
}

// CreateChore - 创建任务
// POST /api/chores
func (h *ChoreHandler) CreateChore(c *gin.Context) {
	var req CreateChoreRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 解析日期
	dueDate, err := parseDate(req.DueDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid dueDate format, use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS"})
		return
	}

	// 创建任务
	chore := &models.Chore{
		Name:       req.Name,
		Icon:       req.Icon,
		Type:       models.ChoreType(req.Type),
		Points:     req.Points,
		Assignee:   models.Assignee(req.Assignee),
		DueDate:    dueDate,
		TemplateID: nil,
	}

	if req.TemplateID != "" {
		chore.TemplateID = &req.TemplateID
	}

	if err := h.service.CreateChore(c.Request.Context(), chore); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": chore, "message": "chore created successfully"})
}

// ClaimChore - 认领任务
// POST /api/chores/:id/claim
func (h *ChoreHandler) ClaimChore(c *gin.Context) {
	id := c.Param("id")

	var req ClaimChoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 认领任务
	chore, err := h.service.ClaimChore(c.Request.Context(), id, models.Assignee(req.Assignee))
	if err != nil {
		if err == service.ErrChoreNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "chore not found"})
			return
		}
		if err == service.ErrChoreAlreadyClaimed {
			c.JSON(http.StatusConflict, gin.H{"error": "chore already claimed"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": chore, "message": "chore claimed successfully"})
}

// CompleteChore - 完成打卡
// POST /api/chores/:id/complete
func (h *ChoreHandler) CompleteChore(c *gin.Context) {
	id := c.Param("id")

	var req CompleteChoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 完成打卡
	chore, err := h.service.CompleteChore(c.Request.Context(), id, models.Assignee(req.Assignee), req.ProofPhoto, req.Notes)
	if err != nil {
		if err == service.ErrChoreNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "chore not found"})
			return
		}
		if err == service.ErrChoreAlreadyCompleted {
			c.JSON(http.StatusConflict, gin.H{"error": "chore already completed"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": chore, "message": "chore completed successfully", "points": chore.ActualPoints})
}

// GetStats - 获取统计数据
// GET /api/chores/stats?userId=user
func (h *ChoreHandler) GetStats(c *gin.Context) {
	userID := c.Query("userId")
	if userID == "" {
		userID = "user" // 默认使用 user
	}

	stats, err := h.service.GetStats(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetLeaderboard - 获取排行榜
// GET /api/chores/leaderboard?weekly=true
func (h *ChoreHandler) GetLeaderboard(c *gin.Context) {
	weekly := c.Query("weekly") == "true"

	entries, err := h.service.GetLeaderboard(c.Request.Context(), weekly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": entries})
}

// GetChoreTemplates - 获取任务模板
// GET /api/chores/templates?active=true
func (h *ChoreHandler) GetChoreTemplates(c *gin.Context) {
	activeParam := c.Query("active")
	var isActive *bool
	if activeParam == "true" {
		t := true
		isActive = &t
	} else if activeParam == "false" {
		f := false
		isActive = &f
	}

	templates, err := h.service.GetChoreTemplates(c.Request.Context(), isActive)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": templates})
}

// CreateChoreTemplate - 创建任务模板
// POST /api/chores/templates
func (h *ChoreHandler) CreateChoreTemplate(c *gin.Context) {
	var req struct {
		Name          string `json:"name" binding:"required"`
		Icon          string `json:"icon"`
		Type          string `json:"type" binding:"required"`
		Points        int    `json:"points" binding:"required,min=1"`
		DefaultAssignee string `json:"defaultAssignee"`
		Description   *string `json:"description"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	template := &models.ChoreTemplate{
		Name:            req.Name,
		Icon:            req.Icon,
		Type:            models.ChoreType(req.Type),
		Points:          req.Points,
		DefaultAssignee: models.Assignee(req.DefaultAssignee),
		Description:     req.Description,
		IsActive:        true,
	}

	if err := h.service.CreateChoreTemplate(c.Request.Context(), template); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": template, "message": "template created successfully"})
}

// DeleteChoreTemplate - 删除任务模板
// DELETE /api/chores/templates/:id
func (h *ChoreHandler) DeleteChoreTemplate(c *gin.Context) {
	id := c.Param("id")

	if err := h.service.DeleteChoreTemplate(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "template deleted successfully"})
}

// parseDate - 解析日期字符串
func parseDate(dateStr string) (time.Time, error) {
	// 尝试多种格式
	formats := []string{
		"2006-01-02",
		"2006-01-02T15:04:05",
		"2006-01-02T15:04:05Z07:00",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, errors.New("invalid date format")
}
