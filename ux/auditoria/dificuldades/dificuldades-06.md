# Dificuldades do cenário 06 (Lucas Ribeiro)

Plano gravado em `ux/auditoria/planos/plano-06.json`; extrato em `ux/auditoria/extratos/extrato-06.json` (harness rodou sem erro: 879 meses, 3 objetivos, liberdade aos 62,1 anos). Convenção de meses: mês 0 = out/2026 (plano com `inicio` 2026-10-28); mi 5 = mar/2027; mi 9 = jul/2027; mi 10 = ago/2027; mi 12 = out/2027; mi 24 = out/2028; mi 60 = out/2031; mi 72 = out/2032.

## (a) Como traduzi

| Realidade do cliente | Onde / como lancei |
|---|---|
| Lucas, nascido em dez/1999, solteiro | `name`, `nascimento: "1999-12"`, `tipo: "individual"` (idade 26,9 calculada pelo motor) |
| "Hoje" do plano (conversa em out/2026; "daqui a 5 meses = mar/2027") | `inicio: "2026-10-28"` (o dia real de hoje); mês 0 = out/2026 |
| Analista de dados, empresa grande | `rendasAtivas[0]`: profissao, natureza "CLT (empresa privada)", horas 176 (premissa) |
| Salário líquido R$ 5.200 e promoção para R$ 6.000 em jul/2027 | `incomes[salario]`: `steps [{from:0,5200},{from:9,6000}]`, mensal, dia 5 |
| 13º de R$ 5.200 em dezembro | `incomes[dec13]`: `segue:'salario'`, `de:'salario'`, `frequency:'anual'`, `dates:[{m:11,d:20}]` (copiei o formato que o portal gera); acompanha o salário (vira 6.000 depois de jul/2027, o que é coerente) |
| Aluguel 1.700 / celular e outros 400 | `expenses` fixas (`group:'fix'`); aluguel com `endObj:'apto'` (para quando o apartamento for comprado) |
| Alimentação 900 / transporte 400 / lazer 500 | `expenses` ajustáveis (`group:'adj'`) |
| Moto: financiou 18.000, 36x, 2,1% a.m., Price, parcela 718, 14 pagas, restam 22, vale 16.000 | `patrimonio.bens[0]`: `mercado 16000`, `credito 18000`, `parcelas 36`, `parcela 718`, `juros 2.1`, `jurosPeriodo 'mes'`, `sistema 'price'`, `restantes 22` (sem `inicio`, pois a data da 1ª parcela daria 23), `saldoDevedor 12.796` (saldo de hoje calculado pelo próprio contrato do motor, ver dificuldade 3), `linha:'parc_moto'`, `linhaPropria:true` |
| Parcela da moto no fluxo | `expenses[parc_moto]` "Parcela: Moto": 718 de mi 0 a mi 22, degrau zero em mi 23 (replicando `lancaParcela` do portal, mas com um mês a mais, ver dificuldade 2) |
| Cartão renegociado: 6.500 em 10x de 780, 2 pagas, 8 restantes | `patrimonio.dividas[0]`: `credito 6500`, `parcelas 10`, `parcela 780`, `restantes 8`, `saldoDevedor 5.452` (do contrato), linha própria `parc_cartao` (780 de mi 0 a mi 8) |
| Conta corrente ~R$ 300 | `patrimonio.financeiro[0]` "Conta corrente" 300 (`initialWealth` = 14.300 pelo mesmo cálculo do portal, soma de `financeiro`) |
| Nenhum investimento | nada lançado |
| FGTS 14.000, sem saque agora, utilizável na entrada em out/2028 | `financeiro[1]` `tipo:'fgts'`, `conv {aos: 28,9 (idade em out/2028), rentab 0, forma 'saque', saque 100}`: vira entrada de caixa de R$ 14.000 no mês 24 (ver dificuldade 5) |
| Curso de inglês R$ 6.000 em mar/2027 | `objectives[ingles]`: `kind consumo`, `months 5`, `amount 6000`, `profile conservador`, `aporteSobra true`, `planned 0` |
| Notebook R$ 7.000 em out/2027, conservador | `objectives[notebook]`: `months 12`, `amount 7000`, `profile conservador`, `aporteSobra true` |
| Apartamento R$ 300.000, entrada 60.000, 360x, 10% a.a., Price, sem IOF, em out/2031 | `objectives[apto]`: `kind bem`, `preco 300000`, `amount 60000`, `months 60`, `profile moderado`, `compra {modo 'financiamento', sistema 'price', parcelas 360, juros 10, iof 'isento'}` |
| Começar a guardar para a entrada em ago/2027 | `apto.aporteDe: 10` |
| Amortizar R$ 10.000 em out/2032 para reduzir o prazo | `compra.amortizacoes [{em:72, valor:10000, modo:'prazo'}]` |
| Risco moderado (apartamento) | `apto.profile 'moderado'` (taxa 0,5% a.m.) |
| Aposentar aos 62, R$ 5.500/mês em valores de hoje, expectativa 85 | `retireAge 62`, `desired 5500`, `lifeExp 85`, `mode 'desej'` |
| INSS R$ 3.800 aos 62 | `passive[0]`: INSS, `net 3800`, `startMi 421` (62 anos menos a idade de hoje, em meses), vitalício |
| Ordem dos sonhos | `objetivosOrdem ['ingles','notebook','apto']` |
| Quanto guardar por objetivo | não informado; usei `aporteSobra: true` nos três (ver dificuldade 6) |

## (b) Dificuldades

1. **Datas e contagem das parcelas: o cliente conta "pagas" depois da parcela de outubro; o portal/motor conta "restantes" incluindo o mês atual.**
   - Cliente: moto "14 pagas, restam 22" e cartão "2 pagas, 8 restantes" (a 1ª em set/2026, a 2ª em out/2026, que já passou no dia 28/10).
   - Sistema: `restantesContratadas` dá `n + mesDe(inicio)` e conta o mês 0 como parcela a pagar. Com `inicio` da moto (2025-09) o motor calcula 23 restantes, não 22; com a data do plano em 28/10 o mês 0 nem entra no fluxo (nenhuma semana de pagamento depois de W0).
   - Aproximação: usei `restantes` (22 e 8) sem `inicio` e a linha da parcela vai até `restantes + 1` (pagando de mi 1 a mi 22 e de mi 1 a mi 8). A rotina `lancaParcela` do portal faria `setFim(rest-1)`, pagando uma parcela a menos do que o cliente deve.
   - Distorção: nenhuma no meu plano; mas um consultor que seguir o portal na mão, com a data do plano no fim do mês, perde uma parcela de 718 e uma de 780 sem perceber. Tipo: **COMPORTAMENTO SURPREENDENTE** (e FORMATO NÃO DOCUMENTADO: o que `restantes` significa depende do dia do mês em que o plano começa).

2. **Mês 0 vazio.** Com `inicio` em 28/10, o mês 0 não tem nenhum lançamento (salário, aluguel e parcelas do dia 5 e 10 já passaram). Isso é coerente com a realidade, mas o extrato mostra um mês 0 sem renda e sem despesa, e a conta corrente de R$ 300 só cai a 106 no mês 1. Tipo: **COMPORTAMENTO SURPREENDENTE** (esperado, mas pouco visível para o consultor). Distorção: nula.

3. **Moto: taxa informada (2,1% a.m.) não bate com a parcela informada (R$ 718).** Com 2,1% a.m., Price, 36x sobre 18.000 a parcela seria R$ 740,03; a de 718 implica 1,91% a.m. (CET diferente do "juros" do contrato, talvez tarifas ou carência). O motor deixa a parcela mandar (taxa efetiva 1,91% a.m.); o saldo de hoje fica em R$ 12.796 (com 2,1% seria R$ 12.931, diferença de R$ 135). Também não existe "saldo devedor" na conversa: calculei pelo próprio contrato do motor (e o cartão idem: R$ 5.452, taxa implícita de 3,1% a.m.). Distorção: baixa (R$ 135 no saldo). Tipo: **DADO FALTANDO do cliente** (saldo do extrato) e inconsistência do dado informado.

4. **Cartão: a data que o cliente fala não bate com o contrato.** O cliente diz que só começa a guardar para a entrada "depois de pagar o cartão, em agosto de 2027 (daqui a 10 meses)". Pelas 8 parcelas restantes, a última é em jun/2027 (mi 8, o saldo zera no mi 8). Seguindo o cliente, `aporteDe: 10` (ago/2027). Distorção: ficam dois meses (jul e ago/2027) de sobra sem destino para o apartamento; a sobra é aproveitada pelo notebook. Tipo: **DADO FALTANDO / inconsistente** do cliente (perguntar se há outra parcela ou se agosto é só margem).

5. **FGTS não tem como ser "destinado" a um objetivo.**
   - Cliente: 14.000 de FGTS, utilizáveis na entrada só em out/2028 (24 meses).
   - Sistema: `financeiro` tipo `fgts` é uma caixa à parte que só vira "renda" (saque total na concessão: aparece como `in_pas_1` = 14.000 no mês 24, como se fosse renda passiva) e entra no financeiro livre. Não há campo "este saldo é só para o objetivo X". O caminho do `dedicated` + `dedicadoEm: 24` falha: o motor separa `min(dedicated, cofre)` no mês marcado, mas o saque do FGTS chega depois na mesma semana, então só uns R$ 2.000 (o que havia no cofre) são separados, o flag `separado` fica verdadeiro e o resto nunca mais é separado. Ao mesmo tempo o fluxo planejado ("programa") já tinha contado os 14.000 como aporte no mês 24 (13.703), e as duas contas divergem.
   - Aproximação: `dedicated 0` no apartamento e `aporteSobra true`; o FGTS cai como entrada em mi 24 e a "sobra" do mês (16.100) vai para a caixinha do apartamento. Funciona, mas só porque o objetivo tem prioridade de sobra, não porque o FGTS é "carimbado".
   - Distorção: o FGTS aparece como "renda passiva" em out/2028 e é somado ao `salary` usado para dimensionar aportes. Se o consultor quisesse aportes fixos (`planned`), o dinheiro do FGTS ficaria no cofre geral. Tipo: **LACUNA do sistema** (FGTS com destino) + **COMPORTAMENTO SURPREENDENTE** (ordem das operações no mês da separação).
   - Também usei `rentab 0` no FGTS para ele continuar R$ 14.000 (o cliente disse "posso usar 14.000"); com a taxa do plano seria R$ 15.400. Tipo: **CAMPO CONFUSO** (`rentab` é "real"; o FGTS rende TR + 3%, perto de zero real).

6. **Poupança para os objetivos: o cliente não diz quanto guarda, e a conta não fecha.**
   - Realidade: renda 5.200, despesas 3.900 + moto 718 + cartão 780 = 5.398: o fluxo é negativo em R$ 198/mês até a promoção; só o 13º (dez/2026) dá fôlego. Inglês exige R$ 1.190/mês (necessário) e notebook R$ 571/mês, impossíveis.
   - Aproximação: `aporteSobra: true` nos três objetivos, deixando o motor distribuir a sobra por prioridade. Nenhum `planned` fixo, porque o cliente não disse nada.
   - Resultado: inglês junta 3.450 de 6.000 (57%); notebook 1.815 de 7.000 (26%); apartamento 53.760 de 60.000 (90%). O motor ainda assim "compra" o inglês e o notebook, puxando a reserva para o negativo (ver seção d). Tipo: **DADO FALTANDO do cliente** (e distorção relevante: o plano mostra um cliente que gasta dinheiro que não tem; faltou uma regra "consumo não realizado se a caixinha não chegar"; o `naoComprado` (70%) só vale para bem).

7. **`aporteSobra` e fluxo planejado: o aporte para de ser feito mesmo com o objetivo a 90%.** A sobra mensal do apartamento (2.100 a partir da promoção, 2.818 depois da moto) para de ir à caixinha no mês 28, quando ela está em ~47.000, e o motor deixa o dinheiro acumular no cofre. Pior: ao variar o `planned` do apartamento (com `aporteSobra false`), o valor final em out/2031 não cresce com o aporte planejado (testes com a FGTS dedicada que eu tinha antes: planned 300 → 31.565; 500 → 40.827; 700 → 48.589; 785 → 51.888; 900 → 50.375; 1000 → 48.690; 1382 → 42.253). Ou seja, aportar mais gera menos dinheiro no final. A linha do `programa` para de aportar quando acha que o objetivo já fecha com o rendimento, mas a simulação mensal rende menos do que ela supõe. Tipo: **COMPORTAMENTO SURPREENDENTE** (suspeito de erro; ver seção d, itens 3 a 5).

8. **Aluguel termina com o apartamento, mas isso é uma premissa.** O cliente só disse "comprar um apartamento". Usei `endObj:'apto'` no aluguel, o que supõe que ele vai morar lá, e não lancei condomínio/IPTU do apartamento (não foi dito). Sem o `endObj`, o aluguel continua para sempre (testado: depois de out/2031 o fluxo cobra aluguel + parcela de R$ 2.030). Distorção: moderada (a economia de R$ 1.700/mês a partir de out/2031 depende da premissa). Tipo: **DADO FALTANDO do cliente** + **CAMPO CONFUSO** (`endObj` só aparece no objeto da despesa, não no objetivo).

9. **Financiamento do apartamento: o saldo devedor não aparece nas dívidas.** Em mi 60 `bens` sobe só os R$ 60.000 da entrada (a dívida de R$ 240.000 não entra nem em `div`, que fica 0) e depois cresce com a amortização das parcelas. Patrimônio líquido fica certo, mas o "patrimônio em bens" mostra 76.116 em vez de 316.000 até a quitação, e `div` não mostra a dívida de 240.000. Tipo: **COMPORTAMENTO SURPREENDENTE** (decisão de modelagem que o consultor não vê; o auditor pode considerar erro).

10. **Moto não deprecia.** O cliente deu o valor de hoje (R$ 16.000). A ferramenta tem `valorizacao` (taxa negativa), mas o cliente não deu a taxa, então deixei constante: o bem fica R$ 16.000 por 36 anos (em out/2031 `bens` mostra 316.000 com o apartamento). Distorção: patrimônio superestimado em ~R$ 16.000 hoje e bem mais depois. Tipo: **DADO FALTANDO do cliente** (e padrão perigoso: bem sem `valorizacao` não perde valor).

11. **"Valor de hoje" e crescimento de renda.** O cliente deu salário líquido e promoção, mas nenhum reajuste anual; o motor trabalha em termos reais (rate 0,4% a.m.), então deixei o salário em 6.000 até os 62 anos. Resultado: uma sobra de R$ 2.100 a 3.800 por mês por 35 anos vira R$ 2,3 milhões aos 62. Plano de carreira (promoções futuras) não foi dado. Tipo: **DADO FALTANDO do cliente**.

12. **Aposentadoria: R$ 5.500 inclui o INSS?** O cliente fala "quer R$ 5.500 por mês" e "estima INSS de R$ 3.800". Interpretei como renda total desejada de 5.500 com INSS de 3.800 (o motor trata `desired` como renda total e tira as passivas). A ferramenta diz "Renda desejada" e a lista de rendas; a pergunta que o cliente teria que responder é "5.500 líquidos, já contando o INSS?". Tipo: **CAMPO CONFUSO**.

13. **INSS como `startMi` em meses.** O INSS começa aos 62, mas o campo é em meses a partir de hoje (421 neste plano), calculado por mim a mão (62 menos 26,91 anos). Se `inicio` mudar, o valor não acompanha (o `mudaInicio` do motor "anda" os meses, mas a idade de 62 continua). Tipo: **FORMATO NÃO DOCUMENTADO** (poderia ser `aos` como no `conv`).

14. **Rendas: bruto e IR.** Só o líquido foi informado. Preenchi `gross` igual ao líquido e `taxable: true` no salário (o 13º `taxable: false`). Isso distorce o módulo de IR e de INSS (se alguém abrir essas telas), não o fluxo. Tipo: **DADO FALTANDO do cliente**.

15. **Perfil do inglês.** O cliente só pediu "conservador" para o notebook. Para o inglês (5 meses) usei conservador. Para o apartamento, "moderado" vem do cliente. Tipo: **DADO FALTANDO** (premissa).

16. **Reserva de emergência, seguros, começou a trabalhar aos, dependentes.** Nada foi dito; deixei em branco. Os campos da página Cliente e de riscos ficam vazios, e `patrimonio.comecou` e `liquidezIdeal` ficam sem valor (o motor segue sem eles). O Lucas tem R$ 300 de reserva (0,07 mês de custo de vida) e isso não aparece como alerta por falta de lançamento. Tipo: **DADO FALTANDO do cliente**.

17. **A linha do 13º em dez/2026 vai quase toda ao inglês, não ao notebook.** Sem `incomes[].destino` o motor mandou o 13º de dezembro (5.200) para o inglês por prioridade (3.418 no mi 2), o que parece certo, mas o cliente nunca disse que o 13º é para isso. Tipo: **DADO FALTANDO** (premissa implícita).

## (c) Premissas que assumi

- Data do plano = 28/10/2026 (hoje); mês 0 = outubro/2026; "daqui a N meses" contado a partir de out/2026.
- Salário líquido cai no dia 5; parcelas no dia 10.
- Parcelas de moto e cartão: a de out/2026 já foi paga (por isso 22 e 8 restantes valem de nov/2026 em diante).
- Saldo devedor de moto e cartão = o saldo implícito no contrato (parcela informada) segundo o motor.
- O Lucas vai morar no apartamento: o aluguel termina na data do objetivo; não há custos de condomínio/IPTU do apartamento.
- O 13º de dezembro acompanha o salário (6.000 depois da promoção).
- Os três objetivos recebem a sobra do mês por prioridade (inglês, notebook, apartamento), sem aportes fixos.
- Inglês também em perfil conservador; apartamento em moderado, como o cliente disse.
- FGTS sem rendimento real (`rentab 0`) e sacado em 100% em out/2028 (28,9 anos).
- Sem depreciação da moto, sem reajuste de salário além da promoção de jul/2027, sem inflação (valores reais).
- Gênero masculino no FGTS/tábua (`sexo 'm'`), irrelevante para o saque total.
- R$ 5.500 desejados já incluem o INSS de R$ 3.800.
- O gasto "celular e outros" é fixo e o transporte é ajustável (classificação minha).

## (d) Coisas estranhas que notei no resultado

1. **Dinheiro acaba em mar/2027 (mi 5) e fica negativo até jul/2027.** `ruina` = `{mi 5, cheque12 3.795}`. Cofre/financeiro: mi 5 = -1.422, mi 6 = -1.676, mi 7 = -1.941, mi 8 = -2.215, mi 9 = -921 (volta a zero em mi 10). O motor "paga" o curso de 6.000 mesmo com apenas 3.450 na caixinha, empurrando a diferença (2.550) para o cheque especial. O mesmo acontece em out/2027 (mi 12): notebook de 7.000 com 4.170 juntados, cofre vai a -3.795 (mi 12), -2.565 (mi 13), e só volta a zero em dez/2027 (mi 14). Isso é coerente com a realidade, mas o plano gerado "compra" objetivos de consumo que o cliente não tem como pagar; só bem é barrado (70%).
2. **Mês 0 sem lançamentos** (ver dificuldade 2): `fin 300` em mi 0 e `106` em mi 1.
3. **Apartamento comprado com 89,6% do valor.** Em mi 60 a caixinha tem 53.760 e o motor tira 6.240 do cofre para fechar os 60.000 da entrada. É a regra (limite de 70%), mas o cartão do objetivo mostra "adj" (alcançável com ajustes), mesmo que a sobra mensal de 2.100 a 3.800 sobrou no cofre e poderia ter fechado a entrada (o cofre em mi 59 tem 85.350 livres; ver item 4).
4. **Dinheiro parado no cofre enquanto o apartamento fica abaixo da meta.** Em mi 28 o motor para de mandar a sobra ao apartamento (caixinha em 47.051) e a sobra mensal vai ao cofre (2.100/mês) até out/2031; o financeiro livre chega a 139.061 em mi 59 com o objetivo em 90%. Em teoria, o fluxo planejado acha que fecha com o rendimento. Contra a simulação: em mi 60 `obj_apto = -53.760`, e o `real` do extrato diz 53.760 (não 60.000).
5. **Mais aporte, menos resultado** (dificuldade 7). Com a FGTS dedicada de 14.000 em mi 24 e `planned` variável: 785 → 51.888; 900 → 50.375; 1.000 → 48.690; 1.382 → 42.253. Não monotônico. Também a linha `programa.por.apto` foi 13.703 no mi 24 mesmo com o FGTS entrando como renda, e só 5.634 em outro teste.
6. **Aposentadoria: o padrão de vida salta ao parar de trabalhar.** Em mi 423 (62,1 anos) alimentação 900 → 2.250, transporte 400 → 1.000, lazer 500 → 1.250, celular 400 → 1.000 (fator 2,5): o motor escala as despesas para a renda desejada de 5.500, porque a despesa de hoje (2.200 sem aluguel/parcelas) é bem menor que 5.500. O Lucas gasta 2.200 por mês e quer 5.500: o motor trata a diferença como aumento de padrão de vida, não como custo adicional. O saque do cofre sai de R$ 1.700 (5.500 - 3.800). Aos 100 anos (mi 878) o padrão cai para 25% do valor anterior (alimentação 562,50) sem explicação no extrato.
7. **Patrimônio financeiro aos 62 anos: R$ 2,3 milhões (mi 421: 2.294.608), aos 100 anos R$ 12 milhões (mi 878: 12.081.780).** O saque é apenas 1.700/mês e o cofre rende 0,4% a.m. real. O extrato `ff` diz `pmt 13.931` e `sustentavel 13.084`, ou seja, o plano diz que ele poderia gastar R$ 13.000/mês ou mais, algo que o cliente nem pediu. Pode estar certo (sobra de R$ 3.800/mês por 35 anos a 4,9% real), mas assusta; vale o auditor recalcular.
8. **FGTS entra como `in_pas_1` (renda passiva) de 14.000 em mi 24**, rotulado "Saque de FGTS", e a `fin` pula de 18.423 (mi 23) para 34.655 (mi 24) enquanto `prev` vai de 14.000 a 0. Dinheiro certo; o rótulo "renda passiva" pode confundir.
9. **Amortização de R$ 10.000 em mi 72**: `fix_apto_compra` 12.030 (2.030 + 10.000), certo. O financiamento termina em mi 359 (300 parcelas pagas, a última de 821,74) em vez de 360; ou seja, uma única amortização de 10.000 no 13º mês encurta o prazo em 60 meses. Parece muito, mas bate com a conta (Price, 10% a.a., 240.000, parcela 2.030,14; o auditor deve recalcular). A linha de aluguel termina corretamente em mi 60.
10. **Bens em mi 380: 316.000** (apartamento 300.000 + moto 16.000, sem depreciação), e o `div` fica 0 o plano inteiro depois da quitação da moto (mi 22), porque o saldo do financiamento do apartamento não entra em `div` (dificuldade 9).
11. **Cartão quita em mi 8 (jun/2027)** e moto em mi 22 (ago/2028): eventos "Dívida quitada: Cartão renegociado" (semana 1435) e "Financiamento quitado: Moto" (semana 1496). Confere com os dados, mas o cliente falou em agosto/2027 para o cartão.
12. **Liberdade financeira aos 62,09 anos (mi 423),** a mesma idade que o cliente quer parar. O motor aponta `maxGap 1.700`, `forced false`. O plano mostra liberdade "atingida" por construção, já que a renda desejada (5.500) é menor que o INSS (3.800) mais saque de 1.700 em um patrimônio de 2,3 milhões.
