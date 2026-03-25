package handlers

import (
	"encoding/json"
	"strconv"
	"time"

	"couple-home/backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// DiaryHandler 恋爱日记处理器
type DiaryHandler struct {
	db *gorm.DB
}

// NewDiaryHandler 创建日记处理器
func NewDiaryHandler(db *gorm.DB) *DiaryHandler {
	return &DiaryHandler{
		db: db,
	}
}

// GetDiaries 获取日记列表
// GET /api/diaries
func (h *DiaryHandler) GetDiaries(c *gin.Context) {
	// 从上下文获取用户信息
	userID := getDefaultUserID(c)

	// 获取分页参数
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "50"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 50
	}
	offset := (page - 1) * pageSize

	// 获取筛选参数
	date := c.Query("date")
	month := c.Query("month") // YYYY-MM format
	privacy := c.Query("privacy")

	// 构建查询
	query := h.db.Model(&models.Diary{})

	// 日期筛选
	if date != "" {
		query = query.Where("date = ?", date)
	}

	// 月份筛选
	if month != "" {
		query = query.Where("date LIKE ?", month+"%")
	}

	// 隐私筛选（只显示自己的或共享的）
	if privacy == "private" {
		query = query.Where("created_by = ? AND privacy = ?", userID, "private")
	} else {
		// 显示自己的所有日记 + 对方共享的日记
		query = query.Where("created_by = ? OR privacy = ?", userID, "shared")
	}

	// 查询总数
	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(500, gin.H{"error": "查询失败：" + err.Error()})
		return
	}

	// 查询日记列表（按日期倒序）
	var diaries []models.Diary
	if err := query.Order("date DESC, created_at DESC").Offset(offset).Limit(pageSize).Find(&diaries).Error; err != nil {
		c.JSON(500, gin.H{"error": "查询失败：" + err.Error()})
		return
	}

	// 返回结果
	c.JSON(200, gin.H{
		"data": gin.H{
			"diaries": diaries,
			"total":   total,
		},
	})
}

// GetDiaryByID 获取单篇日记
// GET /api/diaries/:id
func (h *DiaryHandler) GetDiaryByID(c *gin.Context) {
	diaryID := c.Param("id")
	if diaryID == "" {
		c.JSON(400, gin.H{"error": "参数错误：缺少日记 ID"})
		return
	}

	// 从上下文获取用户信息
	userID := getDefaultUserID(c)

	var diary models.Diary
	if err := h.db.First(&diary, "id = ?", diaryID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "日记不存在"})
		} else {
			c.JSON(500, gin.H{"error": "查询失败：" + err.Error()})
		}
		return
	}

	// 检查权限：只能查看自己的日记或共享的日记
	if diary.CreatedBy != userID.(string) && diary.Privacy != "shared" {
		c.JSON(403, gin.H{"error": "无权查看此日记"})
		return
	}

	c.JSON(200, gin.H{"data": diary})
}

// CreateDiary 创建日记
// POST /api/diaries
func (h *DiaryHandler) CreateDiary(c *gin.Context) {
	// 从上下文获取用户信息
	userID := getDefaultUserID(c)

	// 解析请求体
	var req models.CreateDiaryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "参数错误：" + err.Error()})
		return
	}

	// 设置默认隐私
	if req.Privacy == "" {
		req.Privacy = "private"
	}

	// 创建日记
	diary := models.NewDiary(userID.(string), req)
	if err := h.db.Create(diary).Error; err != nil {
		c.JSON(500, gin.H{"error": "创建失败：" + err.Error()})
		return
	}

	c.JSON(200, gin.H{"data": diary})
}

// UpdateDiary 更新日记
// PUT /api/diaries/:id
func (h *DiaryHandler) UpdateDiary(c *gin.Context) {
	diaryID := c.Param("id")
	if diaryID == "" {
		c.JSON(400, gin.H{"error": "参数错误：缺少日记 ID"})
		return
	}

	// 从上下文获取用户信息
	userID := getDefaultUserID(c)

	// 查询日记
	var diary models.Diary
	if err := h.db.First(&diary, "id = ?", diaryID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "日记不存在"})
		} else {
			c.JSON(500, gin.H{"error": "查询失败：" + err.Error()})
		}
		return
	}

	// 检查权限：只能编辑自己的日记
	if diary.CreatedBy != userID.(string) {
		c.JSON(403, gin.H{"error": "无权编辑此日记"})
		return
	}

	// 解析请求体
	var req models.UpdateDiaryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "参数错误：" + err.Error()})
		return
	}

	// 更新日记
	diary.Update(req)
	if err := h.db.Save(&diary).Error; err != nil {
		c.JSON(500, gin.H{"error": "更新失败：" + err.Error()})
		return
	}

	c.JSON(200, gin.H{"data": diary})
}

// DeleteDiary 删除日记
// DELETE /api/diaries/:id
func (h *DiaryHandler) DeleteDiary(c *gin.Context) {
	diaryID := c.Param("id")
	if diaryID == "" {
		c.JSON(400, gin.H{"error": "参数错误：缺少日记 ID"})
		return
	}

	// 从上下文获取用户信息
	userID := getDefaultUserID(c)

	// 查询日记
	var diary models.Diary
	if err := h.db.First(&diary, "id = ?", diaryID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "日记不存在"})
		} else {
			c.JSON(500, gin.H{"error": "查询失败：" + err.Error()})
		}
		return
	}

	// 检查权限：只能删除自己的日记
	if diary.CreatedBy != userID.(string) {
		c.JSON(403, gin.H{"error": "无权删除此日记"})
		return
	}

	// 删除日记
	if err := h.db.Delete(&diary).Error; err != nil {
		c.JSON(500, gin.H{"error": "删除失败：" + err.Error()})
		return
	}

	c.JSON(200, gin.H{"data": nil})
}

// UploadPhotos 上传照片
// POST /api/diaries/:id/photos
func (h *DiaryHandler) UploadPhotos(c *gin.Context) {
	diaryID := c.Param("id")
	if diaryID == "" {
		c.JSON(400, gin.H{"error": "参数错误：缺少日记 ID"})
		return
	}

	// 从上下文获取用户信息
	userID := getDefaultUserID(c)

	// 查询日记
	var diary models.Diary
	if err := h.db.First(&diary, "id = ?", diaryID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "日记不存在"})
		} else {
			c.JSON(500, gin.H{"error": "查询失败：" + err.Error()})
		}
		return
	}

	// 检查权限：只能编辑自己的日记
	if diary.CreatedBy != userID.(string) {
		c.JSON(403, gin.H{"error": "无权编辑此日记"})
		return
	}

	// 解析请求体
	var req models.PhotoUploadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "参数错误：" + err.Error()})
		return
	}

	if len(req.PhotoURLs) == 0 {
		c.JSON(400, gin.H{"error": "至少需要上传一张照片"})
		return
	}

	// 添加照片 - 简单实现，实际应该解析现有照片并追加
	photosJSON := "["
	for i, url := range req.PhotoURLs {
		if i > 0 {
			photosJSON += ","
		}
		photosJSON += `"` + url + `"`
	}
	photosJSON += "]"
	
	diary.Photos = photosJSON
	diary.UpdatedAt = time.Now()
	
	if err := h.db.Save(&diary).Error; err != nil {
		c.JSON(500, gin.H{"error": "上传失败：" + err.Error()})
		return
	}

	c.JSON(200, gin.H{"data": diary})
}

// UpdatePrivacy 设置隐私
// PUT /api/diaries/:id/privacy
func (h *DiaryHandler) UpdatePrivacy(c *gin.Context) {
	diaryID := c.Param("id")
	if diaryID == "" {
		c.JSON(400, gin.H{"error": "参数错误：缺少日记 ID"})
		return
	}

	// 从上下文获取用户信息
	userID := getDefaultUserID(c)

	// 查询日记
	var diary models.Diary
	if err := h.db.First(&diary, "id = ?", diaryID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "日记不存在"})
		} else {
			c.JSON(500, gin.H{"error": "查询失败：" + err.Error()})
		}
		return
	}

	// 检查权限：只能修改自己的日记
	if diary.CreatedBy != userID.(string) {
		c.JSON(403, gin.H{"error": "无权修改此日记"})
		return
	}

	// 解析请求体
	var req models.PrivacyUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "参数错误：" + err.Error()})
		return
	}

	// 更新隐私设置
	diary.UpdatePrivacy(req.Privacy)
	if err := h.db.Save(&diary).Error; err != nil {
		c.JSON(500, gin.H{"error": "更新失败：" + err.Error()})
		return
	}

	c.JSON(200, gin.H{"data": diary})
}

// GetDiariesByMonth 获取指定月份的日记（月视图）
// GET /api/diaries/month/:year-month
func (h *DiaryHandler) GetDiariesByMonth(c *gin.Context) {
	month := c.Param("month")
	if month == "" {
		c.JSON(400, gin.H{"error": "参数错误：缺少月份"})
		return
	}

	// 从上下文获取用户信息
	userID := getDefaultUserID(c)

	// 构建查询
	query := h.db.Model(&models.Diary{}).Where("date LIKE ?", month+"%")

	// 只显示自己的所有日记 + 对方共享的日记
	query = query.Where("created_by = ? OR privacy = ?", userID, "shared")

	var diaries []models.Diary
	if err := query.Order("date ASC").Find(&diaries).Error; err != nil {
		c.JSON(500, gin.H{"error": "查询失败：" + err.Error()})
		return
	}

	c.JSON(200, gin.H{"data": diaries})
}

// Helper function to parse photos JSON
func parsePhotosJSON(photosStr string) []string {
	if photosStr == "" || photosStr == "[]" {
		return []string{}
	}

	var photos []string
	if err := json.Unmarshal([]byte(photosStr), &photos); err != nil {
		return []string{}
	}
	return photos
}
