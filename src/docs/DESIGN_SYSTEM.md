# Design System — Storylic (frontend)

> Estado real do repositório (tokens e componentes observados no código).
> Histórico: [`CHANGELOG`](../../CHANGELOG.md).

## Fundação ✅

- **Identidade:** vidro (glassmorphism) sobre um gradiente escuro
  indigo → roxo → rosa. Fonte **Montserrat** (self-hosted, variável 400–900,
  `src/assets/fonts/` — sem `@import` de `fonts.googleapis.com`).
- **Backdrop:** o gradiente vive num pseudo-elemento `.sl-root::before` fixo
  (evita o jank de `background-attachment: fixed` no Safari mobile); altura em
  `100dvh`; `viewport-fit=cover` para respeitar o safe-area do notch.

## Tokens `--sl-*` ✅

Definidos em `App.vue` (`:root`):

- **Fundo:** `--sl-bg-from #312e81`, `--sl-bg-via #581c87`, `--sl-bg-to #831843`.
- **Superfícies (vidro):** `--sl-glass`, `--sl-glass-hover`, `--sl-glass-2`,
  bordas `--sl-border` / `--sl-border-soft`.
- **Texto:** `--sl-text` (#fff), `--sl-text-2` (80%), `--sl-text-3` (50%).
- **Acentos:** `--sl-pink #ec4899`, `--sl-purple #a855f7`, `--sl-indigo #6366f1`,
  `--sl-amber`, `--sl-orange`, `--sl-green`.
- **Botões:** `--sl-btn-grad` (pink→purple), `--sl-btn-confirm-grad` (amber→pink),
  com suas sombras.

## Primitivos de UI ✅

- **`.sl-surface`** — cartão de vidro (blur + borda).
- **`.sl-btn`** / **`.sl-btn-confirm`** / **`.sl-btn-ghost`** — os três caminhos de
  botão; `:active` faz `scale(0.97)` (feedback tátil mobile).
- **`.sl-label`** — rótulo em caixa alta, 10px, tracking largo.

## Componentes-chave ✅

- **`TheCard`** — carta 2:3; 60% imagem (círculo cropado sobre gradiente da
  categoria) + 40% banner com rótulo e nome; estados `selected` (ring + check),
  `disabled`, `compact`, `readonly`. Cores/rótulos por categoria: uma classe
  modificadora `.sl-card--<categoria>` por categoria (`--card-bg`/
  `--card-cat-color` como custom properties), nunca `:style` — CSP-safe sob
  `style-src` estrito.
- **`TheTimer`** — número + barra; três fases por proporção restante:
  **calm** (>50%, verde), **warning** (>25%, laranja), **critical** (≤25%,
  vermelho, pulsa), aplicadas via classe `.sl-timer--<fase>` (não `:style`).
  Recebe `value`/`base`/`label`. A barra é um `<svg>` com `<rect>`s — a
  largura (única grandeza genuinamente contínua) é atributo `width` do SVG,
  não propriedade `style` (SVG não é coberto por `style-src`).
- **`BaseSlider`** — usa `v-model` (`defineModel`); props `title`, **`description`**,
  `min`/`max`/`step`. (A prop é `description` — ver regressão em `TESTING`.)
- **`RoomConfigSliders`** — o trio `BaseSlider` (tempo de cards/narração/
  turnos) compartilhado por `ConfigView` e `RoomManageModal`.
- **`AvatarInitials`** — iniciais + cor por hash do nome, determinística —
  índice fixo (`hash % 12`) numa paleta de 12 cores geradas via `@for` do
  SCSS (`.sl-avatar-color-0`..`11`), não um HSL contínuo computado em
  `:style`.
- **`TheNotification`** — toast responsivo (centralizado no mobile, canto no
  desktop) com barra de progresso. Duração da barra por classe
  `.sl-duration-<ms>` (gerada em passos de 1s via `@for`), não custom
  property `--duration` via `:style`.
- **`ConnectionStatus`** — indicador de conexão (dot + rótulo); variantes
  `prominent` (formulários, com hint opcional quando desconectado) e
  `subtle` (rodapé do `RoomsView`, sem cor no texto).

## Mobile ✅

Alvos de toque generosos (botões `py-4/py-5`), inputs `text-lg` (≥16px, evita zoom
no iOS), `-webkit-tap-highlight-color: transparent`. A fluidez mobile é requisito
de produto — ver [`UX_REVIEW`](UX_REVIEW.md).

## Acessibilidade — fundação ✅

Definidos globalmente em `App.vue` (ver [`UX_REVIEW`](UX_REVIEW.md) para o pass
completo):

- **Foco visível:** `--sl-focus` (#f9a8d4) + regra `:focus-visible` (anel de 3px).
  Não usar `outline: none` sem substituto (WCAG 2.4.7).
- **`prefers-reduced-motion`:** bloco global neutraliza animações/transições não
  essenciais. Toda animação nova deve tolerar isso.
- **`.sr-only`:** utilitário para texto só de leitor de tela (rótulos, anúncios).
- **Contraste:** `--sl-text-3` = branco 70% (não 50%) para rótulos/hints passarem
  em AA sobre o vidro. Texto que carrega informação deve mirar ≥4.5:1.
- **Ícones:** `BaseIcon` sem `label` é `aria-hidden`; com `label`, `role="img"`.
  Botão só-ícone sempre com `aria-label`.
