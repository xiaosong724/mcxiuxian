// =============================================================================
// 排行榜接口（网页）
// GET /api/rank?type=realm|stone|alchemy&limit=20
// 炼丹师榜排序：按炼丹师品阶（一品→九品，九品最大）；
// 同品阶按炼制丹药品阶次数逐级比较（先比九品成功次数，九品无/相同再比八品，依此类推）
// =============================================================================
const express = require('express');
const db = require('../db');

const router = express.Router();

// 丹药名映射（与游戏端 DAN_RECIPES 对应）
const DAN_NAMES = {
  huiling: '回灵丹', peiyuan: '培元丹', wuxing: '五行丹',
  xuming: '续命丹', pozhang: '破障丹', xisui: '洗髓丹'
};

router.get('/', (req, res) => {
  const type = req.query.type || 'realm';
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const rows = db.prepare('SELECT * FROM player_profiles').all();
  // JSON 列防御解析（历史脏数据可能是双层序列化/带引号）
  const parseJson = (v) => {
    if (!v) return {};
    try {
      const p = JSON.parse(v);
      return typeof p === 'string' ? JSON.parse(p) : p;
    } catch { return {}; }
  };
  const arr = rows.map(r => ({
    username: r.username,
    gameName: r.game_name || r.username,
    realm: r.realm || '未上报',
    realmColor: r.realm_color || '',
    realmLevel: r.realm_level || 0,
    spiritStone: r.spirit_stone || 0,
    cultivation: r.cultivation || 0,
    alchemyLevel: r.alchemy_level || 0,
    alchemyTitle: r.alchemy_title || '未入门',
    alchemyTotal: r.alchemy_total || 0,
    alchemyFail: r.alchemy_fail || 0,
    alchemyStats: parseJson(r.alchemy_stats),
    alchemyCount: parseJson(r.alchemy_count)
  }));

  if (type === 'realm') {
    // 境界榜：先比境界等级，同境界比修为
    arr.sort((a, b) => (b.realmLevel || 0) - (a.realmLevel || 0) || (b.cultivation || 0) - (a.cultivation || 0));
  } else if (type === 'stone') {
    arr.sort((a, b) => (b.spiritStone || 0) - (a.spiritStone || 0));
  } else if (type === 'alchemy') {
    arr.sort((a, b) => {
      // 主：炼丹师品阶（九品最大）
      if (a.alchemyLevel !== b.alchemyLevel) return b.alchemyLevel - a.alchemyLevel;
      // 次：九品→一品逐级比较成功次数（某品级次数多者靠前）
      for (let q = 9; q >= 1; q--) {
        const ca = a.alchemyCount[q] || 0;
        const cb = b.alchemyCount[q] || 0;
        if (ca !== cb) return cb - ca;
      }
      return 0;
    });
  }

  const list = arr.slice(0, limit).map((r, i) => ({ rank: i + 1, ...r }));
  res.json({ code: 0, type, list, danNames: DAN_NAMES });
});

module.exports = router;
