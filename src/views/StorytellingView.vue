<script lang="ts" setup>
import { computed, watch } from 'vue'

import TheSelectedCards from '@/components/TheSelectedCards.vue'

import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'

const storeSocket = useSocketStore()
const storeSettings = useSettingStore()

const timerStory = computed(() => {
  return storeSettings.timerStory
})

const finishStoryAndNext = () => {
  storeSettings.stopTimerStory()
  storeSocket.emitFinishStoryAndNext()
}

watch(timerStory, (value) => {
  if (value <= 0) finishStoryAndNext()
})
</script>

<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
    <h2 class="text-3xl font-bold text-white mb-6 text-center">🎭 Hora de Contar a História!</h2>

    <!-- timer -->
    <div class="bg-white/5 rounded-xl p-6 mb-6">
      <p class="text-white/80 text-center mb-2">
        Jogador {{ storeSettings.playerName }} - Turno {{ storeSettings.turnCurrent }}/{{
          storeSettings.turnMax
        }}
      </p>
      <p class="text-white text-center text-lg">
        Você tem
        <span
          :class="[
            'text-2xl font-bold',
            timerStory <= storeSettings.storyTimerThreshold
              ? 'text-red-400 animate-pulse'
              : 'text-white',
          ]"
        >
          {{ timerStory }}s
        </span>
        para contar seu trecho da história
      </p>
    </div>

    <!-- selected cards -->
    <the-selected-cards />

    <!-- actions -->
    <div class="text-center">
      <button
        class="bg-linear-to-r from-pink-500 to-purple-500 text-white px-12 py-4 rounded-xl font-bold text-xl hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
        @click="finishStoryAndNext"
      >
        Terminar vez
      </button>
      <p class="text-white/60 text-sm mt-4">Clique quando terminar de contar</p>
    </div>
  </div>
</template>
