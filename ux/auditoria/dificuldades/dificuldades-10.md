# Dificuldades do cenário 10 — Pedro e Júlia Lima

Plano gravado em `ux/auditoria/planos/plano-10.json` (chave `dados`). Extrato em `ux/auditoria/extratos/extrato-10.json`
(harness roda sem erro; liberdade financeira aos 50,0 anos do Pedro, mês 222; nenhuma "falta" de aporte; o motor aceitou
os 5 objetivos, a venda da participação, o consórcio e o financiamento). Mês 0 = outubro de 2026 (`inicio: 2026-10-14`, ver D1).

## (a) Como traduzi

| Realidade do cliente | Onde / como lancei |
|---|---|
| Pedro 31 anos (abr/1995), Júlia 29 (set/1997), casal sem filhos | `name`, `nascimento: "1995-04"`, `conjugeNome`, `conjugeNascimento: "1997-09"`, `tipo: "familia"`, `age`, `spouseAge`. Dia de nascimento não informado: usei só AAAA-MM |
| Pedro CLT; Júlia autônoma PJ | `natureza: "CLT (empresa privada)"`, `conjugeNatureza: "Profissional liberal ou autônomo"`, `profissao`, `conjugeProfissao` |
| Salário R$ 11.000, promoção em mar/2028 para R$ 13.000 | `incomes[salario]` mensal, `steps: [{from:0,value:11000},{from:17,value:13000}]` |
| 13º de R$ 11.000 em dezembro (acompanha a promoção) | `incomes[dec13]`: `de:"salario"`, `segue:"salario"`, `frequency:"anual"`, `dates:[{m:11,d:20}]` (mesmo formato que o portal grava) |
| Bônus semestral R$ 12.000 em jun e dez | `incomes[bonus]`: `de:"salario"`, `frequency:"semestral"`, `days:[20]`, `steps:[{from:2,value:12000}]` (1º pagamento em dez/2026 = mês 2; repete a cada 6 meses) |
| Extras PJ do Pedro R$ 2.500 só 8 meses (abr a nov) | `incomes[pj_pedro]`: `frequency:"anual"` com `dates` de 8 meses (`m` = 3..10, `d:10`), `steps:[{from:0,value:2500}]` |
| Júlia R$ 8.500 de abr a ago; R$ 5.250 de set a mar | Duas linhas `anual` com `dates`: `julia_alta` (m 3..7, 8.500) e `julia_baixa` (m 8,9,10,11,0,1,2; 5.250); `pessoa:"conjuge"` |
| Aluguel recebido R$ 2.200 (apto herdado) | `incomes[aluguel]` `kind:"passiva"`, `origin:"Aluguéis"`, `pessoa:"conjuge"`, ligada ao bem por `patrimonio.bens[0].renda:"aluguel"` |
| Gastos R$ 12.800 (aluguel 3.800, alim. 2.600, transp. 1.100, lazer 2.400, saúde 1.700, outros 1.200) | `expenses[]`: moradia/transporte/saúde `group:"fix"`; alimentação/lazer/outros `group:"adj"`. Soma conferida: 12.800 |
| Aluguel que acaba ao comprar o apartamento | `expenses[moradia].endObj:"apto"` (some a partir do mês 60) |
| IPVA + seguro R$ 6.500 todo janeiro | `expenses[ipva]` `frequency:"anual"`, `dates:[{m:0,d:10}]`, 6.500 |
| Investimentos R$ 160.000 (R$ 40.000 de reserva) | `patrimonio.financeiro[0]` "Corretora" 160.000, `titularidade:"casal"`; `politica.reserva: 40000`, `reservaMensal: 0` |
| Apartamento herdado R$ 280.000 quitado | `patrimonio.bens[0]` mercado 280.000, saldoDevedor 0, `titularidade:"conjuge"`, `renda:"aluguel"` |
| Carro R$ 55.000 quitado | `patrimonio.bens[1]` mercado 55.000, `titularidade:"casal"` (Premissa P4) |
| 8% da Lumen Tech, R$ 90.000 | `patrimonio.participacoes[0]` valor 90.000 |
| Startup: 25% a.a. por 3 anos | `valorizacao: [{tipo:"alvo", em:36, valor:175781}]` (= 90.000 x 1,25^3). Ver D3 (a `taxa` foi ignorada) |
| Venda em out/2033 (mês 84) por R$ 400.000, corretagem 1% (R$ 4.000), imposto R$ 46.500, dinheiro vai para a casa de campo | `participacoes[0].venda: {em:84, preco:400000, custos:[{nome:"Corretagem",pct:1},{nome:"Imposto sobre o ganho",valor:46500}], destinos:[{objetivo:"casacampo"}]}`. Líquido do motor: R$ 349.500 |
| Casamento R$ 55.000, mês 24, moderado | `objectives[casamento]` consumo, `months:24`, `amount:55000`, `profile:"moderado"` |
| Filho R$ 40.000, mês 36, moderado | `objectives[filho]` consumo, `months:36`, `amount:40000` |
| Carro R$ 90.000, mês 48, consórcio (carta 90.000, 60 parcelas, adm 15%, sem fundo de reserva, sem reajuste, começa hoje, lance 25% do saldo todo do bolso) | `objectives[carro]` `kind:"bem"`, `preco:90000`, `months:48`, `compra:{modo:"consorcio", carta:90000, parcelas:60, txAdm:15, fundoReserva:0, reajuste:0, inicio:0, lancePct:25, embutidoPct:0}`. O motor calcula `amount` = lance do bolso = R$ 4.744 (parcela R$ 1.725; cai para R$ 1.294 depois do lance) |
| Apartamento R$ 650.000, mês 60, entrada 130.000, 360 parcelas SAC 10,2% a.a., sem IOF, moderado | `objectives[apto]` `kind:"bem"`, `preco:650000`, `amount:130000`, `months:60`, `compra:{modo:"financiamento", sistema:"sac", parcelas:360, juros:10.2, iof:"isento"}`. 1ª parcela R$ 5.670 |
| Casa de campo R$ 500.000, mês 120, agressivo | `objectives[casacampo]` `kind:"bem"`, `amount:500000`, `months:120`, `profile:"agressivo"`; alimentada pela venda (destino) |
| Prioridade: apto, filho, carro, casa de campo, casamento | `objetivosOrdem: ["apto","filho","carro","casacampo","casamento"]` |
| Aportes dos objetivos (cliente não deu) | `planned = ceil(required)` e `segueNecessario:true` em todos; `dedicated: 120000` no apartamento (P2). Aportes: filho 1.034, carro 90, casa de campo 518, casamento 2.189, apto 0 |
| Liberdade aos 50 (Pedro) e 48 (Júlia), R$ 14.000 de hoje | `retireAge:50`, `spouseRetireAge:48`, `desired:14000` |
| INSS Pedro R$ 6.000 e Júlia R$ 3.500 aos 65 | `passive[]` com `startMi` 402 (abr/2060) e 431 (set/2062), `gross=net`, `tax:0`, `dur:null`, `converted:false` |
| Viver até 90 | `lifeExp: 92` (idade do titular em que a Júlia faz 90; P5) |

## (b) Dificuldades

1. **Mês 0 depende do dia da semana do nascimento (e do dia em que se desenha).** O cliente fala em "outubro de 2028 (24 meses)"
   e eu estava em 28/10/2026. Com `inicio: 2026-10-28` o motor abriu o mês 0 em **novembro** (`M0 = {y:2026, m:10}`), porque a
   grade de semanas é ancorada no dia da semana do nascimento (sábado, para abril/1995) e a semana de "hoje" arredonda para
   a seguinte, que contém o dia 5 de novembro. Todos os "24, 36, 48..." ficariam um mês deslocados. Contornei usando
   `inicio: 2026-10-14` (mês 0 = outubro). O que o sistema permite: só escolher a data de início. Aproximação: data de início
   fictícia. Distorção: nenhuma nos valores, mas a data de "hoje" do plano não é a real. Tipo: **COMPORTAMENTO SURPREENDENTE do motor**
   (o consultor não tem como saber que a data de nascimento muda o mês 0).

2. **`iof: 0` é lido como "IOF financiado" (R$ 17.893 a mais).** Cliente: "sem IOF". Em `compra` o campo `iof` só aceita
   `'financiado'` (vazio), `'avista'` ou `'isento'`; o VARIAVEIS.md lista `iof` sem dizer os valores. Com `iof: 0` o motor
   somou R$ 17.893 ao crédito (financiado R$ 537.893 em vez de R$ 520.000) e a 1ª parcela saiu R$ 5.865 em vez de R$ 5.670.
   Só achei lendo o motor. Corrigi para `'isento'`. Tipo: **FORMATO NÃO DOCUMENTADO** (e valor numérico inválido aceito em silêncio).

3. **`valorizacao` tipo `taxa` é ignorada quando há venda com preço (alvo implícito).** Cliente: "25% ao ano nos próximos 3 anos, depois
   vale R$ 400.000 em 7 anos". Primeiro lancei `taxa 25% por 3 anos` + venda a 400.000: o motor ignorou os 25% e subiu a ~23,6% a.a. constante
   (mês 36 = R$ 170.561 em vez de R$ 175.781). Troquei por um `alvo` em `em:36, valor:175781` (valor que eu calculei: 90.000 x 1,25^3),
   e a venda faz o segundo alvo. Distorção hoje: nenhuma (mês 36 = 175.781; mês 84 = 400.000), mas o campo "taxa" some sem aviso.
   Depois do ano 3 o motor implica ~22,8% a.a. (175.781 para 400.000 em 48 meses), o que é coerente com o número do cliente
   mas alto frente aos 25% que ele deu para os primeiros 3 anos. Tipo: **COMPORTAMENTO SURPREENDENTE do motor** + **CAMPO CONFUSO**
   (o consultor tem que converter taxa em valor esperado na mão).

4. **Renda sazonal (meses específicos do ano) não tem campo próprio.** Pedro tem extras só de abr a nov; Júlia tem dois patamares
   no ano. O sistema permite frequência mensal/semanal/anual/pontual, `days` (dias do mês) e `dates` (datas no ano) mas não
   "meses ativos". Usei `frequency:"anual"` com várias `dates` (8 datas para o Pedro; 5 e 7 para a Júlia em duas linhas).
   Funciona e a média mensal sai certa, mas é gambiarra: a linha se chama "anual" e tem 8 pagamentos; o patamar da Júlia
   virou 2 linhas separadas. No Orçamento (média 12 meses) tudo bate. Distorção: nenhuma nos valores. Tipo: **LACUNA do sistema**
   (e **CAMPO CONFUSO**: anual com várias datas não é óbvio).

5. **"Média de R$ 6.500" da Júlia não fecha com os dois patamares.** 5 meses x 8.500 + 7 meses x 5.250 = R$ 79.250 por ano =
   R$ 6.604 por mês de média (não 6.500). Lancei os dois patamares (que são os dados concretos) e ignorei a média. Diferença anual: R$ 1.250.
   Tipo: **DADO FALTANDO / inconsistente do cliente**. Do mesmo modo, o "média de R$ 2.500, mas só em 8 meses" do Pedro é ambíguo:
   entendi R$ 2.500 em cada um dos 8 meses (R$ 20.000/ano, média de 12 meses = R$ 1.667); se a média de R$ 2.500 fosse sobre os 12 meses, seriam
   R$ 3.750 nos 8 meses (distorção de R$ 10.000 por ano).

6. **Renda líquida: sem bruto, sem IR.** O cliente deu tudo líquido. O campo `gross` fica igual ao líquido (e `taxable:true` nos
   salários/PJ/aluguel), o que faz o módulo de IR/INSS achar que o rendimento tributável é igual ao líquido. Tipo: **DADO FALTANDO do cliente**
   (e o PJ da Júlia não tem pró-labore/lucros separados; usei "Honorários (autônomo)").

7. **Aportes dos objetivos e destino dos R$ 120.000 livres: o cliente não disse.** Ele deu prioridade mas não quanto guarda por mês nem
   qual parte do patrimônio vai para qual sonho. Premissa: `planned` = o necessário de cada objetivo (`segueNecessario`) e todos os
   R$ 120.000 (160.000 menos a reserva) em `dedicated` do apartamento, o 1º da fila. Consequência: o apartamento fica "pronto" sem aporte
   mensal e acumula R$ 158.041 para uma entrada de R$ 130.000 (sobra de R$ 28.000 volta ao caixa no mês 60), enquanto o casamento (mês 24)
   precisa de R$ 2.189 por mês. Um consultor teria que combinar isso com o casal. Tipo: **DADO FALTANDO do cliente** (a ferramenta
   permite, mas o sobredimensionamento do `dedicated` não é avisado).

8. **Dois carros: o consórcio não substitui o carro atual.** O objetivo "carro por consórcio" cria um bem novo no mês 48 e o carro
   de R$ 55.000 continua no patrimônio e IPVA/seguro continuam R$ 6.500. O cliente não disse se vende o carro velho. Não inventei a venda.
   Tipo: **DADO FALTANDO do cliente**; do lado do sistema, falta ligar "compra de bem" a "venda do bem que ele substitui" em um passo.

9. **Custos depois da compra (condomínio/IPTU do apartamento e da casa de campo, filho): não informados.** `costs: []` em todos.
   O filho (2029) também não gera nenhuma despesa recorrente nem entra como dependente (o plano de saúde fica 1.700). Distorção: provável
   subestimação do gasto a partir de 2029 e de 2031. Tipo: **DADO FALTANDO do cliente**.

10. **Expectativa de vida do casal: o motor tem um único `lifeExp` (idade do titular).** O casal disse "até os 90", e a Júlia é 2,4 anos
    mais nova que o Pedro. Se eu usasse 90, a Júlia acabaria o plano aos 87,6. Usei 92. Distorção: 2 anos a mais para o Pedro (conservador).
    Tipo: **LACUNA do sistema** (um horizonte só para duas pessoas).

11. **Liberdade em idades diferentes (50 e 48).** O motor para a renda ativa de cada um na sua idade (Pedro no mês 222, Júlia no 227)
    e declara a liberdade na idade do primeiro (Pedro, 50). Funciona; o `spouseRetireAge:48` gera só 5 meses de diferença no calendário.
    Mas `ff.age = 50,0` é a idade pedida, não a mais cedo possível: o extrato mostra `sustentavel` R$ 17.908 por mês contra R$ 14.000 pedidos
    em 2045, ou seja, poderiam parar antes. A tela mostra "liberdade aos 50" e não informa a folga. Tipo: **COMPORTAMENTO SURPREENDENTE do motor**.

12. **INSS em `passive[]`: valor líquido = bruto e `startMi` em meses a partir do mês 0.** Conta manual: abr/2060 = 402, set/2062 = 431
    (esses números dependem de D1; se o mês 0 mudar, os dois erram). `tax:0` porque o cliente deu valor líquido. Tipo: **FORMATO NÃO DOCUMENTADO**
    (o README explica `passive` só pelo exemplo; não há "a partir dos 65 anos" como campo) e depende da data de início.

13. **Casamento, filho e casa de campo vão para `kind:"consumo"` / `"bem"` sem refinamento.** O sistema pede ícone, `title`, `strategy`.
    Deixei `strategy: ''` e `icon` genérico (home/baby/car/heart): a tela do cliente mostrará textos em branco. Tipo: **DADO FALTANDO** (texto de consultor).

14. **Participação com saída da sociedade ("quando eu sair") e imposto fixo.** O imposto é uma soma fixa (R$ 46.500, 15% de 310.000 de ganho)
    informada pelo cliente; no motor é um valor em reais, não recalcula se o preço de venda mudar. Corretagem lancei em % (1%). Sem distorção hoje.
    Tipo: **LACUNA do sistema** (sem imposto de ganho de capital calculado) — leve.

## (c) Premissas que assumi

- P1. Hoje = outubro de 2026 (mês 0). Usei `inicio: 2026-10-14` (dia fictício) para o mês 0 cair em outubro (D1).
- P2. Os R$ 120.000 de investimentos fora da reserva ficam com o apartamento (objetivo de maior prioridade); a reserva de R$ 40.000 em `politica.reserva`.
- P3. Todos os aportes mensais = o aporte necessário de cada objetivo (`segueNecessario`), em ordem de prioridade, sem corte.
- P4. O carro atual (R$ 55.000) pertence ao casal e continua mesmo depois do consórcio; o apartamento herdado é da Júlia (ela o herdou).
- P5. `lifeExp = 92` para cobrir os 90 da Júlia.
- P6. Rendas informadas são líquidas; `gross` = líquido; salário e PJ no dia 5/10, 13º e bônus no dia 20.
- P7. O 13º do Pedro acompanha a promoção (R$ 13.000 a partir de dez/2028).
- P8. Extras PJ do Pedro: R$ 2.500 em cada um dos 8 meses (abr a nov); Júlia: os dois patamares ignorando a "média".
- P9. Valores em reais de hoje (a ferramenta trabalha acima da inflação): consórcio sem reajuste, INSS e renda desejada em valores de hoje.
- P10. Lance do consórcio: `lanceModo` vazio (a parcela cai, e não o prazo), sem lance embutido; contemplação no mesmo mês da data do objetivo (48).
- P11. Nenhum crescimento real do aluguel, dos imóveis e do carro, nem depreciação do carro.
- P12. A startup cresce até R$ 175.781 em 3 anos (25% a.a.) e vai a R$ 400.000 no mês 84 em ritmo constante.
- P13. Sem despesas novas com o filho (2029) nem com a casa/apartamento depois de comprados.

## (d) Coisas estranhas que notei no resultado

- **Mês 0 sem receitas e com despesas pela metade.** `meses[0]` (outubro/2026, "hoje" = dia 14) não tem salário, aluguel nem PJ (já passaram do dia 5 e do 10), mas tem alimentação R$ 1.300 (metade de 2.600), lazer R$ 1.200, outros R$ 600 e o plano de saúde inteiro (R$ 1.700); moradia e transporte não aparecem. O mês de partida é um fragmento difícil de ler; com `inicio 2026-10-28` o mês 0 virava novembro (D1).
- **Bens e dívidas líquidos.** No mês 60 `bens` sobe de 425.619 para 557.113 (+ R$ 131.494): entra só a entrada de R$ 130.000, não o
  apartamento de R$ 650.000; `div` fica 0 o plano inteiro (o financiamento de R$ 520.000 não aparece como dívida). Ao longo dos 360 meses `bens`
  sobe cerca de R$ 1.500 por mês (amortização). O patrimônio líquido está certo, mas o "Bens" e "Dívidas" da tela e a
  "relação dívida/renda" ficam subestimados. Idem o consórcio do carro: `bens` já sobe R$ 1.500 por mês desde o mês 0 (carta/60) antes da contemplação.
- **Apartamento: R$ 158.254 saem da caixinha para uma entrada de R$ 130.000** (mês 60: `mov_obj_apto -157.856`, `mov_bens +130.000`, `mov_cofre +~28.000`).
  Consequência de P2, mas a devolução é silenciosa.
- **Lance do consórcio: R$ 4.744** no mês 48 (25% do saldo de R$ 18.975). Está certo, mas o objetivo "carro de R$ 90.000" aparece com
  `amount` de R$ 4.744: o "necessário na data" parece um valor ridículo na tela de objetivos (o preço de R$ 90.000 só aparece em `preco`).
- **Consórcio e apartamento acabam/começam no mesmo mês (60).** O evento "consórcio quitado" e o do apartamento caem na mesma semana; a última parcela de R$ 1.294 ainda aparece no mês 60. Normal, mas a soma dos dois fluxos no mês 60 (parcela do apto de R$ 5.670 mais a última do consórcio) não é sinalizada.
- **Aluguel recebido de R$ 2.200 continua depois da liberdade (mês 222) e dura até os 92 anos do Pedro**, enquanto o INSS só começa nos meses 402 e 431:
  ok, mas não há vacância/manutenção/IR sobre o aluguel.
- **Patrimônio financeiro de R$ 3,93 milhões aos 50 anos** (mês 222) e `sustentavel` de R$ 17.908 por mês, contra R$ 14.000 pedidos: o plano
  sobra muito, em boa parte porque os gastos (R$ 12.800 + 541 de IPVA) ficam fixos por 19 anos (sem filho) e a sobra vira patrimônio. Plausível, mas sugere que
  faltam despesas (P13).
- **Aporte do apartamento = 0 e status "ok" com projeção R$ 158.041** para uma meta de R$ 130.000: a barra do objetivo aparece 122% cheia.
- **IPVA em janeiro** sai no mês 3 (jan/2027), e o 13º em dezembro (mês 2), como esperado. O bônus de dez/2026 (mês 2) e o IPVA caem em meses
  consecutivos; o caixa nunca fica negativo (`minfin` R$ 155.548).
