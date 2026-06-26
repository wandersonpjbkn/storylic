<script lang="ts" setup>
import { computed, defineAsyncComponent, onMounted } from 'vue'

import type { UIcons } from '@/types'

const props = defineProps<{
  name: UIcons
}>()

const dynamicIcon = computed(() => {
  if (!props.name) return null
  return defineAsyncComponent(() => import(`@/assets/icons/${props.name}.svg`))
})

onMounted(() => {
  console.log('BaseIcon mounted with name:', props.name)
})
</script>

<template>
  <component :is="dynamicIcon" v-if="dynamicIcon" v-bind="$attrs" />
</template>
