<script lang="ts" setup>
import { ref, computed } from 'vue'

import AvatarInitials from '@/components/AvatarInitials.vue'
import RoomConfigSliders from '@/components/RoomConfigSliders.vue'
import BaseConfirmModal from '@/components/BaseConfirmModal.vue'

import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'
import { useTimerStore } from '@/stores/timer'
import { useRoomConfigForm } from '@/composables/useRoomConfigForm'
import { SocketEvents } from '@/constants/socketEvents'

const emit = defineEmits<{ close: [] }>()

const storeSocket = useSocketStore()
const storeSettings = useSettingStore()
const storeTimer = useTimerStore()

// Reconfiguring only makes sense in the lobby — changing timers mid-game
// would break the server's watchdog, which is already running with the old
// duration.
const canConfigure = computed(() => storeSettings.gameState === SocketEvents.STATE_LOBBY)

const { timerTurn, timerStory, turns, hasChanges, save } = useRoomConfigForm(() => emit('close'))

const kickTarget = ref<{ id: string; name: string } | null>(null)

const confirmKick = () => {
  if (!kickTarget.value) return
  storeSocket.emitKickPlayer(kickTarget.value.id)
  kickTarget.value = null
}

const showUnsavedConfirm = ref(false)
const requestClose = () => {
  if (hasChanges.value) showUnsavedConfirm.value = true
  else emit('close')
}
const discardAndClose = () => {
  showUnsavedConfirm.value = false
  emit('close')
}

const showResetConfirm = ref(false)
const confirmReset = () => {
  storeSocket.emitResetGame()
  showResetConfirm.value = false
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="requestClose"
    >
      <div
        class="bg-indigo-950/95 border border-white/20 rounded-2xl p-6 shadow-2xl w-full max-w-md flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Gerenciar sala"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-white">Gerenciar sala</h2>
          <button
            type="button"
            class="text-white/50 hover:text-white text-2xl leading-none px-2"
            aria-label="Fechar"
            @click="requestClose"
          >
            &times;
          </button>
        </div>

        <!-- Reserved seats — disconnected players, counting down to auto-kick -->
        <div v-if="storeTimer.reservationList.length > 0" class="flex flex-col gap-2">
          <p class="sl-label">Vagas reservadas</p>
          <div
            v-for="reservation in storeTimer.reservationList"
            :key="reservation.playerId"
            class="flex items-center justify-between rounded-xl px-3 py-2 bg-amber-500/10 border border-amber-500/25 text-sm"
          >
            <span class="font-semibold text-amber-200/90">{{ reservation.playerName }}</span>
            <span class="text-amber-200/70 tabular-nums">{{ reservation.remainingSeconds }}s</span>
          </div>
        </div>

        <!-- Players — removal is allowed in the lobby and mid-game -->
        <div class="flex flex-col gap-2">
          <p class="sl-label">Jogadores</p>
          <div
            v-for="player in storeSocket.room"
            :key="player.id"
            class="flex items-center gap-3 rounded-xl px-3 py-2 bg-white/5 border border-white/10"
          >
            <AvatarInitials class="w-7 h-7 rounded-full shrink-0" :alt="player.name" />
            <span class="font-semibold flex-1 truncate text-white/85">{{ player.name }}</span>
            <span
              v-if="player.id === storeSocket.myPlayerNumber"
              class="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 bg-purple-500/25 text-purple-200"
              >você</span
            >
            <button
              v-else
              type="button"
              class="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 bg-red-500/20 text-red-300 transition-colors hover:bg-red-500/30"
              @click="kickTarget = { id: player.id, name: player.name }"
            >
              Remover
            </button>
          </div>
        </div>

        <!-- Configuration — lobby only -->
        <div v-if="canConfigure" class="flex flex-col gap-3">
          <p class="sl-label">Configuração da partida</p>
          <RoomConfigSliders v-model:timer-turn="timerTurn" v-model:timer-story="timerStory" v-model:turns="turns" />
          <button :disabled="!hasChanges" class="sl-btn py-3 text-base" @click="save">
            Salvar configuração
          </button>
        </div>
        <p v-else class="text-xs text-white/40">
          A configuração só pode ser alterada enquanto a sala está no lobby.
        </p>

        <!-- Danger zone -->
        <div class="flex flex-col gap-2 pt-2 border-t border-white/10">
          <p class="sl-label">Zona de risco</p>
          <button
            type="button"
            class="text-xs font-bold px-3 py-2 rounded-xl bg-red-500/20 text-red-300 transition-colors hover:bg-red-500/30"
            @click="showResetConfirm = true"
          >
            Reiniciar jogo
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <BaseConfirmModal
    v-if="kickTarget"
    :title="`Remover ${kickTarget.name}?`"
    description="Ela não poderá mais voltar para esta sala."
    confirm-label="Remover"
    cancel-label="Cancelar"
    danger
    @confirm="confirmKick"
    @cancel="kickTarget = null"
  />

  <BaseConfirmModal
    v-if="showResetConfirm"
    title="Reiniciar o jogo?"
    description="Todos voltarão para o lobby e o progresso da partida atual será perdido."
    confirm-label="Reiniciar"
    cancel-label="Cancelar"
    danger
    @confirm="confirmReset"
    @cancel="showResetConfirm = false"
  />

  <BaseConfirmModal
    v-if="showUnsavedConfirm"
    title="Descartar alterações?"
    description="A configuração que você ajustou ainda não foi salva."
    confirm-label="Descartar"
    cancel-label="Continuar editando"
    @confirm="discardAndClose"
    @cancel="showUnsavedConfirm = false"
  />
</template>
