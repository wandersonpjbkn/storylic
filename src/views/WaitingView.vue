<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

import TheCard from '@/components/TheCard.vue'
import AvatarInitials from '@/components/AvatarInitials.vue'

import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'
import { useSeo } from '@/composables/useSeo'
import { SocketEvents } from '@/constants/socketEvents'

interface Card {
  name: string
  category: string
}
type Category = 'actions' | 'animals' | 'emotions' | 'nature' | 'objects' | 'personas' | 'places'

const storeSocket = useSocketStore()
const storeSettings = useSettingStore()

useSeo({ title: 'Sala de espera', description: 'Aguarde sua vez de jogar' })

const currentCards = ref<Card[]>([])

onMounted(() => {
  storeSocket.socket?.on(
    SocketEvents.ON_PLAYER_SELECTED_CARDS,
    ({ cards }: { cards: Card[] }) => {
      currentCards.value = cards
    },
  )
})
onUnmounted(() => {
  storeSocket.socket?.off(SocketEvents.ON_PLAYER_SELECTED_CARDS)
})
</script>

<template>
  <div class="flex flex-col gap-4 pb-4">
    <!-- Quem joga agora -->
    <div class="sl-surface px-5 py-4 text-center">
      <p class="sl-label mb-1">Jogando agora</p>
      <p class="font-bold text-2xl mb-0.5" style="color: #f9a8d4">
        {{ storeSocket.currentPlayerName }}
      </p>
      <p class="text-sm" style="color: rgba(255, 255, 255, 0.45)">
        Turno {{ storeSettings.turnCurrent }}/{{ storeSettings.turnMax }}
      </p>
    </div>

    <!-- Meu jogador -->
    <div class="sl-surface flex items-center gap-3 px-4 py-3">
      <AvatarInitials
        class="w-10 h-10 rounded-full shrink-0"
        style="border: 1.5px solid rgba(255, 255, 255, 0.25)"
        :alt="storeSocket.myPlayerName!"
      />
      <div class="flex-1 min-w-0">
        <p class="sl-label">Você</p>
        <p class="text-white font-semibold truncate">{{ storeSocket.myPlayerName }}</p>
      </div>
      <span
        class="text-xs font-bold px-3 py-1 rounded-full"
        style="
          background: rgba(168, 85, 247, 0.2);
          color: #d8b4fe;
          border: 1px solid rgba(168, 85, 247, 0.3);
        "
        >Aguardando</span
      >
    </div>

    <!-- Cards do jogador atual -->
    <template v-if="currentCards.length > 0">
      <p class="sl-label">Cards de {{ storeSocket.currentPlayerName }}</p>
      <div class="grid grid-cols-3 gap-3">
        <TheCard
          v-for="card in currentCards"
          :key="card.name"
          :name="card.name"
          :category="card.category as Category"
          :disabled="true"
        />
      </div>
    </template>

    <div
      v-else
      class="rounded-2xl border border-dashed py-8 px-4 text-center"
      style="border-color: rgba(255, 255, 255, 0.15)"
    >
      <p class="text-sm" style="color: rgba(255, 255, 255, 0.35)">
        Os cards de {{ storeSocket.currentPlayerName }} aparecerão aqui quando confirmados
      </p>
    </div>

    <!-- Aviso de vez -->
    <div
      class="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3)"
    >
      <span class="text-base shrink-0">🔔</span>
      <p class="text-sm" style="color: rgba(255, 255, 255, 0.75)">
        Você será avisado quando for sua vez
      </p>
    </div>
  </div>
</template>
