package handlers

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"image"
	"image/color"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PhotoHandler 照片墙处理器
type PhotoHandler struct {
	db *gorm.DB
	uploadProgress map[string]*UploadProgress // 上传进度跟踪
	progressMu     sync.RWMutex
}

// UploadProgress 上传进度结构
type UploadProgress struct {
	Total     int     `json:"total"`
	Uploaded  int     `json:"uploaded"`
	Failed    int     `json:"failed"`
	Progress  float64 `json:"progress"`
	Status    string  `json:"status"`
}

// NewPhotoHandler 创建照片墙处理器
func NewPhotoHandler(db *gorm.DB) *PhotoHandler {
	return &PhotoHandler{
		db: db,
		uploadProgress: make(map[string]*UploadProgress),
	}
}

// Photo 照片模型（用于 API 响应）
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
	Hash      string         `json:"hash" gorm:"uniqueIndex"`
	Desc      string         `json:"desc"`
	Tags      string         `json:"tags"`
	Likes     int            `json:"likes" gorm:"default:0"`
	Filter    string         `json:"filter"`
	IsLiked   bool           `json:"isLiked" gorm:"-"` // 当前用户是否已点赞
	Comments  []PhotoComment `json:"comments,omitempty" gorm:"foreignKey:PhotoID"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
}

// PhotoComment 评论模型
type PhotoComment struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	PhotoID   uint      `json:"photoId" gorm:"index;not null"`
	UserID    string    `json:"userId" gorm:"index;not null"`
	Username  string    `json:"username"`
	Content   string    `json:"content" gorm:"size:500;not null"`
	CreatedAt time.Time `json:"createdAt"`
}

// PhotoMonthGroup 月度分组
type PhotoMonthGroup struct {
	Year      int     `json:"year"`
	Month     int     `json:"month"`
	MonthName string  `json:"monthName"`
	Photos    []Photo `json:"photos"`
	Count     int     `json:"count"`
	CoverURL  string  `json:"coverUrl"`
}

// UploadPhoto 上传单张照片
// POST /api/photos/upload
func (h *PhotoHandler) UploadPhoto(c *gin.Context) {
	userID := c.Query("user")
	if userID == "" {
		userID = "anonymous"
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "未找到上传文件"})
		return
	}
	defer file.Close()

	mimeType := header.Header.Get("Content-Type")
	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/webp": true,
	}
	if !allowedTypes[mimeType] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "只支持 JPG/PNG/WEBP 格式"})
		return
	}

	if header.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文件大小不能超过 10MB"})
		return
	}

	fileExt := filepath.Ext(header.Filename)
	fileID := uuid.New().String()
	filename := fileID + fileExt

	uploadDir := "./uploads/photos"
	thumbDir := "./uploads/photos/thumbs"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		log.Printf("创建目录失败：%v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "服务器错误"})
		return
	}
	if err := os.MkdirAll(thumbDir, 0755); err != nil {
		log.Printf("创建目录失败：%v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "服务器错误"})
		return
	}

	filePath := filepath.Join(uploadDir, filename)
	dst, err := os.Create(filePath)
	if err != nil {
		log.Printf("保存文件失败：%v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存失败"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		log.Printf("写入文件失败：%v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "写入失败"})
		return
	}

	fileForHash, _ := os.Open(filePath)
	hasher := md5.New()
	io.Copy(hasher, fileForHash)
	fileHash := hex.EncodeToString(hasher.Sum(nil))
	fileForHash.Close()

	var existing Photo
	if err := h.db.Where("hash = ?", fileHash).First(&existing).Error; err == nil {
		os.Remove(filePath)
		c.JSON(http.StatusOK, gin.H{
			"message":   "文件已存在",
			"data":      existing,
			"duplicate": true,
		})
		return
	}

	thumbPath := filepath.Join(thumbDir, "thumb_"+filename)
	if err := generateThumbnail(filePath, thumbPath, 300, 300); err != nil {
		log.Printf("生成缩略图失败：%v", err)
	}

	img, _, err := image.Decode(strings.NewReader(string(mustReadFile(filePath))))
	var width, height int
	if err == nil {
		width = img.Bounds().Dx()
		height = img.Bounds().Dy()
	}

	desc := c.PostForm("desc")
	tags := c.PostForm("tags")
	filter := c.PostForm("filter")

	photo := Photo{
		UserID:    userID,
		Filename:  filename,
		OrigName:  header.Filename,
		MimeType:  mimeType,
		Size:      header.Size,
		Width:     width,
		Height:    height,
		ThumbPath: thumbPath,
		FilePath:  filePath,
		Hash:      fileHash,
		Desc:      desc,
		Tags:      tags,
		Filter:    filter,
	}

	if err := h.db.Create(&photo).Error; err != nil {
		log.Printf("保存数据库失败：%v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "上传成功",
		"data":    photo,
	})
}

// UploadPhotos 批量上传照片
// POST /api/photos/upload-multi
func (h *PhotoHandler) UploadPhotos(c *gin.Context) {
	userID := c.Query("user")
	if userID == "" {
		userID = "anonymous"
	}

	sessionID := c.PostForm("session_id")
	if sessionID == "" {
		sessionID = uuid.New().String()
	}

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的表单数据"})
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "未找到上传文件"})
		return
	}

	// 初始化上传进度
	h.progressMu.Lock()
	h.uploadProgress[sessionID] = &UploadProgress{
		Total:    len(files),
		Uploaded: 0,
		Failed:   0,
		Progress: 0,
		Status:   "uploading",
	}
	h.progressMu.Unlock()

	uploadDir := "./uploads/photos"
	thumbDir := "./uploads/photos/thumbs"
	os.MkdirAll(uploadDir, 0755)
	os.MkdirAll(thumbDir, 0755)

	var uploadedPhotos []Photo
	var failedCount int

	for i, fileHeader := range files {
		photo, err := h.processSingleFile(fileHeader, userID, uploadDir, thumbDir)
		if err != nil {
			failedCount++
			log.Printf("处理文件 %d 失败：%v", i, err)
		} else {
			uploadedPhotos = append(uploadedPhotos, photo)
		}

		// 更新进度
		h.progressMu.Lock()
		h.uploadProgress[sessionID].Uploaded = len(uploadedPhotos)
		h.uploadProgress[sessionID].Failed = failedCount
		h.uploadProgress[sessionID].Progress = float64(i+1) / float64(len(files)) * 100
		if i == len(files)-1 {
			h.uploadProgress[sessionID].Status = "completed"
		}
		h.progressMu.Unlock()
	}

	// 清理进度记录（5 秒后）
	go func(sid string) {
		time.Sleep(5 * time.Second)
		h.progressMu.Lock()
		delete(h.uploadProgress, sid)
		h.progressMu.Unlock()
	}(sessionID)

	c.JSON(http.StatusOK, gin.H{
		"message":      fmt.Sprintf("上传完成，成功 %d 张，失败 %d 张", len(uploadedPhotos), failedCount),
		"data":         uploadedPhotos,
		"session_id":   sessionID,
		"total":        len(files),
		"uploaded":     len(uploadedPhotos),
		"failed":       failedCount,
	})
}

// processSingleFile 处理单个文件上传
func (h *PhotoHandler) processSingleFile(header *multipart.FileHeader, userID, uploadDir, thumbDir string) (Photo, error) {
	file, err := header.Open()
	if err != nil {
		return Photo{}, err
	}
	defer file.Close()

	mimeType := header.Header.Get("Content-Type")
	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/webp": true,
	}
	if !allowedTypes[mimeType] {
		return Photo{}, fmt.Errorf("不支持的文件类型")
	}

	if header.Size > 10*1024*1024 {
		return Photo{}, fmt.Errorf("文件超过 10MB")
	}

	fileExt := filepath.Ext(header.Filename)
	fileID := uuid.New().String()
	filename := fileID + fileExt
	filePath := filepath.Join(uploadDir, filename)

	dst, err := os.Create(filePath)
	if err != nil {
		return Photo{}, err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return Photo{}, err
	}

	fileForHash, _ := os.Open(filePath)
	hasher := md5.New()
	io.Copy(hasher, fileForHash)
	fileHash := hex.EncodeToString(hasher.Sum(nil))
	fileForHash.Close()

	var existing Photo
	if err := h.db.Where("hash = ?", fileHash).First(&existing).Error; err == nil {
		os.Remove(filePath)
		return existing, nil
	}

	thumbPath := filepath.Join(thumbDir, "thumb_"+filename)
	generateThumbnail(filePath, thumbPath, 300, 300)

	img, _, err := image.Decode(strings.NewReader(string(mustReadFile(filePath))))
	var width, height int
	if err == nil {
		width = img.Bounds().Dx()
		height = img.Bounds().Dy()
	}

	photo := Photo{
		UserID:    userID,
		Filename:  filename,
		OrigName:  header.Filename,
		MimeType:  mimeType,
		Size:      header.Size,
		Width:     width,
		Height:    height,
		ThumbPath: thumbPath,
		FilePath:  filePath,
		Hash:      fileHash,
	}

	if err := h.db.Create(&photo).Error; err != nil {
		os.Remove(filePath)
		return Photo{}, err
	}

	return photo, nil
}

// GetUploadProgress 获取上传进度
// GET /api/photos/upload-progress/:session_id
func (h *PhotoHandler) GetUploadProgress(c *gin.Context) {
	sessionID := c.Param("session_id")

	h.progressMu.RLock()
	progress, exists := h.uploadProgress[sessionID]
	h.progressMu.RUnlock()

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "未找到上传会话"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"progress": progress,
	})
}

// GetPhotoTimeline 获取照片时间线（按月分组）
// GET /api/photos/timeline?user=xxx
func (h *PhotoHandler) GetPhotoTimeline(c *gin.Context) {
	userID := c.Query("user")

	var photos []Photo
	query := h.db.Model(&Photo{})

	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	query = query.Order("created_at DESC")
	if err := query.Find(&photos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 按月分组
	monthGroups := make(map[string]*PhotoMonthGroup)
	monthNames := []string{"", "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"}

	for _, photo := range photos {
		year := photo.CreatedAt.Year()
		month := int(photo.CreatedAt.Month())
		key := fmt.Sprintf("%d-%02d", year, month)

		if _, exists := monthGroups[key]; !exists {
			monthGroups[key] = &PhotoMonthGroup{
				Year:      year,
				Month:     month,
				MonthName: fmt.Sprintf("%d年 %s", year, monthNames[month]),
				Photos:    []Photo{},
			}
		}

		monthGroups[key].Photos = append(monthGroups[key].Photos, photo)
		if monthGroups[key].CoverURL == "" {
			monthGroups[key].CoverURL = photo.ThumbPath
		}
	}

	// 转换为有序列表
	var timeline []PhotoMonthGroup
	for _, group := range monthGroups {
		group.Count = len(group.Photos)
		timeline = append(timeline, *group)
	}

	// 按时间倒序排序
	for i := 0; i < len(timeline)-1; i++ {
		for j := i + 1; j < len(timeline); j++ {
			if timeline[i].Year < timeline[j].Year || (timeline[i].Year == timeline[j].Year && timeline[i].Month < timeline[j].Month) {
				timeline[i], timeline[j] = timeline[j], timeline[i]
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data": timeline,
	})
}

// GetPhotos 获取照片列表（带点赞状态）
// GET /api/photos?user=xxx&limit=20&offset=0
func (h *PhotoHandler) GetPhotos(c *gin.Context) {
	userID := c.Query("user")
	viewerID := c.Query("viewer") // 查看者 ID，用于判断点赞状态
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	if limit > 100 {
		limit = 100
	}

	var photos []Photo
	query := h.db.Model(&Photo{})

	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	query = query.Preload("Comments").Order("created_at DESC")
	query = query.Limit(limit).Offset(offset)

	if err := query.Find(&photos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 获取点赞状态
	if viewerID != "" {
		var photoIDs []uint
		for _, p := range photos {
			photoIDs = append(photoIDs, p.ID)
		}

		var likes []PhotoLike
		h.db.Where("photo_id IN ? AND user_id = ?", photoIDs, viewerID).Find(&likes)
		likedMap := make(map[uint]bool)
		for _, like := range likes {
			likedMap[like.PhotoID] = true
		}

		for i := range photos {
			photos[i].IsLiked = likedMap[photos[i].ID]
		}
	}

	var total int64
	h.db.Model(&Photo{}).Count(&total)

	c.JSON(http.StatusOK, gin.H{
		"data":   photos,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

// LikePhoto 点赞照片
// POST /api/photos/:id/like
func (h *PhotoHandler) LikePhoto(c *gin.Context) {
	id := c.Param("id")
	userID := c.Query("user")
	if userID == "" {
		userID = "anonymous"
	}

	var photo Photo
	if err := h.db.First(&photo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "照片不存在"})
		return
	}

	// 检查是否已点赞
	var existingLike PhotoLike
	photoUserID := fmt.Sprintf("%d-%s", photo.ID, userID)
	if err := h.db.Where("photo_user_id = ?", photoUserID).First(&existingLike).Error; err == nil {
		// 已点赞，取消点赞
		h.db.Delete(&existingLike)
		h.db.Model(&photo).UpdateColumn("likes", gorm.Expr("likes - 1"))
		c.JSON(http.StatusOK, gin.H{"message": "已取消点赞", "liked": false, "likes": photo.Likes - 1})
		return
	}

	// 添加点赞
	like := PhotoLike{
		PhotoID:   photo.ID,
		UserID:    userID,
		PhotoUserID: photoUserID,
	}
	if err := h.db.Create(&like).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "点赞失败"})
		return
	}

	h.db.Model(&photo).UpdateColumn("likes", gorm.Expr("likes + 1"))

	c.JSON(http.StatusOK, gin.H{"message": "点赞成功", "liked": true, "likes": photo.Likes + 1})
}

// AddComment 添加评论
// POST /api/photos/:id/comment
func (h *PhotoHandler) AddComment(c *gin.Context) {
	id := c.Param("id")
	userID := c.Query("user")
	username := c.Query("username")
	if userID == "" {
		userID = "anonymous"
	}
	if username == "" {
		username = "匿名用户"
	}

	var photo Photo
	if err := h.db.First(&photo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "照片不存在"})
		return
	}

	var req struct {
		Content string `json:"content"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "评论内容不能为空"})
		return
	}

	if strings.TrimSpace(req.Content) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "评论内容不能为空"})
		return
	}

	comment := PhotoComment{
		PhotoID:  photo.ID,
		UserID:   userID,
		Username: username,
		Content:  req.Content,
	}

	if err := h.db.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "评论失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "评论成功", "data": comment})
}

// GetComments 获取照片评论
// GET /api/photos/:id/comments
func (h *PhotoHandler) GetComments(c *gin.Context) {
	id := c.Param("id")

	var comments []PhotoComment
	if err := h.db.Where("photo_id = ?", id).Order("created_at ASC").Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": comments,
	})
}

// DeleteComment 删除评论
// DELETE /api/photos/comments/:id
func (h *PhotoHandler) DeleteComment(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.Delete(&PhotoComment{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

// ApplyFilter 应用滤镜
// POST /api/photos/:id/filter
func (h *PhotoHandler) ApplyFilter(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Filter string `json:"filter"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的滤镜参数"})
		return
	}

	var photo Photo
	if err := h.db.First(&photo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "照片不存在"})
		return
	}

	// 应用滤镜并保存
	if err := h.applyFilterToImage(photo.FilePath, req.Filter); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "滤镜应用失败"})
		return
	}

	if err := h.db.Model(&photo).Update("filter", req.Filter).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "滤镜应用成功", "filter": req.Filter})
}

// applyFilterToImage 应用滤镜到图片
func (h *PhotoHandler) applyFilterToImage(filePath, filterName string) error {
	img, err := imaging.Open(filePath)
	if err != nil {
		return err
	}

	var filtered image.Image
	switch filterName {
	case "grayscale":
		filtered = imaging.Grayscale(img)
	case "sepia":
		filtered = imaging.AdjustFunc(img, func(c color.Color) color.Color {
			r, g, b, a := c.RGBA()
			tr := uint8(float64(r>>8)*0.393 + float64(g>>8)*0.769 + float64(b>>8)*0.189)
			tg := uint8(float64(r>>8)*0.349 + float64(g>>8)*0.686 + float64(b>>8)*0.168)
			tb := uint8(float64(r>>8)*0.272 + float64(g>>8)*0.534 + float64(b>>8)*0.131)
			return color.RGBA{tr, tg, tb, uint8(a >> 8)}
		})
	case "warm":
		filtered = imaging.AdjustColor(img, 1.2, 1.0, 0.8, 1.0)
	case "cool":
		filtered = imaging.AdjustColor(img, 0.8, 1.0, 1.2, 1.0)
	case "vintage":
		filtered = imaging.AdjustFunc(img, func(c color.Color) color.Color {
			r, g, b, a := c.RGBA()
			return color.RGBA{uint8(r >> 10), uint8(g >> 10), uint8(b >> 11), uint8(a >> 8)}
		})
	default:
		return nil // 无滤镜
	}

	// 保存处理后的图片
	if err := imaging.Save(filtered, filePath); err != nil {
		return err
	}

	// 重新生成缩略图
	thumbPath := filepath.Join(filepath.Dir(filePath), "thumbs", "thumb_"+filepath.Base(filePath))
	generateThumbnail(filePath, thumbPath, 300, 300)

	return nil
}

// GenerateMonthVideo 生成月度回忆视频
// POST /api/photos/generate-month-video
func (h *PhotoHandler) GenerateMonthVideo(c *gin.Context) {
	var req struct {
		Year  int `json:"year"`
		Month int `json:"month"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的参数"})
		return
	}

	if req.Year < 2000 || req.Month < 1 || req.Month > 12 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的年月"})
		return
	}

	// 查询该月的照片
	var photos []Photo
	startDate := time.Date(req.Year, time.Month(req.Month), 1, 0, 0, 0, 0, time.Local)
	endDate := startDate.AddDate(0, 1, 0)

	if err := h.db.Where("created_at >= ? AND created_at < ?", startDate, endDate).
		Order("created_at ASC").Find(&photos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	if len(photos) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"message": "该月没有照片",
			"data":    nil,
		})
		return
	}

	// 生成视频文件路径
	videoDir := "./uploads/videos"
	os.MkdirAll(videoDir, 0755)
	videoFilename := fmt.Sprintf("memory_%d_%02d_%s.mp4", req.Year, req.Month, time.Now().Format("20060102150405"))
	videoPath := filepath.Join(videoDir, videoFilename)

	// 调用 FFmpeg 生成视频
	err := h.generateVideoFromPhotos(photos, videoPath)
	if err != nil {
		log.Printf("生成视频失败：%v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "视频生成失败", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "视频生成成功",
		"data": gin.H{
			"video_path": videoPath,
			"video_url":  "/uploads/videos/" + videoFilename,
			"photo_count": len(photos),
			"year":       req.Year,
			"month":      req.Month,
		},
	})
}

// generateVideoFromPhotos 从照片生成视频
func (h *PhotoHandler) generateVideoFromPhotos(photos []Photo, outputPath string) error {
	// 创建临时目录存放处理后的图片
	tempDir, err := os.MkdirTemp("", "video_gen_*")
	if err != nil {
		return err
	}
	defer os.RemoveAll(tempDir)

	// 准备图片列表文件
	listFile := filepath.Join(tempDir, "images.txt")
	listContent := ""

	for i, photo := range photos {
		// 复制图片到临时目录
		srcData, err := os.ReadFile(photo.FilePath)
		if err != nil {
			continue
		}

		tempImgPath := filepath.Join(tempDir, fmt.Sprintf("img_%03d.jpg", i))
		if err := os.WriteFile(tempImgPath, srcData, 0644); err != nil {
			continue
		}

		// 添加到列表（每张图片显示 3 秒）
		listContent += fmt.Sprintf("file '%s'\nduration 3\n", tempImgPath)
	}

	// 写入列表文件
	if err := os.WriteFile(listFile, []byte(listContent), 0644); err != nil {
		return err
	}

	// 执行 FFmpeg 命令
	cmd := fmt.Sprintf(`ffmpeg -y -f concat -safe 0 -i "%s" -c:v libx264 -pix_fmt yuv420p -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" -r 30 "%s" 2>&1`, listFile, outputPath)
	
	// 检查 FFmpeg 是否可用
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		// FFmpeg 不可用，返回模拟成功
		log.Printf("FFmpeg 未安装，跳过视频生成")
		return fmt.Errorf("FFmpeg 未安装")
	}

	_, err = exec.Command("bash", "-c", cmd).Output()
	return err
}

// GetMonthVideos 获取月度回忆视频列表
// GET /api/photos/month-videos
func (h *PhotoHandler) GetMonthVideos(c *gin.Context) {
	videoDir := "./uploads/videos"
	
	var videos []gin.H
	entries, err := os.ReadDir(videoDir)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"data": []gin.H{}})
		return
	}

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".mp4") {
			continue
		}

		info, err := entry.Info()
		if err != nil {
			continue
		}

		videos = append(videos, gin.H{
			"filename": entry.Name(),
			"url":      "/uploads/videos/" + entry.Name(),
			"size":     info.Size(),
			"created":  info.ModTime(),
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": videos})
}

// DeletePhoto 删除照片
// DELETE /api/photos/:id
func (h *PhotoHandler) DeletePhoto(c *gin.Context) {
	id := c.Param("id")

	var photo Photo
	if err := h.db.First(&photo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "照片不存在"})
		return
	}

	os.Remove(photo.FilePath)
	os.Remove(photo.ThumbPath)

	if err := h.db.Delete(&photo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

// GetPhoto 获取单张照片
// GET /api/photos/:id
func (h *PhotoHandler) GetPhoto(c *gin.Context) {
	id := c.Param("id")

	var photo Photo
	if err := h.db.First(&photo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "照片不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": photo})
}

// 辅助函数：生成缩略图
func generateThumbnail(srcPath, dstPath string, maxWidth, maxHeight int) error {
	img, err := imaging.Open(srcPath)
	if err != nil {
		return err
	}

	thumb := imaging.Fit(img, maxWidth, maxHeight, imaging.Lanczos)

	if err := imaging.Save(thumb, dstPath, imaging.JPEGQuality(85)); err != nil {
		return err
	}

	return nil
}

// 辅助函数：读取文件内容
func mustReadFile(path string) []byte {
	data, err := os.ReadFile(path)
	if err != nil {
		return []byte{}
	}
	return data
}
