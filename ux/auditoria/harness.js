// Harness da auditoria matemática: carrega o motor de evolucao-patrimonial.html fora do navegador, configura um plano e
// despeja um "extrato" em JSON (mês a mês) para o auditor recalcular de forma independente.
// uso: node harness.js <plano.json> <extrato.json>     (o plano pode ser {dados:{...}} ou o plano direto)
// módulo: const { carregar, extrato } = require('./harness.js')
const fs = require('fs'), vm = require('vm'), path = require('path');
const HTML = path.join(__dirname, '..', '..', 'evolucao-patrimonial.html');

function carregar() {
  const m = fs.readFileSync(HTML, 'utf8').match(/<script id="engine">([\s\S]*?)<\/script>/);
  const ctx = { module: { exports: {} }, console };
  vm.createContext(ctx); vm.runInContext(m[1], ctx);
  return ctx.module.exports;
}

function extrato(plano, E) {
  E = E || carregar();
  const P = JSON.parse(JSON.stringify(plano.dados || plano));
  E.configure(P);
  const s = E.run('desej');
  const arr = a => Array.from(a || []);
  const meses = s.buckets.month.filter(b => b.w1 > E.W0).map(b => {
    const w = s.weeks[Math.min(b.w1 - 1, s.weeks.length - 1)];
    return { mi: b.mi, w0: b.w0, w1: b.w1, fluxo: b.f, fim: { fin: w.fin, cofre: w.cofre, obj: arr(w.obj), bens: w.bens, part: w.part, prev: w.prev, div: w.div, cheque: w.cheque, det: w.det } };
  });
  const bens = E.BENS.map((b, k) => ({ nome: b.nome, serie: arr(E.trajetoriaDoBem(b).serie), venda: E.trajetoriaDoBem(b).venda }));
  const parts = E.PARTS.map(p => { const t = E.trajetoriaDaParticipacao(p); return { nome: p.nome, serie: arr(t.serie), venda: t.venda }; });
  const dividas = E.BENS.concat(E.PARTS.length ? [] : []).map(b => ({ nome: b.nome, saldo: Array.from({ length: 361 }, (_, mi) => E.saldoDevedorEm(b, mi)) }));
  const dividasAvulsas = (P.patrimonio && P.patrimonio.dividas || []).map(d => ({ nome: d.nome, saldo: Array.from({ length: 361 }, (_, mi) => E.saldoDevedorEm(d, mi)) }));
  const objetivos = E.OBJ.map(o => {
    const r = E.taxaDoObjetivo(o);
    return { id: o.id, name: o.name, kind: o.kind, months: o.months, amount: o.amount, dedicated: o.dedicated, planned: o.planned, required: o.required, profile: o.profile, rateM: o.rateM, status: o.status, real: o.real, projected: o.projected,
      taxaPorMes: Array.from({ length: Math.max(1, Math.round(o.months)) + 1 }, (_, mi) => E.taxaNoMes(r, mi)) };
  });
  return { W0: E.W0, NW: E.NW, M0: E.M0, idadeHoje: E.CURRENT_AGE, PROFILES: E.PROFILES, R_M: E.R_M, JUROS_DIVIDA_M: E.JUROS_DIVIDA_M, MESES_CONSERVADOR: E.MESES_CONSERVADOR,
    ff: s.ff, ruina: s.ruina, semCobertura: s.semCobertura || null, eventos: s.events.map(e => ({ week: e.week, type: e.type, label: e.label, detail: e.detail })),
    meses, bens, parts, dividas, dividasAvulsas, objetivos };
}
module.exports = { carregar, extrato, HTML };

if (require.main === module) {
  const [pl, out] = process.argv.slice(2);
  if (!pl || !out) { console.error('uso: node harness.js <plano.json> <extrato.json>'); process.exit(2); }
  const x = extrato(JSON.parse(fs.readFileSync(pl, 'utf8')));
  fs.writeFileSync(out, JSON.stringify(x));
  console.log('extrato gravado:', out, '| meses:', x.meses.length, '| objetivos:', x.objetivos.length, '| liberdade:', x.ff ? x.ff.age.toFixed(1) + ' anos' : 'não');
}
