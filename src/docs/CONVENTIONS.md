# Code Conventions — Storylic (frontend)

> As-built. Vale para código novo; o existente migra quando tocado.
> Histórico: [`CHANGELOG`](../../CHANGELOG.md).

## Idioma ✅

- **Código em inglês**, **conteúdo/UI em português** (copy, rótulos de carta).
- **Comentários** explicam o **porquê** (decisão, armadilha), não o **o quê**.
  Preferir código legível a comentário.
- **Exceção — testes:** comentários em `__tests__/` podem ser em pt-BR,
  acompanhando o estilo Given/When/Then (Dado/Quando/Então) das descrições.

## TypeScript / Vue ✅

- **Arrow functions por padrão**; `const` sempre que possível; tipar o público.
- **`<script setup lang="ts">`** com Composition API.
- **Estado em Pinia** (stores por domínio); nada de estado global solto.
- **Eventos de socket** sempre pelo enum `SocketEvents` — nunca string crua.
- **Imports** ordenados; alias `@` para `src`.

## Estilos ✅

- **Tokens primeiro:** cores/sombras/gradientes vêm das variáveis `--sl-*`
  definidas em `App.vue` (ver [`DESIGN_SYSTEM`](DESIGN_SYSTEM.md)) e das utilidades
  Tailwind — evitar valores mágicos repetidos.
- Componente é dono do próprio visual; página não re-estiliza interno de outro.

## Resiliência (regra de projeto) ✅

- A progressão do jogo **não** pode depender só do cronômetro do cliente: o
  servidor é a autoridade (watchdog). Timers do cliente são baseados em
  **deadline** e ressincronizam no `visibilitychange` — nunca um contador que só
  decrementa.
- Todo `emit` crítico (finalizar turno, revelar cartas) tolera perda: reenvio
  enquanto ainda for a vez do jogador.

## Lint ✅

`eslint` (flat config em `eslint.config.js`, ESM) + `eslint-plugin-vue` +
`eslint-plugin-sonarjs` + **`eslint-plugin-security`** (regras `recommended`).
Relaxamentos são **por regra e justificados** no config (ex.: `sonarjs/pseudo-random`
para o shuffle, `sonarjs/no-clear-text-protocols` para o `http://` do modo LAN,
`security/detect-object-injection` para acesso a mapas de config) — não silenciar
em massa. `argsIgnorePattern: '^_'` para parâmetros intencionalmente não usados.

## Segurança ✅

Ver [`TESTING`](TESTING.md#segurança-local-sem-ci-): **`yarn security`** (deps +
anti-padrões, rápido) e **`yarn security:deep`** (CodeQL local, profundo). Sem CI.
