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

const CATEGORY_LABELS: Record<string, string> = {
  actions: 'Ação',
  animals: 'Animal',
  emotions: 'Emoção',
  nature: 'Natureza',
  objects: 'Objeto',
  personas: 'Persona',
  places: 'Lugar',
}

// Background gradient + category-label color live in scoped CSS as
// `--card-bg`/`--card-cat-color` custom properties, one modifier class per
// category (see <style>) — never an inline `:style`, so this stays CSP-safe
// under a strict `style-src`.
const categoryClass = computed(() =>
  props.category in CATEGORY_LABELS ? `sl-card--${props.category}` : 'sl-card--default',
)
const label = computed(() => CATEGORY_LABELS[props.category] ?? props.category)

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
    :aria-label="`${label}: ${name}`"
    :class="[
      'sl-card aspect-[2/3]',
      categoryClass,
      'relative select-none text-left transition-all duration-150 overflow-hidden flex flex-col',
      'rounded-2xl',
      compact ? 'min-w-[80px]' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : readonly ? 'cursor-default' : 'active:scale-95',
      selected
        ? 'ring-2 ring-white/80 scale-[1.03] sl-card--selected'
        : readonly
          ? 'shadow-md'
          : 'shadow-md hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1',
    ]"
    @click="!disabled && !readonly && emit('click')"
  >
    <!-- ── Image area — 60% of the card ──────────────── -->
    <div class="sl-card__image-area relative flex items-center justify-center overflow-hidden flex-[0_0_60%]">
      <!-- Diamond pattern -->
      <div class="sl-card__pattern absolute inset-0 pointer-events-none" />

      <!-- Circular cropped image -->
      <div
        v-if="!imgFailed"
        :class="compact ? 'w-14' : 'w-[76%]'"
        class="sl-card__image-frame relative z-10 overflow-hidden rounded-full aspect-square"
      >
        <img
          :src="imgSrc"
          :alt="label"
          class="w-full h-full object-cover"
          draggable="false"
          @error="onImgError"
        />
      </div>

      <!-- Gradient fallback with label -->
      <span
        v-if="imgFailed"
        :class="compact ? 'text-[8px]' : 'text-[10px]'"
        class="sl-card__cat-color relative z-10 font-bold uppercase tracking-widest opacity-70"
        >{{ label }}</span
      >

      <!-- Decorative corners -->
      <span
        :class="compact ? 'text-[7px]' : 'text-[9px]'"
        class="absolute top-1.5 left-2 text-white/20 pointer-events-none"
        >✦</span
      >
      <span
        :class="compact ? 'text-[7px]' : 'text-[9px]'"
        class="absolute bottom-1.5 right-2 text-white/20 pointer-events-none"
        >✦</span
      >

      <!-- Top highlight line -->
      <div class="absolute inset-x-0 top-0 h-px bg-white/30 pointer-events-none" />

      <!-- Checkmark -->
      <div
        v-if="selected"
        class="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md z-20"
      >
        <BaseIcon name="checkmark" class="w-3 h-3" />
      </div>
    </div>

    <!-- ── Name banner — 40% of the card ─────────────────── -->
    <div
      :class="compact ? 'px-1.5 py-[5px]' : 'p-2.5'"
      class="sl-card__banner flex-1 flex flex-col items-center justify-center text-center bg-black/60 border-t border-white/[0.12] backdrop-blur-sm"
    >
      <p
        :class="compact ? 'text-[7px]' : 'text-[9px]'"
        class="sl-card__cat-color font-bold uppercase tracking-[0.1em] leading-none mb-1"
      >
        {{ label }}
      </p>

      <p :class="compact ? 'text-[11px]' : 'text-[15px]'" class="font-black text-white leading-tight">
        {{ name }}
      </p>
    </div>
  </button>
</template>

<style scoped>
.sl-card--actions {
  --card-bg: linear-gradient(160deg, #7f1d1d, #dc2626);
  --card-cat-color: #fca5a5;
}
.sl-card--animals {
  --card-bg: linear-gradient(160deg, #713f12, #d97706);
  --card-cat-color: #fde68a;
}
.sl-card--emotions {
  --card-bg: linear-gradient(160deg, #701a75, #c026d3);
  --card-cat-color: #f5d0fe;
}
.sl-card--nature {
  --card-bg: linear-gradient(160deg, #134e4a, #0d9488);
  --card-cat-color: #99f6e4;
}
.sl-card--objects {
  --card-bg: linear-gradient(160deg, #164e63, #0891b2);
  --card-cat-color: #bae6fd;
}
.sl-card--personas {
  --card-bg: linear-gradient(160deg, #7c2d12, #ea580c);
  --card-cat-color: #fed7aa;
}
.sl-card--places {
  --card-bg: linear-gradient(160deg, #1e3a8a, #2563eb);
  --card-cat-color: #bfdbfe;
}
.sl-card--default {
  --card-bg: linear-gradient(160deg, #3730a3, #6366f1);
  --card-cat-color: #c7d2fe;
}

.sl-card--selected {
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 4px rgba(168, 85, 247, 0.5),
    0 8px 24px rgba(0, 0, 0, 0.4);
}

.sl-card__image-area {
  background: var(--card-bg);
}

.sl-card__cat-color {
  color: var(--card-cat-color);
}

.sl-card__pattern {
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.04) 0,
    rgba(255, 255, 255, 0.04) 1px,
    transparent 0,
    transparent 50%
  );
  background-size: 12px 12px;
}

.sl-card__image-frame {
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.5);
}
</style>
