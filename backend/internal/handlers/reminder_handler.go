package handlers

import (
	"net/http"
	"strconv"
	"time"

	"couple-home/backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ReminderHandler 惊喜提醒处理器
type ReminderHandler struct {
	db *gorm.DB
}

// NewReminderHandler 创建惊喜提醒处理器
func NewReminderHandler(db *gorm.DB) *ReminderHandler {
	return &ReminderHandler{
		db: db,
	}
}

// GetReminders 获取提醒列表
// GET /api/reminders
func (h *ReminderHandler) GetReminders(c *gin.Context) {
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
	reminderType := c.Query("type")
	status := c.Query("status")
	month := c.Query("month") // 格式：2026-03

	// 构建查询
	query := h.db.Model(&models.Reminder{})

	// 类型筛选
	if reminderType != "" {
		query = query.Where("type = ?", reminderType)
	}

	// 状态筛选
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// 月份筛选
	if month != "" {
		startOfMonth := month + "-01"
		query = query.Where("date >= ?", startOfMonth)
		// 计算月末
		if t, err := time.Parse("2006-01", month); err == nil {
			endOfMonth := t.AddDate(0, 1, 0).Format("2006-01-02")
			query = query.Where("date < ?", endOfMonth)
		}
	}

	// 查询总数
	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败：" + err.Error()})
		return
	}

	// 查询提醒列表（按日期升序）
	var reminders []models.Reminder
	if err := query.Order("date ASC").Offset(offset).Limit(pageSize).Find(&reminders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败：" + err.Error()})
		return
	}

	// 返回结果
	c.JSON(http.StatusOK, gin.H{"data": models.ReminderListResponse{
		Reminders: reminders,
		Total:     total,
	}})
}

// GetReminderByID 获取单个提醒
// GET /api/reminders/:id
func (h *ReminderHandler) GetReminderByID(c *gin.Context) {
	reminderID := c.Param("id")
	if reminderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误：缺少提醒 ID"})
		return
	}

	var reminder models.Reminder
	if err := h.db.First(&reminder, "id = ?", reminderID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "提醒不存在"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败：" + err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": reminder})
}

// CreateReminder 创建提醒
// POST /api/reminders
func (h *ReminderHandler) CreateReminder(c *gin.Context) {
	// 解析请求体
	var req models.CreateReminderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误：" + err.Error()})
		return
	}

	// 如果没有设置提醒天数，设置默认值
	if len(req.ReminderDays) == 0 {
		req.ReminderDays = []int{7, 3, 1}
	}

	// 如果没有设置礼物推荐，根据类型生成默认推荐
	if len(req.GiftIdeas) == 0 {
		req.GiftIdeas = h.getDefaultGiftIdeas(req.Type)
	}

	// 如果没有设置约会建议，根据类型生成默认建议
	if len(req.DateIdeas) == 0 {
		req.DateIdeas = h.getDefaultDateIdeas(req.Type)
	}

	// 创建提醒
	reminder := models.NewReminder("system", req)
	if err := h.db.Create(reminder).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败：" + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": reminder})
}

// UpdateReminder 更新提醒
// PUT /api/reminders/:id
func (h *ReminderHandler) UpdateReminder(c *gin.Context) {
	reminderID := c.Param("id")
	if reminderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误：缺少提醒 ID"})
		return
	}

	// 查询提醒
	var reminder models.Reminder
	if err := h.db.First(&reminder, "id = ?", reminderID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "提醒不存在"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败：" + err.Error()})
		}
		return
	}

	// 解析请求体
	var req models.UpdateReminderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误：" + err.Error()})
		return
	}

	// 更新提醒
	reminder.Update(req)
	if err := h.db.Save(&reminder).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败：" + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": reminder})
}

// DeleteReminder 删除提醒
// DELETE /api/reminders/:id
func (h *ReminderHandler) DeleteReminder(c *gin.Context) {
	reminderID := c.Param("id")
	if reminderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误：缺少提醒 ID"})
		return
	}

	// 查询提醒
	var reminder models.Reminder
	if err := h.db.First(&reminder, "id = ?", reminderID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "提醒不存在"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败：" + err.Error()})
		}
		return
	}

	// 删除提醒
	if err := h.db.Delete(&reminder).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败：" + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": nil})
}

// GetGiftIdeas 获取礼物推荐
// GET /api/reminders/gift-ideas
func (h *ReminderHandler) GetGiftIdeas(c *gin.Context) {
	reminderType := c.Query("type")
	budget := c.Query("budget")

	if reminderType == "" {
		reminderType = "birthday"
	}

	// 根据类型和预算生成礼物推荐
	giftIdeas := h.getGiftIdeasByType(reminderType, budget)

	c.JSON(http.StatusOK, gin.H{"data": giftIdeas})
}

// GetDateIdeas 获取约会建议
// GET /api/reminders/date-ideas
func (h *ReminderHandler) GetDateIdeas(c *gin.Context) {
	reminderType := c.Query("type")
	budget := c.Query("budget")

	if reminderType == "" {
		reminderType = "anniversary"
	}

	// 根据类型和预算生成约会建议
	dateIdeas := h.getDateIdeasByType(reminderType, budget)

	c.JSON(http.StatusOK, gin.H{"data": dateIdeas})
}

// GetUpcomingReminders 获取即将到期的提醒
// GET /api/reminders/upcoming
func (h *ReminderHandler) GetUpcomingReminders(c *gin.Context) {
	// 获取未来 30 天的提醒
	now := time.Now()
	thirtyDaysLater := now.AddDate(0, 0, 30)

	var reminders []models.Reminder
	if err := h.db.Where("date >= ? AND date <= ? AND status = ?",
		now, thirtyDaysLater, "active").
		Order("date ASC").
		Find(&reminders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败：" + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": reminders})
}

// getDefaultGiftIdeas 根据类型返回默认礼物推荐
func (h *ReminderHandler) getDefaultGiftIdeas(reminderType string) []string {
	switch reminderType {
	case "birthday":
		return []string{"口红 💄", "项链 💎", "包包 👜", "香水 🌸", "手表 ⌚"}
	case "anniversary":
		return []string{"定制相册 📖", "情侣对戒 💍", "浪漫晚餐 🕯️", "短途旅行 ✈️", "鲜花束 💐"}
	case "holiday":
		return []string{"节日礼盒 🎁", "巧克力 🍫", "温暖围巾 🧣", "圣诞树 🎄", "红包 🧧"}
	default:
		return []string{"惊喜礼物 🎁", "手写卡片 💌", "定制纪念品 🏆"}
	}
}

// getDefaultDateIdeas 根据类型返回默认约会建议
func (h *ReminderHandler) getDefaultDateIdeas(reminderType string) []string {
	switch reminderType {
	case "birthday":
		return []string{"生日派对 🎂", "浪漫晚餐 🕯️", "SPA 放松 💆", "看电影 🎬", "游乐园 🎢"}
	case "anniversary":
		return []string{"烛光晚餐 🕯️", "重温初次约会地点 💕", "短途旅行 ✈️", "拍情侣照 📷", "写情书 💌"}
	case "holiday":
		return []string{"节日市集 🎪", "家庭聚餐 🍲", "看节日电影 🎬", "交换礼物 🎁", "倒计时活动 🎉"}
	default:
		return []string{"浪漫晚餐 🕯️", "看电影 🎬", "散步聊天 🚶", "在家做饭 🍳"}
	}
}

// getGiftIdeasByType 根据类型和预算获取礼物推荐
func (h *ReminderHandler) getGiftIdeasByType(reminderType, budget string) models.GiftIdeaResponse {
	var response models.GiftIdeaResponse

	switch reminderType {
	case "birthday":
		response.Category = "生日礼物"
		switch budget {
		case "low":
			response.Ideas = []string{"手写卡片 💌", "自制蛋糕 🎂", "照片相框 🖼️"}
			response.Budget = "¥0-200"
		case "medium":
			response.Ideas = []string{"口红 💄", "香水 🌸", "手表 ⌚"}
			response.Budget = "¥200-1000"
		default:
			response.Ideas = []string{"名牌包包 👜", "珠宝首饰 💎", "电子产品 📱"}
			response.Budget = "¥1000+"
		}
		response.Reason = "根据 TA 的喜好精心挑选"

	case "anniversary":
		response.Category = "纪念日礼物"
		switch budget {
		case "low":
			response.Ideas = []string{"定制相册 📖", "情书 💌", "回忆视频 🎬"}
			response.Budget = "¥0-200"
		case "medium":
			response.Ideas = []string{"情侣对戒 💍", "浪漫晚餐 🕯️", "鲜花束 💐"}
			response.Budget = "¥200-1000"
		default:
			response.Ideas = []string{"短途旅行 ✈️", "定制珠宝 💎", "奢侈品 👜"}
			response.Budget = "¥1000+"
		}
		response.Reason = "纪念我们的美好时光"

	default:
		response.Category = "通用礼物"
		response.Ideas = []string{"惊喜礼盒 🎁", "定制纪念品 🏆", "体验券 🎫"}
		response.Budget = "¥200-500"
		response.Reason = "表达你的心意"
	}

	return response
}

// getDateIdeasByType 根据类型和预算获取约会建议
func (h *ReminderHandler) getDateIdeasByType(reminderType, budget string) models.DateIdeaResponse {
	var response models.DateIdeaResponse

	switch reminderType {
	case "birthday":
		response.Category = "生日约会"
		switch budget {
		case "low":
			response.Ideas = []string{"在家做饭 🍳", "公园野餐 🧺", "看电影 🎬"}
			response.Budget = "¥0-200"
			response.Duration = "2-4 小时"
		case "medium":
			response.Ideas = []string{"浪漫晚餐 🕯️", "SPA 放松 💆", "游乐园 🎢"}
			response.Budget = "¥200-1000"
			response.Duration = "半天"
		default:
			response.Ideas = []string{"高端餐厅 🍽️", "短途旅行 ✈️", "热气球体验 🎈"}
			response.Budget = "¥1000+"
			response.Duration = "1-2 天"
		}
		response.Preparation = "提前预订餐厅/门票"

	case "anniversary":
		response.Category = "纪念日约会"
		switch budget {
		case "low":
			response.Ideas = []string{"重温初次约会地点 💕", "在家看老照片 📖", "散步聊天 🚶"}
			response.Budget = "¥0-200"
			response.Duration = "2-4 小时"
		case "medium":
			response.Ideas = []string{"烛光晚餐 🕯️", "拍情侣照 📷", "温泉度假 ♨️"}
			response.Budget = "¥200-1000"
			response.Duration = "半天"
		default:
			response.Ideas = []string{"海外旅行 🌍", "私人游艇 🛥️", "直升机观光 🚁"}
			response.Budget = "¥1000+"
			response.Duration = "2-7 天"
		}
		response.Preparation = "提前规划行程"

	default:
		response.Category = "浪漫约会"
		response.Ideas = []string{"浪漫晚餐 🕯️", "看电影 🎬", "散步聊天 🚶"}
		response.Budget = "¥200-500"
		response.Duration = "2-4 小时"
		response.Preparation = "提前预订"
	}

	return response
}
