# Changelog — Storylic (frontend)

Histórico de mudanças concluídas. Os docs em `src/docs/` descrevem só o **estado
atual**; o que **mudou** e por quê mora aqui.

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
