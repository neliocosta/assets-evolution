# Laudo matemático — Cenário 01 (Beatriz Almeida)

Código reexecutável: `node ux/auditoria/laudos/auditor-01.js` (grava `auditor-01.saida.json` ao lado). O auditor lê só o plano (`planos/plano-01.json`) e recalcula tudo com regras próprias (calendário, capitalização semanal, participação, caixinhas, aportes, venda, liberdade). Nenhuma função de cálculo do motor é usada para produzir o "esperado"; o extrato (`extratos/extrato-01.json`) e, nas variantes de estresse, a saída do harness são apenas o "observado".

## 1. Veredito

**A evolução patrimonial calculada pelo motor para este cliente está matematicamente correta: o modelo independente reproduz o extrato inteiro (762 meses, financeiro, cofre, as 3 caixinhas, bens, participação e 5.513 pares mês/linha de fluxo) com erro máximo de R$ 0,00 (diferença de ponto flutuante, abaixo de 1e-9); a única imprecisão achada é uma defasagem de uma semana na troca de taxa da caixinha, que vale R$ 93 no apartamento (0,01%).**

| Frente | Semáforo | Em uma linha |
|---|---|---|
| Participações | **CERTO** | Série, valor-alvo, venda (preço, custos, líquido, destino de R$ 600 mil) e fim da renda ligada conferem ao centavo. A taxa de 3% a.a. dita pela cliente é ignorada por desenho (há alvo pendente) e entra em conflito com o preço de venda: problema do dado, não da conta (seção 4, item 4). |
| Dívidas | **CERTO** (cliente sem dívida) | Nenhuma dívida apareceu em nenhum mês. O mecanismo foi testado em 7 variantes sintéticas (Price, SAC, IOF, amortização antecipada, imóvel financiado vendido, compra financiada de objetivo): erro máximo < R$ 1e-9. Há 3 armadilhas latentes de lançamento (seção 5, itens 11 a 13). |
| Caixinhas | **CERTO COM RESSALVAS** | Saldo de cada caixinha confere ao centavo em todos os meses e a taxa por mês é exatamente a devida. Ressalva: a troca de taxa acontece uma semana depois do mês da regra (R$ 93 a mais no apartamento; sem efeito no MBA e no sabático). Perfil "moderado" do sabático e do MBA não rende nada a mais (por desenho). |
| Contabilidade geral | **CERTO** | Patrimônio = financeiro + bens + participações + previdência − dívidas; conservação do dinheiro, transferências somando zero, sem NaN, sem saldo negativo, venda sem dupla contagem. |
| Fluxo | **CERTO** | Todas as linhas (pró-labore, lucros de mar/set, despesas, aluguel até o mês 119, INSS, saques) conferem; mês 0 parcial explicado. |
| Liberdade | **CERTO COM RESSALVAS** | Gatilho, saques e reescala das despesas conferem. Ressalva: o teste que marca `forced: true` ("sustenta R$ 14.553, não R$ 16.000") é uma perpetuidade; pelo cálculo de prazo finito o plano sustenta os R$ 16.000 até os 100 anos com folga de R$ 0,9 mi. E, se o dinheiro acabar dentro da liberdade, a ruína não dispara (seção 5). |

## 2. Por que a matemática está certa

### 2.1 Convenções (premissas de desenho, conferidas quanto à consistência)

- **Calendário**: o "mês" do plano é o ciclo que abre na semana que contém o dia 5; a semana tem 7 dias contados do nascimento (01/03/1990). Mês 0 = out/2026 (ciclo do dia 5 de out/2026 abre na semana 1909, antes de "hoje" = semana 1910 = 10/10/2026). Reconstruído do zero, bate com `w0/w1` de todos os 762 meses.
- **Rendimento (frente E)**: o financeiro livre e cada caixinha rendem **semana a semana**, fator (1+taxa mensal)^(7/30,4375), **sobre o saldo de abertura da semana**; todos os fluxos da semana (salário, despesas, aportes, venda, saque da caixinha) entram **no fim dela** e só rendem a partir da seguinte. Em um ano de 365,25 dias isso rende exatamente (1,004)^12 − 1 = 4,9070% a.a. (erro 5e-15). Consequência: o rendimento de um mês de 4 semanas é 0,368% e o de um mês de 5 semanas é 0,460% (média 0,4%). Tudo é aplicado de modo uniforme: o modelo com essa regra reproduz o extrato sem resíduo; trocar para 0,401% já produz um erro de R$ 121.618 (teste de poder).
- **Participação**: entre dois valores-alvo o crescimento é geométrico constante; o preço de venda é também um alvo no mês da venda; a taxa a.a. só vale depois do último alvo. A venda ocorre na semana de abertura do mês da venda, e a participação sai ao último valor marcado (mês 95), entrando o preço no financeiro.
- **Caixinha**: perfil (0,4/0,5/0,6% ao mês) até 24 meses antes da data; conservadora (0,4%) nos últimos 24 meses; objetivo com 24 meses ou menos nasce conservador. Aporte na 4ª semana do ciclo, igual ao planejado até a caixinha "bastar" (rende até a data e cobre 101% do valor).

### 2.2 Participação (frente B)

Fórmula: v(m) = v0·(v1/v0)^((m−m0)/(m1−m0)) por trecho (mês 0→72: 400.000 → 1.200.000; mês 72→96: 1.200.000 → 1.500.000). O ritmo que o motor "refaz a cada mês" para chegar ao alvo equivale à forma fechada.

| Mês | Esperado | Motor | Erro |
|---|---|---|---|
| 36 (400.000·3^(36/72)) | 692.820,32 | 692.820,32 | 0,00 |
| 72 | 1.200.000,00 | 1.200.000,00 | 0,00 |
| 84 (1,2 mi·1,25^(12/24)) | 1.341.640,79 | 1.341.640,79 | 0,00 |
| 95 | 1.486.118,16 | 1.486.118,16 | 0,00 |
| 96 (preço) | 1.500.000,00 | 1.500.000,00 | 0,00 |

Os 97 pontos da série, o `fim.det.parts` e o `fim.part` dos 762 meses batem (erro máximo 4,7e-10, zero depois da venda, nunca negativa).

Venda no mês 96: preço 1.500.000; assessoria 2% = 30.000; imposto 165.000; custo total 195.000; líquido 1.305.000; saída da participação (`mov_bens` −1.500.000), custos como saída do fluxo (`out_vendap_0` 195.000), R$ 600.000 transferidos para a caixinha do apartamento (`mov_obj_apto` 601.432 = 600.000 + aporte 1.432) e R$ 705.000 ao financeiro livre (`mov_cofre` do mês 96 = +706.068 = 705.000 + sobra de 1.068 do mês). Depois da venda a participação é zero até o mês 761 e os lucros (R$ 30 mil em mar/set) param: 16 meses com lucro antes da venda (mar e set de 2027 a 2034), 0 depois.

Sem dupla contagem: o patrimônio cai R$ 170.661,88 no mês 96 = −195.000 (custos) + 13.881,84 (marcação do preço 1.500.000 sobre o último valor 1.486.118,16) + 10.456,28 (fluxo líquido do mês e rendimento). Conferido contra o extrato com erro 0,00.

### 2.3 Caixinhas (frente D)

Saldo mês a mês: o modelo semanal independente (taxa devida, aportes do programa, dedicado de R$ 20.000 na semana de hoje, R$ 600.000 da venda na semana de abertura do mês 96, saque na semana de abertura do mês da data) reproduz o saldo das 3 caixinhas nos 762 meses com erro 0,00. Amostra (fim do mês; sabático / MBA / apartamento):

| Mês | Esperado = motor |
|---|---|
| 0 | 23.257,50 / 0 / 1.433,97 |
| 11 | 59.981,82 / 0 / 17.762,58 |
| 12 | 0 / 4.778,38 / 19.319,16 (sabático realizado; MBA começa a receber) |
| 35 | 0 / 120.077,48 / 57.403,80 |
| 36 | 0 / 0 / 59.152,56 (MBA realizado) |
| 95 | 0 / 0 / 185.365,96 |
| 96 | 0 / 0 / 789.219,94 (185.365,96 + 600.000 + 1.432 + rendimento) |
| 119 | 0 / 0 / 899.547,32 |

**Taxa por mês** (`taxaPorMes`): 171 pares objetivo/mês, erro 0. Troca exata: sabático nunca troca (12 meses: conservador de 0 a 12); MBA troca no mês 12 (0,5% → 0,4%; esperado 36−24 = 12); apartamento troca no mês 96 (0,6% → 0,4%; esperado 120−24 = 96). Nenhum mês com taxa diferente da devida.

**Aportes**: sabático 12 de R$ 3.181 (meses 0 a 11); MBA 24 de R$ 4.774 (meses 12 a 35); apartamento 120 de R$ 1.432 (meses 0 a 119); zero fora desses meses. Nenhum corte por falta de caixa (folga mínima da regra "caixinha já basta": R$ 437,67 acima do planejado, no sabático). A regra de parada do aporte não é exercida neste plano; foi exercida em variante (apartamento com R$ 2.500/mês): para no mês 60 (aporte parcial de R$ 1.183,68) e retoma uma sobra de R$ 449 no mês 96, igual ao previsto pelo modelo (erro 2,5e-11).

**Saque na data**: sabático retira 60.036,92, gasta 60.000, devolve 36,92 ao cofre; MBA retira 120.187,78, gasta 120.000, devolve 187,78; apartamento retira 900.373,56, compra o bem por 900.000 (`mov_bens`) e devolve 373,56. Caixinha zerada e nunca negativa depois.

**Fórmulas do cenário reconferidas**: 600.000·1,004^24 = 660.328,98 (cenário: 660.329); 600.000·1,006^24 = 692.632,38; diferença R$ 32.303,40 (cenário: 32.303); fator de aportes do apartamento = 167,447; aporte necessário R$ 1.431,32 (plano usa 1.432, arredondado para cima); MBA 120.000/25,137 = R$ 4.773,83 (4.774); sabático R$ 3.180,63 (3.181).

**Impacto se uma caixinha ficasse em uma taxa só** (mesmos aportes, saldo no mês anterior à data):

| Cenário | Sabático | MBA | Apartamento |
|---|---|---|---|
| Como está (regra dos 24 meses) | 59.981,82 | 120.077,48 | 899.547,32 |
| Tudo conservador | igual (já é) | igual (já é) | −19.955,98 |
| Perfil escolhido o tempo todo (moderado/moderado/agressivo) | +462,50 | +1.427,10 | +42.540,02 |
| Só os R$ 600 mil da venda, 24 meses a 0,6% em vez de 0,4% | — | — | +32.303,40 |

Aporte mensal necessário em regimes alternativos: apartamento R$ 1.431 (como está), R$ 1.185 se ficasse agressivo até o fim, R$ 1.560 se tudo conservador; MBA R$ 4.774 (R$ 4.718 se fosse moderado); sabático R$ 3.181 (R$ 3.143 se fosse moderado).

### 2.4 Contabilidade geral (frente A)

Em cada um dos 762 meses: `fin = cofre + soma das caixinhas` (erro 0); Σ(`mov_cofre` + `mov_obj_*` + `mov_bens`) = entradas − saídas (erro 0: nada criado, nada perdido; transferências cofre/caixinhas/bens/participação somam zero); sem NaN/Infinity; nenhum saldo negativo; dívida e cheque especial = 0. Patrimônio (financeiro + bens + participações − dívidas): mês 0 R$ 745.528,78; mês 95 R$ 2.642.218,03; mês 96 R$ 2.471.556,15; mês 120 R$ 2.784.216,41; mês 221 R$ 4.532.156,40; mês 648 (90 anos) R$ 6.802.022,22; mês 761 R$ 8.800.488,51. Rendimento implícito dos meses 1 a 12: R$ 18.886,84 (conferido pelo modelo semanal; ordem de grandeza 4,9% a.a. sobre o saldo).

### 2.5 Fluxo (frente F) e liberdade (frente G)

- Meses 1 a 220: pró-labore 14.000 (dia 5, semana 1), lucros 30.000 em mar e set (dia 20, semana 3 ou 4 do ciclo; só até set/2034), aluguel 4.200 até o mês 119 (a linha termina no mês da compra, 120), saúde 1.100 na 4ª semana, 6.200 de despesas variáveis diluídas em 4 fatias: 1.760 pares mês/linha, erro 0. Meses de borda (11, 12, 36, 95, 96, 97, 119, 120, 121, 221, 341): erro 0 em todas as linhas.
- Mês 0 (parcial): a semana do dia 5 de out/2026 (semana 1909) é anterior a hoje (10/10); por isso o mês 0 traz 3 das 4 fatias das despesas variáveis (R$ 1.650 de mercado, não 2.200), a saúde e nenhum pró-labore nem aluguel. Coerente com "hoje = 10/10" e com o saldo informado já incluir o salário de outubro.
- Liberdade: gatilho na semana 2870 (mês 221, março/2045, 55,003 anos): motor e modelo coincidem; financeiro de R$ 3.638.140,98 nos dois. Do mês 222 em diante a soma das saídas é exatamente R$ 16.000 em todos os meses (479 meses conferidos) e o saque do financeiro é 16.000 até o mês 340 e 9.500 (16.000 − INSS 6.500) a partir do mês 341 (INSS aos 65 = março/2055 = mês 341).
- Ruína: testada em variante (mercado de R$ 40.000/mês): o caixa livre (cofre) zera no mês 10, as caixinhas cobrem, o primeiro mês que fecha negativo é o 11 e `ruina.mi` = 11; juros do mês 12 = R$ 185,23 = 4% × R$ 4.630,8 em aberto e do mês 13 = R$ 4.004,64 = 4% × saldo em aberto (erro < R$ 0,01).

### 2.6 Dívidas (frente C)

No cenário: `div` e `cheque` = 0 nos 762 meses; `dividas` e `dividasAvulsas` vazias; nenhuma `out_juros`, `out_quita`, `in_credito`. Mecanismo, recalculado do zero em variantes (taxa mensal = (1+a.a.)^(1/12) − 1; IOF pessoa física 0,38% + 0,0082% ao dia sobre cada amortização, no máximo 365 dias, com contagem 30·parcela; saldos, parcelas, juros pagos = Σ parcelas − principal):

| Variante | Resultado (erro máximo) |
|---|---|
| Price isento 100.000, 60x, 12% a.a. | saldo mês a mês 0..80 e quitação em zero; juros 31.614,18; erro 1,5e-11 |
| SAC isento 100.000, 60x, 12% a.a. | juros 28.940,82; erro 1,5e-11 |
| Price com IOF financiado 80.000, 48x, 18% a.a. | IOF 2.570,81 somado ao financiado (82.570,81); juros 31.109,75; erro 9e-12 |
| Price com antecipação de 20.000 (prazo, mês 12) e 10.000 (parcela, mês 24) | juros 23.384,70; erro 1,5e-11 |
| Imóvel financiado (saldo 200.000, 12% a.a., 120x) vendido por 600.000 no mês 60 com 6% de corretagem | saldo mês a mês, parcela no fluxo (2.798,94), quitação R$ 127.597,66, líquido R$ 436.402,34, parcela cortada na venda, dívida e bem zerados: erro 6e-11 |
| Compra financiada do apartamento (entrada 300.000, financia 600.000, 60x Price, 10% a.a.) | parcela R$ 12.621,35 no fluxo (meses 120 a 179), bem = entrada + amortizações até 900.000, juros pagos R$ 157.280,94: erro 5e-10 |

## 3. Conferências realizadas

Tolerância R$ 0,01 salvo indicação. "Erro máximo" em reais (ou unidade do item). Todas dentro da tolerância; os itens P1 a P3 são testes de poder (o procedimento tem de detectar uma perturbação; o "erro máximo" 0 significa "detectou").

| # | O que foi conferido | Método | Amostra | Erro máximo | Resultado |
|---|---|---|---|---|---|
| F0 | Calendário: semana inicial/final de cada mês (dia 5) | recálculo com datas (UTC) a partir do nascimento 1990-03 | 762 meses (o balde do mês 0 do extrato abre na semana 1905, antes da semana do dia 5 de out/2026 = 1909: o ciclo de set/2026 é agrupado no índice 0 — só rótulo, sem flux… | 0,00 | OK |
| F0b | W0 (semana de hoje) e mês 0 | idade exata x 365,25/7 | W0=1910 (extrato 1910); mês 0 = 2026-10 | 0,00 | OK |
| B1 | Participação: série mensal do valor (alvos 72 e 96, geométrica) | v0·(v1/v0)^((m−m0)/(m1−m0)) por trecho | 97 pontos (meses 0..96) de parts[0].serie | 4,7e-10 | OK |
| B2 | Participação: fim.det.parts[0] mês a mês (zero depois da venda) | idem + zero a partir do mês da venda | 762 meses | 4,7e-10 | OK |
| B3 | Participação: fim.part mês a mês | idem | 762 meses | 4,7e-10 | OK |
| B4 | Participação: série nunca negativa/NaN | varredura | 97 pontos | 0,00 | OK |
| B5 | Venda: preço, custos (2% e 165k), líquido, saída da participação, destino 600k | recálculo direto do plano + conferência do fluxo do mês 96 | preço: esp 1.500.000,00 / motor 1.500.000,00; custo jurídico 2%: esp 30.000,00 / motor 30.000,00; imposto: esp 165.000,00 / motor 165.000,00; custo total: esp 195.000,00… | 0,00 | OK |
| B6 | Renda ligada à participação (lucros) termina na venda | contagem de meses com in_lucros | antes: 16 meses (esperado 16: mar e set de 2027 a 2034 = 2x8), depois: 0 | 0,00 | OK |
| E1 | Modelo semanal independente x extrato: financeiro total (fim de cada mês) | simulação própria (P1-P5) a partir do plano | 762 meses (0..761) | 0,00 | OK |
| E2 | Modelo independente x extrato: cofre (financeiro livre) | idem | 762 meses | 0,00 | OK |
| D1 | Modelo independente x extrato: saldo de cada caixinha (3 objetivos) no fim de cada mês | idem | 762 meses x 3 objetivos | 0,00 | OK |
| A1 | Bens (compra do apartamento) mês a mês | idem | 762 meses | 0,00 | OK |
| B7 | Participações (soma) mês a mês pelo modelo semanal | idem | 762 meses | 4,7e-10 | OK |
| F1 | Fluxo: toda linha in_*/out_*/mov_* de cada mês (valor e existência) | modelo próprio de entradas, saídas, aportes, vendas e transferências | 762 meses x 9+ linhas (5513 pares mês/linha) | 0,00 | OK |
| G1 | Liberdade financeira: mês e semana do gatilho | 1ª semana de abertura de mês com idade >= 55 | modelo mês 221/sem 2870; motor mês 221/sem 2870 | 0,00 | OK |
| G2 | Liberdade financeira: patrimônio financeiro no gatilho | modelo próprio | modelo 3.638.140,98 x motor 3.638.140,98 | 0,00 | OK |
| A2 | fim.fin = cofre + soma das caixinhas | identidade | 762 meses | 0,00 | OK |
| A3 | Conservação: Σ variações (mov_cofre + mov_obj_* + mov_bens) = entradas − saídas | soma das linhas mov_* contra Σin − Σout | 762 meses | 0,00 | OK |
| A4 | Sem NaN/Infinity e sem saldos negativos (cofre, caixinhas, bens, participações, dívida) | varredura | 762 meses | 0,00 | OK |
| A5 | Dívida (div) e cheque especial = 0 em todos os meses (controle: cliente sem dívida) | varredura | 762 meses | 0,00 | OK |
| A6 | Venda (mês 96): Δpatrimônio = (preço − participação marcada) + (entradas − saídas, já com os 195k de custo) + rendimento; sem contar a venda duas vez… | balanço do mês | Δ observado -170.661,88 x calculado -170.661,88 | 0,00 | OK |
| A7 | Participação não é afetada por fluxo de caixa (só valorização/venda) | part observada x fórmula | 761 meses | 4,7e-10 | OK |
| D8 | Regra de parada do aporte (variante: apartamento com aporte de 2.500/mês): aporte = min(planejado, o que falta com 1% de folga) | programa de aportes recalculado | aportes até o mês 96 (62 de 120); último aporte parcial 1.183,68 no mês 60; depois, zero | 2,5e-11 | OK |
| D2 | Parâmetros: perfis 0,4/0,5/0,6% a.m., R_M 0,4%, janela de 24 meses | comparação com o extrato | PROFILES, R_M, MESES_CONSERVADOR | 0,00 | OK |
| D3 | taxaPorMes de cada objetivo = taxa devida (perfil antes dos últimos 24 meses; conservadora depois) | regra P4 | 171 pares objetivo/mês | 0,00 | OK |
| D4 | Aporte do apartamento: fator (96 meses a 0,6% levados 24 meses a 0,4% + 24 meses a 0,4%) e aporte necessário | fórmula fechada mensal (aportes no fim do mês) | fator 167.447 (cenário 167,447); aporte 1431.32 (planejado 1.432) | 0,00 | OK |
| D5 | Aportes mensais (mov_obj_*) = planejado em todo mês ativo; zero antes do início, depois da data e quando a caixinha "basta" (regra de 1% de folga) | recálculo do programa de aportes | 2283 pares mês/objetivo; meses com corte por falta de caixa: 0 | 0,00 | OK |
| D6 | Saque na data: gasto = valor do objetivo (consumo vai a out_obj_*, bem a mov_bens); a sobra volta ao cofre; caixinha zera | leitura do fluxo do mês da data | sabatico: retirado 60.036,92, gasto 60.000,00, volta 36,92; mba: retirado 120.187,78, gasto 120.000,00, volta 187,78; apto: retirado 900.373,56, gasto 900.000,00, volta … | 0,00 | OK |
| D7 | Caixinha zerada depois da data e saldo nunca negativo | varredura | todos os meses >= data | 0,00 | OK |
| F2 | Fluxo mensal (meses 1 a 220): cada renda e despesa = plano (pró-labore 14k, lucros 30k em mar/set até a venda, 11.500 de gastos, aluguel até o mês 11… | soma mensal do plano x extrato | 1760 pares mês/linha | 0,00 | OK |
| F3 | Mês 0 (parcial): só 3 das 4 fatias de despesas variáveis, saúde na 4ª semana, sem pró-labore/aluguel (caíram dia 5, antes de hoje=10/10) | regra de calendário (semana do dia 5 < W0) | mês 0 | 0,00 | OK |
| G3 | Após a liberdade: soma das saídas do mês = renda desejada (16.000), sempre (padrão de vida reescalado) | Σ out_* por mês | 479 meses (222..700) | 0,00 | OK |
| G4 | Saque líquido do financeiro: 16.000 até o mês 340 e 9.500 (16.000 − INSS 6.500) a partir do 341 | mov_cofre | meses 221..700 | 0,00 | OK |
| E3 | Convenção: 52,18 semanas de fator (1,004)^(7/30,4375) rendem exatamente (1,004)^12 − 1 ao ano | aritmética | 4.9070% a.a. | 5,1e-15 | OK |
| H1 | Valores esperados à mão do cenário (participação 36/72/84/96, líquido, 600k→660.329, aportes 3.181/4.774) x motor | comparação direta (tolerância R$ 1 pelos arredondamentos do cenário) | 9 valores | 0,32 | OK |
| C1 | Dívida sintética: Price isento 100k, 60x, 12% a.a. | tabela de amortização própria (taxa mensal = (1+a.a.)^(1/12)−1), IOF 0,38%+0,0082%/dia | saldo mês a mês 0..80; 60 parcelas; juros pagos 31.614,18 = Σparcelas − principal (100.000,00) | 1,5e-11 | OK |
| C2 | Dívida sintética: SAC isento 100k, 60x, 12% a.a. | tabela de amortização própria (taxa mensal = (1+a.a.)^(1/12)−1), IOF 0,38%+0,0082%/dia | saldo mês a mês 0..80; 60 parcelas; juros pagos 28.940,82 = Σparcelas − principal (100.000,00) | 1,5e-11 | OK |
| C3 | Dívida sintética: Price com IOF financiado 80k, 48x, 18% a.a. | tabela de amortização própria (taxa mensal = (1+a.a.)^(1/12)−1), IOF 0,38%+0,0082%/dia | saldo mês a mês 0..80; 48 parcelas; juros pagos 31.109,75 = Σparcelas − principal (82.570,81) | 9,1e-12 | OK |
| C4 | Dívida sintética: Price isento 100k, 60x, antecipação 20k no mês 12 (prazo) e 10k no mês 24 (parcela) | tabela de amortização própria (taxa mensal = (1+a.a.)^(1/12)−1), IOF 0,38%+0,0082%/dia | saldo mês a mês 0..80; 60 parcelas; juros pagos 23.384,70 = Σparcelas − principal (100.000,00) | 1,5e-11 | OK |
| C5 | Imóvel financiado vendido no mês 60 (variante): saldo, parcela, quitação, custos e líquido | Price: saldo(k)=B0·(1−(1+i)^−(n−k))/(1−(1+i)^−n) | saldo devedor mês a mês 0..59: 2.9e-11; parcela no fluxo (out_fix) meses 0..59: 0,00; quitação na venda (out_quita_0): 1.5e-11; custos da venda: 0,00; líquido da venda: … | 5,8e-11 | OK |
| C6 | Compra financiada do apartamento (variante): parcela no fluxo, bem = entrada + amortizações, quitação em 60 parcelas | Price i=(1,10)^(1/12)−1 | parcela 12.621,35; juros pagos 157.280,94 = Σparcelas 757.280,94 − principal 600.000,00; bem final 900.000 | 4,7e-10 | OK |
| P1 | Teste de poder — o procedimento deve DETECTAR: rendimento do financeiro 0,401% em vez de 0,400% | modelo perturbado x extrato (erro máximo em financeiro, cofre e caixinhas) | 762 meses | detectou R$ 121.618,13 | OK |
| P2 | Teste de poder — o procedimento deve DETECTAR: taxa da caixinha pelo mês da própria semana (sem defasagem de uma semana) | modelo perturbado x extrato (erro máximo em financeiro, cofre e caixinhas) | 762 meses | detectou R$ 1.207,19 | OK |
| P3 | Teste de poder — o procedimento deve DETECTAR: sem o destino de 600k da venda para o apartamento | modelo perturbado x extrato (erro máximo em financeiro, cofre e caixinhas) | 762 meses | detectou R$ 659.506,74 | OK |
| G5 | Ruína dispara no mês que fecha com o financeiro negativo (variante: mercado 40.000/mês) | teste de estresse | primeiro mês negativo 11; ruina.mi = 11 | 0,00 | OK |
| G6 | Juros da dívida do mês seguinte = 4% x saldo negativo do fim do mês anterior (caixinhas cobrem antes de a reserva ficar negativa) | teste de estresse | observado 185,23 x esperado 185,23 | 0,00 | OK |
| G6b | Juros do segundo mês em dívida = 4% x saldo em aberto | teste de estresse | observado 4.004,64 x esperado 4.004,64 | 0,00 | OK |

## 4. Contas erradas encontradas

Nenhuma conta erra além de R$ 0,01 no extrato deste cliente. O que tentei para quebrar o motor: (a) refiz o cenário inteiro em um modelo semanal independente e comparei 762 meses × (cofre, 3 caixinhas, bens, participação, 5.513 pares de linhas de fluxo); (b) perturbei o modelo (rendimento 0,401%, taxa sem defasagem, sem o destino de R$ 600 mil) para provar que a comparação teria acusado diferenças pequenas (detectou R$ 121.618, R$ 1.207 e R$ 659.507); (c) recalculei os valores "à mão" do cenário; (d) rodei 12 planos-variante (ruína antes da liberdade, esgotamento na liberdade, aporte que para, 7 de dívida, 2 de sensibilidade); (e) testei outros fusos horários (America/New_York, Europe/Lisbon, Asia/Tokyo, UTC): extrato idêntico. Foram achados, porém:

**1. Defasagem de uma semana na troca de taxa da caixinha (imprecisão de convenção; impacto desprezível).**
- Sintoma: na semana que abre cada mês, o crescimento das caixinhas usa a taxa do mês anterior. Na troca do apartamento (mês 96) a primeira semana do mês ainda rende 0,6% sobre os R$ 185.366 já guardados em vez de 0,4%.
- Mês(es): 96 (apartamento); mês 12 (MBA) sem efeito porque o saldo é zero.
- Esperado × obtido: saldo do apartamento no fim do mês 119 = 899.453,96 (taxa do mês da própria semana) × 899.547,32 (motor): motor R$ 93,36 maior; no mês 120 o excedente devolvido ao cofre é R$ 93,70 maior; o efeito composto no patrimônio chega a R$ 1.207,19 aos 100 anos (R$ 140,21 no mês 221), sempre a favor do motor. Os R$ 600 mil da venda não são afetados (entram no fim da semana de abertura e rendem 100% à conservadora).
- Origem: motor, `simula()`, linha 1980 (`obj = obj.map((b, k) => b * Math.pow(1 + taxaNoMes(TX[k], m ? m.mIdx : 0), 7 / 30.4375))`): usa `m.mIdx`, que só é atualizado para o novo mês na linha 2096 (`m = { t, mIdx: ... }`), depois do crescimento da semana. A regra violada: "a partir do mês `mesDoConservador` (linha 1233) vale a taxa conservadora".
- Sugestão (não aplicada): calcular o índice do mês da semana antes do crescimento (quando `dia5Da(i)` existe, usar o `mIdx` do novo mês) ou documentar que a taxa de cada mês vale a partir da segunda semana. Como a diferença é de 0,01%, a decisão é de produto.

**2. Inconsistência de campo: `initialBens` soma `mercado`, a trajetória usa `mercado ?? valor` (latente; não afeta este cliente).**
- Sintoma: em variante com um bem que traz só `valor` (sem `mercado`), a trajetória do bem parte de `valor`, mas o patrimônio inicial em bens é 0; na venda o motor subtrai o valor do bem e o `bens` fica **negativo** (−R$ 500.000 no mês da venda da variante).
- Origem: `sincronizaPatrimonio`, linha 2717 (`plan.initialBens = somaDe(P.bens, 'mercado')`) contra `trajetoriaDoBem`, linha 1786 (`b.mercado != null ? b.mercado : b.valor`). Tradução do consultor: sempre preencher `mercado`. Sugestão: somar `mercado ?? valor` nas duas pontas ou validar o plano.

**3. Valores esperados do cenário**: nenhum erro de conta. Diferenças: aporte do apartamento 1.431 no cenário contra 1.432 no plano (arredondamento para cima do necessário de 1.431,32); participação no mês 36 692.820 (cenário) contra 692.820,32.

**4. Dado inconsistente do cliente (não é erro do motor): 3% a.a. entre 2032 e 2034 contra preço de venda de R$ 1,5 mi.** 1,2 mi a 3% a.a. dá R$ 1.273.080 no mês 96, não 1.500.000 (seria 11,8% a.a.). O motor segue o dado explícito (alvo e preço) e ignora os 3%. Consequências medidas: a participação aparece R$ 105.641 acima do que os 3% dariam no mês 84 (1.341.641 contra 1.236.000) e R$ 216.170 acima no mês 95 (1.486.118 contra 1.269.948); se o preço real fosse 1.273.080, o financeiro aos 55 seria R$ 310.067 menor (R$ 3.328.074 contra R$ 3.638.141). A venda em dinheiro (R$ 1.305.000 líquidos) só está certa se o preço de 1,5 mi for o correto: perguntar à cliente. Também o imposto de R$ 165.000 foi calculado sobre o ganho em relação ao valuation atual (R$ 400 mil), e não sobre o custo de aquisição da participação; se o custo for menor, o imposto de 15% sobe (a confirmar com a contabilidade).

## 5. Comportamentos por desenho que o dono do produto deveria conhecer

1. **A taxa de 3% é letra morta** quando há preço de venda (alvo pendente): números na seção 4, item 4. O motor não avisa.
2. **Perfil escolhido não vale nos 24 últimos meses**: o sabático (12 meses) e o MBA (36) praticamente nunca rendem o perfil "moderado"; o apartamento rende "agressivo" só 96 dos 120 meses. O campo `profile` do sabático não tem efeito algum. O custo para a cliente: o aporte do apartamento é R$ 1.431 em vez de R$ 1.185 se ficasse agressivo até o fim (R$ 246/mês, 17%); os R$ 600 mil da venda rendem R$ 32.303 a menos que se ficassem agressivos (premissa explícita do produto, de segurança).
3. **Pró-labore depois da venda é premissa do consultor e muda tudo**: com o pró-labore de R$ 14.000 até os 55 (mês 221), o financeiro aos 55 é R$ 3.638.141 e aos 90 é R$ 5.902.022. Se o pró-labore parasse na venda (mês 96), o financeiro aos 55 seria R$ 1.364.577 (−R$ 2.273.564) e aos 90 sobrariam R$ 10: o plano só fecha por poucos reais. Qualquer cliente que vende a empresa e some da folha precisa dessa pergunta.
4. **Liberdade "forçada" por um teste de perpetuidade**: `forced: true`, "sustenta R$ 14.553" porque o teste é financeiro × 0,4% ≥ maior lacuna mensal (linha 2086), sem INSS e sem prazo. Capital necessário aos 55 para pagar R$ 16.000 até os 65 e R$ 9.500 depois: R$ 2.549.390 até os 90 e R$ 2.718.434 até os 100, contra R$ 3.638.141 disponíveis (folga de R$ 1,09 mi aos 90). O rótulo "Requer revisão" contradiz a própria simulação (o financeiro cresce até R$ 5,9 mi). Isso é, sim, uma distorção relevante para o cliente.
5. **Esgotamento silencioso dentro da liberdade**: o saque é limitado ao cofre (linha 2112) e as despesas são reescaladas para o que sobra; a ruína só dispara em mês com cofre negativo. Em variante com renda desejada de R$ 80.000, o financeiro zera no mês 272, `ruina` fica nulo e as saídas caem para R$ 0 até o INSS (mês 341) e depois R$ 6.510. O plano que acaba aparece como padrão de vida encolhendo, sem alerta.
6. **Despesas reescaladas após a liberdade**: o total é sempre a renda desejada (R$ 16.000), mas a composição é fictícia (mercado 4.822 contra 2.200; saúde 2.411 contra 1.100; fator 2,19). Sem impacto no total nem no patrimônio.
7. **Rendimento real de 0,4% a.m. (4,9% a.a.) constante, também na aposentadoria**: é a hipótese que faz o financeiro crescer de R$ 3,6 mi (55 anos) a R$ 5,9 mi (90). Não é parâmetro do cliente.
8. **Rendimento mensal irregular**: mês de 4 semanas rende 0,368% e de 5 semanas 0,460% (a média anual é exata). Quem comparar o rendimento mês a mês vai ver essa oscilação. A semana de hoje rende por inteiro mesmo que hoje seja o terceiro dia dela (a semana de hoje começa em 08/10: cerca de R$ 90 a mais sobre R$ 350 mil).
9. **O sabático é uma saída única no mês 12** (R$ 60.000 de uma vez), e o apartamento comprado não se valoriza nem tem condomínio/IPTU (R$ 900.000 constantes por 40 anos); o aluguel (R$ 4.200) já não é cobrado no próprio mês 120, mês da compra.
10. **Participação marcada bruta até a venda**: o patrimônio carrega R$ 1,49 mi em set/2034 e cai R$ 170.662 no mês da venda (custos de 13% do preço); o gráfico mostra um degrau para baixo que é real, não erro.
11. **Compra financiada de objetivo não entra em `div`**: o bem aparece pela parte já paga (R$ 307.837 no mês 120 da variante, não R$ 900.000) e a dívida de R$ 600.000 não aparece; o patrimônio líquido está certo, mas ativos e dívidas ficam subestimados e um indicador de endividamento lerá zero.
12. **Dívida avulsa sem linha de despesa**: o saldo amortiza (R$ 100.000 → R$ 57.036 em 30 meses na variante) mas nenhuma parcela sai do caixa (diferença no financeiro: R$ 0,00); o patrimônio líquido sobe sem dinheiro sair. A parcela só sai do caixa se o consultor lançar a linha de despesa (`linha`) no Fluxo.
13. **Reserva de emergência de R$ 70.000 não é piso**: o cofre nunca fica abaixo de R$ 317.454 (mês 4) neste plano, mas o motor não o impede. O horizonte vai a 100 anos independentemente de `lifeExp` 90. Imposto de renda do rendimento não existe (retorno real líquido).
14. **Valores "projetado" e "real" do objetivo**: o campo `projected` é o modelo mensal com aporte no fim do mês (MBA 120.004,40; apartamento 900.113,15) e `real` é a simulação semanal (120.187,78; 900.373,56): ambos corretos para a convenção deles, a diferença de 0,04% a 0,15% vem do aporte cair na 4ª semana.

## 6. Limites desta auditoria

- **Não coberto**: consórcio (`caixaDoConsorcio`, `contratoDoConsorcio`), créditos novos (`contratoDoCredito`), fundo de pensão/FGTS (`caixasDePrevidencia`, tábua BR-EMSsb), seguros, IR/tributário, fluxo de caixa do portal, telas e textos. O cliente não usa nenhum desses; só o mecanismo de dívida comum, de compra financiada e de venda de bem financiado foi exercido, em variantes.
- **Corte de aporte por falta de caixa**: neste plano não há corte (zero meses); o auditor calcula a condição, mas a distribuição do corte entre objetivos (`programaDosAportes`, linhas 2258 a 2263) não foi reimplementada nem validada.
- **IOF**: validei a regra do motor (0,38% + 0,0082% ao dia, contagem de 30 dias por parcela), não a incidência real da Receita (dias corridos reais, alíquota de pessoa jurídica).
- **Dívidas só em variantes sintéticas** (o cliente não tem dívida); confirmei saldo, parcela do fluxo, quitação e líquido, não a CET nem seguros.
- **Pré-requisito de leitura**: o extrato só tem fim de mês; a prova semanal é indireta (modelo semanal reproduz o fim de cada mês com erro 0), não há comparação de cada uma das 3.309 semanas. A semana W0 (hoje) e o mês 0 foram conferidos ao nível do mês.
- **Premissas de domínio não julgadas**: rentabilidades reais (0,4/0,5/0,6% ao mês), retorno de 4,9% a.a. na aposentadoria, ganho de capital de 15% sobre R$ 1,1 mi, valuation da agência. Foram tratadas como dado do plano.
- **Independência**: o auditor reimplementa as regras olhando o código do motor para aprender o desenho (as convenções P1 a P5 vêm de lá); a prova é de coerência aritmética e de que as regras foram aplicadas de modo uniforme, não de que as regras de desenho sejam as melhores. Os testes de poder mostram que um desvio de 0,001 ponto percentual no rendimento não passaria despercebido.
