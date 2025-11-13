<script lang="ts" setup>
import Users from '@/assets/icons/Users.vue'

import { useSocketStore } from '@/stores/socket'

const storeSocket = useSocketStore()

const { hasIcon = true } = defineProps<{
  hasIcon?: boolean
}>()
</script>

<template>
  <div class="flex justify-center gap-3">
    <Users v-if="hasIcon" />
    <span class="text-white text-xl font-semibold">Jogador [ {{ storeSocket.myPlayerName }} ]</span>
  </div>
</template>
