# Testing & BDD — Storylic (frontend)

> Estado real + diretrizes. Histórico: [`CHANGELOG`](../../CHANGELOG.md).
> Status: ✅ existe no repo · ⏳ proposto.

## Verdade hoje ✅

- **Runner: Vitest** (`vitest.config.ts` standalone) + **@vue/test-utils** +
  **jsdom**. Roda com **`yarn test`** (`vitest run`) ou `yarn test:watch`.
- **42 testes** em 11 arquivos `*.spec.ts`, co-locados em `__tests__/`.
- **Portões de qualidade** (antes de subir): `yarn test` · `yarn ts`
  (`vue-tsc --build`, também em `yarn build`) · `yarn lint` · `yarn format`.

### Coberto hoje ✅

| Arquivo                                     | O que valida                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------- |
| `stores/__tests__/cards.spec.ts`            | baralho: `initializeDeck`, `dealCards`, teto de 3 no `toggle`, `shuffle`         |
| `stores/__tests__/timer.spec.ts`            | contagem por **deadline**, expiração + callback, `syncFromDeadline`, `reset`     |
| `stores/__tests__/socket.spec.ts`           | `activeSession` (sessionStorage), troca de servidor nuvem↔local (`setServerUrl`) |
| `composables/__tests__/useUtils.spec.ts`    | `normalizeString`, `shuffleArray` (preserva conjunto, não muta)                  |
| `components/__tests__/BaseSlider.spec.ts`   | **regressão** da prop `description`; título/limites; `update:modelValue`         |
| `components/__tests__/TheTimer.spec.ts`     | fases calm/warning/critical, largura da barra                                   |
| `components/__tests__/AvatarInitials.spec.ts` | iniciais e cor determinística por hash                                          |
| `components/__tests__/TheCard.spec.ts`      | nome/rótulo, emite `click`; `disabled`/`readonly` não emitem; **`aria-pressed`/`aria-label`** |
| `components/__tests__/BaseConfirmModal.spec.ts` | **a11y**: dialog rotulado, Escape → cancel, foco no confirmar, cliques          |
| `components/__tests__/TheNotification.spec.ts` | **a11y**: `role`/`aria-live` por tipo, botão fechar rotulado                     |
| `components/__tests__/BaseIcon.spec.ts`     | smoke das variantes (SVG async não renderiza no jsdom — ver nota no arquivo)     |

> O protocolo de socket em si (turnos, watchdog, reconexão) é coberto pela **suíte
> de integração da API** (`storylic-api`), onde há um servidor real. Aqui o
> `socket` store é testado só na parte de cliente, com `socket.io-client` mocado.

## Right-size (importante)

É um jogo de poucas telas, não um produto de larga escala. **Não buscar cobertura
alta.** Testar o que quebraria silenciosamente (lógica de baralho/timer,
contrato de props, troca de servidor); deixar o resto para type-check + lint +
revisão visual. **Não** testar: snapshot de copy, detalhes de pixel.

## Convenções ✅

- Co-localizar em `__tests__/`; nome `*.spec.ts`.
- Descrições em pt-BR descrevendo **comportamento**, não implementação
  (estilo Given/When/Then — Dado/Quando/Então). Comentários de teste podem ser
  pt-BR (bypass da regra de idioma, ver [`CONVENTIONS`](CONVENTIONS.md)).
- Stores: `setActivePinia(createPinia())` no `beforeEach`. Timers: `vi.useFakeTimers`.

## Pendente ⏳

- **E2E (Playwright):** smoke de navegação (setup ↔ salas, validação de join)
  contra `vite preview` + API local. A lógica multi-jogador fica na integração da
  API. Ainda não escrito.
