// AUDITOR MATEMÁTICO — CENÁRIO 04 (Paulo e Renata). Reexecutável: node ux/auditoria/laudos/auditor-04.js
// Conferência INDEPENDENTE: parte do plano (plano-04.json) e das regras do domínio financeiro, recalcula tudo com código
// próprio e compara com o "observado" (saída do motor: extrato mensal e as semanas da simulação). Nenhuma função do motor
// (trajetoriaDoBem, saldoDevedorEm, taxaDoObjetivo, contratoDaDivida...) é usada para produzir o "esperado"; o motor só
// gera o observado (E.configure + E.run, pelo harness) e, onde indicado como "diagnóstico", é consultado para explicar uma diferença.
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..', '..', '..');
const H = require(path.join(RAIZ, 'ux', 'auditoria', 'harness.js'));
const PLANO = JSON.parse(fs.readFileSync(path.join(RAIZ, 'ux', 'auditoria', 'planos', 'plano-04.json'), 'utf8'));
const dados = () => JSON.parse(JSON.stringify(PLANO.dados || PLANO));

// ---------- observado ----------
function observa(plano) {
  const E = H.carregar();
  const ext = H.extrato({ dados: plano }, E);           // extrato mensal (formato do harness)
  const P = JSON.parse(JSON.stringify(plano)); E.configure(P);
  const s = E.run('desej');                              // semanas (saídas do motor)
  return { E, ext, s, W0: E.W0, NW: E.NW };
}
const P = dados();
const OBS = observa(P);
const EXT = OBS.ext, S = OBS.s, W0 = OBS.W0, NW = OBS.NW;
const MES = Object.fromEntries(EXT.meses.map(m => [m.mi, m]));
const MI_MAX = EXT.meses[EXT.meses.length - 1].mi;
const fl = (mi, k) => (MES[mi] && MES[mi].fluxo[k]) || 0;

// ---------- registro de conferências ----------
const CHK = [], ACH = [];
let N = 0;
function chk(frente, desc, metodo, amostra, err, tol, nota) {
  tol = tol == null ? 0.01 : tol; const ok = !(err > tol) && !Number.isNaN(err);
  CHK.push({ n: ++N, frente, desc, metodo, amostra, err, tol, ok, nota: nota || '' });
  return ok;
}
const max = a => a.reduce((x, y) => Math.max(x, y), 0);
const sum = a => a.reduce((x, y) => x + y, 0);
const f2 = x => (x == null ? 'n/d' : x.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const f0 = x => Math.round(x).toLocaleString('pt-BR');

// ---------- A0. calendário independente ----------
// mi 0 = out/2026 (início 28/10/2026: o ciclo do salário do dia 5 de outubro). mi k = mês de calendário (out/2026 + k).
const CM_BASE = 2026 * 12 + 9;
const calDe = mi => { const c = CM_BASE + mi; return { y: Math.floor(c / 12), m: ((c % 12) + 12) % 12 }; };
const rot = mi => { const c = calDe(mi); return ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][c.m] + '/' + c.y; };
const NASC = new Date(1979, 0, 1);                          // nascimento do Paulo (1979-01) → semana 0 do motor
const dataSemana = i => new Date(NASC.getTime() + i * 7 * 864e5);
const semanaTem5 = i => { const d = dataSemana(i); for (let k = 0; k < 7; k++) if (new Date(d.getTime() + k * 864e5).getDate() === 5) return new Date(d.getTime() + k * 864e5); return null; };
{
  // as semanas que abrem cada mês (a que contém o dia 5) e quantas semanas tem cada mês
  const abre = []; for (let i = 0; i < NW; i++) { const d = semanaTem5(i); if (d) abre.push({ i, mi: d.getFullYear() * 12 + d.getMonth() - CM_BASE }); }
  let erro = 0, n = 0;
  EXT.meses.forEach((m, k) => {
    const a = abre.find(x => x.mi === m.mi); if (!a) { erro++; return; }
    if (a.i !== m.w0 && !(m.mi === 0)) erro++;
    const prox = abre.find(x => x.mi === m.mi + 1); const w1 = prox ? prox.i : NW; if (w1 !== m.w1 && m.mi > 0) erro++; n++;
  });
  chk('Contabilidade geral', 'Calendário: o mês do motor abre na semana que contém o dia 5; mi 0 = out/2026', 'recalcula as semanas (nascimento 1979-01 + 7 dias) e as datas', n + ' meses', erro, 0);
  const diasHoje = (new Date(2026, 9, 28) - NASC) / 864e5;
  chk('Contabilidade geral', 'Semana de hoje (W0)', 'dias de 01/01/1979 a 28/10/2026 ÷ 7, arredondado', 'W0=' + W0, Math.abs(Math.round(diasHoje / 7) - W0), 0);
}
const semanasDoMes = mi => MES[mi].w1 - MES[mi].w0;
const WPM = 7 / 30.4375;                                    // expoente semanal da taxa mensal (convenção do motor, calendário)

// ---------- B. Participação societária ----------
const part = P.patrimonio.participacoes[0];
function serieParticipacao(p, N) {                          // independente: taxa % a.a. composta mensal; pontual em R$ ou %; alvo; piso 0
  const ev = p.valorizacao || []; let v = +p.valor; const out = [v];
  const alvos = ev.filter(e => e.tipo === 'alvo').map(e => ({ em: +e.em, v: +e.valor })).sort((a, b) => a.em - b.em);
  for (let m = 1; m <= N; m++) {
    const a = alvos.find(x => x.em >= m);
    if (a) v = v > 0 && a.v > 0 ? v * Math.pow(a.v / v, 1 / (a.em - m + 1)) : v + (a.v - v) / (a.em - m + 1);
    else ev.forEach(e => { if (e.tipo === 'taxa') { const de = +e.de || 0, ate = de + 12 * (e.anos != null ? +e.anos : 10); if (m - 1 >= de && m - 1 < ate) v *= Math.pow(1 + e.pct / 100, 1 / 12); } });
    ev.forEach(e => { if (e.tipo === 'pontual' && +e.em === m) v = Math.max(0, e.pct != null ? v * (1 + e.pct / 100) : v + (+e.valor || 0)); });
    out.push(v);
  }
  return out;
}
const PART_ESP = serieParticipacao(part, MI_MAX);
{
  const mesesNo = EXT.meses.map(m => m.mi);
  const eFim = max(mesesNo.map(mi => Math.abs(PART_ESP[mi] - MES[mi].fim.part)));
  const eDet = max(mesesNo.map(mi => Math.abs(PART_ESP[mi] - MES[mi].fim.det.parts[0])));
  const eSerie = max(Array.from({ length: Math.min(EXT.parts[0].serie.length, MI_MAX + 1) }, (_, mi) => Math.abs(PART_ESP[mi] - EXT.parts[0].serie[mi])));
  chk('Participações', 'Valor mensal da participação (6% a.a. composto mensal por 60 meses + salto de R$ 300 mil no mês 30)', 'recalcula v(m)=v(m-1)·1,06^(1/12) (m-1<60) + pontual em m=30; compara com fim.part', mesesNo.length + ' meses (0 a ' + MI_MAX + ')', eFim);
  chk('Participações', 'Idem, com fim.det.parts[0]', 'mesma série', mesesNo.length + ' meses', eDet);
  chk('Participações', 'Idem, com parts[0].serie (trajetória do motor)', 'mesma série', (EXT.parts[0].serie.length) + ' pontos', eSerie);
  const marcos = { 12: 1400000 * 1.06, 30: 1400000 * Math.pow(1.06, 2.5) + 300000, 60: (1400000 * Math.pow(1.06, 2.5) + 300000) * Math.pow(1.06, 2.5) };
  Object.keys(marcos).forEach(k => ACH.push({ t: 'part', k: +k, esp: marcos[k], obs: MES[k].fim.part }));
  chk('Participações', 'Valores-marco do cenário (mês 12, 30, 60)', 'fórmula fechada do cenário: 1.484.000 / 1.919.544 / 2.220.561', '3 marcos', max(Object.keys(marcos).map(k => Math.abs(marcos[k] - MES[k].fim.part))), 0.5);
  // salto pontual: mês 30 vs 29; fim da taxa; constância depois do mês 60
  const salto = MES[30].fim.part - MES[29].fim.part, esperadoSalto = PART_ESP[29] * (Math.pow(1.06, 1 / 12) - 1) + 300000;
  chk('Participações', 'Salto do mês 30 = rendimento do mês + 300.000, e a taxa continua sobre o salto', 'Δ(29→30) esperado', 'mês 30', Math.abs(salto - esperadoSalto));
  chk('Participações', 'Depois do mês 60 o valor fica constante (taxa de 5 anos terminou)', 'max|v(m)-v(60)| para m=61..' + MI_MAX, (MI_MAX - 60) + ' meses', max(Array.from({ length: MI_MAX - 60 }, (_, k) => Math.abs(MES[61 + k].fim.part - MES[60].fim.part))));
  chk('Participações', 'Participação não é caixa: nenhum fluxo (in_/out_) de venda/valorização', 'procura chaves in_*part*, out_vendap_* no fluxo', EXT.meses.length + ' meses', max(EXT.meses.map(m => Object.keys(m.fluxo).filter(k => /vendap|part/.test(k)).length)), 0);
}

// ---------- C. Dívidas ----------
const apto = P.patrimonio.bens[0], casa = P.patrimonio.bens[1], carroC = P.patrimonio.financeiro[3].cons, cred = P.creditos[0], bruna = P.objectives[3];
const OBS_DIV = k => MES[k] ? MES[k].fim.det.divs : null;
// C1. apartamento SAC. Âncora: saldo informado (783.000) e 188 parcelas restantes ⇒ amortização B0/188; juros: 8,99% a.a.
const APTO = (() => {
  const B0 = +apto.saldoDevedor, n = +apto.restantes, am = B0 / n, i = Math.pow(1 + apto.juros / 100, 1 / 12) - 1;
  const saldo = k => k >= n ? 0 : B0 - am * k;                                    // depois da k-ésima parcela daqui em diante
  const parcela = k => k >= 1 && k <= n ? am + saldo(k - 1) * i : 0;              // paga no mês k (mi = k)
  // contrato "puro" (cenário): 1.000.000, 240, 8,99% a.a., 52 pagas
  const amC = 1000000 / 240, saldoC = k => Math.max(0, 1000000 - amC * (52 + k)), parcC = k => k >= 1 && k <= 188 ? amC + saldoC(k - 1) * i : 0;
  return { B0, n, am, i, saldo, parcela, amC, saldoC, parcC };
})();
{
  const ks = EXT.meses.map(m => m.mi).filter(mi => mi <= 200);
  chk('Dívidas', 'Apartamento (SAC): saldo devedor mês a mês', 'saldo(k)=783.000·(188−k)/188 (âncora no saldo informado, amortização constante)', ks.length + ' meses (0 a 200)', max(ks.map(k => Math.abs(APTO.saldo(k) - MES[k].fim.det.divs[0]))));
  chk('Dívidas', 'Apartamento: saldo observado × saldo do contrato puro (1.000.000/240, 52 pagas)', 'max|saldoC(k)−saldo observado| (diferença esperada: 783.333 do contrato × 783.000 informado)', '189 meses', max(ks.map(k => Math.abs(APTO.saldoC(k) - MES[k].fim.det.divs[0]))), 334, 'tolerância 334 = 333,33 (dado do cliente: saldo informado difere do contratual)');
  chk('Dívidas', 'Apartamento: amortização do contrato (4.166,67) e 1ª parcela (cenário 11.366)', 'recalcula 1.000.000/240 e 1.000.000·i + amort', '1 valor', Math.abs(APTO.amC - 4166.6667) + Math.abs(1000000 * APTO.i + APTO.amC - 11365.7), 2, 'o cenário diz 11.366; a conta dá 11.363,6');
}
// parcela que sai no fluxo antes da liberdade (mi 1..52): comparar com a parcela do contrato
const FF_MI = 53;                                                                  // conferido em G
{
  const rows = []; for (let mi = 1; mi < FF_MI; mi++) rows.push({ mi, obs: fl(mi, 'out_fix_parc_apto'), c: APTO.parcC(mi), a: APTO.parcela(mi) });
  const dev = rows.map(r => r.obs - r.c);
  ACH.push({ t: 'aptoParc', maxDifContrato: max(dev.map(Math.abs)), difAncora: max(rows.map(r => Math.abs(r.obs - r.a))), media: sum(dev) / dev.length });
  chk('Dívidas', 'Apartamento: parcela que sai do fluxo (mi 1..52) × parcela do contrato mês a mês (8,99% a.a., SAC)', 'out_fix_parc_apto(mi) − [4.166,67 + saldoC(mi−1)·i]', rows.length + ' meses', max(dev.map(Math.abs)), 0.01,
    'A linha de despesa é uma escada ANUAL (valor do 1º mês do ano repetido 12 vezes) e usa a taxa implícita do motor (8,45% a.a., não 8,99%): erro máx. R$ ' + f2(max(dev.map(Math.abs))));
}
// C2. Casa de campo: consórcio 600.000 · 1,20 / 180
const CASA = (() => { const total = casa.carta * (1 + casa.txAdm / 100 + casa.fundoReserva / 100), p = total / casa.parcelas, n = +casa.restantes; return { total, p, n, saldo: k => Math.max(0, p * (n - k)) }; })();
{
  const ks = EXT.meses.map(m => m.mi).filter(mi => mi <= 160);
  chk('Dívidas', 'Casa de campo (consórcio contemplado): total 720.000, parcela 4.000, saldo 148×4.000 = 592.000', '600.000·1,20; /180; saldo(k)=4.000·(148−k)', 'valores-chave', Math.abs(CASA.total - 720000) + Math.abs(CASA.p - 4000) + Math.abs(CASA.saldo(0) - 592000), 0);
  chk('Dívidas', 'Casa de campo: saldo devedor mês a mês', 'saldo(k)=4.000·(148−k)', ks.length + ' meses (0 a 160)', max(ks.map(k => Math.abs(CASA.saldo(k) - MES[k].fim.det.divs[1]))));
  const pagas = []; for (let mi = 1; mi <= 160; mi++) if (mi < FF_MI) pagas.push(Math.abs(fl(mi, 'out_fix_parc_casa') - (mi <= 148 ? 4000 : 0)));
  chk('Dívidas', 'Casa de campo: parcela no fluxo antes da liberdade = 4.000 (reajuste 0)', 'out_fix_parc_casa(mi) − 4.000', pagas.length + ' meses (1..52)', max(pagas));
  const n4000 = EXT.meses.filter(m => m.mi >= 1 && m.mi <= 160).filter(m => fl(m.mi, 'out_fix_parc_casa') > 0).length;
  ACH.push({ t: 'casaParcelasPagas', n: n4000, esperado: 148 });
}
// C3. Crédito novo (sabático): Price 150.000, 36 parcelas a 1,6% a.m., dinheiro em mi 5, 1ª parcela em mi 6
const CRED = (() => { const i = cred.juros / 100, n = cred.parcelas, v = cred.valor, pm = v * i / (1 - Math.pow(1 + i, -n)); let b = v; const saldo = [v], pg = []; for (let k = 1; k <= n; k++) { const j = b * i, a = pm - j; b -= a; saldo.push(Math.max(0, b)); pg.push({ k, j, a }); } return { pm, saldo, pg, i, n, v }; })();
{
  chk('Dívidas', 'Crédito novo: parcela Price R$ 5.513,58 (cenário 5.514)', 'PMT(150.000; 1,6%; 36)', '1 valor', Math.abs(CRED.pm - 5513.58), 0.01);
  const mis = EXT.meses.map(m => m.mi).filter(mi => mi >= 5 && mi <= 45);
  const esp = mi => mi < 5 ? 0 : CRED.saldo[Math.min(CRED.n, mi - 5)];
  chk('Dívidas', 'Crédito novo: saldo devedor depois de cada parcela (det.divs[3])', 'B(k)=B(k−1)(1+i)−PMT, k=mi−5', mis.length + ' meses (5 a 45)', max(mis.map(mi => Math.abs(esp(mi) - MES[mi].fim.det.divs[3]))), 0.01);
  const pgs = []; for (let mi = 1; mi <= 60; mi++) pgs.push(Math.abs(fl(mi, 'out_fix_parc_cred') - (mi >= 6 && mi <= 41 ? CRED.pm : 0)));
  chk('Dívidas', 'Crédito novo: parcela no fluxo (36 parcelas, mi 6..41), entrada de R$150.000 em mi 5', 'out_fix_parc_cred(mi) e in_credito_cr_sab(5)', '60 meses', max(pgs) + Math.abs(fl(5, 'in_credito_cr_sab') - 150000), 0.01);
  const totalPago = sum(Array.from({ length: 60 }, (_, k) => fl(k + 1, 'out_fix_parc_cred'))), juros = CRED.pm * 36 - 150000;
  ACH.push({ t: 'cred', pm: CRED.pm, total: totalPago, juros });
  chk('Dívidas', 'Crédito novo: juros pagos = Σparcelas − principal', 'Σ out_fix_parc_cred − 150.000 vs 36·PMT − 150.000', '36 parcelas', Math.abs(totalPago - 36 * CRED.pm), 0.15, 'juros = R$ ' + f2(juros) + '; a diferença (R$ 0,10) é o arredondamento da linha digitada (5.513,58 contra 5.513,5827)');
}
// C4. Consórcio a contemplar (carro) — caixa de previdência e dívida depois da contemplação
const CARRO = (() => {
  const n = carroC.parcelas, pagas = carroC.pagas, rest = n - pagas, p = carroC.parcela, cont = 18, lance = carroC.lance, carta = carroC.carta;
  const devido = (rest - cont) * p, nova = (devido - lance) / (rest - cont);
  return { n, pagas, rest, p, cont, lance, carta, devido, nova, liquida: carta - lance };
})();
{
  chk('Dívidas', 'Consórcio do carro: parcela depois do lance (R$ 20.000 abate 44 parcelas)', '(44·2.100 − 20.000)/44', '1 valor', Math.abs(CARRO.nova - fl(30, 'out_fix_parc_cons_carro')), 0.01);
  chk('Dívidas', 'Consórcio do carro: carta menos lance entra em mi 18 (130.000)', 'in_pas_3(18) − (150.000−20.000)', '1 mês', Math.abs(fl(18, 'in_pas_3') - CARRO.liquida), 0.01);
  const dBase = mi => MES[mi].fim.div - MES[mi].fim.det.divs.reduce((a, b) => a + b, 0);
  const errs = []; for (let mi = 18; mi <= 62; mi++) { const pagasAte = Math.max(0, Math.min(61, 61) - mi); errs.push(Math.abs(dBase(mi) - pagasAte * CARRO.nova)); }
  chk('Dívidas', 'Consórcio do carro: dívida remanescente (fim.div − Σ det.divs) = parcelas futuras × 1.645,45', 'parcelas que ainda saem do caixa (mi+1..61)', '45 meses (18..62)', max(errs), 0.01);
  ACH.push({ t: 'carro', pagasCaixa: Array.from({ length: 70 }, (_, k) => fl(k + 1, 'out_fix_parc_cons_carro') > 0 ? 1 : 0).reduce((a, b) => a + b, 0), restantesContrato: CARRO.rest });
}
// C5. Consórcio do apartamento da Bruna (compra do objetivo)
const BRU = (() => {
  const c = bruna.compra, carta = c.carta, total = carta * (1 + c.txAdm / 100 + c.fundoReserva / 100), p = total / c.parcelas, kLance = bruna.months + 1;
  const saldoApos = total * (c.parcelas - kLance) / c.parcelas, lance = saldoApos * c.lancePct / 100, emb = carta * c.embutidoPct / 100, bolso = lance - emb;
  const nova = (saldoApos - lance) / (c.parcelas - kLance), parteBem = carta / total;
  return { carta, total, p, kLance, saldoApos, lance, emb, bolso, nova, parteBem, credito: carta - emb };
})();
{
  chk('Dívidas', 'Consórcio da Bruna: total 833.000, parcela 6.941,67, lance 30% do saldo (122.867,50), embutido 70.000, bolso 52.867,50', 'contas do contrato', '5 valores', Math.abs(BRU.total - 833000) + Math.abs(BRU.p - 6941.666667) + Math.abs(BRU.lance - 122867.5) + Math.abs(BRU.bolso - 52867.5) + Math.abs(BRU.saldoApos - 409558.3333), 0.01);
  chk('Dívidas', 'Consórcio da Bruna: "necessário na data" = bolso arredondado para cima (52.868)', 'ceil(bolso) vs objetivo.amount', '1 valor', Math.abs(Math.ceil(BRU.bolso) - EXT.objetivos[3].amount), 0);
  const ps = []; for (let mi = 1; mi <= 125; mi++) { const esp = mi <= 61 ? BRU.p : mi <= 120 ? BRU.nova : 0; ps.push(Math.abs(fl(mi, 'out_fix_apto_bruna_compra') - esp)); }
  chk('Dívidas', 'Consórcio da Bruna: parcela no fluxo (6.941,67 até a 61ª; depois 4.859,17; 120 parcelas, mi 1..120)', 'out_fix_apto_bruna_compra(mi)', '125 meses', max(ps), 0.01);
  ACH.push({ t: 'bruna', ...BRU });
}

// ---------- D/E. Caixinhas (objetivos) e rendimento: reconstrução SEMANA A SEMANA ----------
const PERF = P.profiles, CONS = PERF.conservador;
const OBJ = P.objectives;
const taxaEsperada = (o, mi) => {                           // regra do domínio: perfil escolhido; conservador nos últimos 24 meses antes da data (e sempre, se o prazo ≤ 24)
  const b = PERF[o.profile], t = Math.max(0, Math.round(o.months) - 24);
  return (t <= 0 || b <= CONS) ? Math.min(b, CONS) : (mi >= t ? CONS : b);
};
const miDaSemana = i => { for (let k = i; k >= Math.max(0, i - 7); k--) { const d = semanaTem5(k); if (d) return d.getFullYear() * 12 + d.getMonth() - CM_BASE; } return -1; };
const GWk = Math.pow(1 + P.rate, WPM);
// reconstrói cada caixinha semana a semana a partir do aporte observado (mov_obj_*) e da taxa esperada
function reconstroiObjetivo(o, k, modo /* 'motor' (taxa da semana = a do mês anterior na semana de abertura) | 'ideal' (taxa do mês da própria semana) | {fixa:x} */) {
  let saldo = 0, ant = 0; const trilha = [], difs = [];
  for (let i = W0; i < NW; i++) {
    const w = S.weeks[i], mov = (w.f && w.f['mov_obj_' + o.id]) || 0, mi = i < W0 ? 0 : miDaSemana(i);
    const miPrev = i === W0 ? 0 : miDaSemana(i - 1);
    const miTaxa = modo === 'ideal' ? mi : (i === W0 ? 0 : miPrev);   // motor: a taxa é a do contexto do mês da semana anterior
    const r = typeof modo === 'object' ? modo.fixa : taxaEsperada(o, miTaxa);
    const base = (i === W0) ? mov : saldo;                 // em W0 o patrimônio separado entra antes do rendimento
    const depois = base * Math.pow(1 + r, WPM) + (i === W0 ? 0 : mov);
    // o saque na data zera a caixinha: depois = 0 (o mov negativo é o saldo)
    trilha.push({ i, mi, r, esp: depois, obs: w.obj[k] });
    saldo = Math.abs(depois) < 1e-9 || w.obj[k] === 0 && mov < 0 ? 0 : depois;
    if (w.obj[k] === 0 && mov < 0) { trilha[trilha.length - 1].saque = -mov; trilha[trilha.length - 1].espSaque = base * Math.pow(1 + r, WPM); saldo = 0; }
    if (saldo === 0 && ant === 0 && mov === 0 && i > W0) { /* caixinha encerrada */ }
    ant = saldo;
  }
  return trilha;
}
const RES_D = [];
OBJ.forEach((o, k) => {
  const tr = reconstroiObjetivo(o, k, 'motor');
  let eMax = 0, pior = null; const saques = [];
  tr.forEach(t => { if (t.saque != null) { saques.push(t); return; } const e = Math.abs(t.esp - t.obs); if (e > eMax) { eMax = e; pior = t; } });
  const eSaque = saques.length ? Math.abs(saques[0].espSaque - saques[0].saque) : 0;
  // a troca de taxa: primeiro mês em que a taxa esperada é a conservadora
  const mesTroca = (() => { const b = PERF[o.profile]; const t = Math.max(0, Math.round(o.months) - 24); return (t <= 0 || b <= CONS) ? null : t; })();
  // a taxa efetivamente aplicada pelo motor em cada semana, a partir do saldo observado
  const efet = []; for (let i = W0 + 1; i < NW; i++) { const a = S.weeks[i - 1].obj[k], w = S.weeks[i], mov = (w.f && w.f['mov_obj_' + o.id]) || 0; if (a > 0 && !(w.obj[k] === 0)) efet.push({ i, mi: miDaSemana(i), r: Math.pow((w.obj[k] - mov) / a, 1 / WPM) - 1 }); }
  const semIdeal = efet.filter(e => Math.abs(e.r - taxaEsperada(o, e.mi)) > 1e-9);
  RES_D.push({ o, k, eMax, pior, eSaque, saque: saques[0], mesTroca, semanasForaDoIdeal: semIdeal, efet });
  chk('Caixinhas', o.name + ' (' + o.months + ' meses, ' + o.profile + '): saldo semana a semana = saldo·(1+taxa)^(7/30,4375) + aportes', 'recursão independente; taxa pela regra (24 meses finais conservadores); aportes = mov_obj_* observados', tr.length + ' semanas', eMax, 0.01,
    mesTroca != null ? 'taxa troca no mês ' + mesTroca + ' (' + rot(mesTroca) + ')' : 'sem troca de taxa (nasce conservadora)');
  chk('Caixinhas', o.name + ': valor sacado na data (mov_obj_* negativo)', 'saldo da semana anterior · (1+taxa)^(7/30,4375)', '1 saque (mi ' + o.months + ')', eSaque, 0.01);
});
// efeito da semana de defasagem (taxa do mês anterior na semana de abertura): compara "motor" × "ideal" no saldo final
const EFEITO = OBJ.map((o, k) => {
  const m = reconstroiObjetivo(o, k, 'motor'), id = reconstroiObjetivo(o, k, 'ideal');
  const fm = m.find(t => t.saque != null), fi = id.find(t => t.saque != null);
  const saque = (tr) => { const t = tr.find(x => x.saque != null); return t ? t.espSaque : null; };
  const um = (r) => reconstroiObjetivo(o, k, { fixa: r }), q = tr => { const t = tr.find(x => x.saque != null); return t ? t.espSaque : null; };
  return { id: o.id, motor: saque(m), ideal: saque(id), tudoConservador: q(um(CONS)), tudoModerado: q(um(PERF.moderado)), tudoAgressivo: q(um(PERF.agressivo)) };
});
// E. rendimento do patrimônio financeiro (cofre): semana a semana
const REND = (() => {
  // cofre inicial: investimentos + PGBL (a previdência fechada e o consórcio ficam em caixa à parte). Em W0 a separação das caixinhas
  // entra ANTES do rendimento; nas demais semanas o rendimento vem primeiro e os lançamentos da semana depois.
  const livre = P.patrimonio.financeiro.filter(f => !['fechada', 'fgts', 'consorcio'].includes(f.tipo)).reduce((a, f) => a + f.valor, 0);
  let c = livre, eMax = 0, pior = null, n = 0;
  for (let i = W0; i < NW; i++) {
    const w = S.weeks[i], mov = (w.f && w.f.mov_cofre) || 0;
    let novo;
    if (i === W0) { const trans = Object.keys(w.f).filter(k => /^mov_obj_/.test(k)).reduce((a, k) => a + w.f[k], 0); novo = (livre - trans) * GWk + sumIn(w.f); }
    else novo = (c > 0 ? c * GWk : c) + mov;
    const e = Math.abs(novo - w.cofre); n++; if (e > eMax) { eMax = e; pior = { i, mi: w.mi, novo, obs: w.cofre }; }
    c = w.cofre;                                           // reancora no observado: mede o erro de cada semana (não o acumulado)
  }
  return { eMax, pior, n, livre };
})();
function sumIn(f) { let R = 0; for (const k in f) { if (k.startsWith('in_')) R += f[k]; else if (k.startsWith('out_')) R -= f[k]; } return R; }
chk('Rendimento', 'Rendimento do financeiro livre (cofre): cofre(w)=cofre(w−1)·(1+0,4%)^(7/30,4375) + mov_cofre(w)', 'recursão semanal reancorada no observado; mede o erro de cada semana', REND.n + ' semanas', REND.eMax, 0.01, 'convenção: rende primeiro (sobre o saldo do fim da semana anterior), os lançamentos da semana entram depois');

// ---------- A. Contabilidade geral ----------
const ACC = (() => {
  const r = { nan: 0, conserv: 0, eq: 0, ident: 0, cofreNeg: 0, sinais: 0, conservMes: 0 };
  // conservação por semana: Σ mov_* = Σ in − Σ out (transferências somam zero)
  for (let i = W0; i < NW; i++) {
    const f = S.weeks[i].f, movs = Object.keys(f).filter(k => k.startsWith('mov_')).reduce((a, k) => a + f[k], 0);
    r.conserv = Math.max(r.conserv, Math.abs(movs - sumIn(f)));
    for (const k in f) if (!Number.isFinite(f[k])) r.nan++;
    for (const k in f) if ((k.startsWith('in_') || k.startsWith('out_')) && f[k] < -1e-9) r.sinais++;
    const w = S.weeks[i]; ['fin', 'cofre', 'bens', 'part', 'prev', 'div', 'cheque'].forEach(c => { if (!Number.isFinite(w[c])) r.nan++; });
    if (w.cofre < -0.5) r.cofreNeg++;
    r.eq = Math.max(r.eq, Math.abs(w.fin - (w.cofre + sum(w.obj))));
  }
  return r;
})();
chk('Contabilidade geral', 'Conservação do dinheiro por semana: Σ mov_* = Σ entradas − Σ saídas (transferências somam zero)', 'varre todas as semanas', (NW - W0) + ' semanas', ACC.conserv, 0.001);
chk('Contabilidade geral', 'fin = cofre + Σ caixinhas; sem NaN/Infinity; entradas/saídas nunca negativas', 'varre todas as semanas e chaves', (NW - W0) + ' semanas', ACC.eq + ACC.nan + ACC.sinais, 0.001);
{
  // transferências somam zero: por mês, mov_cofre + Σ mov_obj + mov_bens = entradas − saídas
  let e = 0; EXT.meses.forEach(m => { const f = m.fluxo; let io = 0, mv = 0; for (const k in f) { if (/^in_/.test(k)) io += f[k]; else if (/^out_/.test(k)) io -= f[k]; else mv += f[k]; } e = Math.max(e, Math.abs(io - mv)); });
  chk('Contabilidade geral', 'Por mês: Σ movimentações (cofre+caixinhas+bens) = entradas − saídas', 'soma das chaves mov_* contra in_*/out_*', EXT.meses.length + ' meses', e, 0.001);
}
{
  // a variação do financeiro de cada mês = (entradas − saídas) − dinheiro que virou bem + rendimento; o rendimento é recalculado de forma independente (soma semanal de cofre e caixinhas)
  let e = 0, pior = null, rendTotal = 0;
  const finSem = i => S.weeks[i].cofre + sum(S.weeks[i].obj);
  EXT.meses.forEach(m => {
    if (m.mi === 0) return;
    let rend = 0;
    for (let i = m.w0; i < m.w1; i++) {
      const w = S.weeks[i], f = w.f || {};
      const cof0 = S.weeks[i - 1].cofre, ob0 = S.weeks[i - 1].obj;
      const ganhoCofre = cof0 > 0 ? cof0 * (GWk - 1) : 0;
      let ganhoObj = 0; OBJ.forEach((o, k) => { const r = taxaEsperada(o, miDaSemana(i - 1) >= 0 && i > W0 ? miDaSemana(i - 1) : 0); ganhoObj += ob0[k] * (Math.pow(1 + r, WPM) - 1); });
      rend += ganhoCofre + ganhoObj;
    }
    const dFin = finSem(m.w1 - 1) - finSem(m.w0 - 1), io = sum(Object.keys(m.fluxo).map(k => /^in_/.test(k) ? m.fluxo[k] : /^out_/.test(k) ? -m.fluxo[k] : 0)), paraBens = m.fluxo.mov_bens || 0;
    const err = Math.abs(dFin - (io - paraBens + rend)); rendTotal += rend; if (err > e) { e = err; pior = m.mi; }
  });
  chk('Contabilidade geral', 'Variação do financeiro do mês = entradas − saídas − (cofre→bens) + rendimento recalculado (cofre e caixinhas)', 'Δ(cofre+caixinhas) contra fluxo + rendimento semanal independente', EXT.meses.length - 1 + ' meses', e, 0.05, 'pior mês: ' + pior + ' (' + (pior != null ? rot(pior) : '') + ')');
}
{
  // patrimônio = financeiro + bens + participações + previdência − dívidas, mês a mês, e a identidade dos componentes
  const PREV = (() => {                                    // previdência: Funpresp (acumulação 0,4% a.m. + 3.800/mês até mi 51) e a caixa do consórcio do carro (parcelas pagas)
    const f = P.patrimonio.financeiro[2], c = f.conv; const ser = [f.valor]; for (let mi = 1; mi < 52; mi++) ser.push(ser[mi - 1] * 1.004 + c.contribPatroc + c.contribPessoa);
    const co = P.patrimonio.financeiro[3]; const cs = [co.valor]; for (let mi = 1; mi < 18; mi++) cs.push(cs[mi - 1] + co.cons.parcela);
    return mi => (mi < ser.length ? ser[mi] : 0) + (mi < cs.length ? cs[mi] : 0);
  })();
  chk('Previdência', 'Saldo da previdência (Funpresp 380.000 a 0,4% a.m. + 3.800/mês até a concessão; caixa do consórcio 37.800 + 2.100/mês até a contemplação)', 'recursão independente', EXT.meses.length + ' meses', max(EXT.meses.map(m => Math.abs(PREV(m.mi) - m.fim.prev))), 0.01);
  // bens
  // amortização do consórcio da Bruna que vira bem: (amortização do saldo) × carta/total, recalculada pelo contrato
  const amortBruna = j => j <= 61 ? BRU.total / 120 : (BRU.saldoApos - BRU.lance) / 59;
  const bensEsp2 = mi => { let b = 3000000 + (mi >= 18 ? 130000 : 0); for (let j = 1; j <= Math.min(mi, 120); j++) b += amortBruna(j) * BRU.parteBem; if (mi >= 60) b += Math.ceil(BRU.bolso); return b; };
  const eB = max(EXT.meses.map(m => Math.abs(bensEsp2(m.mi) - m.fim.bens)));
  chk('Contabilidade geral', 'Bens = 3.000.000 (apto+casa, sem valorização) + carro 130.000 (mi≥18) + parte da carta de cada parcela do consórcio da Bruna + lance do bolso (mi≥60)', 'recalcula amortização × carta/total', EXT.meses.length + ' meses', eB, 0.01);
  // dívidas totais
  const divEsp = mi => {
    const aptoS = APTO.saldo(mi), casaS = CASA.saldo(mi), credS = mi < 5 ? 0 : CRED.saldo[Math.min(36, mi - 5)];
    const carro = mi < 18 ? 0 : Math.max(0, 61 - mi) * CARRO.nova;
    return aptoS + casaS + credS + carro;
  };
  chk('Dívidas', 'Dívida total do patrimônio (apto + casa + crédito + consórcio do carro contemplado) = Σ dos saldos recalculados', 'compara fim.div; o consórcio da Bruna NÃO entra no passivo (só a parte paga entra em bens)', EXT.meses.length + ' meses', max(EXT.meses.map(m => Math.abs(divEsp(m.mi) - m.fim.div))), 0.01);
  const nw = m => m.fim.fin + m.fim.bens + m.fim.part + m.fim.prev - m.fim.div;
  const nwEsp = m => (m.fim.cofre + sum(m.fim.obj)) + bensEsp2(m.mi) + PART_ESP[m.mi] + PREV(m.mi) - divEsp(m.mi);
  chk('Contabilidade geral', 'Patrimônio = financeiro + bens + participações + previdência − dívidas (cada parcela recalculada)', 'compara a soma dos componentes recalculados com a soma observada', EXT.meses.length + ' meses', max(EXT.meses.map(m => Math.abs(nwEsp(m) - nw(m)))), 0.01);
  ACH.push({ t: 'nw', mi0: nw(MES[0]), mi60: nw(MES[60]), mi170: nw(MES[170]), mi300: nw(MES[300]), mi479: nw(MES[479]), fim: nw(MES[MI_MAX]) });
}


// ---------- F. Fluxo: entradas e saídas contra o plano ----------
const stepVal = (it, mi) => { let v = 0; (it.steps || []).slice().sort((a, b) => a.from - b.from).forEach(s => { if (mi >= s.from) v = +s.value || 0; }); return v; };
const INC = Object.fromEntries(P.incomes.map(i => [i.id, i]));
const valorLinha = (it, mi) => it.segue ? stepVal(INC[it.segue], mi) / ((it.dates && it.dates.length) || 1) : stepVal(it, mi);
const ocorreNoMes = (it, mi) => {                          // quantas ocorrências a linha tem no mês de calendário de mi (o dia 5 e posteriores pertencem ao próprio mês)
  const cm = calDe(mi).m; const ini = (it.steps && it.steps.length) ? Math.min(...it.steps.map(s => s.from)) : 0; if (mi < ini) return 0;
  if (it.frequency === 'anual' && it.dates) return it.dates.filter(d => (d.d >= 5 ? d.m : (d.m + 11) % 12) === cm).length;
  return (it.days || [5]).length;
};
// idades e mês da liberdade: independente
const idadeDe = (nasc, hoje) => (hoje - nasc) / (365.25 * 864e5);
const HOJE = new Date(2026, 9, 28), idadePaulo = idadeDe(new Date(1979, 0, 1), HOJE), idadeRenata = idadeDe(new Date(1974, 2, 1), HOJE);
const idadeFF = Math.min(P.retireAge, idadePaulo + P.spouseRetireAge - idadeRenata);
const FF = (() => { for (let i = W0 + 1; i < NW; i++) { const d = semanaTem5(i); if (d && i / (365.25 / 7) >= idadeFF) return { i, mi: d.getFullYear() * 12 + d.getMonth() - CM_BASE, idade: i / (365.25 / 7) }; } return null; })();
const PARADA_PAULO = Math.max(FF.mi, Math.round((P.retireAge - idadePaulo) * 12));
const PARADA_RENATA = Math.max(FF.mi, Math.round((P.spouseRetireAge - idadeRenata) * 12));
{
  chk('Liberdade', 'Mês da liberdade financeira: 1ª semana de salário em que a idade do Paulo ≥ 47,82 + (57 − 52,66) = ' + idadeFF.toFixed(3) + ' anos', 'recalcula idades (365,25 dias) e a semana de abertura do mês', '1 evento', Math.abs(FF.mi - EXT.ff.mi) + Math.abs(FF.i - EXT.ff.week), 0, 'esperado mi ' + FF.mi + ' (' + rot(FF.mi) + '), semana ' + FF.i + '; motor mi ' + EXT.ff.mi);
  const eIn = { max: 0, pior: null, n: 0 };
  const lin = P.incomes;
  for (const m of EXT.meses) {
    if (m.mi === 0) continue;
    lin.forEach(it => {
      const quem = it.pessoa === 'conjuge' ? PARADA_RENATA : PARADA_PAULO;
      const esp = m.mi < quem ? valorLinha(it, m.mi) * ocorreNoMes(it, m.mi) : 0;
      const obs = fl(m.mi, 'in_' + it.id), e = Math.abs(esp - obs); eIn.n++; if (e > eIn.max) { eIn.max = e; eIn.pior = it.id + '@' + m.mi; }
    });
  }
  chk('Fluxo', 'Entradas ativas (clínica jan-fev/mar-nov/dez, bônus trimestral, salário da Renata, 13º) mês a mês, com sabático (mi 5..16) e parada de cada um', 'valor do degrau × ocorrências do calendário; Renata para em mi ' + PARADA_RENATA + ', Paulo em mi ' + PARADA_PAULO, eIn.n + ' linha×mês', eIn.max, 0.001, 'pior: ' + eIn.pior);
  // entradas passivas
  const pas = (mi) => ({ in_pas_0: mi >= 53 ? 13000 : 0, in_pas_1: mi >= 207 ? 8000 : 0 });
  let eP = 0; EXT.meses.filter(m => m.mi >= 1).forEach(m => { const p = pas(m.mi); eP = Math.max(eP, Math.abs(fl(m.mi, 'in_pas_0') - p.in_pas_0), Math.abs(fl(m.mi, 'in_pas_1') - p.in_pas_1)); });
  chk('Fluxo', 'Aposentadoria da Renata (13.000 de mi 53) e INSS do Paulo (8.000 de mi 207, Paulo com 65)', 'degraus declarados no plano', EXT.meses.length + ' meses', eP, 0.001);
  const outros = new Set(); EXT.meses.forEach(m => Object.keys(m.fluxo).filter(k => /^in_/.test(k)).forEach(k => outros.add(k)));
  ACH.push({ t: 'chavesIn', chaves: [...outros] });
  // linhas de despesa antes da liberdade: o que o plano diz (passo a passo)
  let eE = 0, nE = 0, piorE = null;
  for (const m of EXT.meses) { if (m.mi < 1 || m.mi >= FF.mi) continue; P.expenses.forEach(e => {
    let esp = stepVal(e, m.mi) * ((e.days || [5]).length);
    if (e.id === 'parc_cons_carro' && m.mi >= 62) esp = 0;
    const k = 'out_' + e.group + '_' + e.id, obs = fl(m.mi, k), er = Math.abs(esp - obs); nE++; if (er > eE) { eE = er; piorE = k + '@' + m.mi; } }); }
  chk('Fluxo', 'Saídas antes da liberdade (mi 1..52): cada linha de despesa = degrau do plano (escola até dez/2028, faculdade até dez/2029, Bruna e alimentação a partir de jan/2031 etc.)', 'valor do degrau no mês', nE + ' linha×mês', eE, 0.001, 'pior: ' + piorE);
  // total de saídas planejado × observado no mês 1..52 (inclui o consórcio da Bruna)
  let eT = 0; for (let mi = 1; mi < FF.mi; mi++) { const m = MES[mi]; const obsOut = sum(Object.keys(m.fluxo).filter(k => /^out_/.test(k)).map(k => m.fluxo[k])); const plan = sum(P.expenses.map(e => stepVal(e, mi) * (e.days || [5]).length)) - (mi >= 62 ? stepVal(P.expenses.find(e => e.id === 'parc_cons_carro'), mi) : 0) + BRU.p + (mi === 5 ? 90000 : 0) + (mi === 18 ? 130000 : 0) + (mi === 24 ? 150000 : 0) + (mi === 36 ? 200000 : 0); eT = Math.max(eT, Math.abs(plan - obsOut)); }
  chk('Fluxo', 'Total de saídas do mês (linhas + consórcio da Bruna + objetivos consumidos + compromisso do carro) × plano', 'soma dos degraus + 6.941,67 + 90.000 (mi 5) + 130.000 (mi 18) + 150.000 (mi 24) + 200.000 (mi 36)', '52 meses', eT, 0.001);
  // bordas: mês 0 sem fluxo
  chk('Fluxo', 'Mês 0 (out/2026): sem entradas/saídas além da separação das caixinhas (o dia 28 já passou do dia 5 e do dia 10)', 'conta chaves in_/out_ no mi 0', 'mi 0', Object.keys(MES[0].fluxo).filter(k => /^(in_|out_)/.test(k)).length, 0);
}

// ---------- G. Liberdade financeira / aposentadoria / ruína ----------
const GL = (() => {
  const D = P.desired;
  const pasEq = mi => (mi >= 53 ? 13000 : 0) + (mi >= 52 ? EXT_RENDA_FUNPRESP : 0) + (mi >= 207 ? 8000 : 0);
  return { D, pasEq };
})();
const EXT_RENDA_FUNPRESP = fl(60, 'in_pas_2');
const trabEq = mi => mi >= PARADA_PAULO ? 0 : sum(['clinica_jf', 'clinica_normal', 'clinica_dez', 'bonus_clinica'].map(id => { const it = INC[id]; return valorLinha(it, mi) * it.dates.length / 12; })) + (mi < PARADA_RENATA ? stepVal(INC.salario_renata, mi) : 0) + (mi < PARADA_RENATA ? stepVal(INC.decimo_renata && INC.salario_renata, mi) / 12 : 0);
{
  // gasto total do mês depois da liberdade = max(desejado, renda do mês) enquanto houver caixa
  const linhas = P.expenses; const res = []; let primeiroSemCaixa = null;
  for (let mi = FF.mi; mi <= MI_MAX; mi++) {
    const m = MES[mi]; const out = sum(Object.keys(m.fluxo).filter(k => /^out_/.test(k) && k !== 'out_rendas').map(k => m.fluxo[k]));
    const pas = GL.pasEq(mi) - (mi === 52 ? 0 : 0), trab = trabEq(mi), esp = Math.max(GL.D, pas + trab);
    if (m.fim.cofre <= 0.005 && primeiroSemCaixa == null) primeiroSemCaixa = mi;
    res.push({ mi, out, esp, dif: out - esp, semCaixa: primeiroSemCaixa != null });
  }
  const com = res.filter(r => !r.semCaixa);
  ACH.push({ t: 'G', primeiroSemCaixa, gastoIni: res[1].out, desired: GL.D });
  chk('Liberdade', 'Gasto do mês depois da liberdade (mi 53 até o caixa acabar) = max(renda desejada 50.000; renda do mês)', 'recalcula a renda equivalente mensal de cada pessoa e compara com Σ out_* (sem out_rendas)', com.length + ' meses (mi ' + FF.mi + '..' + (com.length ? com[com.length - 1].mi : '') + ')', max(com.map(r => Math.abs(r.dif))), 0.5, 'a regra gasta TODA a renda quando ela passa de 50.000 (ver seção 5 do laudo)');
  chk('Liberdade', 'Caixa zera em ' + (primeiroSemCaixa != null ? rot(primeiroSemCaixa) : 'n/d') + ' (mi ' + primeiroSemCaixa + ', Paulo com ' + (idadePaulo + primeiroSemCaixa / 12).toFixed(1) + ' anos) e o motor NÃO dispara ruína (ruina=' + JSON.stringify(EXT.ruina) + ')', 'procura o primeiro mês com cofre=0; a regra só marca ruína se o cofre fechar o mês NEGATIVO', 'mi ' + FF.mi + '..' + MI_MAX, 0, 0, 'sem alerta; o gasto passa a ser só a renda passiva');
  const forcado = EXT.ff.forced, pend = OBJ.filter(o => o.months > FF.mi).reduce((a, o) => a + EXT.objetivos.find(x => x.id === o.id).amount, 0);
  const gapMax = Math.max(...Array.from({ length: 400 }, (_, mm) => Math.max(0, GL.D - GL.pasEq(FF.mi + mm) - trabEq(FF.mi + mm))));
  const sust = (EXT.ff.finBefore - pend) * P.rate >= gapMax;
  chk('Liberdade', 'Liberdade "forçada" (o patrimônio não sustenta 50.000/mês): maior falta mensal e renda sustentável', 'maxGap esperado ' + f2(gapMax) + ' (obs ' + f2(EXT.ff.maxGap) + '); sustentável esperado ' + f2(EXT.ff.finBefore * P.rate + (GL.D - gapMax)) + ' (obs ' + f2(EXT.ff.sustentavel) + ')', '1 evento', Math.abs(gapMax - EXT.ff.maxGap) + Math.abs(EXT.ff.finBefore * P.rate + (GL.D - gapMax) - EXT.ff.sustentavel) + (sust === !forcado ? 0 : 1), 0.01);
  // quanto o plano gasta a mais do que o cliente descreveu (linhas do plano + parcelas), de mi 53 até o Paulo parar
  let extra = 0, extraFV = 0, nExtra = 0;
  for (let mi = FF.mi; mi < PARADA_PAULO; mi++) {
    const m = MES[mi];
    const plano = sum(P.expenses.map(e => stepVal(e, mi) * (e.days || [5]).length)) - (mi >= 62 ? stepVal(P.expenses.find(e => e.id === 'parc_cons_carro'), mi) : 0) + (mi <= 120 ? (mi <= 61 ? BRU.p : BRU.nova) : 0);
    const obs = sum(Object.keys(m.fluxo).filter(k => /^out_/.test(k) && k !== 'out_rendas').map(k => m.fluxo[k]));
    extra += obs - plano; extraFV += (obs - plano) * Math.pow(1.004, PARADA_PAULO - mi); nExtra++;
  }
  ACH.push({ t: 'extra', extra, extraFV, meses: nExtra, de: FF.mi, ate: PARADA_PAULO });
  // parcelas de contrato depois da liberdade: o que sai × o que o contrato manda
  let exApto = 0, exCasa = 0, exCarro = 0, maxCasa = 0, maxApto = 0;
  for (let mi = FF.mi; mi <= 190; mi++) {
    exApto += fl(mi, 'out_fix_parc_apto') - (mi <= 188 ? APTO.parcC(mi) : 0); exCasa += fl(mi, 'out_fix_parc_casa') - (mi <= 148 ? 4000 : 0);
    maxCasa = Math.max(maxCasa, Math.abs(fl(mi, 'out_fix_parc_casa') - (mi <= 148 ? 4000 : 0))); maxApto = Math.max(maxApto, Math.abs(fl(mi, 'out_fix_parc_apto') - (mi <= 188 ? APTO.parcC(mi) : 0)));
  }
  for (let mi = FF.mi; mi <= 62; mi++) exCarro += fl(mi, 'out_fix_parc_cons_carro') - CARRO.nova;
  ACH.push({ t: 'contratoPosFF', exApto, exCasa, exCarro, maxCasa, maxApto });
  chk('Dívidas', 'Depois da liberdade (mi ≥ 53) a parcela da casa de campo que sai do fluxo é a do contrato (4.000)', 'out_fix_parc_casa(mi) − 4.000', 'mi 53..190', maxCasa, 0.01, 'excesso pago sobre o contrato: apto R$ ' + f0(exApto) + '; casa R$ ' + f0(exCasa) + '; carro R$ ' + f0(exCarro) + ' (a despesa é "esticada" até a renda)');
  chk('Dívidas', 'Depois da liberdade a parcela do apartamento que sai do fluxo é a do contrato (SAC 8,99%)', 'out_fix_parc_apto(mi) − [4.166,67 + saldoC·i]', 'mi 53..188', maxApto, 0.01);
}

// ---------- H. Fidelidade ao cliente ----------
{
  const H_ = [];
  const add = (q, esp, obs, tol) => { const e = Math.abs(esp - obs); H_.push({ q, esp, obs, e, ok: e <= tol }); };
  add('SAC do apartamento: amortização fixa (R$)', 4166.67, 1000000 / 240, 0.01);
  add('SAC: saldo contratual após 52 parcelas (cenário 783.333)', 783333, APTO.saldoC(0), 1);
  add('SAC: saldo no motor (informado 783.000)', 783000, MES[0].fim.det.divs[0], 0.01);
  add('SAC: 1ª parcela (cenário 11.366; conta 11.363,6)', 11366, 1000000 * APTO.i + APTO.amC, 3);
  add('SAC: parcela de hoje (9.806): cenário × lançada em mi 1', 9806, fl(1, 'out_fix_parc_apto'), 0.01);
  add('Consórcio da casa: total 720.000', 720000, CASA.total, 0.01);
  add('Consórcio da casa: parcela 4.000', 4000, fl(1, 'out_fix_parc_casa'), 0.01);
  add('Consórcio da casa: última parcela em fev/2039 (mi 148): parcela paga no mi 148', 4000, fl(148, 'out_fix_parc_casa'), 0.01);
  add('Crédito novo: parcela 5.514 (primeira no mês 6)', 5514, fl(6, 'out_fix_parc_cred'), 1);
  add('Crédito novo: entrada de R$ 150.000 no mês 5', 150000, fl(5, 'in_credito_cr_sab'), 0.01);
  add('Participação mês 12 (1.484.000)', 1484000, MES[12].fim.part, 1);
  add('Participação mês 30 (1.919.544)', 1919544, MES[30].fim.part, 1);
  add('Participação mês 60 (2.220.561)', 2220561, MES[60].fim.part, 1);
  add('Participação depois do mês 60 constante', 2220561, MES[200].fim.part, 1);
  add('Consórcio da Bruna: total 833.000', 833000, BRU.total, 0.01);
  add('Consórcio da Bruna: saldo na contemplação 409.558', 409558, BRU.saldoApos, 1);
  add('Consórcio da Bruna: lance 122.867', 122867, BRU.lance, 1);
  add('Consórcio da Bruna: lance do bolso (52.867); "necessário" do objetivo', 52867, EXT.objetivos[3].amount, 1);
  add('Consórcio da Bruna: crédito para o bem (cenário: 700.000 − 70.000 = 630.000) × bem que o motor registra ao fim (bens do objetivo)', 630000, MES[200].fim.bens - 3130000, 1);
  ACH.push({ t: 'fidelidade', linhas: H_ });
  chk('Fidelidade', 'Saídas-chave do motor × valores esperados do cenário', H_.length + ' valores comparados', H_.length + ' valores', max(H_.map(x => x.ok ? 0 : x.e)), 0, H_.filter(x => !x.ok).map(x => x.q + ': esperado ' + f2(x.esp) + ', motor ' + f2(x.obs)).join(' | '));
}

// ---------- T. Testes de estresse com planos modificados (em memória; o plano original não é tocado) ----------
const TESTES = [];
function teste(nome, fn) { try { TESTES.push(Object.assign({ nome }, fn())); } catch (e) { TESTES.push({ nome, erro: String(e && e.stack || e) }); } }
const variante = alt => { const Q = dados(); alt(Q); return observa(Q); };
const doMes = (O, mi) => O.ext.meses.find(m => m.mi === mi);
const flv = (O, mi, k) => (doMes(O, mi) && doMes(O, mi).fluxo[k]) || 0;

// T1 — venda da participação com preço, custos em % e em R$, parte do líquido para o objetivo da Bruna
teste('T1 venda da participação (mi 48, preço R$ 2.600.000, custos 5% + R$ 10.000, R$ 100.000 para o apto da Bruna)', () => {
  const O = variante(Q => { Q.patrimonio.participacoes[0].venda = { em: 48, preco: 2600000, custos: [{ nome: 'corretagem', pct: 5 }, { nome: 'fixo', valor: 10000 }], destinos: [{ objetivo: 'apto_bruna', valor: 100000 }] }; });
  const pp = JSON.parse(JSON.stringify(part)); pp.valorizacao = pp.valorizacao.concat({ tipo: 'alvo', em: 48, valor: 2600000 });
  const esp = serieParticipacao(pp, 60);
  const e = []; for (let mi = 0; mi < 48; mi++) e.push(Math.abs(esp[mi] - doMes(O, mi).fim.part));
  const preco = 2600000, custos = preco * 0.05 + 10000, liquido = preco - custos;
  const ev = O.ext.eventos.find(x => x.type === 'venda');
  const antes = doMes(O, 47), dep = doMes(O, 48);
  const dFin = dep.fim.fin - antes.fim.fin;                          // variação do financeiro no mês da venda (inclui o rendimento e o fluxo normal)
  const flu = sum(Object.keys(dep.fluxo).filter(k => /^in_/.test(k)).map(k => dep.fluxo[k])) - sum(Object.keys(dep.fluxo).filter(k => /^out_/.test(k)).map(k => dep.fluxo[k]));
  return {
    pre_venda: max(e), part_depois: max([48, 49, 100, 300].map(mi => Math.abs(doMes(O, mi).fim.part))),
    preco: Math.abs(-flv(O, 48, 'mov_bens') - preco), custos: Math.abs(flv(O, 48, 'out_vendap_0') - custos), destinoObjetivo: Math.abs(flv(O, 48, 'mov_obj_apto_bruna') - 100000),
    liquidoNoFinanceiro: dFin - flu, liquidoEsperadoMenosRendimento: liquido, evento: ev && ev.detail, parteEsperada: esp[48],
    nota: 'o motor retira da participação o valor do mês anterior (ultimoP) e lança o preço no caixa; com alvo = preço, valor(mi48) = preço'
  };
});
// T2 — desvalorização: taxa negativa e queda pontual maior que o valor (piso em zero), pontual em %
teste('T2 desvalorização: −30% a.a. por 5 anos, queda pontual de 20% no mês 20 e de R$ 5.000.000 no mês 40 (piso zero)', () => {
  const O = variante(Q => { Q.patrimonio.participacoes[0].valorizacao = [{ tipo: 'taxa', pct: -30, de: 0, anos: 5 }, { tipo: 'pontual', em: 20, pct: -20 }, { tipo: 'pontual', em: 40, valor: -5000000 }]; });
  const esp = serieParticipacao({ valor: 1400000, valorizacao: [{ tipo: 'taxa', pct: -30, de: 0, anos: 5 }, { tipo: 'pontual', em: 20, pct: -20 }, { tipo: 'pontual', em: 40, valor: -5000000 }] }, 100);
  const e = []; for (let mi = 0; mi <= 100; mi++) e.push(Math.abs(esp[mi] - doMes(O, mi).fim.part));
  return { erroMax: max(e), minimo: Math.min(...Array.from({ length: 101 }, (_, mi) => doMes(O, mi).fim.part)), em20: [esp[19], esp[20], doMes(O, 20).fim.part] };
});
// T3 — venda do bem com saldo devedor (casa de campo): quitação, custos, parcela termina
teste('T3 venda da casa de campo (mi 40, R$ 900.000, custo 6%, consórcio quitado na venda)', () => {
  const O = variante(Q => { Q.patrimonio.bens[1].venda = { em: 40, preco: 900000, custos: [{ nome: 'corretagem', pct: 6 }] }; });
  const quit = 592000 - 4000 * 40, custo = 54000, liquido = 900000 - custo - quit;
  const f = doMes(O, 40).fluxo;
  const antes = doMes(O, 39), dep = doMes(O, 40);
  return {
    quitacao: Math.abs((f.out_quita_1 || 0) - quit), custos: Math.abs((f.out_venda_1 || 0) - custo), precoEntra: Math.abs(-(f.mov_bens || 0) - 900000 + 0),
    bensCai: Math.abs((antes.fim.det.bens[1] - 800000)) + Math.abs(dep.fim.det.bens[1]), dividaCasa: [antes.fim.det.divs[1], dep.fim.det.divs[1]], parcelaPara: [flv(O, 39, 'out_fix_parc_casa'), flv(O, 40, 'out_fix_parc_casa'), flv(O, 41, 'out_fix_parc_casa')], liquidoEsperado: liquido,
    liquidoNoFluxo: (900000 - (f.out_venda_1 || 0) - (f.out_quita_1 || 0))
  };
});
// T4 — amortização antecipada no apartamento (R$ 100.000 no mês 12, modo prazo)
teste('T4 amortização antecipada de R$ 100.000 no apartamento (mês 12, modo prazo)', () => {
  const O = variante(Q => { Q.patrimonio.bens[0].amortizacoes = [{ em: 12, valor: 100000, modo: 'prazo' }]; });
  const B0 = 783000, am = B0 / 188;
  const esp = k => k <= 12 ? B0 - am * k : Math.max(0, B0 - am * k - 100000);
  const obs = k => doMes(O, k).fim.det.divs[0];
  const quando = (() => { for (let k = 13; k < 200; k++) if (obs(k) <= 0.005) return k; return null; })(), quandoEsp = (() => { for (let k = 13; k < 200; k++) if (esp(k) <= 0.005) return k; return null; })();
  return { dif: [11, 12, 13, 14, 60].map(k => ({ k, esperado: esp(k), motor: obs(k), dif: obs(k) - esp(k) })), zeraEm: quando, zeraEsperado: quandoEsp };
});
// T5 — juros da dívida com a reserva negativa (patrimônio financeiro pequeno)
teste('T5 reserva negativa: financeiro livre de R$ 200.000 (sem caixinhas dedicadas): juros de 4% a.m. sobre o que ficou em aberto', () => {
  const O = variante(Q => { Q.patrimonio.financeiro[0].valor = 100000; Q.patrimonio.financeiro[1].valor = 100000; Q.objectives.forEach(o => { o.dedicated = 0; }); });
  const e = []; let nMeses = 0, primeiro = null;
  for (let mi = 2; mi <= 80; mi++) {
    const a = doMes(O, mi - 1), b = doMes(O, mi); if (!a || !b) continue;
    const dev = a.fim.cofre < -0.5 ? -a.fim.cofre : 0;
    const esp = dev * 0.04; const obs = b.fluxo.out_juros || 0;
    if (dev > 0) { nMeses++; if (primeiro == null) primeiro = mi; }
    e.push(Math.abs(esp - obs));
  }
  return { erroMax: max(e), mesesComDivida: nMeses, ruina: O.ext.ruina, primeiroMesComJuros: primeiro, minCofre: Math.min(...O.ext.meses.map(m => m.fim.cofre)), teto: O.s.tetoDivida };
});
// T6 — aporte necessário de cada objetivo sem patrimônio dedicado, e o aporte que para quando a caixinha já basta
teste('T6 aporte mensal necessário sem patrimônio dedicado (cenário: 773 / 5.967 / 17.857) e parada do aporte quando basta', () => {
  const O = variante(Q => { Q.objectives.forEach(o => { o.dedicated = 0; }); });
  // fator de n aportes de 1, no FIM de cada mês (convenção do cenário): Σ_{j=1..n} Π_{k>j}(1+r_k); com troca de taxa
  const fatorFim = (n, r1, r2, troca) => { const taxa = k => k < troca ? r1 : r2; let acc = 0; for (let k = 0; k < n; k++) acc = acc * (1 + taxa(k)) + 1; return acc; };
  const alvo = { sabatico: 90000, faculdade_davi: 150000, reforma_campo: 200000, apto_bruna: Math.ceil(BRU.bolso) };
  const meses = { sabatico: 5, faculdade_davi: 24, reforma_campo: 36, apto_bruna: 60 }, perfil = { sabatico: 0.004, faculdade_davi: 0.004, reforma_campo: 0.005, apto_bruna: 0.005 }, troca = { sabatico: 0, faculdade_davi: 0, reforma_campo: 12, apto_bruna: 36 };
  const res = EXT_REQ(O);
  function EXT_REQ(Oo) { return Oo.ext.objetivos.map(o => ({ id: o.id, requiredMotor: o.required, amount: o.amount })); }
  const out = res.map(r => { const f = fatorFim(meses[r.id], perfil[r.id], 0.004, troca[r.id]); return { id: r.id, fator: f, esperado: alvo[r.id] / f, motor: r.requiredMotor, dif: r.requiredMotor - alvo[r.id] / f }; });
  // simulação com o aporte igual ao necessário: o que a caixinha junta na data
  const O2 = variante(Q => { Q.objectives.forEach(o => { o.dedicated = 0; o.planned = Math.ceil(out.find(x => x.id === o.id).motor); }); });
  const real = O2.ext.objetivos.map(o => ({ id: o.id, juntou: o.real, alvo: o.amount, status: o.status }));
  const apt2 = O2.ext.meses.filter(m => m.fluxo.mov_obj_apto_bruna != null).map(m => ({ mi: m.mi, v: m.fluxo.mov_obj_apto_bruna }));
  // aporte 10x maior que o necessário: deve parar quando a caixinha já basta
  const O3 = variante(Q => { Q.objectives.forEach(o => { o.dedicated = 0; o.planned = 10 * Math.ceil(out.find(x => x.id === o.id).motor); }); });
  const para = O3.ext.objetivos.map(o => { const k = O3.ext.objetivos.indexOf(o); const ap = O3.ext.meses.filter(m => (m.fluxo['mov_obj_' + o.id] || 0) > 0).map(m => m.mi); return { id: o.id, ultimoAporte: ap.length ? Math.max(...ap) : null, totalAportes: sum(O3.ext.meses.map(m => Math.max(0, m.fluxo['mov_obj_' + o.id] || 0))), juntou: o.real, alvo: o.amount, prazo: o.months }; });
  return { fatores: out, simulacao: real, para, mesesAporteBruna: apt2.length };
});
// T7 — sem o crédito de R$ 150.000: quanto o empréstimo custa ao patrimônio
teste('T7 plano sem o crédito do sabático (o caixa nunca faltou): custo do empréstimo no patrimônio', () => {
  const O = variante(Q => { Q.creditos = []; Q.expenses = Q.expenses.filter(e => e.id !== 'parc_cred'); });
  const nw = (O_, mi) => { const m = doMes(O_, mi); return m.fim.fin + m.fim.bens + m.fim.part + m.fim.prev - m.fim.div; };
  return { cofreMinimoComCredito: Math.min(...EXT.meses.filter(m => m.mi <= 20).map(m => m.fim.cofre)), cofreMinimoSemCredito: Math.min(...O.ext.meses.filter(m => m.mi <= 20).map(m => m.fim.cofre)),
    nwDif: [41, 60, 100, 170].map(mi => ({ mi, comCredito: nw(OBS, mi), semCredito: nw(O, mi), custo: nw(O, mi) - nw(OBS, mi) })) };
});

// ---------- achados adicionais (cálculos independentes) ----------
{
  // constantes do plano
  chk('Caixinhas', 'Perfis (conservador 0,4%, moderado 0,5%, agressivo 0,6% a.m.), rendimento da reserva 0,4% a.m., 24 meses conservadores, juros da dívida 4% a.m.', 'compara o extrato com o plano', '6 constantes', Math.abs(EXT.PROFILES.conservador - 0.004) + Math.abs(EXT.PROFILES.moderado - 0.005) + Math.abs(EXT.PROFILES.agressivo - 0.006) + Math.abs(EXT.R_M - 0.004) + Math.abs(EXT.MESES_CONSERVADOR - 24) + Math.abs(EXT.JUROS_DIVIDA_M - 0.04), 1e-12);
  // taxaPorMes do extrato × regra, mês a mês
  let e = 0, n = 0; OBJ.forEach((o, k) => EXT.objetivos[k].taxaPorMes.forEach((r, mi) => { e = Math.max(e, Math.abs(r - taxaEsperada(o, mi))); n++; }));
  chk('Caixinhas', 'Tabela de taxas por mês do objetivo (taxaPorMes) = regra do domínio: perfil até 24 meses antes da data, conservadora depois (e desde o início se o prazo é ≤ 24)', 'taxaEsperada(objetivo, mês) para cada mês de cada caixinha', n + ' pares objetivo×mês', e, 1e-12);
  // a semana exata em que cada troca ocorreu no motor
  const trocas = RES_D.filter(r => r.mesTroca != null).map(r => {
    const sem = r.semanasForaDoIdeal[0]; const d = sem ? semanaTem5(sem.i) : null;
    return { id: r.o.id, mesTroca: r.mesTroca, rotulo: rot(r.mesTroca), semanasComTaxaAntigaNoMesDaTroca: r.semanasForaDoIdeal.length, semana: sem && sem.i, dia5: d && d.toISOString().slice(0, 10) };
  });
  ACH.push({ t: 'trocas', trocas });
  // saldo na data: projeção mensal (fórmula do cenário) × simulação semanal
  ACH.push({ t: 'projetadoXreal', linhas: EXT.objetivos.map(o => ({ id: o.id, projetado: o.projected, real: o.real, dif: o.real - o.projected, amount: o.amount })) });
  // parcelas realmente pagas no caixa × parcelas restantes do contrato
  const cont = (k, ate) => { let c = 0; for (let mi = 1; mi <= ate; mi++) if (fl(mi, k) > 0) c++; return c; };
  const nCash = { apto: cont('out_fix_parc_apto', 300), casa: cont('out_fix_parc_casa', 300), carro: cont('out_fix_parc_cons_carro', 300), cred: cont('out_fix_parc_cred', 300), bruna: cont('out_fix_apto_bruna_compra', 300) };
  ACH.push({ t: 'nParcelasCaixa', nCash });
  chk('Dívidas', 'Número de parcelas que saem do caixa = parcelas restantes do contrato: apartamento (188)', 'conta meses com out_fix_parc_apto > 0 (mi ≥ 1)', 'mi 1..300', Math.abs(nCash.apto - 188), 0, 'caixa pagou ' + nCash.apto + ' de 188: a última parcela (nº 240) nunca sai do caixa, mas o saldo devedor zera em mi 188');
  chk('Dívidas', 'Número de parcelas que saem do caixa = parcelas restantes: casa de campo (148)', 'conta meses com out_fix_parc_casa > 0', 'mi 1..300', Math.abs(nCash.casa - 148), 0, 'caixa pagou ' + nCash.casa + ' de 148');
  chk('Dívidas', 'Número de parcelas que saem do caixa = parcelas restantes: consórcio do carro (62)', 'conta meses com out_fix_parc_cons_carro > 0', 'mi 1..300', Math.abs(nCash.carro - 62), 0, 'caixa pagou ' + nCash.carro + ' de 62');
  chk('Dívidas', 'Número de parcelas que saem do caixa = parcelas do contrato: crédito do sabático (36) e consórcio da Bruna (120)', 'conta meses com parcela > 0', 'mi 1..300', Math.abs(nCash.cred - 36) + Math.abs(nCash.bruna - 120), 0);
  // soma da escada anual do apartamento (linha lançada) contra o contrato recalculado, até a quitação
  let somaLinha = 0, somaContrato = 0; for (let mi = 1; mi <= 187; mi++) { somaLinha += stepVal(P.expenses.find(x => x.id === 'parc_apto'), mi); }
  for (let mi = 1; mi <= 188; mi++) somaContrato += APTO.parcC(mi);
  ACH.push({ t: 'aptoLinhaXContrato', somaLinha, somaContrato, dif: somaLinha - somaContrato, jurosContrato: somaContrato - 783333.33, jurosLinha: somaLinha - 783000 });
  // Funpresp: concessão × último salário
  ACH.push({ t: 'funpresp', fatorImplicito: (() => { const f = P.patrimonio.financeiro[2]; let v = f.valor; for (let mi = 1; mi <= 52; mi++) v = v * 1.004 + f.conv.contribPatroc + f.conv.contribPessoa; return v / (EXT_RENDA_FUNPRESP * 12); })(), mesConcessao: Math.min(...EXT.meses.filter(m => fl(m.mi, 'in_pas_2') > 0).map(m => m.mi)), salarioUltimoMes: Math.max(...EXT.meses.filter(m => fl(m.mi, 'in_salario_renata') > 0).map(m => m.mi)), renda: EXT_RENDA_FUNPRESP,
    saldoNaData: (() => { const f = P.patrimonio.financeiro[2]; let v = f.valor; for (let mi = 1; mi <= 52; mi++) v = v * 1.004 + f.conv.contribPatroc + f.conv.contribPessoa; return v; })() });
  // depois do caixa: déficit em relação ao desejado
  const semCaixa = EXT.meses.filter(m => m.mi >= 480).map(m => ({ gasto: sum(Object.keys(m.fluxo).filter(k => /^out_/.test(k)).map(k => m.fluxo[k])) }));
  ACH.push({ t: 'deficitDesejado', meses: semCaixa.length, gastoMedio: sum(semCaixa.map(x => x.gasto)) / semCaixa.length, faltaTotal: sum(semCaixa.map(x => 50000 - x.gasto)), de: 480, ate: MI_MAX, idadeInicio: idadePaulo + 480 / 12, idadeFim: idadePaulo + MI_MAX / 12 });
  const gastoMes = mi => sum(Object.keys(MES[mi].fluxo).filter(k => /^out_/.test(k)).map(k => MES[mi].fluxo[k]));
  ACH.push({ t: 'padrao', gasto52: gastoMes(52), gasto54: gastoMes(54), rendaEq54: GL.pasEq(54) + trabEq(54) });
  const nwDe = m => m.fim.fin + m.fim.bens + m.fim.part + m.fim.prev - m.fim.div;
  ACH.push({ t: 'carroNW', nw17: nwDe(MES[17]), nw18: nwDe(MES[18]), dPrev: MES[18].fim.prev - MES[17].fim.prev, dDiv: MES[18].fim.div - MES[17].fim.div });
  ACH.push({ t: 'brunaBem', bemObjetivoMi60: MES[60].fim.bens - 3130000, bemObjetivoFim: MES[200].fim.bens - 3130000, preco: 700000, creditoUtil: BRU.credito, caixaPagoTotal: 833000 - BRU.emb, parte: BRU.parteBem });
}
teste('T4b amortização antecipada: modo "parcela", e valor acima do saldo (limite)', () => {
  const O = variante(Q => { Q.patrimonio.bens[0].amortizacoes = [{ em: 12, valor: 100000, modo: 'parcela' }]; });
  const B12 = 783000 - 783000 / 188 * 12, pos = B12 - 100000, am2 = pos / 176;
  const esp = k => k <= 12 ? 783000 - 783000 / 188 * k : Math.max(0, pos - am2 * (k - 12));
  const dif = [13, 14, 60, 100, 187].map(k => ({ k, esperado: esp(k), motor: doMes(O, k).fim.det.divs[0], dif: doMes(O, k).fim.det.divs[0] - esp(k) }));
  const O2 = variante(Q => { Q.patrimonio.bens[0].amortizacoes = [{ em: 12, valor: 5000000, modo: 'prazo' }]; });
  return { dif, valorAcimaDoSaldo: { k12: doMes(O2, 12).fim.det.divs[0], k13: doMes(O2, 13).fim.det.divs[0], k14: doMes(O2, 14).fim.det.divs[0] } };
});
teste('T6b aporte que para quando a caixinha já basta (capacidade de poupança ampla: +R$ 400.000/mês de renda de teste)', () => {
  const O = variante(Q => {
    Q.incomes.push({ id: 'teste_renda', label: 'renda de teste', kind: 'ativa', pessoa: 'titular', gross: 0, frequency: 'mensal', days: [5], steps: [{ from: 0, value: 400000 }] });
    Q.objectives.forEach(o => { o.dedicated = 0; o.planned = { sabatico: 40000, faculdade_davi: 20000, reforma_campo: 15000, apto_bruna: 5000 }[o.id]; });
  });
  return O.ext.objetivos.map(o => {
    const ap = O.ext.meses.filter(m => (m.fluxo['mov_obj_' + o.id] || 0) > 0).map(m => ({ mi: m.mi, v: m.fluxo['mov_obj_' + o.id] }));
    const tot = sum(ap.map(x => x.v)), ult = ap.length ? ap[ap.length - 1] : null;
    return { id: o.id, alvo: o.amount, prazo: o.months, juntouNaData: o.real, aportes: ap.length, totalAportes: tot, ultimoAporte: ult, planejado: o.planned, aporteCheioSeriaTotal: o.planned * o.months };
  });
});
teste('T8 venda do apartamento financiado (SAC, mi 60, R$ 2.500.000, custo 6%): quitação do saldo informado', () => {
  const O = variante(Q => { Q.patrimonio.bens[0].venda = { em: 60, preco: 2500000, custos: [{ nome: 'corretagem', pct: 6 }] }; });
  const f = doMes(O, 60).fluxo;
  return { quitacaoEsperadaDepoisDaParcela60: APTO.saldo(60), quitacaoMotor: f.out_quita_0 || 0, custoMotor: f.out_venda_0 || 0, parcelaMi59: flv(O, 59, 'out_fix_parc_apto'), parcelaMi60: flv(O, 60, 'out_fix_parc_apto'), saldoMi59: doMes(O, 59).fim.det.divs[0], saldoMi60: doMes(O, 60).fim.det.divs[0] };
});

{
  // o extrato gravado no disco é o mesmo que o motor produz agora?
  try {
    const gravado = JSON.parse(fs.readFileSync(path.join(RAIZ, 'ux', 'auditoria', 'extratos', 'extrato-04.json'), 'utf8'));
    let e = 0; gravado.meses.forEach((m, k) => { const o = EXT.meses[k]; e = Math.max(e, Math.abs(m.fim.fin - o.fim.fin), Math.abs(m.fim.div - o.fim.div), Math.abs(m.fim.bens - o.fim.bens), Math.abs(m.fim.part - o.fim.part)); });
    chk('Contabilidade geral', 'O extrato gravado (extrato-04.json) é reproduzido pelo motor atual', 'compara fin, bens, part, div de todos os meses', gravado.meses.length + ' meses', e + Math.abs(gravado.meses.length - EXT.meses.length), 1e-6);
  } catch (err) { chk('Contabilidade geral', 'O extrato gravado é reproduzido pelo motor atual', 'leitura do arquivo', '-', 1, 0, String(err)); }
}

{
  // diagnóstico (usa o motor só para EXPLICAR uma diferença, nunca para produzir o esperado)
  const ct = OBS.E.contratoDaDivida(JSON.parse(JSON.stringify(P.patrimonio.bens[0])));
  ACH.push({ t: 'diagMotorApto', taxaMensalImplicita: ct.i, taxaAnualImplicita: ct.juros, iofAcrescentado: ct.iof, financiado: ct.financiado, saldoContratualHoje: ct.saldoHoje, razaoDeEscala: 783000 / ct.saldoHoje, taxaMensalDoCliente: APTO.i, taxaAnualDoCliente: 0.0899 });
  // IOF PF do crédito novo (0,38% + 0,0082% ao dia sobre cada amortização, máx. 365 dias): o que o contrato real teria e o motor não lança
  let iof = 150000 * 0.0038; CRED.pg.forEach(p => { iof += p.a * 0.000082 * Math.min(365, 30 * p.k); });
  ACH.push({ t: 'iofCredito', iof });
  // soma da parcela lançada x contrato no trecho pré-liberdade (mi 1..52)
  let dd = 0; for (let mi = 1; mi < FF.mi; mi++) dd += fl(mi, 'out_fix_parc_apto') - APTO.parcC(mi);
  ACH.push({ t: 'aptoPreFF', excessoPago: dd });
  // equivalente do consórcio da Bruna no passivo omitido
  const omit = mi => { if (mi < 1) return 0; const p = mi; return mi <= 61 ? BRU.total - BRU.p * Math.min(mi, 61) : (BRU.saldoApos - BRU.lance) - BRU.nova * (mi - 61); };
  ACH.push({ t: 'passivoOmitidoBruna', mi30: omit(30), mi60: omit(60), mi61: omit(61), mi100: omit(100) });
}

teste('T1b participação com alvo (R$ 2.000.000 em 24 meses) + taxa de 3% a.a. depois + queda pontual de 10% no mês 10', () => {
  const val = [{ tipo: 'alvo', em: 24, valor: 2000000 }, { tipo: 'taxa', pct: 3, de: 0, anos: 20 }, { tipo: 'pontual', em: 10, pct: -10 }];
  const O = variante(Q => { Q.patrimonio.participacoes[0].valorizacao = val; });
  const esp = serieParticipacao({ valor: 1400000, valorizacao: val }, 100);
  return { erroMax: max(Array.from({ length: 101 }, (_, mi) => Math.abs(esp[mi] - doMes(O, mi).fim.part))), mes24: [esp[24], doMes(O, 24).fim.part], mes30: [esp[30], doMes(O, 30).fim.part] };
});
teste('T1c venda da participação com renda ligada (part.renda = "bonus_clinica"): a renda termina na venda?', () => {
  const O = variante(Q => { const p = Q.patrimonio.participacoes[0]; p.renda = 'bonus_clinica'; p.venda = { em: 24, preco: 2000000, custos: [] }; });
  const antes = flv(O, 23, 'in_bonus_clinica') + flv(O, 26, 'in_bonus_clinica'), depois = flv(O, 29, 'in_bonus_clinica') + flv(O, 32, 'in_bonus_clinica');
  return { bonusAntesDaVenda_mi23_26: antes, bonusDepoisDaVenda_mi29_32: depois, encerrou: depois === 0 };
});

module.exports = { CHK, ACH, RES_D, EFEITO, REND, ACC, APTO, CASA, CRED, CARRO, BRU, PART_ESP, MES, EXT, S, P, OBS, rot, TESTES, FF, PARADA_PAULO, PARADA_RENATA };
if (require.main === module) {
  const bad = CHK.filter(c => !c.ok);
  CHK.forEach(c => console.log((c.ok ? 'OK    ' : 'FALHA ') + String(c.n).padStart(2) + ' [' + c.frente + '] ' + c.desc + ' | erro máx ' + c.err.toExponential(2) + (c.nota ? ' | ' + c.nota : '')));
  console.log('\n' + CHK.length + ' conferências; ' + bad.length + ' fora da tolerância');
  const fr = {}; CHK.forEach(c => { fr[c.frente] = fr[c.frente] || { n: 0, ok: 0 }; fr[c.frente].n++; if (c.ok) fr[c.frente].ok++; });
  console.log('Por frente:', JSON.stringify(fr));
  console.log('\n=== achados numéricos ===\n' + JSON.stringify(ACH, null, 1));
  console.log('\n=== efeito da taxa (saldo na data) ===\n' + JSON.stringify(EFEITO, null, 1));
  console.log('\n=== testes de estresse ===\n' + JSON.stringify(TESTES, null, 1));
}
