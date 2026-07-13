<script lang="ts" setup>
import { onMounted } from 'vue'

import RoomConfigSliders from '@/components/RoomConfigSliders.vue'

import { useSocketStore } from '@/stores/socket'
import { useRoomConfigForm } from '@/composables/useRoomConfigForm'
import { useSeo } from '@/composables/useSeo'
import { SocketEvents } from '@/constants/socketEvents'

const storeSocket = useSocketStore()

useSeo({ title: 'Configurar sala', description: 'Defina as regras da partida' })

const { timerTurn, timerStory, turns, hasChanges, save, reset } = useRoomConfigForm(() =>
  storeSocket.navigate(SocketEvents.STATE_LOBBY),
)

onMounted(() => {
  document.getElementById('config-btn')?.focus()
})
</script>

<template>
  <div class="flex flex-col gap-5 pb-4">
    <!-- Header -->
    <div>
      <p class="sl-label mb-1">Nova sala</p>
      <h1 class="text-white font-black text-2xl leading-tight">Configurar partida</h1>
      <p class="text-sm mt-1 text-white/45">
        Sala <span class="text-orange-300 font-bold">{{ storeSocket.gameId }}</span>
        · só você vê esta tela
      </p>
    </div>

    <!-- Settings -->
    <div class="flex flex-col gap-3">
      <RoomConfigSliders v-model:timer-turn="timerTurn" v-model:timer-story="timerStory" v-model:turns="turns" />
    </div>

    <!-- Visual summary -->
    <div class="rounded-2xl px-5 py-4 flex items-center justify-around gap-4 bg-white/[0.06] border border-white/10">
      <div class="text-center">
        <p class="sl-label mb-1">Cards</p>
        <p class="font-black text-white text-xl">{{ timerTurn }}s</p>
      </div>
      <div class="w-px h-8 bg-white/[0.12]" />
      <div class="text-center">
        <p class="sl-label mb-1">Narração</p>
        <p class="font-black text-white text-xl">{{ timerStory }}s</p>
      </div>
      <div class="w-px h-8 bg-white/[0.12]" />
      <div class="text-center">
        <p class="sl-label mb-1">Turnos</p>
        <p class="font-black text-white text-xl">{{ turns }}</p>
      </div>
    </div>

    <!-- Confirm -->
    <button id="config-btn" class="sl-btn py-5 text-lg" @click="save">
      Confirmar e ir para o lobby
    </button>

    <!-- Reset -->
    <button
      :disabled="!hasChanges"
      class="sl-btn-ghost w-full py-3 flex items-center justify-center gap-2"
      @click="reset"
    >
      <span class="text-lg">Resetar</span>
    </button>

    <p class="text-xs text-center text-white/30">
      Outros jogadores verão estas configurações ao entrar
    </p>
  </div>
</template>
