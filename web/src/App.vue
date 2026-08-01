<template>
  <div>
    <!-- 桌面端顶部导航 -->
    <nav class="navbar desktop-nav">
      <span class="logo">⛩ 天南交易所</span>
      <RouterLink to="/" exact-active-class="active">商品市场</RouterLink>
      <RouterLink to="/cart" active-class="active">我的购物车</RouterLink>
      <RouterLink to="/mine" active-class="active">我的上架</RouterLink>
      <RouterLink to="/orders" active-class="active">交易记录</RouterLink>
      <RouterLink to="/rank" active-class="active">排行榜</RouterLink>
      <span class="spacer"></span>
      <template v-if="store.isLogin">
        <span class="muted">修士：{{ store.username }}</span>
        <span class="coin">💎 {{ store.spiritStone }}</span>
        <a href="#" @click.prevent="logout" class="pixel-btn red">退出</a>
      </template>
      <template v-else>
        <RouterLink to="/login" class="pixel-btn">登录</RouterLink>
        <RouterLink to="/register" class="pixel-btn green">注册</RouterLink>
      </template>
    </nav>

    <RouterView />

    <!-- 移动端：登录后顶部显示灵石 -->
    <div v-if="store.isLogin" class="mobile-coin mobile-nav">
      <span>修士：{{ store.username }}</span>
      <span class="coin">💎 {{ store.spiritStone }}</span>
    </div>

    <!-- 移动端底部导航 -->
    <nav class="bottom-nav mobile-nav">
      <RouterLink to="/" exact-active-class="active" class="tab-item">
        <span class="tab-label">市场</span>
      </RouterLink>
      <RouterLink to="/cart" active-class="active" class="tab-item">
        <span class="tab-label">购物车</span>
      </RouterLink>
      <RouterLink to="/mine" active-class="active" class="tab-item">
        <span class="tab-label">我的</span>
      </RouterLink>
      <RouterLink to="/orders" active-class="active" class="tab-item">
        <span class="tab-label">记录</span>
      </RouterLink>
      <RouterLink to="/rank" active-class="active" class="tab-item">
        <span class="tab-label">排行</span>
      </RouterLink>
      <RouterLink v-if="!store.isLogin" to="/login" class="tab-item" active-class="active">
        <span class="tab-label">登录</span>
      </RouterLink>
      <a v-else href="#" @click.prevent="logout" class="tab-item">
        <span class="tab-label">退出</span>
      </a>
    </nav>

    <div v-if="toast" class="toast-msg pixel-panel">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide } from 'vue'
import { useUserStore } from './store'
import { api } from './api'

const store = useUserStore()
const toast = ref('')
function showToast(msg) { toast.value = msg; setTimeout(() => (toast.value = ''), 2500) }
provide('toast', showToast)

// 登录后拉取自己的灵石（游戏端上报），60 秒轮询保持最新
let coinTimer = null
async function refreshCoin() {
  if (!store.isLogin) return
  const r = await api.getMyProfile()
  if (r.code === 0 && r.profile) store.spiritStone = r.profile.spiritStone || 0
}

onMounted(() => {
  refreshCoin()
  coinTimer = setInterval(refreshCoin, 60000)
})
onUnmounted(() => { if (coinTimer) clearInterval(coinTimer) })

function logout() {
  store.logout()
  window.location.href = '/'
}
</script>
