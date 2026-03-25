package models

import "time"

// MealWish - 想吃清单
type MealWish struct {
	ID        string     `json:"id" gorm:"primaryKey;size:64"`
	Name      string     `json:"name" gorm:"size:128;not null"`
	Icon      string     `json:"icon" gorm:"size:32;default:'🍽️'"`
	Category  string     `json:"category" gorm:"size:32;default:'home_cook'"` // home_cook / restaurant / takeout / snack
	Priority  string     `json:"priority" gorm:"size:32;default:'want'"`       // must_eat / want / maybe
	AddedBy   string     `json:"addedBy" gorm:"size:32;default:'user'"`
	Note      string     `json:"note" gorm:"size:512"`
	Status    string     `json:"status" gorm:"size:32;default:'pending'"` // pending / done / archived
	DoneAt    *time.Time `json:"doneAt,omitempty"`
	CreatedAt time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
}

// MealHistory - 吃饭历史
type MealHistory struct {
	ID        string    `json:"id" gorm:"primaryKey;size:64"`
	Name      string    `json:"name" gorm:"size:128;not null"`
	Icon      string    `json:"icon" gorm:"size:32;default:'🍽️'"`
	Source    string    `json:"source" gorm:"size:32;default:'manual'"` // random / wishlist / ai / manual
	Rating    int       `json:"rating" gorm:"default:0"`                // 1-5
	Comment   string    `json:"comment" gorm:"size:512"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}
