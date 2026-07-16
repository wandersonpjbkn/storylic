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
- **Poderes do dono da sala no `RoomManageModal` ✅ (2026-07-15):** o dono
  pode reiniciar o jogo a qualquer momento (seção "Zona de risco", atrás de
  `BaseConfirmModal` `danger` — reaproveita o `reset-game`/`emitResetGame`
  que antes só era acionado por `EndedView`); fechar o modal com alterações
  de configuração pendentes (`hasChanges`) pede confirmação antes de
  descartar; salvar a configuração fecha o modal sozinho
  (`useRoomConfigForm(() => emit('close'))`); e uma seção "Vagas reservadas"
  mostra, ao vivo, a contagem regressiva de cada reserva de 60s pendente
  (`stores/timer.ts` — `reservationList`/`addReservation`/
  `removeReservationByName`/`clearReservations`, mesmo padrão deadline-based
  dos timers de turno/narração, alimentado por `player-disconnected` e
  limpo por `player-reconnected`/`game-reset`).

## Pendências / dívidas conhecidas

Backlog levantado em 2026-07-13, ainda não implementado — a fatiar em sessões
futuras. Nenhum destes itens está desenhado em detalhe; entrar em cada um
exige uma sessão de planejamento própria antes de codar.

### Poder de todos os jogadores

- **Abandonar o jogo a qualquer momento**, inclusive em pleno
  `playing`/`storytelling` (hoje `abandonRoom` só existe em `SetupView` e
  `RoomsView`, telas pré-jogo), sem possibilidade de retorno. O mecanismo de
  bloqueio de rejoin após saída definitiva já existe (mesmo usado por
  `leave-game`/`kick-player`) e é reaproveitável.
- **Preview de card:** preview de card em toque longo (modal com arte ampliada), durante a fase de seleção de cards;
- **Glossário de cards colapsável:** organizado por categoria (somente na tela de RoomsView; dividir espaço com ajuste de UI sobre Regras).
- **Pós-jogo e memória:** título da sessão ao final do jogo; linha do tempo 
de cards por jogador; votação "melhor narração"; votação "card mais 
improvável";  exportar história em PDF/texto.

### Ajuste de UI geral (não é um "poder")

- **Regras do Jogo e FAQ:** Hoje, a sessão "Regras do Jogo" aparece apenas 
no lobby. Mover para ícone flutuante de interrogação, oposto ao ícone
de configuração e que deve estar presente desde a tela de raiz do
projeto (RoomsView). FAQ e Regras do Jogo também tentam explicar coisas diferentes
sobre o jogo. Interessante seria mesclar as duas infos. Ter um único local
coeso como fonte de verdade sobre como jogar o jogo - texto pode passar por
revisão para não se tornar muito extenso.

### Seção "Avançado" (toggle por sala, configurável só pelo dono)

Backlog greenfield — nada disto está em nenhum doc hoje. Agrupado como
proposto:

- **Polish & game feel:** som/haptic feedback no timer e na confirmação da
  mão;
- **Configuração de partida:** filtro de categorias no baralho (hoje sempre
  as 7 — `src/data/categories/*.json`).
- **Cartas de evento:**  — deck paralelo com eventos que
  disparam aleatoriamente; um jogador sorteado atribui secretamente um card 
  extra que o narrador deve incluir. Deck secreto **não** entra como
  opção de categoria na configuração acima - Configuração de partida/fitro 
  de categorias. É um recurso todo à parte para o dono da sala ativar.

#### Cartas de evento

Mecanismo: opção que dono da sala pode ativar para o jogo em questão; fica
em sessão avançada, nos ajustes de configuração da sala; só pode ser ativado
em jogos cujo "Tempo para narrar" **e** "Tempo para escolher cards" seja 
igual ou superior à 30s - dar tempo dos outros jogadores analisarem o deck 
secreto e escolher uma carta, e de quem estiver contando, conseguir adaptar 
o trecho e incluir o novo card na narração.

O deck funcionará, mais ou menos, como os outros decks já funcionam: um novo 
JSON array com opções, podendo serem coisas como "Pikachu", "Onomatopeia", "Gretchen", etc.

Como funcionará: após o dono da sala ativar este recurso, ele será ativado
durante a fase de "Playing" e "Waiting" dos jogadores. Após **5s** que um
jogador estiver montando a mão dele, um jogador aleatório em "Waiting" receberá
um alerta secreto na tela "Deck secreto! Olhar?". Este jogador poderá escolher
olhar o deck ou cancelar a ação. Caso cancele, nada irá ocorrer. Caso a pessoa
opte por ver o deck, será aberta uma tela de seleção de cards, semelhando ao
"Playing", onde a pessoa poderá dar shuffle nos cards do deck secreto **até no máximo de 3x**. A qualquer momento dessa etapa, ela poderá selecionar **apenas uma carta**.
Quando ela terminar de selecionar, essa carta será "enviada secretamente" ao jogador que estiver jogando. Quando o jogador que estiver jogando mover para a fase de "Storytelling", ela receberá a carta em tela "Você recebeu uma carta secreta!".
A tela continuará exibindo o flex com os três cards (ou a quantidade que ela tiver selecionado), mas haverá um ícone dourado flutuando na tela, que se ela clicar, irá 
mostrar o card secreto. Ela teria que contar a fase dela, incluindo o card secreto.

Não existe regra ou penalidade se o jogador que estiver contando a história não incluir o card secreto na história.

O sistema de card secreto, deve ter uma proteção: apesar de ser aleatório quem 
irá receber a chance, ela é única por jogo e por jogador. O jogador escolhendo usar
o card ou não, ficará marcado e na próxima seleção aleatória, este jogador **não**
estará incluso. Assim, todos teriam a chance de usar isso na vez de um colega.

Um jogo pode acabar sem que todos tenham dito a chance de receber o convite.

Caso um jogador em waiting room, ainda esteja selecionando uma carta, e o jogador jogando entre no storytelling, o jogador de waiting ainda poderá enviar o card secreto, que será imediatamente exibido para quem estiver contando a história.

Caso um jogador em waiting room, ainda esteja selecionando uma carta, e o jogador jogando entre no storytelling e encerre o turno, a opção de deck secreto se encerra 
automaticamente para o jogador em waiting um, e um novo ciclo de seleção de jogadores
em waiting room se inicia.

#### Pós-jogo e memória

Na tela de EndedView ficará uma nova opção "Encerrar", compartilhando espaço com 
"Jogar novamente".

Caso cliquem em "Encerrar", todos os outros jogadores serão convidados à confirmar
se desejam encerrar a partida. Se a maioria votar por sim, jogo encerra e novas opções
aparecem:

- **Título da sessão ao final do jogo:** campo para nomear a história; editável somente 
para o dono da sala, mas campo visível para todos - estão ocupando o mesmo espaço em sala, podem discutir um nome e dono preencher;

- **Exportar história:** botão para fazer download da linha do tempo dos cards e 
título da história. Visível para todos;

- **Linha do tempo:** sessão expandível, com linha do tempo dos cards - inclui os
 cards secretos, se usados;

- **Votação:** opção para participantes conseguirem registrar "like" no registro
 na linha do tempo - seria uma conversa/votação informal, onde membros relembram
 da fase e poderiam "votar" pela fase que teve a melhor narrativa ou saiu a carta
 "mais improvável" e coisas assim.

Apesar dessas opções, também terá a opção de "Voltar para salas", onde poderão fazer
outro jogo. Os itens do pós-jogo/encerrar não são obrigatório.

> Todos os itens pendentes descritos aqui **não são** a versão final para implementação, mas um detalhamento orientando a direção desejada/ansiada.
