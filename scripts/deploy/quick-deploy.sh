#!/bin/bash

# ===========================================
# 一键部署脚本（服务器端）
# 使用方法: curl -fsSL http://your-server/deploy.sh | bash -s -- <git-repo> [branch]
# 或者直接运行: ./quick-deploy.sh <git-repo> [branch]
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
GIT_REPO=${1:-}
BRANCH=${2:-main}
PROJECT_NAME="maitaji"
PROJECT_DIR="/var/www/$PROJECT_NAME"

# 显示使用说明
show_usage() {
    echo "使用方法: $0 <git仓库地址> [分支名]"
    echo ""
    echo "示例:"
    echo "  $0 https://github.com/user/maitaji.git"
    echo "  $0 https://github.com/user/maitaji.git develop"
    exit 1
}

# 检查参数
check_args() {
    if [ -z "$GIT_REPO" ]; then
        print_error "缺少 Git 仓库地址"
        show_usage
    fi
}

# 检查并安装依赖
check_dependencies() {
    print_step "检查依赖..."
    
    local missing=()
    
    command -v git >/dev/null 2>&1 || missing+=("git")
    command -v node >/dev/null 2>&1 || missing+=("nodejs")
    command -v pnpm >/dev/null 2>&1 || missing+=("pnpm")
    command -v pm2 >/dev/null 2>&1 || missing+=("pm2")
    
    if [ ${#missing[@]} -gt 0 ]; then
        print_error "缺少以下依赖: ${missing[*]}"
        echo ""
        echo "请先运行环境初始化脚本:"
        echo "  curl -fsSL http://your-server/init-server.sh | bash"
        exit 1
    fi
    
    print_info "依赖检查通过"
    print_info "Node.js: $(node -v)"
    print_info "pnpm: $(pnpm -v)"
}

# 克隆或更新代码
clone_or_update() {
    print_step "获取代码..."
    
    if [ -d "$PROJECT_DIR/.git" ]; then
        print_info "项目已存在，更新代码..."
        cd $PROJECT_DIR
        git fetch origin
        git checkout $BRANCH
        git pull origin $BRANCH
    else
        print_info "克隆项目..."
        rm -rf $PROJECT_DIR
        git clone -b $BRANCH $GIT_REPO $PROJECT_DIR
        cd $PROJECT_DIR
    fi
    
    print_info "代码获取完成"
}

# 配置环境变量
setup_env() {
    print_step "配置环境变量..."
    
    if [ -f ".env.local" ]; then
        print_warn ".env.local 已存在，跳过"
        return
    fi
    
    print_warn "未找到 .env.local 文件"
    echo ""
    echo "请配置以下环境变量:"
    echo ""
    echo "  COZE_SUPABASE_URL=https://xxx.supabase.co"
    echo "  COZE_SUPABASE_ANON_KEY=your-anon-key"
    echo "  COZE_PROJECT_ENV=PROD"
    echo "  NODE_ENV=production"
    echo ""
    read -p "是否现在配置? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        nano .env.local
    else
        print_error "请手动创建 .env.local 文件后重新运行"
        exit 1
    fi
}

# 安装依赖
install_deps() {
    print_step "安装依赖..."
    pnpm install
    print_info "依赖安装完成"
}

# 构建项目
build_project() {
    print_step "构建项目..."
    pnpm run build
    print_info "构建完成"
}

# 配置 PM2
setup_pm2() {
    print_step "配置 PM2..."
    
    # 停止旧进程
    pm2 stop $PROJECT_NAME 2>/dev/null || true
    pm2 delete $PROJECT_NAME 2>/dev/null || true
    
    # 创建 PM2 配置文件
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$PROJECT_NAME',
    script: 'pnpm',
    args: 'run start',
    cwd: '$PROJECT_DIR',
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
EOF
    
    # 启动应用
    pm2 start ecosystem.config.js
    
    # 保存配置
    pm2 save
    
    # 设置开机自启
    pm2 startup | tail -1 | bash 2>/dev/null || true
    
    print_info "PM2 配置完成"
}

# 配置 Nginx
setup_nginx() {
    print_step "配置 Nginx..."
    
    local nginx_conf="/etc/nginx/sites-available/$PROJECT_NAME"
    
    # 创建配置
    cat > $nginx_conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    access_log /var/log/nginx/maitaji.access.log;
    error_log /var/log/nginx/maitaji.error.log;
    
    client_max_body_size 20M;
    
    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
    
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
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            proxy_pass http://localhost:5000;
            expires 7d;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF
    
    # 启用配置
    ln -sf $nginx_conf /etc/nginx/sites-enabled/
    
    # 删除默认配置
    rm -f /etc/nginx/sites-enabled/default
    
    # 测试并重载
    nginx -t && systemctl reload nginx
    
    print_info "Nginx 配置完成"
}

# 显示结果
show_result() {
    # 获取公网 IP
    PUBLIC_IP=$(curl -s ifconfig.me || curl -s ip.sb || echo "your-server-ip")
    
    echo ""
    echo "================================================"
    echo "    部署成功！"
    echo "================================================"
    echo ""
    echo "访问地址: http://$PUBLIC_IP"
    echo ""
    echo "项目目录: $PROJECT_DIR"
    echo "Git 分支: $BRANCH"
    echo ""
    echo "常用命令:"
    echo "  查看状态: pm2 status"
    echo "  查看日志: pm2 logs $PROJECT_NAME"
    echo "  重启应用: pm2 restart $PROJECT_NAME"
    echo "  更新代码: cd $PROJECT_DIR && ./scripts/deploy/update.sh"
    echo ""
    echo "配置 HTTPS:"
    echo "  certbot --nginx -d your-domain.com"
    echo ""
    echo "================================================"
}

# 主函数
main() {
    echo ""
    echo "================================================"
    echo "    麦塔记 - 一键部署"
    echo "================================================"
    echo ""
    echo "Git 仓库: $GIT_REPO"
    echo "分支: $BRANCH"
    echo ""
    
    check_args
    check_dependencies
    clone_or_update
    setup_env
    install_deps
    build_project
    setup_pm2
    setup_nginx
    show_result
}

# 执行
main
