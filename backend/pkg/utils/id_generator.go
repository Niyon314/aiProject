package utils

import (
	"crypto/rand"
	"encoding/hex"
)

// GenerateID - 生成唯一 ID (UUID-like)
func GenerateID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b[:8])
}
