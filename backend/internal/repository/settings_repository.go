package repository

import (
	"context"

	"couple-home/backend/internal/models"
	"gorm.io/gorm"
)

// SettingsRepository - 设置仓储
type SettingsRepository struct {
	db *gorm.DB
}

// NewSettingsRepository - 创建设置仓储
func NewSettingsRepository(db *gorm.DB) *SettingsRepository {
	return &SettingsRepository{db: db}
}

// GetThemeConfig - 获取主题配置
func (r *SettingsRepository) GetThemeConfig(ctx context.Context) (*models.ThemeConfig, error) {
	var config models.ThemeConfig
	
	// 尝试获取现有配置
	result := r.db.First(&config)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			// 返回默认配置
			return &models.ThemeConfig{
				ID:        "default",
				Theme:     "pink",
				Rounded:   "md",
				Animation: "medium",
			}, nil
		}
		return nil, result.Error
	}
	
	return &config, nil
}

// SaveThemeConfig - 保存主题配置
func (r *SettingsRepository) SaveThemeConfig(ctx context.Context, config *models.ThemeConfig) error {
	// 检查是否存在配置
	var existing models.ThemeConfig
	result := r.db.First(&existing)
	
	if result.Error == gorm.ErrRecordNotFound {
		// 创建新配置
		config.ID = "theme-config"
		return r.db.Create(config).Error
	} else if result.Error != nil {
		return result.Error
	}
	
	// 更新现有配置
	config.ID = existing.ID
	return r.db.Save(config).Error
}

// ResetThemeConfig - 重置主题配置
func (r *SettingsRepository) ResetThemeConfig(ctx context.Context) error {
	defaultConfig := &models.ThemeConfig{
		ID:        "theme-config",
		Theme:     "pink",
		Rounded:   "md",
		Animation: "medium",
	}
	
	var existing models.ThemeConfig
	result := r.db.First(&existing)
	
	if result.Error == gorm.ErrRecordNotFound {
		return r.db.Create(defaultConfig).Error
	} else if result.Error != nil {
		return result.Error
	}
	
	defaultConfig.ID = existing.ID
	return r.db.Save(defaultConfig).Error
}
