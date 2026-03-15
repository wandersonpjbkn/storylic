<script lang="ts" setup>
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
</script>

<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px)"
      @click.self="emit('cancel')"
    >
      <!-- Modal -->
      <div
        class="bg-indigo-950/95 border border-white/20 rounded-2xl p-8 shadow-2xl w-full max-w-md"
        role="dialog"
        aria-modal="true"
      >
        <h2 class="text-xl font-bold text-white mb-2">{{ title }}</h2>
        <p class="text-white/70 text-sm leading-relaxed mb-8">{{ description }}</p>

        <div class="flex gap-3 justify-end">
          <button
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-all"
            @click="emit('cancel')"
          >
            {{ cancelLabel ?? 'Cancelar' }}
          </button>

          <button
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
