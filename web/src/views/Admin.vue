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
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { api } from '../api'

const toast = inject('toast')
const busy = ref(false)

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
</style>
