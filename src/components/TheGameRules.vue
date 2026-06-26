<script lang="ts" setup>
import { computed } from 'vue'

import BaseDropContent from './BaseDropContent.vue'

import { useSettingStore } from '@/stores/settings'
import { useTimerStore } from '@/stores/timer'

const storeSettings = useSettingStore()
const storeTimer = useTimerStore()

const data = computed(() => {
  return {
    title: '📖 Regras do Jogo',
    content: [
      `• Você tem até <strong>${storeTimer.baseTimerTurn}s</strong> para escolher entre <strong>1 até 3</strong> cards`,
      `• Monte <strong>a sua mão</strong> com os cards que desejar`,
      `• Dê <strong>shuffle</strong> nos cards, para ver <strong>novas combinações</strong>`,
      `• Se o tempo acabar, sua mão será escolhida <strong>automaticamente</strong>`,
      `• Conte o seu trecho da história em até <strong>${storeTimer.baseTimerStory}s</strong>`,
      `• Tente incluir no seu trecho <strong>todos</strong> os cards que selecionou`,
      `• O jogo irá avançar sozinho se você não <strong>terminar a vez</strong>`,
      `• Ao todo, serão <strong>${storeSettings.turnMax} turnos</strong>`,
    ],
  }
})
</script>

<template>
  <base-drop-content :title="data.title" :content="data.content" />
</template>
