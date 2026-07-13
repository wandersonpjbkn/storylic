import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import BaseIcon from '@/components/BaseIcon.vue'

// BaseIcon carrega o SVG por import() dinâmico (defineAsyncComponent) — o loader
// de SVG não resolve de forma confiável no jsdom/vitest, então aqui é só um smoke
// (monta sem erro nas duas variantes). A semântica aria (role=img vs aria-hidden)
// vive em `a11yAttrs`, um computed trivial verificado pelo type-check.
describe('BaseIcon', () => {
  it('monta como decorativo (sem label) sem erro', () => {
    expect(() => mount(BaseIcon, { props: { name: 'times' } })).not.toThrow()
  })

  it('monta como conteúdo (com label) sem erro', () => {
    expect(() => mount(BaseIcon, { props: { name: 'times', label: 'Fechar' } })).not.toThrow()
  })
})
