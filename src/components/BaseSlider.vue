<template>
  <div class="sl-surface px-5 py-4">
    <div class="flex items-center justify-between mb-1">
      <p class="text-white font-bold text-sm">{{ title }}</p>
      <span class="font-black text-lg">{{ model }}s</span>
    </div>
    <p class="text-xs mb-4 text-white/[0.35]">
      {{ description }}
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
      <span class="text-xs text-white/25">{{ minLabel }}</span>
      <span class="text-xs text-white/25">{{ maxLabel }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  title: string
  description: string
  min: number
  max: number
  step: number
}>()

const model = defineModel<number>({ required: true })

const minLabel = computed(() => `${props.min}s`)
const maxLabel = computed(() => `${props.max}s`)
</script>

<style scoped>
.sl-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.12);
  outline: none;
  cursor: pointer;
}

.sl-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899, #a855f7);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.sl-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899, #a855f7);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.8);
}
</style>
