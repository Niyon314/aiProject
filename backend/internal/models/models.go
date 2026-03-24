package models

import (
	"time"

	"couple-home/backend/pkg/utils"
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

// ThemeConfig - 主题配置
type ThemeConfig struct {
	ID            string    `gorm:"primaryKey" json:"id"`
	Theme         string    `gorm:"size:20;not null" json:"theme"` // pink/dark/blue/green/purple/orange
	Rounded       string    `gorm:"size:10;not null" json:"rounded"` // xs/sm/md/lg/xl
	Animation     string    `gorm:"size:10;not null" json:"animation"` // none/low/medium/high/extreme
	CustomColor   *string   `gorm:"size:20" json:"customColor,omitempty"` // 自定义主色
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

// WishlistStatus 愿望状态
type WishlistStatus string

const (
	WishlistStatusPending   WishlistStatus = "pending"   // 待实现
	WishlistStatusCompleted WishlistStatus = "completed" // 已完成
)

// WishlistItem 愿望项目模型
type WishlistItem struct {
	ID            string         `gorm:"primaryKey" json:"id"`
	Title         string         `gorm:"size:100;not null" json:"title"`
	Description   string         `gorm:"type:text" json:"description"`
	Budget        float64        `gorm:"type:decimal(10,2);not null" json:"budget"`
	CurrentAmount float64        `gorm:"type:decimal(10,2);default:0" json:"currentAmount"`
	Priority      int            `gorm:"not null" json:"priority"` // 1-5 星
	Status        WishlistStatus `gorm:"default:'pending'" json:"status"`
	Deadline      *time.Time     `json:"deadline,omitempty"`
	CreatedBy     string         `gorm:"size:50;not null" json:"createdBy"`
	CreatedAt     time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt     time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	CompletedAt   *time.Time     `json:"completedAt,omitempty"`
}

// WishlistContribution 愿望助力记录
type WishlistContribution struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	ItemID    string    `gorm:"size:36;not null;index" json:"itemId"`
	UserID    string    `gorm:"size:50;not null" json:"userId"`
	Amount    float64   `gorm:"type:decimal(10,2);not null" json:"amount"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

// CreateWishlistItemRequest 创建愿望请求
type CreateWishlistItemRequest struct {
	Title       string  `json:"title" binding:"required,min=1,max=100"`
	Description string  `json:"description" binding:"max=500"`
	Budget      float64 `json:"budget" binding:"required,gt=0"`
	Priority    int     `json:"priority" binding:"required,min=1,max=5"`
	Deadline    string  `json:"deadline,omitempty"`
}

// ContributeRequest 助力请求
type ContributeRequest struct {
	Amount float64 `json:"amount" binding:"required,gt=0"`
}

// NewWishlistItem 创建新的愿望项目实例
func NewWishlistItem(createdBy, title, description string, budget float64, priority int, deadline *time.Time) *WishlistItem {
	return &WishlistItem{
		ID:            utils.GenerateID(),
		Title:         title,
		Description:   description,
		Budget:        budget,
		CurrentAmount: 0,
		Priority:      priority,
		Status:        WishlistStatusPending,
		Deadline:      deadline,
		CreatedBy:     createdBy,
	}
}

// NewContribution 创建新的助力记录
func NewContribution(itemID, userID string, amount float64) *WishlistContribution {
	return &WishlistContribution{
		ID:        utils.GenerateID(),
		ItemID:    itemID,
		UserID:    userID,
		Amount:    amount,
	}
}

// AddContribution 添加助力金额
func (w *WishlistItem) AddContribution(amount float64) {
	w.CurrentAmount += amount
	w.UpdatedAt = time.Now()
}

// MarkCompleted 标记愿望完成
func (w *WishlistItem) MarkCompleted() {
	w.Status = WishlistStatusCompleted
	w.UpdatedAt = time.Now()
	now := time.Now()
	w.CompletedAt = &now
}

// GetProgress 获取进度百分比
func (w *WishlistItem) GetProgress() float64 {
	if w.Budget <= 0 {
		return 0
	}
	progress := (w.CurrentAmount / w.Budget) * 100
	if progress > 100 {
		progress = 100
	}
	return progress
}

// Diary 恋爱日记模型
type Diary struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	Privacy   string    `gorm:"size:20;default:'private'" json:"privacy"` // private, shared
	Date      string    `gorm:"size:10;not null;index" json:"date"`       // YYYY-MM-DD format
	Photos    string    `gorm:"type:text" json:"photos"`                  // JSON array of photo URLs
	CreatedBy string    `gorm:"size:50;not null" json:"createdBy"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

// CreateDiaryRequest 创建日记请求
type CreateDiaryRequest struct {
	Content string   `json:"content" binding:"required,min=1,max=5000"`
	Privacy string   `json:"privacy" binding:"omitempty,oneof=private shared"`
	Date    string   `json:"date" binding:"required"` // YYYY-MM-DD
	Photos  []string `json:"photos" gorm:"-"`
}

// UpdateDiaryRequest 更新日记请求
type UpdateDiaryRequest struct {
	Content string `json:"content,omitempty"`
	Privacy string `json:"privacy,omitempty"`
}

// PrivacyUpdateRequest 隐私设置更新请求
type PrivacyUpdateRequest struct {
	Privacy string `json:"privacy" binding:"required,oneof=private shared"`
}

// PhotoUploadRequest 照片上传请求
type PhotoUploadRequest struct {
	PhotoURLs []string `json:"photoUrls" binding:"required"`
}

// NewDiary 创建新的日记实例
func NewDiary(createdBy string, req CreateDiaryRequest) *Diary {
	photosJSON := "[]"
	if len(req.Photos) > 0 {
		photosJSON = "["
		for i, url := range req.Photos {
			if i > 0 {
				photosJSON += ","
			}
			photosJSON += `"` + url + `"`
		}
		photosJSON += "]"
	}

	return &Diary{
		ID:        utils.GenerateID(),
		Content:   req.Content,
		Privacy:   req.Privacy,
		Date:      req.Date,
		Photos:    photosJSON,
		CreatedBy: createdBy,
	}
}

// Update 更新日记
func (d *Diary) Update(req UpdateDiaryRequest) {
	if req.Content != "" {
		d.Content = req.Content
	}
	if req.Privacy != "" {
		d.Privacy = req.Privacy
	}
	d.UpdatedAt = time.Now()
}

// UpdatePrivacy 更新隐私设置
func (d *Diary) UpdatePrivacy(privacy string) {
	d.Privacy = privacy
	d.UpdatedAt = time.Now()
}
