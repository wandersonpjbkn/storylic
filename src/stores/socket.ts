import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { io, type Socket } from 'socket.io-client'

import { useGlobalStore } from '@/stores/global'
import { useSettingStore } from '@/stores/settings'
import { useCardsStore } from '@/stores/cards'
import { useTimerStore } from '@/stores/timer'

import { navigateTo } from '@/composables/useNavigator'
import { SocketEvents } from '@/constants/socketEvents'
import type { Card, GameState, Player, StoredSession } from '@/types'

const SESSION_KEY = SocketEvents.STORAGE_KEY
const SERVER_URL_KEY = 'storylic_server_url'

const DEFAULT_SERVER_URL = (import.meta.env.VITE_SERVER_URL as string) ?? ''

const loadServerUrl = (): string => {
  try {
    return localStorage.getItem(SERVER_URL_KEY) || DEFAULT_SERVER_URL
  } catch {
    return DEFAULT_SERVER_URL
  }
}

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

// Anexado só uma vez, mesmo que o socket seja reconstruído (troca de servidor).
let connectivityWatchersAttached = false

export const useSocketStore = defineStore('socket', () => {
  const storeGlobal = useGlobalStore()
  const storeSettings = useSettingStore()
  const storeCards = useCardsStore()
  const storeTimer = useTimerStore()

  const serverUrl = ref(loadServerUrl())
  const socket = ref<Socket | null>(null)
  const gameId = ref('')
  const isConnected = ref(false)
  const room = ref<Player[]>([])
  const currentPlayerNumber = ref('')
  const mySocketId = ref('')
  const isReconnecting = ref(false)

  // Fase de conexão — usada para a UX de cold start do Render ("acordando o
  // servidor…") e para saber se a queda é de rede ou do servidor.
  const connectAttempts = ref(0)
  const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
  const isDefaultServer = computed(() => serverUrl.value === DEFAULT_SERVER_URL)
  const connectionPhase = computed<'online' | 'offline' | 'waking' | 'connecting'>(() => {
    if (isConnected.value) return 'online'
    if (!isOnline.value) return 'offline'
    if (connectAttempts.value >= 2) return 'waking'
    return 'connecting'
  })

  const justJoined = ref(false)
  const pendingPlayerName = ref('')
  const selectedCards = ref<Card[]>([])

  const navigate = (state: GameState) => {
    storeSettings.gameState = state
    navigateTo(state)
  }

  const activeSession = computed<{ gameId: string; token: string } | null>(() => {
    try {
      const raw = sessionStorage.getItem(SocketEvents.STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const myPlayerNumber = computed(() => mySocketId.value)
  const myPlayerName = computed(() => room.value.find(({ id }) => id === mySocketId.value)?.name)
  const currentPlayerName = computed(
    () => room.value.find(({ id }) => id === currentPlayerNumber.value)?.name,
  )
  const currentCards = computed(() => selectedCards.value)

  const connectToServer = () => {
    storeSettings.setNavigateCallback(navigate)
    storeSettings.setTurnAutoFinishedCallback(() => {
      emitSelectedCards()
    })

    socket.value = io(serverUrl.value, {
      // Cold start do tier free do Render pode demorar. Falha rápido cada
      // tentativa e tenta de novo indefinidamente até o servidor "acordar".
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 4000,
      timeout: 8000,
    })

    // Ao voltar o foco/rede, força uma reconexão imediata em vez de esperar o
    // backoff — crucial no mobile, onde a aba é congelada em segundo plano.
    if (!connectivityWatchersAttached && typeof window !== 'undefined') {
      connectivityWatchersAttached = true
      window.addEventListener('online', () => {
        isOnline.value = true
        resyncConnection()
      })
      window.addEventListener('offline', () => {
        isOnline.value = false
      })
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          isOnline.value = typeof navigator === 'undefined' ? true : navigator.onLine
          resyncConnection()
        }
      })
    }

    /** Listeners */

    // Cada tentativa falha incrementa o contador → alimenta a UX "acordando…".
    socket.value.on('connect_error', () => {
      connectAttempts.value += 1
    })

    socket.value.on(SocketEvents.ON_CONNECT, () => {
      mySocketId.value = socket.value?.id ?? ''
      isConnected.value = true
      connectAttempts.value = 0

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

        navigate(isCreator ? SocketEvents.STATE_CONFIG : SocketEvents.STATE_LOBBY)
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

        if (data.timerTurn) storeTimer.baseTimerTurn = data.timerTurn
        if (data.timerStory) storeTimer.baseTimerStory = data.timerStory

        storeGlobal.openNotification({
          title: 'Reconectado!',
          message: 'Você voltou para a partida.',
          type: 'success',
          duration: 3000,
        })

        switch (data.gameState) {
          case SocketEvents.STATE_LOBBY:
            navigate(SocketEvents.STATE_LOBBY)
            break
          case SocketEvents.STATE_PLAYING:
            if (data.isMyTurn) {
              storeTimer.restoreTimer(Math.round(data.remainingTurnMs / 1000))
              storeSettings.startGame()
              navigateTo(SocketEvents.STATE_PLAYING)
            } else {
              storeTimer.resetTimers()
              navigate(SocketEvents.STATE_WAITING)
            }
            break
          case SocketEvents.STATE_STORYTELLING:
            if (data.isMyTurn) {
              storeTimer.restoreStoryTimer(Math.round(data.remainingTurnMs / 1000))
              navigate(SocketEvents.STATE_STORYTELLING)
            } else {
              navigate(SocketEvents.STATE_WAITING)
            }
            break
          case SocketEvents.STATE_WAITING:
            storeTimer.resetTimers()
            navigate(SocketEvents.STATE_WAITING)
            break
          case SocketEvents.STATE_ENDED:
            clearSession()
            navigate(SocketEvents.STATE_ENDED)
            break
          default:
            clearSession()
            navigate(SocketEvents.STATE_SETUP)
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
      navigate(SocketEvents.STATE_SETUP)
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
        navigate(SocketEvents.STATE_PLAYING)
      } else {
        storeTimer.resetTimers()
        navigate(SocketEvents.STATE_WAITING)
      }
    })

    socket.value.on(SocketEvents.ON_GAME_ENDED, () => {
      storeSettings.softResetGame()
      navigate(SocketEvents.STATE_ENDED)
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
          if (timerTurn) storeTimer.baseTimerTurn = timerTurn
          if (timerStory) storeTimer.baseTimerStory = timerStory
          if (turns) storeSettings.turnMax = turns
          storeSettings.softResetGame()

          if (creatorId && creatorId === mySocketId.value) {
            navigate(SocketEvents.STATE_CONFIG)
          } else {
            navigate(SocketEvents.STATE_LOBBY)
          }
        } else {
          clearSession()
          storeSettings.resetGame()
          navigate(SocketEvents.STATE_ROOMS)
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
        storeTimer.baseTimerTurn = timerTurn
        storeTimer.baseTimerStory = timerStory
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
      selectedCards.value = cards
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
      turnDurationMs: storeTimer.baseTimerTurn * 1000,
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
    const targetGameId = gameId.value

    const send = () =>
      socket.value?.emit(SocketEvents.EMIT_FINISH_STORYTELLING, {
        gameId: targetGameId,
        currentPlayer: mySocketId.value,
      })

    send()

    // Reenvio se o servidor não confirmar (um blip de Wi-Fi pode engolir o emit).
    // Enquanto ainda formos o jogador da vez, tenta de novo até 3x. Assim que o
    // servidor avança o turno, `currentPlayerNumber` muda e paramos.
    let retries = 0
    const retry = () => {
      if (retries >= 3) return
      if (currentPlayerNumber.value !== mySocketId.value) return
      if (!socket.value?.connected) {
        setTimeout(retry, 2000)
        return
      }
      retries += 1
      send()
      setTimeout(retry, 2000)
    }
    setTimeout(retry, 2000)
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
    navigate(SocketEvents.STATE_SETUP)
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

  // Força reconexão imediata (foco/rede de volta). O handler de `connect` cuida
  // do rejoin automático da sessão salva.
  const resyncConnection = () => {
    if (!socket.value) return
    if (!socket.value.connected) socket.value.connect()
  }

  // Alterna o endereço do servidor em runtime (nuvem ↔ local/LAN) sem rebuild.
  // Vazio volta ao padrão (VITE_SERVER_URL).
  const setServerUrl = (url: string) => {
    const clean = url.trim()
    try {
      if (clean && clean !== DEFAULT_SERVER_URL) localStorage.setItem(SERVER_URL_KEY, clean)
      else localStorage.removeItem(SERVER_URL_KEY)
    } catch {
      /* localStorage indisponível — segue só em memória */
    }

    serverUrl.value = clean || DEFAULT_SERVER_URL

    isConnected.value = false
    connectAttempts.value = 0

    if (socket.value) {
      socket.value.removeAllListeners()
      socket.value.disconnect()
      socket.value = null
    }

    connectToServer()
  }

  return {
    socket,
    serverUrl,
    gameId,
    isConnected,
    isReconnecting,
    isOnline,
    isDefaultServer,
    connectionPhase,
    room,
    activeSession,
    currentPlayerNumber,
    myPlayerNumber,
    myPlayerName,
    currentPlayerName,
    currentCards,
    connectToServer,
    navigate,
    triggerRejoin,
    resyncConnection,
    setServerUrl,
    emitJoinGame,
    emitConfigGame,
    emitStartGame,
    emitSelectedCards,
    emitFinishStoryAndNext,
    emitResetGame,
    emitLeaveGame,
  }
})
