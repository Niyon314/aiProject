package handlers

import (
	"couple-home/internal/services"

	"github.com/gin-gonic/gin"
)

// RecipeAIHandler AI 菜谱推荐处理器
type RecipeAIHandler struct {
	recipeService *services.AIRecipeService
}

// NewRecipeAIHandler 创建 AI 菜谱推荐处理器
func NewRecipeAIHandler(apiKey, apiBase string) *RecipeAIHandler {
	return &RecipeAIHandler{
		recipeService: services.NewAIRecipeService(apiKey, apiBase),
	}
}

// GetFridgeItems 获取冰箱食材
// GET /api/fridge
func (h *RecipeAIHandler) GetFridgeItems(c *gin.Context) {
	items, err := h.recipeService.GetFridgeItems(c.Request.Context())
	if err != nil {
		Error(c, 500, "获取食材失败："+err.Error())
		return
	}

	Success(c, items)
}

// AIRecommend AI 推荐菜谱
// POST /api/recipes/ai-recommend
func (h *RecipeAIHandler) AIRecommend(c *gin.Context) {
	var req services.AIRecommendRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, 400, "参数错误："+err.Error())
		return
	}

	response, err := h.recipeService.AIRecommend(c.Request.Context(), req)
	if err != nil {
		Error(c, 500, "AI 推荐失败："+err.Error())
		return
	}

	Success(c, response)
}

// GenerateShoppingList 生成购物清单
// POST /api/recipes/shopping-list
func (h *RecipeAIHandler) GenerateShoppingList(c *gin.Context) {
	var req services.ShoppingListRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, 400, "参数错误："+err.Error())
		return
	}

	if len(req.RecipeIDs) == 0 {
		Error(c, 400, "请至少选择一个菜谱")
		return
	}

	response, err := h.recipeService.GenerateShoppingList(c.Request.Context(), req)
	if err != nil {
		Error(c, 500, "生成购物清单失败："+err.Error())
		return
	}

	Success(c, response)
}

// GetRecipeDetail 获取菜谱详情
// GET /api/recipes/:id
func (h *RecipeAIHandler) GetRecipeDetail(c *gin.Context) {
	recipeID := c.Param("id")
	if recipeID == "" {
		Error(c, 400, "缺少菜谱 ID")
		return
	}

	recipe, err := h.recipeService.GetRecipeDetail(c.Request.Context(), recipeID)
	if err != nil {
		if err.Error() == "菜谱不存在" {
			Error(c, 404, "菜谱不存在")
		} else {
			Error(c, 500, "获取菜谱失败："+err.Error())
		}
		return
	}

	response := gin.H{
		"recipe": recipe,
		"nutritionInfo": gin.H{
			"protein": recipe.Calories / 4,
			"fat":     recipe.Calories / 9,
			"carbs":   recipe.Calories / 4,
			"fiber":   5,
		},
		"tips": []string{
			"火候控制是关键",
			"食材新鲜度影响口感",
			"可根据个人口味调整调料",
		},
	}

	Success(c, response)
}

// RegisterRecipeAIRoutes 注册 AI 菜谱推荐路由
func RegisterRecipeAIRoutes(r *gin.RouterGroup, apiKey, apiBase string) {
	handler := NewRecipeAIHandler(apiKey, apiBase)

	// 不需要认证的路由
	r.GET("/fridge", handler.GetFridgeItems)
	r.GET("/recipes/:id", handler.GetRecipeDetail)

	// AI 推荐和购物清单
	r.POST("/recipes/ai-recommend", handler.AIRecommend)
	r.POST("/recipes/shopping-list", handler.GenerateShoppingList)
}
