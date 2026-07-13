import { computed, ref } from 'vue'

import { useSettingStore } from '@/stores/settings'
import { useSocketStore } from '@/stores/socket'
import { useTimerStore } from '@/stores/timer'

/**
 * Local draft of the room's timers/turns, dirty-tracked against the stores
 * and only persisted (to the stores + the server) on `save`. Shared by
 * `ConfigView` (room creation) and `RoomManageModal` (lobby reconfiguration).
 */
export const useRoomConfigForm = (onSave?: () => void) => {
  const storeSocket = useSocketStore()
  const storeSettings = useSettingStore()
  const storeTimer = useTimerStore()

  const timerTurn = ref(storeTimer.baseTimerTurn)
  const timerStory = ref(storeTimer.baseTimerStory)
  const turns = ref(storeSettings.turnMax)

  const hasChanges = computed(
    () =>
      timerTurn.value !== storeTimer.baseTimerTurn ||
      timerStory.value !== storeTimer.baseTimerStory ||
      turns.value !== storeSettings.turnMax,
  )

  const save = () => {
    storeTimer.baseTimerTurn = timerTurn.value
    storeTimer.baseTimerStory = timerStory.value
    storeSettings.turnMax = turns.value

    // Sent to the backend — everyone in the room receives room-config
    storeSocket.emitConfigGame({
      timerTurn: timerTurn.value,
      timerStory: timerStory.value,
      turns: turns.value,
    })

    onSave?.()
  }

  const reset = () => {
    timerTurn.value = storeTimer.baseTimerTurn
    timerStory.value = storeTimer.baseTimerStory
    turns.value = storeSettings.turnMax
  }

  return { timerTurn, timerStory, turns, hasChanges, save, reset }
}
