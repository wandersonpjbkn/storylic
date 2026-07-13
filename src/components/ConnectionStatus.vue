<script lang="ts" setup>
import { useSocketStore } from '@/stores/socket'

withDefaults(
  defineProps<{
    /** `prominent` — form banners; `subtle` — muted footer indicator. */
    variant?: 'prominent' | 'subtle'
    /** Extra hint line shown under the label while disconnected (`prominent` only). */
    hint?: boolean
  }>(),
  { variant: 'prominent', hint: false },
)

const storeSocket = useSocketStore()
</script>

<template>
  <div v-if="variant === 'subtle'" class="flex items-center gap-1.5">
    <div
      :class="['w-1.5 h-1.5 rounded-full', storeSocket.isConnected ? 'bg-emerald-400' : 'bg-red-400']"
    />
    {{ storeSocket.isConnected ? 'Conectado' : 'Desconectado' }}
  </div>

  <div v-else class="flex flex-col items-center gap-1" role="status" aria-live="polite">
    <div class="flex items-center gap-2">
      <div
        :class="[
          'w-2.5 h-2.5 rounded-full transition-colors',
          storeSocket.isConnected ? 'bg-emerald-400' : 'bg-red-400 animate-pulse',
        ]"
        aria-hidden="true"
      />
      <span
        :class="['text-sm font-medium', storeSocket.isConnected ? 'text-emerald-300' : 'text-red-300']"
      >
        {{ storeSocket.isConnected ? 'Servidor conectado' : 'Sem conexão com o servidor' }}
      </span>
    </div>
    <p v-if="hint && !storeSocket.isConnected" class="text-white/70 text-xs">
      Verifique se o servidor está no ar antes de jogar
    </p>
  </div>
</template>
