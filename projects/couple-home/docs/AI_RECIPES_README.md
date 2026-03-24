# AI 菜谱推荐功能开发文档

## 📋 功能概述

AI 菜谱推荐功能允许用户根据冰箱中的现有食材，通过 AI 智能推荐合适的菜谱，并生成购物清单。

## 🎯 功能特性

### 前端功能
- ✅ 食材选择界面
- ✅ AI 智能推荐菜谱
- ✅ 菜谱匹配度显示
- ✅ 购物清单生成
- ✅ 菜谱详情查看

### 后端功能
- ✅ 获取冰箱食材 API
- ✅ AI 菜谱推荐 API
- ✅ 购物清单生成 API
- ✅ 菜谱详情查询 API

## 📁 文件结构

```
projects/couple-home/
├── h5-app/
│   ├── src/
│   │   ├── pages/
│   │   │   └── AIRecipes.tsx          # AI 菜谱页面
│   │   ├── api/
│   │   │   └── recipeApi.ts           # API 客户端
│   │   ├── components/
│   │   │   └── Header.tsx             # 更新：添加 actionIcon 支持
│   │   └── App.tsx                    # 更新：添加路由
│   └── ...
├── internal/
│   ├── handlers/
│   │   ├── recipe_ai_handler.go       # AI 菜谱处理器
│   │   └── routes.go                  # 路由注册汇总
│   └── services/
│       └── ai_recipe_service.go       # AI 服务层
└── docs/
    └── P3_UI_DESIGN.md                # UI 设计文档
```

## 🔌 API 接口

### 1. 获取冰箱食材
```
GET /api/fridge
```

**响应:**
```json
{
  "code": 200,
  "data": [
    {
      "id": "1",
      "name": "西红柿",
      "quantity": 3,
      "unit": "个",
      "category": "vegetable",
      "expiryDate": "2026-03-30T00:00:00Z",
      "addedDate": "2026-03-20T00:00:00Z",
      "status": "fresh"
    }
  ]
}
```

### 2. AI 推荐菜谱
```
POST /api/recipes/ai-recommend
Content-Type: application/json

{
  "fridgeItemIds": ["1", "2", "3"],
  "preferences": ["清淡", "少油"],
  "excludeIngredients": ["辣椒"],
  "maxResults": 10
}
```

**响应:**
```json
{
  "code": 200,
  "data": {
    "recipes": [
      {
        "id": "recipe_001",
        "name": "西红柿炒蛋",
        "description": "经典家常菜，酸甜可口",
        "ingredients": [
          {
            "name": "西红柿",
            "quantity": 2,
            "unit": "个",
            "hasInFridge": true
          }
        ],
        "steps": ["步骤 1", "步骤 2"],
        "cookTime": 15,
        "difficulty": "easy",
        "calories": 280,
        "tags": ["家常菜", "快手菜"],
        "matchScore": 85,
        "missingIngredients": ["盐", "糖"]
      }
    ],
    "totalRecipes": 5,
    "recommendationReason": "根据您的 5 种食材，为您精选了 5 道菜谱..."
  }
}
```

### 3. 生成购物清单
```
POST /api/recipes/shopping-list
Content-Type: application/json

{
  "recipeIds": ["recipe_001", "recipe_002"]
}
```

**响应:**
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "name": "大蒜",
        "quantity": 2,
        "unit": "瓣",
        "category": "vegetable",
        "estimatedPrice": 2.5,
        "recipes": ["西红柿炒蛋"]
      }
    ],
    "totalEstimatedPrice": 15.5,
    "totalItems": 3
  }
}
```

### 4. 获取菜谱详情
```
GET /api/recipes/:id
```

**响应:**
```json
{
  "code": 200,
  "data": {
    "recipe": {...},
    "nutritionInfo": {
      "protein": 70,
      "fat": 31,
      "carbs": 70,
      "fiber": 5
    },
    "tips": ["火候控制是关键", "食材新鲜度影响口感"]
  }
}
```

## 🔧 技术实现

### AI 集成
- 使用 Bailian/Qwen API 进行智能推荐
- 支持降级方案（AI 不可用时使用本地推荐）
- 提示词工程优化推荐质量

### 匹配算法
- 基于食材的匹配度计算
- 考虑基础调料（盐、油等）不计入缺失
- 匹配度分级：完美匹配 (≥80%)、推荐尝试 (≥60%)、可以考虑 (≥40%)

### 购物清单
- 自动合并相同食材
- 按分类分组显示
- 价格估算

## 🎨 UI 设计

参考 `docs/P3_UI_DESIGN.md`

### 配色方案
- 主色调：清新绿 (#5DBF7D)
- 背景色：#F0FFF4

### 交互流程
```
选择食材 → AI 分析 → 推荐菜谱 → 显示做法
    ↓         ↓         ↓          ↓
  多选框   加载动画  卡片展示   步骤详情
```

## 🚀 使用方法

### 前端
1. 访问 `/fridge` 页面
2. 点击 "AI 菜谱推荐" 按钮或 Header 上的 🤖 图标
3. 选择要使用的食材
4. 点击 "AI 推荐菜谱" 按钮
5. 查看推荐结果
6. 可生成购物清单或查看菜谱详情

### 后端
1. 配置 AI API 密钥（环境变量）
2. 启动服务
3. 路由自动注册

## ⚙️ 配置

### 环境变量
```bash
# AI API 配置
BAILOAN_API_KEY=your_api_key
BAILOAN_API_BASE=https://dashscope.aliyuncs.com/api/v1
```

### 代码配置
```go
// 在 main.go 或路由注册处
apiKey := os.Getenv("BAILOAN_API_KEY")
apiBase := os.Getenv("BAILOAN_API_BASE")
RegisterRecipeAIRoutes(r, apiKey, apiBase)
```

## 🧪 测试

### 前端测试
```bash
cd h5-app
npm run dev
# 访问 http://localhost:5173/fridge/ai-recipes
```

### 后端测试
```bash
cd ..
go run main.go
# 测试 API: curl http://localhost:8080/api/fridge
```

## 📝 待办事项

- [ ] 完善菜谱详情页
- [ ] 添加收藏菜谱功能
- [ ] 集成电商 API 实现一键购买
- [ ] 添加用户口味偏好学习
- [ ] 优化 AI 推荐算法
- [ ] 添加营养分析
- [ ] 支持视频菜谱

## 🐛 已知问题

- AI API 调用可能超时（已添加降级方案）
- 购物清单价格估算较简单
- 菜谱数据需要完善

## 📚 相关文档

- [产品需求文档](../PRODUCT_REQUIREMENTS.md)
- [UI 设计文档](../UI_DESIGN.md)
- [P3 UI 设计](./P3_UI_DESIGN.md)

---

*Created with ❤️ by 百变怪开发团队*
