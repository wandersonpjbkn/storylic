<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue'

type UIcons =
  // UI
  // used
  | 'alert'
  | 'checkmark'
  | 'error'
  | 'favicon'
  | 'info'
  | 'reload'
  | 'shuffle'
  | 'times'
  // unused
  | 'clock'
  | 'home'
  | 'success'
  | 'users'

const props = defineProps<{
  name: UIcons
}>()

const dynamicIcon = computed(() => {
  if (!props.name) return null
  return defineAsyncComponent(() => import(`@/assets/icons/${props.name}.svg`))
})
</script>

<template>
  <component :is="dynamicIcon" v-if="dynamicIcon" v-bind="$attrs" />
</template>
