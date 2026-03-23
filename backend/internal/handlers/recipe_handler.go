package handlers

import (
	"net/http"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/service"
	"github.com/gin-gonic/gin"
)

// RecipeHandler - 菜谱 HTTP 处理器
type RecipeHandler struct {
	service *service.RecipeService
}

func NewRecipeHandler(svc *service.RecipeService) *RecipeHandler {
	return &RecipeHandler{service: svc}
}

// GetAllRecipes - 获取菜谱列表
// GET /api/recipes
func (h *RecipeHandler) GetAllRecipes(c *gin.Context) {
	recipes, err := h.service.GetAllRecipes(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": recipes})
}

// GetRecipe - 获取菜谱详情
// GET /api/recipes/:id
func (h *RecipeHandler) GetRecipe(c *gin.Context) {
	id := c.Param("id")
	recipe, err := h.service.GetRecipe(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "recipe not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": recipe})
}

// GetRandomRecipes - 随机推荐菜谱
// GET /api/recipes/random
func (h *RecipeHandler) GetRandomRecipes(c *gin.Context) {
	limit := 3 // Default: 3 recipes
	recipes, err := h.service.GetRandomRecipes(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": recipes})
}

// VoteRecipe - 菜谱投票
// POST /api/recipes/:id/vote
func (h *RecipeHandler) VoteRecipe(c *gin.Context) {
	id := c.Param("id")
	
	var req struct {
		Voter  string `json:"voter" binding:"required"`
		Rating int    `json:"rating" binding:"required,min=1,max=5"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.VoteRecipe(c.Request.Context(), id, req.Voter, req.Rating); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "vote recorded successfully"})
}

// RecommendRecipes - 推荐菜谱 (基于冰箱库存和偏好)
// POST /api/recipes/recommend
func (h *RecipeHandler) RecommendRecipes(c *gin.Context) {
	var req struct {
		FridgeItems []models.FridgeItem   `json:"fridgeItems"`
		Preferences models.UserPreferences `json:"preferences"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	recipes, err := h.service.RecommendRecipes(c.Request.Context(), req.FridgeItems, req.Preferences)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return top 5 recommendations
	limit := 5
	if len(recipes) > limit {
		recipes = recipes[:limit]
	}

	c.JSON(http.StatusOK, gin.H{"data": recipes})
}
