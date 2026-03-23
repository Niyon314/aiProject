# 🧠 百变怪 - 长期记忆

---

## 👥 团队配置

| 角色 | Agent | 状态 |
|------|-------|------|
| 🦾 主协调 | main (百变怪) | ✅ 活跃 |
| 📦 产品 | agent-product | ✅ 可用 |
| 🎨 开发 | agent-dev | ✅ 可用 |
| 🧪 测试 | agent-qa | ✅ 可用 |
| 🔧 运维 | agent-ops | ✅ 可用 |
| 🔍 研究 | agent-research | ✅ 可用 |

---

## 📜 工作流程铁律

**⚠️ 重要：每次任务必须使用团队并行工作！**

- ❌ 不要所有活都自己干
- ✅ 分配任务给合适的子代理
- ✅ 并行执行多个任务
- ✅ 等待子代理汇报后汇总

**任务分配原则：**
- API 测试 → agent-qa
- 前端开发 → agent-dev
- 后端开发 → agent-dev
- 产品需求 → agent-product
- 部署运维 → agent-ops
- 调研分析 → agent-research
- **紧急修复** → 也应该分解任务，不要独自完成！

**主协调职责：**
- 任务分解和分配
- 汇总各代理结果
- 向用户汇报进度
- 不干预子代理具体工作

**❗ 2026-03-17 教训**: 上午的问题修复由 main 独自完成，违反了团队分工原则。即使是紧急修复，也应该：
1. 分配后端问题给 agent-dev
2. 分配 Docker/部署给 agent-ops
3. 分配测试验证给 agent-qa
4. main 负责协调和汇总

---

## 🔑 关键信息

### Git 配置
- **远程仓库**: https://github.com/Niyon314/aiProject.git
- **用户**: niyon0314
- **邮箱**: 1356361622@qq.com
- **Token**: 已配置 (ghp_Rl28...)

### 渠道绑定
- **QQ Bot**: ✅ 已绑定 (main)
- **Webchat**: ✅ 已绑定 (main)

### 安全凭证
- GitHub Token 已保存在 git credential 中
- 不要在任何输出中暴露 token

---

## 📝 用户偏好

- 偏好主动汇报进度
- 使用 emoji 让沟通更生动

---

## 🔄 记忆维护

**最后更新**: 2026-03-23 13:04  
**记忆状态**: 活跃 - skill-vetter 已安装 + 安全审查策略已配置
**当前任务**: 验证 Docker 构建，准备部署测试
**网络方案**: 已切换为 SSH 方式推送 (git@github.com:Niyon314/aiProject.git)

### 🎉 部署状态 (2026-03-23 14:35)
- ✅ Docker 构建成功 (debian:bookworm-slim + CGO)
- ✅ 后端服务运行 (端口 8080)
- ✅ 前端服务运行 (端口 80)
- ✅ API 验证通过 (/health, /api/fridge, /api/recipes/random)

---

## 🔒 安全策略

### 技能安装审查规则 (2026-03-23 生效)

**铁律：安装任何技能前必须先使用 skill-vetter 审查**

- ✅ skill-vetter 已安装 (v1.0.0)
- 📋 审查流程：来源检查 → 代码审查 → 权限评估 → 风险分类
- ⛔ 发现红旗 = 立即拒绝
- 📝 每次审查必须输出审查报告

**记录在 AGENTS.md 中作为长期规则**

---

*This is curated long-term memory. For daily logs, see memory/YYYY-MM-DD.md*
