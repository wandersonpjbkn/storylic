import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// socket.io-client é mocado: o protocolo real é coberto pela suíte de integração
// da API. Aqui só exercitamos a lógica de cliente (sessão e troca de servidor).
const fakeSocket = {
  id: undefined as string | undefined,
  on: vi.fn(),
  emit: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  removeAllListeners: vi.fn(),
  connected: false,
}
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => fakeSocket),
}))

import { useSocketStore } from '@/stores/socket'

describe('socket store — sessão e servidor', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('activeSession é nula sem sessão salva', () => {
    expect(useSocketStore().activeSession).toBeNull()
  })

  it('activeSession reflete a sessão salva no sessionStorage', () => {
    // Semeia o storage antes de criar a store (activeSession é computed sem
    // dependência reativa — resolve na primeira leitura).
    sessionStorage.setItem(
      'storylic_session',
      JSON.stringify({ token: 'a'.repeat(48), gameId: 'sala', playerName: 'Ana' }),
    )
    expect(useSocketStore().activeSession).toMatchObject({ gameId: 'sala' })
  })

  it('começa apontando para o servidor padrão (nuvem)', () => {
    const store = useSocketStore()
    expect(store.isDefaultServer).toBe(true)
  })

  it('setServerUrl troca para um servidor local e persiste', () => {
    const store = useSocketStore()
    store.setServerUrl('http://192.168.0.9:3000')

    expect(store.serverUrl).toBe('http://192.168.0.9:3000')
    expect(store.isDefaultServer).toBe(false)
    expect(localStorage.getItem('storylic_server_url')).toBe('http://192.168.0.9:3000')
  })

  it('setServerUrl vazio volta ao padrão e limpa o storage', () => {
    const store = useSocketStore()
    store.setServerUrl('http://192.168.0.9:3000')
    store.setServerUrl('')

    expect(store.isDefaultServer).toBe(true)
    expect(localStorage.getItem('storylic_server_url')).toBeNull()
  })
})

// Captura o handler registrado via `socket.on(event, handler)` no fake socket,
// simulando o servidor emitindo aquele evento.
const handlerFor = (event: string) =>
  fakeSocket.on.mock.calls.find(([e]) => e === event)?.[1] as (payload?: unknown) => void

describe('socket store — dono da sala e remoção', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('isOwner vira true ao criar a sala (join-ack com isCreator)', () => {
    const store = useSocketStore()
    store.connectToServer()

    handlerFor('join-ack')?.({ token: 'a'.repeat(48), gameId: 'sala', isCreator: true })

    expect(store.isOwner).toBe(true)
  })

  it('isOwner reflete o valor vindo do rejoin-ack', () => {
    const store = useSocketStore()
    store.connectToServer()

    handlerFor('rejoin-ack')?.({
      gameState: 'lobby',
      currentPlayer: '',
      currentTurn: 1,
      turns: 3,
      players: [],
      isMyTurn: false,
      isOwner: true,
      remainingTurnMs: 25000,
      newToken: 'b'.repeat(48),
      timerTurn: 25,
      timerStory: 30,
    })

    expect(store.isOwner).toBe(true)
  })

  it('kicked limpa a sessão e tira o isOwner', () => {
    sessionStorage.setItem(
      'storylic_session',
      JSON.stringify({ token: 'a'.repeat(48), gameId: 'sala', playerName: 'Ana' }),
    )
    const store = useSocketStore()
    store.connectToServer()

    handlerFor('kicked')?.({ reason: 'Você foi removido da sala pelo dono.' })

    expect(store.isOwner).toBe(false)
    expect(sessionStorage.getItem('storylic_session')).toBeNull()
  })
})

describe('socket store — cards reveladas na tela de espera', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('a mão revelada do jogador anterior some assim que o turno avança', () => {
    const store = useSocketStore()
    store.connectToServer()

    handlerFor('player-selected-cards')?.({
      cards: [{ name: 'Dragão', category: 'personas' }],
      playerNumber: 'player-a',
    })
    expect(store.currentCards).toHaveLength(1)

    // Turno avança para outro jogador — a mão de A não é mais válida, mesmo
    // antes de B confirmar a própria (regressão: ficava "presa" até lá).
    handlerFor('player-turn')?.({ currentPlayer: 'player-b', currentTurn: 2 })

    expect(store.currentCards).toEqual([])
  })
})
