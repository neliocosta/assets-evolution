# Auditoria de UX das duas telas (18/10/2026)

Feita a pedido do dono do produto no branch `claude/friendly-tesla-x2amx4`, com dois objetivos declarados:

1. **O cliente sai impressionado.** Ele diz que, pela primeira vez, enxergou a própria vida e os objetivos com clareza, e
   indica novos clientes.
2. **O consultor preenche com facilidade.** Nunca digita a mesma coisa em dois lugares e consegue ver e simular cenários
   para decidir como o plano daquele cliente deve ser.

## Método e fontes

- **Impeccable `audit`**: contexto carregado (`PRODUCT.md`, `DESIGN.md`), detector determinístico rodado nas duas telas
  (206 achados, 168 deles só avisos de token fora do `DESIGN.md`) e navegação ao vivo em 1440×900 e 1366×768.
- **UX Journey Architect**: heurísticas de Nielsen, carga cognitiva, jornada emocional (regra do pico e do fim) e as
  personas do projeto (`ux/personas/consultora-patricia.md`, `clientes-teste.md` e a cliente Ana do `PENDENCIAS.md`).
- **Mobbin**: o MCP está instalado, mas as buscas voltaram "requires a paid plan". Nenhuma referência externa entrou por
  ele; as referências citadas vêm das revisões anteriores (`revisao-ux-*.md`) e de padrões conhecidos de relatórios de
  private banking e de ferramentas de planejamento (eMoney, RightCapital, MoneyGuidePro).
- Capturas de página inteira de todas as 15 páginas do portal e das 35 da área do cliente, com o exemplo
  (`ux/plano-exemplo.json`, pelo `ux/capturas.cjs` com as listas de páginas atualizadas; o script do repositório ainda
  lista as páginas de setembro).

A revisão não aplicou nada. Os números de linha são do commit `b6a218e`.

## Veredito

A base é boa e é própria: a paleta, o livro em capítulos, os gráficos desenhados no código, o texto que fala com a
família e o portal que diz de onde vem cada número. O detector não encontrou nenhum sinal de produto genérico. O que
falta para o cliente dizer "nunca vi a minha vida com tanta clareza" está concentrado em **quatro lugares**, e o que
falta para o consultor decidir com facilidade é **uma capacidade que ainda não existe**:

1. **A trajetória do patrimônio, a página-clímax, ainda é a mais fraca do livro.** Eixo comprimido, 35% a 40% da tela
   vazia, marcos apagados, legenda longe dos dados. Já apontado em 15/10 e ficou para decisão. É aqui que a clareza e o
   "uau" se decidem.
2. **O livro tem buracos visíveis**: nove capas com o bloco escuro "Aqui vai entrar o vídeo", um vazio de cerca de 700
   px na Gestão de riscos, vizinhos do carrossel cortados ("Probler", "Possív").
3. **O meio do livro assusta antes de explicar.** O diagnóstico abre com sete de oito itens em vermelho e laranja
   ("Inadequado", "Não", "0 de 5"), e a última página antes da despedida termina em "Rever: Intercâmbio do filho e Casa
   de praia". A persona Ana já tinha ficado "animada com o final e confusa no meio"; o meio continua pesado e o fim perdeu
   o pico.
4. **O melhor momento do produto está escondido.** Arrastar o marco e "Simular outros valores" são o que mais
   impressiona (a consultora e a cliente disseram isso), mas não há nenhuma pista de que existem.
5. **O portal não tem cenários.** Há um plano só por cliente, propostas do cliente e "ver como o cliente vê". Para
   comparar "adiar a casa dois anos" com "vender o apartamento de Mogi", o consultor precisa mudar o plano, anotar os
   números de cabeça e desfazer na mão. Não existe desfazer.

Nada disso exige refazer o produto. O item 5 é o único que é uma funcionalidade nova; os outros são CSS, pequenos ajustes
de JS e decisões de conteúdo.

## Pontuação

### Audit Health Score (Impeccable, as duas telas)

| # | Dimensão | Nota | Achado principal |
|---|---|---|---|
| 1 | Acessibilidade | 2 | Barra lateral do portal com 14 textos a 3,9:1 (precisa 4,5:1); rótulos dos grupos a 10 px; rótulos do eixo da trajetória a cerca de 2,5:1; carrossel dos riscos sem foco visível nas bolinhas |
| 2 | Desempenho | 3 | Dois arquivos de 600 KB e 668 KB, gráficos em canvas, nada pesado; entradas animadas por rolagem são leves |
| 3 | Tematização | 2 | Os tokens existem e são bons, mas o código tem 138 cores literais, 24 raios e 18 tamanhos de fonte fora do `DESIGN.md` |
| 4 | Responsivo | 1 | Só desktop, por decisão (`so-desktop`). Em 1366×768, o notebook comum de quem apresenta por vídeo, a trajetória fica ainda menor e o vazio embaixo da tabela, maior |
| 5 | Integridade da implementação | 4 | Sistema coerente e específico deste produto; nenhum padrão de modelo genérico |
| | **Total** | **12/20** | **Aceitável**: trabalho concentrado nas dimensões 1, 3 e no gráfico-assinatura |

### Heurísticas de Nielsen, área do cliente

| # | Heurística | Nota | Achado |
|---|---|---|---|
| 1 | Visibilidade do estado | 3 | Barra de progresso na pílula e sumário com as páginas vistas; falta "capítulo 4 de 10" em texto |
| 2 | Linguagem do mundo real | 3 | Fala com a família; restam "Superavitário", "ITCMD", "p.p.", "PGBL", "VGBL" sem tradução na primeira vez |
| 3 | Controle e liberdade | 2 | Sem desfazer; o carrossel dos riscos obriga a passar 8 slides; a simulação fecha e perde o que foi digitado |
| 4 | Consistência e padrões | 2 | Nove capas iguais; três margens; laranja que ainda aparece onde não é futuro nem ação |
| 5 | Prevenção de erros | 3 | A simulação mostra "no plano: R$ X" ao lado de cada campo |
| 6 | Reconhecimento, não memória | 2 | Marcos apagados e sem foto na trajetória; legenda a 900 px das faixas; ícone de simular minúsculo; arrastar o marco não é descoberto |
| 7 | Flexibilidade e eficiência | 2 | "Pular animação" existe; não há atalhos de página nem "ir ao próximo capítulo" |
| 8 | Estética e minimalismo | 2 | Vazio de 700 px nos riscos; 35% a 40% da tela vazia na trajetória; placeholders de vídeo; "Planejamento de Vida A. R. e M. R." no cabeçalho |
| 9 | Recuperação de erros | n/a | A área do cliente não tem fluxos de erro: só leitura e propostas |
| 10 | Ajuda e documentação | 3 | "Como é calculado" nas páginas certas; a explicação de cada ameaça é boa |
| | **Total** | **22/36** | **Bom na base, fraco onde mais importa** |

### Heurísticas de Nielsen, portal do consultor

| # | Heurística | Nota | Achado |
|---|---|---|---|
| 1 | Visibilidade do estado | 4 | "Gravado às 04:12", "passo 6 de 14", check por passo, "Página completa" |
| 2 | Linguagem do mundo real | 3 | Vocabulário da consultora; "Folga mensal" e "Capacidade de poupança" convivem para coisas próximas |
| 3 | Controle e liberdade | 2 | Sem desfazer (`PENDENCIAS.md` item 7); sem cenários; "limpar a carteira" sem volta |
| 4 | Consistência e padrões | 3 | Mesa da política e da macroalocação no mesmo desenho; carteira e microalocação no mesmo desenho |
| 5 | Prevenção de erros | 3 | Datas em listas, recusa fora do horizonte, valores gravados ao sair do campo |
| 6 | Reconhecimento, não memória | 3 | "do Fluxo de caixa · mudar no Fluxo" em todo dado derivado; os números "4" e "7" da barra lateral não dizem o que contam |
| 7 | Flexibilidade e eficiência | 2 | Colar a planilha da carteira é excelente; faltam cenários, atalhos e um placar fixo |
| 8 | Estética e minimalismo | 2 | "média · detalhada no Fluxo de caixa" repetido em cada linha do Orçamento; 90 caixas de seleção na experiência com investimentos; macroalocação com 2.663 px e 11 classes zeradas abertas |
| 9 | Recuperação de erros | 3 | Linha sem valor continua visível para corrigir; confirmações de apagar não somem |
| 10 | Ajuda e documentação | 3 | Dicas "?" nos campos certos; "Objetivo ou despesa futura?" |
| | **Total** | **28/40** | **Bom; o que falta é capacidade, não acabamento** |

## Jornada emocional do cliente (como está e como deveria ser)

| Momento | Hoje | Alvo |
|---|---|---|
| Propósito | Pico: boas-vindas pelo nome, a frase da planejadora em serifa, os objetivos com foto | Manter |
| Diagnóstico · Hoje e depois | Vale: sete etiquetas vermelhas e laranja de uma vez, "Inadequado", "Não" | Mesma informação, com o "depois" dominando: a coluna da direita em destaque e a esquerda como ponto de partida |
| Gestão financeira | Neutro e claro (rosca, relógio, orçamento) | Manter |
| Tributário | Neutro; muita sigla | Uma frase de tradução na primeira vez de cada sigla |
| Riscos | Vale: 38% em laranja, "3 críticas", carrossel que corta e deixa 700 px vazios | Lista das oito ameaças ordenada do crítico ao protegido, cada uma com o que fazer |
| Objetivos · realização | Pico: foto grande, "daqui a 1 ano e 8 meses · Ana com 37 anos", caixinhas | Manter |
| Política e carteira | Pico visual (Sankey e sunburst) | Manter |
| Trajetória | Deveria ser o clímax; hoje é a página mais fraca | Ver C1 |
| O caminho daqui para frente | Fim: lista de 11 passos, o último é "Rever: Intercâmbio do filho e Casa de praia", depois a despedida | Terminar na liberdade financeira (a idade, o ano, a renda) e no próximo encontro; a lista de passos vem antes |

## Área do cliente: achados por prioridade

### [P0] C1. A trajetória do patrimônio não impressiona

**Onde**: `?fase=evolucao`, canvas em `evolucao-patrimonial.html` (as funções `revealWeek`, `yOf`, `drawStack` e o cálculo
de `chartBot`).

**O que se vê** (1440×900 e 1366×768):

- O eixo de valor é comprimido (`asinh`, joelho em R$ 500 mil). A faixa de R$ 0 a R$ 500 mil ocupa quase metade da
  altura e está vazia; o crescimento de R$ 1,8 mi para R$ 3 mi vira um traço quase reto. A família lê a altura
  literalmente: "quase não cresce".
- Há uma faixa negativa até -R$ 250 mil mesmo com dívidas pequenas, e o "R$ 0" fica em laranja no meio da tela.
- Abaixo da tabela de três linhas, 35% a 40% da altura fica em branco. Em 1366×768 o gráfico tem 260 px de altura útil.
- Os marcos dos objetivos ficam no alto, em cinza claro, sem a foto, e os nomes mal se leem. Os objetivos são o que a
  cliente mais reconheceu ("as bolinhas são os sonhos").
- Os rótulos do eixo ficam a cerca de 2,5:1 de contraste. A legenda fica no canto direito do cabeçalho, a 900 px das
  faixas. "Hoje · 35 anos" encosta na faixa verde.

**Por que importa**: é a página que resume o serviço. Os dois pedidos do dono do produto ("ver a vida com clareza",
"indicar clientes") se decidem aqui.

**O que fazer**:

- Eixo linear, com marcas redondas (R$ 500 mil, R$ 1 mi, R$ 1,5 mi...) e o negativo só quando há dívida relevante.
- A tabela ocupa o que precisa (três linhas), e o gráfico fica com o resto. "Hoje" vira uma pílula na base do eixo.
- Rótulos diretos na ponta de cada faixa ("Investimentos · R$ 2,1 mi"), e a legenda do cabeçalho fica só com os estados
  dos objetivos.
- Os marcos na própria curva: um círculo com a foto do objetivo (as fotos já existem em `fotos/`), o nome embaixo e o
  anel na cor do estado. Ao passar o mouse, o cartão curto (data, necessário, estado) e o cursor de arrastar.
- Parado, o plano aparece inteiro; a reprodução apaga o futuro e revela (a correção já escrita no achado 1 de 15/10).
- Uma frase fixa acima do gráfico, em Sora, que muda com a janela: "Em 2048, com 57 anos, R$ 3,2 milhões e uma renda de
  R$ 25 mil por mês, para sempre." É a frase que o cliente repete para o amigo.

**Comando**: `/impeccable layout` nesta página, depois `/impeccable bolder` só no gráfico.

### [P0] C2. Buracos visíveis no livro

- **Nove capas com o bloco escuro "Aqui vai entrar o vídeo que explica o tema deste capítulo"** (`capa-*`). É um
  placeholder na frente do cliente, nove vezes, e contraria o princípio 4 do produto ("o que falta some"). Enquanto o vídeo
  não existe, a capa mostra os três ou quatro números-resultado das páginas do capítulo ("Renda líquida R$ 15.500 ·
  Para o futuro 18% · Orçamento superavitário") e a frase do capítulo. Com o vídeo, o bloco entra no lugar dos números.
- **Capas iguais**: as nove têm o mesmo molde ("Entenda o tema" à esquerda, "Neste capítulo" à direita). O achado 3 de
  15/10 ficou pendente. A capa do Propósito é a única com cara de abertura. Uma faixa com o número-resultado do capítulo
  resolve as duas coisas de uma vez.
- **Gestão de riscos**: o carrossel corta os vizinhos ("Probler", "Possív", confirmado nas capturas) e deixa cerca de
  700 px em branco abaixo do slide curto, porque todos esticam até o mais alto. A decisão de 07/10 ("sem sobe e desce")
  precisa ser revista: a lista vertical das oito ameaças, ordenada do crítico ao protegido, cada uma recolhida numa linha
  (nome, estado, a barra) e aberta com o detalhe, não tem vazio nem corte e ainda responde "o que resolver primeiro".
  **Comando**: `/impeccable distill` na página de riscos.

### [P1] C3. O meio assusta e o fim perdeu o pico

- **Hoje e depois** (`?fase=hoje-depois`): a coluna "Como vocês estão hoje" chega com sete etiquetas em vermelho e
  laranja, e "1 de 8" em vermelho no título do cartão. A estrutura já está certa (hoje em creme, depois em branco); o
  tom das palavras não: "Inadequado", "Não", "0 de 5". Trocar por "a ajustar", "ainda não", "0 de 5 com caminho", e o
  "1 de 8" de hoje em cinza legenda, deixando o vermelho só para o que é risco de verdade (proteção). A página passa a
  dizer "é daqui para cá", não "vocês estão mal".
- **O caminho daqui para frente** (`?fase=caminho`): a lista de 11 passos termina em "Rever: Intercâmbio do filho e Casa
  de praia" e só depois vem a despedida. Pela regra do pico e do fim, o cliente leva a última coisa que leu. Terminar com
  o cartão da liberdade ("jun/2048 · 57 anos · R$ 25.000 por mês, para sempre") e a data da próxima revisão, e mover a
  lista para antes. O cartão "Objetivos alcançáveis: 1 de 5" no topo também pesa; "1 alcançável, 2 com ajustes, 2 para
  rever" já diz o mesmo com menos vermelho.
- **Jargão residual**: "Superavitário", "ITCMD", "p.p.", "PGBL", "VGBL", "come-cotas". Uma tradução na primeira vez que
  cada um aparece no capítulo ("Superavitário: sobra dinheiro no fim do mês").
  **Comando**: `/impeccable clarify` nas páginas do diagnóstico, tributário e caminho.

### [P1] C4. O "e se" não é descoberto

- Arrastar o marco (o "melhor momento do produto" para a consultora) não tem pista nenhuma: o cursor não muda antes do
  mouse chegar, não há halo nem texto. `PENDENCIAS.md` item 13 já registra.
- "Simular outros valores e propor ao consultor" é um ícone de 16 px no canto do cartão. A janela que ele abre é boa
  (campos à esquerda com "no plano: R$ X", resultado na hora à direita).
- Proposta: na primeira visita à trajetória, uma dica de uma linha junto ao primeiro marco ("Arraste a Casa própria para
  ver o que muda se adiar"), que some ao primeiro arraste. Nos cartões, o ícone vira um botão terciário pequeno "E se…?"
  em pêssego, visível sem mouse. O texto fica curto, mas o cliente vê que pode.
  **Comando**: `/impeccable onboard` na trajetória e nos cartões com simulação.

### [P2] C5. Orientação no livro

- O cabeçalho diz "Planejamento de Vida A. R. e M. R."; o cliente se chama Ana e Marcos. As iniciais parecem um código.
- As setas da pílula têm 28 px e ficam no alto; o rodapé "Próximo" resolve a saída (bom), mas quem quer pular um capítulo
  abre um menu de 50 itens com rolagem interna. Um painel lateral de sumário (abre pela pílula, ocupa a altura toda,
  capítulos com progresso, fecha com Esc) é o padrão de livro digital e cabe no desktop. Fora da trajetória, as teclas
  ← e → podem passar a página; na trajetória continuam com o gráfico.
- "Capítulo 6 de 10" em texto na pílula, além da barra.

### [P2] C6. Acessibilidade e contraste

- Rótulos do eixo da trajetória (`rgba(32,52,76,.45)`): cerca de 2,5:1. Usar o Cinza Legenda.
- As bolinhas do carrossel dos riscos (6 px) não mostram foco e não são alcançáveis com clareza pelo teclado. Some com o
  C2.
- O detector apontou um `box-shadow` colorido (#E06600) sobre fundo escuro (dark-glow) e a Montserrat, que a revisão de
  16/10 deu como retirada, ainda no `@import` (linha 28) e em uso na janela `.card` (linha 811). Trocar por DM Sans e
  tirar do `@import`.

### [P3] C7. Acabamento

- A coluna "Depois do planejamento" aparece como esqueleto cinza por um segundo até a entrada por rolagem disparar. Em
  projetor, parece quebrado por um instante; a entrada pode ser imediata quando a página abre já com a seção à vista.
- 68 cores literais, 14 raios e 11 tamanhos de fonte fora do `DESIGN.md` (advisory do detector). Não são erros visíveis,
  mas são o motivo de "três margens e dez tamanhos de texto" voltarem a cada página nova. `/impeccable extract` e
  `/impeccable polish` no fim.

## Portal do consultor: achados por prioridade

### [P1] K1. Não há cenários, e não há desfazer

**Hoje**: um plano por cliente. Para comparar duas decisões, a consultora altera o plano, lê o placar, anota, e volta na
mão. Como o portal grava sozinho e não tem desfazer (item 7 do `PENDENCIAS.md`), cada "e se" é um risco de perder o
plano bom. A pergunta do dono do produto ("ver e simular cenários com facilidade para decidir o planejamento") não tem
resposta na ferramenta.

**Desenho proposto** (coerente com `variavel-num-lugar-so` e `mudanca-recalcula-tudo`):

- **Um cenário é uma foto nomeada da variável do plano**, o mesmo mecanismo do histórico datado. O cenário "Como está" é
  o plano. "Duplicar como cenário" (no cabeçalho do portal, ao lado de "Gravado às") cria "Adiar a casa 2 anos", e o
  consultor edita em qualquer passo, como sempre. Nada muda na estrutura de dados além de uma lista de fotos.
- **A faixa do alto diz em que cenário se está**, em pêssego quando não é o plano, com "Voltar ao plano" e "Tornar o
  plano". Promover um cenário grava a foto como plano; o anterior vira histórico. Isso também é o desfazer que falta:
  qualquer edição começa num cenário e só vira plano quando se quer.
- **Uma página "Cenários"**, no grupo Com o cliente, antes de Apresentação: a tabela com dois ou três cenários nas colunas
  e, nas linhas, o placar (liberdade aos X anos, patrimônio na liberdade, renda sustentada, objetivos alcançáveis,
  aporte mensal, folga, percentual de proteção), com a diferença para o plano em verde ou atenção, e embaixo as
  trajetórias sobrepostas, cada uma numa linha. É a mesa de decisão.
- **O placar fica fixo em todos os passos do planejamento.** Hoje os cinco chips (capacidade de poupança, aportes,
  folga, objetivos abaixo da meta, liberdade) aparecem no Fluxo, nos Objetivos e na Liberdade, mas não no Orçamento, na
  Política, na Macroalocação nem nos Riscos. O consultor decide olhando para esses números; eles precisam estar sempre à
  vista, e são eles que mudam quando se troca de cenário.
- Na área do cliente, nada muda: o cliente vê o plano. Na reunião, o consultor pode apresentar um cenário ("Apresentar
  este cenário") para a conversa "e se".
  **Comando**: `/impeccable shape cenários` antes de codar, para fechar o placar e a página.

### [P1] K2. Contraste e tamanho na barra lateral e nos rótulos

Achados do detector, confirmados no código:

- Os itens inativos da barra lateral e os textos de apoio usam #848f9d sobre #20344c (3,9:1; 14 ocorrências). Clarear
  para um cinza a 4,5:1 (por exemplo #A3ADBA).
- Os rótulos dos grupos ("Dados do cliente", "Planejamento", "Com o cliente") estão a 10 px (linhas 140, 167, 194).
  Subir para 11 px com o espaçamento do token `label`.
- Um texto corrido a 11 px (tiny-text) e um "kicker" acima do h2 de Propostas.
  **Comando**: `/impeccable typeset` no portal. Esforço baixo, uma hora.

### [P2] K3. Ruído nas páginas de entrada de dados

- **Orçamento**: "média · detalhada no Fluxo de caixa" aparece em cada uma das 20 linhas. É a mesma informação 20 vezes.
  Uma nota só no cabeçalho do cartão ("Os valores são a média dos próximos 12 meses; o mês a mês fica no Fluxo de
  caixa") e, na linha, só o valor.
- **Cliente · Experiência com investimentos**: 15 classes × 3 colunas × 2 pessoas = 90 caixas de seleção. Para a
  consultora, que pergunta ao cliente "com o que você já investiu?", uma linha de etiquetas por pessoa (clica para marcar
  "entende", clica de novo para "já investiu", uma marca separada para "restrição") reduz para duas linhas.
- **Macroalocação**: 2.663 px, com as 11 classes zeradas abertas. A Microalocação já esconde as classes zeradas no
  placar; a mesa pode recolher as zeradas numa linha "+ 11 classes sem alocação".
- **Barra lateral**: os números "4" (Patrimônio) e "7" (Macroalocação) não dizem o que contam. Dica ao passar o mouse ou
  trocar por um ponto laranja ("tem pendência").
- **Apresentação**: o campo "Foto (link)" mostra um `data:image/svg+xml...` cru; o vídeo é um link do YouTube cru. Um
  seletor de arquivo com a miniatura e um campo de vídeo com a prévia, como o cliente vai ver.
  **Comando**: `/impeccable distill` nas páginas Cliente, Orçamento e Macroalocação.

### [P2] K4. Duas ações parecidas na barra lateral

"Apresentar ao cliente" (laranja) e "Ver como o cliente vê" (link) ficam juntas, e a diferença (apresentar esconde as
ferramentas de proposta) só é explicada na página Apresentação. Uma dica de uma linha sob cada uma, ou uma ação só com
duas opções ao clicar.

### [P3] K5. Manutenção

- `ux/plano-exemplo.json` não tem a carteira: as capturas e os testes de persona mostram a Macroalocação vazia, diferente
  do exemplo que o portal carrega. Atualizar a partir do "Ver exemplo".
- `ux/capturas.cjs` lista as páginas de setembro; faltam orçamento, carteira, política, macro, micro e os capítulos
  novos do cliente. As listas desta auditoria estão prontas para copiar.
- A Premissas é uma página de quatro campos. Pode virar um bloco recolhido no fim da Política de investimentos, que é
  onde o consultor pensa em rentabilidade.

## O que preservar

- **O livro.** Capa, resumo e páginas, com rodapé "Próximo" e sumário que marca as vistas. É o esqueleto certo.
- **Propósito**: boas-vindas pelo nome, a frase em serifa, os objetivos com foto. É o melhor começo possível.
- **Como realizar cada objetivo**: a foto grande, "daqui a 1 ano e 8 meses · Ana com 37 anos", a estratégia em texto
  corrido, as caixinhas. É o cartão que a consultora elogiou, agora em página.
- **Sankey da política e sunburst da carteira**, com a animação de abertura. São os momentos em que o cliente "vê o
  dinheiro ir para o lugar".
- **No portal**: "do Fluxo de caixa · mudar no Fluxo" em todo dado derivado (o princípio de uma variável só está bem
  aplicado), colar a planilha da carteira, a mesa de distribuição com os sliders finos, "passo X de 14" e "Gravado às".
- **A janela de simular** do cliente: campos com "no plano: R$ X", resultado na hora, "Enviar ao consultor".

## Plano de ajustes em três ondas

**Onda 1 — o que o cliente vê na próxima reunião** (1 a 2 dias, quase tudo CSS e JS cirúrgico)

1. C1 Trajetória: eixo linear, tabela compacta, rótulos diretos, marcos com foto, frase-resumo.
2. C2 Capas sem placeholder (números-resultado no lugar) e riscos em lista vertical.
3. C3 Tom do diagnóstico e fim do livro na liberdade.
4. C5 Nome por extenso no cabeçalho; "Capítulo X de Y".
5. K2 Contraste e tamanhos no portal.

**Onda 2 — decidir e descobrir** (3 a 5 dias)

6. K1 Cenários: foto nomeada, faixa do alto, página Cenários, placar fixo. Começar por `/impeccable shape`.
7. C4 Descoberta do "e se": dica no primeiro marco, botão "E se…?" nos cartões.
8. C5 Sumário em painel lateral e teclas de página fora da trajetória.
9. K3 Ruído das páginas de entrada (orçamento, experiência, macro, barra lateral, apresentação).

**Onda 3 — acabamento e sistema** (contínuo)

10. C7/K5 Tokens: `/impeccable extract` para trazer as 138 cores, 24 raios e 18 tamanhos para o `DESIGN.md` ou para a
    escala; limpar Montserrat e o dark-glow; atualizar `plano-exemplo.json` e `capturas.cjs`.
11. `/impeccable polish` nas duas telas, e refazer `/impeccable audit` para ver a nota subir.

## Perguntas para o dono do produto

- O vídeo teórico de cada capítulo vai existir antes do primeiro cliente real? Se não, a capa sem vídeo (com os números)
  vira o padrão, e o vídeo entra quando houver.
- A decisão de 07/10 (riscos em carrossel) pode ser revista para a lista vertical?
- O cenário deve aparecer para o cliente (apresentar um cenário na reunião) ou fica só no portal na primeira versão?
- Quem apresenta por vídeo usa notebook de 1366×768? Se sim, a trajetória precisa ser testada nessa altura antes de
  qualquer outra.

## Aplicado: Onda 1 (18/10/2026)

Feito na mesma sessão, a pedido do dono do produto. Conferido com `node verificar.js` ("Tudo certo"), `node sync-motor.js`
e capturas de 1440×900 e 1366×768 com o plano de exemplo.

| Achado | O que mudou |
|---|---|
| C1 Trajetória | Eixo de valor linear com marcas redondas; a tabela ocupa só as linhas que tem e o gráfico ganha cerca de 146 px em 1440×900; a linha de hoje termina na tabela; parado, o plano aparece inteiro; rótulos diretos na ponta de cada faixa ("Financeiro · R$ 16 mi") e a legenda do alto só com os estados; marcos com a foto do objetivo; o destino da trajetória na coluna da esquerda (mês e idade da liberdade, investido na data, renda por mês) |
| C2 Capas e resumos | Sem vídeo cadastrado, o bloco "Aqui vai entrar o vídeo" some; a capa lista as páginas com o resultado principal de cada uma; o resumo mostra os números lado a lado; o herói do Propósito fica só com o texto |
| C2 Riscos | Lista das oito ameaças da mais urgente à protegida, cada uma recolhida numa linha e aberta com o detalhe; a mais urgente abre sozinha; a teia abre a ameaça clicada. Sem vazio e sem vizinhos cortados |
| C3 Hoje e depois | O placar de hoje em cinza; o vermelho só na proteção; "A ajustar", "Ainda não" e "Concentrada" no lado de hoje (o portal mantém os nomes do motor) |
| C3 Fim do livro | O cartão "Liberdade financeira em jun/2048 · Ana com 57 anos, com R$ 25.000 por mês, para sempre" fecha a página, antes da mensagem do planejador; o cartão do topo virou "Objetivos no plano" |
| C5 | "Planejamento de Vida · Ana e Marcos" no cabeçalho; "Gestão de riscos · capítulo 6 de 10" na pílula |
| K2 Portal | Barra lateral a 5,6:1 (era 3,9:1 nos contadores e 3:1 nos rótulos dos grupos); rótulos dos grupos de 10 px para 11 px |
| Extra | A janela de simulação e o cabeçalho pediam a Montserrat, que não é carregada (caía na fonte do sistema); agora DM Sans. "1 alcançáveis" virou "1 alcançável" |

**Detector depois da onda:** saíram os 14 avisos de contraste e os 3 de texto pequeno do portal, e a Montserrat. Restam
três avisos no portal que não pedem troca: o subtítulo da página já declara DM Sans (o detector roda sem a fonte), o
rótulo acima do título é a regra "Same Door" do `DESIGN.md`, e o aviso de texto de 11 px não indica onde está. Na tela do
cliente resta o brilho laranja sobre fundo escuro, que é da Onda 3.

**Ficou de fora desta onda:** "0 de 5 com caminho" (a linha já se chama "Objetivos com caminho definido"); a coluna
"Depois" do Hoje e depois continua entrando item a item em cerca de 4 s (achado C7); o "Hoje · 35 anos" em laranja
pequeno. Seguem as Ondas 2 e 3.

## Aplicado: Onda 2, cenários (18/10/2026)

Feito na mesma sessão, com o desenho proposto em K1, sem rodada de aprovação antes de codar. Conferido no navegador:
criar, editar, recarregar a página com o cenário aberto, voltar, promover e desfazer a promoção; o plano gravado não muda
enquanto um cenário está aberto. `node verificar.js` termina em "Tudo certo".

| Peça | Como ficou |
|---|---|
| Cenário | Cópia do plano inteiro, com nome, em `nl-cenarios` (até três). Com ele aberto, todas as páginas editam o cenário, e nada vai para o cliente |
| Faixa do topo | "+ Testar um cenário" no plano; "Editando o cenário …", "Voltar ao plano" e "Tornar o plano" num cenário, com um filete aurora no alto da página |
| Tornar o plano | Grava o cenário como plano e guarda o anterior como "Plano até dd/mm hh:mm": é o desfazer que faltava |
| Página Cenários | Plano e cenários lado a lado, oito indicadores com a diferença para o plano, e as trajetórias sobrepostas com o ponto da liberdade |
| Placar | À vista em todas as páginas em que se decide o plano; num cenário, cada indicador mostra o valor do plano embaixo |
| Apresentar | Com um cenário aberto, "Apresentar este cenário" leva o cenário à área do cliente só naquela apresentação |

**Corrigido durante o teste:** o envio ao armazém, agendado 1,5 s depois de gravar o plano, disparava já com o cenário
aberto e mandava o cenário ao cliente. Agora o envio confere o cenário na hora, e sair do plano envia antes o que estava
pendente.

**Em aberto:** no link publicado, os cenários ficam no navegador de quem os criou. As outras peças da Onda 2 (descoberta
do "e se" no cliente, sumário em painel, ruído das páginas de entrada) continuam por fazer.
