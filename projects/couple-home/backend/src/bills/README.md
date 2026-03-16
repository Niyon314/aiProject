# 💰 账单 AA 模块

情侣小家应用的账单管理模块，支持共同支出记录、AA 计算、分类统计和月度结算。

## ✨ 功能特性

### 核心功能
- **📝 账单记录** - 添加/编辑共同支出
- **🧮 AA 计算** - 自动计算每人应付金额
- **📅 结算提醒** - 月度结算提醒
- **📊 分类统计** - 按类别统计支出
- **💕 情感化设计** - "爱的账户"概念，透明但不计较

### 分摊模式
- **💕 平均 AA** - 每人一半
- **📊 按比例** - 自定义比例（如 60%/40%）
- **✏️ 自定义** - 手动输入每人金额
- **🎁 这次我请** - 一方全额支付（爱的礼物）

## 🗄️ 数据库设计

### Bill 表
```prisma
model Bill {
  id            String   @id @default(uuid())
  title         String   // 账单标题
  amount        Float    // 总金额
  category      String   // 分类
  description   String?  // 详细描述
  paidBy        String   // user1, user2, split
  paidById      String
  paidByUser    User     @relation(...)
  splitMode     String   @default("equal") // equal, ratio, custom, gift
  splitRatio    Float?   // 用户 1 比例 (0-1)
  emotionalNote String?  // 情感化备注
  coupleId      String
  couple        Couple   @relation(...)
  shares        BillShare[]
  billDate      DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### BillShare 表
```prisma
model BillShare {
  id        String   @id @default(uuid())
  billId    String
  bill      Bill     @relation(..., onDelete: Cascade)
  userId    String
  user      User     @relation(...)
  amount    Float    // 分摊金额
  isPaid    Boolean  @default(false)
  paidAt    DateTime?
  createdAt DateTime @default(now())
}
```

## 📡 API 接口

### 账单 CRUD

#### 创建账单
```http
POST /bills
Content-Type: application/json

{
  "title": "一起喝的奶茶",
  "amount": 58.0,
  "category": "food",
  "description": "下午茶",
  "emotionalNote": "因为你今天加班辛苦了",
  "paidBy": "user1",
  "paidById": "user-uuid",
  "coupleId": "couple-uuid",
  "splitMode": "equal",
  "billDate": "2024-01-15T10:00:00Z"
}
```

#### 获取账单列表
```http
GET /bills?coupleId=xxx&month=2024-01&category=food
```

#### 获取账单详情
```http
GET /bills/:id
```

#### 更新账单
```http
PUT /bills/:id
Content-Type: application/json

{
  "title": "更新的标题",
  "amount": 100.0,
  "emotionalNote": "新的备注"
}
```

#### 删除账单
```http
DELETE /bills/:id
```

### 统计接口

#### 获取统计概览
```http
GET /bills/statistics/overview?coupleId=xxx&month=2024-01
```

响应：
```json
{
  "totalAmount": 3000.0,
  "count": 25,
  "byCategory": [
    { "category": "food", "categoryName": "🍔 餐饮", "amount": 1200.0 },
    { "category": "housing", "categoryName": "🏠 居住", "amount": 1000.0 }
  ],
  "byPayer": {
    "user1-id": 1800.0,
    "user2-id": 1200.0
  },
  "user1Total": 1500.0,
  "user2Total": 1500.0,
  "user1Name": "小明",
  "user2Name": "小红"
}
```

#### 获取分类统计
```http
GET /bills/statistics/categories?coupleId=xxx&month=2024-01
```

#### 获取月度结算
```http
GET /bills/settlement/monthly?coupleId=xxx&year=2024&month=1
```

响应：
```json
{
  "year": 2024,
  "month": 1,
  "totalAmount": 3000.0,
  "billCount": 25,
  "user1": {
    "id": "uuid",
    "name": "小明",
    "totalPaid": 1800.0
  },
  "user2": {
    "id": "uuid",
    "name": "小红",
    "totalPaid": 1200.0
  },
  "settlement": {
    "difference": 300.0,
    "payer": { "id": "uuid", "name": "小红" },
    "receiver": { "id": "uuid", "name": "小明" },
    "message": "小红 需要给 小明 ¥300.00"
  },
  "byCategory": [...],
  "summary": "这个一月我们一起花了 3000.00 元建设小家 💕",
  "bills": [...]
}
```

### AA 计算器
```http
GET /bills/aa/calculate?amount=100&mode=equal
GET /bills/aa/calculate?amount=100&mode=ratio&ratio=0.6
```

## 📅 定时任务

### 月度结算提醒
每月最后一天 20:00 自动发送结算提醒（需启用 `@nestjs/schedule`）。

```typescript
// 在 bills.cron.service.ts 中
@Cron(CronExpression.EVERY_MONTH)
async sendMonthlySettlementReminders() {
  // 发送结算提醒
}
```

## 🎨 前端组件

### 页面
- `pages/couple/bills/bills.tsx` - 账单列表页
- `pages/couple/bills/settlement/settlement.tsx` - 月度结算页

### 组件
- `components/Chart/index.tsx` - 可爱图表组件

### 风格
- 粉色马卡龙配色
- 圆角设计
- 可爱 emoji 装饰
- 情感化文案

## 💕 情感化设计

### 情感备注模板
- "请你喝的奶茶，因为你今天加班辛苦了 💕"
- "今天你做饭，我来买单 🍳"
- "庆祝我们在一起的第 N 天 🎉"
- "这次我请，下次你来 💕"
- "谢谢你一直陪在我身边 💕"

### 月度总结文案
- "这个月我们一起花了 XXX 元建设小家 💕"
- "本月共同支出 XXX 元，一起创造了 N 个美好回忆 🎀"
- "这个月我们的小家基金支出了 XXX 元，爱你们 💕"

## 🚀 使用示例

### 1. 创建账单
```typescript
const bill = await fetch('/bills', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: '周末大餐',
    amount: 500,
    category: 'food',
    emotionalNote: '庆祝周末！',
    paidBy: 'user1',
    paidById: currentUserId,
    coupleId: coupleId,
    splitMode: 'equal',
  }),
})
```

### 2. 获取月度结算
```typescript
const settlement = await fetch(
  `/bills/settlement/monthly?coupleId=${coupleId}&year=2024&month=1`
)
const data = await settlement.json()
console.log(data.summary) // "这个一月我们一起花了..."
```

### 3. 分类统计图表
```typescript
import { Chart, createCategoryChartData } from '@/components/Chart'

const stats = await fetchStats()
const chartData = createCategoryChartData(stats.byCategory)

<Chart 
  type="donut" 
  data={chartData} 
  title="支出分类"
/>
```

## 📝 注意事项

1. **金额精度** - 所有金额计算保留 2 位小数
2. **分摊模式** - 创建后修改分摊模式会重新计算分摊记录
3. **删除级联** - 删除账单会自动删除关联的分摊记录
4. **情感备注** - 可选字段，增强用户体验
5. **结算提醒** - 需要配置通知服务（WebSocket/邮件/短信）

## 🔧 开发待办

- [ ] 集成 WebSocket 实时通知
- [ ] 添加账单图片上传
- [ ] 支持导出 Excel/PDF
- [ ] 添加预算功能
- [ ] 支持多对情侣（群组 AA）

---

**💕 透明但不计较，爱才是最重要的**
