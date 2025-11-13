<script lang="ts" setup>
import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'
import { useCardsStore } from '@/stores/cards'

type Category = 'actions' | 'animals' | 'emotions' | 'nature' | 'objects' | 'personas' | 'places'

const storeSocket = useSocketStore()
const storeSettings = useSettingStore()
const storeCards = useCardsStore()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h2 class="text-3xl font-bold text-white mb-6 text-center">
          🎭 Hora de Contar a História!
        </h2>

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
                storeSettings.timerStory <= storeSettings.storyTimerThreshold
                  ? 'text-red-400 animate-pulse'
                  : 'text-white',
              ]"
            >
              {{ storeSettings.timerStory }}s
            </span>
            para contar seu trecho da história
          </p>
        </div>

        <!-- selected cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div
            v-for="(card, index) in storeCards.selectedCards"
            :key="index"
            :class="[
              'bg-gradient-to-br rounded-xl p-6 text-center',
              storeSettings.getCategoryColor(card.category as Category),
            ]"
          >
            <div class="text-white/70 text-sm font-semibold mb-1">{{ card.category }}</div>
            <div class="text-white text-2xl font-bold">{{ card.name }}</div>
          </div>
        </div>

        <div class="text-center">
          <button
            class="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-12 py-4 rounded-xl font-bold text-xl hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
            @click="storeSocket.emitFinishStoryAndNext"
          >
            Terminar vez
          </button>
          <p class="text-white/60 text-sm mt-4">Clique quando terminar de contar</p>
        </div>
      </div>
    </div>
  </div>
</template>
