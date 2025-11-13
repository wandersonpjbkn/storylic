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

  // getters
  const myPlayerNumber = computed(() => {
    return socket.value?.id
  })

  // actions
  const connectToServer = () => {
    socket.value = io(serverUrl.value)

    socket.value.on('connect', () => {
      console.log('Conectado ao servidor!')

      isConnected.value = true
    })

    socket.value.on('disconnect', () => {
      console.log('Desconectado do servidor')

      isConnected.value = false
    })

    socket.value.on('game-started', (game) => {
      console.log('Jogo iniciado!', game)

      storeSettings.gameState = 'waiting'
    })

    socket.value.on('game-state', ({ players }) => {
      console.log('Sala atualizada', players)

      storeSettings.numPlayers = players.length
      room.value = players
    })

    socket.value.on('player-turn', ({ playerName, currentPlayer, currentTurn }) => {
      console.log(`Vez do jogador ${playerName}`)

      storeSettings.playerName = playerName
      storeSettings.currentPlayer = currentPlayer
      storeSettings.turnCurrent = currentTurn

      if (currentPlayer === myPlayerNumber.value) storeSettings.startGame()
      else {
        storeSettings.gameState = 'waiting'
        storeSettings.stopTimerTurn()
      }
    })

    socket.value.on('game-ended', () => {
      console.log(`Jogo acabou`)

      storeSettings.resetGame()

      storeSettings.gameState = 'ended'
    })

    socket.value.on('game-reset', () => {
      storeSettings.resetGame()
    })
  }
  const emitJoinGame = () => {
    if (!gameId.value || !storeSettings.playerName) {
      let message

      if (!gameId.value) message = 'ID da sala'
      if (!storeSettings.playerName) message = 'nome de jogador'
      if (!gameId.value && !storeSettings.playerName) message = 'ID da sala e nome de jogador'

      storeGlobal.openNotification({
        message: `Por favor, preencha ${message}`,
      })

      return
    }

    socket.value?.emit('join-game', {
      gameId: gameId.value,
      playerName: storeSettings.playerName,
      playerNumber: myPlayerNumber.value,
    })

    storeSettings.gameState = 'lobby'
  }
  const emitStartGame = () => {
    socket.value?.emit('start-game', {
      gameId: gameId.value,
      playerName: storeSettings.playerName,
      currentPlayer: myPlayerNumber.value,
      numPlayers: storeSettings.numPlayers,
      turns: storeSettings.turnMax,
    })
  }
  const emitSelectedCards = () => {
    socket.value?.emit('cards-selected', {
      gameId: gameId.value,
      cards: storeCards.selectedCards,
      playerNumber: myPlayerNumber.value,
    })
  }
  const emitFinishStoryAndNext = () => {
    socket.value?.emit('finish-storytelling', {
      gameId: gameId.value,
    })
  }
  const emitResetGame = () => {
    socket.value?.emit('reset-game', {
      gameId: gameId.value,
    })
  }

  return {
    //state
    socket,
    gameId,
    isConnected,
    room,

    // getters
    myPlayerNumber,

    // actions
    connectToServer,
    emitJoinGame,
    emitStartGame,
    emitSelectedCards,
    emitFinishStoryAndNext,
    emitResetGame,
  }
})
