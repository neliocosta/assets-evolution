# Auditoria matemática da evolução patrimonial — resumo dos 10 cenários

Data: 29/10/2026. Método: um agente desenhou 10 clientes (`cenarios/`), 10 agentes-consultores traduziram cada cliente para o plano
da ferramenta (`planos/`, `dificuldades/`), o motor rodou cada plano (`harness.js` → `extratos/`) e 10 auditores recalcularam
tudo por código próprio, sem usar as funções de conta do motor (`laudos/laudo-NN.md`, `laudos/auditor-NN.js`, reexecutáveis com
`node ux/auditoria/laudos/auditor-NN.js`).

## Resposta direta

**Não dá para afirmar "zero chance de erro". A aritmética de base está exata, mas há erros de motor confirmados**, concentrados em
dívidas e na fase de liberdade financeira. Nenhum deles aparece em participação societária ou em taxa de caixinha.

| Frente que você pediu | Resultado nos 10 cenários |
|---|---|
| Participação societária (valorização, desvalorização, venda) | **Certa, erro R$ 0,00, em 10 de 10.** Taxa, alvo, queda pontual, queda a zero sem ficar negativa, venda com custos e destino do líquido. Testada também com participações sintéticas nos planos que não tinham nenhuma. |
| Dívida lançada | **Saldos e tabelas (Price, SAC, consórcio, crédito novo, IOF) exatos. Erros de caixa e de data:** amortização/quitação deslocada em um mês, parcela escalada depois da liberdade, última parcela que não sai, e dívida de compra financiada fora do total de dívidas. |
| Caixinha agressiva que rende conservador | **Taxa certa em cada mês e troca nos meses esperados.** A troca para a taxa conservadora, nos últimos 24 meses, chega uma semana atrasada (R$ 3 a R$ 1.207, a favor do motor). Dois efeitos de desenho podem surpreender (ver D3 e D4). |

## Semáforo por cenário

| # | Cliente | Participações | Dívidas | Caixinhas | Contabilidade | Fluxo | Liberdade |
|---|---|---|---|---|---|---|---|
| 01 | Beatriz | certo | certo | ressalvas | certo | certo | ressalvas |
| 02 | Rafael e Camila | certo | **errado** | ressalvas | certo | ressalvas | **errado** |
| 03 | Jorge e Marta | certo | certo | ressalvas | certo | ressalvas | ressalvas |
| 04 | Paulo e Renata | certo | **errado** | ressalvas | certo | ressalvas | ressalvas |
| 05 | Marcos | certo | ressalvas | certo | certo | ressalvas | ressalvas |
| 06 | Lucas | certo | ressalvas | ressalvas | certo | certo | ressalvas |
| 07 | Henrique e Sofia | certo | **errado** | certo | ressalvas | ressalvas | ressalvas |
| 08 | Osvaldo e Ione | certo | **errado** | ressalvas | certo | ressalvas | ressalvas |
| 09 | Hélio e Vera | certo | **errado** | certo | certo | **errado** | **errado** |
| 10 | Pedro e Júlia | certo | ressalvas | ressalvas | ressalvas | certo | ressalvas |

## Erros de motor confirmados (ordem de gravidade)

Linhas de `evolucao-patrimonial.html`. Conferi eu mesmo que as linhas 1933, 2116, 1980, 2096, 1382 e 1291 fazem o que os laudos descrevem.
Nenhuma correção foi aplicada.

| # | Erro | Onde | Cenários | Efeito medido | Correção sugerida pelos auditores |
|---|---|---|---|---|---|
| M1 | **A escala do "padrão de vida" multiplica também parcelas de dívida, adiantamentos e exceções** (e, depois da liberdade, todas as despesas até igualar a renda). | `m.scale`, l. 2116; aplicada em `doOffset`, l. 1933 | 02, 04, 05, 07, 09 (latente em 08) | Adiantamento de R$ 103.868 sai R$ 151.402 (09). Parcela R$ 60.197 sai R$ 67.658 (07). Parcela de R$ 4.177 sai R$ 17.650 (02). | Tirar linhas de dívida e exceções da escala. |
| M2 | **Saque único do fundo de pensão ou do FGTS vira renda passiva de um mês e é consumido pela escala**, em vez de entrar no financeiro. | l. 1382 (`caixasDePrevidencia`) + l. 2116 | 02, 09 | R$ 409.697 (09) e R$ 85.000 (02) viram gasto. Custo de R$ 527 mil até 2085 no 02; R$ 2,35 mi no mês 444 do 09. | Lançar o saque como entrada no financeiro, fora da base da escala. |
| M3 | **Amortização e quitação antecipadas deslocadas um mês:** o dinheiro sai no mês N, o saldo devedor só cai no N+1. A última parcela do contrato também some do caixa quando o "restante" conta o mês 0. | `contratoDaDivida` l. 1687, `saldoDevedorEm` l. 1846, `restantesContratadas` l. 1608 | 02, 04, 05, 07, 08, 09 | Patrimônio do mês 62 do cenário 07 R$ 1.170.483 abaixo do coerente. Até R$ 60 mil no 02. | Alinhar os dois índices; contar parcelas a partir do primeiro mês lançável. |
| M4 | **Parada de trabalho arredondada para baixo:** a pessoa perde um mês de renda. | `paradaMi`, l. 1291 | 08, 09 | R$ 19.000 (Vera, 09); R$ 6.200 (Ione, 08). | Usar o mês exato (ou o teto). |
| M5 | **Troca da taxa conservadora uma semana atrasada:** o rendimento é aplicado antes de `m` ser atualizado. | l. 1980 antes de l. 2096 | 01, 02, 03, 04, 07, 09, 10 | R$ 3 a R$ 1.207 aos 100 anos, sempre a favor do motor. | Atualizar `m` antes de aplicar o rendimento da semana. |
| M6 | **Lance do consórcio contado inteiro como bem.** | l. 2045 (`bens += o.amount`) | 10 | +R$ 619 de patrimônio. | Proporcionar o lance por carta/total, como as parcelas. |
| M7 | **Vender bem financiado perdoa uma parcela.** | `trajetoriaDoBem` l. 1798 + `cortaLinha` l. 1854 | 04, 06 (só em teste de estresse) | R$ 718 a R$ 8.000. | Cobrar a parcela do mês da venda. |
| M8 | **O calendário semanal depende do fuso do computador.** | l. 1144–1155 e 1511 | 07 | Até R$ 34.532 em um fim de mês (0,04%). | Calcular as semanas em UTC. |
| M9 | **Planejador de aportes e simulação divergem:** o apartamento fecha com 89,6% do valor e R$ 85 mil parados na reserva. | `programaDosAportes` l. 2221–2285, l. 2138, l. 2043 | 06 | Cerca de R$ 38 no patrimônio, mas a promessa ao cliente fica inconsistente. | Fazer o programa levar em conta os aportes desfeitos pela reserva negativa. |
| M10 | **Latente:** `initialBens` soma `mercado`, mas a trajetória usa `mercado ?? valor`. | l. 2717 e l. 1786 | 01 (variante) | Bem só com `valor` fica com `bens` negativo na venda (−R$ 500.000). | Usar a mesma regra nos dois lugares. |

## Comportamentos de desenho que você precisa decidir

- **D1. A ruína não dispara** quando o dinheiro acaba depois da liberdade: as despesas caem sozinhas para a renda passiva e nenhum aviso aparece (cenários 04, 05, 07). No 05, o financeiro zera aos 71 anos e R$ 1,66 mi da renda desejada ficam sem cobertura, sem alerta. É o ponto mais grave do lado do cliente.
- **D2. Depois da liberdade, o gasto é esticado até igualar a renda disponível.** O cliente que gasta R$ 17 mil passa a gastar R$ 24 mil (03); R$ 20 mil desejados viram cerca de R$ 39 mil (08). Isso muda o patrimônio final em milhões (R$ 10,1 mi contra R$ 14,7 mi no 03).
- **D3. Caixinha que o consultor marca como agressiva rende conservador** se o prazo for menor que 24 meses ou nos últimos 24 meses (08: R$ 792; 01: R$ 32.303 de rendimento nos R$ 600 mil da venda; 03: a taxa digitada de 0,7% é derrubada para 0,4% sem aviso, R$ 10.539). É a regra desenhada, mas o campo não avisa.
- **D4. Os aportes mensais dos objetivos param quando a liberdade começa cedo** (03: só o aporte do mês 0 acontece; os cartões ficam "alcançável com ajustes" para uma família com R$ 2,6 mi).
- **D5. O caixa livre rende 0,4% ao mês.** Com 0,5%, o financeiro na liberdade seria 12,9% maior (10).
- **D6. A dívida de compras financiadas e de bens com crédito não entra em `fim.div`** (06, 08, 09, 10), só o equity. O líquido está certo, mas o bruto e o total de dívidas ficam subestimados.
- **D7. `forced: true` aparece mesmo com o financeiro folgado** (01, 07), porque o teste é de perpetuidade e ignora INSS e vendas futuras.
- **D8. A taxa de valorização é ignorada quando há alvo ou preço de venda** (01, 07, 10); o preço de venda de um bem, ao contrário do de uma participação, não vira alvo da curva (08).
- **D9. O IOF vazio é somado ao valor financiado**, o que muda taxa e saldo. Só `iof: "isento"` neutraliza, e o `VARIAVEIS.md` não lista os valores (02, 05, 06, 07, 09, 10).
- **D10. O mês 0 depende do dia de `inicio`:** com início depois de 27/10, o mês 0 vira novembro e todos os prazos andam um mês (02, 03, 09, 10).

## Dificuldades dos consultores para traduzir o cliente (síntese)

Cada `dificuldades/dificuldades-NN.md` tem a lista completa (de 12 a 22 itens por cenário). As que mais se repetem:

1. **Parcelas pagas e restantes não fecham** entre `inicio` e `restantes` (02, 04, 05, 06, 08, 09): o consultor precisa calcular o saldo devedor e a linha de parcela à mão.
2. **A linha da parcela da dívida no Fluxo é montada à mão**, em degraus, e o formato não está documentado (02, 04, 09).
3. **Um `lifeExp` só**, na idade do titular: não dá para cobrir a pessoa mais jovem do casal (03, 07, 09, 10).
4. **Ficam sem campo:** pensão por morte e reversão do INSS (03), renda de sócio que continua e termina na venda (07), renda sazonal por meses ativos (10), "quitar o que restar" e "só se sobrar" (02), destinar o FGTS a um objetivo (06), bruto e impostos da renda, objetivo recorrente (03).
5. **A carta de um consórcio contemplado não vira bem** (04, 08): foi preciso um compromisso mais um bem de valor zero com salto pontual.
6. **Contribuição que já está descontada do líquido** não tem como ser declarada (04).
7. **O motor opera em valores reais:** taxas nominais do cliente entram como se fossem reais (04).
8. **Validação ausente:** `iof: 0` aceito em silêncio e soma IOF, amortização maior que o saldo limitada ao saldo sem aviso, venda da participação depois da data do objetivo que ela deveria financiar sem aviso (07), taxa de valorização contraditória com o preço de venda sem aviso (01).
9. **A ordem do que entra no objetivo** (reserva, separado hoje, venda de bem) não fica clara para o consultor, e a participação do cliente em empresa não tem campo de percentual nem imposto sobre o ganho (07).
10. **Formatos que só se aprendem lendo o código:** `dates` com mês de 0 a 11, id do objetivo em `venda.destinos`, `segueNecessario`, degrau em zero como fim de linha.

## Erros que não são do motor

- **Tradução do consultor:** parcelas lançadas um mês cedo (05); `iof` omitido (06); `startMi` do INSS com um mês de erro (06); linha de parcela do SAC em degraus anuais, R$ 7.800 a mais (02); crédito novo desnecessário, custo de R$ 40 mil a R$ 67 mil (04); caminhão do consórcio sem entrar como bem, patrimônio R$ 500 mil abaixo (08).
- **Valores esperados dos próprios cenários:** 02 (saldo do carro, taxa do empréstimo), 03 (texto de 6+6 meses, o valor 314.721 é o certo), 06 (cartão que termina no mês 8, reserva de nov/2026), 10 (R$ 170.561 contra o R$ 175.781 do motor). Em cada caso o auditor mostrou que o motor estava certo.

## Limites desta auditoria

- Os consultores gravaram o JSON do plano direto, no formato do portal; ninguém preencheu as telas. Portanto a tradução pela interface (campos que a tela esconde ou valida) **não foi testada**, e o motor foi testado só fora do navegador.
- Os consultores dos cenários 03, 08 e 09 viram sem querer a seção "Para o auditor" (avisaram nos relatórios deles); esses três testes de tradução não são puros. A auditoria numérica não é afetada.
- Consórcio, crédito novo e compra financiada de objetivo foram exercitados nos cenários 04, 08 e 10; não há cobertura de tributação (IR sobre saque, ITCMD), inflação nominal nem tábua de mortalidade do fundo de pensão.
- Nos cenários sem participação (02, 03, 05, 06, 08), a participação foi provada com empresas sintéticas, não com dados de cliente.
- A conferência semanal do 06 usou a saída semanal do próprio motor como "observado".

## Próximo passo sugerido

Corrigir M1–M4 (afetam o caixa e o patrimônio de forma relevante), decidir D1 e D2 (ruína e gasto esticado) e depois incluir os 10 planos em `verificar.js` como casos de regressão, com os valores que os auditores provaram.

## Correções aplicadas (29/10/2026)

Os laudos e `extratos-antes/` mostram o motor **antes** das correções; `extratos/` foi regerado com o motor novo. Regressões em `verificar.js`, seção 13.

| Item | O que mudou |
|---|---|
| M1 | Linhas que pagam contrato (parcela de bem, de dívida e contribuição ao fundo) não passam mais pela escala do padrão de vida depois da liberdade; só o resto do gasto é escalado. Cenário 09: o mês 13 sai com R$ 103.867,61, o do contrato. |
| M2 | Saque único (fundo de pensão, FGTS) entra no financeiro e fica fora da renda do mês e da escala. Cenário 09: o financeiro sobe R$ 418 mil no mês 6; as saídas ficam em R$ 22.000. |
| M3 | O adiantamento do mês `em` agora fica depois da parcela de índice `k0+em-1`, a que o saldo desse mês já pagou. A compra financiada de objetivo passa `em + 1` para manter a 1ª parcela no mês da compra. Cenário 07: o saldo zera no mês 62, o do caixa. |
| M4 | `paradaMi` usa o teto, não o arredondamento: a pessoa trabalha até o mês em que faz a idade. |
| D1 | Quando o patrimônio acaba e a renda desejada deixa de ser paga, o motor devolve `semCobertura` ({ mi, age, falta, total }) e um marco "O patrimônio não cobre a renda desejada"; a tela mostra o cartão vermelho "Atenção" no lugar da liberdade financeira. Cenário 05: mês 154, 71 anos, faltam R$ 2.572 por mês, R$ 2,0 mi no total. |
| D2 | Na renda desejada, o gasto da liberdade é o valor planejado; a renda que passa dele fica no financeiro. Perpetuidade e consumo seguem o saque do plano. |

Patrimônio final antes → depois (R$ mil): 02 17.163→17.900, 03 10.107→12.900, 04 0→9.214, 07 18.263→25.070, 08 19.089→44.177, 09 6.843→10.296. Os demais não mudaram.

Os `auditor-NN.js` ainda carregam as expectativas do motor antigo (índice dos adiantamentos, escala, parada): os FALHA que mostram agora são essas expectativas, não erros novos. Para usá-los como prova do motor novo, precisam ser reescritos.

## Segunda rodada de correções (29/10/2026)

| Item | O que mudou |
|---|---|
| M5 | A semana do salário (que abre o mês) já rende pela taxa do mês novo. No estresse do auditor 09, o erro da "taxa da própria semana" foi de 40,02 a 0,00. |
| M6 | No consórcio de objetivo, só a parte do lance que abate a carta vira bem; o resto é despesa ("taxa de administração e fundo de reserva"). No cenário 10: R$ 619 saem como despesa no mês 48. |
| M7 | A dívida de um bem vendido é quitada pelo saldo de antes da parcela do mês da venda (a linha termina nele). |
| M8 | As datas do calendário ficam ao meio-dia, e a soma de dias não escorrega com o horário de verão do fuso. |
| M9 | **Não corrigido.** O programa de aportes usa um saldo "espelho" que não conhece os aportes que a simulação desfaz quando a reserva fica negativa. Consertar mexe nos cortes do programa (a "falta" e a "folga"); o efeito medido é de R$ 38. Precisa de um desenho próprio. |
| M10 | A soma dos bens usa `mercado`, e na falta dele `valor`, a mesma regra da trajetória do bem. |
| D4 | Objetivo que vence depois da liberdade segue recebendo o aporte, do financeiro (fora da conta da sobra). Cenário 03: dois objetivos passam de "alcançável com ajustes" a "ok". |
| D6 | A compra financiada de objetivo entra inteira nos bens e o financiado entra em `fim.div` e no detalhe (uma linha "Financiamento: objetivo"). Cenário 10: dívida de R$ 518.556 no mês da compra. |
| Pessoa mais jovem | `lifeExp` vale para a pessoa mais jovem do casal. |
| Renda da participação | Termina na venda dela. |
| Amortização | Maior que o saldo vale só o saldo; `ENGINE.avisosDoPlano()` avisa, e avisa também de IOF vazio, venda depois da data do objetivo e valorização ignorada. |
| Imposto sobre o ganho | `venda.impostoGanhoPct` e `venda.custoAquisicao`. |

Ainda sem tela: os avisos e os campos novos estão no motor e no `VARIAVEIS.md`, mas nenhum formulário os mostra ou pede. Ficam para a próxima rodada: FGTS a objetivo de imóvel (com alerta de primeiro imóvel), carta do consórcio contemplado virando bem, e a dívida da compra por consórcio de objetivo em `fim.div`.
