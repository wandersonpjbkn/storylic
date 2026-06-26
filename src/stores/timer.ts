import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTimerStore = defineStore('timer', () => {
  const baseTimerTurn = ref(25)
  const baseTimerStory = ref(45)

  const timerTurn = ref(baseTimerTurn.value)
  const timerStory = ref(baseTimerStory.value)

  const timerTurnInterval = ref<number | null>(null)
  const timerStoryInterval = ref<number | null>(null)

  const isTurnRunning = ref(false)
  const isStoryRunning = ref(false)

  const timerThreshold = computed(() => Math.floor(baseTimerTurn.value * 0.5))
  const storyTimerThreshold = computed(() => Math.floor(baseTimerStory.value * 0.5))

  // Injected by game store — fires when turn timer reaches zero
  let _onTurnExpired: (() => void) | null = null
  const onTurnExpired = (fn: () => void) => {
    _onTurnExpired = fn
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
        stopTimerTurn()
        _onTurnExpired?.() // game store decides what to do
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
    timerTurn.value = Math.max(0, remainingSeconds)
  }

  const restoreStoryTimer = (remainingSeconds: number) => {
    stopTimerStory()
    timerStory.value = Math.max(0, remainingSeconds)
    if (timerStory.value > 0) startTimerStory()
  }

  return {
    baseTimerTurn,
    baseTimerStory,
    timerTurn,
    timerStory,
    isTurnRunning,
    isStoryRunning,
    timerThreshold,
    storyTimerThreshold,
    onTurnExpired,
    startTimerTurn,
    stopTimerTurn,
    startTimerStory,
    stopTimerStory,
    resetTimers,
    restoreTimer,
    restoreStoryTimer,
  }
})
