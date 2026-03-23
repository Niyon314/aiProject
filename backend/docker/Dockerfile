# Build stage
FROM golang:1.21-bookworm AS builder

WORKDIR /app

# Set Go proxy to China mirror (faster in mainland)
ENV GOPROXY=https://goproxy.cn,direct

# Install CGO dependencies for SQLite
RUN apt-get update && apt-get install -y \
    gcc \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application (CGO enabled for SQLite)
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/main.go

# Final stage - use debian-slim for glibc compatibility
FROM debian:bookworm-slim

WORKDIR /root/

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy the binary from builder
COPY --from=builder /app/main .

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
CMD ["/root/main"]
