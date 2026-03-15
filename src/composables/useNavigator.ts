import type { Router } from 'vue-router'

// Rotas protegidas — só acessíveis dentro de um jogo em andamento.
// O guard global bloqueia acesso direto por URL sem sessão ativa.
export const GAME_ROUTES: Record<string, string> = {
  rooms:        'rooms-view',
  setup:        'setup-view',
  lobby:        'lobby-view',
  waiting:      'waiting-view',
  playing:      'playing-view',
  storytelling: 'storytelling-view',
  ended:        'ended-view',
}

export const PUBLIC_ROUTES = ['rooms-view', 'setup-view']

let _router: Router | null = null

export const initNavigator = (router: Router) => {
  _router = router
}

/**
 * Navega para a rota correspondente ao gameState informado.
 * Chamado diretamente pelo socket store em cada evento — sem watch, sem tick.
 *
 * Por usar router.push internamente, a navegação é sempre assíncrona e
 * respeita os guards globais. O gameState já foi setado antes de navegar,
 * então o guard lê o valor correto.
 */
export const navigateTo = (state: string): void => {
  if (!_router) {
    console.warn('[navigator] Router não inicializado — chame initNavigator primeiro')
    return
  }

  const routeName = GAME_ROUTES[state] ?? 'setup-view'
  _router.push({ name: routeName }).catch((err) => {
    // Ignora NavigationDuplicated (já estamos na rota destino)
    if (err?.name !== 'NavigationDuplicated') console.warn('[navigator]', err)
  })
}
