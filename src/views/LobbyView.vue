<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import ThePlayersAvatars from '@/components/ThePlayersAvatars.vue'
import TheRules from '@/components/TheRules.vue'

import { useSocketStore } from '@/stores/socket'

const storeSocket = useSocketStore()

const submit = ref<HTMLButtonElement | null>(null)

onMounted(() => {
  if (submit.value) submit.value.focus()
})
</script>

<template>
  <form
    class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20"
    @submit.prevent="storeSocket.emitStartGame"
  >
    <h1 class="text-4xl font-bold text-white mb-2 text-center">Configurar partida</h1>

    <!-- room -->
    <div class="mb-8">
      <label class="block text-white mb-3 text-lg">Sala</label>
      <input
        :value="storeSocket.gameId"
        class="w-full px-4 py-3 rounded-lg bg-white/80 text-gray-700 text-xl text-center border-2 border-white/30"
        disabled
      />
    </div>

    <!-- players -->
    <the-players-avatars />

    <!-- rules -->
    <the-rules />

    <!-- start -->
    <button
      ref="submit"
      class="w-full bg-linear-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-bold text-xl hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
      type="submit"
    >
      Iniciar Jogo
    </button>

    <p class="text-white/60 text-sm text-center mt-4">
      Todos os jogadores devem estar conectados antes de iniciar
    </p>
  </form>
</template>
