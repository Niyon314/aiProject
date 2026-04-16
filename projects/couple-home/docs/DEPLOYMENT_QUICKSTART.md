# 🚀 情侣小家项目 - 快速部署指南

> **5 分钟完成 HTTPS 部署**

---

## ⚡ 快速开始 (推荐)

### 前提条件

1. ✅ 已购买域名 (如：`couple.example.com`)
2. ✅ 域名已解析到服务器 IP
3. ✅ 服务器 80/443 端口已开放

### 一键部署

```bash
# 进入项目目录
cd /root/.openclaw/workspace/projects/couple-home

# 运行部署脚本 (替换为你的域名和邮箱)
./deploy-ssl.sh couple.example.com admin@example.com
```

### 验证部署

```bash
# 测试 HTTPS 访问
curl -I https://couple.example.com

# 查看证书信息
echo | openssl s_client -connect couple.example.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 📋 手动部署 (备选)

如果自动脚本失败，可以手动执行:

### 步骤 1: 配置 DNS

登录域名服务商，添加 A 记录:

```
类型：A
主机记录：couple (或 @)
记录值：你的服务器 IP
TTL: 600
```

### 步骤 2: 更新配置

编辑 `docker-compose.yml`，替换:
- `couple.example.com` → 你的域名
- `admin@example.com` → 你的邮箱

### 步骤 3: 创建目录

```bash
mkdir -p ssl data certbot-www
```

### 步骤 4: 申请证书

```bash
# 停止现有容器
docker stop couple-home couple-home-backend

# 启动临时服务
docker-compose up -d frontend backend

# 申请证书
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@example.com \
  --agree-tos \
  --no-eff-email \
  -d couple.example.com

# 重启所有服务
docker-compose up -d
```

---

## 🔍 故障排查

### 问题 1: 证书申请失败

```bash
# 查看详细日志
docker-compose logs certbot

# 检查 DNS 解析
nslookup couple.example.com
ping couple.example.com

# 检查端口
netstat -tlnp | grep :80
```

### 问题 2: HTTPS 无法访问

```bash
# 检查容器状态
docker-compose ps

# 检查 nginx 日志
docker exec couple-home tail -f /var/log/nginx/error.log

# 检查证书文件
ls -la ssl/live/couple.example.com/
```

### 问题 3: 证书续期失败

```bash
# 手动测试续期
docker exec couple-certbot certbot renew --dry-run

# 强制续期
docker exec couple-certbot certbot renew --force-renewal

# 重启服务
docker-compose restart
```

---

## 📊 部署后检查清单

- [ ] HTTPS 访问正常
- [ ] HTTP 自动重定向到 HTTPS
- [ ] 浏览器显示安全锁标志
- [ ] 证书有效期 > 60 天
- [ ] 自动续期已配置
- [ ] API 接口正常工作
- [ ] 前端页面加载正常

---

## 🔄 日常维护

### 查看证书状态

```bash
# 查看证书有效期
docker exec couple-certbot certbot certificates

# 查看续期日志
docker exec couple-certbot cat /var/log/letsencrypt/letsencrypt.log
```

### 手动续期证书

```bash
docker exec couple-certbot certbot renew --force-renewal
docker restart couple-home
```

### 更新应用

```bash
# 拉取最新镜像
docker-compose pull

# 重启服务
docker-compose up -d
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f frontend
docker-compose logs -f backend
```

---

## 📞 需要帮助？

1. 查看详细文档：`docs/DEPLOYMENT_SSL.md`
2. 检查项目 README
3. 查看 GitHub Issues

---

*最后更新：2026-04-16*
