// =============================================================================
// 玩家修仙信息上报/查询接口
// =============================================================================
const express = require('express');
const db = require('../db');
const { requireServerKey, requireUser } = require('../auth-middleware');

const router = express.Router();

// ---------- 上报修仙信息（游戏端，serverKey，含灵石/境界等级/炼丹统计） ----------
// 炼丹字段（alchemy_stats/alchemy_total/alchemy_fail）仅在请求携带时更新，否则保留原值——
// 避免 /ctm 指令触发的基础上报把炼丹师榜数据覆盖为空
router.post('/report', requireServerKey, (req, res) => {
  const { username, xuid, gameName, realm, realmColor, realmLevel, cultivation, alchemyLevel, alchemyTitle, rootType, elements, spiritPower, spiritStone, alchemyStats, alchemyCount, alchemyTotal, alchemyFail } = req.body;
  if (!username) return res.status(400).json({ code: 400, msg: '缺少账号' });
  const now = Date.now();
  // INSERT 默认值 vs UPDATE 保留原值（undefined → null → COALESCE 保留）
  const insStats = alchemyStats || '{}';
  const insCount = alchemyCount || '{}';
  const insTotal = alchemyTotal === undefined ? 0 : Math.floor(Number(alchemyTotal) || 0);
  const insFail = alchemyFail === undefined ? 0 : Math.floor(Number(alchemyFail) || 0);
  const updStats = alchemyStats === undefined ? null : alchemyStats;
  const updCount = alchemyCount === undefined ? null : alchemyCount;
  const updTotal = alchemyTotal === undefined ? null : Math.floor(Number(alchemyTotal) || 0);
  const updFail = alchemyFail === undefined ? null : Math.floor(Number(alchemyFail) || 0);
  db.prepare(`
    INSERT INTO player_profiles (username, xuid, server_id, game_name, realm, realm_color, realm_level, cultivation, alchemy_level, alchemy_title, root_type, elements, spirit_power, spirit_stone, alchemy_stats, alchemy_count, alchemy_total, alchemy_fail, last_active)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(username) DO UPDATE SET
      xuid=excluded.xuid, server_id=excluded.server_id, game_name=excluded.game_name,
      realm=excluded.realm, realm_color=excluded.realm_color, realm_level=excluded.realm_level,
      cultivation=excluded.cultivation,
      alchemy_level=excluded.alchemy_level, alchemy_title=excluded.alchemy_title, root_type=excluded.root_type,
      elements=excluded.elements, spirit_power=excluded.spirit_power,
      spirit_stone=excluded.spirit_stone,
      alchemy_stats=COALESCE(?, alchemy_stats),
      alchemy_count=COALESCE(?, alchemy_count),
      alchemy_total=COALESCE(?, alchemy_total),
      alchemy_fail=COALESCE(?, alchemy_fail),
      last_active=excluded.last_active,
      updated_at=datetime('now','localtime')
  `).run(username, xuid || null, req.server.id, gameName || '', realm || '', realmColor || '', Math.floor(Number(realmLevel) || 0), Math.floor(Number(cultivation) || 0), alchemyLevel || 0, alchemyTitle || '', rootType || '', elements || '[]', spiritPower || '{}', Math.floor(Number(spiritStone) || 0), insStats, insCount, insTotal, insFail, now, updStats, updCount, updTotal, updFail);
  res.json({ code: 0, msg: '已上报' });
});

// ---------- 查询自己修仙信息（网页，登录态，含灵石） ----------
router.get('/me', requireUser, (req, res) => {
  const row = db.prepare('SELECT * FROM player_profiles WHERE username = ?').get(req.user.username);
  if (!row) return res.status(404).json({ code: 404, msg: '未上报修仙信息' });
  const online = Date.now() - row.last_active <= 5 * 60 * 1000;
  res.json({
    code: 0,
    profile: {
      username: row.username,
      gameName: row.game_name,
      serverId: row.server_id,
      realm: row.realm,
      realmColor: row.realm_color,
      alchemyLevel: row.alchemy_level,
      alchemyTitle: row.alchemy_title,
      rootType: row.root_type,
      elements: row.elements ? JSON.parse(row.elements) : [],
      spiritPower: row.spirit_power ? JSON.parse(row.spirit_power) : {},
      spiritStone: row.spirit_stone || 0,
      online,
      lastActive: row.last_active
    }
  });
});

// ---------- 查询卖家修仙信息（网页，公开） ----------
// ?online=1 附带在线状态
router.get('/:username', (req, res) => {
  const row = db.prepare('SELECT * FROM player_profiles WHERE username = ?').get(req.params.username);
  if (!row) return res.status(404).json({ code: 404, msg: '该卖家未上报修仙信息' });
  const online = Date.now() - row.last_active <= 5 * 60 * 1000; // 5分钟内活跃=在线
  // 卖家累计成交单数（orders 通过 items 关联卖家）
  const sold = db.prepare(`
    SELECT COUNT(*) AS c FROM orders o JOIN items i ON o.item_id = i.id
    WHERE i.seller_username = ?
  `).get(req.params.username);
  res.json({
    code: 0,
    profile: {
      username: row.username,
      gameName: row.game_name,
      serverId: row.server_id,
      realm: row.realm,
      realmColor: row.realm_color,
      alchemyLevel: row.alchemy_level,
      alchemyTitle: row.alchemy_title,
      rootType: row.root_type,
      elements: row.elements ? JSON.parse(row.elements) : [],
      spiritPower: row.spirit_power ? JSON.parse(row.spirit_power) : {},
      spiritStone: row.spirit_stone || 0,
      soldCount: sold.c || 0,      // 累计成交单数
      online,
      lastActive: row.last_active
    }
  });
});

module.exports = router;
