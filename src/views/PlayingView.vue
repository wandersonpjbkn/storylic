<script lang="ts" setup>
import Clock from '@/assets/icons/Clock.vue'
import Shuffle from '@/assets/icons/Shuffle.vue'
import Users from '@/assets/icons/Users.vue'

import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'
import { useCardsStore } from '@/stores/cards'

type Category = 'actions' | 'animals' | 'emotions' | 'nature' | 'objects' | 'personas' | 'places'

const storeSocket = useSocketStore()
const storeSettings = useSettingStore()
const storeCards = useCardsStore()

const finishTurn = () => {
  storeSocket.emitSelectedCards()
  storeSettings.finishTurn()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
    <div class="max-w-6xl mx-auto">
      <!-- head -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
        <div class="flex justify-between items-center flex-wrap gap-4">
          <!-- user -->
          <div class="flex items-center gap-3">
            <Users />
            <span class="text-white text-xl font-semibold"
              >Jogador {{ storeSettings.playerName }}</span
            >
          </div>

          <!-- timer -->
          <div class="flex items-center gap-3">
            <Clock />
            <span
              :class="[
                'text-3xl font-bold',
                storeSettings.timerTurn <= storeSettings.timerThreshold
                  ? 'text-red-400 animate-pulse'
                  : 'text-white',
              ]"
            >
              {{ storeSettings.timerTurn }}s
            </span>
          </div>

          <!-- turn -->
          <div class="text-white text-xl font-semibold">
            Turno {{ storeSettings.turnCurrent }}/{{ storeSettings.turnMax }}
          </div>
        </div>
      </div>

      <!-- cards to select -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <button
          v-for="(card, index) in storeCards.displayedCards"
          :key="index"
          :class="[
            'relative bg-gradient-to-br rounded-2xl p-8 transition-all transform hover:scale-105',
            storeSettings.getCategoryColor(card.category as Category),
            storeCards.isCardSelected(card) ? 'ring-4 ring-white scale-105' : '',
          ]"
          @click="storeCards.toggleCardSelection(card)"
        >
          <div class="text-white/70 text-sm font-semibold mb-2">{{ card.category }}</div>
          <div class="text-white text-3xl font-bold mb-4">{{ card.name }}</div>
          <div
            v-if="storeCards.isCardSelected(card)"
            class="absolute top-4 right-4 bg-white text-purple-900 rounded-full w-8 h-8 flex items-center justify-center font-bold"
          >
            ✓
          </div>
        </button>
      </div>

      <!-- selected cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          v-for="(card, index) in storeCards.selectedCards"
          :key="index"
          :class="[
            'bg-gradient-to-br rounded-xl p-6 text-center',
            storeSettings.getCategoryColor(card.category as Category),
          ]"
          @click="storeCards.toggleCardSelection(card)"
        >
          <div class="text-white/70 text-sm font-semibold mb-1">{{ card.category }}</div>
          <div class="text-white text-2xl font-bold">{{ card.name }}</div>
        </button>
      </div>

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
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
              : 'bg-gray-500/50 text-gray-300 cursor-not-allowed',
          ]"
          @click="finishTurn"
        >
          Confirmar Cartas ({{ storeCards.selectedCards.length }})
        </button>
      </div>
    </div>
  </div>
</template>
