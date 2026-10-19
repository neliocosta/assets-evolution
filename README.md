# Evolução Patrimonial — Nord Liberta

Protótipo funcional de duas telas que se conversam. Ambas são arquivos HTML autocontidos, sem dependências
além das fontes do Google, e abrem direto no navegador.

| Arquivo | Para quem | O que faz |
|---|---|---|
| `index.html` | Consultor | Clientes: a porta de entrada. Lista os planos guardados e abre, para cada cliente, "Ver relatório" ou "Editar relatório". Na plataforma, é o `/internal`. |
| `tela-consultor.html` | Consultor | Configura o plano em nove passos, em três grupos: dados do cliente (Cliente, Fluxo de caixa, Patrimônio), planejamento (Gestão de riscos, Objetivos, Liberdade financeira, Otimização tributária, Premissas) e com o cliente (Apresentação, Propostas). |
| `evolucao-patrimonial.html` | Cliente | Mostra a trajetória do patrimônio ao longo da vida, apresentada ao vivo pelo consultor. |

## Por onde começar

- `node verificar.js` confere as invariantes do motor sem abrir o navegador.
- `VARIAVEIS.md` é o inventário das variáveis do plano: onde cada uma é informada (um lugar só) e quem a usa. Consulte
  antes de criar um campo novo.
- `PENDENCIAS.md` lista o que falta, em ordem de prioridade, com o contexto dos testes com usuários.
- `node sync-motor.js` copia o motor (e o armazém e os gráficos compartilhados) da tela do cliente para a do consultor.
  **Rode sempre que mexer no motor ou no sunburst**:
  as duas telas são autocontidas e por isso carregam uma cópia cada.

## A realização de cada objetivo

O capítulo **Objetivos** vem antes da evolução patrimonial. A página "Como realizar cada objetivo" (`?fase=realizacao`)
mostra um objetivo por vez, escolhido nas abas: a estratégia (`strategy`, em texto corrido); o que é preciso na data (o
necessário, o preço do bem e as novas despesas mensais depois); de onde vem o dinheiro (a caixinha reservada hoje, as vendas
e os aportes mensais, cada um pelo que vale na data); e o caminho até lá, com a curva do saldo e três cortes antes da data
(a um quarto, à metade e a três quartos do prazo). Tudo sai da simulação (`ENGINE.orcadoDoObjetivo`, `cortesDoObjetivo`).

**O acompanhamento não entra nesta ferramenta.** Ela serve para o consultor desenhar o plano e apresentá-lo ao cliente; o
orçado x realizado (a foto do plano, o realizado mês a mês, os aportes cumpridos e o saldo do extrato) é da futura área
logada do cliente. O que já foi feito está guardado em `reaproveitar/acompanhamento.js`, que nenhuma das telas carrega: a
conta (testada no `verificar.js`) e as telas como estavam no protótipo.

## As rendas no Orçamento

Cada renda é a linha principal do Fluxo de caixa e aparece no Orçamento numa linha recolhida (o tipo, o nome, a categoria,
quem a gera, o líquido e o bruto, e o que vem junto) que abre ao clicar e recolhe com o OK. Aberta, tem o tipo (ativa ou
passiva, `kind`), a categoria (`origin`), o nome, quem a gera (uma pessoa, `pessoa`, ou, numa passiva, um bem, que é
gravado do lado do bem em `patrimonio.bens[].renda`), o bruto (`gross`), os descontos (calculados como bruto menos
líquido; digitar os descontos muda o líquido), o líquido e se é tributável no IR. Numa renda ativa, "Além do salário"
reúne o que vem junto: o 13º (só no salário), as outras remunerações variáveis
por mês (comissões, adicional por performance ou por viagens) e cada bônus (trimestral, semestral ou anual, com o
mês). Cada um é uma linha própria do Fluxo, presa à renda por `de`, e aparece no Fluxo como as outras. O 13º cai em 20 de
dezembro, ou metade em 30 de novembro e metade em 20 de dezembro, e segue o líquido do salário (`segue`, que o motor lê em `stepAt`): um aumento no salário muda o 13º sozinho;
com duas datas, o motor reparte o valor entre elas. Remover a renda remove o que vem junto. Datas, degraus e mudanças ao longo do tempo continuam no Fluxo. Na versão
final, as rendas chegam da coleta, e aqui o consultor corrige ou acrescenta o que faltou.

## A média dos próximos 12 meses

A sobra do mês, a capacidade de poupança, o custo de vida e a renda do Orçamento saem de uma conta só,
`ENGINE.mediaDe12Meses`: o que cada linha de fato paga ou recebe em cada um dos próximos 12 meses, dividido por 12. Um
bônus anual de R$ 30 mil que cai em março pesa R$ 2.500 por mês, mesmo que a linha comece depois de hoje. Ficam fora o que
acontece uma vez só (frequência pontual) e os ajustes de uma ocorrência. Num planejamento anual (`periodicidade`, na página
Cliente), o placar do topo mostra a capacidade, os aportes e a folga por ano, como a Política de investimentos; o motor
continua mensal.

## A ordem das linhas do fluxo de caixa

Nas duas planilhas do fluxo (a do portal e a que fica embaixo do gráfico, na área do cliente), as linhas de cada grupo
vêm na ordem de quantos meses, de hoje em diante, elas têm valor (`ENGINE.frequenciaDasLinhas`, uma conta por simulação):
as que aparecem em mais meses ficam em cima. Como as linhas sem valor na janela à vista somem, ao andar no tempo são as de
baixo que entram e saem, e as de sempre não mudam de lugar. O empate mantém a ordem do cadastro; um grupo que reúne
subgrupos (as Saídas: fixas, ajustáveis, compromissos…) mantém a ordem deles, e a "+ nova linha" continua no fim.

## Quando o dinheiro acaba

Antes, o motor zerava o saldo negativo da reserva, como se o que faltou aparecesse do nada. Agora, num mês em que as
contas não fecham, o que falta sai primeiro das caixinhas dos objetivos e, sem elas, vira dívida no cheque especial
(`CHEQUE_M`, 8% ao mês, com os juros como saída "Juros do cheque especial" e o saque como movimentação "Cheque especial").
A primeira semana em que o cheque é usado é a ruína (`run().ruina`: a semana, o mês e `cheque12`, a dívida doze meses
depois). Daí em diante o plano para: a liberdade financeira não acontece, um ano depois a simulação congela (a dívida fica
em `cheque12`), as curvas e os marcos param no mês da ruína, o fundo do gráfico e da tabela do fluxo fica vermelho, a
reprodução termina ali e o destino ao lado do gráfico vira o alerta, com o mês, a idade e a dívida em 12 meses.

No portal, a faixa de indicadores troca a Liberdade financeira por "O dinheiro acaba" e leva ao Fluxo de caixa, onde o
alto da página repete o alerta e sugere **simular a contratação de um crédito** (`plano.creditos`: nome, valor liberado, o mês em que o
dinheiro cai, parcelas, juros ao mês e sistema Price ou SAC). O motor (`contratoDoCredito`, `saldoDoCredito`) põe o valor
no financeiro naquele mês (a movimentação "Crédito contratado" e um marco no gráfico) e o saldo devedor nas dívidas; a
parcela entra no Fluxo como uma despesa fixa própria ("Parcela: nome"), refeita a cada mudança do contrato e removida com
ele. Simular um crédito abre a janela "A parcela precisa caber a partir de <mês>" (a mesma da Política de investimentos): as
despesas do mês seguinte ao crédito, pelo equivalente mensal, sem as parcelas de dívidas e de outros créditos, e quanto
reduzir em cada uma a partir daquele mês (um degrau). Ela não fecha sozinha: "Reduzir e seguir" libera quando as reduções
cobrem o que falta para o mês fechar (pode sobrar folga); "Desistir do crédito" tira o crédito e a parcela. O cartão do
crédito diz se o mês seguinte fecha e reabre a janela. Se o dinheiro voltar a acabar mais adiante, o aviso oferece outro
crédito, no novo mês da ruína, até três no plano inteiro (`MAX_CREDITOS`); no limite, só cortando despesas. Quando as
contas fecham em todos os meses, o aviso fica verde.

## A política de investimentos

Para onde vai cada real: o patrimônio financeiro de hoje e a sobra do orçamento, divididos em caixinhas
(`ENGINE.politicaDeInvestimentos`). As caixinhas são os compromissos (`compromissos`, a lista da coleta: gastos já marcados,
com valor e data, que saem do patrimônio financeiro no mês marcado), a reserva de emergência (`politica.reserva` e
`politica.reservaMensal`; vazia, a reserva ideal da Gestão de riscos), cada objetivo (o próprio `dedicated` e `planned` do
objetivo: a política só os reúne) e a liberdade financeira, que fica sempre com o restante. Cada caixinha tem o horizonte
(curtíssimo, abaixo de 6 meses; curto, de 6 a 24; médio, de 24 a 60; longo, de 60 a 120; longuíssimo, mais de 120) e a
estratégia (o perfil de rentabilidade do objetivo; conservadora na reserva e nos compromissos). O FGTS e a previdência
fechada contam no patrimônio, mas sem liquidez: ficam na liberdade. Na simulação, a reserva continua dentro da liberdade.

No portal, é o primeiro passo do Planejamento, e a página é a mesa de distribuição: uma tabela só, com as caixinhas nas
linhas (a reserva e os compromissos antes, depois os objetivos) e as duas fontes nas colunas. O cabeçalho de cada coluna tem o
total (o patrimônio de hoje, a sobra do mês), de onde ele vem e a barra da divisão em escala real; o rodapé é a liberdade
financeira, com o que fica para ela e o estado da coluna ("fecha a conta" ou "passa em R$ X"). Cada valor é um campo
digitado com um controle deslizante fino abaixo (também pelas setas do teclado; a escala é a raiz do valor, para R$ 3 mil e
R$ 600 mil terem a mesma precisão; a marca é a referência, com ímã, e o trecho listrado é o que a liberdade já não tem para
dar) e uma linha de referência curta (a reserva ideal, o aporte necessário) com o botão "usar"; a estratégia de cada objetivo é uma etiqueta que se clica para trocar (conservadora, moderada, agressiva), como a classe na Carteira atual, e a
data, o horizonte e o valor do objetivo ficam sob o nome. Os compromissos se cadastram na própria tabela, logo abaixo da
caixinha deles (na versão final, chegam da coleta, e continuam editáveis): cada um fica recolhido numa linha só, abre ao
clicar e recolhe com o OK ou Enter. O protótipo da mesa fica em
`ux/prototipos/politica-mesa.html`. A sobra do mês é uma conta só em todo o portal: a média dos próximos 12 meses do Fluxo de caixa
(`ENGINE.orcamentoDoFluxo`) ou a capacidade informada; é a mesma dos chips do topo (capacidade de poupança), da mesa, da
janela "O orçamento não comporta" e da área do cliente. Aumentar um aporte consome a liberdade financeira sem aviso;
quando a soma dos aportes (objetivos e reserva) passa da sobra, a janela abre com entradas, despesas e sobra na média, a
falta igual ao excesso do rodapé, e as reduções por despesa (a partir de hoje, no equivalente mensal) ou por outro aporte.
O chip "passa em R$ X por mês · reduzir" do rodapé abre a mesma janela quando a sobra caiu depois. O mês a mês fica com a
simulação: a coluna Entregue/mês da página Objetivos e o aviso do cartão dizem quando o orçamento não entrega o definido. Na área do cliente, é o capítulo depois de
Objetivos: dois Sankeys, cada um na sua escala: o patrimônio de hoje e a renda líquida da família, em dois níveis: a renda se divide
entre o futuro (em cima, a sobra) e o padrão de vida (embaixo, em ardósia, sem destaque, terminando na coluna do meio), e o
futuro se abre nas caixinhas. Embaixo, a tabela. Ao aparecer, cada
Sankey começa como um bloco só, que se divide nas cores das caixinhas, e cada fatia escorre até a sua caixinha (toca mesmo
com menos movimento no sistema, como a trajetória da evolução).
As vendas futuras de bens não entram aqui: aparecem na evolução patrimonial. Num planejamento anual (`periodicidade`, na
página Cliente), a sobra e os aportes aparecem por ano; o motor continua mensal.

## A carteira: atual, macroalocação e microalocação

São três páginas do portal, nas 15 classes da planilha de alocação da Nord (`ENGINE.CLASSES_CARTEIRA`, em renda fixa, renda
variável e internacional, cada uma com a sua cor em tom do meio). A conta é uma só, `ENGINE.carteiraDoPlano`.

**Carteira atual** (Dados do cliente, passo 5): a fotografia das posições de hoje, ativo a ativo, com instituição, titular
(o titular, o cônjuge ou um dependente), ativo, classe, subclasse, vencimento, tipo (investimento, PGBL ou VGBL), valor e
observações. Entra colando as linhas do Excel (Ctrl+C, Ctrl+V na área da página): com o cabeçalho, as colunas são
reconhecidas pelo nome; sem ele, pelo conteúdo. A tela segue a posição de uma corretora: no alto, os indicadores (o total
com a barra das classes, contas, ativos, a parte em previdência e o que falta classificar); embaixo, cada conta (instituição
e titular) é um cartão que abre e fecha, com uma faixa de cabeçalho em fundo próprio (instituição em Sora,
titular, total, a parte da carteira e a barra das classes); recolhidas, as contas são a visão geral. Os ativos são linhas
brancas com divisórias, o nome em destaque e a liquidez pequena embaixo; os títulos das colunas ficam presos no alto ao
rolar. A mesma lista pode ser vista por classe. Na linha, os campos não têm borda até o mouse passar; classe e subclasse são
etiquetas empilhadas, na altura de uma linha, que se clicam para trocar; o valor aparece sem centavos; a previdência é um botão de três estados (não é, PGBL, VGBL); a observação é um ícone,
cheio quando há texto, que abre o campo embaixo da linha. Instituição e titular se mudam no cabeçalho da conta, para todos
os ativos dela; dá para acrescentar um ativo na conta ou uma conta nova. A classe
que não vier sai da base de ativos já classificados, que aprende a cada colagem e a cada classe escolhida; o titular sai da
coluna Titular ou do primeiro nome da família que aparecer na instituição ("XP Aline"); o tipo, da palavra PGBL ou VGBL na
linha.

Preenchida, a carteira é a fonte dos investimentos do patrimônio financeiro: `ENGINE.sincronizaPatrimonio` soma os ativos
por instituição, titular e tipo em `patrimonio.financeiro` (linhas `daCarteira`, só leitura na página Patrimônio), e daí
sai o `initialWealth`. Sem carteira, vale o que foi digitado no Patrimônio. Fundo de pensão (previdência fechada), FGTS e
empréstimos a amigos e familiares não são da carteira: ficam no Patrimônio, digitados, e não somem quando a carteira é
preenchida ou limpa. Limpar a carteira tira só os investimentos que vieram dela.

**Macroalocação** (Planejamento, passo 7, depois da Política de investimentos): a mesa da política com as classes nas linhas
e três colunas: hoje, ideal (o mundo perfeito: tudo em dinheiro, alocando do zero) e recomendada (o ajuste possível agora).
A última coluna é a diferença em reais entre a recomendada e hoje. Ideal e recomendada são % sobre a carteira de hoje mais os recursos
novos (`carteira.aporte`, com a sobra de 12 meses como referência), cada uma com o campo e o controle deslizante fino (escala
da raiz, com ímã na referência: o perfil escolhido na ideal, a ideal na recomendada). A liquidez diária é o rodapé e fica com
o restante, como a liberdade financeira na política; o trecho listrado do trilho é o que ela já não tem para dar, e o rodapé
diz "fecha a conta" ou "passa em X p.p.". A ideal parte de uma carteira modelo, do perfil 0 (conservador) ao 3 (agressivo),
em `ENGINE.CARTEIRAS_MODELO`; a classe sem recomendada segue a ideal, então só se digita a exceção (o fundo alternativo que
não se consegue vender). No alto da página, num bloco à parte da mesa: a carteira modelo (perfis 0 a 3, com o nome de
cada um), os recursos novos e o total a alocar; embaixo deles, as três carteiras (hoje, ideal, recomendada) em sunburst,
que acompanham a mesa enquanto se digita ou se arrasta. Os cabeçalhos da mesa têm só o rótulo e o total, alinhados; a
explicação de cada coluna fica na dica. Depois da mesa, os motivos da recomendação (`carteira.justificativa`, um por
linha), que o cliente vê.

O **sunburst** (`SUNBURST`, no bloco `<script id="graficos">`, que o `sync-motor.js` copia para o portal) segue o exemplo
"Portfolio" do Flourish: o anel de dentro são os grupos (renda fixa, renda variável, internacional), em pastel, e o de fora
as classes, em cores vivas; sem rótulos no gráfico, porque a legenda ao lado já descreve cada classe. Trocar de carteira e clicar num grupo (que passa a ocupar a volta inteira;
o centro volta) são animados, arco por arco; na primeira vez, os arcos abrem em leque. O centro mostra o total e, com o
mouse num arco, o nome, o % e o valor dele.

**Microalocação** (passo 8): cada ativo de hoje é mantido, resgatado em parte (com o valor), resgatado por inteiro ou
portabilizado (`ativos[].acao`, `.resgate`), e os ativos novos (`carteira.novos`) entram no lugar. Segue o desenho da
Carteira atual: no alto, os indicadores (o que há para aplicar, o aplicado nos novos, o saldo e os ativos sem decisão);
depois, o placar por classe num cartão que recolhe (a recomendada, o que fica dos ativos de hoje, os novos, o resultado e
quanto falta, sem as classes zeradas); o "+ incluir" cria um ativo novo da classe com o valor que falta. Os ativos de hoje
vêm em cartões por conta, que abrem e fecham, com a decisão na própria linha, numa etiqueta clicável com a cor de cada uma
(Manter, Resgate parcial, Resgate integral, Portabilidade; no parcial, o valor que sai se digita ao lado), o valor de
hoje, o que sai e o que fica; o ativo ainda sem decisão leva a etiqueta "a decidir" tracejada e uma marca laranja à
esquerda. Os ativos novos ficam
num cartão no mesmo formato. Os recursos fecham quando resgates, portabilidades e recursos novos são iguais ao aplicado nos
novos.

Na área do cliente, o capítulo **Carteira** vem depois da Política de investimentos, com capa e resumo do caso, como os
outros, e três páginas: **A carteira de hoje** (o sunburst grande, a legenda por grupo e classe e as contas, cada uma com o
total e a parte da carteira); **A carteira recomendada** (as abas Hoje, O ideal e Recomendada: ao chegar, a carteira de
hoje vira a recomendada diante do cliente; a legenda mostra a diferença para hoje em pontos percentuais; depois, os motivos
do consultor e o que muda por classe em duas colunas, o que resgatar à esquerda e o que aplicar à direita, cada uma com o
total, o valor de cada classe, o % de hoje para o recomendado e uma barra fina do tamanho; embaixo, a diferença entre as
duas são os recursos novos); e **O que muda na carteira** (os indicadores do que fica,
sai em resgates, vai por portabilidade e entra, e três cartões com os investimentos de cada lado).

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

Cada capítulo pode sair da apresentação: na página Apresentação do portal, um interruptor antes do nome de cada capítulo
grava `plano.capitulosOcultos`. Desligado, o bloco do capítulo recolhe e mostra "fora da apresentação". A área do cliente
monta o livro sem esses capítulos (tira-os de `CAPITULOS` antes de montar `PAGINAS`): somem a capa, o resumo e as páginas,
e o sumário, os "Próximo", a numeração ("capítulo 3 de 8") e os próximos passos da última página seguem sem eles. Fica
pelo menos um. Como o livro é montado ao abrir, a área do cliente aberta recarrega quando o consultor muda essa lista.

Os vídeos são links do YouTube, do Vimeo ou do arquivo, em `plano.videos['cap-<capítulo>-teoria']` e
`['cap-<capítulo>-caso']`, cadastrados na página Apresentação do portal. Sem vídeo, o bloco não aparece: a capa vira a lista das páginas do capítulo, cada uma com o resultado principal ao lado (o primeiro número de `destaques`), e o resumo mostra os principais números lado a lado, na largura toda. O mesmo vale para o vídeo de boas-vindas do Propósito. Depois vêm as
páginas de detalhe, sem vídeo: mostram só os resultados e terminam com "anterior" e "próximo". O cabeçalho mostra a página atual ("Otimização tributária / Imposto de renda da
família"; os capítulos têm só o título, sem número, porque nem todo cliente terá todos), com anterior, próxima e uma barra de progresso dividida por capítulo; um clique nela abre o sumário, que marca
as páginas já vistas. Hoje existem, nesta ordem, **Propósito**, **Diagnóstico**, **Gestão financeira** (capa e três páginas), **Otimização tributária** (quatro páginas), **Patrimônio**
(página "Fase da vida e patrimônio"), **Gestão de riscos**, **Objetivos** (capa, resumo e "Como realizar cada objetivo") e **Evolução patrimonial** (a trajetória do patrimônio e, por último, "O caminho daqui para frente");
um capítulo ainda por construir (`mock`) aparece só no sumário, como "em breve", fora da sequência. A página pode
vir no endereço (`?fase=proposito`, `?fase=diagnostico`, `?fase=hoje-depois`, `?fase=capa-gestao`, `?fase=renda-custo`, `?fase=tempo`, `?fase=orcamento`, `?fase=capa-tributario`, `?fase=resumo-tributario`, `?fase=ir`, `?fase=patrimonio`, `?fase=riscos`, `?fase=realizacao`, `?fase=evolucao`, `?fase=caminho`); senão, a tela abre na
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
- toda dívida, o financiamento de um bem (quando ele tem saldo devedor) ou uma dívida avulsa, tem o mesmo detalhe, o
  contrato: valor liberado (o que caiu na conta), parcelas contratadas, mês da 1ª parcela, parcela atual (o total cobrado
  no mês), juros contratados (em % ao ano ou ao mês, à escolha), sistema (Price ou SAC), IOF (somado ao crédito, pago à parte ou isento), seguro
  prestamista (prêmio único somado ao crédito, ou mensal em % sobre o saldo devedor), tarifas somadas ao crédito e
  situação. Com o mês da 1ª parcela, as parcelas que faltam são calculadas; sem ele, informadas;
- com o valor liberado, as parcelas e a parcela atual (ou os juros), o motor monta o contrato parcela a parcela
  (`ENGINE.contratoDaDivida`). A parcela que o banco cobra manda: a taxa sai dela, e a informada é conferida. O IOF é o de
  pessoa física (0,38% mais 0,0082% ao dia sobre cada amortização, até 365 dias) e, somado ao crédito, incide sobre ele
  mesmo. O CET é a taxa que iguala o que o cliente recebeu às parcelas que paga. O cartão mostra o CET, a taxa conferida
  com a informada, o saldo pelo contrato conferido com o do extrato, as parcelas que faltam e quanto ainda falta pagar,
  com os juros. Quando a parcela não fecha com a taxa e o IOF está somado ao crédito, o cartão sugere conferir se o IOF já
  estava dentro do valor liberado;
- "Ver evolução" abre a dívida numa gaveta larga, como um simulador de financiamento: o contrato (os mesmos campos), os
  adiantamentos, o saldo devedor parcela a parcela com o ponto de hoje, quanto se paga por ano dividido em amortização,
  adiantamento, juros e seguro, os totais do contrato (liberado, IOF, seguro, tarifas, financiado, total pago, juros,
  quanto custa cada R$ 1 liberado) e uma tabela só, das parcelas: as 10 primeiras e as 10 últimas, com o miolo
  recolhido (um clique abre e fecha);
- adiantamentos (`divida.amortizacoes`): daqui a quantos meses, o valor e o que ele reduz, o prazo (a parcela continua e
  a dívida acaba antes) ou a parcela (o prazo continua). Eles entram no plano: o valor sai no Fluxo de caixa no mês, na
  própria linha da parcela, e o saldo, a parcela e a quitação acompanham. A gaveta compara com o contrato sem eles: os
  juros economizados, a nova data de quitação, a parcela depois do último adiantamento e o total a pagar. O CET continua
  o do contrato;
- no patrimônio vale o saldo do extrato (`saldoDevedor`): hoje é ele, e ele cai no ritmo do contrato até zero na última
  parcela (`ENGINE.saldoDevedorEm`). Sem o contrato, cai como o valor presente das parcelas que faltam;
- a parcela entra no Fluxo de caixa como despesa fixa: ao informar a parcela, o portal cria a linha "Parcela: nome" e a
  mantém igual (valor a partir de hoje e, com as parcelas que faltam, o fim; com o contrato, a parcela dele, revista a
  cada 12 meses quando muda, no SAC ou com o seguro sobre o saldo). O consultor pode apontar uma despesa fixa
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
  A evolução patrimonial usa a mesma conta, mês a mês: a dívida é uma faixa vermelha abaixo do zero, que encolhe com as
  parcelas, e o valor do cursor e do tooltip já desconta o que a família deve. A quitação é um marco ("Dívida quitada:
  nome"; várias no mesmo mês, num marco só). Os três botões do gráfico mostram o patrimônio total, só o financeiro, ou
  o financeiro e as dívidas; com dívida, há um quarto: só o patrimônio líquido, considerando tudo, numa linha cheia com
  a área até o zero (abaixo dele, em tom de dívida: é onde fica visível quando a família deve mais do que tem). O
  terceiro e o quarto só aparecem quando há dívida. Nas visões total e financeiro e dívidas, um botão ao lado liga e
  desliga a linha do patrimônio líquido (o que a família tem na visão, menos o que deve), tracejada, fina e clara, por
  cima das faixas e lida no mesmo eixo; ela começa desligada.
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
alto e o detalhe embaixo; os vizinhos aparecem nas bordas. A ordem é sempre a de `ENGINE.RISCOS` (reserva, saúde,
danos a terceiros, ruína, liquidez, bens, renda, família), e não a do status. O cartão fica da altura da ameaça à
vista, e a página guarda embaixo do rodapé a diferença até a mais alta, para não subir e descer ao passar de uma
ameaça para outra. Passa-se com as setas, arrastando, pelo teclado ou pelos pontos de progresso, e o clique num nome
da teia leva à ameaça. O status verde se chama **Protegido**. A regra de cada status:

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
- O cliente simula à vontade numa calculadora de proposta (veja Propostas do cliente): o ícone junto à reserva, ao
  plano de saúde e aos dois seguros abre a conta numa janela. Ele pode propor ao consultor o custo de vida, o alvo de
  reserva, as idades e os prêmios do plano de saúde, os hospitais desejados e, nos seguros, o INSS (por invalidez e
  por morte) e a cobertura atual de cada pessoa. São alterações do tipo `campo` (qualquer caminho do plano), aprovadas
  como as outras.

## Propostas do cliente

A tela do cliente mostra o plano aprovado pelo consultor. O cliente propõe mudanças de dois jeitos.

**No fluxo de caixa, direto na tabela.** A tabela é uma só (`drawCashflow`): a de baixo do gráfico e a da janela
própria (`?fluxo`) são a mesma página, com o mesmo plano e a mesma proposta do armazém. A edição é só na janela do
fluxo: embaixo do gráfico a tabela é pequena demais, e o clique numa célula avisa e oferece "Abrir agora" (o mesmo que o
ícone de janela ao lado do título). Na janela, a tabela abre bloqueada; clicar numa célula só avisa que é preciso
desbloquear. O cadeado antes do título ("Fluxo de caixa · por mês") desbloqueia:

- clicar numa célula de entrada ou saída abre a edição no lugar da célula, com o valor de cada ocorrência (o mesmo do
  portal, "hoje R$ 3.000 por mês") e quando vale: a partir daquele mês, só naquele mês (com a tabela no mês ou na
  semana) ou encerrar a linha ali. Enter inclui, Tab grava e vai à coluna seguinte (Shift + Tab volta), Esc cancela, e
  clicar fora também inclui;
- clicar e arrastar sobre várias colunas de uma linha seleciona uma faixa de meses (em laranja suave): o valor digitado
  entra em cada mês selecionado, também nos meses em que a linha não acontecia (o IPTU anual, uma linha vazia), e depois
  da faixa a linha volta ao que era (uma compra em 14 parcelas, um pagamento pelos próximos 6 meses). Vira uma alteração
  `{ tipo: 'fluxo', modo: 'faixa', mi, ate, para }`, aplicada como o ajuste de uma ocorrência em cada mês (`exc`), que
  chega ao consultor como "IPTU: de out/2026 a abr/2027 (7 meses), depois volta ao que era";
- clicar no nome de uma entrada ou saída (ex.: IPTU) abre a linha inteira num painel do lado direito, como o cadastro
  do portal e na mesma ordem: nome, valor de cada ocorrência, periodicidade (recorrente ou pontual), a frequência
  (mensal, semanal, em datas do ano) com os dias do mês, as datas do ano ou o dia da semana, início e até quando
  (sempre, até uma data, por um número de vezes ou, nas saídas, até um objetivo ser realizado), com a frase de como a
  linha fica e o efeito no plano. O número de vezes, como no portal, vira o último mês.
  Vira uma alteração `item` (`{ tipo: 'item', lista, id, para, de }`, só os campos que mudaram; `null` apaga o campo),
  que o consultor vê como "IPTU: nova configuração", de "R$ 3.200 por ano…" para "R$ 260 por mês, no dia 10…"
  (`ENGINE.fraseDaLinha`). As mudanças de valor que o cliente já tinha proposto nessa linha saem, porque o painel parte
  delas; as mudanças de valor do plano depois do início ficam;
- no painel da linha, **Excluir esta linha** a tira do plano de hoje em diante (uma alteração `linha` de remover, que
  substitui as outras mudanças propostas nela); numa linha criada na própria proposta, o botão é "Tirar esta linha da
  proposta";
- o **+** ao lado do nome de cada grupo (Entradas, Saídas, Fixas, Ajustáveis), que só aparece com a tabela
  desbloqueada, cria na hora uma linha nova, vazia (a partir do primeiro mês à vista; clicando numa célula do grupo, a
  partir do mês dela), que fica à vista mesmo sem valor, e abre o painel dela: nome, tipo, valor, frequência, início e
  até quando (ex.: comida de mar/2027 a jul/2028). Ou o cliente fecha o painel e preenche as células, uma a uma ou
  arrastando uma faixa de meses. O painel de uma linha nova muda a própria alteração `linha` nova (que leva a
  configuração em `item`), no lugar dela, para as mudanças de valor feitas depois nas células continuarem valendo;
- cada valor vira uma alteração no rascunho da proposta (`PROP.ops`, o mesmo das calculadoras): as duas tabelas, o
  gráfico e as outras páginas se refazem com ele, e as colunas que a mudança alcança ficam em laranja suave;
- os controles ficam na linha do título da tabela, para não tirar espaço do gráfico: desbloqueada, a faixa da proposta
  no alto se recolhe e, no lugar do título, aparece **Enviar as N mudanças** (passando o mouse, a idade da liberdade
  financeira e o patrimônio nela, do plano aprovado para o de agora). Ele abre a revisão da proposta, onde o cliente
  tira o que não quer e escreve a mensagem ao consultor. O cadeado bloqueia de novo; enviada, a tabela volta a bloquear.

**Nos outros cálculos, numa calculadora de proposta**: uma janela com a conta, que se abre

- pelo ícone discreto no card de um objetivo (custo e data alvo) e no da Liberdade Financeira (idade para parar);
- pelo ícone junto aos cálculos da Gestão de riscos (reserva, plano de saúde, seguro de acidentes e seguro de vida).

Arrastar um marco ou a Liberdade Financeira no gráfico continua propondo a nova data ou idade direto, sem a janela.

A calculadora é um componente só (`CALCS` e `abrirCalc`). A janela tem os campos à esquerda (cada um com o valor do
plano embaixo) e o resultado à direita, recalculado sem gravar nada: na linha nova, nos objetivos e na liberdade, uma tabela
"Como está" e "Com estes valores" (a liberdade financeira, o patrimônio nela, a renda desejada coberta e os objetivos no
prazo), que espera o cliente parar de digitar porque roda a simulação inteira (`simulaAParte`: o motor roda com o outro
plano e volta ao da tela). "Enviar ao consultor" leva as alterações, com as observações (opcionais) em cada uma, e envia
a proposta na hora, junto com o que já estava no rascunho. Com a proposta já enviada, a janela só simula. Para uma tela
nova, basta registrar em `CALCS[id]` uma função que devolve `{ titulo, sub, campos, resultado(P, mudou) }` e pôr
`calcIco('id:argumento')` junto ao cálculo; cada campo é um caminho do plano (vira uma alteração `campo`) ou traz a
própria alteração (`alt`).

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
  Nas duas, o consultor tem **← Voltar à edição** no começo do cabeçalho: leva à página do portal que corresponde à página
  à vista (Gestão de riscos → Riscos, Otimização tributária → Tributário, a evolução → Objetivos, a janela do fluxo →
  Fluxo de caixa; `PAG_PORTAL`). Se foi a aba do portal que abriu esta, ela vai para a página e fica à frente, e esta
  fecha; senão, o portal abre na mesma aba. O botão só aparece para o dono do plano: na apresentação, e em "Ver como o
  cliente vê", que o portal abre com `?consultor`. O cliente nunca o vê.

O plano e a proposta ficam num armazém (`<script id="armazem">`, duplicado nas duas telas como o motor e sincronizado
pelo `sync-motor.js`). Na área logada da Nord Liberta, ele é a API da plataforma. No protótipo:

- **no link publicado no Claude**, é o banco compartilhado do próprio link: um documento por cliente,
  `planos/<id>` e `propostas/<id>`. Só o dono do link lê e grava (regras `admin`), porque o mesmo link guarda
  clientes reais; quem não é dono vê na página Clientes um aviso e nada mais;
- **em localhost**, é o armazenamento do navegador, com as duas telas no mesmo computador: o plano de cada cliente
  fica em `nl-db:planos/<id>`.

**Vários clientes.** A página Clientes (`index.html`) abre as telas com `?cliente=<id>`, e o armazém lê e grava os
documentos desse cliente. Sem `?cliente`, a tela volta para a página Clientes. As duas telas levam o cliente adiante
em toda navegação entre elas (`comCliente`). A cópia de trabalho do navegador (`nl-plano`, `nl-proposta`, os
cenários, as páginas vistas) é de um cliente só, guardado em `nl-cliente`: abrir outro cliente começa dela limpa.
Um cliente sem plano começa em branco (`planoVazio`); só o cliente `exemplo` começa com o plano da Ana Ribeiro, que é
gravado ao abrir para a área do cliente ter o que mostrar. "+ Novo cliente" cria um código novo e abre o portal em
branco; o cliente entra na lista quando o primeiro dado é gravado.

**Abrir não grava.** O portal só grava o que o consultor muda (`nuvemUltimo` começa igual ao plano aberto), e nunca
um plano sem nome. O armazém recusa gravar (`nao_lido`) enquanto não leu o documento do cliente no banco: assim, uma
tela que abriu em branco não apaga um plano real. Antes, o portal gravava ao abrir, e isso apagou um plano real duas
vezes. "Não existe" vindo do cache espera o servidor; um documento que existe vale já, porque o servidor não
reentrega um documento igual.

**As telas num quadro da página Clientes.** No link publicado, só a página principal (a página Clientes) recebe o
runtime do Claude e, com ele, o banco. Uma tela aberta por navegação fica sem banco, cai no modo local e abre em
branco. Por isso, no link, "Ver relatório", "Editar relatório" e "+ Novo cliente" abrem a tela num quadro por cima da
página Clientes. O armazém da tela fala com ela por mensagens (`ponte()`, no armazém; `PONTE`, no `index.html`) e
lê, ouve e grava pelo banco dela. A navegação entre as telas continua dentro do quadro, e "← Clientes" fecha o
quadro. Se a tela não responder em 8 s, ela abre na própria aba, como antes. Em localhost (a página Clientes sem
runtime) e na plataforma, as telas abrem por navegação e nada disso acontece.

**Sem localStorage.** No link publicado, o localStorage pode não funcionar. Por isso o armazém guarda o último estado
também na memória da página, e `ler` devolve essa cópia. A área do cliente monta o livro ao abrir, então, quando o
plano chega depois (ou muda a data de nascimento), ela recarrega com ele: pelo localStorage, se ele guardar; senão,
pelo endereço (`#armazem=<base64>`, lido no `loadPlan`), sem entrar em laço.

**Na plataforma.** O desenvolvedor troca o bloco `armazem` inteiro pelo da plataforma, com a mesma interface
(`iniciar`, `ler`, `ouvir`, `gravar`, `nuvem`); o plano vem do cliente escolhido no `/internal` (`window.__MONTAGEM__`)
e volta por `/montagemController`. Sem `?cliente` no endereço, `comCliente` não muda nada, e um cliente sem plano
começa em branco, e não com o exemplo.

Não há troca de arquivos: o consultor grava o plano (sozinho, a cada pausa na edição), o cliente grava a proposta, e
cada tela ouve o que a outra gravou.

## Cenários (portal)

Para decidir o plano, o consultor testa decisões em **cenários**: cópias do plano inteiro, com nome, guardadas neste
navegador em `nl-cenarios` (até três por plano). "+ Testar um cenário", no topo de toda página, duplica o que está aberto
e abre a cópia. Com um cenário aberto, a faixa do topo diz "Editando o cenário …" (e a página ganha um filete aurora no
alto), todas as páginas editam o cenário como se fosse o plano, e o `save()` grava no cenário: o plano em `nl-plano` não
muda e nada vai para o armazém, então o cliente continua vendo o plano. O envio ao armazém confere o cenário na hora de
gravar, porque ele é agendado 1,5 s depois da última mudança.

- **Voltar ao plano** fecha o cenário e reabre o plano.
- **Tornar o plano** (pede um segundo clique) grava o cenário como plano, envia ao cliente e guarda o plano anterior como
  um cenário "Plano até dd/mm hh:mm". É também o desfazer: tornar esse cenário o plano devolve tudo como estava.
- **Apresentar este cenário**: com um cenário aberto, o botão de apresentar leva o cenário à área do cliente só naquela
  apresentação (pelo endereço), para a conversa "e se".
- As propostas do cliente se respondem no plano: com um cenário aberto, a página Propostas pede para voltar ao plano.
- Trocar de cliente ("+ Novo cliente", "ver exemplo") apaga os cenários do anterior.

A página **Cenários** (grupo Com o cliente, fora da sequência do "Próximo") põe o plano e os cenários lado a lado:
liberdade financeira, investido na liberdade, renda por mês, objetivos alcançáveis, aportes, capacidade de poupança,
folga e percentual de proteção, com a diferença para o plano em verde (melhor) ou no texto de atenção (pior). Embaixo,
as trajetórias do patrimônio (o que a família tem, menos o que deve, ano a ano), sobrepostas, com um ponto na liberdade
de cada uma; o plano em marinho, os cenários tracejados nas cores do ponto. Os números saem de `metricasDe`, que roda a
mesma simulação das páginas com o outro plano e devolve o plano aberto como estava.

O **placar do topo** (capacidade de poupança, aportes, folga, objetivos abaixo da meta, liberdade) fica à vista em todas
as páginas em que se decide o plano (`COM_INDICADORES`); num cenário, cada indicador mostra embaixo o valor do plano.
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
    "dividas": [ {"nome": "Consignado", "saldoDevedor": 20000, "credito": 30000, "parcelas": 48, "inicio": "2025-03", "parcela": 850, "juros": 22,
                   "sistema": "", "iof": "", "seguro": {"modo": "unico", "valor": 900}, "tarifas": 0, "situacao": "em_dia"} ]   // iof vazio: somado ao crédito
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
  alternativas. Consumir o patrimônio até a expectativa de vida põe a mesma renda em todos os períodos (a renda cujos saques
  valem o patrimônio da liberdade) e apaga as mudanças por período. Preservar o patrimônio trava o **saque**, não a renda:
  em todos os períodos o patrimônio paga só o rendimento (o patrimônio depois de contratar as rendas vezes a rentabilidade
  da reserva, arredondado para baixo em R$ 100), e a renda de cada período é esse saque mais as rendas dele. A renda do
  primeiro período vai para o alto da página e cada período em que ela muda ganha a sua (`PRESERVAR`); o patrimônio chega
  à expectativa de vida com o mesmo valor da liberdade. Depois, uma linha por período (um período novo começa quando uma
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
- Numa coluna de mês ou de semana, clicar numa célula de entrada ou saída e arrastar para o lado seleciona uma faixa de
  meses (em laranja suave): o valor digitado entra em cada mês selecionado, também nos meses em que a linha não
  acontecia, e depois da faixa a linha segue como era (um ajuste de uma ocorrência por mês, em `exc`). É o mesmo gesto e
  a mesma regra da janela do fluxo do cliente. Arrastar no cabeçalho, no gráfico, nos grupos ou numa coluna de ano
  continua andando no tempo.
- A linha em branco no fim de cada grupo cria uma linha nova já na data da célula clicada.
- O botão **+** de cada grupo abre o cadastro completo: nome, valor, pontual ou recorrente, frequência
  (semanal, mensal em um ou mais dias, anual em uma ou mais datas), início, até quando, mudanças de valor
  e ajustes de uma ocorrência. "Até quando" pode ser sempre, até uma data, por um número de vezes (ex.: 16 parcelas) ou
  até um objetivo ser realizado. O número de vezes não é um campo novo: vira o último mês (o degrau zero), contando as
  ocorrências da própria linha (dias do mês, datas do ano); com "até uma data", a gaveta mostra quantas vezes dá.
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
- Eixo de valores linear, com marcas redondas (o primeiro passo de `PASSOS_Y` que dá até cinco marcas): a altura é proporcional ao valor. Com dívida, o zero sobe e a dívida desce abaixo dele, na mesma escala.
- A tabela do fluxo embaixo ocupa só as linhas que tem (até seis; com mais, rola), e o gráfico fica com o resto, nunca menos que 62% da altura (`layoutY`, a cada quadro). A linha de hoje termina na última linha da tabela.
- Parado, o plano aparece inteiro; só a reprodução apaga o futuro e o revela. Parado, cada faixa tem o nome e o valor escritos na ponta direita, na cor da série em tom de texto (`rotulosDiretos`), e a legenda do alto fica só com os estados dos objetivos.
- Os marcos dos objetivos com foto mostram a foto num círculo de 32 px, com o anel na cor do status (`objFoto`); sem foto, o ícone de sempre.
- Na coluna da esquerda, embaixo dos botões, o destino da trajetória (`destinoDaTrajetoria`): o mês e a idade da liberdade financeira, quanto haverá investido na data e a renda por mês.
- Cores: financeiro `#2E9E5B`, bens `#3B6FCB`, participações `#D9952A`, movimentações `#7C5CBF`.
- Status: verde `#2E9E5B`, laranja `#FA7A35`, vermelho `#D64545`. O laranja da marca substitui o amarelo,
  que não teria contraste suficiente sobre fundo branco.
- Participações societárias têm valor constante, sem remuneração modelada.
- Desktop-first. Abaixo de 1080 px as grades colapsam, mas não há versão mobile.

## Fora de escopo

Herança, versão mobile e persistência em servidor (no protótipo, os vários clientes ficam no banco do link).
A planilha do fluxo de caixa foi feita para mouse e trackpad; não há gesto de pinça em tela de toque.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Clientes: a lista de planos e a entrada nas duas telas. Só do protótipo (na plataforma, é o `/internal`). |
| `evolucao-patrimonial.html` | Tela do cliente. Contém o motor de simulação, que é a fonte de verdade. |
| `tela-consultor.html` | Portal do consultor. Carrega uma cópia do mesmo motor. |
| `sync-motor.js` | Copia o motor, o armazém e os gráficos compartilhados (o sunburst) de uma tela para a outra. |
| `verificar.js` | Roda a simulação em Node e confere as invariantes. |
| `PENDENCIAS.md` | O que falta fazer e o contexto dos testes com usuários. |
| `marca/` | O ícone da Nord (recortado do logo), em 64 e 256 px. As telas levam o de 64 px embutido. |
| `VARIAVEIS.md` | Inventário das variáveis: onde cada uma nasce, quem a usa e as repetições a resolver. |
| `COLETA.md` | As perguntas do exame de saúde financeira e os campos da coleta de dados da Nord, e a origem de cada variável do plano (exame, coleta, consultor ou calculada). |
