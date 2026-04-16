# 🚀 情侣小家项目 - 域名绑定与 SSL 证书配置指南

> **创建时间**: 2026-04-16  
> **当前状态**: HTTP 仅 (端口 80)  
> **目标状态**: HTTPS + 域名访问

---

## 📋 当前部署状态

### 运行中的容器

```bash
# 前端容器
CONTAINER ID: 568d94830c80
IMAGE: couple-home-frontend:latest
PORTS: 0.0.0.0:80->80/tcp
STATUS: Up 3 weeks

# 后端容器
CONTAINER ID: d3f06943ae11
IMAGE: couple-home-backend:latest
PORTS: 0.0.0.0:8080->8080/tcp
STATUS: Up 3 weeks (healthy)
```

### 当前配置

- **访问方式**: `http://<服务器IP>/`
- **nginx 配置**: 仅监听 80 端口
- **SSL 证书**: 未配置
- **域名**: 未绑定

---

## 🎯 部署目标

1. ✅ 绑定自定义域名 (如：`couple.example.com`)
2. ✅ 配置 HTTPS (Let's Encrypt 免费证书)
3. ✅ HTTP 自动重定向到 HTTPS
4. ✅ 证书自动续期

---

## 📝 前置准备

### 1. 域名准备

你需要一个已备案的域名 (中国大陆服务器必需) 或未备案域名 (海外服务器)。

**推荐域名服务商**:
- 阿里云 (万网)
- 腾讯云 (DNSPod)
- NameSilo / Namecheap (海外)

### 2. 服务器要求

- **公网 IP**: 确保服务器有公网 IP
- **端口开放**: 80 (HTTP) 和 443 (HTTPS) 端口需开放
- **DNS 解析**: 域名需解析到服务器 IP

### 3. 检查防火墙

```bash
# 检查防火墙状态
sudo ufw status

# 开放必要端口 (如果使用 ufw)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
```

---

## 🔧 配置步骤

### 方案一：使用 Docker Compose (推荐)

#### 步骤 1: 创建 docker-compose.yml

在项目根目录创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    image: couple-home-frontend:latest
    container_name: couple-home
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - certbot-www:/var/www/certbot
      - certbot-conf:/etc/letsencrypt
    environment:
      - DOMAIN_NAME=couple.example.com
      - EMAIL=admin@example.com
    depends_on:
      - backend
    networks:
      - couple-network
    restart: unless-stopped

  backend:
    image: couple-home-backend:latest
    container_name: couple-home-backend
    volumes:
      - ./data:/root/data
    environment:
      - DB_DRIVER=sqlite
      - DB_DSN=/root/data/couple_home.db
      - GIN_MODE=release
      - SERVER_PORT=8080
    networks:
      - couple-network
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  certbot:
    image: certbot/certbot:latest
    container_name: couple-certbot
    volumes:
      - ./ssl:/etc/letsencrypt
      - certbot-www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    networks:
      - couple-network
    restart: unless-stopped

volumes:
  certbot-www:
  certbot-conf:

networks:
  couple-network:
    driver: bridge
```

#### 步骤 2: 更新 nginx.conf

创建支持 HTTPS 的 nginx 配置:

```nginx
server {
    listen 80;
    server_name couple.example.com;
    
    # ACME 挑战路径 (Let's Encrypt 验证)
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # 其他所有请求重定向到 HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name couple.example.com;
    
    # SSL 证书路径
    ssl_certificate /etc/nginx/ssl/live/couple.example.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/couple.example.com/privkey.pem;
    
    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # API 反向代理 → 后端服务
    location /api/ {
        proxy_pass http://couple-home-backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 30s;
    }
    
    # 健康检查代理
    location /health {
        proxy_pass http://couple-home-backend:8080/health;
    }
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
```

#### 步骤 3: 配置 DNS 解析

登录你的域名服务商，添加 DNS 记录:

| 类型 | 主机记录 | 记录值 | TTL |
|------|----------|--------|-----|
| A | couple | 你的服务器 IP | 600 |
| A | @ | 你的服务器 IP (可选) | 600 |

**示例** (阿里云 DNS):
```
类型: A
主机记录: couple
记录值: 123.123.123.123 (你的服务器公网 IP)
TTL: 10 分钟
```

#### 步骤 4: 获取 SSL 证书

```bash
# 创建 SSL 目录
mkdir -p /root/.openclaw/workspace/projects/couple-home/ssl

# 启动服务 (先不启动 certbot)
cd /root/.openclaw/workspace/projects/couple-home
docker-compose up -d frontend backend

# 申请证书 (首次)
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@example.com \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d couple.example.com
```

#### 步骤 5: 重启服务

```bash
# 证书获取成功后，重启所有服务
docker-compose up -d
```

#### 步骤 6: 验证 HTTPS

```bash
# 测试 HTTP 重定向
curl -I http://couple.example.com

# 测试 HTTPS
curl -I https://couple.example.com

# 检查证书信息
echo | openssl s_client -connect couple.example.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

### 方案二：手动配置 (不使用 docker-compose)

如果你当前使用 `docker run` 部署，可以手动配置:

#### 步骤 1: 停止现有容器

```bash
docker stop couple-home
docker rm couple-home
```

#### 步骤 2: 创建 SSL 目录

```bash
mkdir -p /root/.openclaw/workspace/projects/couple-home/ssl
```

#### 步骤 3: 使用 Certbot 申请证书

```bash
# 安装 certbot (如果未安装)
apt-get update && apt-get install -y certbot

# 申请证书 (standalone 模式，需要停止 nginx)
docker stop couple-home  # 先停止占用 80 端口的容器

certbot certonly \
  --standalone \
  --email admin@example.com \
  --agree-tos \
  --no-eff-email \
  -d couple.example.com

# 证书位置：/etc/letsencrypt/live/couple.example.com/
```

#### 步骤 4: 更新 nginx 配置

参考方案一中的 nginx.conf，更新后重新启动容器:

```bash
docker run -d \
  --name couple-home \
  -p 80:80 \
  -p 443:443 \
  -v /root/.openclaw/workspace/projects/couple-home/h5-app/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  -v /etc/letsencrypt:/etc/nginx/ssl:ro \
  -v /var/www/certbot:/var/www/certbot \
  couple-home-frontend:latest
```

---

## 🔄 证书自动续期

Let's Encrypt 证书有效期为 90 天，需要定期续期。

### 使用 docker-compose (方案一)

certbot 容器已配置为每 12 小时检查续期。

### 手动续期 (方案二)

创建 cron 任务:

```bash
# 编辑 crontab
crontab -e

# 添加以下行 (每月 1 号凌晨 2 点检查续期)
0 2 1 * * docker exec couple-certbot certbot renew --quiet && docker restart couple-home
```

### 测试续期

```bash
# 手动测试续期 (不会真正续期，除非接近过期)
certbot renew --dry-run
```

---

## 📊 部署检查清单

- [ ] 域名已购买并解析到服务器 IP
- [ ] 服务器 80/443 端口已开放
- [ ] docker-compose.yml 已创建并配置域名
- [ ] nginx.conf 已更新为 HTTPS 配置
- [ ] SSL 证书已成功申请
- [ ] HTTPS 访问正常
- [ ] HTTP 自动重定向到 HTTPS
- [ ] 证书自动续期已配置
- [ ] 防火墙规则已配置
- [ ] 备份策略已设置

---

## 🛠️ 常见问题

### Q1: 证书申请失败，提示端口被占用

**解决**: 确保 80 端口在证书申请时未被占用:
```bash
# 停止占用 80 端口的容器
docker stop $(docker ps -q --filter "published-port=80")

# 申请证书
certbot certonly --standalone -d your-domain.com

# 重新启动服务
docker-compose up -d
```

### Q2: DNS 解析未生效

**解决**: 
```bash
# 检查 DNS 解析
nslookup couple.example.com
dig couple.example.com

# 等待 DNS 传播 (最多 48 小时，通常几分钟)
```

### Q3: 证书续期失败

**解决**:
```bash
# 查看详细错误
certbot renew --verbose

# 检查证书目录权限
ls -la /etc/letsencrypt/live/

# 手动续期
certbot renew --force-renewal
```

### Q4: HTTPS 访问显示不安全

**解决**:
1. 检查证书是否正确加载
2. 检查 nginx 配置中的证书路径
3. 确保使用完整证书链 (fullchain.pem)
4. 清除浏览器缓存后重试

---

## 📞 需要帮助？

如果遇到问题:

1. 检查容器日志: `docker-compose logs`
2. 检查 nginx 错误日志: `docker exec couple-home cat /var/log/nginx/error.log`
3. 检查 certbot 日志: `docker exec couple-certbot cat /var/log/letsencrypt/letsencrypt.log`

---

## 📝 附录：完整文件结构

```
/root/.openclaw/workspace/projects/couple-home/
├── docker-compose.yml          # Docker Compose 配置 (新建)
├── nginx.conf                  # Nginx 配置 (更新)
├── ssl/                        # SSL 证书目录 (新建)
│   └── live/
│       └── couple.example.com/
│           ├── fullchain.pem
│           └── privkey.pem
├── data/                       # 数据库目录
│   └── couple_home.db
├── h5-app/
│   ├── Dockerfile
│   └── nginx.conf
├── internal/                   # Go 后端代码
└── docs/
    └── DEPLOYMENT_SSL.md       # 本文档
```

---

*文档版本：v1.0*  
*最后更新：2026-04-16*
