# 🍽️ 吃饭投票模块 - 实现文档

## 概述

吃饭投票模块用于解决情侣每天"吃什么"的难题，通过投票机制让双方共同参与决策。

## 目录结构

```
backend/
├── internal/
│   ├── models/
│   │   └── meal_vote.go          # 数据模型定义
│   ├── repository/
│   │   ├── meal_repository.go    # 数据访问层
│   │   └── meal_repository_test.go
│   ├── service/
│   │   ├── meal_service.go       # 业务逻辑层
│   │   └── meal_service_test.go
│   └── handlers/
│       ├── meal_handler.go       # HTTP 处理器
│       └── meal_handler_test.go  # (可选)
└── cmd/
    └── main.go                   # 已注册路由
```

## 数据模型

### MealVote - 投票记录

```go
type MealVote struct {
    ID        string       // 投票 ID
    Date      string       // 投票日期 (YYYY-MM-DD)
    MealType  string       // lunch/dinner
    Options   []MealOption // 选项列表
    UserVote  *UserVote    // 当前用户投票
    PartnerVote *UserVote  // 伴侣投票
    ResultID  *string      // 匹配结果的选项 ID
    Result    *MealOption  // 匹配结果
    Status    string       // pending/voted/completed
}
```

### MealOption - 投票选项

```go
type MealOption struct {
    ID         string  // 选项 ID
    VoteID     string  // 所属投票 ID
    RecipeID   string  // 菜谱 ID
    Name       string  // 菜谱名称
    Icon       string  // emoji 图标
    CookTime   int     // 烹饪时间 (分钟)
    Difficulty string  // easy/medium/hard
    Cost       float64 // 预估成本
    Tags       string  // JSON array
    LikeCount  int     // 点赞数
    DislikeCount int   // 不喜欢数
    VetoCount  int     // veto 数
}
```

### UserVote - 用户投票

```go
type UserVote struct {
    ID        string    // 投票 ID
    VoteID    string    // 投票记录 ID
    Voter     string    // user/partner
    OptionID  string    // 选择的选项 ID
    VoteType  string    // like/dislike/veto
    Timestamp time.Time // 投票时间
}
```

## API 接口

### 1. 获取今日投票

**Endpoint:** `GET /api/meals/today?mealType=lunch|dinner&date=YYYY-MM-DD`

**请求参数:**
- `mealType` (required): lunch 或 dinner
- `date` (optional): 日期，默认为今天

**响应示例:**
```json
{
  "data": {
    "id": "vote123",
    "date": "2026-03-23",
    "mealType": "lunch",
    "status": "pending",
    "options": [
      {
        "id": "opt1",
        "name": "番茄炒蛋",
        "icon": "🍳",
        "cookTime": 15,
        "difficulty": "easy",
        "cost": 15.0
      }
    ]
  }
}
```

### 2. 创建今日投票

**Endpoint:** `POST /api/meals/today`

**请求体:**
```json
{
  "date": "2026-03-23",
  "mealType": "lunch",
  "optionCount": 3
}
```

**响应示例:**
```json
{
  "data": {
    "id": "vote123",
    "date": "2026-03-23",
    "mealType": "lunch",
    "status": "pending",
    "options": [...]
  },
  "message": "vote created successfully"
}
```

### 3. 提交投票

**Endpoint:** `POST /api/meals/:id/vote`

**请求体:**
```json
{
  "voter": "user",
  "optionId": "opt1",
  "type": "like"
}
```

**投票类型:**
- `like`: 想吃 👍
- `dislike`: 不想吃 👎
- `veto`: 强烈反对 ❌

**响应示例:**
```json
{
  "data": {
    "id": "vote123",
    "status": "voted",
    "userVote": {
      "optionId": "opt1",
      "type": "like"
    }
  },
  "message": "vote submitted successfully"
}
```

### 4. 获取投票结果

**Endpoint:** `GET /api/meals/:id/votes`

**响应示例:**
```json
{
  "data": {
    "id": "vote123",
    "status": "completed",
    "userVote": {
      "optionId": "opt1",
      "type": "like",
      "optionName": "番茄炒蛋"
    },
    "partnerVote": {
      "optionId": "opt1",
      "type": "like",
      "optionName": "番茄炒蛋"
    },
    "result": {
      "id": "opt1",
      "name": "番茄炒蛋",
      "icon": "🍳"
    }
  }
}
```

### 5. 获取历史投票

**Endpoint:** `GET /api/meals/history?limit=10`

**响应示例:**
```json
{
  "data": [
    {
      "id": "vote122",
      "date": "2026-03-22",
      "mealType": "dinner",
      "status": "completed",
      "result": {
        "name": "红烧肉",
        "icon": "🥩"
      }
    }
  ]
}
```

## 匹配算法

### 规则说明

1. **完美匹配**: 双方都 Like 同一选项 → 直接匹配 ✅
2. **不匹配**: 一方 Like，一方 Dislike → 不匹配
3. **Veto 优先**: 任意一方 Veto → 该选项直接淘汰 ❌
4. **备选推荐**: 无共同 Like → 推荐双方都不反对的最高分选项

### 评分标准

- Like: +3 分
- Dislike: -1 分
- Veto: 直接淘汰（不参与评分）

### 匹配流程

```
1. 检查双方是否都已完成投票
2. 检查是否有共同 Like 的选项
   - 是 → 返回该选项作为结果
3. 收集被 Veto 的选项，标记为淘汰
4. 对剩余选项进行评分
   - 用户 Like: +3 分
   - 用户 Dislike: -1 分
   - 伴侣 Like: +3 分
   - 伴侣 Dislike: -1 分
5. 返回最高分选项（分数 > 0）
6. 如果没有合适选项，返回 null
```

## 状态流转

```
pending → voted → completed
   ↓         ↓
   └─────────┘
```

- **pending**: 投票已创建，等待双方投票
- **voted**: 至少一方已投票，等待另一方
- **completed**: 双方都已投票，结果已出

## 使用示例

### 创建投票并投票

```bash
# 1. 创建今日午餐投票
curl -X POST http://localhost:8080/api/meals/today \
  -H "Content-Type: application/json" \
  -d '{"mealType": "lunch", "optionCount": 3}'

# 2. 获取投票详情
curl http://localhost:8080/api/meals/today?mealType=lunch

# 3. 用户投票
curl -X POST http://localhost:8080/api/meals/{voteId}/vote \
  -H "Content-Type: application/json" \
  -d '{"voter": "user", "optionId": "opt1", "type": "like"}'

# 4. 伴侣投票
curl -X POST http://localhost:8080/api/meals/{voteId}/vote \
  -H "Content-Type: application/json" \
  -d '{"voter": "partner", "optionId": "opt1", "type": "like"}'

# 5. 查看结果
curl http://localhost:8080/api/meals/{voteId}/votes
```

## 单元测试

运行测试:

```bash
cd backend
go test -v ./internal/service/meal_service_test.go
go test -v ./internal/repository/meal_repository_test.go
```

### 测试覆盖率

- ✅ 创建投票测试
- ✅ 提交投票测试
- ✅ 匹配算法测试
- ✅ 获取投票测试
- ✅ 状态流转测试
- ✅ 边界条件测试

## 数据库表结构

### meal_votes 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 主键 |
| date | VARCHAR(10) | 日期 (YYYY-MM-DD) |
| meal_type | VARCHAR(10) | 餐食类型 |
| result_id | VARCHAR(36) | 结果选项 ID |
| status | VARCHAR(20) | 状态 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |
| deleted_at | DATETIME | 删除时间 (软删除) |

### meal_options 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 主键 |
| vote_id | VARCHAR(36) | 投票 ID (外键) |
| recipe_id | VARCHAR(36) | 菜谱 ID |
| name | VARCHAR(100) | 菜谱名称 |
| icon | VARCHAR(50) | emoji 图标 |
| cook_time | INT | 烹饪时间 |
| difficulty | VARCHAR(10) | 难度 |
| cost | DECIMAL(10,2) | 成本 |
| tags | TEXT | 标签 (JSON) |
| like_count | INT | 点赞数 |
| dislike_count | INT | 不喜欢数 |
| veto_count | INT | veto 数 |

### user_votes 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | VARCHAR(36) | 主键 |
| vote_id | VARCHAR(36) | 投票 ID (外键) |
| voter | VARCHAR(50) | 投票人 |
| option_id | VARCHAR(36) | 选项 ID |
| type | VARCHAR(10) | 投票类型 |
| timestamp | DATETIME | 投票时间 |

**唯一约束:** `(vote_id, voter)` - 每个投票每个用户只能投一次

## 扩展功能 (TODO)

- [ ] 定时任务自动创建投票 (每天 10:00 和 16:00)
- [ ] 推送通知
- [ ] 用户偏好学习
- [ ] 餐厅推荐集成
- [ ] 投票统计面板
- [ ] 历史数据分析

## 注意事项

1. **日期格式**: 统一使用 `YYYY-MM-DD` 格式
2. **投票人标识**: 使用 `user` 和 `partner` 区分双方
3. **软删除**: 使用 GORM 的 DeletedAt 字段实现软删除
4. **并发投票**: 支持双方同时投票，使用数据库事务保证一致性
5. **选项数量**: 限制在 3-5 个之间

## 故障排除

### 问题：投票创建失败

**原因**: 数据库中菜谱数量不足 3 个

**解决**: 确保 recipes 表中有至少 3 条记录

### 问题：匹配结果为空

**原因**: 
- 双方投票的选项都被 veto
- 没有共同 Like 且所有选项分数 <= 0

**解决**: 这是正常情况，前端应显示"重新投票"选项

### 问题：重复投票

**机制**: 系统允许用户修改投票，后一次投票会覆盖前一次

---

*最后更新：2026-03-23*
