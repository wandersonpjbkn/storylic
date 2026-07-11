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
