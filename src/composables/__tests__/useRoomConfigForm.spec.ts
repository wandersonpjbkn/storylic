import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const fakeSocket = { id: undefined, on: vi.fn(), emit: vi.fn(), connect: vi.fn(), disconnect: vi.fn() }
vi.mock('socket.io-client', () => ({ io: vi.fn(() => fakeSocket) }))

import { useRoomConfigForm } from '@/composables/useRoomConfigForm'
import { useTimerStore } from '@/stores/timer'
import { useSettingStore } from '@/stores/settings'
import { useSocketStore } from '@/stores/socket'

describe('useRoomConfigForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('hasChanges reflete o rascunho local contra as stores', () => {
    const form = useRoomConfigForm()
    expect(form.hasChanges.value).toBe(false)

    form.timerTurn.value += 5
    expect(form.hasChanges.value).toBe(true)
  })

  it('save persiste nas stores, emite config-game e chama onSave', () => {
    const onSave = vi.fn()
    const form = useRoomConfigForm(onSave)
    const storeTimer = useTimerStore()
    const storeSettings = useSettingStore()
    useSocketStore().connectToServer()

    form.timerTurn.value = 40
    form.timerStory.value = 50
    form.turns.value = 5
    form.save()

    expect(storeTimer.baseTimerTurn).toBe(40)
    expect(storeTimer.baseTimerStory).toBe(50)
    expect(storeSettings.turnMax).toBe(5)
    expect(fakeSocket.emit).toHaveBeenCalledWith(
      'config-game',
      expect.objectContaining({ timerTurn: 40, timerStory: 50, turns: 5 }),
    )
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('reset descarta o rascunho e volta a bater com as stores', () => {
    const form = useRoomConfigForm()
    form.timerTurn.value += 5
    expect(form.hasChanges.value).toBe(true)

    form.reset()
    expect(form.hasChanges.value).toBe(false)
  })
})
