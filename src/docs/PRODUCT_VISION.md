# Product Vision — Storylic

> Estratégia: parte vem da reflexão, não do código. Itens não confirmados vêm
> marcados 🟡. Histórico: [`CHANGELOG`](../../CHANGELOG.md).

## O que é ✅

Storylic é um **jogo de narração colaborativa com cartas**, em tempo real, jogado
**presencialmente** por um grupo — cada participante no seu **celular**. Uma sala
reúne os jogadores; a cada turno o jogador da vez monta uma mão de cartas
(categorias como Ação, Emoção, Lugar…) e narra um trecho da história usando-as. A
história passa de jogador em jogador, por um número configurável de turnos, até
terminar. (`index.html`: "Clube Ecos Literários".)

## Público ✅/🟡

- ✅ **Membros de um clube** (o código limita a **12 salas** e **12 jogadores** por
  sala, com comentários "1 room per club member" / "club members qty").
- 🟡 O uso primário é **social/presencial** (mesma sala física, mesma rede Wi-Fi),
  não um produto público de larga escala.

## Princípios de produto ✅

- **Mobile-first de verdade:** a navegação precisa ser fluida no celular — é o
  dispositivo de todos os jogadores. Travar/engasgar é o pior defeito possível.
- **Resiliência à rede:** Wi-Fi de local costuma oscilar; o jogo tem de sobreviver
  a quedas, reconexões e ao "acordar" do servidor gratuito, e (novo) rodar em
  **modo local (LAN)** se faltar internet. Ver [`PROJECT_STATE`](PROJECT_STATE.md).
- **Retomada sem punição:** quem cai tem a vaga reservada e volta ao seu lugar; o
  jogo nunca fica preso esperando quem sumiu.

## Fora de escopo (hoje) 🟡

- Contas/login, ranking, persistência de histórico entre partidas, monetização.
- Escala além do clube (o estado é em memória, instância única — ver
  [`PROJECT_STATE`](PROJECT_STATE.md)).
