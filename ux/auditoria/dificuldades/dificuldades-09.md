# Dificuldades do cenário 09 (Hélio e Vera Barros)

Plano gravado em `ux/auditoria/planos/plano-09.json`; extrato em `ux/auditoria/extratos/extrato-09.json`
(`node ux/auditoria/harness.js` roda sem erro; liberdade em 62,2 anos, sem ruína).

**Aviso de método (contaminação).** Ao ler o cenário, o `Read` devolveu o arquivo inteiro e eu vi a seção "Para o auditor"
(valores esperados). Não a usei como alvo: as escolhas abaixo foram feitas a partir da conversa e do código. Mesmo assim, o
auditor deve tratar este caso como parcialmente contaminado. As decisões que podem ter sido influenciadas estão marcadas
como premissa (P) na seção (c): a taxa da renda do fundo de pensão (deixei o padrão da ferramenta) e o fato de eu ter olhado
o saque, a venda e a amortização com atenção.

## (a) Como traduzi

| Realidade do cliente | Onde / como lancei (caminho no plano) |
|---|---|
| Hélio (nasc. ago/1964), titular; Vera (nasc. jan/1969), cônjuge | `name`, `conjugeNome`, `nascimento: "1964-08"`, `conjugeNascimento: "1969-01"`, `tipo: "familia"` |
| "Hoje" = outubro de 2026 (mês 0) | `inicio: "2026-10-20"`, `dataRelatorio` igual (ver dificuldade 6: 28/10 empurraria o mês 0 para novembro) |
| Filhos independentes | `riscos.dependentes: []` |
| Hélio já parou | `retireAge: 62` (o motor sobe para a idade exata de hoje, 62,22) |
| Vera para aos 60 (jan/2029) | `spouseRetireAge: 60` (slider só inteiro; ver dificuldade 7) |
| Esperança de vida 90 (Hélio) e 93 (Vera) | `lifeExp: 98` (campo único, em idade do titular; ver dificuldade 8) |
| Renda desejada R$ 22.000 por mês, valores de hoje | `desired: 22000`, `desiredSteps: []`, `mode: "desej"` |
| INSS do Hélio R$ 7.800 (já recebe) | `incomes[id=inss_helio]` (`kind: "passiva"`, `origin: "Outras receitas"`, `steps: [{from:0,value:7800}]`, `pessoa: "titular"`) |
| INSS da Vera R$ 5.600 a partir dos 60 | `passive[0]` (`net: 5600`, `startMi: 27`, `dur: null`, `pessoa: "conjuge"`) |
| Salário da Vera R$ 9.500 | `incomes[id=salario]` (`kind: "ativa"`, `pessoa: "conjuge"`, `steps: [{from:0,value:9500}]`, `days: [5]`) |
| 13º da Vera R$ 9.500 em dezembro | `incomes[id=decimo]` (`origin: "13º salário"`, `de: "salario"`, `segue: "salario"`, `frequency: "anual"`, `dates: [{m:11,d:20}]`) |
| Despesas R$ 14.500: moradia/condomínio 3.100, alimentação 2.800, plano de saúde 4.200, transporte 1.400, lazer 2.000, outros 1.000 | `expenses[]`: `moradia`, `saude`, `transporte` (grupo `fix`); `alimentacao`, `lazer`, `outros` (grupo `adj`); um degrau cada (`from: 0`) |
| Parcela do financiamento R$ 4.065 | `expenses[id=parc_apto]` ("Parcela: Apartamento onde moram", `fix`), com degraus e ajuste `exc` calculados como o portal faz (`degrausDaParcela`/`lancaParcela`); ligada ao bem por `bens[0].linha` e `linhaPropria: true` |
| Investimentos R$ 900.000 (inclui R$ 210.000 de FGTS já sacado) | `patrimonio.financeiro[0]` "Investimentos (sem o FGTS)" 690.000 (casal) + `financeiro[1]` "FGTS sacado na aposentadoria (já aplicado)" 210.000 (titular), ambos sem `tipo` |
| Reserva de R$ 150.000 incluída | `politica.reserva: 150000`; `riscos.liquidez.d0: 150000` |
| PGBL da Vera R$ 150.000 | `financeiro[2]` (`tipo: "pgbl"`, `titularidade: "conjuge"`) |
| Fundo de pensão R$ 1.600.000; em abril/2027 saca 25% e o resto vira renda por prazo certo de 20 anos | `financeiro[3]` (`tipo: "fechada"`, `titularidade: "titular"`, `conv: {aos: 62.72, saque: 25, forma: "prazo", anos: 20}`); sem contribuições |
| Apartamento onde moram R$ 1.100.000 | `patrimonio.bens[0]` (`mercado: 1100000`, `titularidade: "casal"`, `protecao: "total"`) |
| Financiamento SAC: R$ 480.000, 240 parcelas, 9,5% a.a., 104 pagas / 136 restantes, saldo R$ 272.000 | no mesmo bem: `credito: 480000`, `parcelas: 240`, `juros: 9.5`, `sistema: "sac"`, `restantes: 136`, `saldoDevedor: 272000`, `parcela: 4065`, `iof: "isento"` |
| Amortizar R$ 100.000 em nov/2027 reduzindo a parcela | `bens[0].amortizacoes: [{em: 13, valor: 100000, modo: "parcela"}]` |
| 35% da Clínica Vida, R$ 900.000 | `patrimonio.participacoes[0]` (`valor: 900000`, `titularidade: "titular"`) |
| Venda por R$ 1.100.000 em nov/2027, corretor 2% e R$ 25.000 de imposto | `participacoes[0].venda: {em: 13, preco: 1100000, custos: [{nome:"Corretor (2%)", pct: 2}, {nome:"Imposto sobre a venda", valor: 25000}]}` (líquido 1.053.000) |
| R$ 200.000 da venda são a entrada do apartamento na praia | `venda.destinos: [{objetivo: "praia", valor: 200000}]` |
| Viagem à Europa R$ 80.000 em out/2027, conservador | `objectives[europa]`: `kind: "consumo"`, `months: 12`, `amount: 80000`, `profile: "conservador"`, `dedicated: 76300`, `planned: 0` (ver dificuldade 12) |
| Carro R$ 70.000 em out/2028; já tem R$ 75.000 separados | `objectives[carro]`: `kind: "bem"`, `months: 24`, `amount: 70000`, `dedicated: 75000`, `planned: 0`, `profile: "conservador"` |
| Apartamento na praia R$ 600.000 em out/2029; entrada 200.000; resto 400.000 em 180 parcelas SAC, 9,5% a.a., sem IOF; risco moderado | `objectives[praia]`: `kind: "bem"`, `months: 36`, `preco: 600000`, `amount: 200000`, `dedicated: 0`, `planned: 0`, `profile: "moderado"`, `compra: {modo: "financiamento", sistema: "sac", parcelas: 180, juros: 9.5, iof: "isento"}` |
| Ordem dos sonhos | `objetivosOrdem: ["europa","carro","praia"]` |

## (b) Dificuldades

1. **Mês da concessão do fundo de pensão é dado por idade decimal.** Cliente: "em abril de 2027, daqui a 6 meses".
   Sistema: `conv.aos` é uma idade em anos (campo numérico com `step any`); o mês é `round((aos - idadeHoje) * 12)`.
   Aproximação: `aos = 62,72` (62,22 de hoje + 0,5), que dá `mc = 6`. Distorção: nenhuma no resultado, mas o consultor tem de
   fazer conta de idade para chegar a uma data, e uma mudança de `inicio` desloca o mês sem aviso. Tipo: CAMPO CONFUSO (falta
   o campo "em AAAA-MM", como o consórcio tem em `contemplacaoEm`).

2. **Taxa da renda por prazo certo.** Cliente não deu taxa para o fundo; só "vira renda mensal por prazo certo de 20 anos".
   Sistema: vazio em `conv.juros`, usa o parâmetro Previc da duration (6,08% a.a. real), diferente da taxa do plano
   (0,4% a.m., 4,9% a.a.) com que o saldo rende até a concessão. Aproximação: deixei vazio. Resultado: renda de R$ 8.704 por
   mês; com a taxa do plano seriam cerca de R$ 7.944 (calculei fora, na mesma fórmula do motor). Distorção: cerca de 9,6% a
   mais de renda por 20 anos, só por um default invisível para o cliente. Tipo: DADO FALTANDO do cliente (qual taxa o
   plano usa) e COMPORTAMENTO SURPREENDENTE (duas taxas diferentes no mesmo fundo).

3. **O saque à vista de R$ 409.697 não chega ao financeiro; é gasto no mês.** Cliente: tira 25% de uma vez (o dinheiro é
   dele para investir ou usar como decidir). Sistema: o comentário do motor diz que o saque entra no financeiro como uma
   entrada do mês. Na prática, como o Hélio já está na fase de liberdade, o motor trata qualquer entrada passiva do mês como
   renda e ajusta o padrão de vida a ela. Resultado no extrato, mês 6 (abr/2027): `in_pas_2 = 409.697` e as despesas
   viram R$ 436.492 (moradia 72.886, alimentação 65.832, lazer 47.023, plano de saúde 98.749, parcela 95.574 etc.), enquanto
   o patrimônio financeiro vai de R$ 1.059.9k (mês 5) para R$ 1.055.8k (mês 6): o saque desaparece. Aproximação: nenhuma
   possível dentro da ferramenta (lancei exatamente o que o cliente descreveu). Distorção: R$ 409.697 perdidos e um
   plano que parece "fechar" por isso. Tipo: COMPORTAMENTO SURPREENDENTE (grave; parece erro de motor).

4. **Padrão de vida ajusta-se a qualquer renda que passe de R$ 22.000, e nada sobra.** Cliente quer R$ 22.000 por mês.
   Sistema: depois da liberdade, `escala = (renda ativa + passiva + saque do patrimônio) / custo de vida`, então a despesa
   cresce até igualar a renda disponível; `desired` funciona como piso, não como teto. No extrato, nos meses 14 a 25
   (dez/2027 a nov/2028, com Vera trabalhando e o fundo pagando R$ 8.704) a renda é R$ 26.004 a R$ 35.504 e o gasto é
   R$ 26.795; depois do INSS da Vera, renda e gasto são ambos R$ 22.104. A sobra mensal nunca é poupada. Também se
   infla a parcela do financiamento: no mês 13 (nov/2027) a parcela de R$ 3.868 mais o adiantamento de R$ 100.000 (R$ 103.868
   na linha) saem como R$ 151.402, ou seja, R$ 47.534 de "consumo" a mais num pagamento que é contratual. Aproximação:
   nenhuma. Distorção: o dinheiro pago a mais some e o plano subestima a poupança de uma família que, na realidade,
   gasta R$ 18.565 hoje. Tipo: COMPORTAMENTO SURPREENDENTE.

5. **Cliente já aposentado: o gasto real (R$ 18.565, com a parcela) vira R$ 22.000 desde o mês 1.** Cliente: gasta
   R$ 14.500 + R$ 4.065 e "quer" R$ 22.000. Sistema: `retireAge` igual à idade de hoje põe a liberdade no mês 1, e o
   fluxo real (déficit de R$ 1.265 por mês até o fundo começar a pagar, mês 6) é substituído por um consumo de R$ 22.000
   com retirada de R$ 4.700 do financeiro (meses 1 a 5). Nenhum alerta mostra o déficit que o cliente de fato tem.
   Aproximação: deixei como está. Distorção: a retirada é 3,7 vezes o déficit real nos meses 1 a 5. Tipo: LACUNA do sistema
   (não há "renda desejada a partir de uma data" que respeite o gasto atual; `desiredSteps` existe, mas o cliente quer
   R$ 22.000 "em valores de hoje" sem dizer quando).

6. **Data de início 28/10 deslocaria todo o plano um mês.** Com `inicio` em 27/10 ou depois, `M0` vira novembro de 2026
   (arredondamento da semana: `W0` cai na semana que começa em 31/10, que contém o dia 5 de novembro). Testei 20/10, 26/10
   (mês 0 = outubro) e 28/10, 30/10 (mês 0 = novembro). Aproximação: usei 20/10/2026. Distorção: se tivesse usado o dia
   real de hoje, "daqui a 12 meses" seria novembro de 2027. Tipo: COMPORTAMENTO SURPREENDENTE.

7. **Idade de parar da Vera só em anos inteiros; o motor para um mês antes e perde o 13º.** Cliente: para em janeiro de
   2029, aos 60. Sistema: `spouseRetireAge: 60` dá `round((60 - 57,80) * 12) = 26`; o salário vai até o mês 25 (nov/2028).
   Extrato mês 26 (dez/2028): sem salário e sem 13º. Aproximação: 60, que é o que o slider do portal permite (passo 1).
   Distorção: R$ 19.000 (salário e 13º de dezembro de 2028) a menos, e o INSS da Vera começa no mês 27 (jan/2029,
   correto). Tipo: CAMPO CONFUSO (falta "para em AAAA-MM") e LACUNA.

8. **Esperança de vida de duas pessoas num campo só.** Cliente: Hélio 90, Vera 93. Sistema: `lifeExp` é uma idade do
   titular. Aproximação: 98, a idade que Hélio teria quando Vera chegar aos 93 (97,4, arredondado para cima). Distorção:
   o plano projeta 8 anos além da expectativa do Hélio; ao contrário (usar 90) deixaria a Vera sem cobertura por 7 anos.
   Tipo: LACUNA.

9. **Financiamento: início das parcelas, parcelas restantes e IOF.**
   (i) O cliente deu "primeira parcela em março de 2018" e "104 pagas, 136 restantes". Com `inicio: "2018-03"` e mês 0
   em outubro, o motor conta 103 pagas (restantes = 137, saldo do contrato R$ 274.000 contra os R$ 272.000 do extrato);
   a do mês 0 é a 104ª. Aproximação: tirei o `inicio` e usei `restantes: 136`, que dá 104 pagas, saldo R$ 272.000 e
   parcela de R$ 4.065 (a taxa 9,5% a.a. dá 4.064,90). O mês da 1ª parcela do cliente ficou sem registro no plano.
   (ii) Se `iof` fica em branco, o motor assume `financiado` (IOF somado ao crédito): o contrato de 2018 passou a valer
   R$ 496.397 e o saldo R$ 281.292 em vez de R$ 272.000. Só ficou certo com `iof: "isento"`. Tipo: COMPORTAMENTO
   SURPREENDENTE (o default de IOF financiado num financiamento imobiliário antigo) e CAMPO CONFUSO (`inicio` x
   `restantes` dão resultados diferentes conforme o dia do mês).

10. **A amortização "sai exatamente do dinheiro da venda da clínica".** Cliente liga as duas coisas. Sistema: a venda tem
    `destinos` só para objetivos; o adiantamento da dívida (`amortizacoes`) é uma saída do caixa no mês. Aproximação:
    lancei os dois no mesmo mês (13) sem vínculo. Distorção: nenhuma no total (o líquido de R$ 1.053.000 cai no financeiro,
    R$ 200.000 vão para a praia e R$ 100.000 saem na amortização), mas o plano não mostra que a amortização é "financiada
    pela venda". Tipo: LACUNA.

11. **A linha da parcela precisa ser montada à mão.** Gravando o JSON direto, é preciso criar `expenses[parc_apto]` com
    degraus (a cada 12 meses, mais um degrau no mês seguinte ao adiantamento que reduz a parcela), `exc` para o mês do
    adiantamento (`{"13": 103867,61}`), fim da linha (degrau zero em 136) e ligar com `linha`/`linhaPropria` no bem. Nada
    disso está no README ou no VARIAVEIS.md em forma de receita (só no código do portal, `lancaParcela`/`degrausDaParcela`);
    reproduzi a lógica com o motor. Tipo: FORMATO NÃO DOCUMENTADO.

12. **Fonte do dinheiro da Europa.** Cliente: R$ 80.000 em out/2027, "conservador", sem dizer de onde vem. Sistema:
    o aporte necessário seria R$ 6.521 por mês, mas o motor, no regime de liberdade, não poupa (`m.invest = 0`): com
    `planned: 6522` o extrato guarda só R$ 5.873 no mês 0 e nada depois, e o objetivo chega a R$ 6.143 (status "risk").
    Aproximação: separei R$ 76.300 hoje do financeiro (`dedicated`) e `planned: 0`, que chegam a R$ 80.044 em outubro
    de 2027. Distorção: troquei a premissa de "poupar todo mês" por "separar agora"; R$ 76.300 saem do financeiro no mês 0.
    Tipo: DADO FALTANDO do cliente e LACUNA (aporte é impossível na fase de liberdade).

13. **Carro: os R$ 75.000 "já separados".** Cliente não disse se estão dentro dos R$ 900.000. Aproximação: assumi que
    estão (`dedicated: 75000`, sem tirar da linha de investimentos, que já os conta). Rendem à taxa conservadora até
    out/2028 (R$ 82.541 de projeção, R$ 82.438 de real na simulação, contra R$ 70.000 de preço); o excedente volta ao
    financeiro no mês 24. Distorção: se os R$ 75.000 fossem à parte, o financeiro de hoje estaria subestimado em
    R$ 75.000. Tipo: DADO FALTANDO.

14. **Praia: financiamento "sem IOF", custos do imóvel e dívida invisível.** Lancei `compra.iof: "isento"`. A parcela
    inicial é R$ 5.259 no mês 36 (400.000 / 180 + juros do saldo); a dívida dos R$ 400.000 não aparece em `fim.div` (a
    série `div` mostra só o apartamento atual, R$ 118.033 no mês 36); o motor lança o bem pelo líquido (mês 36: bens
    R$ 1.372.222 = 1.170.000 + 200.000 de equity + 2.222 de amortização). Cliente não deu condomínio nem IPTU do imóvel
    novo, nem valorização: não lancei. Tipo: DADO FALTANDO e COMPORTAMENTO SURPREENDENTE (apresentação do patrimônio
    líquido do bem financiado).

15. **Rendas sem bruto; tributação do saque e da renda do fundo.** Cliente deu só valores líquidos. Sistema pede
    `gross`, `taxable` e IR para a Otimização tributária e usa o líquido no fluxo. Aproximação: `gross` igual ao líquido
    (R$ 9.500, R$ 7.800), `taxable: true` só no salário. Os R$ 409.697 de saque e os R$ 8.704 de renda do fundo entram
    sem IR (o motor registra `tax: 0` para o fundo), embora a previdência fechada seja tributada (regressiva ou
    progressiva). Distorção: o saque e a renda do fundo ficam brutos; a página de IR não reflete a realidade. Tipo: DADO
    FALTANDO do cliente e LACUNA (tributação do resgate do fundo).

16. **INSS do Hélio no Orçamento: `incomes` x `passive`.** Primeiro lancei o INSS do Hélio em `passive[]` (onde o portal
    manda cadastrar INSS), e a renda líquida da Política de investimentos ficou R$ 10.292 (só o salário e o 13º médio da
    Vera); movido para `incomes[]` (`kind: "passiva"`), ficou R$ 18.092. Como o Hélio já recebe, escolhi `incomes[]`; o
    INSS futuro da Vera ficou em `passive[]` (`startMi: 27`), que o Orçamento também ignora. O fluxo simulado é igual nos
    dois caminhos. Tipo: CAMPO CONFUSO (duas formas de cadastrar o mesmo INSS, com efeitos diferentes nas telas).

17. **Plano de saúde.** O cliente deu R$ 4.200 para o casal; `riscos.saude.vidas[]` pede prêmio por vida. Lancei como
    despesa fixa simples, sem preencher `riscos.saude` (sem hospitais, tipo nem divisão por pessoa). Não disseram se o
    valor muda com a idade (mensalidade de plano sobe por faixa etária); fica constante em termos reais. Tipo: DADO
    FALTANDO e LACUNA (despesa que muda por fase não é pedida pela conversa, mas o plano de saúde de um aposentado de 62
    anos muda).

18. **FGTS já sacado.** Está dentro dos R$ 900.000 de investimentos. Separei em duas linhas só para rastrear
    (R$ 210.000 no titular), sem `tipo: "fgts"` (que o trataria como caixa à parte). Tipo: apenas anotação, sem distorção.

## (c) Premissas que assumi

- P1. "Hoje" é 20/10/2026 (mês 0 = outubro/2026); todos os "daqui a N meses" do cliente batem com esse mês 0.
- P2. Os R$ 75.000 do carro estão dentro dos R$ 900.000; a reserva de R$ 150.000 também; o FGTS de R$ 210.000 já está aplicado.
- P3. Titularidade dos investimentos: R$ 690.000 do casal, R$ 210.000 (FGTS) do Hélio; PGBL da Vera; fundo do Hélio.
- P4. Valores em termos reais (sem inflação), como a ferramenta usa. As despesas ficam constantes; só o fim do financiamento
  e a parcela mudam por contrato.
- P5. Taxa da renda do fundo: padrão Previc da ferramenta (não perguntei ao cliente; ver dificuldade 2). Sexo da tábua e
  reversão não se aplicam (prazo certo).
- P6. Europa: dinheiro separado hoje (R$ 76.300), não aporte mensal (dificuldade 12). Carro: perfil conservador (o cliente
  não disse). Praia: perfil moderado nos primeiros 12 meses e conservador nos 24 finais (regra da ferramenta).
- P7. Bruto igual ao líquido (dificuldade 15); INSS líquido; sem IR no saque nem na renda do fundo.
- P8. Transporte como despesa fixa; alimentação, lazer e outros como ajustáveis.
- P9. `lifeExp: 98` para cobrir a Vera até os 93 (dificuldade 8).
- P10. Sem dependentes, sem valorização de imóveis (nem do apartamento, nem do da praia), sem custos de condomínio/IPTU da praia.
- P11. A clínica sobe em ritmo constante até o preço de venda (regra da ferramenta: o preço informado vira o "valor esperado");
  valor no mês 6: R$ 987.338.
- P12. Taxa do plano 0,4% a.m. (conservador), 0,5% (moderado), 0,6% (agressivo): os padrões, sem mudança.

## (d) Coisas estranhas que notei no resultado

- Mês 6 (abr/2027): despesas de R$ 436.492 contra R$ 22.000 normais, porque o saque de R$ 409.697 é consumido (dificuldade 3).
  Financeiro: R$ 1.059.9k (mês 5) para R$ 1.055.8k (mês 6).
- Mês 13 (nov/2027): `out_fix_parc_apto = 151.402` quando o contrato manda 3.868 + 100.000 = R$ 103.868; o motor multiplica
  a linha pelo mesmo fator de ajuste das demais despesas (1,4577). A dívida cai certo (R$ 246.000 no início do mês 13 e
  R$ 144.000 no início do 14) mas o caixa paga 46% a mais.
- Meses 14 a 25: gasto de R$ 26.795 com renda desejada de R$ 22.000 (a despesa acompanha a renda; nada é poupado). Mês 2
  (dez/2026), com o 13º: gasto R$ 22.000 e renda R$ 26.800 (a sobra de R$ 4.800 não aparece como poupança).
- `fim.div` no fim do mês 0 mostra R$ 272.000, o saldo do início do mês (a parcela do mês já foi paga); no fim do mês 13
  mostra R$ 246.000, embora os R$ 100.000 do adiantamento já tenham saído do caixa naquele mês (só caem no mês 14,
  R$ 144.000). A convenção é "saldo no início do mês", mas o rótulo é "fim".
- A "Liberdade Financeira" aparece na semana 3253 (62,25 anos, mês 1) por causa da idade de parar do Hélio; não é uma
  conclusão do motor sobre os números, é só a data de parar dele. Com Vera ainda trabalhando por mais 26 meses, o plano
  mostra "liberdade" no primeiro mês.
- O patrimônio financeiro cresce de R$ 1,05 milhão (mês 0) para R$ 4,2 milhões (mês 246, 82,7 anos) e R$ 6,8 milhões aos 100
  anos, apesar de o cliente ter déficit mensal hoje: o fundo de pensão (R$ 8.704 por 240 meses), o INSS da Vera e a venda
  da clínica (R$ 853.000 no financeiro) pagam as contas, e o consumo se limita à renda. O patrimônio final alto é um
  efeito da regra 4 (sobra não consumida vira patrimônio), não de um erro de conta, mas assusta pela dimensão.
- Praia: `objectives[praia].required = 0` e projeção R$ 219.233 (R$ 19.233 acima dos R$ 200.000 de entrada); o excedente
  volta ao financeiro no mês 36 (`mov_cofre +19.231`). A parcela de R$ 5.259 entra no mês 36 e cai R$ 17 por mês.
- Evento "Fim: Fundo de pensão" no mês 246 (set/2047): a renda passiva cai de R$ 22.104 para R$ 13.400 e o gasto de
  R$ 22.104 para R$ 22.000 (de novo com retirada do financeiro, R$ 8.600 por mês).
- A renda líquida da Política de investimentos (`politicaDeInvestimentos.renda`) é R$ 18.092 (7.800 + 9.500 + 9.500/12) e
  não conta o fundo de pensão (R$ 8.704), que vem de `passive`; o padrão de vida mostrado é, portanto, R$ 18.092.
