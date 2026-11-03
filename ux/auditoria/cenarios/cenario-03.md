# Cenário 03 — Jorge e Marta: aposentados com sobra, uma padaria para vender e a ajuda ao filho

## Conversa com o cliente

Jorge Teixeira (71 anos, nascido em abril de 1955, engenheiro aposentado) e Marta Teixeira (69 anos, nascida em agosto de 1957, aposentada do magistério) são casados há 46 anos. Têm um filho, Gustavo (44 anos), e três netos (de 12, 9 e 6 anos). Já pararam de trabalhar. Moram em casa própria.

**Entradas de dinheiro (líquidas, todo mês)**

| Fonte | Valor |
|---|---|
| INSS do Jorge | R$ 9.400 |
| INSS da Marta | R$ 4.100 |
| Renda vitalícia do fundo de pensão do Jorge (já recebendo; reversão de 60% para a Marta) | R$ 6.200 |
| Aluguel de um apartamento que possuem | R$ 4.500 |

**Gastos mensais (R$ 17.000)**: plano de saúde dos dois R$ 6.200, cuidadora (três vezes por semana) R$ 3.500, alimentação R$ 2.800, condomínio, IPTU e contas R$ 2.100, lazer R$ 1.400, transporte R$ 1.000.
"Todo mês de abril eu dou R$ 24.000 ao Gustavo para ajudar com a escola dos meninos. Vou fazer isso por mais 5 anos (2027 a 2031) e acabou."

**Patrimônio**

| Item | Valor |
|---|---|
| Investimentos (renda fixa, fundos e ações) | R$ 2.600.000, dos quais R$ 300.000 de reserva em liquidez diária |
| Casa onde moram | R$ 1.800.000 (quitada) |
| Apartamento alugado | R$ 750.000 (quitado) |
| Sítio em Atibaia | R$ 900.000 (valoriza 2% ao ano acima da inflação, "para sempre") |
| 30% da Panificadora Pão Nobre (sociedade com o irmão do Jorge) | R$ 500.000 |
| Dívidas | nenhuma |

**A padaria.** "Em abril de 2028 (daqui a 18 meses) vamos vender a nossa parte do Pão Nobre por R$ 650.000. Pagamos 3% de corretagem. Esse dinheiro é para a **adaptação da casa** (rampas, banheiro, elevador de cadeira): R$ 300.000 em abril de 2029 (daqui a 30 meses). O resto da venda fica investido."

**Sonhos**
1. **Bodas de ouro**: viagem de 25 dias, R$ 40.000, daqui a 5 meses (março de 2027). "Já separei R$ 30.000 só para isso."
2. **Adaptação da casa**: R$ 300.000 daqui a 30 meses, pago pela venda da padaria (veja acima). Risco moderado.
3. **Fundo dos netos**: R$ 200.000 em outubro de 2031 (daqui a 5 anos), para ajudar nas faculdades. "Já tenho R$ 100.000 separados. Quero que renda **0,7% ao mês** acima da inflação, o gerente garante que consegue."
4. A ajuda anual ao Gustavo (R$ 24.000 por ano, até 2031), acima.

**Liberdade e vida longa.** Já estão livres: querem manter o padrão de R$ 20.000 por mês, em valores de hoje. Ele espera viver até os 95 anos e ela até os 97. Nenhum plano de voltar a trabalhar.

## Para o auditor (não mostrar ao consultor)

**O que estressa**
- **Cliente que sobra muito**: renda de R$ 24.200 contra gasto de R$ 17.000; patrimônio muito além do necessário; o plano nunca deve apontar ruína. Conferir que a liberdade financeira "já alcançada" não gera ruído no cálculo (início da retirada hoje).
- **Idosos já aposentados**: idade de parar = idade atual; INSS e fundo de pensão como renda passiva sem data de início futura; a renda do fundo é vitalícia com reversão a 60% à Marta (relevante só se o motor modelar sobrevivência: observar).
- **Venda de participação com custos financiando um objetivo**, com data de venda dentro da janela anterior à conservadora: objetivo de 30 meses, janela conservadora começa no mês 6; a venda no mês 18 já cai no trecho conservador.
- **Taxa digitada (rateM) maior que a do perfil agressivo**: 0,7% a.m. nos primeiros 36 meses, depois o motor derruba para a conservadora (0,4%) nos últimos 24.
- **Objetivo de 5 meses** com patrimônio já dedicado (nasce conservador).
- **Despesa pontual recorrente**: R$ 24.000 em abril por 5 anos (o sistema não tem objetivo recorrente: o consultor deve registrar como despesa anual no fluxo, e deve dizer se foi difícil).
- Bem com valorização por taxa de longo prazo (sítio, 2% a.a. sem fim).

**Valores esperados à mão**

| Quantidade | Esperado |
|---|---|
| Preço da venda da padaria / custos / líquido | R$ 650.000 / R$ 19.500 / **R$ 630.500** |
| Valor da participação ao longo do caminho | de R$ 500.000 hoje a R$ 650.000 no mês 18, em ritmo constante (1,3^(1/18) ao mês, cerca de 1,47% a.m.); mês 9: 500.000 × 1,3^(0,5) = R$ 570.088 |
| Destino da venda: R$ 300.000 para a adaptação da casa | no mês 18 entram R$ 300.000 no saldo do objetivo; até o mês 30 rendem 6 meses a 0,5% (mês 18 a 24) e 6 meses a 0,4% (24 a 30): 300.000 × 1,005^6 × 1,004^6 = **R$ 314.721**. Como passa de R$ 300.000, o aporte necessário é zero e o excedente (R$ 14.721) volta ao financeiro |
| Os outros R$ 330.500 do líquido | vão ao financeiro livre (0,4% a.m.) |
| Bodas de ouro: R$ 30.000 dedicados a 0,4% por 5 meses; aporte pelo fator 5,0402 | saldo R$ 30.605; aporte (40.000 − 30.605) / 5,0402 = R$ 1.864/mês |
| Fundo dos netos: R$ 100.000 a 0,7% por 36 meses, depois 0,4% por 24 | 100.000 × 1,007^36 × 1,004^24 = R$ 141.472; aporte (200.000 − 141.472) / 70,0185 = **R$ 836/mês** (aporte desde hoje; os fatores dos 60 aportes passam a 0,7% até o mês 36 e 0,4% depois) |
| Valor do sítio em 10 anos | 900.000 × 1,02^10 = R$ 1.097.095 |
| Sobra mensal média | 24.200 − 17.000 − (24.000/12 = 2.000 até 2031) = R$ 5.200 (R$ 7.200 depois de 2031), que cobre os aportes de R$ 1.864 + R$ 836 |

**Verificar**: se o motor aplica o teto da taxa digitada (`min(rateM, conservador)`) nos 24 meses finais e se o aporte do fundo dos netos usa a taxa certa em cada trecho; se a renda de R$ 20.000 desejados está coberta com folga (a renda passiva sozinha, INSS, fundo de pensão e aluguel, soma R$ 24.200, acima dos R$ 20.000 desejados, então o patrimônio financeiro não precisa ser consumido).

Riscos cobertos: participação (venda com custos), caixinha (taxa digitada, objetivo curto, venda dentro da janela); dívida: nenhuma (controle).
