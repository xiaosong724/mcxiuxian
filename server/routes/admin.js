// =============================================================================
// 管理员接口：数据库备份 / 导入（JSON 全覆盖，免重启）
// 备份：全部表导出为 { 表名: [行...] } 的 JSON 文件
// 导入：校验后，在事务内清空全部表并按 JSON 重写（原子，失败自动回滚）
// 动态反射表结构（sqlite_master + PRAGMA table_info），新增表无需改代码
// =============================================================================
const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../auth-middleware');
const geoip = require('geoip-lite');

const router = express.Router();

// 中国省级 ISO 码 → 中文名
const REGION_CN = {
  BJ: '北京', TJ: '天津', HE: '河北', SX: '山西', NM: '内蒙古', LN: '辽宁', JL: '吉林', HL: '黑龙江',
  SH: '上海', JS: '江苏', ZJ: '浙江', AH: '安徽', FJ: '福建', JX: '江西', SD: '山东', HA: '河南',
  HB: '湖北', HN: '湖南', GD: '广东', GX: '广西', HI: '海南', CQ: '重庆', SC: '四川', GZ: '贵州',
  YN: '云南', XZ: '西藏', SN: '陕西', GS: '甘肃', QH: '青海', NX: '宁夏', XJ: '新疆', TW: '台湾',
  HK: '香港', MO: '澳门'
};

// IP → 地域中文（离线 geoip-lite）
function regionOf(ip) {
  try {
    const g = geoip.lookup(String(ip || '').replace(/^::ffff:/, ''));
    if (!g) return '未知';
    if (g.country === 'CN') return '中国' + (REGION_CN[g.region] ? '·' + REGION_CN[g.region] : '');
    const map = { CN: '中国', US: '美国', JP: '日本', KR: '韩国', HK: '中国香港', TW: '中国台湾', SG: '新加坡', DE: '德国', GB: '英国', FR: '法国', RU: '俄罗斯', AU: '澳大利亚', CA: '加拿大' };
    return map[g.country] || g.country;
  } catch { return '未知'; }
}

// ---------- 访问埋点（前端页面加载上报，公开） ----------
// body: { visitorId, path, username? }  登录时带 username，历史游客记录回填
router.post('/visit', (req, res) => {
  try {
    const { visitorId, path: p, username } = req.body || {};
    if (!visitorId) return res.json({ code: 0 });
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';
    // 登录用户：把该访客标识的历史记录回填游戏名（游客 → 玩家）
    if (username) {
      db.prepare("UPDATE visit_logs SET username=? WHERE visitor_id=? AND (username IS NULL OR username='')")
        .run(username, String(visitorId));
    }
    db.prepare('INSERT INTO visit_logs (ip, ua, path, visitor_id, username) VALUES (?,?,?,?,?)')
      .run(ip, String(req.headers['user-agent'] || '').slice(0, 200), String(p || '/').slice(0, 100), String(visitorId).slice(0, 64), username || null);
    res.json({ code: 0 });
  } catch (e) {
    res.status(500).json({ code: 500, msg: '记录失败' });
  }
});

// ---------- 访问统计（PV/UV/今日/最近访问，分页+搜索） ----------
// ?page=&pageSize=&name=&region=
//   name：登录游戏名 或 游客编号（如 游客1）；region：地域文字（如 广东）
router.get('/stats', requireAdmin, (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 20));
    const offset = (page - 1) * pageSize;

    const totalPV = db.prepare('SELECT COUNT(*) c FROM visit_logs').get().c;
    const totalUV = db.prepare('SELECT COUNT(DISTINCT ip) c FROM visit_logs').get().c;
    const today = db.prepare("SELECT COUNT(*) c FROM visit_logs WHERE date(created_at)=date('now','localtime')").get().c;
    const todayUV = db.prepare("SELECT COUNT(DISTINCT ip) c FROM visit_logs WHERE date(created_at)=date('now','localtime')").get().c;

    // 取全部记录（JS 处理身份/地域/过滤；数据量大后可改 SQL+缓存优化）
    const rows = db.prepare('SELECT id, ip, visitor_id, username, path, created_at FROM visit_logs ORDER BY id DESC').all();

    // 游客编号：无 username 的 visitor_id 按最早出现顺序编号
    const guestOrder = [];
    for (const r of rows) {
      if (!r.username && r.visitor_id && guestOrder.indexOf(r.visitor_id) === -1) guestOrder.push(r.visitor_id);
    }
    const guestNo = {};
    guestOrder.forEach((v, i) => { guestNo[v] = i + 1; });

    // 身份 + 地域
    const list = rows.map(r => {
      const identity = r.username || (r.visitor_id && guestNo[r.visitor_id] ? '游客' + guestNo[r.visitor_id] : '游客·' + (r.ip || ''));
      return { id: r.id, identity, username: r.username || '', ip: r.ip, region: regionOf(r.ip), path: r.path || '/', time: r.created_at };
    });

    // 过滤
    const name = (req.query.name || '').trim();
    const region = (req.query.region || '').trim();
    const filtered = list.filter(v => {
      if (name && !v.identity.includes(name) && !(v.username || '').includes(name)) return false;
      if (region && !v.region.includes(region)) return false;
      return true;
    });

    const recent = filtered.slice(offset, offset + pageSize);
    res.json({ code: 0, stats: { totalPV, totalUV, todayPV: today, todayUV }, list: recent, total: filtered.length, page, pageSize });
  } catch (e) {
    res.status(500).json({ code: 500, msg: '统计失败：' + e.message });
  }
});

// 读取全部业务表名（排除 sqlite 内部表）
function getTables() {
  return db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  ).all().map(r => r.name);
}

// 读取某表的所有列名
function getColumns(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
}

// ---------- 备份：导出全部表为 JSON 下载 ----------
router.get('/backup', requireAdmin, (req, res) => {
  try {
    const data = {};
    for (const t of getTables()) {
      data[t] = db.prepare(`SELECT * FROM ${t}`).all();
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=xiuxian_ctm_backup_' + Date.now() + '.json');
    res.send(JSON.stringify({ version: 1, tables: data }));
  } catch (e) {
    res.status(500).json({ code: 500, msg: '备份失败：' + e.message });
  }
});

// ---------- 导入：JSON 全覆盖（事务，免重启） ----------
router.post('/restore', requireAdmin, (req, res) => {
  const { file } = req.body || {};
  if (!file || typeof file !== 'string') {
    return res.status(400).json({ code: 400, msg: '未选择文件' });
  }
  let parsed;
  try {
    parsed = JSON.parse(Buffer.from(file, 'base64').toString('utf8'));
  } catch (e) {
    return res.status(400).json({ code: 400, msg: '文件不是有效的 JSON' });
  }
  // 校验结构：{ version, tables: { 表名: [行] } }
  if (!parsed || typeof parsed !== 'object' || !parsed.tables || typeof parsed.tables !== 'object') {
    return res.status(400).json({ code: 400, msg: '备份文件结构不正确' });
  }
  const tables = getTables();
  const tableSet = new Set(tables);
  try {
    // 逐表预校验（列名必须存在，行必须是对象）
    const prepared = {};
    for (const [name, rows] of Object.entries(parsed.tables)) {
      if (!tableSet.has(name)) throw new Error('包含未知表：' + name);
      if (!Array.isArray(rows)) throw new Error('表 ' + name + ' 数据格式错误');
      const cols = getColumns(name);
      const colSet = new Set(cols);
      const insertCols = [];
      for (const row of rows) {
        if (row === null || typeof row !== 'object') throw new Error('表 ' + name + ' 含非法行');
        for (const k of Object.keys(row)) {
          if (!colSet.has(k)) throw new Error('表 ' + name + ' 含未知列：' + k);
          if (insertCols.indexOf(k) === -1) insertCols.push(k);
        }
      }
      prepared[name] = { rows, cols: insertCols };
    }

    // 事务内全覆盖写入
    db.exec('BEGIN');
    try {
      // 先清空全部业务表
      for (const t of tables) db.exec(`DELETE FROM ${t}`);
      // 逐表插入（显式带 id 保持原值）
      for (const [name, { rows, cols }] of Object.entries(prepared)) {
        if (rows.length === 0) continue;
        const marks = cols.map(() => '?').join(',');
        const sql = `INSERT INTO ${name} (${cols.join(',')}) VALUES (${marks})`;
        const stmt = db.prepare(sql);
        for (const row of rows) {
          stmt.run(...cols.map(c => row[c] === undefined ? null : row[c]));
        }
      }
      db.exec('COMMIT');
    } catch (e) {
      try { db.exec('ROLLBACK'); } catch (_) { /* 忽略 */ }
      throw e;
    }
    res.json({ code: 0, msg: '导入成功，数据已全部覆盖（无需重启）' });
  } catch (e) {
    res.status(400).json({ code: 400, msg: '导入失败（已回滚）：' + e.message });
  }
});

module.exports = router;
