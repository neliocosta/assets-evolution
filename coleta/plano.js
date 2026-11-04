// ===================== DA COLETA AO PLANO =====================
// planoDaColeta(submissao, hoje) transforma o objeto gravado pela coleta (o `submissao`: campos soltos pelo `name`,
// listas pelo id da lista, cada item com os `name` dos campos) no plano que a montagem do relatório abre
// (tela-consultor.html, formato em README.md "Formato do plano"). É o contrato entre as duas ferramentas: o consultor
// entra na montagem com os dados da reunião já no lugar e só decide, não digita.
//
// Regras: só o que é fato do cliente vem daqui. O que é decisão do consultor (premissas, perfil de cada objetivo,
// avaliação dos riscos, carteira recomendada) fica vazio, e a montagem completa com os padrões dela ao abrir (doSalvo).
// Os totais declarados (currentfinancialassets, currentassets, currentliabilities) não vão: o plano soma as listas.
// Cada valor leva a origem: plano.origem.coleta = { id, em, campos: { caminho: name } } (ver COLETA.md, regra
// "uma mudança recalcula tudo": a variável é uma só, e a coleta é a fonte dela).

(function (raiz) {

const num = v => { if (v == null || v === '') return null; const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')); return isNaN(n) ? null : n; };
const sim = v => v === 'Sim' || v === true;
const txt = v => (v == null ? '' : String(v)).trim();
const lista = (s, id) => Array.isArray(s[id]) ? s[id] : [];
const casal = s => s.planoTipo === 'Um casal ou uma família' || (!s.planoTipo && lista(s, 'depList').some(d => /c[oô]njuge|companheir/i.test(d.dep_relacao || '')));
const pessoaDe = v => /c[oô]njuge/i.test(v || '') ? 'conjuge' : 'titular';
const MESES_ANO = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const uid = (p, i) => p + (i + 1);

// meses entre o mês de hoje e um "AAAA-MM" (ou "AAAA-MM-DD"); null se vazio ou inválido
function mesesAte(ate, hoje) {
  const m = /^(\d{4})-(\d{2})/.exec(txt(ate)); if (!m) return null;
  return Math.max(0, (+m[1] - hoje.getFullYear()) * 12 + (+m[2] - 1 - hoje.getMonth()));
}
// "AAAA-MM" de uma idade futura da pessoa, para startMi: meses até a pessoa fazer essa idade
function mesesAteIdade(nasc, idade, hoje) {
  const m = /^(\d{4})-(\d{2})/.exec(txt(nasc)); if (!m || idade == null) return null;
  return Math.max(0, (+m[1] + idade - hoje.getFullYear()) * 12 + (+m[2] - 1 - hoje.getMonth()));
}
const nascDeIdade = (idade, hoje) => idade == null ? '' : (hoje.getFullYear() - idade) + '-' + String(hoje.getMonth() + 1).padStart(2, '0');

const NATUREZA = { 'CLT': 'CLT (empresa privada)', 'Servidor Público': 'Servidor público', 'Aposentadoria/Pensão': 'Aposentado', 'Profissional Liberal/Autônomo': 'Profissional liberal ou autônomo', 'Empresário': 'Empresário', 'Sem Renda': '' };
const ORIGEM_ATIVA = { 'CLT': 'Salário', 'Servidor Público': 'Salário', 'Profissional Liberal/Autônomo': 'Honorários (autônomo)', 'Empresário': 'Pró-labore', 'Aposentadoria/Pensão': 'Outras receitas' };
const ORIGEM_PASSIVA = { 'Investimentos Financeiros': 'Rendimentos recorrentes', 'Imóveis': 'Aluguéis', 'Negócios': 'Distribuição de lucros', 'Pensão': 'Outras receitas', 'Assistência': 'Outras receitas', 'Outro': 'Outras receitas' };
const RELACAO = v => /filh/i.test(v) ? 'filho' : /c[oô]njuge|companheir/i.test(v) ? 'conjuge' : /pai|m[aã]e/i.test(v) ? 'pai' : 'outro';
const KIND_OBJ = cat => /casa|ve[ií]culo/i.test(cat || '') ? 'bem' : 'consumo';
const ICON_OBJ = cat => /casa/i.test(cat || '') ? 'home' : /ve[ií]culo/i.test(cat || '') ? 'car' : /viagem|interc/i.test(cat || '') ? 'sun' : /filho/i.test(cat || '') ? 'child' : /casamento/i.test(cat || '') ? 'heart' : 'star';
const CLASSE_AF = it => {
  const t = it.af_tipo || '';
  if (t === 'Renda Fixa') return /pr[eé]/i.test(it.af_rf_indexador || '') ? 'preFixado' : /ipca/i.test(it.af_rf_indexador || '') ? 'inflacao' : 'posFixado';
  if (t === 'Fundo') return { 'Liquidez': 'posFixado', 'Renda Fixa': 'posFixado', 'Multimercado': 'multimercado', 'Ações Brasil': 'bolsaBrasil', 'Ações Global': 'bolsaExterior', 'Cambial': 'rfExterior' }[it.af_fn_subclasse] || '';
  if (t === 'Renda Variável') return /fii|fiagro|fi-infra/i.test(it.af_rv_subclasse || '') ? 'imobiliarios' : /internacion|bdr/i.test(it.af_rv_subclasse || '') ? 'bolsaExterior' : 'bolsaBrasil';
  if (t === 'Conta Corrente') return 'posFixado';
  if (t === 'Criptoativos') return 'cripto';
  if (t === 'Alternativos') return 'alternativos';
  if (t === 'Carteira de Fundos Imobiliários') return 'imobiliarios';
  if (t === 'Carteira de Renda Variável') return 'bolsaBrasil';
  return '';
};
const CLASSE_EXP = { 'Pós-fixado': 'posFixado', 'Pré-fixado': 'preFixado', 'Indexado à inflação': 'inflacao', 'Fundos multimercado': 'multimercado', 'Fundos imobiliários': 'imobiliarios', 'Ações no Brasil': 'bolsaBrasil', 'Ações no exterior': 'bolsaExterior', 'Renda fixa no exterior': 'rfExterior', 'Previdência': 'previdencia', 'Criptoativos': 'cripto', 'Alternativos': 'alternativos' };

function planoDaColeta(s, hoje) {
  hoje = hoje || new Date();
  const P = { origem: { coleta: { id: s.id || null, em: s.em || hoje.toISOString(), campos: {} } } };
  const liga = (caminho, name) => { P.origem.coleta.campos[caminho] = name; };
  const eCasal = casal(s);

  // ---- quem é a família
  P.name = txt(s.nomeCliente) || txt(s.useremail);
  P.tipo = eCasal ? 'familia' : 'individual'; liga('tipo', 'planoTipo');
  if (s.dateofbirth) { P.nascimento = txt(s.dateofbirth).slice(0, 10); liga('nascimento', 'dateofbirth'); }
  if (eCasal) {
    P.conjugeNome = txt(s.conjugeNome) || txt((lista(s, 'depList').find(d => RELACAO(d.dep_relacao) === 'conjuge') || {}).dep_nome);
    if (s.conjugeDateofbirth) P.conjugeNascimento = txt(s.conjugeDateofbirth).slice(0, 10);
    liga('conjugeNome', 'conjugeNome'); liga('conjugeNascimento', 'conjugeDateofbirth');
  }
  P.periodicidade = s.orcamentoModo === 'Anual' ? 'anual' : 'mensal'; liga('periodicidade', 'orcamentoModo');
  P.retireAge = num(s.retiringtargetage); liga('retireAge', 'retiringtargetage');
  if (eCasal && num(s.conjugeRetiringTargetAge) != null) { P.spouseRetireAge = num(s.conjugeRetiringTargetAge); liga('spouseRetireAge', 'conjugeRetiringTargetAge'); }
  P.desired = num(s.rendaDesejadaAposentadoria); liga('desired', 'rendaDesejadaAposentadoria');
  P.mode = 'desej';
  P.capacityOverride = num(s.declaredmonthlysavings); liga('capacityOverride', 'declaredmonthlysavings');
  P.orcamento = { vezesPoupou: { 'Nenhuma': 'nenhuma', '1-3': '1-3', '4-6': '4-6', '7-9': '7-9', '10 ou mais': '10+' }[s.recentsavingsfrequency] || '' }; liga('orcamento.vezesPoupou', 'recentsavingsfrequency');

  // dependentes: a lista decide; o cônjuge sai dela (é pessoa do plano, não dependente)
  const deps = lista(s, 'depList').filter(d => txt(d.dep_nome) || d.dep_relacao).filter(d => !(eCasal && RELACAO(d.dep_relacao) === 'conjuge'))
    .map(d => ({ nome: txt(d.dep_nome), relacao: RELACAO(d.dep_relacao), nasc: txt(d.dep_nascimento).slice(0, 7) || nascDeIdade(num(d.dep_idade), hoje), ate: num(d.dep_ateIdade) }));
  liga('riscos.dependentes', 'depList');

  // rendas ativas de cada pessoa (profissão, natureza, horas) e as linhas do Fluxo
  const incomes = [], rendasAtivas = [];
  const principal = { pessoa: 'titular', profissao: '', natureza: NATUREZA[s.incomenature] || '', horas: null };
  const ras = lista(s, 'rendaAtivaList').filter(r => num(r.ra_rendaLiquida) != null || txt(r.ra_descricao));
  if (!ras.length || num(s.declaredincome) != null) {
    // a renda principal do exame (declaredincome), quando a lista não a traz
    const jaNaLista = ras.some(r => pessoaDe(r.ra_pessoa) === 'titular' && num(r.ra_rendaLiquida) === num(s.declaredincome));
    if (num(s.declaredincome) != null && !jaNaLista) {
      incomes.push({ id: 'principal', label: 'Renda principal', pessoa: 'titular', kind: 'ativa', origin: ORIGEM_ATIVA[s.incomenature] || 'Salário', gross: null, frequency: 'mensal', taxable: true, steps: [{ from: 0, value: num(s.declaredincome) }] });
      liga('incomes[principal]', 'declaredincome');
    }
  }
  rendasAtivas.push(principal);
  if (eCasal && s.conjugeIncomenature) rendasAtivas.push({ pessoa: 'conjuge', profissao: '', natureza: NATUREZA[s.conjugeIncomenature] || '', horas: null });
  ras.forEach((r, i) => {
    const pessoa = pessoaDe(r.ra_pessoa), id = uid('ra', i), liq = num(r.ra_rendaLiquida), bruto = num(r.ra_rendaBruta);
    const ra = rendasAtivas.find(x => x.pessoa === pessoa && !x.profissao && x.horas == null) || (rendasAtivas.push({ pessoa, profissao: '', natureza: '', horas: null }), rendasAtivas[rendasAtivas.length - 1]);
    ra.profissao = txt(r.ra_descricao); ra.natureza = ra.natureza || NATUREZA[r.ra_regime] || ''; ra.horas = num(r.ra_horas);
    const origin = ORIGEM_ATIVA[r.ra_regime] || 'Salário', dia = num(r.ra_diaRecebimento);
    incomes.push(Object.assign({ id, label: txt(r.ra_descricao) || origin, pessoa, kind: 'ativa', origin, gross: bruto, frequency: 'mensal', taxable: true, certeza: r.ra_certeza === 'Estimada (varia)' ? 'estimada' : 'certa', steps: [{ from: 0, value: liq }] }, dia ? { days: [dia] } : {}));
    if (num(r.ra_comissoes)) incomes.push({ id: id + 'c', label: 'Remuneração variável', pessoa, kind: 'ativa', origin: 'Remuneração variável', gross: null, frequency: 'mensal', taxable: true, de: id, steps: [{ from: 0, value: num(r.ra_comissoes) }] });
    if (sim(r.ra_decimo)) incomes.push({ id: id + 'd', label: '13º salário', pessoa, kind: 'ativa', origin: '13º salário', frequency: 'anual', taxable: true, de: id, segue: id, dates: [{ m: 11, d: 20 }], steps: [{ from: 0, value: liq }] });
    if (num(r.ra_bonus)) incomes.push({ id: id + 'b', label: 'Bônus anual', pessoa, kind: 'ativa', origin: 'Bônus', frequency: 'anual', taxable: true, de: id, dates: [{ m: 2, d: 20 }], steps: [{ from: 0, value: num(r.ra_bonus) }] });
    if (num(r.ra_plr)) incomes.push({ id: id + 'p', label: 'PLR', pessoa, kind: 'ativa', origin: 'Outras receitas', frequency: 'anual', taxable: false, de: id, dates: [{ m: 2, d: 20 }], steps: [{ from: 0, value: num(r.ra_plr) }] });
  });
  liga('incomes (ativas)', 'rendaAtivaList'); liga('rendasAtivas', 'rendaAtivaList, incomenature, conjugeIncomenature');
  lista(s, 'rendaPassivaList').filter(r => num(r.rp_rendaLiquida) != null).forEach((r, i) => {
    incomes.push({ id: uid('rp', i), label: txt(r.rp_ativo) || r.rp_tipo || 'Renda passiva', pessoa: pessoaDe(r.rp_pessoa), kind: 'passiva', origin: ORIGEM_PASSIVA[r.rp_tipo] || 'Outras receitas', gross: num(r.rp_rendaBruta), frequency: 'mensal', taxable: r.rp_tipo !== 'Negócios', certeza: r.rp_certeza === 'Estimada (varia)' ? 'estimada' : 'certa', ativo: txt(r.rp_ativo), steps: [{ from: 0, value: num(r.rp_rendaLiquida) }] });
  });
  liga('incomes (passivas)', 'rendaPassivaList');
  // pró-labore e lucros das participações, quando a lista de renda ativa não os traz
  lista(s, 'participacoesList').forEach((p, i) => {
    const pessoa = pessoaDe(p.part_socio);
    if (num(p.part_prolabore) && !incomes.some(x => x.pessoa === pessoa && x.origin === 'Pró-labore')) incomes.push({ id: uid('pl', i), label: 'Pró-labore ' + txt(p.part_empresa), pessoa, kind: 'ativa', origin: 'Pró-labore', gross: num(p.part_prolabore), frequency: 'mensal', taxable: true, steps: [{ from: 0, value: Math.round(num(p.part_prolabore) * 0.89) }] });
    if (num(p.part_dividendos)) incomes.push({ id: uid('dv', i), label: 'Lucros ' + txt(p.part_empresa), pessoa, kind: 'passiva', origin: 'Distribuição de lucros', gross: num(p.part_dividendos), frequency: 'mensal', taxable: false, steps: [{ from: 0, value: num(p.part_dividendos) }] });
  });
  P.incomes = incomes; P.rendasAtivas = rendasAtivas;

  // ---- despesas: a lista nova; sem ela, o custo de vida declarado numa linha só, mais os itens soltos da coleta
  const expenses = [];
  const desps = lista(s, 'despList').filter(d => num(d.desp_valor) != null);
  const anual = (id, label, valor, mesNome) => ({ id, label, group: 'fix', frequency: 'anual', dates: [{ m: Math.max(0, MESES_ANO.indexOf(mesNome || '')), d: 10 }], steps: [{ from: 0, value: valor }] });
  if (desps.length) {
    desps.forEach((d, i) => {
      const e = { id: uid('desp', i), label: txt(d.desp_nome), group: d.desp_grupo === 'Fixa' ? 'fix' : 'adj', steps: [{ from: 0, value: num(d.desp_valor) }] };
      if (d.desp_frequencia === 'Anual') Object.assign(e, { frequency: 'anual', dates: [{ m: Math.max(0, MESES_ANO.indexOf(d.desp_mes || '')), d: 10 }] });
      else if (d.desp_frequencia === 'Semanal') Object.assign(e, { frequency: 'semanal', weekday: 6 });
      expenses.push(e);
    });
    liga('expenses', 'despList');
  } else {
    if (num(s.declaredstandardofliving) != null) {
      const v = s.orcamentoModo === 'Anual' ? Math.round(num(s.declaredstandardofliving) / 12) : num(s.declaredstandardofliving);
      expenses.push({ id: 'custoVida', label: 'Custo de vida (total declarado)', group: 'adj', steps: [{ from: 0, value: v }] });
      liga('expenses[custoVida]', 'declaredstandardofliving');
    }
  }
  // os itens soltos que a coleta já pega: aluguel, parcelas de bens, prêmios dos seguros, dependentes, previdência
  const jaTem = rot => expenses.some(e => e.label.toLowerCase() === rot.toLowerCase());
  if (s.moradiaEstrutura === 'Aluguel' && num(s.moradiaValorAluguel) && !jaTem('Moradia (aluguel)')) { expenses.push({ id: 'moradia', label: 'Moradia (aluguel)', group: 'fix', steps: [{ from: 0, value: num(s.moradiaValorAluguel) }] }); liga('expenses[moradia]', 'moradiaValorAluguel'); }
  if (!desps.length) {
    deps.forEach((d, i) => { const c = num((lista(s, 'depList')[i] || {}).dep_custo); if (c) expenses.push({ id: uid('dep', i), label: 'Dependente: ' + d.nome, group: 'fix', steps: [{ from: 0, value: c }] }); });
  }
  if (sim(s.seg_auto_protegido) && num(s.seg_auto_premio)) expenses.push(anual('segAuto', 'Seguro do carro', num(s.seg_auto_premio), s.seg_auto_mesRenovacao));
  if (sim(s.seg_res_protegido) && num(s.seg_res_premio)) expenses.push(anual('segRes', 'Seguro residencial', num(s.seg_res_premio), s.seg_res_mesRenovacao));
  lista(s, 'segVidaList').forEach((v, i) => { if (num(v.seg_vida_premio)) expenses.push({ id: uid('segVida', i), label: 'Seguro de vida' + (eCasal ? ' (' + (pessoaDe(v.seg_vida_pessoa) === 'conjuge' ? 'cônjuge' : 'titular') + ')' : ''), group: 'fix', steps: [{ from: 0, value: num(v.seg_vida_premio) }] }); });
  lista(s, 'segAcidList').forEach((v, i) => { if (num(v.seg_acid_premio)) expenses.push({ id: uid('segAcid', i), label: 'Seguro de acidentes' + (eCasal ? ' (' + (pessoaDe(v.seg_acid_pessoa) === 'conjuge' ? 'cônjuge' : 'titular') + ')' : ''), group: 'fix', steps: [{ from: 0, value: num(v.seg_acid_premio) }] }); });
  lista(s, 'prevAbertaList').forEach((p, i) => { if (num(p.pa_contribuicao)) expenses.push({ id: uid('prevAb', i), label: 'Previdência ' + (p.pa_tipo || '') + ' ' + txt(p.pa_nomeFundo), group: 'fix', steps: [{ from: 0, value: num(p.pa_contribuicao) }] }); });
  lista(s, 'prevFechadaList').forEach((p, i) => { if (num(p.pf_contribuicao)) expenses.push({ id: uid('prevFe', i), label: 'Fundo de pensão ' + txt(p.pf_entidade), group: 'fix', steps: [{ from: 0, value: num(p.pf_contribuicao) }] }); });
  P.expenses = expenses;

  // ---- patrimônio
  const bens = [], dividas = [], financeiro = [], participacoes = [], carteira = [];
  const segAuto = sim(s.seg_auto_protegido), segRes = sim(s.seg_res_protegido);
  lista(s, 'bensList').filter(b => txt(b.bem_descricao) || num(b.bem_valor) != null).forEach((b, i) => {
    const id = uid('bem', i), veic = /carro|moto/i.test(b.bem_tipo || ''), imov = /casa|apart|comercial|terreno/i.test(b.bem_tipo || '');
    const bem = { id, nome: txt(b.bem_descricao) || b.bem_tipo || 'Bem', tipo: b.bem_tipo || '', mercado: num(b.bem_valor), saldoDevedor: sim(b.bem_quitado) ? 0 : num(b.bem_saldoDevedor) || 0 };
    // titularidade: o campo novo; senão, "compartilhado" com o percentual do cliente (o plano supõe o cônjuge)
    const t = b.bem_titular;
    if (t === 'Cônjuge') bem.titularidade = 'conjuge'; else if (t === 'Do casal') { bem.titularidade = 'casal'; bem.titularPct = num(b.bem_percentual) || 50; bem.conjugePct = num(b.bem_percentualConjuge) || (100 - bem.titularPct); }
    else if (t === 'Dividido com outras pessoas' || (!t && sim(b.bem_compartilhado))) { bem.titularidade = eCasal ? 'casal' : 'titular'; bem.titularPct = num(b.bem_percentual); if (num(b.bem_percentualConjuge) != null) bem.conjugePct = num(b.bem_percentualConjuge); }
    else bem.titularidade = 'titular';
    if (!sim(b.bem_quitado) && num(b.bem_saldoDevedor)) {
      bem.parcela = num(b.bem_parcela);
      if (num(b.bem_credito) != null) bem.credito = num(b.bem_credito);
      if (num(b.bem_parcelasContratadas) != null) bem.parcelas = num(b.bem_parcelasContratadas);
      if (txt(b.bem_primeiraParcela)) bem.inicio = txt(b.bem_primeiraParcela).slice(0, 7);
      if (num(b.bem_juros) != null) bem.juros = num(b.bem_juros);
      if (b.bem_sistema === 'SAC' || b.bem_sistema === 'Price') bem.sistema = b.bem_sistema.toLowerCase();
      bem.situacao = b.bem_situacao === 'Em atraso' ? 'inadimplente' : 'em_dia';
    }
    if (sim(b.bem_geraRenda) && num(b.bem_rendaPassiva)) {
      // a renda do bem: liga à linha passiva que cita o bem, ou cria uma
      let r = incomes.find(x => x.kind === 'passiva' && x.ativo && bem.nome && (x.ativo.toLowerCase().includes(bem.nome.toLowerCase()) || bem.nome.toLowerCase().includes(x.ativo.toLowerCase())));
      if (!r) { r = { id: id + 'r', label: 'Renda de ' + bem.nome, pessoa: bem.titularidade === 'conjuge' ? 'conjuge' : 'titular', kind: 'passiva', origin: imov ? 'Aluguéis' : 'Outras receitas', gross: null, frequency: 'mensal', taxable: true, steps: [{ from: 0, value: num(b.bem_rendaPassiva) }] }; incomes.push(r); }
      bem.renda = r.id;
    }
    if (veic && segAuto) bem.protecao = 'total', bem.apolice = { seguradora: txt(s.seg_auto_seguradora) };
    if (imov && segRes && (!txt(s.seg_res_imovel) || bem.nome.toLowerCase().includes(txt(s.seg_res_imovel).toLowerCase()) || txt(s.seg_res_imovel).toLowerCase().includes(bem.nome.toLowerCase()))) bem.protecao = 'total', bem.apolice = { seguradora: txt(s.seg_res_seguradora) };
    if (sim(b.bem_pensaVender)) { const em = mesesAte(b.bem_vendaQuando, hoje); bem.venda = { em: em == null ? 12 : em, preco: num(b.bem_vendaValor), custos: [] }; }
    bens.push(bem);
  });
  liga('patrimonio.bens', 'bensList (+ seg_auto_*, seg_res_*)');
  // o imóvel da moradia, só quando a lista de bens não o traz (repetição da coleta)
  if (s.moradiaEstrutura === 'Imóvel Financiado' && num(s.moradiaValorImovel) && !bens.some(b => /casa|apart/i.test(b.tipo))) {
    bens.push({ id: 'moradiaImovel', nome: 'Imóvel da moradia', tipo: 'Imóvel', mercado: num(s.moradiaValorImovel), titularidade: eCasal ? 'casal' : 'titular', saldoDevedor: num(s.moradiaSaldoDevedor) || 0, parcela: num(s.moradiaParcela) });
    liga('patrimonio.bens[moradiaImovel]', 'moradiaValorImovel, moradiaSaldoDevedor, moradiaParcela');
  }
  lista(s, 'dividasList').filter(d => num(d.div_saldoDevedor) != null).forEach((d, i) => {
    const dv = { id: uid('div', i), nome: txt(d.div_nome) || d.div_tipo || 'Dívida', tipo: d.div_tipo || '', credor: txt(d.div_credor), saldoDevedor: num(d.div_saldoDevedor), parcela: num(d.div_parcela), restantes: num(d.div_parcelasRestantes), situacao: d.div_situacao === 'Em atraso' ? 'inadimplente' : 'em_dia' };
    if (num(d.div_juros) != null) { dv.juros = num(d.div_juros); dv.jurosPeriodo = 'mes'; }
    if (d.div_tipo === 'Consórcio') dv.modalidade = 'consorcio';
    dividas.push(dv);
  });
  liga('patrimonio.dividas', 'dividasList');
  // sem a lista: o total declarado menos os financiamentos dos bens vira uma dívida só
  if (!dividas.length && sim(s.hasdebts) && num(s.currentliabilities)) {
    const fin = bens.reduce((a, b) => a + (b.saldoDevedor || 0), 0), resto = num(s.currentliabilities) - fin;
    if (resto > 0) { dividas.push({ id: 'outrasDividas', nome: 'Outras dívidas (total declarado)', saldoDevedor: resto, situacao: 'em_dia' }); liga('patrimonio.dividas[outrasDividas]', 'currentliabilities − financiamentos dos bens'); }
  }
  // ativos financeiros: a carteira ativo a ativo; o financeiro por instituição sai dela (a montagem soma)
  const titDe = v => v === 'Cônjuge' ? 'conjuge' : v === 'Conjunta' ? '' : 'titular';
  lista(s, 'ativoFinList').filter(a => num(a.af_saldo) != null).forEach((a, i) => {
    const nome = txt(a.af_fn_nome) || txt(a.af_rv_ticker) || [a.af_tipo, a.af_rf_subclasse, a.af_rf_indexador].filter(Boolean).join(' ');
    const venc = a.af_tipo === 'Renda Fixa' ? (a.af_rf_liquidez === 'Sim' ? 'Diária' : txt(a.af_rf_prazo) || (a.af_rf_liquidez || '')) : a.af_tipo === 'Fundo' ? (num(a.af_fn_prazoResgate) != null ? 'D + ' + num(a.af_fn_prazoResgate) : '') : a.af_tipo === 'Conta Corrente' ? 'Diária' : 'D + 2';
    carteira.push({ id: uid('at', i), instituicao: txt(a.af_instituicao), titular: eCasal ? titDe(a.af_titular) : 'titular', nome, classe: CLASSE_AF(a), subclasse: a.af_rf_subclasse || a.af_fn_subclasse || a.af_rv_subclasse || a.af_tipo || '', vencimento: venc, tipo: '', valor: num(a.af_saldo), emissor: txt(a.af_rf_emissor), obs: txt(a.af_obs) });
  });
  lista(s, 'prevAbertaList').filter(p => num(p.pa_saldo) != null).forEach((p, i) => {
    carteira.push({ id: uid('pa', i), instituicao: txt(p.pa_nomeFundo) || 'Previdência', titular: eCasal ? titDe(p.pa_pessoa) : 'titular', nome: txt(p.pa_nomeFundo) || p.pa_tipo, classe: 'previdencia', subclasse: p.pa_tipo || '', vencimento: 'Previdência', tipo: (p.pa_tipo || '').toLowerCase() === 'pgbl' ? 'pgbl' : 'vgbl', valor: num(p.pa_saldo) });
  });
  liga('carteira.ativos', 'ativoFinList, prevAbertaList');
  // o financeiro por instituição: a montagem recalcula da carteira (sincronizaPatrimonio); aqui vai a mesma soma
  const chave = a => a.instituicao + '|' + a.titular + '|' + a.tipo;
  const somas = {};
  carteira.forEach(a => { const k = chave(a); somas[k] = somas[k] || { nome: a.instituicao || a.nome, valor: 0, tipo: a.tipo, titularidade: a.titular === '' ? (eCasal ? 'casal' : 'titular') : a.titular, daCarteira: true }; somas[k].valor += a.valor || 0; });
  Object.values(somas).forEach(f => financeiro.push(f));
  lista(s, 'prevFechadaList').filter(p => num(p.pf_saldo) != null).forEach(p => financeiro.push({ nome: txt(p.pf_entidade) || 'Fundo de pensão', valor: num(p.pf_saldo), tipo: 'fechada', titularidade: eCasal ? titDe(p.pf_pessoa) || 'titular' : 'titular', conv: { contribPessoa: num(p.pf_contribuicao), contribPatroc: num(p.pf_contrapartida) } }));
  if (num(s.fgts)) financeiro.push({ nome: 'FGTS', valor: num(s.fgts), tipo: 'fgts', titularidade: 'titular' });
  if (eCasal && num(s.conjugeFgts)) financeiro.push({ nome: 'FGTS', valor: num(s.conjugeFgts), tipo: 'fgts', titularidade: 'conjuge' });
  liga('patrimonio.financeiro', 'ativoFinList (somados por instituição), prevAbertaList, prevFechadaList, fgts, conjugeFgts');
  lista(s, 'participacoesList').filter(p => txt(p.part_empresa)).forEach((p, i) => {
    const part = { id: uid('part', i), nome: txt(p.part_empresa), valor: num(p.part_valor), pct: num(p.part_pct), pessoa: pessoaDe(p.part_socio) };
    if (sim(p.part_pensaVender)) part.venda = { em: 12, preco: null, custos: [] };
    participacoes.push(part);
  });
  liga('patrimonio.participacoes', 'participacoesList');
  P.patrimonio = { comecou: num(s.startingworkingage), conjugeComecou: eCasal ? num(s.conjugeStartingWorkingAge) : null, financeiro, participacoes, bens, dividas };
  liga('patrimonio.comecou', 'startingworkingage');
  if (carteira.length) P.carteira = { ativos: carteira };

  // ---- objetivos e compromissos
  const objetivos = lista(s, 'objList').filter(o => txt(o.obj_titulo) || num(o.obj_valorNecessario) != null).map((o, i) => {
    const ob = { id: uid('obj', i), name: txt(o.obj_titulo) || o.obj_categoria || 'Objetivo', categoria: o.obj_categoria || '', icon: ICON_OBJ(o.obj_categoria), kind: KIND_OBJ(o.obj_categoria), ligado: true,
      months: mesesAte(o.obj_dataAlvo, hoje), amount: num(o.obj_valorNecessario), dedicated: sim(o.obj_temSaldo) ? num(o.obj_saldoAtual) || 0 : 0, planned: num(o.obj_aporteMensal) || 0, descricao: txt(o.obj_descricao), costs: [], strategy: '', planoAtual: txt(o.obj_planoAtual) };
    if (num(o.obj_custoTotal) && num(o.obj_custoTotal) > (ob.amount || 0)) ob.preco = num(o.obj_custoTotal);
    const modo = o.obj_comoComprar === 'Entrada + financiamento' ? 'financiamento' : o.obj_comoComprar === 'Consórcio' ? 'consorcio' : '';
    if (modo) ob.compra = { modo };
    if (sim(o.obj_temCustoMensal) && num(o.obj_custoMensal)) ob.costs.push({ id: ob.id + 'k', type: 'fixo', value: num(o.obj_custoMensal), months: null, label: 'Custo mensal de ' + ob.name });
    // o bem de entrada: a venda desse bem financia o objetivo
    if (sim(o.obj_temBemEntrada) && txt(o.obj_bemEntradaDesc)) {
      const bem = bens.find(b => b.nome.toLowerCase().includes(txt(o.obj_bemEntradaDesc).toLowerCase()) || txt(o.obj_bemEntradaDesc).toLowerCase().includes(b.nome.toLowerCase()));
      if (bem) { bem.venda = bem.venda || { em: ob.months || 0, preco: num(o.obj_bemEntradaValor), custos: [] }; bem.venda.destinos = [{ objetivo: ob.id, valor: null }]; }
    }
    return ob;
  });
  P.objectives = objetivos; P.objetivosOrdem = objetivos.map(o => o.id).concat(['seguranca', 'liberdade']);
  liga('objectives', 'objList'); liga('objetivosOrdem', 'objList (a ordem)');
  P.compromissos = lista(s, 'comprList').filter(c => num(c.comp_valor) != null).map((c, i) => ({ id: uid('comp', i), titulo: txt(c.comp_titulo), descricao: txt(c.comp_descricao), em: mesesAte(c.comp_data, hoje) || 0, valor: num(c.comp_valor) }));
  liga('compromissos', 'comprList');

  // ---- proteção
  const geradores = [];
  const ger = (pessoa, nome) => {
    // o valor coberto de cada pessoa é a soma das apólices dela (as mesmas que viram coleta.apolices, mais abaixo)
    const soma = (l, k, p) => lista(s, l).filter(v => (eCasal ? pessoaDe(v[p]) : 'titular') === pessoa).reduce((t, v) => t + (num(v[k]) || 0), 0);
    const c = pessoa === 'conjuge';
    return { nome, pessoa, nasc: '', participacao: null, passivaPct: null, patrimonioPct: null,
      coberturaVida: soma('segVidaList', 'seg_vida_valorCoberto', 'seg_vida_pessoa'), coberturaInvalidez: soma('segAcidList', 'seg_acid_valorCoberto', 'seg_acid_pessoa'),
      inssInvalidez: num(c ? s.conjugePrevPublicaInvalidez : s.prevPublicaInvalidez), inssMorte: num(c ? s.conjugePrevPublicaMorte : s.prevPublicaMorte) };
  };
  geradores.push(ger('titular', (P.name || '').split(/\s+e\s+|\s+/)[0] || 'Titular'));
  if (eCasal) geradores.push(ger('conjuge', (P.conjugeNome || '').split(/\s+/)[0] || 'Cônjuge'));
  const pctT = num(s.pctDespesasTitular);
  if (pctT != null) { geradores[0].participacao = pctT; if (geradores[1]) geradores[1].participacao = 100 - pctT; }
  liga('riscos.seguro.geradores', 'segVidaList, segAcidList, prevPublicaInvalidez, prevPublicaMorte, pctDespesasTitular');
  const vidas = lista(s, 'saudeVidasList').filter(v => v.sv_quem).map(v => ({ nome: v.sv_quem === 'Titular' ? geradores[0].nome : v.sv_quem === 'Cônjuge' ? (geradores[1] || {}).nome || 'Cônjuge' : txt(v.sv_nome), quem: v.sv_quem === 'Titular' ? 'titular' : v.sv_quem === 'Cônjuge' ? 'conjuge' : 'dep', premio: num(v.sv_premio), pagador: v.sv_pagador === 'A empresa ou outra pessoa' ? 'terceiros' : '' }));
  P.riscos = {
    dependentes: deps,
    reserva: { dependentes: deps.length ? deps.length > 0 : sim(s.hasdependents), custoVida: num(s.declaredstandardofliving) != null && s.orcamentoModo === 'Anual' ? Math.round(num(s.declaredstandardofliving) / 12) : num(s.declaredstandardofliving), atual: num(s.currentreserve), alvo: num(s.estimatedreserve) },
    saude: Object.assign({ tipo: sim(s.seg_saude_protegido) ? (s.seg_saude_tipo || '') : '', operadora: txt(s.seg_saude_operadora), plano: txt(s.seg_saude_nomePlano) }, vidas.length ? { vidas } : {}),
    terceiros: { itens: [
      { nome: 'Responsabilidade civil profissional', ideal: null, atual: sim(s.seg_rcprof_protegido) ? num(s.seg_rcprof_valorCoberto) || 0 : 0 },
      { nome: 'Responsabilidade civil familiar', ideal: null, atual: segRes ? num(s.seg_res_cobRCFamiliar) || 0 : 0 },
      { nome: 'Danos a terceiros com o veículo', ideal: null, atual: segAuto ? num(s.seg_auto_cobRCVF) || 0 : 0 },
    ] },
    seguro: { geradores },
  };
  liga('riscos.reserva', 'hasdependents, declaredstandardofliving, currentreserve, estimatedreserve'); liga('riscos.saude', 'seg_saude_*, saudeVidasList'); liga('riscos.terceiros', 'seg_auto_cobRCVF, seg_res_cobRCFamiliar, seg_rcprof_*');

  // ---- rendas da aposentadoria
  const passive = [];
  const inss = (pessoa, tipo, idade, valor, nasc) => { if (!tipo || tipo === 'Nenhuma' || num(valor) == null) return; const st = mesesAteIdade(nasc, num(idade), hoje); passive.push(Object.assign({ name: tipo + (eCasal ? ' (' + (pessoa === 'conjuge' ? 'cônjuge' : 'titular') + ')' : ''), origin: 'Contribuições previdenciárias', pessoa, gross: num(valor), tax: 0, net: num(valor), dur: null, cost: 0, converted: false }, st == null ? { start: 0 } : { startMi: st })); };
  inss('titular', s.prevPublicaTipo, s.prevPublicaIdadeBeneficio, s.prevPublicaValorBeneficio, P.nascimento);
  if (eCasal) inss('conjuge', s.conjugePrevPublicaTipo, s.conjugePrevPublicaIdadeBeneficio, s.conjugePrevPublicaValorBeneficio, P.conjugeNascimento);
  P.passive = passive; liga('passive', 'prevPublicaTipo, prevPublicaIdadeBeneficio, prevPublicaValorBeneficio (+ os do cônjuge)');

  // ---- tributário: só os fatos; a estratégia recomendada é do consultor
  const pgblAno = lista(s, 'prevAbertaList').filter(p => (p.pa_tipo || '').toUpperCase() === 'PGBL').reduce((a, p) => a + (num(p.pa_contribuicao) || 0) * 12, 0);
  P.tributario = {
    ir: { regimeAtual: { 'Simplificado': 'simplificado', 'Completo': 'completo', 'Não declara': 'nao_declara' }[s.irRegime] || '', pessoas: [{ quem: 'titular', outras: 0 }].concat(eCasal ? [{ quem: 'conjuge', outras: 0 }] : []),
          atual: { depsCom: 0, lanc: [{ instr: num(s.irInstrucao) || 0, med: num(s.irDespesasMedicas) || 0, pgbl: pgblAno }].concat(eCasal ? [{ instr: 0, med: 0, pgbl: 0 }] : []) } },
    prolabore: { socios: lista(s, 'participacoesList').filter(p => txt(p.part_empresa)).map(p => ({ quem: pessoaDe(p.part_socio), empresa: txt(p.part_empresa), regime: { 'Simples Nacional': 'simples', 'Lucro Presumido': 'presumido', 'Lucro Real': 'real', 'MEI': 'mei' }[p.part_regime] || '', faturamento: num(p.part_faturamento) })) },
  };
  liga('tributario.ir.regimeAtual', 'irRegime'); liga('tributario.ir.atual.lanc', 'irDespesasMedicas, irInstrucao, prevAbertaList (PGBL × 12)'); liga('tributario.prolabore.socios', 'participacoesList');

  // ---- experiência com investimentos
  const exp = {};
  lista(s, 'expList').forEach(e => { const p = pessoaDe(e.exp_pessoa), c = CLASSE_EXP[e.exp_classe]; if (!c) return; exp[p] = exp[p] || {}; exp[p][c] = {}; if (e.exp_entende) exp[p][c].entende = true; if (e.exp_investiu) exp[p][c].investiu = true; if (e.exp_restricao) exp[p][c].restricao = true; });
  const obsExp = [txt(s.expObs), txt(s.restricaoClasseAtivo) && 'Restrição: ' + txt(s.restricaoClasseAtivo), txt(s.classeNaoQuer) && 'Não quer ter: ' + txt(s.classeNaoQuer), txt(s.ativoNaoDesfazer) && 'Não quer se desfazer de: ' + txt(s.ativoNaoDesfazer)].filter(Boolean).join(' ');
  if (Object.keys(exp).length || obsExp) P.experiencia = Object.assign(exp, obsExp ? { observacoes: obsExp } : {});
  liga('experiencia', 'expList, expObs, restricaoClasseAtivo, classeNaoQuer, ativoNaoDesfazer');

  // ---- o que a coleta pega e a montagem ainda não usa fica junto, para o consultor ler na página Cliente
  P.coleta = { diagnostico: {
    selfevaluation: s.selfevaluation, hasobjective: s.hasobjective, evaluateneededmoney: s.evaluateneededmoney, hasplanforobjective: s.hasplanforobjective, estimatedmoneymonthly: num(s.estimatedmoneymonthly), actualmoneydedicated: num(s.actualmoneydedicated),
    doesbudgeting: s.doesbudgeting, increasingreservemonthly: s.increasingreservemonthly, hasretiringstrategies: s.hasretiringstrategies, currentretiringstrategies: s.currentretiringstrategies, executingretiringstrategies: s.executingretiringstrategies, hadprofessionalvalidation: s.hadprofessionalvalidation,
    disposicaoRisco: s.disposicaoRisco, capacidadeRisco: s.capacidadeRisco, relacaoDinheiro: s.relacaoDinheiro, perpetuidadeHeranca: s.perpetuidadeHeranca, maritalstatus: s.maritalstatus, regimeBens: s.regimeBens, moradiaEstrutura: s.moradiaEstrutura,
  }, anotacoesConsultor: txt(s.anotacoesConsultor) };
  // as perguntas do exame de saúde financeira, como chegaram na coleta de produção (pré-preenchidas do exame): a foto do
  // exame, que não muda; o detalhado da reunião fica nos campos do plano
  const EXAME = ['selfevaluation', 'declaredmonthlysavings', 'recentsavingsfrequency', 'hasobjective', 'evaluateneededmoney', 'hasplanforobjective', 'estimatedmoneyneeded', 'actualmoneydedicated', 'currentfinancialassets', 'currentreserve', 'increasingreservemonthly', 'estimatedreserve', 'currentassetscategories', 'insuredassets', 'currentassets', 'personalinsurances', 'hasdebts', 'currentliabilities', 'startingworkingage', 'retiringtargetage', 'hasretiringstrategies', 'currentretiringstrategies', 'executingretiringstrategies', 'incomenature', 'declaredincome', 'hasdependents', 'doesbudgeting', 'declaredstandardofliving', 'hadprofessionalvalidation', 'maritalstatus', 'usergender', 'dateofbirth', 'useremail'];
  const MOEDA = /savings|money|assets$|reserve$|liabilities|income$|standardofliving/;
  const respostas = {};
  EXAME.forEach(n => { const v = n === 'estimatedmoneyneeded' ? (s.estimatedmoneyneeded != null ? s.estimatedmoneyneeded : s.estimatedmoneymonthly) : s[n];
    if (v == null || v === '') return; respostas[n] = MOEDA.test(n) && n !== 'currentassetscategories' ? num(v) : v; });
  if (Object.keys(respostas).length) { P.exame = { em: null, origem: 'coleta de produção', respostas }; liga('exame.respostas', 'as 33 perguntas do exame, como vieram na coleta'); }
  // as apólices de vida e de acidentes: cada linha de produção vira uma apólice com uma cobertura (morte ou invalidez por
  // acidente); as outras coberturas da mesma apólice o consultor acrescenta na seção Proteção
  const VIG = { Anual: 'anual', Termo: 'prazo', 'Vitalício': 'vitalicia' };
  const cob = (tipo, valor, premio, vigencia, vigenciaPrazo) => ({ tipo, valor: valor || 0, premio: premio || 0, vigencia: vigencia || '', vigenciaPrazo: vigenciaPrazo || '', pagamento: '', pagamentoPrazo: '', premioTipo: '', resgatavel: '', detalhe: '' });
  const apolice = (pessoa, seguradora, cobertura, obs) => ({ pessoa: eCasal ? pessoaDe(pessoa) : 'titular', seguradora, numero: '', periodicidade: 'mensal', coberturas: [cobertura], obs });
  const apolices = lista(s, 'segVidaList').map(v => apolice(v.seg_vida_pessoa, txt(v.seg_vida_seguradora), cob('morte', num(v.seg_vida_valorCoberto), num(v.seg_vida_premio), VIG[v.seg_vida_tipo], txt(v.seg_vida_prazoCobertura)), txt(v.seg_vida_obs)))
    .concat(lista(s, 'segAcidList').map(v => apolice(v.seg_acid_pessoa, txt(v.seg_acid_seguradora), cob('ipa', num(v.seg_acid_valorCoberto), num(v.seg_acid_premio)), txt(v.seg_acid_obs))))
    .filter(a => a.seguradora || a.coberturas[0].valor || a.coberturas[0].premio);
  if (apolices.length) { P.coleta.apolices = apolices; liga('coleta.apolices', 'segVidaList, segAcidList'); }
  return P;
}

raiz.planoDaColeta = planoDaColeta;
if (typeof module !== 'undefined') module.exports = { planoDaColeta };
})(typeof window !== 'undefined' ? window : globalThis);
