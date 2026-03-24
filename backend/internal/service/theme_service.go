package service

import (
	"context"

	"couple-home/backend/internal/models"
	"couple-home/backend/internal/repository"
)

// ThemeService - 主题设置业务逻辑层
type ThemeService struct {
	settingsRepo *repository.SettingsRepository
}

// NewThemeService - 创建主题服务
func NewThemeService(settingsRepo *repository.SettingsRepository) *ThemeService {
	return &ThemeService{settingsRepo: settingsRepo}
}

// GetThemeConfig - 获取当前主题配置
func (s *ThemeService) GetThemeConfig(ctx context.Context) (*models.ThemeConfig, error) {
	config, err := s.settingsRepo.GetThemeConfig(ctx)
	if err != nil {
		// 如果没有配置，返回默认值
		return &models.ThemeConfig{
			Theme:     "pink",
			Rounded:   "md",
			Animation: "medium",
		}, nil
	}
	return config, nil
}

// UpdateThemeConfig - 更新主题配置
func (s *ThemeService) UpdateThemeConfig(ctx context.Context, config *models.ThemeConfig) error {
	return s.settingsRepo.SaveThemeConfig(ctx, config)
}

// ResetThemeConfig - 重置主题配置为默认值
func (s *ThemeService) ResetThemeConfig(ctx context.Context) error {
	defaultConfig := &models.ThemeConfig{
		Theme:     "pink",
		Rounded:   "md",
		Animation: "medium",
	}
	return s.settingsRepo.SaveThemeConfig(ctx, defaultConfig)
}
