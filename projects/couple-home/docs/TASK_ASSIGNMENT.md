# 📋 任务分配清单 - P1 功能开发

> **创建日期**: 2026-03-23  
> **迭代**: Sprint 1 - P1 核心功能  

---

## 🎯 任务概览

| ID | 任务 | 优先级 | 负责人 | 状态 | 截止日期 |
|----|------|--------|--------|------|----------|
| T001 | 吃饭投票后端开发 | P0 | agent-dev | 📋 待开始 | 2026-03-24 |
| T002 | 吃饭投票前端开发 | P0 | agent-dev | 📋 待开始 | 2026-03-24 |
| T003 | 家务分工后端开发 | P0 | agent-dev | 📋 待开始 | 2026-03-25 |
| T004 | 家务分工前端开发 | P0 | agent-dev | 📋 待开始 | 2026-03-25 |
| T005 | 前后端联调测试 | P1 | agent-qa | 📋 待开始 | 2026-03-26 |
| T006 | 冰箱弹窗修复验证 | P1 | agent-qa | ✅ 已完成 | 2026-03-23 |

---

## 📝 任务详情

### T001: 吃饭投票后端开发

**负责人**: agent-dev  
**优先级**: P0  
**预估工时**: 1 天  

#### 工作内容
1. 创建数据模型 (`MealVote`, `UserVote`)
2. 实现 API 接口:
   - `GET /api/meals/today` - 获取今日投票
   - `POST /api/meals/today` - 创建投票
   - `POST /api/meals/:id/vote` - 提交投票
   - `GET /api/meals/:id/votes` - 获取投票结果
3. 实现匹配算法
4. 配置定时任务（10:00/16:00）
5. 编写单元测试

#### 交付物
- [ ] `internal/models/meal_vote.go`
- [ ] `internal/handlers/meal_handler.go`
- [ ] `internal/service/meal_service.go`
- [ ] `internal/repository/meal_repository.go`
- [ ] 单元测试覆盖 > 80%

#### 参考文档
- `/projects/couple-home/docs/MEAL_VOTE_PRD.md`

---

### T002: 吃饭投票前端开发

**负责人**: agent-dev  
**优先级**: P0  
**预估工时**: 1 天  

#### 工作内容
1. 创建投票页面 (`/meal-vote`)
2. 开发投票组件:
   - `MealVoteCard` - 投票卡片
   - `MealOption` - 选项组件
   - `MealResult` - 结果展示
3. 集成 API 客户端
4. 添加状态管理 (Zustand)
5. 实现动画效果

#### 交付物
- [ ] `src/pages/MealVote.tsx`
- [ ] `src/components/MealVoteCard.tsx`
- [ ] `src/components/MealOption.tsx`
- [ ] `src/components/MealResult.tsx`
- [ ] `src/api/mealApi.ts`
- [ ] `src/store/mealStore.ts`

#### 参考文档
- `/projects/couple-home/docs/MEAL_VOTE_PRD.md`
- `/projects/couple-home/UI_DESIGN.md`

---

### T003: 家务分工后端开发

**负责人**: agent-dev  
**优先级**: P0  
**预估工时**: 1 天  

#### 工作内容
1. 创建数据模型 (`Chore`, `ChoreTemplate`, `UserStats`)
2. 实现 API 接口:
   - `GET /api/chores` - 获取任务列表
   - `POST /api/chores` - 创建任务
   - `POST /api/chores/:id/claim` - 认领任务
   - `POST /api/chores/:id/complete` - 完成打卡
   - `GET /api/chores/stats` - 统计数据
   - `GET /api/chores/leaderboard` - 排行榜
3. 实现积分系统
4. 配置定时任务（周日 20:00 生成周任务）
5. 编写单元测试

#### 交付物
- [ ] `internal/models/chore.go`
- [ ] `internal/handlers/chore_handler.go`
- [ ] `internal/service/chore_service.go`
- [ ] `internal/repository/chore_repository.go`
- [ ] 单元测试覆盖 > 80%

#### 参考文档
- `/projects/couple-home/docs/CHORES_PRD.md`

---

### T004: 家务分工前端开发

**负责人**: agent-dev  
**优先级**: P0  
**预估工时**: 1 天  

#### 工作内容
1. 创建家务页面 (`/chores`)
2. 开发组件:
   - `ChoreList` - 任务列表
   - `ChoreCard` - 任务卡片
   - `ChoreClaim` - 认领组件
   - `ChoreComplete` - 打卡组件
   - `Leaderboard` - 排行榜
3. 集成 API 客户端
4. 添加状态管理
5. 实现积分动画效果

#### 交付物
- [ ] `src/pages/Chores.tsx`
- [ ] `src/components/ChoreList.tsx`
- [ ] `src/components/ChoreCard.tsx`
- [ ] `src/components/ChoreClaim.tsx`
- [ ] `src/components/ChoreComplete.tsx`
- [ ] `src/components/Leaderboard.tsx`
- [ ] `src/api/choreApi.ts`
- [ ] `src/store/choreStore.ts`

#### 参考文档
- `/projects/couple-home/docs/CHORES_PRD.md`
- `/projects/couple-home/UI_DESIGN.md`

---

### T005: 前后端联调测试

**负责人**: agent-qa  
**优先级**: P1  
**预估工时**: 1 天  

#### 工作内容
1. 编写测试用例
2. 执行功能测试
3. 执行性能测试
4. 执行兼容性测试
5. 提交 Bug 报告

#### 测试清单
- [ ] 吃饭投票功能测试
- [ ] 家务分工功能测试
- [ ] API 接口测试
- [ ] 页面加载性能测试
- [ ] 移动端兼容性测试

#### 交付物
- [ ] 测试报告
- [ ] Bug 清单
- [ ] 性能测试结果

---

### T006: 冰箱弹窗修复验证 ✅

**负责人**: agent-qa  
**优先级**: P1  
**状态**: ✅ 已完成  

#### 修复内容
- 提高 z-index 从 50 到 100
- 添加 `justify-center` 居中
- 增加 `rounded-t-2xl` 和 `shadow-2xl` 提升视觉效果
- 添加 `max-w-md` 限制最大宽度

#### 验证结果
- [x] Modal 正常显示
- [x] 关闭按钮正常
- [x] 表单提交正常
- [x] 动画流畅

---

## 📅 开发日程

### Day 1 (2026-03-24)
- 上午：T001 吃饭投票后端
- 下午：T002 吃饭投票前端
- 晚上：自测 + 修复

### Day 2 (2026-03-25)
- 上午：T003 家务分工后端
- 下午：T004 家务分工前端
- 晚上：自测 + 修复

### Day 3 (2026-03-26)
- 上午：T005 联调测试
- 下午：Bug 修复
- 晚上：验收 + 部署

---

## 🔗 相关文档

- 产品需求：`/projects/couple-home/docs/MEAL_VOTE_PRD.md`
- 产品需求：`/projects/couple-home/docs/CHORES_PRD.md`
- UI 设计：`/projects/couple-home/UI_DESIGN.md`
- API 文档：`/backend/api/openapi.yaml`

---

*Created by 百变怪主协调员* 🦾  
*2026-03-23*
