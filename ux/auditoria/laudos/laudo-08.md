# Laudo matemático do cenário 08 — Osvaldo e Ione Brandão

Auditor: agente matemático. Código reexecutável: `ux/auditoria/laudos/auditor-08.js` (`node ux/auditoria/laudos/auditor-08.js`; 137 conferências, 6 divergentes, todas explicadas abaixo).
Fonte do "esperado": o plano (`planos/plano-08.json`) e regras do domínio financeiro, recalculadas em código próprio (nenhuma função de cálculo do motor foi usada para produzir o esperado). Fonte do "observado": `extratos/extrato-08.json` (provado idêntico, centavo a centavo, ao que a versão atual do motor gera) e a saída semanal do motor (`weeks[i].f`, `cofre`, `obj`), lida só como dado.

## 1. Veredito

**A aritmética do motor está exata (erro máximo de R$ 0,00 em saldos, séries de bens, amortizações, caixinhas e contabilidade, em 549 meses e 2.380 semanas), mas o resultado do cenário 08 contém duas contas erradas de dívida e uma distorção de desenho grande depois da liberdade financeira: as parcelas dos dois consórcios saem uma a menos do caixa (R$ 12.354 a favor do cliente) e o caminhão de R$ 500 mil nunca entra como bem (patrimônio líquido subestimado em R$ 500 mil a partir do mês 14).**

| Frente | Semáforo | Em uma linha |
|---|---|---|
| Participações societárias | **CERTO** | O plano não tem nenhuma. As regras (taxa, alvo, pontual, queda a zero, venda) foram provadas em 6 participações sintéticas: erro R$ 0,00. |
| Dívidas | **ERRADO** | Saldos, tabelas Price/SAC/consórcio, IOF e amortização exatos; mas a parcela do mês 0 dos dois consórcios nunca é debitada (R$ 5.154,24 + R$ 7.200,00), o reajuste do trator entra um mês antes e o caminhão (ativo de R$ 500 mil) não aparece. |
| Caixinhas | **CERTO COM RESSALVAS** | Taxa e saldo corretos em todas as 2.380 semanas; troca de taxa no mês exato. Ressalvas por desenho: reforma "agressivo" vira conservador (12 < 24 meses), margem de 1% e troca de taxa com até 1 semana de atraso. Nenhum efeito monetário relevante aqui. |
| Contabilidade geral | **CERTO** | Patrimônio = financeiro + bens + participações + previdência − dívidas com componentes recalculados de forma independente: erro R$ 0,00 nos 549 meses; transferências somam zero; sem NaN. |
| Fluxo | **CERTO COM RESSALVAS** | Todas as rendas e despesas batem ao centavo, exceto o último salário da Ione (um mês cedo, R$ 6.200) e as duas parcelas de consórcio (ver Dívidas). |
| Liberdade / ruína | **CERTO COM RESSALVAS** | Ruína e liberdade corretas na regra do motor (liberdade no mês 93, um mês depois do aniversário). Distorção relevante por desenho: depois da liberdade o gasto sobe de R$ 16.500 para R$ 38.347/mês (fator 2,32) e fica em ~R$ 39 mil, contra R$ 20.000 desejados. |

## 2. Por que a matemática está certa (fórmulas, resultado e prova)

Convenções do motor, confirmadas contra as regras do domínio e aplicadas de forma consistente: a simulação é **semanal** (2.380 semanas de hoje até os 100 anos); o "mês" é o ciclo de salário (do dia 5 ao dia 4) com 4 ou 5 semanas; o mês 0 é out/2026 e é **parcial** (só contam as semanas a partir de 19/10); o saldo do mês é o do fim da última semana do ciclo; todo rendimento é capitalizado por semana a (1+r)^(7/30,4375), o que equivale exatamente a r ao mês em 30,4375 dias; o rendimento incide sobre o saldo de abertura da semana e os fluxos da semana entram no fim dela.

### 2.1 Participações societárias
- O plano tem `participacoes: []`, `partValue: 0`; `fim.part = 0` em todos os 549 meses.
- Como a meta é zero chance de erro nessa frente, a regra foi atacada com 6 participações sintéticas num plano de teste (função `J-part*`, nada gravado): (P1) taxa 12% a.a. por 5 anos e plana depois; (P2) alvo de R$ 500.000 no mês 36 vindo de R$ 200.000 (ritmo geométrico 2,5^(m/36)); (P3) pontual +25% no mês 10, queda a zero no 20 e pontual de −R$ 5.000 no 30; (P4) venda no mês 24 por R$ 420.000 com custos de 2% + R$ 1.000; (P5) alvo de R$ 100.000 no mês 24 seguido de taxa de −8% a.a.; (P6) alvo no mês 12 com pontual no meio do caminho (ritmo refeito). Resultado: série mensal, `det.parts` e `fim.part` batem com o recálculo em todos os meses (erro R$ 0,00); nenhuma participação fica negativa (P3 vai a zero e o pontual de −5.000 não a leva abaixo de zero); na venda P4 o preço vira alvo (sem salto), preço R$ 420.000, custos R$ 9.400, líquido R$ 410.600, a participação sai (mov_bens −420.000), o custo sai (out_vendap) e a participação é zero depois, para sempre.

### 2.2 Bens (terra, máquinas, casa, lote) e a venda do lote
- Série: `v(m) = v0 × (1+pct)^(min(m, 12×anos)/12)`. Terra mês 120: esperado 6.217.025,99665708; motor 6.217.025,99665708; erro 0,00. Terra congela aos 240 meses em 9.202.717,20 (20 anos). Máquinas mês 60: 531.441,00 (900.000 × 0,9^5); congela no mês 96 em 387.420,49 (8 anos). Casa na cidade: 700.000 constante. Lote mês 29: 722.645,54; erro 0,00. Os quatro bens em 549 meses: erro máximo R$ 0,00 (série do bem e `det.bens` do patrimônio).
- Venda do lote (mês 30, abr/2029): projetado 600.000 × 1,08^2,5 = 727.295,06; preço firme 900.000; custos 54.000; quitação 0; líquido 846.000,00; destino: R$ 150.000 para a caixinha da Marina e R$ 696.000 para o financeiro (evento do motor: "R$ 150.000 para Casa para a Marina e R$ 696.000 para o mercado financeiro"). Depois da venda o valor do bem é zero em todos os meses (até 548).
- Contabilidade da venda no mês 30: bem sai por 727.295,06 (último valor da curva), entra 900.000 no financeiro, custo 54.000 sai. O patrimônio salta de 6.514.392,85 (mês 29) para 6.635.406,76 (mês 30): +121.013,91 = (900.000 − 727.295,06) − 54.000 + movimento normal do mês. É o "salto" que o consultor estranhou (ver seção 5, item 2).

### 2.3 Dívidas
- **Consórcio do trator (contemplado).** Total = 420.000 × (1 + 0,15 + 0,03) = 495.600; parcela k = saldo/(100 − k); depois das parcelas 14, 26, 38… o saldo sobe 4%. Saldo depois da parcela 14: 426.216,00 → 443.264,64 após o reajuste; parcela 15 = 443.264,64/86 = 5.154,24; saldo depois da 22ª = 402.030,72 (motor 402.030,72; erro 0,00); última parcela (100ª) = 6.782,63; saldo zero no mês 78. Saldo mês a mês nos meses 0..100: erro máximo R$ 0,00.
- **Crédito de custeio (novo).** Price, R$ 120.000, 12x, 1,3% a.m.: PMT = 10.865,0013 (o plano usa 10.865,00: diferença R$ 0,0013/mês). Entra no caixa no mês 3 (`in_credito_cr1` = 120.000,00); parcelas nos meses 4..15; saldo mês 4 = 110.694,9987, mês 5 = 101.269,03, zero no mês 15 (erro R$ 0,00); juros totais = 12 × 10.865,0013 − 120.000 = 10.380,02 (caixa: 130.380,00).
- **Financiamento da casa da Marina (compra financiada do objetivo).** Financiado 350.000 (500.000 − entrada 150.000), SAC, 240x, 10,5% a.a. efetivo = 0,83552% a.m., isento de IOF. 1ª parcela no mês 36 = 350.000/240 + 350.000 × 0,0083552 = 4.382,64 (motor idem); amortização constante 1.458,33. Amortização de R$ 100.000 no mês 48 por prazo (depois da 13ª parcela): parcela do mês 48 = 4.236,42 + 100.000 = 104.236,42; saldo depois = 231.041,67; o prazo cai de 240 para 172 parcelas, quitação no mês 207 (o evento do motor cai no mês 207). Juros totais 190.946,64 = soma das parcelas − 350.000. Erro de cada parcela nos 172 meses: R$ 0,00. O bem entra no patrimônio como "entrada + principal amortizado" (150.000 + 1.458,33 no mês 36… 500.000 no mês 207): erro R$ 0,00 em 549 meses.
- **Consórcio do caminhão (a contemplar).** 70 parcelas restantes de R$ 7.200; contemplação no mês 14; devido depois = 56 × 7.200 = 403.200; lance de 50.000 abate proporcionalmente: fator 1 − 50.000/403.200 = 0,875992 → parcela 6.307,14. Carta menos lance = 450.000 entra no mês 14 (`in_pas_3`); dívida logo após = 346.892,86 (55 parcelas de 6.307,14); erro R$ 0,00 em todos os meses.
- **Estresse de dívida (IOF e venda com saldo devedor).** Price de R$ 400.000, 120x, 12% a.a., IOF financiado (0,38% + 0,0082% por dia, teto de 365 dias, ponto fixo F = C + IOF(F)): saldo de 24 meses bate com a tabela independente (R$ 0,00). Venda do bem financiado no mês 24 por R$ 950.000 com custos de 5%: quitação R$ 334.093,92 = saldo do contrato, líquido R$ 568.406,08, `out_quita_0` no fluxo e dívida zero depois.

### 2.4 Caixinhas
- Regra do domínio conferida: nos últimos 24 meses antes da data a caixinha é conservadora (0,4% a.m.); antes, a taxa do perfil; objetivo com menos de 24 meses já nasce conservador. Perfis: conservador 0,4%, moderado 0,5%, agressivo 0,6% a.m. (iguais aos do plano).
- **Reforma (12 meses, "agressivo")**: `taxaPorMes` = 0,4% nos 13 meses (a regra converte porque 12 < 24). Aporte único de R$ 89.103,61 no mês 7 (safra de soja com `destino`), saldo de 89.185,46 (mês 7) a 90.588,33 (mês 11), sacado no mês 12: R$ 90.671,53 = 89.103,61 × 1,004^(19 semanas × 7/30,4375); erro R$ 0,00. A caixinha cobre os R$ 90.000 (excedente R$ 671,53 = 0,75%, dentro da margem de 1% do desenho) e **nenhum outro aporte é feito** depois que ela basta: `mov_obj_reforma` só é positivo no mês 7.
- **Casa da Marina (36 meses, "moderado")**: `taxaPorMes` = 0,5% nos meses 0..11 e 0,4% do mês 12 em diante (troca no mês 36 − 24 = 12, exato). Mas a caixinha só recebe dinheiro no mês 30 (R$ 150.000 da venda do lote, já na faixa conservadora): saldo = 0 em todos os meses 0..11 e nos meses anteriores ao 30, logo **a taxa moderada nunca rendeu um centavo** e nenhuma taxa foi aplicada no mês errado. R$ 150.000 rendendo 26 semanas a 0,4% = 153.623,60 (esperado independente 153.623,60; erro R$ 0,00); no mês 36 a caixinha volta ao financeiro (mov_obj = −153.623,60), o bem entra por R$ 150.000 e os R$ 3.623,60 de sobra ficam livres. Sem aporte mensal (153.623 > 150.000).
- **Recursão semanal** `saldo(i) = saldo(i−1) × (1+r)^(7/30,4375) + aportes(i)` conferida nas 2.380 semanas para as duas caixinhas: erro máximo R$ 0,00.
- **Impacto de uma única taxa (em R$)**: casa da Marina, R$ 150.000 por 26 semanas: conservadora 153.623,60 (motor); se tivesse ficado moderada, 154.540,80 (+917,20); se agressiva, 155.462,55 (+1.838,95). Reforma, R$ 89.103,61 por 19 semanas: conservadora 90.671,53 (motor); moderada 91.066,82 (+395,28); agressiva 91.463,43 (+791,89).
- **Estresse de troca de taxa** (3 caixinhas sintéticas: 60 meses agressivo com R$ 100.000 separados hoje; 18 meses agressivo; 24 meses moderado): troca no mês 36 (e no mês 0 para os de ≤ 24 meses), saldo final igual à fórmula independente `100.000 × 1,006^(155 semanas × 7/30,4375) × 1,004^(105 semanas × 7/30,4375)` = R$ 136.293,51 (erro R$ 0,00). Só conservadora: 126.959,96; só agressiva: 143.003,08; o desenho, 136.293,51.

### 2.5 Rendimento do patrimônio financeiro / reserva
- R_M = 0,4% a.m. (4,907% a.a. real). Convenção: `cofre(i) = cofre(i−1) × (1,004)^(7/30,4375)` se positivo, mais o movimento líquido da semana; reserva negativa não rende, mas cobra 4% a.m. (juros de plano) uma vez por mês, sobre o saldo negativo do fim do mês anterior. Conferido nas 2.380 semanas (erro R$ 0,00) e nos 548 meses de juros (`out_juros`): mês 3 = 12.334,36 × 4% = 493,37; mês 7 = 34.054,76 × 4% = 1.362,19; mês 19 = 19.549,78 × 4% = 781,99.
- Depois da liberdade o financeiro (3,10 mi no mês 93) cresce só pelo rendimento, porque o motor gasta toda a renda: projeção pura por juros 18,996 mi contra 19,049 mi do motor no mês 547 (diferença de 0,28%, ordem dentro do mês: a renda cai no dia 5 e o gasto se dilui).

### 2.6 Fluxo
- Safra de soja R$ 420.000 em mai/2027…mai/2034 (meses 7, 19, …, 91); milho R$ 150.000 em set/2027…set/2033; Ione R$ 6.200/mês; arrendamento R$ 28.000 e INSS do Osvaldo R$ 7.000 desde o mês 92; INSS da Ione R$ 4.000 desde o mês 109; Marina R$ 4.500 até o mês 65 (25 anos em abr/2032); saúde R$ 3.600; casa/mercado R$ 12.900 (mês 0: R$ 3.225 = um quarto, pelas semanas que restam do ciclo); reforma −R$ 90.000 (mês 12); compromisso do caminhão −R$ 500.000 (mês 14); custos da venda −R$ 54.000 (mês 30); saque do FGTS aos 90 anos = 38.000 × 1,004^468 = R$ 246.128,10 (mês 468). Todas essas linhas, mês a mês nos 549 meses: erro R$ 0,00.

### 2.7 Liberdade financeira e ruína
- Osvaldo faz 62 em 1/jun/2034 (semana 3235). O motor usa idade = semanas/(365,25/7) e só avalia no início do ciclo (semana com dia 5); na semana 3235 a idade fica 61,9986 (< 62) e o gatilho dispara na semana 3239 (mês 93, idade 62,075). Reproduzido de forma independente: semana 3239, `finBefore` = 3.090.212,16 (financeiro da semana anterior capitalizado), `forced = false`, `maxGap = 0` (INSS 7.000 + arrendamento 28.000 + salário da Ione 6.200 = 41.200 > 20.000), `sustentavel` = 3.090.212 × 0,004 + 20.000 = 32.360,85.
- Ruína: a reserva fecha negativa pela 1ª vez no mês 2 (−12.334,36, dez/2026); o motor marca `ruina.mi = 2`. Depois: mês 6 −34.054,76 (mínimo, `cheque12`) e mês 18 −19.549,78; juros totais da dívida de reserva R$ 2.637,56 em 3 meses.

## 3. Conferências realizadas

Legenda do resultado: CERTO = erro dentro da tolerância (R$ 0,01 salvo justificativa); DIVERGE = ver seção 4 ou 5. Amostras são todos os meses/semanas indicados. Tabela gerada pelo próprio auditor.

| # | O que foi conferido | Método | Amostra | Erro máximo | Resultado |
|---|---|---|---|---|---|
| 1 | extrato-08.json gravado = saida do motor atual (regerado em memoria) | comparacao de fin, bens, div, prev nos 549 meses | 549 meses | 0,00 | CERTO |
| 2 | Safra de soja: 420.000 em maio ate mai/2034 | esperado do plano x extrato.fluxo[in_soja] | meses 0..548 | 0,00 | CERTO |
| 3 | Safrinha de milho: 150.000 em setembro ate set/2033 | esperado do plano x extrato.fluxo[in_milho] | meses 0..548 | 0,00 | CERTO |
| 4 | Arrendamento 28.000/mes desde jun/2034 (mes 92) | esperado do plano x extrato.fluxo[in_arrendamento] | meses 0..548 | 0,00 | CERTO |
| 5 | INSS Osvaldo 7.000 desde o mes 92 | esperado do plano x extrato.fluxo[in_pas_0] | meses 0..548 | 0,00 | CERTO |
| 6 | INSS Ione 4.000 desde o mes 109 | esperado do plano x extrato.fluxo[in_pas_1] | meses 0..548 | 0,00 | CERTO |
| 7 | Saque do FGTS (38.000 x 1,004^mes aos 90 anos) | esperado do plano x extrato.fluxo[in_pas_2] | meses 0..548 | 0,00 | CERTO |
| 8 | Carta do consorcio do caminhao menos o lance (450.000, mes 14) | esperado do plano x extrato.fluxo[in_pas_3] | meses 0..548 | 0,00 | CERTO |
| 9 | Credito de custeio 120.000 no mes 3 | esperado do plano x extrato.fluxo[in_credito_cr1] | meses 0..548 | 0,00 | CERTO |
| 10 | Compromisso: compra do caminhao 500.000 no mes 14 | esperado do plano x extrato.fluxo[out_comp_camin] | meses 0..548 | 0,00 | CERTO |
| 11 | Custos da venda do lote 54.000 no mes 30 | esperado do plano x extrato.fluxo[out_venda_3] | meses 0..548 | 0,00 | CERTO |
| 12 | Gasto da reforma 90.000 no mes 12 | esperado do plano x extrato.fluxo[out_obj_reforma] | meses 0..548 | 0,00 | CERTO |
| 13 | Marina 4.500 ate o mes 65 | esperado do plano x extrato.fluxo[out_fix_marina] | meses 0..548 | 0,00 | CERTO |
| 14 | Salario da Ione 6.200 ate o mes 108 (60 anos em nov/2035) | esperado do plano x extrato | meses 1..548 | 6.200 | DIVERGE: o motor paga ate o mes 107; o esperado (cliente) e ate o mes 108; in_ione@108 (out/2035) |
| 15 | Salario da Ione: o motor segue a regra interna "round((60-idade)*12)" (ate o mes 107) | regra interna reproduzida | meses 1..548 | 0,00 | CERTO |
| 16 | Plano de saude 3.600 (meses 0..92) | esperado do plano x extrato.fluxo[out_fix_saude] | meses 0..92 | 0,00 | CERTO |
| 17 | Casa/mercado/empregados 12.900 (mes 0: 3.225; meses 1..92: 12.900) | esperado do plano x extrato.fluxo[out_adj_casa] | meses 0..92 | 0,00 | CERTO |
| 18 | Parcela do credito de custeio = PMT exato (10.865,23) x12 (meses 4..15) | Price independente (120.000, 1,3%, 12) | meses 4..15 | 0,0013 | CERTO |
| 19 | Parcelas do consorcio do trator (calendario do cliente: 22 pagas ate out/2026; reajuste depois da parcela 26) | tabela independente (carta x 1,18; /(100-k); +4% depois das parcelas 14,26,38...) | meses 1..78 | 6.782,6282 | DIVERGE: DIVERGE: out_fix_parc1@78 (abr/2033); soma observada 455693.62 x esperada 460847.8 |
| 20 | Parcelas do consorcio do caminhao (7.200 x14; 6.307,14 apos o lance) | tabela independente; 70 restantes = meses 1..70 | meses 1..70 | 6.307,1429 | DIVERGE: DIVERGE: out_fix_parc2@70 (ago/2032); soma observada 446799.84 x esperada 454000 |
| 21 | Parcelas do financiamento SAC da casa da Marina (350.000, 240x, 10,5% a.a.; extra 100.000 no mes 48 por prazo) | tabela SAC independente | meses 36..207 | 0,00 | CERTO |
| 22 | Saldo devedor do consorcio do trator, mes a mes (402.030,72 hoje; zero no mes 78) | tabela independente do consorcio contemplado (calendario do cliente) | meses 0..100 | 0,00 | CERTO |
| 23 | Trator quitado em zero no mes 78 (abr/2033) | saldo(78)=0 e saldo(77)=ultima parcela | mes 77,78 | 0,00 | CERTO |
| 24 | Reconciliacao caixa x divida do trator: soma das parcelas debitadas = saldo de hoje + reajustes (parcelas 23..100) | soma(out_fix_parc1) x soma(T[22..99].pay) | 78 parcelas | 5.154,1806 | DIVERGE: FALTAM 5154.18 no caixa (ultima parcela nao debitada e reajustes antecipados) |
| 25 | Saldo devedor do credito de custeio (120.000 no mes 3; Price 1,3% a.m.; zero no mes 15) | tabela Price independente | meses 0..40 | 0,00 | CERTO |
| 26 | Juros do credito = soma das parcelas - principal | tabela independente | 12 parcelas | 0,00 | CERTO |
| 27 | Divida do consorcio do caminhao apos a contemplacao (soma das parcelas que faltam; zero antes) | soma independente das parcelas restantes | meses 0..100 | 0,00 | CERTO |
| 28 | Parcela apos o lance = 7.200 x (1 - 50.000/403.200) = 6.307,14 (proporcional) | formula independente | mes 14 | 0,0029 | CERTO |
| 29 | Bem financiado (casa da Marina) = entrada 150.000 + principal amortizado (parcelas + extra de 100.000) | tabela SAC independente; bens - bens individuais - comprados | meses 0..548 | 0 | CERTO |
| 30 | Casa: juros pagos = soma das parcelas - principal financiado | tabela SAC independente x soma do fluxo | 172 parcelas | 0,00 | CERTO |
| 31 | 1a parcela SAC no mes 36 = 350.000/240 + 350.000 x 0,8355% (4.382,53) | formula | mes 36 | 0,00 | CERTO |
| 32 | Financiamento da casa: tamanho exato do saldo apos amortizar 100.000 (modo prazo: parcela de amortizacao constante) | SAC independente | meses 48.. | 0,00 | CERTO |
| 33 | O plano nao tem participacoes societarias; part = 0 em todos os meses | varredura de fim.part e parts[] | 549 meses | 0,00 | CERTO |
| 34 | Terra (800 hectares): trajetoria de valor mes a mes | v0*(1+pct)^(min(m,12*anos)/12) independente | meses 0..547 | 0 | CERTO |
| 35 | Terra (800 hectares): fim.det.bens (o que o patrimonio mostra) = trajetoria | idem | meses 0..548 | 0 | CERTO |
| 36 | Máquinas e implementos: trajetoria de valor mes a mes | v0*(1+pct)^(min(m,12*anos)/12) independente | meses 0..547 | 0,00 | CERTO |
| 37 | Máquinas e implementos: fim.det.bens (o que o patrimonio mostra) = trajetoria | idem | meses 0..548 | 0,00 | CERTO |
| 38 | Casa na cidade (moradia): trajetoria de valor mes a mes | v0*(1+pct)^(min(m,12*anos)/12) independente | meses 0..547 | 0,00 | CERTO |
| 39 | Casa na cidade (moradia): fim.det.bens (o que o patrimonio mostra) = trajetoria | idem | meses 0..548 | 0,00 | CERTO |
| 40 | Lote em Sinop: trajetoria de valor mes a mes | v0*(1+pct)^(min(m,12*anos)/12) independente | meses 0..30 | 0,00 | CERTO |
| 41 | Lote em Sinop: fim.det.bens (o que o patrimonio mostra) = trajetoria | idem | meses 0..29 | 0,00 | CERTO |
| 42 | Lote: valor projetado no mes 30 = 600.000 x 1,08^2,5 = 727.295,06 | formula | mes 30 | 0,00 | CERTO |
| 43 | Lote: preco 900.000, custos 54.000, quitacao 0, liquido 846.000 | formula | mes 30 | 0,00 | CERTO |
| 44 | Lote: depois da venda o valor do bem e zero (det.bens[3]=0) em todos os meses >= 30 | varredura | meses 30..548 | 0,00 | CERTO |
| 45 | Destino do liquido: 150.000 vai para a caixinha da Marina; 696.000 fica no financeiro (846.000 - 150.000) | contas | mes 30 | 0,00 | CERTO |
| 46 | Renda ligada a terra (arrendamento) comeca no mes 92 e segue; nenhum bem vendido a interrompe | comparacao com plano | meses 0..548 | 0,00 | CERTO |
| 47 | Dividas totais (fim.div) = trator + credito + consorcio do caminhao (independentes) | tabelas independentes | 549 meses | 0,00 | CERTO |
| 48 | Previdencia/FGTS/consorcio nao contemplado (fim.prev) = FGTS x 1,004^m + 72.000 + parcelas pagas | serie independente | 549 meses | 0,00 | CERTO |
| 49 | Bens totais = 4 bens + entrada 150.000 + principal amortizado, sem o lote vendido | series independentes | 549 meses | 0 | CERTO |
| 50 | Financeiro = reserva + caixinhas | soma | 549 meses | 0,00 | CERTO |
| 51 | Patrimonio = financeiro + bens + participacoes + previdencia - dividas (componentes independentes) | identidade com series independentes | 549 meses | 0 | CERTO |
| 52 | Sem NaN/Infinity em nenhum campo | varredura | 549 meses | 0,00 | CERTO |
| 53 | Sinais: bens, dividas, caixinhas, previdencia, cheque nunca negativos (so o financeiro livre pode ficar negativo = divida da reserva) | varredura | 549 meses | 0,00 | CERTO |
| 54 | cheque = max(0, -reserva) em todo mes | varredura | 549 meses | 0,00 | CERTO |
| 55 | Conservacao: em toda semana, mov_cofre + mov_obj + mov_bens = entradas - saidas (transferencias somam zero) | varredura semanal do fluxo observado | 2380 semanas | 0,00 | CERTO |
| 56 | Reserva: cofre(i) = cofre(i-1) x (1,004)^(7/30,4375) [se > 0] + movimento da semana | recursao semanal independente (rendimento sobre o saldo de abertura da semana) | 2380 semanas | 0,00 | CERTO |
| 57 | fin = cofre + caixinhas em toda semana | varredura | 2380 semanas | 0,00 | CERTO |
| 58 | Caixinha "Reforma da sede": saldo(i) = saldo(i-1) x (1+r)^(7/30,4375) + aportes, com r = taxa pelas regras do dominio (convencao: mes da semana anterior) | recursao semanal independente sobre os aportes observados (mov_obj) | 2380 semanas | 0,00 | CERTO |
| 59 | Caixinha "Reforma da sede": mesma recursao usando a taxa do PROPRIO mes da semana (regra nominal) | idem, taxa do mes da propria semana | 2380 semanas | 0,00 | CERTO |
| 60 | Caixinha "Casa para a Marina": saldo(i) = saldo(i-1) x (1+r)^(7/30,4375) + aportes, com r = taxa pelas regras do dominio (convencao: mes da semana anterior) | recursao semanal independente sobre os aportes observados (mov_obj) | 2380 semanas | 0,00 | CERTO |
| 61 | Caixinha "Casa para a Marina": mesma recursao usando a taxa do PROPRIO mes da semana (regra nominal) | idem, taxa do mes da propria semana | 2380 semanas | 0,00 | CERTO |
| 62 | taxaPorMes de "Reforma da sede" = regra (agressivo antes do mes 0; conservadora depois) | regra independente + PROFILES do plano | 13 meses | 0,00 | CERTO |
| 63 | taxaPorMes de "Casa para a Marina" = regra (moderado antes do mes 12; conservadora depois) | regra independente + PROFILES do plano | 37 meses | 0,00 | CERTO |
| 64 | PROFILES do motor = perfis do plano (0,4% / 0,5% / 0,6% ao mes) | comparacao | 3 perfis | 0,00 | CERTO |
| 65 | Mes exato da troca moderado->conservador da casa da Marina (36-24=12); reforma ja nasce conservadora (12<24) | taxaPorMes | 2 objetivos | 0,00 | CERTO |
| 66 | Casa da Marina: 150.000 x 1,004^(semanas x 7/30,4375) entre venda e data = saldo sacado | recursao independente | 26 semanas | 0,00 | CERTO |
| 67 | Reforma: deposito do mes 7 rendendo a 0,4% (conservadora, pois 12 < 24 meses) ate o saque do mes 12 | recursao independente | 19 semanas | 0,00 | CERTO |
| 68 | Reforma: caixinha cobre os 90.000 na data e o excedente fica em ate ~1% (margem do desenho) | comparacao com 90.000 | mes 12 | 0,00 | CERTO |
| 69 | Casa da Marina: sem aporte mensal (so a venda de 150.000 no mes 30; 153.636 > 150.000) | varredura de mov_obj | meses 0..35 | 0,00 | CERTO |
| 70 | Na data (mes 36): caixinha volta ao financeiro (153.623,60), bem entra por 150.000 (so a entrada), e o excedente (3.623,60) fica livre | balanco do mes 36 | mes 36 | 0,00 | CERTO |
| 71 | Casa da Marina: saldo da caixinha antes da troca de taxa (meses 0..11) = 0 => a taxa "moderado" nunca rendeu dinheiro algum | varredura | meses 0..11 | 0,00 | CERTO |
| 72 | Taxa semanal composta equivale a 0,4% ao mes (4,91% a.a. real): (g^(365,25/7)) = 1,004^12 | conta | - | 0,00 | CERTO |
| 73 | Juros de 4% a.m. sobre a reserva negativa do fim do mes anterior (meses 3 e 7 e outros) | recalculo mes a mes | 548 meses | 0,00 | CERTO |
| 74 | Ruina dispara no primeiro mes que fecha com a reserva negativa (mes 2, dez/2026) | varredura | - | 0,00 | CERTO |
| 75 | Liberdade financeira no mes em que Osvaldo faz 62 (jun/2034 = mes 92; o motor so avalia no inicio do ciclo e marca o mes 93) | idade exata (62-54,38)*12 = 91,4 meses | - | 1 | CERTO |
| 76 | Patrimonio financeiro no mes 93 sustenta a renda desejada (20.000): rendas passivas (INSS 7.000 + arrendamento 28.000 + salario Ione 6.200) ja passam de 20.000 => maxGap = 0, forced = false | conta | - | 0,00 | CERTO |
| 77 | Apos a liberdade o motor gasta TODA a renda: saidas = entradas em cada mes (padrao de vida escalado) | saidas - entradas, meses 93..548 | meses 93..547 (o 548 e a semana final do horizonte, parcial) | 0,00 | CERTO |
| 78 | Semana da liberdade = primeira semana com dia 5 em que idade (semanas/52,18) >= 62 | regra reproduzida (idade 62 do titular; Ione 63,4) | 1 evento | 0,00 | CERTO |
| 79 | finBefore da liberdade = financeiro da semana anterior x 1,004^(7/30,4375) | recalculo | 1 evento | 0,00 | CERTO |
| 80 | forced=false (sustenta: financeiro x 0,4% >= maxGap=0) e sustentavel positivo | conta | - | 0,00 | CERTO |
| 81 | ff.sustentavel = patrimonio x 0,4% + (renda desejada - maxGap) = 3.090.212 x 0,004 + 20.000 | conta | 1 evento | 0,00 | CERTO |
| 82 | ff.pmt = PMT do patrimonio por (90 - idade) x 12 meses a 0,4% (so informativo no modo "renda desejada") | Price independente | 1 evento | 0,00 | CERTO |
| 83 | Apos a liberdade o financeiro so cresce pelo rendimento de 0,4%/mes (nada e poupado nem retirado; o saque do FGTS aos 90 anos tambem e todo gasto no mes): 3,10 mi => ~19 mi | recursao semanal sem fluxos liquidos | meses 94..547 | 0,0028 | CERTO |
| 84 | Parcela Price do credito de custeio (R$ 10.865) | valor do cenario/dominio x motor | 1 ponto | 0,00 | CERTO |
| 85 | Credito entra como entrada de caixa no mes 3 (120.000) | valor do cenario/dominio x motor | 1 ponto | 0,00 | CERTO |
| 86 | Saldo do trator hoje (R$ 402.031) | valor do cenario/dominio x motor | 1 ponto | 0,28 | CERTO |
| 87 | Parcela atual do trator (R$ 5.154,24) | valor do cenario/dominio x motor | 1 ponto | 0,00 | CERTO |
| 88 | Parcela do trator apos o 1o reajuste (R$ 5.360,41), no calendario do cliente: mes 5 | valor do cenario/dominio x motor | 1 ponto | 0,00 | CERTO |
| 89 | Ultima parcela do trator (R$ 6.782,63), no mes 78 | valor do cenario/dominio x motor | 1 ponto | 6.782,63 | DIVERGE: nao e debitada no caixa |
| 90 | Valor projetado do lote no mes 30 (R$ 727.295) | valor do cenario/dominio x motor | 1 ponto | 0,0623 | CERTO |
| 91 | Liquido da venda do lote (R$ 846.000) | valor do cenario/dominio x motor | 1 ponto | 0,00 | CERTO |
| 92 | Caixinha da Marina na data (R$ 153.636 no cenario) | valor do cenario/dominio x motor | 1 ponto | 12,4007 | CERTO |
| 93 | 1a parcela SAC da casa (R$ 4.383) | valor do cenario/dominio x motor | 1 ponto | 0,3622 | CERTO |
| 94 | Amortizacao fixa SAC (R$ 1.458,33) | valor do cenario/dominio x motor | 1 ponto | 0,0033 | CERTO |
| 95 | Parcela da casa no mes 48 com a amortizacao de 100.000 (R$ 104.236 citado pelo consultor) | valor do cenario/dominio x motor | 1 ponto | 0,4226 | CERTO |
| 96 | Maquinas em 5 anos: 900.000 x 0,9^5 = 531.441 | valor do cenario/dominio x motor | 1 ponto | 0,00 | CERTO |
| 97 | Terra em 10 anos: 4.200.000 x 1,04^10 = 6.217.026 | valor do cenario/dominio x motor | 1 ponto | 0,0033 | CERTO |
| 98 | Reforma: necessario R$ 7.336/mes (90.000/12,2676) | valor do cenario/dominio x motor | 1 ponto | 0,4271 | CERTO |
| 99 | Liberdade financeira aos 62 anos | valor do cenario/dominio x motor | 1 ponto | 0,0753 | CERTO |
| 100 | P1 taxa 12% por 5 anos: serie mensal da trajetoria | serie independente x parts[].serie | meses 0..640 | 0 | CERTO |
| 101 | P1 taxa 12% por 5 anos: det.parts do patrimonio | idem | meses 0..641 | 0 | CERTO |
| 102 | P2 alvo 500.000 no mes 36: serie mensal da trajetoria | serie independente x parts[].serie | meses 0..640 | 0,00 | CERTO |
| 103 | P2 alvo 500.000 no mes 36: det.parts do patrimonio | idem | meses 0..641 | 0,00 | CERTO |
| 104 | P3 pontuais +25% (m10), queda a zero (m20), -5.000 (m30): serie mensal da trajetoria | serie independente x parts[].serie | meses 0..640 | 0,00 | CERTO |
| 105 | P3 pontuais +25% (m10), queda a zero (m20), -5.000 (m30): det.parts do patrimonio | idem | meses 0..641 | 0,00 | CERTO |
| 106 | P4 venda no mes 24 por 420.000 (custos 2% + 1.000): serie mensal da trajetoria | serie independente x parts[].serie | meses 0..24 | 0,00 | CERTO |
| 107 | P4 venda no mes 24 por 420.000 (custos 2% + 1.000): det.parts do patrimonio | idem | meses 0..23 | 0,00 | CERTO |
| 108 | P5 alvo 100.000 no mes 24 e taxa -8% depois: serie mensal da trajetoria | serie independente x parts[].serie | meses 0..640 | 0,00 | CERTO |
| 109 | P5 alvo 100.000 no mes 24 e taxa -8% depois: det.parts do patrimonio | idem | meses 0..641 | 0,00 | CERTO |
| 110 | P6 alvo 300.000 no mes 12 + pontual +50.000 no mes 6 (ritmo refeito): serie mensal da trajetoria | serie independente x parts[].serie | meses 0..640 | 0,00 | CERTO |
| 111 | P6 alvo 300.000 no mes 12 + pontual +50.000 no mes 6 (ritmo refeito): det.parts do patrimonio | idem | meses 0..641 | 0,00 | CERTO |
| 112 | fim.part = soma das participacoes (meses 0..23) | soma independente | meses 0..23 | 0 | CERTO |
| 113 | P4: preco 420.000, custos 9.400, liquido 410.600, sem quitacao, no mes 24 | contas | mes 24 | 0,00 | CERTO |
| 114 | P4: no mes da venda sai a participacao (mov_bens -420.000) e os custos saem (out_vendap_3 = 9.400) | fluxo do mes | mes 24 | 0,00 | CERTO |
| 115 | P4: depois da venda a participacao e zero (meses 24..) | varredura | meses 24..641 | 0,00 | CERTO |
| 116 | Nenhuma participacao fica negativa (P3 cai a zero; o pontual de -5.000 nao a leva a negativo) | varredura | todos os meses | 0,00 | CERTO |
| 117 | Caixinha "Carro" (60 meses, agressivo): taxa de cada mes pelas regras (troca no mes 36) | regra independente | 61 meses | 0,00 | CERTO |
| 118 | Caixinha "Carro": recursao semanal com a taxa do mes da semana anterior (convencao do motor) | recursao independente | semanas ate a data | 0,00 | CERTO |
| 119 | Caixinha "Carro": recursao semanal com a taxa do proprio mes da semana (convencao nominal): desvio maximo | recursao independente | semanas ate a data | 56,6322 | CERTO |
| 120 | Caixinha "Carro": saldo na data = 100.000 x (1+taxa)^(semanas antes da troca) x 1,004^(semanas depois) | formula independente | 1 ponto | 0 | CERTO |
| 121 | Caixinha "Viagem" (18 meses, agressivo): taxa de cada mes pelas regras (troca no mes 0) | regra independente | 19 meses | 0,00 | CERTO |
| 122 | Caixinha "Viagem": recursao semanal com a taxa do mes da semana anterior (convencao do motor) | recursao independente | semanas ate a data | 0,00 | CERTO |
| 123 | Caixinha "Viagem": recursao semanal com a taxa do proprio mes da semana (convencao nominal): desvio maximo | recursao independente | semanas ate a data | 0,00 | CERTO |
| 124 | Caixinha "Viagem": saldo na data = 40.000 x (1+taxa)^(semanas antes da troca) x 1,004^(semanas depois) | formula independente | 1 ponto | 0,00 | CERTO |
| 125 | Caixinha "Borda 24" (24 meses, moderado): taxa de cada mes pelas regras (troca no mes 0) | regra independente | 25 meses | 0,00 | CERTO |
| 126 | Caixinha "Borda 24": recursao semanal com a taxa do mes da semana anterior (convencao do motor) | recursao independente | semanas ate a data | 0,00 | CERTO |
| 127 | Caixinha "Borda 24": recursao semanal com a taxa do proprio mes da semana (convencao nominal): desvio maximo | recursao independente | semanas ate a data | 0,00 | CERTO |
| 128 | Caixinha "Borda 24": saldo na data = 30.000 x (1+taxa)^(semanas antes da troca) x 1,004^(semanas depois) | formula independente | 1 ponto | 0,00 | CERTO |
| 129 | Price com IOF financiado (0,38% + 0,0082%/dia, teto 365 dias), 400.000 a 12% a.a. em 120x: saldo mes a mes (meses 0..23) | ponto fixo F = C + IOF(F) e tabela Price independentes | 24 meses | 0,00 | CERTO |
| 130 | Venda do bem financiado no mes 24: quitacao = saldo do contrato; liquido = preco - custos - quitacao | tabela independente | mes 24 | 0,00 | CERTO |
| 131 | Venda com saldo devedor: out_quita_0 no fluxo = quitacao; custos = out_venda_0 | fluxo do mes 24 | mes 24 | 0,00 | CERTO |
| 132 | Depois da venda a divida do bem e zero (det.divs) | varredura | meses 24.. | 0,00 | CERTO |
| 133 | Consorcio do trator: saldo 426.216 -> 443.265 apos o reajuste da parcela 14; parcela 5.154,24 (443.265/86) | tabela independente | 3 valores | 0,36 | CERTO |
| 134 | Nenhum dos 4 bens tem saldo devedor: dividas[] do extrato = 0 | varredura | 4 x 361 meses | 0,00 | CERTO |
| 135 | Evento "Divida quitada: trator" cai no mes 78 (saldo zera no mes 78) | evento x saldo | 1 evento | 0,00 | CERTO |
| 136 | Evento "Financiamento da casa quitado" cai no mes 207 (36 + 172 parcelas - 1) | evento x tabela SAC | 1 evento | 0,00 | CERTO |
| 137 | LATENTE (nao ocorre no cenario 08): apos a liberdade, a parcela contratual de 5.000 sai no fluxo igual a 5.000? | plano sintetico: ff no mes 17, renda passiva 30.000 | mes 40 | 5.000 | DIVERGE: obtido 10000 (a linha de despesa da parcela e escalada junto com a vida); fator 2 |


Resumo da tabela: 137 conferências; 131 dentro da tolerância (maioria com erro R$ 0,00; o maior erro "CERTO" é R$ 0,0013 na parcela Price arredondada pelo consultor para R$ 10.865) e 6 divergentes: salário da Ione no mês 108, parcelas do trator e do caminhão (duas linhas), reconciliação caixa × dívida do trator, "última parcela do trator" (fidelidade) e o teste latente de escala de parcela em plano sintético. Todas explicadas na seção 4.

## 4. Contas erradas encontradas

### 4.1 Parcelas dos dois consórcios: o caixa debita uma parcela a menos que o contrato (DÍVIDAS)
- **Sintoma.** Trator: o contrato tem 78 parcelas a pagar (índices 23 a 100) somando R$ 460.847,80 (= saldo de hoje R$ 402.030,72 + reajustes R$ 58.817,08); o fluxo debita 77 parcelas (meses 1 a 77) somando R$ 455.693,62. Faltam **R$ 5.154,18** (≈ uma parcela). A tabela do contrato põe a parcela 100 (R$ 6.782,63) no mês 78 (abr/2033, correto pelo cliente: 1ª parcela jan/2025); o fluxo debita R$ 0,00 nesse mês. Os reajustes entram **um mês antes** do correto: o valor reajustado de 5.360,41 é cobrado no mês 4 (fev/2027, onde ainda vale a parcela 26 de 5.154,24) e não no mês 5; o mesmo nos meses 16, 28, 40, 52, 64 e 76 (diferenças a mais de R$ 206,17; 214,42; 222,99; 231,91; 241,19; 250,84; 260,87 = R$ 1.628,39), compensadas pela parcela final que falta (−R$ 6.782,63). O saldo devedor do extrato, porém, segue o calendário do cliente (zera no mês 78), então o caixa e a dívida ficam desalinhados em uma parcela. Caminhão: 70 parcelas restantes; o fluxo debita 69 (meses 1 a 69; observado R$ 446.799,84); a parcela do mês 0 (dia 10 de outubro) é descartada.
- **Valor esperado × obtido.** Trator: R$ 460.847,80 × R$ 455.693,62 (−R$ 5.154,18). Caminhão: soma das 70 parcelas do contrato no calendário do cliente = R$ 454.000,00 contra R$ 446.799,84 observados (−R$ 7.200,16, uma parcela).
- **Impacto no patrimônio** (reexecução do motor com o trator no calendário do cliente e uma parcela de R$ 7.200 do caminhão no mês 1; inclui o juro de 4% nos meses de reserva negativa e a capitalização de 0,4% a.m.): patrimônio **superestimado** em R$ 7.550 no mês 3, R$ 8.493 no mês 24, R$ 15.999 no mês 78, R$ 16.982 no mês 93 (liberdade), R$ 26.026 no mês 200 e R$ 104.008 no mês 547 (0,35% do patrimônio final de R$ 29,8 mi). A data da liberdade não muda (mês 93).
- **Origem provável.** Interação entre (a) a tradução do consultor: `restantes: 78` e `pagas: 10`, sem `inicio`, com parcelas no dia 10 e plano iniciado em 19/10 (o cliente diz 22 pagas e 1ª parcela em jan/2025, logo outubro/2026 já é a 22ª paga), e as linhas de parcela que o portal lança com o mês 0 como "parcela deste mês" (`lancaParcela`, `degrausDaParcela`, `setFim(it, rest - 1)` em tela-consultor.html linhas 6968–6970 e 7118); e (b) o motor, que descarta todo fluxo anterior à semana de hoje (`f: i < W0 ? {} : f`, evolucao-patrimonial.html linha 2145) mas mantém nos contratos a parcela do mês 0 como pendente (`restantesContratadas`, linha 1608; `contratoDoConsorcio`, `k0 = n − rest`, linha 1641; `caixaDoConsorcio` e o corte da linha em `c.fim`, linhas 1418 e 2400). A aritmética de cada peça está certa; o descompasso é de convenção do mês 0 parcial.
- **Sugestão (não aplicada).** Quando o dia de vencimento da parcela for anterior ao dia do início do plano, tratar a parcela do mês 0 como paga já na tradução (k0 + 1, restantes − 1, saldo devedor após ela) ou lançá-la como saída do mês 0; e um teste automático "soma das parcelas debitadas = saldo de hoje + reajustes" no portal. Para o caminhão, confirmar com o cliente se as 10 parcelas pagas incluem outubro.

### 4.2 Caminhão contemplado não entra como bem (DÍVIDAS / patrimônio)
- **Sintoma.** No mês 14 o patrimônio cai R$ 571.718,31 (de 6.557.345,75 para 5.985.627,44): previdência −165.439,90 (o consórcio pago deixa de ser ativo), dívida +330.944,52 (369.740,12 para 700.684,64, com o saldo do consórcio de R$ 346.892,86), financeiro −86.857,67 (lance de R$ 50.000 e o déficit do mês), e **nenhum ativo de R$ 500.000** aparece em bens.
- **Esperado × obtido.** Caminhão em bens a partir do mês 14: R$ 500.000,00 × R$ 0,00. Patrimônio líquido de 2028 em diante subestimado em R$ 500.000 (sem contar a depreciação que o caminhão teria).
- **Origem.** Tradução do consultor (a carta foi tirada do caixa com um compromisso de saída `camin` de R$ 500.000, dificuldade 1 dele) combinada com lacuna do sistema: o consórcio "a contemplar" do Patrimônio entrega a carta em dinheiro (`caixaDoConsorcio`, linha 1418) e o consórcio por objetivo (que compraria o bem) não aceita parcelas já pagas.
- **Sugestão.** Campo "a carta vira bem" no consórcio do Patrimônio (soma `carta` em bens no mês da contemplação e dispensa o compromisso) ou `compra.consorcio` com parcelas pagas.

### 4.3 Último salário da Ione um mês cedo (FLUXO)
- **Sintoma.** `in_ione` = R$ 6.200 nos meses 1 a 107 e R$ 0 no mês 108 (out/2035), quando ela ainda tem 59 anos (completa 60 em nov/2035, em qualquer dia do mês) e o INSS só começa no mês 109. Esperado R$ 6.200,00; obtido R$ 0,00.
- **Impacto.** R$ 6.200 no mês 108 (R$ 35.768 capitalizado até o mês 547), a menos no patrimônio.
- **Origem.** Motor: `paradaMi` (evolucao-patrimonial.html linha 1291) arredonda `(60 − idade) × 12 = 108,4` para 108 e trabalha enquanto `mi < 108`. Regra violada: quem faz 60 em novembro trabalha (e é pago) até o salário de outubro.
- **Sugestão.** Usar o piso do mês do aniversário (ou `ceil`) em `paradaMi`.

### 4.4 Risco latente (não ocorre no cenário 08): parcela de dívida multiplicada pelo padrão de vida depois da liberdade
- **Sintoma (plano sintético).** Parcela contratual de R$ 5.000 numa linha de despesa fixa e renda passiva de R$ 30.000 depois da liberdade: o fluxo debita R$ 10.000 (fator 2,0 do padrão de vida), enquanto o saldo devedor cai como se fosse R$ 5.000. No cenário 08 isso **não** acontece porque os consórcios e o crédito terminam antes do mês 93 e o financiamento da casa da Marina é um fluxo próprio (`streams`) que não é escalado (conferido: parcelas dos meses 93 a 207 exatas).
- **Origem.** Motor: `doOffset` multiplica toda despesa do cadastro por `m.scale` (evolucao-patrimonial.html, linha 1933, e `m.scale` na linha 2116) sem distinguir parcela contratual de padrão de vida; `livingAt` também soma as parcelas.
- **Sugestão.** Excluir das despesas escaláveis as linhas que são parcela de dívida (as `linha` das dívidas) ou marcá-las como fixas contratuais.

### 4.5 O que foi tentado para quebrar o motor e não quebrou
- Recalcular de forma independente: bens (4 séries), venda, tabelas do consórcio contemplado (reajuste 4% após a 14ª e a cada 12), Price, SAC com amortização extra por prazo, IOF financiado com ponto fixo, venda de bem financiado com quitação, consórcio a contemplar com lance proporcional, e 6 participações sintéticas (taxa, alvo, pontual, queda a zero, venda, ritmo refeito).
- Conservação semanal do dinheiro (2.380 semanas): `cofre(i)` e `caixinha(i)` reconstruídos a partir dos próprios fluxos; transferências cofre/caixinha/bens somam zero a R$ 4×10⁻¹¹.
- Caixinhas com trocas de taxa dentro do prazo (60 meses), no limite de 24 e 18 meses, saldo na data exato; sem NaN, sem negativos, juros da reserva negativa mês a mês.
- Regeneração do extrato: o arquivo gravado é idêntico ao da versão atual do motor (diferença 0,000).

## 5. Comportamentos por desenho que o dono do produto deveria conhecer

1. **Depois da liberdade o motor gasta toda a renda (`m.scale`, linha 2116).** No mês 93 saúde sobe de R$ 3.600 para R$ 8.366,71 e casa de R$ 12.900 para R$ 29.980,69 (fator 2,324); gasto total R$ 41.200,00 = toda a renda (INSS 7.000 + arrendamento 28.000 + Ione 6.200). Média de gasto de R$ 39.061/mês nos meses 93 a 547 contra R$ 16.500 declarados e R$ 20.000 de renda desejada: R$ 10,27 mi a mais de gasto nominal; a juros de 0,4% a.m., se o gasto ficasse em R$ 20.000 o financeiro final (mês 547, aos 100 anos) seria ≈ R$ 42,8 mi em vez de R$ 19,05 mi (aproximação por valor futuro: +R$ 23,7 mi). O "financeiro cresce de R$ 3,1 mi para R$ 19,0 mi" é matemática correta de juros sobre massa nunca retirada, mas a renda desejada deixa de ser teto.
2. **Salto do lote (bem sobe a R$ 727.295 e é vendido por R$ 900.000).** No bem o preço da venda não vira alvo da curva (na participação vira): salto de +R$ 172.704,94 no mês 30 (menos custos de R$ 54.000 = +R$ 118.704,94); patrimônio 6.514.392,85 → 6.635.406,76.
3. **Bem comprado com financiamento entra por "equity".** Casa da Marina: bens = entrada R$ 150.000 + principal amortizado (R$ 150.000 + 1.458,33 no mês 36 até R$ 500.000 no mês 207); a dívida do financiamento (R$ 348.541,67 no mês 36) não aparece em dívidas. Patrimônio **líquido** correto (conferido em 549 meses); patrimônio bruto e dívidas totais ficam subestimados pelo principal ainda devido (até R$ 348 mil). A casa não valoriza depois de comprada. (A dificuldade 12 do consultor, "líquido subestimado em até R$ 350 mil", não procede para o líquido.)
4. **Regra dos 24 meses sobrepõe o perfil do cliente.** Reforma "agressivo" rende conservador (12 < 24 meses): R$ 791,89 a menos no saque (0,87%) do que se rendesse 0,6%. Casa da Marina "moderado": R$ 917,20 a menos se tivesse ficado moderada nos 26 semanas em que tem saldo (a caixinha só tem dinheiro depois do mês 30).
5. **Margem de 1% no aporte.** A caixinha da reforma é financiada com 1% de folga: R$ 90.671,53 para um gasto de R$ 90.000 (excedente de R$ 671,53 volta ao financeiro no mês 12). O "necessário" de R$ 7.336/mês exibido no cartão não é usado na simulação (a safra paga).
6. **Troca de taxa pode ter até 1 semana de atraso** (a semana que abre o mês usa a taxa do mês anterior; `evolucao-patrimonial.html` linha 1980). No cenário 08 o efeito é R$ 0,00 (nenhum saldo na semana da troca). No estresse (R$ 100 mil agressivos, troca no mês 36) é R$ 56,63 (0,04%) sobre R$ 136 mil.
7. **Capitalização semanal.** R$ 150.000 por 26 semanas rendem R$ 153.623,60; o valor "mensal" do cenário (1,004^6) é R$ 153.636,19, diferença de R$ 12,59 (o cenário assume 6,00 meses; 26 semanas são 5,98).
8. **Mês 0 é parcial.** Só um quarto da despesa ajustável de R$ 12.900 (R$ 3.225,00) e nenhuma despesa fixa, salário ou parcela do mês de outubro (dias 5 e 10 já passaram); o mês parece mais leve do que é.
9. **Liberdade um mês depois.** Osvaldo faz 62 em 1/jun/2034 (mês 92), mas a idade em semanas/(365,25/7) é 61,9986 na semana certa: a liberdade é marcada no mês 93. Efeito: o gasto escalado começa no mês 93; no mês 92 gastou-se R$ 16.500 em vez de R$ 38.347 (R$ 21.847 a menos, a favor do plano).
10. **FGTS aos 90 anos é gasto num mês.** O saque de R$ 246.128,10 (mês 468) entra como renda e a regra do item 1 eleva as saídas a R$ 285.128 no mês (saúde R$ 62.210 e casa R$ 222.918).
11. **Consórcios.** Contemplado: a dívida é a soma nominal das parcelas futuras (R$ 402.030,72 contra carta de R$ 420.000), com taxa de administração e fundo de reserva. A contemplar: as parcelas pagas (R$ 72.000 + R$ 7.200 a cada mês, incluindo taxa) contam como ativo ("previdência", R$ 205.624 no mês 13) e zeram na contemplação.
12. **Reserva negativa custa 4% ao mês** (juros de plano), não os 1,3% do crédito de custeio: R$ 2.637,56 em três meses (3, 7 e 19) e a ruína no mês 2 (dez/2026). Mesmo com o crédito de R$ 120.000 a reserva fecha negativa nos meses 2, 6 e 18 (mínimo −R$ 34.054,76 no mês 6): é resultado correto do plano, não erro do motor.
13. **Patrimônio financeiro de hoje.** O `initialWealth` de R$ 155.000 soma aplicações (R$ 45.000), FGTS (R$ 38.000) e consórcio pago (R$ 72.000); o motor separa os dois últimos em "previdência" (R$ 110.000 no mês 0) e o financeiro do mês 0 é R$ 41.854,74 (45.000 rendidos menos R$ 3.225): sem dupla contagem. Só quem lê `initialWealth` diretamente (fase da vida, não auditada aqui) vê R$ 155.000.

### 5.1 Julgamento das "estranhezas" e dificuldades do consultor

| Item (dificuldades-08.md) | Julgamento | Evidência |
|---|---|---|
| (d)1 / (b)13 mês 93 despesas dobram | Desenho (seção 5, item 1) | fator 2,324; gasto = renda |
| (d)2 / (b)10 salto do lote | Desenho | +172.704,94 (seção 5, item 2) |
| (d)3 / (b)12 mês 36 bens e dívida | Desenho (equity); conclusão do consultor sobre o líquido errada | bens = 150.000 + principal, erro 0,00 |
| (d)4 / (b)1 caminhão e mês 14 | **Erro de tradução/lacuna** | 4.2: falta o ativo de R$ 500.000 |
| (d)5 / (b)20 reserva negativa nos meses 2, 6 | Correto: resultado do plano | juros e ruína recalculados |
| (d)6 mês 0 só com `out_adj_casa` | Desenho (mês parcial) | R$ 3.225 = 12.900/4 |
| (d)7 caixinha da reforma passa de 90.000 | Desenho (margem de 1%) | 90.671,53; excedente 0,75% |
| (d)8 eventos de quitação | Correto | trator mês 78; casa mês 207 |
| (d)9 FGTS aos 90 | Desenho | 38.000 × 1,004^468 = 246.128,10 |
| (d)10 R$ 19 mi no fim | Desenho (item 1) | juros sobre massa não retirada |
| (d)11 patrimônio de hoje R$ 155 mil | Desenho, sem dupla contagem | fin(0) = 41.854,74; prev = 110.000 |
| (b)2 / (b)3 consórcio do caminhão (72.000, reajuste) | Dado faltante do cliente | sensível ao reajuste |
| (b)4 lance embutido ou do bolso | Equivalente no caixa (carta − lance = 450.000) | `in_pas_3` = 450.000 |
| (b)5 22 pagas × inicio jan/2025 | **Confirmado: é a origem de 4.1** | 77 × 78 parcelas |
| (b)6 saldo zero apaga a dívida | Desenho (latente); aqui o consultor preencheu certo | saldo mês 0 = 402.030,72 |
| (b)7 parcela em linha separada | Tradução, origem de 4.1 | linha `parc1` vs contrato |
| (b)9 reforma e "necessário" | Desenho | aporte único de 89.103,61 |
| (b)14 liberdade no mês 93 | Desenho (365,25 dias/ano) | semana 3235 idade 61,9986 |
| (b)15 salário da Ione para cedo | **Erro de motor, pequeno** | 4.3 |
| (b)16 FGTS "não mexe" | Lacuna do sistema | saque aos 90 |
| (b)21 juros de 4% | Desenho | recalculado |

## 6. Limites desta auditoria

- **Não coberto no cenário real (sem dados):** participações societárias (o plano não tem; coberto só por testes sintéticos), IOF "à vista", seguro prestamista e tarifas, amortização antecipada em modo "parcela", amortização maior que o saldo (limite ao saldo), carência (não há campo), consórcio a contemplar com reajuste diferente de 0 e lance embutido, consórcio de objetivo (`compra.consorcio`), Price de compra de objetivo, venda cancelada por objetivo não comprado, teto da dívida (100 × renda; não acionado), saque em modos "perpetuidade" e "consumo", previdência fechada, IR/INSS/seguros/riscos/política de investimentos.
- **Convenção de calendário assumida:** mês 0 = out/2026 (início 19/10/2026), dia de nascimento = dia 1 (cliente só deu mês), safra em 15/maio e 15/setembro, parcela dos consórcios no dia 10. Nas contas esperadas das parcelas foi usado o calendário do cliente (trator: 22 pagas até out/2026, inclusive); para o caminhão ("10 pagas") não há como saber se outubro está incluso.
- **Esperado do cenário também conferido:** "R$ 153.636 na data" é aproximação mensal (motor 153.623,60 por capitalização semanal); "novo reajuste depois da parcela 26 (em fevereiro de 2027, mês 4)" é ambíguo (o motor cobra o valor reajustado em fev/2027; pelo calendário do cliente seria em mar/2027); demais valores (402.031; 5.154,24; 10.865; 4.383; 846.000; 727.295; 531.441; 6.217.026) conferem.
- **Impactos em R$ do item 4.1** foram dimensionados reexecutando o motor com a linha corrigida (apenas para medir o efeito, não para produzir o esperado). O impacto do item 1 da seção 5 (gasto escalado) é aproximação por valor futuro, sem reexecução.
- Não foram avaliados telas, textos, nem a coerência do portal (`tela-consultor.html`) além das linhas citadas; nenhuma correção foi aplicada ao motor, às telas, aos planos, aos extratos ou a outros laudos.
