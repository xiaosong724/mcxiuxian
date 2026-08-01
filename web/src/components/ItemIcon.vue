<template>
  <div class="item-icon" :class="'icon-' + kind">
    <span v-if="kind === 'alchemy' && danEmoji" class="dan-emoji">{{ danEmoji }}</span>
    <span v-else-if="kind === 'herb'" class="dan-emoji">🌿</span>
    <span v-else-if="shape === 'herb'" class="shape shape-herb"><i></i><i></i><i></i></span>
    <span v-else-if="shape === 'bag'" class="bag-box"><img src="/img/bag.webp" alt="储物袋" /></span>
    <span v-else-if="shape" class="shape" :class="'shape-' + shape"></span>
    <span v-else class="icon-badge">{{ firstChar }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ itemType: { type: String, default: '' }, title: { type: String, default: '' } })

const t = computed(() => props.itemType || '')

// 丹药按名称匹配对应图标（与玩法介绍页一致）
const danEmoji = computed(() => {
  if (!t.value.includes('apple')) return ''
  const title = props.title || ''
  if (title.includes('回灵丹')) return '🟢'
  if (title.includes('培元丹')) return '🟡'
  if (title.includes('五行丹')) return '🟠'
  if (title.includes('续命丹')) return '❤️'
  if (title.includes('破障丹')) return '🔥'
  if (title.includes('洗髓丹')) return '🌀'
  return ''
})

const kind = computed(() => {
  const v = t.value
  if (v.includes('glow_ink_sac')) return 'bag'          // 储物袋
  if (v.includes('apple')) return 'alchemy'             // 丹药（苹果载体）
  if (v.includes('slime_ball')) return 'core'           // 妖丹（粘液球载体）
  if (v.includes('wheat') || v.includes('carrot') || v.includes('potato') || v.includes('beetroot')) return 'herb'
  if (v.includes('dandelion') || v.includes('poppy') || v.includes('orchid') || v.includes('allium') ||
      v.includes('cornflower') || v.includes('lily') || v.includes('sunflower') || v.includes('lilac') ||
      v.includes('rose') || v.includes('peony')) return 'herb'
  if (v.includes('_ore') || v.includes('deepslate') || v.includes('debris')) return 'ore'
  return 'other'
})

// 有形状的分类映射到形状名；矿石/其它保持首字母徽章
const shape = computed(() => ({ alchemy: 'pill', core: 'core', herb: 'herb', bag: 'bag' }[kind.value] || ''))

const firstChar = computed(() => {
  const cn = t.value.split(':').pop() || '?'
  return cn.charAt(0).toUpperCase()
})
</script>
