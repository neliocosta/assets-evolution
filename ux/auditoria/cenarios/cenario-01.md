# Cenário 01 — Beatriz, a sócia da agência que vai vender a parte dela

## Conversa com o cliente

Beatriz Almeida tem 36 anos (nasceu em março de 1990), mora sozinha em apartamento alugado e é sócia (40%) de uma agência de software que ajudou a fundar. Não tem filhos nem cônjuge e não pretende ter. Trabalha como sócia-administradora e recebe pró-labore.

"Eu pago R$ 14.000 líquidos de pró-labore a mim mesma, todo mês. Além disso a empresa distribui lucro duas vezes por ano: R$ 30.000 em março e R$ 30.000 em setembro, já livres de imposto. Gasto uns R$ 11.500 por mês: aluguel e condomínio R$ 4.200, mercado R$ 2.200, transporte R$ 900, lazer e viagens R$ 1.800, plano de saúde R$ 1.100 e o resto em coisas diversas, R$ 1.300."

**O que ela tem hoje**

| Item | Valor |
|---|---|
| Investimentos em um banco de investimento (renda fixa e fundos) | R$ 350.000 |
| Desse total, a reserva de emergência (CDB com liquidez diária) | R$ 70.000 |
| Desse total, separado só para o sabático (abaixo) | R$ 20.000 |
| Participação de 40% na agência (a fatia dela, no último valuation) | R$ 400.000 |
| Dívidas | nenhuma |
| Bens | nenhum (mora de aluguel) |

**A empresa.** "A agência vale hoje R$ 1 milhão no total, minha fatia é R$ 400 mil. Eu e meu sócio achamos que em 6 anos, ou seja, em 2032, a minha parte vai valer R$ 1,2 milhão. Depois disso a gente espera um crescimento mais calmo, uns 3% ao ano acima da inflação. Meu plano é **vender minha parte em outubro de 2034 (daqui a 8 anos) por R$ 1,5 milhão**. Vou pagar 2% do preço de assessoria jurídica (R$ 30.000) e uns R$ 165.000 de imposto sobre o ganho (15% sobre R$ 1,1 milhão de ganho)."

**O que ela quer fazer**
1. **Sabático**: "Quero tirar 6 meses de viagem a partir de outubro de 2027 (daqui a 12 meses). Vai custar R$ 60.000. Já separei R$ 20.000 só para isso." Risco que aceita: moderado.
2. **MBA no exterior**: "R$ 120.000 em outubro de 2029 (daqui a 3 anos). Só começo a juntar depois de voltar do sabático, ou seja, a partir de outubro de 2027." Risco moderado.
3. **Apartamento próprio, à vista**: "Daqui a 10 anos, em outubro de 2036, quero comprar um apartamento de R$ 900.000 sem financiar. **O dinheiro da venda da agência é para isso**: dos R$ 1,5 milhão, R$ 600.000 vão para o apartamento. O resto eu invisto como quiser." Aceita risco agressivo enquanto o prazo for longo.

**Aposentadoria.** Quer parar de trabalhar aos 55 anos (daqui a 19 anos). Para viver, quer R$ 16.000 por mês em valores de hoje. Estima INSS de R$ 6.500 por mês a partir dos 65. Espera viver até os 90.

## Para o auditor (não mostrar ao consultor)

**O que estressa**
- **Participação com valor-alvo e venda**: 400 mil hoje, alvo de 1,2 mi em 72 meses, venda de 1,5 mi em 96 meses (o preço da venda vale também como valor esperado nesse mês).
- **Taxa de 3% a.a. entre 2032 e 2034 versus o alvo da venda**: o motor só aplica a `taxa` quando não há alvo pendente à frente. Como o preço da venda é um alvo no mês 96, entre os meses 72 e 96 o valor sobe geometricamente de 1,2 mi a 1,5 mi (fator 1,25^(1/24) ao mês, cerca de 11,8% a.a.) e os 3% a.a. ditos pela cliente são ignorados. Divergência entre a intenção do cliente e o cálculo: registrar e decidir se é comportamento esperado.
- **Venda no mesmo mês em que o objetivo entra na janela conservadora**: o apartamento é de 120 meses; os 24 meses conservadores começam no mês 96, que é o mês da venda. A regra do motor é `mi >= mesDoConservador`, então o dinheiro da venda rende 100% do tempo à taxa conservadora (0,4% a.m.).
- **Aporte adiado** (MBA começa a receber no mês 12, o mesmo mês em que a janela conservadora dele começa, 36 − 24 = 12) e **patrimônio já dedicado** ao sabático.
- Objetivo de 12 meses (sabático) nasce conservador, mesmo ela dizendo "moderado".

**Valores esperados à mão** (taxas reais ao mês: conservador 0,4%, moderado 0,5%, agressivo 0,6%; aportes no fim do mês)

| Quantidade | Esperado |
|---|---|
| Valor da participação no mês 36 | 400.000 × 3^(36/72) = R$ 692.820 |
| Valor no mês 72 | R$ 1.200.000 |
| Valor no mês 84 | 1.200.000 × 1,25^(12/24) = R$ 1.341.641 |
| Valor no mês 96 (preço da venda) | R$ 1.500.000 |
| Custos da venda e líquido | 30.000 + 165.000 = R$ 195.000; líquido R$ 1.305.000 |
| Parte do líquido para o apartamento | R$ 600.000 no mês 96 (os outros R$ 705.000 vão ao financeiro livre) |
| Esses 600 mil no mês 120 (24 meses conservadores) | 600.000 × 1,004^24 = **R$ 660.329** |
| Erro se a caixinha ficasse agressiva nos 24 meses | 600.000 × 1,006^24 = R$ 692.632 (diferença de R$ 32.303) |
| Aporte mensal do apartamento (aporte desde hoje, 120 aportes, agressivo até o mês 96 e conservador depois; fator de aportes 167,447) | (900.000 − 660.329) / 167,447 = **R$ 1.431/mês** |
| Sabático: R$ 20.000 a 0,4% por 12 meses, aporte dos 12 meses (fator 12,2676) | 20.000 × 1,004^12 = R$ 20.981; aporte (60.000 − 20.981) / 12,2676 = R$ 3.181/mês |
| MBA: 24 aportes a 0,4% a partir do mês 12 (fator 25,137) | 120.000 / 25,137 = **R$ 4.774/mês** |

**Conferir também**: que a participação some do patrimônio no mês 96 e que o preço entra no financeiro (sem contar duas vezes na evolução patrimonial); que os custos aparecem como saída no fluxo no mês da venda; que a sobra mensal (cerca de R$ 7.500 contando os lucros semestrais) não comporta R$ 1.431 + R$ 3.181 + R$ 4.774 ao mesmo tempo, mas o MBA só começa no mês 12.

Riscos cobertos: participação (principal), caixinha (principal); dívida: nenhuma (controle: não deve aparecer dívida nenhuma).
