package models

import (
	"time"

	"couple-home/backend/pkg/utils"
)

// MovieType 电影类型
type MovieType string

const (
	MovieTypeMovie MovieType = "movie" // 电影
	MovieTypeTV    MovieType = "tv"    // 电视剧
)

// Movie 观影记录模型
type Movie struct {
	ID        string     `gorm:"primaryKey" json:"id"`
	Title     string     `gorm:"size:200;not null" json:"title"`
	Poster    string     `gorm:"type:text" json:"poster"`           // 海报 URL
	Rating    int        `gorm:"default:0" json:"rating"`           // 评分 0-10
	Review    string     `gorm:"type:text" json:"review"`           // 影评
	Watched   bool       `gorm:"default:false" json:"watched"`      // 是否已看过
	WatchedAt *time.Time `json:"watchedAt,omitempty"`               // 观看时间
	CreatedBy string     `gorm:"size:50;not null;index" json:"createdBy"` // 创建者 ID
	Type      MovieType  `gorm:"default:'movie'" json:"type"`       // 类型：movie 或 tv
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time  `gorm:"autoUpdateTime" json:"updatedAt"`
}

// CreateMovieRequest 创建观影记录请求
type CreateMovieRequest struct {
	Title  string `json:"title" binding:"required,min=1,max=200"`
	Poster string `json:"poster,omitempty"`
	Type   string `json:"type,omitempty"` // movie 或 tv
}

// RateMovieRequest 评分和影评请求
type RateMovieRequest struct {
	Rating int    `json:"rating" binding:"min=0,max=10"`
	Review string `json:"review,omitempty" binding:"max=2000"`
}

// MovieResponse 观影记录响应
type MovieResponse struct {
	ID        string     `json:"id"`
	Title     string     `json:"title"`
	Poster    string     `json:"poster"`
	Rating    int        `json:"rating"`
	Review    string     `json:"review"`
	Watched   bool       `json:"watched"`
	WatchedAt *time.Time `json:"watchedAt,omitempty"`
	CreatedBy string     `json:"createdBy"`
	Type      MovieType  `json:"type"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
}

// MovieListResponse 观影列表响应
type MovieListResponse struct {
	Items     []MovieResponse `json:"items"`
	Total     int64           `json:"total"`
	Watched   int64           `json:"watched"`   // 已观看数量
	Unwatched int64           `json:"unwatched"` // 未观看数量
	AvgRating float64         `json:"avgRating"` // 平均评分
}

// NewMovie 创建新的观影记录实例
func NewMovie(createdBy, title, poster, movieType string) *Movie {
	mtype := MovieTypeMovie
	if movieType == "tv" {
		mtype = MovieTypeTV
	}
	return &Movie{
		ID:        utils.GenerateID(),
		Title:     title,
		Poster:    poster,
		Rating:    0,
		Review:    "",
		Watched:   false,
		WatchedAt: nil,
		CreatedBy: createdBy,
		Type:      mtype,
	}
}

// MarkWatched 标记为已观看
func (m *Movie) MarkWatched() {
	m.Watched = true
	now := time.Now()
	m.WatchedAt = &now
	m.UpdatedAt = now
}

// SetRating 设置评分和影评
func (m *Movie) SetRating(rating int, review string) {
	m.Rating = rating
	m.Review = review
	m.UpdatedAt = time.Now()
}

// GetRatingStars 获取星级显示
func GetRatingStars(rating int) string {
	if rating <= 0 {
		return "未评分"
	}
	stars := ""
	fullStars := rating / 2
	halfStar := rating % 2
	for i := 0; i < fullStars; i++ {
		stars += "⭐"
	}
	if halfStar == 1 {
		stars += "⭐"
	}
	return stars
}

// GetRatingText 获取评分文字描述
func GetRatingText(rating int) string {
	if rating == 0 {
		return "未评分"
	} else if rating <= 4 {
		return "较差"
	} else if rating <= 6 {
		return "一般"
	} else if rating <= 8 {
		return "推荐"
	} else {
		return "神作"
	}
}
