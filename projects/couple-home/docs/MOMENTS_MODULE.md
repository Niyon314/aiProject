# 📸 照片墙模块开发文档

## 模块概述

照片墙（Moments）是情侣小家应用的核心功能之一，用于记录和展示情侣之间的美好瞬间。

**设计风格**: 少女可爱风 📸💕🌸
- 粉色马卡龙配色
- 圆角设计
- 可爱 emoji 装饰

---

## ✅ 已完成功能

### 1. 共享相册
- ✅ 上传照片（支持最多 9 张）
- ✅ 展示照片列表
- ✅ 图片预览
- ✅ 删除照片

### 2. 时间线
- ✅ 按时间顺序展示
- ✅ 按月分组视图
- ✅ 网格/时间线切换

### 3. 标签分类
- ✅ 按事件标签筛选
- ✅ 按地点标签筛选
- ✅ 标签云展示

### 4. 回忆推送
- ✅ "去年的今天"回忆功能
- ✅ 自动推送历史瞬间

---

## 📁 文件结构

### 后端 (NestJS)

```
backend/
├── src/
│   ├── moments/
│   │   ├── moments.module.ts          # 模块定义
│   │   ├── controllers/
│   │   │   └── moments.controller.ts  # API 控制器
│   │   ├── services/
│   │   │   └── moments.service.ts     # 业务逻辑
│   │   └── dto/
│   │       └── create-moment.dto.ts   # 数据传输对象
│   ├── prisma/
│   │   └── schema.prisma              # 数据库 Schema
│   └── main.ts                        # 应用入口（含文件上传配置）
├── uploads/                           # 上传文件目录
│   └── moments/
└── package.json
```

### 前端 (Taro)

```
frontend/
├── src/
│   ├── pages/
│   │   └── couple/
│   │       └── moments/
│   │           ├── moments.tsx        # 主页面
│   │           └── moments.scss       # 页面样式
│   ├── components/
│   │   ├── MomentCard/
│   │   │   ├── moment-card.tsx        # 照片卡片组件
│   │   │   └── moment-card.scss
│   │   └── MomentUpload/
│   │       ├── moment-upload.tsx      # 上传组件
│   │       └── moment-upload.scss
│   └── utils/
│       └── request.ts                 # 请求工具（含图片上传）
└── package.json
```

---

## 🔌 API 接口

### 基础 URL
```
http://localhost:3000/moments
```

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/moments` | 创建瞬间（使用已有 URLs） |
| POST | `/moments/upload` | 上传照片并创建瞬间 |
| GET | `/moments` | 获取瞬间列表（支持分页、标签筛选） |
| GET | `/moments/timeline` | 获取时间线（按月分组） |
| GET | `/moments/tags` | 获取所有标签 |
| GET | `/moments/tag/:tag` | 按标签筛选 |
| GET | `/moments/memories` | 获取"去年的今天"回忆 |
| GET | `/moments/couple/:coupleId` | 按情侣获取瞬间 |
| GET | `/moments/user/:userId` | 按用户获取瞬间 |
| GET | `/moments/:id` | 获取单个瞬间详情 |
| PUT | `/moments/:id` | 更新瞬间 |
| DELETE | `/moments/:id` | 删除瞬间 |
| POST | `/moments/:id/like` | 点赞瞬间 |
| POST | `/moments/:id/unlike` | 取消点赞 |

---

## 📊 数据库 Schema

### Moment 表

```prisma
model Moment {
  id          String   @id @default(uuid())
  title       String?
  description String?
  images      String[]      // 图片 URLs
  location    String?       // 位置
  latitude    Float?        // 纬度
  longitude   Float?        // 经度
  tags        String[]      // 标签数组
  userId      String        // 所属用户
  coupleId    String?       // 所属情侣（共享相册）
  likes       Int @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 🎨 UI 设计要点

### 配色方案

```scss
$primary-pink: #FFB6C1;      // 樱花粉
$primary-coral: #FF8FAB;     // 珊瑚粉
$primary-rose: #FB6F92;      // 玫瑰粉
$white: #FFFFFF;
$cream: #FFF5E4;             // 奶油色
```

### 圆角设计

```scss
$border-radius-sm: 8px;
$border-radius-md: 12px;
$border-radius-lg: 20px;
$border-radius-xl: 30px;
$border-radius-round: 50px;
```

### 阴影效果

```scss
$shadow-soft: 0 2px 8px rgba(255, 182, 193, 0.2);
$shadow-card: 0 4px 16px rgba(255, 143, 171, 0.15);
$shadow-float: 0 8px 24px rgba(251, 111, 146, 0.2);
```

### 渐变背景

```scss
$gradient-pink: linear-gradient(135deg, #FFB6C1 0%, #FF8FAB 100%);
```

---

## 🚀 使用指南

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
npx prisma migrate dev --name add_moments_tags
npx prisma generate
```

### 3. 启动服务

```bash
# 后端
cd backend
npm run start:dev

# 前端
cd frontend
npm run dev:h5
```

### 4. 配置环境变量

```bash
# backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/couple_home"
PORT=3000
API_BASE_URL=http://localhost:3000
```

---

## 📝 使用示例

### 上传照片

```typescript
// 选择并上传照片
const chooseAndUploadImages = async () => {
  const res = await Taro.chooseImage({
    count: 9,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
  })

  // 上传到服务器
  const urls = await uploadImages(res.tempFilePaths, 'moments')
  
  // 创建瞬间
  await request({
    url: '/moments',
    method: 'POST',
    data: {
      title: '甜蜜一刻',
      description: '今天去约会啦~',
      images: urls,
      tags: ['约会', '旅行'],
      userId: 'xxx',
      coupleId: 'xxx',
    },
  })
}
```

### 获取时间线

```typescript
// 获取按月分组的时间线
const timeline = await request({
  url: `/moments/timeline?coupleId=${coupleId}`,
})

// 返回格式
[
  {
    year: 2026,
    month: 3,
    moments: [...]
  },
  {
    year: 2026,
    month: 2,
    moments: [...]
  }
]
```

### 获取回忆

```typescript
// 获取"去年的今天"
const memories = await request({
  url: `/moments/memories?userId=${userId}&coupleId=${coupleId}`,
})
```

---

## 🔧 扩展建议

### 短期优化
- [ ] 图片压缩优化
- [ ] 懒加载优化
- [ ] 点赞动画效果
- [ ] 评论功能

### 长期规划
- [ ] 云存储集成（阿里云 OSS / 七牛云）
- [ ] 照片编辑功能
- [ ] 相册合集/专辑
- [ ] 智能标签识别
- [ ] 照片打印服务

---

## 🎯 测试清单

- [x] 照片上传功能
- [x] 照片展示（网格/时间线）
- [x] 标签筛选
- [x] 点赞功能
- [x] 删除功能
- [x] 回忆推送
- [x] 响应式设计
- [x] 少女可爱风 UI

---

**开发完成时间**: 2026-03-16  
**开发者**: agent-dev (百变怪团队)  
**版本**: v1.0.0 💕
