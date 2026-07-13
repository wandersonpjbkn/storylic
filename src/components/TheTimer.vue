<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  value: number
  progress: number
  label?: string
}>()

const pct = computed(() => Math.max(0, Math.min(1, props.progress)))
const phase = computed(() => {
  if (pct.value > 0.5) return 'calm'
  if (pct.value > 0.25) return 'warning'
  return 'critical'
})

// Screen-reader announcement only on phase changes (not every second, which
// would flood the user — WCAG 4.1.3). Depends only on `phase`, so it changes
// ~2x/turn.
const announcement = computed(() => {
  const name = props.label ?? 'Tempo'
  if (phase.value === 'critical') return `${name}: quase esgotado`
  if (phase.value === 'warning') return `${name}: na metade`
  return ''
})
</script>

<template>
  <div class="sl-timer rounded-2xl p-5 transition-all duration-500" :class="`sl-timer--${phase}`">
    <p v-if="label" class="sl-timer__label text-center mb-3 text-[10px] font-bold tracking-[0.12em] uppercase">
      {{ label }}
    </p>

    <!-- The number changes every second: aria-hidden avoids flooding the
         screen reader. The phase announcement (below) gives the essentials
         without the verbosity. -->
    <div class="flex items-baseline justify-center gap-1 mb-4" aria-hidden="true">
      <span
        :class="[
          'sl-timer__num font-black tabular-nums leading-none transition-all duration-300',
          phase === 'critical'
            ? 'text-7xl animate-pulse'
            : phase === 'warning'
              ? 'text-6xl'
              : 'text-5xl',
        ]"
        >{{ value }}</span
      >
      <span class="sl-timer__s text-xl font-semibold">s</span>
    </div>

    <!-- Solid bar — green/orange/red, no gradient. Fill width is a plain SVG
         attribute (not a `style` property), so it stays CSP-safe under a
         strict `style-src` with no `unsafe-inline`. No viewBox: the SVG's
         coordinate system then matches real CSS pixels 1:1 on both axes, so
         `rx` renders as a true, subtle rounded corner instead of being
         stretched horizontally by a non-uniform viewBox scale. -->
    <svg class="block w-full h-2" aria-hidden="true">
      <rect x="0" y="0" width="100%" height="8" rx="4" class="sl-timer__bar-track" />
      <rect
        x="0"
        y="0"
        :width="`${pct * 100}%`"
        height="8"
        rx="4"
        class="sl-timer__bar-fill transition-all duration-200 ease-linear"
      />
    </svg>

    <p class="sr-only" role="status" aria-live="polite">{{ announcement }}</p>
  </div>
</template>

<style scoped>
.sl-timer--calm {
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  --timer-label: rgba(255, 255, 255, 0.5);
  --timer-num: #ffffff;
  --timer-s: rgba(255, 255, 255, 0.45);
  --timer-bar: #22c55e;
}

.sl-timer--warning {
  background: rgba(251, 191, 36, 0.18);
  border: 1.5px solid rgba(251, 191, 36, 0.5);
  --timer-label: rgba(251, 191, 36, 0.8);
  --timer-num: #fbbf24;
  --timer-s: rgba(251, 191, 36, 0.65);
  --timer-bar: #f97316;
}

.sl-timer--critical {
  background: rgba(239, 68, 68, 0.2);
  border: 1.5px solid rgba(239, 68, 68, 0.55);
  --timer-label: rgba(252, 165, 165, 0.85);
  --timer-num: #fca5a5;
  --timer-s: rgba(252, 165, 165, 0.65);
  --timer-bar: #ef4444;
}

.sl-timer__label {
  color: var(--timer-label);
}

.sl-timer__num {
  color: var(--timer-num);
}

.sl-timer__s {
  color: var(--timer-s);
}

.sl-timer__bar-track {
  fill: rgba(255, 255, 255, 0.12);
}

.sl-timer__bar-fill {
  fill: var(--timer-bar);
}
</style>
