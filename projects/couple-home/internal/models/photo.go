package models

import (
	"time"

	"gorm.io/gorm"
)

// Photo 照片模型
type Photo struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    string         `json:"userId" gorm:"index"`
	Filename  string         `json:"filename"`
	OrigName  string         `json:"origName"`
	MimeType  string         `json:"mimeType"`
	Size      int64          `json:"size"`
	Width     int            `json:"width"`
	Height    int            `json:"height"`
	ThumbPath string         `json:"thumbPath"`
	FilePath  string         `json:"filePath"`
	Hash      string         `json:"hash" gorm:"uniqueIndex"` // 用于去重
	Desc      string         `json:"desc"`
	Tags      string         `json:"tags"` // 逗号分隔的标签
	Likes     int            `json:"likes" gorm:"default:0"`
	Filter    string         `json:"filter"` // 应用的滤镜名称
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	
	// 关联
	LikeUsers   []PhotoLike   `json:"-" gorm:"foreignKey:PhotoID"`
	Comments    []PhotoComment `json:"comments" gorm:"foreignKey:PhotoID;constraint:OnDelete:CASCADE"`
}

// TableName 指定表名
func (Photo) TableName() string {
	return "photos"
}

// PhotoLike 照片点赞记录
type PhotoLike struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	PhotoID   uint      `json:"photoId" gorm:"index;not null"`
	UserID    string    `json:"userId" gorm:"index;not null"` // 用户 ID 或设备 ID
	CreatedAt time.Time `json:"createdAt"`
	
	// 确保同一用户对同一照片只能点赞一次
	PhotoUserID string `json:"-" gorm:"uniqueIndex:idx_photo_user"`
}

// TableName 指定表名
func (PhotoLike) TableName() string {
	return "photo_likes"
}

// PhotoComment 照片评论
type PhotoComment struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	PhotoID   uint           `json:"photoId" gorm:"index;not null"`
	UserID    string         `json:"userId" gorm:"index;not null"`
	Username  string         `json:"username"` // 评论者昵称
	Content   string         `json:"content" gorm:"size:500;not null"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName 指定表名
func (PhotoComment) TableName() string {
	return "photo_comments"
}

// PhotoMonthGroup 月度照片分组（用于时间线展示）
type PhotoMonthGroup struct {
	Year      int      `json:"year"`
	Month     int      `json:"month"`
	MonthName string   `json:"monthName"`
	Photos    []Photo  `json:"photos"`
	Count     int      `json:"count"`
	CoverURL  string   `json:"coverUrl"` // 分组封面（第一张照片）
}

// UploadProgress 上传进度
type UploadProgress struct {
	Total     int     `json:"total"`
	Uploaded  int     `json:"uploaded"`
	Failed    int     `json:"failed"`
	Progress  float64 `json:"progress"` // 0-100
}
