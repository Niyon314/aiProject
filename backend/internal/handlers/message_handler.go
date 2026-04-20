package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// MessageModel - 留言模型
type MessageModel struct {
	ID        string    `json:"id" gorm:"primaryKey;size:64"`
	SenderID  string    `json:"senderId" gorm:"size:64;default:'user'"`
	SenderName string   `json:"senderName" gorm:"size:64;default:'我'"`
	Content   string    `json:"content" gorm:"size:1024;not null"`
	IsRead    bool      `json:"isRead" gorm:"default:false"`
	ReadAt    *time.Time `json:"readAt,omitempty"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

func (MessageModel) TableName() string { return "messages" }

// MessageHandler - 留言板处理器
type MessageHandler struct {
	db *gorm.DB
}

func NewMessageHandler(db *gorm.DB) *MessageHandler {
	return &MessageHandler{db: db}
}

// GetMessages GET /api/messages
func (h *MessageHandler) GetMessages(c *gin.Context) {
	var messages []MessageModel
	if err := h.db.Order("created_at desc").Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}
	
	unread := 0
	for _, m := range messages {
		if !m.IsRead {
			unread++
		}
	}
	
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"messages":    messages,
			"total":       len(messages),
			"unreadCount": unread,
		},
	})
}

// SendMessage POST /api/messages
func (h *MessageHandler) SendMessage(c *gin.Context) {
	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请输入留言内容"})
		return
	}
	
	msg := MessageModel{
		ID:         uuid.New().String(),
		SenderID:   "user",
		SenderName: "我",
		Content:    req.Content,
	}
	
	if err := h.db.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "发送失败"})
		return
	}
	
	// 发送 WebSocket 通知
	SendNewMessageNotification(msg.ID, msg.SenderName, msg.Content)
	
	c.JSON(http.StatusCreated, gin.H{"data": msg, "message": "留言已送达 💕"})
}

// MarkRead POST /api/messages/:id/read
func (h *MessageHandler) MarkRead(c *gin.Context) {
	id := c.Param("id")
	now := time.Now()
	
	result := h.db.Model(&MessageModel{}).Where("id = ?", id).Updates(map[string]interface{}{
		"is_read": true,
		"read_at": now,
	})
	
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "操作失败"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "已读"})
}

// MarkAllRead POST /api/messages/read-all
func (h *MessageHandler) MarkAllRead(c *gin.Context) {
	now := time.Now()
	h.db.Model(&MessageModel{}).Where("is_read = ?", false).Updates(map[string]interface{}{
		"is_read": true,
		"read_at": now,
	})
	
	c.JSON(http.StatusOK, gin.H{"message": "全部已读"})
}
