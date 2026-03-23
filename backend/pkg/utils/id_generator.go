package service

import (
	"crypto/rand"
	"encoding/hex"
)

// generateID - 生成唯一 ID (UUID-like)
func generateID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b[:8])
}
