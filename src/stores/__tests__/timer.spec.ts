import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useTimerStore } from '@/stores/timer'

describe('timer store (deadline-based)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('conta a partir do deadline: após 3s de 10, mostra 7', () => {
    const timer = useTimerStore()
    timer.baseTimerTurn = 10
    timer.resetTimers()
    timer.startTimerTurn()

    vi.advanceTimersByTime(3000)

    expect(timer.timerTurn).toBe(7)
    expect(timer.isTurnRunning).toBe(true)
  })

  it('ao chegar a zero, para e dispara onTurnExpired', () => {
    const timer = useTimerStore()
    const spy = vi.fn()
    timer.onTurnExpired(spy)
    timer.baseTimerTurn = 5
    timer.resetTimers()
    timer.startTimerTurn()

    vi.advanceTimersByTime(6000)

    expect(timer.timerTurn).toBe(0)
    expect(timer.isTurnRunning).toBe(false)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('syncFromDeadline recalcula quando os ticks ficaram congelados (2º plano)', () => {
    const timer = useTimerStore()
    timer.baseTimerTurn = 30
    timer.resetTimers()
    timer.startTimerTurn()

    // Simula a aba em segundo plano: o relógio avança 12s sem os ticks rodarem.
    vi.setSystemTime(Date.now() + 12_000)
    // sem sync, o valor exibido ainda estaria defasado; sync corrige na hora
    timer.syncFromDeadline()

    expect(timer.timerTurn).toBe(18)
  })

  it('restoreStoryTimer retoma a narração a partir do tempo restante', () => {
    const timer = useTimerStore()
    timer.restoreStoryTimer(20)
    expect(timer.timerStory).toBe(20)
    expect(timer.isStoryRunning).toBe(true)

    vi.advanceTimersByTime(5000)
    expect(timer.timerStory).toBe(15)
  })

  it('resetTimers para tudo e volta aos valores base', () => {
    const timer = useTimerStore()
    timer.baseTimerTurn = 25
    timer.baseTimerStory = 45
    timer.startTimerTurn()
    vi.advanceTimersByTime(2000)

    timer.resetTimers()

    expect(timer.timerTurn).toBe(25)
    expect(timer.timerStory).toBe(45)
    expect(timer.isTurnRunning).toBe(false)
  })
})
