import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'

import RoomManageModal from '@/components/RoomManageModal.vue'
import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'
import { useTimerStore } from '@/stores/timer'
import { SocketEvents } from '@/constants/socketEvents'

// Some labels (e.g. "Reiniciar jogo" / "Reiniciar") share a substring, and the
// row's own "Remover" button stays mounted behind BaseConfirmModal — so
// clicks on a confirm/cancel dialog must be scoped to the topmost `[role="dialog"]`,
// by exact button text, not to `document.body` as a whole. Each click awaits
// `nextTick` since Vue flushes DOM updates asynchronously.
const topDialog = () => {
  const dialogs = document.body.querySelectorAll('[role="dialog"]')
  return dialogs[dialogs.length - 1] ?? null
}
const clickIn = async (root: ParentNode, text: string) => {
  const button = Array.from(root.querySelectorAll('button')).find((b) => b.textContent?.trim() === text)
  button?.click()
  await nextTick()
}
const clickInBody = (text: string) => clickIn(document.body, text)
const clickInTopDialog = (text: string) => {
  const dialog = topDialog()
  return dialog ? clickIn(dialog, text) : Promise.resolve()
}

describe('RoomManageModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('remover jogador: confirma e emite kick, sem alerta de fechamento', async () => {
    const storeSocket = useSocketStore()
    storeSocket.room = [{ id: 'p2', name: 'Bruno' }] as never
    const emitKickPlayer = vi.spyOn(storeSocket, 'emitKickPlayer')

    const wrapper = mount(RoomManageModal, { attachTo: document.body })
    await clickInBody('Remover')
    await clickInTopDialog('Remover')

    expect(emitKickPlayer).toHaveBeenCalledWith('p2')
    wrapper.unmount()
  })

  it('reiniciar jogo: pede confirmação, emite reset-game e fecha o modal', async () => {
    const storeSocket = useSocketStore()
    const emitResetGame = vi.spyOn(storeSocket, 'emitResetGame')

    const wrapper = mount(RoomManageModal, { attachTo: document.body })
    await clickInBody('Reiniciar jogo')
    await clickInTopDialog('Reiniciar')

    expect(emitResetGame).toHaveBeenCalled()
    expect(wrapper.emitted('close')).toBeTruthy()
    wrapper.unmount()
  })

  it('fechar sem alterações não pergunta nada', async () => {
    const wrapper = mount(RoomManageModal, { attachTo: document.body })
    await clickInBody('×')

    expect(wrapper.emitted('close')).toBeTruthy()
    wrapper.unmount()
  })

  it('fechar com alterações pendentes avisa e permite continuar editando ou descartar', async () => {
    const storeSettings = useSettingStore()
    storeSettings.gameState = SocketEvents.STATE_LOBBY

    const wrapper = mount(RoomManageModal, { attachTo: document.body })
    const slider = document.body.querySelector('input[type="range"]') as HTMLInputElement
    slider.value = String(Number(slider.value) + 5)
    slider.dispatchEvent(new Event('input'))
    await nextTick()

    await clickInBody('×')
    expect(wrapper.emitted('close')).toBeFalsy()
    expect(topDialog()?.textContent).toContain('Descartar alterações?')

    await clickInTopDialog('Continuar editando')
    expect(wrapper.emitted('close')).toBeFalsy()
    expect(document.body.textContent).toContain('Gerenciar sala')

    await clickInBody('×')
    await clickInTopDialog('Descartar')
    expect(wrapper.emitted('close')).toBeTruthy()
    wrapper.unmount()
  })

  it('salvar configuração fecha o modal automaticamente', async () => {
    const storeSettings = useSettingStore()
    storeSettings.gameState = SocketEvents.STATE_LOBBY
    const storeSocket = useSocketStore()
    vi.spyOn(storeSocket, 'emitConfigGame')

    const wrapper = mount(RoomManageModal, { attachTo: document.body })
    const slider = document.body.querySelector('input[type="range"]') as HTMLInputElement
    slider.value = String(Number(slider.value) + 5)
    slider.dispatchEvent(new Event('input'))
    await nextTick()

    await clickInBody('Salvar configuração')

    expect(wrapper.emitted('close')).toBeTruthy()
    wrapper.unmount()
  })

  it('mostra a contagem regressiva de vagas reservadas', () => {
    const storeTimer = useTimerStore()
    storeTimer.addReservation('p2', 'Bruno', 42_000)

    const wrapper = mount(RoomManageModal, { attachTo: document.body })

    expect(document.body.textContent).toContain('Vagas reservadas')
    expect(document.body.textContent).toContain('Bruno')
    expect(document.body.textContent).toContain('42s')
    wrapper.unmount()
    storeTimer.clearReservations()
  })

  it('não mostra a seção de vagas reservadas sem reservas pendentes', () => {
    const wrapper = mount(RoomManageModal, { attachTo: document.body })
    expect(document.body.textContent).not.toContain('Vagas reservadas')
    wrapper.unmount()
  })
})
