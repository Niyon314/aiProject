# 🦾 百变怪技术团队 - 通信配置

## 渠道绑定状态

| 渠道 | 绑定 Agent | 状态 | 说明 |
|------|-----------|------|------|
| **QQ Bot** | main (百变怪) | ✅ 已绑定 | 用户可以通过 QQ 与主协调员沟通 |
| Webchat | main (百变怪) | ✅ 默认 | Web 聊天界面 |

## 团队内部通信架构

```
                    用户 (QQ/Webchat)
                         │
                         ▼
                  ┌─────────────┐
                  │ 百变怪 (主) │ ← 消息入口/出口
                  └─────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ 子 Agent 会话   │ │ 子 Agent 会话   │ │ 子 Agent 会话   │
│ (sessions_spawn)│ │ (sessions_spawn)│ │ (sessions_spawn)│
└───────────────┘ └───────────────┘ └───────────────┘
```

## 子 Agent 列表

| Agent | 会话标签 | 职责 | 通信方式 |
|-------|---------|------|---------|
| **main** | - | 🦾 主协调员 | QQ Bot / Webchat |
| **agent-product** | product-agent | 📦 产品经理 | 子Agent 会话 |
| **agent-dev** | dev-agent | 🎨☕ 前端 + 后端 | 子Agent 会话 |
| **agent-qa** | qa-agent | 🧪 测试工程师 | 子Agent 会话 |
| **agent-ops** | ops-agent | 🔧 运维工程师 | 子Agent 会话 |
| **agent-research** | research-agent | 🔍 技术研究员 | 子Agent 会话 |

## 消息流转规则

### 入站消息（用户 → 团队）
1. 用户通过 QQ Bot 或 Webchat 发送消息
2. 消息路由到主协调员（百变怪）
3. 百变怪分析并分发给对应子 Agent

### 出站消息（团队 → 用户）
1. 子 Agent 完成任务后返回结果给百变怪
2. 百变怪汇总并发送给用户
3. 通过原渠道（QQ/Webchat）回复

### 内部通信（Agent ↔ Agent）
- 使用 `sessions_spawn` 创建临时会话
- 使用 `sessions_send` 发送消息到已有会话
- 使用 `subagents` 管理活跃的子 Agent

## GitHub Issues 触发

```bash
# Issue 标签 → Agent 映射
product, requirements, prd  → agent-product
frontend, ui, web           → agent-dev (前端)
backend, java, api          → agent-dev (后端)
test, qa, bug               → agent-qa
ops, devops, deploy         → agent-ops
research, spike             → agent-research
```

## 配置检查清单

- [x] QQ Bot 渠道已启用
- [x] QQ Bot 绑定到 main Agent
- [x] 子 Agent 配置文件已创建 (role.md)
- [x] 团队文档已创建 (TEAM.md)
- [ ] GitHub Token 配置（待确认）
- [ ] 飞书集成（可选）

---
*Last Updated: 2026-03-16*
