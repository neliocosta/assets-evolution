# Dificuldades do cenário 08 (Osvaldo e Ione Brandão, produtores rurais)

Aviso de método: ao abrir o arquivo do cenário, a ferramenta de leitura devolveu o arquivo inteiro, inclusive a seção "Para o auditor". Eu não deveria ter lido; li. Montei o plano pela conversa e pelo código do motor, mas o teste não é 100% cego. Os números que o motor devolveu (saldo do trator R$ 402.031, parcela atual R$ 5.154,24, parcela do crédito R$ 10.865, parcela SAC R$ 4.383, líquido da venda R$ 846.000) conferem com o que se calcula só a partir da fala do cliente.

Plano gravado em `ux/auditoria/planos/plano-08.json` (montado por script, no formato do portal: linhas "Parcela: ..." com degraus como `lancaParcela`, `lancaCredito` e `sincronizaContribuicoes` do `tela-consultor.html` fazem). Extrato em `ux/auditoria/extratos/extrato-08.json`. Resultado: roda sem erro, liberdade aos 62,1 anos, a ruína (dinheiro acaba) aparece no mês 2 (dez/2026).

## (a) Como traduzi

| Realidade do cliente | Onde / como lancei |
|---|---|
| Osvaldo, jun/1972; Ione, nov/1975; casal | `nascimento: "1972-06"`, `conjugeNascimento: "1975-11"`, `tipo: "familia"`, `age: 54`, `spouseAge: 51` (o dia de nascimento não foi dado; o motor assume dia 1) |
| "Hoje" = out/2026 (crédito em jan/2027 = mês 3, venda em abr/2029 = mês 30) | `inicio: "2026-10-19"`, `regraDoInicio: "semana"`; mês 0 = out/2026 |
| Marina, 19 anos, depende até 25 | `riscos.dependentes[0]`: `relacao: "filho"`, `nasc: "2007-04"` (suposto), `ate: 25` |
| Profissões | `rendasAtivas[]` (produtor rural / Empresário; professora / CLT) |
| Safra de soja R$ 420.000 líquidos em maio, todo ano | `incomes[id=soja]`: `frequency: "anual"`, `dates: [{m:4,d:15}]`, `steps:[{from:0,value:420000}]`, `pessoa: "titular"`, `destino: "reforma"` |
| Safrinha de milho R$ 150.000 em setembro | `incomes[id=milho]`: anual, `dates: [{m:8,d:15}]`, `pessoa: "titular"` |
| "Paro de plantar" a partir de jun/2034 | não lancei degrau zero: contei com `retireAge: 62` + `pessoa: "titular"` (o motor para a renda ativa de quem se aposenta). Conferido: nenhuma safra depois do mês 91 |
| Ione R$ 6.200/mês | `incomes[id=ione]`, mensal, dia 5, `pessoa: "conjuge"` (para sozinha aos 60 por `spouseRetireAge`) |
| Arrendar 60% da terra, R$ 28.000/mês, a partir de jun/2034 | `incomes[id=arrendamento]`, `kind: "passiva"`, `origin: "Aluguéis"`, `steps:[{from:92,value:28000}]`, e ligada à terra por `patrimonio.bens[Terra].renda = "arrendamento"` |
| Gastos R$ 21.000/mês | 3 despesas: "Marina: escola e apartamento" R$ 4.500 (fixa, degrau zero no mês 66 = Marina com 25 anos), "Plano de saúde" R$ 3.600 (fixa), "Casa, mercado, combustível e empregados" R$ 12.900 (ajustável) = 21.000 |
| Aplicações financeiras R$ 45.000 | `patrimonio.financeiro[0]` (sem instituição) |
| FGTS da Ione R$ 38.000, "não mexe" | `financeiro[1]`: `tipo: "fgts"`, `titularidade: "conjuge"`, `conv: {aos: 90, forma: "saque"}` (saque só aos 90, para na prática nunca mexer) |
| Terra R$ 4,2 mi, valoriza 4% a.a. por 20 anos | `bens[0]`: `mercado: 4200000`, `valorizacao: [{tipo:"taxa", pct:4, de:0, anos:20}]` |
| Máquinas R$ 900 mil, perdem 10% a.a. por 8 anos | `bens[1]`: `valorizacao: [{tipo:"taxa", pct:-10, de:0, anos:8}]` |
| Casa na cidade R$ 700 mil | `bens[2]`, sem valorização (não foi dita) |
| Lote em Sinop R$ 600 mil, corretor diz 8% a.a. | `bens[3]`: `valorizacao: [{tipo:"taxa", pct:8, de:0, anos:10}]` |
| Proposta firme R$ 900 mil em abr/2029 (mês 30), custos R$ 54.000, R$ 150 mil vão para a entrada da casa da Marina | `bens[3].venda`: `{em:30, preco:900000, custos:[{nome:"Comissão de 6% e ITBI", valor:54000}], destinos:[{objetivo:"casa-marina", valor:150000}]}` |
| Consórcio do trator (contemplado), carta 420 mil, 100 parcelas, adm 15%, fundo 3%, reajuste 4% após a 14ª e a cada 12, 1ª parcela jan/2025, 22 pagas, 78 restantes, parcela de hoje R$ 5.154, sem lance | `patrimonio.dividas[0]`: `modalidade:"consorcio"`, `carta:420000`, `parcelas:100`, `txAdm:15`, `fundoReserva:3`, `reajuste:4`, `reajusteApos:14`, `restantes:78`, `parcela:5154`, `saldoDevedor: 402030.72` (calculado pelo contrato, porque o cliente não deu o saldo), mais a linha "Parcela: Consórcio do trator" com degraus a cada reajuste (`linha`, `linhaPropria`) |
| Consórcio do caminhão (a contemplar), carta 500 mil, 80 parcelas, 10 pagas, parcela R$ 7.200, contemplação dez/2027, lance R$ 50.000 | `financeiro[2]`: `tipo:"consorcio"`, `valor:72000` (10 x 7.200, suposição), `cons:{carta:500000, parcelas:80, pagas:10, parcela:7200, reajuste:0, contemplacaoEm:"2027-12", lance:50000, embutidoPct:0}` e a linha "Parcela: Consórcio: Caminhão" (`cons.linha`) |
| A carta do caminhão vira o caminhão, não dinheiro | `compromissos[0]`: "Compra do caminhão com a carta", `em:14`, `valor:500000` (ver dificuldade 4) |
| Crédito de custeio R$ 120.000 em jan/2027, 12x, 1,3% a.m., Price | `creditos[0]`: `{em:3, valor:120000, parcelas:12, juros:1.3, sistema:""}` + linha "Parcela: Crédito de custeio" (degraus a partir do mês 4, R$ 10.865) |
| Sonho 1: reforma da sede R$ 90.000 em out/2027, agressivo | `objectives[reforma]`: `kind:"consumo"`, `months:12`, `amount:90000`, `profile:"agressivo"`, `planned:0`, financiada pela safra de soja via `incomes[soja].destino = "reforma"` |
| Sonho 2: casa para a Marina R$ 500.000 em out/2029, entrada R$ 150 mil da venda, SAC 240x a 10,5% a.a. sem IOF, amortiza R$ 100 mil em out/2030 reduzindo prazo | `objectives[casa-marina]`: `kind:"bem"`, `months:36`, `preco:500000`, `amount:150000`, `dedicated:0`, `planned:0`, `compra:{modo:"financiamento", sistema:"sac", parcelas:240, juros:10.5, iof:"isento", amortizacoes:[{em:48, valor:100000, modo:"prazo"}]}`; a entrada vem da venda (`destinos`) |
| Aposentadoria: Osvaldo 62, Ione 60, R$ 20.000/mês de hoje, vive até 90 | `retireAge:62`, `spouseRetireAge:60`, `desired:20000`, `lifeExp:90` |
| INSS R$ 7.000 (Osvaldo, 62) e R$ 4.000 (Ione, 60) | `passive[]`: `startMi:92` / `startMi:109`, `pessoa` titular / conjuge, `net` 7.000 / 4.000, `tax:0` |
| Rentabilidades | padrão da casa copiado do plano-exemplo (`rate 0.004`, perfis 0,4% / 0,5% / 0,6% ao mês); o cliente não falou de taxa |

## (b) Dificuldades

1. **Compra do caminhão com a carta: o bem nunca entra no patrimônio.** Cliente: espera ser contemplado em dez/2027 com lance de R$ 50.000 e comprar um caminhão de R$ 500.000. Sistema: o consórcio "a contemplar" do Patrimônio (`financeiro` tipo `consorcio`) joga a carta no financeiro como dinheiro livre (no extrato, mês 14: entrada `in_pas_3` de R$ 450.000, líquida do lance) e a dívida que sobra aparece nas dívidas (R$ 370 mil no mês 13 para R$ 700 mil no mês 14, sem o caminhão do lado dos ativos). O modelo do consórcio dentro do objetivo ("compra.consorcio") compraria o bem, mas não tem "parcelas já pagas" (o `inicio` não aceita mês negativo) e eu ficaria com 80 parcelas contadas a partir de hoje. Aproximação: manter o consórcio do Patrimônio e lançar um compromisso de R$ 500.000 no mês 14 para tirar a carta do caixa. Distorção: o financeiro fica certo (líquido de -R$ 50 mil de lance), mas o patrimônio total fica R$ 500 mil menor do que o real (o caminhão não existe como bem) e o patrimônio líquido de 2028 em diante está subestimado. Tipo: LACUNA do sistema.

2. **O consórcio a contemplar pede o "valor pago" como patrimônio financeiro.** O cliente deu 10 parcelas pagas de R$ 7.200; não deu o valor acumulado (fundo comum separado de taxa de administração). Usei 10 x 7.200 = R$ 72.000. Esse valor entra em `initialWealth` (155.000 = 45 mil de aplicações + 38 mil de FGTS + 72 mil de consórcio) e some na contemplação. Distorção: o "financeiro" do cliente vira R$ 155 mil, mais de três vezes os R$ 45 mil líquidos que ele tem; parte dos 72 mil é taxa que não volta. Tipo: DADO FALTANDO do cliente (taxa de administração e fundo do caminhão, reajuste do grupo) e CAMPO CONFUSO (o nome "valor" no consórcio).

3. **Reajuste e taxas do consórcio do caminhão não foram ditos.** Pus `reajuste: 0` e nem usei `txAdm`/`fundoReserva`, porque no consórcio a contemplar o motor não usa taxas, só a parcela. Se o grupo reajusta como o do trator (4% a.a.), a parcela de R$ 7.200 sobe e o fluxo piora. Tipo: DADO FALTANDO do cliente.

4. **Lance: "do bolso" ou embutido?** O cliente disse "lance de R$ 50.000". Pus `embutidoPct: 0` (tudo do bolso). O motor desconta o lance inteiro da carta que entra (carta menos lance = R$ 450.000) tanto faz quanto está embutido, então o efeito no caixa é o mesmo; o campo só muda o rótulo. Distorção pequena. Tipo: COMPORTAMENTO SURPREENDENTE (o comentário do código diz que o lance do bolso "sai do financeiro", mas a conta só abate da carta) e DADO FALTANDO.

5. **Consórcio do trator: duas informações do cliente não batem.** "1ª parcela em jan/2025" e "22 pagas, 78 restantes" só são compatíveis se a parcela de out/2026 já foi paga. Se eu uso `inicio: "2025-01"`, o motor calcula 21 pagas e 79 restantes (a de out/2026 ainda por pagar). Usei `restantes: 78` e deixei o `inicio` vazio. Efeito: o mês 0 paga a parcela 23 e o primeiro reajuste (depois da 26) cai no mês 4 (fev/2027). Distorção: um mês de defasagem na data de cada reajuste e na quitação (mês 78, abr/2033). Tipo: CAMPO CONFUSO (dois jeitos de dar a mesma informação, sem dizer qual manda) e DADO FALTANDO.

6. **Saldo devedor do trator: o cliente não deu.** O motor ignora a dívida inteira se `saldoDevedor` for zero (`saldoDevedorEm` devolve 0). O consultor precisa calcular. Usei o saldo do próprio contrato (R$ 402.030,72, `ct.saldoHoje`), que bate com a parcela atual R$ 5.154,24. Se eu tivesse esquecido, o patrimônio subiria R$ 402 mil e a dívida some, mas as parcelas continuariam saindo do fluxo (a linha é separada). Tipo: COMPORTAMENTO SURPREENDENTE (dívida some em silêncio) e DADO FALTANDO.

7. **A parcela da dívida é uma linha de despesa separada do contrato.** Para o consórcio do trator e o crédito de custeio, o portal cria a linha "Parcela: ..." com degraus. Gravando o JSON direto, é preciso reproduzir `degrausDaParcela`, `setFim` e `lancaCredito`. Não existe função exportada para isso, então tive que copiar o código da tela. Se alguém grava só a dívida, a parcela não sai do fluxo. Tipo: FORMATO NÃO DOCUMENTADO.

8. **Renda sazonal (maio e setembro) funciona, mas o orçamento mensal engana.** A safra é "anual com datas": o motor aceitou bem. O que o cliente vive (déficit de out a abr, superávit em mai e set) aparece no extrato, mas a média de 12 meses (gestão financeira, Orçamento) esconde isso: entradas médias de R$ 54.000 contra saídas de R$ 21.000 a R$ 33.500, com superávit aparente. O diagnóstico por média diria "investidor"; o cliente vive no sufoco. Tipo: LACUNA do sistema (visão de caixa por mês/sazonalidade).

9. **Reforma da sede: só dá certo com "extra com dono".** Com aporte mensal (R$ 7.336, a "necessário") o motor tira o dinheiro do cofre nos meses de déficit, a caixinha é usada para pagar a casa (`mov_obj_reforma` negativo nos meses 2, 5 e 6) e no mês 12 só havia R$ 37 mil dos R$ 90 mil. A solução foi usar `incomes[soja].destino = "reforma"`: a safra de maio de 2027 paga a reforma inteira (caixinha com R$ 89 mil no mês 7). A fórmula "aporte mensal necessário" que o cartão do objetivo mostra (R$ 7.336) não vale para esse cliente. Deixei `planned: 0`. Distorção: o cartão do objetivo continua mostrando "necessário R$ 7.336/mês" mesmo com o objetivo fechado pela safra. Tipo: COMPORTAMENTO SURPREENDENTE e LACUNA (o "necessário" não conhece a sazonalidade da renda).

10. **Lote em Sinop: 8% de valorização contra preço firme de R$ 900 mil.** O corretor diz 8% a.a. (projeta R$ 727.295 no mês 30) e a proposta firme é R$ 900.000. Lancei os dois, como o cliente disse. No bem, ao contrário da participação, o preço da venda não vira alvo da curva: o bem sobe até R$ 727 mil e no mês 30 vende por R$ 900 mil, com salto de R$ 172.705 no patrimônio (bens 6,72 mi no mês 29, 6,02 mi no mês 30; financeiro +R$ 822 mil). A saída "correta" seria usar `valorizacao tipo "alvo"` em R$ 900 mil no mês 30, mas isso "corrige" a fala do cliente. Tipo: COMPORTAMENTO SURPREENDENTE (bem e participação se comportam diferente) e DADO FALTANDO (qual das duas verdades vale).

11. **Custos da venda do lote: "6% de comissão e ITBI (R$ 54.000)".** 6% de 900 mil já são R$ 54.000, então entendi que R$ 54.000 é o total (comissão e ITBI juntos). Se for 6% de comissão mais ITBI de R$ 54.000, o líquido cai R$ 54 mil a mais. Lancei um custo só, `valor: 54000`. Tipo: DADO FALTANDO do cliente.

12. **Casa para a Marina entra no patrimônio com o valor da entrada (R$ 150 mil), não do imóvel (R$ 500 mil), e o financiamento não aparece nas dívidas.** Conferi no extrato: no mês 36 os bens sobem só R$ 161 mil (incluindo a alta da terra), a coluna `div` não ganha os R$ 350 mil, e `det.divs` nem tem posição para a compra. A parcela SAC sai certa (R$ 4.383 no mês 36, R$ 104.236 no mês 48 com a amortização), mas depois disso cada real de principal pago some do patrimônio (o bem fica em R$ 150 mil para sempre e a dívida não é vista). O patrimônio líquido fica subestimado em até R$ 350 mil na quitação. Tipo: COMPORTAMENTO SURPREENDENTE (documentado como "o bem usa o necessário na data", mas o efeito é grande).

13. **Depois da liberdade, as despesas disparam para R$ 41 mil por mês.** O cliente quer R$ 20.000/mês e gasta R$ 21.000. No mês 93 (jul/2034) o plano de saúde passa de R$ 3.600 para R$ 8.367 e "casa, mercado..." de R$ 12.900 para R$ 29.981 (total com a parcela da casa da Marina ≈ R$ 41 mil). Causa: `m.scale` (linha 2118 do motor), "o padrão de vida se ajusta à renda disponível": como arrendamento (28.000) + INSS (7.000) + Ione (6.200) passam muito de R$ 20.000, o motor escala todas as despesas para gastar tudo. A renda desejada deixa de ser um teto. Distorção grande: gasto de aposentadoria quase o dobro do que o cliente declarou; o patrimônio financeiro cresce de R$ 3,1 mi (mês 93) para R$ 18,5 mi (mês 540) mesmo assim. Tipo: COMPORTAMENTO SURPREENDENTE.

14. **A liberdade chega no mês 93, um mês depois do Osvaldo parar.** O Osvaldo faz 62 em jun/2034 (mês 92); o arrendamento e o INSS começam no 92 (como pedi), mas `ff.mi` é 93 (62,075 anos). Não alterei nada; é só defasagem de um mês causada pela data de nascimento sem dia. Tipo: DADO FALTANDO (dia do nascimento).

15. **Ione para de trabalhar no mês 107, antes do INSS.** O último salário é do mês 107 (set/2035); o INSS de R$ 4.000 começa no 109 (nov/2035), como o cliente disse. Fica um buraco de 1 a 2 meses sem a renda dela, porque o motor trata nov/1975 como dia 1, caindo no ciclo de outubro. Tipo: DADO FALTANDO (dia do nascimento) e COMPORTAMENTO SURPREENDENTE (ciclo do mês começa no dia 5).

16. **FGTS "não mexe".** Não há opção "nunca sacar". Tive que pôr `aos: 90` (a expectativa de vida). No extrato, o evento "Saque de FGTS: FGTS da Ione" aparece aos 90 anos com "renda passiva líquida R$ 257.128/mês" (o saque único dividido por um mês). Também entra em "patrimônio financeiro" (e o rendimento é a taxa do plano, 4,9% a.a. real, em vez da do FGTS). Tipo: LACUNA do sistema e COMPORTAMENTO SURPREENDENTE.

17. **Rendas da safra: sem categoria.** `ORIGENS` não tem "receita rural" ou "resultado da atividade". Usei "Outras receitas", tributável. Também não há como dizer que a safra não é salário nem lucro de empresa (importa para IR). O IR, os sócios e o INSS não foram preenchidos (o cliente não falou). Tipo: LACUNA do sistema.

18. **Arrendamento sem custo de produção evitado.** Ao parar de plantar, o cliente também para de ter custos de lavoura; mas o cliente já dá a safra "líquida" e o gasto familiar "R$ 21 mil", então não há linha de custo a apagar. Só registro que o arrendamento de 60% deixa 40% da terra sem destino e sem renda. Tipo: DADO FALTANDO do cliente.

19. **Despesas sem detalhamento.** O cliente deu R$ 21.000 e três itens (Marina R$ 4.500, saúde R$ 3.600 e um grupo de "casa, mercado, combustível, empregados" sem valor por item). Lancei os R$ 12.900 restantes numa só despesa ajustável. O orçamento combinado e a redução por escolha ficam sem material. Tipo: DADO FALTANDO do cliente.

20. **Crédito de custeio não resolve o aperto.** Mesmo com os R$ 120.000 em jan/2027, o caixa fica negativo em dez/2026 (mês 2: reserva -R$ 12.334, dívida com juros) e de novo em abr/2027 (mês 6: -R$ 34.055). A fala do cliente ("sem isso não chego em maio") é verdadeira, mas com o crédito ainda não chega. O alerta de ruína do motor acusa o mês 2 antes do crédito. Isso é resultado do plano, não erro. Tipo: COMPORTAMENTO SURPREENDENTE do cliente/plano, a documentar.

21. **Teto e juros da dívida quando o dinheiro acaba (4% a.m.)** deixaram uma despesa de juros pequena nos meses 3 e 7 (`out_juros` R$ 493 e R$ 1.362), correta pela regra, mas muito acima do que um produtor pagaria em linha de capital de giro. Não mexi em `jurosDivida`. Tipo: CAMPO CONFUSO (o consultor precisa saber que existe) e DADO FALTANDO.

## (c) Premissas que assumi

- Hoje é 19/10/2026 (`inicio`), mês 0 = outubro de 2026. Todos os "daqui a N meses" do cliente bateram com essa data.
- Dia de nascimento = dia 1 (só mês e ano). Marina nasceu em abr/2007 (ela tem "19 anos"); a despesa dela termina no mês 66 (abr/2032).
- Safra de soja recebida em 15/maio e safrinha em 15/setembro; ambas valem para o que for colhido a partir de maio/2027 (a de 2026 já passou).
- Safra e salário são rendas líquidas e tributáveis (nada foi dito sobre IR).
- O consórcio do trator tem 22 pagas e 78 restantes (usei `restantes`, não `inicio`); o saldo devedor de hoje é o calculado pelo contrato (R$ 402.030,72).
- Consórcio do caminhão: valor pago = 10 x R$ 7.200 = R$ 72.000; reajuste do grupo 0%; lance de R$ 50.000 todo do bolso e pago na contemplação; a carta de R$ 500 mil é usada toda para comprar o caminhão (compromisso de R$ 500.000 no mês 14).
- Custos da venda do lote = R$ 54.000 no total (6% de R$ 900.000), não 6% mais ITBI separado.
- Valorização do lote = 8% a.a. (como disse o corretor), mesmo com preço firme de R$ 900.000 no mês 30.
- Reforma da sede é consumo (não vira bem) e é paga pela safra de soja de maio/2027.
- Casa da Marina: entrada de R$ 150.000 vem integral da venda do lote (destino da venda), sem aporte mensal. Parcela SAC a 10,5% a.a. efetivo.
- INSS é líquido, já em valores de hoje; começa na data em que a pessoa faz a idade (mês 92 e 109).
- FGTS da Ione "não mexe" = saque só aos 90 anos.
- Rendimentos reais: taxa 0,4%, 0,5% e 0,6% a.m. (padrão do plano-exemplo).
- Despesas dos próximos anos constantes em valores de hoje (sem inflação, sem mudança quando Marina faz 25 além da linha dela).
- Liquidez/reserva, IR, seguros, riscos, carteira e política: não preenchidos (o cliente não deu dados).

## (d) Coisas estranhas que notei no resultado

1. **Mês 93 (jul/2034): despesas dobram.** `out_fix_saude` vai de R$ 3.600 (mês 92) para R$ 8.367 e `out_adj_casa` de R$ 12.900 para R$ 29.981, sem mudança no plano. Em seguida sobem pouco a pouco (mês 300: R$ 8.509 e R$ 30.491). Ver dificuldade 13.
2. **Mês 29 para o mês 30 (abr/2029): bens caem 6,74 mi → 6,02 mi** (lote sai com R$ 727 mil), **financeiro sobe 270 mil → 1,09 mi** (venda R$ 900 mil menos R$ 54 mil, menos R$ 150 mil para a casa que vão para a caixinha). Salto de R$ 172.705 no patrimônio total. Ver dificuldade 10.
3. **Mês 36 (out/2029): bens sobem só ≈ R$ 161 mil** quando a casa de R$ 500 mil é comprada, e a coluna de dívidas `div` não recebe os R$ 350 mil financiados (463.749 no mês 35 para 451.644 no 36, só a queda normal do trator). Ver dificuldade 12.
4. **Mês 14 (dez/2027): `in_pas_3` R$ 450.000** (a carta, líquida do lance) entra no financeiro como "renda passiva"; dívida salta de R$ 370 mil (mês 13) para R$ 700 mil (mês 14), cerca de R$ 330 mil de "dívida do caminhão" sem ativo correspondente. A "previdência" (`prev`) cai de R$ 198 mil para R$ 40 mil (some o fundo do consórcio). Ver dificuldade 1.
5. **Mês 2 (dez/2026): reserva -R$ 12.334 e ruína**; mês 6 (abr/2027): reserva -R$ 34.055 (cheque 34.055), embora o crédito de custeio de R$ 120.000 entre no mês 3. Mês 7 (mai/2027): financeiro R$ 347 mil, depois da safra de R$ 420 mil, já descontados R$ 1.362 de juros da dívida.
6. **Mês 0: `mov_cofre` -R$ 3.225** e só `out_adj_casa` (a despesa ajustável dilui nas semanas que sobram do primeiro ciclo); as despesas fixas e as parcelas só aparecem do mês 1. O primeiro mês parece mais leve do que é.
7. **Caixinha da reforma (mês 7 a 11):** R$ 89.185, 89.514, 89.925, 90.256, 90.588; chega a R$ 90.672 no mês 12 contra o necessário de R$ 90.000, e o resto fica no cofre. Está certo, mas o status "ok" vem de uma única entrada extra, não do aporte mensal.
8. **Evento "Dívida quitada: Consórcio do trator" na semana 3174** (mês 78), com `div` zerando; já "Financiamento de casa para a Marina quitado" na semana 3735 (mês ≈ 207), com a amortização de R$ 100 mil reduzindo o prazo de 276 para ≈ 207; a saída `out_fix_casa-marina_compra` cai de R$ 104.236 no mês 48 para R$ 3.389 no 49. Conferido, parece coerente.
9. **FGTS da Ione, semana 4870-4875 (aos 90):** "Renda passiva líquida passa a R$ 257.128/mês" por um mês só.
10. **Financeiro "ao fim" muito alto:** R$ 18,5 mi no mês 540 (aos 99 anos), apesar das despesas já escaladas. O plano nunca "gasta" patrimônio, o que o cliente (R$ 20.000 por mês) não precisaria.
11. **Patrimônio financeiro de hoje = R$ 155.000** (`initialWealth`), embora o cliente só tenha R$ 45.000 em aplicações: entram o FGTS (R$ 38.000) e o valor pago do consórcio (R$ 72.000), ambos sem liquidez. A fase da vida/liquidez do cliente vai parecer melhor do que é.
