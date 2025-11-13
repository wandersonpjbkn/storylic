import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import colors from '@/data/colors.json'

import { useCardsStore } from '@/stores/cards'

type Category = 'actions' | 'animals' | 'emotions' | 'nature' | 'objects' | 'personas' | 'places'

export const useSettingStore = defineStore('settings', () => {
  // global
  const storeCard = useCardsStore()

  // state

  /** base */
  const gameState = ref('setup')
  const numPlayers = ref(3)
  const baseTimerTurn = ref(30)
  const baseTimerStory = ref(45)
  const categoriesColors = ref(colors)

  /** player */
  const playerName = ref('')

  /** turn */
  const turnCurrent = ref(1)
  const turnMax = ref(3)

  /** timers */
  const timerTurn = ref(baseTimerTurn.value)
  const timerStory = ref(baseTimerStory.value)
  const timerTurnInterval = ref<number | null>(null)
  const timerStoryInterval = ref<number | null>(null)
  const isTurnRunning = ref(false)
  const isStoryRunning = ref(false)

  // getters
  const timerThreshold = computed(() => {
    return Math.floor(baseTimerTurn.value * 0.5)
  })
  const storyTimerThreshold = computed(() => {
    return Math.floor(baseTimerStory.value * 0.5)
  })

  // actions

  /** style */
  const getCategoryColor = (category: Category) => {
    if (Object.prototype.hasOwnProperty.call(categoriesColors.value, category)) {
      return categoriesColors.value[category as Category]
    }

    return 'from-gray-500 to-gray-700'
  }

  /** timers */
  const stopTimerTurn = () => {
    isTurnRunning.value = false

    if (timerTurnInterval.value) {
      clearInterval(timerTurnInterval.value)
      timerTurnInterval.value = null
    }
  }
  const startTimerTurn = () => {
    isTurnRunning.value = true

    timerTurnInterval.value = setInterval(() => {
      if (timerTurn.value > 0) {
        timerTurn.value -= 1
      } else {
        stopTimerTurn()

        if (!storeCard.canConfirm) {
          storeCard.selectedCards = storeCard.displayedCards
        }

        if (gameState.value === 'playing') {
          gameState.value = 'storytelling'
        }
      }
    }, 1000)
  }
  const stopTimerStory = () => {
    isStoryRunning.value = false

    if (timerStoryInterval.value) {
      clearInterval(timerStoryInterval.value)
      timerStoryInterval.value = null
    }
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

  /** turns */
  const finishTurn = () => {
    stopTimerTurn()
    startTimerStory()

    if (!storeCard.canConfirm) {
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

  /** start */
  const startGame = () => {
    gameState.value = 'playing'

    storeCard.dealCards()

    timerTurn.value = baseTimerTurn.value
    timerStory.value = baseTimerStory.value

    startTimerTurn()
  }
  const resetGame = () => {
    stopTimerTurn()
    storeCard.initializeDeck()

    gameState.value = 'lobby'
    turnCurrent.value = 1
    timerTurn.value = baseTimerTurn.value
    timerStory.value = baseTimerStory.value

    // store
    storeCard.selectedCards = []
    storeCard.displayedCards = []
  }

  return {
    // state

    /** base */
    gameState,
    numPlayers,
    baseTimerTurn,
    baseTimerStory,

    /** player */
    playerName,

    /** turn */
    turnCurrent,
    turnMax,

    /** timers */
    timerTurn,
    timerStory,
    isTurnRunning,
    isStoryRunning,

    // getters
    timerThreshold,
    storyTimerThreshold,

    // actions

    /** style */
    getCategoryColor,

    /** timers */
    stopTimerTurn,
    stopTimerStory,

    /** turns */
    finishTurn,
    startPlayerTurn,

    /** start */
    startGame,
    resetGame,
  }
})
