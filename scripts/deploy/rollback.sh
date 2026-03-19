#!/bin/bash

# ===========================================
# 回滚脚本
# 使用方法: ./rollback.sh [backup-name]
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
PROJECT_NAME="maitaji"
PROJECT_DIR="/var/www/$PROJECT_NAME"
BACKUP_DIR="/var/www/backups"
TARGET_BACKUP=${1:-}

# 列出可用备份
list_backups() {
    print_step "可用备份列表:"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        print_warn "没有找到备份"
        exit 1
    fi
    
    echo "编号) 备份名称                        创建时间"
    echo "--------------------------------------------"
    
    local i=1
    for backup in $(ls -t $BACKUP_DIR); do
        local time=$(stat -c %y $BACKUP_DIR/$backup 2>/dev/null | cut -d'.' -f1 || echo "未知")
        printf "%4d) %-30s %s\n" $i "$backup" "$time"
        echo "$backup" > /tmp/backup_$i
        ((i++))
    done
    
    echo ""
}

# 选择备份
select_backup() {
    if [ -n "$TARGET_BACKUP" ]; then
        SELECTED_BACKUP="$BACKUP_DIR/$TARGET_BACKUP"
        if [ ! -d "$SELECTED_BACKUP" ] && [ ! -f "$SELECTED_BACKUP" ]; then
            print_error "备份不存在: $TARGET_BACKUP"
            exit 1
        fi
        return
    fi
    
    list_backups
    
    read -p "请选择要回滚的备份编号: " -r selection
    
    if [ ! -f "/tmp/backup_$selection" ]; then
        print_error "无效的选择"
        exit 1
    fi
    
    SELECTED_BACKUP="$BACKUP_DIR/$(cat /tmp/backup_$selection)"
    
    # 清理临时文件
    rm -f /tmp/backup_*
}

# 确认回滚
confirm_rollback() {
    print_warn "即将回滚到: $SELECTED_BACKUP"
    echo ""
    read -p "确认回滚? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "已取消回滚"
        exit 0
    fi
}

# 执行回滚
do_rollback() {
    print_step "执行回滚..."
    
    # 停止应用
    pm2 stop $PROJECT_NAME 2>/dev/null || true
    
    # 备份当前版本
    local current_backup="$BACKUP_DIR/pre_rollback_$(date +%Y%m%d_%H%M%S)"
    if [ -d "$PROJECT_DIR" ]; then
        print_info "备份当前版本到: $current_backup"
        cp -r $PROJECT_DIR $current_backup
    fi
    
    # 执行回滚
    if [ -d "$SELECTED_BACKUP" ]; then
        # 目录备份
        print_info "从目录备份恢复..."
        rm -rf $PROJECT_DIR
        cp -r $SELECTED_BACKUP $PROJECT_DIR
    elif [ -f "$SELECTED_BACKUP" ]; then
        # 压缩包备份
        print_info "从压缩包备份恢复..."
        rm -rf $PROJECT_DIR
        mkdir -p $PROJECT_DIR
        tar -xzf $SELECTED_BACKUP -C $PROJECT_DIR --strip-components=1
    fi
    
    # 恢复环境变量
    if [ -f "$BACKUP_DIR/env_*" ]; then
        local latest_env=$(ls -t $BACKUP_DIR/env_* 2>/dev/null | head -1)
        if [ -n "$latest_env" ] && [ ! -f "$PROJECT_DIR/.env.local" ]; then
            cp $latest_env $PROJECT_DIR/.env.local
            print_info "已恢复环境变量文件"
        fi
    fi
    
    print_info "回滚完成"
}

# 重启应用
restart_app() {
    print_step "重启应用..."
    
    cd $PROJECT_DIR
    
    # 重新安装依赖（如果需要）
    if [ ! -d "node_modules" ]; then
        print_info "安装依赖..."
        pnpm install
    fi
    
    # 启动应用
    pm2 restart $PROJECT_NAME 2>/dev/null || pm2 start "pnpm run start" --name $PROJECT_NAME
    
    print_info "应用已重启"
    
    # 显示状态
    pm2 status
}

# 显示结果
show_result() {
    echo ""
    echo "================================================"
    echo "    回滚成功！"
    echo "================================================"
    echo ""
    echo "回滚到: $SELECTED_BACKUP"
    echo "当前版本备份: $BACKUP_DIR/pre_rollback_*"
    echo ""
    echo "查看日志: pm2 logs $PROJECT_NAME"
    echo ""
    echo "================================================"
}

# 主函数
main() {
    echo ""
    echo "================================================"
    echo "    麦塔记 - 回滚脚本"
    echo "================================================"
    echo ""
    
    select_backup
    confirm_rollback
    do_rollback
    restart_app
    show_result
}

# 执行
main
