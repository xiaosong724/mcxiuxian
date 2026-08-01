<template>
  <div class="container">
    <h1 class="page-title">📜 我的交易记录</h1>

    <div class="row card pixel-panel" style="gap:10px;">
      <button class="pixel-btn" :class="{ 'tab-active': tab === 'bought' }" @click="switchTab('bought')">🛒 购买记录</button>
      <button class="pixel-btn" :class="{ 'tab-active': tab === 'sold' }" @click="switchTab('sold')">💰 卖出记录</button>
    </div>

    <div class="card pixel-panel" v-if="!store.isLogin">
      <span class="muted">请先登录</span>
    </div>

    <template v-else>
      <div class="card pixel-panel summary" v-if="total > 0">
        <span v-if="tab === 'bought'">🪙 累计消耗：<b class="gold-price">{{ summary }}</b> 灵石</span>
        <span v-else>💰 累计盈利：<b class="gold-price">{{ summary }}</b> 灵石</span>
        <span class="muted">共 {{ total }} 条记录</span>
      </div>

      <div class="card pixel-panel" v-if="list.length === 0">
        <span class="muted">{{ tab === 'bought' ? '暂无购买记录' : '暂无卖出记录' }}</span>
      </div>

      <div class="card pixel-panel" v-else>
        <div class="table-wrap">
        <table class="list orders-table">
          <thead>
            <tr>
              <th>物品</th>
              <th v-if="tab === 'bought'">卖家</th>
              <th v-else>买家</th>
              <th>数量</th>
              <th>单价</th>
              <th>总价</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in list" :key="o.id">
              <td data-label="物品">{{ o.title }}</td>
              <td data-label="交易对象">{{ tab === 'bought' ? o.seller_username : o.buyer_username }}</td>
              <td data-label="数量">{{ o.quantity }}</td>
              <td data-label="单价">{{ o.unit_price }}</td>
              <td data-label="总价" class="gold-price">{{ o.total_price }}</td>
              <td data-label="时间" class="muted">{{ o.created_at }}</td>
            </tr>
          </tbody>
        </table>
        </div>
        <div class="pagination">
          <button class="page-btn" :disabled="page <= 1" @click="changePage(page - 1)">‹ 上一页</button>
          <span class="page-info">第 {{ page }} / {{ totalPages }} 页</span>
          <button class="page-btn" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页 ›</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../api'
import { useUserStore } from '../store'

const store = useUserStore()
const tab = ref('bought')
const list = ref([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const summary = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

async function load() {
  if (!store.isLogin) return
  const r = tab.value === 'bought' ? await api.getMyBought(page.value) : await api.getMySold(page.value)
  if (r.code === 0) {
    list.value = r.orders
    total.value = r.total || 0
    // 累计消耗/盈利为全量统计（后端返回，不受分页影响）
    summary.value = r.totalSpent !== undefined ? r.totalSpent : (r.totalEarned !== undefined ? r.totalEarned : 0)
  }
}

function changePage(p) {
  page.value = p
  load()
}

function switchTab(t) {
  tab.value = t
  page.value = 1
  list.value = []
  load()
}

onMounted(load)
</script>

<style scoped>
.tab-active { border-color: var(--gold); color: var(--gold); }
.gold-price { color: var(--gold); font-weight: bold; }
.summary { margin-bottom: 10px; padding: 10px 14px; font-size: 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }</style>
