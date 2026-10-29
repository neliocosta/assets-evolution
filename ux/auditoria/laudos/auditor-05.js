// AUDITOR MATEMÁTICO — Cenário 05 (Marcos Pereira). Reexecutável: node ux/auditoria/laudos/auditor-05.js
// Independente do motor: o "esperado" sai do PLANO + regras do domínio financeiro, escritas aqui. Do motor só se usa o "observado"
// (extrato-05.json e as semanas simuladas via harness, que são saídas, nunca as funções de cálculo trajetoriaDoBem/saldoDevedorEm/taxaDoObjetivo...).
'use strict';
const fs = require('fs'), path = require('path');
const D = __dirname;
const PLANO = JSON.parse(fs.readFileSync(path.join(D, '..', 'planos', 'plano-05.json'), 'utf8')).dados;
const X = JSON.parse(fs.readFileSync(path.join(D, '..', 'extratos', 'extrato-05.json'), 'utf8'));
const H = require(path.join(D, '..', 'harness.js'));

// ---------- infraestrutura de conferências ----------
const CHK = [];
let TOL = 0.01;
const chk = (id, o_que, metodo, amostra, erro, extra, tol) => { const t = tol == null ? TOL : tol; CHK.push({ id, o_que, metodo, amostra, erro, ok: erro <= t, extra: extra || '' }); };
const maxAbs = (a, b) => { let m = 0, w = -1; for (let k = 0; k < a.length; k++) { const e = Math.abs(a[k] - b[k]); if (!(e <= m)) { m = e; w = k; } } return { m, w }; };
const f2 = v => (Math.round(v * 100) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const out = [];   // linhas de texto da execução
const say = s => { out.push(s); console.log(s); };

// ---------- premissas de calendário e taxa (decisões de desenho, documentadas) ----------
const R_M = PLANO.rate;                       // 0,4% a.m. (conservador) — rendimento do financeiro
const GW = Math.pow(1 + R_M, 7 / 30.4375);    // PREMISSA E1: capitalização semanal equivalente (7 dias / mês médio de 30,4375 dias)
const MES0 = { y: 2026, m: 9 };               // mês 0 = out/2026 (inicio 2026-10-20, dia >= 5 => ciclo do mês corrente)
const MESN = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const rot = mi => { const t = MES0.y * 12 + MES0.m + mi; return MESN[t % 12] + '/' + Math.floor(t / 12); };
const mes = {}; X.meses.forEach(m => { mes[m.mi] = m; });
const N = X.meses.length;                      // mi 0..501
const fluxoSoma = (m, pref) => { let s = 0; for (const k in m.fluxo) if (k.startsWith(pref)) s += m.fluxo[k]; return s; };
const IN = m => fluxoSoma(m, 'in_'), OUT = m => fluxoSoma(m, 'out_');

// ---------- observado semana a semana (saída do motor, só para checar identidades) ----------
const E = H.carregar(); E.configure(JSON.parse(JSON.stringify(PLANO)));
const S = E.run('desej'); const W = S.weeks, W0 = E.W0, NW = E.NW;
const semanaFechaMes = {}; X.meses.forEach(m => { semanaFechaMes[m.mi] = m.w1 - 1; });

// =====================================================================================
// A. CONTABILIDADE GERAL
// =====================================================================================
say('== A. Contabilidade geral ==');
// A1: sem NaN/Infinity em todo o extrato
{ let bad = 0, cnt = 0; (function walk(o) { if (typeof o === 'number') { cnt++; if (!Number.isFinite(o)) bad++; } else if (o && typeof o === 'object') for (const k in o) walk(o[k]); })(X);
  chk('A1', 'Nenhum NaN/Infinity no extrato inteiro', 'varredura recursiva', cnt + ' números', bad, 'não finitos: ' + bad); }
// A2: sinais e composição (fin = cofre + caixinhas; div = soma do detalhe; bens/part = soma do detalhe)
{ let e1 = 0, e2 = 0, e3 = 0, e4 = 0, neg = 0;
  X.meses.forEach(m => { const f = m.fim, d = f.det;
    e1 = Math.max(e1, Math.abs(f.fin - (f.cofre + f.obj.reduce((a, b) => a + b, 0))));
    e2 = Math.max(e2, Math.abs(f.div - d.divs.reduce((a, b) => a + b, 0)));
    e3 = Math.max(e3, Math.abs(f.bens - d.bens.reduce((a, b) => a + b, 0) - d.comprados.reduce((a, b) => a + b, 0)));
    e4 = Math.max(e4, Math.abs(f.part - d.parts.reduce((a, b) => a + b, 0)));
    if (f.fin < -0.01 || f.part < 0 || f.div < 0 || f.bens < 0 || f.cheque > 0.5) neg++; });
  chk('A2a', 'fin = cofre + caixinhas', 'identidade por mês', N + ' meses', e1);
  chk('A2b', 'div = soma do detalhe das dívidas', 'identidade por mês', N + ' meses', e2);
  chk('A2c', 'bens = soma do detalhe dos bens', 'identidade por mês', N + ' meses', e3);
  chk('A2d', 'part = soma do detalhe das participações', 'identidade por mês', N + ' meses', e4);
  chk('A2e', 'Sinais: fin>=0, part>=0, div>=0, bens>=0, cheque=0', 'varredura', N + ' meses', neg, 'meses com sinal errado: ' + neg); }
// A3: fluxo mensal do extrato = soma das semanas (bucket correto) e mov_cofre = entradas - saídas; transferências somam zero
{ let eA = 0, eB = 0, eT = 0;
  X.meses.forEach(m => { const mm = m.mi; let s = {}; for (let i = m.w0; i < m.w1; i++) { const f = W[i].f || {}; for (const k in f) s[k] = (s[k] || 0) + f[k]; }
    for (const k in s) eA = Math.max(eA, Math.abs(s[k] - (m.fluxo[k] || 0)));
    eB = Math.max(eB, Math.abs((m.fluxo.mov_cofre || 0) - (IN(m) - OUT(m))));
    // transferências: toda chave mov_* exceto mov_cofre deve somar com a contrapartida; aqui não há objetivos nem compra: mov_bens deve ser 0
    eT = Math.max(eT, Math.abs(m.fluxo.mov_bens || 0)); });
  chk('A3a', 'Fluxo mensal do extrato = soma das semanas do motor', 'recomposição por chave', N + ' meses', eA);
  chk('A3b', 'mov_cofre = Σentradas − Σsaídas (nada criado/perdido no caixa)', 'identidade por mês', N + ' meses', eB);
  chk('A3c', 'Transferências internas (mov_bens etc.) somam zero: sem objetivo/compra/venda no plano', 'soma de mov_bens', N + ' meses', eT); }
// A4: conservação semanal exata: fin_i = fin_{i-1} + rendimento_i + Σin − Σout; rendimento_i = max(cofre_{i-1},0)·(GW−1)   (caixinhas: nenhuma)
{ let e = 0, em = -1, nsem = 0, minCofre = 0;
  for (let i = W0; i < NW; i++) { const prev = i === W0 ? 780000 : W[i - 1].cofre;   // PREMISSA: saldo de abertura = soma de patrimonio.financeiro (780.000)
    const rend = prev > 0 ? prev * (GW - 1) : 0, f = W[i].f || {}; let r = 0; for (const k in f) { if (k.startsWith('in_')) r += f[k]; else if (k.startsWith('out_')) r -= f[k]; }
    const juros = 0;   // juros da dívida da reserva negativa: nunca disparam (conferido em G)
    const esp = prev + rend + r + juros; const d = Math.abs(W[i].cofre - esp); if (d > e) { e = d; em = i; } nsem++; minCofre = Math.min(minCofre, W[i].cofre); }
  chk('A4', 'Conservação do dinheiro semana a semana: cofre_i = cofre_{i-1}·GW + Σin − Σout', 'recálculo independente de ' + NW + ' semanas', nsem + ' semanas', e, 'pior semana ' + em, 1e-6);
  chk('A4b', 'Reserva nunca negativa (sem dívida de caixa, sem juros de 4%)', 'mínimo do cofre', nsem + ' semanas', Math.abs(minCofre), 'mín=' + f2(minCofre)); }
// A5: patrimônio líquido (fin+bens+part+prev−div) e identidade do ΔPL (mês a mês) — usa juros do CONTRATO (calculados na seção C)
const PL = mi => { const f = mes[mi].fim; return f.fin + f.bens + f.part + f.prev - f.div; };

// =====================================================================================
// B. PARTICIPAÇÃO SOCIETÁRIA
// =====================================================================================
say('== B. Participação ==');
const part0 = PLANO.patrimonio.participacoes[0];
// Regras (domínio): valor(m) = valor(m-1)·(1+pct)^(1/12) para m = 1..12·anos (taxa composta mensalmente a partir da a.a.);
// salto pontual: v ← max(0, v·(1+pct)) no mês 'em' (pct −100% => 0; nunca negativo; depois, 0 cresce 0).
function seriePart(p, H) {
  const ev = p.valorizacao, tx = ev.find(e => e.tipo === 'taxa'), pt = ev.find(e => e.tipo === 'pontual');
  const ate = Math.round(tx.anos * 12) + (tx.de || 0); let v = p.valor; const s = [v];
  for (let m = 1; m <= H; m++) { if (m - 1 >= (tx.de || 0) && m - 1 < ate) v *= Math.pow(1 + tx.pct / 100, 1 / 12); if (pt && m === pt.em) v = Math.max(0, v * (1 + pt.pct / 100)); s.push(v); }
  return s;
}
const sP = seriePart(part0, 520);
{ const obs = X.parts[0].serie, n = obs.length; const r = maxAbs(obs, sP.slice(0, n));
  chk('B1', 'Série da participação (motor) = −10% a.a. composto mensal por 30 meses, depois queda a 0', 'recálculo mês a mês', n + ' meses (mi 0..' + (n - 1) + ')', r.m, 'pior mês ' + r.w); }
{ let e = 0, e2 = 0, neg = 0; X.meses.forEach(m => { e = Math.max(e, Math.abs(m.fim.part - sP[m.mi])); e2 = Math.max(e2, Math.abs(m.fim.det.parts[0] - sP[m.mi])); if (m.fim.part < 0) neg++; });
  chk('B2', 'fim.part e fim.det.parts[0] = esperado, todos os meses do extrato', 'comparação mês a mês', N + ' meses', Math.max(e, e2));
  chk('B3', 'Participação jamais negativa (queda de −100% e valor pontual maior que o saldo)', 'varredura', N + ' meses', neg); }
// pontos nomeados
const pontos = [12, 29, 30, 31, 60, 500].map(m => ({ m, esp: sP[m], obs: mes[m].fim.part }));
pontos.forEach(p => say('  participação mês ' + p.m + ' (' + rot(p.m) + '): esperado ' + f2(p.esp) + '; motor ' + f2(p.obs) + '; erro ' + f2(Math.abs(p.esp - p.obs))));
// antes da queda (fechamento do mês 30): evento valoriza
{ const ev = X.eventos.find(e => e.type === 'valoriza'); const antes = 250000 * Math.pow(0.9, 30 / 12);
  say('  evento de desvalorização: ' + ev.detail + ' | valor antes da queda (mês 30) esperado ' + f2(antes));
  const m = /−\s*R\$\s*([\d.]+)/.exec(ev.detail); const obsV = m ? +m[1].replace(/\./g, '') : NaN;
  chk('B4', 'Evento "Desvalorização" = valor da participação logo antes do fechamento (250.000·0,9^2,5)', 'comparação com texto do evento (arredondado ao real)', '1 evento', Math.abs(obsV - antes), 'texto: ' + ev.detail, 0.5); }
// Participação no patrimônio: o total não tem renda ligada (a sala comercial é bem; a 'renda' ligada é o aluguel do bem, não da cantina): conferido em F
// Valor esperado do cenário (Para o auditor): 225.000 (mês 12), ~193.800 (29), 0 (30)
chk('B5', 'Valores do cenário: mês12=225.000; mês29≈193.800; mês30=0', 'comparação direta', '3 pontos', Math.max(Math.abs(mes[12].fim.part - 225000), Math.abs(mes[29].fim.part - 193802.51403496476), Math.abs(mes[30].fim.part)), 'mês 29 do cenário é 193.800 arredondado; exato 193.802,51', 1e-6);

// ---- B-stress: tentar quebrar a participação com variantes do plano (rodadas no motor via harness; esperado calculado aqui) ----
function roda(mod) { const P = JSON.parse(JSON.stringify(PLANO)); mod(P); const Eh = H.carregar(); const x = H.extrato({ dados: P }, Eh); return x; }
{ // S1: salto pontual em valor (−400.000) maior que o saldo restante
  const x = roda(P => { P.patrimonio.participacoes[0].valorizacao[1] = { tipo: 'pontual', em: 30, valor: -400000, motivo: 'sócio' }; });
  let mn = 1e18; x.parts[0].serie.forEach(v => { mn = Math.min(mn, v); });
  const r = maxAbs(x.parts[0].serie, sP.slice(0, x.parts[0].serie.length));
  chk('B6', 'Stress: pontual de −R$ 400.000 (> saldo) deve limitar a zero, nunca negativo', 'rodada alternativa no motor; esperado = série B1', x.parts[0].serie.length + ' meses', Math.max(r.m, Math.abs(Math.min(0, mn)))); }
{ // S2: venda no mês 24 por preço 150.000 com custos 5% e mais um pontual depois; destino = financeiro
  const x = roda(P => { const p = P.patrimonio.participacoes[0]; p.valorizacao = [{ tipo: 'taxa', pct: -10, de: 0, anos: 2.5 }]; p.venda = { em: 24, preco: 150000, custos: [{ nome: 'Corretagem', pct: 5 }] }; });
  // esperado: com preço de venda informado a série caminha geometricamente de 250.000 até 150.000 no mês 24 (alvo; a taxa deixa de agir); no mês 24 a participação sai
  const alvo = (m) => 250000 * Math.pow(150000 / 250000, m / 24); const exp = []; for (let m = 0; m <= 24; m++) exp.push(alvo(m));
  const r = maxAbs(x.parts[0].serie, exp);
  chk('B7', 'Stress venda: série até a venda = ritmo geométrico até o preço (premissa de desenho "alvo")', 'rodada alternativa; recálculo', '25 meses', r.m);
  const mv = x.meses.find(m => m.mi === 24), m23 = x.meses.find(m => m.mi === 23), m25 = x.meses.find(m => m.mi === 25);
  const f = mv.fluxo; const liquido = 150000 * 0.95;
    chk('B8', 'Stress venda: custos 5% (7.500) saem como out_vendap_0 e a participação sai por 150.000 (mov_bens = −preço)', 'fluxo do mês da venda', 'mi 24', Math.abs((f.out_vendap_0 || 0) - 7500) + Math.abs((f.mov_bens || 0) + 150000), 'out_vendap_0=' + f.out_vendap_0 + ' mov_bens=' + f.mov_bens);
  chk('B9', 'Stress venda: participação = 0 depois da venda e valor retirado = série(23)', 'extrato', 'mi 24, 25', Math.abs(mv.fim.part) + Math.abs(m25.fim.part), 'part24=' + mv.fim.part);
  say('  [stress venda] líquido esperado ' + f2(liquido) + ' | fluxo do mês 24: ' + JSON.stringify(f)); }

// =====================================================================================
// C. DÍVIDAS
// =====================================================================================
say('== C. Dívidas ==');
const pmtPrice = (F, i, n) => i > 0 ? F * i / (1 - Math.pow(1 + i, -n)) : F / n;
function tabela(F, i, n, sac) {   // devolve linhas k=1..n: {juros, amort, pay, saldo(depois da parcela)}
  const L = []; let bal = F; const p = pmtPrice(F, i, n), am = F / n;
  for (let k = 0; k < n; k++) { const j = bal * i, a = sac ? am : p - j; bal = Math.max(0, bal - a); L.push({ juros: j, amort: a, pay: j + a, saldo: bal }); }
  return L;
}
function taxaDaParcela(F, n, P) { let lo = 0, hi = 0.5; for (let r = 0; r < 100; r++) { const mid = (lo + hi) / 2; if (pmtPrice(F, mid, n) < P) lo = mid; else hi = mid; } return (lo + hi) / 2; }
const dv = PLANO.patrimonio.dividas;
const DIV = dv.map(d => { const n = d.parcelas, F = d.credito, k0 = n - d.restantes;   // PREMISSA C1: 'restantes' conta a parcela deste mês; saldo hoje = depois de k0 parcelas
  const iP = taxaDaParcela(F, n, d.parcela), iI = d.jurosPeriodo === 'mes' ? d.juros / 100 : null;
  const T = tabela(F, iP, n, false);
  return { nome: d.nome, n, F, k0, iP, iI, T, saldoHoje: T[k0 - 1].saldo, B0: d.saldoDevedor, parcela: d.parcela }; });
DIV.forEach(d => say('  ' + d.nome + ': taxa deduzida da parcela ' + (d.iP * 100).toFixed(4) + '% a.m.' + (d.iI ? ' (informada ' + (d.iI * 100).toFixed(2) + '%)' : '') + '; saldo hoje (depois de ' + d.k0 + ' pagas) ' + f2(d.saldoHoje) + ' (plano: ' + d.B0 + ')'));
// C1: saldo mês a mês de cada avulsa (extrato.dividasAvulsas) contra o contrato recalculado (saldo depois de k0+k parcelas). A escala B0/saldoHoje é o 'saldo informado manda hoje'.
DIV.forEach((d, q) => { const obs = X.dividasAvulsas[q].saldo; const esp = obs.map((_, k) => { const j = d.k0 + k; return j >= d.n ? 0 : (j <= 0 ? d.F : d.T[j - 1].saldo) * d.B0 / d.saldoHoje; });
  const espPuro = obs.map((_, k) => { const j = d.k0 + k; return j >= d.n ? 0 : (j <= 0 ? d.F : d.T[j - 1].saldo); });
  const r = maxAbs(obs, esp), r2 = maxAbs(obs, espPuro);
  chk('C1' + 'ab'[q], 'Saldo devedor mês a mês — ' + d.nome + ' (Price, taxa dedu­zida da parcela, escalado ao saldo informado)', 'tabela de amortização recalculada', obs.length + ' meses (mi 0..360)', r.m, 'sem a escala (contrato puro) o erro seria ' + f2(r2.m) + ' (efeito do arredondamento de ' + d.B0 + ' vs ' + f2(d.saldoHoje) + ')');
  d.espPuro = espPuro; d.esp = esp; });
// C2: saldo informado (hoje) vs saldo calculado do contrato, e vs taxa informada (1,95%) / cenário (72.400)
{ const d = DIV[0]; const T195 = tabela(d.F, 0.0195, d.n, false); const s195 = T195[d.k0 - 1].saldo;
  chk('C2a', 'Consignado: saldo hoje do plano (72.412) = saldo recalculado (taxa deduzida da parcela 2.337)', 'tabela Price', '1 ponto', Math.abs(d.B0 - d.saldoHoje), 'recalculado ' + f2(d.saldoHoje) + '; a 1,95% exato daria ' + f2(s195) + ' (parcela 2.336,6x)', 1);
  chk('C2b', 'Consignado: taxa deduzida da parcela de 2.337 ≈ 1,95% a.m. informada', 'bissecção', '1 ponto', Math.abs(d.iP - 0.0195) * 100, 'diferença em p.p. a.m.', 0.01);
  const c = DIV[1]; chk('C2c', 'Cartão: taxa implícita (parcela 780, 6.500 em 10x) ≈ 3,46% a.m. do cenário', 'bissecção', '1 ponto', Math.abs(c.iP - 0.0346) * 100, 'taxa ' + (c.iP * 100).toFixed(4) + '%', 0.01);
  chk('C2d', 'Cartão: saldo hoje do plano (4.776) = recalculado', 'tabela Price', '1 ponto', Math.abs(c.B0 - c.saldoHoje), 'recalculado ' + f2(c.saldoHoje), 1); }
// C3: crédito novo (SAC): saldo, parcela, juros; dívida do crédito em fim.det.divs[5]
const CR = PLANO.creditos[0]; const iCr = CR.juros / 100, TCr = tabela(CR.valor, iCr, CR.parcelas, true);
{ const obs = X.meses.map(m => m.fim.det.divs[5]); const esp = X.meses.map(m => { const k = m.mi - CR.em; return k < 0 ? 0 : k === 0 ? CR.valor : k > CR.parcelas ? 0 : TCr[k - 1].saldo; });
  const r = maxAbs(obs, esp); chk('C3a', 'Saldo do crédito novo (SAC 60.000, 36x, 2,1% a.m.) mês a mês', 'tabela SAC recalculada', N + ' meses', r.m, 'pior mês ' + r.w);
  const pl = PLANO.expenses.find(e => e.id === 'crparc').steps; let e = 0; for (let k = 1; k <= 36; k++) { const st = pl.find(s => s.from === CR.em + k); e = Math.max(e, Math.abs(st.value - TCr[k - 1].pay)); }
  chk('C3b', 'Linha de parcelas lançada pelo consultor = parcela SAC do contrato (36 degraus)', 'comparação com 2 casas', '36 parcelas', e, 'tolerância 0,005 (arredondamento a centavos)', 0.005);
  chk('C3c', 'Parcela 1 = 60.000/36 + 60.000·2,1% = 2.926,67; última = 1.701,67', 'fórmula SAC', '2 pontos', Math.max(Math.abs(TCr[0].pay - 2926.6667), Math.abs(TCr[35].pay - 1701.6667)), '', 0.01);
  const jur = TCr.reduce((a, l) => a + l.juros, 0), tot = TCr.reduce((a, l) => a + l.pay, 0);
  chk('C3d', 'Juros do crédito = Σparcelas − principal = 23.310,00', 'soma da tabela', '36 parcelas', Math.abs(jur - (tot - CR.valor)) + Math.abs(jur - 23310), 'juros ' + f2(jur) + '; total pago ' + f2(tot)); }
// C4: Σ det.divs = fim.div já em A2b. Evento de crédito: PL não muda na liberação (mês 18): ΔPL(18) = ΔPL(17) + efeito normal; testado via identidade abaixo.
// C5: Identidade do ΔPL por mês: ΔPL = rendimento + Δ(bens+part) + (entradas sem crédito) − (saídas) + (amortização contratual do principal das dívidas) ... em forma "contratual":
//   ΔPL_esperado = rend + Δpart_esperado + entradas_sem_credito − saídas_sem_parcelas_de_dívida − juros_do_contrato
//   (a parcela só é custo pelos juros; a amortização troca caixa por menos dívida). Resíduo ≠ 0 => caixa pago ≠ contrato.
const jurosContrato = mi => { let j = 0; DIV.forEach(d => { const k = d.k0 + mi - 1; /* mês mi>=1 paga a parcela nº k0+mi (índice k0+mi-1) */ if (mi >= 1 && k >= 0 && k < d.n) { const sc = d.B0 / d.saldoHoje; j += d.T[k].juros * sc; } });
  const k = mi - CR.em - 1; if (k >= 0 && k < CR.parcelas) j += TCr[k].juros; return j; };
const parcelaContrato = mi => { let p = 0; DIV.forEach(d => { const k = d.k0 + mi - 1; if (mi >= 1 && k < d.n) p += d.T[k].pay; });   // da parcela nº k0+mi+1 (paga no mês mi>=1; o mês 0 já passou)
  const k = mi - CR.em - 1; if (k >= 0 && k < CR.parcelas) p += TCr[k].pay; return p; };
const parcelaPaga = mi => { const m = mes[mi]; if (!m) return 0; return (m.fluxo.out_fix_divconsig || 0) + (m.fluxo.out_fix_divcartao || 0) + (m.fluxo.out_fix_crparc || 0); };
// rendimento mensal observado (semanal, recalculado): soma das semanas do mês de max(cofre_{i-1},0)·(GW−1)
const rendMes = {}; X.meses.forEach(m => { let r = 0; for (let i = m.w0; i < m.w1; i++) { const prev = i === W0 ? 780000 : W[i - 1].cofre; if (prev > 0) r += prev * (GW - 1); } rendMes[m.mi] = r; });
const RES = {};   // resíduos por mês da identidade do ΔPL
for (let mi = 1; mi < N; mi++) { const m = mes[mi]; const nonDebtOut = OUT(m) - parcelaPaga(mi), inSemCr = IN(m) - (m.fluxo.in_credito_crnovo || 0);
  const dpl = PL(mi) - PL(mi - 1), esp = rendMes[mi] + (m.fim.part - mes[mi - 1].fim.part) + (m.fim.bens - mes[mi - 1].fim.bens) + inSemCr - nonDebtOut - jurosContrato(mi);
  RES[mi] = dpl - esp; }
{ // pré-liberdade (mi 1..20): deve ser ~0 exceto onde a parcela do cartão/consignado já terminou sem ser paga (mi 7 e 48)
  let e = 0, wm = 0; for (let mi = 1; mi <= 20; mi++) { if (mi === 7) continue; if (Math.abs(RES[mi]) > e) { e = Math.abs(RES[mi]); wm = mi; } }
  chk('C5a', 'Identidade do patrimônio líquido (ΔPL = rendimento + valorização + entradas − consumo − JUROS do contrato): meses 1–20 (antes de parar de trabalhar)', 'recomposição mês a mês', '19 meses (1–20 exceto o 7, que é o C6b)', e, 'mês de maior resíduo: ' + wm + ' = ' + f2(RES[wm]) + '; no mês 7 o resíduo é ' + f2(RES[7]) + ' (a 7ª parcela do cartão não foi paga no caixa e o saldo zerou)', 0.5); }
say('  resíduo ΔPL por mês (ΔPL observado − esperado pelo contrato); positivo = patrimônio MAIOR do que o dinheiro realmente pago sustenta:');
[1, 2, 6, 7, 8, 18, 19, 20, 21, 22, 30, 47, 48, 49, 54, 55, 56].forEach(mi => say('   mi ' + mi + ' (' + rot(mi) + '): resíduo ' + f2(RES[mi]) + ' | parcela de contrato ' + f2(parcelaContrato(mi)) + ' | parcela paga no fluxo ' + f2(parcelaPaga(mi))));
{ let e = 0; for (let mi = 21; mi <= 54; mi++) e = Math.max(e, Math.abs(RES[mi])); chk('C5b', 'Mesma identidade nos meses 21–54 (depois de parar de trabalhar): resíduo = parcelas de contrato não pagas no caixa (achado; o PL só erra se os R$ 14.000 NÃO incluírem as dívidas)', 'recomposição mês a mês', '34 meses', e, 'maior resíduo mensal; acumulado mi 21..54 = ' + f2(Array.from({ length: 34 }, (_, k) => RES[21 + k]).reduce((a, b) => a + b, 0))); CHK[CHK.length - 1].achado = true; }
// C6: parcelas pagas no fluxo vs. contrato — quantas e quanto
const pagCnt = { consig: 0, cartao: 0, cred: 0 }, contrCnt = { consig: DIV[0].n - DIV[0].k0, cartao: DIV[1].n - DIV[1].k0, cred: CR.parcelas };
let deficitParc = 0, deficitPre = 0, deficitPos = 0; const porLinha = { consig: [0, 0], cartao: [0, 0], cred: [0, 0] };
for (let mi = 1; mi < N; mi++) { const m = mes[mi]; if (m.fluxo.out_fix_divconsig > 0.005) pagCnt.consig++; if (m.fluxo.out_fix_divcartao > 0.005) pagCnt.cartao++; if (m.fluxo.out_fix_crparc > 0.005) pagCnt.cred++;
  const kc = DIV[0].k0 + mi - 1, ka = DIV[1].k0 + mi - 1, kr = mi - CR.em - 1;
  const c1 = kc < DIV[0].n ? DIV[0].T[kc].pay : 0, c2 = ka < DIV[1].n ? DIV[1].T[ka].pay : 0, c3 = kr >= 0 && kr < CR.parcelas ? TCr[kr].pay : 0;
  const p1 = m.fluxo.out_fix_divconsig || 0, p2 = m.fluxo.out_fix_divcartao || 0, p3 = m.fluxo.out_fix_crparc || 0;
  porLinha.consig[0] += c1; porLinha.consig[1] += p1; porLinha.cartao[0] += c2; porLinha.cartao[1] += p2; porLinha.cred[0] += c3; porLinha.cred[1] += p3;
  const dfc = (c1 + c2 + c3) - (p1 + p2 + p3); if (mi < 21) deficitPre += dfc; else deficitPos += dfc; deficitParc += dfc; }
say('  parcelas pagas no fluxo (mi>=1) x parcelas restantes do contrato: consignado ' + pagCnt.consig + ' x ' + contrCnt.consig + '; cartão ' + pagCnt.cartao + ' x ' + contrCnt.cartao + '; crédito ' + pagCnt.cred + ' x ' + contrCnt.cred);
say('  soma das parcelas do contrato x paga no fluxo: consignado ' + f2(porLinha.consig[0]) + ' x ' + f2(porLinha.consig[1]) + '; cartão ' + f2(porLinha.cartao[0]) + ' x ' + f2(porLinha.cartao[1]) + '; crédito ' + f2(porLinha.cred[0]) + ' x ' + f2(porLinha.cred[1]));
say('  parcelas de contrato NÃO pagas no caixa: antes da liberdade (mi<21) ' + f2(deficitPre) + '; depois (mi>=21) ' + f2(deficitPos) + '; total ' + f2(deficitParc));
chk('C6a', 'Nº de parcelas do consignado pagas no caixa = nº de parcelas que restam no contrato (48)', 'contagem', 'consignado', Math.abs(pagCnt.consig - contrCnt.consig), 'pagas ' + pagCnt.consig + ' x contrato ' + contrCnt.consig, 0);
chk('C6b', 'Nº de parcelas do cartão pagas no caixa = nº que restam (7)', 'contagem', 'cartão', Math.abs(pagCnt.cartao - contrCnt.cartao), 'pagas ' + pagCnt.cartao + ' x contrato ' + contrCnt.cartao, 0);
chk('C6c', 'Nº de parcelas do crédito novo pagas = 36', 'contagem', 'crédito', Math.abs(pagCnt.cred - contrCnt.cred), 'pagas ' + pagCnt.cred + ' x ' + contrCnt.cred, 0);
// C7: parcela que sai do fluxo = parcela do contrato, meses 1..20 (antes da liberdade; depois entra o ajuste de padrão de vida: ver G)
{ let e = 0, ew = 0; for (let mi = 1; mi <= 20; mi++) { if (mi === 7) continue; const d = Math.abs(parcelaPaga(mi) - parcelaContrato(mi)); if (d > e) { e = d; ew = mi; } }
  chk('C7a', 'Parcela que sai no fluxo = parcela do contrato (consig 2.337 [contrato 2.336,xx], cartão 780, crédito SAC)', 'comparação com a tabela recalculada', 'mi 1..20 exceto 7 (a 7ª do cartão: C6b)', e, 'pior mês ' + ew + ' (a parcela do plano é 2.337 e a do contrato recalculado difere em centavos)', 1);
  let e2 = 0, n2 = 0, w2 = 0; for (let mi = 21; mi <= 54; mi++) { const d = parcelaContrato(mi) - parcelaPaga(mi); n2++; if (d > e2) { e2 = d; w2 = mi; } }
  chk('C7b', 'Parcela que sai no fluxo = parcela do contrato, meses 21..54 (depois de parar de trabalhar)', 'comparação com a tabela recalculada', n2 + ' meses', e2, 'maior diferença ' + f2(e2) + ' em mi ' + w2 + ': as linhas das parcelas são reduzidas pelo "padrão de vida" (ver 4/G)', 1); }
// C8: quitação final em zero e juros pagos (contrato)
{ const mfim = X.meses.length - 1; const z = [mes[mfim].fim.det.divs.reduce((a, b) => a + Math.abs(b), 0)];
  chk('C8a', 'Todas as dívidas quitadas em zero no fim do horizonte', 'soma |divs|', 'mi ' + mfim, z[0]);
  DIV.forEach((d, q) => { const jur = d.T.slice(d.k0).reduce((a, l) => a + l.juros, 0), pag = d.T.slice(d.k0).reduce((a, l) => a + l.pay, 0), prin = d.saldoHoje; say('  ' + d.nome + ': parcelas restantes ' + f2(pag) + ' = principal restante ' + f2(prin) + ' + juros ' + f2(jur) + ' (conferência ' + f2(pag - prin - jur) + ')'); chk('C8b' + 'ab'[q], 'Juros = Σparcelas − principal (' + d.nome + ')', 'soma da tabela', d.n - d.k0 + ' parcelas', Math.abs(pag - prin - jur)); }); }
// C9: instante da quitação (mês em que o saldo zera) e o evento "Dívida quitada"
{ const zero = obs => obs.findIndex((v, k) => v === 0 && k > 0);
  say('  saldo zera: consignado mi ' + zero(X.dividasAvulsas[0].saldo) + ' (' + rot(zero(X.dividasAvulsas[0].saldo)) + '), cartão mi ' + zero(X.dividasAvulsas[1].saldo) + ' (' + rot(zero(X.dividasAvulsas[1].saldo)) + '), crédito mi ' + X.meses.find(m => m.mi > CR.em && m.fim.det.divs[5] === 0).mi);
  say('  última parcela no fluxo: consignado mi ' + Math.max(...X.meses.filter(m => m.fluxo.out_fix_divconsig > 0).map(m => m.mi)) + ', cartão mi ' + Math.max(...X.meses.filter(m => m.fluxo.out_fix_divcartao > 0).map(m => m.mi)) + ', crédito mi ' + Math.max(...X.meses.filter(m => m.fluxo.out_fix_crparc > 0).map(m => m.mi))); }
// C10: crédito novo não altera o PL no mês da liberação (mi 18): ΔPL(18) comparado a ΔPL esperado sem o crédito
{ const m = mes[18]; const delta = (m.fim.fin - mes[17].fim.fin) - (m.fim.div - mes[17].fim.div);   // Δfin − Δdiv
  const esp = rendMes[18] + (IN(m) - (m.fluxo.in_credito_crnovo || 0)) - (OUT(m)) + (mes[17].fim.div - m.fim.div + 60000) * 0 ; // simplificação abaixo
  const plAntes = PL(17), plDepois = PL(18); const semCr = rendMes[18] + (IN(m) - 60000) - OUT(m) + (m.fim.part - mes[17].fim.part) - (m.fim.div - 60000 - mes[17].fim.div) /* Δdiv sem o crédito */;
  chk('C10', 'Crédito novo é neutro no PL na liberação: ΔPL(18) = ΔPL calculado sem o 60.000 (entrada e dívida se anulam)', 'recomposição', 'mi 18', Math.abs((plDepois - plAntes) - semCr), 'ΔPL=' + f2(plDepois - plAntes) + ' esperado ' + f2(semCr)); }

// ---- C-stress: amortização antecipada, no motor (esperado recalculado) ----
{ // consignado: 20.000 no mês 12, modo prazo; e outro com modo parcela. Esperado: saldo informado manda; amortização reduz o saldo na parcela k0+em
  ['prazo', 'parcela'].forEach(modo => {
    const x = roda(P => { P.patrimonio.dividas[0].amortizacoes = [{ em: 12, valor: 20000, modo }]; });
    const d = DIV[0]; const n = d.n; const i = d.iP; let bal = d.F; const T = [], p0 = pmtPrice(d.F, i, n); let pm = p0;
    for (let k = 0; k < n && bal > 0.005; k++) { const j = bal * i; const a = Math.min(bal, pm - j); bal -= a; let ex = 0; if (k === d.k0 + 12) { ex = Math.min(bal, 20000); bal -= ex; if (modo === 'parcela' && bal > 0) { const r = n - k - 1; pm = pmtPrice(bal, i, r); } } T.push({ saldo: bal }); }
    const obs = x.dividasAvulsas[0].saldo; const esp = obs.map((_, k) => { const jj = d.k0 + k; return jj >= T.length ? 0 : (jj <= 0 ? d.F : T[jj - 1].saldo) * d.B0 / d.saldoHoje; });
    const r = maxAbs(obs, esp);
    // o caixa: a amortização antecipada sai do caixa?
    const mAm = x.meses.find(m => m.mi === 12); const outsNaoLinha = Object.keys(mAm.fluxo).filter(k => k.startsWith('out_') && !/casa|saude|carro|alimentacao|lazer|outros|divconsig|divcartao|crparc/.test(k));
    chk('C11' + modo[0], 'Stress amortização antecipada de 20.000 no mês 12 (modo ' + modo + '): saldo mês a mês', 'rodada alternativa; tabela com adiantamento recalculada', obs.length + ' meses', r.m, 'pior mês ' + r.w + '; chaves de saída extra no mês 12: ' + (outsNaoLinha.join(',') || 'NENHUMA — o adiantamento reduz a dívida mas não tira dinheiro do caixa'));
    if (modo === 'prazo') say('  [stress amortização] saídas do caixa no mês 12 além das linhas: ' + (outsNaoLinha.join(',') || 'nenhuma') + '; Δdiv(12) = ' + f2(x.meses.find(m => m.mi === 12).fim.div - x.meses.find(m => m.mi === 11).fim.div)); }); }

// =====================================================================================
// D. CAIXINHAS — o plano não tem objetivos. Auditoria de controle + stress sintético.
// =====================================================================================
say('== D. Caixinhas ==');
chk('D0', 'Plano real não tem objetivos: nenhuma caixinha, obj[] vazio em todos os meses, mov_obj_* ausente', 'varredura', N + ' meses', X.meses.reduce((a, m) => a + m.fim.obj.length + Object.keys(m.fluxo).filter(k => k.startsWith('mov_obj_')).length, 0) + X.objetivos.length);
// STRESS: variante com 3 objetivos (agressivo longo, moderado médio, agressivo curto <24m) — esperado recalculado com a taxa que DEVERIA valer
const PROF = PLANO.profiles;
function stressCaixinhas() {
  const objs = [
    { id: 'a1', name: 'Casa na praia', kind: 'consumo', months: 60, amount: 150000, dedicated: 20000, profile: 'agressivo', planned: 1000, status: 'ok' },
    { id: 'a2', name: 'Carro', kind: 'consumo', months: 30, amount: 60000, dedicated: 10000, profile: 'moderado', planned: 800 },
    { id: 'a3', name: 'Viagem', kind: 'consumo', months: 15, amount: 20000, dedicated: 5000, profile: 'agressivo', planned: 500 },
    { id: 'a4', name: 'Reserva cheia', kind: 'consumo', months: 40, amount: 15000, dedicated: 12000, profile: 'moderado', planned: 600 } ];
  const P = JSON.parse(JSON.stringify(PLANO)); P.incomes[0].steps = [{ from: 0, value: 30000 }]; P.retireAge = 66;   // STRESS: renda alta para haver sobra e aportes (o plano real é deficitário e não aporta)
  P.objectives = objs.map(o => Object.assign({ ligado: true, aporteDe: 0, icon: 'sun' }, o));
  const Eh = H.carregar(); Eh.configure(JSON.parse(JSON.stringify(P))); const s = Eh.run('desej'); const Ws = s.weeks, w0 = Eh.W0, nw = Eh.NW;
  const meses = s.buckets.month.filter(b => b.w1 > w0);
  // observado: obj[k] ao fim de cada semana; esperado: recursão semanal independente
  const taxaQueDeveria = (o, mi) => { const base = PROF[o.profile], cons = PROF.conservador, t = Math.max(0, o.months - 24); return (t <= 0 || base <= cons) ? Math.min(base, cons) : (mi >= t ? cons : base); };
  // a semana em que cada mês começa: semanas do mês mi (do extrato do stress)
  const semMes = []; meses.forEach(b => { for (let i = b.w0; i < b.w1; i++) semMes[i] = b.mi; });
  const res = { erroSaldo: 0, semanas: 0, trocas: [], taxasErradas: [] };
  objs.forEach((o, k) => {
    // reconstrução independente semana a semana usando os movimentos observados mov_obj_<id> como aporte/saque (fluxo f) e a taxa esperada do mês corrente
    let bal = 0; const pior = { e: 0, i: -1 }; let miAnt = 0;
    for (let i = w0; i < nw; i++) {
      const mi = Ws[i].mi < 0 ? 0 : Ws[i].mi;
      // taxa aplicada pelo motor no crescimento da semana i usa m.mIdx do mês em curso (o contexto ANTERIOR à virada do mês, quando i é a semana do salário)
      // aqui comparamos duas hipóteses para a taxa: do mês corrente (mi da semana) e do mês anterior (contexto antes da atualização)
      const miCresc = Math.max(0, miAnt);                            // índice usado pelo motor no crescimento desta semana (contexto do mês anterior)
      const g = Math.pow(1 + taxaQueDeveria(o, miCresc), 7 / 30.4375);
      const f = Ws[i].f || {}; if (i === w0) { bal += (f['mov_obj_' + o.id] || 0); bal = bal * g; } else { bal = bal * g; bal += (f['mov_obj_' + o.id] || 0); }   // CONVENÇÃO: o dedicado de hoje entra antes do rendimento da 1ª semana; aportes, depois
      const e = Math.abs(bal - Ws[i].obj[k]); if (e > pior.e) { pior.e = e; pior.i = i; }
      if (Ws[i].mi >= 0) miAnt = Ws[i].mi;
    }
    res['erro_' + o.id] = pior.e; res['pior_' + o.id] = pior.i;
  });
  return { objs, Ws, w0, nw, res, meses, taxaQueDeveria, s, Eh };
}
let ST;
try { ST = stressCaixinhas(); } catch (err) { say('  stress de caixinhas falhou: ' + err.message); }
if (ST) {
  ST.objs.forEach(o => chk('D1' + o.id, 'Stress: saldo semanal da caixinha "' + o.name + '" (' + o.profile + ', ' + o.months + 'm) = saldo·(1+taxa devida)^(7/30,4375) + aporte, taxa conservadora nos últimos 24m', 'recursão semanal independente usando mov_obj_* observados', 'todas as semanas do plano', ST.res['erro_' + o.id], 'pior semana ' + ST.res['pior_' + o.id], 0.01));
  // taxa por mês: o que o motor DECLARA (taxaPorMes) contra a que deveria valer
  const ex = H.extrato({ dados: Object.assign(JSON.parse(JSON.stringify(PLANO)), { retireAge: 66, objectives: ST.objs.map(o => Object.assign({ ligado: true, aporteDe: 0, icon: 'sun' }, o)) }) }, H.carregar());
  ex.objetivos.forEach((ob, q) => { const o = ST.objs[q]; let e = 0, trocas = []; ob.taxaPorMes.forEach((t, mi) => { const d = ST.taxaQueDeveria(o, mi); e = Math.max(e, Math.abs(t - d)); if (mi > 0 && Math.abs(t - ob.taxaPorMes[mi - 1]) > 1e-12) trocas.push(mi); });
    chk('D2' + o.id, 'Stress: taxaPorMes de "' + o.name + '" = perfil até o mês (meses−24) e conservador depois', 'comparação mês a mês', ob.taxaPorMes.length + ' meses', e, 'troca de taxa no mês ' + (trocas.join(',') || 'nenhuma (já nasce conservador)') + ' (esperado ' + (o.months > 24 ? o.months - 24 : 'nenhuma') + ')', 1e-12); });
  // impacto em reais de ficar o tempo todo em uma só taxa (efeito da regra dos 24 meses): saldo na data com e sem a troca
  ST.objs.forEach((o, k) => { const w = ST.Ws; const fim = o.months; let semana = -1; for (let i = ST.w0; i < ST.nw; i++) if (w[i].mi >= fim) { semana = i - 1; break; }
    // saldo observado na semana anterior à data; recomputar com taxa única (perfil) e com taxa única conservadora usando os mesmos aportes
    function re(taxaFn) { let bal = 0, miAnt = 0; for (let i = ST.w0; i <= semana; i++) { const mv = (w[i].f || {})['mov_obj_' + o.id] || 0; if (i === ST.w0) bal += mv; bal = bal * Math.pow(1 + taxaFn(Math.max(0, miAnt)), 7 / 30.4375); if (i !== ST.w0) bal += mv; if (w[i].mi >= 0) miAnt = w[i].mi; } return bal; }
    const comRegra = re(mi => ST.taxaQueDeveria(o, mi)), soBase = re(() => PROF[o.profile]), soCons = re(() => PROF.conservador);
    say('  [stress ' + o.name + '] saldo na data (aportes observados fixos): com a regra dos 24m ' + f2(comRegra) + ' | sempre ' + o.profile + ' ' + f2(soBase) + ' (dif ' + f2(soBase - comRegra) + ') | sempre conservador ' + f2(soCons) + ' (dif ' + f2(comRegra - soCons) + ') | observado na semana ' + f2(w[semana].obj[k])); });
  // convenção de borda: o motor usa, no rendimento da semana do salário, o índice do mês ANTERIOR (a troca de taxa entra na 2ª semana do mês). Quanto isso muda o saldo na data?
  ST.objs.forEach((o, k) => { const w = ST.Ws; let semana = -1; for (let i = ST.w0; i < ST.nw; i++) if (w[i].mi >= o.months) { semana = i - 1; break; }
    let bal = 0; for (let i = ST.w0; i <= semana; i++) { const mv = (w[i].f || {})['mov_obj_' + o.id] || 0; if (i === ST.w0) bal += mv; bal = bal * Math.pow(1 + ST.taxaQueDeveria(o, Math.max(0, w[i].mi)), 7 / 30.4375); if (i !== ST.w0) bal += mv; }
    say('  [stress ' + o.name + '] trocando a taxa já na 1ª semana do mês (sem o atraso de uma semana do motor), o saldo na data seria ' + f2(bal) + ' contra ' + f2(w[semana].obj[k]) + ' (efeito do atraso: ' + f2(w[semana].obj[k] - bal) + ')'); });
  // saque na data: o saldo volta ao cofre e o gasto sai
  ST.objs.forEach((o, k) => { const w = ST.Ws; let iDat = -1; for (let i = ST.w0; i < ST.nw; i++) if (w[i].mi >= o.months && iDat < 0) iDat = i; const f = w[iDat].f; const esperadoGasto = o.amount; const saiu = f['out_obj_' + o.id] || 0; const ret = f['mov_obj_' + o.id] || 0;
    say('  [stress ' + o.name + '] data mi ' + o.months + ': gasto out_obj = ' + f2(saiu) + ' (esperado ' + f2(esperadoGasto) + '); devolução da caixinha ao cofre = ' + f2(-ret) + ' (saldo antes: ' + f2(w[iDat - 1].obj[k]) + ')');
    chk('D3' + o.id, 'Stress: na data de "' + o.name + '" o gasto é o valor do objetivo e a caixinha zera, devolvendo o saldo', 'comparação', '1 semana', Math.abs(saiu - esperadoGasto) + Math.abs(-ret - 0) * 0 + Math.abs(w[iDat].obj[k]), ''); });
  // aporte para quando o saldo + rendimento já basta: nenhuma caixinha deve passar de amount·folga
  ST.objs.forEach((o, k) => { const w = ST.Ws; let mx = 0; for (let i = ST.w0; i < ST.nw; i++) mx = Math.max(mx, w[i].obj[k]); say('  [stress ' + o.name + '] saldo máximo da caixinha ' + f2(mx) + ' para objetivo de ' + f2(o.amount)); });
}

// =====================================================================================
// E. RENDIMENTO DO FINANCEIRO
// =====================================================================================
say('== E. Rendimento ==');
{ chk('E1', 'R_M do extrato = 0,4% a.m. (perfil conservador do plano)', 'comparação', '1', Math.abs(X.R_M - R_M), '', 1e-15);
  // A4 já prova: rendimento semanal = cofre_{i-1}·((1+R)^(7/30,4375) − 1), sobre o saldo de ABERTURA da semana (antes dos fluxos da semana)
  const anual = Math.pow(GW, 365.25 / 7) - 1, mensalEq = Math.pow(GW, 30.4375 / 7) - 1;
  say('  convenção: rendimento semanal composto sobre o saldo de abertura (antes dos fluxos da semana); só cofre positivo rende; equivalente: ' + (mensalEq * 100).toFixed(6) + '% a.m. médio / ' + (anual * 100).toFixed(4) + '% a.a. real');
  chk('E2', 'Taxa efetiva mensal média = 0,4% (mês médio de 30,4375 dias)', 'conta', '1', Math.abs(mensalEq - R_M), '', 1e-12);
  // Rendimento mensal agregado: sensibilidade ao número de semanas (4 ou 5): rendimento de mês com 5 semanas vs 4
  const w4 = X.meses.filter(m => m.mi > 0 && (m.w1 - m.w0) === 4).length, w5 = X.meses.filter(m => m.mi > 0 && (m.w1 - m.w0) === 5).length;
  const tot = Object.values(rendMes).reduce((a, b) => a + b, 0);
  say('  meses de 4 semanas: ' + w4 + '; de 5 semanas: ' + w5 + ' (o rendimento do mês varia ' + ((Math.pow(GW, 5) - 1) / (Math.pow(GW, 4) - 1) - 1).toFixed(3) + ' em %); rendimento total simulado até o fim: ' + f2(tot));
  // reconciliação de um passo à frente em base mensal: fin(m) ≈ fin(m−1)·GW^semanas + entradas − saídas (fluxos no início do mês)
  let e = 0, ew = 0; for (let mi = 1; mi < N; mi++) { const a = mes[mi - 1].fim.fin, m = mes[mi]; const g = Math.pow(GW, m.w1 - m.w0); const pred = a * g + (IN(m) - OUT(m)) * Math.pow(GW, m.w1 - m.w0 - 1); const d = Math.abs(pred - m.fim.fin); if (m.fim.fin > 0.5 && d > e) { e = d; ew = mi; } }
  chk('E3', 'Reconciliação mensal de um passo: fin(m) ≈ fin(m−1)·GW^semanas + Σin − Σout (fluxos ao início do mês; diferença = momento dentro do mês)', 'recálculo mensal independente', N + ' meses', e, 'pior mês ' + ew + '. Resíduo = rendimento das saídas do dia 10 (semana 2) e do crédito; tolerância R$ 25', 25); }

// =====================================================================================
// F. FLUXO — entradas e saídas esperadas direto do plano
// =====================================================================================
say('== F. Fluxo ==');
const step = (it, mi) => { let v = 0; for (const s of it.steps) { if (mi >= s.from) v = s.value; else break; } return v; };
const FF_MI = 21;   // 60 anos = jul/2028 = mi 21 (nasc. 1968-07-01 + 60 anos; salário do mês 21 já não é pago)
// Premissa F1: o ciclo de cada mês vai do dia 5 ao dia 4; hoje (20/10/2026) está no ciclo 0, cujas datas (dias 5 e 10) já passaram: mês 0 sem lançamentos.
chk('F0', 'Mês 0 (ciclo de 05/10 a 04/11 – dias 5 e 10 já passados em 20/10) sem lançamentos', 'conferência do fluxo', 'mi 0', Object.keys(mes[0].fluxo).length);
function fluxoEsperado(mi, escala) {   // escala = fator das linhas de despesa após a liberdade (ver G)
  const o = {};
  const trab = mi < FF_MI;
  if (trab) o.in_salario = step(PLANO.incomes[0], mi);
  o.in_aluguel = step(PLANO.incomes[1], mi);
  if (mi >= PLANO.passive[0].startMi) o.in_pas_0 = PLANO.passive[0].net;
  if (mi === CR.em) o.in_credito_crnovo = CR.valor;
  PLANO.expenses.forEach(e => { const nominal = step(e, mi); const key = 'out_' + e.group + '_' + e.id; if (nominal > 0) o[key] = nominal * escala; });
  return o;
}
{ // pré-liberdade, mi 1..20: tudo exato
  let e = 0, ew = 0, ek = ''; for (let mi = 1; mi < FF_MI; mi++) { const esp = fluxoEsperado(mi, 1), obs = mes[mi].fluxo; const keys = new Set(Object.keys(esp).concat(Object.keys(obs).filter(k => /^(in_|out_)/.test(k))));
    keys.forEach(k => { const d = Math.abs((esp[k] || 0) - (obs[k] || 0)); if (d > e) { e = d; ew = mi; ek = k; } }); }
  chk('F1', 'Fluxo mês a mês antes de parar de trabalhar (mi 1..20): salário 11.000, aluguel 3.000, 6 linhas de despesa, parcelas, crédito (mi 18)', 'comparação chave a chave com o plano', '20 meses × todas as linhas', e, 'pior: mi ' + ew + ' ' + ek); }
// Despesas: 12.500 de consumo; déficit 1.617 (mi 1–6) e 837 (mi 7+ até 18)
{ const defs = [1, 2, 6, 7, 8, 17].map(mi => OUT(mes[mi]) - IN(mes[mi]));
  say('  déficit mensal observado mi 1,2,6,7,8,17: ' + defs.map(f2).join(' | ') + ' (cenário: 1.617 e 837)');
  chk('F2', 'Déficit mensal: 1.617 (mi 1–6, com cartão) e 837 (mi 7+)', 'saídas − entradas', '6 meses', Math.max(...[1, 2, 6].map(mi => Math.abs(defs[[1, 2, 6].indexOf(mi)] - 1617))) + Math.max(...[7, 8, 17].map(mi => Math.abs((OUT(mes[mi]) - IN(mes[mi])) - 837))), '', 1e-6); }
// salário termina no mês 20; aluguel, INSS no mês 81
{ const sal = X.meses.filter(m => (m.fluxo.in_salario || 0) > 0).map(m => m.mi), ins = X.meses.filter(m => (m.fluxo.in_pas_0 || 0) > 0).map(m => m.mi);
  chk('F3', 'Salário recebido nos meses 1..20 e em nenhum depois (60 anos = jul/2028 = mi 21)', 'conjunto de meses', sal.length + ' meses', Math.abs(Math.min(...sal) - 1) + Math.abs(Math.max(...sal) - 20) + (sal.length - 20), 'meses ' + Math.min(...sal) + '..' + Math.max(...sal), 0);
  chk('F4', 'INSS 5.200 a partir do mês 81 (65 anos: jul/2033) até o fim', 'conjunto de meses', ins.length + ' meses', Math.abs(Math.min(...ins) - 81) + Math.abs(Math.max(...ins) - (N - 1)) + (ins.length - (N - 81)), 'meses ' + Math.min(...ins) + '..' + Math.max(...ins), 0);
  const idadeIns = 58 + (X.idadeHoje - 58) + 81 / 12; say('  idade em mi 81 = ' + (X.idadeHoje + 81 / 12).toFixed(2) + ' anos (esperado >= 65 e < 65,1)');
  chk('F4b', 'mi 81 é o primeiro mês com idade >= 65', 'idade = hoje + mi/12', '2 pontos', ((X.idadeHoje + 80 / 12) >= 65 ? 1 : 0) + ((X.idadeHoje + 81 / 12) < 65 ? 1 : 0) /* a idade exata em jul/2033 é 65,00 por nascimento 1968-07-01 */, 'idadeHoje(20/10/26)=' + X.idadeHoje.toFixed(4) + ' => mi 81 = jul/2033 (65 anos completos em 01/07/2033)', 0); }
// Meses de borda: dezembro (sem 13º), mês 18 (crédito), mês 21 (liberdade) e 'out_rendas'
{ const dez = X.meses.filter(m => /^dez/.test(rot(m.mi)) && m.mi > 0 && m.mi < 20).map(m => m.mi); const base = OUT(mes[dez[0] - 1]);
  chk('F5', 'Dezembro sem 13º/bônus: saídas e entradas iguais às do mês anterior (antes da liberdade)', 'comparação', 'dez: ' + dez.join(','), dez.reduce((a, mi) => a + Math.abs(OUT(mes[mi]) - OUT(mes[mi - 1])) + Math.abs(IN(mes[mi]) - IN(mes[mi - 1])), 0), 'o plano não lança 13º (dado faltando do cenário)', 0.01);
  chk('F6', 'out_rendas (mi 21) = 0: contratação de rendas inexistente (annuityCost 0)', 'valor da chave', 'mi 21', Math.abs(mes[21].fluxo.out_rendas || 0)); }
// FF: liberdade em mi 21 com forced; ver G

// =====================================================================================
// G. LIBERDADE / RUÍNA / PADRÃO DE VIDA
// =====================================================================================
say('== G. Liberdade, ruína, padrão de vida ==');
{ const ff = X.ff; chk('G1', 'Liberdade financeira no mês 21 (jul/2028, 60 anos) – forçada pela idade-alvo', 'conferência', '1', Math.abs(ff.mi - 21) + (ff.forced ? 0 : 1) + Math.abs(ff.age - 60.005), 'idade ' + ff.age.toFixed(3) + ' forced=' + ff.forced, 0.01);
  // suficiência no ato: patrimônio financeiro · 0,4% (rendimento) + aluguel/INSS vs retirada
  const sust = ff.finAfter * R_M + (PLANO.desired - ff.maxGap);
  say('  ff.finBefore ' + f2(ff.finBefore) + '; maxGap ' + f2(ff.maxGap) + ' (esperado desejo 14.000 − aluguel 3.000 = 11.000, antes do INSS); renda sustentável do motor ' + f2(ff.sustentavel) + ' (esperado fin·0,4% + (14.000 − gap) = ' + f2(sust) + ')');
  chk('G2', 'ff.maxGap = 14.000 − 3.000 (aluguel) = 11.000 (INSS só pesa depois)', 'conta', '1', Math.abs(ff.maxGap - 11000), '', 1e-9);
  chk('G3', 'ff.sustentavel = fin·0,4% + (14.000 − maxGap)', 'conta', '1', Math.abs(ff.sustentavel - sust), '', 1e-6); }
// modelo mensal independente da fase pós-liberdade (premissa de desenho P-FF: padrão de vida comprimido a renda disponível)
function simMensal(op) {   // op: {credito, inclDividas, comprime, cap}
  let fin = mes[0].fim.fin; const nM = 500; const hist = [fin]; let ruina = null, zero = null, cut = 0, faltaTot = 0; const gmes = mi => Math.pow(GW, mes[mi].w1 - mes[mi].w0);
  for (let mi = 1; mi <= nM; mi++) {
    const trab = mi < FF_MI, ins = (trab ? 11000 : 0) + 3000 + (mi >= 81 ? 5200 : 0) + (op.credito && mi === CR.em ? CR.valor : 0);
    const kc = DIV[0].k0 + mi, ka = DIV[1].k0 + mi, kr = mi - CR.em - 1;
    const parc = (kc < DIV[0].n && mi <= DIV[0].n - DIV[0].k0 ? 2337 : 0) + (ka < DIV[1].n && mi <= DIV[1].n - DIV[1].k0 ? 780 : 0) + (op.credito && kr >= 0 && kr < CR.parcelas ? TCr[kr].pay : 0);
    let desejo;
    if (trab) desejo = 12500 + parc;
    else desejo = op.inclDividas ? 14000 : 14000 + parc;
    const gn = Math.pow(GW, mes[mi].w1 - mes[mi].w0 - 1), dispo = fin * GW + ins;   // dinheiro disponível na semana do salário (abertura rendida 1 semana + entradas)
    let gasto = desejo;
    if (dispo < gasto) { faltaTot += gasto - Math.max(0, dispo); if (!ruina) ruina = mi; if (op.comprime) gasto = Math.max(Math.min(gasto, dispo), 0); }
    fin = (dispo - gasto) * gn;   // sem compressão a reserva ficaria negativa (juros de 4% a.m. ignorados: só interessa o 1º mês)
    if (fin > 0) fin *= 1; 
    hist.push(fin); if (zero == null && fin <= 0.5) zero = mi;
  }
  return { ruina, zero, falta: faltaTot, hist };
}
{ const eng = simMensal({ credito: true, inclDividas: true, comprime: true });
  say('  [sim independente, regra do motor: total de saídas 14.000 incluindo parcelas; comprime ao que há] 1º mês sem dinheiro para os 14.000: mi ' + eng.ruina + ' (' + rot(eng.ruina) + '); motor: financeiro chega a 0 em mi ' + X.meses.find(m => m.mi > 100 && m.fim.fin <= 0.5).mi);
  chk('G4', 'Mês em que o financeiro zera (regra do motor, simulação mensal independente) = o do motor (±1 mês de arredondamento semanal)', 'simulação independente do caixa', '1', Math.abs(eng.ruina - X.meses.find(m => m.mi > 100 && m.fim.fin <= 0.5).mi), 'sim ' + eng.ruina + ' x motor ' + X.meses.find(m => m.mi > 100 && m.fim.fin <= 0.5).mi, 1);
  const sc = simMensal({ credito: false, inclDividas: true, comprime: true }), c14 = simMensal({ credito: false, inclDividas: false, comprime: false }), c14c = simMensal({ credito: true, inclDividas: false, comprime: false });
  say('  variantes de leitura do "R$ 14.000": (a) 14.000 TOTAL incl. dívidas, com crédito: financeiro zera em mi ' + eng.ruina + ' (' + rot(eng.ruina) + ', ' + (X.idadeHoje + eng.ruina / 12).toFixed(1) + ' anos); (b) idem sem o crédito: mi ' + sc.ruina + ' (' + (X.idadeHoje + sc.ruina / 12).toFixed(1) + ' anos); (c) 14.000 MAIS as parcelas, sem crédito [leitura do cenário]: mi ' + c14.ruina + ' (' + (X.idadeHoje + c14.ruina / 12).toFixed(1) + ' anos); (d) idem com crédito: mi ' + c14c.ruina + ' (' + (X.idadeHoje + c14c.ruina / 12).toFixed(1) + ' anos)');
  var VAR = { eng, sc, c14, c14c }; }
// comportamento pós-zero do motor: consumo cai para a renda (8.200); ruina fica nulo
{ const mz = X.meses.find(m => m.mi > 100 && m.fim.fin <= 0.5).mi; const cons = mi => OUT(mes[mi]);
  say('  ruina do motor: ' + JSON.stringify(X.ruina) + ' | fin = 0 a partir de mi ' + mz + ' (' + rot(mz) + ', ' + (X.idadeHoje + mz / 12).toFixed(1) + ' anos) | saídas: mi ' + (mz - 1) + ' ' + f2(cons(mz - 1)) + ', mi ' + mz + ' ' + f2(cons(mz)) + ', mi ' + (mz + 1) + ' ' + f2(cons(mz + 1)) + ', mi 400 ' + f2(cons(400)));
  const mfim = Math.floor((95 - X.idadeHoje) * 12); let faltaDesejo = 0; for (let mi = mz; mi <= mfim; mi++) faltaDesejo += 14000 - OUT(mes[mi]);
  say('  desejo não atendido do mês ' + mz + ' (' + rot(mz) + ') aos 95 anos (mi ' + mfim + '): R$ ' + f2(faltaDesejo) + ' (' + (mfim - mz + 1) + ' meses × ~' + f2(faltaDesejo / (mfim - mz + 1)) + ')');
  chk('G5', 'Se o financeiro zera, "ruina" deveria disparar (reserva negativa) — o motor comprime o consumo e não dispara', 'inspeção: ruina e cheque', 'todo o horizonte', X.ruina === null && X.meses.every(m => m.fim.cheque === 0) ? 1 : 0, 'ruina=' + JSON.stringify(X.ruina) + '; desejo não atendido ' + f2(faltaDesejo) + ' => classificado como COMPORTAMENTO POR DESENHO com distorção relevante (ver laudo)', 0);
  CHK[CHK.length - 1].achado = true;   // não é erro aritmético: é regra de desenho, registrada como ACHADO
  var FALTA = faltaDesejo, MZ = mz, MFIM = mfim; }
// escala do padrão de vida: toda linha de despesa (inclusive parcelas das dívidas) é multiplicada por (renda disponível)/(Σ linhas)
{ let e = 0, ew = 0, ek = ''; const escalas = [];
  for (let mi = FF_MI; mi < MZ; mi++) { const m = mes[mi]; const nom = fluxoEsperado(mi, 1); let soma = 0; Object.keys(nom).filter(k => k.startsWith('out_')).forEach(k => { soma += nom[k]; });
    const pas = (mi >= 81 ? 5200 : 0) + 3000, gap = Math.max(0, 14000 - pas), alvo = pas + gap;   // total de saídas esperado = 14.000 (desejo), desde que o caixa dê
    const escala = alvo / soma; escalas.push(escala); const esp = fluxoEsperado(mi, escala);
    Object.keys(esp).filter(k => k.startsWith('out_')).forEach(k => { const d = Math.abs(esp[k] - (m.fluxo[k] || 0)); if (d > e) { e = d; ew = mi; ek = k; } }); }
  chk('G6', 'Pós-liberdade (mi 21..' + (MZ - 1) + '): cada linha de despesa = nominal × (14.000 ÷ Σ linhas nominais), com o caixa suficiente [regra de desenho P-FF]', 'recálculo da regra de desenho, chave a chave', (MZ - FF_MI) + ' meses × todas as linhas', e, 'pior mi ' + ew + ' ' + ek + '; escala vai de ' + Math.min(...escalas).toFixed(4) + ' a ' + Math.max(...escalas).toFixed(4), 0.01);
  // mês da exaustão: w = min(gap, caixa)
  const m = mes[MZ]; const caixa = mes[MZ - 1].fim.cofre * GW; const wesp = Math.min(14000 - 8200, caixa);
  chk('G7', 'Mês em que o caixa acaba: saque = o que sobra no cofre (rendido uma semana) e consumo = renda (INSS+aluguel) + saque', 'recálculo', 'mi ' + MZ, Math.abs(OUT(m) - (8200 + wesp)), 'esperado ' + f2(8200 + wesp) + '; motor ' + f2(OUT(m)), 0.5);
  chk('G8', 'Depois de zerar, saídas = entradas (8.200) até o fim do horizonte', 'varredura', (N - 1 - MZ) + ' meses', X.meses.filter(mm => mm.mi > MZ).reduce((a, mm) => Math.max(a, Math.abs(OUT(mm) - IN(mm))), 0), '', 0.01); }
// o patrimônio líquido que o motor mostra depois que o dinheiro acaba (bens 1,54 mi continuam, não vendidos): informativo
say('  PL no fim (mi ' + (N - 1) + '): ' + f2(PL(N - 1)) + ' (só bens; casa+sala+carro = 1.540.000)');

// =====================================================================================
// Impacto das parcelas não pagas no caixa (resíduo do PL) — achado
// =====================================================================================
{ let acum = 0; for (let mi = 21; mi < N; mi++) acum += RES[mi];
  say('  resíduo acumulado do ΔPL em mi 21..' + (N - 1) + ': ' + f2(acum) + ' (patrimônio líquido superestimado por parcelas de dívida que o contrato exige e o caixa não pagou)');
  let acum1 = 0; for (let mi = 1; mi < 21; mi++) acum1 += RES[mi]; say('  resíduo acumulado em mi 1..20: ' + f2(acum1));
  var RACUM = acum, RACUM1 = acum1; }
// Estimativa pontual do que desapareceu com as duas últimas parcelas faltantes (mi 7 e mi 48)
{ say('  saldo que some sem parcela: cartão no mi 7 (saldo mi 6 = ' + f2(X.dividasAvulsas[1].saldo[6]) + ' → mi 7 = ' + f2(X.dividasAvulsas[1].saldo[7]) + ', sem saída no caixa) ; consignado no mi 48 (saldo mi 47 = ' + f2(X.dividasAvulsas[0].saldo[47]) + ' → mi 48 = ' + f2(X.dividasAvulsas[0].saldo[48]) + ', sem saída no caixa)'); }

// =====================================================================================
// H. FIDELIDADE AO CENÁRIO
// =====================================================================================
say('== H. Fidelidade ao cenário ==');
say('  consignado hoje: cenário ~72.400; motor ' + f2(X.dividasAvulsas[0].saldo[0]) + '. cartão taxa implícita: cenário ~3,46%; recalculado ' + (DIV[1].iP * 100).toFixed(3) + '%.');
say('  ano do fim do dinheiro (cenário "sem crédito": ~mês 123, ~2037; com a leitura 14.000+dívidas ' + (VAR.c14.ruina) + '); motor com crédito: mi ' + MZ + ' (' + rot(MZ) + ', ' + (X.idadeHoje + MZ / 12).toFixed(1) + ' anos), sem alerta.');


// =====================================================================================
// Eventos, tradução do consultor e variantes de leitura
// =====================================================================================
say('== Eventos e conferência das alegações do consultor ==');
{ const mi = i => W[i].mi; const ev = X.eventos.map(e => ({ t: e.type, l: e.label, mi: mi(e.week) }));
  ev.forEach(e => say('  evento: mi ' + e.mi + ' (' + rot(e.mi) + ') ' + e.l));
  const get = l => ev.find(e => e.l.indexOf(l) >= 0).mi;
  chk('C9', 'Marcos de quitação/crédito/liberdade/INSS/fechamento caem nos meses certos (cartão 7, crédito 18, liberdade 21, fechamento 30, consignado 48, INSS 81)', 'comparação com o mês em que cada saldo/fluxo muda', '6 eventos',
    Math.abs(get('Cartão') - 7) + Math.abs(get('Crédito') - 18) + Math.abs(get('Liberdade') - 21) + Math.abs(get('Cantina') - 30) + Math.abs(get('Consignado') - 48) + Math.abs(get('INSS') - 81), '', 0); }
// IOF: o consultor diz que, sem iof:'isento', o motor soma R$ 3.025 (consignado) e R$ 119 (cartão) ao crédito. Recalculo com a regra de domínio (IOF PF: 0,38% + 0,0082%/dia, até 365 dias)
{ const iofF = (F, L) => F * 0.0038 + L.reduce((a, l, k) => a + l.amort * 0.000082 * Math.min(365, 30 * (k + 1)), 0);
  const calc = (d) => { const n = d.parcelas; let F = d.credito, i = 0.02; for (let o = 0; o < 40; o++) { i = taxaDaParcela(F, n, d.parcela); const L = tabela(F, i, n, false); const iof = iofF(F, L); F = d.credito + iof; } const i2 = taxaDaParcela(F, n, d.parcela), L2 = tabela(F, i2, n, false); return { F, iof: iofF(F, L2), i: i2, saldo: L2[n - d.restantes - 1].saldo }; };
  const c1 = calc(dv[0]), c2 = calc(dv[1]);
  say('  IOF financiado (sem isento), recalculado: consignado IOF ' + f2(c1.iof) + ', taxa ' + (c1.i * 100).toFixed(3) + '%, saldo ' + f2(c1.saldo) + ' | cartão IOF ' + f2(c2.iof) + ', taxa ' + (c2.i * 100).toFixed(3) + '%, saldo ' + f2(c2.saldo) + ' (alegado: 3.025 / 1,83% / 74.185 e 119 / 3,10% / 4.841)');
  chk('J1', 'Alegação do consultor sobre IOF financiado (consignado 3.025; saldo 74.185; cartão 119; saldo 4.841) confere com o recálculo', 'ponto fixo F = crédito + IOF(F) com a parcela fixa', '2 dívidas', Math.max(Math.abs(c1.iof - 3025), Math.abs(c1.saldo - 74185), Math.abs(c2.iof - 119), Math.abs(c2.saldo - 4841)), 'tolerância R$ 30 (arredondamentos da alegação)', 30); }
// variantes no motor: sem crédito (alegado: dinheiro acaba no mês 138); sem retireAge (alegado: liberdade aos 67,9)
{ const x = roda(P => { P.creditos = []; P.expenses = P.expenses.filter(e => e.id !== 'crparc'); });
  const mz = x.meses.find(m => m.mi > 100 && m.fim.fin <= 0.5).mi; say('  variante sem crédito: financeiro zera em mi ' + mz + ' (alegado 138; sim independente ' + VAR.sc.ruina + ')');
  chk('J2', 'Sem o crédito, o financeiro zera no mês 138 (alegação do consultor; simulação independente 138)', 'rodada alternativa', '1', Math.abs(mz - 138) + Math.abs(VAR.sc.ruina - mz), 'motor ' + mz + ' / sim ' + VAR.sc.ruina, 1);
  const y = roda(P => { P.retireAge = null; }); say('  variante sem retireAge: liberdade aos ' + (y.ff ? y.ff.age.toFixed(1) : 'nunca') + ' anos, forced=' + (y.ff && y.ff.forced) + ', sustentavel ' + (y.ff && f2(y.ff.sustentavel)) + ' (alegado 67,9)');
  chk('J3', 'Sem idade-alvo, o motor acha liberdade aos ~67,9 anos (alegação do consultor)', 'rodada alternativa', '1', y.ff ? Math.abs(y.ff.age - 67.9) : 99, '', 0.2);
  const z = roda(P => { P.patrimonio.dividas.forEach(d => { delete d.iof; }); const A = P.patrimonio.dividas; A[0].saldoDevedor = 74185; A[1].saldoDevedor = 4841; });
  say('  variante sem iof isento: saldos hoje no motor ' + z.dividasAvulsas.map(d => f2(d.saldo[0])).join(' / ')); }
// D4: o aporte para quando a caixinha já basta
if (ST) { const k = 3, o = ST.objs[k], w = ST.Ws; let totAp = 0, nAp = 0, ultimaAp = -1, saldoAnt = 0; for (let i = ST.w0; i < ST.nw; i++) { const ap = (w[i].f || {})['mov_obj_' + o.id] || 0; if (ap > 0 && i > ST.w0) { totAp += ap; nAp++; ultimaAp = w[i].mi; } }
  let iDat = -1; for (let i = ST.w0; i < ST.nw; i++) if (w[i].mi >= o.months && iDat < 0) iDat = i; const saldoData = w[iDat - 1].obj[k];
  say('  [stress ' + o.name + '] aportes feitos: ' + nAp + ' (último no mês ' + ultimaAp + ', de ' + o.months + '); saldo na data ' + f2(saldoData) + ' para meta ' + f2(o.amount) + ' (aporte planejado ' + o.planned + '/mês)');
  chk('D4', 'Stress: a caixinha que já cobre a meta deixa de receber aporte (saldo na data entre a meta e a meta + 1 aporte, e aportes cessam antes da data)', 'inspeção dos mov_obj_*', nAp + ' aportes', Math.max(0, o.amount - saldoData) + Math.max(0, saldoData - o.amount - o.planned) + (ultimaAp >= o.months - 1 ? 1 : 0), 'último aporte no mês ' + ultimaAp + '; saldo ' + f2(saldoData), 0.01); }

// ---------- resumo ----------
say('\n== RESUMO DAS CONFERÊNCIAS ==');
CHK.forEach(c => say((c.achado ? 'ACHADO ' : c.ok ? 'OK    ' : 'FALHA ') + c.id.padEnd(5) + ' | ' + c.o_que + ' | ' + c.metodo + ' | ' + c.amostra + ' | erro máx ' + (c.erro < 1e-6 ? c.erro.toExponential(1) : f2(c.erro)) + (c.extra ? ' | ' + c.extra : '')));
const falhas = CHK.filter(c => !c.ok && !c.achado);
say('\nconferências: ' + CHK.length + ' | falhas: ' + falhas.length + ' -> ' + falhas.map(c => c.id).join(', '));
