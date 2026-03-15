<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import TheTimer from '@/components/TheTimer.vue'
import TheCard from '@/components/TheCard.vue'

import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'
import { useCardsStore } from '@/stores/cards'
import { useSeo } from '@/composables/useSeo'

type Category = 'actions' | 'animals' | 'emotions' | 'nature' | 'objects' | 'personas' | 'places'

const storeSocket = useSocketStore()
const storeSettings = useSettingStore()
const storeCards = useCardsStore()

useSeo({ title: 'Contando histórias', description: 'Deixe sua imaginação voar' })

const timerStory = computed(() => storeSettings.timerStory)
const alreadyFinished = ref(false)

const finishStoryAndNext = () => {
  if (alreadyFinished.value) return
  alreadyFinished.value = true
  storeSettings.stopTimerStory()
  storeSocket.emitFinishStoryAndNext()
}

watch(timerStory, (v) => {
  if (v <= 0) finishStoryAndNext()
})
</script>

<template>
  <div class="flex flex-col gap-4 pb-4">
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between">
      <div>
        <p class="sl-label">Narrando</p>
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
    <TheTimer :value="timerStory" :base="storeSettings.baseTimerStory" label="Tempo para narrar" />

    <!-- Instrução -->
    <div class="sl-surface px-4 py-3 text-center">
      <p class="text-sm leading-relaxed" style="color: rgba(255, 255, 255, 0.75)">
        Conte seu trecho usando os cards abaixo.
        <span class="block mt-0.5 text-xs" style="color: rgba(255, 255, 255, 0.4)"
          >Seja criativo — tudo vale!</span
        >
      </p>
    </div>

    <!-- Mão — grid centralizado, cards em tamanho normal, readonly -->
    <div>
      <p class="sl-label text-center mb-3">Sua mão</p>

      <!-- Grid dinâmico: 1 card → centralizado; 2 → dois colunas; 3 → três colunas -->
      <div
        class="grid gap-3 mx-auto"
        :style="{
          gridTemplateColumns: `repeat(${storeCards.selectedCards.length}, minmax(0, 1fr))`,
          maxWidth:
            storeCards.selectedCards.length === 1
              ? '140px'
              : storeCards.selectedCards.length === 2
                ? '280px'
                : '100%',
        }"
      >
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

    <!-- Botão terminar -->
    <button
      :disabled="alreadyFinished"
      class="sl-btn py-5 text-lg mt-2"
      @click="finishStoryAndNext"
    >
      {{ alreadyFinished ? 'Aguardando próximo turno...' : 'Terminar minha vez' }}
    </button>
  </div>
</template>
