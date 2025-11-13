<script lang="ts" setup>
import { useSettingStore } from '@/stores/settings'
import { useCardsStore } from '@/stores/cards'

type Category = 'actions' | 'animals' | 'emotions' | 'nature' | 'objects' | 'personas' | 'places'

const storeSettings = useSettingStore()
const storeCards = useCardsStore()
</script>

<template>
  <div class="flex lg:justify-center md:items-center overflow-x-auto scrollbar-hide gap-4">
    <button
      v-for="(card, index) in storeCards.selectedCards"
      :key="index"
      :class="[
        'bg-linear-to-br rounded-xl p-6 text-center',
        storeSettings.getCategoryColor(card.category as Category),
      ]"
      class="shrink-0"
      @click="storeCards.toggleCardSelection(card)"
    >
      <div class="text-white/70 text-sm font-semibold mb-1">{{ card.category }}</div>
      <div class="text-white text-2xl font-bold">{{ card.name }}</div>
    </button>
  </div>
</template>
