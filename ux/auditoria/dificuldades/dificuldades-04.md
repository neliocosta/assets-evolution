# Dificuldades do cenário 04 — Paulo e Renata (médico PJ, servidora, consórcios, ano sem renda)

Plano gravado em `ux/auditoria/planos/plano-04.json` (chave `dados`); extrato em `ux/auditoria/extratos/extrato-04.json` (628 meses, 4 objetivos, liberdade "52,2 anos", sem erro). Mês 0 = out/2026 (`inicio` 2026-10-28). Um mês do plano (mi) = meses desde out/2026: mar/2027 = 5, out/2028 = 24, abr/2029 = 30, mar/2031 = 53, jan/2041 = 171.

## (a) Como traduzi

| Realidade do cliente | Onde / como lancei |
|---|---|
| Paulo 47 (jan/1979), Renata 52 (mar/1974), família | `name`, `conjugeNome`, `tipo: familia`, `nascimento: 1979-01`, `conjugeNascimento: 1974-03`, `inicio: 2026-10-28`, `regraDoInicio: semana` |
| Bruna 20 e Davi 16, dependem até 25 | `riscos.dependentes[]` (`relacao: filho`, `ate: 25`, `nasc` 2006-06 e 2010-06, mês inventado) |
| Clínica: 42 mil, jan/fev 30 mil, dez 55 mil | três rendas anuais com `dates` (jan,fev = 30k; mar a nov = 42k; dez = 55k), `incomes[clinica_jf, clinica_normal, clinica_dez]` |
| Bônus trimestral 20 mil (mar, jun, set, dez) | `incomes[bonus_clinica]`: `frequency: anual`, `dates` com os 4 meses |
| Ano sabático (sem renda nem bônus, mar/2027 a fev/2028) | nas 4 linhas da clínica: degraus `{0,V}`, `{5,0}`, `{17,V}` |
| Renata 19 mil, progressão jul/2028 para 21,5 mil | `incomes[salario_renata]`: `{0,19000}`, `{21,21500}` |
| 13º da Renata em dezembro | `incomes[decimo_renata]`: `origin: 13º salário`, `de` e `segue: salario_renata`, `dates [{m:11,d:20}]` |
| Gastos 38 mil em 8 categorias | `expenses[]`: escola_davi, faculdade_bruna, saude, casa, transporte (fixas), alimentacao, lazer, outros (ajustáveis) |
| Escola do Davi até dez/2028; faculdade da Bruna até dez/2029 | degrau zero em mi 27 e mi 39 |
| Bruna sai em 2031: paga 5 mil até 2035; alimentação −1,6 mil; Davi 2033: −1,2 mil | `expenses[bruna_mora]` (mi 51 a 110, 5.000); alimentação com degraus `{51,3600}` e `{75,2400}` |
| Investimentos 1,6 mi (300 mil de reserva) | `patrimonio.financeiro[0]` (casal) + `politica.reserva: 300000` + `riscos.liquidez.d0: 300000` |
| PGBL do Paulo 1,2 mi | `financeiro[1]`, `tipo: pgbl`, titular |
| Funpresp 380 mil, 1,9 mil + 1,9 mil | `financeiro[2]`, `tipo: fechada`, conjuge, `conv: {contribPessoa: 0, contribPatroc: 3800}` (ver dificuldade 6) |
| Apartamento 2,2 mi, financiamento SAC | `bens[0]`: `mercado 2200000`, `saldoDevedor 783000`, `credito 1000000`, `parcelas 240`, `restantes 188`, `parcela 9806`, `juros 8.99`, `sistema sac`, `linha` = despesa "Parcela: Apartamento" criada como o portal faz (degraus de 12 em 12 meses, fim no mi 188) |
| Casa de campo 800 mil + consórcio contemplado | `bens[1]`: `modalidade consorcio`, `carta 600000`, `txAdm 18`, `fundoReserva 2`, `parcelas 180`, `restantes 148`, `saldoDevedor 592000`, `reajuste 0`, linha "Parcela: Casa de campo" |
| 25% da clínica 1,4 mi; +6% a.a. por 5 anos; +300 mil em abr/2029 | `participacoes[0]`: `valorizacao [{taxa 6, de 0, anos 5}, {pontual, em 30, valor 300000}]` |
| Consórcio a contemplar (carro) 150 mil, 80 parcelas, 18 pagas, 2.100, lance 20 mil, abr/2028 | `financeiro[3]`, `tipo: consorcio`, `valor 37800` (18 x 2.100), `cons {carta, parcelas, pagas, parcela, reajuste 0, contemplacaoEm 2028-04, lance 20000, embutidoPct 0, linha}` + linha "Parcela: Consórcio: Carro" |
| O carro comprado com a carta | `compromissos[cmp_carro]` (em 18, 130 mil) + `bens[2]` "Carro" com `mercado 0` e `valorizacao pontual +130000` no mi 18 (gambiarra, ver dificuldade 4) |
| Empréstimo 150 mil, mar/2027, 36x, 1,6% a.m., Price | `creditos[0]` (`em 5`, `valor`, `parcelas 36`, `juros 1.6`, `sistema ''`) + linha "Parcela: Empréstimo do ano sabático" (5.513,58 a partir de mi 6) |
| Sonho 1: sabático R$ 90 mil, mar/2027, conservador | `objectives[sabatico]`: `months 5`, `amount 90000`, `profile conservador`, `dedicated 90000` |
| Sonho 2: faculdade do Davi 150 mil, out/2028, moderado | `objectives[faculdade_davi]`: `months 24`, `dedicated 137000` |
| Sonho 3: reforma 200 mil, out/2029, moderado | `objectives[reforma_campo]`: `months 36`, `dedicated 172000` |
| Sonho 4: apartamento da Bruna, consórcio 700 mil | `objectives[apto_bruna]`: `kind bem`, `months 60`, `preco 700000`, `compra {modo consorcio, carta 700000, parcelas 120, txAdm 17, fundoReserva 2, reajuste 0, inicio 0, lancePct 30, embutidoPct 10}`, `dedicated 41000` (o `amount` 52.868 o motor calcula) |
| Renata para aos 57, aposentadoria 13 mil | `spouseRetireAge: 57` + `passive[0]` (`pessoa conjuge`, `startMi 53`, 13.000) |
| Paulo para aos 62; INSS 8 mil aos 65 | `retireAge: 62` + `passive[1]` (`pessoa titular`, `startMi 207`, 8.000) |
| R$ 50 mil por mês, viver até 92 | `desired: 50000`, `lifeExp: 92`, `mode: desej` |

## (b) Dificuldades

1. **Renda variável por mês do ano (jan/fev, dez) e bônus trimestral.** Cliente: média 42 mil, jan/fev 30 mil, dez 55 mil, bônus de 20 mil em 4 meses. Sistema: linha mensal tem um valor só; só dá para ter valores diferentes por mês criando linhas `anual` com lista de `dates`; o widget de "bônus" do Orçamento só mostra uma data. Aproximação: três linhas da clínica (cada uma com `dates` de vários meses) e uma de bônus com 4 datas, sem `de`, para não quebrar o cartão. Distorção: nenhuma nos números; a tela do Orçamento mostra "3 rendas da clínica" e o consultor precisa saber o truque. Tipo: LACUNA do sistema e FORMATO NÃO DOCUMENTADO (`dates[].m` é mês de calendário de 0 a 11, não o mês do plano; o `steps[].from` é o mês do plano; os dois coexistem na mesma linha).

2. **Ano sabático (renda zero por 12 meses, em quatro linhas).** Cliente: pausa de março/2027 a fevereiro/2028 em todas as entradas do Paulo. Sistema: só degrau com valor zero e volta; não há "pausa" ligada à pessoa. Aproximação: os mesmos três degraus (`0`, `5`, `17`) repetidos nas 4 linhas. Distorção: nenhuma, mas se o ano sabático mudar de data o consultor precisa editar 4 linhas. Tipo: LACUNA do sistema.

3. **13º da Renata acompanha o salário (`segue`).** Cliente: 13º de 19 mil em dezembro e a progressão de jul/2028 para 21,5 mil; não disse se o 13º sobe. Sistema: `segue` faz o 13º valer o líquido do mês, então de dez/2028 em diante é 21,5 mil. Aproximação: aceitei. Distorção: +2,5 mil por ano em relação ao literal. Tipo: COMPORTAMENTO SURPREENDENTE (e DADO FALTANDO do cliente, que não esclareceu).

4. **Consórcio a contemplar (carro): a carta vira dinheiro, não bem.** Cliente: carta de 150 mil, lance de 20 mil, abr/2028; é para comprar um carro. Sistema: no mês da contemplação a carta menos o lance entra no financeiro (aparece como "renda" `in_pas_3` de 130 mil) e some a caixa de consórcio; nada cria o carro como bem. Também o valor já pago (patrimônio da caixa) não foi dado pelo cliente: calculei 18 x 2.100 = 37.800, ignorando taxa de administração. Aproximação: um `compromisso` de 130 mil no mi 18 (a compra) e um bem "Carro" com `mercado 0` e `valorizacao pontual +130000` no mi 18 para o carro entrar no patrimônio. Distorção: média (o carro entra no patrimônio sem depreciação e o consórcio aparece em "previdência" enquanto acumula; sem o compromisso o patrimônio ficaria 130 mil maior). Tipo: LACUNA do sistema (carta que compra bem) e DADO FALTANDO (valor já pago).

5. **Contagem de parcelas pagas contra mês da 1ª parcela.** Cliente: financiamento com 1ª parcela em jul/2022 e 52 pagas; consórcio com 1ª parcela em mar/2024 e 32 pagas; saldos 783 mil e 592 mil. Sistema: se informo `inicio`, o motor conta 51 e 31 pagas (considera a parcela de out/2026 ainda por pagar) e o saldo contratual não bate com o extrato (787.500 e 596.000). Aproximação: omiti `inicio` e usei `restantes` (188 e 148), que reproduz exatamente 783.333 e 592.000. Distorção: nenhuma nos saldos; perdi a data da 1ª parcela no cadastro. Tipo: CAMPO CONFUSO (o texto do campo "pagas" não diz se a parcela do mês corrente conta).

6. **Contribuição da Renata ao Funpresp (1.900 dela + 1.900 do órgão).** Cliente: contribui 1.900 e o órgão põe 1.900; o líquido de 19 mil é o que cai na conta (provavelmente já sem o desconto em folha). Sistema: `contribPessoa` sempre cria uma despesa no Fluxo; não há como dizer "já descontado do líquido". Aproximação: `contribPessoa 0` e `contribPatroc 3800` (a parte que não sai do fluxo), só para o saldo crescer certo. Distorção: se o líquido de 19 mil for antes do desconto, falta uma saída de 1.900/mês até mar/2031 (cerca de 100 mil). Tipo: CAMPO CONFUSO e DADO FALTANDO.

7. **Funpresp vira renda: forma não informada, e a "aposentadoria de 13 mil" pode já incluí-la.** Cliente: ela "recebe R$ 13.000 líquidos por mês de aposentadoria"; o Funpresp aparece à parte. Sistema: o fundo vira renda vitalícia por tábua (padrão), somada à aposentadoria que lancei. Aproximação: deixei o padrão (vitalícia, aos 57, sexo feminino): dá cerca de 4.136/mês além dos 13 mil. Distorção: se os 13 mil já incluem o Funpresp, renda dobrada em 4,1 mil/mês. Tipo: DADO FALTANDO do cliente.

8. **Valores reais contra nominais.** Cliente fala de 6% ao ano de valorização, 1,6% ao mês de empréstimo, 8,99% ao ano de financiamento. Sistema: o motor é em valores de hoje (retorno real de 0,4% a 0,6% ao mês) e as parcelas do contrato entram como saem do contrato, sem deflacionar. Aproximação: lancei as taxas como o cliente falou. Distorção: o 6% de valorização da clínica é tratado como real (acima da inflação), o que otimiza; as parcelas SAC nominais pesam mais em termos reais do que deveriam. Não há campo para informar inflação nem se a taxa é real ou nominal. Tipo: LACUNA do sistema.

9. **Renda desejada de 50 mil reescala todas as despesas.** Cliente: quer 50 mil por mês, em valores de hoje; as despesas atuais são 38 mil + parcelas e vão cair com os filhos. Sistema: a partir da liberdade (mar/2031, quando a Renata para), o motor multiplica todas as linhas de despesa por um fator para que o total acompanhe a renda disponível (desejada mais a renda de quem ainda trabalha). Aproximação: nenhuma possível. Distorção: grande (ver (d)): as parcelas contratuais e os cortes de alimentação/Bruna deixam de valer. Tipo: COMPORTAMENTO SURPREENDENTE.

10. **Lifetime: 92 anos para os dois.** Cliente: "esperam viver até os 92"; Renata é 5 anos mais velha. Sistema: `lifeExp` é uma só, na idade do titular. Aproximação: 92 (do Paulo), o que equivale a 87 para a Renata. Distorção: o plano projeta a Renata até 97 e o patrimônio dura até o Paulo ter 87,8. Tipo: LACUNA do sistema.

11. **Objetivos sem aporte informado.** Cliente: deu data, valor e perfil, mas nenhum aporte nem origem do dinheiro. Sistema: sem `planned`/`dedicated`, os objetivos ficam "em risco" e o aporte mensal necessário é grande; durante o ano sabático a sobra é negativa e os aportes são cortados. Aproximação (decisão minha): separei hoje dos investimentos o valor que fecha cada objetivo no prazo (90.000; 137.000; 172.000; 41.000) e deixei `planned 0`. Distorção: coloca cerca de 440 mil já "carimbados" sem o cliente ter pedido. Tipo: DADO FALTANDO do cliente.

12. **Apartamento da Bruna por consórcio com lance embutido.** Cliente: lance de 30% do saldo devedor, dos quais 10% da carta embutido. Sistema suporta (`lancePct`, `embutidoPct`), mas o resultado tem duas estranhezas: o `amount` fica sendo só o lance do bolso (52.868) e o bem de 700 mil nunca aparece no patrimônio na data (só entra o valor amortizado mês a mês, mais o lance). O lance usa o saldo depois da parcela do mês da contemplação (61 parcelas, não 60). Aproximação: aceitei. Distorção: patrimônio de bens subavaliado antes da quitação (aprox. 5 anos). Tipo: COMPORTAMENTO SURPREENDENTE.

13. **Faculdade do Davi e reforma como valor único.** Cliente: pediu como sonhos de valor único, mas a faculdade, na vida real, é mensal (como a da Bruna), e a reforma valoriza a casa. Sistema: objetivo `consumo` é saída única, sem custo recorrente nem valorização do bem. Aproximação: lump sum como o cliente disse. Distorção: pequena (pode faltar custo de faculdade após 2028 e a valorização da casa). Tipo: LACUNA do sistema.

14. **Dado cadastral não dado.** Meses de nascimento dos filhos (assumi junho), mês em que a Bruna e o Davi saem de casa (assumi janeiro de 2031 e janeiro de 2033; 5 mil até dez/2035), titular do consórcio do carro (Paulo), e o 300 mil da clínica ser valorização, não dinheiro em caixa. Tipo: DADO FALTANDO do cliente.

15. **Tributário vazio.** O cliente deu só valores líquidos; `gross` das rendas ficou 0, `taxable true`, e não preenchi `tributario`, sócios, despesas dedutíveis nem seguro. O PGBL do Paulo e a previdência fechada não têm aporte. Tipo: DADO FALTANDO do cliente.

16. **PGBL de 1,2 mi entra como dinheiro líquido sem imposto.** Cliente: PGBL é previdência (tributável no resgate). Sistema: `tipo pgbl` conta no mesmo caixa que os investimentos, sem liquidez diferente nem alíquota. Aproximação: aceitei. Distorção: o financeiro aparece 1,2 mi mais livre do que é. Tipo: LACUNA do sistema.

17. **A reserva de 300 mil dentro de 1,6 mi.** Não há como marcar parte de uma linha do financeiro como reserva; usei `politica.reserva` e `riscos.liquidez.d0`. Distorção: nenhuma nas contas; a leitura da tela fica pelo consultor. Tipo: CAMPO CONFUSO.

## (c) Premissas que assumi

- Hoje = 28/10/2026, mês 0 = out/2026 (a conversa coloca mar/2027 "daqui a 5 meses").
- Valores informados são líquidos (sem bruto); `gross 0`.
- Funpresp: o desconto de 1.900 da Renata já está fora do líquido de 19 mil; a aposentadoria de 13 mil é à parte; o fundo vira renda vitalícia aos 57.
- Valor já pago no consórcio do carro = 18 x 2.100 = 37.800; titular Paulo; contemplação em abr/2028 com lance de 20 mil sem embutido; a carta, menos o lance, compra um carro de 130 mil.
- O aumento da progressão de jul/2028 se estende ao 13º.
- A Bruna sai em janeiro de 2031 (aluguel de 5 mil até dez/2035), o Davi em janeiro de 2033; filhos nascidos em junho de 2006 e 2010.
- A valorização de 6% e o salto de 300 mil da clínica são de valor da participação, não caixa; as taxas são reais.
- Objetivos: separei hoje do patrimônio o que fecha cada um no prazo (sem aportes mensais); o perfil dos objetivos é o informado.
- Renda desejada de 50 mil = gasto total (inclui parcelas que ainda existirem).
- Natureza do trabalho: Paulo "profissional liberal/autônomo", Renata "servidor público".
- O empréstimo do sabático é contratado mesmo que o caixa dispense (o motor não acusa ruína).

## (d) Coisas estranhas que notei no resultado

- **Despesas reescaladas a partir de mar/2031 (mi 53).** Todas as linhas de despesa, inclusive as parcelas de dívida, sobem 22,4% de uma vez: parcela do apartamento planejada 8.403 sai como 10.283; casa de campo 4.000 vira 4.895; consórcio do carro 1.645 vira 2.014; plano de saúde 5.400 vira 6.609; alimentação 3.600 vira 4.406. O total mensal de despesas passa de 54.290 (mi 52) para 64.886 (mi 54), maior que as entradas de 59.136 (mi 54), embora a Bruna e o Davi tenham saído de casa. Em mi 62 (dez/2031) o fator sobe de novo (saúde 7.147). Só volta a 50.000 exatos quando as dívidas acabam (mi 190).
- **Parcelas e saldos desencontrados.** A partir de mi 53 o fluxo paga 10.283 por mês no apartamento enquanto o contrato (e o saldo devedor, 733.021 em mi 12 e a quitação em mi 188) segue a parcela de 8.403. O dinheiro pago não bate com a queda do saldo.
- **"Liberdade financeira" forçada em mar/2031 (52,2 anos, mi 53).** `forced: true`; renda sustentável estimada 29.085 por mês contra 50.000 desejados; mesmo assim o motor "libera" e o Paulo segue trabalhando até 2041. O alerta de ruína fica vazio.
- **O dinheiro acaba em mi 479 (cerca de setembro de 2066, Paulo com 87,8 anos), mas `ruina` vem `null`.** A partir daí o saque é limitado ao caixa (mov_cofre 0) e as despesas caem para as rendas passivas de 25.136/mês (saúde 5.009, alimentação 2.226) sem aviso.
- **Mês 0 sem nenhuma entrada ou saída.** `meses[0]` (out/2026): fluxo só com os objetivos (mov_obj_sabatico 90.000); salário, parcelas e despesas começam em nov/2026, porque o dia 28 já passou. Quem lê o extrato vê uma linha vazia.
- **Consórcio a contemplar aparece como "prev" (previdência).** No mi 0, `prev` = 417.800 (380.000 do Funpresp + 37.800 do consórcio) e o consórcio some junto na contemplação (mi 18, `prev` cai 67,8 mil e entram 130 mil como renda `in_pas_3`).
- **Lance do consórcio da Bruna em mi 60: `amount` 52.868 e `bens` só +52.868**, quando a carta é de 700 mil; os bens totais ficam em 3,53 mi no mi 60 e só crescem por amortização.
- **Dívida do empréstimo é lançada como entrada de 150 mil e a parcela de 5.513,58 começa em mi 6**, mesmo com o caixa de 2,5 mi sem ruína no ano sabático (menor `fin` ≈ 2,55 mi em mi 17). O empréstimo, portanto, não é necessário nas contas.
- **PGBL e dívida do patrimônio.** `fin` em mi 0 = 2.802.572 (sem o previdenciário), enquanto o patrimônio do cliente soma 3.218.000 em financeiro; a diferença é o fundo de pensão e o consórcio, que ficam fora do caixa livre.
