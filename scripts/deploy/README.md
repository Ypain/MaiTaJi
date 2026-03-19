# 部署脚本使用指南

本目录包含一套完整的自动化部署脚本，支持快速部署到阿里云 ECS 服务器。

## 📁 脚本说明

| 脚本 | 用途 | 运行位置 |
|------|------|----------|
| `init-server.sh` | 服务器环境初始化 | 服务器端 |
| `deploy-local.sh` | 本地一键部署 | 本地电脑 |
| `quick-deploy.sh` | 服务器端一键部署 | 服务器端 |
| `update.sh` | 更新已部署的应用 | 服务器端 |
| `rollback.sh` | 回滚到历史版本 | 服务器端 |
| `setup-https.sh` | 配置 HTTPS 证书 | 服务器端 |

---

## 🚀 快速开始

### 方式一：本地一键部署（推荐）

适合：从本地电脑直接部署到服务器

```bash
# 1. 给脚本添加执行权限
chmod +x scripts/deploy/*.sh

# 2. 运行部署脚本
./scripts/deploy/deploy-local.sh 你的服务器IP

# 示例
./scripts/deploy/deploy-local.sh 123.45.67.89
./scripts/deploy/deploy-local.sh 123.45.67.89 root
```

### 方式二：服务器端一键部署

适合：服务器已安装环境，从 Git 拉取代码部署

```bash
# 1. 上传脚本到服务器
scp -r scripts/deploy root@你的IP:/var/www/

# 2. SSH 到服务器
ssh root@你的IP

# 3. 运行一键部署
cd /var/www/deploy
chmod +x *.sh
./quick-deploy.sh https://github.com/user/maitaji.git
```

---

## 📋 详细步骤

### 第一步：初始化服务器环境

如果是新服务器，先运行环境初始化脚本：

```bash
# SSH 到服务器
ssh root@你的服务器IP

# 运行初始化脚本
curl -fsSL https://your-domain/init-server.sh | bash

# 或者手动下载运行
wget https://your-domain/init-server.sh
chmod +x init-server.sh
./init-server.sh
```

初始化内容包括：
- 更新系统软件包
- 安装 Node.js 20.x
- 安装 pnpm 和 PM2
- 安装 Nginx
- 配置防火墙
- 创建项目目录

### 第二步：部署应用

**方式 A：从本地部署**

```bash
# 在本地项目目录执行
./scripts/deploy/deploy-local.sh 你的服务器IP

# 脚本会自动：
# 1. 构建项目
# 2. 打包并上传到服务器
# 3. 安装依赖
# 4. 启动应用
# 5. 配置 Nginx
```

**方式 B：从 Git 部署**

```bash
# 在服务器上执行
./scripts/deploy/quick-deploy.sh https://github.com/user/maitaji.git main

# 脚本会自动：
# 1. 克隆代码
# 2. 配置环境变量
# 3. 安装依赖并构建
# 4. 启动应用
# 5. 配置 Nginx
```

### 第三步：配置 HTTPS（可选但推荐）

```bash
# 在服务器上执行
./scripts/deploy/setup-https.sh your-domain.com

# 脚本会自动：
# 1. 检查域名解析
# 2. 申请 Let's Encrypt 证书
# 3. 配置 Nginx HTTPS
# 4. 设置自动续期
```

---

## 🔄 日常运维

### 更新应用

```bash
# SSH 到服务器
ssh root@你的IP

# 进入项目目录
cd /var/www/maitaji

# 运行更新脚本
./scripts/deploy/update.sh

# 或指定分支
./scripts/deploy/update.sh develop
```

### 回滚版本

```bash
# SSH 到服务器
ssh root@你的IP

# 运行回滚脚本
cd /var/www/maitaji
./scripts/deploy/rollback.sh

# 或直接指定备份
./scripts/deploy/rollback.sh backup_20240315_120000
```

### 常用命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs maitaji

# 重启应用
pm2 restart maitaji

# 查看 Nginx 日志
tail -f /var/log/nginx/maitaji.access.log
tail -f /var/log/nginx/maitaji.error.log

# 查看 SSL 证书状态
certbot certificates

# 手动续期证书
certbot renew
```

---

## ⚙️ 配置文件

### 环境变量 (.env.local)

部署后需要在服务器上创建 `.env.local` 文件：

```bash
# SSH 到服务器
ssh root@你的IP

# 编辑配置文件
nano /var/www/maitaji/.env.local
```

配置内容：

```bash
# 数据库配置
COZE_SUPABASE_URL=https://xxx.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key

# 对象存储配置（可选）
COZE_OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
COZE_OSS_BUCKET=your-bucket
COZE_OSS_ACCESS_KEY=your-key
COZE_OSS_SECRET_KEY=your-secret

# 环境标识
COZE_PROJECT_ENV=PROD
NODE_ENV=production
```

---

## 🛠️ 故障排查

### 1. SSH 连接失败

```bash
# 检查服务器是否可达
ping 你的服务器IP

# 检查 SSH 端口是否开放
telnet 你的服务器IP 22

# 检查阿里云安全组规则
# 确保开放了 22 端口
```

### 2. 应用启动失败

```bash
# 查看详细日志
pm2 logs maitaji --lines 100

# 检查环境变量
cat /var/www/maitaji/.env.local

# 手动测试启动
cd /var/www/maitaji
PORT=5000 pnpm run start
```

### 3. Nginx 502 错误

```bash
# 检查应用是否运行
pm2 status

# 检查端口是否监听
ss -tlnp | grep 5000

# 检查 Nginx 配置
nginx -t
```

### 4. HTTPS 证书申请失败

```bash
# 检查域名解析
dig +short your-domain.com

# 检查 80 端口是否开放
curl -I http://your-domain.com

# 查看 Certbot 日志
tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## 📊 性能优化

### PM2 集群模式

编辑 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'maitaji',
    script: 'pnpm',
    args: 'run start',
    instances: 'max',  // 使用所有 CPU 核心
    exec_mode: 'cluster',
    // ...其他配置
  }]
}
```

### Nginx 缓存

在 Nginx 配置中添加：

```nginx
# 在 http 块中
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=app_cache:10m max_size=100m inactive=60m;

# 在 location 块中
proxy_cache app_cache;
proxy_cache_valid 200 60m;
proxy_cache_key $scheme$request_method$host$request_uri;
```

---

## 🔐 安全建议

1. **修改 SSH 端口**
   ```bash
   nano /etc/ssh/sshd_config
   # Port 22 -> Port 2222
   systemctl restart sshd
   ```

2. **禁用 root 登录**
   ```bash
   # 创建普通用户
   adduser deploy
   usermod -aG sudo deploy
   
   # 禁用 root SSH 登录
   nano /etc/ssh/sshd_config
   # PermitRootLogin no
   ```

3. **配置防火墙**
   ```bash
   ufw allow 2222/tcp  # 修改后的 SSH 端口
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

4. **定期更新系统**
   ```bash
   apt update && apt upgrade -y
   ```

---

## 📞 获取帮助

如果遇到问题，请检查：

1. 服务器日志：`/var/log/nginx/error.log`
2. 应用日志：`pm2 logs maitaji`
3. 系统日志：`/var/log/syslog`

或联系技术支持。
