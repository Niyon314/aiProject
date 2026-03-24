# 积分系统集成指南

## 📦 快速集成步骤

### 1. 数据库迁移

在 `main.go` 或数据库初始化文件中添加：

```go
import (
  "couple-home/internal/models"
)

// 自动迁移数据库表
db.AutoMigrate(
  &models.PointsRecord{},
  &models.ShopItem{},
  &models.RedeemedCoupon{},
)
```

### 2. 注册路由

在 `main.go` 或路由注册文件中添加：

```go
import (
  "couple-home/internal/handlers"
)

func main() {
  // ... 初始化代码
  
  api := r.Group("/api")
  
  // 注册积分系统路由
  handlers.RegisterPointsRoutes(api, db)
  
  // 其他路由...
}
```

### 3. 初始化默认商品

在数据库初始化后添加：

```go
func initDefaultShopItems(db *gorm.DB) {
  defaultItems := []models.ShopItem{
    *models.NewShopItem("按摩券", "💆", "享受一次全身按摩", 500, 10, "coupon", 30),
    *models.NewShopItem("免洗碗券", "🍽️", "免除一次洗碗任务", 300, 20, "privilege", 30),
    *models.NewShopItem("电影券", "🎬", "一起看场电影", 800, 5, "coupon", 30),
    *models.NewShopItem("睡懒觉券", "🛌", "周末睡到自然醒", 400, 15, "privilege", 30),
    *models.NewShopItem("奶茶券", "🧋", "一杯最爱的奶茶", 200, 30, "gift", 15),
    *models.NewShopItem("做饭券", "👨‍🍳", "对方做饭一次", 350, 20, "privilege", 30),
  }
  
  for _, item := range defaultItems {
    db.FirstOrCreate(&item, models.ShopItem{ID: item.ID})
  }
}
```

### 4. 与其他模块集成

#### 家务模块集成

在 `chores_handler.go` 的完成打卡方法中添加：

```go
// 完成打卡成功后
pointsHandler := handlers.NewPointsHandler(db)
err = pointsHandler.AddPoints(userID, 10, "chore", "完成家务："+chore.Name)
if err != nil {
  log.Printf("添加积分失败：%v", err)
  // 不阻断主流程，继续执行
}
```

#### 投票模块集成

在 `meal_handler.go` 的投票方法中添加：

```go
// 投票成功后
pointsHandler := handlers.NewPointsHandler(db)
err = pointsHandler.AddPoints(userID, 2, "vote", "参与晚餐投票")
if err != nil {
  log.Printf("添加积分失败：%v", err)
}
```

#### 留言模块集成

在 `message_handler.go` 的创建留言方法中添加：

```go
// 创建留言成功后
pointsHandler := handlers.NewPointsHandler(db)
err = pointsHandler.AddPoints(userID, 1, "message", "写留言")
if err != nil {
  log.Printf("添加积分失败：%v", err)
}
```

---

## 🔧 前端集成

### 1. 添加导航入口

在 `TabBar.tsx` 或导航组件中添加积分商城入口：

```tsx
// 方案 1: 替换现有图标
{
  icon: '🏆',
  label: '积分',
  path: '/points',
}

// 方案 2: 在 Profile 页面添加入口
<Link to="/points" className="menu-item">
  <span className="text-2xl">🏆</span>
  <span className="text-gray-700">积分商城</span>
</Link>
```

### 2. 在 Profile 页面显示积分

在 `Profile.tsx` 的统计卡片中添加：

```tsx
<div className="text-center">
  <p className="text-2xl font-bold text-primary-dark">{points}分</p>
  <p className="text-xs text-gray-500">我的积分</p>
</div>
```

---

## 📊 数据库表结构

执行以下 SQL 创建表（如果不用 GORM 自动迁移）：

```sql
-- 积分记录表
CREATE TABLE IF NOT EXISTS points_records (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  amount INT NOT NULL,
  type VARCHAR(10) NOT NULL,
  source VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  balance INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- 商城商品表
CREATE TABLE IF NOT EXISTS shop_items (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  description TEXT,
  points INT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  category VARCHAR(20) NOT NULL,
  validity_days INT NOT NULL DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 已兑换券码表
CREATE TABLE IF NOT EXISTS redeemed_coupons (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  item_id VARCHAR(36) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  points INT NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'unused',
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);
```

---

## 🧪 测试

### API 测试

```bash
# 获取积分汇总
curl http://localhost:8080/api/points/summary \
  -H "Authorization: Bearer YOUR_TOKEN"

# 获取积分明细
curl http://localhost:8080/api/points?page=1\&limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 获取商城商品
curl http://localhost:8080/api/points/shop \
  -H "Authorization: Bearer YOUR_TOKEN"

# 兑换商品
curl -X POST http://localhost:8080/api/points/redeem \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemId":"item-uuid"}'

# 获取已兑换券码
curl http://localhost:8080/api/points/coupons \
  -H "Authorization: Bearer YOUR_TOKEN"

# 使用券码
curl -X POST http://localhost:8080/api/points/coupons/coupon-uuid/use \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 前端测试

访问：`http://localhost:5173/points`

测试项目：
- [ ] 页面加载正常
- [ ] 积分显示正确
- [ ] 商品列表展示
- [ ] 兑换流程完整
- [ ] 券码复制功能
- [ ] 积分明细展示

---

## 🔍 常见问题

### Q1: 积分没有增加？
检查：
1. 认证中间件是否正确传递 userID
2. 数据库连接是否正常
3. 查看服务器日志中的错误信息

### Q2: 兑换失败？
检查：
1. 积分余额是否充足
2. 商品库存是否足够
3. 事务是否正确提交

### Q3: 券码重复？
不会重复，券码使用 UUID 生成，保证唯一性。

### Q4: 如何添加更多商品？
方法 1: 在初始化函数中添加
方法 2: 创建商品管理后台
方法 3: 直接插入数据库

---

## 📈 监控建议

1. **积分发放监控**
   - 每日积分发放总量
   - 各来源积分占比
   - 异常发放告警

2. **兑换监控**
   - 热门商品排行
   - 兑换成功率
   - 库存预警

3. **用户行为分析**
   - 活跃用户排行
   - 积分获取趋势
   - 消费习惯分析

---

## 🎯 下一步

1. **完善功能**
   - [ ] 商品管理后台
   - [ ] 积分活动配置
   - [ ] 数据统计面板

2. **优化体验**
   - [ ] 加载动画优化
   - [ ] 错误提示优化
   - [ ] 性能优化

3. **扩展玩法**
   - [ ] 积分抽奖
   - [ ] 积分竞拍
   - [ ] 好友赠送

---

**集成完成！如有问题请查看日志或联系开发团队** 🚀
