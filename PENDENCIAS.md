# Pendências e contexto

Este arquivo existe para que uma nova sessão de trabalho consiga continuar sem depender da conversa
anterior. Leia junto com o `README.md`, que descreve como as duas telas funcionam.

## Como continuar

1. `node verificar.js` — roda a simulação em Node e confere as invariantes. Deve terminar com "Tudo certo".
2. Abra `tela-consultor.html` e `evolucao-patrimonial.html` no navegador. Os arquivos são autocontidos.
3. Escolha um item de **P1** abaixo.

**Última sessão (16/10/2026):** veja `SESSAO-2026-10-16.md`: o orçamento da família virou a bancada do orçamento combinado
(sem o treemap). A anterior (15/10, tarde) está em `SESSAO-2026-10-15.md`.

## Gestão de riscos (em aberto)

A gestão de riscos já existe (fase 1 da jornada do cliente e página "Gestão de riscos" no portal; veja o README).
Resolvidos em 01/10/2026: o seguro de vida e de acidentes pessoais (a conta da calculadora de seguros da Nord, com
os ajustes do usuário: renda que deseja proteger dividida entre os geradores de renda, adulto até 95 anos, criança
até 25, sucessão de 5% a 20%, 0,4% ao mês) e o vetor da natureza do trabalho (o da calculadora de reserva da Nord,
conferido simulando no site). Falta:

1. **Cadastro de bens — resolvido (07/10/2026).** A proteção dos bens lista os bens da página Patrimônio e grava a proteção e
   a apólice no próprio bem (`ENGINE.bensDoRisco`); um plano antigo aproveita a lista `riscos.bens.itens` pelo nome do bem.
   Falta o material de coleta da Nord, com as demais informações de cada bem.
2. **Geradores de renda vindos do cadastro.** Os dependentes já são perguntados na página Cliente (02/10/2026) e só
   lidos no item 8. Os geradores de renda (quem é, a participação na renda, o INSS) continuam no item 7.
3. **Apólices enviadas pelo cliente.** O usuário quer que o cliente, ao responder, possa enviar as apólices atuais
   (vida, acidentes, doenças graves). Hoje a cobertura atual é um valor digitado.
4. **Divisão da renda passiva e do patrimônio por propriedade.** Hoje o consultor informa, por pessoa, o percentual da
   renda passiva e do patrimônio. O ideal, segundo o usuário, é ler a propriedade de cada bem (quem é dono de quanto),
   que também é a base do ITCMD.

O usuário ainda vai avaliar as telas de gestão de riscos e pode pedir ajustes.

## Fase da vida e patrimônio (em aberto)

A página existe (capítulo 4 da área do cliente; cadastro na página Patrimônio e premissas do portal; veja o README).
Em aberto:

1. **Fatores do patrimônio esperado diferentes da calculadora no ar.** A calculadora da Nord
   (liberta.nordinvestimentos.com.br/patrimonioideal), conferida em 02/10/2026 com 16 casos, usa 0 a 9× no Início de
   carreira, 9× a 70× na Consolidação, 70× a 250× na Plenitude e 250× na Liberdade. O usuário pediu os fatores novos
   (0,5× a 18×, 18× a 60×, 60× a 200×, 200×), que são os do protótipo (`ENGINE.FASES_VIDA`). As fases (2/9 e 6/9) e o
   total (bens + financeiro − dívidas) batem com a calculadora; ela não conta participações societárias, o protótipo
   conta.
2. **O saldo devedor não entra na evolução patrimonial.** A parcela já vai para o Fluxo de caixa (02/10/2026), mas o
   gráfico da evolução usa os bens pelo valor de mercado, sem descontar o saldo devedor nem a amortização. No exemplo
   da Ana, a parcela do apartamento começa "ainda não lançada" porque o fluxo antigo do exemplo paga aluguel.
3. **O cliente não propõe nada na página de patrimônio.** Na Gestão de riscos, ele simula e propõe; aqui só vê. Se ele puder corrigir
   valores (do bem, de uma instituição), a proposta é do tipo `campo` (por exemplo `patrimonio.bens.2.mercado`), e o
   total do plano já acompanha (`sincronizaPatrimonio` roda ao aplicar as propostas).
4. **Idade de quem?** A fase usa a idade do titular (`plan.age`) e a idade para parar de trabalhar dele. Num casal, cada
   um tem a sua fase; hoje há uma só.

## Otimização tributária (em aberto)

O capítulo 3 da área do cliente e a página Otimização tributária do portal existem desde 07/10/2026 (veja o README). Foram
feitos sem o usuário por perto, a partir do pedido dele: confira as escolhas abaixo antes de levar a um cliente.

1. **Rendimentos do IR — resolvido (07/10/2026).** Cada renda do Fluxo diz de quem é; os rendimentos tributáveis e o INSS
   de cada pessoa saem do bruto dessas linhas, e o pró-labore e os dividendos dos sócios, das linhas com essas categorias.
   O 13º salário só entra se for uma linha do Fluxo (no exemplo, não há).
2. **IR e pró-labore são contas separadas.** Os dois leem o mesmo Fluxo agora, mas, se o Marcos seguir a recomendação do
   pró-labore, a renda tributável dele no IR cai e a economia das duas páginas não soma exatamente. Decidir se a estratégia
   do IR usa o pró-labore recomendado.
3. **Parâmetros de 2026 a confirmar.** A tabela anual é a mensal × 12 (R$ 2.428,80 isento por mês). O limite do desconto
   simplificado (R$ 17.640) é o da declaração de 2026; a Receita ainda publica o da declaração de 2027. Tudo está em
   `ENGINE.IR`.
4. **Dependentes inteiros com uma pessoa.** Cada estratégia diz quem declara todos os dependentes; não dá para dividir os
   filhos entre os dois. As despesas médicas e de instrução são digitadas por pessoa, e a regra de quem pode deduzir (quem
   pagou, o titular do plano de saúde) fica com o consultor.
5. **Pró-labore simplificado.** IR na fonte mensal sem dependentes (o ajuste anual pode diferir); INSS patronal de 20% (sem
   RAT e terceiros, que não incidem sobre o pró-labore); fator R pela razão do mês (pró-labore ÷ faturamento), e não pelos
   12 meses. A empresa precisa ter lucro para distribuir os dividendos; a página só avisa.
6. **Sucessão simplificada.** O patrimônio inteiro é transmitido, sem meação nem regime de bens; ITCMD com uma alíquota só
   (a reforma torna o imposto progressivo, até 8%); bens pelo valor de mercado. O cliente vê o aviso de que o consultor
   confere com o advogado.
7. **Simulador da previdência.** Compara com VGBL (imposto só sobre o rendimento); o PGBL (imposto sobre o total, com a
   dedução de hoje) não tem conta própria. No fundo comum, o prazo da tabela de 22,5% a 15% conta da entrada (ou da última
   troca), e não aporte a aporte. Come-cotas sempre à alíquota de longo prazo.
8. **O cliente não propõe nada no capítulo 3.** Ele só simula a previdência. Se for propor (por exemplo, o valor a levar
   para a previdência), as propostas seriam do tipo `campo`, como na Gestão de riscos.
9. **Exemplo fictício.** Os números da família da Ana repetem o padrão de um caso real (dependentes e despesas médicas na
   declaração de quem ganha menos; recomendação: dependentes e PGBL de 12% para quem ganha mais), mas não vêm dele. Os
   extratos do caso real não foram guardados em nenhum lugar.

**Link publicado** (para o usuário testar de outra máquina): https://claude.ai/artifact/LRmPxMYFK7TcoUkjYXatLX.
É uma cópia ajustada dos dois HTML: abre as telas na mesma aba (o visualizador bloqueia janelas novas), usa o
Font Awesome publicado junto (o visualizador bloqueia o cdnjs) e tem o banco compartilhado (capacidades `db` e
`user`, regras: `plano` só o dono grava, `propostas` grava quem é Contribuidor). Para republicar, gere a cópia a
partir dos arquivos do repositório com essas três trocas (`node gerar-publicacao.js . <pasta>` faz as três) e publique no
mesmo link, mantendo as capacidades. Versão 43 no ar, com o exemplo completo (vídeos, data do relatório, foto do
planejador, mensagem final, orçamento combinado; o vídeo é o curta aberto Big Buck Bunny), que também é o plano gravado no
banco do link (`plano/atual`). O plano de teste que estava lá ficou em `plano/backup-2026-10-15`.

## Armadilhas deste repositório

- **O motor está duplicado.** O mesmo bloco `<script id="engine">` existe nas duas telas, porque cada uma
  precisa abrir sozinha. Depois de mexer no motor pelo lado do cliente, rode `node sync-motor.js`.
  O `verificar.js` acusa quando os dois estão diferentes.
- **A identidade contábil é sagrada.** Em qualquer período, movimentações = entradas − saídas. Toda mudança
  no fluxo precisa passar por `node verificar.js`. Já foi quebrada duas vezes por engano.
- **O painel de preview do Claude Code carrega os arquivos como `data:`**, o que descarta o `#plano=` da URL,
  bloqueia `confirm()` e bloqueia o seletor de arquivos. Testes de integração ali dão falso negativo.
  Para testar de verdade, abra no navegador ou sirva a pasta por HTTP.
- **Cartões e comparações alinhados.** Depois de mexer na área do cliente, rode `ux/auditar-alinhamento.js` no console
  (as instruções estão no arquivo), em 1366 e em 1100 px. Ele confere as linhas de Hoje × Recomendado, as alturas e as
  bordas dos cartões e os textos cortados.
- **Cuidado ao apagar blocos grandes de JS por script.** Uma vez isso levou junto a função `renderGoals`.
  Prefira âncoras curtas e confira com `grep -c` depois.

---

## Dívidas (em aberto)

Resolvido em 16/10/2026, a partir de um caso real (dois consignados): o motor de dívidas (`ENGINE.contratoDaDivida`:
Price ou SAC, IOF de pessoa física, seguro prestamista único ou mensal, tarifas, CET), o mês da 1ª parcela, a conferência
da taxa e do saldo no cartão, a gaveta "Ver evolução" e a dívida descontada mês a mês na evolução patrimonial (faixa
vermelha e o botão "financeiro e dívidas"). Falta:

1. **Planejamento de dívidas, numa seção própria.** Para os casos em que o plano é sobre as dívidas: todas as dívidas
   juntas, com ferramentas para decidir: portabilidade (o mesmo saldo a outra taxa), amortização extra (reduzir prazo ou
   parcela), qual quitar primeiro e o efeito de cada escolha no fluxo e na evolução patrimonial. Usa o mesmo motor.
2. **Dívida na tela do cliente.** O detalhe da dívida na página "Fase da vida e patrimônio" ainda mostra só os campos;
   falta mostrar o CET e a evolução para o cliente, se o consultor quiser.

## Voltar à edição — resolvido (16/10/2026)

Pedido antigo do usuário: na apresentação e em "Ver como o cliente vê", o consultor tem "← Voltar à edição" no cabeçalho,
que leva à página correspondente do portal (veja o README, "Quem vê o quê"). Testado indo ao portal na mesma aba; a volta
para a aba do portal que abriu a apresentação (que fica à frente, e a apresentação fecha) não deu para testar no
navegador de testes, que abre tudo na mesma aba: conferir no Chrome.

## Política de investimentos — feito (17/10/2026)

Pedido do usuário: um capítulo para dizer ao cliente para onde vai cada real do patrimônio de hoje e da sobra do orçamento
(compromissos, reserva, cada objetivo e liberdade financeira), com um capricho de UX para o consultor distribuir arrastando,
e um Sankey animado para o cliente. Decisões dele: no portal, é o primeiro passo do Planejamento (antes da Gestão de
riscos), mesmo com os objetivos cadastrados depois, no passo 7 (confirmado por ele); no cliente, vem depois de Objetivos. A reserva fica separada dos objetivos, mas conta na liberdade. Os compromissos
são a lista da coleta e ficam separados até a data. A liberdade fica sempre com o restante. O planejamento mensal ou anual
é escolhido na página Cliente. Horizontes: curtíssimo (abaixo de 6 meses), curto (6 a 24), médio (24 a 60), longo (60 a 120)
e longuíssimo (mais de 120). O FGTS e a previdência (aberta e fechada) entram no patrimônio; o FGTS e a fechada sem liquidez.
O Sankey trata só do patrimônio e da sobra de hoje; as vendas futuras ficam na evolução patrimonial.
Revisão do usuário: a barra arrastável ficava ilegível com valores muito diferentes (R$ 15 mil ao lado de R$ 600 mil). Agora
cada valor tem o seu controle deslizante na tabela, em escala não linear (a raiz), e a liberdade fica com a diferença; as
barras ficaram só nos cartões do alto, em escala real, para ver a soma. No cliente, ele pediu o Sankey se dividindo em
movimento: o bloco aparece, se desfaz nas cores das caixinhas e cada fatia escorre até a sua. Depois, pediu que o segundo
Sankey saia da renda líquida da família, com o padrão de vida separado sem destaque, e que os compromissos ficassem à vista:
agora se cadastram na tabela das caixinhas, logo abaixo da linha deles (`politicaDeInvestimentos` devolve `renda` e `padrao`).
Por fim, o Sankey da renda ficou em dois níveis: a renda vai para o futuro (em cima) e para o padrão de vida (embaixo, mais
curto); só o futuro se abre nos objetivos e na liberdade, e o movimento segue a mesma ordem.
Revisão do usuário (18/10/2026): a página do portal não estava fluida nem organizada. Com as skills de UX e o Impeccable,
foi proposta e aprovada a **mesa de distribuição** (protótipo em `ux/prototipos/politica-mesa.html`, com capturas): uma
tabela só, caixinhas nas linhas e as duas fontes nas colunas, o total e a barra da divisão no cabeçalho de cada coluna, a
liberdade (o restante) no rodapé com o estado da coluna, cada valor digitado com a faixa e a referência curta com o botão
"usar", a estratégia num controle de três posições e o horizonte sob o nome. Saíram os dois cartões do alto e a
coluna de referência em prosa. O motor e as variáveis não mudaram. Dois ajustes dele em seguida: cada compromisso fica
recolhido numa linha só (abre ao clicar, recolhe com OK ou Enter), para a tela não crescer com oito compromissos; e a faixa
sob cada valor voltou a ser um controle deslizante (a mesma escala da raiz de antes, com ímã na referência e o trecho
listrado), para ajustar um pouco com o mouse além de digitar.
Terceiro ajuste dele: ao aumentar o aporte de um objetivo, o aviso "O orçamento não comporta este aporte" abria antes de a
liberdade financeira ter sido consumida (o aviso confere o orçamento mês a mês no Fluxo; a política usa a sobra média ou a
capacidade informada). Agora o aumento sai da liberdade sem aviso, e o aviso só abre quando os aportes passam da sobra da
política (`excessoMensal`, a liberdade zerada); aí o consultor escolhe de onde reduzir (`conferirOrcamento`).
Duas brechas fechadas em seguida: o aporte mensal da reserva de emergência entrou na conferência como um aporte a mais
(`objetivoDoAporte("reserva")` lê e grava `politica.reservaMensal`), e o chip "passa em R$ X por mês · reduzir" do rodapé da
mesa abre a janela do orçamento do mês em que mais falta, contando toda a falta (`abrirEstouroDaMesa`), para quando a sobra
cai depois de os aportes estarem gravados.
Base única (decisão do usuário, 18/10/2026, entre a janela na média ou a mesa mês a mês): a janela do orçamento passou para a
sobra média dos 12 meses (`orcamentoDosAportes`, sobre `ENGINE.politicaDeInvestimentos`), a mesma da mesa; a falta da janela
é o excesso do rodapé, e as reduções de despesa valem a partir de hoje, no equivalente mensal. Saiu o caso "depois da
liberdade" da janela (o status do objetivo e a coluna Entregue/mês já o cobrem). No caminho, os chips do topo (capacidade
de poupança) usavam uma média própria do portal (`valorEm` mês a mês), que diferia da do motor em R$ 172 no exemplo; agora
`media12` lê `ENGINE.orcamentoDoFluxo`. Em aberto: o motor entrega o aporte mês a mês, e o bônus não compensa o mês fraco;
fazer o motor recuperar o atraso tornaria a média a verdade da simulação também.
Em aberto:

1. **Planejamento anual na simulação**: hoje só muda como a política mostra a sobra e os aportes (por ano). O aporte anual
   de verdade (uma vez por ano, no mês do bônus) ainda não existe no motor.
2. **FGTS para a casa**: o FGTS fica na liberdade, sem liquidez; usá-lo na compra do imóvel ainda não é possível.
3. **Importar da coleta** os compromissos, o FGTS, a previdência fechada e a periodicidade.

## Uma venda para vários objetivos — feito (17/10/2026)

Pedido do usuário: o líquido do terreno de São Sebastião (R$ 100 mil) ia R$ 80 mil para a Casa própria e R$ 20 mil para a
Viagem à Europa, mas a venda só financiava um objetivo, e escolher o terreno na viagem tirava a venda inteira da casa (o
necessário da casa disparava e o aviso do orçamento abria). Agora a venda tem uma lista de destinos (`venda.destinos`): cada
um leva o valor informado, vazio leva o que sobra, e juntos nunca passam do líquido. O cartão do objetivo e a gaveta do bem
mostram o que ainda está livre, os outros objetivos que a venda financia e avisam quando o valor pedido passa do que sobra.
Junto, o "Cancelar o aumento" do aviso do orçamento deixou de reabrir o aviso quando o aporte acompanhava o necessário.

## Objetivo financiado com patrimônio — feito (17/10/2026)

Pedido do usuário, com um cliente que vende o apartamento de São Paulo daqui a três anos para comprar um menor em São José
dos Campos. O chip "+ Patrimônio já reservado" virou **"+ Financiar com patrimônio"**, uma seção com três fontes: o
patrimônio financeiro de hoje (o antigo `dedicated`), a venda de um bem e a venda de uma participação. A venda continua
programada só no bem (uma informação num lugar só); o objetivo aponta para ela (hoje, `venda.destinos`). Escolher um bem sem
venda cria a venda na data do objetivo e abre a gaveta do bem (ou da participação, gaveta nova) para programá-la. No mês da
venda, o líquido (ou a parte de cada objetivo) vai para o saldo do objetivo; o que sobra na data volta ao
financeiro. Uma venda depois da data não financia, e o cartão oferece trazer a data do objetivo para o mês da venda. No
motor, os objetivos passaram a ser realizados depois das vendas do mês, para a venda e a compra no mesmo mês funcionarem.
Em aberto: o cliente ainda não propõe essa ligação; a venda de um bem comprado por um objetivo continua fora.

## Capítulo Objetivos (17/10/2026)

Pedido do usuário: antes da evolução patrimonial, um capítulo para apresentar com calma como cada objetivo vai ser
realizado (o modal da evolução passa rápido demais), e a engenharia para acompanhar o plano nas revisões: orçado x
realizado por objetivo, os aportes cumpridos ("20 de 24") e os cobertos com dinheiro de outro objetivo. Feito: o capítulo
(capa, resumo e a página, um objetivo por vez), o orçado e os cortes no motor, a foto do plano (Apresentação) e a conta do
acompanhamento, testada no `verificar.js`. Escolha: os três cortes ficam a um quarto, à metade e a três quartos do prazo.
**O acompanhamento saiu da ferramenta** (decisão do usuário, 17/10/2026): esta ferramenta é para desenhar e apresentar o
plano; revisitar os objetivos (o guardado, o realizado) é da futura área logada do cliente. Saíram a foto do plano (página
Apresentação), a seção "Acompanhamento" do cartão do objetivo no portal e o bloco "O acompanhamento" com os saldos do
extrato na área do cliente. Tudo guardado em `reaproveitar/acompanhamento.js`. Quando a área logada vier: o "hoje" do
motor ainda é fixo em 19/09/2026 (item 20), e o dinheiro remanejado de um objetivo para outro no realizado deveria baixar
o saldo do de origem.

## Eventos menores na evolução patrimonial — feito (17/10/2026)

Pedido do usuário: os rótulos das vendas, quitações e rendas que começam ou terminam ficavam encavalados ("Venda: Terreno"
sobre "Venda: Apartamento") e encostados na curva. Agora ficam numa faixa própria, entre a linha dos objetivos e o alto da
curva (que desceu para abrir o espaço). Os do mesmo ponto viram um só ("2 vendas"); cada rótulo vai no primeiro lugar livre
(linha de cima ou de baixo, à direita ou à esquerda do ponto), sem encostar em outro nem cruzar a linha de um objetivo; sem
lugar, vira o rótulo curto ("Dívida quitada") ou só o ponto. O detalhe continua no tooltip ao passar o mouse.

## Preço do bem e necessário na data — feito (17/10/2026)

Pedido do usuário: na casa própria, os R$ 180 mil do objetivo eram a entrada de um imóvel de R$ 600 mil. Num objetivo que
vira bem, o cartão passou a ter "Valor do objetivo" (o preço, `preco`) e "Necessário na data" (o `amount` de sempre). É
só visual: o cabeçalho mostra "R$ 600.000 (R$ 180.000 na data)" e a tela do cliente mostra o valor do bem e o necessário
na data. Em aberto: o bem ainda entra no patrimônio pela entrada (e cresce com a amortização do financiamento), não pelo
preço com a dívida ao lado.

## Fluxo de caixa do cliente: linha inteira e faixa de meses (17/10/2026)

Feito: na janela do fluxo, desbloqueada, o nome da linha abre a linha inteira num painel do lado (frequência, datas,
início, até quando), e arrastar sobre as células seleciona uma faixa de meses com um valor só (veja o README). Falta:

1. **O mesmo no portal — resolvido (17/10/2026).** A planilha do portal também seleciona uma faixa de meses arrastando
   sobre as células de uma entrada ou saída (veja o README, "Fluxo de caixa"); o nome da linha já abria a gaveta de
   cadastro. Corrigido no mesmo dia, a pedido do usuário: a faixa era feita com degraus, e numa linha que não acontece
   todo mês (o IPTU anual, uma linha vazia) só o primeiro mês mudava. Agora, nas duas telas, o valor entra em cada mês
   da faixa (um ajuste de uma ocorrência por mês) e depois a linha volta ao que era.
2. **Painel da linha mais completo.** Desde 17/10 o painel do cliente segue a gaveta do portal (periodicidade, frequência,
   até quando com número de vezes e até um objetivo). Ficaram de fora: entradas em dois dias com valores diferentes e a
   lista de mudanças de valor (ele só mostra o primeiro valor; as outras ficam como estão).
   Também em 17/10: o cliente não achava como criar uma linha (só clicando numa célula do grupo) nem como excluir uma.
   Agora há o + ao lado de cada grupo e "Excluir esta linha" no painel do nome. O + foi conferido no navegador; o
   Excluir não foi clicado lá (o usuário estava usando o mesmo navegador de testes): conferir. Depois, a pedido do
   usuário, o + passou a criar a linha vazia na hora (sem exigir um valor) e abrir o painel dela, com início e fim.
3. **Faixa numa linha com dois dias no mês.** O ajuste do mês vale para cada ocorrência: numa entrada nos dias 5 e 20,
   o valor da faixa entra duas vezes por mês.

## Calculadora de proposta (em aberto)

Feito em 16/10/2026 na Gestão de riscos: os campos de proposta espalhados pela página saíram. Junto a cada cálculo que o
cliente pode mudar (reserva, plano de saúde, seguro de acidentes e seguro de vida) há um ícone discreto que abre uma
janela com a conta: os campos à esquerda (com o valor do plano embaixo de cada um), o resultado recalculado na hora à
direita, observações opcionais e "Enviar ao consultor". O envio inclui as alterações na proposta e já a envia (vão
junto as que estavam no rascunho). É um componente só (`CALCS` e `abrirCalc`, na seção de propostas). Falta:

1. **Outras telas — resolvido (16/10/2026, com o desenho aprovado pelo usuário).** O card do objetivo, o da Liberdade
   Financeira e a célula do fluxo de caixa (outro valor, só num mês, remover, linha nova) usam a mesma janela, com a
   tabela "Como está" e "Com estes valores" (liberdade, patrimônio nela, renda desejada, objetivos no prazo). O popover
   da célula e o formulário dos cards saíram. Arrastar o marco ou a Liberdade no gráfico continua propondo direto. Fica
   de fora o orçamento combinado, que já é uma bancada inteira com o seu próprio botão de propor.
   **Fluxo de caixa — mudou no mesmo dia, a pedido do usuário:** a célula não abre mais a janela. A tabela abre
   bloqueada; o cadeado antes do título desbloqueia, o cliente edita no lugar da célula (Enter, Tab, Esc), vê as
   colunas mudadas em laranja suave, e "Enviar as N mudanças", no lugar do título da tabela, abre a revisão e manda tudo
   ao consultor. Nada vai para a faixa do alto (o usuário pediu: o gráfico é o protagonista). Pelo mesmo motivo, os
   indicadores do cabeçalho da evolução (Bens e investimentos, Patrimônio líquido e Liberdade financeira) saíram, na
   tela principal e na janela do fluxo. E a edição ficou só na janela do fluxo: embaixo do gráfico, o clique numa célula
   avisa e oferece abrir a janela. A linha
   nova continua numa janela, que inclui sem enviar. O usuário pediu que fique claro que a tabela é uma só (a de baixo
   do gráfico e a da janela própria são a mesma página e os mesmos dados); está no README.
2. **Proposta já enviada.** Enquanto a proposta está com o consultor, a janela só simula (a regra de sempre: cancele o
   envio para propor algo novo). Se o cliente quiser propor em sequência, uma opção é o envio da janela reabrir a
   proposta pendente com as alterações novas (o consultor recomeça a resposta).

# P1 — Bloqueia o uso real

### 1. Vocabulário da tela do cliente
Origem: teste com persona de cliente leiga. Foi a queixa mais longa do relatório.
Palavras que a cliente não entendeu: **aporte**, **custo pontual**, **patrimônio dedicado**,
**perpetuidade**, **consumo até 95**, **participações societárias**, **amortização**,
**cofre genérico**, **ajustáveis**, **alocação do patrimônio financeiro**, **renda vitalícia**,
**perfil conservador/moderado/agressivo**, **requer revisão** (soou como carro na oficina).
Decidir se a tela do cliente passa a usar linguagem do dia a dia enquanto o portal mantém o termo técnico.
Sugestões da própria cliente: "aporte" → "quanto guardar por mês"; "custo pontual" → "quanto custa de uma
vez"; "perpetuidade / consumo até 95" → "o dinheiro nunca acaba / o dinheiro acaba aos 95".

### 2. Rendas passivas — resolvido
As rendas contratadas aparecem como linhas de Entradas no fluxo de caixa, e o cadastro e a tabela da página
Liberdade financeira mostram a data e a idade de início e de fim. Cada renda começa numa data fixa (o INSS)
ou na liberdade financeira. Rendas passivas que não dependem da aposentadoria (aluguel de um imóvel) são
linhas normais de entrada, do tipo passiva.

### 3. Cliente-casal
Só existe um titular, e o campo "Idade hoje" está travado. O caso mais comum da consultora é um casal com
duas rendas e duas idades. Afeta o modelo do plano, a linha do tempo e o cálculo da liberdade financeira.

### 20. "Hoje" fixo em 19/09/2026 (rodada 7)
O motor usa `TODAY = new Date(2026, 8, 19)` e o portal usa `HOJE` com a mesma data. Com a data real de 30/09,
o ano de 2026 conta o adiantamento de 20/09 e as feiras e plantões que já passaram (Camila: Entradas 2026
R$ 54.300 em vez de R$ 52.000; Juliana: plantões R$ 27.000 em vez de R$ 23.400), e o pontual sugere 19/set, que
já passou. Decidir se "hoje" vem do relógio ou de uma data gravada no plano, sem quebrar a identidade contábil
nem o `verificar.js`.

### 21. Idade nos marcos dos objetivos um ano menor (rodada 7) — resolvido com a data de nascimento (14/10/2026)
Com a data de nascimento, a idade de hoje é exata e o aniversário é o de verdade. Continua valendo para um plano antigo, só
com a idade.
Na visão do cliente, todo objetivo em setembro mostra um ano a menos (Viagem set/2028 "34 anos", esperado 35;
Faculdade do Marcos set/2029 "50", esperado 51; Sala da Juliana set/2031 "42", esperado 43). Provavelmente o
aniversário assumido é 19/09 (`BIRTH`) e o marco cai antes dele. A idade de hoje e a da liberdade estão certas.

### 22. Ponto da renda desejada não é removido (rodada 7, a única dúvida bloqueante) — resolvido (14/10/2026)
O gráfico de arrastar saiu da página Liberdade financeira: a renda desejada se digita, no alto e em cada período.
A dica diz "dois cliques removem", mas dois cliques no ponto não o removem (5 tentativas). O arraste pula de
R$ 40.100 para R$ 39.900 e não volta ao valor exato; o ponto fica em `desiredSteps`, e a visão do cliente mostra
"muda com a idade".

---

# P2 — Atrito forte no trabalho do consultor


### 4. Botão "ajustar para o aporte necessário"
Adiar um objetivo derruba o aporte necessário, mas o aporte definido continua onde estava e é preciso
digitar de novo. Um botão por objetivo, e talvez um "encaixar tudo no orçamento", resolvem.

### 5. Aluguel fora da planilha — resolvido
O aluguel é uma linha de despesa fixa com `endObj`: deixa de existir quando o objetivo indicado é realizado.
Qualquer despesa pode usar a mesma regra. Planos antigos com o campo `rent` são migrados.

### 6. Objetivos não estão na planilha — resolvido
Aportes, compras e custos recorrentes dos objetivos aparecem no fluxo de caixa como linhas só de leitura,
com o caminho para a página Objetivos. A página de Fluxo de caixa vem depois da de Objetivos.

### 7. Não existe desfazer
Nem na planilha, nem ao arrastar um marco na tela do cliente, nem ao remover um item. A remoção pede
confirmação em dois cliques, o resto não tem volta. Com a edição direto na célula, isso ficou mais urgente.

### 8. Arrastar o marco no cliente não volta para o portal
A nova data (e a nova idade de parar, ao arrastar a Liberdade Financeira) vive só na sessão do navegador do cliente. Depois da reunião, o consultor precisa repetir a
alteração no portal.

### 9. Depreciação de bens — resolvido para os bens de hoje (14/10/2026)
Os bens da página Patrimônio têm valorização ao ano, que pode ser negativa (a depreciação de um carro). Continua em aberto
para o bem comprado por um objetivo ("vira bem"): ele entra pelo valor e nunca perde valor, e não pode ser vendido no plano.

### 10. Prioridade explícita do objetivo
Com a conferência do orçamento, um aporte novo não estoura mais o orçamento; mas planos antigos, ou uma despesa
nova no Fluxo de caixa, ainda podem deixar objetivos sem aporte, e aí vale a ordem das datas.
Hoje a ordem de alocação do aporte é a ordem das datas. Quando o orçamento não cobre tudo, quem decide o
que fica sem aporte é o calendário, não o consultor.

### 11. Carteira de clientes
O plano vive no `localStorage` de um navegador e viaja por arquivo `.json`. Não existe lista de clientes
nem histórico de versões do plano.

### 23. Aviso "Falta definir quanto guardar" que não some (rodada 7) — resolvido
O aviso conta só os objetivos sem aporte que ainda precisam de aporte (o necessário acima de zero) e diz quais são.

### 24. Diálogo do orçamento (rodada 7)
Não oferece reservar patrimônio livre, que era a saída natural do Marcos (R$ 1,8 mi), e a tabela e o topo atrás
dele já mostram os aportes aplicados ("Folga mensal R$ -13.369") antes da decisão. O rótulo "Guardar só o que
cabe (+R$ 1.568/mês)" não diz se vale desde hoje ou só a partir do mês que estoura.

### 25. Retirada do patrimônio na visão do cliente (rodada 7)
No Marcos, a visão diz "Retirada do patrimônio R$ 32.000/mês", e o portal diz rendas de R$ 14.000 e saque de
R$ 5.221 (renda parcial). Os aluguéis parecem ficar de fora.

### 26. Idade de início das rendas na estratégia (rodada 7)
"INSS da Camila… a partir de 67 anos": a estratégia da liberdade usa a idade do titular (`CURRENT_AGE`) para
todas as rendas, mesmo as do cônjuge (`evolucao-patrimonial.html`, bloco "Estratégia" do card da liberdade).

### 27. Casal e troca de cliente (rodada 7)
"Plano de: Uma pessoa" vem marcado mesmo com a idade do cônjuge preenchida. "+ Novo cliente" apaga o plano sem
lembrar de baixar o `.json`, e o portal não diz como reabrir um plano baixado (ligado ao item 11).

---

# P3 — Refino

### 12. Edição em zoom agregado — resolvido
Numa coluna de trimestre, ano ou maior, o clique aproxima até o mês; só se edita em mês ou semana.
O editor diz quando o valor é de cada ocorrência (por exemplo, "todo mês são 2 ocorrências, dias 5 e 20").

### 13. Descoberta do arraste
A cliente disse que nunca descobriria sozinha que os marcos podem ser arrastados. Falta uma dica visual.

### 14. Tamanho do plano
Ícones enviados e fotos viajam embutidos como data URL. O limite por ícone é 120 KB, mas um plano com
muitos objetivos ilustrados fica pesado para caber numa URL.

### 15. Font Awesome exige internet
O ícone por classe é lido em tempo de execução a partir do CSS do CDN. Sem internet, cai no traço padrão.
O arquivo enviado pelo consultor funciona offline.

### 16. Emojis do fluxo
A cliente leu 💳 como "gastei no cartão" e achou as setas verde e vermelha mais claras. Os emojis foram um
pedido explícito, então fica registrado como ponto a reavaliar, não como erro.

### 17. Área do fluxo em telas baixas
Num notebook, a tabela de fluxo mostra poucas linhas. Considerar um divisor arrastável entre o gráfico e a
tabela.

### 18. Semana do ciclo — resolvido para linhas novas
Linhas com dia ou data caem na semana do calendário que contém a data, e as colunas de semana mostram o
intervalo (20–26/09/26). Continuam no formato antigo, por posição na semana (`week` de 1 a 4), as despesas
do mock que não têm dia definido; ao receber um dia no cadastro, passam para a regra nova.

### 19. Rolagem vertical na planilha do fluxo
A rodinha sobre as células é o zoom, então a página rola pela coluna de nomes ou fora da planilha. Com muitas
linhas abertas, avaliar um cabeçalho fixo.

### 28. Arredondamento do necessário (rodada 7)
O necessário mostrado e o gravado por "usar o necessário" diferem em R$ 1 (786/787, 2.333/2.334); o portal
mostra 99% e a visão do cliente 100% do necessário.

### 29. Sextas de 2027 (rodada 7)
Plantões semanais às sextas somam 52 em 2027, que tem 53 (01/01 e 31/12). Conferir a regra das semanas do ano.

### 30. Textos (rodada 7)
Resolvidos em 02/10/2026: a página Objetivos vazia aponta para a Liberdade financeira; a gaveta de despesa pergunta
"Paga em mais de um dia?"; a linha "Cofre genérico (reserva)" virou "Reserva (patrimônio livre)", nas duas telas. Continuam:
- A explicação do mês de salário a salário (agora em "Como usar a planilha") fala do dia 5 para quem não recebe nele.
- Um objetivo sem nome e sem valor aparece como "Alcançável".
- Price e SAC pedem o valor financiado quando o cliente só sabe a parcela.
- O cartão da casa não oferece encerrar o aluguel. Isso só se faz pela linha do aluguel, com "Até um objetivo
  ser realizado".

### 31. Favicon (rodada 7) — resolvido (14/10/2026)
As duas telas têm o ícone da Nord como favicon, embutido na página (`marca/nord-icone-64.png`).

---

# O que os testes com persona encontraram

Duas sessões de teste foram feitas por agentes encarnando personas, cada uma usando a ferramenta de verdade.
O que está listado acima em P1–P3 são os itens que **continuam abertos**. O resumo abaixo guarda o contexto.

## Consultora (Patrícia, 8 anos de profissão)

Veredito na época: *"não usaria amanhã com cliente real"*, por três motivos, **todos já corrigidos**:
o portal mostrava um patrimônio de R$ 653 mil que ela nunca digitou; um objetivo aparecia como "Alcançável"
mesmo estourando o orçamento do cliente; e a expectativa de vida não mudava nada.

O que ela elogiou e deve ser preservado:

- O parágrafo da liberdade financeira no portal, que explica em números o que ela fala para o cliente.
  Ela conferiu a conta de cabeça e bateu.
- A matemática por objetivo reagindo na hora.
- **Arrastar o marco na tela do cliente**, que ela chamou de melhor momento do produto: é a conversa
  "e se a gente adiar dois anos?" acontecendo ao vivo.
- O card do objetivo com foto, data, custo, perfil, aportes e a estratégia escrita.

## Cliente (Ana, 35 anos, leiga em finanças)

Veredito: *"animada com o final e confusa no meio"*.

O que ela entendeu sozinha: que a linha verde é o dinheiro dela e sobe; que as bolinhas são os sonhos; que
verde, laranja e vermelho dizem se o sonho cabe; e que aos 59 anos poderia parar de trabalhar.

O que a emocionou: a tela chamá-la pelo nome, as fotos dos objetivos, e a janela final da liberdade
financeira terminando com "para sempre".

Onde ela ficou ansiosa, e que vale vigiar em qualquer mudança futura:

- A janela vermelha do intercâmbio do filho, com "34% do necessário". Era o futuro do filho em vermelho, e
  a janela sumiu antes de ela terminar de ler. Hoje o botão de pausa do card (um clique pausa, outro continua)
  segura a contagem; a pausa automática com o mouse em cima foi tirada porque parecia travamento. O impacto
  emocional do vermelho continua.
- A queda do patrimônio a zero no modo de consumo. A faixa que explicava que é intencional saiu com o seletor (14/10/2026):
  o modo é escolha do consultor, que explica ao apresentar.

---

# Decisões tomadas, e por quê

Registradas aqui porque não são óbvias no código:

- **Laranja no lugar de amarelo** no status intermediário: amarelo puro sobre fundo branco não tem
  contraste, e o laranja já é a cor de score médio da identidade visual.
- **O mês vai de salário a salário**, não do dia 1 ao 30. Assim todo mês tem exatamente uma entrada e um
  conjunto de despesas, mesmo quando cai em cinco semanas do calendário.
- **A curva usa média móvel de no mínimo um mês**, e o hover lê a mesma série. Sem isso, a entrada do
  salário numa única semana aparecia como um salto de patrimônio de quase 3%, e o número do hover não
  batia com a curva desenhada.
- **A liberdade financeira não depende da ordem dos objetivos.** Ela acontece quando o patrimônio sustenta
  a renda desejada, descontado o que ainda falta para os objetivos pendentes. Adiar um sonho não empurra a
  aposentadoria junto.
- **Se aos 68 anos o patrimônio não sustentar a renda desejada**, o marco aparece mesmo assim, mas sem
  celebração: o card diz quanto o patrimônio de fato paga por mês.
- **Um objetivo sem recursos não é comemorado.** O card troca "realizado!" por "data desejada do objetivo",
  com selo vermelho e sem confete.
- **Participações societárias têm valor constante.** O crescimento anterior era um chute e foi removido.
- **O status do objetivo vem da simulação, não da fórmula fechada.** A fórmula dá o aporte necessário; a
  simulação diz o que o orçamento realmente entrega, que é o número honesto.
- **Na liberdade financeira a renda do trabalho para.** Antes o salário continuava entrando depois da
  aposentadoria, e o patrimônio em perpetuidade subia para R$ 15 mi aos 90 anos. Agora ele fica estável
  (cerca de R$ 4 mi), e no modo consumo chega perto de zero na expectativa de vida. O fluxo antes da
  liberdade não mudou. Rendas passivas continuam e reduzem o que o patrimônio precisa sustentar.
- **O portal tem uma página por assunto**, na ordem em que o plano é montado: Cliente, Fluxo de caixa,
  Patrimônio e premissas, Objetivos, Liberdade financeira. O fluxo veio para o segundo lugar (pedido do
  consultor): a capacidade de poupança fica logo abaixo dele, e os aportes dos objetivos aparecem no fluxo
  depois de definidos. "Próximo" sempre leva à página seguinte.
- **Rodinha na planilha do fluxo**: Ctrl aproxima, Shift anda no tempo, a rodinha sozinha rola a página
  (como no Miro e no Excalidraw). A visão do cliente segue a mesma regra: a rodinha anda no tempo, Ctrl dá
  zoom e Shift também anda; sobre a tabela do fluxo, a rodinha sozinha rola a tabela. Durante a reprodução,
  "Pular animação" vai direto ao final.
- **As barras de Movimentações usam uma escala só para o período inteiro** (comprimida com asinh, para
  um valor de 1 milhão não achatar os outros), e não a do que está à vista; assim não mudam de tamanho ao andar.
- **O objetivo se planeja pelo gráfico e cresce aos poucos.** Abre com nome, tipo, data, valor e quanto
  guardar; gastos depois (lista de custo fixo, Price e SAC), patrimônio reservado e perfil, e apresentação
  entram pelos botões "+". No gráfico, a linha tracejada muda só a data e a bolinha só o valor. O gráfico usa
  a conta do objetivo sozinho, e o status continua vindo da simulação.
- **Aporte não passa do orçamento.** Aumentar um aporte que faz faltar dinheiro em algum mês abre o orçamento
  daquele mês (entradas, despesas, gastos dos objetivos, sobra e aportes pedidos) e obriga a escolher: reduzir
  despesas ou aportes de outros objetivos a partir daquele mês (um valor em cada item, quantos forem, até cobrir
  a falta), guardar só o que cabe, ou cancelar. A conta é
  a mesma do motor (equivalente mensal) e bate com o que a simulação entrega. Mudanças de despesa no Fluxo de
  caixa ainda não passam por essa conferência.
- **Liberdade financeira: primeiro o cadastro, depois o gráfico.** As rendas se cadastram na própria tabela
  (nome, valor, começo, duração, custo; o resto na gaveta "⋯"), e a programação da renda vem no fim, com valores
  exatos até o real e cores suaves. A renda desejada pode mudar com a idade: dois cliques na linha tracejada criam
  um ponto que arrasta para cima e para baixo (`desiredSteps`); dois cliques no ponto o removem.
- **Como sacar na liberdade é decisão do planejador** (desde 14/10/2026 o plano é sempre o da renda desejada; veja
  "Liberdade financeira refeita", abaixo) (premissa do plano, na página Liberdade financeira; desde 14/10/2026 a
  visão do cliente não tem mais os botões, nem o aviso do consumo, para o topo ocupar menos espaço):
  saques da perpetuidade (o rendimento; o padrão de vida acompanha), consumo até a expectativa de vida, ou
  saques da renda desejada (só o que falta; o patrimônio pode acabar antes ou sobrar).
- **O gráfico do objetivo mostra o que o orçamento entrega**, não só o aporte definido, para concordar com o
  selo: um objetivo com aporte suficiente mas orçamento curto aparecia com 100% no gráfico e "com ajustes".
- **Bem abaixo de 70% do valor na data não é comprado.** Antes a reserva pagava a diferença e o bem entrava
  no patrimônio com o selo "Requer revisão" (a casa de praia do exemplo: R$ 75 mil juntados, R$ 225 mil da
  reserva). Objetivos de consumo continuam sendo gastos, com o selo vermelho.
- **A média da curva não espalha saídas únicas.** Com o zoom aberto a média chegava a 26 semanas para cada
  lado, e a contratação de R$ 1,1 mi da liberdade aparecia como uma queda de R$ 225 mil.
- **Rentabilidade por objetivo**, num controle de 0,35% a 0,65% ao mês ao lado do gráfico; o perfil é o nome
  da faixa mais próxima.
- **Financiamento é calculado por sistema (Price ou SAC), taxa ao ano e prazo**, no lugar do percentual de
  amortização informado à mão.
- **A planilha do fluxo mostra o que a simulação calcula**, não o que foi digitado. Assim a linha de
  Movimentações é sempre entradas menos saídas, e depois da liberdade aparece o ajuste das despesas à renda.
- **A semana é mostrada pelo intervalo de datas**, não por número. "Semana 3" dependia de em que dia o mês
  começava; "20–26/09/26" não deixa dúvida, e cada ocorrência cai na semana que contém a sua data.
- **O INSS do mock tem data fixa em jun/2054**, a mesma data em que ele começava antes (60 meses depois
  da liberdade). Os números não mudaram; agora a data não se move se a liberdade mudar.
- **O valor de uma linha é o de cada ocorrência.** Um salário pago nos dias 5 e 20 é uma linha só, e o
  aumento vira um único degrau.
- **Tela do cliente mais enxuta (01/10/2026).** A jornada saiu da faixa própria e foi para o cabeçalho, ao lado da
  marca; a legenda virou um bloco de duas linhas (patrimônio em cima, status dos objetivos embaixo); o botão "Hoje"
  saiu do gráfico (a tecla Home faz o mesmo) e continua só na janela do fluxo de caixa. Abaixo de 1300 px o
  "Olá, …" some para o cabeçalho caber em duas linhas.
- **Jornada em capítulos (01/10/2026).** Com 20 a 25 páginas previstas, os passos lado a lado não cabiam. O cabeçalho
  mostra só a página atual, com anterior e próxima, e o sumário lista capítulos e páginas. Os capítulos 1 a 4 são um
  esqueleto (5 páginas cada, "em breve"): troque os títulos e o conteúdo em `CAPITULOS` quando as páginas existirem.
- **Gestão de riscos em painel (01/10/2026).** Referências do usuário: dashboards do Dribbble (InTeam, QClay, Virtual
  Sports): um número ou uma marca dominante por cartão, cor só onde informa, detalhe num cartão largo. A teia mostra
  quanto de cada ameaça está resolvido; as oito sanfonas viraram um detalhe único, da ameaça clicada.
- **Carrossel das ameaças (01/10/2026).** Pedido do usuário: o cliente deve passar por todas. Um slide por ameaça
  (essencial no alto, detalhe embaixo), começando pela primeira, com os vizinhos à mostra nas bordas. O status verde
  passou a se chamar "Protegido".
- **Fase da vida e patrimônio (02/10/2026).** Pedido do usuário, com duas telas de referência (curva da vida, cinco
  fases e barras de liquidez ideal, financeiro, bens, dívidas, total, mínimo, esperado e máximo). Entrou como capítulo 4
  (o esqueleto ficou nos capítulos 1 a 3), antes da Gestão de riscos e da Evolução patrimonial, que usam o mesmo
  patrimônio. O detalhe do patrimônio (`plano.patrimonio`) passou a ser a única fonte dos totais do plano: os três
  campos de valor da página Patrimônio viraram listas (instituições, empresas, bens com valor de mercado e saldo
  devedor). O exemplo da Ana usa os dados do usuário (R$ 860 mil no financeiro, R$ 50 mil em participações, R$ 1,21 mi
  em bens com R$ 368 mil de saldo devedor), e os bens da Gestão de riscos foram igualados a eles; com isso a simulação
  de exemplo mudou (antes, R$ 500 mil no financeiro, R$ 150 mil em participações e nenhum bem). O padrão de vida é o
  custo de vida da reserva, o mesmo da liquidez em vezes o padrão. Sem a idade em que começou a trabalhar, a página
  mostra o patrimônio sem a fase. O status protegido, atenção e crítico é só das ameaças: aqui a leitura é em
  palavras ("abaixo do mínimo", "entre o esperado e o máximo").
- **Patrimônio ideal refeito para o cliente (02/10/2026).** O usuário pediu: sem a curva da evolução do patrimônio (só as
  idades de cada fase) e sem copiar o slide, com as referências de UX já usadas na Gestão de riscos (dashboards do
  Dribbble: um número dominante por cartão, cor só onde informa). Ficou: a fase atual e a trilha das cinco fases com as
  idades; três cartões (patrimônio total com a composição, esperado para a idade numa régua mínimo–esperado–máximo,
  dinheiro disponível contra a liquidez ideal); as classes em colunas, com bens e dívidas que abrem o detalhe; e a conta
  do esperado recolhida, com a tabela das fases deste cliente. A régua tem posições fixas (mínimo 20%, esperado 50%,
  máximo 80%), como a régua da calculadora da Nord, para que um total muito acima do máximo não esmague as marcas.
- **Dívidas com detalhe e renda do bem (02/10/2026).** Pedido do usuário: toda dívida tem crédito contratado, parcelas
  contratadas, parcela atual, situação (em dia ou inadimplente) e juros contratados; e um bem pode gerar renda passiva.
  O detalhe vale igual para o financiamento de um bem (aparece quando o saldo devedor é maior que zero) e para as outras
  dívidas (lista nova: pessoal, consignado, cartão). A renda do bem não é um valor digitado de novo: o bem aponta para a
  linha de renda passiva do Fluxo de caixa, que o consultor escolhe ou cadastra dali mesmo, para o valor não ficar em
  dois lugares. Os detalhes da dívida do exemplo (crédito, parcelas, parcela, juros) são ilustrativos.
- **Revisão de UX do portal (02/10/2026).** O usuário achou o portal "poluído e contraintuitivo" e que Patrimônio e
  premissas são coisas de momentos diferentes. O que mudou:
  - Oito passos em três grupos na barra lateral: dados do cliente (Cliente, Fluxo de caixa, Patrimônio), planejamento
    (Gestão de riscos, Objetivos, Liberdade financeira, Premissas) e com o cliente (Apresentação, Propostas).
  - Cada campo foi para a página do seu momento: o tipo de plano (uma pessoa ou casal), a idade em que começou a
    trabalhar e os dependentes vão para Cliente; "abrir o fluxo em meses ou anos" vai para o Fluxo de caixa; o modo de
    saque vai para Liberdade financeira; as rentabilidades ficam sozinhas em Premissas; os vídeos de todas as páginas do
    cliente vão para Apresentação, que mostra também o que cada página vai exibir e o que falta.
  - Página sem moldura: título com o passo, uma frase do que se faz ali e blocos-cartão, um por assunto. As explicações
    longas (casal, planilha, rendas, objetivo ou despesa futura, dependentes, pesos) ficam recolhidas em "?".
  - Os indicadores do topo (capacidade, aportes, folga, liberdade) só aparecem onde ajudam a decidir: Fluxo de caixa,
    Objetivos e Liberdade financeira. "Plano de Ana Ribeiro" saiu do topo: o nome já está na barra lateral.
  - Gestão de riscos: uma ameaça por vez, escolhida em abas com o status de cada uma, com anterior e próxima no pé; os
    pesos ficam recolhidos.
  - A barra lateral tem um botão só ("Apresentar ao cliente") e o "Ver como o cliente vê" como link.
- **Patrimônio ideal em largura total e tudo mais conectado (02/10/2026).** Retorno do usuário: o cartão do esperado
  era pequeno; ele queria comparar o total com o mínimo e o máximo da fase e ver o financeiro contra a liquidez ideal
  pintada ao fundo. O dinheiro disponível passou a dizer só o ideal, o que o cliente tem e se está bom (sem
  percentual, também no portal). A parcela da dívida entra no Fluxo de caixa como a renda do bem já entrava. A página
  Liberdade financeira abre com o que o patrimônio sustenta (perpetuidade e consumo, já com as rendas na fase de menor
  renda), para o consultor decidir a renda desejada com esses números.
- **Cartões sempre alinhados e o patrimônio em escada (02/10/2026).** Regra do usuário, para qualquer página: cartões
  lado a lado em linhas diferentes têm as mesmas larguras (as bordas batem de uma linha para a outra); se não der, um vai
  em cima e o outro embaixo. Os cartões de patrimônio total e de dinheiro disponível usavam colunas diferentes das do topo
  (fase e vídeo) e saíram. A barra da composição parecia mostrar proporção, e o usuário quer mostrar soma: o patrimônio
  total foi para o gráfico do patrimônio ideal, como uma escada (financeiro, mais participações, mais bens, menos
  dívidas, igual ao total), na mesma escala do mínimo, do esperado e do máximo da fase. O dinheiro disponível ficou só na
  faixa da liquidez ideal, que diz quanto falta quando o financeiro está abaixo dela. As colunas de "De onde vem o seu
  patrimônio" também perderam o percentual.
- **Dívida como seta, e não listrada (07/10/2026).** O usuário achou a barra listrada parecida com uma bengala de Natal e
  pediu outra coloração que ainda lembre dívida, sem mudar a estrutura. A dívida é uma barra vermelha que clareia para a
  direita, com a ponta virada para trás (ela volta do topo dos bens até o total). A mesma forma vale para os negativos das
  escadas do capítulo 3.
- **Carrossel de riscos sem sobe e desce (07/10/2026).** Cada ameaça tinha uma altura, e a página subia e descia ao passar
  de uma para outra. Todos os slides têm agora a altura do mais alto: a tela é sempre a mesma, mesmo que seja preciso rolar.
  **Refeito em 16/10/2026:** o cartão fica da altura da ameaça à vista (sem o vazio de até 1.200px), e a página guarda
  embaixo do rodapé a diferença até a mais alta. A altura total não muda, então a tela continua sem pular.
- **Otimização tributária como capítulo 3 (07/10/2026).** Pedido do usuário, que vai rever a ordem depois. Quatro páginas,
  com o roteiro das outras: a economia em destaque ao lado do vídeo, hoje e o recomendado lado a lado na mesma escala, o
  que muda e a conta recolhida. Composições aparecem como escada (soma), como no patrimônio. No portal, um passo novo em
  Planejamento, depois da Liberdade financeira. O patrimônio da sucessão vem da página Patrimônio (a coluna Tipo separa a
  previdência) e os dependentes, da página Cliente, para não digitar de novo. Os dados de exemplo são fictícios.
- **Capas de capítulo e revisão de UX da área do cliente (07/10/2026).** Pedido do usuário: em vez de um vídeo em cada
  página, cada capítulo abre com uma capa e dois vídeos, um teórico mais longo (o mesmo para todos os clientes) e um do caso
  deste cliente. Junto, uma revisão crítica de um especialista de UX simulado (`ux/research/revisao-ux-cliente-2026-10-07.md`)
  levou a: páginas sem vídeo, com o destaque em largura total; "anterior" e "próximo" no fim de toda página; a página nova
  entra suave e começa do alto; barra de progresso por capítulo na pílula do cabeçalho; sumário por capítulo, com as páginas
  vistas marcadas; os capítulos 1 e 2, ainda vazios, só no sumário (fora de "anterior/próximo"); a área abre na capa do
  capítulo 3; o botão "Vídeo" da evolução patrimonial saiu. No portal, a Apresentação cadastra os dois vídeos de cada
  capítulo; um vídeo antigo de página vira o vídeo do caso do capítulo. Em aberto: o vídeo teórico é o mesmo para todos,
  mas ainda fica gravado em cada plano (o ideal é uma biblioteca do escritório), e falta testar a capa com a persona da
  cliente (ela assiste aos dois vídeos ou pula para as páginas?).
- **Um vídeo por página na abertura do capítulo (07/10/2026).** O usuário achou que dois vídeos na mesma página não fazem
  sentido. A capa ficou com o vídeo teórico e a lista das páginas; a página seguinte, "Resumo do seu caso", tem o vídeo do
  consultor sobre o cliente, os principais números (ganhos e indicadores) e o que fazer, página a página; depois vêm as
  páginas de detalhe. No portal, a Apresentação abre a capa ou o resumo de cada capítulo.
- **Estratégia do IR já otimizada (07/10/2026).** Quando nenhuma mudança diminui o imposto de renda, a página não mostra
  hoje e o recomendado iguais lado a lado: diz que a estratégia atual já está otimizada, com o imposto e os lançamentos de
  hoje. O resumo do capítulo diz o mesmo. As outras páginas do capítulo 3 ainda comparam lado a lado mesmo sem ganho (o
  pró-labore, quando o recomendado é o de hoje).
- **Ponta da dívida mais discreta (07/10/2026).** O triângulo vermelho das escadas (dívidas no patrimônio, negativos no
  capítulo 3) ficou com cerca de dois terços do tamanho (no patrimônio, de 16 para 10 px de altura).
- **Percentual de proteção (07/10/2026).** A "nota da família" passou a se chamar percentual de proteção, nas duas telas, e
  vem com quantas ameaças estão totalmente protegidas ("4 de 8 ameaças totalmente protegidas"). O "7 de 8 ameaças avaliadas"
  saiu: na prática o consultor avalia todas. No link publicado, a contagem dava 7 porque o bem "Carro" da página Patrimônio
  estava sem proteção marcada (a lista antiga da gestão de riscos tinha "Carro da família", e o nome não bateu).
- **Topo da evolução patrimonial mais enxuto (14/10/2026).** Pedido do usuário: os botões e o aviso ocupavam quatro linhas.
  "Patrimônio total" e "Apenas financeiro" viraram dois ícones ao lado da pílula do capítulo (o nome aparece ao passar o
  mouse); o seletor perpetuidade, consumo e renda desejada saiu da tela do cliente, que usa o modo do plano; o aviso "nesta
  opção o patrimônio é consumido de propósito" saiu junto. No mesmo dia, o cabeçalho ficou numa linha só: Reproduzir
  (e "Pular animação") e a ajuda foram para o canto de cima do gráfico, o botão que abre o fluxo numa janela virou um ícone
  ao lado do título da tabela, e o nome "Nord Liberta" saiu do canto. No lugar, o ícone da Nord (o anel com a estrela, recortado do logo que o usuário
  enviou; `marca/nord-icone-64.png` e `-256.png`), embutido na página como o favicon. O "Olá, Ana 👋 · 35 anos" virou
  "Planejamento de Vida" e as iniciais de quem é o plano, sem as partículas de, da, do, das, dos ("Nélio de Oliveira Costa"
  vira N. O. C.; um casal, "N. O. C. e J. I. C."). Para as iniciais do cônjuge, o campo "Nome do cônjuge" passou a levar o
  nome completo; as páginas de cada pessoa usam o primeiro nome. Abaixo de 1300 px de largura o texto some, como a saudação.
- **Valorização e venda dos bens (14/10/2026).** Pedido do usuário, ao montar um planejamento: planejar a venda de um bem num
  momento, quando ele vira patrimônio financeiro, com as comissões, os impostos e as outras despesas que levam o valor bruto ao
  líquido; e marcar valorizações (por exemplo, 2% ao ano nos próximos 10 anos) ou uma valorização pontual. Ficou na página
  Patrimônio, no próprio bem (uma informação num lugar só): "Ao longo do tempo", com um minigráfico do valor e um botão para
  cada evento. Escolhas: o valor de venda abre com o projetado e pode ser outro; cada custo é em % do valor de venda ou em
  reais (preencher um limpa o outro); o saldo devedor transferido ao comprador (ou quitado) sai do líquido sozinho, estimado pelo saldo
  devedor de hoje com os juros e as parcelas pagas até a venda (o usuário pensou em não descontar, porque as parcelas já estão
  no fluxo; ficou o desconto porque o comprador paga à família o preço menos o saldo que assume, e as parcelas param na venda); a renda e a parcela do bem terminam na venda; a valorização não passa pelo fluxo de caixa. Em
  aberto: o gráfico ainda não desconta o saldo devedor (item 2 de "Fase da vida e patrimônio"), então, num bem financiado, o
  patrimônio total cai pelo saldo transferido no mês da venda; a venda de um bem comprado por um objetivo; o cliente propor uma venda.
- **Liberdade financeira refeita (14/10/2026).** Primeiro entraram, a pedido do usuário, um gráfico do patrimônio nas três
  formas de sacar, a programação em palavras e um ponto fixo no começo da linha da renda desejada. Ele achou a página toda
  confusa ("os elementos estão todos ali, mas são difíceis de navegar e configurar"), não conseguia travar a renda em 50 mil
  arrastando, e a idade de começar uma renda não dizia de quem era. Combinado com ele, antes de construir:
  - a página lê de cima para baixo: quanto e a partir de quando; o patrimônio dá conta?; a renda em cada período; as rendas
    programadas. Saíram o bloco "O que o patrimônio sustenta", o seletor da forma de sacar, as curvas, a programação em
    palavras e o gráfico de arrastar;
  - a renda desejada e a idade de parar moram só nesta página (saíram da Cliente);
  - "opção A": o plano é sempre o da renda desejada (a renda fica igual, o saque muda); perpetuidade e consumo até a
    expectativa de vida aparecem como alternativas lado a lado, com "Usar". O motor passou a ter a renda desejada como padrão,
    e o portal grava `mode: "desej"`; por isso a visão do cliente do exemplo mudou (antes, perpetuidade);
  - em cada período a renda se digita, e vale daquele período em diante; "Mudar a renda numa idade" abre um período novo;
  - cada renda programada diz de quem é, e a idade de começar é dessa pessoa ("aos 65 anos de Marcos");
  - uma mudança da renda que cai no começo da liberdade, ou antes (num plano antigo sem idade para parar, a data muda com a
    renda), vira a própria renda desejada;
  - no mesmo dia, o usuário decidiu: a idade de parar de trabalhar e a renda desejada são sempre obrigatórias para o plano.
    O exemplo ganhou a idade de parar da Ana, 57 anos: a liberdade passa de jan/2048 (aos 56, quando o patrimônio passava a
    sustentar a renda) para out/2048. Com 56, ela cairia em out/2047, antes de sustentar, e o exemplo mostraria "renda
    parcial". O motor ainda aceita um plano antigo sem a idade.
  - ainda no mesmo dia, a pedido do usuário: sliders para calibrar a renda desejada (no alto e em cada período) e as
    idades; a idade de parar de cada pessoa (num casal, a liberdade começa quando o primeiro para, e o outro continua com a
    renda do trabalho até a idade dele, decisão do usuário); a ordem nova (renda e idades; rendas programadas; renda em cada
    período, com as alternativas como botões no alto; e, no fim, "Simulação patrimonial do plano proposto", com o veredito e
    a curva, sem os cartões). O exemplo: Marcos para aos 62, dois anos depois da Ana.
  - por último no dia: a data de nascimento de cada um no lugar da idade de hoje (mês e ano obrigatórios, o dia opcional);
    `age` e `spouseAge` passaram a ser calculadas. O exemplo: Ana em 12/05/1991 e Marcos em 23/02/1988 (antes, 35 e 38
    anos com aniversário em 19/09); a liberdade do exemplo foi para jun/2048 (Ana faz 57 em maio). E, no último período,
    "Usar a renda restante": a renda que leva o patrimônio a acabar na expectativa de vida.
  - e o capítulo 1, Propósito, combinado com o usuário antes de construir: só a frase e os objetivos (o perfil de relação
    com o dinheiro, devedor, zero a zero ou investidor, vai para outro lugar, a definir); a frase fala direto com o cliente,
    no positivo (felicidade e realização, sem falar de riqueza), com "escutamos" e "propósito"; segurança e liberdade
    financeira sempre na lista; a ordem e a descrição de cada objetivo vêm da coleta. Escolhas minhas: a ordem padrão
    (segurança, objetivos pela data, liberdade por último), "por mês" na descrição da liberdade, as descrições fictícias dos
    objetivos do exemplo e o capítulo com capa e resumo, como os outros.
  - o capítulo 1 refeito como landing page, a pedido do usuário ("algo que pareça uma LP sedutora, que o cliente queira
    voltar e rever várias vezes"; o resumo do caso "não fazia sentido"): uma página só, sem capa nem resumo, com o vídeo ao
    lado das boas-vindas, o propósito em destaque, a jornada dos objetivos com as fotos, o planejador com a data do relatório
    e os contatos (o slide de introdução de hoje), como vamos caminhar juntos e quem somos (o slide institucional, com o
    FPSB e a história do grupo, tirada da apresentação institucional da Nord Liberta). O planejador do exemplo é fictício
    (Carolina Andrade, CFP®). Na rodada seguinte, com referências do usuário (a citação de Jared Spool num balão, em serifada,
    duas cores; o app de citações do Dribbble, com camadas de cor que se movem): a frase foi para o centro, num balão, com
    animação palavra por palavra; o planejador, a trilha e quem somos foram para uma segunda página; a trilha virou uma linha
    do tempo que se preenche até o "agora". Depois: fundo claro, a frase em três parágrafos centralizados; a serifada só na
    frase (os títulos voltaram à fonte do plano) e a frase entrando parágrafo a parágrafo, não mais palavra por palavra.
    A ver com o usuário: o tom dos textos institucionais.
  - a frase do capítulo 1 não animava na máquina do usuário: o Windows estava com "Mostrar animações" desligado, o que vira
    `prefers-reduced-motion: reduce`, e a regra de menos movimento deixava tudo parado. Combinado: com menos movimento, a frase
    aparece só pela opacidade, sem subir nem desfocar. A pedido do usuário, a entrada ficou 3,3 vezes mais lenta (3 s por
    parágrafo, um a cada 2 s) e começa quando a pessoa começa a rolar a página (a frase já aparecia metade na tela ao abrir,
    em 1366×768, e a animação rodava antes de a pessoa chegar nela); se a página não rola, começa logo.
  - o capítulo 2, Diagnóstico, combinado com o usuário antes de construir: a fotografia da família hoje e depois do
    planejamento, no formato que a Nord já usa (presente, futuro e uma seta suave; o usuário recusou a primeira proposta, de
    réguas com os estados). As linhas são as da lista dele: orçamento, reserva, objetivos (em duas linhas: bem definidos e com
    caminho, contando os objetivos pelos degraus sonho, meta definida e meta com caminho), percentual de proteção, perfil de
    risco da carteira, concentração patrimonial e liberdade encaminhada. Decisões do usuário: o futuro é do consultor; a
    concentração mostra ao consultor a divisão entre financeiro, imóveis e participações, e menos de 30% no financeiro é
    preocupante; o perfil devedor, zero a zero ou investidor é a linha do orçamento. Escolhas minhas: o presente é calculado
    onde há conta (orçamento pelo Fluxo de caixa, reserva e proteção pela Gestão de riscos); zero a zero é uma sobra ou falta
    de até 5% das entradas; os degraus dos objetivos do exemplo e o diagnóstico do exemplo; o título "Hoje e depois do
    planejamento".
  - ainda no Diagnóstico, a pedido do usuário: quem é a família no começo da página (cada pessoa com a idade, a profissão e a
    natureza do trabalho; os dependentes com a idade; as instituições onde investe e onde só tem conta) e a experiência com as
    onze classes de ativos (entende, já investiu, tem restrição) com as observações; sem nenhuma marca, a tabela não aparece.
    Decisões do usuário: a natureza do trabalho passou a ser de cada pessoa, na página Cliente, e a reserva usa a de quem tem a
    maior renda do trabalho (num plano antigo, a da reserva vira a do titular); um campo só de observações. No exemplo, Ana é
    analista de marketing (CLT), Marcos é dono da papelaria (empresário), as contas sem investimento são Caixa e Banco do Brasil
    (Itaú e Nubank já estão no financeiro) e as classes são fictícias. A reserva do exemplo não mudou (a Ana ganha mais).
  - os capítulos perderam o número, a pedido do usuário: nem todo cliente terá todos os capítulos. Ficou só o título no
    cabeçalho, no sumário, nas capas e no portal; o Diagnóstico junta a família e o hoje e depois numa página só ("A família
    hoje e depois do planejamento").
  - o hoje e depois ganhou etiquetas coloridas e uma entrada em cascata. O usuário trouxe como referência um slider de antes
    e depois (Dribbble); no esboço, desistiu de arrastar ("sem que a pessoa tenha que ativamente clicar e arrastar") e gostou
    da transformação linha a linha, mas pediu que o antes continuasse visível. Ficou: o presente sempre à vista; o futuro entra
    em cascata quando o quadro aparece, com uma luz laranja passando por cada linha; etiquetas verde, laranja ou vermelha pelo
    estado; e o placar "em dia" de cada coluna. Escolha minha, aceita pelo usuário: proteção em dia a partir de 80% e em
    atenção a partir de 50%.
  - o hoje e depois foi para uma página própria (o Diagnóstico ficou com "Quem é a família" e "Hoje e depois do
    planejamento"), no estilo do rascunho que o usuário preferiu à versão de colunas: dois cartões lado a lado, cada linha num
    cartãozinho com a etiqueta à direita e o placar grande no alto, o hoje apagado e sempre à vista, o depois entrando em cascata.
  - "Quem é a família" por pessoa, a pedido do usuário: cada cartão traz as instituições da pessoa (onde investe e onde só
    tem conta), e uma conta ou um investimento conjunto aparece nas duas, com "(conjunta)" (o usuário não quis um cartão à
    parte); os dependentes ficam em "Do casal"; a experiência com investimentos é de cada pessoa, numa tabela só com um grupo
    de colunas por pessoa, na largura da página. Para isso o financeiro ganhou "De quem" (titular, cônjuge; vazio num casal,
    conjunta) e as contas viraram três listas (de cada pessoa e conjuntas). Escolhas minhas: as onze classes sempre aparecem
    (o vazio diz que a pessoa não conhece); no exemplo, Nubank e BTG da Ana, o VGBL do Marcos e o Itaú conjunto.
  - o capítulo Gestão financeira, combinado com o usuário: capa só com o vídeo; renda e custo de vida (mês e ano, a barra com a
    referência de 20% para o futuro, quantas vezes poupou); o tempo como moeda (por pessoa e o combinado da família); e o
    orçamento. Para o orçamento, o usuário partiu da calculadora de orçamento ideal da Nord (50/30/20, uma grade de
    quadradinhos) e do Tetris do material de hoje, e pediu algo melhor. Recusou a grade de 1%: misturava macro e
    microcategorias, uma categoria tirava da outra, o passo de 1% quebrava as despesas e os quadrados pareciam infantis.
    Ficou: primeiro os envelopes (só as macrocategorias, sem uma tirar da outra; o que falta ou sobra aparece como "sem
    destino" ou excesso; dois cliques dão ao envelope o que está sem destino), depois conferir se as despesas cabem, num
    treemap com zoom (clique no envelope, "Outros" para o que fica pequeno demais para ler, Ctrl + roda do mouse). O motor é
    nosso (o Flourish foi conectado, mas os dados dos clientes não devem sair daqui e a lógica dos envelopes não cabe num
    modelo pronto). O consultor grava o orçamento na apresentação; o cliente propõe. Escolhas minhas: as cores (fixas em
    azul-marinho, ajustáveis em laranja, futuro em verde); o "Lazer" do exemplo virou lazer, pet, academia, assinaturas e
    streaming (mesmo total, R$ 1.600) para o "Outros" aparecer; as horas do exemplo (176 da Ana, 220 do Marcos).
  - na primeira versão do orçamento, o usuário achou que não parecia um treemap (espaços grandes entre os blocos, os detalhes
    só no clique), os cantos e as cores infantis, e quis comparar com o 50/30/20. Ficou: os envelopes encostados, com linhas
    finas, cantos retos e cores sóbrias (azul-marinho, bronze, verde); as despesas de hoje aparecem no hover e o clique abre
    na tela toda; uma régua do recomendado acima do palco, na mesma escala, com guias tracejadas e quanto cada envelope está
    acima ou abaixo.
  - Resolvido (15–16/10/2026): o treemap saiu. O usuário não gostava dele e quis "negociar" o orçamento com a família: apontar
    rápido que as fixas ou as ajustáveis passam da referência e quais despesas pesam, e ajustar junto. Ficou a bancada (veja o
    README): a meta de cada grupo e as despesas de onde sai, divididas por igual, com o cadeado para balancear. O usuário
    recusou cortar um percentual igual de todas ("não dá para reduzir o aluguel") e pediu o modo só com os totais, para a
    família que não detalha. O agente de UX (`.claude/agents/ui-ux-designer`) revisou a proposta e refinou o visual: tons
    do meio, o corte em pêssego liso (sem listras), controles finos; o usuário pediu o futuro numa barra laranja só no
    combinado. Grava em `orcamento.combinado` (substitui `orcamento.envelopes`). Protótipo em `ux/prototipos/`.
    Em aberto: (a) gravar os ajustes no Fluxo de caixa, como degraus datados a partir de um mês (recomendado pelo agente),
    para a trajetória e os objetivos se recalcularem; hoje o combinado não muda o Fluxo; (b) "os sonhos" somam só os
    aportes necessários dos objetivos (a liberdade não entra) e a soma vale até o prazo do primeiro objetivo; falta o
    usuário confirmar; (c) a família sem detalhe: hoje o modo só com os totais aparece quando o grupo tem menos de duas
    despesas no Fluxo; quando o detalhe chegar da coleta, as linhas de total devem ser substituídas, não somadas.
  - renda e custo de vida: a barra virou um gráfico de rosca com os percentuais, e o mês e o ano, que apareciam juntos (o
    anual pequeno demais), viraram uma alternância Mês | Ano, a pedido do usuário.
    Depois, a rosca passou às cores da identidade (o futuro em laranja, o padrão de vida em azul-marinho claro, a marca da
    referência em azul-marinho), com o futuro saindo do alto no sentido horário, como a marca dos 20%; as barras de horas
    e os valores do futuro do capítulo ficaram em laranja também.
  Resolvido: o perfil de relação com o dinheiro (devedor, zero a zero, investidor) é o status do orçamento do Diagnóstico.
  Resolvido (15/10/2026): o painel do tempo virou o relógio do mês (direção escolhida pelo usuário entre três esboços):
  um anel por pessoa, uma marquinha por hora, as horas do futuro em laranja saindo do alto no sentido horário, a marca
  dos 20% e o valor da hora no centro; o patrimônio aparece em anos de trabalho.
  Em aberto: planos de família tratados separadamente. O usuário explicou que há planejamentos feitos em família (a regra
  acima) e outros em que cada membro é tratado à parte; para esses, seriam precisos dois simuladores de evolução patrimonial,
  com os bens e o patrimônio de cada um.
  Em aberto: o veredito usa "dura até a expectativa de vida", mas o selo "renda parcial" do topo do portal e o aviso
  "Requer revisão" da visão do cliente ainda usam o critério da perpetuidade (o rendimento cobre a maior falta); com a renda
  desejada como plano, o critério deveria ser durar até a expectativa de vida.
- **Crítica da área do cliente (15/10/2026).** Com o impeccable: `PRODUCT.md` (o produto) e `DESIGN.md` (o sistema visual,
  "O mapa da travessia") foram criados, e uma crítica das 23 páginas deu 23/40. Corrigido: o cabeçalho da evolução mostra
  "Bens e investimentos" (bruto) e "Patrimônio líquido" (o das páginas de patrimônio); a idade do gráfico sem decimais; a
  saudação (as iniciais eram usadas antes de existir); o texto pequeno em laranja e em cinza claro passou para marinho e
  para o cinza de legenda, o botão principal tem texto marinho e nenhum texto fica abaixo de 11px; no celular, o rodapé
  quebra em duas linhas e as tabelas rolam dentro de si; todas as páginas abrem com o mesmo cabeçalho; e o livro termina
  em "O caminho daqui para frente" (o placar, a liberdade, os objetivos, os próximos passos de cada capítulo e a mensagem
  final do planejador, `mensagemFinal`, na Apresentação). A página de riscos virou "As ameaças ao padrão de vida" e a da
  evolução, "A trajetória do patrimônio". Em aberto:
  1. Reserva x liquidez: o Hoje e depois diz "reserva entre mínima e aceitável" e o resumo do patrimônio, "dinheiro
     disponível acima da liquidez ideal". São medidas diferentes (o resgate no mesmo dia x todo o financeiro); falta o
     usuário decidir como explicar a diferença.
  2. Esboços aprovados para depois: riscos em camadas (a lista das oito ameaças pela urgência no lugar do radar e do
     carrossel), a evolução em resumo no celular. O orçamento por toque ficou obsoleto: o treemap saiu
     (16/10/2026).
  3. O resumo tributário mistura bases de tempo (por ano, uma vez, em 20 anos) e não tem total.
  4. O exemplo fala em "intercâmbio do filho", mas a filha do exemplo é a Luiza.
  5. No celular, os valores ao lado das barras da previdência passam da borda do cartão.
  6. Os subtítulos novos das páginas tributárias e os títulos novos de riscos e da evolução esperam a revisão de tom.
- **Hoje e recomendado sempre na mesma linha (07/10/2026).** O usuário achou o imposto de cada pessoa desalinhado entre
  as duas colunas (uma marca a mais quebrava a linha e empurrava a barra e o total da família) e pediu a tabela de
  lançamentos centralizada. O IR virou uma grade só, pessoa por pessoa (nome e imposto, a barra, as marcas embaixo); no
  pró-labore, os dois lados mostram as mesmas linhas, com R$ 0 quando um imposto some; os números das tabelas ficam
  centralizados. A auditoria (`ux/auditar-alinhamento.js`) passa em todas as páginas.
- **Uma variável num lugar só (07/10/2026).** Pedido do usuário: acompanhar todas as variáveis do planejamento para não
  pedir a mesma informação duas vezes (o exemplo dele: a renda tributável, pedida no Fluxo de caixa e na Otimização
  tributária). Ficou o inventário `VARIAVEIS.md` (onde cada variável nasce, quem a usa e as repetições que faltam) e foram
  ligadas: o nome do cônjuge na página Cliente, usado no IR, nos sócios e nos seguros; "de quem é a renda" no cadastro do
  Fluxo; rendimentos tributáveis e INSS do IR pelo bruto das rendas de cada pessoa; pró-labore e dividendos dos sócios
  pelas linhas do Fluxo; os bens da gestão de riscos pelos do Patrimônio. O exemplo da Ana virou um casal coerente
  (salário da Ana e pró-labore do Marcos no lugar do "salário da família", com o mesmo total; o bônus é PLR, isento no
  ajuste), e a simulação não mudou. As repetições que faltam estão no fim do `VARIAVEIS.md`, em ordem.
- **O portal monta o relatório; a coleta vem depois (07/10/2026).** O usuário explicou que a ferramenta de montagem do
  relatório (o portal) não é a de coleta: os dados são levantados numa reunião com o cliente e devem chegar pré-preenchidos.
  O projeto está sendo construído de trás para frente, da apresentação ao cliente até a coleta. Decisões sobre as variáveis
  repetidas: o plano de saúde soma o prêmio de cada vida, e a vida paga pela empresa ou por terceiros não entra no Fluxo de
  caixa (a despesa do Fluxo fica ligada ao que sai do bolso); despesas médicas e instrução do IR continuam informadas pelo
  consultor (nem tudo é dedutível, e a instrução tem teto); a idade de quem gera renda nos seguros é a da página Cliente; a
  liquidez de D+0 a 1 ano continua digitada até a carteira do cliente chegar; cada bem tem titularidade (titular, cônjuge
  ou casal, com a parte de cada um). O usuário vai reorganizar, numa sessão própria, o fluxo de caixa e as rendas: quais são
  as rendas ativas da família, quais são certas e quais são estimativas, e a participação de cada responsável nas despesas.
