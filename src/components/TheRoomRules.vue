<script lang="ts" setup>
import { computed } from 'vue'

import BaseDropContent from './BaseDropContent.vue'

const data = computed(() => {
  return {
    title: '📖 FAQ',
    content: [
      `• Escolha um <strong>nome para a sala</strong> e convide amigos para jogar!`,
      `• Informe um <strong>apelido</strong> bacana pra ser reconhecido`,
      `• Monte <strong>a sua mão</strong> em poucos segundos antes que o tempo se esgote`,
      `• Conte rápido um <strong>trecho de história</strong> com os cards que escolheu`,
      `• Cria a <strong>história mais incrível</strong> que puder`,
      `• Escolha seus amigos, quem é a pessoa que melhor conta histórias`,
      `• É preciso aguardar o status de conexão estar em <strong>Conectado</strong> para jogar`,
    ],
  }
})
</script>

<template>
  <base-drop-content :title="data.title" :content="data.content" :opened="false" />
</template>
