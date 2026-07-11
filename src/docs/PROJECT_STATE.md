# Project State — Storylic (frontend)

> Decisões, pendências e o que está em andamento. Histórico do que **mudou** vai
> no [`CHANGELOG`](../../CHANGELOG.md); aqui é o **estado atual**.

## Decisões tomadas ✅

- **Servidor é a autoridade do turno.** O avanço não depende mais do cronômetro do
  cliente; há um watchdog no `storylic-api`. O cliente é o mostrador e
  ressincroniza no `visibilitychange` (timers baseados em deadline).
- **Reconexão robusta.** Reserva de vaga (60s, configurável), token rotativo,
  reenvio de `finish-storytelling`/`cards-selected`, overlay de cold start.
- **Modo local (LAN) ✅.** A URL do servidor é configurável em runtime
  (`setServerUrl`, `localStorage`) com o seletor **Servidor → Nuvem/Local** na
  tela inicial. O `storylic-api` pode servir o próprio build (`PUBLIC_DIR`).
- **Suíte de testes ✅.** Vitest + `@vue/test-utils` + jsdom, co-locada em
  `__tests__/`. Ver [`TESTING`](TESTING.md).
- **Lint com SonarJS ✅.** Regras `recommended`, com relaxamentos justificados.

## Pendências / dívidas conhecidas ⏳

- **Reordenação no rejoin ⏳ (baixo impacto):** ao reconectar, o jogador é
  re-inserido no fim do `Map` de jogadores do servidor, o que pode reordenar os
  turnos seguintes. Não trava o jogo; vale preservar a ordem de entrada no futuro.
- **`config-game` sem dono ⛔ (de propósito, por ora):** qualquer membro pode
  reconfigurar a sala no servidor. O cliente já só mostra a tela ao criador;
  restringir no servidor depende da ordem de entrada (acima).
- **Estado só em memória, instância única ⏳:** um redeploy/spindown do Render
  apaga as salas. Mitigações: keep-warm (`/health`) e modo LAN. Persistência real
  é fora de escopo hoje.
- **Timer restaurado no rejoin ⏳:** ao voltar no meio do próprio turno, o fluxo
  atual pode reiniciar o cronômetro pela base em vez do restante — o watchdog do
  servidor limita o impacto, mas vale alinhar cliente e servidor.

## Em andamento 🔬

- Nada aberto no momento — próximas frentes saem das pendências acima.
