package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// WebSocket 升级器
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// 允许所有来源（生产环境应限制）
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// WebSocket 消息结构
type WSMessage struct {
	Type    string      `json:"type"`    // message/system/notification
	From    string      `json:"from"`    // 发送者 ID
	To      string      `json:"to"`      // 接收者 ID（可选，空表示广播）
	Content interface{} `json:"content"` // 消息内容
}

// 客户端连接
type WSClient struct {
	hub  *WSHub
	conn *websocket.Conn
	send chan []byte
	id   string
}

// WebSocket 中心（管理所有连接）
type WSHub struct {
	clients    map[*WSClient]bool
	broadcast  chan []byte
	register   chan *WSClient
	unregister chan *WSClient
	mu         sync.RWMutex
}

// 全局 Hub 实例
var globalHub *WSHub

// InitWSHub 初始化 WebSocket 中心
func InitWSHub() {
	globalHub = &WSHub{
		clients:    make(map[*WSClient]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *WSClient),
		unregister: make(chan *WSClient),
	}
	go globalHub.run()
}

// GetWSHub 获取全局 Hub
func GetWSHub() *WSHub {
	return globalHub
}

// 运行 Hub（处理连接和消息）
func (h *WSHub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("[WS] 新连接：%s, 当前连接数：%d", client.id, len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()
			log.Printf("[WS] 连接断开：%s, 当前连接数：%d", client.id, len(h.clients))

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// Broadcast 广播消息给所有客户端
func (h *WSHub) Broadcast(msg WSMessage) {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("[WS] 序列化消息失败：%v", err)
		return
	}
	h.broadcast <- data
}

// BroadcastToUser 向特定用户发送消息
func (h *WSHub) BroadcastToUser(userID string, msg WSMessage) {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("[WS] 序列化消息失败：%v", err)
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.clients {
		if client.id == userID {
			select {
			case client.send <- data:
			default:
				close(client.send)
				delete(h.clients, client)
			}
			break
		}
	}
}

// BroadcastExcept 广播消息给除指定用户外的所有客户端
func (h *WSHub) BroadcastExcept(excludeUserID string, msg WSMessage) {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("[WS] 序列化消息失败：%v", err)
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.clients {
		if client.id != excludeUserID {
			select {
			case client.send <- data:
			default:
				close(client.send)
				delete(h.clients, client)
			}
		}
	}
}

// WSClient 读取消息
func (c *WSClient) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("[WS] 读取错误：%v", err)
			}
			break
		}
		// 处理接收到的消息（可以解析 JSON 并路由）
		log.Printf("[WS] 收到消息 [%s]: %s", c.id, string(message))
		// 这里可以添加消息处理逻辑
	}
}

// WSClient 写入消息
func (c *WSClient) writePump() {
	defer func() {
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
				return
			}
		}
	}
}

// HandleWebSocket 处理 WebSocket 连接请求
// GET /ws
func HandleWebSocket(c *gin.Context) {
	// 获取用户 ID（从 query 或 token）
	userID := c.Query("user")
	if userID == "" {
		userID = "anonymous"
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[WS] 升级失败：%v", err)
		return
	}

	client := &WSClient{
		hub:  globalHub,
		conn: conn,
		send: make(chan []byte, 256),
		id:   userID,
	}

	client.hub.register <- client

	go client.writePump()
	go client.readPump()
}

// GetOnlineCount 获取在线用户数
// GET /api/ws/online
func GetOnlineCount(c *gin.Context) {
	if globalHub == nil {
		c.JSON(http.StatusOK, gin.H{"count": 0})
		return
	}
	globalHub.mu.RLock()
	count := len(globalHub.clients)
	globalHub.mu.RUnlock()
	c.JSON(http.StatusOK, gin.H{"count": count})
}

// SendNewMessageNotification 发送新留言通知
func SendNewMessageNotification(messageID, senderName, content string) {
	if globalHub == nil {
		return
	}
	globalHub.Broadcast(WSMessage{
		Type: "new_message",
		From: "system",
		Content: map[string]interface{}{
			"messageId":  messageID,
			"senderName": senderName,
			"content":    content,
			"timestamp":  time.Now().Unix(),
		},
	})
}

// SendVoteUpdateNotification 发送投票更新通知
func SendVoteUpdateNotification(voteID, mealType, date string, matchSuccess bool, resultName string) {
	if globalHub == nil {
		return
	}
	globalHub.Broadcast(WSMessage{
		Type: "vote_update",
		From: "system",
		Content: map[string]interface{}{
			"voteId":      voteID,
			"mealType":    mealType,
			"date":        date,
			"matchSuccess": matchSuccess,
			"resultName":  resultName,
			"timestamp":   time.Now().Unix(),
		},
	})
}

// SendScheduleReminderNotification 发送日程提醒通知
func SendScheduleReminderNotification(scheduleID, title, icon, startTime string, reminderType string) {
	if globalHub == nil {
		return
	}
	globalHub.Broadcast(WSMessage{
		Type: "schedule_reminder",
		From: "system",
		Content: map[string]interface{}{
			"scheduleId":   scheduleID,
			"title":        title,
			"icon":         icon,
			"startTime":    startTime,
			"reminderType": reminderType,
			"timestamp":    time.Now().Unix(),
		},
	})
}
