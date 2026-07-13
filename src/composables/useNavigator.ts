import type { Router } from 'vue-router'

export const GAME_ROUTES: Record<string, string> = {
  rooms: 'rooms-view',
  setup: 'setup-view',
  config: 'config-view',
  lobby: 'lobby-view',
  waiting: 'waiting-view',
  playing: 'playing-view',
  storytelling: 'storytelling-view',
  ended: 'ended-view',
}

export const PUBLIC_ROUTES = ['rooms-view', 'setup-view', 'join-view']

let _router: Router | null = null

export const initNavigator = (router: Router) => {
  _router = router
}

export const navigateTo = (state: string): void => {
  if (!_router) {
    console.warn('[navigator] Router não inicializado — chame initNavigator primeiro')
    return
  }

  const routeName = GAME_ROUTES[state] ?? 'setup-view'
  _router.push({ name: routeName }).catch((err) => {
    if (err?.name !== 'NavigationDuplicated') console.warn('[navigator]', err)
  })
}
