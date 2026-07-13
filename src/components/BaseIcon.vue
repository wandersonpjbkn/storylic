<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue'

import type { UIcons } from '@/types'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  name: UIcons
  /** If set, the icon is content (read by screen readers). Without it, it's decorative. */
  label?: string
}>()

const dynamicIcon = computed(() => {
  if (!props.name) return null
  return defineAsyncComponent(() => import(`@/assets/icons/${props.name}.svg`))
})

// Icon with `label` becomes role="img" + name; without a label it's decorative (aria-hidden).
const a11yAttrs = computed(() =>
  props.label
    ? { role: 'img', 'aria-label': props.label }
    : { 'aria-hidden': 'true', focusable: 'false' },
)
</script>

<template>
  <component :is="dynamicIcon" v-if="dynamicIcon" v-bind="{ ...a11yAttrs, ...$attrs }" />
</template>
