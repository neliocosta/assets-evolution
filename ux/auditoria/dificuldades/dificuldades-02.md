# Cenário 02 (Rafael e Camila): dificuldades de tradução

Plano gravado em `ux/auditoria/planos/plano-02.json`; extrato em `ux/auditoria/extratos/extrato-02.json` (o harness roda sem erro; sem ruína; liberdade em 61,7 anos do Rafael, quando a Camila para aos 60).

## (a) Como traduzi

| Realidade do cliente | Onde / como lancei |
|---|---|
| Rafael 06/1985, Camila 02/1987, casal | `nascimento: "1985-06"`, `conjugeNascimento: "1987-02"`, `tipo: "familia"`, `conjugeNome`; `age`/`spouseAge` saem de `sincronizaIdades` |
| Filhos Lia (05/2018) e Theo (09/2021), dependem até os 25 | `riscos.dependentes[]` (`relacao: "filho"`, `nasc`; `ate` vazio = 25 pela sugestão) |
| "Hoje" = outubro de 2026 | `inicio: "2026-10-19"`, `regraDoInicio: "semana"` (ver dificuldade 1: o dia real, 28/10, empurraria o mês 0 para novembro) |
| Profissões | `rendasAtivas[]` (Engenheiro, Professora; natureza "CLT (empresa privada)") |
| Salário do Rafael R$ 21.000, promoção a R$ 23.000 em jul/2027 | `incomes` `sal_rafael`, mensal dia 5, `steps: [{from:0,21000},{from:9,23000}]` (jul/2027 = mês 9) |
| 13º do Rafael R$ 17.500 (dez) | `incomes` `dec_rafael`, `frequency:"anual"`, `dates:[{m:11,d:20}]`, `steps:[{from:2,17500}]`, `de:"sal_rafael"`, SEM `segue` (ver dif. 6) |
| Bônus R$ 25.000 (mar) | `incomes` `bonus_rafael`, anual, `dates:[{m:2,d:20}]`, `steps:[{from:5,25000}]`, `taxable:false` |
| Salário da Camila R$ 7.800 + 13º R$ 6.500 | `sal_camila` (mensal) e `dec_camila` (anual, dez, `from:2`), `pessoa:"conjuge"` |
| Aluguel da sala R$ 2.800 | `incomes` `aluguel_sala` (`kind:"passiva"`, origem Aluguéis), ligado ao bem pela chave `bens[].renda` |
| Escola R$ 4.800, R$ 6.400 de jan/2031 a 2038 | `expenses` `escola` (fixa): `steps [{0,4800},{51,6400},{147,0}]` (jan/2031 = mês 51; zero a partir de jan/2039) |
| Condomínio/IPTU/contas, saúde, transporte, diarista | despesas fixas mensais `casa` 2.300, `saude` 2.700, `transporte` 2.000, `diarista` 1.800 |
| Alimentação, lazer, vestuário e outros | despesas ajustáveis (`group:"adj"`) 3.600, 2.200, 2.000 |
| CDB e fundos R$ 80.000; reserva R$ 40.000 em conta remunerada | `patrimonio.financeiro[]`, duas linhas do casal; `politica.reserva: 40000` e `riscos.liquidez.d0: 40000` |
| PGBL do Rafael R$ 60.000 | `financeiro[]` `tipo:"pgbl"`, titular (líquido, entra nos investimentos) |
| FGTS do Rafael R$ 85.000, "não pode mexer" | `financeiro[]` `tipo:"fgts"`, `conv:{rentab:0}`: fica fora da liquidez e vira saque à vista na aposentadoria do Rafael |
| Apartamento R$ 950.000 + financiamento Price 600k/360/9% a.a., 1ª parcela jan/2023, parcela 4.677, saldo 581.000 | `patrimonio.bens[0]`: `mercado`, `saldoDevedor`, `credito`, `parcelas`, `juros:9`, `inicio:"2023-01"`, `sistema:"price"`, `parcela`, `iof:"isento"`; parcela no fluxo na linha `parc0` |
| Abate de R$ 60.000 em out/2029 reduzindo a parcela | `bens[0].amortizacoes: [{em:36, valor:60000, modo:"parcela"}]` |
| Sala comercial R$ 330.000 + SAC 200k/180/10%, 1ª jun/2025, parcela 2.555, saldo 181.000 | `bens[1]`: `sistema:"sac"`, `inicio:"2025-06"`, `juros:10`, `iof:"isento"`, `renda:"aluguel_sala"` |
| Carro R$ 78.000 + Price 70k/48, 1,35% a.m., 1ª nov/2025, parcela 1.991, saldo 56.470 | `bens[2]`: `juros:1.35`, `jurosPeriodo:"mes"`, `inicio:"2025-11"`; sem valorização (cliente não deu) |
| Amortização de R$ 20.000 em out/2027 reduzindo o prazo | `bens[2].amortizacoes: [{em:12, valor:20000, modo:"prazo"}]` |
| Empréstimo pessoal 38k/36x1.700, IOF dentro, saldo ~29.800 | `patrimonio.dividas[0]`: `credito:38000`, `parcela:1700`, `inicio:"2025-12"`, `iof:"isento"` (o IOF já está dentro dos 38k) |
| "Quitar o que restar" em mar/2028 com o bônus | `amortizacoes: [{em:17, valor:12012.93, modo:"prazo"}]`: o valor é o saldo do contrato naquele mês, calculado por mim (ver dif. 5) |
| Fatura parcelada 12k em 12x1.160, 1ª abr/2026 | `dividas[1]`: `inicio:"2026-04"`, `iof:"isento"`, `saldoDevedor:5410.84` (valor presente das 5 parcelas que faltam, calculado por mim) |
| Parcelas de todas as dívidas | linhas "Parcela: ..." em `expenses` (`parc0`..`parc4`, `days:[10]`), com degraus, `exc` das amortizações e fim, como o portal grava (`lancaParcela`) |
| Loja de bicicletas, 15% do Rafael, R$ 300.000 | `participacoes[0]` (valor de hoje 300.000; sem lucros/distribuição, o cliente não falou) |
| Perde ~8% ao ano por 4 anos | `valorizacao: {tipo:"taxa", pct:-8, de:0, anos:4}` |
| Em abr/2028 cai 30% de uma vez | `valorizacao: {tipo:"pontual", em:18, pct:-30, motivo}` |
| Viagem R$ 18.000 em 5 meses, sem risco | objetivo `viagem`: `months:5`, `profile:"conservador"`, `kind:"consumo"`, aporte 0 |
| Reforma R$ 45.000 em 36 meses, moderado | `reforma`: `months:36`, `moderado`, `planned:1162` (o necessário) |
| Intercâmbio R$ 70.000 em 60 meses, agressivo | `intercambio`: `months:60`, `agressivo`, `planned:1011` |
| Faculdade R$ 180.000 em 120 meses, moderado | `faculdade`: `months:120`, `moderado`, `dedicated:80000`, `planned:236` |
| Prioridade: faculdade, reforma, intercâmbio, viagem | `objetivosOrdem: ["seguranca","faculdade","reforma","intercambio","viagem","liberdade"]` |
| Parar aos 62 (Rafael) e 60 (Camila); R$ 20.000/mês | `retireAge:62`, `spouseRetireAge:60`, `desired:20000` |
| INSS Rafael R$ 7.500 aos 65; Camila R$ 4.800 aos 62 | `passive[]`: `startMi:284` (jun/2050) e `startMi:268` (fev/2049), `net` = valor informado, `pessoa` |
| Vida até os 90 | `lifeExp: 90` |

## (b) Dificuldades

1. **O mês 0 do plano não é o mês do dia de hoje.**
   - Cliente: "hoje" é outubro de 2026 e todas as datas vêm como "daqui a N meses" (5, 18, 36...) e como mês/ano (mar/2027, abr/2028).
   - Sistema: o mês 0 é calculado pela semana de hoje contada a partir do nascimento (dia 1 do mês de nascimento do titular), e não pelo mês do `inicio`. Com `inicio: "2026-10-28"` (hoje de verdade) e nascimento 1985-06, o mês 0 virou **novembro/2026** (`M0 = {y:2026, m:10}`); com qualquer dia de 05 a 27/10 ficou outubro.
   - Aproximação: usei `inicio: "2026-10-19"`, para que o mês 0 seja outubro e os "daqui a N meses" batam com as datas do cliente.
   - Distorção: nenhuma no resultado, mas é fácil o consultor errar todas as datas do plano em um mês sem perceber. O dia do nascimento só tem "AAAA-MM" no cadastro e já afeta a grade semanal.
   - Tipo: COMPORTAMENTO SURPREENDENTE do motor (e CAMPO CONFUSO: `inicio` parece uma data, mas ancora em outra coisa).

2. **"X parcelas pagas" do cliente não bate com `k0` do motor.**
   - Cliente: apartamento 46 pagas (jan/2023 a out/2026), sala 17, carro 12, empréstimo 11, cartão 7. Ou seja, a parcela de outubro já foi paga.
   - Sistema: com `inicio`, o motor calcula `k0` (parcelas já pagas) pelo mês do calendário e trata a parcela do mês 0 como ainda a pagar: ficou 45, 16, 11, 10, 6. O "saldo de hoje" do contrato é o saldo antes da parcela de outubro. A parcela de outubro só some do caixa porque cai no dia 10, antes de hoje (se a parcela cair depois do dia de hoje, ela é cobrada duas vezes de fato: no cliente já foi paga).
   - Aproximação: mantive `inicio` (que é correto no calendário: último pagamento dez/2052) e o saldo do extrato do cliente em `saldoDevedor`; o motor reescala o caminho do contrato para começar nesse saldo. Os `days:[10]` das parcelas são suposição minha.
   - Distorção: pequena nos saldos (apartamento: contrato 581.342 contra extrato 581.000; sala: 182.222 contra 181.000), mas a taxa que o motor "descobre" pela parcela saiu 9,93% a.a. na sala (o cliente disse 10%), e a contagem exibida de "pagas/faltam" fica 1 a menos/mais que a do cliente. No cartão derivei o saldo na mão para ficar 5.410,84.
   - Tipo: COMPORTAMENTO SURPREENDENTE / FORMATO NÃO DOCUMENTADO (a convenção "a parcela do mês 0 ainda não foi paga" não está escrita onde se digita `inicio`).

3. **IOF padrão distorce a taxa de contratos que não têm IOF no valor informado.**
   - Cliente: parcelas 4.677 (600k, 9% a.a., 360x Price), 1.991 (70k, 1,35% a.m., 48x), 2.555 (SAC) batem exatamente com o crédito informado e a taxa informada, sem IOF.
   - Sistema: `iof` vazio = "financiado" (IOF somado ao crédito). Isso entrou também no financiamento do apartamento, onde o IOF é zero. Com o IOF padrão, o motor derivou 8,60% a.a. no apartamento (em vez de 9,0%), saldo do contrato 600.189 e parcela futura diferente.
   - Aproximação: marquei `iof:"isento"` em todos os contratos (e no empréstimo pessoal, porque o cliente disse que o IOF já está dentro dos R$ 38.000).
   - Distorção: sem o ajuste, ~0,4 ponto de taxa no apartamento. O consultor não percebe: o padrão não aparece como escolha na tela do plano exportado.
   - Tipo: COMPORTAMENTO SURPREENDENTE (padrão silencioso) / CAMPO CONFUSO.

4. **A taxa informada do contrato não manda; a parcela manda.**
   - Cliente: informou juros e parcela dos cinco contratos.
   - Sistema: com `parcela` preenchida, a taxa é derivada dela e a informada só é conferida. No empréstimo pessoal e no cartão o cliente não deu taxa, então o motor deriva sozinho (empréstimo 2,84% a.m. = 40% a.a.; cartão 2,36% a.m. = 32% a.a.).
   - Aproximação: nenhuma; apenas registro. Os juros do empréstimo e do cartão são implícitos, não informados.
   - Distorção: nenhuma se as parcelas estiverem certas.
   - Tipo: DADO FALTANDO do cliente (taxas do empréstimo e do cartão) + CAMPO CONFUSO (quem manda, taxa ou parcela).

5. **"Quitar o que restar" não existe como ação.**
   - Cliente: em mar/2028 quita o saldo do empréstimo.
   - Sistema: a amortização pede valor em reais. Se o valor passa do saldo, o motor limita ao saldo (`Math.min(bal, valor)`), mas o cartão do cliente mostraria o número digitado.
   - Aproximação: calculei o saldo do contrato naquele mês (R$ 12.012,93, índice k0+17 da tabela) e lancei esse valor, modo prazo.
   - Distorção: se mudar qualquer dado do contrato, a quitação deixa de ser exata e o consultor precisa recalcular na mão. Fica o saldo antigo digitado.
   - Tipo: LACUNA do sistema.

6. **13º que não segue o salário.**
   - Cliente: 13º do Rafael R$ 17.500 (o salário é 21.000, depois 23.000).
   - Sistema: o 13º do portal usa `segue` (vira o líquido do salário). Se eu usasse `segue`, valeria 21.000/23.000.
   - Aproximação: 13º independente, valor fixo 17.500, sem `segue`, preso ao salário só por `de`.
   - Distorção: após a promoção de jul/2027, o 13º real provavelmente sobe junto, e eu o mantive em 17.500 (o cliente não disse que sobe). Para ~R$ 2.000 de 13º a menos por ano.
   - Tipo: DADO FALTANDO do cliente (o 13º sobe com a promoção?) / CAMPO CONFUSO (`segue` é tudo ou nada).

7. **Valores líquidos informados, mas o sistema precisa de bruto.**
   - Cliente: tudo líquido ("todas líquidas"). Bruto de salário, 13º e bônus não existe.
   - Sistema: `gross` alimenta IR e INSS. Coloquei `gross` = líquido.
   - Distorção: IR e INSS calculados na página tributária ficam subestimados. Não afeta o fluxo.
   - Tipo: DADO FALTANDO do cliente.

8. **Amortização aparece no saldo devedor um mês depois do dinheiro sair.**
   - Cliente: em out/2029 sai R$ 60.000 para o apartamento; em out/2027, R$ 20.000 do carro; em mar/2028, R$ 12.013 do empréstimo.
   - Sistema: o caixa sai no mês certo (mês 36: parcela 4.677 + 60.000 = 64.677 na linha da parcela), mas `saldoDevedorEm(k)` é o saldo antes da parcela do mês: apartamento 561.078 (mês 36) e só 500.483 (mês 37).
   - Distorção: por um mês o patrimônio líquido parece cair 60.000 (dinheiro saiu e a dívida ainda não baixou). Se o cliente olhar o gráfico em out/2029, o patrimônio mostra um "buraco" de um mês. Idem carro e empréstimo.
   - Tipo: COMPORTAMENTO SURPREENDENTE do motor.

9. **O abate do apartamento sai "do FGTS e do bônus", mas o FGTS não é movível.**
   - Cliente: R$ 60.000 do FGTS e do bônus (sem dizer quanto de cada). E, no patrimônio, o FGTS "não pode mexer".
   - Sistema: o FGTS é uma caixa à parte que só vira renda na aposentadoria; a amortização sai do caixa livre.
   - Aproximação: os R$ 60.000 saem inteiros do caixa (patrimônio livre), e o FGTS (R$ 85.000) fica intacto até a aposentadoria.
   - Distorção: o patrimônio livre fica R$ 60.000 menor do que seria se parte viesse do FGTS (em out/2029 o caixa livre baixa de 285 mil a 143 mil), e o FGTS aos 62 anos fica superestimado (85.000 em vez de 85.000 menos a parte usada).
   - Tipo: LACUNA do sistema (sem "pagar amortização com FGTS") + DADO FALTANDO (quanto vem de cada).

10. **FGTS rende como a taxa do plano por padrão.**
    - Cliente: R$ 85.000, nada sobre rentabilidade.
    - Sistema: sem `conv.rentab`, a caixa rende a taxa do plano (4,9% a.a. real): 85.000 virariam ~228.000 aos 62. O FGTS rende TR + 3% a.a., ou seja, ~0% real.
    - Aproximação: `conv.rentab: 0` (premissa minha).
    - Distorção: sem o ajuste, o saque do FGTS ficaria 2,7x maior.
    - Tipo: COMPORTAMENTO SURPREENDENTE (padrão otimista) + DADO FALTANDO.

11. **Queda de 8% ao ano por 4 anos e "depois disso fica parado" é ambíguo.**
    - Cliente: "perde 8% ao ano por 4 anos", "em abril de 2028 cai 30% de uma vez", "depois disso fica parado".
    - Sistema: taxa por período + salto pontual, independentes.
    - Aproximação: taxa de -8% do mês 0 ao 48, salto de -30% no mês 18, e parado depois dos 48 meses. Resultado: 300.000 → 185.311 em abr/2028 → 150.443 constante.
    - Distorção: se "depois disso fica parado" quer dizer "depois da queda de abril/2028", a taxa deveria parar no mês 18 e o valor ficaria em ~185.000 (diferença de ~35.000 na participação).
    - Tipo: DADO FALTANDO do cliente (ambiguidade).

12. **Participação do Rafael em 15% de uma loja: sem renda nem titularidade.**
    - Cliente: R$ 300.000 é a parte do Rafael. Não disse se a loja distribui lucros.
    - Sistema: participação tem `nome` e `valor`; a renda de lucros seria uma linha do fluxo.
    - Aproximação: só o valor e a desvalorização; sem distribuição.
    - Tipo: DADO FALTANDO (distribuição de lucros) / LACUNA leve (sem campo de titularidade/% na participação; coloquei 15% no nome).

13. **"A viagem só se sobrar" não existe no sistema.**
    - Cliente: faculdade > reforma > intercâmbio > viagem, e a viagem só se sobrar.
    - Sistema: um objetivo ligado sempre acontece na data e sai do patrimônio livre; a prioridade só divide a sobra mensal dos aportes.
    - Aproximação: ordem de prioridade gravada; aportes dos três primeiros no necessário; viagem sem aporte nem patrimônio dedicado (status "Requer revisão"). Ainda assim o motor gasta R$ 18.000 do patrimônio livre em mar/2027 (`out_obj_viagem`), o que é o contrário de "só se sobrar".
    - Distorção: a viagem, que o cliente só faria com sobra, é paga com patrimônio livre (caixa livre passa de 103 mil a 98,6 mil em março); a sobra mensal do período é negativa (-723 a +1.277).
    - Tipo: LACUNA do sistema.

14. **Aportes são fixos e a sobra é pequena: o plano depende do patrimônio livre.**
    - Cliente: entradas de ~31.600/mês e saídas de ~33.500 no início (com as parcelas): sobra de -1.883 a +1.277 nos primeiros 18 meses.
    - Sistema: aporte mensal fixo (`planned`). Meus aportes somam 2.409/mês, que o fluxo não paga: o motor cobre a diferença com o caixa livre (mínimo de 66.900 em nov/2027, sempre acima dos 40.000 da reserva).
    - Distorção: o plano "fecha" só porque existe patrimônio livre (100 mil). Os "dedicados" também são minha decisão: R$ 80.000 de aplicações todos para a faculdade (o cliente não dividiu). Escolha de consultor; o cliente só deu a ordem de prioridade.
    - Tipo: DADO FALTANDO do cliente (quanto do patrimônio atual vai para cada sonho) + LACUNA do sistema (sem mostrar "a sobra mensal não paga estes aportes" no plano exportado).

15. **Despesas sem dia de vencimento.**
    - Cliente: só valores mensais.
    - Aproximação: `week:0` (diluídas nas quatro semanas) em tudo, e `days:[10]` nas parcelas de dívidas (o padrão do portal).
    - Tipo: DADO FALTANDO. Afeta só a distribuição semanal, não os totais.

16. **Plano de saúde e escola lançados como despesa, sem ligação com Riscos.**
    - Cliente: plano de saúde R$ 2.700 da família.
    - Sistema: o portal tem `riscos.saude.vidas` (prêmio por vida), mas o cliente deu só o total; lancei como linha fixa.
    - Distorção: a página de riscos (saúde) fica vazia. Tipo: DADO FALTANDO.

17. **Sem valorização dos bens.**
    - Cliente: apartamento, sala e carro "valem" tais valores, sem dizer como evoluem.
    - Aproximação: valores constantes (em termos reais). O carro, que perde valor de verdade, também fica parado em 78.000; o patrimônio em bens fica em 1.358.000 por 50 anos.
    - Distorção: patrimônio de bens superestimado ao longo do tempo (carro). Tipo: DADO FALTANDO.

18. **INSS informado em valor único.**
    - Cliente: R$ 7.500 e R$ 4.800 "esperados" sem dizer se brutos ou líquidos.
    - Aproximação: `net` = valor informado, `tax: 0`.
    - Tipo: DADO FALTANDO. Se forem brutos, a renda da aposentadoria está superestimada em ~10-15%.

## (c) Premissas que assumi

- Hoje = outubro/2026; mês 0 = outubro (via `inicio: 2026-10-19`).
- Valores em reais de hoje (o motor usa taxa real); renda desejada de R$ 20.000 em valores de hoje, como o cliente disse.
- Parcelas das dívidas vencem no dia 10 (padrão do portal); isso as deixa fora do caixa do mês 0.
- Todos os contratos sem IOF adicional (`iof:"isento"`): as parcelas informadas batem sem IOF.
- Escola "até 2038" = até dezembro de 2038, inclusive; o aumento de R$ 6.400 entra em janeiro de 2031.
- A queda de 8% ao ano vale por 48 meses a partir de hoje; "fica parado" = depois dos 4 anos (dif. 11).
- FGTS rende 0% real; saque total aos 62 anos do Rafael; PGBL fica como investimento líquido.
- 13º do Rafael continua R$ 17.500 após a promoção.
- Saldo do cartão parcelado = valor presente das 5 parcelas que faltam à taxa implícita (R$ 5.410,84).
- Quitação do empréstimo em mar/2028 = saldo do contrato naquele mês (R$ 12.012,93).
- Os R$ 60.000 do abate do apartamento saem 100% do caixa livre (nenhum do FGTS).
- Os R$ 80.000 das aplicações ficam dedicados à faculdade; aportes mensais de reforma 1.162, intercâmbio 1.011, faculdade 236; viagem sem aporte.
- Valores de renda informados como líquidos; `gross` = líquido; INSS informado como líquido.
- Bens (apartamento, sala, carro) sem valorização.

## (d) Coisas estranhas que notei no resultado

- **Mês 0 (out/2026) com "entradas 0" e "saídas 10.700".** Só entram as semanas depois de hoje; salário e parcelas do dia 5/10 não aparecem. Normal, mas o mês 0 mostra saldo -10.700 (cofre vai de 180.000 a 169.600) sem nenhuma entrada, o que parece um erro ao ler a tabela.
- **Dez/2026 (mês 2) e mar/2027 (mês 5)**: entradas 55.600 e 56.600 (13º de 24.000 e bônus de 25.000), conforme esperado. Mês 12 (out/2027): saídas 52.217 (carro, 20.000 de amortização + 1.991). Mês 36 (out/2029): saídas 133.315 (60.000 do abate + 45.000 da reforma + normais).
- **Amortização com saldo devedor em atraso de um mês**: apartamento 561.078 (mês 36) e 500.483 (mês 37); carro 41.123 (mês 12) e 20.150 (mês 13); empréstimo 12.840 (mês 17) e 0 (mês 18). O patrimônio líquido cai por um mês.
- **Evento "Início: Saque de FGTS... Renda passiva líquida passa a R$ 85.000/mês"** (semana 3231, ~jun/2047): um saque único de 85.000 aparece como "renda passiva líquida por mês" e some na semana seguinte ("passa a R$ 0/mês"). Confuso para o cliente.
- **Liberdade financeira "forçada"** (`ff.forced = true`) aos 61,7 anos do Rafael (mês 244, fev/2047): o patrimônio é de R$ 4,07 milhões, mas `ff.sustentavel` = R$ 19.073/mês, abaixo dos R$ 20.000 desejados, e `ff.pmt` = 21.912 (não sei o que é). A liberdade começa quando a Camila (60) para; o Rafael continua trabalhando por mais alguns meses.
- **Viagem de março de 2027 com aporte 0 e status "risk"**: o fluxo ainda tem `out_obj_viagem = 18.000` em mar/2027 (mês 5). O objetivo é gasto mesmo "não alcançado" (real = 0).
- **Participação (loja)**: 266.576 (mês 17) → 185.311 (mês 18); evento "Desvalorização: -R$ 79.419", corretos pela conta (-30% sobre 264.730). Depois continua caindo -8% até o mês 48 (150.443).
- **Patrimônio financeiro muito alto no fim** (R$ 4,1 milhões aos 61 anos, R$ 5,9 milhões em 2060): vem da taxa real de 4,9% a.a. do plano (0,4% ao mês) e da sobra de ~10 mil/mês depois que as dívidas acabam; parece otimista para uma família que começa com sobra negativa.
- **Taxas implícitas altíssimas**: empréstimo pessoal 40% a.a., cartão 32% a.a. (derivadas da parcela). Se o consultor não perceber, parecem "taxas informadas".
- **Carro**: as últimas parcelas 1.991... e uma final de R$ 420,39 no mês 24 (resíduo do prazo encurtado), ok.
- **Sala comercial: juros derivados 9,93% a.a.** contra 10% informado (ver dif. 2).
