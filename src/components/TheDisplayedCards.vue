<script lang="ts" setup>
import { useCardsStore } from '@/stores/cards'
import TheCard from '@/components/TheCard.vue'
import type { Category } from '@/types'

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
