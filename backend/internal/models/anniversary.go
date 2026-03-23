package models

import (
	"time"

	"gorm.io/gorm"
)

// AnniversaryType - 纪念日类型
type AnniversaryType string

const (
	AnniversaryTypeFestival     AnniversaryType = "festival"     // 节日
	AnniversaryTypeBirthday     AnniversaryType = "birthday"     // 生日
	AnniversaryTypeRelationship AnniversaryType = "relationship" // 恋爱相关
	AnniversaryTypeOther        AnniversaryType = "other"        // 其他
)

// Anniversary - 纪念日
type Anniversary struct {
	ID           string           `gorm:"primaryKey" json:"id"`
	Name         string           `gorm:"size:100;not null" json:"name"`
	Date         time.Time        `gorm:"not null;index" json:"date"`
	Icon         string           `gorm:"size:50" json:"icon"`
	Type         AnniversaryType  `gorm:"size:20;not null" json:"type"` // festival/birthday/relationship/other
	Year         int              `gorm:"not null" json:"year"`         // 起始年份
	IsLunar      bool             `gorm:"default:false" json:"isLunar"` // 是否农历
	ReminderDays string           `gorm:"type:text" json:"reminderDays"` // JSON array: [7, 3, 1]
	Notes        string           `gorm:"type:text" json:"notes,omitempty"`
	CreatedAt    time.Time        `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt    time.Time        `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt    gorm.DeletedAt   `gorm:"index" json:"-"`
}

// GetReminderDays - 解析提醒天数列表
func (a *Anniversary) GetReminderDays() []int {
	// Simple parsing - will be handled properly in service layer
	if a.ReminderDays == "" {
		return []int{7, 3, 1} // default reminders
	}
	return []int{7, 3, 1}
}

// AnniversaryHistory - 纪念日历史（用于记录每年的庆祝）
// Note: This is stored as JSON in the Anniversary model or can be a separate table if needed
type AnniversaryHistory struct {
	Year        int      `json:"year"`
	Date        string   `json:"date"`
	Description string   `json:"description"`
	Photos      []string `json:"photos,omitempty"`
}
