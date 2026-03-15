import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { io, type Socket } from 'socket.io-client'

import { useGlobalStore } from '@/stores/global'
import { useSettingStore } from '@/stores/settings'
import { useCardsStore } from '@/stores/cards'

interface Player {
  id: string
  name: string
}

export const useSocketStore = defineStore('socket', () => {
  // global
  const storeGlobal = useGlobalStore()
  const storeSettings = useSettingStore()
  const storeCards = useCardsStore()

  // state
  const serverUrl = ref(import.meta.env.VITE_SERVER_URL)
  const socket = ref<Socket | null>(null)
  const gameId = ref('')
  const isConnected = ref(false)
  const room = ref<Player[]>([])
  const currentPlayerNumber = ref('')

  const mySocketId = ref('')

  // getters
  const myPlayerNumber = computed(() => mySocketId.value)
  const myPlayerName = computed(() => {
    return room.value.find(({ id }) => id === mySocketId.value)?.name
  })
  const currentPlayerName = computed(() => {
    return room.value.find(({ id }) => id === currentPlayerNumber.value)?.name
  })

  // actions
  const connectToServer = () => {
    socket.value = io(serverUrl.value)

    socket.value.on('connect', () => {
      mySocketId.value = socket.value?.id ?? ''

      storeGlobal.openNotification({
        title: 'Conectado',
        message: 'Conectado ao servidor!',
        type: 'success',
        duration: 2000,
      })

      isConnected.value = true
    })

    socket.value.on('disconnect', () => {
      storeGlobal.openNotification({
        title: 'Desconectado',
        message: 'Desconectado ao servidor!',
        type: 'error',
      })

      isConnected.value = false
      mySocketId.value = ''
    })

    socket.value.on('game-state', ({ currentPlayer, players }) => {
      const wasSmaller = storeSettings.numPlayers < players.length

      storeGlobal.openNotification({
        title: 'Sala atualizada',
        message: wasSmaller ? 'Novo jogador na sala' : 'Um jogador saiu',
        type: wasSmaller ? 'info' : 'warning',
      })

      storeSettings.numPlayers = players.length
      currentPlayerNumber.value = currentPlayer
      room.value = players
    })

    socket.value.on('player-turn', (data) => {
      storeSettings.turnCurrent = data.currentTurn
      currentPlayerNumber.value = data.currentPlayer

      if (data.currentPlayer === mySocketId.value) {
        storeSettings.startGame()
      } else {
        storeSettings.resetTimers()
        storeSettings.gameState = 'waiting'
      }
    })

    socket.value.on('game-ended', () => {
      console.log('Jogo acabou')
      storeSettings.resetGame()
      storeSettings.gameState = 'ended'
    })

    socket.value.on('game-reset', () => {
      storeSettings.resetGame()
    })

    socket.value.on('player-selected-cards', ({ cards, playerNumber }) => {
      console.log(`Jogador ${playerNumber} escolheu as cartas:`, cards)
    })
  }

  const emitJoinGame = () => {
    if (!gameId.value || !storeSettings.playerName) {
      let message = ''
      if (!gameId.value && !storeSettings.playerName) message = 'ID da sala e nome de jogador'
      else if (!gameId.value) message = 'ID da sala'
      else message = 'nome de jogador'

      storeGlobal.openNotification({
        message: `Por favor, preencha ${message}`,
      })
      return
    }

    socket.value?.emit('join-game', {
      gameId: gameId.value,
      playerName: storeSettings.playerName,
    })

    storeSettings.gameState = 'lobby'
    storeSettings.playerName = ''
  }

  const emitStartGame = () => {
    socket.value?.emit('start-game', {
      gameId: gameId.value,
      currentPlayer: mySocketId.value,
      numPlayers: storeSettings.numPlayers,
      turns: storeSettings.turnMax,
    })
  }

  const emitSelectedCards = () => {
    socket.value?.emit('cards-selected', {
      gameId: gameId.value,
      cards: storeCards.selectedCards,
      playerNumber: mySocketId.value,
    })
  }

  const emitFinishStoryAndNext = () => {
    socket.value?.emit('finish-storytelling', {
      gameId: gameId.value,
      currentPlayer: mySocketId.value,
    })
  }

  const emitResetGame = () => {
    socket.value?.emit('reset-game', {
      gameId: gameId.value,
    })
  }

  const emitLeaveGame = () => {
    socket.value?.emit('leave-game', {
      gameId: gameId.value,
      playerNumber: mySocketId.value,
    })
  }

  return {
    socket,
    gameId,
    isConnected,
    room,
    currentPlayerNumber,

    myPlayerNumber,
    myPlayerName,
    currentPlayerName,

    connectToServer,
    emitJoinGame,
    emitStartGame,
    emitSelectedCards,
    emitFinishStoryAndNext,
    emitResetGame,
    emitLeaveGame,
  }
})
