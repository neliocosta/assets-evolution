# Variáveis do planejamento

Cada informação do cliente é pedida **uma vez**, no lugar onde ela nasce, e as outras páginas leem dali. Este arquivo é o
inventário: o que é cada variável, onde ela é informada, quem a usa e se ainda há repetição a resolver.

**Regra para mudanças:** antes de criar um campo novo, procure aqui se a informação já existe. Se existir, ligue a ela
(mostre o valor com o caminho para mudá-lo onde ele nasce). Se não existir, crie no lugar onde ela nasce e acrescente a
linha aqui. Um valor digitado só vale como reserva quando a fonte ainda está vazia (ex.: rendimentos tributáveis sem
rendas no Fluxo de caixa).

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
| Proteção e apólice de cada bem | `patrimonio.bens[].protecao`, `apolice` | fonte (marcada na Gestão de riscos, gravada no bem) | ameaça 6 |
| Outras dívidas | `patrimonio.dividas[]` | fonte | patrimônio total, sucessão |
| Liquidez ideal | `patrimonio.liquidezIdeal` | fonte | patrimônio do cliente |

## Proteção (Gestão de riscos)

| Variável | Caminho | Situação | Quem usa |
|---|---|---|---|
| Natureza do trabalho | `riscos.reserva.natureza` | fonte | reserva ideal |
| Reserva atual | `riscos.reserva.atual` | ligada ao D+0 da liquidez (com ajuste) | reserva |
| Liquidez D+0 a 1 ano | `riscos.liquidez` | **repetida** em parte: o financeiro por instituição já está no Patrimônio, sem a liquidez de cada aplicação | liquidez, reserva |
| Plano de saúde: vidas (nome, idade) e prêmios | `riscos.saude.vidas` | **repetida**: nomes e idades já estão na Cliente; o prêmio total repete a despesa "Plano de saúde" do Fluxo (no exemplo, R$ 2.790 × R$ 1.500) | saúde |
| Geradores de renda (pessoa, nascimento, %) | `riscos.seguro.geradores` | nome ligado à Cliente (vazio usa o dela); **repetidos**: o nascimento do cônjuge (a Cliente tem a idade) e a % da renda (o Fluxo já diz a renda de cada pessoa) | seguros |
| % do patrimônio de cada pessoa | `riscos.seguro.geradores[].patrimonioPct` | fonte por enquanto (o ideal é a propriedade de cada bem; PENDENCIAS, riscos item 4) | seguros |
| Coberturas atuais, INSS por invalidez e morte | `riscos.seguro.geradores[]` | fonte | seguros |

## Otimização tributária

| Variável | Caminho | Situação | Quem usa |
|---|---|---|---|
| Quem declara | titular e cônjuge da Cliente | ligada | IR |
| Rendimentos tributáveis | do Fluxo: bruto × recebimentos em 12 meses das rendas tributáveis da pessoa | ligada (`tributario.ir.pessoas[].rend` é reserva) | IR |
| INSS no ano | do Fluxo: salário pela tabela do empregado, pró-labore 11%, até o teto | calculada (`…pessoas[].inss` é reserva) | IR, PGBL |
| Dependentes | número da lista da Cliente; quem declara em cada estratégia | ligada | IR |
| Despesas médicas | `tributario.ir.*.lanc[].med` | **repetida** em parte: os prêmios do plano de saúde (Gestão de riscos) são dedutíveis | IR |
| Instrução | `tributario.ir.*.lanc[].instr` | **repetida** em parte: escola e faculdade já são despesas do Fluxo | IR |
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

1. **Plano de saúde** (vidas, idades e prêmios): ler as pessoas da Cliente e ligar o prêmio à despesa do Fluxo.
2. **Despesas médicas e instrução no IR**: abrir com os prêmios do plano de saúde e com as despesas de educação do Fluxo.
3. **Nascimento em vez de idade** na Cliente (titular e cônjuge), para os seguros não pedirem de novo.
4. **% da renda de cada gerador** pelo Fluxo (a renda de cada pessoa).
5. **Liquidez de cada aplicação** no Patrimônio, para a escada D+0 a 1 ano sair dela.
6. **Propriedade de cada bem** (quem é dono de quanto), para o % do patrimônio dos seguros e a base do ITCMD.
