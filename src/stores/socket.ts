import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { io, type Socket } from 'socket.io-client'

import { useGlobalStore } from '@/stores/global'
import { useSettingStore } from '@/stores/settings'
import { useCardsStore } from '@/stores/cards'
import { navigateTo } from '@/composables/useNavigator'

interface Player {
  id: string
  name: string
}

const SESSION_KEY = 'storylic_session'

interface StoredSession {
  token: string
  gameId: string
  playerName?: string
}

const saveSession = (token: string, gameId: string, playerName?: string) => {
  const existing = loadSession()
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    token,
    gameId,
    // Bug 8 fix: preserva o nome existente se não for passado um novo
    playerName: playerName ?? existing?.playerName ?? '',
  }))
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

  // Bug A fix: suprime o toast do primeiro game-state após join-game.
  // Sem isso, numPlayers ainda tem o valor da sala anterior, causando
  // "um jogador saiu" ao entrar numa sala menor.
  const justJoined = ref(false)


  // Seta gameState e navega de forma síncrona — sem depender de watch.
  // navigateTo chama router.push diretamente após o estado já ter sido salvo.
  const goTo = (state: string) => {
    storeSettings.gameState = state
    navigateTo(state)
  }

  const myPlayerNumber = computed(() => mySocketId.value)
  const myPlayerName = computed(() => room.value.find(({ id }) => id === mySocketId.value)?.name)
  const currentPlayerName = computed(() => room.value.find(({ id }) => id === currentPlayerNumber.value)?.name)

  const connectToServer = () => {
    // Injeta o callback de navegação no settings store para que o timer
    // interno (setInterval) possa navegar quando o tempo esgota
    storeSettings.setNavigateCallback(goTo)

    // Injeta o callback de conclusão automática de turno — chamado quando
    // o timer zera sem o jogador clicar em "Confirmar". Emite emitSelectedCards
    // sem que o settings.ts precise importar o socket store.
    storeSettings.setTurnAutoFinishedCallback(() => {
      emitSelectedCards()
    })

    socket.value = io(serverUrl.value)

    socket.value.on('connect', () => {
      mySocketId.value = socket.value?.id ?? ''
      isConnected.value = true

      const session = loadSession()
      if (session) {
        isReconnecting.value = true
        socket.value?.emit('rejoin-game', { gameId: session.gameId, token: session.token })
      } else {
        storeGlobal.openNotification({
          title: 'Conectado',
          message: 'Conectado ao servidor!',
          type: 'success',
          duration: 2000,
        })
      }
    })

    socket.value.on('disconnect', () => {
      storeGlobal.openNotification({
        title: 'Desconectado',
        message: 'Conexão perdida. Tentando reconectar...',
        type: 'error',
      })
      isConnected.value = false
      mySocketId.value = ''
    })

    socket.value.on('join-ack', ({ token, gameId: gId }: { token: string; gameId: string }) => {
      // Bug 8 fix: salva o nome do jogador junto com o token
      // O nome é buscado do room[] que acabou de ser atualizado pelo game-state
      const myName = room.value.find((p) => p.id === mySocketId.value)?.name ?? ''
      saveSession(token, gId, myName)
    })

    socket.value.on('rejoin-ack', (data: {
      gameState: string
      currentPlayer: string
      currentTurn: number
      turns: number
      players: Player[]
      isMyTurn: boolean
      remainingTurnMs: number
      newToken: string
    }) => {
      isReconnecting.value = false

      const session = loadSession()
      if (session) {
        // Bug 8 fix: preserva o playerName ao rotacionar o token
        saveSession(data.newToken, session.gameId, session.playerName)
        gameId.value = session.gameId
      }

      room.value = data.players
      currentPlayerNumber.value = data.currentPlayer
      storeSettings.turnCurrent = data.currentTurn
      storeSettings.turnMax = data.turns

      storeGlobal.openNotification({
        title: 'Reconectado!',
        message: 'Você voltou para a partida.',
        type: 'success',
        duration: 3000,
      })

      switch (data.gameState) {
        case 'lobby':
          goTo('lobby')
          break
        case 'playing':
          if (data.isMyTurn) {
            // Bug 6 fix: restoreTimer ANTES de startGame — startGame não reseta mais
            // o timer (correção no settings.ts). navigateTo chama apenas o router,
            // sem setar gameState novamente (startGame já fez isso).
            storeSettings.restoreTimer(Math.round(data.remainingTurnMs / 1000))
            storeSettings.startGame()
            navigateTo('playing')
          } else {
            storeSettings.resetTimers()
            goTo('waiting')
          }
          break
        case 'storytelling':
          if (data.isMyTurn) {
            storeSettings.restoreStoryTimer(Math.round(data.remainingTurnMs / 1000))
            goTo('storytelling')
          } else {
            goTo('waiting')
          }
          break
        case 'waiting':
          storeSettings.resetTimers()
          goTo('waiting')
          break
        case 'ended':
          clearSession()
          goTo('ended')
          break
        default:
          clearSession()
          goTo('setup')
          break
      }
    })

    socket.value.on('rejoin-error', ({ reason }: { reason: string }) => {
      isReconnecting.value = false
      clearSession()
      storeGlobal.openNotification({
        title: 'Não foi possível reconectar',
        message: reason,
        type: 'warning',
        duration: 5000,
      })
      goTo('setup')
    })

    socket.value.on('game-state', ({ currentPlayer, players }) => {
      // Bug A fix: no primeiro game-state após join-game, apenas atualiza o
      // estado silenciosamente — não exibe toast, pois numPlayers ainda
      // reflete a sala anterior e a comparação seria inválida.
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

      if (storeSettings.gameState === 'lobby') {
        storeGlobal.openNotification({
          title: 'Sala atualizada',
          message: wasSmaller ? 'Novo jogador na sala' : 'Um jogador saiu',
          type: wasSmaller ? 'info' : 'warning',
        })
      }
    })

    socket.value.on('player-turn', (data) => {
      storeSettings.turnCurrent = data.currentTurn
      currentPlayerNumber.value = data.currentPlayer

      if (data.currentPlayer === mySocketId.value) {
        storeSettings.startGame()
        goTo('playing')
      } else {
        storeSettings.resetTimers()
        goTo('waiting')
      }
    })

    socket.value.on('game-ended', () => {
      // Não limpa sessão — o jogador permanece na sala para jogar novamente
      storeSettings.softResetGame()
      goTo('ended')
    })

    socket.value.on('game-reset', ({ reason }: { reason?: string } = {}) => {
      if (reason === 'new-game') {
        // Nova partida na mesma sala: mantém sessão, volta para o lobby
        storeSettings.softResetGame()
        goTo('lobby')
      } else {
        // Sala encerrada (todos saíram): limpa tudo e vai para rooms
        clearSession()
        storeSettings.resetGame()
        goTo('rooms')
      }
    })

    socket.value.on('player-selected-cards', ({ cards, playerNumber }) => {
      console.log('Jogador', playerNumber, 'escolheu:', cards)
    })

    socket.value.on('player-disconnected', ({ playerName, reservedFor }: {
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
    })

    socket.value.on('player-reconnected', ({ playerName, players }: {
      playerId: string
      playerName: string
      players: Player[]
    }) => {
      room.value = players
      storeGlobal.openNotification({
        title: `${playerName} voltou!`,
        message: 'O jogador reconectou à partida.',
        type: 'success',
        duration: 3000,
      })
    })
  }

  const emitJoinGame = () => {
    if (!gameId.value || !storeSettings.playerName) {
      let message = ''
      if (!gameId.value && !storeSettings.playerName) message = 'ID da sala e nome de jogador'
      else if (!gameId.value) message = 'ID da sala'
      else message = 'nome de jogador'
      storeGlobal.openNotification({ message: `Por favor, preencha ${message}` })
      return
    }

    // Bug A fix: marca que o próximo game-state é o primeiro desta sala —
    // deve ser absorvido silenciosamente sem comparar com numPlayers anterior.
    justJoined.value = true
    storeSettings.numPlayers = 0

    socket.value?.emit('join-game', { gameId: gameId.value, playerName: storeSettings.playerName })
    goTo('lobby')
    storeSettings.playerName = ''
  }

  const emitStartGame = () => {
    socket.value?.emit('start-game', {
      gameId: gameId.value,
      currentPlayer: mySocketId.value,
      numPlayers: storeSettings.numPlayers,
      turns: storeSettings.turnMax,
      turnDurationMs: storeSettings.baseTimerTurn * 1000,
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
    socket.value?.emit('reset-game', { gameId: gameId.value })
  }

  const emitLeaveGame = () => {
    // Bug B fix: emite leave-game com o gameId ANTES de zerá-lo,
    // garantindo que o backend receba o ID correto da sala que está saindo.
    // Antes, gameId era zerado antes do emit, chegando vazio no servidor.
    const leavingGameId = gameId.value
    clearSession()
    goTo('setup')
    storeSettings.numPlayers = 0
    justJoined.value = false
    socket.value?.emit('leave-game', { gameId: leavingGameId, playerNumber: mySocketId.value })
    gameId.value = ''
  }


  // Bug 2+3 fix: dispara rejoin-game diretamente com o token da sessão.
  // Usado pelo SetupView no modo retorno — evita criar entrada duplicada
  // via join-game e garante navegação correta via rejoin-ack.
  const triggerRejoin = (targetGameId: string, token: string) => {
    gameId.value = targetGameId
    isReconnecting.value = true
    socket.value?.emit('rejoin-game', { gameId: targetGameId, token })
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
    emitStartGame,
    emitSelectedCards,
    emitFinishStoryAndNext,
    emitResetGame,
    emitLeaveGame,
  }
})
