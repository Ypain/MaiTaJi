#!/bin/bash

# ===========================================
# 服务器端更新脚本
# 使用方法: ./update.sh [git-branch]
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
PROJECT_DIR="/var/www/maitaji"
BRANCH=${1:-main}
BACKUP_DIR="/var/www/backups"

# 切换到项目目录
cd $PROJECT_DIR

echo ""
echo "================================================"
echo "    麦塔记 - 更新脚本"
echo "================================================"
echo ""
echo "项目目录: $PROJECT_DIR"
echo "分支: $BRANCH"
echo ""

# 检查是否有未提交的更改
check_changes() {
    if [ -d ".git" ]; then
        if ! git diff-index --quiet HEAD --; then
            print_warn "检测到未提交的更改"
            git status -s
            read -p "是否继续? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi
}

# 备份数据库和上传文件
backup_data() {
    print_step "备份数据..."
    
    mkdir -p $BACKUP_DIR
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    
    # 备份 .env.local
    if [ -f ".env.local" ]; then
        cp .env.local $BACKUP_DIR/env_$TIMESTAMP
        print_info "环境变量已备份"
    fi
    
    # 备份上传的文件（如果有）
    if [ -d "public/uploads" ]; then
        tar -czvf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz public/uploads 2>/dev/null || true
        print_info "上传文件已备份"
    fi
    
    print_info "备份完成，位置: $BACKUP_DIR"
}

# 拉取最新代码
pull_code() {
    print_step "拉取最新代码..."
    
    if [ -d ".git" ]; then
        git fetch origin
        git checkout $BRANCH
        git pull origin $BRANCH
        print_info "代码已更新"
    else
        print_warn "不是 git 仓库，跳过代码更新"
    fi
}

# 安装依赖
install_deps() {
    print_step "安装依赖..."
    
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm install --prefer-offline
    else
        pnpm install
    fi
    
    print_info "依赖安装完成"
}

# 构建项目
build_project() {
    print_step "构建项目..."
    
    pnpm run build
    
    print_info "构建完成"
}

# 重启应用
restart_app() {
    print_step "重启应用..."
    
    # 检查应用是否在运行
    if pm2 list | grep -q "maitaji"; then
        pm2 restart maitaji
        print_info "应用已重启"
    else
        pm2 start "pnpm run start" --name maitaji
        pm2 save
        print_info "应用已启动"
    fi
    
    # 显示状态
    pm2 status
}

# 清理旧备份
cleanup_backups() {
    print_step "清理旧备份..."
    
    # 保留最近 5 个备份
    cd $BACKUP_DIR
    ls -t | tail -n +6 | xargs rm -rf 2>/dev/null || true
    
    print_info "备份清理完成"
}

# 显示结果
show_result() {
    echo ""
    echo "================================================"
    echo "    更新成功！"
    echo "================================================"
    echo ""
    echo "查看日志: pm2 logs maitaji"
    echo "查看状态: pm2 status"
    echo ""
    echo "如需回滚，备份位置: $BACKUP_DIR"
    echo ""
}

# 主函数
main() {
    check_changes
    backup_data
    pull_code
    install_deps
    build_project
    restart_app
    cleanup_backups
    show_result
}

# 执行
main
