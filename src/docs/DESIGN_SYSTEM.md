# Design System — Storylic (frontend)

> Estado real do repositório (tokens e componentes observados no código).
> Histórico: [`CHANGELOG`](../../CHANGELOG.md).

## Fundação ✅

- **Identidade:** vidro (glassmorphism) sobre um gradiente escuro
  indigo → roxo → rosa. Fonte **Montserrat**.
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
  `disabled`, `compact`, `readonly`. Cores/rótulos por categoria no próprio SFC.
- **`TheTimer`** — número + barra; três fases por proporção restante:
  **calm** (>50%, verde), **warning** (>25%, laranja), **critical** (≤25%,
  vermelho, pulsa). Recebe `value`/`base`/`label`.
- **`BaseSlider`** — usa `v-model` (`defineModel`); props `title`, **`description`**,
  `min`/`max`/`step`. (A prop é `description` — ver regressão em `TESTING`.)
- **`AvatarInitials`** — iniciais + cor derivada de hash do nome (determinística).
- **`TheNotification`** — toast responsivo (centralizado no mobile, canto no
  desktop) com barra de progresso.

## Mobile ✅

Alvos de toque generosos (botões `py-4/py-5`), inputs `text-lg` (≥16px, evita zoom
no iOS), `-webkit-tap-highlight-color: transparent`. A fluidez mobile é requisito
de produto — ver [`UX_REVIEW`](UX_REVIEW.md).
