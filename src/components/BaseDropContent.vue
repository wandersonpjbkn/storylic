<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const {
  title,
  content,
  opened = false,
} = defineProps<{
  title: string
  content: string[]
  opened?: boolean
}>()

const isExpanded = ref(false)

const toggleRules = () => {
  isExpanded.value = !isExpanded.value
}

onMounted(() => {
  if (opened) isExpanded.value = true
})
</script>

<template>
  <div class="bg-white/5 rounded-xl p-6">
    <h3
      class="text-white font-semibold cursor-pointer select-none flex items-center justify-between"
      @click="toggleRules"
    >
      <span>{{ title }}</span>
      <span
        class="text-xl transition-transform ease-out duration-300"
        :class="{ 'rotate-180': isExpanded }"
        >▼</span
      >
    </h3>
    <ul v-show="isExpanded" class="text-white/80 space-y-2 text-sm mt-3">
      <template v-for="(text, index) in content" :key="index">
        <li v-html="text" />
      </template>
    </ul>
  </div>
</template>
