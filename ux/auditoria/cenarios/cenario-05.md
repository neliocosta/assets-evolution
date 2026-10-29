# Cenário 05 — Marcos: gasta mais do que ganha e o dinheiro não vai durar

## Conversa com o cliente

Marcos Pereira tem 58 anos (nascido em julho de 1968), é divorciado e tem uma filha adulta, Helena (30 anos), que se sustenta sozinha. Trabalha como gerente comercial numa distribuidora. Mora em casa própria.

"Eu ganho R$ 11.000 líquidos por mês. Tenho uma sala comercial alugada que rende R$ 3.000. Gasto uns R$ 12.500 por mês fora as dívidas: casa e contas R$ 3.200, plano de saúde R$ 2.600, alimentação R$ 2.400, carro R$ 1.500, lazer R$ 1.800, outros R$ 1.000. E tem as dívidas."

**Dívidas**
1. **Consignado**: R$ 90.000, 72 parcelas de R$ 2.337, juros em torno de 1,95% ao mês, primeira parcela em novembro de 2024 (24 pagas, 48 restantes), tabela Price.
2. **Cartão parcelado**: R$ 6.500 em 10 parcelas de R$ 780, primeira em agosto de 2026 (3 pagas, 7 restantes).
3. **Crédito novo**: "O banco me ofereceu R$ 60.000 em abril de 2028 (daqui a 18 meses), em 36 parcelas, a 2,1% ao mês, no sistema SAC. Pretendo pegar se o dinheiro apertar."

**Patrimônio**

| Item | Valor |
|---|---|
| Investimentos (CDB e fundos) | R$ 780.000, todos com liquidez, sem separar reserva |
| Casa onde mora | R$ 1.100.000, quitada |
| Sala comercial alugada | R$ 380.000, quitada |
| Carro | R$ 60.000 |
| 30% da Cantina do Zé (restaurante, sociedade com um amigo) | R$ 250.000 |

**O restaurante.** "O restaurante vai mal: perde uns 10% de valor por ano nos próximos 2 anos e meio. E eu acho que em abril de 2029 (daqui a 30 meses) vai fechar de vez e a minha parte não vale mais nada. O sócio ainda me deve R$ 400.000 de dívida da sociedade, mas isso eu não conto."

**Aposentadoria.** "Pretendo parar de trabalhar aos 60, em julho de 2028. Para viver quero R$ 14.000 por mês, em valores de hoje. INSS de R$ 5.200 a partir dos 65. Espero viver até os 95 anos. Não tenho sonho nenhum além disso, só quero que o dinheiro dure."

## Para o auditor (não mostrar ao consultor)

**O que estressa**
- **Despesas maiores que a renda** desde o primeiro mês: renda R$ 14.000 (salário + aluguel) contra R$ 12.500 + 2.337 + 780 = R$ 15.617, déficit de R$ 1.617 por mês. O patrimônio financeiro é sangrado já antes da aposentadoria.
- **Ruína**: depois de parar de trabalhar (R$ 14.000 gastos, receita de aluguel R$ 3.000, INSS R$ 5.200 só aos 65) o patrimônio financeiro acaba. Estimativa à mão (rendimento real de 0,4% a.m., consignado até o mês 48, cartão até o mês 7, sem crédito novo): o dinheiro acaba por volta do mês 123, aos 68 anos e 6 meses. O sistema deve apontar ruína nessa região (em torno dos 68 a 69 anos) e **não** declarar o plano sustentável até os 95. Com a retirada em R$ 14.000 mensais, o patrimônio financeiro dura menos de 11 anos.
- **Participação que cai e vai a zero**: taxa −10% a.a. por 30 meses e queda pontual de −R$ 400.000 no mês 30 (maior que o valor restante: o motor deve limitar a zero, sem valor negativo). O "sócio ainda me deve" não entra na conta (empréstimo a terceiros, se o consultor quiser, entra como ativo financeiro sem liquidez; o auditor deve ver se o consultor decidiu bem).
- **Crédito novo para cobrir buraco de caixa**: R$ 60.000 em SAC, 36 parcelas, 2,1% a.m.; a 1ª parcela é de 60.000/36 + 60.000 × 0,021 = R$ 2.927 e cai R$ 35 por mês até R$ 1.702. O patrimônio líquido não muda no mês da liberação (a dívida cresce junto). Conferir se, com o crédito, a ruína se adianta ou se atrasa, e se os juros de dívida (4% a.m., padrão, quando a reserva fica negativa) aparecem depois da ruína.
- **Dívida avulsa** (consignado e cartão) quitando no meio do plano, sem amortização antecipada: as linhas das parcelas devem terminar no mês 48 e no mês 7.
- Nenhum objetivo de poupança: "Segurança" e "Liberdade" são os únicos objetivos; patrimônio financeiro positivo mas sem aporte.
- Pessoa só, **perto da aposentadoria**.

**Valores esperados à mão**

| Quantidade | Esperado |
|---|---|
| Participação, mês 12 | 250.000 × 0,9 = R$ 225.000 |
| Participação, mês 29 (último mês antes da queda) | 250.000 × 0,9^(29/12) = R$ 193.800 |
| Participação, mês 30 | 250.000 × 0,9^2,5 = R$ 192.100 antes da queda; com a queda de R$ 400.000, **R$ 0** (não negativo) |
| Participação, meses 31 em diante | R$ 0 (a taxa só vale 30 meses; e zero cresce zero) |
| Saldo do consignado hoje (24 pagas de 72, taxa 1,95% a.m.) | cerca de R$ 72.400 |
| Saldo do cartão parcelado | 7 parcelas de R$ 780, taxa implícita de cerca de 3,46% a.m. |
| Déficit mensal antes de parar de trabalhar | R$ 1.617 (R$ 837 depois que o cartão acaba) |
| Ano em que o dinheiro acaba (sem crédito) | cerca de 2037, aos 68 anos e 6 meses |

Riscos cobertos: dívida (consignado, cartão, crédito novo), participação (queda a zero), caixinha: nenhuma (controle: sem objetivos).
