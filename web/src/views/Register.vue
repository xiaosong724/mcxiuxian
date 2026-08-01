<template>
  <div class="container" style="max-width:420px;margin-top:60px;">
    <div class="card pixel-panel">
      <h1 class="page-title">注册账号</h1>
      <p class="muted" style="margin-bottom:16px;">
        账号请在游戏内使用 <code>/ctm reg &lt;账号&gt; &lt;密码&gt;</code> 注册。
        <br/>这里仅说明：网页登录使用同一账号密码。
      </p>
      <div class="tip-banner pixel-panel" style="margin-bottom:16px;">
        🧪 想先体验一下？可使用体验账号：
        <br/><code>test / 123456</code>（只读权限，可浏览市场、查看排行榜）
      </div>
      <div class="actions">
        <RouterLink to="/login" class="pixel-btn">返回登录</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
