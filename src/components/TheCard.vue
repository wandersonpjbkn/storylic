<script lang="ts" setup>
import { ref, computed, watch } from 'vue'

import { categoryImagePath } from '@/composables/useCardImage'
import type { Category } from '@/types'

const props = withDefaults(
  defineProps<{
    name: string
    category: Category | string
    selected?: boolean
    compact?: boolean
    disabled?: boolean
    readonly?: boolean
  }>(),
  { selected: false, compact: false, disabled: false, readonly: false },
)

const emit = defineEmits<{ click: [] }>()

const meta: Record<string, { label: string; bg: string; catColor: string }> = {
  actions: { label: 'Ação', bg: 'linear-gradient(160deg,#7f1d1d,#dc2626)', catColor: '#fca5a5' },
  animals: { label: 'Animal', bg: 'linear-gradient(160deg,#713f12,#d97706)', catColor: '#fde68a' },
  emotions: { label: 'Emoção', bg: 'linear-gradient(160deg,#701a75,#c026d3)', catColor: '#f5d0fe' },
  nature: { label: 'Natureza', bg: 'linear-gradient(160deg,#134e4a,#0d9488)', catColor: '#99f6e4' },
  objects: { label: 'Objeto', bg: 'linear-gradient(160deg,#164e63,#0891b2)', catColor: '#bae6fd' },
  personas: {
    label: 'Persona',
    bg: 'linear-gradient(160deg,#7c2d12,#ea580c)',
    catColor: '#fed7aa',
  },
  places: { label: 'Lugar', bg: 'linear-gradient(160deg,#1e3a8a,#2563eb)', catColor: '#bfdbfe' },
}

const m = computed(
  () =>
    meta[props.category] ?? {
      label: props.category,
      bg: 'linear-gradient(160deg,#3730a3,#6366f1)',
      catColor: '#c7d2fe',
    },
)

const imgSrc = computed(() => categoryImagePath(props.category))
const imgFailed = ref(false)
watch(
  () => props.category,
  () => {
    imgFailed.value = false
  },
)
const onImgError = () => {
  imgFailed.value = true
}
</script>

<template>
  <button
    :disabled="disabled"
    :aria-pressed="readonly ? undefined : selected"
    :aria-label="`${m.label}: ${name}`"
    :class="[
      'relative select-none text-left transition-all duration-150 overflow-hidden flex flex-col',
      'rounded-2xl',
      compact ? 'min-w-[80px]' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : readonly ? 'cursor-default' : 'active:scale-95',
      selected
        ? 'ring-2 ring-white/80 scale-[1.03]'
        : readonly
          ? 'shadow-md'
          : 'shadow-md hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1',
    ]"
    :style="{
      boxShadow: selected
        ? '0 0 0 2px #fff, 0 0 0 4px rgba(168,85,247,.5), 0 8px 24px rgba(0,0,0,.4)'
        : undefined,
      aspectRatio: '2/3',
    }"
    @click="!disabled && !readonly && emit('click')"
  >
    <!-- ── Área da imagem — 60% do card ──────────────── -->
    <div
      class="relative flex items-center justify-center overflow-hidden"
      :style="{
        flex: '0 0 60%',
        background: m.bg,
      }"
    >
      <!-- Padrão losango -->
      <div
        class="absolute inset-0 pointer-events-none"
        style="
          background-image: repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.04) 0,
            rgba(255, 255, 255, 0.04) 1px,
            transparent 0,
            transparent 50%
          );
          background-size: 12px 12px;
        "
      />

      <!-- Imagem circular cropada -->
      <div
        v-if="!imgFailed"
        class="relative z-10 overflow-hidden"
        :style="{
          borderRadius: '100%',
          width: compact ? '56px' : '76%',
          aspectRatio: '1/1',
          boxShadow: '0 0 0 2px rgba(255,255,255,0.12), 0 4px 16px rgba(0,0,0,0.5)',
        }"
      >
        <img
          :src="imgSrc"
          :alt="m.label"
          class="w-full h-full object-cover"
          draggable="false"
          @error="onImgError"
        />
      </div>

      <!-- Fallback gradiente com label -->
      <span
        v-if="imgFailed"
        class="relative z-10 font-bold uppercase tracking-widest"
        :style="{ color: m.catColor, fontSize: compact ? '8px' : '10px', opacity: 0.7 }"
        >{{ m.label }}</span
      >

      <!-- Cantos decorativos -->
      <span
        class="absolute top-1.5 left-2 text-white/20 pointer-events-none"
        :style="{ fontSize: compact ? '7px' : '9px' }"
        >✦</span
      >
      <span
        class="absolute bottom-1.5 right-2 text-white/20 pointer-events-none"
        :style="{ fontSize: compact ? '7px' : '9px' }"
        >✦</span
      >

      <!-- Brilho linha no topo -->
      <div class="absolute inset-x-0 top-0 h-px bg-white/30 pointer-events-none" />

      <!-- Checkmark -->
      <div
        v-if="selected"
        class="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md z-20"
      >
        <BaseIcon name="checkmark" class="w-3 h-3" />
      </div>
    </div>

    <!-- ── Banner nome — 40% do card ─────────────────── -->
    <div
      class="flex-1 flex flex-col items-center justify-center text-center"
      :style="{
        background: 'rgba(0,0,0,0.60)',
        borderTop: '1px solid rgba(255,255,255,0.12)',
        padding: compact ? '5px 6px' : '10px 10px',
        backdropFilter: 'blur(4px)',
      }"
    >
      <p
        class="font-bold uppercase tracking-wider leading-none mb-1"
        :style="{
          color: m.catColor,
          fontSize: compact ? '7px' : '9px',
          letterSpacing: '0.1em',
        }"
      >
        {{ m.label }}
      </p>

      <p
        class="font-black text-white leading-tight"
        :style="{ fontSize: compact ? '11px' : '15px' }"
      >
        {{ name }}
      </p>
    </div>
  </button>
</template>
