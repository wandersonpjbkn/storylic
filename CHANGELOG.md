# Changelog — Storylic (frontend)

Histórico de mudanças concluídas. Os docs em `src/docs/` descrevem só o **estado
atual**; o que **mudou** e por quê mora aqui.

## 2026-07-12 — CSP (zero inline styles), fontes self-hosted, GTM condicional, diretriz SOLID/DRY

- **Fix (achado na verificação em modo LAN real, servido pelo `storylic-api`
  com `PUBLIC_DIR` sob a CSP estrita):**
  - `favicon.svg` (renderizado inline via `BaseIcon`, então sujeito a
    `style-src`) e `public/mask-icon.svg` tinham gradientes com
    `<stop style="stop-color:...">` — violava a CSP sem `unsafe-inline`.
    Trocado por atributos de apresentação SVG (`stop-color`/`stop-opacity`),
    mesma técnica já usada na barra do `TheTimer`.
  - `isLanMode()` (`stores/socket.ts`) só detectava troca **em runtime** de
    servidor (`ServerSwitcher`); no deploy real de clube (`PUBLIC_DIR`), o
    build já nasce com a URL do servidor local como **padrão** — nunca há
    "troca", então o sinal ficava sempre falso e o GTM carregava (e era
    bloqueado pela CSP, com erro no console). Corrigido: `isLanMode()` agora
    também é `true` quando a origem da página coincide com a origem do
    servidor padrão do build (o cenário exato do `PUBLIC_DIR`, onde o mesmo
    processo serve front e back).
- **CSP / zero inline styles:** todo `style=`/`:style=` de `src/` (~74 usos)
  virou classe Tailwind ou `.sl-*`. Os 3 casos genuinamente contínuos ganharam
  cada um sua solução sem inline style: `TheTimer` (largura da barra é
  atributo SVG), `AvatarInitials` (paleta fixa de 12 cores por hash em vez de
  HSL contínuo), `TheNotification` (classes `.sl-duration-N` geradas por
  passo de 1s em vez de custom property `--duration`). `TheCard` (cores por
  categoria) recebeu o mesmo tratamento por extensão, com uma classe
  `.sl-card--<categoria>` por categoria.
- **Fontes self-hosted:** Montserrat variável (400–900) servida de
  `src/assets/fonts/`; removidos os dois `@import` redundantes de
  `fonts.googleapis.com` (um em `App.vue`, outro em `_fonts.scss`, carregando
  a mesma família duas vezes). Pixelify Sans (nunca referenciada em nenhum
  `font-family`) foi removida em vez de self-hospedada.
- **GTM condicional ao modo LAN:** `main.ts` só carrega o GTM fora do modo
  LAN (`isLanMode()`, mesmo sinal de `loadServerUrl()` que já distingue
  nuvem de local) — antes dependia só de `import.meta.env.PROD`.
- **DRY:** `useRoomConfigForm` (composable) + `RoomConfigSliders` (componente)
  substituem a lógica/markup de configuração de sala duplicada entre
  `ConfigView` e `RoomManageModal`; `ConnectionStatus` substitui o indicador
  de conexão duplicado 3x entre `SetupView` e `RoomsView`.
- **DIP:** `RoomsView`/`WaitingView` paravam de tocar `storeSocket.socket`
  diretamente — a store `socket` passou a expor `rooms`/`emitGetRooms`. Uma
  chamada solta `storeSocket.socket?.off(ON_PLAYER_SELECTED_CARDS)` em
  `WaitingView` removia sem querer o listener **permanente** da própria store
  (registrado uma vez em `connectToServer`) — bug real, não só estilo:
  depois de visitar `WaitingView`, cartas reveladas por outros jogadores
  paravam de atualizar `selectedCards` pelo resto da sessão. Removida.
  `SetupView`/`router/index.ts` também paravam de ler `sessionStorage` cru —
  usam `storeSocket.activeSession`.
- **Limpeza:** `TheSelectedCards.vue`/`TheDisplayedCards.vue` (nunca
  importados) removidos; 4 ícones não usados (`clock`/`home`/`success`/
  `users`) removidos do tipo `UIcons` e do `assets/icons/`; comentários em
  português fora de `__tests__/` traduzidos para inglês;
  `stores/socket.ts:435`'s leftover `console.log` de debug removido;
  `connect_error` do Socket.io ganhou entrada no enum `SocketEvents`
  (`ON_CONNECT_ERROR`) em vez de string crua.
- **Docs:** novas seções `## Sem duplicação (DRY)` e `## SOLID` em
  `CONVENTIONS.md`; `ARCHITECTURE.md` documenta a exceção de navegação
  client-side do `ConfigView`; `DESIGN_SYSTEM.md` descreve o esquema
  baseado em classes de `TheTimer`/`AvatarInitials`/`TheNotification`/
  `TheCard`.

## 2026-07-12 — Dono da sala, remoção de jogador, link de convite

- **Fix:** o ícone SVG (`favicon.svg` e outros) "estourava" o container do
  `BaseIcon` em vez de escalar — o `vite-svg-loader` (SVGO) removia o
  `viewBox` sempre que ele batia com `width`/`height` do arquivo fonte.
  Corrigido desligando `removeViewBox` na config do `svgLoader()`.
- **Fix:** overlay "Acordando o servidor…" ficava preso num loading eterno em
  falhas persistentes (ex.: CORS mal configurado na API) — tratava qualquer
  `connect_error` como cold-start, retry infinito, mesma mensagem pra sempre.
  Nova fase `stuck` (após ~13 tentativas) troca a mensagem e expõe o
  `ServerSwitcher` direto no overlay.
- **Dono da sala:** `isOwner` agora vem do servidor (`join-ack`/`rejoin-ack`) e
  é estável por toda a vida da sala. ConfigView só aparece na criação; ajustes
  depois (timers/turnos, sempre no lobby) e remoção de jogador (lobby ou
  mid-jogo) ficam no novo painel `RoomManageModal` — botão flutuante visível
  só ao dono.
- **Link de convite:** rota `/join/:gameId` pula lista de salas e ID manual,
  vai direto pro nome. Botão "copiar link" no lobby (só dono).
- **Sair da sala / remover jogador** ganharam confirmação explícita
  (`BaseConfirmModal` `danger`) avisando que a ação é definitiva.
- **Reordenação e cronômetro no rejoin:** resolvidos no `storylic-api` —
  reconectar preserva a posição na fila de turnos e reinicia o cronômetro
  pela duração cheia (não mais o tempo real restante, que podia estar quase
  zerado).
- `BaseSlider`'s `.sl-slider` CSS movido de `ConfigView.vue` (onde só
  funcionava por acidente de escopo — CSS `scoped` de um componente pai não
  alcança elementos internos de um componente filho) para dentro do próprio
  `BaseSlider.vue`, já que agora é reusado também no `RoomManageModal`.

## 2026-07 — Suíte de segurança local

- **`yarn security`** (rápido): auditoria de CVEs de deps de produção +
  `eslint-plugin-security` no `yarn lint`.
- **`yarn security:deep`** (`scripts/codeql-scan.sh`): CodeQL local — mesmo motor e
  suite `security-extended` do check do GitHub. Sem CI.
- **CVEs de dependência corrigidos via `resolutions`:** `ws`, `unhead`, `defu`,
  `postcss`, `socket.io-parser` → auditoria de produção zerada. `ts`/`build`/`test`
  (42) seguem verdes com as versões novas.

## 2026-07 — Acessibilidade, heurísticas e UX laws

Pass de a11y mapeado a WCAG 2.2 AA (ver `src/docs/UX_REVIEW.md`):

- **Semântica SR:** `BaseIcon` com `label`→`role=img` / sem→`aria-hidden` (e
  remoção de um `console.log` esquecido); `TheCard` toggle com `aria-pressed` +
  `aria-label`; `AvatarInitials` decorativo; botões só-ícone rotulados; busca das
  salas rotulada.
- **Live regions:** `TheNotification` (`alert`/`status`), overlays e status do
  servidor anunciados; `TheTimer` deixa de ler cada segundo (anúncio por fase).
- **Foco/teclado:** `BaseConfirmModal` com trap de foco, Escape, foco inicial e
  retorno; anel `:focus-visible` global (`--sl-focus`).
- **Movimento:** suporte a `prefers-reduced-motion`.
- **Estrutura:** landmark `<main>`, utilitário `.sr-only`.
- **Contraste:** `--sl-text-3` 50%→70% e hints informativos elevados a AA.
- **Prevenção de erro:** submit vazio do join marca `aria-invalid` e foca o campo.
- **Testes:** +11 (BaseConfirmModal, TheNotification, BaseIcon; TheCard estendido)
  → 42 no total.

## 2026-07 — Resiliência de rede, modo local e testes

### Resiliência / mobile

- Cronômetros migrados de contador decrescente para **deadline absoluto**
  (`stores/timer.ts`), imunes ao congelamento de `setInterval` em segundo plano;
  novo `syncFromDeadline` chamado no `visibilitychange`/`online`.
- `stores/socket.ts`: reconexão afinada, `connectionPhase` (cold start),
  `resyncConnection`, reenvio de `finish-storytelling` e `cards-selected`.
- `App.vue`: overlay "Acordando o servidor…"/"Sem conexão"; backdrop fixo via
  pseudo-elemento (remove jank do Safari mobile); `100dvh`.
- `index.html`: `viewport-fit=cover` (safe-area do notch passa a valer).
- `TheNotification.vue`: toast responsivo/centralizado no mobile.
- Correção: `BaseSlider` lia `descr` enquanto `ConfigView` passava `description`
  → descrições sumidas e build quebrado; prop padronizada para `description`.

### Modo local (LAN)

- URL do servidor configurável em runtime (`setServerUrl`, `localStorage`) e novo
  componente `ServerSwitcher` (seletor Nuvem/Local na tela inicial).

### Qualidade

- Suíte de testes **Vitest + @vue/test-utils + jsdom** (31 testes co-locados em
  `__tests__/`), inspirada no padrão do projeto `purple-website`.
- `eslint-plugin-sonarjs` (regras `recommended`) no `eslint.config.js`, com
  relaxamentos por regra e justificados. `resolutions` de `typescript`/`vite` para
  deduplicar e destravar SonarJS/Vitest.
- Sistema de docs vivas (`CLAUDE.md` + `src/docs/`).
