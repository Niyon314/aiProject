package models

import (
	"time"

	"gorm.io/gorm"
)

// ChoreType - 家务任务类型
type ChoreType string

const (
	ChoreTypeDaily   ChoreType = "daily"   // 每日任务
	ChoreTypeWeekly  ChoreType = "weekly"  // 每周任务
	ChoreTypeMonthly ChoreType = "monthly" // 每月任务
	ChoreTypeOnce    ChoreType = "once"    // 临时任务
)

// ChoreStatus - 家务任务状态
type ChoreStatus string

const (
	ChoreStatusPending   ChoreStatus = "pending"   // 待认领
	ChoreStatusClaimed   ChoreStatus = "claimed"   // 已认领
	ChoreStatusCompleted ChoreStatus = "completed" // 已完成
	ChoreStatusOverdue   ChoreStatus = "overdue"   // 已逾期
)

// Assignee - 任务认领人
type Assignee string

const (
	AssigneeNone    Assignee = ""         // 未认领
	AssigneeUser    Assignee = "user"     // 用户认领
	AssigneePartner Assignee = "partner"  // 伴侣认领
)

// Chore - 家务任务
type Chore struct {
	ID          string        `gorm:"primaryKey" json:"id"`
	Name        string        `gorm:"size:100;not null" json:"name"`
	Icon        string        `gorm:"size:50" json:"icon"`
	Type        ChoreType     `gorm:"size:20;not null" json:"type"` // daily/weekly/monthly/once
	Points      int           `gorm:"not null" json:"points"`       // 基础积分
	Assignee    Assignee      `gorm:"size:20" json:"assignee"`      // user/partner/empty
	DueDate     time.Time     `gorm:"not null;index" json:"dueDate"`
	Status      ChoreStatus   `gorm:"size:20;not null;index" json:"status"` // pending/claimed/completed/overdue
	CompletedAt *time.Time    `json:"completedAt,omitempty"`
	ProofPhoto  *string       `gorm:"size:255" json:"proofPhoto,omitempty"` // 证明照片 URL
	Notes       *string       `gorm:"type:text" json:"notes,omitempty"`     // 备注
	ClaimedAt   *time.Time    `json:"claimedAt,omitempty"`                  // 认领时间
	ActualPoints int          `gorm:"default:0" json:"actualPoints"`        // 实际获得积分（根据完成时间计算）
	TemplateID  *string       `gorm:"size:36;index" json:"templateId,omitempty"` // 关联的模板 ID
	CreatedAt   time.Time     `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time     `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// ChoreTemplate - 家务任务模板
type ChoreTemplate struct {
	ID            string    `gorm:"primaryKey" json:"id"`
	Name          string    `gorm:"size:100;not null" json:"name"`
	Icon          string    `gorm:"size:50" json:"icon"`
	Type          ChoreType `gorm:"size:20;not null" json:"type"` // daily/weekly/monthly
	Points        int       `gorm:"not null" json:"points"`       // 基础积分
	DefaultAssignee Assignee `gorm:"size:20" json:"defaultAssignee"` // 默认认领人
	Description   *string   `gorm:"type:text" json:"description,omitempty"` // 任务描述
	IsActive      bool      `gorm:"default:true" json:"isActive"`   // 是否启用
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// UserStats - 用户统计数据
type UserStats struct {
	UserID          string  `gorm:"primaryKey" json:"userId"`
	TotalPoints     int     `gorm:"default:0" json:"totalPoints"`     // 总积分
	CompletedTasks  int     `gorm:"default:0" json:"completedTasks"`  // 完成任务数
	OnTimeTasks     int     `gorm:"default:0" json:"onTimeTasks"`     // 按时完成任务数
	EarlyTasks      int     `gorm:"default:0" json:"earlyTasks"`      // 提前完成任务数
	LateTasks       int     `gorm:"default:0" json:"lateTasks"`       // 逾期完成任务数
	OnTimeRate      float64 `gorm:"type:decimal(5,2);default:0" json:"onTimeRate"` // 按时完成率 (0-100)
	CurrentStreak   int     `gorm:"default:0" json:"currentStreak"`   // 当前连续天数
	LongestStreak   int     `gorm:"default:0" json:"longestStreak"`   // 最长连续天数
	WeekPoints      int     `gorm:"default:0" json:"weekPoints"`      // 本周积分
	UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

// LeaderboardEntry - 排行榜条目
type LeaderboardEntry struct {
	UserID      string `json:"userId"`
	TotalPoints int    `json:"totalPoints"`
	WeekPoints  int    `json:"weekPoints"`
	Rank        int    `json:"rank"`
}

// ChoreSwapRequest - 任务交换请求
type ChoreSwapRequest struct {
	ID              string    `gorm:"primaryKey" json:"id"`
	ChoreID1        string    `gorm:"size:36;not null" json:"choreId1"`
	ChoreID2        string    `gorm:"size:36;not null" json:"choreId2"`
	Requester       Assignee  `gorm:"size:20;not null" json:"requester"`
	TargetAssignee  Assignee  `gorm:"size:20;not null" json:"targetAssignee"`
	Status          string    `gorm:"size:20;default:pending" json:"status"` // pending/accepted/rejected
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}
