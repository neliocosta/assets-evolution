# Exame de saúde financeira e coleta de dados da Nord Liberta

As variáveis do plano têm quatro origens possíveis:

- **Exame**: o exame de saúde financeira, um dos primeiros contatos com o cliente;
- **Coleta**: a coleta de dados, feita depois do exame e já com as respostas dele importadas;
- **Consultor**: o que o consultor informa ao montar o relatório;
- **Calculada**: o que sai de outras variáveis.

O exame e a coleta já existem na plataforma da Nord. Este arquivo tem:

0. as perguntas do exame e onde cada uma cai na coleta;
1. os campos da coleta, seção por seção, com o destino de cada um no plano;
2. a origem de cada variável do plano;
3. o que o plano usa e a coleta não pega (as lacunas);
4. o que a coleta pega e o plano ainda não usa.

Para as variáveis do plano (onde nascem e quem as usa), veja o `VARIAVEIS.md`.

## Regra: uma mudança recalcula tudo

O que o usuário espera da ferramenta completa (09/10/2026): as informações do cliente mudam ao longo do tempo, e o consultor
pode alterá-las a qualquer momento. Quando uma variável muda, tudo o que depende dela se reajusta: o planejamento, o exame
de saúde financeira e qualquer calculadora que use o dado.

Na prática:

- a resposta do exame, o campo da coleta e o campo do plano que dizem a mesma coisa são **uma variável só**, e não
  cópias. Mudar a renda na coleta muda a resposta do exame e refaz a nota dele;
- as notas, os status e os totais são calculados na hora a partir das variáveis, e não gravados como valor. Uma nota que
  precisa ficar na história (a nota do exame em 16/09/2025) é uma **fotografia datada**: serve para comparar, mas não é
  a fonte de nada;
- cada variável guarda de onde veio (exame, coleta, consultor ou proposta do cliente) e quando mudou.

## 0. Exame de saúde financeira

**Onde:** `liberta.nordinvestimentos.com.br/saudefinanceira/questionario`. Lido em 09/10/2026 sem preencher nada. São 33
campos; cada pergunta tem um trecho de vídeo explicativo.

**Como grava:** não salva sozinho. "SIMULAR" só calcula (`POST /saudeFinanceiraController`, `action: simulate`). "SALVAR"
grava as respostas (`action: insert`) e depois mostra a nota. O formulário vai como um objeto com o `name` de cada pergunta.

**Resultado:** cinco pilares e um score geral, de 0 a 100%, com faixas de cor (até 20 vermelho, 40 laranja, 60 azul, 80
verde-escuro, acima verde). A conta é feita no servidor e não aparece no código da página. O que cada pilar mede, nas
palavras da página:

| Pilar | Chave | O que mede |
|---|---|---|
| Patrimônio | `assetsScore` | quanto você tem de patrimônio acumulado em relação ao seu perfil e momento de vida |
| Poupança | `savingsScore` | quanto da sua renda você guarda para o futuro |
| Proteção | `protectionScore` | quanto do que você construiu está protegido |
| Consciência | `conscienceScore` | se você sabe o que precisa ser feito para ter uma boa saúde financeira |
| Atitude | `attitudeScore` | o que você está de fato fazendo para ter uma situação financeira melhor |
| Score geral | `generalHealthScore` | o resultado final |

Pelas descrições, o pilar Patrimônio parece usar a mesma ideia da página "Fase da vida e patrimônio": o patrimônio contra o
esperado para a idade. É uma hipótese, falta confirmar com a fórmula.

**Perguntas, na ordem** (★ obrigatória; "se …" = só aparece nesse caso). Todas, menos as marcadas, têm o mesmo `name` na
coleta.

| # | Pergunta | `name` | Respostas | Na coleta |
|---|---|---|---|---|
| 1 | ★ De 1 a 5, sente que está usando seu dinheiro da melhor forma para construir o futuro? | `selfevaluation` | 1 Nada confiante a 5 Muito confiante | 09 Perfil |
| 2 | ★ Quanto, em média, você poupa por mês? | `declaredmonthlysavings` | R$ | 02 Orçamento |
| 3 | ★ Quantas vezes nos últimos 12 meses poupou esse valor? | `recentsavingsfrequency` | Nenhuma, 1-3, 4-6, 7-9, 10 ou mais | 02 Orçamento |
| 4 | ★ Tem hoje, com clareza, um ou mais objetivos financeiros? | `hasobjective` | Sim, Não | 01 Objetivos |
| 5 | Se tem objetivo: já avaliou quanto vai precisar? | `evaluateneededmoney` | Sim, Não | 01 Objetivos |
| 6 | Se tem objetivo: já tem um plano concreto? | `hasplanforobjective` | Sim, Não | 01 Objetivos |
| 7 | Se tem objetivo: quanto imagina que precisa investir por mês? | `estimatedmoneyneeded` | R$ | 01 Objetivos, **com outro nome**: `estimatedmoneymonthly` |
| 8 | Se tem objetivo: quanto está de fato investindo por mês? | `actualmoneydedicated` | R$ (não pode passar da pergunta 2) | 01 Objetivos |
| 9 | ★ Quanto tem de ativos financeiros? | `currentfinancialassets` | R$ | 03 Ativos |
| 10 | Quanto disso é reserva de emergência? | `currentreserve` | R$ | 03 Ativos |
| 11 | ★ Guarda todo mês para aumentar a reserva? | `increasingreservemonthly` | Sim, Não | 03 Ativos |
| 12 | ★ Qual seria uma reserva adequada para o seu perfil? | `estimatedreserve` | R$ | 03 Ativos |
| 13 | Quais bens possui? | `currentassetscategories` | Veículos, Casa, Apartamento, Imóveis Comerciais, Outros, Nenhum | 03 Ativos |
| 14 | Se tem bens: quais estão segurados? | `insuredassets` | os bens marcados na 13 | **não existe na coleta** (lá é "Protegido?" por seguro, em 04 Proteção) |
| 15 | Se tem bens: quanto valem? | `currentassets` | R$ (sem descontar financiamento) | 03 Ativos |
| 16 | Possui algum destes produtos de proteção pessoal? | `personalinsurances` | Plano de Saúde, Acidentes Pessoais, Vida, Outros, Não possuo | **não existe na coleta** (lá é "Protegido?" por seguro) |
| 17 | ★ Possui dívidas ou financiamentos? | `hasdebts` | Sim, Não | 03 Ativos (lá: "outras dívidas, além dos financiamentos") |
| 18 | Se tem dívidas: quanto precisaria para quitar tudo? | `currentliabilities` | R$ | 03 Ativos |
| 19 | ★ Com que idade começou a trabalhar? | `startingworkingage` | anos | 05 Aposentadoria |
| 20 | ★ Até que idade imagina que precisará trabalhar? | `retiringtargetage` | anos | 05 Aposentadoria |
| 21 | ★ Já pensou de onde virá a renda depois dessa idade? | `hasretiringstrategies` | Sim, Não | 05 Aposentadoria |
| 22 | Se pensou: qual seria o plano? | `currentretiringstrategies` | pensão pública, pensão privada, investimentos | 05 Aposentadoria |
| 23 | Se pensou: já executa um plano para essa renda? | `executingretiringstrategies` | INSS, previdência da empresa, investimentos ou previdência privada | 05 Aposentadoria |
| 24 | ★ Natureza da sua fonte de renda (a principal) | `incomenature` | CLT, Servidor, Aposentadoria/Pensão, Liberal/Autônomo, Empresário, Sem renda | 06 Financeiro |
| 25 | ★ Renda líquida mensal | `declaredincome` | R$ | 06 Financeiro |
| 26 | ★ Possui dependentes financeiros? | `hasdependents` | Sim, Não | 07 Cenário |
| 27 | ★ Acompanha as despesas todo mês? | `doesbudgeting` | Sim em detalhes, Sim parcialmente, Não mas tenho ideia, Não faço ideia | 02 Orçamento |
| 28 | ★ Custo de vida médio (se divide com outra pessoa, só a sua parte) | `declaredstandardofliving` | R$ | 02 Orçamento |
| 29 | ★ Já teve produtos e estratégias validados por um profissional? | `hadprofessionalvalidation` | Sim, Não | 07 Cenário |
| 30 | ★ Estado civil | `maritalstatus` | Solteiro(a), Casado(a), Divorciado(a), Separado(a), Viúvo(a) | 08 Dados pessoais |
| 31 | ★ Gênero | `usergender` (`usergender4` = prefiro não declarar) | Feminino, Masculino, Outro, Prefiro não declarar | 08 Dados pessoais |
| 32 | ★ Data de nascimento | `dayofbirth`, `monthofbirth`, `yearofbirth` | dia, mês, ano | 08 Dados pessoais, num campo só: `dateofbirth` |
| 33 | ★ E-mail para receber o resultado | `useremail` | e-mail | 08 Dados pessoais |

**Diferenças entre o exame e a coleta**, que a importação precisa tratar (a conferir no servidor):

- a pergunta 7 tem um nome em cada lugar (`estimatedmoneyneeded` no exame, `estimatedmoneymonthly` na coleta). O script
  da coleta ainda usa o nome do exame no preenchimento de teste, então a importação pode estar perdendo essa resposta;
- as perguntas 14 e 16 são listas de marcar no exame e viraram, na coleta, um "Protegido?" para cada seguro (auto,
  residencial, vida, acidentes, saúde). "Outros produtos de seguro" não tem lugar na coleta;
- na pergunta 17, o exame pergunta por dívidas **ou financiamentos**, e a coleta por **outras** dívidas. O mesmo `name`
  tem dois sentidos;
- a data de nascimento vem em três campos no exame e em um na coleta;
- a coleta permite o orçamento anual (`orcamentoModo`); o exame é sempre mensal.

O exame é de uma pessoa, como a coleta. O custo de vida já pede só a parte de quem responde (pergunta 28).

**Como foi levantado (09/10/2026).** Lendo a página da coleta e o script dela (`/static/js/planejamento.js`) na área
logada, sem preencher nada. São 211 campos. O cliente de teste (Nélio Costa) não tem coleta gravada nem questionário
respondido: aqui está a estrutura, sem valores.

**Como a coleta grava.** Cada campo tem um `name`. A coleta vai para o servidor como um objeto `submissao`
(`POST /planejamentoController`, ações `save` e `update`, status `rascunho` ou `finalizado`):

- campos soltos: a chave é o `name`;
- caixas de marcar: uma lista dos valores marcados;
- listas (objetivos, rendas, bens…): uma lista de objetos sob o id da lista (`objList`, `rendaAtivaList`, `bensList`…), e
  cada objeto usa os `name` dos campos do item;
- `anotacoesConsultor`: as anotações do painel lateral.

A coleta gravada abre em `/coletadedados?id=<id>`, e o relatório dela em `/coleta/relatorio?id=<id>`.

**Cuidado.** A página salva um rascunho sozinha, 1,5 s depois de qualquer digitação ou clique num campo: o primeiro toque
numa página vazia já cria uma coleta para o cliente selecionado. Para olhar a estrutura, leia a página sem tocar nos
campos.

**A coleta é de uma pessoa.** Tudo é perguntado ao cliente: as rendas, os seguros e a previdência são dele. O cônjuge
só aparece como dependente (relação "Cônjuge", com nome e idade).

★ = obrigatório na coleta. "Diagnóstico" = resposta usada para avaliar o cliente, sem variável no plano.

## 1. Campos da coleta e destino no plano

### 01 Objetivos financeiros

| Campo | `name` | Tipo e opções | No plano |
|---|---|---|---|
| ★ Tem objetivo financeiro claro? | `hasobjective` | Sim, Não | diagnóstico |
| ★ Avaliou quanto precisa para o(s) objetivo(s)? | `evaluateneededmoney` | Sim, Não | diagnóstico |
| ★ Tem plano concreto para atingir o objetivo? | `hasplanforobjective` | Sim, Não ("plano superficial = Não") | diagnóstico |
| ★ Quanto imagina precisar investir/mês para o objetivo | `estimatedmoneymonthly` | R$ | diagnóstico |
| ★ Quanto está de fato investindo/mês para o objetivo | `actualmoneydedicated` | R$ | diagnóstico (é a soma de hoje dos `objectives[].planned`) |
| **Lista de objetivos** (`objList`) | | | `objectives[]` |
| Título do objetivo | `obj_titulo[]` | texto | `name` |
| Categoria | `obj_categoria[]` | Compra de Casa, Compra de Veículo, Viagem, Intercâmbio, Aposentadoria Segura, Futuro dos Filhos, Casamento, Quitar Dívidas, Segurança Financeira, Outro | `icon` e `kind` (casa e veículo viram bem; o resto é consumo), por uma regra a definir |
| Descrição | `obj_descricao[]` | texto longo | não usado |
| Mês alvo | `obj_dataAlvo[]` | mês | `months`, calculado (meses a partir de set/2026) |
| Valor necessário na data alvo | `obj_valorNecessario[]` | R$ | `amount` |
| Custo total do objetivo | `obj_custoTotal[]` | R$ ("parcial ou financiado") | a diferença para o necessário seria o financiado de `costs[]` (faltam taxa e prazo) |
| Tem bem de entrada? / descrição / valor | `obj_temBemEntrada_N`, `obj_bemEntradaDesc[]`, `obj_bemEntradaValor[]` | Sim, Não; texto; R$ | não existe no plano |
| Gera custo mensal após realização? / valor | `obj_temCustoMensal_N`, `obj_custoMensal[]` | Sim, Não; R$ | `costs[]` do tipo fixo |
| Quanto separar por mês para este objetivo | `obj_aporteMensal[]` | R$ | `planned` |
| Já tem valor separado? / saldo | `obj_temSaldo_N`, `obj_saldoAtual[]` | Sim, Não; R$ | `dedicated` |
| Plano atual do cliente para este objetivo | `obj_planoAtual[]` | texto longo | não usado (apoio para `strategy`) |
| Observações | `obj_obs[]` | texto longo | não usado |
| Cliente não possui objetivos | `objNaoPossui` | marca | — |
| **Compromissos financeiros** (`comprList`) | `comp_titulo[]`, `comp_descricao[]`, `comp_data[]` (mês), `comp_valor[]` | texto, mês, R$ | seriam despesas pontuais em `expenses[]`; hoje não ligados |
| Cliente não possui compromissos | `comprNaoPossui` | marca | — |

### 02 Orçamento doméstico

| Campo | `name` | Tipo e opções | No plano |
|---|---|---|---|
| Periodicidade do orçamento | `orcamentoModo` | Mensal, Anual | unidade do valor abaixo |
| ★ Valor do orçamento doméstico (custo de vida) | `declaredstandardofliving` | R$ ("somente o valor de sua responsabilidade") | `riscos.reserva.custoVida` (ajuste); o plano calcula o custo de vida das despesas. É **só a parte do cliente** nas despesas |
| ★ Quantas vezes poupou esse valor nos últimos 12 meses? | `recentsavingsfrequency` | Nenhuma, 1-3, 4-6, 7-9, 10 ou mais | diagnóstico |
| ★ Acompanha as despesas mensais do orçamento doméstico? | `doesbudgeting` | Sim em detalhes, Sim parcialmente, Não mas tenho ideia, Não faço ideia | diagnóstico |
| ★ Quanto poupa por mês em média? | `declaredmonthlysavings` | R$ | `capacityOverride` (capacidade de poupança informada) |

### 03 Ativos, patrimônio e dívidas

| Campo | `name` | Tipo e opções | No plano |
|---|---|---|---|
| ★ Total de ativos financeiros | `currentfinancialassets` | R$ (sem imóveis e veículos) | total declarado; o plano soma a lista (`initialWealth`) |
| ★ Quanto deste valor é reserva de emergência? | `currentreserve` | R$ | `riscos.reserva.atual` (o plano usa o D+0 da liquidez) |
| ★ Está guardando mensalmente para aumentar a reserva? | `increasingreservemonthly` | Sim, Não | diagnóstico |
| ★ Valor ideal de reserva para o perfil do cliente | `estimatedreserve` | R$ | `riscos.reserva.alvo` (o plano calcula a ideal) |
| Quais bens possui? | `currentassetscategories` | Veículos, Casa, Apartamento, Imóveis Comerciais, Outros, Nenhum | diagnóstico |
| Valor estimado total dos bens | `currentassets` | R$ (sem descontar financiamento) | total declarado; o plano soma a lista (`initialBens`) |
| **Ativos financeiros** (`ativoFinList`) | | | `patrimonio.financeiro[]` (somados por instituição) |
| Tipo do ativo | `af_tipo[]` | Conta Corrente, Renda Fixa, Fundo, Renda Variável, Carteira Diversificada, Carteira de Renda Variável, Carteira de Fundos Imobiliários, Criptoativos, Alternativos, Outros | não usado (o plano só separa investimento, PGBL e VGBL) |
| Saldo atual | `af_saldo[]` | R$ | `valor` |
| Instituição | `af_instituicao[]` | texto | `nome` |
| Renda fixa: subclasse | `af_rf_subclasse[]` | Tesouro Selic, IPCA+, Pré, Educa+, Renda+, CDB/RDB, LCI/LCA, CRI/CRA, Debênture, LIG | não usado (apoio para a ameaça de ruína) |
| Renda fixa: indexador, emissor, rentabilidade | `af_rf_indexador[]`, `af_rf_emissor[]`, `af_rf_rentabilidade[]` | % do CDI, CDI+, Pré, IPCA+, Dólar+; texto; texto | não usado (o emissor serve à ruína: concentração) |
| Renda fixa: data da aplicação, vencimento | `af_rf_dataAplicacao[]`, `af_rf_prazo[]` | data | não usado (o vencimento serve à liquidez) |
| Renda fixa: liquidez | `af_rf_liquidez[]` | Sim, Não, Após 30, 60 ou 120 dias | **daria a escada de liquidez** (`riscos.liquidez`, hoje digitada) |
| Fundo: subclasse, nome, CNPJ, data | `af_fn_subclasse[]`, `af_fn_nome[]`, `af_fn_cnpj[]`, `af_fn_dataAplicacao[]` | Liquidez, Renda Fixa, Multimercado, Ações Brasil, Ações Global, Cambial; textos; data | não usado |
| Fundo: prazo de resgate (dias) | `af_fn_prazoResgate[]` | número | **daria a escada de liquidez** |
| Renda variável: subclasse, ticker, preço médio, data | `af_rv_subclasse[]`, `af_rv_ticker[]`, `af_rv_precoMedio[]`, `af_rv_dataAplicacao[]` | Ações Brasil, Derivativos, Ações Internacionais, FII, ETFs, FIAGRO, FI-Infra, BDRs, Commodities, Câmbio; texto; R$; data | não usado |
| Carteira: perfil de risco, racional | `af_cd_perfil[]`, `af_cart_racional[]` | Conservadora a Agressiva; Convicções próprias, Instituição Financeira, Casa de Análise | não usado |
| Outros detalhes | `af_obs[]` | texto longo | não usado |
| **Bens** (`bensList`) | | | `patrimonio.bens[]` |
| Tipo do bem | `bem_tipo[]` | Casa, Apartamento, Imóvel Comercial, Terreno, Carro, Moto, Outro | não usado |
| Descrição | `bem_descricao[]` | texto | `nome` |
| Valor estimado atual | `bem_valor[]` | R$ | `mercado` |
| Quitado? | `bem_quitado_N` | Sim, Não | saldo devedor zero ou não |
| Saldo devedor, parcela mensal | `bem_saldoDevedor[]`, `bem_parcela[]` | R$ (só se não quitado) | `saldoDevedor`, `parcela` (e a linha "Parcela: nome" do Fluxo) |
| Gera renda passiva? / renda mensal | `bem_geraRenda_N`, `bem_rendaPassiva[]` | Sim, Não; R$ | `renda` (a linha de renda passiva do Fluxo, criada com esse valor) |
| Compartilhado com outra pessoa? / percentual do cliente | `bem_compartilhado_N`, `bem_percentual[]` | Sim, Não; % | `titularidade` e `titularPct` (a coleta não diz com quem; o plano supõe o cônjuge) |
| Observações | `bem_obs[]` | texto longo | não usado |
| **Outros ativos** (`outrosAtivosList`) | `oa_titulo[]`, `oa_valor[]`, `oa_descricao[]`, `oa_geraRenda_N`, `oa_obs[]` | texto, R$, texto, Sim/Não, texto | sem destino certo: uma empresa iria para `patrimonio.participacoes[]` |
| ★ Possui outras dívidas? | `hasdebts` | Sim, Não (além dos financiamentos) | — |
| ★ Saldo devedor total (dívidas + financiamentos) | `currentliabilities` | R$ | só o total; o plano tem a lista `patrimonio.dividas[]` com o detalhe |
| Não possui (cada lista) | `ativoFinNaoPossui`, `bensNaoPossui`, `outrosAtivosNaoPossui` | marca | — |

### 04 Proteção

Cada seguro abre o detalhe quando "Protegido?" é Sim.

| Campo | `name` | Tipo e opções | No plano |
|---|---|---|---|
| Automóvel: protegido? | `seg_auto_protegido` | Sim, Não | `bens[].protecao` do carro |
| Automóvel: seguradora, bem segurado | `seg_auto_seguradora`, `seg_auto_bem` | texto | `bens[].apolice.seguradora`; o bem segurado diz qual bem |
| Automóvel: coberturas incêndio/roubo/colisão, APP, RCV-F | `seg_auto_cobIncendio`, `seg_auto_cobAPP`, `seg_auto_cobRCVF` | texto | RCV-F é a cobertura atual de danos a terceiros (`riscos.terceiros.itens[].atual`) |
| Automóvel: prêmio anual, mês de renovação, observações | `seg_auto_premio`, `seg_auto_mesRenovacao`, `seg_auto_obs` | R$, mês, texto | o prêmio seria uma despesa anual do Fluxo; hoje não ligado |
| Residencial: protegido? | `seg_res_protegido` | Sim, Não | `bens[].protecao` do imóvel |
| Residencial: seguradora, imóvel segurado | `seg_res_seguradora`, `seg_res_imovel` | texto | `bens[].apolice` |
| Residencial: coberturas incêndio, danos elétricos, subtração, RC familiar | `seg_res_cobIncendio`, `seg_res_cobDanosEletricos`, `seg_res_cobSubtracao`, `seg_res_cobRCFamiliar` | texto | RC familiar é a cobertura atual de "Responsabilidade civil familiar" em `riscos.terceiros` |
| Residencial: prêmio anual, renovação, observações | `seg_res_premio`, `seg_res_mesRenovacao`, `seg_res_obs` | R$, mês, texto | despesa anual (não ligada) |
| Vida: protegido? | `seg_vida_protegido` | Sim, Não | — |
| Vida: seguradora, valor coberto | `seg_vida_seguradora`, `seg_vida_valorCoberto` | texto, R$ | `riscos.seguro.geradores[titular].coberturaVida` |
| Vida: prêmio mensal, tipo, prazo, observações | `seg_vida_premio`, `seg_vida_tipo`, `seg_vida_prazoCobertura`, `seg_vida_obs` | R$; Anual, Termo, Vitalício; texto; texto | o prêmio seria despesa do Fluxo (não ligado) |
| Acidentes: protegido? | `seg_acid_protegido` | Sim, Não | — |
| Acidentes: seguradora, valor coberto | `seg_acid_seguradora`, `seg_acid_valorCoberto` | texto, R$ | `riscos.seguro.geradores[titular].coberturaInvalidez` |
| Acidentes: prêmio mensal, observações | `seg_acid_premio`, `seg_acid_obs` | R$, texto | despesa (não ligada) |
| Saúde: protegido? | `seg_saude_protegido` | Sim, Não | sem plano: ameaça de saúde crítica |
| Saúde: tipo de plano | `seg_saude_tipo` | Pela Empresa, PME, Empresarial, Adesão, Familiar | `riscos.saude.tipo` ("Pela Empresa" diz quem paga) |
| Saúde: operadora, nome do plano | `seg_saude_operadora`, `seg_saude_nomePlano` | texto | não usado |

### 05 Aposentadoria

| Campo | `name` | Tipo e opções | No plano |
|---|---|---|---|
| ★ Idade que começou a trabalhar | `startingworkingage` | anos | `patrimonio.comecou` |
| ★ Pretende trabalhar até qual idade? | `retiringtargetage` | anos | `retireAge` |
| Renda desejada na aposentadoria | `rendaDesejadaAposentadoria` | R$ | `desired` |
| ★ Tem plano concreto de onde virá a renda? | `hasretiringstrategies` | Sim, Não | diagnóstico |
| Qual seria o plano? | `currentretiringstrategies` | pensão pública, pensão privada, investimentos (várias) | diagnóstico |
| O que está executando hoje? | `executingretiringstrategies` | INSS, previdência da empresa, investimentos ou previdência privada (várias) | diagnóstico |
| Tipo de previdência pública | `prevPublicaTipo` | INSS, RPPS, Nenhuma | `passive[]`: a renda "INSS" |
| Idade estimada para receber o benefício | `prevPublicaIdadeBeneficio` | anos | `passive[].startMi`, calculado da idade |
| Valor estimado do benefício | `prevPublicaValorBeneficio` | R$ | `passive[].net` |
| Detalhe: primeira contribuição, nº de contribuições, valor médio, valor atual, observações (RPPS) | `prevPublicaDataInicio`, `prevPublicaNContrib`, `prevPublicaValorMedioContrib`, `prevPublicaValorAtualContrib`, `prevPublicaObs` | mês, número, R$, R$, texto | não usado (o plano não estima o benefício) |
| **Previdência fechada** (`prevFechadaList`) | `pf_entidade[]`, `pf_tipo[]` (PGBL, Fundo de Pensão), `pf_regime[]` (Regressivo, Progressivo), `pf_nomeFundo[]`, `pf_cnpj[]`, `pf_perfilRisco[]`, `pf_contribuicao[]`, `pf_contrapartida[]`, `pf_saldo[]`, `pf_dataEntrada[]`, `pf_nContrib[]`, `pf_vestingProprio[]`, `pf_vestingPatroc[]`, `pf_obs[]` | | o saldo iria para `patrimonio.financeiro[]`; o resto não é usado |
| **Previdência aberta** (`prevAbertaList`) | | | |
| Tipo do plano | `pa_tipo[]` | PGBL, VGBL, FGB | `patrimonio.financeiro[].tipo` |
| Saldo atual total | `pa_saldo[]` | R$ | `patrimonio.financeiro[].valor` (fora do inventário na sucessão) |
| Contribuição mensal atual | `pa_contribuicao[]` | R$ | PGBL de hoje no IR (× 12) e aporte do simulador; hoje não ligado |
| Regime, nome, CNPJ, perfil, data de início, observações | `pa_regime[]`, `pa_nomeFundo[]`, `pa_cnpj[]`, `pa_perfilRisco[]`, `pa_dataInicio[]`, `pa_obs[]` | | não usado (a data de início diz em que faixa da tabela regressiva o saldo está) |
| Não possui (cada lista) | `prevFechadaNaoPossui`, `prevAbertaNaoPossui` | marca | — |

### 06 Financeiro e contábil

| Campo | `name` | Tipo e opções | No plano |
|---|---|---|---|
| ★ Natureza da principal fonte de renda | `incomenature` | CLT, Servidor Público, Aposentadoria/Pensão, Profissional Liberal/Autônomo, Empresário, Sem Renda | `riscos.reserva.natureza` (mesmas categorias da calculadora de reserva, menos estagiário) |
| ★ Renda líquida mensal | `declaredincome` | R$ | a renda principal em `incomes[]` (o valor do degrau) |
| Regime de declaração do IR | `irRegime` | Simplificado, Completo, Não declara | o modelo de hoje no IR; o plano escolhe o de menor imposto sozinho |
| **Renda ativa** ("outras fontes", `rendaAtivaList`) | | | `incomes[]` de tipo ativa |
| Regime de trabalho | `ra_regime[]` | CLT, Profissional Liberal/Autônomo, Empresário, Servidor Público | `origin` (CLT e servidor: Salário; empresário: Pró-labore) e o INSS do IR |
| Horas de trabalho/mês | `ra_horas[]` | número | não usado |
| Renda bruta mensal | `ra_rendaBruta[]` | R$ | `gross` |
| Renda líquida mensal | `ra_rendaLiquida[]` | R$ | `steps[0].value` |
| Comissões (mensal) | `ra_comissoes[]` | R$ | uma linha "Comissões" |
| Recebe 13º salário? | `ra_decimo_N` | Sim, Não | uma linha anual de 13º (hoje o 13º só entra se for linha do Fluxo) |
| Bônus anual, PLR anual | `ra_bonus[]`, `ra_plr[]` | R$ | linhas anuais "Bônus" e "PLR" (a PLR não é tributável no ajuste) |
| Observações | `ra_obs[]` | texto longo | não usado |
| **Renda passiva** (`rendaPassivaList`) | | | `incomes[]` de tipo passiva |
| Tipo da renda passiva | `rp_tipo[]` | Investimentos Financeiros, Imóveis, Negócios, Pensão, Assistência, Outro | `origin` |
| Ativo que gera esta renda | `rp_ativo[]` | texto | a ligação com o bem (`bens[].renda`) |
| Renda bruta e líquida mensal esperada | `rp_rendaBruta[]`, `rp_rendaLiquida[]` | R$ | `gross`, `steps[0].value` |
| Observações | `rp_obs[]` | texto longo | não usado |
| Não possui (cada lista) | `rendaAtivaNaoPossui`, `rendaPassivaNaoPossui` | marca | — |

O "Resumo de renda mensal" da página é calculado (soma das líquidas das duas listas) e não é gravado.

### 07 Cenário atual

| Campo | `name` | Tipo e opções | No plano |
|---|---|---|---|
| ★ Tem dependentes financeiros? | `hasdependents` | Sim, Não | `riscos.reserva.dependentes` (o d da reserva); com a lista, é ela que decide |
| ★ Já teve produtos financeiros avaliados por um profissional? | `hadprofessionalvalidation` | Sim, Não | diagnóstico |
| Estrutura de moradia atual | `moradiaEstrutura` | Aluguel, Imóvel Financiado, Imóvel Quitado, Com Terceiros | aluguel: a despesa "Moradia (aluguel)"; imóvel: um bem |
| Valor do aluguel | `moradiaValorAluguel` | R$ (só aluguel) | `expenses[]` "Moradia (aluguel)" |
| Valor do imóvel, saldo devedor, parcela | `moradiaValorImovel`, `moradiaSaldoDevedor`, `moradiaParcela` | R$ (só imóvel) | `bens[]` (**repete** o imóvel da lista de bens) |
| Saldo de FGTS | `fgts` | R$ | não usado (o plano não tem FGTS) |
| Observações | `moradiaObs` | texto longo | não usado |
| **Família e dependentes** (`depList`) | | | `riscos.dependentes[]` |
| Relação | `dep_relacao[]` | Filho(a), Cônjuge, Companheiro(a), Pai/Mãe, Outro | `relacao`; "Cônjuge" daria `conjugeNome` e `spouseAge` |
| Nome | `dep_nome[]` | texto | `nome` |
| Idade atual | `dep_idade[]` | número | `nasc` (o plano pede o mês de nascimento; a idade só dá um aproximado) |
| Tipo de dependência | `dep_dependencia_N` | Total, Parcial | não usado |
| Custo mensal estimado | `dep_custo[]` | R$ | não usado (seria a despesa de cada dependente) |
| Observações | `dep_obs[]` | texto longo | não usado |
| Não possui dependentes | `depNaoPossui` | marca | — |

### 08 Dados pessoais

| Campo | `name` | Tipo e opções | No plano |
|---|---|---|---|
| ★ Estado civil | `maritalstatus` | Solteiro(a), Casado(a), Divorciado(a), Separado(a), Viúvo(a) | pista para `tipo` (uma pessoa ou casal) |
| ★ Gênero | `usergender` | Feminino, Masculino, Outro, Prefiro não declarar | não usado |
| ★ Data de nascimento | `dateofbirth` | data | `age`, calculada |
| ★ Email, ★ Telefone / WhatsApp | `useremail`, `userphone` | texto | não usado no plano (cadastro) |

O nome do cliente vem do cadastro da plataforma, não da coleta.

### 09 Perfil e comportamento

| Campo | `name` | Tipo e opções | No plano |
|---|---|---|---|
| ★ Escala de 1 a 5: usa o dinheiro da melhor forma? | `selfevaluation` | 1 a 5 | diagnóstico |
| Disposição a risco, capacidade para risco (identificadas pelo consultor) | `disposicaoRisco`, `capacidadeRisco` | Baixo, Médio, Alto | não usado (apoio para o perfil dos objetivos) |
| Relação com o dinheiro | `relacaoDinheiro` | Gastador, Poupador, Neutro | não usado |
| Restrição a classe de ativo; ativo que não quer desfazer; classe que não quer ter | `restricaoClasseAtivo`, `ativoNaoDesfazer`, `classeNaoQuer` | texto | não usado (apoio para a ameaça de ruína) |
| Perpetuidade / herança | `perpetuidadeHeranca` | texto longo | não usado (apoio para `mode`, perpetuidade ou consumo) |

### 10 Anexos e 11 Próximas tarefas

| Campo | `name` | Tipo e opções | No plano |
|---|---|---|---|
| Documentos entregues / pendentes | `anexos` | Extratos dos investimentos, Declaração de IR, Apólices de seguros, Outros | não usado |
| Observações sobre os anexos | `anexosObs` | texto | não usado |
| Arquivos | (envio à parte: `action: uploadFile`, por categoria) | PDF, imagem, planilha, até 10 MB | não usado; as apólices resolvem a pendência 3 da Gestão de riscos |
| **Tarefas** (`tarefasList`) | `tarefa_titulo[]`, `tarefa_prazo[]`, `tarefa_responsavel[]` (Consultor, Cliente), `tarefa_status[]` (Pendente, Em andamento, Concluída), `tarefa_obs[]` | | não usado |
| Anotações do consultor | `anotacoesConsultor` | texto | não usado |

## 2. Origem de cada variável do plano

**Exame**: nasce numa pergunta do exame de saúde financeira, e a coleta a importa com o mesmo nome. **Coleta**: vem de
um campo que só a coleta tem. **Consultor**: o consultor informa ao montar o relatório. **Calculada**: sai de outras
variáveis. **Lacuna**: o plano usa e a coleta não pega; hoje quem preenche é o consultor.

### Quem é a família

| Variável | Caminho | Origem | De onde |
|---|---|---|---|
| Nome do cliente | `name` | Coleta (cadastro) | nome do cliente na plataforma |
| Idade do titular | `age` | Calculada | `dateofbirth` (exame, pergunta 32) |
| Tipo de plano | `tipo` | Consultor | pista: `maritalstatus` (exame, pergunta 30) |
| Nome e idade do cônjuge | `conjugeNome`, `spouseAge` | Lacuna | só se o cônjuge for cadastrado como dependente (`dep_relacao` = Cônjuge) |
| Dependentes | `riscos.dependentes` | Coleta | `depList`; a idade vira um nascimento aproximado |
| Começou a trabalhar aos | `patrimonio.comecou` | Exame | `startingworkingage` (pergunta 19) |
| Quer parar aos | `retireAge` | Exame | `retiringtargetage` (pergunta 20) |
| Expectativa de vida | `lifeExp` | Consultor | premissa |
| Renda desejada | `desired` | Coleta | `rendaDesejadaAposentadoria` |
| Renda desejada por idade | `desiredSteps` | Consultor | |

### Dinheiro que entra e sai

| Variável | Caminho | Origem | De onde |
|---|---|---|---|
| Rendas: valor líquido | `incomes[].steps` | Exame e coleta | `declaredincome` (principal, exame pergunta 25), `ra_rendaLiquida[]`, `rp_rendaLiquida[]`; comissões, 13º, bônus e PLR viram linhas próprias |
| Bruto de cada recebimento | `incomes[].gross` | Coleta | `ra_rendaBruta[]`, `rp_rendaBruta[]` (a renda principal não tem bruto) |
| Categoria e tipo | `incomes[].origin`, `kind` | Calculada | `ra_regime[]` (ativa), `rp_tipo[]` (passiva) |
| Tributável | `incomes[].taxable` | Calculada | da categoria (lucros e PLR não) |
| De quem é a renda | `incomes[].pessoa` | Lacuna | a coleta é de uma pessoa |
| Dias de recebimento, frequência, degraus futuros | `incomes[].days`, `frequency`, `steps` | Consultor | a coleta dá um valor mensal de hoje |
| Renda certa ou estimada | (ainda não existe) | Lacuna | |
| Despesas linha a linha | `expenses[]` | Consultor | a coleta tem o total e itens soltos: aluguel (`moradiaValorAluguel`), parcelas (`bem_parcela[]`, `moradiaParcela`), prêmios de seguros (`seg_*_premio`), custo dos dependentes (`dep_custo[]`), contribuições de previdência (`pa_contribuicao[]`, `pf_contribuicao[]`), compromissos (`comprList`) |
| Participação de cada pessoa nas despesas | (ainda não existe) | Lacuna | pista: `declaredstandardofliving` é "somente o valor de sua responsabilidade" |
| Custo de vida mensal | média das saídas | Calculada | com `declaredstandardofliving` (exame, pergunta 28) como o declarado |
| Capacidade de poupança informada | `capacityOverride` | Exame | `declaredmonthlysavings` (pergunta 2) |
| Parcela de uma dívida | linha "Parcela: nome" | Calculada | da dívida (Patrimônio) |
| Como o Fluxo abre | `horizonte` | Consultor | |

### O que a família tem

| Variável | Caminho | Origem | De onde |
|---|---|---|---|
| Financeiro por instituição e tipo | `patrimonio.financeiro[]` | Coleta | `ativoFinList` (somado por instituição), `prevAbertaList` (PGBL, VGBL), `prevFechadaList` |
| Patrimônio financeiro | `initialWealth` | Calculada | soma da lista; `currentfinancialassets` (exame, pergunta 9) é o declarado |
| Participações societárias | `patrimonio.participacoes[]` | Lacuna | talvez `outrosAtivosList` |
| Bens: nome, valor, saldo devedor, parcela | `patrimonio.bens[]` | Coleta | `bensList` (e o imóvel da moradia) |
| Bens: crédito, parcelas contratadas e restantes, juros, situação | `patrimonio.bens[]` | Lacuna | |
| Renda que um bem gera | `bens[].renda` | Coleta | `bem_rendaPassiva[]` vira a linha de renda passiva |
| Titularidade de cada bem | `bens[].titularidade`, `titularPct` | Coleta | `bem_compartilhado_N`, `bem_percentual[]` (sem dizer com quem) |
| Proteção e apólice de cada bem | `bens[].protecao`, `apolice` | Coleta | `seg_auto_*`, `seg_res_*` (um seguro de cada) |
| Outras dívidas | `patrimonio.dividas[]` | Lacuna | a coleta tem só o total (`currentliabilities`, com os financiamentos) |
| Liquidez ideal | `patrimonio.liquidezIdeal` | Consultor | |

### Proteção

| Variável | Caminho | Origem | De onde |
|---|---|---|---|
| Natureza do trabalho | `riscos.reserva.natureza` | Exame | `incomenature` (pergunta 24) |
| Tem dependentes | `riscos.reserva.dependentes` | Exame | `hasdependents` (pergunta 26) |
| Reserva atual | `riscos.reserva.atual` | Exame | `currentreserve` (pergunta 10; o plano usa o D+0) |
| Alvo de reserva | `riscos.reserva.alvo` | Exame | `estimatedreserve` (pergunta 12; o plano calcula a ideal) |
| Liquidez D+0 a 1 ano | `riscos.liquidez` | Consultor | daria para calcular de `af_rf_liquidez[]`, `af_rf_prazo[]` e `af_fn_prazoResgate[]` |
| Avaliação da liquidez e da ruína | `riscos.liquidez.avaliacao`, `riscos.ruina.itens` | Consultor | apoio: subclasse e emissor dos ativos, restrições do perfil |
| Plano de saúde: tipo | `riscos.saude.tipo` | Coleta | `seg_saude_tipo` |
| Plano de saúde: vidas, prêmios, quem paga | `riscos.saude.vidas[]` | Lacuna | "Pela Empresa" diz que a empresa paga |
| Plano de saúde: hospitais, alternativa, avaliação | `riscos.saude.*` | Consultor | |
| Danos a terceiros: cobertura atual | `riscos.terceiros.itens[].atual` | Coleta | `seg_auto_cobRCVF`, `seg_res_cobRCFamiliar` (RC profissional: lacuna) |
| Danos a terceiros: cobertura ideal | `riscos.terceiros.itens[].ideal` | Consultor | |
| Geradores de renda: pessoa e idade | `riscos.seguro.geradores[]` | Coleta para o titular, lacuna para o cônjuge | `dateofbirth` |
| % da renda da família de cada gerador | `geradores[].participacao` | Lacuna | assunto da próxima sessão |
| % da renda passiva e do patrimônio de cada um | `geradores[].passivaPct`, `patrimonioPct` | Consultor | o do patrimônio poderia sair de `bem_percentual[]` |
| INSS por invalidez e por morte | `geradores[].inssInvalidez`, `inssMorte` | Lacuna | |
| Cobertura atual de vida e de acidentes | `geradores[].coberturaVida`, `coberturaInvalidez` | Coleta para o titular | `seg_vida_valorCoberto`, `seg_acid_valorCoberto` |
| Renda a proteger, renda passiva | `riscos.seguro.renda`, `passiva` | Calculada | do Fluxo |
| Sucessão nos seguros, pesos das ameaças | `riscos.seguro.sucessaoPct`, `riscos.pesos` | Consultor | |

### Objetivos e liberdade financeira

| Variável | Caminho | Origem | De onde |
|---|---|---|---|
| Nome do objetivo | `objectives[].name` | Coleta | `obj_titulo[]` |
| Ícone e tipo (bem ou consumo) | `objectives[].icon`, `kind` | Calculada | `obj_categoria[]` |
| Data alvo | `objectives[].months` | Calculada | `obj_dataAlvo[]` |
| Custo | `objectives[].amount` | Coleta | `obj_valorNecessario[]` |
| Gastos depois de realizado | `objectives[].costs` | Coleta (custo fixo) e lacuna (financiamento) | `obj_custoMensal[]`; `obj_custoTotal[]` sem taxa e prazo |
| Patrimônio dedicado | `objectives[].dedicated` | Coleta | `obj_saldoAtual[]` |
| Aporte definido | `objectives[].planned` | Coleta | `obj_aporteMensal[]` |
| Perfil e rentabilidade | `objectives[].profile`, `rateM` | Consultor | apoio: `disposicaoRisco`, `capacidadeRisco` |
| Foto, ícone, estratégia | `objectives[].photo`, `iconFA`, `strategy` | Consultor | apoio: `obj_planoAtual[]` |
| Modo de saque | `mode` | Consultor | apoio: `perpetuidadeHeranca` |
| INSS | `passive[]` | Coleta | `prevPublicaTipo`, `prevPublicaIdadeBeneficio`, `prevPublicaValorBeneficio` |
| Outras rendas contratadas | `passive[]` | Consultor | |
| Rentabilidades | `rate`, `profiles` | Consultor | premissas |

### Otimização tributária e apresentação

| Variável | Caminho | Origem | De onde |
|---|---|---|---|
| Rendimentos tributáveis e INSS | do Fluxo | Calculada | |
| Modelo de declaração de hoje | (o plano escolhe o de menor imposto) | Coleta | `irRegime` |
| Despesas médicas e instrução | `tributario.ir.*.lanc[]` | Consultor | apoio: a declaração de IR anexada |
| PGBL de hoje | `tributario.ir.atual.lanc[].pgbl` | Consultor | daria para calcular de `pa_contribuicao[]` com `pa_tipo` PGBL |
| Pró-labore e dividendos de hoje | do Fluxo | Calculada | |
| Empresa, regime tributário, faturamento, pró-labore recomendado | `tributario.prolabore.socios[]` | Lacuna (consultor) | |
| ITCMD, custos, valor para a previdência | `tributario.sucessao` | Consultor | |
| Simulador da previdência | `tributario.previdencia` | Consultor | daria para abrir com `pa_saldo[]` e `pa_contribuicao[]` |
| Vídeos | `videos` | Consultor | |

## 3. Lacunas: o que o plano usa e a coleta não pega

1. **O cônjuge.** A coleta é de uma pessoa. O cônjuge não tem nome, nascimento, renda, seguros nem INSS, a não ser como
   dependente. Isso trava o resto: de quem é cada renda, os geradores de renda dos seguros e o IR do casal.
2. **As rendas da família.** Falta de quem é cada renda, se é certa ou estimada, os dias de recebimento e as mudanças
   previstas. A renda principal (`declaredincome`) não tem bruto, e a lista de renda ativa é de "outras fontes".
3. **A participação de cada um nas despesas.** Não existe. A pista é o custo de vida declarado, que é "somente o valor
   de sua responsabilidade". Daí sairia a % da renda de cada gerador nos seguros.
4. **As despesas linha a linha.** A coleta tem o total e itens soltos (aluguel, parcelas, prêmios, dependentes,
   previdência, compromissos). A ferramenta "Meu Orçamento" da plataforma (`/orcamentoideal`) pode ser a fonte, mas não
   foi aberta.
5. **As participações societárias e a empresa** (regime tributário, faturamento), para o pró-labore.
6. **O detalhe das dívidas e dos financiamentos**: crédito, parcelas contratadas e restantes, juros e situação.
7. **O plano de saúde**: as vidas, o prêmio de cada uma e quem paga.
8. **O INSS por invalidez e por morte** e a cobertura de responsabilidade civil profissional.

Há também repetições dentro da coleta:

- o imóvel da moradia (valor, saldo, parcela) e o mesmo imóvel na lista de bens;
- os totais declarados e as listas: `currentfinancialassets` × ativos financeiros, `currentassets` × bens,
  `currentliabilities` × financiamentos;
- a renda líquida principal (`declaredincome`) e a lista de renda ativa.

## 4. O que a coleta pega e o plano ainda não usa

- **Diagnósticos**: autoavaliação, frequência de poupança, acompanhamento do orçamento, clareza dos objetivos,
  validação profissional, estratégias de aposentadoria.
- **Perfil**: disposição e capacidade para risco, relação com o dinheiro, restrições de classe e de ativo,
  perpetuidade ou herança.
- **Detalhe dos ativos**: subclasse, indexador, emissor, vencimento, liquidez, prazo de resgate, ticker, preço médio,
  CNPJ, perfil e racional da carteira. Dá para calcular a escada de liquidez (repetição 4 do `VARIAVEIS.md`) e apoiar
  a ameaça de ruína.
- **Previdência**: a fechada inteira (contrapartida, vesting), regime e data de início da aberta, e as contribuições
  ao INSS.
- **Outros**: FGTS, gênero, bem de entrada dos objetivos, compromissos financeiros, coberturas e renovação das
  apólices, prêmios dos seguros, custo e tipo de dependência de cada dependente, anexos e tarefas.

## Não explorado

- **Montagem de relatório** (`/montagem`), a ferramenta atual da plataforma. Para abrir, é preciso trocar o cliente
  ativo da sessão, e isso foi barrado pelo controle de permissões.
- **Relatório da coleta** (`/coleta/relatorio?id=`), que precisa de uma coleta gravada.
- **Meu Orçamento** (`/orcamentoideal`).
- **A fórmula da nota do exame**, que fica no servidor (`saudeFinanceiraController`). Dá para inferir os pesos rodando
  "SIMULAR" com respostas de teste, sem gravar nada, ou pedir a fórmula a quem fez o exame.
- **As respostas do exame do cliente**, que o painel interno lê em `questionarioController` (`listAnswers`), ao que
  parece. O Nélio não tem nenhuma resposta gravada.
