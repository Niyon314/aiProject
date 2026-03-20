# 🎨 情侣小家 - UI 设计稿

> **设计风格**: 少女可爱风 🌸  
> **版本**: 1.0  
> **创建日期**: 2026-03-19  
> **使用技能**: superdesign

---

## 📐 一、布局设计 (ASCII Wireframes)

### 1.1 首页 (Home)

```
┌─────────────────────────────────────────────────┐
│  ☰  我们的小家                      🔔 3  👤   │  ← 顶部导航
├─────────────────────────────────────────────────┤
│                                                 │
│   👋 早上好，小仙女 💕                           │
│   📅 2026 年 3 月 19 日 星期四                    │
│                                                 │
│   ┌───────────────────────────────────────────┐ │
│   │  💝 恋爱天数：第 128 天                    │ │  ← 纪念日卡片
│   │  💕 下次纪念日：5 天后                    │ │
│   └───────────────────────────────────────────┘ │
│                                                 │
│   今天吃什么？ 🍽️                               │  ← 投票模块
│   ┌──────────────┐  ┌──────────────┐           │
│   │  🍜 火锅     │  │  🍣 日料     │           │
│   │  👍 12 票    │  │  👍 8 票     │           │
│   │  💖 你也喜欢 │  │              │           │
│   └──────────────┘  └──────────────┘           │
│   ┌──────────────┐  ┌──────────────┐           │
│   │  🍕 披萨     │  │  🥗 轻食     │           │
│   │              │  │              │           │
│   └──────────────┘  └──────────────┘           │
│                                                 │
│   待办事项 📋                                    │  ← 快捷入口
│   ┌──────────────┐  ┌──────────────┐           │
│   │  🧹 家务     │  │  💰 账单     │           │
│   │  待完成 2    │  │  待 AA 3     │           │
│   │  ●●●○○      │  │  ¥256.50    │           │
│   └──────────────┘  └──────────────┘           │
│   ┌──────────────┐  ┌──────────────┐           │
│   │  📅 日程     │  │  📸 回忆     │           │
│   │  今晚 7 点   │  │  3 天前      │           │
│   │  约会晚餐   │  │  上传合照   │           │
│   └──────────────┘  └──────────────┘           │
│                                                 │
├─────────────────────────────────────────────────┤
│   🏠       📅       ➕       💬       👤       │  ← 底部导航
│  首页     日程     发布     消息     我的      │
│   ●                                        ○   │
└─────────────────────────────────────────────────┘
```

### 1.2 吃饭投票页 (Eating Vote)

```
┌─────────────────────────────────────────────────┐
│  ←  今天吃什么？                      📊 统计   │
├─────────────────────────────────────────────────┤
│                                                 │
│   🍽️ 午餐投票                                   │
│   ⏰ 截止时间：今天下午 2 点                      │
│                                                 │
│   ┌───────────────────────────────────────────┐ │
│   │  🍜 重庆火锅                              │ │
│   │  💗 小仙女人气：12 票                      │ │
│   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ 85%         │ │
│   │                                           │ │
│   │  👍 喜欢  👎 不喜欢  🚫 否决 (1/1)       │ │
│   └───────────────────────────────────────────┘ │
│                                                 │
│   ┌───────────────────────────────────────────┐ │
│   │  🍣 日料寿司                              │ │
│   │  💗 小仙女人气：8 票                       │ │
│   │  ━━━━━━━━━━━━━━━━━━━━━━━ 60%             │ │
│   │                                           │ │
│   │  👍 喜欢  👎 不喜欢  🚫 否决 (1/1)       │ │
│   └───────────────────────────────────────────┘ │
│                                                 │
│   ┌───────────────────────────────────────────┐ │
│   │  🍕 披萨意面                              │ │
│   │  💗 小仙女人气：5 票                       │ │
│   │  ━━━━━━━━━━━━━━━━━ 40%                   │ │
│   │                                           │ │
│   │  👍 喜欢  👎 不喜欢  🚫 否决 (1/1)       │ │
│   └───────────────────────────────────────────┘ │
│                                                 │
│   ┌───────────────────────────────────────────┐ │
│   │  ➕ 推荐其他餐厅                          │ │
│   └───────────────────────────────────────────┘ │
│                                                 │
├─────────────────────────────────────────────────┤
│   🏠       📅       ➕       💬       👤       │
└─────────────────────────────────────────────────┘
```

### 1.3 家务分工页 (Chores)

```
┌─────────────────────────────────────────────────┐
│  ←  家务分工                        🏆 排行榜   │
├─────────────────────────────────────────────────┤
│                                                 │
│   本周进度  ●●●●○○○○  4/8                      │
│   🎉 太棒了！已完成 4 项家务                    │
│                                                 │
│   待完成 (4)                                     │
│   ┌───────────────────────────────────────────┐ │
│   │  🧹 拖地                                  │ │
│   │  👤 小仙女  |  📅 今天前完成              │ │
│   │  ⭐ 10 积分                                │ │
│   │  [✅ 完成打卡]                            │ │
│   └───────────────────────────────────────────┘ │
│   ┌───────────────────────────────────────────┐ │
│   │  🗑️ 倒垃圾                                │ │
│   │  👤 大笨蛋  |  📅 今天前完成              │ │
│   │  ⭐ 5 积分                                 │ │
│   │  [等待完成...]                            │ │
│   └───────────────────────────────────────────┘ │
│   ┌───────────────────────────────────────────┐ │
│   │  🍳 洗碗                                  │ │
│   │  👤 大笨蛋  |  📅 明天前完成              │ │
│   │  ⭐ 15 积分                                │ │
│   │  [等待完成...]                            │ │
│   └───────────────────────────────────────────┘ │
│   ┌───────────────────────────────────────────┐ │
│   │  🛒 买菜                                  │ │
│   │  👤 小仙女  |  📅 明天前完成              │ │
│   │  ⭐ 20 积分                                │ │
│   │  [等待完成...]                            │ │
│   └───────────────────────────────────────────┘ │
│                                                 │
│   已完成 (4)                                     │
│   ┌───────────────────────────────────────────┐ │
│   │  ✅ 洗衣服  |  👤 大笨蛋  |  ⭐15 积分    │ │
│   └───────────────────────────────────────────┘ │
│   ┌───────────────────────────────────────────┐ │
│   │  ✅ 擦桌子  |  👤 小仙女  |  ⭐10 积分    │ │
│   └───────────────────────────────────────────┘ │
│                                                 │
├─────────────────────────────────────────────────┤
│   🏠       📅       ➕       💬       👤       │
└─────────────────────────────────────────────────┘
```

### 1.4 账单 AA 页 (Bills)

```
┌─────────────────────────────────────────────────┐
│  ←  账单 AA                          📊 统计    │
├─────────────────────────────────────────────────┤
│                                                 │
│   本月待 AA  💰                                  │
│   ┌───────────────────────────────────────────┐ │
│   │  小仙女垫付：¥1,256.50                    │ │
│   │  大笨蛋垫付：¥843.00                      │ │
│   │  ─────────────────────────                │ │
│   │  大笨蛋需转给小仙女：¥206.75 💸           │ │
│   └───────────────────────────────────────────┘ │
│                                                 │
│   待确认 (3)                                     │
│   ┌───────────────────────────────────────────┐ │
│   │  🧾 超市购物  |  3 月 18 日                 │ │
│   │  💰 ¥256.50  |  👤 小仙女垫付             │ │
│   │  📷 [查看照片]                            │ │
│   │  [✅ 确认]  [❌ 有异议]                   │ │
│   └───────────────────────────────────────────┘ │
│   ┌───────────────────────────────────────────┐ │
│   │  🏠 房租  |  3 月 15 日                     │ │
│   │  💰 ¥3,000.00  |  👤 大笨蛋垫付           │ │
│   │  📷 [查看照片]                            │ │
│   │  [✅ 确认]  [❌ 有异议]                   │ │
│   └───────────────────────────────────────────┘ │
│                                                 │
│   历史记录                                      │
│   ┌───────────────────────────────────────────┐ │
│   │  ✅ 水电费  |  3 月 10 日  |  ¥156.00      │ │
│   └───────────────────────────────────────────┘ │
│   ┌───────────────────────────────────────────┐ │
│   │  ✅ 外卖  |  3 月 8 日  |  ¥89.00          │ │
│   └───────────────────────────────────────────┘ │
│                                                 │
│   ┌───────────────────────────────────────────┐ │
│   │  ➕ 添加新账单                            │ │
│   └───────────────────────────────────────────┘ │
│                                                 │
├─────────────────────────────────────────────────┤
│   🏠       📅       ➕       💬       👤       │
└─────────────────────────────────────────────────┘
```

### 1.5 个人中心页 (Profile)

```
┌─────────────────────────────────────────────────┐
│  ←  我的                            ⚙️ 设置    │
├─────────────────────────────────────────────────┤
│                                                 │
│        ┌─────────────┐                          │
│        │   🧚‍♀️     │                          │
│        │  小仙女     │                          │
│        │  可爱头像   │                          │
│        └─────────────┘                          │
│                                                 │
│   💕 与 大笨蛋 的同居生活                        │
│   📅 在一起 128 天  |  🏠 同居 45 天              │
│                                                 │
│   ┌───────────────────────────────────────────┐ │
│   │  📊 我的数据                              │ │
│   │  投票参与：92%  |  家务完成：85%          │ │
│   │  账单 AA: 100% 准时                       │ │
│   └───────────────────────────────────────────┘ │
│                                                 │
│   功能菜单                                      │
│   ┌───────────────────────────────────────────┐ │
│   │  🎨 主题装扮           >                 │ │
│   └───────────────────────────────────────────┘ │
│   ┌───────────────────────────────────────────┐ │
│   │  🔔 通知设置           >                 │ │
│   └───────────────────────────────────────────┘ │
│   ┌───────────────────────────────────────────┐ │
│   │  💾 数据备份           >                 │ │
│   └───────────────────────────────────────────┘ │
│   ┌───────────────────────────────────────────┐ │
│   │  ❓ 帮助与反馈         >                 │ │
│   └───────────────────────────────────────────┘ │
│   ┌───────────────────────────────────────────┐ │
│   │  ℹ️  关于我们           >                 │ │
│   └───────────────────────────────────────────┘ │
│                                                 │
│   ┌───────────────────────────────────────────┐ │
│   │  🚪 退出登录                              │ │
│   └───────────────────────────────────────────┘ │
│                                                 │
├─────────────────────────────────────────────────┤
│   🏠       📅       ➕       💬       👤       │
│                                        ●       │
└─────────────────────────────────────────────────┘
```

---

## 🎨 二、主题设计 (Theme System)

### 2.1 色彩系统

```css
:root {
  /* 主色调 - 粉色系 */
  --primary-pink-light: #FFE5EC;
  --primary-pink: #FFB5C5;
  --primary-pink-dark: #FF6B81;
  --primary-pink-darker: #FF4757;
  
  /* 马卡龙辅助色 */
  --macaron-blue: #A8E6FF;
  --macaron-purple: #DDA0DD;
  --macaron-green: #98D8C8;
  --macaron-yellow: #FFF5BA;
  --macaron-peach: #FFDAB9;
  
  /* 中性色 */
  --text-primary: #4A4A4A;
  --text-secondary: #888888;
  --text-muted: #AAAAAA;
  --border-light: #E0E0E0;
  --border-pink: #FFD1DC;
  --background: #FFF5F7;
  --background-white: #FFFFFF;
  
  /* 功能色 */
  --success: #7ED957;
  --warning: #FFB347;
  --error: #FF6B6B;
  --info: #6BCBFF;
  
  /* 阴影 */
  --shadow-sm: 0 2px 8px rgba(255, 107, 129, 0.08);
  --shadow-md: 0 4px 16px rgba(255, 107, 129, 0.12);
  --shadow-lg: 0 8px 32px rgba(255, 107, 129, 0.16);
  --shadow-hover: 0 6px 24px rgba(255, 107, 129, 0.2);
  
  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-full: 9999px;
  
  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* 字体 */
  --font-sans: 'Nunito', 'Quicksand', system-ui, sans-serif;
  --font-heading: 'Quicksand', 'Nunito', system-ui, sans-serif;
}
```

### 2.2 渐变方案

```css
/* 主背景渐变 */
.gradient-pink {
  background: linear-gradient(135deg, #FFE5EC 0%, #FFB5C5 100%);
}

/* 卡片渐变 */
.gradient-card {
  background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%);
}

/* 按钮渐变 */
.gradient-button {
  background: linear-gradient(135deg, #FF6B81 0%, #FF4757 100%);
}

/* 强调渐变 */
.gradient-accent {
  background: linear-gradient(135deg, #A8E6FF 0%, #DDA0DD 100%);
}
```

### 2.3 字体方案

```css
/* Google Fonts 引入 */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Quicksand:wght@500;600;700&display=swap');

/* 字体使用 */
body {
  font-family: 'Nunito', system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Quicksand', system-ui, sans-serif;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-primary);
}
```

---

## ✨ 三、动画设计 (Animation System)

### 3.1 微交互动画

```css
/* 按钮按压效果 */
@keyframes button-press {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.btn-primary:active {
  animation: button-press 150ms ease-in-out;
}

/* 悬浮效果 */
@keyframes hover-lift {
  0% { transform: translateY(0); box-shadow: var(--shadow-sm); }
  100% { transform: translateY(-2px); box-shadow: var(--shadow-md); }
}

.card:hover {
  animation: hover-lift 200ms ease-out forwards;
}

/* 浮动爱心 */
@keyframes float-heart {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

.floating-heart {
  animation: float-heart 2s ease-in-out infinite;
}

/* 淡入效果 */
@keyframes fade-in {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fade-in 400ms ease-out;
}

/* 滑入效果 */
@keyframes slide-in-left {
  0% { opacity: 0; transform: translateX(-100px); }
  100% { opacity: 1; transform: translateX(0); }
}

.slide-in-left {
  animation: slide-in-left 350ms ease-out;
}

/* 弹跳效果 */
@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.bounce {
  animation: bounce 600ms ease-in-out;
}

/* 加载动画 - 爱心跳动 */
@keyframes heart-beat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.1); }
  50% { transform: scale(1); }
  75% { transform: scale(1.1); }
}

.loading-heart {
  animation: heart-beat 1s ease-in-out infinite;
}
```

### 3.2 页面过渡

```css
/* 页面切换动画 */
@keyframes page-enter {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

.page-enter {
  animation: page-enter 300ms ease-out;
}

@keyframes page-exit {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.95); }
}

.page-exit {
  animation: page-exit 300ms ease-in;
}
```

---

## 🎯 四、组件设计规范

### 4.1 卡片组件

```css
.card {
  background: var(--background-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-pink);
  transition: all 200ms ease-out;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-primary {
  background: linear-gradient(135deg, #FFE5EC 0%, #FFB5C5 100%);
  border: none;
}
```

### 4.2 按钮组件

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: var(--radius-full);
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 16px;
  transition: all 200ms ease-out;
  cursor: pointer;
  border: none;
  outline: none;
}

.btn-primary {
  background: linear-gradient(135deg, #FF6B81 0%, #FF4757 100%);
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: scale(0.95);
}

.btn-secondary {
  background: var(--background-white);
  color: var(--primary-pink-dark);
  border: 2px solid var(--primary-pink);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}
```

### 4.3 输入框组件

```css
.input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 16px;
  transition: all 200ms ease-out;
  background: var(--background-white);
}

.input:focus {
  outline: none;
  border-color: var(--primary-pink);
  box-shadow: 0 0 0 3px rgba(255, 181, 197, 0.2);
}

.input::placeholder {
  color: var(--text-muted);
}
```

### 4.4 导航组件

```css
/* 底部导航 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--background-white);
  border-top: 1px solid var(--border-pink);
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 8px rgba(255, 107, 129, 0.08);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 12px;
  transition: all 200ms ease-out;
  cursor: pointer;
}

.tab-item.active {
  color: var(--primary-pink-dark);
}

.tab-item-icon {
  font-size: 24px;
}

.tab-item.active .tab-item-icon {
  animation: bounce 600ms ease-in-out;
}
```

---

## 📱 五、响应式设计

### 5.1 断点定义

```css
/* Mobile First */
:root {
  --container-padding: 16px;
}

/* Tablet */
@media (min-width: 768px) {
  :root {
    --container-padding: 24px;
  }
  
  .container {
    max-width: 720px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  :root {
    --container-padding: 32px;
  }
  
  .container {
    max-width: 960px;
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
  }
}
```

### 5.2 移动端优化

```css
/* 触摸目标最小尺寸 */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* 防止双击缩放 */
* {
  touch-action: manipulation;
}

/* 移动端字体大小 */
@media (max-width: 375px) {
  body {
    font-size: 14px;
  }
  
  h1 { font-size: 24px; }
  h2 { font-size: 20px; }
}
```

---

## ♿ 六、无障碍设计

### 6.1 色彩对比度

- 正文文字与背景对比度：≥ 4.5:1
- 大标题与背景对比度：≥ 3:1
- 按钮文字与背景对比度：≥ 4.5:1

### 6.2 键盘导航

```css
/* 焦点样式 */
*:focus {
  outline: 3px solid var(--primary-pink);
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}

*:focus-visible {
  outline: 3px solid var(--primary-pink);
  outline-offset: 2px;
}
```

### 6.3 屏幕阅读器支持

```html
<!-- 图标添加 aria-label -->
<button aria-label="提交投票">
  <i data-lucide="heart"></i>
</button>

<!-- 图片添加 alt -->
<img src="avatar.jpg" alt="小仙女的头像" />

<!-- 区域添加 role -->
<nav role="navigation" aria-label="主导航">
```

---

## 🎭 七、情感化设计

### 7.1 空状态

```
┌─────────────────────────┐
│                         │
│      🌸                 │
│                         │
│   还没有任何账单哦      │
│                         │
│   点击上方 + 添加第一笔  │
│                         │
└─────────────────────────┘
```

### 7.2 加载状态

```
┌─────────────────────────┐
│                         │
│    💕  💕  💕          │
│   加载中，马上就好~     │
│                         │
└─────────────────────────┘
```

### 7.3 成功状态

```
┌─────────────────────────┐
│                         │
│      ✅ 🎉              │
│                         │
│   完成啦！太棒了~       │
│   +15 积分              │
│                         │
└─────────────────────────┘
```

### 7.4 错误状态

```
┌─────────────────────────┐
│                         │
│      😢 💦              │
│                         │
│   哎呀，出错了          │
│   请重试一下~           │
│                         │
│   [重试]  [取消]        │
│                         │
└─────────────────────────┘
```

---

## 📋 八、设计资源清单

### 8.1 字体资源

- **Nunito** (Google Fonts) - 正文字体
- **Quicksand** (Google Fonts) - 标题字体

### 8.2 图标资源

- **Lucide Icons** - 主要图标库
- **Emoji** - 情感化表达

### 8.3 图片资源

- **Unsplash** - 高质量照片
- **placehold.co** - 占位图

### 8.4 动画库

- **Framer Motion** - React 动画库
- **CSS Animations** - 简单微交互

---

## 🎯 九、设计验收标准

### 9.1 视觉验收

- [ ] 所有颜色符合色彩系统定义
- [ ] 圆角统一使用定义值
- [ ] 阴影层次清晰，不过重
- [ ] 渐变过渡自然

### 9.2 交互验收

- [ ] 所有按钮有 hover/active 状态
- [ ] 加载动画流畅自然
- [ ] 页面过渡无卡顿
- [ ] 触摸反馈及时

### 9.3 响应式验收

- [ ] 所有页面在 375px 宽度正常显示
- [ ] 平板端布局合理
- [ ] 桌面端居中显示，不超过最大宽度

### 9.4 无障碍验收

- [ ] 色彩对比度达标
- [ ] 键盘可完成所有操作
- [ ] 屏幕阅读器可正确朗读

---

*设计稿完成于 2026-03-19*  
*使用 superdesign 技能生成* 🎨  
*百变怪团队 Made with Love 💕*
