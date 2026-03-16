<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  alt: string
}>()

const initialLetters = computed(() => {
  return props.alt
    ?.trim()
    ?.split(/\s+/)
    ?.map((part) => part[0])
    ?.slice(0, 2)
    ?.join('')
    ?.toUpperCase()
})
const normalizedAlt = computed(() => {
  return props.alt?.trim().toLowerCase() || ''
})
const hash = computed(() => {
  let hash = 0

  for (let i = 0; i < normalizedAlt.value.length; i++) {
    hash = normalizedAlt.value.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }

  return Math.abs(hash)
})
const avatarStyle = computed(() => {
  const lighten = `hsl(${hash.value % 360} 60% 65%)`
  const darken = `hsl(${hash.value % 360} 60% 35%)`

  return {
    backgroundImage: `linear-gradient(135deg,${lighten},${darken})`,
    color: '#fff',
  }
})
</script>

<template>
  <div v-bind="$attrs">
    <div class="avatar" :style="avatarStyle">
      {{ initialLetters }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.avatar {
  display: flex;
  width: 100%;
  height: 100%;
  border-radius: 50%;

  font-weight: 600;

  align-items: center;
  justify-content: center;
}
</style>
