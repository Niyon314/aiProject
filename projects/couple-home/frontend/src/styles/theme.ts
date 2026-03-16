// 主题配置

export const theme = {
  // 主色调
  primary: {
    light: '#FF8FA3',
    main: '#FF6B81',
    dark: '#FF4757',
  },
  
  // 中性色
  neutral: {
    white: '#FFFFFF',
    gray100: '#F8F9FA',
    gray200: '#E9ECEF',
    gray300: '#DEE2E6',
    gray400: '#CED4DA',
    gray500: '#ADB5BD',
    gray600: '#6C757D',
    gray700: '#495057',
    gray800: '#343A40',
    gray900: '#212529',
    black: '#000000',
  },
  
  // 功能色
  success: '#2ED573',
  warning: '#FFA502',
  error: '#FF4757',
  info: '#1E90FF',
  
  // 字体大小
  fontSize: {
    xs: 20,
    sm: 24,
    md: 28,
    lg: 32,
    xl: 36,
    xxl: 48,
  },
  
  // 间距
  spacing: {
    xs: 10,
    sm: 20,
    md: 30,
    lg: 40,
    xl: 60,
  },
  
  // 圆角
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
    full: 9999,
  },
  
  // 阴影
  shadow: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.05)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
}

export type Theme = typeof theme
