import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import TheTimer from '@/components/TheTimer.vue'

describe('TheTimer', () => {
  it('exibe o valor e o rótulo', () => {
    const wrapper = mount(TheTimer, { props: { value: 18, progress: 0.72, label: 'Tempo' } })
    expect(wrapper.text()).toContain('18')
    expect(wrapper.text()).toContain('Tempo')
  })

  it('fase crítica (≤25%) pulsa o número', () => {
    const wrapper = mount(TheTimer, { props: { value: 5, progress: 0.2 } })
    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
  })

  it('fase calma (>50%) não pulsa', () => {
    const wrapper = mount(TheTimer, { props: { value: 20, progress: 0.8 } })
    expect(wrapper.find('.animate-pulse').exists()).toBe(false)
  })

  it('a barra reflete a proporção restante', () => {
    const wrapper = mount(TheTimer, { props: { value: 10, progress: 0.5 } })
    // 50% — an SVG percentage attribute, not an inline `style`, per the CSP-safe design
    expect(wrapper.find('.sl-timer__bar-fill').attributes('width')).toBe('50%')
  })
})
