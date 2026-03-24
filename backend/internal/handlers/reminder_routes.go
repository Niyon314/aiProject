package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RegisterReminderRoutes 注册惊喜提醒相关路由
func RegisterReminderRoutes(r *gin.RouterGroup, db *gorm.DB) {
	reminderHandler := NewReminderHandler(db)

	// 惊喜提醒路由组
	reminder := r.Group("/reminders")
	{
		// GET /api/reminders - 获取提醒列表
		reminder.GET("", reminderHandler.GetReminders)
		
		// GET /api/reminders/upcoming - 获取即将到期的提醒
		reminder.GET("/upcoming", reminderHandler.GetUpcomingReminders)
		
		// GET /api/reminders/gift-ideas - 获取礼物推荐
		reminder.GET("/gift-ideas", reminderHandler.GetGiftIdeas)
		
		// GET /api/reminders/date-ideas - 获取约会建议
		reminder.GET("/date-ideas", reminderHandler.GetDateIdeas)
		
		// GET /api/reminders/:id - 获取单个提醒
		reminder.GET("/:id", reminderHandler.GetReminderByID)
		
		// POST /api/reminders - 创建提醒
		reminder.POST("", reminderHandler.CreateReminder)
		
		// PUT /api/reminders/:id - 更新提醒
		reminder.PUT("/:id", reminderHandler.UpdateReminder)
		
		// DELETE /api/reminders/:id - 删除提醒
		reminder.DELETE("/:id", reminderHandler.DeleteReminder)
	}
}
