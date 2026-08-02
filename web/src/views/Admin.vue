<template>
  <div class="container">
    <h1 class="page-title">⚙️ 管理后台</h1>

    <div class="card pixel-panel">
      <h3 style="color:var(--gold);margin-bottom:12px;">📦 数据库备份与导入</h3>
      <p class="muted" style="margin-bottom:16px;">
        备份：下载当前网页服务器端的完整数据库（JSON 格式，全部表数据）。<br>
        导入：上传 JSON 备份文件全覆盖当前数据（事务写入，无需重启；覆盖后原数据无法找回，请谨慎）。
      </p>

      <div class="row" style="gap:12px;">
        <button class="pixel-btn gold" @click="backup" :disabled="busy">💾 备份数据库</button>
        <label class="pixel-btn green" :class="{ disabled: busy }">
          📥 导入数据库
          <input type="file" accept=".json,application/json" style="display:none" @change="onFile" />
        </label>
      </div>
      <p v-if="busy" class="muted" style="margin-top:10px;">处理中，请稍候...</p>
    </div>

    <div class="card pixel-panel">
      <h3 style="color:var(--gold);margin-bottom:12px;">📊 网站访问统计</h3>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-num">{{ stats.totalPV }}</div><div class="stat-label">总访问量（PV）</div></div>
        <div class="stat-card"><div class="stat-num">{{ stats.totalUV }}</div><div class="stat-label">总访客（IP）</div></div>
        <div class="stat-card"><div class="stat-num">{{ stats.todayPV }}</div><div class="stat-label">今日访问</div></div>
        <div class="stat-card"><div class="stat-num">{{ stats.todayUV }}</div><div class="stat-label">今日访客</div></div>
      </div>
      <div class="row" style="margin:14px 0 10px;gap:8px;">
        <input v-model="searchName" class="pixel-input" placeholder="按名字搜索（玩家名/游客1）" style="flex:1;min-width:140px;" @keyup.enter="search" />
        <input v-model="searchRegion" class="pixel-input" placeholder="按地域搜索（如 广东）" style="flex:1;min-width:120px;" @keyup.enter="search" />
        <button class="pixel-btn" @click="search">搜索</button>
      </div>
      <div class="table-wrap">
        <table class="list">
          <thead><tr><th>访客</th><th>IP</th><th>地域</th><th>页面</th><th>时间</th></tr></thead>
          <tbody>
            <tr v-for="v in list" :key="v.id">
              <td data-label="访客">
                <span :class="v.username ? 'logined' : 'guest'">{{ v.identity }}</span>
              </td>
              <td data-label="IP">{{ v.ip }}</td>
              <td data-label="地域">{{ v.region }}</td>
              <td data-label="页面">{{ v.path }}</td>
              <td data-label="时间" class="muted">{{ v.time }}</td>
            </tr>
            <tr v-if="list.length === 0"><td colspan="5" class="muted" style="text-align:center;">暂无访问记录</td></tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button class="page-btn" :disabled="page <= 1" @click="changePage(page - 1)">‹ 上一页</button>
        <span class="page-info">第 {{ page }} / {{ totalPages }} 页 · 共 {{ total }} 条</span>
        <button class="page-btn" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页 ›</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { api } from '../api'

const toast = inject('toast')
const busy = ref(false)
const stats = ref({ totalPV: 0, totalUV: 0, todayPV: 0, todayUV: 0 })
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const searchName = ref('')
const searchRegion = ref('')
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

async function loadStats() {
  const r = await api.adminStats(page.value, pageSize, searchName.value, searchRegion.value)
  if (r.code === 0) {
    stats.value = r.stats
    list.value = r.list || []
    total.value = r.total || 0
  }
}

function search() {
  page.value = 1
  loadStats()
}

function changePage(p) {
  page.value = p
  loadStats()
}

onMounted(loadStats)

async function backup() {
  if (busy.value) return
  busy.value = true
  try {
    const r = await api.adminBackup()
    if (r.code !== 0) return toast(r.msg || '备份失败')
    // 触发浏览器下载
    const url = URL.createObjectURL(r.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = r.filename
    a.click()
    URL.revokeObjectURL(url)
    toast('备份已下载')
  } catch (e) {
    toast('备份失败：' + (e.message || '网络错误'))
  } finally {
    busy.value = false
  }
}

function onFile(e) {
  const file = e.target.files && e.target.files[0]
  e.target.value = ''
  if (!file) return
  if (busy.value) return
  busy.value = true
  const reader = new FileReader()
  reader.onload = async () => {
    try {
      const base64 = String(reader.result).split(',')[1] || ''
      const r = await api.adminRestore(base64)
      toast(r.msg || (r.code === 0 ? '导入成功' : '导入失败'))
    } catch (err) {
      toast('导入失败：' + (err.message || '网络错误'))
    } finally {
      busy.value = false
    }
  }
  reader.onerror = () => { toast('读取文件失败'); busy.value = false }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.pixel-btn.disabled { opacity: .5; pointer-events: none; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; }
.stat-card { padding: 12px; text-align: center; background: var(--bg-panel2); border: 2px solid var(--border); border-radius: 6px; }
.stat-num { font-size: 26px; font-weight: bold; color: var(--gold); }
.stat-label { font-size: 12px; color: var(--text-dim); margin-top: 4px; }
.logined { color: var(--accent); font-weight: bold; }
.guest { color: var(--text-dim); }
</style>
