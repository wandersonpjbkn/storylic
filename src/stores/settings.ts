import { ref } from 'vue'
import { defineStore } from 'pinia'

import { useCardsStore } from '@/stores/cards'
import { useTimerStore } from '@/stores/timer'
import { SocketEvents } from '@/constants/socketEvents'
import type { GameState } from '@/types'

export const useSettingStore = defineStore('settings', () => {
  const storeCards = useCardsStore()
  const storeTimer = useTimerStore()

  const gameState = ref<GameState>(SocketEvents.STATE_SETUP)
  const numPlayers = ref(0)
  const playerName = ref('')
  const turnCurrent = ref(1)
  const turnMax = ref(3)

  // Injected by socket store to avoid circular import
  let _onNavigate: ((state: GameState) => void) | null = null
  const setNavigateCallback = (fn: (state: GameState) => void) => {
    _onNavigate = fn
  }

  let _onTurnAutoFinished: (() => void) | null = null
  const setTurnAutoFinishedCallback = (fn: () => void) => {
    _onTurnAutoFinished = fn
  }

  const finishTurn = () => {
    storeTimer.stopTimerTurn()
    storeTimer.startTimerStory()
    if (!storeCards.canConfirm) {
      storeCards.dealCards()
      storeCards.selectedCards = storeCards.displayedCards
    }
    gameState.value = SocketEvents.STATE_STORYTELLING
  }

  // Wire timer expiry into game logic — timer store stays decoupled
  storeTimer.onTurnExpired(() => {
    finishTurn()
    _onTurnAutoFinished?.()
    _onNavigate?.(SocketEvents.STATE_STORYTELLING)
  })

  const startGame = () => {
    gameState.value = SocketEvents.STATE_PLAYING
    storeCards.dealCards()
    storeTimer.resetTimers()
    storeTimer.startTimerTurn()
  }

  const softResetGame = () => {
    storeTimer.resetTimers()
    storeCards.initializeDeck()
    storeCards.selectedCards = []
    storeCards.displayedCards = []
    gameState.value = SocketEvents.STATE_LOBBY
    turnCurrent.value = 1
  }

  const resetGame = () => {
    storeTimer.resetTimers()
    storeCards.initializeDeck()
    storeCards.selectedCards = []
    storeCards.displayedCards = []
    gameState.value = SocketEvents.STATE_SETUP
    turnCurrent.value = 1
  }

  return {
    gameState,
    numPlayers,
    playerName,
    turnCurrent,
    turnMax,
    setNavigateCallback,
    setTurnAutoFinishedCallback,
    finishTurn,
    startGame,
    softResetGame,
    resetGame,
  }
})
