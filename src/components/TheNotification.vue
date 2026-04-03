<script lang="ts" setup>
import { computed, watch } from 'vue'

import BaseIcon from '@/components/BaseIcon.vue'

import { useGlobalStore } from '@/stores/global'

type UIcons =
  // UI
  // used
  | 'alert'
  | 'checkmark'
  | 'error'
  | 'favicon'
  | 'info'
  | 'reload'
  | 'shuffle'
  | 'times'
  // unused
  | 'clock'
  | 'home'
  | 'success'
  | 'users'

const storeGlobal = useGlobalStore()

const notification = computed(() => storeGlobal.notification)
const duration = computed(() => {
  return `--duration: ${storeGlobal.notificationDuration}ms`
})
const icon = computed((): { name: UIcons; color: string } => {
  switch (notification.value.type) {
    case 'success':
      return { name: 'checkmark', color: 'green-400' }
    case 'error':
      return { name: 'error', color: 'red-400' }
    case 'warning':
      return { name: 'alert', color: 'yellow-400' }
    case 'info':
    default:
      return { name: 'info', color: 'blue-400' }
  }
})

watch(notification, ({ message }) => {
  if (message) {
    setTimeout(() => {
      storeGlobal.closeNotification()
    }, storeGlobal.notificationDuration)
  }
})
</script>

<template>
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    enter-to-class="opacity-100 translate-y-0 sm:scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0 sm:scale-100"
    leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
  >
    <div
      v-if="notification.show"
      class="fixed top-0 right-0 m-4 z-50 w-auto max-w-md"
      :style="duration"
    >
      <div
        :class="[
          'bg-white/10 backdrop-blur-lg rounded-xl p-4 shadow-2xl border-2 transform transition-all',
          notification.type === 'success' ? 'border-green-400/50' : '',
          notification.type === 'error' ? 'border-red-400/50' : '',
          notification.type === 'warning' ? 'border-yellow-400/50' : '',
          notification.type === 'info' ? 'border-blue-400/50' : '',
        ]"
      >
        <div class="flex items-start gap-3">
          <!-- Icon -->
          <div
            :class="[
              'shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
              notification.type === 'success' ? 'bg-green-500/20' : '',
              notification.type === 'error' ? 'bg-red-500/20' : '',
              notification.type === 'warning' ? 'bg-yellow-500/20' : '',
              notification.type === 'info' ? 'bg-blue-500/20' : '',
            ]"
          >
            <BaseIcon :name="icon.name" :class="`w-4 h-4 text-${icon.color}`" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-md font-semibold text-white mb-1">{{ notification.title }}</p>
            <p class="text-white/80 text-sm">{{ notification.message }}</p>
          </div>

          <!-- Close Button -->
          <button
            class="shrink-0 text-white/60 hover:text-white transition-colors"
            @click="storeGlobal.closeNotification"
          >
            <BaseIcon name="times" class="w-5 h-5" />
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            :class="[
              'h-full rounded-full animate-progress',
              notification.type === 'success' ? 'bg-green-400' : '',
              notification.type === 'error' ? 'bg-red-400' : '',
              notification.type === 'warning' ? 'bg-yellow-400' : '',
              notification.type === 'info' ? 'bg-blue-400' : '',
            ]"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-progress {
  animation: progress var(--duration) linear forwards;
}
</style>
