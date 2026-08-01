<template>
  <div class="container">
    <h1 class="page-title">🛒 我的购物车</h1>
    <p class="muted" style="margin-bottom:12px;">
      在网页加入购物车后，请到游戏内使用 <code>/ctm cart</code> 查看并支付灵石获取物品。
    </p>

    <div class="card pixel-panel" v-if="cart.length === 0">
      <span class="muted">购物车空空如也，去市场逛逛吧</span>
    </div>

    <div class="card pixel-panel" v-else>
      <div class="table-wrap">
      <table class="list">
        <thead><tr><th>物品</th><th>单价</th><th>数量</th><th>剩余</th><th>状态</th><th></th></tr></thead>
        <tbody>
          <tr v-for="c in cart" :key="c.cart_id">
            <td data-label="物品">{{ c.title }}</td>
            <td data-label="单价">{{ c.unit_price }}</td>
            <td data-label="数量">{{ c.quantity }}</td>
            <td data-label="剩余">{{ c.remaining }}</td>
            <td data-label="状态">
              <span v-if="canBuy(c)" style="color:var(--accent);">可购买</span>
              <span v-else style="color:var(--danger);">失效</span>
            </td>
            <td data-label="操作"><button class="pixel-btn red" @click="remove(c.cart_id)">移除</button></td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { inject } from 'vue'
import { api } from '../api'
import { useUserStore } from '../store'

const store = useUserStore()
const toast = inject('toast')
const cart = ref([])
const servers = ref([])
// 本服 id（优先账号归属；若不在服务器列表则用第一个，避免旧缓存失效）
const myServerId = ref(store.serverId || '')

// 本服的跨服开关状态
const myCrossOpen = computed(() => {
  const s = servers.value.find(x => x.id === myServerId.value)
  return !!(s && s.cross_trade === 1)
})

// 可购买 = 在售 + 库存够 + （本服商品 或 已开启跨服）
function canBuy(c) {
  if (c.status !== 'on_sale' || c.remaining < c.quantity) return false
  if (c.server_id === myServerId.value) return true
  return myCrossOpen.value
}

async function load() {
  const r = await api.getCart()
  if (r.code === 0) cart.value = r.cart
  const sr = await api.getServers()
  if (sr.code === 0) {
    servers.value = sr.servers || []
    if (!servers.value.some(s => s.id === myServerId.value)) {
      myServerId.value = servers.value.length > 0 ? servers.value[0].id : ''
    }
  }
}

async function remove(id) {
  const r = await api.removeCart(id)
  toast(r.msg || '已移除')
  load()
}

onMounted(load)
</script>
