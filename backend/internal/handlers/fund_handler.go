package handlers

import (
	"net/http"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/service"
	"github.com/gin-gonic/gin"
)

// FundHandler - 基金 HTTP 处理器
type FundHandler struct {
	service *service.FundService
}

func NewFundHandler(svc *service.FundService) *FundHandler {
	return &FundHandler{service: svc}
}

// GetAllFunds - 获取共同基金列表
// GET /api/bills/fund
func (h *FundHandler) GetAllFunds(c *gin.Context) {
	funds, err := h.service.GetAllFunds(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Add progress info to each fund
	result := make([]map[string]interface{}, len(funds))
	for i, fund := range funds {
		progress := 0.0
		if fund.TargetAmount > 0 {
			progress = (fund.CurrentAmount / fund.TargetAmount) * 100
		}
		remaining := fund.TargetAmount - fund.CurrentAmount
		
		result[i] = map[string]interface{}{
			"fund":       fund,
			"progress":   progress,
			"remaining":  remaining,
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

// GetFund - 获取单个基金
// GET /api/bills/fund/:id
func (h *FundHandler) GetFund(c *gin.Context) {
	id := c.Param("id")
	progress, err := h.service.GetFundProgress(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "fund not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": progress})
}

// CreateFund - 创建基金
// POST /api/bills/fund
func (h *FundHandler) CreateFund(c *gin.Context) {
	var fund models.CommonFund
	if err := c.ShouldBindJSON(&fund); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate
	if fund.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
		return
	}
	if fund.TargetAmount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "target amount must be positive"})
		return
	}

	if err := h.service.CreateFund(c.Request.Context(), &fund); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": fund, "message": "fund created successfully"})
}

// UpdateFund - 更新基金
// PUT /api/bills/fund/:id
func (h *FundHandler) UpdateFund(c *gin.Context) {
	id := c.Param("id")
	
	var updates models.CommonFund
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	existing, err := h.service.GetFund(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "fund not found"})
		return
	}

	// Update fields
	if updates.Name != "" {
		existing.Name = updates.Name
	}
	if updates.TargetAmount > 0 {
		existing.TargetAmount = updates.TargetAmount
	}
	if updates.MonthlyGoal > 0 {
		existing.MonthlyGoal = updates.MonthlyGoal
	}

	if err := h.service.UpdateFund(c.Request.Context(), existing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": existing, "message": "fund updated successfully"})
}

// ContributeToFund - 存入基金
// POST /api/bills/fund/contribute
func (h *FundHandler) ContributeToFund(c *gin.Context) {
	var req struct {
		FundID      string  `json:"fundId" binding:"required"`
		Amount      float64 `json:"amount" binding:"required,gt=0"`
		Contributor string  `json:"contributor" binding:"required"`
		Note        *string `json:"note"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.ContributeToFund(c.Request.Context(), req.FundID, req.Contributor, req.Amount, req.Note); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "contribution recorded successfully"})
}

// GetFundContributions - 获取基金存入记录
// GET /api/bills/fund/:id/contributions
func (h *FundHandler) GetFundContributions(c *gin.Context) {
	id := c.Param("id")
	contributions, err := h.service.GetFundContributions(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": contributions})
}
