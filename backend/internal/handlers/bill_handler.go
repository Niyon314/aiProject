package handlers

import (
	"net/http"
	"time"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/service"
	"github.com/gin-gonic/gin"
)

// BillHandler - 账单 HTTP 处理器
type BillHandler struct {
	service *service.BillService
}

func NewBillHandler(svc *service.BillService) *BillHandler {
	return &BillHandler{service: svc}
}

// GetAllBills - 获取账单列表
// GET /api/bills
func (h *BillHandler) GetAllBills(c *gin.Context) {
	bills, err := h.service.GetAllBills(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": bills})
}

// GetBill - 获取单个账单
// GET /api/bills/:id
func (h *BillHandler) GetBill(c *gin.Context) {
	id := c.Param("id")
	bill, err := h.service.GetBill(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "bill not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": bill})
}

// CreateBill - 创建账单
// POST /api/bills
func (h *BillHandler) CreateBill(c *gin.Context) {
	var bill models.Bill
	if err := c.ShouldBindJSON(&bill); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate required fields
	if bill.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}
	if bill.Amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "amount must be positive"})
		return
	}
	if bill.Payer == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "payer is required"})
		return
	}
	if bill.Date.IsZero() {
		bill.Date = time.Now()
	}

	if err := h.service.CreateBill(c.Request.Context(), &bill); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": bill, "message": "bill created successfully"})
}

// UpdateBill - 更新账单
// PUT /api/bills/:id
func (h *BillHandler) UpdateBill(c *gin.Context) {
	id := c.Param("id")
	
	var updates models.Bill
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	existing, err := h.service.GetBill(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "bill not found"})
		return
	}

	// Update fields
	if updates.Title != "" {
		existing.Title = updates.Title
	}
	if updates.Amount > 0 {
		existing.Amount = updates.Amount
	}
	if updates.Payer != "" {
		existing.Payer = updates.Payer
	}
	if !updates.Date.IsZero() {
		existing.Date = updates.Date
	}
	if updates.Category != "" {
		existing.Category = updates.Category
	}
	if updates.Note != nil {
		existing.Note = updates.Note
	}
	existing.IsShared = updates.IsShared
	if updates.FundContributionID != nil {
		existing.FundContributionID = updates.FundContributionID
	}

	if err := h.service.UpdateBill(c.Request.Context(), existing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": existing, "message": "bill updated successfully"})
}

// DeleteBill - 删除账单
// DELETE /api/bills/:id
func (h *BillHandler) DeleteBill(c *gin.Context) {
	id := c.Param("id")
	
	if err := h.service.DeleteBill(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "bill deleted successfully"})
}

// GetStats - 获取统计数据
// GET /api/bills/stats
func (h *BillHandler) GetStats(c *gin.Context) {
	stats, err := h.service.GetStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetBillsByDateRange - 获取日期范围内的账单
// GET /api/bills/range
func (h *BillHandler) GetBillsByDateRange(c *gin.Context) {
	startStr := c.Query("start")
	endStr := c.Query("end")

	if startStr == "" || endStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "start and end dates are required"})
		return
	}

	start, err := time.Parse("2006-01-02", startStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start date format"})
		return
	}

	end, err := time.Parse("2006-01-02", endStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end date format"})
		return
	}

	bills, err := h.service.GetBillsByDateRange(c.Request.Context(), start, end)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": bills})
}
