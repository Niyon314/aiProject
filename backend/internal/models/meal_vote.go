package models

import (
	"time"

	"gorm.io/gorm"
)

// MealVote - 投票记录
// 代表一次吃饭投票活动，包含多个选项和投票状态
type MealVote struct {
	ID        string      `gorm:"primaryKey" json:"id"`
	Date      string      `gorm:"size:10;not null;index" json:"date"`           // 投票日期 (YYYY-MM-DD)
	MealType  string      `gorm:"size:10;not null" json:"mealType"`             // 餐食类型：lunch/dinner
	Options   []MealOption `gorm:"foreignKey:VoteID;constraint:OnDelete:CASCADE" json:"options"` // 选项列表
	UserVote  *UserVote   `gorm:"foreignKey:VoteID;constraint:OnDelete:CASCADE" json:"userVote,omitempty"`  // 当前用户投票
	PartnerVote *UserVote `gorm:"foreignKey:VoteID;constraint:OnDelete:CASCADE" json:"partnerVote,omitempty"` // 伴侣投票（仅自己投票后可见）
	ResultID  *string     `gorm:"size:36" json:"resultId,omitempty"`            // 匹配结果的选项 ID
	Result    *MealOption `gorm:"foreignKey:ResultID;constraint:OnDelete:SET NULL" json:"result,omitempty"`   // 匹配结果
	Status    string      `gorm:"size:20;default:pending" json:"status"`        // pending/voted/completed
	CreatedAt time.Time   `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time   `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// MealOption - 投票选项
// 代表一个可供选择的菜谱选项
type MealOption struct {
	ID         string  `gorm:"primaryKey" json:"id"`
	VoteID     string  `gorm:"size:36;not null;index" json:"voteId"` // 所属投票 ID
	RecipeID   string  `gorm:"size:36;not null" json:"recipeId"`     // 菜谱 ID
	Name       string  `gorm:"size:100;not null" json:"name"`        // 菜谱名称
	Icon       string  `gorm:"size:50" json:"icon"`                  // emoji 图标
	CookTime   int     `gorm:"not null" json:"cookTime"`             // 烹饪时间 (分钟)
	Difficulty string  `gorm:"size:10" json:"difficulty"`            // 难度：easy/medium/hard
	Cost       float64 `gorm:"type:decimal(10,2)" json:"cost"`       // 预估成本
	Tags       string  `gorm:"type:text" json:"tags"`                // JSON array stored as text
	LikeCount  int     `gorm:"default:0" json:"likeCount"`           // 点赞数
	DislikeCount int   `gorm:"default:0" json:"dislikeCount"`        // 不喜欢数
	VetoCount  int     `gorm:"default:0" json:"vetoCount"`           // veto 数
}

// UserVote - 用户投票
// 记录用户对某个投票的选择
type UserVote struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	VoteID    string    `gorm:"size:36;not null;uniqueIndex:idx_vote_voter" json:"voteId"` // 投票 ID
	Voter     string    `gorm:"size:50;not null;uniqueIndex:idx_vote_voter" json:"voter"`  // 投票人：user/partner
	OptionID  string    `gorm:"size:36;not null" json:"optionId"`                          // 选择的选项 ID
	VoteType  string    `gorm:"size:10;not null" json:"type"`                              // like/dislike/veto
	Timestamp time.Time `gorm:"autoCreateTime" json:"timestamp"`
}

// TableName - 指定表名
func (MealVote) TableName() string {
	return "meal_votes"
}

// TableName - 指定表名
func (MealOption) TableName() string {
	return "meal_options"
}

// TableName - 指定表名
func (UserVote) TableName() string {
	return "user_votes"
}
