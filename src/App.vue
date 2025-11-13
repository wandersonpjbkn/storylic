<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'

import TheNotification from '@/components/TheNotification.vue'

import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'
import { useCardsStore } from '@/stores/cards'

const router = useRouter()
const storeSocket = useSocketStore()
const storeSettings = useSettingStore()
const storeCards = useCardsStore()

const gameState = computed(() => storeSettings.gameState)

onMounted(() => {
  storeSocket.connectToServer()
  storeCards.initializeDeck()
})

onUnmounted(() => {
  if (storeSocket.socket) {
    storeSocket.socket.disconnect()
  }
  storeSettings.stopTimerTurn()
})

watch(gameState, (state) => {
  switch (state) {
    case 'ended':
      router.push({ name: 'ended-view' })
      break

    case 'storytelling':
      router.push({ name: 'storytelling-view' })
      break

    case 'playing':
      router.push({ name: 'playing-view' })
      break

    case 'waiting':
      router.push({ name: 'waiting-view' })
      break

    case 'lobby':
      router.push({ name: 'lobby-view' })
      break

    case 'setup':
    default:
      router.push({ name: 'setup-view' })
      break
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
    <div class="max-w-4xl mx-auto">
      <router-view />
    </div>
  </div>

  <the-notification />
</template>

<style lang="scss">
html,
body {
  margin: 0px !important;
  padding: 0px !important;
  overflow: auto;
}

button {
  cursor: pointer;
}

#app {
  position: relative;
}
</style>
