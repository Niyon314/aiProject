# 开发文档 - Couple Home

## 目录

1. [项目架构](#项目架构)
2. [开发环境配置](#开发环境配置)
3. [数据库设计](#数据库设计)
4. [API 接口规范](#api 接口规范)
5. [前端开发指南](#前端开发指南)
6. [后端开发指南](#后端开发指南)
7. [部署指南](#部署指南)

---

## 项目架构

### 整体架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   小程序     │     │    H5 网页   │     │   其他端     │
│   (WeApp)   │     │    (Web)    │     │   (扩展)     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │  API Gateway │
                    │  (NestJS)    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌───▼────┐ ┌────▼────┐
       │ PostgreSQL  │ │ Redis  │ │  文件   │
       │  (主数据库)  │ │ (缓存)  │ │  存储   │
       └─────────────┘ └────────┘ └─────────┘
```

### 技术选型理由

**前端 - Taro**
- 一套代码多端运行（小程序 + H5）
- React 技术栈，学习成本低
- 完善的生态系统和社区支持

**后端 - NestJS**
- 模块化架构，易于维护
- TypeScript 原生支持
- 丰富的装饰器和依赖注入

**ORM - Prisma**
- 类型安全
- 直观的 API
- 自动迁移

---

## 开发环境配置

### 1. 安装依赖

```bash
# 全局工具
npm install -g @tarojs/cli @nestjs/cli prisma

# 后端依赖
cd backend
npm install

# 前端依赖
cd frontend
npm install
```

### 2. 数据库配置

#### PostgreSQL

```bash
# 创建数据库
createdb couple_home

# 或者使用 psql
psql -U postgres
CREATE DATABASE couple_home;
```

#### 环境变量

在 `backend/.env` 中配置：

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/couple_home?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
```

### 3. 初始化数据库

```bash
cd backend

# 生成 Prisma Client
npx prisma generate

# 执行迁移
npx prisma migrate dev --name init

# (可选) 查看数据库
npx prisma studio
```

---

## 数据库设计

### ER 图

```
┌─────────────┐       ┌─────────────┐
│    User     │       │    Couple   │
├─────────────┤       ├─────────────┤
│ id          │◄──────│ user1Id     │
│ email       │       │ user2Id     │
│ username    │       │ name        │
│ password    │       │ anniversary │
│ avatar      │       └──────┬──────┘
│ coupleId    │──────────────┘
└──────┬──────┘
       │
       │ 1:N
       ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│    Task     │  │    Bill     │  │   Moment    │
├─────────────┤  ├─────────────┤  ├─────────────┤
│ id          │  │ id          │  │ id          │
│ title       │  │ title       │  │ images[]    │
│ type        │  │ amount      │  │ location    │
│ coupleId    │  │ coupleId    │  │ userId      │
│ assigneeId  │  │ paidById    │  │ coupleId    │
└─────────────┘  └─────────────┘  └─────────────┘

┌─────────────┐  ┌─────────────┐
│  Calendar   │  │ Anniversary │
├─────────────┤  ├─────────────┤
│ id          │  │ id          │
│ title       │  │ title       │
│ startTime   │  │ date        │
│ endTime     │  │ type        │
│ type        │  │ userId      │
│ userId      │  │ coupleId    │
│ coupleId    │  └─────────────┘
└─────────────┘
```

### 核心表说明

#### users - 用户表
存储用户基本信息和认证信息

#### couples - 情侣关系表
记录情侣关系，关联两个用户

#### tasks - 家务任务表
记录家务任务，支持分配和完成状态追踪

#### bills - 账单表
记录共同消费，支持分摊计算

#### moments - 相册表
存储照片和回忆，支持地理位置

#### calendars - 日程表
共享日程安排，支持重复事件

#### anniversaries - 纪念日表
重要日期提醒

---

## API 接口规范

### RESTful 风格

```
GET    /api/resource          # 获取列表
GET    /api/resource/:id      # 获取单个
POST   /api/resource          # 创建
PATCH  /api/resource/:id      # 更新
DELETE /api/resource/:id      # 删除
```

### 响应格式

**成功响应**
```json
{
  "data": { ... },
  "message": "操作成功"
}
```

**错误响应**
```json
{
  "statusCode": 400,
  "message": "参数错误",
  "error": "Bad Request"
}
```

### 主要接口

#### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

#### 用户
- `GET /api/users/:id` - 获取用户信息
- `PATCH /api/users/:id` - 更新用户信息

#### 情侣
- `POST /api/couples` - 创建情侣关系
- `GET /api/couples/:id` - 获取情侣关系详情

#### 任务
- `GET /api/tasks?coupleId=xxx` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `PATCH /api/tasks/:id` - 更新任务状态

#### 账单
- `GET /api/bills?coupleId=xxx` - 获取账单列表
- `POST /api/bills` - 创建账单
- `GET /api/bills/statistics?coupleId=xxx` - 账单统计

#### 日程
- `GET /api/calendar?coupleId=xxx` - 获取日程列表
- `POST /api/calendar` - 创建日程

#### 相册
- `GET /api/moments?coupleId=xxx` - 获取瞬间列表
- `POST /api/moments` - 发布瞬间
- `PATCH /api/moments/:id/like` - 点赞

#### 纪念日
- `GET /api/anniversaries?userId=xxx` - 获取纪念日列表
- `POST /api/anniversaries` - 创建纪念日

---

## 前端开发指南

### 目录结构

```
frontend/src/
├── pages/              # 页面
│   ├── index/         # 首页
│   ├── login/         # 登录页
│   ├── profile/       # 个人中心
│   └── couple/        # 情侣功能页面
├── components/         # 公共组件
├── utils/             # 工具函数
├── assets/            # 静态资源
└── config/            # 配置文件
```

### 开发规范

1. **组件命名**: 大驼峰，如 `TaskCard.tsx`
2. **页面命名**: 小写，如 `index.tsx`
3. **样式**: 使用 Sass，BEM 命名
4. **状态管理**: 使用 MobX

### 示例：创建新页面

```tsx
// src/pages/example/index.tsx
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function Example() {
  return (
    <View className='example'>
      <Text>示例页面</Text>
    </View>
  )
}
```

```scss
// src/pages/example/index.scss
.example {
  padding: 30px;
  
  text {
    font-size: 32px;
    color: #333;
  }
}
```

### API 请求封装

```typescript
// src/utils/request.ts
import Taro from '@tarojs/taro'

const BASE_URL = 'http://localhost:3000/api'

export function request<T>(options: Taro.request.Option): Promise<T> {
  return Taro.request({
    ...options,
    url: BASE_URL + options.url,
    header: {
      ...options.header,
      'Authorization': `Bearer ${Taro.getStorageSync('token')}`,
    },
  }).then(res => res.data)
}
```

---

## 后端开发指南

### 模块结构

```
src/
├── module/
│   ├── dto/              # 数据传输对象
│   ├── entities/         # 实体（可选，Prisma 已生成）
│   ├── controllers/      # 控制器
│   ├── services/         # 服务层
│   └── module.ts         # 模块定义
```

### 开发规范

1. **命名**: 使用英文，小驼峰/大驼峰
2. **DTO**: 所有输入输出使用 DTO 验证
3. **异常处理**: 使用 NestJS 内置异常类
4. **日志**: 使用 Logger 记录关键操作

### 示例：创建新模块

```bash
nest g module tasks
nest g controller tasks
nest g service tasks
```

### Guard 示例

```typescript
// auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const token = request.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return false
    }
    
    // 验证 token
    return true
  }
}
```

---

## 部署指南

### 后端部署

#### Docker 部署

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
```

```bash
docker build -t couple-home-backend .
docker run -p 3000:3000 --env-file .env couple-home-backend
```

#### PM2 部署

```bash
npm install -g pm2
npm run build
pm2 start dist/main.js --name couple-home-api
```

### 前端部署

#### 小程序

```bash
npm run build:weapp
# 上传 dist 目录到微信开发者工具
```

#### H5

```bash
npm run build:h5
# 部署 dist 目录到静态服务器
```

### 数据库备份

```bash
# 备份
pg_dump couple_home > backup.sql

# 恢复
psql couple_home < backup.sql
```

---

## 常见问题

### Q: 如何重置数据库？
```bash
npx prisma migrate reset
```

### Q: 如何查看生成的 Prisma 类型？
查看 `node_modules/.prisma/client/index.d.ts`

### Q: 小程序开发工具报错？
检查 `project.config.json` 配置，确保 appid 正确

---

**Happy Coding!** 💕
