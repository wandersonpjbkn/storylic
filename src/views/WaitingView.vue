<script lang="ts" setup>
import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'
import { useSeo } from '@/composables/useSeo'
import type { Category } from '@/types'

import TheCard from '@/components/TheCard.vue'
import AvatarInitials from '@/components/AvatarInitials.vue'

const storeSocket = useSocketStore()
const storeSettings = useSettingStore()

useSeo({ title: 'Sala de espera', description: 'Aguarde sua vez de jogar' })
</script>

<template>
  <div class="flex flex-col gap-4 pb-4">
    <!-- My player -->
    <div class="sl-surface flex items-center gap-3 px-4 py-3">
      <AvatarInitials
        class="w-10 h-10 rounded-full shrink-0 border-[1.5px] border-white/25"
        :alt="storeSocket.myPlayerName!"
      />
      <div class="flex-1 min-w-0">
        <p class="sl-label">Você</p>
        <p class="text-white font-semibold truncate">{{ storeSocket.myPlayerName }}</p>
      </div>
      <span class="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
        >Aguardando</span
      >
    </div>

    <!-- Who's playing now -->
    <div class="sl-surface px-5 py-4 text-center">
      <p class="sl-label mb-1">Jogando agora</p>
      <p class="font-bold text-2xl mb-0.5 text-pink-300">
        {{ storeSocket.currentPlayerName }}
      </p>
      <p class="text-sm text-white/45">
        Turno {{ storeSettings.turnCurrent }}/{{ storeSettings.turnMax }}
      </p>
    </div>

    <!-- Current player's cards -->
    <template v-if="storeSocket.currentCards.length > 0">
      <p class="sl-label">Cards de {{ storeSocket.currentPlayerName }}</p>
      <div class="grid grid-cols-3 gap-3">
        <TheCard
          v-for="card in storeSocket.currentCards"
          :key="card.name"
          :name="card.name"
          :category="card.category as Category"
          :disabled="true"
        />
      </div>
    </template>

    <div v-else class="rounded-2xl border border-dashed border-white/[0.15] py-8 px-4 text-center">
      <p class="text-sm text-white/[0.35]">
        Os cards de {{ storeSocket.currentPlayerName }} aparecerão aqui quando confirmados
      </p>
    </div>

    <!-- Turn notice -->
    <div class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-500/[0.15] border border-indigo-500/30">
      <span class="text-base shrink-0">🔔</span>
      <p class="text-sm text-white/75">Você será avisado quando for sua vez</p>
    </div>
  </div>
</template>
