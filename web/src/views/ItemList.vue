<template>
  <div class="container">
    <h1 class="page-title">⛩ 天南交易所</h1>

    <div class="tip-banner pixel-panel">
      ℹ️ 本站为游戏<b>[Minecraft]</b>辅助交易平台，新玩家请先在服务器内执行 <code>/ctm reg</code> 完成注册后登录。
    </div>

    <div class="row card pixel-panel" style="justify-content: space-between;">
      <div class="row">
        <span class="muted">服务器：</span>
        <select v-model="serverId" class="pixel-input" style="width:auto;">
          <option v-if="showAllOption" value="">全部服务器</option>
          <option v-for="s in serverOptions" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <span class="muted">类型：</span>
        <select v-model="itemType" class="pixel-input" style="width:auto;">
          <option value="">全部类型</option>
          <option value="pill">丹药</option>
          <option value="herb">药材</option>
          <option value="core">妖丹</option>
          <option value="bag">储物袋</option>
        </select>
      </div>
      <span class="muted">共 {{ total }} 件商品</span>
    </div>

    <div class="items-grid">
      <div v-for="it in items" :key="it.id" class="item-card pixel-panel" @click="openDetail(it)">
        <ItemIcon :item-type="it.itemType" :title="it.title" />
        <div class="title">
          <div class="item-name">{{ splitTitle(it.title).name }}</div>
          <div class="item-attrs" v-if="splitTitle(it.title).attrs">{{ splitTitle(it.title).attrs }}</div>
        </div>
        <div class="price">💎 {{ it.unitPrice }} 灵石/个</div>
        <div class="remaining">剩余 {{ it.remaining }} 个</div>
        <div class="muted">服务器：{{ serverName(it.serverId) }}</div>
        <div class="muted">卖家：<a href="#" class="seller-link" @click.stop.prevent="showSeller(it.seller)">{{ it.seller }}</a></div>
      </div>
    </div>

    <div class="pagination" v-if="total > pageSize">
      <button class="page-btn" :disabled="page <= 1" @click="changePage(page - 1)">‹ 上一页</button>
      <span class="page-info">第 {{ page }} / {{ totalPages }} 页</span>
      <button class="page-btn" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页 ›</button>
    </div>

    <div v-if="items.length === 0" class="card pixel-panel muted" style="text-align:center;padding:40px;">
      {{ emptyTip }}
    </div>

    <!-- 商品详情弹窗 -->
    <div v-if="detail" class="modal-mask" @click.self="detail = null">
      <div class="modal pixel-panel">
        <h3 class="detail-name">{{ splitTitle(detail.title).name }}</h3>
        <div v-if="splitTitle(detail.title).attrs" class="detail-attrs">{{ splitTitle(detail.title).attrs }}</div>
        <div class="row" style="gap:20px;margin-top:8px;">
          <ItemIcon :item-type="detail.itemType" :title="detail.title" />
          <div>
            <div>单价：<span class="gold-price">{{ detail.unitPrice }}</span> 灵石</div>
            <div>剩余：{{ detail.remaining }} 个</div>
            <div>卖家：<a href="#" class="seller-link" @click.prevent="showSeller(detail.seller)">{{ detail.seller }}</a></div>
            <div class="muted">服务器：{{ detail.serverId }}</div>
          </div>
        </div>
        <div class="row" style="margin-top:14px;">
          <span>数量：</span>
          <input v-model.number="buyQty" type="number" min="1" :max="detail.remaining" class="pixel-input" style="width:80px;" />
        </div>
        <div class="actions">
          <button class="pixel-btn" @click="detail = null">取消</button>
          <button class="pixel-btn gold" @click="addToCart" :disabled="!store.isLogin">加入购物车</button>
        </div>
        <p v-if="!store.isLogin" class="muted" style="margin-top:8px;">请先登录后再加购</p>
      </div>
    </div>

    <!-- 卖家修仙信息弹窗 -->
    <div v-if="seller" class="modal-mask" @click.self="seller = null">
      <div class="modal pixel-panel" style="min-width:300px;">
        <h3>🧙 卖家信息：{{ seller.username }}</h3>
        <div v-if="sellerProfile" class="seller-info">
          <div class="row"><span class="muted">游戏名：</span><span>{{ sellerProfile.gameName || '-' }}</span></div>
          <div class="row"><span class="muted">累计成交：</span><span style="color:var(--gold);">{{ sellerProfile.soldCount || 0 }} 单</span></div>
          <div class="row"><span class="muted">境界：</span><span :style="{ color: sellerProfile.realmColor || 'var(--text)' }">{{ sellerProfile.realm || '未上报' }}</span></div>
          <div class="row"><span class="muted">炼丹师：</span><span>{{ sellerProfile.alchemyTitle || '未入门' }}</span></div>
          <div class="row"><span class="muted">灵根：</span>
            <span>{{ sellerProfile.rootType || '-' }}
              <template v-if="sellerProfile.spiritPower && Object.keys(sellerProfile.spiritPower).length">
                <span v-for="(v, el) in sellerProfile.spiritPower" :key="el" class="elem-badge">{{ el }} {{ v }}</span>
              </template>
            </span>
          </div>
          <div class="row">
            <span class="muted">五行属性：</span>
            <span>
              <template v-if="sellerProfile.elements && sellerProfile.elements.length">
                <span v-for="el in sellerProfile.elements" :key="el" class="elem-badge">{{ el }} {{ sellerProfile.spiritPower[el] || 0 }}</span>
              </template>
              <template v-else>-</template>
            </span>
          </div>
          <div class="row">
            <span class="muted">状态：</span>
            <span :style="{ color: sellerProfile.online ? 'var(--accent)' : 'var(--danger)' }">
              {{ sellerProfile.online ? '● 在线' : '○ 离线' }}
            </span>
          </div>
        </div>
        <div v-else-if="sellerLoading" class="muted">加载中...</div>
        <div v-else class="muted">{{ sellerError }}</div>
        <div class="actions">
          <button class="pixel-btn" @click="seller = null">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { inject } from 'vue'
import { api } from '../api'
import { useUserStore } from '../store'
import ItemIcon from '../components/ItemIcon.vue'

const store = useUserStore()
const toast = inject('toast')
const items = ref([])
// 默认选中自己账号所属服务器；未登录默认全部
const serverId = ref(store.isLogin ? (store.serverId || '') : '')
const itemType = ref('')
const servers = ref([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const detail = ref(null)
const buyQty = ref(1)
// 卖家信息
const seller = ref(null)
const sellerProfile = ref(null)
const sellerLoading = ref(false)
const sellerError = ref('')

// 本服 id（账号归属服；不在服务器列表时用第一个，避免旧缓存失效）
const myServerId = ref(store.serverId || '')

// 跨服状态看「本服」（账号归属服），不是当前选中项 —— 选「全部服务器」时 serverId='' 不会误判
const myCrossOpen = computed(() => {
  const s = servers.value.find(x => x.id === myServerId.value)
  return !!(s && s.cross_trade === 1)
})
// 跨服关闭（且已登录）：只显示自己服务器；跨服开启或未登录：显示全部服务器
const serverOptions = computed(() => {
  if (store.isLogin && !myCrossOpen.value) return servers.value.filter(s => s.id === myServerId.value)
  return servers.value
})
// 「全部服务器」选项仅「已登录且本服跨服开启」时显示；
// 未登录游客默认选中第一个服务器，不受跨服状态影响
const showAllOption = computed(() => store.isLogin && myCrossOpen.value)

// 服务器 id → 名称（找不到则显示 id 本身）
function serverName(id) {
  const s = servers.value.find(x => x.id === id)
  return s ? s.name : (id || '-')
}

// 空列表提示：跨服关闭时选了别的服/全部 → 看不到
const emptyTip = computed(() => {
  if (store.isLogin && !myCrossOpen.value && serverId.value !== myServerId.value) {
    return '跨服交易未开启，只能查看本服商品'
  }
  if (serverId.value === '' && servers.value.length > 0 && servers.value.every(s => s.cross_trade !== 1)) {
    return '跨服交易未开启，暂无商品（管理员可用 /ctm cross on 开启）'
  }
  return '暂无在售商品'
})

async function load() {
  const r = await api.getItems(serverId.value, itemType.value, page.value, pageSize)
  if (r.code === 0) {
    items.value = r.items
    total.value = r.total || 0
  }
}

async function loadServers() {
  const r = await api.getServers()
  if (r.code === 0) {
    servers.value = r.servers || []
    // 修正本服 id：账号归属服不在列表（旧缓存/被删）→ 用第一个服务器
    if (!servers.value.some(s => s.id === myServerId.value)) {
      myServerId.value = servers.value.length > 0 ? servers.value[0].id : ''
    }
    // 修正当前选中：不在列表 → 本服；未登录 → 第一个
    if (!servers.value.some(s => s.id === serverId.value)) {
      serverId.value = store.isLogin ? myServerId.value : (servers.value.length > 0 ? servers.value[0].id : '')
    }
    // 跨服关闭时，若选的是「全部/其它服」→ 回退到本服
    if (store.isLogin && !myCrossOpen.value && serverId.value !== myServerId.value) {
      serverId.value = myServerId.value
    }
  }
}

function changePage(p) {
  page.value = p
  load()
}

// 切换服务器/类型筛选时回到第一页重新加载
watch([serverId, itemType], () => {
  page.value = 1
  load()
})

function openDetail(it) {
  detail.value = { ...it }
  buyQty.value = 1
}

async function showSeller(username) {
  seller.value = { username }
  sellerProfile.value = null
  sellerLoading.value = true
  sellerError.value = ''
  const r = await api.getProfile(username)
  sellerLoading.value = false
  if (r.code === 0) {
    sellerProfile.value = r.profile
  } else {
    sellerError.value = r.msg || '无法获取卖家信息'
  }
}

// 拆分标题：名字 = 属性之前的部分，属性 = 剩余
// 优先按 "XX：" 冒号拆分；无冒号则按第一个空格拆（物品名 + 修饰词）
function splitTitle(title) {
  if (!title) return { name: '', attrs: '' }
  // 规则1：找 "XX：" 冒号
  const idx = title.search(/[\u4e00-\u9fa5A-Za-z0-9]+：/)
  if (idx !== -1) return { name: title.slice(0, idx).trim(), attrs: title.slice(idx).trim() }
  // 规则2：无冒号，按第一个空格拆
  const sp = title.indexOf(' ')
  if (sp !== -1) return { name: title.slice(0, sp).trim(), attrs: title.slice(sp + 1).trim() }
  // 规则3：无空格无冒号，全部当名字
  return { name: title, attrs: '' }
}

async function addToCart() {
  const qty = Math.max(1, Math.min(buyQty.value || 1, detail.value.remaining))
  const r = await api.addCart(detail.value.id, qty)
  toast(r.msg || (r.code === 0 ? '已加入购物车' : '操作失败'))
  if (r.code === 0) detail.value = null
}

onMounted(() => {
  loadServers()
  load()
})
</script>

<style scoped>
.gold-price { color: var(--gold); font-weight: bold; }
.seller-link { color: var(--accent2); text-decoration: underline; cursor: pointer; }
.seller-info { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
.elem-badge {
  display: inline-block;
  padding: 2px 8px;
  margin-right: 4px;
  background: var(--bg-panel2);
  border: 1px solid var(--border);
  font-size: 12px;
}
/* 商品名大字 + 属性小字 */
.item-name { font-size: 15px; font-weight: bold; color: var(--text); line-height: 1.3; }
.item-attrs { font-size: 11px; color: var(--text-dim); margin-top: 2px; line-height: 1.3; }
.detail-name { color: var(--gold); }
.detail-attrs { font-size: 12px; color: var(--text-dim); margin-top: 4px; }
</style>
