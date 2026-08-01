# 部署指南（云服务器）

项目结构：`server/` 后端（Express + SQLite）、`web/` 前端（Vue3 + Vite）。

## 一、本地准备

1. 确保 `.gitignore` 已包含 `node_modules/`、`*.db`、`web/dist/`（**数据库不要提交**）。
2. 选择数据库方案：
   - **方案 A（推荐，保留全部数据）**：把本地 `server/data.db` 单独传到云服务器（scp / 网盘）。
   - **方案 B（全新开始）**：云端空库，游戏端首次请求会自动注册服务器（`svr_` Key）。
3. 提交并推送代码到 GitHub。

## 二、云端部署

```bash
# 1. 安装 Node.js（20+）
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs

# 2. 克隆代码
git clone https://github.com/<你的账号>/xiuxian-ctm.git && cd xiuxian-ctm

# 3. 安装依赖 + 构建前端
cd server && npm install --omit=dev
cd ../web && npm install && npm run build   # 生成 web/dist

# 4. 数据库（方案 A：把本地 data.db 放到 server/ 下）

# 5. 用 pm2 守护后端（单端口 3000 同时服务 API + 前端页面）
npm i -g pm2
cd ../server
pm2 start app.js --name ctm-server
pm2 save && pm2 startup
```

## 三、配置

1. **游戏端指向云服务器**：编辑 `C:\mc\plugins\xiuxian\xiuxian.js` 第 29 行
   ```js
   const CTM_API_URL = 'http://<云服务器IP>:3000/api';
   ```
   改完重启 BDS。

2. **安全**：
   - 设置环境变量（可选但推荐）：`JWT_SECRET=随机长字符串`
   - 云服务器防火墙/安全组放行 **3000** 端口（TCP）

3. **验证**：
   - 浏览器访问 `http://<云服务器IP>:3000/` → 应显示前端页面
   - 游戏内执行 `/ctm` 任意指令 → 上报成功（排行榜/卖家信息有数据）

## 四、更新部署

```bash
cd xiuxian-ctm
git pull
cd web && npm run build      # 前端有改动时
cd ../server && pm2 restart ctm-server
```

## 五、备份

数据库文件 `server/data.db` 是核心数据，定期备份：
```bash
# 云服务器定时备份示例（每天 4 点）
crontab -e
# 0 4 * * * cp /path/xiuxian-ctm/server/data.db /backup/data-$(date +\%F).db
```

## 注意
- 本地开发用 `cd server && npm start`（3000）+ `cd web && npm run dev`（5173），不受影响。
- 游戏端 `CTM_SERVER_KEY` 由插件自动生成并保存在本地 `ctm_config`，部署后保持不变即可（方案 A 时与云端 servers 表自动匹配）。
