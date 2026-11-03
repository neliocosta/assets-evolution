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
const graficos = arq => (fs.readFileSync(arq, 'utf8').match(/<script id="graficos">([\s\S]*?)<\/script>/) || [])[1];
ok('os gráficos compartilhados (o sunburst) são idênticos nos dois arquivos', !!graficos(CLIENTE) && graficos(CLIENTE) === graficos(PORTAL), '');

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

  // nada de NaN; o financeiro só fica negativo depois da ruína (o dinheiro acabou e o que falta virou dívida)
  let ruins = 0;
  for (let i = E.W0; i < E.NW; i += 7) {
    const w = s.weeks[i];
    if (!isFinite(w.fin) || !isFinite(w.bens) || !isFinite(w.part) || (w.fin < -1 && !(s.ruina && i >= s.ruina.week))) ruins++;
  }
  ok('sem valores inválidos, e financeiro negativo só depois da ruína', ruins === 0, ruins ? ruins + ' semanas com problema' : '');

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

{ // quando o objetivo começa a receber (aporteDe, dedicadoEm) e o objetivo desligado
  const Eo = carregar(srcCliente);
  const base = () => ({ initialWealth: 100000, incomes: [{ id: 's', label: 'Salário', steps: [{ from: 0, value: 20000 }] }], expenses: [{ id: 'd', label: 'Tudo', group: 'fix', week: 1, frequency: 'mensal', steps: [{ from: 0, value: 10000 }] }],
    objectives: [{ id: 'a', name: 'A', icon: 'sun', kind: 'consumo', months: 24, amount: 50000, costs: [], dedicated: 20000, profile: 'moderado', planned: 1000, strategy: '' }] });
  const aportes = (P, de, ate) => { Eo.configure(P); const s = Eo.run('desej'); return s.buckets.month.filter(b => b.mi >= de && b.mi < ate && b.w1 > Eo.W0).reduce((t, b) => t + Math.max(0, b.f.mov_obj_a || 0), 0); };
  const P1 = base(); P1.objectives[0].aporteDe = 6;
  ok('objetivos: com aporteDe, nada é aportado antes do mês marcado', aportes(P1, 1, 6) < 0.5, Math.round(aportes(P1, 1, 6)));
  ok('objetivos: com aporteDe, o aporte começa no mês marcado', Math.abs(aportes(P1, 6, 7) - 1000) < 0.5, Math.round(aportes(P1, 6, 7)));
  const P2 = base(); P2.objectives[0].dedicadoEm = 6; P2.objectives[0].planned = 0;
  ok('objetivos: com dedicadoEm, o patrimônio entra no mês marcado', aportes(P2, 0, 6) < 0.5 && Math.abs(aportes(P2, 6, 7) - 20000) < 0.5, Math.round(aportes(P2, 0, 6)) + ' / ' + Math.round(aportes(P2, 6, 7)));
  const P3 = base(), P4 = base(); P4.objectives[0].aporteDe = 12; Eo.configure(P3); const n3 = P3.objectives[0].required; Eo.configure(P4);
  ok('objetivos: começar a guardar depois pede um aporte mensal maior', P4.objectives[0].required > n3 * 1.5, Math.round(n3) + ' → ' + Math.round(P4.objectives[0].required));
  const P5 = base(); P5.objectives[0].ligado = false; Eo.configure(P5);
  // a política confere mês a mês: o aporte que começa em 6 meses cabe se a sobra de daqui a 6 meses der conta
  const P6 = () => ({ initialWealth: 0, incomes: [{ id: 's', label: 'Salário', steps: [{ from: 0, value: 10000 }, { from: 6, value: 13000 }] }], expenses: [{ id: 'd', label: 'Tudo', group: 'fix', week: 1, frequency: 'mensal', steps: [{ from: 0, value: 5000 }] }],
    objectives: [{ id: 'a', name: 'A', icon: 'sun', kind: 'consumo', months: 30, amount: 300000, costs: [], dedicated: 0, profile: 'moderado', planned: 5000, strategy: '' },
      { id: 'b', name: 'B', icon: 'sun', kind: 'consumo', months: 30, amount: 30000, costs: [], dedicated: 0, profile: 'moderado', planned: 500, aporteDe: 6, strategy: '' }] });
  const pol = P => { Eo.configure(P); return Eo.politicaDeInvestimentos(P, Eo.run('desej')); };
  const Q1 = pol(P6());
  ok('política: o aporte que começa quando a sobra sobe fecha em todos os meses (18 de 24 meses: média de 375)', Q1.excessoMensal < 0.5 && Math.abs(Q1.caixinhas.find(c => c.id === 'b').mensal - 375) < 0.5, 'excesso ' + Math.round(Q1.excessoMensal));
  const P7 = P6(); delete P7.objectives[1].aporteDe; const Q2 = pol(P7), pb = Q2.meses.map(m => (m.aportes.find(x => x.id === 'b') || { v: 0 }).v);
  // a poupança para objetivos é fixa: a sobra abaixo da meta por 6 meses, com o aumento que repõe em menos de 12, passa pela
  // caixa de curto prazo (negativa e de volta a zero); sem o aumento, a caixa não volta, e o de menor prioridade perde a diferença
  const g2 = Q2.meses.map(m => Math.round(m.guardado)), P7b = P6(); delete P7b.objectives[1].aporteDe; P7b.incomes[0].steps.pop(); Eo.configure(P7b); const s7b = Eo.run('desej'), pb2 = s7b.programa.meses.map(m => Math.round(m.aportes.b || 0)), f7b = s7b.programa.faltas[0] || {};
  ok('fluxo planejado: a sobra abaixo da meta, reposta pelo aumento em menos de 12 meses, passa pela caixa de curto prazo, e os dois recebem a parte todo mês', pb.slice(0, 24).every(v => Math.abs(v - 500) < 0.5) && Math.min(...g2) === -3000 && g2[7] >= 0 && !Q2.meses.some(m => m.corte > 0.5), pb.slice(0, 9).map(Math.round).join(' ') + ' | caixa ' + g2.slice(0, 9).join(' '));
  // perto da data, a sobra livre depois dela já repõe a caixa em 12 meses, e o corte diminui
  ok('  sem o aumento, a caixa não volta a zero: o de menor prioridade perde os 500 desde o mês 0, e a falta fica registrada', pb2.slice(0, 18).every(v => v === 0) && s7b.programa.meses.every(m => Math.round(m.aportes.a) === 5000) && f7b.de === 0 && Math.round(f7b.valor) === 500 && f7b.quem.join() === 'b' && f7b.causa === null, pb2.slice(0, 6).join(' ') + ' ' + JSON.stringify(f7b));
  // o mês negativo (um imposto) também passa pela caixa: ela guarda antes o que pode, fica negativa e se recompõe; o aporte não muda
  const P8 = P6(); P8.expenses.push({ id: 'ir', label: 'Imposto', group: 'fix', frequency: 'pontual', days: [10], steps: [{ from: 3, value: 7000 }] }); P8.objectives[0].planned = 3000; delete P8.objectives[1].aporteDe; P8.objectives[1].planned = 1000;
  const Q3 = pol(P8), mi3 = Q3.meses.findIndex(m => m.sobra < 0), a3 = Q3.meses[mi3 - 1], b3 = Q3.meses[mi3];
  ok('fluxo planejado: no mês do imposto, os objetivos recebem a parte; a caixa guarda antes, fica negativa e se recompõe', mi3 === 3 && Math.round(a3.guardado) === 3000 && Math.round(b3.total) === 4000 && Math.round(b3.guardado) === -3000 && Q3.meses[6].guardado >= 0 && !Q3.meses.some(m => m.corte > 0.5), 'mês ' + mi3 + ': antes ' + Math.round(a3.guardado) + ', aportes ' + Math.round(b3.total) + ', caixa ' + Math.round(b3.guardado));
  // a caixinha que, rendendo até a data, já cobre o valor para de receber; o último aporte é só o que falta
  const P9 = P6(); P9.initialWealth = 50000; P9.objectives = [{ id: 'c', name: 'C', icon: 'sun', kind: 'consumo', months: 24, amount: 20000, costs: [], dedicated: 0, profile: 'moderado', planned: 3000, strategy: '' }];
  const Q9 = pol(P9), a9 = Q9.meses.map(m => (m.aportes.find(x => x.id === 'c') || { v: 0 }).v), ult = a9.findIndex((v, k) => v > 0.5 && !(a9[k + 1] > 0.5)), o9 = Eo.OBJ.find(o => o.id === 'c');
  ok('fluxo planejado: quando a caixinha já basta, os aportes param (o último é só o que falta) e o objetivo chega ao valor', ult > 0 && ult < 10 && a9.slice(ult + 1).every(v => v < 0.5) && a9[ult] < 3000 - 0.5 && o9.real >= 20000 * 0.98 && o9.real < 20000 * 1.02,
    'aportes até o mês ' + ult + ' (o último de ' + Math.round(a9[ult]) + '); na data ' + Math.round(o9.real));
  ok('objetivos: o desligado fica fora da simulação e da política', (Eo.configure(P5), Eo.OBJ.length === 0) && aportes(P5, 0, 24) < 0.5 && Eo.politicaDeInvestimentos(P5, null).desligadas.length === 1);
}

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
      erro = Math.max(erro, Math.abs(i - o - v) / Math.max(1, Math.abs(i) + Math.abs(o)) * 1e6);   // centavos num milhão
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

  // casal: a liberdade começa quando o primeiro para; a renda ativa do outro continua até a idade dele e diminui o saque
  const Ec = carregar(srcCliente); Ec.configure({ tipo: 'familia', age: 35, retireAge: 57, spouseAge: 38, spouseRetireAge: 64 });
  const sc = Ec.run('desej'), ffc = sc.weeks[sc.ff.week].mi, pro = mi => { const b = sc.buckets.month.find(b => b.mi === mi && b.w1 > Ec.W0); return b ? b.f.in_prolabore || 0 : 0; };
  const fimPro = Math.round((64 - 38) * 12), salAna = mi => { const b = sc.buckets.month.find(b => b.mi === mi && b.w1 > Ec.W0); return b ? b.f.in_salario || 0 : 0; };
  ok('casal: a liberdade começa quando o primeiro para (Ana aos 57)', Math.abs(sc.ff.age - 57) < 0.1, 'aos ' + sc.ff.age.toFixed(2));
  ok('casal: o salário de quem parou some e o pró-labore do outro continua até os 64 dele', salAna(ffc + 1) === 0 && pro(ffc + 1) > 0 && pro(fimPro - 1) > 0 && pro(fimPro) === 0, 'pró-labore até o mês ' + (fimPro - 1));
  ok('casal: o saque desconta a renda de quem ainda trabalha', sc.weeks.find(w => w.mi === ffc + 1).saque < sc.weeks.find(w => w.mi === fimPro + 1).saque);
  const Ei = carregar(srcCliente); Ei.configure({ tipo: 'individual', age: 35, retireAge: 57, spouseAge: null }); const si = Ei.run('desej');
  ok('uma pessoa: a renda ativa toda para na liberdade', !si.buckets.month.some(b => b.mi > si.weeks[si.ff.week].mi && b.w1 > Ei.W0 && (b.f.in_prolabore || b.f.in_salario)));

  // data de nascimento: a idade de hoje é exata, e a idade num marco é a de verdade
  const En = carregar(srcCliente); En.configure({ nascimento: '1980-03-10', objectives: [] });
  const marcoN = Math.round((2040 - 2026) * 12 + (4 - 1) - 8);   // abr/2040, um mês depois do aniversário de 60 anos
  ok('nascimento: a idade de hoje sai da data (46 anos e meio em 19/09/2026)', Math.abs(En.CURRENT_AGE - 46.53) < 0.01, En.CURRENT_AGE.toFixed(3));
  ok('nascimento: em abr/2040 a pessoa já tem 60 anos', Math.floor(En.CURRENT_AGE + marcoN / 12) === 60);
  const pn = { nascimento: '1980-03-10', conjugeNascimento: '1982-11', tipo: 'familia', spouseAge: 1, age: 1 }; En.sincronizaIdades(pn);
  ok('nascimento: a idade do plano é calculada da data (sem o dia, o dia 1)', pn.age === 46 && pn.spouseAge === 43, pn.age + ' e ' + pn.spouseAge);
  const Ev = carregar(srcCliente); Ev.configure({ age: 48 }); ok('plano antigo, sem a data: vale a idade inteira', Ev.CURRENT_AGE === 48);

  // capítulo 1: a frase do propósito e os objetivos, com segurança e liberdade financeira sempre na lista
  const Ep = carregar(srcCliente), objsP = [{ id: 'b', name: 'Casa', months: 40, descricao: 'Sair do aluguel' }, { id: 'a', name: 'Viagem', months: 12 }];
  const lp = Ep.objetivosDoProposito({ objectives: objsP, desired: 30000 }, 260);
  ok('propósito: segurança primeiro, os objetivos pela data e a liberdade por último', lp.map(x => x.id).join() === 'seguranca,a,b,liberdade', lp.map(x => x.id).join());
  ok('propósito: a liberdade diz quando e quanto', /A partir de mai\/2048, conseguir uma renda passiva de R\$ 30\.000 por mês/.test(lp[3].descricao), lp[3].descricao);
  const lo = Ep.objetivosDoProposito({ objectives: objsP.concat({ id: 'c', name: 'Carro', months: 5 }), objetivosOrdem: ['liberdade', 'b', 'seguranca', 'a'] }, null);
  ok('propósito: vale a ordem declarada, e um objetivo novo entra antes da liberdade', lo.map(x => x.id).join() === 'c,liberdade,b,seguranca,a', lo.map(x => x.id).join());
  ok('propósito: no singular para uma pessoa, no plural para um casal, em três parágrafos', /vocês querem viver/.test(Ep.fraseDoProposito({ tipo: 'familia', spouseAge: 40 })) && /você quer viver/.test(Ep.fraseDoProposito({ tipo: 'individual' })) && /tornar estes objetivos realidade\.$/.test(Ep.fraseDoProposito({})) && Ep.fraseDoProposito({}).split('\n').length === 3);

  // capítulo 2: o diagnóstico, a família hoje e depois do planejamento
  const Ed = carregar(srcCliente), linha = (pl, id) => Ed.diagnosticoDaFamilia(pl).linhas.find(l => l.id === id);
  const fluxo = (e, sai) => ({ incomes: [{ id: 'r', frequency: 'mensal', steps: [{ from: 0, value: e }] }], expenses: [{ id: 'd', frequency: 'mensal', steps: [{ from: 0, value: sai }] }] });
  ok('diagnóstico: o orçamento sai do Fluxo de caixa (zero a zero com sobra ou falta de até 5% das entradas)',
    Ed.orcamentoDoFluxo(fluxo(10000, 9600)).estado === 'zero' && Ed.orcamentoDoFluxo(fluxo(10000, 10400)).estado === 'zero'
    && Ed.orcamentoDoFluxo(fluxo(10000, 9000)).estado === 'superavitario' && Ed.orcamentoDoFluxo(fluxo(10000, 11000)).estado === 'deficitario'
    && Ed.orcamentoDoFluxo({ incomes: [], expenses: [] }) === null);
  const resD = atual => linha({ riscos: { reserva: { natureza: 'CLT (empresa privada)', custoVida: 10000, atual } } }, 'reserva').presente;   // ideal R$ 50 mil
  ok('diagnóstico: a reserva nos quatro estados, pela mínima (40%), a aceitável (70%) e a ideal', [10000, 20000, 35000, 50000].map(resD).join() === 'abaixo,minima,aceitavel,ideal', [10000, 20000, 35000, 50000].map(resD).join());
  const objsD = { objectives: [{ id: 'a', diagnostico: { presente: 'sonho', futuro: 'caminho' } }, { id: 'b', diagnostico: { presente: 'meta', futuro: 'caminho' } }, { id: 'c' }] };
  ok('diagnóstico: os objetivos contam quantos estão definidos e quantos têm caminho', linha(objsD, 'definidos').presenteTxt === '1 de 3' && linha(objsD, 'definidos').futuroTxt === '2 de 3' && linha(objsD, 'caminho').presenteTxt === '0 de 3' && linha(objsD, 'caminho').futuroTxt === '2 de 3');
  ok('diagnóstico: sem nenhum degrau marcado, a linha fica vazia', linha({ objectives: [{ id: 'a' }] }, 'definidos').presente === null);
  ok('diagnóstico: o futuro e o presente sem conta são do consultor', linha({ diagnostico: { perfil: { presente: 'muito', futuro: 'adequado' } } }, 'perfil').presenteTxt === 'Muito desalinhado' && linha({ diagnostico: { protecao: { futuro: 90 } } }, 'protecao').futuroTxt === '90%');
  const conc = fin => Ed.concentracaoDoPatrimonio({ patrimonio: { financeiro: [{ valor: fin }], participacoes: [], bens: [{ mercado: 100 - fin }] } });
  ok('diagnóstico: o guia da concentração sugere preocupante com menos de 30% no financeiro', conc(29).sugestao === 'preocupante' && conc(30).sugestao === null && Math.abs(conc(29).pct.fin - 0.29) < 1e-9);

  const tomP = pr => linha({ diagnostico: { protecao: { futuro: pr } } }, 'protecao').futuroTom;
  ok('diagnóstico: o tom da proteção (em dia a partir de 80%, atenção a partir de 50%)', [90, 80, 79, 50, 49].map(tomP).join() === 'bom,bom,atencao,atencao,ruim');
  ok('diagnóstico: o tom dos objetivos pela fração no degrau', linha(objsD, 'definidos').presenteTom === 'atencao' && linha(objsD, 'caminho').presenteTom === 'ruim' && linha({ objectives: [{ id: 'a', diagnostico: { futuro: 'caminho' } }] }, 'caminho').futuroTom === 'bom');
  const plD = Ed.diagnosticoDaFamilia({ diagnostico: { perfil: { presente: 'adequado', futuro: 'adequado' }, liberdade: { presente: 'nao', futuro: 'sim' } } }).placar;
  ok('diagnóstico: o placar conta as linhas em dia entre as que têm valor', plD.futuro.emDia === 2 && plD.futuro.de === 2 && plD.presente.emDia === 1, JSON.stringify(plD));

  // quem é a família: a natureza do trabalho de cada pessoa, a da reserva, as instituições e as classes de ativos
  const renda = (pessoa, v) => ({ id: pessoa, kind: 'ativa', pessoa, frequency: 'mensal', steps: [{ from: 0, value: v }] });
  const casalN = { tipo: 'familia', spouseAge: 40, natureza: 'CLT (empresa privada)', conjugeNatureza: 'Empresário', incomes: [renda('titular', 8000), renda('conjuge', 12000)] };
  ok('natureza: a reserva usa a de quem tem a maior renda do trabalho', Ed.naturezaDaReserva(casalN).natureza === 'Empresário' && Ed.avaliaRiscos(casalN).itens.reserva.t === 7);
  ok('natureza: sem a natureza de quem ganha mais, vale a de quem a tem', Ed.naturezaDaReserva(Object.assign({}, casalN, { conjugeNatureza: '' })).quem === 'titular');
  ok('natureza: num plano antigo, a da reserva é a do titular', Ed.naturezaDe({ riscos: { reserva: { natureza: 'Aposentado' } } }, 'titular') === 'Aposentado');
  const famD = Ed.familiaDoPlano({ tipo: 'familia', spouseAge: 40, riscos: { dependentes: [{ nome: 'Bia', nasc: '2020-01' }] }, patrimonio: {
    financeiro: [{ nome: 'Nubank', valor: 1, titularidade: 'titular' }, { nome: 'Itaú', valor: 2 }, { nome: 'XP', valor: 3, titularidade: 'conjuge' }, { nome: 'Nubank', valor: 4, titularidade: 'titular' }],
    contas: { titular: ['Caixa', 'Nubank'], casal: ['Inter'] } } });
  const [anaD, marD] = famD.pessoas, txtI = l => l.map(x => x.nome + (x.conjunta ? '*' : '')).join();
  ok('família: cada pessoa com as instituições dela; a do casal (ou sem titularidade) nas duas, como conjunta', txtI(anaD.investe) === 'Nubank,Itaú*' && txtI(marD.investe) === 'XP,Itaú*', txtI(anaD.investe) + ' | ' + txtI(marD.investe));
  ok('família: a conta só onde a pessoa não investe, e a conjunta nas duas', txtI(anaD.conta) === 'Caixa,Inter*' && txtI(marD.conta) === 'Inter*', txtI(anaD.conta) + ' | ' + txtI(marD.conta));
  ok('família: uma pessoa só não tem nada conjunto', Ed.familiaDoPlano({ tipo: 'individual', patrimonio: { financeiro: [{ nome: 'Itaú', valor: 1 }], contas: { casal: ['Inter'] } } }).pessoas[0].conta.every(x => !x.conjunta));
  ok('família: os dependentes com a idade, e as duas pessoas do casal', famD.dependentes[0].idade === 6 && famD.pessoas.length === 2, famD.dependentes[0].idade);
  const expD = Ed.familiaDoPlano({ tipo: 'familia', spouseAge: 40, experiencia: { conjuge: { ouro: { restricao: true } } } }).classes;
  ok('família: a experiência é de cada pessoa, e sem nenhuma marca a tabela some', famD.classes === null && expD.find(c => c.id === 'ouro').pessoas.map(p => p.restricao).join() === 'false,true');

  // gestão financeira: renda, custo de vida e futuro pelo Fluxo de caixa; as horas de trabalho; o orçamento combinado
  const Eg = carregar(srcCliente), lin = (id, pessoa, v, extra) => Object.assign({ id, pessoa, kind: 'ativa', frequency: 'mensal', steps: [{ from: 0, value: v }] }, extra || {});
  const planoG = { tipo: 'familia', spouseAge: 40, horas: 160, conjugeHoras: 200, incomes: [lin('a', 'titular', 8000), lin('b', 'conjuge', 4000)],
    expenses: [{ id: 'f1', group: 'fix', label: 'Aluguel', steps: [{ from: 0, value: 5000 }] }, { id: 'a1', group: 'adj', label: 'Mercado', steps: [{ from: 0, value: 4000 }] }, { id: 'f2', group: 'fix', label: 'IPTU', frequency: 'anual', steps: [{ from: 0, value: 1200 }] }] };
  const gG = Eg.gestaoFinanceira(planoG);
  ok('gestão: renda, custo de vida e futuro no mês e no ano, pela média de 12 meses (o IPTU anual entra como R$ 100 por mês)', gG.mes.renda === 12000 && Math.round(gG.mes.custo) === 9100 && Math.round(gG.ano.futuro) === 34800, JSON.stringify(gG.mes));
  ok('gestão: as fixas são o grupo fix; o recomendado é 50/30/20 da renda', Math.round(gG.grupos.fixas) === 5100 && gG.grupos.ajustaveis === 4000 && gG.ideal.fixas === 6000 && gG.ideal.futuro === 2400);
  const cG = Eg.gestaoFinanceira(Object.assign({}, planoG, { orcamento: { combinado: { ajustaveis: { meta: '500', cortes: [{ id: 'a1', nome: 'Mercado', valor: 500, trava: 1 }, { nome: 'Restaurantes' }] } } } })).combinado;
  ok('gestão: sem orçamento combinado gravado, ele é nulo; gravado, volta com a meta e os cortes normalizados', gG.combinado === null && cG.fixas === null && cG.ajustaveis.meta === 500
    && cG.ajustaveis.cortes[0].id === 'a1' && cG.ajustaveis.cortes[0].trava === true && !('id' in cG.ajustaveis.cortes[1]) && cG.ajustaveis.cortes[1].valor === 0, JSON.stringify(cG));
  ok('gestão: as despesas da lista do orçamento têm o id do Fluxo como texto', gG.itens.fixas.every(x => typeof x.id === 'string'));
  const hG = Eg.horasDoTrabalho(planoG), [aG, bG] = hG.pessoas;
  ok('tempo: o valor da hora é a renda do trabalho pelas horas', aG.valorHora === 50 && bG.valorHora === 20 && hG.familia.valorHora === 12000 / 360);
  ok('tempo: as horas se dividem na proporção do orçamento, e o futuro é o resto', Math.abs(aG.presente - 160 * 9100 / 12000) < 1e-9 && Math.abs(aG.presente + aG.futuro - 160) < 1e-9);
  const planoRA = Object.assign({}, planoG, { rendasAtivas: [{ pessoa: 'titular', profissao: 'Analista', natureza: '', horas: 100 }, { pessoa: 'titular', profissao: 'Professora', natureza: 'Profissional liberal', horas: 60 }, { pessoa: 'conjuge', horas: 200 }] });
  ok('rendas ativas: as horas da pessoa são a soma, a natureza é a da primeira que a tem', Eg.horasDoTrabalho(planoRA).pessoas[0].horas === 160 && Eg.naturezaDe(planoRA, 'titular') === 'Profissional liberal' && Eg.familiaDoPlano(planoRA).pessoas[0].profissao === 'Analista e Professora');
  ok('tempo: sem as horas de alguém, a família soma só quem informou', Eg.horasDoTrabalho(Object.assign({}, planoG, { conjugeHoras: null })).familia === null);

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
  const atip = um({}); atip.riscos.dependentes = [{ relacao: 'filho', nasc: '2021-09-14', ate: 90 }];
  ok('dependente: a idade até quando depende pode ser informada (criança atípica até os 90)', Es.calculaSeguros(atip).deps[0].limite === 90 && Es.idadeLimiteDe({ relacao: 'filho' }) === 25 && Es.idadeLimiteDe({ relacao: 'pai' }) === 95);
  ok('cobertura parcial: atenção; nenhuma: crítico', Es.avaliaRiscos(um({ coberturaVida: 500000 })).itens.familia.status === 'atencao' && Es.avaliaRiscos(um({})).itens.familia.status === 'critico');
  ok('plano sem o cálculo de seguro: não avaliado', Es.avaliaRiscos({ riscos: {} }).itens.renda.status === 'pendente');
}

console.log('\n10. Patrimônio de hoje e fase da vida financeira');
{
  const Ef = carregar(srcCliente), P = () => JSON.parse(JSON.stringify(Ef.PATRIMONIO_EXEMPLO));
  const pl = { age: 35, retireAge: 65, riscos: { reserva: { custoVida: 10000 } }, patrimonio: P() };
  Ef.sincronizaPatrimonio(pl);
  ok('as listas viram os totais do plano', pl.initialWealth === 860000 && pl.partValue === 50000 && pl.initialBens === 1210000);
  // a carteira de hoje manda nos investimentos do financeiro: soma por instituição, titular e tipo; o digitado de
  // investimento sai, e o FGTS e o empréstimo a amigos ficam. Limpar a carteira tira só o que veio dela.
  const pc = { patrimonio: { financeiro: [{ nome: 'Nubank', valor: 5 }, { nome: 'FGTS', valor: 30000, tipo: 'fgts' }, { nome: 'Irmão', valor: 1000, tipo: 'emprestimo' }] },
    carteira: { ativos: [{ instituicao: 'XP', titular: 'conjuge', valor: 100.5 }, { instituicao: 'XP ', titular: 'conjuge', valor: 200 }, { instituicao: 'XP', titular: 'conjuge', valor: 50, tipo: 'vgbl' }, { instituicao: 'XP', titular: 'titular', valor: 10 }] } };
  Ef.sincronizaPatrimonio(pc);
  const fx = pc.patrimonio.financeiro;
  ok('carteira: financeiro por instituição, titular e tipo, mais FGTS e empréstimo', fx.length === 5 && fx[0].valor === 300.5 && fx[0].titularidade === 'conjuge' && fx[1].tipo === 'vgbl' && fx[2].titularidade === 'titular' && pc.initialWealth === 31360.5, JSON.stringify(fx));
  pc.carteira.ativos = []; Ef.sincronizaPatrimonio(pc);
  ok('limpar a carteira tira só os investimentos que vieram dela', pc.patrimonio.financeiro.length === 2 && pc.initialWealth === 31000, JSON.stringify(pc.patrimonio.financeiro));
  // macroalocação: a liquidez diária fica com o restante; a classe sem recomendada segue a ideal
  const mc = Ef.carteiraDoPlano({ carteira: { aporte: 100, ativos: [{ classe: 'alternativos', valor: 40, acao: 'manter' }, { classe: 'posFixado', valor: 860, acao: 'parcial', resgate: 300 }],
    ideal: { posFixado: 0.6, inflacao: 0.3 }, recomendada: { alternativos: 0.04 }, novos: [{ classe: 'inflacao', valor: 300 }] } });
  const cl = id => mc.classes.find(c => c.id === id);
  // a compra do objetivo: o financiamento é o preço menos a entrada, com a 1ª parcela na data; o adiantamento (em meses de
  // hoje) abate o saldo; o consórcio começa no mês marcado e o lance é o que o objetivo junta, na parcela da data
  { const of = { id: 'f', kind: 'bem', months: 10, amount: 100, preco: 1100, compra: { modo: 'financiamento', sistema: 'sac', parcelas: 10, juros: 0, iof: 'isento', amortizacoes: [{ em: 12, valor: 300 }] } };
    const cf = Ef.compraDoObjetivo(of), l = cf && cf.ct.linhas;
    ok('compra financiada: 1.000 em 10 parcelas de 100, com o adiantamento de 300 depois da 3ª', !!cf && cf.credito === 1000 && cf.mi0 === 10 && Math.abs(l[0].pay - 100) < 1e-9 && l[2].extra === 300 && Ef.parcelaDaCompra(cf, 12) === 400 && Ef.parcelaDaCompra(cf, 9) === 0, cf && JSON.stringify(l.slice(0, 4).map(x => [x.pay, x.extra])));
    const oc = { id: 'c', kind: 'bem', months: 12, amount: 200, preco: 1000, compra: { modo: 'consorcio', parcelas: 20, txAdm: 0, fundoReserva: 0, inicio: 2 } }, cc = Ef.compraDoObjetivo(oc);
    ok('compra por consórcio: as parcelas começam no mês 2 e o lance de 200 sai na parcela da data', !!cc && cc.mi0 === 2 && Math.abs(Ef.parcelaDaCompra(cc, 2) - 50) < 1e-9 && cc.ct.linhas[10].extra === 200 && Ef.parcelaDaCompra(cc, 1) === 0, cc && JSON.stringify(cc.ct.linhas.slice(9, 12).map(x => [x.pay, x.extra]))); }
  // o lance pelo percentual do grupo: 50% do saldo de 450 na contemplação (11 parcelas pagas de 50) é 225; 10% da carta (100)
  // vem embutido, e o bolso paga 125: o necessário na data é só o bolso (a carta sem o embutido compra um bem de até 900)
  { const ol = { id: 'l', kind: 'bem', months: 12, amount: 0, preco: 1000, compra: { modo: 'consorcio', parcelas: 20, txAdm: 0, fundoReserva: 0, inicio: 2, lancePct: 50, embutidoPct: 10 } }, cl = Ef.compraDoObjetivo(ol);
    ok('consórcio: o lance sai do percentual do saldo, com o embutido e o bolso', !!cl && Math.abs(cl.saldo - 450) < 1e-9 && Math.abs(cl.lance - 225) < 1e-9 && cl.embutido === 100 && Math.abs(cl.necessario - 125) < 1e-9 && cl.compra === 900 && cl.ct.linhas[10].extra === 225,
      cl && JSON.stringify([cl.saldo, cl.lance, cl.embutido, cl.bolso, cl.compra])); }
  // o crédito (a carta) acompanha o reajuste: 1.000 vira 1.100 depois da 2ª parcela; o embutido de 10% sai do crédito do mês
  // do lance (110), e sobram 990 para comprar o bem
  { const oa = { id: 'a', kind: 'bem', months: 4, amount: 0, preco: 1000, compra: { modo: 'consorcio', parcelas: 10, txAdm: 0, fundoReserva: 0, reajuste: 10, reajusteApos: 2, inicio: 0, lancePct: 50, embutidoPct: 10 } }, ca = Ef.compraDoObjetivo(oa);
    ok('consórcio: o crédito atualizado no mês do lance, menos o embutido, é o crédito para o bem', !!ca && ca.ct.linhas[1].credito === 1000 && Math.abs(ca.cartaNaData - 1100) < 1e-9 && Math.abs(ca.saldo - 550) < 1e-9 && Math.abs(ca.embutido - 110) < 1e-9 && Math.abs(ca.compra - 990) < 1e-9,
      ca && JSON.stringify([ca.cartaNaData, ca.saldo, ca.lance, ca.embutido, ca.compra])); }
  // a estratégia pelo prazo: nos 24 meses finais, a conservadora; a conta mês a mês bate com a fórmula na taxa constante
  { const t = Ef.trecho(0.005, 0, 36), cf = (Math.pow(1.005, 36) - 1) / 0.005;
    ok('taxa constante: o trecho bate com a fórmula', Math.abs(t.g - Math.pow(1.005, 36)) < 1e-9 && Math.abs(t.A - cf) < 1e-9);
    const P0 = Ef.PROFILES || { conservador: 0.004, moderado: 0.005 }, oL = { months: 46, profile: 'moderado' }, oC = { months: 20, profile: 'agressivo' }, rL = Ef.taxaDoObjetivo(oL);
    ok('objetivo a 46 meses: moderada até o mês 21, conservadora do 22 em diante', typeof rL === 'function' && rL(21) > rL(22) && Math.abs(rL(22) - Ef.taxaDoObjetivo(oC)) < 1e-12 && typeof Ef.taxaDoObjetivo(oC) === 'number');
    const fr = Ef.alocacaoDaCaixinha({}, { tipo: 'objetivo', obj: { alocacao: { posFixado: 0.4, inflacao: 0.5 } }, conservadorEm: 10, estrategia: 'moderado' }).fr;
    ok('alocação da caixinha: a liquidez fica com o restante', Math.abs(fr.liquidez - 0.1) < 1e-9 && fr.posFixado === 0.4);
    const sg = Ef.alocacaoDaCaixinha({}, { tipo: 'objetivo', obj: {}, conservadorEm: 0, estrategia: 'moderado' }).fr;
    ok('sem alocação, o objetivo nos 24 meses finais fica no pós-fixado e a reserva na liquidez', sg.posFixado === 1 && Ef.alocacaoDaCaixinha({}, { tipo: 'reserva' }).fr.liquidez === 1); }
  // a ideal nunca fica abaixo do mínimo das caixinhas: 50% de 200 do objetivo em pós-fixado, sobre 1.000, é 10%
  { const mk = Ef.carteiraDoPlano({ patrimonio: { financeiro: [{ nome: 'XP', valor: 1000 }] }, objectives: [{ id: 'a', name: 'A', months: 60, amount: 1000, dedicated: 200, profile: 'moderado', alocacao: { posFixado: 0.5 } }],
      politica: { reserva: 100 }, carteira: { ativos: [{ classe: 'liquidez', valor: 1000, acao: 'manter' }], ideal: { posFixado: 0.05, inflacao: 0.2 } } }), k = id => mk.classes.find(c => c.id === id);
    ok('macro: a ideal sobe ao mínimo das caixinhas e o que passa dele fica', Math.abs(k('posFixado').minimo - 0.1) < 1e-9 && Math.abs(k('posFixado').pIdeal - 0.1) < 1e-9 && Math.abs(k('inflacao').pIdeal - 0.2) < 1e-9 && Math.abs(k('liquidez').minimo - 0.2) < 1e-9,
      JSON.stringify(['posFixado', 'inflacao', 'liquidez'].map(id => [k(id).minimo, k(id).pIdeal]))); }
  ok('macro: liquidez com o restante, na ideal e na recomendada', Math.abs(cl('liquidez').pIdeal - 0.1) < 1e-9 && Math.abs(cl('liquidez').pRec - 0.06) < 1e-9 && cl('posFixado').segue && !cl('alternativos').segue);
  ok('micro: o que fica, os novos e o caixa', cl('posFixado').fica === 560 && cl('inflacao').resultado === 300 && mc.resgatado === 300 && mc.caixa === 100 && mc.semAcao.length === 0);
  const f = Ef.faseDaVida(pl);
  ok('total = financeiro + participações + bens − saldo devedor', f.total === 860000 + 50000 + 1210000 - 368000, f.total);
  // começou aos 23, para aos 65: marcos em 23 / 32,3 / 51 / 65; aos 35, 14% da Consolidação (18× a 60×)
  ok('marcos das fases em 2/9 e 6/9 da vida de trabalho', Math.abs(f.fases[2].de - (23 + 42 * 2 / 9)) < 1e-9 && f.fases[3].de === 51 && f.fases[4].de === 65);
  ok('aos 35: Consolidação, esperado interpolado', f.fase === 2 && f.minimo === 180000 && f.maximo === 600000 && Math.abs(f.esperado - 10000 * (18 + 42 * (35 - 23 - 28 / 3) / (28 - 28 / 3))) < 0.01, Math.round(f.esperado));
  ok('antes de começar: Preparação, esperado zero', Ef.faseDaVida(Object.assign({}, pl, { age: 20 })).esperado === 0);
  ok('depois da idade alvo: Liberdade, 200×', Ef.faseDaVida(Object.assign({}, pl, { age: 70 })).esperado === 2000000);
  ok('dívida avulsa também desconta do total', Ef.faseDaVida(Object.assign({}, pl, { patrimonio: Object.assign(P(), { dividas: [{ nome: 'Consignado', saldoDevedor: 20000 }] }) })).total === f.total - 20000);
  ok('sem a idade em que começou: sem fase', Ef.faseDaVida({ age: 35, patrimonio: {} }).fase === null);
  const fc = Ef.faseDaVida(Object.assign({}, pl, { spouseAge: 40, spouseRetireAge: 60, patrimonio: Object.assign(P(), { conjugeComecou: 20 }) }), 'conjuge');
  ok('cada pessoa tem a sua curva: o cônjuge com as idades dele', fc.comecou === 20 && fc.alvo === 60 && fc.idade === 40 && fc.fases[4].de === 60, JSON.stringify([fc.comecou, fc.alvo, fc.idade]));
  const alt = Ef.aplicaAlteracoes(Object.assign({}, pl, { patrimonio: P() }), [{ tipo: 'campo', caminho: 'patrimonio.financeiro.2.valor', para: 700000 }]);
  ok('proposta num valor do detalhe atualiza o total', alt.initialWealth === 860000 - P().financeiro[2].valor + 700000, alt.initialWealth);
  // linha reconfigurada pelo cliente: o IPTU de R$ 3.200 por ano vira R$ 260 por mês, só de jan/2027 a dez/2027
  const iptu = () => ({ expenses: [{ id: 'iptu', label: 'IPTU', group: 'fix', week: 1, frequency: 'anual', dates: [{ m: 0, d: 10 }], steps: [{ from: 4, value: 3200 }] }] });
  const ia = { tipo: 'item', lista: 'expenses', id: 'iptu', para: { frequency: 'mensal', days: [10], dates: null, steps: [{ from: 4, value: 260 }, { from: 16, value: 0 }] }, de: { frequency: 'anual', days: null, dates: [{ m: 0, d: 10 }], steps: [{ from: 4, value: 3200 }] } };
  const ip = Ef.aplicaAlteracoes(iptu(), [ia]).expenses[0];
  ok('linha reconfigurada: só os campos propostos mudam, e null apaga', ip.frequency === 'mensal' && ip.days[0] === 10 && !('dates' in ip) && ip.week === 1 && ip.label === 'IPTU' && ip.steps.length === 2);
  // faixa de meses: R$ 500 em cada mês de out/2026 a abr/2027 numa linha anual; os meses sem o IPTU também recebem
  const fa = { tipo: 'fluxo', modo: 'faixa', lista: 'expenses', id: 'iptu', mi: 1, ate: 7, para: 500 };
  const pf = Ef.aplicaAlteracoes(iptu(), [fa]).expenses[0];
  ok('faixa de meses: o valor em cada mês dela, e fora dela a linha como era', [1, 2, 3, 4, 5, 6, 7].every(m => pf.exc[m] === 500) && pf.exc[8] == null && pf.exc[0] == null && pf.steps[0].value === 3200);
  ok('faixa de meses: o valor de antes é o do primeiro mês (zero, sem o IPTU)', Ef.valorAtual(iptu(), fa) === 0 && /de out\/2026 a abr\/2027 \(7 meses\)/.test(Ef.descreveAlteracao(iptu(), fa).oque), Ef.descreveAlteracao(iptu(), fa).oque);
  // linha nova configurada no painel: comida de R$ 800 por mês, de mar/2027 (mês 6) a jul/2028 (mês 22)
  const na = { tipo: 'linha', acao: 'nova', lista: 'expenses', id: 'cli_comida', label: 'Comida', group: 'adj', mi: 6, para: 800, de: null, item: { frequency: 'mensal', steps: [{ from: 6, value: 800 }, { from: 23, value: 0 }] } };
  const pn = Ef.aplicaAlteracoes(iptu(), [na]).expenses.find(e => e.id === 'cli_comida');
  ok('linha nova com a configuração do painel: início e fim', pn && pn.group === 'adj' && pn.steps.length === 2 && pn.steps[1].from === 23 && Ef.descreveAlteracao(iptu(), na).para === 'R$ 800 por mês, a partir de mar/2027 até jul/2028', pn && Ef.descreveAlteracao(iptu(), na).para);
  const id = Ef.descreveAlteracao(iptu(), ia);
  ok('linha reconfigurada: a frase de antes e a de depois', id.de === 'R$ 3.200 em cada data do ano (10/jan), a partir de jan/2027' && id.para === 'R$ 260 por mês, no dia 10, a partir de jan/2027 até dez/2027' && !id.mudou, id.de + ' → ' + id.para);
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
    && tb({ titularidade: 'casal', titularPct: 70 }).texto === '70% de Ana e 30% de Marcos' && tb({}) === null);
  const irm = tb({ titularidade: 'casal', titularPct: 33, conjugePct: 0 });
  ok('titularidade em partes: o que falta para 100% é de outros (os irmãos)', irm.texto === '33% de Ana e 67% de outros' && Math.abs(irm.outros - 0.67) < 1e-9 && irm.conjuge === 0 && !irm.excesso
    && tb({ titularidade: 'casal', titularPct: 60, conjugePct: 60 }).excesso);
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

console.log('\n12. Bens ao longo do tempo: valorização e venda');
{
  const Eb = carregar(srcCliente);
  const ap = { nome: 'Apartamento', mercado: 950000, saldoDevedor: 368000, parcela: 4870, juros: 9.5, linha: 'parc', renda: 'alug',
    valorizacao: [{ tipo: 'taxa', pct: 2, de: 0, anos: 10 }, { tipo: 'pontual', em: 24, valor: 100000, motivo: 'reforma' }],
    venda: { em: 60, preco: null, custos: [{ nome: 'Corretagem', pct: 6 }, { nome: 'Imposto sobre o ganho', valor: 20000 }] } };
  const alug = { id: 'alug', label: 'Aluguel do apartamento', kind: 'passiva', frequency: 'mensal', days: [10], steps: [{ from: 0, value: 3000 }] };
  Eb.configure({ patrimonio: { bens: [ap, { nome: 'Terreno', mercado: 100000 }] }, initialBens: 1050000, objectives: [], passive: [],
    incomes: [{ id: 'sal', label: 'Salário', kind: 'ativa', frequency: 'mensal', days: [5], steps: [{ from: 0, value: 20000 }] },
      alug],
    expenses: [{ id: 'parc', label: 'Parcela: Apartamento', group: 'fix', frequency: 'mensal', days: [10], steps: [{ from: 0, value: 4870 }] },
      { id: 'vida', label: 'Vida', group: 'adj', frequency: 'mensal', days: [10], steps: [{ from: 0, value: 8000 }] }] });
  const tr = Eb.trajetoriaDoBem(ap), esperado = (950000 * Math.pow(1.02, 2) + 100000) * Math.pow(1.02, 3);
  ok('valor projetado: 2% ao ano mais a reforma de R$ 100 mil', Math.abs(tr.venda.projetado - esperado) < 1, Math.round(tr.venda.projetado) + ' / ' + Math.round(esperado));
  ok('custos da venda: 6% do preço e R$ 20 mil', Math.abs(tr.venda.custo - (0.06 * tr.venda.preco + 20000)) < 0.01);
  ok('saldo devedor transferido: cai com as parcelas pagas até a venda', tr.venda.quitacao > 0 && tr.venda.quitacao < 368000, 'R$ ' + Math.round(tr.venda.quitacao));
  const curto = Object.assign({}, ap, { restantes: 20 });
  ok('com 20 parcelas faltando, não há saldo a transferir numa venda daqui a 5 anos', Eb.saldoDevedorEm(curto, 60) === 0 && Eb.trajetoriaDoBem(curto).venda.quitacao === 0);
  ok('com as parcelas que faltam, o saldo cai até zero na última', Eb.saldoDevedorEm(curto, 0) === 368000 && Eb.saldoDevedorEm(curto, 10) > 0 && Eb.saldoDevedorEm(curto, 10) < 368000 && Eb.saldoDevedorEm(curto, 20) === 0);
  const s = Eb.run('perp'), mes = {};
  let erro = 0;
  s.buckets.month.forEach(b => { if (b.w1 <= Eb.W0) return; mes[b.mi] = b.f; let i = 0, o = 0, v = 0;
    for (const k in b.f) { if (k.startsWith('in_')) i += b.f[k]; else if (k.startsWith('out_')) o += b.f[k]; else if (k.startsWith('mov_')) v += b.f[k]; }
    erro = Math.max(erro, Math.abs(i - o - v)); });
  ok('com a venda, movimentações = entradas − saídas', erro < 0.01, 'erro máximo ' + erro.toFixed(6));
  ok('na venda, o preço sai dos bens e os custos e o saldo transferido são saídas', Math.abs(mes[60].mov_bens + tr.venda.preco) < 0.01 && Math.abs(mes[60].out_venda_0 - tr.venda.custo) < 0.01 && Math.abs(mes[60].out_quita_0 - tr.venda.quitacao) < 0.01);
  ok('o aluguel e a parcela do bem terminam na venda', mes[59].in_alug === 3000 && !mes[60].in_alug && mes[59].out_fix_parc === 4870 && !mes[61].out_fix_parc);
  const wv = s.events.find(e => e.type === 'venda').week, antes = s.weeks[wv - 1].bens, depois = s.weeks[wv].bens;
  ok('depois da venda sobram só os outros bens', Math.abs(depois - 100000) < 0.01 && Math.abs(antes - (100000 + s.events.find(e => e.type === 'venda').antes)) < 0.01, 'bens de R$ ' + Math.round(antes) + ' para R$ ' + Math.round(depois));
  ok('o plano não é alterado pela venda (as linhas são cortadas numa cópia)', alug.steps.length === 1 && Eb.INCOMES.find(x => x.id === 'alug').steps.length === 2);
  ok('a dívida do bem sai do patrimônio na venda', s.weeks[wv - 1].div > 0 && s.weeks[wv].div === 0);
}

console.log('\n12b. Participações ao longo do tempo e liquidez ideal');
{
  const Ep = carregar(srcCliente);
  const pap = { nome: 'Papelaria Canetinha', valor: 50000, valorizacao: [{ tipo: 'taxa', pct: 8, de: 0, anos: 30 }] };
  const bomb = { nome: 'Bombonière', valor: 100000, venda: { em: 60, preco: 200000, custos: [] } };
  const alvo = { nome: 'Startup', valor: 100000, valorizacao: [{ tipo: 'alvo', em: 60, valor: 200000 }, { tipo: 'taxa', pct: 5, de: 0, anos: 30 }] };
  const tp = Ep.trajetoriaDoBem(pap), ta = Ep.trajetoriaDoBem(alvo);
  ok('participação: 8% ao ano a partir do valor de hoje', Math.abs(tp.serie[12] - 54000) < 0.01, Math.round(tp.serie[12]));
  ok('valor esperado numa data: chega nele, num ritmo constante, e depois vale a taxa', Math.abs(ta.serie[60] - 200000) < 0.01 && Math.abs(ta.serie[30] - 100000 * Math.SQRT2) < 0.01 && Math.abs(ta.serie[72] - 210000) < 0.01);
  Ep.configure({ patrimonio: { participacoes: [pap, bomb], bens: [] }, partValue: 150000, initialBens: 0, objectives: [], passive: [],
    incomes: [{ id: 'sal', label: 'Salário', kind: 'ativa', frequency: 'mensal', days: [5], steps: [{ from: 0, value: 20000 }] }],
    expenses: [{ id: 'vida', label: 'Vida', group: 'adj', frequency: 'mensal', days: [10], steps: [{ from: 0, value: 8000 }] }] });
  const s = Ep.run('perp'), ev = s.events.find(e => e.type === 'venda' && /Bombonière/.test(e.label)), wv = ev.week;
  ok('a venda da participação leva o preço ao financeiro e tira a participação', Math.abs(s.weeks[wv - 1].part - s.weeks[wv].part - ev.antes) < 1000 && ev.antes > 195000 && s.weeks[wv].fin - s.weeks[wv - 1].fin > 190000, 'part ' + Math.round(s.weeks[wv - 1].part) + ' → ' + Math.round(s.weeks[wv].part));
  ok('a participação que valoriza cresce no simulador', s.weeks[wv].part > 50000 * 1.4);
  ok('com o preço de venda, a participação cresce até ele (sem salto na venda)', Math.abs(Ep.trajetoriaDaParticipacao(bomb).serie[30] - 100000 * Math.SQRT2) < 0.01 && Ep.trajetoriaDaParticipacao(bomb).venda.preco === 200000);
  const fL = Ep.faseDaVida({ age: 35, patrimonio: { financeiro: [{ valor: 400000 }], bens: [{ mercado: 1200000 }], participacoes: [{ valor: 50000 }], liquidezIdealPct: 40 } });
  ok('liquidez ideal: o % do patrimônio total', fL.liquidezIdeal === 660000 && fL.total === 1650000);
  ok('liquidez ideal: num plano antigo, o valor em reais', Ep.faseDaVida({ age: 35, patrimonio: { liquidezIdeal: 300000 } }).liquidezIdeal === 300000);
}

console.log('\n12c. Objetivo financiado pela venda de um bem');
{
  const Ev = carregar(srcCliente);
  const sp = { nome: 'Apartamento SP', mercado: 1200000, venda: { em: 36, custos: [{ nome: 'Corretagem', pct: 6 }], objetivo: 'sjc' } };
  const sjc = { id: 'sjc', name: 'Apartamento SJC', kind: 'bem', months: 36, amount: 700000, dedicated: 0, planned: 0, profile: 'moderado', costs: [] };
  const plano = v => ({ patrimonio: { bens: [Object.assign({}, sp, { venda: Object.assign({}, sp.venda, v) })] }, initialBens: 1200000, initialWealth: 100000, passive: [],
    objectives: [Object.assign({}, sjc)],
    incomes: [{ id: 'sal', label: 'Salário', kind: 'ativa', frequency: 'mensal', days: [5], steps: [{ from: 0, value: 20000 }] }],
    expenses: [{ id: 'vida', label: 'Vida', group: 'adj', frequency: 'mensal', days: [10], steps: [{ from: 0, value: 15000 }] }] });
  Ev.configure(plano({}));
  const o = Ev.OBJ[0], liq = Ev.trajetoriaDoBem(sp).venda.liquido, vs = Ev.vendasDoObjetivo(o);
  ok('a venda aparece no objetivo, com todo o líquido', vs.length === 1 && Math.abs(vs[0].usado - liq) < 0.01 && !vs[0].depois, 'R$ ' + Math.round(liq));
  ok('com a venda cobrindo o valor, o aporte necessário é zero', o.required === 0);
  const s = Ev.run('desej'); let erro = 0;
  s.buckets.month.forEach(b => { if (b.w1 <= Ev.W0) return; let i = 0, x = 0, v = 0;
    for (const k in b.f) { if (k.startsWith('in_')) i += b.f[k]; else if (k.startsWith('out_')) x += b.f[k]; else if (k.startsWith('mov_')) v += b.f[k]; }
    erro = Math.max(erro, Math.abs(i - x - v)); });
  ok('com a venda no objetivo, movimentações = entradas − saídas', erro < 0.01, 'erro máximo ' + erro.toFixed(6));
  ok('venda e compra no mesmo mês: o objetivo é realizado e comprado', o.status === 'ok' && !o.naoComprado && Math.abs(o.real - liq) < 1, 'juntou R$ ' + Math.round(o.real));
  const ev = s.events.find(e => e.type === 'venda');
  ok('o marco da venda diz para onde vai o dinheiro', /Apartamento SJC/.test(ev.detail), ev.detail);
  Ev.configure(plano({ paraObjetivo: 500000 }));
  ok('só parte do líquido: o resto vai para o financeiro e o objetivo pede aporte', Ev.vendasDoObjetivo(Ev.OBJ[0])[0].usado === 500000 && Ev.OBJ[0].required > 0 && /mercado financeiro/.test(Ev.run('desej').events.find(e => e.type === 'venda').detail));
  Ev.configure(plano({ em: 40 }));
  ok('venda depois da data não financia o objetivo', Ev.vendasDoObjetivo(Ev.OBJ[0])[0].depois && Ev.OBJ[0].required > 0);
  // uma venda para dois objetivos: o primeiro leva o valor informado, o segundo o que sobra; juntos, nunca passam do líquido
  const viagem = { id: 'viagem', name: 'Viagem', kind: 'consumo', months: 40, amount: 300000, dedicated: 0, planned: 0, profile: 'moderado', costs: [] };
  const dois = destinos => { const p = plano({}); delete p.patrimonio.bens[0].venda.objetivo; p.patrimonio.bens[0].venda.destinos = destinos; p.objectives.push(Object.assign({}, viagem)); return p; };
  const pD = dois([{ objetivo: 'sjc', valor: 800000 }, { objetivo: 'viagem', valor: null }]); Ev.configure(pD);
  const uS = Ev.vendasDoObjetivo(Ev.OBJ[0])[0].usado, uV = Ev.vendasDoObjetivo(Ev.OBJ[1])[0].usado;
  ok('dividida entre dois objetivos: cada um recebe a sua parte', uS === 800000 && Math.abs(uV - (liq - 800000)) < 0.01, 'R$ ' + Math.round(uS) + ' + R$ ' + Math.round(uV));
  const evD = Ev.run('desej').events.find(e => e.type === 'venda');
  ok('cada objetivo junta a sua parte, e o marco diz as duas', Math.abs(Ev.OBJ[0].real - 800000) < 1 && Ev.OBJ[1].real >= liq - 800000 - 1 && /Apartamento SJC/.test(evD.detail) && /Viagem/.test(evD.detail), evD.detail);
  Ev.configure(dois([{ objetivo: 'sjc', valor: 800000 }, { objetivo: 'viagem', valor: 900000 }]));
  ok('o segundo destino não passa do que sobra do líquido', Math.abs(Ev.vendasDoObjetivo(Ev.OBJ[1])[0].usado - (liq - 800000)) < 0.01);
  const antigo = plano({ paraObjetivo: 500000 }); Ev.configure(antigo);
  ok('plano antigo (venda.objetivo) vira a lista de destinos', !('objetivo' in antigo.patrimonio.bens[0].venda) && antigo.patrimonio.bens[0].venda.destinos[0].valor === 500000);
}

console.log('\n12d. A realização de cada objetivo: orçado e cortes (e o acompanhamento guardado em reaproveitar/)');
{
  const Eo = carregar(srcCliente), s = Eo.run('desej'), o = Eo.OBJ.find(x => x.id === 'casa'), M = Eo.orcadoDoObjetivo(o, s);
  ok('o orçado vai de hoje até a data do objetivo, mês a mês', M.length === o.months + 1 && M[0].mes === Eo.mesISO(0) && M[M.length - 1].mes === Eo.mesISO(o.months));
  ok('o reservado hoje entra de uma vez, não como aporte', M[0].extra === o.dedicated && M[0].aporte <= o.planned + 0.01);
  ok('no mês da data, o saldo é o que o objetivo juntou', Math.abs(M[M.length - 1].saldo - o.real) < 0.01);
  const aportes = M.reduce((a, m) => a + m.aporte, 0), mov = s.weeks.slice(Eo.W0).reduce((a, w) => a + Math.max(0, w.f['mov_obj_casa'] || 0), 0);
  ok('aportes mais o que entrou de uma vez = o que foi para o objetivo na simulação', Math.abs(aportes + o.dedicated - mov) < 0.01);
  const C = Eo.cortesDoObjetivo(o, s);
  ok('três cortes antes da data e a própria data', C.length === 4 && C[3].data && C[0].mi < C[1].mi && C[1].mi < C[2].mi && C[2].mi < o.months, C.map(c => c.mes).join(', '));
  ok('o saldo esperado cresce até a data', C.every((c, i) => !i || c.saldo > C[i - 1].saldo));
  // acompanhamento (fora das telas, guardado em reaproveitar/acompanhamento.js): a foto de hoje e 24 meses de realizado,
  // com 4 aportes cobertos por outro objetivo e 2 que faltaram
  const Ac = require('./reaproveitar/acompanhamento.js');
  o.foto = Ac.fotoDoObjetivo(o, Eo.orcadoDoObjetivo(o, s), '2026-09-19');
  o.realizado = o.foto.meses.slice(0, 24).map((m, i) => i % 6 === 5 ? { mes: m.mes, aporte: 0, deOutro: [{ objetivo: 'europa', valor: m.aporte }] }
    : i === 10 || i === 14 ? { mes: m.mes, aporte: m.aporte / 2 } : { mes: m.mes, aporte: m.aporte });
  o.realizado[23].saldo = o.foto.meses[23].saldo - 5000;
  const A = Ac.acompanhamentoDoObjetivo(o);
  ok('de 24 oportunidades de aporte (o aporte é fixo, inclusive nos meses do IPTU): 18 cumpridos, 4 cobertos por outro objetivo, 2 faltaram', A.oportunidades === 24 && A.cumpridos === 18 && A.cobertos === 4 && A.faltaram === 2, A.oportunidades + ': ' + A.cumpridos + '/' + A.cobertos + '/' + A.faltaram);
  ok('o saldo do extrato comparado com o orçado no mesmo mês', A.saldo && A.saldo.mes === o.foto.meses[23].mes && Math.abs(A.saldo.diferenca + 5000) < 0.01);
  o.amount = 999999; Eo.derive(o);
  ok('a foto não muda quando o plano muda', o.foto.valor === 180000 && Ac.acompanhamentoDoObjetivo(o).foto.meses.length === 47);
  ok('sem foto, não há acompanhamento', Ac.acompanhamentoDoObjetivo({ id: 'x' }) === null);
}

console.log('\n12e. Política de investimentos: patrimônio e sobra por caixinha, compromissos');
{
  const Ep = carregar(srcCliente), H = Ep.horizonteDe;
  ok('horizontes: abaixo de 6, de 6 a 24, de 24 a 60, de 60 a 120 e mais de 120 meses', [5, 6, 23, 24, 59, 60, 120, 121].map(m => H(m).id).join() === 'curtissimo,curto,curto,medio,medio,longo,longo,longuissimo');
  const base = () => ({ initialWealth: 0, initialBens: 0, passive: [], patrimonio: { financeiro: [{ nome: 'Banco', valor: 500000 }, { nome: 'FGTS', valor: 100000, tipo: 'fgts' }], bens: [], participacoes: [], dividas: [] },
    riscos: { reserva: { alvo: 60000 } },
    objectives: [{ id: 'casa', name: 'Casa', kind: 'bem', months: 48, amount: 300000, dedicated: 150000, planned: 2000, profile: 'moderado', costs: [] },
      { id: 'viagem', name: 'Viagem', kind: 'consumo', months: 18, amount: 40000, dedicated: 10000, planned: 1000, profile: 'conservador', costs: [] }],
    compromissos: [{ id: 'reforma', titulo: 'Reforma', em: 6, valor: 30000 }],
    incomes: [{ id: 'sal', label: 'Salário', kind: 'ativa', frequency: 'mensal', days: [5], steps: [{ from: 0, value: 20000 }] }],
    expenses: [{ id: 'vida', label: 'Vida', group: 'adj', frequency: 'mensal', days: [10], steps: [{ from: 0, value: 14000 }] }] });
  const pl = base(); Ep.configure(pl); const Pz = Ep.politicaDeInvestimentos(pl), c = id => Pz.caixinhas.find(x => x.id === id);
  ok('o patrimônio das caixinhas soma o financeiro de hoje (com o FGTS)', Pz.total === 600000 && Math.abs(Pz.caixinhas.reduce((a, x) => a + x.patrimonio, 0) - 600000) < 0.01);
  ok('compromissos, reserva (o alvo da Gestão de riscos) e objetivos; a liberdade fica com o restante', c('compromissos').patrimonio === 30000 && c('reserva').patrimonio === 60000 && c('casa').patrimonio === 150000 && c('liberdade').patrimonio === 600000 - 30000 - 60000 - 160000);
  ok('a sobra do mês vai para os aportes (pela média dos 24 meses: a viagem recebe em 18) e o resto para a liberdade', Math.abs(Pz.sobra - 6000) < 0.01 && Math.abs(c('liberdade').mensal - 3250) < 0.01, Math.round(c('liberdade').mensal));
  ok('o FGTS fica na liberdade (sem liquidez)', c('liberdade').semLiquidez === 100000 && Pz.excessoLiquido === 0);
  pl.objectives[0].dedicated = 480000; const Px = Ep.politicaDeInvestimentos(pl);
  ok('passar do patrimônio com liquidez é apontado', Px.excessoLiquido > 0 && Px.caixinhas.find(x => x.id === 'liberdade').patrimonio >= 0, 'excesso R$ ' + Math.round(Px.excessoLiquido));
  ok('a reserva vazia é a ideal até onde o patrimônio com liquidez dá', Math.abs(Px.caixinhas.find(x => x.id === 'reserva').patrimonio - 0) < 0.01);
  const pr = base(); pr.politica = { reserva: 463900 }; const Pr = Ep.politicaDeInvestimentos(pr);
  ok('a reserva definida também nunca passa do patrimônio com liquidez livre', Pr.caixinhas.find(x => x.id === 'reserva').patrimonio === 600000 - 100000 - 30000 - 160000, 'reserva R$ ' + Math.round(Pr.caixinhas.find(x => x.id === 'reserva').patrimonio));
  // o compromisso sai do patrimônio financeiro no mês marcado
  const comC = base(); Ep.configure(comC); const s1 = Ep.run('desej'), ev = s1.events.find(e => /Compromisso: Reforma/.test(e.label));
  const semC = base(); semC.compromissos = []; Ep.configure(semC); const s0 = Ep.run('desej');
  ok('o compromisso aparece na linha do tempo, no mês marcado', ev && s1.weeks[ev.week].mi === 6);
  ok('e o patrimônio financeiro cai o valor dele', ev && Math.abs((s0.weeks[ev.week].fin - s1.weeks[ev.week].fin) - 30000) < 50, ev ? 'diferença R$ ' + Math.round(s0.weeks[ev.week].fin - s1.weeks[ev.week].fin) : '');
  let erro = 0; s1.buckets.month.forEach(b => { if (b.w1 <= Ep.W0) return; let i = 0, x = 0, v = 0;
    for (const k in b.f) { if (k.startsWith('in_')) i += b.f[k]; else if (k.startsWith('out_')) x += b.f[k]; else if (k.startsWith('mov_')) v += b.f[k]; }
    erro = Math.max(erro, Math.abs(i - x - v)); });
  ok('com o compromisso, movimentações = entradas − saídas', erro < 0.01, 'erro máximo ' + erro.toFixed(6));
}

console.log('\n13. Dívidas: contrato, CET e saldo ao longo do tempo');
{
  const Ed = carregar(srcCliente);
  // consignado do caso real: R$ 254.355 liberados, 120 parcelas de R$ 5.512, a 1ª em out/2024 (23 pagas até set/2026)
  const bb = { nome: 'Consignado', saldoDevedor: 238000, credito: 254355, parcelas: 120, juros: 26.36, parcela: 5512, inicio: '2024-10', iof: 'isento' };
  const c = Ed.contratoDaDivida(bb);
  ok('pela data da 1ª parcela, faltam 97 parcelas', c.restantes === 97 && Ed.restantesDaDivida(bb) === 97);
  ok('a taxa sai da parcela que o banco cobra (1,95% ao mês)', Math.abs(c.parcelaHoje - 5512) < 0.01 && Math.abs(c.i - 0.01955) < 0.0001, (c.i * 100).toFixed(3) + '%');
  ok('sem IOF nem seguro, o CET é a própria taxa', Math.abs(c.cet.mes - c.i) < 1e-6);
  ok('o saldo do contrato hoje bate com o do extrato (diferença < 0,5%)', Math.abs(c.saldoHoje / 238000 - 1) < 0.005, 'R$ ' + Math.round(c.saldoHoje));
  ok('o saldo informado vale hoje e chega a zero depois da última parcela', Ed.saldoDevedorEm(bb, 0) === 238000 && Ed.saldoDevedorEm(bb, 96) > 0 && Ed.saldoDevedorEm(bb, 97) === 0);
  // IOF de pessoa física sobre R$ 100 mil em 60 parcelas, a 2% ao mês: 0,38% mais 0,0082% ao dia sobre cada amortização
  const novo = { saldoDevedor: 100000, credito: 100000, parcelas: 60, juros: (Math.pow(1.02, 12) - 1) * 100, inicio: '2026-09' };
  const n1 = Ed.contratoDaDivida(Object.assign({}, novo, { iof: 'avista' })), n2 = Ed.contratoDaDivida(novo);
  ok('IOF à vista entre 0,38% e 3,38% do crédito', n1.iof > 380 && n1.iof < 3380 && n1.financiado === 100000, 'R$ ' + Math.round(n1.iof));
  ok('IOF financiado: incide sobre ele mesmo e entra no valor financiado', Math.abs(n2.financiado - 100000 - n2.iof) < 0.01 && n2.iof > n1.iof);
  ok('IOF e seguro encarecem o CET acima da taxa', n1.cet.mes > n1.i && n2.cet.mes > n2.i);
  const sm = Ed.contratoDaDivida(Object.assign({}, novo, { iof: 'isento', seguro: { modo: 'mensal', pct: 0.1 } }));
  ok('seguro mensal: 0,1% do saldo devedor em cada parcela', Math.abs(sm.linhas[0].seguro - 100) < 1e-6 && Math.abs(sm.linhas[1].seguro - sm.linhas[0].saldo * 0.001) < 1e-6);
  const sac = Ed.contratoDaDivida(Object.assign({}, novo, { iof: 'isento', sistema: 'sac' }));
  ok('SAC: amortização fixa e parcela que cai', Math.abs(sac.linhas[0].amort - 100000 / 60) < 1e-6 && sac.linhas[59].pay < sac.linhas[0].pay);
  const am = Ed.contratoDaDivida(Object.assign({}, novo, { iof: 'isento', juros: 2, jurosPeriodo: 'mes' }));
  ok('juros informados ao mês: 2% ao mês valem 26,82% ao ano', Math.abs(am.i - 0.02) < 1e-12 && Math.abs(am.jurosInformado - (Math.pow(1.02, 12) - 1)) < 1e-12);
  // adiantamentos: R$ 40 mil daqui a 3 meses e R$ 12 mil daqui a 6
  const base = Object.assign({}, bb, { iof: 'isento' }), adi = m => Object.assign({}, base, { amortizacoes: [{ em: 3, valor: 40000, modo: m }, { em: 6, valor: 12000, modo: m }] });
  const sem = Ed.contratoDaDivida(base), pz = Ed.contratoDaDivida(adi('prazo')), pc = Ed.contratoDaDivida(adi('parcela'));
  ok('adiantamento: o saldo do mês cai o valor adiantado (a parcela do mês 3 é a de índice k0+2)', Math.abs((pz.linhas[sem.k0 + 2].saldo) - (sem.linhas[sem.k0 + 2].saldo - 40000)) < 0.01);
  ok('reduzir o prazo: a parcela continua e a dívida acaba antes', pz.restantes < sem.restantes && Math.abs(pz.linhas[sem.k0 + 10].pay - 5512) < 0.01 && Ed.restantesDaDivida(adi('prazo')) === pz.restantes, pz.restantes + ' parcelas em vez de ' + sem.restantes);
  ok('reduzir a parcela: o prazo continua e a parcela cai', pc.restantes === sem.restantes && pc.linhas[sem.k0 + 10].pay < 5512 - 100, 'R$ ' + Math.round(pc.linhas[sem.k0 + 10].pay));
  ok('adiantar economiza juros; reduzir o prazo economiza mais', pz.falta.juros < pc.falta.juros && pc.falta.juros < sem.falta.juros && pz.semExtras && Math.abs(pz.semExtras.falta.juros - sem.falta.juros) < 0.01);
  ok('o CET é o do contrato, com ou sem adiantamento', Math.abs(pz.cet.mes - sem.cet.mes) < 1e-12);
  ok('com o adiantamento, o saldo no patrimônio chega a zero antes', Ed.saldoDevedorEm(adi('prazo'), pz.restantes) === 0 && Ed.saldoDevedorEm(base, pz.restantes) > 0);
  // na trajetória: o patrimônio de hoje desconta o saldo, e a dívida some depois da última parcela
  Ed.configure({ patrimonio: { financeiro: [{ nome: 'Banco', valor: 300000 }], bens: [], dividas: [bb] }, initialWealth: 300000, initialBens: 0, objectives: [], passive: [],
    incomes: [{ id: 'sal', label: 'Salário', kind: 'ativa', frequency: 'mensal', days: [5], steps: [{ from: 0, value: 20000 }] }],
    expenses: [{ id: 'parc', label: 'Parcela: Consignado', group: 'fix', frequency: 'mensal', days: [10], steps: [{ from: 0, value: 5512 }, { from: 97, value: 0 }] }] });
  const s = Ed.run('perp'), w0 = s.weeks[Ed.W0], fim = s.weeks.find(w => w.mi === 97);
  ok('hoje a dívida é a do extrato', w0.div === 238000);
  ok('depois da última parcela, nada a dever', fim && fim.div === 0 && s.weeks.find(w => w.mi === 96).div > 0);
  ok('a quitação aparece na linha do tempo', s.events.some(e => e.type === 'note' && e.label === 'Dívida quitada: Consignado'));
}

console.log('\nO 13º segue o salário');
{
  const Es = carregar(srcCliente);
  const sal = { id: 'sal', label: 'Salário', kind: 'ativa', origin: 'Salário', frequency: 'mensal', days: [5], steps: [{ from: 0, value: 10000 }, { from: 12, value: 12000 }] };
  const dec = { id: 'dec', label: '13º salário', kind: 'ativa', origin: '13º salário', de: 'sal', segue: 'sal', frequency: 'anual', dates: [{ m: 11, d: 20 }], steps: [{ from: 0, value: 1 }] };
  Es.configure({ patrimonio: { financeiro: [{ nome: 'Banco', valor: 100000 }], bens: [], dividas: [] }, initialWealth: 100000, initialBens: 0, objectives: [], passive: [], incomes: [sal, dec], expenses: [] });
  ok('o 13º vale o líquido do salário de cada mês', Es.stepAt(dec, 0) === 10000 && Es.stepAt(dec, 20) === 12000, Es.stepAt(dec, 0) + ' / ' + Es.stepAt(dec, 20));
  ok('no orçamento, o 13º pesa um doze avos do salário por mês', Math.abs(Es.mensalizado(dec, 0) - 10000 / 12) < 0.01);
  const dez = Array.from({ length: 12 }, (_, mm) => mm).filter(mm => Es.valorEm(dec, mm) > 0);
  ok('o 13º cai uma vez por ano, em dezembro', dez.length === 1 && Es.valorEm(dec, dez[0]) === 10000, 'mês ' + dez.join(','));
  dec.dates = [{ m: 10, d: 30 }, { m: 11, d: 20 }];
  const nd = Array.from({ length: 12 }, (_, mm) => mm).filter(mm => Es.valorEm(dec, mm) > 0);
  ok('em duas parcelas, metade em novembro e metade em dezembro', nd.length === 2 && nd.every(mm => Es.valorEm(dec, mm) === 5000), 'meses ' + nd.join(','));
  ok('em duas parcelas, o orçamento continua com um doze avos', Math.abs(Es.mensalizado(dec, 0) - 10000 / 12) < 0.01);
}

console.log('\nA ordem das linhas do fluxo');
{
  const Ef = carregar(srcCliente), sf = Ef.run('perp'), fr = Ef.frequenciaDasLinhas(sf);
  ok('o salário (todo mês) aparece em mais meses que o bônus anual', fr.in_salario > fr.in_bonus && fr.in_bonus > 0, 'salário ' + fr.in_salario + ', bônus ' + fr.in_bonus);
  ok('a mesma simulação devolve a mesma contagem, sem refazer a conta', Ef.frequenciaDasLinhas(sf) === fr);
}

console.log('\nQuando o dinheiro acaba');
{
  const Er = carregar(srcCliente);
  const base = { patrimonio: { financeiro: [{ nome: 'Banco', valor: 20000 }], bens: [], dividas: [] }, initialWealth: 20000, initialBens: 0, objectives: [], passive: [],
    incomes: [{ id: 'sal', label: 'Salário', kind: 'ativa', origin: 'Salário', frequency: 'mensal', days: [5], steps: [{ from: 0, value: 10000 }] }] };
  Er.configure(Object.assign({}, base, { expenses: [{ id: 'x', label: 'Tudo', group: 'fix', week: 1, frequency: 'mensal', steps: [{ from: 0, value: 15000 }] }] }));
  const s = Er.run('desej'), ru = s.ruina;
  ok('com 5 mil de falta por mês, 20 mil acabam no quinto mês', ru && ru.mi >= 3 && ru.mi <= 5, ru ? 'mês ' + ru.mi : 'sem ruína');
  const w8 = s.weeks[ru.week + 8];
  ok('depois da ruína o que falta vira dívida: o financeiro fica negativo', ru && w8.fin < 0 && Math.abs(w8.cheque + w8.fin) < 0.01, ru && Math.round(w8.fin));
  ok('em 12 meses, a dívida passa da soma do que faltou (os juros de 4% ao mês)', ru && ru.cheque12 > 12 * 5000, ru && Math.round(ru.cheque12));
  // os juros do mês saem do que ficou em aberto no fim do mês anterior: 4%
  const mj = s.buckets.month.find(b => b.mi === ru.mi + 6), jm = mj.f.out_juros / s.weeks[mj.w0 - 1].cheque;
  ok('os juros da dívida são de 4% ao mês sobre o aberto no fim do mês (plano.jurosDivida vazio)', Math.abs(jm - 0.04) < 1e-9, (jm * 100).toFixed(2) + '%');
  // o que falta só dentro do mês (as contas antes do salário) e é coberto no mesmo mês não paga juros nem é ruína
  Er.configure(Object.assign({}, base, { initialWealth: 1000, patrimonio: { financeiro: [{ nome: 'Banco', valor: 1000 }], bens: [], dividas: [] },
    incomes: [{ id: 'sal', label: 'Salário', kind: 'ativa', origin: 'Salário', frequency: 'mensal', days: [21], steps: [{ from: 0, value: 10000 }] }],
    expenses: [{ id: 'x', label: 'Tudo', group: 'fix', frequency: 'mensal', days: [8], steps: [{ from: 0, value: 2000 }] },
      { id: 'a', label: 'Conta anual', group: 'fix', frequency: 'anual', days: [8], dates: [{ m: 0, d: 8 }], steps: [{ from: 0, value: 40000 }] }] }));   // em janeiro a conta do dia 8 passa do saldo; o salário do dia 21 cobre
  const sd = Er.run('desej'), doisAnos = w => w.mi >= 0 && w.mi < 24, negDentro = sd.weeks.some((w, i) => i >= Er.W0 && doisAnos(w) && w.fin < -0.5);
  ok('a falta coberta no mesmo mês não paga juros nem é ruína', negDentro && !(sd.ruina && sd.ruina.mi < 24) && !sd.buckets.month.some(b => doisAnos(b) && b.f.out_juros > 0));
  // com a idade de parar marcada, a família para nela mesmo devendo (sem rendas para contratar); sem a idade, não para
  const alvo = Er.idadeDaLiberdade();
  ok('sem dinheiro, a liberdade só acontece na idade marcada para parar, e sem contratar rendas', alvo != null ? s.ff && Math.abs(s.ff.age - alvo) < 0.2 && !(s.ff.cost > 0) : !s.ff, s.ff ? 'aos ' + s.ff.age.toFixed(1) + ' (marcada: ' + alvo + ')' : 'não acontece');
  const fim = s.weeks[Er.NW - 1];
  const quaseFim = s.weeks[Er.NW - 3];
  // o teto: 100 vezes a renda mensal (10 mil): a dívida chega a 1 milhão e fica travada, e a conta continua fechando
  let maiorDivida = 0, erroTeto = 0; s.weeks.forEach((w, i) => { if (i + 1 < Er.NW && s.weeks[i + 1].mi !== w.mi) maiorDivida = Math.max(maiorDivida, w.cheque); });   // no fim de cada mês
  s.buckets.month.forEach(b => { if (b.w1 <= Er.W0) return; let i = 0, o = 0, v = 0; for (const k in b.f) { if (k.startsWith('in_')) i += b.f[k]; else if (k.startsWith('out_')) o += b.f[k]; else if (k.startsWith('mov_')) v += b.f[k]; } erroTeto = Math.max(erroTeto, Math.abs(i - o - v)); });
  ok('a dívida para no teto de 100 vezes a renda mensal (1 milhão), no fim de cada mês, e entradas − saídas = movimentações', s.tetoDivida === 1000000 && s.tetoEm != null && Math.abs(maiorDivida - 1000000) < 0.01 && Math.abs(fim.cheque - 1000000) < 1 && erroTeto < 0.01, Math.round(maiorDivida) + ', erro ' + erroTeto.toFixed(4));
  ok('o plano segue depois da ruína: a dívida continua crescendo até o teto', fim.cheque > s.weeks[ru.week + 60].cheque && Object.keys(quaseFim.f).length > 0);
  Er.configure(Object.assign({}, base, { jurosDivida: 1, expenses: [{ id: 'x', label: 'Tudo', group: 'fix', week: 1, frequency: 'mensal', steps: [{ from: 0, value: 15000 }] }] }));
  const s1 = Er.run('desej');
  ok('o consultor reduz os juros da dívida: a 1% ao mês, ela cresce menos', s1.ruina && s1.ruina.cheque12 < ru.cheque12 && s1.ruina.cheque12 > 12 * 5000, s1.ruina && Math.round(s1.ruina.cheque12));
  Er.configure(Object.assign({}, base, { expenses: [{ id: 'x', label: 'Tudo', group: 'fix', week: 1, frequency: 'mensal', steps: [{ from: 0, value: 8000 }] }] }));
  ok('com sobra todo mês, não há ruína', !Er.run('desej').ruina);

  // o crédito novo: 100 mil no mês 4, em 24 parcelas a 2% ao mês, e a parcela numa despesa que começa no mês 5
  const cred = { id: 'c1', nome: 'Empréstimo', em: 4, valor: 100000, parcelas: 24, juros: 2, sistema: '' };
  const ct = Er.contratoDoCredito(cred);
  ok('o crédito: parcela Price de 100 mil em 24 vezes a 2% ao mês', ct && Math.abs(ct.parcela - 5287.11) < 0.05, ct && ct.parcela.toFixed(2));
  ok('o saldo do crédito: o valor no mês em, zero depois da última', Er.saldoDoCredito(cred, 3) === 0 && Er.saldoDoCredito(cred, 4) === 100000 && Er.saldoDoCredito(cred, 28) < 0.01 && Er.saldoDoCredito(cred, 40) === 0 && Er.saldoDoCredito(cred, 16) > 0);
  const parcela = { id: 'p1', label: 'Parcela: Empréstimo', group: 'fix', frequency: 'mensal', days: [10], steps: [{ from: 5, value: ct.parcela }, { from: 29, value: 0 }] };
  Er.configure(Object.assign({}, base, { creditos: [cred], expenses: [{ id: 'x', label: 'Tudo', group: 'fix', week: 1, frequency: 'mensal', steps: [{ from: 0, value: 15000 }] }, parcela] }));
  const sc = Er.run('desej'), wC = sc.weeks.find(w => w.mi === 4);
  ok('no mês do crédito o dinheiro entra no financeiro e a dívida cresce junto', sc.events.some(e => e.credito === 100000) && wC.div >= 100000 - 0.5);
  ok('o crédito é uma entrada de caixa do mês', Math.abs((sc.buckets.month.find(b => b.mi === 4).f.in_credito_c1 || 0) - 100000) < 0.5);
  ok('o crédito adia a ruína, mas com a parcela as contas continuam sem fechar', sc.ruina && sc.ruina.mi > ru.mi, sc.ruina && 'mês ' + sc.ruina.mi);
  // o crédito depois da ruína: o dinheiro paga a dívida e o financeiro volta a ficar positivo
  const tarde = Object.assign({}, cred, { em: ru.mi + 6, valor: 300000 }), ctT = Er.contratoDoCredito(tarde);
  Er.configure(Object.assign({}, base, { creditos: [tarde], expenses: [{ id: 'x', label: 'Tudo', group: 'fix', week: 1, frequency: 'mensal', steps: [{ from: 0, value: 15000 }] }] }));
  const st = Er.run('desej'), antes = st.weeks.find(w => w.mi === ru.mi + 5), depois = st.weeks.find(w => w.mi === ru.mi + 7);
  ok('crédito depois da ruína: o financeiro volta a ficar positivo', antes.fin < 0 && depois.fin > 0, Math.round(antes.fin) + ' → ' + Math.round(depois.fin));
}

console.log('\nGuardar toda a sobra num objetivo');
{
  const Es = carregar(srcCliente);
  // sobra de 4 mil por mês até o mês 30 e de 1 mil depois; o objetivo de 300 mil em 60 meses leva a sobra de cada mês, não um valor fixo
  const plano = { patrimonio: { financeiro: [{ nome: 'Banco', valor: 1000 }], bens: [], dividas: [] }, initialWealth: 1000, initialBens: 0, passive: [],
    incomes: [{ id: 'sal', label: 'Salário', kind: 'ativa', origin: 'Salário', frequency: 'mensal', days: [5], steps: [{ from: 0, value: 10000 }] }],
    expenses: [{ id: 'x', label: 'Tudo', group: 'fix', frequency: 'mensal', days: [6], steps: [{ from: 0, value: 6000 }, { from: 30, value: 9000 }] }],
    objectives: [{ id: 'g', name: 'Grande', kind: 'consumo', months: 60, amount: 300000, dedicated: 0, planned: 100, aporteSobra: true, profile: 'conservador', costs: [] }] };
  Es.configure(plano); const s = Es.run('desej'), ap = mi => (s.buckets.month.find(b => b.mi === mi).f.mov_obj_g || 0);
  ok('com toda a sobra, o aporte acompanha o que sobra em cada mês (4 mil, depois 1 mil), não o valor digitado', Math.abs(ap(10) - 4000) < 50 && Math.abs(ap(40) - 1000) < 50, Math.round(ap(10)) + ' e ' + Math.round(ap(40)));
}

console.log('\nA dívida da construtora e a venda que não acontece');
{
  const Ec = carregar(srcCliente);
  // a dívida sem contrato, sem parcela fixa e sem juros: o saldo cai na proporção do que as linhas pagam
  const eccel = { nome: 'Construtora', saldoDevedor: 120000, restantes: 30, parcela: 0, juros: 0, linha: 'jan', outrasLinhas: ['jul'] };
  const linhas = [{ id: 'jan', label: 'Construtora jan', group: 'fix', frequency: 'anual', days: [25], dates: [{ m: 0, d: 25 }], steps: [{ from: 4, value: 40000 }, { from: 17, value: 0 }] },
    { id: 'jul', label: 'Construtora jul', group: 'fix', frequency: 'anual', days: [25], dates: [{ m: 6, d: 25 }], steps: [{ from: 10, value: 20000 }, { from: 23, value: 0 }] }];
  Ec.configure({ patrimonio: { financeiro: [{ nome: 'Banco', valor: 500000 }], bens: [], dividas: [eccel] }, initialWealth: 500000, initialBens: 0, objectives: [], passive: [],
    incomes: [{ id: 'sal', label: 'Salário', kind: 'ativa', origin: 'Salário', frequency: 'mensal', days: [5], steps: [{ from: 0, value: 20000 }] }], expenses: linhas });
  const sd = k => Math.round(Ec.saldoDevedorEm(eccel, k));
  ok('construtora: o saldo cai com cada parcela das linhas (jan e jul) e zera na última', sd(3) === 120000 && sd(4) === 80000 && sd(10) === 60000 && sd(16) === 20000 && sd(22) === 0, [3, 4, 10, 16, 22].map(sd).join(' '));
  // o carro vendido só para a troca: a troca não alcança 70% do valor, então a venda não acontece e o carro fica
  const Ev = carregar(srcCliente);
  const carro = { nome: 'Carro', mercado: 100000, saldoDevedor: 0, venda: { em: 3, preco: 100000, custos: [], destinos: [{ objetivo: 'troca' }] } };
  const troca = { id: 'troca', name: 'Troca do carro', kind: 'bem', months: 3, amount: 300000, dedicated: 0, planned: 0, profile: 'conservador', costs: [] };
  Ev.configure({ patrimonio: { financeiro: [{ nome: 'Banco', valor: 10000 }], bens: [carro], dividas: [] }, initialWealth: 10000, initialBens: 100000, objectives: [troca], passive: [],
    incomes: [{ id: 'sal', label: 'Salário', kind: 'ativa', origin: 'Salário', frequency: 'mensal', days: [5], steps: [{ from: 0, value: 20000 }] }], expenses: [] });
  const sv = Ev.run('desej'), w6 = sv.weeks.find(w => w.mi === 6);
  ok('a troca não comprada cancela a venda: o carro fica nos bens e o dinheiro não aparece', sv.vendasCanceladas.includes('b0') && w6.bens === 100000 && !sv.events.some(e => e.type === 'venda') && sv.events.some(e => /Venda cancelada/.test(e.label)));
  troca.amount = 120000;   // com o carro e 20 mil, a troca passa de 70%: a venda acontece
  Ev.configure({ patrimonio: { financeiro: [{ nome: 'Banco', valor: 10000 }], bens: [carro], dividas: [] }, initialWealth: 10000, initialBens: 100000, objectives: [troca], passive: [],
    incomes: [{ id: 'sal', label: 'Salário', kind: 'ativa', origin: 'Salário', frequency: 'mensal', days: [5], steps: [{ from: 0, value: 20000 }] }], expenses: [] });
  const sv2 = Ev.run('desej');
  ok('a troca comprada mantém a venda', !sv2.vendasCanceladas.length && sv2.events.some(e => e.type === 'venda'));
  troca.ligado = false;   // a troca desligada no Fluxo vida toda: o carro não é vendido, e sem o marco de venda cancelada
  Ev.configure({ patrimonio: { financeiro: [{ nome: 'Banco', valor: 10000 }], bens: [carro], dividas: [] }, initialWealth: 10000, initialBens: 100000, objectives: [troca], passive: [],
    incomes: [{ id: 'sal', label: 'Salário', kind: 'ativa', origin: 'Salário', frequency: 'mensal', days: [5], steps: [{ from: 0, value: 20000 }] }], expenses: [] });
  const sv3 = Ev.run('desej');
  ok('a troca desligada também cancela a venda do carro', sv3.vendasCanceladas.includes('b0') && sv3.weeks.find(w => w.mi === 6).bens === 100000 && !sv3.events.some(e => e.type === 'venda' || /Venda cancelada/.test(e.label)));
}

console.log('\nO lance do consórcio: embutido, do bolso, e o que ele reduz');
{
  const Ek = carregar(srcCliente), perto = (a, b) => Math.abs(a - b) < 0.01;
  const grupo = extra => ({ tipo: 'consorcio', valor: 100000, cons: Object.assign({ carta: 800000, parcelas: 200, pagas: 20, parcela: 5000, contemplacao: 10, lance: 450000, embutidoPct: 30 }, extra) });
  const kp = Ek.caixaDoConsorcio(grupo({}), 0);
  ok('lance de 450 mil numa carta de 800 mil com 30% embutidos: 240 mil da carta e 210 mil do bolso', perto(kp.embutido, 240000) && perto(kp.bolso, 210000));
  ok('entra no financeiro a carta menos o lance todo (350 mil)', perto(kp.liquida, 350000) && perto(kp.rendas[0].net, 350000));
  ok('reduzindo a parcela: o prazo continua e as parcelas caem na proporção do lance', kp.fim === 180 && perto(kp.parcelas[10], 5000 * (1 - 450000 / 850000)) && perto(kp.saldoDepois, 400000));
  const kz = Ek.caixaDoConsorcio(grupo({ lanceModo: 'prazo' }), 0);
  ok('reduzindo o prazo: a parcela continua e somem as últimas 90', kz.fim === 90 && perto(kz.parcelas[89], 5000) && perto(kz.saldoDepois, 400000));
  ok('sem contemplação antes do fim, o lance não vale', Ek.caixaDoConsorcio(grupo({ contemplacao: null }), 0).lance === 0);
  // saldo de 150 mil (75 parcelas de 2 mil) e carta de 200 mil: o reajuste de 5% depois da próxima parcela sobe os dois
  const kr = Ek.caixaDoConsorcio({ tipo: 'consorcio', valor: 50000, cons: { carta: 200000, parcelas: 100, pagas: 25, parcela: 2000, reajuste: 5, reajusteApos: 26, contemplacao: 5 } }, 0);
  ok('o reajuste sobe a carta na mesma proporção do saldo: 200 mil viram 210 mil', perto(kr.carta, 210000) && perto(kr.parcelas[1], 2100) && perto(kr.parcelas[0], 2000),Math.round(kr.carta) + ' e ' + Math.round(kr.parcelas[1]));
  const div = extra => Ek.contratoDoConsorcio(Object.assign({ modalidade: 'consorcio', carta: 100000, parcelas: 100, lanceValor: 50000, lanceParcela: 10 }, extra));
  const cp = div({}), cz = div({ lanceModo: 'prazo' });
  ok('contemplado, reduzindo a parcela: 100 parcelas, a 11ª de 40 mil ÷ 90', cp.fim === 100 && perto(cp.linhas[10].pay, 40000 / 90));
  ok('contemplado, reduzindo o prazo: a parcela fica em mil e o contrato acaba na 50ª', cz.fim === 50 && perto(cz.linhas[10].pay, 1000) && perto(cz.linhas[49].saldo, 0));
}

console.log('\nA carteira de hoje troca só o que é dela no financeiro');
{
  const Es = carregar(srcCliente), tipos = ['', 'pgbl', 'vgbl', 'fechada', 'fgts', 'consorcio', 'emprestimo', 'tipoNovo'];
  const pl = { patrimonio: { financeiro: tipos.map((tipo, i) => ({ nome: 'L' + i, valor: 1000, tipo })) }, carteira: { ativos: [{ instituicao: 'XP', valor: 5000, tipo: '' }] } };
  Es.sincronizaPatrimonio(pl);
  const ficou = pl.patrimonio.financeiro.filter(f => !f.daCarteira).map(f => f.tipo);
  ok('saem as linhas digitadas de investimentos, PGBL e VGBL; ficam as outras, inclusive um tipo novo', JSON.stringify(ficou) === JSON.stringify(['fechada', 'fgts', 'consorcio', 'emprestimo', 'tipoNovo']), ficou.join(','));
  ok('o que sai é o que a janela de aviso lista', tipos.map(tipo => ({ tipo })).filter(Es.saiComACarteira).length === 3);
}

console.log('\nA sobra que não comporta o aporte, e os extras com dono');
{
  const Ec = carregar(srcCliente), copia = x => JSON.parse(JSON.stringify(x));
  // a sobra de um mês comum é 2.086; o 13º (22 mil) cai em dezembro; a anuidade das escolas (50 mil, pontual) em outubro
  const caso = extra => Object.assign({ name: 'Caso', nascimento: '1985-01-10', initialWealth: 1900000, patrimonio: { financeiro: [{ nome: 'Banco', valor: 1900000 }], bens: [], dividas: [] }, passive: [],
    incomes: [{ id: 'sal', label: 'Salários', kind: 'ativa', origin: 'Salário', frequency: 'mensal', days: [5], steps: [{ from: 0, value: 37000 }] },
      { id: 'd13', label: '13º', kind: 'ativa', origin: '13º salário', frequency: 'anual', dates: [{ m: 11, d: 20 }], steps: [{ from: 0, value: 22000 }] }],
    expenses: [{ id: 'fix', label: 'Despesas fixas', group: 'fix', frequency: 'mensal', days: [10], steps: [{ from: 0, value: 34914 }] },
      { id: 'esc', label: 'Anuidade das escolas', group: 'fix', frequency: 'pontual', days: [10], steps: [{ from: 1, value: 50000 }] }],
    objectives: [{ id: 'carro', name: 'Troca do carro', kind: 'bem', months: 9, amount: 120000, dedicated: 0, planned: 4400, profile: 'moderado', costs: [] }] }, extra);
  const roda = p => { Ec.configure(copia(p)); const s = Ec.run('desej'); return { s, por: s.programa.por.carro.slice(0, 9).map(Math.round) }; };
  const a = roda(caso());
  const fa = a.s.programa.faltas[0] || {};
  ok('a sobra de 2.086 não comporta 4.400, e a anuidade de outubro abre um buraco: o carro recebe menos, e a falta vem desde o mês 0', a.por[0] === 2086 && a.por[1] < 2086 && fa.de === 0 && Math.round(fa.valor) === 2314 && fa.quem.join() === 'carro', a.por.join(' ') + ' ' + JSON.stringify(fa));
  const p2 = caso(); p2.expenses.pop(); p2.compromissos = [{ id: 'esc', titulo: 'Anuidade das escolas', em: 1, valor: 50000 }];
  const b = roda(p2), gb = b.s.programa.meses.map(m => Math.round(m.guardado));
  ok('como compromisso (paga com o patrimônio): o carro recebe os 4.400 todo mês, e o 13º de dezembro repõe a caixa de curto prazo', b.por.every(v => v === 4400) && !b.s.programa.faltas.length && gb[2] === -6942 && gb[3] > 0, b.por.join(' ') + ' | caixa ' + gb.slice(0, 9).join(' '));
  const p3 = copia(p2); p3.incomes[1].destino = 'carro'; p3.objectives[0].planned = 2000;
  const c = roda(p3);
  ok('o 13º com dono vai inteiro para o carro em dezembro, além do aporte do mês', c.por[3] === 24000 && c.por[2] === 2000 && Math.round(c.s.programa.meses[3].extras.carro) === 22000, c.por.join(' '));
  const p4 = copia(p3); p4.objectives[0].amount = 10000; p4.objectives[0].planned = 0;
  ok('o extra para no que o objetivo precisa: o resto volta para a sobra do mês', (r => Math.round(r.s.programa.meses[3].extras.carro) < 10500 && r.s.programa.meses[3].liberdade > 10000)(roda(p4)));
}

console.log('\nA poupança para objetivos: fixa, e o aviso quando a sobra deixa de comportá-la');
{
  const Ep = carregar(srcCliente), copia = x => JSON.parse(JSON.stringify(x));
  // sobra de 3.500; carro (1.200/mês, em 6 meses), casa (1.800) e viagem (500), em 30 meses
  const caso = custo => ({ name: 'Caso', nascimento: '1985-01-10', initialWealth: 500000, patrimonio: { financeiro: [{ nome: 'Banco', valor: 500000 }], bens: [], dividas: [] }, passive: [],
    incomes: [{ id: 'sal', label: 'Salários', kind: 'ativa', frequency: 'mensal', days: [5], steps: [{ from: 0, value: 10000 }] }],
    expenses: [{ id: 'fix', label: 'Despesas fixas', group: 'fix', frequency: 'mensal', days: [10], steps: [{ from: 0, value: 6500 }] }],
    objectives: [{ id: 'carro', name: 'Carro', kind: 'bem', months: 6, amount: 7000, dedicated: 0, planned: 1200, profile: 'conservador', costs: custo ? [{ id: 'k', type: 'fixo', value: custo, months: null, label: 'Custo do carro' }] : [] },
      { id: 'casa', name: 'Casa', kind: 'bem', months: 30, amount: 60000, dedicated: 0, planned: 1800, profile: 'conservador', costs: [] },
      { id: 'viagem', name: 'Viagem', kind: 'consumo', months: 30, amount: 16000, dedicated: 0, planned: 500, profile: 'conservador', costs: [] }],
    proposito: { prioridade: ['carro', 'casa', 'viagem'] } });
  const roda = p => { Ep.configure(copia(p)); const s = Ep.run('desej'), P = s.programa; return { P, ap: id => P.meses.map(m => Math.round(m.aportes[id] || 0)), lib: P.meses.map(m => Math.round(m.liberdade)) }; };
  const a = roda(caso(0));
  ok('até o carro, os três recebem a parte (1.200 + 1.800 + 500 = 3.500) e nada vai para a liberdade', [0, 3].every(mi => a.ap('carro')[mi] === 1200 && a.ap('casa')[mi] === 1800 && a.ap('viagem')[mi] === 500 && a.lib[mi] === 0), a.ap('carro').slice(0, 7).join(' '));
  ok('  realizado o carro, sem custo: a poupança continua 3.500, e os 1.200 dele vão para a liberdade; nenhuma falta', [6, 12, 23].every(mi => a.ap('casa')[mi] === 1800 && a.ap('viagem')[mi] === 500 && a.lib[mi] === 1200) && !a.P.faltas.length, a.lib.slice(4, 9).join(' '));
  const b = roda(caso(2000)), f = b.P.faltas[0] || {};
  ok('  com o carro custando 2.000/mês, a sobra cai para 1.500: faltam 800, tirados da viagem (500) e da casa (300), de baixo para cima na prioridade', [7, 12, 16].every(mi => b.ap('viagem')[mi] === 0 && b.ap('casa')[mi] === 1500 && b.lib[mi] === 0), b.ap('casa').slice(4, 9).join(' ') + ' / ' + b.ap('viagem').slice(4, 9).join(' '));
  // o que ainda cabe: o resultado comum é 2.500, o IPVA de janeiro tira 3.200 e as partes somam 1.967; na conta do ano
  // cabem uns 266 a mais. Com a folga como parte de um objetivo novo, nenhuma falta; com 60 a mais, falta
  {
    const base = { name: 'Folga', nascimento: '1985-01-10', initialWealth: 300000, patrimonio: { financeiro: [{ nome: 'B', valor: 300000 }], bens: [], dividas: [] }, passive: [],
      incomes: [{ id: 's', label: 'Sal', frequency: 'mensal', days: [5], steps: [{ from: 0, value: 15000 }] }],
      expenses: [{ id: 'd', label: 'Tudo', group: 'fix', frequency: 'mensal', days: [10], steps: [{ from: 0, value: 12500 }] },
        { id: 'ipva', label: 'IPVA', group: 'fix', frequency: 'anual', dates: [{ m: 0, d: 10 }], steps: [{ from: 0, value: 3200 }] }],
      objectives: [{ id: 'a', name: 'A', kind: 'consumo', months: 60, amount: 500000, dedicated: 0, planned: 1967, profile: 'moderado', costs: [] }] };
    Ep.configure(copia(base)); const fg = Ep.folgaDosAportes(Ep.run('desej'));
    const com = v => { const p = copia(base); p.objectives.push({ id: 'n', name: 'Novo', kind: 'consumo', months: 60, amount: 500000, dedicated: 0, planned: v, profile: 'moderado', costs: [] }); Ep.configure(p); return Ep.run('desej').programa.faltas.length; };
    ok('o que ainda cabe guardar por mês (A distribuir) desconta o IPVA de janeiro: entre 266 e 300, e não cria falta; 60 a mais criam', fg >= 266 && fg <= 300 && com(fg) === 0 && com(fg + 60) > 0, 'folga ' + fg);
    const p2 = copia(base); p2.incomes.push({ id: 'herança', label: 'Herança', frequency: 'pontual', days: [5], steps: [{ from: 5, value: 100000 }] }); Ep.configure(p2); const s2 = Ep.run('desej'), fg2 = Ep.folgaDosAportes(s2);
    ok('  uma entrada pontual (100 mil no mês 5) não muda o que cabe todo mês: é um aporte pontual, do mês dela', fg2 === fg && Math.round(s2.programa.meses[5].sobra) > 100000, 'folga ' + fg2);
  }
  ok('  a falta começa no mês do carro (o que a caixa guardou antes cobre uma parte do primeiro mês) e chega a 800/mês, e a causa é o custo do carro', f.de === 6 && Math.round(f.max) === 800 && f.quem.join() === 'viagem,casa' && f.causa && f.causa.tipo === 'custo' && f.causa.obj === 'carro' && Math.round(f.causa.valor) === 2000, JSON.stringify(f));
}

console.log('\nO início do desenho: mudar a data não muda o calendário');
{
  const Ei = carregar(srcCliente), copia = x => JSON.parse(JSON.stringify(x));
  const base = Object.assign({ name: 'Ana Ribeiro' }, copia(Ei.FAMILIA_EXEMPLO), copia(Ei.config()), { patrimonio: copia(Ei.PATRIMONIO_EXEMPLO),
    compromissos: [{ id: 'ref', titulo: 'Reforma', em: 14, valor: 30000 }], creditos: [{ nome: 'Crédito', valor: 20000, em: 8, parcelas: 12, juros: 1.5 }] });
  ok('sem data de início, o plano começa em 19/09/2026 (setembro é o mês 0)', (Ei.configure(copia(base)), Ei.INICIO === '2026-09-19' && Ei.mesDoPlano(0) === 'set/2026'));
  // as linhas do Fluxo (entradas e despesas), mês a mês do calendário, num plano que começa em outra data
  const linhas = (plan, ids) => { Ei.configure(copia(plan)); const s = Ei.run('desej'), out = {};
    s.buckets.month.filter(b => b.mi >= 1).forEach(b => { const cal = Ei.mesDoPlano(b.mi); out[cal] = ids.map(k => Math.round(b.f[k] || 0)).join(','); }); return out; };
  // fora: as linhas que acabam com a compra de um objetivo (endObj), que depende do saldo, não do calendário
  const ids = [...base.incomes.map(i => 'in_' + i.id), ...base.expenses.filter(x => !x.endObj).map(x => 'out_' + x.group + '_' + x.id), 'out_comp_ref'];
  const ref = linhas(base, ids);
  for (const iso of ['2026-11-20', '2026-07-10', '2027-03-04']) {
    const p = copia(base), d = Ei.mudaInicio(p, iso), dep = linhas(p, ids);
    const meses = Object.keys(dep).filter(m => m in ref).slice(1, 48), dif = meses.filter(m => dep[m] !== ref[m]);
    ok(`começando em ${iso.split('-').reverse().join('/')}: o mês 0 anda ${d} e as linhas caem nos mesmos meses do calendário`, meses.length > 40 && !dif.length, dif.slice(0, 2).map(m => m + ': ' + ref[m] + ' → ' + dep[m]).join(' | '));
    ok(`  e o objetivo, o compromisso e o crédito ficam na mesma data (${Ei.mesDoPlano(p.objectives[0].months)})`, (Ei.configure(p), Ei.mesDoPlano(p.objectives[0].months)) === (Ei.configure(copia(base)), Ei.mesDoPlano(base.objectives[0].months))
      && p.compromissos[0].em === 14 - d && p.creditos[0].em === 8 - d);
  }
  const ida = copia(base); Ei.mudaInicio(ida, '2027-03-04'); Ei.mudaInicio(ida, '2026-09-19');
  ok('voltar à data de antes devolve o plano igual', JSON.stringify(ida) === JSON.stringify(Object.assign(copia(base), { inicio: '2026-09-19', regraDoInicio: 'semana' })));
  // o mês 0 é a primeira coluna do Fluxo: o mês da semana de hoje
  const col0 = iso => { const p = copia(base); Ei.mudaInicio(p, iso); Ei.configure(p); const s = Ei.run('desej'); return { mes: Ei.mesDoPlano(0), mi: s.weeks[Ei.W0].mi }; };
  for (const [iso, mes, txt] of [['2026-11-03', 'nov/2026', 'a semana de 03/11 já tem o dia 5'], ['2026-10-04', 'out/2026', 'o domingo 04/10 abre a semana do dia 5'], ['2027-09-01', 'ago/2027', 'a semana de 01/09/2027 acaba antes do dia 5'], ['2026-10-20', 'out/2026', 'um dia comum']])
    ok(`começar em ${iso.split('-').reverse().join('/')} é começar em ${mes} (${txt}), e a primeira semana é do mês 0`, (r => r.mes === mes && r.mi === 0)(col0(iso)), JSON.stringify(col0(iso)));
  // um plano desenhado com a regra antiga (setembro como mês 0 num início em 04/10): o início fica, outubro vira o mês 0 e
  // o que estava guardado continua no mesmo mês do calendário
  const velho = Object.assign(copia(base), { inicio: '2026-10-04' }); delete velho.regraDoInicio;
  ok('o plano antigo que começava em 04/10 com setembro como mês 0 fica em 04/10, com outubro na primeira coluna e o compromisso no mesmo mês',
    (Ei.configure(velho), Ei.mesDoPlano(0) === 'out/2026' && velho.inicio === '2026-10-04' && velho.regraDoInicio === 'semana' && velho.compromissos[0].em === 13 && Ei.run('desej').weeks[Ei.W0].mi === 0), velho.inicio + ' ' + velho.compromissos[0].em);
  ok('  e abrir de novo não anda mais nada', (Ei.configure(velho), velho.compromissos[0].em === 13));
  const novo = Object.assign(copia(base), { inicio: '2026-10-04', regraDoInicio: 'semana' });
  ok('  e o plano novo com o mesmo início fica em outubro', (Ei.configure(novo), Ei.mesDoPlano(0) === 'out/2026' && novo.inicio === '2026-10-04'));
}


console.log('\n13. Regressões da auditoria (planos de ux/auditoria/planos)');
if (fs.existsSync('ux/auditoria/planos/plano-09.json')) {
  const plano = n => { const j = JSON.parse(fs.readFileSync('ux/auditoria/planos/plano-' + n + '.json', 'utf8')); return j.dados || j; };
  const roda = n => { const Ea = carregar(srcCliente); Ea.configure(plano(n)); const s = Ea.run('desej'); return { Ea, s }; };
  const mes = (s, mi) => (s.buckets.month.find(b => b.mi === mi) || { f: {} });
  const soma = (b, re) => Object.entries(b.f).filter(([k]) => re.test(k)).reduce((a, [, v]) => a + v, 0);
  { const { s } = roda('09');
    ok('M1: depois da liberdade a parcela e o adiantamento da dívida saem como no contrato (103.867,61), sem a escala do padrão de vida', Math.abs(soma(mes(s, 13), /^out_fix_parc_apto$/) - 103867.61) < 0.01, soma(mes(s, 13), /^out_fix_parc_apto$/));
    ok('M2: o saque único do fundo de pensão entra no financeiro e não vira gasto do mês (saídas iguais à renda desejada)', Math.abs(soma(mes(s, 6), /^out_/) - 22000) < 1, soma(mes(s, 6), /^out_/));
    ok('M4: o cônjuge recebe o salário até o mês em que faz a idade de parar (mês 26 ainda com salário)', soma(mes(s, 26), /^in_salario$/) > 0, soma(mes(s, 26), /^in_salario$/));
    ok('D2: na renda desejada, o gasto da liberdade é a renda desejada, mesmo com renda passiva maior', Math.abs(soma(mes(s, 100), /^out_/) - 22000) < 1 || soma(mes(s, 100), /^out_/) < 22000 + 1, soma(mes(s, 100), /^out_/)); }
  { const { Ea } = roda('07'), pl = plano('07');
    const divs = ((pl.dados || pl).patrimonio || {}).dividas || [];
    const com = divs.filter(d => (d.amortizacoes || []).length);
    ok('M3: o saldo devedor cai no mesmo mês do adiantamento (e não no seguinte)', com.length > 0 && com.every(d => d.amortizacoes.every(a => Ea.saldoDevedorEm(d, a.em) <= Math.max(0, Ea.saldoDevedorEm(d, a.em - 1) - 0.9 * a.valor))), com.length + ' dívida(s) com adiantamento'); }
  { const { s } = roda('05');
    ok('D1: quando o patrimônio acaba e a renda desejada deixa de ser paga, o motor devolve o aviso (semCobertura)', !!s.semCobertura && s.semCobertura.falta > 0 && s.events.some(e => e.label === 'O patrimônio não cobre a renda desejada'), s.semCobertura && JSON.stringify({ mi: s.semCobertura.mi, falta: Math.round(s.semCobertura.falta) })); }
}
console.log('\n14. Segunda rodada da auditoria (M5 a M10, D4, D6 e os campos novos)');
{ const base = JSON.parse(JSON.stringify(typeof planoBase !== 'undefined' ? planoBase : {}));
  const cenario = n => { const f = 'ux/auditoria/planos/plano-' + n + '.json'; if (!fs.existsSync(f)) return null; const j = JSON.parse(fs.readFileSync(f, 'utf8')); return j.dados || j; };
  const roda = (pl, modo) => { const Ea = carregar(srcCliente); Ea.configure(JSON.parse(JSON.stringify(pl))); return { Ea, s: Ea.run(modo || 'desej') }; };
  const p10 = cenario('10'), p03 = cenario('03'), p07 = cenario('07');
  if (p10) { const { s } = roda(p10);
    const m48 = s.buckets.month.find(b => b.mi === 48) || { f: {} };
    ok('M6: no consórcio, a parte do lance que é taxa de administração sai como despesa e não vira bem', Math.abs((m48.f.out_obj_carro || 0) - 619) < 1, m48.f.out_obj_carro);
    const fim = s.weeks[s.weeks.length - 1];
    ok('D6: a compra financiada traz a dívida para as dívidas atuais (e o bem entra inteiro)', Math.max(...s.weeks.filter(w => w.mi >= 0).map(w => w.div)) > 400000, Math.round(Math.max(...s.weeks.map(w => w.div)))); }
  if (p03) { const { s } = roda(p03);
    ok('D4: o objetivo que vence depois da liberdade continua recebendo aporte (nenhum fica em "alcançável com ajustes")', s.ff && Ea_ok(p03)); }
  function Ea_ok(pl) { const { Ea } = roda(pl); return Ea.OBJ.every(o => o.status === 'ok'); }
  if (p07) { const { Ea } = roda(p07), pl = JSON.parse(JSON.stringify(p07));
    const dv = ((pl.patrimonio || {}).dividas || []).find(d => (d.amortizacoes || []).length);
    if (dv) { dv.amortizacoes[0].valor = 9e9; Ea.configure(pl);
      const av = Ea.avisosDoPlano();
      ok('amortização maior que o saldo: o motor usa só o saldo e avisa', av.some(a => a.tipo === 'amortizacao') && Ea.saldoDevedorEm(dv, dv.amortizacoes[0].em) === 0, av.map(a => a.tipo).join(',')); } }
  // venda de participação com imposto sobre o ganho e renda ligada que termina na venda
  { const pl = { age: 40, nascimento: '1986-05-12', tipo: 'individual', initialWealth: 100000, patrimonio: { financeiro: [], bens: [], dividas: [],
      participacoes: [{ nome: 'Empresa', valor: 1000000, venda: { em: 60, preco: 2000000, impostoGanhoPct: 15, custoAquisicao: 500000 } }] } };
    const { Ea } = roda(pl), tr = Ea.trajetoriaDaParticipacao(Ea.PARTS[0]);
    ok('imposto sobre o ganho: 15% de (2.000.000 − 500.000) = 225.000 saem do líquido da venda', tr.venda && Math.abs(tr.venda.custo - 225000) < 1 && Math.abs(tr.venda.liquido - 1775000) < 1, tr.venda && tr.venda.custo); }
}
console.log('\n' + (falhas ? falhas + ' verificação(ões) falharam.' : 'Tudo certo.') + '\n');
process.exit(falhas ? 1 : 0);
