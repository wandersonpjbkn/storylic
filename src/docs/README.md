# Docs — Storylic (frontend)

Documentação viva do jogo Storylic (cliente Vue 3 + PWA). Cada arquivo descreve
**o que é verdade hoje**, separando o que está **decidido** do que ainda é
**hipótese**. A API em tempo real vive no repo `storylic-api` (documentada lá).

## Mapa de documentos

Histórico de decisões e mudanças já concluídas: [`CHANGELOG.md`](../../CHANGELOG.md)
(raiz do repo) — nenhum doc abaixo deve narrar o que já mudou, só o que **é** hoje.

**Produto:**

- [`PRODUCT_VISION.md`](PRODUCT_VISION.md) — o que é o Storylic, para quem, o loop de jogo
- [`PROJECT_STATE.md`](PROJECT_STATE.md) — decisões tomadas, pendências, em andamento

**Técnicos** (gerados lendo o repositório real — a verdade técnica mora no código):

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — stack, camadas, socket, máquina de estados, reconexão
- [`CONTENT_MODEL.md`](CONTENT_MODEL.md) — cartas/categorias, estados, eventos e payloads
- [`CONVENTIONS.md`](CONVENTIONS.md) — convenções de código
- [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) — tokens, vidro, botões, `TheCard`, timer
- [`TESTING.md`](TESTING.md) — estado dos testes + diretrizes BDD right-sized
- [`UX_REVIEW.md`](UX_REVIEW.md) — auditoria de UX mobile

## Convenção de status

✅ decidido / validado · 🟡 hipótese forte (não validada) · 🔬 em validação · ⏳ pendente · ⛔ bloqueado (de propósito)

## Princípio

A verdade mora onde o trabalho aconteceu. Detalhe técnico vem do código (gerado
observando o repo). **Nunca documentar como fato técnico o que não foi observado
no código** — doc de agente fabricado é pior que doc ausente, porque o agente
confia nele.
