# Semanadas: o teto da fatura do cartão, semana a semana

Especificação combinada em 10/11/2026. Serve de guia para as quatro etapas; cada uma marca aqui o que ficou pronto.

## A ideia

As despesas fixas são poucas e pagas em datas certas. O que foge do controle são as ajustáveis: várias compras pequenas
por dia, quase todas no cartão. Em vez de categorizar cada gasto, a família olha um número só, **quanto está a fatura do
cartão**, e compara com o marco da semana. É a semanada da metodologia, com uma régua fácil de conferir.

A fatura não é só gasto ajustável: nela também caem despesas fixas (assinaturas, seguro, plano de saúde) e parcelas de
compras antigas. Por isso a régua parte de uma base e soma o ajustável por cima.

Exemplo: o ciclo começa com R$ 2.600 já contratados e o ajustável é de R$ 1.500 por semana, com R$ 500 a mais na segunda
semana (o futebol). Os marcos são 4.100, 6.100, 7.600 e 9.100.

## As regras

1. **Meio de pagamento.** Cada despesa do Fluxo é paga pela conta (boleto, Pix, débito) ou pelo cartão de uma pessoa
   (`expenses[].cartao`: vazio, `'titular'` ou `'conjuge'`). Um cartão por pessoa; o teto é por pessoa.
2. **Outras despesas no cartão.** Cada cartão tem uma linha fixa do Fluxo (`expenses[].outras: true`) com o total já
   contratado de cada fatura: parcelas de compras antigas, sem discriminar. Programa-se mês a mês no Fluxo de 24 meses
   (o valor digitado num mês vale dele em diante, até o próximo digitado). O valor do mês M é o do ciclo que começa no mês M, e entra inteiro na semana 1.
3. **O ciclo.** Começa no dia informado do cartão (`semanadas.cartoes.<quem>.dia`) e vai até a véspera do mesmo dia no
   mês seguinte. O dia só serve para datar as semanas; o fechamento real da fatura quem informa é o realizado.
4. **As quatro semanas.** Pelo número de dias do ciclo (os dias do mês em que ele começa):
   31 dias: 7, 8, 8, 8 · 30 dias: 7, 8, 7, 8 · 29 dias: 7, 8, 7, 7 · 28 dias: 7, 7, 7, 7.
5. **A base de cada semana.** As despesas fixas marcadas no cartão, na semana em que cada uma é cobrada (pelo dia da
   linha), mais as outras despesas no cartão, na semana 1.
6. **As despesas ajustáveis da família** (`semanadas.alvo`, por mês). A conta do combinado, na ordem: a renda de todo
   mês − as despesas fixas − o que vai para o futuro = as despesas ajustáveis. Ex.: 16.000 − 9.000 − 2.000 = 5.000. A
   conta é a do mês comum, sem médias: o 13º, os bônus e o IPTU ficam fora dela (aparecem ao lado, com o total do ano). O
   que se grava é o valor das ajustáveis, para o teto não mudar sozinho quando o Fluxo muda; a tela aceita digitar o que
   vai para o futuro. Vazio, vale o ajustável de hoje menos a meta combinada na página "O orçamento da família".
7. **A parte de cada cartão** (`semanadas.cartoes.<quem>.parte`, por mês). Nem toda ajustável passa pelo cartão (o
   presente pago no Pix). A tela mostra a conta inteira: as ajustáveis = o cartão de cada pessoa + o fora do cartão. Vazia, vale a sugestão: o alvo na proporção das ajustáveis marcadas naquele
   cartão. O que não está em cartão nenhum é o "fora do cartão": não tem semanas, e se confere no Orçamento Mensal.
8. **A distribuição nas semanas** (`semanadas.cartoes.<quem>.semanas`, quatro valores que somam a parte). Começa igual
   (a parte ÷ 4). Três controles: mudar a semana 1 dilui a diferença nas três seguintes; a 2, nas duas seguintes; a 3, na
   última. A semana 4 é sempre o que sobra. O padrão vale para os 12 ciclos; um ciclo pode ter a sua própria
   distribuição (`semanadas.cartoes.<quem>.ciclos['AAAA-MM']`, o mês em que o ciclo começa).
9. **O marco.** O teto de cada semana é a base mais o ajustável dela; o marco é o acumulado desde o começo do ciclo. É o
   valor que a fatura não deve passar no último dia da semana.
10. **O realizado e o novo alvo.** A família informa quanto está a fatura no fim de uma semana.
    - Acima do marco: o teto final do ciclo fica, e o excesso sai do ajustável das semanas seguintes, na proporção do
      ajustável de cada uma. A tela informa o novo valor de cada semana e os novos marcos. Se o excesso é maior que todo
      o ajustável que resta, a tela diz em quanto o ciclo fecha acima.
    - Abaixo do marco: os marcos ficam como estavam, e a tela mostra a folga.

## Onde aparece

| Onde | O que | Etapa |
|---|---|---|
| Portal, página Orçamento | a etiqueta "Pago com" em cada despesa (um clique troca: conta, cartão de cada pessoa); o bloco Semanadas (o alvo, cada cartão com o dia, a parte, as quatro semanas e a régua dos 12 ciclos) | 1 |
| Portal, Fluxo de 24 meses | a linha "Outras despesas no cartão", mês a mês (a planilha de sempre) | 1 |
| Relatório do cliente, página "As semanadas" (Gestão financeira) | o combinado e a régua programada: "até dia X, a fatura em até R$ Y"; sem o realizado | 2 |
| Página à parte, **Acompanhamento - Semanadas** | por pessoa: o marco de cada semana, o campo "quanto está a fatura" e o novo alvo | 3 |
| Página à parte, **Acompanhamento - Orçamento Mensal** | a revisão do mês: fixas e ajustáveis em qualquer meio, lançadas à mão até o open banking | 4 |

O realizado não entra no relatório e não fica dentro do plano: é guardado à parte, com a origem de cada lançamento
(manual hoje, open banking depois), para que a automação não mude as telas.

## No motor

- `ENGINE.semanadasDoPlano(plan, n = 12)`: o alvo, a conta, o fora do cartão e, por cartão, a parte, a sugestão, o
  padrão das semanas e os ciclos (as datas, a base, o ajustável, o teto e o marco de cada semana).
- `ENGINE.diasDasSemanadas(dias)`: a divisão das quatro semanas.
- `ENGINE.semanasComMudanca(valores, j, novo)`: a regra dos controles (a diferença se dilui nas seguintes).
- `ENGINE.novoAlvoDaSemanada(ciclo, realizados)`: o novo alvo depois de um realizado.
- `ENGINE.acompanhaSemanada(ciclo, realizados)`: o ciclo semana a semana, com cada fatura contra o marco em vigor naquela
  semana (o do plano ou o novo, depois de uma semana acima) e o novo alvo da última informada.

## Andamento

- [x] Etapa 1: motor e portal (10/11/2026). As quatro funções do motor, com as checagens no `verificar.js`; no Orçamento
  do portal, a coluna "Pago com" e o bloco Semanadas. Fica para depois: escolher o meio de pagamento também na gaveta da
  linha, no Fluxo.
  - Revisão do mesmo dia, a pedido do usuário: a conta passou a ser a do mês comum (sem médias), na ordem renda − fixas −
    futuro = ajustáveis; as ajustáveis aparecem repartidas entre os cartões e o fora do cartão; "Pago com" virou etiqueta;
    e o Orçamento ganhou o bloco "Ao longo do ano" (ver o README, "O mês comum e o que acontece ao longo do ano").
- [x] Etapa 2: a régua no relatório (10/11/2026). Primeiro como um bloco no fim de "O orçamento da família"; na revisão do
  mesmo dia, a pedido do usuário, o orçamento do relatório virou quatro páginas (a fotografia de hoje, os 24 meses, as
  semanadas e o orçamento alternativo, ver o README), e a régua ganhou a sua: **As semanadas** (`?fase=semanadas`,
  `renderSemanadas`), com o combinado (as ajustáveis, a parte de cada cartão e o fora do cartão) e, por cartão com o dia
  informado, as quatro semanas do ciclo ("até
  16/nov, a fatura em até R$ 5.553", com o já contratado e o ajustável embaixo) e o teto do ciclo. Hoje é a data do
  calendário, não o início do plano: abre no ciclo que a contém, com a semana de hoje em ardósia ("esta semana") e as
  que já passaram com o trilho em bruma; as setas andam pelos 12 ciclos, e "Voltar ao ciclo de hoje" volta. Embaixo, o
  fora do cartão, quando há. Só o planejado; sem cartão, a página não entra no livro. Em tela estreita, as semanas viram lista.
- [x] Etapa 3: Acompanhamento - Semanadas (10/11/2026). A página `acompanhamento.html` (`?cliente=<id>&pagina=semanadas`),
  à parte do relatório e do portal: uma casca para as páginas de acompanhamento (`PAGINAS_AC`; o Orçamento mensal já
  aparece como "em breve"), com o motor e o armazém copiados pelo `sync-motor.js`. O realizado fica no armazém, na chave
  `realizado` (`realizados/<id>`), fora do plano: lançamentos com a origem (`manual`; `openbanking` depois) e a hora, valendo
  o último de cada semana. Por pessoa, o ciclo de hoje (setas pelos 12), o marco de cada semana, o campo "Quanto está a
  fatura" e a situação (a folga, ou quanto passou do marco); as semanas seguintes mostram o novo marco e o novo valor para
  gastar, com o do plano riscado, e o quadro "O novo alvo" diz tudo por extenso, inclusive em quanto o ciclo fecha acima
  do teto. A conta é `ENGINE.acompanhaSemanada`, com as checagens no `verificar.js`. Fica para depois: um link para o
  acompanhamento no relatório ou na área logada (hoje se abre pelo endereço).
- [ ] Etapa 4: Acompanhamento - Orçamento Mensal
