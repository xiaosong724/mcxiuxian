<template>
  <div class="container">
    <h1 class="page-title">📦 我的上架</h1>
    <p class="muted" style="margin-bottom:12px;">
      在游戏内使用 <code>/ctm sell &lt;价格&gt;</code> 上架手持物品。这里可管理自己的商品。
    </p>

    <div class="card pixel-panel" v-if="!store.isLogin">
      <span class="muted">请先登录</span>
    </div>

    <template v-else>
      <div class="card pixel-panel" v-if="items.length === 0">
        <span class="muted">你还没有上架商品</span>
      </div>

      <div class="card pixel-panel" v-else>
        <div class="table-wrap">
        <table class="list">
          <thead><tr><th>物品</th><th>单价</th><th>剩余/总量</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="it in visibleItems" :key="it.id">
              <td data-label="物品">{{ it.title }}</td>
              <td data-label="单价">{{ it.unit_price }}</td>
              <td data-label="剩余/总量">{{ it.remaining }} / {{ it.totalCount }}</td>
              <td data-label="状态">
                <span v-if="it.status === 'on_sale'" style="color:var(--accent);">在售</span>
                <span v-else-if="it.status === 'sold'" style="color:var(--danger);">已售罄</span>
                <span v-else-if="it.unclaimed" style="color:var(--gold);">未取回</span>
                <span v-else style="color:var(--text-dim);">已取回</span>
              </td>
              <td data-label="操作">
                <button v-if="it.status === 'on_sale'" class="pixel-btn red" @click="off(it.id)">下架</button>
                <button v-else-if="it.status === 'sold'" class="pixel-btn red" @click="del(it.id)">删除</button>
                <span v-else-if="it.unclaimed" class="muted">请到游戏内 /ctm back 取回</span>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { inject } from 'vue'
import { api } from '../api'
import { useUserStore } from '../store'

const store = useUserStore()
const toast = inject('toast')
const items = ref([])

// 显示：在售 + 已售罄 + 未取回的下架商品；已取回的下架商品隐藏
const visibleItems = computed(() => items.value.filter(it => it.status !== 'off' || it.unclaimed))

async function load() {
  if (!store.isLogin) return
  const r = await api.getSellerItems(store.username)
  if (r.code === 0) items.value = r.items
}

async function off(id) {
  const r = await api.offItem(id)
  toast(r.msg || '操作完成')
  if (r.code === 0) {
    // 提示游戏内取回剩余
    toast('已下架，请到游戏内取回剩余物品')
  }
  load()
}

async function del(id) {
  if (!confirm('确定删除该已售罄商品吗？删除后不再显示。')) return
  const r = await api.deleteItem(id)
  toast(r.msg || '操作完成')
  if (r.code === 0) load()
}

onMounted(load)
</script>
