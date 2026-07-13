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
    <!-- Header: player + turn -->
    <div class="flex items-center justify-between">
      <div>
        <p class="sl-label">Jogador</p>
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
    <TheTimer :value="timerTurn" :progress="storeTimer.turnProgress" label="Tempo para montar a mão" />

    <!-- Available deck -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <p class="sl-label">Baralho</p>
        <p class="text-xs font-semibold text-white/[0.35]">toque para selecionar</p>
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

    <!-- Shuffle button -->
    <button
      class="sl-btn-ghost w-full py-3 flex items-center justify-center gap-2"
      @click="storeCards.shuffleDisplayedCards"
    >
      <BaseIcon name="shuffle" class="w-4 h-4 shrink-0" />
      <span class="text-sm">Shuffle</span>
    </button>

    <!-- "My hand" divider -->
    <div class="relative h-px mt-2 bg-white/10">
      <span
        class="sl-hand-divider__label absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold lowercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap"
        >Minha mão</span
      >
    </div>

    <!-- Visual slots -->
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <div
          v-for="i in 3"
          :key="i"
          :class="i <= storeCards.selectedCards.length ? 'sl-slot-dot--filled' : 'sl-slot-dot--empty'"
          class="h-1.5 rounded-full transition-all duration-300"
        />
      </div>
      <span
        :class="storeCards.selectedCards.length === 3 ? 'sl-slot-count--full' : 'sl-slot-count'"
        class="text-xs font-bold"
      >
        {{ storeCards.selectedCards.length }}/3
        {{ slotsLeft > 0 ? `· ainda cabe ${slotsLeft}` : '· mão cheia' }}
      </span>
    </div>

    <!-- Selected hand — TransitionGroup IS the only flex container, no extra div -->
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

        <!-- Empty slots — inside the same TransitionGroup tag div -->
        <div
          v-for="i in slotsLeft"
          :key="`empty-${i}`"
          class="flex-shrink-0 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center min-w-[80px] aspect-[2/3]"
        >
          <span class="text-white/[0.15] text-[18px]">+</span>
        </div>
      </TransitionGroup>
    </div>

    <!-- Confirm button -->
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
.sl-hand-divider__label {
  background: linear-gradient(135deg, #3b0764, #500724);
  color: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.sl-slot-dot--filled {
  width: 36px;
  background: linear-gradient(90deg, #a855f7, #ec4899);
}

.sl-slot-dot--empty {
  width: 24px;
  background: rgba(255, 255, 255, 0.12);
}

.sl-slot-count {
  color: rgba(255, 255, 255, 0.35);
}

.sl-slot-count--full {
  color: #c4b5fd;
}

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
