import { ref } from 'vue'
import { defineStore } from 'pinia'

interface Notification {
  show?: boolean
  title?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  message: string
}

export const useGlobalStore = defineStore('global', () => {
  // state
  const baseDuration = ref(6000)
  const notification = ref<Notification>({
    show: false,
    title: '',
    type: 'info',
    message: '',
  })
  const notificationDuration = ref(baseDuration.value)
  const notificationInterval = ref<number | null>(null)

  // actions
  const closeNotification = () => {
    notification.value = {
      show: false,
      title: '',
      type: 'info',
      message: '',
    }

    if (notificationInterval.value) {
      clearInterval(notificationInterval.value)
      notificationInterval.value = null
    }

    notificationDuration.value = baseDuration.value
  }
  const openNotification = ({
    show = true,
    title = 'Alerta',
    type = 'warning',
    message,
    duration,
  }: Notification) => {
    closeNotification()

    if (duration) notificationDuration.value = duration

    notificationInterval.value = setTimeout(() => {
      notification.value = {
        show,
        title,
        type,
        message,
      }
    }, 350)
  }

  return {
    // notification
    notification,
    notificationDuration,
    closeNotification,
    openNotification,
  }
})
