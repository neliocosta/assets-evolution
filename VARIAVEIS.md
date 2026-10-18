# Variáveis do planejamento

Cada informação do cliente é pedida **uma vez**, no lugar onde ela nasce, e as outras páginas leem dali. Este arquivo é o
inventário: o que é cada variável, onde ela é informada, quem a usa e se ainda há repetição a resolver.

**Regra para mudanças:** antes de criar um campo novo, procure aqui se a informação já existe. Se existir, ligue a ela
(mostre o valor com o caminho para mudá-lo onde ele nasce). Se não existir, crie no lugar onde ela nasce e acrescente a
linha aqui. Um valor digitado só vale como reserva quando a fonte ainda está vazia (ex.: rendimentos tributáveis sem
rendas no Fluxo de caixa).

**De onde os dados vão vir:** o portal é a ferramenta de montagem do relatório, não a de coleta. Os dados serão levantados
numa reunião com o cliente, numa ferramenta de coleta que ainda vai ser construída (o projeto está sendo feito de trás para
frente: primeiro a apresentação ao cliente, por último a coleta), e chegarão pré-preenchidos ao portal. O "lugar onde a
variável nasce" aqui é, então, também o campo que a coleta vai preencher. Antes da coleta vem o exame de saúde financeira,
cujas respostas a coleta importa. O planejamento completo é a união de quatro camadas (o exame, amplo; a coleta,
profunda; o que o consultor inclui, decide e sugere; e o que é calculado de tudo isso) com a interface que o apresenta ao
cliente. O exame e a coleta que a Nord já usa estão inventariados no `COLETA.md`, com a camada de origem de cada variável
do plano (exame, coleta, consultor, calculada ou lacuna).

**Uma mudança recalcula tudo** (pedido do usuário, 09/10/2026): as informações do cliente mudam ao longo do tempo, e a
resposta do exame, o campo da coleta e o campo do plano que dizem a mesma coisa são uma variável só. Mudou a variável,
reajustam-se o planejamento, a nota do exame e qualquer calculadora que a use. Notas e totais são calculados, não
gravados; o que precisa ficar na história é uma fotografia datada, que não é fonte de nada.

Situação: **fonte** (informada aqui, só aqui), **ligada** (lida da fonte, sem digitar de novo), **calculada** (sai de outras),
**reserva** (digitada só quando a fonte está vazia), **parâmetro** (escolha de cenário, não fato do cliente),
**repetida** (pedida em dois lugares: a resolver).

## Quem é a família (página Cliente)

| Variável | Caminho no plano | Situação | Quem usa |
|---|---|---|---|
| Periodicidade do planejamento | `periodicidade` ('mensal' ou 'anual'; vazio = mensal) | fonte, na página Cliente (coleta: `orcamentoModo`) | Política de investimentos (a sobra e os aportes por mês ou por ano); outras partes podem passar a usar |
| Nome do cliente | `name` | fonte | "Planejamento de Vida" e as iniciais no alto da área do cliente, nomes do titular (primeiro nome) |
| Nome do cônjuge (completo) | `conjugeNome` | fonte (vazio: o segundo nome de "Camila e Rafael Souza") | iniciais no alto da área do cliente; o primeiro nome no IR, sócios, seguros, "de quem é a renda" |
| Data de nascimento do titular e do cônjuge | `nascimento`, `conjugeNascimento` ("AAAA-MM" ou "AAAA-MM-DD") | fonte, obrigatórias (mês e ano; o dia é opcional) | idade exata de hoje e nos marcos (simulação, eixo da evolução, períodos da liberdade) |
| Idade de hoje do titular e do cônjuge | `age`, `spouseAge` | calculada da data de nascimento (`ENGINE.sincronizaIdades`); informada só num plano antigo, sem a data | fase da vida, seguros, IR, casal (`ENGINE.casalDe`) |
| Tipo de plano | `tipo` | fonte | casal |
| Dependentes (nome, relação, nascimento, até que idade depende) | `riscos.dependentes[]`: `nome`, `relacao`, `nasc` ("AAAA-MM" ou "AAAA-MM-DD": mês e ano obrigatórios, o dia é opcional), `ate` (vazio: a sugestão pela relação, 25 para filhos e 95 para adultos; `ENGINE.idadeLimiteDe`) | fonte | reserva (d), seguro de vida (prazo), IR (dependentes) |
| Começou a trabalhar aos, de cada pessoa | `patrimonio.comecou` (titular), `patrimonio.conjugeComecou` (cônjuge) | fonte, no bloco de cada pessoa da página Cliente (a idade de parar, ao lado, é ligada à Liberdade financeira) | fase da vida: cada pessoa tem a sua curva (`ENGINE.faseDaVida(plan, quem)`); a área do cliente ainda mostra só a do titular |
| Expectativa de vida | `lifeExp` | fonte | simulação, fase da vida, liberdade |
| Rendas ativas de cada pessoa: profissão, natureza do trabalho, horas no mês | `rendasAtivas[]`: `pessoa` (titular ou cônjuge), `profissao`, `natureza` (as de `ENGINE.NATUREZAS`), `horas`; o valor de cada renda fica no Fluxo de caixa | fonte, N por pessoa (coleta: `incomenature` e as listas `ra_regime`, `ra_horas`); num plano antigo, os campos `profissao`, `natureza`, `horas` e os do cônjuge (e `riscos.reserva.natureza`) viram a primeira renda ao abrir a página Cliente (`ENGINE.rendasAtivasDe`) | profissão da pessoa (as das rendas, juntas) e natureza dela (a da primeira renda que a tem) em quem é a família; reserva ideal (a natureza de quem tem a maior renda do trabalho); horas (a soma) no tempo como moeda |
| Experiência com as classes de ativos, de cada pessoa: entende, já investiu, tem restrição; observações | `experiencia.<titular ou conjuge>.<classe>.entende`, `.investiu`, `.restricao`; `experiencia.observacoes` (um campo só) | fonte (a coleta tem as restrições em texto: `restricaoClasseAtivo`, `classeNaoQuer`) | Diagnóstico (a tabela some sem nenhuma marca) |

## Liberdade financeira

| Variável | Caminho | Situação | Quem usa |
|---|---|---|---|
| Renda desejada | `desired` (a do começo da liberdade) e `desiredSteps` (um valor a partir de um mês, digitado num período) | fonte, obrigatória, só na página Liberdade financeira (saiu da Cliente em 14/10/2026) | simulação, liberdade, visão do cliente |
| Idade em que cada um para de trabalhar | `retireAge` (titular), `spouseRetireAge` (cônjuge, num casal) | fonte, obrigatórias, na página Liberdade financeira (saíram da Cliente em 14/10/2026); no exemplo, 57 e 62 | simulação (a liberdade começa quando o primeiro para; a renda ativa do outro continua até a idade dele), fase da vida (a do titular) |
| Rendas da aposentadoria e de quem é cada uma | `passive[]`, `passive[].pessoa` | fonte | simulação, liberdade |
| Forma de sacar | `mode` | sempre `desej` (decisão do usuário); perpetuidade e consumo são só comparação | visão do cliente |
| Patrimônio que dura até a expectativa de vida, alternativas de renda | `alternativas` (portal) | calculada | liberdade |

## Dinheiro que entra e sai (Orçamento e Fluxo de caixa)

A página **Orçamento** (passo 2, antes do Fluxo) é a visão macro: as mesmas linhas de `incomes[]` e `expenses[]`, pela média
dos próximos 12 meses, separadas em rendas, despesas fixas (`group: 'fix'`) e ajustáveis, como no capítulo Gestão financeira
que ela gera. Não há variável nova: criar uma linha no Orçamento cria a linha do Fluxo (mensal, desde hoje), e o valor de
uma linha simples (mensal, um valor só) se edita ali. A linha detalhada no Fluxo (degraus, outra frequência) e a lançada
por outra página (parcela de dívida, plano de saúde) aparecem com a média e o caminho para mudá-la.

| Variável | Caminho | Situação | Quem usa |
|---|---|---|---|
| Rendas: valor líquido, datas, degraus | `incomes[].steps`, `days`, `frequency` | fonte | simulação, capacidade de poupança, seguros (renda a proteger) |
| De quem é a renda | `incomes[].pessoa` (titular ou cônjuge) | fonte | IR, sócios |
| Bruto de cada recebimento | `incomes[].gross` | fonte | rendimentos tributáveis e INSS (IR), pró-labore (sócios) |
| Tributável no IR | `incomes[].taxable` | fonte (lucros: não, sozinho) | rendimentos tributáveis (IR) |
| Categoria (salário, pró-labore, lucros, aluguel…) | `incomes[].origin`, `kind` | fonte | ativa ou passiva, INSS, sócios |
| Descontos de uma renda | bruto menos líquido | calculada (digitar os descontos muda o líquido) | Orçamento |
| O que vem junto de uma renda (13º, comissões, bônus) | linhas próprias em `incomes[]`, presas à renda por `de` | fonte (cada uma é uma linha do Fluxo) | simulação, Orçamento |
| Valor do 13º | `incomes[].segue`: o id do salário | ligada ao líquido do salário, mês a mês | simulação |
| Despesas | `expenses[]` | fonte | simulação, custo de vida, padrão de vida |
| Parcela de uma dívida | linha "Parcela: nome" em `expenses` | ligada ao Patrimônio (a dívida cria e acerta a linha) | fluxo |
| Renda que um bem gera | `patrimonio.bens[].renda` → linha de entrada | ligada ao Fluxo | patrimônio do cliente |
| Custo de vida mensal | média das saídas em 12 meses | calculada (com `riscos.reserva.custoVida` como ajuste) | reserva, liquidez, padrão de vida, fase da vida |

## O que a família tem (página Patrimônio)

| Variável | Caminho | Situação | Quem usa |
|---|---|---|---|
| Financeiro por instituição e tipo (investimento, PGBL, VGBL, previdência fechada, FGTS, empréstimo a amigos e familiares) | `patrimonio.financeiro[]` (`tipo`: vazio, 'pgbl', 'vgbl', 'fechada', 'fgts', 'emprestimo'; os nomes em `ENGINE.TIPOS_FINANCEIRO`). O FGTS e a previdência fechada não têm liquidez (`ENGINE.SEM_LIQUIDEZ`) | com carteira, os investimentos são **calculados** dela (`ENGINE.sincronizaPatrimonio`: soma dos ativos por instituição, titular e tipo, linhas `daCarteira`, só leitura); fundo de pensão, FGTS e empréstimos continuam fonte, digitados. Sem carteira, fonte | `initialWealth` (simulação), sucessão, seguros |
| De quem é cada instituição do financeiro | `patrimonio.financeiro[].titularidade` (titular, cônjuge; vazio num casal: do casal, conjunta) | fonte | quem é a família (onde cada pessoa investe); base futura do % do patrimônio de cada pessoa nos seguros |
| Participações (nome, valor de hoje) | `patrimonio.participacoes[]`: `nome`, `valor` | fonte | `partValue`, sucessão |
| Valorização da participação (ao ano, pontual, valor esperado numa data) e venda planejada | `patrimonio.participacoes[].valorizacao[]` (`tipo`: `taxa`, `pontual` ou `alvo` com `em` e `valor`: o valuation esperado), `.venda` (data, preço, custos) | fonte (consultor); o preço de venda informado vale também como valor esperado no mês da venda | evolução patrimonial (participações), Fluxo de caixa (custos da venda), financeiro (o líquido da venda) |
| Valor projetado da participação | `ENGINE.trajetoriaDaParticipacao` | calculada (não gravada) | Patrimônio, evolução patrimonial |
| Bens (valor de mercado, saldo devedor, financiamento) | `patrimonio.bens[]` | fonte | `initialBens`, fase da vida, sucessão, proteção dos bens |
| Titularidade de cada bem | `patrimonio.bens[].titularidade` (titular, cônjuge ou `casal`, que na tela é "Em partes"), `titularPct` e `conjugePct` (a parte de cada pessoa); o que falta para 100% é de outros (irmãos, outros sócios), calculado (`ENGINE.titularidadeDoBem`). Sem informar, metade de cada um no casal; com só a do titular, o cônjuge fica com o resto | fonte | patrimônio do cliente; base futura do % do patrimônio dos seguros e do ITCMD |
| Proteção e apólice de cada bem | `patrimonio.bens[].protecao`, `apolice` | fonte (marcada na Gestão de riscos, gravada no bem) | ameaça 6 |
| Valorização do bem (ao ano, por um período, ou pontual) | `patrimonio.bens[].valorizacao[]` | fonte (consultor) | evolução patrimonial (valor dos bens), preço projetado da venda |
| Venda planejada do bem: data, valor de venda, custos (% ou R$) | `patrimonio.bens[].venda` | fonte (consultor); valor de venda vazio = o projetado | evolução patrimonial, Fluxo de caixa (custos e saldo devedor transferido), fim da renda e da parcela do bem |
| Objetivos que a venda financia e quanto do líquido vai para cada um | `venda.destinos` (`[{ objetivo, valor }]`, na ordem; `valor` vazio = o que sobra do líquido depois dos anteriores; juntos, nunca passam do líquido), em `bens[]` e `participacoes[]`. Planos antigos (`venda.objetivo`, `venda.paraObjetivo`) viram a lista ao abrir (`ENGINE.normaliza`) | fonte, escolhida no objetivo ("Financiar com patrimônio") ou no destino da venda, no bem; é a mesma variável nos dois lugares | aporte necessário do objetivo (`ENGINE.partilhaDaVenda`, `vendasDoObjetivo`, `saldoDasVendas`), simulação (o líquido vai para o saldo do objetivo no mês da venda), cartão do objetivo na tela do cliente |
| Valor projetado, saldo devedor transferido na venda e líquido da venda | `ENGINE.trajetoriaDoBem` | calculada (não gravada) | Patrimônio, evolução patrimonial |
| Outras dívidas | `patrimonio.dividas[]` | fonte | patrimônio total, sucessão |
| Saldo devedor de hoje (do extrato) | `saldoDevedor` (em `bens[]` e `dividas[]`) | fonte | patrimônio total, evolução patrimonial (cai no ritmo do contrato), sucessão |
| Contrato da dívida: valor liberado, parcelas contratadas, mês da 1ª parcela, parcela atual, juros (ao ano ou ao mês), sistema, IOF, seguro prestamista, tarifas | `credito`, `parcelas`, `inicio` (AAAA-MM), `parcela`, `juros` e `jurosPeriodo` (vazio: ao ano; `mes`), `sistema`, `iof`, `seguro.{modo,valor,pct}`, `tarifas` (em `bens[]` e `dividas[]`) | fonte | `ENGINE.contratoDaDivida`, linha da parcela no Fluxo de caixa |
| Adiantamentos da dívida: daqui a quantos meses, valor, o que reduz (prazo ou parcela) | `amortizacoes[].{em,valor,modo}` (em `bens[]` e `dividas[]`) | fonte (consultor, na gaveta de evolução) | saldo e quitação (`ENGINE.contratoDaDivida`), linha da parcela no Fluxo de caixa (o valor sai no mês) |
| Parcelas que faltam | `restantes` | calculada pelo mês da 1ª parcela e pelos adiantamentos (`ENGINE.restantesDaDivida`); digitada só sem o mês da 1ª parcela | fim da linha da parcela, saldo ao longo do tempo, quitação |
| CET, taxa pela parcela, IOF, valor financiado, saldo pelo contrato, o que falta pagar | `ENGINE.contratoDaDivida` | calculada (não gravada) | cartão da dívida, gaveta de evolução |
| Liquidez ideal | `patrimonio.liquidezIdealPct` (% do patrimônio total: financeiro, participações e bens, menos as dívidas) | fonte, no último bloco da página Patrimônio; o valor em reais é calculado (`ENGINE.faseDaVida`) e acompanha o patrimônio. Num plano antigo, `patrimonio.liquidezIdeal` (em reais) vira o % ao abrir a página | patrimônio do cliente (comparada ao patrimônio financeiro) |
| Instituições onde só tem conta | `patrimonio.contas.titular`, `.conjuge`, `.casal` (nomes; as do casal são conjuntas) | fonte | quem é a família (no cartão de cada pessoa) |

## Proteção (Gestão de riscos)

| Variável | Caminho | Situação | Quem usa |
|---|---|---|---|
| Natureza do trabalho da reserva | `ENGINE.naturezaDaReserva` | ligada: a de quem tem a maior renda do trabalho, entre as da página Cliente (`riscos.reserva.natureza` só num plano antigo) | reserva ideal |
| Reserva atual | `riscos.reserva.atual` | ligada ao D+0 da liquidez (com ajuste) | reserva |
| Liquidez D+0 a 1 ano | `riscos.liquidez` | fonte, digitada por enquanto (decisão do usuário); no futuro virá da carteira do cliente, que traz a liquidez de cada aplicação | liquidez, reserva |
| Plano de saúde: prêmio de cada vida e quem paga | `riscos.saude.vidas[].premio`, `pagador` ('terceiros': empresa ou outra pessoa) | fonte | custo do plano, economia da alternativa |
| Plano de saúde no Fluxo de caixa | `riscos.saude.linha` → despesa fixa | ligada: recebe só o que sai do bolso da família (soma dos prêmios menos os pagos por terceiros), como a parcela de uma dívida | fluxo |
| Plano de saúde: nome e idade de cada vida | `riscos.saude.vidas[].nome`, `idade` | **repetida** em parte: titular, cônjuge e dependentes já estão na Cliente | saúde |
| Geradores de renda: pessoa e idade | `riscos.seguro.geradores[].pessoa` | ligada: nome e idade do titular e do cônjuge vêm da Cliente; o nascimento só é pedido para "outra pessoa" | seguros |
| Geradores de renda: % da renda da família | `riscos.seguro.geradores[].participacao` | fonte; muitas vezes é uma decisão subjetiva (que parte das despesas cada responsável custeia). Vai ser revista com o mapa das rendas ativas | seguros |
| % do patrimônio de cada pessoa | `riscos.seguro.geradores[].patrimonioPct` | fonte por enquanto; poderá sair da titularidade dos bens (falta a do financeiro e das participações) | seguros |
| Coberturas atuais, INSS por invalidez e morte | `riscos.seguro.geradores[]` | fonte | seguros |

## Otimização tributária

| Variável | Caminho | Situação | Quem usa |
|---|---|---|---|
| Quem declara | titular e cônjuge da Cliente | ligada | IR |
| Rendimentos tributáveis | do Fluxo: bruto × recebimentos em 12 meses das rendas tributáveis da pessoa | ligada (`tributario.ir.pessoas[].rend` é reserva) | IR |
| INSS no ano | do Fluxo: salário pela tabela do empregado, pró-labore 11%, até o teto | calculada (`…pessoas[].inss` é reserva) | IR, PGBL |
| Dependentes | número da lista da Cliente; quem declara em cada estratégia | ligada | IR |
| Despesas médicas | `tributario.ir.*.lanc[].med` | fonte (decisão do usuário): o consultor informa o que entra no IR, porque nem toda despesa médica é dedutível; é outra variável, não o prêmio do plano | IR |
| Instrução | `tributario.ir.*.lanc[].instr` | fonte (decisão do usuário): o consultor informa o valor dedutível, com o teto legal; R$ 10 mil de escola não viram R$ 10 mil no IR | IR |
| PGBL | `tributario.ir.*.lanc[].pgbl` | fonte (atalho de 12% da renda ligada) | IR, aporte do simulador |
| Pró-labore e dividendos de hoje | do Fluxo: linhas Pró-labore e Distribuição de lucros da pessoa | ligada (`socios[].pro`, `div` são reserva) | sócios |
| Sócio, empresa, regime, pró-labore recomendado | `tributario.prolabore.socios[]` | fonte (o sócio é uma pessoa da família) | sócios |
| Patrimônio da sucessão | Patrimônio | ligada | sucessão |
| ITCMD, custos, valor a levar para a previdência | `tributario.sucessao` | parâmetro | sucessão |
| Simulador da previdência | `tributario.previdencia` | parâmetro (o valor inicial poderia abrir com a previdência do Patrimônio) | previdência |

## Propósito (o primeiro capítulo)

| Variável | Caminho | Situação | Quem usa |
|---|---|---|---|
| Valor do objetivo que vira bem (o preço) e o necessário na data (a entrada) | `objectives[].preco` (vazio: o preço é o necessário), `objectives[].amount` | fonte (consultor, no cartão do objetivo; o preço só aparece no tipo "Vira bem"). O preço é só para mostrar (`ENGINE.precoDoObjetivo`); o aporte, a simulação e o bem que entra no patrimônio usam o necessário na data | cabeçalho do cartão do objetivo, cartão do objetivo na tela do cliente |
| Orçado de cada objetivo mês a mês (aporte, o que entra de uma vez, saldo) e os três cortes antes da data | `ENGINE.orcadoDoObjetivo`, `ENGINE.cortesDoObjetivo` | calculada da simulação (não gravada) | capítulo Objetivos ("Como realizar cada objetivo"). A foto do plano (`objectives[].foto`) e o realizado (`objectives[].realizado`) ficaram fora da ferramenta, guardados em `reaproveitar/acompanhamento.js` |
| Descrição de cada objetivo (por que ele importa) | `objectives[].descricao` | fonte (coleta: `obj_descricao`; no portal, no bloco Propósito da página Objetivos) | Propósito |
| Ordem dos objetivos | `objetivosOrdem` (ids; `seguranca` e `liberdade` para os dois fixos) | fonte (a ordem declarada na coleta; no portal, as setas) | Propósito |
| Segurança e liberdade financeira na lista, e as descrições delas | `ENGINE.objetivosDoProposito` | calculada (sempre na lista; a da liberdade usa a data da liberdade e a renda desejada) | Propósito |
| A frase do propósito | `ENGINE.fraseDoProposito` | calculada (singular ou plural pelo tipo de plano) | Propósito |
| Quem cuida do planejamento: nome, certificação, telefone, e-mail, foto | `consultor` | fonte, na página Apresentação; na plataforma, viria do cadastro do planejador (é do escritório, não do cliente) | Propósito |
| Data do relatório | `dataRelatorio` ("AAAA-MM-DD") | fonte, na página Apresentação; vazia, a data de hoje | Propósito |
| Mensagem final do planejador | `mensagemFinal` | fonte, na página Apresentação (capítulo Evolução patrimonial); vazia, a página mostra só a assinatura e o contato | O caminho daqui para frente |

## Política de investimentos

| Variável | Caminho no plano | Situação | Quem usa |
|---|---|---|---|
| Compromissos financeiros (a reforma, um imposto a pagar) | `compromissos[]`: `id`, `titulo`, `descricao`, `em` (o mês, a partir de hoje), `valor` | fonte (coleta: `comprList`; no portal, na página Política de investimentos) | simulação (saem do patrimônio financeiro no mês marcado: `out_comp_<id>`), caixinha Compromissos, fluxo de caixa |
| Patrimônio e aporte da reserva de emergência | `politica.reserva` (vazio = a reserva ideal da Gestão de riscos, até onde o patrimônio com liquidez dá), `politica.reservaMensal` | fonte (consultor) | Política de investimentos; na simulação, a reserva fica dentro da liberdade |
| Patrimônio e aporte de cada objetivo | `objectives[].dedicated`, `objectives[].planned` | fonte: a mesma variável no cartão do objetivo e na política | simulação, Política de investimentos |
| As caixinhas: patrimônio, aporte, horizonte e estratégia de cada uma; a liberdade com o restante; a renda líquida e o padrão de vida (renda − sobra) | `ENGINE.politicaDeInvestimentos` (`renda`, `padrao`, `caixinhas`), `ENGINE.horizonteDe` | calculada (não gravada) | Política de investimentos (portal e cliente), resumo do caso |

## Carteira (atual, macroalocação e microalocação)

| Variável | Caminho no plano | Situação | Quem usa |
|---|---|---|---|
| A carteira de hoje, ativo a ativo | `carteira.ativos[]`: `id`, `instituicao`, `titular` ('titular', 'conjuge' ou 'dep:' + o nome do dependente; vazio num casal = do casal), `nome`, `classe` (um id de `ENGINE.CLASSES_CARTEIRA`; vazio = a classificar), `subclasse`, `vencimento` (o texto da planilha: Diária, D + 30, Previdência…), `tipo` ('' investimento, 'pgbl', 'vgbl'), `valor`, `obs` | fonte: colada da planilha do consultor e editada na página Carteira atual; é a fonte dos investimentos do financeiro | Macroalocação, Microalocação, `patrimonio.financeiro`, `initialWealth` |
| Classe de cada ativo já classificado | base de ativos (no protótipo, `localStorage['nl-base-ativos']`, nome do ativo → classe; na plataforma, a base da Nord) | fonte (consultor), compartilhada entre clientes | classificação dos ativos colados sem classe |
| Perfil da carteira modelo e alocação ideal | `carteira.modelo` (conservador, moderado, sofisticado ou agressivo: os perfis 0 a 3), `carteira.ideal` (frações por classe, como 0.37) | fonte (consultor); escolher o perfil preenche a ideal com `ENGINE.CARTEIRAS_MODELO` (ref. abr/26) | Macroalocação |
| Alocação recomendada | `carteira.recomendada` (frações por classe); a classe sem valor segue a ideal | fonte (consultor) | Macroalocação, Microalocação |
| Os motivos da recomendação | `carteira.justificativa` (texto, um motivo por linha) | fonte (consultor), na Macroalocação | capítulo Carteira do cliente (a carteira recomendada e o resumo do caso) |
| Recursos novos a alocar | `carteira.aporte` | fonte (consultor); a referência é a sobra do mês × 12, com o botão "usar" | total da ideal e da recomendada (carteira de hoje + aporte) |
| O que fazer com cada ativo de hoje | `carteira.ativos[].acao` ('manter', 'parcial', 'integral', 'portabilidade'; nomes em `ENGINE.ACOES_ATIVO`; a coluna Ação da planilha é lida), `.resgate` (R$, no resgate parcial) | fonte (consultor) | Microalocação |
| Os ativos novos | `carteira.novos[]`: `id`, `instituicao`, `nome`, `classe`, `valor` | fonte (consultor) | Microalocação |
| Liquidez diária (o restante), diferenças, o que fica, o resultado por classe e o caixa | `ENGINE.carteiraDoPlano` | calculada (não gravada) | Macroalocação, Microalocação, pendências |

## Diagnóstico

| Variável | Caminho | Situação | Quem usa |
|---|---|---|---|
| Status do orçamento de hoje (o perfil devedor, zero a zero ou investidor) | `ENGINE.orcamentoDoFluxo` | calculada: entradas − saídas, médias dos próximos 12 meses do Fluxo; zero a zero até ±5% das entradas | Diagnóstico |
| Reserva de hoje | `ENGINE.diagnosticoDaFamilia` | calculada: a reserva atual contra a mínima, a aceitável e a ideal da Gestão de riscos | Diagnóstico |
| Percentual de proteção de hoje | `ENGINE.avaliaRiscos` (`nota`) | calculada | Diagnóstico, Gestão de riscos |
| Degrau de cada objetivo hoje e depois (sonho, meta definida, meta com caminho) | `objectives[].diagnostico.presente`, `.futuro` | fonte (consultor, no bloco Diagnóstico da página Apresentação) | Diagnóstico (a contagem dos objetivos bem definidos e com caminho) |
| Perfil de risco da carteira, concentração patrimonial e liberdade encaminhada de hoje | `diagnostico.perfil.presente`, `diagnostico.concentracao.presente`, `diagnostico.liberdade.presente` | fonte (consultor); a coleta tem o perfil de cada carteira (`af_cd_perfil`), ainda não ligado | Diagnóstico |
| Tom de cada valor (em dia, atenção, ruim) e o placar "em dia" de cada coluna | `ENGINE.diagnosticoDaFamilia` (`presenteTom`, `futuroTom`, `placar`) | calculada (proteção: em dia a partir de 80%, atenção a partir de 50%) | Diagnóstico |
| O futuro de cada linha | `diagnostico.<linha>.futuro` (`orcamento`, `reserva`, `protecao` em %, `perfil`, `concentracao`, `liberdade`) | fonte (consultor) | Diagnóstico |
| Guia da concentração (financeiro, imóveis e bens, participações) | `ENGINE.concentracaoDoPatrimonio` | calculada da página Patrimônio; abaixo de 30% no financeiro sugere "preocupante" | portal |

## Gestão financeira

| Variável | Caminho | Situação | Quem usa |
|---|---|---|---|
| Renda líquida, custo de vida e o que vai para o futuro, no mês e no ano | `ENGINE.gestaoFinanceira` | calculada do Fluxo de caixa (média dos próximos 12 meses) | Gestão financeira |
| Despesas fixas e ajustáveis (e cada despesa) | `expenses[].group` (`fix`; as outras são ajustáveis) | ligada ao Fluxo de caixa | orçamento |
| Quantas vezes poupou nos últimos 12 meses | `orcamento.vezesPoupou` (nenhuma, 1-3, 4-6, 7-9, 10+) | fonte (exame: `recentsavingsfrequency`; no portal, na página Orçamento) | Gestão financeira |
| Horas trabalhadas no mês de cada pessoa | a soma de `rendasAtivas[].horas` da pessoa | calculada (as horas de cada renda ativa são fonte, na página Cliente) | o tempo como moeda |
| Valor da hora, horas do presente e do futuro, patrimônio em horas | `ENGINE.horasDoTrabalho` | calculada | o tempo como moeda |
| Orçamento combinado: quanto liberar por mês de cada grupo e de quais despesas sai | `orcamento.combinado.fixas`, `.ajustaveis` (`meta`; `cortes`: `id` da despesa do Fluxo, ou só `nome` quando a família trouxe só o total, `valor` e `trava`) | fonte (gravado na apresentação, pelo consultor; o cliente propõe; o portal mostra o resumo). Só vale o valor das despesas travadas; as outras dividem o resto da meta na hora. Não muda o Fluxo de caixa. Substitui `orcamento.envelopes` | orçamento |

## Apresentação

| Variável | Caminho | Situação |
|---|---|---|
| Capítulos fora da apresentação | `capitulosOcultos` (ids: `proposito`, `diagnostico`, `gestao`, `tributario`, `patrimonio`, `riscos`, `objetivos`, `politica`, `carteira`, `evolucao`) | fonte; o interruptor de cada capítulo na página Apresentação. Fica pelo menos um |
| Vídeos teórico e do caso de cada capítulo | `videos['cap-<capítulo>-teoria']`, `['cap-<capítulo>-caso']` | fonte; o teórico é o mesmo para todos e deveria ficar numa biblioteca do escritório |

## Cenários (portal)

Um cenário não cria variável nova: é uma **fotografia** do plano inteiro, com nome, que o consultor edita no lugar do plano
para testar uma decisão. Fica fora do plano, em `nl-cenarios` neste navegador, e nunca vai para o cliente.

| Variável | Caminho | Situação |
|---|---|---|
| Os cenários do plano (até três) | `nl-cenarios.lista[]`: `id`, `nome`, `em`, `dados` (o plano inteiro) e `anterior` (o plano guardado ao promover outro) | fonte; nome digitado na página Cenários |
| O cenário aberto | `nl-cenarios.ativo` | fonte; com ele, todas as páginas editam `dados` do cenário |
| Os números da comparação e o "plano: X" do placar | `metricasDe(plano)` | calculada, a cada vez, pela mesma simulação das páginas |

## Repetições a resolver, em ordem

1. **Rendas ativas da família** (o usuário vai reorganizar numa sessão própria): mapear as rendas de cada responsável, quais
   são certas e quais são estimativas, e a participação de cada um nas despesas, que costuma ser uma decisão subjetiva. Daí
   sai a % da renda de cada gerador dos seguros.
2. **Nome e idade das vidas do plano de saúde**: abrir com o titular, o cônjuge e os dependentes da Cliente.
3. **% do patrimônio de cada pessoa nos seguros**: pela titularidade, que já existe nos bens e no financeiro (este
   só usado, por enquanto, no retrato da família) e falta nas participações.
4. **Liquidez de cada aplicação**: a carteira já chega com o vencimento de cada ativo (`carteira.ativos[].vencimento`);
   falta ler dele a escada de D+0 a 1 ano (`riscos.liquidez`, hoje digitada).
5. **Classes da carteira × classes da experiência**: `ENGINE.CLASSES_CARTEIRA` (15 classes da macro alocação) e
   `ENGINE.CLASSES_ATIVOS` (11, na experiência com investimentos da página Cliente) dizem quase a mesma coisa com cortes
   diferentes.

Resolvida em 18/10/2026, por decisão do usuário: carteira × patrimônio financeiro (a carteira colada manda no financeiro
por instituição; fundo de pensão, FGTS e empréstimos a amigos e familiares continuam digitados na página Patrimônio).
Resolvidas em 07/10/2026: renda tributável, INSS, pró-labore e dividendos (do Fluxo); nomes do casal (Cliente); bens da
gestão de riscos (Patrimônio); plano de saúde no Fluxo (só o que sai do bolso); idade dos geradores de renda (Cliente).
Não são repetição, por decisão do usuário: despesas médicas e instrução no IR (o consultor decide o que é dedutível).
