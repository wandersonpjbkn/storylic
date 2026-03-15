import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import colors from '@/data/colors.json'

import { useCardsStore } from '@/stores/cards'

type Category = 'actions' | 'animals' | 'emotions' | 'nature' | 'objects' | 'personas' | 'places'

export const useSettingStore = defineStore('settings', () => {
  const storeCard = useCardsStore()

  const gameState = ref('setup')
  const numPlayers = ref(0)
  const baseTimerTurn = ref(25)
  const baseTimerStory = ref(45)
  const categoriesColors = ref(colors)

  const playerName = ref('')
  const turnCurrent = ref(1)
  const turnMax = ref(3)

  const timerTurn = ref(baseTimerTurn.value)
  const timerStory = ref(baseTimerStory.value)
  const timerTurnInterval = ref<number | null>(null)
  const timerStoryInterval = ref<number | null>(null)
  const isTurnRunning = ref(false)
  const isStoryRunning = ref(false)

  // Callback de navegação injetado pelo socket store após inicialização.
  // Evita importar o navigator diretamente aqui (dependência circular).
  // Chamado quando o timer interno do setInterval precisa navegar.
  let _onNavigate: ((state: string) => void) | null = null
  const setNavigateCallback = (fn: (state: string) => void) => { _onNavigate = fn }

  // Callback chamado quando o timer de turno zera automaticamente.
  // Injetado pelo socket store para emitir emitSelectedCards sem dependência circular.
  let _onTurnAutoFinished: (() => void) | null = null
  const setTurnAutoFinishedCallback = (fn: () => void) => { _onTurnAutoFinished = fn }

  const timerThreshold = computed(() => Math.floor(baseTimerTurn.value * 0.5))
  const storyTimerThreshold = computed(() => Math.floor(baseTimerStory.value * 0.5))

  const getCategoryColor = (category: Category) => {
    if (Object.prototype.hasOwnProperty.call(categoriesColors.value, category)) {
      return categoriesColors.value[category as Category]
    }
    return 'from-gray-500 to-gray-700'
  }

  const stopTimerTurn = () => {
    isTurnRunning.value = false
    if (timerTurnInterval.value) {
      clearInterval(timerTurnInterval.value)
      timerTurnInterval.value = null
    }
  }

  const stopTimerStory = () => {
    isStoryRunning.value = false
    if (timerStoryInterval.value) {
      clearInterval(timerStoryInterval.value)
      timerStoryInterval.value = null
    }
  }

  const resetTimers = () => {
    stopTimerTurn()
    stopTimerStory()
    timerTurn.value = baseTimerTurn.value
    timerStory.value = baseTimerStory.value
  }

  const startTimerTurn = () => {
    isTurnRunning.value = true
    timerTurnInterval.value = setInterval(() => {
      if (timerTurn.value > 0) {
        timerTurn.value -= 1
      } else {
        // Timer esgotou: chama finishTurn() para iniciar o timerStory
        // e notifica o socket store via callback (sem importá-lo diretamente)
        finishTurn()
        _onTurnAutoFinished?.()
        _onNavigate?.('storytelling')
      }
    }, 1000)
  }

  const startTimerStory = () => {
    isStoryRunning.value = true
    timerStoryInterval.value = setInterval(() => {
      if (timerStory.value > 0) {
        timerStory.value -= 1
      } else {
        stopTimerStory()
      }
    }, 1000)
  }

  // Bug 6 fix: restaura o timer de turno com o tempo RESTANTE calculado pelo backend.
  // Chamado no rejoin-ack quando o jogador volta em /playing e é sua vez.
  const restoreTimer = (remainingSeconds: number) => {
    stopTimerTurn()
    timerTurn.value = remainingSeconds > 0 ? remainingSeconds : 0
  }

  // Bug 6 fix: restaura o timer de story com o tempo restante.
  // Chamado no rejoin-ack quando o jogador volta em /storytelling e era o narrador.
  const restoreStoryTimer = (remainingSeconds: number) => {
    stopTimerStory()
    timerStory.value = remainingSeconds > 0 ? remainingSeconds : 0
  }

  const finishTurn = () => {
    stopTimerTurn()
    startTimerStory()
    if (!storeCard.canConfirm) {
      storeCard.dealCards()
      storeCard.selectedCards = storeCard.displayedCards
    }
    gameState.value = 'storytelling'
  }

  const startPlayerTurn = () => {
    gameState.value = 'playing'
    storeCard.dealCards()
    timerTurn.value = baseTimerTurn.value
    timerStory.value = baseTimerStory.value
    startTimerTurn()
  }

  const startGame = () => {
    gameState.value = 'playing'
    storeCard.dealCards()
    // Bug 3 fix: NÃO reseta timerTurn aqui — se restoreTimer foi chamado antes,
    // o valor correto já está definido. startGame apenas inicia o intervalo.
    // timerStory sempre começa do zero (narração não havia começado ainda)
    timerStory.value = baseTimerStory.value
    startTimerTurn()
  }

  // softResetGame: reseta estado do jogo sem limpar sessão nem navegar para setup.
  // Usado quando o host inicia nova partida na mesma sala (game-reset com reason='new-game').
  // Jogadores mantêm token e gameId — já estão no lobby.
  const softResetGame = () => {
    stopTimerTurn()
    stopTimerStory()
    storeCard.initializeDeck()
    gameState.value = 'lobby'
    turnCurrent.value = 1
    timerTurn.value = baseTimerTurn.value
    timerStory.value = baseTimerStory.value
    storeCard.selectedCards = []
    storeCard.displayedCards = []
  }

  const resetGame = () => {
    stopTimerTurn()
    stopTimerStory()
    storeCard.initializeDeck()
    // Bug 2 fix: 'setup' em vez de 'lobby' — o jogador saiu da sala
    // A navegação para rooms/setup é feita pelo socket store via goTo
    gameState.value = 'setup'
    turnCurrent.value = 1
    timerTurn.value = baseTimerTurn.value
    timerStory.value = baseTimerStory.value
    storeCard.selectedCards = []
    storeCard.displayedCards = []
  }

  return {
    gameState,
    numPlayers,
    baseTimerTurn,
    baseTimerStory,
    playerName,
    turnCurrent,
    turnMax,
    timerTurn,
    timerStory,
    isTurnRunning,
    isStoryRunning,
    timerThreshold,
    storyTimerThreshold,
    getCategoryColor,
    stopTimerTurn,
    stopTimerStory,
    setNavigateCallback,
    setTurnAutoFinishedCallback,
    resetTimers,
    restoreTimer,
    restoreStoryTimer,
    finishTurn,
    startPlayerTurn,
    startGame,
    softResetGame,
    resetGame,
  }
})
