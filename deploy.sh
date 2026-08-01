#!/bin/bash
# =============================================================================
# 修仙交易系统 - Ubuntu/Debian 一键部署脚本
# 用法：git clone 后执行  bash deploy.sh
# 需要 root 或 sudo 权限；执行前确认服务器已放行 3000 端口
# =============================================================================
set -e

echo "==> [1/6] 安装 Node.js 22.x ..."
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
echo "    Node: $(node -v)"

echo "==> [2/6] 安装依赖（后端）..."
cd "$(dirname "$0")/server"
npm install --omit=dev

echo "==> [3/6] 安装依赖并构建前端 ..."
cd ../web
npm install
npm run build

echo "==> [4/6] 安装 pm2 并启动后端（单端口 3000 服务页面+API）..."
sudo npm i -g pm2
cd ../server
pm2 start app.js --name ctm-server
pm2 save

echo "==> [5/6] 配置开机自启 ..."
sudo pm2 startup systemd -u "$(whoami)" --hp "$HOME" || true

echo "==> [6/6] 完成！"
echo "----------------------------------------------"
IP=$(curl -s --max-time 5 ifconfig.me || echo "服务器IP")
echo "  网页访问: http://$IP:3000"
echo "  查看日志: pm2 logs ctm-server"
echo "  重启服务: pm2 restart ctm-server"
echo "  ⚠️ 请确认腾讯云轻量「防火墙」已放行 TCP 3000 端口"
echo "----------------------------------------------"
