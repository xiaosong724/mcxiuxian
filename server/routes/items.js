// =============================================================================
// 商品接口：上架 / 列表 / 详情 / 下架 / 剩余量
// =============================================================================
const express = require('express');
const db = require('../db');
const { requireServerKey, requireUser } = require('../auth-middleware');

const router = express.Router();
const MAX_PRICE = 100000000; // 单价上限 1 亿
const MAX_ON_SALE = 10;      // 每个玩家最多同时上架商品数（条目数，非堆叠数）

// ---------- 上架（游戏内，serverKey） ----------
router.post('/', requireServerKey, (req, res) => {
  const { sellerUsername, sellerXuid, title, itemType, itemData, unitPrice, totalCount } = req.body;
  if (!title || !itemData || !itemType) {
    return res.status(400).json({ code: 400, msg: '缺少物品信息' });
  }
  const price = Math.floor(Number(unitPrice));
  const count = Math.floor(Number(totalCount));
  if (!Number.isFinite(price) || price <= 0 || price > MAX_PRICE) {
    return res.status(400).json({ code: 400, msg: `单价需为1~${MAX_PRICE}灵石` });
  }
  if (!Number.isFinite(count) || count <= 0 || count > 64) {
    return res.status(400).json({ code: 400, msg: '上架数量需为1-64' });
  }
  // 限制：每个玩家最多同时上架 10 个商品（商品条目数，非堆叠数量）
  const seller = sellerUsername || '未知';
  const onSale = db.prepare(
    "SELECT COUNT(*) AS c FROM items WHERE seller_username = ? AND status = 'on_sale' AND deleted = 0"
  ).get(seller).c;
  if (onSale >= MAX_ON_SALE) {
    return res.status(400).json({ code: 400, msg: `每个玩家最多同时上架 ${MAX_ON_SALE} 个商品，请先下架部分商品` });
  }
  const info = db.prepare(
    'INSERT INTO items (server_id, seller_username, seller_xuid, title, item_type, item_data, unit_price, total_count, remaining) VALUES (?,?,?,?,?,?,?,?,?)'
  ).run(req.server.id, seller, sellerXuid || null, title, itemType, itemData, price, count, count);
  res.json({ code: 0, msg: '上架成功', itemId: info.lastInsertRowid });
});

// ---------- 商品列表（网页，分页） ----------
// ---------- 商品列表（网页，分页，支持类型筛选） ----------
// ?serverId=&type=&page=&pageSize=
//   serverId 空=全部服务器（需至少一个服开启跨服，否则空列表）
//   type=pill(丹药)|herb(药材)|core(妖丹)|bag(储物袋)
const TYPE_MAP = {
  pill: ['minecraft:apple'],
  core: ['minecraft:slime_ball'],
  bag: ['minecraft:glow_ink_sac'],
  herb: ['minecraft:wheat', 'minecraft:carrot', 'minecraft:potato', 'minecraft:beetroot',
         'minecraft:dandelion', 'minecraft:poppy', 'minecraft:blue_orchid', 'minecraft:allium',
         'minecraft:cornflower', 'minecraft:lily_of_the_valley', 'minecraft:sunflower',
         'minecraft:lilac', 'minecraft:rose_bush', 'minecraft:peony'],
};
router.get('/', (req, res) => {
  const { serverId, type } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20));
  const offset = (page - 1) * pageSize;
  let where = "status = 'on_sale' AND deleted = 0";
  const params = [];
  if (serverId) {
    where += ' AND server_id = ?';
    params.push(serverId);
  } else {
    // 选择「全部服务器」：只有至少一个服务器开启跨服交易才显示，否则不显示任何商品
    const open = db.prepare('SELECT COUNT(*) AS c FROM servers WHERE cross_trade = 1').get().c;
    if (open === 0) {
      return res.json({ code: 0, items: [], total: 0, page, pageSize });
    }
  }
  if (TYPE_MAP[type]) {
    const marks = TYPE_MAP[type].map(() => '?').join(',');
    where += ` AND item_type IN (${marks})`;
    params.push(...TYPE_MAP[type]);
  }
  const total = db.prepare(`SELECT COUNT(*) AS c FROM items WHERE ${where}`).get(...params).c;
  const rows = db.prepare(
    `SELECT * FROM items WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, pageSize, offset);
  const list = rows.map(r => ({
    id: r.id,
    serverId: r.server_id,
    seller: r.seller_username,
    title: r.title,
    itemType: r.item_type,
    unitPrice: r.unit_price,
    totalCount: r.total_count,
    remaining: r.remaining,
    status: r.status,
    createdAt: r.created_at
  }));
  res.json({ code: 0, items: list, total, page, pageSize });
});

// ---------- 商品详情（网页） ----------
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM items WHERE id = ?').get(Number(req.params.id));
  if (!row) return res.status(404).json({ code: 404, msg: '商品不存在' });
  res.json({
    code: 0,
    item: {
      id: row.id,
      serverId: row.server_id,
      seller: row.seller_username,
      title: row.title,
      itemType: row.item_type,
      unitPrice: row.unit_price,
      remaining: row.remaining,
      status: row.status,
      createdAt: row.created_at
    }
  });
});

// ---------- 卖家下架（网页，需登录且是该商品卖家） ----------
router.post('/:id/off', requireUser, (req, res) => {
  const row = db.prepare('SELECT * FROM items WHERE id = ?').get(Number(req.params.id));
  if (!row) return res.status(404).json({ code: 404, msg: '商品不存在' });
  if (row.seller_username !== req.user.username) {
    return res.status(403).json({ code: 403, msg: '只能下架自己的商品' });
  }
  if (row.status !== 'on_sale') {
    return res.status(400).json({ code: 400, msg: '商品不在售卖中' });
  }
  // 有剩余才记录待取回
  if (row.remaining > 0) {
    db.prepare(
      'INSERT INTO pickups (seller_username, item_id, title, item_type, item_data, remaining) VALUES (?,?,?,?,?,?)'
    ).run(row.seller_username, row.id, row.title, row.item_type, row.item_data, row.remaining);
  }
  db.prepare("UPDATE items SET status = 'off' WHERE id = ?").run(row.id);
  res.json({ code: 0, msg: '已下架', remaining: row.remaining });
});

// ---------- 待取回列表（游戏端，卖家取回剩余物品） ----------
router.get('/pickup/:username', requireServerKey, (req, res) => {
  const rows = db.prepare(
    "SELECT id, item_id, title, item_data, remaining FROM pickups WHERE seller_username = ? AND taken = 0 ORDER BY created_at ASC"
  ).all(req.params.username);
  res.json({ code: 0, pickups: rows });
});

// ---------- 取回（游戏端，标记已取） ----------
router.post('/pickup/:id/take', requireServerKey, (req, res) => {
  const row = db.prepare('SELECT * FROM pickups WHERE id = ? AND taken = 0').get(Number(req.params.id));
  if (!row) return res.status(404).json({ code: 404, msg: '待取回记录不存在' });
  db.prepare('UPDATE pickups SET taken = 1 WHERE id = ?').run(row.id);
  res.json({ code: 0, msg: '取回成功', itemData: row.item_data, remaining: row.remaining, title: row.title });
});

// ---------- 恢复未取回状态（背包放不下时撤销取回） ----------
router.post('/pickup-restore', requireServerKey, (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ code: 400, msg: '参数错误' });
  const upd = db.prepare("UPDATE pickups SET taken = 0 WHERE id = ?").run(Number(id));
  res.json({ code: 0, msg: '已恢复未取回状态' });
});

// ---------- 卖家全部商品（含下架+取回状态，网页"我的上架"用） ----------
router.get('/seller/:username', (req, res) => {
  const rows = db.prepare(
    "SELECT * FROM items WHERE seller_username = ? AND deleted = 0 ORDER BY created_at DESC"
  ).all(req.params.username);
  // 查询每个 off 商品是否还有未取回的 pickup
  const list = rows.map(r => {
    let unclaimed = false;
    if (r.status === 'off') {
      const p = db.prepare("SELECT COUNT(*) AS c FROM pickups WHERE item_id = ? AND taken = 0").get(r.id);
      unclaimed = p.c > 0;
    }
    return {
      id: r.id,
      serverId: r.server_id,
      seller: r.seller_username,
      title: r.title,
      itemType: r.item_type,
      unitPrice: r.unit_price,
      totalCount: r.total_count,
      remaining: r.remaining,
      status: r.status,
      unclaimed,
      createdAt: r.created_at
    };
  });
  res.json({ code: 0, items: list });
});

// ---------- 删除商品（网页，卖家删除已售罄商品） ----------
router.post('/:id/delete', requireUser, (req, res) => {
  const row = db.prepare('SELECT * FROM items WHERE id = ?').get(Number(req.params.id));
  if (!row) return res.status(404).json({ code: 404, msg: '商品不存在' });
  if (row.seller_username !== req.user.username) {
    return res.status(403).json({ code: 403, msg: '只能删除自己的商品' });
  }
  if (row.status !== 'sold') {
    return res.status(400).json({ code: 400, msg: '只有已售罄的商品才能删除' });
  }
  db.prepare('UPDATE items SET deleted = 1 WHERE id = ?').run(row.id);
  res.json({ code: 0, msg: '已删除' });
});

module.exports = router;
