<script lang="ts" setup>
import { useSettingStore } from '@/stores/settings'

const storeSettings = useSettingStore()
</script>

<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
    <div class="mb-8">
      <div class="text-6xl mb-4">⏳</div>
      <h2 class="text-4xl font-bold text-white mb-2">Sala de Espera</h2>
      <p class="text-white/80 text-xl">Aguarde sua vez de jogar</p>
    </div>

    <div class="bg-white/5 rounded-xl p-6 mb-8">
      <p class="text-white text-2xl mb-3">
        <span class="font-bold text-pink-400">Jogador {{ storeSettings.playerName }}</span>
        está jogando agora
      </p>
      <p class="text-white/70">Turno {{ storeSettings.turnCurrent }}/3</p>
    </div>

    <div class="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
      <p class="text-blue-200 text-sm">
        🔔 Você será notificado automaticamente quando for sua vez!
      </p>
    </div>
  </div>
</template>
