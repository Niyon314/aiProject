#!/bin/bash

# 情侣小家项目 - SSL 证书部署脚本
# 用法：./deploy-ssl.sh your-domain.com your-email@example.com

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 参数检查
if [ $# -lt 2 ]; then
    echo -e "${RED}错误：缺少参数${NC}"
    echo "用法：$0 <域名> <邮箱>"
    echo "示例：$0 couple.example.com admin@example.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2
PROJECT_DIR="/root/.openclaw/workspace/projects/couple-home"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  情侣小家项目 - SSL 证书部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "域名：${YELLOW}${DOMAIN}${NC}"
echo -e "邮箱：${YELLOW}${EMAIL}${NC}"
echo -e "项目目录：${YELLOW}${PROJECT_DIR}${NC}"
echo ""

# 确认执行
read -p "确认继续？(y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}部署已取消${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# 步骤 1: 检查 Docker
echo -e "\n${GREEN}[1/6] 检查 Docker 环境...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误：Docker 未安装${NC}"
    exit 1
fi
docker --version
echo -e "${GREEN}✓ Docker 已安装${NC}"

# 步骤 2: 检查 docker-compose
echo -e "\n${GREEN}[2/6] 检查 Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}警告：Docker Compose 未安装，尝试使用 docker compose (v2)${NC}"
    COMPOSE_CMD="docker compose"
else
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi
fi
$COMPOSE_CMD version
echo -e "${GREEN}✓ Docker Compose 已就绪${NC}"

# 步骤 3: 创建必要目录
echo -e "\n${GREEN}[3/6] 创建目录结构...${NC}"
mkdir -p "$PROJECT_DIR/ssl"
mkdir -p "$PROJECT_DIR/data"
mkdir -p "$PROJECT_DIR/certbot-www"
echo -e "${GREEN}✓ 目录已创建${NC}"

# 步骤 4: 更新配置文件中的域名
echo -e "\n${GREEN}[4/6] 更新配置文件...${NC}"

# 更新 nginx.conf
if [ -f "$PROJECT_DIR/nginx.conf" ]; then
    sed -i "s/couple.example.com/${DOMAIN}/g" "$PROJECT_DIR/nginx.conf"
    echo -e "${GREEN}✓ nginx.conf 已更新${NC}"
else
    echo -e "${RED}错误：nginx.conf 不存在${NC}"
    exit 1
fi

# 更新 docker-compose.yml
if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
    sed -i "s/couple.example.com/${DOMAIN}/g" "$PROJECT_DIR/docker-compose.yml"
    sed -i "s/admin@example.com/${EMAIL}/g" "$PROJECT_DIR/docker-compose.yml"
    echo -e "${GREEN}✓ docker-compose.yml 已更新${NC}"
else
    echo -e "${RED}错误：docker-compose.yml 不存在${NC}"
    exit 1
fi

# 步骤 5: 停止现有容器
echo -e "\n${GREEN}[5/6] 停止现有容器...${NC}"
docker stop couple-home 2>/dev/null || true
docker rm couple-home 2>/dev/null || true
docker stop couple-home-backend 2>/dev/null || true
docker rm couple-home-backend 2>/dev/null || true
docker stop couple-certbot 2>/dev/null || true
docker rm couple-certbot 2>/dev/null || true
echo -e "${GREEN}✓ 容器已停止${NC}"

# 步骤 6: 启动服务并申请证书
echo -e "\n${GREEN}[6/6] 启动服务并申请 SSL 证书...${NC}"

# 先启动前端和后端 (不启动 certbot)
echo "启动前端和后端服务..."
$COMPOSE_CMD up -d frontend backend

# 等待服务启动
sleep 5

# 申请证书
echo "申请 Let's Encrypt 证书..."
$COMPOSE_CMD run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d "$DOMAIN"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 证书申请成功！${NC}"
    
    # 重启所有服务 (包括 certbot)
    echo "重启所有服务..."
    $COMPOSE_CMD up -d
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  部署完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "访问地址：${YELLOW}https://${DOMAIN}${NC}"
    echo -e "证书有效期：${YELLOW}90 天 (自动续期)${NC}"
    echo ""
    echo "下一步:"
    echo "1. 确保域名 DNS 已解析到服务器 IP"
    echo "2. 访问 https://${DOMAIN} 测试"
    echo "3. 检查证书：curl -I https://${DOMAIN}"
    echo ""
else
    echo -e "${RED}✗ 证书申请失败${NC}"
    echo "请检查:"
    echo "1. 域名 DNS 解析是否正确"
    echo "2. 80 端口是否开放"
    echo "3. 防火墙设置"
    exit 1
fi
