import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { io, type Socket } from 'socket.io-client'

import { useGlobalStore } from '@/stores/global'
import { useSettingStore } from '@/stores/settings'
import { useCardsStore } from '@/stores/cards'
import { useTimerStore } from '@/stores/timer'

import { navigateTo } from '@/composables/useNavigator'
import { SocketEvents } from '@/constants/socketEvents'
import type { Card, GameState, Player, RoomSnapshot, StoredSession } from '@/types'

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

// True either when the player manually switched away from the default server
// (same signal `isDefaultServer` uses — a cloud-hosted page pointed at a LAN
// IP via ServerSwitcher) OR when this build's own default server shares an
// origin with the page itself (the `PUBLIC_DIR` deployment: storylic-api
// serves the frontend from the same origin it listens on, so no runtime
// switch ever happens — the LAN URL is already the baked-in default).
// Exposed standalone for callers that run before the store exists (e.g.
// `main.ts` deciding whether to load GTM, which the LAN build's strict CSP
// would otherwise block with a console error).
export const isLanMode = (): boolean => {
  if (loadServerUrl() !== DEFAULT_SERVER_URL) return true

  try {
    return new URL(DEFAULT_SERVER_URL).origin === window.location.origin
  } catch {
    return false
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

// Attached only once, even if the socket is rebuilt (server switch).
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
  // Room owner (whoever created it) — comes from the server via
  // `join-ack`/`rejoin-ack` and never changes on reconnect or "play again"
  // (see `Game.owner` in the API).
  const isOwner = ref(false)

  // Connection phase — drives the cold-start UX for Render ("waking the
  // server up…") and tells apart a network drop from a server outage.
  const connectAttempts = ref(0)
  // Render's cold start usually resolves within ~1min. Past that point (~13
  // attempts, given the 800ms→4s backoff), a persistent error (server down,
  // misconfigured CORS) is more likely than a cold start — the UX stops
  // pretending it'll wake up any second and offers a way out.
  const STUCK_THRESHOLD = 13
  const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
  const isDefaultServer = computed(() => serverUrl.value === DEFAULT_SERVER_URL)
  const connectionPhase = computed<'online' | 'offline' | 'waking' | 'connecting' | 'stuck'>(
    () => {
      if (isConnected.value) return 'online'
      if (!isOnline.value) return 'offline'
      if (connectAttempts.value >= STUCK_THRESHOLD) return 'stuck'
      if (connectAttempts.value >= 2) return 'waking'
      return 'connecting'
    },
  )

  const justJoined = ref(false)
  const pendingPlayerName = ref('')
  const selectedCards = ref<Card[]>([])
  const rooms = ref<RoomSnapshot[]>([])

  const navigate = (state: GameState) => {
    storeSettings.gameState = state
    navigateTo(state)
  }

  const activeSession = computed<StoredSession | null>(() => loadSession())
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
      // Render's free tier cold start can take a while. Fail fast on each
      // attempt and keep retrying indefinitely until the server "wakes up".
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 4000,
      timeout: 8000,
    })

    // When focus/network comes back, force an immediate reconnect instead of
    // waiting for the backoff — crucial on mobile, where the tab freezes in
    // the background.
    if (!connectivityWatchersAttached && typeof window !== 'undefined') {
      connectivityWatchersAttached = true
      window.addEventListener('online', () => {
        isOnline.value = true
        resyncConnection()
        storeTimer.syncFromDeadline()
      })
      window.addEventListener('offline', () => {
        isOnline.value = false
      })
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          isOnline.value = typeof navigator === 'undefined' ? true : navigator.onLine
          resyncConnection()
          // Recompute the timer: ticks were frozen while in the background.
          storeTimer.syncFromDeadline()
        }
      })
    }

    /** Listeners */

    // Each failed attempt bumps the counter → feeds the "waking up…" UX.
    socket.value.on(SocketEvents.ON_CONNECT_ERROR, () => {
      connectAttempts.value += 1
    })

    socket.value.on(SocketEvents.ON_ROOMS_UPDATED, (data: RoomSnapshot[]) => {
      rooms.value = data
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
        isOwner.value = isCreator

        // ConfigView only shows up on room creation — after that, the owner
        // adjusts settings via the manage panel (shared with player removal).
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
        isOwner: boolean
        remainingTurnMs: number
        newToken: string
        timerTurn: number
        timerStory: number
      }) => {
        isReconnecting.value = false
        isOwner.value = data.isOwner

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
              // `startGame()` already resets the timers to full duration —
              // reconnecting mid-turn under stress shouldn't hand back a
              // clock that's nearly out (the server also re-arms its own
              // watchdog, see the API).
              storeSettings.startGame()
              navigateTo(SocketEvents.STATE_PLAYING)
            } else {
              storeTimer.resetTimers()
              navigate(SocketEvents.STATE_WAITING)
            }
            break
          // keep: the server today only ever emits gameState lobby|playing|ended
          // (the cards/storytelling sub-phase within a turn is client-local) —
          // these two cases are defensive, in case a future API version starts
          // distinguishing the current sub-phase on rejoin.
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
        timerTurn,
        timerStory,
        turns,
      }: {
        reason?: string
        timerTurn?: number
        timerStory?: number
        turns?: number
      } = {}) => {
        if (reason === 'new-game') {
          if (timerTurn) storeTimer.baseTimerTurn = timerTurn
          if (timerStory) storeTimer.baseTimerStory = timerStory
          if (turns) storeSettings.turnMax = turns
          storeSettings.softResetGame()

          // ConfigView is only for room creation — "play again" always goes
          // back to the lobby; the owner changes settings later via the
          // manage panel.
          navigate(SocketEvents.STATE_LOBBY)
        } else {
          clearSession()
          storeSettings.resetGame()
          navigate(SocketEvents.STATE_ROOMS)
        }
      },
    )

    socket.value.on(SocketEvents.ON_KICKED, ({ reason }: { reason: string }) => {
      clearSession()
      storeSettings.numPlayers = 0
      justJoined.value = false
      gameId.value = ''
      isOwner.value = false
      navigate(SocketEvents.STATE_SETUP)
      storeGlobal.openNotification({
        title: 'Você foi removido da sala',
        message: reason,
        type: 'error',
        duration: 6000,
      })
    })

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

    socket.value.on(SocketEvents.ON_PLAYER_SELECTED_CARDS, ({ cards }) => {
      selectedCards.value = cards
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
    socket.value?.emit(SocketEvents.EMIT_START_GAME, { gameId: gameId.value })
  }

  const emitGetRooms = () => {
    socket.value?.emit(SocketEvents.EMIT_GET_ROOMS)
  }

  const emitSelectedCards = () => {
    const targetGameId = gameId.value

    const send = () =>
      socket.value?.emit(SocketEvents.EMIT_CARDS_SELECTED, {
        gameId: targetGameId,
        cards: storeCards.selectedCards,
        playerNumber: mySocketId.value,
      })

    send()

    // Revealing the hand has no ack; a Wi-Fi blip could swallow the emit and
    // leave the other players without seeing the cards. Resend while we're
    // still the current player (the server only accepts it from them), up
    // to 2x.
    let retries = 0
    const retry = () => {
      if (retries >= 2) return
      if (currentPlayerNumber.value !== mySocketId.value) return
      retries += 1
      if (socket.value?.connected) send()
      setTimeout(retry, 1800)
    }
    setTimeout(retry, 1800)
  }

  const emitFinishStoryAndNext = () => {
    const targetGameId = gameId.value

    const send = () =>
      socket.value?.emit(SocketEvents.EMIT_FINISH_STORYTELLING, { gameId: targetGameId })

    send()

    // Resend if the server doesn't ack (a Wi-Fi blip could swallow the emit).
    // While we're still the current player, retry up to 3x. Once the server
    // advances the turn, `currentPlayerNumber` changes and we stop.
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

  const emitKickPlayer = (targetPlayerId: string) => {
    socket.value?.emit(SocketEvents.EMIT_KICK_PLAYER, {
      gameId: gameId.value,
      targetPlayerId,
    })
  }

  const emitLeaveGame = () => {
    const leavingGameId = gameId.value
    clearSession()
    navigate(SocketEvents.STATE_SETUP)
    storeSettings.numPlayers = 0
    justJoined.value = false
    isOwner.value = false
    socket.value?.emit(SocketEvents.EMIT_LEAVE_GAME, { gameId: leavingGameId })
    gameId.value = ''
  }

  const triggerRejoin = (targetGameId: string, token: string) => {
    gameId.value = targetGameId
    isReconnecting.value = true
    socket.value?.emit(SocketEvents.EMIT_REJOIN_GAME, { gameId: targetGameId, token })
  }

  // Forces an immediate reconnect (focus/network back). The `connect`
  // handler takes care of auto-rejoining the saved session.
  const resyncConnection = () => {
    if (!socket.value) return
    if (!socket.value.connected) socket.value.connect()
  }

  // Switches the server address at runtime (cloud ↔ local/LAN) with no
  // rebuild. Empty reverts to the default (VITE_SERVER_URL).
  const setServerUrl = (url: string) => {
    const clean = url.trim()
    try {
      if (clean && clean !== DEFAULT_SERVER_URL) localStorage.setItem(SERVER_URL_KEY, clean)
      else localStorage.removeItem(SERVER_URL_KEY)
    } catch {
      /* localStorage unavailable — carries on in-memory only */
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
    isOwner,
    isOnline,
    isDefaultServer,
    connectionPhase,
    room,
    rooms,
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
    emitGetRooms,
    emitConfigGame,
    emitStartGame,
    emitSelectedCards,
    emitFinishStoryAndNext,
    emitResetGame,
    emitLeaveGame,
    emitKickPlayer,
  }
})
