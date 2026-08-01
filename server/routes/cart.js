// =============================================================================
// 购物车接口（网页操作）
// =============================================================================
const express = require('express');
const db = require('../db');
const { requireUser } = require('../auth-middleware');

const router = express.Router();

// ---------- 我的购物车 ----------
router.get('/', requireUser, (req, res) => {
  const rows = db.prepare(`
    SELECT c.id AS cart_id, c.quantity, c.item_id, i.title, i.item_type, i.unit_price,
           i.remaining, i.status, i.server_id
    FROM cart c JOIN items i ON c.item_id = i.id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `).all(req.user.id);
  res.json({ code: 0, cart: rows });
});

// ---------- 加购 ----------
router.post('/', requireUser, (req, res) => {
  const { itemId, quantity } = req.body;
  const qty = Math.floor(Number(quantity)) || 1;
  if (qty < 1 || qty > 64) return res.status(400).json({ code: 400, msg: '数量需为1-64' });
  const item = db.prepare("SELECT * FROM items WHERE id = ? AND status = 'on_sale'").get(Number(itemId));
  if (!item) return res.status(404).json({ code: 404, msg: '商品不存在或已下架' });
  if (qty > item.remaining) return res.status(400).json({ code: 400, msg: '库存不足' });
  db.prepare('INSERT INTO cart (user_id, item_id, quantity) VALUES (?, ?, ?)').run(req.user.id, item.id, qty);
  res.json({ code: 0, msg: '已加入购物车' });
});

// ---------- 移除购物车项 ----------
router.delete('/:cartId', requireUser, (req, res) => {
  const row = db.prepare('SELECT * FROM cart WHERE id = ? AND user_id = ?').get(Number(req.params.cartId), req.user.id);
  if (!row) return res.status(404).json({ code: 404, msg: '购物车项不存在' });
  db.prepare('DELETE FROM cart WHERE id = ?').run(row.id);
  res.json({ code: 0, msg: '已移除' });
});

module.exports = router;
