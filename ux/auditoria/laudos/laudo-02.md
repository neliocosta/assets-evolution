# Laudo de auditoria matemática — Cenário 02 (Rafael e Camila Souza)

Código: `ux/auditoria/laudos/auditor-02.js` (reexecutável: `node ux/auditoria/laudos/auditor-02.js`; 42 conferências, 7 delas falham de propósito, porque medem o que o motor deveria fazer). Plano auditado: `planos/plano-02.json`; observado: `extratos/extrato-02.json` (regenerado e idêntico) e a série semanal da mesma execução (somente leitura, para as identidades semana a semana). Mês 0 = outubro/2026; semana de hoje = 2159.

## 1. Veredito

**A evolução patrimonial NÃO está livre de erro: participações, caixinhas, contabilidade e fluxo fecham ao centavo, mas há erros reais em dívidas (amortização e quitação aparecem na dívida com um mês de atraso) e na liberdade financeira (o saque do FGTS é gasto e as parcelas são escaladas pelo "padrão de vida").**

| Frente | Semáforo | Em uma linha |
|---|---|---|
| Participações | **CERTO** | Série de 704 meses idêntica ao recálculo (erro 0,00); salto de −30% e venda (testada em variante) corretos. |
| Caixinhas | **CERTO** (com ressalvas de desenho) | Taxa certa em todos os 3.060 semanas × 4 caixinhas; troca de taxa no mês exato (mi 12, 36, 96); nenhum mês na taxa errada. |
| Contabilidade geral | **CERTO** | Todas as identidades fecham a R$ 0,00 (mas a contabilidade herda as dívidas erradas, abaixo). |
| Fluxo | **CERTO COM RESSALVAS** | 4.617 células entrada/saída do plano idênticas antes da liberdade; ressalvas: SAC em degraus anuais (+R$ 7.800,86 pagos a mais) e mês 0 parcial. |
| Dívidas | **ERRADO** (impacto moderado) | Extras caem na dívida 1 mês depois do caixa (patrimônio −R$ 60.419 em out/2029); saldo declarado ancorado na parcela errada; dívida zera 1 mês depois do último pagamento. |
| Liberdade / ruína | **ERRADO** (impacto moderado) | Os R$ 85.000 do FGTS viram gasto do mês; parcelas de dívida são multiplicadas por um fator de padrão de vida (4,23× em mai/2047). Sem ruína, o cálculo de "forçada" confere. |

## 2. Por que a matemática está certa (onde está) — fórmulas e provas

**Premissas explícitas (decisões de desenho, conferidas quanto à consistência de aplicação):**
- Taxas de perfil são **reais ao mês**: conservador 0,4% (4,907% a.a.), moderado 0,5%, agressivo 0,6%. Rendimento do financeiro livre: 0,4% a.m. = (1,004)¹² − 1 = 4,9070% a.a.
- O motor é **semanal**: cada semana rende `(1+r)^(7/30,4375)` sobre o saldo de abertura (antes dos fluxos da semana). O mês do motor vai de um dia 5 ao seguinte (4 ou 5 semanas: 458 meses de 4 e 245 de 5 neste plano). A taxa da semana é a do mês em que a semana *começa* (intervalo [i−1, i]).
- Regra das caixinhas: perfil escolhido até 24 meses antes da data; conservador nos últimos 24; objetivo com até 24 meses nasce conservador.
- Dívida: com parcela informada, a taxa mensal é derivada dela; o saldo informado manda hoje e o contrato dá o caminho até zero.

**B. Participação (Loja de bicicletas).** Regra: `v(m) = v(m−1)·0,92^(1/12)` para m = 1..48; no mês 18, `v ← v·0,7`; depois constante. Prova:
- mês 12: esperado 276.000,00; motor 276.000,00; erro 0,00.
- mês 17: 266.575,77 = motor; mês 18 (já com −30%): 185.310,93 = motor (cenário: 185.311).
- mês 48 em diante: 150.442,52 = motor (cenário: 150.443). Salto esperado −79.418,97; evento do motor −R$ 79.419.
- 704 pontos de `parts[0].serie` e 705 meses de `fim.det.parts[0]`: erro máximo 0,000000; nunca negativa. O plano não tem venda nem distribuição de lucros: nenhuma linha de fluxo ligada (correto).
- **Estresse (variante com venda)**: venda em mi 30 por R$ 180.000, custos 5% + R$ 3.000, R$ 20.000 para a reforma. Série com alvo (ritmo geométrico) erro 0,00; preço 180.000, custos 12.000, líquido 168.000 (esperado idênticos); participação zero depois da venda; R$ 20.000 entram na caixinha da reforma e R$ 148.000 no financeiro.

**C. Dívidas — o que está certo.** Tabela Price/SAC reconstruída com código próprio (taxa derivada: Price por bisseção, SAC em forma fechada):

| Dívida | Sistema | k0 | Taxa implícita | Saldo contratual antes / depois da parcela de hoje | Declarado |
|---|---|---|---|---|---|
| Apartamento | Price 600.000, 360x | 45 | 0,7208% a.m. = 9,000% a.a. | 581.342,29 / 580.855,33 | 581.000 |
| Sala | SAC 200.000, 180x | 16 | 0,7924% = 9,934% a.a. | 182.222,22 / 181.111,11 | 181.000 |
| Carro | Price 70.000, 48x | 11 | 1,3500% a.m. | 57.685,08 / 56.472,83 | 56.470 |
| Empréstimo | Price 38.000, 36x | 10 | 2,8430% a.m. (39,99% a.a.) | 30.947,27 / 30.127,09 | 29.800 |
| Cartão | Price 12.000, 12x | 6 | 2,3607% a.m. | 6.419,30 / 5.410,84 | 5.410,84 |

- A regra do motor (declarado × caminho do contrato) reproduzida com a minha tabela dá erro **0,000000** nas 5 dívidas × 361 meses (`dividas[]`), 5 × 705 meses (`fim.det.divs`) e na dívida total.
- Parcela no caixa = parcela do contrato, **exata** (R$ 0,00 de diferença em todos os meses) para carro, empréstimo e cartão em todo o prazo, e para o apartamento até a liberdade (inclui os R$ 60.000 em mi 36 e a nova parcela de R$ 4.176,59 após o extra "reduzir a parcela"; cenário: ≈ 4.180).
- Extras: carro R$ 20.000 em mi 12 ("prazo": parcela mantida em 1.991, restam 12 parcelas, última de R$ 420,39 em mi 24); empréstimo R$ 12.012,93 em mi 17 = exatamente o saldo do contrato (saldo depois: 0,00); limite ao saldo respeitado.
- Juros futuros = Σparcelas − principal: apartamento 1.389.463,49 = 580.855,33 + 808.608,16; sala 298.788,06 = 181.111,11 + 117.676,94; carro 66.213,39 = 56.472,83 + 9.740,56; empréstimo 40.912,93 = 30.127,09 + 10.785,84; cartão 5.800,00 = 5.410,84 + 389,16 (identidade fecha a 0,000000).
- Não aplicável (não existe no plano): venda de bem com saldo devedor, consórcio, crédito novo, compra financiada de objetivo, IOF/seguro/tarifas.

**D. Caixinhas.** Reconstrução semana a semana `obj(i) = obj(i−1)·(1+taxa esperada)^(7/30,4375) + mov_obj(i)` com a taxa esperada pela regra dos 24 meses: erro máximo **0,000000** em 3.060 semanas × 4 caixinhas (A8). A taxa por mês (`taxaPorMes`) confere em todos os meses:
- Viagem (5 meses, conservador): 0,4% sempre, sem troca; saldo 0 (aporte planejado 0), paga R$ 18.000 em mar/2027 com o caixa livre.
- Reforma (36 meses, moderado): 0,5% até mi 11; **troca em mi 12 (out/2027)** para 0,4%. Intercâmbio (60, agressivo): 0,6% até mi 35; **troca em mi 36 (out/2029)**. Faculdade (120, moderado): 0,5% até mi 95; **troca em mi 96 (out/2034)**.
- Aportes observados = planejados em 100% dos meses (reforma 1.162 × 36; intercâmbio 1.011 × 60; faculdade 236 × 120 + R$ 80.000 dedicados na semana de hoje). O aporte necessário recalculado por anuidade com a taxa de cada mês: reforma 1.162,40; intercâmbio 1.011,35; viagem 3.571,31; faculdade 236,31 (sem dedicado: 1.122,78; cenário: 1.123); todos idênticos ao motor (dif ≤ 0,0001).
- Saque na data: reforma 45.027,92 (meta 45.000); intercâmbio 70.097,26 (70.000); faculdade 179.867,39 (180.000: **R$ 132,61 abaixo da meta**, coberto pelo caixa livre; arredondar o aporte de 236,31 para 236 explica); saída `out_obj_*` = valor do objetivo e caixinha zerada depois, nos quatro.
- **Impacto de uma taxa única** (mesmos aportes), saldo na data: reforma regra 45.027,92 | só moderado 45.757,62 (+729,70) | só conservador 44.936,05 (−91,88). Intercâmbio 70.097,26 | só agressivo 72.916,01 (+2.818,75) | só conservador 68.504,60 (−1.592,66). Faculdade 179.867,39 | só moderado 184.171,22 (+4.303,83) | só conservador 165.382,55 (−14.484,85).
- **Estresse da regra de parada do aporte** (variante: venda financia a reforma): o motor para de aportar quando a projeção na data cobre a meta com 1% de folga; saque final 45.375,45 (0,83% acima da meta); diferença residual de até R$ 113 por desenho (ver 5).

**E. Rendimento do financeiro.** Convenção: `cofre(i) = cofre(i−1)·(1,004)^(7/30,4375) + mov_cofre(i)` se o cofre de abertura é positivo (A7: erro 0,000000 em 3.060 semanas); equivale a 4,9070% a.a. (E1). O PGBL (R$ 60.000) rende como livre; o FGTS (`rentab` 0) fica 85.000 constantes até mi 246 (E2). Dinheiro dedicado na semana de hoje sai do cofre antes do rendimento dessa semana (o total rende igual).

**F. Fluxo.** 19 linhas × 243 meses (mi 1 a 243, antes da liberdade) = 4.617 células recalculadas dos degraus, datas (13º em dez, bônus em mar), frequências e ajustes de um mês (`exc`): **nenhuma diferença acima de R$ 0,015**. Pontos: salário do Rafael 21.000 em jun/2027 e 23.000 em jul/2027; 13º 17.500 + 6.500 só em dez/2026 (nunca em nov); bônus 25.000 só em mar. Escola 4.800 → 6.400 em jan/2031 (mi 51) → 0 em jan/2039. Nenhuma linha de fluxo fora do plano.

**G. Liberdade.** Idade de liberdade esperada 61,670 (a do Rafael quando a Camila faz 60); motor 61,673 (mi 244, fev/2047; resolução semanal). `forced = true` confere: financeiro × 0,4% = 16.272,60 < maior falta de renda 17.200 (= 20.000 − aluguel 2.800); `sustentavel` 19.072,60 idêntico. Ruína: nenhuma (caixa livre mínimo R$ 66.917,46 em nov/2027; financeiro mínimo depois da liberdade R$ 4,08 milhões). INSS: Rafael (R$ 7.500) em jun/2050 = mi 284 e Camila (R$ 4.800) em fev/2049 = mi 268, iguais ao calendário.

**A. Contabilidade.** Em 705 meses: fin = cofre + Σcaixinhas; bens = Σbens + comprados; part = Σparticipações; dívida = Σ dívidas (todos R$ 0,00); sem NaN/Infinity; em 3.060 semanas Σmov_* = entradas − saídas (transferências somam zero, R$ 0,00); caixa nunca negativo. Δpatrimônio = entradas − saídas + rendimento recalculado + Δ(participação, bens, previdência) − Δdívida, resíduo máximo 0,0000 em 704 meses. **Atenção:** essa identidade é verdadeira por construção para qualquer série de dívida; ela não prova que a dívida está correta (ver 4).

## 3. Conferências realizadas

| # | O que foi conferido | Método | Amostra | Erro máx. | Resultado |
|---|---|---|---|---|---|
| A1–A4 | fin, bens, part e dívida = soma dos componentes | identidade | 705 meses | 0,00 | OK |
| A5 | sem NaN/Infinity | varredura | 705 meses | 0 | OK |
| A6 | transferências somam zero | Σmov_* = Σin − Σout | 3.060 semanas | 0,00 | OK |
| A7 | conservação do cofre (rendimento 0,4% a.m. semanal) | recálculo semanal | 3.060 semanas | 0,00 | OK |
| A8 | conservação das 4 caixinhas com a taxa esperada | recálculo semanal | 3.060 × 4 | 0,00 | OK |
| H0 | Δpatrimônio = fluxos + rendimento + valorização − Δdívida | recálculo | 704 meses | 0,00 | OK |
| B1–B3 | série e det. da participação, part = Σ | recálculo (−8% a.a., −30%) | 704/705 meses | 0,00 | OK |
| B4 | estresse: venda da participação, custos, líquido, zero depois | variante + recálculo | 31 meses | 0,00 | OK |
| C1–C3 | saldo devedor pela regra do motor com tabela própria | Price/SAC, taxa derivada | 5 × 361/705 meses | 0,00 | OK |
| C5 | extra baixa a dívida no mês em que o dinheiro sai | referência (ver 4) | 3 amortizações | 60.175,35 | **FALHA** |
| C6 | dívida zera no mês do último pagamento | 5 contratos | 5 | 12.839,54 | **FALHA** |
| C7 | saldo mês a mês = referência | 5 × 705 | 5 × 705 | 60.175,35 | **FALHA** |
| C8 | parcela do caixa = parcela do contrato | tabela própria | 5 × 704 | 13.473,31 | **FALHA** (71 meses do apartamento após a liberdade; sala SAC) |
| D1 | taxa por mês das 4 caixinhas e mês da troca | regra dos 24 meses | 6/37/61/121 meses | 0 | OK |
| D2–D3 | saque na data = valor; caixinha zerada depois | fluxo | 4 objetivos | 0,00 | OK |
| D+ | aporte necessário por anuidade | recálculo | 4 objetivos | 0,0001 | OK |
| D4 | estresse: regra de parada do aporte | variante | 16 meses | 112,97 (folga 1%) | OK por desenho |
| E1–E2 | rendimento anual equivalente; FGTS constante | identidade | 1 / 247 meses | 0 | OK |
| F1 | 19 linhas de entrada e saída × 243 meses | recálculo dos degraus/datas/exc | 4.617 células | 0,00 | OK |
| F2 | parcela da sala (SAC) = parcela exata | tabela SAC própria | 163 meses | 96,85 | **FALHA** (tradução) |
| G1, G3 | idade de liberdade; forçada; sustentável | recálculo | 1 | 0,15 sem. / 0,00 | OK |
| G2 | ruína | caixa mínimo | 705 meses | — | OK (sem ruína) |
| G4 | saque do FGTS vai para o financeiro | Δfinanceiro em mi 247 | 1 mês | 83.428 | **FALHA** |
| G5 | parcela do contrato após a liberdade | tabela própria | 71 meses | 13.473,31 | **FALHA** |

## 4. Contas erradas encontradas

Referência usada nas dívidas (julgamento do auditor, com evidência): **o saldo informado pelo cliente é o saldo depois da parcela deste mês** (as 5 dívidas batem melhor com `contrato[k0]` do que com `contrato[k0−1]`: apartamento diferença 145 contra 342; sala 111 contra 1.222; carro 3 contra 1.215; cartão 0,00 contra 1.008). Se o dono do produto decidir que a convenção do motor está certa, os itens 4.1 a 4.3 viram "comportamento por desenho", mas o item 4.1 (buraco de um mês) continua sendo uma conta que o cliente verá no gráfico.

### 4.1 Amortização antecipada aparece na dívida um mês depois do caixa
- Sintoma: o dinheiro sai em mi 12, 17 e 36, a dívida só cai no mês seguinte.
- Valores: apartamento mi 36 (out/2029): motor 561.078 × referência 500.903; carro mi 12: 41.123 × 20.583; empréstimo mi 17: 12.840 × 0. Patrimônio subestimado em **R$ 21.297 (mi 12), R$ 14.547 (mi 17) e R$ 60.419 (mi 36)**; nos meses seguintes volta a ≈ R$ 0,4–2 mil.
- Origem: motor, `saldoDevedorEm` (linhas 1843–1852): o saldo do mês `k` é `ct.linhas[ct.k0 + k − 1].saldo`, isto é, o saldo *antes* da parcela do mês, enquanto o fluxo já pagou a parcela e o extra do mês; os extras são aplicados em `tabelaDaDivida` (linha 1617) no índice `k0 + em` e só aparecem em `linhas[k0+em]`, lido no mês seguinte.
- Correção sugerida (não aplicada): ler `linhas[j]` (depois da parcela e do extra do mês) e ancorar `saldoHoje` em `linhas[k0]`, ou, se a convenção for mantida, documentar e lançar o extra um mês depois no caixa. Mudar uma das duas metades sozinha cria erro maior.

### 4.2 Saldo informado ancorado na parcela errada e quitação com um mês de atraso
- Sintoma: `saldoHoje = linhas[k0−1]` (antes da parcela de hoje); a parcela de hoje já foi paga (dia 10, antes de hoje) e não é cobrada no caixa. O saldo que deveria ser o "depois" é reescalado por fator < 1: apartamento 0,99941; sala 0,99329; carro 0,97894; empréstimo 0,96293; **cartão 0,84290** (no cartão: motor 5.410,84 / 4.560,81 / 3.690,71 / 2.800,07 / 1.888,40 / 955,22 / 0 contra a referência 5.410,84 / 4.378,57 / 3.321,94 / 2.240,36 / 1.133,25 / 0 / 0).
- Consequência: a dívida fica à frente da referência em média R$ 2.043 (mediana R$ 1.630; p95 R$ 3.762) nos meses 1 a 314; **no último mês de pagamento ainda há saldo lançado** (apartamento R$ 4.144 em dez/2052; sala R$ 1.104; carro R$ 406; cartão R$ 955; empréstimo R$ 12.840) e a dívida zera no mês seguinte **sem parcela** correspondente (queda sem caixa que a pague).
- Origem: motor, `contratoDaDivida` (linhas 1680 e 1694, `kHoje` e `saldoHoje`) e `restantesContratadas` (linha 1608, que conta a parcela deste mês como a pagar) em conjunto com `saldoDevedorEm` (1846). A tradução (`inicio` com a parcela do mês 0 contada como a pagar) é coerente com a regra documentada; o defeito é a regra não casar com o fato de que a parcela do mês 0 foi paga e não é lançada no fluxo.
- Valor da distorção do plano: ≈ 0,03% a 0,2% do patrimônio na maior parte do tempo; no cartão, até R$ 755 a mais de dívida.

### 4.3 Parcela da sala (SAC) em degraus anuais
- Sintoma: o caixa paga 2.555,00 por 12 meses, depois 2.449,35... enquanto o contrato cai todo mês. Excesso acumulado **R$ 7.800,86** em 150 meses (maior mês R$ 96,85); a dívida segue o contrato, então a diferença some do patrimônio.
- Origem: tradução/portal (`lancaParcela` grava um degrau por ano); o motor aceita degraus mensais, mas o plano não os traz. Não é erro de motor.
- Observação: a taxa derivada da sala saiu 9,934% a.a. (cliente: 10%) porque o motor trata R$ 2.555 como a parcela de índice 16 (a 17ª, de outubro), enquanto o cliente (e o cenário) a chamam de "atual", a 18ª (índice 17): a 10% a.a. a 18ª parcela é R$ 2.555,32 e a 17ª R$ 2.564,18. Efeito: juros futuros 117.676,94 contra 118.424,85 (−R$ 747,91).

### 4.4 Depois da liberdade, a parcela de dívida é multiplicada pelo "padrão de vida"
- Sintoma: apartamento no caixa **5.898,37** (mi 244 a 246, contrato 4.176,59), **17.649,89** em mi 247 (mai/2047) e **4.020,48** de mi 248 a 314 (fator 0,9626). A dívida continua caindo pelo contrato: pagamento extra de R$ 18.638 e pagamento a menos de R$ 10.459, líquido **+R$ 8.179,22** de caixa sem baixa de dívida, em 71 meses.
- Origem: motor, `doOffset` (linha 1933, `o.v * m.scale` em todas as despesas, inclusive as linhas de parcela de dívida) e a definição de `m.scale` (linha 2116, que divide a renda disponível por `livingAt`, que inclui as parcelas).
- Correção sugerida: fora do fator as linhas que são parcela de dívida (as de `bens[].linha` e `dividas[].linha`).

### 4.5 O saque à vista do FGTS é gasto
- Sintoma: em mi 247 (mai/2047) entram R$ 85.000 (`in_pas_2`, saque do FGTS) e a saída do mês sobe de R$ 20.777 (plano) para **R$ 87.800**: todas as despesas ×4,2259; o financeiro varia só +15.283 (≈ rendimento). Os R$ 85.000 deixam de ser patrimônio.
- Impacto: −R$ 85.000 em mai/2047; capitalizados à taxa do plano até jun/2085, **R$ 526.897 a menos** (2,8% do patrimônio final de R$ 18,67 milhões).
- Origem: motor, linha 1382 (o saque entra como renda `dur: 1`), 2101 (`pas` soma toda renda ativa do mês, inclusive o saque único) e 2116 (`m.scale` gasta tudo o que `pas` traz). O comentário da linha 1399 diz que o saque "entra no financeiro".
- Correção sugerida: renda de `dur === 1` (saque/carta) fora de `pas` e de `scale`, indo direto ao cofre.

### 4.6 Valores esperados do próprio cenário que estão errados
- Carro: "saldo depois da parcela do mês 12 (25ª) = 39.141": out/2027 é a **24ª** parcela (nov/2025 = 1ª); o saldo depois da 24ª é 40.583,98 (20.583,98 depois do extra); 39.140,87 é o da 25ª (nov/2027). O motor está certo.
- Empréstimo: "saldo contratual ≈ 10.400" e "taxa ≈ 2,64% a.m.". Com os R$ 38.000 já incluindo o IOF (o que o cliente diz), a taxa é 2,843% e o saldo em mar/2028 é 12.012,93 (o valor lançado pelo consultor). 2,64% só sai se o valor financiado for R$ 39.200 (IOF por cima), com saldo 12.117,54. Nenhuma versão dá 10.400.
- SAC da sala, 1ª parcela 2.706 vale a 10% a.a.; o motor, com a taxa derivada (9,934%), dá 2.695,87 (ver 4.3).
- "Deve aparecer aviso de falta com corte na viagem": não aparece (0 faltas, 0 cortes) porque o consultor pôs aporte 0 na viagem e os demais no necessário; a sobra mensal não paga os aportes em 14 de 60 meses (cobertos pelo caixa livre, mínimo R$ 66.917 > reserva R$ 40.000). Escolha de tradução, não erro de motor.

## 5. Comportamentos por desenho que o dono do produto deveria conhecer

1. **Despesas escaladas após a liberdade**: depois que a Camila para (mi 244), o gasto passa a ser "renda disponível" (`m.scale`). Meses 244–246 (Rafael ainda trabalha): saídas R$ 88.025 contra R$ 62.330 do plano (+R$ 25.695), ou seja, a sobra do salário dele é gasta. Meses 248–315: R$ 1.360.000 contra R$ 1.408.632 (−R$ 48.632, −R$ 715/mês): o plano lista R$ 20.777 e o motor gasta R$ 20.000 (a renda desejada). Meses 316–360: R$ 900.000 contra R$ 747.000 (+R$ 3.400/mês, +R$ 153.000): sem a hipoteca, o gasto sobe para os R$ 20.000 desejados (o plano listava R$ 16.600). É coerente com "querem R$ 20.000", mas muda o resultado e fica escondido.
2. **Liberdade forçada** (`forced = true`) aos 61,67 anos com R$ 4,07 milhões: o teste usa a maior falta de renda do futuro (R$ 17.200, antes do INSS); o INSS (R$ 12.300 a partir de 2050) torna o plano folgado (financeiro de R$ 17,2 milhões em 2085). O alerta é conservador, não é erro.
3. **Mês 0 parcial**: só entram as semanas depois de hoje (2 de 4): escola R$ 2.400 em vez de R$ 4.800, sem salários nem parcelas (o dia 5 e o dia 10 já passaram). Leitura da tabela do mês 0 confunde.
4. **Parcela do mês 0 não cobrada e dívida do mês 0 = saldo informado**: coerente entre si, mas leva ao deslocamento descrito em 4.2.
5. **Taxa do cliente não manda, a parcela manda** (cartão 32,3% a.a. e empréstimo 39,99% a.a. são implícitos), e o padrão `iof` vazio = financiado distorceria os contratos (a tradução usou `isento` e acertou).
6. **Aporte para por "1% de folga"**: a regra do programa conta o crescimento do mês duas vezes; a caixinha pode passar até ~0,8% acima da meta (variante: 45.375,45) ou ficar até 0,07% abaixo (faculdade: −R$ 132,61); o objetivo é pago do mesmo jeito pelo caixa livre.
7. **Primeira semana de cada mês cresce à taxa do mês anterior** (o intervalo [i−1, i] pertence ao mês anterior). Na troca de taxa o novo perfil vale a partir da segunda semana do mês de troca; efeito de uma semana de diferença de taxa: ≈ R$ 3 (reforma), R$ 19 (intercâmbio) e R$ 36 (faculdade). É coerente (o intervalo pertence ao mês anterior) e não é erro, mas o cliente que ler "muda em out/2029" deve saber que a semana de abertura ainda rende à taxa antiga.
8. **Viagem "só se sobrar"** é paga com o caixa livre em mar/2027 (R$ 18.000), porque todo objetivo ligado acontece. O consultor lançou aporte 0, mas o gasto existe (status "Requer revisão").
9. **FGTS a 0% real**, **PGBL como líquido** e todos os valores em reais constantes: decisões do consultor; com a rentabilidade padrão do motor (taxa do plano, 4,9% a.a.) o FGTS chegaria a ≈ R$ 228 mil aos 62 anos e o erro 4.5 seria 2,7 vezes maior.
10. **Bens sem valorização** (apartamento, sala e carro parados em R$ 1,358 milhão por 50 anos), conforme o dado do cliente.

## 6. Limites desta auditoria

- Participações: venda foi testada só em variante (preço, custos, destino a objetivo). Não cobertos: venda de bem com saldo devedor, consórcio, crédito novo, compra financiada/consórcio de objetivo, IOF financiado/à vista, seguro, tarifas, carência: o plano não os usa.
- A referência das dívidas é uma leitura: se o dono do produto definir que o saldo informado vale *antes* da parcela de hoje, 4.1 e 4.2 mudam de natureza (a distorção do caixa em 4.4 e o FGTS em 4.5 não dependem disso).
- A identidade semanal (A6, A7, A8, E) usa a série semanal da mesma execução do motor como observado; as taxas, a regra de crescimento e as tabelas são recalculadas por código próprio. A regeneração do extrato é idêntica ao arquivo.
- Não auditei: IR/INSS (o plano trata tudo como líquido), inflação (valores reais), formas de renda do fundo de pensão (vitalícia, prazo etc.), modos "perp"/"cons", telas e exportações, nem o aporte do programa em cenários com cortes (não houve faltas).
- Tolerância R$ 0,01 em todas as conferências, salvo D4 (R$ 150, por desenho da regra mensal do programa) e G1 (resolução semanal da idade).
