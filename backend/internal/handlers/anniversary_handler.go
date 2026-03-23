package handlers

import (
	"net/http"
	"strconv"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/service"
	"github.com/gin-gonic/gin"
)

// AnniversaryHandler - 纪念日 HTTP 处理器
type AnniversaryHandler struct {
	service *service.AnniversaryService
}

// NewAnniversaryHandler - 创建纪念日处理器
func NewAnniversaryHandler(svc *service.AnniversaryService) *AnniversaryHandler {
	return &AnniversaryHandler{service: svc}
}

// CreateAnniversaryRequest - 创建纪念日请求
type CreateAnniversaryRequest struct {
	Name         string `json:"name" binding:"required"`
	Date         string `json:"date" binding:"required"` // YYYY-MM-DD
	Icon         string `json:"icon"`
	Type         string `json:"type" binding:"required"` // festival/birthday/relationship/other
	Year         int    `json:"year" binding:"required,min=1900"`
	IsLunar      bool   `json:"isLunar"`
	ReminderDays []int  `json:"reminderDays"`
	Notes        string `json:"notes"`
}

// UpdateAnniversaryRequest - 更新纪念日请求
type UpdateAnniversaryRequest struct {
	Name         string `json:"name"`
	Date         string `json:"date"` // YYYY-MM-DD
	Icon         string `json:"icon"`
	Type         string `json:"type"` // festival/birthday/relationship/other
	Year         int    `json:"year"`
	IsLunar      bool   `json:"isLunar"`
	ReminderDays []int  `json:"reminderDays"`
	Notes        string `json:"notes"`
}

// GetAnniversariesRequest - 获取纪念日列表请求参数
type GetAnniversariesRequest struct {
	Type string `form:"type"` // festival/birthday/relationship/other
}

// GetAnniversaries - 获取纪念日列表
// GET /api/anniversaries?type=relationship
func (h *AnniversaryHandler) GetAnniversaries(c *gin.Context) {
	var req GetAnniversariesRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var anniversaryType *models.AnniversaryType
	if req.Type != "" {
		t := models.AnniversaryType(req.Type)
		anniversaryType = &t
	}

	anniversaries, err := h.service.GetAnniversaries(c.Request.Context(), anniversaryType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": anniversaries})
}

// CreateAnniversary - 创建纪念日
// POST /api/anniversaries
func (h *AnniversaryHandler) CreateAnniversary(c *gin.Context) {
	var req CreateAnniversaryRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 解析日期
	date, err := parseDate(req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format, use YYYY-MM-DD"})
		return
	}

	// 格式化提醒天数
	reminderDaysStr := `[7, 3, 1]`
	if len(req.ReminderDays) > 0 {
		reminderDaysStr, err = service.FormatReminderDays(req.ReminderDays)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	// 创建纪念日
	anniversary := &models.Anniversary{
		Name:         req.Name,
		Date:         date,
		Icon:         req.Icon,
		Type:         models.AnniversaryType(req.Type),
		Year:         req.Year,
		IsLunar:      req.IsLunar,
		ReminderDays: reminderDaysStr,
		Notes:        req.Notes,
	}

	if err := h.service.CreateAnniversary(c.Request.Context(), anniversary); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": anniversary, "message": "anniversary created successfully"})
}

// UpdateAnniversary - 更新纪念日
// PUT /api/anniversaries/:id
func (h *AnniversaryHandler) UpdateAnniversary(c *gin.Context) {
	id := c.Param("id")

	var req UpdateAnniversaryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 获取现有纪念日
	anniversary, err := h.service.GetAnniversaryByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "anniversary not found"})
		return
	}

	// 更新字段
	if req.Name != "" {
		anniversary.Name = req.Name
	}
	if req.Date != "" {
		date, err := parseDate(req.Date)
		if err == nil {
			anniversary.Date = date
		}
	}
	if req.Icon != "" {
		anniversary.Icon = req.Icon
	}
	if req.Type != "" {
		anniversary.Type = models.AnniversaryType(req.Type)
	}
	if req.Year >= 1900 {
		anniversary.Year = req.Year
	}
	anniversary.IsLunar = req.IsLunar
	if len(req.ReminderDays) > 0 {
		reminderDaysStr, err := service.FormatReminderDays(req.ReminderDays)
		if err == nil {
			anniversary.ReminderDays = reminderDaysStr
		}
	}
	if req.Notes != "" {
		anniversary.Notes = req.Notes
	}

	if err := h.service.UpdateAnniversary(c.Request.Context(), anniversary); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": anniversary, "message": "anniversary updated successfully"})
}

// DeleteAnniversary - 删除纪念日
// DELETE /api/anniversaries/:id
func (h *AnniversaryHandler) DeleteAnniversary(c *gin.Context) {
	id := c.Param("id")

	if err := h.service.DeleteAnniversary(c.Request.Context(), id); err != nil {
		if err == service.ErrAnniversaryNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "anniversary not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "anniversary deleted successfully"})
}

// GetUpcoming - 获取即将到来的纪念日
// GET /api/anniversaries/upcoming?days=30
func (h *AnniversaryHandler) GetUpcoming(c *gin.Context) {
	days := 30 // default
	if d := c.Query("days"); d != "" {
		if parsed, err := strconv.Atoi(d); err == nil && parsed > 0 {
			days = parsed
		}
	}

	anniversaries, err := h.service.GetUpcomingAnniversaries(c.Request.Context(), days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": anniversaries})
}

// GetDaysTogether - 获取在一起天数
// GET /api/anniversaries/days
func (h *AnniversaryHandler) GetDaysTogether(c *gin.Context) {
	days, err := h.service.GetDaysTogether(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{
		"days": days,
	}})
}

// GetAnniversaryByID - 获取单个纪念日详情
// GET /api/anniversaries/:id
func (h *AnniversaryHandler) GetAnniversaryByID(c *gin.Context) {
	id := c.Param("id")

	info, err := h.service.GetAnniversaryInfo(c.Request.Context(), id)
	if err != nil {
		if err == service.ErrAnniversaryNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "anniversary not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": info})
}

// GetAnniversaryProgress - 获取纪念日进度
// GET /api/anniversaries/:id/progress
func (h *AnniversaryHandler) GetAnniversaryProgress(c *gin.Context) {
	id := c.Param("id")

	anniversary, err := h.service.GetAnniversaryByID(c.Request.Context(), id)
	if err != nil {
		if err == service.ErrAnniversaryNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "anniversary not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	progress := service.GetAnniversaryProgress(anniversary.Date)

	c.JSON(http.StatusOK, gin.H{"data": gin.H{
		"id":       anniversary.ID,
		"name":     anniversary.Name,
		"progress": progress,
	}})
}
