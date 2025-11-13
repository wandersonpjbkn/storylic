<script lang="ts" setup>
import { useSettingStore } from '@/stores/settings'
import { useCardsStore } from '@/stores/cards'

type Category = 'actions' | 'animals' | 'emotions' | 'nature' | 'objects' | 'personas' | 'places'

const storeSettings = useSettingStore()
const storeCards = useCardsStore()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <button
      v-for="(card, index) in storeCards.displayedCards"
      :key="index"
      :class="[
        'relative bg-linear-to-br rounded-2xl p-8 transition-all transform hover:scale-105',
        storeSettings.getCategoryColor(card.category as Category),
        storeCards.isCardSelected(card) ? 'ring-4 ring-white scale-105' : '',
      ]"
      @click="storeCards.toggleCardSelection(card)"
    >
      <div class="text-white/70 text-sm font-semibold mb-2">{{ card.category }}</div>
      <div class="text-white text-3xl font-bold mb-4">{{ card.name }}</div>
      <div
        v-if="storeCards.isCardSelected(card)"
        class="absolute top-4 right-4 bg-white text-purple-900 rounded-full w-8 h-8 flex items-center justify-center font-bold"
      >
        ✓
      </div>
    </button>
  </div>
</template>
