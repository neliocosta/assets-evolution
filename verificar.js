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

console.log('\n' + (falhas ? falhas + ' verificação(ões) falharam.' : 'Tudo certo.') + '\n');
process.exit(falhas ? 1 : 0);
