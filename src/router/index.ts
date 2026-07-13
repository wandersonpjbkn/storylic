import { createRouter, createWebHistory } from 'vue-router'

import { useSettingStore } from '@/stores/settings'
import { useSocketStore } from '@/stores/socket'
import { GAME_ROUTES, PUBLIC_ROUTES } from '@/composables/useNavigator'
import { SocketEvents } from '@/constants/socketEvents'

import SetupView from '@/views/SetupView.vue'
import RoomsView from '@/views/RoomsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'rooms-view',
      path: '/',
      component: RoomsView,
    },
    {
      name: 'setup-view',
      path: '/setup',
      component: SetupView,
    },
    {
      // Invite link: goes straight to the name screen, no room list and no
      // manual ID field — whoever clicks it only ever joins the invited room.
      name: 'join-view',
      path: '/join/:gameId',
      component: SetupView,
    },
    {
      name: 'config-view',
      path: '/config',
      component: () => import('@/views/ConfigView.vue'),
    },
    {
      name: 'lobby-view',
      path: '/lobby',
      component: () => import('@/views/LobbyView.vue'),
    },
    {
      name: 'waiting-view',
      path: '/waiting',
      component: () => import('@/views/WaitingView.vue'),
    },
    {
      name: 'playing-view',
      path: '/playing',
      component: () => import('@/views/PlayingView.vue'),
    },
    {
      name: 'storytelling-view',
      path: '/storytelling',
      component: () => import('@/views/StorytellingView.vue'),
    },
    {
      name: 'ended-view',
      path: '/ended',
      component: () => import('@/views/EndedView.vue'),
    },
    {
      name: 'NotFound',
      path: '/:pathMatch(.*)*',
      component: RoomsView,
    },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

const GAME_ONLY_ROUTES = Object.values(GAME_ROUTES).filter((name) => !PUBLIC_ROUTES.includes(name))

router.beforeEach((to) => {
  if (!GAME_ONLY_ROUTES.includes(to.name as string)) return true

  try {
    if (useSocketStore().activeSession) return true

    const storeSettings = useSettingStore()
    const currentState = storeSettings.gameState as string

    const expectedState = Object.entries(GAME_ROUTES).find(
      ([, routeName]) => routeName === to.name,
    )?.[0]

    if (expectedState && currentState === expectedState) return true

    const inGameStates: string[] = [
      SocketEvents.STATE_CONFIG,
      SocketEvents.STATE_LOBBY,
      SocketEvents.STATE_PLAYING,
      SocketEvents.STATE_WAITING,
      SocketEvents.STATE_STORYTELLING,
      SocketEvents.STATE_ENDED,
    ]
    if (inGameStates.includes(currentState)) return true
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[router guard]', err)
  }

  return { name: 'rooms-view' }
})

export default router
