<script lang="ts" setup>
import { computed, watch } from 'vue'

import Clock from '@/assets/icons/Clock.vue'
import Shuffle from '@/assets/icons/Shuffle.vue'

import ThePlayer from '@/components/ThePlayer.vue'
import TheDisplayedCards from '@/components/TheDisplayedCards.vue'
import TheSelectedCards from '@/components/TheSelectedCards.vue'

import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'
import { useCardsStore } from '@/stores/cards'

import { useSeo } from '@/composables/useSeo'

const storeSocket = useSocketStore()
const storeSettings = useSettingStore()
const storeCards = useCardsStore()

useSeo({
  title: 'Jogando',
  titleTemplate: '%s | Storylic | Clube Ecos Literários',
  description: 'Selecione seus cards, corra antes que o tempo acabe',
  robots: 'noindex, nofollow, noarchive, nosnippet, noodp',
})

const timerTurn = computed(() => {
  return storeSettings.timerTurn
})

const finishTurn = () => {
  storeSettings.finishTurn()
  storeSocket.emitSelectedCards()
}

watch(timerTurn, (value) => {
  if (value <= 0) finishTurn()
})
</script>

<template>
  <!-- head -->
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
    <div class="flex justify-between items-center flex-wrap gap-4">
      <!-- user -->
      <the-player />

      <!-- timer -->
      <div class="flex items-center gap-3">
        <Clock class="text-white" />
        <span
          :class="[
            'text-3xl font-bold',
            timerTurn <= storeSettings.timerThreshold ? 'text-red-400 animate-pulse' : 'text-white',
          ]"
        >
          {{ timerTurn }}s
        </span>
      </div>

      <!-- turn -->
      <div class="text-white text-xl font-semibold">
        Turno [ {{ storeSettings.turnCurrent }}/{{ storeSettings.turnMax }} ]
      </div>
    </div>
  </div>

  <!-- cards to select -->
  <the-displayed-cards class="mb-6" />

  <!-- selected cards -->
  <the-selected-cards v-if="storeCards.canConfirm" class="mb-8" />

  <!-- actions -->
  <div class="flex gap-4">
    <button
      class="flex-1 bg-white/20 hover:bg-white/30 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
      @click="storeCards.shuffleDisplayedCards"
    >
      <Shuffle />
      Shuffle Cartas
    </button>

    <button
      :disabled="!storeCards.canConfirm"
      :class="[
        'flex-1 py-4 rounded-xl font-bold transition-all',
        storeCards.canConfirm
          ? 'bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
          : 'bg-gray-500/50 text-gray-300 cursor-not-allowed',
      ]"
      @click="finishTurn"
    >
      Confirmar Cartas ({{ storeCards.selectedCards.length }})
    </button>
  </div>
</template>
