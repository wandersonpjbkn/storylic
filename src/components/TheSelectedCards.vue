<script lang="ts" setup>
import TheCard from './TheCard.vue'
import { useCardsStore } from '@/stores/cards'

type Category = 'actions' | 'animals' | 'emotions' | 'nature' | 'objects' | 'personas' | 'places'

const props = withDefaults(defineProps<{ readonly?: boolean }>(), { readonly: false })

const storeCards = useCardsStore()
</script>

<template>
  <div>
    <p class="sl-label mb-2">Sua mão</p>
    <div class="flex gap-3 p-3 overflow-x-auto pb-1 scrollbar-hide">
      <TheCard
        v-for="card in storeCards.selectedCards"
        :key="card.name"
        :name="card.name"
        :category="card.category as Category"
        :selected="true"
        :compact="true"
        :readonly="props.readonly"
        @click="!props.readonly && storeCards.toggleCardSelection(card)"
      />
    </div>
  </div>
</template>
