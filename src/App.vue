<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'

import TheNotification from '@/components/TheNotification.vue'
import ServerSwitcher from '@/components/ServerSwitcher.vue'
import RoomManageModal from '@/components/RoomManageModal.vue'

import { useSocketStore } from '@/stores/socket'
import { useSettingStore } from '@/stores/settings'
import { useCardsStore } from '@/stores/cards'
import { useTimerStore } from '@/stores/timer'
import { initNavigator } from '@/composables/useNavigator'
import { SocketEvents } from '@/constants/socketEvents'

const router = useRouter()
const storeSocket = useSocketStore()
const storeSettings = useSettingStore()
const storeCards = useCardsStore()
const storeTimer = useTimerStore()

initNavigator(router)

const showManageModal = ref(false)

// Manage-room button: only the owner sees it, and only while a room is
// active — ConfigView already covers the 1st-time setup, and
// RoomsView/SetupView/EndedView have no ongoing room to manage.
const roomManageableStates: string[] = [
  SocketEvents.STATE_LOBBY,
  SocketEvents.STATE_PLAYING,
  SocketEvents.STATE_WAITING,
  SocketEvents.STATE_STORYTELLING,
]
const canManageRoom = computed(
  () => storeSocket.isOwner && roomManageableStates.includes(storeSettings.gameState),
)

// Cold-start (Render free tier) / network-down overlay. Only shows up after
// a few failed attempts, so it doesn't flicker on a fast connection.
const connectionOverlay = computed(() => {
  if (storeSocket.isReconnecting) return null
  if (storeSocket.connectionPhase === 'offline') {
    return {
      title: 'Sem conexão de rede',
      subtitle: 'Verifique o Wi-Fi ou os dados móveis. Reconectando sozinho…',
      showServerSwitcher: false,
    }
  }
  if (storeSocket.connectionPhase === 'waking') {
    return {
      title: 'Acordando o servidor…',
      subtitle: 'No primeiro acesso o servidor gratuito pode levar até ~1 min para ligar.',
      showServerSwitcher: false,
    }
  }
  if (storeSocket.connectionPhase === 'stuck') {
    return {
      title: 'Não foi possível conectar',
      subtitle: 'Isso está demorando mais que o normal. Continuamos tentando sozinhos, mas você também pode trocar de servidor abaixo.',
      showServerSwitcher: true,
    }
  }
  return null
})

onMounted(() => {
  storeSocket.connectToServer()
  storeCards.initializeDeck()
})

onUnmounted(() => {
  if (storeSocket.socket) storeSocket.socket.disconnect()
  storeTimer.stopTimerTurn()
})
</script>

<template>
  <div class="sl-root min-h-screen">
    <main class="max-w-lg mx-auto px-4 pt-6 pb-10">
      <router-view />
    </main>
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
        class="sl-reconnect-overlay fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
        role="status"
        aria-live="polite"
      >
        <div
          class="w-12 h-12 border-4 border-white/20 border-t-pink-400 rounded-full animate-spin"
          aria-hidden="true"
        />
        <p class="text-white text-lg font-bold">Reconectando...</p>
        <p class="text-white/50 text-sm">Verificando sua sessão anterior</p>
      </div>
    </transition>
  </Teleport>

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
        v-if="connectionOverlay"
        class="sl-connection-overlay fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 px-8 text-center"
        role="status"
        aria-live="polite"
      >
        <div
          class="w-12 h-12 border-4 border-white/20 border-t-pink-400 rounded-full animate-spin"
          aria-hidden="true"
        />
        <p class="text-white text-lg font-bold">{{ connectionOverlay.title }}</p>
        <p class="text-white/[0.55] text-sm max-w-xs">
          {{ connectionOverlay.subtitle }}
        </p>
        <ServerSwitcher v-if="connectionOverlay.showServerSwitcher" class="w-full max-w-xs" />
      </div>
    </transition>
  </Teleport>

  <button
    v-if="canManageRoom"
    type="button"
    class="sl-manage-fab fixed z-30 flex items-center justify-center rounded-full shadow-lg w-12 h-12 right-4"
    aria-label="Gerenciar sala"
    @click="showManageModal = true"
  >
    <span class="text-xl" aria-hidden="true">⚙️</span>
  </button>

  <RoomManageModal v-if="showManageModal" @close="showManageModal = false" />

  <the-notification />
</template>

<style lang="scss">
// Montserrat is self-hosted via src/assets/scss/modules/_fonts.scss
// (imported globally through main.scss), not re-declared here.

:root {
  /* Background — indigo→purple→pink gradient, same as the original */
  --sl-bg-from: #312e81;
  --sl-bg-via: #581c87;
  --sl-bg-to: #831843;

  /* Surfaces — glass over the gradient */
  --sl-glass: rgba(255, 255, 255, 0.1);
  --sl-glass-hover: rgba(255, 255, 255, 0.15);
  --sl-glass-2: rgba(255, 255, 255, 0.06);
  --sl-border: rgba(255, 255, 255, 0.18);
  --sl-border-soft: rgba(255, 255, 255, 0.1);

  /* Text — always legible over the dark gradient.
     --sl-text-3 uses 0.7 (not 0.5) so labels/hints pass WCAG AA contrast
     over the glass; below that, informative text failed AA. */
  --sl-text: #ffffff;
  --sl-text-2: rgba(255, 255, 255, 0.8);
  --sl-text-3: rgba(255, 255, 255, 0.7);

  /* Visible focus ring (keyboard) — light pink, legible over the gradient. */
  --sl-focus: #f9a8d4;

  /* Accent palette */
  --sl-pink: #ec4899;
  --sl-purple: #a855f7;
  --sl-indigo: #6366f1;
  --sl-amber: #f59e0b;
  --sl-orange: #f97316;
  --sl-green: #22c55e;

  /* Primary button — pink→purple */
  --sl-btn-grad: linear-gradient(135deg, #ec4899, #a855f7);
  --sl-btn-shadow: 0 4px 16px rgba(168, 85, 247, 0.4);

  /* Confirm button — amber→pink */
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

/* ── Visible keyboard focus (WCAG 2.4.7) ────────────────────────────────────
   Buttons' :active/hover left no trace for keyboard navigation. */
:focus-visible {
  outline: 3px solid var(--sl-focus);
  outline-offset: 2px;
}
/* Drop the outline only for pointer users (keeps it for keyboard). */
:focus:not(:focus-visible) {
  outline: none;
}

/* ── Content for screen readers only ───────────────────────────────────────
   Visible to assistive technology, invisible on screen. */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ── Respect prefers-reduced-motion (WCAG 2.3.3) ───────────────────────────
   Neutralizes spinner, pulse, progress bar and transforms for anyone who
   asks for less motion. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}

.sl-root {
  position: relative;
  min-height: 100dvh;
  padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px)
    env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
}

.sl-reconnect-overlay {
  background: rgba(30, 10, 60, 0.88);
  backdrop-filter: blur(10px);
}

.sl-connection-overlay {
  background: rgba(30, 10, 60, 0.9);
  backdrop-filter: blur(10px);
}

.sl-manage-fab {
  bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
  background: rgba(30, 10, 60, 0.85);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(6px);
}

/* Fixed backdrop via pseudo-element — avoids the `background-attachment:
   fixed` jank on Safari mobile and covers the notch / URL bar area. */
.sl-root::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  background: linear-gradient(
    135deg,
    var(--sl-bg-from) 0%,
    var(--sl-bg-via) 50%,
    var(--sl-bg-to) 100%
  );
}

/* ── Glass surface ─────────────────────────────────────────────────────── */
.sl-surface {
  background: var(--sl-glass);
  border: 1px solid var(--sl-border);
  border-radius: 16px;
  backdrop-filter: blur(4px);
}

/* ── Typography ────────────────────────────────────────────────────────── */
.sl-label {
  color: var(--sl-text-3);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

/* ── Primary button ────────────────────────────────────────────────────── */
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

/* ── Confirm button ────────────────────────────────────────────────────── */
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

/* ── Secondary button ──────────────────────────────────────────────────── */
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

/* ── Hidden scrollbar ──────────────────────────────────────────────────── */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
