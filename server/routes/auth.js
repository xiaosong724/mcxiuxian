// =============================================================================
// 账号接口：注册 / 登录 / 绑定 xuid / 忘记密码改密
// =============================================================================
const express = require('express');
const crypto = require('node:crypto');
const db = require('../db');
const { requireServerKey, requireUser, signToken } = require('../auth-middleware');

const router = express.Router();

// 密码哈希（scrypt，Node 内置，无需 bcrypt）
function hashPassword(pw, salt) {
  return crypto.scryptSync(pw, salt, 64).toString('hex');
}

// ---------- 注册（游戏内，带 serverKey + xuid） ----------
router.post('/register', requireServerKey, (req, res) => {
  const { username, password, xuid } = req.body;
  if (!username || !password) {
    return res.status(400).json({ code: 400, msg: '缺少账号或密码' });
  }
  if (!/^[a-zA-Z0-9]{4,16}$/.test(username)) {
    return res.status(400).json({ code: 400, msg: '账号需为4-16位纯英文或数字' });
  }
  if (password.length < 6 || password.length > 32) {
    return res.status(400).json({ code: 400, msg: '密码需为6-32位' });
  }
  const exist = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (exist) {
    return res.status(409).json({ code: 409, msg: '账号已存在' });
  }
  // 该 xuid 已注册过账号则禁止再注册
  if (xuid) {
    const bound = db.prepare('SELECT username FROM users WHERE xuid = ?').get(xuid);
    if (bound) {
      return res.status(409).json({ code: 409, msg: '该玩家已注册账号：' + bound.username });
    }
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  db.prepare('INSERT INTO users (username, password_hash, xuid, server_id) VALUES (?, ?, ?, ?)')
    .run(username, salt + ':' + hash, xuid || null, req.server.id);
  res.json({ code: 0, msg: '注册成功' });
});

// ---------- 登录（网页） ----------
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ code: 400, msg: '缺少账号或密码' });
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(404).json({ code: 404, msg: '账号不存在' });
  }
  const [salt, hash] = String(user.password_hash).split(':');
  if (hashPassword(password, salt) !== hash) {
    return res.status(401).json({ code: 401, msg: '密码错误' });
  }
  res.json({ code: 0, msg: '登录成功', token: signToken(user), user: { id: user.id, username: user.username, xuid: user.xuid, server_id: user.server_id, is_admin: user.is_admin || 0, readonly: user.readonly || 0 } });
});

// ---------- 忘记密码：xuid + serverKey 改密 ----------
router.post('/reset-password', requireServerKey, (req, res) => {
  const { xuid, newPassword } = req.body;
  if (!xuid || !newPassword) {
    return res.status(400).json({ code: 400, msg: '缺少参数' });
  }
  if (newPassword.length < 6 || newPassword.length > 32) {
    return res.status(400).json({ code: 400, msg: '密码需为6-32位' });
  }
  // 按 xuid 找账号（同一 xuid 唯一绑定）
  const user = db.prepare('SELECT * FROM users WHERE xuid = ?').get(xuid);
  if (!user) {
    return res.status(404).json({ code: 404, msg: '该玩家未注册或未绑定账号' });
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(newPassword, salt);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(salt + ':' + hash, user.id);
  res.json({ code: 0, msg: '密码修改成功' });
});

// ---------- 我的信息（网页登录态） ----------
router.get('/me', requireUser, (req, res) => {
  res.json({ code: 0, user: req.user });
});

module.exports = router;
