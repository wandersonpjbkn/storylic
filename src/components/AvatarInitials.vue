<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  alt: string
}>()

const PALETTE_SIZE = 12

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

// color — deterministic hash into a fixed palette (not an arbitrary computed
// hue) so the color never needs an inline `style`, keeping this CSP-safe
// under a strict `style-src`.
const hash = computed(() => {
  let hash = 0

  for (let i = 0; i < normalizedAlt.value.length; i++) {
    hash = normalizedAlt.value.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }

  return Math.abs(hash)
})

const colorClass = computed(() => `sl-avatar-color-${hash.value % PALETTE_SIZE}`)
</script>

<template>
  <!-- Decorative: the initials duplicate the name already shown alongside. -->
  <div v-bind="$attrs" aria-hidden="true">
    <div
      :class="colorClass"
      class="flex w-full h-full rounded-full items-center justify-center font-semibold text-white"
    >
      {{ initialLetters }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 12 palette entries evenly spaced around the hue wheel, same
// hue/saturation/lightness formula the previous continuous-hash version used.
@for $i from 0 through 11 {
  .sl-avatar-color-#{$i} {
    $hue: $i * 30;
    background-color: hsl($hue 60% 45%);
    background-image: linear-gradient(135deg, hsl($hue 60% 65%), hsl($hue 60% 35%));
  }
}
</style>
