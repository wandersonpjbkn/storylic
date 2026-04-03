<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  alt: string
}>()

// text
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

// color
const hash = computed(() => {
  let hash = 0

  for (let i = 0; i < normalizedAlt.value.length; i++) {
    hash = normalizedAlt.value.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }

  return Math.abs(hash)
})

const hue = computed(() => hash.value % 360)
const percent = (val: number) => `${val}%`

// style
const avatarStyle = computed(() => {
  /**
   * HSL
   * @number hue: 0 -> 360
   * @number saturation: 0 -> 100
   * @number lightness: 0 -> 100
   */
  const base = `hsl(${hue.value} ${percent(60)} ${percent(45)})`
  const lighten = `hsl(${hue.value} ${percent(60)} ${percent(65)})`
  const darken = `hsl(${hue.value} ${percent(60)} ${percent(35)})`

  return {
    backgroundColor: base, // fallback
    backgroundImage: `linear-gradient(135deg,${lighten},${darken})`, // style
    color: '#fff',
  }
})
</script>

<template>
  <div v-bind="$attrs">
    <div
      class="flex w-full h-full rounded-full items-center justify-center font-semibold"
      :style="avatarStyle"
    >
      {{ initialLetters }}
    </div>
  </div>
</template>
