import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

import TheNotification from '@/components/TheNotification.vue'
import { useGlobalStore } from '@/stores/global'

const mountWith = (type: 'success' | 'error' | 'warning' | 'info') => {
  const store = useGlobalStore()
  store.notification = { show: true, type, title: 'Título', message: 'Mensagem' }
  return mount(TheNotification, { global: { stubs: { BaseIcon: true } } })
}

describe('TheNotification (a11y)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('erro é um alert assertivo (interrompe o leitor de tela)', () => {
    const wrapper = mountWith('error')
    const region = wrapper.find('[aria-atomic="true"]')
    expect(region.attributes('role')).toBe('alert')
    expect(region.attributes('aria-live')).toBe('assertive')
  })

  it('não-erro é um status polido (não interrompe)', () => {
    const wrapper = mountWith('success')
    const region = wrapper.find('[aria-atomic="true"]')
    expect(region.attributes('role')).toBe('status')
    expect(region.attributes('aria-live')).toBe('polite')
  })

  it('o botão de fechar tem nome acessível', () => {
    const wrapper = mountWith('info')
    expect(wrapper.find('button[aria-label="Fechar notificação"]').exists()).toBe(true)
  })
})
