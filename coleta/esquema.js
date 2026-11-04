// ===================== ESQUEMA DA COLETA DE DADOS =====================
// Uma fonte só para três coisas: a página da coleta (coleta.html desenha o formulário daqui), o mapeamento para o plano
// da montagem do relatório (plano.js) e a tabela de variáveis para o banco (gerar-tabela.js → VARIAVEIS-BANCO.md).
//
// Os campos sem `novo` são o clone da coleta de produção (liberta.nordinvestimentos.com.br/coletadedados, 211 campos
// inventariados no COLETA.md em 09/10/2026), com o mesmo `name`, as mesmas opções e a mesma ordem. Os campos com
// `novo: true` são a proposta desta versão: o que a montagem do relatório pede hoje ao consultor e deveria ser levantado
// na reunião de coleta (ver COLETA-E-MONTAGEM.md). Na página, um interruptor esconde os novos para ver só o clone.
//
// Cada campo: { n: name, r: rótulo, t: tipo, op: opções, ob: obrigatório, se: [name, valor] (só aparece se), ajuda,
//               plano: onde cai no plano da montagem ('diagnóstico' = só avalia o cliente; '—' = não vai), novo, motivo }
// Uma lista: { lista: id, r: rótulo, naoPossui: name da marca "não possui", tabela: nome sugerido no banco, campos: [] }
// Os tipos e como tratá-los no banco estão em TIPOS.

const TIPOS = {
  simnao:    { rotulo: 'Sim/Não',            banco: 'boolean (null = não respondido)' },
  moeda:     { rotulo: 'R$',                 banco: 'decimal(14,2), em reais; null = não informado' },
  pct:       { rotulo: '%',                  banco: 'decimal(5,2), de 0 a 100' },
  numero:    { rotulo: 'número',             banco: 'integer' },
  escala:    { rotulo: '1 a 5',              banco: 'smallint, de 1 a 5' },
  texto:     { rotulo: 'texto curto',        banco: 'varchar(200)' },
  textolongo:{ rotulo: 'texto longo',        banco: 'text' },
  select:    { rotulo: 'uma opção',          banco: 'varchar(60) com as opções fixas (ou enum)' },
  multi:     { rotulo: 'várias opções',      banco: 'tabela filha (uma linha por opção marcada) ou array de varchar' },
  mes:       { rotulo: 'mês (AAAA-MM)',      banco: 'char(7) AAAA-MM, ou date no dia 1' },
  data:      { rotulo: 'data',               banco: 'date' },
  email:     { rotulo: 'e-mail',             banco: 'varchar(254)' },
  tel:       { rotulo: 'telefone',           banco: 'varchar(20), só dígitos com DDI' },
  marca:     { rotulo: 'marca',              banco: 'boolean' },
  arquivo:   { rotulo: 'arquivo',            banco: 'tabela de anexos (id, categoria, nome, tipo, tamanho, caminho no storage)' },
};

const SIMNAO = ['Sim', 'Não'];
const PESSOA = ['Titular', 'Cônjuge'];
const MESES_ANO = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const CLASSES_ATIVOS = ['Pós-fixado', 'Pré-fixado', 'Indexado à inflação', 'Fundos multimercado', 'Fundos imobiliários', 'Ações no Brasil', 'Ações no exterior', 'Renda fixa no exterior', 'Previdência', 'Criptoativos', 'Alternativos'];

const ESQUEMA = { secoes: [

// ---------------------------------------------------------------- 01
{ id: 'objetivos', num: '01', titulo: 'Objetivos financeiros', itens: [
  { n: 'hasobjective', r: 'Tem objetivo financeiro claro?', t: 'simnao', ob: true, op: SIMNAO, plano: 'coleta.diagnostico.objetivoClaro', exame: 4 },
  { n: 'evaluateneededmoney', r: 'Avaliou quanto precisa para o(s) objetivo(s)?', t: 'simnao', ob: true, op: SIMNAO, plano: 'coleta.diagnostico.avaliouQuanto', exame: 5 },
  { n: 'hasplanforobjective', r: 'Tem plano concreto para atingir o objetivo?', t: 'simnao', ob: true, op: SIMNAO, ajuda: 'Plano superficial = Não', plano: 'coleta.diagnostico.temPlano', exame: 6 },
  { n: 'estimatedmoneymonthly', r: 'Quanto imagina precisar investir por mês para o objetivo', t: 'moeda', ob: true, plano: 'coleta.diagnostico.investirImagina', exame: 7, ajuda: 'No exame o nome é estimatedmoneyneeded' },
  { n: 'actualmoneydedicated', r: 'Quanto está de fato investindo por mês para o objetivo', t: 'moeda', ob: true, plano: 'calculada: soma de objectives[].planned (mostrada no Perfil; não se grava)', exame: 8 },
  { lista: 'objList', r: 'Lista de objetivos', naoPossui: 'objNaoPossui', tabela: 'coleta_objetivo', plano: 'objectives[] (a ordem da lista vira objetivosOrdem)', campos: [
    { n: 'obj_titulo', r: 'Título do objetivo', t: 'texto', plano: 'objectives[].name' },
    { n: 'obj_categoria', r: 'Categoria', t: 'select', op: ['Compra de Casa', 'Compra de Veículo', 'Viagem', 'Intercâmbio', 'Aposentadoria Segura', 'Futuro dos Filhos', 'Casamento', 'Quitar Dívidas', 'Segurança Financeira', 'Outro'], plano: 'objectives[].categoria (só a coleta mostra; o kind, consumo ou bem, continua no cartão)' },
    { n: 'obj_descricao', r: 'Descrição (por que este objetivo importa)', t: 'textolongo', plano: 'objectives[].descricao (o propósito do objetivo na apresentação)' },
    { n: 'obj_dataAlvo', r: 'Mês alvo', t: 'mes', plano: 'objectives[].months (calculado: meses a partir de hoje)' },
    { n: 'obj_valorNecessario', r: 'Valor necessário na data alvo', t: 'moeda', plano: 'objectives[].amount' },
    { n: 'obj_custoTotal', r: 'Custo total do objetivo', t: 'moeda', ajuda: 'Parcial ou financiado', plano: 'objectives[].preco (o valor do bem)' },
    { n: 'obj_comoComprar', r: 'Como pretende comprar?', t: 'select', op: ['À vista', 'Entrada + financiamento', 'Consórcio'], novo: true, motivo: 'A montagem pergunta "Como vai comprar" no cartão do objetivo; é intenção do cliente, não decisão do consultor', plano: 'objectives[].compra.modo' },
    { n: 'obj_temBemEntrada', r: 'Tem bem de entrada?', t: 'simnao', op: SIMNAO, plano: '"+ Financiar com patrimônio" no cartão do objetivo (o Sim/Não é a seção aberta)' },
    { n: 'obj_bemEntradaDesc', r: 'Qual bem?', t: 'texto', se: ['obj_temBemEntrada', 'Sim'], plano: 'patrimonio.bens[].venda.destinos (o bem vendido financia o objetivo)' },
    { n: 'obj_bemEntradaValor', r: 'Valor do bem de entrada', t: 'moeda', se: ['obj_temBemEntrada', 'Sim'], plano: 'patrimonio.bens[].venda (o valor da venda do bem que financia o objetivo)' },
    { n: 'obj_temCustoMensal', r: 'Gera custo mensal após realização?', t: 'simnao', op: SIMNAO, plano: '"+ Gasto depois de realizado" no cartão do objetivo (o Sim/Não é a seção aberta)' },
    { n: 'obj_custoMensal', r: 'Custo mensal após realização', t: 'moeda', se: ['obj_temCustoMensal', 'Sim'], plano: 'objectives[].costs[] (tipo fixo)' },
    { n: 'obj_aporteMensal', r: 'Quanto separar por mês para este objetivo', t: 'moeda', plano: 'objectives[].planned' },
    { n: 'obj_temSaldo', r: 'Já tem valor separado?', t: 'simnao', op: SIMNAO, plano: '"+ Financiar com patrimônio" (objectives[].dedicated)' },
    { n: 'obj_saldoAtual', r: 'Saldo já separado', t: 'moeda', se: ['obj_temSaldo', 'Sim'], plano: 'objectives[].dedicated' },
    { n: 'obj_planoAtual', r: 'Plano atual do cliente para este objetivo', t: 'textolongo', plano: 'objectives[].planoAtual (só a coleta mostra)' },
    { n: 'obj_obs', r: 'Observações', t: 'textolongo', plano: 'objectives[].obs (só a coleta mostra)' },
  ] },
  { lista: 'comprList', r: 'Compromissos financeiros', naoPossui: 'comprNaoPossui', tabela: 'coleta_compromisso', plano: 'compromissos[]', ajuda: 'Saídas grandes com data (uma reforma, um imposto): saem do patrimônio financeiro no mês marcado', campos: [
    { n: 'comp_titulo', r: 'Título', t: 'texto', plano: 'compromissos[].titulo' },
    { n: 'comp_descricao', r: 'Descrição', t: 'texto', plano: 'compromissos[].descricao' },
    { n: 'comp_data', r: 'Mês', t: 'mes', plano: 'compromissos[].em (calculado: meses a partir de hoje)' },
    { n: 'comp_valor', r: 'Valor', t: 'moeda', plano: 'compromissos[].valor' },
  ] },
] },

// ---------------------------------------------------------------- 02
{ id: 'orcamento', num: '02', titulo: 'Orçamento doméstico', itens: [
  { n: 'orcamentoModo', r: 'Periodicidade do orçamento', t: 'select', op: ['Mensal', 'Anual'], plano: 'periodicidade' },
  { n: 'declaredstandardofliving', r: 'Valor do orçamento doméstico (custo de vida)', t: 'moeda', ob: true, ajuda: 'Somente o valor de sua responsabilidade', plano: 'riscos.reserva.custoVida (ajuste); a linha "Custo de vida" do Fluxo quando não há despesas listadas', exame: 28 },
  { n: 'recentsavingsfrequency', r: 'Quantas vezes poupou esse valor nos últimos 12 meses?', t: 'select', ob: true, op: ['Nenhuma', '1-3', '4-6', '7-9', '10 ou mais'], plano: 'orcamento.vezesPoupou', exame: 3 },
  { n: 'doesbudgeting', r: 'Acompanha as despesas mensais do orçamento doméstico?', t: 'select', ob: true, op: ['Sim em detalhes', 'Sim parcialmente', 'Não mas tenho ideia', 'Não faço ideia'], plano: 'coleta.diagnostico.acompanhaOrcamento', exame: 27 },
  { n: 'declaredmonthlysavings', r: 'Quanto poupa por mês em média?', t: 'moeda', ob: true, plano: 'capacityOverride', exame: 2 },
  { n: 'pctDespesasTitular', r: 'Quanto das despesas da família o titular custeia (%)', t: 'pct', novo: true, se: ['planoTipo', 'Um casal ou uma família'], motivo: 'Lacuna 3 do COLETA.md: a % da renda de cada gerador nos seguros é hoje uma decisão subjetiva do consultor', plano: 'riscos.seguro.geradores[].participacao (o cônjuge fica com o resto)' },
  { lista: 'despList', r: 'Despesas da família, linha a linha', naoPossui: 'despNaoPossui', tabela: 'coleta_despesa', novo: true, motivo: 'Lacuna 4: a montagem pede cada despesa ao consultor; a coleta só tem o total. É o Orçamento (passo 2 da montagem) nascendo na reunião', plano: 'expenses[] (uma linha do Fluxo por despesa)', campos: [
    { n: 'desp_nome', r: 'Despesa', t: 'texto', plano: 'expenses[].label' },
    { n: 'desp_grupo', r: 'Fixa ou ajustável?', t: 'select', op: ['Fixa', 'Ajustável'], plano: 'expenses[].group (fix | adj)' },
    { n: 'desp_valor', r: 'Valor', t: 'moeda', plano: 'expenses[].steps[0].value' },
    { n: 'desp_frequencia', r: 'Frequência', t: 'select', op: ['Mensal', 'Anual', 'Semanal'], plano: 'expenses[].frequency' },
    { n: 'desp_mes', r: 'Em que mês (se anual)', t: 'select', op: MESES_ANO, se: ['desp_frequencia', 'Anual'], plano: 'expenses[].dates[].m' },
    { n: 'desp_obs', r: 'Observações', t: 'texto', plano: 'expenses[].description (a mesma descrição da gaveta do Fluxo)' },
  ] },
] },

// ---------------------------------------------------------------- 03
{ id: 'ativos', num: '03', titulo: 'Ativos, patrimônio e dívidas', itens: [
  { n: 'currentfinancialassets', r: 'Total de ativos financeiros', t: 'moeda', ob: true, ajuda: 'Sem imóveis e veículos', plano: 'exame.respostas.currentfinancialassets (a foto do exame); o plano usa a soma das listas, mostrada ao lado', exame: 9 },
  { n: 'currentreserve', r: 'Quanto deste valor é reserva de emergência?', t: 'moeda', ob: true, plano: 'riscos.reserva.atual', exame: 10 },
  { n: 'increasingreservemonthly', r: 'Está guardando mensalmente para aumentar a reserva?', t: 'simnao', ob: true, op: SIMNAO, plano: 'coleta.diagnostico.aumentaReserva', exame: 11 },
  { n: 'estimatedreserve', r: 'Valor ideal de reserva para o perfil do cliente', t: 'moeda', ob: true, plano: 'riscos.reserva.alvo (vazio: o ideal calculado)', exame: 12 },
  { n: 'currentassetscategories', r: 'Quais bens possui?', t: 'multi', op: ['Veículos', 'Casa', 'Apartamento', 'Imóveis Comerciais', 'Outros', 'Nenhum'], plano: 'calculada: sai de patrimonio.bens[] (não se grava)', exame: 13 },
  { n: 'currentassets', r: 'Valor estimado total dos bens', t: 'moeda', ajuda: 'Sem descontar financiamento', plano: 'exame.respostas.currentassets (a foto do exame); o plano usa a soma da lista, mostrada ao lado', exame: 15 },
  { lista: 'ativoFinList', r: 'Ativos financeiros', naoPossui: 'ativoFinNaoPossui', tabela: 'coleta_ativo_financeiro', plano: 'carteira.ativos[] (ativo a ativo) e patrimonio.financeiro[] (somados por instituição)', campos: [
    { n: 'af_tipo', r: 'Tipo do ativo', t: 'select', op: ['Conta Corrente', 'Renda Fixa', 'Fundo', 'Renda Variável', 'Carteira Diversificada', 'Carteira de Renda Variável', 'Carteira de Fundos Imobiliários', 'Criptoativos', 'Alternativos', 'Outros'], plano: 'carteira.ativos[].classe (por uma regra de classificação)' },
    { n: 'af_titular', r: 'De quem é', t: 'select', op: ['Titular', 'Cônjuge', 'Conjunta'], novo: true, motivo: 'A montagem pede a titularidade de cada instituição (patrimonio.financeiro[].titularidade) e de cada ativo (carteira.ativos[].titular)', plano: 'carteira.ativos[].titular, patrimonio.financeiro[].titularidade' },
    { n: 'af_saldo', r: 'Saldo atual', t: 'moeda', plano: 'carteira.ativos[].valor → patrimonio.financeiro[].valor' },
    { n: 'af_instituicao', r: 'Instituição', t: 'texto', plano: 'carteira.ativos[].instituicao → patrimonio.financeiro[].nome' },
    { n: 'af_rf_subclasse', r: 'Renda fixa: subclasse', t: 'select', op: ['Tesouro Selic', 'Tesouro IPCA+', 'Tesouro Pré', 'Tesouro Educa+', 'Tesouro Renda+', 'CDB/RDB', 'LCI/LCA', 'CRI/CRA', 'Debênture', 'LIG'], se: ['af_tipo', 'Renda Fixa'], plano: 'carteira.ativos[].subclasse' },
    { n: 'af_rf_indexador', r: 'Renda fixa: indexador', t: 'select', op: ['% do CDI', 'CDI+', 'Pré', 'IPCA+', 'Dólar+'], se: ['af_tipo', 'Renda Fixa'], plano: 'carteira.ativos[].classe (pós, pré ou inflação)' },
    { n: 'af_rf_emissor', r: 'Renda fixa: emissor', t: 'texto', se: ['af_tipo', 'Renda Fixa'], plano: 'carteira.ativos[] como na montagem (a Carteira atual, colada do extrato)' },
    { n: 'af_rf_rentabilidade', r: 'Renda fixa: rentabilidade', t: 'texto', se: ['af_tipo', 'Renda Fixa'], plano: 'carteira.ativos[] como na montagem (a Carteira atual, colada do extrato)' },
    { n: 'af_rf_dataAplicacao', r: 'Renda fixa: data da aplicação', t: 'data', se: ['af_tipo', 'Renda Fixa'], plano: 'carteira.ativos[] como na montagem (a Carteira atual, colada do extrato)' },
    { n: 'af_rf_prazo', r: 'Renda fixa: vencimento', t: 'data', se: ['af_tipo', 'Renda Fixa'], plano: 'carteira.ativos[].vencimento' },
    { n: 'af_rf_liquidez', r: 'Renda fixa: liquidez', t: 'select', op: ['Sim', 'Não', 'Após 30 dias', 'Após 60 dias', 'Após 120 dias'], se: ['af_tipo', 'Renda Fixa'], plano: 'riscos.liquidez (a escada de D+0 a 1 ano, calculável)' },
    { n: 'af_fn_subclasse', r: 'Fundo: subclasse', t: 'select', op: ['Liquidez', 'Renda Fixa', 'Multimercado', 'Ações Brasil', 'Ações Global', 'Cambial'], se: ['af_tipo', 'Fundo'], plano: 'carteira.ativos[].classe' },
    { n: 'af_fn_nome', r: 'Fundo: nome', t: 'texto', se: ['af_tipo', 'Fundo'], plano: 'carteira.ativos[].nome' },
    { n: 'af_fn_cnpj', r: 'Fundo: CNPJ', t: 'texto', se: ['af_tipo', 'Fundo'], plano: 'carteira.ativos[] como na montagem (a Carteira atual, colada do extrato)' },
    { n: 'af_fn_dataAplicacao', r: 'Fundo: data da aplicação', t: 'data', se: ['af_tipo', 'Fundo'], plano: 'carteira.ativos[] como na montagem (a Carteira atual, colada do extrato)' },
    { n: 'af_fn_prazoResgate', r: 'Fundo: prazo de resgate (dias)', t: 'numero', se: ['af_tipo', 'Fundo'], plano: 'carteira.ativos[].vencimento (D+n) → riscos.liquidez' },
    { n: 'af_rv_subclasse', r: 'Renda variável: subclasse', t: 'select', op: ['Ações Brasil', 'Derivativos', 'Ações Internacionais', 'FII', 'ETFs', 'FIAGRO', 'FI-Infra', 'BDRs', 'Commodities', 'Câmbio'], se: ['af_tipo', 'Renda Variável'], plano: 'carteira.ativos[].classe' },
    { n: 'af_rv_ticker', r: 'Renda variável: ticker', t: 'texto', se: ['af_tipo', 'Renda Variável'], plano: 'carteira.ativos[].nome' },
    { n: 'af_rv_precoMedio', r: 'Renda variável: preço médio', t: 'moeda', se: ['af_tipo', 'Renda Variável'], plano: 'carteira.ativos[] como na montagem (a Carteira atual, colada do extrato)' },
    { n: 'af_rv_dataAplicacao', r: 'Renda variável: data da compra', t: 'data', se: ['af_tipo', 'Renda Variável'], plano: 'carteira.ativos[] como na montagem (a Carteira atual, colada do extrato)' },
    { n: 'af_cd_perfil', r: 'Carteira: perfil de risco', t: 'select', op: ['Conservadora', 'Moderada', 'Arrojada', 'Agressiva'], se: ['af_tipo', 'Carteira Diversificada'], plano: 'diagnostico.perfil.presente (apoio)' },
    { n: 'af_cart_racional', r: 'Carteira: racional', t: 'multi', op: ['Convicções próprias', 'Instituição Financeira', 'Casa de Análise'], se: ['af_tipo', 'Carteira Diversificada'], plano: 'coleta.carteira.racional.<proprias, instituicao, casaAnalise> (uma marca por opção) e coleta.carteira.racionalObs, no bloco "Quem montou a carteira" da Carteira atual (só na coleta); não é carteira.justificativa, que é o porquê da recomendação' },
    { n: 'af_obs', r: 'Outros detalhes', t: 'textolongo', plano: 'carteira.ativos[].obs' },
  ] },
  { lista: 'bensList', r: 'Bens', naoPossui: 'bensNaoPossui', tabela: 'coleta_bem', plano: 'patrimonio.bens[]', campos: [
    { n: 'bem_tipo', r: 'Tipo do bem', t: 'select', op: ['Casa', 'Apartamento', 'Imóvel Comercial', 'Terreno', 'Carro', 'Moto', 'Outro'], plano: 'patrimonio.bens[].tipo (Casa, Apartamento, Imóvel Comercial, Terreno, Carro, Moto, Outro); decide as coberturas do seguro' },
    { n: 'bem_descricao', r: 'Descrição', t: 'texto', plano: 'bens[].nome' },
    { n: 'bem_valor', r: 'Valor estimado atual', t: 'moeda', plano: 'bens[].mercado' },
    { n: 'bem_titular', r: 'De quem é', t: 'select', op: ['Titular', 'Cônjuge', 'Do casal', 'Dividido com outras pessoas'], novo: true, motivo: 'A coleta pergunta "compartilhado?" sem dizer com quem; a montagem precisa da titularidade (titular, cônjuge, casal, outros)', plano: 'bens[].titularidade' },
    { n: 'bem_compartilhado', r: 'Compartilhado com outra pessoa?', t: 'simnao', op: SIMNAO, plano: 'bens[].titularidade' },
    { n: 'bem_percentual', r: 'Percentual do cliente (%)', t: 'pct', se: ['bem_compartilhado', 'Sim'], plano: 'bens[].titularPct' },
    { n: 'bem_percentualConjuge', r: 'Percentual do cônjuge (%)', t: 'pct', se: ['bem_compartilhado', 'Sim'], novo: true, motivo: 'O que falta para 100% é de outros (irmãos, sócios)', plano: 'bens[].conjugePct' },
    { n: 'bem_quitado', r: 'Quitado?', t: 'simnao', op: SIMNAO, plano: 'bens[].saldoDevedor zero ou não' },
    { n: 'bem_saldoDevedor', r: 'Saldo devedor', t: 'moeda', se: ['bem_quitado', 'Não'], plano: 'bens[].saldoDevedor' },
    { n: 'bem_parcela', r: 'Parcela mensal', t: 'moeda', se: ['bem_quitado', 'Não'], plano: 'bens[].parcela (e a linha "Parcela: nome" do Fluxo)' },
    { n: 'bem_credito', r: 'Valor financiado (crédito liberado)', t: 'moeda', se: ['bem_quitado', 'Não'], novo: true, motivo: 'Lacuna 6: o contrato do financiamento (a montagem calcula CET, saldo pelo contrato e quitação)', plano: 'bens[].credito' },
    { n: 'bem_parcelasContratadas', r: 'Parcelas contratadas', t: 'numero', se: ['bem_quitado', 'Não'], novo: true, plano: 'bens[].parcelas' },
    { n: 'bem_primeiraParcela', r: 'Mês da 1ª parcela', t: 'mes', se: ['bem_quitado', 'Não'], novo: true, plano: 'bens[].inicio (as parcelas restantes são calculadas)' },
    { n: 'bem_juros', r: 'Juros (% ao ano)', t: 'pct', se: ['bem_quitado', 'Não'], novo: true, plano: 'bens[].juros' },
    { n: 'bem_sistema', r: 'Sistema', t: 'select', op: ['SAC', 'Price', 'Não sabe'], se: ['bem_quitado', 'Não'], novo: true, plano: 'bens[].sistema' },
    { n: 'bem_situacao', r: 'Situação', t: 'select', op: ['Em dia', 'Em atraso'], se: ['bem_quitado', 'Não'], novo: true, plano: 'bens[].situacao' },
    { n: 'bem_geraRenda', r: 'Gera renda passiva?', t: 'simnao', op: SIMNAO, plano: 'patrimonio.bens[].renda (a renda ligada ao bem; sem ligação, não gera)' },
    { n: 'bem_rendaPassiva', r: 'Renda mensal (líquida)', t: 'moeda', se: ['bem_geraRenda', 'Sim'], plano: 'bens[].renda → a linha de renda passiva do Fluxo' },
    { n: 'bem_pensaVender', r: 'Pensa em vender este bem?', t: 'simnao', op: SIMNAO, novo: true, motivo: 'A venda planejada é pedida na montagem; a intenção é do cliente, o líquido é calculado', plano: 'bens[].venda' },
    { n: 'bem_vendaQuando', r: 'Quando (mês)', t: 'mes', se: ['bem_pensaVender', 'Sim'], novo: true, plano: 'bens[].venda.em' },
    { n: 'bem_vendaValor', r: 'Por quanto (vazio: o valor projetado)', t: 'moeda', se: ['bem_pensaVender', 'Sim'], novo: true, plano: 'bens[].venda.preco' },
    { n: 'bem_obs', r: 'Observações', t: 'textolongo', plano: 'patrimonio.bens[].obs (só a coleta mostra)' },
  ] },
  { lista: 'outrosAtivosList', r: 'Outros ativos', naoPossui: 'outrosAtivosNaoPossui', tabela: 'coleta_outro_ativo', plano: 'coleta.outrosAtivos[] (fora das somas do patrimônio; uma empresa vai para a lista de participações, abaixo)', campos: [
    { n: 'oa_titulo', r: 'Título', t: 'texto', plano: 'coleta.outrosAtivos[].titulo' },
    { n: 'oa_valor', r: 'Valor', t: 'moeda', plano: 'coleta.outrosAtivos[].valor (fora das somas do patrimônio)' },
    { n: 'oa_descricao', r: 'Descrição', t: 'texto', plano: 'coleta.outrosAtivos[].descricao' },
    { n: 'oa_geraRenda', r: 'Gera renda?', t: 'simnao', op: SIMNAO, plano: 'coleta.outrosAtivos[].geraRenda' },
    { n: 'oa_obs', r: 'Observações', t: 'textolongo', plano: 'coleta.outrosAtivos[].obs' },
  ] },
  { lista: 'participacoesList', r: 'Participações societárias (empresas)', naoPossui: 'participacoesNaoPossui', tabela: 'coleta_participacao', novo: true, motivo: 'Lacuna 5: a montagem pede empresa, regime tributário, faturamento e pró-labore ao consultor (sócios da Otimização tributária)', plano: 'patrimonio.participacoes[] e tributario.prolabore.socios[]', campos: [
    { n: 'part_empresa', r: 'Empresa', t: 'texto', plano: 'participacoes[].nome, socios[].empresa' },
    { n: 'part_socio', r: 'Quem é o sócio', t: 'select', op: PESSOA, plano: 'socios[].quem' },
    { n: 'part_pct', r: 'Participação do cliente (%)', t: 'pct', plano: 'patrimonio.participacoes[].pct (só a coleta mostra)' },
    { n: 'part_valor', r: 'Valor estimado da participação', t: 'moeda', plano: 'participacoes[].valor' },
    { n: 'part_regime', r: 'Regime tributário', t: 'select', op: ['Simples Nacional', 'Lucro Presumido', 'Lucro Real', 'MEI'], plano: 'socios[].regime' },
    { n: 'part_faturamento', r: 'Faturamento anual', t: 'moeda', plano: 'socios[].faturamento' },
    { n: 'part_prolabore', r: 'Pró-labore mensal (bruto)', t: 'moeda', plano: 'incomes[] (Pró-labore)' },
    { n: 'part_dividendos', r: 'Distribuição de lucros mensal (média)', t: 'moeda', plano: 'incomes[] (Distribuição de lucros)' },
    { n: 'part_pensaVender', r: 'Pensa em vender a participação?', t: 'simnao', op: SIMNAO, plano: 'participacoes[].venda' },
  ] },
  { n: 'hasdebts', r: 'Possui outras dívidas?', t: 'simnao', ob: true, op: SIMNAO, ajuda: 'Além dos financiamentos', plano: 'Não: coleta.naoTem.dividas', exame: 17 },
  { n: 'currentliabilities', r: 'Saldo devedor total (dívidas + financiamentos)', t: 'moeda', ob: true, plano: 'exame.respostas.currentliabilities (a foto do exame); o plano usa a soma das listas, mostrada ao lado', exame: 18 },
  { lista: 'dividasList', r: 'Dívidas, uma a uma', naoPossui: 'dividasNaoPossui', tabela: 'coleta_divida', novo: true, motivo: 'Lacuna 6: a coleta tem só o total; a montagem lista cada dívida com o contrato (patrimonio.dividas[])', plano: 'patrimonio.dividas[]', campos: [
    { n: 'div_nome', r: 'Dívida', t: 'texto', plano: 'dividas[].nome' },
    { n: 'div_tipo', r: 'Tipo', t: 'select', op: ['Cartão de crédito', 'Cheque especial', 'Empréstimo pessoal', 'Consignado', 'Financiamento de veículo', 'Consórcio', 'Empréstimo com pessoa', 'Outro'], plano: 'dividas[].modalidade (consórcio) e juros padrão' },
    { n: 'div_credor', r: 'Credor', t: 'texto', plano: 'patrimonio.dividas[].credor (só a coleta mostra)' },
    { n: 'div_saldoDevedor', r: 'Saldo devedor hoje', t: 'moeda', plano: 'dividas[].saldoDevedor' },
    { n: 'div_parcela', r: 'Parcela mensal', t: 'moeda', plano: 'dividas[].parcela' },
    { n: 'div_parcelasRestantes', r: 'Parcelas restantes', t: 'numero', plano: 'dividas[].restantes' },
    { n: 'div_juros', r: 'Juros (% ao mês)', t: 'pct', plano: 'dividas[].juros (jurosPeriodo: mes)' },
    { n: 'div_situacao', r: 'Situação', t: 'select', op: ['Em dia', 'Em atraso'], plano: 'dividas[].situacao' },
  ] },
] },

// ---------------------------------------------------------------- 04
{ id: 'protecao', num: '04', titulo: 'Proteção', itens: [
  { n: 'seg_auto_protegido', r: 'Automóvel: protegido?', t: 'simnao', op: SIMNAO, plano: 'bens[].protecao do carro' },
  { n: 'seg_auto_seguradora', r: 'Seguradora', t: 'texto', se: ['seg_auto_protegido', 'Sim'], plano: 'bens[].apolice.seguradora' },
  { n: 'seg_auto_bem', r: 'Bem segurado', t: 'texto', se: ['seg_auto_protegido', 'Sim'], plano: 'o próprio bem (patrimonio.bens[], tipo Carro ou Moto)' },
  { n: 'seg_auto_cobIncendio', r: 'Cobertura incêndio/roubo/colisão', t: 'texto', se: ['seg_auto_protegido', 'Sim'], plano: 'patrimonio.bens[].apolice.casco' },
  { n: 'seg_auto_cobAPP', r: 'Cobertura APP', t: 'texto', se: ['seg_auto_protegido', 'Sim'], plano: 'patrimonio.bens[].apolice.app' },
  { n: 'seg_auto_cobRCVF', r: 'Cobertura RCV-F (danos a terceiros)', t: 'moeda', se: ['seg_auto_protegido', 'Sim'], plano: 'patrimonio.bens[].apolice.rcfMateriais e .rcfCorporais (e .danosMorais)' },
  { n: 'seg_auto_premio', r: 'Prêmio anual', t: 'moeda', se: ['seg_auto_protegido', 'Sim'], plano: 'patrimonio.bens[].apolice.premio (o carro); a despesa no Orçamento' },
  { n: 'seg_auto_mesRenovacao', r: 'Mês de renovação', t: 'select', op: MESES_ANO, se: ['seg_auto_protegido', 'Sim'], plano: 'patrimonio.bens[].apolice.renovacao (1 a 12)' },
  { n: 'seg_auto_obs', r: 'Observações', t: 'textolongo', se: ['seg_auto_protegido', 'Sim'], plano: 'patrimonio.bens[].apolice.obs' },
  { n: 'seg_res_protegido', r: 'Residencial: protegido?', t: 'simnao', op: SIMNAO, plano: 'bens[].protecao do imóvel' },
  { n: 'seg_res_seguradora', r: 'Seguradora', t: 'texto', se: ['seg_res_protegido', 'Sim'], plano: 'bens[].apolice.seguradora' },
  { n: 'seg_res_imovel', r: 'Imóvel segurado', t: 'texto', se: ['seg_res_protegido', 'Sim'], plano: 'o próprio bem (patrimonio.bens[], tipo Casa, Apartamento, Imóvel Comercial ou Terreno)' },
  { n: 'seg_res_cobIncendio', r: 'Cobertura incêndio', t: 'texto', se: ['seg_res_protegido', 'Sim'], plano: 'patrimonio.bens[].apolice.incendio' },
  { n: 'seg_res_cobDanosEletricos', r: 'Cobertura danos elétricos', t: 'texto', se: ['seg_res_protegido', 'Sim'], plano: 'patrimonio.bens[].apolice.danosEletricos' },
  { n: 'seg_res_cobSubtracao', r: 'Cobertura subtração de bens', t: 'texto', se: ['seg_res_protegido', 'Sim'], plano: 'patrimonio.bens[].apolice.subtracao' },
  { n: 'seg_res_cobRCFamiliar', r: 'Cobertura RC familiar', t: 'moeda', se: ['seg_res_protegido', 'Sim'], plano: 'patrimonio.bens[].apolice.rcFamiliar' },
  { n: 'seg_res_premio', r: 'Prêmio anual', t: 'moeda', se: ['seg_res_protegido', 'Sim'], plano: 'patrimonio.bens[].apolice.premio (o imóvel); a despesa no Orçamento' },
  { n: 'seg_res_mesRenovacao', r: 'Mês de renovação', t: 'select', op: MESES_ANO, se: ['seg_res_protegido', 'Sim'], plano: 'patrimonio.bens[].apolice.renovacao (1 a 12)' },
  { n: 'seg_res_obs', r: 'Observações', t: 'textolongo', se: ['seg_res_protegido', 'Sim'], plano: 'patrimonio.bens[].apolice.obs' },
  { n: 'seg_rcprof_protegido', r: 'Responsabilidade civil profissional: tem seguro?', t: 'simnao', op: SIMNAO, novo: true, motivo: 'Lacuna 8: a montagem avalia a RC profissional em danos a terceiros e a coleta não pergunta', plano: 'riscos.terceiros.itens[Responsabilidade civil profissional]' },
  { n: 'seg_rcprof_valorCoberto', r: 'Valor coberto', t: 'moeda', se: ['seg_rcprof_protegido', 'Sim'], novo: true, plano: 'riscos.terceiros.itens[].atual' },
  { lista: 'segVidaList', r: 'Seguro de vida', naoPossui: 'seg_vida_protegido', tabela: 'coleta_seguro_vida', plano: 'riscos.seguro.geradores[].coberturaVida', ajuda: 'Na coleta atual é um bloco só, do titular (seg_vida_*); aqui é uma linha por pessoa segurada', campos: [
    { n: 'seg_vida_pessoa', r: 'Pessoa segurada', t: 'select', op: PESSOA, novo: true, motivo: 'Lacuna 1: o cônjuge não tem seguros na coleta', plano: 'geradores[].pessoa' },
    { n: 'seg_vida_seguradora', r: 'Seguradora', t: 'texto', plano: 'coleta.apolices[].seguradora' },
    { n: 'seg_vida_valorCoberto', r: 'Valor coberto', t: 'moeda', plano: 'coleta.apolices[].coberturas[].valor (tipo morte); a soma por pessoa é geradores[].coberturaVida' },
    { n: 'seg_vida_premio', r: 'Prêmio mensal', t: 'moeda', plano: 'coleta.apolices[].coberturas[].premio (no período de coleta.apolices[].periodicidade)' },
    { n: 'seg_vida_tipo', r: 'Tipo', t: 'select', op: ['Anual', 'Termo', 'Vitalício'], plano: 'coleta.apolices[].coberturas[].vigencia (Anual → anual, Termo → prazo, Vitalício → vitalicia)' },
    { n: 'seg_vida_prazoCobertura', r: 'Prazo de cobertura', t: 'texto', plano: 'coleta.apolices[].coberturas[].vigenciaPrazo' },
    { n: 'seg_vida_obs', r: 'Observações', t: 'textolongo', plano: 'coleta.apolices[].obs' },
  ] },
  { lista: 'segAcidList', r: 'Seguro de acidentes pessoais (invalidez)', naoPossui: 'seg_acid_protegido', tabela: 'coleta_seguro_acidentes', plano: 'riscos.seguro.geradores[].coberturaInvalidez', campos: [
    { n: 'seg_acid_pessoa', r: 'Pessoa segurada', t: 'select', op: PESSOA, novo: true, plano: 'geradores[].pessoa' },
    { n: 'seg_acid_seguradora', r: 'Seguradora', t: 'texto', plano: 'coleta.apolices[].seguradora' },
    { n: 'seg_acid_valorCoberto', r: 'Valor coberto', t: 'moeda', plano: 'coleta.apolices[].coberturas[].valor (tipo ipa); a soma por pessoa é geradores[].coberturaInvalidez' },
    { n: 'seg_acid_premio', r: 'Prêmio mensal', t: 'moeda', plano: 'coleta.apolices[].coberturas[].premio' },
    { n: 'seg_acid_obs', r: 'Observações', t: 'textolongo', plano: 'coleta.apolices[].obs' },
  ] },
  { n: 'seg_saude_protegido', r: 'Plano de saúde: tem?', t: 'simnao', op: SIMNAO, plano: 'Não: coleta.naoTem.saude; Sim: as vidas em riscos.saude.vidas[]' },
  { n: 'seg_saude_tipo', r: 'Tipo de plano', t: 'select', op: ['Pela Empresa', 'PME', 'Empresarial', 'Adesão', 'Familiar'], se: ['seg_saude_protegido', 'Sim'], plano: 'riscos.saude.tipo' },
  { n: 'seg_saude_operadora', r: 'Operadora', t: 'texto', se: ['seg_saude_protegido', 'Sim'], plano: 'riscos.saude.operadora (operadora e plano num campo)' },
  { n: 'seg_saude_nomePlano', r: 'Nome do plano', t: 'texto', se: ['seg_saude_protegido', 'Sim'], plano: 'riscos.saude.operadora (junto com a operadora)' },
  { lista: 'saudeVidasList', r: 'Vidas no plano de saúde', naoPossui: null, tabela: 'coleta_saude_vida', novo: true, se: ['seg_saude_protegido', 'Sim'], motivo: 'Lacuna 7: a montagem pede cada vida, o prêmio e quem paga', plano: 'riscos.saude.vidas[]', campos: [
    { n: 'sv_quem', r: 'Quem', t: 'select', op: ['Titular', 'Cônjuge', 'Dependente'], plano: 'saude.vidas[].nome e idade (ligadas às pessoas da família)' },
    { n: 'sv_nome', r: 'Nome (se dependente)', t: 'texto', se: ['sv_quem', 'Dependente'], plano: 'saude.vidas[].nome' },
    { n: 'sv_premio', r: 'Prêmio mensal desta vida', t: 'moeda', plano: 'saude.vidas[].premio' },
    { n: 'sv_pagador', r: 'Quem paga', t: 'select', op: ['A família', 'A empresa ou outra pessoa'], plano: 'saude.vidas[].pagador' },
  ] },
] },

// ---------------------------------------------------------------- 05
{ id: 'aposentadoria', num: '05', titulo: 'Aposentadoria', itens: [
  { n: 'startingworkingage', r: 'Idade em que começou a trabalhar', t: 'numero', ob: true, plano: 'patrimonio.comecou', exame: 19 },
  { n: 'retiringtargetage', r: 'Pretende trabalhar até qual idade?', t: 'numero', ob: true, plano: 'retireAge', exame: 20 },
  { n: 'conjugeStartingWorkingAge', r: 'Cônjuge: idade em que começou a trabalhar', t: 'numero', novo: true, se: ['planoTipo', 'Um casal ou uma família'], motivo: 'Lacuna 1: a fase da vida é de cada pessoa', plano: 'patrimonio.conjugeComecou' },
  { n: 'conjugeRetiringTargetAge', r: 'Cônjuge: pretende trabalhar até qual idade?', t: 'numero', novo: true, se: ['planoTipo', 'Um casal ou uma família'], motivo: 'A liberdade começa quando o primeiro para', plano: 'spouseRetireAge' },
  { n: 'rendaDesejadaAposentadoria', r: 'Renda desejada na aposentadoria (por mês, em valores de hoje)', t: 'moeda', plano: 'desired' },
  { n: 'hasretiringstrategies', r: 'Tem plano concreto de onde virá a renda?', t: 'simnao', ob: true, op: SIMNAO, plano: 'coleta.aposentadoria.temPlano', exame: 21 },
  { n: 'currentretiringstrategies', r: 'Qual seria o plano?', t: 'multi', op: ['Pensão pública (INSS/RPPS)', 'Pensão privada', 'Investimentos'], se: ['hasretiringstrategies', 'Sim'], plano: 'coleta.aposentadoria.fontes.<publica|privada|investimentos|imoveis> (uma marca por opção)', exame: 22 },
  { n: 'executingretiringstrategies', r: 'O que está executando hoje?', t: 'multi', op: ['INSS', 'Previdência da empresa', 'Investimentos ou previdência privada'], se: ['hasretiringstrategies', 'Sim'], plano: 'coleta.aposentadoria.executa.<publica|empresa|privada> (uma marca por opção)', exame: 23 },
  { n: 'prevPublicaTipo', r: 'Tipo de previdência pública', t: 'select', op: ['INSS', 'RPPS', 'Nenhuma'], plano: 'coleta.prevPublica.titular.tipo (inss, rpps, nenhuma); com benefício, uma renda em passive[] (origin "Contribuições previdenciárias", pessoa titular)' },
  { n: 'prevPublicaIdadeBeneficio', r: 'Idade estimada para receber o benefício', t: 'numero', plano: 'passive[].startMi (calculado da idade)' },
  { n: 'prevPublicaValorBeneficio', r: 'Valor estimado do benefício (mensal)', t: 'moeda', plano: 'passive[].net' },
  { n: 'prevPublicaInvalidez', r: 'Benefício estimado por invalidez (mensal)', t: 'moeda', novo: true, motivo: 'Lacuna 8: os seguros descontam o INSS por invalidez e por morte', plano: 'riscos.seguro.geradores[titular].inssInvalidez' },
  { n: 'prevPublicaMorte', r: 'Pensão por morte estimada (mensal)', t: 'moeda', novo: true, plano: 'riscos.seguro.geradores[titular].inssMorte' },
  { n: 'prevPublicaDataInicio', r: 'Primeira contribuição (mês)', t: 'mes', plano: 'coleta.prevPublica.titular.inicio ("AAAA-MM")' },
  { n: 'prevPublicaNContrib', r: 'Número de contribuições', t: 'numero', plano: 'coleta.prevPublica.titular.nContrib' },
  { n: 'prevPublicaValorMedioContrib', r: 'Valor médio das contribuições', t: 'moeda', plano: 'coleta.prevPublica.titular.valorMedio' },
  { n: 'prevPublicaValorAtualContrib', r: 'Valor atual da contribuição', t: 'moeda', plano: 'coleta.prevPublica.titular.valorAtual' },
  { n: 'prevPublicaObs', r: 'Observações (RPPS)', t: 'textolongo', plano: 'coleta.prevPublica.titular.obs (o mesmo para o cônjuge, em coleta.prevPublica.conjuge)' },
  { n: 'conjugePrevPublicaTipo', r: 'Cônjuge: tipo de previdência pública', t: 'select', op: ['INSS', 'RPPS', 'Nenhuma'], novo: true, se: ['planoTipo', 'Um casal ou uma família'], plano: 'coleta.prevPublica.conjuge.tipo; a renda em passive[] com pessoa conjuge' },
  { n: 'conjugePrevPublicaIdadeBeneficio', r: 'Cônjuge: idade estimada do benefício', t: 'numero', novo: true, se: ['planoTipo', 'Um casal ou uma família'], plano: 'passive[].startMi' },
  { n: 'conjugePrevPublicaValorBeneficio', r: 'Cônjuge: valor estimado do benefício', t: 'moeda', novo: true, se: ['planoTipo', 'Um casal ou uma família'], plano: 'passive[].net' },
  { n: 'conjugePrevPublicaInvalidez', r: 'Cônjuge: benefício por invalidez', t: 'moeda', novo: true, se: ['planoTipo', 'Um casal ou uma família'], plano: 'geradores[conjuge].inssInvalidez' },
  { n: 'conjugePrevPublicaMorte', r: 'Cônjuge: pensão por morte', t: 'moeda', novo: true, se: ['planoTipo', 'Um casal ou uma família'], plano: 'geradores[conjuge].inssMorte' },
  { lista: 'prevFechadaList', r: 'Previdência fechada (fundo de pensão)', naoPossui: 'prevFechadaNaoPossui', tabela: 'coleta_prev_fechada', plano: 'patrimonio.financeiro[] com tipo fechada (a caixa à parte, conv)', campos: [
    { n: 'pf_pessoa', r: 'De quem é', t: 'select', op: PESSOA, novo: true, plano: 'financeiro[].titularidade' },
    { n: 'pf_entidade', r: 'Entidade', t: 'texto', plano: 'financeiro[].nome' },
    { n: 'pf_tipo', r: 'Tipo', t: 'select', op: ['PGBL', 'Fundo de Pensão'], plano: 'financeiro[].tipo' },
    { n: 'pf_regime', r: 'Regime', t: 'select', op: ['Regressivo', 'Progressivo'], plano: 'patrimonio.financeiro[].detalhe.regime' },
    { n: 'pf_nomeFundo', r: 'Nome do fundo', t: 'texto', plano: 'patrimonio.financeiro[].detalhe.nomeFundo' },
    { n: 'pf_cnpj', r: 'CNPJ', t: 'texto', plano: 'patrimonio.financeiro[].detalhe.cnpj' },
    { n: 'pf_perfilRisco', r: 'Perfil de risco', t: 'select', op: ['Conservador', 'Moderado', 'Arrojado', 'Agressivo'], plano: 'patrimonio.financeiro[].detalhe.perfil' },
    { n: 'pf_contribuicao', r: 'Contribuição mensal', t: 'moeda', plano: 'financeiro[].conv.contribPessoa (e a despesa no Fluxo)' },
    { n: 'pf_contrapartida', r: 'Contrapartida do patrocinador (mensal)', t: 'moeda', plano: 'financeiro[].conv.contribPatroc' },
    { n: 'pf_saldo', r: 'Saldo atual', t: 'moeda', plano: 'financeiro[].valor' },
    { n: 'pf_dataEntrada', r: 'Data de entrada', t: 'data', plano: 'patrimonio.financeiro[].detalhe.dataEntrada' },
    { n: 'pf_nContrib', r: 'Número de contribuições', t: 'numero', plano: 'patrimonio.financeiro[].detalhe.nContrib' },
    { n: 'pf_vestingProprio', r: 'Vesting (parte própria)', t: 'texto', plano: 'patrimonio.financeiro[].detalhe.vestingProprio' },
    { n: 'pf_vestingPatroc', r: 'Vesting (patrocinador)', t: 'texto', plano: 'patrimonio.financeiro[].detalhe.vestingPatroc' },
    { n: 'pf_obs', r: 'Observações', t: 'textolongo', plano: 'patrimonio.financeiro[].detalhe.obs' },
  ] },
  { lista: 'prevAbertaList', r: 'Previdência aberta (PGBL, VGBL)', naoPossui: 'prevAbertaNaoPossui', tabela: 'coleta_prev_aberta', plano: 'patrimonio.financeiro[] com tipo pgbl ou vgbl; carteira.ativos[]', campos: [
    { n: 'pa_pessoa', r: 'De quem é', t: 'select', op: PESSOA, novo: true, plano: 'financeiro[].titularidade' },
    { n: 'pa_tipo', r: 'Tipo do plano', t: 'select', op: ['PGBL', 'VGBL', 'FGB'], plano: 'financeiro[].tipo' },
    { n: 'pa_saldo', r: 'Saldo atual total', t: 'moeda', plano: 'financeiro[].valor; tributario.previdencia.inicial' },
    { n: 'pa_contribuicao', r: 'Contribuição mensal atual', t: 'moeda', plano: 'tributario.ir.atual.lanc[].pgbl (× 12, se PGBL); tributario.previdencia.aporte' },
    { n: 'pa_regime', r: 'Regime', t: 'select', op: ['Regressivo', 'Progressivo'], plano: 'carteira.ativos[].prev.regime (sem carteira: patrimonio.financeiro[].prev.regime)' },
    { n: 'pa_nomeFundo', r: 'Nome do fundo', t: 'texto', plano: 'carteira.ativos[].nome' },
    { n: 'pa_cnpj', r: 'CNPJ', t: 'texto', plano: 'carteira.ativos[].prev.cnpj (ou financeiro[].prev)' },
    { n: 'pa_perfilRisco', r: 'Perfil de risco', t: 'select', op: ['Conservador', 'Moderado', 'Arrojado', 'Agressivo'], plano: 'carteira.ativos[].prev.perfil (ou financeiro[].prev)' },
    { n: 'pa_dataInicio', r: 'Data de início', t: 'data', plano: 'carteira.ativos[].prev.dataInicio (ou financeiro[].prev); diz a faixa da tabela regressiva' },
    { n: 'pa_obs', r: 'Observações', t: 'textolongo', plano: 'carteira.ativos[].prev.obs (ou financeiro[].prev)' },
  ] },
] },

// ---------------------------------------------------------------- 06
{ id: 'financeiro', num: '06', titulo: 'Financeiro e contábil', itens: [
  { n: 'incomenature', r: 'Natureza da principal fonte de renda', t: 'select', ob: true, op: ['CLT', 'Servidor Público', 'Aposentadoria/Pensão', 'Profissional Liberal/Autônomo', 'Empresário', 'Sem Renda'], plano: 'rendasAtivas[0].natureza do titular', exame: 24 },
  { n: 'declaredincome', r: 'Renda líquida mensal', t: 'moeda', ob: true, plano: 'incomes[] (a renda principal do titular)', exame: 25 },
  { n: 'conjugeIncomenature', r: 'Cônjuge: natureza da principal fonte de renda', t: 'select', op: ['CLT', 'Servidor Público', 'Aposentadoria/Pensão', 'Profissional Liberal/Autônomo', 'Empresário', 'Sem Renda'], novo: true, se: ['planoTipo', 'Um casal ou uma família'], motivo: 'Lacuna 1 e 2: a coleta é de uma pessoa; a montagem precisa da natureza de cada responsável (reserva ideal, fase da vida)', plano: 'rendasAtivas[].natureza do cônjuge' },
  { n: 'irRegime', r: 'Regime de declaração do IR', t: 'select', op: ['Simplificado', 'Completo', 'Não declara'], plano: 'coleta.ir.modelo' },
  { n: 'irDespesasMedicas', r: 'Despesas médicas na última declaração (ano)', t: 'moeda', novo: true, motivo: 'A montagem pede ao consultor; o valor da última declaração é fato do cliente (o consultor decide o que é dedutível)', plano: 'coleta.ir.despesasMedicas (no ano; ponto de partida para tributario.ir.atual.lanc[].med)' },
  { n: 'irInstrucao', r: 'Despesas com instrução na última declaração (ano)', t: 'moeda', novo: true, plano: 'coleta.ir.instrucao (no ano; ponto de partida para tributario.ir.atual.lanc[].instr)' },
  { lista: 'rendaAtivaList', r: 'Renda ativa (fontes de renda do trabalho)', naoPossui: 'rendaAtivaNaoPossui', tabela: 'coleta_renda_ativa', plano: 'incomes[] de tipo ativa e rendasAtivas[] (profissão, natureza, horas)', ajuda: 'Na coleta atual é "outras fontes", além da principal', campos: [
    { n: 'ra_pessoa', r: 'De quem é', t: 'select', op: PESSOA, novo: true, motivo: 'Lacuna 2: de quem é cada renda', plano: 'incomes[].pessoa, rendasAtivas[].pessoa' },
    { n: 'ra_descricao', r: 'Fonte ou profissão', t: 'texto', novo: true, plano: 'incomes[].label, rendasAtivas[].profissao' },
    { n: 'ra_regime', r: 'Regime de trabalho', t: 'select', op: ['CLT', 'Profissional Liberal/Autônomo', 'Empresário', 'Servidor Público'], plano: 'incomes[].origin (Salário, Honorários, Pró-labore) e rendasAtivas[].natureza' },
    { n: 'ra_horas', r: 'Horas de trabalho por mês', t: 'numero', plano: 'rendasAtivas[].horas' },
    { n: 'ra_rendaBruta', r: 'Renda bruta mensal', t: 'moeda', plano: 'incomes[].gross' },
    { n: 'ra_rendaLiquida', r: 'Renda líquida mensal', t: 'moeda', plano: 'incomes[].steps[0].value' },
    { n: 'ra_certeza', r: 'Essa renda é', t: 'select', op: ['Certa', 'Estimada (varia)'], novo: true, motivo: 'Lacuna 2: renda certa ou estimada (pendência 1 do VARIAVEIS.md)', plano: 'incomes[].certeza (Certa, Estimada (varia))' },
    { n: 'ra_diaRecebimento', r: 'Dia do recebimento', t: 'numero', novo: true, plano: 'incomes[].days[0]' },
    { n: 'ra_comissoes', r: 'Comissões (mensal, média)', t: 'moeda', plano: 'incomes[] (Remuneração variável)' },
    { n: 'ra_decimo', r: 'Recebe 13º salário?', t: 'simnao', op: SIMNAO, plano: 'incomes[] (13º salário, segue o salário)' },
    { n: 'ra_bonus', r: 'Bônus anual', t: 'moeda', plano: 'incomes[] (Bônus, anual)' },
    { n: 'ra_plr', r: 'PLR anual', t: 'moeda', plano: 'incomes[] (PLR, anual, não tributável)' },
    { n: 'ra_obs', r: 'Observações', t: 'textolongo', plano: 'incomes[].description' },
  ] },
  { lista: 'rendaPassivaList', r: 'Renda passiva', naoPossui: 'rendaPassivaNaoPossui', tabela: 'coleta_renda_passiva', plano: 'incomes[] de tipo passiva', campos: [
    { n: 'rp_pessoa', r: 'De quem é', t: 'select', op: PESSOA, novo: true, plano: 'incomes[].pessoa' },
    { n: 'rp_tipo', r: 'Tipo da renda passiva', t: 'select', op: ['Investimentos Financeiros', 'Imóveis', 'Negócios', 'Pensão', 'Assistência', 'Outro'], plano: 'incomes[].origin' },
    { n: 'rp_ativo', r: 'Ativo que gera esta renda', t: 'texto', plano: 'a ligação com o bem (bens[].renda)' },
    { n: 'rp_rendaBruta', r: 'Renda bruta mensal esperada', t: 'moeda', plano: 'incomes[].gross' },
    { n: 'rp_rendaLiquida', r: 'Renda líquida mensal esperada', t: 'moeda', plano: 'incomes[].steps[0].value' },
    { n: 'rp_obs', r: 'Observações', t: 'textolongo', plano: 'incomes[].description' },
  ] },
] },

// ---------------------------------------------------------------- 07
{ id: 'cenario', num: '07', titulo: 'Cenário atual', itens: [
  { n: 'hasdependents', r: 'Tem dependentes financeiros?', t: 'simnao', ob: true, op: SIMNAO, plano: 'riscos.reserva.dependentes (com a lista, é ela que decide)', exame: 26 },
  { n: 'hadprofessionalvalidation', r: 'Já teve produtos financeiros avaliados por um profissional?', t: 'simnao', ob: true, op: SIMNAO, plano: 'coleta.diagnostico.validacaoProfissional', exame: 29 },
  { n: 'moradiaEstrutura', r: 'Estrutura de moradia atual', t: 'select', op: ['Aluguel', 'Imóvel Financiado', 'Imóvel Quitado', 'Com Terceiros'], plano: 'coleta.moradia (o aluguel é uma despesa fixa; o imóvel, um bem)' },
  { n: 'moradiaValorAluguel', r: 'Valor do aluguel', t: 'moeda', se: ['moradiaEstrutura', 'Aluguel'], plano: 'expenses[] "Moradia (aluguel)", marcada coleta: aluguel (a despesa fixa do Orçamento)' },
  { n: 'moradiaValorImovel', r: 'Valor do imóvel', t: 'moeda', se: ['moradiaEstrutura', 'Imóvel Financiado'], plano: 'bens[] (repete o imóvel da lista de bens: a lista vale)' },
  { n: 'moradiaSaldoDevedor', r: 'Saldo devedor', t: 'moeda', se: ['moradiaEstrutura', 'Imóvel Financiado'], plano: 'bens[].saldoDevedor (idem)' },
  { n: 'moradiaParcela', r: 'Parcela mensal', t: 'moeda', se: ['moradiaEstrutura', 'Imóvel Financiado'], plano: 'bens[].parcela (idem)' },
  { n: 'fgts', r: 'Saldo de FGTS', t: 'moeda', plano: 'patrimonio.financeiro[] com tipo fgts' },
  { n: 'conjugeFgts', r: 'Cônjuge: saldo de FGTS', t: 'moeda', novo: true, se: ['planoTipo', 'Um casal ou uma família'], plano: 'patrimonio.financeiro[] com tipo fgts, titularidade conjuge' },
  { n: 'moradiaObs', r: 'Observações', t: 'textolongo', plano: 'coleta.moradiaObs' },
  { lista: 'depList', r: 'Família e dependentes', naoPossui: 'depNaoPossui', tabela: 'coleta_dependente', plano: 'riscos.dependentes[]', campos: [
    { n: 'dep_relacao', r: 'Relação', t: 'select', op: ['Filho(a)', 'Cônjuge', 'Companheiro(a)', 'Pai/Mãe', 'Outro'], plano: 'dependentes[].relacao (filho, conjuge, pai, outro)' },
    { n: 'dep_nome', r: 'Nome', t: 'texto', plano: 'dependentes[].nome' },
    { n: 'dep_idade', r: 'Idade atual', t: 'numero', plano: 'dependentes[].nasc (aproximado, quando não há a data)' },
    { n: 'dep_nascimento', r: 'Data de nascimento', t: 'data', novo: true, motivo: 'A montagem pede mês e ano (o seguro de vida vai até a idade em que o dependente deixa de depender)', plano: 'dependentes[].nasc' },
    { n: 'dep_ateIdade', r: 'Depende até que idade?', t: 'numero', novo: true, motivo: 'Vazio: 25 para filhos, 95 para adultos', plano: 'dependentes[].ate' },
    { n: 'dep_dependencia', r: 'Tipo de dependência', t: 'select', op: ['Total', 'Parcial'], plano: 'riscos.dependentes[].dependencia (Total, Parcial)' },
    { n: 'dep_custo', r: 'Custo mensal estimado', t: 'moeda', plano: 'riscos.dependentes[].custo (só a coleta mostra; as despesas ficam no Orçamento)' },
    { n: 'dep_obs', r: 'Observações', t: 'textolongo', plano: 'riscos.dependentes[].obs' },
  ] },
] },

// ---------------------------------------------------------------- 08
{ id: 'pessoais', num: '08', titulo: 'Dados pessoais', itens: [
  { n: 'maritalstatus', r: 'Estado civil', t: 'select', ob: true, op: ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Separado(a)', 'Viúvo(a)'], plano: 'coleta.pessoal.estadoCivil', exame: 30 },
  { n: 'planoTipo', r: 'O planejamento é de', t: 'select', op: ['Uma pessoa', 'Um casal ou uma família'], novo: true, motivo: 'Lacuna 1: a coleta é de uma pessoa; a montagem começa por "O plano é de"', plano: 'tipo (individual | familia)' },
  { n: 'usergender', r: 'Gênero', t: 'select', ob: true, op: ['Feminino', 'Masculino', 'Outro', 'Prefiro não declarar'], plano: 'coleta.pessoal.genero', exame: 31 },
  { n: 'dateofbirth', r: 'Data de nascimento', t: 'data', ob: true, plano: 'nascimento (age é calculada)', exame: 32 },
  { n: 'useremail', r: 'E-mail', t: 'email', ob: true, plano: 'coleta.pessoal.email (na plataforma, o cadastro)', exame: 33 },
  { n: 'userphone', r: 'Telefone / WhatsApp', t: 'tel', ob: true, plano: 'coleta.pessoal.telefone (na plataforma, o cadastro)' },
  { n: 'conjugeNome', r: 'Nome completo do cônjuge', t: 'texto', novo: true, se: ['planoTipo', 'Um casal ou uma família'], plano: 'conjugeNome' },
  { n: 'conjugeDateofbirth', r: 'Data de nascimento do cônjuge', t: 'data', novo: true, se: ['planoTipo', 'Um casal ou uma família'], plano: 'conjugeNascimento (spouseAge é calculada)' },
  { n: 'conjugeGenero', r: 'Gênero do cônjuge', t: 'select', op: ['Feminino', 'Masculino', 'Outro', 'Prefiro não declarar'], novo: true, se: ['planoTipo', 'Um casal ou uma família'], plano: 'coleta.pessoal.conjugeGenero' },
  { n: 'regimeBens', r: 'Regime de bens', t: 'select', op: ['Comunhão parcial', 'Comunhão universal', 'Separação total', 'Participação final nos aquestos', 'União estável sem contrato'], novo: true, se: ['planoTipo', 'Um casal ou uma família'], motivo: 'Decide a titularidade padrão dos bens e a sucessão', plano: 'coleta.pessoal.regimeBens' },
] },

// ---------------------------------------------------------------- 09
{ id: 'perfil', num: '09', titulo: 'Perfil e comportamento', itens: [
  { n: 'selfevaluation', r: 'De 1 a 5, sente que está usando seu dinheiro da melhor forma para construir o futuro?', t: 'escala', ob: true, plano: 'coleta.perfil.autoavaliacao (1 a 5)', exame: 1 },
  { n: 'disposicaoRisco', r: 'Disposição a risco (identificada pelo consultor)', t: 'select', op: ['Baixo', 'Médio', 'Alto'], plano: 'coleta.perfil.disposicaoRisco' },
  { n: 'capacidadeRisco', r: 'Capacidade para risco (identificada pelo consultor)', t: 'select', op: ['Baixo', 'Médio', 'Alto'], plano: 'coleta.perfil.capacidadeRisco' },
  { n: 'relacaoDinheiro', r: 'Relação com o dinheiro', t: 'select', op: ['Gastador', 'Poupador', 'Neutro'], plano: 'coleta.perfil.relacaoDinheiro' },
  { n: 'restricaoClasseAtivo', r: 'Restrição a alguma classe de ativo', t: 'texto', plano: 'coleta.perfil.restricaoClasse (a tabela de experiência é a versão estruturada)' },
  { n: 'ativoNaoDesfazer', r: 'Ativo de que não quer se desfazer', t: 'texto', plano: 'coleta.perfil.naoDesfazer' },
  { n: 'classeNaoQuer', r: 'Classe de ativo que não quer ter', t: 'texto', plano: 'coleta.perfil.classeNaoQuer' },
  { n: 'perpetuidadeHeranca', r: 'Perpetuidade ou herança: o que pensa em deixar?', t: 'textolongo', plano: 'coleta.perfil.heranca' },
  { lista: 'expList', r: 'Experiência com as classes de ativos', naoPossui: 'expNaoPossui', tabela: 'coleta_experiencia', novo: true, motivo: 'A montagem tem a tabela "Experiência com investimentos" por pessoa e classe (entende, já investiu, tem restrição); a coleta só tem texto livre', plano: 'experiencia.<titular|conjuge>.<classe>', campos: [
    { n: 'exp_pessoa', r: 'Pessoa', t: 'select', op: PESSOA, plano: 'experiencia.<pessoa>' },
    { n: 'exp_classe', r: 'Classe', t: 'select', op: CLASSES_ATIVOS, plano: 'experiencia.<pessoa>.<classe>' },
    { n: 'exp_entende', r: 'Entende', t: 'marca', plano: '.entende' },
    { n: 'exp_investiu', r: 'Já investiu', t: 'marca', plano: '.investiu' },
    { n: 'exp_restricao', r: 'Tem restrição', t: 'marca', plano: '.restricao' },
  ] },
  { n: 'expObs', r: 'Observações sobre a experiência', t: 'textolongo', novo: true, plano: 'experiencia.observacoes' },
] },

// ---------------------------------------------------------------- 10
{ id: 'anexos', num: '10', titulo: 'Anexos', itens: [
  { n: 'anexos', r: 'Documentos entregues', t: 'multi', op: ['Extratos dos investimentos', 'Declaração de IR', 'Apólices de seguros', 'Outros'], plano: 'coleta.anexos.<extratos|ir|apolices|outros> (uma marca por opção)' },
  { n: 'anexosObs', r: 'Observações sobre os anexos', t: 'textolongo', plano: 'coleta.anexos.obs' },
  { n: 'uploadCategory', r: 'Categoria do arquivo', t: 'select', op: ['Extratos dos investimentos', 'Declaração de IR', 'Apólices de seguros', 'Outros'], plano: 'coleta.anexos.arquivos[].categoria (extratos, ir, apolices, outros); enviar marca a categoria como entregue' },
  { n: 'fileInput', r: 'Arquivos (PDF, imagem, planilha; até 10 MB)', t: 'arquivo', plano: 'coleta.anexos.arquivos[]: nome, categoria, tamanho, em (o arquivo vai para o armazenamento da plataforma)' },
] },

// ---------------------------------------------------------------- 11
{ id: 'tarefas', num: '11', titulo: 'Próximas tarefas', itens: [
  { lista: 'tarefasList', r: 'Tarefas', naoPossui: 'tarefasNaoPossui', tabela: 'coleta_tarefa', plano: 'coleta.tarefas[] (gestão do atendimento; nenhuma conta usa)', campos: [
    { n: 'tarefa_titulo', r: 'Tarefa', t: 'texto', plano: 'coleta.tarefas[].titulo' },
    { n: 'tarefa_prazo', r: 'Prazo', t: 'data', plano: 'coleta.tarefas[].prazo' },
    { n: 'tarefa_responsavel', r: 'Responsável', t: 'select', op: ['Consultor', 'Cliente'], plano: 'coleta.tarefas[].responsavel (consultor, cliente)' },
    { n: 'tarefa_status', r: 'Status', t: 'select', op: ['Pendente', 'Em andamento', 'Concluída'], plano: 'coleta.tarefas[].status (pendente, andamento, concluida)' },
    { n: 'tarefa_obs', r: 'Observações', t: 'textolongo', plano: 'coleta.tarefas[].obs' },
  ] },
] },

] };

// Campos fora das seções: o painel lateral e o cabeçalho da coleta
ESQUEMA.soltos = [
  { n: 'anotacoesConsultor', r: 'Anotações do consultor (painel lateral)', t: 'textolongo', plano: 'coleta.anotacoes' },
  { n: 'addToReuniaoCheck', r: 'Adicionar como reunião no HubSpot', t: 'simnao', op: ['Sim', 'Não'], plano: 'coleta.reuniao.adicionar (a plataforma registra ao finalizar)' },
  { n: 'reuniaoDealId', r: 'Negócio do HubSpot', t: 'texto', plano: 'coleta.reuniao.dealId' },
  { n: 'status', r: 'Status da coleta', t: 'select', op: ['rascunho', 'finalizado'], plano: 'coleta.status (vazio = rascunho; finalizada)', ajuda: 'POST /planejamentoController, ações save e update' },
];

if (typeof module !== 'undefined') module.exports = { ESQUEMA, TIPOS, CLASSES_ATIVOS, MESES_ANO };
