// =============================================================================
// 修仙交易系统 - 后端 API 入口
// =============================================================================
const express = require('express');
const path = require('node:path');
const db = require('./db');
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const profileRoutes = require('./routes/profiles');
const settingsRoutes = require('./routes/settings');
const rankRoutes = require('./routes/rank');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json({ limit: '2mb' })); // 物品 NBT 数据可能较大

// 请求日志（排查游戏端调用问题用）
app.use('/api', (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const key = req.headers['x-server-key'] ? ' [GAME]' : (req.headers['authorization'] ? ' [WEB]' : '');
    console.log(`[ctm] ${req.method} ${req.originalUrl.slice(0, 80)} -> ${res.statusCode} (${ms}ms)${key}`);
  });
  next();
});

// 健康检查
app.get('/api/health', (req, res) => res.json({ code: 0, msg: 'ok', time: Date.now() }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/rank', rankRoutes);

// 生产模式：托管前端构建产物（web/dist），单端口部署
// 本地开发仍用 Vite（5173 + 代理），此段仅在 dist 存在时生效
const fs = require('node:fs');
const WEB_DIST = path.join(__dirname, '../web/dist');
if (fs.existsSync(WEB_DIST)) {
  app.use(express.static(WEB_DIST));
  // SPA 路由回退：非 /api 路径一律返回 index.html（前端路由由 Vue Router 接管）
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(WEB_DIST, 'index.html'));
  });
  console.log('[xiuxian_ctm] 已启用前端静态托管: ' + WEB_DIST);
}

// 404
app.use('/api', (req, res) => res.status(404).json({ code: 404, msg: '接口不存在' }));

// 启动
app.listen(PORT, () => {
  console.log(`[xiuxian_ctm] API 服务已启动: http://localhost:${PORT}`);
  // 初始化默认服务器（如果表为空）
  const count = db.prepare('SELECT COUNT(*) AS c FROM servers').get().c;
  if (count === 0) {
    db.prepare("INSERT INTO servers (id, name, secret, cross_trade) VALUES ('main', '主服', 'CHANGE_ME_MAIN_SERVER_KEY', 0)").run();
    console.log('[xiuxian_ctm] 已创建默认服务器 main，请尽快修改 secret！');
  }
});
