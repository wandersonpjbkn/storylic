<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue'

import type { UIcons } from '@/types'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  name: UIcons
  /** Se definido, o ícone é conteúdo (lido por leitores de tela). Sem ele, é decorativo. */
  label?: string
}>()

const dynamicIcon = computed(() => {
  if (!props.name) return null
  return defineAsyncComponent(() => import(`@/assets/icons/${props.name}.svg`))
})

// Ícone com `label` vira role="img" + nome; sem label é decorativo (aria-hidden).
const a11yAttrs = computed(() =>
  props.label
    ? { role: 'img', 'aria-label': props.label }
    : { 'aria-hidden': 'true', focusable: 'false' },
)
</script>

<template>
  <component :is="dynamicIcon" v-if="dynamicIcon" v-bind="{ ...a11yAttrs, ...$attrs }" />
</template>
