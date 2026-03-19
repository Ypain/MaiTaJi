# 阿里云 ECS 部署指南

## 一、准备工作

### 1.1 ECS 服务器要求
- **实例规格**：推荐 2核4G 以上
- **操作系统**：Ubuntu 22.04 或 CentOS 8+
- **公网带宽**：建议 3Mbps 以上

### 1.2 需要准备的信息
- ECS 公网 IP 地址
- SSH 登录密码或密钥
- 域名（可选，需要备案）

---

## 二、安全组配置（重要！）

在阿里云控制台配置安全组规则：

| 协议 | 端口范围 | 授权对象 | 说明 |
|------|----------|----------|------|
| TCP | 22 | 0.0.0.0/0 | SSH 登录 |
| TCP | 80 | 0.0.0.0/0 | HTTP |
| TCP | 443 | 0.0.0.0/0 | HTTPS |
| TCP | 5000 | 127.0.0.1 | 应用端口（仅本地） |

---

## 三、连接服务器

```bash
# 方式1: 密码登录
ssh root@你的公网IP

# 方式2: 密钥登录（推荐）
ssh -i ~/.ssh/your-key.pem root@你的公网IP
```

---

## 四、服务器环境配置

### 4.1 更新系统

```bash
# Ubuntu
apt update && apt upgrade -y

# CentOS
yum update -y
```

### 4.2 安装 Node.js

```bash
# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 验证
node -v  # 应显示 v20.x.x
npm -v

# 安装 pnpm
npm install -g pnpm

# 安装 PM2（进程管理）
npm install -g pm2
```

### 4.3 安装 Nginx

```bash
apt install -y nginx

# 启动并设置开机自启
systemctl start nginx
systemctl enable nginx

# 验证
systemctl status nginx
```

---

## 五、上传项目代码

### 方式1: 使用 Git（推荐）

```bash
# 安装 git
apt install -y git

# 创建目录
mkdir -p /var/www
cd /var/www

# 克隆代码
git clone https://your-repo-url.git maitaji
cd maitaji
```

### 方式2: 使用 SCP 上传

在本地电脑执行：

```bash
# 打包项目
tar -czvf maitaji.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  .

# 上传到服务器
scp maitaji.tar.gz root@你的公网IP:/var/www/

# SSH 到服务器解压
ssh root@你的公网IP
cd /var/www
tar -xzvf maitaji.tar.gz -C maitaji
cd maitaji
```

---

## 六、配置环境变量

### 6.1 创建环境配置文件

```bash
cd /var/www/maitaji

# 创建环境变量文件
nano .env.local
```

### 6.2 填写配置内容

```bash
# 数据库配置（使用 Supabase）
COZE_SUPABASE_URL=https://xxxxxxxx.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 对象存储配置（使用阿里云 OSS）
COZE_OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
COZE_OSS_BUCKET=your-bucket-name
COZE_OSS_ACCESS_KEY=your-access-key-id
COZE_OSS_SECRET_KEY=your-access-key-secret
COZE_OSS_REGION=oss-cn-hangzhou

# 环境标识
COZE_PROJECT_ENV=PROD
NODE_ENV=production
```

> **获取 Supabase 配置**：
> 1. 访问 https://supabase.com 注册账号
> 2. 创建新项目
> 3. 进入 Settings > API 获取 URL 和 anon key

---

## 七、安装依赖和构建

```bash
cd /var/www/maitaji

# 安装依赖
pnpm install

# 构建项目
pnpm run build

# 构建成功后会显示：
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
```

---

## 八、启动应用

### 8.1 使用 PM2 启动

```bash
# 创建 PM2 配置文件
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'maitaji',
    script: 'pnpm',
    args: 'run start',
    cwd: '/var/www/maitaji',
    env: {
      PORT: 5000,
      NODE_ENV: 'production'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

```bash
# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs maitaji

# 设置开机自启
pm2 startup
pm2 save
```

### 8.2 验证应用运行

```bash
# 本地测试
curl http://localhost:5000

# 应返回 HTML 内容
```

---

## 九、配置 Nginx 反向代理

### 9.1 创建 Nginx 配置

```bash
nano /etc/nginx/sites-available/maitaji
```

**HTTP 配置（先用 HTTP 测试）：**

```nginx
server {
    listen 80;
    server_name 你的域名或IP;

    # 访问日志
    access_log /var/log/nginx/maitaji.access.log;
    error_log /var/log/nginx/maitaji.error.log;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        
        # WebSocket 支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # 传递真实 IP
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 9.2 启用配置

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/maitaji /etc/nginx/sites-enabled/

# 删除默认配置（可选）
rm /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重载配置
systemctl reload nginx
```

### 9.3 验证访问

在浏览器访问：`http://你的公网IP`

---

## 十、配置 HTTPS（推荐）

### 方式1: 使用阿里云免费 SSL 证书

1. **申请证书**
   - 登录阿里云控制台
   - 搜索「SSL 证书」
   - 购买免费证书（DV 单域名）
   - 填写域名信息并验证

2. **下载证书**
   - 证书签发后，下载 Nginx 版本
   - 解压得到 `.pem` 和 `.key` 文件

3. **上传证书到服务器**

```bash
# 创建证书目录
mkdir -p /etc/nginx/ssl

# 上传证书文件（在本地执行）
scp your-domain.pem root@你的IP:/etc/nginx/ssl/
scp your-domain.key root@你的IP:/etc/nginx/ssl/
```

4. **修改 Nginx 配置**

```bash
nano /etc/nginx/sites-available/maitaji
```

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name 你的域名;
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name 你的域名;

    # SSL 证书
    ssl_certificate /etc/nginx/ssl/your-domain.pem;
    ssl_certificate_key /etc/nginx/ssl/your-domain.key;
    
    # SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **重载 Nginx**

```bash
nginx -t && systemctl reload nginx
```

### 方式2: 使用 Let's Encrypt（免费自动续期）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 申请证书（需先配置域名解析）
certbot --nginx -d 你的域名

# 自动续期测试
certbot renew --dry-run
```

---

## 十一、域名配置

### 11.1 域名解析

在阿里云域名控制台添加解析记录：

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| A | @ | 你的公网IP |
| A | www | 你的公网IP |

### 11.2 域名备案（中国大陆必须）

1. 登录阿里云控制台
2. 进入「ICP 备案」
3. 按照流程提交备案资料
4. 等待审核（约 7-20 天）

---

## 十二、数据库配置

### 方式1: 使用 Supabase（推荐，免费）

1. 访问 https://supabase.com 创建项目
2. 在 SQL Editor 中执行建表语句：

```sql
-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar TEXT,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 商品表
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    price DECIMAL(10, 2),
    category VARCHAR(100),
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 收藏表
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_favorites_user ON favorites(user_id);
```

### 方式2: 使用阿里云 RDS（付费）

如需使用阿里云数据库，需要修改代码中的数据库连接方式。

---

## 十三、对象存储配置

### 使用阿里云 OSS 存储图片

1. **创建 OSS Bucket**
   - 登录阿里云控制台
   - 开通 OSS 服务
   - 创建 Bucket（选择与 ECS 同地域）
   - 设置为公共读

2. **创建 AccessKey**
   - 进入 AccessKey 管理
   - 创建 AccessKey
   - 记录 AccessKey ID 和 Secret

3. **配置环境变量**

```bash
# 添加到 .env.local
COZE_OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
COZE_OSS_BUCKET=your-bucket-name
COZE_OSS_ACCESS_KEY=your-access-key-id
COZE_OSS_SECRET_KEY=your-access-key-secret
COZE_OSS_REGION=oss-cn-hangzhou
```

---

## 十四、常用运维命令

### PM2 相关

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs maitaji

# 重启应用
pm2 restart maitaji

# 停止应用
pm2 stop maitaji

# 监控
pm2 monit
```

### Nginx 相关

```bash
# 测试配置
nginx -t

# 重载配置
systemctl reload nginx

# 查看日志
tail -f /var/log/nginx/maitaji.access.log
tail -f /var/log/nginx/maitaji.error.log
```

### 系统监控

```bash
# CPU 和内存使用
htop

# 磁盘使用
df -h

# 网络连接
netstat -tuln
```

---

## 十五、自动化部署脚本

创建自动部署脚本：

```bash
nano /var/www/maitaji/deploy.sh
```

```bash
#!/bin/bash

echo "=== 开始部署 ==="
cd /var/www/maitaji

# 拉取最新代码
echo ">>> 拉取代码..."
git pull origin main

# 安装依赖
echo ">>> 安装依赖..."
pnpm install

# 构建
echo ">>> 构建项目..."
pnpm run build

# 重启服务
echo ">>> 重启服务..."
pm2 restart maitaji

echo "=== 部署完成 ==="
```

```bash
# 添加执行权限
chmod +x deploy.sh
```

---

## 十六、故障排查

### 无法访问网站

1. 检查安全组是否开放端口
2. 检查 Nginx 是否运行：`systemctl status nginx`
3. 检查应用是否运行：`pm2 status`
4. 检查防火墙：`ufw status`

### 502 Bad Gateway

1. 检查应用是否运行：`pm2 logs maitaji`
2. 检查端口是否正确：`curl http://localhost:5000`

### 数据库连接失败

1. 检查环境变量是否正确
2. 检查 Supabase 项目是否正常运行
3. 查看 PM2 日志：`pm2 logs maitaji`

---

## 十七、成本估算

| 服务 | 配置 | 月费用（参考） |
|------|------|---------------|
| ECS | 2核4G | ¥100-200 |
| 带宽 | 3Mbps | ¥30-50 |
| 域名 | .com | ¥50/年 |
| SSL证书 | 免费 | ¥0 |
| Supabase | 免费版 | ¥0 |
| OSS | 按量付费 | ¥10-30 |
| **合计** | | **¥150-300/月** |

---

## 需要帮助？

如果在部署过程中遇到问题，请告诉我具体的错误信息，我会帮你解决！
