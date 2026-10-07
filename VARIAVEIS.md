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
variável nasce" aqui é, então, também o campo que a coleta vai preencher.

Situação: **fonte** (informada aqui, só aqui), **ligada** (lida da fonte, sem digitar de novo), **calculada** (sai de outras),
**reserva** (digitada só quando a fonte está vazia), **parâmetro** (escolha de cenário, não fato do cliente),
**repetida** (pedida em dois lugares: a resolver).

## Quem é a família (página Cliente)

| Variável | Caminho no plano | Situação | Quem usa |
|---|---|---|---|
| Nome do cliente | `name` | fonte | saudação, nomes do titular (primeiro nome) |
| Nome do cônjuge | `conjugeNome` | fonte (vazio: o segundo nome de "Camila e Rafael Souza") | IR, sócios, seguros, "de quem é a renda" |
| Idade do titular | `age` | fonte | simulação, fase da vida, seguros |
| Tipo de plano e idade do cônjuge | `tipo`, `spouseAge` | fonte | casal (`ENGINE.casalDe`), eixo da evolução, seguros, IR |
| Dependentes (nome, relação, nascimento) | `riscos.dependentes` | fonte | reserva (d), seguro de vida, IR (dependentes) |
| Começou a trabalhar aos | `patrimonio.comecou` | fonte | fase da vida |
| Quer parar aos, expectativa de vida | `retireAge`, `lifeExp` | fonte | simulação, fase da vida, liberdade |
| Renda desejada | `desired`, `desiredSteps` | fonte | liberdade financeira |

## Dinheiro que entra e sai (Fluxo de caixa)

| Variável | Caminho | Situação | Quem usa |
|---|---|---|---|
| Rendas: valor líquido, datas, degraus | `incomes[].steps`, `days`, `frequency` | fonte | simulação, capacidade de poupança, seguros (renda a proteger) |
| De quem é a renda | `incomes[].pessoa` (titular ou cônjuge) | fonte | IR, sócios |
| Bruto de cada recebimento | `incomes[].gross` | fonte | rendimentos tributáveis e INSS (IR), pró-labore (sócios) |
| Tributável no IR | `incomes[].taxable` | fonte (lucros: não, sozinho) | rendimentos tributáveis (IR) |
| Categoria (salário, pró-labore, lucros, aluguel…) | `incomes[].origin`, `kind` | fonte | ativa ou passiva, INSS, sócios |
| Despesas | `expenses[]` | fonte | simulação, custo de vida, padrão de vida |
| Parcela de uma dívida | linha "Parcela: nome" em `expenses` | ligada ao Patrimônio (a dívida cria e acerta a linha) | fluxo |
| Renda que um bem gera | `patrimonio.bens[].renda` → linha de entrada | ligada ao Fluxo | patrimônio do cliente |
| Custo de vida mensal | média das saídas em 12 meses | calculada (com `riscos.reserva.custoVida` como ajuste) | reserva, liquidez, padrão de vida, fase da vida |

## O que a família tem (página Patrimônio)

| Variável | Caminho | Situação | Quem usa |
|---|---|---|---|
| Financeiro por instituição e tipo (investimento, PGBL, VGBL) | `patrimonio.financeiro[]` | fonte | `initialWealth` (simulação), sucessão, seguros |
| Participações | `patrimonio.participacoes[]` | fonte | `partValue`, sucessão |
| Bens (valor de mercado, saldo devedor, financiamento) | `patrimonio.bens[]` | fonte | `initialBens`, fase da vida, sucessão, proteção dos bens |
| Titularidade de cada bem | `patrimonio.bens[].titularidade` (titular, cônjuge ou casal) e `titularPct` (a parte do titular no casal; 50% sem informar) | fonte | patrimônio do cliente; base futura do % do patrimônio dos seguros e do ITCMD |
| Proteção e apólice de cada bem | `patrimonio.bens[].protecao`, `apolice` | fonte (marcada na Gestão de riscos, gravada no bem) | ameaça 6 |
| Outras dívidas | `patrimonio.dividas[]` | fonte | patrimônio total, sucessão |
| Liquidez ideal | `patrimonio.liquidezIdeal` | fonte | patrimônio do cliente |

## Proteção (Gestão de riscos)

| Variável | Caminho | Situação | Quem usa |
|---|---|---|---|
| Natureza do trabalho | `riscos.reserva.natureza` | fonte | reserva ideal |
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

## Apresentação

| Variável | Caminho | Situação |
|---|---|---|
| Vídeos teórico e do caso de cada capítulo | `videos['cap-<capítulo>-teoria']`, `['cap-<capítulo>-caso']` | fonte; o teórico é o mesmo para todos e deveria ficar numa biblioteca do escritório |

## Repetições a resolver, em ordem

1. **Rendas ativas da família** (o usuário vai reorganizar numa sessão própria): mapear as rendas de cada responsável, quais
   são certas e quais são estimativas, e a participação de cada um nas despesas, que costuma ser uma decisão subjetiva. Daí
   sai a % da renda de cada gerador dos seguros.
2. **Nome e idade das vidas do plano de saúde**: abrir com o titular, o cônjuge e os dependentes da Cliente.
3. **% do patrimônio de cada pessoa nos seguros**: pela titularidade, que já existe nos bens e falta no financeiro e nas
   participações.
4. **Liquidez de cada aplicação** (quando a carteira do cliente for recebida): a escada de D+0 a 1 ano sai dela.

Resolvidas em 07/10/2026: renda tributável, INSS, pró-labore e dividendos (do Fluxo); nomes do casal (Cliente); bens da
gestão de riscos (Patrimônio); plano de saúde no Fluxo (só o que sai do bolso); idade dos geradores de renda (Cliente).
Não são repetição, por decisão do usuário: despesas médicas e instrução no IR (o consultor decide o que é dedutível).
