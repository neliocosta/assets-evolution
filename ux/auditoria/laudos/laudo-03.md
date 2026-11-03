# Laudo matemático do Cenário 03: Jorge e Marta (aposentados com sobra, padaria à venda, ajuda ao filho)

Código reexecutável: `node ux\auditoria\laudos\auditor-03.js` (46 conferências; opcional `--json` grava a saída em arquivo). O observado é a simulação do motor (`E.run('desej')` via harness, idêntica ao `extrato-03.json`: erro 0,00 em 343 meses). O esperado é recalculado no auditor só a partir do plano e das regras do domínio; nenhuma função de conta do motor (trajetoriaDoBem, saldoDevedorEm, taxaDoObjetivo etc.) foi usada para produzir o esperado.

## 1. Veredito

**A aritmética do motor está certa para este cliente: nenhuma conta errada foi encontrada (45 de 46 conferências com erro máximo ≤ R$ 0,01; a 46ª é a comparação com o gasto declarado, que mede um desvio de desenho, não de conta). Mas duas regras de desenho do motor (despesa "esticada" até a renda e aportes zerados na liberdade financeira) fazem o resultado divergir do que o cliente disse, e o dono do produto precisa decidir sobre elas.**

| Frente | Semáforo | Em uma linha |
|---|---|---|
| Participações | **CERTO** | Série, venda, custos, líquido, destino e zero depois da venda: erro 0,00. |
| Dívidas | **CERTO** | Cenário sem dívida: tudo zero, sem cheque especial. Sondas sintéticas de Price/SAC/IOF/amortização: erro 1,8e-11. |
| Caixinhas | **CERTO COM RESSALVAS** | Taxa e rendimento exatos, troca 0,7%→0,4% no mês certo. Ressalva: os aportes mensais não acontecem (liberdade já alcançada), e o cartão mostra "alcançável com ajustes". |
| Contabilidade geral | **CERTO** | Patrimônio, conservação do dinheiro e transferências: erro máximo 4,3e-9. |
| Fluxo | **CERTO COM RESSALVAS** | Entradas, datas e degraus exatos; as despesas lançadas são o plano × 1,42 / 1,27 / 1,18 (regra de escala), não os R$ 17.000 do cliente. |
| Liberdade | **CERTO COM RESSALVAS** | Lógica de liberdade, ruína e saque correta; a regra de "padrão de vida se ajusta à renda" distorce o patrimônio final em até R$ 4,6 milhões. |

## 2. Por que a matemática está certa

Premissas de desenho assumidas (e conferidas como aplicadas de modo consistente): mês de 30,4375 dias; rendimento composto por semana, fator (1+i)^(7/30,4375), aplicado no início da semana sobre o saldo de abertura e antes dos lançamentos dela; a taxa de uma semana é a do ciclo (dia 5 a dia 5) que ela encerra; taxa do financeiro livre 0,4% a.m. real (padrão do sistema, o plano não define `rate`); perfis 0,4% / 0,5% / 0,6% (conferidos no extrato).

**Participação Pão Nobre (30%).** Regra: sem preço de venda a série seria por taxa; com preço e mês de venda, o valor cresce em ritmo geométrico até o preço: V(m) = 500.000 · 1,3^(m/18), m = 0..17, e zero a partir da venda (mês 18).
- Mês 9: esperado 570.087,71; motor 570.087,71; erro 0,00. (O cenário diz 570.088: é o mesmo número arredondado.)
- Mês 17: 640.594,45; o ganho do último mês (650.000 − 640.594,45 = 9.405,55) é reconhecido na própria venda, e a identidade patrimonial fecha (B.8, erro 1,2e-10).
- Venda no mês 18 (abril/2028): preço 650.000; corretagem 3% = 19.500 (`out_vendap_0` = 19.500,00); líquido 630.500; `mov_bens` = −650.000; `mov_obj_adaptacao` = +300.000; os 330.500 restantes ficam no caixa livre (`mov_cofre` = entradas − saídas + 650.000 − 300.000, erro 5,8e-11). Depois da venda `part` e `det.parts[0]` = 0 nos 325 meses restantes; o plano não tem renda ligada à padaria.
- Série completa de 343 meses: erro máximo 3,5e-10.

**Bens.** Casa 1.800.000 e apartamento 750.000 constantes; sítio 900.000 · 1,02^(m/12): mês 120 esperado 1.097.094,98, motor 1.097.094,98 (o cenário diz 1.097.095). Erro máximo em 343 meses: 2,5e-8.

**Dívidas.** O plano não tem dívida, bem financiado, consórcio nem crédito novo. Prova de controle: saldo devedor, `det.divs`, `cheque`, parcelas, juros, IOF e linhas de quitação são zero nos 343 meses; o caixa nunca fica negativo (mínimo do caixa livre desde hoje: R$ 2.471.838,50; mínimo do financeiro total: R$ 2.596.529,08), logo não nasce dívida por falta de dinheiro, e `ruina = null`. Para não aceitar "zero" como prova de ausência de falha, o auditor injetou 5 contratos sintéticos no plano e comparou o saldo devedor do motor com tabelas Price/SAC próprias (taxa mensal derivada da anual): Price 12% a.a./60x, SAC, Price com amortização de 20.000 no mês 12 (reduz prazo), SAC com amortização de 15.000 no mês 6 (reduz parcela) e Price com IOF financiado (0,38% + 0,0082% ao dia sobre cada amortização, máximo 365 dias; financiado = 103.260,90). Erro máximo 1,8e-11, quitação exata em zero, juros totais conferidos (31.614,18 / 28.940,82 / 22.233,82 / 25.097,86 / 32.645,08).

**Caixinhas.** Regra: taxa do mês = base (perfil, ou `rateM` digitado) até 24 meses antes da data, e min(base, 0,4%) nos últimos 24; objetivo com 24 meses ou menos nasce conservador. Identidade semanal conferida em 1.487 semanas para as três: saldo(i) = saldo(i−1) · (1+taxa)^(7/30,4375) + aportes observados; erro 0,00.

| Caixinha | Taxa esperada × motor | Saldo na data: esperado (recursão própria) × motor |
|---|---|---|
| Bodas (5 meses, conservador) | 0,4% nos meses 0..4 (já conservadora) × 0,4% | 32.481,82 × 32.481,82 (erro 0,00) |
| Adaptação (30 meses, moderado) | 0,5% nos meses 0..5 (caixinha ainda vazia), 0,4% do mês 6 em diante × idem | 300.000 entram no mês 18; 314.669,47 × 314.669,47 (erro 0,00) |
| Netos (60 meses, `rateM` 0,7%) | 0,7% nos meses 0..35, 0,4% do mês 36 em diante × idem | 142.481,50 × 142.481,50 (erro 0,00) |

Mês exato da troca de taxa (detectado na série observada, não na tabela): netos, a taxa efetiva cai de 0,7% para 0,4% na semana de 12/10/2029, segunda semana do mês 36 (outubro/2029, exatamente 24 meses antes de out/2031). Adaptação e bodas não têm troca durante o período em que têm dinheiro (a adaptação só recebe no mês 18, já no trecho conservador). Nenhum mês tem taxa diferente da esperada (`taxaPorMes` conferido nos 6 + 31 + 61 meses).

Impacto em reais, mesmos aportes observados, taxa única o tempo todo:

| Caixinha | Como foi (esperada) | Só taxa base o tempo todo | Só conservadora o tempo todo |
|---|---|---|---|
| Netos | 142.481,50 | 153.020,72 (+10.539,22; é o que o "0,7% sempre" do gerente daria) | 128.019,40 (−14.462,10) |
| Adaptação (12 meses com dinheiro) | 314.669,47 | 318.438,11 (+3.768,64, se ficasse moderada) | 314.669,47 (igual) |
| Bodas | 32.481,82 | igual | igual |

Saque na data conferido nas três: o saldo volta ao caixa (sacado = saldo recalculado, erro 0,00), o gasto sai do caixa (`out_obj_*` = 40.000 / 300.000 / 200.000) e a caixinha fica em 0,00.

**Rendimento do financeiro.** Fator semanal implícito de cada semana em que o caixa é positivo = 1,004^(7/30,4375) = 1,000918504; erro 2,2e-16 em 1.487 semanas. Convenção: rende o saldo de abertura da semana, antes dos lançamentos dela (um aporte feito na semana só rende a partir da seguinte). Convenção do dia 0: o saldo declarado hoje (2.600.000 − 130.000 separados) já rende a semana W0 (que começa em 16/10/2026, dois dias depois de hoje): R$ 2.268,71 de rendimento (0,09%) creditados "cedo" (E.2, erro 0,00 contra a convenção).

**Contabilidade.** fin = caixa + caixinhas, patrimônio = fin + bens + part + prev − div, sem NaN nem sinal indevido (A.1). Transferências entre caixa, caixinhas e bens somam zero: Σ mov_* = entradas − saídas, erro 3,6e-12 em 342 meses (A.3). ΔPatrimônio do mês = entradas − saídas + rendimento recalculado + valorização, erro máximo 4,3e-9 em 342 meses (A.4). Todos os lançamentos são finitos, e in_*/out_* nunca são negativos (A.5).

**Fluxo.** Entradas = 9.400 + 6.200 + 4.100 + 4.500 = 24.200 até o mês 281; a partir do mês 282 (Jorge aos 95, abril/2050): 4.100 + 3.720 (60% de 6.200) + 4.500 = 12.320; erro 0,00 em 342 meses. Ajuda ao Gustavo: pagamentos exatamente nos meses 6, 18, 30, 42 e 54 (abril/2027 a abril/2031), nenhum depois.

**Liberdade.** `ff.mi` = 1 (já livres), `forced = false`, `ruina = null`, `maxGap` = 7.680 = 20.000 − 12.320. Do mês 282 em diante o financeiro cobre exatamente 7.680 por mês (saídas − entradas), e só isso (erro 0,00, 61 meses).

## 3. Conferências realizadas

| # | O que foi conferido | Método | Amostra | Erro máx. | Resultado |
|---|---|---|---|---|---|
| 0.1 | Calendário: rótulo de mês de cada semana | calendário próprio (nascimento + 7i dias; dia 5) × `weeks[i].mi` | 1.488 semanas | 0 | OK |
| 0.2 | Semana de hoje (W0) | round(idade · 365,25/7) | 1 | 0 | OK |
| 0.3 | Extrato gravado = nova execução | fin, cofre, bens, part, div, obj | 343 meses | 0,00 | OK |
| A.1 | fin = caixa + caixinhas; sem NaN/sinal | soma × `fim.fin` | 343 meses | 0,00 | OK |
| A.2 | Conservação do caixa | cofre(i) = cofre(i−1)·fator + mov_cofre(i) | 1.487 semanas | 0,00 | OK |
| A.3 | Transferências somam zero | Σ mov_* × (in − out) | 342 meses | 3,6e-12 | OK |
| A.4 | ΔPatrimônio = in − out + rendimento + valorização | identidade mensal | 342 meses | 4,3e-9 | OK |
| A.5 | Lançamentos finitos e sem sinal invertido | varredura | 1.488 semanas | 0 | OK |
| B.1 | Valor da participação mês a mês | 500.000·1,3^(m/18) × `fim.part` e `det.parts` | 343 meses | 3,5e-10 | OK |
| B.2 | Série da trajetória (inclui 650.000 no mês 18) | fórmula × `parts[0].serie` | 19 pontos | 3,5e-10 | OK |
| B.3 | Preço, corretagem, líquido, mês, quitação | 650.000; 19.500; 630.500; 18; 0 | 1 venda | 0,00 | OK |
| B.4 | Fluxo do mês da venda e destino | out_vendap, mov_bens, mov_obj_adaptacao | 1 mês | 0,00 | OK |
| B.5 | mov_cofre do mês da venda | (in − out) + 650.000 − 300.000 | 1 mês | 5,8e-11 | OK |
| B.6 | Participação zero depois da venda | `part` nos meses 18..342 | 325 meses | 0,00 | OK |
| B.7 | Bens (casa, apto, sítio 2% a.a.) | fórmula × `det.bens` | 343 meses | 2,5e-8 | OK |
| B.8 | Valorização no mês da venda | Δpart − mov_bens + Δbens | 1 mês | 1,2e-10 | OK |
| C.1 | Controle: sem dívida | varredura de div, det.divs, cheque, linhas de dívida | 343 meses, 3 bens | 0,00 | OK |
| C.2 | Caixa nunca negativo; `ruina` nula | mínimo semanal | 1.488 semanas | 0,00 | OK |
| P.1 a P.5 | Sondas sintéticas de dívida (Price, SAC, 2 amortizações, IOF) | tabela própria × `saldoDevedorEm`; quitação em zero | 61 a 63 meses cada | 1,8e-11 | OK |
| D.1.* | Identidade semanal das 3 caixinhas | saldo(i−1)·(1+taxa esperada)^(7/30,4375) + aportes | 1.487 semanas × 3 | 0,00 | OK |
| D.2.* | `taxaPorMes` = regra (base; últimos 24 meses: min(base, 0,4%)) | regra × `taxaPorMes` | 6, 31 e 61 meses | 0 | OK |
| D.3.* | Saque na data | saldo recalculado × `mov_obj`; `out_obj` = valor | 3 datas | 0,00 | OK |
| D.4.* | Saldo na data com taxa esperada | recursão semanal independente × `objetivos[].real` | 3 | 0,00 | OK |
| D.5 | Adaptação: 314.669,47 × fórmula mensal 314.721,06 | 300.000·1,004^(52 sem·7/30,4375) | 52 semanas | 1,5e-9 | OK |
| E.1 | Rendimento do caixa livre | fator implícito semanal × 1,004^(7/30,4375) | 1.487 semanas | 2,2e-16 | OK |
| E.2 | Convenção do dia 0 (rende a semana W0) | (2.600.000 − 130.000)·fator + lançamentos | 1 semana | 0,00 | OK (convenção) |
| E.3 | Perfis 0,4/0,5/0,6% e R_M 0,4% | extrato × regra | 4 valores | 0 | OK |
| F.1 | Entradas do mês | 24.200 até o mês 281; 12.320 depois | 342 meses | 0,00 | OK |
| F.2 | Meses da ajuda ao Gustavo | meses com `out_fix_gustavo` > 0 = 6, 18, 30, 42, 54 | 343 meses | 0 | OK |
| F.3 | Despesas = plano × fator da regra de escala | cada linha × (renda + saque)/custo de vida | 342 meses × 6 linhas | 0,00 | OK (regra) |
| F.4 | Despesa lançada × declarada pelo cliente | soma das saídas × 17.000 (+24.000 em abril) | 342 meses | **1.931.221,05** (meses 1-281) | **DIVERGE por desenho** (ver 4 e 5) |
| G.1 | Sobra lançada = 0 nos meses 1-281; fecha em −28.021,05 | ent − sai × padrão da regra de escala | 281 meses | 3,6e-12 | OK (regra) |
| G.2 | Liberdade já alcançada, sem ruína | `ff`, `ruina` | 1 | 0 | OK |
| G.3 | Saque de 7.680/mês do mês 282 em diante | saídas − entradas | 61 meses | 0,00 | OK |

## 4. Contas erradas encontradas

**Nenhuma conta aritmética errada no motor para este cenário.** O que tentei para quebrar o motor: (a) recalculei do zero a participação, o sítio, as três caixinhas e o caixa em base semanal (1.487 semanas) e comparei sem tolerância folgada; (b) procurei a troca de taxa na série observada (taxa implícita semana a semana) em vez de confiar em `taxaPorMes`; (c) testei a identidade de conservação do patrimônio mês a mês, inclusive no mês da venda; (d) rodei 5 contratos de dívida sintéticos (Price, SAC, IOF financiado, amortização por prazo e por parcela) contra tabelas próprias; (e) conferi o calendário (dia 5, 4 e 5 semanas por mês) com código próprio; (f) varri 1.488 semanas atrás de NaN, sinais invertidos e caixa negativo.

Divergências de fidelidade ao cliente (não são erros de conta, mas mudam o número que o cliente vê). Origem: regra de desenho do motor.

**D1. Despesa esticada até a renda (sintoma: gasta mais do que o cliente disse).**
- Meses 1 a 5 e 55 a 281: saúde R$ 8.825,88 em vez de 6.200 (fator 1,4235 = 24.200/17.000); meses 6 a 54: fator 1,2737 (= 24.200/19.000), e a ajuda ao Gustavo sai R$ 30.568,42 em vez de 24.000 (+R$ 6.568,42 por ano, R$ 32.842,10 nos cinco); a partir do mês 282: fator 1,1765 (= 20.000/17.000).
- Impacto: despesa lançada nos meses 1-281 = R$ 6.828.221 contra R$ 4.897.000 declarados (+R$ 1.931.221, +39%); mais +R$ 183.000 nos meses 282-342. Efeito no financeiro final (mês 342, aos 100 anos): motor R$ 10.106.639; com a despesa declarada, R$ 14.702.104 (+R$ 4,60 milhões, +45%); com os R$ 20.000 desejados (mais a ajuda ao filho), R$ 12.514.515 (+R$ 2,41 milhões). Modelo mensal próprio reproduz o motor com 0,52% de diferença, portanto a ordem de grandeza é confiável. No mês 120: motor R$ 4,39 mi, declarado R$ 5,34 mi.
- Origem: motor, função `simula`, ramo `if (ff)` do mês: `evolucao-patrimonial.html` linha 2116, `m.scale = Math.max(0, pas + passiveIncomeAt(m.mIdx) + trab + w - recurTotal()) / custoVida`, com `w = max(0, desejado − renda passiva)` (`gapAt`, definida no mesmo bloco). Regra violada: o desejado (R$ 20.000) não funciona como teto; com renda passiva 24.200 > 20.000 o gasto vira 24.200. O comentário do próprio motor diz que "o padrão de vida se ajusta à renda disponível".
- Sugestão (não aplicada): limitar o gasto escalado a max(desejado, despesa declarada) quando a renda passiva o supera, e mandar a sobra para poupança/aportes, ou oferecer o modo "manter a despesa do plano".

**D2. Aportes mensais zerados para quem já está em liberdade financeira (sintoma: bodas e netos "alcançáveis com ajustes").**
- Só o aporte do mês 0 entra (R$ 1.865 e R$ 836). Bodas junta 32.481,82 (81%) em vez dos 40.004,72 projetados (falta 7.518,18); netos junta 142.481,50 (71%) em vez dos 200.007,35 projetados (falta 57.518,50). A diferença sai do caixa livre na data (os gastos de 40.000 e 200.000 são pagos integralmente). Efeito patrimonial pequeno (apenas o diferencial de rendimento entre caixinha e caixa); efeito de comunicação grande: status `adj` para um casal com R$ 2,6 milhões e sobra de R$ 5.200 a R$ 7.200 por mês.
- Origem: motor. `ff.mi` = 1 já na primeira semana de salário (a lógica de liberdade dispara com `t > 0` e idade ≥ alvo), e então `programaDosAportes` usa `lib = mi => s.ff && mi >= s.ff.mi` (linha 2224) e `sobraDosMeses` devolve 0 (linha 2201). Contribui o D1: a sobra do fluxo nem existe.
- Sugestão (não aplicada): para liberdade já alcançada, ou quando a renda passiva supera o desejado, manter aportes enquanto houver sobra; ou, ao menos, o cartão do objetivo avisar "não será aportado na liberdade financeira".

**D3. Erro no valor esperado do próprio cenário.** O texto diz "6 meses a 0,5% (mês 18 a 24) e 6 meses a 0,4%": isso daria R$ 316.606,55. O número que o cenário escreve (314.721) é 300.000 · 1,004^12, que é o certo pela regra dos últimos 24 meses (a janela conservadora da adaptação começa no mês 6, antes da venda no mês 18, como o próprio cenário diz em "O que estressa"). O motor e o número estão corretos; só o texto está inconsistente. Além disso, o texto "a sobra de R$ 5.200 cobre os aportes" descreve o comportamento desejado, que o motor não realiza (D2).

## 5. Comportamentos por desenho que o dono do produto deveria conhecer

1. **Despesa escalada na liberdade** (D1 acima): o fluxo mostra o cliente gastando 42% a mais do que declarou nos primeiros meses, e +R$ 4,6 milhões no patrimônio final deixam de existir. O motor nunca mostra "sobra" depois da liberdade. Consequência extra: a 5ª ajuda ao Gustavo (abril/2031) não é recomposta, porque o custo de vida mensalizado cai a partir do mês 55; o fluxo acumulado dos meses 1-281 fecha em −R$ 28.021,05 (G.1).
2. **Sem aporte na liberdade** (D2): cartões de objetivo mostram projetado (fórmula mensal com o aporte planejado: 40.004,72 e 200.007,35) e real (simulação: 32.481,82 e 142.481,50). O auditor reproduz os dois; a diferença vem de os aportes não ocorrerem.
3. **Taxa digitada tem teto nos 24 meses finais:** o "0,7% sempre" do gerente vira 0,4% do mês 36 em diante. Custo para o cliente: R$ 10.539,22 no fundo dos netos. O consultor não vê isso no campo onde digita a taxa.
4. **Defasagem de uma semana na troca de taxa:** a primeira semana do mês 36 ainda rende 0,7% (a semana usa a taxa do ciclo que encerra). Efeito: +R$ 97,73 no fundo dos netos. Consistente com a convenção, não é erro.
5. **Calendário semanal:** o saldo da adaptação em 12 meses é 314.669,47, e não 314.721,06 (fórmula mensal), porque entre as semanas de salário dos meses 18 e 30 há 52 semanas = 11,959 meses (D.5). Diferença R$ 51,59, sem erro de cálculo; o "arredondamento de meses" que o consultor cita é, na verdade, contagem de semanas do ciclo.
6. **Convenção do dia 0:** o patrimônio de hoje já rende a semana W0 (2 dias depois de hoje): R$ 2.268,71 no caixa. Imaterial.
7. **Venda da participação:** o ganho do último mês (R$ 9.405,55) é reconhecido na própria venda; no gráfico a participação sai valendo 640.594,45, não 650.000.
8. **Sobrevivência/mortalidade:** o plano usa `lifeExp` 99 (idade do titular); Marta aos 97 equivale a Jorge aos 99,33, ou seja, o plano termina 4 meses antes (o horizonte do motor vai a 100 anos, então sem efeito prático). A renda do INSS do Jorge simplesmente termina aos 95 (sem pensão por morte), e a despesa não cai na viuvez: depois do mês 282 o plano sustenta R$ 20.000 (saque de 7.680/mês) para a Marta sozinha.
9. **Mês 0:** o mês 0 é o ciclo de outubro/2026 (a semana de hoje, 14/10); como o salário e as contas do dia 5 e 10 já passaram, o mês 0 não tem entradas nem saídas (só o movimento do patrimônio separado). A venda em abril/2028 cai exatamente no mês 18; com início em 28/10 cairia no mês 17 (segundo o relato do consultor; não reexecutado aqui).

### Julgamento das "estranhezas" do consultor (`dificuldades-03.md`)

| # | Estranheza | Julgamento |
|---|---|---|
| 1 | Despesas esticadas (24.200; Gustavo 30.568) | Confirmo os números. Comportamento por desenho (regra de escala) com distorção grande, = D1. Correção: o consultor escreve que "a sobra nunca é gasta" ao explicar o patrimônio de R$ 10,1 mi; é o contrário: a sobra é gasta pela escala, e o patrimônio cresce só pelo retorno. A afirmação "nunca há ruína, com e sem as despesas esticadas" confere (o contrafactual termina em R$ 14,7 mi). |
| 2 | Aportes não acontecem | Confirmo = D2. A explicação "consequência de `invest = 0`" é parcial: a causa principal é `programaDosAportes`/`sobraDosMeses` zerando os meses ≥ `ff.mi`. |
| 3 | Uma só expectativa de vida; sem reversão | Lacuna de sistema (não é conta). O desvio de 4 meses do `lifeExp` 99 não tem efeito (horizonte 100 anos). |
| 4 | Mês 0 depende da data de início | Comportamento por desenho, conferido; a tradução do consultor (14/10) é a certa. |
| 5 | Valorização "para sempre" = anos 30 | Tradução correta: 30 anos cobre 28,5 de horizonte. O campo vazio vale 10 anos no motor (`trajetoriaDoBem`), como ele diz. |
| 6 | Despesa anual com fim | Tradução correta (meses 6, 18, 30, 42, 54). Formato não documentado, mas o resultado confere. |
| 7 | Fundo de pensão já em pagamento | Lacuna de sistema; conta correta (6.200 até o mês 281; 3.720 depois). |
| 8 | Taxa digitada com teto de 24 meses | Comportamento por desenho, conferido (D.2), impacto R$ 10.539,22. |
| 9 | Patrimônio já separado dentro dos 2,6 mi | Premissa do consultor; o motor tira os 130.000 do caixa (mov_cofre −132.701 no mês 0, com os dois primeiros aportes). Dado faltando do cliente. |
| 10 a 12 | Riscos/IR, ajuda como objetivo, `destinos` | Lacunas/usabilidade; nenhuma conta envolvida. O encaixe da venda (630.500 = 300.000 + 330.500) saiu certo. |
| (d) | Diferença de R$ 52 na adaptação "por arredondamento de meses" | Imprecisa: são 52 semanas do ciclo = 11,959 meses (D.5). |

## 6. Limites desta auditoria

- **Dívidas:** o cenário não tem dívida; a cobertura de dívidas é de controle (zeros) mais 5 sondas de dívida avulsa Price/SAC/IOF/amortização, comparando saldo devedor. Não foram testados: consórcio, crédito novo, bem financiado vendido (quitação), compra financiada de objetivo, seguro prestamista, carência, parcela no fluxo (`out_*`) de contrato, juros de cheque especial (4% a.m. e teto de 100 vezes a renda), porque nada disso ocorre aqui e não tenho valor "observado" real do cliente para eles.
- **Ruína:** `ruina = null`; a lógica de ruína só foi conferida pela ausência (caixa mínimo positivo em todas as semanas), não exercitada.
- **Modelo contrafactual** (D1): mensal, 0,4% a.m. no financeiro todo, sem o 0,7% dos netos nos 36 meses; reproduz o motor com 0,52% de diferença. Serve como ordem de grandeza (+4,6 mi / +2,4 mi), não como número exato.
- **Convenções adotadas como premissa** (mês de 30,4375 dias, rendimento semanal, taxa do ciclo que a semana encerra, 0,4% a.m. de financeiro) foram conferidas quanto à aplicação consistente, não quanto à adequação ao mercado. A taxa real de 0,4% a.m. (4,9% a.a.) é alta para 28 anos; é decisão do dono do produto.
- **O observado semanal** vem da mesma execução do motor que gerou o extrato (E.run); foi provado idêntico ao `extrato-03.json` (0.3), mas não foi comparado com outra implementação do motor (a tela HTML não foi executada).
- **Não cobertos:** IR/INSS sobre aluguel e rendas (o plano lança tudo líquido), previdência e seguros (`riscos` vazio), pensão por morte e redução de despesas na viuvez (dados que o cliente não deu), reajuste real de saúde/cuidadora, modos `perp` e `cons`, telas e textos do portal, o `projected` do cartão além da conta de cada objetivo, e o fuso horário do calendário (rodado em Brasília, sem horário de verão após 2019).
- **Dado inconsistente do cliente:** desejados R$ 20.000 contra gasto declarado de R$ 17.000 (e R$ 2.000/mês de média da ajuda ao filho); o motor trata os R$ 20.000 como piso a partir do mês 282, e o gasto declarado como base da escala.
