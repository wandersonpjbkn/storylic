import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import AvatarInitials from '@/components/AvatarInitials.vue'

describe('AvatarInitials', () => {
  it('deriva até duas iniciais em maiúsculas', () => {
    expect(mount(AvatarInitials, { props: { alt: 'Ana Bia' } }).text()).toBe('AB')
    expect(mount(AvatarInitials, { props: { alt: 'batatinha' } }).text()).toBe('B')
    expect(mount(AvatarInitials, { props: { alt: 'joão pedro souza' } }).text()).toBe('JP')
  })

  it('mesma cor para o mesmo nome (hash determinístico)', () => {
    const a = mount(AvatarInitials, { props: { alt: 'Ana' } }).html()
    const b = mount(AvatarInitials, { props: { alt: 'Ana' } }).html()
    expect(a).toBe(b)
  })

  it('nomes diferentes tendem a cores diferentes', () => {
    const a = mount(AvatarInitials, { props: { alt: 'Ana' } }).html()
    const b = mount(AvatarInitials, { props: { alt: 'Cid' } }).html()
    expect(a).not.toBe(b)
  })
})
