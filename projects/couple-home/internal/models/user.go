package models

import (
	"time"

	"gorm.io/gorm"
)

// User 用户模型
type User struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	Username  string         `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Password  string         `gorm:"size:255;not null" json:"-"` // 不返回密码
	Nickname  string         `gorm:"size:50" json:"nickname"`
	Avatar    string         `gorm:"size:255" json:"avatar"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName 指定表名
func (User) TableName() string {
	return "users"
}

// RefreshToken 刷新令牌模型
type RefreshToken struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	UserID    uint           `gorm:"index;not null" json:"user_id"`
	Token     string         `gorm:"uniqueIndex;size:500;not null" json:"-"`
	ExpiresAt time.Time      `json:"expires_at"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName 指定表名
func (RefreshToken) TableName() string {
	return "refresh_tokens"
}
