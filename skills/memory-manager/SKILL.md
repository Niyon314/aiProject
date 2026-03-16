# 🧠 记忆管理 Skill

## 功能说明

为百变怪团队提供记忆存储和检索功能，确保项目信息、进度、决策不会丢失。

## 使用方法

### 1. 每日日志记录
```bash
# 创建/更新当日记忆
echo "# 2026-03-16 - 项目日志" >> memory/2026-03-16.md
```

### 2. 重要事件记录
记录到 `MEMORY.md` 的长期记忆：
- 项目启动/结束
- 关键技术决策
- 用户偏好
- 团队配置变更

### 3. 项目进度追踪
```markdown
## 📌 当前项目

### 项目名称
**状态**: 开发中  
**启动日期**: YYYY-MM-DD  
**GitHub**: URL  
**排期**: X 周

**今日进度**:
- [ ] 任务 1
- [x] 任务 2
```

## 记忆文件结构

```
/root/.openclaw/workspace/
├── MEMORY.md              # 长期记忆（ curated ）
└── memory/
    ├── 2026-03-16.md      # 每日日志
    ├── 2026-03-17.md
    └── ...
```

## Heartbeat 检查清单

每次 heartbeat 时：
1. 读取 `MEMORY.md` 回顾项目状态
2. 检查 `memory/YYYY-MM-DD.md` 更新今日进度
3. 如有重大进展，同步到 `MEMORY.md`

## 自动化建议

### Git 提交时自动记录
```bash
# 在 commit hook 中添加
git commit -m "feat: xxx" && \
echo "- [x] $(date +%H:%M) - xxx" >> memory/$(date +%Y-%m-%d).md
```

### 每日总结
```bash
# 每天 23:00 自动生成总结
cat memory/$(date +%Y-%m-%d).md >> MEMORY.md
```

---

*Created: 2026-03-16 for 情侣小家 project*
