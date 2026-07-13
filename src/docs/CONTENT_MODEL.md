# Content Model — Storylic (frontend)

> Estado real do repositório. Relacionados: [`ARCHITECTURE`](ARCHITECTURE.md).
> Histórico: [`CHANGELOG`](../../CHANGELOG.md).

## Baralho ✅

O conteúdo do jogo são **cartas**, agrupadas em 7 categorias, cada uma um JSON
em `src/data/categories/`:

| Categoria  | Rótulo (UI) | Arquivo          |
| ---------- | ----------- | ---------------- |
| `actions`  | Ação        | `actions.json`   |
| `animals`  | Animal      | `animals.json`   |
| `emotions` | Emoção      | `emotions.json`  |
| `nature`   | Natureza    | `nature.json`    |
| `objects`  | Objeto      | `objects.json`   |
| `personas` | Persona     | `personas.json`  |
| `places`   | Lugar       | `places.json`    |

Cada JSON é uma lista de strings (nomes). `stores/cards.ts → initializeDeck()`
achata tudo em `Card { name, category }` e embaralha (`shuffleArray`). A imagem
da carta vem de `public/cards/<category>.png` (`useCardImage`), com fallback para
o rótulo se a imagem falhar. Rótulos e cores por categoria vivem em `TheCard.vue`.

## Tipos centrais ✅

- `Card { name: string; category: Category }`
- `GameState` = `config | setup | lobby | rooms | playing | storytelling | waiting | ended`
- `Player { id: string; name: string }` (o cliente só recebe id+nome; token fica no servidor)
- `StoredSession { token, gameId, playerName? }` — persistida em `sessionStorage`
  (`storylic_session`).

## Eventos de socket ✅

Constantes em `src/constants/socketEvents.ts` (enum espelhado no servidor).

**Cliente → servidor:** `join-game`, `rejoin-game`, `leave-game`, `start-game`,
`config-game`, `reset-game`, `get-rooms`, `cards-selected`, `finish-storytelling`.

**Servidor → cliente:** `join-ack`/`join-error`, `rejoin-ack`/`rejoin-error`,
`room-config`, `game-state`, `player-turn`, `player-selected-cards`,
`player-disconnected`/`player-reconnected`, `game-ended`, `game-reset`,
`rooms-updated`, `config-error`.

O contrato completo dos payloads é a fonte da verdade no `storylic-api`
(`src/docs/ARCHITECTURE.md` de lá) — aqui os handlers estão em
`stores/socket.ts`.

## Persistência ✅

- **Sessão** (`token`, `gameId`, `playerName`) → `sessionStorage` (por aba).
- **URL do servidor** (nuvem/LAN) → `localStorage` (`storylic_server_url`).
