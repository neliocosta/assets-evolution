# Coleta de dados × montagem do relatório: o que fica em cada uma

Avaliação feita em 03/11/2026 sobre a coleta de produção (`liberta.nordinvestimentos.com.br/coletadedados`, 211 campos,
inventário em `COLETA.md`) e a montagem do relatório deste repositório (`tela-consultor.html`, 15 passos). A pergunta: o que o
portal pede hoje ao consultor e deveria ter sido levantado na reunião de coleta, e o que é de fato montagem; e, para cada
informação, qual das duas ferramentas a apresenta melhor.

O critério é um só: **fato da família é coleta; decisão, premissa e cálculo são montagem.** A coleta é a reunião em que o
cliente conta a situação, os objetivos, o cenário. A montagem é onde o consultor, com tudo isso no lugar, decide e desenha.
Entre as duas há a terceira coisa, que não pertence a nenhuma: o que é calculado, e nunca se grava.

## O que fica onde

| | Coleta (fato da família) | Montagem (decisão do consultor) | Calculado (ninguém digita) |
|---|---|---|---|
| **Quem é** | tipo (pessoa ou casal), nomes, nascimentos, estado civil, regime de bens, dependentes (nascimento, até quando dependem), profissão e natureza do trabalho de cada um, horas, experiência com classes de ativos | expectativa de vida (premissa), o "hoje" do plano | idades |
| **Rendas** | cada renda de cada pessoa: fonte, bruto, líquido, dia, certa ou estimada, 13º, bônus, PLR, comissões; rendas passivas e de que ativo vêm; INSS (tipo, idade, valor, invalidez, morte) | degraus futuros (aumentos previstos), ajustes pontuais, rendas da aposentadoria contratadas, o destino dos extras | renda líquida, rendimentos tributáveis, INSS do ano, pró-labore e dividendos de hoje |
| **Despesas** | cada despesa, fixa ou ajustável, com frequência; aluguel; parcelas; prêmios; previdência; % das despesas que cada um custeia; quantas vezes poupou; capacidade de poupança declarada | mudanças futuras nas despesas, o orçamento combinado com o cliente, o cenário de cortes | custo de vida, sobra, padrão de vida, status do orçamento |
| **Patrimônio** | cada ativo (instituição, de quem é, classe, vencimento, valor), previdências, FGTS, bens (valor, titularidade, contrato do financiamento, renda que gera, intenção de vender), dívidas uma a uma, participações (empresa, regime, faturamento, pró-labore) | valorização de cada bem (premissa), custos e destino de uma venda, adiantamentos, liquidez ideal, créditos futuros, classe conferida de cada ativo | financeiro por instituição, patrimônio total, saldo e CET de cada dívida, líquido de cada venda, concentração |
| **Proteção** | cada apólice: seguradora, bem, coberturas (RCV-F, RC familiar, RC profissional), prêmio, renovação; vida e acidentes de cada pessoa; plano de saúde com as vidas, prêmios e quem paga | avaliação de cada ameaça, cobertura ideal de terceiros, hospitais e alternativa de saúde, % do patrimônio e da renda passiva de cada gerador, pesos | reserva mínima/aceitável/ideal, nota de proteção, seguro necessário de vida e invalidez |
| **Objetivos** | nome, categoria, por que importa, data, valor, custo total, como pretende comprar, custo depois, o que já separa e já aporta, bem que entra, prioridade (a ordem); compromissos com data | perfil e rentabilidade de cada caixinha, aporte definido, quando começa, estratégia, foto, o detalhe do financiamento ou consórcio, ligado ou não, alocação | aporte necessário, curva, cortes, trilha, faltas, folga |
| **Liberdade** | renda desejada, idade em que cada um para de trabalhar | mudanças da renda desejada ao longo do tempo, rendas contratadas, premissas de rentabilidade | patrimônio na aposentadoria, renda por perpetuidade e consumo, períodos |
| **Tributário** | regime atual, despesas médicas e de instrução da última declaração, contribuição PGBL, empresas (regime, faturamento) | o que é dedutível, a estratégia recomendada, pró-labore recomendado, ITCMD e custos, simulador da previdência | imposto em cada modelo, economia |
| **Carteira** | a carteira de hoje (ativo a ativo) | modelo, ideal, recomendada, justificativa, o que fazer com cada ativo, os novos | diferenças, mínimos das caixinhas, liquidez diária |
| **Apresentação** | — | capítulos fora, vídeos do caso, mensagem final, data, diagnóstico futuro, cenários, resposta às propostas | diagnóstico de hoje |

## A decisão: a coleta é o portal num modo próprio

A primeira versão desta avaliação propôs uma tela de coleta separada, com visual próprio. Foi descartada: a montagem já tem
ferramentas revisadas e funcionando para quase tudo o que a coleta pergunta, e duas telas para a mesma variável quebram a
regra "uma variável só". A coleta passou a ser **o próprio portal no modo coleta** (`tela-consultor.html?cliente=<id>&coleta`):

- **uma página longa, como a de produção**: as nove seções da reunião em sequência, na ordem dela (Cliente, Objetivos, Perfil
  e comportamento, Orçamento, Patrimônio, Carteira atual, Aposentadoria, Proteção, Documentos e tarefas). O menu leva a cada
  seção e acompanha a rolagem; a seção que sai da tela ganha o ✓ quando não falta nada nela;
- **o desenho da coleta de produção**: o número do capítulo grande, em pêssego, à esquerda do título; o traço laranja embaixo
  do título e a linha que separa a introdução; o ícone laranja ao lado do título de cada bloco (o mesmo da seção no menu). Os
  cartões, campos, dicas e listas são os do portal;
- **a gravação**: cada mudança grava na hora neste navegador e no armazém 1,5 s depois (como o rascunho de produção); na
  coleta, a cada minuto grava de novo e mostra "Gravado às hh:mm", para nada se perder se a conexão cair no meio da reunião;
- **as anotações numa janela flutuante** no canto inferior direito, por cima da página, aberta ou fechada como o consultor
  deixou; o botão ganha um ponto laranja quando há anotação;
- cada campo grava direto no caminho do plano. Não existe "plano gerado da coleta": a montagem abre o mesmo documento, com tudo
  no lugar. A regeneração parcial que a primeira versão pedia deixou de ser necessária;
- o que é decisão do consultor some na coleta: o status e a simulação de cada objetivo, a apresentação ao cliente, a liquidez
  ideal, a expectativa de vida, os indicadores do topo e os cenários. O "guardar por mês" de cada objetivo aparece, porque a
  produção pergunta quanto o cliente já separa;
- o que só a coleta pergunta (a categoria e as observações do objetivo, o tipo e as observações do bem, o credor da dívida, o
  detalhe dos dependentes, a certeza da renda) aparece só no modo coleta; a montagem não mostra, mas lê se precisar;
- "Finalizar a coleta" (no rodapé do menu e na última página) grava `coleta.status = finalizada` com a data e abre a montagem.
  Na montagem, o rodapé mostra "Coleta finalizada em dd/mm/aaaa · abrir" e volta à coleta quando preciso;
- na lista de clientes, cada cliente tem o botão **Coleta**, e um cliente novo começa por ela.

## Quem apresenta melhor cada informação

Comparação feita com a coleta de produção aberta (cliente de teste) e o portal lado a lado. "Portal" quer dizer que a
ferramenta da montagem ficou como está e passou a ser a da coleta.

| Informação | Coleta de produção | Montagem (portal) | Fica | Por quê |
|---|---|---|---|---|
| Quem é a família | dados pessoais de uma pessoa; o cônjuge só como dependente | "Uma pessoa" ou "um casal", nomes, nascimento com o dia opcional, idade calculada | **portal** + estado civil, regime de bens e gênero da produção | o casal é pessoa do plano no portal; a produção não tem o cônjuge |
| Trabalho | natureza da renda principal e uma lista de rendas ativas | cada pessoa no seu bloco: profissão, natureza e horas, várias rendas ativas | **portal** | a natureza alimenta a reserva e as horas, o valor da hora; separa por pessoa |
| Dependentes | lista com relação, idade, tipo e custo | "Alguém depende?" Sim/Não e a tabela com nascimento e até que idade | **portal** | já tem o "não tem" explícito e a data de nascimento, que o plano precisa |
| Experiência com investimentos | lista de linhas classe a classe | tabela de classes × entende, investiu, restrição, por pessoa | **portal** | uma olhada mostra tudo; a lista da produção pede uma linha por classe |
| Objetivos | formulário longo por objetivo, com perguntas Sim/Não que revelam campos | cartão que abre: nome, tipo, data, valor; "+ Gasto depois de realizado"; "+ Financiar com patrimônio"; compra financiada ou por consórcio | **portal**, sem o aporte, o status e a apresentação | os "+" fazem o papel das perguntas Sim/Não sem esconder o que já foi preenchido |
| Orçamento | valor do custo de vida, uma lista de despesas | rendas e despesas fixas e ajustáveis por mês, com os totais e as referências 50/30/20 | **portal** + o bloco "O que o cliente diz" | cada linha já é uma linha do Fluxo; o declarado fica ao lado para comparar |
| Reserva de emergência | quanto do financeiro é reserva, se guarda para aumentar | só na Gestão de riscos | **campo da Gestão de riscos**, mostrado no Patrimônio | mesma variável (`riscos.reserva.atual`), pedida onde o dinheiro está |
| Patrimônio: bens e dívidas | lista de bens com quitado/financiado e lista de dívidas | bens com financiamento ou consórcio, conferência de saldo e CET, parcela ligada ao Fluxo, renda do aluguel, venda | **portal** | o portal faz a conta do contrato; a produção só guarda números soltos |
| Ativos financeiros | formulário por ativo, com campos que mudam pelo tipo | carteira por conta ou por classe, colada da planilha, com classe, subclasse, vencimento, PGBL/VGBL | **portal** | colar o extrato é muito mais rápido que preencher ativo a ativo |
| Previdência | três seções (pública, fechada, aberta) | INSS na Liberdade; fundo de pensão e FGTS no Patrimônio, com "Configurar…"; PGBL/VGBL na Carteira | **página Aposentadoria nova**, ligada ao portal | a reunião pergunta tudo de uma vez; os valores vão para os mesmos lugares de antes |
| Seguros de bens | auto e residencial separados, com "bem segurado" em texto | proteção e apólice gravadas no próprio bem | **portal**, na página Proteção nova | o bem é o da lista; não se digita o nome de novo |
| Vida, acidentes, INSS por invalidez e morte | listas de apólices | geradores de renda da Gestão de riscos | **campos da Gestão de riscos**, por pessoa, na página Proteção | o que o cálculo do seguro usa; o resto da apólice cabe na observação |
| Plano de saúde | tipo, operadora e lista de vidas | vidas, idade, prêmio, quem paga, ligação com o Fluxo | **portal** + operadora | a ligação com o Fluxo evita digitar o prêmio duas vezes |
| Perfil, autoavaliação, diagnóstico | seção de perguntas do exame | não existia | **página Perfil e comportamento nova** | dado da reunião que a montagem lê, sem conta |
| Documentos, tarefas, anotações | dropzone por categoria, lista de tarefas, painel de notas | não existia | **página Documentos e tarefas nova** | gestão do atendimento; o envio de arquivos é da plataforma |

### O que a coleta de produção faz melhor e veio para o portal

- **"O cliente não tem"** numa lista vazia: separa o que não foi perguntado do que não existe. Vale para participações, bens,
  dívidas, seguro de vida, seguro de acidentes, plano de saúde, responsabilidade civil e tarefas (`coleta.naoTem.<lista>`),
  também na montagem.
- **Finalizar** com status e data, e o rodapé da montagem dizendo quando a coleta foi finalizada.
- **Perguntas do exame conferidas na reunião** (autoavaliação, objetivo claro, acompanha o orçamento, plano para a
  aposentadoria): agora gravadas em `coleta.diagnostico` e `coleta.perfil`.
- **Dados pessoais** que o portal não pedia: estado civil, regime de bens e gênero (a tábua do fundo de pensão usa o gênero).

### Todos os campos de produção estão na coleta nova

Conferido campo a campo com `coleta/esquema.js`, que lista os 279 campos da coleta de produção com o caminho de cada um no
plano: **nenhum ficou sem caminho**. O que entrou na revisão de 04/11/2026:

- **Objetivos:** categoria (as opções da produção), por que importa (o propósito da apresentação), o que o cliente já faz para
  chegar lá e observações; os compromissos (gastos marcados com data), que antes só a Política de investimentos pedia.
- **Orçamento:** a observação de cada despesa e de cada renda; se a renda é certa ou estimada; o dia do recebimento; as
  despesas médicas e de instrução da última declaração.
- **Patrimônio:** o tipo e as observações de cada bem; a parte, o regime e o faturamento de cada empresa; o credor de cada
  dívida; **outros ativos** (obras de arte, joias, um crédito a receber), fora das somas; a reserva ideal; os totais que o
  cliente declara, ao lado do que as listas somam; o valor do aluguel (vira a despesa fixa) e as observações da moradia.
- **Ativos financeiros:** a Carteira atual da montagem, como está (colada do extrato, ativo a ativo). Os campos de produção
  por ativo (emissor, rentabilidade, datas, CNPJ, preço médio) vêm do extrato ou cabem na observação do ativo. Embaixo,
  só na coleta, **quem montou a carteira** (convicções próprias, instituição financeira, casa de análise; o "racional" de
  produção), que não se confunde com o porquê da recomendação da montagem.
- **Aposentadoria:** a idade em que cada um começou a trabalhar; na previdência pública, além da idade e do benefício, a
  invalidez, a pensão por morte, a primeira contribuição, o número e o valor médio e atual das contribuições e as
  observações (as regras do RPPS); o **fundo de pensão** e o FGTS com todo o detalhe (contribuição, contrapartida, tipo,
  regime, fundo, CNPJ, perfil, entrada, vesting, observações) e o link para "como vira renda"; a **previdência aberta** com
  o detalhe de cada plano (contribuição, regime, perfil, início, CNPJ, observações). Um PGBL ou VGBL é o ativo da carteira
  (ou a linha do mercado financeiro, sem carteira); um fundo de pensão é a linha do Patrimônio: o detalhe fica no próprio item.
- **Proteção:** cada bem segurado abre a apólice com as coberturas do tipo dele: no imóvel, incêndio, subtração de bens, RC
  familiar e danos elétricos; no veículo, casco, RCF (danos materiais e corporais), danos morais e APP; em todos, seguradora,
  apólice, prêmio, vigência, mês de renovação, outras coberturas e observações. Vida, acidentes e doenças graves seguem a
  Gestão de riscos (o valor coberto de cada pessoa e a parte da renda da família), mais as apólices, mais ricas que as da
  produção: cada apólice (pessoa, seguradora, número, pagamento mensal, anual ou único) tem várias coberturas (morte, morte
  acidental, IPA, IFPD, ILPD, doenças graves, doença terminal, DIT, DIH, fratura de ossos, cirurgia, DMHO, assistência
  funeral, perda de renda, inclusão de cônjuge e de filhos), cada uma com valor, prêmio, vigência (acompanha a apólice,
  renovável ano a ano, prazo certo, temporário decrescente, vitalícia, dotal), prazo de pagamento, prêmio nivelado ou não,
  resgatável ou não e detalhes. A soma de morte, IPA e doenças graves de cada pessoa é o valor coberto da Gestão de riscos.
  Embaixo, as marcas "não tem seguro de vida" e "não tem seguro de acidentes", uma para cada pergunta Sim/Não de produção. O plano de saúde segue a Gestão de riscos, com os tipos "Pela empresa" e
  "Empresarial" da produção.
- **Cliente:** o e-mail e o telefone; o tipo de dependência, o custo e as observações de cada dependente.
- **Perfil:** a restrição a uma classe de ativo, a classe que não quer ter e quanto de fato separa por mês (calculado).
- **Documentos e tarefas:** o envio de arquivos por categoria (aqui fica o registro; o arquivo vai para a plataforma); a
  observação de cada tarefa; o registro da reunião no HubSpot.

### O que a plataforma de produção continua fazendo (o programador leva junto)

O portal grava sozinho a cada mudança. Na plataforma, continuam valendo os mecanismos que já funcionam na coleta de hoje:

- o rascunho gravado 1,5 s depois de cada mudança, com "Salvando rascunho… / Rascunho salvo / Erro ao salvar rascunho";
- a cópia local em JSON quando a gravação falha (`coleta-<nome>-<AAAAMMDD-HHMMSS>.json`), que o portal já exporta;
- registrar a reunião no HubSpot (`coleta.reuniao.adicionar` e `.dealId`, os `addToReuniao` e `dealId` de hoje) e listar
  os negócios do cliente;
- guardar os arquivos enviados (o portal guarda o registro em `coleta.anexos.arquivos[]` e marca a categoria como entregue);
- a volta para o `/internal` depois de finalizar, se a plataforma preferir isso a abrir a montagem.

## O que a montagem pede hoje e deveria vir da coleta

Em ordem do que mais trava o consultor (as "lacunas" do `COLETA.md`, seção 3, agora com o campo que as resolve):

1. **O cônjuge como pessoa do plano.** A coleta é de uma pessoa; o cônjuge só existe como dependente. A montagem começa por
   "O plano é de: uma pessoa / um casal" e precisa do nome, nascimento, natureza do trabalho, rendas, seguros e INSS dele.
   Campos novos: `planoTipo`, `conjugeNome`, `conjugeDateofbirth`, `conjugeGenero`, `regimeBens`, `conjugeIncomenature`,
   `conjugeStartingWorkingAge`, `conjugeRetiringTargetAge`, `conjugePrevPublica*`, `conjugeFgts`, e "de quem é" (`*_pessoa`,
   `af_titular`, `bem_titular`) em todas as listas.
2. **As rendas da família.** A coleta tem a principal sem bruto e "outras fontes" sem dono. Campos novos: `ra_pessoa`,
   `ra_descricao`, `ra_certeza` (certa ou estimada), `ra_diaRecebimento`; `rp_pessoa`, `rp_certeza`.
3. **A participação de cada um nas despesas**, de onde sai a % da renda de cada gerador nos seguros (hoje uma decisão
   subjetiva do consultor). Campo novo: `pctDespesasTitular`.
4. **As despesas linha a linha.** O Orçamento (passo 2 da montagem) é todo digitado pelo consultor; a coleta só tem o total.
   Lista nova: `despList` (nome, fixa/ajustável, valor, frequência). Sem ela, o portal ainda recebe o total declarado numa
   linha só e os itens soltos que a coleta já pega (aluguel, parcelas, prêmios, previdência, custo dos dependentes).
5. **As empresas**: regime tributário, faturamento, pró-labore e lucros, para a Otimização tributária (sócios). Lista nova:
   `participacoesList`. "Outros ativos" fica como está, mas uma empresa vai para esta lista.
6. **O contrato de cada financiamento e cada dívida**: crédito, parcelas, 1ª parcela, juros, sistema, situação. Hoje a coleta
   tem só o total das dívidas e, nos bens, saldo e parcela. Campos novos em `bensList` (`bem_credito`, `bem_parcelasContratadas`,
   `bem_primeiraParcela`, `bem_juros`, `bem_sistema`, `bem_situacao`) e a lista `dividasList`. Com eles o portal calcula CET,
   saldo pelo contrato e quitação sozinho.
7. **O plano de saúde**: as vidas, o prêmio de cada uma e quem paga (a empresa ou a família). Lista nova: `saudeVidasList`.
8. **A RC profissional e o INSS por invalidez e morte**, que os seguros descontam. Campos novos: `seg_rcprof_*`,
   `prevPublicaInvalidez`, `prevPublicaMorte` (e os do cônjuge).
9. **A intenção de vender um bem** e **como pretende comprar** o bem de um objetivo (à vista, financiado, consórcio): a
   montagem pergunta ao consultor, mas é o cliente quem sabe. Campos novos: `bem_pensaVender`, `bem_vendaQuando`,
   `bem_vendaValor`, `part_pensaVender`, `obj_comoComprar`.
10. **Os dependentes com data de nascimento e até que idade dependem** (o seguro de vida vai até lá): `dep_nascimento`,
    `dep_ateIdade`. A idade continua para quem não souber a data.
11. **A experiência com classes de ativos, estruturada** (entende, já investiu, tem restrição, por pessoa e classe), que a
    montagem mostra em tabela e a coleta tem só em texto. Lista nova: `expList`, mais `expObs`.
12. **As despesas médicas e de instrução da última declaração** e o PGBL que já contribui: fatos que abrem o IR de hoje.
    Campos novos: `irDespesasMedicas`, `irInstrucao` (o consultor continua decidindo o que é dedutível).

Ao todo, **78 campos novos** (5 listas novas e campos soltos em 9 seções), marcados `novo` no `coleta/esquema.js` e na tabela
`coleta/VARIAVEIS-BANCO.md`. Nenhum campo da coleta de produção foi removido; dois foram reagrupados sem mudar o `name`
(vida e acidentes viram uma lista com a pessoa segurada, para caber o cônjuge).

## O que a coleta pede e não deveria (ou é redundante)

- **Os totais declarados** (`currentfinancialassets`, `currentassets`, `currentliabilities`) vêm do exame e repetem as listas.
  O plano **não os usa**: soma as listas. Na coleta nova, o Patrimônio mostra o que as listas somam e, embaixo, o que o
  cliente disse no exame.
- **As 33 perguntas do exame** ficam como foto datada em `exame` (`em`, `origem`, `respostas.<nome no exame>`): a resposta
  macro, que a coleta não muda. Cada uma tem a etiqueta "Exame N" no campo onde a coleta pega o detalhado e, embaixo, "No
  exame: …". As duas coisas existem de propósito: com a coleta completa, o exame pode ser refeito com mais precisão. A
  idade em que começou a trabalhar (pergunta 19) fica só na Aposentadoria (na coleta, a página Cliente não a mostra).
- **O imóvel da moradia** (`moradiaValorImovel`, `moradiaSaldoDevedor`, `moradiaParcela`) repete o imóvel da lista de bens. O
  mapeamento só o usa quando a lista não tem casa nem apartamento. Na coleta nova, a pergunta é só a estrutura de moradia
  (`coleta.moradia`); o imóvel é um bem da lista e o aluguel, uma despesa.
- **A renda principal** (`declaredincome`, do exame) repete a primeira linha da renda ativa. O mapeamento não a duplica quando
  a lista traz o mesmo líquido; o ideal é a lista nascer com a renda do exame já na primeira linha.
- **`actualmoneydedicated`** (quanto investe por mês para os objetivos) é a soma de `obj_aporteMensal`. Na coleta nova é
  calculada e aparece no Perfil.
- **Disposição e capacidade para risco** são "identificadas pelo consultor": é a única decisão do consultor dentro da coleta.
  Podem ficar, mas o perfil de cada caixinha e o modelo da carteira continuam na montagem.
- **Tarefas e anexos** são gestão do atendimento: ficam em `coleta.tarefas` e `coleta.anexos`, dentro do plano, mas nenhuma conta os usa.

## O que fica mesmo na montagem (e por quê)

- **Premissas**: expectativa de vida, rentabilidades reais, juros da dívida quando o dinheiro acaba, valorização de cada
  bem. São escolhas de cenário, não fatos do cliente; a coleta não deve perguntá-las.
- **Decisões por objetivo**: perfil, aporte definido (a coleta traz o que o cliente já pratica, `obj_aporteMensal`, que o
  portal usa como ponto de partida), quando começa, estratégia, alocação da caixinha, o detalhe do financiamento.
- **Avaliações**: cada ameaça da gestão de riscos, cobertura ideal, o diagnóstico futuro, o que é dedutível no IR, a
  estratégia tributária, a carteira recomendada e o que fazer com cada ativo.
- **Com o cliente**: cenários, apresentação, propostas e o orçamento combinado.

## Como entra na montagem

Não entra: já está. A coleta e a montagem leem e gravam o mesmo plano (`nl-db:planos/<id>` aqui; o documento do plano na
plataforma). O consultor finaliza a coleta e a montagem abre com os dados no lugar; se algo mudar depois, ele volta à coleta
ou muda na própria montagem, e é a mesma variável.

As coletas já feitas em produção entram pelo `coleta/plano.js` (`planoDaColeta(submissao)`): ele lê o objeto que a coleta de
hoje grava (campos soltos pelo `name`, listas pelo id) e devolve o plano no formato do portal, com `origem.coleta.campos`
dizendo de que `name` veio cada caminho. Serve para migrar uma vez, não para o dia a dia. As regras dele:

- os totais declarados não vão; as listas mandam. Os bens somam `initialBens`, a carteira soma `initialWealth`;
- a carteira (`carteira.ativos[]`) nasce de `ativoFinList` + `prevAbertaList`; fundo de pensão e FGTS vão para o financeiro;
- cada renda vira uma linha do Fluxo com o valor de hoje; 13º, bônus, PLR e comissões viram linhas próprias;
- `obj_dataAlvo` e `comp_data` viram meses a partir de hoje; `prevPublicaIdadeBeneficio` vira `startMi`;
- o cônjuge cadastrado como dependente sai da lista de dependentes e vira pessoa do plano.

A tabela de cada variável, com o tipo e o tratamento no banco, está em `VARIAVEIS-BANCO.md` (gerada do `esquema.js`).

## Como foi conferido

- **A coleta de produção** foi lida em 03/11/2026 no navegador do app, logado como planejador, com o cliente de teste Nélio
  Costa: as seções, as opções de cada campo e a mecânica de gravação (`/static/js/planejamento.js`).
- **O modo coleta** foi testado com um cliente de teste local: cada página nova gravou nos caminhos desta tabela; "Finalizar a
  coleta" abriu a montagem com o INSS na Liberdade financeira, a renda desejada, a idade de parar e o plano de saúde na Gestão
  de riscos. `node verificar.js` passa.
- **A página longa** foi conferida em 04/11/2026 com um cliente de teste local: as nove seções em sequência, numeradas de
  01 a 09, com o ícone de cada bloco; o fundo de pensão, o PGBL, a previdência pública, a apólice de um apartamento e de um
  carro e a anotação flutuante gravaram nos caminhos da tabela; a montagem do mesmo cliente abre sem nenhum campo da coleta à vista.
- **Não conferido:** o modo coleta dentro da plataforma (o armazém `window.__MONTAGEM__`), o HubSpot e o envio de arquivos,
  que são da plataforma.
