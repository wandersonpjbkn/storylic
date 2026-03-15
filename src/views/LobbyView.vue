<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'

import TheGameRules from '@/components/TheGameRules.vue'
import BaseConfirmModal from '@/components/BaseConfirmModal.vue'

import { useSocketStore } from '@/stores/socket'
import { useSeo } from '@/composables/useSeo'

const storeSocket = useSocketStore()
useSeo({ title: 'Lobby', description: 'Vamos começar a jogar?' })

const showConfirm = ref(false)
const canStart = computed(() => storeSocket.room.length >= 2)

onMounted(() => {
  document.getElementById('start-btn')?.focus()
})
</script>

<template>
  <div class="flex flex-col gap-4 pb-4">
    <!-- Sala + jogador -->
    <div class="sl-surface flex items-center justify-between px-5 py-4">
      <div>
        <p class="sl-label">Sala</p>
        <p class="font-bold text-xl" style="color: #fdba74">{{ storeSocket.gameId }}</p>
      </div>
      <div class="text-right">
        <p class="sl-label">Você</p>
        <p class="text-white font-semibold text-base">{{ storeSocket.myPlayerName }}</p>
      </div>
    </div>

    <!-- Ordem de turno — ponto 2 -->
    <div class="sl-surface px-5 py-4">
      <div class="flex items-center justify-between mb-4">
        <p class="sl-label">Ordem dos turnos</p>
        <span
          class="text-xs font-bold px-2 py-0.5 rounded-full"
          style="
            background: rgba(168, 85, 247, 0.2);
            color: #d8b4fe;
            border: 1px solid rgba(168, 85, 247, 0.25);
          "
          >{{ storeSocket.room.length }} jogador{{
            storeSocket.room.length !== 1 ? 'es' : ''
          }}</span
        >
      </div>

      <!-- Lista ordenada por entrada na sala -->
      <div class="flex flex-col gap-2">
        <div
          v-for="(player, index) in storeSocket.room"
          :key="player.id"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
          :style="
            player.id === storeSocket.myPlayerNumber
              ? 'background:rgba(168,85,247,0.18);border:1px solid rgba(168,85,247,0.30)'
              : 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10)'
          "
        >
          <!-- Número de ordem -->
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center font-black text-sm shrink-0"
            :style="
              index === 0
                ? 'background:linear-gradient(135deg,#f59e0b,#ec4899);color:#fff'
                : 'background:rgba(255,255,255,0.12);color:rgba(255,255,255,0.6)'
            "
          >
            {{ index + 1 }}
          </div>

          <!-- Avatar -->
          <img
            :src="`https://avatar.iran.liara.run/username?username=${player.name}`"
            class="w-8 h-8 rounded-full shrink-0"
            style="border: 1.5px solid rgba(255, 255, 255, 0.2)"
            :alt="player.name"
          />

          <!-- Nome -->
          <span
            class="font-semibold flex-1 truncate"
            :style="
              player.id === storeSocket.myPlayerNumber
                ? 'color:#e9d5ff'
                : 'color:rgba(255,255,255,0.80)'
            "
            >{{ player.name }}</span
          >

          <!-- Badge "Você" ou "1º a jogar" -->
          <span
            v-if="player.id === storeSocket.myPlayerNumber"
            class="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
            style="background: rgba(168, 85, 247, 0.25); color: #d8b4fe"
            >você</span
          >
          <span
            v-else-if="index === 0"
            class="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
            style="background: rgba(245, 158, 11, 0.2); color: #fcd34d"
            >1º a jogar</span
          >
        </div>

        <!-- Placeholder se sala vazia -->
        <div
          v-if="storeSocket.room.length === 0"
          class="text-center py-4"
          style="color: rgba(255, 255, 255, 0.3); font-size: 13px"
        >
          Aguardando jogadores...
        </div>
      </div>

      <!-- Nota explicativa -->
      <p class="text-xs mt-3" style="color: rgba(255, 255, 255, 0.35)">
        A ordem é definida por quem entrou primeiro na sala
      </p>
    </div>

    <!-- Aviso mínimo -->
    <div
      v-if="storeSocket.room.length < 2"
      class="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style="background: rgba(245, 158, 11, 0.15); border: 1.5px solid rgba(245, 158, 11, 0.35)"
    >
      <span class="text-base shrink-0">⚠️</span>
      <p class="text-sm font-semibold" style="color: #fcd34d">
        Aguardando pelo menos mais 1 jogador
      </p>
    </div>

    <!-- Regras -->
    <TheGameRules />

    <!-- Botão iniciar -->
    <button
      id="start-btn"
      :disabled="!canStart"
      class="sl-btn py-5 text-lg mt-2"
      @click="showConfirm = true"
    >
      {{ canStart ? 'Iniciar Jogo' : 'Aguardando jogadores...' }}
    </button>

    <p class="text-xs text-center" style="color: rgba(255, 255, 255, 0.35)">
      Todos serão puxados para o jogo ao mesmo tempo
    </p>
  </div>

  <BaseConfirmModal
    v-if="showConfirm"
    title="Iniciar partida?"
    :description="`Iniciar com ${storeSocket.room.length} jogador(es)? Todos na sala serão puxados para o jogo agora.`"
    confirm-label="Sim, iniciar!"
    cancel-label="Ainda não"
    @confirm="
      showConfirm = false
      storeSocket.emitStartGame()
    "
    @cancel="showConfirm = false"
  />
</template>
