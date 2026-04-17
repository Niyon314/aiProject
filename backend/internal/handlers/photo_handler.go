package handlers

import (
	"crypto/md5"
	"encoding/hex"
	"image"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PhotoHandler 照片墙处理器
type PhotoHandler struct {
	db *gorm.DB
}

// NewPhotoHandler 创建照片墙处理器
func NewPhotoHandler(db *gorm.DB) *PhotoHandler {
	return &PhotoHandler{db: db}
}

// Photo 照片模型
type Photo struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    string    `json:"userId" gorm:"index"`
	Filename  string    `json:"filename"`
	OrigName  string    `json:"origName"`
	MimeType  string    `json:"mimeType"`
	Size      int64     `json:"size"`
	Width     int       `json:"width"`
	Height    int       `json:"height"`
	ThumbPath string    `json:"thumbPath"`
	FilePath  string    `json:"filePath"`
	Hash      string    `json:"hash" gorm:"uniqueIndex"` // 用于去重
	Desc      string    `json:"desc"`
	Tags      string    `json:"tags"` // 逗号分隔的标签
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// UploadPhotoRequest 上传请求
type UploadPhotoRequest struct {
	Desc string `form:"desc"`
	Tags string `form:"tags"`
}

// UploadPhoto 上传照片
// POST /api/photos/upload
func (h *PhotoHandler) UploadPhoto(c *gin.Context) {
	// 获取用户 ID（从 query 或上下文）
	userID := c.Query("user")
	if userID == "" {
		userID = "anonymous"
	}

	// 解析表单
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "未找到上传文件"})
		return
	}
	defer file.Close()

	// 验证文件类型
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

	// 验证文件大小（最大 10MB）
	if header.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "文件大小不能超过 10MB"})
		return
	}

	// 生成唯一文件名
	fileExt := filepath.Ext(header.Filename)
	fileID := uuid.New().String()
	filename := fileID + fileExt

	// 确保上传目录存在
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

	// 保存文件
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

	// 计算文件 hash（用于去重）
	fileForHash, _ := os.Open(filePath)
	hasher := md5.New()
	io.Copy(hasher, fileForHash)
	fileHash := hex.EncodeToString(hasher.Sum(nil))
	fileForHash.Close()

	// 检查是否重复
	var existing Photo
	if err := h.db.Where("hash = ?", fileHash).First(&existing).Error; err == nil {
		// 重复文件，删除刚保存的，返回已存在的
		os.Remove(filePath)
		c.JSON(http.StatusOK, gin.H{
			"message": "文件已存在",
			"data":    existing,
			"duplicate": true,
		})
		return
	}

	// 生成缩略图
	thumbPath := filepath.Join(thumbDir, "thumb_"+filename)
	if err := generateThumbnail(filePath, thumbPath, 300, 300); err != nil {
		log.Printf("生成缩略图失败：%v", err)
		// 缩略图失败不影响主流程
	}

	// 获取图片尺寸
	img, _, err := image.Decode(strings.NewReader(string(mustReadFile(filePath))))
	var width, height int
	if err == nil {
		width = img.Bounds().Dx()
		height = img.Bounds().Dy()
	}

	// 获取表单其他字段
	desc := c.PostForm("desc")
	tags := c.PostForm("tags")

	// 保存到数据库
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
	}

	if err := h.db.Create(&photo).Error; err != nil {
		log.Printf("保存数据库失败：%v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存失败"})
		return
	}

	// 通过 WebSocket 通知（如果已实现）
	hub := GetWSHub()
	if hub != nil {
		// 可以广播新照片通知
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "上传成功",
		"data":    photo,
	})
}

// GetPhotos 获取照片列表
// GET /api/photos?user=xxx&limit=20&offset=0
func (h *PhotoHandler) GetPhotos(c *gin.Context) {
	userID := c.Query("user")
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	if limit > 100 {
		limit = 100
	}

	var photos []Photo
	query := h.db.Model(&Photo{})

	// 按用户筛选（可选）
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	// 按创建时间倒序
	query = query.Order("created_at DESC")

	// 分页
	query = query.Limit(limit).Offset(offset)

	if err := query.Find(&photos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 获取总数
	var total int64
	h.db.Model(&Photo{}).Count(&total)

	c.JSON(http.StatusOK, gin.H{
		"data":   photos,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
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

// DeletePhoto 删除照片
// DELETE /api/photos/:id
func (h *PhotoHandler) DeletePhoto(c *gin.Context) {
	id := c.Param("id")

	var photo Photo
	if err := h.db.First(&photo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "照片不存在"})
		return
	}

	// 删除文件
	os.Remove(photo.FilePath)
	os.Remove(photo.ThumbPath)

	// 删除数据库记录
	if err := h.db.Delete(&photo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

// 辅助函数：生成缩略图
func generateThumbnail(srcPath, dstPath string, maxWidth, maxHeight int) error {
	img, err := imaging.Open(srcPath)
	if err != nil {
		return err
	}

	// 调整大小（保持宽高比）
	thumb := imaging.Fit(img, maxWidth, maxHeight, imaging.Lanczos)

	// 保存为 JPEG
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

// ServePhoto 提供照片访问
// GET /uploads/photos/:filename
// 这个路由需要在 main.go 中配置为静态文件服务
