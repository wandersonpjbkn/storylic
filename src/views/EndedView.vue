<script lang="ts" setup>
import Reload from '@/assets/icons/Reload.vue'

import { useSocketStore } from '@/stores/socket'

import { useSeo } from '@/composables/useSeo'

const storeSocket = useSocketStore()

useSeo({
  title: 'Jogo Finalizado',
  description: 'Obrigado por jogar',
})
</script>

<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
    <h2 class="text-4xl font-bold text-white mb-4">🎉 Jogo Finalizado!</h2>
    <p class="text-white/80 text-xl mb-8">Obrigado por jogar!</p>

    <button
      class="bg-linear-to-r from-pink-500 to-purple-500 text-white px-12 py-4 rounded-xl font-bold text-xl hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg inline-flex items-center gap-2"
      @click="storeSocket.emitResetGame"
    >
      <Reload />
      Jogar Novamente
    </button>
  </div>
</template>
