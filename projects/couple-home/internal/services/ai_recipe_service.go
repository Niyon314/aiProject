package services

import (
	"context"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/go-resty/resty/v2"
)

// AIRecipeService AI 菜谱服务
type AIRecipeService struct {
	apiKey     string
	apiBase    string
	httpClient *resty.Client
}

// RecipeIngredient 菜谱食材
type RecipeIngredient struct {
	Name        string  `json:"name"`
	Quantity    float64 `json:"quantity"`
	Unit        string  `json:"unit"`
	HasInFridge bool    `json:"hasInFridge"`
}

// Recipe 菜谱
type Recipe struct {
	ID                 string             `json:"id"`
	Name               string             `json:"name"`
	Description        string             `json:"description"`
	Ingredients        []RecipeIngredient `json:"ingredients"`
	Steps              []string           `json:"steps"`
	CookTime           int                `json:"cookTime"`
	Difficulty         string             `json:"difficulty"`
	Calories           int                `json:"calories"`
	Tags               []string           `json:"tags"`
	ImageURL           string             `json:"imageUrl,omitempty"`
	MatchScore         int                `json:"matchScore"`
	MissingIngredients []string           `json:"missingIngredients"`
}

// AIRecommendRequest AI 推荐请求
type AIRecommendRequest struct {
	FridgeItemIds      []string `json:"fridgeItemIds,omitempty"`
	Preferences        []string `json:"preferences,omitempty"`
	ExcludeIngredients []string `json:"excludeIngredients,omitempty"`
	MaxResults         int      `json:"maxResults,omitempty"`
}

// AIRecommendResponse AI 推荐响应
type AIRecommendResponse struct {
	Recipes              []Recipe `json:"recipes"`
	TotalRecipes         int      `json:"totalRecipes"`
	RecommendationReason string   `json:"recommendationReason"`
}

// ShoppingListItem 购物清单项
type ShoppingListItem struct {
	Name             string   `json:"name"`
	Quantity         float64  `json:"quantity"`
	Unit             string   `json:"unit"`
	Category         string   `json:"category"`
	EstimatedPrice   float64  `json:"estimatedPrice"`
	Recipes          []string `json:"recipes"`
}

// ShoppingListRequest 购物清单请求
type ShoppingListRequest struct {
	RecipeIDs []string `json:"recipeIds"`
}

// ShoppingListResponse 购物清单响应
type ShoppingListResponse struct {
	Items               []ShoppingListItem `json:"items"`
	TotalEstimatedPrice float64            `json:"totalEstimatedPrice"`
	TotalItems          int                `json:"totalItems"`
}

// FridgeItem 冰箱食材 (简化版)
type FridgeItem struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Quantity float64 `json:"quantity"`
	Unit     string  `json:"unit"`
	Category string  `json:"category"`
}

// NewAIRecipeService 创建 AI 菜谱服务
func NewAIRecipeService(apiKey, apiBase string) *AIRecipeService {
	if apiBase == "" {
		apiBase = "https://dashscope.aliyuncs.com/api/v1"
	}

	client := resty.New().
		SetBaseURL(apiBase).
		SetHeader("Authorization", "Bearer "+apiKey).
		SetHeader("Content-Type", "application/json").
		SetTimeout(30 * time.Second)

	return &AIRecipeService{
		apiKey:     apiKey,
		apiBase:    apiBase,
		httpClient: client,
	}
}

// GetFridgeItems 获取冰箱食材 (从本地数据库)
func (s *AIRecipeService) GetFridgeItems(ctx context.Context) ([]FridgeItem, error) {
	// TODO: 实际项目中应该从数据库查询
	// 这里返回示例数据
	return []FridgeItem{
		{ID: "1", Name: "西红柿", Quantity: 3, Unit: "个", Category: "vegetable"},
		{ID: "2", Name: "鸡蛋", Quantity: 5, Unit: "个", Category: "egg"},
		{ID: "3", Name: "米饭", Quantity: 2, Unit: "碗", Category: "staple"},
		{ID: "4", Name: "猪肉", Quantity: 200, Unit: "克", Category: "meat"},
		{ID: "5", Name: "青菜", Quantity: 1, Unit: "把", Category: "vegetable"},
	}, nil
}

// AIRecommend AI 推荐菜谱
func (s *AIRecipeService) AIRecommend(ctx context.Context, req AIRecommendRequest) (*AIRecommendResponse, error) {
	// 获取冰箱食材
	fridgeItems, err := s.GetFridgeItems(ctx)
	if err != nil {
		return nil, fmt.Errorf("获取食材失败：%w", err)
	}

	// 调用 AI API 或使用本地推荐
	_ = fridgeItems // 暂时不使用，避免编译警告
	recipes := s.generateLocalRecipes(nil)

	// 计算匹配度
	for i := range recipes {
		s.calculateMatchScore(&recipes[i], fridgeItems)
	}

	// 限制返回数量
	maxResults := req.MaxResults
	if maxResults <= 0 {
		maxResults = 10
	}
	if len(recipes) > maxResults {
		recipes = recipes[:maxResults]
	}

	return &AIRecommendResponse{
		Recipes:              recipes,
		TotalRecipes:         len(recipes),
		RecommendationReason: s.generateRecommendationReason(recipes, fridgeItems),
	}, nil
}

// GenerateShoppingList 生成购物清单
func (s *AIRecipeService) GenerateShoppingList(ctx context.Context, req ShoppingListRequest) (*ShoppingListResponse, error) {
	// 获取菜谱详情
	recipes := s.getRecipeDetails(req.RecipeIDs)

	// 获取冰箱食材 (用于判断哪些食材已有)
	fridgeItems, err := s.GetFridgeItems(ctx)
	if err != nil {
		return nil, fmt.Errorf("获取食材失败：%w", err)
	}

	// 构建购物清单
	shoppingList := make(map[string]*ShoppingListItem)
	_ = fridgeItems // 用于后续判断食材是否已有

	for _, recipe := range recipes {
		for _, ingredient := range recipe.Ingredients {
			if ingredient.HasInFridge {
				continue
			}

			key := ingredient.Name
			if existing, ok := shoppingList[key]; ok {
				existing.Quantity += ingredient.Quantity
				existing.Recipes = append(existing.Recipes, recipe.Name)
			} else {
				shoppingList[key] = &ShoppingListItem{
					Name:           ingredient.Name,
					Quantity:       ingredient.Quantity,
					Unit:           ingredient.Unit,
					Category:       s.ingredientToCategory(ingredient.Name),
					EstimatedPrice: s.estimatePrice(ingredient),
					Recipes:        []string{recipe.Name},
				}
			}
		}
	}

	// 转换为列表
	items := make([]ShoppingListItem, 0, len(shoppingList))
	totalPrice := 0.0
	for _, item := range shoppingList {
		items = append(items, *item)
		totalPrice += item.EstimatedPrice
	}

	return &ShoppingListResponse{
		Items:               items,
		TotalEstimatedPrice: totalPrice,
		TotalItems:          len(items),
	}, nil
}

// GetRecipeDetail 获取菜谱详情
func (s *AIRecipeService) GetRecipeDetail(ctx context.Context, recipeID string) (*Recipe, error) {
	recipes := s.getRecipeDetails([]string{recipeID})
	if len(recipes) == 0 {
		return nil, fmt.Errorf("菜谱不存在")
	}
	return &recipes[0], nil
}

// generateLocalRecipes 生成本地推荐菜谱
func (s *AIRecipeService) generateLocalRecipes(fridgeItems []FridgeItem) []Recipe {
	recipeTemplates := []struct {
		name        string
		description string
		ingredients []string
		cookTime    int
		difficulty  string
		calories    int
		tags        []string
	}{
		{name: "西红柿炒蛋", description: "经典家常菜，酸甜可口", ingredients: []string{"西红柿", "鸡蛋", "盐", "糖", "油"}, cookTime: 15, difficulty: "easy", calories: 280, tags: []string{"家常菜", "快手菜", "素食"}},
		{name: "蛋炒饭", description: "简单美味的快手主食", ingredients: []string{"米饭", "鸡蛋", "盐", "油", "葱花"}, cookTime: 20, difficulty: "easy", calories: 450, tags: []string{"主食", "快手菜"}},
		{name: "青椒肉丝", description: "鲜嫩可口的下饭菜", ingredients: []string{"猪肉", "青椒", "盐", "酱油", "淀粉"}, cookTime: 25, difficulty: "medium", calories: 380, tags: []string{"家常菜", "下饭菜"}},
		{name: "清炒时蔬", description: "健康清爽的素菜", ingredients: []string{"青菜", "盐", "油", "蒜"}, cookTime: 10, difficulty: "easy", calories: 120, tags: []string{"素食", "健康", "快手菜"}},
		{name: "西红柿鸡蛋汤", description: "温暖开胃的家常汤品", ingredients: []string{"西红柿", "鸡蛋", "盐", "香油", "葱花"}, cookTime: 15, difficulty: "easy", calories: 150, tags: []string{"汤品", "家常菜"}},
	}

	recipes := make([]Recipe, 0, len(recipeTemplates))
	for _, template := range recipeTemplates {
		recipe := Recipe{
			ID:          fmt.Sprintf("recipe_%d", rand.Intn(10000)),
			Name:        template.name,
			Description: template.description,
			CookTime:    template.cookTime,
			Difficulty:  template.difficulty,
			Calories:    template.calories,
			Tags:        template.tags,
			Steps:       []string{"准备食材", "开始烹饪", "装盘享用"},
		}

		for _, ingName := range template.ingredients {
			hasInFridge := false
			for _, item := range fridgeItems {
				if strings.Contains(item.Name, ingName) || strings.Contains(ingName, item.Name) {
					hasInFridge = true
					break
				}
			}

			recipe.Ingredients = append(recipe.Ingredients, RecipeIngredient{
				Name:        ingName,
				Quantity:    1,
				Unit:        "份",
				HasInFridge: hasInFridge,
			})
		}

		recipes = append(recipes, recipe)
	}

	return recipes
}

// calculateMatchScore 计算匹配度
func (s *AIRecipeService) calculateMatchScore(recipe *Recipe, fridgeItems []FridgeItem) {
	totalIngredients := len(recipe.Ingredients)
	if totalIngredients == 0 {
		recipe.MatchScore = 0
		return
	}

	hasCount := 0
	for i := range recipe.Ingredients {
		ing := &recipe.Ingredients[i]
		for _, item := range fridgeItems {
			if strings.Contains(item.Name, ing.Name) || strings.Contains(ing.Name, item.Name) {
				ing.HasInFridge = true
				hasCount++
				break
			}
		}

		if !ing.HasInFridge && !s.isBasicSeasoning(ing.Name) {
			recipe.MissingIngredients = append(recipe.MissingIngredients, ing.Name)
		}
	}

	recipe.MatchScore = int(float64(hasCount) / float64(totalIngredients) * 100)
}

// isBasicSeasoning 判断是否是基础调料
func (s *AIRecipeService) isBasicSeasoning(name string) bool {
	basicSeasonings := []string{"盐", "糖", "油", "酱油", "醋", "味精", "鸡精", "淀粉", "葱花", "蒜", "姜"}
	for _, seasoning := range basicSeasonings {
		if strings.Contains(name, seasoning) {
			return true
		}
	}
	return false
}

// generateRecommendationReason 生成推荐理由
func (s *AIRecipeService) generateRecommendationReason(recipes []Recipe, fridgeItems []FridgeItem) string {
	if len(recipes) == 0 {
		return "暂无推荐"
	}

	totalScore := 0
	for _, recipe := range recipes {
		totalScore += recipe.MatchScore
	}
	avgScore := totalScore / len(recipes)

	reason := fmt.Sprintf("根据您的 %d 种食材，为您精选了 %d 道菜谱，平均匹配度 %d%%。",
		len(fridgeItems), len(recipes), avgScore)

	if avgScore >= 80 {
		reason += " 您的食材很丰富，可以做很多美味哦！"
	} else if avgScore >= 60 {
		reason += " 大部分食材都匹配，少量需要采购的食材已标注。"
	} else {
		reason += " 建议补充一些食材以获得更多选择。"
	}

	return reason
}

// ingredientToCategory 食材转分类
func (s *AIRecipeService) ingredientToCategory(name string) string {
	if strings.ContainsAny(name, "青菜白菜菠菜生菜油菜芹菜") {
		return "vegetable"
	}
	if strings.ContainsAny(name, "猪牛羊鸡鸭鱼虾肉") {
		return "meat"
	}
	if strings.ContainsAny(name, "米面饭馒头面条") {
		return "staple"
	}
	return "other"
}

// estimatePrice 估算价格
func (s *AIRecipeService) estimatePrice(ingredient RecipeIngredient) float64 {
	basePrices := map[string]float64{
		"vegetable": 5.0,
		"meat":      20.0,
		"staple":    3.0,
		"other":     10.0,
	}

	category := s.ingredientToCategory(ingredient.Name)
	basePrice := basePrices[category]

	return basePrice * ingredient.Quantity * 0.5
}

// getRecipeDetails 获取菜谱详情
func (s *AIRecipeService) getRecipeDetails(recipeIDs []string) []Recipe {
	allRecipes := s.generateLocalRecipes(nil)

	if len(recipeIDs) == 0 {
		return allRecipes
	}

	result := make([]Recipe, 0, len(recipeIDs))
	for i, id := range recipeIDs {
		if i < len(allRecipes) {
			recipe := allRecipes[i]
			recipe.ID = id
			result = append(result, recipe)
		}
	}

	return result
}
