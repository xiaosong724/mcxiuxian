// =============================================================================
// 服务器设置接口（跨服交易开关，游戏端 OP 管理）
// =============================================================================
const express = require('express');
const db = require('../db');
const { requireServerKey } = require('../auth-middleware');

const router = express.Router();

// ---------- 服务器列表（网页市场下拉用，公开） ----------
router.get('/servers', (req, res) => {
  const rows = db.prepare('SELECT id, name, cross_trade FROM servers').all();
  res.json({ code: 0, servers: rows });
});

// ---------- 查询跨服交易状态（游戏端 /ctm cross） ----------
router.get('/cross-trade', requireServerKey, (req, res) => {
  res.json({ code: 0, serverId: req.server.id, crossTrade: req.server.cross_trade });
});

// ---------- 修改跨服交易开关（游戏端 OP 执行 /ctm cross on|off） ----------
router.post('/cross-trade', requireServerKey, (req, res) => {
  const enabled = (req.body.enabled === 1 || req.body.enabled === '1' || req.body.enabled === true) ? 1 : 0;
  db.prepare('UPDATE servers SET cross_trade = ? WHERE id = ?').run(enabled, req.server.id);
  res.json({ code: 0, msg: enabled ? '已开启跨服交易' : '已关闭跨服交易', crossTrade: enabled });
});

module.exports = router;
