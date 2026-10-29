# Cenário 10 — Pedro e Júlia: renda variável, startup que cresce e objetivos que disputam a sobra

## Conversa com o cliente

Pedro Lima (31 anos, nascido em abril de 1995) é desenvolvedor CLT numa empresa de tecnologia e faz trabalhos extras como PJ. Júlia Lima (29 anos, nascida em setembro de 1997) é designer autônoma (PJ). Casados há 3 anos, sem filhos, mas querem o primeiro em 2029. Moram de aluguel.

**Entradas de dinheiro (líquidas)**
- Pedro, salário: R$ 11.000 por mês, 13º de R$ 11.000 em dezembro, e bônus semestral de R$ 12.000 em junho e dezembro. "Em março de 2028 sai promoção e o salário vai a R$ 13.000."
- Pedro, trabalhos extras PJ: média de R$ 2.500 por mês, mas só em 8 meses do ano; nos outros 4 (dezembro a março) é zero.
- Júlia: média de R$ 6.500 por mês, mas varia: de abril a agosto vem R$ 8.500 por mês, de setembro a março R$ 5.250 por mês.
- **Aluguel recebido**: a Júlia herdou um apartamento pequeno que rende R$ 2.200 por mês.

**Gastos mensais (R$ 12.800)**: aluguel R$ 3.800, alimentação R$ 2.600, transporte R$ 1.100, lazer e viagens R$ 2.400, plano de saúde R$ 1.700, academia, assinaturas e outros R$ 1.200. "Todo ano em janeiro paga o IPVA do carro e o seguro: R$ 6.500 de uma vez."

**Patrimônio**

| Item | Valor |
|---|---|
| Investimentos em corretora | R$ 160.000 (inclui R$ 40.000 de reserva) |
| Apartamento herdado pela Júlia (alugado) | R$ 280.000, quitado |
| Carro | R$ 55.000, quitado |
| 8% da startup do Pedro (Lumen Tech) | R$ 90.000 |

**A startup.** "Nos próximos 3 anos a startup deve crescer uns 25% ao ano. Depois espero que a minha parte valha **R$ 400.000 quando eu sair, daqui a 7 anos (outubro de 2033)**. Nesse dia **vendo a minha parte** por esses R$ 400.000, pago 1% de corretagem (R$ 4.000) e R$ 46.500 de imposto. O dinheiro vai para a **casa de campo**."

**Sonhos**
1. **Casamento (festa tardia com a família)**: R$ 55.000 em outubro de 2028 (24 meses), moderado.
2. **Licença e enxoval do primeiro filho**: R$ 40.000 em outubro de 2029 (36 meses), moderado.
3. **Carro por consórcio**: carro de R$ 90.000 em outubro de 2030 (48 meses), por consórcio com carta de R$ 90.000, 60 parcelas, taxa de administração de 15%, sem fundo de reserva, sem reajuste acima da inflação, começando hoje. Na contemplação, em outubro de 2030, dão um lance de 25% do saldo devedor, todo do bolso.
4. **Apartamento próprio**: R$ 650.000 em outubro de 2031 (60 meses), entrada de R$ 130.000, resto financiado em 360 parcelas, SAC, 10,2% ao ano, sem IOF. Moderado.
5. **Casa de campo**: R$ 500.000 em outubro de 2036 (120 meses), agressivo. O dinheiro da venda da startup entra aqui.
"A prioridade é o apartamento, depois o filho, depois o carro, depois a casa de campo e por último o casamento."

**Aposentadoria.** Querem ser financeiramente livres aos 50 (Pedro) e 48 (Júlia). R$ 14.000 por mês em valores de hoje. INSS: Pedro R$ 6.000 e Júlia R$ 3.500, a partir dos 65. Esperam viver até os 90.

## Para o auditor (não mostrar ao consultor)

**O que estressa**
- **Participação: taxa e depois alvo**: o cliente diz "25% ao ano por 3 anos, depois R$ 400.000 em 7 anos". O motor, quando há alvo, **ignora a taxa** enquanto houver alvo pendente (o preço de venda de R$ 400.000 no mês 84 também é alvo). O valor segue geométrico de R$ 90.000 a R$ 400.000: no mês 36 vale 90.000 × (400/90)^(36/84) = **R$ 170.561**, e não R$ 175.781 (90.000 × 1,25^3) como o cliente espera. Registrar a divergência (é um caso em que a ordem "taxa depois alvo" não é respeitada).
- **Venda com custos e dinheiro financiando um objetivo de 120 meses**: venda no mês 84; a janela conservadora da casa de campo começa no mês 96; nos meses 84 a 96 o dinheiro rende agressivo (0,6%) e depois conservador (0,4%): líquido R$ 400.000 − R$ 4.000 − R$ 46.500 = **R$ 349.500**; na data: 349.500 × 1,006^12 × 1,004^24 = **R$ 413.268**. O aporte necessário da casa de campo é (500.000 − 413.268) / 167,447 = **R$ 518/mês** (aporte a partir de hoje; fator 167,447 usa 96 meses agressivos e 24 conservadores).
- **Renda variável (PJ) com meses de zero e sazonalidade**, **bônus semestral**, **13º**, **promoção (degrau)**, **aluguel recebido**, **despesa pontual anual** (IPVA em janeiro): o fluxo médio e o mês a mês devem bater: Pedro (11.000 + 13º/12 + bônus 24.000/12 + PJ 2.500 × 8/12) = 11.000 + 917 + 2.000 + 1.667 = R$ 15.583; Júlia = (8.500 × 5 + 5.250 × 7) / 12 = R$ 6.604 (quase os R$ 6.500 que ela fala); aluguel 2.200. Total médio ≈ R$ 24.390; gasto 12.800 + 6.500/12 = R$ 13.342. Sobra média ≈ R$ 11.000 por mês, antes de aportes.
- **Consórcio como compra de objetivo**: carta R$ 90.000, taxa de 15% sem fundo de reserva: total 90.000 × 1,15 = R$ 103.500; 60 parcelas; amortização R$ 1.725; começa no mês 0. Contemplação no mês 48 (lance na parcela 49): saldo depois da parcela 49 = 103.500 × (60 − 49)/60 = R$ 18.975; **lance de 25% = R$ 4.744**, todo do bolso (embutido 0), que é o "necessário na data". O crédito para o bem é a carta inteira de R$ 90.000. (Observação: depois da contemplação, o saldo restante é pago até a parcela 60.)
- **Compra financiada SAC**: financiado R$ 520.000; 360x; juros 10,2% a.a. (0,8138% a.m.); amortização R$ 1.444,44; 1ª parcela no mês 60 = **R$ 5.670**.
- **Objetivos de 24, 36, 48, 60 e 120 meses, prioridades competindo**: aportes necessários, sem patrimônio dedicado e com aporte desde hoje: casamento (24, nasce conservador) 55.000 / 25,137 = R$ 2.188; filho (36, moderado, conservador desde o mês 12) 40.000 / 38,713 = R$ 1.033; consórcio (lance de R$ 4.744, 48 meses, conservador desde o mês 24) cerca de R$ 89/mês (fator 53,13); apartamento (entrada de R$ 130.000, 60 meses, moderado, conservador desde o mês 36, fator 68,43) 130.000 / 68,43 = R$ 1.900; casa de campo R$ 518. Soma ≈ R$ 5.700 por mês: cabe na sobra de ~R$ 11.000, **mas não nos primeiros meses de janeiro a março**, quando o PJ do Pedro zera e o IPVA bate; conferir se há cortes nesses meses.
- **Liberdade financeira precoce** (aos 50 e 48): vida longa na liberdade (40 anos); renda passiva do INSS só aos 65.
- Participação sem dívida; dívida: só as parcelas dos financiamentos do objetivo (consórcio e SAC, depois da data).

**Valores esperados à mão**

| Quantidade | Esperado |
|---|---|
| Startup, valor no mês 36 / 60 / 84 | R$ 170.561 / 90.000 × 4,444^(60/84) = R$ 261.198 / R$ 400.000 |
| Líquido da venda | R$ 349.500 |
| Casa de campo, saldo da venda na data | R$ 413.268 |
| Aporte da casa de campo | cerca de R$ 518/mês |
| Aporte médio de sobra | cerca de R$ 11.000/mês |
| Consórcio: lance do bolso | R$ 4.744 |
| 1ª parcela do SAC do apartamento | R$ 5.670 |

Riscos cobertos: participação (taxa antes de alvo, venda com custos; principal), caixinha (consórcio como compra, prioridades, objetivos de 24 a 120 meses; principal), dívida: apenas dívidas dos objetivos (SAC e consórcio).
