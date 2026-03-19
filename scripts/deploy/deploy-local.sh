#!/bin/bash

# ===========================================
# 本地自动部署脚本
# 使用方法: ./deploy-local.sh [服务器IP] [用户名]
# ===========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# 配置
SERVER_HOST=${1:-}
SERVER_USER=${2:-root}
SERVER_PORT=${3:-22}
PROJECT_NAME="maitaji"
REMOTE_DIR="/var/www/$PROJECT_NAME"
LOCAL_DIR=$(pwd)
BUILD_DIR=".next"

# 显示使用说明
show_usage() {
    echo "使用方法: $0 <服务器IP> [用户名] [端口]"
    echo ""
    echo "示例:"
    echo "  $0 123.45.67.89"
    echo "  $0 123.45.67.89 root"
    echo "  $0 123.45.67.89 deploy 22"
    exit 1
}

# 检查参数
check_args() {
    if [ -z "$SERVER_HOST" ]; then
        print_error "缺少服务器 IP 参数"
        show_usage
    fi
}

# 检查必要工具
check_tools() {
    print_step "检查必要工具..."
    
    local missing=()
    
    command -v rsync >/dev/null 2>&1 || missing+=("rsync")
    command -v ssh >/dev/null 2>&1 || missing+=("openssh-client")
    
    if [ ${#missing[@]} -gt 0 ]; then
        print_error "缺少以下工具: ${missing[*]}"
        echo "请安装后重试:"
        echo "  Ubuntu/Debian: sudo apt install ${missing[*]}"
        echo "  macOS: brew install ${missing[*]}"
        exit 1
    fi
    
    print_info "工具检查通过"
}

# 测试 SSH 连接
test_ssh_connection() {
    print_step "测试 SSH 连接..."
    
    if ssh -o ConnectTimeout=10 -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "echo '连接成功'" 2>/dev/null; then
        print_info "SSH 连接成功"
    else
        print_error "无法连接到服务器 $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
        print_warn "请检查:"
        echo "  1. 服务器 IP 是否正确"
        echo "  2. SSH 服务是否运行"
        echo "  3. 用户名和密码/密钥是否正确"
        echo "  4. 防火墙/安全组是否开放 $SERVER_PORT 端口"
        exit 1
    fi
}

# 本地构建
build_local() {
    print_step "本地构建项目..."
    
    # 检查是否已安装依赖
    if [ ! -d "node_modules" ]; then
        print_info "安装依赖..."
        pnpm install
    fi
    
    # 构建
    print_info "执行构建..."
    pnpm run build
    
    if [ ! -d "$BUILD_DIR" ]; then
        print_error "构建失败，未找到 $BUILD_DIR 目录"
        exit 1
    fi
    
    print_info "构建完成"
}

# 打包项目
package_project() {
    print_step "打包项目文件..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local package_name="${PROJECT_NAME}_${timestamp}.tar.gz"
    
    # 排除不需要的文件
    tar --exclude='node_modules/.cache' \
        --exclude='.git' \
        --exclude='*.log' \
        --exclude='.env.local' \
        -czvf /tmp/$package_name \
        --transform "s,^,$PROJECT_NAME/," \
        package.json pnpm-lock.yaml .next public src .coze scripts 2>/dev/null || true
    
    echo $package_name > /tmp/last_package_name
    
    print_info "打包完成: /tmp/$package_name"
}

# 上传到服务器
upload_to_server() {
    print_step "上传文件到服务器..."
    
    local package_name=$(cat /tmp/last_package_name)
    local remote_tmp="/tmp/$package_name"
    
    # 在服务器上创建目录
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "mkdir -p $REMOTE_DIR /tmp"
    
    # 上传压缩包
    scp -P $SERVER_PORT /tmp/$package_name $SERVER_USER@$SERVER_HOST:$remote_tmp
    
    # 清理本地临时文件
    rm -f /tmp/$package_name /tmp/last_package_name
    
    print_info "上传完成"
}

# 远程部署
remote_deploy() {
    print_step "远程部署..."
    
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST bash << 'REMOTE_SCRIPT'
set -e

PROJECT_DIR="/var/www/maitaji"
BACKUP_DIR="/var/www/backups"

echo ">>> 创建备份目录..."
mkdir -p $BACKUP_DIR

# 备份旧版本
if [ -d "$PROJECT_DIR" ]; then
    echo ">>> 备份当前版本..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    if [ "$(ls -A $PROJECT_DIR 2>/dev/null)" ]; then
        mv $PROJECT_DIR $BACKUP_DIR/maitaji_$TIMESTAMP
    fi
fi

# 解压新版本
echo ">>> 解压新版本..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR
tar -xzvf /tmp/maitaji_*.tar.gz --strip-components=1
rm -f /tmp/maitaji_*.tar.gz

# 安装依赖
echo ">>> 安装依赖..."
if [ -f "pnpm-lock.yaml" ]; then
    pnpm install --prefer-offline
else
    pnpm install
fi

echo ">>> 部署完成!"
REMOTE_SCRIPT

    print_info "远程部署完成"
}

# 配置环境变量
configure_env() {
    print_step "配置环境变量..."
    
    # 检查是否有 .env.local 文件
    if [ ! -f ".env.local" ]; then
        print_warn "未找到 .env.local 文件"
        echo ""
        echo "请在服务器上创建 .env.local 文件:"
        echo "  ssh $SERVER_USER@$SERVER_HOST"
        echo "  nano $REMOTE_DIR/.env.local"
        echo ""
        echo "添加以下内容:"
        echo "  COZE_SUPABASE_URL=https://xxx.supabase.co"
        echo "  COZE_SUPABASE_ANON_KEY=your-key"
        echo "  COZE_PROJECT_ENV=PROD"
        echo "  NODE_ENV=production"
        echo ""
        read -p "按回车继续..."
    else
        print_info "发现 .env.local 文件，是否上传到服务器?"
        read -p "上传? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            scp -P $SERVER_PORT .env.local $SERVER_USER@$SERVER_HOST:$REMOTE_DIR/.env.local
            print_info "环境变量文件已上传"
        fi
    fi
}

# 启动应用
start_app() {
    print_step "启动应用..."
    
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST bash << 'REMOTE_SCRIPT'
set -e

PROJECT_DIR="/var/www/maitaji"
cd $PROJECT_DIR

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo ">>> 安装 PM2..."
    npm install -g pm2
fi

# 停止旧进程
pm2 stop maitaji 2>/dev/null || true
pm2 delete maitaji 2>/dev/null || true

# 启动新进程
echo ">>> 启动应用..."
PORT=5000 pm2 start "pnpm run start" --name maitaji

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup | tail -1 | bash 2>/dev/null || true

# 显示状态
pm2 status

echo ">>> 应用启动完成!"
REMOTE_SCRIPT

    print_info "应用已启动"
}

# 配置 Nginx
configure_nginx() {
    print_step "配置 Nginx..."
    
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST bash << 'REMOTE_SCRIPT'
set -e

NGINX_CONF="/etc/nginx/sites-available/maitaji"

# 检查配置是否已存在
if [ -f "$NGINX_CONF" ]; then
    echo ">>> Nginx 配置已存在，跳过..."
else
    echo ">>> 创建 Nginx 配置..."
    cat > $NGINX_CONF << 'EOF'
server {
    listen 80;
    server_name _;
    
    access_log /var/log/nginx/maitaji.access.log;
    error_log /var/log/nginx/maitaji.error.log;
    
    client_max_body_size 20M;
    
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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
    
    # 启用配置
    ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
    
    # 删除默认配置
    rm -f /etc/nginx/sites-enabled/default
    
    # 测试并重载
    nginx -t && systemctl reload nginx
    
    echo ">>> Nginx 配置完成!"
fi

# 显示 Nginx 状态
systemctl status nginx --no-pager -l
REMOTE_SCRIPT

    print_info "Nginx 配置完成"
}

# 显示结果
show_result() {
    echo ""
    echo "================================================"
    echo "    部署成功！"
    echo "================================================"
    echo ""
    echo "访问地址: http://$SERVER_HOST"
    echo ""
    echo "常用命令:"
    echo "  查看状态: ssh $SERVER_USER@$SERVER_HOST 'pm2 status'"
    echo "  查看日志: ssh $SERVER_USER@$SERVER_HOST 'pm2 logs maitaji'"
    echo "  重启应用: ssh $SERVER_USER@$SERVER_HOST 'pm2 restart maitaji'"
    echo ""
    echo "文件位置:"
    echo "  项目目录: $REMOTE_DIR"
    echo "  备份目录: /var/www/backups"
    echo ""
    echo "================================================"
}

# 主函数
main() {
    echo ""
    echo "================================================"
    echo "    麦塔记 - 自动部署脚本"
    echo "================================================"
    echo ""
    echo "服务器: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
    echo "项目目录: $REMOTE_DIR"
    echo ""
    
    check_args
    check_tools
    test_ssh_connection
    build_local
    package_project
    upload_to_server
    remote_deploy
    configure_env
    start_app
    configure_nginx
    show_result
}

# 执行
main
