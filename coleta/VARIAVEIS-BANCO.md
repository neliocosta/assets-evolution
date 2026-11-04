# Variáveis da coleta e do plano: tipo e tratamento no banco

Gerado por `node coleta/gerar-tabela.js` a partir de `coleta/esquema.js` (a parte 1) e escrito à mão (as partes 2 a 4).
Para o programador que vai levar a versão nova para a plataforma. Data: 2026-11-04.

## Como ler

- **Camadas.** Exame (o questionário de saúde financeira, amplo), coleta (a reunião, profunda), consultor (o que ele decide na
  montagem) e calculada (sai das outras). A resposta do exame, o campo da coleta e o campo do plano que dizem a mesma coisa são
  **uma variável só**: a camada mais funda vale, a mais rasa vira cálculo dela (`COLETA.md`, "uma mudança recalcula tudo").
- **O que gravar.** Só as variáveis de origem (exame, coleta, consultor). As calculadas (idade, totais, notas, status, aportes
  necessários, CET, saldo projetado) **não vão para o banco**: o motor recalcula a cada abertura. O que precisa ficar na história
  (a nota do exame numa data, a versão final de um plano apresentado) é uma **fotografia datada**, numa tabela de versões, e não é fonte de nada.
- **Rastreio.** Cada variável de origem guarda de onde veio (`origem`: exame, coleta, consultor ou proposta do cliente) e quando
  mudou (`atualizado_em`, `atualizado_por`). O plano gerado da coleta leva `origem.coleta.campos` (caminho no plano → `name` na coleta).
- **Tipos.** `name` é o nome do campo na coleta de produção (o mesmo no POST `/planejamentoController`). R$ em `decimal(14,2)`;
  % em `decimal(5,2)` de 0 a 100; mês em `AAAA-MM`; datas em `date`; opções fixas em `varchar` com os valores listados (ou enum).
  Sim/Não é `boolean` com `null` = não respondido. Todo campo da coleta é nulo até ser respondido: o rascunho grava parcial.
- **Novo.** Os campos marcados **novo** não existem na coleta de produção: são a proposta desta versão (`COLETA-E-MONTAGEM.md` diz o porquê de cada um).
- **Onde a coleta grava.** A coleta nova é o próprio portal no modo coleta (`tela-consultor.html?coleta`): cada campo grava direto no
  caminho da coluna "Onde cai no plano", no mesmo documento do plano que a montagem abre. Não há tabela de coleta separada do plano
  nem cópia: o `name` serve para migrar as coletas já feitas em produção (`coleta/plano.js`). Os fatos que nenhuma conta usa ficam
  em `coleta.*` dentro do plano (perfil, diagnóstico, dados pessoais, outros ativos, apólices, documentos, tarefas, anotações); o detalhe de um item que já existe no plano (o tipo e a observação do bem, a categoria do objetivo, o detalhe do fundo de pensão) fica no próprio item.

## 1. A coleta: 11 seções

Tabela principal `coleta` (uma linha por coleta: `id`, `cliente_id`, `consultor_id`, `status` rascunho|finalizado, `criado_em`, `atualizado_em`, `finalizado_em`),
com os campos soltos como colunas (ou um JSONB `respostas` com o `name` como chave, como o `submissao` de hoje) e uma tabela filha por lista
(`coleta_id`, `ordem`, e os campos do item). A ordem dos itens importa nas listas de objetivos (é a prioridade do cliente).

### 01 Objetivos financeiros

| Variável (`name`) | O que é | Tipo | Origem | Onde cai no plano | No banco |
|---|---|---|---|---|---|
| `hasobjective` | Tem objetivo financeiro claro? | Sim/Não | Exame (pergunta 4, a resposta em `exame.respostas`) → coleta (o detalhado) | coleta.diagnostico.objetivoClaro | boolean (null = não respondido); **not null** ao finalizar |
| `evaluateneededmoney` | Avaliou quanto precisa para o(s) objetivo(s)? | Sim/Não | Exame (pergunta 5, a resposta em `exame.respostas`) → coleta (o detalhado) | coleta.diagnostico.avaliouQuanto | boolean (null = não respondido); **not null** ao finalizar |
| `hasplanforobjective` | Tem plano concreto para atingir o objetivo? — Plano superficial = Não | Sim/Não | Exame (pergunta 6, a resposta em `exame.respostas`) → coleta (o detalhado) | coleta.diagnostico.temPlano | boolean (null = não respondido); **not null** ao finalizar |
| `estimatedmoneymonthly` | Quanto imagina precisar investir por mês para o objetivo — No exame o nome é estimatedmoneyneeded | R$ | Exame (pergunta 7, a resposta em `exame.respostas`) → coleta (o detalhado) | coleta.diagnostico.investirImagina | decimal(14,2), em reais; null = não informado; **not null** ao finalizar |
| `actualmoneydedicated` | Quanto está de fato investindo por mês para o objetivo | R$ | Exame (pergunta 8, a resposta em `exame.respostas`) → coleta (o detalhado) | calculada: soma de objectives[].planned (mostrada no Perfil; não se grava) | decimal(14,2), em reais; null = não informado; **not null** ao finalizar |
| **`objList`**  | **Lista de objetivos** | lista | Coleta | objectives[] (a ordem da lista vira objetivosOrdem) | tabela filha `coleta_objetivo` (`coleta_id`, `ordem`); a marca `objNaoPossui` é boolean na `coleta` |
| ↳ `obj_titulo` | Título do objetivo | texto curto | Coleta | objectives[].name | varchar(200) |
| ↳ `obj_categoria` | Categoria | uma opção: Compra de Casa, Compra de Veículo, Viagem, Intercâmbio, Aposentadoria Segura, Futuro dos Filhos, Casamento, Quitar Dívidas, Segurança Financeira, Outro | Coleta | objectives[].categoria (só a coleta mostra; o kind, consumo ou bem, continua no cartão) | varchar(60); valores: `Compra de Casa`, `Compra de Veículo`, `Viagem`, `Intercâmbio`, `Aposentadoria Segura`, `Futuro dos Filhos`, `Casamento`, `Quitar Dívidas`, `Segurança Financeira`, `Outro` |
| ↳ `obj_descricao` | Descrição (por que este objetivo importa) | texto longo | Coleta | objectives[].descricao (o propósito do objetivo na apresentação) | text |
| ↳ `obj_dataAlvo` | Mês alvo | mês (AAAA-MM) | Coleta | objectives[].months (calculado: meses a partir de hoje) | char(7) AAAA-MM, ou date no dia 1 |
| ↳ `obj_valorNecessario` | Valor necessário na data alvo | R$ | Coleta | objectives[].amount | decimal(14,2), em reais; null = não informado |
| ↳ `obj_custoTotal` | Custo total do objetivo — Parcial ou financiado | R$ | Coleta | objectives[].preco (o valor do bem) | decimal(14,2), em reais; null = não informado |
| ↳ `obj_comoComprar` | Como pretende comprar? — A montagem pergunta "Como vai comprar" no cartão do objetivo; é intenção do cliente, não decisão do consultor | uma opção: À vista, Entrada + financiamento, Consórcio | Coleta (**novo**) | objectives[].compra.modo | varchar(60); valores: `À vista`, `Entrada + financiamento`, `Consórcio` |
| ↳ `obj_temBemEntrada` | Tem bem de entrada? | Sim/Não | Coleta | "+ Financiar com patrimônio" no cartão do objetivo (o Sim/Não é a seção aberta) | boolean (null = não respondido) |
| ↳ `obj_bemEntradaDesc` | Qual bem? (só se `obj_temBemEntrada` = Sim) | texto curto | Coleta | patrimonio.bens[].venda.destinos (o bem vendido financia o objetivo) | varchar(200) |
| ↳ `obj_bemEntradaValor` | Valor do bem de entrada (só se `obj_temBemEntrada` = Sim) | R$ | Coleta | patrimonio.bens[].venda (o valor da venda do bem que financia o objetivo) | decimal(14,2), em reais; null = não informado |
| ↳ `obj_temCustoMensal` | Gera custo mensal após realização? | Sim/Não | Coleta | "+ Gasto depois de realizado" no cartão do objetivo (o Sim/Não é a seção aberta) | boolean (null = não respondido) |
| ↳ `obj_custoMensal` | Custo mensal após realização (só se `obj_temCustoMensal` = Sim) | R$ | Coleta | objectives[].costs[] (tipo fixo) | decimal(14,2), em reais; null = não informado |
| ↳ `obj_aporteMensal` | Quanto separar por mês para este objetivo | R$ | Coleta | objectives[].planned | decimal(14,2), em reais; null = não informado |
| ↳ `obj_temSaldo` | Já tem valor separado? | Sim/Não | Coleta | "+ Financiar com patrimônio" (objectives[].dedicated) | boolean (null = não respondido) |
| ↳ `obj_saldoAtual` | Saldo já separado (só se `obj_temSaldo` = Sim) | R$ | Coleta | objectives[].dedicated | decimal(14,2), em reais; null = não informado |
| ↳ `obj_planoAtual` | Plano atual do cliente para este objetivo | texto longo | Coleta | objectives[].planoAtual (só a coleta mostra) | text |
| ↳ `obj_obs` | Observações | texto longo | Coleta | objectives[].obs (só a coleta mostra) | text |
| **`comprList`**  | **Compromissos financeiros** — Saídas grandes com data (uma reforma, um imposto): saem do patrimônio financeiro no mês marcado | lista | Coleta | compromissos[] | tabela filha `coleta_compromisso` (`coleta_id`, `ordem`); a marca `comprNaoPossui` é boolean na `coleta` |
| ↳ `comp_titulo` | Título | texto curto | Coleta | compromissos[].titulo | varchar(200) |
| ↳ `comp_descricao` | Descrição | texto curto | Coleta | compromissos[].descricao | varchar(200) |
| ↳ `comp_data` | Mês | mês (AAAA-MM) | Coleta | compromissos[].em (calculado: meses a partir de hoje) | char(7) AAAA-MM, ou date no dia 1 |
| ↳ `comp_valor` | Valor | R$ | Coleta | compromissos[].valor | decimal(14,2), em reais; null = não informado |

### 02 Orçamento doméstico

| Variável (`name`) | O que é | Tipo | Origem | Onde cai no plano | No banco |
|---|---|---|---|---|---|
| `orcamentoModo` | Periodicidade do orçamento | uma opção: Mensal, Anual | Coleta | periodicidade | varchar(60); valores: `Mensal`, `Anual` |
| `declaredstandardofliving` | Valor do orçamento doméstico (custo de vida) — Somente o valor de sua responsabilidade | R$ | Exame (pergunta 28, a resposta em `exame.respostas`) → coleta (o detalhado) | riscos.reserva.custoVida (ajuste); a linha "Custo de vida" do Fluxo quando não há despesas listadas | decimal(14,2), em reais; null = não informado; **not null** ao finalizar |
| `recentsavingsfrequency` | Quantas vezes poupou esse valor nos últimos 12 meses? | uma opção: Nenhuma, 1-3, 4-6, 7-9, 10 ou mais | Exame (pergunta 3, a resposta em `exame.respostas`) → coleta (o detalhado) | orcamento.vezesPoupou | varchar(60); valores: `Nenhuma`, `1-3`, `4-6`, `7-9`, `10 ou mais`; **not null** ao finalizar |
| `doesbudgeting` | Acompanha as despesas mensais do orçamento doméstico? | uma opção: Sim em detalhes, Sim parcialmente, Não mas tenho ideia, Não faço ideia | Exame (pergunta 27, a resposta em `exame.respostas`) → coleta (o detalhado) | coleta.diagnostico.acompanhaOrcamento | varchar(60); valores: `Sim em detalhes`, `Sim parcialmente`, `Não mas tenho ideia`, `Não faço ideia`; **not null** ao finalizar |
| `declaredmonthlysavings` | Quanto poupa por mês em média? | R$ | Exame (pergunta 2, a resposta em `exame.respostas`) → coleta (o detalhado) | capacityOverride | decimal(14,2), em reais; null = não informado; **not null** ao finalizar |
| `pctDespesasTitular` | Quanto das despesas da família o titular custeia (%) — Lacuna 3 do COLETA.md: a % da renda de cada gerador nos seguros é hoje uma decisão subjetiva do consultor (só se `planoTipo` = Um casal ou uma família) | % | Coleta (**novo**) | riscos.seguro.geradores[].participacao (o cônjuge fica com o resto) | decimal(5,2), de 0 a 100 |
| **`despList`** **novo** | **Despesas da família, linha a linha** — Lacuna 4: a montagem pede cada despesa ao consultor; a coleta só tem o total. É o Orçamento (passo 2 da montagem) nascendo na reunião | lista | Coleta (**novo**) | expenses[] (uma linha do Fluxo por despesa) | tabela filha `coleta_despesa` (`coleta_id`, `ordem`); a marca `despNaoPossui` é boolean na `coleta` |
| ↳ `desp_nome` | Despesa | texto curto | Coleta | expenses[].label | varchar(200) |
| ↳ `desp_grupo` | Fixa ou ajustável? | uma opção: Fixa, Ajustável | Coleta | expenses[].group (fix \| adj) | varchar(60); valores: `Fixa`, `Ajustável` |
| ↳ `desp_valor` | Valor | R$ | Coleta | expenses[].steps[0].value | decimal(14,2), em reais; null = não informado |
| ↳ `desp_frequencia` | Frequência | uma opção: Mensal, Anual, Semanal | Coleta | expenses[].frequency | varchar(60); valores: `Mensal`, `Anual`, `Semanal` |
| ↳ `desp_mes` | Em que mês (se anual) (só se `desp_frequencia` = Anual) | uma opção: Janeiro, Fevereiro, Março, Abril, Maio, Junho, Julho, Agosto, Setembro, Outubro, Novembro, Dezembro | Coleta | expenses[].dates[].m | varchar(60); valores: `Janeiro`, `Fevereiro`, `Março`, `Abril`, `Maio`, `Junho`, `Julho`, `Agosto`, `Setembro`, `Outubro`, `Novembro`, `Dezembro` |
| ↳ `desp_obs` | Observações | texto curto | Coleta | expenses[].description (a mesma descrição da gaveta do Fluxo) | varchar(200) |

### 03 Ativos, patrimônio e dívidas

| Variável (`name`) | O que é | Tipo | Origem | Onde cai no plano | No banco |
|---|---|---|---|---|---|
| `currentfinancialassets` | Total de ativos financeiros — Sem imóveis e veículos | R$ | Exame (pergunta 9, a resposta em `exame.respostas`) → coleta (o detalhado) | exame.respostas.currentfinancialassets (a foto do exame); o plano usa a soma das listas, mostrada ao lado | decimal(14,2), em reais; null = não informado; **not null** ao finalizar |
| `currentreserve` | Quanto deste valor é reserva de emergência? | R$ | Exame (pergunta 10, a resposta em `exame.respostas`) → coleta (o detalhado) | riscos.reserva.atual | decimal(14,2), em reais; null = não informado; **not null** ao finalizar |
| `increasingreservemonthly` | Está guardando mensalmente para aumentar a reserva? | Sim/Não | Exame (pergunta 11, a resposta em `exame.respostas`) → coleta (o detalhado) | coleta.diagnostico.aumentaReserva | boolean (null = não respondido); **not null** ao finalizar |
| `estimatedreserve` | Valor ideal de reserva para o perfil do cliente | R$ | Exame (pergunta 12, a resposta em `exame.respostas`) → coleta (o detalhado) | riscos.reserva.alvo (vazio: o ideal calculado) | decimal(14,2), em reais; null = não informado; **not null** ao finalizar |
| `currentassetscategories` | Quais bens possui? | várias opções: Veículos, Casa, Apartamento, Imóveis Comerciais, Outros, Nenhum | Exame (pergunta 13, a resposta em `exame.respostas`) → coleta (o detalhado) | calculada: sai de patrimonio.bens[] (não se grava) | tabela filha (uma linha por opção marcada) ou array de varchar; valores: `Veículos`, `Casa`, `Apartamento`, `Imóveis Comerciais`, `Outros`, `Nenhum` |
| `currentassets` | Valor estimado total dos bens — Sem descontar financiamento | R$ | Exame (pergunta 15, a resposta em `exame.respostas`) → coleta (o detalhado) | exame.respostas.currentassets (a foto do exame); o plano usa a soma da lista, mostrada ao lado | decimal(14,2), em reais; null = não informado |
| **`ativoFinList`**  | **Ativos financeiros** | lista | Coleta | carteira.ativos[] (ativo a ativo) e patrimonio.financeiro[] (somados por instituição) | tabela filha `coleta_ativo_financeiro` (`coleta_id`, `ordem`); a marca `ativoFinNaoPossui` é boolean na `coleta` |
| ↳ `af_tipo` | Tipo do ativo | uma opção: Conta Corrente, Renda Fixa, Fundo, Renda Variável, Carteira Diversificada, Carteira de Renda Variável, Carteira de Fundos Imobiliários, Criptoativos, Alternativos, Outros | Coleta | carteira.ativos[].classe (por uma regra de classificação) | varchar(60); valores: `Conta Corrente`, `Renda Fixa`, `Fundo`, `Renda Variável`, `Carteira Diversificada`, `Carteira de Renda Variável`, `Carteira de Fundos Imobiliários`, `Criptoativos`, `Alternativos`, `Outros` |
| ↳ `af_titular` | De quem é — A montagem pede a titularidade de cada instituição (patrimonio.financeiro[].titularidade) e de cada ativo (carteira.ativos[].titular) | uma opção: Titular, Cônjuge, Conjunta | Coleta (**novo**) | carteira.ativos[].titular, patrimonio.financeiro[].titularidade | varchar(60); valores: `Titular`, `Cônjuge`, `Conjunta` |
| ↳ `af_saldo` | Saldo atual | R$ | Coleta | carteira.ativos[].valor → patrimonio.financeiro[].valor | decimal(14,2), em reais; null = não informado |
| ↳ `af_instituicao` | Instituição | texto curto | Coleta | carteira.ativos[].instituicao → patrimonio.financeiro[].nome | varchar(200) |
| ↳ `af_rf_subclasse` | Renda fixa: subclasse (só se `af_tipo` = Renda Fixa) | uma opção: Tesouro Selic, Tesouro IPCA+, Tesouro Pré, Tesouro Educa+, Tesouro Renda+, CDB/RDB, LCI/LCA, CRI/CRA, Debênture, LIG | Coleta | carteira.ativos[].subclasse | varchar(60); valores: `Tesouro Selic`, `Tesouro IPCA+`, `Tesouro Pré`, `Tesouro Educa+`, `Tesouro Renda+`, `CDB/RDB`, `LCI/LCA`, `CRI/CRA`, `Debênture`, `LIG` |
| ↳ `af_rf_indexador` | Renda fixa: indexador (só se `af_tipo` = Renda Fixa) | uma opção: % do CDI, CDI+, Pré, IPCA+, Dólar+ | Coleta | carteira.ativos[].classe (pós, pré ou inflação) | varchar(60); valores: `% do CDI`, `CDI+`, `Pré`, `IPCA+`, `Dólar+` |
| ↳ `af_rf_emissor` | Renda fixa: emissor (só se `af_tipo` = Renda Fixa) | texto curto | Coleta | carteira.ativos[] como na montagem (a Carteira atual, colada do extrato) | varchar(200) |
| ↳ `af_rf_rentabilidade` | Renda fixa: rentabilidade (só se `af_tipo` = Renda Fixa) | texto curto | Coleta | carteira.ativos[] como na montagem (a Carteira atual, colada do extrato) | varchar(200) |
| ↳ `af_rf_dataAplicacao` | Renda fixa: data da aplicação (só se `af_tipo` = Renda Fixa) | data | Coleta | carteira.ativos[] como na montagem (a Carteira atual, colada do extrato) | date |
| ↳ `af_rf_prazo` | Renda fixa: vencimento (só se `af_tipo` = Renda Fixa) | data | Coleta | carteira.ativos[].vencimento | date |
| ↳ `af_rf_liquidez` | Renda fixa: liquidez (só se `af_tipo` = Renda Fixa) | uma opção: Sim, Não, Após 30 dias, Após 60 dias, Após 120 dias | Coleta | riscos.liquidez (a escada de D+0 a 1 ano, calculável) | varchar(60); valores: `Sim`, `Não`, `Após 30 dias`, `Após 60 dias`, `Após 120 dias` |
| ↳ `af_fn_subclasse` | Fundo: subclasse (só se `af_tipo` = Fundo) | uma opção: Liquidez, Renda Fixa, Multimercado, Ações Brasil, Ações Global, Cambial | Coleta | carteira.ativos[].classe | varchar(60); valores: `Liquidez`, `Renda Fixa`, `Multimercado`, `Ações Brasil`, `Ações Global`, `Cambial` |
| ↳ `af_fn_nome` | Fundo: nome (só se `af_tipo` = Fundo) | texto curto | Coleta | carteira.ativos[].nome | varchar(200) |
| ↳ `af_fn_cnpj` | Fundo: CNPJ (só se `af_tipo` = Fundo) | texto curto | Coleta | carteira.ativos[] como na montagem (a Carteira atual, colada do extrato) | varchar(200) |
| ↳ `af_fn_dataAplicacao` | Fundo: data da aplicação (só se `af_tipo` = Fundo) | data | Coleta | carteira.ativos[] como na montagem (a Carteira atual, colada do extrato) | date |
| ↳ `af_fn_prazoResgate` | Fundo: prazo de resgate (dias) (só se `af_tipo` = Fundo) | número | Coleta | carteira.ativos[].vencimento (D+n) → riscos.liquidez | integer |
| ↳ `af_rv_subclasse` | Renda variável: subclasse (só se `af_tipo` = Renda Variável) | uma opção: Ações Brasil, Derivativos, Ações Internacionais, FII, ETFs, FIAGRO, FI-Infra, BDRs, Commodities, Câmbio | Coleta | carteira.ativos[].classe | varchar(60); valores: `Ações Brasil`, `Derivativos`, `Ações Internacionais`, `FII`, `ETFs`, `FIAGRO`, `FI-Infra`, `BDRs`, `Commodities`, `Câmbio` |
| ↳ `af_rv_ticker` | Renda variável: ticker (só se `af_tipo` = Renda Variável) | texto curto | Coleta | carteira.ativos[].nome | varchar(200) |
| ↳ `af_rv_precoMedio` | Renda variável: preço médio (só se `af_tipo` = Renda Variável) | R$ | Coleta | carteira.ativos[] como na montagem (a Carteira atual, colada do extrato) | decimal(14,2), em reais; null = não informado |
| ↳ `af_rv_dataAplicacao` | Renda variável: data da compra (só se `af_tipo` = Renda Variável) | data | Coleta | carteira.ativos[] como na montagem (a Carteira atual, colada do extrato) | date |
| ↳ `af_cd_perfil` | Carteira: perfil de risco (só se `af_tipo` = Carteira Diversificada) | uma opção: Conservadora, Moderada, Arrojada, Agressiva | Coleta | diagnostico.perfil.presente (apoio) | varchar(60); valores: `Conservadora`, `Moderada`, `Arrojada`, `Agressiva` |
| ↳ `af_cart_racional` | Carteira: racional (só se `af_tipo` = Carteira Diversificada) | várias opções: Convicções próprias, Instituição Financeira, Casa de Análise | Coleta | coleta.carteira.racional.<proprias, instituicao, casaAnalise> (uma marca por opção) e coleta.carteira.racionalObs, no bloco "Quem montou a carteira" da Carteira atual (só na coleta); não é carteira.justificativa, que é o porquê da recomendação | tabela filha (uma linha por opção marcada) ou array de varchar; valores: `Convicções próprias`, `Instituição Financeira`, `Casa de Análise` |
| ↳ `af_obs` | Outros detalhes | texto longo | Coleta | carteira.ativos[].obs | text |
| **`bensList`**  | **Bens** | lista | Coleta | patrimonio.bens[] | tabela filha `coleta_bem` (`coleta_id`, `ordem`); a marca `bensNaoPossui` é boolean na `coleta` |
| ↳ `bem_tipo` | Tipo do bem | uma opção: Casa, Apartamento, Imóvel Comercial, Terreno, Carro, Moto, Outro | Coleta | patrimonio.bens[].tipo (Casa, Apartamento, Imóvel Comercial, Terreno, Carro, Moto, Outro); decide as coberturas do seguro | varchar(60); valores: `Casa`, `Apartamento`, `Imóvel Comercial`, `Terreno`, `Carro`, `Moto`, `Outro` |
| ↳ `bem_descricao` | Descrição | texto curto | Coleta | bens[].nome | varchar(200) |
| ↳ `bem_valor` | Valor estimado atual | R$ | Coleta | bens[].mercado | decimal(14,2), em reais; null = não informado |
| ↳ `bem_titular` | De quem é — A coleta pergunta "compartilhado?" sem dizer com quem; a montagem precisa da titularidade (titular, cônjuge, casal, outros) | uma opção: Titular, Cônjuge, Do casal, Dividido com outras pessoas | Coleta (**novo**) | bens[].titularidade | varchar(60); valores: `Titular`, `Cônjuge`, `Do casal`, `Dividido com outras pessoas` |
| ↳ `bem_compartilhado` | Compartilhado com outra pessoa? | Sim/Não | Coleta | bens[].titularidade | boolean (null = não respondido) |
| ↳ `bem_percentual` | Percentual do cliente (%) (só se `bem_compartilhado` = Sim) | % | Coleta | bens[].titularPct | decimal(5,2), de 0 a 100 |
| ↳ `bem_percentualConjuge` | Percentual do cônjuge (%) — O que falta para 100% é de outros (irmãos, sócios) (só se `bem_compartilhado` = Sim) | % | Coleta (**novo**) | bens[].conjugePct | decimal(5,2), de 0 a 100 |
| ↳ `bem_quitado` | Quitado? | Sim/Não | Coleta | bens[].saldoDevedor zero ou não | boolean (null = não respondido) |
| ↳ `bem_saldoDevedor` | Saldo devedor (só se `bem_quitado` = Não) | R$ | Coleta | bens[].saldoDevedor | decimal(14,2), em reais; null = não informado |
| ↳ `bem_parcela` | Parcela mensal (só se `bem_quitado` = Não) | R$ | Coleta | bens[].parcela (e a linha "Parcela: nome" do Fluxo) | decimal(14,2), em reais; null = não informado |
| ↳ `bem_credito` | Valor financiado (crédito liberado) — Lacuna 6: o contrato do financiamento (a montagem calcula CET, saldo pelo contrato e quitação) (só se `bem_quitado` = Não) | R$ | Coleta (**novo**) | bens[].credito | decimal(14,2), em reais; null = não informado |
| ↳ `bem_parcelasContratadas` | Parcelas contratadas (só se `bem_quitado` = Não) | número | Coleta (**novo**) | bens[].parcelas | integer |
| ↳ `bem_primeiraParcela` | Mês da 1ª parcela (só se `bem_quitado` = Não) | mês (AAAA-MM) | Coleta (**novo**) | bens[].inicio (as parcelas restantes são calculadas) | char(7) AAAA-MM, ou date no dia 1 |
| ↳ `bem_juros` | Juros (% ao ano) (só se `bem_quitado` = Não) | % | Coleta (**novo**) | bens[].juros | decimal(5,2), de 0 a 100 |
| ↳ `bem_sistema` | Sistema (só se `bem_quitado` = Não) | uma opção: SAC, Price, Não sabe | Coleta (**novo**) | bens[].sistema | varchar(60); valores: `SAC`, `Price`, `Não sabe` |
| ↳ `bem_situacao` | Situação (só se `bem_quitado` = Não) | uma opção: Em dia, Em atraso | Coleta (**novo**) | bens[].situacao | varchar(60); valores: `Em dia`, `Em atraso` |
| ↳ `bem_geraRenda` | Gera renda passiva? | Sim/Não | Coleta | patrimonio.bens[].renda (a renda ligada ao bem; sem ligação, não gera) | boolean (null = não respondido) |
| ↳ `bem_rendaPassiva` | Renda mensal (líquida) (só se `bem_geraRenda` = Sim) | R$ | Coleta | bens[].renda → a linha de renda passiva do Fluxo | decimal(14,2), em reais; null = não informado |
| ↳ `bem_pensaVender` | Pensa em vender este bem? — A venda planejada é pedida na montagem; a intenção é do cliente, o líquido é calculado | Sim/Não | Coleta (**novo**) | bens[].venda | boolean (null = não respondido) |
| ↳ `bem_vendaQuando` | Quando (mês) (só se `bem_pensaVender` = Sim) | mês (AAAA-MM) | Coleta (**novo**) | bens[].venda.em | char(7) AAAA-MM, ou date no dia 1 |
| ↳ `bem_vendaValor` | Por quanto (vazio: o valor projetado) (só se `bem_pensaVender` = Sim) | R$ | Coleta (**novo**) | bens[].venda.preco | decimal(14,2), em reais; null = não informado |
| ↳ `bem_obs` | Observações | texto longo | Coleta | patrimonio.bens[].obs (só a coleta mostra) | text |
| **`outrosAtivosList`**  | **Outros ativos** | lista | Coleta | coleta.outrosAtivos[] (fora das somas do patrimônio; uma empresa vai para a lista de participações, abaixo) | tabela filha `coleta_outro_ativo` (`coleta_id`, `ordem`); a marca `outrosAtivosNaoPossui` é boolean na `coleta` |
| ↳ `oa_titulo` | Título | texto curto | Coleta | coleta.outrosAtivos[].titulo | varchar(200) |
| ↳ `oa_valor` | Valor | R$ | Coleta | coleta.outrosAtivos[].valor (fora das somas do patrimônio) | decimal(14,2), em reais; null = não informado |
| ↳ `oa_descricao` | Descrição | texto curto | Coleta | coleta.outrosAtivos[].descricao | varchar(200) |
| ↳ `oa_geraRenda` | Gera renda? | Sim/Não | Coleta | coleta.outrosAtivos[].geraRenda | boolean (null = não respondido) |
| ↳ `oa_obs` | Observações | texto longo | Coleta | coleta.outrosAtivos[].obs | text |
| **`participacoesList`** **novo** | **Participações societárias (empresas)** — Lacuna 5: a montagem pede empresa, regime tributário, faturamento e pró-labore ao consultor (sócios da Otimização tributária) | lista | Coleta (**novo**) | patrimonio.participacoes[] e tributario.prolabore.socios[] | tabela filha `coleta_participacao` (`coleta_id`, `ordem`); a marca `participacoesNaoPossui` é boolean na `coleta` |
| ↳ `part_empresa` | Empresa | texto curto | Coleta | participacoes[].nome, socios[].empresa | varchar(200) |
| ↳ `part_socio` | Quem é o sócio | uma opção: Titular, Cônjuge | Coleta | socios[].quem | varchar(60); valores: `Titular`, `Cônjuge` |
| ↳ `part_pct` | Participação do cliente (%) | % | Coleta | patrimonio.participacoes[].pct (só a coleta mostra) | decimal(5,2), de 0 a 100 |
| ↳ `part_valor` | Valor estimado da participação | R$ | Coleta | participacoes[].valor | decimal(14,2), em reais; null = não informado |
| ↳ `part_regime` | Regime tributário | uma opção: Simples Nacional, Lucro Presumido, Lucro Real, MEI | Coleta | socios[].regime | varchar(60); valores: `Simples Nacional`, `Lucro Presumido`, `Lucro Real`, `MEI` |
| ↳ `part_faturamento` | Faturamento anual | R$ | Coleta | socios[].faturamento | decimal(14,2), em reais; null = não informado |
| ↳ `part_prolabore` | Pró-labore mensal (bruto) | R$ | Coleta | incomes[] (Pró-labore) | decimal(14,2), em reais; null = não informado |
| ↳ `part_dividendos` | Distribuição de lucros mensal (média) | R$ | Coleta | incomes[] (Distribuição de lucros) | decimal(14,2), em reais; null = não informado |
| ↳ `part_pensaVender` | Pensa em vender a participação? | Sim/Não | Coleta | participacoes[].venda | boolean (null = não respondido) |
| `hasdebts` | Possui outras dívidas? — Além dos financiamentos | Sim/Não | Exame (pergunta 17, a resposta em `exame.respostas`) → coleta (o detalhado) | Não: coleta.naoTem.dividas | boolean (null = não respondido); **not null** ao finalizar |
| `currentliabilities` | Saldo devedor total (dívidas + financiamentos) | R$ | Exame (pergunta 18, a resposta em `exame.respostas`) → coleta (o detalhado) | exame.respostas.currentliabilities (a foto do exame); o plano usa a soma das listas, mostrada ao lado | decimal(14,2), em reais; null = não informado; **not null** ao finalizar |
| **`dividasList`** **novo** | **Dívidas, uma a uma** — Lacuna 6: a coleta tem só o total; a montagem lista cada dívida com o contrato (patrimonio.dividas[]) | lista | Coleta (**novo**) | patrimonio.dividas[] | tabela filha `coleta_divida` (`coleta_id`, `ordem`); a marca `dividasNaoPossui` é boolean na `coleta` |
| ↳ `div_nome` | Dívida | texto curto | Coleta | dividas[].nome | varchar(200) |
| ↳ `div_tipo` | Tipo | uma opção: Cartão de crédito, Cheque especial, Empréstimo pessoal, Consignado, Financiamento de veículo, Consórcio, Empréstimo com pessoa, Outro | Coleta | dividas[].modalidade (consórcio) e juros padrão | varchar(60); valores: `Cartão de crédito`, `Cheque especial`, `Empréstimo pessoal`, `Consignado`, `Financiamento de veículo`, `Consórcio`, `Empréstimo com pessoa`, `Outro` |
| ↳ `div_credor` | Credor | texto curto | Coleta | patrimonio.dividas[].credor (só a coleta mostra) | varchar(200) |
| ↳ `div_saldoDevedor` | Saldo devedor hoje | R$ | Coleta | dividas[].saldoDevedor | decimal(14,2), em reais; null = não informado |
| ↳ `div_parcela` | Parcela mensal | R$ | Coleta | dividas[].parcela | decimal(14,2), em reais; null = não informado |
| ↳ `div_parcelasRestantes` | Parcelas restantes | número | Coleta | dividas[].restantes | integer |
| ↳ `div_juros` | Juros (% ao mês) | % | Coleta | dividas[].juros (jurosPeriodo: mes) | decimal(5,2), de 0 a 100 |
| ↳ `div_situacao` | Situação | uma opção: Em dia, Em atraso | Coleta | dividas[].situacao | varchar(60); valores: `Em dia`, `Em atraso` |

### 04 Proteção

| Variável (`name`) | O que é | Tipo | Origem | Onde cai no plano | No banco |
|---|---|---|---|---|---|
| `seg_auto_protegido` | Automóvel: protegido? | Sim/Não | Coleta | bens[].protecao do carro | boolean (null = não respondido) |
| `seg_auto_seguradora` | Seguradora (só se `seg_auto_protegido` = Sim) | texto curto | Coleta | bens[].apolice.seguradora | varchar(200) |
| `seg_auto_bem` | Bem segurado (só se `seg_auto_protegido` = Sim) | texto curto | Coleta | o próprio bem (patrimonio.bens[], tipo Carro ou Moto) | varchar(200) |
| `seg_auto_cobIncendio` | Cobertura incêndio/roubo/colisão (só se `seg_auto_protegido` = Sim) | texto curto | Coleta | patrimonio.bens[].apolice.casco | varchar(200) |
| `seg_auto_cobAPP` | Cobertura APP (só se `seg_auto_protegido` = Sim) | texto curto | Coleta | patrimonio.bens[].apolice.app | varchar(200) |
| `seg_auto_cobRCVF` | Cobertura RCV-F (danos a terceiros) (só se `seg_auto_protegido` = Sim) | R$ | Coleta | patrimonio.bens[].apolice.rcfMateriais e .rcfCorporais (e .danosMorais) | decimal(14,2), em reais; null = não informado |
| `seg_auto_premio` | Prêmio anual (só se `seg_auto_protegido` = Sim) | R$ | Coleta | patrimonio.bens[].apolice.premio (o carro); a despesa no Orçamento | decimal(14,2), em reais; null = não informado |
| `seg_auto_mesRenovacao` | Mês de renovação (só se `seg_auto_protegido` = Sim) | uma opção: Janeiro, Fevereiro, Março, Abril, Maio, Junho, Julho, Agosto, Setembro, Outubro, Novembro, Dezembro | Coleta | patrimonio.bens[].apolice.renovacao (1 a 12) | varchar(60); valores: `Janeiro`, `Fevereiro`, `Março`, `Abril`, `Maio`, `Junho`, `Julho`, `Agosto`, `Setembro`, `Outubro`, `Novembro`, `Dezembro` |
| `seg_auto_obs` | Observações (só se `seg_auto_protegido` = Sim) | texto longo | Coleta | patrimonio.bens[].apolice.obs | text |
| `seg_res_protegido` | Residencial: protegido? | Sim/Não | Coleta | bens[].protecao do imóvel | boolean (null = não respondido) |
| `seg_res_seguradora` | Seguradora (só se `seg_res_protegido` = Sim) | texto curto | Coleta | bens[].apolice.seguradora | varchar(200) |
| `seg_res_imovel` | Imóvel segurado (só se `seg_res_protegido` = Sim) | texto curto | Coleta | o próprio bem (patrimonio.bens[], tipo Casa, Apartamento, Imóvel Comercial ou Terreno) | varchar(200) |
| `seg_res_cobIncendio` | Cobertura incêndio (só se `seg_res_protegido` = Sim) | texto curto | Coleta | patrimonio.bens[].apolice.incendio | varchar(200) |
| `seg_res_cobDanosEletricos` | Cobertura danos elétricos (só se `seg_res_protegido` = Sim) | texto curto | Coleta | patrimonio.bens[].apolice.danosEletricos | varchar(200) |
| `seg_res_cobSubtracao` | Cobertura subtração de bens (só se `seg_res_protegido` = Sim) | texto curto | Coleta | patrimonio.bens[].apolice.subtracao | varchar(200) |
| `seg_res_cobRCFamiliar` | Cobertura RC familiar (só se `seg_res_protegido` = Sim) | R$ | Coleta | patrimonio.bens[].apolice.rcFamiliar | decimal(14,2), em reais; null = não informado |
| `seg_res_premio` | Prêmio anual (só se `seg_res_protegido` = Sim) | R$ | Coleta | patrimonio.bens[].apolice.premio (o imóvel); a despesa no Orçamento | decimal(14,2), em reais; null = não informado |
| `seg_res_mesRenovacao` | Mês de renovação (só se `seg_res_protegido` = Sim) | uma opção: Janeiro, Fevereiro, Março, Abril, Maio, Junho, Julho, Agosto, Setembro, Outubro, Novembro, Dezembro | Coleta | patrimonio.bens[].apolice.renovacao (1 a 12) | varchar(60); valores: `Janeiro`, `Fevereiro`, `Março`, `Abril`, `Maio`, `Junho`, `Julho`, `Agosto`, `Setembro`, `Outubro`, `Novembro`, `Dezembro` |
| `seg_res_obs` | Observações (só se `seg_res_protegido` = Sim) | texto longo | Coleta | patrimonio.bens[].apolice.obs | text |
| `seg_rcprof_protegido` | Responsabilidade civil profissional: tem seguro? — Lacuna 8: a montagem avalia a RC profissional em danos a terceiros e a coleta não pergunta | Sim/Não | Coleta (**novo**) | riscos.terceiros.itens[Responsabilidade civil profissional] | boolean (null = não respondido) |
| `seg_rcprof_valorCoberto` | Valor coberto (só se `seg_rcprof_protegido` = Sim) | R$ | Coleta (**novo**) | riscos.terceiros.itens[].atual | decimal(14,2), em reais; null = não informado |
| **`segVidaList`**  | **Seguro de vida** — Na coleta atual é um bloco só, do titular (seg_vida_*); aqui é uma linha por pessoa segurada | lista | Coleta | riscos.seguro.geradores[].coberturaVida | tabela filha `coleta_seguro_vida` (`coleta_id`, `ordem`); a marca `seg_vida_protegido` é boolean na `coleta` |
| ↳ `seg_vida_pessoa` | Pessoa segurada — Lacuna 1: o cônjuge não tem seguros na coleta | uma opção: Titular, Cônjuge | Coleta (**novo**) | geradores[].pessoa | varchar(60); valores: `Titular`, `Cônjuge` |
| ↳ `seg_vida_seguradora` | Seguradora | texto curto | Coleta | coleta.apolices[].seguradora | varchar(200) |
| ↳ `seg_vida_valorCoberto` | Valor coberto | R$ | Coleta | coleta.apolices[].coberturas[].valor (tipo morte); a soma por pessoa é geradores[].coberturaVida | decimal(14,2), em reais; null = não informado |
| ↳ `seg_vida_premio` | Prêmio mensal | R$ | Coleta | coleta.apolices[].coberturas[].premio (no período de coleta.apolices[].periodicidade) | decimal(14,2), em reais; null = não informado |
| ↳ `seg_vida_tipo` | Tipo | uma opção: Anual, Termo, Vitalício | Coleta | coleta.apolices[].coberturas[].vigencia (Anual → anual, Termo → prazo, Vitalício → vitalicia) | varchar(60); valores: `Anual`, `Termo`, `Vitalício` |
| ↳ `seg_vida_prazoCobertura` | Prazo de cobertura | texto curto | Coleta | coleta.apolices[].coberturas[].vigenciaPrazo | varchar(200) |
| ↳ `seg_vida_obs` | Observações | texto longo | Coleta | coleta.apolices[].obs | text |
| **`segAcidList`**  | **Seguro de acidentes pessoais (invalidez)** | lista | Coleta | riscos.seguro.geradores[].coberturaInvalidez | tabela filha `coleta_seguro_acidentes` (`coleta_id`, `ordem`); a marca `seg_acid_protegido` é boolean na `coleta` |
| ↳ `seg_acid_pessoa` | Pessoa segurada | uma opção: Titular, Cônjuge | Coleta (**novo**) | geradores[].pessoa | varchar(60); valores: `Titular`, `Cônjuge` |
| ↳ `seg_acid_seguradora` | Seguradora | texto curto | Coleta | coleta.apolices[].seguradora | varchar(200) |
| ↳ `seg_acid_valorCoberto` | Valor coberto | R$ | Coleta | coleta.apolices[].coberturas[].valor (tipo ipa); a soma por pessoa é geradores[].coberturaInvalidez | decimal(14,2), em reais; null = não informado |
| ↳ `seg_acid_premio` | Prêmio mensal | R$ | Coleta | coleta.apolices[].coberturas[].premio | decimal(14,2), em reais; null = não informado |
| ↳ `seg_acid_obs` | Observações | texto longo | Coleta | coleta.apolices[].obs | text |
| `seg_saude_protegido` | Plano de saúde: tem? | Sim/Não | Coleta | Não: coleta.naoTem.saude; Sim: as vidas em riscos.saude.vidas[] | boolean (null = não respondido) |
| `seg_saude_tipo` | Tipo de plano (só se `seg_saude_protegido` = Sim) | uma opção: Pela Empresa, PME, Empresarial, Adesão, Familiar | Coleta | riscos.saude.tipo | varchar(60); valores: `Pela Empresa`, `PME`, `Empresarial`, `Adesão`, `Familiar` |
| `seg_saude_operadora` | Operadora (só se `seg_saude_protegido` = Sim) | texto curto | Coleta | riscos.saude.operadora (operadora e plano num campo) | varchar(200) |
| `seg_saude_nomePlano` | Nome do plano (só se `seg_saude_protegido` = Sim) | texto curto | Coleta | riscos.saude.operadora (junto com a operadora) | varchar(200) |
| **`saudeVidasList`** **novo** | **Vidas no plano de saúde** — Lacuna 7: a montagem pede cada vida, o prêmio e quem paga | lista | Coleta (**novo**) | riscos.saude.vidas[] | tabela filha `coleta_saude_vida` (`coleta_id`, `ordem`); só se `seg_saude_protegido` = Sim |
| ↳ `sv_quem` | Quem | uma opção: Titular, Cônjuge, Dependente | Coleta | saude.vidas[].nome e idade (ligadas às pessoas da família) | varchar(60); valores: `Titular`, `Cônjuge`, `Dependente` |
| ↳ `sv_nome` | Nome (se dependente) (só se `sv_quem` = Dependente) | texto curto | Coleta | saude.vidas[].nome | varchar(200) |
| ↳ `sv_premio` | Prêmio mensal desta vida | R$ | Coleta | saude.vidas[].premio | decimal(14,2), em reais; null = não informado |
| ↳ `sv_pagador` | Quem paga | uma opção: A família, A empresa ou outra pessoa | Coleta | saude.vidas[].pagador | varchar(60); valores: `A família`, `A empresa ou outra pessoa` |

### 05 Aposentadoria

| Variável (`name`) | O que é | Tipo | Origem | Onde cai no plano | No banco |
|---|---|---|---|---|---|
| `startingworkingage` | Idade em que começou a trabalhar | número | Exame (pergunta 19, a resposta em `exame.respostas`) → coleta (o detalhado) | patrimonio.comecou | integer; **not null** ao finalizar |
| `retiringtargetage` | Pretende trabalhar até qual idade? | número | Exame (pergunta 20, a resposta em `exame.respostas`) → coleta (o detalhado) | retireAge | integer; **not null** ao finalizar |
| `conjugeStartingWorkingAge` | Cônjuge: idade em que começou a trabalhar — Lacuna 1: a fase da vida é de cada pessoa (só se `planoTipo` = Um casal ou uma família) | número | Coleta (**novo**) | patrimonio.conjugeComecou | integer |
| `conjugeRetiringTargetAge` | Cônjuge: pretende trabalhar até qual idade? — A liberdade começa quando o primeiro para (só se `planoTipo` = Um casal ou uma família) | número | Coleta (**novo**) | spouseRetireAge | integer |
| `rendaDesejadaAposentadoria` | Renda desejada na aposentadoria (por mês, em valores de hoje) | R$ | Coleta | desired | decimal(14,2), em reais; null = não informado |
| `hasretiringstrategies` | Tem plano concreto de onde virá a renda? | Sim/Não | Exame (pergunta 21, a resposta em `exame.respostas`) → coleta (o detalhado) | coleta.aposentadoria.temPlano | boolean (null = não respondido); **not null** ao finalizar |
| `currentretiringstrategies` | Qual seria o plano? (só se `hasretiringstrategies` = Sim) | várias opções: Pensão pública (INSS/RPPS), Pensão privada, Investimentos | Exame (pergunta 22, a resposta em `exame.respostas`) → coleta (o detalhado) | coleta.aposentadoria.fontes.<publica\|privada\|investimentos\|imoveis> (uma marca por opção) | tabela filha (uma linha por opção marcada) ou array de varchar; valores: `Pensão pública (INSS/RPPS)`, `Pensão privada`, `Investimentos` |
| `executingretiringstrategies` | O que está executando hoje? (só se `hasretiringstrategies` = Sim) | várias opções: INSS, Previdência da empresa, Investimentos ou previdência privada | Exame (pergunta 23, a resposta em `exame.respostas`) → coleta (o detalhado) | coleta.aposentadoria.executa.<publica\|empresa\|privada> (uma marca por opção) | tabela filha (uma linha por opção marcada) ou array de varchar; valores: `INSS`, `Previdência da empresa`, `Investimentos ou previdência privada` |
| `prevPublicaTipo` | Tipo de previdência pública | uma opção: INSS, RPPS, Nenhuma | Coleta | coleta.prevPublica.titular.tipo (inss, rpps, nenhuma); com benefício, uma renda em passive[] (origin "Contribuições previdenciárias", pessoa titular) | varchar(60); valores: `INSS`, `RPPS`, `Nenhuma` |
| `prevPublicaIdadeBeneficio` | Idade estimada para receber o benefício | número | Coleta | passive[].startMi (calculado da idade) | integer |
| `prevPublicaValorBeneficio` | Valor estimado do benefício (mensal) | R$ | Coleta | passive[].net | decimal(14,2), em reais; null = não informado |
| `prevPublicaInvalidez` | Benefício estimado por invalidez (mensal) — Lacuna 8: os seguros descontam o INSS por invalidez e por morte | R$ | Coleta (**novo**) | riscos.seguro.geradores[titular].inssInvalidez | decimal(14,2), em reais; null = não informado |
| `prevPublicaMorte` | Pensão por morte estimada (mensal) | R$ | Coleta (**novo**) | riscos.seguro.geradores[titular].inssMorte | decimal(14,2), em reais; null = não informado |
| `prevPublicaDataInicio` | Primeira contribuição (mês) | mês (AAAA-MM) | Coleta | coleta.prevPublica.titular.inicio ("AAAA-MM") | char(7) AAAA-MM, ou date no dia 1 |
| `prevPublicaNContrib` | Número de contribuições | número | Coleta | coleta.prevPublica.titular.nContrib | integer |
| `prevPublicaValorMedioContrib` | Valor médio das contribuições | R$ | Coleta | coleta.prevPublica.titular.valorMedio | decimal(14,2), em reais; null = não informado |
| `prevPublicaValorAtualContrib` | Valor atual da contribuição | R$ | Coleta | coleta.prevPublica.titular.valorAtual | decimal(14,2), em reais; null = não informado |
| `prevPublicaObs` | Observações (RPPS) | texto longo | Coleta | coleta.prevPublica.titular.obs (o mesmo para o cônjuge, em coleta.prevPublica.conjuge) | text |
| `conjugePrevPublicaTipo` | Cônjuge: tipo de previdência pública (só se `planoTipo` = Um casal ou uma família) | uma opção: INSS, RPPS, Nenhuma | Coleta (**novo**) | coleta.prevPublica.conjuge.tipo; a renda em passive[] com pessoa conjuge | varchar(60); valores: `INSS`, `RPPS`, `Nenhuma` |
| `conjugePrevPublicaIdadeBeneficio` | Cônjuge: idade estimada do benefício (só se `planoTipo` = Um casal ou uma família) | número | Coleta (**novo**) | passive[].startMi | integer |
| `conjugePrevPublicaValorBeneficio` | Cônjuge: valor estimado do benefício (só se `planoTipo` = Um casal ou uma família) | R$ | Coleta (**novo**) | passive[].net | decimal(14,2), em reais; null = não informado |
| `conjugePrevPublicaInvalidez` | Cônjuge: benefício por invalidez (só se `planoTipo` = Um casal ou uma família) | R$ | Coleta (**novo**) | geradores[conjuge].inssInvalidez | decimal(14,2), em reais; null = não informado |
| `conjugePrevPublicaMorte` | Cônjuge: pensão por morte (só se `planoTipo` = Um casal ou uma família) | R$ | Coleta (**novo**) | geradores[conjuge].inssMorte | decimal(14,2), em reais; null = não informado |
| **`prevFechadaList`**  | **Previdência fechada (fundo de pensão)** | lista | Coleta | patrimonio.financeiro[] com tipo fechada (a caixa à parte, conv) | tabela filha `coleta_prev_fechada` (`coleta_id`, `ordem`); a marca `prevFechadaNaoPossui` é boolean na `coleta` |
| ↳ `pf_pessoa` | De quem é | uma opção: Titular, Cônjuge | Coleta (**novo**) | financeiro[].titularidade | varchar(60); valores: `Titular`, `Cônjuge` |
| ↳ `pf_entidade` | Entidade | texto curto | Coleta | financeiro[].nome | varchar(200) |
| ↳ `pf_tipo` | Tipo | uma opção: PGBL, Fundo de Pensão | Coleta | financeiro[].tipo | varchar(60); valores: `PGBL`, `Fundo de Pensão` |
| ↳ `pf_regime` | Regime | uma opção: Regressivo, Progressivo | Coleta | patrimonio.financeiro[].detalhe.regime | varchar(60); valores: `Regressivo`, `Progressivo` |
| ↳ `pf_nomeFundo` | Nome do fundo | texto curto | Coleta | patrimonio.financeiro[].detalhe.nomeFundo | varchar(200) |
| ↳ `pf_cnpj` | CNPJ | texto curto | Coleta | patrimonio.financeiro[].detalhe.cnpj | varchar(200) |
| ↳ `pf_perfilRisco` | Perfil de risco | uma opção: Conservador, Moderado, Arrojado, Agressivo | Coleta | patrimonio.financeiro[].detalhe.perfil | varchar(60); valores: `Conservador`, `Moderado`, `Arrojado`, `Agressivo` |
| ↳ `pf_contribuicao` | Contribuição mensal | R$ | Coleta | financeiro[].conv.contribPessoa (e a despesa no Fluxo) | decimal(14,2), em reais; null = não informado |
| ↳ `pf_contrapartida` | Contrapartida do patrocinador (mensal) | R$ | Coleta | financeiro[].conv.contribPatroc | decimal(14,2), em reais; null = não informado |
| ↳ `pf_saldo` | Saldo atual | R$ | Coleta | financeiro[].valor | decimal(14,2), em reais; null = não informado |
| ↳ `pf_dataEntrada` | Data de entrada | data | Coleta | patrimonio.financeiro[].detalhe.dataEntrada | date |
| ↳ `pf_nContrib` | Número de contribuições | número | Coleta | patrimonio.financeiro[].detalhe.nContrib | integer |
| ↳ `pf_vestingProprio` | Vesting (parte própria) | texto curto | Coleta | patrimonio.financeiro[].detalhe.vestingProprio | varchar(200) |
| ↳ `pf_vestingPatroc` | Vesting (patrocinador) | texto curto | Coleta | patrimonio.financeiro[].detalhe.vestingPatroc | varchar(200) |
| ↳ `pf_obs` | Observações | texto longo | Coleta | patrimonio.financeiro[].detalhe.obs | text |
| **`prevAbertaList`**  | **Previdência aberta (PGBL, VGBL)** | lista | Coleta | patrimonio.financeiro[] com tipo pgbl ou vgbl; carteira.ativos[] | tabela filha `coleta_prev_aberta` (`coleta_id`, `ordem`); a marca `prevAbertaNaoPossui` é boolean na `coleta` |
| ↳ `pa_pessoa` | De quem é | uma opção: Titular, Cônjuge | Coleta (**novo**) | financeiro[].titularidade | varchar(60); valores: `Titular`, `Cônjuge` |
| ↳ `pa_tipo` | Tipo do plano | uma opção: PGBL, VGBL, FGB | Coleta | financeiro[].tipo | varchar(60); valores: `PGBL`, `VGBL`, `FGB` |
| ↳ `pa_saldo` | Saldo atual total | R$ | Coleta | financeiro[].valor; tributario.previdencia.inicial | decimal(14,2), em reais; null = não informado |
| ↳ `pa_contribuicao` | Contribuição mensal atual | R$ | Coleta | tributario.ir.atual.lanc[].pgbl (× 12, se PGBL); tributario.previdencia.aporte | decimal(14,2), em reais; null = não informado |
| ↳ `pa_regime` | Regime | uma opção: Regressivo, Progressivo | Coleta | carteira.ativos[].prev.regime (sem carteira: patrimonio.financeiro[].prev.regime) | varchar(60); valores: `Regressivo`, `Progressivo` |
| ↳ `pa_nomeFundo` | Nome do fundo | texto curto | Coleta | carteira.ativos[].nome | varchar(200) |
| ↳ `pa_cnpj` | CNPJ | texto curto | Coleta | carteira.ativos[].prev.cnpj (ou financeiro[].prev) | varchar(200) |
| ↳ `pa_perfilRisco` | Perfil de risco | uma opção: Conservador, Moderado, Arrojado, Agressivo | Coleta | carteira.ativos[].prev.perfil (ou financeiro[].prev) | varchar(60); valores: `Conservador`, `Moderado`, `Arrojado`, `Agressivo` |
| ↳ `pa_dataInicio` | Data de início | data | Coleta | carteira.ativos[].prev.dataInicio (ou financeiro[].prev); diz a faixa da tabela regressiva | date |
| ↳ `pa_obs` | Observações | texto longo | Coleta | carteira.ativos[].prev.obs (ou financeiro[].prev) | text |

### 06 Financeiro e contábil

| Variável (`name`) | O que é | Tipo | Origem | Onde cai no plano | No banco |
|---|---|---|---|---|---|
| `incomenature` | Natureza da principal fonte de renda | uma opção: CLT, Servidor Público, Aposentadoria/Pensão, Profissional Liberal/Autônomo, Empresário, Sem Renda | Exame (pergunta 24, a resposta em `exame.respostas`) → coleta (o detalhado) | rendasAtivas[0].natureza do titular | varchar(60); valores: `CLT`, `Servidor Público`, `Aposentadoria/Pensão`, `Profissional Liberal/Autônomo`, `Empresário`, `Sem Renda`; **not null** ao finalizar |
| `declaredincome` | Renda líquida mensal | R$ | Exame (pergunta 25, a resposta em `exame.respostas`) → coleta (o detalhado) | incomes[] (a renda principal do titular) | decimal(14,2), em reais; null = não informado; **not null** ao finalizar |
| `conjugeIncomenature` | Cônjuge: natureza da principal fonte de renda — Lacuna 1 e 2: a coleta é de uma pessoa; a montagem precisa da natureza de cada responsável (reserva ideal, fase da vida) (só se `planoTipo` = Um casal ou uma família) | uma opção: CLT, Servidor Público, Aposentadoria/Pensão, Profissional Liberal/Autônomo, Empresário, Sem Renda | Coleta (**novo**) | rendasAtivas[].natureza do cônjuge | varchar(60); valores: `CLT`, `Servidor Público`, `Aposentadoria/Pensão`, `Profissional Liberal/Autônomo`, `Empresário`, `Sem Renda` |
| `irRegime` | Regime de declaração do IR | uma opção: Simplificado, Completo, Não declara | Coleta | coleta.ir.modelo | varchar(60); valores: `Simplificado`, `Completo`, `Não declara` |
| `irDespesasMedicas` | Despesas médicas na última declaração (ano) — A montagem pede ao consultor; o valor da última declaração é fato do cliente (o consultor decide o que é dedutível) | R$ | Coleta (**novo**) | coleta.ir.despesasMedicas (no ano; ponto de partida para tributario.ir.atual.lanc[].med) | decimal(14,2), em reais; null = não informado |
| `irInstrucao` | Despesas com instrução na última declaração (ano) | R$ | Coleta (**novo**) | coleta.ir.instrucao (no ano; ponto de partida para tributario.ir.atual.lanc[].instr) | decimal(14,2), em reais; null = não informado |
| **`rendaAtivaList`**  | **Renda ativa (fontes de renda do trabalho)** — Na coleta atual é "outras fontes", além da principal | lista | Coleta | incomes[] de tipo ativa e rendasAtivas[] (profissão, natureza, horas) | tabela filha `coleta_renda_ativa` (`coleta_id`, `ordem`); a marca `rendaAtivaNaoPossui` é boolean na `coleta` |
| ↳ `ra_pessoa` | De quem é — Lacuna 2: de quem é cada renda | uma opção: Titular, Cônjuge | Coleta (**novo**) | incomes[].pessoa, rendasAtivas[].pessoa | varchar(60); valores: `Titular`, `Cônjuge` |
| ↳ `ra_descricao` | Fonte ou profissão | texto curto | Coleta (**novo**) | incomes[].label, rendasAtivas[].profissao | varchar(200) |
| ↳ `ra_regime` | Regime de trabalho | uma opção: CLT, Profissional Liberal/Autônomo, Empresário, Servidor Público | Coleta | incomes[].origin (Salário, Honorários, Pró-labore) e rendasAtivas[].natureza | varchar(60); valores: `CLT`, `Profissional Liberal/Autônomo`, `Empresário`, `Servidor Público` |
| ↳ `ra_horas` | Horas de trabalho por mês | número | Coleta | rendasAtivas[].horas | integer |
| ↳ `ra_rendaBruta` | Renda bruta mensal | R$ | Coleta | incomes[].gross | decimal(14,2), em reais; null = não informado |
| ↳ `ra_rendaLiquida` | Renda líquida mensal | R$ | Coleta | incomes[].steps[0].value | decimal(14,2), em reais; null = não informado |
| ↳ `ra_certeza` | Essa renda é — Lacuna 2: renda certa ou estimada (pendência 1 do VARIAVEIS.md) | uma opção: Certa, Estimada (varia) | Coleta (**novo**) | incomes[].certeza (Certa, Estimada (varia)) | varchar(60); valores: `Certa`, `Estimada (varia)` |
| ↳ `ra_diaRecebimento` | Dia do recebimento | número | Coleta (**novo**) | incomes[].days[0] | integer |
| ↳ `ra_comissoes` | Comissões (mensal, média) | R$ | Coleta | incomes[] (Remuneração variável) | decimal(14,2), em reais; null = não informado |
| ↳ `ra_decimo` | Recebe 13º salário? | Sim/Não | Coleta | incomes[] (13º salário, segue o salário) | boolean (null = não respondido) |
| ↳ `ra_bonus` | Bônus anual | R$ | Coleta | incomes[] (Bônus, anual) | decimal(14,2), em reais; null = não informado |
| ↳ `ra_plr` | PLR anual | R$ | Coleta | incomes[] (PLR, anual, não tributável) | decimal(14,2), em reais; null = não informado |
| ↳ `ra_obs` | Observações | texto longo | Coleta | incomes[].description | text |
| **`rendaPassivaList`**  | **Renda passiva** | lista | Coleta | incomes[] de tipo passiva | tabela filha `coleta_renda_passiva` (`coleta_id`, `ordem`); a marca `rendaPassivaNaoPossui` é boolean na `coleta` |
| ↳ `rp_pessoa` | De quem é | uma opção: Titular, Cônjuge | Coleta (**novo**) | incomes[].pessoa | varchar(60); valores: `Titular`, `Cônjuge` |
| ↳ `rp_tipo` | Tipo da renda passiva | uma opção: Investimentos Financeiros, Imóveis, Negócios, Pensão, Assistência, Outro | Coleta | incomes[].origin | varchar(60); valores: `Investimentos Financeiros`, `Imóveis`, `Negócios`, `Pensão`, `Assistência`, `Outro` |
| ↳ `rp_ativo` | Ativo que gera esta renda | texto curto | Coleta | a ligação com o bem (bens[].renda) | varchar(200) |
| ↳ `rp_rendaBruta` | Renda bruta mensal esperada | R$ | Coleta | incomes[].gross | decimal(14,2), em reais; null = não informado |
| ↳ `rp_rendaLiquida` | Renda líquida mensal esperada | R$ | Coleta | incomes[].steps[0].value | decimal(14,2), em reais; null = não informado |
| ↳ `rp_obs` | Observações | texto longo | Coleta | incomes[].description | text |

### 07 Cenário atual

| Variável (`name`) | O que é | Tipo | Origem | Onde cai no plano | No banco |
|---|---|---|---|---|---|
| `hasdependents` | Tem dependentes financeiros? | Sim/Não | Exame (pergunta 26, a resposta em `exame.respostas`) → coleta (o detalhado) | riscos.reserva.dependentes (com a lista, é ela que decide) | boolean (null = não respondido); **not null** ao finalizar |
| `hadprofessionalvalidation` | Já teve produtos financeiros avaliados por um profissional? | Sim/Não | Exame (pergunta 29, a resposta em `exame.respostas`) → coleta (o detalhado) | coleta.diagnostico.validacaoProfissional | boolean (null = não respondido); **not null** ao finalizar |
| `moradiaEstrutura` | Estrutura de moradia atual | uma opção: Aluguel, Imóvel Financiado, Imóvel Quitado, Com Terceiros | Coleta | coleta.moradia (o aluguel é uma despesa fixa; o imóvel, um bem) | varchar(60); valores: `Aluguel`, `Imóvel Financiado`, `Imóvel Quitado`, `Com Terceiros` |
| `moradiaValorAluguel` | Valor do aluguel (só se `moradiaEstrutura` = Aluguel) | R$ | Coleta | expenses[] "Moradia (aluguel)", marcada coleta: aluguel (a despesa fixa do Orçamento) | decimal(14,2), em reais; null = não informado |
| `moradiaValorImovel` | Valor do imóvel (só se `moradiaEstrutura` = Imóvel Financiado) | R$ | Coleta | bens[] (repete o imóvel da lista de bens: a lista vale) | decimal(14,2), em reais; null = não informado |
| `moradiaSaldoDevedor` | Saldo devedor (só se `moradiaEstrutura` = Imóvel Financiado) | R$ | Coleta | bens[].saldoDevedor (idem) | decimal(14,2), em reais; null = não informado |
| `moradiaParcela` | Parcela mensal (só se `moradiaEstrutura` = Imóvel Financiado) | R$ | Coleta | bens[].parcela (idem) | decimal(14,2), em reais; null = não informado |
| `fgts` | Saldo de FGTS | R$ | Coleta | patrimonio.financeiro[] com tipo fgts | decimal(14,2), em reais; null = não informado |
| `conjugeFgts` | Cônjuge: saldo de FGTS (só se `planoTipo` = Um casal ou uma família) | R$ | Coleta (**novo**) | patrimonio.financeiro[] com tipo fgts, titularidade conjuge | decimal(14,2), em reais; null = não informado |
| `moradiaObs` | Observações | texto longo | Coleta | coleta.moradiaObs | text |
| **`depList`**  | **Família e dependentes** | lista | Coleta | riscos.dependentes[] | tabela filha `coleta_dependente` (`coleta_id`, `ordem`); a marca `depNaoPossui` é boolean na `coleta` |
| ↳ `dep_relacao` | Relação | uma opção: Filho(a), Cônjuge, Companheiro(a), Pai/Mãe, Outro | Coleta | dependentes[].relacao (filho, conjuge, pai, outro) | varchar(60); valores: `Filho(a)`, `Cônjuge`, `Companheiro(a)`, `Pai/Mãe`, `Outro` |
| ↳ `dep_nome` | Nome | texto curto | Coleta | dependentes[].nome | varchar(200) |
| ↳ `dep_idade` | Idade atual | número | Coleta | dependentes[].nasc (aproximado, quando não há a data) | integer |
| ↳ `dep_nascimento` | Data de nascimento — A montagem pede mês e ano (o seguro de vida vai até a idade em que o dependente deixa de depender) | data | Coleta (**novo**) | dependentes[].nasc | date |
| ↳ `dep_ateIdade` | Depende até que idade? — Vazio: 25 para filhos, 95 para adultos | número | Coleta (**novo**) | dependentes[].ate | integer |
| ↳ `dep_dependencia` | Tipo de dependência | uma opção: Total, Parcial | Coleta | riscos.dependentes[].dependencia (Total, Parcial) | varchar(60); valores: `Total`, `Parcial` |
| ↳ `dep_custo` | Custo mensal estimado | R$ | Coleta | riscos.dependentes[].custo (só a coleta mostra; as despesas ficam no Orçamento) | decimal(14,2), em reais; null = não informado |
| ↳ `dep_obs` | Observações | texto longo | Coleta | riscos.dependentes[].obs | text |

### 08 Dados pessoais

| Variável (`name`) | O que é | Tipo | Origem | Onde cai no plano | No banco |
|---|---|---|---|---|---|
| `maritalstatus` | Estado civil | uma opção: Solteiro(a), Casado(a), Divorciado(a), Separado(a), Viúvo(a) | Exame (pergunta 30, a resposta em `exame.respostas`) → coleta (o detalhado) | coleta.pessoal.estadoCivil | varchar(60); valores: `Solteiro(a)`, `Casado(a)`, `Divorciado(a)`, `Separado(a)`, `Viúvo(a)`; **not null** ao finalizar |
| `planoTipo` | O planejamento é de — Lacuna 1: a coleta é de uma pessoa; a montagem começa por "O plano é de" | uma opção: Uma pessoa, Um casal ou uma família | Coleta (**novo**) | tipo (individual \| familia) | varchar(60); valores: `Uma pessoa`, `Um casal ou uma família` |
| `usergender` | Gênero | uma opção: Feminino, Masculino, Outro, Prefiro não declarar | Exame (pergunta 31, a resposta em `exame.respostas`) → coleta (o detalhado) | coleta.pessoal.genero | varchar(60); valores: `Feminino`, `Masculino`, `Outro`, `Prefiro não declarar`; **not null** ao finalizar |
| `dateofbirth` | Data de nascimento | data | Exame (pergunta 32, a resposta em `exame.respostas`) → coleta (o detalhado) | nascimento (age é calculada) | date; **not null** ao finalizar |
| `useremail` | E-mail | e-mail | Exame (pergunta 33, a resposta em `exame.respostas`) → coleta (o detalhado) | coleta.pessoal.email (na plataforma, o cadastro) | varchar(254); **not null** ao finalizar |
| `userphone` | Telefone / WhatsApp | telefone | Coleta | coleta.pessoal.telefone (na plataforma, o cadastro) | varchar(20), só dígitos com DDI; **not null** ao finalizar |
| `conjugeNome` | Nome completo do cônjuge (só se `planoTipo` = Um casal ou uma família) | texto curto | Coleta (**novo**) | conjugeNome | varchar(200) |
| `conjugeDateofbirth` | Data de nascimento do cônjuge (só se `planoTipo` = Um casal ou uma família) | data | Coleta (**novo**) | conjugeNascimento (spouseAge é calculada) | date |
| `conjugeGenero` | Gênero do cônjuge (só se `planoTipo` = Um casal ou uma família) | uma opção: Feminino, Masculino, Outro, Prefiro não declarar | Coleta (**novo**) | coleta.pessoal.conjugeGenero | varchar(60); valores: `Feminino`, `Masculino`, `Outro`, `Prefiro não declarar` |
| `regimeBens` | Regime de bens — Decide a titularidade padrão dos bens e a sucessão (só se `planoTipo` = Um casal ou uma família) | uma opção: Comunhão parcial, Comunhão universal, Separação total, Participação final nos aquestos, União estável sem contrato | Coleta (**novo**) | coleta.pessoal.regimeBens | varchar(60); valores: `Comunhão parcial`, `Comunhão universal`, `Separação total`, `Participação final nos aquestos`, `União estável sem contrato` |

### 09 Perfil e comportamento

| Variável (`name`) | O que é | Tipo | Origem | Onde cai no plano | No banco |
|---|---|---|---|---|---|
| `selfevaluation` | De 1 a 5, sente que está usando seu dinheiro da melhor forma para construir o futuro? | 1 a 5 | Exame (pergunta 1, a resposta em `exame.respostas`) → coleta (o detalhado) | coleta.perfil.autoavaliacao (1 a 5) | smallint, de 1 a 5; **not null** ao finalizar |
| `disposicaoRisco` | Disposição a risco (identificada pelo consultor) | uma opção: Baixo, Médio, Alto | Coleta | coleta.perfil.disposicaoRisco | varchar(60); valores: `Baixo`, `Médio`, `Alto` |
| `capacidadeRisco` | Capacidade para risco (identificada pelo consultor) | uma opção: Baixo, Médio, Alto | Coleta | coleta.perfil.capacidadeRisco | varchar(60); valores: `Baixo`, `Médio`, `Alto` |
| `relacaoDinheiro` | Relação com o dinheiro | uma opção: Gastador, Poupador, Neutro | Coleta | coleta.perfil.relacaoDinheiro | varchar(60); valores: `Gastador`, `Poupador`, `Neutro` |
| `restricaoClasseAtivo` | Restrição a alguma classe de ativo | texto curto | Coleta | coleta.perfil.restricaoClasse (a tabela de experiência é a versão estruturada) | varchar(200) |
| `ativoNaoDesfazer` | Ativo de que não quer se desfazer | texto curto | Coleta | coleta.perfil.naoDesfazer | varchar(200) |
| `classeNaoQuer` | Classe de ativo que não quer ter | texto curto | Coleta | coleta.perfil.classeNaoQuer | varchar(200) |
| `perpetuidadeHeranca` | Perpetuidade ou herança: o que pensa em deixar? | texto longo | Coleta | coleta.perfil.heranca | text |
| **`expList`** **novo** | **Experiência com as classes de ativos** — A montagem tem a tabela "Experiência com investimentos" por pessoa e classe (entende, já investiu, tem restrição); a coleta só tem texto livre | lista | Coleta (**novo**) | experiencia.<titular\|conjuge>.<classe> | tabela filha `coleta_experiencia` (`coleta_id`, `ordem`); a marca `expNaoPossui` é boolean na `coleta` |
| ↳ `exp_pessoa` | Pessoa | uma opção: Titular, Cônjuge | Coleta | experiencia.<pessoa> | varchar(60); valores: `Titular`, `Cônjuge` |
| ↳ `exp_classe` | Classe | uma opção: Pós-fixado, Pré-fixado, Indexado à inflação, Fundos multimercado, Fundos imobiliários, Ações no Brasil, Ações no exterior, Renda fixa no exterior, Previdência, Criptoativos, Alternativos | Coleta | experiencia.<pessoa>.<classe> | varchar(60); valores: `Pós-fixado`, `Pré-fixado`, `Indexado à inflação`, `Fundos multimercado`, `Fundos imobiliários`, `Ações no Brasil`, `Ações no exterior`, `Renda fixa no exterior`, `Previdência`, `Criptoativos`, `Alternativos` |
| ↳ `exp_entende` | Entende | marca | Coleta | .entende | boolean |
| ↳ `exp_investiu` | Já investiu | marca | Coleta | .investiu | boolean |
| ↳ `exp_restricao` | Tem restrição | marca | Coleta | .restricao | boolean |
| `expObs` | Observações sobre a experiência | texto longo | Coleta (**novo**) | experiencia.observacoes | text |

### 10 Anexos

| Variável (`name`) | O que é | Tipo | Origem | Onde cai no plano | No banco |
|---|---|---|---|---|---|
| `anexos` | Documentos entregues | várias opções: Extratos dos investimentos, Declaração de IR, Apólices de seguros, Outros | Coleta | coleta.anexos.<extratos\|ir\|apolices\|outros> (uma marca por opção) | tabela filha (uma linha por opção marcada) ou array de varchar; valores: `Extratos dos investimentos`, `Declaração de IR`, `Apólices de seguros`, `Outros` |
| `anexosObs` | Observações sobre os anexos | texto longo | Coleta | coleta.anexos.obs | text |
| `uploadCategory` | Categoria do arquivo | uma opção: Extratos dos investimentos, Declaração de IR, Apólices de seguros, Outros | Coleta | coleta.anexos.arquivos[].categoria (extratos, ir, apolices, outros); enviar marca a categoria como entregue | varchar(60); valores: `Extratos dos investimentos`, `Declaração de IR`, `Apólices de seguros`, `Outros` |
| `fileInput` | Arquivos (PDF, imagem, planilha; até 10 MB) | arquivo | Coleta | coleta.anexos.arquivos[]: nome, categoria, tamanho, em (o arquivo vai para o armazenamento da plataforma) | tabela de anexos (id, categoria, nome, tipo, tamanho, caminho no storage) |

### 11 Próximas tarefas

| Variável (`name`) | O que é | Tipo | Origem | Onde cai no plano | No banco |
|---|---|---|---|---|---|
| **`tarefasList`**  | **Tarefas** | lista | Coleta | coleta.tarefas[] (gestão do atendimento; nenhuma conta usa) | tabela filha `coleta_tarefa` (`coleta_id`, `ordem`); a marca `tarefasNaoPossui` é boolean na `coleta` |
| ↳ `tarefa_titulo` | Tarefa | texto curto | Coleta | coleta.tarefas[].titulo | varchar(200) |
| ↳ `tarefa_prazo` | Prazo | data | Coleta | coleta.tarefas[].prazo | date |
| ↳ `tarefa_responsavel` | Responsável | uma opção: Consultor, Cliente | Coleta | coleta.tarefas[].responsavel (consultor, cliente) | varchar(60); valores: `Consultor`, `Cliente` |
| ↳ `tarefa_status` | Status | uma opção: Pendente, Em andamento, Concluída | Coleta | coleta.tarefas[].status (pendente, andamento, concluida) | varchar(60); valores: `Pendente`, `Em andamento`, `Concluída` |
| ↳ `tarefa_obs` | Observações | texto longo | Coleta | coleta.tarefas[].obs | text |

### Fora das seções

| Variável (`name`) | O que é | Tipo | Origem | Onde cai no plano | No banco |
|---|---|---|---|---|---|
| `anotacoesConsultor` | Anotações do consultor (painel lateral) | texto longo | Coleta | coleta.anotacoes | text |
| `addToReuniaoCheck` | Adicionar como reunião no HubSpot | Sim/Não | Coleta | coleta.reuniao.adicionar (a plataforma registra ao finalizar) | boolean (null = não respondido) |
| `reuniaoDealId` | Negócio do HubSpot | texto curto | Coleta | coleta.reuniao.dealId | varchar(200) |
| `status` | Status da coleta — POST /planejamentoController, ações save e update | uma opção: rascunho, finalizado | Coleta | coleta.status (vazio = rascunho; finalizada) | varchar(60); valores: `rascunho`, `finalizado` |
| `nomeCliente` | Nome do cliente | texto | Cadastro da plataforma | `name` | não é da coleta: vem de `cliente.nome` |
| `status` | Situação da coleta | opções: rascunho, finalizada | Coleta | `coleta.status` (vazio = rascunho) | varchar(12); o botão "Finalizar a coleta" grava `finalizada` |
| — | Dia em que a coleta foi finalizada | data | Coleta | `coleta.finalizadaEm` ("AAAA-MM-DD") | date; aparece no rodapé da montagem |
| `<lista>NaoPossui` | "O cliente não tem" de uma lista vazia (compromissos, participações, bens, outros ativos, dívidas, fundo de pensão, previdência aberta, seguro de vida, seguro de acidentes, plano de saúde, responsabilidade civil, tarefas) | Sim/Não | Coleta | `coleta.naoTem.<compromissos, participacoes, bens, outrosAtivos, dividas, fechada, aberta, vida, acidentes, saude, terceiros, tarefas>` | boolean; com um item na lista, a marca não vale |

**Total:** 282 variáveis na coleta, 78 delas novas (campos marcados novo e os das listas novas); as outras 204 são os campos da coleta de produção (o inventário de 09/10/2026 conta 211 porque conta de outro jeito as caixas de marcar e os pares protegido/detalhe; nenhum campo foi removido).

## 2. O plano: o que o consultor decide na montagem (camada consultor)

É o documento `plano` de um cliente (um JSON por cliente; formato completo em `README.md`, "Formato do plano", e inventário em
`VARIAVEIS.md`). Na plataforma hoje ele vai e volta inteiro por `/montagemController`; dá para gravar como um JSONB `plano`
na tabela `planejamento` (`cliente_id`, `coleta_id` de origem, `versao`, `atualizado_em`), que é o mais simples e o que o portal
espera. Quem quiser colunas tira daqui as de consulta frequente (nome, tipo, datas de nascimento, `retireAge`, `desired`).

O plano nasce da coleta (`coleta/plano.js`, `planoDaColeta`): os campos abaixo marcados **da coleta** já chegam preenchidos e
guardam `origem.coleta.campos[caminho] = name`. Os marcados **consultor** ficam vazios até a montagem; os padrões são do motor.

| Variável (caminho no plano) | O que é | Tipo | Origem | No banco |
|---|---|---|---|---|
| `name`, `tipo` | nome do cliente; `individual` ou `familia` | texto; enum | cadastro; da coleta (`planoTipo`) | varchar; varchar(12) |
| `nascimento`, `conjugeNome`, `conjugeNascimento` | datas de nascimento (AAAA-MM-DD) e nome do cônjuge | date; texto | da coleta | date, varchar |
| `age`, `spouseAge` | idades de hoje | inteiro | **calculada** (`ENGINE.sincronizaIdades`) | não gravar |
| `inicio` | o "hoje" do plano (AAAA-MM-DD); mês 0 de toda a linha do tempo | date | consultor (um plano novo: a data de hoje) | date |
| `periodicidade` | `mensal` ou `anual` (como a sobra e os aportes são contados) | enum | da coleta (`orcamentoModo`) | varchar(6) |
| `lifeExp` | expectativa de vida (anos) da pessoa mais jovem | inteiro | consultor (premissa; padrão 95) | smallint |
| `retireAge`, `spouseRetireAge` | idade em que cada um para de trabalhar | inteiro | da coleta | smallint |
| `desired`, `desiredSteps[]` | renda desejada por mês na liberdade; mudanças a partir de um mês (`from`, `value`) | R$; lista | da coleta (`desired`); consultor (`desiredSteps`) | decimal(14,2); JSON |
| `mode` | forma de sacar: sempre `desej` | enum | fixo | varchar(5) |
| `rate`, `profiles.{conservador,moderado,agressivo}` | rentabilidade real líquida ao mês da reserva e de cada perfil | fração (0.004) | consultor (premissas; padrões do motor) | decimal(7,5) |
| `horizonte` | como o Fluxo abre: month, quarter, semester, year | enum | consultor (preferência de tela) | varchar(8) |
| `capacityOverride` | capacidade de poupança informada pelo cliente (R$/mês) | R$ | da coleta (`declaredmonthlysavings`) | decimal(14,2), nulo = calcular |
| `orcamento.vezesPoupou` | nenhuma, 1-3, 4-6, 7-9, 10+ | enum | da coleta (`recentsavingsfrequency`) | varchar(8) |
| `orcamento.combinado.{fixas,ajustaveis}.{meta,cortes[]}` | o orçamento combinado na apresentação (quanto liberar de cada grupo e de quais despesas) | JSON | consultor (com o cliente) | JSON |
| `rendasAtivas[]` | `pessoa`, `profissao`, `natureza` (as de `ENGINE.NATUREZAS`), `horas` | lista | da coleta (`rendaAtivaList`, `incomenature`) | JSON ou tabela `plano_renda_ativa` |
| `experiencia.<titular\|conjuge>.<classe>.{entende,investiu,restricao}`, `experiencia.observacoes` | experiência com as classes de ativos | JSON | da coleta (`expList`, `expObs`) | JSON |
| `incomes[]` | cada entrada: `id`, `label`, `pessoa`, `kind` (ativa/passiva), `origin` (Salário, Pró-labore…), `gross`, `frequency`, `days[]`/`dates[]`, `taxable`, `steps[{from,value}]`, `exc{}`, `de`, `segue`, `destino`, `certeza` (certa/estimada, **novo**) | lista de linhas do tempo | da coleta (o valor de hoje, de quem é, bruto, 13º, bônus, PLR, comissões); consultor (degraus futuros, ajustes pontuais, `destino`) | JSON (ou tabela `plano_linha` com `steps` em JSON) |
| `expenses[]` | cada saída: `id`, `label`, `group` (fix/adj), `frequency`, `days`/`dates`/`weekday`, `steps[]`, `exc{}`, `endObj` | lista de linhas do tempo | da coleta (`despList`; sem ela, o total declarado e os itens soltos: aluguel, parcelas, prêmios, previdência); consultor (o resto) | JSON |
| `creditos[]`, `jurosDivida` | créditos novos no futuro; juros quando o dinheiro acaba (% ao mês) | lista; % | consultor | JSON; decimal(5,2) |
| `patrimonio.comecou`, `patrimonio.conjugeComecou` | idade em que cada um começou a trabalhar | inteiro | da coleta | smallint |
| `patrimonio.financeiro[]` | `nome` (instituição), `valor`, `tipo` ('' investimento, pgbl, vgbl, fechada, fgts, consorcio, emprestimo), `titularidade`, `daCarteira`, `conv{}` (fundo de pensão/FGTS: como vira renda), `cons{}` (consórcio a contemplar) | lista | da coleta (soma da carteira por instituição; previdência fechada; FGTS); consultor (`conv`, `cons`, empréstimos) | JSON; os `daCarteira` são **calculados** da carteira (`ENGINE.sincronizaPatrimonio`): gravar só os digitados |
| `patrimonio.participacoes[]` | `nome`, `valor`, `pct`, `pessoa`, `valorizacao[]`, `venda{}`, `renda` | lista | da coleta (nome, valor, pessoa, intenção de vender); consultor (valorização, venda) | JSON |
| `patrimonio.bens[]` | `nome`, `tipo`, `mercado`, `titularidade` (titular/conjuge/casal), `titularPct`, `conjugePct`, `saldoDevedor`, `credito`, `parcelas`, `inicio` (AAAA-MM), `parcela`, `juros`, `jurosPeriodo`, `sistema` (sac/price), `iof`, `seguro{}`, `tarifas`, `situacao`, `amortizacoes[]`, `outrasLinhas[]`, `modalidade` (consorcio) + campos do consórcio, `renda` (id da linha), `protecao`, `apolice{}`, `valorizacao[]`, `venda{em,preco,custos[],destinos[],impostoGanhoPct,custoAquisicao}` | lista | da coleta (tudo até `situacao`, a renda, a proteção, a intenção de venda); consultor (valorização, custos da venda, adiantamentos) | JSON; `restantes`, CET, saldo projetado são **calculados** (`ENGINE.contratoDaDivida`), não gravar |
| `patrimonio.dividas[]` | o mesmo contrato dos bens, sem `mercado` | lista | da coleta (`dividasList`); consultor (detalhe do contrato quando faltar) | JSON |
| `patrimonio.liquidezIdealPct` | liquidez ideal, % do patrimônio total | % | consultor | decimal(5,2) |
| `patrimonio.contas.{titular,conjuge,casal}` | instituições onde só tem conta | listas de nomes | consultor | JSON |
| `carteira.ativos[]` | `id`, `instituicao`, `titular`, `nome`, `classe` (`ENGINE.CLASSES_CARTEIRA`), `subclasse`, `vencimento`, `tipo`, `valor`, `obs`, `emissor`, `acao` (manter/parcial/integral/portabilidade), `resgate` | lista | da coleta (`ativoFinList`, `prevAbertaList`); consultor (`classe` conferida, `acao`, `resgate`) | tabela `plano_ativo` ou JSON; `classe` vazia = a classificar |
| `carteira.modelo`, `carteira.ideal{}`, `carteira.recomendada{}`, `carteira.justificativa`, `carteira.aporte`, `carteira.novos[]` | macro e microalocação recomendadas | JSON | consultor | JSON |
| base de ativos (nome do ativo → classe) | a classificação compartilhada entre clientes | tabela | consultor (do escritório) | tabela `ativo_classe` (nome, classe), **não** no plano |
| `objectives[]` | `id`, `name`, `categoria`, `icon`, `iconFA`, `iconData`, `photo`, `kind` (bem/consumo), `ligado`, `months`, `amount`, `preco`, `compra{modo,…}`, `costs[]`, `dedicated`, `planned`, `aporteDe`, `dedicadoEm`, `programa{}`, `profile`, `rateM`, `alocacao{}`, `strategy`, `descricao`, `planoAtual`, `diagnostico{presente,futuro}` | lista | da coleta (nome, categoria, data, valores, aporte e saldo que o cliente já pratica, custo depois, modo de compra, descrição); consultor (perfil, rentabilidade, alocação, estratégia, foto, `aporteDe`, `dedicadoEm`, `programa`, o detalhe do financiamento/consórcio, `ligado`) | JSON (ou tabela `plano_objetivo`); `required`, `ratio`, a curva e os cortes são **calculados** |
| `objetivosOrdem[]` | ids na prioridade do cliente, com `seguranca` e `liberdade` | lista | da coleta (a ordem da lista) | JSON |
| `compromissos[]` | `id`, `titulo`, `descricao`, `em` (mês), `valor` | lista | da coleta (`comprList`) | JSON |
| `politica.reserva`, `politica.reservaMensal`, `politica.cortes{adj,fix}`, `politica.alocacao{reserva,compromissos}` | política de investimentos | JSON | consultor | JSON |
| `passive[]` | rendas da aposentadoria: `name`, `origin`, `pessoa`, `gross`, `tax`, `net`, `startMi` ou `start`, `dur`, `cost`, `converted` | lista | da coleta (INSS: tipo, idade, valor); consultor (as contratadas) | JSON |
| `riscos.dependentes[]` | `nome`, `relacao` (filho/conjuge/pai/outro), `nasc` (AAAA-MM), `ate` | lista | da coleta (`depList`) | JSON ou tabela `plano_dependente` |
| `riscos.reserva.{dependentes,custoVida,atual,alvo}` | tem dependentes; ajustes do custo de vida, reserva atual e alvo | boolean; R$ | da coleta (exame 26, 28, 10, 12) | JSON; a reserva ideal é **calculada** |
| `riscos.liquidez{}` | a escada D+0 a 1 ano e a avaliação | JSON | consultor (digitada; calculável de `carteira.ativos[].vencimento`) | JSON |
| `riscos.saude.{tipo,operadora,plano,vidas[],linha,hospitais[],alternativa{},avaliacao}` | plano de saúde: tipo, vidas (`nome`, `quem`, `premio`, `pagador`), a despesa no Fluxo, a alternativa | JSON | da coleta (tipo, operadora, vidas, prêmios, quem paga); consultor (hospitais, alternativa, avaliação) | JSON |
| `riscos.terceiros.{avaliado,itens[{nome,ideal,atual}]}` | danos a terceiros: cobertura atual e ideal | JSON | da coleta (`atual`: RCV-F do auto, RC familiar, RC profissional); consultor (`ideal`, `avaliado`) | JSON |
| `riscos.seguro.geradores[]` | `nome`, `pessoa`, `nasc`, `participacao` (% da renda), `passivaPct`, `patrimonioPct`, `coberturaVida`, `coberturaInvalidez`, `inssInvalidez`, `inssMorte` | lista | da coleta (coberturas, INSS por invalidez e morte, `participacao` pelo % das despesas); consultor (`passivaPct`, `patrimonioPct`) | JSON |
| `riscos.seguro.{renda,passiva,sucessaoPct}`, `riscos.pesos{}`, `riscos.ruina{}`, `riscos.bens{}`, `riscos.familia{}` | avaliações e pesos das oito ameaças | JSON | consultor (`renda` e `passiva` são **calculadas** do Fluxo) | JSON |
| `tributario.ir.{regimeAtual,pessoas[],atual{depsCom,lanc[]},recomendada{}}` | IR de hoje e recomendado: despesas médicas, instrução, PGBL de cada pessoa | JSON | da coleta (`irRegime`, `irDespesasMedicas`, `irInstrucao`, PGBL × 12); consultor (o dedutível, a estratégia recomendada) | JSON; rendimentos tributáveis e INSS são **calculados** do Fluxo (`rend`, `inss` só como reserva) |
| `tributario.prolabore.socios[]` | `quem`, `empresa`, `regime`, `faturamento`, `proRec`; `pro` e `div` são reserva | lista | da coleta (`participacoesList`); consultor (`proRec`) | JSON |
| `tributario.sucessao{itcmd,custos,paraPrevidencia}`, `tributario.previdencia{}` | parâmetros da sucessão e do simulador da previdência | JSON | consultor (parâmetros; o simulador pode abrir com `pa_saldo`, `pa_contribuicao`) | JSON |
| `diagnostico.{perfil,concentracao,liberdade,orcamento,reserva,protecao}.{presente,futuro}` | o diagnóstico de hoje e o futuro de cada linha | JSON | consultor (orçamento, reserva e proteção de hoje são **calculados**) | JSON |
| `consultor{nome,certificacao,telefone,email,foto}` | quem cuida do planejamento | JSON | cadastro do planejador (do escritório, não do cliente) | tabela `consultor`; **não** gravar no plano |
| `dataRelatorio`, `mensagemFinal`, `capitulosOcultos[]`, `videos{}` | data, mensagem final, capítulos fora e vídeos de cada capítulo | date; texto; listas | consultor (os vídeos teóricos são da biblioteca do escritório) | date, text, JSON |
| `coleta.{status, finalizadaEm, pessoal, perfil, diagnostico, moradia, moradiaObs, ir, declarado, outrosAtivos[], apolices[], prevPublica, aposentadoria, naoTem, anexos (com arquivos[]), tarefas[], reuniao, anotacoes}` | o que só a reunião de coleta pede e nenhuma conta usa (a parte 1 tem cada campo) | JSON | da coleta | dentro do JSON do plano; se o banco quiser consultar, colunas na tabela do plano |
| `origem.coleta.{id,em,campos{}}` | de que coleta o plano nasceu e qual campo alimentou cada caminho | JSON | gerado por `planoDaColeta` | JSON; `coleta_id` como coluna |

## 3. O que NÃO se grava: as calculadas

Saem do motor (`ENGINE`, o `<script id="engine">` das duas telas) a cada abertura, e mudam sempre que uma variável de origem muda:

- **Idades** de hoje e em cada marco (`age`, `spouseAge`, idade da liberdade, da fase da vida).
- **Totais**: `initialWealth` (soma do financeiro), `initialBens`, `partValue`, patrimônio total, custo de vida (média de 12
  meses das saídas), renda líquida, capacidade de poupança (entradas − saídas), sobra do mês.
- **Da dívida**: parcelas restantes, CET, IOF, saldo pelo contrato, saldo em cada mês, o líquido de uma venda, imposto sobre o ganho.
- **Dos objetivos**: aporte necessário, curva, cortes, trilha, cobertura de hoje, taxa mês a mês (a troca para a conservadora
  nos 24 meses finais), faltas da poupança para objetivos, folga a distribuir.
- **Da liberdade**: patrimônio na aposentadoria, renda por perpetuidade e por consumo, períodos e veredito, alternativas.
- **Dos riscos**: reserva mínima/aceitável/ideal, nota de proteção (%), status de cada ameaça, seguros necessários (vida e
  invalidez), renda a proteger, renda passiva.
- **Do IR e dos sócios**: rendimentos tributáveis, INSS do ano, imposto em cada modelo, economia; pró-labore e dividendos de hoje.
- **Da carteira**: financeiro por instituição (`daCarteira`), diferenças entre atual, ideal e recomendada, mínimos das caixinhas,
  liquidez diária (o restante), concentração patrimonial.
- **Do exame**: os cinco pilares e o score geral (hoje no `saudeFinanceiraController`; com as camadas unificadas, a nota deve
  ser recalculada das variáveis da coleta, e a nota de cada data é uma fotografia).

## 4. As fotografias datadas (histórico)

Tabelas de versões, só leitura, nunca fonte de cálculo:

| Tabela | O que guarda | Quando |
|---|---|---|
| `exame_resultado` | `cliente_id`, `em`, as respostas da época e os seis scores | a cada "SALVAR" do exame |
| `coleta_versao` | `coleta_id`, `em`, o `submissao` inteiro | ao finalizar a coleta (e a cada finalização nova) |
| `planejamento_versao` | `cliente_id`, `versao`, `em`, `nome` ("Versão 1", "Entrega do relatório"), o plano inteiro | "Versão final" e "Salvar status atual" no portal (hoje `versoes/<id>` no armazém) |
| `proposta` | `cliente_id`, `em`, `itens[]` (o que o cliente propôs), a resposta do consultor a cada item | a área do cliente grava; o consultor responde (hoje `propostas/<id>`) |
| `cenario` | cópias do plano com nome, até três por plano | ficam só no navegador do consultor (`nl-cenarios`); podem ir para o banco como `planejamento_cenario` |

Regras de ouro para quem implementa:

1. **Uma variável, um lugar.** O campo da coleta é a fonte; o plano lê dele por `origem.coleta.campos`. Mudou na coleta
   (reabrir a reunião), regenera a parte do plano que veio dela sem mexer no que o consultor decidiu. Mudou no portal
   um campo que veio da coleta (o portal mostra "veio da coleta"), a coleta é atualizada também: é a mesma variável.
2. **Abrir não grava.** O portal só grava o que o consultor mudou; a coleta grava rascunho a cada pausa (1,5 s), como hoje.
3. **Nada de JSON em arquivo.** O que troca entre coleta, portal e área do cliente passa pela API, como o `/montagemController`
   de hoje; "Exportar JSON" é só para levar um plano de um ambiente a outro.
4. **O cliente de teste nunca é real.** O código de cliente vem do `/internal`; a coleta e o plano são sempre do cliente da sessão.
