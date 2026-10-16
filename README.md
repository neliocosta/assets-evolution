# Evolução Patrimonial — Nord Liberta

Protótipo funcional de duas telas que se conversam. Ambas são arquivos HTML autocontidos, sem dependências
além das fontes do Google, e abrem direto no navegador.

| Arquivo | Para quem | O que faz |
|---|---|---|
| `tela-consultor.html` | Consultor | Configura o plano em nove passos, em três grupos: dados do cliente (Cliente, Fluxo de caixa, Patrimônio), planejamento (Gestão de riscos, Objetivos, Liberdade financeira, Otimização tributária, Premissas) e com o cliente (Apresentação, Propostas). |
| `evolucao-patrimonial.html` | Cliente | Mostra a trajetória do patrimônio ao longo da vida, apresentada ao vivo pelo consultor. |

## Por onde começar

- `node verificar.js` confere as invariantes do motor sem abrir o navegador.
- `VARIAVEIS.md` é o inventário das variáveis do plano: onde cada uma é informada (um lugar só) e quem a usa. Consulte
  antes de criar um campo novo.
- `PENDENCIAS.md` lista o que falta, em ordem de prioridade, com o contexto dos testes com usuários.
- `node sync-motor.js` copia o motor da tela do cliente para a do consultor. **Rode sempre que mexer no motor**:
  as duas telas são autocontidas e por isso carregam uma cópia cada.

## Como as duas telas se conectam

O consultor configura o plano no portal, e ele é gravado sozinho no armazém compartilhado (veja "Quem vê o quê e
onde os dados ficam", abaixo), de onde a área do cliente lê. Não há arquivo para trocar. O portal reabre no ponto
em que parou.

Na tela do cliente, o ícone de janela ao lado do título da tabela ("Fluxo de caixa · por ano") abre a tabela numa janela própria, sem o gráfico e ocupando a tela
toda (`evolucao-patrimonial.html?fluxo`). Ela abre nos próximos 24 meses, mês a mês, com entradas e saídas já
detalhadas, e mostra o mesmo plano e a mesma proposta da tela principal.

## Jornada do cliente e gestão de riscos

A área do cliente é organizada como um livro: capítulos com páginas (`CAPITULOS`, na tela do cliente). Cada capítulo
abre com duas páginas, um vídeo em cada:

- a **capa**: o assunto em uma frase, o vídeo **teórico**, que explica o tema e é o mesmo para todos os clientes, e a lista
  das páginas do capítulo;
- o **resumo do caso**: o vídeo **do caso**, em que o consultor explica o planejamento daquele cliente, os principais
  números ao lado (o ganho de cada página na Otimização tributária; o patrimônio, a fase e o dinheiro disponível; o percentual de proteção e as ameaças
  críticas; a idade da liberdade e os objetivos alcançáveis) e, embaixo, o que fazer, página a página, com o caminho para o
  detalhe (`destaques`, na tela do cliente).

Os vídeos são links do YouTube, do Vimeo ou do arquivo, em `plano.videos['cap-<capítulo>-teoria']` e
`['cap-<capítulo>-caso']`, cadastrados na página Apresentação do portal; vazio, o espaço fica reservado. Depois vêm as
páginas de detalhe, sem vídeo: mostram só os resultados e terminam com "anterior" e "próximo". O cabeçalho mostra a página atual ("Otimização tributária / Imposto de renda da
família"; os capítulos têm só o título, sem número, porque nem todo cliente terá todos), com anterior, próxima e uma barra de progresso dividida por capítulo; um clique nela abre o sumário, que marca
as páginas já vistas. Hoje existem, nesta ordem, **Propósito**, **Diagnóstico**, **Gestão financeira** (capa e três páginas), **Otimização tributária** (quatro páginas), **Patrimônio**
(página "Fase da vida e patrimônio"), **Gestão de riscos** e **Evolução patrimonial** (a trajetória do patrimônio e, por último, "O caminho daqui para frente");
um capítulo ainda por construir (`mock`) aparece só no sumário, como "em breve", fora da sequência. A página pode
vir no endereço (`?fase=proposito`, `?fase=diagnostico`, `?fase=hoje-depois`, `?fase=capa-gestao`, `?fase=renda-custo`, `?fase=tempo`, `?fase=orcamento`, `?fase=capa-tributario`, `?fase=resumo-tributario`, `?fase=ir`, `?fase=patrimonio`, `?fase=riscos`, `?fase=evolucao`, `?fase=caminho`); senão, a tela abre na
última vista, ou no Propósito na primeira vez.

**Propósito**, o primeiro capítulo, abre a reunião com duas páginas, sem capa nem resumo, desenhadas como uma landing page que o
cliente queira rever. Na primeira (`?fase=proposito`): boas-vindas (quem é o plano, quem o preparou e quando) com o vídeo de
boas-vindas do planejador ao lado (`videos['cap-proposito-caso']`); a frase do propósito no centro, em três parágrafos centralizados, num balão claro, em serifada
(DM Serif Display, só ela; os títulos seguem a fonte do plano), com as palavras do propósito em laranja, entrando parágrafo
a parágrafo, devagar (3 s cada, um a cada 2 s), quando a pessoa começa a rolar a página (ou logo, se a página não rola), sobre camadas de cor suaves que se movem devagar; o título "O que vocês querem que seu dinheiro torne realidade:"; e a jornada dos objetivos, com as fotos, entrando em sequência ao longo de uma linha. Na segunda
(`?fase=proposito-nos`): quem cuida do planejamento, com o telefone, o WhatsApp e o e-mail (`plano.consultor`); como vamos
caminhar juntos (escutar, planejar, falar e fazer), numa linha do tempo que se preenche até onde o cliente está; e quem somos
(a Nord Liberta, o padrão FPSB/CFP® e a história do grupo, de 2018 a 2024, da apresentação institucional, também numa linha do
tempo). Quem pede menos movimento no sistema (no Windows, "Mostrar animações" desligado) vê tudo parado, menos a frase, que aparece só pela opacidade, sem subir. No portal, o vídeo, o planejador e a data do relatório (`plano.dataRelatorio`; vazia, a de
hoje) ficam na página Apresentação. O propósito é a frase, falando direto com o cliente (no plural num
casal, no singular para uma pessoa: "Este é o plano da vida que vocês querem viver. / O nosso papel é usar a renda e o
patrimônio de vocês da melhor forma possível para que vocês alcancem as suas realizações e a sua felicidade. / Na nossa
conversa anterior, escutamos vocês e, juntos, concluímos que, para atingir esse propósito, o dinheiro de vocês deve tornar
estes objetivos realidade.") e a lista numerada dos objetivos, com título e descrição (`ENGINE.fraseDoProposito`,
`objetivosDoProposito`). Segurança financeira e liberdade financeira estão sempre na lista, mesmo sem terem sido declaradas,
com a descrição pronta ("Estar blindado dos principais riscos financeiros e ter a fundação sólida para realizar seus
objetivos"; "A partir de jun/2048, conseguir uma renda passiva de R$ 25.000 por mês e não ter mais a obrigação de
trabalhar", com a data e a renda do plano). Os outros são os da página Objetivos, com a descrição de cada um (o porquê, que
virá da coleta). A ordem é a que o cliente declarou (`plano.objetivosOrdem`); sem ela, segurança, os objetivos pela data e a
liberdade por último. No portal, o bloco "Propósito", no alto da página Objetivos, mostra a frase e a lista, com a descrição
de cada objetivo e as setas da ordem.

**Diagnóstico** tem duas páginas, sem capa nem resumo. Na primeira (`?fase=diagnostico`), **quem é a família**
(`ENGINE.familiaDoPlano`): um cartão por pessoa, com a idade, a profissão e a natureza do trabalho (`profissao`, `natureza` e
as do cônjuge, na página Cliente) e as instituições dela: onde investe (as do mercado financeiro, pela titularidade de cada
uma, `patrimonio.financeiro[].titularidade`) e onde só tem conta (`patrimonio.contas.titular`, `.conjuge`); num casal, o que é
do casal (ou sem titularidade) aparece nas duas pessoas com "(conjunta)". Embaixo, "Do casal": os dependentes com a idade.
Depois, a **experiência com investimentos**, de cada pessoa: as onze classes
de ativos (`ENGINE.CLASSES_ATIVOS`: pós-fixado, pré-fixado, indexado à inflação, fundos multimercado, fundos imobiliários,
bolsa Brasil, fundos de ações Brasil, ouro, criptoativos, renda fixa internacional e bolsa internacional), cada uma com
"entende" e "já investiu" (✓) e "tem restrição" (✗), numa tabela só, com as classes nas linhas e um grupo de colunas por
pessoa (`plano.experiencia.titular`, `.conjuge`), e as observações (`plano.experiencia`, na página Cliente); sem nenhuma
marca, a tabela não aparece. Na segunda (`?fase=hoje-depois`), a fotografia de como a família está hoje e de como
queremos que esteja depois do planejamento (`ENGINE.diagnosticoDaFamilia`), em dois cartões lado a lado, como no rascunho
aprovado pelo usuário: "Como vocês estão hoje" (apagado), cada linha num cartãozinho com o nome à esquerda e a etiqueta à direita, e
"Depois do planejamento" (branco, mais estreito), só com as etiquetas, sem repetir os nomes; uma seta suave entre os dois. As linhas ficam numa grade só, para baterem entre os
cartões. São oito linhas:

| Linha | Presente | Futuro |
|---|---|---|
| Status do orçamento (o perfil devedor, zero a zero ou investidor) | calculado: entradas − saídas, médias dos próximos 12 meses do Fluxo de caixa; zero a zero com sobra ou falta de até 5% das entradas | consultor |
| Reserva | calculado pela Gestão de riscos: abaixo da mínima (40% do ideal), entre mínima e aceitável (70%), entre aceitável e ideal, ideal | consultor |
| Objetivos bem definidos | quantos objetivos estão no degrau "meta definida" (valor e prazo) ou "meta com caminho" | idem, com o degrau do futuro |
| Objetivos com caminho definido | quantos estão no degrau "meta com caminho" (sabem como chegar) | idem |
| Percentual de proteção | calculado pela Gestão de riscos | consultor (%) |
| Perfil de risco da carteira | consultor (muito desalinhado, inadequado, adequado) | consultor |
| Concentração patrimonial | consultor (preocupante, razoável, bem distribuída), com um guia | consultor |
| Liberdade financeira encaminhada | consultor (sim ou não) | consultor |

Os degraus de cada objetivo (sonho, meta definida, meta com caminho) são marcados pelo consultor, objetivo a objetivo
(`objectives[].diagnostico.presente` e `.futuro`), e as duas linhas mostram a contagem ("2 de 5"). O guia da concentração
(`ENGINE.concentracaoDoPatrimonio`) mostra, só no portal, quanto do patrimônio (pelo valor de mercado) está no financeiro, nos
imóveis e bens e nas participações, e sugere "preocupante" abaixo de 30% no financeiro. Sem valor, a célula mostra "—". No
portal, tudo fica no bloco "Diagnóstico" da página Apresentação; os valores calculados aparecem só para leitura, com o
caminho até onde nascem.

Cada valor vem numa etiqueta com a cor do estado (`tomDoDiagnostico`): verde quando está em dia (superavitário, reserva ideal,
todos os objetivos no degrau, proteção de 80% ou mais, carteira adequada, bem distribuída, liberdade encaminhada), laranja em
atenção (zero a zero, reserva entre a mínima e a ideal, parte dos objetivos, proteção de 50% a 79%, carteira inadequada,
concentração razoável) e vermelho no resto. No alto de cada cartão, o placar: quantas linhas estão em dia entre as que têm
valor ("1 de 8 em dia"; verde a partir de 3/4, laranja a partir de 40%, vermelho abaixo). O hoje fica sempre à vista; o depois
entra em cascata quando o quadro aparece (40% dele na tela), uma linha a cada 0,45 s, com uma luz laranja passando pela linha,
e o placar do depois aparece no fim. Com menos
movimento no sistema, as linhas do futuro só aparecem pela opacidade, sem a luz.

**Gestão financeira** abre com a capa (só o vídeo teórico, `videos['cap-gestao-teoria']`; o capítulo não tem resumo, `semResumo`)
e tem três páginas, tudo a partir do Fluxo de caixa, pela média dos próximos 12 meses (`ENGINE.gestaoFinanceira`):

- **Renda e custo de vida** (`?fase=renda-custo`): a renda líquida, o custo de vida e o que vai para o futuro (o que sobra),
  por mês ou por ano (uma alternância Mês | Ano); um gráfico de rosca do padrão de vida e do futuro, com a marca da
  referência de 20% para o futuro, os percentuais ao lado e quanto falta para chegar lá; e quantas vezes a família poupou nos últimos 12 meses (`plano.orcamento.vezesPoupou`, a pergunta do exame,
  informada no Fluxo de caixa do portal), numa escala de cinco respostas.
- **Tempo: uma moeda universal** (`?fase=tempo`, `ENGINE.horasDoTrabalho`): para a família ("o combinado") e para cada
  pessoa, as horas trabalhadas no mês (`plano.horas`, `plano.conjugeHoras`, na página Cliente), o valor da hora (a renda do
  trabalho dividida pelas horas), quantas horas pagam o custo de vida e quantas vão para o futuro (na proporção do orçamento
  da família) e quantas horas, e quantos anos de trabalho, o patrimônio de hoje representa; com a marca dos 20% das horas
  para o futuro.
- **O orçamento da família** (`?fase=orcamento`): a bancada onde consultor e família combinam o orçamento. A referência é
  até 50% da renda em despesas fixas, até 30% em ajustáveis e pelo menos 20% para o futuro. No alto, fixo ao rolar, duas
  barras na escala da renda (hoje e combinado; as marcas de 50% e 80% são a referência), em que o futuro cresce com o que
  sai do presente, e o bloco "Para o futuro": de quanto para quanto, uma régua com os 20% e os sonhos (a soma dos aportes
  necessários dos objetivos, `o.required`), de onde veio o dinheiro e quanto ainda falta. Depois, um cartão por grupo:
  quanto liberar (a meta, em reais ou em % do grupo; começa no que passa da referência, e "Até a referência" volta a ele) e
  de quais despesas sai. Uma despesa marcada leva a meta inteira; várias dividem por igual; arrastar a bolinha ou digitar
  numa despesa trava o valor dela (o cadeado), e as outras se ajustam; nenhuma passa do próprio valor, e o que não couber
  aparece como "faltam". Um grupo com menos de duas despesas (a família trouxe só o total) não tem lista: a meta baixa o
  total, e o consultor anota, se quiser, de onde sai (as categorias típicas são botões de escuta, "+ Outro" dá um nome
  livre), com a mesma divisão e o mesmo cadeado; o resto fica "sem item definido". Embaixo, os ajustes combinados, "Voltar
  ao de hoje" e "Voltar ao gravado". Tudo por mês ou por ano (a mesma alternância da página de renda). O consultor
  apresentando grava em `plano.orcamento.combinado` (a meta e as despesas escolhidas; só o valor das travadas vale, as
  outras se recalculam), e a página abre assim da próxima vez; o cliente, em vez de gravar, propõe. O Fluxo de caixa não
  muda. No portal, o bloco Gestão financeira da página Apresentação tem o vídeo da capa e o resumo do orçamento combinado.
  O protótipo isolado da bancada fica em `ux/prototipos/orcamento-combinado.html`.

**Otimização tributária** tem quatro páginas com o mesmo roteiro: no alto, quanto o cliente economiza, com
a comparação de quanto para quanto ao lado; depois, hoje e o recomendado lado a lado, na mesma escala; o que muda; e, recolhida,
a conta. Quando a estratégia recomendada não diminui o imposto de renda, a página do IR não repete hoje igual ao
recomendado: diz que a estratégia atual já está otimizada e mostra só o imposto e os lançamentos de hoje. No portal, a
página Otimização tributária (passo 7) cadastra tudo em `plano.tributario`; as contas ficam no
motor e valem para 2026 (declaração de 2027), com os parâmetros em `ENGINE.IR`:

- **Imposto de renda da família** (`ENGINE.irDaFamilia`): as pessoas são as da família (titular e, num casal, o cônjuge,
  com os nomes da página Cliente). Os rendimentos tributáveis e o INSS de cada uma vêm do Fluxo de caixa
  (`ENGINE.rendaDaPessoa`: o bruto das rendas tributáveis dela nos próximos 12 meses; INSS do salário pela tabela do
  empregado e do pró-labore a 11%); só sem rendas lá valem os digitados. As outras deduções são de cada pessoa, e, em cada estratégia (hoje e recomendada), quem declara os dependentes (a lista da página Cliente) e as
  despesas médicas, a instrução e o PGBL de cada um. `ENGINE.calculaIR` faz a declaração completa e a simplificada e fica
  com a de menor imposto: tabela anual (a mensal × 12), redução da Lei 15.270 (zera até R$ 60 mil por ano e cai em linha
  reta até R$ 88.200), desconto simplificado de 20% até R$ 17.640, R$ 2.275,08 por dependente, instrução até R$ 3.561,50
  por pessoa, médicas sem limite e PGBL até 12% da renda tributável, só para quem contribui ao INSS.
- **Pró-labore e dividendos** (`ENGINE.retiradaDosSocios`): para cada sócio, a mesma retirada com o pró-labore de hoje e o
  recomendado (vazio: o salário mínimo); o resto vem como dividendos. O pró-labore paga INSS de 11% até o teto e IR na fonte
  pela tabela mensal com a redução; fora do Simples (e no Anexo IV), 20% de INSS patronal. Dividendos isentos até R$ 50 mil
  por mês da mesma empresa, 10% sobre o total acima disso, e o imposto mínimo de quem recebe mais de R$ 600 mil no ano. No
  Simples com fator R, a página avisa quando o pró-labore recomendado deixa a folha abaixo de 28% do faturamento.
- **Sucessão e ITCMD** (`ENGINE.sucessao`): o patrimônio vem da página Patrimônio; bens, participações e investimentos,
  menos as dívidas, entram no inventário e pagam o ITCMD e os custos do inventário (4% e 8% por padrão); as aplicações
  marcadas como previdência (coluna Tipo do mercado financeiro: PGBL ou VGBL) ficam de fora. A recomendação leva parte dos
  investimentos para a previdência.
- **Previdência no longo prazo** (`ENGINE.simulaPrevidencia`): mês a mês, um investimento comum (com come-cotas a cada seis
  meses e a tabela de 22,5% a 15% pelo prazo, ou um fundo de ações sem come-cotas) contra uma previdência VGBL (tabela
  regressiva de 35% a 10% por aporte, sem come-cotas, trocas de estratégia por portabilidade). A diferença aparece como
  uma escada: sem come-cotas, trocas sem imposto, alíquota menor e taxa de administração. O cliente mexe nos valores à
  vontade, sem gravar nada.

**Fase da vida e patrimônio** junta num só lugar o patrimônio de hoje e o compara com o esperado para a idade
(`ENGINE.faseDaVida`, no motor). No portal, a idade em que o cliente começou a trabalhar fica na página Cliente, e a
página Patrimônio tem:

- o mercado financeiro por instituição (com a liquidez ideal, em reais), as participações societárias por empresa, os
  bens com valor de mercado e saldo devedor, e as outras dívidas (`plano.patrimonio`). As listas são a fonte dos totais
  que o resto do plano usa: `initialWealth` (financeiro), `partValue` (participações) e `initialBens` (valor de mercado
  dos bens), somados em `ENGINE.sincronizaPatrimonio`, que roda ao configurar o motor e ao aplicar as propostas do
  cliente. Um plano antigo, só com os totais, ganha uma linha por total na primeira vez que a página abre;
- toda dívida, o financiamento de um bem (quando ele tem saldo devedor) ou uma dívida avulsa, tem o mesmo detalhe:
  crédito contratado, juros contratados (% ao ano), situação (em dia ou inadimplente), parcelas contratadas, parcelas
  que faltam e parcela atual;
- a parcela entra no Fluxo de caixa como despesa fixa: ao informar a parcela, o portal cria a linha "Parcela: nome" e a
  mantém igual (valor a partir de hoje e, com as parcelas que faltam, o fim). O consultor pode apontar uma despesa fixa
  que já existe ou dizer que a parcela não entra no fluxo (`divida.linha`, `linhaPropria`, `semFluxo`). Remover a
  dívida ou o bem remove a linha própria;
- um bem que gera renda passiva aponta para a linha de entrada do Fluxo de caixa (`bem.renda`, o id da linha): o
  consultor escolhe uma renda passiva que já existe ou cadastra uma nova dali mesmo. O valor fica num lugar só, o fluxo;
- cada bem tem, em "Ao longo do tempo", um minigráfico do valor e três botões (`ENGINE.trajetoriaDoBem`, no motor):
  - **valorização ao ano**: % ao ano, de uma data, por um número de anos (`bem.valorizacao[]`, `tipo: 'taxa'`); negativa,
    é a depreciação de um carro;
  - **valorização pontual**: um salto em % ou em reais numa data, com o motivo (`tipo: 'pontual'`);
  - **venda**: a data, o valor de venda (vazio: o valor projetado naquela data) e os custos (comissões, impostos e outras
    despesas, cada um em % do valor de venda ou em reais) (`bem.venda`). A página mostra o valor de venda, os custos, o
    saldo devedor transferido ao comprador (ou quitado) e o líquido que vai para o mercado financeiro. As parcelas param no mês da venda: o
    que já foi pago está no Fluxo de caixa, e o que falta é o saldo devedor de hoje, que cai com as parcelas pagas até a
    venda e chega a zero na última das parcelas que faltam. Com o financiamento quitado antes da venda, o valor entra
    líquido.

  Na simulação, a valorização muda o valor dos bens sem passar pelo fluxo de caixa. Na venda, o preço sai dos bens e entra no
  financeiro (Movimentações), e os custos e o saldo devedor transferido são saídas ("Vendas de bens"). A renda que o bem gera e a parcela dele
  terminam no mês da venda. Na evolução patrimonial, a venda e a valorização pontual são marcos, e as curvas saltam na semana
  em que acontecem, sem média. Só os bens da página Patrimônio têm essa linha do tempo; um bem comprado por um objetivo, não.

Na tela do cliente: no alto, a fase atual e as cinco fases com as idades de cada uma. Depois, em
largura total, o patrimônio total e o esperado para a idade, com barras na mesma escala. Em cima, a escada: o mercado
financeiro, mais as participações, mais os bens, menos as dívidas (uma seta vermelha que volta), chegando ao total; cada barra começa onde
a anterior terminou, para ler soma e não proporção. Embaixo, o mínimo, o esperado e o máximo da fase, com o total
tracejado até elas. A liquidez ideal é a faixa escura ao fundo (o financeiro dentro ou além dela; quando falta, a faixa
diz quanto). Embaixo, "De onde vem o seu patrimônio": uma coluna por classe (mercado financeiro,
participações, bens, dívidas), com os itens; um bem ou uma dívida abre o detalhe (financiamento, situação, renda que o
bem gera). Por último, recolhido, "Como o patrimônio esperado é calculado", com a tabela das fases deste cliente.

- Patrimônio total = financeiro + participações + bens (valor de mercado) − saldo devedor dos bens − outras dívidas.
- Fases: a vida de trabalho (de quando começou, da página Cliente, até a idade para parar de trabalhar, da página Liberdade financeira; vazia, 65
  anos) dividida em nonos. Preparação antes de começar; Início de carreira até 2/9; Consolidação até 6/9; Plenitude
  até 9/9; Liberdade financeira depois. Começou aos 23, para aos 65: marcos em 23, 32, 51 e 65.
- Patrimônio esperado = padrão de vida mensal (o custo de vida da reserva) × um fator que vai do mínimo ao máximo da
  fase, na proporção do quanto da fase já passou: Início de carreira 0,5× a 18×, Consolidação 18× a 60×, Plenitude
  60× a 200×, Liberdade 200×. Na Preparação, não há patrimônio esperado (zero). Os fatores ficam em
  `ENGINE.FASES_VIDA`.

**Gestão de riscos** avalia oito ameaças ao padrão de vida (`plano.riscos`, preenchido no portal, na página Gestão de
riscos). O status de cada uma sai de `ENGINE.avaliaRiscos`, no motor, igual nas duas telas.

Na tela do cliente, o alto mostra o percentual de proteção da família e uma **teia** com as oito ameaças: cada ponta é quanto da ameaça
está resolvido (`pct`: a parte coberta quando há um valor a cobrir, como reserva, terceiros, bens e seguros; senão o
status, em dia 100%, atenção 50%, crítico 0%). Embaixo, um cartão por ameaça com o essencial (reserva em % do ideal;
saúde "plano atual é o ideal" ou "possível melhorar"; terceiros, investimentos e bens como lista com a marca de
protegido, parcial ou desprotegido; liquidez em D+0, D+30 e 1 ano, em vezes o padrão de vida; renda e família, quanto
falta de cobertura ou "proteção adequada"). As ameaças vêm num **carrossel**, uma por vez, com o essencial no
alto e o detalhe embaixo; os vizinhos aparecem nas bordas. Todos os slides têm a altura do mais alto, para a página não
subir e descer ao passar de uma ameaça para outra. Passa-se com as setas, arrastando, pelo teclado ou pelos
pontos de progresso, e o clique num nome da teia leva à ameaça. O status verde se chama **Protegido**. A regra de cada
status:

| Ameaça | Protegido | Atenção | Crítico |
|---|---|---|---|
| Desemprego e emergência | reserva atual ≥ ideal | entre a mínima (40%) e o ideal | abaixo da mínima |
| Problema de saúde | plano adequado | pode ser otimizado | sem plano |
| Danos a terceiros | coberturas suficientes | cobertura menor que a ideal | necessidade sem cobertura |
| Ruína em investimentos | todos os itens verificados | algum item em atenção | algum item identificado |
| Risco de liquidez | avaliação do consultor | avaliação do consultor | avaliação do consultor |
| Proteção dos bens | todos protegidos | algum com proteção insuficiente | algum sem proteção |
| Proteção da renda / da família | todas as pessoas não precisam ou têm o necessário | alguém tem menos que o necessário | alguém precisa e não tem |

- Reserva ideal = custo de vida mensal × (d + t): d = 3 com dependentes financeiros, 0 sem; t pela natureza do
  trabalho de quem tem a maior renda do trabalho no Fluxo de caixa (`ENGINE.naturezaDaReserva`; cada pessoa tem a sua, na
  página Cliente) (`ENGINE.NATUREZAS`, os da calculadora de reserva da Nord: servidor público e aposentado 3; estagiário e
  CLT 5; liberal, autônomo e empresário 7). O custo de vida vem do Fluxo de caixa (média das saídas dos próximos 12
  meses), a reserva atual vem do D+0 da liquidez; o consultor pode informar outros. Com a lista de dependentes do
  item 8, é ela que diz se há dependentes.
- A composição do patrimônio (financeiro, imóveis, participações) vem da página Patrimônio. O consultor informa a
  liquidez em reais (D+0 a 1 ano), e o cliente a vê em vezes o padrão de vida mensal (o custo de vida da reserva):
  R$ 60 mil com padrão de R$ 12.678 aparece como 4,7×.
- **Proteção da renda (seguro de acidentes pessoais) e da família (seguro de vida)**: a conta da calculadora de
  seguros da Nord (liberta.nordinvestimentos.com.br/seguros), em `ENGINE.calculaSeguros`, feita para cada gerador de
  renda da família (`plano.riscos.seguro.geradores`). Por pessoa:
  A renda que deseja proteger (a da família × a participação da pessoa; vazia, a renda do trabalho do fluxo);
  B renda passiva (a do fluxo × o percentual que o consultor dá à pessoa, 100% por padrão); C renda protegida (INSS
  por invalidez, ou pensão do INSS por morte); D renda a cobrir = A − B − C; E patrimônio financeiro × a parte da
  pessoa no patrimônio; F prazo; G valor presente de D por F, a 0,4% ao mês.
  Acidentes: F até os 95 anos da pessoa, necessidade = G − E. Vida: F até o último dependente deixar de depender
  (criança até os 25 anos, adulto até os 95, pela data de nascimento em `plano.riscos.dependentes`), H sucessão =
  5% a 20% (padrão 10%) × (financeiro + bens + participações) × a parte da pessoa, necessidade = G + H − E; sem
  dependentes, não é essencial. A cobertura atual de cada pessoa decide o status; a ameaça fica com o pior.
  O card do cliente segue a apresentação da Nord: a necessidade em destaque e a memória de cálculo de A a H.
  A doença grave, que a Nord pergunta, não entra na conta.
- Percentual de proteção (0 a 100%, no código `nota`): média ponderada dos status (em dia 1, atenção 0,5, crítico 0; não avaliados ficam de
  fora), com pesos editáveis em `plano.riscos.pesos` (todos 1 por padrão).
- O cliente simula à vontade (por exemplo, o custo de vida de 8.000 para 7.500 refaz a reserva na hora) e pode propor
  ao consultor, com justificativa, o custo de vida, o alvo de reserva, as idades e os prêmios do plano de saúde, os
  hospitais desejados e, nos seguros, o INSS (por invalidez e por morte) e a cobertura atual de cada pessoa. São alterações do tipo `campo` (qualquer caminho do plano), aprovadas como as outras.

## Propostas do cliente

A tela do cliente mostra o plano aprovado pelo consultor. O cliente pode, na própria tela:

- mudar o valor de uma entrada ou saída (clique na célula: a partir daquele mês ou só naquele mês);
- criar uma entrada ou saída nova (clique na célula de Entradas, Saídas, Fixas ou Ajustáveis, no mês em que ela
  começa) ou remover uma linha a partir de um mês (no mesmo clique da célula);
- mudar o custo e a data alvo de um objetivo (no card do marco, ou arrastando o marco);
- mudar a idade para parar de trabalhar (no card da Liberdade Financeira, ou arrastando-a).

**Nada disso muda o plano**: cada mudança vira uma alteração numa proposta, e a tela alterna entre "Plano atual" e
"Com as alterações" para o cliente ver o efeito. Ele revisa e envia; o consultor abre **Propostas do cliente** (no
menu, com o número de alterações), aprova ou recusa uma a uma, responde e conclui. Só as aprovadas entram no plano,
e a resposta fica registrada nele (`propostas: [{ id, em, decisoes, nota }]`).

## Quem vê o quê e onde os dados ficam

- **Cliente**: só a tela de Evolução Patrimonial (`evolucao-patrimonial.html`), com as ferramentas de proposta.
  Nada de preparo do consultor, nada para carregar ou baixar.
- **Consultor**: o portal (`tela-consultor.html`). "Apresentar ao cliente" (barra lateral e página Apresentação) apresenta o plano
  (`evolucao-patrimonial.html?apresentar`): sem editar, e mostrando a proposta que o cliente enviou.
  "Ver como o cliente vê" abre a tela exatamente como o cliente a tem.

O plano e a proposta ficam num armazém (`<script id="armazem">`, duplicado nas duas telas como o motor e sincronizado
pelo `sync-motor.js`). Na área logada da Nord Liberta, ele é a API da plataforma. No protótipo:

- **no link publicado no Claude**, é o banco compartilhado do próprio link (documentos `plano/atual` e
  `propostas/atual`): o consultor (dono do link) e o cliente (com quem o link foi compartilhado, como Contribuidor)
  usam cada um o seu computador e veem as mudanças do outro na hora. Quem não é dono cai na área do cliente;
- **em localhost**, é o armazenamento do navegador, com as duas telas no mesmo computador.

Não há troca de arquivos: o consultor grava o plano (sozinho, a cada pausa na edição), o cliente grava a proposta, e
cada tela ouve o que a outra gravou.
## Formato do plano

```jsonc
{
  "name": "Ana Ribeiro", "nascimento": "1991-05-12", "lifeExp": 95,   // "AAAA-MM" ou "AAAA-MM-DD" (sem o dia, o dia 1)
  "age": 35, "spouseAge": 38,  // calculadas da data de nascimento (ENGINE.sincronizaIdades); num plano antigo, sem a data, informadas
  "tipo": "familia", "conjugeNascimento": "1988-02-23", "conjugeNome": "Marcos Ribeiro",   // casal: o cônjuge entra no IR, nos sócios e nos seguros (o primeiro nome)
  "retireAge": 57, "spouseRetireAge": 62,   // quando cada um para de trabalhar (obrigatórias); a liberdade começa quando o primeiro para
  "initialWealth": 860000,     // patrimônio financeiro do cliente hoje: ponto de partida do gráfico (com plano.patrimonio, a soma do detalhe)
  "patrimonio": {              // o detalhe do patrimônio de hoje e a fase da vida (página Fase da vida e patrimônio)
    "comecou": 23, "liquidezIdeal": 400000,
    "financeiro": [ {"nome": "Itaú", "valor": 150000, "tipo": ""} ],         // soma em initialWealth; tipo: "" (investimentos), "pgbl" ou "vgbl"
    "participacoes": [ {"nome": "Papelaria Canetinha", "valor": 50000} ],     // soma em partValue
    "bens": [ {"nome": "Apartamento em Mogi", "mercado": 950000,             // mercado soma em initialBens
               "titularidade": "casal", "titularPct": 50,                   // titular, conjuge ou casal (a parte do titular)
               "protecao": "insuficiente", "apolice": {"seguradora": "…"},  // marcada na Gestão de riscos
               "saldoDevedor": 368000, "credito": 560000, "parcelas": 360,  // com saldo devedor, o detalhe do financiamento
               "parcela": 4870, "juros": 9.5, "situacao": "em_dia",         // juros em % ao ano; situacao: em_dia | inadimplente
               "renda": "ent123",                                           // id da linha de renda passiva do Fluxo, se o bem rende
               "valorizacao": [ {"tipo": "taxa", "pct": 2, "de": 0, "anos": 10},     // % ao ano, do mês "de" (0 = set/2026) por "anos"
                                {"tipo": "pontual", "em": 12, "valor": 100000, "pct": null, "motivo": "reforma"} ],   // em % ou em reais
               "venda": {"em": 60, "preco": null,                           // preco vazio: o valor projetado no mês da venda
                         "custos": [ {"nome": "Corretagem", "pct": 6}, {"nome": "Imposto sobre o ganho", "valor": 20000} ]} } ],
    "dividas": [ {"nome": "Consignado", "saldoDevedor": 20000, "credito": 30000, "parcelas": 48, "parcela": 850, "juros": 22, "situacao": "em_dia"} ]
  },
  "tributario": {              // página Otimização tributária; valores anuais no IR, mensais no pró-labore
    "ir": { "pessoas": [ {"nome": "Ana", "rend": 152100, "inss": 12845, "outras": 0} ],
            "atual":       { "depsCom": 0, "lanc": [ {"instr": 0, "med": 0, "pgbl": 0} ] },     // depsCom: índice de quem declara os dependentes
            "recomendada": { "depsCom": 0, "lanc": [ {"instr": 0, "med": 0, "pgbl": 18252} ] } },
    "prolabore": { "socios": [ {"nome": "Marcos", "empresa": "Papelaria", "regime": "presumido", "pro": 7000, "div": 3000, "proRec": 1621, "faturamento": null} ] },
    "sucessao": { "itcmd": 4, "custos": 8, "paraPrevidencia": 300000 },
    "previdencia": { "inicial": 120000, "aporte": 1521, "anos": 20, "rent": 10, "trocas": 4, "aliqComum": 15, "comeCotas": true, "taxaComum": 0.8, "taxaPrev": 0.8 }
  },
  "capacityOverride": null,    // capacidade de poupança informada pelo cliente; null = salário − despesas
  "mode": "desej",             // como sacar na liberdade: "desej" (renda desejada), o que o portal grava; "perp" e "cons" ainda são lidos
  "tipo": "familia",           // "individual" ou "familia": sem família, o cônjuge some do cadastro
  "horizonte": "month",        // como o Fluxo de caixa abre: month, quarter, semester ou year
  "desired": 25000,
  "desiredSteps": [ {"from": 480, "value": 20000} ],   // a renda desejada muda a partir de um mês (0 = set/2026)            // renda familiar desejada na aposentadoria (R$/mês)
  "rate": 0.004,               // retorno real líquido da reserva (ao mês)
  "partValue": 50000,          // planos antigos traziam "rent": vira a linha de despesa "moradia"
  "profiles": { "conservador": 0.004, "moderado": 0.005, "agressivo": 0.006 },

  // Entradas e saídas são linhas do tempo em degraus. Cada degrau vale a partir do mês
  // indicado (0 = set/2026) e o último vale indefinidamente.
  "incomes": [
    { "id": "salario", "label": "Salário da Ana", "pessoa": "titular",   // pessoa: titular ou conjuge (de quem é a renda)
      "kind": "ativa",                      // ativa (trabalho) ou passiva (patrimônio)
      "origin": "Salário",                  // Salário, Pró-labore, Distribuição de lucros, Bônus,
                                            // Comissões, Rendimentos recorrentes, Outras receitas
      "gross": 11700,                       // bruto de cada recebimento: rendimentos tributáveis e INSS do IR; o fluxo usa o líquido
      "frequency": "mensal",                // pontual, semanal, mensal, anual (trimestral e semestral ainda são lidos)
      "days": [5, 20],                      // mensal: dias do mês; o valor do degrau vale para cada dia
      "taxable": true, "description": "",
      "steps": [ {"from": 0, "value": 7500}, {"from": 13, "value": 9000} ],
      "exc": { "10": 0, "14:3": 8000 } }    // ajustes de uma só ocorrência: "mês" ou "mês:semana"
  ],
  "expenses": [
    { "id": "moradia", "label": "Moradia (aluguel)", "group": "fix", "week": 1,
      "endObj": "casa",                     // deixa de existir quando este objetivo é realizado
      "steps": [ {"from": 0, "value": 3000} ] },
    { "id": "ipva", "label": "IPVA", "group": "fix", "frequency": "anual",
      "dates": [ {"m": 0, "d": 5}, {"m": 1, "d": 5}, {"m": 2, "d": 5} ],   // 5/jan, 5/fev e 5/mar
      "steps": [ {"from": 0, "value": 1400} ] },
    { "id": "feira", "label": "Feira", "group": "adj", "frequency": "semanal", "weekday": 6,
      "steps": [ {"from": 0, "value": 300} ] },
    { "id": "guia", "label": "Guia de imposto", "group": "fix", "frequency": "pontual",
      "date": "2027-05-20", "days": [20], "steps": [ {"from": 8, "value": 15000} ] },
    { "id": "mercado", "label": "Mercado", "group": "adj",
      "week": 0,                            // formato antigo, sem days: 0 = diluída no mês; 1 a 4 = semana
      "steps": [ {"from": 0, "value": 2700} ] },
    { "id": "faculdade", "label": "Faculdade do filho", "group": "fix", "week": 1,
      "steps": [ {"from": 80, "value": 2500}, {"from": 128, "value": 0} ] }   // o degrau zero encerra a linha
  ],
  "objectives": [
    {
      "id": "casa", "name": "Casa própria", "icon": "home",
      "kind": "bem",           // "bem" migra para patrimônio; "consumo" é uma saída
      "months": 46,            // data alvo, em meses a partir de set/2026
      "amount": 180000,        // custo pontual
      "costs": [                // gastos depois de realizado; cada um vira uma linha de saída fixa
        { "id": "k1", "type": "fixo", "value": 800, "months": null, "label": "Condomínio" },           // months null = sem prazo
        { "id": "k2", "type": "sac", "principal": 756000, "rateYear": 0.095, "months": 360 }        // "price" ou "sac": juros e amortização mês a mês
      ],                        // planos antigos com "recurring" e "financing" são convertidos; "amort" num fixo é a fração antiga da parcela
      "dedicated": 45000,      // patrimônio já dedicado a este objetivo
      "profile": "moderado",   // nome da faixa; a taxa usada é rateM quando existe
      "rateM": 0.005,          // rentabilidade própria do objetivo, ao mês (o portal vai de 0,35% a 0,65%)
      "planned": 1500,         // aporte mensal definido pelo consultor
      "photo": "",             // endereço de uma imagem, opcional; sem foto o card usa o ícone
      "iconData": "",          // SVG ou PNG enviado pelo consultor, embutido como data URL
      "iconFA": "",            // ou uma classe do Font Awesome, por exemplo "fa-solid fa-car"
      "strategy": "texto apresentado ao cliente"
    }
  ],
  "passive": [
    { "name": "INSS", "gross": 5000, "tax": 800, "net": 4200,
      "startMi": 333, "dur": null, "cost": 0 },  // data fixa (mês 333 = jun/2054); dur em meses, null = vitalícia
    { "name": "Fundo de pensão por 5 anos", "gross": 8750, "tax": 1750, "net": 7000,
      "start": 0, "dur": 60, "cost": 372000 }    // sem startMi: começa `start` meses depois da liberdade
  ]
}
```

Campos vazios são válidos: o card do objetivo mostra travessão e mantém a mesma estrutura para todos.

## Como os números são calculados

A simulação é semanal, dos 0 aos 100 anos, e roda por inteiro a cada mudança de plano.

**Identidade contábil.** Em qualquer período, movimentações no patrimônio = entradas − saídas. O cofre
recebe cada entrada e paga cada saída, semana a semana. Transferências entre cofre, objetivos e bens somam
zero. Isso é verificado mês a mês e o erro é zero.

**Objetivos.** Com taxa `r` do perfil e `n` meses até a data alvo:

- aporte necessário = (custo − dedicado × (1+r)ⁿ) ÷ [((1+r)ⁿ − 1) ÷ r]
- projeção = dedicado × (1+r)ⁿ + aporte definido × [((1+r)ⁿ − 1) ÷ r]
- status: 98% ou mais é Alcançável, 70% ou mais é Alcançável com ajustes, abaixo disso é Requer revisão

Esse é o cálculo teórico. O status exibido, porém, vem da simulação: o portal roda o mesmo motor da tela
do cliente e lê o saldo que cada objetivo realmente acumulou na data alvo. Quando a soma dos aportes passa
da capacidade de poupança, os objetivos mais distantes recebem menos do que o definido, e a coluna
**Efetivo** do resumo mostra isso. Um objetivo só aparece como alcançável se couber no orçamento.

As duas telas são autocontidas e por isso o motor é duplicado. Depois de mexer nele na tela do cliente,
rode `node sync-motor.js` para copiar o bloco para o portal.

**Liberdade Financeira.** Acontece quando o patrimônio, descontado o custo de contratar as rendas passivas
e o que ainda falta para os objetivos pendentes, rende o suficiente para cobrir a diferença entre a renda
desejada e as rendas passivas ativas. Não depende da ordem dos objetivos: adiar um sonho não empurra a
aposentadoria junto. Se aos 68 anos o patrimônio ainda não sustentar a renda desejada, o marco aparece
mesmo assim, mas sem celebração: o card informa quanto o patrimônio de fato sustenta por mês e aponta os
três caminhos para fechar a diferença.

**Data de nascimento.** A página Cliente pede a data de nascimento de cada um (mês e ano obrigatórios; o dia é opcional, e
sem ele vale o dia 1). O motor tira dela a idade exata de hoje, com fração (`ENGINE.idadeExata`): a linha do tempo começa no
nascimento de verdade, e a idade num marco é a certa (quem faz aniversário em maio já tem a idade nova em setembro). `age` e
`spouseAge` passam a ser calculadas e sincronizadas a cada configuração (`ENGINE.sincronizaIdades`, como os totais do
patrimônio). Um plano antigo, sem a data, continua com a idade inteira e o aniversário em 19/09.

**Página Liberdade financeira (portal).** Lê de cima para baixo, como a conversa com o cliente:

- **Renda desejada e quando cada um para de trabalhar**: sliders (a renda de R$ 500 em R$ 500; as idades de ano em ano),
  todos obrigatórios, com o mês em que cada um para. A variável da renda mora só aqui. Num casal, a liberdade começa quando
  o primeiro para; o outro continua com a renda do trabalho até a idade dele (`ENGINE.paradaMi`, `trabalhaEm`). (O motor
  ainda aceita um plano antigo sem as idades: a liberdade é quando o patrimônio sustenta a renda.)
- **Rendas programadas**: o cadastro das rendas da aposentadoria, com de quem é cada uma e a idade de começar dessa pessoa
  ("idade de Marcos"), e as rendas passivas do Fluxo de caixa, só para ler.
- **Renda em cada período**: no alto, três botões: a renda escolhida (a dos sliders e de cada período) ou uma das duas
  alternativas, com a mesma renda em todos os períodos: consumir o patrimônio até a expectativa de vida (a renda cujos saques
  valem o patrimônio da liberdade) e preservá-lo (o rendimento mais as rendas da fase em que elas são menores); escolher uma
  troca a renda desejada e apaga as mudanças por período. Depois, uma linha por período (um período novo começa quando uma
  renda começa ou termina, ou quando a renda desejada muda), com as datas e a idade dos dois, a renda desejada e de onde ela
  vem, numa barra e por escrito: "Fundo de pensão vitalício R$ 5.000 + Fundo por 5 anos R$ 7.000 + Pró-labore do Marcos (até
  Marcos parar) + saque do patrimônio". O primeiro período é a renda desejada do alto; nos outros, um slider muda a renda
  daquele período em diante (`desiredSteps`), e o × volta a seguir o anterior. "Mudar a renda numa idade" cria um período
  novo na idade de uma das pessoas. No último período, "Usar a renda restante" põe nele a renda que leva o patrimônio a acabar
  na expectativa de vida, com os períodos anteriores como estão (procura pela simulação, de R$ 100 em R$ 100, para baixo). Um aluguel diz de que bem vem, e o nome do bem abre o detalhe dele numa gaveta.
- **Simulação patrimonial do plano proposto**, no fim: o veredito (o patrimônio dura até a expectativa de vida, ou até que
  idade, e quanto seria preciso na liberdade para durar até lá) e a curva do patrimônio financeiro da liberdade em diante.
  As contas das alternativas descontam os saques mês a mês à taxa da reserva; a curva e o veredito vêm da simulação.

**Como sacar.** O plano é sempre o da renda desejada (`mode: "desej"`, o padrão do motor e o que o portal grava): a renda
fica igual e o saque muda conforme as rendas entram e saem; o patrimônio pode acabar antes da expectativa de vida ou sobrar.
O motor ainda simula as outras duas formas, que o portal mostra como comparação:

- **Perpetuidade** (`"perp"`): retirada mensal = patrimônio × taxa. O principal fica estável.
- **Consumo** (`"cons"`): retirada mensal = PMT até a expectativa de vida. O patrimônio chega a zero na data.
- **Renda desejada** (`"desej"`): retirada mensal = renda desejada − rendas que entram.

**Fluxo de caixa.** No portal, entradas e saídas aparecem como uma planilha com o tempo na horizontal,
na mesma estrutura da tela do cliente: Movimentações no patrimônio no topo, Entradas, e Saídas dividida
em Fixas e Ajustáveis. Ctrl + rodinha aproxima e afasta, de décadas até semanas; Shift + rodinha e arrastar andam no
tempo. Os valores das células vêm da simulação, então a linha de Movimentações é sempre entradas menos
saídas. Uma linha sem valor no período à vista fica escondida, e o grupo avisa quantas linhas têm valor
antes ou depois da janela.

- Numa coluna de ano ou maior, clicar aproxima até o mês. Numa coluna de mês ou de semana, clicar abre a
  edição: **a partir daqui** (cria um degrau), **só nesta ocorrência** (grava em `exc`) ou **encerrar aqui**
  (degrau zero).
- A linha em branco no fim de cada grupo cria uma linha nova já na data da célula clicada.
- O botão **+** de cada grupo abre o cadastro completo: nome, valor, pontual ou recorrente, frequência
  (semanal, mensal em um ou mais dias, anual em uma ou mais datas), início, até quando, mudanças de valor
  e ajustes de uma ocorrência.
- Aportes e custos dos objetivos e as rendas da aposentadoria aparecem como linhas só de leitura, com o
  caminho para a página onde são editados.

**Frequência.** O valor do degrau é o de cada ocorrência: o salário de 10 mil pago nos dias 5 e 20 é uma
linha de 5 mil com `days: [5, 20]`. Cada ocorrência cai na semana do calendário que contém a sua data, e
na planilha as semanas aparecem pelo intervalo de datas (20–26/09/26, 27/09–03/10/26). Como o mês vai de
salário a salário, os dias 1 a 4 fecham o ciclo anterior. Uma despesa semanal cai em todas as semanas do
mês, que são quatro ou cinco. Para orçamento, o portal usa o equivalente mensal, então um bônus de
12 mil por ano pesa mil por mês e uma despesa semanal de 300 pesa cerca de 1.304 (52 semanas ÷ 12).

**Aposentadoria.** Na liberdade financeira, a renda ativa (trabalho) para; num casal, a de quem ainda não parou continua
até a idade dessa pessoa e conta como renda (diminui o saque e entra no padrão de vida). A renda passiva, como o aluguel
de um imóvel, continua, e entra no cálculo de quanto o patrimônio precisa sustentar. As rendas contratadas
começam numa data fixa (o INSS, numa idade definida) ou na liberdade financeira, com ou sem alguns meses
de espera. Uma renda de data fixa que começa antes da liberdade já entra no fluxo. O portal mostra a data e
a idade de início e de fim de cada uma.

**Gastos depois de realizado.** Cada objetivo tem uma lista `costs`: custo fixo por mês (com ou sem prazo) ou
financiamento, pelo sistema Price (parcela constante) ou SAC (amortização constante), com valor financiado,
taxa efetiva ao ano e prazo em meses. O motor calcula todo mês
o juro sobre o saldo devedor: os juros são despesa (linha "(juros)" nas saídas fixas) e a amortização vira
patrimônio em bens. O portal mostra a primeira e a última parcela, o total de juros e a tabela mês a mês.
Um custo fixo de plano antigo com `amort` (fração fixa da parcela) continua funcionando; trocar o tipo para
Price ou SAC passa a calcular mês a mês.

**Planejador do objetivo.** No portal, o objetivo abre com o básico (nome, tipo, data, valor e quanto guardar)
e um gráfico só dele: o saldo juntado até a data (tracejado, o caminho do aporte necessário), o que acontece na
data (vira bem ou é gasto) e, embaixo, o valor por mês antes e depois, com cada gasto na sua camada e no seu
prazo (a parcela SAC cai). A linha tracejada vertical arrasta só a data; a bolinha, só o valor; as barras,
quanto guardar e o primeiro custo fixo. Antes e depois da data o tempo tem escalas próprias. Gastos depois,
patrimônio reservado e perfil, e apresentação ao cliente entram pelos botões "+". É a conta do objetivo
sozinho; o status do cartão vem da simulação.

**Orçamento dos aportes.** Em cada mês antes da liberdade, sobra para aportes = entradas − despesas − gastos
dos objetivos já realizados (equivalente mensal, a mesma conta do motor). Um aumento de aporte que cria falta
em algum mês abre o orçamento desse mês e pede o que reduzir.

**Fotos do exemplo.** Ficam em `fotos/` e entram no plano pelo campo `photo`, como qualquer outro link.

**Ícones dos objetivos.** O consultor envia um SVG ou PNG, que viaja embutido no plano, ou cola uma classe
do Font Awesome. O ícone aparece no marco do gráfico e no card do cliente. O Font Awesome é carregado de
um CDN e só funciona com internet; o arquivo enviado funciona offline.

**Degraus de valor.** Entradas e saídas não crescem por percentual: o consultor informa o valor de hoje
e, a cada mudança, acrescenta um degrau com o mês em que ela passa a valer. Uma despesa que só começa
depois, como a faculdade, recebe o primeiro degrau nesse mês e vale zero antes. Para encerrar uma despesa,
basta um degrau com valor zero. Depois do último degrau, o valor se repete indefinidamente.

**Mês do motor.** O mês do fluxo vai de salário a salário, não de dia 1 a dia 30. Assim todo mês tem
exatamente um salário e um conjunto de despesas, mesmo quando cai em cinco semanas do calendário.
Trimestres, anos e décadas agregam esses meses, então todo trimestre tem três meses e todo ano tem doze.

**Suavização.** A curva usa média móvel de no mínimo um mês, e o hover lê exatamente a mesma série. Sem
isso o salário entrando em uma única semana apareceria como um salto de patrimônio de quase 3%. Saídas
únicas (contratação das rendas, compra de um bem, gasto de um objetivo) ficam fora da média: a curva cai
inteira na semana em que acontecem.

**Bem fora do alcance.** Um objetivo que vira bem e chega à data com menos de 70% do valor (Requer revisão)
não é comprado na simulação: o saldo fica na reserva e o bem e os gastos depois dele não entram. O portal
oferece usar como valor o que o cliente de fato junta até a data.

## Decisões de projeto

- Escala de tempo logarítmica leve, `u = sinal(t)·ln(1+|t|/6 anos)`, mais densa perto de hoje.
- Eixo de valores em `asinh(P / 500 mil)`, para não achatar os primeiros anos.
- Cores: financeiro `#2E9E5B`, bens `#3B6FCB`, participações `#D9952A`, movimentações `#7C5CBF`.
- Status: verde `#2E9E5B`, laranja `#FA7A35`, vermelho `#D64545`. O laranja da marca substitui o amarelo,
  que não teria contraste suficiente sobre fundo branco.
- Participações societárias têm valor constante, sem remuneração modelada.
- Desktop-first. Abaixo de 1080 px as grades colapsam, mas não há versão mobile.

## Fora de escopo

Herança, versão mobile, múltiplos clientes no portal e persistência em servidor.
A planilha do fluxo de caixa foi feita para mouse e trackpad; não há gesto de pinça em tela de toque.

## Arquivos

| Arquivo | O que é |
|---|---|
| `evolucao-patrimonial.html` | Tela do cliente. Contém o motor de simulação, que é a fonte de verdade. |
| `tela-consultor.html` | Portal do consultor. Carrega uma cópia do mesmo motor. |
| `sync-motor.js` | Copia o motor de uma tela para a outra. |
| `verificar.js` | Roda a simulação em Node e confere as invariantes. |
| `PENDENCIAS.md` | O que falta fazer e o contexto dos testes com usuários. |
| `marca/` | O ícone da Nord (recortado do logo), em 64 e 256 px. As telas levam o de 64 px embutido. |
| `VARIAVEIS.md` | Inventário das variáveis: onde cada uma nasce, quem a usa e as repetições a resolver. |
| `COLETA.md` | As perguntas do exame de saúde financeira e os campos da coleta de dados da Nord, e a origem de cada variável do plano (exame, coleta, consultor ou calculada). |
