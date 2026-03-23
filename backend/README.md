# Couple Home Backend

情侣小家项目的后端服务，使用 Go + Gin 框架开发。

## 功能特性

- 🧊 **冰箱管理**: 食材库存跟踪、临期提醒
- 🍳 **菜谱推荐**: 基于库存的智能推荐算法
- 💰 **账单管理**: 日常消费记录、贡献统计
- 🎯 **共同基金**: 家庭目标基金管理

## 技术栈

- **语言**: Go 1.21+
- **框架**: Gin
- **数据库**: SQLite (默认) / PostgreSQL (可选)
- **ORM**: GORM
- **部署**: Docker

## 快速开始

### 本地开发

```bash
# 进入后端目录
cd backend

# 安装依赖
go mod download

# 运行服务
go run cmd/main.go

# 服务将在 http://localhost:8080 启动
```

### Docker 部署

```bash
# 使用 docker-compose
docker-compose up -d

# 查看日志
docker-compose logs -f backend

# 停止服务
docker-compose down
```

## API 文档

完整的 API 文档见 `api/openapi.yaml`。

### 主要端点

#### 冰箱管理
```
GET    /api/fridge           # 获取库存列表
POST   /api/fridge           # 添加食材
PUT    /api/fridge/:id       # 更新食材
DELETE /api/fridge/:id       # 删除食材
GET    /api/fridge/expiring  # 获取临期食材
```

#### 菜谱推荐
```
GET    /api/recipes          # 获取菜谱列表
GET    /api/recipes/random   # 随机推荐
GET    /api/recipes/:id      # 获取详情
POST   /api/recipes/:id/vote # 投票
POST   /api/recipes/recommend # 智能推荐
```

#### 账单管理
```
GET    /api/bills            # 获取账单列表
POST   /api/bills            # 创建账单
GET    /api/bills/stats      # 统计数据
GET    /api/bills/range      # 日期范围查询
```

#### 共同基金
```
GET    /api/bills/fund                    # 获取基金列表
POST   /api/bills/fund                    # 创建基金
POST   /api/bills/fund/contribute         # 存入基金
GET    /api/bills/fund/:id/contributions  # 存入记录
```

## 项目结构

```
backend/
├── cmd/
│   └── main.go              # 应用入口
├── internal/
│   ├── handlers/            # HTTP 处理器
│   ├── models/              # 数据模型
│   ├── service/             # 业务逻辑
│   └── repository/          # 数据访问层
├── pkg/
│   └── utils/               # 工具函数
├── api/                     # API 文档
├── config/                  # 配置文件
├── docker/                  # Docker 配置
├── go.mod
├── go.sum
└── docker-compose.yml
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SERVER_PORT` | 服务端口 | `8080` |
| `GIN_MODE` | Gin 模式 (debug/release) | `debug` |
| `DB_DRIVER` | 数据库驱动 (sqlite/postgres) | `sqlite` |
| `DB_DSN` | SQLite 数据库路径 | `couple_home.db` |
| `DB_HOST` | PostgreSQL 主机 | `localhost` |
| `DB_PORT` | PostgreSQL 端口 | `5432` |
| `DB_USER` | PostgreSQL 用户 | `postgres` |
| `DB_PASSWORD` | PostgreSQL 密码 | - |
| `DB_NAME` | PostgreSQL 数据库名 | `couple_home` |

## 数据模型

### FridgeItem (冰箱食材)
- `id`: 唯一标识
- `name`: 食材名称
- `icon`: 图标 emoji
- `quantity`: 数量
- `unit`: 单位
- `expiryDate`: 过期日期
- `category`: 分类 (vegetable/meat/seafood/egg/staple/condiment)

### Recipe (菜谱)
- `id`: 唯一标识
- `name`: 菜谱名称
- `ingredients`: 食材列表
- `cookTime`: 烹饪时间 (分钟)
- `difficulty`: 难度 (easy/medium/hard)
- `cost`: 预估成本
- `tags`: 标签
- `avgRating`: 平均评分

### Bill (账单)
- `id`: 唯一标识
- `title`: 标题
- `amount`: 金额
- `payer`: 支付人 (user/partner)
- `date`: 日期
- `category`: 分类
- `isShared`: 是否共同支出

### CommonFund (共同基金)
- `id`: 唯一标识
- `name`: 基金名称
- `targetAmount`: 目标金额
- `currentAmount`: 当前金额
- `monthlyGoal`: 月度目标

## 推荐算法

菜谱推荐基于以下权重计算:
- **口味匹配度** (40%): 基于用户偏好的标签匹配
- **库存匹配度** (30%): 基于冰箱现有食材
- **时效性** (15%): 基于食材新鲜度
- **多样性** (15%): 避免重复推荐

## 预设数据

首次启动时会自动 seeding:
- 5 道经典中式菜谱 (番茄炒蛋、红烧肉、清蒸鱼、麻婆豆腐、炒饭)
- 1 个共同基金 (家庭旅行基金，目标 10000 元)

## 开发

```bash
# 运行测试
go test ./...

# 代码格式化
go fmt ./...

# 代码检查
go vet ./...

# 构建
go build -o main ./cmd/main.go
```

## License

MIT
