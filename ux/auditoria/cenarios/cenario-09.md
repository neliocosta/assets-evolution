# Cenário 09 — Hélio e Vera: ele acabou de se aposentar, ela ainda trabalha, e a clínica vai ser vendida

## Conversa com o cliente

Hélio Barros (62 anos, nascido em agosto de 1964) era diretor de uma indústria e se aposentou em setembro de 2026, há pouco mais de um mês. Vera Barros (57 anos, nascida em janeiro de 1969) é enfermeira num hospital e pretende parar aos 60 (em janeiro de 2029). Os dois filhos já são independentes.

**Entradas de dinheiro (líquidas)**
- INSS do Hélio: R$ 7.800 por mês.
- Salário da Vera: R$ 9.500 por mês e 13º de R$ 9.500 em dezembro.
- **Fundo de pensão do Hélio** (previdência fechada, R$ 1.600.000 hoje, sem novas contribuições): "Em abril de 2027 (daqui a 6 meses) vou tirar 25% de uma vez. O resto vira renda mensal por prazo certo de 20 anos."

**Gastos mensais (R$ 14.500)**: moradia e condomínio R$ 3.100, alimentação R$ 2.800, **plano de saúde R$ 4.200** (antes a empresa pagava, agora eles pagam), transporte R$ 1.400, lazer R$ 2.000, outros R$ 1.000.

**Patrimônio**

| Item | Valor |
|---|---|
| Investimentos (inclui R$ 210.000 do FGTS que o Hélio já sacou na aposentadoria) | R$ 900.000; reserva de R$ 150.000 incluída |
| PGBL da Vera | R$ 150.000 |
| Fundo de pensão do Hélio | R$ 1.600.000 (veja acima) |
| Apartamento onde moram | R$ 1.100.000 |
| 35% da Clínica Vida (sociedade antiga do Hélio) | R$ 900.000 |

**Financiamento do apartamento (SAC)**: liberaram R$ 480.000, 240 parcelas, 9,5% ao ano, primeira parcela em março de 2018 (104 pagas, 136 restantes). Parcela de hoje R$ 4.065. Saldo no extrato R$ 272.000. "Em novembro de 2027 (daqui a 13 meses) vou amortizar R$ 100.000 e reduzir a **parcela**."

**A clínica.** "Fechei a venda da minha parte para um grupo: **R$ 1.100.000, recebidos em novembro de 2027** (daqui a 13 meses). Pago 2% ao corretor (R$ 22.000) e R$ 25.000 de imposto. A amortização do financiamento sai exatamente desse dinheiro. Separado dele, **R$ 200.000** são a entrada do apartamento na praia."

**Sonhos**
1. **Viagem à Europa**: R$ 80.000 em outubro de 2027 (daqui a 12 meses), conservador.
2. **Carro novo**: R$ 70.000 em outubro de 2028 (24 meses). "Já tenho R$ 75.000 separados para ele."
3. **Apartamento na praia**: imóvel de R$ 600.000 em outubro de 2029 (36 meses). Entrada de R$ 200.000 (a venda da clínica). O resto, R$ 400.000, financiado em 180 parcelas pelo SAC, a 9,5% ao ano, sem IOF. Risco: moderado.

**Aposentadoria.** Hélio já parou. Vera para aos 60 e terá INSS de R$ 5.600 a partir daí. Querem R$ 22.000 por mês em valores de hoje. Hélio espera viver até os 90 e Vera até os 93.

## Para o auditor (não mostrar ao consultor)

**O que estressa**
- **Cliente que acabou de se aposentar**: idade de parar do Hélio = idade atual; a Vera ainda trabalha 2,25 anos (casal com idades de aposentadoria diferentes: a renda ativa dela continua depois da liberdade do Hélio).
- **Fundo de pensão em fase de pagamento**: saque de 25% e o restante em renda por prazo certo. Rendimento até a concessão pela taxa do plano (0,4% a.m.): saldo no mês 6 = 1.600.000 × 1,004^6 = R$ 1.638.786; 25% = **R$ 409.697** de uma vez; o restante R$ 1.229.090 vira renda por 240 meses: **R$ 7.976 por mês**. Conferir que o saque entra no financeiro, e a renda no fluxo.
- **Venda de participação em mês logo depois do início da janela conservadora**: o apartamento da praia tem 36 meses, e a janela dos 24 meses conservadores começa no mês 12; a venda ocorre no mês 13, então todo o tempo (23 meses) rende à taxa conservadora: R$ 200.000 × 1,004^23 = **R$ 219.233** (contra R$ 229.500 se rendesse a taxa agressiva por engano). O destino de R$ 200.000 cobre exatamente a entrada, então o aporte necessário é zero e a sobra de R$ 19.233 volta ao financeiro.
- **Dívida amortizada no mês de uma venda**: o adiantamento de R$ 100.000 no mês 13 (SAC, reduzindo a **parcela**) coincide com o mês da venda da clínica. Esperado: saldo contratual antes do adiantamento, depois da parcela 118: 480.000 × (240 − 118) / 240 = R$ 244.000; após o adiantamento: R$ 144.000 em 122 parcelas restantes: amortização fixa R$ 1.180,33 (era R$ 2.000) e primeira parcela depois do adiantamento ≈ 1.180,33 + 144.000 × 0,7582% = **R$ 2.274**. Antes do adiantamento a parcela é cerca de R$ 3.850.
- **Preço da venda como alvo da participação**: a clínica vale R$ 900.000 hoje e R$ 1.100.000 no mês 13: sobe em ritmo constante (1,2222^(1/13) ao mês). Valor no mês 6: 900.000 × (1,1/0,9)^(6/13) = R$ 987.338. Custos de R$ 22.000 (2% do preço) + R$ 25.000 (valor): líquido **R$ 1.053.000**. Dos quais R$ 200.000 vão para o apartamento, R$ 100.000 amortizam a dívida e o restante fica no financeiro.
- **Objetivo que se paga sozinho**: o carro (R$ 70.000 em 24 meses) tem R$ 75.000 separados, que rendem à taxa conservadora (nasce conservador): 75.000 × 1,004^24 = **R$ 82.541**, acima de R$ 70.000; aporte necessário zero; o excedente (R$ 12.541) volta ao financeiro na data.
- **Despesa que muda por fase**: plano de saúde (agora o cliente paga, mais R$ 4.200) e fim do financiamento por prazo mais curto.
- Objetivo de 12 meses conservador (Europa): 80.000 / 12,2676 = R$ 6.521/mês.
- Primeiros meses com saldo de caixa apertado (receita R$ 17.300 contra R$ 14.500 + R$ 4.065 = R$ 18.565, déficit de R$ 1.265 por mês até o fundo de pensão começar a pagar, no mês 6) e a Europa competindo.

**Valores esperados à mão (resumo)**

| Quantidade | Esperado |
|---|---|
| Saque inicial do fundo de pensão (mês 6) | R$ 409.697 |
| Renda mensal do fundo (20 anos) | R$ 7.976 |
| Líquido da venda da clínica | R$ 1.053.000 |
| Entrada da praia na data | R$ 219.233 |
| Financiamento da praia | R$ 400.000 / 180 = amortização R$ 2.222,22; 1ª parcela R$ 5.259 (no mês 36) |
| Saldo do apartamento atual após amortização | R$ 144.000 |
| Carro | R$ 82.541 de saldo; aporte zero |

Riscos cobertos: participação (venda perto da janela conservadora; principal), dívida (amortização no mês da venda; principal), caixinha (objetivo que se paga sozinho; janela conservadora).
