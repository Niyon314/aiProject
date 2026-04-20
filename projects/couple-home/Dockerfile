# 构建阶段
FROM golang:1.21-alpine AS builder

WORKDIR /app

# 安装必要的依赖
RUN apk add --no-cache git

# 复制 go.mod 和 go.sum
COPY go.mod go.sum ./

# 下载依赖
RUN go mod download

# 复制源代码
COPY . .

# 构建应用
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# 生产阶段
FROM alpine:latest

# 安装必要的运行时依赖
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# 复制构建产物
COPY --from=builder /app/main .

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["./main"]
