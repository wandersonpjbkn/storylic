<script lang="ts" setup>
import { computed, watch } from 'vue'

import Alert from '@/assets/icons/Alert.vue'
import Error from '@/assets/icons/Error.vue'
import Info from '@/assets/icons/Info.vue'
import Success from '@/assets/icons/Success.vue'

import { useGlobalStore } from '@/stores/global'

const storeGlobal = useGlobalStore()

const notification = computed(() => storeGlobal.notification)
const duration = computed(() => {
  return `--duration: ${storeGlobal.notificationDuration}ms`
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
          'bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border-2 transform transition-all',
          notification.type === 'success' ? 'border-green-400/50' : '',
          notification.type === 'error' ? 'border-red-400/50' : '',
          notification.type === 'warning' ? 'border-yellow-400/50' : '',
          notification.type === 'info' ? 'border-blue-400/50' : '',
        ]"
      >
        <div class="flex items-start gap-4">
          <!-- Icon -->
          <div
            :class="[
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
              notification.type === 'success' ? 'bg-green-500/20' : '',
              notification.type === 'error' ? 'bg-red-500/20' : '',
              notification.type === 'warning' ? 'bg-yellow-500/20' : '',
              notification.type === 'info' ? 'bg-blue-500/20' : '',
            ]"
          >
            <Success v-if="notification.type === 'success'" class="w-6 h-6 text-green-400" />
            <Error v-else-if="notification.type === 'error'" class="w-6 h-6 text-red-400" />
            <Alert v-else-if="notification.type === 'warning'" class="w-6 h-6 text-yellow-400" />
            <Info v-else class="w-6 h-6 text-blue-400" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-white mb-1">{{ notification.title }}</h3>
            <p class="text-white/80 text-sm">{{ notification.message }}</p>
          </div>

          <!-- Close Button -->
          <button
            class="flex-shrink-0 text-white/60 hover:text-white transition-colors"
            @click="storeGlobal.closeNotification"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
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
          ></div>
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
