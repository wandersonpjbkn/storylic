<template>
  <div class="sl-surface px-5 py-4">
    <div class="flex items-center justify-between mb-1">
      <p class="text-white font-bold text-sm">{{ title }}</p>
      <span class="font-black text-lg">{{ model }}s</span>
    </div>
    <p class="text-xs mb-4" style="color: rgba(255, 255, 255, 0.35)">
      {{ descr }}
    </p>
    <input
      v-model.number="model"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      class="sl-slider w-full"
    />
    <div class="flex justify-between mt-1">
      <span class="text-xs" style="color: rgba(255, 255, 255, 0.25)">{{ minLabel }}</span>
      <span class="text-xs" style="color: rgba(255, 255, 255, 0.25)">{{ maxLabel }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  title: string
  descr: string
  min: number
  max: number
  step: number
}>()

const model = defineModel<number>({ required: true })

const minLabel = computed(() => `${props.min}s`)
const maxLabel = computed(() => `${props.max}s`)
</script>
