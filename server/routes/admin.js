// =============================================================================
// 管理员接口：数据库备份 / 导入（JSON 全覆盖，免重启）
// 备份：全部表导出为 { 表名: [行...] } 的 JSON 文件
// 导入：校验后，在事务内清空全部表并按 JSON 重写（原子，失败自动回滚）
// 动态反射表结构（sqlite_master + PRAGMA table_info），新增表无需改代码
// =============================================================================
const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../auth-middleware');

const router = express.Router();

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
