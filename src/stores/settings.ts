import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { useCardsStore } from '@/stores/cards'

export const useSettingStore = defineStore('settings', () => {
  const storeCard = useCardsStore()

  const gameState = ref('setup')
  const numPlayers = ref(0)
  const baseTimerTurn = ref(25)
  const baseTimerStory = ref(45)

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
  let _onNavigate: ((state: string) => void) | null = null
  const setNavigateCallback = (fn: (state: string) => void) => {
    _onNavigate = fn
  }

  // Callback chamado quando o timer de turno zera automaticamente.
  let _onTurnAutoFinished: (() => void) | null = null
  const setTurnAutoFinishedCallback = (fn: () => void) => {
    _onTurnAutoFinished = fn
  }

  const timerThreshold = computed(() => Math.floor(baseTimerTurn.value * 0.5))
  const storyTimerThreshold = computed(() => Math.floor(baseTimerStory.value * 0.5))

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

  const restoreTimer = (remainingSeconds: number) => {
    stopTimerTurn()
    timerTurn.value = remainingSeconds > 0 ? remainingSeconds : 0
  }

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

  const startGame = () => {
    gameState.value = 'playing'
    storeCard.dealCards()
    timerStory.value = baseTimerStory.value
    startTimerTurn()
  }

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
    stopTimerTurn,
    stopTimerStory,
    setNavigateCallback,
    setTurnAutoFinishedCallback,
    resetTimers,
    restoreTimer,
    restoreStoryTimer,
    finishTurn,
    startGame,
    softResetGame,
    resetGame,
  }
})
