// =============================================================================
// 数据库初始化（node:sqlite）
// =============================================================================
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const DB_PATH = path.join(__dirname, 'data.db');

// 管理员导入（restore）应用：启动时若存在 pending_restore.db，
// 先备份当前库，再覆盖 data.db（旧库备份为 data.db.pre_restore.bak）
const fs = require('node:fs');
const PENDING_RESTORE = path.join(__dirname, 'pending_restore.db');
if (fs.existsSync(PENDING_RESTORE)) {
  try {
    const bak = DB_PATH + '.pre_restore.bak';
    if (fs.existsSync(bak)) fs.unlinkSync(bak);
    if (fs.existsSync(DB_PATH)) fs.copyFileSync(DB_PATH, bak);
    for (const f of ['data.db-wal', 'data.db-shm']) {
      const p = path.join(__dirname, f);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    fs.copyFileSync(PENDING_RESTORE, DB_PATH);
    fs.unlinkSync(PENDING_RESTORE);
    console.log('[xiuxian_ctm] 已应用数据库导入（旧库已备份为 data.db.pre_restore.bak）');
  } catch (e) {
    console.error('[xiuxian_ctm] 数据库导入应用失败：', e.message);
  }
}

const db = new DatabaseSync(DB_PATH);

// 开启 WAL 提升并发读写性能
db.exec('PRAGMA journal_mode = WAL;');

// 建表
db.exec(`
-- 服务器表（每服一个密钥，用于 API 鉴权）
CREATE TABLE IF NOT EXISTS servers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  secret TEXT NOT NULL,
  cross_trade INTEGER NOT NULL DEFAULT 0
);

-- 账号
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  xuid TEXT,
  server_id TEXT,
  is_admin INTEGER NOT NULL DEFAULT 0,  -- 1=管理员（可备份/导入数据库）
  readonly INTEGER NOT NULL DEFAULT 0,  -- 1=只读测试账号（禁止购买/任何写操作）
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 商品（单商品库存池：total_count 上架总量 / remaining 剩余可购）
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  server_id TEXT NOT NULL,
  seller_username TEXT NOT NULL,
  seller_xuid TEXT,
  title TEXT NOT NULL,
  item_type TEXT NOT NULL,          -- minecraft:apple 等，用于图标占位
  item_data TEXT NOT NULL,          -- 完整物品 NBT/快照 JSON
  unit_price INTEGER NOT NULL,      -- 单价（灵石）
  total_count INTEGER NOT NULL,     -- 上架总量
  remaining INTEGER NOT NULL,       -- 剩余可购数量
  status TEXT NOT NULL DEFAULT 'on_sale',  -- on_sale / sold / off（下架）
  deleted INTEGER NOT NULL DEFAULT 0,      -- 0正常 / 1已删除（软删）
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 购物车（可多人加同一商品）
CREATE TABLE IF NOT EXISTS cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 订单（每次购买生成一条，含数量与总价）
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  buyer_username TEXT NOT NULL,
  buyer_xuid TEXT,
  server_id TEXT NOT NULL,          -- 商品所属服务器
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid',   -- paid / delivered / settled
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 卖家收入（支付成功后自动记入，游戏端领取）
CREATE TABLE IF NOT EXISTS seller_income (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_username TEXT NOT NULL,
  item_id INTEGER NOT NULL,
  order_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,          -- 应得灵石
  claimed INTEGER NOT NULL DEFAULT 0,  -- 0未领取 / 1已领取
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 下架待取回（网页下架后，游戏端取回剩余物品）
CREATE TABLE IF NOT EXISTS pickups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_username TEXT NOT NULL,
  item_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_data TEXT NOT NULL,          -- 完整物品 NBT/快照
  remaining INTEGER NOT NULL,       -- 剩余数量
  taken INTEGER NOT NULL DEFAULT 0, -- 0待取 / 1已取
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

-- 玩家修仙信息上报（点击卖家查看）
CREATE TABLE IF NOT EXISTS player_profiles (
  username TEXT PRIMARY KEY,
  xuid TEXT,
  server_id TEXT,
  game_name TEXT,                   -- 游戏名
  realm TEXT,                       -- 境界（如 筑基中期）
  realm_color TEXT,                 -- 境界颜色码
  realm_level INTEGER DEFAULT 0,    -- 境界等级数字（排行榜排序用）
  alchemy_level INTEGER DEFAULT 0,  -- 炼丹师品阶（0=无）
  alchemy_title TEXT,               -- 炼丹师称号
  alchemy_stats TEXT DEFAULT '{}',  -- 各丹药炼制次数（JSON，炼丹师榜）
  alchemy_count TEXT DEFAULT '{}',  -- 各品质成功次数（JSON，如 {"1":38}）
  alchemy_total INTEGER DEFAULT 0,  -- 炼丹总次数（各品质成功次数 + 失败次数）
  alchemy_fail INTEGER DEFAULT 0,   -- 炼丹失败次数
  root_type TEXT,                   -- 灵根类型（单/双/三/伪灵根）
  elements TEXT,                    -- 五行属性（JSON数组）
  spirit_power TEXT,                -- 五行属性值（JSON对象）
  spirit_stone INTEGER DEFAULT 0,   -- 灵石数量（游戏端上报）
  cultivation INTEGER DEFAULT 0,    -- 修为（境界榜同境界比修为）
  last_active INTEGER,              -- 最后活跃时间戳（ms）
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
`);

// 迁移：老库 player_profiles 表可能没有新字段（幂等，已存在则忽略）
try {
  db.exec("ALTER TABLE player_profiles ADD COLUMN realm_level INTEGER DEFAULT 0");
} catch (e) { /* 已存在 */ }
try {
  db.exec("ALTER TABLE player_profiles ADD COLUMN alchemy_stats TEXT DEFAULT '{}'");
} catch (e) { /* 已存在 */ }
try {
  db.exec("ALTER TABLE player_profiles ADD COLUMN alchemy_total INTEGER DEFAULT 0");
} catch (e) { /* 已存在 */ }
try {
  db.exec("ALTER TABLE player_profiles ADD COLUMN alchemy_fail INTEGER DEFAULT 0");
} catch (e) { /* 已存在 */ }
try {
  db.exec("ALTER TABLE player_profiles ADD COLUMN alchemy_count TEXT DEFAULT '{}'");
} catch (e) { /* 已存在 */ }

try {
  db.exec("ALTER TABLE player_profiles ADD COLUMN cultivation INTEGER DEFAULT 0");
} catch (e) { /* 已存在 */ }
try {
  db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0");
} catch (e) { /* 已存在 */ }
try {
  db.exec("ALTER TABLE users ADD COLUMN readonly INTEGER DEFAULT 0");
} catch (e) { /* 已存在 */ }

module.exports = db;
