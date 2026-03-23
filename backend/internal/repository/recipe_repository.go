package repository

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"couple-home/backend/internal/models"
	"gorm.io/gorm"
)

// RecipeRepository - 菜谱数据访问层
type RecipeRepository struct {
	db *gorm.DB
}

func NewRecipeRepository(db *gorm.DB) *RecipeRepository {
	return &RecipeRepository{db: db}
}

func (r *RecipeRepository) GetAll(ctx context.Context) ([]models.Recipe, error) {
	var recipes []models.Recipe
	err := r.db.WithContext(ctx).Preload("Ingredients").Order("avg_rating DESC, created_at DESC").Find(&recipes).Error
	return recipes, err
}

func (r *RecipeRepository) GetByID(ctx context.Context, id string) (*models.Recipe, error) {
	var recipe models.Recipe
	err := r.db.WithContext(ctx).Preload("Ingredients").First(&recipe, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &recipe, nil
}

func (r *RecipeRepository) GetRandom(ctx context.Context, limit int) ([]models.Recipe, error) {
	var recipes []models.Recipe
	err := r.db.WithContext(ctx).Preload("Ingredients").Order("RANDOM()").Limit(limit).Find(&recipes).Error
	return recipes, err
}

func (r *RecipeRepository) Create(ctx context.Context, recipe *models.Recipe) error {
	return r.db.WithContext(ctx).Create(recipe).Error
}

func (r *RecipeRepository) Update(ctx context.Context, recipe *models.Recipe) error {
	return r.db.WithContext(ctx).Save(recipe).Error
}

func (r *RecipeRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&models.Recipe{}, "id = ?", id).Error
}

func (r *RecipeRepository) GetByTags(ctx context.Context, tags []string) ([]models.Recipe, error) {
	var recipes []models.Recipe
	err := r.db.WithContext(ctx).
		Preload("Ingredients").
		Where("tags LIKE ?", "%"+strings.Join(tags, "%")+"%").
		Find(&recipes).Error
	return recipes, err
}

func (r *RecipeRepository) UpdateRating(ctx context.Context, recipeID string, avgRating float64, rateCount int) error {
	return r.db.WithContext(ctx).
		Model(&models.Recipe{}).
		Where("id = ?", recipeID).
		Updates(map[string]interface{}{
			"avg_rating":  avgRating,
			"rate_count":  rateCount,
			"updated_at":  time.Now(),
		}).Error
}

func (r *RecipeRepository) GetRecipeVotes(ctx context.Context, recipeID string) ([]models.RecipeVote, error) {
	var votes []models.RecipeVote
	err := r.db.WithContext(ctx).Where("recipe_id = ?", recipeID).Find(&votes).Error
	return votes, err
}

func (r *RecipeRepository) CreateVote(ctx context.Context, vote *models.RecipeVote) error {
	// Check if vote exists, update if so
	existing := &models.RecipeVote{}
	err := r.db.WithContext(ctx).Where("recipe_id = ? AND voter = ?", vote.RecipeID, vote.Voter).First(existing).Error
	if err == nil {
		// Update existing vote
		existing.Rating = vote.Rating
		return r.db.WithContext(ctx).Save(existing).Error
	}
	// Create new vote
	return r.db.WithContext(ctx).Create(vote).Error
}

func (r *RecipeRepository) GetTagsAsArray(tagsStr string) []string {
	if tagsStr == "" {
		return []string{}
	}
	var tags []string
	json.Unmarshal([]byte(tagsStr), &tags)
	return tags
}
