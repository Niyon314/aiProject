package handlers

import (
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PointsRecord - 积分记录模型
type PointsRecord struct {
	ID          string    `json:"id" gorm:"primaryKey;size:64"`
	UserID      string    `json:"userId" gorm:"size:64;default:'user'"`
	Amount      int       `json:"amount" gorm:"not null"`
	Type        string    `json:"type" gorm:"size:32;not null"` // earn / spend
	Source      string    `json:"source" gorm:"size:32"`         // chore / checkin / redeem
	Description string    `json:"description" gorm:"size:256"`
	Balance     int       `json:"balance" gorm:"default:0"`
	CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

func (PointsRecord) TableName() string { return "points_records" }

// ShopItemModel - 积分商城商品
type ShopItemModel struct {
	ID           string `json:"id" gorm:"primaryKey;size:64"`
	Name         string `json:"name" gorm:"size:128;not null"`
	Icon         string `json:"icon" gorm:"size:32"`
	Description  string `json:"description" gorm:"size:256"`
	Points       int    `json:"points" gorm:"not null"`
	Stock        int    `json:"stock" gorm:"default:99"`
	Category     string `json:"category" gorm:"size:32"` // coupon / privilege / gift
	ValidityDays int    `json:"validityDays" gorm:"default:30"`
}

func (ShopItemModel) TableName() string { return "shop_items" }

// RedeemedCoupon - 已兑换券码
type RedeemedCoupon struct {
	ID       string    `json:"id" gorm:"primaryKey;size:64"`
	ItemID   string    `json:"itemId" gorm:"size:64"`
	ItemName string    `json:"itemName" gorm:"size:128"`
	Code     string    `json:"code" gorm:"size:32"`
	Points   int       `json:"points"`
	Used     bool      `json:"used" gorm:"default:false"`
	UsedAt   *time.Time `json:"usedAt,omitempty"`
	ExpireAt time.Time `json:"expireAt"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

func (RedeemedCoupon) TableName() string { return "redeemed_coupons" }

// PointsHandler - 积分处理器
type PointsHandler struct {
	db *gorm.DB
}

func NewPointsHandler(db *gorm.DB) *PointsHandler {
	return &PointsHandler{db: db}
}

// GetPoints GET /api/points
func (h *PointsHandler) GetPoints(c *gin.Context) {
	var records []PointsRecord
	h.db.Where("user_id = ?", "user").Order("created_at desc").Limit(50).Find(&records)
	
	c.JSON(http.StatusOK, gin.H{"data": records})
}

// GetSummary GET /api/points/summary
func (h *PointsHandler) GetSummary(c *gin.Context) {
	var totalEarned, totalSpent int
	h.db.Model(&PointsRecord{}).Where("user_id = ? AND type = ?", "user", "earn").Select("COALESCE(SUM(amount), 0)").Scan(&totalEarned)
	h.db.Model(&PointsRecord{}).Where("user_id = ? AND type = ?", "user", "spend").Select("COALESCE(SUM(amount), 0)").Scan(&totalSpent)
	
	// 本周积分
	weekStart := time.Now().AddDate(0, 0, -int(time.Now().Weekday()))
	var earnedThisWeek int
	h.db.Model(&PointsRecord{}).Where("user_id = ? AND type = ? AND created_at >= ?", "user", "earn", weekStart).Select("COALESCE(SUM(amount), 0)").Scan(&earnedThisWeek)
	
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"totalPoints":   totalEarned - totalSpent,
			"earnedTotal":   totalEarned,
			"spentTotal":    totalSpent,
			"earnedThisWeek": earnedThisWeek,
		},
	})
}

// GetShop GET /api/points/shop
func (h *PointsHandler) GetShop(c *gin.Context) {
	var items []ShopItemModel
	h.db.Find(&items)
	
	// 如果商城为空，插入默认商品
	if len(items) == 0 {
		items = []ShopItemModel{
			{ID: "shop1", Name: "免做家务券", Icon: "🎫", Description: "今天的家务让 TA 做！", Points: 50, Stock: 99, Category: "privilege", ValidityDays: 7},
			{ID: "shop2", Name: "选电影特权", Icon: "🎬", Description: "今天看什么你说了算", Points: 30, Stock: 99, Category: "privilege", ValidityDays: 7},
			{ID: "shop3", Name: "做饭免除卡", Icon: "🍳", Description: "今天不用做饭啦", Points: 40, Stock: 99, Category: "privilege", ValidityDays: 7},
			{ID: "shop4", Name: "一个抱抱", Icon: "🤗", Description: "超大号的那种！", Points: 10, Stock: 999, Category: "gift", ValidityDays: 1},
			{ID: "shop5", Name: "甜品基金 +20", Icon: "🍰", Description: "共同基金加 20 元", Points: 80, Stock: 99, Category: "coupon", ValidityDays: 30},
		}
		for _, item := range items {
			h.db.Create(&item)
		}
	}
	
	c.JSON(http.StatusOK, gin.H{"data": items})
}

// Redeem POST /api/points/redeem
func (h *PointsHandler) Redeem(c *gin.Context) {
	var req struct {
		ItemID string `json:"itemId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请选择商品"})
		return
	}
	
	var item ShopItemModel
	if err := h.db.First(&item, "id = ?", req.ItemID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "商品不存在"})
		return
	}
	
	// 检查积分余额
	var totalEarned, totalSpent int
	h.db.Model(&PointsRecord{}).Where("user_id = ? AND type = ?", "user", "earn").Select("COALESCE(SUM(amount), 0)").Scan(&totalEarned)
	h.db.Model(&PointsRecord{}).Where("user_id = ? AND type = ?", "user", "spend").Select("COALESCE(SUM(amount), 0)").Scan(&totalSpent)
	balance := totalEarned - totalSpent
	
	if balance < item.Points {
		c.JSON(http.StatusBadRequest, gin.H{"error": "积分不足"})
		return
	}
	
	// 扣积分
	record := PointsRecord{
		ID:          uuid.New().String(),
		UserID:      "user",
		Amount:      item.Points,
		Type:        "spend",
		Source:      "redeem",
		Description: "兑换: " + item.Name,
		Balance:     balance - item.Points,
	}
	h.db.Create(&record)
	
	// 生成券码
	code := generateCode()
	coupon := RedeemedCoupon{
		ID:       uuid.New().String(),
		ItemID:   item.ID,
		ItemName: item.Name,
		Code:     code,
		Points:   item.Points,
		ExpireAt: time.Now().AddDate(0, 0, item.ValidityDays),
	}
	h.db.Create(&coupon)
	
	c.JSON(http.StatusOK, gin.H{"data": coupon, "message": "兑换成功！"})
}

// GetCoupons GET /api/points/coupons
func (h *PointsHandler) GetCoupons(c *gin.Context) {
	var coupons []RedeemedCoupon
	h.db.Order("created_at desc").Find(&coupons)
	
	c.JSON(http.StatusOK, gin.H{"data": coupons})
}

// UseCoupon POST /api/points/coupons/:id/use
func (h *PointsHandler) UseCoupon(c *gin.Context) {
	id := c.Param("id")
	now := time.Now()
	
	var coupon RedeemedCoupon
	if err := h.db.First(&coupon, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "券码不存在"})
		return
	}
	
	if coupon.Used {
		c.JSON(http.StatusBadRequest, gin.H{"error": "券码已使用"})
		return
	}
	
	if now.After(coupon.ExpireAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "券码已过期"})
		return
	}
	
	coupon.Used = true
	coupon.UsedAt = &now
	h.db.Save(&coupon)
	
	c.JSON(http.StatusOK, gin.H{"data": coupon, "message": "使用成功！"})
}

func generateCode() string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	code := make([]byte, 8)
	for i := range code {
		code[i] = chars[rand.Intn(len(chars))]
	}
	return string(code)
}
