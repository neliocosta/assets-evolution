// AUDITOR MATEMATICO - CENARIO 08 (Osvaldo e Ione Brandao)
// Reexecutavel:  node ux/auditoria/laudos/auditor-08.js         (de qualquer pasta)
// Independencia: o "esperado" e calculado aqui, a partir do PLANO (planos/plano-08.json) e das regras do dominio financeiro
// (Price/SAC, consorcio, juros compostos, calendario). Nenhuma funcao de calculo do motor e usada para o esperado.
// O "observado" e: extratos/extrato-08.json (mensal) e a execucao semanal do motor (E.run), lida so como saida (weeks[i].f, cofre, obj...).
'use strict';
const fs = require('fs'), path = require('path');
const AUD = path.join(__dirname, '..');
const H = require(path.join(AUD, 'harness.js'));
const PLANO = JSON.parse(fs.readFileSync(path.join(AUD, 'planos', 'plano-08.json'), 'utf8')).dados;
const EXT = JSON.parse(fs.readFileSync(path.join(AUD, 'extratos', 'extrato-08.json'), 'utf8'));

// ---------- observado semanal (so leitura da saida do motor) ----------
const E = H.carregar();
E.configure(JSON.parse(JSON.stringify(PLANO)));
const S = E.run('desej');
const W = S.weeks, W0 = E.W0, NW = E.NW;
const EXT2 = H.extrato({ dados: PLANO }, E);   // o extrato regenerado, para provar que o arquivo gravado e o da versao atual do motor

// ---------- utilitarios ----------
const R2 = v => Math.round(v * 100) / 100;
const fmt = v => (v < 0 ? '-' : '') + 'R$ ' + Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const CHECKS = [];            // {id, frente, o, metodo, amostra, erroMax, ok, nota}
const FINDINGS = [];          // achados numericos para o laudo
function check(id, frente, o, metodo, amostra, erroMax, tol, nota) {
  const ok = Math.abs(erroMax) <= tol;
  CHECKS.push({ id, frente, o, metodo, amostra, erroMax, tol, ok, nota: nota || '' });
}
function maxErr(pairs) { let m = 0, w = null; pairs.forEach(([a, b, tag]) => { const e = Math.abs(a - b); if (!(e <= m)) { m = e; w = tag; } }); return { m: Number.isNaN(m) ? Infinity : m, w }; }

// ---------- calendario (mes 0 = out/2026: inicio 2026-10-19, regra "semana") ----------
const CM0 = 2026 * 12 + 9;
const cal = mi => { const c = CM0 + mi; return { y: Math.floor(c / 12), m: c % 12 }; };   // m: 0 = jan
const NMES = EXT.meses.length;        // 549 meses (mi 0..548)
const mesNome = mi => { const c = cal(mi); return ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][c.m] + '/' + c.y; };
const MES = EXT.meses;                // MES[mi] (os indices coincidem com mi)
MES.forEach((m, k) => { if (m.mi !== k) throw new Error('indice de mes fora de ordem'); });
const fluxo = (mi, k) => (MES[mi] && MES[mi].fluxo[k]) || 0;
const fim = mi => MES[mi].fim;

// ===================================================================================================
// 0. O extrato gravado e o da versao atual do motor? (sanidade da fonte do "observado")
// ===================================================================================================
{
  let m = 0;
  for (let k = 0; k < NMES; k++) {
    const a = EXT.meses[k], b = EXT2.meses[k];
    m = Math.max(m, Math.abs(a.fim.fin - b.fim.fin), Math.abs(a.fim.bens - b.fim.bens), Math.abs(a.fim.div - b.fim.div), Math.abs(a.fim.prev - b.fim.prev));
  }
  check('0', 'Fonte', 'extrato-08.json gravado = saida do motor atual (regerado em memoria)', 'comparacao de fin, bens, div, prev nos 549 meses', '549 meses', m, 0.005);
}

// ===================================================================================================
// F. TRADUCAO DO PLANO -> FLUXO ESPERADO (independente)
// ===================================================================================================
// premissas de calendario: o mes 0 (out/2026) e parcial: o cliente "esta" em 19/10, e tudo que cai antes (dias 5, 10) ja passou.
// ---- bens: series de valor (taxa % a.a. composta mensalmente, por N anos) ----
const horizonte = NMES - 1;
function serieBem(v0, pct, anos, ate) {          // valor no mes m = v0 * (1+pct)^(min(m, 12*anos)/12)
  const s = [v0]; for (let m = 1; m <= ate; m++) s.push(v0 * Math.pow(1 + pct / 100, Math.min(m, 12 * anos) / 12)); return s;
}
const BENS_ESP = [
  serieBem(4200000, 4, 20, horizonte),     // Terra
  serieBem(900000, -10, 8, horizonte),     // Maquinas
  Array.from({ length: horizonte + 1 }, () => 700000),    // Casa na cidade (sem valorizacao dita)
  serieBem(600000, 8, 10, 30)              // Lote em Sinop (ate a venda no mes 30)
];

// ---- consorcio contemplado (trator): regras do dominio ----
function tabelaConsorcioContemplado(carta, adm, fr, n, idx, apos) {
  // saldo = carta*(1+adm+fr); parcela k = saldo/(n-k); depois da parcela p (de 1): se p==apos ou (p>apos e (p-apos)%12==0), saldo*=(1+idx)
  const L = []; let S = carta * (1 + adm + fr);
  for (let k = 0; k < n; k++) {
    const amort = S / (n - k); S -= amort; const p = k + 1;
    if (p === apos || (p > apos && (p - apos) % 12 === 0)) S *= 1 + idx;
    L.push({ pay: amort, saldo: Math.max(0, S) });
  }
  return L;
}
const T = tabelaConsorcioContemplado(420000, 0.15, 0.03, 100, 0.04, 14);   // T[k]: parcela de numero k+1; saldo depois dela

// ---- credito de custeio (Price, 12x, 1,3% a.m.) ----
function tabelaPrice(P0, i, n) {
  const pm = P0 * i / (1 - Math.pow(1 + i, -n)); const L = []; let b = P0;
  for (let k = 0; k < n; k++) { const j = b * i, a = pm - j; b -= a; L.push({ pay: pm, juros: j, amort: a, saldo: Math.max(0, b) }); }
  return L;
}
const CRED = tabelaPrice(120000, 0.013, 12);

// ---- financiamento da casa da Marina: SAC, 350.000, 240x, 10,5% a.a. efetivo, isento de IOF, amortizacao 100.000 no mes 48 (modo prazo) ----
function tabelaSAC(F, iAnual, n, extras) {            // extras: {k: valor} (k = indice da parcela, de 0); extra paga DEPOIS da parcela k
  const i = Math.pow(1 + iAnual, 1 / 12) - 1, am = F / n, L = []; let b = F;
  for (let k = 0; k < n && b > 0.005; k++) {
    const j = b * i, a = Math.min(b, am); b -= a;
    let ex = 0; if (extras[k] && b > 0) { ex = Math.min(b, extras[k]); b -= ex; }
    L.push({ juros: j, amort: a, extra: ex, pay: j + a, saldo: Math.max(0, b) });
  }
  return { L, i };
}
const FIN = tabelaSAC(350000, 0.105, 240, { 12: 100000 });   // parcela 0 no mes 36 (a data do objetivo); extra no mes 48 = indice 12

// ---- consorcio a contemplar (caminhao): 80 parcelas, 10 pagas, 7.200; contemplacao no mes 14; lance 50.000 abate proporcionalmente as parcelas restantes ----
const CAM = (() => {
  const restantes = 70, cont = 14, parcela = 7200, lance = 50000, carta = 500000;
  const devido = (restantes - cont) * parcela;         // 56 x 7.200 = 403.200 (a parcela nao reajusta: reajuste 0)
  const fat = 1 - lance / devido;
  const parcelas = Array.from({ length: restantes }, (_, k) => k < cont ? parcela : parcela * fat);
  return { restantes, cont, parcela, lance, carta, devido, fat, parcelas, liquida: carta - lance };
})();

// ---- fluxo esperado mes a mes (chaves deterministicas) ----
const ESP = Array.from({ length: NMES }, () => ({}));
const add = (mi, k, v) => { if (mi >= 0 && mi < NMES) ESP[mi][k] = (ESP[mi][k] || 0) + v; };
const SEMVAL = [];     // divergencias de convencao documentadas (nao sao erros de conta do motor)
{
  // RENDAS
  for (let mi = 1; mi < NMES; mi++) {
    const c = cal(mi);
    if (c.m === 4 && mi <= 91) add(mi, 'in_soja', 420000);       // maio; Osvaldo para em jun/2034 (mes 92): ultima safra mai/2034 (mes 91)
    if (c.m === 8 && mi <= 91) add(mi, 'in_milho', 150000);      // setembro
    if (mi <= 108) add(mi, 'in_ione', 6200);                     // Ione trabalha ate fazer 60 (1/nov/2035, ciclo do mes 108): ultimo salario 5/out/2035 = mes 108
    if (mi >= 92) add(mi, 'in_arrendamento', 28000);
    if (mi >= 92) add(mi, 'in_pas_0', 7000);                     // INSS Osvaldo
    if (mi >= 109) add(mi, 'in_pas_1', 4000);                    // INSS Ione
  }
  add(3, 'in_credito_cr1', 120000);
  add(CAM.cont, 'in_pas_3', CAM.liquida);                        // carta menos lance
  // FGTS da Ione: saque aos 90 anos: valor de 38.000 capitalizado a (1,004^mes); mes = anos ate os 90 (Ione nasce 1975-11-01; hoje 2026-10-19)
  const idadeIone = (new Date(2026, 9, 19) - new Date(1975, 10, 1)) / (365.25 * 864e5);
  const mcFgts = Math.round((90 - idadeIone) * 12);
  add(mcFgts, 'in_pas_2', 38000 * Math.pow(1.004, mcFgts));
  ESP.fgtsMes = mcFgts;
  // DESPESAS (antes da liberdade; depois o motor escala as despesas ao padrao de vida: tratado a parte)
  add(0, 'out_adj_casa', 3225);            // o mes 0 so tem as semanas depois de 19/10: um quarto da despesa diluida (convencao do motor)
  for (let mi = 1; mi <= 92; mi++) {
    if (mi <= 65) add(mi, 'out_fix_marina', 4500);               // Marina faz 25 em abr/2032 (mes 66)
    add(mi, 'out_fix_saude', 3600);
    add(mi, 'out_adj_casa', 12900);
  }
  add(12, 'out_obj_reforma', 90000);
  add(14, 'out_comp_camin', 500000);
  add(30, 'out_venda_3', 54000);
  // parcelas: o CALENDARIO DO CLIENTE (22 pagas ate out/2026 inclusive => parcela 23 = nov/2026 = mes 1)
  for (let mi = 1; mi <= 78; mi++) add(mi, 'out_fix_parc1', T[21 + mi].pay);          // mes mi paga a parcela 22+mi (indice 21+mi)
  for (let k = 0; k < CAM.restantes; k++) add(k + 1, 'out_fix_parc2', CAM.parcelas[k]);   // 70 parcelas restantes: meses 1..70 (convencao "10 pagas inclui a de out/2026")
  for (let k = 0; k < 12; k++) add(4 + k, 'out_fix_parc3', CRED[0].pay);
  // casa da Marina: parcelas a partir do mes 36
  FIN.L.forEach((l, k) => add(36 + k, 'out_fix_casa-marina_compra', l.pay + l.extra));
}

// ===================================================================================================
// F1. comparar fluxo esperado x observado, por chave, em todos os meses
// ===================================================================================================
function compara(chave, de, ate, tol, tolNota) {
  const pares = []; for (let mi = de; mi <= ate; mi++) pares.push([fluxo(mi, chave), ESP[mi][chave] || 0, chave + '@' + mi + ' (' + mesNome(mi) + ')']);
  return maxErr(pares);
}
const FLUXO_RES = {};
function f1(chave, de, ate, descr, tol) {
  const r = compara(chave, de, ate); FLUXO_RES[chave] = r;
  check('F-' + chave, 'Fluxo', descr || chave, 'esperado do plano x extrato.fluxo[' + chave + ']', 'meses ' + de + '..' + ate, r.m, tol || 0.01, r.w ? 'pior: ' + r.w : '');
  return r;
}
f1('in_soja', 0, 548, 'Safra de soja: 420.000 em maio ate mai/2034', 0.01);
f1('in_milho', 0, 548, 'Safrinha de milho: 150.000 em setembro ate set/2033', 0.01);
f1('in_arrendamento', 0, 548, 'Arrendamento 28.000/mes desde jun/2034 (mes 92)', 0.01);
f1('in_pas_0', 0, 548, 'INSS Osvaldo 7.000 desde o mes 92', 0.01);
f1('in_pas_1', 0, 548, 'INSS Ione 4.000 desde o mes 109', 0.01);
f1('in_pas_2', 0, 548, 'Saque do FGTS (38.000 x 1,004^mes aos 90 anos)', 0.01);
f1('in_pas_3', 0, 548, 'Carta do consorcio do caminhao menos o lance (450.000, mes 14)', 0.01);
f1('in_credito_cr1', 0, 548, 'Credito de custeio 120.000 no mes 3', 0.01);
f1('out_comp_camin', 0, 548, 'Compromisso: compra do caminhao 500.000 no mes 14', 0.01);
f1('out_venda_3', 0, 548, 'Custos da venda do lote 54.000 no mes 30', 0.01);
f1('out_obj_reforma', 0, 548, 'Gasto da reforma 90.000 no mes 12', 0.01);
f1('out_fix_marina', 0, 548, 'Marina 4.500 ate o mes 65', 0.01);
// Ione: o motor para um mes antes do cliente (rounding em paradaMi) => diferenca documentada
{
  const r = compara('in_ione', 0, 548);
  const rBase = maxErr(Array.from({ length: 548 }, (_, k) => { const mi = k + 1; return [fluxo(mi, 'in_ione'), mi <= 107 ? 6200 : 0, 'in_ione@' + mi]; }));
  check('F-in_ione', 'Fluxo', 'Salario da Ione 6.200 ate o mes 108 (60 anos em nov/2035)', 'esperado do plano x extrato', 'meses 1..548', r.m, 0.01, 'o motor paga ate o mes 107; o esperado (cliente) e ate o mes 108; ' + r.w);
  check('F-in_ione-b', 'Fluxo', 'Salario da Ione: o motor segue a regra interna "round((60-idade)*12)" (ate o mes 107)', 'regra interna reproduzida', 'meses 1..548', rBase.m, 0.01);
  FINDINGS.push({ id: 'F-IONE', mes: 108, esperado: 6200, obtido: fluxo(108, 'in_ione') });
}
// despesas pre-liberdade (ate o mes 92): saude e casa
f1('out_fix_saude', 0, 92, 'Plano de saude 3.600 (meses 0..92)', 0.01);
f1('out_adj_casa', 0, 92, 'Casa/mercado/empregados 12.900 (mes 0: 3.225; meses 1..92: 12.900)', 0.01);

// parcelas dos consorcios e do credito: comparar com o calendario do CLIENTE
{
  const r1 = compara('out_fix_parc1', 0, 548), r2 = compara('out_fix_parc2', 0, 548), r3 = compara('out_fix_parc3', 0, 548);
  check('F-parc3', 'Dividas', 'Parcela do credito de custeio = PMT exato (10.865,23) x12 (meses 4..15)', 'Price independente (120.000, 1,3%, 12)', 'meses 4..15', r3.m, 0.5, 'o plano usa 10.865 (arredondado a inteiro): diferenca ' + R2(r3.m) + '/mes; total ' + R2(12 * (CRED[0].pay - 10865)));
  const obsP1 = Array.from({ length: NMES }, (_, mi) => fluxo(mi, 'out_fix_parc1'));
  const espP1 = Array.from({ length: NMES }, (_, mi) => ESP[mi]['out_fix_parc1'] || 0);
  const sumObs1 = obsP1.reduce((a, b) => a + b, 0), sumEsp1 = espP1.reduce((a, b) => a + b, 0);
  FINDINGS.push({ id: 'PARC1', maxErr: r1.m, pior: r1.w, somaObservada: sumObs1, somaEsperada: sumEsp1 });
  check('F-parc1', 'Dividas', 'Parcelas do consorcio do trator (calendario do cliente: 22 pagas ate out/2026; reajuste depois da parcela 26)', 'tabela independente (carta x 1,18; /(100-k); +4% depois das parcelas 14,26,38...)', 'meses 1..78', r1.m, 0.01, 'DIVERGE: ' + r1.w + '; soma observada ' + R2(sumObs1) + ' x esperada ' + R2(sumEsp1));
  const obsP2 = Array.from({ length: NMES }, (_, mi) => fluxo(mi, 'out_fix_parc2')), espP2 = Array.from({ length: NMES }, (_, mi) => ESP[mi]['out_fix_parc2'] || 0);
  const sumObs2 = obsP2.reduce((a, b) => a + b, 0), sumEsp2 = espP2.reduce((a, b) => a + b, 0);
  FINDINGS.push({ id: 'PARC2', maxErr: r2.m, pior: r2.w, somaObservada: sumObs2, somaEsperada: sumEsp2 });
  check('F-parc2', 'Dividas', 'Parcelas do consorcio do caminhao (7.200 x14; 6.307,14 apos o lance)', 'tabela independente; 70 restantes = meses 1..70', 'meses 1..70', r2.m, 0.01, 'DIVERGE: ' + r2.w + '; soma observada ' + R2(sumObs2) + ' x esperada ' + R2(sumEsp2));
}
// casa da Marina: parcelas da compra financiada
{
  const r = compara('out_fix_casa-marina_compra', 0, 548);
  check('C-fin-pagto', 'Dividas', 'Parcelas do financiamento SAC da casa da Marina (350.000, 240x, 10,5% a.a.; extra 100.000 no mes 48 por prazo)', 'tabela SAC independente', 'meses 36..' + (36 + FIN.L.length - 1), r.m, 0.01, r.w || '');
}

// ===================================================================================================
// C. DIVIDAS: saldos devedores
// ===================================================================================================
// trator
{
  const dav = EXT.dividasAvulsas[0].saldo;
  const pares = []; for (let mi = 0; mi <= 100; mi++) { const j = 22 + mi; pares.push([dav[mi], mi === 0 ? T[21].saldo : (j >= 100 ? 0 : T[j - 1 + 0].saldo), 'saldo trator@' + mi]); }
  // saldo no mes mi = saldo depois da parcela 22+mi => T[21+mi].saldo ; zero a partir do mes 78
  const pares2 = []; for (let mi = 0; mi <= 100; mi++) pares2.push([dav[mi], mi <= 77 ? T[21 + mi].saldo : 0, 'saldo trator@' + mi]);
  const r = maxErr(pares2);
  check('C-trator-saldo', 'Dividas', 'Saldo devedor do consorcio do trator, mes a mes (402.030,72 hoje; zero no mes 78)', 'tabela independente do consorcio contemplado (calendario do cliente)', 'meses 0..100', r.m, 0.01, r.w || '');
  FINDINGS.push({ id: 'TRATOR-SALDO0', esperado: T[21].saldo, obtido: dav[0] });
  // quitacao
  check('C-trator-zero', 'Dividas', 'Trator quitado em zero no mes 78 (abr/2033)', 'saldo(78)=0 e saldo(77)=ultima parcela', 'mes 77,78', Math.abs(dav[78]) + Math.abs(dav[77] - T[98].saldo), 0.01);
  // reconciliacao caixa x divida (somente trator): soma das parcelas pagas no caixa deve = saldo inicial + reajustes
  const totalDevido = (() => { let s = 0; for (let k = 22; k < 100; k++) s += T[k].pay; return s; })();   // parcelas 23..100
  const caixa = Array.from({ length: NMES }, (_, mi) => fluxo(mi, 'out_fix_parc1')).reduce((a, b) => a + b, 0);
  FINDINGS.push({ id: 'TRATOR-RECON', totalDevido, caixa, diferenca: totalDevido - caixa, saldo0: T[21].saldo, reajustes: totalDevido - T[21].saldo });
  check('C-trator-recon', 'Dividas', 'Reconciliacao caixa x divida do trator: soma das parcelas debitadas = saldo de hoje + reajustes (parcelas 23..100)', 'soma(out_fix_parc1) x soma(T[22..99].pay)', '78 parcelas', totalDevido - caixa, 0.01, 'FALTAM ' + R2(totalDevido - caixa) + ' no caixa (ultima parcela nao debitada e reajustes antecipados)');
}
// credito de custeio
{
  const dets = (mi) => fim(mi).det.divs[5];
  const pares = []; for (let mi = 0; mi <= 40; mi++) { const k = mi - 3; pares.push([dets(mi), mi < 3 ? 0 : (k === 0 ? 120000 : (k > 12 ? 0 : CRED[k - 1].saldo)), 'saldo credito@' + mi]); }
  const r = maxErr(pares);
  check('C-credito-saldo', 'Dividas', 'Saldo devedor do credito de custeio (120.000 no mes 3; Price 1,3% a.m.; zero no mes 15)', 'tabela Price independente', 'meses 0..40', r.m, 0.01, r.w || '');
  const jurosTot = CRED.reduce((a, l) => a + l.juros, 0), pagoTot = CRED.reduce((a, l) => a + l.pay, 0);
  check('C-credito-juros', 'Dividas', 'Juros do credito = soma das parcelas - principal', 'tabela independente', '12 parcelas', Math.abs(pagoTot - 120000 - jurosTot), 0.01, 'juros totais ' + R2(jurosTot) + '; pago no caixa (parcelas inteiras de 10.865) ' + R2(12 * 10865));
  FINDINGS.push({ id: 'CRED', pmt: CRED[0].pay, jurosTot, pagoCaixa: 12 * 10865 });
}
// consorcio do caminhao: divida depois da contemplacao = parcelas restantes (nominal)
{
  const divTotal = mi => fim(mi).div - fim(mi).det.divs.reduce((a, b) => a + b, 0);   // o que nao esta nas dividas avulsas/bens/creditos = dividas dos consorcios
  const pares = [];
  for (let mi = 0; mi <= 100; mi++) { const esp = mi < CAM.cont ? 0 : CAM.parcelas.slice(mi + 1).reduce((a, b) => a + b, 0); pares.push([divTotal(mi), esp, 'div consorcio@' + mi]); }
  const r = maxErr(pares);
  check('C-cons-cam-div', 'Dividas', 'Divida do consorcio do caminhao apos a contemplacao (soma das parcelas que faltam; zero antes)', 'soma independente das parcelas restantes', 'meses 0..100', r.m, 0.01, r.w || '');
  FINDINGS.push({ id: 'CAM', devido: CAM.devido, fat: CAM.fat, p2: CAM.parcelas[14], divMes14: divTotal(14), divMes13: divTotal(13) });
  check('C-cons-cam-parcela', 'Dividas', 'Parcela apos o lance = 7.200 x (1 - 50.000/403.200) = 6.307,14 (proporcional)', 'formula independente', 'mes 14', Math.abs(CAM.parcelas[14] - 6307.14), 0.01);
}
// financiamento da casa: equity (bem = entrada + principal amortizado) e juros
{
  // bens - (soma dos bens individuais) - comprados = principal acumulado pago
  const pares = []; let cum = 0;
  for (let mi = 0; mi <= 548; mi++) {
    const f = fim(mi), det = f.det;
    const k = mi - 36; if (k >= 0 && k < FIN.L.length) cum += FIN.L[k].amort + FIN.L[k].extra;
    const residuo = f.bens - det.bens.reduce((a, b) => a + b, 0) - det.comprados.reduce((a, b) => a + b, 0);
    pares.push([residuo, mi >= 36 ? cum : 0, 'principal acumulado@' + mi]);
  }
  const r = maxErr(pares);
  check('C-fin-equity', 'Dividas', 'Bem financiado (casa da Marina) = entrada 150.000 + principal amortizado (parcelas + extra de 100.000)', 'tabela SAC independente; bens - bens individuais - comprados', 'meses 0..548', r.m, 0.01, r.w || '');
  const jurosTot = FIN.L.reduce((a, l) => a + l.juros, 0), princ = FIN.L.reduce((a, l) => a + l.amort + l.extra, 0), pago = FIN.L.reduce((a, l) => a + l.pay + l.extra, 0);
  const caixa = Array.from({ length: NMES }, (_, mi) => fluxo(mi, 'out_fix_casa-marina_compra')).reduce((a, b) => a + b, 0);
  check('C-fin-juros', 'Dividas', 'Casa: juros pagos = soma das parcelas - principal financiado', 'tabela SAC independente x soma do fluxo', '172 parcelas', Math.abs(caixa - pago) + Math.abs(pago - 350000 - jurosTot), 0.01, 'principal ' + R2(princ) + '; juros ' + R2(jurosTot) + '; parcelas ' + FIN.L.length);
  FINDINGS.push({ id: 'FIN', parcela1: FIN.L[0].pay, parcela12: FIN.L[12].pay, nParcelas: FIN.L.length, extra: FIN.L[12].extra, jurosTot, princ, ultimo: FIN.L[FIN.L.length - 1].pay, mesQuitacao: 36 + FIN.L.length - 1, taxaMensal: FIN.i });
  check('C-fin-p1', 'Dividas', '1a parcela SAC no mes 36 = 350.000/240 + 350.000 x 0,8355% (4.382,53)', 'formula', 'mes 36', Math.abs(fluxo(36, 'out_fix_casa-marina_compra') - (350000 / 240 + 350000 * (Math.pow(1.105, 1 / 12) - 1))), 0.01);
  check('C-fin-dif', 'Dividas', 'Financiamento da casa: tamanho exato do saldo apos amortizar 100.000 (modo prazo: parcela de amortizacao constante)', 'SAC independente', 'meses 48..', Math.abs(FIN.L[12].saldo - (350000 - 13 * 350000 / 240 - 100000)), 0.01);
  // a divida do financiamento nao aparece em div / det.divs (tratamento por "equity")
  const bensPlus = fim(36);
  FINDINGS.push({ id: 'FIN-DIV', divMes35: fim(35).div, divMes36: fim(36).div, saldoFinanciamentoMes36: FIN.L[0].saldo, bensMes35: fim(35).bens, bensMes36: fim(36).bens });
}

// ===================================================================================================
// B. BENS (e participacoes: nao ha nenhuma)
// ===================================================================================================
{
  check('B-parts', 'Participacoes', 'O plano nao tem participacoes societarias; part = 0 em todos os meses', 'varredura de fim.part e parts[]', '549 meses', Math.max(...MES.map(m => Math.abs(m.fim.part))) + EXT.parts.length + (PLANO.patrimonio.participacoes || []).length, 0);
  for (let k = 0; k < 4; k++) {
    const nome = PLANO.patrimonio.bens[k].nome;
    const serieObs = EXT.bens[k].serie, det = i => MES[i].fim.det.bens[k];
    const n = serieObs.length;
    const r1 = maxErr(Array.from({ length: n }, (_, m) => [serieObs[m], BENS_ESP[k][m], nome + '@' + m]));
    check('B-serie-' + k, 'Bens', nome + ': trajetoria de valor mes a mes', 'v0*(1+pct)^(min(m,12*anos)/12) independente', 'meses 0..' + (n - 1), r1.m, 0.01, r1.w || '');
    const lim = k === 3 ? 29 : 548;
    const r2 = maxErr(Array.from({ length: lim + 1 }, (_, m) => [det(m), BENS_ESP[k][m], nome + ' det@' + m]));
    check('B-det-' + k, 'Bens', nome + ': fim.det.bens (o que o patrimonio mostra) = trajetoria', 'idem', 'meses 0..' + lim, r2.m, 0.01, r2.w || '');
  }
  // lote vendido
  const v = EXT.bens[3].venda;
  const projetado = 600000 * Math.pow(1.08, 30 / 12), preco = 900000, custo = 54000, liq = preco - custo;
  check('B-venda-proj', 'Bens', 'Lote: valor projetado no mes 30 = 600.000 x 1,08^2,5 = 727.295,06', 'formula', 'mes 30', Math.abs(v.projetado - projetado), 0.01);
  check('B-venda-liq', 'Bens', 'Lote: preco 900.000, custos 54.000, quitacao 0, liquido 846.000', 'formula', 'mes 30', Math.abs(v.preco - preco) + Math.abs(v.custo - custo) + Math.abs(v.quitacao) + Math.abs(v.liquido - liq), 0.01);
  check('B-venda-pos', 'Bens', 'Lote: depois da venda o valor do bem e zero (det.bens[3]=0) em todos os meses >= 30', 'varredura', 'meses 30..548', Math.max(...MES.slice(30).map(m => Math.abs(m.fim.det.bens[3]))), 0);
  // fluxo da venda: bens saem, financeiro recebe
  const m30 = MES[30].fluxo;
  FINDINGS.push({ id: 'VENDA', mov_bens: m30.mov_bens, mov_cofre: m30.mov_cofre, mov_obj_casa: m30['mov_obj_casa-marina'], out_venda: m30.out_venda_3, salto: preco - projetado });
  check('B-venda-destino', 'Bens', 'Destino do liquido: 150.000 vai para a caixinha da Marina; 696.000 fica no financeiro (846.000 - 150.000)', 'contas', 'mes 30', Math.abs(m30['mov_obj_casa-marina'] - 150000) + Math.abs(EXT.eventos.find(e => e.type === 'venda').detail.indexOf('696.000') < 0 ? 1 : 0), 0.01, EXT.eventos.find(e => e.type === 'venda').detail);
  // o patrimonio no mes da venda: salto
  const pat = mi => fim(mi).fin + fim(mi).bens + fim(mi).part + fim(mi).prev - fim(mi).div;
  FINDINGS.push({ id: 'PAT-VENDA', pat29: pat(29), pat30: pat(30), delta: pat(30) - pat(29) });
  // renda ligada: a terra (arrendamento) continua; o lote nao tem renda ligada
  check('B-renda-terra', 'Bens', 'Renda ligada a terra (arrendamento) comeca no mes 92 e segue; nenhum bem vendido a interrompe', 'comparacao com plano', 'meses 0..548', FLUXO_RES['in_arrendamento'].m, 0.01);
}

// ===================================================================================================
// A. CONTABILIDADE: identidades por mes (extrato) e conservacao semanal (saida do motor)
// ===================================================================================================
// valores independentes de ativos/passivos por mes
const DIVIDA_ESP = mi => {
  let d = 0;
  d += mi <= 77 ? T[21 + mi].saldo : 0;                                                  // trator
  d += mi < 3 ? 0 : (mi === 3 ? 120000 : (mi - 3 > 12 ? 0 : CRED[mi - 4].saldo));         // credito (saldo depois da parcela do mes)
  d += mi < CAM.cont ? 0 : CAM.parcelas.slice(mi + 1).reduce((a, b) => a + b, 0);         // consorcio do caminhao
  return d;
};
const PREV_ESP = mi => {
  // FGTS 38.000 x 1,004^mi ate o saque (mes mcFgts); consorcio: 72.000 + soma das parcelas pagas antes (indices < mi) ate a contemplacao (mes 14)
  let p = mi < ESP.fgtsMes ? 38000 * Math.pow(1.004, mi) : 0;
  if (mi < CAM.cont) { let s = 72000; for (let k = 0; k < mi; k++) s += CAM.parcelas[k]; p += s; }
  return p;
};
{
  const eDiv = [], ePrev = [], eBens = [], eFin = [], ePat = [];
  let cum = 0;
  for (let mi = 0; mi < NMES; mi++) {
    const f = fim(mi);
    const k = mi - 36; if (k >= 0 && k < FIN.L.length) cum += FIN.L[k].amort + FIN.L[k].extra;
    const bensEsp = [0, 1, 2].reduce((a, i) => a + BENS_ESP[i][mi], 0) + (mi < 30 ? BENS_ESP[3][mi] : 0) + (mi >= 36 ? 150000 : 0) + cum;
    eDiv.push([f.div, DIVIDA_ESP(mi), 'div@' + mi]);
    ePrev.push([f.prev, PREV_ESP(mi), 'prev@' + mi]);
    eBens.push([f.bens, bensEsp, 'bens@' + mi]);
    eFin.push([f.fin, f.cofre + f.obj.reduce((a, b) => a + b, 0), 'fin@' + mi]);
    const patObs = f.fin + f.bens + f.part + f.prev - f.div;
    const patEsp = (f.cofre + f.obj.reduce((a, b) => a + b, 0)) + bensEsp + 0 + PREV_ESP(mi) - DIVIDA_ESP(mi);
    ePat.push([patObs, patEsp, 'pat@' + mi]);
  }
  let r;
  r = maxErr(eDiv); check('A-div', 'Contabilidade', 'Dividas totais (fim.div) = trator + credito + consorcio do caminhao (independentes)', 'tabelas independentes', '549 meses', r.m, 0.01, r.w || '');
  r = maxErr(ePrev); check('A-prev', 'Contabilidade', 'Previdencia/FGTS/consorcio nao contemplado (fim.prev) = FGTS x 1,004^m + 72.000 + parcelas pagas', 'serie independente', '549 meses', r.m, 0.01, r.w || '');
  r = maxErr(eBens); check('A-bens', 'Contabilidade', 'Bens totais = 4 bens + entrada 150.000 + principal amortizado, sem o lote vendido', 'series independentes', '549 meses', r.m, 0.01, r.w || '');
  r = maxErr(eFin); check('A-fin', 'Contabilidade', 'Financeiro = reserva + caixinhas', 'soma', '549 meses', r.m, 0.0001);
  r = maxErr(ePat); check('A-pat', 'Contabilidade', 'Patrimonio = financeiro + bens + participacoes + previdencia - dividas (componentes independentes)', 'identidade com series independentes', '549 meses', r.m, 0.01, r.w || '');
  // NaN e sinais
  let nan = 0, neg = 0;
  MES.forEach(m => { const f = m.fim; [f.fin, f.cofre, f.bens, f.part, f.prev, f.div, f.cheque, ...f.obj, ...f.det.bens, ...f.det.divs].forEach(v => { if (!Number.isFinite(v)) nan++; }); [f.bens, f.part, f.prev, f.div, f.cheque, ...f.obj, ...f.det.bens, ...f.det.divs].forEach(v => { if (v < -0.005) neg++; }); Object.values(m.fluxo).forEach(v => { if (!Number.isFinite(v)) nan++; }); });
  check('A-nan', 'Contabilidade', 'Sem NaN/Infinity em nenhum campo', 'varredura', '549 meses', nan, 0);
  check('A-sinal', 'Contabilidade', 'Sinais: bens, dividas, caixinhas, previdencia, cheque nunca negativos (so o financeiro livre pode ficar negativo = divida da reserva)', 'varredura', '549 meses', neg, 0);
  check('A-cheque', 'Contabilidade', 'cheque = max(0, -reserva) em todo mes', 'varredura', '549 meses', Math.max(...MES.map(m => Math.abs(m.fim.cheque - Math.max(0, -m.fim.cofre)))), 0.0001);
}
// conservacao semanal
let SEMANAL = {};
{
  const GW = Math.pow(1.004, 7 / 30.4375);
  let eCofre = 0, eMov = 0, eFinMax = 0, nWeeks = 0, wCofre = '', wMov = '';
  let minCofre = Infinity;
  for (let i = W0 + 1; i < NW; i++) {
    const a = W[i - 1], b = W[i], f = b.f;
    // mov_* so-balanco
    let movObj = 0, movBens = f.mov_bens || 0, movCofre = f.mov_cofre || 0, R = 0;
    for (const k in f) { if (k.startsWith('mov_obj_')) movObj += f[k]; if (k.startsWith('in_')) R += f[k]; else if (k.startsWith('out_')) R -= f[k]; }
    const e1 = Math.abs((movCofre + movObj + movBens) - R);    // transferencias somam zero
    if (e1 > eMov) { eMov = e1; wMov = 'sem ' + i; }
    // cofre(i) = cofre(i-1)*GW (se > 0) + mov_cofre   (o motor zera "centavos" negativos pequenos)
    const base = a.cofre > 0 ? a.cofre * GW : a.cofre;
    const e2 = Math.abs(b.cofre - (base + movCofre));
    if (e2 > eCofre) { eCofre = e2; wCofre = 'sem ' + i + ' (mes ' + b.mi + ')'; }
    eFinMax = Math.max(eFinMax, Math.abs(b.fin - (b.cofre + b.obj.reduce((x, y) => x + y, 0))));
    minCofre = Math.min(minCofre, b.cofre); nWeeks++;
  }
  SEMANAL = { nWeeks, eCofre, eMov, eFinMax, wCofre, wMov, minCofre };
  check('A-conserv-transf', 'Contabilidade', 'Conservacao: em toda semana, mov_cofre + mov_obj + mov_bens = entradas - saidas (transferencias somam zero)', 'varredura semanal do fluxo observado', nWeeks + ' semanas', eMov, 0.01, wMov);
  check('E-cofre', 'Rendimento', 'Reserva: cofre(i) = cofre(i-1) x (1,004)^(7/30,4375) [se > 0] + movimento da semana', 'recursao semanal independente (rendimento sobre o saldo de abertura da semana)', nWeeks + ' semanas', eCofre, 0.01, wCofre);
  check('A-fin-sem', 'Contabilidade', 'fin = cofre + caixinhas em toda semana', 'varredura', nWeeks + ' semanas', eFinMax, 0.0001);
}

// ===================================================================================================
// D. CAIXINHAS
// ===================================================================================================
const OBJS = PLANO.objectives;
const PROF = PLANO.profiles;
function taxaEsperada(o, mi) {        // regra de dominio: nos ultimos 24 meses antes da data, conservadora; antes, a escolhida; objetivo < 24 meses ja conservador
  const base = o.rateM != null && o.rateM !== '' ? +o.rateM : PROF[o.profile], cons = Math.min(base, PROF.conservador);
  const t = Math.max(0, o.months - 24);
  return mi >= t ? cons : base;
}
const SEMANAL_OBJ = [];
{
  const g = Math.pow(1, 0);
  OBJS.forEach((o, k) => {
    let eEng = 0, eNom = 0, wEng = '', wNom = '', impLag = 0, ultimo = 0;
    const trocaMes = Math.max(0, o.months - 24);
    for (let i = W0 + 1; i < NW; i++) {
      const a = W[i - 1], b = W[i];
      const mov = b.f['mov_obj_' + o.id] || 0;
      const prevBal = a.obj[k];
      // taxa conforme o motor aplica: a do mes da semana ANTERIOR (o crescimento da semana vem antes do contexto do mes ser atualizado)
      const miEng = a.mi >= 0 ? a.mi : 0, miNom = b.mi;
      const fEng = Math.pow(1 + taxaEsperada(o, miEng), 7 / 30.4375), fNom = Math.pow(1 + taxaEsperada(o, miNom), 7 / 30.4375);
      const dEng = Math.abs(b.obj[k] - (prevBal * fEng + mov)), dNom = Math.abs(b.obj[k] - (prevBal * fNom + mov));
      if (dEng > eEng) { eEng = dEng; wEng = 'sem ' + i + ' mes ' + b.mi; }
      if (dNom > eNom) { eNom = dNom; wNom = 'sem ' + i + ' mes ' + b.mi; }
      impLag += prevBal * (fNom - fEng);       // quanto a regra "nominal do mes" daria a mais/menos nesta semana
    }
    SEMANAL_OBJ.push({ id: o.id, eEng, eNom, wEng, wNom, impLag, trocaMes });
    check('D-sem-' + o.id, 'Caixinhas', 'Caixinha "' + o.name + '": saldo(i) = saldo(i-1) x (1+r)^(7/30,4375) + aportes, com r = taxa pelas regras do dominio (convencao: mes da semana anterior)', 'recursao semanal independente sobre os aportes observados (mov_obj)', (NW - W0 - 1) + ' semanas', eEng, 0.01, wEng);
    check('D-nom-' + o.id, 'Caixinhas', 'Caixinha "' + o.name + '": mesma recursao usando a taxa do PROPRIO mes da semana (regra nominal)', 'idem, taxa do mes da propria semana', (NW - W0 - 1) + ' semanas', eNom, 0.01, 'efeito de atraso de 1 semana na troca de taxa: ' + R2(eNom) + ' no pior ponto; acumulado ' + R2(impLag) + '; ' + wNom);
  });
}
// taxaPorMes do extrato x esperado
{
  EXT.objetivos.forEach((eo, k) => {
    const o = OBJS[k];
    const r = maxErr(eo.taxaPorMes.map((t, mi) => [t, taxaEsperada(o, mi), eo.name + ' taxa@' + mi]));
    check('D-taxa-' + eo.id, 'Caixinhas', 'taxaPorMes de "' + eo.name + '" = regra (' + o.profile + ' antes do mes ' + Math.max(0, o.months - 24) + '; conservadora depois)', 'regra independente + PROFILES do plano', eo.taxaPorMes.length + ' meses', r.m, 1e-12, r.w || '');
  });
  const pr = EXT.PROFILES;
  check('D-profiles', 'Caixinhas', 'PROFILES do motor = perfis do plano (0,4% / 0,5% / 0,6% ao mes)', 'comparacao', '3 perfis', Math.abs(pr.conservador - 0.004) + Math.abs(pr.moderado - 0.005) + Math.abs(pr.agressivo - 0.006), 1e-12);
  // troca de taxa no mes exato
  const trocas = EXT.objetivos.map(eo => { const t = eo.taxaPorMes; let m = null; for (let i = 1; i < t.length; i++) if (t[i] !== t[i - 1]) { m = i; break; } return { id: eo.id, mesTroca: m, esperado: Math.max(0, eo.months - 24) || null }; });
  FINDINGS.push({ id: 'TROCAS', trocas });
  check('D-troca', 'Caixinhas', 'Mes exato da troca moderado->conservador da casa da Marina (36-24=12); reforma ja nasce conservadora (12<24)', 'taxaPorMes', '2 objetivos', trocas.reduce((a, t) => a + (t.mesTroca === (t.esperado || null) ? 0 : 1), 0), 0);
}
// impacto de uma so taxa: caixinha da Marina (150.000 entra no mes 30) e reforma (aportada no mes 7)
{
  const semanasEntre = (a, b) => { let n = 0; for (let i = 0; i < NW; i++) if (W[i].mi >= a && W[i].mi < b) n++; return n; };
  // casa da Marina: mov entra na semana do mes 30; cresce ate o mes 36
  const iVenda = W.findIndex(w => w.f && w.f['mov_obj_casa-marina'] > 1), iReal = W.findIndex((w, i) => i > iVenda && (w.f['mov_obj_casa-marina'] || 0) < -1);
  const nSem = iReal - iVenda;
  const sCons = 150000 * Math.pow(1.004, nSem * 7 / 30.4375), sMod = 150000 * Math.pow(1.005, nSem * 7 / 30.4375), sAgr = 150000 * Math.pow(1.006, nSem * 7 / 30.4375);
  const obsReal = -W[iReal].f['mov_obj_casa-marina'];
  FINDINGS.push({ id: 'IMP-CASA', semanas: nSem, saldoObservado: obsReal, conservador: sCons, moderado: sMod, agressivo: sAgr, difMod: sMod - obsReal, difAgr: sAgr - obsReal, mesIni: W[iVenda].mi, mesFim: W[iReal].mi });
  check('D-casa-valor', 'Caixinhas', 'Casa da Marina: 150.000 x 1,004^(semanas x 7/30,4375) entre venda e data = saldo sacado', 'recursao independente', nSem + ' semanas', Math.abs(obsReal - sCons), 0.01, 'esperado ' + R2(sCons) + ' observado ' + R2(obsReal) + '; fechada mensal 150.000 x 1,004^6 = ' + R2(150000 * Math.pow(1.004, 6)));
  // reforma: deposito no mes 7 e saque no mes 12
  const iDep = W.findIndex(w => w.f && w.f['mov_obj_reforma'] > 1), iSaq = W.findIndex((w, i) => i > iDep && (w.f['mov_obj_reforma'] || 0) < -1);
  const dep = W[iDep].f['mov_obj_reforma'], nS2 = iSaq - iDep;
  const cons = dep * Math.pow(1.004, nS2 * 7 / 30.4375), agr = dep * Math.pow(1.006, nS2 * 7 / 30.4375), mod = dep * Math.pow(1.005, nS2 * 7 / 30.4375);
  const obsSaq = -W[iSaq].f['mov_obj_reforma'];
  FINDINGS.push({ id: 'IMP-REFORMA', deposito: dep, semanas: nS2, saqueObservado: obsSaq, conservador: cons, moderado: mod, agressivo: agr, mesDep: W[iDep].mi, mesSaq: W[iSaq].mi });
  check('D-reforma-valor', 'Caixinhas', 'Reforma: deposito do mes 7 rendendo a 0,4% (conservadora, pois 12 < 24 meses) ate o saque do mes 12', 'recursao independente', nS2 + ' semanas', Math.abs(obsSaq - cons), 0.01, 'esperado ' + R2(cons) + ' observado ' + R2(obsSaq));
  // regra "para quando basta": o aporte da reforma deve fazer o saldo na data >= 90.000 e <= 90.000 x 1,0101 (margem de 1% do desenho)
  const folga = obsSaq / 90000 - 1;
  FINDINGS.push({ id: 'REFORMA-FOLGA', obsSaq, folga, excedente: obsSaq - 90000, depositoMinimoExato: 90000 / Math.pow(1.004, nS2 * 7 / 30.4375) });
  check('D-reforma-basta', 'Caixinhas', 'Reforma: caixinha cobre os 90.000 na data e o excedente fica em ate ~1% (margem do desenho)', 'comparacao com 90.000', 'mes 12', Math.max(0, 90000 - obsSaq) + Math.max(0, folga - 0.0101), 1e-9, 'excedente ' + R2(obsSaq - 90000) + ' (' + (folga * 100).toFixed(3) + '%)');
  // sem aportes mensais depois de a caixinha bastar: nenhuma outra entrada em mov_obj_reforma
  const aportes = []; for (let mi = 0; mi < 12; mi++) { const v = fluxo(mi, 'mov_obj_reforma'); if (v > 0.005) aportes.push([mi, v]); }
  FINDINGS.push({ id: 'REFORMA-APORTES', aportes });
  const casaAportes = []; for (let mi = 0; mi < 36; mi++) { const v = fluxo(mi, 'mov_obj_casa-marina'); if (Math.abs(v) > 0.005) casaAportes.push([mi, v]); }
  FINDINGS.push({ id: 'CASA-APORTES', casaAportes });
  check('D-casa-sem-aporte', 'Caixinhas', 'Casa da Marina: sem aporte mensal (so a venda de 150.000 no mes 30; 153.636 > 150.000)', 'varredura de mov_obj', 'meses 0..35', casaAportes.length === 1 && casaAportes[0][0] === 30 ? 0 : 1, 0);
  // caixinha da Marina na data: saque, bem comprado, saldo restante devolvido
  const m36 = MES[36].fluxo;
  FINDINGS.push({ id: 'CASA-DATA', mov_obj: m36['mov_obj_casa-marina'], mov_bens: m36.mov_bens, mov_cofre: m36.mov_cofre, parc: m36['out_fix_casa-marina_compra'] });
  check('D-casa-compra', 'Caixinhas', 'Na data (mes 36): caixinha volta ao financeiro (153.623,60), bem entra por 150.000 (so a entrada), e o excedente (3.623,60) fica livre', 'balanco do mes 36', 'mes 36', Math.abs(m36['mov_obj_casa-marina'] + obsReal) + Math.abs(fim(36).det.comprados[1] - 150000), 0.01);
}
// janela de 24 meses: troca no mes exato com saldo: casa da Marina so tem saldo a partir do mes 30 (conservadora)
{
  const m = OBJS[1].months - 24;
  const saldoAntes = Math.max(...MES.slice(0, m).map(x => x.fim.obj[1]));
  FINDINGS.push({ id: 'CASA-SALDO-ANTES-TROCA', saldoMax: saldoAntes, mesTroca: m });
  check('D-casa-troca-sem-saldo', 'Caixinhas', 'Casa da Marina: saldo da caixinha antes da troca de taxa (meses 0..11) = 0 => a taxa "moderado" nunca rendeu dinheiro algum', 'varredura', 'meses 0..11', saldoAntes, 0.005);
}

// ===================================================================================================
// E. rendimento: convencao e taxa efetiva
// ===================================================================================================
{
  const g = Math.pow(1.004, 7 / 30.4375);
  const anual = Math.pow(g, 365.25 / 7) - 1;
  FINDINGS.push({ id: 'RM', anualEfetiva: anual, mensal: 0.004, semanal: g - 1 });
  check('E-taxa-anual', 'Rendimento', 'Taxa semanal composta equivale a 0,4% ao mes (4,91% a.a. real): (g^(365,25/7)) = 1,004^12', 'conta', '-', Math.abs(anual - (Math.pow(1.004, 12) - 1)), 1e-9);
  // juros de divida: 4% ao mes sobre a reserva negativa do fim do mes anterior
  const pares = []; for (let mi = 1; mi < NMES; mi++) { const c = fim(mi - 1).cofre; const esp = c < -0.5 ? -c * 0.04 : 0; pares.push([fluxo(mi, 'out_juros'), esp, 'juros@' + mi]); }
  const r = maxErr(pares);
  check('E-juros-reserva-negativa', 'Rendimento', 'Juros de 4% a.m. sobre a reserva negativa do fim do mes anterior (meses 3 e 7 e outros)', 'recalculo mes a mes', '548 meses', r.m, 0.01, r.w || '');
  const mesesNeg = MES.filter(m => m.fim.cofre < -0.5).map(m => m.mi);
  FINDINGS.push({ id: 'NEG', mesesNeg, cofreMin: Math.min(...MES.map(m => m.fim.cofre)), juros: MES.map(m => fluxo(m.mi, 'out_juros')).reduce((a, b) => a + b, 0) });
  // ruina: primeiro mes que fecha negativo
  const primeiroNeg = mesesNeg[0];
  check('G-ruina', 'Liberdade', 'Ruina dispara no primeiro mes que fecha com a reserva negativa (mes 2, dez/2026)', 'varredura', '-', Math.abs(S.ruina.mi - primeiroNeg), 0, 'motor: mes ' + S.ruina.mi + '; primeiro mes negativo: ' + primeiroNeg);
  FINDINGS.push({ id: 'RUINA', ruina: S.ruina, mesesNeg });
}

// ===================================================================================================
// G. LIBERDADE FINANCEIRA e despesas escaladas
// ===================================================================================================
{
  const ff = S.ff;
  // idade do Osvaldo (nascido 1972-06-01), hoje 2026-10-19
  const idadeHoje = (new Date(2026, 9, 19) - new Date(1972, 5, 1)) / (365.25 * 864e5);
  const aos62Mes = (62 - idadeHoje) * 12;
  FINDINGS.push({ id: 'FF', mi: ff.mi, age: ff.age, finBefore: ff.finBefore, maxGap: ff.maxGap, forced: ff.forced, aos62Mes, idadeHoje });
  check('G-ff-mes', 'Liberdade', 'Liberdade financeira no mes em que Osvaldo faz 62 (jun/2034 = mes 92; o motor so avalia no inicio do ciclo e marca o mes 93)', 'idade exata (62-54,38)*12 = 91,4 meses', '-', ff.mi - 92, 1, 'defasagem de ' + (ff.mi - 92) + ' mes');
  const finMes = fim(ff.mi - 1).fin;
  check('G-ff-sustenta', 'Liberdade', 'Patrimonio financeiro no mes 93 sustenta a renda desejada (20.000): rendas passivas (INSS 7.000 + arrendamento 28.000 + salario Ione 6.200) ja passam de 20.000 => maxGap = 0, forced = false', 'conta', '-', Math.abs(ff.maxGap) + (ff.forced ? 1 : 0), 0.0001);
  // despesas escaladas apos a liberdade
  const pares = [];
  for (let mi = 93; mi < NMES - 1; mi++) {
    const m = MES[mi]; let ent = 0, sai = 0, compra = 0;
    for (const k in m.fluxo) { if (k.startsWith('in_')) ent += m.fluxo[k]; else if (k.startsWith('out_') && k !== 'out_fix_casa-marina_compra') sai += m.fluxo[k]; else if (k === 'out_fix_casa-marina_compra') compra += m.fluxo[k]; }
    pares.push([sai + compra, ent, 'mes ' + mi]);
  }
  const r = maxErr(pares);
  const pos93 = (() => { const m = MES[93].fluxo; return { saude: m.out_fix_saude, casa: m.out_adj_casa, compra: m['out_fix_casa-marina_compra'] || 0 }; })();
  const gastoCliente = 3600 + 12900;      // sem Marina (zerada desde o mes 66)
  FINDINGS.push({ id: 'ESCALA', pos93, escala: pos93.saude / 3600, gastoClienteMes93: gastoCliente, gastoMotorMes93: pos93.saude + pos93.casa, gastoTotalMes93: pos93.saude + pos93.casa + pos93.compra, rendaDesejada: 20000, entradasMes93: Object.entries(MES[93].fluxo).filter(([k]) => k.startsWith('in_')).reduce((a, [, v]) => a + v, 0) });
  check('G-escala-regra', 'Liberdade', 'Apos a liberdade o motor gasta TODA a renda: saidas = entradas em cada mes (padrao de vida escalado)', 'saidas - entradas, meses 93..548', 'meses 93..547 (o 548 e a semana final do horizonte, parcial)', r.m, 1.0, 'maior desvio mensal ' + (r.w || '') + ' (arredondamentos semanais)');
  // quanto a mais gasta por mes versus o que o cliente declarou
  let extra = 0, n = 0, soma = 0;
  for (let mi = 93; mi < NMES - 1; mi++) { const m = MES[mi].fluxo; const g = (m.out_fix_saude || 0) + (m.out_adj_casa || 0); extra += g - gastoCliente; n++; soma += g; }
  FINDINGS.push({ id: 'ESCALA-TOTAL', meses: n, extraTotalVsCliente: extra, mediaMensalMotor: soma / n });
  // distorcao: patrimonio financeiro final com e sem escala (aproximacao em valor presente simples nao refeita aqui: apenas o gasto acumulado a mais)
}

// ===================================================================================================
// G2. Liberdade financeira: reproducao independente do mes e do valor
// ===================================================================================================
{
  const ff = S.ff;
  // semana i do motor: data = nascimento + 7 i dias; idade = i / (365,25/7). Osvaldo: 1972-06-01.
  const nasc = new Date(1972, 5, 1), WPY = 365.25 / 7;
  const dataSem = i => new Date(nasc.getTime() + i * 7 * 864e5);
  const temDia5 = i => { for (let k = 0; k < 7; k++) { if (new Date(dataSem(i).getTime() + k * 864e5).getDate() === 5) return true; } return false; };
  let primeira = null; for (let i = Math.floor(62 * WPY) - 8; i < Math.floor(62 * WPY) + 12; i++) { if (temDia5(i) && i / WPY >= 62) { primeira = i; break; } }
  const semAniv = Math.round((new Date(2034, 5, 1) - nasc) / 864e5 / 7);   // semana em que cai o 62o aniversario real
  FINDINGS.push({ id: 'FF-SEMANA', primeiraSemanaPelaRegra: primeira, semanaDoMotor: ff.week, semanaDoAniversarioReal: semAniv, idadeNaSemanaDoAniversario: semAniv / WPY });
  check('G-ff-semana', 'Liberdade', 'Semana da liberdade = primeira semana com dia 5 em que idade (semanas/52,18) >= 62', 'regra reproduzida (idade 62 do titular; Ione 63,4)', '1 evento', Math.abs(primeira - ff.week), 0);
  // finBefore = patrimonio financeiro da semana anterior capitalizado uma semana
  const GWk = Math.pow(1.004, 7 / 30.4375), a = W[ff.week - 1];
  const esp = a.cofre * GWk + a.obj.reduce((x, y) => x + y * GWk, 0);
  check('G-ff-fin', 'Liberdade', 'finBefore da liberdade = financeiro da semana anterior x 1,004^(7/30,4375)', 'recalculo', '1 evento', Math.abs(ff.finBefore - esp), 0.01, 'motor ' + R2(ff.finBefore) + ' esperado ' + R2(esp));
  check('G-ff-forced', 'Liberdade', 'forced=false (sustenta: financeiro x 0,4% >= maxGap=0) e sustentavel positivo', 'conta', '-', (ff.forced ? 1 : 0) + (ff.sustentavel > 0 ? 0 : 1), 0, 'sustentavel (R$/mes) ' + R2(ff.sustentavel));
  const hor = Math.round((90 - ff.age) * 12), pmtEsp = ff.finAfter * 0.004 / (1 - Math.pow(1.004, -hor));
  check('G-ff-sustentavel', 'Liberdade', 'ff.sustentavel = patrimonio x 0,4% + (renda desejada - maxGap) = 3.090.212 x 0,004 + 20.000', 'conta', '1 evento', Math.abs(ff.sustentavel - (ff.finAfter * 0.004 + 20000 - ff.maxGap)), 0.01, 'R$ ' + R2(ff.sustentavel) + '/mes');
  check('G-ff-pmt', 'Liberdade', 'ff.pmt = PMT do patrimonio por (90 - idade) x 12 meses a 0,4% (so informativo no modo "renda desejada")', 'Price independente', '1 evento', Math.abs(ff.pmt - pmtEsp), 5, 'motor ' + R2(ff.pmt) + ' x ' + R2(pmtEsp) + ' (' + hor + ' meses)');
  const m92 = MES[92].fluxo, m93 = MES[93].fluxo;
  FINDINGS.push({ id: 'FF-IMPACTO-UM-MES', gastoMes92: (m92.out_fix_saude || 0) + (m92.out_adj_casa || 0), gastoMes93: (m93.out_fix_saude || 0) + (m93.out_adj_casa || 0) });
  // saldo financeiro em liberdade: so rendimento
  let i0 = null; for (let i = 0; i < NW; i++) if (W[i].mi === 94) { i0 = i; break; }
  let cof = W[i0 - 1].cofre; for (let i = i0; i < NW; i++) { if (W[i].mi > 547) break; cof = cof * GWk; }
  FINDINGS.push({ id: 'FF-CRESCIMENTO', f93: fim(93).fin, f547: fim(547).fin, projecaoPuraJuros: cof });
  check('G-ff-juros-puros', 'Liberdade', 'Apos a liberdade o financeiro so cresce pelo rendimento de 0,4%/mes (nada e poupado nem retirado; o saque do FGTS aos 90 anos tambem e todo gasto no mes): 3,10 mi => ~19 mi', 'recursao semanal sem fluxos liquidos', 'meses 94..547', Math.abs(cof - fim(547).cofre) / fim(547).cofre, 0.005, 'projecao ' + R2(cof) + ' x motor ' + R2(fim(547).cofre) + ' (a diferenca vem da ordem dentro do mes: a renda cai no dia 5 e o gasto se dilui nas 4 semanas)');
}

// ===================================================================================================
// H. Fidelidade ao cliente (valores esperados do cenario x motor)
// ===================================================================================================
const FID = [];
function fid(nome, esp, obs, tol, nota) { const e = Math.abs(esp - obs); FID.push({ nome, esp, obs, e, ok: e <= tol, nota: nota || '' }); check('H-' + FID.length, 'Fidelidade', nome, 'valor do cenario/dominio x motor', '1 ponto', e, tol, nota); }
{
  fid('Parcela Price do credito de custeio (R$ 10.865)', 10865, fluxo(4, 'out_fix_parc3'), 0.5);
  fid('Credito entra como entrada de caixa no mes 3 (120.000)', 120000, fluxo(3, 'in_credito_cr1'), 0.01);
  fid('Saldo do trator hoje (R$ 402.031)', 402031, EXT.dividasAvulsas[0].saldo[0], 0.5);
  fid('Parcela atual do trator (R$ 5.154,24)', 5154.24, fluxo(1, 'out_fix_parc1'), 0.01);
  fid('Parcela do trator apos o 1o reajuste (R$ 5.360,41), no calendario do cliente: mes 5', 5360.41, fluxo(5, 'out_fix_parc1'), 0.01, 'o motor ja a cobra no mes 4');
  fid('Ultima parcela do trator (R$ 6.782,63), no mes 78', 6782.63, fluxo(78, 'out_fix_parc1'), 0.01, 'nao e debitada no caixa');
  fid('Valor projetado do lote no mes 30 (R$ 727.295)', 727295, EXT.bens[3].venda.projetado, 0.5);
  fid('Liquido da venda do lote (R$ 846.000)', 846000, EXT.bens[3].venda.liquido, 0.01);
  fid('Caixinha da Marina na data (R$ 153.636 no cenario)', 153636, -fluxo(36, 'mov_obj_casa-marina'), 15, 'cenario usa 1,004^6 mensal; o motor capitaliza por semana (26 semanas = 5,98 meses): 153.623,60');
  fid('1a parcela SAC da casa (R$ 4.383)', 4383, fluxo(36, 'out_fix_casa-marina_compra'), 0.5);
  fid('Amortizacao fixa SAC (R$ 1.458,33)', 1458.33, FIN.L[0].amort, 0.01);
  fid('Parcela da casa no mes 48 com a amortizacao de 100.000 (R$ 104.236 citado pelo consultor)', 104236, fluxo(48, 'out_fix_casa-marina_compra'), 1);
  fid('Maquinas em 5 anos: 900.000 x 0,9^5 = 531.441', 531441, MES[60].fim.det.bens[1], 0.01);
  fid('Terra em 10 anos: 4.200.000 x 1,04^10 = 6.217.026', 6217026, MES[120].fim.det.bens[0], 1);
  fid('Reforma: necessario R$ 7.336/mes (90.000/12,2676)', 7336, EXT.objetivos[0].required, 1, 'texto do cartao do objetivo (nao usado na simulacao: a safra paga)');
  fid('Liberdade financeira aos 62 anos', 62, S.ff.age, 0.2);
}

// ===================================================================================================
// I. IMPACTOS por reexecucao do motor com a linha corrigida (so dimensiona o efeito; nao e o "esperado")
// ===================================================================================================
const IMPACTO = {};
function rodaPlano(P) { const E2 = H.carregar(); return H.extrato({ dados: P }, E2); }
const patDe = (x, mi) => { const f = x.meses[mi].fim; return f.fin + f.bens + f.part + f.prev - f.div; };
{
  const P1 = JSON.parse(JSON.stringify(PLANO));
  const passo = f => { let ult = null; const st = []; for (let mi = 0; mi < 120; mi++) { const v = Math.round(f(mi) * 100) / 100; if (ult === null || Math.abs(v - ult) >= 0.005) { st.push({ from: mi, value: v }); ult = v; } } return st; };
  P1.expenses.find(e => e.id === 'parc1').steps = passo(mi => mi >= 1 && mi <= 78 ? T[21 + mi].pay : (mi === 0 ? T[21].pay : 0));
  P1.expenses.push({ id: 'extra-cam', label: 'Parcela do caminhao nao debitada (out/2026)', group: 'fix', frequency: 'pontual', days: [10], steps: [{ from: 1, value: 7200 }] });
  const x1 = rodaPlano(P1);
  IMPACTO.parcelas = [3, 12, 24, 48, 78, 93, 200, 400, 547].map(mi => ({ mi, base: patDe(EXT, mi), corrigido: patDe(x1, mi), dif: patDe(x1, mi) - patDe(EXT, mi) }));
  IMPACTO.ffParcelas = { ffBase: S.ff.mi, ffCorr: x1.ff && x1.ff.mi };
  IMPACTO.ione = [108, 120, 300, 547].map(mi => ({ mi, dif: 6200 * Math.pow(1.004, mi - 108) }));   // 6.200 nao recebidos no mes 108, capitalizados a 0,4%/mes (o motor bloqueia a renda ativa depois de paradaMi, entao nao da para simular com exc)
}

// ===================================================================================================
// J. TESTES DE ESTRESSE (planos sinteticos; as regras de participacao, de taxa por prazo e de IOF nao aparecem no cenario 08)
// ===================================================================================================
function planoBase() {
  const P = JSON.parse(JSON.stringify(PLANO));
  P.tipo = 'individual'; delete P.conjugeNome; delete P.conjugeNascimento; delete P.spouseAge; delete P.spouseRetireAge; delete P.riscos;
  P.nascimento = '1980-03'; P.age = 46; P.retireAge = 70; P.lifeExp = 95; P.desired = 8000; P.desiredSteps = [];
  P.incomes = [{ id: 'sal', label: 'Salario', kind: 'ativa', origin: 'Salário', gross: 30000, frequency: 'mensal', pessoa: 'titular', days: [5], taxable: true, steps: [{ from: 0, value: 30000 }] }];
  P.expenses = [{ id: 'vida', label: 'Vida', group: 'adj', week: 0, steps: [{ from: 0, value: 10000 }] }];
  P.passive = []; P.creditos = []; P.compromissos = []; P.objectives = [];
  P.patrimonio = { financeiro: [{ nome: 'Aplic', valor: 300000 }], participacoes: [], bens: [], dividas: [] };
  return P;
}
const STRESS = [];
function st(id, o, metodo, amostra, err, tol, nota) { STRESS.push({ id, o, err, tol, ok: err <= tol, nota: nota || '' }); check('J-' + id, 'Estresse', o, metodo, amostra, err, tol, nota); }
{
  const P = planoBase();
  const mkp = (nome, valor, val, venda) => ({ nome, valor, valorizacao: val, venda });
  P.patrimonio.participacoes = [
    mkp('P1 taxa 12% por 5 anos', 200000, [{ tipo: 'taxa', pct: 12, de: 0, anos: 5 }]),
    mkp('P2 alvo 500.000 no mes 36', 200000, [{ tipo: 'alvo', em: 36, valor: 500000 }]),
    mkp('P3 pontuais +25% (m10), queda a zero (m20), -5.000 (m30)', 100000, [{ tipo: 'pontual', em: 10, pct: 25 }, { tipo: 'pontual', em: 20, pct: -100 }, { tipo: 'pontual', em: 30, valor: -5000 }]),
    mkp('P4 venda no mes 24 por 420.000 (custos 2% + 1.000)', 300000, [{ tipo: 'taxa', pct: 5, de: 0, anos: 10 }], { em: 24, preco: 420000, custos: [{ nome: 'corretagem', pct: 2 }, { nome: 'taxa', valor: 1000 }] }),
    mkp('P5 alvo 100.000 no mes 24 e taxa -8% depois', 250000, [{ tipo: 'alvo', em: 24, valor: 100000 }, { tipo: 'taxa', pct: -8, de: 24, anos: 3 }]),
    mkp('P6 alvo 300.000 no mes 12 + pontual +50.000 no mes 6 (ritmo refeito)', 100000, [{ tipo: 'alvo', em: 12, valor: 300000 }, { tipo: 'pontual', em: 6, valor: 50000 }])
  ];
  const x = rodaPlano(P);
  const n = x.meses.length;
  const esp = [];
  esp[0] = Array.from({ length: n }, (_, m) => 200000 * Math.pow(1.12, Math.min(m, 60) / 12));
  esp[1] = Array.from({ length: n }, (_, m) => m <= 36 ? 200000 * Math.pow(500000 / 200000, m / 36) : 500000);
  esp[2] = (() => { const s = [100000]; let v = 100000; for (let m = 1; m < n; m++) { if (m === 10) v *= 1.25; if (m === 20) v = 0; if (m === 30) v = Math.max(0, v - 5000); s.push(v); } return s; })();
  esp[3] = Array.from({ length: n }, (_, m) => m <= 24 ? 300000 * Math.pow(420000 / 300000, m / 24) : 0);   // o preco de venda e o alvo do mes 24
  esp[4] = Array.from({ length: n }, (_, m) => m <= 24 ? 250000 * Math.pow(100000 / 250000, m / 24) : 100000 * Math.pow(0.92, Math.min(m - 24, 36) / 12));
  esp[5] = (() => { const s = [100000]; let v = 100000; for (let m = 1; m < n; m++) { if (m <= 12) v = v * Math.pow(300000 / v, 1 / (12 - m + 1)); if (m === 6) v += 50000; s.push(v); } return s; })();
  const nomes = P.patrimonio.participacoes.map(p => p.nome);
  esp.forEach((e, k) => {
    const lim = k === 3 ? 23 : n - 1;
    const ser = x.parts[k].serie, nn = k === 3 ? 25 : ser.length;
    const r1 = maxErr(Array.from({ length: nn }, (_, m) => [ser[m], e[m], nomes[k] + '@' + m]));
    st('part' + (k + 1) + '-serie', nomes[k] + ': serie mensal da trajetoria', 'serie independente x parts[].serie', 'meses 0..' + (nn - 1), r1.m, 0.01, r1.w || '');
    const r2 = maxErr(Array.from({ length: lim + 1 }, (_, m) => [x.meses[m].fim.det.parts[k], e[m], nomes[k] + ' det@' + m]));
    st('part' + (k + 1) + '-det', nomes[k] + ': det.parts do patrimonio', 'idem', 'meses 0..' + lim, r2.m, 0.01, r2.w || '');
  });
  const rp = maxErr(Array.from({ length: 24 }, (_, m) => [x.meses[m].fim.part, [0, 1, 2, 3, 4, 5].reduce((a, k) => a + esp[k][m], 0), 'part total@' + m]));
  st('part-total', 'fim.part = soma das participacoes (meses 0..23)', 'soma independente', 'meses 0..23', rp.m, 0.01, rp.w || '');
  const v = x.parts[3].venda, custo = 420000 * 0.02 + 1000;
  st('part4-venda', 'P4: preco 420.000, custos 9.400, liquido 410.600, sem quitacao, no mes 24', 'contas', 'mes 24', Math.abs(v.preco - 420000) + Math.abs(v.custo - custo) + Math.abs(v.liquido - (420000 - custo)) + Math.abs(v.mi - 24), 0.01, 'liquido motor ' + R2(v.liquido));
  const f24 = x.meses[24].fluxo;
  st('part4-fluxo', 'P4: no mes da venda sai a participacao (mov_bens -420.000) e os custos saem (out_vendap_3 = 9.400)', 'fluxo do mes', 'mes 24', Math.abs((f24.mov_bens || 0) + 420000) + Math.abs((f24.out_vendap_3 || 0) - custo), 0.01);
  st('part4-pos', 'P4: depois da venda a participacao e zero (meses 24..)', 'varredura', 'meses 24..' + (n - 1), Math.max(...x.meses.slice(24).map(m => Math.abs(m.fim.det.parts[3]))), 0);
  const nega = Math.min(...x.meses.map(m => Math.min(...m.fim.det.parts)));
  st('part-nao-negativa', 'Nenhuma participacao fica negativa (P3 cai a zero; o pontual de -5.000 nao a leva a negativo)', 'varredura', 'todos os meses', nega < -0.005 ? -nega : 0, 0);
  IMPACTO.partP4 = [22, 23, 24, 25].map(m => ({ mi: m, part: x.meses[m].fim.part, cofre: x.meses[m].fim.cofre, pat: patDe(x, m) }));
}
{
  const P = planoBase();
  P.objectives = [{ id: 'carro', name: 'Carro', descricao: '', icon: 'car', kind: 'consumo', milestone: true, months: 60, amount: 250000, dedicated: 100000, profile: 'agressivo', planned: 0, costs: [], strategy: '' },
                  { id: 'curto', name: 'Viagem', descricao: '', icon: 'plane', kind: 'consumo', milestone: true, months: 18, amount: 60000, dedicated: 40000, profile: 'agressivo', planned: 0, costs: [], strategy: '' },
                  { id: 'borda', name: 'Borda 24', descricao: '', icon: 'plane', kind: 'consumo', milestone: true, months: 24, amount: 80000, dedicated: 30000, profile: 'moderado', planned: 0, costs: [], strategy: '' }];
  const x = rodaPlano(P);
  const taxaEsp = (o, mi) => { const base = PROF[o.profile], cons = Math.min(base, PROF.conservador), t = Math.max(0, o.months - 24); return mi >= t ? cons : base; };
  const E3 = H.carregar(); E3.configure(JSON.parse(JSON.stringify(P))); const S3 = E3.run('desej'); const W3 = S3.weeks;
  P.objectives.forEach((o, k) => {
    const r = maxErr(x.objetivos[k].taxaPorMes.map((t, mi) => [t, taxaEsp(o, mi), o.id + ' taxa@' + mi]));
    st('taxa-' + o.id, 'Caixinha "' + o.name + '" (' + o.months + ' meses, ' + o.profile + '): taxa de cada mes pelas regras (troca no mes ' + Math.max(0, o.months - 24) + ')', 'regra independente', (o.months + 1) + ' meses', r.m, 1e-12, r.w || '');
    let eEng = 0, eNom = 0, imp = 0;
    for (let i = E3.W0 + 1; i < W3.length; i++) { const a = W3[i - 1], b = W3[i]; if (a.obj[k] <= 0) continue;
      const fE = Math.pow(1 + taxaEsp(o, a.mi >= 0 ? a.mi : 0), 7 / 30.4375), fN = Math.pow(1 + taxaEsp(o, b.mi), 7 / 30.4375), mov = b.f['mov_obj_' + o.id] || 0;
      eEng = Math.max(eEng, Math.abs(b.obj[k] - (a.obj[k] * fE + mov))); eNom = Math.max(eNom, Math.abs(b.obj[k] - (a.obj[k] * fN + mov))); imp += a.obj[k] * (fN - fE); }
    st('saldo-' + o.id, 'Caixinha "' + o.name + '": recursao semanal com a taxa do mes da semana anterior (convencao do motor)', 'recursao independente', 'semanas ate a data', eEng, 0.01);
    st('saldo-nom-' + o.id, 'Caixinha "' + o.name + '": recursao semanal com a taxa do proprio mes da semana (convencao nominal): desvio maximo', 'recursao independente', 'semanas ate a data', eNom, 100, 'desvio maximo semanal ' + R2(eNom) + '; efeito acumulado ' + R2(imp));
    const iSaq = W3.findIndex((w, i) => i > E3.W0 && (w.f['mov_obj_' + o.id] || 0) < -1);
    const real = -W3[iSaq].f['mov_obj_' + o.id], dedic = o.dedicated, semanasTot = iSaq - E3.W0 + 1, t = Math.max(0, o.months - 24);
    let sBase = 0; for (let i = E3.W0; i <= iSaq; i++) if ((i === E3.W0 || W3[i - 1].mi < 0 ? 0 : W3[i - 1].mi) < t) sBase++;
    const base = PROF[o.profile], mTot = semanasTot * 7 / 30.4375;
    const fechada = dedic * Math.pow(1 + base, t) * Math.pow(1.004, o.months - t);
    const emSemanas = dedic * Math.pow(1 + base, sBase * 7 / 30.4375) * Math.pow(1.004, (semanasTot - sBase) * 7 / 30.4375);
    FINDINGS.push({ id: 'EST-' + o.id, real, emSemanasIndep: emSemanas, fechadaMensal: fechada, soConservadora: dedic * Math.pow(1.004, mTot), soEscolhida: dedic * Math.pow(1 + base, mTot), semanasBase: sBase, semanasTotal: semanasTot, trocaMes: t, efeitoSemanaAtraso: imp });
    st('final-' + o.id, 'Caixinha "' + o.name + '": saldo na data = ' + dedic.toLocaleString('pt-BR') + ' x (1+taxa)^(semanas antes da troca) x 1,004^(semanas depois)', 'formula independente', '1 ponto', Math.abs(real - emSemanas), 0.01, 'motor ' + R2(real) + '; formula ' + R2(emSemanas) + '; fechada mensal ' + R2(fechada));
  });
}
{
  const P = planoBase();
  const Cr = 400000, nPar = 120, aa = 12, k0 = 12;
  const i = Math.pow(1 + aa / 100, 1 / 12) - 1;
  const priceTab = (F, n) => { const pm = F * i / (1 - Math.pow(1 + i, -n)); let b = F; const L = []; for (let k = 0; k < n; k++) { const j = b * i, a = pm - j; b -= a; L.push({ j, a, pay: pm, saldo: Math.max(0, b) }); } return L; };
  const iof = F => { const L = priceTab(F, nPar); return F * 0.0038 + L.reduce((s, l, k) => s + l.a * 0.000082 * Math.min(365, 30 * (k + 1)), 0); };
  let F = Cr; for (let r = 0; r < 60; r++) F = Cr + iof(F);
  const Ltab = priceTab(F, nPar), saldoK0 = Ltab[k0 - 1].saldo;
  P.patrimonio.bens = [{ nome: 'Apto financiado', mercado: 800000, saldoDevedor: saldoK0, credito: Cr, parcelas: nPar, inicio: '2025-10', juros: aa, iof: 'financiado', sistema: 'price',
    valorizacao: [{ tipo: 'taxa', pct: 3, de: 0, anos: 10 }], venda: { em: 24, preco: 950000, custos: [{ nome: 'corretagem', pct: 5 }] } }];
  const x = rodaPlano(P);
  const d = x.dividas[0].saldo, venda = x.bens[0].venda;
  const r = maxErr(Array.from({ length: 24 }, (_, mi) => [d[mi], mi === 0 ? saldoK0 : Ltab[k0 + mi - 1].saldo, 'saldo@' + mi]));
  st('iof-saldo', 'Price com IOF financiado (0,38% + 0,0082%/dia, teto 365 dias), 400.000 a 12% a.a. em 120x: saldo mes a mes (meses 0..23)', 'ponto fixo F = C + IOF(F) e tabela Price independentes', '24 meses', r.m, 0.01, r.w || '');
  const quit = Ltab[k0 + 24 - 1].saldo;
  st('venda-quitacao', 'Venda do bem financiado no mes 24: quitacao = saldo do contrato; liquido = preco - custos - quitacao', 'tabela independente', 'mes 24', Math.abs(venda.quitacao - quit) + Math.abs(venda.liquido - (950000 - 47500 - quit)), 0.01, 'quitacao ' + R2(venda.quitacao) + ' liquido ' + R2(venda.liquido) + ' (preco 950.000, custos 47.500)');
  const f24 = x.meses[24].fluxo;
  st('venda-quita-fluxo', 'Venda com saldo devedor: out_quita_0 no fluxo = quitacao; custos = out_venda_0', 'fluxo do mes 24', 'mes 24', Math.abs((f24.out_quita_0 || 0) - quit) + Math.abs((f24.out_venda_0 || 0) - 47500), 0.01);
  st('venda-div-zero', 'Depois da venda a divida do bem e zero (det.divs)', 'varredura', 'meses 24..', Math.max(...x.meses.slice(24).map(m => m.fim.det.divs[0])), 0.005);
}

// ===================================================================================================
// K. Evidencias adicionais (julgamento das "coisas estranhas" do consultor e riscos latentes)
// ===================================================================================================
{
  // consorcio do trator: valores citados no cenario
  const sAposReaj14 = T[13].saldo, sAntes = sAposReaj14 / 1.04;
  FINDINGS.push({ id: 'TRATOR-CENARIO', saldoDepois14SemReajuste: sAntes, saldoDepoisReajuste14: sAposReaj14, parcela15: T[14].pay, saldoDepois22: T[21].saldo, ultima: T[99].pay, total: 420000 * 1.18 });
  check('K-cenario-trator', 'Fidelidade', 'Consorcio do trator: saldo 426.216 -> 443.265 apos o reajuste da parcela 14; parcela 5.154,24 (443.265/86)', 'tabela independente', '3 valores', Math.abs(sAntes - 426216) + Math.abs(sAposReaj14 - 443265) + Math.abs(T[14].pay - 5154.24), 1.5, 'saldo antes ' + R2(sAntes) + '; depois ' + R2(sAposReaj14) + '; parcela ' + R2(T[14].pay));
  // dividas dos 4 bens: todas zero (nenhum bem tem saldo devedor)
  check('K-div-bens', 'Dividas', 'Nenhum dos 4 bens tem saldo devedor: dividas[] do extrato = 0', 'varredura', '4 x 361 meses', Math.max(...EXT.dividas.map(d => Math.max(...d.saldo.map(Math.abs)))), 0);
  // mes da quitacao dos eventos
  const evTr = EXT.eventos.find(e => /trator/i.test(e.label)), evFin = EXT.eventos.find(e => /Financiamento de casa/i.test(e.label));
  const semToMi = wk => W[wk].mi;
  check('K-evento-trator', 'Dividas', 'Evento "Divida quitada: trator" cai no mes 78 (saldo zera no mes 78)', 'evento x saldo', '1 evento', Math.abs(semToMi(evTr.week) - 78), 0);
  check('K-evento-fin', 'Dividas', 'Evento "Financiamento da casa quitado" cai no mes 207 (36 + 172 parcelas - 1)', 'evento x tabela SAC', '1 evento', Math.abs(semToMi(evFin.week) - (36 + FIN.L.length - 1)), 0);
  // patrimonio no mes 13 -> 14 (contemplacao do caminhao): o bem (caminhao) nao entra
  const pat = mi => fim(mi).fin + fim(mi).bens + fim(mi).part + fim(mi).prev - fim(mi).div;
  FINDINGS.push({ id: 'CAMINHAO-PAT', pat13: pat(13), pat14: pat(14), delta: pat(14) - pat(13), prev13: fim(13).prev, prev14: fim(14).prev, div13: fim(13).div, div14: fim(14).div, fin13: fim(13).fin, fin14: fim(14).fin, caminhaoFaltante: 500000 });
  // FGTS aos 90 anos: o saque vira renda do mes e a regra de padrao de vida gasta tudo naquele mes
  const mf = ESP.fgtsMes; let ent = 0, sai = 0; const f = MES[mf].fluxo; for (const k in f) { if (k.startsWith('in_')) ent += f[k]; else if (k.startsWith('out_')) sai += f[k]; }
  FINDINGS.push({ id: 'FGTS-GASTO', mes: mf, entradas: ent, saidas: sai, saque: f.in_pas_2, saudeNoMes: f.out_fix_saude, casaNoMes: f.out_adj_casa });
  // risco latente: a escala do padrao de vida multiplica tambem a parcela de uma divida lancada como linha de despesa
  const Pq = JSON.parse(JSON.stringify(PLANO));
  Pq.tipo = 'individual'; delete Pq.conjugeNome; delete Pq.conjugeNascimento; delete Pq.spouseAge; delete Pq.spouseRetireAge; delete Pq.riscos;
  Pq.nascimento = '1980-03'; Pq.age = 46; Pq.retireAge = 48; Pq.lifeExp = 95; Pq.desired = 8000; Pq.desiredSteps = [];
  Pq.incomes = [{ id: 'sal', label: 'Salario', kind: 'ativa', origin: 'Salário', gross: 30000, frequency: 'mensal', pessoa: 'titular', days: [5], taxable: true, steps: [{ from: 0, value: 30000 }] },
                { id: 'alug', label: 'Aluguel', kind: 'passiva', origin: 'Aluguéis', gross: 30000, frequency: 'mensal', pessoa: 'titular', days: [5], taxable: true, steps: [{ from: 0, value: 30000 }] }];
  Pq.expenses = [{ id: 'vida', label: 'Vida', group: 'adj', week: 0, steps: [{ from: 0, value: 10000 }] },
                 { id: 'parc', label: 'Parcela da divida', group: 'fix', frequency: 'mensal', days: [10], steps: [{ from: 0, value: 5000 }, { from: 120, value: 0 }] }];
  Pq.passive = []; Pq.creditos = []; Pq.compromissos = []; Pq.objectives = [];
  Pq.patrimonio = { financeiro: [{ nome: 'A', valor: 2000000 }], participacoes: [], bens: [], dividas: [] };
  const xq = rodaPlano(Pq);
  const mq = 40, fq = xq.meses[mq].fluxo;
  STRESS.push({ id: 'escala-parcela', o: 'LATENTE: depois da liberdade, a parcela fixa de uma divida (5.000) tambem e multiplicada pelo fator de padrao de vida', err: Math.abs((fq.out_fix_parc || 0) - 5000), tol: 0.01 });
  check('J-escala-parcela', 'Estresse', 'LATENTE (nao ocorre no cenario 08): apos a liberdade, a parcela contratual de 5.000 sai no fluxo igual a 5.000?', 'plano sintetico: ff no mes ' + (xq.ff && xq.ff.mi) + ', renda passiva 30.000', 'mes ' + mq, Math.abs((fq.out_fix_parc || 0) - 5000), 0.01, 'obtido ' + R2(fq.out_fix_parc || 0) + ' (a linha de despesa da parcela e escalada junto com a vida); fator ' + R2((fq.out_adj_vida || 0) / 10000));
}

module.exports = { IMPACTO, FID, STRESS, CHECKS, FINDINGS, T, CRED, FIN, CAM, ESP, MES, PLANO, EXT, W, S, W0, NW, SEMANAL, SEMANAL_OBJ, R2, fmt, cal, mesNome, PAT: mi => fim(mi).fin + fim(mi).bens + fim(mi).part + fim(mi).prev - fim(mi).div };

if (require.main === module) {
  const por = {}; CHECKS.forEach(c => { (por[c.frente] = por[c.frente] || []).push(c); });
  Object.keys(por).forEach(fr => {
    console.log('\n== ' + fr + ' ==');
    por[fr].forEach(c => console.log((c.ok ? 'OK   ' : 'FALHA') + ' | ' + c.id + ' | ' + c.o + ' | erro max ' + (c.erroMax === Infinity ? 'inf' : c.erroMax.toFixed(6)) + ' (tol ' + c.tol + ') | ' + c.amostra + (c.nota ? ' | ' + c.nota : '')));
  });
  console.log('\n== ACHADOS ==');
  FINDINGS.forEach(f => console.log(JSON.stringify(f)));
  console.log('\n== IMPACTOS (reexecucao do motor com a linha corrigida) =='); console.log(JSON.stringify(IMPACTO));
  console.log('\nTotal: ' + CHECKS.length + ' conferencias; ' + CHECKS.filter(c => !c.ok).length + ' falhas.');
  if (process.env.AUDITOR_SAIDA) fs.writeFileSync(process.env.AUDITOR_SAIDA, JSON.stringify({ CHECKS, FINDINGS, SEMANAL, SEMANAL_OBJ, IMPACTO, FID, STRESS }, null, 1));
}
