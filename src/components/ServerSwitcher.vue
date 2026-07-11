<script lang="ts" setup>
import { ref } from 'vue'

import { useSocketStore } from '@/stores/socket'

const storeSocket = useSocketStore()

const open = ref(false)
const localUrl = ref(storeSocket.isDefaultServer ? '' : storeSocket.serverUrl)

const useCloud = () => {
  storeSocket.setServerUrl('')
  open.value = false
}

const useLocal = () => {
  const url = localUrl.value.trim()
  if (!url) return
  storeSocket.setServerUrl(url)
  open.value = false
}
</script>

<template>
  <div
    class="rounded-2xl px-4 py-3"
    style="background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1)"
  >
    <button
      type="button"
      class="w-full flex items-center justify-between gap-2"
      @click="open = !open"
    >
      <span class="flex items-center gap-2">
        <span class="text-sm">📡</span>
        <span class="text-sm font-semibold text-white/80">Servidor</span>
        <span
          class="text-xs font-bold px-2 py-0.5 rounded-full"
          :style="
            storeSocket.isDefaultServer
              ? 'background:rgba(99,102,241,0.22);color:#c7d2fe'
              : 'background:rgba(245,158,11,0.2);color:#fcd34d'
          "
        >
          {{ storeSocket.isDefaultServer ? 'Nuvem' : 'Local' }}
        </span>
      </span>
      <span class="text-white/40 text-xs">{{ open ? 'fechar' : 'trocar' }}</span>
    </button>

    <div v-if="open" class="mt-3 flex flex-col gap-2">
      <p class="text-xs" style="color: rgba(255, 255, 255, 0.4)">
        Sem internet no local? Um notebook do grupo pode rodar o servidor na rede Wi-Fi e todos
        conectam pelo IP dele.
      </p>

      <button
        type="button"
        class="sl-btn-ghost w-full py-2.5 text-sm"
        :style="storeSocket.isDefaultServer ? 'border-color:rgba(99,102,241,0.5)' : ''"
        @click="useCloud"
      >
        Usar nuvem (padrão)
      </button>

      <div class="flex gap-2">
        <input
          v-model="localUrl"
          type="text"
          placeholder="http://192.168.0.10:3000"
          autocapitalize="none"
          autocorrect="off"
          spellcheck="false"
          inputmode="url"
          class="flex-1 px-3 py-2.5 rounded-xl bg-white/10 text-white text-sm border border-white/20 focus:border-white/50 focus:outline-none placeholder-white/30"
        />
        <button
          type="button"
          class="sl-btn-ghost px-4 py-2.5 text-sm shrink-0"
          :disabled="!localUrl.trim()"
          @click="useLocal"
        >
          Conectar
        </button>
      </div>
    </div>
  </div>
</template>
