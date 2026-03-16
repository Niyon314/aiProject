# 🌸 情侣小家 - UI 设计文档

> 少女可爱风格设计系统 | 💕 Made with Love

## 🎨 设计理念

### 风格定位
- **少女心**：粉色系主调，温馨可爱
- **马卡龙色**：柔和的辅助色彩
- **圆角设计**：所有元素采用 12-24px 圆角
- **可爱装饰**：Emoji、爱心、花朵等元素

### 设计关键词
```
🌸 温馨 | 💕 可爱 | 🎀 甜美 | ✨ 梦幻 | 🍰 柔和
```

---

## 🌈 配色方案

### 主色调（Primary）
| 颜色 | 色值 | 用途 |
|------|------|------|
| 浅樱花粉 | `#FFD1DC` | 背景、浅色装饰 |
| 主粉色 | `#FF6B81` | 主按钮、标题、强调 |
| 深粉色 | `#FF4757` | 悬停状态、强调 |

### 辅助色（Secondary）
| 颜色 | 色值 | 名称 |
|------|------|------|
| 薄荷绿 | `#B8E6D5` | 清新功能 |
| 薰衣草紫 | `#D4C1EC` | 优雅功能 |
| 蜜桃色 | `#FFDAC1` | 温暖功能 |
| 天空蓝 | `#C4E0F5` | 宁静功能 |
| 柠檬黄 | `#FFF5BA` | 活力功能 |

### 强调色（Accent）
- 💕 爱心红：`#FF4081`
- 🌟 金色：`#FFD700`
- 🍊 珊瑚色：`#FF7F50`

### 背景色
- 主背景：`linear-gradient(135deg, #FFE5EC 0%, #FFB5C5 100%)`
- 卡片背景：`rgba(255, 255, 255, 0.95)`

---

## 📐 设计规范

### 圆角（Border Radius）
```typescript
radius: {
  small: '12px',   // 小按钮、标签
  medium: '16px',  // 输入框、卡片
  large: '20px',   // 大卡片、按钮
  xl: '24px',      // 特殊卡片
  round: '50%',    // 圆形元素
}
```

### 阴影（Box Shadow）
```typescript
shadow: {
  soft: '0 4px 15px rgba(255, 107, 129, 0.15)',    // 日常阴影
  medium: '0 6px 20px rgba(255, 107, 129, 0.2)',   // 悬停阴影
  strong: '0 8px 30px rgba(255, 107, 129, 0.25)',  // 强调阴影
  float: '0 10px 40px rgba(255, 107, 129, 0.3)',   // 浮动阴影
}
```

### 间距（Spacing）
```typescript
spacing: {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
}
```

### 字体大小（Font Size）
```typescript
fontSize: {
  xs: '24px',   // 小文字、标签
  sm: '28px',   // 正文、按钮
  md: '32px',   // 副标题
  lg: '36px',   // 标题
  xl: '48px',   // 大标题
  xxl: '64px',  // 超大标题
}
```

---

## 🎀 组件库

### 可用组件

#### 1. Button - 可爱按钮
```tsx
import { Button } from '@/components'

<Button type='primary'>主按钮 💕</Button>
<Button type='secondary'>次按钮 🎀</Button>
<Button type='outline'>边框按钮 🌸</Button>
<Button type='gradient'>渐变按钮 ✨</Button>
<Button size='small' | 'medium' | 'large'>尺寸</Button>
<Button loading>加载中</Button>
<Button icon='🎉'>带图标</Button>
```

#### 2. Card - 可爱卡片
```tsx
import { Card } from '@/components'

<Card variant='cute'>可爱卡片</Card>
<Card variant='gradient'>渐变卡片</Card>
<Card variant='transparent'>透明卡片</Card>
<Card hoverable>可悬停卡片</Card>
```

#### 3. Input - 可爱输入框
```tsx
import { Input } from '@/components'

<Input 
  label='用户名' 
  icon='👤' 
  placeholder='请输入' 
/>

<Input 
  type='password' 
  label='密码' 
  icon='🔐'
  error='密码错误'
/>
```

#### 4. Loading - 可爱加载
```tsx
import { Loading } from '@/components'

<Loading variant='heart' />     // 心跳
<Loading variant='dots' />      // 点点
<Loading variant='spinner' />   // 旋转
<Loading size='small' | 'medium' | 'large' />
```

#### 5. Decorator - 装饰元素
```tsx
import { Decorator } from '@/components'

<Decorator type='hearts' />     // 爱心
<Decorator type='flowers' />    // 花朵
<Decorator type='stars' />      // 星星
<Decorator position='top' | 'bottom' | 'scattered' />
```

---

## ✨ 动画效果

### 内置动画
- `float` - 漂浮动画
- `heartbeat` - 心跳动画
- `pulse` - 脉冲动画
- `shine` - 光泽动画
- `sparkle` - 闪烁动画

### 使用示例
```scss
.element {
  animation: heartbeat 2s ease-in-out infinite;
}
```

---

## 🎨 主题文件

### 使用主题变量
```tsx
import theme from '@/styles/theme'

<View style={{ color: theme.primary.main }}>
  <Text style={{ fontSize: theme.fontSize.lg }}>
    标题
  </Text>
</View>
```

### 使用 SCSS 变量
```scss
@import '@/styles/global.scss';

.element {
  color: $primary-main;
  font-size: $font-lg;
  border-radius: $radius-large;
  box-shadow: $shadow-soft;
}
```

---

## 📱 页面示例

### 首页（index）
- 渐变背景
- 可爱欢迎区
- 功能卡片网格
- 温馨提示卡片
- 浮动装饰元素

### 登录页（login）
- 可爱 Logo 区
- 表单卡片
- 输入框带图标
- 渐变按钮
- 背景装饰

### 主题展示页（theme-showcase）
- 完整配色展示
- 所有组件预览
- 圆角示例
- 装饰元素展示

---

## 🌟 Emoji 装饰库

### 可用 Emoji
```typescript
emojis: {
  love: '💕',
  heart: '❤️',
  sparkles: '✨',
  flower: '🌸',
  ribbon: '🎀',
  cake: '🍰',
  star: '⭐',
  moon: '🌙',
  sun: '☀️',
  cloud: '☁️',
  rainbow: '🌈',
  kiss: '💋',
  couple: '👫',
  home: '🏠',
}
```

---

## 📂 文件结构

```
frontend/src/
├── styles/
│   ├── theme.ts          # 主题配置
│   └── global.scss       # 全局样式
├── components/
│   ├── Button/           # 按钮组件
│   ├── Card/             # 卡片组件
│   ├── Input/            # 输入框组件
│   ├── Loading/          # 加载组件
│   ├── Decorator/        # 装饰组件
│   └── index.ts          # 统一导出
└── pages/
    ├── index/            # 首页
    ├── login/            # 登录页
    └── theme-showcase/   # 主题展示页
```

---

## 🎀 设计原则

1. **柔和第一**：所有颜色都要柔和、不刺眼
2. **圆角优先**：避免尖锐的直角
3. **装饰适度**：可爱但不杂乱
4. **留白呼吸**：足够的间距和留白
5. **一致性**：保持整体风格统一

---

## 💕 温馨提示

> 设计的目标是让用户感受到温馨和甜蜜，每一个细节都要传递爱意～

**Happy Coding! 🌸✨**
