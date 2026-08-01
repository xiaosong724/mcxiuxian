<template>
  <div class="container" style="max-width:420px;margin-top:60px;">
    <div class="tip-banner pixel-panel">
      ⚠️ 本站为游戏<b>[Minecraft]</b>辅助交易平台，新玩家请先在服务器内执行
      <code>/ctm reg</code> 完成注册后登录。
    </div>
    <div class="card pixel-panel">
      <h1 class="page-title">修士登录</h1>
      <div class="row" style="margin-bottom:12px;">
        <span style="width:70px;">账号：</span>
        <input v-model="username" class="pixel-input" placeholder="游戏内注册的账号" />
      </div>
      <div class="row" style="margin-bottom:20px;">
        <span style="width:70px;">密码：</span>
        <input v-model="password" type="password" class="pixel-input" @keyup.enter="doLogin" />
      </div>
      <div class="actions">
        <RouterLink to="/register" class="pixel-btn">去注册</RouterLink>
        <button class="pixel-btn green" @click="doLogin">登录</button>
      </div>
      <p v-if="err" class="muted" style="margin-top:10px;color:var(--danger);">{{ err }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import { useUserStore } from '../store'

const router = useRouter()
const store = useUserStore()
const username = ref('')
const password = ref('')
const err = ref('')

async function doLogin() {
  err.value = ''
  const r = await api.login(username.value, password.value)
  if (r.code === 0) {
    store.setLogin(r)
    router.push('/')
  } else {
    err.value = r.msg || '登录失败'
  }
}
</script>
