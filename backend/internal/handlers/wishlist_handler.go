package handlers

import (
	"net/http"
	"strconv"
	"time"

	"couple-home/backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// WishlistHandler 愿望清单处理器
type WishlistHandler struct {
	db *gorm.DB
}

// NewWishlistHandler 创建愿望清单处理器
func NewWishlistHandler(db *gorm.DB) *WishlistHandler {
	return &WishlistHandler{
		db: db,
	}
}

// Response 通用响应结构
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

// Error 错误响应
func Error(c *gin.Context, code int, message string) {
	c.JSON(http.StatusOK, Response{
		Code:    code,
		Message: message,
	})
}

// GetWishlist 获取愿望列表
// GET /api/wishlist
func (h *WishlistHandler) GetWishlist(c *gin.Context) {
	// 从上下文获取用户信息
	_, exists := c.Get("userID")
	if !exists {
		Error(c, 401, "未登录")
		return
	}

	// 获取筛选参数
	status := c.Query("status") // pending, completed, all
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	// 构建查询
	query := h.db.Model(&models.WishlistItem{})

	// 按状态筛选
	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	// 查询总数
	var total int64
	if err := query.Count(&total).Error; err != nil {
		Error(c, 500, "查询失败："+err.Error())
		return
	}

	// 查询已完成和待完成数量
	var completedCount, pendingCount int64
	h.db.Model(&models.WishlistItem{}).Where("status = ?", models.WishlistStatusCompleted).Count(&completedCount)
	h.db.Model(&models.WishlistItem{}).Where("status = ?", models.WishlistStatusPending).Count(&pendingCount)

	// 查询愿望列表（按创建时间倒序）
	var items []models.WishlistItem
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&items).Error; err != nil {
		Error(c, 500, "查询失败："+err.Error())
		return
	}

	// 构建响应
	responses := make([]models.WishlistItem, 0, len(items))
	for _, item := range items {
		responses = append(responses, item)
	}

	// 计算总预算
	var totalBudget float64
	h.db.Model(&models.WishlistItem{}).Select("COALESCE(SUM(budget), 0)").Scan(&totalBudget)

	Success(c, gin.H{
		"items":       responses,
		"total":       total,
		"completed":   completedCount,
		"pending":     pendingCount,
		"totalBudget": totalBudget,
	})
}

// CreateWishlistItem 创建愿望
// POST /api/wishlist
func (h *WishlistHandler) CreateWishlistItem(c *gin.Context) {
	// 从上下文获取用户信息
	userID, exists := c.Get("userID")
	if !exists {
		Error(c, 401, "未登录")
		return
	}

	userName, _ := c.Get("userName")

	// 解析请求体
	var req models.CreateWishlistItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, 400, "参数错误："+err.Error())
		return
	}

	// 解析截止日期
	var deadline *time.Time
	if req.Deadline != "" {
		parsedTime, err := parseDate(req.Deadline)
		if err != nil {
			Error(c, 400, "日期格式错误，请使用 YYYY-MM-DD 格式")
			return
		}
		deadline = &parsedTime
	}

	// 创建愿望
	item := models.NewWishlistItem(userID.(string), req.Title, req.Description, req.Budget, req.Priority, deadline)
	if err := h.db.Create(item).Error; err != nil {
		Error(c, 500, "创建失败："+err.Error())
		return
	}

	// 返回完整响应
	response := gin.H{
		"id":            item.ID,
		"title":         item.Title,
		"description":   item.Description,
		"budget":        item.Budget,
		"currentAmount": item.CurrentAmount,
		"progress":      item.GetProgress(),
		"priority":      item.Priority,
		"status":        item.Status,
		"deadline":      item.Deadline,
		"createdBy":     userName.(string),
		"createdAt":     item.CreatedAt,
		"updatedAt":     item.UpdatedAt,
	}

	Success(c, response)
}

// ContributeToWishlist 为愿望助力
// POST /api/wishlist/:id/contribute
func (h *WishlistHandler) ContributeToWishlist(c *gin.Context) {
	// 从上下文获取用户信息
	userID, exists := c.Get("userID")
	if !exists {
		Error(c, 401, "未登录")
		return
	}

	itemID := c.Param("id")
	if itemID == "" {
		Error(c, 400, "参数错误：缺少愿望 ID")
		return
	}

	// 解析请求体
	var req models.ContributeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, 400, "参数错误："+err.Error())
		return
	}

	// 开始事务
	tx := h.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 查询愿望
	var item models.WishlistItem
	if err := tx.First(&item, "id = ?", itemID).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			Error(c, 404, "愿望不存在")
		} else {
			Error(c, 500, "查询失败："+err.Error())
		}
		return
	}

	// 检查愿望是否已完成
	if item.Status == models.WishlistStatusCompleted {
		tx.Rollback()
		Error(c, 400, "该愿望已完成，无法继续助力")
		return
	}

	// 创建助力记录
	contribution := models.NewContribution(itemID, userID.(string), req.Amount)
	if err := tx.Create(contribution).Error; err != nil {
		tx.Rollback()
		Error(c, 500, "助力失败："+err.Error())
		return
	}

	// 更新愿望金额
	item.AddContribution(req.Amount)
	if err := tx.Save(&item).Error; err != nil {
		tx.Rollback()
		Error(c, 500, "更新失败："+err.Error())
		return
	}

	// 提交事务
	if err := tx.Commit().Error; err != nil {
		Error(c, 500, "提交失败："+err.Error())
		return
	}

	// 返回更新后的愿望信息
	response := gin.H{
		"id":            item.ID,
		"title":         item.Title,
		"description":   item.Description,
		"budget":        item.Budget,
		"currentAmount": item.CurrentAmount,
		"progress":      item.GetProgress(),
		"priority":      item.Priority,
		"status":        item.Status,
		"deadline":      item.Deadline,
		"createdBy":     item.CreatedBy,
		"createdAt":     item.CreatedAt,
		"updatedAt":     item.UpdatedAt,
	}

	Success(c, response)
}

// CompleteWishlistItem 标记愿望完成
// PUT /api/wishlist/:id/complete
func (h *WishlistHandler) CompleteWishlistItem(c *gin.Context) {
	// 从上下文获取用户信息
	userID, exists := c.Get("userID")
	if !exists {
		Error(c, 401, "未登录")
		return
	}

	itemID := c.Param("id")
	if itemID == "" {
		Error(c, 400, "参数错误：缺少愿望 ID")
		return
	}

	// 查询愿望
	var item models.WishlistItem
	if err := h.db.First(&item, "id = ?", itemID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			Error(c, 404, "愿望不存在")
		} else {
			Error(c, 500, "查询失败："+err.Error())
		}
		return
	}

	// 检查是否是创建者
	if item.CreatedBy != userID.(string) {
		Error(c, 403, "只有创建者可以标记愿望完成")
		return
	}

	// 检查是否已完成
	if item.Status == models.WishlistStatusCompleted {
		Error(c, 400, "该愿望已完成")
		return
	}

	// 标记完成
	item.MarkCompleted()
	if err := h.db.Save(&item).Error; err != nil {
		Error(c, 500, "更新失败："+err.Error())
		return
	}

	// 返回更新后的愿望信息
	response := gin.H{
		"id":            item.ID,
		"title":         item.Title,
		"description":   item.Description,
		"budget":        item.Budget,
		"currentAmount": item.CurrentAmount,
		"progress":      item.GetProgress(),
		"priority":      item.Priority,
		"status":        item.Status,
		"deadline":      item.Deadline,
		"createdBy":     item.CreatedBy,
		"createdAt":     item.CreatedAt,
		"updatedAt":     item.UpdatedAt,
		"completedAt":   item.CompletedAt,
	}

	Success(c, response)
}

// DeleteWishlistItem 删除愿望
// DELETE /api/wishlist/:id
func (h *WishlistHandler) DeleteWishlistItem(c *gin.Context) {
	// 从上下文获取用户信息
	userID, exists := c.Get("userID")
	if !exists {
		Error(c, 401, "未登录")
		return
	}

	itemID := c.Param("id")
	if itemID == "" {
		Error(c, 400, "参数错误：缺少愿望 ID")
		return
	}

	// 查询愿望
	var item models.WishlistItem
	if err := h.db.First(&item, "id = ?", itemID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			Error(c, 404, "愿望不存在")
		} else {
			Error(c, 500, "查询失败："+err.Error())
		}
		return
	}

	// 检查是否是创建者
	if item.CreatedBy != userID.(string) {
		Error(c, 403, "只有创建者可以删除愿望")
		return
	}

	// 删除愿望（先删除关联的助力记录）
	if err := h.db.Where("item_id = ?", itemID).Delete(&models.WishlistContribution{}).Error; err != nil {
		Error(c, 500, "删除助力记录失败："+err.Error())
		return
	}

	if err := h.db.Delete(&item).Error; err != nil {
		Error(c, 500, "删除失败："+err.Error())
		return
	}

	Success(c, nil)
}

// GetWishlistStats 获取愿望统计
// GET /api/wishlist/stats
func (h *WishlistHandler) GetWishlistStats(c *gin.Context) {
	// 从上下文获取用户信息
	userID, exists := c.Get("userID")
	if !exists {
		Error(c, 401, "未登录")
		return
	}

	// 统计用户的愿望
	var totalItems, completedItems int64
	var totalBudget, totalContributed float64

	h.db.Model(&models.WishlistItem{}).Where("created_by = ?", userID).Count(&totalItems)
	h.db.Model(&models.WishlistItem{}).Where("created_by = ? AND status = ?", userID, models.WishlistStatusCompleted).Count(&completedItems)
	h.db.Model(&models.WishlistItem{}).Where("created_by = ?", userID).Select("COALESCE(SUM(budget), 0)").Scan(&totalBudget)
	h.db.Model(&models.WishlistContribution{}).Where("user_id = ?", userID).Select("COALESCE(SUM(amount), 0)").Scan(&totalContributed)

	Success(c, gin.H{
		"totalItems":       totalItems,
		"completedItems":   completedItems,
		"pendingItems":     totalItems - completedItems,
		"totalBudget":      totalBudget,
		"totalContributed": totalContributed,
		"completionRate":   0,
	})
}
