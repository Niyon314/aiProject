package handlers

import (
	"net/http"
	"strconv"
	"time"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/service"
	"github.com/gin-gonic/gin"
)

// ScheduleHandler - 日程 HTTP 处理器
type ScheduleHandler struct {
	service *service.ScheduleService
}

// NewScheduleHandler - 创建日程处理器
func NewScheduleHandler(svc *service.ScheduleService) *ScheduleHandler {
	return &ScheduleHandler{service: svc}
}

// CreateScheduleRequest - 创建日程请求
type CreateScheduleRequest struct {
	Title        string   `json:"title" binding:"required"`
	Description  string   `json:"description"`
	Icon         string   `json:"icon"`
	StartTime    string   `json:"startTime" binding:"required"` // ISO 8601
	EndTime      string   `json:"endTime" binding:"required"`   // ISO 8601
	Location     string   `json:"location"`
	Type         string   `json:"type" binding:"required"` // date/work/family/friend/other
	Reminder     string   `json:"reminder"`                // none/1h/1d/1w
	Participants []string `json:"participants"`
	Status       string   `json:"status"` // planned/completed/cancelled
}

// UpdateScheduleRequest - 更新日程请求
type UpdateScheduleRequest struct {
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	Icon         string   `json:"icon"`
	StartTime    string   `json:"startTime"` // ISO 8601
	EndTime      string   `json:"endTime"`   // ISO 8601
	Location     string   `json:"location"`
	Type         string   `json:"type"` // date/work/family/friend/other
	Reminder     string   `json:"reminder"`
	Participants []string `json:"participants"`
	Status       string   `json:"status"`
}

// GetSchedulesRequest - 获取日程列表请求参数
type GetSchedulesRequest struct {
	Status string `form:"status"` // planned/completed/cancelled
	Type   string `form:"type"`   // date/work/family/friend/other
	Start  string `form:"start"`  // YYYY-MM-DD
	End    string `form:"end"`    // YYYY-MM-DD
}

// GetSchedules - 获取日程列表
// GET /api/schedules?status=planned&type=date&start=2026-03-23&end=2026-03-30
func (h *ScheduleHandler) GetSchedules(c *gin.Context) {
	var req GetSchedulesRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 解析参数
	var status *models.ScheduleStatus
	var scheduleType *models.ScheduleType
	var startDate, endDate *time.Time

	if req.Status != "" {
		s := models.ScheduleStatus(req.Status)
		status = &s
	}
	if req.Type != "" {
		t := models.ScheduleType(req.Type)
		scheduleType = &t
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

	// 获取日程列表
	schedules, err := h.service.GetSchedules(c.Request.Context(), status, scheduleType, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": schedules})
}

// CreateSchedule - 创建日程
// POST /api/schedules
func (h *ScheduleHandler) CreateSchedule(c *gin.Context) {
	var req CreateScheduleRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 解析时间
	startTime, err := time.Parse(time.RFC3339, req.StartTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid startTime format, use ISO 8601"})
		return
	}

	endTime, err := time.Parse(time.RFC3339, req.EndTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid endTime format, use ISO 8601"})
		return
	}

	// 格式化参与者
	participantsStr := `["user", "partner"]`
	if len(req.Participants) > 0 {
		participantsStr, err = service.FormatParticipants(req.Participants)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	// 创建日程
	schedule := &models.Schedule{
		Title:        req.Title,
		Description:  req.Description,
		Icon:         req.Icon,
		StartTime:    startTime,
		EndTime:      endTime,
		Location:     req.Location,
		Type:         models.ScheduleType(req.Type),
		Reminder:     models.ReminderType(req.Reminder),
		Participants: participantsStr,
		Status:       models.ScheduleStatus(req.Status),
	}

	if err := h.service.CreateSchedule(c.Request.Context(), schedule); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": schedule, "message": "schedule created successfully"})
}

// UpdateSchedule - 更新日程
// PUT /api/schedules/:id
func (h *ScheduleHandler) UpdateSchedule(c *gin.Context) {
	id := c.Param("id")

	var req UpdateScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 获取现有日程
	schedule, err := h.service.GetScheduleByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "schedule not found"})
		return
	}

	// 更新字段
	if req.Title != "" {
		schedule.Title = req.Title
	}
	if req.Description != "" {
		schedule.Description = req.Description
	}
	if req.Icon != "" {
		schedule.Icon = req.Icon
	}
	if req.StartTime != "" {
		startTime, err := time.Parse(time.RFC3339, req.StartTime)
		if err == nil {
			schedule.StartTime = startTime
		}
	}
	if req.EndTime != "" {
		endTime, err := time.Parse(time.RFC3339, req.EndTime)
		if err == nil {
			schedule.EndTime = endTime
		}
	}
	if req.Location != "" {
		schedule.Location = req.Location
	}
	if req.Type != "" {
		schedule.Type = models.ScheduleType(req.Type)
	}
	if req.Reminder != "" {
		schedule.Reminder = models.ReminderType(req.Reminder)
	}
	if len(req.Participants) > 0 {
		participantsStr, err := service.FormatParticipants(req.Participants)
		if err == nil {
			schedule.Participants = participantsStr
		}
	}
	if req.Status != "" {
		schedule.Status = models.ScheduleStatus(req.Status)
	}

	if err := h.service.UpdateSchedule(c.Request.Context(), schedule); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": schedule, "message": "schedule updated successfully"})
}

// DeleteSchedule - 删除日程
// DELETE /api/schedules/:id
func (h *ScheduleHandler) DeleteSchedule(c *gin.Context) {
	id := c.Param("id")

	if err := h.service.DeleteSchedule(c.Request.Context(), id); err != nil {
		if err == service.ErrScheduleNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "schedule not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "schedule deleted successfully"})
}

// GetUpcoming - 获取即将开始的日程
// GET /api/schedules/upcoming?days=7
func (h *ScheduleHandler) GetUpcoming(c *gin.Context) {
	days := 7 // default
	if d := c.Query("days"); d != "" {
		if parsed, err := strconv.Atoi(d); err == nil && parsed > 0 {
			days = parsed
		}
	}

	schedules, err := h.service.GetUpcomingSchedules(c.Request.Context(), days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": schedules})
}

// GetScheduleByID - 获取单个日程
// GET /api/schedules/:id
func (h *ScheduleHandler) GetScheduleByID(c *gin.Context) {
	id := c.Param("id")

	schedule, err := h.service.GetScheduleByID(c.Request.Context(), id)
	if err != nil {
		if err == service.ErrScheduleNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "schedule not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": schedule})
}

// UpdateScheduleStatus - 更新日程状态
// PATCH /api/schedules/:id/status
func (h *ScheduleHandler) UpdateScheduleStatus(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.UpdateScheduleStatus(c.Request.Context(), id, models.ScheduleStatus(req.Status)); err != nil {
		if err == service.ErrScheduleNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "schedule not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "schedule status updated successfully"})
}
