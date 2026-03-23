package handlers

import (
	"net/http"
	"strconv"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/service"
	"github.com/gin-gonic/gin"
)

// FridgeHandler - 冰箱 HTTP 处理器
type FridgeHandler struct {
	service *service.FridgeService
}

func NewFridgeHandler(svc *service.FridgeService) *FridgeHandler {
	return &FridgeHandler{service: svc}
}

// GetAllItems - 获取冰箱库存列表
// GET /api/fridge
func (h *FridgeHandler) GetAllItems(c *gin.Context) {
	items, err := h.service.GetAllItems(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Add expiry status to each item
	type FridgeItemWithStatus struct {
		models.FridgeItem
		ExpiryStatus string `json:"expiryStatus"`
	}

	result := make([]FridgeItemWithStatus, len(items))
	for i, item := range items {
		result[i] = FridgeItemWithStatus{
			FridgeItem:   item,
			ExpiryStatus: h.service.CheckExpiryStatus(&item),
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

// GetItem - 获取单个食材
// GET /api/fridge/:id
func (h *FridgeHandler) GetItem(c *gin.Context) {
	id := c.Param("id")
	item, err := h.service.GetItem(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "item not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": item})
}

// AddItem - 添加食材
// POST /api/fridge
func (h *FridgeHandler) AddItem(c *gin.Context) {
	var item models.FridgeItem
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate required fields
	if item.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
		return
	}

	if err := h.service.AddItem(c.Request.Context(), &item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": item, "message": "item added successfully"})
}

// UpdateItem - 更新食材
// PUT /api/fridge/:id
func (h *FridgeHandler) UpdateItem(c *gin.Context) {
	id := c.Param("id")
	
	var updates models.FridgeItem
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	existing, err := h.service.GetItem(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "item not found"})
		return
	}

	// Update fields
	if updates.Name != "" {
		existing.Name = updates.Name
	}
	if updates.Icon != "" {
		existing.Icon = updates.Icon
	}
	if updates.Quantity > 0 {
		existing.Quantity = updates.Quantity
	}
	if updates.Unit != "" {
		existing.Unit = updates.Unit
	}
	if updates.ExpiryDate != nil {
		existing.ExpiryDate = updates.ExpiryDate
	}
	if updates.Category != "" {
		existing.Category = updates.Category
	}

	if err := h.service.UpdateItem(c.Request.Context(), existing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": existing, "message": "item updated successfully"})
}

// DeleteItem - 删除食材
// DELETE /api/fridge/:id
func (h *FridgeHandler) DeleteItem(c *gin.Context) {
	id := c.Param("id")
	
	if err := h.service.DeleteItem(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "item deleted successfully"})
}

// GetExpiringItems - 获取临期食材
// GET /api/fridge/expiring
func (h *FridgeHandler) GetExpiringItems(c *gin.Context) {
	days := 7 // Default: 7 days
	if d := c.Query("days"); d != "" {
		if parsed, err := strconv.Atoi(d); err == nil && parsed > 0 {
			days = parsed
		}
	}

	items, err := h.service.GetExpiringItems(c.Request.Context(), days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	type FridgeItemWithStatus struct {
		models.FridgeItem
		ExpiryStatus string `json:"expiryStatus"`
		DaysUntilExpiry int `json:"daysUntilExpiry"`
	}

	result := make([]FridgeItemWithStatus, len(items))
	for i, item := range items {
		daysUntil := 0
		if item.ExpiryDate != nil {
			daysUntil = int(item.ExpiryDate.Sub(item.AddedAt).Hours() / 24)
		}
		result[i] = FridgeItemWithStatus{
			FridgeItem:      item,
			ExpiryStatus:    h.service.CheckExpiryStatus(&item),
			DaysUntilExpiry: daysUntil,
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}
