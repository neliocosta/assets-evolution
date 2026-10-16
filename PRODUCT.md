# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **O consultor** (planejador financeiro da Nord Liberta) monta o plano no portal (`tela-consultor.html`), em nove passos:
  dados do cliente, planejamento e "com o cliente". Ele conhece finanças a fundo, trabalha com planilhas e não lê manual.
  Quando falta um dado, pergunta ao cliente, e por isso só trava quando a tela não deixa claro onde e em que ordem o dado
  entra (persona em `ux/personas/consultora-patricia.md`).
- **A família cliente** (classe média alta e pequenos empresários; pessoa sozinha ou casal, com ou sem dependentes) vê o
  próprio plano na área do cliente (`evolucao-patrimonial.html`). O consultor apresenta o plano na reunião, presencial ou
  por vídeo. Depois o cliente volta sozinho para rever, simular e propor mudanças.

## Product Purpose

A plataforma transforma o planejamento financeiro completo de uma família em um plano que ela entende, revisita e ajuda a
ajustar. O consultor monta o plano a partir do exame de saúde financeira e da coleta de dados. O cliente o percorre como uma
narrativa da própria vida: propósito, diagnóstico, gestão financeira, otimização tributária, patrimônio, gestão de riscos e
evolução patrimonial. Ele dá certo quando a família sai da reunião sabendo o que fazer e volta ao plano por conta própria.

## Positioning

- **Plano vivo.** O cliente simula e propõe mudanças na área do cliente, e o consultor aprova cada proposta. Tudo é
  recalculado a partir de uma variável só, então qualquer mudança aparece em todas as páginas.
- **Relatório como livro.** O plano é uma sequência de capítulos e páginas, com o vídeo teórico, que é o mesmo para todos,
  e o vídeo do caso, em que o consultor explica aquele cliente. É uma narrativa apresentada ao vivo, não uma planilha.

## Operating Context

- O plano nasce de quatro camadas: o exame (amplo e rápido), a coleta (profunda), as decisões do consultor e o que é
  calculado a partir delas (`COLETA.md`). Os dados vão chegar pré-preenchidos da reunião de coleta, e o relatório está
  sendo construído de trás para frente.
- O portal grava sozinho, e a área do cliente lê do mesmo armazém. O portal aberto recebe o que o consultor grava durante
  a apresentação.
- Na reunião, o consultor conduz a área do cliente página a página. Fora dela, o cliente navega pelo sumário, que marca as
  páginas já vistas.

## Capabilities and Constraints

- Este código evolui até chegar a clientes reais. Não é só uma especificação.
- São duas telas HTML autocontidas, sem bibliotecas externas além das fontes do Google. Os gráficos (rosca, relógio,
  barras do orçamento, evolução) são desenhados no próprio código.
- O motor (`<script id="engine">`) e o armazém são duplicados nas duas telas. A área do cliente é a origem, e
  `node sync-motor.js` copia para o portal. `node verificar.js` confere as invariantes.
- Cada dado é pedido uma vez só, num lugar só (`VARIAVEIS.md`). Os derivados são calculados, nunca gravados. O histórico
  é uma foto datada.
- Nada é trocado ou guardado em arquivo .json.
- Os capítulos têm só título, sem número, porque nem todo cliente terá todos.
- Em aberto (`PENDENCIAS.md`): planos de família tratados separadamente; o critério do selo "renda parcial" e do aviso
  "Requer revisão"; a idade de quem define a fase da vida num casal.

## Brand Commitments

- O nome do produto é Nord Liberta. A marca e os ícones estão em `marca/`.
- A Nord segue o padrão FPSB/CFP®. A história do grupo, de 2018 a 2024, vem da apresentação institucional.
- O texto fala direto com o cliente: no plural para um casal ("vocês") e no singular para uma pessoa ("você").
- O tom dos textos institucionais ainda será conferido pelo dono do produto.

## Evidence on Hand

- O plano de exemplo é a família Ana e Marcos, carregado por "Ver exemplo".
- Fotos dos objetivos de exemplo em `fotos/`.
- Clientes de teste, persona e rodadas de pesquisa com a consultora em `ux/personas/` e `ux/research/`.
- Ainda não há depoimentos, casos de clientes reais, métricas de uso nem preços. Não se pode inventá-los.

## Product Principles

1. O cliente entende antes de decidir. Cada página responde a uma pergunta da família, em linguagem dela.
2. O plano é vivo: toda mudança recalcula tudo, e nenhum número aparece sem origem rastreável.
3. O consultor nunca fica em dúvida sobre a ferramenta, só sobre o conteúdo, que ele pergunta ao cliente.
4. Mostrar só o que o cliente tem: o que falta some, em vez de aparecer vazio.

## Accessibility & Inclusion

- Respeitar o pedido de menos movimento do sistema (`prefers-reduced-motion`): com ele, as entradas acontecem só pela
  opacidade.
