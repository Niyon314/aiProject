# 🎨 情侣小家 - UI 设计规范

## 设计风格

**主题**: 少女可爱风 💕

### 关键词
- 少女心
- 可爱温馨
- 马卡龙色系
- 圆润柔和
- 浪漫甜蜜

---

## 🌈 配色方案

### 主色调
```scss
$primary-pink: #FFB6C1;      // 樱花粉
$primary-coral: #FF8FAB;     // 珊瑚粉
$primary-rose: #FB6F92;      // 玫瑰粉
```

### 辅助色
```scss
$secondary-purple: #CDB4DB;  // 淡紫
$secondary-blue: #A2D2FF;    // 天空蓝
$secondary-mint: #B5EAD7;    // 薄荷绿
$secondary-peach: #FFDAC1;   // 蜜桃色
```

### 中性色
```scss
$white: #FFFFFF;
$cream: #FFF5E4;             // 奶油色
$gray-light: #F8F9FA;
$gray-text: #6C757D;
$gray-dark: #343A40;
```

### 强调色
```scss
$accent-red: #FF6B6B;        // 爱心红
$accent-gold: #FFD93D;       // 星星金
```

---

## 🎯 设计元素

### 圆角设计
```scss
$border-radius-sm: 8px;
$border-radius-md: 12px;
$border-radius-lg: 20px;
$border-radius-xl: 30px;
$border-radius-round: 50%;
```

### 阴影效果
```scss
// 柔和阴影
$shadow-soft: 0 2px 8px rgba(255, 182, 193, 0.2);
$shadow-card: 0 4px 16px rgba(255, 143, 171, 0.15);
$shadow-float: 0 8px 24px rgba(251, 111, 146, 0.2);
```

### 渐变背景
```scss
$gradient-pink: linear-gradient(135deg, #FFB6C1 0%, #FF8FAB 100%);
$gradient-sunset: linear-gradient(135deg, #FFDAC1 0%, #FF8FAB 100%);
$gradient-rainbow: linear-gradient(135deg, #FFB6C1 0%, #CDB4DB 50%, #A2D2FF 100%);
```

---

## 🎭 组件样式

### 按钮
- 形状：大圆角 (border-radius: 25px)
- 配色：粉色渐变 + 白色文字
- 效果：hover 时轻微放大 + 阴影加深
- 图标：可爱 emoji (💕🌸✨)

### 卡片
- 形状：圆角 (border-radius: 20px)
- 背景：白色/奶油色 + 柔和阴影
- 边框：可选粉色描边 (1px solid #FFB6C1)
- 装饰：小爱心、星星角标

### 输入框
- 形状：圆角 (border-radius: 12px)
- 边框：浅粉色 (2px solid #FFB6C1)
- focus 效果：边框变深 + 光晕
- 图标：左侧可爱图标

### 图标风格
- 使用圆润可爱的图标库
- 颜色：马卡龙色系
- 尺寸：偏大 (24-32px)
- 推荐：IconFont 可爱分类、Emoji

---

## 📱 页面设计要点

### 首页
- 顶部：渐变粉色背景 + 欢迎语
- 情侣头像：圆形 + 粉色边框 + 爱心连接
- 功能入口：圆角卡片 + 可爱图标
- 底部：温馨标语 + 粉色导航栏

### 登录/注册页
- 背景：粉色渐变 + 漂浮爱心
- 表单：白色卡片 + 圆角输入框
- 按钮：大圆角 + 渐变粉色
- 装饰：小星星、爱心点缀

### 日程页面
- 日历：粉色系 + 圆角日期格
- 事件：彩色标签 (马卡龙色)
- 添加按钮：悬浮爱心按钮

### 家务页面
- 任务卡片：圆角 + 完成打勾动画
- 进度条：粉色渐变 + 爱心标记
- 统计：可爱图表 + 表情反馈

---

## 🎪 动效设计

### 过渡动画
```scss
$transition-fast: 0.2s ease;
$transition-normal: 0.3s ease;
$transition-slow: 0.5s ease;
```

### 交互动效
- 按钮 hover: 放大 1.05 倍 + 阴影加深
- 卡片 hover: 上浮 4px + 阴影变深
- 完成打卡：爱心绽放动画
- 加载：粉色旋转爱心

### 页面切换
- 淡入淡出 + 轻微缩放
- 滑动切换（左右）

---

## 🖼️ 图片/插画风格

### 插画
- 风格：扁平可爱风
- 线条：圆润无棱角
- 配色：马卡龙色系
- 主题：情侣日常、家居生活

### 图标
- 2D 扁平或轻微渐变
- 圆角设计
- 颜色鲜艳但不刺眼

### Emoji 使用
常用 emoji 列表：
- 💕💖💗💓💞💟 - 爱心系列
- 🌸🌺🌹🌷💐 - 花朵系列
- 🎀🎁🎈🎉 - 装饰系列
- 🍰🧁🍮🍭 - 甜点系列
- ✨⭐🌟💫 - 星星系列
- 🏠🛋️🛏️🚿 - 家居系列

---

## 📏 响应式设计

### 断点
```scss
$mobile: 375px;
$mobile-large: 414px;
$tablet: 768px;
$desktop: 1024px;
```

### 适配原则
- 移动端优先
- 字体大小自适应
- 卡片间距灵活调整
- 保持可爱风格一致性

---

## 🎨 设计资源

### 推荐资源
- **配色**: Coolors.co (马卡龙色系)
- **图标**: IconFont (可爱分类)、Flaticon
- **插画**: Undraw (可定制颜色)、ManyPixels
- **字体**: 圆体、手写体（标题使用）

### 字体推荐
- 中文：站酷快乐体、阿里巴巴普惠体（圆体）
- 英文：Quicksand、Nunito、Fredoka One

---

## ✅ 设计检查清单

- [x] 配色方案确定（粉色系马卡龙）
- [ ] 全局样式变量创建
- [ ] 首页 UI 设计
- [ ] 登录/注册页设计
- [ ] 通用组件库
- [ ] 图标资源收集
- [ ] 动效实现
- [ ] 响应式适配

---

*Design Guide v1.0 - 少女可爱风*
*Last updated: 2026-03-16*
