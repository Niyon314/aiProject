# 🍽️ 吃饭安排模块 - 开发文档

## 模块概述

吃饭安排模块是情侣小家应用的 P0 核心功能，用于帮助情侣解决"今天吃什么"的难题，并提供完整的饮食管理功能。

## 功能清单

### 1. 今日吃什么 🎲
- ✅ 随机推荐餐食
- ✅ 手动选择餐食
- ✅ 决策助手："帮我选"按钮
- ✅ 否决权机制：每天 1 次否决机会
- ✅ 轮值决策：今天你选/明天我选

### 2. 点餐投票 🗳️
- ✅ 双方对备选餐厅/菜品投票
- ✅ 投票类型：喜欢👍、不喜欢👎、否决❌
- ✅ 自动匹配双方都喜欢的餐食
- ✅ 投票轮次管理

### 3. 做饭排班 📅
- ✅ 记录谁负责做饭
- ✅ 按早餐/午餐/晚餐排班
- ✅ 今日排班查看
- ✅ 完成状态标记
- ✅ 评价系统

### 4. 外卖历史 🥡
- ✅ 记录常点的外卖和餐厅
- ✅ 餐食类型分类（餐厅/家常菜/外卖）
- ✅ 最后用餐时间记录
- ✅ 被选择次数统计

### 5. 食谱收藏 📖
- ✅ 收藏喜欢的家常菜食谱
- ✅ 食材清单
- ✅ 烹饪步骤
- ✅ 难度/时间/份量
- ✅ 营养信息（可选）
- ✅ 做过次数统计

### 6. 食材清单 🛒
- ✅ 共享购物清单
- ✅ 分类管理（蔬菜/肉类/水果等）
- ✅ 优先级标记
- ✅ 购买状态跟踪
- ✅ 关联食谱

---

## 技术实现

### 后端 (NestJS + Prisma)

#### 数据库表设计

**Meal (餐食表)**
- id, name, type, category, description
- imageUrl, price, location, rating
- tags (数组), isFavorite, viewCount
- lastEatenAt, coupleId
- 关系：votes[], recipe

**Vote (投票表)**
- id, mealId, userId, voteType
- comment, roundId, isWinner
- vetoUsed, vetoDate
- 关系：meal, user

**Recipe (食谱表)**
- id, name, description
- ingredients[] (数组), steps[] (数组)
- difficulty, cookTime, servings
- calories, protein, carbs, fat
- imageUrl, images[], source, sourceType
- tags[], isFavorite, viewCount, cookCount
- userId, coupleId, mealId
- lastCookedAt
- 关系：user, couple, meal, shoppingListItems[], cookingSchedules[]

**ShoppingList (购物清单表)**
- id, name, category, quantity, price
- priority, isChecked, checkedAt, checkedBy
- note, recipeId, coupleId, createdBy
- 关系：recipe, creator, couple

**CookingSchedule (做饭排班表)**
- id, date, cookId, mealType, mealName
- recipeId, isCompleted, completedAt
- rating, comment, coupleId
- 关系：cook, recipe, couple

**EatingStats (饮食统计表)**
- id, date, coupleId
- totalMeals, homemadeCount, takeoutCount, restaurantCount
- totalSpent, avgPerMeal, favoriteCategory
- user1CookCount, user2CookCount

#### API 接口

**餐食管理**
- `GET /api/eating/random` - 随机推荐
- `GET /api/eating/meals` - 获取所有餐食
- `GET /api/eating/meals/:id` - 获取单个餐食
- `POST /api/eating/meals` - 创建餐食
- `PUT /api/eating/meals/:id` - 更新餐食
- `DELETE /api/eating/meals/:id` - 删除餐食
- `POST /api/eating/meals/:id/eaten` - 标记为已吃

**投票管理**
- `POST /api/eating/votes` - 创建投票
- `GET /api/eating/votes/:roundId/results` - 获取投票结果

**食谱管理**
- `GET /api/eating/recipes` - 获取所有食谱
- `GET /api/eating/recipes/:id` - 获取单个食谱
- `POST /api/eating/recipes` - 创建食谱
- `PUT /api/eating/recipes/:id` - 更新食谱
- `DELETE /api/eating/recipes/:id` - 删除食谱
- `POST /api/eating/recipes/:id/cooked` - 标记为做过

**购物清单**
- `GET /api/eating/shopping-list` - 获取购物清单
- `POST /api/eating/shopping-list` - 创建购物项
- `PUT /api/eating/shopping-list/:id` - 更新购物项
- `DELETE /api/eating/shopping-list/:id` - 删除购物项
- `POST /api/eating/shopping-list/clear-checked` - 清空已购买

**做饭排班**
- `GET /api/eating/schedule` - 获取排班
- `GET /api/eating/schedule/today` - 获取今日排班
- `POST /api/eating/schedule` - 创建排班
- `PUT /api/eating/schedule/:id` - 更新排班
- `DELETE /api/eating/schedule/:id` - 删除排班

**统计**
- `GET /api/eating/stats` - 获取饮食统计

### 前端 (Taro + React)

#### 页面结构

```
pages/couple/eating/
├── eating.tsx          # 主页面（Tab 式导航）
├── eating.scss         # 样式文件
├── add-meal.tsx        # 添加餐食页面
├── add-meal.scss
├── add-recipe.tsx      # 添加食谱页面
└── add-recipe.scss
```

#### 设计风格

**少女可爱风 🌸**
- 粉色马卡龙配色：`#FF6B81`, `#FFA502`, `#FFE6EA`
- 圆角设计：`border-radius: 20rpx - 50rpx`
- 渐变背景：`linear-gradient(135deg, #ffe6ea, #fff5f7)`
- 可爱 emoji：🍽️🍕🍜🥗🎲🗳️📖🛒

#### 组件亮点

1. **随机推荐组件**
   - 骰子动画效果
   - 一键"帮我选"
   - 快速投票操作

2. **投票组件**
   - 三态投票（喜欢/不喜欢/否决）
   - 否决权限制提示
   - 实时结果展示

3. **食谱卡片**
   - 图片展示
   - 难度/时间/份量信息
   - 做过次数统计

4. **购物清单**
   - 复选框交互
   - 优先级标记
   - 分类展示

---

## UX 优化亮点

### 1. 决策助手 🎯
- **"帮我选"按钮**：一键随机推荐，解决选择困难症
- **否决权机制**：每天 1 次否决机会，避免完全不喜欢的餐食
- **轮值决策**：支持"今天你选/明天我选"模式

### 2. 投票系统 🗳️
- **双向匹配**：自动找出双方都喜欢的餐食
- **投票轮次**：支持多轮投票直到达成一致
- **实时反馈**：投票后立即显示结果

### 3. 食谱管理 📖
- **快速收藏**：从餐食一键转为食谱
- **做过标记**：记录烹饪次数和最后烹饪时间
- **食材关联**：食谱可直接生成购物清单

### 4. 购物清单 🛒
- **智能分类**：自动按类别分组
- **优先级**：支持紧急/高/普通/低优先级
- **快速勾选**：点击即标记已购买

---

## 文件清单

### 后端
```
backend/
├── prisma/
│   └── schema.prisma          # 数据库模型（已添加 eating 相关表）
├── src/
│   ├── eating/
│   │   ├── controllers/
│   │   │   └── eating.controller.ts
│   │   ├── services/
│   │   │   └── eating.service.ts
│   │   ├── dto/
│   │   │   └── eating.dto.ts
│   │   └── modules/
│   │       └── eating.module.ts
│   └── app.module.ts          # 已注册 EatingModule
```

### 前端
```
frontend/
├── src/
│   ├── pages/
│   │   └── couple/
│   │       └── eating/
│   │           ├── eating.tsx
│   │           ├── eating.scss
│   │           ├── add-meal.tsx
│   │           ├── add-meal.scss
│   │           ├── add-recipe.tsx
│   │           └── add-recipe.scss
│   └── app.config.ts          # 已添加路由
```

---

## 部署步骤

### 1. 数据库迁移

```bash
cd backend
npx prisma migrate dev --name add_eating_module
npx prisma generate
```

### 2. 后端启动

```bash
cd backend
npm run start:dev
```

### 3. 前端编译

```bash
cd frontend
npm run build:weapp  # 微信小程序
# 或
npm run dev:weapp    # 开发模式
```

---

## 后续优化建议

### P1 优先级
- [ ] 餐食图片上传功能
- [ ] 食谱详情页面
- [ ] 饮食统计图表
- [ ] 外卖平台 API 集成

### P2 优先级
- [ ] 智能推荐算法（基于历史偏好）
- [ ] 营养分析报表
- [ ] 预算控制功能
- [ ] 附近餐厅推荐

### P3 优先级
- [ ] AI 菜谱生成
- [ ] 视频食谱
- [ ] 食材过期提醒
- [ ] 与健康应用集成

---

## 注意事项

1. **数据库配置**：确保 PostgreSQL 正常运行，DATABASE_URL 配置正确
2. **权限控制**：所有接口已通过 AuthGuard 保护，仅情侣双方可访问
3. **数据隔离**：所有查询均基于 coupleId，确保数据隐私
4. **否决权限制**：每天凌晨重置否决权次数

---

## 开发者备注

本模块采用少女可爱风设计，配色以粉色马卡龙色系为主，大量使用圆角和渐变效果，配合可爱 emoji 增强视觉体验。

核心设计理念：
- **简单**：一键解决"今天吃什么"
- **有趣**：投票/随机/否决等游戏化机制
- **实用**：食谱/购物清单/排班等实用功能
- **温馨**：整体风格温馨可爱，符合情侣应用场景

---

**开发完成时间**: 2026-03-16
**开发者**: 百变怪团队全栈开发 (agent-dev)
**状态**: ✅ 代码完成，待数据库迁移
