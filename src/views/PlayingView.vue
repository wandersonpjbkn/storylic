<script lang="ts" setup>
import { computed } from 'vue'

import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'
import { useCardsStore } from '@/stores/cards'
import { useTimerStore } from '@/stores/timer'
import { useSeo } from '@/composables/useSeo'
import { SocketEvents } from '@/constants/socketEvents'
import type { Category } from '@/types'

import TheCard from '@/components/TheCard.vue'
import TheTimer from '@/components/TheTimer.vue'

const storeSocket = useSocketStore()
const storeSettings = useSettingStore()
const storeCards = useCardsStore()
const storeTimer = useTimerStore()

useSeo({ title: 'Jogando', description: 'Monte sua mão antes que o tempo acabe' })

const timerTurn = computed(() => storeTimer.timerTurn)
const slotsLeft = computed(() => 3 - storeCards.selectedCards.length)

const finishTurn = () => {
  storeSettings.finishTurn()
  storeSocket.emitSelectedCards()
  storeSocket.navigate(SocketEvents.STATE_STORYTELLING)
}
</script>

<template>
  <div class="flex flex-col gap-4 pb-4">
    <!-- Cabeçalho: jogador + turno -->
    <div class="flex items-center justify-between">
      <div>
        <p class="sl-label">Jogador</p>
        <p class="text-white font-bold text-lg leading-snug">{{ storeSocket.myPlayerName }}</p>
      </div>
      <div class="text-right">
        <p class="sl-label">Turno</p>
        <p class="text-white font-bold text-lg leading-snug">
          {{ storeSettings.turnCurrent
          }}<span style="color: rgba(255, 255, 255, 0.4)">/{{ storeSettings.turnMax }}</span>
        </p>
      </div>
    </div>

    <!-- Timer -->
    <TheTimer :value="timerTurn" :base="storeTimer.baseTimerTurn" label="Tempo para montar a mão" />

    <!-- Baralho disponível -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <p class="sl-label">Baralho</p>
        <p class="text-xs font-semibold" style="color: rgba(255, 255, 255, 0.35)">
          toque para selecionar
        </p>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <TheCard
          v-for="card in storeCards.displayedCards"
          :key="card.name"
          :name="card.name"
          :category="card.category as Category"
          :selected="storeCards.isCardSelected(card)"
          :disabled="!storeCards.isCardSelected(card) && storeCards.selectedCards.length >= 3"
          @click="storeCards.toggleCardSelection(card)"
        />
      </div>
    </div>

    <!-- Botão shuffle -->
    <button
      class="sl-btn-ghost w-full py-3 flex items-center justify-center gap-2"
      @click="storeCards.shuffleDisplayedCards"
    >
      <BaseIcon name="shuffle" class="w-4 h-4 shrink-0" />
      <span class="text-sm">Shuffle</span>
    </button>

    <!-- Divisor minha mão -->
    <div class="relative h-px mt-2" style="background: rgba(255, 255, 255, 0.1)">
      <span
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold lowercase tracking-wider px-3 py-1 rounded-full"
        style="
          background: linear-gradient(135deg, #3b0764, #500724);
          color: rgba(255, 255, 255, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.1);
          white-space: nowrap;
        "
        >Minha mão</span
      >
    </div>

    <!-- Slots visuais -->
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <div
          v-for="i in 3"
          :key="i"
          class="h-1.5 rounded-full transition-all duration-300"
          :style="{
            width: i <= storeCards.selectedCards.length ? '36px' : '24px',
            background:
              i <= storeCards.selectedCards.length
                ? 'linear-gradient(90deg,#a855f7,#ec4899)'
                : 'rgba(255,255,255,0.12)',
          }"
        />
      </div>
      <span
        class="text-xs font-bold"
        :style="{
          color: storeCards.selectedCards.length === 3 ? '#c4b5fd' : 'rgba(255,255,255,.35)',
        }"
      >
        {{ storeCards.selectedCards.length }}/3
        {{ slotsLeft > 0 ? `· ainda cabe ${slotsLeft}` : '· mão cheia' }}
      </span>
    </div>

    <!-- Mão selecionada — TransitionGroup É o único flex container, sem div extra -->
    <div class="overflow-x-auto scrollbar-hide min-h-[100px]">
      <TransitionGroup name="hand" tag="div" class="flex gap-3 p-3">
        <TheCard
          v-for="card in storeCards.selectedCards"
          :key="card.name"
          :name="card.name"
          :category="card.category as Category"
          :selected="true"
          :compact="true"
          @click="storeCards.toggleCardSelection(card)"
        />

        <!-- Slots vazios — dentro do mesmo TransitionGroup tag div -->
        <div
          v-for="i in slotsLeft"
          :key="`empty-${i}`"
          class="flex-shrink-0 rounded-xl border-2 border-dashed flex items-center justify-center"
          style="min-width: 80px; aspect-ratio: 2/3; border-color: rgba(255, 255, 255, 0.1)"
        >
          <span style="color: rgba(255, 255, 255, 0.15); font-size: 18px">+</span>
        </div>
      </TransitionGroup>
    </div>

    <!-- Botão confirmar -->
    <button :disabled="!storeCards.canConfirm" class="sl-btn py-4 text-base" @click="finishTurn">
      {{
        storeCards.canConfirm
          ? `Confirmar mão (${storeCards.selectedCards.length})`
          : 'Selecione pelo menos 1 carta'
      }}
    </button>
  </div>
</template>

<style scoped>
.hand-enter-active {
  transition: all 0.2s ease-out;
}
.hand-leave-active {
  transition: all 0.15s ease-in;
}
.hand-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.9);
}
.hand-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
