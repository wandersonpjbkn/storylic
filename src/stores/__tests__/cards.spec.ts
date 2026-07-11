import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useCardsStore } from '@/stores/cards'
import type { Card } from '@/types'

describe('cards store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializeDeck carrega todas as cartas das categorias, com name e category', () => {
    const cards = useCardsStore()
    cards.initializeDeck()

    expect(cards.availableCards.length).toBeGreaterThan(0)
    const sample = cards.availableCards[0]
    expect(sample).toHaveProperty('name')
    expect(sample).toHaveProperty('category')
    // toda carta pertence a uma das 7 categorias
    const categories = new Set(cards.availableCards.map((c) => c.category))
    expect(categories.size).toBeGreaterThanOrEqual(1)
  })

  it('dealCards distribui 3 do topo, remove-as do baralho e limpa a seleção', () => {
    const cards = useCardsStore()
    cards.initializeDeck()
    const total = cards.availableCards.length
    cards.selectedCards = [{ name: 'x', category: 'actions' }]

    cards.dealCards()

    expect(cards.displayedCards).toHaveLength(3)
    expect(cards.availableCards).toHaveLength(total - 3)
    expect(cards.selectedCards).toHaveLength(0)
  })

  it('toggleCardSelection alterna e respeita o teto de 3', () => {
    const cards = useCardsStore()
    const deck: Card[] = [
      { name: 'a', category: 'actions' },
      { name: 'b', category: 'animals' },
      { name: 'c', category: 'nature' },
      { name: 'd', category: 'objects' },
    ]

    cards.toggleCardSelection(deck[0])
    expect(cards.isCardSelected(deck[0])).toBe(true)

    cards.toggleCardSelection(deck[0]) // desmarca
    expect(cards.isCardSelected(deck[0])).toBe(false)

    deck.forEach((c) => cards.toggleCardSelection(c)) // tenta marcar 4
    expect(cards.selectedCards).toHaveLength(3) // teto respeitado
    expect(cards.canConfirm).toBe(true)
  })

  it('shuffleDisplayedCards troca a mão exibida mantendo o total do baralho', () => {
    const cards = useCardsStore()
    cards.initializeDeck()
    const total = cards.availableCards.length
    cards.dealCards()
    const before = cards.displayedCards.map((c) => c.name)

    cards.shuffleDisplayedCards()

    // as antigas voltam para o baralho; o total (disponível + exibidas) se mantém
    expect(cards.availableCards.length + cards.displayedCards.length).toBe(total)
    expect(cards.displayedCards.map((c) => c.name)).not.toEqual(before)
  })
})
