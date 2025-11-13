<script lang="ts" setup>
import Users from '@/assets/icons/Users.vue'

import { useSocketStore } from '@/stores/socket'

const storeSocket = useSocketStore()
</script>

<template>
  <div class="flex justify-center gap-3">
    <Users class="text-white" />
    <span class="text-white text-xl font-semibold">Jogador [ {{ storeSocket.myPlayerName }} ]</span>
  </div>
</template>
