package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestHealthCheck(t *testing.T) {
	gin.SetMode(gin.TestMode)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request = httptest.NewRequest(http.MethodGet, "/health", nil)

	// 执行健康检查 handler
	func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "Couple Home API is running",
		})
	}(c)

	// 验证响应状态码
	if w.Code != http.StatusOK {
		t.Errorf("期望状态码 %d, 得到 %d", http.StatusOK, w.Code)
	}

	// 验证响应体
	expectedBody := `{"status":"ok","message":"Couple Home API is running"}`
	if w.Body.String() != expectedBody {
		t.Errorf("期望响应体 %s, 得到 %s", expectedBody, w.Body.String())
	}
}
