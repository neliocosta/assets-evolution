# Laudo matemático — Cenário 10 (Pedro e Júlia Lima)

Auditor independente · motor lido de `evolucao-patrimonial.html` (`<script id="engine">`) · código reexecutável: `node ux/auditoria/laudos/auditor-10.js` (49 conferências; grava os números com `AUDIT_OUT=arquivo.json`).
Método: o "esperado" nasce do plano (`planos/plano-10.json`) e de regras de domínio escritas no próprio auditor (calendário, tabelas SAC/consórcio, séries de valor, rendimento, fluxo por data). O "observado" é o extrato (`extratos/extrato-10.json`, regenerado e idêntico byte a byte ao arquivo) e, para a conferência semana a semana, uma nova execução do motor. Fiz minha recontagem (participação, SAC, lance, consórcio, aportes) antes de abrir `dificuldades-10.md`.

---

## 1. Veredito

**A evolução patrimonial calculada pelo motor para este cliente está correta no que importa: participação, dívidas lançadas, fluxo e rendimento batem com o recálculo independente ao centavo. Há duas contas erradas pequenas (um lance de consórcio contado como bem, +R$ 619, e a troca de taxa da caixinha uma semana atrasada, +R$ 263 nas datas) e um desvio de calendário no consórcio sem efeito no total. Nenhuma altera o resultado do cliente (0,07% do patrimônio no fim do horizonte).**

| Frente | Semáforo | Em uma linha |
|---|---|---|
| Participações | **CERTO** | Série mensal, valorização, venda (preço, custos, líquido, destino) e zero depois da venda: erro máximo R$ 0,00 em 823 meses. |
| Dívidas | **CERTO COM RESSALVAS** | SAC do apartamento e parcelas do consórcio exatos (360 + 60 parcelas); ressalvas: lance do consórcio contado inteiro como bem (R$ 619) e a 1ª parcela do consórcio no mês 1 (não no 0). |
| Caixinhas | **CERTO COM RESSALVAS** | 5 caixinhas reproduzidas semana a semana (1.247 semanas) com a taxa certa; a troca para a conservadora acontece 1 semana depois do mês correto (de R$ 0,58 a R$ 222,96 por caixinha, R$ 262,89 no total). |
| Contabilidade geral | **CERTO COM RESSALVAS** | Conservação do dinheiro exata (3.573 semanas, 823 meses); único desvio de patrimônio: os R$ 619,00 do lance, no mês 48. |
| Fluxo | **CERTO** | 6.937 pares linha×mês (822 meses) contra o plano por data de ocorrência: erro R$ 0,00, inclusive mês 0 parcial, 13º, bônus, PJ sazonal, degrau e IPVA. |
| Liberdade | **CERTO COM RESSALVAS** | Gatilho, paradas (222/227), INSS (402/431), sustentabilidade e ausência de ruína corretos; por desenho a renda desejada de 14.000 é gasto total (parcelas incluídas) e o plano sobra muito (financeiro final R$ 24,4 mi). |

---

## 2. Por que a matemática está certa — por frente

### 2.1 Participações (CERTO)

Regras e fórmulas usadas (todas do domínio, escritas no auditor):
- A participação vale `V0 = 90.000` hoje. Os marcos do plano são `alvo` no mês 36 (175.781) e o preço de venda no mês 84 (400.000), que vale como valor esperado no mês da venda. Entre marcos o valor cresce com taxa constante (ritmo geométrico): `V(m) = V0·(A1/V0)^(m/36)` até o mês 36 e `V(m) = A1·(A2/A1)^((m−36)/48)` de 36 a 84.
- Venda no mês 84: líquido = 400.000 − 1% (4.000) − 46.500 = **349.500**, que sai da participação, entra no caixa e é transferido integralmente para a caixinha da casa de campo (o plano só tem esse destino).

Provas (esperado do auditor × motor, `parts[0].serie`, `fim.det.parts`, `fim.part`):

| Mês | Esperado | Motor | Erro |
|---|---|---|---|
| 12 | 112.499,95 | 112.499,95 | 0,00 |
| 24 | 140.624,87 | 140.624,87 | 0,00 |
| 35 | 172.542,51 | 172.542,51 | 0,00 |
| 36 | 175.781,00 | 175.781,00 | 0,00 |
| 37 | 178.818,01 | 178.818,01 | 0,00 |
| 48 | 215.895,68 | 215.895,68 | 0,00 |
| 60 | 265.164,85 | 265.164,85 | 0,00 |
| 83 | 393.206,47 | 393.206,47 | 0,00 |
| 84 | 400.000,00 | 400.000,00 | 0,00 |

- Mês 36: esperado 175.781,00; motor 175.781,00; erro 0,00. Mês 84: esperado 400.000,00; motor 400.000,00; erro 0,00. Erro máximo em 85 meses: 2,9·10⁻¹⁰.
- Mês da venda (84): `out_vendap_0` esperado 50.500,00, motor 50.500,00; `mov_bens` esperado −400.000, motor −400.000; `mov_obj_casacampo` esperado 349.500 + 518 (aporte do mês) = 350.018,00, motor 350.018,00. A valorização do último mês (393.206,47 → 400.000, R$ 6.793,53) é realizada na venda e entra no patrimônio nesse mês: é a mesma valorização que a série do mês 83 para o 84 produziria.
- Do mês 84 ao 822: `fim.part = 0` e `det.parts[0] = 0` (739 meses); não há renda do plano ligada à participação (sem pró-labore nem dividendos), então nada a encerrar.
- Nunca negativa (823 meses).
- Estresse fora do cenário (8 casos, erro máx. 5,5·10⁻¹⁰): taxa positiva e negativa, salto pontual em % e em reais (−R$ 500.000 satura em zero, não fica negativo), taxa + salto no mesmo mês, alvo seguido de taxa, alvo zero, venda sem preço (preço = valor projetado).

### 2.2 Dívidas (CERTO COM RESSALVAS)

**Apartamento (financiamento de objetivo):** `F = 650.000 − 130.000 = 520.000`, SAC, 360 parcelas, `i = 1,102^(1/12) − 1 = 0,8126737% a.m.`, IOF isento. Amortização `F/360 = 1.444,44`; parcela k = amortização + saldo·i; 1ª no mês 60 (a data do objetivo).
- 1ª parcela: esperado **5.670,3475**; motor 5.670,3475; erro 0,00 (o 5.670 do cenário confere). Última (mês 419): 1.456,18. Total pago R$ 1.282.775,50; juros R$ 762.775,50 = Σparcelas − principal; saldo final 0,00 (evento de quitação no mês 419).
- As 360 parcelas do fluxo (`out_fix_apto_compra`) e o zero fora dessa janela: erro máximo 0,00. A moradia (aluguel de 3.800) para exatamente no mês 60, quando a parcela começa.

**Consórcio do carro:** carta 90.000 + 15% = 103.500, 60 parcelas; cada parcela = saldo ÷ parcelas que faltam (amortização 1.725,00); lance de 25% do saldo após a parcela 49 (103.500·11/60 = 18.975,00): **4.743,75**, todo do bolso; o saldo cai para 14.231,25 e as 11 últimas parcelas viram **1.293,75**.
- 60 parcelas do fluxo conferidas (erro 0,00): 49 × 1.725,00 (meses 1 a 49) + 11 × 1.293,75 (meses 50 a 60) = R$ 98.756,25; mais o lance de 4.743,75 = **103.500,00** (carta + taxa).
- Lance: contrato 4.743,75; o motor movimenta 4.744,00 (arredonda para cima, +0,25).

**Dívidas de cadastro, créditos novos, avulsas, IOF, carência, amortização antecipada:** o cenário não tem nenhuma (`fim.div` e `det.divs` = 0 nos 823 meses, por verificação). Para não deixar o campo sem prova, estressei o motor de dívidas com 6 contratos sintéticos (Price e SAC, IOF financiado / à vista / isento, amortização antecipada por prazo e por parcela) contra tabelas próprias, parcela a parcela: erro máximo 0,00. Um deles reproduz o caso que o consultor lançou por engano (`iof: 0` lido como "financiado"): crédito 537.893,20 e 1ª parcela 5.865,46, iguais aos do consultor.

Ressalvas de dívida, detalhadas em 4 e 5: (a) o lance do consórcio entra inteiro como bem (R$ 619); (b) a 1ª parcela do consórcio cai no mês 1; (c) os saldos devedores dessas duas compras nunca aparecem em `fim.div` (por desenho).

### 2.3 Caixinhas (CERTO COM RESSALVAS)

Regra do enunciado: antes dos últimos 24 meses a caixinha rende a taxa do perfil (moderado 0,5%, agressivo 0,6% ao mês); nos últimos 24 meses, a conservadora (0,4%); objetivo com 24 meses ou menos já nasce conservador. Rendimento semanal: `(1 + r)^(7/30,4375)`; aporte na 4ª semana do ciclo; patrimônio dedicado entra na semana de hoje; o líquido da venda entra na semana que abre o mês 84.

Reconstruí cada caixinha **semana a semana** (apto 260, filho 155, carro 208, casa de campo 521, casamento 103 semanas) a partir dos aportes do extrato e da minha grade de calendário (que reproduz as 821 semanas de abertura de mês do motor com erro 0):
- **Com a regra do motor** (a 1ª semana de cada mês ainda usa a taxa do mês anterior): erro máximo **0,00** em todas as semanas das 5 caixinhas. O saldo na data bate (ex.: casa de campo, mês 120: 500.318,33).
- **Com a taxa do mês verdadeiro**: coincide até a 1ª semana do mês da troca e diverge dali (ver 4.2). Casamento: nasce conservador, erro 0,00.
- Mês exato da troca (tabela `taxaPorMes` do extrato, 61/37/49/121/25 meses, erro 0,00 contra a taxa esperada): apartamento mês 36, filho mês 12, carro mês 24, casa de campo mês 96, casamento sem troca. Nenhum mês com taxa diferente da esperada na tabela declarada.
- A venda (R$ 349.500 no mês 84) rende **agressivo (0,6%) nos meses 84 a 95 e conservador (0,4%) de 96 a 120**, exatamente como o cenário esperava.
- Saque na data (erro 0,00): casamento (mês 24) consome 55.000 e devolve 81,75; filho (36) consome 40.000 e devolve 67,88; carro (48) compra o lance 4.744 e devolve 36,78; apartamento (60) paga a entrada de 130.000 e devolve 27.855,56; casa de campo (120) compra 500.000 e devolve 318,33. Caixinha zerada no fim de cada mês da data.
- Regra de aporte "para quando basta" (replicada em base mensal, 288 caixinha-meses, erro 0,00): aporte = mín(planejado, o que falta para alvo×1,01); só o carro tem aporte parcial (R$ 80,995 no mês 47 em vez de 90). A casa de campo recebe os 518 nos 120 meses (falta > planejado sempre).
- Prioridades competindo: nenhum corte de aporte em nenhum mês (programa do motor sem "faltas"; aportes do extrato = planejado em todos os meses de todos os objetivos, salvo o aporte parcial do carro no mês 47). Janeiro a março de 2027 (PJ zerado e IPVA): `mov_cofre` −6.406, +94, +94, caixa nunca abaixo de R$ 31.441 (mês 0).

Impacto se o objetivo ficasse a vida toda em uma só taxa (mesmos aportes), saldo na data:

| Objetivo | Meses | Perfil | Troca no mês | Alvo | Saldo motor | Saldo correto (troca no mês certo) | Excesso do motor | Tudo na taxa do perfil | Tudo conservador |
|---|---|---|---|---|---|---|---|---|---|
| apto | 60 | moderado (0.5%) | 36 | 130.000,00 | 157.855,56 | 157.819,42 | 36,14 | 161.696,33 | 152.351,95 |
| filho | 36 | moderado (0.5%) | 12 | 40.000,00 | 40.067,88 | 40.064,66 | 3,22 | 40.717,20 | 39.986,12 |
| carro | 48 | moderado (0.5%) | 24 | 4.744,00 | 4.780,78 | 4.780,20 | 0,58 | 4.869,70 | 4.750,87 |
| casacampo | 120 | agressivo (0.6%) | 96 | 500.000,00 | 500.318,33 | 500.095,37 | 222,96 | 524.625,07 | 483.393,07 |
| casamento | 24 | moderado (0.5%) | nasce conservador | 55.000,00 | 55.081,75 | 55.081,75 | 0,00 | 55.742,24 | 55.081,75 |

Leitura: a casa de campo é a que mais depende da regra dos 24 meses (agressivo o tempo todo daria R$ 524.625; conservador o tempo todo, R$ 483.393, que deixaria o objetivo 3,3% abaixo do alvo). O motor, com a troca, chega a R$ 500.318 (o "correto" seria R$ 500.095).

### 2.4 Contabilidade geral e rendimento do caixa (CERTO COM RESSALVAS)

- Patrimônio = financeiro + bens + participações + previdência − dívidas, onde financeiro = caixa + Σ caixinhas: `fin = cofre + Σobj` com erro 0 nos 823 meses; sem NaN, sem Infinity, sem saldos negativos (caixinha, bens, participação, dívida), sem cheque especial. Menor caixa R$ 31.441,09 (mês 0); menor financeiro R$ 155.547,69.
- Transferências somam zero: `mov_cofre = (entradas − saídas) − Σ mov_obj − mov_bens` em cada uma das 3.573 semanas e nos 823 meses (erro 2,9·10⁻¹¹).
- Variação mensal do patrimônio líquido = entradas − saídas + rendimento + valorização da participação + parte da parcela reconhecida como bem: erro máximo **0,00** em 822 meses (com a regra do motor para o lance). Com a regra de domínio para o lance, o único desvio é +R$ 619,00 no mês 48 (4.1).
- **Convenção de rendimento (frente E).** O caixa livre rende 0,4% a.m. (taxa do plano, padrão do motor), em base semanal `(1,004)^(7/30,4375)`, sobre o saldo do fim da semana anterior, apenas se positivo; entradas, saídas e aportes entram no fim da semana, sem render na semana em que ocorrem. Conferido semana a semana (3.572 semanas): `Δfin = entradas − saídas − compras de bens + rendimento do caixa + rendimento das caixinhas`, erro 0,00 com a taxa que o motor aplica. Com a taxa do mês verdadeiro, 202,47 de diferença máxima, só na 1ª semana de cada mês de troca (4.2). O patrimônio dedicado do apartamento (120.000) entra na semana de hoje e já rende nela.

### 2.5 Fluxo (CERTO)

Recalculei cada linha do plano por data de ocorrência (ano, mês, dia → semana da grade) e comparei com `fluxo.in_*`/`out_*` de cada mês (822 meses; o 823º é o corte do horizonte, com 1 semana de 4):
- Salário 11.000 (dia 5), degrau para 13.000 no mês 17 (março/2028); 13º = um salário do mês de dezembro, por `segue` (13.000 a partir de dez/2028: premissa do consultor); bônus de 12.000 a cada 6 meses a partir de dez/2026 (meses 2, 8, 14…); PJ do Pedro 2.500 de abril a novembro (0 de dezembro a março); Júlia 8.500 de abril a agosto, 5.250 de setembro a março; aluguel 2.200 todo mês; IPVA 6.500 em janeiro (mês 3, 15, 27…); moradia 3.800 até o mês 59; transporte, saúde, alimentação, lazer, outros; parcelas.
- Mês 0 (outubro/2026) é parcial por desenho: "hoje" 14/10 vira a semana de 17/10 (W0 = 1646) e só entra o que ocorre dessa semana em diante: alimentação/lazer/outros pela metade (semanas 3 e 4 do ciclo), saúde inteira (semana 4); sem salário, aluguel, PJ, moradia, transporte. O auditor reproduz isso exatamente.
- Após a liberdade (mês 222 em diante): Pedro para no 222, Júlia no 227, INSS de 6.000 e 3.500 nos meses 402 e 431, gastos escalados por `(14.000 − parcela do mês) ÷ (Σ linhas + IPVA/12)`: erro 0,00 nos 600 meses.
- Erro máximo: entradas R$ 0,00 (2.280 pares) e saídas R$ 0,00 (4.657 pares).
- Média mensal conferida com o cenário: receita média dos meses 1 a 12 = R$ 24.387,50 (cenário ≈ 24.390); gasto médio sem parcelas = R$ 13.341,67 (cenário 13.342).

### 2.6 Liberdade financeira, ruína, aposentadoria (CERTO COM RESSALVAS)

- Gatilho: primeiro mês cuja semana de abertura já tem 50 anos (Pedro) = 222 (idade 50,0014); esperado 222. Júlia aos 48 = mês 227 (última renda dela no 226); Pedro: última renda no 221. INSS: primeiro mês com 65 anos: Pedro 402, Júlia 431 (iguais ao plano).
- Financeiro na liberdade: R$ 3.964.820,52. `maxGap` = 14.000 − aluguel 2.200 = 11.800 (depois que Júlia para e antes do INSS); sustentável = 3.964.820,52·0,4% + (14.000 − 11.800) = **18.059,28**, igual ao motor. `forced = false`, `ruina = null`.
- O financeiro nunca zera: mínimo depois da liberdade R$ 3.973.036 e R$ 24.360.788 aos 100 anos (valores reais).
- Depois da liberdade o motor gasta exatamente a renda desejada, parcelas incluídas (média de 12 meses = 14.000 ± 1,67). A escala dos gastos sobe de 1,072 (mês 222, com a parcela do apartamento em 3.769) para 1,467 depois que o financiamento acaba (mês 420+), quando alimentação passa de 2.600 para 3.815 e a soma das linhas (sem IPVA) de 9.000 para 13.205.
- Decisão: as "despesas escaladas" não são erro de motor. São a regra "gasta o que a renda desejada diz" aplicada de forma consistente (identidade conferida em todos os meses). Distorção para o cliente: o padrão de vida subentendido cresce 46,7% em termos reais quando o apartamento quita; não afeta a solvência (financeiro sobe de 3,97 mi para 24,4 mi). Detalhe em 5.

### 2.7 Fidelidade ao cliente e ao "Para o auditor" (frente H)

| Quantidade | Valor do cenário | Motor | Diferença | De onde vem |
|---|---|---|---|---|
| Startup, valor no mês 36 | 170.561,00 | 175.781,00 | 5.220,00 | o esperado do cenário supõe curva única de 90.000 a 400.000; o plano lançou o marco de 25% a.a. × 3 anos (175.781) e o motor o cumpre |
| Startup, valor no mês 60 | 261.198,00 | 265.164,85 | 3.966,85 | idem: 175.781 → 400.000 em 48 meses |
| Startup, valor no mês 84 | 400.000,00 | 400.000,00 | 0,00 |  |
| Líquido da venda | 349.500,00 | 349.500,00 | 0,00 |  |
| Casa de campo: componente da venda na data (base mensal × semanal do calendário) | 413.268,00 | 413.790,39 | 522,39 | a mão: 12 meses a 0,6% + 24 a 0,4%; no calendário real são 157 semanas = 36.11 meses |
| Casa de campo: aporte necessário | 518,00 | 517,97 | -0,03 | planejado 518 |
| Consórcio: lance do bolso | 4.744,00 | 4.744,00 | 0,00 | amount da caixinha = teto de 4.743,75 |
| SAC do apartamento: 1ª parcela (mês 60) | 5.670,00 | 5.670,35 | 0,35 |  |
| Casamento: aporte necessário | 2.188,00 | 2.188,00 | 0,00 | planejado 2.189 |
| Filho: aporte necessário | 1.033,00 | 1.033,25 | 0,25 | planejado 1.034 |
| Consórcio: aporte necessário | 89,00 | 89,30 | 0,30 | planejado 90 |
| Apartamento: aporte necessário (cenário: sem patrimônio dedicado) | 1.900,00 | 0,00 | -1.900,00 | o plano dedica 120.000 (premissa P2 do consultor): aporte 0 e a caixinha chega a 157.856 |
| Receita média mensal (meses 1 a 12) | 24.390,00 | 24.387,50 | -2,50 |  |
| Gasto médio mensal (meses 1 a 12, sem parcelas) | 13.342,00 | 13.341,67 | -0,33 | IPVA anual incluído |
| Sobra média antes de aportes (meses 1 a 12) | 11.000,00 | 9.320,83 | -1.679,17 | o "≈ 11.000" do cenário não desconta as parcelas do consórcio (1.725); com elas a sobra é 9.320,83 |

Leitura das diferenças:
1. **Startup mês 36/60:** o "esperado" do cenário (170.561 / 261.198) supõe que o motor ignora a taxa e usa uma curva única de 90.000 a 400.000. O consultor traduziu o que o cliente disse ("25% ao ano por 3 anos, depois 400.000 em 7 anos") lançando um marco de 175.781 no mês 36; o motor cumpre o plano e o cliente (175.781 é exatamente o que ele espera). **Erro do valor esperado do cenário, não do motor.** (O estresse S9.2 confirma que, com taxa + preço de venda sem o marco, o motor dá 170.560,54 no mês 36, 23,75% a.a. implícitos.)
2. **Casa de campo, componente da venda na data:** a mão 413.268 (12 meses + 24 meses); no calendário real da grade são 157 semanas = 36,11 meses, e o auditor dá 413.790. Diferença de calendário, não de conta.
3. **Aporte da casa de campo:** 517,97 exato; plano 518. **Casamento/filho/carro:** idem, arredondados para cima.
4. **Apartamento:** o cenário calcula 1.900/mês sem patrimônio dedicado; o consultor dedicou R$ 120.000 e o aporte vai a zero (a caixinha chega a 157.856 para uma entrada de 130.000).
5. **Sobra média ≈ 11.000:** o cenário não desconta a parcela do consórcio (1.725/mês nos meses 1 a 60); com ela, a sobra antes dos aportes é R$ 9.320,83. Erro do valor esperado do cenário.
6. Aporte necessário somado do cenário ≈ 5.700; o plano aporta 3.831 (sem o apartamento, coberto pelo dedicado).
7. Datas do cliente (mês 24 = out/2028 … mês 120 = out/2036; startup mês 84 = out/2033; promoção mês 17 = mar/2028; Pedro 50 anos = abr/2045) conferidas contra o calendário próprio.

---

## 3. Conferências realizadas

| # | O que foi conferido | Método | Amostra | Erro máximo (R$) | Resultado |
|---|---|---|---|---|---|
| 1 | S0.1 — Calendário: semana de abertura de cada mês (semana com o dia 5) e mês 0 | grade semanal própria ancorada no nascimento (1995-04-01, sábado); W0 = round(idade·52,18) | 821 meses | 0,00 | OK — W0=1646 (semana de 2026-10-17), mês 0 = 2026-10 |
| 2 | S0.2 — Reprodutibilidade: motor reexecutado = extrato-10.json | comparação byte a byte dos 823 meses | 823 meses | 0,00 | OK |
| 3 | S1.1 — Participação: série mensal do valor (marcos 36 → 175.781 e 84 → 400.000, ritmo geométrico) | V(m)=V0·(Alvo/V0)^(m/36) e 175.781·(400.000/175.781)^((m−36)/48), recalculado | 85 meses (0..84) | 0,00 | OK |
| 4 | S1.2 — Participação: fim.det.parts e fim.part em todos os meses (zero depois da venda) | comparação mensal com a série própria; depois do mês 84 esperado 0 | 823 meses | 0,00 | OK |
| 5 | S1.3 — Participação: nunca negativa | varredura dos 823 meses | 823 meses | 0,00 | OK |
| 6 | S1.4 — Venda (mês 84): preço, custos (1% + R$ 46.500), líquido, saída da participação e destino do líquido | preço 400.000 − 4.000 − 46.500 = 349.500; mov_bens = −400.000; mov_obj_casacampo = 349.500 + 518 | 1 mês (84) + parts[0].venda | 0,00 | OK — líquido esperado 349.500,00 × motor 349.500,00 |
| 7 | S1.5 — Depois da venda: participação = 0 e nenhuma renda ligada continua | busca de linhas de renda ligadas à participação no plano + fim.part=0 de 84 a 822 | 739 meses | 0,00 | OK — o plano não liga renda à participação (sem pró-labore/dividendos) |
| 8 | S2.1 — Apartamento (SAC 520.000, 360x, 10,2% a.a.): parcela de cada mês no fluxo | i=(1,102)^(1/12)−1; parcela=520.000/360 + saldo·i; 1ª no mês 60 | 360 parcelas (meses 60 a 419) + zero fora | 0,00 | OK — 1ª parcela esperada 5.670,35; motor 5.670,35 |
| 9 | S2.2 — Apartamento: total pago, juros = Σparcelas − principal e quitação em zero | Σ parcelas esperada vs fluxo; saldo final da tabela | 360 parcelas | 0,00 | OK — juros totais 762.775,50 (Σjuros=762.775,50), saldo final 0,00 |
| 10 | S2.3 — Consórcio do carro: parcela de cada mês (1.725 até a 49ª; 1.293,75 nas 11 seguintes) | saldo/parcelas que faltam; lance 25% do saldo pós-parcela 49 reduz o saldo (prazo mantido); parcelas nos meses 1..60 | 60 parcelas + zero fora | 0,00 | OK — Σ parcelas 98.756,25 (+ lance 4.743,75 = 103.500,00 = carta+taxa) |
| 11 | S2.4 — Consórcio: lance do bolso (25% do saldo após a parcela 49) | saldo 103.500·(60−49)/60 = 18.975 → 25% = 4.743,75; motor usa o teto inteiro | 1 evento (mês 48) | 0,00 | OK — lance do contrato 4.743,75; motor move 4.744,00 (arredonda para cima, +0,25) |
| 12 | S2.5 — Dívidas de cadastro (financiamentos de bens, avulsas, créditos novos): nenhuma no plano; fim.div e det.divs = 0 em todos os meses | leitura do plano + varredura | 823 meses | 0,00 | OK — IOF, carência, amortização antecipada e dívida avulsa NÃO são exercidos por este cenário (ver S9 para o estresse) |
| 13 | S3.1 — Bens: o motor reproduz o "lance do consórcio inteiro como ativo" (regra do motor, não a do domínio) | bens = 335.000 + parcelas·carta/total + lance cheio (4.744) + entrada + amortização SAC + 500.000 | 823 meses | 0,00 | OK — confirma que a diferença abaixo vem do lance, e só dele |
| 14 | S3.2 — Bens: valor esperado pela regra do domínio (lance compra só carta/total do carro; o restante é taxa de administração) | bens = 335.000 + parcelas·(90.000/103.500) + lance·(90.000/103.500) + 130.000 + amortização SAC + 500.000 | 823 meses | 619,00 | **DESVIO** — DIFERENÇA de 619,00 a partir do mês 48: o motor tem bens a MAIS |
| 15 | S4.1a — Caixinha apto: saldo semana a semana (260 semanas), regra do motor (1ª semana do mês ainda na taxa anterior) | bal(i)=bal(i−1)·(1+r)^(7/30,4375) + aportes na 4ª semana do ciclo [+dedicado na semana de hoje, +líquido da venda na semana 84] | 260 semanas | 0,00 | OK |
| 16 | S4.1b — Caixinha apto: saldo na data, taxas por mês e mês da troca | taxa esperada: 0.5% até o mês 35, 0,4% a partir do mês 36; taxaPorMes do extrato | 61 meses de taxa + 1 saldo | 0,00 | OK — troca no mês 36; diferença no saldo na data pela regra da semana: -36,14 (rendimento a mais do motor) |
| 17 | S4.2a — Caixinha filho: saldo semana a semana (155 semanas), regra do motor (1ª semana do mês ainda na taxa anterior) | bal(i)=bal(i−1)·(1+r)^(7/30,4375) + aportes na 4ª semana do ciclo [+dedicado na semana de hoje, +líquido da venda na semana 84] | 155 semanas | 0,00 | OK |
| 18 | S4.2b — Caixinha filho: saldo na data, taxas por mês e mês da troca | taxa esperada: 0.5% até o mês 11, 0,4% a partir do mês 12; taxaPorMes do extrato | 37 meses de taxa + 1 saldo | 0,00 | OK — troca no mês 12; diferença no saldo na data pela regra da semana: -3,22 (rendimento a mais do motor) |
| 19 | S4.3a — Caixinha carro: saldo semana a semana (208 semanas), regra do motor (1ª semana do mês ainda na taxa anterior) | bal(i)=bal(i−1)·(1+r)^(7/30,4375) + aportes na 4ª semana do ciclo [+dedicado na semana de hoje, +líquido da venda na semana 84] | 208 semanas | 0,00 | OK |
| 20 | S4.3b — Caixinha carro: saldo na data, taxas por mês e mês da troca | taxa esperada: 0.5% até o mês 23, 0,4% a partir do mês 24; taxaPorMes do extrato | 49 meses de taxa + 1 saldo | 0,00 | OK — troca no mês 24; diferença no saldo na data pela regra da semana: -0,58 (rendimento a mais do motor) |
| 21 | S4.4a — Caixinha casacampo: saldo semana a semana (521 semanas), regra do motor (1ª semana do mês ainda na taxa anterior) | bal(i)=bal(i−1)·(1+r)^(7/30,4375) + aportes na 4ª semana do ciclo [+dedicado na semana de hoje, +líquido da venda na semana 84] | 521 semanas | 0,00 | OK |
| 22 | S4.4b — Caixinha casacampo: saldo na data, taxas por mês e mês da troca | taxa esperada: 0.6% até o mês 95, 0,4% a partir do mês 96; taxaPorMes do extrato | 121 meses de taxa + 1 saldo | 0,00 | OK — troca no mês 96; diferença no saldo na data pela regra da semana: -222,96 (rendimento a mais do motor) |
| 23 | S4.5a — Caixinha casamento: saldo semana a semana (103 semanas), regra do motor (1ª semana do mês ainda na taxa anterior) | bal(i)=bal(i−1)·(1+r)^(7/30,4375) + aportes na 4ª semana do ciclo [+dedicado na semana de hoje, +líquido da venda na semana 84] | 103 semanas | 0,00 | OK |
| 24 | S4.5b — Caixinha casamento: saldo na data, taxas por mês e mês da troca | taxa esperada: 0.5% até o mês -1, 0,4% a partir do mês 0; taxaPorMes do extrato | 25 meses de taxa + 1 saldo | 0,00 | OK — troca no mês —; diferença no saldo na data pela regra da semana: 0,00 (rendimento a mais do motor) |
| 25 | S4.1c — Caixinha apto: saldo semana a semana com a taxa do MÊS VERDADEIRO de cada semana (troca no mês certo) | mesmo modelo, mas a 1ª semana do mês já usa a taxa do mês | 260 semanas | 36,10 | **DESVIO** — primeira diferença na semana 1800 (1ª semana do mês 36); saldo na data fica 36,14 acima do correto |
| 26 | S4.2c — Caixinha filho: saldo semana a semana com a taxa do MÊS VERDADEIRO de cada semana (troca no mês certo) | mesmo modelo, mas a 1ª semana do mês já usa a taxa do mês | 155 semanas | 3,21 | **DESVIO** — primeira diferença na semana 1696 (1ª semana do mês 12); saldo na data fica 3,22 acima do correto |
| 27 | S4.3c — Caixinha carro: saldo semana a semana com a taxa do MÊS VERDADEIRO de cada semana (troca no mês certo) | mesmo modelo, mas a 1ª semana do mês já usa a taxa do mês | 208 semanas | 0,58 | **DESVIO** — primeira diferença na semana 1748 (1ª semana do mês 24); saldo na data fica 0,58 acima do correto |
| 28 | S4.4c — Caixinha casacampo: saldo semana a semana com a taxa do MÊS VERDADEIRO de cada semana (troca no mês certo) | mesmo modelo, mas a 1ª semana do mês já usa a taxa do mês | 521 semanas | 222,76 | **DESVIO** — primeira diferença na semana 2061 (1ª semana do mês 96); saldo na data fica 222,96 acima do correto |
| 29 | S4.5c — Caixinha casamento: saldo semana a semana com a taxa do MÊS VERDADEIRO de cada semana (troca no mês certo) | mesmo modelo, mas a 1ª semana do mês já usa a taxa do mês | 103 semanas | 0,00 | OK |
| 30 | S4.6 — Regra de aporte: aporte = mín(planejado, o que falta para o alvo com 1% de folga), mês a mês; o último aporte do carro é parcial | replicação própria do programa em base mensal (taxa verdadeira por mês) vs mov_obj_* do extrato | 288 caixinha-meses | 0,00 | OK — o aporte da casa de campo (518) não para: falta > planejado em todos os 120 meses |
| 31 | D.8 — Prioridades competindo: nenhum aporte foi cortado (inclusive em jan a mar, com IPVA e PJ do Pedro zerado) | faltas do programa do motor (observado) + aportes do extrato contra o planejado em cada mês de cada objetivo | 120 meses × 5 objetivos | 0,00 | OK — caixa de jan/27 a mar/27: mov_cofre -6.406,00 | 94,00 | 94,00; menor caixa do plano 31.441,09 |
| 32 | S4.7 — Saque na data: consumo sai como despesa (55.000; 40.000), bem vira ativo (4.744; 130.000; 500.000), caixinha zera e o resto volta ao caixa | out_obj_*/mov_bens no mês da data = alvo; fim.obj[k] = 0 | 5 objetivos | 0,00 | OK |
| 33 | A.1 — Transferências somam zero: mov_cofre = (entradas − saídas) − Σmov_obj − mov_bens, em cada semana | identidade contábil sobre f de cada semana do motor | 3573 semanas | 0,00 | OK |
| 34 | A.2 — A mesma identidade nos 823 meses do extrato | soma mensal das linhas in_/out_/mov_ | 823 meses | 0,00 | OK |
| 35 | A.3 — fin = cofre + Σcaixinhas; sem NaN/Infinity; sem saldos negativos (caixinhas, bens, participação, dívida); sem cheque especial | varredura dos 823 meses | 823 meses | 0,00 | OK — menor caixa 31.441,09, menor financeiro 155.547,69 |
| 36 | E.1 — Rendimento do financeiro (semana a semana): Δfin = entradas − saídas − compras de bens + caixa·((1+0,4%)^(7/30,4375)−1) + Σcaixinha·((1+r)^(7/30,4375)−1) | identidade com a taxa que o motor declara (inclui a primeira semana do mês na taxa do mês anterior) | 3572 semanas | 0,00 | OK — convenção: o rendimento da semana incide sobre o saldo do FIM da semana anterior; entradas/saídas/aportes entram no fim da semana, sem render na semana em que ocorrem |
| 37 | E.2 — O mesmo, mas com a taxa do MÊS VERDADEIRO da semana (regra do domínio: troca no mês certo) | idem com mi = mês a que a semana pertence | 3572 semanas | 202,47 | **DESVIO** — diverge na semana 2061 (primeira semana de um mês de troca de taxa) |
| 38 | A.4 — Patrimônio líquido (fin + bens + part + prev − div): variação mensal = entradas − saídas + rendimento + valorização + amortização reconhecida | identidade mensal; amortização e valorização calculadas por tabelas/ séries próprias; rendimento pelas taxas do motor | 822 meses | 0,00 | OK — regra do motor: o lance do consórcio entra todo como ativo (transferência neutra) |
| 39 | A.5 — O mesmo, impondo a regra do domínio (a taxa de administração do lance é despesa) | idem, com −619 no mês 48 | 822 meses | 619,00 | **DESVIO** — único desvio: mês 48, patrimônio do motor R$ 619,00 acima |
| 40 | F.1 — Entradas: salário (degrau em mar/2028 = mês 17), 13º (segue o salário), bônus semestral (dez/jun), PJ do Pedro (abr a nov), Júlia (abr a ago 8.500; set a mar 5.250), aluguel, INSS; paradas em 222/227 | cada linha recalculada do plano por data de ocorrência; mês 0 só conta datas a partir da semana de hoje | 2280 pares linha×mês (822 meses; o 823º é o corte do horizonte) | 0,00 | OK |
| 41 | F.2 — Saídas: moradia (até o mês 59), transporte, saúde, alimentação/lazer/outros, IPVA em janeiro, parcelas do consórcio e do apartamento; após a liberdade, gastos escalados | idem; pós-liberdade: escala=(14.000 − parcelas)/(Σ linhas + IPVA/12) | 4657 pares linha×mês (822 meses) | 0,00 | OK |
| 42 | G.1 — Liberdade financeira no primeiro mês cuja semana de abertura já tem 50 anos (Pedro) | idade da semana = semana/52,18; menor mês com idade ≥ 50 | 1 evento | 0,00 | OK — mês 222, idade 50.0014 (esperado 222) |
| 43 | G.2 — Júlia para aos 48 (mês 227): última renda dela no mês 226; Pedro: última no mês 221 | idade exata a partir de 1997-09; renda ativa para no mês da idade | 2 marcos | 0,00 | OK — Júlia para no mês 227; última renda 226 |
| 44 | G.3 — Depois da liberdade o motor gasta, em média, exatamente a renda desejada (14.000/mês, parcelas incluídas) | média de 12 meses das saídas de consumo (out_adj/out_fix) nos anos completos | 14 janelas de 12 meses | 1,67 | OK — diferença máxima 1,67 (a escala muda mês a mês com a parcela; o IPVA cai todo em janeiro) |
| 45 | G.4 — Liberdade: maxGap e rendimento sustentável do motor | maxGap = 14.000 − aluguel (2.200) = 11.800 após Júlia parar e antes do INSS; sustentável = financeiro·0,4% + (14.000 − maxGap) | 1 cálculo | 0,00 | OK — financeiro na liberdade 3.964.820,52; sustentável 18.059,28/mês vs 14.000 pedidos |
| 46 | G.5 — Ruína: o financeiro nunca zera nem fica negativo depois da liberdade; `ruina` = null; forced = false | mínimo do financeiro de 222 a 822 | 601 meses | 0,00 | OK — menor financeiro depois da liberdade 3.973.036,45; no mês 822: 24.360.788,09 |
| 47 | G.6 — INSS: começa no 1º mês em que cada um tem 65 anos (Pedro 402, Júlia 431) e entra no fluxo líquido (6.000; 3.500) a partir dali | idade a partir do nascimento de cada um; startMi do plano; F.1 confere os valores nos meses | 2 marcos | 0,00 | OK — Pedro: 402 (plano 402); Júlia: 431 (plano 431) |
| 48 | S9.1 — Estresse de dívidas (fora do cenário): Price/SAC, IOF financiado/à vista/isento, amortização antecipada por prazo e por parcela | tabelas próprias vs contratoDaDivida do motor (como observado) | 6 contratos, parcela a parcela | 0,00 | OK |
| 49 | S9.2 — Estresse de participações (fora do cenário): taxa, taxa negativa, saltos pontuais, queda a zero, alvo seguido de taxa, venda sem preço | séries próprias vs trajetoriaDaParticipacao do motor (como observado) | 8 casos, mês a mês | 0,00 | OK |

Todos os desvios estão detalhados na seção 4. As linhas "a/b/c" de cada caixinha separam a regra do motor (a) da taxa declarada (b) e da regra do domínio (c).

---

## 4. Contas erradas encontradas

### 4.1 Lance do consórcio contado inteiro como bem (+R$ 619,00 de patrimônio, para sempre)

- **Sintoma:** o bem "carro" soma R$ 90.619,00 no fim do consórcio, não R$ 90.000,00. `fim.bens` do mês 48 em diante está R$ 619,00 acima do correto; no mês 822, 1.575.619,00 contra 1.575.000,00. O patrimônio líquido do mês 48 também sobe 619,00 em relação à identidade do domínio (A.5).
- **Meses:** do 48 ao 822. **Esperado × obtido:** bens do carro 90.000,00 (= 85.875 em parcelas reconhecidas a 87% + 4.125 do lance a 87%) × 90.619,00 (85.875 + 4.744 do lance cheio). **Impacto em R$:** 619,00 no mês 48; 1.239,81 no mês 222 (rendido a 0,4% a.m. no caixa); 13.601,42 no mês 822 (0,06% do financeiro final).
- **Regra violada:** cada real pago ao consórcio compra `carta ÷ (carta + taxa)` = 90.000 ÷ 103.500 = 87% de carta; os 13% restantes são taxa de administração (despesa). As parcelas respeitam isso (`parteBem`); o lance, não: o lance de 4.743,75 compra 4.125,00 de carro e 618,75 de taxa, e o motor ainda arredonda o lance para 4.744 (+0,25).
- **Origem provável: motor.** `simula()` na realização do objetivo, `evolucao-patrimonial.html` linha 2045: `else if (o.kind === 'bem') { bens += o.amount; cofre -= o.amount; transfer(f, 'mov_cofre', 'mov_bens', o.amount, …)`, onde `o.amount` do consórcio é o lance do bolso (`derive`, linha 1252: `o.amount = Math.ceil(cp.necessario)`). As parcelas pelo contrato usam `parteBem` (linhas 2034 e 2035); o lance não.
- **Sugestão (não aplicada):** para consórcio, `bens += lance × cp.carta ÷ cp.ct.financiado` (o lance multiplicado por `parteBem`, como nas parcelas) e lançar o restante como despesa de taxa (`out_…`); ou reconhecer o carro de uma vez pela carta na contemplação. Usar o lance sem arredondar para o cálculo contábil.

### 4.2 Troca para a taxa conservadora atrasada em uma semana

- **Sintoma:** na 1ª semana do mês em que a taxa deveria trocar (apartamento 36, filho 12, carro 24, casa de campo 96) o saldo ainda rende a taxa do perfil. A tabela `taxaPorMes` do extrato está certa (troca no mês exato); a simulação não a aplica na semana de abertura do mês.
- **Semanas:** 1.800, 1.696, 1.748 e 2.061. **Esperado × obtido (saldo na data):** apartamento 157.819,42 × 157.855,56; filho 40.064,66 × 40.067,88; carro 4.780,20 × 4.780,78; casa de campo 500.095,37 × 500.318,33; casamento sem diferença (nasce conservador).
- **Impacto no patrimônio:** +R$ 36,14 + 3,22 + 0,58 + 222,96 = **R$ 262,89 nas datas**; com o rendimento posterior do caixa, R$ 411,93 no mês 222 e R$ 4.519,09 no mês 822.
- **Origem provável: motor.** `simula()`, linha 1980: `obj = obj.map((b, k) => b * Math.pow(1 + taxaNoMes(TX[k], m ? m.mIdx : 0), 7 / 30.4375))` roda no início da semana, antes de `m = { t, mIdx: … }` (linha 2096) ser atualizado para o novo mês; na semana que abre o mês `m.mIdx` ainda é o do mês anterior. Regra violada: troca da taxa no mês certo (24 meses conservadores exatos).
- **Sugestão (não aplicada):** calcular o mês da semana (dia 5 da semana) antes do rendimento e usá-lo em `taxaNoMes`.

### 4.3 Consórcio: 1ª parcela no mês 1, não no mês 0 ("começando hoje")

- **Sintoma:** o plano diz `compra.inicio: 0`. A tabela do contrato pressupõe parcela 1 no mês 0 e lance após a parcela 49 no mês 48. No fluxo, as 60 parcelas ocorrem nos meses 1 a 60 (a 60ª no mês 60, junto com a 1ª do apartamento) e o lance sai do caixa no mês 48, mas a tabela só reduz as parcelas do mês 50 em diante (a parcela 49 do mês 49 ainda é 1.725).
- **Esperado × obtido:** 1ª parcela no mês 0 (esperado) × mês 1; última no mês 59 × 60; redução da parcela a partir do mês 49 (parcela 50 do contrato) × a partir do mês 50. Total pago igual (R$ 103.500,00); o que muda é a data: R$ 1.725 deslocados de 0 para 1; lance e parcelas ficam um mês fora de fase (o lance de 4.743,75 está certo para a parcela 49; se a 1ª parcela é no mês 1 e a contemplação no 48, o saldo base seria o da parcela 48, 20.700, e o lance, 5.175,00: R$ 431,25 de diferença).
- **Impacto:** pequeno, de calendário (≈ R$ 19 por mês de rendimento sobre 4.744 e 1.725). **Origem provável: motor** (a semana 1 do ciclo do mês 0 é anterior a "hoje", e o início do consórcio só é avaliado com `t >= 0`, linha 2034, então a parcela do mês 0 nunca é lançada), combinada com **dado do cliente ambíguo** ("começando hoje" não diz se a 1ª parcela já foi paga). **Sugestão:** assumir que a parcela do mês 0 já foi paga (e mover o ponto do lance para a parcela 48) ou permitir o vencimento do mês 0 fora da janela parcial.

### 4.4 Erros dos valores esperados do cenário (não do motor)

- Startup mês 36 = R$ 170.561 e mês 60 = R$ 261.198 (supõem curva única; o plano tem o marco de 25% × 3 anos: 175.781 e 265.164,85).
- "Sobra média ≈ R$ 11.000" não desconta o consórcio (R$ 9.320,83 reais).
- "Soma ≈ R$ 5.700 de aportes": inclui R$ 1.900 do apartamento, que o plano cobre com o patrimônio dedicado.
- "Parcelas do consórcio no mês 0": o motor começa no mês 1 (4.3).

### 4.5 Julgamento das "coisas estranhas" do consultor

| Estranheza | Veredito | Evidência |
|---|---|---|
| Mês 0 sem receitas e com despesas pela metade | **Desenho do motor**, correto | "Hoje" 14/10 vira a semana de 17/10; só entram datas a partir dela. Reproduzido exatamente (F.1/F.2, erro 0,00). Fragilidade real em 5.4. |
| Mês 0 depende do dia da semana do nascimento (D1) | **Desenho do motor** | Com `inicio: 2026-10-29` o mês 0 vira novembro (W0=1648); confirmei. |
| `iof: 0` lido como financiado (R$ 17.893) | **Erro de tradução** + campo não documentado | Cálculo próprio do IOF financiado: crédito 537.893,20, parcela 5.865,46 (igual ao do consultor). |
| `taxa` ignorada quando a venda tem preço (D3) | **Desenho do motor** | Marco implícito até a venda; sem o marco o motor dá 170.560,54 no mês 36. Troca por `alvo` correta. |
| Bens e dívidas "líquidos": `div` = 0 e entrada, não o imóvel de 650.000 | **Desenho do motor** | Patrimônio líquido correto (A.4); bruto subestimado. 5.1. |
| Apartamento: R$ 158 mil saem da caixinha para uma entrada de R$ 130 mil; aporte 0 e barra a 122% | **Erro de tradução** (premissa P2) | Motor correto (S4.1, S4.7): sobra devolvida de R$ 27.855,56. |
| Lance R$ 4.744 aparece como "necessário na data" | **Desenho do motor** (rótulo) | Correto: 25% de 18.975 = 4.743,75 (S2.4). |
| Consórcio e apartamento acabam/começam no mesmo mês 60 | **Erro de motor (calendário)** | 4.3: a 60ª parcela deveria cair no mês 59. |
| Aluguel recebido continua depois da liberdade; sem vacância | **Desenho do motor** | F.1 confere 2.200 em todos os meses. |
| Financeiro de R$ 3,93 mi aos 50 e sustentável 17.908 | Números **não batem com o extrato atual** (3.964.820,52 e 18.059,28); conclusão do consultor (sobra muito) **confirmada** | G.4/G.5. Os valores do relatório do consultor parecem de uma execução anterior. Idem 425.619 → 557.113 (hoje: 424.494 → 557.063,44) e 158.254/158.041 (hoje 157.855,56). |
| IPVA e 13º em meses consecutivos; caixa nunca negativo | Correto | F.1; menor caixa 31.441,09. |
| Lance 25% do saldo "tudo do bolso" | Conta certa, **contabilização com 619 a mais** | 4.1. |

---

## 5. Comportamentos por desenho que o dono do produto deveria conhecer

1. **Compras financiadas viram patrimônio "pelo que já foi pago", sem dívida correspondente.** `fim.div` fica 0 em todo o plano: o saldo devedor do apartamento (R$ 518.555,56 logo após a 1ª parcela, mês 60; R$ 284.555,56 no mês 222) e do consórcio (R$ 103.500 no mês 0, R$ 20.700 no mês 48) não aparece como dívida, e `bens` só soma a entrada + amortização (bens de R$ 557.063 no mês 60, não 1,08 mi). O patrimônio líquido está correto (A.4), mas a visão bruta (bens, dívidas, índice dívida/renda) fica subestimada em até R$ 518 mil.
2. **Calendário em semanas.** O motor rende por semana `(1+r)^(7/30,4375)`: um mês de 5 semanas rende cerca de 15% acima da média e um de 4 semanas cerca de 8% abaixo; no ano, a média é exata. A data do objetivo é a semana que abre o mês-alvo (a que contém o dia 5): o "mês 24" é alcançado com 23,46 meses de rendimento, o 120 com 119,59. "Hoje" é arredondado para a semana mais próxima (14/10 → 17/10). Com início em 29/10/2026 (data de hoje desta auditoria) o mês 0 vira novembro, todos os "24, 36, 48…" ficam um mês adiante e a liberdade cai no mês 221: financeiro na liberdade R$ 3.971.232,81 (+R$ 6.412,29).
3. **Taxa do caixa livre.** Toda a sobra que não vai a objetivo acumula na reserva a 0,4% a.m. (4,9% a.a. real) até a liberdade: R$ 3,96 mi aos 50. Com 0,5% (moderado) seriam R$ 4,47 mi (+R$ 510 mil, +12,9%) e R$ 58,1 mi aos 100 anos. A "estratégia" é única para o caixa e isso domina o resultado do cliente.
4. **A renda desejada é gasto total.** Depois da liberdade o gasto médio é exatamente 14.000 (parcelas incluídas); a diferença entre 14.000 e o gasto atual (13.342) vira consumo a mais, e quando o apartamento quita (mês 420) a escala sobe para 1,467 (alimentação de 2.600 para 3.815). O plano termina com R$ 24,4 mi: sobra enorme, sem efeito de ruína. O cliente poderia parar antes de 50: a liberdade é por idade pedida, não pelo primeiro mês sustentável (sustentável R$ 18.059 contra 14.000).
5. **Caixinha acima do alvo.** Aportes arredondados para cima e folga de 1%: casamento +81,75 (0,15%), filho +67,88 (0,17%), carro +36,78 (0,78%), casa de campo +318,33 (0,06%). O apartamento (patrimônio dedicado de R$ 120.000) fecha com +27.855,56 (21%), que volta ao caixa no mês 60 sem aviso.
6. **Reserva de R$ 40.000 não é piso.** O caixa livre cai a R$ 31.441 no mês 0 e fica abaixo de 40.000 nos meses 0 e 1 (dedicado de 120.000 mais os aportes dos outros objetivos).
7. **13º acompanha a promoção** (`segue`): 13.000 a partir de dez/2028 (+R$ 2.000/ano). **Valores em reais constantes:** aluguel, INSS, imóveis e carro sem reajuste nem depreciação; sem IR sobre o aluguel; sem custos depois das compras (`costs: []`) nem despesas do filho.
8. **`lifeExp` único.** 92 (idade do Pedro) para cobrir os 90 da Júlia; o plano sobra tanto que não muda nada.

---

## 6. Limites desta auditoria

- **Não coberto por não ser exercido pelo cenário:** dívidas avulsas e financiamentos de bens (o plano não tem), créditos novos, cheque especial, juros de 4% a.m. sobre caixa negativo e teto da dívida (não há ruína), previdência/FGTS/fundo de pensão (`prev = 0`), reajuste e fundo de reserva do consórcio, seguro prestamista, carência. O motor de dívidas e de participações foi estressado fora do cenário (S9.1, S9.2) contra fórmulas próprias, mas não essas rotas dentro da simulação completa.
- **Fluxo semana a semana:** o fluxo mensal foi recalculado do plano (exato), mas a posição de cada lançamento dentro do mês (semana do ciclo) só foi validada indiretamente: o modelo de caixinhas com aportes na 4ª semana reproduz o motor ao centavo em 1.247 semanas, e as semanas do ciclo das despesas aparecem no mês 0.
- **Regras de desenho aceitas como premissa** (e conferidas quanto à consistência, não quanto à adequação financeira): taxas reais de 0,4/0,5/0,6% a.m., rendimento semanal, os 24 meses conservadores, margem de 1% do programa de aportes, renda desejada como gasto total, IOF pessoa física pela fórmula de 0,38% + 0,0082% ao dia (30 dias por parcela).
- **Quem rodou o "observado" semanal:** nova execução do motor pelo harness (idêntica ao extrato); o auditor não lê o motor para calcular o esperado, mas usa a saída semanal dele para os saldos observados. Em S9, `contratoDaDivida` e `trajetoriaDaParticipacao` são usados apenas como observado.
- **Fora de escopo:** telas, textos, a tradução do consultor além da comparação com o cliente, os cenários 1 a 9, qualquer cálculo tributário (valores líquidos dados), verossimilhança financeira das taxas e da inflação (tudo em reais de hoje), o modo `perp`/`cons` de saque.
- **Tolerância:** R$ 0,01 em todas as conferências, exceto a média de 12 meses da renda desejada (R$ 2,00, pela variação mensal da escala).
