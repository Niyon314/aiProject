#!/bin/bash

# 情侣小家 - 快速集成测试
# 测试核心功能：日程管理、家务分工、账单 AA、吃饭模块

BASE_URL="http://localhost:8080/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -n "测试：$name ... "
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" == "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL (期望：$expected_status, 实际：$http_code)${NC}"
        ((FAIL++))
    fi
}

echo "========================================"
echo "  情侣小家 - 快速集成测试"
echo "  时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# 健康检查
echo -e "\n${YELLOW}=== 健康检查 ===${NC}"
response=$(curl -s "http://localhost:8080/health")
if echo "$response" | grep -q "ok"; then
    echo -e "健康检查：${GREEN}✅ PASS${NC}"
    ((PASS++))
else
    echo -e "健康检查：${RED}❌ FAIL${NC}"
    ((FAIL++))
fi

# 日程管理
echo -e "\n${YELLOW}=== 日程管理 ===${NC}"
test_api "获取日程列表" "GET" "/schedules" "" "200"
test_api "创建日程" "POST" "/schedules" '{"title":"测试日程","startTime":"2026-04-20T19:00:00Z","endTime":"2026-04-20T21:00:00Z","type":"date","icon":"🎬"}' "200"
test_api "获取即将开始日程" "GET" "/schedules/upcoming" "" "200"

# 家务分工
echo -e "\n${YELLOW}=== 家务分工 ===${NC}"
test_api "获取家务列表" "GET" "/chores" "" "200"
test_api "创建家务" "POST" "/chores" '{"name":"测试家务","icon":"🧹","type":"daily","points":5,"dueDate":"2026-04-17"}' "200"
test_api "获取家务统计" "GET" "/chores/stats?userId=user1" "" "200"
test_api "获取排行榜" "GET" "/chores/leaderboard" "" "200"

# 账单 AA
echo -e "\n${YELLOW}=== 账单 AA ===${NC}"
test_api "获取账单列表" "GET" "/bills" "" "200"
test_api "创建账单" "POST" "/bills" '{"title":"测试账单","amount":100,"category":"food","paidBy":"user1","date":"2026-04-16"}' "200"
test_api "获取账单统计" "GET" "/bills/stats" "" "200"
test_api "获取共同基金" "GET" "/bills/fund" "" "200"

# 吃饭模块
echo -e "\n${YELLOW}=== 吃饭模块 ===${NC}"
test_api "获取今日投票 (午餐)" "GET" "/meals/today?mealType=lunch" "" "200"
test_api "创建午餐投票" "POST" "/meals/today" '{"mealType":"dinner","options":["火锅","烤肉"]}' "200"
test_api "获取历史投票" "GET" "/meals/history" "" "200"
test_api "获取想吃清单" "GET" "/meal/wishes" "" "200"
test_api "获取吃饭历史" "GET" "/meal/history" "" "200"

# 冰箱管理
echo -e "\n${YELLOW}=== 冰箱管理 ===${NC}"
test_api "获取冰箱列表" "GET" "/fridge" "" "200"
test_api "添加食材" "POST" "/fridge" '{"name":"测试食材","quantity":5,"unit":"个","category":"vegetable","expiryDate":"2026-04-25T00:00:00Z"}' "200"

# 纪念日
echo -e "\n${YELLOW}=== 纪念日 ===${NC}"
test_api "获取纪念日列表" "GET" "/anniversaries" "" "200"
test_api "获取在一起天数" "GET" "/anniversaries/days" "" "200"

# 留言板
echo -e "\n${YELLOW}=== 留言板 ===${NC}"
test_api "获取留言" "GET" "/messages" "" "200"
test_api "发送留言" "POST" "/messages" '{"content":"测试留言","type":"text"}' "200"

# 积分系统
echo -e "\n${YELLOW}=== 积分系统 ===${NC}"
test_api "获取积分" "GET" "/points" "" "200"
test_api "获取积分商城" "GET" "/points/shop" "" "200"

# 愿望清单
echo -e "\n${YELLOW}=== 愿望清单 ===${NC}"
test_api "获取愿望清单" "GET" "/wishlist" "" "200"
test_api "创建愿望" "POST" "/wishlist" '{"name":"测试愿望","targetAmount":1000}' "200"

# 观影清单
echo -e "\n${YELLOW}=== 观影清单 ===${NC}"
test_api "获取电影列表" "GET" "/movies" "" "200"
test_api "添加电影" "POST" "/movies" '{"title":"测试电影","type":"movie","status":"want_to_watch"}' "200"

# 恋爱日记
echo -e "\n${YELLOW}=== 恋爱日记 ===${NC}"
test_api "获取日记列表" "GET" "/diaries" "" "200"
test_api "创建日记" "POST" "/diaries" '{"title":"测试日记","content":"测试内容","mood":"happy","date":"2026-04-16","privacy":"shared"}' "200"

# 统计
echo -e "\n${YELLOW}=== 统计 ===${NC}"
test_api "获取总览统计" "GET" "/statistics/overview" "" "200"
test_api "获取消费趋势" "GET" "/statistics/spending" "" "200"

# 汇总
echo -e "\n========================================"
echo "  测试结果"
echo "========================================"
echo -e "通过：${GREEN}$PASS${NC}"
echo -e "失败：${RED}$FAIL${NC}"
TOTAL=$((PASS + FAIL))
echo "总计：$TOTAL"
if [ $TOTAL -gt 0 ]; then
    PASS_RATE=$(echo "scale=1; $PASS * 100 / $TOTAL" | bc)
    echo "通过率：${PASS_RATE}%"
fi
echo "========================================"

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}⚠️  有 $FAIL 个测试失败${NC}"
    exit 1
fi
