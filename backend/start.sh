#!/bin/bash

# Couple Home Backend - Quick Start Script

set -e

echo "🏠 Couple Home Backend - Quick Start"
echo "===================================="

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go 1.21+ first."
    echo "   Visit: https://golang.org/dl/"
    exit 1
fi

echo "✅ Go version: $(go version)"

# Create data directory
mkdir -p data

# Download dependencies
echo ""
echo "📦 Downloading dependencies..."
go mod download
go mod tidy

# Build the application
echo ""
echo "🔨 Building application..."
go build -o bin/main ./cmd/main.go

echo ""
echo "✅ Build successful!"
echo ""
echo "🚀 Starting server..."
echo "   API will be available at: http://localhost:8080"
echo "   Health check: http://localhost:8080/health"
echo "   API docs: See api/openapi.yaml"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run the application
./bin/main
