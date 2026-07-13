# Code Conventions — Storylic (frontend)

> As-built. Vale para código novo; o existente migra quando tocado.
> Histórico: [`CHANGELOG`](../../CHANGELOG.md).

## Idioma ✅

- **Código em inglês**, **conteúdo/UI em português** (copy, rótulos de carta) nomes de variáveis/funções/arquivos, chaves de JSON, mensagens de
  commit, nomes de branch, identificadores em geral e **os comentários de
  código**.
- **Exceção — testes:** comentários em `__tests__/` podem ser pt-BR, no estilo
  Given/When/Then (Dado/Quando/Então).
- **Não ter comentários com o óbvio:** comentários são uma forma de 
explicar pontos pouco intuitivos na leitura. Não devem ser a fonte 
de registro sobre alterações - isso vive no Changelog - ou repetir
o óbvio que pode ser entendido lendo o código.

## Comentários ✅

Priorizar **código legível** > comentário. Comentar o **porquê** (decisão,
contexto não óbvio, armadilha), não o **o quê** (que o código já diz). E
mesmo neste casos os comentários **não devem** registrar passado (eles
devem explicar a situação atual). Informações que expliquem revisões,
alterações ou decisões passadas devem preferir o [`CHANGELOG`](../../CHANGELOG.md).
Em testes, comentar só quando ajuda. Idioma: inglês (ver [Idioma](#idioma-)) —
**exceto em `__tests__/` e `e2e/`**, onde o comentário pode ser em português
(bypass documentado em [Idioma](#idioma-)).

## Código morto ✅

Código, dado ou trecho de documentação sem uso é **removido ao ser encontrado**
— não se mantém "só porque pode ser útil depois". Só permanece se houver um
comentário explícito justificando por que precisa ficar (ex.: `// keep: ...`).

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

## Sem duplicação (DRY) ✅

Uma estrutura não deve ser copiada e colada. Se uma estrutura de lógica/markup
aparece em **mais de um lugar** e é **muito idêntica**, segmentá-la:

- **Lógica repetida** → **composable** (ex.: `useRoomConfigForm` — usado por
  `ConfigView` e `RoomManageModal`, que antes reimplementavam cada um seus
  próprios refs `timerTurn`/`timerStory`/`turns`, o mesmo `hasChanges`
  computed e o mesmo handler de salvar).
- **Markup repetido** → **componente** (ex.: `RoomConfigSliders` — o trio de
  `BaseSlider` que `ConfigView`/`RoomManageModal` compartilham;
  `ConnectionStatus` — o indicador de conexão usado por `SetupView` e
  `RoomsView`, com variantes `prominent`/`subtle` para as duas apresentações
  reais que existem, não uma API genérica inventada).

Variações de uso único ou com estrutura diferente não forçam abstração — DRY
vale quando a repetição é real e quase idêntica, não para unir coisas só
parecidas.

## SOLID ✅

Não há classes neste código (Composition API + funções). Os cinco princípios
ainda se aplicam, traduzidos para composables, componentes e stores:

- **S — Responsabilidade única:** lógica pura (validação, formatação,
  cálculo) vive num **composable testável**, não dentro do `<script setup>`
  de uma página. Exemplos já seguidos: `useRoomConfigForm` (formulário de
  configuração da sala), `useNavigator` (mapeamento estado → rota),
  `useUtils` (normalização de string, shuffle). Uma página **orquestra**
  composables/stores, mas não deve **conter** lógica que poderia ser testada
  isoladamente.
- **O — Aberto/fechado:** estender deve significar **adicionar**, não editar
  código existente. Exemplo: um ícone novo é um novo `.svg` em
  `assets/icons/` + uma nova entrada no tipo `UIcons` — `BaseIcon.vue` em si
  não muda.
- **L — Substituição de Liskov:** uma variante de componente polimórfico
  precisa honrar o mesmo contrato em todo call site. Ex.: `TheCard` com
  `compact` continua aceitando as mesmas props (`name`/`category`/
  `selected`/`disabled`/`readonly`) e emitindo o mesmo `click` — nenhum call
  site depende de comportamento exclusivo de uma variante.
- **I — Segregação de interface:** uma prop declarada e nunca lida pelo
  próprio componente é sinal de código morto (ver
  [Código morto](#código-morto-)).
- **D — Inversão de dependência:** uma view não deve tocar uma API de baixo
  nível diretamente — a dependência passa pela store que já a possui. A
  store `socket` é dona da conexão: `socket.on/emit/off` só é chamado de
  dentro de `stores/socket.ts`; nenhuma view acessa `storeSocket.socket`
  diretamente. Sessão (`sessionStorage`) segue a mesma regra — views leem
  `storeSocket.activeSession`, nunca `sessionStorage.getItem` cru.

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
