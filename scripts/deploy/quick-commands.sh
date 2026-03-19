#!/bin/bash

# ===========================================
# 阿里云 ECS 快速部署 - 命令速查
# ===========================================

# ============================================================
# 第一步：服务器环境初始化（新服务器必做）
# ============================================================

# 方式1: 直接 SSH 到服务器运行
ssh root@你的服务器IP
curl -fsSL https://raw.githubusercontent.com/your-repo/main/scripts/deploy/init-server.sh | bash

# 方式2: 上传脚本后运行
scp scripts/deploy/init-server.sh root@你的服务器IP:/root/
ssh root@你的服务器IP "/root/init-server.sh"


# ============================================================
# 第二步：部署应用
# ============================================================

# 方式A: 从本地电脑部署（推荐）
# 在本地项目目录执行
./scripts/deploy/deploy-local.sh 你的服务器IP
# 例如: ./scripts/deploy/deploy-local.sh 123.45.67.89

# 方式B: 从 Git 仓库部署
# SSH 到服务器后执行
cd /var/www
git clone https://github.com/your-repo/maitaji.git
cd maitaji
./scripts/deploy/quick-deploy.sh https://github.com/your-repo/maitaji.git


# ============================================================
# 第三步：配置 HTTPS（可选）
# ============================================================

# SSH 到服务器执行
./scripts/deploy/setup-https.sh your-domain.com


# ============================================================
# 日常运维命令
# ============================================================

# 查看应用状态
pm2 status

# 查看日志
pm2 logs maitaji

# 重启应用
pm2 restart maitaji

# 更新应用
cd /var/www/maitaji
./scripts/deploy/update.sh

# 回滚版本
./scripts/deploy/rollback.sh


# ============================================================
# 一键部署命令（复制粘贴）
# ============================================================

# 完整部署流程（从本地）
./scripts/deploy/deploy-local.sh 你的服务器IP root 22

# 完整部署流程（从服务器）
# 先初始化环境，再一键部署
curl -fsSL https://raw.githubusercontent.com/your-repo/main/scripts/deploy/init-server.sh | bash && \
cd /var/www && \
git clone https://github.com/your-repo/maitaji.git && \
cd maitaji && \
./scripts/deploy/quick-deploy.sh https://github.com/your-repo/maitaji.git


# ============================================================
# 配置文件模板
# ============================================================

# 创建环境变量文件（在服务器上执行）
cat > /var/www/maitaji/.env.local << 'EOF'
COZE_SUPABASE_URL=https://xxx.supabase.co
COZE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
COZE_PROJECT_ENV=PROD
NODE_ENV=production
EOF
