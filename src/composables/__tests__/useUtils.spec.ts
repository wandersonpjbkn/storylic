import { describe, it, expect } from 'vitest'

import { normalizeString, shuffleArray } from '@/composables/useUtils'
import type { Card } from '@/types'

describe('normalizeString', () => {
  it('remove acentos, baixa caixa e troca espaços por underscore', () => {
    expect(normalizeString('Ação Rápida')).toBe('acao_rapida')
    expect(normalizeString('CORAÇÃO')).toBe('coracao')
  })
})

describe('shuffleArray', () => {
  const deck: Card[] = Array.from({ length: 20 }, (_, i) => ({
    name: `c${i}`,
    category: 'actions',
  }))

  it('preserva tamanho e o conjunto de cartas (não perde nem duplica)', () => {
    const out = shuffleArray(deck)
    expect(out).toHaveLength(deck.length)
    expect(new Set(out.map((c) => c.name))).toEqual(new Set(deck.map((c) => c.name)))
  })

  it('não muta o array original', () => {
    const before = deck.map((c) => c.name)
    shuffleArray(deck)
    expect(deck.map((c) => c.name)).toEqual(before)
  })
})
