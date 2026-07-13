import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTimerStore = defineStore('timer', () => {
  const baseTimerTurn = ref(25)
  const baseTimerStory = ref(30)

  const timerTurn = ref(baseTimerTurn.value)
  const timerStory = ref(baseTimerStory.value)

  // Continuous 0–1 fraction of time remaining, recomputed every tick from raw
  // milliseconds (not rounded to whole seconds like timerTurn/timerStory) —
  // feeds TheTimer's progress bar so it moves in small, steady steps instead
  // of jumping once per second.
  const turnProgress = ref(1)
  const storyProgress = ref(1)

  const timerTurnInterval = ref<number | null>(null)
  const timerStoryInterval = ref<number | null>(null)

  // Absolute deadline (epoch ms) for each phase. Counting from a deadline —
  // instead of decrementing — makes the timer immune to setInterval freezing
  // when the tab goes to the background on mobile: on return, the next tick
  // recomputes the correct value straight from the clock.
  const turnDeadline = ref<number | null>(null)
  const storyDeadline = ref<number | null>(null)

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
    turnDeadline.value = null
    if (timerTurnInterval.value) {
      clearInterval(timerTurnInterval.value)
      timerTurnInterval.value = null
    }
  }

  const stopTimerStory = () => {
    isStoryRunning.value = false
    storyDeadline.value = null
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
    turnProgress.value = 1
    storyProgress.value = 1
  }

  const tickTurn = () => {
    if (turnDeadline.value === null) return
    const remainingMs = turnDeadline.value - Date.now()
    timerTurn.value = Math.max(0, Math.ceil(remainingMs / 1000))
    turnProgress.value = Math.max(0, Math.min(1, remainingMs / (baseTimerTurn.value * 1000)))
    if (timerTurn.value <= 0) {
      stopTimerTurn()
      _onTurnExpired?.() // game store decides what to do
    }
  }

  const tickStory = () => {
    if (storyDeadline.value === null) return
    const remainingMs = storyDeadline.value - Date.now()
    timerStory.value = Math.max(0, Math.ceil(remainingMs / 1000))
    storyProgress.value = Math.max(0, Math.min(1, remainingMs / (baseTimerStory.value * 1000)))
    if (timerStory.value <= 0) stopTimerStory()
  }

  const startTimerTurn = () => {
    isTurnRunning.value = true
    // Deadline derived from the current timerTurn value (respects a prior restore).
    turnDeadline.value = Date.now() + timerTurn.value * 1000
    if (timerTurnInterval.value) clearInterval(timerTurnInterval.value)
    // 250ms: recovers quickly on return from the background, no perceptible cost.
    timerTurnInterval.value = setInterval(tickTurn, 250)
  }

  const startTimerStory = () => {
    isStoryRunning.value = true
    storyDeadline.value = Date.now() + timerStory.value * 1000
    if (timerStoryInterval.value) clearInterval(timerStoryInterval.value)
    timerStoryInterval.value = setInterval(tickStory, 250)
  }

  const restoreTimer = (remainingSeconds: number) => {
    stopTimerTurn()
    timerTurn.value = Math.max(0, remainingSeconds)
    turnProgress.value = Math.max(0, Math.min(1, timerTurn.value / baseTimerTurn.value))
  }

  const restoreStoryTimer = (remainingSeconds: number) => {
    stopTimerStory()
    timerStory.value = Math.max(0, remainingSeconds)
    storyProgress.value = Math.max(0, Math.min(1, timerStory.value / baseTimerStory.value))
    if (timerStory.value > 0) startTimerStory()
  }

  // Immediately recomputes any running timers from their deadline. Called
  // when focus/network comes back, once background ticks have fallen behind.
  // No effect if nothing is running.
  const syncFromDeadline = () => {
    if (isTurnRunning.value) tickTurn()
    if (isStoryRunning.value) tickStory()
  }

  return {
    baseTimerTurn,
    baseTimerStory,
    timerTurn,
    timerStory,
    turnProgress,
    storyProgress,
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
    syncFromDeadline,
  }
})
