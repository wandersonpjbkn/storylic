<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  value: number
  base: number
  label?: string
}>()

const pct = computed(() => Math.max(0, props.value / props.base))
const phase = computed(() => {
  if (pct.value > 0.5)  return 'calm'
  if (pct.value > 0.25) return 'warning'
  return 'critical'
})

const cfg = computed(() => ({
  calm: {
    bg:       'rgba(255,255,255,0.10)',
    border:   'rgba(255,255,255,0.20)',
    numCol:   '#ffffff',
    sCol:     'rgba(255,255,255,0.45)',
    barColor: '#22c55e',   // verde sólido
    labelCol: 'rgba(255,255,255,0.50)',
  },
  warning: {
    bg:       'rgba(251,191,36,0.18)',
    border:   'rgba(251,191,36,0.50)',
    numCol:   '#fbbf24',
    sCol:     'rgba(251,191,36,0.65)',
    barColor: '#f97316',   // laranja sólido
    labelCol: 'rgba(251,191,36,0.80)',
  },
  critical: {
    bg:       'rgba(239,68,68,0.20)',
    border:   'rgba(239,68,68,0.55)',
    numCol:   '#fca5a5',
    sCol:     'rgba(252,165,165,0.65)',
    barColor: '#ef4444',   // vermelho sólido
    labelCol: 'rgba(252,165,165,0.85)',
  },
}[phase.value]))
</script>

<template>
  <div
    class="rounded-2xl p-5 transition-all duration-500"
    :style="{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }"
  >
    <p
      v-if="label"
      class="text-center mb-3"
      style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase"
      :style="{ color: cfg.labelCol }"
    >{{ label }}</p>

    <div class="flex items-baseline justify-center gap-1 mb-4">
      <span
        :class="[
          'font-black tabular-nums leading-none transition-all duration-300',
          phase === 'critical' ? 'text-7xl animate-pulse' : phase === 'warning' ? 'text-6xl' : 'text-5xl',
        ]"
        :style="{ color: cfg.numCol }"
      >{{ value }}</span>
      <span class="text-xl font-semibold" :style="{ color: cfg.sCol }">s</span>
    </div>

    <!-- Barra sólida — verde/laranja/vermelho sem gradiente -->
    <div class="h-2 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.12)">
      <div
        class="h-full rounded-full transition-all duration-1000 ease-linear"
        :style="{ width: `${pct * 100}%`, background: cfg.barColor }"
      />
    </div>
  </div>
</template>
