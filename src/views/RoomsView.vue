<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'

import BaseIcon from '@/components/BaseIcon.vue'

import { useSocketStore } from '@/stores/socket'
import { useSeo } from '@/composables/useSeo'

interface RoomSnapshot {
  id: string
  playerCount: number
  gameState: 'setup' | 'lobby' | 'playing' | 'waiting' | 'ended'
  players: string[]
}

const router = useRouter()
const storeSocket = useSocketStore()

useSeo({ title: 'Salas', description: 'Veja as salas ativas e entre em uma partida' })

const rooms = ref<RoomSnapshot[]>([])
const search = ref('')

const activeSession = computed<{ gameId: string; token: string } | null>(() => {
  try {
    const raw = sessionStorage.getItem('storylic_session')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
})

const filteredRooms = computed(() => {
  const q = search.value.trim().toLowerCase()
  return q ? rooms.value.filter((r) => r.id.toLowerCase().includes(q)) : rooms.value
})

const statusLabel: Record<RoomSnapshot['gameState'], string> = {
  setup: 'Aguardando',
  lobby: 'Aguardando',
  waiting: 'Em jogo',
  playing: 'Em jogo',
  ended: 'Finalizado',
}

const statusColor: Record<RoomSnapshot['gameState'], string> = {
  setup: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  lobby: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  waiting: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  playing: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  ended: 'bg-white/10 text-white/40 border border-white/10',
}

const canJoin = (room: RoomSnapshot) => room.gameState === 'setup' || room.gameState === 'lobby'

const isMyRoom = (room: RoomSnapshot) => activeSession.value?.gameId === room.id

const enterRoom = (roomId: string) => {
  storeSocket.gameId = roomId
  router.push({ name: 'setup-view' })
}

const returnToRoom = (roomId: string) => {
  const session = activeSession.value
  if (session && session.gameId === roomId) {
    storeSocket.triggerRejoin(roomId, session.token)
  } else {
    storeSocket.gameId = roomId
    router.push({ name: 'setup-view' })
  }
}

const abandonAndEnter = (roomId: string) => {
  storeSocket.emitLeaveGame()
  storeSocket.gameId = roomId
  router.push({ name: 'setup-view' })
}

const goToSetup = () => router.push({ name: 'setup-view' })

onMounted(() => {
  if (storeSocket.socket) {
    storeSocket.socket.emit('get-rooms')
    storeSocket.socket.on('rooms-updated', (data: RoomSnapshot[]) => {
      rooms.value = data
    })
  }
})

onUnmounted(() => {
  storeSocket.socket?.off('rooms-updated')
})
</script>

<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
      <div class="flex items-center gap-3">
        <BaseIcon name="favicon" class="w-10 h-10" />
        <div>
          <h1 class="text-2xl font-bold text-white leading-tight">Salas ativas</h1>
          <p class="text-white/50 text-sm">{{ rooms.length }} sala(s) encontrada(s)</p>
        </div>
      </div>
      <button
        class="bg-linear-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg text-sm"
        @click="goToSetup"
      >
        + Criar sala
      </button>
    </div>

    <!-- Sessão ativa detectada — banner de destaque -->
    <div
      v-if="activeSession && rooms.some((r) => r.id === activeSession?.gameId)"
      class="mb-6 bg-purple-500/20 border border-purple-400/30 rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
    >
      <div>
        <p class="text-white font-semibold text-sm">Você tem uma sessão ativa</p>
        <p class="text-white/60 text-xs mt-0.5">
          Sala: <span class="text-pink-300 font-mono">{{ activeSession.gameId }}</span>
        </p>
      </div>
      <button
        class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
        @click="returnToRoom(activeSession.gameId)"
      >
        Voltar para a sala
      </button>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar sala por nome..."
        class="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-white/50 focus:outline-none placeholder-white/30 text-sm"
      />
    </div>

    <!-- Lista -->
    <div v-if="filteredRooms.length > 0" class="space-y-3">
      <div
        v-for="room in filteredRooms"
        :key="room.id"
        :class="[
          'flex items-center justify-between rounded-xl px-5 py-4 transition-all border gap-4 flex-wrap',
          isMyRoom(room)
            ? 'bg-purple-500/15 border-purple-400/30 hover:bg-purple-500/20'
            : 'bg-white/5 hover:bg-white/10 border-white/10',
        ]"
      >
        <!-- Info -->
        <div class="flex items-center gap-4 min-w-0">
          <div
            :class="[
              'shrink-0 w-2.5 h-2.5 rounded-full',
              room.gameState === 'setup' || room.gameState === 'lobby'
                ? 'bg-emerald-400'
                : room.gameState === 'ended'
                  ? 'bg-white/30'
                  : 'bg-yellow-400',
            ]"
          />
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-white font-semibold truncate">{{ room.id }}</p>
              <span
                v-if="isMyRoom(room)"
                class="text-xs bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full shrink-0"
              >
                sua sala
              </span>
            </div>
            <p class="text-white/50 text-xs mt-0.5">
              {{ room.playerCount }} jogador{{ room.playerCount !== 1 ? 'es' : '' }}
              <span v-if="room.players.length > 0" class="ml-1">
                — {{ room.players.slice(0, 3).join(', ')
                }}{{ room.players.length > 3 ? '...' : '' }}
              </span>
            </p>
          </div>
        </div>

        <!-- Status + ação -->
        <div class="flex items-center gap-3 shrink-0">
          <span
            :class="['text-xs font-semibold px-3 py-1 rounded-full', statusColor[room.gameState]]"
          >
            {{ statusLabel[room.gameState] }}
          </span>

          <template v-if="isMyRoom(room)">
            <button
              class="text-sm font-bold px-4 py-2 rounded-lg transition-all bg-purple-500 hover:bg-purple-600 text-white"
              @click="returnToRoom(room.id)"
            >
              Voltar
            </button>
          </template>
          <template v-else>
            <button
              :disabled="!canJoin(room)"
              :class="[
                'text-sm font-bold px-4 py-2 rounded-lg transition-all',
                canJoin(room)
                  ? 'bg-white/20 hover:bg-white/30 text-white cursor-pointer'
                  : 'bg-white/5 text-white/25 cursor-not-allowed',
              ]"
              @click="
                canJoin(room) && (activeSession ? abandonAndEnter(room.id) : enterRoom(room.id))
              "
            >
              {{ canJoin(room) ? 'Entrar' : 'Em andamento' }}
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-16">
      <p class="text-5xl mb-4">🃏</p>
      <p class="text-white/60 text-lg font-semibold">Nenhuma sala encontrada</p>
      <p class="text-white/40 text-sm mt-1">
        {{ search ? 'Tente outro nome' : 'Crie a primeira sala e convide seus amigos!' }}
      </p>
    </div>

    <!-- Footer -->
    <div
      class="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-white/30"
    >
      <span>Atualizado em tempo real</span>
      <div class="flex items-center gap-1.5">
        <div
          :class="[
            'w-1.5 h-1.5 rounded-full',
            storeSocket.isConnected ? 'bg-emerald-400' : 'bg-red-400',
          ]"
        />
        {{ storeSocket.isConnected ? 'Conectado' : 'Desconectado' }}
      </div>
    </div>
  </div>
</template>
