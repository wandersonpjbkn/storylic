<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import ThePlayer from '@/components/ThePlayer.vue'
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
    <div class="flex flex-col md:flex-row gap-4 mb-8">
      <div class="w-full md:w-1/3 bg-white/5 rounded-xl">
        <div class="p-6">
          <div class="flex justify-center gap-3">
            <span class="text-white text-xl font-semibold">Sala [ {{ storeSocket.gameId }} ]</span>
          </div>
        </div>
      </div>
      <div class="w-full md:w-2/3 bg-white/5 rounded-xl">
        <div class="p-6">
          <the-player :has-icon="false" />
        </div>
      </div>
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
