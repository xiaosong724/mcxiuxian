// =============================================================================
// 订单/支付接口
// 支付流程（游戏端发起）：
//   1. 游戏端 POST /orders/pay 带 serverKey + buyerXuid + itemId + quantity
//   2. 服务端校验库存充足 → 原子扣减 remaining → 生成订单 → 返回物品 NBT 数据
//   3. 游戏端给买家发物品，若买家就在本服则直接发；跨服需走游戏间处理
// =============================================================================
const express = require('express');
const db = require('../db');
const { requireServerKey, requireUser } = require('../auth-middleware');

const router = express.Router();

// ---------- 购物车待支付列表（游戏端拉取某玩家加购的商品） ----------
router.get('/pending/:username', requireServerKey, (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!user) return res.json({ code: 0, cart: [] });
  const rows = db.prepare(`
    SELECT c.id AS cart_id, c.quantity, c.item_id, i.title, i.item_type, i.unit_price,
           i.remaining, i.item_data, i.server_id, i.status
    FROM cart c JOIN items i ON c.item_id = i.id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `).all(user.id);
  // 过滤掉已下架/已售罄/跨服不可买的
  const server = req.server;
  const visible = rows.filter(r => r.status === 'on_sale' && r.remaining > 0 && (server.cross_trade === 1 || r.server_id === server.id));
  res.json({ code: 0, cart: visible });
});

// ---------- 确认支付（游戏端） ----------
// body: { buyerUsername, buyerXuid, itemId, quantity }
// 校验购买者身份：buyerXuid 需匹配账号绑定的 xuid
router.post('/pay', requireServerKey, (req, res) => {
  const { buyerUsername, buyerXuid, itemId, quantity } = req.body;
  const qty = Math.floor(Number(quantity));
  if (!buyerUsername || !buyerXuid || !itemId || qty < 1 || qty > 64) {
    return res.status(400).json({ code: 400, msg: '参数错误' });
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(buyerUsername);
  if (!user) return res.status(404).json({ code: 404, msg: '账号不存在' });
  if (user.xuid !== buyerXuid) return res.status(403).json({ code: 403, msg: '账号与玩家不匹配，请先绑定' });

  const item = db.prepare("SELECT * FROM items WHERE id = ? AND status = 'on_sale'").get(Number(itemId));
  if (!item) return res.status(404).json({ code: 404, msg: '商品不存在或已下架' });

  const server = req.server;
  if (server.cross_trade !== 1 && item.server_id !== server.id) {
    return res.status(403).json({ code: 403, msg: '该商品不属于本服，无法在本服购买' });
  }

  // 原子扣减库存（防止并发超卖）：UPDATE ... WHERE remaining >= ?
  const upd = db.prepare('UPDATE items SET remaining = remaining - ? WHERE id = ? AND remaining >= ?')
    .run(qty, item.id, qty);
  if (upd.changes === 0) {
    return res.status(409).json({ code: 409, msg: '库存不足或已被抢先购买' });
  }
  // 剩余为0则自动下架
  const after = db.prepare('SELECT remaining FROM items WHERE id = ?').get(item.id);
  if (after.remaining <= 0) {
    db.prepare("UPDATE items SET status = 'sold' WHERE id = ?").run(item.id);
  }

  const totalPrice = item.unit_price * qty;
  const orderInfo = db.prepare(
    'INSERT INTO orders (item_id, buyer_username, buyer_xuid, server_id, quantity, unit_price, total_price) VALUES (?,?,?,?,?,?,?)'
  ).run(item.id, buyerUsername, buyerXuid, item.server_id, qty, item.unit_price, totalPrice);

  // 移除购物车中该商品
  db.prepare('DELETE FROM cart WHERE user_id = ? AND item_id = ?').run(user.id, item.id);

  // 货款记入卖家收入（未领取）
  db.prepare(
    'INSERT INTO seller_income (seller_username, item_id, order_id, amount) VALUES (?,?,?,?)'
  ).run(item.seller_username, item.id, orderInfo.lastInsertRowid, totalPrice);

  res.json({
    code: 0,
    msg: '支付成功',
    orderId: orderInfo.lastInsertRowid,
    quantity: qty,
    totalPrice: totalPrice,
    itemData: item.item_data   // 完整物品 NBT 数据（发给买家）
  });
});

// ---------- 卖家卖出记录（游戏端 /ctm income 用，只返回最新 10 条，更多去网页看） ----------
router.get('/income/:username', requireServerKey, (req, res) => {
  const rows = db.prepare(`
    SELECT o.id, o.item_id, i.title, o.buyer_username, o.quantity, o.unit_price, o.total_price, o.status, o.created_at
    FROM orders o JOIN items i ON o.item_id = i.id
    WHERE i.seller_username = ?
    ORDER BY o.created_at DESC
    LIMIT 10
  `).all(req.params.username);
  res.json({ code: 0, orders: rows });
});

// ---------- 卖家未领取收入查询 ----------
router.get('/income-pending/:username', requireServerKey, (req, res) => {
  const rows = db.prepare(`
    SELECT si.id, si.amount, i.title, si.created_at
    FROM seller_income si JOIN items i ON si.item_id = i.id
    WHERE si.seller_username = ? AND si.claimed = 0
    ORDER BY si.created_at DESC
  `).all(req.params.username);
  const total = rows.reduce((s, r) => s + r.amount, 0);
  res.json({ code: 0, unclaimed: total, records: rows });
});

// ---------- 领取收入（标记为已领取） ----------
router.post('/income-claim', requireServerKey, (req, res) => {
  const { username, amount } = req.body;
  if (!username || !amount) return res.status(400).json({ code: 400, msg: '参数错误' });
  // 校验未领取总额 >= amount，然后扣减
  const rows = db.prepare(
    "SELECT id, amount FROM seller_income WHERE seller_username = ? AND claimed = 0 ORDER BY created_at ASC"
  ).all(username);
  const total = rows.reduce((s, r) => s + r.amount, 0);
  if (total < amount) return res.status(400).json({ code: 400, msg: '未领取余额不足' });
  let need = amount;
  for (const r of rows) {
    if (need <= 0) break;
    const take = Math.min(r.amount, need);
    // 部分领取：记录实际领取
    db.prepare("UPDATE seller_income SET claimed = 1 WHERE id = ?").run(r.id);
    need -= take;
  }
  res.json({ code: 0, msg: '领取成功', claimed: amount });
});

// ---------- 我的购买记录（网页，登录态，分页） ----------
router.get('/my-bought', requireUser, (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20));
  const offset = (page - 1) * pageSize;
  const base = "FROM orders o JOIN items i ON o.item_id = i.id WHERE o.buyer_username = ?";
  const total = db.prepare(`SELECT COUNT(*) AS c ${base}`).get(req.user.username).c;
  // 累计消耗（全量统计，不受分页影响）
  const totalSpent = db.prepare(`SELECT COALESCE(SUM(o.total_price),0) AS s ${base}`).get(req.user.username).s;
  const rows = db.prepare(`
    SELECT o.id, o.item_id, i.title, i.seller_username, o.quantity, o.unit_price, o.total_price, o.created_at
    ${base} ORDER BY o.created_at DESC LIMIT ? OFFSET ?
  `).all(req.user.username, pageSize, offset);
  res.json({ code: 0, orders: rows, total, totalSpent, page, pageSize });
});

// ---------- 我的卖出记录（网页，登录态，分页） ----------
router.get('/my-sold', requireUser, (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20));
  const offset = (page - 1) * pageSize;
  const base = "FROM orders o JOIN items i ON o.item_id = i.id WHERE i.seller_username = ?";
  const total = db.prepare(`SELECT COUNT(*) AS c ${base}`).get(req.user.username).c;
  // 累计盈利（全量统计，不受分页影响）
  const totalEarned = db.prepare(`SELECT COALESCE(SUM(o.total_price),0) AS s ${base}`).get(req.user.username).s;
  const rows = db.prepare(`
    SELECT o.id, o.item_id, i.title, o.buyer_username, o.quantity, o.unit_price, o.total_price, o.created_at
    ${base} ORDER BY o.created_at DESC LIMIT ? OFFSET ?
  `).all(req.user.username, pageSize, offset);
  res.json({ code: 0, orders: rows, total, totalEarned, page, pageSize });
});

module.exports = router;
