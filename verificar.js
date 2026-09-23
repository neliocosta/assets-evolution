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

console.log('\n' + (falhas ? falhas + ' verificação(ões) falharam.' : 'Tudo certo.') + '\n');
process.exit(falhas ? 1 : 0);
