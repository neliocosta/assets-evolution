# Laudo matemático — Cenário 09 (Hélio e Vera Barros)

Código reexecutável: `node ux/auditoria/laudos/auditor-09.js` (imprime a tabela de conferências, 47 aprovadas e 5 reprovadas: C7, F2, H1, H2, H3, e as séries citadas abaixo).
Método: o auditor lê só o **plano** (`plano-09.json`) e o **extrato** (observado: mensal e, para a conferência semanal, as 5.219 semanas que o motor devolve). O esperado vem de código próprio (tabela SAC, série da participação, recursão semanal das caixinhas, calendário do dia 5, escala do padrão de vida). Nenhuma função do motor foi usada para produzir o esperado. O motor roda apenas para gerar o observado, inclusive em um teste de estresse fora do cliente.

## 1. Veredito

**A contabilidade, as participações, as caixinhas e os saldos devedores estão matematicamente certos ao centavo, mas há três contas erradas que importam: o saque de R$ 409.696,51 do fundo de pensão desaparece no mês 6 (consumido como "renda do mês"), o adiantamento de R$ 100.000 do financiamento sai do caixa multiplicado por 1,4576 (R$ 151.401,58 em vez de R$ 103.867,61) e o salário e o 13º da Vera de dezembro de 2028 (R$ 19.000) são perdidos.**

| Frente | Semáforo | Resumo |
|---|---|---|
| Participações | **CERTO** | série, venda, líquido, destino e zeragem: erro 0,00 em 455 meses |
| Caixinhas | **CERTO** | taxa certa em todas as semanas, troca de taxa no mês certo; ressalva de 1 semana na troca (R$ 0 neste cliente, R$ 36 no estresse) |
| Contabilidade geral | **CERTO** | conservação do dinheiro e identidades com erro 0,00 em 1.973 semanas; nada criado nem perdido (o "saque desaparece" é gasto lançado, não vazamento contábil) |
| Dívidas | **ERRADO** (caixa) / certo (saldos) | saldos e tabelas SAC exatos; porém o adiantamento sai R$ 47.533,97 acima do contrato, o caixa paga 135 parcelas (contrato: 136) e o saldo cai um mês depois do caixa |
| Fluxo | **ERRADO** (1 erro) | tudo bate com o plano, exceto o mês 26 (dez/2028): faltam salário e 13º da Vera (R$ 19.000) |
| Liberdade / ruína | **ERRADO** (saque) + comportamento por desenho relevante | ruína corretamente nula e liberdade na semana certa; mas o saque do fundo vira gasto e o padrão de vida sobe até a renda (financeiro final 28% menor só pelos dois vazamentos; seção 5) |

## 2. Por que a matemática está certa (por frente)

**Participações (clínica, 35%).** Regra: com preço de venda informado, o valor sobe em ritmo geométrico constante até o preço: `V(m) = 900.000 · (1.100.000/900.000)^(m/13)`.
- Mês 6: esperado 987.337,58; motor 987.337,58; erro 0,00 (o cenário diz 987.338).
- Mês 12: 1.083.150,55 (valor retirado das participações na venda); mês 13: preço 1.100.000. O ganho de R$ 16.849,45 do último mês entra na venda (não há salto).
- Venda no mês 13 (semana 3300, dia 5 de nov/2027): preço 1.100.000, custos 22.000 (2%) + 25.000 = 47.000, líquido 1.053.000. Fluxo do mês: `mov_bens −1.100.000`, `out_vendap_0 47.000`, `mov_obj_praia +200.000`; o resto (853.000) fica no caixa. Esperado = observado, erro 0,00.
- Depois da venda a participação é 0,00 em todos os meses até o fim (nunca negativa). O plano não tem renda ligada à clínica.

**Dívidas, saldos.**
- Apartamento: SAC 480.000/240, amortização 2.000, 104 pagas, saldo 272.000. Saldo do motor = `480.000 − 2.000·(104+mi)` até o adiantamento; após o adiantamento de 100.000 (modo parcela): 144.000 em 122 parcelas, amortização 1.180,33, 1ª parcela 2.273,56 (motor 2.273,56). Erro 0,00 nos 361 meses de `dividas[0]` e nos 455 de `fim.div`/`det.divs`. Quitação: zero no mês 136, nº 240 paga no mês 136.
- Taxa: a parcela informada 4.065 manda e implica 0,75919% a.m. (9,5005% a.a.); a taxa informada de 9,5% a.a. daria 0,75915% (parcela 4.064,90). Diferença R$ 0,10 na parcela: premissa de desenho, sem efeito material.
- Praia: 400.000/180, SAC, 9,5% a.a., sem IOF. 1ª parcela no mês 36: 5.258,84 (cenário 5.259); amortização 2.222,22; última 2.239,09; quitação no mês 215. Juros pagos = 274.813,54 = Σ parcelas − 400.000. Erro 0,00 nos 455 meses.
- Fundo de pensão (dívida zero, mas é o item de caixa): saldo `1.600.000·1,004^mi` até o mês 5; concessão no mês 6; saque 25% = 409.696,51 (cenário 409.697); resto 1.229.089,54; renda 8.703,82 por exatamente 240 meses (mi 6 a 245).

**Caixinhas.** Regra de desenho conferida: últimos 24 meses conservadores; antes, o perfil; objetivo com menos de 24 meses já nasce conservador. `PROFILES` = 0,4/0,5/0,6% a.m. = plano.
- Recursão semanal `saldo(i) = saldo(i−1)·(1+taxa)^(7/30,4375) + aportes(i)` com a taxa pela regra, contra as 1.973 semanas do motor: erro 0,00 nos três objetivos.
- Taxa por mês: Europa 0,4% (12 meses), Carro 0,4% (24 meses, a janela começa no mês 0), Praia 0,5% nos meses 0 a 11 e 0,4% dos meses 12 a 36. O dinheiro da praia só chega no mês 13 (venda), portanto **nunca rendeu moderado**: 200.000 entram em 05/11/2027 e rendem 100 semanas a 0,4%. Isso responde à pergunta central: nenhuma caixinha rendeu agressivo/moderado indevidamente, nenhuma rendeu conservador a mais.
- Na data: Europa saca 79.957,49 (paga 80.000 com o caixa); Carro saca 82.438,34, 70.000 viram bem e 12.438,34 voltam ao caixa; Praia saca 219.230,93, 200.000 viram entrada e 19.230,93 voltam ao caixa. Aporte necessário zero nos três (o motor também dá 0). Aporte automático para quando a caixinha basta: não se aplica aqui (planned = 0; não há aporte na fase de liberdade).
- Impacto da regra, medido: 200.000 por 100 semanas a 0,5% renderiam 224.308,11; a regra (0,4%) rende 219.230,93 (a conta que o cenário descreve, 219.233, é a mesma menos R$ 1,80 de calendário semanal).

**Contabilidade geral.**
- Σ de todas as movimentações = Σ entradas − Σ saídas em cada semana (transferências somam zero): erro 0,00.
- `fin(i) = fin(i−1) + rendimento + entradas − saídas − transferências para bens`, com o rendimento recalculado: erro 0,00 em 1.972 semanas.
- `fin = cofre + caixinhas` em 455 meses; `bens`, `part`, `prev`, `div` conferidos item a item (C1, C2, C8, C10, C11, B2); sem NaN, sem valor negativo. Patrimônio (financeiro+bens+participações+previdência−dívidas): mi0 4.372.828,41; mi12 2.931.631,40; mi36 3.069.799,02; mi246 5.967.971,96.

**Rendimento do financeiro (convenção).** Cada semana: `cofre = cofre·(1+0,4%)^(7/30,4375)` sobre o saldo de abertura positivo; os fluxos da semana entram **depois** do rendimento, então o dinheiro não rende na semana em que chega. Exceção: a alocação inicial das caixinhas (semana de hoje) acontece antes do rendimento. Erro 0,00. A taxa efetiva mensal equivalente é exatamente 0,4%.

## 3. Conferências realizadas

| # | O que foi conferido | Método | Amostra | Erro máx. | Resultado |
|---|---|---|---|---|---|
| 0 | extrato salvo = extrato regerado | diferença de `fim.fin` | 455 meses | 0,00 | OK |
| 1 | W0 e mês do plano (ciclo do dia 5) por semana | calendário próprio | 1.979 semanas | 0 divergências | OK |
| A1 | Σ mov_* = Σ in − Σ out | por semana | 1.973 semanas | 0,00 | OK |
| A2 | sem NaN, sem negativos | varredura | 1.973 semanas | 0 | OK |
| A3 | Δfin = rendimento + entradas − saídas − transferências | recursão semanal | 1.972 semanas | 0,00 | OK |
| A4 | fin = cofre + caixinhas | soma | 455 meses | 0,00 | OK |
| E1 | rendimento do caixa (convenção acima) | recursão semanal | 1.973 semanas | 0,00 | OK |
| E2 | taxa semanal ↔ 0,4% a.m. | fórmula | 1 | 0,00 | OK |
| D1a-D3b | saldo das 3 caixinhas, taxa pela regra (defasada e estrita) | recursão semanal | 3 × 1.973 | 0,00 | OK |
| D4/D5 | `taxaPorMes` e `PROFILES` = regra | mês a mês | 3 objetivos | 0,00 | OK |
| D6/D7 | mês e valor do saque; consumo/bem/devolução | fluxos do mês da data | 3 objetivos | 0,00 | OK |
| D8 | aporte necessário = 0 | saldo na data | 3 objetivos | 0,00 | OK |
| D9 | estresse: troca de taxa com 150.000 na praia | motor × recursão própria | 36 meses | 0,00 (defasada) / 40,02 (estrita) | OK (ver 5.7) |
| B1-B7 | participação: série, det.parts, venda, fluxo, destino, zeragem | fórmula geométrica | 14 + 455 meses | 0,00 | OK |
| C1/C2 | saldo devedor do apartamento | tabela SAC própria | 361 + 455 meses | 0,00 | OK |
| C3/C4/C6 | saldo 144.000, parcela 2.273,56, quitação, exceção do mês 13 | tabela SAC | 3 valores | 0,00 | OK |
| C5 | 14 degraus da linha da parcela | tabela SAC | 14 | 0,00 | OK |
| C7 | nº de parcelas que saem do caixa = 136 | contagem | 455 meses | 1 parcela | **FALHA** (4.1) |
| C8/C9/C10 | financiamento da praia, juros, bens | tabela SAC | 455 meses | 0,00 | OK |
| C11-C14 | fundo: saldo, saque, renda (Previc 6,08%), 240 meses | fórmula | 455 meses | 0,00 | OK |
| F1 | entradas do mês | recálculo | 454 meses | 0,00 | OK (com parada no mês 26) |
| F2 | salário e 13º de dez/2028 | calendário do cliente | mês 26 | 19.000,00 | **FALHA** (4.3) |
| F3 | saídas = linha × escala | escala reescrita | 3.171 valores | 0,00 | OK (regra de desenho) |
| F4 | mês 0 (toco de 2 semanas) | frações | 1 mês | 0,00 | OK |
| G1-G3 | semana da liberdade, lacuna máxima, ruína nula | recálculo | 3 itens | 0,00 | OK |
| G4 | simulação mensal própria reproduz o financeiro (valida o contrafactual) | recursão mensal | 455 meses | até 0,86% do saldo | OK (tolerância 1%) |
| H1 | saque do fundo entra no financeiro (leitura do cenário) | fluxo do mês 6 | 1 mês | 409.696,51 | **FALHA** (4.2) |
| H2 | adiantamento sai pelo valor do contrato | fluxo do mês 13 | 1 mês | 47.533,97 | **FALHA** (4.1) |
| H3 | dívida cai no mesmo mês em que o adiantamento sai do caixa | fim.div do mês 13 (246.000 x 144.000) | 1 mês | 102.000,00 | **FALHA** (4.1 b) |

## 4. Contas erradas encontradas

### 4.1 Adiantamento do financiamento inflado e linha de caixa fora do calendário do contrato (frente Dívidas)

- **Sintoma.** Mês 13 (nov/2027): saída `out_fix_parc_apto` observada 151.401,58; contrato (parcela 3.867,61 + adiantamento 100.000) 103.867,61. Excesso **R$ 47.533,97** (fator 1,4576 do padrão de vida). A dívida cai só os 100.000: o excesso não amortiza nada. Todos os outros meses mostram a parcela escalada (ex.: 4.817,13 em vez de 4.065 nos meses 1 a 5; 5.867,15 nos meses 7 a 11), mas nesses meses a escala é compensada pelas demais linhas (o total do mês é definido pela escala); no mês 13 não, porque o adiantamento (exceção do mês) não faz parte do "custo de vida" que define a escala.
- **Impacto.** Financeiro −47.533,97 no mês 13, que com o rendimento de 0,4% a.m. vira −49.667,80 no mês 24, −72.863,72 no mês 120 e −265.603,81 no mês 444.
- **Origem: motor.** `doOffset`, `evolucao-patrimonial.html` linha 1933: `add(f, 'out_' + c.group + '_' + c.id, o.v * m.scale)` multiplica todas as ocorrências da linha, inclusive a exceção `exc` (adiantamento); mas `m.scale` (linha 2116) é `renda disponível / custoVida`, e `livingAt` (custoVida) usa `mensalizado`, que não inclui `exc`. Regra violada: um pagamento contratual (parcela e adiantamento) não deveria ser escalado.
- **Correção sugerida.** Excluir de `scale` as linhas de dívida (`linhaPropria`/`linha` ligada a bem) e todo valor de `exc`; ou escalar só o "custo de vida" discricionário e somar as parcelas de contrato depois.
- **Efeitos colaterais da mesma raiz (linha de caixa do contrato).**
  - (a) **135 parcelas no caixa contra 136 do contrato.** O mês 0 é um toco (20/10 a 04/11) e não tem o dia 10; o contrato, porém, numera a parcela nº 105 como "a deste mês" (mês 0). A linha do consultor (`parc_apto`) segue essa numeração: degraus e a exceção estão uma parcela adiantados em relação ao calendário, e a linha zera no mês 136, quando a parcela nº 240 (1.189,29) deveria sair. Faltam R$ 1.189,29 de caixa (sem efeito no financeiro, porque a escala mantém o total).
  - (b) **Adiantamento: caixa no mês 13, saldo da dívida só no mês 14.** `tabelaDaDivida` aplica o adiantamento "depois da parcela k0+em" (nº 118), que no calendário cai no mês 14, enquanto a exceção de caixa está no mês 13. No fim do mês 13 o patrimônio tem o dinheiro fora e a dívida ainda em 246.000 (deveria 144.000): patrimônio **subestimado em R$ 102.000** só nesse mês (2.765.036,95 em vez de 2.867.036,95), com salto espúrio de +117.779 no mês 14. A leitura literal do calendário (adiantamento depois da parcela nº 117, em nov/2027) daria saldo 146.000 e parcela seguinte 2.295,41 (motor e cenário: 144.000 e 2.273,56): diferença de R$ 2.000 no saldo.
  - **Origem: motor/tradução.** `contratoDaDivida` (linha 1687, `k = k0 + em`) e a linha lançada por `degrausDaParcela`: a convenção "mês 0 contém a parcela" não vale quando hoje está depois do dia 10. **Correção:** quando o mês 0 não tem parcela (hoje depois do dia da parcela), deslocar o contrato em um mês (`k0+1`), ou aceitar `inicio` e `restantes` consistentes.

### 4.2 Saque à vista do fundo de pensão consumido como renda do mês (frente Liberdade/Fluxo)

- **Sintoma.** Mês 6 (abr/2027): `in_pas_1 = 409.696,51` (saque) e saídas de **R$ 436.492,00** (escala 23,5116, contra 1,185 no mês anterior e 1,4433 no seguinte). O financeiro vai de 1.052.146,67 (mês 5) para 1.055.802,46 (mês 6): o saque não chega ao financeiro. O cenário e o comentário do motor ("o saque à vista entra no financeiro") dizem o contrário.
- **Impacto.** O financeiro fica R$ 409,7 mil abaixo em 2027 e, com o rendimento de 0,4% a.m., R$ 440.219,32 abaixo no mês 24, R$ 645.811,13 no mês 120 e R$ 2.354.119,36 no mês 444, se fosse o único erro. Medido junto com o 4.1 (variante A do auditor): +409 mil no mês 6, +463 mil no mês 13, +508 mil no mês 36, +708 mil no mês 120, +1,17 milhão no mês 246 e +2,57 milhões no mês 444 sobre o financeiro do motor (6,67 milhões no fim).
- **Origem: motor.** `caixasDePrevidencia`, linha 1382: o saque entra como `PASSIVE` com `dur: 1`; em `simula`, depois da liberdade (`ff`), `pas` soma toda renda passiva do mês e `m.scale` (linha 2116) escala o consumo até `renda + saque − compras`; o saque é consumido no mesmo mês. Regra violada: um recebimento único de patrimônio (resgate) não é renda recorrente nem deve entrar no cálculo do padrão de vida.
- **Correção sugerida.** Tratar o saque como entrada de caixa fora de `pas` (como o motor faz com o produto da venda), ou excluir rendas com `dur === 1` da conta da escala.
- **Por que a causa não está no cliente.** O Hélio já está na liberdade desde o mês 1 (idade de parar = idade de hoje); com a liberdade em curso, qualquer renda passiva do mês é absorvida. Um cliente em acumulação não sofreria isso.

### 4.3 Salário e 13º da Vera de dezembro de 2028 perdidos (frente Fluxo)

- **Sintoma.** Mês 26 (ciclo 05/12/2028 a 04/01/2029): entradas 16.503,82 (INSS do Hélio + fundo); `in_salario = 0` e sem 13º. O INSS da Vera começa no mês 27 (correto). O mês 26 fica sem renda dela.
- **Esperado.** Ela faz 60 anos em 01/01/2029 (cliente: "para aos 60, em janeiro de 2029"): o ciclo 26 inteiro é de trabalho. Faltam salário de 9.500 e 13º de 9.500: **R$ 19.000**.
- **Impacto.** No financeiro o efeito é pequeno, porque a escala do padrão de vida recompõe o gasto (o mês 26 mostra 22.000 de gasto contra 26.795 dos vizinhos): o erro aparece na renda do fluxo (R$ 19.000) e no gasto (R$ 4.795 a menos). Mas a renda do período fica errada na tela.
- **Origem: motor.** `paradaMi`, linha 1291: `Math.round((SPOUSE_RETIRE − SPOUSE_AGE) · 12)` = round(26,4) = 26 e `trabalhaEm` usa `mi < parada`. A conta parte de "hoje" (20/10) e ignora que o mês 0 começa dias antes (dia 5) e que o aniversário (01/01) cai antes do dia 5 de janeiro. Nenhuma idade inteira dá o mês certo (60,1 e 60,2 dão 28: um mês a mais). Tradução do consultor: campo `spouseRetireAge` só aceita inteiro (dificuldade 7), o que torna o erro inevitável.
- **Correção sugerida.** Parada = primeiro ciclo cujo dia 5 é posterior ao aniversário (`mi` do ciclo seguinte ao mês do aniversário), ou campo "para em AAAA-MM".

### 4.4 Valores esperados do cenário que divergem do motor (não são erros do motor)

| Valor do cenário | Motor | Origem da diferença |
|---|---|---|
| Renda do fundo R$ 7.976 | 8.703,82 | cenário usa 0,4% a.m. na fase de renda, renda postecipada; motor usa a taxa da Previc (6,08% a.a.) e paga no início do mês (a conta com 0,4% e antecipada dá 7.944,49). Desenho, ver 5.1 |
| Parcela após adiantamento ≈ 2.274 e saldo 144.000 | 2.273,56 e 144.000 | confere; o cenário numera a parcela como o contrato (nº 118) |
| Taxa 0,7582% a.m. | 0,75919% | o cenário digitou a taxa; 9,5% a.a. dá 0,75915% |
| Carro 82.541 | 82.438,34 | 24 meses nominais; calendário real: 103 semanas, não 104,3 (−R$ 102,78) |
| Praia 219.233 | 219.230,93 | idem (−R$ 1,80) |
| Aporte da Europa R$ 6.521/mês | aporte 0 (R$ 76.300 dedicados hoje) | tradução do consultor (P6/dificuldade 12): na fase de liberdade o motor não poupa |
| Saque entra no financeiro | não entra | erro do motor (4.2) |

## 5. Comportamentos por desenho que o dono do produto deveria conhecer

**5.1 Taxa da fase de renda do fundo (Previc) em vez da taxa do plano.** Renda de 8.703,82 contra 7.944,49 (taxa do plano, antecipada): +R$ 759,33/mês, +9,6%, **R$ 182.239 nominais em 240 meses**. Duas taxas no mesmo fundo (0,4% a.m. no acúmulo; 6,08% a.a. na renda) sem aviso ao cliente.

**5.2 Depois da liberdade o gasto sobe até a renda ("escala").** Do mês 1 em diante o gasto do mês = renda do mês + saque do patrimônio − parcelas da compra (e nunca abaixo de 22.000). Para o Hélio e a Vera: gasto declarado R$ 18.565 (14.500 + parcela 4.065); desejado R$ 22.000; **o motor gasta R$ 22.000 nos meses 1 a 5, R$ 26.795 nos meses 7 a 25 e R$ 22.104 do 27 ao 215**, e nunca poupa a renda excedente. O rendimento (0,4% a.m.) e a venda da clínica é que fazem o financeiro crescer. Nos meses 7 a 25 o gasto passa dos 22.000 desejados em R$ 4.795 por mês (cerca de R$ 91 mil em 19 meses, fora os meses 12 e 13).
Comparação medida (financeiro; Δ sobre o motor, já sem os vazamentos 4.1 e 4.2; ±1%):

| Mês | Motor | A: corrige 4.1 e 4.2 | C: gasta os 22.000 desejados e acumula a sobra | B: gasto declarado + parcela real |
|---|---|---|---|---|
| 12 | 996.481 | 1.415.437 (+418.956) | 1.449.400 (+452.920) | 1.491.709 (+495.228) |
| 36 | 1.815.610 | 2.323.524 (+507.915) | 2.428.718 (+613.109) | 2.600.988 (+785.379) |
| 120 | 2.540.735 | 3.248.474 (+707.739) | 3.405.884 (+865.150) | 3.761.568 (+1.220.834) |
| 246 | 4.197.972 | 5.363.908 (+1.165.936) | 5.641.106 (+1.443.134) | 7.021.718 (+2.823.746) |
| 444 | 6.665.996 | 9.234.654 (+2.568.657) | 9.845.719 (+3.179.722) | 15.147.649 (+8.481.653) |

O financeiro final do motor (6,67 milhões) fica 28% abaixo da variante A e 32% abaixo da C; a B (que ignora a renda desejada) é 56% maior que o motor.

**5.3 Liberdade financeira para quem já se aposentou.** `retireAge = 62` (idade atual 62,22) dispara a liberdade na primeira semana de pagamento (semana 3248, mês 1), "forçada" (critério de perpetuidade: financeiro × 0,4% = 4.183 < lacuna máxima de 8.600). O plano troca o gasto real (déficit R$ 1.265/mês) por um consumo de R$ 22.000 com retirada de R$ 4.700/mês nos meses 1 a 5: 3,7 vezes o déficit real. Ruína: nunca (menor caixa em qualquer semana: R$ 891.852,89).

**5.4 Patrimônio líquido do bem financiado.** A praia entra em `bens` pela entrada (200.000) e pelas amortizações acumuladas; os 400.000 de dívida **não** estão em `fim.div`. Líquido correto, patrimônio bruto subestimado em 400.000 menos amortizações (mês 36: bens 1.372.222 em vez de 1.770.000 e dívida 118.033 em vez de 518.033).

**5.5 Fundo de pensão sai do patrimônio na concessão.** A previdência fechada vira renda e deixa de ser patrimônio: queda de R$ 1.611.477,52 no patrimônio no mês 6 (o fundo de 1.638.786,05 sai; entram 3.655,79 no financeiro; o saque de 409.696,51 não aparece, ver 4.2). O capital da renda (R$ 1.229.089,54) some do balanço mesmo estando disponível como fluxo de 240 meses.

**5.6 Calendário semanal.** 24 meses nominais ≠ 24 meses de calendário: o carro rende por 103 semanas = 23,7 meses (R$ −102,78 em relação à fórmula mensal); a Europa chega a 79.957,49 (R$ −42,51 contra os 80.000; o status "ok" usa o limite de 98%).

**5.7 Defasagem de uma semana na troca de taxa da caixinha.** O motor busca a taxa do mês na semana anterior (`obj.map(... m.mIdx)`, linha 1980), então a 1ª semana do mês 12 ainda rende 0,5%. Teste de estresse (praia com 150.000 dedicados hoje, moderado): a recursão com a regra "mês da semana anterior" reproduz o motor ao centavo e a "mês da própria semana" difere em R$ 40,02; custo da defasagem R$ 36,45 sobre 159.036,53. Neste cliente, zero (a praia só tem saldo a partir do mês 13). Efeito da regra dos 24 meses medido no estresse: 175.264,16 contra 179.502,08 se fosse moderado o tempo todo (−R$ 4.237,92) e 173.182,87 se conservador o tempo todo.

**5.8 O mês 0 é um toco.** O mês 0 vai de 20/10 a 04/11 (2 semanas): metade dos gastos "ajustáveis", plano de saúde integral, sem salário nem INSS (pagos no dia 5). Início depois de 26/10 desloca o mês 0 para novembro (verificado: `M0 = {2026, 10}` com início em 28/10): "daqui a 13 meses" deixaria de ser nov/2027.

## 6. Limites desta auditoria

- **Escala do padrão de vida e liberdade forçada**: recalculadas como regras de desenho; não julguei se a política de produto "gastar a renda" é desejada, apenas medi o efeito (variantes A, B e C acima, simulação mensal própria com erro de até 0,86%).
- **Semanas de fluxo**: o recálculo mensal das saídas usa o total do mês (escala × linha); a distribuição por semana dentro do mês não foi auditada linha a linha (as somas semanais batem pela conservação A1/A3).
- **Objetivos sem aporte**: o aporte automático e a regra de parar quando a caixinha basta não puderam ser exercitados neste cliente (planned = 0, `m.invest = 0` em liberdade). Foram cobertos só pela fórmula do aporte necessário (D8).
- **IR e IOF**: o plano usa líquido e `iof: isento`; não auditei tributação do saque/renda do fundo (dificuldade 15) nem o comportamento do IOF financiado. Tentei reproduzir "iof em branco" (281.292) e vi saldo 272.000/270.000/268.000 (o saldo informado manda); não reproduzi o número do consultor.
- **Seguro, esperança de vida e telas**: `lifeExp` (98), seguros e política de investimentos (renda 18.092 sem o fundo) não fazem parte da evolução patrimonial e não foram auditados.
- **Julgamento das "coisas estranhas" do consultor** (resumo): saque no mês 6 e adiantamento de 151.402: **erro de motor** (4.2, 4.1); gasto de 26.795 nos meses 14 a 25 e sobra não poupada: **desenho** (5.2; o consultor acerta o sintoma, mas a explicação "sobra vira patrimônio" não procede: o financeiro cresce por rendimento e pela venda, não por sobra); saldo "início do mês" no fim do mês 0: **convenção correta** no calendário (mês 0 não tem parcela; o financeiro é de 272.000 após 104 pagas); mas no mês 13 o saldo só cai no 14: **erro de motor** (4.1 b); liberdade no mês 1: **desenho** coerente com G1; Vera para um mês antes: **erro de motor** (4.3); duas taxas do fundo: **desenho** (5.1); financiamento `inicio` x `restantes`: **ambiguidade de dado/tradução** (com `inicio: 2018-03` o saldo do mês 1 vira 270.014,60 em vez de 270.000: o contrato conta uma parcela a menos); janela de 28/10: **desenho** (5.8).
