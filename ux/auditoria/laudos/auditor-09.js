// AUDITOR MATEMÁTICO — CENÁRIO 09 (Hélio e Vera). Reexecutável: node ux/auditoria/laudos/auditor-09.js
// Recalcula de forma independente (sem chamar trajetoriaDoBem, saldoDevedorEm, taxaDoObjetivo, contratoDaDivida...) a partir do
// PLANO e das regras do domínio financeiro. O motor entra só como "observado": o extrato (semanal e mensal) que ele produz.
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..');
const harness = require(path.join(RAIZ, 'harness.js'));
const plano = JSON.parse(fs.readFileSync(path.join(RAIZ, 'planos', 'plano-09.json'), 'utf8')).dados;
const ext = JSON.parse(fs.readFileSync(path.join(RAIZ, 'extratos', 'extrato-09.json'), 'utf8'));

// ---------- utilidades ----------
const TOL = 0.01, WPM = 7 / 30.4375;                       // semana em meses (convenção do domínio adotada pelo motor: mês = 30,4375 dias)
const RES = [];                                            // tabela de conferências
const chk = (id, o, metodo, amostra, erro, extra) => RES.push({ id, o, metodo, amostra, erro, ok: erro <= TOL, extra: extra || '' });
const f2 = v => (Math.round(v * 100) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const maxAbs = a => a.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
const out = [];
const P = (...a) => out.push(a.join(' '));

// ---------- observado: roda o motor (semanal) com o plano e guarda as semanas ----------
function rodar(pl) {
  const E = harness.carregar();
  E.configure(JSON.parse(JSON.stringify(pl)));
  const s = E.run('desej');
  return { E, s, W0: E.W0, NW: E.NW };
}
const base = rodar(plano), S = base.s, W0 = base.W0, NW = base.NW;
const sem = S.weeks;
const mesesIdx = ext.meses.map(b => b.mi);
P('# Saída do auditor-09 (observado = motor; esperado = recálculo independente)');
P('W0 =', W0, '| semanas =', NW, '| meses no extrato =', ext.meses.length);

// extrato regravado confere com o extrato salvo (o motor é determinístico)?
{
  const novo = harness.extrato({ dados: plano });
  let d = 0; novo.meses.forEach((b, k) => { d = Math.max(d, Math.abs(b.fim.fin - ext.meses[k].fim.fin)); });
  chk('0', 'extrato salvo = extrato regerado do plano', 'diferença de fim.fin em todos os meses', ext.meses.length + ' meses', d);
}

// ========== 0. CALENDÁRIO (independente) ==========
// nascimento 1964-08 (dia 1), hoje 2026-10-20: W0 = round(dias/7); mês do plano = ciclo que abre na semana que contém o dia 5.
const U = (y, m, d) => Date.UTC(y, m, d);
const NASC = U(1964, 7, 1), HOJE = U(2026, 9, 20), CM0 = 2026 * 12 + 9;
const W0e = Math.round((HOJE - NASC) / 864e5 / 7);
const wdate = i => new Date(NASC + i * 7 * 864e5);
const paydayMonth = i => { for (let k = 0; k < 7; k++) { const d = new Date(NASC + (i * 7 + k) * 864e5); if (d.getUTCDate() === 5) return d.getUTCFullYear() * 12 + d.getUTCMonth() - CM0; } return null; };
const miEsp = new Array(NW).fill(-1); {
  let cur = -1;
  for (let i = W0e - 6; i < NW; i++) { const p = paydayMonth(i); if (p !== null) cur = Math.max(0, p); miEsp[i] = cur; }
}
{
  let bad = 0, n = 0;
  for (let i = W0 - 6; i < NW; i++) { n++; if (sem[i].mi !== miEsp[i]) bad++; }
  chk('1', 'calendário: W0 e o mês do plano (ciclo do dia 5) de cada semana', 'recalculo W0=round(dias/7) e o mês de cada semana pelo dia 5; conto divergências', n + ' semanas', bad + Math.abs(W0 - W0e));
}

// ========== A/E. CAIXA, RENDIMENTO E CONSERVAÇÃO (semanal) ==========
const R_M = plano.rate, GW = Math.pow(1 + R_M, WPM);
const objs = plano.objectives;
const prof = plano.profiles;
const MESES_CONS = 24;                                     // premissa de desenho (regra dos 24 meses conservadores)
// taxa esperada de uma caixinha no mês do plano mi (regra: conservadora nos últimos 24 meses antes da data; antes, o perfil)
const taxaEsp = (o, mi) => {
  const b = prof[o.profile], c = Math.min(b, prof.conservador), t = Math.max(0, Math.round(o.months) - MESES_CONS);
  return t <= 0 || b === c ? c : (mi >= t ? c : b);
};
const flow = (i, k) => (sem[i].f && sem[i].f[k]) || 0;
const somaIn = i => { let r = 0; for (const k in sem[i].f) if (k.startsWith('in_')) r += sem[i].f[k]; return r; };
const somaOut = i => { let r = 0; for (const k in sem[i].f) if (k.startsWith('out_')) r += sem[i].f[k]; return r; };
const somaMov = i => { let r = 0; for (const k in sem[i].f) if (k.startsWith('mov_')) r += sem[i].f[k]; return r; };

// (A1) soma das movimentações = entradas − saídas (transferências somam zero), por semana
{
  let m = 0; for (let i = W0; i < NW; i++) m = Math.max(m, Math.abs(somaMov(i) - (somaIn(i) - somaOut(i))));
  chk('A1', 'transferências internas somam zero: Σ mov_* = Σ in_* − Σ out_*', 'por semana, observado', (NW - W0) + ' semanas', m);
}
// (A2) sem NaN / infinito / sinais
{
  let bad = 0; const chave = ['fin', 'cofre', 'bens', 'part', 'prev', 'div', 'cheque'];
  for (let i = W0; i < NW; i++) { const w = sem[i]; chave.forEach(k => { if (!isFinite(w[k])) bad++; }); w.obj.forEach(v => { if (!isFinite(v) || v < -1e-6) bad++; });
    ['bens', 'part', 'prev', 'div', 'cheque'].forEach(k => { if (w[k] < -1e-6) bad++; }); for (const k in w.f) if (!isFinite(w.f[k])) bad++; }
  chk('A2', 'sem NaN/∞; bens, participações, previdência, dívida e caixinhas nunca negativos', 'varredura', (NW - W0) + ' semanas', bad);
}
// (E1) cofre: cofre(i) = [cofre(i−1) · GW se > 0] + mov_cofre(i); na semana de hoje a alocação das caixinhas ocorre ANTES do rendimento
const objIds = objs.map(o => o.id);
let eCofre = 0, eCofreSemana = -1, minCofre = Infinity;
const cofreEsp = new Float64Array(NW);
{
  for (let i = W0; i < NW; i++) {
    const prev = i === W0 ? 1050000 : cofreEsp[i - 1];        // 690.000 + 210.000 + 150.000 (PGBL) = financeiro livre em hoje (o fundo de pensão fica à parte)
    let ant = prev, apos = flow(i, 'mov_cofre');
    if (i === W0) { const aloc = objIds.reduce((a, id) => a + flow(i, 'mov_obj_' + id), 0); ant = prev - aloc; apos = flow(i, 'mov_cofre') + aloc; }
    const c = (ant > 0 ? ant * GW : ant) + apos;
    cofreEsp[i] = c; const e = Math.abs(c - sem[i].cofre); if (e > eCofre) { eCofre = e; eCofreSemana = i; }
    minCofre = Math.min(minCofre, sem[i].cofre);
  }
  chk('E1', 'rendimento do caixa: cofre(i) = cofre(i−1)·(1+0,4%)^(7/30,4375) + movimentos da semana (fluxos entram no fim da semana, sem render na semana em que chegam)', 'recursão semanal a partir do saldo inicial 1.050.000 e dos fluxos observados', (NW - W0) + ' semanas (acumulado)', eCofre, 'pior semana ' + eCofreSemana);
}
// (E2) taxa efetiva mensal do GW = R_M
chk('E2', 'taxa semanal equivalente à taxa mensal do plano (0,4% a.m.)', 'GW^(30,4375/7) − 1 − 0,004', '1 valor', Math.abs(Math.pow(GW, 1 / WPM) - 1 - R_M));

// (D) caixinhas: recursão semanal, taxa pela regra (estrita = mês da própria semana; "defasada" = mês da semana anterior, como o motor)
const objExp = { estrita: objs.map(() => new Float64Array(NW)), defasada: objs.map(() => new Float64Array(NW)) };
const errObj = { estrita: objs.map(() => 0), defasada: objs.map(() => 0) }, piorObj = objs.map(() => -1);
const trocaObs = objs.map(() => null);
{
  objs.forEach((o, k) => {
    ['estrita', 'defasada'].forEach(modo => {
      for (let i = W0; i < NW; i++) {
        const ant = i === W0 ? 0 : objExp[modo][k][i - 1];
        const mi = modo === 'estrita' ? sem[i].mi : (i === W0 ? 0 : sem[i - 1].mi);
        const g = Math.pow(1 + taxaEsp(o, Math.max(0, mi)), WPM);
        const fl = flow(i, 'mov_obj_' + o.id);
        const v = i === W0 ? (ant + fl) * g : ant * g + fl;
        objExp[modo][k][i] = v;
        const e = Math.abs(v - sem[i].obj[k]); if (e > errObj[modo][k]) { errObj[modo][k] = e; if (modo === 'defasada') piorObj[k] = i; }
      }
    });
  });
  objs.forEach((o, k) => {
    chk('D' + (k + 1) + 'a', 'caixinha "' + o.name + '": saldo(i) = saldo(i−1)·(1+taxa)^(7/30,4375) + aportes, taxa pela regra do perfil/24 meses (taxa do mês da semana anterior = convenção do motor)', 'recursão semanal com fluxos mov_obj_* observados', (NW - W0) + ' semanas', errObj.defasada[k]);
    chk('D' + (k + 1) + 'b', 'caixinha "' + o.name + '": mesma recursão, com a taxa do mês da PRÓPRIA semana (convenção estrita)', 'idem', (NW - W0) + ' semanas', errObj.estrita[k], 'diferença só na 1ª semana de cada mês de troca');
  });
  // taxaPorMes do extrato x regra
  let m = 0; ext.objetivos.forEach((eo, k) => { eo.taxaPorMes.forEach((t, mi) => { m = Math.max(m, Math.abs(t - taxaEsp(objs[k], mi))); }); });
  chk('D4', 'taxaPorMes de cada caixinha = regra (perfil antes dos últimos 24 meses; conservadora depois; <24 meses já conservadora)', 'comparo cada mês de 0 a data', '3 objetivos', m);
  const pf = ext.PROFILES; chk('D5', 'taxas dos perfis (PROFILES) = plano.profiles', 'comparo', '3 perfis', Math.max(...['conservador', 'moderado', 'agressivo'].map(p => Math.abs(pf[p] - prof[p]))));
}
// realização: saque na data (flow = −saldo antes), consumo/compra, devolução do excedente
const real = {};
objs.forEach((o, k) => {
  let sem0 = null; for (let i = W0; i < NW; i++) if (flow(i, 'mov_obj_' + o.id) < 0 && sem[i].obj[k] === 0) { sem0 = i; break; }
  const antes = objExp.defasada[k][sem0 - 1] * Math.pow(1 + taxaEsp(o, Math.max(0, sem[sem0 - 1].mi)), WPM);
  real[o.id] = { semana: sem0, mi: sem[sem0].mi, saqueObs: -flow(sem0, 'mov_obj_' + o.id), saqueEsp: antes, amount: o.amount, meses: o.months };
});
{
  let m = 0; objs.forEach(o => { const r = real[o.id]; m = Math.max(m, Math.abs(r.saqueObs - r.saqueEsp), r.mi === o.months ? 0 : 1); });
  chk('D6', 'realização de cada caixinha no mês da data (mi = prazo) e saque = saldo recalculado', 'comparo mi e valor sacado', '3 objetivos', m);
  const eu = real.europa, ca = real.carro, pr = real.praia;
  const fE = ext.meses[eu.mi].fluxo, fC = ext.meses[ca.mi].fluxo, fP = ext.meses[pr.mi].fluxo;
  const e1 = Math.abs((fE.out_obj_europa || 0) - 80000), e2 = Math.abs((fC.mov_bens || 0) - 70000), e3 = Math.abs((fP.mov_bens || 0) - 200000);
  chk('D7', 'consumo (Europa 80.000 sai do caixa), bem comprado (Carro 70.000 e Praia 200.000 de entrada viram bens); saldo restante devolvido ao caixa', 'comparo fluxos do mês da data', '3 meses', Math.max(e1, e2, e3));
}
// aportes: planned = 0 e required = 0 (conferência da fórmula de aporte necessário)
{
  const rec = (o) => { const n = o.months; let sd = 0; let bal = (o.dedicated || 0); for (let m = 0; m < n; m++) bal *= 1 + taxaEsp(o, m);
    // vendas que financiam: praia recebe 200.000 no mês 13
    if (o.id === 'praia') { let b = 200000; for (let m = 13; m < n; m++) b *= 1 + taxaEsp(o, m); bal += b; }
    return { saldo: bal, falta: Math.max(0, o.amount - bal) }; };
  let m = 0; const det = {};
  objs.forEach(o => { const r = rec(o); det[o.id] = r; m = Math.max(m, Math.abs(Math.max(0, r.falta) - o.required)); });
  chk('D8', 'aporte necessário por objetivo (zero nos três: o patrimônio dedicado/ a venda já cobrem o valor)', 'saldo na data com a taxa da regra, dedicado + venda', '3 objetivos', m, 'projeções mensais: ' + objs.map(o => o.id + '=' + f2(det[o.id].saldo)).join('; '));
  P('PROJEÇÕES (fórmula mensal): ', objs.map(o => o.id + ' ' + f2(det[o.id].saldo)).join(' | '));
  P('REAL (semanal, motor): ', objs.map((o, k) => o.id + ' ' + f2(real[o.id].saqueObs)).join(' | '));
}

// (A3) conservação do caixa financeiro (cofre + caixinhas): Δfin = rendimento + Σin − Σout − mov_bens, semana a semana
{
  let m = 0, pior = -1;
  for (let i = W0 + 1; i < NW; i++) {
    const finAnt = sem[i - 1].fin;
    let rend = 0; if (sem[i - 1].cofre > 0) rend += sem[i - 1].cofre * (GW - 1);
    objs.forEach((o, k) => { rend += sem[i - 1].obj[k] * (Math.pow(1 + taxaEsp(o, Math.max(0, sem[i - 1].mi)), WPM) - 1); });
    const esp = finAnt + rend + somaIn(i) - somaOut(i) - flow(i, 'mov_bens');
    const e = Math.abs(esp - sem[i].fin); if (e > m) { m = e; pior = i; }
  }
  chk('A3', 'conservação do dinheiro: fin(i) = fin(i−1) + rendimento + entradas − saídas − transferências para bens/participações', 'semana a semana, rendimento recalculado', (NW - W0 - 1) + ' semanas', m, 'pior semana ' + pior);
}

// ========== B. PARTICIPAÇÃO ==========
const part = plano.patrimonio.participacoes[0];
const V0 = part.valor, PV = part.venda.preco, MV = part.venda.em;
const vPart = m => m >= MV ? 0 : V0 * Math.pow(PV / V0, m / MV);   // ritmo geométrico constante até o preço (valor esperado no mês da venda)
{
  let m1 = 0, m2 = 0, m3 = 0;
  for (let mi = 0; mi <= MV; mi++) m1 = Math.max(m1, Math.abs(ext.parts[0].serie[mi] - (mi === MV ? PV : vPart(mi))));
  for (let mi = 0; mi < ext.meses.length; mi++) { const e = vPart(mi); m2 = Math.max(m2, Math.abs(ext.meses[mi].fim.det.parts[0] - e), Math.abs(ext.meses[mi].fim.part - e)); }
  chk('B1', 'participação: série mensal do valor (900.000 → 1.100.000 em 13 meses, ritmo geométrico) = parts[].serie', 'V0·(PV/V0)^(m/13), m=0..13', '14 meses', m1, 'm6 = ' + f2(vPart(6)) + ' (cenário 987.338)');
  chk('B2', 'participação: det.parts e fim.part de TODOS os meses (antes = série; depois da venda = 0, sem ficar negativa)', 'comparo mês a mês', ext.meses.length + ' meses', m2);
  const cp = part.venda.custos, custo = cp.reduce((a, c) => a + (c.pct != null ? PV * c.pct / 100 : c.valor), 0), liq = PV - custo;
  const sv = ext.parts[0].venda;
  chk('B3', 'venda: preço 1.100.000, custos 22.000 + 25.000 = 47.000, líquido 1.053.000', 'preço·2% + 25.000', '1 venda', Math.abs(sv.preco - PV) + Math.abs(sv.custo - custo) + Math.abs(sv.liquido - liq) + Math.abs(sv.quitacao));
  const fl = ext.meses[MV].fluxo;
  chk('B4', 'fluxo do mês da venda: participação sai (−1.100.000 em mov_bens), custo 47.000 (out_vendap), 200.000 para a caixinha da praia', 'comparo fluxo do mês 13', '1 mês', Math.abs(fl.mov_bens + PV) + Math.abs(fl.out_vendap_0 - custo) + Math.abs(fl.mov_obj_praia - 200000));
  // destino do líquido: o que sobra (853.000) fica no caixa
  const evV = ext.eventos.find(e => e.type === 'venda');
  chk('B5', 'destino do líquido: 200.000 → praia; resto 853.000 → financeiro (marco da venda)', 'texto do evento + conta', '1 evento', (evV.detail.indexOf('R$ 200.000') >= 0 && evV.detail.indexOf('R$ 853.000') >= 0) ? Math.abs(liq - 200000 - 853000) : 1, evV.detail);
  // semana da venda: part cai a 0 e o valor retirado é o do mês anterior (a valorização do último mês fica no ganho da venda)
  const iv = evV.week; chk('B6', 'semana da venda: participação = 0 depois; antes = valor do mês 12', 'comparo estado semanal', '2 semanas', Math.abs(sem[iv].part) + Math.abs(sem[iv - 1].part - vPart(12)));
  P('Participação: valor retirado da carteira na venda =', f2(vPart(12)), '; preço =', f2(PV), '; ganho reconhecido na venda =', f2(PV - vPart(12)));
  // renda ligada: nenhuma linha de renda do plano depende da clínica
  chk('B7', 'renda ligada à participação encerra com a venda (o plano não tem renda ligada à clínica)', 'procuro rendas com origem na clínica', plano.incomes.length + ' rendas', plano.incomes.filter(r => /cl[ií]nica|pro.?labore|dividendo/i.test(JSON.stringify(r))).length);
}

// ========== C. DÍVIDAS ==========
const bem = plano.patrimonio.bens[0];
const N = bem.parcelas, CR = bem.credito, AM = CR / N, K0 = N - bem.restantes;     // 240, 480.000, 2.000, 104
const iInf = Math.pow(1 + bem.juros / 100, 1 / 12) - 1;                               // taxa mensal derivada da anual
const iPar = (bem.parcela - AM) / (CR - K0 * AM);                                     // taxa implícita na parcela de hoje (4.065 = 2.000 + 272.000·i)
function tabelaSAC(F, i, n, extras) {                                                // extras: { depoisDaParcela p: {valor, modo} }
  const lin = []; let bal = F, am = F / n;
  for (let p = 1; p <= n && bal > 1e-9; p++) {
    const juros = bal * i, a = Math.min(bal, am); bal -= a; const x = extras && extras[p]; let ex = 0;
    if (x && bal > 0) { ex = Math.min(bal, x.valor); bal -= ex; if (x.modo === 'parcela' && bal > 0 && n - p > 0) am = bal / (n - p); }
    lin.push({ p, juros, amort: a, extra: ex, pay: juros + a, saldo: bal });
  }
  return lin;
}
// contrato do motor (linha do tempo do contrato: mês 0 = parcela nº K0+1; adiantamento "em" = depois da parcela K0+1+em)
const emAm = bem.amortizacoes[0].em, vlAm = bem.amortizacoes[0].valor;
const tabEng = tabelaSAC(CR, iPar, N, { [K0 + 1 + emAm]: { valor: vlAm, modo: 'parcela' } });
const tabCal = tabelaSAC(CR, iPar, N, { [K0 + emAm]: { valor: vlAm, modo: 'parcela' } });  // leitura literal: nov/2027 = parcela nº 117, adiantamento logo depois
P('Taxa mensal: informada (9,5% a.a.) =', (iInf * 100).toFixed(5) + '%', '| implícita na parcela 4.065 =', (iPar * 100).toFixed(5) + '% (', ((Math.pow(1 + iPar, 12) - 1) * 100).toFixed(4) + '% a.a.)');
// saldo "calendário": mi → pagamentos feitos até o fim do mês mi = K0 + mi (mês 0 é um toco sem parcela)
const linha = plano.expenses.find(e => e.id === 'parc_apto');
const stepAt = (mi) => { let v = 0; linha.steps.forEach(s => { if (mi >= s.from) v = s.value; }); return v; };
const excAt = (mi) => (linha.exc && linha.exc[mi] != null) ? linha.exc[mi] : 0;
const valorLinha = mi => excAt(mi) || stepAt(mi);
const saldoApos = (tab, pg) => pg <= 0 ? CR : pg >= tab.length ? 0 : tab[pg - 1].saldo;
{
  let m = 0, m2 = 0, m3 = 0;
  const obs = ext.dividas[0].saldo;
  for (let mi = 0; mi < obs.length; mi++) m = Math.max(m, Math.abs(obs[mi] - saldoApos(tabEng, K0 + mi)));
  for (let mi = 0; mi < ext.meses.length; mi++) { const e = saldoApos(tabEng, K0 + mi); m2 = Math.max(m2, Math.abs(ext.meses[mi].fim.div - e), Math.abs(ext.meses[mi].fim.det.divs[0] - e)); }
  chk('C1', 'saldo devedor do apartamento: SAC 480.000/240, amortização fixa 2.000, adiantamento 100.000 (reduz a parcela), saldo = 272.000 − 2.000·mi até o adiantamento', 'tabela SAC própria; saldo após K0+mi parcelas', obs.length + ' meses (dividas[0])', m);
  chk('C2', 'mesmo saldo em fim.div e fim.det.divs de todos os meses do extrato (inclui quitação em zero e juros depois)', 'comparo mês a mês', ext.meses.length + ' meses', m2);
  P('Saldo no fim do mês 13 (convenção do motor):', f2(ext.meses[13].fim.div), '| no mês 14:', f2(ext.meses[14].fim.div), '| leitura literal do calendário no mês 13:', f2(saldoApos(tabCal, K0 + 13)), '(com adiantamento depois da parcela 117)');
  chk('C3', 'saldo após o adiantamento: 144.000 em 122 parcelas; amortização 1.180,33; 1ª parcela depois = 1.180,33 + 144.000·i = 2.273,56', 'tabela SAC própria', '1 valor', Math.abs(tabEng[K0 + emAm].saldo - 144000) + Math.abs(tabEng[K0 + emAm + 1].amort - 144000 / 122) + Math.abs(tabEng[K0 + emAm + 1].pay - stepAt(14)), '1ª parcela depois: ' + f2(tabEng[K0 + emAm + 1].pay) + ' (linha do plano no mês 14: ' + f2(stepAt(14)) + ')');
  // quitação: zero no fim
  const ultimo = ext.meses.findIndex((b, k) => k > 0 && b.fim.div === 0 && ext.meses[k - 1].fim.div > 0);
  P('Leitura literal do calendário (adiantamento depois da parcela nº 117 de nov/2027): saldo', f2(tabCal[K0 + emAm - 1].saldo), '| parcela seguinte', f2(tabCal[K0 + emAm].pay), '| motor: saldo 144.000 e parcela', f2(tabEng[K0 + emAm + 1].pay), '| última parcela do contrato (nº 240)', f2(tabEng[N - 1].pay));
  chk('C4', 'quitação final em zero no mês certo (nº 240 paga no mês 136) e juros pagos = Σ parcelas − principal', 'mês em que o saldo zera x tabela', '1 contrato', Math.abs(ultimo - (N - K0)), 'Σ juros restantes (tabela) = ' + f2(tabEng.slice(K0).reduce((a, l) => a + l.juros, 0)));
}
// linha de caixa da parcela (plano.expenses parc_apto) x tabela do contrato
{
  // 1) degraus da linha = parcela do contrato na linha do tempo do contrato (mês m ↔ parcela K0+1+m)
  let m = 0; linha.steps.forEach(s => { if (s.value > 0 && s.from < N - K0) m = Math.max(m, Math.abs(s.value - tabEng[K0 + s.from].pay)); });
  chk('C5', 'degraus da linha da parcela (lançada pelo consultor) = parcela do contrato nos meses dos degraus', 'tabela SAC própria, taxa implícita', linha.steps.length + ' degraus', m, 'tolerância de arredondamento do consultor: R$0,01');
  // 2) exc do mês 13 = parcela + adiantamento
  chk('C6', 'exceção do mês 13 = parcela 3.867,61 + adiantamento 100.000', 'tabela SAC própria', '1 mês', Math.abs(excAt(13) - (vlAm + tabEng[K0 + emAm].pay)));
  // 3) nº de parcelas pagas no caixa x do contrato; valor mensal pago (calendário literal) x linha
  const obsPar = ext.meses.map(b => (b.fluxo.out_fix_parc_apto || 0));
  const nPag = obsPar.filter(v => v > 0.5).length, restContrato = N - K0;
  P('Parcelas pagas no caixa (meses com saída da parcela):', nPag, '| parcelas restantes pelo contrato:', restContrato);
  // calendário literal: mês mi (1..) paga a parcela nº K0+mi da tabela que tem o adiantamento "no calendário"
  let dif = 0, somaLit = 0, somaLinha = 0, somaEng = 0;
  for (let mi = 1; mi <= restContrato; mi++) { const l = tabCal[K0 + mi - 1]; const lit = l.pay + l.extra; const ln = valorLinha(mi); dif = Math.max(dif, Math.abs(lit - ln)); somaLit += lit; somaLinha += ln; }
  tabEng.slice(K0).forEach(l => { somaEng += l.pay + l.extra; });
  P('Σ parcelas+adiantamento: linha de caixa (sem escala)', f2(somaLinha), '| contrato na linha do tempo do motor', f2(somaEng), '| leitura literal do calendário', f2(somaLit), '| última parcela do contrato (nº 240)', f2(tabEng[N - 1].pay));
  P('Linha de caixa x parcela literal do calendário: maior diferença mensal', f2(dif));
  RES.push({ id: 'C7', o: 'nº de parcelas que saem do caixa = parcelas restantes do contrato (136)', metodo: 'conto meses com out_fix_parc_apto>0', amostra: ext.meses.length + ' meses', erro: Math.abs(nPag - restContrato), ok: nPag === restContrato, extra: 'observado ' + nPag + ' x contrato ' + restContrato });
}
// financiamento da compra da praia (400.000 / 180, SAC, 9,5% a.a., sem IOF) — saída mensal, juros, bens, quitação
const praia = objs.find(o => o.id === 'praia');
const FP = praia.preco - praia.amount, iPr = Math.pow(1 + praia.compra.juros / 100, 1 / 12) - 1;
const tabP = tabelaSAC(FP, iPr, praia.compra.parcelas);
const chavePraia = Object.keys(ext.meses[36].fluxo).find(k => /praia_compra/.test(k));
{
  let m = 0, nPag = 0; const mi0 = praia.months;
  ext.meses.forEach(b => { const v = b.fluxo[chavePraia] || 0; const k = b.mi - mi0; const esp = k >= 0 && k < tabP.length ? tabP[k].pay : 0; m = Math.max(m, Math.abs(v - esp)); if (v > 0.5) nPag++; });
  chk('C8', 'financiamento da praia: 400.000/180 SAC, 9,5% a.a. → 1ª parcela 5.258,85, amortização 2.222,22, 180 parcelas, quitação no mês 215', 'tabela SAC própria x out_fix_praia_compra', ext.meses.length + ' meses', m, nPag + ' parcelas; 1ª ' + f2(tabP[0].pay) + '; última ' + f2(tabP[179].pay));
  const juros = tabP.reduce((a, l) => a + l.juros, 0), pago = tabP.reduce((a, l) => a + l.pay, 0);
  const pagoObs = ext.meses.reduce((a, b) => a + (b.fluxo[chavePraia] || 0), 0);
  chk('C9', 'juros pagos da praia = Σ parcelas − principal', 'Σ parcelas observadas − 400.000 x Σ juros da tabela', '180 parcelas', Math.abs((pagoObs - FP) - juros), 'juros = ' + f2(juros));
  // bens: 1.100.000 (apto, sem valorização) + 70.000 (carro, mi≥24) + 200.000 (praia, mi≥36) + amortizações acumuladas da praia
  let mb = 0; ext.meses.forEach(b => { let e = 1100000 + (b.mi >= 24 ? 70000 : 0) + (b.mi >= 36 ? 200000 : 0); const n = Math.max(0, Math.min(180, b.mi - 36 + 1)); e += tabP.slice(0, n).reduce((a, l) => a + l.amort, 0); mb = Math.max(mb, Math.abs(b.fim.bens - e)); });
  chk('C10', 'bens = apartamento 1.100.000 + carro 70.000 + praia (entrada 200.000 + amortizações acumuladas), patrimônio por equity', 'recalculo bens mês a mês', ext.meses.length + ' meses', mb);
  const quit = ext.eventos.filter(e => /quitado/i.test(e.label));
  P('Eventos de quitação:', quit.map(e => e.label + ' (sem ' + e.week + ' → mi ' + sem[e.week].mi + ')').join('; '));
}
// fundo de pensão: saldo, saque, renda, duração
const fp = plano.patrimonio.financeiro[3], cv = fp.conv;
{
  const mc = Math.round((cv.aos - 62.2177) * 12), rm = Math.pow(1 + R_M, 12) - 1;   // taxa do plano para o acúmulo
  const ser = i => fp.valor * Math.pow(1 + R_M, i);
  let m = 0; for (let mi = 0; mi < 6; mi++) m = Math.max(m, Math.abs(ext.meses[mi].fim.prev - ser(mi)));
  chk('C11', 'fundo de pensão: saldo mês a mês = 1.600.000·1,004^mi até a concessão (mês 6); 0 depois', 'recalculo', '6 meses + depois', m + Math.abs(ext.meses[6].fim.prev));
  const naData = ser(6), saque = naData * cv.saque / 100, Sres = naData - saque;
  const obsSaque = ext.meses[6].fluxo.in_pas_1, obsRenda = ext.meses[6].fluxo.in_pas_2;
  chk('C12', 'saque de 25% do fundo: 1.600.000·1,004^6·25% = 409.696,51', 'recalculo', '1 valor', Math.abs(obsSaque - saque), 'cenário 409.697; renda do cenário 7.976 usa 0,4% a.m.');
  // renda por prazo certo: antecipada, taxa da fase de renda = parâmetro Previc (6,08%~6,09% a.a.) — premissa de desenho; confiro a fórmula
  const pmtDue = (S, ia, n) => { const r = Math.pow(1 + ia, 1 / 12) - 1; return S * r / (1 - Math.pow(1 + r, -n)) / (1 + r); };
  const dur = ia => { let a = 0, b = 0; for (let t = 0; t < cv.anos; t++) { const w = Math.pow(1 / (1 + ia), t); a += t * w; b += w; } return a / b; };
  let best = null; [0.0608, 0.0609, 0.0610, 0.0611].forEach(ia => { const e = Math.abs(pmtDue(Sres, ia, cv.anos * 12) - obsRenda); if (!best || e < best.e) best = { ia, e }; });
  chk('C13', 'renda do fundo (prazo certo 20 anos, paga no início do mês) = S·r/(1−(1+r)^−240)/(1+r) com a taxa de renda da Previc para a duration (~8,3 anos → 6,08% a.a.)', 'recalculo; testo taxas 6,08–6,11%', '1 valor', best.e, 'melhor ajuste: ' + (best.ia * 100).toFixed(2) + '% a.a.; duration ' + dur(0.0608).toFixed(2) + ' anos; renda ' + f2(obsRenda) + ' | com 0,4% a.m. (imediata) ' + f2(Sres * R_M / (1 - Math.pow(1 + R_M, -240))) + ' | com 0,4% a.m. (antecipada) ' + f2(pmtDue(Sres, rm, 240)));
  P('Fundo: saldo na concessão', f2(naData), '| saque', f2(saque), '| resto', f2(Sres), '| renda observada', f2(obsRenda));
  const nR = ext.meses.filter(b => (b.fluxo.in_pas_2 || 0) > 0.5).length;
  chk('C14', 'renda do fundo por exatamente 240 meses (mi 6 a 245)', 'conto meses com in_pas_2', ext.meses.length + ' meses', Math.abs(nR - 240));
}

// ========== F. FLUXO: entradas e saídas do plano ==========
const parada = 26;                                       // mês em que o MOTOR para o salário da Vera (observado abaixo); o esperado do cliente é 27
const mesCal = mi => (CM0 + mi) % 12;                    // 0 = janeiro
const renda = { saque: 409696.51353845926, fundo: 8703.82240328022 };
{
  const mx = { in: 0, ent13: 0 }; const difs = [];
  ext.meses.forEach(b => {
    const mi = b.mi; if (mi < 1 || mi === ext.meses.length - 1) return;
    let esp = 7800;
    if (mi < parada) esp += 9500 + (mesCal(mi) === 11 ? 9500 : 0);
    if (mi >= 6 && mi < 246) esp += renda.fundo + (mi === 6 ? renda.saque : 0);
    if (mi >= 27) esp += 5600;
    let obs = 0; for (const k in b.fluxo) if (k.startsWith('in_')) obs += b.fluxo[k];
    if (b.fluxo.in_teto) obs -= b.fluxo.in_teto;
    const e = Math.abs(obs - esp); mx.in = Math.max(mx.in, e); if (e > 0.01) difs.push(mi);
  });
  chk('F1', 'entradas do mês = INSS do Hélio 7.800 + salário 9.500 (+13º em dezembro) + renda do fundo + INSS da Vera 5.600 (mi≥27) [com a parada do salário no mês 26 do motor]', 'recalculo por mês', (ext.meses.length - 1) + ' meses', mx.in, 'meses divergentes: ' + difs.join(','));
  // o que o cliente esperaria: salário e 13º também no mês 26 (dez/2028)
  const obs26 = ext.meses[26].fluxo, obs25 = ext.meses[25].fluxo;
  P('Mês 26 (dez/2028): salário observado', f2(obs26.in_salario || 0), '| 13º observado', f2(obs26.in_decimo || 0), '| INSS Vera observado', f2(obs26.in_pas_0 || 0), '| mês 25: salário', f2(obs25.in_salario || 0));
  RES.push({ id: 'F2', o: 'Vera trabalha até jan/2029 (60 anos em 01/01/2029): salário e 13º de dezembro de 2028 (mês 26) deveriam entrar', metodo: 'ciclo do mês 26 = 05/12/2028–04/01/2029; ela só faz 60 em 01/01/2029', amostra: 'mês 26', erro: (obs26.in_salario || 0) + (obs26.in_decimo || 0) === 0 ? 19000 : 0, ok: (obs26.in_salario || 0) + (obs26.in_decimo || 0) > 0, extra: 'esperado 19.000; observado 0' });
}
// escala do padrão de vida depois da liberdade (regra de desenho): escala = (renda do mês + saque do patrimônio − parcelas da compra) / custo de vida
const desired = plano.desired;
const custoLinhas = plano.expenses.filter(e => e.id !== 'parc_apto').reduce((a, e) => a + e.steps[0].value, 0);   // 14.500
const praiaPay = mi => { const k = mi - praia.months; return k >= 0 && k < tabP.length ? tabP[k].pay : 0; };
const rendaPas = mi => (mi >= 6 && mi < 246 ? renda.fundo : 0) + (mi === 6 ? renda.saque : 0) + (mi >= 27 ? 5600 : 0);
const trab = mi => mi < parada ? 9500 + 9500 / 12 : 0;
function escalaEsp(mi) {
  const custo = custoLinhas + stepAt(mi);
  const pas = rendaPas(mi) + 7800 + trab(mi), w = Math.max(0, desired - pas);
  return Math.max(0, pas + w - praiaPay(mi)) / custo;
}
{
  let m = 0, n = 0, pior = -1; const linhas = { moradia: 3100, saude: 4200, transporte: 1400, alimentacao: 2800, lazer: 2000, outros: 1000 };
  const grupo = { moradia: 'fix', saude: 'fix', transporte: 'fix', alimentacao: 'adj', lazer: 'adj', outros: 'adj' };
  ext.meses.forEach(b => {
    const mi = b.mi; if (mi < 1 || mi === ext.meses.length - 1) return;   // o último mês é uma semana truncada no horizonte (100 anos)
    const sc = escalaEsp(mi);
    for (const id in linhas) { const o = b.fluxo['out_' + grupo[id] + '_' + id] || 0; const e = Math.abs(o - linhas[id] * sc); n++; if (e > m) { m = e; pior = mi; } }
    const op = b.fluxo.out_fix_parc_apto || 0; const ep = sc * valorLinha(mi); if (Math.abs(op - ep) > m) { m = Math.abs(op - ep); pior = mi; } n++;
  });
  chk('F3', 'saídas do mês = linha do plano × escala do padrão de vida (regra de desenho: depois da liberdade o gasto vira renda do mês + saque − parcelas da compra)', 'reescrevo a escala; comparo 7 linhas × 454 meses', n + ' valores', m, 'pior mês ' + pior);
  const sc6 = escalaEsp(6), sc13 = escalaEsp(13);
  P('Escala do padrão de vida: mês 1', escalaEsp(1).toFixed(4), '| mês 6', sc6.toFixed(4), '| mês 7', escalaEsp(7).toFixed(4), '| mês 13', sc13.toFixed(4), '| mês 14', escalaEsp(14).toFixed(4), '| mês 36', escalaEsp(36).toFixed(4));
  P('Despesas do mês 6 (observado):', f2(Object.keys(ext.meses[6].fluxo).filter(k => k.startsWith('out_')).reduce((a, k) => a + ext.meses[6].fluxo[k], 0)), '| entradas', f2(Object.keys(ext.meses[6].fluxo).filter(k => k.startsWith('in_')).reduce((a, k) => a + ext.meses[6].fluxo[k], 0)));
  // vazamento no adiantamento: escala × 103.867,61 em vez de 103.867,61
  const obs13 = ext.meses[13].fluxo.out_fix_parc_apto;
  P('Mês 13: saída observada da parcela+adiantamento', f2(obs13), '| do contrato', f2(excAt(13)), '| excesso', f2(obs13 - excAt(13)));
}
// mês 0 (toco de 2 semanas): frações do ciclo
{
  const f0 = ext.meses[0].fluxo; chk('F4', 'mês 0 (toco 20/10–04/11): sem salário/INSS (pagos dia 5); gastos "ajustáveis" pela fração do ciclo (2 de 4 semanas = 50%); plano de saúde (4ª semana) integral', 'comparo', '1 mês', Math.abs(f0.out_adj_alimentacao - 1400) + Math.abs(f0.out_adj_lazer - 1000) + Math.abs(f0.out_adj_outros - 500) + Math.abs(f0.out_fix_saude - 4200) + (f0.in_salario || 0) + (f0.in_inss_helio || 0));
}

// conferências de fidelidade ao enunciado (cenário e comentários do motor)
{
  const dfin = ext.meses[6].fim.fin - ext.meses[5].fim.fin;
  RES.push({ id: 'H1', o: 'saque de 25% do fundo entra no financeiro (cenário e comentário do motor)', metodo: 'Δ financeiro do mês 6 deveria ser ≥ saque', amostra: 'mês 6', erro: dfin >= renda.saque * 0.99 ? 0 : renda.saque - dfin, ok: dfin >= renda.saque * 0.99, extra: 'Δ financeiro do mês 6 = ' + f2(dfin) + '; saque ' + f2(renda.saque) });
  const o13 = ext.meses[13].fluxo.out_fix_parc_apto;
  RES.push({ id: 'H2', o: 'adiantamento sai do caixa pelo valor do contrato (parcela + 100.000)', metodo: 'comparo out_fix_parc_apto do mês 13 com a linha do plano', amostra: 'mês 13', erro: Math.abs(o13 - excAt(13)), ok: Math.abs(o13 - excAt(13)) <= TOL, extra: 'observado ' + f2(o13) + '; contrato ' + f2(excAt(13)) });
  const nw = k => ext.meses[k].fim.fin + ext.meses[k].fim.bens + ext.meses[k].fim.part + ext.meses[k].fim.prev - ext.meses[k].fim.div;
  const caiu = (ext.meses[13].fim.div === 246000);
  RES.push({ id: 'H3', o: 'dívida refletida no patrimônio no mesmo mês em que o adiantamento sai do caixa', metodo: 'fim.div do mês 13 deveria ser 144.000', amostra: 'mês 13', erro: caiu ? ext.meses[13].fim.div - tabEng[K0 + emAm].saldo : 0, ok: !caiu, extra: 'fim.div mês 13 = ' + f2(ext.meses[13].fim.div) + ', mês 14 = ' + f2(ext.meses[14].fim.div) });
  const perdaFut = (v, de, ate) => v * Math.pow(1 + R_M, ate - de);
  P('Efeito acumulado a 0,4% a.m.: 47.533,97 do mês 13 vale', f2(perdaFut(47533.97, 13, 24)), 'no mês 24,', f2(perdaFut(47533.97, 13, 120)), 'no 120,', f2(perdaFut(47533.97, 13, 444)), 'no 444; saque 409.696,51 do mês 6 vale', f2(perdaFut(renda.saque, 6, 24)), 'no 24,', f2(perdaFut(renda.saque, 6, 120)), 'no 120,', f2(perdaFut(renda.saque, 6, 444)), 'no 444');
  const semanasPraia = (real.praia.semana - 3300);
  P('Praia: 200.000 por', semanasPraia, 'semanas a 0,5% =', f2(200000 * Math.pow(1.005, semanasPraia * WPM)), '| a 0,4% =', f2(200000 * Math.pow(1.004, semanasPraia * WPM)));
}
// ========== A. CONTABILIDADE: patrimônio mês a mês ==========
{
  let mx = 0, neg = 0; const nw = [];
  ext.meses.forEach(b => { const f = b.fim; const esp = f.fin + f.bens + f.part + f.prev - f.div; nw.push(esp); if (!isFinite(esp)) neg++; });
  // fin = cofre + caixinhas
  ext.meses.forEach(b => { mx = Math.max(mx, Math.abs(b.fim.fin - (b.fim.cofre + b.fim.obj.reduce((a, v) => a + v, 0)))); });
  chk('A4', 'fin = cofre + Σ caixinhas em todos os meses', 'soma', ext.meses.length + ' meses', mx);
  P('Patrimônio (fin+bens+part+prev−div): mi0', f2(nw[0]), '| mi5', f2(nw[5]), '| mi6', f2(nw[6]), '| mi12', f2(nw[12]), '| mi13', f2(nw[13]), '| mi14', f2(nw[14]), '| mi36', f2(nw[36]), '| mi120', f2(nw[120]), '| mi246', f2(nw[246]), '| fim', f2(nw[nw.length - 1]));
  // verificação independente de cada componente já feita (fin: A3/E1; bens: C10; part: B2; prev: C11; div: C1/C2/C8)
  // previdência fechada: série mês 0..5
  // salto de patrimônio explicável entre meses
  const ds = nw.map((v, k) => k ? v - nw[k - 1] : 0);
  const k6 = ds[6], k13 = ds[13];
  P('Variação do patrimônio no mês 6 (conversão do fundo):', f2(k6), '| mês 13 (venda + adiantamento):', f2(k13));
  P('Menor financeiro nas semanas', 'W0..NW:', f2(Math.min(...sem.slice(W0).map(w => w.fin))), '| menor cofre', f2(minCofre));
}

// ========== G. LIBERDADE / RUÍNA ==========
{
  const ff = ext.ff;
  const primeiraPag = (() => { for (let i = W0 + 1; i < NW; i++) if (paydayMonth(i) !== null) return i; })();
  chk('G1', 'liberdade financeira na primeira semana de pagamento depois de hoje (Hélio já tem 62,2 ≥ 62)', 'calculo a semana do 1º dia 5 depois de W0', '1 evento', Math.abs(ff.week - primeiraPag), 'semana ' + ff.week + ', idade ' + ff.age.toFixed(2) + ', forçada=' + ff.forced);
  const gapMax = desired - 5600 - 7800;                // depois do fim da renda do fundo
  chk('G2', 'maior lacuna mensal até o fim = 22.000 − 5.600 − 7.800 = 8.600; critério "sustenta" = (financeiro × 0,4%) ≥ lacuna ⇒ forçada', 'recalculo', '1 valor', Math.abs(ff.maxGap - gapMax) + (ff.forced === (ff.finAfter * R_M < gapMax) ? 0 : 1), 'finAfter×0,4% = ' + f2(ff.finAfter * R_M));
  chk('G3', 'ruína: o caixa nunca fica negativo (ruina = null)', 'mínimo do cofre em todas as semanas ≥ 0', (NW - W0) + ' semanas', (ext.ruina === null && minCofre >= -0.5) ? 0 : 1, 'menor cofre ' + f2(minCofre));
}

// ========== CONTRAFACTUAIS (impacto das regras de desenho) ==========
// simulação mensal própria do caixa financeiro: pot(mi) = pot(mi−1)·1,004 + entradas − saídas + eventos
function simula(variante) {
  const pot = []; let p = 1050000;
  const stepsExt = ext.meses.map(b => b.mi);
  for (let mi = 0; mi < ext.meses.length; mi++) {
    const nsem = ext.meses[mi].w1 - Math.max(ext.meses[mi].w0, W0);
    if (mi === 0) { p = p * Math.pow(GW, nsem) - 7100; pot.push(p); continue; }
    p *= Math.pow(GW, nsem);
    const decDec = mesCal(mi) === 11;
    let ent = 7800 + (mi < parada ? 9500 + (decDec ? 9500 : 0) : 0) + (mi >= 27 ? 5600 : 0) + (mi >= 6 && mi < 246 ? renda.fundo : 0);
    const saque = mi === 6 ? renda.saque : 0;
    let saida;
    const parc = stepAt(mi) + (mi === 13 ? 100000 : 0);
    const recur = praiaPay(mi);
    if (variante === 'motor') {
      const sc = escalaEsp(mi); saida = sc * (custoLinhas + stepAt(mi)) + sc * (mi === 13 ? excAt(13) - stepAt(13) : 0) + recur; ent += saque;
    } else if (variante === 'A') {          // corrige os dois vazamentos: o saque entra no financeiro; o adiantamento sai pelo valor do contrato
      const pas = rendaPas(mi) - saque + 7800 + trab(mi), w = Math.max(0, desired - pas), sc = Math.max(0, pas + w - recur) / (custoLinhas + stepAt(mi));
      saida = sc * (custoLinhas + stepAt(mi)) + (mi === 13 ? 100000 : 0) + recur; ent += saque;
    } else if (variante === 'B') {          // gasto declarado pelo cliente (14.500) + parcelas do contrato, sem escala
      saida = custoLinhas + parc + recur; ent += saque;
    } else if (variante === 'C') {          // padrão de vida desejado (22.000 no total, parcelas incluídas); a sobra de renda acumula
      const base = Math.max(desired, 0); saida = base + (mi === 13 ? 100000 : 0); ent += saque;
      if (recur > 0) saida = base + (mi === 13 ? 100000 : 0);
    }
    p += ent - saida;
    if (mi === 12) p -= 80000;                                   // viagem
    if (mi === 13) p += 1100000 - 47000;                         // venda da clínica
    if (mi === 24) p -= 70000;                                   // carro
    if (mi === 36) p -= 200000;                                  // entrada da praia
    pot.push(p);
  }
  return pot;
}
const sim = { motor: simula('motor'), A: simula('A'), B: simula('B'), C: simula('C') };
{
  let m = 0, mp = 0; const pts = [6, 12, 13, 24, 36, 60, 120, 246, 444];
  ext.meses.forEach((b, k) => { const e = Math.abs(sim.motor[k] - b.fim.fin); m = Math.max(m, e); mp = Math.max(mp, e / b.fim.fin); });
  P('Simulação mensal própria (esquema do motor) x financeiro observado: maior diferença', f2(m), '(' + (mp * 100).toFixed(3) + '% do saldo)');
  P('mi | financeiro do motor | A (corrige vazamentos) | B (gasto declarado) | C (22.000 fixo, sobra acumula)');
  pts.forEach(mi => P(mi, '|', f2(ext.meses[mi].fim.fin), '|', f2(sim.A[mi]), '(Δ ' + f2(sim.A[mi] - ext.meses[mi].fim.fin) + ')', '|', f2(sim.B[mi]), '(Δ ' + f2(sim.B[mi] - ext.meses[mi].fim.fin) + ')', '|', f2(sim.C[mi]), '(Δ ' + f2(sim.C[mi] - ext.meses[mi].fim.fin) + ')'));
  RES.push({ id: 'G4', o: 'simulação mensal própria do esquema do motor reproduz o financeiro (validação do contrafactual)', metodo: 'recursão mensal 1,004 + fluxos esperados', amostra: ext.meses.length + ' meses', erro: m, ok: mp < 0.01, extra: 'erro relativo máx ' + (mp * 100).toFixed(3) + '% (juros semanais x mensais); tolerância 1% para o contrafactual' });
}

// ========== TESTE DE ESTRESSE DA REGRA DOS 24 MESES (fora do cliente) ==========
{
  const p2 = JSON.parse(JSON.stringify(plano));
  const pr = p2.objectives.find(o => o.id === 'praia'); pr.dedicated = 150000; p2.patrimonio.participacoes[0].venda.destinos = [];
  const r2 = rodar(p2), s2 = r2.s, W2 = r2.W0, k = p2.objectives.findIndex(o => o.id === 'praia');
  const sw = s2.weeks; const ob = p2.objectives[k];
  let eEst = 0, eDef = 0, bal = { e: 0, d: 0 };
  const f = (i, key) => (sw[i].f && sw[i].f[key]) || 0;
  let be = 0, bd = 0, piorS = -1;
  for (let i = W2; i < r2.NW && sw[i].obj[k] > 0 || i === W2; i++) {
    const fl = f(i, 'mov_obj_praia'); const ge = Math.pow(1 + taxaEsp(ob, Math.max(0, sw[i].mi)), WPM), gd = Math.pow(1 + taxaEsp(ob, Math.max(0, i === W2 ? 0 : sw[i - 1].mi)), WPM);
    be = i === W2 ? (be + fl) * ge : be * ge + fl; bd = i === W2 ? (bd + fl) * gd : bd * gd + fl;
    if (fl < 0 && sw[i].obj[k] === 0) break;
    eEst = Math.max(eEst, Math.abs(be - sw[i].obj[k])); eDef = Math.max(eDef, Math.abs(bd - sw[i].obj[k]));
  }
  // trajetórias contrafactuais do dinheiro de hoje na praia (150.000 por 36 meses, ~156,7 semanas)
  const semanas = 36 * 30.4375 / 7;
  const tudoMod = 150000 * Math.pow(1 + prof.moderado, 36), tudoCons = 150000 * Math.pow(1 + prof.conservador, 36), regra = 150000 * Math.pow(1.005, 12) * Math.pow(1.004, 24);
  P('ESTRESSE (praia com 150.000 hoje, moderado, 36 meses): erro máx. da recursão — taxa do mês da semana anterior', f2(eDef), '| taxa do mês da própria semana', f2(eEst));
  P('  saldo na data (fórmula mensal): tudo moderado', f2(tudoMod), '| tudo conservador', f2(tudoCons), '| regra dos 24 meses', f2(regra), '| efeito da regra vs tudo moderado', f2(regra - tudoMod));
  const trocaSemana = (() => { for (let i = W2 + 1; i < r2.NW; i++) { if (sw[i].mi === 12 && sw[i - 1].mi === 11) return i; } return -1; })();
  const g5 = Math.pow(1.005, WPM) - 1, g4 = Math.pow(1.004, WPM) - 1, saldoNaTroca = sw[trocaSemana].obj[k];
  chk('D9', 'estresse: troca moderado→conservador no mês 12; a recursão com a taxa do mês da semana anterior reproduz o motor ao centavo; a defasagem de 1 semana na troca vale', 'executo o motor com 150.000 dedicados à praia e comparo com recursão própria', 'semanas até a data', eDef, 'defasagem de 1 semana na troca: R$ ' + f2(saldoNaTroca * (g5 - g4)) + ' (0,5% em vez de 0,4% numa semana sobre ' + f2(saldoNaTroca) + ')');
}

// ---------- relatório ----------
P('\n## TABELA DE CONFERÊNCIAS\n# | o que | método | amostra | erro máx | resultado | nota');
RES.forEach(r => P(r.id, '|', r.o, '|', r.metodo, '|', r.amostra, '|', f2(r.erro), '|', r.ok ? 'OK' : 'FALHA', '|', r.extra));
console.log(out.join('\n'));
