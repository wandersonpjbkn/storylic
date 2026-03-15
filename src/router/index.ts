import { createRouter, createWebHistory } from 'vue-router'

import { useSettingStore } from '@/stores/settings'
import { GAME_ROUTES } from '@/composables/useNavigator'

import SetupView from '@/views/SetupView.vue'
import RoomsView from '@/views/RoomsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'rooms-view', path: '/', component: RoomsView },
    { name: 'setup-view', path: '/setup', component: SetupView },
    { name: 'lobby-view', path: '/lobby', component: () => import('@/views/LobbyView.vue') },
    { name: 'waiting-view', path: '/waiting', component: () => import('@/views/WaitingView.vue') },
    { name: 'playing-view', path: '/playing', component: () => import('@/views/PlayingView.vue') },
    {
      name: 'storytelling-view',
      path: '/storytelling',
      component: () => import('@/views/StorytellingView.vue'),
    },
    { name: 'ended-view', path: '/ended', component: () => import('@/views/EndedView.vue') },
    { name: 'NotFound', path: '/:pathMatch(.*)*', component: RoomsView },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach((to) => {
  const isGameRoute = Object.values(GAME_ROUTES).includes(to.name as string)
  if (!isGameRoute) return true

  const hasSession = !!sessionStorage.getItem('storylic_session')
  if (hasSession) return true

  try {
    const storeSettings = useSettingStore()
    const validStates = Object.keys(GAME_ROUTES)
    if (validStates.includes(storeSettings.gameState)) return true
  } catch (err) {
    // Pinia pode não estar inicializado ainda em alguns cenários de SSR/test
    if (import.meta.env.DEV) console.warn(err)
  }

  return { name: 'rooms-view' }
})

export default router
