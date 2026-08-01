// =============================================================================
// 鉴权中间件
// =============================================================================
const jwt = require('jsonwebtoken');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'xiuxian_ctm_secret_key_change_me';
const JWT_EXPIRE = '7d';

/**
 * 校验游戏服务器密钥（X-Server-Key 头）
 * 通过后 req.server = { id, name, cross_trade }
 * 插件首次加载会生成唯一 Key（svr_ 前缀）；未知的 svr_ Key 自动注册服务器
 */
function requireServerKey(req, res, next) {
  const key = req.headers['x-server-key'];
  if (!key) {
    return res.status(401).json({ code: 401, msg: '缺少服务器密钥' });
  }
  let server = db.prepare('SELECT * FROM servers WHERE id = ? OR secret = ?').get(key, key);
  if (!server && key.startsWith('svr_')) {
    // 插件首次加载生成的唯一 Key：自动注册服务器（cross_trade 默认关闭）
    const name = '服务器-' + key.slice(-6);
    db.prepare('INSERT INTO servers (id, name, secret, cross_trade) VALUES (?, ?, ?, 0)').run(key, name, key);
    server = db.prepare('SELECT * FROM servers WHERE id = ?').get(key);
    console.log('[xiuxian_ctm] 已自动注册服务器: ' + key + ' (' + name + ')');
  }
  if (!server) {
    return res.status(403).json({ code: 403, msg: '服务器密钥无效' });
  }
  req.server = server;
  next();
}

/**
 * 校验网页登录 token（Authorization: Bearer xxx）
 * 通过后 req.user = { id, username, xuid, server_id }
 */
function requireUser(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ code: 401, msg: '未登录' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, username, xuid, server_id FROM users WHERE id = ?').get(payload.uid);
    if (!user) {
      return res.status(401).json({ code: 401, msg: '账号不存在' });
    }
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ code: 401, msg: '登录已过期' });
  }
}

function signToken(user) {
  return jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}

module.exports = { requireServerKey, requireUser, signToken, JWT_SECRET };
