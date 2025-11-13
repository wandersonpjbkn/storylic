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
) => {
  const storeSettings = useSettingStore()
  const [, state] = to.path.split('/')

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
      beforeEnter: validateGameState,
    },
    {
      name: 'waiting-view',
      path: '/waiting',
      component: import('@/views/WaitingView.vue'),
      beforeEnter: validateGameState,
    },
    {
      name: 'playing-view',
      path: '/playing',
      component: import('@/views/PlayingView.vue'),
      beforeEnter: validateGameState,
    },
    {
      name: 'storytelling-view',
      path: '/storytelling',
      component: import('@/views/StorytellingView.vue'),
      beforeEnter: validateGameState,
    },
    {
      name: 'ended-view',
      path: '/ended',
      component: import('@/views/EndedView.vue'),
      beforeEnter: validateGameState,
    },
    {
      name: 'NotFound',
      path: '/:pathMatch(.*)*',
      component: SetupView,
    },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
