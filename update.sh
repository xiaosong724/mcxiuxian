#!/bin/bash
# =============================================================================
# 修仙交易系统 - 云端一键更新脚本
# 用法：cd 项目目录后执行  bash update.sh
# 作用：git pull → 前端重新构建 → 重启后端（pm2）
# =============================================================================
set -e
cd "$(dirname "$0")"

echo "==> [1/4] 拉取最新代码 ..."
git pull

echo "==> [2/4] 构建前端 ..."
cd web
if [ -f package-lock.json ]; then npm install --no-audit --no-fund; fi
npm run build

echo "==> [3/4] 重启后端 ..."
cd ../server
pm2 restart ctm-server || pm2 start app.js --name ctm-server

echo "==> [4/4] 完成！"
echo "  状态: $(pm2 status ctm-server 2>/dev/null | grep ctm-server | awk '{print $2, $12}')"
echo "  提示: 浏览器请强制刷新（Ctrl+F5 / 手机清缓存）"
