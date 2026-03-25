package handlers

import (
	"net/http"
	"strconv"

	"couple-home/backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// MovieHandler 观影清单处理器
type MovieHandler struct {
	db *gorm.DB
}

// NewMovieHandler 创建观影清单处理器
func NewMovieHandler(db *gorm.DB) *MovieHandler {
	return &MovieHandler{
		db: db,
	}
}

// GetMovies 获取观影列表
// GET /api/movies
func (h *MovieHandler) GetMovies(c *gin.Context) {
	// 从上下文获取用户信息
	userID := getDefaultUserID(c)

	// 获取筛选参数
	watched := c.Query("watched") // true, false, all
	movieType := c.Query("type")  // movie, tv, all
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	// 构建查询
	query := h.db.Model(&models.Movie{}).Where("created_by = ?", userID)

	// 按观看状态筛选
	if watched != "" && watched != "all" {
		if watched == "true" {
			query = query.Where("watched = ?", true)
		} else if watched == "false" {
			query = query.Where("watched = ?", false)
		}
	}

	// 按类型筛选
	if movieType != "" && movieType != "all" {
		query = query.Where("type = ?", movieType)
	}

	// 查询总数
	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败：" + err.Error()})
		return
	}

	// 查询已观看和未观看数量
	var watchedCount, unwatchedCount int64
	h.db.Model(&models.Movie{}).Where("created_by = ? AND watched = ?", userID, true).Count(&watchedCount)
	h.db.Model(&models.Movie{}).Where("created_by = ? AND watched = ?", userID, false).Count(&unwatchedCount)

	// 查询平均评分
	var avgRating float64
	h.db.Model(&models.Movie{}).
		Where("created_by = ? AND rating > 0", userID).
		Select("COALESCE(AVG(rating), 0)").
		Scan(&avgRating)

	// 查询观影列表（按创建时间倒序）
	var items []models.Movie
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败：" + err.Error()})
		return
	}

	// 构建响应
	responses := make([]models.MovieResponse, 0, len(items))
	for _, item := range items {
		responses = append(responses, models.MovieResponse{
			ID:        item.ID,
			Title:     item.Title,
			Poster:    item.Poster,
			Rating:    item.Rating,
			Review:    item.Review,
			Watched:   item.Watched,
			WatchedAt: item.WatchedAt,
			CreatedBy: item.CreatedBy,
			Type:      item.Type,
			CreatedAt: item.CreatedAt,
			UpdatedAt: item.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"data": models.MovieListResponse{
			Items:     responses,
			Total:     total,
			Watched:   watchedCount,
			Unwatched: unwatchedCount,
			AvgRating: avgRating,
		},
	})
}

// CreateMovie 创建观影记录
// POST /api/movies
func (h *MovieHandler) CreateMovie(c *gin.Context) {
	// 从上下文获取用户信息
	userID := getDefaultUserID(c)

	// 解析请求体
	var req models.CreateMovieRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误：" + err.Error()})
		return
	}

	// 创建观影记录
	movie := models.NewMovie(userID.(string), req.Title, req.Poster, req.Type)
	if err := h.db.Create(movie).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败：" + err.Error()})
		return
	}

	// 返回完整响应
	response := models.MovieResponse{
		ID:        movie.ID,
		Title:     movie.Title,
		Poster:    movie.Poster,
		Rating:    movie.Rating,
		Review:    movie.Review,
		Watched:   movie.Watched,
		WatchedAt: movie.WatchedAt,
		CreatedBy: movie.CreatedBy,
		Type:      movie.Type,
		CreatedAt: movie.CreatedAt,
		UpdatedAt: movie.UpdatedAt,
	}

	c.JSON(http.StatusOK, gin.H{"data": response})
}

// MarkWatched 标记为已观看
// PUT /api/movies/:id/watched
func (h *MovieHandler) MarkWatched(c *gin.Context) {
	// 从上下文获取用户信息
	userID := getDefaultUserID(c)

	movieID := c.Param("id")
	if movieID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误：缺少电影 ID"})
		return
	}

	// 查询观影记录
	var movie models.Movie
	if err := h.db.First(&movie, "id = ? AND created_by = ?", movieID, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "观影记录不存在"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败：" + err.Error()})
		}
		return
	}

	// 检查是否已观看
	if movie.Watched {
		c.JSON(http.StatusBadRequest, gin.H{"error": "该电影已标记为看过"})
		return
	}

	// 标记为已观看
	movie.MarkWatched()
	if err := h.db.Save(&movie).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败：" + err.Error()})
		return
	}

	// 返回更新后的记录
	response := models.MovieResponse{
		ID:        movie.ID,
		Title:     movie.Title,
		Poster:    movie.Poster,
		Rating:    movie.Rating,
		Review:    movie.Review,
		Watched:   movie.Watched,
		WatchedAt: movie.WatchedAt,
		CreatedBy: movie.CreatedBy,
		Type:      movie.Type,
		CreatedAt: movie.CreatedAt,
		UpdatedAt: movie.UpdatedAt,
	}

	c.JSON(http.StatusOK, gin.H{"data": response})
}

// RateMovie 评分和影评
// PUT /api/movies/:id/rate
func (h *MovieHandler) RateMovie(c *gin.Context) {
	// 从上下文获取用户信息
	userID := getDefaultUserID(c)

	movieID := c.Param("id")
	if movieID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误：缺少电影 ID"})
		return
	}

	// 解析请求体
	var req models.RateMovieRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误：" + err.Error()})
		return
	}

	// 查询观影记录
	var movie models.Movie
	if err := h.db.First(&movie, "id = ? AND created_by = ?", movieID, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "观影记录不存在"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败：" + err.Error()})
		}
		return
	}

	// 更新评分和影评
	movie.SetRating(req.Rating, req.Review)
	if err := h.db.Save(&movie).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败：" + err.Error()})
		return
	}

	// 返回更新后的记录
	response := models.MovieResponse{
		ID:        movie.ID,
		Title:     movie.Title,
		Poster:    movie.Poster,
		Rating:    movie.Rating,
		Review:    movie.Review,
		Watched:   movie.Watched,
		WatchedAt: movie.WatchedAt,
		CreatedBy: movie.CreatedBy,
		Type:      movie.Type,
		CreatedAt: movie.CreatedAt,
		UpdatedAt: movie.UpdatedAt,
	}

	c.JSON(http.StatusOK, gin.H{"data": response})
}

// DeleteMovie 删除观影记录
// DELETE /api/movies/:id
func (h *MovieHandler) DeleteMovie(c *gin.Context) {
	// 从上下文获取用户信息
	userID := getDefaultUserID(c)

	movieID := c.Param("id")
	if movieID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误：缺少电影 ID"})
		return
	}

	// 查询观影记录
	var movie models.Movie
	if err := h.db.First(&movie, "id = ? AND created_by = ?", movieID, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "观影记录不存在"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败：" + err.Error()})
		}
		return
	}

	// 删除记录
	if err := h.db.Delete(&movie).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败：" + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": nil})
}

// GetMovieStats 获取观影统计
// GET /api/movies/stats
func (h *MovieHandler) GetMovieStats(c *gin.Context) {
	// 从上下文获取用户信息
	userID := getDefaultUserID(c)

	// 统计数据
	var totalMovies, watchedMovies int64
	var avgRating float64

	h.db.Model(&models.Movie{}).Where("created_by = ?", userID).Count(&totalMovies)
	h.db.Model(&models.Movie{}).Where("created_by = ? AND watched = ?", userID, true).Count(&watchedMovies)
	h.db.Model(&models.Movie{}).
		Where("created_by = ? AND rating > 0", userID).
		Select("COALESCE(AVG(rating), 0)").
		Scan(&avgRating)

	// 按类型统计
	var movieCount, tvCount int64
	h.db.Model(&models.Movie{}).Where("created_by = ? AND type = ?", userID, models.MovieTypeMovie).Count(&movieCount)
	h.db.Model(&models.Movie{}).Where("created_by = ? AND type = ?", userID, models.MovieTypeTV).Count(&tvCount)

	watchRate := float64(0)
	if totalMovies > 0 {
		watchRate = float64(watchedMovies) / float64(totalMovies) * 100
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"totalMovies":     totalMovies,
			"watchedMovies":   watchedMovies,
			"unwatchedMovies": totalMovies - watchedMovies,
			"avgRating":       avgRating,
			"movieCount":      movieCount,
			"tvCount":         tvCount,
			"watchRate":       watchRate,
		},
	})
}
