# CLAUDE.md

Instruções para o Claude Code neste repositório (frontend do Storylic).

## Documentação como fonte de verdade

Antes de inspecionar código, propor um plano ou implementar qualquer mudança,
leia **sempre** a documentação em [`src/docs/*.md`](src/docs/):

- `README.md` — mapa dos documentos e legenda de status
- `ARCHITECTURE.md` — stack, camadas, modelo de eventos socket, máquina de estados
- `CONTENT_MODEL.md` — cartas/categorias, estados de jogo, payloads de socket
- `CONVENTIONS.md` — convenções de código
- `DESIGN_SYSTEM.md` — tokens `--sl-*`, superfícies de vidro, componentes
- `PRODUCT_VISION.md` — o que é o Storylic e para quem
- `PROJECT_STATE.md` — decisões tomadas, pendências, o que está em andamento
- `TESTING.md` — estado dos testes + diretrizes BDD
- `UX_REVIEW.md` — auditoria de UX mobile

Histórico de mudanças já concluídas: [`CHANGELOG.md`](CHANGELOG.md) na raiz —
nenhum doc de `src/docs/` deve narrar o que já mudou, só o que **é** hoje.

O que estiver nesses documentos é **guideline inflingível** — a fonte de verdade
do projeto tem prioridade sobre convenções genéricas, preferências de estilo do
modelo ou padrões inferidos apenas pela leitura do código.

## Quando o código diverge da documentação

Se, ao inspecionar o código ou planejar, você notar que o estado atual
**diverge** do descrito nas docs, informe isso **explicitamente no plano** (ou na
resposta, se não houver plano formal). Não corrija silenciosamente nem ignore —
torne a divergência visível para o usuário decidir.

## As docs também evoluem

Quando uma tarefa exigir mudança de comportamento, arquitetura, convenção ou
conteúdo já documentado, atualize o documento correspondente **como parte da
tarefa**, mantendo a documentação alinhada com a realidade do código. O que é
histórico (o que mudou e por quê) vai para o `CHANGELOG.md`, não para as docs.

## Portões de qualidade (rodar antes de subir)

- **Testes:** `yarn test` (Vitest) — ver `src/docs/TESTING.md`.
- **Type-check:** `yarn ts` (`vue-tsc --build`), também dentro de `yarn build`.
- **Lint:** `yarn lint` (ESLint + SonarJS) · **Format:** `yarn format`.
