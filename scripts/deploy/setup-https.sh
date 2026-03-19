#!/bin/bash

# ===========================================
# HTTPS 配置脚本
# 使用方法: ./setup-https.sh <域名>
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
DOMAIN=${1:-}
PROJECT_NAME="maitaji"
EMAIL=${2:-"admin@${DOMAIN}"}

# 显示使用说明
show_usage() {
    echo "使用方法: $0 <域名> [邮箱]"
    echo ""
    echo "示例:"
    echo "  $0 example.com"
    echo "  $0 example.com admin@example.com"
    exit 1
}

# 检查参数
check_args() {
    if [ -z "$DOMAIN" ]; then
        print_error "缺少域名参数"
        show_usage
    fi
}

# 检查域名解析
check_dns() {
    print_step "检查域名解析..."
    
    local server_ip=$(curl -s ifconfig.me || curl -s ip.sb)
    local domain_ip=$(dig +short $DOMAIN | tail -1)
    
    if [ -z "$domain_ip" ]; then
        print_error "域名 $DOMAIN 未解析到任何 IP"
        echo ""
        echo "请先在域名服务商处添加 A 记录:"
        echo "  主机记录: @"
        echo "  记录类型: A"
        echo "  记录值: $server_ip"
        exit 1
    fi
    
    print_info "域名解析: $DOMAIN -> $domain_ip"
    print_info "服务器 IP: $server_ip"
    
    if [ "$domain_ip" != "$server_ip" ]; then
        print_warn "域名解析 IP 与服务器 IP 不一致!"
        read -p "是否继续? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 安装 Certbot
install_certbot() {
    print_step "安装 Certbot..."
    
    if command -v certbot &> /dev/null; then
        print_info "Certbot 已安装"
        return
    fi
    
    if [ -f /etc/debian_version ]; then
        apt update
        apt install -y certbot python3-certbot-nginx
    elif [ -f /etc/redhat-release ]; then
        yum install -y certbot python3-certbot-nginx
    else
        print_error "不支持的操作系统"
        exit 1
    fi
    
    print_info "Certbot 安装完成"
}

# 申请证书
request_cert() {
    print_step "申请 SSL 证书..."
    
    # 检查是否已有证书
    if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
        print_warn "证书已存在"
        read -p "是否重新申请? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return
        fi
        certbot revoke --cert-path /etc/letsencrypt/live/$DOMAIN/cert.pem --non-interactive || true
    fi
    
    # 申请证书
    certbot --nginx \
        -d $DOMAIN \
        -d www.$DOMAIN \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --non-interactive
    
    print_info "证书申请成功"
}

# 配置自动续期
setup_renewal() {
    print_step "配置自动续期..."
    
    # 测试续期
    certbot renew --dry-run
    
    # 添加定时任务
    if ! crontab -l | grep -q "certbot renew"; then
        (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
        print_info "已添加自动续期定时任务"
    else
        print_info "自动续期已配置"
    fi
}

# 优化 Nginx 配置
optimize_nginx() {
    print_step "优化 Nginx HTTPS 配置..."
    
    local nginx_conf="/etc/nginx/sites-available/$PROJECT_NAME"
    
    if [ ! -f "$nginx_conf" ]; then
        print_warn "未找到 Nginx 配置文件，跳过优化"
        return
    fi
    
    # 备份原配置
    cp $nginx_conf ${nginx_conf}.bak
    
    # 创建优化的配置
    cat > $nginx_conf << EOF
# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 日志
    access_log /var/log/nginx/maitaji.access.log;
    error_log /var/log/nginx/maitaji.error.log;
    
    # 请求大小限制
    client_max_body_size 20M;
    
    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://localhost:5000;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    # 测试并重载
    nginx -t && systemctl reload nginx
    
    print_info "Nginx 配置优化完成"
}

# 显示结果
show_result() {
    echo ""
    echo "================================================"
    echo "    HTTPS 配置成功！"
    echo "================================================"
    echo ""
    echo "访问地址: https://$DOMAIN"
    echo "证书位置: /etc/letsencrypt/live/$DOMAIN"
    echo ""
    echo "SSL 测试:"
    echo "  https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
    echo ""
    echo "证书续期:"
    echo "  手动续期: certbot renew"
    echo "  查看定时任务: crontab -l"
    echo ""
    echo "================================================"
}

# 主函数
main() {
    echo ""
    echo "================================================"
    echo "    HTTPS 配置脚本"
    echo "================================================"
    echo ""
    echo "域名: $DOMAIN"
    echo "邮箱: $EMAIL"
    echo ""
    
    check_args
    check_dns
    install_certbot
    request_cert
    setup_renewal
    optimize_nginx
    show_result
}

# 执行
main
