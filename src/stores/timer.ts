import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTimerStore = defineStore('timer', () => {
  const baseTimerTurn = ref(25)
  const baseTimerStory = ref(45)

  const timerTurn = ref(baseTimerTurn.value)
  const timerStory = ref(baseTimerStory.value)

  const timerTurnInterval = ref<number | null>(null)
  const timerStoryInterval = ref<number | null>(null)

  // Prazo absoluto (epoch ms) de cada fase. Contar a partir de um deadline —
  // em vez de decrementar — deixa o cronômetro imune ao congelamento de
  // setInterval quando a aba fica em segundo plano no mobile: ao voltar, o
  // próximo tick recalcula o valor correto direto do relógio.
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
  }

  const tickTurn = () => {
    if (turnDeadline.value === null) return
    const remaining = Math.max(0, Math.ceil((turnDeadline.value - Date.now()) / 1000))
    timerTurn.value = remaining
    if (remaining <= 0) {
      stopTimerTurn()
      _onTurnExpired?.() // game store decides what to do
    }
  }

  const tickStory = () => {
    if (storyDeadline.value === null) return
    const remaining = Math.max(0, Math.ceil((storyDeadline.value - Date.now()) / 1000))
    timerStory.value = remaining
    if (remaining <= 0) stopTimerStory()
  }

  const startTimerTurn = () => {
    isTurnRunning.value = true
    // Deadline derivado do valor atual de timerTurn (respeita um restore prévio).
    turnDeadline.value = Date.now() + timerTurn.value * 1000
    if (timerTurnInterval.value) clearInterval(timerTurnInterval.value)
    // 250ms: recupera rápido ao voltar do segundo plano, sem custo perceptível.
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
  }

  const restoreStoryTimer = (remainingSeconds: number) => {
    stopTimerStory()
    timerStory.value = Math.max(0, remainingSeconds)
    if (timerStory.value > 0) startTimerStory()
  }

  // Recalcula imediatamente os cronômetros em execução a partir do deadline.
  // Chamado ao voltar o foco/rede, quando os ticks em segundo plano ficaram
  // atrasados. Sem efeito se nada estiver rodando.
  const syncFromDeadline = () => {
    if (isTurnRunning.value) tickTurn()
    if (isStoryRunning.value) tickStory()
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
    syncFromDeadline,
  }
})
