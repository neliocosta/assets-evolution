# Laudo matemático — Cenário 05 (Marcos Pereira)

Código reexecutável: `ux/auditoria/laudos/auditor-05.js` (`node ux/auditoria/laudos/auditor-05.js`). São 80 conferências: 75 certas, 3 erradas (todas em parcelas de dívida) e 2 achados de desenho (ruína e parcelas comprimidas). Convenção: "mês N" = meses a partir de hoje; mês 0 = out/2026; "mi" = índice do mês no extrato.

## 1. Veredito

**A aritmética do motor está correta em participação, saldo devedor, tabela de amortização, taxa de rendimento, taxa das caixinhas e conservação do dinheiro (erro de R$ 0,00 a 1e-10). Achei duas contas erradas nas parcelas de dívida que saem do caixa (uma de tradução do consultor, uma de regra do motor) e um comportamento por desenho grave: quando o dinheiro acaba, o motor corta o consumo em vez de acusar ruína, e o plano de Marcos parece fechar até os 95 anos sem fechar (R$ 1,66 milhão de renda desejada sem cobertura).**

| Frente | Semáforo | Resumo |
|---|---|---|
| Participações | **CERTO** | Série, queda a zero, evento e variantes (venda, salto maior que o saldo): erro 0,00 |
| Dívidas | **CERTO COM RESSALVAS** | Saldos, tabelas, SAC, juros e quitação exatos; as parcelas que saem do caixa não são as do contrato (seção 4) |
| Caixinhas | **CERTO** (não exercitado pelo cenário) | O plano não tem objetivos; provado em 4 caixinhas sintéticas, erro 0,00 |
| Contabilidade geral | **CERTO** | Identidades do patrimônio, caixa semana a semana (erro 1e-10), sem NaN, sem sinal errado |
| Fluxo | **CERTO COM RESSALVAS** | Exato antes de parar de trabalhar; depois, linhas reescaladas (desenho) e parcela da dívida diferente do contrato |
| Liberdade / ruína | **CERTO COM RESSALVAS** | Idade, "forçada" e renda sustentável corretas; o alerta de ruína nunca dispara (desenho, enganoso para este cliente) |

## 2. Por que a matemática está certa

### 2.1 Participação societária (Cantina do Zé)
Regras do domínio: valor(m) = valor(m−1)·(1+pct)^(1/12) nos 30 meses da taxa de −10% a.a.; no mês 30 o salto pontual de −100% dá max(0, v·(1−1)) = 0; depois, zero cresce zero.
- Mês 12 (out/2027): esperado 225.000,00; motor 225.000,00; erro 0,00.
- Mês 29 (mar/2029): esperado 193.802,51; motor 193.802,51; erro 0,00 (o cenário diz 193.800, arredondado).
- Mês 30 (abr/2029): esperado 0,00; motor 0,00. O evento "Desvalorização" registra −R$ 192.108, igual a 250.000·0,9^2,5 = 192.108,37 (R$ 0,37 é o arredondamento do texto do evento).
- Meses 31 a 501: 0,00 em todos. Mínimo da série: 0 (nunca negativo).
- A série inteira (`parts[0].serie`, 501 meses), `fim.part` e `fim.det.parts[0]` (502 meses) batem com o recálculo: erro máximo 0,00.
- Tentei quebrar: (i) pontual de **−R$ 400.000** (o valor da conversa, maior que o saldo restante) no lugar de −100%: o motor limita a zero, série idêntica; (ii) **venda** no mês 24 por 150.000 com custo de 5%: a série vai ao preço em ritmo geométrico (250.000·0,6^(m/24), erro 3e-11), o custo de 7.500 sai como `out_vendap_0`, `mov_bens` = −150.000, participação 0 no mês 24 e depois.
- Renda ligada: o aluguel de R$ 3.000 pertence à sala comercial (bem, não vendido) e continua em todos os meses. A participação não tem renda ligada.

### 2.2 Dívidas
Regras: Price (parcela constante, juros sobre o saldo), SAC (amortização = principal/n, juros sobre o saldo), taxa deduzida da parcela informada (a parcela do banco manda, regra do motor), IOF "isento" nas duas dívidas do plano, saldo informado de hoje manda e o contrato dá o caminho.
- **Consignado** (90.000, 72x, parcela 2.337, 24 pagas): taxa deduzida da parcela 1,9504% a.m. (informada 1,95%); saldo hoje recalculado R$ 72.412,03, plano e motor 72.412,00. Saldos mês a mês (361 meses): mi 12 = 60.044,68; mi 36 = 24.790,02; mi 47 = 2.292,29; mi 48 = 0. Esperado = motor com erro 0,00 (sem a escala ao saldo informado, erro máximo R$ 0,03).
- **Cartão** (6.500, 10x, 780, 3 pagas): taxa implícita 3,4602% a.m. (cenário: 3,46%); saldo hoje 4.776,44 (plano 4.776,00); mi 3 = 2.867,45; mi 6 = 753,84; mi 7 = 0. Erro 0,00 nos 361 meses.
- **Crédito novo** (60.000, 36x, 2,1% a.m., SAC, mês 18): parcela 1 = 60.000/36 + 60.000·0,021 = 2.926,67; última (mi 54) = 1.701,67; amortização 1.666,67 por mês; saldo mi 19 = 58.333,33; mi 30 = 40.000,00; mi 36 = 30.000,00; mi 54 = 0 (resíduo de ponto flutuante 3e-11). Juros totais 23.310,00 = 83.310,00 − 60.000,00. As 36 parcelas lançadas pelo consultor (degraus da linha `crparc`) batem com o contrato em 2 casas (erro ≤ 0,005). Saldo em 502 meses: erro 0,00.
- **Neutralidade do crédito**: no mês 18 o financeiro sobe 60.000 e a dívida sobe 60.000; a variação do patrimônio líquido, 1.734,77, é igual à recalculada sem o crédito.
- **Juros = Σparcelas − principal**: consignado 112.176,00 = 72.412,03 + 39.763,97; cartão 5.460,00 = 4.776,44 + 683,56 (erro 1e-11). Todas as dívidas em zero no fim.
- **Stress de amortização antecipada** (R$ 20.000 no mês 12 do consignado): os modos *prazo* e *parcela* batem com o recálculo (erro 0,00). Ressalva em 5.4: o adiantamento reduz a dívida, mas o motor não tira o dinheiro do caixa.
- Marcos (eventos): cartão quitado no mês 7, crédito no 18, consignado quitado no 48 coincidem com o mês em que cada saldo zera.
- Não há no plano: bem financiado, venda de bem com saldo devedor, consórcio, compra financiada de objetivo, amortização antecipada, IOF a financiar, seguro (seção 6).

### 2.3 Caixinhas
O plano tem `objectives: []`: nenhuma caixinha, `obj[]` vazio nos 502 meses, nenhum `mov_obj_*` (controle D0, erro 0). Como o cenário não exercita a frente, montei **4 caixinhas sintéticas** (renda alta para haver sobra; mesmo motor, mesmas regras) e reconstruí cada uma semana a semana com a taxa que deveria valer:
- Casa na praia (agressivo, 60 meses), Carro (moderado, 30), Viagem (agressivo, 15: já nasce conservadora) e Reserva cheia (moderado, 40).
- saldo(s+1) = saldo(s)·(1+taxa)^(7/30,4375) + aporte(s): erro máximo **0,00** em todas as semanas.
- Taxa por mês (`taxaPorMes`) = perfil até o mês (meses − 24) e conservadora (0,4%) depois: troca no **mês 36** (Casa na praia), **mês 6** (Carro), **mês 16** (Reserva cheia), nenhuma na Viagem. Nenhum mês com taxa diferente da esperada. Perfis: conservador 0,4%, moderado 0,5%, agressivo 0,6%.
- Efeito em reais da regra dos 24 meses (mesmos aportes): Casa na praia R$ 96.438,62 com a regra; R$ 100.472,90 se ficasse agressiva o tempo todo (+R$ 4.034,29); R$ 92.996,91 se conservadora o tempo todo (−R$ 3.441,70). Carro: 36.778,99 com a regra; 37.413,95 sempre moderado; 36.699,06 sempre conservador.
- Saque na data: o gasto é o valor do objetivo (150.000, 60.000, 20.000 e 15.000, exatos) e a caixinha zera, devolvendo o saldo ao cofre.
- Aporte que para quando basta: a Reserva cheia (meta 15.000, dedicado 12.000) parou de receber aporte no mês 29 e chegou à data com 15.130,90.

### 2.4 Contabilidade geral e rendimento
- Patrimônio = financeiro + bens + participações + previdência − dívidas, com fin = cofre + caixinhas e div/bens/part = soma do detalhe: erro 0 em 502 meses. Patrimônio hoje R$ 2.494.246; mi 21 R$ 2.515.220; mi 60 R$ 2.093.445; do mi 154 em diante R$ 1.540.000 (só os bens).
- **Conservação do dinheiro**, semana a semana, 2.177 semanas: cofre(i) = cofre(i−1)·(1+0,4%)^(7/30,4375) + Σentradas − Σsaídas, erro máximo 1,2e-10. O fluxo mensal do extrato é a soma exata das semanas do motor; mov_cofre = entradas − saídas; não há transferências no plano real.
- **Convenção de rendimento (E)**: só o cofre positivo rende; o rendimento é semanal composto sobre o saldo de abertura da semana (antes dos fluxos dela), equivalente a 0,400000% a.m. no mês médio de 30,4375 dias (4,907% a.a. real). Meses de 5 semanas rendem mais que os de 4 (174 contra 326 no horizonte). O dinheiro que entra no dia 5 só rende a partir da semana seguinte. Consistente em todo o horizonte.
- Reconciliação mensal independente (um passo): erro máximo R$ 4,85 (rendimento das saídas do dia 10 dentro do mês), abaixo da tolerância de R$ 25.
- Sem NaN em 18.416 números; reserva nunca negativa (`cheque` = 0; os juros de 4% a.m. nunca disparam).

### 2.5 Fluxo
- Mês 0 sem lançamentos: o ciclo vai de 05/10 a 04/11 e os dias 5 e 10 já passaram em 20/10 (premissa de calendário, coerente).
- Meses 1–20 exatos, chave a chave (erro 0,00): salário 11.000, aluguel 3.000, 12.500 de consumo, parcelas; déficit de 1.617,00 (mi 1–6) e 837,00 (mi 7 em diante), como no cenário.
- Salário recebido nos meses 1–20 e em nenhum depois (60 anos = jul/2028 = mi 21). INSS 5.200 do mi 81 (jul/2033, 65 anos completos) ao fim. Dezembro sem 13º (o plano não lança). Crédito de 60.000 só no mi 18.
- Pós-liberdade (mi 21–153): cada linha de despesa = nominal × (14.000 ÷ Σ linhas nominais); erro 0,00 em 133 meses × todas as linhas (regra de desenho, 5.3).

### 2.6 Liberdade financeira
- `ff`: mi 21, 60,005 anos, `forced = true` (idade-alvo marcada sem o dinheiro sustentar), maxGap 11.000 (= 14.000 − 3.000 de aluguel), renda sustentável 6.518,44 = 879.610,79·0,4% + (14.000 − 11.000): erro 0,00.
- Mês em que o financeiro zera: simulação mensal independente = mi 154 (ago/2039, 71,1 anos); motor mi 154. No mi 154 a retirada é só o que sobra (saídas 11.417,83 = 8.200 + 3.217,83, erro 1e-12) e do mi 155 em diante as saídas são 8.200,00 (= entradas), por 347 meses.
- Variantes confirmadas por rodadas no motor: sem o crédito o dinheiro acaba no mi 138 (consultor: 138; minha simulação: 138); sem `retireAge` a liberdade vem aos 67,9 anos (consultor: 67,9).

## 3. Conferências realizadas

Erro máximo em R$ (ou em meses/unidades, conforme o item). Tolerância R$ 0,01 salvo indicação. "ERRADO" = a conta do motor ou do plano diverge do recálculo; "ACHADO" = comportamento por desenho, não aritmético.

| # | O que foi conferido | Método | Amostra | Erro máximo | Resultado |
|---|---|---|---|---|---|
| A1 | Nenhum NaN/Infinity no extrato inteiro | varredura recursiva | 18416 números | 0.0e+0 | CERTO — não finitos: 0 |
| A2a | fin = cofre + caixinhas | identidade por mês | 502 meses | 0.0e+0 | CERTO |
| A2b | div = soma do detalhe das dívidas | identidade por mês | 502 meses | 0.0e+0 | CERTO |
| A2c | bens = soma do detalhe dos bens | identidade por mês | 502 meses | 0.0e+0 | CERTO |
| A2d | part = soma do detalhe das participações | identidade por mês | 502 meses | 0.0e+0 | CERTO |
| A2e | Sinais: fin>=0, part>=0, div>=0, bens>=0, cheque=0 | varredura | 502 meses | 0.0e+0 | CERTO — meses com sinal errado: 0 |
| A3a | Fluxo mensal do extrato = soma das semanas do motor | recomposição por chave | 502 meses | 0.0e+0 | CERTO |
| A3b | mov_cofre = Σentradas − Σsaídas (nada criado/perdido no caixa) | identidade por mês | 502 meses | 1.8e-12 | CERTO |
| A3c | Transferências internas (mov_bens etc.) somam zero: sem objetivo/compra/venda no plano | soma de mov_bens | 502 meses | 0.0e+0 | CERTO |
| A4 | Conservação do dinheiro semana a semana: cofre_i = cofre_{i-1}·GW + Σin − Σout | recálculo independente de 5219 semanas | 2177 semanas | 1.2e-10 | CERTO — pior semana 3129 |
| A4b | Reserva nunca negativa (sem dívida de caixa, sem juros de 4%) | mínimo do cofre | 2177 semanas | 0.0e+0 | CERTO — mín=0,00 |
| B1 | Série da participação (motor) = −10% a.a. composto mensal por 30 meses, depois queda a 0 | recálculo mês a mês | 501 meses (mi 0..500) | 0.0e+0 | CERTO — pior mês -1 |
| B2 | fim.part e fim.det.parts[0] = esperado, todos os meses do extrato | comparação mês a mês | 502 meses | 0.0e+0 | CERTO |
| B3 | Participação jamais negativa (queda de −100% e valor pontual maior que o saldo) | varredura | 502 meses | 0.0e+0 | CERTO |
| B4 | Evento "Desvalorização" = valor da participação logo antes do fechamento (250.000·0,9^2,5) | comparação com texto do evento (arredondado ao real) | 1 evento | 0,37 | CERTO — texto: − R$ 192.108 · O restaurante fecha e a parte deixa de valer |
| B5 | Valores do cenário: mês12=225.000; mês29≈193.800; mês30=0 | comparação direta | 3 pontos | 5.8e-11 | CERTO — mês 29 do cenário é 193.800 arredondado; exato 193.802,51 |
| B6 | Stress: pontual de −R$ 400.000 (> saldo) deve limitar a zero, nunca negativo | rodada alternativa no motor; esperado = série B1 | 501 meses | 0.0e+0 | CERTO |
| B7 | Stress venda: série até a venda = ritmo geométrico até o preço (premissa de desenho "alvo") | rodada alternativa; recálculo | 25 meses | 2.9e-11 | CERTO |
| B8 | Stress venda: custos 5% (7.500) saem como out_vendap_0 e a participação sai por 150.000 (mov_bens = −preço) | fluxo do mês da venda | mi 24 | 0.0e+0 | CERTO — out_vendap_0=7500 mov_bens=-150000 |
| B9 | Stress venda: participação = 0 depois da venda e valor retirado = série(23) | extrato | mi 24, 25 | 0.0e+0 | CERTO — part24=0 |
| C1a | Saldo devedor mês a mês — Consignado (Price, taxa dedu­zida da parcela, escalado ao saldo informado) | tabela de amortização recalculada | 361 meses (mi 0..360) | 0.0e+0 | CERTO — sem a escala (contrato puro) o erro seria 0,03 (efeito do arredondamento de 72412 vs 72.412,03) |
| C1b | Saldo devedor mês a mês — Cartão parcelado (Price, taxa dedu­zida da parcela, escalado ao saldo informado) | tabela de amortização recalculada | 361 meses (mi 0..360) | 0.0e+0 | CERTO — sem a escala (contrato puro) o erro seria 0,44 (efeito do arredondamento de 4776 vs 4.776,44) |
| C2a | Consignado: saldo hoje do plano (72.412) = saldo recalculado (taxa deduzida da parcela 2.337) | tabela Price | 1 ponto | 0,03 | CERTO — recalculado 72.412,03; a 1,95% exato daria 72.409,90 (parcela 2.336,6x) |
| C2b | Consignado: taxa deduzida da parcela de 2.337 ≈ 1,95% a.m. informada | bissecção | 1 ponto | 0,00 | CERTO — diferença em p.p. a.m. |
| C2c | Cartão: taxa implícita (parcela 780, 6.500 em 10x) ≈ 3,46% a.m. do cenário | bissecção | 1 ponto | 0,00 | CERTO — taxa 3.4602% |
| C2d | Cartão: saldo hoje do plano (4.776) = recalculado | tabela Price | 1 ponto | 0,44 | CERTO — recalculado 4.776,44 |
| C3a | Saldo do crédito novo (SAC 60.000, 36x, 2,1% a.m.) mês a mês | tabela SAC recalculada | 502 meses | 0.0e+0 | CERTO — pior mês -1 |
| C3b | Linha de parcelas lançada pelo consultor = parcela SAC do contrato (36 degraus) | comparação com 2 casas | 36 parcelas | 0,00 | CERTO — tolerância 0,005 (arredondamento a centavos) |
| C3c | Parcela 1 = 60.000/36 + 60.000·2,1% = 2.926,67; última = 1.701,67 | fórmula SAC | 2 pontos | 0,00 | CERTO |
| C3d | Juros do crédito = Σparcelas − principal = 23.310,00 | soma da tabela | 36 parcelas | 1.5e-11 | CERTO — juros 23.310,00; total pago 83.310,00 |
| C5a | Identidade do patrimônio líquido (ΔPL = rendimento + valorização + entradas − consumo − JUROS do contrato): meses 1–20 (antes de parar de trabalhar) | recomposição mês a mês | 19 meses (1–20 exceto o 7, que é o C6b) | 0,07 | CERTO — mês de maior resíduo: 4 = -0,07; no mês 7 o resíduo é 779,93 (a 7ª parcela do cartão não foi paga no caixa e o saldo zerou) |
| C5b | Mesma identidade nos meses 21–54 (depois de parar de trabalhar): resíduo = parcelas de contrato não pagas no caixa (achado; o PL só erra se os R$ 14.000 NÃO incluírem as dívidas) | recomposição mês a mês | 34 meses | 2.391,60 | ACHADO — maior resíduo mensal; acumulado mi 21..54 = 26.715,73 |
| C6a | Nº de parcelas do consignado pagas no caixa = nº de parcelas que restam no contrato (48) | contagem | consignado | 1,00 | ERRADO — pagas 47 x contrato 48 |
| C6b | Nº de parcelas do cartão pagas no caixa = nº que restam (7) | contagem | cartão | 1,00 | ERRADO — pagas 6 x contrato 7 |
| C6c | Nº de parcelas do crédito novo pagas = 36 | contagem | crédito | 0.0e+0 | CERTO — pagas 36 x 36 |
| C7a | Parcela que sai no fluxo = parcela do contrato (consig 2.337 [contrato 2.336,xx], cartão 780, crédito SAC) | comparação com a tabela recalculada | mi 1..20 exceto 7 (a 7ª do cartão: C6b) | 0,00 | CERTO — pior mês 19 (a parcela do plano é 2.337 e a do contrato recalculado difere em centavos) |
| C7b | Parcela que sai no fluxo = parcela do contrato, meses 21..54 (depois de parar de trabalhar) | comparação com a tabela recalculada | 34 meses | 2.391,60 | ERRADO — maior diferença 2.391,60 em mi 48: as linhas das parcelas são reduzidas pelo "padrão de vida" (ver 4/G) |
| C8a | Todas as dívidas quitadas em zero no fim do horizonte | soma |divs| | mi 501 | 0.0e+0 | CERTO |
| C8ba | Juros = Σparcelas − principal (Consignado) | soma da tabela | 48 parcelas | 4.4e-11 | CERTO |
| C8bb | Juros = Σparcelas − principal (Cartão parcelado) | soma da tabela | 7 parcelas | 6.1e-12 | CERTO |
| C10 | Crédito novo é neutro no PL na liberação: ΔPL(18) = ΔPL calculado sem o 60.000 (entrada e dívida se anulam) | recomposição | mi 18 | 6.8e-10 | CERTO — ΔPL=1.734,77 esperado 1.734,77 |
| C11p | Stress amortização antecipada de 20.000 no mês 12 (modo prazo): saldo mês a mês | rodada alternativa; tabela com adiantamento recalculada | 361 meses | 0.0e+0 | CERTO — pior mês -1; chaves de saída extra no mês 12: NENHUMA — o adiantamento reduz a dívida mas não tira dinheiro do caixa |
| C11p | Stress amortização antecipada de 20.000 no mês 12 (modo parcela): saldo mês a mês | rodada alternativa; tabela com adiantamento recalculada | 361 meses | 0.0e+0 | CERTO — pior mês -1; chaves de saída extra no mês 12: NENHUMA — o adiantamento reduz a dívida mas não tira dinheiro do caixa |
| D0 | Plano real não tem objetivos: nenhuma caixinha, obj[] vazio em todos os meses, mov_obj_* ausente | varredura | 502 meses | 0.0e+0 | CERTO |
| D1a1 | Stress: saldo semanal da caixinha "Casa na praia" (agressivo, 60m) = saldo·(1+taxa devida)^(7/30,4375) + aporte, taxa conservadora nos últimos 24m | recursão semanal independente usando mov_obj_* observados | todas as semanas do plano | 0.0e+0 | CERTO — pior semana -1 |
| D1a2 | Stress: saldo semanal da caixinha "Carro" (moderado, 30m) = saldo·(1+taxa devida)^(7/30,4375) + aporte, taxa conservadora nos últimos 24m | recursão semanal independente usando mov_obj_* observados | todas as semanas do plano | 0.0e+0 | CERTO — pior semana -1 |
| D1a3 | Stress: saldo semanal da caixinha "Viagem" (agressivo, 15m) = saldo·(1+taxa devida)^(7/30,4375) + aporte, taxa conservadora nos últimos 24m | recursão semanal independente usando mov_obj_* observados | todas as semanas do plano | 0.0e+0 | CERTO — pior semana -1 |
| D1a4 | Stress: saldo semanal da caixinha "Reserva cheia" (moderado, 40m) = saldo·(1+taxa devida)^(7/30,4375) + aporte, taxa conservadora nos últimos 24m | recursão semanal independente usando mov_obj_* observados | todas as semanas do plano | 0.0e+0 | CERTO — pior semana -1 |
| D2a1 | Stress: taxaPorMes de "Casa na praia" = perfil até o mês (meses−24) e conservador depois | comparação mês a mês | 61 meses | 0.0e+0 | CERTO — troca de taxa no mês 36 (esperado 36) |
| D2a2 | Stress: taxaPorMes de "Carro" = perfil até o mês (meses−24) e conservador depois | comparação mês a mês | 31 meses | 0.0e+0 | CERTO — troca de taxa no mês 6 (esperado 6) |
| D2a3 | Stress: taxaPorMes de "Viagem" = perfil até o mês (meses−24) e conservador depois | comparação mês a mês | 16 meses | 0.0e+0 | CERTO — troca de taxa no mês nenhuma (já nasce conservador) (esperado nenhuma) |
| D2a4 | Stress: taxaPorMes de "Reserva cheia" = perfil até o mês (meses−24) e conservador depois | comparação mês a mês | 41 meses | 0.0e+0 | CERTO — troca de taxa no mês 16 (esperado 16) |
| D3a1 | Stress: na data de "Casa na praia" o gasto é o valor do objetivo e a caixinha zera, devolvendo o saldo | comparação | 1 semana | 0.0e+0 | CERTO |
| D3a2 | Stress: na data de "Carro" o gasto é o valor do objetivo e a caixinha zera, devolvendo o saldo | comparação | 1 semana | 0.0e+0 | CERTO |
| D3a3 | Stress: na data de "Viagem" o gasto é o valor do objetivo e a caixinha zera, devolvendo o saldo | comparação | 1 semana | 0.0e+0 | CERTO |
| D3a4 | Stress: na data de "Reserva cheia" o gasto é o valor do objetivo e a caixinha zera, devolvendo o saldo | comparação | 1 semana | 0.0e+0 | CERTO |
| E1 | R_M do extrato = 0,4% a.m. (perfil conservador do plano) | comparação | 1 | 0.0e+0 | CERTO |
| E2 | Taxa efetiva mensal média = 0,4% (mês médio de 30,4375 dias) | conta | 1 | 4.4e-16 | CERTO |
| E3 | Reconciliação mensal de um passo: fin(m) ≈ fin(m−1)·GW^semanas + Σin − Σout (fluxos ao início do mês; diferença = momento dentro do mês) | recálculo mensal independente | 502 meses | 4,85 | CERTO — pior mês 19. Resíduo = rendimento das saídas do dia 10 (semana 2) e do crédito; tolerância R$ 25 |
| F0 | Mês 0 (ciclo de 05/10 a 04/11 – dias 5 e 10 já passados em 20/10) sem lançamentos | conferência do fluxo | mi 0 | 0.0e+0 | CERTO |
| F1 | Fluxo mês a mês antes de parar de trabalhar (mi 1..20): salário 11.000, aluguel 3.000, 6 linhas de despesa, parcelas, crédito (mi 18) | comparação chave a chave com o plano | 20 meses × todas as linhas | 0.0e+0 | CERTO — pior: mi 0  |
| F2 | Déficit mensal: 1.617 (mi 1–6, com cartão) e 837 (mi 7+) | saídas − entradas | 6 meses | 0.0e+0 | CERTO |
| F3 | Salário recebido nos meses 1..20 e em nenhum depois (60 anos = jul/2028 = mi 21) | conjunto de meses | 20 meses | 0.0e+0 | CERTO — meses 1..20 |
| F4 | INSS 5.200 a partir do mês 81 (65 anos: jul/2033) até o fim | conjunto de meses | 421 meses | 0.0e+0 | CERTO — meses 81..501 |
| F4b | mi 81 é o primeiro mês com idade >= 65 | idade = hoje + mi/12 | 2 pontos | 0.0e+0 | CERTO — idadeHoje(20/10/26)=58.3025 => mi 81 = jul/2033 (65 anos completos em 01/07/2033) |
| F5 | Dezembro sem 13º/bônus: saídas e entradas iguais às do mês anterior (antes da liberdade) | comparação | dez: 2,14 | 0.0e+0 | CERTO — o plano não lança 13º (dado faltando do cenário) |
| F6 | out_rendas (mi 21) = 0: contratação de rendas inexistente (annuityCost 0) | valor da chave | mi 21 | 0.0e+0 | CERTO |
| G1 | Liberdade financeira no mês 21 (jul/2028, 60 anos) – forçada pela idade-alvo | conferência | 1 | 0,00 | CERTO — idade 60.005 forced=true |
| G2 | ff.maxGap = 14.000 − 3.000 (aluguel) = 11.000 (INSS só pesa depois) | conta | 1 | 0.0e+0 | CERTO |
| G3 | ff.sustentavel = fin·0,4% + (14.000 − maxGap) | conta | 1 | 0.0e+0 | CERTO |
| G4 | Mês em que o financeiro zera (regra do motor, simulação mensal independente) = o do motor (±1 mês de arredondamento semanal) | simulação independente do caixa | 1 | 0.0e+0 | CERTO — sim 154 x motor 154 |
| G5 | Se o financeiro zera, "ruina" deveria disparar (reserva negativa) — o motor comprime o consumo e não dispara | inspeção: ruina e cheque | todo o horizonte | 1,00 | ACHADO — ruina=null; desejo não atendido 1.661.382,17 => classificado como COMPORTAMENTO POR DESENHO com distorção relevante (ver laudo) |
| G6 | Pós-liberdade (mi 21..153): cada linha de despesa = nominal × (14.000 ÷ Σ linhas nominais), com o caixa suficiente [regra de desenho P-FF] | recálculo da regra de desenho, chave a chave | 133 meses × todas as linhas | 0.0e+0 | CERTO — pior mi 0 ; escala vai de 0.7912 a 1.1200 |
| G7 | Mês em que o caixa acaba: saque = o que sobra no cofre (rendido uma semana) e consumo = renda (INSS+aluguel) + saque | recálculo | mi 154 | 1.8e-12 | CERTO — esperado 11.417,83; motor 11.417,83 |
| G8 | Depois de zerar, saídas = entradas (8.200) até o fim do horizonte | varredura | 347 meses | 1.8e-12 | CERTO |
| C9 | Marcos de quitação/crédito/liberdade/INSS/fechamento caem nos meses certos (cartão 7, crédito 18, liberdade 21, fechamento 30, consignado 48, INSS 81) | comparação com o mês em que cada saldo/fluxo muda | 6 eventos | 0.0e+0 | CERTO |
| J1 | Alegação do consultor sobre IOF financiado (consignado 3.025; saldo 74.185; cartão 119; saldo 4.841) confere com o recálculo | ponto fixo F = crédito + IOF(F) com a parcela fixa | 2 dívidas | 0,47 | CERTO — tolerância R$ 30 (arredondamentos da alegação) |
| J2 | Sem o crédito, o financeiro zera no mês 138 (alegação do consultor; simulação independente 138) | rodada alternativa | 1 | 0.0e+0 | CERTO — motor 138 / sim 138 |
| J3 | Sem idade-alvo, o motor acha liberdade aos ~67,9 anos (alegação do consultor) | rodada alternativa | 1 | 0,02 | CERTO |
| D4 | Stress: a caixinha que já cobre a meta deixa de receber aporte (saldo na data entre a meta e a meta + 1 aporte, e aportes cessam antes da data) | inspeção dos mov_obj_* | 6 aportes | 0.0e+0 | CERTO — último aporte no mês 29; saldo 15.130,90 |

As linhas de stress (B6–B9, C11, D1–D4, J1–J3) rodam variantes do plano pelo motor e comparam com o recálculo independente; D0 documenta que o plano real não tem caixinha.

## 4. Contas erradas encontradas

### 4.1 As parcelas do consignado e do cartão terminam um mês cedo no caixa (tradução do consultor, induzida por semântica ambígua do campo)
- **Sintoma**: consignado com 47 parcelas pagas no caixa contra 48 restantes; cartão com 6 contra 7. A dívida zera (consignado no mi 48, cartão no mi 7) sem que a última parcela tenha saído do caixa: o saldo de R$ 2.292,29 (consignado, mi 47) e o de R$ 753,84 (cartão, mi 6) somem sem pagamento.
- **Mês(es)**: mi 7 (cartão) e mi 48 (consignado).
- **Esperado × obtido**: mi 7, saída esperada 15.617,00 (12.500 + 2.337 + 780); motor 14.837,00. Mi 48, faltam R$ 2.337 da parcela do consignado (contrato 2.336,6x pela taxa derivada).
- **Impacto**: no patrimônio, +R$ 779,93 no mi 7 (resíduo da identidade do ΔPL), que persiste e rende até o dinheiro acabar. O R$ 2.337 do mi 48 não altera o patrimônio se os R$ 14.000 incluírem as dívidas (o total do mês é fixado em 14.000), mas altera se não incluírem (5.2).
- **Origem**: tradução do consultor, no campo `steps` das linhas `divconsig` (degrau `{from:48, value:0}`) e `divcartao` (`{from:7, value:0}`). Causa-raiz: o motor conta `restantes` "contando a deste mês" (`restantesContratadas`, linha ~1608 do HTML; `saldoDevedorEm`, linha ~1843), mas o mês 0 não gera lançamento (o ciclo de hoje já fechou os dias 5 e 10), então as parcelas restantes caem nos meses 1..48 e 1..7, não 0..47 e 0..6. É a dificuldade nº 1 do consultor, classificada por ele como "distorção pequena".
- **Sugestão (não aplicada)**: terminar as linhas no mi 49 e no mi 8, ou gerar a linha de parcela a partir do contrato (mi 1 a `restantes`); documentar em VARIAVEIS.md que `restantes` não inclui a parcela do ciclo já encerrado hoje.

### 4.2 A parcela da dívida que sai do caixa não é a do contrato depois de parar de trabalhar (regra do motor)
- **Sintoma**: depois da liberdade financeira (mi 21), todas as linhas de despesa, **inclusive as parcelas das dívidas**, são multiplicadas por um mesmo fator `m.scale` = renda disponível ÷ Σ das linhas. Mi 21: consignado 1.849 (contrato 2.337); crédito 2.260 (contrato 2.856,67). Mi 22: 1.853 e 2.237. O fator vai de 0,7912 (mi 21) a 1,12 (mi 55 em diante, sem dívidas).
- **Valores**: parcelas de contrato não pagas no caixa nos meses 21–54: R$ 24.378,87 (consignado R$ 11.841,74; crédito R$ 12.537,14), mais os R$ 2.337 da parcela 48 ausente (4.1): R$ 26.715,76 no total. Maior diferença mensal: R$ 1.084,21 (mi 21).
- **Mas o saldo devedor continua pelo contrato**: `saldoDevedorEm` (linha ~1843) e `dividaEm` (dentro de `simula`, linha ~1892) não olham o caixa; a dívida cai como se a parcela inteira tivesse sido paga.
- **Impacto no patrimônio**: depende da leitura de "R$ 14.000". Se for o **total** (dívidas incluídas), o total de saída está certo (14.000) e o patrimônio também; o erro é de alocação: a linha "Parcela" aparece menor que a do contrato e as de consumo maiores. Se os R$ 14.000 forem **fora** das dívidas, o patrimônio fica superestimado em até R$ 26.715,76 e o dinheiro acaba antes (mi 122 sem crédito e 118 com crédito, ver 5.2).
- **Origem**: motor. Em `simula`: `livingAt` (linha ~1896, soma todas as despesas, parcelas incluídas), o cálculo do fator `m.scale` (linhas ~2114–2116) e `o.v * m.scale` no lançamento das linhas (linha ~1933). Regra violada: a parcela contratual é obrigação fixa, não compressível pelo padrão de vida.
- **Sugestão (não aplicada)**: tirar da escala as linhas ligadas a dívida (`linha` de `patrimonio.dividas`, `creditos` e `bens`) e deduzir o total contratado do alvo antes de calcular o fator; ou tratar os R$ 14.000 como "fora das dívidas".

### 4.3 Nenhuma conta errada em participações, caixinhas, rendimento ou saldos devedores
Para quebrar o motor tentei: salto pontual de −R$ 400.000 (maior que o saldo), venda com custo e preço diferente do valor corrente, 4 caixinhas de 15 a 60 meses (acima e abaixo do corte dos 24 meses), amortização antecipada nos dois modos, IOF financiado (recalculado: consignado IOF R$ 3.025,14, taxa 1,833%, saldo R$ 74.184,53; cartão IOF R$ 118,80, 3,103%, R$ 4.840,86; batem com os R$ 3.025, 74.185, 119 e 4.841 do consultor), variante sem crédito, variante sem idade de aposentadoria, ciclos de 4 e 5 semanas e a identidade de conservação em 2.177 semanas. Nada divergiu.

### 4.4 Julgamento das "estranhezas" do consultor (dificuldades-05.md)
| Item do consultor | Julgamento | Evidência |
|---|---|---|
| 1. 24 pagas e 48 restantes não fecham com a data | Erro de tradução + campo confuso (4.1); não é "pequena" | 47 x 48 e 6 x 7 parcelas no caixa; saldo some sem pagamento |
| 2. IOF somado por padrão | Desenho, corretamente contornado com `iof: isento` | Recálculo do IOF financiado confere (3.025,14; saldo 74.184,53) |
| 3. Saldo de hoje calculado pelo motor | Correto; dado que faltava do cliente | 72.412,03 e 4.776,44; taxas 1,9504% e 3,4602% |
| 4. Sem 13º e sem bruto | Dado faltando do cliente; sem 13º o déficit antes dos 60 fica superestimado | Dezembro idêntico aos demais meses |
| 5. Idade 60 força a liberdade | Desenho, correto (`forced = true`) | mi 21, sustentável 6.518 |
| 6. Ruína ausente, consumo cortado | Desenho com distorção grave (5.1); não é erro aritmético | `ruina = null`; R$ 1.661.382 de renda desejada sem cobertura |
| 7. Retirada engole e encolhe as parcelas | **Erro de motor** na parte das parcelas (4.2); a escala do consumo em si é desenho | R$ 24.378,87 não pagos; o saldo cai pelo contrato |
| 8. Crédito condicional | Lacuna do produto; lançar incondicional é a única opção | Com crédito mi 154; sem crédito mi 138 |
| 9. Participação com −100% | Correto; equivale ao −400.000 do cliente (testado) | Séries idênticas |
| 10. Dívida do sócio fora | Decisão correta do consultor (o cliente disse "não conto") | Sem efeito no motor |
| 12. `out_fix_undefined` | Problema de formato; no plano final a chave é `crparc` | Fluxo sem chave indefinida |

## 5. Comportamentos por desenho que o dono do produto deveria conhecer

### 5.1 Quando o dinheiro acaba, o motor corta o consumo e não aponta ruína (o mais relevante)
- Pós-liberdade, `w = min(retirada necessária, cofre)` e o consumo é a renda disponível + `w` (linha ~2112 do HTML). Quando o cofre zera, o consumo cai para as rendas (INSS + aluguel = 8.200), a reserva nunca fica negativa, `ruina` fica `null`, `cheque` = 0, os juros de 4% a.m. nunca aparecem, e a Liberdade financeira parece fechar até os 95 anos.
- Números: o financeiro zera no mi 154 (ago/2039, 71,1 anos). No mi 153 o consumo é 14.000; no 154, 11.417,83; do 155 em diante, 8.200 (−41%) por 287 meses até os 95 anos. **Renda desejada sem cobertura: R$ 1.661.382,17** (média de R$ 5.788,79 por mês). O patrimônio final são só os bens, R$ 1.540.000.
- A única pista é `ff.forced = true` e `ff.sustentavel = 6.518`.
- É decisão de produto (comentário do motor: "a família para nela, com ou sem dinheiro... o padrão de vida cai"). Para este cliente, que só quer que o dinheiro dure, é o resultado mais enganoso.

### 5.2 O significado de "R$ 14.000 por mês" decide quando o dinheiro acaba
Quatro leituras (simulação mensal independente; as leituras (a) e (b) foram confirmadas contra o motor, mi 154 e 138):

| Leitura | Dinheiro acaba | Idade |
|---|---|---|
| (a) 14.000 no total, dívidas incluídas, com crédito (motor) | mi 154 (ago/2039) | 71,1 anos |
| (b) idem, sem o crédito | mi 138 | 69,8 anos |
| (c) 14.000 mais as parcelas, sem crédito (leitura do cenário) | mi 122 | 68,5 anos |
| (d) idem, com crédito | mi 118 | 68,1 anos |

O cenário estima o mês 123 (68,5 anos): é a leitura (c), a um mês de diferença. O motor lê (a). A diferença de 32 meses entre o que o cenário espera e o que o motor mostra vem da leitura, e depois do mi 154 o motor ainda esconde a ruína.

### 5.3 Escala do consumo depois da liberdade
Todas as linhas de consumo passam a somar o desejo: no mi 21 as linhas caem a 79% (casa 2.532 em vez de 3.200; alimentação 1.899 em vez de 2.400) para acomodar as parcelas; do mi 55 em diante (sem dívidas) ficam a 112% (casa 3.584; alimentação 2.688). O cliente disse que gasta 12.500 e quer 14.000; o motor entrega a diferença como aumento proporcional de todas as linhas.

### 5.4 Outras convenções
- **Amortização antecipada: sem saída de caixa e com um mês de atraso no saldo**. No stress (R$ 20.000 com `em: 12` no consignado) nenhuma saída de caixa aparece, a menos que haja um compromisso marcado à parte, e o saldo só cai no mês 13 (mi 12: 60.045; mi 13: 38.879, contra 58.879 sem a amortização), porque o saldo do mês mi é o anterior à parcela do mês. É a mesma convenção de `restantes` que causa o item 4.1. Não afeta este cenário (sem amortizações); pode afetar outros.
- **A troca de taxa das caixinhas entra na segunda semana do mês** (o crescimento da semana do salário usa o índice do mês anterior): efeito de R$ 32,63 em R$ 96.438,62 (Casa na praia) e R$ 3,81 (Carro). O dedicado de hoje rende já na primeira semana.
- **Bens sem valorização e valores em termos reais**: casa, sala e carro ficam em R$ 1.540.000 o tempo todo; rendimento real de 4,907% a.a.; as dívidas usam as taxas nominais do contrato (por exemplo 2,1% a.m. do crédito) contra fluxos reais. É premissa do produto, não aritmética.
- **Saldo informado manda**: o motor escala a tabela ao saldo digitado (72.412 contra 72.412,03: efeito de R$ 0,03).

## 6. Limites desta auditoria
- **Caixinhas**: o plano real não tem objetivos; a conferência é por 4 objetivos sintéticos no mesmo motor, não por dados do cliente. Não exercitei objetivo financiado por venda, bem comprado, compra por consórcio ou financiamento.
- **Dívidas**: o plano não tem bem financiado, consórcio, seguro, tarifa, IOF a financiar nem venda de bem com saldo; conferi só amortização antecipada e IOF financiado, por variante.
- **Calendário**: o dia do mês em que cai cada lançamento (5 e 10) é premissa de ciclo; não validei feriado nem dia útil.
- **Impostos, inflação, reajuste do INSS e rendimento nominal** ficam fora do motor para este plano (salaryGrowth 0, tax 0); não os auditei.
- **Cliente real**: não verifiquei se Marcos deve R$ 400.000 ao sócio ou o contrário; a decisão de não lançar é do consultor.
- **Independência**: usei `harness.js` (que chama o motor) apenas para ler as semanas observadas e rodar variantes; nenhuma função de cálculo (`trajetoriaDoBem`, `saldoDevedorEm`, `taxaDoObjetivo` etc.) produziu valor esperado.
