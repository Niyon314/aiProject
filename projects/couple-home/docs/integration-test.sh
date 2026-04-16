#!/bin/bash

# 情侣小家 - 集成测试脚本
# 测试核心功能：用户登录、日程管理、家务分工、账单 AA、吃饭模块
# 用法：./integration-test.sh

BASE_URL="http://localhost:8080/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0
SKIP=0

# 测试计数器
TEST_NUM=0

# 打印测试标题
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# 测试函数 - 带详细输出
test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    ((TEST_NUM++))
    echo -n "[$TEST_NUM] 测试：$name ... "
    
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
        return 0
    else
        echo -e "${RED}❌ FAIL (期望：$expected_status, 实际：$http_code)${NC}"
        echo "    响应：$body"
        ((FAIL++))
        return 1
    fi
}

# 测试函数 - 需要检查响应内容
test_api_with_check() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    local check_field="$6"
    
    ((TEST_NUM++))
    echo -n "[$TEST_NUM] 测试：$name ... "
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" != "$expected_status" ]; then
        echo -e "${RED}❌ FAIL (HTTP: $http_code)${NC}"
        echo "    响应：$body"
        ((FAIL++))
        return 1
    fi
    
    # 检查响应内容
    if echo "$body" | grep -q "$check_field"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${RED}❌ FAIL (缺少字段：$check_field)${NC}"
        echo "    响应：$body"
        ((FAIL++))
        return 1
    fi
}

# 开始测试
echo "========================================"
echo "  情侣小家 - 集成测试"
echo "  测试时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# 检查后端是否运行
echo -n "检查后端服务... "
health_response=$(curl -s -w "\n%{http_code}" "http://localhost:8080/health" 2>/dev/null)
health_code=$(echo "$health_response" | tail -n1)
if [ "$health_code" == "200" ]; then
    echo -e "${GREEN}✅ 后端运行正常${NC}"
else
    echo -e "${RED}❌ 后端未运行或无法访问${NC}"
    echo "请先启动后端服务：cd /root/.openclaw/workspace/backend && ./main"
    exit 1
fi

# ========================================
# 1. 健康检查
# ========================================
print_header "1. 健康检查"
test_api "健康检查 GET" "GET" "/health" "" "200"
test_api "健康检查 HEAD" "HEAD" "/health" "" "200"

# ========================================
# 2. 日程管理模块测试
# ========================================
print_header "2. 日程管理模块测试"

# 获取日程列表
test_api_with_check "获取日程列表" "GET" "/schedules" "" "200" "schedules"

# 创建日程
SCHEDULE_DATA='{"title":"约会之夜","description":"一起看电影","startTime":"2026-04-20T19:00:00Z","endTime":"2026-04-20T22:00:00Z","type":"date","icon":"🎬"}'
test_api_with_check "创建日程" "POST" "/schedules" "$SCHEDULE_DATA" "200" "id"

# 获取即将开始的日程
test_api_with_check "获取即将开始的日程" "GET" "/schedules/upcoming" "" "200" "schedules"

# 创建另一个日程用于测试
SCHEDULE_DATA2='{"title":"周末购物","description":"买生活用品","startTime":"2026-04-22T14:00:00Z","endTime":"2026-04-22T17:00:00Z","type":"other","icon":"🛒"}'
test_api_with_check "创建第二个日程" "POST" "/schedules" "$SCHEDULE_DATA2" "200" "id"

# ========================================
# 3. 家务分工模块测试
# ========================================
print_header "3. 家务分工模块测试"

# 获取任务列表
test_api_with_check "获取家务任务列表" "GET" "/chores" "" "200" "chores"

# 创建家务任务
CHORE_DATA='{"name":"洗碗","icon":"🍽️","type":"daily","points":10,"dueDate":"2026-04-17","assignee":""}'
test_api_with_check "创建家务任务" "POST" "/chores" "$CHORE_DATA" "200" "id"

# 获取统计
test_api_with_check "获取家务统计" "GET" "/chores/stats?userId=user1" "" "200" "totalPoints"

# 获取排行榜
test_api_with_check "获取家务排行榜" "GET" "/chores/leaderboard" "" "200" "leaderboard"

# 获取任务模板
test_api_with_check "获取任务模板" "GET" "/chores/templates" "" "200" "templates"

# ========================================
# 4. 账单 AA 模块测试
# ========================================
print_header "4. 账单 AA 模块测试"

# 获取账单列表
test_api_with_check "获取账单列表" "GET" "/bills" "" "200" "bills"

# 创建账单
BILL_DATA='{"title":"超市购物","amount":158.50,"category":"grocery","paidBy":"user1","date":"2026-04-16","participants":["user1","user2"]}'
test_api_with_check "创建账单" "POST" "/bills" "$BILL_DATA" "200" "id"

# 获取账单统计
test_api_with_check "获取账单统计" "GET" "/bills/stats" "" "200" "total"

# 获取共同基金列表
test_api_with_check "获取共同基金列表" "GET" "/bills/fund" "" "200" "funds"

# 创建共同基金
FUND_DATA='{"name":"旅行基金","targetAmount":5000,"monthlyGoal":500}'
test_api_with_check "创建共同基金" "POST" "/bills/fund" "$FUND_DATA" "200" "id"

# ========================================
# 5. 吃饭模块测试
# ========================================
print_header "5. 吃饭模块测试"

# 获取今日投票
test_api "获取今日投票" "GET" "/meals/today" "" "200"

# 创建今日投票（午餐）
MEAL_DATA='{"mealType":"lunch","options":["番茄炒蛋","麻婆豆腐","清蒸鱼"]}'
test_api_with_check "创建午餐投票" "POST" "/meals/today" "$MEAL_DATA" "200" "id"

# 获取历史投票
test_api_with_check "获取历史投票" "GET" "/meals/history" "" "200" "votes"

# 获取想吃清单
test_api_with_check "获取想吃清单" "GET" "/meal/wishes" "" "200" "wishes"

# 添加想吃
WISH_DATA='{"name":"火锅","category":"dinner","priority":"high"}'
test_api_with_check "添加想吃" "POST" "/meal/wishes" "$WISH_DATA" "200" "id"

# 获取吃饭历史
test_api_with_check "获取吃饭历史" "GET" "/meal/history" "" "200" "history"

# ========================================
# 6. 冰箱管理测试
# ========================================
print_header "6. 冰箱管理测试"

# 获取冰箱列表
test_api_with_check "获取冰箱食材列表" "GET" "/fridge" "" "200" "items"

# 添加食材
FRIDGE_DATA='{"name":"鸡蛋","quantity":10,"unit":"个","category":"protein","expiryDate":"2026-04-25T00:00:00Z"}'
test_api_with_check "添加食材" "POST" "/fridge" "$FRIDGE_DATA" "200" "id"

# 获取临期食材
test_api_with_check "获取临期食材" "GET" "/fridge/expiring?days=7" "" "200" "items"

# ========================================
# 7. 菜谱系统测试
# ========================================
print_header "7. 菜谱系统测试"

# 获取随机菜谱
test_api_with_check "获取随机菜谱" "GET" "/recipes/random" "" "200" "recipes"

# 获取所有菜谱
test_api_with_check "获取所有菜谱" "GET" "/recipes" "" "200" "recipes"

# ========================================
# 8. 纪念日测试
# ========================================
print_header "8. 纪念日测试"

# 获取纪念日列表
test_api_with_check "获取纪念日列表" "GET" "/anniversaries" "" "200" "anniversaries"

# 获取在一起天数
test_api_with_check "获取在一起天数" "GET" "/anniversaries/days" "" "200" "days"

# 获取即将到来的纪念日
test_api_with_check "获取即将到来的纪念日" "GET" "/anniversaries/upcoming" "" "200" "anniversaries"

# ========================================
# 9. 留言板测试
# ========================================
print_header "9. 留言板测试"

# 获取留言
test_api_with_check "获取留言列表" "GET" "/messages" "" "200" "messages"

# 发送留言
MESSAGE_DATA='{"content":"今天过得开心吗？💕","type":"text"}'
test_api_with_check "发送留言" "POST" "/messages" "$MESSAGE_DATA" "200" "id"

# ========================================
# 10. 积分系统测试
# ========================================
print_header "10. 积分系统测试"

# 获取积分
test_api_with_check "获取积分" "GET" "/points" "" "200" "points"

# 获取积分汇总
test_api_with_check "获取积分汇总" "GET" "/points/summary" "" "200" "summary"

# 获取积分商城
test_api_with_check "获取积分商城" "GET" "/points/shop" "" "200" "items"

# ========================================
# 11. 愿望清单测试
# ========================================
print_header "11. 愿望清单测试"

# 获取愿望清单
test_api_with_check "获取愿望清单" "GET" "/wishlist" "" "200" "items"

# 创建愿望
WISHLIST_DATA='{"name":"Switch 游戏机","targetAmount":2000,"category":"electronics","icon":"🎮"}'
test_api_with_check "创建愿望" "POST" "/wishlist" "$WISHLIST_DATA" "200" "id"

# ========================================
# 12. 观影清单测试
# ========================================
print_header "12. 观影清单测试"

# 获取电影列表
test_api_with_check "获取电影列表" "GET" "/movies" "" "200" "movies"

# 添加电影
MOVIE_DATA='{"title":"流浪地球 2","type":"movie","year":2023,"rating":0,"status":"want_to_watch"}'
test_api_with_check "添加电影" "POST" "/movies" "$MOVIE_DATA" "200" "id"

# ========================================
# 13. 恋爱日记测试
# ========================================
print_header "13. 恋爱日记测试"

# 获取日记列表
test_api_with_check "获取日记列表" "GET" "/diaries" "" "200" "diaries"

# 创建日记
DIARY_DATA='{"title":"美好的一天","content":"今天我们一起去了公园...","mood":"happy","date":"2026-04-16","privacy":"shared"}'
test_api_with_check "创建日记" "POST" "/diaries" "$DIARY_DATA" "200" "id"

# ========================================
# 14. 提醒系统测试
# ========================================
print_header "14. 提醒系统测试"

# 获取提醒列表
test_api_with_check "获取提醒列表" "GET" "/reminders" "" "200" "reminders"

# 创建提醒
REMINDER_DATA='{"title":"记得买牛奶","type":"custom","time":"2026-04-17T09:00:00Z","repeat":"once"}'
test_api_with_check "创建提醒" "POST" "/reminders" "$REMINDER_DATA" "200" "id"

# ========================================
# 15. 主题设置测试
# ========================================
print_header "15. 主题设置测试"

# 获取主题配置
test_api_with_check "获取主题配置" "GET" "/settings/theme" "" "200" "theme"

# 获取可用主题列表
test_api_with_check "获取可用主题" "GET" "/settings/themes" "" "200" "themes"

# ========================================
# 16. 统计系统测试
# ========================================
print_header "16. 统计系统测试"

# 获取总览统计
test_api_with_check "获取总览统计" "GET" "/statistics/overview" "" "200" "overview"

# 获取消费趋势
test_api_with_check "获取消费趋势" "GET" "/statistics/spending" "" "200" "data"

# 获取分类统计
test_api_with_check "获取分类统计" "GET" "/statistics/categories" "" "200" "categories"

# 获取家务贡献统计
test_api_with_check "获取家务贡献" "GET" "/statistics/chores" "" "200" "contribution"

# ========================================
# 测试结果汇总
# ========================================
print_header "测试结果汇总"

TOTAL=$((PASS + FAIL))
PASS_RATE=0
if [ $TOTAL -gt 0 ]; then
    PASS_RATE=$(echo "scale=1; $PASS * 100 / $TOTAL" | bc)
fi

echo -e "通过：${GREEN}$PASS${NC}"
echo -e "失败：${RED}$FAIL${NC}"
echo "总计：$TOTAL"
echo "通过率：${PASS_RATE}%"
echo "========================================"

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}⚠️  有 $FAIL 个测试失败${NC}"
    echo ""
    echo "请检查上述失败测试的详细输出"
    exit 1
fi
