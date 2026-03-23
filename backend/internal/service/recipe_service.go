package service

import (
	"context"
	"encoding/json"
	"math"
	"math/rand"
	"strings"
	"time"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/repository"
)

// RecipeService - 菜谱业务逻辑层
type RecipeService struct {
	repo *repository.RecipeRepository
}

func NewRecipeService(repo *repository.RecipeRepository) *RecipeService {
	return &RecipeService{repo: repo}
}

func (s *RecipeService) GetAllRecipes(ctx context.Context) ([]models.Recipe, error) {
	return s.repo.GetAll(ctx)
}

func (s *RecipeService) GetRecipe(ctx context.Context, id string) (*models.Recipe, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *RecipeService) GetRandomRecipes(ctx context.Context, limit int) ([]models.Recipe, error) {
	return s.repo.GetRandom(ctx, limit)
}

func (s *RecipeService) CreateRecipe(ctx context.Context, recipe *models.Recipe) error {
	recipe.ID = generateID()
	return s.repo.Create(ctx, recipe)
}

func (s *RecipeService) UpdateRecipe(ctx context.Context, recipe *models.Recipe) error {
	return s.repo.Update(ctx, recipe)
}

func (s *RecipeService) DeleteRecipe(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

// RecommendRecipes - 推荐菜谱
// 推荐优先级 = 口味匹配度 (40%) + 库存匹配度 (30%) + 时效性 (15%) + 多样性 (15%)
func (s *RecipeService) RecommendRecipes(ctx context.Context, fridgeItems []models.FridgeItem, preferences models.UserPreferences) ([]models.Recipe, error) {
	allRecipes, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	// Build ingredient map from fridge
	fridgeIngredientMap := make(map[string]int)
	for _, item := range fridgeItems {
		fridgeIngredientMap[strings.ToLower(item.Name)] = item.Quantity
	}

	// Parse preferences
	var favoriteTags, dislikedTags []string
	json.Unmarshal([]byte(preferences.FavoriteTags), &favoriteTags)
	json.Unmarshal([]byte(preferences.DislikedTags), &dislikedTags)

	// Score each recipe
	type scoredRecipe struct {
		recipe models.Recipe
		score  float64
	}

	var scored []scoredRecipe
	for _, recipe := range allRecipes {
		score := s.calculateRecipeScore(recipe, fridgeIngredientMap, favoriteTags, dislikedTags, preferences)
		if score > 0 {
			scored = append(scored, scoredRecipe{recipe: recipe, score: score})
		}
	}

	// Sort by score descending
	for i := 0; i < len(scored)-1; i++ {
		for j := i + 1; j < len(scored); j++ {
			if scored[j].score > scored[i].score {
				scored[i], scored[j] = scored[j], scored[i]
			}
		}
	}

	// Return top recipes
	var result []models.Recipe
	for _, sr := range scored {
		result = append(result, sr.recipe)
	}

	return result, nil
}

func (s *RecipeService) calculateRecipeScore(recipe models.Recipe, fridgeMap map[string]int, favoriteTags, dislikedTags []string, preferences models.UserPreferences) float64 {
	var score float64

	// 1. 口味匹配度 (40%)
	tasteScore := s.calculateTasteScore(recipe, favoriteTags, dislikedTags)
	score += tasteScore * 0.4

	// 2. 库存匹配度 (30%)
	inventoryScore := s.calculateInventoryScore(recipe, fridgeMap)
	score += inventoryScore * 0.3

	// 3. 时效性 (15%) - 基于食材新鲜度
	freshnessScore := s.calculateFreshnessScore(recipe, fridgeMap)
	score += freshnessScore * 0.15

	// 4. 多样性 (15%) - 避免重复推荐
	diversityScore := 1.0 // Default, could be adjusted based on history
	score += diversityScore * 0.15

	return score
}

func (s *RecipeService) calculateTasteScore(recipe models.Recipe, favoriteTags, dislikedTags []string) float64 {
	recipeTags := s.repo.GetTagsAsArray(recipe.Tags)
	
	score := 0.5 // Base score
	
	// Boost for favorite tags
	for _, tag := range recipeTags {
		for _, fav := range favoriteTags {
			if strings.EqualFold(tag, fav) {
				score += 0.3
			}
		}
		// Penalty for disliked tags
		for _, dis := range dislikedTags {
			if strings.EqualFold(tag, dis) {
				score -= 0.5
			}
		}
	}

	return math.Max(0, math.Min(1, score))
}

func (s *RecipeService) calculateInventoryScore(recipe models.Recipe, fridgeMap map[string]int) float64 {
	if len(recipe.Ingredients) == 0 {
		return 0.5
	}

	matchCount := 0
	for _, ing := range recipe.Ingredients {
		if qty, exists := fridgeMap[strings.ToLower(ing.Name)]; exists && qty >= ing.Quantity {
			matchCount++
		}
	}

	return float64(matchCount) / float64(len(recipe.Ingredients))
}

func (s *RecipeService) calculateFreshnessScore(recipe models.Recipe, fridgeMap map[string]int) float64 {
	// Simplified: assume ingredients in fridge are fresh
	// In production, this would check actual expiry dates
	return 0.8
}

// VoteRecipe - 菜谱投票
func (s *RecipeService) VoteRecipe(ctx context.Context, recipeID, voter string, rating int) error {
	if rating < 1 || rating > 5 {
		return ErrInvalidRating
	}

	vote := &models.RecipeVote{
		ID:        generateID(),
		RecipeID:  recipeID,
		Voter:     voter,
		Rating:    rating,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.repo.CreateVote(ctx, vote); err != nil {
		return err
	}

	// Update average rating
	votes, err := s.repo.GetRecipeVotes(ctx, recipeID)
	if err != nil {
		return err
	}

	var total int
	for _, v := range votes {
		total += v.Rating
	}
	avgRating := float64(total) / float64(len(votes))

	return s.repo.UpdateRating(ctx, recipeID, avgRating, len(votes))
}
