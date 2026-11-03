# Laudo matemático do cenário 06 (Lucas Ribeiro)

Auditor independente. Código reexecutável: `node ux/auditoria/laudos/auditor-06.js` (opção `--md` imprime a tabela da seção 3). O "esperado" é calculado no próprio arquivo, a partir de `planos/plano-06.json` e de regras financeiras escritas ali (Price/SAC, juros compostos, anuidades, calendário). Nenhuma função de cálculo do motor foi usada para produzir o esperado. O motor só foi carregado para OBSERVAR a simulação semana a semana (`s.weeks`) e para rodar os testes de estresse. Linhas citadas são de `evolucao-patrimonial.html`.

## 1. Veredito

**A evolução patrimonial do Lucas está aritmeticamente correta em todas as contas que o plano exercita (61 das 66 conferências dentro de R$ 0,01, a maioria com erro exato de R$ 0,00), mas há um erro de lógica do motor que deixa a caixinha do apartamento R$ 6.239,64 abaixo da meta com R$ 85.350 parados na reserva, um erro latente na venda de bem financiado, e dois lançamentos do consultor (IOF omitido; INSS um mês cedo) que distorcem o balanço de partida.**

| Frente | Semáforo | Em uma linha |
|---|---|---|
| Participações | CERTO | O plano não tem participação; o motor foi testado com 5 participações inventadas (taxa, alvo, saltos, queda a zero, venda) e bateu com o recálculo ao centavo. |
| Dívidas | CERTO COM RESSALVAS | Tabelas, parcelas, adiantamento de R$ 10.000, quitação e crédito novo batem ao centavo. Ressalvas: saldo inicial de moto e cartão inflado em R$ 335,33 por IOF omitido na tradução; dívida do apartamento fora de `div`; erro latente (venda de bem financiado perdoa uma parcela, R$ 718 no teste). |
| Caixinhas | CERTO COM RESSALVAS | Taxa de cada mês e saldo semana a semana: erro zero, troca moderado para conservador exatamente no mês 36. Ressalva grave: o programa de aportes para cedo demais (falta R$ 6.239,64 no apartamento; com um sonho de consumo maior o apartamento deixa de ser comprado mesmo com a reserva cheia). |
| Contabilidade geral | CERTO | Conservação, identidade do financeiro e conciliação do patrimônio líquido de 876 meses: erro máximo R$ 0,00. |
| Fluxo | CERTO | 422 meses x 15 linhas contra o plano: erro máximo R$ 0,00. |
| Liberdade | CERTO COM RESSALVAS | Lógica de `ff`, `forced`, ruína, teto da dívida: certa. A liberdade sai um mês depois dos 62 anos (granularidade da idade, R$ 15.300 de efeito) e as despesas são escaladas 2,5 vezes depois de parar (por desenho). |

## 2. Por que a matemática está certa

Convenções (todas conferidas como aplicadas de modo consistente): o mês do motor vai do dia 5 ao dia 4; mês 0 = out/2026 (plano iniciado em 28/10, então o mês 0 não tem lançamentos); a reserva positiva e as caixinhas rendem `(1+taxa)^(7/30,4375)` a cada semana, ANTES dos lançamentos da semana; a reserva negativa não rende e paga 4% a.m. uma vez por mês sobre o saldo do fim do mês anterior (L1987).

### Contabilidade geral
- Conservação: em cada uma das 3.815 semanas, soma de todos os `mov_*` = soma das entradas − soma das saídas (transferências somam zero). Erro 0,00.
- Reserva: `cofre(i) = cofre(i−1)·1,004^(7/30,4375) + mov_cofre(i)` (só se positivo). Erro 0,00 em 3.814 semanas, sem exceções.
- Financeiro = reserva + caixinhas, todos os 879 meses: 0,00. Sem NaN/infinito e sem sinal trocado em 879 meses e 5.219 semanas.
- Patrimônio líquido (financeiro + bens + participações + previdência − dívidas), variação de cada mês = entradas − saídas + rendimentos recalculados + amortização do apartamento (tabela própria) + variação da previdência − variação da dívida (tabelas próprias): erro máximo 0,00 em 876 meses. Exemplos: mês 0, R$ 12.052,71; mês 24, R$ 50.654,94; mês 60, R$ 157.375,21; mês 421, R$ 2.610.607,85.
- Ponte independente com a conta mensal pura, só a partir do plano (do mês 60 ao 421: salário, 13º, R$ 2.200 de gastos, parcelas do apartamento, 0,4% a.m.): piso R$ 2.288.029,30 (fluxos no fim do mês), teto R$ 2.295.808,01 (no começo), motor R$ 2.294.607,85, dentro da faixa.

### Participações
- Plano 06: `parts[]` vazio, `part` = 0 em todos os meses, nenhum evento de venda ou valorização, nenhuma linha `out_vendap_*`. Nada a calcular, nada errado.
- Estresse (plano do Lucas + 5 empresas inventadas), regra recalculada passo a passo e, onde possível, em fórmula fechada:
  - Empresa E, taxa 12% a.a. de 6 a 66 meses: `60.000·1,12^(meses efetivos/12)`; erro 0,00 nos 121 meses.
  - Empresa B, alvo 120.000 no mês 24: `50.000·(120.000/50.000)^(m/24)`; no mês 24 e no 60: 120.000,00. Depois do alvo o valor fica parado (a taxa só vale depois do último alvo).
  - Empresa C: taxa −25% a.a., queda de −100% no mês 40, salto de −999.999 no mês 50: zero a partir do 40, nunca negativo.
  - Empresa A: taxa 8%, +20% no mês 12, −15.000 no mês 18, venda no mês 30 sem preço (preço = valor projetado = R$ 129.259,01), custos 3% + 2.000 = 5.877,77, líquido 123.381,24. O motor lançou exatamente isso: `mov_bens` = −preço, `out_vendap_0` = custos, `mov_obj_apto` = líquido; depois da venda a participação é 0 todos os meses.
  - Empresa D: preço informado 200.000 no mês 36 vira alvo (crescimento geométrico sem salto), custo 5% = 10.000, líquido 190.000, destino 20.000 ao apartamento e o resto ao financeiro. Erro 0,00.

### Dívidas
- Moto, como foi lançada (sem `iof`, logo "financiado" no motor): taxa implícita da parcela de 718 = 1,9124% a.m., IOF financiado R$ 561,22, saldo de hoje R$ 12.795,87. Meu recálculo (bisseção na taxa, ponto fixo do IOF, tabela Price) reproduz as 31 primeiras posições do saldo com erro 0,00 e a quitação no mês 22 (ago/2028).
- Cartão: taxa implícita 3,1028% a.m., saldo de hoje R$ 5.451,70; erro 0,00 nos 31 meses; quitação no mês 8 (jun/2027).
- Parcela no fluxo: 718 por 22 meses e 780 por 8 meses, iguais à do contrato, e param na última. Juros pagos = soma das parcelas − saldo de hoje: moto R$ 3.000,13, cartão R$ 788,30.
- Apartamento: financiado 240.000 (300.000 − 60.000), 10% a.a. = 0,7974% a.m., Price, 360x, isento. Parcela R$ 2.030,14 a partir do mês 60 (out/2031), conferida mês a mês até o fim. Adiantamento de 10.000 no mês 72 (13ª parcela, modo prazo): saída do mês 72 = 12.030,14. O prazo cai de 360 para 300 parcelas, última de R$ 821,74 no mês 359 (set/2056), igual ao marco "Financiamento quitado". Juros totais R$ 377.833,00 contra R$ 490.849,67 sem adiantamento (economia R$ 113.016,67).
- Balanço do apartamento: `bens` = 16.000 (moto) + 60.000 (entrada) + principal já amortizado, em todos os 819 meses (no mês 60: 76.116,34 = 76.000 + 116,34 da primeira amortização).
- Crédito novo (estresse): R$ 20.000, 12x, 2% a.m., mês 20: saldo mês a mês igual à tabela Price, parcela de R$ 1.891,19 igual ao contrato.
- Reserva negativa: juros de 4% a.m. uma vez por mês sobre o saldo do mês anterior, 878 meses, erro 0,00; total pago no plano: R$ 581,41.

### Caixinhas
- Regra conferida: perfil nos meses anteriores aos últimos 24 antes da data, conservador nos 24 finais (e objetivo de menos de 24 meses já conservador). PROFILES = 0,4% / 0,5% / 0,6%, iguais ao plano.
  - Curso (5 meses): 0,4% o tempo todo. Notebook (12 meses): 0,4% o tempo todo.
  - Apartamento (60 meses, moderado): 0,5% nos meses 0 a 35, 0,4% a partir do mês 36 (out/2029). Troca exata, 24 meses conservadores (out/2029 a set/2031).
  - Teste extra, agressivo em 48 meses: 0,6% nos meses 0 a 23, 0,4% do 24 em diante.
- Saldo recalculado semana a semana, `saldo(i) = saldo(i−1)·(1+taxa)^(7/30,4375) + mov_obj(i)`, 3.815 semanas por caixinha: erro máximo R$ 0,00 nas três (e no teste agressivo).
- Saque na data: curso, 6.000 de gasto e R$ 3.449,52 devolvidos à reserva (57,5% da meta); notebook, 7.000 e R$ 1.815,43 devolvidos (25,9%); apartamento, R$ 53.760,36 devolvidos e R$ 60.000 viram bem (reserva paga a diferença de R$ 6.239,64).
- FGTS: parado em R$ 14.000 (rentab 0) do mês 0 ao 23, zero a partir do 24; entra R$ 14.000 no mês 24 (`in_pas_1`), vai à caixinha do apartamento junto com a sobra (R$ 16.100 no mês 24) e rende exatamente 0,5% nos 12 meses seguintes e 0,4% nos 24 finais. O "erro típico" do cenário (FGTS rendendo desde hoje) não ocorre. Reprodução do cálculo do cenário: 14.000·1,005^12·1,004^24 = R$ 16.357,99, fator de anuidade 55,613, aporte R$ 784,74 (cenário: 16.358, 55,613, 785).
- Aporte necessário (anuidade própria): curso R$ 1.190,44, notebook R$ 570,61, apartamento R$ 1.078,88 (sem FGTS dedicado); batem com o motor.
- Efeito de manter uma taxa só no apartamento, com os mesmos aportes, no mês 60: regra do motor R$ 53.760,36; tudo moderado R$ 55.055,75 (+1.295,39); tudo conservador R$ 53.055,81 (−704,55).

### Rendimento da reserva
- Taxa implícita da reserva = 0,4% a.m. exatos em 3.760 semanas com saldo positivo (erro < 1e-9). Convenção: rende antes dos lançamentos da semana; um mês de 5 semanas rende cerca de 15% mais dias que um de 4 (média do ano = 0,4% a.m.).

### Fluxo
- Para cada mês de 1 a 422 e cada uma das 15 linhas (salário 5.200 até o mês 8 e 6.000 do mês 9 em diante, 13º em dez com o valor do salário do mês, aluguel de 1 a 59, celular, alimentação, transporte, lazer, moto de 1 a 22, cartão de 1 a 8, curso no mês 5, notebook no mês 12, FGTS no mês 24, INSS de 421 em diante, juros da reserva, parcela do apartamento): erro máximo 0,00 e nenhuma linha inesperada. Meses de borda conferidos: 1, 2, 5, 8, 9, 12, 14, 22, 23, 24, 35, 36, 59, 60, 72, 359, 360, 421, 422.

### Liberdade, ruína, aposentadoria
- Ruína: dispara no primeiro mês que fecha com a reserva negativa (mês 5, mar/2027, −R$ 1.422,31); `cheque12` = R$ 3.795,23 = maior dívida dos 12 meses seguintes (mês 12).
- `ff` (aos 62,09 anos): `maxGap` = 5.500 − 3.800 = 1.700; `forced` = falso porque 0,4% de R$ 2.320.936,94 = R$ 9.283,75 > 1.700; `pmt` R$ 13.931,24 e `sustentável` R$ 13.083,75 recalculados com erro 0,00; `finBefore` = financeiro do fim do mês 422 · 1,004^(7/30,4375), erro 0,00.
- Depois da liberdade: nenhum salário nem 13º, INSS de 3.800 todo mês, gasto total do mês = 5.500 (renda desejada), saque de R$ 1.700 da reserva, nenhuma parcela, em 455 meses.
- Estresse, parar aos 29 sem dinheiro: `forced` = verdadeiro (rendimento de R$ 148,03 < 5.500); reserva negativa paga 4% a.m. até o teto de 100x a renda média (R$ 583.333,33, recalculado: 100·70.000/12), que a dívida atinge no mês 115 e não ultrapassa; erro 0,00 em 139 meses.

### Fidelidade ao cliente (seção "Para o auditor")
| Quantidade | Esperado | Motor |
|---|---|---|
| Parcela da moto | 718 | 718,00 |
| Parcela do cartão | 780 | 780,00 |
| Fluxo em nov/2026 | −198 | −198,00 |
| Fluxo no mês 9 (promoção) | +1.382 | +1.382,00 |
| Parcela do apartamento | 2.030 | 2.030,14 |
| Aporte necessário do curso / notebook | 1.190 / 571 | 1.190,44 / 570,61 |
| FGTS no mês 24 | 14.000 | 14.000,00 |
| Saldo da moto após 14 parcelas | 12.539 (12.541,63 por mim) | **12.795,87** (ver 4.3) |
| Apartamento na data, na caixinha | 60.000 | **53.760,36** (ver 4.1) |

## 3. Conferências realizadas

Erro máximo em reais. "Fora da tolerância" nas linhas C6, D7, V2, M1 e G2 são achados, explicados na seção 4 ou 5; as demais 61 estão dentro de R$ 0,01.

| # | o que foi conferido | método | amostra | erro máximo | resultado |
|---|---|---|---|---|---|
| 0 | Extrato em arquivo = motor regenerado | regerar com o harness e comparar | 879 meses | 0,00 | OK |
| A1 | Sem NaN/infinito; sinais; cheque = máx(0, −reserva) | varredura | 879 meses + 5.219 semanas | 0,00 | OK |
| A2 | Financeiro = reserva + caixinhas | identidade | 879 meses | 0,00 | OK |
| A3 | Soma dos `mov_*` = entradas − saídas | semana a semana | 3.815 semanas | 0,00 | OK |
| A4 | Recursão semanal da reserva (rende só se positiva) | recursão independente | 3.814 semanas | 0,00 | OK |
| A5 | Variação do patrimônio líquido do mês = fluxo + rendimentos + amortização + previdência − dívida | conciliação independente | 876 meses | 0,00 | OK |
| B0 | Plano sem participação: nada em `parts`, `part`, vendas, `vendap` | varredura | 879 meses | 0,00 | OK |
| B1 A-E | Série de cada empresa inventada = regra recalculada | passo a passo | 31 a 121 meses cada | 0,00 | OK |
| B2 A-E | Balanço `fim.det.parts` mês a mês; zero depois da venda | passo a passo | 119 meses cada | 0,00 | OK |
| B3, B4 | Fórmulas fechadas (taxa pura; alvo geométrico) | fechada x motor | 121 e 25 meses | 0,00 | OK |
| B5 | Queda a zero sem ficar negativa | varredura | 121 meses | 0,00 | OK |
| B6 A, D | Venda: preço, custos, líquido, saída, destino | recálculo | mês 30 e mês 36 | 0,00 | OK |
| B7 | Participação zero depois da venda | varredura | meses 31-119 e 37-119 | 0,00 | OK |
| C1, C2 | Saldo da moto e do cartão mês a mês | tabela Price própria (taxa pela parcela, IOF financiado) | 31 meses cada | 0,00 | OK |
| C3 | Quitação: moto mês 22, cartão mês 8 | posição do primeiro zero | 2 dívidas | 0,00 | OK |
| C4 | Parcela do fluxo = contrato; para na última | tabela própria | 25 meses | 0,00 | OK |
| C5 | Juros pagos = parcelas − saldo | soma do fluxo | 22 e 8 parcelas | 0,01 | OK |
| C6 | Saldo de partida de moto e cartão contra o contrato do cliente (sem IOF) | valor presente | mês 0 | 254,24 | FORA (4.3) |
| C7 | Parcela do apartamento e adiantamento do mês 72 | tabela própria | 819 meses | 0,00 | OK |
| C8 | `bens` = moto + entrada + principal amortizado | tabela própria | 819 meses | 0,00 | OK |
| C9, C10 | Quitação do apartamento no mês 359; juros = parcelas − principal | tabela própria | 300 parcelas | 0,00 | OK |
| D1 x3, D8 | Taxa de cada mês de cada caixinha; troca de taxa | regra dos 24 meses | 6, 13, 61 e 49 meses | 0,00 | OK |
| D2 x3, D9 | Saldo semana a semana de cada caixinha | recursão independente | 3.815 semanas cada | 0,00 | OK |
| D3 | PROFILES = perfis do plano | comparação | 3 perfis | 0,00 | OK |
| D4 | Saque do apartamento na data | recursão | semana 1661 | 0,00 | OK |
| D5 x2 | Gasto do curso e do notebook; caixinha a zero | plano | mês 5 e mês 12 | 0,00 | OK |
| D6 | Aporte necessário dos três objetivos | anuidade própria | 3 objetivos | 0,00 | OK |
| D7 | A caixinha só deixa de receber quando o saldo rendendo até a data já cobre o valor | projeção própria | meses 24-59 | 6.239,64 | FORA (4.1) |
| E1 | Taxa de 0,4% a.m. na reserva positiva | taxa implícita | 3.760 semanas | 0,00 | OK |
| E2 | Juros de 4% a.m. na reserva negativa, só uma vez por mês | recálculo | 878 meses | 0,00 | OK |
| E3 | Ponte mensal independente do mês 60 ao 421 | piso e teto | 361 meses | dentro | OK |
| F1 | Todas as linhas de entrada e saída contra o plano | esperado por linha e mês | 422 meses x 15 linhas | 0,00 | OK |
| F2 | Mês 0 vazio; −198 em nov/2026 | conferência | meses 0-2 | 0,00 | OK |
| G1 (Liberdade) | Ruína no primeiro mês negativo; `cheque12` | recálculo | mês 5 | 0,00 | OK |
| G2 (Liberdade) | Liberdade no mês em que completa 62 anos | idade pelo calendário | mês 423 x 422 | 1 mês | FORA (5.6) |
| G3, G4, G5, G6 | `ff`, `pmt`, `sustentável`, gasto = 5.500, pós-liberdade | contas próprias | 455 meses | 0,00 | OK |
| K1, K2 | Crédito novo: saldo e parcela | tabela própria | 19 e 12 meses | 0,00 | OK |
| M1 | Compra do apartamento com sonho de consumo maior | estresse | meses 59-60 | 85.218,70 ocioso | FORA (4.1) |
| S1, S2 | Liberdade forçada aos 29; juros até o teto | contas próprias | 139 meses | 0,00 | OK |
| V1 | Venda da moto: quitação = saldo após a parcela 10 | tabela própria | mês 10 | 0,00 | OK |
| V2 | Venda da moto: desembolso do mês da venda cobre o devido | devido = B9·(1+i) | mês 10 | 718,00 | FORA (4.2) |
| V3 | Venda: dívida sai do balanço e a parcela para | varredura | meses 10-22 | 0,00 | OK |

(A tabela completa, com os 66 itens e as notas, sai de `node ux/auditoria/laudos/auditor-06.js --md`. Os códigos G1 e G2 do estresse agressivo aparecem lá como D8 e D9.)

## 4. Contas erradas encontradas

### 4.1 Programa de aportes para cedo e a caixinha do apartamento fica R$ 6.239,64 abaixo da meta (ERRO DE MOTOR)
- Sintoma: a caixinha do apartamento recebe o último aporte relevante no mês 27 (R$ 1.516,52), um resto de R$ 54,79 no mês 36 e nada mais até o mês 60. Fecha em R$ 53.760,36 (89,6%) contra os R$ 60.000 da entrada, com R$ 85.349,54 parados na reserva (mês 59), que só rende 0,4%. Em 31 meses (28 a 59) a caixinha estava abaixo da meta, a reserva com mais de R$ 1.000 e o aporte foi zero. O card do objetivo mostra "alcançável com ajustes" em vez de "alcançável".
- Valores: esperado (pelo desenho do programa, "só para quando basta") saldo na data ≥ 60.600; obtido 53.760,36; diferença 6.239,64.
- Causa exata: o programa planejou R$ 51.118,52 de aportes até o mês 27 e a simulação só efetivou R$ 45.692,71. A diferença, R$ 5.425,81, são três aportes desfeitos (mês 12, R$ 1.382; mês 13, R$ 1.382; mês 14, R$ 2.661,81 dos R$ 7.382 planejados) porque a reserva estava negativa depois do notebook, e a simulação devolve à reserva o dinheiro da caixinha quando falta caixa (L2138). R$ 5.425,81 rendidos até o mês 60 dão R$ 6.239. O programa (`programaDosAportes`, L2221) segue com o saldo "espelho", sem os aportes desfeitos nem os juros da dívida, acha que a caixinha já basta (`falta`, L2244, folga de 1%) e para.
- Impacto no patrimônio: pequeno neste plano, cerca de R$ 38 (o dinheiro que ficou na reserva rendeu 0,4% em vez de 0,5%/0,4% da caixinha). O dano é de leitura e de decisão: status errado e, pior, a regra de compra (L2043, `naoComprado` quando a caixinha tem menos de 70%) olha só a caixinha e ignora a reserva. Estresse M1 (só o notebook subindo para R$ 25.000): a caixinha fecha em R$ 25.488 (42,5%), a reserva tem R$ 85.218,70 e o motor NÃO compra o apartamento: sem R$ 300.000 de bem, sem financiamento, aluguel continuando.
- Origem: motor, `programaDosAportes` (L2221-2285) x `simula` (L1959 e L2138) x L2043. A regra violada: "o aporte só para quando a caixinha, rendendo, já cobre o valor" depende de o espelho coincidir com a simulação.
- Sugestão (não aplicada): rodar o programa uma segunda vez a partir do saldo real da simulação (iterar até convergir); ou não efetivar aporte quando a reserva está negativa; ou decidir `naoComprado` pelo financeiro disponível (reserva + caixinha), não só pela caixinha.

### 4.2 Venda de bem financiado perdoa uma parcela (ERRO DE MOTOR, LATENTE; não afeta o plano 06)
- Sintoma (teste de estresse: moto vendida no mês 10): o motor lança `out_quita` = R$ 7.634,12, que é o saldo DEPOIS da parcela 10, e corta a linha da parcela no mês 10 (valor zero, L1854 e configure). O cliente desembolsa R$ 7.634,12 no mês da venda quando deve R$ 8.352,12 (saldo do mês 9 R$ 8.195,40 · 1,019124). Faltam R$ 718,00, uma parcela inteira.
- Impacto: +R$ 718 de patrimônio indevido neste teste (mais, quanto maior a parcela). O plano 06 não vende bem, então nenhum efeito aqui.
- Origem: motor, `trajetoriaDoBem` (L1798, `quitacao = saldoDevedorEm(b, fim)`: saldo após a parcela do mês) combinado com `cortaLinha` (parcela do mês da venda = 0). Uma das duas pontas está uma parcela adiantada.
- Sugestão: quitar `saldoDevedorEm(b, fim − 1)` mais os juros do mês, ou deixar a parcela do mês `fim` na linha.

### 4.3 Saldo de partida da moto e do cartão acima do contrato do cliente (TRADUÇÃO DO CONSULTOR)
- Sintoma: moto R$ 12.795,87 e cartão R$ 5.451,70 no mês 0. Pelas condições do cliente (moto 2,1% a.m., parcela 718; cartão 6.500 em 10x de 780, sem IOF) os saldos são R$ 12.541,63 e R$ 5.370,61. A "taxa informada não bate com a parcela" que o consultor anotou (dificuldade 3) é o IOF: sem a chave `iof`, o motor assume IOF financiado (L1625), soma R$ 561,22 (moto) e R$ 118,80 (cartão) ao crédito, e a taxa implícita da parcela cai para 1,9124% e 3,1028% a.m. (a do cliente: 2,1037% e 3,4602%). O consultor ainda gravou `saldoDevedor` com o saldo do contrato do próprio motor. (A conta do consultor de que 2,1% daria parcela de R$ 740,03 está errada: dá R$ 717,58.)
- Impacto: dívida +R$ 254,24 (moto) e +R$ 81,09 (cartão) no mês 0, total R$ 335,33 (2,8% do patrimônio de R$ 12.052,71); decai: moto R$ 147,59 no mês 6, R$ 64,51 no mês 12, 0 no mês 22; cartão R$ 24,51 no mês 4, 0 no mês 8. O fluxo de caixa não muda (as parcelas são as do cliente); muda a divisão juros/amortização e o patrimônio líquido de partida.
- Origem: tradução. Campos `patrimonio.bens[0]` e `patrimonio.dividas[0]`: `iof` ausente e `saldoDevedor` herdado do motor.
- Correção: `iof: "isento"` nos dois contratos e `saldoDevedor` vindo do extrato do banco (ou recalculado depois do `iof`).

### 4.4 INSS começa um mês antes dos 62 anos (TRADUÇÃO DO CONSULTOR)
- Sintoma: `passive[0].startMi = 421` (nov/2061, 61,9 anos); aos 62 anos (01/12/2061) o mês é 422. 62 − 26,9077 = 35,0923 anos = 421,1 meses, truncado para 421 em vez de arredondado para cima.
- Impacto: R$ 3.800 a mais no mês 421 (salário e INSS juntos), cerca de R$ 23.600 no mês 878 com rendimento.
- Origem: tradução, campo `passive[0].startMi`.

### 4.5 Valores esperados do cenário que estão errados (ERRO DO CENÁRIO)
- "Cartão termina no mês 7; do mês 8 em diante +582": com 8 parcelas restantes e a de out/2026 já paga, a última parcela é a do mês 8 (jun/2027); o fluxo fica −198 até o mês 8 e já vai a +1.382 no mês 9 (promoção). O +582 nunca existe.
- "A reserva começa zerada e fica perto de −R$ 400 ao fim de nov/2026": a conta corrente de R$ 300 faz a reserva fechar nov/2026 em R$ 105,69 e dez/2026 (com o 13º) em R$ 1.700. Ela só fica negativa em mar/2027, por causa do curso de inglês, não do déficit de R$ 198.
- "Saldo da moto após 14 parcelas R$ 12.539": o valor presente das 22 parcelas à taxa implícita é R$ 12.541,63 (diferença de R$ 2,63 de arredondamento).
- Conferidos e corretos no cenário: taxa implícita do cartão 3,46% a.m. (3,4602%); 16.358, 55,613 e R$ 785 (784,74) do aporte; parcelas de 718, 780, 2.030; 1.190 e 571.

## 5. Comportamentos por desenho que o dono do produto deveria conhecer

1. Consumo sem caixinha suficiente é pago assim mesmo, com dívida a 4% a.m. (só bem com menos de 70% deixa de ser comprado). O curso é pago com R$ 3.449,52 de caixinha e R$ 2.550,48 vêm da dívida; o notebook, R$ 1.815,43 de caixinha e R$ 5.184,57 da dívida. A reserva fica negativa nos meses 5 a 9 (pior −R$ 2.215,47) e 12 e 13 (pior −R$ 3.795,23); juros pagos R$ 581,41. Os dois sonhos exigiam R$ 1.190 e R$ 571 por mês; a sobra do cliente era negativa (−R$ 198).
2. O aporte planejado é efetivado e depois desfeito quando a reserva está negativa (meses 9, 10, 12, 13 e 14 neste plano): cria a impressão de que a caixinha foi abastecida (ver 4.1).
3. O FGTS aparece como `in_pas_1` "renda passiva" no mês 24 e só chega ao apartamento porque o objetivo é `aporteSobra`; não há campo "este dinheiro é só para o objetivo X". Funcionou, mas por acaso da prioridade: a ordem inglês, notebook, apartamento fez o notebook receber a sobra dos meses 9 a 11 (aporte do apartamento "a partir do mês 10" na prática começa no mês 12 planejado, 14 efetivo).
4. A dívida do financiamento do apartamento não entra em `div` nem em `bens` (modelagem de patrimônio líquido do bem): `bens` mostra R$ 76.116,34 no mês 60 em vez de R$ 316.000 e `div` fica 0 (a dívida real é R$ 239.766,38 no mês 61). O patrimônio líquido está certo (A5); o bruto e o endividamento ficam subavaliados, o que importa para qualquer indicador de alavancagem ou de liquidez corrente.
5. Depois de parar (mês 423), as despesas das linhas são escaladas por 2,5 (gasto de R$ 2.200 vira R$ 5.500: alimentação 2.250, celular 1.000), porque o motor leva o gasto total à renda desejada. Saque da reserva R$ 1.700 por mês contra um rendimento de cerca de R$ 9.300: financeiro de R$ 2.325.640 aos 62, R$ 6.103.935 aos 85 e R$ 12.068.021 aos 100. Manter o padrão atual de R$ 2.200 somaria cerca de R$ 1,65 milhão aos 85. Não é erro de conta, é a leitura "5.500 = gasto"; vale confirmar com o cliente.
6. A liberdade ocorre no primeiro mês em que a idade em semanas (semana/52,18) chega a 62: mês 423 (jan/2062, 62,09 anos), um mês depois do aniversário (dez/2061, mês 422). Efeito se fosse no 422: patrimônio R$ 15.300 menor naquele mês (perde salário e 13º de R$ 12.000 e passa a gastar 5.500 em vez de 2.200).
7. A taxa de cada caixinha muda na semana que contém o dia 5 do mês da troca, usando a taxa do mês anterior naquela semana: no apartamento, 1 semana a mais de 0,5% custa R$ 11,17 (R$ 8,46 no teste agressivo). Convenção de calendário.
8. Rendimento semanal por dias corridos: o mês rende entre cerca de 0,37% (4 semanas) e 0,46% (5 semanas); no ano fecha em 0,4% a.m.
9. Moto sem depreciação (R$ 16.000 por 35 anos, 0,6% do patrimônio no mês 421), apartamento sem valorização, FGTS com rendimento real zero: dados que o cliente não deu; o motor assume o valor de hoje parado.
10. O aluguel termina na compra do apartamento (`endObj`), sem condomínio nem IPTU do novo imóvel: premissa do consultor (+R$ 1.700 de folga por mês a partir de out/2031).
11. Teto da dívida (100x a renda média, aqui R$ 583.333): não é atingido no plano 06, mas, em quem esgota o dinheiro, o que passa do teto some (`in_teto`) em vez de acumular.
12. O último mês da linha do tempo (mês 878, 100 anos) tem 1 a 2 semanas; o gasto de R$ 1.125 e a "queda do padrão para 25%" que o consultor viu são artefato do corte, não da conta.
13. O 13º acompanha o salário (R$ 5.200 em dez/2026, R$ 6.000 depois da promoção).

### As "estranhezas" do consultor, julgadas
| # (d) | Estranheza | Julgamento |
|---|---|---|
| 1 | Dinheiro acaba em mar/2027; reserva negativa até jul/2027 | Por desenho (5.1); conta certa. |
| 2 | Mês 0 sem lançamentos | Por desenho: o mês já passou em 28/10. Certo. |
| 3 | Apartamento comprado com 89,6% | Erro de motor (4.1). |
| 4 | Dinheiro parado na reserva enquanto o apartamento está abaixo da meta | Erro de motor (4.1). |
| 5 | Mais aporte, menos resultado | Mesma família do 4.1 (espelho do programa descasado da simulação). Não reproduzi com esse plano; a explicação (aportes desfeitos) é coerente com os números do 4.1. |
| 6 | Padrão de vida salta ao parar | Por desenho (5.5). |
| 7 | Financeiro de R$ 2,3 milhões aos 62 | Conta certa: recalculada pela ponte (E3), dentro da faixa. |
| 8 | FGTS como renda passiva | Rótulo; dinheiro certo (5.3). |
| 9 | Amortização de R$ 10.000 encurta 60 parcelas | Conta certa: 300 parcelas, última R$ 821,74 (C7 a C10). |
| 10 | Bens R$ 316.000 e `div` zerado | Por desenho (5.4 e 5.9). |
| 11 | Cartão quita em jun/2027, cliente falou agosto | Dado do cliente (parcelas restantes) x data dita; o motor segue as parcelas. |
| 12 | Liberdade na mesma idade que o cliente quer parar | Certo por construção, com 1 mês de folga (5.6). |
| (b)3 | "Taxa 2,1% não bate com a parcela 718" | Era o IOF omitido (4.3); a conta do consultor (740,03) está errada, o certo é 717,58. |
| (b)7 | Aporte pára com o objetivo a 90% | Erro de motor (4.1). |
| (b)13 | INSS `startMi` calculado à mão | Erro de tradução (4.4). |

## 6. Limites desta auditoria

- Não foram cobertos (o plano não os usa e não montei estresse): consórcio de patrimônio e consórcio de objetivo; amortização em modo "parcela"; amortização antecipada de dívida avulsa ou de bem existente (a linha do Fluxo que carrega o adiantamento é lançada pelo portal, `lancaParcela`); SAC; seguro prestamista; IOF "avista"; carência; renda vitalícia de fundo de pensão e tábua BR-EMS; casal; frequências semanal, trimestral e pontual; os modos de saque "cons" e "perp" da liberdade; módulos de IR, riscos e seguros; telas e textos.
- A conferência semana a semana usou a saída semanal do próprio motor como "observado" (flows e saldos). A independência está nas fórmulas e nos esperados recalculados aqui, não em um segundo simulador completo. Onde a regra é decisão de desenho (rendimento semanal, 24 meses conservadores, IOF financiado por padrão, idade em semanas, escala das despesas), foi registrada como premissa e conferida quanto à consistência, não quanto ao acerto financeiro.
- Participações e venda de bem financiado foram testadas só com planos inventados (a trajetória do bem e a da participação são o mesmo código, `trajetoriaDoBem`, L1782). A venda de bem com `renda` ligada (aluguel) não foi exercitada; no código (configure) a renda ligada só é cortada para bens, nunca para participações (a tela não oferece renda para participação).
- Não avaliei se os valores do cliente (cenário) são realistas, só se a ferramenta os traduz e calcula sem erro. Tributação (IR sobre rendimentos, INSS) não entra no motor; o plano é em valores reais líquidos.
- Os esperados do cenário que usei estão na seção "Para o auditor"; quando divergem dos meus cálculos, o desvio está na seção 4.5.
