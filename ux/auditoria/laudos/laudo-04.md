# Laudo de auditoria matemática — Cenário 04 (Paulo e Renata)

Auditor: recálculo independente em `ux/auditoria/laudos/auditor-04.js` (reexecutável: `node ux/auditoria/laudos/auditor-04.js`; ~3 s). O código parte do plano (`plano-04.json`) e das regras do domínio financeiro; nenhuma função do motor produz o "esperado". O "observado" é só a saída do motor (extrato mensal e as 5.219 semanas da simulação). Nada do motor, das telas, dos planos, dos extratos ou de outros laudos foi alterado. Convenção de datas: mi 0 = out/2026 (início em 28/10/2026), mi 5 = mar/2027, mi 53 = mar/2031, mi 170 = dez/2040, mi 479 = set/2066.

## 1. Veredito

**A contabilidade, as participações e as caixinhas do plano-04 estão aritmeticamente exatas (erro máximo de centavos em todos os meses). As dívidas têm saldos exatos, mas o motor tem contas erradas confirmadas em parcelas, venda de bem com dívida e amortização antecipada, e o padrão de vida depois da liberdade distorce o resultado do cliente. Não dá para afirmar "zero chance de erro".**

| Frente | Semáforo | Em uma linha |
|---|---|---|
| Participações | **CERTO** | 628 meses recalculados, erro máx. R$ 0,00; venda, alvo, desvalorização e piso em zero conferidos por planos de estresse (erro 0). |
| Dívidas | **ERRADO** | Saldos, consórcios, crédito novo e lance da Bruna exatos. Mas: a parcela lançada do apartamento não é a do contrato (até R$ 327/mês), a última parcela de 3 contratos nunca sai do caixa, a quitação na venda perde uma parcela (R$ 4.000 a R$ 8.000), e a amortização antecipada abate só 96,66% do valor (R$ 3.344 por R$ 100 mil). |
| Caixinhas | **CERTO COM RESSALVAS** | Saldo semana a semana exato (erro 0,00) e troca de taxa nos meses 12 e 36; mas a troca acontece 1 semana atrasada (R$ 45,88 e R$ 12,32) e a faculdade (moderado) nunca rende moderado por regra. |
| Contabilidade geral | **CERTO** | patrimônio = financeiro + bens + participações + previdência − dívidas em 628 meses (erro 3,7e-9); nada criado nem perdido; sem NaN. |
| Fluxo | **CERTO COM RESSALVAS** | Entradas e saídas = plano em todos os meses (erro 0,00). Ressalvas: mês 0 sem lançamentos, Funpresp começa 1 mês antes da Renata parar (R$ 4.136 em dobro), 13º acompanha o salário. |
| Liberdade | **CERTO COM RESSALVAS** | A lógica reproduz exatamente (mês 53, renda sustentável 29.085, caixa zera no mi 479). Por desenho, depois de mar/2031 o motor gasta **toda a renda** (R$ 54.290 → R$ 64.886/mês; R$ 2,57 mi a mais até 2040) e o caixa acaba aos 87,7 anos **sem alerta de ruína**. |

## 2. Por que a matemática está certa — por frente

### 2.1 Participação da clínica (R$ 1.400.000)
Regra usada: `v(m) = v(m−1)·(1+6%)^(1/12)` para m−1 entre 0 e 59 (60 meses de taxa); em m = 30, `v += 300.000` depois do rendimento do mês; piso em zero; depois do mês 60 sem taxa. Compara com `fim.part`, `fim.det.parts[0]` e `parts[0].serie`, mês a mês (628 meses).

| Prova | Esperado | Motor | Erro |
|---|---|---|---|
| Mês 12 | 1.400.000·1,06 = 1.484.000,00 | 1.484.000,00 | 0,00 |
| Mês 29 → 30 | 1.919.543,80 = 1.400.000·1,06^2,5 + 300.000 | 1.919.543,80 | 0,00 |
| Mês 60 | 1.919.543,80·1,06^2,5 = 2.220.560,91 | 2.220.560,91 | 0,00 |
| Mês 61 em diante | constante 2.220.560,91 | 2.220.560,91 | 0,00 |
| Salto do mês 30 | rendimento do mês + 300.000 (a taxa continua sobre o salto) | idem | 5,8e-11 |

O cenário diz 1.919.544 e 2.220.561 (arredondados); a diferença para o motor é de R$ 0,20 e R$ 0,09, só arredondamento. A participação nunca gera fluxo de caixa (zero chaves `in_`/`out_` ligadas a ela), como deve ser enquanto não há venda.

Plano-04 não tem venda, então forcei o motor com planos de estresse (em memória; o plano original não foi tocado):
- **T1 venda** no mês 48, preço R$ 2.600.000, custos 5% + R$ 10.000, R$ 100.000 destinados ao apto da Bruna: valor da participação até o mês 47 = série com alvo (erro 0); preço entrando no caixa, custos (R$ 140.000), destino (R$ 100.000 em `mov_obj_apto_bruna`) e participação = 0 em todos os meses seguintes: erro 0,00.
- **T1b** alvo de R$ 2.000.000 em 24 meses + taxa 3% depois + queda pontual de 10% no mês 10: 101 meses, erro 0.
- **T2 desvalorização** −30% a.a., queda de 20% no mês 20 e queda pontual maior que o valor (R$ 5 mi) no mês 40: piso exato em R$ 0,00 (nunca negativa), erro 0.
- **T1c** (ressalva): se o consultor ligar uma renda à participação (`participacoes[].renda`), ela **não termina** na venda; o motor só corta a renda ligada de BENS (`configure`, ~linha 2402 do HTML). O plano-04 não usa esse vínculo, então não afeta o cliente.

### 2.2 Dívidas
Premissa explícita: a âncora de saldo é o **saldo informado** (R$ 783.000 no SAC; R$ 592.000 no consórcio), como o motor faz.

| Dívida | Regra recalculada | Resultado |
|---|---|---|
| Apartamento (SAC) | amortização 783.000/188 = 4.164,89; `saldo(k) = 783.000·(188−k)/188` | saldo mi 0 a 200: erro 3,1e-9. Contrato puro (1.000.000/240, 52 pagas): 783.333,33; diferença de R$ 333,33 vem do dado do cliente (783.000 informado), não do motor. |
| Casa de campo (consórcio contemplado) | 600.000·1,20 = 720.000; parcela 4.000; `saldo(k) = 4.000·(148−k)`; reajuste 0 | saldo mi 0 a 160: erro 0,00; parcela 4.000 em mi 1..52: erro 0,00. |
| Crédito novo (sabático) | Price: PMT(150.000; 1,6%; 36) = 5.513,5827; saldo `B(k)=B(k−1)·1,016 − PMT`, k = mi−5; entrada em mi 5, 1ª parcela em mi 6 | saldo erro 2,4e-10; parcela erro R$ 0,0027 (a linha digitada é 5.513,58); juros pagos = 36·PMT − 150.000 = **R$ 48.488,98**. |
| Consórcio do carro (a contemplar, lance R$ 20.000) | 44 parcelas restantes×2.100 = 92.400; (92.400 − 20.000)/44 = 1.645,45; carta − lance = 130.000 entra em mi 18 | parcela erro R$ 0,0046; dívida remanescente = parcelas futuras×1.645,45 em 45 meses, erro 1,9e-10. |
| Consórcio da Bruna (compra do objetivo) | total 700.000·(1+17%+2%) = 833.000; parcela 6.941,67; saldo após a 61ª = 409.558,33; lance 30% = 122.867,50; embutido 10% da carta = 70.000; bolso = 52.867,50 (`amount` 52.868); nova parcela (409.558,33−122.867,50)/59 = 4.859,17 | todas as 125 parcelas do fluxo: erro 2e-11; `amount`: erro 0. |
| Dívida total do patrimônio | apto + casa + crédito + consórcio do carro (o consórcio da Bruna não entra no passivo; ver seção 5) | 628 meses, erro 3,3e-9. |

Cenário × motor: 1ª parcela do SAC "R$ 11.366" é 11.363,6 pela conta (erro de R$ 2,4 **no valor esperado do cenário**, arredondamento); "773/mês" do consórcio da Bruna = 52.868/68,4284 = 772,60 (o cenário arredondou para cima).

### 2.3 Caixinhas e rendimento
Regras recalculadas (premissas de desenho, conferidas quanto à aplicação consistente):
1. Perfis do plano: conservador 0,4%, moderado 0,5%, agressivo 0,6% ao mês (confere com `PROFILES`).
2. Nos 24 meses antes da data a caixinha rende o conservador; objetivo com prazo ≤ 24 meses nasce conservador.
3. O motor rende **por calendário, semana a semana**: `saldo(w) = saldo(w−1)·(1+taxa)^(7/30,4375) + aportes da semana`. O patrimônio dedicado entra em W0 e já rende naquela semana.

| Caixinha (prazo, perfil) | Taxa esperada | Troca | Saldo na data: esperado = motor | Erro |
|---|---|---|---|---|
| Sabático (5, conservador) | 0,4% sempre | não | 91.583,69 (90.000 de consumo + 1.583,69 devolvidos) | 0,00 |
| Faculdade do Davi (24, moderado) | 0,4% sempre (24 meses = nasce conservador) | não | 150.449,18 | 0,00 |
| Reforma (36, moderado) | 0,5% nos meses 0 a 11; 0,4% a partir do mês 12 (out/2027) | mês 12 | 200.402,27 | 0,00 |
| Apto da Bruna (60, moderado) | 0,5% nos meses 0 a 35; 0,4% a partir do mês 36 (out/2029) | mês 36 | 53.822,72 (compra 52.868 + 954,72 devolvidos) | 0,00 |

Provas: 2.724 semanas × 4 caixinhas recalculadas com erro máximo 0,00; `taxaPorMes` do extrato = regra em 4 tabelas (129 pares objetivo×mês), erro 0; o saque na data (consumo, bem comprado, saldo restante devolvido) bate com 0,00; o aporte, quando existe, para quando a caixinha basta (T6b: as 4 caixinhas terminam em 100,7% a 100,8% do alvo, com aportes de R$ 40 mil, 20 mil, 15 mil e 5 mil por mês cortados no mês certo). No plano-04 não há aporte mensal (`planned = 0`): só o patrimônio dedicado rende.

Efeito em reais de cada escolha de taxa no saldo da data (valor que o laudo pediu):

| Caixinha | Como o motor fez | Se a troca fosse sem atraso | Tudo conservador | Tudo moderado | Tudo agressivo |
|---|---|---|---|---|---|
| Sabático | 91.583,69 | 91.583,69 | 91.583,69 | 91.982,95 | 92.383,56 |
| Faculdade | 150.449,18 | 150.449,18 | 150.449,18 | 154.003,94 (+3.554,76) | 157.639,03 |
| Reforma | 200.402,27 | 200.356,40 (−45,88) | 198.121,26 (−2.281,01) | 205.231,26 (+4.828,99) | 212.588,96 |
| Apto Bruna | 53.822,72 | 53.810,40 (−12,32) | 51.958,09 (−1.864,63) | 55.119,65 (+1.296,93) | 58.470,16 |

**Rendimento do patrimônio financeiro (E).** Convenção do motor: o saldo do fim da semana anterior rende `(1,004)^(7/30,4375)` primeiro; os lançamentos da semana (salário, contas, transferências) entram **depois**, sem render naquela semana. Recursão independente `cofre(w) = cofre(w−1)·GW + mov_cofre(w)` em 2.724 semanas: erro 4,7e-10. Como o rendimento segue o calendário, o rendimento mensal efetivo varia: 0,368% em mês de 4 semanas e 0,461% em mês de 5 semanas; no ano é 0,4%/mês. A reserva de R$ 300 mil não tem tratamento separado (rende o mesmo 0,4% do restante do financeiro).

### 2.4 Contabilidade geral
- Patrimônio = financeiro + bens + participações + previdência − dívidas recalculado componente a componente em 628 meses (financeiro = cofre + caixinhas; bens = 3.000.000 + carro 130.000 em mi ≥ 18 + parte da carta de cada parcela do consórcio da Bruna + lance do bolso em mi ≥ 60; previdência = Funpresp a 0,4% + 3.800/mês e a caixa do consórcio do carro): erro máx. R$ 3,7e-9.
- Conservação por semana (2.724 semanas): `Σ mov_* = Σ entradas − Σ saídas` com erro 0; por mês, 7,3e-12. Variação mensal do financeiro = entradas − saídas − (cofre→bens) + rendimento recalculado: erro 1,6e-9 em 627 meses.
- Sem NaN/Infinity; entradas e saídas nunca negativas; o cofre nunca fica negativo; `cheque` = 0 sempre.
- O extrato gravado (`extrato-04.json`) é exatamente o que o motor produz agora (erro 0).
- Patrimônio líquido de referência: mi 0 = 6.245.421; mi 60 = 7.910.039; mi 170 (Paulo para) = 10.607.322; mi 300 = 9.174.515; mi 479 em diante = 6.000.179 (só bens e participação).

### 2.5 Fluxo
Entradas: cada linha (clínica jan-fev R$ 30 mil, mar-nov R$ 42 mil, dez R$ 55 mil; bônus de R$ 20 mil em mar/jun/set/dez; salário da Renata R$ 19.000 → R$ 21.500 em jul/2028 (mi 21); 13º em dezembro) recalculada com o calendário real: erro 0,00 em 6 linhas × 627 meses. O ano sabático (mi 5 a 16) zera as 4 linhas do Paulo e volta em mar/2028 (mi 17). Renata para em mi 53; Paulo em mi 170. Aposentadoria da Renata (R$ 13.000 de mi 53) e INSS (R$ 8.000 de mi 207, Paulo com 65 anos): erro 0.
Saídas antes da liberdade (mi 1 a 52): cada linha = degrau do plano (escola do Davi até dez/2028 = mi 26, faculdade da Bruna até dez/2029 = mi 38, moradia da Bruna e alimentação de jan/2031 = mi 51, alimentação do Davi de jan/2033 = mi 75), erro 0,00; total do mês (linhas + consórcio da Bruna + objetivos consumidos 90 mil/150 mil/200 mil + compromisso de 130 mil) erro 2,9e-11. Bordas conferidas: mi 0, dezembro (mi 2, 14, 26), mi 5 (sabático + crédito), mi 17-18 (retorno da renda + contemplação do carro), mi 21 (reajuste), mi 24 e 36 (objetivos), mi 52-53 (aposentadoria da Renata), mi 60-62 (lance da Bruna).

### 2.6 Liberdade financeira, ruína e aposentadoria
- Mês da liberdade: idade de parada do casal = 47,822 + (57 − 52,66) = 52,162 anos do Paulo; 1ª semana de salário com essa idade = semana 2722, mi 53 (mar/2031). Esperado = motor (erro 0).
- `maxGap` = 50.000 − 13.000 − 4.136,48 = 32.863,52 (esperado = motor); renda sustentável = 2.987.246,93·0,4% + (50.000 − 32.863,52) = 29.085,47 (esperado = motor); `forced = true` porque (fin − pendências)·0,4% < maxGap.
- Gasto do mês depois da liberdade = max(50.000; renda equivalente do mês) enquanto houver caixa: recalculado de mi 53 a 478 (426 meses): erro 1,5e-11. O caixa zera em set/2066 (mi 479, Paulo com 87,7 anos); `ruina = null` porque a regra só marca ruína se o cofre fechar o mês negativo, e o motor limita o saque ao caixa.
- Ruína, juros e teto (T5, com financeiro livre de R$ 200 mil): juros de 4% ao mês sobre o negativo do fim do mês anterior, erro 0,00 nos 69 meses com dívida; ruína marcada no mi 11; dívida trava em 100× a renda mensal (R$ 3.883.333): o que excede some (ver seção 5).

## 3. Conferências realizadas

62 conferências no plano-04 (55 dentro da tolerância de R$ 0,01 ou do limite justificado; 7 divergem, todas explicadas na seção 4) mais 12 testes de estresse com planos modificados em memória. "(un.)" = o erro é uma contagem (parcelas, meses, eventos), não reais. Tolerância padrão R$ 0,01.

| # | Frente | O que foi conferido | Método | Amostra | Erro máx. (R$) | Resultado |
|---|---|---|---|---|---|---|
| 1 | Contabilidade geral | Calendário: o mês do motor abre na semana que contém o dia 5; mi 0 = out/2026 | recalcula as semanas (nascimento 1979-01 + 7 dias) e as datas | 628 meses | 0,00 (un.) | CERTO |
| 2 | Contabilidade geral | Semana de hoje (W0) | dias de 01/01/1979 a 28/10/2026 ÷ 7, arredondado | W0=2495 | 0,00 (un.) | CERTO |
| 3 | Participações | Valor mensal da participação (6% a.a. composto mensal por 60 meses + salto de R$ 300 mil no mês 30) | recalcula v(m)=v(m-1)·1,06^(1/12) (m-1<60) + pontual em m=30; compara com fim.part | 628 meses (0 a 627) | 0,00 | CERTO |
| 4 | Participações | Idem, com fim.det.parts[0] | mesma série | 628 meses | 0,00 | CERTO |
| 5 | Participações | Idem, com parts[0].serie (trajetória do motor) | mesma série | 627 pontos | 0,00 | CERTO |
| 6 | Participações | Valores-marco do cenário (mês 12, 30, 60) | fórmula fechada do cenário: 1.484.000 / 1.919.544 / 2.220.561 | 3 marcos | 1,4e-9 | CERTO |
| 7 | Participações | Salto do mês 30 = rendimento do mês + 300.000, e a taxa continua sobre o salto | Δ(29→30) esperado | mês 30 | 5,8e-11 | CERTO |
| 8 | Participações | Depois do mês 60 o valor fica constante (taxa de 5 anos terminou) | max/v(m)-v(60)/ para m=61..627 | 567 meses | 0,00 | CERTO |
| 9 | Participações | Participação não é caixa: nenhum fluxo (in_/out_) de venda/valorização | procura chaves in_*part*, out_vendap_* no fluxo | 628 meses | 0,00 (un.) | CERTO |
| 10 | Dívidas | Apartamento (SAC): saldo devedor mês a mês | saldo(k)=783.000·(188−k)/188 (âncora no saldo informado, amortização constante) | 201 meses (0 a 200) | 3,1e-9 | CERTO |
| 11 | Dívidas | Apartamento: saldo observado × saldo do contrato puro (1.000.000/240, 52 pagas) | max/saldoC(k)−saldo observado/ (diferença esperada: 783.333 do contrato × 783.000 informado) | 189 meses | 333,33 | CERTO |
| 12 | Dívidas | Apartamento: amortização do contrato (4.166,67) e 1ª parcela (cenário 11.366) | recalcula 1.000.000/240 e 1.000.000·i + amort | 1 valor | 0,59 | CERTO |
| 13 | Dívidas | Apartamento: parcela que sai do fluxo (mi 1..52) × parcela do contrato mês a mês (8,99% a.a., SAC) | out_fix_parc_apto(mi) − [4.166,67 + saldoC(mi−1)·i] | 52 meses | 326,94 | DIVERGE — A linha de despesa é uma escada ANUAL (valor do 1º mês do ano repetido 12 vezes) e usa a taxa implícita do motor (8,45% a.a., não 8,99%): erro máx. R$ 326,94 |
| 14 | Dívidas | Casa de campo (consórcio contemplado): total 720.000, parcela 4.000, saldo 148×4.000 = 592.000 | 600.000·1,20; /180; saldo(k)=4.000·(148−k) | valores-chave | 0,00 | CERTO |
| 15 | Dívidas | Casa de campo: saldo devedor mês a mês | saldo(k)=4.000·(148−k) | 161 meses (0 a 160) | 0,00 | CERTO |
| 16 | Dívidas | Casa de campo: parcela no fluxo antes da liberdade = 4.000 (reajuste 0) | out_fix_parc_casa(mi) − 4.000 | 52 meses (1..52) | 0,00 | CERTO |
| 17 | Dívidas | Crédito novo: parcela Price R$ 5.513,58 (cenário 5.514) | PMT(150.000; 1,6%; 36) | 1 valor | 0,00 | CERTO |
| 18 | Dívidas | Crédito novo: saldo devedor depois de cada parcela (det.divs[3]) | B(k)=B(k−1)(1+i)−PMT, k=mi−5 | 41 meses (5 a 45) | 2,4e-10 | CERTO |
| 19 | Dívidas | Crédito novo: parcela no fluxo (36 parcelas, mi 6..41), entrada de R$150.000 em mi 5 | out_fix_parc_cred(mi) e in_credito_cr_sab(5) | 60 meses | 0,00 | CERTO |
| 20 | Dívidas | Crédito novo: juros pagos = Σparcelas − principal | Σ out_fix_parc_cred − 150.000 vs 36·PMT − 150.000 | 36 parcelas | 0,10 | CERTO |
| 21 | Dívidas | Consórcio do carro: parcela depois do lance (R$ 20.000 abate 44 parcelas) | (44·2.100 − 20.000)/44 | 1 valor | 0,00 | CERTO |
| 22 | Dívidas | Consórcio do carro: carta menos lance entra em mi 18 (130.000) | in_pas_3(18) − (150.000−20.000) | 1 mês | 0,00 | CERTO |
| 23 | Dívidas | Consórcio do carro: dívida remanescente (fim.div − Σ det.divs) = parcelas futuras × 1.645,45 | parcelas que ainda saem do caixa (mi+1..61) | 45 meses (18..62) | 1,9e-10 | CERTO |
| 24 | Dívidas | Consórcio da Bruna: total 833.000, parcela 6.941,67, lance 30% do saldo (122.867,50), embutido 70.000, bolso 52.867,50 | contas do contrato | 5 valores | 3,4e-5 | CERTO |
| 25 | Dívidas | Consórcio da Bruna: "necessário na data" = bolso arredondado para cima (52.868) | ceil(bolso) vs objetivo.amount | 1 valor | 0,00 | CERTO |
| 26 | Dívidas | Consórcio da Bruna: parcela no fluxo (6.941,67 até a 61ª; depois 4.859,17; 120 parcelas, mi 1..120) | out_fix_apto_bruna_compra(mi) | 125 meses | 2,0e-11 | CERTO |
| 27 | Caixinhas | Ano sabático do Paulo (5 meses, conservador): saldo semana a semana = saldo·(1+taxa)^(7/30,4375) + aportes | recursão independente; taxa pela regra (24 meses finais conservadores); aportes = mov_obj_* observados | 2724 semanas | 0,00 | CERTO |
| 28 | Caixinhas | Ano sabático do Paulo: valor sacado na data (mov_obj_* negativo) | saldo da semana anterior · (1+taxa)^(7/30,4375) | 1 saque (mi 5) | 0,00 | CERTO |
| 29 | Caixinhas | Faculdade do Davi (24 meses, moderado): saldo semana a semana = saldo·(1+taxa)^(7/30,4375) + aportes | recursão independente; taxa pela regra (24 meses finais conservadores); aportes = mov_obj_* observados | 2724 semanas | 0,00 | CERTO |
| 30 | Caixinhas | Faculdade do Davi: valor sacado na data (mov_obj_* negativo) | saldo da semana anterior · (1+taxa)^(7/30,4375) | 1 saque (mi 24) | 0,00 | CERTO |
| 31 | Caixinhas | Reforma da casa de campo (36 meses, moderado): saldo semana a semana = saldo·(1+taxa)^(7/30,4375) + aportes | recursão independente; taxa pela regra (24 meses finais conservadores); aportes = mov_obj_* observados | 2724 semanas | 0,00 | CERTO |
| 32 | Caixinhas | Reforma da casa de campo: valor sacado na data (mov_obj_* negativo) | saldo da semana anterior · (1+taxa)^(7/30,4375) | 1 saque (mi 36) | 0,00 | CERTO |
| 33 | Caixinhas | Apartamento para a Bruna (60 meses, moderado): saldo semana a semana = saldo·(1+taxa)^(7/30,4375) + aportes | recursão independente; taxa pela regra (24 meses finais conservadores); aportes = mov_obj_* observados | 2724 semanas | 0,00 | CERTO |
| 34 | Caixinhas | Apartamento para a Bruna: valor sacado na data (mov_obj_* negativo) | saldo da semana anterior · (1+taxa)^(7/30,4375) | 1 saque (mi 60) | 0,00 | CERTO |
| 35 | Rendimento | Rendimento do financeiro livre (cofre): cofre(w)=cofre(w−1)·(1+0,4%)^(7/30,4375) + mov_cofre(w) | recursão semanal reancorada no observado; mede o erro de cada semana | 2724 semanas | 4,7e-10 | CERTO |
| 36 | Contabilidade geral | Conservação do dinheiro por semana: Σ mov_* = Σ entradas − Σ saídas (transferências somam zero) | varre todas as semanas | 2724 semanas | 0,00 | CERTO |
| 37 | Contabilidade geral | fin = cofre + Σ caixinhas; sem NaN/Infinity; entradas/saídas nunca negativas | varre todas as semanas e chaves | 2724 semanas | 0,00 | CERTO |
| 38 | Contabilidade geral | Por mês: Σ movimentações (cofre+caixinhas+bens) = entradas − saídas | soma das chaves mov_* contra in_*/out_* | 628 meses | 7,3e-12 | CERTO |
| 39 | Contabilidade geral | Variação do financeiro do mês = entradas − saídas − (cofre→bens) + rendimento recalculado (cofre e caixinhas) | Δ(cofre+caixinhas) contra fluxo + rendimento semanal independente | 627 meses | 1,6e-9 | CERTO |
| 40 | Previdência | Saldo da previdência (Funpresp 380.000 a 0,4% a.m. + 3.800/mês até a concessão; caixa do consórcio 37.800 + 2.100/mês até a contemplação) | recursão independente | 628 meses | 0,00 | CERTO |
| 41 | Contabilidade geral | Bens = 3.000.000 (apto+casa, sem valorização) + carro 130.000 (mi≥18) + parte da carta de cada parcela do consórcio da Bruna + lance do bolso (mi≥60) | recalcula amortização × carta/total | 628 meses | 0,00 | CERTO |
| 42 | Dívidas | Dívida total do patrimônio (apto + casa + crédito + consórcio do carro contemplado) = Σ dos saldos recalculados | compara fim.div; o consórcio da Bruna NÃO entra no passivo (só a parte paga entra em bens) | 628 meses | 3,3e-9 | CERTO |
| 43 | Contabilidade geral | Patrimônio = financeiro + bens + participações + previdência − dívidas (cada parcela recalculada) | compara a soma dos componentes recalculados com a soma observada | 628 meses | 3,7e-9 | CERTO |
| 44 | Liberdade | Mês da liberdade financeira: 1ª semana de salário em que a idade do Paulo ≥ 47,82 + (57 − 52,66) = 52.162 anos | recalcula idades (365,25 dias) e a semana de abertura do mês | 1 evento | 0,00 (un.) | CERTO |
| 45 | Fluxo | Entradas ativas (clínica jan-fev/mar-nov/dez, bônus trimestral, salário da Renata, 13º) mês a mês, com sabático (mi 5..16) e parada de cada um | valor do degrau × ocorrências do calendário; Renata para em mi 53, Paulo em mi 170 | 3762 linha×mês | 0,00 | CERTO |
| 46 | Fluxo | Aposentadoria da Renata (13.000 de mi 53) e INSS do Paulo (8.000 de mi 207, Paulo com 65) | degraus declarados no plano | 628 meses | 0,00 | CERTO |
| 47 | Fluxo | Saídas antes da liberdade (mi 1..52): cada linha de despesa = degrau do plano (escola até dez/2028, faculdade até dez/2029, Bruna e alimentação a partir de jan/2031 etc.) | valor do degrau no mês | 676 linha×mês | 0,00 | CERTO |
| 48 | Fluxo | Total de saídas do mês (linhas + consórcio da Bruna + objetivos consumidos + compromisso do carro) × plano | soma dos degraus + 6.941,67 + 90.000 (mi 5) + 130.000 (mi 18) + 150.000 (mi 24) + 200.000 (mi 36) | 52 meses | 2,9e-11 | CERTO |
| 49 | Fluxo | Mês 0 (out/2026): sem entradas/saídas além da separação das caixinhas (o dia 28 já passou do dia 5 e do dia 10) | conta chaves in_/out_ no mi 0 | mi 0 | 0,00 (un.) | CERTO |
| 50 | Liberdade | Gasto do mês depois da liberdade (mi 53 até o caixa acabar) = max(renda desejada 50.000; renda do mês) | recalcula a renda equivalente mensal de cada pessoa e compara com Σ out_* (sem out_rendas) | 426 meses (mi 53..478) | 1,5e-11 | CERTO |
| 51 | Liberdade | Caixa zera em set/2066 (mi 479, Paulo com 87.7 anos) e o motor NÃO dispara ruína (ruina=null) | procura o primeiro mês com cofre=0; a regra só marca ruína se o cofre fechar o mês NEGATIVO | mi 53..627 | 0,00 (un.) | CERTO |
| 52 | Liberdade | Liberdade "forçada" (o patrimônio não sustenta 50.000/mês): maior falta mensal e renda sustentável | maxGap esperado 32.863,52 (obs 32.863,52); sustentável esperado 29.085,47 (obs 29.085,47) | 1 evento | 0,00 | CERTO |
| 53 | Dívidas | Depois da liberdade (mi ≥ 53) a parcela da casa de campo que sai do fluxo é a do contrato (4.000) | out_fix_parc_casa(mi) − 4.000 | mi 53..190 | 4.000,00 | DIVERGE — excesso pago sobre o contrato: apto R$ 503.759; casa R$ 180.809; carro R$ 1.699 (a despesa é "esticada" até a renda) |
| 54 | Dívidas | Depois da liberdade a parcela do apartamento que sai do fluxo é a do contrato (SAC 8,99%) | out_fix_parc_apto(mi) − [4.166,67 + saldoC·i] | mi 53..188 | 5.918,11 | DIVERGE |
| 55 | Fidelidade | Saídas-chave do motor × valores esperados do cenário | 19 valores comparados | 19 valores | 19.618,00 | DIVERGE — Consórcio da casa: última parcela em fev/2039 (mi 148): parcela paga no mi 148: esperado 4.000,00, motor 0,00 / Consórcio da Bruna: crédito para o bem (cenário: 700.000 − 70.000 = 630.000) × bem que o motor registra ao fim (bens do objetivo): esperado 630.000,00, motor 649.618,00 |
| 56 | Caixinhas | Perfis (conservador 0,4%, moderado 0,5%, agressivo 0,6% a.m.), rendimento da reserva 0,4% a.m., 24 meses conservadores, juros da dívida 4% a.m. | compara o extrato com o plano | 6 constantes | 0,00 (un.) | CERTO |
| 57 | Caixinhas | Tabela de taxas por mês do objetivo (taxaPorMes) = regra do domínio: perfil até 24 meses antes da data, conservadora depois (e desde o início se o prazo é ≤ 24) | taxaEsperada(objetivo, mês) para cada mês de cada caixinha | 129 pares objetivo×mês | 0,00 (un.) | CERTO |
| 58 | Dívidas | Número de parcelas que saem do caixa = parcelas restantes do contrato: apartamento (188) | conta meses com out_fix_parc_apto > 0 (mi ≥ 1) | mi 1..300 | 1,00 (un.) | DIVERGE — caixa pagou 187 de 188: a última parcela (nº 240) nunca sai do caixa, mas o saldo devedor zera em mi 188 |
| 59 | Dívidas | Número de parcelas que saem do caixa = parcelas restantes: casa de campo (148) | conta meses com out_fix_parc_casa > 0 | mi 1..300 | 1,00 (un.) | DIVERGE — caixa pagou 147 de 148 |
| 60 | Dívidas | Número de parcelas que saem do caixa = parcelas restantes: consórcio do carro (62) | conta meses com out_fix_parc_cons_carro > 0 | mi 1..300 | 1,00 (un.) | DIVERGE — caixa pagou 61 de 62 |
| 61 | Dívidas | Número de parcelas que saem do caixa = parcelas do contrato: crédito do sabático (36) e consórcio da Bruna (120) | conta meses com parcela > 0 | mi 1..300 | 0,00 (un.) | CERTO |
| 62 | Contabilidade geral | O extrato gravado (extrato-04.json) é reproduzido pelo motor atual | compara fin, bens, part, div de todos os meses | 628 meses | 0,00 | CERTO |

### Testes de estresse (planos modificados em memória; o plano original não foi tocado)

| Teste | O que se tentou quebrar | Resultado |
|---|---|---|
| T1 | venda da participação (mi 48, R$ 2,6 mi, custos 5% + R$ 10 mil, R$ 100 mil para o apto da Bruna) | preço, custos, destino e participação = 0 depois da venda: erro 0,00 |
| T1b | alvo + taxa + queda pontual de 10% | 101 meses, erro 0 |
| T1c | renda ligada à participação vendida | **a renda não termina** (bônus continua em mi 29 e 32): só bens têm `renda` cortada (limitação) |
| T2 | taxa −30%, pontual −20% e pontual de −R$ 5 mi | piso exato em 0,00; erro 0 |
| T3 | venda da casa de campo com consórcio (mi 40, R$ 900 mil, 6%) | custos e preço exatos; **quitação de R$ 432.000 = saldo depois da parcela 40, que não é paga**: faltam R$ 4.000 (CE-4) |
| T4 | amortização antecipada de R$ 100 mil no apto (mi 12, modo prazo) | **dívida cai R$ 96.655,56; erro persistente de R$ 3.344,45**; sem saída de caixa (CE-5) |
| T4b | idem, modo parcela; e valor R$ 5 mi acima do saldo | modo parcela: erro R$ 2.776 em mi 13; limite ao saldo correto (saldo vai a 0, não a negativo) |
| T5 | reserva negativa (financeiro livre de R$ 200 mil, sem caixinhas) | juros 4% a.m.: erro 0,00 em 69 meses; ruína no mi 11; dívida travada no teto (R$ 3.883.333) |
| T6 | aporte necessário sem patrimônio dedicado | 17.856,57 / 5.967,28 / 5.166,23 / 772,60 = esperado (fatores 5,0402; 25,1371; 38,7130; 68,4284); erro 1e-11 |
| T6b | aporte que para quando a caixinha basta (capacidade ampla) | para no mês certo; fecha em 100,7% a 100,8% do alvo |
| T7 | plano sem o crédito de R$ 150 mil | caixa mínimo sem o crédito: R$ 2,06 mi: o crédito era desnecessário (seção 5) |
| T8 | venda do apartamento financiado (mi 60) | quitação = saldo depois da parcela 60 (R$ 533.106,38) com a parcela do mês cortada (CE-4) |

## 4. Contas erradas encontradas

Ordem: das que mexem em dinheiro para as de apresentação. "Impacto" = efeito no patrimônio do plano-04 (não nos planos de estresse).

### CE-1 — A última parcela de cada contrato nunca sai do caixa
- **Sintoma:** parcelas pagas no caixa: apartamento 187 de 188; casa de campo 147 de 148; consórcio do carro 61 de 62 (crédito 36/36 e consórcio da Bruna 120/120 estão certos). O saldo zera sem o dinheiro sair: no mi 187 o apto deve R$ 4.164,89, o fluxo do mi 188 não tem parcela e o saldo vira 0; casa: saldo 4.000 no mi 147 e 0 no mi 148 com parcela 0.
- **Mês:** apto mi 188 (jun/2042), casa mi 148 (fev/2039, a data que o cenário cita), carro mi 62 (dez/2031).
- **Esperado × obtido:** parcela no mês (apto 4.196,67; casa 4.000,00; carro 1.645,45 = R$ 9.842,12) × 0,00.
- **Impacto no patrimônio do plano-04:** R$ 0,00. Os três meses são depois da liberdade (mi 53), quando o motor fixa o gasto total pela renda, então a parcela que falta apenas muda de rubrica. O patrimônio ficaria superestimado em R$ 9,8 mil se os contratos acabassem antes da liberdade.
- **Origem:** convenção do motor + portal. `restantesContratadas` (HTML ~1608) e `caixaDoConsorcio` (~1418) contam a parcela do **mês 0** como ainda por pagar (`restantes` "contando a deste mês"), e o portal encerra a linha com degrau zero em `from: restantes` (apto 188, casa 148; o do carro é `cortaLinha(…, c.fim)`, ~2400). Mas o mês 0 não gera lançamentos (início 28/10, depois do dia 10), então o 1º pagamento do caixa é no mi 1 e a conta fica uma parcela curta. O mesmo deslocamento explica a dificuldade 5 do consultor (com `inicio` informado, o motor conta 51 e 31 pagas).
- **Sugestão:** quando o dia do início passa do vencimento, subtrair 1 de `restantes` (ou encerrar a linha em `restantes + 1`); ou lançar as parcelas do mês 0 na posição inicial.

### CE-2 — Parcela das dívidas no caixa, depois da liberdade, deixa de ser a do contrato
- **Sintoma:** de mi 53 em diante a casa de campo sai por R$ 4.895 a R$ 7.073 (contrato: 4.000), o apartamento por R$ 7.178 a R$ 11.105 (contrato: 8.216 caindo a 4.197), o consórcio do carro por R$ 2.014 (contrato: 1.645,45). O saldo devedor, porém, cai pelo contrato.
- **Esperado × obtido (exemplo mi 54):** apto 8.216,45 (contrato; a linha do plano diz 8.402,51) × 10.283,06; casa 4.000,00 × 4.895,23; carro 1.645,45 × 2.013,71. Soma do excesso sobre o contrato de mi 53 até a quitação (nominal): apto R$ 503.759; casa R$ 180.809; carro R$ 1.699.
- **Impacto no patrimônio:** R$ 0,00. O gasto total do mês é a renda (seção 5.1); só a rubrica "parcela" está inflada e as outras linhas ficam menores na mesma soma. Mas o extrato mostra uma parcela que o banco não cobra.
- **Origem:** motor, `simula()` (HTML ~2116): `m.scale` multiplica **todas** as linhas de `EXPENSES`, e as parcelas de dívida são linhas comuns do cadastro (`parc_apto`, `parc_casa`, `parc_cons_carro`), entram em `livingAt`. As parcelas das compras de objetivos (`recurTotal`) ficam fora e estão certas.
- **Sugestão:** tratar as linhas que pagam contrato (`bens[].linha`, `cons.linha`, `creditos[].linha`) como recorrentes fixas (como `recurTotal`) e escalar só o consumo.

### CE-3 — Parcela do apartamento lançada ≠ parcela do contrato (antes da liberdade)
- **Sintoma:** erro de até **R$ 326,94 por mês** (mi 1 a 52) entre a linha `parc_apto` e a parcela SAC a 8,99% a.a. recalculada (`4.166,67 + saldo·0,7200%`). A linha é uma escada de 12 em 12 meses (9.806,00 em mi 1-11; 9.455,13 em mi 12-23…) e cai R$ 350,87 por degrau, quando o SAC cai R$ 359,8 por ano.
- **Esperado × obtido:** soma até a quitação: contrato R$ 1.316.285,40; linha R$ 1.349.518,64 (R$ 33.233,24 a mais). No trecho pré-liberdade (mi 1-52): R$ 7.478,41 a mais, que é o impacto real no patrimônio do plano-04.
- **Origem (duas camadas):** (a) motor: `contratoDaDivida` / `financiadoEm` (HTML ~1624-1700) soma o **IOF financiado** (padrão `d.iof || 'financiado'`: R$ 34.161,46) a um contrato de 2022 e calibra a taxa pela parcela de R$ 9.806; resulta 0,6786% a.m. (8,454% a.a.), não os 8,99% do cliente (0,7200% a.m.); a "parcela do banco manda", mas o IOF não deveria ser somado a um contrato já em curso; (b) tradução/portal: a linha de despesa em escada anual.
- **Sugestão:** `iof: 'isento'` (ou ignorar IOF) quando o contrato já está em andamento; gerar a linha de parcela mês a mês a partir do contrato.

### CE-4 — Venda de bem com dívida: a quitação perde uma parcela (não ocorre no plano-04, aparece no estresse)
- **Sintoma (T3/T8):** na venda no mês v, `quitacao = saldoDevedorEm(b, v)` é o saldo **depois** da parcela v, mas a linha de parcela é cortada em v (`cortaLinha`): a parcela do mês da venda nunca é paga. Casa mi 40: quitação 432.000 (o devido antes era 436.000); apto mi 60: 533.106,38 (devido 537.271,28).
- **Esperado × obtido:** R$ 4.000,00 (casa) e R$ 4.164,89 de principal mais cerca de R$ 3.900 de juros do mês (apto) a menos no caixa.
- **Impacto:** patrimônio superestimado em R$ 4,0 mil a R$ 8,1 mil por venda; zero no plano-04.
- **Origem:** `trajetoriaDoBem` (~1782, `venda.quitacao`) combinado com `configure` (~2403, `cortaLinha(it, v)`).
- **Sugestão:** quitar o saldo do mês anterior à venda (`saldoDevedorEm(b, v−1)`) ou manter a parcela do mês v.

### CE-5 — Amortização antecipada abate só 96,66% do valor (não ocorre no plano-04, aparece no estresse)
- **Sintoma (T4/T4b):** adiantar R$ 100.000 no apartamento reduz a dívida em R$ 96.655,56, e o erro (R$ 3.344,45) persiste até a quitação (modo prazo); no modo parcela o erro é de R$ 2.776 em mi 13. Quitação 1 mês depois do esperado. Além disso, o motor não debita o adiantamento do caixa (precisa de linha/compromisso próprio).
- **Origem:** `saldoDevedorEm` (~1845): `B0 · linhas[j−1].saldo / ct.saldoHoje` multiplica também o efeito do adiantamento pela razão saldo informado / saldo do contrato (783.000 / 810.093,14 = 0,96656), que só existe por causa do IOF somado (CE-3) e da diferença de R$ 333 do cliente.
- **Sugestão:** aplicar a escala ao caminho sem extras e abater os adiantamentos em reais; avisar quando `amortizacoes` não tiver a saída de caixa correspondente.

### CE-6 — Troca de taxa da caixinha acontece uma semana depois
- **Sintoma:** na semana que abre o mês da troca (reforma: mi 12, semana de 05/10/2027; apto da Bruna: mi 36, semana de 05/10/2029) o saldo ainda rende 0,5%; o conservador (0,4%) só vale a partir da semana seguinte.
- **Esperado × obtido:** reforma na data R$ 200.356,40 × 200.402,27 (+45,88); apto da Bruna R$ 53.810,40 × 53.822,72 (+12,32). Impacto no patrimônio: +R$ 58,20.
- **Origem:** `simula()` (~1980): o rendimento da semana usa `m.mIdx`, que só é atualizado ao abrir o mês, depois do rendimento. A mesma defasagem vale para qualquer taxa que dependa do mês.
- **Sugestão:** calcular o `mIdx` da semana antes do rendimento.

### CE-7 — Funpresp começa um mês antes da Renata parar (renda em dobro)
- **Sintoma:** a renda do fundo (R$ 4.136,48) entra em mi 52 (fev/2031), mas o último salário da Renata é em mi 52 e a liberdade/aposentadoria dela começa em mi 53.
- **Impacto:** +R$ 4.136,48 (cerca de R$ 6,6 mil capitalizados até mi 170). O saldo na concessão (686.834,26, com 52 contribuições) e o fator implícito (13,837) são coerentes entre si.
- **Origem:** `caixasDePrevidencia` (~1354): `mc = round((aos − hoje)·12)` = 52, enquanto a liberdade acontece na 1ª semana de salário depois dos 57 (mi 53).

### Divergências que não são do motor
- **Dado inconsistente do cliente:** o saldo informado do SAC (783.000) difere do contratual (783.333,33): R$ 333,33; o motor adota o informado e escala o contrato.
- **Consórcio da Bruna com lance embutido:** o crédito utilizável é 700.000 − 70.000 = **630.000**, abaixo do preço de R$ 700.000; os R$ 70.000 que faltam para comprar o imóvel não estão provisionados (o "necessário na data" é só o lance do bolso, R$ 52.868). O cenário reconhece os 630.000 mas espera um imóvel de 700 mil.
- **Erros nos valores esperados do cenário:** 1ª parcela do SAC 11.366 (conta: 11.363,60); lance do bolso 52.867 (conta: 52.867,50; o motor arredonda para cima, 52.868); "participação mês 30: 1.919.544" é arredondamento (1.919.543,80).
- **Tradução do consultor (decisões, não contas):** o 13º da Renata segue o salário (21.500 de 2028 em diante); o desconto de R$ 1.900 do Funpresp considerado fora do líquido (`contribPessoa 0`); o crédito de R$ 150 mil contratado sem necessidade (seção 5.6); filhos nascidos em junho; saída da Bruna em jan/2031.

### Julgamento das "coisas estranhas" do consultor (dificuldades-04.md, seção d)
| Estranheza | Julgamento | Evidência |
|---|---|---|
| Despesas escaladas em mar/2031 (+22,4%, de 54.290 para 64.886) | **Desenho** (padrão de vida segue a renda) com **erro de apresentação** nas parcelas (CE-2). Efeito grande na evolução (seção 5.1). | gasto = renda equivalente 64.886,48 (erro 1,5e-11 em 426 meses); mi 62: o fator sobe de novo porque a parcela da Bruna (não escalada) cai de 6.941,67 para 4.859,17. A afirmação "só volta a 50.000 quando as dívidas acabam (mi 190)" está errada: volta em **mi 170**, quando o Paulo para (gasto 50.000,00 de mi 170 a 478). |
| Parcelas e saldos desencontrados | **Erro de apresentação** (CE-2) | saldo cai pelo contrato; caixa paga a linha escalada. |
| Liberdade "forçada" em mar/2031 | **Desenho** | `forced=true`, sustentável 29.085,47 < 50.000 reproduzidos. O rótulo "Liberdade Financeira" vale para a parada da Renata; o Paulo trabalha até 2041. |
| Dinheiro acaba em mi 479 e `ruina = null` | **Desenho**, distorção relevante (seção 5.2) | cofre sempre ≥ 0 porque o saque é limitado ao caixa. |
| Mês 0 sem entradas/saídas | **Desenho/convenção**; origem da CE-1 | só os `mov_obj_*` aparecem em mi 0. |
| Consórcio a contemplar aparece em previdência | **Desenho** (caixa sem liquidez) | prev mi 0 = 417.800; cai 67.806 na contemplação; a carta (130 mil) entra como `in_pas_3`. |
| Lance da Bruna: `amount` 52.868 e bem pequeno | **Desenho** (seção 5.5) | 52.868 é o lance do bolso; bens do objetivo 402.868 no mi 60 e 649.618 ao final. |
| Crédito de R$ 150 mil sem necessidade | **Tradução do consultor** + o motor não acusa | caixa mínimo sem o crédito: R$ 2,06 mi. |
| Diferença `fin` × patrimônio do cliente | **Desenho** | PGBL (1,2 mi) conta como financeiro; fundo de pensão e consórcio ficam em `prev`. |

## 5. Comportamentos por desenho que o dono do produto deve conhecer

1. **Depois da liberdade da Renata o motor gasta toda a renda.** `gasto = max(renda desejada; renda do mês)` (regra "na aposentadoria o padrão de vida se ajusta à renda disponível"). Com o Paulo ainda trabalhando (mi 53 a 169), o gasto salta de R$ 54.290 (mi 52) para R$ 64.886/mês e a poupança vira zero. Gasto acima do que as linhas do plano (descritas pelo cliente, com parcelas) diriam: **R$ 2.574.038 no total (117 meses)**, ou **R$ 3.146.719 capitalizados a 0,4% até mi 170**; patrimônio no mi 170 de R$ 10,61 mi contra cerca de R$ 13,75 mi se o cliente mantivesse o padrão descrito (+30%). Em mi 170 o gasto cai de 64.886 para 50.000.
2. **O caixa acaba em set/2066 (Paulo com 87,7 anos) sem aviso.** `ruina` só dispara se o cofre fechar o mês negativo, e o saque é limitado ao caixa, então o gasto cai para a renda passiva (R$ 25.136) pelos 148 meses seguintes até os 100,1 anos: 50,3% do desejado, déficit acumulado de R$ 3.679.801 em valores de hoje. A renda sustentável calculada na liberdade (R$ 29.085) já mostrava isso.
3. **Faculdade do Davi: o perfil moderado nunca vale.** Prazo de 24 meses nasce conservador (regra), então perde R$ 3.554,76 frente ao moderado informado; o consultor/cliente não vê isso.
4. **Rendimento por calendário e fórmulas por mês cheio.** O rendimento é semanal; a simulação entrega, na data, R$ 230,76 (sabático), R$ 325,93 (faculdade), R$ 567,29 (reforma) e R$ 174,48 (apto) a menos que a fórmula mensal `projected`/`required` (0,26% a 0,28%), porque o sabático (mi 5) só tem 4,2 meses de rendimento desde 28/10 e não 5.
5. **Consórcio da Bruna: passivo omitido e bem pelo valor pago.** A dívida do consórcio (R$ 416.500 em mi 60, R$ 286.691 depois do lance, R$ 0 em mi 120) não entra em `div`; o bem entra só pela parte da parcela que vira carta (84,03% = 700/833) e pelo lance: R$ 402.868 em mi 60 e R$ 649.618 ao final (contra 630.000 de crédito utilizável e 700.000 de preço). O patrimônio líquido fica conservador, mas as telas mostram bem e dívida diferentes do contrato. O consórcio começa a ser pago em mi 1 (não "hoje") e o lance do bolso (R$ 52.868) sai em mi 60, um mês antes da parcela 61 que o reduz.
6. **Crédito novo sem IOF e sem checagem de necessidade.** O contrato do crédito não calcula IOF (um empréstimo real de R$ 150 mil em 36 parcelas teria cerca de R$ 4.509 de IOF PF). O motor aceita o crédito mesmo com R$ 2,15 mi em caixa: custo no patrimônio de R$ 39.776 (mi 41), R$ 42.926 (mi 60), R$ 50.361 (mi 100) e R$ 66.574 (mi 170) frente a não contratar.
7. **IOF financiado em contrato antigo.** O padrão soma R$ 34.161 de IOF ao apartamento de 2022; a taxa implícita fica em 8,454% a.a. e o saldo é reescalado por 0,9666.
8. **Participação não gera caixa**: os 6% a.a. e os R$ 300 mil são marcação a valor (sem imposto, sem liquidez). Só virariam caixa numa venda.
9. **Teto da dívida e ordem do dinheiro.** Se a reserva fica negativa, primeiro saem as caixinhas dos objetivos e depois o cofre vira dívida a 4% a.m.; a dívida trava em 100× a renda mensal (R$ 3,88 mi) e o excedente some. Não ocorre no plano-04 (caixa mínimo R$ 2,15 mi).
10. **Outros (já apontados pelo consultor):** mês 0 sem fluxo; as taxas e parcelas nominais do cliente (6% da clínica, 8,99%, 1,6% a.m.) são tratadas como reais; uma só expectativa de vida (92 anos do Paulo = 87 da Renata); PGBL de R$ 1,2 mi entra como dinheiro líquido sem imposto.

## 6. Limites desta auditoria

- **Tábua de mortalidade e ETTJ da renda do Funpresp** (R$ 4.136,48/mês): conferi o saldo na concessão (686.834,26), a coerência do fator (13,837 anos-equivalentes, plausível para uma mulher de 57 anos a ~6% real), mas não recalculei a tábua BR-EMS nem a curva da Previc.
- **Regras de desenho** (24 meses conservadores, escala do padrão de vida, teto da dívida, `forced`) foram tomadas como premissas e conferidas quanto à aplicação consistente; se são as regras certas é decisão do produto.
- **Tributação** (IR do PGBL, tributação regressiva, IR sobre o rendimento): o plano não tem `gross`/`tributario`; nada foi conferido.
- **Inflação**: as taxas do cliente (6%, 8,99%, 1,6% a.m.) são tratadas como reais pelo motor; a auditoria confirma a conta, não a hipótese.
- **Caminhos sem uso no plano-04** (venda de bem, amortização antecipada, carência, SAC no crédito novo, seguro prestamista, tarifas) só foram testados nos estresses T1 a T8 listados, com um desvio por vez; não varri todas as combinações.
- **Telas e portal** (como a linha de parcela é gerada, como o consultor vê cada número) não foram auditados; só o motor, o plano e o extrato.
- **Semana de hoje (28/10/2026)**: o motor trata o dia 28 como "depois do dia 5 e do dia 10"; mudar o dia do início muda o mês 0 e o deslocamento da CE-1.
