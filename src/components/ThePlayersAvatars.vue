<script lang="ts" setup>
import { useSocketStore } from '@/stores/socket'

const storeSocket = useSocketStore()
</script>

<template>
  <label class="block text-white mb-3 text-lg">Jogadores</label>
  <div class="flex items-center overflow-x-auto scrollbar-hide gap-4">
    <img
      v-for="(item, i) of storeSocket.room"
      :key="item.id"
      :src="`https://avatar.iran.liara.run/username?username=${item.name}`"
      :alt="`Player ${i}`"
      class="shrink-0 w-16 h-16 rounded-full border-2 border-white/30"
    />
  </div>
</template>
