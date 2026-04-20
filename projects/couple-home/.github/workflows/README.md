# CI/CD 配置说明

## 概述

本项目使用 GitHub Actions 实现自动化 CI/CD 流程。

## 工作流程

### 触发条件
- **Push 到 master 分支**: 自动执行完整 CI/CD 流程（测试 → 构建 → 部署）
- **Pull Request**: 仅执行测试阶段

### 流程步骤

1. **测试阶段 (test)**
   - 设置 Go 1.21 和 Node.js 20 环境
   - Backend: 下载依赖、运行测试、构建检查
   - Frontend: 安装依赖、代码检查、构建

2. **构建和推送镜像 (build-and-push)**
   - 仅在 master 分支 push 时执行
   - 构建 Backend Docker 镜像
   - 构建 Frontend Docker 镜像
   - 推送到 Docker Hub

3. **部署到服务器 (deploy)**
   - 通过 SSH 连接服务器
   - 拉取最新镜像
   - 重启服务
   - 验证健康检查

4. **发送通知 (notify)**
   - 部署成功/失败时发送通知

## 必需的 GitHub Secrets

在项目设置中配置以下 Secrets：

| Secret 名称 | 说明 |
|------------|------|
| `DOCKERHUB_USERNAME` | Docker Hub 用户名 |
| `DOCKERHUB_TOKEN` | Docker Hub 访问令牌 |
| `SERVER_HOST` | 服务器 IP 地址或域名 |
| `SERVER_USER` | SSH 登录用户名 |
| `SERVER_SSH_KEY` | SSH 私钥 (用于部署) |

## 配置步骤

### 1. 创建 Docker Hub 仓库

```bash
# 创建 backend 仓库
docker login
docker create couple-home-backend

# 创建 frontend 仓库
docker create couple-home-frontend
```

### 2. 配置 GitHub Secrets

1. 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
2. 添加上述所有 Secrets

### 3. 服务器准备

在服务器上创建目录并配置 docker-compose.yml：

```bash
ssh user@server
sudo mkdir -p /opt/couple-home
cd /opt/couple-home
# 复制 docker-compose.yml 到服务器
```

### 4. 验证部署

```bash
# 查看部署状态
docker compose ps

# 查看日志
docker compose logs -f

# 测试健康检查
curl http://localhost:8080/health
```

## 故障排除

### 部署失败

1. 检查 GitHub Actions 日志
2. 验证 SSH 密钥配置
3. 确认服务器上的 Docker 服务正常运行

### 测试失败

```bash
# 本地运行测试
cd projects/couple-home
go test -v ./...

# 前端构建检查
cd projects/couple-home/h5-app
npm run build
```

## 手动触发部署

如需手动触发部署，可以创建一个空的 commit 并 push：

```bash
git commit --allow-empty -m "触发部署"
git push origin master
```
