#!/bin/bash
# GitHub Issue 自动分发脚本
# 根据 Issue 标签分配给对应的 Agent

REPO="niyon/aiProject"
ISSUE_NUMBER=$1
LABELS=$(gh issue view $ISSUE_NUMBER --repo $REPO --json labels -q '.labels[].name')

echo "Issue #$ISSUE_NUMBER 标签: $LABELS"

# 根据标签决定分配给哪个 Agent
if echo "$LABELS" | grep -q "product\|requirements\|prd"; then
    echo "→ 分配给产品 Agent (agent-product)"
elif echo "$LABELS" | grep -q "frontend\|ui\|web"; then
    echo "→ 分配给前端开发 (agent-dev)"
elif echo "$LABELS" | grep -q "backend\|java\|api"; then
    echo "→ 分配给后端开发 (agent-dev)"
elif echo "$LABELS" | grep -q "test\|qa\|bug"; then
    echo "→ 分配给测试 Agent (agent-qa)"
elif echo "$LABELS" | grep -q "ops\|devops\|deploy"; then
    echo "→ 分配给运维 Agent (agent-ops)"
elif echo "$LABELS" | grep -q "research\|spike"; then
    echo "→ 分配给研究 Agent (agent-research)"
else
    echo "→ 无匹配标签，由主协调员处理"
fi
