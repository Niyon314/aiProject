package models

import (
	"time"

	"gorm.io/gorm"
)

// FridgeItem - 冰箱食材
type FridgeItem struct {
	ID         string         `gorm:"primaryKey" json:"id"`
	Name       string         `gorm:"size:100;not null" json:"name"`
	Icon       string         `gorm:"size:50" json:"icon"`
	Quantity   int            `gorm:"not null" json:"quantity"`
	Unit       string         `gorm:"size:20" json:"unit"`
	ExpiryDate *time.Time     `json:"expiryDate,omitempty"`
	AddedAt    time.Time      `gorm:"autoCreateTime" json:"addedAt"`
	Category   string         `gorm:"size:30" json:"category"` // vegetable/meat/seafood/egg/staple/condiment
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// RecipeIngredient - 菜谱食材
type RecipeIngredient struct {
	ID        string `gorm:"primaryKey" json:"id"`
	RecipeID  string `gorm:"size:36;not null;index" json:"recipeId"`
	Name      string `gorm:"size:100;not null" json:"name"`
	Quantity  int    `gorm:"not null" json:"quantity"`
	Unit      string `gorm:"size:20" json:"unit"`
	Icon      string `gorm:"size:50" json:"icon"`
	Category  string `gorm:"size:30" json:"category"`
}

// Recipe - 菜谱
type Recipe struct {
	ID          string             `gorm:"primaryKey" json:"id"`
	Name        string             `gorm:"size:100;not null" json:"name"`
	Icon        string             `gorm:"size:50" json:"icon"`
	Ingredients []RecipeIngredient `gorm:"foreignKey:RecipeID;constraint:OnDelete:CASCADE" json:"ingredients"`
	CookTime    int                `gorm:"not null" json:"cookTime"` // minutes
	Difficulty  string             `gorm:"size:10" json:"difficulty"` // easy/medium/hard
	Cost        float64            `gorm:"type:decimal(10,2)" json:"cost"`
	Tags        string             `gorm:"type:text" json:"tags"` // JSON array stored as text
	AvgRating   float64            `gorm:"type:decimal(3,2);default:0" json:"avgRating"`
	RateCount   int                `gorm:"default:0" json:"rateCount"`
	CreatedAt   time.Time          `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time          `gorm:"autoUpdateTime" json:"updatedAt"`
}

// Bill - 账单
type Bill struct {
	ID                 string     `gorm:"primaryKey" json:"id"`
	Title              string     `gorm:"size:100;not null" json:"title"`
	Amount             float64    `gorm:"type:decimal(10,2);not null" json:"amount"`
	Payer              string     `gorm:"size:50;not null" json:"payer"` // user/partner
	Date               time.Time  `gorm:"not null" json:"date"`
	Category           string     `gorm:"size:30" json:"category"`
	Photo              *string    `gorm:"size:255" json:"photo,omitempty"`
	Note               *string    `gorm:"type:text" json:"note,omitempty"`
	IsShared           bool       `gorm:"default:true" json:"isShared"`
	FundContributionID *string    `gorm:"size:36" json:"fundContributionId,omitempty"`
	CreatedAt          time.Time  `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt          time.Time  `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
}

// CommonFund - 共同基金
type CommonFund struct {
	ID            string    `gorm:"primaryKey" json:"id"`
	Name          string    `gorm:"size:100;not null" json:"name"`
	TargetAmount  float64   `gorm:"type:decimal(10,2);not null" json:"targetAmount"`
	CurrentAmount float64   `gorm:"type:decimal(10,2);default:0" json:"currentAmount"`
	MonthlyGoal   float64   `gorm:"type:decimal(10,2)" json:"monthlyGoal"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

// FundContribution - 基金存入记录
type FundContribution struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	FundID      string    `gorm:"size:36;not null;index" json:"fundId"`
	Amount      float64   `gorm:"type:decimal(10,2);not null" json:"amount"`
	Contributor string    `gorm:"size:50;not null" json:"contributor"` // user/partner
	Note        *string   `gorm:"type:text" json:"note,omitempty"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// UserPreferences - 用户偏好
type UserPreferences struct {
	ID              string   `gorm:"primaryKey" json:"id"`
	FavoriteTags    string   `gorm:"type:text" json:"favoriteTags"` // JSON array
	DislikedTags    string   `gorm:"type:text" json:"dislikedTags"` // JSON array
	MaxCookTime     int      `gorm:"default:60" json:"maxCookTime"`
	MaxDifficulty   string   `gorm:"size:10;default:medium" json:"maxDifficulty"`
	BudgetPerMeal   float64  `gorm:"type:decimal(10,2)" json:"budgetPerMeal"`
	DietaryRestrictions string `gorm:"type:text" json:"dietaryRestrictions"`
}

// RecipeVote - 菜谱投票
type RecipeVote struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	RecipeID  string    `gorm:"size:36;not null;index" json:"recipeId"`
	Voter     string    `gorm:"size:50;not null" json:"voter"` // user/partner
	Rating    int       `gorm:"not null" json:"rating"` // 1-5
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}
