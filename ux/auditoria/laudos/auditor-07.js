// Auditor matemático do CENÁRIO 07 (Henrique e Sofia Vasconcellos). Reexecutável:  node ux\auditoria\laudos\auditor-07.js
// Recalcula de forma INDEPENDENTE (sem chamar trajetoriaDoBem, saldoDevedorEm, taxaDoObjetivo etc.) o que o motor deveria
// entregar, a partir do PLANO (planos/plano-07.json) e das regras do domínio, e compara com o OBSERVADO:
//   - extratos/extrato-07.json  (saída mensal do motor)
//   - as semanas da simulação (o motor roda por semana; só lemos weeks[i].fin/cofre/obj/bens/part/div/f/mi, nada de funções de conta)
// Premissas de desenho (do motor) aparecem marcadas como PREMISSA e são conferidas quanto à consistência.
const fs = require('fs'), path = require('path');
const AUD = path.join(__dirname, '..');
const plano = JSON.parse(fs.readFileSync(path.join(AUD, 'planos', 'plano-07.json'), 'utf8')).dados;
const X = JSON.parse(fs.readFileSync(path.join(AUD, 'extratos', 'extrato-07.json'), 'utf8'));
// OBSERVADO semanal: roda o motor uma vez e guarda apenas os números de saída (não usamos as funções de cálculo dele)
const H = require(path.join(AUD, 'harness.js'));
const Eng = H.carregar(); Eng.configure(JSON.parse(JSON.stringify(plano)));
const SIM = Eng.run('desej');
const WK = SIM.weeks.map((w, i) => w && ({ i, mi: w.mi, fin: w.fin, cofre: w.cofre, obj: Array.from(w.obj), bens: w.bens, part: w.part, div: w.div, f: w.f || {}, det: w.det }));
const EVENTOS = SIM.events;

const CHK = []; const NUM = {};
const fmt = n => (n < 0 ? '-' : '') + Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function chk(id, frente, o, metodo, amostra, err, tol, nota) { const ok = Math.abs(err) <= tol; CHK.push({ id, frente, o, metodo, amostra, err, tol, ok, nota }); return ok; }
const maxAbs = a => a.reduce((m, x) => Math.max(m, Math.abs(x)), 0);

// ============================ 0. CALENDÁRIO (independente, em UTC) ============================
const DAY = 864e5, WPY = 365.25 / 7, NW = Math.round(100 * WPY) + 1;
const BIRTH = Date.UTC(1968, 1, 1), SPOUSE_B = Date.UTC(1971, 4, 1), TODAY = Date.UTC(2026, 9, 15);
const idadeHoje = (TODAY - BIRTH) / (365.25 * DAY), idadeConj = (TODAY - SPOUSE_B) / (365.25 * DAY);
const W0 = Math.round(idadeHoje * WPY);
const weekStart = i => BIRTH + i * 7 * DAY;
const dia5 = i => { for (let j = 0; j < 7; j++) { const d = new Date(weekStart(i) + j * DAY); if (d.getUTCDate() === 5) return d; } return null; };
const cmDe = d => d.getUTCFullYear() * 12 + d.getUTCMonth();
const mesDaSemana = i => { for (let k = i; k > i - 6; k--) { const d = dia5(k); if (d) return cmDe(d); } return null; };
const CM0 = mesDaSemana(W0);
const miSem = i => { const c = mesDaSemana(i); return c == null ? 0 : c - CM0; };
chk('0.1', 'Calendário', 'semana de hoje (W0) e mês 0', 'idade exata × 365,25/7 a partir do nascimento 01/02/1968 e hoje 15/10/2026', 'W0, M0', Math.abs(W0 - X.W0) + Math.abs(Math.floor(CM0 / 12) - X.M0.y) + Math.abs(CM0 % 12 - X.M0.m), 0);
let eMi = 0, nMi = 0; for (let i = W0; i < NW; i++) { if (WK[i].mi !== miSem(i)) eMi++; nMi++; }
chk('0.2', 'Calendário', 'mês do motor de cada semana (semana com dia 5 abre o mês)', 'recalculado pelas datas das semanas', nMi + ' semanas', eMi, 0);
const mesRot = mi => { const c = CM0 + mi; return String(c % 12 + 1).padStart(2, '0') + '/' + Math.floor(c / 12); };
const miDe = (y, m) => y * 12 + (m - 1) - CM0;   // mês civil -> mi

// ============================ A. CONTABILIDADE (semanal) ============================
const R_M = plano.rate, GW = Math.pow(1 + R_M, 7 / 30.4375);
chk('A.0', 'Contab', 'taxa do patrimônio financeiro = plano.rate; perfis', 'comparação com o plano', 'R_M e PROFILES', Math.abs(X.R_M - R_M) + Math.abs(X.PROFILES.conservador - plano.profiles.conservador) + Math.abs(X.PROFILES.moderado - plano.profiles.moderado) + Math.abs(X.PROFILES.agressivo - plano.profiles.agressivo), 0);
const OBJ = plano.objectives;
const sumIn = f => Object.keys(f).filter(k => k.startsWith('in_')).reduce((a, k) => a + f[k], 0);
const sumOut = f => Object.keys(f).filter(k => k.startsWith('out_')).reduce((a, k) => a + f[k], 0);
// A.1 cofre(i) = cofre(i-1)·GW (se >0) + mov_cofre(i)
let eCof = 0, eZero = 0, eFin = 0, nan = 0, nSem = 0, minFin = Infinity, minCofre = Infinity;
for (let i = W0 + 1; i < NW; i++) {
  const a = WK[i - 1], b = WK[i], f = b.f; nSem++;
  const pre = a.cofre > 0 ? a.cofre * GW : a.cofre;
  eCof = Math.max(eCof, Math.abs(pre + (f.mov_cofre || 0) - b.cofre));
  // transferências somam zero: mov_cofre + Σmov_obj + mov_bens = entradas − saídas
  const mov = (f.mov_cofre || 0) + (f.mov_bens || 0) + OBJ.reduce((s, o) => s + (f['mov_obj_' + o.id] || 0), 0);
  eZero = Math.max(eZero, Math.abs(mov - (sumIn(f) - sumOut(f))));
  eFin = Math.max(eFin, Math.abs(b.fin - (b.cofre + b.obj.reduce((s, v) => s + v, 0))));
  for (const v of [b.fin, b.cofre, b.bens, b.part, b.div, ...b.obj]) if (!Number.isFinite(v)) nan++;
  minFin = Math.min(minFin, b.fin); minCofre = Math.min(minCofre, b.cofre);
}
chk('A.1', 'Contab', 'cofre(semana) = cofre(anterior)·(1+r)^(7/30,4375) + mov_cofre', 'recursão recalculada com a taxa do plano', nSem + ' semanas', eCof, 0.01);
chk('A.2', 'Contab', 'transferências (cofre, caixinhas, bens/participações) somam zero: Σmov = entradas − saídas', 'soma por semana', nSem + ' semanas', eZero, 0.01);
chk('A.3', 'Contab', 'financeiro = cofre + Σ caixinhas', 'soma por semana', nSem + ' semanas', eFin, 0.01);
chk('A.4', 'Contab', 'sem NaN/Infinity em fin, cofre, caixinhas, bens, part, div', 'varredura', nSem + ' semanas × 8 campos', nan, 0);
NUM.minFin = minFin; NUM.minCofre = minCofre;
// abertura: cofre = 14.000.000 − dedicados, crescendo uma semana
{ const ded = OBJ.reduce((s, o) => s + o.dedicated, 0); const esp = (plano.patrimonio.financeiro[0].valor - ded) * GW;
  chk('A.5', 'Contab', 'abertura: (14.000.000 − dedicados 4.429.800) rende a 1ª semana (W0)', 'valor × GW', 'semana W0', WK[W0].cofre - esp, 0.01, 'convenção: o rendimento da semana é aplicado ao saldo de abertura; os fluxos da semana entram no fim dela'); }

// ---- patrimônio mensal observado e identidade ΔPL = rendimento + (entradas − saídas) + reavaliação − Δdívida
const meses = X.meses; // mi 0..496
const PL = m => m.fim.fin + m.fim.bens + m.fim.part + (m.fim.prev || 0) - m.fim.div;
chk('A.6', 'Contab', 'patrimônio = financeiro + bens + participações + previdência − dívidas, por mês (soma dos detalhes)', 'Σ det.bens, Σ det.parts, Σ det.divs contra fim.bens/part/div', meses.length + ' meses', maxAbs(meses.map(m => (m.fim.det.bens.reduce((a, b) => a + b, 0) - m.fim.bens)) .concat(meses.map(m => (m.fim.det.parts.reduce((a, b) => a + b, 0) - m.fim.part))).concat(meses.map(m => (m.fim.det.divs.reduce((a, b) => a + b, 0) - m.fim.div)))), 0.01);

// ============================ B. PARTICIPAÇÕES (recálculo próprio) ============================
function trajetoria(item, H) {   // regra do domínio: valor inicial; alvo = ritmo geométrico até o valor; taxa % a.a. composta ao mês; pontual; nunca negativo
  const ev = item.valorizacao || [], alvos = ev.filter(e => e.tipo === 'alvo').map(e => ({ em: e.em, valor: e.valor })).sort((a, b) => a.em - b.em);
  const venda = item.venda || null;
  if (venda && venda.preco != null) alvos.push({ em: venda.em, valor: venda.preco }), alvos.sort((a, b) => a.em - b.em);
  const fim = venda ? venda.em : H, s = [item.valor != null ? item.valor : item.mercado]; let v = s[0];
  for (let m = 1; m <= fim; m++) {
    const a = alvos.find(x => x.em >= m);
    if (a) v = v > 0 && a.valor > 0 ? v * Math.pow(a.valor / v, 1 / (a.em - m + 1)) : v + (a.valor - v) / (a.em - m + 1);
    else ev.filter(e => e.tipo === 'taxa').forEach(e => { const de = e.de || 0, ate = de + Math.round(e.anos * 12); if (m - 1 >= de && m - 1 < ate) v *= Math.pow(1 + e.pct / 100, 1 / 12); });
    ev.filter(e => e.tipo === 'pontual' && e.em === m).forEach(e => { v = Math.max(0, v * (1 + e.pct / 100)); });
    s.push(v);
  }
  return s;
}
const HZ = Math.round((100 - idadeHoje) * 12);
const PARTS = plano.patrimonio.participacoes, BENS = plano.patrimonio.bens;
const serP = PARTS.map(p => trajetoria(p, HZ));
const vendaDe = (p, s) => { if (!p.venda) return null; const preco = p.venda.preco != null ? p.venda.preco : s[p.venda.em]; const custos = p.venda.custos.map(c => c.pct != null ? preco * c.pct / 100 : c.valor); const custo = custos.reduce((a, b) => a + b, 0); return { mi: p.venda.em, preco, custo, custos, liquido: preco - custo }; };
const vendP = PARTS.map((p, k) => vendaDe(p, serP[k]));
// formas fechadas independentes (conferência cruzada da própria recursão)
const logis = m => m <= 36 ? 18e6 * Math.pow(24 / 18, m / 36) : 24e6 * Math.pow(1.05, (m - 36) / 12);
const nogu = m => 6e6 * Math.pow(1.5, m / 62);
chk('B.0', 'Part', 'recursão própria = forma fechada (Logística: 18M·(24/18)^(m/36) até 36; 24M·1,05^((m−36)/12) depois; Nogueira: 6M·1,5^(m/62))', 'fórmulas fechadas', 'meses 0–120 / 0–62', Math.max(maxAbs(serP[0].map((v, m) => v - logis(m))), maxAbs(serP[1].map((v, m) => v - nogu(m)))), 0.01);
NUM.logis36 = serP[0][36]; NUM.logis119 = serP[0][119]; NUM.logis120 = serP[0][120]; NUM.nogu12 = serP[1][12]; NUM.nogu36 = serP[1][36]; NUM.vendP = vendP;
// motor: parts[].serie (trajetória) e fim.det.parts (detalhe mensal)
PARTS.forEach((p, k) => {
  const obs = X.parts[k].serie, esp = serP[k];
  let e1 = 0, n1 = 0; for (let m = 0; m < esp.length; m++) { e1 = Math.max(e1, Math.abs((obs[m] || 0) - esp[m])); n1++; }
  chk('B.1' + k, 'Part', `série da participação "${p.nome}" (trajetória)`, 'recursão própria × parts[].serie', n1 + ' meses', e1, 0.01);
  // detalhe mensal no fim de cada mês (det.parts[k]): igual ao valor do mês mi (mi≥1) até a venda; zero depois
  const venMi = p.venda ? p.venda.em : 1e9; let e2 = 0, n2 = 0;
  for (const m of meses) { if (m.mi < 1) { continue; } const esperado = m.mi >= venMi ? 0 : esp[Math.min(m.mi, esp.length - 1)]; e2 = Math.max(e2, Math.abs(m.fim.det.parts[k] - esperado)); n2++; }
  chk('B.2' + k, 'Part', `valor mensal no extrato da participação "${p.nome}" (det.parts) e zero após a venda`, 'esperado mês a mês × fim.det.parts[' + k + ']', n2 + ' meses (1–496)', e2, 0.01);
});
// mês 0: valores de abertura
chk('B.3', 'Part', 'abertura das participações no mês 0 = valores do plano (18M, 6M, 0,5M)', 'comparação', '3 itens', maxAbs(PARTS.map((p, k) => meses[0].fim.det.parts[k] - p.valor)), 0.01);
// vendas: preço, custos, líquido, fluxo, destino
PARTS.forEach((p, k) => {
  if (!p.venda) return; const v = vendP[k], m = meses[v.mi], F = m.fluxo;
  const custoObs = F['out_vendap_' + k], precoObs = -F.mov_bens;
  // o mov_bens do mês pode misturar compras; aqui só há a venda
  chk('B.4' + k, 'Part', `venda de "${p.nome}": preço (entra no financeiro), custos e líquido`, 'preço = valor projetado (ou informado); custos % ou R$ somados', 'mês ' + v.mi + ' (' + mesRot(v.mi) + ')', Math.abs(precoObs - v.preco) + Math.abs(custoObs - v.custo), 0.01, `preço ${fmt(v.preco)}; custos ${fmt(v.custo)}; líquido ${fmt(v.liquido)}; obs: preço ${fmt(precoObs)}, custos ${fmt(custoObs)}`);
  const ev = EVENTOS.find(e => e.type === 'venda' && e.label.indexOf(p.nome) === 0);
  NUM['venda' + k] = { esperado: v, evento: ev && ev.detail };
});
// destino do líquido (objetivos): partilha pelo domínio; "depois" se a venda é posterior à data do objetivo
const objPorId = id => OBJ.find(o => o.id === id);
{ const v0 = vendP[0], d0 = PARTS[0].venda.destinos[0], o0 = objPorId(d0.objetivo);
  const usado0 = Math.min(v0.liquido, d0.valor), depois0 = v0.mi > o0.months;
  const F = meses[v0.mi].fluxo;
  chk('B.5', 'Part', 'Logística: 20.000.000 do líquido vão à caixinha da Fundação (venda no mesmo mês da data, não é "depois"); o resto vai ao financeiro', 'min(líquido, destino); "depois" ⇔ mês da venda > meses do objetivo', 'mês ' + v0.mi, (depois0 ? 1 : 0) + Math.abs(F.out_obj_fundacao - o0.amount), 0.01, `usado ${fmt(usado0)}; sobra ao financeiro ${fmt(v0.liquido - usado0)}`);
  NUM.sobraLogis = v0.liquido - usado0;
  const v1 = vendP[1], d1 = PARTS[1].venda.destinos[0], o1 = objPorId(d1.objetivo);
  const depois1 = v1.mi > o1.months; const F1 = meses[v1.mi].fluxo;
  chk('B.6', 'Part', 'Nogueira: venda (mês 62) é POSTERIOR ao casamento (mês 60): não financia; nenhum mov_obj_casamento na venda', 'mês da venda > meses do objetivo ⇒ sem partilha', 'mês ' + v1.mi, (depois1 ? 0 : 1) + Math.abs(F1.mov_obj_casamento || 0), 0.01);
}
// depois da venda: participação zero, e renda "ligada" termina (o plano não liga renda a participação)
{ const ligadas = plano.incomes.filter(c => c.id && /lucros/.test(c.id)); NUM.lucrosEncerraEm = null;
  const ult = meses.filter(m => (m.fluxo.in_lucros_h || 0) > 0).map(m => m.mi).pop(); NUM.lucrosUltimoMes = ult;
  NUM.mesesSemLucroComEmpresa = PARTS[0].venda.em - (ult + 1); NUM.lucrosPerdidos = (PARTS[0].venda.em - (ult + 1)) * 180000; }
// reavaliação no mês da venda (parte cai pelo valor do mês anterior; preço do mês da venda entra no financeiro)
PARTS.forEach((p, k) => { if (!p.venda) return; const m = p.venda.em, wkIdx = WK.findIndex(w => w && w.mi === m);
  NUM['reavVenda' + k] = serP[k][m] - serP[k][m - 1]; });

// ============================ BENS (fazenda) ============================
const serB = BENS.map(b => trajetoria(b, HZ));
BENS.forEach((b, k) => { let e = 0, n = 0; for (const m of meses) { if (m.mi < 1) continue; const esp = serB[k][Math.min(m.mi, serB[k].length - 1)]; e = Math.max(e, Math.abs(m.fim.det.bens[k] - esp)); n++; }
  chk('B.7' + k, 'Part', `bem "${b.nome}": valor mensal (fazenda 3% a.a. por 20 anos: 11M·1,03^(m/12) até 240; depois constante)`, 'recursão própria × fim.det.bens', n + ' meses', e, 0.01); });
NUM.fazenda120 = serB[2][120]; NUM.fazenda240 = serB[2][240];

// ============================ C. DÍVIDAS ============================
const D = plano.patrimonio.dividas[0];
const F0 = D.credito, N = D.parcelas, P = D.parcela, B0 = D.saldoDevedor;
const pmtF = i => F0 * i / (1 - Math.pow(1 + i, -N));
let lo = 0, hi = 0.2; for (let r = 0; r < 200; r++) { const mm = (lo + hi) / 2; if (pmtF(mm) < P) lo = mm; else hi = mm; }
const iM = (lo + hi) / 2;   // taxa mensal que reproduz a parcela de 60.197 em 120x sobre 4.000.000 (Price, sem IOF)
const balPrice = j => F0 * Math.pow(1 + iM, j) - P * (Math.pow(1 + iM, j) - 1) / iM;   // saldo após j parcelas
const K0 = 36;   // parcelas pagas (cliente: 36 pagas; 1ª em 10/2023)
NUM.iMes = iM; NUM.iAno = Math.pow(1 + iM, 12) - 1; NUM.bal36 = balPrice(36); NUM.bal98 = balPrice(98); NUM.bal99 = balPrice(99);
chk('C.1', 'Dív', 'taxa implícita da parcela R$ 60.197 (Price, 120x, 4M) = 1,1% a.m. informado', 'bisseção sobre PMT', 'taxa', iM - 0.011, 1e-6, `i=${(iM * 100).toFixed(5)}% a.m.`);
chk('C.2', 'Dív', 'saldo após 36 parcelas (Price) × saldo informado pelo cliente (R$ 3.289.000)', 'F(1+i)^36 − P·((1+i)^36−1)/i', 'parcela 36', balPrice(36) - B0, 1, `contrato dá ${fmt(balPrice(36))}; cliente ${fmt(B0)}: dif ${fmt(balPrice(36) - B0)}`);
// PREMISSA do motor: o saldo informado manda hoje; o contrato dá o caminho (escala k = informado / contrato)
const kEsc = B0 / balPrice(K0);
const obsDiv = X.dividasAvulsas[0].saldo;
// (a) sem amortização: o saldo no INÍCIO do mês mi = k·bal(36+mi) (observado)
let eC3 = 0, nC3 = 0; for (let mi = 0; mi <= 62; mi++) { eC3 = Math.max(eC3, Math.abs(obsDiv[mi] - kEsc * balPrice(K0 + mi))); nC3++; }
chk('C.3', 'Dív', 'saldo devedor da série do motor (meses 0–62) = k·saldo_Price(36+mi), k = informado/contrato', 'tabela Price própria, escalada pelo saldo informado (PREMISSA do motor)', nC3 + ' meses', eC3, 0.01);
// (b) convenção temporal (R2): a série do motor no fim do mês mi já é o saldo DEPOIS da parcela do mês mi (a 1ª parcela em caixa é a do mês 1)
const pagoNoMes = mi => meses[mi].fluxo.out_fix_parcela_emprestimo || 0;
NUM.divFim = {}; for (const mi of [1, 2, 30, 55, 61, 62, 63]) NUM.divFim[mi] = { motor: meses[mi].fim.div, contratoAposParcela_36mais_mi: kEsc * balPrice(K0 + mi), contratoAposParcela_37mais_mi: kEsc * balPrice(K0 + mi + 1), caixaParcela: pagoNoMes(mi) };
{ let e = 0, n = 0; for (let mi = 1; mi <= 55; mi++) { const jur = pagoNoMes(mi) - (meses[mi - 1].fim.div - meses[mi].fim.div); const esp = iM * meses[mi - 1].fim.div; e = Math.max(e, Math.abs(jur - esp)); n++; }
  chk('C.9', 'Dív', 'juros do mês = taxa × saldo do início do mês: (parcela em caixa − amortização que baixou a dívida) = 1,1% × saldo anterior', 'meses 1–55 (antes da escala do padrão de vida)', n + ' meses', e, 6, 'resíduo ≤ R$ 6 vem do saldo informado diferir do contrato em R$ 300 (fator 0,99991)'); }
// (c) amortização antecipada: 2.500.000 em mi=62, modo prazo, limitada ao saldo
const am = D.amortizacoes[0];
const saldoAposParcela = mi => kEsc * balPrice(K0 + mi + 1);   // saldo depois da parcela #(37+mi) (1-based): a do mês 62 do calendário do contrato é a #99
NUM.amort = { pedido: am.valor, saldoAntes: kEsc * balPrice(K0 + am.em), saldoMotorFimMes62: meses[62].fim.div, saldoDepoisDaParcela: saldoAposParcela(am.em), usadoEsperado: Math.min(am.valor, saldoAposParcela(am.em)),
  caixaMotor: pagoNoMes(am.em), caixaContrato: P + Math.min(am.valor, saldoAposParcela(am.em)), consultorLancou: D.linha ? plano.expenses.find(e => e.id === D.linha).exc[String(am.em)] : null, divFimMes62: meses[62].fim.div, divFimMes63: meses[63].fim.div };
chk('C.4', 'Dív', 'quitação final: saldo = 0 a partir do mês seguinte à amortização e até o mês 496', 'varredura da série', 'meses 63–496', maxAbs(obsDiv.slice(63, 497)), 0.001);
chk('C.5', 'Dív', 'amortização de 2,5 mi limitada ao saldo: o saldo cai a zero no mês da amortização (mês 62) — esperado pelo domínio', 'saldo após a parcela 99 = ' + fmt(saldoAposParcela(62)) + ' < 2.500.000 ⇒ quita', 'fim do mês 62', meses[62].fim.div - 0, 0.01, 'OBSERVADO: dívida ainda ' + fmt(meses[62].fim.div) + ' no fim do mês 62 e zero só no mês 63 (defasagem de 1 mês entre caixa e saldo)');
// parcela que sai no fluxo
let eP = 0, nP = 0, listaEsc = [];
for (let mi = 1; mi <= 62; mi++) { const obs = pagoNoMes(mi); const esp = mi === 62 ? P + NUM.amort.usadoEsperado : P; if (Math.abs(obs - esp) > 0.01) listaEsc.push({ mi, obs, esp, dif: obs - esp }); nP++; }
NUM.parcelaDivergente = listaEsc; NUM.parcelaExcessoTotal = listaEsc.reduce((s, x) => s + x.dif, 0);
chk('C.6', 'Dív', 'a parcela que sai no fluxo (out_fix_parcela_emprestimo) é a do contrato (R$ 60.197; mês 62: parcela + quitação)', 'comparação mês a mês (meses 1–62)', nP + ' meses', maxAbs(listaEsc.map(x => x.dif)), 0.01, listaEsc.length + ' meses divergem (ver seção 4 do laudo)');
chk('C.7', 'Dív', 'depois da quitação a linha de parcela some (meses 63–496)', 'varredura', '434 meses', maxAbs(meses.filter(m => m.mi >= 63).map(m => m.fluxo.out_fix_parcela_emprestimo || 0)), 0.001);
// juros pagos = Σparcelas − principal (com a quitação antecipada), a partir de hoje
{ let jur = 0, princ = 0; for (let j = K0; j < K0 + 63; j++) { const t = (j - K0) + 1; /* parcelas mi=1..63 (contagem do motor) */ }
  const juros = []; let bal = balPrice(K0); let totJuros = 0, totPago = 0;
  for (let j = K0 + 1; j <= K0 + 63; j++) { const jr = balPrice(j - 1) * iM; totJuros += jr; totPago += P; }
  // parcelas 37..99 (63 pagamentos) + quitação do que resta após a #99
  const quit = balPrice(K0 + 63); NUM.jurosAteQuitar = { parcelas: 63, pagoParcelas: totPago, quitacao: quit, jurosTotal: totJuros, principalAmortizado: totPago + quit - totJuros, conferencia: (totPago + quit) - totJuros - balPrice(K0) };
  chk('C.8', 'Dív', 'juros pagos = Σ(parcelas) + quitação − principal amortizado (saldo hoje)', 'tabela própria #37–#99 + quitação', '63 parcelas', NUM.jurosAteQuitar.conferencia, 0.01); }
// dívida do contrato sem amortização: quando acabaria (para a nota de calendário)
NUM.fimContratoSemAmort = { parcelasRestantesContandoMes0: N - K0, mesDaUltima_R1: N - K0 - 1, mesDaUltima_R2: N - K0 };

// ============================ D. CAIXINHAS ============================
const PROF = plano.profiles;
const rateBase = o => PROF[o.profile];
const rateCons = PROF.conservador;
const mesCons = o => Math.max(0, Math.round(o.months) - 24);
const rateEsp = (o, mi) => { const b = rateBase(o), c = Math.min(b, rateCons), t = mesCons(o); return t <= 0 || b === c ? c : (mi >= t ? c : b); };
// D.1 taxaPorMes do extrato × regra
OBJ.forEach((o, k) => { const obs = X.objetivos[k].taxaPorMes; let e = 0; obs.forEach((v, mi) => { e = Math.max(e, Math.abs(v - rateEsp(o, mi))); });
  chk('D.1.' + o.id, 'Caixa', `taxa por mês da caixinha "${o.name}" (${o.profile}, ${o.months} meses): perfil até o mês ${mesCons(o) || '—'} e conservador nos 24 finais`, 'regra do domínio × taxaPorMes', obs.length + ' meses', e, 1e-12); });
// D.2 recursão semanal da caixinha com a taxa certa (o rendimento da semana i usa o mês da semana i-1; ver PREMISSA no laudo)
function reconstroi(k, rateFn, opc) {
  opc = opc || {}; const o = OBJ[k], saldo = new Array(NW).fill(0); let b = 0;
  for (let i = W0; i < NW; i++) {
    const g = Math.pow(1 + rateFn(o, i === W0 ? 0 : miSem(i - 1)), 7 / 30.4375); const mov = WK[i].f['mov_obj_' + o.id] || 0;
    b = i === W0 ? mov * g : b * g + mov; saldo[i] = b;
  }
  return saldo;
}
const erroCx = [];
OBJ.forEach((o, k) => { const rec = reconstroi(k, rateEsp); let e = 0, n = 0, quando = null;
  for (let i = W0; i < NW; i++) { const d = Math.abs(rec[i] - WK[i].obj[k]); if (d > e) { e = d; quando = i; } n++; }
  chk('D.2.' + o.id, 'Caixa', `saldo semanal da caixinha "${o.name}" = saldo·(1+taxa certa)^(7/30,4375) + aportes observados`, 'recursão própria, taxa pelo perfil/24 meses', n + ' semanas', e, 0.01); });
// D.3 taxa implícita semana a semana (sem olhar o motor): (saldo − mov)/saldo anterior
const trocas = {};
OBJ.forEach((o, k) => { const lista = []; let desvio = 0;
  for (let i = W0 + 1; i < NW; i++) { const prev = WK[i - 1].obj[k]; if (prev <= 1) continue; const mov = WK[i].f['mov_obj_' + o.id] || 0; if (WK[i].obj[k] === 0 && mov < 0) continue;
    const g = (WK[i].obj[k] - mov) / prev; const r = Math.pow(g, 30.4375 / 7) - 1; const e = rateEsp(o, miSem(i - 1)); desvio = Math.max(desvio, Math.abs(r - e)); lista.push({ i, mi: miSem(i), r }); }
  const cons = lista.filter(x => Math.abs(x.r - rateCons) < 1e-9), base = lista.filter(x => Math.abs(x.r - rateBase(o)) < 1e-9);
  trocas[o.id] = { semanas: lista.length, desvioMax: desvio, primeiraSemanaConservadora: cons.length && rateBase(o) !== rateCons ? cons[0] : null, ultimaSemanaPerfil: base.length && rateBase(o) !== rateCons ? base[base.length - 1] : null };
  chk('D.3.' + o.id, 'Caixa', `taxa mensal equivalente aplicada a cada semana na caixinha "${o.name}" = taxa esperada do mês`, 'taxa implícita (saldo−aporte)/saldo anterior', lista.length + ' semanas', desvio, 1e-9); });
NUM.trocas = trocas;
// D.4 contrafactuais: a mesma sequência de aportes à taxa única
function saldoNaDataCom(k, rateFn) { const o = OBJ[k], rec = reconstroi(k, rateFn); const iData = WK.findIndex(w => w && w.i >= W0 && w.mi === o.months && w.f['mov_obj_' + o.id] !== undefined && (w.f['out_obj_' + o.id] !== undefined)); return { rec, iData }; }
const R = {};
OBJ.forEach((o, k) => {
  const iData = (() => { for (let i = W0; i < NW; i++) if (WK[i].f['out_obj_' + o.id] !== undefined) return i; return -1; })();
  const entradaVenda = (() => { const v = PARTS.map((p, j) => ({ p, j })).filter(x => x.p.venda && x.p.venda.destinos.some(d => d.objetivo === o.id)); return v; })();
  const calc = rateFn => { let b = 0; for (let i = W0; i <= iData; i++) { const g = Math.pow(1 + rateFn(o, i === W0 ? 0 : miSem(i - 1)), 7 / 30.4375); let mov = WK[i].f['mov_obj_' + o.id] || 0;
      if (i === iData) { /* antes do saque: tira o saque (−saldo) e deixa só as entradas */ const entrada = entradaVenda.length && !(PARTS[entradaVenda[0].j].venda.em > o.months) ? Math.min(vendP[entradaVenda[0].j].liquido, PARTS[entradaVenda[0].j].venda.destinos[0].valor) : 0; mov = entrada; }
      b = i === W0 ? mov * g : b * g + mov; } return b; };
  R[o.id] = { iData, certo: calc(rateEsp), tudoPerfil: calc(() => rateBase(o)), tudoConservador: calc(() => rateCons), observado: X.objetivos[k].real, valor: o.amount };
  // remove, do saldo "contrafactual", o que veio da venda (não rende) — já está em 'mov' acima como entrada no mês da data (sem render)
});
NUM.caixinhas = R;
OBJ.forEach((o, k) => chk('D.4.' + o.id, 'Caixa', `saldo na data da caixinha "${o.name}": reconstruído × saldo observado (objective.real)`, 'recursão própria até a semana da data', 'data mês ' + o.months, R[o.id].certo - R[o.id].observado, 0.01, `certo ${fmt(R[o.id].certo)}; só ${o.profile}: ${fmt(R[o.id].tudoPerfil)}; só conservador: ${fmt(R[o.id].tudoConservador)}`));
// D.5 valor esperado "à mão" do cenário com juros mensais cheios (convenção pura de meses)
{ const fund = 3e6 * Math.pow(1.006, 96) * Math.pow(1.004, 24); NUM.fundacaoMensalPura = fund; NUM.fundacaoMensalPuraDif = R.fundacao.observado - 20e6 - (fund);
  const reforma = 1429800 * Math.pow(1.004, 12); NUM.reformaMensalPura = reforma; NUM.reformaDif = R.reforma.observado - reforma;
  // semanas decorridas da abertura à data (explica a diferença):
  const semFund = R.fundacao.iData - W0 + 1; NUM.semanasFund = semFund; NUM.mesesEqFund = semFund * 7 / 30.4375;
  const semRef = R.reforma.iData - W0 + 1; NUM.semanasRef = semRef; NUM.mesesEqRef = semRef * 7 / 30.4375; }
// D.6 aporte necessário (fórmula do domínio: aportes de fim de mês; taxa por mês; 60 aportes) × required do extrato
{ const o = OBJ[1]; let A = 0; for (let m = 0; m < o.months; m++) { const t = rateEsp(o, m); A = A * (1 + t) + 1; }   // aporte de 1 ao fim de cada mês
  const req = o.amount / A; NUM.casamentoFator = A; NUM.casamentoNecessario = req;
  chk('D.6', 'Caixa', 'aporte necessário do casamento (800.000, 60 meses, moderado→conservador nos últimos 24): esperado "à mão" R$ 11.691', 'anuidade própria', 'objetivo casamento', req - X.objetivos[1].required, 0.01, `fator ${A.toFixed(4)}; ${fmt(req)}`);
  const o0 = OBJ[0]; let A0 = 0; for (let m = 0; m < o0.months; m++) A0 = A0 * (1 + rateEsp(o0, m)) + 1; NUM.reformaFator = A0; NUM.reformaNecessarioSemDedicado = o0.amount / A0; NUM.reformaNecessarioComDedicado = Math.max(0, (o0.amount - o0.dedicated * Math.pow(1.004, 12)) / A0); }
// D.7 aportes: início, fim (liberdade) e regra de "já basta"
{ const o = OBJ[1]; const ap = meses.map(m => m.fluxo['mov_obj_casamento'] || 0); const ult = ap.map((v, i) => v > 0 ? i : -1).filter(i => i >= 0).pop(); NUM.casamentoAportes = { primeiro: ap.findIndex(v => v > 0), ultimo: ult, soma: ap.slice(0, 60).reduce((a, v) => a + (v > 0 ? v : 0), 0), mi55: ap[55], mi54: ap[54] };
  // se aportes pararem em mi=m, quanto sobraria na data? (usa o saldo semanal do motor como ponto de partida, taxa certa)
  const saldoProj = (iStart) => { let b = WK[iStart].obj[1]; for (let i = iStart + 1; i <= R.casamento.iData; i++) b = b * Math.pow(1 + rateEsp(o, miSem(i - 1)), 7 / 30.4375); return b; };
  const lista = []; for (let mi = 40; mi <= 56; mi++) { const iFim = (() => { let j = -1; for (let i = W0; i < NW; i++) if (WK[i].mi === mi) j = i; return j; })(); lista.push({ mi, saldoFimMes: WK[iFim].obj[1], projSemNovosAportes: saldoProj(iFim) }); }
  NUM.casamentoProjecao = lista; }
// Reforma: custo do saque
NUM.reformaFaltaCofre = OBJ[0].amount - R.reforma.observado;

// D.8 movimentos de cada caixinha: abertura (dedicado), aportes, venda destinada e saque na data
NUM.movimentos = {}; OBJ.forEach((o, k) => { const lista = []; for (let i = W0; i < NW; i++) { const v = WK[i].f['mov_obj_' + o.id]; if (v) lista.push({ i, mi: WK[i].mi, v }); } const aportes = lista.filter(x => x.v > 0), saque = lista.filter(x => x.v < 0);
  NUM.movimentos[o.id] = { n: lista.length, aberturaW0: (WK[W0].f['mov_obj_' + o.id] || 0), dedicadoPlano: o.dedicated, primeiroAporte: aportes.length ? aportes[0].mi : null, ultimoAporte: aportes.length ? aportes[aportes.length - 1].mi : null, saquesMi: saque.map(x => x.mi), saqueValor: saque.map(x => x.v), saidaNaData: (meses[o.months].fluxo['out_obj_' + o.id] || 0), saldoAposSaque: WK[R[o.id].iData].obj[k] };
  chk('D.8.' + o.id, 'Caixa', 'caixinha "' + o.name + '": dedicado na abertura = plano; saque no mês da data (' + o.months + '); saldo zerado depois; gasto de consumo = valor', 'fluxos semanais da caixinha', lista.length + ' movimentos', Math.abs((WK[W0].f['mov_obj_' + o.id] || 0) - o.dedicated) + Math.abs(NUM.movimentos[o.id].saidaNaData - o.amount) + Math.abs(NUM.movimentos[o.id].saldoAposSaque) + (saque.length === 1 && saque[0].mi === o.months ? 0 : 1) , 0.01); });

// ============================ E. RENDIMENTO ============================
{ let eE = 0, n = 0; for (let i = W0 + 1; i < NW; i++) { const a = WK[i - 1], b = WK[i]; if (a.cofre <= 0) continue; const g = (b.cofre - (b.f.mov_cofre || 0)) / a.cofre; const rm = Math.pow(g, 30.4375 / 7) - 1; eE = Math.max(eE, Math.abs(rm - R_M)); n++; }
  chk('E.1', 'Contab', 'taxa mensal equivalente aplicada ao cofre em cada semana = 0,4% a.m. (plano.rate)', 'taxa implícita', n + ' semanas', eE, 1e-9, 'convenção: juros compostos semanais (1+r)^(7/30,4375) sobre o saldo de abertura da semana; fluxos da semana entram depois'); }
// rendimento acumulado mensal de uma amostra (consistência da convenção): crescimento do cofre no mês = Σ semanas
{ const pontos = [1, 12, 36, 62, 76, 120, 300]; NUM.rendimentoMes = pontos.map(mi => { let r = 0; for (let i = W0 + 1; i < NW; i++) if (WK[i].mi === mi) r += WK[i - 1].cofre * (GW - 1); return { mi, rendimento: r, semanas: WK.filter(w => w && w.mi === mi).length }; }); }

// ============================ F. FLUXO (plano → mês) ============================
const stepBase = (it, mm) => { let v = 0; for (const st of it.steps) { if (mm >= st.from) v = st.value; else break; } return v; };
const valorLinha = (it, mm) => { if (it.exc && it.exc[String(mm)] != null) return it.exc[String(mm)]; return mm >= (it.steps[0] ? it.steps[0].from : 0) ? stepBase(it, mm) : 0; };
const retireMiTit = Math.round((plano.retireAge - idadeHoje) * 12), retireMiConj = Math.round((plano.spouseRetireAge - idadeConj) * 12);
const alvoLib = Math.min(plano.retireAge, idadeHoje + plano.spouseRetireAge - idadeConj);
let ffWeek = null; for (let i = W0 + 1; i < NW; i++) { if (dia5(i) && i / WPY >= alvoLib) { ffWeek = i; break; } }
const ffMi = miSem(ffWeek);
NUM.ff = { idadeAlvo: alvoLib, week: ffWeek, mi: ffMi, data: mesRot(ffMi), retireMiTit, retireMiConj, idadeConj, idadeHoje };
chk('G.1', 'Liberd', 'semana/mês de início da liberdade financeira (primeira semana com dia 5 e idade do titular ≥ min(65; 58,70+60−idade da Sofia))', 'recálculo pela idade e calendário', 'ff.week/ff.mi', Math.abs(ffWeek - X.ff.week) + Math.abs(ffMi - X.ff.mi), 0);
const incomes = plano.incomes, expenses = plano.expenses;
const passive = plano.passive;
const INSS = mi => passive.reduce((s, p) => s + (mi >= p.startMi ? p.net : 0), 0);
const trabalha = (c, mi) => (c.kind === 'passiva') || mi < Math.max(ffMi, c.pessoa === 'conjuge' ? retireMiConj : retireMiTit);
const gap = mi => Math.max(0, plano.desired - INSS(mi) - incomes.filter(c => c.kind === 'passiva').reduce((s, c) => s + valorLinha(c, mi), 0) - incomes.filter(c => c.kind !== 'passiva' && trabalha(c, mi)).reduce((s, c) => s + valorLinha(c, mi), 0));
const custoVida = mi => expenses.reduce((s, c) => s + stepBase(c, mi), 0) || 1;
const escala = mi => { if (mi < ffMi) return 1; const pas = INSS(mi), alug = incomes.filter(c => c.kind === 'passiva').reduce((s, c) => s + stepBase(c, mi), 0), trab = incomes.filter(c => c.kind !== 'passiva' && trabalha(c, mi)).reduce((s, c) => s + stepBase(c, mi), 0); return Math.max(0, pas + alug + trab + gap(mi)) / custoVida(mi); };
let eIn = 0, eOut = 0, nF = 0, eEsc = 0; const difOut = [];
for (const m of meses) { if (m.mi < 1 || m.mi >= 496) continue; const F = m.fluxo; nF++;   // mês 496 = 1 semana de borda do horizonte (100 anos), sem ciclo de despesas
  // entradas
  let inEsp = 0; incomes.forEach(c => { const esp = (c.kind === 'passiva' || trabalha(c, m.mi)) ? valorLinha(c, m.mi) : 0; inEsp += esp; eIn = Math.max(eIn, Math.abs((F['in_' + c.id] || 0) - esp)); });
  const inss = passive.reduce((s, p, k) => s + (m.mi >= p.startMi ? p.net : 0), 0); passive.forEach((p, k) => { eIn = Math.max(eIn, Math.abs((F['in_pas_' + k] || 0) - (m.mi >= p.startMi ? p.net : 0))); });
  // saídas: cada linha = valor × escala
  const s = escala(m.mi); expenses.forEach(c => { const base = valorLinha(c, m.mi); const k = 'out_' + c.group + '_' + c.id; const esp = base * s; const d = (F[k] || 0) - esp; eOut = Math.max(eOut, Math.abs(d)); if (Math.abs(d) > 0.01) difOut.push({ mi: m.mi, linha: c.id, obs: F[k] || 0, esp }); });
}
chk('F.1', 'Fluxo', 'entradas do mês (salário, pró-labore, lucros, aluguel, INSS) contra o plano, com paradas às idades de aposentadoria (Sofia mi ' + retireMiConj + '→ liberdade ' + ffMi + '; Henrique mi ' + retireMiTit + ')', 'valor do degrau, parada por pessoa', nF + ' meses (1–495)', eIn, 0.01);
chk('F.2', 'Fluxo', 'saídas do mês (cada linha = degrau × escala do padrão de vida; escala = 1 antes da liberdade)', 'recálculo das regras de escala (PREMISSA do motor)', nF + ' meses (1–495)', eOut, 0.01, difOut.length + ' pares mês×linha divergem');
NUM.difOut = difOut.slice(0, 20); NUM.escalaMeses = [1, 55, 56, 62, 63, 75, 76, 200].map(mi => ({ mi, escala: escala(mi) }));
// meses de borda (amostra descritiva)
NUM.borda = [0, 1, 12, 26, 27, 55, 56, 60, 62, 63, 75, 76, 115, 119, 120, 121].map(mi => { const F = meses[mi].fluxo; return { mi, mes: mesRot(mi), in: sumIn(F), out: sumOut(F) }; });
// mês 0 sem renda/despesa
chk('F.3', 'Fluxo', 'mês 0 (out/2026): as rendas/despesas de 5–10/out caem ANTES de hoje (15/out) e não entram; só a abertura (dedicados)', 'datas', 'mês 0', sumIn(meses[0].fluxo) + sumOut(meses[0].fluxo), 0.001);
// 13º/bônus/frequências: o plano não os tem
NUM.planoSemSazonais = incomes.every(c => c.frequency === 'mensal') && expenses.every(c => c.frequency === 'mensal');
// A.7 identidade do patrimônio mês a mês: Δ PL = rendimento + (entradas − saídas) + reavaliação − Δdívida
{ // reavaliação independente
  const reavBens = mi => BENS.reduce((s, b, k) => s + (serB[k][Math.min(mi, serB[k].length - 1)] - serB[k][Math.min(mi - 1, serB[k].length - 1)]), 0);
  const reavParts = mi => PARTS.reduce((s, p, k) => { const v = p.venda ? p.venda.em : 1e9; if (mi < v) return s + (serP[k][mi] - serP[k][mi - 1]); if (mi === v) return s + (serP[k][mi] - serP[k][mi - 1]); return s; }, 0);
  // rendimento mensal: Σ semanas do mês de (cofre_{i-1}·(GW−1) + Σ obj_{i-1}·(g−1)) com taxa certa
  let eId = 0, nId = 0, pior = null;
  for (let mi = 1; mi <= 496; mi++) { let rend = 0, fluxoLiq = 0; for (let i = W0 + 1; i < NW; i++) if (WK[i].mi === mi) { const a = WK[i - 1]; rend += (a.cofre > 0 ? a.cofre * (GW - 1) : 0); OBJ.forEach((o, k) => { rend += a.obj[k] * (Math.pow(1 + rateEsp(o, miSem(i - 1)), 7 / 30.4375) - 1); }); fluxoLiq += sumIn(WK[i].f) - sumOut(WK[i].f); }
    const dPL = PL(meses[mi]) - PL(meses[mi - 1]); const dDiv = (X.dividasAvulsas[0].saldo[mi] ? 0 : 0);
    // dívida: usamos a dívida observada do extrato (a conferência da dívida é C) — aqui isolamos a conservação
    const esp = rend + fluxoLiq + reavBens(mi) + reavParts(mi) - (meses[mi].fim.div - meses[mi - 1].fim.div);
    const e = Math.abs(dPL - esp); nId++; if (e > eId) { eId = e; pior = mi; } }
  chk('A.7', 'Contab', 'ΔPatrimônio(mês) = rendimentos (recalculados) + entradas − saídas + reavaliações (recalculadas) − Δdívida', 'identidade por mês', nId + ' meses', eId, 1.0, 'pior mês ' + pior + ' (tolerância 1,00 por arredondamentos das somas semanais em cada ponta de mês)'); }

// ============================ G. LIBERDADE / RUÍNA ============================
{ const age = X.ff.age, horizon = Math.round((plano.lifeExp - age) * 12);
  let maxGap = 0; for (let mm = 0; mm < horizon; mm++) maxGap = Math.max(maxGap, gap(ffMi + mm));
  const pending = OBJ.filter(o => o.months > ffMi).reduce((s, o) => s + o.amount, 0);   // casamento + fundação ainda por realizar na liberdade
  const finAntes = WK[ffWeek].fin;   // aproximação: o motor mede no instante da semana
  const inv = X.ff.finAfter, sustenta = (inv - pending) * R_M >= maxGap;
  const sustentavel = inv * R_M + (plano.desired - maxGap);
  NUM.liberdade = { maxGap, pendingNaLiberdade: pending, sustenta, forcedEsperado: !sustenta, forcedObs: X.ff.forced, sustentavelEsperado: sustentavel, sustentavelObs: X.ff.sustentavel, horizonteMeses: horizon, finBefore: X.ff.finBefore, finMin: minFin, finFinal: meses[496].fim.fin, ruina: X.ruina };
  chk('G.2', 'Liberd', 'maxGap (maior falta de renda até os 95) = R$ 158.000 e "sustentável" = finAfter·0,4% + (180.000 − maxGap)', 'recálculo', 'ff', Math.abs(maxGap - X.ff.maxGap) + Math.abs(sustentavel - X.ff.sustentavel), 0.5);
  chk('G.3', 'Liberd', 'ruína: financeiro nunca fica negativo ⇒ ruina = null', 'mínimo semanal do financeiro e do cofre', NW - W0 + ' semanas', (minCofre < 0 || X.ruina) ? 1 : 0, 0, 'mínimo do financeiro ' + fmt(minFin));
  chk('G.4', 'Liberd', 'forced (liberdade "forçada") = !((financeiro − pendências)·r ≥ maxGap), com pendências = casamento 800.000 + fundação 20.000.000', 'recálculo', 'ff', (sustenta === !X.ff.forced) ? 0 : 1, 0, 'forced=' + X.ff.forced + ' porque a pendência da fundação (R$ 20 mi) entra no teste, embora seja paga pela venda da Logística'); }
// despesas depois da liberdade vs gasto declarado
{ let fantasma = 0, n = 0; const decl = mi => 148000 + (mi <= 62 ? 60197 : 0);   // gasto declarado (sem faculdade após dez/2028) + parcela contratual
  const lista = []; for (let mi = ffMi; mi <= retireMiTit - 1; mi++) { const out = Object.keys(meses[mi].fluxo).filter(k => /^out_(fix|adj)_/.test(k)).reduce((a, k) => a + meses[mi].fluxo[k], 0); const esp = mi === 62 ? 148000 + P + NUM.amort.usadoEsperado : decl(mi); /* só linhas de despesa do Fluxo (sem a venda e o casamento) */ lista.push({ mi, obs: out, declarado: esp, extra: out - esp }); fantasma += out - esp; n++; }
  NUM.gastoAlemDoDeclarado = { meses: n, total: fantasma, de: mesRot(ffMi), ate: mesRot(retireMiTit - 1), amostra: lista.filter(x => [56, 61, 62, 63, 75].includes(x.mi)) };
  NUM.gastoPosAposentadoria = { gasto: sumOut(meses[100].fluxo), declarado: 148000, extraMes: sumOut(meses[100].fluxo) - 148000 }; }
// contrafactuais de impacto no financeiro (cofre rende GW por semana; nada mais muda): devolve a diferença no financeiro em semanas-chave
function cfCofre(extraPorSemana) { let d = 0; const out = {}; for (let i = W0 + 1; i < NW; i++) { d = d * GW + (extraPorSemana[i] || 0); if ([3392, 3583, 3584, 5218].includes(i)) out['sem' + i + '(mi ' + WK[i].mi + ')'] = d; } return out; }
{ // (1) sem a escala do padrão de vida na liberdade: gasto = declarado (linhas ÷ escala) e parcela contratual
  const ex = {}; let tot = 0, totLinhas = 0;
  for (let i = W0 + 1; i < NW; i++) { const mi = WK[i].mi; if (mi < ffMi || mi >= retireMiTit) continue; const sc = escala(mi); if (sc === 1) continue; let o = 0; for (const k in WK[i].f) if (/^out_(fix|adj)_/.test(k)) o += WK[i].f[k]; ex[i] = o - o / sc; tot += ex[i]; }
  NUM.efeitoEscalaNaLiberdade = { gastoAMaisTotal: tot, deltaFinanceiro: cfCofre(ex) };
  // (2) lucros continuando até a venda (mi 76–119): 180.000/mês no dia 5, líquido
  const ex2 = {}; let t2 = 0; for (let i = W0 + 1; i < NW; i++) { const mi = WK[i].mi; if (mi >= retireMiTit && mi < PARTS[0].venda.em && WK[i].f.in_aluguel_campo) { ex2[i] = 180000; t2 += 180000; } }
  NUM.efeitoLucrosAteAVenda = { rendaAMais: t2, deltaFinanceiro: cfCofre(ex2) }; }
// escala de despesa contratual
NUM.escalaNaParcela = { meses: NUM.parcelaDivergente.map(x => x.mi), excesso: NUM.parcelaExcessoTotal };
// última saída >0
NUM.ultimoMesComDespesa = meses.filter(m => sumOut(m.fluxo) > 0).map(m => m.mi).pop();

// ============================ H. FIDELIDADE ============================
NUM.fid = {
  parcela: { cenario: 60197, cliente: 60197, contratoPMT: pmtF(0.011) },
  saldoApos36: { cenario: 3289301, contrato: balPrice(36), informado: B0 },
  saldoApos99: { cenario: 1123271, contrato: balPrice(99), motorFimMes62: meses[62].fim.div, motorEscalado: kEsc * balPrice(99) },
  logLiquido: { cenario: 27354032, motor: vendP[0].liquido, preco: vendP[0].preco, custos: vendP[0].custo },
  nogLiquido: { cenario: 8280000, motor: vendP[1].liquido },
  startup: { m13: meses[13].fim.det.parts[2], m14: meses[14].fim.det.parts[2] },
  reforma: { cenario: 122272, desenhoDoConsultor: 'dedicado 1.429.800 hoje', semDedicado: NUM.reformaNecessarioSemDedicado },
  casamento: { cenario: 11691, motor: X.objetivos[1].required, planejado: OBJ[1].planned },
  fundacao: { cenario: 5863224, motor: R.fundacao.observado - 20e6 },
  fazenda10a: { cenario: 14783080, motor: serB[2][120] }
};
chk('H.1', 'Fidelidade', 'startup: R$ 500.000 até o mês 13 e R$ 0 do mês 14 em diante (sem valor negativo)', 'det.parts[2]', 'meses 13, 14 e 14–496', Math.abs(meses[13].fim.det.parts[2] - 500000) + maxAbs(meses.filter(m => m.mi >= 14).map(m => m.fim.det.parts[2])), 0.01);
chk('H.2', 'Fidelidade', 'líquido da Logística R$ 27.354.032 (cenário) × motor', 'comparação', 'venda', vendP[0].liquido - 27354032, 1, `motor ${fmt(vendP[0].liquido)}`);
chk('H.3', 'Fidelidade', 'líquido da Nogueira R$ 8.280.000', 'comparação', 'venda', vendP[1].liquido - 8280000, 0.01);
chk('H.4', 'Fidelidade', 'fazenda em 10 anos 11.000.000·1,03^10 = R$ 14.783.080 (cenário)', 'fórmula', 'mês 120', serB[2][120] - 14783080, 1);
chk('H.5', 'Fidelidade', 'valores da Nogueira nos meses 12 e 36 (cenário: 6.489.832 e 7.592.727)', 'fórmula', '2 meses', Math.abs(serP[1][12] - 6489832) + Math.abs(serP[1][36] - 7592727), 1, `calculado ${fmt(serP[1][12])} e ${fmt(serP[1][36])}`);
chk('H.6', 'Fidelidade', 'fundação: excesso devolvido ao financeiro (cenário, meses puros: R$ 5.863.224) × motor (semanas)', 'comparação', 'mês 120', (R.fundacao.observado - 20e6) - 5863224, 10000, `motor ${fmt(R.fundacao.observado - 20e6)}; dif ${fmt((R.fundacao.observado - 20e6) - 5863224)} (convenção semanal)`);

// ============================ SAÍDA ============================
const byFrente = {}; CHK.forEach(c => { (byFrente[c.frente] = byFrente[c.frente] || []).push(c); });
console.log('=== AUDITORIA CENÁRIO 07 — ' + CHK.length + ' conferências ===');
for (const c of CHK) console.log((c.ok ? 'OK    ' : 'FALHA ') + c.id.padEnd(8) + ' erro=' + (Math.abs(c.err) < 1e-3 ? c.err.toExponential(2) : fmt(c.err)).padStart(18) + ' tol=' + c.tol + ' | ' + c.o + ' | ' + c.amostra + (c.nota ? ' | ' + c.nota : ''));
console.log('\n=== NÚMEROS DE APOIO ===');
console.log(JSON.stringify(NUM, (k, v) => typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v, 1));
module.exports = { CHK, NUM };
