<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'

const storeSocket = useSocketStore()
const storeSettings = useSettingStore()

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
    <div class="mb-8">
      <label class="block text-white mb-3 text-lg">Jogadores</label>
      <div class="flex items-center gap-4">
        <img
          v-for="(item, i) of storeSocket.room"
          :key="item.id"
          :src="`https://avatar.iran.liara.run/username?username=${item.name}`"
          :alt="`Player ${i}`"
          class="w-16 h-16 rounded-full border-2 border-white/30"
        />
      </div>
    </div>

    <!-- rules -->
    <div class="bg-white/5 rounded-xl p-6 mb-8">
      <h3 class="text-white font-semibold mb-3">📖 Regras do Jogo:</h3>
      <ul class="text-white/80 space-y-2 text-sm">
        <li>
          • Você tem até <strong>{{ storeSettings.baseTimerTurn }}s</strong> para escolher entre
          <strong>1 até 3</strong> cards
        </li>
        <li>• Monte a sua mão com os cards que desejar</li>
        <li>• Dê <strong>shuffle</strong> nos cards, para ver novas combinações</li>
        <li>
          • Conte o seu trecho da história em até
          <strong>{{ storeSettings.baseTimerStory }}s</strong>
        </li>
        <li>• O trecho que contar <strong>deve</strong> conter todos os cards que selecionou</li>
        <li>
          • Ao todo, serão <strong>{{ storeSettings.turnMax }} turnos</strong>
        </li>
      </ul>
    </div>

    <!-- start -->
    <button
      ref="submit"
      class="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-bold text-xl hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
      type="submit"
    >
      Iniciar Jogo
    </button>

    <p class="text-white/60 text-sm text-center mt-4">
      Todos os jogadores devem estar conectados antes de iniciar
    </p>
  </form>
</template>
