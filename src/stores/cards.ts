import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import actions from '@/data/categories/actions.json'
import animals from '@/data/categories/animals.json'
import emotions from '@/data/categories/emotions.json'
import nature from '@/data/categories/nature.json'
import objects from '@/data/categories/objects.json'
import personas from '@/data/categories/personas.json'
import places from '@/data/categories/places.json'

import { shuffleArray } from '@/composables/useUtils'
import type { Category, Card } from '@/types'

export const useCardsStore = defineStore('cards', () => {
  // state
  const availableCards = ref<Card[]>([])
  const displayedCards = ref<Card[]>([])
  const selectedCards = ref<Card[]>([])
  const categories = ref({
    actions,
    animals,
    emotions,
    nature,
    objects,
    personas,
    places,
  })

  // getters
  const canConfirm = computed(() => {
    return selectedCards.value.length > 0
  })

  // actions
  const dealCards = () => {
    const cards = availableCards.value.slice(0, 3)

    displayedCards.value = cards
    availableCards.value = availableCards.value.slice(3)
    selectedCards.value = []
  }
  const isCardSelected = (card: Card) => {
    return selectedCards.value.some((c) => c.name === card.name)
  }
  const shuffleDisplayedCards = () => {
    const remaining = availableCards.value.slice(0, 3)

    availableCards.value = [...availableCards.value.slice(3), ...displayedCards.value]
    displayedCards.value = remaining
  }
  const toggleCardSelection = (card: Card) => {
    const index = selectedCards.value.findIndex((c) => c.name === card.name)

    if (index !== -1) {
      selectedCards.value.splice(index, 1)
    } else if (selectedCards.value.length < 3) {
      selectedCards.value.push(card)
    }
  }
  const initializeDeck = () => {
    const allCards: Card[] = []
    Object.entries(categories.value).forEach(([category, cards]) => {
      cards.forEach((card: string) => {
        allCards.push({
          name: card,
          category: category as Category,
        })
      })
    })

    availableCards.value = shuffleArray(allCards)
  }

  return {
    // state
    availableCards,
    displayedCards,
    selectedCards,
    categories,

    // getters
    canConfirm,

    // actions
    dealCards,
    isCardSelected,
    shuffleDisplayedCards,
    toggleCardSelection,
    initializeDeck,
  }
})
