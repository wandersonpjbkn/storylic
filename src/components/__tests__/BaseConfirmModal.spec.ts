import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'

import BaseConfirmModal from '@/components/BaseConfirmModal.vue'

const props = { title: 'Iniciar partida?', description: 'Todos serão puxados agora.' }

describe('BaseConfirmModal (a11y)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('é um dialog rotulado pelo título e descrito pela descrição', () => {
    const wrapper = mount(BaseConfirmModal, { props, attachTo: document.body })
    const dialog = document.body.querySelector('[role="dialog"]')!
    expect(dialog.getAttribute('aria-modal')).toBe('true')

    const labelId = dialog.getAttribute('aria-labelledby')!
    const descId = dialog.getAttribute('aria-describedby')!
    expect(document.getElementById(labelId)?.textContent).toContain('Iniciar partida?')
    expect(document.getElementById(descId)?.textContent).toContain('puxados')
    wrapper.unmount()
  })

  it('Escape emite cancel', async () => {
    const wrapper = mount(BaseConfirmModal, { props, attachTo: document.body })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('cancel')).toBeTruthy()
    wrapper.unmount()
  })

  it('leva o foco para o botão de confirmar ao abrir', () => {
    const wrapper = mount(BaseConfirmModal, { props, attachTo: document.body })
    expect(document.activeElement?.textContent).toContain('Confirmar')
    wrapper.unmount()
  })

  it('clique nos botões emite confirm / cancel', async () => {
    const wrapper = mount(BaseConfirmModal, { props, attachTo: document.body })
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const confirm = buttons.find((b) => b.textContent?.includes('Confirmar'))!
    const cancel = buttons.find((b) => b.textContent?.includes('Cancelar'))!
    confirm.click()
    cancel.click()
    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(wrapper.emitted('cancel')).toBeTruthy()
    wrapper.unmount()
  })
})
