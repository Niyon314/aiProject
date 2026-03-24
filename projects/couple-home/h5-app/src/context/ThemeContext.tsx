import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// 主题类型定义
export type ThemeType = 'pink' | 'dark' | 'blue' | 'green' | 'purple' | 'orange';

// 圆角大小类型
export type RoundedSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 动画强度类型
export type AnimationLevel = 'none' | 'low' | 'medium' | 'high' | 'extreme';

// 主题配置接口
export interface ThemeConfig {
  theme: ThemeType;
  rounded: RoundedSize;
  animation: AnimationLevel;
  customPrimary?: string; // 自定义主色
}

// 预设主题信息
export const PRESET_THEMES: {
  id: ThemeType;
  name: string;
  emoji: string;
  colors: {
    primary: string;
    background: string;
  };
}[] = [
  {
    id: 'pink',
    name: '少女粉',
    emoji: '🌸',
    colors: { primary: '#FF6B81', background: 'linear-gradient(135deg, #FFE5EC, #FFB5C5)' },
  },
  {
    id: 'dark',
    name: '深夜黑',
    emoji: '🌙',
    colors: { primary: '#718096', background: 'linear-gradient(135deg, #1A202C, #2D3748)' },
  },
  {
    id: 'blue',
    name: '海洋蓝',
    emoji: '🌊',
    colors: { primary: '#4FC3F7', background: 'linear-gradient(135deg, #E1F5FE, #B3E5FC)' },
  },
  {
    id: 'green',
    name: '清新绿',
    emoji: '🌿',
    colors: { primary: '#66BB6A', background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)' },
  },
  {
    id: 'purple',
    name: '葡萄紫',
    emoji: '🍇',
    colors: { primary: '#BA68C8', background: 'linear-gradient(135deg, #F3E5F5, #E1BEE7)' },
  },
  {
    id: 'orange',
    name: '活力橙',
    emoji: '🍊',
    colors: { primary: '#FFA726', background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)' },
  },
];

// 圆角选项
export const ROUNDED_OPTIONS: {
  id: RoundedSize;
  name: string;
  value: number;
}[] = [
  { id: 'xs', name: '极小', value: 4 },
  { id: 'sm', name: '小', value: 8 },
  { id: 'md', name: '中', value: 12 },
  { id: 'lg', name: '大', value: 16 },
  { id: 'xl', name: '极大', value: 20 },
];

// 动画强度选项
export const ANIMATION_OPTIONS: {
  id: AnimationLevel;
  name: string;
  duration: number;
}[] = [
  { id: 'none', name: '无', duration: 0 },
  { id: 'low', name: '低', duration: 150 },
  { id: 'medium', name: '中', duration: 250 },
  { id: 'high', name: '高', duration: 350 },
  { id: 'extreme', name: '极高', duration: 500 },
];

// 默认配置
const DEFAULT_CONFIG: ThemeConfig = {
  theme: 'pink',
  rounded: 'md',
  animation: 'medium',
};

interface ThemeContextType {
  config: ThemeConfig;
  setTheme: (theme: ThemeType) => Promise<void>;
  setRounded: (rounded: RoundedSize) => Promise<void>;
  setAnimation: (animation: AnimationLevel) => Promise<void>;
  setCustomPrimary: (color: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 从本地存储加载配置
const loadThemeConfig = (): ThemeConfig => {
  try {
    const saved = localStorage.getItem('theme-config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load theme config:', error);
  }
  return DEFAULT_CONFIG;
};

// 保存配置到本地存储
const saveThemeConfig = (config: ThemeConfig) => {
  try {
    localStorage.setItem('theme-config', JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save theme config:', error);
  }
};

// 应用到 DOM
const applyThemeToDOM = (config: ThemeConfig) => {
  const root = document.documentElement;
  
  // 移除所有主题类
  PRESET_THEMES.forEach(t => {
    root.classList.remove(`theme-${t.id}`);
  });
  ROUNDED_OPTIONS.forEach(r => {
    root.classList.remove(`rounded-${r.id}`);
  });
  ANIMATION_OPTIONS.forEach(a => {
    root.classList.remove(`animation-${a.id}`);
  });
  
  // 添加新主题类
  root.classList.add(`theme-${config.theme}`);
  root.classList.add(`rounded-${config.rounded}`);
  root.classList.add(`animation-${config.animation}`);
  
  // 设置自定义主色（如果有）
  if (config.customPrimary) {
    root.style.setProperty('--primary', config.customPrimary);
  }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化加载主题
  useEffect(() => {
    const savedConfig = loadThemeConfig();
    setConfig(savedConfig);
    applyThemeToDOM(savedConfig);
    setIsLoading(false);
  }, []);

  // 更新主题
  const updateConfig = useCallback(async (updates: Partial<ThemeConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    saveThemeConfig(newConfig);
    applyThemeToDOM(newConfig);
    
    // 同步到后端（如果可用）
    try {
      await fetch('/api/settings/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
    } catch (error) {
      console.warn('Failed to sync theme to backend:', error);
    }
  }, [config]);

  const setTheme = useCallback(async (theme: ThemeType) => {
    await updateConfig({ theme });
  }, [updateConfig]);

  const setRounded = useCallback(async (rounded: RoundedSize) => {
    await updateConfig({ rounded });
  }, [updateConfig]);

  const setAnimation = useCallback(async (animation: AnimationLevel) => {
    await updateConfig({ animation });
  }, [updateConfig]);

  const setCustomPrimary = useCallback(async (color: string) => {
    await updateConfig({ customPrimary: color });
  }, [updateConfig]);

  const resetToDefault = useCallback(async () => {
    await updateConfig(DEFAULT_CONFIG);
  }, [updateConfig]);

  const value = {
    config,
    setTheme,
    setRounded,
    setAnimation,
    setCustomPrimary,
    resetToDefault,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
