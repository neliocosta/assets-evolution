# Cenário 07 — Henrique e Sofia: família muito rica, duas empresas para vender e uma dívida para quitar

## Conversa com o cliente

Henrique Vasconcellos (58 anos, nascido em fevereiro de 1968) e Sofia Vasconcellos (55 anos, nascida em maio de 1971) são casados. Têm três filhos: Isabela (27 anos), Tiago (24) e Clara (21). Nenhum depende financeiramente deles de forma relevante, mas pagam a faculdade de Clara. Henrique é presidente de uma empresa de logística da família; Sofia é diretora de um instituto de arte.

**Entradas de dinheiro (líquidas, por mês)**

| Fonte | Valor |
|---|---|
| Pró-labore do Henrique | R$ 40.000 |
| Distribuição de lucros do Henrique | R$ 180.000 |
| Salário da Sofia | R$ 35.000 |
| Aluguel por temporada da casa de campo | R$ 14.000 |

**Gastos mensais (R$ 160.000)**: casa, equipe e contas R$ 48.000, plano de saúde e médicos R$ 18.000, viagens e lazer R$ 40.000, escola e faculdade (Clara) R$ 12.000 até dezembro de 2028, carros e motoristas R$ 14.000, doações e instituto R$ 12.000, outros R$ 16.000.

**Patrimônio**

| Item | Valor |
|---|---|
| Investimentos | R$ 14.000.000 (dos quais R$ 2.000.000 de reserva) |
| Residência | R$ 6.000.000 |
| Casa de campo | R$ 3.000.000 |
| Fazenda (valoriza 3% ao ano, por 20 anos) | R$ 11.000.000 |
| 100% da Vasconcellos Logística (participação do casal) | R$ 18.000.000 |
| 40% da Nogueira Agro | R$ 6.000.000 |
| Startup de tecnologia que a Clara abriu e eles financiaram | R$ 500.000 |

**Vasconcellos Logística.** "Em outubro de 2029 (daqui a 3 anos) a empresa deve valer R$ 24 milhões, e depois disso deve crescer uns 5% ao ano por 10 anos. Vamos vender tudo em outubro de 2036 (daqui a 10 anos) pelo valor que tiver na época. Os custos serão 4% de assessoria e 15% de imposto, 19% do preço. **O dinheiro da venda é para criar a fundação da família: R$ 20 milhões** em outubro de 2036."

**Nogueira Agro.** "Vendemos a nossa parte em dezembro de 2031 (daqui a 5 anos e 2 meses) por R$ 9 milhões. Pagamos 3% de comissão (R$ 270.000) mais R$ 450.000 de imposto (15% sobre o ganho de R$ 3 milhões). Esse dinheiro vai cobrir o **casamento da Isabela**, que será em outubro de 2031 (daqui a 5 anos), R$ 800.000. Também em dezembro de 2031, com o dinheiro da venda, vamos **amortizar R$ 2,5 milhões** da nossa dívida abaixo."

**Startup da Clara.** "Em dezembro de 2027 (daqui a 14 meses) ela vai quebrar. Perdemos tudo."

**Dívida.** Empréstimo com garantia de imóvel: R$ 4.000.000, 120 parcelas, 1,1% ao mês, tabela Price, primeira parcela em outubro de 2023 (36 pagas). Parcela de R$ 60.197. Saldo no extrato R$ 3.289.000.

**Outros sonhos**
1. **Reforma da fazenda**: R$ 1.500.000 em outubro de 2027 (daqui a 12 meses). Conservador.
2. **Casamento da Isabela**: R$ 800.000 em outubro de 2031 (60 meses). Moderado.
3. **Fundação da família**: R$ 20.000.000 em outubro de 2036 (120 meses), agressivo; já separaram R$ 3.000.000 de investimentos para ela.

**Aposentadoria.** Sofia para aos 60 (em maio de 2031); Henrique aos 65 (em fevereiro de 2033). Querem R$ 180.000 por mês em valores de hoje. INSS de cerca de R$ 8.000 para cada, a partir dos 65. Esperam viver até os 95.

## Para o auditor (não mostrar ao consultor)

**O que estressa**
- **Cliente muito rico**: valores de oito dígitos; precisão numérica e arredondamento em somas grandes.
- **Participação com alvo e depois taxa**: alvo de R$ 24 mi no mês 36, **taxa de 5% a.a. a partir do mês 36 por 10 anos**; a venda no mês 120 sem preço informado usa o valor projetado: 24.000.000 × 1,05^7 = R$ 33.770.410 (a taxa começa a contar no mês 37, o mês 36 é o alvo; confirmar). Custos em percentual (19%): R$ 6.416.378; líquido **R$ 27.354.032**.
- **Venda no mesmo mês da data do objetivo**: a fundação é de 120 meses, a venda é no mês 120; o motor aceita (`depois` só quando a venda é posterior à data). A parte destinada (R$ 20.000.000 de líquido) entra sem render (zero meses). O patrimônio dedicado de R$ 3.000.000 rende 96 meses agressivo e 24 conservador: 3.000.000 × 1,006^96 × 1,004^24 = R$ 5.863.224; saldo total na data R$ 25.863.224, acima dos R$ 20 milhões; o aporte necessário é zero e o excesso (R$ 5.863.224) volta ao financeiro.
- **Venda depois da data do objetivo**: a Nogueira Agro é vendida no mês 62, mas o casamento é no mês 60. O cliente acredita que a venda "cobre o casamento"; o motor marca `depois: true` e a venda NÃO financia o objetivo. O auditor deve verificar que o aviso aparece e que o casamento exige aporte próprio: 800.000 / 68,43 = **R$ 11.691/mês** (60 aportes, moderado até o mês 36, conservador depois).
- **Dívida amortizada no mesmo mês de uma venda, com valor maior que o saldo**: a amortização pedida (R$ 2,5 mi) é maior que o saldo naquele mês (R$ 1.123.271 depois da parcela 99, mês 62); o motor limita à parcela do saldo e quita. O auditor verifica se o fluxo debita R$ 2,5 mi ou os R$ 1.123.271 reais, se o patrimônio fica coerente (dívida zerada, caixa menor só do saldo) e se a linha de parcela some depois.
- **Desvalorização que leva a zero**: a startup perde 100% no mês 14 (pontual de −R$ 500.000, valor igual ao saldo): valor 0, sem negativo.
- **Participação com taxa e depois alvo (Nogueira)**: o cliente diria "8% ao ano por 5 anos" mas há preço de venda (alvo no mês 62): o valor cresce geométrico de 6 a 9 milhões, fator 1,5^(m/62); mês 12: R$ 6.489.832; mês 36: R$ 7.592.727. Os 8% a.a. seriam ignorados (se o consultor os digitar).
- **Idades de aposentadoria diferentes** (Sofia aos 60, Henrique aos 65), **objetivos de 12, 60 e 120 meses**, **bens valorizando** (fazenda: 11.000.000 × 1,03^10 = R$ 14.783.080 em 10 anos), **aluguel recebido** de bem sem financiamento, **despesa que muda por fase** (faculdade termina em dezembro de 2028).
- **Sobra muito**: renda R$ 269.000 contra gasto de R$ 160.000 mais parcela de R$ 60.197; o plano nunca deve apontar ruína.

**Valores esperados à mão**

| Quantidade | Esperado |
|---|---|
| Parcela do empréstimo | R$ 60.197 (4.000.000, 120x, 1,1% a.m.); saldo após 36 parcelas R$ 3.289.301 |
| Saldo depois da parcela 99 (mês 62) | R$ 1.123.271; 21 parcelas ainda faltariam |
| Líquido da Logística | R$ 27.354.032; 20.000.000 para a fundação |
| Nogueira: preço R$ 9.000.000, custos 270.000 + 450.000 | líquido **R$ 8.280.000** |
| Startup | R$ 500.000 até o mês 13; R$ 0 do mês 14 em diante |
| Reforma da fazenda (12 meses, conservador) | 1.500.000 / 12,2676 = **R$ 122.272/mês** |
| Casamento sem a venda | R$ 11.691/mês |

Riscos cobertos: participação (alvo + taxa, venda no mês da data, venda depois da data, valor a zero; principal), dívida (amortização maior que o saldo; principal), caixinha (janela conservadora com venda no limite; dedicado).
