<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'

import TheNotification from '@/components/TheNotification.vue'

import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'
import { useCardsStore } from '@/stores/cards'
import { initNavigator } from '@/composables/useNavigator'

const router = useRouter()
const storeSocket = useSocketStore()
const storeSettings = useSettingStore()
const storeCards = useCardsStore()

initNavigator(router)

onMounted(() => {
  storeSocket.connectToServer()
  storeCards.initializeDeck()
})

onUnmounted(() => {
  if (storeSocket.socket) storeSocket.socket.disconnect()
  storeSettings.stopTimerTurn()
})
</script>

<template>
  <div
    class="sl-root min-h-screen"
    style="
      padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px)
        env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
    "
  >
    <div class="max-w-lg mx-auto px-4 pt-6 pb-10">
      <router-view />
    </div>
  </div>

  <Teleport to="body">
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="storeSocket.isReconnecting"
        class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
        style="background: rgba(30, 10, 60, 0.88); backdrop-filter: blur(10px)"
      >
        <div
          class="w-12 h-12 border-4 border-white/20 border-t-pink-400 rounded-full animate-spin"
        />
        <p class="text-white text-lg font-bold">Reconectando...</p>
        <p style="color: rgba(255, 255, 255, 0.5)" class="text-sm">
          Verificando sua sessão anterior
        </p>
      </div>
    </transition>
  </Teleport>

  <the-notification />
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;0,900;1,400&display=swap');

:root {
  /* Fundo — gradiente indigo→purple→pink igual ao original */
  --sl-bg-from: #312e81;
  --sl-bg-via: #581c87;
  --sl-bg-to: #831843;

  /* Superfícies — vidro sobre o gradiente */
  --sl-glass: rgba(255, 255, 255, 0.1);
  --sl-glass-hover: rgba(255, 255, 255, 0.15);
  --sl-glass-2: rgba(255, 255, 255, 0.06);
  --sl-border: rgba(255, 255, 255, 0.18);
  --sl-border-soft: rgba(255, 255, 255, 0.1);

  /* Texto — sempre legível sobre o gradiente escuro */
  --sl-text: #ffffff;
  --sl-text-2: rgba(255, 255, 255, 0.8);
  --sl-text-3: rgba(255, 255, 255, 0.5);

  /* Paleta de acento */
  --sl-pink: #ec4899;
  --sl-purple: #a855f7;
  --sl-indigo: #6366f1;
  --sl-amber: #f59e0b;
  --sl-orange: #f97316;
  --sl-green: #22c55e;

  /* Botão primário — pink→purple */
  --sl-btn-grad: linear-gradient(135deg, #ec4899, #a855f7);
  --sl-btn-shadow: 0 4px 16px rgba(168, 85, 247, 0.4);

  /* Botão de confirmação — amber→pink */
  --sl-btn-confirm-grad: linear-gradient(135deg, #f59e0b, #ec4899);
  --sl-btn-confirm-shadow: 0 4px 14px rgba(236, 72, 153, 0.35);
}

html,
body {
  margin: 0 !important;
  padding: 0 !important;
  overflow: auto;
  -webkit-tap-highlight-color: transparent;
  font-family: 'Montserrat', system-ui, sans-serif;
  color: var(--sl-text);
}

button {
  cursor: pointer;
}
#app {
  position: relative;
}

.sl-root {
  background: linear-gradient(
    135deg,
    var(--sl-bg-from) 0%,
    var(--sl-bg-via) 50%,
    var(--sl-bg-to) 100%
  );
  background-attachment: fixed;
}

/* ── Superfície vidro ──────────────────────────────────────────────────── */
.sl-surface {
  background: var(--sl-glass);
  border: 1px solid var(--sl-border);
  border-radius: 16px;
  backdrop-filter: blur(4px);
}

/* ── Tipografia ────────────────────────────────────────────────────────── */
.sl-label {
  color: var(--sl-text-3);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

/* ── Botão primário ────────────────────────────────────────────────────── */
.sl-btn {
  display: block;
  width: 100%;
  border: none;
  border-radius: 14px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: #fff;
  background: var(--sl-btn-grad);
  box-shadow: var(--sl-btn-shadow);
  transition:
    opacity 0.15s,
    transform 0.1s;

  &:active:not(:disabled) {
    transform: scale(0.97);
  }
  &:hover:not(:disabled) {
    opacity: 0.92;
  }
  &:disabled {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.28);
    box-shadow: none;
    cursor: not-allowed;
  }
}

/* ── Botão confirmar ───────────────────────────────────────────────────── */
.sl-btn-confirm {
  display: block;
  width: 100%;
  border: none;
  border-radius: 14px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: #fff;
  background: var(--sl-btn-confirm-grad);
  box-shadow: var(--sl-btn-confirm-shadow);
  transition:
    opacity 0.15s,
    transform 0.1s;

  &:active {
    transform: scale(0.97);
  }
  &:hover {
    opacity: 0.92;
  }
}

/* ── Botão secundário ──────────────────────────────────────────────────── */
.sl-btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--sl-border);
  border-radius: 14px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: var(--sl-text-2);
  background: var(--sl-glass);
  transition:
    background 0.15s,
    transform 0.1s;

  &:active {
    transform: scale(0.97);
  }
  &:hover {
    background: var(--sl-glass-hover);
  }
}

/* ── Scrollbar oculta ──────────────────────────────────────────────────── */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
