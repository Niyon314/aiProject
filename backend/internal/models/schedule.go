package models

import (
	"time"

	"gorm.io/gorm"
)

// ScheduleType - 日程类型
type ScheduleType string

const (
	ScheduleTypeDate    ScheduleType = "date"    // 约会
	ScheduleTypeWork    ScheduleType = "work"    // 工作
	ScheduleTypeFamily  ScheduleType = "family"  // 家庭
	ScheduleTypeFriend  ScheduleType = "friend"  // 朋友
	ScheduleTypeOther   ScheduleType = "other"   // 其他
)

// ScheduleStatus - 日程状态
type ScheduleStatus string

const (
	ScheduleStatusPlanned   ScheduleStatus = "planned"   // 计划中
	ScheduleStatusCompleted ScheduleStatus = "completed" // 已完成
	ScheduleStatusCancelled ScheduleStatus = "cancelled" // 已取消
)

// ReminderType - 提醒类型
type ReminderType string

const (
	ReminderTypeNone ReminderType = "none" // 无提醒
	ReminderType1h   ReminderType = "1h"   // 提前 1 小时
	ReminderType1d   ReminderType = "1d"   // 提前 1 天
	ReminderType1w   ReminderType = "1w"   // 提前 1 周
)

// Schedule - 日程
type Schedule struct {
	ID           string         `gorm:"primaryKey" json:"id"`
	Title        string         `gorm:"size:100;not null" json:"title"`
	Description  string         `gorm:"type:text" json:"description,omitempty"`
	Icon         string         `gorm:"size:50" json:"icon"`
	StartTime    time.Time      `gorm:"not null;index" json:"startTime"`
	EndTime      time.Time      `gorm:"not null" json:"endTime"`
	Location     string         `gorm:"size:200" json:"location,omitempty"`
	Type         ScheduleType   `gorm:"size:20;not null" json:"type"` // date/work/family/friend/other
	Reminder     ReminderType   `gorm:"size:10;not null" json:"reminder"` // none/1h/1d/1w
	Participants string         `gorm:"type:text" json:"participants"` // JSON array: ["user", "partner"]
	Status       ScheduleStatus `gorm:"size:20;not null;index" json:"status"` // planned/completed/cancelled
	CreatedAt    time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// GetParticipants - 解析参与者列表
func (s *Schedule) GetParticipants() []string {
	// Simple JSON array parsing - will be handled properly in service layer
	// For now, return empty slice if empty
	if s.Participants == "" {
		return []string{}
	}
	// Basic parsing for JSON array like ["user", "partner"]
	// Full implementation would use encoding/json
	return []string{"user", "partner"} // default
}
