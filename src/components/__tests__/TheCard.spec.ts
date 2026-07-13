import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import TheCard from '@/components/TheCard.vue'

// BaseIcon é registrado globalmente no main.ts; nos testes é stubado.
const mountCard = (props: Record<string, unknown>) =>
  mount(TheCard, { props, global: { stubs: { BaseIcon: true } } })

describe('TheCard', () => {
  it('mostra o nome e o rótulo da categoria', () => {
    const wrapper = mountCard({ name: 'Dragão', category: 'animals' })
    expect(wrapper.text()).toContain('Dragão')
    expect(wrapper.text()).toContain('Animal') // meta.animals.label
  })

  it('emite click quando habilitado', async () => {
    const wrapper = mountCard({ name: 'Dragão', category: 'animals' })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('desabilitado não emite click', async () => {
    const wrapper = mountCard({ name: 'Dragão', category: 'animals', disabled: true })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('readonly (na narração) não emite click', async () => {
    const wrapper = mountCard({ name: 'Dragão', category: 'animals', readonly: true })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('expõe estado de alternância e nome acessível (a11y)', () => {
    const off = mountCard({ name: 'Dragão', category: 'animals', selected: false })
    expect(off.find('button').attributes('aria-pressed')).toBe('false')
    expect(off.find('button').attributes('aria-label')).toBe('Animal: Dragão')

    const on = mountCard({ name: 'Dragão', category: 'animals', selected: true })
    expect(on.find('button').attributes('aria-pressed')).toBe('true')
  })

  it('readonly não é um botão de alternância (sem aria-pressed)', () => {
    const wrapper = mountCard({ name: 'Dragão', category: 'animals', readonly: true, selected: true })
    expect(wrapper.find('button').attributes('aria-pressed')).toBeUndefined()
  })
})
