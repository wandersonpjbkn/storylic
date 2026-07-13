<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'

defineProps<{
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const titleId = useId()
const descId = useId()
const dialogRef = ref<HTMLElement | null>(null)
const confirmRef = ref<HTMLButtonElement | null>(null)
let previouslyFocused: HTMLElement | null = null

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('cancel')
    return
  }
  if (e.key !== 'Tab') return

  // Focus trap: Tab cycles only through the modal's focusable elements (WCAG 2.1.2/2.4.3).
  const focusables = dialogRef.value?.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  if (!focusables || focusables.length === 0) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (!first || !last) return

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  previouslyFocused = document.activeElement as HTMLElement | null
  confirmRef.value?.focus()
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  // Returns focus to whoever opened the modal (WCAG 2.4.3).
  previouslyFocused?.focus?.()
})
</script>

<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="emit('cancel')"
    >
      <!-- Modal -->
      <div
        ref="dialogRef"
        class="bg-indigo-950/95 border border-white/20 rounded-2xl p-8 shadow-2xl w-full max-w-md"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="descId"
      >
        <h2 :id="titleId" class="text-xl font-bold text-white mb-2">{{ title }}</h2>
        <p :id="descId" class="text-white/70 text-sm leading-relaxed mb-8">{{ description }}</p>

        <div class="flex gap-3 justify-end">
          <button
            type="button"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-all"
            @click="emit('cancel')"
          >
            {{ cancelLabel ?? 'Cancelar' }}
          </button>

          <button
            ref="confirmRef"
            type="button"
            :class="[
              'px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg',
              danger
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-linear-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white',
            ]"
            @click="emit('confirm')"
          >
            {{ confirmLabel ?? 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
