import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type NavigationGuardNext,
} from 'vue-router'

import { useSettingStore } from '@/stores/settings'

import SetupView from '@/views/SetupView.vue'

const validateGameState = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
  state: string,
) => {
  const storeSettings = useSettingStore()

  if (storeSettings.gameState === state) next()
  else next({ name: 'setup-view' })
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'setup-view',
      path: '/',
      component: SetupView,
    },
    {
      name: 'lobby-view',
      path: '/lobby',
      component: import('@/views/LobbyView.vue'),
      beforeEnter: (to, from, next) => {
        validateGameState(to, from, next, 'lobby')
      },
    },
    {
      name: 'waiting-view',
      path: '/waiting',
      component: import('@/views/WaitingView.vue'),
      beforeEnter: (to, from, next) => {
        validateGameState(to, from, next, 'waiting')
      },
    },
    {
      name: 'playing-view',
      path: '/playing',
      component: import('@/views/PlayingView.vue'),
      beforeEnter: (to, from, next) => {
        validateGameState(to, from, next, 'playing')
      },
    },
    {
      name: 'storytelling-view',
      path: '/storytelling',
      component: import('@/views/StorytellingView.vue'),
      beforeEnter: (to, from, next) => {
        validateGameState(to, from, next, 'storytelling')
      },
    },
    {
      name: 'end-view',
      path: '/end',
      component: import('@/views/EndView.vue'),
      beforeEnter: (to, from, next) => {
        validateGameState(to, from, next, 'end')
      },
    },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
