<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import TheRoomRules from '@/components/TheRoomRules.vue'
import ServerSwitcher from '@/components/ServerSwitcher.vue'
import BaseConfirmModal from '@/components/BaseConfirmModal.vue'
import ConnectionStatus from '@/components/ConnectionStatus.vue'

import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'
import { useSeo } from '@/composables/useSeo'

const router = useRouter()
const route = useRoute()
const storeSocket = useSocketStore()
const storeSettings = useSettingStore()

// Invite link (/join/:gameId): joins straight into the linked room, no
// option to pick another — only the name field is left to fill in.
const isInviteMode = computed(() => !!route.params.gameId)

// Error prevention/identification (WCAG 3.3.1): submitting empty marks the
// field invalid and moves focus to it, instead of just failing silently.
const invalidField = ref<'room' | 'name' | null>(null)
const clearInvalid = () => {
  invalidField.value = null
}
const onRoomIdInput = (e: Event) => {
  storeSocket.gameId = (e.target as HTMLInputElement).value.toLowerCase().trim()
  clearInvalid()
}
const submitJoin = () => {
  invalidField.value = null
  if (!storeSocket.gameId) invalidField.value = 'room'
  else if (!storeSettings.playerName) invalidField.value = 'name'

  if (invalidField.value) {
    const id = invalidField.value === 'room' ? 'room-id' : 'player-name'
    document.getElementById(id)?.focus()
    return
  }
  storeSocket.emitJoinGame()
}

useSeo({ title: 'Home', description: 'Crie histórias incríveis com cartas aleatórias!' })

const sessionPlayerName = computed(
  () => storeSocket.activeSession?.playerName || storeSocket.myPlayerName || '',
)

const returnToRoom = () => {
  if (!storeSocket.activeSession) return
  storeSocket.triggerRejoin(storeSocket.activeSession.gameId, storeSocket.activeSession.token)
}

const showAbandonConfirm = ref(false)

const abandonRoom = () => {
  storeSocket.emitLeaveGame()
  showAbandonConfirm.value = false
}

const goToRooms = () => router.push({ name: 'rooms-view' })

onMounted(() => {
  if (isInviteMode.value && !storeSocket.activeSession) {
    storeSocket.gameId = String(route.params.gameId).toLowerCase().trim()
  }
  if (!storeSocket.activeSession && storeSocket.gameId) {
    const input = document.getElementById('player-name') as HTMLInputElement | null
    input?.focus()
  }
})
</script>

<template>
  <!-- form to return to room -->
  <form
    v-if="storeSocket.activeSession"
    class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20"
    @submit.prevent="returnToRoom"
  >
    <div class="flex justify-center items-center gap-3 mb-2">
      <BaseIcon name="favicon" class="w-16 h-16" />
      <h1 class="text-4xl font-bold text-white text-center">Storylic</h1>
    </div>
    <p class="text-white/70 text-center mb-8 text-sm">Você já está em uma sala. Deseja voltar?</p>

    <div class="mb-5">
      <label class="block text-white font-semibold mb-2 text-sm">Sala</label>
      <div
        class="w-full px-4 py-3 rounded-xl bg-white/5 text-white/50 text-lg text-center border-2 border-white/10 select-none"
      >
        {{ storeSocket.activeSession.gameId }}
      </div>
    </div>

    <div class="mb-6">
      <label class="block text-white font-semibold mb-2 text-sm">
        Seu apelido
        <span class="text-white/40 font-normal ml-1">(não pode ser alterado ao retornar)</span>
      </label>
      <div
        class="w-full px-4 py-3 rounded-xl bg-white/5 text-white/50 text-lg text-center border-2 border-white/10 select-none"
      >
        {{ sessionPlayerName || '—' }}
      </div>
    </div>

    <ConnectionStatus class="mb-6" />

    <button
      :disabled="!storeSocket.isConnected"
      :class="[
        'w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg mb-3',
        storeSocket.isConnected
          ? 'bg-linear-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 cursor-pointer'
          : 'bg-white/10 text-white/30 cursor-not-allowed',
      ]"
      type="submit"
    >
      Voltar para a sala
    </button>

    <button
      type="button"
      class="w-full py-3 rounded-xl text-white/50 hover:text-white text-sm font-medium transition-colors hover:bg-white/5"
      @click="showAbandonConfirm = true"
    >
      Sair da sala e ver outras
    </button>
  </form>

  <!-- form to join a room -->
  <form
    v-else-if="!storeSocket.activeSession"
    class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20"
    @submit.prevent="submitJoin"
  >
    <div class="flex justify-center items-center gap-3 mb-2">
      <BaseIcon name="favicon" class="w-16 h-16" />
      <h1 class="text-4xl font-bold text-white text-center">Storylic</h1>
    </div>
    <p class="text-white/70 text-center mb-8 text-sm leading-relaxed">
      Prepare a sua mão e comece a criar mundos incríveis!
    </p>

    <ConnectionStatus class="mb-6" hint />

    <div v-if="isInviteMode" class="mb-5 text-center">
      <p class="text-white/60 text-sm">Você foi convidado para a sala</p>
      <p class="text-pink-300 font-bold text-lg">{{ storeSocket.gameId }}</p>
    </div>
    <div v-else class="mb-5">
      <label for="room-id" class="block text-white font-semibold mb-2 text-sm">
        ID da Sala
        <span id="room-id-hint" class="text-white/70 font-normal ml-1"
          >(escolha um nome único para sua sala)</span
        >
      </label>
      <input
        id="room-id"
        :value="storeSocket.gameId"
        type="text"
        placeholder="Ex: sala-dos-amigos"
        autocomplete="off"
        autocapitalize="none"
        autocorrect="off"
        spellcheck="false"
        inputmode="text"
        aria-describedby="room-id-hint"
        :aria-invalid="invalidField === 'room'"
        class="w-full px-4 py-3 rounded-xl bg-white/15 text-white text-lg text-center border-2 border-white/20 focus:border-white/60 focus:outline-none placeholder-white/30 transition-colors lowercase"
        @input="onRoomIdInput"
      />
    </div>

    <div class="mb-6">
      <label for="player-name" class="block text-white font-semibold mb-2 text-sm"
        >Seu apelido</label
      >
      <input
        id="player-name"
        v-model.trim="storeSettings.playerName"
        type="text"
        placeholder="Ex: batatinha123"
        maxlength="24"
        autocomplete="nickname"
        inputmode="text"
        :aria-invalid="invalidField === 'name'"
        class="w-full px-4 py-3 rounded-xl bg-white/15 text-white text-lg text-center border-2 border-white/20 focus:border-white/60 focus:outline-none placeholder-white/30 transition-colors"
        @input="clearInvalid"
      />
    </div>

    <the-room-rules class="mb-8" />

    <button
      :disabled="!storeSocket.isConnected"
      :class="[
        'w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg mb-3',
        storeSocket.isConnected
          ? 'bg-linear-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 hover:shadow-xl cursor-pointer'
          : 'bg-white/10 text-white/30 cursor-not-allowed',
      ]"
      type="submit"
    >
      Entrar na sala
    </button>

    <button
      v-if="!isInviteMode"
      type="button"
      class="w-full py-3 rounded-xl text-white/60 hover:text-white text-sm font-medium transition-colors hover:bg-white/5"
      @click="goToRooms"
    >
      🔍 Ver salas ativas
    </button>

    <ServerSwitcher v-if="!isInviteMode" class="mt-4" />
  </form>

  <!-- abandon confirm modal -->
  <BaseConfirmModal
    v-if="showAbandonConfirm"
    title="Sair desta sala?"
    description="Você não poderá mais voltar para esta sala depois de sair. Se caiu por engano, feche esta janela e volte em vez de sair."
    confirm-label="Sim, sair"
    cancel-label="Voltar"
    danger
    @confirm="abandonRoom"
    @cancel="showAbandonConfirm = false"
  />
</template>
