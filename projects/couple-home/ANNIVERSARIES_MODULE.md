# 💕 纪念日模块开发文档

## 功能概述

纪念日模块是情侣小家应用的核心功能之一，用于记录和追踪重要的纪念日，提供倒计时、提醒通知等功能。

## 功能特性

### 1. 纪念日管理
- ✅ 创建纪念日（标题、日期、类型、描述）
- ✅ 编辑纪念日信息
- ✅ 删除纪念日
- ✅ 支持个人纪念日和情侣共享纪念日

### 2. 倒计时功能
- ✅ 自动计算距离下一个纪念日还有多少天
- ✅ 支持每年重复的纪念日
- ✅ 特殊显示"今天就是纪念日"
- ✅ 可爱的倒计时卡片展示

### 3. 提醒通知
- ✅ 启用/禁用提醒开关
- ✅ 分级提醒：提前 7 天、3 天、1 天、当天
- ✅ 可自定义提醒天数组合
- ✅ 每天上午 8 点自动检查并发送提醒

### 4. 纪念日类型
- 💕 在一起（first_date）
- 🎂 生日（birthday）
- 💍 订婚（engagement）
- 💒 结婚（wedding）
- 🎉 其他（other）

## 技术实现

### 后端 (NestJS)

#### 文件结构
```
backend/src/anniversaries/
├── anniversaries.module.ts          # 模块定义
├── anniversaries.cron.service.ts    # 定时任务服务
├── controllers/
│   └── anniversaries.controller.ts  # API 控制器
├── services/
│   └── anniversaries.service.ts     # 业务逻辑
└── dto/
    └── create-anniversary.dto.ts    # 数据传输对象
```

#### API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/anniversaries` | 创建纪念日 |
| GET | `/api/anniversaries?userId=&coupleId=` | 获取纪念日列表 |
| GET | `/api/anniversaries/:id` | 获取单个纪念日详情 |
| PATCH | `/api/anniversaries/:id` | 更新纪念日 |
| DELETE | `/api/anniversaries/:id` | 删除纪念日 |
| POST | `/api/anniversaries/check-reminders` | 手动触发提醒检查 |

#### 数据库 Schema 变更

```prisma
model Anniversary {
  id             String    @id @default(uuid())
  title          String    // 纪念日名称
  date           DateTime  // 纪念日日期
  type           String    // 类型
  description    String?   // 描述
  isRecurring    Boolean   @default(true) // 是否每年重复
  enableReminder Boolean   @default(true) // 是否启用提醒
  reminderDays   Int[]     @default([7, 3, 1, 0]) // 提前几天提醒
  userId         String
  user           User      @relation(fields: [userId], references: [id])
  coupleId       String?
  couple         Couple?   @relation(fields: [coupleId], references: [id])
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

#### 定时任务

- **每天 08:00** - 检查并发送纪念日提醒
- **每周一 09:00** - 下周纪念日预告（预留功能）

### 前端 (Taro + React)

#### 文件结构
```
frontend/src/pages/couple/anniversaries/
├── anniversaries.tsx          # 主页面
├── anniversaries.scss         # 页面样式
├── edit.tsx                   # 编辑页面
├── edit.scss                  # 编辑页面样式
└── components/
    ├── CountdownCard.tsx      # 倒计时卡片组件
    ├── CountdownCard.scss     # 卡片样式
    ├── CreateAnniversaryModal.tsx  # 创建弹窗
    └── CreateAnniversaryModal.scss # 弹窗样式
```

#### 页面功能

**纪念日列表页** (`/pages/couple/anniversaries/anniversaries`)
- 展示所有纪念日卡片
- 按倒计时排序（最近的在前）
- 支持按类型筛选
- 下拉刷新
- 点击右下角按钮创建新纪念日

**编辑页面** (`/pages/couple/anniversaries/edit`)
- 编辑纪念日所有信息
- 提醒设置开关
- 删除纪念日功能

#### UI 设计风格

- **配色**: 粉色马卡龙色系 (#FF6B81, #FF8FA3, #FFE4E9)
- **圆角**: 大圆角设计 (20px-32px)
- **装饰**: 可爱 emoji (💕🎁🎂💍💒🎉)
- **卡片**: 渐变背景、柔和阴影
- **动画**: 平滑过渡效果

## 使用示例

### 创建纪念日

```typescript
POST /api/anniversaries
{
  "title": "我们在一起一周年",
  "date": "2024-03-16",
  "type": "first_date",
  "description": "第一次牵手的日子 💕",
  "isRecurring": true,
  "enableReminder": true,
  "reminderDays": [7, 3, 1, 0],
  "userId": "user-uuid",
  "coupleId": "couple-uuid"
}
```

### 获取纪念日列表

```typescript
GET /api/anniversaries?coupleId=couple-uuid

// 响应
[
  {
    "id": "anniversary-uuid",
    "title": "我们在一起一周年",
    "date": "2024-03-16T00:00:00.000Z",
    "type": "first_date",
    "isRecurring": true,
    "enableReminder": true,
    "reminderDays": [7, 3, 1, 0],
    "countdown": {
      "days": 15,
      "nextDate": "2026-03-16T00:00:00.000Z",
      "isToday": false,
      "message": "💕 距离纪念日还有 15 天"
    }
  }
]
```

## 部署说明

### 1. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd frontend
npm install
```

### 2. 数据库迁移

```bash
cd backend
npx prisma migrate dev --name add_anniversary_reminders
npx prisma generate
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env`，并配置正确的数据库连接。

### 4. 启动服务

```bash
# 后端
cd backend
npm run start:dev

# 前端 (H5 开发)
cd frontend
npm run dev:h5
```

## 后续优化

- [ ] 添加纪念日照片上传功能
- [ ] 支持农历日期
- [ ] 添加纪念日成就系统
- [ ] 支持导出纪念日时间线
- [ ] 添加纪念日礼物推荐
- [ ] 支持共享日历订阅

## 注意事项

1. 定时任务需要后端服务持续运行
2. 提醒功能依赖于通知服务（当前为日志记录，可接入实际通知渠道）
3. 日期计算基于服务器时区，请确保时区配置正确
4. 首次使用需要运行数据库迁移

---

💕 Made with love for the Couple Home project
