import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import TheTimer from '@/components/TheTimer.vue'

describe('TheTimer', () => {
  it('exibe o valor e o rótulo', () => {
    const wrapper = mount(TheTimer, { props: { value: 18, base: 25, label: 'Tempo' } })
    expect(wrapper.text()).toContain('18')
    expect(wrapper.text()).toContain('Tempo')
  })

  it('fase crítica (≤25%) pulsa o número', () => {
    const wrapper = mount(TheTimer, { props: { value: 5, base: 25 } })
    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
  })

  it('fase calma (>50%) não pulsa', () => {
    const wrapper = mount(TheTimer, { props: { value: 20, base: 25 } })
    expect(wrapper.find('.animate-pulse').exists()).toBe(false)
  })

  it('a barra reflete a proporção restante', () => {
    const wrapper = mount(TheTimer, { props: { value: 10, base: 20 } })
    // 10/20 → 50%
    expect(wrapper.html()).toContain('width: 50%')
  })
})
