<script lang="ts" setup>
import TheCard from './TheCard.vue'
import { useCardsStore } from '@/stores/cards'

type Category = 'actions' | 'animals' | 'emotions' | 'nature' | 'objects' | 'personas' | 'places'

const storeCards = useCardsStore()
</script>

<template>
  <div class="grid grid-cols-3 gap-3">
    <TheCard
      v-for="card in storeCards.displayedCards"
      :key="card.name"
      :name="card.name"
      :category="card.category as Category"
      :selected="storeCards.isCardSelected(card)"
      @click="storeCards.toggleCardSelection(card)"
    />
  </div>
</template>
