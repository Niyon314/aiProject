# 📅 日程管理 + 💕 纪念日 - 详细需求文档

> **版本**: 1.0  
> **创建日期**: 2026-03-23  
> **优先级**: P1  
> **预估工时**: 2 天  

---

## 📋 一、功能概述

### 1.1 产品目标

帮助情侣管理共同日程，不错过重要约会和纪念日，增加生活仪式感。

### 1.2 核心功能

**日程管理**:
- 日历视图展示
- 约会安排
- 提醒通知

**纪念日**:
- 纪念日管理
- 倒计时显示
- 提前提醒
- 年度回忆

---

## 🎯 二、功能需求

### 2.1 日程管理

#### 数据结构

```typescript
interface Schedule {
  id: string;
  title: string;
  description?: string;
  icon: string; // emoji
  startTime: string; // ISO 8601
  endTime: string;
  location?: string;
  type: 'date' | 'work' | 'family' | 'friend' | 'other';
  reminder: 'none' | '1h' | '1d' | '1w';
  participants: ('user' | 'partner')[];
  status: 'planned' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
```

#### API 接口

```
GET    /api/schedules              # 获取日程列表
POST   /api/schedules              # 创建日程
PUT    /api/schedules/:id          # 更新日程
DELETE /api/schedules/:id          # 删除日程
GET    /api/schedules/upcoming     # 即将开始的日程
```

#### UI 设计

```
┌─────────────────────────────────┐
│  📅 3 月 2026                    │
├─────────────────────────────────┤
│  一   二   三   四   五   六   日 │
│                           1   2  │
│   3   4   5   6   7   8   9      │
│  10  11  12 💕 14  15  16        │
│  17  18  19  20  21  22  23      │
│  24  25  26  27  28  29  30      │
│  31                              │
├─────────────────────────────────┤
│  📌 本月重要安排                │
│  ┌─────────────────────────┐   │
│  │ 💕 3.14 白色情人节      │   │
│  │ 🎬 3.20 看电影          │   │
│  │ 🍽️ 3.25 纪念日晚餐      │   │
│  └─────────────────────────┘   │
│                                 │
│  [➕ 添加日程]                  │
└─────────────────────────────────┘
```

---

### 2.2 纪念日管理

#### 数据结构

```typescript
interface Anniversary {
  id: string;
  name: string;
  date: string; // 纪念日开始日期
  icon: string; // emoji
  type: 'festival' | 'birthday' | 'relationship' | 'other';
  year: number; // 起始年份
  isLunar: boolean; // 是否农历
  reminderDays: number[]; // [7, 3, 1] 提前几天提醒
  notes?: string;
  history: AnniversaryHistory[];
  createdAt: string;
  updatedAt: string;
}

interface AnniversaryHistory {
  year: number;
  date: string;
  description: string;
  photos?: string[];
}
```

#### API 接口

```
GET    /api/anniversaries          # 获取纪念日列表
POST   /api/anniversaries          # 创建纪念日
PUT    /api/anniversaries/:id      # 更新纪念日
DELETE /api/anniversaries/:id      # 删除纪念日
GET    /api/anniversaries/upcoming # 即将到来的纪念日
GET    /api/anniversaries/days     # 在一起天数统计
```

#### UI 设计

```
┌─────────────────────────────────┐
│  💕 我们的纪念日                │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │ 🎉 恋爱纪念日           │   │
│  │    2025-03-14           │   │
│  │    已相恋 375 天          │   │
│  │    下次：11 天后          │   │
│  │    [编辑] [删除]        │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🎂 他的生日             │   │
│  │    1995-06-15           │   │
│  │    下次：84 天后          │   │
│  │    [编辑] [删除]        │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🏠 同居纪念日           │   │
│  │    2025-09-01           │   │
│  │    已同居 204 天          │   │
│  │    下次：162 天后         │   │
│  │    [编辑] [删除]        │   │
│  └─────────────────────────┘   │
│                                 │
│  [➕ 添加纪念日]                │
└─────────────────────────────────┘
```

---

### 2.3 首页展示

```
┌─────────────────────────────────┐
│  👋 早上好，小明 💕             │
│  📅 3 月 23 日 周日              │
├─────────────────────────────────┤
│  💕 在一起第 375 天              │
│  ████████████░░░░░░░ 1 周年进度 │
│                                 │
│  📌 今天                         │
│  ┌─────────────────────────┐   │
│  │ 🎬 19:00 看电影          │   │
│  │    地点：万达影城        │   │
│  └─────────────────────────┘   │
│                                 │
│  ⏰ 即将到来                    │
│  ┌─────────────────────────┐   │
│  │ 💕 恋爱纪念日 1 周年     │   │
│  │    还有 11 天            │   │
│  └─────────────────────────┘   │
│                                 │
│  [📅 日程] [💕 纪念日]         │
└─────────────────────────────────┘
```

---

## 🛠️ 三、技术实现

### 3.1 后端模型

```go
type Schedule struct {
    ID          string    `json:"id"`
    Title       string    `json:"title"`
    Description string    `json:"description,omitempty"`
    Icon        string    `json:"icon"`
    StartTime   time.Time `json:"startTime"`
    EndTime     time.Time `json:"endTime"`
    Location    string    `json:"location,omitempty"`
    Type        string    `json:"type"` // date/work/family/friend/other
    Reminder    string    `json:"reminder"` // none/1h/1d/1w
    Participants []string `json:"participants"`
    Status      string    `json:"status"` // planned/completed/cancelled
    CreatedAt   time.Time `json:"createdAt"`
    UpdatedAt   time.Time `json:"updatedAt"`
}

type Anniversary struct {
    ID            string    `json:"id"`
    Name          string    `json:"name"`
    Date          time.Time `json:"date"`
    Icon          string    `json:"icon"`
    Type          string    `json:"type"` // festival/birthday/relationship/other
    Year          int       `json:"year"`
    IsLunar       bool      `json:"isLunar"`
    ReminderDays  []int     `json:"reminderDays"`
    Notes         string    `json:"notes,omitempty"`
    CreatedAt     time.Time `json:"createdAt"`
    UpdatedAt     time.Time `json:"updatedAt"`
}
```

### 3.2 核心算法

#### 在一起天数计算
```go
func DaysTogether(startDate time.Time) int {
    now := time.Now()
    duration := now.Sub(startDate)
    return int(duration.Hours() / 24)
}
```

#### 倒计时计算
```go
func DaysUntil(targetDate time.Time) int {
    now := time.Now()
    duration := targetDate.Sub(now)
    days := int(duration.Hours() / 24)
    if days < 0 {
        return 0 // 已过期
    }
    return days
}
```

---

## ✅ 四、验收标准

### 功能验收
- [ ] 能正常创建/获取/更新/删除日程
- [ ] 能正常创建/获取/更新/删除纪念日
- [ ] 日历视图显示正确
- [ ] 倒计时计算准确
- [ ] 提醒功能正常

### UI 验收
- [ ] 符合少女可爱风
- [ ] 动画流畅
- [ ] 响应式布局

### 性能验收
- [ ] 页面加载 < 2 秒
- [ ] API 响应 < 500ms

---

## 📅 五、开发计划

### Day 1: 日程管理
- [ ] 后端模型 + API
- [ ] 前端页面 + 组件
- [ ] 日历视图

### Day 2: 纪念日
- [ ] 后端模型 + API
- [ ] 前端页面 + 组件
- [ ] 倒计时功能
- [ ] 联调测试

---

*Created by 百变怪产品团队* 💕  
*2026-03-23*
