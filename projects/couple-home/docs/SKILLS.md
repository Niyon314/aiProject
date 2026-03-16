# 🛠️ 情侣小家项目 - Skills 配置

## 已安装 Skills

### 1. 🧠 记忆管理 (memory-manager)
**位置**: `skills/memory-manager/SKILL.md`
**用途**: 项目记忆存储和检索
**使用者**: 全员

### 2. 📦 飞书集成 (feishu-openclaw-plugin)
**位置**: `/root/.openclaw/extensions/feishu-openclaw-plugin/skills/`

| Skill | 用途 | 项目应用场景 |
|-------|------|-------------|
| `feishu-bitable` | 多维表格管理 | 用户数据管理、功能 backlog 追踪 |
| `feishu-calendar` | 日历管理 | 团队排期、里程碑提醒 |
| `feishu-task` | 任务管理 | 开发任务分配和追踪 |
| `feishu-create-doc` | 创建云文档 | PRD、技术方案文档 |
| `feishu-update-doc` | 更新云文档 | 文档迭代维护 |
| `feishu-fetch-doc` | 获取文档内容 | 读取需求文档 |
| `feishu-im-read` | 消息读取 | 团队沟通记录 |

### 3. 🎨 图片生成 (image-generate)
**位置**: `skills/image-generate/SKILL.md`
**用途**: UI 设计稿生成、图标生成
**脚本**: `scripts/image_generate.py`

### 4. 🎬 视频生成 (video-generate)
**位置**: `skills/video-generate/SKILL.md`
**用途**: 宣传视频、功能演示视频
**脚本**: `scripts/video_generate.py`

### 5. 🤖 VeADK 技能集
**位置**: `skills/veadk-skills/` + `skills/veadk-go-skills/`
**用途**: Agent 开发和转换工具

---

## 推荐启用配置

### 前端开发 (agent-dev)
```markdown
必需 Skills:
- image-generate (UI 设计参考)
- memory-manager (记忆开发决策)
```

### 产品经理 (agent-product)
```markdown
必需 Skills:
- feishu-create-doc (PRD 文档)
- feishu-update-doc (文档迭代)
- feishu-bitable (需求池管理)
- memory-manager (记忆产品决策)
```

### 测试工程师 (agent-qa)
```markdown
必需 Skills:
- feishu-task (bug 追踪)
- memory-manager (记忆测试用例)
```

### 运维工程师 (agent-ops)
```markdown
必需 Skills:
- feishu-calendar (发布排期)
- memory-manager (记忆部署配置)
```

---

## 快速使用示例

### 创建 PRD 文档
```
使用 feishu-create-doc:
- 标题：情侣小家 - 产品需求文档
- 内容：Markdown 格式 PRD
- 位置：飞书知识库
```

### 记录开发决策
```markdown
# memory/2026-03-16.md
## 技术决策
- 选择 Taro 而非 uni-app：生态更活跃
- 数据库选 PostgreSQL：JSON 支持更好
```

### 同步任务到飞书
```
使用 feishu-task:
- 创建任务：完成用户系统开发
- 负责人：agent-dev
- 截止日期：2026-03-30
```

---

## 配置检查清单

- [x] memory-manager 已创建
- [x] 飞书插件已安装
- [ ] 飞书应用授权（需用户确认）
- [x] image-generate 可用
- [x] video-generate 可用
- [x] VeADK 技能可用

---

*Last updated: 2026-03-16*
