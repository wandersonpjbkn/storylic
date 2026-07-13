<script lang="ts" setup>
import BaseSlider from '@/components/BaseSlider.vue'

const timerTurn = defineModel<number>('timerTurn', { required: true })
const timerStory = defineModel<number>('timerStory', { required: true })
const turns = defineModel<number>('turns', { required: true })
</script>

<template>
  <BaseSlider
    v-model="timerTurn"
    title="Tempo para escolher cards"
    description="Quanto tempo cada jogador tem para montar a mão"
    :min="10"
    :max="60"
    :step="5"
  />
  <BaseSlider
    v-model="timerStory"
    title="Tempo para narrar"
    description="Quanto tempo cada jogador tem para contar seu trecho"
    :min="20"
    :max="120"
    :step="5"
  />
  <BaseSlider
    v-model="turns"
    title="Número de turnos"
    description="Quantas rodadas a história terá ao todo"
    :min="1"
    :max="10"
    :step="1"
  />
</template>
