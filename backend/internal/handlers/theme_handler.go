package handlers

import (
	"net/http"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/service"
	"github.com/gin-gonic/gin"
)

// ThemeHandler - 主题设置 HTTP 处理器
type ThemeHandler struct {
	service *service.ThemeService
}

// ThemeConfig - 主题配置请求体
type ThemeConfig struct {
	Theme       string  `json:"theme" binding:"required"`
	Rounded     string  `json:"rounded" binding:"required"`
	Animation   string  `json:"animation" binding:"required"`
	CustomColor *string `json:"customColor,omitempty"`
}

// NewThemeHandler - 创建主题处理器
func NewThemeHandler(svc *service.ThemeService) *ThemeHandler {
	return &ThemeHandler{service: svc}
}

// GetThemeConfig - 获取当前主题配置
// GET /api/settings/theme
func (h *ThemeHandler) GetThemeConfig(c *gin.Context) {
	config, err := h.service.GetThemeConfig(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": config})
}

// UpdateThemeConfig - 更新主题配置
// PUT /api/settings/theme
func (h *ThemeHandler) UpdateThemeConfig(c *gin.Context) {
	var config ThemeConfig
	if err := c.ShouldBindJSON(&config); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 验证主题
	validThemes := []string{"pink", "dark", "blue", "green", "purple", "orange"}
	isValidTheme := false
	for _, t := range validThemes {
		if config.Theme == t {
			isValidTheme = true
			break
		}
	}
	if !isValidTheme {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid theme"})
		return
	}

	// 验证圆角
	validRounded := []string{"xs", "sm", "md", "lg", "xl"}
	isValidRounded := false
	for _, r := range validRounded {
		if config.Rounded == r {
			isValidRounded = true
			break
		}
	}
	if !isValidRounded {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid rounded size"})
		return
	}

	// 验证动画
	validAnimation := []string{"none", "low", "medium", "high", "extreme"}
	isValidAnimation := false
	for _, a := range validAnimation {
		if config.Animation == a {
			isValidAnimation = true
			break
		}
	}
	if !isValidAnimation {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid animation level"})
		return
	}

	// 转换为模型
	themeConfig := models.ThemeConfig{
		Theme:       config.Theme,
		Rounded:     config.Rounded,
		Animation:   config.Animation,
		CustomColor: config.CustomColor,
	}

	if err := h.service.UpdateThemeConfig(c.Request.Context(), &themeConfig); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": themeConfig, "message": "theme updated successfully"})
}

// ResetThemeConfig - 重置主题配置为默认值
// POST /api/settings/theme/reset
func (h *ThemeHandler) ResetThemeConfig(c *gin.Context) {
	if err := h.service.ResetThemeConfig(c.Request.Context()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 获取默认配置
	defaultConfig, err := h.service.GetThemeConfig(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": defaultConfig, "message": "theme reset to default"})
}

// GetAvailableThemes - 获取可用主题列表
// GET /api/settings/themes
func (h *ThemeHandler) GetAvailableThemes(c *gin.Context) {
	themes := []map[string]interface{}{
		{
			"id":    "pink",
			"name":  "少女粉",
			"emoji": "🌸",
			"primary": "#FF6B81",
			"background": "linear-gradient(135deg, #FFE5EC, #FFB5C5)",
		},
		{
			"id":    "dark",
			"name":  "深夜黑",
			"emoji": "🌙",
			"primary": "#718096",
			"background": "linear-gradient(135deg, #1A202C, #2D3748)",
		},
		{
			"id":    "blue",
			"name":  "海洋蓝",
			"emoji": "🌊",
			"primary": "#4FC3F7",
			"background": "linear-gradient(135deg, #E1F5FE, #B3E5FC)",
		},
		{
			"id":    "green",
			"name":  "清新绿",
			"emoji": "🌿",
			"primary": "#66BB6A",
			"background": "linear-gradient(135deg, #E8F5E9, #C8E6C9)",
		},
		{
			"id":    "purple",
			"name":  "葡萄紫",
			"emoji": "🍇",
			"primary": "#BA68C8",
			"background": "linear-gradient(135deg, #F3E5F5, #E1BEE7)",
		},
		{
			"id":    "orange",
			"name":  "活力橙",
			"emoji": "🍊",
			"primary": "#FFA726",
			"background": "linear-gradient(135deg, #FFF3E0, #FFE0B2)",
		},
	}

	c.JSON(http.StatusOK, gin.H{"data": themes})
}
