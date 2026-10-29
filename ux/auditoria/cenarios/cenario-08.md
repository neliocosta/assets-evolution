# Cenário 08 — Osvaldo e Ione: produtores rurais, muita terra e pouco dinheiro na conta

## Conversa com o cliente

Osvaldo Brandão (54 anos, nascido em junho de 1972) é produtor de soja e milho em Mato Grosso. Ione Brandão (51 anos, nascida em novembro de 1975) é professora na cidade. Têm uma filha, Marina, 19 anos, que estuda na capital e depende deles até os 25.

**Como o dinheiro entra**
- **Safra de soja**: R$ 420.000 líquidos, todo ano, em maio.
- **Safrinha de milho**: R$ 150.000 líquidos, todo ano, em setembro.
- **Ione**: R$ 6.200 por mês.
- "A partir de junho de 2034, quando eu tiver 62 anos, vou **arrendar 60% da terra** e receber R$ 28.000 por mês, e paro de plantar."

**Gastos**: R$ 21.000 por mês (casa na cidade, escola e apartamento da Marina R$ 4.500, plano de saúde R$ 3.600, mercado, combustível, empregados da casa). "O dinheiro da safra paga o ano inteiro. Entre outubro e abril eu fico no sufoco."

**Patrimônio**

| Item | Valor |
|---|---|
| Aplicações financeiras | R$ 45.000 |
| Terra (800 hectares) | R$ 4.200.000 (valoriza 4% ao ano por 20 anos) |
| Máquinas e implementos | R$ 900.000 (desvalorizam 10% ao ano por 8 anos) |
| Casa na cidade | R$ 700.000 |
| Lote em Sinop | R$ 600.000 (o corretor diz que valoriza 8% ao ano) |
| FGTS da Ione | R$ 38.000 (não mexe) |

**Lote em Sinop.** "Tenho uma proposta firme: **R$ 900.000 em abril de 2029 (daqui a 30 meses)**. Pago 6% de comissão e ITBI (R$ 54.000). Dessa venda, **R$ 150.000 são a entrada da casa da Marina**; o resto vai para a conta."

**Dívidas**
1. **Consórcio já contemplado (trator)**: carta de R$ 420.000, 100 parcelas, taxa de administração de 15%, fundo de reserva de 3%, reajuste de 4% ao ano depois da 14ª parcela e a cada 12 meses depois dela. Primeira parcela em janeiro de 2025 (22 pagas, 78 restantes). Parcela de hoje: R$ 5.154. "Não dei lance."
2. **Consórcio ainda a contemplar (caminhão)**: carta de R$ 500.000, 80 parcelas, 10 pagas, parcela de R$ 7.200. "Espero ser contemplado em dezembro de 2027 (daqui a 14 meses), com lance de R$ 50.000."
3. **Crédito de custeio** (novo): "Vou ter de pegar R$ 120.000 em janeiro de 2027 (daqui a 3 meses), em 12 parcelas, a 1,3% ao mês, Price. Sem isso não chego em maio."

**Sonhos**
1. **Reforma da sede**: R$ 90.000 em outubro de 2027 (12 meses), agressivo.
2. **Casa para a Marina**: imóvel de R$ 500.000 em outubro de 2029 (36 meses). A entrada é de R$ 150.000 (a venda do lote), e o resto é financiado em 240 parcelas pelo sistema SAC, a 10,5% ao ano, sem IOF. "Em outubro de 2030 (mês 48) amortizo R$ 100.000 do financiamento, com a safra, reduzindo o prazo."

**Aposentadoria.** Osvaldo para aos 62 (junho de 2034) e Ione aos 60 (novembro de 2035). Querem R$ 20.000 por mês em valores de hoje. INSS esperado: R$ 7.000 para o Osvaldo aos 62 e R$ 4.000 para a Ione aos 60. Esperam viver até os 90.

## Para o auditor (não mostrar ao consultor)

**O que estressa**
- **Patrimônio quase todo ilíquido**: financeiro de R$ 45.000 contra quase R$ 7 milhões em bens. Conferir o patrimônio total, a liquidez e a fase da vida.
- **Renda concentrada** em duas datas por ano (maio e setembro) e entressafra de caixa negativo: o financeiro de R$ 45.000 não cobre 7 meses de déficit (R$ 21.000 − R$ 6.200 = R$ 14.800 por mês, mais as parcelas dos consórcios); o **crédito novo** (R$ 120.000 em janeiro de 2027, mês 3) cobre o buraco. Parcela Price: **R$ 10.865** (12x, 1,3% a.m.), a 1ª no mês 4. Conferir que o crédito entra como entrada de caixa no mês 3, e que a dívida e a parcela aparecem.
- **Consórcio contemplado com reajuste** (4% após a parcela 14 e a cada 12): total 420.000 × 1,18 = R$ 495.600; parcela inicial R$ 4.956; após a parcela 14 o saldo (R$ 426.216) sobe 4% para R$ 443.265, e a parcela passa a R$ 5.154,24 (443.265 / 86); saldo depois da parcela 22: **R$ 402.031**; novo reajuste depois da parcela 26 (em fevereiro de 2027, mês 4), e assim a cada 12. O último pagamento é maior (~R$ 6.783). O saldo do extrato manda hoje.
- **Consórcio a contemplar** com contemplação e lance em dezembro de 2027 (mês 14): a carta vira dívida/crédito conforme o motor (`caixaDoConsorcio`).
- **Bem vendido por preço acima da projeção**: 600.000 × 1,08^2,5 = R$ 727.295 (o valor projetado pela taxa no mês 30) contra o preço firme de R$ 900.000. Diferente da participação, no bem o preço da venda **não** vira alvo da curva: o valor do bem cresce a 8% até o mês 30, e a venda a R$ 900.000 gera um "salto" de R$ 172.705 entre o valor do bem e o preço. Auditar se a evolução patrimonial vê o bem subindo a R$ 727 mil e depois o financeiro recebendo R$ 846 mil líquidos (patrimônio salta); decidir se o comportamento é o esperado.
- **Venda financiando objetivo de bem financiado**: venda no mês 30; o objetivo de 36 meses entra em janela conservadora no mês 12; a venda cai na parte conservadora. R$ 150.000 × 1,004^6 = **R$ 153.636** na data.
- **Compra financiada SAC com amortização antecipada**: financiado R$ 350.000, 240x, juros de 10,5% a.a. (0,8355% a.m.); 1ª parcela no mês 36 = 350.000/240 + 350.000 × 0,8355% = **R$ 4.383**; amortização fixa R$ 1.458,33; adiantamento de R$ 100.000 no mês 48, reduzindo prazo.
- **Bem que desvaloriza** (máquinas: 900.000 × 0,9^5 = R$ 531.441 em 5 anos) e **terra que valoriza** (4.200.000 × 1,04^10 = R$ 6.217.026 em 10 anos).
- **Renda passiva futura de aluguel** (arrendamento a partir do mês 92) e aposentadorias em datas diferentes.
- Reforma da sede (12 meses): 90.000 / 12,2676 = R$ 7.336/mês; nasce conservador; a casa da Marina não precisa de aporte (R$ 153.636 > R$ 150.000).

Riscos cobertos: dívida (consórcio contemplado com reajuste, a contemplar, crédito novo, SAC com amortização; principal), caixinha (objetivo de bem financiado pela venda de bem; janela de 24 meses), participação: nenhuma (controle; a venda aqui é de um **bem**).
