import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { io, type Socket } from 'socket.io-client'

import { useGlobalStore } from '@/stores/global'
import { useSettingStore } from '@/stores/settings'
import { useCardsStore } from '@/stores/cards'
import { navigateTo } from '@/composables/useNavigator'
import { SocketEvents } from '@/constants/socketEvents'

interface Player {
  id: string
  name: string
}

interface StoredSession {
  token: string
  gameId: string
  playerName?: string
}

type GameState =
  | SocketEvents.STATE_CONFIG
  | SocketEvents.STATE_SETUP
  | SocketEvents.STATE_LOBBY
  | SocketEvents.STATE_ROOMS
  | SocketEvents.STATE_PLAYING
  | SocketEvents.STATE_STORYTELLING
  | SocketEvents.STATE_WAITING
  | SocketEvents.STATE_ENDED

const SESSION_KEY = 'storylic_session'

const saveSession = (token: string, gameId: string, playerName?: string) => {
  const existing = loadSession()
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      token,
      gameId,
      playerName: playerName ?? existing?.playerName ?? '',
    }),
  )
}

const loadSession = (): StoredSession | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as StoredSession) : null
  } catch {
    return null
  }
}

const clearSession = () => sessionStorage.removeItem(SESSION_KEY)

export const useSocketStore = defineStore('socket', () => {
  const storeGlobal = useGlobalStore()
  const storeSettings = useSettingStore()
  const storeCards = useCardsStore()

  const serverUrl = ref(import.meta.env.VITE_SERVER_URL)
  const socket = ref<Socket | null>(null)
  const gameId = ref('')
  const isConnected = ref(false)
  const room = ref<Player[]>([])
  const currentPlayerNumber = ref('')
  const mySocketId = ref('')
  const isReconnecting = ref(false)

  const justJoined = ref(false)
  const pendingPlayerName = ref('')

  const goTo = (state: GameState) => {
    storeSettings.gameState = state
    navigateTo(state)
  }

  const myPlayerNumber = computed(() => mySocketId.value)
  const myPlayerName = computed(() => room.value.find(({ id }) => id === mySocketId.value)?.name)
  const currentPlayerName = computed(
    () => room.value.find(({ id }) => id === currentPlayerNumber.value)?.name,
  )

  const connectToServer = () => {
    storeSettings.setNavigateCallback(goTo)
    storeSettings.setTurnAutoFinishedCallback(() => {
      emitSelectedCards()
    })

    socket.value = io(serverUrl.value)

    /** Listeners */

    socket.value.on(SocketEvents.ON_CONNECT, () => {
      mySocketId.value = socket.value?.id ?? ''
      isConnected.value = true

      const session = loadSession()
      if (session) {
        isReconnecting.value = true
        socket.value?.emit(SocketEvents.EMIT_REJOIN_GAME, {
          gameId: session.gameId,
          token: session.token,
        })
      } else {
        storeGlobal.openNotification({
          title: 'Conectado',
          message: 'Conectado ao servidor!',
          type: 'success',
          duration: 2000,
        })
      }
    })

    socket.value.on(SocketEvents.ON_DISCONNECT, () => {
      storeGlobal.openNotification({
        title: 'Desconectado',
        message: 'Conexão perdida. Tentando reconectar...',
        type: 'error',
      })
      isConnected.value = false
      mySocketId.value = ''
    })

    socket.value.on(
      SocketEvents.ON_JOIN_ACK,
      ({
        token,
        gameId: gId,
        isCreator,
      }: {
        token: string
        gameId: string
        isCreator: boolean
      }) => {
        saveSession(token, gId, pendingPlayerName.value)
        pendingPlayerName.value = ''

        goTo(isCreator ? SocketEvents.STATE_CONFIG : SocketEvents.STATE_LOBBY)
      },
    )

    socket.value.on(SocketEvents.ON_JOIN_ERROR, ({ reason }: { reason: string }) => {
      justJoined.value = false
      storeSettings.numPlayers = 0
      storeGlobal.openNotification({
        title: reason,
        message: 'Crie uma nova sala ou busque uma existente.',
        type: 'warning',
      })
    })

    socket.value.on(
      SocketEvents.ON_REJOIN_ACK,
      (data: {
        gameState: string
        currentPlayer: string
        currentTurn: number
        turns: number
        players: Player[]
        isMyTurn: boolean
        remainingTurnMs: number
        newToken: string
        timerTurn: number
        timerStory: number
      }) => {
        isReconnecting.value = false

        const session = loadSession()
        if (session) {
          saveSession(data.newToken, session.gameId, session.playerName)
          gameId.value = session.gameId
        }

        room.value = data.players
        currentPlayerNumber.value = data.currentPlayer
        storeSettings.turnCurrent = data.currentTurn
        storeSettings.turnMax = data.turns

        if (data.timerTurn) storeSettings.baseTimerTurn = data.timerTurn
        if (data.timerStory) storeSettings.baseTimerStory = data.timerStory

        storeGlobal.openNotification({
          title: 'Reconectado!',
          message: 'Você voltou para a partida.',
          type: 'success',
          duration: 3000,
        })

        switch (data.gameState) {
          case SocketEvents.STATE_LOBBY:
            goTo(SocketEvents.STATE_LOBBY)
            break
          case SocketEvents.STATE_PLAYING:
            if (data.isMyTurn) {
              storeSettings.restoreTimer(Math.round(data.remainingTurnMs / 1000))
              storeSettings.startGame()
              navigateTo(SocketEvents.STATE_PLAYING)
            } else {
              storeSettings.resetTimers()
              goTo(SocketEvents.STATE_WAITING)
            }
            break
          case SocketEvents.STATE_STORYTELLING:
            if (data.isMyTurn) {
              storeSettings.restoreStoryTimer(Math.round(data.remainingTurnMs / 1000))
              goTo(SocketEvents.STATE_STORYTELLING)
            } else {
              goTo(SocketEvents.STATE_WAITING)
            }
            break
          case SocketEvents.STATE_WAITING:
            storeSettings.resetTimers()
            goTo(SocketEvents.STATE_WAITING)
            break
          case SocketEvents.STATE_ENDED:
            clearSession()
            goTo(SocketEvents.STATE_ENDED)
            break
          default:
            clearSession()
            goTo(SocketEvents.STATE_SETUP)
            break
        }
      },
    )

    socket.value.on(SocketEvents.ON_REJOIN_ERROR, ({ reason }: { reason: string }) => {
      isReconnecting.value = false
      clearSession()
      storeGlobal.openNotification({
        title: 'Não foi possível reconectar',
        message: reason,
        type: 'warning',
        duration: 5000,
      })
      goTo(SocketEvents.STATE_SETUP)
    })

    socket.value.on(SocketEvents.ON_GAME_STATE, ({ currentPlayer, players }) => {
      if (justJoined.value) {
        justJoined.value = false
        storeSettings.numPlayers = players.length
        currentPlayerNumber.value = currentPlayer
        room.value = players
        return
      }

      const wasSmaller = storeSettings.numPlayers < players.length
      storeSettings.numPlayers = players.length
      currentPlayerNumber.value = currentPlayer
      room.value = players

      if (storeSettings.gameState === SocketEvents.STATE_LOBBY) {
        storeGlobal.openNotification({
          title: 'Sala atualizada',
          message: wasSmaller ? 'Novo jogador na sala' : 'Um jogador saiu',
          type: wasSmaller ? 'info' : 'warning',
        })
      }
    })

    socket.value.on(SocketEvents.ON_PLAYER_TURN, (data) => {
      storeSettings.turnCurrent = data.currentTurn
      currentPlayerNumber.value = data.currentPlayer

      if (data.currentPlayer === mySocketId.value) {
        storeSettings.startGame()
        goTo(SocketEvents.STATE_PLAYING)
      } else {
        storeSettings.resetTimers()
        goTo(SocketEvents.STATE_WAITING)
      }
    })

    socket.value.on(SocketEvents.ON_GAME_ENDED, () => {
      storeSettings.softResetGame()
      goTo(SocketEvents.STATE_ENDED)
    })

    socket.value.on(
      SocketEvents.ON_GAME_RESET,
      ({
        reason,
        creatorId,
        timerTurn,
        timerStory,
        turns,
      }: {
        reason?: string
        creatorId?: string
        timerTurn?: number
        timerStory?: number
        turns?: number
      } = {}) => {
        if (reason === 'new-game') {
          if (timerTurn) storeSettings.baseTimerTurn = timerTurn
          if (timerStory) storeSettings.baseTimerStory = timerStory
          if (turns) storeSettings.turnMax = turns
          storeSettings.softResetGame()

          if (creatorId && creatorId === mySocketId.value) {
            goTo(SocketEvents.STATE_CONFIG)
          } else {
            goTo(SocketEvents.STATE_LOBBY)
          }
        } else {
          clearSession()
          storeSettings.resetGame()
          goTo(SocketEvents.STATE_ROOMS)
        }
      },
    )

    socket.value.on(
      SocketEvents.ON_ROOM_CONFIG,
      ({
        timerTurn,
        timerStory,
        turns,
      }: {
        timerTurn: number
        timerStory: number
        turns: number
      }) => {
        storeSettings.baseTimerTurn = timerTurn
        storeSettings.baseTimerStory = timerStory
        storeSettings.turnMax = turns
      },
    )

    socket.value.on(SocketEvents.ON_CONFIG_ERROR, ({ reason }: { reason: string }) => {
      storeGlobal.openNotification({
        title: 'Erro na configuração',
        message: reason,
        type: 'error',
        duration: 4000,
      })
    })

    socket.value.on(SocketEvents.ON_PLAYER_SELECTED_CARDS, ({ cards, playerNumber }) => {
      console.log('Jogador', playerNumber, 'escolheu:', cards)
    })

    socket.value.on(
      SocketEvents.ON_PLAYER_DISCONNECTED,
      ({
        playerName,
        reservedFor,
      }: {
        playerId: string
        playerName: string
        reservedFor: number
      }) => {
        storeGlobal.openNotification({
          title: `${playerName} desconectou`,
          message: `A vaga está reservada por ${reservedFor / 1000}s`,
          type: 'warning',
          duration: reservedFor,
        })
      },
    )

    socket.value.on(
      SocketEvents.ON_PLAYER_RECONNECTED,
      ({ playerName, players }: { playerId: string; playerName: string; players: Player[] }) => {
        room.value = players
        storeGlobal.openNotification({
          title: `${playerName} voltou!`,
          message: 'O jogador reconectou à partida.',
          type: 'success',
          duration: 3000,
        })
      },
    )
  }

  /** Emits */

  const emitJoinGame = () => {
    if (!gameId.value || !storeSettings.playerName) {
      let message = ''
      if (!gameId.value && !storeSettings.playerName) message = 'ID da sala e nome de jogador'
      else if (!gameId.value) message = 'ID da sala'
      else message = 'nome de jogador'
      storeGlobal.openNotification({ message: `Por favor, preencha ${message}` })
      return
    }

    justJoined.value = true
    storeSettings.numPlayers = 0
    pendingPlayerName.value = storeSettings.playerName

    socket.value?.emit(SocketEvents.EMIT_JOIN_GAME, {
      gameId: gameId.value,
      playerName: storeSettings.playerName,
    })
  }

  const emitStartGame = () => {
    socket.value?.emit(SocketEvents.EMIT_START_GAME, {
      gameId: gameId.value,
      currentPlayer: mySocketId.value,
      numPlayers: storeSettings.numPlayers,
      turns: storeSettings.turnMax,
      turnDurationMs: storeSettings.baseTimerTurn * 1000,
    })
  }

  const emitSelectedCards = () => {
    socket.value?.emit(SocketEvents.EMIT_CARDS_SELECTED, {
      gameId: gameId.value,
      cards: storeCards.selectedCards,
      playerNumber: mySocketId.value,
    })
  }

  const emitFinishStoryAndNext = () => {
    socket.value?.emit(SocketEvents.EMIT_FINISH_STORYTELLING, {
      gameId: gameId.value,
      currentPlayer: mySocketId.value,
    })
  }

  const emitResetGame = () => {
    socket.value?.emit(SocketEvents.EMIT_RESET_GAME, { gameId: gameId.value })
  }

  const emitConfigGame = ({
    timerTurn,
    timerStory,
    turns,
  }: {
    timerTurn: number
    timerStory: number
    turns: number
  }) => {
    socket.value?.emit(SocketEvents.EMIT_CONFIG_GAME, {
      gameId: gameId.value,
      timerTurn,
      timerStory,
      turns,
    })
  }

  const emitLeaveGame = () => {
    const leavingGameId = gameId.value
    clearSession()
    goTo(SocketEvents.STATE_SETUP)
    storeSettings.numPlayers = 0
    justJoined.value = false
    socket.value?.emit(SocketEvents.EMIT_LEAVE_GAME, {
      gameId: leavingGameId,
      playerNumber: mySocketId.value,
    })
    gameId.value = ''
  }

  const triggerRejoin = (targetGameId: string, token: string) => {
    gameId.value = targetGameId
    isReconnecting.value = true
    socket.value?.emit(SocketEvents.EMIT_REJOIN_GAME, { gameId: targetGameId, token })
  }

  return {
    socket,
    gameId,
    isConnected,
    isReconnecting,
    room,
    currentPlayerNumber,
    myPlayerNumber,
    myPlayerName,
    currentPlayerName,
    connectToServer,
    navigate: goTo,
    triggerRejoin,
    emitJoinGame,
    emitConfigGame,
    emitStartGame,
    emitSelectedCards,
    emitFinishStoryAndNext,
    emitResetGame,
    emitLeaveGame,
  }
})
