import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface Notification {
  show?: boolean
  title?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  message: string
}

export const useGlobalStore = defineStore('global', () => {
  // state
  const notification = ref<Notification>({
    show: false,
    title: '',
    type: 'info',
    message: '',
  })
  const notificationDuration = ref(6000)

  // actions
  const closeNotification = () => {
    notification.value = {
      show: false,
      title: '',
      type: 'info',
      message: '',
    }
  }
  const openNotification = ({
    show = true,
    title = 'Alerta',
    type = 'warning',
    message,
  }: Notification) => {
    notification.value = {
      show: true,
      title,
      type,
      message,
    }
  }

  return {
    // notification
    notification,
    notificationDuration,
    closeNotification,
    openNotification,
  }
})
