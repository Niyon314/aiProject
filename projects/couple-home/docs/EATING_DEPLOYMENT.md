# 🍽️ 吃饭安排模块 - 部署指南

## 快速开始

### 前置条件

1. Node.js 18+ 已安装
2. PostgreSQL 数据库已运行
3. 情侣小家项目已初始化

### 1. 数据库迁移

确保 PostgreSQL 数据库正在运行，然后执行：

```bash
cd /root/.openclaw/workspace/projects/couple-home/backend

# 方式 1: 使用 Prisma migrate（推荐）
npx prisma migrate dev --name add_eating_module

# 方式 2: 直接执行 SQL（如果 Prisma 不可用）
psql -U postgres -d couple_home -f prisma/migrations/20260316_add_eating_module/migration.sql

# 生成 Prisma 客户端
npx prisma generate
```

### 2. 验证数据库

连接数据库检查表是否创建成功：

```bash
psql -U postgres -d couple_home

# 查看所有表
\dt

# 应该看到：
# meals
# votes
# recipes
# shopping_list
# cooking_schedules
# eating_stats
```

### 3. 启动后端

```bash
cd backend
npm run start:dev

# 验证 API 可用
curl http://localhost:3000/api/eating/meals
```

### 4. 编译前端

```bash
cd frontend
npm run build:weapp

# 或开发模式
npm run dev:weapp
```

---

## 故障排查

### 问题 1: 数据库连接失败

**错误**: `Can't reach database server at localhost:5432`

**解决方案**:

```bash
# 检查 PostgreSQL 是否运行
docker ps | grep postgres

# 如果没有运行，启动容器
docker run -d --name couple_home_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=couple_home \
  -p 5432:5432 \
  postgres:15

# 或者使用系统 PostgreSQL
sudo systemctl start postgresql
```

### 问题 2: Prisma schema 验证失败

**错误**: `Prisma schema validation - (validate wasm)`

**解决方案**:

```bash
# 格式化 schema
npx prisma format

# 重新生成客户端
npx prisma generate
```

### 问题 3: 迁移冲突

**错误**: `Migration already exists`

**解决方案**:

```bash
# 删除迁移目录重新创建
rm -rf prisma/migrations/20260316_add_eating_module

# 重新创建迁移
npx prisma migrate dev --name add_eating_module
```

---

## API 测试

使用以下命令测试 API：

### 获取随机餐食

```bash
curl -X GET "http://localhost:3000/api/eating/random" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 创建餐食

```bash
curl -X POST "http://localhost:3000/api/eating/meals" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "火锅",
    "type": "restaurant",
    "category": "chinese",
    "price": 100,
    "location": "海底捞",
    "tags": ["辣", "聚餐"]
  }'
```

### 创建投票

```bash
curl -X POST "http://localhost:3000/api/eating/votes" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mealId": "meal-uuid-here",
    "voteType": "like"
  }'
```

### 创建食谱

```bash
curl -X POST "http://localhost:3000/api/eating/recipes" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "番茄炒蛋",
    "ingredients": ["番茄 2 个", "鸡蛋 3 个", "盐适量", "糖适量"],
    "steps": ["番茄切块", "鸡蛋打散炒熟", "加入番茄翻炒", "调味出锅"],
    "difficulty": "easy",
    "cookTime": 15,
    "servings": 2,
    "tags": ["家常菜", "快手", "早餐"]
  }'
```

### 创建购物项

```bash
curl -X POST "http://localhost:3000/api/eating/shopping-list" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "西红柿",
    "category": "vegetable",
    "quantity": "500g",
    "priority": "normal"
  }'
```

### 创建排班

```bash
curl -X POST "http://localhost:3000/api/eating/schedule" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-03-17",
    "cookId": "user-uuid-here",
    "mealType": "dinner",
    "mealName": "番茄炒蛋"
  }'
```

---

## 功能验收清单

### 后端
- [x] Prisma Schema 设计完成
- [x] EatingModule 创建
- [x] EatingService 实现
- [x] EatingController 实现
- [x] DTO 验证完成
- [x] 模块注册到 AppModule
- [ ] 数据库迁移执行
- [ ] API 测试通过

### 前端
- [x] eating 主页面
- [x] add-meal 页面
- [x] add-recipe 页面
- [x] 样式文件（少女可爱风）
- [x] 路由配置
- [x] 首页入口添加
- [ ] 真机测试

---

## 性能优化建议

1. **数据库索引**: 已为常用查询字段添加索引
2. **分页**: 大数据量时建议添加分页
3. **缓存**: 热门食谱/餐食可考虑 Redis 缓存
4. **图片**: 建议接入 CDN 或对象存储

---

## 安全注意事项

1. **权限控制**: 所有接口已添加 AuthGuard
2. **数据隔离**: 基于 coupleId 隔离数据
3. **输入验证**: 所有 DTO 已添加 class-validator
4. **SQL 注入**: 使用 Prisma ORM 防止注入

---

## 联系支持

如有问题，请查看：
- 完整文档：`docs/EATING_MODULE.md`
- API 文档：后端启动后访问 Swagger
- 前端组件：`frontend/src/pages/couple/eating/`

---

**最后更新**: 2026-03-16
**版本**: 1.0.0
