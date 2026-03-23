package config

import (
	"os"
)

// Config - 应用配置
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
}

// ServerConfig - 服务器配置
type ServerConfig struct {
	Port string
	Mode string // debug, release, test
}

// DatabaseConfig - 数据库配置
type DatabaseConfig struct {
	Driver   string // sqlite, postgres
	DSN      string
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

// Load - 加载配置
func Load() *Config {
	config := &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
			Mode: getEnv("GIN_MODE", "debug"),
		},
		Database: DatabaseConfig{
			Driver:   getEnv("DB_DRIVER", "sqlite"),
			DSN:      getEnv("DB_DSN", "couple_home.db"),
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", ""),
			DBName:   getEnv("DB_NAME", "couple_home"),
		},
	}

	return config
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
