<script lang="ts" setup>
import { ref } from 'vue'

import { useSettingStore } from '@/stores/settings'

const storeSettings = useSettingStore()

const isExpanded = ref(false)

const toggleRules = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="bg-white/5 rounded-xl p-6 mb-8">
    <h3
      class="text-white font-semibold cursor-pointer select-none flex items-center justify-between"
      @click="toggleRules"
    >
      <span>📖 Regras do Jogo</span>
      <span
        class="text-xl transition-transform ease-out duration-300"
        :class="{ 'rotate-180': isExpanded }"
        >▼</span
      >
    </h3>
    <ul v-show="isExpanded" class="text-white/80 space-y-2 text-sm mt-3">
      <li>
        • Você tem até <strong>{{ storeSettings.baseTimerTurn }}s</strong> para escolher entre
        <strong>1 até 3</strong> cards
      </li>
      <li>• Monte a sua mão com os cards que desejar</li>
      <li>• Dê <strong>shuffle</strong> nos cards, para ver novas combinações</li>
      <li>
        • Conte o seu trecho da história em até
        <strong>{{ storeSettings.baseTimerStory }}s</strong>
      </li>
      <li>• O trecho que contar <strong>deve</strong> conter todos os cards que selecionou</li>
      <li>
        • Ao todo, serão <strong>{{ storeSettings.turnMax }} turnos</strong>
      </li>
    </ul>
  </div>
</template>
