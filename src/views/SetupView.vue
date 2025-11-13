<script lang="ts" setup>
import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'

const storeSocket = useSocketStore()
const storeSettings = useSettingStore()
</script>

<template>
  <form
    class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20"
    @submit.prevent="storeSocket.emitJoinGame"
  >
    <h1 class="text-4xl font-bold text-white mb-2 text-center">Storylic</h1>
    <p class="text-white/80 text-center mb-8">Crie histórias incríveis com cartas aleatórias!</p>

    <!-- connection status -->
    <div class="mb-6">
      <div class="flex items-center justify-center gap-2 mb-4">
        <div
          :class="['w-3 h-3 rounded-full', storeSocket.isConnected ? 'bg-green-500' : 'bg-red-500']"
        />
        <span class="text-white text-sm">{{
          storeSocket.isConnected ? 'Conectado' : 'Desconectado'
        }}</span>
      </div>
    </div>

    <!-- room -->
    <div class="mb-6">
      <label class="block text-white mb-3 text-lg">ID da Sala:</label>
      <input
        v-model.trim="storeSocket.gameId"
        type="text"
        placeholder="Ex: sala123"
        class="w-full px-4 py-3 rounded-lg bg-white/20 text-white text-xl text-center border-2 border-white/30 focus:border-white/60 focus:outline-none placeholder-white/40"
      />
    </div>

    <!-- name -->
    <div class="mb-6">
      <label class="block text-white mb-3 text-lg">Seu nome:</label>
      <input
        v-model.trim="storeSettings.playerName"
        type="text"
        placeholder="Ex: batatinha123"
        class="w-full px-4 py-3 rounded-lg bg-white/20 text-white text-xl text-center border-2 border-white/30 focus:border-white/60 focus:outline-none"
      />
    </div>

    <!-- actions -->
    <button
      :disabled="!storeSocket.isConnected"
      :class="[
        'w-full py-4 rounded-xl font-bold text-xl transition-all shadow-lg',
        storeSocket.isConnected
          ? 'bg-linear-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
          : 'bg-gray-500/50 text-gray-300 cursor-not-allowed',
      ]"
      type="submit"
    >
      Entrar na Sala
    </button>
  </form>
</template>
