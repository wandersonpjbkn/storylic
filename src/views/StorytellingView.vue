<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'
import { useCardsStore } from '@/stores/cards'
import { useTimerStore } from '@/stores/timer'
import { useSeo } from '@/composables/useSeo'
import { SocketEvents } from '@/constants/socketEvents'
import type { Category } from '@/types'

import TheTimer from '@/components/TheTimer.vue'
import TheCard from '@/components/TheCard.vue'

const storeSocket = useSocketStore()
const storeSettings = useSettingStore()
const storeCards = useCardsStore()
const storeTimer = useTimerStore()

useSeo({ title: 'Contando histórias', description: 'Deixe sua imaginação voar' })

const timerStory = computed(() => storeTimer.timerStory)
const alreadyFinished = ref(false)

const finishStoryAndNext = () => {
  if (alreadyFinished.value) return
  alreadyFinished.value = true
  storeTimer.stopTimerStory()
  storeSocket.emitFinishStoryAndNext()

  // Safety net: if the server hasn't advanced the turn in 6s (emit lost to a
  // Wi-Fi blip), re-enable the button so the player can retry instead of
  // getting stuck on "Waiting for next turn...".
  setTimeout(() => {
    if (storeSettings.gameState === SocketEvents.STATE_STORYTELLING) {
      alreadyFinished.value = false
    }
  }, 6000)
}

watch(timerStory, (v) => {
  if (v <= 0) finishStoryAndNext()
})
</script>

<template>
  <div class="flex flex-col gap-4 pb-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <p class="sl-label">Narrando</p>
        <p class="text-white font-bold text-lg leading-snug">{{ storeSocket.myPlayerName }}</p>
      </div>
      <div class="text-right">
        <p class="sl-label">Turno</p>
        <p class="text-white font-bold text-lg leading-snug">
          {{ storeSettings.turnCurrent
          }}<span class="text-white/40">/{{ storeSettings.turnMax }}</span>
        </p>
      </div>
    </div>

    <!-- Timer -->
    <TheTimer :value="timerStory" :progress="storeTimer.storyProgress" label="Tempo para narrar" />

    <!-- Instructions -->
    <div class="sl-surface px-4 py-3 text-center">
      <p class="text-sm leading-relaxed text-white/75">
        Conte seu trecho usando os cards abaixo.
        <span class="block mt-0.5 text-xs text-white/40">Seja criativo — tudo vale!</span>
      </p>
    </div>

    <!-- Hand — centered grid, normal-sized cards, readonly -->
    <div>
      <p class="sl-label text-center mb-3">Sua mão</p>

      <!-- Dynamic grid: 1 card → centered; 2 → two columns; 3 → three columns.
           A fixed class per hand size (never more than 3, capped by the card
           store) instead of computed inline styles keeps this CSP-safe. -->
      <div class="sl-hand-grid grid gap-3 mx-auto" :class="`sl-hand-grid--${storeCards.selectedCards.length}`">
        <TheCard
          v-for="card in storeCards.selectedCards"
          :key="card.name"
          :name="card.name"
          :category="card.category as Category"
          :selected="true"
          :readonly="true"
        />
      </div>
    </div>

    <!-- Finish button -->
    <button
      :disabled="alreadyFinished"
      class="sl-btn py-5 text-lg mt-2"
      @click="finishStoryAndNext"
    >
      {{ alreadyFinished ? 'Aguardando próximo turno...' : 'Terminar minha vez' }}
    </button>
  </div>
</template>

<style scoped>
.sl-hand-grid--1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
  max-width: 140px;
}

.sl-hand-grid--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  max-width: 280px;
}

.sl-hand-grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 100%;
}
</style>
