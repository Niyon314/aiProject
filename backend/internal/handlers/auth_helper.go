package handlers

import "github.com/gin-gonic/gin"

// getDefaultUserID 获取用户 ID，如果没有认证中间件则返回默认值
// 情侣 App 暂时不需要登录系统，使用默认用户
func getDefaultUserID(c *gin.Context) interface{} {
	userID, exists := c.Get("userID")
	if exists {
		return userID
	}
	// 默认用户 ID
	return "default_user"
}
