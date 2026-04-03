<script lang="ts" setup>
import { useSocketStore } from '@/stores/socket'
import { useSeo } from '@/composables/useSeo'
import BaseIcon from '@/components/BaseIcon.vue'

const storeSocket = useSocketStore()
useSeo({ title: 'Jogo Finalizado', description: 'Obrigado por jogar' })
</script>

<template>
  <div class="sl-surface p-8 text-center">
    <div class="text-6xl mb-4">🎉</div>
    <h2 class="text-3xl font-black text-white mb-2">Jogo Finalizado!</h2>
    <p class="text-sm mb-8" style="color: rgba(255, 255, 255, 0.55)">
      Que história incrível vocês criaram!
    </p>

    <button
      class="flex items-center w-full py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg mx-auto bg-linear-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 hover:shadow-xl cursor-pointer"
      style="width: auto"
      @click="storeSocket.emitResetGame"
    >
      <BaseIcon name="reload" class="w-5 h-5 mr-2" />
      Jogar novamente
    </button>

    <p class="text-xs mt-6" style="color: rgba(255, 255, 255, 0.3)">
      Você voltará para o lobby da mesma sala
    </p>
  </div>
</template>
