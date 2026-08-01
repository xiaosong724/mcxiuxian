<template>
  <div class="item-icon" :class="'icon-' + kind">
    <span v-if="shape === 'herb'" class="shape shape-herb"><i></i><i></i><i></i></span>
    <span v-else-if="shape === 'bag'" class="bag-box"><img src="/img/bag.webp" alt="储物袋" /></span>
    <span v-else-if="shape" class="shape" :class="'shape-' + shape"></span>
    <span v-else class="icon-badge">{{ firstChar }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ itemType: { type: String, default: '' } })

const t = computed(() => props.itemType || '')

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
