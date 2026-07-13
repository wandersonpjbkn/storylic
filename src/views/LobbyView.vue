<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'

import AvatarInitials from '@/components/AvatarInitials.vue'
import TheGameRules from '@/components/TheGameRules.vue'
import BaseConfirmModal from '@/components/BaseConfirmModal.vue'

import { useSocketStore } from '@/stores/socket'
import { useGlobalStore } from '@/stores/global'
import { useSeo } from '@/composables/useSeo'

const storeSocket = useSocketStore()
const storeGlobal = useGlobalStore()
useSeo({ title: 'Lobby', description: 'Vamos começar a jogar?' })

const showConfirm = ref(false)
const limitPlayersBeforeStart = ref(1)
const canStart = computed(() => storeSocket.room.length >= limitPlayersBeforeStart.value)

const copyInviteLink = async () => {
  const url = `${window.location.origin}/join/${storeSocket.gameId}`
  try {
    await navigator.clipboard.writeText(url)
    storeGlobal.openNotification({
      title: 'Link copiado!',
      message: 'Compartilhe com quem você quer chamar pra sala.',
      type: 'success',
      duration: 3000,
    })
  } catch {
    storeGlobal.openNotification({
      title: 'Não foi possível copiar',
      message: url,
      type: 'warning',
      duration: 6000,
    })
  }
}

onMounted(() => {
  document.getElementById('start-btn')?.focus()
})
</script>

<template>
  <div class="flex flex-col gap-4 pb-4">
    <!-- Room + player -->
    <div class="sl-surface flex items-center justify-between px-5 py-4">
      <div>
        <p class="sl-label">Sala</p>
        <p class="font-bold text-xl text-orange-300">{{ storeSocket.gameId }}</p>
      </div>
      <div class="text-right">
        <p class="sl-label">Você</p>
        <p class="text-white font-semibold text-base">{{ storeSocket.myPlayerName }}</p>
      </div>
    </div>

    <!-- Invite — owner only -->
    <button
      v-if="storeSocket.isOwner"
      type="button"
      class="sl-btn-ghost w-full py-3 text-sm"
      @click="copyInviteLink"
    >
      🔗 Copiar link de convite
    </button>

    <!-- Turn order -->
    <div class="sl-surface px-5 py-4">
      <div class="flex items-center justify-between mb-4">
        <p class="sl-label">Ordem dos turnos</p>
        <span
          class="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/25"
          >{{ storeSocket.room.length }} jogador{{
            storeSocket.room.length !== 1 ? 'es' : ''
          }}</span
        >
      </div>

      <!-- List ordered by room join order -->
      <div class="flex flex-col gap-2">
        <div
          v-for="(player, index) in storeSocket.room"
          :key="player.id"
          :class="
            player.id === storeSocket.myPlayerNumber
              ? 'bg-purple-500/[0.18] border border-purple-500/30'
              : 'bg-white/[0.06] border border-white/10'
          "
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
        >
          <!-- Order number -->
          <div
            :class="
              index === 0
                ? 'bg-linear-to-br from-amber-500 to-pink-500 text-white'
                : 'bg-white/[0.12] text-white/60'
            "
            class="w-7 h-7 rounded-full flex items-center justify-center font-black text-sm shrink-0"
          >
            {{ index + 1 }}
          </div>

          <!-- Avatar -->
          <AvatarInitials
            class="w-8 h-8 rounded-full shrink-0 border-[1.5px] border-white/20"
            :alt="player.name"
          />

          <!-- Name -->
          <span
            :class="player.id === storeSocket.myPlayerNumber ? 'text-purple-200' : 'text-white/80'"
            class="font-semibold flex-1 truncate"
            >{{ player.name }}</span
          >

          <!-- Badge "You" or "1st to play" -->
          <span
            v-if="player.id === storeSocket.myPlayerNumber"
            class="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 bg-purple-500/25 text-purple-300"
            >você</span
          >
          <span
            v-else-if="index === 0"
            class="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 bg-amber-500/20 text-amber-300"
            >1º a jogar</span
          >
        </div>

        <!-- Placeholder for an empty room -->
        <div v-if="storeSocket.room.length === 0" class="text-center py-4 text-white/30 text-[13px]">
          Aguardando jogadores...
        </div>
      </div>

      <!-- Explanatory note -->
      <p class="text-xs mt-3 text-white/[0.35]">A ordem é definida por quem entrou primeiro na sala</p>
    </div>

    <!-- Minimum-players notice -->
    <div
      v-if="storeSocket.room.length < limitPlayersBeforeStart"
      class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/[0.15] border-[1.5px] border-amber-500/[0.35]"
    >
      <span class="text-base shrink-0">⚠️</span>
      <p class="text-sm font-semibold text-amber-300">
        Aguardando pelo menos mais
        {{ Math.abs(storeSocket.room.length - limitPlayersBeforeStart) }} jogador
      </p>
    </div>

    <!-- Rules -->
    <TheGameRules />

    <!-- Start button -->
    <button
      id="start-btn"
      :disabled="!canStart"
      class="sl-btn py-5 text-lg mt-2"
      @click="showConfirm = true"
    >
      {{ canStart ? 'Iniciar Jogo' : 'Aguardando jogadores...' }}
    </button>

    <p class="text-xs text-center text-white/[0.35]">Todos serão puxados para o jogo ao mesmo tempo</p>
  </div>

  <BaseConfirmModal
    v-if="showConfirm"
    title="Iniciar partida?"
    :description="`Iniciar com ${storeSocket.room.length} jogador(es)? Todos na sala serão puxados para o jogo agora.`"
    confirm-label="Sim, iniciar!"
    cancel-label="Ainda não"
    @confirm="((showConfirm = false), storeSocket.emitStartGame())"
    @cancel="showConfirm = false"
  />
</template>
