package handlers

import (
	"net/http"
	"time"

	"couple-home/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// StatisticsHandler - 数据报表 HTTP 处理器
type StatisticsHandler struct {
	db *gorm.DB
}

// NewStatisticsHandler - 创建数据报表处理器
func NewStatisticsHandler(db *gorm.DB) *StatisticsHandler {
	return &StatisticsHandler{db: db}
}

// SpendingTrendItem - 消费趋势数据项
type SpendingTrendItem struct {
	Date  string  `json:"date"`
	Amount float64 `json:"amount"`
}

// CategoryItem - 分类数据项
type CategoryItem struct {
	Name   string  `json:"name"`
	Value  float64 `json:"value"`
	Color  string  `json:"color"`
}

// ChoreContributionItem - 家务贡献数据项
type ChoreContributionItem struct {
	User       string  `json:"user"`
	Completed  int     `json:"completed"`
	Percentage float64 `json:"percentage"`
}

// GetSpendingTrend - 获取消费趋势
// GET /api/statistics/spending?days=30
func (h *StatisticsHandler) GetSpendingTrend(c *gin.Context) {
	days := 30 // 默认 30 天
	if d := c.Query("days"); d != "" {
		// 简单解析，实际应该验证
		// 这里简化处理
	}

	// 计算日期范围
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -days)

	// 查询账单数据
	var bills []models.Bill
	if err := h.db.Where("created_at >= ? AND created_at <= ?", startDate, endDate).Find(&bills).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 按日期聚合
	dailyAmounts := make(map[string]float64)
	for _, bill := range bills {
		dateStr := bill.CreatedAt.Format("2006-01-02")
		dailyAmounts[dateStr] += bill.Amount
	}

	// 转换为数组
	var trend []SpendingTrendItem
	for date, amount := range dailyAmounts {
		trend = append(trend, SpendingTrendItem{
			Date:   date,
			Amount: amount,
		})
	}

	// 按日期排序
	for i := 0; i < len(trend)-1; i++ {
		for j := i + 1; j < len(trend); j++ {
			if trend[i].Date > trend[j].Date {
				trend[i], trend[j] = trend[j], trend[i]
			}
		}
	}

	// 如果数据太少，补充一些空数据使图表好看
	if len(trend) < 7 {
		for i := 0; i < days; i++ {
			date := startDate.AddDate(0, 0, i).Format("2006-01-02")
			found := false
			for _, item := range trend {
				if item.Date == date {
					found = true
					break
				}
			}
			if !found {
				trend = append(trend, SpendingTrendItem{
					Date:   date,
					Amount: 0,
				})
			}
		}
		// 重新排序
		for i := 0; i < len(trend)-1; i++ {
			for j := i + 1; j < len(trend); j++ {
				if trend[i].Date > trend[j].Date {
					trend[i], trend[j] = trend[j], trend[i]
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": trend})
}

// GetCategories - 获取消费分类
// GET /api/statistics/categories?month=2026-03
func (h *StatisticsHandler) GetCategories(c *gin.Context) {
	month := c.Query("month")
	
	var startDate, endDate time.Time
	var err error

	if month != "" {
		// 解析月份 YYYY-MM
		startDate, err = time.Parse("2006-01", month)
		if err != nil {
			startDate = time.Now().AddDate(0, -1, 0)
			startDate = time.Date(startDate.Year(), startDate.Month(), 1, 0, 0, 0, 0, startDate.Location())
		}
		endDate = startDate.AddDate(0, 1, 0).Add(-time.Second)
	} else {
		// 默认当前月份
		now := time.Now()
		startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		endDate = now
	}

	// 查询账单数据
	var bills []models.Bill
	if err := h.db.Where("created_at >= ? AND created_at <= ?", startDate, endDate).Find(&bills).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 按分类聚合
	categoryAmounts := make(map[string]float64)
	for _, bill := range bills {
		category := bill.Category
		if category == "" {
			category = "其他"
		}
		categoryAmounts[category] += bill.Amount
	}

	// 马卡龙配色
	colors := []string{
		"#FFB5C5", // 粉色
		"#A8E6FF", // 蓝色
		"#DDA0DD", // 紫色
		"#98D8C8", // 绿色
		"#FFD93D", // 黄色
		"#FFAA85", // 橙色
		"#B5EAD7", // 薄荷绿
	}

	// 转换为数组
	var categories []CategoryItem
	colorIndex := 0
	for name, value := range categoryAmounts {
		categories = append(categories, CategoryItem{
			Name:  name,
			Value: value,
			Color: colors[colorIndex%len(colors)],
		})
		colorIndex++
	}

	c.JSON(http.StatusOK, gin.H{"data": categories})
}

// GetChoresContribution - 获取家务贡献
// GET /api/statistics/chores?days=30
func (h *StatisticsHandler) GetChoresContribution(c *gin.Context) {
	days := 30
	if d := c.Query("days"); d != "" {
		// 简单解析
	}

	// 计算日期范围
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -days)

	// 查询已完成的家务
	var chores []models.Chore
	if err := h.db.Where("status = 'completed' AND completed_at >= ? AND completed_at <= ?", startDate, endDate).Find(&chores).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 统计用户和伴侣的完成数
	userCount := 0
	partnerCount := 0
	for _, chore := range chores {
		if chore.Assignee == "user" {
			userCount++
		} else if chore.Assignee == "partner" {
			partnerCount++
		}
	}

	total := userCount + partnerCount
	userPercentage := 0.0
	partnerPercentage := 0.0
	if total > 0 {
		userPercentage = float64(userCount) / float64(total) * 100
		partnerPercentage = float64(partnerCount) / float64(total) * 100
	}

	contribution := []ChoreContributionItem{
		{
			User:       "我",
			Completed:  userCount,
			Percentage: userPercentage,
		},
		{
			User:       "TA",
			Completed:  partnerCount,
			Percentage: partnerPercentage,
		},
	}

	c.JSON(http.StatusOK, gin.H{"data": contribution})
}

// GetOverview - 获取总览数据
// GET /api/statistics/overview
func (h *StatisticsHandler) GetOverview(c *gin.Context) {
	// 当前月份
	now := time.Now()
	startDate := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endDate := now

	// 总支出
	var totalSpending float64
	h.db.Model(&models.Bill{}).Where("created_at >= ? AND created_at <= ?", startDate, endDate).Select("SUM(amount)").Scan(&totalSpending)

	// 总积分
	var totalPoints int
	h.db.Model(&models.Chore{}).Where("status = 'completed' AND completed_at >= ? AND completed_at <= ?", startDate, endDate).Select("SUM(points)").Scan(&totalPoints)

	overview := gin.H{
		"totalSpending": totalSpending,
		"totalPoints":   totalPoints,
		"month":         now.Format("2006-01"),
	}

	c.JSON(http.StatusOK, gin.H{"data": overview})
}
