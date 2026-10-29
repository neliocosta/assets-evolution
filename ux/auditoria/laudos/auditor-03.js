// Auditor matemático do CENÁRIO 03 (Jorge e Marta). Reexecutável: node ux\auditoria\laudos\auditor-03.js
// Estratégia: o "observado" vem da simulação do motor (via harness: E.run); o "esperado" é recalculado aqui, só a partir do
// PLANO (planos\plano-03.json) e das regras do domínio financeiro. Nenhuma função do motor (trajetoriaDoBem, saldoDevedorEm,
// taxaDoObjetivo, ...) é usada para produzir o esperado.
// Premissas de desenho (registradas no laudo): mês 30,4375 dias; rendimento semanal composto (1+i)^(7/30,4375) aplicado no
// início da semana, antes dos lançamentos dela; a taxa de uma semana é a do mês-ciclo que ela encerra (rótulo da semana
// anterior); o ciclo (mês) vai de um dia 5 ao seguinte.
const fs = require('fs'), path = require('path');
const AUD = path.join(__dirname, '..');
const H = require(path.join(AUD, 'harness.js'));
const plano = JSON.parse(fs.readFileSync(path.join(AUD, 'planos', 'plano-03.json'), 'utf8')).dados;
const extr = JSON.parse(fs.readFileSync(path.join(AUD, 'extratos', 'extrato-03.json'), 'utf8'));

// ---------- observado ----------
const E = H.carregar(); const P = JSON.parse(JSON.stringify(plano)); E.configure(P);
const S = E.run('desej'); const weeks = S.weeks, NW = E.NW, W0 = E.W0;
const checks = []; const achados = [];
const chk = (id, o, metodo, amostra, erro, ok, nota) => { checks.push({ id, o, metodo, amostra, erro, ok, nota: nota || '' }); };
const fmt = v => (v == null ? '-' : (Math.abs(v) < 1e-3 ? v.toExponential(1) : v.toFixed(2)));
const maxAbs = a => a.reduce((m, v) => Math.max(m, Math.abs(v)), 0);

// ---------- parâmetros do plano (independentes do motor) ----------
const R_M = 0.004;                                   // padrão do sistema (plano sem "rate"): 0,4% a.m. real líquido
const PERFIL = { conservador: 0.004, moderado: 0.005, agressivo: 0.006 };
const EXP = 7 / 30.4375;                             // fração de mês de uma semana
const GWk = Math.pow(1 + R_M, EXP);
const WPY = 365.25 / 7;
const nasc = new Date(1955, 3, 15), hoje = new Date(2026, 9, 14);
const idade = (hoje - nasc) / (365.25 * 864e5);
const w0 = Math.round(idade * WPY);
const CM0 = 2026 * 12 + 9;                           // mês 0 = outubro/2026 (hoje é 14/10, depois do dia 5)
// calendário próprio: a semana i tem salário se contém um dia 5
const diaDe = i => { const d0 = new Date(nasc.getTime() + i * 7 * 864e5); for (let j = 0; j < 7; j++) { const d = new Date(d0.getTime() + j * 864e5); if (d.getDate() === 5) return d; } return null; };
const rot = new Array(NW).fill(-1); { let cur = -1; for (let i = w0 - 6; i < NW; i++) { const d = diaDe(i); if (d) cur = d.getFullYear() * 12 + d.getMonth() - CM0; rot[i] = cur; } }
{ let dif = 0, n = 0; for (let i = w0; i < NW; i++) { n++; if (rot[i] !== weeks[i].mi) dif++; } let dpre = 0; for (let i = w0 - 6; i < w0; i++) if (rot[i] !== weeks[i].mi) dpre++; chk('0.1', 'Calendário: rótulo de mês (ciclo dia 5) de cada semana de hoje em diante', 'calendário próprio (nascimento+7i dias, dia 5) × weeks[i].mi', n + ' semanas', dif, dif === 0, dif + ' divergências; ' + dpre + ' semanas anteriores a hoje (set/2026, sem lançamentos) têm o rótulo do mês 0 em vez de −1, sem efeito'); }
chk('0.2', 'W0 (semana de hoje) e idade', 'round(idade·365,25/7) com nascimento 15/04/1955 e início 14/10/2026', 'W0=' + w0 + ' obs=' + W0, Math.abs(w0 - W0), w0 === W0);

const nMes = Math.max(...rot) + 1;
// ---------- agregação mensal do observado (última semana do mês-ciclo; fluxos somados) ----------
const M = Array.from({ length: nMes }, () => ({ f: {}, nw: 0, last: -1 }));
for (let i = w0 - 6; i < NW; i++) { const k = rot[i]; if (k < 0) continue; M[k].nw++; M[k].last = i; for (const c in weeks[i].f) M[k].f[c] = (M[k].f[c] || 0) + weeks[i].f[c]; }
// o harness só emite meses com w1 > W0; confere com o extrato gravado
{ let mx = 0, n = 0; extr.meses.forEach(e => { const k = e.mi; const w = weeks[M[k].last]; ['fin', 'cofre', 'bens', 'part', 'div'].forEach(c => { mx = Math.max(mx, Math.abs(w[c] - e.fim[c])); }); e.fim.obj.forEach((v, j) => { mx = Math.max(mx, Math.abs(v - w.obj[j])); }); n++; });
  chk('0.3', 'Extrato gravado = nova execução do motor', 'fin/cofre/bens/part/div/obj de cada mês', n + ' meses', mx, mx < 1e-6); }
const g = (k, c) => M[k].f[c] || 0;
const patr = k => { const w = weeks[M[k].last]; return w.fin + w.bens + w.part + w.prev - w.div; };

// ============ A. CONTABILIDADE GERAL ============
// A1 patrimônio = fin + bens + part + prev - div; fin = cofre + soma(caixinhas); sem NaN
{ let mx = 0, nan = 0, neg = 0, n = 0;
  for (let k = 0; k < nMes; k++) { const w = weeks[M[k].last]; const soma = w.cofre + w.obj.reduce((a, b) => a + b, 0); mx = Math.max(mx, Math.abs(soma - w.fin)); n++;
    [w.fin, w.cofre, w.bens, w.part, w.prev, w.div, ...w.obj].forEach(v => { if (!Number.isFinite(v)) nan++; });
    if (w.cofre < -0.005 || w.obj.some(v => v < -0.005) || w.part < 0 || w.bens < 0 || w.div < 0) neg++; }
  chk('A.1', 'fin = cofre + caixinhas; patrimônio = fin+bens+part+prev−div; sem NaN, sem sinal indevido', 'soma recalculada × fim.fin', n + ' meses', mx, mx < 1e-6 && nan === 0 && neg === 0, 'NaN=' + nan + ' negativos=' + neg); }
// A2 conservação semana a semana: cofre_i = cofre_{i-1}·GW(se >0) + mov_cofre_i ; obj_k,i = obj_k,i-1·(1+tx)^EXP + mov_obj_k,i
const OBJS = plano.objectives;
const baseTaxa = o => o.rateM != null && o.rateM !== '' ? +o.rateM : PERFIL[o.profile];
const taxaEsp = (o, mi) => { const b = baseTaxa(o), c = Math.min(b, PERFIL.conservador); return mi >= Math.round(o.months) - 24 ? c : b; };   // últimos 24 meses: min(base, conservadora); o resto: base
let errCofre = 0, errObj = OBJS.map(() => 0), rendFin = new Array(NW).fill(0), nSem = 0;
{ for (let i = w0 + 1; i < NW; i++) {
    const a = weeks[i - 1], b = weeks[i], f = b.f || {}; nSem++;
    const rl = Math.max(0, rot[i - 1]);
    const crescCofre = a.cofre > 0 ? a.cofre * (GWk - 1) : 0;
    const esperadoCofre = a.cofre + crescCofre + (f.mov_cofre || 0);
    errCofre = Math.max(errCofre, Math.abs(esperadoCofre - b.cofre));
    let rend = crescCofre;
    OBJS.forEach((o, j) => { const tx = taxaEsp(o, rl), cresc = a.obj[j] * (Math.pow(1 + tx, EXP) - 1); rend += cresc;
      const e = a.obj[j] + cresc + (f['mov_obj_' + o.id] || 0); errObj[j] = Math.max(errObj[j], Math.abs(e - b.obj[j])); });
    rendFin[i] = rend; }
  chk('A.2', 'Conservação do caixa: cofre_i = cofre_i−1·(1+0,4%)^(7/30,4375) + mov_cofre_i', 'identidade semanal', nSem + ' semanas', errCofre, errCofre < 0.01);
  OBJS.forEach((o, j) => chk('D.1.' + o.id, 'Caixinha "' + o.name + '": saldo_i = saldo_i−1·(1+taxa esperada do mês)^(7/30,4375) + aportes observados', 'identidade semanal, taxa esperada por perfil/rateM e regra dos 24 meses', nSem + ' semanas', errObj[j], errObj[j] < 0.01)); }
// A3 identidade mensal da riqueza: ΔW = (entradas − saídas) + rendimento + valorização; transferências somam zero
{ let mx = 0, mxT = 0, n = 0;
  for (let k = 1; k < nMes; k++) {
    const f = M[k].f; let ent = 0, sai = 0, mov = 0; for (const c in f) { if (c.startsWith('in_')) ent += f[c]; else if (c.startsWith('out_')) sai += f[c]; }
    for (const c in f) if (c === 'mov_cofre' || c === 'mov_bens' || c.startsWith('mov_obj_')) mov += f[c];
    mxT = Math.max(mxT, Math.abs(mov - (ent - sai)));          // transferências internas somam zero: Σmov = entradas − saídas
    let rend = 0; for (let i = w0 + 1; i < NW; i++) if (rot[i] === k) rend += rendFin[i];
    const wa = weeks[M[k - 1].last], wb = weeks[M[k].last];
    const valor = (wb.bens - wa.bens) + (wb.part - wa.part) - (f.mov_bens || 0);   // bens/participações: mudança de valor não explicada por transferência
    const dW = patr(k) - patr(k - 1);
    mx = Math.max(mx, Math.abs(dW - (ent - sai + rend + valor))); n++; }
  chk('A.3', 'Σ transferências (cofre+caixinhas+bens) = entradas − saídas (nada criado nem perdido)', 'soma dos mov_* do mês × (in_ − out_)', (nMes - 1) + ' meses', mxT, mxT < 0.01);
  chk('A.4', 'ΔPatrimônio do mês = entradas − saídas + rendimento recalculado + valorização de bens/participações', 'identidade mensal, rendimento recalculado semana a semana', n + ' meses', mx, mx < 0.01); }

// ============ B. PARTICIPAÇÃO (Pão Nobre) e BENS ============
const part = plano.patrimonio.participacoes[0], vd = part.venda;
const vPart = mi => mi >= vd.em ? 0 : part.valor * Math.pow(vd.preco / part.valor, mi / vd.em);        // ritmo geométrico até o preço de venda
{ let mx = 0, n = 0, mxDet = 0;
  for (let k = 0; k < nMes; k++) { const w = weeks[M[k].last]; const e = vPart(k); mx = Math.max(mx, Math.abs(w.part - e)); mxDet = Math.max(mxDet, Math.abs(w.det.parts[0] - e)); n++; }
  chk('B.1', 'Valor da participação mês a mês: 500.000·1,3^(mi/18) até o mês 17; zero depois da venda', 'fórmula fechada × fim.part e fim.det.parts[0]', n + ' meses (0..' + (nMes - 1) + ')', Math.max(mx, mxDet), Math.max(mx, mxDet) < 0.01, 'mês 9: esp ' + (500000 * Math.sqrt(1.3)).toFixed(2) + ' obs ' + weeks[M[9].last].part.toFixed(2)); }
{ // série completa do harness (parts[].serie) vs fórmula
  const sr = extr.parts[0].serie; let mx = 0; for (let m = 0; m < sr.length; m++) mx = Math.max(mx, Math.abs(sr[m] - (m >= vd.em ? vd.preco : vPart(m))));
  chk('B.2', 'parts[0].serie (trajetória) = fórmula, inclusive valor 650.000 no mês da venda', '19 pontos (0..18)', sr.length + ' pontos', mx, mx < 0.01);
  const v = extr.parts[0].venda; const cust = 650000 * 0.03, liq = 650000 - cust;
  const mxv = Math.max(Math.abs(v.preco - 650000), Math.abs(v.custo - cust), Math.abs(v.liquido - liq), Math.abs(v.mi - 18), Math.abs(v.quitacao));
  chk('B.3', 'Venda: preço 650.000; corretagem 3% = 19.500; líquido 630.500; mês 18 (abr/2028); quitação 0', 'cálculo direto × parts[0].venda', '1 venda', mxv, mxv < 0.01); }
{ const k = 18, f = M[k].f, w17 = weeks[M[17].last], w18 = weeks[M[18].last];
  const e = { vendap: 19500, movBens: -650000, movObjAd: 300000 };
  const er = [Math.abs((f.out_vendap_0 || 0) - e.vendap), Math.abs((f.mov_bens || 0) - e.movBens), Math.abs((f.mov_obj_adaptacao || 0) - e.movObjAd)];
  // cofre do mês 18: variação = entradas − saídas + 650.000 − 300.000 (+ rendimento). Conferência da parte determinística:
  chk('B.4', 'Mês 18: custos 19.500 saem; 650.000 saem de participações→caixa; 300.000 do líquido vão à caixinha da adaptação; 330.500 ficam no caixa livre', 'fluxo do mês 18 × esperado', '1 mês', Math.max(...er), Math.max(...er) < 0.01, 'out_vendap=' + fmt(f.out_vendap_0) + ' mov_bens=' + fmt(f.mov_bens) + ' mov_obj_adaptacao=' + fmt(f.mov_obj_adaptacao));
  const sobraCaixa = 650000 - 19500 - 300000; // 330.500
  const ent = Object.keys(f).filter(c => c.startsWith('in_')).reduce((a, c) => a + f[c], 0), sai = Object.keys(f).filter(c => c.startsWith('out_')).reduce((a, c) => a + f[c], 0);
  const movCofreEsp = ent - sai + 650000 - 300000;   // mov_cofre = (in − out) + 650.000 (venda) − 300.000 (destino na caixinha)
  chk('B.5', 'mov_cofre do mês 18 = (entradas − saídas) + 650.000 − 300.000', 'identidade', '1 mês', Math.abs((f.mov_cofre || 0) - movCofreEsp), Math.abs((f.mov_cofre || 0) - movCofreEsp) < 0.01, 'sobra livre do líquido: ' + sobraCaixa);
  chk('B.6', 'Depois da venda a participação é zero e não há mais renda ligada', 'part e det.parts nos meses 18..342; linhas in_* ligadas à padaria', '325 meses', Math.max(...Array.from({ length: nMes - 18 }, (_, j) => weeks[M[18 + j].last].part)), Array.from({ length: nMes - 18 }, (_, j) => weeks[M[18 + j].last].part).every(v => v === 0), 'o plano não tem renda/pró-labore ligado à padaria (nenhum "renda" na participação)'); }
// bens
{ const sitio = mi => 900000 * Math.pow(1.02, mi / 12);
  let mx = 0; for (let k = 0; k < nMes; k++) { const w = weeks[M[k].last]; const e = [1800000, 750000, sitio(k)]; w.det.bens.forEach((v, j) => { mx = Math.max(mx, Math.abs(v - e[j])); }); mx = Math.max(mx, Math.abs(w.bens - (e[0] + e[1] + e[2]))); }
  chk('B.7', 'Bens: casa 1.800.000 e apto 750.000 constantes; sítio 900.000·1,02^(mi/12) (2% a.a. composto mensalmente)', 'fórmula × fim.det.bens e fim.bens', nMes + ' meses', mx, mx < 0.01, 'sítio em 10 anos (mi=120): esp ' + sitio(120).toFixed(2) + ' obs ' + weeks[M[120].last].det.bens[2].toFixed(2) + ' (cenário diz 1.097.095)'); }

// ============ C. DÍVIDAS ============
{ const ds = []; extr.dividas.forEach(d => d.saldo.forEach(v => ds.push(Math.abs(v)))); extr.dividasAvulsas.forEach(d => d.saldo.forEach(v => ds.push(Math.abs(v))));
  let divObs = 0, fl = 0; for (let k = 0; k < nMes; k++) { const w = weeks[M[k].last]; divObs = Math.max(divObs, Math.abs(w.div), ...w.det.divs.map(Math.abs), w.cheque); for (const c in M[k].f) if (/juros|quita|credito|compra|parcela|fin_/.test(c) || c.startsWith('out_fix_') && !['out_fix_saude', 'out_fix_cuidadora', 'out_fix_contas', 'out_fix_gustavo'].includes(c)) fl++; }
  chk('C.1', 'Controle: plano sem dívidas ⇒ saldo devedor, parcela, juros, IOF, crédito novo e cheque devem ser zero', 'plano.patrimonio.dividas=[]; bens com saldoDevedor 0; varredura de div, det.divs, cheque e de linhas de juros/quitação/crédito', nMes + ' meses; ' + extr.dividas.length + ' bens', Math.max(divObs, ...ds), divObs === 0 && Math.max(0, ...ds) === 0 && fl === 0, 'linhas de dívida nos fluxos: ' + fl); }
{ // nunca entrou em dívida por falta de caixa
  let minCofre = Infinity, minFin = Infinity; for (let i = w0; i < NW; i++) { minCofre = Math.min(minCofre, weeks[i].cofre); minFin = Math.min(minFin, weeks[i].fin); }
  chk('C.2', 'Caixa nunca negativo (sem "dívida de falta de caixa" nem juros de 4% a.m.); ruina=null', 'mínimo de cofre e fin em todas as semanas', (NW - w0) + ' semanas', Math.min(0, minCofre), minCofre >= -0.005 && S.ruina == null, 'mín. cofre=' + minCofre.toFixed(2) + ' mín. fin=' + minFin.toFixed(2)); }

// ============ D. CAIXINHAS ============
const CAIX = {};
OBJS.forEach((o, j) => {
  const t = Math.round(o.months) - 24;                  // primeiro mês conservador
  // taxa efetiva semanal implícita no observado, para achar o mês exato da troca
  let primeira = null, outras = []; let prev = null;
  for (let i = w0 + 1; i < NW && rot[i] <= o.months; i++) { const a = weeks[i - 1].obj[j], b = weeks[i].obj[j], mov = (weeks[i].f['mov_obj_' + o.id] || 0); if (a > 1) { const imp = Math.pow((b - mov) / a, 1 / EXP) - 1; const r = Math.round(imp * 1e6) / 1e6; if (prev !== null && r !== prev) outras.push({ semana: i, mi: rot[i], data: diaDe(i) && diaDe(i).toISOString().slice(0, 10), de: prev, para: r }); prev = r; } }
  CAIX[o.id] = { trocas: outras, taxaMesesEsperada: Array.from({ length: Math.round(o.months) }, (_, mi) => taxaEsp(o, mi)) };
  const tp = extr.objetivos[j].taxaPorMes; let mxT = 0; for (let mi = 0; mi < tp.length; mi++) mxT = Math.max(mxT, Math.abs(tp[mi] - taxaEsp(o, mi)));
  chk('D.2.' + o.id, 'taxaPorMes de "' + o.name + '" = taxa esperada (base ' + (o.rateM != null ? 'rateM ' + o.rateM : o.profile + ' ' + PERFIL[o.profile]) + '; últimos 24 meses: min(base, 0,4%))', 'taxaPorMes[mi] × regra, meses 0..' + (tp.length - 1), tp.length + ' meses', mxT, mxT < 1e-12, 'troca teórica no mês ' + (t > 0 ? t : '— (já conservador desde o mês 0)')); });
// saque na data e saldo na data
OBJS.forEach((o, j) => {
  const k = Math.round(o.months); const f = M[k].f; const wprev = weeks[M[k - 1].last];
  const sacado = -(f['mov_obj_' + o.id] || 0);
  const crescido = (() => { // saldo no fim do mês k−1 + crescimento das semanas que faltam até a semana de salário do mês k (início dela)
    let s = wprev.obj[j]; for (let i = M[k - 1].last + 1; i <= M[k - 1].last + 1; i++) s = s * Math.pow(1 + taxaEsp(o, rot[i - 1]), EXP); return s; })();
  const consumo = f['out_obj_' + o.id] || 0;
  chk('D.3.' + o.id, 'Saque na data (mês ' + k + '): saldo da caixinha volta ao caixa e o gasto de ' + o.amount.toLocaleString('pt-BR') + ' sai do caixa', 'mov_obj no mês da data × saldo recalculado; out_obj = valor', '1 mês', Math.max(Math.abs(sacado - crescido), Math.abs(consumo - o.amount)), Math.max(Math.abs(sacado - crescido), Math.abs(consumo - o.amount)) < 0.01, 'sacado ' + sacado.toFixed(2) + ' (esp ' + crescido.toFixed(2) + '); depois da data a caixinha = ' + weeks[M[k].last].obj[j].toFixed(2)); });

// recálculo independente do saldo na data, semana a semana, com os mesmos aportes observados. Convenção do dia de hoje: o
// patrimônio separado hoje entra ANTES do rendimento da semana W0 (rende já nela); os aportes entram depois do rendimento.
const ded0 = o => (o.dedicadoEm ? 0 : +o.dedicated || 0);
const reconst = (o, j, fx, semLagSemana) => { let s = 0; const k = Math.round(o.months);
  for (let i = w0; i < NW && rot[i] <= k; i++) {
    const mv = (weeks[i].f['mov_obj_' + o.id] || 0);
    const lab = semLagSemana ? rot[i] : rot[i - 1];
    if (rot[i] === k && mv < 0) { s = s * Math.pow(1 + fx(lab), EXP); return s; }
    const antes = i === w0 ? ded0(o) : 0;
    s = (s + antes) * Math.pow(1 + fx(i === w0 ? 0 : lab), EXP) + (mv - antes); }
  return s; };
OBJS.forEach((o, j) => { const b = baseTaxa(o), c = PERFIL.conservador;
  const r = { esperada: reconst(o, j, mi => taxaEsp(o, mi)), sobBase: reconst(o, j, () => b), sobCons: reconst(o, j, () => Math.min(b, c)), semLag: reconst(o, j, mi => taxaEsp(o, mi), true) };
  CAIX[o.id].saldoNaData = { esperada: r.esperada, soBase: r.sobBase, soConservadora: r.sobCons, trocaSemDefasagemDeUmaSemana: r.semLag, observado: extr.objetivos[j].real };
  chk('D.4.' + o.id, 'Saldo da caixinha "' + o.name + '" na data = recálculo com a taxa esperada', 'recursão semanal independente × objetivos[].real', '1 data', Math.abs(r.esperada - extr.objetivos[j].real), Math.abs(r.esperada - extr.objetivos[j].real) < 0.01, 'só base=' + r.sobBase.toFixed(2) + ' | só conservadora=' + r.sobCons.toFixed(2) + ' | esperada=' + r.esperada.toFixed(2) + ' | troca sem a defasagem de 1 semana=' + r.semLag.toFixed(2)); });

// Regra de aporte: aportes observados por mês
const aportes = {}; OBJS.forEach(o => { aportes[o.id] = []; for (let k = 0; k < nMes; k++) { const v = g(k, 'mov_obj_' + o.id); if (Math.abs(v) > 0.005) aportes[o.id].push([k, +v.toFixed(2)]); } });

// ============ E. RENDIMENTO ============
{ // taxa implícita do caixa livre, semana a semana (quando não há lançamento relevante no cofre)
  let mx = 0, n = 0; for (let i = w0 + 1; i < NW; i++) { const a = weeks[i - 1].cofre; if (a <= 0) continue; const f = weeks[i].f; const imp = (weeks[i].cofre - (f.mov_cofre || 0)) / a; mx = Math.max(mx, Math.abs(imp - GWk)); n++; }
  chk('E.1', 'Rendimento do caixa livre = 0,4% a.m. real, composto semanalmente (fator 1,004^(7/30,4375) = ' + GWk.toFixed(9) + ') sobre o saldo de abertura da semana', 'fator implícito de cada semana × fator esperado', n + ' semanas', mx, mx < 1e-12);
  let somaAno = 1; let nSem2 = 0; for (let i = w0; i < w0 + 52; i++) { somaAno *= GWk; nSem2++; }
  CAIX.rendAnual = { fator52sem: somaAno, fator12meses: Math.pow(1.004, 12) }; }

// ============ F. FLUXO ============
const pas = k => (k < 282 ? 9400 + 6200 : 3720) + 4100;               // INSS J + fundo J (até o mês 281) ; reversão 60% da Marta (3.720) a partir do 282; INSS da Marta sempre
const alug = 4500;
{ let mx = 0, n = 0, mxIn = 0; const lin = {};
  for (let k = 1; k < nMes; k++) { const f = M[k].f; const ent = (f.in_pas_0 || 0) + (f.in_pas_1 || 0) + (f.in_pas_2 || 0) + (f.in_pas_3 || 0) + (f.in_aluguel || 0); mxIn = Math.max(mxIn, Math.abs(ent - (pas(k) + alug))); n++; }
  chk('F.1', 'Entradas do mês = INSS 9.400 + fundo 6.200 + INSS Marta 4.100 + aluguel 4.500 (24.200); a partir do mês 282 (95 anos do Jorge): 4.100 + 3.720 + 4.500 (12.320)', 'soma in_* × plano.passive/incomes', n + ' meses', mxIn, mxIn < 0.01, 'mês 281: ' + (pas(281) + alug) + ', mês 282: ' + (pas(282) + alug)); }
// F.2 mês de cada pagamento do Gustavo
{ const mesesGust = []; for (let k = 0; k < nMes; k++) if (g(k, 'out_fix_gustavo') > 0) mesesGust.push(k);
  const esp = [6, 18, 30, 42, 54];
  chk('F.2', 'Ajuda ao Gustavo: pagamentos nos meses de abril 2027..2031 (6, 18, 30, 42, 54), nenhum depois', 'meses com out_fix_gustavo > 0', '343 meses', mesesGust.length === 5 ? Math.max(...mesesGust.map((m, j) => Math.abs(m - esp[j]))) : 99, JSON.stringify(mesesGust) === JSON.stringify(esp), 'meses=' + JSON.stringify(mesesGust) + ' valores=' + mesesGust.map(m => g(m, 'out_fix_gustavo').toFixed(2)).join('/')); }
// F.3 despesas do mês: planejado (17.000 + 24.000 em abril) × lançado; fator de escala
const planej = k => 17000 + ([6, 18, 30, 42, 54].includes(k) ? 24000 : 0);
const ESC = {};
{ let linhas = ['out_fix_saude', 'out_fix_cuidadora', 'out_fix_contas', 'out_adj_alimentacao', 'out_adj_lazer', 'out_adj_transporte'];
  const base = { out_fix_saude: 6200, out_fix_cuidadora: 3500, out_fix_contas: 2100, out_adj_alimentacao: 2800, out_adj_lazer: 1400, out_adj_transporte: 1000 };
  let mxEq = 0, mxSai = 0; const esc = [];
  for (let k = 1; k < nMes; k++) { const f = M[k].f; const sai = linhas.reduce((a, c) => a + (f[c] || 0), 0) + (f.out_fix_gustavo || 0);
    const ent = Object.keys(f).filter(c => c.startsWith('in_')).reduce((a, c) => a + f[c], 0);
    const rec = base.out_fix_saude ? (f.out_fix_saude || 0) / 6200 : 0; esc.push(rec);
    // fator de escala ESPERADO pela regra do motor: (renda disponível + saque) / custo de vida mensalizado (17.000 + 2.000 enquanto há ajuda ao Gustavo)
    const vida = 17000 + (k >= 6 && k <= 54 ? 2000 : 0); const saque = Math.max(0, 20000 - (pas(k) + alug)); const esp = (pas(k) + alug + saque) / vida;
    mxEq = Math.max(mxEq, Math.abs(rec - esp));
    mxSai = Math.max(mxSai, Math.abs((f.out_fix_saude || 0) - 6200 * esp));
    ['out_fix_saude', 'out_fix_cuidadora', 'out_fix_contas', 'out_adj_alimentacao', 'out_adj_lazer', 'out_adj_transporte'].forEach(c => { mxSai = Math.max(mxSai, Math.abs((f[c] || 0) - base[c] * esp)); }); }
  ESC.fatores = { mes1: M[1].f.out_fix_saude / 6200, mes6: M[6].f.out_fix_saude / 6200, mes100: M[100].f.out_fix_saude / 6200, mes282: M[282].f.out_fix_saude / 6200 };
  chk('F.3', 'Despesas lançadas = valor do plano × fator de escala (renda disponível + saque) / custo de vida mensalizado [regra do motor para depois da liberdade]', 'cada linha out_* × (base · fator esperado)', (nMes - 1) + ' meses × 6 linhas', mxSai, mxSai < 0.01, 'fatores: mês 1 ' + ESC.fatores.mes1.toFixed(4) + ' (=24.200/17.000), meses 6-54 ' + ESC.fatores.mes6.toFixed(4) + ' (=24.200/19.000), mês 282+ ' + ESC.fatores.mes282.toFixed(4) + ' (=20.000/17.000)'); }
// F.4 desvio entre despesa lançada e a declarada pelo cliente
{ let somaPlan = 0, somaObs = 0, somaDes = 0, maiorMes = 0; const porAno = [];
  for (let k = 1; k < nMes; k++) { const f = M[k].f; const sai = Object.keys(f).filter(c => c.startsWith('out_fix_') || c.startsWith('out_adj_')).reduce((a, c) => a + f[c], 0); somaPlan += planej(k); somaObs += sai; somaDes += Math.min(sai, 0) ; }
  const dentro = (a, b) => { let p = 0, o = 0; for (let k = a; k <= b; k++) { const f = M[k].f; p += planej(k); o += Object.keys(f).filter(c => c.startsWith('out_fix_') || c.startsWith('out_adj_')).reduce((s, c) => s + f[c], 0); } return { plan: p, obs: o, dif: o - p }; };
  ESC.somas = { total: { plan: somaPlan, obs: somaObs, dif: somaObs - somaPlan }, m1_281: dentro(1, 281), m282_342: dentro(282, 342), m1_54: dentro(1, 54) };
  chk('F.4', 'Despesa lançada × despesa declarada pelo cliente (R$ 17.000/mês + 24.000 em abril)', 'soma das saídas mensais do fluxo × plano', (nMes - 1) + ' meses', Math.abs(ESC.somas.m1_281.dif), false, 'meses 1-281: plano ' + ESC.somas.m1_281.plan.toFixed(0) + ' × lançado ' + ESC.somas.m1_281.obs.toFixed(0) + ' (dif ' + ESC.somas.m1_281.dif.toFixed(0) + '); meses 282-342: dif ' + ESC.somas.m282_342.dif.toFixed(0)); }
// F.5 meses de borda: dezembro, mês 0, mês 5 (bodas), 18 (venda), 30 (adaptação), 60 (netos), 282 (aposentadoria Jorge)
const bordas = [0, 1, 5, 6, 18, 30, 36, 60, 281, 282, 342].map(k => ({ k, ent: Object.keys(M[k].f).filter(c => c.startsWith('in_')).reduce((a, c) => a + M[k].f[c], 0), sai: Object.keys(M[k].f).filter(c => c.startsWith('out_')).reduce((a, c) => a + M[k].f[c], 0), nw: M[k].nw }));

// ============ G. LIBERDADE / RUÍNA ============
const ffInfo = { ...S.ff }; delete ffInfo.finBefore;
{ let mx = 0, cum = 0; const gust = [6, 18, 30, 42, 54]; const dGust = 24000 * (24200 / 19000), dMes = 17000 * (24200 / 19000);
  for (let k = 1; k < 282; k++) { const f = M[k].f; const ent = Object.keys(f).filter(c => c.startsWith('in_')).reduce((a, c) => a + f[c], 0); const sai = Object.keys(f).filter(c => c.startsWith('out_fix_') || c.startsWith('out_adj_')).reduce((a, c) => a + f[c], 0);
    const esp = k < 6 || k > 54 ? 0 : gust.includes(k) ? 24200 - dMes - dGust : 24200 - dMes; mx = Math.max(mx, Math.abs((ent - sai) - esp)); cum += ent - sai; }
  ESC.sobraNunca = { acumuladaMeses1a281: cum };
  chk('G.1', 'Meses 1-281: sobra mensal lançada = 0 (gasta tudo o que entra); nos meses 6-54 a despesa é 17.000·1,2737 e a ajuda 30.568 em abril (sobra +2.547 nos outros meses, −28.021 em abril); o fluxo acumulado fecha em −28.021 (a 5ª ajuda não é recomposta)', 'ent − sai de cada mês × padrão esperado da regra de escala', '281 meses', mx, mx < 0.01, 'acumulado meses 1-281: ' + cum.toFixed(2) + ' (comportamento por desenho: escala da despesa; ver §5)'); }
{ const horizon = nMes; let desc = 0; chk('G.2', 'Liberdade em mês 1 (hoje já livre): ff.mi=1, forced=false, ruína nula, retirada só quando renda < 20.000', 'S.ff, S.ruina', '1', S.ff.mi - 1, S.ff.mi === 1 && S.ff.forced === false && S.ruina == null, 'maxGap=' + S.ff.maxGap + ' (esperado 20.000 − 12.320 = 7.680)'); }
// saque (w): retiradas do financeiro depois do mês 282
{ const sq = []; for (let k = 282; k < nMes; k++) { const f = M[k].f; const ent = Object.keys(f).filter(c => c.startsWith('in_')).reduce((a, c) => a + f[c], 0); const sai = Object.keys(f).filter(c => c.startsWith('out_fix_') || c.startsWith('out_adj_')).reduce((a, c) => a + f[c], 0); sq.push(sai - ent); }
  const mx = Math.max(...sq.map(v => Math.abs(v - 7680)));
  chk('G.3', 'Do mês 282 em diante o financeiro cobre a diferença de 7.680/mês (20.000 desejados − 12.320 de renda), e só ela', 'saídas − entradas por mês', (nMes - 282) + ' meses', mx, mx < 0.01); }

// ============ H. FIDELIDADE ============
const obj = extr.objetivos;
const H_ = {
  bodas: { saldoEsp: 30000 * Math.pow(1.004, 5), aporteEsp: (40000 - 30000 * Math.pow(1.004, 5)) / ((Math.pow(1.004, 5) - 1) / 0.004) },
  adapt: { esp: 300000 * Math.pow(1.004, 12), espCenario: 300000 * Math.pow(1.005, 6) * Math.pow(1.004, 6) },
  netos: (() => { const a = 100000 * Math.pow(1.007, 36) * Math.pow(1.004, 24); const fac = (Math.pow(1.007, 36) - 1) / 0.007 * Math.pow(1.004, 24) + (Math.pow(1.004, 24) - 1) / 0.004; return { saldoEsp: a, aporteEsp: (200000 - a) / fac, fac }; })() };

// ============ EXTRAS: convenção do dia de hoje, valorização no mês da venda, fluxos finitos, perfis ============
{ const w = weeks[w0]; const sep = OBJS.reduce((a, o) => a + ded0(o), 0); const cofreAbre = 2600000 - sep;
  const esp = cofreAbre * GWk + ((w.f.mov_cofre || 0) + sep);   // abre com 2,6 mi, separa 130 mil, rende a semana, depois os lançamentos da semana
  chk('E.2', 'Convenção do dia 0: o saldo declarado hoje (2.600.000 − 130.000 separados) já rende a semana W0 (início dela: ' + E.weekDate(w0).toISOString().slice(0, 10) + ', 2 dias depois de hoje)', 'cofre da semana W0 = (2.600.000 − 130.000)·fator semanal + demais lançamentos', '1 semana', Math.abs(w.cofre - esp), Math.abs(w.cofre - esp) < 0.01, 'rendimento creditado já na semana de hoje: R$ ' + (cofreAbre * (GWk - 1)).toFixed(2) + ' (convenção: ≤ 1 semana de rendimento, 0,09%)'); }
{ let bad = 0, neg = 0; for (let i = w0; i < NW; i++) { const f = weeks[i].f; for (const c in f) { if (!Number.isFinite(f[c])) bad++; if ((c.startsWith('in_') || c.startsWith('out_')) && f[c] < -1e-9) neg++; } }
  chk('A.5', 'Fluxos: todos os lançamentos finitos; in_*/out_* nunca negativos', 'varredura de weeks[i].f', (NW - w0) + ' semanas', bad + neg, bad + neg === 0); }
{ const e = vPart(17), v = 650000 - e, esp = e * (Math.pow(1.3, 1 / 18) - 1) + (900000 * Math.pow(1.02, 18 / 12) - 900000 * Math.pow(1.02, 17 / 12));
  const f = M[18].f, wa = weeks[M[17].last], wb = weeks[M[18].last];
  const valObs = (wb.part - wa.part) - (f.mov_bens || 0) + (wb.bens - wa.bens);
  chk('B.8', 'Mês da venda: o ganho do mês (650.000 − valor do mês 17) é reconhecido na própria venda, e o sítio valoriza normalmente', 'Δpart − mov_bens + Δbens × (ganho da participação + valorização do sítio)', '1 mês', Math.abs(valObs - (v + (900000 * Math.pow(1.02, 18 / 12) - 900000 * Math.pow(1.02, 17 / 12)))), Math.abs(valObs - (v + (900000 * Math.pow(1.02, 18 / 12) - 900000 * Math.pow(1.02, 17 / 12)))) < 0.01, 'valor da participação no mês 17 = ' + e.toFixed(2) + '; ganho reconhecido na venda = ' + v.toFixed(2)); }
chk('E.3', 'PROFILES do motor = conservador 0,4% / moderado 0,5% / agressivo 0,6% a.m.; R_M = 0,4%', 'extrato.PROFILES, extrato.R_M', '4 valores', Math.max(Math.abs(extr.PROFILES.conservador - .004), Math.abs(extr.PROFILES.moderado - .005), Math.abs(extr.PROFILES.agressivo - .006), Math.abs(extr.R_M - .004)), extr.PROFILES.conservador === .004 && extr.PROFILES.moderado === .005 && extr.PROFILES.agressivo === .006 && extr.R_M === .004);
{ let w18 = null, w30 = null; for (let i = w0 + 1; i < NW; i++) { if (rot[i] === 18 && w18 === null && rot[i - 1] === 17) w18 = i; if (rot[i] === 30 && w30 === null && rot[i - 1] === 29) w30 = i; }
  const nsem = w30 - w18; const esp = 300000 * Math.pow(1.004, nsem * EXP);
  CAIX.calendario = { semanasMes18a30: nsem, mesesEquivalentes: nsem * EXP, saldoNaData: esp };
  chk('D.5', 'Adaptação: 300.000·1,004^(semanas·7/30,4375) entre as semanas de salário dos meses 18 e 30 = saldo observado (a diferença para 314.721 da fórmula mensal é só de calendário)', 'semanas entre os dois ciclos × fator semanal', nsem + ' semanas (= ' + (nsem * EXP).toFixed(3) + ' meses)', Math.abs(esp - extr.objetivos[1].real), Math.abs(esp - extr.objetivos[1].real) < 0.01, 'fórmula mensal 300.000·1,004^12 = ' + (300000 * Math.pow(1.004, 12)).toFixed(2) + '; diferença ' + (300000 * Math.pow(1.004, 12) - extr.objetivos[1].real).toFixed(2)); }

// ---------- contrafactual: o patrimônio financeiro com outra política de gasto (modelo mensal próprio, 0,4% a.m.) ----------
const finMes = gasto => { let fin = weeks[M[0].last].fin; const t = [fin];
  for (let k = 1; k < nMes; k++) { fin *= 1 + R_M; fin += pas(k) + alug - gasto(k); if (k === 5) fin -= 40000; if (k === 18) fin += 630500; if (k === 30) fin -= 300000; if (k === 60) fin -= 200000; t.push(fin); }
  return t; };
const gMotor = k => k < 282 ? pas(k) + alug : 20000;                                    // reproduz o motor: gasta tudo o que entra; depois, 20.000
const gDeclarado = k => planej(k);                                                     // 17.000/mês (+24.000 em abril) o tempo todo
const gDesejado = k => 20000 + ([6, 18, 30, 42, 54].includes(k) ? 24000 : 0);          // 20.000 desejados (+ ajuda ao Gustavo)
const tMotor = finMes(gMotor), tDecl = finMes(gDeclarado), tDes = finMes(gDesejado);
const obsFin = Array.from({ length: nMes }, (_, k) => weeks[M[k].last].fin);
const contra = { modeloMotor: tMotor[nMes - 1], observado: obsFin[nMes - 1], erroRelModelo: (tMotor[nMes - 1] - obsFin[nMes - 1]) / obsFin[nMes - 1],
  declarado: tDecl[nMes - 1], desejado20k: tDes[nMes - 1],
  finMes120: { motor: obsFin[120], declarado: tDecl[120], desejado: tDes[120] }, finMes282: { motor: obsFin[282], declarado: tDecl[282], desejado: tDes[282] } };

// ============ P. SONDAS DE ESTRESSE (dívidas): o cenário não tem dívida; testa-se o motor com contratos sintéticos ============
const sondas = [];
{ const mk = (nome, extra) => Object.assign({ nome, saldoDevedor: 0, credito: 100000, parcelas: 60, juros: 12, sistema: 'price', iof: 'isento', inicio: '2026-10' }, extra);
  const pmtF = (pv, i, n) => pv * i / (1 - Math.pow(1 + i, -n));
  const tabela = (F, i, n, sac, am) => { const out = []; let bal = F, pm = pmtF(F, i, n), a0 = F / n; for (let k = 0; k < n && bal > 0.005; k++) { const j = bal * i, am_ = Math.min(bal, sac ? a0 : pm - j); bal -= am_; const x = am && am[k]; let ex = 0; if (x && bal > 0) { ex = Math.min(bal, x.valor); bal -= ex; const r = n - k - 1; if (x.modo === 'parcela' && bal > 0 && r > 0) { pm = pmtF(bal, i, r); a0 = bal / r; } } out.push({ j, a: am_, ex, pay: j + am_, saldo: bal }); } return out; };
  const i12 = a => Math.pow(1 + a / 100, 1 / 12) - 1;
  const casos = [
    { d: mk('Price isento 12% a.a., 60 parcelas'), F: 100000, sac: false },
    { d: mk('SAC isento 12% a.a., 60 parcelas', { sistema: 'sac' }), F: 100000, sac: true },
    { d: mk('Price isento, amortização de 20.000 no mês 12 (reduz o prazo)', { amortizacoes: [{ em: 12, valor: 20000, modo: 'prazo' }] }), F: 100000, sac: false, am: { 12: { valor: 20000, modo: 'prazo' } } },
    { d: mk('SAC isento, amortização de 15.000 no mês 6 (reduz a parcela)', { sistema: 'sac', amortizacoes: [{ em: 6, valor: 15000, modo: 'parcela' }] }), F: 100000, sac: true, am: { 6: { valor: 15000, modo: 'parcela' } } } ];
  casos.forEach(c => { c.d.saldoDevedor = c.F; });
  const P2 = JSON.parse(JSON.stringify(plano)); P2.patrimonio.dividas = casos.map(c => c.d);
  const E2 = H.carregar(); E2.configure(P2); E2.run('desej');
  casos.forEach((c, n) => { const i = i12(c.d.juros), T = tabela(c.F, i, 60, c.sac, c.am); let mx = 0, nn = 0;
    for (let k = 0; k <= 62; k++) { const esp = k === 0 ? c.F : k <= T.length ? T[k - 1].saldo : 0; const obs = E2.saldoDevedorEm(P2.patrimonio.dividas[n], k); mx = Math.max(mx, Math.abs(esp - obs)); nn++; }
    sondas.push({ nome: c.d.nome, meses: nn, erroSaldo: mx, parcelas: T.length, jurosTotal: T.reduce((a, x) => a + x.j, 0), quitaEmZero: E2.saldoDevedorEm(P2.patrimonio.dividas[n], T.length) === 0 }); });
  { const d = mk('Price, IOF financiado (0,38% + 0,0082%/dia sobre cada amortização, máx. 365 dias)', { iof: 'financiado' }); const i = i12(12); let F = 100000;
    for (let r = 0; r < 200; r++) { const T = tabela(F, i, 60, false); const iof = F * 0.0038 + T.reduce((a, x, k) => a + x.a * 0.000082 * Math.min(365, 30 * (k + 1)), 0); F = 100000 + iof; }
    d.saldoDevedor = F; const P3 = JSON.parse(JSON.stringify(plano)); P3.patrimonio.dividas = [d]; const E3 = H.carregar(); E3.configure(P3); E3.run('desej');
    const T = tabela(F, i, 60, false); let mx = Math.abs(E3.saldoDevedorEm(P3.patrimonio.dividas[0], 0) - F);
    for (let k = 1; k <= 60; k++) mx = Math.max(mx, Math.abs(E3.saldoDevedorEm(P3.patrimonio.dividas[0], k) - T[k - 1].saldo));
    sondas.push({ nome: d.nome + ': financiado ' + F.toFixed(2), meses: 61, erroSaldo: mx, parcelas: 60, jurosTotal: T.reduce((a, x) => a + x.j, 0), quitaEmZero: E3.saldoDevedorEm(P3.patrimonio.dividas[0], 60) === 0 }); }
}
sondas.forEach((x, n) => chk('P.' + (n + 1), 'Sonda de dívida sintética: ' + x.nome, 'tabela Price/SAC própria × saldoDevedorEm do motor; quitação em zero', x.meses + ' meses', x.erroSaldo, x.erroSaldo < 0.01 && x.quitaEmZero, 'juros totais ' + x.jurosTotal.toFixed(2)));

// ---------- saída ----------
const out = { checks, achados, CAIX, aportes, ESC, bordas, ffInfo, H_, obj: obj.map(o => ({ id: o.id, months: o.months, amount: o.amount, required: o.required, projected: o.projected, real: o.real, status: o.status })) };
// patrimônio ao longo dos meses, para o laudo
out.patrimonio = [0, 1, 6, 12, 18, 30, 60, 120, 240, 282, 300, 342].map(k => ({ k, fin: weeks[M[k].last].fin, bens: weeks[M[k].last].bens, part: weeks[M[k].last].part, pat: patr(k) }));
out.contra = contra; out.sondas = sondas;
out.finFinal = weeks[M[nMes - 1].last].fin;
if (require.main === module) {
  console.log('=== CONFERÊNCIAS ===');
  checks.forEach(c => console.log((c.ok ? 'OK  ' : 'FALHA') + ' ' + c.id + ' | ' + c.o + ' | erro máx ' + fmt(c.erro) + ' | ' + c.nota));
  console.log('\n=== CAIXINHAS (trocas de taxa detectadas, aportes, saldos) ===');
  Object.keys(CAIX).forEach(id => { if (id !== 'rendAnual') console.log(id, JSON.stringify({ trocas: CAIX[id].trocas, saldo: CAIX[id].saldoNaData })); });
  console.log('aportes', JSON.stringify(aportes));
  console.log('\n=== ESCALA / DESVIOS ===', JSON.stringify(ESC));
  console.log('\n=== BORDAS ===', JSON.stringify(bordas));
  console.log('\n=== ESPERADOS DO CENÁRIO ===', JSON.stringify(H_));
  console.log('\n=== PATRIMÔNIO ===', JSON.stringify(out.patrimonio));
  console.log('financeiro final obs', out.finFinal, '| contrafactual', JSON.stringify(contra), '| sondas', JSON.stringify(sondas));
  console.log('ff', JSON.stringify(ffInfo), 'ruina', S.ruina);
  console.log('obj', JSON.stringify(out.obj));
  if (process.argv.includes('--json')) fs.writeFileSync(path.join(__dirname, 'auditor-03.saida.json'), JSON.stringify(out, null, 1));   // opcional
}
module.exports = out;
