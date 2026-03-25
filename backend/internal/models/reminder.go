package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Reminder 惊喜提醒模型
type Reminder struct {
	ID            string    `json:"id" gorm:"primaryKey"`
	Title         string    `json:"title" gorm:"not null"`           // 提醒标题（如：TA 的生日）
	Date          time.Time `json:"date" gorm:"not null"`            // 提醒日期
	Type          string    `json:"type" gorm:"not null"`            // 类型：birthday, anniversary, holiday, custom
	Notes         string    `json:"notes,omitempty"`                 // 备注信息
	ReminderDays  string   `json:"reminderDays" gorm:"type:text;default:'[]'"`  // JSON array: [7, 3, 1]
	GiftIdeas     string   `json:"giftIdeas" gorm:"type:text;default:'[]'"`    // JSON array
	DateIdeas     string   `json:"dateIdeas" gorm:"type:text;default:'[]'"`    // JSON array
	PartnerID     string    `json:"partnerId,omitempty"`             // 关联的伴侣 ID
	PartnerName   string    `json:"partnerName,omitempty"`           // 伴侣姓名（用于显示）
	IsRecurring   bool      `json:"isRecurring" gorm:"default:false"` // 是否每年重复
	LastNotified  *time.Time `json:"lastNotified,omitempty"`         // 上次通知时间
	Status        string    `json:"status" gorm:"default:active"`    // 状态：active, completed, cancelled
	CreatedBy     string    `json:"createdBy" gorm:"not null"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// TableName 指定表名
func (Reminder) TableName() string {
	return "reminders"
}

// CreateReminderRequest 创建提醒请求
type CreateReminderRequest struct {
	Title        string    `json:"title" binding:"required,min=1,max=100"`
	Date         time.Time `json:"date" binding:"required"`
	Type         string    `json:"type" binding:"required,oneof=birthday anniversary holiday custom"`
	Notes        string    `json:"notes,omitempty"`
	ReminderDays []int     `json:"reminderDays" binding:"omitempty"`
	GiftIdeas    []string  `json:"giftIdeas,omitempty"`
	DateIdeas    []string  `json:"dateIdeas,omitempty"`
	PartnerName  string    `json:"partnerName,omitempty"`
	IsRecurring  bool      `json:"isRecurring,omitempty"`
}

// UpdateReminderRequest 更新提醒请求
type UpdateReminderRequest struct {
	Title        string     `json:"title,omitempty"`
	Date         *time.Time `json:"date,omitempty"`
	Type         string     `json:"type,omitempty"`
	Notes        string     `json:"notes,omitempty"`
	ReminderDays []int      `json:"reminderDays,omitempty"`
	GiftIdeas    []string   `json:"giftIdeas,omitempty"`
	DateIdeas    []string   `json:"dateIdeas,omitempty"`
	PartnerName  string     `json:"partnerName,omitempty"`
	IsRecurring  *bool      `json:"isRecurring,omitempty"`
	Status       string     `json:"status,omitempty"`
}

// ReminderListResponse 提醒列表响应
type ReminderListResponse struct {
	Reminders []Reminder `json:"reminders"`
	Total     int64      `json:"total"`
}

// GiftIdeaResponse 礼物推荐响应
type GiftIdeaResponse struct {
	Category  string   `json:"category"`
	Ideas     []string `json:"ideas"`
	Budget    string   `json:"budget"`
	Reason    string   `json:"reason"`
}

// DateIdeaResponse 约会推荐响应
type DateIdeaResponse struct {
	Category   string   `json:"category"`
	Ideas      []string `json:"ideas"`
	Budget     string   `json:"budget"`
	Duration   string   `json:"duration"`
	Preparation string  `json:"preparation"`
}

// NewReminder 创建新的提醒实例
func NewReminder(createdBy string, req CreateReminderRequest) *Reminder {
	reminderDays := "[]"
	if len(req.ReminderDays) > 0 {
		b, _ := json.Marshal(req.ReminderDays)
		reminderDays = string(b)
	}
	giftIdeas := "[]"
	if len(req.GiftIdeas) > 0 {
		b, _ := json.Marshal(req.GiftIdeas)
		giftIdeas = string(b)
	}
	dateIdeas := "[]"
	if len(req.DateIdeas) > 0 {
		b, _ := json.Marshal(req.DateIdeas)
		dateIdeas = string(b)
	}

	return &Reminder{
		ID:           uuid.New().String(),
		Title:        req.Title,
		Date:         req.Date,
		Type:         req.Type,
		Notes:        req.Notes,
		ReminderDays: reminderDays,
		GiftIdeas:    giftIdeas,
		DateIdeas:    dateIdeas,
		PartnerName:  req.PartnerName,
		IsRecurring:  req.IsRecurring,
		Status:       "active",
		CreatedBy:    createdBy,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
}

// Update 更新提醒
func (r *Reminder) Update(req UpdateReminderRequest) {
	if req.Title != "" {
		r.Title = req.Title
	}
	if req.Date != nil {
		r.Date = *req.Date
	}
	if req.Type != "" {
		r.Type = req.Type
	}
	if req.Notes != "" {
		r.Notes = req.Notes
	}
	if req.ReminderDays != nil {
		b, _ := json.Marshal(req.ReminderDays)
		r.ReminderDays = string(b)
	}
	if req.GiftIdeas != nil {
		b, _ := json.Marshal(req.GiftIdeas)
		r.GiftIdeas = string(b)
	}
	if req.DateIdeas != nil {
		b, _ := json.Marshal(req.DateIdeas)
		r.DateIdeas = string(b)
	}
	if req.PartnerName != "" {
		r.PartnerName = req.PartnerName
	}
	if req.IsRecurring != nil {
		r.IsRecurring = *req.IsRecurring
	}
	if req.Status != "" {
		r.Status = req.Status
	}
	r.UpdatedAt = time.Now()
}

// MarkCompleted 标记为已完成
func (r *Reminder) MarkCompleted() {
	r.Status = "completed"
	r.UpdatedAt = time.Now()
}

// MarkCancelled 标记为已取消
func (r *Reminder) MarkCancelled() {
	r.Status = "cancelled"
	r.UpdatedAt = time.Now()
}

// DaysUntil 计算距离提醒还有多少天
func (r *Reminder) DaysUntil() int {
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	target := time.Date(r.Date.Year(), r.Date.Month(), r.Date.Day(), 0, 0, 0, 0, r.Date.Location())
	
	diff := target.Sub(today)
	return int(diff.Hours() / 24)
}

// ShouldNotify 检查是否应该发送通知
func (r *Reminder) ShouldNotify() bool {
	if r.Status != "active" {
		return false
	}
	
	daysUntil := r.DaysUntil()
	var days []int
	if err := json.Unmarshal([]byte(r.ReminderDays), &days); err != nil {
		return daysUntil == 0 || daysUntil == 1 || daysUntil == 3 || daysUntil == 7
	}
	for _, day := range days {
		if daysUntil == day {
			return true
		}
	}
	return false
}
