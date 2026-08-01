<template>
  <div class="container">
    <h1 class="page-title">🏆 修仙排行榜</h1>

    <div class="row card pixel-panel" style="gap:10px;">
      <button class="pixel-btn" :class="{ 'tab-active': tab === 'realm' }" @click="switchTab('realm')">🀄 境界榜</button>
      <button class="pixel-btn" :class="{ 'tab-active': tab === 'stone' }" @click="switchTab('stone')">💎 灵石榜</button>
      <button class="pixel-btn" :class="{ 'tab-active': tab === 'alchemy' }" @click="switchTab('alchemy')">⚗️ 炼丹师榜</button>
    </div>

    <div class="card pixel-panel" v-if="list.length === 0">
      <span class="muted">暂无数据（游戏内执行 /ctm 指令后自动上报）</span>
    </div>

    <div class="card pixel-panel" v-else>
      <div class="table-wrap">
      <table class="list">
        <thead>
          <tr>
            <th>排名</th>
            <th>玩家</th>
            <th v-if="tab === 'realm'">境界</th>
            <th v-else-if="tab === 'stone'">灵石</th>
            <th v-else>炼丹称号</th>
            <th v-if="tab === 'alchemy'">总炼制次数</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in list" :key="r.username">
            <td data-label="排名">
              <span :class="['rank-num', r.rank <= 3 ? 'rank-top' : '']">{{ r.rank }}</span>
            </td>
            <td data-label="玩家">
              <a v-if="tab === 'alchemy'" href="#" class="player-link" @click.prevent="showDetail(r)">{{ r.gameName }} <span class="muted">({{ r.username }})</span></a>
              <template v-else>{{ r.gameName }} <span class="muted">({{ r.username }})</span></template>
            </td>
            <td v-if="tab === 'realm'" data-label="境界">
              <span :style="{ color: r.realmColor || 'var(--text)' }">{{ r.realm }}</span>
            </td>
            <td v-else-if="tab === 'stone'" data-label="灵石" class="gold-price">{{ r.spiritStone }}</td>
            <td v-else data-label="炼丹称号">{{ r.alchemyTitle }}</td>
            <td v-if="tab === 'alchemy'" data-label="总炼制次数">
              {{ r.alchemyTotal }}
              <span v-if="r.alchemyFail > 0" class="muted">（失败 {{ r.alchemyFail }} 次）</span>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- 炼丹师详情弹窗 -->
    <div v-if="detail" class="modal-mask" @click.self="detail = null">
      <div class="modal pixel-panel">
        <h3>⚗️ {{ detail.gameName }} <span class="muted">({{ detail.username }})</span></h3>
        <div class="row"><span class="muted">炼丹称号：</span><span>{{ detail.alchemyTitle }}</span></div>
        <div class="row">
          <span class="muted">总炼制次数：</span>
          <span class="gold-price">{{ detail.alchemyTotal }} 次</span>
          <span class="muted">（失败 {{ detail.alchemyFail }} 次）</span>
        </div>
        <div class="detail-section">
          <div class="section-title">各丹药炼制数量</div>
          <div v-if="Object.keys(detail.alchemyStats).length" class="detail-tags">
            <span v-for="(v, k) in detail.alchemyStats" :key="k" class="dan-chip">
              {{ danNames[k] || k }} ×{{ v }}
            </span>
          </div>
          <div v-else class="muted">暂未炼丹</div>
        </div>
        <div class="detail-section">
          <div class="section-title">各品阶成功次数</div>
          <div v-if="Object.keys(detail.alchemyCount).length" class="detail-tags">
            <span v-for="(v, q) in detail.alchemyCount" :key="q" class="dan-chip">
              {{ qualityName(q) }} ×{{ v }}
            </span>
          </div>
          <div v-else class="muted">暂无记录</div>
        </div>
        <div class="actions">
          <button class="pixel-btn" @click="detail = null">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'

const tab = ref('realm')
const list = ref([])
const danNames = ref({})
const detail = ref(null)

// 品阶名（与游戏端 DAN_QUALITY_RATE 对应）
const QUALITY_NAMES = ['', '一品', '二品', '三品', '四品', '五品', '六品', '七品', '八品', '九品']
function qualityName(q) {
  return QUALITY_NAMES[Number(q)] || (q + '品')
}

function showDetail(r) {
  detail.value = r
}

async function load() {
  const r = await api.getRank(tab.value)
  if (r.code === 0) {
    list.value = r.list || []
    danNames.value = r.danNames || {}
  }
}

function switchTab(t) {
  tab.value = t
  list.value = []
  load()
}

onMounted(load)
</script>

<style scoped>
.tab-active { border-color: var(--gold); color: var(--gold); }
.rank-num { font-weight: bold; color: var(--text-dim); }
.rank-top { color: var(--gold); }
.alchemy-detail {
  margin-top: 14px;
  border-top: 2px dashed var(--border);
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.detail-row { font-size: 13px; line-height: 1.5; }
.dan-chip {
  display: inline-block;
  padding: 1px 8px;
  margin: 2px 4px 2px 0;
  background: var(--bg-panel2);
  border: 1px solid var(--border);
  font-size: 12px;
  border-radius: 3px;
}
.player-link { color: var(--accent2); cursor: pointer; text-decoration: none; }
.detail-section { margin-top: 12px; }
.section-title { color: var(--gold); font-size: 13px; margin-bottom: 6px; }
.detail-tags { line-height: 1.8; }
</style>
