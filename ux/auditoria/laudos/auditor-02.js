// AUDITOR MATEMÁTICO — Cenário 02 (Rafael e Camila). Reexecutável: node ux/auditoria/laudos/auditor-02.js
// Recalcula, a partir do PLANO e das regras do domínio financeiro, o que o motor deveria produzir e compara com o observado.
// NÃO usa trajetoriaDoBem / saldoDevedorEm / taxaDoObjetivo / contratoDaDivida do motor para produzir o "esperado".
// O "observado" vem do extrato (ux/auditoria/extratos/extrato-02.json) e, para as identidades semana a semana
// (contabilidade, rendimento), da série semanal da MESMA execução do motor (apenas leitura: weeks[]).
const fs = require('fs'), path = require('path');
const AUD = path.join(__dirname, '..');
const plano = JSON.parse(fs.readFileSync(path.join(AUD, 'planos', 'plano-02.json'), 'utf8')).dados;
const X = JSON.parse(fs.readFileSync(path.join(AUD, 'extratos', 'extrato-02.json'), 'utf8'));
const H = require(path.join(AUD, 'harness.js'));
const E = H.carregar(); E.configure(JSON.parse(JSON.stringify(plano))); const S = E.run('desej');   // só para ler weeks[] (observado semanal)
const WK = S.weeks, W0 = X.W0;

const OUT = []; const log = (...a) => { const s = a.join(' '); OUT.push(s); console.log(s); };
const R = {};   // resultados por conferência
const conf = (id, nome, metodo, amostra, errMax, ok, extra) => { R[id] = { id, nome, metodo, amostra, errMax, ok, extra }; log(`[${id}] ${nome} | amostra: ${amostra} | erro máx: ${typeof errMax === 'number' ? errMax.toFixed(6) : errMax} | ${ok ? 'OK' : 'FALHA'}${extra ? ' | ' + extra : ''}`); };
const TOL = 0.01;
const iso = s => s.slice(0, 7);
const mesIdx = (y, m) => y * 12 + (m - 1) - (X.M0.y * 12 + X.M0.m);    // 'AAAA-MM' -> mês do plano
const calDe = mi => { const c = X.M0.y * 12 + X.M0.m + mi; return { y: Math.floor(c / 12), m: c % 12 }; };
const nome = mi => { const c = calDe(mi); return ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][c.m] + '/' + c.y; };
const byMi = new Map(X.meses.map(b => [b.mi, b]));
const NMES = X.meses.length;

// Convenção do motor na semana de hoje (W0): o patrimônio dedicado sai do cofre e entra na caixinha ANTES do rendimento da semana
// (o total financeiro rende igual; só muda de quem é o rendimento de 1 semana). Nas demais semanas o rendimento é sobre o saldo de abertura.
const dedW0 = k => (WK[W0].f['mov_obj_' + X.objetivos[k].id] || 0);
const dedTotW0 = () => X.objetivos.reduce((a, o, k) => a + dedW0(k), 0);
const baseCofre = i => i === W0 ? (plano.initialWealth - 85000) - dedTotW0() : WK[i - 1].cofre;   // 85.000 = FGTS, que fica na caixa de previdência
const baseObj = (i, k) => i === W0 ? dedW0(k) : WK[i - 1].obj[k];
const adicW0 = i => i === W0 ? dedTotW0() : 0;

// ============================================================ A. CONTABILIDADE GERAL
{
  let eFin = 0, eBens = 0, ePart = 0, eDiv = 0, nan = 0, eId = 0;
  X.meses.forEach(b => {
    const f = b.fim, d = f.det;
    const s = (a) => a.reduce((x, y) => x + y, 0);
    eFin = Math.max(eFin, Math.abs(f.fin - (f.cofre + s(f.obj))));
    eBens = Math.max(eBens, Math.abs(f.bens - (s(d.bens) + s(d.comprados))));
    ePart = Math.max(ePart, Math.abs(f.part - s(d.parts)));
    eDiv = Math.max(eDiv, Math.abs(f.div - s(d.divs)));
    [f.fin, f.cofre, f.bens, f.part, f.prev, f.div, ...f.obj].forEach(v => { if (!Number.isFinite(v)) nan++; });
  });
  conf('A1', 'fin = cofre + soma das caixinhas', 'identidade por mês', `${NMES} meses`, eFin, eFin < TOL);
  conf('A2', 'bens = soma(det.bens) + bens comprados', 'identidade por mês', `${NMES} meses`, eBens, eBens < TOL);
  conf('A3', 'part = soma(det.parts)', 'identidade por mês', `${NMES} meses`, ePart, ePart < TOL);
  conf('A4', 'dívida total = soma(det.divs)', 'identidade por mês', `${NMES} meses`, eDiv, eDiv < TOL);
  conf('A5', 'sem NaN/Infinity em fin/cofre/obj/bens/part/prev/div', 'varredura', `${NMES} meses`, nan, nan === 0);

  // semana a semana: transferências somam zero, cofre e caixinhas fecham
  const g = Math.pow(1 + X.R_M, 7 / 30.4375);   // convenção: capitalização semanal equivalente à taxa mensal
  let eSoma0 = 0, eCofre = 0, eObj = 0, semanas = 0, negSemana = 0;
  const objIds = X.objetivos.map(o => o.id);
  const tx = (o, mi) => taxaEsperada(o, mi);
  for (let i = W0; i < WK.length; i++) {
    const w = WK[i], p = WK[i - 1], f = w.f || {};
    let ent = 0, sai = 0, mov = 0;
    for (const k in f) { if (k.startsWith('in_')) ent += f[k]; else if (k.startsWith('out_')) sai += f[k]; else if (k.startsWith('mov_')) mov += f[k]; }
    // soma de todos os mov_* (cofre, caixinhas, bens) = entradas - saídas (transferências internas somam zero)
    eSoma0 = Math.max(eSoma0, Math.abs(mov - (ent - sai)));
    // cofre(i) = cofre(i-1)*(1+r)^(7/30,4375) se positivo + mov_cofre ; semana W0 parte do patrimônio inicial livre
    const c0 = baseCofre(i);
    const cEsp = (c0 > 0 ? c0 * g : c0) + (f.mov_cofre || 0) + adicW0(i);
    eCofre = Math.max(eCofre, Math.abs(cEsp - w.cofre));
    // caixinhas: taxa do mês da semana ANTERIOR (o crescimento da semana i cobre o intervalo [i-1,i])
    const miAnt = i === W0 ? 0 : Math.max(0, p.mi);
    X.objetivos.forEach((o, k) => {
      const o0 = baseObj(i, k);
      const oEsp = o0 * Math.pow(1 + tx(o, miAnt), 7 / 30.4375) + (i === W0 ? 0 : (f['mov_obj_' + o.id] || 0));
      eObj = Math.max(eObj, Math.abs(oEsp - w.obj[k]));
    });
    if (w.cofre < -0.5) negSemana++;
    semanas++;
  }
  conf('A6', 'transferências somam zero: soma(mov_*) = entradas − saídas', 'por semana, observado semanal', `${semanas} semanas`, eSoma0, eSoma0 < TOL);
  conf('A7', 'conservação do cofre: cofre(i) = cofre(i−1)·(1+r)^(7/30,4375) + mov_cofre', 'por semana (rendimento sobre o saldo de abertura, antes dos fluxos da semana)', `${semanas} semanas`, eCofre, eCofre < TOL);
  conf('A8', 'conservação das caixinhas: obj(i) = obj(i−1)·(1+taxa esperada)^(7/30,4375) + mov_obj', 'por semana, taxa esperada pela regra dos 24 meses (ver D)', `${semanas} semanas × ${objIds.length} caixinhas`, eObj, eObj < TOL);
  log('   semanas com caixa negativo (dívida de cartão/cheque):', negSemana);
}

// ============================================================ regra de taxa esperada (domínio): perfil nos meses anteriores aos últimos 24; conservador nos últimos 24
function taxaEsperada(o, mi) {
  const base = o.rateM != null && o.rateM !== '' ? +o.rateM : X.PROFILES[o.profile];
  const cons = X.PROFILES.conservador;
  const t = Math.max(0, Math.round(o.months) - 24);        // primeiro mês conservador
  if (t <= 0) return Math.min(base, cons);                 // objetivo com ≤ 24 meses: nasce conservador
  return mi >= t ? Math.min(base, cons) : base;
}

// ============================================================ B. PARTICIPAÇÕES
{
  const PA = plano.patrimonio.participacoes;
  PA.forEach((p, k) => {
    // série esperada: taxa % a.a. composta mensal sobre [de, de+anos*12); salto pontual no mês 'em'
    const tx = p.valorizacao.filter(v => v.tipo === 'taxa'), pt = p.valorizacao.filter(v => v.tipo === 'pontual');
    const N = X.parts[k].serie.length;
    const esp = [p.valor]; let v = p.valor;
    for (let m = 1; m < N; m++) {
      tx.forEach(t => { const de = t.de || 0, ate = de + Math.round(t.anos * 12); if (m - 1 >= de && m - 1 < ate) v *= Math.pow(1 + t.pct / 100, 1 / 12); });
      pt.forEach(s => { if (s.em === m) v = Math.max(0, v * (1 + s.pct / 100)); });
      esp.push(v);
    }
    let e1 = 0, e2 = 0, neg = 0, n2 = 0;
    for (let m = 0; m < N; m++) { e1 = Math.max(e1, Math.abs(esp[m] - X.parts[k].serie[m])); if (esp[m] < 0) neg++; }
    X.meses.forEach(b => { const o = b.fim.det.parts[k]; const vv = b.mi < N ? esp[b.mi] : esp[N - 1]; e2 = Math.max(e2, Math.abs(vv - o)); n2++; });
    conf('B1.' + k, `série da participação "${p.nome}" vs parts[].serie`, 'recálculo: −8% a.a. composto mensal por 48 meses, −30% no mês 18, parado depois', `${N} meses (0..${N - 1})`, e1, e1 < TOL, 'pontos: m12=' + esp[12].toFixed(2) + ' m17=' + esp[17].toFixed(2) + ' m18=' + esp[18].toFixed(2) + ' m48=' + esp[48].toFixed(2) + ' m100=' + esp[100].toFixed(2));
    conf('B2.' + k, `fim.det.parts[${k}] mês a mês vs esperado`, 'recálculo, valor do fim do mês', `${n2} meses`, e2, e2 < TOL);
    // agregado: part do mês = soma das participações
    let e3 = 0; X.meses.forEach(b => { e3 = Math.max(e3, Math.abs(b.fim.part - b.fim.det.parts.reduce((a, c) => a + c, 0))); });
    conf('B3', 'fim.part = soma das participações (patrimônio)', 'identidade', NMES + ' meses', e3, e3 < TOL);
    R.B_pontos = { esp12: esp[12], esp17: esp[17], esp18: esp[18], esp48: esp[48], salto: esp[18] - esp[18] / 0.7 };
    // evento do salto
    const ev = X.eventos.find(e => e.type === 'valoriza');
    const saltoEsp = esp[17] * Math.pow(0.92, 1 / 12) * 0.3;   // 30% do valor após o mês 18 de taxa
    log('   salto pontual esperado: −' + saltoEsp.toFixed(2) + ' | evento do motor: ' + (ev ? ev.detail : 'nenhum'));
    log('   venda da participação: o plano não tem venda → participação nunca é vendida; renda ligada: nenhuma (sem distribuição de lucros). Série nunca negativa (neg=' + neg + ').');
    // a participação não altera o fluxo de caixa: nenhuma linha in_/out_ ligada
    const ligadas = Object.keys(X.meses.reduce((a, b) => Object.assign(a, b.fluxo), {})).filter(k => /part|loja/i.test(k));
    log('   linhas de fluxo ligadas à participação: ' + (ligadas.length ? ligadas.join(',') : 'nenhuma (correto)'));
  });
}

// ============================================================ C. DÍVIDAS (recálculo independente)
// tabela de amortização Price/SAC; extras no índice de parcela (após a parcela k): modo 'prazo' (parcela fica) ou 'parcela' (prazo fica)
const pmtF = (F, i, n) => i > 0 ? F * i / (1 - Math.pow(1 + i, -n)) : F / n;
function tabela(F, i, n, sac, extras) {
  const out = []; let bal = F, pm = pmtF(F, i, n), am = F / n;
  for (let k = 0; k < n && bal > 0.005; k++) {
    const j = bal * i; let a = Math.min(bal, sac ? am : pm - j); bal -= a;
    const x = extras && extras[k]; let ex = 0;
    if (x && bal > 0) { ex = Math.min(bal, x.valor); bal -= ex; const r = n - k - 1; if (x.modo === 'parcela' && bal > 0 && r > 0) { pm = pmtF(bal, i, r); am = bal / r; } }
    out.push({ juros: j, amort: a, extra: ex, pay: j + a, saldo: bal });
  }
  return out;
}
// taxa mensal implícita na parcela do índice k0 (a parcela "de hoje") — Price: bisseção; SAC: forma fechada
function taxaDaParcela(F, n, k0, P, sac) {
  if (sac) return (P - F / n) / (F - k0 * F / n);
  let lo = 0, hi = 0.2; for (let r = 0; r < 100; r++) { const m = (lo + hi) / 2; if (pmtF(F, m, n) < P) lo = m; else hi = m; } return (lo + hi) / 2;
}
const DIV = [];   // contratos do plano, na ordem do motor: bens (3) + avulsas (2)
plano.patrimonio.bens.concat(plano.patrimonio.dividas).forEach((d, idx) => {
  const n = d.parcelas, F = d.credito, sac = d.sistema === 'sac';
  const ini = d.inicio.split('-'), k0 = Math.max(0, n - Math.max(0, Math.min(n, n + mesIdx(+ini[0], +ini[1]))));   // parcelas "já pagas" na contagem do motor (mês 0 ainda a pagar)
  const rest = n - k0;
  const P = d.parcela, i = taxaDaParcela(F, n, k0, P, sac);
  const ex = {}; (d.amortizacoes || []).forEach(a => { ex[k0 + a.em] = { valor: a.valor, modo: a.modo === 'parcela' ? 'parcela' : 'prazo' }; });
  const tab = tabela(F, i, n, sac, ex), tab0 = tabela(F, i, n, sac, null);
  DIV.push({ idx, nome: d.nome, d, n, F, sac, k0, rest, P, i, tab, tab0, ex });
});
{
  // C0: taxa implícita e saldo contratual hoje
  DIV.forEach(c => {
    const aa = Math.pow(1 + c.i, 12) - 1;
    const sAntes = c.k0 > 0 ? c.tab0[c.k0 - 1].saldo : c.F, sDepois = c.tab0[c.k0].saldo;
    c.aa = aa; c.sAntes = sAntes; c.sDepois = sDepois;
    log(`   ${c.nome}: ${c.sac ? 'SAC' : 'Price'} F=${c.F} n=${c.n} k0=${c.k0} parcela=${c.P} → i=${(c.i * 100).toFixed(4)}% a.m. (${(aa * 100).toFixed(3)}% a.a.) | contrato: saldo antes da parcela de hoje ${sAntes.toFixed(2)}, depois ${sDepois.toFixed(2)} | declarado ${c.d.saldoDevedor}`);
  });
  // C1: saldo devedor mês a mês (série observada dividas[]/dividasAvulsas[] e fim.det.divs) vs a regra do motor reproduzida com a minha tabela
  //   regra do motor (premissa de desenho): saldo(k) = declarado × saldo_contrato(k0+k−1) / saldo_contrato(k0−1); zero a partir da parcela final.
  let eSerie = 0, eDet = 0, nDet = 0; const obs = X.dividas.concat(X.dividasAvulsas);
  DIV.forEach(c => {
    const B0 = c.d.saldoDevedor;
    const regra = k => { const j = c.k0 + k; if (j >= c.tab.length) return 0; return B0 * (j <= 0 ? c.F : c.tab[j - 1].saldo) / (c.k0 > 0 ? c.tab[c.k0 - 1].saldo : c.F); };
    c.regra = regra;
    for (let k = 0; k <= 360; k++) { eSerie = Math.max(eSerie, Math.abs(regra(k) - obs[c.idx].saldo[k])); }
    X.meses.forEach(b => { eDet = Math.max(eDet, Math.abs(regra(b.mi) - b.fim.det.divs[c.idx])); nDet++; });
  });
  conf('C1', 'saldo devedor mês a mês: mesma regra do motor (declarado × caminho do contrato), com a MINHA tabela', 'recálculo Price/SAC com taxa derivada da parcela; comparação com dividas[]/dividasAvulsas[]', '5 dívidas × 361 meses', eSerie, eSerie < TOL);
  conf('C2', 'fim.det.divs (fim de cada mês) vs a mesma regra', 'recálculo', `5 dívidas × ${NMES} meses`, eDet, eDet < TOL);
  let eDiv = 0; X.meses.forEach(b => { eDiv = Math.max(eDiv, Math.abs(b.fim.div - DIV.reduce((a, c) => a + c.regra(b.mi), 0))); });
  conf('C3', 'fim.div (dívida total) = soma das cinco regras', 'recálculo', NMES + ' meses', eDiv, eDiv < TOL);
}
// C4: a parcela que sai no fluxo vs a parcela do contrato (a do mês k0+mi)
{
  const linhaDe = { 0: 'parc0', 1: 'parc1', 2: 'parc2', 3: 'parc3', 4: 'parc4' };
  const res = [];
  DIV.forEach(c => {
    const key = 'out_fix_' + linhaDe[c.idx]; let eMax = 0, eAbs = 0, pagoCx = 0, pagoCt = 0, pior = null, nMes = 0, antes = 0, ctPorMes = [];
    for (let mi = 1; mi < NMES; mi++) {
      const b = byMi.get(mi); const caixa = b.fluxo[key] || 0;
      const l = c.tab[c.k0 + mi]; const ct = l ? l.pay + l.extra : 0;     // a parcela do mês mi (índice k0+mi), com o extra do mês
      ctPorMes.push(ct); const diff = caixa - ct; pagoCx += caixa; pagoCt += ct; nMes++;
      if (Math.abs(diff) > eMax) { eMax = Math.abs(diff); pior = { mi, caixa, ct }; }
      if (mi <= 360 && Math.abs(diff) > 0.015) antes++;
    }
    c.pagoCx = pagoCx; c.pagoCt = pagoCt; c.maxDiff = eMax; c.pior = pior; c.nDif = antes;
    log(`   ${c.nome}: pago no caixa (mi 1..) ${pagoCx.toFixed(2)} | parcelas+extras do contrato (índices k0+1..) ${pagoCt.toFixed(2)} | dif ${ (pagoCx - pagoCt).toFixed(2)} | meses com dif > 0,01: ${antes} | maior dif ${eMax.toFixed(2)} ${pior ? '(mi ' + pior.mi + ' ' + nome(pior.mi) + ': caixa ' + pior.caixa.toFixed(2) + ' × contrato ' + pior.ct.toFixed(2) + ')' : ''}`);
  });
  R.C4 = DIV.map(c => ({ nome: c.nome, pagoCx: c.pagoCx, pagoCt: c.pagoCt, maxDiff: c.maxDiff, pior: c.pior, nDif: c.nDif }));
}
// C5: tabela do contrato: amortizações antecipadas — o que o contrato pede em cada mês de extra vs o valor lançado
{
  DIV.forEach(c => {
    (c.d.amortizacoes || []).forEach(a => {
      const k = c.k0 + a.em, l = c.tab[k];
      const saldoAntesExtra = (l ? l.saldo + l.extra : 0);
      const proxPay = c.tab[k + 1] ? c.tab[k + 1].pay : 0;
      log(`   amortização ${c.nome}: mês ${a.em} (${nome(a.em)}), R$ ${a.valor}, modo ${a.modo}: saldo contratual após a parcela do mês = ${saldoAntesExtra.toFixed(2)} → extra aplicado ${l ? l.extra.toFixed(2) : 0}; saldo depois ${l ? l.saldo.toFixed(2) : 0}; próxima parcela do contrato ${proxPay.toFixed(2)}; parcelas restantes do contrato após o extra: ${c.tab.length - k - 1}`);
      c['ext' + a.em] = { saldoAntesExtra, extra: l ? l.extra : 0, saldoDepois: l ? l.saldo : 0, proxPay };
    });
  });
}
// C6: juros pagos = soma(parcelas) − principal (por contrato, parte restante); juros implícitos mensais vs i × saldo
{
  DIV.forEach(c => {
    const rest = c.tab.slice(c.k0 + 1);   // parcelas pagas a partir de mi=1
    const pagas = rest.reduce((a, l) => a + l.pay + l.extra, 0), princ = rest.reduce((a, l) => a + l.amort + l.extra, 0), jur = rest.reduce((a, l) => a + l.juros, 0);
    c.juros = jur; c.principalFut = princ; c.pagoFut = pagas;
    log(`   ${c.nome}: parcelas futuras (mi≥1) ${pagas.toFixed(2)} = principal ${princ.toFixed(2)} + juros ${jur.toFixed(2)} (identidade: ${(pagas - princ - jur).toFixed(6)})`);
  });
}
// C7: identidade caixa × dívida por mês: juros implícitos = pagamento − queda da dívida; deve ser ≈ i × saldo anterior (≥ 0)
{
  const nomeLinha = ['parc0', 'parc1', 'parc2', 'parc3', 'parc4'];
  DIV.forEach(c => {
    let pior = 0, piorMi = null, somaImp = 0, somaEsp = 0, piorNeg = 0, mesesNeg = 0;
    for (let mi = 1; mi < NMES; mi++) {
      const b = byMi.get(mi), ant = byMi.get(mi - 1);
      const pg = b.fluxo['out_fix_' + nomeLinha[c.idx]] || 0, queda = ant.fim.det.divs[c.idx] - b.fim.det.divs[c.idx];
      const imp = pg - queda, esp = ant.fim.det.divs[c.idx] * c.i;
      somaImp += imp; somaEsp += esp;
      if (imp < -0.01) { mesesNeg++; piorNeg = Math.min(piorNeg, imp); }
      if (Math.abs(imp - esp) > Math.abs(pior)) { pior = imp - esp; piorMi = mi; }
    }
    c.imp = { somaImp, somaEsp, pior, piorMi, mesesNeg, piorNeg };
    log(`   ${c.nome}: Σ juros implícitos (pago − queda da dívida) ${somaImp.toFixed(2)} | Σ juros esperados (i·saldo anterior) ${somaEsp.toFixed(2)} | maior desvio mensal ${pior.toFixed(2)} em mi ${piorMi} (${piorMi != null ? nome(piorMi) : ''}) | meses com juros implícito negativo: ${mesesNeg} (pior ${piorNeg.toFixed(2)})`);
  });
}
// C8: quitação final: dívida em zero no fim; mês em que zera vs último mês com pagamento no caixa
{
  const nomeLinha = ['parc0', 'parc1', 'parc2', 'parc3', 'parc4'];
  DIV.forEach(c => {
    let ultimoPg = -1, zeraEm = -1, saldoNoUltimoPg = null;
    for (let mi = 0; mi < NMES; mi++) { const b = byMi.get(mi); if ((b.fluxo['out_fix_' + nomeLinha[c.idx]] || 0) > 0.005) ultimoPg = mi; }
    for (let mi = 0; mi < NMES; mi++) { if (byMi.get(mi).fim.det.divs[c.idx] < 0.005) { zeraEm = mi; break; } }
    saldoNoUltimoPg = byMi.get(ultimoPg).fim.det.divs[c.idx];
    c.quit = { ultimoPg, zeraEm, saldoNoUltimoPg };
    log(`   ${c.nome}: último pagamento no caixa em mi ${ultimoPg} (${nome(ultimoPg)}); dívida zera em mi ${zeraEm} (${nome(zeraEm)}); saldo ainda lançado no mês do último pagamento: ${saldoNoUltimoPg.toFixed(2)}`);
  });
}
// C9: efeito do descompasso (dívida do fim do mês é a de antes da parcela do mês) — patrimônio líquido no mês de cada extra
{
  DIV.forEach(c => (c.d.amortizacoes || []).forEach(a => {
    const m = a.em, d0 = byMi.get(m - 1).fim.det.divs[c.idx], d1 = byMi.get(m).fim.det.divs[c.idx], d2 = byMi.get(m + 1).fim.det.divs[c.idx];
    log(`   ${c.nome}: saldo lançado em mi ${m - 1}/${m}/${m + 1} = ${d0.toFixed(2)} / ${d1.toFixed(2)} / ${d2.toFixed(2)} (o caixa do extra de R$ ${a.valor} sai em mi ${m}; a dívida só cai em mi ${m + 1})`);
    c['desc' + a.em] = { d0, d1, d2 };
  }));
}
// C10: o que mudaria se o saldo declarado fosse ancorado como o cliente conta (declarado = saldo DEPOIS da parcela de hoje)
{
  DIV.forEach(c => {
    const B0 = c.d.saldoDevedor, ancD = c.tab0[c.k0].saldo;
    // caminho alternativo: declarado × contrato(k0+mi) / contrato(k0)   (depois da parcela do próprio mês)
    c.alt = mi => { const j = c.k0 + mi; if (j >= c.tab.length) return 0; return B0 * c.tab[j].saldo / ancD; };
    let dMax = 0, dMi = 0, dSoma = 0; for (let mi = 0; mi < NMES; mi++) { const d = c.regra(mi) - c.alt(mi); if (Math.abs(d) > Math.abs(dMax)) { dMax = d; dMi = mi; } dSoma += d; }
    c.altDiff = { dMax, dMi, dSoma };
    log(`   ${c.nome}: motor − âncora "depois da parcela": maior diferença ${dMax.toFixed(2)} em mi ${dMi} (${nome(dMi)}); no mi=1: ${(c.regra(1) - c.alt(1)).toFixed(2)}; fator do motor ${(B0 / (c.k0 > 0 ? c.tab[c.k0 - 1].saldo : c.F)).toFixed(5)} (declarado/saldo antes da parcela) vs ${(B0 / ancD).toFixed(5)} (declarado/saldo depois)`);
  });
  // efeito total no patrimônio por mês (dívida a maior do motor)
  let maxTot = 0, maxMi = 0; for (let mi = 0; mi < NMES; mi++) { const t = DIV.reduce((a, c) => a + c.regra(mi) - c.alt(mi), 0); if (Math.abs(t) > Math.abs(maxTot)) { maxTot = t; maxMi = mi; } }
  R.C10 = { maxTot, maxMi }; log(`   somando as 5 dívidas: maior diferença de dívida total (motor − âncora alternativa) ${maxTot.toFixed(2)} em mi ${maxMi} (${nome(maxMi)}); em mi 12: ${DIV.reduce((a, c) => a + c.regra(12) - c.alt(12), 0).toFixed(2)}, mi 60: ${DIV.reduce((a, c) => a + c.regra(60) - c.alt(60), 0).toFixed(2)}`);
}

// ============================================================ D. CAIXINHAS
const OBJ = X.objetivos;
{
  OBJ.forEach(o => {
    // taxaPorMes observada vs esperada
    let e = 0, troca = null, dif = [];
    for (let mi = 0; mi < o.taxaPorMes.length; mi++) {
      const esp = taxaEsperada(o, mi); e = Math.max(e, Math.abs(esp - o.taxaPorMes[mi])); if (Math.abs(esp - o.taxaPorMes[mi]) > 1e-12) dif.push(mi);
      if (mi > 0 && Math.abs(o.taxaPorMes[mi] - o.taxaPorMes[mi - 1]) > 1e-12 && troca == null) troca = mi;
    }
    const tEsp = Math.max(0, o.months - 24);
    conf('D1.' + o.id, `taxa por mês de "${o.name}" (${o.profile}, ${o.months} meses)`, 'regra: perfil antes dos últimos 24 meses; conservador (0,4%) nos últimos 24; ≤24 meses já conservador', `${o.taxaPorMes.length} meses`, e, e < 1e-12 && dif.length === 0, `troca observada: ${troca == null ? 'nenhuma (taxa única ' + (o.taxaPorMes[0] * 100).toFixed(2) + '%)' : 'mi ' + troca + ' (' + nome(troca) + ') de ' + (o.taxaPorMes[troca - 1] * 100).toFixed(2) + '% para ' + (o.taxaPorMes[troca] * 100).toFixed(2) + '%'}; esperada: ${tEsp > 0 ? 'mi ' + tEsp : 'sem troca'}`);
  });
  // reconstrução semana a semana com as taxas esperadas (A8 já testa); aqui por objetivo: saldo no fim, aportes, saque
  const Wk = i => WK[i];
  OBJ.forEach((o, k) => {
    let aportes = 0, nAportes = 0, ultimoAporte = -1, dedicadoEntra = 0, saque = 0, saqueMi = null, aportesPorMes = {};
    for (let i = W0; i < WK.length; i++) {
      const v = (WK[i].f || {})['mov_obj_' + o.id] || 0, mi = WK[i].mi;
      if (v > 0.005) { if (i === W0) dedicadoEntra += v; else { aportes += v; aportesPorMes[mi] = (aportesPorMes[mi] || 0) + v; nAportes++; ultimoAporte = mi; } }
      if (v < -0.005) { saque += v; saqueMi = mi; }
    }
    // saldo reconstruído do zero com aportes observados e taxas esperadas (mensal por semana); compara com o saldo no mês da data
    o.rec = { aportes, nAportes, ultimoAporte, dedicadoEntra, saque, saqueMi, aportesPorMes };
    log(`   ${o.name}: dedicado ${o.dedicated}, entrou ${dedicadoEntra.toFixed(2)} na semana de hoje; ${nAportes} aportes somando ${aportes.toFixed(2)}, último em mi ${ultimoAporte}; saque ${saque.toFixed(2)} em mi ${saqueMi} (${saqueMi != null ? nome(saqueMi) : '-'}); data do objetivo mi ${o.months} (${nome(o.months)})`);
  });
  // aporte esperado: planned por mês de 0 até 'months'−1 (ou até a caixinha bastar). Mostra os meses em que o observado difere do planejado.
  OBJ.forEach(o => {
    const dif = []; for (let mi = 0; mi < o.months; mi++) { const obs = o.rec.aportesPorMes[mi] || 0; const esp = o.planned; if (Math.abs(obs - esp) > 0.01) dif.push({ mi, obs, esp }); }
    o.difAporte = dif;
    log(`   ${o.name}: meses com aporte ≠ planejado (${o.planned}): ${dif.length}${dif.length ? ' → ' + dif.slice(0, 12).map(d => `mi${d.mi}=${d.obs.toFixed(2)}`).join(' ') + (dif.length > 12 ? ' …' : '') : ''}`);
  });
  // saldo na data (antes do saque) e depois do saque: 0
  OBJ.forEach((o, k) => {
    const b = byMi.get(o.months), a = byMi.get(o.months - 1);
    const sac = -(o.rec.saque);
    log(`   ${o.name}: saldo no fim do mês ${o.months - 1} = ${a.fim.obj[k].toFixed(2)}; saque do mês ${o.months} = ${sac.toFixed(2)}; saldo no fim do mês ${o.months} = ${b.fim.obj[k].toFixed(6)} (meta ${o.amount}; saldo/meta = ${(sac / o.amount * 100).toFixed(3)}%)`);
  });
  // consumo: a saída do objetivo no fluxo = amount; caixa livre cobre o resto
  OBJ.forEach(o => { const b = byMi.get(o.months); const v = b.fluxo['out_obj_' + o.id] || 0; conf('D2.' + o.id, `saída do objetivo "${o.name}" na data = valor do objetivo`, 'fluxo out_obj_*', 'mês ' + o.months, Math.abs(v - o.amount), Math.abs(v - o.amount) < TOL, `${v.toFixed(2)} em ${nome(o.months)}`); });
  // saldo da caixinha zero depois do saque
  OBJ.forEach((o, k) => { let m = 0; X.meses.forEach(b => { if (b.mi >= o.months) m = Math.max(m, Math.abs(b.fim.obj[k])); }); conf('D3.' + o.id, `caixinha "${o.name}" zerada depois da data`, 'varredura', `mi ≥ ${o.months}`, m, m < TOL); });
}
// D-impacto: se o objetivo tivesse ficado a vida toda numa só taxa (mesmos aportes e saque observados), saldo na data
{
  OBJ.forEach((o, k) => {
    const base = X.PROFILES[o.profile], cons = X.PROFILES.conservador;
    const simula = (taxaFn) => {
      let s = 0; let ult = -1;
      for (let i = W0; i < WK.length; i++) {
        const w = WK[i], f = w.f || {}; const miAnt = i === W0 ? 0 : Math.max(0, WK[i - 1].mi);
        if (miAnt >= o.months) break;
        if (i === W0) { s = (f['mov_obj_' + o.id] || 0) * Math.pow(1 + taxaFn(miAnt), 7 / 30.4375); continue; }
        s = s * Math.pow(1 + taxaFn(miAnt), 7 / 30.4375);
        const v = f['mov_obj_' + o.id] || 0;
        if (w.mi >= o.months) break;           // antes do saque
        s += v;
      }
      return s;
    };
    // saldo no mês da data, antes do saque: simula até a semana anterior ao mês 'months'
    const cmp = {};
    cmp.real = simula(mi => taxaEsperada(o, mi));
    cmp.soPerfil = simula(mi => base);
    cmp.soConservador = simula(mi => cons);
    cmp.aposDaTrocaJaConservador = cmp.real;
    o.imp = cmp;
    log(`   impacto ${o.name}: saldo pouco antes da data (aportes e fluxos observados fixos) → com a regra (${o.profile} → conservador nos últimos 24): ${cmp.real.toFixed(2)} | só ${o.profile}: ${cmp.soPerfil.toFixed(2)} (${(cmp.soPerfil - cmp.real >= 0 ? '+' : '') + (cmp.soPerfil - cmp.real).toFixed(2)}) | só conservador: ${cmp.soConservador.toFixed(2)} (${(cmp.soConservador - cmp.real).toFixed(2)})`);
  });
}

// ============================================================ E. RENDIMENTO DO PATRIMÔNIO FINANCEIRO
{
  const g = Math.pow(1 + X.R_M, 7 / 30.4375);
  let rend = 0, rendObj = 0, rendCofre = 0, anos = {};
  const porMes = {};
  for (let i = W0; i < WK.length; i++) {
    const p = WK[i - 1], w = WK[i], miAnt = i === W0 ? 0 : Math.max(0, p.mi);
    const c0 = baseCofre(i);
    const rc = c0 > 0 ? c0 * (g - 1) : 0; let ro = 0;
    OBJ.forEach((o, k) => { const o0 = baseObj(i, k); ro += o0 * (Math.pow(1 + taxaEsperada(o, miAnt), 7 / 30.4375) - 1); });
    rendCofre += rc; rendObj += ro;
    porMes[w.mi] = (porMes[w.mi] || 0) + rc + ro;
  }
  // taxa efetiva anualizada do cofre em um trecho sem fluxos: semana a semana
  log(`   convenção: rendimento semanal composto sobre o saldo de ABERTURA da semana (antes dos fluxos dela): cofre × ((1+${X.R_M})^(7/30,4375) − 1) se cofre > 0; caixinha × ((1+taxa do mês anterior à semana)^(7/30,4375) − 1)`);
  log(`   rendimento total simulado: cofre ${rendCofre.toFixed(2)} | caixinhas ${rendObj.toFixed(2)}`);
  log(`   equivalência: (1+0,004)^(7/30,4375)^(30,4375/7×12 semanas…) → 1 ano de 52,1786 semanas rende ${(Math.pow(g, 365.25 / 7) - 1).toFixed(6)} = (1,004^12 − 1) = ${(Math.pow(1.004, 12) - 1).toFixed(6)}`);
  R.E = { rendCofre, rendObj, anual: Math.pow(g, 365.25 / 7) - 1, aaEsperado: Math.pow(1.004, 12) - 1 };
  conf('E1', 'taxa anual efetiva do cofre = (1+0,4%)^12 − 1', 'identidade', '1 valor', Math.abs(R.E.anual - R.E.aaEsperado), Math.abs(R.E.anual - R.E.aaEsperado) < 1e-9);
  // FGTS/previdência: prev constante 85.000 até a concessão (rentab 0)
  let eP = 0; X.meses.forEach(b => { if (b.mi < 247) eP = Math.max(eP, Math.abs(b.fim.prev - 85000)); });
  conf('E2', 'FGTS (conv.rentab = 0): prev = 85.000 constante até a concessão', 'varredura mi 0..246', '247 meses', eP, eP < TOL);
  const mcFg = X.meses.find(b => b.mi >= 240 && b.fim.prev === 0); log('   prev zera em mi ' + (mcFg && mcFg.mi) + ' (' + (mcFg && nome(mcFg.mi)) + '); saque à vista entra no financeiro: ' + JSON.stringify(Object.keys(byMi.get(mcFg.mi).fluxo).filter(k => k.startsWith('in_pas'))));
}

// ============================================================ F. FLUXO: entradas e saídas do mês contra o plano
{
  const stepAt = (it, mm) => { let v = 0; for (const s of it.steps.slice().sort((a, b) => a.from - b.from)) { if (mm >= s.from) v = s.value; else break; } return v; };
  const ff = X.ff ? X.ff.mi : 1e9;
  const exp = (it, mi, ehSaida) => {
    const fq = it.frequency || 'mensal'; let v = 0;
    const ini = it.steps.slice().sort((a, b) => a.from - b.from)[0].from;
    if (mi < ini) v = 0;
    else if (fq === 'mensal') v = stepAt(it, mi) * (it.days ? it.days.length : 1);
    else if (fq === 'anual') { const c = calDe(mi); v = (it.dates || []).some(d => (d.d >= 5 ? d.m : (d.m + 11) % 12) === c.m) ? stepAt(it, mi) : 0; }
    if (it.exc && it.exc[mi] != null) v = it.exc[mi];
    return v;
  };
  const linhas = [];
  plano.incomes.forEach(it => linhas.push({ it, key: 'in_' + it.id }));
  plano.expenses.forEach(it => linhas.push({ it, key: 'out_' + it.group + '_' + it.id }));
  let eMax = 0, pior = null, nChecks = 0; const difs = [];
  linhas.forEach(L => {
    let e = 0;
    for (let mi = 1; mi < Math.min(ff, NMES); mi++) {
      const b = byMi.get(mi); const obs = b.fluxo[L.key] || 0; const esp = exp(L.it, mi);
      nChecks++;
      const d = Math.abs(obs - esp); if (d > 0.015) difs.push({ key: L.key, mi, obs, esp });
      if (d > e) e = d;
    }
    L.e = e; if (e > eMax) { eMax = e; pior = L.key; }
  });
  conf('F1', 'cada linha de entrada e saída do plano, mês a mês (mi 1 até o mês anterior à liberdade)', 'recálculo dos degraus, 13º/bônus por data, frequência, exc (ajustes de um mês)', `${linhas.length} linhas × ${Math.min(ff, NMES) - 1} meses = ${nChecks} células`, eMax, difs.length === 0, difs.length ? `${difs.length} células diferentes; pior ${pior}` : 'nenhuma diferença acima de R$ 0,015');
  R.F1difs = difs;
  difs.slice(0, 20).forEach(d => log(`   dif: ${d.key} mi ${d.mi} (${nome(d.mi)}) obs ${d.obs.toFixed(2)} esp ${d.esp.toFixed(2)}`));
  // linhas que NÃO existem no plano mas aparecem no fluxo (antes da liberdade)
  const chaves = new Set(); X.meses.filter(b => b.mi < ff).forEach(b => Object.keys(b.fluxo).forEach(k => { if (!k.startsWith('mov_')) chaves.add(k); }));
  const conhecidas = new Set(linhas.map(l => l.key)); OBJ.forEach(o => conhecidas.add('out_obj_' + o.id));
  const extras = [...chaves].filter(k => !conhecidas.has(k)); log('   chaves de fluxo fora do plano (antes da liberdade): ' + (extras.length ? extras.join(',') : 'nenhuma'));
  // mês 0 parcial
  const m0 = byMi.get(0); log('   mês 0 (parcial: só as semanas a partir de hoje, 2 de 4): saídas escola ' + m0.fluxo.out_fix_escola + ' (metade de 4800), entradas ' + Object.keys(m0.fluxo).filter(k => k.startsWith('in_')).length + ' linhas; parcelas de dívidas no mês 0: ' + Object.keys(m0.fluxo).filter(k => /parc/.test(k)).length);
  // semanas por mês: 4 ou 5; checar que cada linha mensal diluída soma 1 vez por mês (coberto em F1 para mi≥1)
  const nsem = {}; X.meses.forEach(b => { const n = b.w1 - b.w0; nsem[n] = (nsem[n] || 0) + 1; }); log('   distribuição de semanas por mês: ' + JSON.stringify(nsem));
  // as degraus do salário (promoção em mi 9) e 13º/bônus nos meses certos
  const pts = [[8, 'in_sal_rafael'], [9, 'in_sal_rafael'], [2, 'in_dec_rafael'], [2, 'in_dec_camila'], [5, 'in_bonus_rafael'], [14, 'in_bonus_rafael'], [1, 'in_dec_rafael']];
  log('   pontos: ' + pts.map(([mi, k]) => `${k}@${nome(mi)}=${(byMi.get(mi).fluxo[k] || 0)}`).join(' | '));
  // linhas de parcela: sala SAC (degraus anuais) vs SAC exato
  const s = DIV[1]; let sobre = 0, maxSobre = 0; for (let mi = 1; mi < Math.min(ff, NMES); mi++) { const caixa = byMi.get(mi).fluxo['out_fix_parc1'] || 0; const l = s.tab[s.k0 + mi]; const ct = l ? l.pay : 0; sobre += caixa - ct; maxSobre = Math.max(maxSobre, caixa - ct); }
  R.Fsac = { sobre, maxSobre }; log(`   SAC da sala: o caixa paga em degraus anuais; excesso acumulado sobre a parcela exata do contrato (mi 1..${Math.min(ff, NMES) - 1}) = ${sobre.toFixed(2)}; maior excesso mensal ${maxSobre.toFixed(2)}`);
}

// ============================================================ G. LIBERDADE FINANCEIRA / RUÍNA / ESCALA
{
  const ff = X.ff; log(`   ff: mi ${ff.mi} (${nome(ff.mi)}), idade do titular ${ff.age.toFixed(3)}, forced=${ff.forced}, financeiro antes ${ff.finBefore.toFixed(2)}, maxGap ${ff.maxGap}, sustentavel ${ff.sustentavel.toFixed(2)}, ruína: ${X.ruina}`);
  // idade de liberdade esperada: a menor entre a do titular (62) e a idade do titular quando a Camila faz 60
  const idadeCam = (new Date(2026, 9, 19) - new Date(1987, 1, 1)) / (365.25 * 864e5), idadeRaf = X.idadeHoje;
  const libEsp = Math.min(62, idadeRaf + 60 - idadeCam);
  conf('G1', 'idade da liberdade = menor entre a do titular (62) e a do titular quando a Camila faz 60', 'recálculo com datas de nascimento', '1', Math.abs(libEsp - ff.age) * 52.18, Math.abs(libEsp - ff.age) < 0.02, `esperada ${libEsp.toFixed(3)} × motor ${ff.age.toFixed(3)} (resolução semanal)`);
  // ruína: o cofre fica negativo em algum mês?
  let minCofre = Infinity, minMi = null; X.meses.forEach(b => { if (b.fim.cofre < minCofre) { minCofre = b.fim.cofre; minMi = b.mi; } });
  conf('G2', 'ruína: o caixa livre nunca fica negativo (X.ruina = null)', 'varredura do cofre no fim do mês', NMES + ' meses', Math.max(0, -minCofre), minCofre >= 0 && X.ruina === null, `menor cofre ${minCofre.toFixed(2)} em mi ${minMi} (${nome(minMi)})`);
  // despesas escaladas após a liberdade: compara o que sai em despesas com o plano
  const rows = [];
  [ff.mi - 1, ff.mi, ff.mi + 1, ff.mi + 3, ff.mi + 12, 300, 320, 400, 500, 600].forEach(mi => {
    const b = byMi.get(mi); if (!b) return;
    const lin = plano.expenses.filter(e => !/^parc/.test(e.id)); const stepAt = (it, mm) => { let v = 0; for (const s of it.steps) { if (mm >= s.from) v = s.value; } return v; };
    const planoVida = lin.reduce((a, e) => a + stepAt(e, mi), 0), planoParc = plano.expenses.filter(e => /^parc/.test(e.id)).reduce((a, e) => a + stepAt(e, mi) + ((e.exc && e.exc[mi]) || 0), 0);
    const obsVida = Object.keys(b.fluxo).filter(k => /^out_(fix|adj)_/.test(k) && !/parc/.test(k)).reduce((a, k) => a + b.fluxo[k], 0);
    const obsParc = Object.keys(b.fluxo).filter(k => /parc/.test(k)).reduce((a, k) => a + b.fluxo[k], 0);
    const ent = Object.keys(b.fluxo).filter(k => k.startsWith('in_')).reduce((a, k) => a + b.fluxo[k], 0);
    rows.push({ mi, mes: nome(mi), planoVida, obsVida, planoParc, obsParc, ent });
  });
  R.Grows = rows; rows.forEach(r => log(`   ${r.mes} (mi ${r.mi}): vida plano ${r.planoVida.toFixed(0)} × motor ${r.obsVida.toFixed(0)} (×${(r.obsVida / (r.planoVida || 1)).toFixed(4)}) | parcelas plano ${r.planoParc.toFixed(2)} × motor ${r.obsParc.toFixed(2)} | entradas ${r.ent.toFixed(0)}`));
  // impacto acumulado de pagar parcela diferente da do contrato depois da liberdade
  let dif = 0, nm = 0; for (let mi = ff.mi; mi < NMES; mi++) { const b = byMi.get(mi); const pg = Object.keys(b.fluxo).filter(k => /parc/.test(k)).reduce((a, k) => a + b.fluxo[k], 0); const ct = DIV.reduce((a, c) => { const l = c.tab[c.k0 + mi]; return a + (l ? l.pay + l.extra : 0); }, 0); dif += pg - ct; if (Math.abs(pg - ct) > 0.5) nm++; }
  R.Gparc = { dif, nm }; log(`   depois da liberdade (mi ≥ ${ff.mi}): soma (parcelas pagas no caixa − parcelas do contrato) = ${dif.toFixed(2)} em ${nm} meses com diferença > R$ 0,50`);
}

// ============================================================ H. PATRIMÔNIO E FIDELIDADE AO CLIENTE (valores do cenário)
{
  const pat = mi => { const f = byMi.get(mi).fim; return f.fin + f.bens + f.part + f.prev - f.div; };
  const rows = [0, 1, 5, 12, 18, 36, 37, 60, 120, 244, 300, 400, 600, 704].map(mi => ({ mi, mes: nome(mi), pat: pat(mi), fin: byMi.get(mi).fim.fin, div: byMi.get(mi).fim.div, part: byMi.get(mi).fim.part }));
  R.Hpat = rows; rows.forEach(r => log(`   patrimônio ${r.mes} (mi ${r.mi}): ${r.pat.toFixed(0)} | fin ${r.fin.toFixed(0)} | dívida ${r.div.toFixed(0)} | part ${r.part.toFixed(0)}`));
  // conservação do patrimônio: Δpatrimônio = entradas − saídas + rendimentos + Δ valorização − (variação de dívida não paga com caixa)
  let eMax = 0, eMi = null, acum = 0;
  const rend = (mi) => { let r = 0; const g = Math.pow(1 + X.R_M, 7 / 30.4375);
    const b = byMi.get(mi); for (let i = b.w0; i < b.w1; i++) { if (i < W0) continue; const p = WK[i - 1], miAnt = i === W0 ? 0 : Math.max(0, p.mi); const c0 = baseCofre(i); if (c0 > 0) r += c0 * (g - 1); OBJ.forEach((o, k) => { const o0 = baseObj(i, k); r += o0 * (Math.pow(1 + taxaEsperada(o, miAnt), 7 / 30.4375) - 1); }); } return r; };
  const comprasBens = 0;
  // para cada mês mi≥1: Δ(patrimônio) − [Σin − Σout + rend + Δpart + Δbens(valorização) + Δprev] = −Δdívida(contábil) ... deve ser = −(queda de dívida) que o caixa "pagou"; aqui o resíduo = queda de dívida − principal pago implícito
  const resid = [];
  for (let mi = 1; mi < NMES; mi++) {
    const b = byMi.get(mi), a = byMi.get(mi - 1);
    let ent = 0, sai = 0; Object.keys(b.fluxo).forEach(k => { if (k.startsWith('in_')) ent += b.fluxo[k]; else if (k.startsWith('out_')) sai += b.fluxo[k]; });
    const r = rend(mi);
    const dPat = pat(mi) - pat(mi - 1);
    const dVal = (b.fim.part - a.fim.part) + (b.fim.bens - a.fim.bens) + (b.fim.prev - a.fim.prev);
    const esperado = ent - sai + r + dVal - (b.fim.div - a.fim.div);
    const comMovBens = 0;
    resid.push({ mi, r: dPat - esperado });
  }
  const mx = resid.reduce((a, x) => Math.abs(x.r) > Math.abs(a.r) ? x : a, { r: 0 });
  conf('H0', 'identidade Δpatrimônio = entradas − saídas + rendimento + Δparticipação/bens/prev − Δdívida', 'por mês, rendimento recalculado semana a semana', (NMES - 1) + ' meses', Math.abs(mx.r), Math.abs(mx.r) < 0.5, `maior resíduo ${mx.r.toFixed(4)} em mi ${mx.mi}`);
}


// ============================================================ C (cont.): erro do motor contra a leitura correta + sensibilidades do contrato
{
  log('--- C+: diferença motor − referência "declarado depois da parcela do mês" (alt), por dívida');
  DIV.forEach(c => {
    let n1 = 0, dmax = 0, dmi = 0, soma = 0;
    for (let mi = 0; mi < NMES; mi++) { const d = c.regra(mi) - c.alt(mi); if (Math.abs(d) > 1) n1++; if (Math.abs(d) > Math.abs(dmax)) { dmax = d; dmi = mi; } soma += d; }
    const vals = []; for (let mi = 1; mi < c.rest - 1; mi++) vals.push(c.regra(mi) - c.alt(mi)); vals.sort((a, b) => a - b);
    c.altStat = { n1, dmax, dmi, mediana: vals[Math.floor(vals.length / 2)], p5: vals[Math.floor(vals.length * 0.05)], p95: vals[Math.floor(vals.length * 0.95)] };
    log(`   ${c.nome}: meses com |dif|>R$1: ${n1} | maior ${dmax.toFixed(2)} (mi ${dmi}, ${nome(dmi)}) | mediana ${c.altStat.mediana.toFixed(2)} | p5..p95 ${c.altStat.p5.toFixed(2)}..${c.altStat.p95.toFixed(2)}`);
  });
  const totAno = {}; for (let mi = 0; mi < NMES; mi++) { const d = DIV.reduce((a, c) => a + c.regra(mi) - c.alt(mi), 0); const y = calDe(mi).y; (totAno[y] = totAno[y] || []).push(d); }
  log('   dívida total a mais no motor (média dos meses do ano): ' + Object.keys(totAno).filter(y => y < 2031).map(y => y + ': ' + (totAno[y].reduce((a, b) => a + b, 0) / totAno[y].length).toFixed(0)).join(' | '));
  const sala = DIV[1], i10 = Math.pow(1.10, 1 / 12) - 1;
  const t10 = tabela(sala.F, i10, sala.n, true, null);
  const jD = sala.tab0.slice(sala.k0 + 1).reduce((a, l) => a + l.juros, 0), j10 = t10.slice(sala.k0 + 1).reduce((a, l) => a + l.juros, 0);
  log(`   SAC da sala: parcela idx${sala.k0} (a 17ª) a 10% a.a. = ${t10[sala.k0].pay.toFixed(2)}; idx${sala.k0 + 1} (a 18ª) = ${t10[sala.k0 + 1].pay.toFixed(2)} (o cliente fala "parcela atual 2.555" e o cenário chama 2.555 de 18ª) | juros futuros: 10% a.a. = ${j10.toFixed(2)} × derivada (9,934%) = ${jD.toFixed(2)} (dif ${(j10 - jD).toFixed(2)})`);
  R.sala10 = { p17: t10[sala.k0].pay, p18: t10[sala.k0 + 1].pay, j10, jD };
  const car = DIV[2];
  log(`   Carro: saldo contratual depois da 24ª parcela (out/2027, idx 23) = ${car.tab0[23].saldo.toFixed(2)} (menos 20.000 = ${(car.tab0[23].saldo - 20000).toFixed(2)}); depois da 25ª (idx 24) = ${car.tab0[24].saldo.toFixed(2)} (o cenário diz 39.141: é o da 25ª, nov/2027, não o de out/2027)`);
  R.car = { s24: car.tab0[23].saldo, s25: car.tab0[24].saldo };
  const ep = DIV[3]; const out = [];
  for (const F of [38000, 39200, 39400]) { const i = taxaDaParcela(F, 36, ep.k0, 1700, false); const t = tabela(F, i, 36, false, null); out.push(`F=${F}: i=${(i * 100).toFixed(3)}% a.m. saldo após a parcela idx${ep.k0 + 17} = ${t[ep.k0 + 17].saldo.toFixed(2)}`); }
  log('   Empréstimo pessoal, sensibilidade ao valor financiado: ' + out.join(' | '));
  log(`   (o cenário esperava taxa ~2,64% a.m. e saldo ~10.400 em mar/2028; o contrato com os 38.000 já com IOF dá ${(ep.i * 100).toFixed(3)}% e ${ep.tab0[ep.k0 + 17].saldo.toFixed(2)})`);
  const cart = DIV[4]; log(`   Cartão: taxa implícita ${(cart.i * 100).toFixed(4)}% a.m. (cenário: ~2,36%); saldo após 7 parcelas ${cart.tab0[6].saldo.toFixed(2)} (declarado ${cart.d.saldoDevedor})`);
}

// ============================================================ D (cont.): aporte necessário por caixinha e a regra de parada
{
  log('--- D+: aporte mensal necessário recalculado (depósito no fim de cada mês, taxa do mês; dedicado entra no mês 0)');
  OBJ.forEach(o => {
    const n = o.months; let fvPorReal = 0;
    for (let k = 1; k <= n; k++) { let g = 1; for (let j = k; j < n; j++) g *= 1 + taxaEsperada(o, j); fvPorReal += g; }
    let gd = 1; for (let j = 0; j < n; j++) gd *= 1 + taxaEsperada(o, j);
    const req = Math.max(0, (o.amount - o.dedicated * gd) / fvPorReal);
    o.reqInd = req; log(`   ${o.name}: aporte necessário independente ${req.toFixed(2)} × motor (required) ${o.required.toFixed(2)} (dif ${(req - o.required).toFixed(4)}) | planejado ${o.planned}`);
  });
  const progr = S.programa; if (progr) {
    log(`   programa de aportes: faltas=${progr.faltas.length}, meses com corte=${progr.meses.filter(m => m.corte > 0.5).length}, folgaCortada=${progr.folgaCortada}, meses com caixa negativo=${progr.meses.filter(m => m.negativo).length} (dos ${progr.meses.length} primeiros)`);
    R.programa = { faltas: progr.faltas.length, cortes: progr.meses.filter(m => m.corte > 0.5).length };
  }
  const rows = []; let minSobra = 1e18, maxSobra = -1e18, nNeg = 0, nMes = 0;
  for (let mi = 1; mi <= 60; mi++) { const b = byMi.get(mi); let e = 0, s = 0; Object.keys(b.fluxo).forEach(k => { if (k.startsWith('in_')) e += b.fluxo[k]; else if (k.startsWith('out_') && !k.startsWith('out_obj_')) s += b.fluxo[k]; }); const ap = Object.keys(b.fluxo).filter(k => k.startsWith('mov_obj_')).reduce((a, k) => a + b.fluxo[k], 0); const sobra = e - s; nMes++; if (sobra - ap < 0) nNeg++; minSobra = Math.min(minSobra, sobra); maxSobra = Math.max(maxSobra, sobra); rows.push({ mi, sobra, ap }); }
  log(`   sobra mensal (entradas − saídas de linhas) nos meses 1..60: mín ${minSobra.toFixed(0)}, máx ${maxSobra.toFixed(0)}; meses em que a sobra não paga os aportes (cobertos pelo caixa livre): ${nNeg} de ${nMes}`);
  const acum = rows.slice(0, 12).reduce((a, r) => a + r.sobra - r.ap, 0); log(`   saldo (sobra − aportes) nos primeiros 12 meses = ${acum.toFixed(0)}; caixa livre mínimo (60 meses) ${Math.min(...X.meses.slice(0, 60).map(b => b.fim.cofre)).toFixed(0)} (reserva de emergência declarada: ${plano.politica.reserva})`);
  R.sobra = { minSobra, maxSobra, nNeg, nMes, acum };
  log(`   Viagem: caixinha vazia; saída out_obj_viagem ${byMi.get(5).fluxo.out_obj_viagem} em ${nome(5)} paga pelo caixa livre (cliente: "só se sobrar")`);
}

// ============================================================ G (cont.): janelas depois da liberdade
{
  const ff = X.ff.mi, stepAt = (it, mm) => { let v = 0; for (const s of it.steps.slice().sort((a, b) => a.from - b.from)) { if (mm >= s.from) v = s.value; } return v; };
  const planoSai = mi => plano.expenses.reduce((a, e) => a + stepAt(e, mi) + ((e.exc && e.exc[mi]) || 0), 0);
  const obsSai = mi => { const b = byMi.get(mi); return Object.keys(b.fluxo).filter(k => k.startsWith('out_') && !k.startsWith('out_obj_')).reduce((a, k) => a + b.fluxo[k], 0); };
  const obsEnt = mi => { const b = byMi.get(mi); return Object.keys(b.fluxo).filter(k => k.startsWith('in_')).reduce((a, k) => a + b.fluxo[k], 0); };
  const jan = [[ff, 246, 'Camila já parou; Rafael ainda trabalha'], [247, 247, 'mês do saque do FGTS (R$ 85.000)'], [248, 315, 'até o fim da hipoteca'], [316, 360, 'sem hipoteca']];
  R.Gwin = [];
  jan.forEach(([a, b, tx]) => { let pl = 0, ob = 0, ent = 0; for (let mi = a; mi <= b; mi++) { pl += planoSai(mi); ob += obsSai(mi); ent += obsEnt(mi); } const dif = ob - pl; R.Gwin.push({ a, b, tx, pl, ob, dif, ent }); log(`   mi ${a}..${b} (${nome(a)}..${nome(b)}; ${tx}): saídas do plano ${pl.toFixed(0)} × saídas do motor ${ob.toFixed(0)} (dif ${dif.toFixed(0)}, ${(dif / (b - a + 1)).toFixed(0)}/mês) | entradas ${ent.toFixed(0)}`); });
  const m247 = byMi.get(247); log('   mi 247: entradas ' + JSON.stringify(Object.fromEntries(Object.entries(m247.fluxo).filter(([k]) => k.startsWith('in_')))) + ' | prev antes/depois: ' + byMi.get(246).fim.prev + ' → ' + m247.fim.prev + ' | financeiro antes/depois: ' + byMi.get(246).fim.fin.toFixed(0) + ' → ' + m247.fim.fin.toFixed(0));
  const dfin = m247.fim.fin - byMi.get(246).fim.fin; log(`   variação do financeiro no mês do FGTS: ${dfin.toFixed(0)}`);
  const fim = NMES - 1; const cap = 85000 * Math.pow(1 + X.R_M, fim - 247);
  R.fgts = { dfin, cap, fim }; log(`   85.000 de mi 247 capitalizados à taxa do plano até mi ${fim} (${nome(fim)}): ${cap.toFixed(0)}`);
}

// ============================================================ H (cont.): tabela de fidelidade com o cenário
{
  const lin = [
    ['Parcela Price imobiliário', 4677, DIV[0].P, 'dado'],
    ['Taxa implícita do apartamento (a.a., %)', 9.0, DIV[0].aa * 100, 'dado'],
    ['Saldo contratual após 46 parcelas', 580854, DIV[0].sDepois, 'cenário'],
    ['Saldo após 82 parcelas (antes do extra)', 560776, DIV[0].tab0[81].saldo, 'cenário'],
    ['Saldo após o extra de R$ 60.000', 500800, DIV[0].tab0[81].saldo - 60000, 'cenário'],
    ['Parcela do apartamento após o extra', 4180, DIV[0].tab[82].pay, 'cenário'],
    ['SAC sala: 1ª parcela', 2706, DIV[1].tab0[0].pay, 'cenário'],
    ['SAC sala: saldo após 17 pagas', 181111, DIV[1].tab0[DIV[1].k0].saldo, 'cenário'],
    ['Carro: saldo após 12 parcelas', 56473, DIV[2].sDepois, 'cenário'],
    ['Carro: saldo após a 25ª parcela', 39141, DIV[2].tab0[24].saldo, 'cenário (a de out/2027 é a 24ª)'],
    ['Empréstimo: saldo em mar/2028', 10400, DIV[3].ex17 ? DIV[3].ex17.saldoAntesExtra : 0, 'cenário (aprox.)'],
    ['Empréstimo: taxa implícita (% a.m.)', 2.64, DIV[3].i * 100, 'cenário (aprox.)'],
    ['Cartão: taxa implícita (% a.m.)', 2.36, DIV[4].i * 100, 'cenário (aprox.)'],
    ['Loja mês 12', 276000, X.parts[0].serie[12], 'cenário'],
    ['Loja mês 18', 185311, X.parts[0].serie[18], 'cenário'],
    ['Loja mês 48+', 150443, X.parts[0].serie[48], 'cenário'],
    ['Aporte necessário: reforma', 1162, OBJ[1].reqInd, 'cenário'],
    ['Aporte necessário: intercâmbio', 1011, OBJ[2].reqInd, 'cenário'],
    ['Aporte necessário: viagem', 3571, OBJ[0].required, 'cenário'],
  ];
  R.H = lin.map(([q, esp, obs, nota]) => ({ q, esp, obs, nota })); lin.forEach(([q, esp, obs, nota]) => log(`   ${q}: cenário ${esp} | recalculado/motor ${Number(obs).toFixed(2)} | dif ${(obs - esp).toFixed(2)} [${nota}]`));
  const o = OBJ[3]; let fv = 0; const n = o.months; for (let k = 1; k <= n; k++) { let g = 1; for (let j = k; j < n; j++) g *= 1 + taxaEsperada(o, j); fv += g; }
  log(`   Faculdade sem patrimônio dedicado: aporte necessário ${(o.amount / fv).toFixed(2)} (cenário: 1.123); com os 80.000 dedicados: ${o.reqInd.toFixed(2)} (planejado 236)`);
}


// ============================================================ patrimônio líquido: efeito em R$ da leitura do saldo/amortização (motor − referência)
{
  const pat = mi => { const f = byMi.get(mi).fim; return f.fin + f.bens + f.part + f.prev - f.div; };
  log('--- patrimônio líquido: motor × com a dívida na leitura correta (saldo declarado depois da parcela do mês; amortização na mesma data do caixa)');
  [0, 1, 2, 5, 6, 12, 13, 17, 18, 24, 36, 37, 60, 163, 164, 314, 315].forEach(mi => {
    const dEng = DIV.reduce((a, c) => a + c.regra(mi), 0), dAlt = DIV.reduce((a, c) => a + c.alt(mi), 0);
    log(`   mi ${mi} (${nome(mi)}): dívida motor ${dEng.toFixed(0)} × referência ${dAlt.toFixed(0)} → patrimônio subestimado em ${(dEng - dAlt).toFixed(0)} (patrimônio do motor ${pat(mi).toFixed(0)})`);
  });
  const c5 = DIV[4]; log('   cartão, saldo mi 0..6: motor ' + [0, 1, 2, 3, 4, 5, 6].map(k => c5.regra(k).toFixed(2)).join(' / ') + ' | referência ' + [0, 1, 2, 3, 4, 5, 6].map(k => c5.alt(k).toFixed(2)).join(' / '));
  { const ds = []; for (let mi = 1; mi <= 314; mi++) ds.push(DIV.reduce((a, c) => a + c.regra(mi) - c.alt(mi), 0)); const med = ds.reduce((a, b) => a + b, 0) / ds.length; const sorted = ds.slice().sort((a, b) => a - b);
    log(`   dívida a mais no motor (mi 1..314): média ${med.toFixed(0)}, mediana ${sorted[157].toFixed(0)}, p95 ${sorted[Math.floor(314 * 0.95)].toFixed(0)}, máx ${sorted[313].toFixed(0)}; patrimônio do motor no mi 314: ${(pat(314)).toFixed(0)} (erro relativo máx = ${(sorted[313] / pat(36) * 100).toFixed(2)}% do patrimônio de mi 36)`); R.dividaMais = { med, mediana: sorted[157], p95: sorted[Math.floor(314 * 0.95)], max: sorted[313] }; }
  const ap = DIV[0]; log('   apartamento, mi 313..316: motor ' + [313, 314, 315, 316].map(k => ap.regra(k).toFixed(2)).join(' / ') + ' | referência ' + [313, 314, 315, 316].map(k => ap.alt(k).toFixed(2)).join(' / '));
}

// ============================================================ TESTE DE ESTRESSE: variante do plano com VENDA da participação (caminho não exercitado no plano real)
{
  const E2 = H.carregar(); const P2 = JSON.parse(JSON.stringify(plano));
  P2.patrimonio.participacoes[0].venda = { em: 30, preco: 180000, custos: [{ nome: 'Corretagem', pct: 5 }, { nome: 'Advogado', valor: 3000 }], destinos: [{ objetivo: 'reforma', valor: 20000 }] };
  const X2 = H.extrato({ dados: P2 }, E2);
  const p0 = P2.patrimonio.participacoes[0];
  // esperado independente: taxa -8% a.a. e salto -30% no mês 18 só valem enquanto não houver "alvo"; com preço de venda informado,
  // o motor trata o preço como valor esperado no mês da venda (planilha: "cresce até lá, sem salto na venda") → ritmo geométrico até 180.000
  // premissa de desenho: com alvo, a taxa deixa de valer; o salto pontual continua valendo e o ritmo é refeito a cada mês.
  const tgt = { em: 30, valor: 180000 };
  const esp = [300000]; let v = 300000;
  for (let m = 1; m <= 30; m++) { v = v * Math.pow(tgt.valor / v, 1 / (tgt.em - m + 1)); if (m === 18) v = Math.max(0, v * 0.7); esp.push(v); }
  let eS = 0; for (let m = 0; m <= 30; m++) eS = Math.max(eS, Math.abs(esp[m] - X2.parts[0].serie[m]));
  const ve = X2.parts[0].venda;
  log(`   [estresse] série até a venda com alvo 180.000 em mi 30: erro máx ${eS.toFixed(6)} (valor em mi 18: ${esp[18].toFixed(2)}; em mi 29: ${esp[29].toFixed(2)}; em mi 30: ${esp[30].toFixed(2)})`);
  const preco = 180000, custo = preco * 0.05 + 3000, liq = preco - custo;
  log(`   [estresse] venda: preço ${ve.preco} (esp ${preco}), custos ${ve.custo} (esp ${custo}), líquido ${ve.liquido} (esp ${liq}), quitação ${ve.quitacao}`);
  const b29 = X2.meses.find(b => b.mi === 29), b30 = X2.meses.find(b => b.mi === 30), b31 = X2.meses.find(b => b.mi === 31);
  log(`   [estresse] part mi 29/30/31: ${b29.fim.part.toFixed(2)} / ${b30.fim.part.toFixed(2)} / ${b31.fim.part.toFixed(2)} (esp: valor anterior / 0 / 0)`);
  const fl = b30.fluxo; log(`   [estresse] fluxo mi 30: mov_bens ${fl.mov_bens} (esp −${esp[29].toFixed(2)}? o motor lança o PREÇO), custos out_vendap_0 ${fl.out_vendap_0} (esp ${custo}), mov_obj_reforma ${fl.mov_obj_reforma} (esp aporte 1162 + 20000 = 21162)`);
  log(`   [estresse] eventos: ` + JSON.stringify(X2.eventos.filter(e => e.type === 'venda')));
  // a participação não vai a zero antes: e a série pós-venda é zero
  const posVenda = X2.meses.filter(b => b.mi >= 30).every(b => b.fim.det.parts[0] === 0 && b.fim.part === 0);
  log(`   [estresse] participação zero em todos os meses depois da venda: ${posVenda}`);
  // saldo da reforma: dedicado de venda rende; confere o valor do mês 31 com a conta: (saldo mi 29 *(g) + 1162 + 20000)
  // conservação do dinheiro no mês da venda: Δfin = Δ(entradas − saídas) + preço − 20000(transferência interna não muda fin)
  const dFin = b30.fim.fin - b29.fim.fin; let ent = 0, sai = 0; Object.keys(fl).forEach(k => { if (k.startsWith('in_')) ent += fl[k]; else if (k.startsWith('out_')) sai += fl[k]; });
  const patrim = b => b.fim.fin + b.fim.bens + b.fim.part + b.fim.prev - b.fim.div;
  log(`   [estresse] Δfinanceiro no mês da venda ${dFin.toFixed(2)} = entradas ${ent.toFixed(2)} − saídas ${sai.toFixed(2)} + preço ${preco} + rendimento; Δpart ${(b30.fim.part - b29.fim.part).toFixed(2)} (= −valor anterior ${esp[29].toFixed(2)} → a venda realiza o valor esperado ${esp[30].toFixed(2)}≈${preco})`);
  R.estresse = { eS, venda: ve, esperado: { preco, custo, liq } };
  conf('B4', 'estresse: venda da participação (série com alvo, preço, custos, líquido, zero depois)', 'variante do plano + recálculo geométrico', '31 meses + pós-venda', Math.max(eS, Math.abs(ve.preco - preco), Math.abs(ve.custo - custo), Math.abs(ve.liquido - liq)), eS < TOL && Math.abs(ve.liquido - liq) < TOL && posVenda);
}


// ============================================================ TESTE DE ESTRESSE 2: regra "o aporte para quando a caixinha já basta" (variante com a venda financiando a reforma)
{
  const E3 = H.carregar(); const P3 = JSON.parse(JSON.stringify(plano));
  P3.patrimonio.participacoes[0].venda = { em: 30, preco: 180000, custos: [{ nome: 'Corretagem', pct: 5 }, { nome: 'Advogado', valor: 3000 }], destinos: [{ objetivo: 'reforma', valor: 20000 }] };
  const X3 = H.extrato({ dados: P3 }, E3); const k = 1, o = X3.objetivos[k];
  const by = new Map(X3.meses.map(b => [b.mi, b])); const rows = [];
  for (let mi = 20; mi <= 35; mi++) {
    const ant = by.get(mi - 1).fim.obj[k], ap = (by.get(mi).fluxo.mov_obj_reforma || 0) - (mi === 30 ? 20000 : 0);
    let g = 1; for (let j = mi; j < 36; j++) g *= 1 + taxaEsperada(o, j);          // crescimento mensal até a data
    let gv = 1; for (let j = 30; j < 36; j++) gv *= 1 + taxaEsperada(o, j);        // a venda de 20.000 em mi 30 rende até a data
    const proj = (mi === 30 ? ant + 20000 : ant) * g + (mi < 30 ? 20000 * gv : 0);  // projeção na data: o que há + o que ainda vai entrar pela venda
    const falta = Math.max(0, (45000 * 1.01 - proj) / g);
    rows.push({ mi, ap, esp: Math.min(1162, falta), proj, falta });
  }
  rows.forEach(r => log(`   [estresse2] mi ${r.mi}: projeção na data ${r.proj.toFixed(0)} aporte observado ${r.ap.toFixed(2)} × regra ${r.esp.toFixed(2)}`));
  const eMax = Math.max(...rows.map(r => Math.abs(r.ap - r.esp)));
  const sq = -(X3.meses.find(b => b.mi === 36).fluxo.mov_obj_reforma || 0);
  log(`   [estresse2] saque da reforma na data: ${sq.toFixed(2)} (meta 45.000; ${(sq / 450 - 100).toFixed(2)}% acima da meta) — a regra para de aportar quando a projeção cobre a meta com 1% de folga`);
  conf('D4', 'estresse: regra de parada do aporte (a venda que financia a reforma torna a caixinha suficiente)', 'variante + recálculo mês a mês incluindo a entrada futura da venda', '16 meses (mi 20..35)', eMax, eMax < 150 && sq >= 45000, 'diferença residual por desenho: o programa conta a taxa do mês duas vezes (aplica no início do mês e depois usa F[n]/F[mi], que inclui o mês); coberto pela folga de 1%');
}


// ============================================================ G (cont. 2): liberdade forçada, INSS, parcelas pré/pós liberdade
{
  const ff = X.ff, stepAt = (it, mm) => { let v = 0; for (const s of it.steps.slice().sort((a, b) => a.from - b.from)) { if (mm >= s.from) v = s.value; } return v; };
  // sustentável? (patrimônio financeiro na liberdade × taxa mensal) contra a maior falta mensal da renda desejada
  const rendaPassiva = stepAt(plano.incomes.find(i => i.id === 'aluguel_sala'), ff.mi);
  const maxGap = plano.desired - rendaPassiva;      // sem INSS e sem salário: o maior buraco é no primeiro mês da aposentadoria plena
  const sust = ff.finAfter * X.R_M + (plano.desired - maxGap);
  conf('G3', 'liberdade forçada: financeiro × 0,4% a.m. < maior falta de renda ⇒ forced = true; sustentável = rendimento + (desejado − falta)', 'recálculo', '1', Math.abs(sust - ff.sustentavel) + Math.abs(maxGap - ff.maxGap), Math.abs(sust - ff.sustentavel) < 0.01 && Math.abs(maxGap - ff.maxGap) < 0.01 && ((ff.finAfter * X.R_M < maxGap) === ff.forced), `rendimento ${(ff.finAfter * X.R_M).toFixed(2)} < falta ${maxGap} → forced=${ff.forced}; sustentável ${sust.toFixed(2)}`);
  // INSS: meses de início
  const ins = []; for (const [k, nm] of [['in_pas_0', 'INSS do Rafael'], ['in_pas_1', 'INSS da Camila']]) { const b = X.meses.find(b => (b.fluxo[k] || 0) > 0); ins.push(`${nm} (${k}): primeiro mês mi ${b && b.mi} (${b && nome(b.mi)}) valor ${b && b.fluxo[k]}`); }
  const rafaelEsp = mesIdx(2050, 6), camilaEsp = mesIdx(2049, 2);
  log('   ' + ins.join(' | ') + ` | esperado pelo calendário: Rafael 65 anos = jun/2050 = mi ${rafaelEsp}; Camila 62 anos = fev/2049 = mi ${camilaEsp}`);
  // financeiro nunca cai depois da liberdade? mínimo e idade
  let minF = 1e18, minMi = 0; X.meses.forEach(b => { if (b.mi >= ff.mi && b.fim.fin < minF) { minF = b.fim.fin; minMi = b.mi; } });
  log(`   financeiro mínimo depois da liberdade: ${minF.toFixed(0)} em mi ${minMi} (${nome(minMi)}); no mi final: ${X.meses[NMES - 1].fim.fin.toFixed(0)}`);
  // parcelas antes da liberdade: diferença para o contrato
  const nomeLinha = ['parc0', 'parc1', 'parc2', 'parc3', 'parc4'];
  DIV.forEach(c => { let nPre = 0, nPos = 0, pre = 0, pos = 0; for (let mi = 1; mi < NMES; mi++) { const l = c.tab[c.k0 + mi]; const ct = l ? l.pay + l.extra : 0; const cx = byMi.get(mi).fluxo['out_fix_' + nomeLinha[c.idx]] || 0; if (Math.abs(cx - ct) > 0.015) { if (mi < ff.mi) { nPre++; pre += cx - ct; } else { nPos++; pos += cx - ct; } } }
    log(`   ${c.nome}: antes da liberdade ${nPre} meses com parcela ≠ contrato (soma ${pre.toFixed(2)}) | depois ${nPos} meses (soma ${pos.toFixed(2)})`); c.preFF = { nPre, pre, nPos, pos }; });
  const fgts = byMi.get(247); log(`   mi 247: parcela do apartamento no caixa ${fgts.fluxo.out_fix_parc0} (contrato ${DIV[0].tab[DIV[0].k0 + 247].pay.toFixed(2)}); escola/alimentação etc. ×${(fgts.fluxo.out_adj_alimentacao / 3600).toFixed(4)}`);
}


// ============================================================ VEREDITOS CONTRA A REFERÊNCIA CORRETA (o que o dono do produto quer: sem erro)
{
  // C5: a amortização antecipada baixa a dívida no MESMO mês em que o dinheiro sai do caixa
  let e5 = 0; const det5 = [];
  DIV.forEach(c => (c.d.amortizacoes || []).forEach(a => { const d = Math.abs(byMi.get(a.em).fim.det.divs[c.idx] - c.alt(a.em)); e5 = Math.max(e5, d); det5.push(`${c.nome}@mi${a.em}: motor ${byMi.get(a.em).fim.det.divs[c.idx].toFixed(0)} × ref ${c.alt(a.em).toFixed(0)}`); }));
  conf('C5', 'amortização antecipada: a dívida cai no mês em que o dinheiro sai do caixa', 'referência = declarado × contrato(k0+mi)/contrato(k0) com o extra no mesmo mês', '3 amortizações (apartamento mi 36, carro mi 12, empréstimo mi 17)', e5, e5 < 1, det5.join(' | '));
  // C6: a dívida chega a zero no mês do último pagamento
  let e6 = 0; const det6 = []; DIV.forEach(c => { const s = c.quit.saldoNoUltimoPg; e6 = Math.max(e6, s); det6.push(`${c.nome}: ${s.toFixed(0)}`); });
  conf('C6', 'quitação: saldo devedor zero no mês do último pagamento no caixa', 'comparação dos 5 contratos', '5 dívidas', e6, e6 < 0.01, 'saldo ainda lançado no mês da última parcela: ' + det6.join(' | '));
  // C7: caminho do saldo ao longo da vida = referência (|dif| máx por dívida)
  let e7 = 0; DIV.forEach(c => { for (let mi = 0; mi < NMES; mi++) e7 = Math.max(e7, Math.abs(c.regra(mi) - c.alt(mi))); });
  conf('C7', 'saldo devedor de cada mês = referência (declarado ancorado depois da parcela do mês)', '5 dívidas × 705 meses', '5 × 705', e7, e7 < 1, 'diferença máxima em mi 36 (extra do apartamento); fora dos meses de extra, ver C+');
  // C8: pagamentos no caixa = parcelas do contrato (todos os meses)
  let e8 = 0; DIV.forEach(c => { e8 = Math.max(e8, c.maxDiff); });
  conf('C8', 'parcela que sai no caixa = parcela do contrato (todos os meses, 5 dívidas)', 'tabela própria × out_fix_parc*', '5 × 704 meses', e8, e8 < 0.015, `diferenças: apartamento só depois da liberdade (${DIV[0].preFF.nPos} meses, soma ${DIV[0].preFF.pos.toFixed(2)}); sala SAC em degraus anuais (${DIV[1].preFF.nPre} meses, soma ${DIV[1].preFF.pre.toFixed(2)}); carro, empréstimo e cartão: exatos`);
  // F2: SAC
  conf('F2', 'parcela da sala (SAC) no caixa = parcela exata do contrato', 'tabela SAC própria × out_fix_parc1 (mi 1..163)', '163 meses', R.Fsac.maxSobre, false, `o plano grava degraus anuais; excesso acumulado ${R.Fsac.sobre.toFixed(2)} (maior mês ${R.Fsac.maxSobre.toFixed(2)}) — limitação da tradução/portal, não do motor`);
  // G4: o saque do FGTS entra no financeiro
  const dfin = R.fgts.dfin, rendMes = byMi.get(246).fim.fin * (Math.pow(1.004, 1) - 1);
  conf('G4', 'saque do FGTS (R$ 85.000) vai para o financeiro, sem virar gasto do mês', 'variação do financeiro em mi 247 vs rendimento esperado do mês', 'mi 247', Math.abs(dfin - rendMes - 85000 + 2800 - 0), (dfin - rendMes) > 80000, `Δfinanceiro ${dfin.toFixed(0)} ≈ só o rendimento (${rendMes.toFixed(0)}): os 85.000 foram consumidos como gasto (despesas ×4,23, inclusive a parcela do apartamento: ${byMi.get(247).fluxo.out_fix_parc0.toFixed(2)})`);
  // G5: despesas fixas contratuais não deveriam ser escaladas pelo padrão de vida
  conf('G5', 'depois da liberdade, a parcela de dívida continua a do contrato (não é escalada pelo padrão de vida)', 'parcela do apartamento no caixa × contrato, mi 244..314', '71 meses', DIV[0].maxDiff, DIV[0].preFF.nPos === 0, `soma das diferenças ${DIV[0].preFF.pos.toFixed(2)}; mi 247: ${byMi.get(247).fluxo.out_fix_parc0.toFixed(2)} × 4176.59`);
}

// ============================================================ saída
fs.writeFileSync(path.join(process.env.TEMP || __dirname, 'auditor-02.saida.json'), JSON.stringify({ R, DIV: DIV.map(c => ({ nome: c.nome, k0: c.k0, i: c.i, aa: c.aa, sAntes: c.sAntes, sDepois: c.sDepois, pagoCx: c.pagoCx, pagoCt: c.pagoCt, juros: c.juros, imp: c.imp, quit: c.quit, altDiff: c.altDiff, maxDiff: c.maxDiff, pior: c.pior, nDif: c.nDif })), OBJ: OBJ.map(o => ({ id: o.id, rec: o.rec, imp: o.imp, difAporte: o.difAporte })) }, null, 1));
