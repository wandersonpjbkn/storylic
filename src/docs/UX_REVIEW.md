# UX Review — Storylic (mobile)

> Auditoria de UX/heurísticas. O que já foi corrigido vira ✅; achados abertos
> ficam como ⏳. Histórico: [`CHANGELOG`](../../CHANGELOG.md).

O Storylic é majoritariamente mobile — a fluidez no celular é requisito de
produto (ver [`PRODUCT_VISION`](PRODUCT_VISION.md)). Esta auditoria seguiu as
heurísticas de Nielsen e leis de UX usuais.

## Corrigido ✅

- **Turno nunca trava (visibilidade do sistema + controle do usuário).** Antes, se
  o jogador da vez minimizava o app/caía, a sala congelava. Agora o servidor tem
  watchdog e a rotação pula quem está offline.
- **Cronômetro fiel ao voltar do 2º plano.** Timers por deadline + resync no
  `visibilitychange` — o número exibido não fica mais defasado.
- **Cold start comunicado.** Overlay "Acordando o servidor…" e "Sem conexão de
  rede" (antes só um ponto vermelho) — o usuário sabe o que está acontecendo.
- **Não ficar preso ao finalizar a vez.** Reenvio do `finish-storytelling` e
  reabilitação do botão se o servidor não responder.
- **Safe-area do notch.** `viewport-fit=cover` faz o `env(safe-area-inset-*)`
  valer; conteúdo não encosta nas bordas de iPhones com notch/ilha.
- **Backdrop sem jank.** Gradiente num pseudo-elemento fixo, `100dvh` — sem o
  tremor de `background-attachment: fixed` no Safari mobile.
- **Notificação responsiva.** Toast centralizado no mobile (não espremido no
  canto), largura adaptável.
- **Descrições da tela de config voltaram** (bug da prop `description` do slider).

## Pontos fortes preexistentes ✅

- Alvos de toque generosos; inputs ≥16px (sem zoom automático no iOS);
  `-webkit-tap-highlight-color: transparent`; feedback tátil (`:active` scale).
- Estados de conexão sempre visíveis (ponto verde/vermelho, banner de sessão ativa).

## Acessibilidade — WCAG 2.2 AA ✅

Pass sistemático (antes: só o modal tinha `role/aria-modal`). Cada item mapeia a
um critério WCAG / heurística / lei de UX.

- **Semântica para leitor de tela (WCAG 1.3.1, 4.1.2/4.1.3):** `BaseIcon` decide
  `aria-hidden` (decorativo) vs `role="img"`+`aria-label` (conteúdo); botões
  só-ícone rotulados (ex.: "Fechar notificação"); `TheCard` é toggle com
  `aria-pressed` + `aria-label` "Categoria: Nome"; `AvatarInitials` decorativo;
  input de busca das salas rotulado.
- **Regiões live (4.1.3):** notificação vira `role="alert"` (erro) /
  `role="status"` (demais); overlays de reconexão/cold-start `role="status"`;
  status do servidor no setup anunciado. O timer **não** lê cada segundo —
  `aria-hidden` no número e anúncio só nas trocas de fase.
- **Foco e teclado (2.1.2, 2.4.3, 2.4.7):** modal com trap de foco, Escape,
  foco inicial no confirmar e retorno ao gatilho; **anel de foco visível global**
  (`:focus-visible`, token `--sl-focus`).
- **Movimento (2.3.3):** `@media (prefers-reduced-motion: reduce)` neutraliza
  spinner/pulse/progresso/transforms.
- **Estrutura (1.3.1, 2.4.1):** landmark `<main>`; utilitário `.sr-only`.
- **Contraste (1.4.3):** `--sl-text-3` subiu de 50% → 70% (rótulos/hints passam
  em AA); hints informativos de baixa opacidade elevados pontualmente.
- **Fitts:** alvo de toque do "fechar" da notificação ampliado (~44px).
- **Prevenção de erro (3.3.1):** submit vazio do join marca `aria-invalid` e leva
  o foco ao primeiro campo faltante, em vez de falhar silenciosamente.

## Aberto ⏳

- **Varredura fina de contraste ⏳:** micro-hints decorativos em `white/30`–`white/40`
  ainda existem; se quiser AAA, elevar caso a caso.
- **Fluxo de reconexão longo:** validar em rede muito instável se o encadeamento
  overlay → rejoin → toast "Reconectado" não gera ruído excessivo.
- **Teste real em aparelho via LAN** (safe-area, modo local) e com leitor de tela
  (VoiceOver/TalkBack): documentado, ainda não executado em hardware.

- **Fluxo de reconexão longo:** validar em rede muito instável se o encadeamento
  overlay → rejoin → toast "Reconectado" não gera ruído excessivo.
- **Teste real em aparelho via LAN** (safe-area, modo local): documentado, ainda
  não executado em hardware.
