#!/bin/bash

# Couple Home API 自动化测试脚本
# 用法：./api-tests.sh

BASE_URL="http://localhost:8080/api"
PASS=0
FAIL=0

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  Couple Home API 自动化测试"
echo "========================================"
echo ""

# 测试函数
test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -n "测试：$name ... "
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" == "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL (期望：$expected_status, 实际：$http_code)${NC}"
        ((FAIL++))
        echo "响应：$body"
    fi
}

echo "--- 健康检查 ---"
# 健康检查在根路径，不在 /api 下
response=$(curl -s -w "\n%{http_code}" "http://localhost:8080/health")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" == "200" ]; then
    echo -e "测试：健康检查 ... ${GREEN}✅ PASS${NC}"
    ((PASS++))
else
    echo -e "测试：健康检查 ... ${RED}❌ FAIL (实际：$http_code)${NC}"
    ((FAIL++))
fi

echo ""
echo "--- 吃饭投票系统 ---"
test_api "创建午餐投票" "POST" "/meals/today" '{"mealType":"lunch"}' "201"
test_api "获取午餐投票" "GET" "/meals/today?mealType=lunch" "" "200"
test_api "创建晚餐投票" "POST" "/meals/today" '{"mealType":"dinner","optionCount":5}' "201"
test_api "获取晚餐投票" "GET" "/meals/today?mealType=dinner" "" "200"

echo ""
echo "--- 家务分工系统 ---"
test_api "获取任务列表" "GET" "/chores" "" "200"
test_api "创建任务" "POST" "/chores" '{"name":"测试任务","icon":"🧹","type":"daily","points":5,"dueDate":"2026-03-25"}' "201"
test_api "获取统计" "GET" "/chores/stats?userId=user" "" "200"
test_api "获取排行榜" "GET" "/chores/leaderboard" "" "200"

echo ""
echo "--- 冰箱管理 ---"
test_api "获取冰箱列表" "GET" "/fridge" "" "200"
test_api "添加食材" "POST" "/fridge" '{"name":"香蕉","quantity":3,"unit":"个","category":"vegetable","expiryDate":"2026-04-05T00:00:00Z"}' "201"
test_api "获取临期食材" "GET" "/fridge/expiring?days=30" "" "200"

echo ""
echo "--- 菜谱系统 ---"
test_api "获取随机菜谱" "GET" "/recipes/random" "" "200"

echo ""
echo "========================================"
echo "  测试结果汇总"
echo "========================================"
echo -e "通过：${GREEN}$PASS${NC}"
echo -e "失败：${RED}$FAIL${NC}"
echo "总计：$((PASS + FAIL))"
echo "========================================"

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}⚠️  有 $FAIL 个测试失败${NC}"
    exit 1
fi
