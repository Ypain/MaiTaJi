#!/bin/bash

# ===========================================
# 阿里云 ECS 服务器环境初始化脚本
# 使用方法: curl -fsSL http://your-server/init.sh | bash
# ===========================================

set -e

echo "================================================"
echo "    阿里云 ECS 服务器环境初始化"
echo "================================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印函数
print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检测操作系统
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    else
        print_error "无法检测操作系统"
        exit 1
    fi
    print_info "检测到操作系统: $OS $VER"
}

# 更新系统
update_system() {
    print_info "更新系统软件包..."
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt update && apt upgrade -y
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        yum update -y
    fi
    print_info "系统更新完成"
}

# 安装基础工具
install_basic_tools() {
    print_info "安装基础工具..."
    
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt install -y curl wget git vim htop net-tools \
            build-essential python3 python3-pip \
            ca-certificates gnupg lsb-release
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        yum install -y curl wget git vim htop net-tools \
            gcc-c++ make python3 python3-pip \
            ca-certificates
    fi
    
    print_info "基础工具安装完成"
}

# 安装 Node.js
install_nodejs() {
    print_info "安装 Node.js 20.x..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_warn "Node.js 已安装: $NODE_VERSION"
        read -p "是否重新安装? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return
        fi
    fi
    
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    fi
    
    print_info "Node.js 安装完成: $(node -v)"
    print_info "npm 版本: $(npm -v)"
}

# 安装 pnpm
install_pnpm() {
    print_info "安装 pnpm..."
    
    if command -v pnpm &> /dev/null; then
        print_warn "pnpm 已安装: $(pnpm -v)"
        return
    fi
    
    npm install -g pnpm
    print_info "pnpm 安装完成: $(pnpm -v)"
}

# 安装 PM2
install_pm2() {
    print_info "安装 PM2..."
    
    if command -v pm2 &> /dev/null; then
        print_warn "PM2 已安装"
        return
    fi
    
    npm install -g pm2
    print_info "PM2 安装完成"
}

# 安装 Nginx
install_nginx() {
    print_info "安装 Nginx..."
    
    if command -v nginx &> /dev/null; then
        print_warn "Nginx 已安装"
        return
    fi
    
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt install -y nginx
    elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        yum install -y nginx
    fi
    
    systemctl start nginx
    systemctl enable nginx
    
    print_info "Nginx 安装完成"
    print_info "Nginx 状态: $(systemctl is-active nginx)"
}

# 配置防火墙
configure_firewall() {
    print_info "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        # Ubuntu 使用 ufw
        ufw --force reset
        ufw default deny incoming
        ufw default allow outgoing
        ufw allow 22/tcp comment 'SSH'
        ufw allow 80/tcp comment 'HTTP'
        ufw allow 443/tcp comment 'HTTPS'
        ufw --force enable
        print_info "UFW 防火墙配置完成"
        ufw status
    elif command -v firewall-cmd &> /dev/null; then
        # CentOS 使用 firewalld
        systemctl start firewalld
        systemctl enable firewalld
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
        print_info "Firewalld 防火墙配置完成"
        firewall-cmd --list-all
    else
        print_warn "未检测到防火墙，请确保阿里云安全组已正确配置"
    fi
}

# 创建部署用户（可选）
create_deploy_user() {
    print_info "创建部署用户..."
    
    DEPLOY_USER="deploy"
    
    if id "$DEPLOY_USER" &>/dev/null; then
        print_warn "用户 $DEPLOY_USER 已存在"
        return
    fi
    
    read -p "是否创建部署用户 'deploy'? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return
    fi
    
    useradd -m -s /bin/bash $DEPLOY_USER
    usermod -aG sudo $DEPLOY_USER
    
    # 设置密码
    echo "设置 deploy 用户密码:"
    passwd $DEPLOY_USER
    
    # 配置 sudo 免密
    echo "$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$DEPLOY_USER
    
    print_info "部署用户创建完成: $DEPLOY_USER"
}

# 创建项目目录
create_project_directory() {
    print_info "创建项目目录..."
    
    PROJECT_DIR="/var/www/maitaji"
    mkdir -p $PROJECT_DIR
    
    # 设置权限
    chown -R $USER:$USER /var/www
    
    print_info "项目目录创建完成: $PROJECT_DIR"
}

# 显示总结
show_summary() {
    echo ""
    echo "================================================"
    echo "    环境初始化完成！"
    echo "================================================"
    echo ""
    echo "已安装软件:"
    echo "  - Node.js: $(node -v)"
    echo "  - npm: $(npm -v)"
    echo "  - pnpm: $(pnpm -v)"
    echo "  - PM2: $(pm2 -v)"
    echo "  - Nginx: $(nginx -v 2>&1)"
    echo ""
    echo "项目目录: /var/www/maitaji"
    echo ""
    echo "下一步:"
    echo "  1. 上传项目代码到 /var/www/maitaji"
    echo "  2. 创建 .env.local 配置文件"
    echo "  3. 运行 pnpm install && pnpm build"
    echo "  4. 运行 pm2 start \"pnpm run start\" --name maitaji"
    echo "  5. 配置 Nginx 反向代理"
    echo ""
    echo "或使用自动化部署脚本完成剩余步骤"
    echo "================================================"
}

# 主函数
main() {
    detect_os
    update_system
    install_basic_tools
    install_nodejs
    install_pnpm
    install_pm2
    install_nginx
    configure_firewall
    create_project_directory
    create_deploy_user
    show_summary
}

# 执行
main
