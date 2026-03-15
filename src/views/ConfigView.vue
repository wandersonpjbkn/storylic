<script lang="ts" setup>
import { ref, computed } from 'vue'

import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'
import { useSeo } from '@/composables/useSeo'

const storeSocket = useSocketStore()
const storeSettings = useSettingStore()

useSeo({ title: 'Configurar sala', description: 'Defina as regras da partida' })

// Valores locais — só persistem ao confirmar
const timerTurn = ref(storeSettings.baseTimerTurn)
const timerStory = ref(storeSettings.baseTimerStory)
const turns = ref(storeSettings.turnMax)

const hasChanges = computed(() => {
  return (
    timerTurn.value !== storeSettings.baseTimerTurn ||
    timerStory.value !== storeSettings.baseTimerStory ||
    turns.value !== storeSettings.turnMax
  )
})

const confirm = () => {
  // Persiste localmente
  storeSettings.baseTimerTurn = timerTurn.value
  storeSettings.baseTimerStory = timerStory.value
  storeSettings.turnMax = turns.value

  // Envia para o backend — todos na sala receberão room-config
  storeSocket.emitConfigGame({
    timerTurn: timerTurn.value,
    timerStory: timerStory.value,
    turns: turns.value,
  })

  storeSocket.navigate('lobby')
}

const reset = () => {
  timerTurn.value = storeSettings.baseTimerTurn
  timerStory.value = storeSettings.baseTimerStory
  turns.value = storeSettings.turnMax
}
</script>

<template>
  <div class="flex flex-col gap-5 pb-4">
    <!-- Header -->
    <div>
      <p class="sl-label mb-1">Nova sala</p>
      <h1 class="text-white font-black text-2xl leading-tight">Configurar partida</h1>
      <p class="text-sm mt-1" style="color: rgba(255, 255, 255, 0.45)">
        Sala <span style="color: #fdba74; font-weight: 700">{{ storeSocket.gameId }}</span>
        · só você vê esta tela
      </p>
    </div>

    <!-- Configurações -->
    <div class="flex flex-col gap-3">
      <!-- Tempo de escolha dos cards -->
      <div class="sl-surface px-5 py-4">
        <div class="flex items-center justify-between mb-1">
          <p class="text-white font-bold text-sm">Tempo para escolher cards</p>
          <span class="font-black text-lg">{{ timerTurn }}s</span>
        </div>
        <p class="text-xs mb-4" style="color: rgba(255, 255, 255, 0.35)">
          Quanto tempo cada jogador tem para montar a mão
        </p>
        <input
          v-model.number="timerTurn"
          type="range"
          min="10"
          max="60"
          step="5"
          class="sl-slider w-full"
        />
        <div class="flex justify-between mt-1">
          <span class="text-xs" style="color: rgba(255, 255, 255, 0.25)">10s</span>
          <span class="text-xs" style="color: rgba(255, 255, 255, 0.25)">60s</span>
        </div>
      </div>

      <!-- Tempo de narração -->
      <div class="sl-surface px-5 py-4">
        <div class="flex items-center justify-between mb-1">
          <p class="text-white font-bold text-sm">Tempo para narrar</p>
          <span class="font-black text-lg">{{ timerStory }}s</span>
        </div>
        <p class="text-xs mb-4" style="color: rgba(255, 255, 255, 0.35)">
          Quanto tempo cada jogador tem para contar seu trecho
        </p>
        <input
          v-model.number="timerStory"
          type="range"
          min="20"
          max="120"
          step="5"
          class="sl-slider w-full"
        />
        <div class="flex justify-between mt-1">
          <span class="text-xs" style="color: rgba(255, 255, 255, 0.25)">20s</span>
          <span class="text-xs" style="color: rgba(255, 255, 255, 0.25)">120s</span>
        </div>
      </div>

      <!-- Número de turnos -->
      <div class="sl-surface px-5 py-4">
        <div class="flex items-center justify-between mb-1">
          <p class="text-white font-bold text-sm">Número de turnos</p>
          <span class="font-black text-lg">{{ turns }}</span>
        </div>
        <p class="text-xs mb-4" style="color: rgba(255, 255, 255, 0.35)">
          Quantas rodadas a história terá ao todo
        </p>
        <input
          v-model.number="turns"
          type="range"
          min="1"
          max="10"
          step="1"
          class="sl-slider w-full"
        />
        <div class="flex justify-between mt-1">
          <span class="text-xs" style="color: rgba(255, 255, 255, 0.25)">1 turno</span>
          <span class="text-xs" style="color: rgba(255, 255, 255, 0.25)">10 turnos</span>
        </div>
      </div>
    </div>

    <!-- Resumo visual -->
    <div
      class="rounded-2xl px-5 py-4 flex items-center justify-around gap-4"
      style="background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1)"
    >
      <div class="text-center">
        <p class="sl-label mb-1">Cards</p>
        <p class="font-black text-white text-xl">{{ timerTurn }}s</p>
      </div>
      <div style="width: 1px; height: 32px; background: rgba(255, 255, 255, 0.12)" />
      <div class="text-center">
        <p class="sl-label mb-1">Narração</p>
        <p class="font-black text-white text-xl">{{ timerStory }}s</p>
      </div>
      <div style="width: 1px; height: 32px; background: rgba(255, 255, 255, 0.12)" />
      <div class="text-center">
        <p class="sl-label mb-1">Turnos</p>
        <p class="font-black text-white text-xl">{{ turns }}</p>
      </div>
    </div>

    <!-- Confirmar -->
    <button class="sl-btn py-5 text-lg" @click="confirm">Confirmar e ir para o lobby</button>

    <!-- Reset -->
    <button
      :disabled="!hasChanges"
      class="sl-btn-ghost w-full py-3 flex items-center justify-center gap-2"
      @click="reset"
    >
      <span class="text-lg">Resetar</span>
    </button>

    <p class="text-xs text-center" style="color: rgba(255, 255, 255, 0.3)">
      Outros jogadores verão estas configurações ao entrar
    </p>
  </div>
</template>

<style scoped>
.sl-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.12);
  outline: none;
  cursor: pointer;
}

.sl-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899, #a855f7);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.sl-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899, #a855f7);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.8);
}
</style>
