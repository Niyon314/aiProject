package handlers

import (
	"net/http"
	"strconv"
	"time"

	"couple-home/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// MealWishHandler - 想吃清单 HTTP 处理器
type MealWishHandler struct {
	db *gorm.DB
}

func NewMealWishHandler(db *gorm.DB) *MealWishHandler {
	return &MealWishHandler{db: db}
}

// GetWishes - 获取想吃清单
// GET /api/meal/wishes?status=pending
func (h *MealWishHandler) GetWishes(c *gin.Context) {
	status := c.Query("status")

	var wishes []models.MealWish
	query := h.db.Order("created_at desc")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&wishes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch wishes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": wishes})
}

// AddWish - 添加想吃的
// POST /api/meal/wishes
func (h *MealWishHandler) AddWish(c *gin.Context) {
	var wish models.MealWish
	if err := c.ShouldBindJSON(&wish); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	wish.ID = uuid.New().String()
	if wish.Icon == "" {
		wish.Icon = "🍽️"
	}
	if wish.Category == "" {
		wish.Category = "home_cook"
	}
	if wish.Priority == "" {
		wish.Priority = "want"
	}
	if wish.Status == "" {
		wish.Status = "pending"
	}
	if wish.AddedBy == "" {
		wish.AddedBy = "user"
	}

	if err := h.db.Create(&wish).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add wish"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": wish, "message": "添加成功"})
}

// UpdateWish - 更新想吃
// PUT /api/meal/wishes/:id
func (h *MealWishHandler) UpdateWish(c *gin.Context) {
	id := c.Param("id")

	var wish models.MealWish
	if err := h.db.First(&wish, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Model(&wish).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}

	h.db.First(&wish, "id = ?", id)
	c.JSON(http.StatusOK, gin.H{"data": wish})
}

// DeleteWish - 删除想吃
// DELETE /api/meal/wishes/:id
func (h *MealWishHandler) DeleteWish(c *gin.Context) {
	id := c.Param("id")

	result := h.db.Delete(&models.MealWish{}, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "已删除"})
}

// MarkDone - 标记已吃
// POST /api/meal/wishes/:id/done
func (h *MealWishHandler) MarkDone(c *gin.Context) {
	id := c.Param("id")

	var wish models.MealWish
	if err := h.db.First(&wish, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	now := time.Now()
	wish.Status = "done"
	wish.DoneAt = &now

	if err := h.db.Save(&wish).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}

	// 可选：同时创建吃饭历史
	var body struct {
		Rating  int    `json:"rating"`
		Comment string `json:"comment"`
	}
	c.ShouldBindJSON(&body)

	history := models.MealHistory{
		ID:      uuid.New().String(),
		Name:    wish.Name,
		Icon:    wish.Icon,
		Source:  "wishlist",
		Rating:  body.Rating,
		Comment: body.Comment,
	}
	h.db.Create(&history)

	c.JSON(http.StatusOK, gin.H{"data": wish, "message": "好吃吗？😋"})
}

// GetRecommendation - 随机推荐
// GET /api/meal/recommend?category=xxx
func (h *MealWishHandler) GetRecommendation(c *gin.Context) {
	// 从数据库获取菜谱
	var recipes []models.Recipe
	query := h.db.Preload("Ingredients")

	if err := query.Order("RANDOM()").Limit(1).Find(&recipes).Error; err != nil || len(recipes) == 0 {
		c.JSON(http.StatusOK, gin.H{"data": gin.H{
			"recipe": gin.H{
				"id":   "default",
				"name": "西红柿炒蛋",
				"icon": "🍳",
				"cookTime": 15,
				"difficulty": "easy",
				"tags": []string{"快手", "中餐"},
			},
			"matchedFridgeItems": []string{},
			"reason": "经典家常菜，简单又美味~",
		}})
		return
	}

	recipe := recipes[0]

	// 检查冰箱匹配
	var fridgeItems []models.FridgeItem
	h.db.Where("status != ?", "expired").Find(&fridgeItems)

	matched := []string{}
	for _, ingredient := range recipe.Ingredients {
		for _, item := range fridgeItems {
			if item.Name == ingredient.Name {
				matched = append(matched, item.Name)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{
		"recipe":             recipe,
		"matchedFridgeItems": matched,
		"reason":             "根据你的冰箱库存推荐~",
	}})
}

// GetHistory - 获取吃饭历史
// GET /api/meal/history?limit=20
func (h *MealWishHandler) GetHistory(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "20")
	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	var history []models.MealHistory
	if err := h.db.Order("created_at desc").Limit(limit).Find(&history).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": history})
}

// AddHistory - 记录吃饭历史
// POST /api/meal/history
func (h *MealWishHandler) AddHistory(c *gin.Context) {
	var entry models.MealHistory
	if err := c.ShouldBindJSON(&entry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	entry.ID = uuid.New().String()

	if err := h.db.Create(&entry).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": entry})
}
