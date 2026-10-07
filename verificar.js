// Verificação do protótipo. Rode `node verificar.js` depois de qualquer mudança no motor.
// Não precisa de navegador: extrai o motor do HTML e roda a simulação em Node.
const fs = require('fs');
const vm = require('vm');

const CLIENTE = 'evolucao-patrimonial.html';
const PORTAL = 'tela-consultor.html';
let falhas = 0;

const ok = (nome, cond, detalhe) => {
  console.log((cond ? '  ok   ' : '  FALHA') + '  ' + nome + (detalhe ? '  ' + detalhe : ''));
  if (!cond) falhas++;
};
const bloco = arq => {
  const m = fs.readFileSync(arq, 'utf8').match(/<script id="engine">([\s\S]*?)<\/script>/);
  if (!m) { console.error('motor não encontrado em ' + arq); process.exit(2); }
  return m[1];
};
const carregar = src => {
  const ctx = { module: { exports: {} }, console };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return ctx.module.exports;
};

console.log('\n1. Motor sincronizado entre as duas telas');
const srcCliente = bloco(CLIENTE), srcPortal = bloco(PORTAL);
ok('o bloco do motor é idêntico nos dois arquivos', srcCliente === srcPortal,
  srcCliente === srcPortal ? '' : '→ rode: node sync-motor.js');

const E = carregar(srcCliente);

for (const modo of ['perp', 'cons']) {
  console.log('\n2. Simulação no modo ' + modo);
  const s = E.run(modo);

  // identidade contábil: movimentações = entradas − saídas, de hoje em diante
  let erro = 0;
  for (const b of s.buckets.month) {
    if (b.w1 <= E.W0) continue;
    let i = 0, o = 0, v = 0;
    for (const k in b.f) {
      if (k.startsWith('in_')) i += b.f[k];
      else if (k.startsWith('out_')) o += b.f[k];
      else if (k.startsWith('mov_')) v += b.f[k];
    }
    erro = Math.max(erro, Math.abs(i - o - v));
  }
  ok('movimentações = entradas − saídas em todos os meses', erro < 0.01, 'erro máximo ' + erro.toFixed(6));

  // nada de NaN nem patrimônio negativo
  let ruins = 0;
  for (let i = E.W0; i < E.NW; i += 7) {
    const w = s.weeks[i];
    if (!isFinite(w.fin) || !isFinite(w.bens) || !isFinite(w.part) || w.fin < -1) ruins++;
  }
  ok('sem valores inválidos ou patrimônio negativo', ruins === 0, ruins ? ruins + ' semanas com problema' : '');

  // um salário por mês enquanto há trabalho
  const mb = s.buckets.month, idx = mb.findIndex(b => b.w0 >= E.W0);
  const ffMes = s.ff ? mb.findIndex(b => b.w0 >= s.ff.week) : mb.length;
  let semSalario = 0;
  for (let k = idx; k < ffMes - 1; k++) {
    const sal = Object.entries(mb[k].f).filter(([c]) => c.startsWith('in_')).reduce((a, [, v]) => a + v, 0);
    if (sal <= 0) semSalario++;
  }
  ok('todo mês de trabalho tem entrada', semSalario === 0, semSalario ? semSalario + ' meses sem entrada' : '');

  // trimestres e anos com a mesma quantidade de meses
  const contaMeses = nivel => {
    const tam = new Set();
    s.buckets[nivel].filter(b => b.w0 > E.W0 && b.w1 < E.NW - 60).forEach(b => {
      let n = 0; for (const x of mb) if (x.mi >= b.mi && x.mi < b.mi + (nivel === 'quarter' ? 3 : 12)) n++;
      tam.add(n);
    });
    return [...tam];
  };
  const tq = contaMeses('quarter'), ty = contaMeses('year');
  ok('trimestres com 3 meses', tq.length === 1 && tq[0] === 3, 'tamanhos: ' + tq.join(','));
  ok('anos com 12 meses', ty.length === 1 && ty[0] === 12, 'tamanhos: ' + ty.join(','));

  // liberdade financeira
  ok('liberdade financeira acontece', !!s.ff, s.ff ? 'aos ' + s.ff.age.toFixed(1) + ' anos' + (s.ff.forced ? ' (sem sustentar a renda desejada)' : '') : '');
}

console.log('\n3. Objetivos');
E.OBJ.forEach(o => {
  const coerente = isFinite(o.required) && isFinite(o.projected) && ['ok', 'adj', 'risk'].includes(o.status);
  ok(o.name, coerente, 'necessário ' + Math.round(o.required) + ' / definido ' + o.planned + ' → ' + o.status);
});

console.log('\n4. Planos alternativos (não pode quebrar)');
const casos = [
  ['sem objetivos', { objectives: [{ id: 'z', name: 'Nada', icon: 'sun', kind: 'consumo', months: 1, amount: 0, recurring: null, dedicated: 0, profile: 'moderado', planned: 0, strategy: '' }] }],
  ['sem entradas', { incomes: [] }],
  ['despesas maiores que a renda', { expenses: [{ id: 'x', label: 'Tudo', group: 'fix', week: 1, frequency: 'mensal', steps: [{ from: 0, value: 40000 }] }] }],
  ['renda desejada altíssima', { desired: 500000 }],
  ['patrimônio inicial alto', { initialWealth: 5000000 }],
];
for (const [nome, plano] of casos) {
  const E2 = carregar(srcCliente);
  let passou = true, detalhe = '';
  try {
    E2.configure(plano);
    const s = E2.run('perp');
    let erro = 0;
    for (const b of s.buckets.month) {
      if (b.w1 <= E2.W0) continue;
      let i = 0, o = 0, v = 0;
      for (const k in b.f) {
        if (k.startsWith('in_')) i += b.f[k];
        else if (k.startsWith('out_')) o += b.f[k];
        else if (k.startsWith('mov_')) v += b.f[k];
      }
      erro = Math.max(erro, Math.abs(i - o - v));
    }
    passou = erro < 0.01 && isFinite(s.weeks[E2.NW - 1].fin);
    detalhe = 'liberdade aos ' + (s.ff ? s.ff.age.toFixed(0) : '—') + ' anos';
  } catch (e) { passou = false; detalhe = e.message; }
  ok(nome, passou, detalhe);
}

console.log('\n5. Periodicidades e regras do fluxo');
{
  const E3 = carregar(srcCliente);
  const oc = (it, mm, saida) => E3.ocorrencias(it, mm, saida).map(o => o.k + ':' + o.v).join(' ');
  const sal = { id: 's', label: 'Salário', kind: 'ativa', frequency: 'mensal', days: [5, 20], steps: [{ from: 0, value: 5000 }, { from: 13, value: 6000 }] };
  const k20 = mm => E3.semanaDoCiclo(mm, 20);
  ok('mensal nos dias 5 e 20: duas ocorrências por mês', oc(sal, 2) === '1:5000 ' + k20(2) + ':5000', oc(sal, 2));
  ok('mudança de valor em out/2027 (mês 13)', oc(sal, 12) === '1:5000 ' + k20(12) + ':5000' && oc(sal, 13) === '1:6000 ' + k20(13) + ':6000');
  const feira = { id: 'f', frequency: 'semanal', steps: [{ from: 0, value: 300 }] };
  let semOk = true; for (let mm = 0; mm < 24; mm++) semOk = semOk && E3.ocorrencias(feira, mm, true).length === E3.semanasNoCiclo(mm);
  ok('semanal cai em todas as semanas do mês (4 ou 5)', semOk);
  const ipva = { id: 'i', frequency: 'anual', dates: [{ m: 0, d: 5 }, { m: 1, d: 5 }, { m: 2, d: 5 }], steps: [{ from: 0, value: 1400 }] };
  const mesesIpva = []; for (let mm = 0; mm < 24; mm++) if (E3.valorEm(ipva, mm, true)) mesesIpva.push(E3.mesDoCiclo(mm));
  ok('anual em 5/jan, 5/fev e 5/mar', mesesIpva.join(',') === '0,1,2,0,1,2', 'meses ' + mesesIpva.join(','));
  ok('equivalente mensal do anual em três parcelas', Math.abs(E3.mensalizado(ipva, 0) - 350) < 0.01);
  const bonus = { id: 'b', frequency: 'pontual', days: [20], steps: [{ from: 10, value: 30000 }] };
  let nb = 0; for (let mm = 0; mm < 60; mm++) nb += E3.ocorrencias(bonus, mm).length;
  ok('pontual acontece uma única vez', nb === 1 && E3.valorEm(bonus, 10) === 30000);
  const net = { id: 'n', frequency: 'mensal', days: [12], steps: [{ from: 0, value: 55 }], exc: { 4: 0, '6:2': 80 } };
  ok('ajuste só nesta ocorrência', E3.valorEm(net, 4, true) === 0 && E3.valorEm(net, 6, true) === 80 && E3.valorEm(net, 7, true) === 55);
  const fim = { id: 'x', frequency: 'mensal', days: [10], steps: [{ from: 36, value: 2500 }, { from: 180, value: 0 }] };
  ok('linha que começa no futuro e termina numa data', E3.valorEm(fim, 35, true) === 0 && E3.valorEm(fim, 36, true) === 2500 && E3.valorEm(fim, 180, true) === 0);

  // o exemplo do consultor, simulado por inteiro
  E3.configure({
    incomes: [sal,
      { id: 'aluguelrec', label: 'Aluguel do imóvel', kind: 'passiva', frequency: 'mensal', days: [10], steps: [{ from: 0, value: 3000 }, { from: 13, value: 3400 }] },
      Object.assign({}, bonus, { label: 'Bônus', kind: 'ativa' }),
      { id: 'aulas', label: 'Aulas', kind: 'ativa', frequency: 'mensal', days: [5], steps: [{ from: 120, value: 4000 }] }],
    expenses: [Object.assign({}, feira, { label: 'Feira', group: 'adj' }), Object.assign({}, ipva, { label: 'IPVA', group: 'fix' }),
      Object.assign({}, net, { label: 'Netflix', group: 'fix' }), Object.assign({}, fim, { label: 'Escola', group: 'fix' }),
      { id: 'guia', label: 'Guia de imposto', group: 'fix', frequency: 'pontual', days: [20], steps: [{ from: 8, value: 15000 }] }],
  });
  const s = E3.run('perp');
  let erro = 0; const porMes = {};
  for (const b of s.buckets.month) {
    if (b.w1 <= E3.W0) continue;
    let i = 0, o = 0, v = 0;
    for (const k in b.f) { if (k.startsWith('in_')) i += b.f[k]; else if (k.startsWith('out_')) o += b.f[k]; else if (k.startsWith('mov_')) v += b.f[k]; }
    erro = Math.max(erro, Math.abs(i - o - v)); porMes[b.mi] = b.f;
  }
  ok('exemplo: movimentações = entradas − saídas', erro < 0.01, 'erro máximo ' + erro.toFixed(6));
  ok('exemplo: salário de 10 mil vira 12 mil em out/2027', porMes[12].in_s === 10000 && porMes[13].in_s === 12000);
  ok('exemplo: bônus e guia só no seu mês', porMes[10].in_b === 30000 && !porMes[11].in_b && porMes[8].out_fix_guia === 15000 && !porMes[9].out_fix_guia);
  ok('exemplo: aulas a partir de daqui a 10 anos', !porMes[119].in_aulas && porMes[120].in_aulas === 4000);
  // cada ocorrência cai na semana do calendário que contém a sua data
  const contem = (i, dias) => { for (let k = 0; k < 7; k++) if (dias.includes(new Date(E3.weekDate(i).getTime() + k * 864e5).getDate())) return true; return false; };
  let foraDaData = 0, vistas = 0;
  for (let i = E3.W0; i < s.ff.week; i++) {
    const f = s.weeks[i].f;
    if (f.in_s) { vistas++; if (!contem(i, [5, 20])) foraDaData++; }
    if (f.out_fix_n) { vistas++; if (!contem(i, [12])) foraDaData++; }
  }
  ok('cada ocorrência cai na semana que contém a sua data', vistas > 100 && foraDaData === 0, vistas + ' ocorrências, ' + foraDaData + ' fora da data');

  // aluguel pago termina quando a casa é comprada; renda ativa para na liberdade, a passiva continua
  const E4 = carregar(srcCliente); const s4 = E4.run('perp');
  const casa = E4.OBJ.find(o => o.id === 'casa').months, mes4 = {};
  s4.buckets.month.forEach(b => { if (b.w1 > E4.W0) mes4[b.mi] = b.f; });
  ok('aluguel é pago até a compra da casa e some depois', mes4[casa - 1].out_fix_moradia > 0 && !mes4[casa + 1].out_fix_moradia);
  const mff = s.buckets.month.find(b => b.w0 >= s.ff.week).mi + 2;
  ok('depois da liberdade, a renda ativa para e a passiva continua', !porMes[mff].in_s && !porMes[mff].in_aulas && porMes[mff].in_aluguelrec === 3400,
    'liberdade aos ' + s.ff.age.toFixed(1));

  // renda contratada em data fixa: não depende de quando a liberdade acontece
  const E6 = carregar(srcCliente); const inss = E6.PASSIVE.find(p => p.name === 'INSS');
  const inicioInss = sx => { const b = sx.buckets.month.find(b => b.w1 > E6.W0 && b.f['in_pas_' + E6.PASSIVE.indexOf(inss)]); return b && b.mi; };
  const a6 = inicioInss(E6.run('perp'));
  E6.configure({ desired: 40000 }); const s6 = E6.run('perp'), b6 = inicioInss(s6);
  ok('INSS em data fixa começa no mesmo mês mesmo com a liberdade mudando', a6 === inss.startMi && b6 === inss.startMi, 'mês ' + a6 + ' / ' + b6 + ', liberdade aos ' + s6.ff.age.toFixed(1));
  const E7 = carregar(srcCliente); E7.PASSIVE.find(p => p.name === 'INSS').startMi = 100;
  const s7 = E7.run('perp'), m7 = {}; s7.buckets.month.forEach(b => { if (b.w1 > E7.W0) m7[b.mi] = b.f; });
  const k7 = 'in_pas_' + E7.PASSIVE.findIndex(p => p.name === 'INSS');
  ok('renda de data fixa antes da liberdade já entra no fluxo', !m7[99][k7] && m7[100][k7] === 4200 && s7.ff.mi > 100);

  // semanal: o mês do motor tem semanas inteiras, e cada semana tem exatamente um sábado
  const feiraSab = { id: 'fs', frequency: 'semanal', weekday: 6, steps: [{ from: 0, value: 150 }] };
  let sabOk = true, totalSab = 0;
  for (let mm = 0; mm < 120; mm++) { const n = E3.ocorrencias(feiraSab, mm, true).length; totalSab += n; if (n !== E3.semanasNoCiclo(mm)) sabOk = false; }
  ok('semanal: uma vez por semana, sem perder nem repetir semanas', sabOk && Math.abs(totalSab - 120 * 365.25 / 7 / 12) < 2, totalSab + ' sábados em 10 anos');
  ok('anual sem datas escolhidas não lança nada', E3.valorEm({ id: 'a0', frequency: 'anual', dates: [], steps: [{ from: 0, value: 999 }] }, 0, true) === 0);

  // aporte definido igual ao necessário: o objetivo fica alcançável na simulação
  const E10 = carregar(srcCliente);
  E10.configure({ objectives: [{ id: 'v', name: 'Viagem', icon: 'plane', kind: 'consumo', months: 24, amount: 20000, recurring: null, dedicated: 0, profile: 'moderado', planned: 0, strategy: '' }] });
  const ov = E10.OBJ[0]; ov.planned = Math.ceil(ov.required); E10.derive(ov);
  const s10 = E10.run('perp'), ev10 = s10.events.find(e => e.type === 'obj'), real10 = s10.weeks[ev10.week - 1].obj[0];
  ok('aporte igual ao necessário deixa o objetivo alcançável', real10 / ov.amount >= 0.98, Math.round(real10) + ' de ' + ov.amount);

  // idade de hoje, idade-alvo de aposentadoria, bens de hoje e plano vazio
  const E8 = carregar(srcCliente); E8.configure({ age: 48, retireAge: 60, initialBens: 900000, objectives: [] });
  const s8 = E8.run('perp');
  ok('cliente de 48 anos: hoje fica aos 48', E8.W0 === Math.round(48 * E8.WPY) && Math.abs(E8.ageOf(E8.W0) - 48) < 0.01);
  ok('idade-alvo: a liberdade acontece aos 60', s8.ff && Math.floor(s8.ff.age) === 60, s8.ff ? 'aos ' + s8.ff.age.toFixed(2) + (s8.ff.forced ? ' (sem sustentar)' : '') : '');
  ok('imóveis e bens de hoje entram no patrimônio', Math.abs(s8.weeks[E8.W0].bens - 900000) < 1);
  ok('plano sem objetivos roda', E8.OBJ.length === 0 && isFinite(s8.weeks[E8.NW - 1].fin));
  let hist = 0; for (let i = 0; i < E8.W0 - 6; i++) hist += Object.keys(s8.weeks[i].f).length;
  ok('nada é lançado antes de hoje', hist === 0);
  const E9 = carregar(srcCliente); E9.configure({ incomes: [], expenses: [], objectives: [], passive: [], desired: 0, initialWealth: 0 });
  const s9 = E9.run('perp');
  ok('plano totalmente vazio roda', isFinite(s9.weeks[E9.NW - 1].fin));

  // plano antigo, com o aluguel num campo solto
  const E5 = carregar(srcCliente); const antigo = { rent: 2000, expenses: [{ id: 'm', label: 'Mercado', group: 'adj', week: 0, steps: [{ from: 0, value: 1000 }] }] };
  E5.configure(antigo);
  const mo = antigo.expenses.find(e => e.id === 'moradia');
  ok('plano antigo: aluguel vira linha de despesa fixa', !!mo && mo.steps[0].value === 2000 && mo.endObj === 'casa' && antigo.rent === undefined);
}

console.log('\n6. Financiamento de bens (Price e SAC)');
{
  const EF = carregar(srcCliente);
  const price = { system: 'price', principal: 300000, rateYear: 0.1, months: 120 }, sac = Object.assign({}, price, { system: 'sac' });
  const cp = EF.cronogramaFin(price), cs = EF.cronogramaFin(sac);
  const soma = (c, k) => c.reduce((a, p) => a + p[k], 0);
  ok('Price: a amortização soma o valor financiado', Math.abs(soma(cp, 'amort') - 300000) < 0.01 && cp.length === 120 && cp[119].saldo < 0.01);
  ok('Price: parcela constante, juros caem e amortização sobe', Math.abs(cp[0].pay - cp[119].pay) < 0.01 && cp[0].juros > cp[119].juros && cp[0].amort < cp[119].amort, 'parcela ' + Math.round(cp[0].pay));
  ok('SAC: amortização constante e parcela cai', Math.abs(cs[0].amort - cs[119].amort) < 0.01 && cs[0].pay > cs[119].pay && Math.abs(soma(cs, 'amort') - 300000) < 0.01);
  ok('SAC paga menos juros no total que a Price', soma(cs, 'juros') < soma(cp, 'juros'), Math.round(soma(cs, 'juros')) + ' contra ' + Math.round(soma(cp, 'juros')));
  ok('juros zero: parcelas iguais ao principal ÷ prazo', Math.abs(EF.cronogramaFin({ system: 'price', principal: 12000, rateYear: 0, months: 12 })[0].pay - 1000) < 0.01);
  for (const [nome, fin] of [['Price', price], ['SAC', sac]]) {
    const E4 = carregar(srcCliente);
    E4.configure({ objectives: [{ id: 'c', name: 'Casa', icon: 'home', kind: 'bem', months: 24, amount: 100000, recurring: null, financing: fin, dedicated: 0, profile: 'moderado', planned: 3000, strategy: '' }] });
    const s4 = E4.run('perp');
    let erro = 0, juros = 0;
    for (const b of s4.buckets.month) {
      if (b.w1 <= E4.W0) continue;
      let i = 0, o = 0, v = 0;
      for (const k in b.f) { if (k.startsWith('in_')) i += b.f[k]; else if (k.startsWith('out_')) o += b.f[k]; else if (k.startsWith('mov_')) v += b.f[k]; }
      erro = Math.max(erro, Math.abs(i - o - v)); juros += b.f['out_fix_c_k2'] || 0;   // o financiamento antigo vira o custo k2 da lista
    }
    const total = fin === price ? soma(cp, 'juros') : soma(cs, 'juros');
    ok('financiamento ' + nome + ' na simulação: identidade contábil e juros iguais ao cronograma', erro < 0.01 && Math.abs(juros - total) < 1, 'juros ' + Math.round(juros) + ' de ' + Math.round(total));
  }
}

console.log('\n7. Custos depois de realizado (lista)');
{
  const E7 = carregar(srcCliente);
  const velho = { id: 'v', name: 'Casa', icon: 'home', kind: 'bem', months: 12, amount: 30000, dedicated: 0, profile: 'moderado', planned: 5000, strategy: '',
    recurring: { value: 900, months: null, label: 'Condomínio', amort: 0 }, financing: { system: 'sac', principal: 200000, rateYear: 0.1, months: 240 } };
  E7.configure({ objectives: [velho] });
  ok('plano antigo: custo fixo e financiamento viram itens da lista', velho.costs.length === 2 && velho.costs[0].type === 'fixo' && velho.costs[1].type === 'sac' && !('recurring' in velho) && !('financing' in velho));
  const sc = E7.serieCusto(velho.costs[1], 241), sf = E7.serieCusto({ type: 'fixo', value: 900, months: 24 }, 30);
  ok('série do SAC cai e termina no prazo', sc[0] > sc[239] && sc[239] > 0 && sc[240] === 0);
  ok('série do custo fixo com prazo termina no prazo', sf[23] === 900 && sf[24] === 0);
  const s7 = E7.run('perp');
  let erro = 0, fixo = 0;
  for (const b of s7.buckets.month) {
    if (b.w1 <= E7.W0) continue;
    let i = 0, o = 0, v = 0;
    for (const k in b.f) { if (k.startsWith('in_')) i += b.f[k]; else if (k.startsWith('out_')) o += b.f[k]; else if (k.startsWith('mov_')) v += b.f[k]; }
    erro = Math.max(erro, Math.abs(i - o - v)); fixo += b.f['out_fix_v_k1'] || 0;
  }
  ok('fixo e SAC juntos: identidade contábil', erro < 0.01 && fixo > 0, 'condomínio lançado: ' + Math.round(fixo));
  // bem que não chega a 70% do valor na data: não é comprado, e os gastos depois dele não entram
  const EN = carregar(srcCliente);
  const caro = { id: 'p', name: 'Casa de praia', icon: 'palm', kind: 'bem', months: 24, amount: 5000000, dedicated: 0, profile: 'moderado', planned: 1000, strategy: '', costs: [{ id: 'k1', type: 'fixo', value: 2000, months: null, label: 'Condomínio' }] };
  EN.configure({ objectives: [caro] });
  const sn = EN.run('perp'); let cond = 0, errN = 0;
  for (const b of sn.buckets.month) { if (b.w1 <= EN.W0) continue; let i = 0, o = 0, v = 0; for (const k in b.f) { if (k.startsWith('in_')) i += b.f[k]; else if (k.startsWith('out_')) o += b.f[k]; else if (k.startsWith('mov_')) v += b.f[k]; } errN = Math.max(errN, Math.abs(i - o - v)); cond += b.f['out_fix_p_k1'] || 0; }
  ok('bem abaixo de 70% do valor não é comprado nem gera gastos depois', caro.naoComprado && Math.max(...sn.weeks.map(w => w.bens)) === 0 && cond === 0 && errN < 0.01);
}

console.log('\n8. Saque na liberdade financeira: perpetuidade, consumo ou renda desejada');
{
  const Ed = carregar(srcCliente), fimI = Math.round(94 * Ed.WPY);
  const sp = Ed.run('perp'), sd = Ed.run('desej');
  // saque = renda desejada − rendas que entram: num ano depois da liberdade, o gasto médio (com a amortização,
  // que vira bem) é a renda desejada; mês a mês ele varia com as despesas semanais (4 ou 5 por mês)
  const ano = sd.buckets.month.filter(x => x.w0 > sd.ff.week + 60).slice(0, 12);
  let gasto = 0; ano.forEach(b => { for (const k in b.f) { if (k.startsWith('out_')) gasto += b.f[k]; if (k === 'mov_bens' && b.f[k] > 0) gasto += b.f[k]; } });
  const desejo = Ed.config().desired;
  ok('renda desejada: o gasto médio do ano é a renda desejada', Math.abs(gasto / 12 - desejo) < 1, Math.round(gasto / 12) + ' de ' + desejo);
  ok('renda desejada menor que o rendimento: o patrimônio cresce mais que na perpetuidade', sd.weeks[fimI].fin > sp.weeks[fimI].fin);
  const Ea = carregar(srcCliente); Ea.configure({ desired: 60000, retireAge: 60 });
  const sa = Ea.run('desej'); let acaba = null; for (let i = sa.ff.week + 1; i < Ea.NW; i++) if (sa.weeks[i].fin < 1) { acaba = i; break; }
  ok('renda desejada alta: o patrimônio acaba antes da expectativa de vida', acaba != null && Ea.ageOf(acaba) < 95, acaba ? 'acaba aos ' + Math.floor(Ea.ageOf(acaba)) : '');
}

console.log('\n9. Seguro de vida e de acidentes pessoais (calculadora da Nord)');
{
  const Es = carregar(srcCliente);
  // caso conferido no site da Nord: 40 anos, renda 10 mil, filho de 5 anos, financeiro 200 mil, bens 500 mil → R$ 1.410.933,03
  const um = g => ({ age: 40, initialWealth: 200000, initialBens: 500000, partValue: 0, incomes: [], riscos: { dependentes: [{ relacao: 'filho', nasc: '2021-09' }],
    seguro: { renda: 10000, passiva: 0, geradores: [Object.assign({ pessoa: 'titular', participacao: 100, patrimonioPct: 100, inssInvalidez: 3000, inssMorte: 0 }, g)] } } });
  const p = Es.calculaSeguros(um({})).pessoas[0];
  ok('vida: a mesma necessidade da calculadora da Nord', Math.abs(p.vida.necessidade - 1410933.03) < 0.01, p.vida.necessidade.toFixed(2));
  ok('acidentes: até os 95 anos, G − E', p.acidentes.F === 660 && Math.abs(p.acidentes.necessidade - (7000 * (1 - Math.pow(1.004, -660)) / 0.004 - 200000)) < 0.01);
  const sem = um({}); sem.riscos.dependentes = [];
  ok('sem dependentes: o seguro de vida não é essencial e a reserva perde o d', Es.calculaSeguros(sem).pessoas[0].vida.status === 'ok' && Es.avaliaRiscos(sem).itens.reserva.d === 0);
  ok('cobertura parcial: atenção; nenhuma: crítico', Es.avaliaRiscos(um({ coberturaVida: 500000 })).itens.familia.status === 'atencao' && Es.avaliaRiscos(um({})).itens.familia.status === 'critico');
  ok('plano sem o cálculo de seguro: não avaliado', Es.avaliaRiscos({ riscos: {} }).itens.renda.status === 'pendente');
}

console.log('\n10. Patrimônio de hoje e fase da vida financeira');
{
  const Ef = carregar(srcCliente), P = () => JSON.parse(JSON.stringify(Ef.PATRIMONIO_EXEMPLO));
  const pl = { age: 35, retireAge: 65, riscos: { reserva: { custoVida: 10000 } }, patrimonio: P() };
  Ef.sincronizaPatrimonio(pl);
  ok('as listas viram os totais do plano', pl.initialWealth === 860000 && pl.partValue === 50000 && pl.initialBens === 1210000);
  const f = Ef.faseDaVida(pl);
  ok('total = financeiro + participações + bens − saldo devedor', f.total === 860000 + 50000 + 1210000 - 368000, f.total);
  // começou aos 23, para aos 65: marcos em 23 / 32,3 / 51 / 65; aos 35, 14% da Consolidação (18× a 60×)
  ok('marcos das fases em 2/9 e 6/9 da vida de trabalho', Math.abs(f.fases[2].de - (23 + 42 * 2 / 9)) < 1e-9 && f.fases[3].de === 51 && f.fases[4].de === 65);
  ok('aos 35: Consolidação, esperado interpolado', f.fase === 2 && f.minimo === 180000 && f.maximo === 600000 && Math.abs(f.esperado - 10000 * (18 + 42 * (35 - 23 - 28 / 3) / (28 - 28 / 3))) < 0.01, Math.round(f.esperado));
  ok('antes de começar: Preparação, esperado zero', Ef.faseDaVida(Object.assign({}, pl, { age: 20 })).esperado === 0);
  ok('depois da idade alvo: Liberdade, 200×', Ef.faseDaVida(Object.assign({}, pl, { age: 70 })).esperado === 2000000);
  ok('dívida avulsa também desconta do total', Ef.faseDaVida(Object.assign({}, pl, { patrimonio: Object.assign(P(), { dividas: [{ nome: 'Consignado', saldoDevedor: 20000 }] }) })).total === f.total - 20000);
  ok('sem a idade em que começou: sem fase', Ef.faseDaVida({ age: 35, patrimonio: {} }).fase === null);
  const alt = Ef.aplicaAlteracoes(Object.assign({}, pl, { patrimonio: P() }), [{ tipo: 'campo', caminho: 'patrimonio.financeiro.2.valor', para: 700000 }]);
  ok('proposta num valor do detalhe atualiza o total', alt.initialWealth === 860000 - P().financeiro[2].valor + 700000, alt.initialWealth);
}

console.log('\n11. Otimização tributária (regras de 2026)');
{
  const Et = carregar(srcCliente), ir = Et.calculaIR;
  ok('até R$ 60 mil por ano o imposto zera (redução da Lei 15.270)', ir({ rend: 60000 }).devido === 0 && ir({ rend: 59000, inss: 6000 }).devido === 0);
  // 70 mil, simplificada: base 56 mil → 27,5% − 10.904,76 = 4.495,24; redução 8.429,73 − 0,095575 × 70 mil = 1.739,48
  ok('entre R$ 60 mil e R$ 88.200 a redução cai em linha reta', Math.abs(ir({ rend: 70000 }).devido - (56000 * 0.275 - 10904.76 - (8429.73 - 0.095575 * 70000))) < 0.01, ir({ rend: 70000 }).devido.toFixed(2));
  ok('desconto simplificado limitado a R$ 17.640', ir({ rend: 200000 }).desconto === 17640 && ir({ rend: 50000 }).desconto === 10000);
  const pg = ir({ rend: 200000, inss: 12000, pgbl: 50000 });
  ok('PGBL deduz até 12% da renda tributável, e só com INSS', pg.ded.pgbl === 24000 && pg.sobraPgbl === 26000 && ir({ rend: 200000, pgbl: 50000 }).ded.pgbl === 0);
  ok('fica com a declaração de menor imposto', pg.modelo === 'completa' && ir({ rend: 200000, inss: 12000 }).modelo === 'simplificada' && pg.devido === Math.min(pg.completa, pg.simplificada));
  const copia = o => JSON.parse(JSON.stringify(o));
  const plan = Object.assign({ name: 'Ana Ribeiro', age: 35 }, Et.FAMILIA_EXEMPLO, copia(Et.config()), { tributario: copia(Et.TRIBUTARIO_EXEMPLO), riscos: { dependentes: [{ nome: 'Luiza' }] }, patrimonio: copia(Et.PATRIMONIO_EXEMPLO) });
  const f = Et.irDaFamilia(plan);
  ok('os dependentes da página Cliente vão para quem os declara', f.nDeps === 1 && f.atual.pessoas[1].deps === 1 && f.recomendada.pessoas[0].deps === 1 && f.recomendada.pessoas[1].deps === 0);
  ok('economia = imposto atual − imposto recomendado', Math.abs(f.economia - (f.atual.total - f.recomendada.total)) < 1e-9 && f.economia > 0, Math.round(f.economia));
  // uma variável num lugar só: o que o fluxo de caixa já tem não é pedido de novo
  ok('nomes do casal vêm da página Cliente', f.atual.pessoas.map(p => p.nome).join() === 'Ana,Marcos' && Et.nomesDaFamilia({ name: 'Camila e Rafael Souza' }).conjuge === 'Rafael');
  ok('renda tributável e INSS vêm do fluxo: bruto × recebimentos em 12 meses', f.atual.pessoas[0].doFluxo && f.atual.pessoas[0].rend === 12 * 11700 && Math.abs(f.atual.pessoas[1].inss - 12 * 7800 * 0.11) < 1e-6);
  ok('renda isenta (lucros, PLR) fica de fora dos rendimentos tributáveis', !Et.rendaDaPessoa(plan, 'titular').linhas.includes('Bônus anual'));
  const solteira = Object.assign({}, plan, { tipo: 'individual' }), so = Et.irDaFamilia(solteira);
  ok('plano de uma pessoa: só o titular declara', so.atual.pessoas.length === 1);
  const semFluxo = Object.assign({}, plan, { incomes: [] }); semFluxo.tributario.ir.pessoas[0].rend = 50000;
  ok('sem linhas no fluxo, vale o digitado', !Et.irDaFamilia(semFluxo).atual.pessoas[0].doFluxo && Et.irDaFamilia(semFluxo).atual.pessoas[0].rend === 50000);
  const so2 = Et.retiradaDosSocios(plan).socios[0];
  ok('sócio: pró-labore e dividendos de hoje vêm das linhas do fluxo', so2.doFluxo && so2.atual.pro === 7800 && so2.atual.div === 0 && so2.nome === 'Marcos');
  const br = Et.bensDoRisco(plan);
  ok('bens da gestão de riscos são os do patrimônio, com a proteção no próprio bem', br.length === 3 && br[2].protecao === 'insuficiente' && br[0].valor === 160000);
  const antigo = Object.assign({}, plan, { patrimonio: { bens: [{ nome: 'Carro', mercado: 50000 }] }, riscos: { bens: { itens: [{ nome: 'carro', valor: 40000, protecao: 'total' }] } } });
  ok('plano antigo: a proteção da lista dos riscos passa para o bem de mesmo nome', Et.bensDoRisco(antigo)[0].protecao === 'total' && Et.bensDoRisco(antigo)[0].valor === 50000);
  const sa = Et.avaliaRiscos(Object.assign({}, plan, { riscos: copia(Et.RISCOS_EXEMPLO) })).itens.saude;
  ok('plano de saúde: o que a empresa paga não sai do bolso (exemplo: R$ 1.500 no fluxo)', sa.total === 2650 && sa.terceiros === 1150 && sa.doBolso === 1500
    && Et.config().expenses.find(e => e.id === 'saude').steps[0].value === sa.doBolso);
  const seg = Et.calculaSeguros(Object.assign({}, plan, { riscos: copia(Et.RISCOS_EXEMPLO) }));
  ok('seguros: a idade do titular e do cônjuge é a da página Cliente', seg.pessoas[0].idade === 35 && seg.pessoas[1].idade === 38);
  const tb = b => Et.titularidadeDoBem(plan, b);
  ok('titularidade: de uma pessoa ou do casal (metade, sem informar)', tb({ titularidade: 'conjuge' }).texto === 'de Marcos' && tb({ titularidade: 'casal' }).titular === 0.5
    && tb({ titularidade: 'casal', titularPct: 70 }).texto === 'do casal (70% de Ana)' && tb({}) === null);
  const r = Et.calculaRetirada(7000, 3000, 'presumido');
  ok('pró-labore: INSS de 11% e 20% patronal fora do Simples', r.inss === 770 && Math.abs(r.patronal - 1400) < 1e-9 && Et.calculaRetirada(7000, 0, 'simples').patronal === 0);
  ok('pró-labore: INSS limitado ao teto', Math.abs(Et.calculaRetirada(20000, 0, 'simples').inss - 8475.55 * 0.11) < 1e-9);
  ok('dividendos: isentos até R$ 50 mil no mês, 10% do total acima', Et.calculaRetirada(0, 50000).divIR === 0 && Et.calculaRetirada(0, 60000).divIR === 6000);
  ok('imposto mínimo acima de R$ 600 mil no ano', Et.calculaRetirada(0, 50000).minimo === 0 && Math.abs(Et.calculaRetirada(5000, 50000).minimo - 0.01 * 660000) < 0.01);
  const su = Et.sucessao(plan);
  ok('sucessão: a previdência fica fora do inventário', su.atual.prev === 120000 && su.atual.inventario === su.atual.total - su.atual.prev && Math.abs(su.economia - 300000 * 0.12) < 1e-6);
  ok('sucessão: o total não muda com a recomendação', su.atual.total === su.recomendada.total);
  const p = Et.simulaPrevidencia(plan.tributario.previdencia), soma = p.passos.reduce((a, x) => a + x[1], 0);
  ok('previdência: a escada soma do investimento comum à previdência', Math.abs(p.comum.final + soma - p.prev.final) < 0.01);
  ok('previdência: tabela regressiva de 35% a 10%', Et.aliqRegressiva(1) === 0.35 && Et.aliqRegressiva(10) === 0.15 && Et.aliqRegressiva(10.1) === 0.10);
  const sem = Et.simulaPrevidencia({ inicial: 100000, aporte: 0, anos: 10, rent: 0, trocas: 3 });
  ok('previdência: sem rendimento, sem imposto', Math.abs(sem.comum.final - 100000) < 0.01 && Math.abs(sem.prev.final - 100000) < 0.01);
}

console.log('\n' + (falhas ? falhas + ' verificação(ões) falharam.' : 'Tudo certo.') + '\n');
process.exit(falhas ? 1 : 0);
