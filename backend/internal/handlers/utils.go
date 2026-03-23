package handlers

import (
	"errors"
	"time"
)

// parseDate - 解析日期字符串
// 支持多种格式：YYYY-MM-DD, ISO 8601 等
func parseDate(dateStr string) (time.Time, error) {
	// 尝试多种格式
	formats := []string{
		"2006-01-02",
		"2006-01-02T15:04:05",
		"2006-01-02T15:04:05Z07:00",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, errors.New("invalid date format")
}
