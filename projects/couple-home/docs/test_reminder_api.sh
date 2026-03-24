#!/bin/bash

# 惊喜提醒功能 API 测试脚本
# 使用方法：./test_reminder_api.sh

API_BASE="${API_BASE:-http://localhost:8080/api}"

echo "======================================"
echo "🎁 惊喜提醒功能 API 测试"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}测试：${description}${NC}"
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "${API_BASE}${endpoint}")
    elif [ "$method" == "POST" ] || [ "$method" == "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "${API_BASE}${endpoint}")
    elif [ "$method" == "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "${API_BASE}${endpoint}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ 成功 (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ 失败 (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
    echo ""
}

# 1. 健康检查
echo "1️⃣  健康检查"
echo "--------------------------------------"
curl -s "${API_BASE%/api}/health" | jq '.' 2>/dev/null || echo "服务未启动"
echo ""

# 2. 创建提醒
echo "2️⃣  创建提醒"
echo "--------------------------------------"
CREATE_RESPONSE=$(curl -s -X POST "${API_BASE}/reminders" \
    -H "Content-Type: application/json" \
    -d '{
        "title": "测试 - TA 的生日",
        "date": "2026-04-15T00:00:00Z",
        "type": "birthday",
        "notes": "喜欢粉色，想要口红",
        "reminderDays": [7, 3, 1],
        "partnerName": "小明",
        "isRecurring": true
    }')

echo "$CREATE_RESPONSE" | jq '.' 2>/dev/null || echo "$CREATE_RESPONSE"
REMINDER_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id' 2>/dev/null)
echo ""

# 3. 获取提醒列表
echo "3️⃣  获取提醒列表"
echo "--------------------------------------"
test_api "GET" "/reminders" "" "获取所有提醒"

# 4. 获取单个提醒
if [ -n "$REMINDER_ID" ] && [ "$REMINDER_ID" != "null" ]; then
    echo "4️⃣  获取单个提醒 (ID: $REMINDER_ID)"
    echo "--------------------------------------"
    test_api "GET" "/reminders/$REMINDER_ID" "" "获取指定提醒"
    
    # 5. 更新提醒
    echo "5️⃣  更新提醒"
    echo "--------------------------------------"
    test_api "PUT" "/reminders/$REMINDER_ID" \
        '{"notes": "更新后的备注：喜欢粉色和紫色"}' \
        "更新提醒备注"
    
    # 6. 获取即将到期的提醒
    echo "6️⃣  获取即将到期的提醒"
    echo "--------------------------------------"
    test_api "GET" "/reminders/upcoming" "" "获取未来 30 天的提醒"
    
    # 7. 获取礼物推荐
    echo "7️⃣  获取礼物推荐"
    echo "--------------------------------------"
    test_api "GET" "/reminders/gift-ideas?type=birthday&budget=medium" "" "获取生日礼物推荐 (中等预算)"
    
    # 8. 获取约会建议
    echo "8️⃣  获取约会建议"
    echo "--------------------------------------"
    test_api "GET" "/reminders/date-ideas?type=anniversary&budget=high" "" "获取纪念日约会建议 (高预算)"
    
    # 9. 删除提醒
    echo "9️⃣  删除提醒"
    echo "--------------------------------------"
    test_api "DELETE" "/reminders/$REMINDER_ID" "" "删除测试提醒"
else
    echo "⚠️  跳过后续测试（未成功创建提醒）"
fi

echo ""
echo "======================================"
echo "✅ 测试完成"
echo "======================================"
