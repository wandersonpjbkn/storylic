import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import BaseSlider from '@/components/BaseSlider.vue'

describe('BaseSlider', () => {
  const props = {
    title: 'Tempo para escolher cards',
    description: 'Quanto tempo cada jogador tem para montar a mão',
    min: 10,
    max: 60,
    step: 5,
    modelValue: 25,
  }

  it('renderiza título, valor e limites', () => {
    const wrapper = mount(BaseSlider, { props })
    expect(wrapper.text()).toContain('Tempo para escolher cards')
    expect(wrapper.text()).toContain('25s')
    expect(wrapper.text()).toContain('10s')
    expect(wrapper.text()).toContain('60s')
  })

  it('mostra a descrição (regressão do bug da prop `description`)', () => {
    const wrapper = mount(BaseSlider, { props })
    // Antes, ConfigView passava `description` mas o componente lia `descr` →
    // a descrição sumia. Este teste trava esse contrato.
    expect(wrapper.text()).toContain('Quanto tempo cada jogador tem para montar a mão')
  })

  it('emite update:modelValue ao mover o range', async () => {
    const wrapper = mount(BaseSlider, { props })
    const input = wrapper.find('input[type="range"]')
    await input.setValue(40)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([40])
  })
})
