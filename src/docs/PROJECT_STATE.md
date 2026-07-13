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
- **Dono da sala ✅.** Fixo desde a criação (nunca muda por reconexão nem por
  "jogar de novo"), aprendido via `isCreator`/`isOwner` do servidor. ConfigView
  só aparece na criação; ajustes depois passam pelo painel `RoomManageModal`
  (botão flutuante, visível ao dono em qualquer sala ativa).
- **Remover jogador (kick) ✅.** Dono remove qualquer jogador pelo
  `RoomManageModal`, lobby ou mid-jogo, com confirmação (`BaseConfirmModal`
  `danger`). Quem é removido recebe aviso e é levado de volta ao setup.
- **Sair da sala ✅ (já existia, ganhou confirmação).** `SetupView`/`RoomsView`
  já permitiam abandonar uma sala; agora passam por confirmação explícita
  avisando que a saída é definitiva (sem rejoin possível).
- **Link de convite ✅.** Rota `/join/:gameId` — pula a lista de salas e o
  campo de ID manual, vai direto pro nome. Botão "copiar link" no lobby
  (só o dono vê).
- **Reordenação no rejoin ✅ (resolvido no `storylic-api`):** reconectar
  preserva a posição original na ordem de turnos.
- **Timer restaurado no rejoin ✅ (resolvido):** reconectar no próprio turno
  reinicia o cronômetro pela duração cheia (cliente e servidor alinhados —
  ver `storylic-api`).
- **CSP / zero inline styles ✅:** nenhum `style=`/`:style=` resta em `src/`.
  Estático virou classe Tailwind/`.sl-*`; os 3 casos genuinamente contínuos
  têm cada um sua solução sem inline style — `TheTimer` (largura da barra é
  atributo SVG, não `style`), `AvatarInitials` (paleta fixa de 12 cores por
  hash, não HSL contínuo), `TheNotification` (classes `.sl-duration-N`
  geradas por passo de 1s, não custom property `--duration`). `TheCard`
  (cores por categoria) recebeu o mesmo tratamento por extensão. Ver
  `DESIGN_SYSTEM.md`.
- **Fontes self-hosted ✅:** Montserrat variável (400–900, sem itálico — não
  usado em lugar nenhum) servida de `src/assets/fonts/`, sem `@import` de
  `fonts.googleapis.com`. Pixelify Sans (carregada antes, nunca referenciada
  em nenhum `font-family`) foi removida em vez de self-hospedada.
- **GTM condicional ao modo LAN ✅:** `main.ts` desliga o GTM quando
  `isLanMode()` (`stores/socket.ts`, mesmo sinal de
  `loadServerUrl()`/`storylic_server_url` que já distingue nuvem de local) é
  verdadeiro, além do `import.meta.env.PROD` já existente.
- **Estado só em memória no servidor ✅ (resolvido no `storylic-api`):**
  persistência via Redis implementada lá (opt-in por `REDIS_URL`) — ver
  `PROJECT_STATE.md` do `storylic-api`.

## Pendências / dívidas conhecidas

Backlog levantado em 2026-07-13, ainda não implementado — a fatiar em sessões
futuras. Nenhum destes itens está desenhado em detalhe; entrar em cada um
exige uma sessão de planejamento própria antes de codar.

### Poderes do dono da sala

- **Resetar o jogo a qualquer momento** (voltar ao lobby / menu de gerenciar
  sala). O evento `reset-game`/`emitResetGame` (`stores/socket.ts`) já existe
  e funciona — hoje só é acionado pelo botão "jogar de novo" do `EndedView`,
  após o fim natural do jogo. Falta um gatilho equivalente no
  `RoomManageModal`, com confirmação, chamável durante o jogo.
- **Aviso de alterações não salvas** ao fechar o `RoomManageModal` (botão × ou
  clique no backdrop) sem clicar em "salvar configuração" — hoje o rascunho é
  descartado silenciosamente.
- **Auto-fechar o modal ao salvar.** `useRoomConfigForm`'s `save()` já aceita
  um callback `onSave` (usado por `ConfigView` para navegar ao lobby); o
  `RoomManageModal` não passa esse callback, então fica aberto após salvar.
- **Contagem regressiva da reserva de vaga (60s)** visível para o dono. O
  backend já manda `reservedFor` no payload de `player-disconnected`
  (consumido hoje só como duração de um toast de disparo único) — falta virar
  um contador ao vivo em algum lugar da UI (pelo menos para o dono, que é
  quem decide o destino da sala).

### Poder de todos os jogadores

- **Abandonar o jogo a qualquer momento**, inclusive em pleno
  `playing`/`storytelling` (hoje `abandonRoom` só existe em `SetupView` e
  `RoomsView`, telas pré-jogo), sem possibilidade de retorno. O mecanismo de
  bloqueio de rejoin após saída definitiva já existe (mesmo usado por
  `leave-game`/`kick-player`) e é reaproveitável.

### Ajuste de UI geral (não é um "poder")

- Remover o "enlarge" do dígito do timer nas fases crítica/warning
  (`TheTimer.vue`, troca de `text-5xl`→`text-6xl`→`text-7xl`) — 
  manter a indicação por cor e o pulse, mas não a mudança de tamanho
  do texto para não deslocar outros elementos na tela.

### Seção "Avançado" (toggle por sala, configurável só pelo dono)

Backlog greenfield — nada disto está em nenhum doc hoje. Agrupado como
proposto:

- **Polish & game feel:** som/haptic feedback no timer e na confirmação da
  mão; preview de card em toque longo (modal com arte ampliada); glossário de
  cards colapsável, organizado por categoria.
- **Configuração de partida:** filtro de categorias no baralho (hoje sempre
  as 7 — `src/data/categories/*.json`).
- **Estrutura narrativa:** cartas de evento — deck paralelo com eventos que
  disparam aleatoriamente.
- **Interação entre jogadores:** desafio secreto — um jogador sorteado
  atribui secretamente um card extra que o narrador deve incluir.
- **Pós-jogo e memória:** título da sessão ao final do jogo; link
  compartilhável (dados da sessão em base64); linha do tempo de cards por
  jogador; votação "melhor narração"; votação "card mais improvável";
  exportar história em PDF/texto.
