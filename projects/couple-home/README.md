# 💕 情侣小家 - Couple Home

> 微信小程序 + 网页端 | 情侣同居生活管理工具

记录我们的甜蜜日常，让爱更有仪式感 ✨

## 🌟 功能特性

- **📱 多端支持**: 微信小程序 + H5 网页端
- **👫 情侣空间**: 专属两人的私密空间
- **📅 日程管理**: 共享日程，不错过每个重要时刻
- **🧹 家务分配**: 公平分配家务，让生活更和谐
- **💰 账单管理**: 共同账单记录与统计
- **📸 甜蜜相册**: 记录每一个美好瞬间
- **💝 纪念日**: 重要日子提醒，让爱更有仪式感

## 🛠 技术栈

### 前端
- **框架**: Taro 4.x + React 18
- **语言**: TypeScript
- **状态管理**: MobX
- **样式**: Sass
- **目标平台**: 微信小程序、H5

### 后端
- **框架**: NestJS 10.x
- **语言**: TypeScript
- **ORM**: Prisma
- **数据库**: PostgreSQL
- **缓存**: Redis
- **认证**: JWT

## 📁 项目结构

```
couple-home/
├── frontend/                 # 前端项目 (Taro)
│   ├── src/
│   │   ├── pages/           # 页面
│   │   ├── components/      # 组件
│   │   ├── utils/           # 工具函数
│   │   ├── assets/          # 静态资源
│   │   └── config/          # 配置文件
│   ├── config/              # Taro 配置
│   └── package.json
│
├── backend/                  # 后端项目 (NestJS)
│   ├── src/
│   │   ├── auth/            # 认证模块
│   │   ├── users/           # 用户模块
│   │   ├── couples/         # 情侣关系模块
│   │   ├── tasks/           # 家务任务模块
│   │   ├── bills/           # 账单模块
│   │   ├── moments/         # 相册模块
│   │   ├── calendar/        # 日程模块
│   │   ├── anniversaries/   # 纪念日模块
│   │   └── common/          # 公共模块
│   ├── prisma/
│   │   └── schema.prisma    # 数据库模型
│   └── package.json
│
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6
- npm >= 9

### 后端启动

```bash
cd backend

# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env

# 修改 .env 中的数据库配置

# 生成 Prisma 客户端
npm run prisma:generate

# 数据库迁移
npm run prisma:migrate

# 启动开发服务器
npm run start:dev
```

后端服务将运行在 `http://localhost:3000`
API 文档：`http://localhost:3000/api/docs`

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 微信小程序开发
npm run dev:weapp

# H5 开发
npm run dev:h5
```

## 📊 数据库设计

### 核心数据表

| 表名 | 说明 |
|------|------|
| users | 用户表 |
| couples | 情侣关系表 |
| tasks | 家务任务表 |
| task_assignments | 任务分配记录 |
| bills | 账单表 |
| bill_shares | 账单分摊记录 |
| moments | 相册/瞬间表 |
| calendars | 日程表 |
| anniversaries | 纪念日表 |

详细表结构请查看 `backend/prisma/schema.prisma`

## 🔐 API 认证

使用 JWT 进行身份认证，在请求头中携带：

```
Authorization: Bearer <token>
```

### 认证流程

1. 用户注册/登录获取 token
2. 后续请求在 Header 中携带 token
3. 后端验证 token 有效性

## 📱 页面说明

### 前端页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | /pages/index/index | 功能入口概览 |
| 登录 | /pages/login/login | 用户登录/注册 |
| 我的 | /pages/profile/profile | 个人信息 |
| 家务 | /pages/couple/tasks/tasks | 家务任务管理 |
| 账单 | /pages/couple/bills/bills | 账单记录 |
| 日程 | /pages/couple/calendar/calendar | 日程安排 |
| 相册 | /pages/couple/moments/moments | 甜蜜瞬间 |

## 🤝 开发规范

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构代码
test: 测试相关
chore: 构建/工具链相关
```

### 代码风格

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

## 📝 License

MIT © 百变怪团队

## 💖 致谢

感谢每一位为这个项目付出的小伙伴！

---

**让爱更有仪式感** 💕
