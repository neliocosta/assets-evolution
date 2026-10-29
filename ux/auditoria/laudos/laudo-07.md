# Laudo da auditoria matemática — Cenário 07 (Henrique e Sofia Vasconcellos)

Código reexecutável: `node ux\auditoria\laudos\auditor-07.js` (64 conferências; 60 batem, 4 divergem, todas explicadas abaixo).
Método: o auditor parte do plano (`planos/plano-07.json`) e das regras do domínio financeiro, recalcula tudo com código próprio (sem chamar `trajetoriaDoBem`, `saldoDevedorEm`, `taxaDoObjetivo`, etc.) e compara com o observado (`extratos/extrato-07.json` e as semanas da simulação). Os fluxos semanais de aporte que o motor entrega foram usados como entrada na reconstrução das caixinhas e do caixa (instrução da missão); tudo o mais foi recalculado do plano.

## 1. Veredito

**A matemática de participações societárias e de caixinhas está provadamente certa (erro 0,00 em todas as amostras); a de dívida tem duas contas erradas na quitação antecipada (uma de calendário do saldo, uma de escala da parcela), e há um problema de calendário que depende do fuso do computador; a liberdade financeira reproduz a regra do motor, mas a regra distorce este cliente.**

| Frente | Semáforo | Resumo |
|---|---|---|
| Participações | **CERTO** | Séries, saltos, queda a zero, vendas, custos, líquido e destino: erro máximo R$ 0,00 |
| Dívidas | **ERRADO** | Taxa, tabela Price e juros certos; a quitação antecipada zera a dívida um mês depois do caixa, e a parcela do contrato é multiplicada pela "escala do padrão de vida" |
| Caixinhas | **CERTO** | Taxa certa em todas as 825 semanas medidas; troca de taxa no mês exato; saldos com erro R$ 0,00 |
| Contabilidade geral | **CERTO COM RESSALVAS** | Conservação exata (erro < R$ 0,00001); o patrimônio do mês 62 fica R$ 1.170.483 abaixo do coerente por causa da dívida (ver 4.1); calendário depende do fuso (4.3) |
| Fluxo | **CERTO COM RESSALVAS** | Entradas e saídas iguais ao plano em 495 meses; ressalvas: parcela escalada (4.2), calendário (4.3), lucros que cessam aos 65 (5.2) |
| Liberdade | **CERTO COM RESSALVAS** | Idade, mês, maxGap, "sustentável", ruína e `forced` reproduzidos; a escala de despesas e o teste `forced` distorcem este cliente (seção 5) |

## 2. Por que a matemática está certa (por frente)

### 2.1 Participações (frente 1)
Regras usadas: valor inicial; alvo = ritmo geométrico `v·(alvo/v)^(1/(em−m+1))` refeito a cada mês; taxa % a.a. composta ao mês `v·(1+p)^(1/12)` para `de ≤ m−1 < de+12·anos`; pontual `v·(1+pct)` com piso zero; venda = preço (informado ou o valor projetado), custos em % do preço ou em R$.

- Vasconcellos Logística, forma fechada independente: `18M·(24/18)^(m/36)` até o mês 36 e `24M·1,05^((m−36)/12)` depois. Mês 36: esperado 24.000.000,00; motor 24.000.000,00; erro 0,00. Mês 119: 33.633.383,58; mês 120 (venda): 33.770.410,14 = 24M·1,05^7; erro 0,00 nas 121 posições. A taxa de 5% começa a contar no mês 37 (o mês 36 é exatamente o alvo): **confirmado**, como o cenário pedia.
- Nogueira Agro: `6M·1,5^(m/62)`. Mês 12: 6.489.831,63; mês 36: 7.592.727,05 (cenário: 6.489.832 e 7.592.727, diferença < R$ 1). Os 8% a.a. do cliente não aparecem no plano, então nada a ignorar. Erro 0,00 nas 63 posições.
- Startup: 500.000 até o mês 13; mês 14: 0,00 (pontual −100%, `max(0, …)`); zero até o mês 496; nunca negativa. Erro 0,00.
- Fazenda: `11M·1,03^(m/12)` até o mês 240 e constante depois: mês 120 = 14.783.080,17 (cenário 14.783.080); mês 240 = 19.867.223,58. Erro 0,00 em 496 meses.
- Venda da Logística (mês 120, out/2036): preço 33.770.410,14; custos 4% + 15% = 6.416.377,93 (1.350.816,41 + 5.065.561,52); líquido 27.354.032,22 (cenário 27.354.032; dif R$ 0,22). Esperado × observado no fluxo: `mov_bens` −33.770.410,14 e `out_vendap_0` 6.416.377,93; erro 0,00. Destino: 20.000.000 entram na caixinha da Fundação (a venda no mesmo mês da data **não** é "depois") e saem como gasto do objetivo; 7.354.032,22 ficam no financeiro. Depois da venda a participação é 0,00 em todos os meses (1–496).
- Venda da Nogueira (mês 62, dez/2031): preço 9.000.000, custos 270.000 + 450.000 = 720.000, líquido 8.280.000,00 (igual ao cenário). A venda é no mês 62 e o casamento no 60: `depois = true`, nenhum `mov_obj_casamento` na venda; os 8.280.000 vão inteiros ao financeiro (o evento confirma "R$ 8.280.000 líquidos para o mercado financeiro").
- Reavaliação no mês da venda (documentada, correta): a participação sai do patrimônio pelo valor do mês anterior e o preço entra no caixa; a diferença (Logística +137.026,57; Nogueira +58.665,80) é a valorização do último mês, reconhecida na venda. Identidade verificada na seção 2.4.

### 2.2 Dívida (frente 2) — o que está certo
- Taxa implícita: a parcela de 60.197 em 120x sobre 4.000.000 (Price, IOF isento) dá exatamente 1,10000% a.m. (14,0286% a.a.); a PMT a 1,1% é 60.197,08.
- Saldo após 36 parcelas: contrato 3.289.300,29; cliente 3.289.000,00 (diferença R$ 300,29 = 0,009%, dado do cliente/arredondamento; o cenário calculou 3.289.301). O motor usa o informado e escala o caminho do contrato por k = 3.289.000/3.289.300,29. Série do motor nos meses 0–62 = k·saldoPrice(36+mi): erro máximo R$ 0,00000001.
- Juros do mês (parcela em caixa − baixa da dívida) = 1,1% × saldo do mês anterior: erro máximo R$ 5,50 (efeito do fator k sobre a parcela de 60.197), em 55 meses.
- Juros pagos até quitar (parcelas #37–#99 + quitação): 63 × 60.197 = 3.792.411,00; quitação 1.123.269,74; juros 1.626.380,45; principal amortizado 3.289.300,29. Conferência Σ(pago) − juros − saldo hoje = 0,00.
- Quitação: saldo 0,00 em todos os meses 63–496; a linha de parcela desaparece (0,00) nos meses 63–496.
- Valor da amortização: pedida 2.500.000 > saldo; limitada ao saldo (1.123.167 pela escala do informado; o cenário calculou 1.123.271 pelo contrato).

### 2.3 Caixinhas (frente 3)
Regra de domínio: taxa do perfil até 24 meses antes da data e conservadora (0,4% a.m.) nos 24 finais; objetivo com ≤ 24 meses nasce conservador. Convenção do motor, conferida como consistente: o rendimento é semanal, `saldo·(1+r)^(7/30,4375)`, aplicado ao saldo de abertura da semana com a taxa do mês da **semana anterior**, e os fluxos da semana (aportes, dedicado depois do primeiro crescimento, venda, saque) entram depois.

- `taxaPorMes` do extrato = regra do domínio nos 13, 61 e 121 meses dos três objetivos (erro 0).
- Saldo semanal de cada caixinha reconstruído (saldo anterior × taxa certa + aportes observados): erro máximo **R$ 0,00** em 2.156 semanas por objetivo. Taxa implícita aplicada em cada semana (saldo−aporte)/saldo anterior: desvio máximo 4,5e-16 em 49 (Reforma), 257 (Casamento) e 519 (Fundação) semanas com saldo.
- **Mês exato da troca de taxa.** Casamento (moderado 0,5% até o mês 35, conservador 0,4% a partir do 36): a última semana a 0,5% é a 3218 (mês 36) e a primeira a 0,4% é a 3219 (mês 36). Fundação (agressivo 0,6% até o mês 95, conservador a partir do 96): última semana a 0,6% é a 3479 (primeira semana do mês 96); primeira a 0,4% é a 3480 (segunda semana do mês 96). Ou seja, a troca ocorre no mês certo, com atraso de **uma semana** por construção do rendimento semanal (a 1ª semana do mês ainda rende com a taxa do mês anterior). Nenhuma semana com taxa diferente da esperada em todo o horizonte. Reforma (12 meses) nasce conservadora e fica 0,4% o tempo todo.
- Saldo na data × reconstruído (erro 0,00): Reforma 1.498.338,46 (meta 1.500.000; falta R$ 1.661,54 paga pelo cofre; dedicado 1.429.800); Casamento 805.824,82 (meta 800.000); Fundação 25.857.847,32 (= 20.000.000 da venda sem render + 5.857.847,32 dos R$ 3 mi).
- **Efeito de uma taxa só (mesmos aportes):**

| Caixinha | Como foi (correto) | Tudo no perfil | Tudo conservador |
|---|---|---|---|
| Casamento | 805.824,82 | 822.566,49 (+16.741,67) | 796.023,82 (−9.801,00) |
| Fundação | 25.857.847,32 | 26.143.409,87 (+285.562,55) | 24.840.090,84 (−1.017.756,48) |

  Se a Fundação tivesse ficado agressiva até o fim: +R$ 285.562,55 de saldo; se tivesse ficado conservadora desde o início: −R$ 1.017.756,48 (dos R$ 3 mi dedicados). O motor aplica a janela de 24 meses corretamente.
- Aporte necessário do casamento (800.000, 60 meses, moderado até o mês 35, depois conservador): fator da anuidade 68,4284; 800.000/68,4284 = 11.691,06; extrato `required` 11.691,06; cenário 11.691. Erro −1,6e-10.
- Dedicado na abertura = plano (1.429.800 / 0 / 3.000.000) no instante W0; saque no mês da data (12, 60, 120) com saldo zerado depois; gasto de consumo = valor do objetivo (1.500.000 / 800.000 / 20.000.000). Movimentos por caixinha: Reforma 2 (abertura e saque); Fundação 2 (abertura e saque; a venda entra e sai na mesma semana); Casamento 57 (56 aportes e o saque).
- Regra de aporte: Casamento recebe 12.500 do mês 0 ao 54, 12.231,52 no mês 55 e zero a partir do 56 (início da liberdade; ver 5.4). Nenhum aporte é feito depois que a caixinha já bastaria: no mês 54 a projeção sem novos aportes é 793.378 (< 800.000), no 55 é 805.824,82 (≥ 800.000): o corte do mês 55 e a parada do 56 estão coerentes com isso.

### 2.4 Contabilidade geral (frente 4)
- Patrimônio mensal = financeiro + bens + participações + previdência − dívida: a soma dos detalhes (`det.bens`, `det.parts`, `det.divs`) bate com `fim.bens/part/div` em 497 meses, erro 2,2e-8.
- Cofre semanal = cofre anterior × (1,004)^(7/30,4375) + `mov_cofre`: erro máximo 0,00 em 2.155 semanas. Abertura: (14.000.000 − 4.429.800 dedicados) × GW = 9.578.990,27 (erro 0,00).
- Transferências somam zero: `mov_cofre + Σmov_obj + mov_bens = entradas − saídas`; erro máximo 4,7e-10 por semana. Financeiro = cofre + Σcaixinhas (erro 0,00).
- Nenhum NaN/Infinity em 2.155 semanas × 8 campos. Mínimo do financeiro: R$ 13.860.565,73; mínimo do cofre R$ 9.575.288,62.
- Identidade mensal ΔPL = rendimento recalculado (cofre e caixinhas) + (entradas − saídas) + reavaliação recalculada de bens e participações − Δdívida do extrato: erro máximo R$ 0,00000003 em 496 meses.
- Convenção do rendimento do financeiro (E): `(1+0,4%)^(7/30,4375)` por semana sobre o saldo de abertura da semana; os fluxos da semana só rendem na semana seguinte. Taxa mensal equivalente implícita em 2.155 semanas: desvio máximo 1,3e-15. Consequência: mês de 5 semanas rende ~15% a mais que o de 4 (cofre: 35.395 no mês 1, de 4 semanas; 48.293 no mês 12, de 5 semanas); ao longo dos 120 meses da Fundação são 521 semanas = 119,82 meses.

### 2.5 Fluxo (frente 5)
Entradas e saídas do mês recalculadas a partir dos degraus do plano: pró-labore 40.000, lucros 180.000, salário 35.000, aluguel 14.000, INSS 8.000 (Henrique, mês 76) e 8.000 (Sofia, mês 115); despesas 48.000/18.000/40.000/14.000/12.000/16.000 e escola 12.000 até o mês 26 (dez/2028). Erro máximo R$ 0,00 em 495 meses (o mês 496 é uma semana de borda do horizonte de 100 anos, sem ciclo de despesas). Paradas: Sofia recebe até o mês 55 (mai/2031) e para no 56 (jun/2031), Henrique recebe até o 75 (jan/2033) e para no 76 (fev/2033). Mês 0 sem entradas e saídas (as datas 5 e 10 de out/2026 são anteriores a hoje, 15/out): confere. O plano tem apenas linhas mensais: 13º, bônus, frequências e meses de borda desses tipos não foram exercitados.
Meses de borda amostrados (entradas | saídas): 1 (269.000 | 220.197), 12 reforma (269.000 | 1.720.197), 27 pós-faculdade (269.000 | 208.197), 56 liberdade (234.000 | 234.000), 60 casamento (234.000 | 1.034.000), 62 venda+quitação (234.000 | 2.216.483), 76 aposentadoria (22.000 | 180.000), 120 venda+fundação (30.000 | 26.596.378).

### 2.6 Liberdade financeira, ruína e aposentadoria (frente 6)
- Início da liberdade: primeira semana com dia 5 em que a idade do titular ≥ min(65; 58,7023 + 60 − 55,4579 = 63,2444). Esperado semana 3305 / mês 56 (jun/2031); motor 3305 / 56. Erro 0.
- `maxGap` = 158.000 (180.000 − aluguel 14.000 − INSS 8.000, de fev/2033 a abr/2036) e "sustentável" = 19.547.449,87 × 0,4% + (180.000 − 158.000) = 100.189,80 (motor 100.189,80). Erro < R$ 0,01.
- `ruina` é nulo e deve ser: o financeiro nunca fica abaixo de R$ 13,86 mi nem o cofre abaixo de R$ 9,58 mi.
- `forced = true` reproduzido: (19.547.449,87 − pendências 20.800.000) × 0,4% < 158.000 (as pendências somam o casamento de 800.000 e a Fundação de 20.000.000). Ver 5.5.
- Escala de despesas da liberdade: `escala(mi) = (INSS + aluguel + renda ativa de quem não parou + retirada) / custo de vida base`: 1,1239 nos meses 56–62 (234.000/208.197), 1,5811 nos meses 63–75 (234.000/148.000), 1,2162 de 76 em diante (180.000/148.000). Reproduzida em todos os 495 meses com erro R$ 0,00.

## 3. Conferências realizadas

| # | O que foi conferido | Método | Amostra | Erro máximo | Resultado |
|---|---|---|---|---|---|
| 0.1 | Semana de hoje (W0 = 3063) e mês 0 (out/2026) | idade exata × 365,25/7 | W0, M0 | 0 | OK |
| 0.2 | Mês do motor de cada semana | datas das semanas, dia 5 abre o mês | 2.156 semanas | **71 semanas diferentes** | DIVERGE (4.3) |
| A.0 | Taxas do plano e dos perfis | comparação | R_M, 3 perfis | 0 | OK |
| A.1 | cofre = anterior·GW + mov_cofre | recursão própria | 2.155 semanas | 0,00 | OK |
| A.2 | Transferências somam zero | soma por semana | 2.155 semanas | 4,7e-10 | OK |
| A.3 | Financeiro = cofre + caixinhas | soma | 2.155 semanas | 0,00 | OK |
| A.4 | Sem NaN | varredura | 2.155 × 8 campos | 0 | OK |
| A.5 | Abertura do cofre | (14M − dedicados)·GW | semana W0 | 0,00 | OK |
| A.6 | PL = Σ detalhes | soma | 497 meses | 2,2e-8 | OK |
| A.7 | ΔPL = rend. + fluxo + reavaliação − Δdívida | identidade | 496 meses | 2,9e-8 | OK |
| B.0 | Recursão de valorização = forma fechada | fórmulas | 121 + 63 meses | 1,3e-7 | OK |
| B.1x | Série das 3 participações | recursão própria × `parts[].serie` | 121 + 63 + 497 meses | 0,00 | OK |
| B.2x | Valor mensal e zero após a venda | × `fim.det.parts` | 3 × 496 meses | 0,00 | OK |
| B.3 | Abertura (18M, 6M, 0,5M) | comparação | 3 itens | 0,00 | OK |
| B.4x | Preço, custos, líquido das vendas | cálculo próprio × fluxo | meses 120 e 62 | 0,00 | OK |
| B.5 | Destino 20 mi à Fundação (mesma data) | partilha própria | mês 120 | 0,00 | OK |
| B.6 | Nogueira posterior à data do casamento não financia | regra de data | mês 62 | 0,00 | OK |
| B.7x | Residência, casa de campo, fazenda | forma fechada × `det.bens` | 3 × 496 meses | 0,00 | OK |
| C.1 | Taxa implícita da parcela | bisseção PMT | 1 | 2,9e-8 | OK |
| C.2 | Saldo após 36 parcelas × informado | tabela Price | parcela 36 | **R$ 300,29** | DIVERGE (dado do cliente) |
| C.3 | Série do saldo devedor 0–62 | k·saldoPrice(36+mi) | 63 meses | 1,1e-8 | OK |
| C.4 | Quitação: zero do mês 63 ao 496 | varredura | 434 meses | 0,00 | OK |
| C.5 | Saldo zerado no mês da amortização (62) | domínio | fim do mês 62 | **R$ 1.170.483,42** | DIVERGE (4.1) |
| C.6 | Parcela em caixa = contrato | comparação | 62 meses | **R$ 146.776,09** (7 meses) | DIVERGE (4.2) |
| C.7 | Linha de parcela some após a quitação | varredura | 434 meses | 0,00 | OK |
| C.8 | Juros = Σ parcelas + quitação − principal | tabela própria | 63 parcelas | 4,2e-9 | OK |
| C.9 | Juros do mês = 1,1% × saldo anterior | por mês | 55 meses | R$ 5,50 (tol. 6) | OK |
| D.1 | `taxaPorMes` × regra dos 24 meses | domínio | 13 + 61 + 121 meses | 0 | OK |
| D.2 | Saldo semanal da caixinha | recursão com taxa certa | 3 × 2.156 semanas | 0,00 | OK |
| D.3 | Taxa implícita por semana | (saldo−aporte)/anterior | 49 + 257 + 519 semanas | 4,5e-16 | OK |
| D.4 | Saldo na data × `real` | recursão até a data | 3 objetivos | 0,00 | OK |
| D.6 | Aporte necessário do casamento | anuidade própria | 1 | 1,6e-10 | OK |
| D.8 | Abertura, saque, saldo zerado, consumo | fluxos semanais | 3 objetivos | 0,00 | OK |
| E.1 | Taxa do cofre 0,4% a.m. por semana | taxa implícita | 2.155 semanas | 1,3e-15 | OK |
| F.1 | Entradas do mês | plano | 495 meses | 0,00 | OK |
| F.2 | Saídas do mês (degrau × escala) | plano + regra | 495 meses | 0,00 | OK |
| F.3 | Mês 0 sem renda/despesa | datas | mês 0 | 0 | OK |
| G.1 | Semana/mês da liberdade | idade e calendário | 1 | 0 | OK |
| G.2 | maxGap e "sustentável" | recálculo | 1 | < 0,01 | OK |
| G.3 | Ruína nula | mínimo semanal | 2.156 semanas | 0 | OK |
| G.4 | `forced` | recálculo | 1 | 0 | OK |
| H.1–H.6 | Startup, líquidos, fazenda, Nogueira, Fundação (cenário) | comparação | 6 grupos | ≤ R$ 1; H.6: −R$ 5.376,68 | OK (H.6 explicada em 4.4) |

## 4. Contas erradas encontradas

### 4.1 Quitação antecipada: caixa sai no mês 62 e a dívida só cai no mês 63
- **Sintoma.** `out_fix_parcela_emprestimo` do mês 62 carrega a parcela + a quitação (o consultor lançou `exc["62"] = 1.183.466,74`), mas a dívida no fim do mês 62 ainda é R$ 1.170.483,42 e só vale 0,00 a partir do mês 63. O evento "Dívida quitada" cai na semana 3335, a primeira do mês 63.
- **Esperado × obtido.** Esperado (cenário): saldo depois da parcela 99, no mês 62, R$ 1.123.271, e com a amortização de 2,5 mi limitada ao saldo, dívida 0,00 no fim do mês 62. Obtido: 1.170.483,42 (saldo depois da parcela #98, na escala do informado).
- **Impacto.** Patrimônio do mês 62 subavaliado em **R$ 1.170.483,42** (PL = 73.681.817 no mês 62, entre 75.320.926 no 61 e 75.124.128 no 63; coerente seria ≈ 74.852.300). Só esse mês; desde o mês 63 o patrimônio está certo. Efeito direto em qualquer gráfico/linha de patrimônio mensal e na passagem de ano (mês 62 = dez/2031).
- **Origem.** Motor, desencontro de índice entre duas funções do `<script id="engine">`: (a) `contratoDaDivida`, linha 1687: `const k = k0 + Math.max(0, Math.round(+a.em))` coloca o adiantamento depois da parcela de índice `k0+em` (a #99, 1-based, quando em=62); (b) `saldoDevedorEm`, linha 1846: `j = ct.k0 + k` e `linhas[j-1].saldo`, que dá o saldo do fim do mês `mi` como "depois de `k0+mi` parcelas" (a parcela do mês 62 é a #98, pois a primeira parcela em caixa é a do mês 1, já que o mês 0 é anterior a hoje). Para ser coerente, o adiantamento do mês `em` deve ficar depois da parcela `k0+em` (1-based), ou seja, no índice `k0+em−1`; ou, alternativamente, `saldoDevedorEm(k)` deve ler `linhas[k0+k]`.
- **Correção sugerida (não aplicada).** Alinhar os dois índices (e o texto de "no mês `em`, depois da parcela"); acrescentar um teste "saldo no fim do mês de uma amortização total = 0".
- **Nota de calendário.** O contrato começou em 10/2023: a parcela #37 cai em out/2026 (mês 0), que o motor descarta (anterior a hoje). Com "36 pagas" do cliente, a primeira parcela em caixa (mês 1, nov/2026) é tratada como #37. O contrato sem amortização acabaria assim em 10/2033 (mês 84) e não em 09/2033 (mês 83). É ambiguidade do dado do cliente (dia de vencimento da parcela), não erro de conta, mas desloca a dívida em um mês.

### 4.2 A parcela contratual é multiplicada pela escala do padrão de vida
- **Sintoma.** Nos meses 56 a 61 a parcela sai como R$ 67.657,55 (contrato: 60.197,00) e no mês 62 como R$ 1.330.140,29 (contrato: 60.197 + quitação ≈ 1.183.364,20).
- **Impacto.** Caixa a mais: 6 × 7.460,55 = 44.763,27 (meses 56–61) + 146.776,09 (mês 62) = **R$ 191.539,36**. O saldo devedor, ao contrário, cai só pelo contrato; ou seja, o cliente "paga" mais do que a dívida baixa. Rendendo a 0,4% a.m. até o mês 495, esses R$ 191.539 viram cerca de R$ 1,08 mi a menos no financeiro final (já contidos no efeito total de 5.1, pois a parcela é uma linha `out_fix`).
- **Origem.** Motor: linha 1933 (`add(f, 'out_' + c.group + '_' + c.id, o.v * m.scale)`) aplica `m.scale` a todas as despesas do plano, inclusive a linha da parcela de dívida (`linhaPropria: true`); e `custoVida`, linha 1896 (`livingAt`), soma essa parcela na base de cálculo da escala (linha 2116). Parcela de dívida não é padrão de vida, é obrigação contratual.
- **Correção sugerida.** Excluir da escala (e de `livingAt`) as linhas ligadas a dívidas/bens/créditos (`d.linha`, `outrasLinhas`) e as linhas "próprias" lançadas pelo portal.

### 4.3 Calendário das semanas depende do fuso horário do computador
- **Sintoma.** Em 71 das 2.156 semanas (3,3%) o motor, rodando em America/Sao_Paulo, atribui a semana a um mês diferente do calendário nominal (ex.: semana 3091 = 29/04/2027–05/05/2027 contém o dia 5 e o motor a coloca no mês 6, não no 7). Rodando com `TZ=UTC` o calendário bate com o do auditor.
- **Causa.** `BIRTH = new Date(1968, 1, 1)` é meia-noite local, que em Brasília em fev/1968 está em horário de verão (UTC−2). `weekDate(i) = BIRTH + i·7·864e5 ms` (linha 1155) soma milissegundos exatos; em 2027 o fuso é UTC−3, então cada semana começa às 23:00 do dia anterior e as leituras `getDate()` das linhas 1144 e 1511 (`mesDaSemana`, `dia5Da`) ficam um dia antes. Quando o dia 5 é o último dia da semana nominal, o mês abre uma semana depois.
- **Impacto.** No patrimônio mensal: diferença máxima de **R$ 34.532** (0,04%) entre rodar em Brasília e em UTC (mês 491); no mês 60: R$ 19.028; no mês 120: R$ 30.798. Semanas dos eventos (liberdade 3305, venda da Nogueira 3331, venda da Logística 3583) não mudam. Casamento na data: 805.824,82 (Brasília) × 805.958,67 (UTC). O resultado do plano varia com o fuso do computador do consultor ou do cliente.
- **Origem.** Motor: aritmética de datas em milissegundos em fuso local (linhas 1144–1155 e 1511); vale para qualquer nascimento dentro de um período histórico de horário de verão.
- **Correção sugerida.** Calcular as semanas em UTC (`Date.UTC`) ou somar dias com `setDate`, nunca milissegundos, e ancorar `BIRTH` ao meio-dia.

### 4.4 Diferença de R$ 5.376,68 entre o cenário e o motor na Fundação (não é erro de conta)
O cenário calcula 3.000.000 × 1,006^96 × 1,004^24 = 5.863.224 em meses cheios. O motor entrega 5.857.847,32 porque rende por semana e do dia 15/out/2026 até a semana de 5/out/2036 passam 521 semanas = 119,82 meses (não 120). O auditor reproduz o valor do motor ao centavo com a regra semanal. **O valor esperado do cenário é que simplifica** (idem a Reforma: 1.499.960,58 em meses cheios × 1.498.338,46 em 51 semanas, −1.622,12).

### 4.5 Dado do cliente inconsistente
Saldo informado R$ 3.289.000 × contrato R$ 3.289.300,29 (R$ 300,29). O motor obedece ao informado e escala o caminho; efeito de R$ 5,50/mês nos juros; irrelevante para o patrimônio.

## 5. Comportamentos por desenho que o dono do produto deveria conhecer

**5.1 A "escala do padrão de vida" na liberdade (linha 2116).** Quando Sofia para (mês 56), todas as despesas passam a ser multiplicadas para igualar o gasto à renda disponível: R$ 234.000/mês (declarado: R$ 148.000, mais a parcela até o mês 62). Entre jun/2031 e jan/2033 (20 meses) são **R$ 1.437.834 a mais gastos** do que o cliente declarou (R$ 25.803/mês nos meses 56–61; R$ 86.000/mês nos meses 63–75 depois de quitada a dívida). O financeiro fica R$ 1,49 mi menor no mês 76, R$ 1,78 mi menor no mês 120 e R$ 7,96 mi menor no mês 495 (a 0,4% a.m. composto). Não gera ruína, mas esconde que a família "poupa" 0 em 20 meses em que poderia poupar R$ 26–86 mil. Na aposentadoria plena o gasto é R$ 180.000 (desejado), R$ 32.000 acima do declarado: pedido do cliente, não distorção.

**5.2 Lucros do Henrique param aos 65 (mês 76) e a empresa só é vendida no mês 120.** São 44 meses (fev/2033–set/2036) em que a família é dona de 100% da empresa e não recebe lucro: R$ 7.920.000 de renda não considerada, que valeriam R$ 8,67 mi no financeiro no mês 120 (e R$ 38,9 mi no mês 495, por juros compostos). Decisão do consultor (renda ativa) com dado faltante do cliente; o sistema não permite "renda de sócio que termina na venda da participação".

**5.3 Rendimento semanal.** O rendimento do cofre e das caixinhas é composto por semana e meses de 5 semanas rendem ~15% a mais que os de 4 (35,4 mil no mês 1 × 48,3 mil no mês 12). A troca de taxa das caixinhas acontece uma semana depois da primeira semana do mês de troca. Em 120 meses, 521 semanas, −R$ 5.377 na Fundação em relação ao cálculo em meses.

**5.4 Aportes das caixinhas param na liberdade (mês 56).** O Casamento junta 805.824,82 apesar de o cartão projetar 855.354,48 (com aporte até a data): R$ 49.529,66 de diferença entre `projected` e `real`. Com aporte de 11.700 (o necessário) o cliente ficaria com 754.508 (94%).

**5.5 `forced = true`.** O teste de sustentação soma 20 mi da Fundação como "pendência" e ignora a venda da Logística (27,35 mi) e da Nogueira (8,28 mi), então o plano aparece como "requer revisão / renda parcial R$ 100.190 de R$ 180.000" (linhas 4503, 4893 da página). Na simulação completa o financeiro nunca cai abaixo de R$ 13,86 mi, não há ruína, e aos 100 anos sobram R$ 18,2 mi em caixa mais R$ 28,9 mi em bens. O aviso é conservador demais para este cliente.

**5.6 Fundação com R$ 3 mi dedicados mais a venda de R$ 20 mi.** O dedicado vira R$ 5,86 mi que ficam parados 10 anos numa caixinha que a venda já cobre; voltam ao financeiro no mês 120. Premissa do consultor (os 3 mi não são parte dos 20).

**5.7 Venda da Nogueira não financia o casamento e não há aviso.** O código só filtra `!v.depois` (linhas 2237, 3057, 3355, 4522); procurei e não encontrei mensagem ao consultor ou ao cliente de que o vínculo foi descartado. A venda aparece como "R$ 8.280.000 líquidos para o mercado financeiro". Impacto numérico: casamento exige R$ 11.691/mês (12.500 lançados) em vez de ser coberto pela venda.

**5.8 Liberdade em jun/2031.** Sofia faz 60 em 01/05/2031; a regra usa a idade do titular em passos semanais (63,2416 < 63,2444 na semana de maio) e o último salário dela é o de mai/2031; a liberdade e a parada vêm em jun/2031. Diferença de R$ 35.000 de salário; dentro da granularidade mensal.

**5.9 Horizonte de 100 anos com gasto de R$ 180.000 até o mês 495,** embora o cliente espere viver até os 95 (usado só no teste de sustentação). Mantém o plano conservador.

**5.10 Reserva de R$ 2 mi (`politica.reserva`).** Não altera nenhuma conta: o cofre nunca fica abaixo de R$ 9,58 mi, e o motor não separa a reserva do resto do financeiro.

**5.11 Reforma.** O cenário prevê aporte de R$ 122.272/mês (valor confere: 122.273,78); o consultor usou dedicado R$ 1.429.800 hoje, a conta fecha (R$ 1.498.338,46; ratio 99,89%) e o cofre paga os R$ 1.661,54 que faltam. Premissa do consultor, não erro.

## 6. Limites desta auditoria

- **Não exercitados por este plano:** consórcio (nem contemplado nem em andamento), crédito novo, compra financiada ou por consórcio de objetivo, bem financiado e venda de bem com saldo devedor (quitação), amortização em modo "parcela", SAC, IOF a financiar, seguro/tarifas, 13º/bônus/frequências anuais ou semanais, fundo de pensão/FGTS/previdência. Nada disso foi auditado aqui.
- **Fluxos de aporte semanais** (`mov_obj_*`) foram aceitos como observados na reconstrução das caixinhas; só conferi regra (início, fim, corte pela liberdade, bastar) e que a soma fecha; não reconstruí o algoritmo de `programaDosAportes` (linhas 2221–2290).
- **Convenções de desenho** (rendimento semanal, mês de 4 ou 5 semanas, saldo informado manda sobre o contrato, escala do padrão de vida, aportes param na liberdade) foram aceitas como premissas e conferidas quanto à consistência, não quanto à adequação ao cliente.
- **Calendário:** a auditoria foi feita com o motor rodando em America/Sao_Paulo (o fuso do usuário); em outro fuso os números mudam (4.3). Não testei outros fusos além de UTC.
- **Tributação, ITCMD, sucessão e IR** da venda das empresas não são calculados pelo motor nem auditados.
- **Interface:** não conferi o que as telas mostram; apenas busquei no código a existência de aviso para `depois` (5.7).
- **Amostra:** meses 1–495 inteiros e todas as semanas de W0 a 5218; o mês 496 é uma semana de borda do horizonte.
