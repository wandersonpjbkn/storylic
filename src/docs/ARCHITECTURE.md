# Architecture — Storylic (frontend)

> Estado real do repositório. Relacionados: [`CONTENT_MODEL`](CONTENT_MODEL.md) ·
> [`DESIGN_SYSTEM`](DESIGN_SYSTEM.md). Histórico: [`CHANGELOG`](../../CHANGELOG.md).

## Stack ✅

- **Vue 3.5** (Composition API, `<script setup>`), **Vite 7**, **TypeScript**.
- **Pinia** + `pinia-plugin-persistedstate` para estado; **vue-router** para rotas.
- **socket.io-client** para o tempo real (a API é o repo `storylic-api`).
- **Tailwind v4** (via `@tailwindcss/vite`) + SCSS (`src/assets/scss`).
- **PWA** via `vite-plugin-pwa` (`registerType: autoUpdate`, precache do shell) —
  o site abre offline se já foi carregado uma vez.

## Camadas ✅

- **`main.ts`** — monta o app, registra Pinia/head/GTM e os globais `BaseIcon`/`BaseSlider`.
- **`App.vue`** — no `onMounted` chama `storeSocket.connectToServer()` e
  `storeCards.initializeDeck()`; hospeda os overlays de reconexão/cold-start e as
  notificações.
- **`views/*`** — uma view por estado de jogo (ver máquina de estados).
- **`components/*`** — UI reutilizável (`TheCard`, `TheTimer`, `BaseSlider`, …).
- **`stores/*`** — a lógica de aplicação (abaixo).
- **`composables/*`** — utilidades puras (`useUtils`, `useNavigator`, `useSeo`, …).
- **`data/categories/*.json`** — o baralho (ver `CONTENT_MODEL`).

## Stores (Pinia) ✅

- **`socket`** — dono da conexão: cria o socket, registra todos os listeners,
  guarda a sessão (`sessionStorage`), expõe os `emit*` (incl.
  `emitKickPlayer`), o `isOwner`, a `connectionPhase` (cold start), o
  `setServerUrl` (nuvem ↔ LAN) e o `resyncConnection`. Sair da sala
  (`emitLeaveGame`) e remover jogador (`emitKickPlayer`) são ações
  permanentes — sempre atrás de um `BaseConfirmModal` (`danger`) na UI.
- **`settings`** — `gameState`, `numPlayers`, `playerName`, `turnCurrent/Max`;
  orquestra o fluxo de turno no cliente (`startGame`, `finishTurn`, resets).
- **`cards`** — baralho embaralhado, mão exibida/selecionada, `dealCards`, `shuffle`.
- **`timer`** — cronômetros de cards e narração, **baseados em deadline** (imunes
  ao congelamento de `setInterval` em segundo plano); `syncFromDeadline` recalcula
  ao voltar o foco.
- **`global`** — a fila de notificações (toast).

Para evitar import circular, `settings` recebe callbacks (`setNavigateCallback`,
`setTurnAutoFinishedCallback`) injetados pelo `socket` store.

## Roteamento ✅

`router/index.ts` tem uma rota por estado; `composables/useNavigator.ts` mapeia
`GameState → nome de rota` (`navigateTo`). O `beforeEach` protege as rotas de jogo
(exige sessão ativa ou estado coerente). A navegação é majoritariamente dirigida
pelo servidor: eventos de socket chamam `navigate(state)`. **Exceção:**
`ConfigView.vue` navega para o lobby direto no cliente ao confirmar — é uma
transição local do dono (nenhum outro jogador vê a `ConfigView`), sem necessidade
de um round-trip ao servidor só para trocar de tela.

## Máquina de estados ✅

`rooms → setup → (config | lobby) → playing → [waiting] → storytelling → ended`

- **rooms** (rota raiz `/`) lista salas ativas; **setup** entra numa sala
  (direto, por link de convite `/join/:gameId`, ou por ID digitado); **config**
  (só o **dono**, e só na **criação** da sala — nunca de novo depois, nem em
  "jogar de novo") define timers/turnos; **lobby** aguarda e inicia. Durante a
  partida, cada cliente alterna localmente entre **playing** (monta a mão),
  **storytelling** (narra) e **waiting** (vez de outro).
- O **servidor** só distingue `lobby | playing | ended`; waiting/storytelling são
  distinções locais do cliente (ver `storylic-api`).
- **Dono da sala:** `isOwner` (store `socket`) vem do servidor em `join-ack`
  (`isCreator`) e `rejoin-ack` (`isOwner`) — nunca inferido no cliente, e
  estável através de reconexão. Depois da criação, o dono ajusta config e
  remove jogadores pelo painel `RoomManageModal` (botão flutuante em
  `App.vue`, visível em qualquer estado de sala ativa — kick funciona lobby
  e mid-jogo, reconfigurar só no lobby).

## Conexão e resiliência ✅

- `io(serverUrl, { reconnection, reconnectionDelay, timeout })` — tentativas
  rápidas e infinitas para o cold start do Render.
- Ao `connect`, se há sessão salva, emite `rejoin-game` automaticamente.
- **`connectionPhase`** (`online | offline | waking | connecting | stuck`) alimenta
  o overlay "Acordando o servidor…" / "Sem conexão". Após `STUCK_THRESHOLD`
  (~13) tentativas falhas sem sucesso, vira `stuck`: a mensagem admite que algo
  está errado (em vez de insistir que "já já acorda") e expõe o
  `ServerSwitcher` direto no overlay, para o jogador poder trocar de servidor
  sem ficar preso num loading eterno.
- **`visibilitychange`/`online`** forçam reconexão imediata e `syncFromDeadline`.
- **URL do servidor configurável em runtime** (`setServerUrl`, `localStorage`):
  alterna entre a nuvem e um servidor local (modo LAN). Ver `PROJECT_STATE`.
- A autoridade do turno é do **servidor** (watchdog) — o cliente é o mostrador.
