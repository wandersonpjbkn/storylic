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

## Aberto ⏳

- **Fluxo de reconexão longo:** validar em rede muito instável se o encadeamento
  overlay → rejoin → toast "Reconectado" não gera ruído excessivo.
- **Teste real em aparelho via LAN** (safe-area, modo local): documentado, ainda
  não executado em hardware.
