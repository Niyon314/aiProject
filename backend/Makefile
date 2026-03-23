.PHONY: build run test clean docker-build docker-up docker-down

# Build the application
build:
	go build -o bin/main ./cmd/main.go

# Run the application
run:
	go run ./cmd/main.go

# Run tests
test:
	go test -v ./...

# Clean build artifacts
clean:
	rm -rf bin/
	rm -f couple_home.db

# Build Docker image
docker-build:
	docker-compose build

# Start Docker containers
docker-up:
	docker-compose up -d

# Stop Docker containers
docker-down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f backend

# Database migration (if needed)
migrate:
	go run ./cmd/main.go

# Generate API docs (if using swag)
docs:
	swag init -g cmd/main.go -o api/docs

# Format code
fmt:
	go fmt ./...

# Lint code
lint:
	go vet ./...

# Install dependencies
deps:
	go mod download
	go mod tidy

# Default target
all: deps build
