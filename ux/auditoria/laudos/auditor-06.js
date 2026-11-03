// AUDITOR MATEMÁTICO — CENÁRIO 06 (Lucas Ribeiro)
// Reexecutável:  node ux/auditoria/laudos/auditor-06.js            (imprime os resultados; nada é gravado)
//
// Independência: o "esperado" é calculado aqui, a partir do PLANO (planos/plano-06.json) e de regras financeiras escritas neste
// arquivo (Price/SAC, juros compostos, anuidades, calendário). NENHUMA função de cálculo do motor é usada para produzir o esperado.
// O "observado" é só a saída do motor: o extrato mensal (extratos/extrato-06.json) e, para as conferências semana a semana, a
// mesma simulação semanal rodada pelo harness (o motor é carregado apenas para OBSERVAR s.weeks e para os testes de estresse).
//
// Premissas de desenho do motor que este auditor adota como regra e confere se são aplicadas de modo consistente:
//  P1 rendimento semanal: o saldo positivo da reserva e das caixinhas rende (1+taxa_mensal)^(7/30,4375) a cada semana, ANTES dos
//     lançamentos da semana; saldo negativo da reserva não rende (paga 4% ao mês, uma vez por mês, sobre o saldo do fim do mês anterior).
//  P2 o mês do motor vai do dia 5 ao dia 4 (a semana que contém o dia 5 abre o mês).
//  P3 caixinha: taxa do perfil nos meses anteriores aos últimos 24 antes da data; conservadora nos últimos 24 (mi >= months-24).
//  P4 IOF de pessoa física: 0,38% sobre o financiado + 0,0082% ao dia sobre cada amortização, dias = min(365, 30*(k+1)).
//     Dívida sem a chave "iof" é tratada como "financiado" (somado ao crédito).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const H = require(path.join(ROOT, 'harness.js'));
const plano = JSON.parse(fs.readFileSync(path.join(ROOT, 'planos', 'plano-06.json'), 'utf8')).dados;
const X = JSON.parse(fs.readFileSync(path.join(ROOT, 'extratos', 'extrato-06.json'), 'utf8'));

// ---------------------------------------------------------------- utilidades
const R2 = v => Math.round(v * 100) / 100;
const fmt = v => (v < 0 ? '-' : '') + Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pmt = (P, i, n) => i > 0 ? P * i / (1 - Math.pow(1 + i, -n)) : P / n;
const mensalDeAnual = a => Math.pow(1 + a, 1 / 12) - 1;
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const rot = mi => { const cm = 2026 * 12 + 9 + mi; return MESES[cm % 12] + '/' + Math.floor(cm / 12); };   // mês 0 = out/2026
const TAB = [];   // tabela de conferências
function conf(id, oque, metodo, amostra, erro, ok, nota) { TAB.push({ id, oque, metodo, amostra, erro, ok, nota }); console.log(`[${ok ? 'OK ' : 'ERRO'}] ${id} ${oque} | ${amostra} | erro máx ${typeof erro === 'number' ? fmt(erro) : erro}${nota ? ' | ' + nota : ''}`); }
const maxAbs = a => a.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
const TOL = 0.01;
const secao = t => console.log('\n=== ' + t + ' ===');
const out = {};   // números-chave para o laudo

// ---------------------------------------------------------------- observado
const E = H.carregar();
function rodar(p) { const x = H.extrato(p, E); const s = E.run('desej'); return { x, s }; }
const base = rodar(JSON.parse(JSON.stringify(plano)));
const S = base.s;                          // semana a semana (observado)
const regen = base.x;
const W0 = X.W0, NW = X.NW;
{ // o extrato em arquivo é o que o motor produz hoje?
  let dif = 0; X.meses.forEach((m, k) => { dif = Math.max(dif, Math.abs(m.fim.fin - regen.meses[k].fim.fin), Math.abs(m.fim.div - regen.meses[k].fim.div)); });
  conf('0', 'Extrato em arquivo = motor regenerado', 'regerar com o harness e comparar fin e div mês a mês', X.meses.length + ' meses', dif, dif < TOL);
}
const mesBy = new Map(X.meses.map(m => [m.mi, m]));
const ULT = X.meses[X.meses.length - 1].mi;

// ---------------------------------------------------------------- premissas lidas do PLANO
const T = plano.rate;                                    // 0,4% ao mês: rendimento da reserva
const PROF = plano.profiles;                             // perfis das caixinhas
const GWK = 7 / 30.4375;                                 // expoente semanal
const GW = Math.pow(1 + T, GWK);
const JUROS_DIV = 0.04;                                  // juros da reserva negativa (padrão do produto, o plano não traz plano.jurosDivida)
const OBJ = plano.objectives;                            // inglês, notebook, apto
const sal = plano.incomes.find(i => i.id === 'salario');
const salEm = mi => { let v = 0; sal.steps.forEach(s => { if (mi >= s.from) v = s.value; }); return v; };

// ================================================================== TABELAS DE DÍVIDA (esperado)
// Price ou SAC mês a mês. extras: Map(k -> {valor, modo}) (adiantamento após a parcela k, de 0)
function tabela(F, i, n, sac, extras) {
  const out = []; let bal = F, pm = pmt(F, i, n), am = F / n;
  for (let k = 0; k < n && bal > 0.005; k++) {
    const juros = bal * i, amort = Math.min(bal, sac ? am : pm - juros); bal = Math.max(0, bal - amort);
    const x = extras && extras.get(k), extra = x && bal > 0 ? Math.min(bal, x.valor) : 0;
    if (extra) { bal -= extra; const r = n - k - 1; if (x.modo === 'parcela' && bal > 0 && r > 0) { pm = pmt(bal, i, r); am = bal / r; } }
    out.push({ juros, amort, extra, pay: juros + amort, saldo: bal });
  }
  return out;
}
const iofDe = (F, lin) => F * 0.0038 + lin.reduce((a, l, k) => a + l.amort * 0.000082 * Math.min(365, 30 * (k + 1)), 0);
// valor financiado quando o IOF é somado ao crédito (ponto fixo)
function financiado(credito, i, n, sac, modoIof) {
  let F = credito;
  if (modoIof === 'isento') return F;
  for (let r = 0; r < 12; r++) { const iof = iofDe(F, tabela(F, i, n, sac)); F = credito + iof; }
  return F;
}
function bisseccao(f, alvo, hi) { let lo = 0; for (let r = 0; r < 80; r++) { const m = (lo + hi) / 2; if (f(m) < alvo) lo = m; else hi = m; } return (lo + hi) / 2; }
// contrato de uma dívida em que a PARCELA manda: acha a taxa mensal que faz a parcela de hoje (k0) ser P
function contratoPelaParcela(credito, n, P, k0, modoIof) {
  const i = bisseccao(m => tabela(financiado(credito, m, n, false, modoIof), m, n, false)[k0].pay, P, 0.2);
  const F = financiado(credito, i, n, false, modoIof), lin = tabela(F, i, n, false);
  return { i, F, lin, saldoHoje: k0 > 0 ? lin[k0 - 1].saldo : F, iof: F - credito };
}

// ================================================================== A. CONTABILIDADE GERAL
secao('A. Contabilidade geral');
{
  // A1 NaN / infinitos / sinais
  let bad = 0; JSON.stringify(X, (k, v) => { if (typeof v === 'number' && !isFinite(v)) bad++; return v; });
  S.weeks.forEach(w => { [w.fin, w.cofre, w.bens, w.part, w.prev, w.div, ...w.obj].forEach(v => { if (!isFinite(v)) bad++; }); for (const k in w.f) if (!isFinite(w.f[k])) bad++; });
  let sinal = 0; X.meses.forEach(m => { const f = m.fim; if (f.bens < -TOL || f.part < -TOL || f.prev < -TOL || f.div < -TOL || f.obj.some(v => v < -TOL) || Math.abs(f.cheque - Math.max(0, -f.cofre)) > TOL) sinal++; });
  conf('A1', 'Sem NaN/infinito; bens, part, prev, dívida, caixinhas >= 0; cheque = máx(0, -reserva)', 'varredura do extrato (879 meses) e das 5219 semanas', X.meses.length + ' meses + ' + NW + ' semanas', bad + sinal, bad + sinal === 0);
  // A2 fin = cofre + soma das caixinhas
  const e2 = X.meses.map(m => m.fim.fin - (m.fim.cofre + m.fim.obj.reduce((a, b) => a + b, 0)));
  conf('A2', 'Financeiro = reserva + soma das caixinhas', 'identidade em cada fim de mês', X.meses.length + ' meses', maxAbs(e2), maxAbs(e2) < TOL);
  // A3 semana a semana: soma de todos os mov_* = entradas - saídas (transferências somam zero)
  let e3 = 0, n3 = 0;
  for (let i = W0; i < NW; i++) { const f = S.weeks[i].f; let r = 0, mv = 0; for (const k in f) { if (k.startsWith('in_')) r += f[k]; else if (k.startsWith('out_')) r -= f[k]; else if (k.startsWith('mov_')) mv += f[k]; } e3 = Math.max(e3, Math.abs(mv - r)); n3++; }
  conf('A3', 'Conservação: soma dos mov_* (reserva+caixinhas+bens) = entradas - saídas; transferências somam zero', 'semana a semana, todas as chaves do fluxo', n3 + ' semanas', e3, e3 < TOL);
  // A4 recursão semanal da reserva
  let e4 = 0, n4 = 0, ex4 = 0, imp = 0;
  for (let i = W0 + 1; i < NW; i++) {
    const c0 = S.weeks[i - 1].cofre, f = S.weeks[i].f;
    const exp = (c0 > 0 ? c0 * GW : c0) + (f.mov_cofre || 0);
    const d = Math.abs(S.weeks[i].cofre - exp);
    if (d > TOL) { ex4++; if (Math.abs(S.weeks[i].cofre) < 0.5 || Math.abs(exp) < 0.5) imp++; }
    e4 = Math.max(e4, d); n4++;
  }
  conf('A4', 'Reserva: cofre(i) = cofre(i-1)*GW [se >0] + mov_cofre(i)  (P1)', 'recursão semanal independente', n4 + ' semanas', e4, e4 < TOL, ex4 ? ex4 + ' semanas fora (limpeza de centavos: ' + imp + ')' : '');
  out.A4 = { e4, ex4 };
  // A5 patrimônio: variação do mês = (in - out) + rendimentos esperados + amortização do apto esperada + variação da previdência esperada - variação da dívida esperada
  // (preenchido depois de calculadas as tabelas, ver A5 mais abaixo)
}

// ================================================================== C. DÍVIDAS
secao('C. Dívidas');
// ---- Moto e cartão: como lançados (iof ausente => "financiado") e como o cliente falou (sem IOF)
const moto = plano.patrimonio.bens[0], cartao = plano.patrimonio.dividas[0];
const kM = moto.parcelas - moto.restantes, kC = cartao.parcelas - cartao.restantes;     // parcelas já pagas: 14 e 2
const motoL = contratoPelaParcela(moto.credito, moto.parcelas, moto.parcela, kM, 'financiado');
const cartL = contratoPelaParcela(cartao.credito, cartao.parcelas, cartao.parcela, kC, 'financiado');
const motoC = contratoPelaParcela(moto.credito, moto.parcelas, moto.parcela, kM, 'isento');
const cartC = contratoPelaParcela(cartao.credito, cartao.parcelas, cartao.parcela, kC, 'isento');
out.motoL = { i: motoL.i, iof: motoL.iof, saldoHoje: motoL.saldoHoje }; out.motoC = { i: motoC.i, saldoHoje: motoC.saldoHoje };
out.cartL = { i: cartL.i, iof: cartL.iof, saldoHoje: cartL.saldoHoje }; out.cartC = { i: cartC.i, saldoHoje: cartC.saldoHoje };
console.log('moto  : como lançado (IOF financiado) i=' + (motoL.i * 100).toFixed(4) + '% a.m., IOF ' + fmt(motoL.iof) + ', saldo de hoje ' + fmt(motoL.saldoHoje) + ' | sem IOF (cliente) i=' + (motoC.i * 100).toFixed(4) + '%, saldo ' + fmt(motoC.saldoHoje));
console.log('cartão: como lançado (IOF financiado) i=' + (cartL.i * 100).toFixed(4) + '% a.m., IOF ' + fmt(cartL.iof) + ', saldo de hoje ' + fmt(cartL.saldoHoje) + ' | sem IOF (cliente) i=' + (cartC.i * 100).toFixed(4) + '%, saldo ' + fmt(cartC.saldoHoje));
console.log('moto  : parcela com 2,1% a.m. exatos e sem IOF = ' + fmt(pmt(18000, 0.021, 36)));
// saldo mês a mês (mi 0..) do motor, escalado pelo saldo informado
const escM = moto.saldoDevedor / motoL.saldoHoje, escC = cartao.saldoDevedor / cartL.saldoHoje;
const saldoRepl = (L, k0, esc, mi) => { const j = k0 + mi; return j >= L.lin.length ? 0 : (j <= 0 ? L.F : L.lin[j - 1].saldo) * esc; };
{
  const dM = [], dC = [];
  for (let mi = 0; mi <= 30; mi++) { dM.push(X.dividas[0].saldo[mi] - saldoRepl(motoL, kM, escM, mi)); dC.push(X.dividasAvulsas[0].saldo[mi] - saldoRepl(cartL, kC, escC, mi)); }
  conf('C1', 'Moto: saldo devedor mês a mês = tabela Price recalculada (taxa implícita da parcela, IOF financiado como o plano o lançou)', 'tabela própria (bisseção na taxa, ponto fixo do IOF) x dividas[0].saldo', '31 meses (mi 0..30)', maxAbs(dM), maxAbs(dM) < TOL, 'escala saldo informado/contrato = ' + escM.toFixed(6));
  conf('C2', 'Cartão: idem', 'idem x dividasAvulsas[0].saldo', '31 meses', maxAbs(dC), maxAbs(dC) < TOL, 'escala = ' + escC.toFixed(6));
  // quitação em zero
  conf('C3', 'Quitação: moto zera no mi 22 e cartão no mi 8 (nenhum saldo residual ou negativo)', 'primeira posição com saldo 0', 'moto/cartão', Math.abs(X.dividas[0].saldo[22]) + Math.abs(X.dividasAvulsas[0].saldo[8]) + (X.dividas[0].saldo[21] > 0 ? 0 : 1) + (X.dividasAvulsas[0].saldo[7] > 0 ? 0 : 1), X.dividas[0].saldo[22] === 0 && X.dividasAvulsas[0].saldo[8] === 0 && X.dividas[0].saldo[21] > 0 && X.dividasAvulsas[0].saldo[7] > 0);
  // parcela no fluxo = contrato
  let ePar = 0; for (let mi = 1; mi <= 25; mi++) { const f = mesBy.get(mi).fluxo; const expM = mi <= 22 ? motoL.lin[kM + mi - 1].pay : 0, expC = mi <= 8 ? cartL.lin[kC + mi - 1].pay : 0; ePar = Math.max(ePar, Math.abs((f.out_fix_parc_moto || 0) - expM), Math.abs((f.out_fix_parc_cartao || 0) - expC)); }
  conf('C4', 'Parcela que sai no fluxo = parcela do contrato (718 e 780) e para na última', 'out_fix_parc_* x tabela própria', '25 meses', ePar, ePar < 0.01);
  // juros pagos = soma parcelas - principal restante
  const jM = motoL.lin.slice(kM).reduce((a, l) => a + l.pay, 0) - motoL.saldoHoje, jC = cartL.lin.slice(kC).reduce((a, l) => a + l.pay, 0) - cartL.saldoHoje;
  const pagM = Array.from({ length: 22 }, (_, k) => mesBy.get(k + 1).fluxo.out_fix_parc_moto).reduce((a, b) => a + b, 0), pagC = Array.from({ length: 8 }, (_, k) => mesBy.get(k + 1).fluxo.out_fix_parc_cartao).reduce((a, b) => a + b, 0);
  const eJ = Math.abs((pagM - moto.saldoDevedor) - jM * escM) + Math.abs((pagC - cartao.saldoDevedor) - jC * escC);
  out.jurosMoto = pagM - moto.saldoDevedor; out.jurosCartao = pagC - cartao.saldoDevedor;
  conf('C5', 'Juros pagos = soma das parcelas pagas - saldo devedor de hoje (moto e cartão)', 'soma do fluxo observado x tabela', 'moto 22 parcelas, cartão 8', eJ, eJ < 0.5, 'moto ' + fmt(out.jurosMoto) + ' | cartão ' + fmt(out.jurosCartao));
  // fidelidade ao cliente: sem IOF
  const dMc = [], dCc = [];
  for (let mi = 0; mi <= 22; mi++) { dMc.push(X.dividas[0].saldo[mi] - (mi >= 22 ? 0 : (22 - mi) > 0 ? 718 * (1 - Math.pow(1 + motoC.i, -(22 - mi))) / motoC.i : 0)); }
  for (let mi = 0; mi <= 8; mi++) dCc.push(X.dividasAvulsas[0].saldo[mi] - (8 - mi > 0 ? 780 * (1 - Math.pow(1 + cartC.i, -(8 - mi))) / cartC.i : 0));
  out.dMotoCliente = dMc; out.dCartCliente = dCc;
  console.log('moto : saldo do motor menos saldo pelo contrato do cliente (sem IOF): mi0 ' + fmt(dMc[0]) + ' | mi6 ' + fmt(dMc[6]) + ' | mi12 ' + fmt(dMc[12]) + ' | mi18 ' + fmt(dMc[18]) + ' | mi22 ' + fmt(dMc[22]));
  console.log('cartão: idem mi0 ' + fmt(dCc[0]) + ' | mi4 ' + fmt(dCc[4]) + ' | mi8 ' + fmt(dCc[8]));
  conf('C6', 'Fidelidade: saldo da moto e do cartão no mês 0 contra o contrato do cliente (2,1% a.m., 718; 6.500 em 10x de 780, sem IOF)', 'valor presente das parcelas restantes à taxa implícita sem IOF', 'mês 0', Math.max(Math.abs(dMc[0]), Math.abs(dCc[0])), Math.max(Math.abs(dMc[0]), Math.abs(dCc[0])) < 5, 'moto: motor ' + fmt(X.dividas[0].saldo[0]) + ' x esperado ' + fmt(X.dividas[0].saldo[0] - dMc[0]) + ' | cartão: motor ' + fmt(X.dividasAvulsas[0].saldo[0]) + ' x esperado ' + fmt(X.dividasAvulsas[0].saldo[0] - dCc[0]));
}
// ---- Financiamento do apartamento (compra financiada do objetivo)
const apto = OBJ.find(o => o.id === 'apto'), comp = apto.compra;
const aptoF = apto.preco - apto.amount, aptoI = mensalDeAnual(comp.juros / 100);
const extrasA = new Map(); comp.amortizacoes.forEach(a => extrasA.set(a.em - apto.months, { valor: a.valor, modo: a.modo }));
const aptoT = tabela(aptoF, aptoI, comp.parcelas, comp.sistema === 'sac', extrasA), aptoSem = tabela(aptoF, aptoI, comp.parcelas, false);
out.apto = { F: aptoF, i: aptoI, parcela: aptoT[0].pay, parcelas: aptoT.length, ultima: aptoT[aptoT.length - 1].pay, jurosCom: aptoT.reduce((a, l) => a + l.juros, 0), jurosSem: aptoSem.reduce((a, l) => a + l.juros, 0), nSem: aptoSem.length };
console.log('apto: financiado ' + fmt(aptoF) + ' a ' + (aptoI * 100).toFixed(4) + '% a.m.; parcela ' + fmt(aptoT[0].pay) + '; com adiantamento de 10.000 (modo prazo) = ' + aptoT.length + ' parcelas (sem: ' + aptoSem.length + '), última ' + fmt(aptoT[aptoT.length - 1].pay) + '; juros totais ' + fmt(out.apto.jurosCom) + ' (sem adiantamento ' + fmt(out.apto.jurosSem) + ')');
{
  const mi0 = apto.months; let eP = 0, eB = 0, nP = 0;
  let acum = 0;                                   // principal pago (parcela + adiantamento)
  const dB = [];
  for (let mi = mi0; mi <= ULT; mi++) {
    const k = mi - mi0, l = aptoT[k], f = mesBy.get(mi).fluxo;
    const expPay = l ? l.pay + l.extra : 0;
    eP = Math.max(eP, Math.abs((f.out_fix_apto_compra || 0) - expPay)); nP++;
    if (l) acum += l.amort + l.extra;
    // bens do motor = moto 16.000 + entrada 60.000 + principal já amortizado
    const expBens = moto.mercado + apto.amount + acum;
    dB.push(mesBy.get(mi).fim.bens - expBens);
  }
  conf('C7', 'Apartamento: parcela mensal que sai no fluxo = Price(240.000; 0,7974% a.m.; 360x) = 2.030,14, e +10.000 no mi 72', 'tabela própria x out_fix_apto_compra', nP + ' meses (mi 60..878)', eP, eP < TOL, 'parcela ' + fmt(aptoT[0].pay) + '; mi 72 ' + fmt(mesBy.get(72).fluxo.out_fix_apto_compra));
  conf('C8', 'Apartamento: bens no balanço = moto + entrada + principal amortizado (patrimônio líquido do bem) em todo o prazo', 'bens esperado = 16.000 + 60.000 + soma(amortização + adiantamento)', nP + ' meses', maxAbs(dB), maxAbs(dB) < TOL, 'final ' + fmt(mesBy.get(ULT).fim.bens));
  const ultMi = mi0 + aptoT.length - 1;
  const evQuit = X.eventos.find(e => /apartamento quitado/.test(e.label));
  const miQuit = S.weeks[evQuit.week].mi;
  conf('C9', 'Quitação final do apartamento: última parcela e mês do marco "Financiamento quitado"', 'tabela própria', 'prazo encurtado ' + aptoSem.length + ' -> ' + aptoT.length, Math.abs(miQuit - ultMi), miQuit === ultMi, 'última parcela mi ' + ultMi + ' (' + rot(ultMi) + '), valor ' + fmt(aptoT[aptoT.length - 1].pay));
  out.miQuitApto = ultMi;
  out.aptoDivida = (mi) => { const k = mi - mi0; return k < 0 ? 0 : k >= aptoT.length ? 0 : aptoT[k].saldo; };
  // juros = soma(parcelas) - principal
  const totPago = aptoT.reduce((a, l) => a + l.pay + l.extra, 0);
  conf('C10', 'Apartamento: juros pagos = soma(parcelas+adiantamento) - principal financiado', 'tabela própria', '1 contrato', Math.abs(totPago - aptoF - out.apto.jurosCom), Math.abs(totPago - aptoF - out.apto.jurosCom) < 0.01, 'juros ' + fmt(out.apto.jurosCom) + '; economia do adiantamento ' + fmt(out.apto.jurosSem - out.apto.jurosCom));
  // fim.div do motor não inclui a dívida do apartamento (modelagem de patrimônio líquido)
  const m61 = mesBy.get(61); out.divApto61 = out.aptoDivida(61); out.divMotor61 = m61.fim.div;
}

// ================================================================== D. CAIXINHAS
secao('D. Caixinhas');
function taxaEsperada(o) {   // regra P3 escrita aqui
  const base = o.rateM != null && o.rateM !== '' ? +o.rateM : PROF[o.profile], cons = Math.min(base, PROF.conservador), t = Math.max(0, Math.round(o.months) - 24);
  return mi => (t <= 0 || base === cons) ? cons : (mi >= t ? cons : base);
}
function auditaCaixinhas(pl, Sx, Xx, rotulo) {
  const resu = [];
  const ligados = pl.objectives.filter(o => o.ligado !== false);
  ligados.forEach((o, k) => {
    const tx = taxaEsperada(o), id = o.id;
    // taxaPorMes do extrato x esperada
    const tpm = Xx.objetivos[k].taxaPorMes; let eT = 0, troca = null;
    tpm.forEach((v, mi) => { eT = Math.max(eT, Math.abs(v - tx(mi))); if (troca == null && mi > 0 && v !== tpm[0]) troca = mi; });
    // recursão semanal: duas convenções de mês (a do motor: mês da semana anterior; e a do mês da própria semana)
    let eLag = 0, eCur = 0, nSem = 0, difSem = 0; const taxaInfer = [];
    const wk = Sx.weeks, w0 = Xx.W0;
    for (let i = w0; i < wk.length; i++) {
      const prev = wk[i - 1].obj[k], flow = wk[i].f['mov_obj_' + id] || 0, now = wk[i].obj[k];
      const mLag = Math.max(0, wk[i - 1].mi), mCur = Math.max(0, wk[i].mi);
      const a = prev * Math.pow(1 + tx(mLag), GWK) + flow, b = prev * Math.pow(1 + tx(mCur), GWK) + flow;
      eLag = Math.max(eLag, Math.abs(now - a)); eCur = Math.max(eCur, Math.abs(now - b)); nSem++;
      if (Math.abs(a - b) > 1e-9) difSem++;
      if (prev > 1) taxaInfer.push({ i, mi: wk[i].mi, r: Math.pow((now - flow) / prev, 1 / GWK) - 1 });
    }
    // primeira semana com a taxa conservadora (inferida) depois da moderada
    let trocaSem = null; const rB = tx(0);
    if (taxaInfer.length) for (let j = 1; j < taxaInfer.length; j++) if (Math.abs(taxaInfer[j - 1].r - taxaInfer[j].r) > 1e-6) { trocaSem = { sem: taxaInfer[j].i, mi: taxaInfer[j].mi, de: taxaInfer[j - 1].r, para: taxaInfer[j].r }; break; }
    resu.push({ id, eT, troca, eLag, eCur, nSem, difSem, trocaSem });
  });
  return resu;
}
{
  const r = auditaCaixinhas(plano, S, X);
  r.forEach(x => {
    conf('D1-' + x.id, 'Caixinha ' + x.id + ': taxa de cada mês (taxaPorMes) = a que deveria valer (perfil antes dos últimos 24 meses; conservadora depois)', 'regra P3 escrita aqui x X.objetivos[].taxaPorMes', (x.id === 'apto' ? 61 : x.id === 'notebook' ? 13 : 6) + ' meses', x.eT, x.eT < 1e-12, 'troca de taxa no mês ' + (x.troca == null ? 'nenhuma' : x.troca + ' (' + rot(x.troca) + ')'));
    conf('D2-' + x.id, 'Caixinha ' + x.id + ': saldo semana a semana = saldo(i-1)*(1+taxa)^(7/30,4375) + mov_obj (taxa do mês da semana anterior, como o motor)', 'recursão independente com os fluxos observados', x.nSem + ' semanas', x.eLag, x.eLag < TOL);
    console.log('   (' + x.id + ') se a taxa fosse a do mês da própria semana: erro máx ' + fmt(x.eCur) + ' em ' + x.difSem + ' semanas de virada de mês' + (x.trocaSem ? '; troca inferida na semana ' + x.trocaSem.sem + ' (mi ' + x.trocaSem.mi + '): ' + (x.trocaSem.de * 100).toFixed(3) + '% -> ' + (x.trocaSem.para * 100).toFixed(3) + '%' : ''));
  });
  out.cx = r;
  // valores de PROFILES
  conf('D3', 'Valores de PROFILES do extrato = perfis do plano (0,4% / 0,5% / 0,6%)', 'comparação direta', '3 perfis', Math.abs(X.PROFILES.conservador - PROF.conservador) + Math.abs(X.PROFILES.moderado - PROF.moderado) + Math.abs(X.PROFILES.agressivo - PROF.agressivo), JSON.stringify(X.PROFILES) === JSON.stringify(PROF));
}
// ---- impacto de rodar o apto o tempo todo numa só taxa; saque na data
const wkApto = (() => { const k = 2; const wk = S.weeks; let iRed = null; for (let i = W0; i < wk.length; i++) if ((wk[i].f.mov_obj_apto || 0) < -1000) { iRed = i; break; } return { k, iRed }; })();
function saldoApto(rateFn, ate) {
  const wk = S.weeks; let b = 0;
  for (let i = W0; i < ate; i++) { const mLag = Math.max(0, wk[i - 1].mi); b = b * Math.pow(1 + rateFn(mLag), GWK) + (wk[i].f.mov_obj_apto || 0); }
  const mLag = Math.max(0, wk[ate - 1].mi);
  return b * Math.pow(1 + rateFn(Math.max(0, wk[ate].mi >= 0 ? wk[ate - 1].mi : mLag)), GWK);   // crescimento da semana do saque (antes do saque)
}
{
  const iR = wkApto.iRed, wk = S.weeks;
  const motor = saldoApto(taxaEsperada(apto), iR), mod = saldoApto(() => PROF.moderado, iR), cons = saldoApto(() => PROF.conservador, iR);
  const sacado = -wk[iR].f.mov_obj_apto;
  out.apto60 = { sacado, motor, mod, cons, semana: iR, mi: wk[iR].mi };
  conf('D4', 'Apto: valor sacado da caixinha na data (mi 60) = saldo recalculado com a regra de taxa', 'recursão semanal x -mov_obj_apto', 'semana ' + iR, Math.abs(sacado - motor), Math.abs(sacado - motor) < TOL, 'sacado ' + fmt(sacado));
  console.log('Apto no mi 60 com os MESMOS aportes: regra do motor ' + fmt(motor) + ' | tudo moderado ' + fmt(mod) + ' (+' + fmt(mod - motor) + ') | tudo conservador ' + fmt(cons) + ' (' + fmt(cons - motor) + ')');
  // consumo na data: curso e notebook
  [['ingles', 5, 6000], ['notebook', 12, 7000]].forEach(([id, mi, val]) => {
    const f = mesBy.get(mi).fluxo, k = id === 'ingles' ? 0 : 1; const sac = -f['mov_obj_' + id];
    const prevEnd = mesBy.get(mi - 1).fim.obj[k];
    const e = Math.abs((f['out_obj_' + id] || 0) - val);
    conf('D5-' + id, 'Objetivo ' + id + ': consumo na data = ' + fmt(val) + ' e caixinha devolvida à reserva (' + fmt(sacado && sac) + ')', 'out_obj_* x valor do plano; caixinha cai a zero no mesmo mês', 'mi ' + mi + ' (' + rot(mi) + ')', e, e < TOL && mesBy.get(mi).fim.obj[k] === 0, 'saldo do mês anterior ' + fmt(prevEnd) + ', devolvido ' + fmt(sac));
  });
}
// ---- fórmulas de aporte necessário (conferência dos "required")
{
  const rf = o => taxaEsperada(o);
  const fator = (o, de) => { const n = o.months; let A = 0, g = 1; for (let m = n - 1; m >= de; m--) { /* aporte feito no fim do mês m, rende de m+1 a n */ let gg = 1; for (let q = m + 1; q < n; q++) gg *= 1 + rf(o)(q); A += gg; } return A; };
  const ap = o => ({ id: o.id, req: o.amount / fator(o, Math.max(0, Math.min(o.months - 1, o.aporteDe || 0))) });
  const reqs = OBJ.map(ap); const exp = X.objetivos.map(o => o.required);
  const e = reqs.map((r, k) => Math.abs(r.req - exp[k]));
  out.req = reqs;
  conf('D6', 'Aporte mensal necessário de cada objetivo (valor/fator de anuidade com a taxa de cada mês, aporte no fim do mês, desde aporteDe)', 'anuidade própria x X.objetivos[].required', '3 objetivos', maxAbs(e), maxAbs(e) < 0.5, reqs.map(r => r.id + ' ' + fmt(r.req)).join(' | ') + ' [cenário: inglês 1.190, notebook 571]');
  // reprodução do 785/mês do cenário (FGTS 14.000 no mi 24, aporte do mi 10 ao 60)
  const g12 = Math.pow(1 + PROF.moderado, 12), g24 = Math.pow(1 + PROF.conservador, 24), fgts60 = 14000 * g12 * g24;
  const A = fator(apto, 10) , aFgts = (apto.amount - fgts60) / A;
  out.cenario785 = { fgts60, fator: A, aporte: aFgts };
  console.log('Cenário "785": FGTS 14.000 no mi 24 rende 36 meses = ' + fmt(fgts60) + '; fator de anuidade mi 10..59 = ' + A.toFixed(3) + '; aporte = ' + fmt(aFgts) + ' (cenário: 16.358, 55,613, 785)');
}
// ---- a regra "para de aportar quando a caixinha já basta": confere o que a simulação de fato juntou
{
  const o = apto, tx = taxaEsperada(o); const meses = [];
  let ociosoMax = 0, mesesParado = 0, primeiro = null, ultimoAporte = null;
  for (let mi = 24; mi < 60; mi++) {
    const m = mesBy.get(mi), saldo = m.fim.obj[2], ap = m.fluxo.mov_obj_apto || 0;
    let g = 1; for (let q = mi + 1; q < 60; q++) g *= 1 + tx(q);          // do fim do mês mi até a data (mi 60)
    const projNaData = saldo * g, falta = o.amount - projNaData;
    if (ap > 0.5) ultimoAporte = mi;
    if (ap < 0.5 && falta > 1 && m.fim.cofre > 1000) { mesesParado++; if (primeiro == null) primeiro = mi; ociosoMax = Math.max(ociosoMax, m.fim.cofre); meses.push({ mi, falta, cofre: m.fim.cofre }); }
  }
  out.parada = { primeiro, mesesParado, ociosoMax, ultimoAporte, faltaFinal: o.amount - X.objetivos[2].real };
  conf('D7', 'Regra de aporte: a caixinha só deixa de receber quando o saldo, rendendo até a data, já cobre o valor', 'projeção própria saldo*crescimento até mi 60 x aportes observados', 'mi 24..59', out.parada.faltaFinal, out.parada.faltaFinal < 1, 'último aporte no mi ' + ultimoAporte + '; ' + mesesParado + ' meses sem aporte com a caixinha abaixo da meta e a reserva com mais de R$ 1.000; falta final ' + fmt(out.parada.faltaFinal) + '; reserva ociosa chega a ' + fmt(ociosoMax));
  // custo de rendimento do dinheiro parado: aportes que teriam ido ao apto (sobra mensal) rendendo 0,5% (até mi 36) em vez de 0,4%
  let custo = 0, aportado = 0; const faltaIni = o.amount - 0;
  let saldoCf = mesBy.get(27).fim.obj[2];                       // mantém a conta simples: recomeça do saldo observado do mi 27
  const faltaTotal = out.parada.faltaFinal; let resta = faltaTotal;
  for (let mi = 28; mi < 60 && resta > 0.5; mi++) {
    const m = mesBy.get(mi), disp = m.fluxo.mov_cofre || 0;
    let gA = 1, gC = 1; for (let q = mi + 1; q < 60; q++) { gA *= 1 + tx(q); gC *= 1 + T; }
    const ap = Math.min(Math.max(0, disp), resta / gA);        // aporte que faltava, trazido a valor do mês
    custo += ap * (gA - gC); aportado += ap; resta -= ap * gA;
  }
  out.custoParada = { custo, aportado };
  console.log('Contrafactual: se os aportes de mi 28.. tivessem continuado até a meta, o ganho de rendimento (0,5%/0,4% da caixinha contra 0,4% da reserva) seria ' + fmt(custo) + ' (aportado ' + fmt(aportado) + ')');
}
// ---- espelho do programa de aportes x simulação: aportes feitos e desfeitos (reserva negativa)
{
  const H2 = E; const p = S.programa; let planejado = 0; const feito = {}, planej = {};
  // aportes planejados (programa) x líquido na simulação por objetivo, até o mi 27
  const dataDe = { ingles: 5, notebook: 12, apto: 28 };   // só os meses antes da data de cada objetivo (sem o saque da data)
  ['ingles', 'notebook', 'apto'].forEach(id => { planej[id] = (p.por[id] || []).slice(0, dataDe[id]).reduce((a, b) => a + b, 0); feito[id] = Array.from({ length: dataDe[id] }, (_, mi) => (mesBy.get(mi) ? (mesBy.get(mi).fluxo['mov_obj_' + id] || 0) : 0)).reduce((a, b) => a + b, 0); });
  out.espelho = { planej, feito };
  const dApto = planej.apto - feito.apto;
  console.log('Programa x simulação (mi 0..27, soma dos aportes): apto planejado ' + fmt(planej.apto) + ' x líquido na simulação ' + fmt(feito.apto) + ' (diferença ' + fmt(dApto) + '); notebook ' + fmt(planej.notebook) + ' x ' + fmt(feito.notebook) + '; inglês ' + fmt(planej.ingles) + ' x ' + fmt(feito.ingles));
  // meses em que a reserva fechou negativa e um aporte planejado foi desfeito
  const desfeitos = []; for (let mi = 0; mi < 28; mi++) { const m = mesBy.get(mi); if (!m) continue; ['ingles', 'notebook', 'apto'].forEach(id => { if (mi >= dataDe[id]) return; const pl = (p.por[id] || [])[mi] || 0, fe = m.fluxo['mov_obj_' + id] || 0; if (pl - fe > 1 && fe < pl) desfeitos.push({ mi, id, planejado: pl, liquido: fe }); }); }
  out.desfeitos = desfeitos;
  desfeitos.forEach(d => console.log('   aporte planejado desfeito: mi ' + d.mi + ' ' + d.id + ' planejado ' + fmt(d.planejado) + ' líquido ' + fmt(d.liquido)));
}

// ================================================================== E. RENDIMENTO DO FINANCEIRO
secao('E. Rendimento da reserva / patrimônio financeiro');
{
  // taxa implícita semanal da reserva quando positiva
  let eR = 0, n = 0, soma = 0;
  for (let i = W0 + 1; i < NW; i++) { const c0 = S.weeks[i - 1].cofre; if (c0 > 1000) { const f = S.weeks[i].f.mov_cofre || 0; const r = Math.pow((S.weeks[i].cofre - f) / c0, 1 / GWK) - 1; eR = Math.max(eR, Math.abs(r - T)); n++; } }
  conf('E1', 'Taxa aplicada à reserva = 0,4% a.m. em toda semana com saldo positivo > R$ 1.000 (inferida de saldo e fluxo)', 'taxa implícita = ((saldo - mov)/saldo anterior)^(30,4375/7) - 1', n + ' semanas', eR, eR < 1e-9);
  // reserva negativa não rende e paga 4% uma vez por mês
  let eJ = 0, nJ = 0, totJ = 0;
  for (let mi = 1; mi <= ULT; mi++) {
    const mAnt = mesBy.get(mi - 1); if (!mAnt) continue;
    const m = mesBy.get(mi), cAnt = mAnt.fim.cofre;
    const expJ = cAnt < -0.5 ? -cAnt * JUROS_DIV : 0;
    eJ = Math.max(eJ, Math.abs((m.fluxo.out_juros || 0) - expJ)); totJ += m.fluxo.out_juros || 0; nJ++;
  }
  out.totJuros = totJ;
  conf('E2', 'Juros de 4% a.m. cobrados uma vez por mês sobre a reserva negativa do fim do mês anterior (e nenhum outro mês)', 'out_juros x 4% * -reserva(mi-1)', nJ + ' meses', eJ, eJ < TOL, 'total pago em juros da reserva negativa: ' + fmt(totJ));
  // convenção: o rendimento entra antes dos fluxos da semana
  console.log('Convenção: saldo da semana i = saldo(i-1)*(1,004)^(7/30,4375) + lançamentos da semana i (rendimento antes dos fluxos; um mês de 5 semanas rende 15% mais dias que um de 4).');
  // ponte independente, mês a mês, do mi 60 em diante, só com o plano (sem usar nenhum fluxo observado)
  const fin60 = mesBy.get(60).fim.fin; let lo = fin60, hi = fin60, mi = 61;
  const apt = mi2 => { const k = mi2 - 60; return k < aptoT.length ? aptoT[k].pay + aptoT[k].extra : 0; };
  const entradas = mi2 => salEm(mi2) + (((mi2 % 12) === 2) ? salEm(mi2) : 0);
  const saidas = mi2 => 2200 + apt(mi2);
  const G = 1 + T;
  for (; mi <= 421; mi++) { const net = entradas(mi) - saidas(mi) + (mi >= 421 ? 3800 : 0); lo = lo * G + net; hi = (hi + net) * G; }
  const obs421 = mesBy.get(421).fim.fin;
  out.ponte = { lo, hi, obs421, fin60 };
  conf('E3', 'Ponte independente do financeiro no mi 421 (aos 61,9 anos): saldo do mi 60 evoluído só com o plano (salário, 13º, 2.200 de gastos, parcelas do apto) a 0,4% a.m., fluxos no começo (teto) ou no fim (piso) do mês', 'duas pontas de uma conta mensal x fin observado', 'mi 60 -> 421 (361 meses)', obs421 < lo ? lo - obs421 : obs421 > hi ? obs421 - hi : 0, obs421 >= lo * 0.999 && obs421 <= hi * 1.001, 'piso ' + fmt(lo) + ' | observado ' + fmt(obs421) + ' | teto ' + fmt(hi));
}

// ================================================================== A5. patrimônio líquido: conciliação mensal
{
  const wk = S.weeks; let e5 = 0, n5 = 0, pior = null;
  const NWm = m => m.fim.fin + m.fim.bens + m.fim.part + m.fim.prev - m.fim.div;
  const divEsp = mi => saldoRepl(motoL, kM, escM, mi) + saldoRepl(cartL, kC, escC, mi);
  for (let mi = 2; mi <= ULT - 1; mi++) {
    const m = mesBy.get(mi), ant = mesBy.get(mi - 1);
    let inn = 0, outt = 0; for (const k in m.fluxo) { if (k.startsWith('in_')) inn += m.fluxo[k]; else if (k.startsWith('out_')) outt += m.fluxo[k]; }
    // rendimentos esperados do mês: soma semanal pela recursão própria
    let Y = 0; for (let i = m.w0; i < m.w1; i++) { if (i < W0 + 1) continue; const c0 = wk[i - 1].cofre; if (c0 > 0) Y += c0 * (GW - 1); wk[i].obj.forEach((_, k) => { const id = OBJ[k].id; const prev = wk[i - 1].obj[k], mLag = Math.max(0, wk[i - 1].mi); Y += prev * (Math.pow(1 + taxaEsperada(OBJ[k])(mLag), GWK) - 1); }); }
    const amortApto = mi >= 60 && mi - 60 < aptoT.length ? aptoT[mi - 60].amort + aptoT[mi - 60].extra : 0;
    const dPrev = mi === 24 ? -14000 : 0;
    const dDiv = divEsp(mi) - divEsp(mi - 1);
    const esperado = (inn - outt) + Y + amortApto + dPrev - dDiv;
    const obs = NWm(m) - NWm(ant);
    const d = Math.abs(obs - esperado); if (d > e5) { e5 = d; pior = mi; } n5++;
  }
  conf('A5', 'Patrimônio líquido (financeiro + bens + participações + previdência - dívidas): variação do mês = entradas - saídas + rendimentos (recalculados) + amortização do apto (tabela própria) + variação da previdência - variação da dívida (tabelas próprias)', 'conciliação mensal independente', n5 + ' meses (mi 2..' + (ULT - 1) + ')', e5, e5 < 0.05, 'pior mês ' + pior);
  out.NW = [0, 1, 5, 12, 24, 36, 60, 72, 120, 240, 359, 421, 423, 600, 878].map(mi => [mi, mesBy.get(mi) ? R2(NWm(mesBy.get(mi))) : null]);
}

// ================================================================== B. PARTICIPAÇÕES
secao('B. Participações societárias');
{
  const lista = X.parts.length, partMax = X.meses.reduce((a, m) => Math.max(a, Math.abs(m.fim.part), m.fim.det.parts.length), 0);
  const evV = X.eventos.filter(e => e.type === 'venda' || e.type === 'valoriza').length;
  let chv = 0; X.meses.forEach(m => { for (const k in m.fluxo) if (/vendap|mov_part/.test(k)) chv++; });
  conf('B0', 'O plano 06 não tem participação societária: nenhuma série, nenhum saldo em part, nenhuma venda/valorização, nenhuma linha vendap_*', 'varredura do extrato', X.meses.length + ' meses', lista + partMax + evV + chv, lista + partMax + evV + chv === 0, 'parts[]=0, part=0 em todos os meses, eventos venda/valoriza=0');
}
// Teste de estresse (fora do plano do Lucas): o mesmo motor com participações inventadas, contra a série esperada recalculada aqui
function serieEsperada(p, fim) {
  // regra de valorização (dado do consultor): taxa % a.a. composta mensalmente na janela [de, de+anos*12); alvo: ritmo geométrico até o valor
  // esperado no mês em (refeito a cada mês, depois de saltos); pontual: salto em % ou R$ no mês em; nunca abaixo de zero
  const ev = p.valorizacao || []; let v = p.valor; const s = [v];
  const alvos = ev.filter(e => e.tipo === 'alvo' && e.valor != null).map(e => ({ em: e.em, valor: Math.max(0, e.valor) })).sort((a, b) => a.em - b.em);
  for (let m = 1; m <= fim; m++) {
    const a = alvos.find(x => x.em >= m);
    if (a) v = v > 0 && a.valor > 0 ? v * Math.pow(a.valor / v, 1 / (a.em - m + 1)) : v + (a.valor - v) / (a.em - m + 1);
    else ev.forEach(e => { if (e.tipo !== 'taxa') return; const de = e.de || 0, ate = de + (e.anos != null ? e.anos : 10) * 12; if (m - 1 >= de && m - 1 < ate) v *= Math.pow(1 + e.pct / 100, 1 / 12); });
    ev.forEach(e => { if (e.tipo === 'pontual' && e.em === m) v = Math.max(0, e.pct != null ? v * (1 + e.pct / 100) : v + e.valor); });
    s.push(v);
  }
  return s;
}
let ST_P = null;
{
  const pl = JSON.parse(JSON.stringify(plano));
  const parts = [
    { nome: 'Empresa A (taxa + saltos + venda)', valor: 100000, valorizacao: [{ tipo: 'taxa', pct: 8, de: 0, anos: 10 }, { tipo: 'pontual', em: 12, pct: 20, motivo: 'rodada' }, { tipo: 'pontual', em: 18, valor: -15000, motivo: 'perda' }],
      venda: { em: 30, custos: [{ nome: 'corretagem', pct: 3 }, { nome: 'advogado', valor: 2000 }], destinos: [{ objetivo: 'apto' }] } },
    { nome: 'Empresa B (alvo)', valor: 50000, valorizacao: [{ tipo: 'alvo', em: 24, valor: 120000 }] },
    { nome: 'Empresa C (queda a zero)', valor: 80000, valorizacao: [{ tipo: 'taxa', pct: -25, de: 0, anos: 10 }, { tipo: 'pontual', em: 40, pct: -100 }, { tipo: 'pontual', em: 50, valor: -999999 }] },
    { nome: 'Empresa D (preço de venda informado)', valor: 100000, valorizacao: [], venda: { em: 36, preco: 200000, custos: [{ nome: 'imposto', pct: 5 }], destinos: [{ objetivo: 'apto', valor: 20000 }] } },
    { nome: 'Empresa E (taxa pura)', valor: 60000, valorizacao: [{ tipo: 'taxa', pct: 12, de: 6, anos: 5 }] },
  ];
  pl.patrimonio.participacoes = parts;
  const { x, s } = rodar(pl);
  ST_P = { x, s, parts };
  // B1: séries do motor x esperadas
  parts.forEach((p, k) => {
    const fim = p.venda ? p.venda.em : 120; const sp = p.venda && p.venda.preco != null ? Object.assign({}, p, { valorizacao: (p.valorizacao || []).concat({ tipo: 'alvo', em: p.venda.em, valor: p.venda.preco }) }) : p;
    const exp = serieEsperada(sp, fim); let e = 0; for (let m = 0; m <= fim; m++) e = Math.max(e, Math.abs(x.parts[k].serie[m] - exp[m]));
    // fim.det.parts mês a mês: para cada mês, o valor que o motor lança no balanço (último valor antes da venda; zero depois)
    let eD = 0, nD = 0;
    for (let mi = 1; mi <= 119; mi++) { const m = x.meses.find(q => q.mi === mi); const vend = p.venda && mi >= p.venda.em; const esp = vend ? 0 : exp[Math.min(mi, exp.length - 1)]; eD = Math.max(eD, Math.abs(m.fim.det.parts[k] - esp)); nD++; }
    conf('B1-' + 'ABCDE'[k], p.nome + ': série mensal do valor (parts[].serie) = regra recalculada aqui', 'taxa/alvo/pontual passo a passo' + (!p.venda && !(p.valorizacao || []).some(v => v.tipo !== 'taxa') ? ' + fórmula fechada' : ''), (fim + 1) + ' meses', e, e < TOL);
    conf('B2-' + 'ABCDE'[k], p.nome + ': balanço mês a mês (fim.det.parts) = série esperada; zero depois da venda', 'x.meses[].fim.det.parts[k]', nD + ' meses', eD, eD < TOL);
  });
  // fórmulas fechadas
  { const E1 = x.parts[4].serie; let e = 0; for (let m = 0; m <= 120; m++) { const meses = Math.max(0, Math.min(m, 6 + 60) - 6); e = Math.max(e, Math.abs(E1[m] - 60000 * Math.pow(1.12, meses / 12))); }
    conf('B3', 'Empresa E: fórmula fechada 60.000*(1,12)^(meses efetivos/12), janela de 5 anos a partir do mês 6', 'fechada x motor', '121 meses', e, e < TOL);
    const B = x.parts[1].serie; let eB = 0; for (let m = 0; m <= 24; m++) eB = Math.max(eB, Math.abs(B[m] - 50000 * Math.pow(120000 / 50000, m / 24)));
    conf('B4', 'Empresa B: fórmula fechada do alvo 50.000*(120.000/50.000)^(m/24); depois do alvo a taxa não existe, o valor fica', 'fechada x motor', '25 meses + permanência', eB, eB < TOL, 'valor no mês 60: ' + fmt(B[60]) + ' (esperado ' + fmt(120000) + ')');
    const C = x.parts[2].serie; let neg = 0; C.forEach(v => { if (v < 0) neg++; });
    conf('B5', 'Empresa C: cai a zero no mês 40 e continua em zero; salto de -999.999 não deixa negativo', 'varredura da série', C.length + ' meses', neg + Math.abs(C[40]) + Math.abs(C[50]) + Math.abs(C[119]), neg === 0 && C[40] === 0 && C[50] === 0 && C[119] === 0); }
  // B6 venda: preço, custos, líquido, saída da participação, entrada no financeiro e destino
  const venda = (k, em) => {
    const p = parts[k], tr = x.parts[k].venda, mes = x.meses.find(q => q.mi === em), ant = x.meses.find(q => q.mi === em - 1);
    const sp = p.venda.preco != null ? Object.assign({}, p, { valorizacao: (p.valorizacao || []).concat({ tipo: 'alvo', em: p.venda.em, valor: p.venda.preco }) }) : p;
    const serie = serieEsperada(sp, em);
    const preco = p.venda.preco != null ? p.venda.preco : serie[em];
    const custos = p.venda.custos.reduce((a, c) => a + (c.pct != null ? preco * c.pct / 100 : c.valor), 0), liquido = preco - custos;
    const f = mes.fluxo;
    const dest = p.venda.destinos[0], usado = dest.valor != null ? Math.min(dest.valor, liquido) : liquido;
    const e = [Math.abs(tr.preco - preco), Math.abs(tr.custo - custos), Math.abs(tr.liquido - liquido), Math.abs((f['out_vendap_' + k] || 0) - custos), Math.abs((f.mov_bens || 0) + preco), Math.abs((f.mov_obj_apto || 0) - usado - (k === 0 ? 0 : 0))];
    return { preco, custos, liquido, usado, e, moto: f, tr, partSaiu: ant.fim.part - mes.fim.part };
  };
  const vA = venda(0, 30), vD = venda(3, 36);
  // as duas vendas não caem no mesmo mês; mov_obj_apto do mês inclui aporte normal? (apto recebe aportes só até onde falta)
  conf('B6-A', 'Venda da Empresa A (mi 30, preço = valor projetado): preço, custos (3% + 2.000), líquido, custos no fluxo (out_vendap), saída em mov_bens = -preço', 'recalculo próprio', 'mi 30', maxAbs(vA.e.slice(0, 5)), maxAbs(vA.e.slice(0, 5)) < TOL, 'preço ' + fmt(vA.preco) + '; custos ' + fmt(vA.custos) + '; líquido ' + fmt(vA.liquido));
  conf('B6-D', 'Venda da Empresa D (mi 36, preço informado 200.000, custo 5%): idem', 'recalculo próprio', 'mi 36', maxAbs(vD.e.slice(0, 5)), maxAbs(vD.e.slice(0, 5)) < TOL, 'preço ' + fmt(vD.preco) + '; custos ' + fmt(vD.custos) + '; líquido ' + fmt(vD.liquido));
  // destino do líquido: apto recebe (A: todo o líquido; D: 20.000), resto no financeiro
  const apA = x.meses.find(q => q.mi === 30).fluxo.mov_obj_apto, apD = x.meses.find(q => q.mi === 36).fluxo.mov_obj_apto;
  console.log('   destino: mi 30 mov_obj_apto = ' + fmt(apA) + ' (líquido da venda A ' + fmt(vA.liquido) + ' + aporte do mês); mi 36 mov_obj_apto = ' + fmt(apD) + ' (venda D: 20.000 destinados + aporte do mês)');
  ST_P.destA = { apA, liquidoA: vA.liquido, apD };
  // saída da participação do balanço no mês da venda: part cai o valor do mês anterior
  const depois = x.meses.filter(q => q.mi >= 31 && q.mi <= 119).every(q => q.fim.det.parts[0] === 0) && x.meses.filter(q => q.mi >= 37 && q.mi <= 119).every(q => q.fim.det.parts[3] === 0);
  conf('B7', 'Depois da venda a participação é zero em todos os meses seguintes (A e D)', 'varredura de fim.det.parts', 'mi 31..119 e 37..119', 0, depois);
  // B8: conciliação do patrimônio na venda: NW sobe pela valorização do mês e cai pelos custos
  const NWx = m => m.fim.fin + m.fim.bens + m.fim.part + m.fim.prev - m.fim.div;
  const mA = x.meses.find(q => q.mi === 30), aA = x.meses.find(q => q.mi === 29), serieA = serieEsperada(parts[0], 30);
  console.log('   conciliação da venda A: Δ part ' + fmt(mA.fim.part - aA.fim.part) + ' (inclui as demais participações); preço entra em mov_cofre; part total sai do balanço ao valor do mês anterior ' + fmt(serieA[29]) + ' enquanto o preço usa o valor do mês da venda ' + fmt(serieA[30]));
}

// ================================================================== TESTE DE ESTRESSE: venda de bem financiado (quitação)
secao('Teste de estresse: venda do bem com saldo devedor');
{
  const pl = JSON.parse(JSON.stringify(plano));
  pl.patrimonio.bens[0].venda = { em: 10, custos: [{ nome: 'transferência', valor: 300 }], destinos: [] };
  const { x, s } = rodar(pl);
  const mes = x.meses.find(q => q.mi === 10), ant = x.meses.find(q => q.mi === 9);
  const quitMotor = mes.fluxo.out_quita_0 || 0;
  const B9 = saldoRepl(motoL, kM, escM, 9), B10 = saldoRepl(motoL, kM, escM, 10), i = motoL.i;
  const parc10 = mes.fluxo.out_fix_parc_moto || 0;
  // o certo: sem a parcela do mês 10, quitar o saldo do fim do mês 9 mais os juros do mês (B9*(1+i)); com a parcela, B10.
  const quitSemParcela = B9 * (1 + i), quitComParcela = B10;
  out.stVenda = { quitMotor, B9, B10, parc10, devidoSemParcela: quitSemParcela, falta: quitSemParcela - (quitMotor + parc10) };
  conf('V1', 'Venda da moto no mi 10: quitação lançada (out_quita) = saldo devedor após a parcela 10 de uma tabela própria', 'tabela Price recalculada', 'mi 10', Math.abs(quitMotor - B10), Math.abs(quitMotor - B10) < TOL, 'out_quita ' + fmt(quitMotor) + '; parcela do mês 10 no fluxo: ' + fmt(parc10));
  conf('V2', 'Venda da moto no mi 10: o cliente desembolsa no mês da venda o que deve (parcela do mês + saldo após a parcela = B9*(1+i)) e não menos', 'devido = B9*(1+i) = ' + fmt(quitSemParcela) + ' x (parcela do mês + quitação)', 'mi 10', quitSemParcela - (quitMotor + parc10), (quitMotor + parc10) >= quitSemParcela - 0.01, 'pago ' + fmt(quitMotor + parc10) + ' x devido ' + fmt(quitSemParcela) + ' (perdoa ' + fmt(quitSemParcela - quitMotor - parc10) + ')');
  conf('V3', 'Venda da moto: dívida do bem some do balanço e a parcela para', 'div do mi 10 em diante só o cartão; parcela do mi 10..22 = 0', 'mi 10..22', Math.abs(mes.fim.div - saldoRepl(cartL, kC, escC, 10)) + Math.abs([...Array(13).keys()].reduce((a, k) => a + (x.meses.find(q => q.mi === 10 + k).fluxo.out_fix_parc_moto || 0), 0)), Math.abs(mes.fim.div - saldoRepl(cartL, kC, escC, 10)) < 0.01);
}

// ================================================================== TESTE DE ESTRESSE: crédito novo
secao('Teste de estresse: crédito novo');
{
  const pl = JSON.parse(JSON.stringify(plano));
  pl.creditos = [{ id: 'emp', nome: 'Empréstimo pessoal', em: 20, valor: 20000, parcelas: 12, juros: 2, sistema: 'price', linha: 'parc_emp' }];
  const par = pmt(20000, 0.02, 12);
  pl.expenses.push({ id: 'parc_emp', label: 'Parcela: Empréstimo', group: 'fix', week: 1, frequency: 'mensal', days: [10], steps: [{ from: 21, value: par }, { from: 33, value: 0 }] });
  const { x } = rodar(pl);
  const tab = tabela(20000, 0.02, 12, false); let e = 0, n = 0;
  for (let mi = 18; mi <= 36; mi++) { const m = x.meses.find(q => q.mi === mi); const k = mi - 20; const esp = mi < 20 ? 0 : k === 0 ? 20000 : k > 12 ? 0 : tab[k - 1].saldo; e = Math.max(e, Math.abs(m.fim.det.divs[2] - esp)); n++; }
  const m20 = x.meses.find(q => q.mi === 20).fluxo;
  conf('K1', 'Crédito novo (20.000, 12x, 2% a.m., mi 20): saldo devedor mês a mês = tabela Price própria; entra em caixa no mi 20', 'tabela x fim.det.divs[2]', n + ' meses', e, e < TOL, 'in_credito_emp ' + fmt(m20.in_credito_emp || 0) + '; parcela ' + fmt(par));
  const f21 = x.meses.find(q => q.mi === 21).fluxo.out_fix_parc_emp;
  conf('K2', 'Crédito novo: parcela do fluxo = parcela do contrato nos 12 meses seguintes', 'out_fix_parc_emp x PMT', '12 meses', Math.abs(f21 - par) + [...Array(12).keys()].reduce((a, k) => a + Math.abs((x.meses.find(q => q.mi === 21 + k).fluxo.out_fix_parc_emp || 0) - par), 0), Math.abs(f21 - par) < 0.01);
}

// ================================================================== TESTE DE ESTRESSE: caixinha agressiva (troca de taxa)
secao('Teste de estresse: caixinha agressiva de 48 meses');
{
  const pl = JSON.parse(JSON.stringify(plano));
  pl.objectives.find(o => o.id === 'apto').profile = 'agressivo';
  pl.objectives.find(o => o.id === 'apto').months = 48;
  // a compra financiada passa a ocorrer no mi 48; a amortização do mi 72 vale
  const { x, s } = rodar(pl);
  const r = auditaCaixinhas(pl, s, x).find(q => q.id === 'apto');
  conf('D8', 'Agressivo (0,6%) por 24 meses e conservador (0,4%) nos 24 finais: taxaPorMes = esperada; troca no mês 24', 'regra P3 x taxaPorMes', '49 meses', r.eT, r.eT < 1e-12, 'troca no mês ' + r.troca);
  conf('D9', 'Agressivo: saldo semana a semana = recursão independente', 'recursão semanal', r.nSem + ' semanas', r.eLag, r.eLag < TOL, 'se a taxa fosse a do mês da própria semana: erro máx ' + fmt(r.eCur) + ' em ' + r.difSem + ' semana(s) de virada');
  out.agr = r;
}

// ================================================================== TESTE DE ESTRESSE: o aporte planejado que a simulação desfaz
secao('Teste de estresse: sonho de consumo maior (notebook de 25.000) com o mesmo cliente');
{
  const pl = JSON.parse(JSON.stringify(plano));
  pl.objectives.find(o => o.id === 'notebook').amount = 25000;
  const { x } = rodar(pl);
  const o = x.objetivos[2], m59 = x.meses.find(q => q.mi === 59), m60 = x.meses.find(q => q.mi === 60);
  const comprou = (m60.fluxo.mov_bens || 0) > 0;
  out.m1 = { real: o.real, razao: o.real / 60000, cofre59: m59.fim.cofre, comprou, bens60: m60.fim.bens };
  conf('M1', 'Com o notebook de 25.000 o apartamento deveria ser comprado: a reserva tem mais que os 60.000 da entrada no mi 59', 'reserva do mi 59 >= 60.000 => compra esperada; motor decide pela caixinha (< 70% = "não comprado")', 'mi 59-60', comprou ? 0 : m59.fim.cofre, comprou, 'caixinha ' + fmt(o.real) + ' (' + (o.real / 600).toFixed(1) + '%), reserva livre ' + fmt(m59.fim.cofre) + ', compra: ' + (comprou ? 'sim' : 'NÃO'));
}

// ================================================================== TESTE DE ESTRESSE: liberdade forçada e dívida
secao('Teste de estresse: liberdade financeira forçada (parar aos 29 sem dinheiro)');
{
  const pl = JSON.parse(JSON.stringify(plano)); pl.retireAge = 29;
  const { x } = rodar(pl); const ff = x.ff;
  const horizon = Math.round((plano.lifeExp - ff.age) * 12), gap = 5500;   // ainda sem INSS
  const inv = ff.finBefore, pmtEsp = pmt(inv, T, horizon), sustEsp = inv * T + (5500 - gap);
  conf('S1', 'Liberdade forçada: forced = verdadeiro porque o rendimento do patrimônio (' + fmt(inv * T) + ') < gap (' + fmt(gap) + '); pmt e sustentável recalculados', 'contas próprias', 'ff aos ' + ff.age.toFixed(1), Math.abs(ff.pmt - pmtEsp) + Math.abs(ff.sustentavel - sustEsp), ff.forced === true && Math.abs(ff.pmt - pmtEsp) < 0.01 && Math.abs(ff.sustentavel - sustEsp) < 0.01 && ff.maxGap === gap);
  // teto = 100 x renda média dos 12 primeiros meses
  let soma = 0; for (let mi = 0; mi < 12; mi++) soma += salEm(mi) + (mi % 12 === 2 ? salEm(mi) : 0);
  const TETO = 100 * soma / 12; let eJ = 0, n = 0, miTeto = null;
  const mb = new Map(x.meses.map(m => [m.mi, m]));
  for (let mi = ff.mi + 1; mi < 200; mi++) { const c = mb.get(mi - 1).fim.cofre; if (c >= -0.5) continue; const esp = Math.min(-c * JUROS_DIV, Math.max(0, TETO + c)); eJ = Math.max(eJ, Math.abs((mb.get(mi).fluxo.out_juros || 0) - esp)); n++; if (miTeto == null && c <= -TETO + 1) miTeto = mi; }
  conf('S2', 'Reserva negativa depois da liberdade: juros de 4% a.m. sobre a dívida até o teto de 100x a renda média (' + fmt(TETO) + '); a dívida não passa do teto', 'min(4% da dívida, o que falta para o teto) x out_juros', n + ' meses', eJ, eJ < TOL, 'dívida chega ao teto no mi ' + miTeto + '; mínimo da reserva ' + fmt(Math.min(...x.meses.map(m => m.fim.cofre))));
  out.s2 = { TETO, miTeto, inTeto: mb.get(200).fluxo.in_teto };
}

// ================================================================== F. FLUXO
secao('F. Fluxo de caixa');
let linhasInesperadas = new Set();
{
  const exp = (mi) => {
    const e = {}; if (mi < 1 || mi > 422) return e;
    e.in_salario = salEm(mi); if (mi % 12 === 2) e.in_dec13 = salEm(mi);
    if (mi < 60) e.out_fix_aluguel = 1700;
    e.out_fix_celular = 400; e.out_adj_alimentacao = 900; e.out_adj_transporte = 400; e.out_adj_lazer = 500;
    if (mi <= 22) e.out_fix_parc_moto = 718; if (mi <= 8) e.out_fix_parc_cartao = 780;
    if (mi === 5) e.out_obj_ingles = 6000; if (mi === 12) e.out_obj_notebook = 7000;
    if (mi === 24) e.in_pas_1 = 14000; if (mi >= 421) e.in_pas_0 = 3800;
    if (mi >= 60 && mi - 60 < aptoT.length) e.out_fix_apto_compra = aptoT[mi - 60].pay + aptoT[mi - 60].extra;
    const cAnt = mesBy.get(mi - 1).fim.cofre; if (cAnt < -0.5) e.out_juros = -cAnt * JUROS_DIV;
    return e;
  };
  let eMax = 0, pior = null, n = 0; const porLinha = {};
  for (let mi = 1; mi <= 422; mi++) {
    const f = mesBy.get(mi).fluxo, e = exp(mi), chaves = new Set([...Object.keys(e), ...Object.keys(f).filter(k => /^(in_|out_)/.test(k))]);
    chaves.forEach(k => { const o = f[k] || 0, x = e[k] || 0, d = Math.abs(o - x); if (d > 0.005 && x === 0 && o !== 0) linhasInesperadas.add(k + '@' + mi); porLinha[k] = Math.max(porLinha[k] || 0, d); if (d > eMax) { eMax = d; pior = k + ' mi ' + mi; } n++; });
  }
  conf('F1', 'Entradas e saídas de cada linha, mês a mês, contra o plano (salário com degrau em jul/2027 e 13º no mês certo seguindo o salário; aluguel até a compra; parcelas; consumo dos objetivos; FGTS; INSS; juros da reserva; parcela do apto)', 'valor esperado por linha e mês, recalculado do plano', '422 meses x ' + Object.keys(porLinha).length + ' linhas', eMax, eMax < TOL && linhasInesperadas.size === 0, 'pior: ' + (pior || '-') + '; linhas inesperadas: ' + (linhasInesperadas.size ? [...linhasInesperadas].slice(0, 5).join(', ') : 'nenhuma'));
  // meses de borda
  const bordas = [1, 2, 5, 8, 9, 12, 14, 22, 23, 24, 35, 36, 59, 60, 72, 359, 360, 421, 422];
  const linhas = bordas.map(mi => { const f = mesBy.get(mi).fluxo, e = exp(mi); let d = 0; Object.keys(e).forEach(k => d = Math.max(d, Math.abs((f[k] || 0) - e[k]))); return mi + '(' + d.toFixed(2) + ')'; });
  console.log('   meses de borda (erro máx): ' + linhas.join(' '));
  // sobra mensal e mês 0
  const mo = mesBy.get(0).fluxo;
  conf('F2', 'Mês 0 sem lançamentos (o mês já passou em 28/10) e primeira saída em nov/2026; déficit de -198 em nov e dez(+13º)', 'conferência dos meses 0, 1, 2', 'mi 0..2', Math.abs(Object.keys(mo).filter(k => /^(in_|out_)/.test(k)).length) + Math.abs(mesBy.get(1).fluxo.mov_cofre + 198), Object.keys(mo).filter(k => /^(in_|out_)/.test(k)).length === 0 && Math.abs(mesBy.get(1).fluxo.mov_cofre + 198) < TOL);
  // sobra entre mi 9 e 22
  const sobras = [9, 15, 22, 23, 60, 62].map(mi => [mi, R2((mesBy.get(mi).fluxo.mov_cofre || 0) + Object.keys(mesBy.get(mi).fluxo).filter(k => /^mov_obj/.test(k)).reduce((a, k) => a + mesBy.get(mi).fluxo[k], 0) + (mesBy.get(mi).fluxo.mov_bens || 0))]);
  console.log('   saldo líquido do mês (entradas-saídas) em mi 9,15,22,23,60,62: ' + JSON.stringify(sobras));
}

// ================================================================== G. LIBERDADE / RUÍNA / APOSENTADORIA
secao('G. Liberdade financeira, ruína, aposentadoria');
{
  // ruína
  let primeiroNeg = null; for (let mi = 1; mi <= ULT; mi++) if (mesBy.get(mi).fim.cofre < -0.5) { primeiroNeg = mi; break; }
  let min12 = 0; for (let mi = X.ruina.mi; mi < X.ruina.mi + 12; mi++) min12 = Math.max(min12, -mesBy.get(mi).fim.cofre);
  conf('G1', 'Ruína: dispara no primeiro mês que fecha com a reserva negativa (mi 5) e cheque12 = maior dívida nos 12 meses seguintes', 'primeiro mi com reserva < 0; máximo de -reserva em 12 meses', 'ruina.mi=' + X.ruina.mi, Math.abs(X.ruina.mi - primeiroNeg) + Math.abs(X.ruina.cheque12 - min12), X.ruina.mi === primeiroNeg && Math.abs(X.ruina.cheque12 - min12) < TOL, 'cheque12 ' + fmt(X.ruina.cheque12));
  // idade/liberdade: calendário
  const nasc = new Date(1999, 11, 1), d62 = new Date(2061, 11, 1);
  const idadeCal = (mi) => { const cm = 2026 * 12 + 9 + mi; const dt = new Date(Math.floor(cm / 12), cm % 12, 5); return (dt - nasc) / (365.25 * 864e5); };
  const miCal = (() => { for (let mi = 0; mi < 600; mi++) if (idadeCal(mi) >= 62) return mi; })();
  const ff = X.ff;
  out.ff = { miMotor: ff.mi, ageMotor: ff.age, miCal, idadeCalMotor: idadeCal(ff.mi), idadeCal422: idadeCal(422) };
  conf('G2', 'Liberdade financeira no mês em que o titular completa 62 anos (nasc. dez/1999: 62 anos em 01/12/2061 = mi 422)', 'idade pelo calendário no dia 5 de cada mês', 'mi motor ' + ff.mi + ' x calendário ' + miCal, Math.abs(ff.mi - miCal), ff.mi === miCal, 'o motor usa a idade em semanas/(365,25/7) = ' + ff.age.toFixed(4) + ' e só passa de 62 no mi 423 (jan/2062); pelo calendário já tem 62 em dez/2061');
  // sustenta / forced / pmt / sustentavel
  const horizon = Math.round((plano.lifeExp - ff.age) * 12), maxGap = 5500 - 3800;
  const pmtEsp = pmt(ff.finBefore, T, horizon), sustEsp = ff.finBefore * T + (5500 - maxGap);
  conf('G3', 'ff: gap máximo = 5.500 - 3.800 (INSS) = 1.700; forced = falso porque rendimento 0,4% do patrimônio (' + fmt(ff.finBefore * T) + ') >= gap; pmt e sustentável recalculados', 'contas próprias', 'ff', Math.abs(ff.maxGap - maxGap) + Math.abs(ff.pmt - pmtEsp) + Math.abs(ff.sustentavel - sustEsp), ff.maxGap === maxGap && ff.forced === false && Math.abs(ff.pmt - pmtEsp) < 0.01 && Math.abs(ff.sustentavel - sustEsp) < 0.01, 'pmt ' + fmt(ff.pmt) + ' | sustentável ' + fmt(ff.sustentavel));
  // ff.finBefore = fin do mi 422 fim? (fin() no início do mês 423)
  const fin422 = mesBy.get(422).fim.fin;
  conf('G4', 'ff.finBefore = financeiro do fim do mi 422 rendido por uma semana (fin422 * GW)', 'conta própria', 'mi 422 -> 423', Math.abs(ff.finBefore - fin422 * GW), Math.abs(ff.finBefore - fin422 * GW) < TOL, 'ff ' + fmt(ff.finBefore) + ' | fim do mi 422 ' + fmt(fin422));
  // despesas escaladas
  let eEsc = 0, nEsc = 0; const nTotal = [];
  { // após a liberdade: sem salário nem 13º, INSS todo mês, sem parcelas; marco da ruína na semana de abertura do mi 5
    let eP = 0; for (let mi = 423; mi <= ULT; mi++) { const f = mesBy.get(mi).fluxo; eP += (f.in_salario || 0) + (f.in_dec13 || 0) + Math.abs((f.in_pas_0 || 0) - 3800) + (f.out_fix_apto_compra || 0); }
    const prevOk = X.meses.every(m => m.fim.prev === (m.mi <= 23 ? 14000 : 0));
    conf('G6', 'Depois da liberdade (mi 423..): nenhum salário/13º, INSS de 3.800 todo mês, nenhuma parcela; FGTS parado em 14.000 (rentab 0) até o mi 23 e zero depois', 'varredura', (ULT - 422) + ' meses', eP, eP === 0 && prevOk && X.ruina.week === mesBy.get(5).w0, 'marco da ruína na semana ' + X.ruina.week + ' = abertura do mi 5');
  }
  for (let mi = 423; mi <= ULT - 1; mi++) { const f = mesBy.get(mi).fluxo; let gasto = 0; for (const k in f) if (/^out_/.test(k)) gasto += f[k]; nTotal.push(gasto); eEsc = Math.max(eEsc, Math.abs(gasto - 5500)); nEsc++; }
  conf('G5', 'Depois da liberdade o gasto total do mês = renda desejada (5.500), com o INSS de 3.800 e saque de 1.700 da reserva (despesas das linhas ESCALADAS proporcionalmente, fator 2,5)', 'soma das saídas dos meses 424.. x 5.500', nEsc + ' meses', eEsc, eEsc < TOL, 'mi 423: alimentação ' + fmt(mesBy.get(423).fluxo.out_adj_alimentacao) + ' (hoje 900), celular ' + fmt(mesBy.get(423).fluxo.out_fix_celular) + ' (hoje 400)');
  const u = mesBy.get(ULT).fluxo; let gUlt = 0; for (const k in u) if (/^out_/.test(k)) gUlt += u[k];
  console.log('   último mês (mi ' + ULT + ', semanas ' + mesBy.get(ULT).w0 + '..' + mesBy.get(ULT).w1 + ' de ' + NW + '): gasto ' + fmt(gUlt) + ' = ' + (gUlt / 5500 * 100).toFixed(1) + '% do mês: mês truncado pelo fim da linha do tempo (100 anos), não é erro');
  // custo da distorção: se as despesas não escalassem (2.200/mês), o financeiro aos 85 e aos 100
  const finRet = mi => mesBy.get(mi).fim.fin;
  out.fin = { f422: finRet(422), f423: finRet(423), f85: finRet(Math.round((85 - 26.9077) * 12)), f100: finRet(ULT - 1) };
  console.log('   financeiro: aos 62 ' + fmt(out.fin.f423) + ' | aos 85 ' + fmt(out.fin.f85) + ' | aos 100 ' + fmt(out.fin.f100));
  // impacto do atraso de um mês na liberdade e do INSS no mi 421
  const m422 = mesBy.get(422).fluxo; const entradas422 = (m422.in_salario || 0) + (m422.in_dec13 || 0) + (m422.in_pas_0 || 0);
  out.impacto422 = { entradas: entradas422, deltaSeAposentasse: -(entradas422 - 3800) - (5500 - 2200) };
  console.log('   se a liberdade fosse no mi 422 (62 anos pelo calendário) o patrimônio seria ' + fmt(-out.impacto422.deltaSeAposentasse) + ' menor naquele mês (perde salário+13º de ' + fmt(12000) + ' e passa a gastar 5.500 em vez de 2.200); INSS começa no mi 421 (antes dos 62): +3.800');
}

// ================================================================== H. FIDELIDADE AO CLIENTE (seção "Para o auditor")
secao('H. Fidelidade');
{
  const m = n => mesBy.get(n);
  const rep = [];
  rep.push(['Parcela da moto 718', 718, m(1).fluxo.out_fix_parc_moto]);
  rep.push(['Saldo da moto após 14 parcelas (cenário 12.539)', 12539, X.dividas[0].saldo[0]]);
  rep.push(['Parcela do cartão 780', 780, m(1).fluxo.out_fix_parc_cartao]);
  rep.push(['Fluxo nov/2026 (mi 1): 5.200-3.900-718-780 = -198', -198, m(1).fluxo.mov_cofre]);
  rep.push(['Fluxo no mi 8, sem os juros da reserva negativa (último mês do cartão; o cenário diz +582 a partir do 8)', -198, (m(8).fluxo.mov_cofre || 0) + (m(8).fluxo.out_juros || 0)]);
  rep.push(['Fluxo no mi 9 (promoção): 6.000-3.900-718 = +1.382', 1382, (m(9).fluxo.mov_cofre || 0) + (m(9).fluxo.out_juros || 0)]);
  rep.push(['Parcela do apartamento 2.030', 2030, m(60).fluxo.out_fix_apto_compra]);
  rep.push(['Curso: aporte 1.190/mês necessário (cenário)', 1190, X.objetivos[0].required]);
  rep.push(['Notebook: aporte 571/mês necessário (cenário)', 571, X.objetivos[1].required]);
  rep.push(['Apto: caixinha em mi 60 (6.0000 esperado pelo cenário)', 60000, X.objetivos[2].real]);
  rep.push(['FGTS no mi 24: entra 14.000', 14000, m(24).fluxo.in_pas_1]);
  rep.push(['Reserva no fim de nov/2026: cenário -400', -400, m(1).fim.cofre]);
  rep.forEach(r => console.log('   ' + r[0] + ': esperado ' + fmt(r[1]) + ' | motor ' + fmt(r[2]) + ' | diferença ' + fmt(r[2] - r[1])));
  out.fidelidade = rep;
}

// ================================================================== resumo
secao('RESUMO');
const falhas = TAB.filter(t => !t.ok);
console.log(TAB.length + ' conferências; ' + falhas.length + ' fora da tolerância:');
falhas.forEach(t => console.log('  - ' + t.id + ': ' + t.oque + ' | erro ' + (typeof t.erro === 'number' ? fmt(t.erro) : t.erro)));
if (process.argv.includes('--md')) { console.log('\n| # | o que foi conferido | método | amostra | erro máximo | resultado |\n|---|---|---|---|---|---|'); TAB.forEach(t => console.log('| ' + [t.id, t.oque, t.metodo, t.amostra, typeof t.erro === 'number' ? fmt(t.erro) : t.erro, t.ok ? 'OK' : 'FORA DA TOLERÂNCIA'].join(' | ') + ' |')); }
console.log('\nNÚMEROS-CHAVE ' + JSON.stringify(out, (k, v) => typeof v === 'number' ? R2(v * 1) : (typeof v === 'function' ? undefined : v)).slice(0, 6000));
