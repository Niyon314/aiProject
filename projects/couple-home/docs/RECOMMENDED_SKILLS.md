# 🛠️ 情侣小家 - 开发 Skills 推荐

## ✅ 已安装可用

### 核心技能
| Skill | 状态 | 用途 |
|-------|------|------|
| `memory-manager` | ✅ 已创建 | 项目记忆存储和检索 |
| `image-generate` | ✅ 可用 | UI 设计稿、图标生成 |
| `video-generate` | ✅ 可用 | 宣传视频、功能演示 |
| `feishu-*` 套件 | ✅ 已安装 | 飞书文档/任务/日历管理 |
| `veadk-skills` | ✅ 可用 | Agent 开发工具 |

### 飞书技能详情
- `feishu-bitable` - 需求池、Backlog 管理
- `feishu-calendar` - 发布排期、里程碑
- `feishu-task` - 任务分配、bug 追踪
- `feishu-create-doc/update-doc/fetch-doc` - 文档管理
- `feishu-im-read` - 沟通记录

---

## 🔍 推荐安装的开发 Skills

### 1. 📝 代码生成类
```
推荐指数：⭐⭐⭐⭐⭐
用途：快速生成样板代码、API 接口、数据库模型
```

**类似技能**:
- `code-generator` - 根据 PRD 生成代码框架
- `api-scaffold` - RESTful API 脚手架
- `prisma-schema-gen` - 根据需求生成 Prisma Schema

### 2. 🧪 测试类
```
推荐指数：⭐⭐⭐⭐⭐
用途：单元测试、E2E 测试生成
```

**类似技能**:
- `test-generator` - 根据代码生成测试用例
- `jest-helper` - Jest 测试辅助
- `e2e-test-runner` - Playwright/Cypress 测试

### 3. 📦 部署运维类
```
推荐指数：⭐⭐⭐⭐
用途：Docker 配置、CI/CD、云部署
```

**类似技能**:
- `docker-gen` - 生成 Dockerfile 和 docker-compose
- `github-actions` - CI/CD 工作流生成
- `cloud-deploy` - 腾讯云/阿里云部署脚本

### 4. 🎨 UI 设计类
```
推荐指数：⭐⭐⭐⭐
用途：设计稿生成、组件库推荐
```

**类似技能**:
- `ui-component-gen` - 根据描述生成 React 组件
- `tailwind-helper` - Tailwind CSS 类名生成
- `design-system` - 设计系统文档

### 5. 📊 数据库类
```
推荐指数：⭐⭐⭐⭐⭐
用途：数据库设计、迁移脚本
```

**类似技能**:
- `db-designer` - ER 图生成
- `migration-gen` - Prisma 迁移脚本
- `seed-data` - 测试数据生成

### 6. 🔒 安全审计类
```
推荐指数：⭐⭐⭐⭐
用途：代码安全扫描、依赖检查
```

**类似技能**:
- `security-audit` - 依赖漏洞扫描
- `code-review` - 代码质量检查
- `secret-scanner` - 敏感信息检测

---

## 📥 如何安装新 Skills

### 方式 1: OpenClaw Skill Hub
```bash
openclaw skills install <skill-name>
```

### 方式 2: 手动创建
```bash
mkdir -p /root/.openclaw/workspace/skills/<skill-name>
# 创建 SKILL.md 和脚本
```

### 方式 3: 从 ClawHub 下载
访问 https://clawhub.com 搜索技能

---

## 🎯 情侣小家项目推荐配置

### 产品经理 (agent-product)
```yaml
skills:
  - feishu-create-doc      # PRD 文档
  - feishu-bitable         # 需求池
  - memory-manager         # 记忆决策
  - db-designer            # ER 图 (可选)
```

### 前端开发 (agent-dev 前端)
```yaml
skills:
  - image-generate         # UI 参考
  - ui-component-gen       # 组件生成
  - tailwind-helper        # CSS 辅助
  - test-generator         # 单元测试
  - memory-manager         # 记忆技术决策
```

### 后端开发 (agent-dev 后端)
```yaml
skills:
  - api-scaffold          # API 脚手架
  - prisma-schema-gen     # 数据库模型
  - migration-gen         # 迁移脚本
  - security-audit        # 安全审计
  - memory-manager        # 记忆技术决策
```

### 测试工程师 (agent-qa)
```yaml
skills:
  - test-generator        # 测试用例
  - e2e-test-runner       # E2E 测试
  - feishu-task           # bug 追踪
  - memory-manager        # 记忆测试场景
```

### 运维工程师 (agent-ops)
```yaml
skills:
  - docker-gen            # Docker 配置
  - github-actions        # CI/CD
  - cloud-deploy          # 云部署
  - feishu-calendar       # 发布排期
  - memory-manager        # 记忆部署配置
```

---

## 🚀 快速启动建议

### 第一阶段 (MVP - 本周)
优先使用已有 skills:
1. ✅ `memory-manager` - 记录所有决策
2. ✅ `image-generate` - 生成 UI 参考图
3. ✅ `feishu-create-doc` - 创建技术文档

### 第二阶段 (体验增强 - 第 2 周)
考虑安装:
- `api-scaffold` - 加速 API 开发
- `test-generator` - 提高测试覆盖率
- `docker-gen` - 准备部署

### 第三阶段 (持续迭代)
根据需求安装特定 skills

---

## 📋 当前项目记忆状态

**✅ 已激活**:
- `MEMORY.md` - 长期记忆（项目信息、团队配置、凭证）
- `memory/2026-03-16.md` - 今日日志（进度、决策、待办）

**记忆内容**:
- 项目排期（6 周 MVP）
- 技术栈（Taro + NestJS + Prisma）
- 功能清单（P0/P1/P2）
- Git 配置
- 用户偏好

**Heartbeat 检查**: 每次心跳都会回顾记忆，确保不忘记进度！

---

## ❓ 需要联网搜索吗？

**当前状态**: ❌ 无法联网（缺少 Brave API Key）

**如需启用 web_search**:
```bash
openclaw configure --section web
# 输入 Brave Search API Key
```

**替代方案**:
- 使用 `web_fetch` 抓取已知 URL
- 使用 `browser` 工具浏览网页
- 手动搜索后提供信息给我

---

*Last updated: 2026-03-16 17:54*
*Project: 情侣小家 (Couple Home)*
