// AUDITOR MATEMÁTICO — cenário 10 (Pedro e Júlia Lima). Reexecutável:  node ux/auditoria/laudos/auditor-10.js
// Parte do PLANO (planos/plano-10.json) e das regras do domínio financeiro e recalcula tudo com código próprio.
// O "observado" é só a saída do motor: extratos/extrato-10.json (mensal) e, para a conferência semana a semana das
// caixinhas e do caixa, uma nova execução do motor pelo harness (as semanas não estão no extrato). Nenhuma função do
// motor (trajetoriaDoBem, saldoDevedorEm, taxaDoObjetivo...) é usada para produzir o "esperado"; a única exceção é o
// bloco de estresse final (S9), que usa contratoDaDivida do motor como OBSERVADO contra fórmulas próprias.
// Saída: relatório no console; com a variável AUDIT_OUT=arquivo.json grava também os números em JSON.
'use strict';
const fs = require('fs'), path = require('path');
const AUD = path.join(__dirname, '..');
const plano = JSON.parse(fs.readFileSync(path.join(AUD, 'planos', 'plano-10.json'), 'utf8')).dados;
const X = JSON.parse(fs.readFileSync(path.join(AUD, 'extratos', 'extrato-10.json'), 'utf8'));
const H = require(path.join(AUD, 'harness.js'));

const OUT = { checks: [], achados: {}, tabelas: {} };
const abs = Math.abs, max = (a) => a.reduce((m, v) => Math.max(m, v), 0);
const fmt = v => (v == null ? '—' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
let nChk = 0;
function check(id, nome, metodo, amostra, erroMax, ok, nota) {
  OUT.checks.push({ n: ++nChk, id, nome, metodo, amostra, erroMax, ok, nota: nota || '' });
  console.log(`[${ok ? 'OK ' : 'ERRO'}] ${id} ${nome} | amostra: ${amostra} | erro máx: ${typeof erroMax === 'number' ? fmt(erroMax) : erroMax}${nota ? ' | ' + nota : ''}`);
}
const TOL = 0.01;

// ============================================================================================================
// S0. Premissas do domínio e calendário próprio
// ============================================================================================================
// Premissas de DESENHO (não são aritmética; o laudo as lista): taxas reais líquidas ao mês: conservador 0,4%, moderado
// 0,5%, agressivo 0,6%; o caixa livre ("reserva"/cofre) rende a taxa do plano (0,4% a.m.); a semana rende (1+r)^(7/30,4375);
// os 24 últimos meses antes da data a caixinha vai para a conservadora. Os valores abaixo vêm do EXTRATO (PROFILES, R_M),
// e são conferidos contra o que o plano diz (o plano não os informa: valem os padrões do motor).
const PROF = X.PROFILES, R_M = X.R_M, MESES_CONS = X.MESES_CONSERVADOR;
const WEEK_M = 7 / 30.4375;                  // fração de mês de uma semana (premissa do motor)
const gSem = r => Math.pow(1 + r, WEEK_M);
const DAY = 864e5, WPY = 365.25 / 7, NW = Math.round(100 * WPY) + 1;
const dnasc = s => { const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(s); return Date.UTC(+m[1], +m[2] - 1, m[3] ? +m[3] : 1); };
const NASC = dnasc(plano.nascimento), INI = dnasc(plano.inicio);
const W0 = Math.round(((INI - NASC) / (365.25 * DAY)) * WPY);      // a semana de "hoje" (arredondada para a semana mais próxima)
const wStart = i => NASC + i * 7 * DAY;
const day5Cm = i => { for (let k = 0; k < 7; k++) { const d = new Date(wStart(i) + k * DAY); if (d.getUTCDate() === 5) return d.getUTCFullYear() * 12 + d.getUTCMonth(); } return null; };
let CM0 = null; for (let k = W0; k > W0 - 7 && CM0 == null; k--) CM0 = day5Cm(k);
const OPEN = [];                                                    // semana que abre cada mês do plano (a que contém o dia 5)
for (let i = W0 - 8; i < NW; i++) { const c = day5Cm(i); if (c != null && c - CM0 >= 0) OPEN[c - CM0] = i; }
const NM = X.meses.length;                                          // meses 0..822
const miDaSemana = i => { let lo = 0, hi = OPEN.length - 1; if (i < OPEN[0]) return 0; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (OPEN[m] <= i) lo = m; else hi = m - 1; } return lo; };
const calMes = mi => (CM0 + mi) % 12;                               // 0 = janeiro
const calAno = mi => Math.floor((CM0 + mi) / 12);
const ID_IDX = { apto: 0, filho: 1, carro: 2, casacampo: 3, casamento: 4 };
const OBJS = plano.objectives.map(o => ({ ...o }));

{ // calendário: minhas semanas de abertura contra as do extrato
  let err = 0, n = 0;
  for (let mi = 1; mi < NM - 1; mi++) { const m = X.meses[mi]; err = Math.max(err, abs(m.w0 - OPEN[mi]), abs(m.w1 - OPEN[mi + 1])); n++; }
  check('S0.1', 'Calendário: semana de abertura de cada mês (semana com o dia 5) e mês 0', 'grade semanal própria ancorada no nascimento (1995-04-01, sábado); W0 = round(idade·52,18)', `${n} meses`, err, err === 0,
    `W0=${W0} (semana de ${new Date(wStart(W0)).toISOString().slice(0, 10)}), mês 0 = ${calAno(0)}-${String(calMes(0) + 1).padStart(2, '0')}`);
  OUT.achados.calendario = { W0, semanaW0: new Date(wStart(W0)).toISOString().slice(0, 10), mes0: calAno(0) + '-' + (calMes(0) + 1), diaInicioPlano: plano.inicio };
}

// ============================================================================================================
// Execução semanal do motor (observado semana a semana) — confere se é igual ao extrato gravado
// ============================================================================================================
const E = H.carregar();
const PP = JSON.parse(JSON.stringify(plano)); E.configure(PP);
const S = E.run('desej'); const WK = S.weeks;
{ // o extrato regerado é o mesmo do arquivo?
  const reg = H.extrato({ dados: plano }, E);
  const same = JSON.stringify(reg.meses) === JSON.stringify(X.meses);
  check('S0.2', 'Reprodutibilidade: motor reexecutado = extrato-10.json', 'comparação byte a byte dos 823 meses', '823 meses', same ? 0 : 1, same);
}
const wf = (i, k) => (WK[i].f && WK[i].f[k]) || 0;
const RW = i => { let r = 0; const f = WK[i].f || {}; for (const k in f) { if (k.startsWith('in_')) r += f[k]; else if (k.startsWith('out_')) r -= f[k]; } return r; };

// ============================================================================================================
// S1. Participação societária (frente B)
// ============================================================================================================
const part = plano.patrimonio.participacoes[0], V0 = part.valor;
const alvos = part.valorizacao.filter(v => v.tipo === 'alvo').map(v => ({ em: v.em, valor: v.valor }));
alvos.push({ em: part.venda.em, valor: part.venda.preco });          // regra do domínio: o preço de venda é o valor esperado no mês da venda
alvos.sort((a, b) => a.em - b.em);
const serieP = (mi) => { // valor esperado: ritmo geométrico (taxa constante) entre marcos sucessivos
  let m0 = 0, v0 = V0; for (const a of alvos) { if (mi <= a.em) return v0 * Math.pow(a.valor / v0, (mi - m0) / (a.em - m0)); m0 = a.em; v0 = a.valor; } return 0; };
{
  const T = X.parts[0]; let eSerie = 0, eDet = 0, eFim = 0, nn = 0;
  for (let mi = 0; mi <= part.venda.em; mi++) { eSerie = Math.max(eSerie, abs(serieP(mi) - T.serie[mi])); nn++; }
  for (let mi = 0; mi < NM; mi++) { const esp = mi < part.venda.em ? serieP(mi) : 0; eDet = Math.max(eDet, abs(esp - X.meses[mi].fim.det.parts[0])); eFim = Math.max(eFim, abs(esp - X.meses[mi].fim.part)); }
  check('S1.1', 'Participação: série mensal do valor (marcos 36 → 175.781 e 84 → 400.000, ritmo geométrico)', 'V(m)=V0·(Alvo/V0)^(m/36) e 175.781·(400.000/175.781)^((m−36)/48), recalculado', `${nn} meses (0..84)`, eSerie, eSerie < TOL);
  check('S1.2', 'Participação: fim.det.parts e fim.part em todos os meses (zero depois da venda)', 'comparação mensal com a série própria; depois do mês 84 esperado 0', `${NM} meses`, Math.max(eDet, eFim), Math.max(eDet, eFim) < TOL);
  const nonneg = X.meses.every(m => m.fim.part >= 0 && m.fim.det.parts[0] >= 0);
  check('S1.3', 'Participação: nunca negativa', 'varredura dos 823 meses', `${NM} meses`, 0, nonneg);
  OUT.achados.partAmostra = [12, 24, 35, 36, 37, 48, 60, 83, 84].map(mi => ({ mi, esperado: mi <= 84 ? serieP(mi) : 0, motor: mi <= 84 ? T.serie[mi] : 0, erro: abs((mi <= 84 ? serieP(mi) : 0) - (mi <= 84 ? T.serie[mi] : 0)) }));
  OUT.achados.parteDoCenario = { mes36: V0 * Math.pow(400000 / V0, 36 / 84), mes60: V0 * Math.pow(400000 / V0, 60 / 84), mes36Cliente25aa: V0 * Math.pow(1.25, 3) };
  // venda
  const mv = part.venda.em, M = X.meses[mv];
  const corretagem = part.venda.preco * 0.01, imposto = 46500, custo = corretagem + imposto, liq = part.venda.preco - custo;
  const eC = abs((M.fluxo.out_vendap_0 || 0) - custo);
  const eMovBens = abs((M.fluxo.mov_bens || 0) + part.venda.preco);
  // o líquido vai ao saldo da caixinha da casa de campo: mov_obj_casacampo(84) = líquido + aporte do mês
  const aporteCasa = plano.objectives.find(o => o.id === 'casacampo').planned;
  const eDest = abs((M.fluxo.mov_obj_casacampo || 0) - (liq + aporteCasa));
  const venda = X.parts[0].venda;
  const eVendaCampos = max([abs(venda.preco - part.venda.preco), abs(venda.custo - custo), abs(venda.liquido - liq), abs(venda.projetado - serieP(mv)), venda.mi === mv ? 0 : 1]);
  check('S1.4', 'Venda (mês 84): preço, custos (1% + R$ 46.500), líquido, saída da participação e destino do líquido', 'preço 400.000 − 4.000 − 46.500 = 349.500; mov_bens = −400.000; mov_obj_casacampo = 349.500 + 518', '1 mês (84) + parts[0].venda', max([eC, eMovBens, eDest, eVendaCampos]), max([eC, eMovBens, eDest, eVendaCampos]) < TOL, `líquido esperado ${fmt(liq)} × motor ${fmt(venda.liquido)}`);
  OUT.achados.venda = { preco: part.venda.preco, corretagem, imposto, liquidoEsperado: liq, liquidoMotor: venda.liquido, movObjCasa84: M.fluxo.mov_obj_casacampo };
  // conservação do mês da venda: caixa + caixinhas ganham o que a participação perde (exceto valorização do mês)
  const antes = X.meses[mv - 1].fim, dep = M.fim;
  const ganhoValorizacao = part.venda.preco - antes.part;                 // a valorização de 83→84 é realizada na venda
  OUT.achados.valorizacaoRealizadaNaVenda = ganhoValorizacao;
  // renda ligada à participação: nenhuma linha de renda do plano aponta para a participação
  const rendaLigada = plano.incomes.filter(i => /lumen|partic|startup/i.test(i.label + i.origin + (i.id || '')));
  check('S1.5', 'Depois da venda: participação = 0 e nenhuma renda ligada continua', 'busca de linhas de renda ligadas à participação no plano + fim.part=0 de 84 a 822', `${NM - mv} meses`, rendaLigada.length, rendaLigada.length === 0 && X.meses.slice(mv).every(m => m.fim.part === 0), 'o plano não liga renda à participação (sem pró-labore/dividendos)');
}

// ============================================================================================================
// S2. Dívidas (frente C): contratos das compras de objetivo
// ============================================================================================================
const objApto = plano.objectives.find(o => o.id === 'apto'), objCarro = plano.objectives.find(o => o.id === 'carro');
// --- Apartamento: SAC 360 parcelas, taxa anual 10,2%, isento de IOF, 1ª parcela no mês da data (60)
const Fapto = objApto.preco - objApto.amount, nApto = objApto.compra.parcelas, iApto = Math.pow(1 + objApto.compra.juros / 100, 1 / 12) - 1;
const saPto = []; { let bal = Fapto; for (let k = 0; k < nApto; k++) { const jur = bal * iApto, am = Fapto / nApto; bal -= am; saPto.push({ jur, am, pay: jur + am, saldo: Math.max(0, bal) }); } }
const miApto0 = objApto.months;
// --- Consórcio: carta 90.000 + 15% = 103.500, 60 parcelas (saldo/parcelas que faltam), lance 25% do saldo após a parcela 49
const cc = objCarro.compra, totalCons = cc.carta * (1 + cc.txAdm / 100 + cc.fundoReserva / 100);
const consTab = []; let lanceContrato = 0; { let Sd = totalCons; const N = cc.parcelas, kLance = objCarro.months - cc.inicio + 1;
  for (let k = 0; k < N; k++) { const am = Sd / (N - k); Sd -= am; let ex = 0; if (k + 1 === kLance) { ex = Sd * cc.lancePct / 100; lanceContrato = ex; Sd -= ex; } consTab.push({ am, pay: am, ex, saldo: Sd }); } }
const parteBem = cc.carta / totalCons;                                       // 1 real pago ao consórcio compra 0,8696 de carta; o resto é taxa de administração
{
  // 2.1 apartamento: parcela mensal de cada mês, 360 meses
  let e = 0, cnt = 0;
  for (let mi = 0; mi < NM; mi++) { const k = mi - miApto0, esp = k >= 0 && k < nApto ? saPto[k].pay : 0, obs = X.meses[mi].fluxo.out_fix_apto_compra || 0; e = Math.max(e, abs(esp - obs)); if (esp) cnt++; }
  check('S2.1', 'Apartamento (SAC 520.000, 360x, 10,2% a.a.): parcela de cada mês no fluxo', 'i=(1,102)^(1/12)−1; parcela=520.000/360 + saldo·i; 1ª no mês 60', `${cnt} parcelas (meses 60 a 419) + zero fora`, e, e < TOL, `1ª parcela esperada ${fmt(saPto[0].pay)}; motor ${fmt(X.meses[60].fluxo.out_fix_apto_compra)}`);
  const somaPay = saPto.reduce((a, l) => a + l.pay, 0), somaJur = saPto.reduce((a, l) => a + l.jur, 0), obsPay = X.meses.reduce((a, m) => a + (m.fluxo.out_fix_apto_compra || 0), 0);
  check('S2.2', 'Apartamento: total pago, juros = Σparcelas − principal e quitação em zero', 'Σ parcelas esperada vs fluxo; saldo final da tabela', '360 parcelas', abs(somaPay - obsPay), abs(somaPay - obsPay) < 0.5 && saPto[nApto - 1].saldo < 1e-6, `juros totais ${fmt(somaPay - Fapto)} (Σjuros=${fmt(somaJur)}), saldo final ${fmt(saPto[nApto - 1].saldo)}`);
  OUT.achados.apto = { principal: Fapto, taxaMes: iApto, parcela1: saPto[0].pay, parcelaUltima: saPto[nApto - 1].pay, jurosTotais: somaJur, totalPago: somaPay };
  // 2.3 consórcio
  let e2 = 0, c2 = 0; const slot = k => k + 1;                                // 1ª parcela cai no mês 1 (o k=1 de outubro já passou)
  for (let mi = 0; mi < NM; mi++) { const k = mi - 1, esp = k >= 0 && k < cc.parcelas ? consTab[k].pay : 0, obs = X.meses[mi].fluxo.out_fix_carro_compra || 0; e2 = Math.max(e2, abs(esp - obs)); if (esp) c2++; }
  const obsSoma = X.meses.reduce((a, m) => a + (m.fluxo.out_fix_carro_compra || 0), 0), espSoma = consTab.reduce((a, l) => a + l.pay, 0);
  check('S2.3', 'Consórcio do carro: parcela de cada mês (1.725 até a 49ª; 1.293,75 nas 11 seguintes)', 'saldo/parcelas que faltam; lance 25% do saldo pós-parcela 49 reduz o saldo (prazo mantido); parcelas nos meses 1..60', `${c2} parcelas + zero fora`, e2, e2 < TOL, `Σ parcelas ${fmt(espSoma)} (+ lance ${fmt(lanceContrato)} = ${fmt(espSoma + lanceContrato)} = carta+taxa)`);
  check('S2.4', 'Consórcio: lance do bolso (25% do saldo após a parcela 49)', 'saldo 103.500·(60−49)/60 = 18.975 → 25% = 4.743,75; motor usa o teto inteiro', '1 evento (mês 48)', abs(lanceContrato - 4743.75), abs(lanceContrato - 4743.75) < TOL && X.meses[48].fluxo.mov_bens === 4744, `lance do contrato ${fmt(lanceContrato)}; motor move ${fmt(X.meses[48].fluxo.mov_bens)} (arredonda para cima, +0,25)`);
  OUT.achados.consorcio = { total: totalCons, lance: lanceContrato, parcelaAntes: consTab[0].pay, parcelaDepois: consTab[50].pay, parteBem, kLance: objCarro.months - cc.inicio + 1,
    primeiraParcelaNoMes: X.meses.findIndex(m => m.fluxo.out_fix_carro_compra), ultimaParcelaNoMes: X.meses.map(m => m.fluxo.out_fix_carro_compra ? m.mi : -1).reduce((a, b) => Math.max(a, b), -1), contemplacaoMes: objCarro.months };
  // 2.5 as dívidas do plano (avulsas, bens, créditos): nenhuma; conferir fim.div = 0 e det.divs = 0
  const semDivida = (plano.patrimonio.dividas || []).length === 0 && plano.patrimonio.bens.every(b => !(b.saldoDevedor > 0)) && !(plano.creditos || []).length;
  check('S2.5', 'Dívidas de cadastro (financiamentos de bens, avulsas, créditos novos): nenhuma no plano; fim.div e det.divs = 0 em todos os meses', 'leitura do plano + varredura', `${NM} meses`, max(X.meses.map(m => abs(m.fim.div) + abs(m.fim.det.divs[0]) + abs(m.fim.det.divs[1]))), semDivida && X.meses.every(m => m.fim.div === 0), 'IOF, carência, amortização antecipada e dívida avulsa NÃO são exercidos por este cenário (ver S9 para o estresse)');
  // 2.6 dívida "sombra" das compras: saldo que o motor não mostra em fim.div
  const sombra = mi => { let d = 0; const kA = mi - miApto0; if (kA >= 0) d += kA < nApto ? (kA === 0 ? Fapto - saPto[0].am : saPto[kA].saldo) : 0;       // saldo depois da parcela do mês
    const kC = mi - 1; if (kC >= 0 && kC < cc.parcelas) d += consTab[kC].saldo; else if (kC < 0) d += totalCons; return d; };
  OUT.achados.sombra = [0, 1, 48, 59, 60, 61, 120, 222, 419].map(mi => ({ mi, divOmitida: kSombra(mi) }));
  function kSombra(mi) { const kA = mi - miApto0; let d = 0; if (kA >= 0 && kA < nApto) d += saPto[kA].saldo; if (mi >= 1) { const kC = mi - 1; if (kC < cc.parcelas) d += consTab[kC].saldo; } else d += totalCons; if (mi < miApto0 && mi >= 0) d += 0; return d; }
  const pico = max(Array.from({ length: NM }, (_, mi) => kSombra(mi)));
  OUT.achados.divOmitidaMax = pico;
  // Patrimônio: o motor reconhece o bem à medida que paga (equity). Conferir que o patrimônio líquido bate com a visão cheia.
}

// ============================================================================================================
// S3. Bens: o patrimônio em bens mês a mês (compras, amortização reconhecida, lance do consórcio)
// ============================================================================================================
{
  const bensEsp = (lanceComoAtivo) => { // a regra do domínio: 1 real pago ao consórcio compra "carta/total" de carro; o resto é taxa (despesa)
    const out = []; let b = 335000;
    for (let mi = 0; mi < NM; mi++) {
      const kC = mi - 1; if (kC >= 0 && kC < cc.parcelas) b += consTab[kC].pay * parteBem;
      if (mi === objCarro.months) b += lanceComoAtivo ? Math.ceil(lanceContrato) : lanceContrato * parteBem;
      if (mi === objApto.months) b += objApto.amount;
      const kA = mi - miApto0; if (kA >= 0 && kA < nApto) b += saPto[kA].am;
      if (mi === plano.objectives.find(o => o.id === 'casacampo').months) b += 500000;
      out.push(b);
    } return out; };
  const esp = bensEsp(false), espMotor = bensEsp(true);
  let eCerto = 0, eMotor = 0, mCerto = null;
  X.meses.forEach((m, mi) => { const d = m.fim.bens - esp[mi]; if (abs(d) > eCerto) { eCerto = abs(d); } eMotor = Math.max(eMotor, abs(m.fim.bens - espMotor[mi])); if (mCerto == null && abs(d) > TOL) mCerto = mi; });
  check('S3.1', 'Bens: o motor reproduz o "lance do consórcio inteiro como ativo" (regra do motor, não a do domínio)', 'bens = 335.000 + parcelas·carta/total + lance cheio (4.744) + entrada + amortização SAC + 500.000', `${NM} meses`, eMotor, eMotor < TOL, 'confirma que a diferença abaixo vem do lance, e só dele');
  check('S3.2', 'Bens: valor esperado pela regra do domínio (lance compra só carta/total do carro; o restante é taxa de administração)', 'bens = 335.000 + parcelas·(90.000/103.500) + lance·(90.000/103.500) + 130.000 + amortização SAC + 500.000', `${NM} meses`, eCerto, eCerto < TOL, eCerto >= TOL ? `DIFERENÇA de ${fmt(eCerto)} a partir do mês ${mCerto}: o motor tem bens a MAIS` : '');
  OUT.achados.bens = { difMax: eCerto, aPartirDe: mCerto, bemCarroFinalMotor: X.meses[NM - 1].fim.bens - 335000 - 500000 - 650000, bemCarroEsperado: 90000, lanceMotor: 4744, lanceComoBem: lanceContrato * parteBem };
}

// ============================================================================================================
// S4. Caixinhas (frente D): reconstrução semana a semana
// ============================================================================================================
const taxaBase = o => (o.rateM != null && o.rateM !== '' ? +o.rateM : PROF[o.profile]);
const mesCons = o => Math.max(0, Math.round(o.months) - MESES_CONS);
// taxa que DEVERIA valer no mês mi (regra do enunciado): base antes dos últimos 24 meses; conservadora nos últimos 24; <24 meses já conservador
const taxaEsp = (o, mi) => { const b = taxaBase(o), c = Math.min(b, PROF.conservador); return mi >= mesCons(o) ? c : b; };
const saleNet = 349500, saleMi = part.venda.em;
function simulaObj(o, regra, taxaFixa) {
  // regra: 'dom' (mês verdadeiro da semana) | 'lag' (a 1ª semana do mês ainda usa o mês anterior) ; taxaFixa: força uma taxa única
  const k = ID_IDX[o.id], n = Math.round(o.months), serie = new Map(); let bal = 0, saldoData = null, prev = null;
  const aporte = mi => { const f = X.meses[mi].fluxo['mov_obj_' + o.id] || 0; return f > 0 ? f - (o.id === 'casacampo' && mi === saleMi ? saleNet : 0) - (mi === 0 ? (+o.dedicated || 0) : 0) : 0; };
  for (let i = W0; i <= OPEN[n]; i++) {
    const mi = miDaSemana(i);
    if (i === W0 && o.dedicated > 0) bal += o.dedicated;                       // o patrimônio de hoje entra no começo da semana de hoje, antes do rendimento
    const miTaxa = regra === 'lag' && i === OPEN[mi] && mi > 0 ? mi - 1 : mi;
    const r = taxaFixa != null ? taxaFixa : taxaEsp(o, miTaxa); bal *= gSem(r);
    if (i === OPEN[saleMi] && o.id === 'casacampo') bal += saleNet;            // o líquido da venda entra na semana que abre o mês 84, depois do rendimento
    const ap = aporte(mi); if (ap > 0 && i === OPEN[mi] + 3) bal += ap;        // o aporte cai na 4ª semana do ciclo
    if (i === OPEN[n]) { saldoData = bal; bal = 0; }
    serie.set(i, bal);
  }
  return { serie, saldoData };
}
{
  const linhas = [];
  for (const o of OBJS) {
    const k = ID_IDX[o.id], n = Math.round(o.months);
    const lag = simulaObj(o, 'lag'), dom = simulaObj(o, 'dom');
    let eLag = 0, eDom = 0, wDom = null, nW = 0;
    for (let i = W0; i <= OPEN[n]; i++) { const ob = WK[i].obj[k]; eLag = Math.max(eLag, abs(ob - lag.serie.get(i))); const d = abs(ob - dom.serie.get(i)); if (d > eDom) { eDom = d; } if (wDom == null && d > 1e-6) wDom = i; nW++; }
    const mNa = -(X.meses[n].fluxo['mov_obj_' + o.id] || 0), consumo = o.kind === 'consumo';
    const eData = abs(mNa - dom.saldoData);
    // taxa registrada (taxaPorMes do extrato) contra a esperada
    const tpm = X.objetivos[k].taxaPorMes; let eTx = 0, trocas = []; for (let mi = 0; mi < tpm.length; mi++) { const esp = taxaEsp(o, mi); eTx = Math.max(eTx, abs(esp - tpm[mi])); if (mi > 0 && tpm[mi] !== tpm[mi - 1]) trocas.push(mi); }
    // contrafatuais com os mesmos aportes
    const base = simulaObj(o, 'dom', taxaBase(o)).saldoData, cons = simulaObj(o, 'dom', Math.min(taxaBase(o), PROF.conservador)).saldoData;
    linhas.push({ id: o.id, meses: n, perfil: o.profile, base: taxaBase(o), trocaMes: trocas[0] == null ? (taxaBase(o) === PROF.conservador || mesCons(o) === 0 ? 'nasce conservador' : null) : trocas[0], saldoMotor: mNa, saldoDominio: dom.saldoData, saldoLag: lag.saldoData, tudoBase: base, tudoConservador: cons, alvo: o.id === 'carro' ? 4744 : o.amount, eLag, eDom, semanaPrimeiraDiv: wDom, eData, eTx });
    check(`S4.${k + 1}a`, `Caixinha ${o.id}: saldo semana a semana (${nW} semanas), regra do motor (1ª semana do mês ainda na taxa anterior)`, 'bal(i)=bal(i−1)·(1+r)^(7/30,4375) + aportes na 4ª semana do ciclo [+dedicado na semana de hoje, +líquido da venda na semana 84]', `${nW} semanas`, eLag, eLag < TOL);
    check(`S4.${k + 1}b`, `Caixinha ${o.id}: saldo na data, taxas por mês e mês da troca`, `taxa esperada: ${taxaBase(o) === PROF.conservador ? 'só conservadora' : (taxaBase(o) * 100).toFixed(1) + '% até o mês ' + (mesCons(o) - 1) + ', 0,4% a partir do mês ' + mesCons(o)}; taxaPorMes do extrato`, `${tpm.length} meses de taxa + 1 saldo`, Math.max(eTx, 0), eTx < 1e-12, `troca no mês ${trocas[0] == null ? '—' : trocas[0]}; diferença no saldo na data pela regra da semana: ${fmt(dom.saldoData - mNa)} (rendimento a mais do motor)`);
  }
  // 4.x c) a regra do enunciado: a taxa troca NO mês certo. O motor aplica a taxa do mês anterior na 1ª semana de cada mês.
  linhas.forEach(L => { const o = OBJS.find(q => q.id === L.id), k = ID_IDX[o.id];
    check('S4.' + (k + 1) + 'c', 'Caixinha ' + o.id + ': saldo semana a semana com a taxa do MÊS VERDADEIRO de cada semana (troca no mês certo)', 'mesmo modelo, mas a 1ª semana do mês já usa a taxa do mês', (OPEN[Math.round(o.months)] - W0 + 1) + ' semanas', L.eDom, L.eDom < TOL,
      L.eDom < TOL ? '' : 'primeira diferença na semana ' + L.semanaPrimeiraDiv + ' (1ª semana do mês ' + L.trocaMes + '); saldo na data fica ' + fmt(L.saldoMotor - L.saldoDominio) + ' acima do correto'); });
  { const dMes = { apto: 60, filho: 36, carro: 48, casacampo: 120, casamento: 24 }; const nFim = 222;
    OUT.achados.impactoLag = linhas.map(L => ({ id: L.id, naData: L.saldoMotor - L.saldoDominio, nofimDaLiberdade: (L.saldoMotor - L.saldoDominio) * Math.pow(1 + R_M, nFim - dMes[L.id]), nofimDoHorizonte: (L.saldoMotor - L.saldoDominio) * Math.pow(1 + R_M, 822 - dMes[L.id]) }));
    OUT.achados.impactoLance = { naData: 619.0, nofimDaLiberdade: 619.0 * Math.pow(1 + R_M, 222 - 48), nofimDoHorizonte: 619.0 * Math.pow(1 + R_M, 822 - 48) }; }
  OUT.tabelas.caixinhas = linhas;
}

// 4.x regra do aporte: para quando a caixinha já basta (programa mês a mês, com 1% de folga)
{
  const res = []; let eAp = 0, nm = 0;
  for (const o of OBJS) {
    const k = ID_IDX[o.id], n = Math.round(o.months); const amount = o.id === 'carro' ? Math.ceil(lanceContrato) : +o.amount;
    const F = [1]; for (let m = 0; m < n; m++) F.push(F[m] * (1 + taxaEsp(o, m)));
    const ate = mm => F[n] / F[Math.max(0, Math.min(n, mm))];
    const vendas = o.id === 'casacampo' ? [{ mi: saleMi, usado: saleNet }] : [];
    let saldo = 0; const ded = +o.dedicated || 0;
    for (let mi = 0; mi < n; mi++) {
      saldo *= 1 + taxaEsp(o, mi); if (mi === 0) saldo += ded; vendas.forEach(v => { if (v.mi === mi) saldo += v.usado; });
      const naData = saldo * ate(mi) + vendas.filter(v => v.mi > mi).reduce((a, v) => a + v.usado * ate(v.mi), 0);
      const falta = Math.max(0, (amount * 1.01 - naData) / ate(mi)); const ap = Math.min(+o.planned || 0, falta);
      const ob = Math.max(0, (X.meses[mi].fluxo['mov_obj_' + o.id] || 0) - (mi === 0 ? ded : 0) - (o.id === 'casacampo' && mi === saleMi ? saleNet : 0));
      eAp = Math.max(eAp, abs(ap - ob)); nm++; saldo += ap;
    }
    res.push({ id: o.id, ultimo: X.meses.map(m => (m.fluxo['mov_obj_' + o.id] || 0)).filter(v => v > 0 && v !== ded && v !== 350018).slice(-1)[0] });
  }
  check('S4.6', 'Regra de aporte: aporte = mín(planejado, o que falta para o alvo com 1% de folga), mês a mês; o último aporte do carro é parcial', 'replicação própria do programa em base mensal (taxa verdadeira por mês) vs mov_obj_* do extrato', `${nm} caixinha-meses`, eAp, eAp < TOL, 'o aporte da casa de campo (518) não para: falta > planejado em todos os 120 meses');
  OUT.tabelas.aportes = res;
}
// 4.6b faltas de aporte (cortes por falta de sobra, janeiro a março com IPVA e PJ zerado): o programa do motor deve ter zero cortes, e o caixa nunca bloqueia um aporte
{
  const prog = S.programa, cortes = prog.meses.filter(m => m.corte > 0.5).length;
  let bloqueados = 0; for (const o of OBJS) { const k = ID_IDX[o.id]; for (let mi = 0; mi < Math.round(o.months); mi++) { const ob = (X.meses[mi].fluxo['mov_obj_' + o.id] || 0) - (mi === 0 ? (+o.dedicated || 0) : 0) - (o.id === 'casacampo' && mi === saleMi ? saleNet : 0); const pl = +o.planned || 0; if (ob < pl - 1e-6 && !(o.id === 'carro' && mi === 47)) bloqueados++; } }
  const jan = [3, 4, 5].map(mi => X.meses[mi].fluxo.mov_cofre);
  check('D.8', 'Prioridades competindo: nenhum aporte foi cortado (inclusive em jan a mar, com IPVA e PJ do Pedro zerado)', 'faltas do programa do motor (observado) + aportes do extrato contra o planejado em cada mês de cada objetivo', '120 meses × 5 objetivos', cortes + bloqueados + prog.faltas.length, cortes === 0 && bloqueados === 0 && prog.faltas.length === 0, 'caixa de jan/27 a mar/27: mov_cofre ' + jan.map(fmt).join(' | ') + '; menor caixa do plano ' + fmt(Math.min(...X.meses.map(m => m.fim.cofre))));
}
// 4.7 saque na data: consumo/bem e saldo devolvido
{
  const t = []; let e = 0;
  for (const o of OBJS) {
    const n = Math.round(o.months), k = ID_IDX[o.id], F = X.meses[n].fluxo, devolvido = -(F['mov_obj_' + o.id] || 0);
    const alvo = o.id === 'carro' ? 4744 : o.amount;
    if (o.kind === 'consumo') { e = Math.max(e, abs((F['out_obj_' + o.id] || 0) - alvo)); }
    else { const compras = o.id === 'carro' ? F.mov_bens : o.id === 'apto' ? F.mov_bens : F.mov_bens; e = Math.max(e, abs(compras - alvo)); }
    e = Math.max(e, X.meses[n].fim.obj[k]); // caixinha zerada no fim do mês
    t.push({ id: o.id, mes: n, devolvido, alvo, sobra: devolvido - alvo });
  }
  check('S4.7', 'Saque na data: consumo sai como despesa (55.000; 40.000), bem vira ativo (4.744; 130.000; 500.000), caixinha zera e o resto volta ao caixa', 'out_obj_*/mov_bens no mês da data = alvo; fim.obj[k] = 0', '5 objetivos', e, e < TOL);
  OUT.tabelas.saques = t;
}

// ============================================================================================================
// S5. Caixa/reserva (frente E) e contabilidade geral (frente A)
// ============================================================================================================
const GW = gSem(R_M);
{
  // 5.1 transferências somam zero e mov_cofre = entradas − saídas − Σmov_obj − mov_bens, semana a semana
  let e = 0, nW = 0;
  for (let i = W0; i < NW; i++) { const f = WK[i].f; let sobj = 0; for (const k in f) if (k.startsWith('mov_obj_')) sobj += f[k]; const dif = (f.mov_cofre || 0) - (RW(i) - sobj - (f.mov_bens || 0)); e = Math.max(e, abs(dif)); nW++; }
  check('A.1', 'Transferências somam zero: mov_cofre = (entradas − saídas) − Σmov_obj − mov_bens, em cada semana', 'identidade contábil sobre f de cada semana do motor', `${nW} semanas`, e, e < TOL);
  // 5.2 mesma identidade nos meses do extrato (o que o consultor vê)
  let e2 = 0; X.meses.forEach(m => { const f = m.fluxo; let R = 0, so = 0; for (const k in f) { if (k.startsWith('in_')) R += f[k]; else if (k.startsWith('out_')) R -= f[k]; else if (k.startsWith('mov_obj_')) so += f[k]; } e2 = Math.max(e2, abs((f.mov_cofre || 0) - (R - so - (f.mov_bens || 0)))); });
  check('A.2', 'A mesma identidade nos 823 meses do extrato', 'soma mensal das linhas in_/out_/mov_', `${NM} meses`, e2, e2 < 1e-6);
  // 5.3 fin = cofre + Σobj; NaN; sinais
  let eF = 0, nan = 0, neg = 0, minCofre = 1e18, minFin = 1e18, maxCheque = 0; const wlk = o => { if (typeof o === 'number') { if (!isFinite(o)) nan++; } else if (o && typeof o === 'object') for (const k in o) wlk(o[k]); };
  X.meses.forEach(m => { const f = m.fim; eF = Math.max(eF, abs(f.fin - (f.cofre + f.obj.reduce((a, b) => a + b, 0)))); wlk(m); if (f.obj.some(v => v < -1e-9) || f.bens < 0 || f.part < -1e-9 || f.div < 0) neg++; minCofre = Math.min(minCofre, f.cofre); minFin = Math.min(minFin, f.fin); maxCheque = Math.max(maxCheque, f.cheque); });
  check('A.3', 'fin = cofre + Σcaixinhas; sem NaN/Infinity; sem saldos negativos (caixinhas, bens, participação, dívida); sem cheque especial', 'varredura dos 823 meses', `${NM} meses`, Math.max(eF, nan, neg, maxCheque), eF < 1e-6 && nan === 0 && neg === 0 && maxCheque === 0, `menor caixa ${fmt(minCofre)}, menor financeiro ${fmt(minFin)}`);
  OUT.achados.minimos = { minCofre, minFin };
  // 5.4 rendimento do caixa e das caixinhas, semana a semana (a taxa certa em cada semana) — financeiro inteiro
  let eY = 0, eYlag = 0, nY = 0, piorSemana = null;
  const lagMi = i => (i === OPEN[miDaSemana(i)] && miDaSemana(i) > 0 ? miDaSemana(i) - 1 : miDaSemana(i));
  for (let i = W0 + 1; i < NW; i++) {
    if (WK[i].mi < 0) continue;
    const f = WK[i].f, cofrePrev = WK[i - 1].cofre; let sobj = 0; for (const k in f) if (k.startsWith('mov_obj_')) sobj += f[k];
    const yCofre = cofrePrev > 0 ? cofrePrev * (GW - 1) : 0;
    const yObj = (mf) => OBJS.reduce((a, o) => { const k = ID_IDX[o.id]; const prev = WK[i - 1].obj[k]; return a + prev * (gSem(taxaEsp(o, mf(i))) - 1); }, 0);
    const finDelta = WK[i].fin - WK[i - 1].fin, base = RW(i) - (f.mov_bens || 0);
    const d1 = abs(finDelta - base - yCofre - yObj(miDaSemana)), d2 = abs(finDelta - base - yCofre - yObj(lagMi));
    if (d1 > eY) { eY = d1; piorSemana = i; } eYlag = Math.max(eYlag, d2); nY++;
  }
  check('E.1', 'Rendimento do financeiro (semana a semana): Δfin = entradas − saídas − compras de bens + caixa·((1+0,4%)^(7/30,4375)−1) + Σcaixinha·((1+r)^(7/30,4375)−1)', 'identidade com a taxa que o motor declara (inclui a primeira semana do mês na taxa do mês anterior)', `${nY} semanas`, eYlag, eYlag < TOL, 'convenção: o rendimento da semana incide sobre o saldo do FIM da semana anterior; entradas/saídas/aportes entram no fim da semana, sem render na semana em que ocorrem');
  check('E.2', 'O mesmo, mas com a taxa do MÊS VERDADEIRO da semana (regra do domínio: troca no mês certo)', 'idem com mi = mês a que a semana pertence', `${nY} semanas`, eY, eY < TOL, eY >= TOL ? `diverge na semana ${piorSemana} (primeira semana de um mês de troca de taxa)` : '');
  OUT.achados.rendimento = { eY, piorSemana, GW, taxaCofre: R_M };
  // 5.5 patrimônio líquido: variação mensal = entradas − saídas + rendimento + valorização (+ amortização reconhecida em bens)
  const ySem = (mf) => { const a = new Array(NM).fill(0); for (let i = W0 + 1; i < NW; i++) { if (WK[i].mi < 0) continue; const mi = WK[i].mi; if (mi >= NM) break; const cofrePrev = WK[i - 1].cofre; a[mi] += (cofrePrev > 0 ? cofrePrev * (GW - 1) : 0) + OBJS.reduce((s, o) => s + WK[i - 1].obj[ID_IDX[o.id]] * (gSem(taxaEsp(o, mf(i))) - 1), 0); } return a; };
  const yM = ySem(lagMi);
  const nwObs = X.meses.map(m => m.fim.fin + m.fim.bens + m.fim.part + m.fim.prev - m.fim.div);
  let eNW = 0, eNWd = 0, mNWd = null, nNW = 0;
  for (let mi = 1; mi < NM; mi++) {
    const f = X.meses[mi].fluxo; let R = 0; for (const k in f) { if (k.startsWith('in_')) R += f[k]; else if (k.startsWith('out_')) R -= f[k]; }
    const val = (mi <= part.venda.em ? serieP(mi) - serieP(mi - 1) : 0);             // valorização realizada (inclui a do mês da venda)
    const kC = mi - 1, amC = kC >= 0 && kC < cc.parcelas ? consTab[kC].pay * parteBem : 0;
    const kA = mi - miApto0, amA = kA >= 0 && kA < nApto ? saPto[kA].am : 0;
    const lanceDom = mi === objCarro.months ? lanceContrato * parteBem - Math.ceil(lanceContrato) : 0;   // domínio: a taxa embutida no lance é despesa (−619), o motor não a debita
    const esp = R + yM[mi] + val + amC + amA;
    const dObs = nwObs[mi] - nwObs[mi - 1];
    eNW = Math.max(eNW, abs(dObs - esp)); eNWd = Math.max(eNWd, abs(dObs - (esp + lanceDom))); if (abs(dObs - (esp + lanceDom)) > TOL && mNWd == null) mNWd = mi; nNW++;
  }
  check('A.4', 'Patrimônio líquido (fin + bens + part + prev − div): variação mensal = entradas − saídas + rendimento + valorização + amortização reconhecida', 'identidade mensal; amortização e valorização calculadas por tabelas/ séries próprias; rendimento pelas taxas do motor', `${nNW} meses`, eNW, eNW < TOL, 'regra do motor: o lance do consórcio entra todo como ativo (transferência neutra)');
  check('A.5', 'O mesmo, impondo a regra do domínio (a taxa de administração do lance é despesa)', 'idem, com −619 no mês 48', `${nNW} meses`, eNWd, eNWd < TOL, eNWd >= TOL ? `único desvio: mês ${mNWd}, patrimônio do motor R$ ${fmt(619.0)} acima` : '');
  OUT.achados.nwDifMes48 = eNWd;
}

// ============================================================================================================
// S6. Fluxo (frente F): entradas e saídas mês a mês contra o plano
// ============================================================================================================
const stepBase = (it, mi) => { let v = 0; for (const s of it.steps) { if (mi >= s.from) v = +s.value || 0; else break; } return v; };
const semOcorr = (mi, dia, m) => { // semana (do calendário próprio) do dia `dia` do mês-calendário m, no ciclo mi
  const y = calAno(mi) + (m < calMes(mi) ? 1 : 0); const d = Date.UTC(y, m, dia); return Math.floor((d - NASC) / (7 * DAY)); };
const incl = (mi, semana) => semana >= W0;                                           // só entra o que acontece de "hoje" em diante
const FF_MI = X.ff.mi, PARA_PEDRO = FF_MI, PARA_JULIA = Math.round((plano.spouseRetireAge - (Date.UTC(2026, 9, 14) - dnasc(plano.conjugeNascimento)) / (365.25 * DAY)) * 12);
const mensalPedroSalario = () => plano.incomes.find(i => i.id === 'salario');
function fluxoEsperado(mi) {
  const E_ = {}; const add = (k, v) => { if (v) E_[k] = (E_[k] || 0) + v; };
  const inc = id => plano.incomes.find(i => i.id === id);
  const sal = inc('salario');
  const trabPedro = mi < PARA_PEDRO, trabJulia = mi < PARA_JULIA;
  // rendas por data: ocorrência = (mês-calendário m, dia d) no ciclo mi
  const dataOcorre = (it, mi_, m, d) => incl(mi_, semOcorr(mi_, d, m));
  if (trabPedro) {
    if (dataOcorre(sal, mi, calMes(mi), sal.days[0])) add('in_salario', stepBase(sal, mi));
    const d13 = inc('dec13'); if (calMes(mi) === d13.dates[0].m && dataOcorre(d13, mi, d13.dates[0].m, d13.dates[0].d)) add('in_dec13', stepBase(sal, mi));       // 13º = 1 salário do mês (segue o salário)
    const bo = inc('bonus'); if (mi >= bo.steps[0].from && (mi - bo.steps[0].from) % 6 === 0 && dataOcorre(bo, mi, calMes(mi), bo.days[0])) add('in_bonus', stepBase(bo, mi));
    const pj = inc('pj_pedro'); pj.dates.forEach(dt => { if (dt.m === calMes(mi) && dataOcorre(pj, mi, dt.m, dt.d)) add('in_pj_pedro', stepBase(pj, mi)); });
  }
  if (trabJulia) { ['julia_alta', 'julia_baixa'].forEach(id => { const it = inc(id); it.dates.forEach(dt => { if (dt.m === calMes(mi) && dataOcorre(it, mi, dt.m, dt.d)) add('in_' + id, stepBase(it, mi)); }); }); }
  const al = inc('aluguel'); if (dataOcorre(al, mi, calMes(mi), al.days[0])) add('in_aluguel', stepBase(al, mi));
  plano.passive.forEach((p, k) => { if (mi >= p.startMi) add('in_pas_' + k, p.net); });
  // despesas (antes da liberdade); semanas do ciclo: k de 1 a 4 contadas a partir da semana que abre o mês
  const ex = id => plano.expenses.find(e => e.id === id);
  const noCiclo = (mi_, k) => OPEN[mi_] + k - 1 >= W0 && OPEN[mi_] + k - 1 < OPEN[mi_ + 1];
  const ciclo = mi < FF_MI;
  const consor = (mi >= 1 && mi - 1 < cc.parcelas) ? consTab[mi - 1].pay : 0, aptoP = (mi - miApto0 >= 0 && mi - miApto0 < nApto) ? saPto[mi - miApto0].pay : 0;
  add('out_fix_carro_compra', consor); add('out_fix_apto_compra', aptoP);
  if (ciclo) {
    const mor = ex('moradia'); if (mi < objApto.months && noCiclo(mi, mor.week)) add('out_fix_moradia', stepBase(mor, mi));
    ['transporte', 'saude'].forEach(id => { const e = ex(id); if (noCiclo(mi, e.week)) add('out_fix_' + id, stepBase(e, mi)); });
    const ip = ex('ipva'); ip.dates.forEach(dt => { if (dt.m === calMes(mi) && incl(mi, semOcorr(mi, dt.d, dt.m))) add('out_fix_ipva', stepBase(ip, mi)); });
    ['alimentacao', 'lazer', 'outros'].forEach(id => { const e = ex(id); for (let k = 1; k <= 4; k++) if (noCiclo(mi, k)) add('out_adj_' + id, stepBase(e, mi) / 4); });
  } else {
    // liberdade: o padrão de vida se ajusta para gastar exatamente a renda desejada (14.000 em média) menos a parcela do mês
    const custoVida = ['transporte', 'saude', 'alimentacao', 'lazer', 'outros'].reduce((a, id) => a + stepBase(ex(id), mi), 0) + stepBase(ex('ipva'), mi) / 12;
    const escala = (plano.desired - consor - aptoP) / custoVida;
    ['transporte', 'saude'].forEach(id => add('out_fix_' + id, stepBase(ex(id), mi) * escala));
    ['alimentacao', 'lazer', 'outros'].forEach(id => add('out_adj_' + id, stepBase(ex(id), mi) * escala));
    if (calMes(mi) === ex('ipva').dates[0].m) add('out_fix_ipva', stepBase(ex('ipva'), mi) * escala);
  }
  return E_;
}
{
  let eIn = 0, eOut = 0, nIn = 0, nOut = 0, fora = [], pior = {};
  for (let mi = 0; mi < NM - 1; mi++) {                 // o mês 822 tem 1 semana de 4: é o corte do horizonte (100 anos), fora da comparação
    const esp = fluxoEsperado(mi), obs = X.meses[mi].fluxo;
    const chaves = new Set([...Object.keys(esp), ...Object.keys(obs).filter(k => k.startsWith('in_') || k.startsWith('out_'))]);
    chaves.forEach(k => {
      if (k === 'out_obj_casamento' || k === 'out_obj_filho' || k === 'out_vendap_0' || k === 'out_rendas') return;     // conferidos nas outras frentes
      const d = abs((esp[k] || 0) - (obs[k] || 0));
      if (k.startsWith('in_')) { eIn = Math.max(eIn, d); nIn++; } else { eOut = Math.max(eOut, d); nOut++; }
      if (d > TOL) { fora.push({ mi, k, esperado: esp[k] || 0, motor: obs[k] || 0 }); pior[k] = Math.max(pior[k] || 0, d); }
    });
  }
  check('F.1', 'Entradas: salário (degrau em mar/2028 = mês 17), 13º (segue o salário), bônus semestral (dez/jun), PJ do Pedro (abr a nov), Júlia (abr a ago 8.500; set a mar 5.250), aluguel, INSS; paradas em 222/227', 'cada linha recalculada do plano por data de ocorrência; mês 0 só conta datas a partir da semana de hoje', `${nIn} pares linha×mês (822 meses; o 823º é o corte do horizonte)`, eIn, eIn < TOL);
  check('F.2', 'Saídas: moradia (até o mês 59), transporte, saúde, alimentação/lazer/outros, IPVA em janeiro, parcelas do consórcio e do apartamento; após a liberdade, gastos escalados', 'idem; pós-liberdade: escala=(14.000 − parcelas)/(Σ linhas + IPVA/12)', `${nOut} pares linha×mês (822 meses)`, eOut, eOut < TOL, fora.length ? `${fora.length} divergências; ver laudo` : '');
  OUT.achados.fluxoDivergencias = fora.slice(0, 20);
  OUT.achados.fluxoDivergenciasPior = pior;
  // mês de borda: amostras
  OUT.tabelas.bordas = [0, 2, 3, 8, 14, 17, 24, 36, 48, 60, 84, 120, 222, 227, 402, 431].map(mi => ({ mi, esperado: fluxoEsperado(mi), observado: Object.fromEntries(Object.entries(X.meses[mi].fluxo).filter(([k]) => /^(in_|out_)/.test(k))) }));
  // cenário "para o auditor": sobra média ≈ 11.000
  const med = a => a.reduce((s, v) => s + v, 0) / a.length;
  const sobra = mi => { const f = X.meses[mi].fluxo; let R = 0; for (const k in f) { if (k.startsWith('in_')) R += f[k]; else if (k.startsWith('out_')) R -= f[k]; } return R; };
  const sobra12 = med(Array.from({ length: 12 }, (_, j) => sobra(j + 1)));
  OUT.achados.sobraMedia = { mes1a12: sobra12, mes18a29: med(Array.from({ length: 12 }, (_, j) => sobra(18 + j))), receitaMedia1a12: med(Array.from({ length: 12 }, (_, j) => Object.entries(X.meses[j + 1].fluxo).filter(([k]) => k.startsWith('in_')).reduce((a, [, v]) => a + v, 0))) };
  const falta3 = [3, 4, 5].map(mi => ({ mi, sobraLiquida: sobra(mi), aportes: ['filho', 'carro', 'casacampo', 'casamento'].reduce((a, id) => a + (X.meses[mi].fluxo['mov_obj_' + id] || 0), 0), cofreFim: X.meses[mi].fim.cofre }));
  OUT.achados.janMar = falta3;
}

// ============================================================================================================
// S7. Liberdade financeira, ruína, aposentadoria (frente G)
// ============================================================================================================
{
  const ff = X.ff, idadeP = X.idadeHoje, nasc2 = dnasc(plano.conjugeNascimento);
  const idadeJulia = (INI - nasc2) / (365.25 * DAY);
  const miPedro = Math.ceil((plano.retireAge - idadeP) * 12 - 1e-9);                // 1º mês cuja semana de abertura já tem 50 anos
  const idadeNaAbertura = mi => (OPEN[mi] * 7 * DAY + NASC - NASC) / (365.25 * DAY) / 1;  // semanas desde o nascimento / 52,18
  const idadeSemana = i => i / WPY;
  let primeiro = null; for (let mi = 1; mi < NM; mi++) if (idadeSemana(OPEN[mi]) >= plano.retireAge) { primeiro = mi; break; }
  check('G.1', 'Liberdade financeira no primeiro mês cuja semana de abertura já tem 50 anos (Pedro)', 'idade da semana = semana/52,18; menor mês com idade ≥ 50', '1 evento', abs(primeiro - ff.mi), primeiro === ff.mi, `mês ${ff.mi}, idade ${ff.age.toFixed(4)} (esperado ${primeiro})`);
  const julia48 = Math.round((plano.spouseRetireAge - idadeJulia) * 12);
  const ultJulia = Math.max(...X.meses.filter(m => m.fluxo.in_julia_alta || m.fluxo.in_julia_baixa).map(m => m.mi));
  check('G.2', 'Júlia para aos 48 (mês 227): última renda dela no mês 226; Pedro: última no mês 221', 'idade exata a partir de 1997-09; renda ativa para no mês da idade', '2 marcos', abs(ultJulia - (julia48 - 1)), ultJulia === julia48 - 1 && Math.max(...X.meses.filter(m => m.fluxo.in_salario).map(m => m.mi)) === ff.mi - 1, `Júlia para no mês ${julia48}; última renda ${ultJulia}`);
  // renda desejada gasta: média dos 12 meses de saídas de consumo ≈ 14.000 (inclui parcelas)
  let eMed = 0, nMed = 0;
  for (let ini = ff.mi + 1; ini + 12 <= 402; ini += 12) { // anos completos entre FF e INSS (média móvel de 12 meses; escala varia pouco)
    const tot = Array.from({ length: 12 }, (_, j) => Object.entries(X.meses[ini + j].fluxo).filter(([k]) => /^out_(adj|fix)_/.test(k)).reduce((a, [, v]) => a + v, 0)).reduce((a, b) => a + b, 0) / 12; eMed = Math.max(eMed, abs(tot - plano.desired)); nMed++; }
  check('G.3', 'Depois da liberdade o motor gasta, em média, exatamente a renda desejada (14.000/mês, parcelas incluídas)', 'média de 12 meses das saídas de consumo (out_adj/out_fix) nos anos completos', `${nMed} janelas de 12 meses`, eMed, eMed < 2, `diferença máxima ${fmt(eMed)} (a escala muda mês a mês com a parcela; o IPVA cai todo em janeiro)`);
  // sustentabilidade independente
  const gap = (mi) => Math.max(0, plano.desired - (mi >= plano.passive[0].startMi ? 6000 : 0) - (mi >= plano.passive[1].startMi ? 3500 : 0) - 2200 - (mi < julia48 ? (8500 * 5 + 5250 * 7) / 12 : 0));
  let maxGap = 0; const horizonte = Math.round((plano.lifeExp - ff.age) * 12); for (let mm = 0; mm < horizonte; mm++) maxGap = Math.max(maxGap, gap(ff.mi + mm));
  const sust = ff.finAfter * R_M + (plano.desired - maxGap);
  check('G.4', 'Liberdade: maxGap e rendimento sustentável do motor', 'maxGap = 14.000 − aluguel (2.200) = 11.800 após Júlia parar e antes do INSS; sustentável = financeiro·0,4% + (14.000 − maxGap)', '1 cálculo', Math.max(abs(maxGap - ff.maxGap), abs(sust - ff.sustentavel)), abs(maxGap - ff.maxGap) < TOL && abs(sust - ff.sustentavel) < TOL, `financeiro na liberdade ${fmt(ff.finAfter)}; sustentável ${fmt(sust)}/mês vs 14.000 pedidos`);
  const minPos = Math.min(...X.meses.filter(m => m.mi >= ff.mi).map(m => m.fim.fin));
  check('G.5', 'Ruína: o financeiro nunca zera nem fica negativo depois da liberdade; `ruina` = null; forced = false', 'mínimo do financeiro de 222 a 822', `${NM - ff.mi} meses`, 0, X.ruina === null && minPos > 0 && ff.forced === false, `menor financeiro depois da liberdade ${fmt(minPos)}; no mês 822: ${fmt(X.meses[NM - 1].fim.fin)}`);
  { // INSS aos 65: primeiro mês cuja semana de abertura já tem 65 anos
    const nascJ = dnasc(plano.conjugeNascimento); let mP = null, mJ = null;
    for (let mi = 1; mi < NM; mi++) { const w = OPEN[mi]; if (mP == null && (wStart(w) - NASC) / (365.25 * DAY) >= 65) mP = mi; if (mJ == null && (wStart(w) - nascJ) / (365.25 * DAY) >= 65) mJ = mi; }
    const pr = plano.passive.map(p => p.startMi);
    const eI = Math.max(abs(mP - pr[0]), abs(mJ - pr[1]));
    check('G.6', 'INSS: começa no 1º mês em que cada um tem 65 anos (Pedro 402, Júlia 431) e entra no fluxo líquido (6.000; 3.500) a partir dali', 'idade a partir do nascimento de cada um; startMi do plano; F.1 confere os valores nos meses', '2 marcos', eI, eI <= 1, 'Pedro: ' + mP + ' (plano ' + pr[0] + '); Júlia: ' + mJ + ' (plano ' + pr[1] + ')');
  }
  OUT.achados.liberdade = { ff, minPos, finFinal: X.meses[NM - 1].fim.fin, escalaMes222: (X.meses[ff.mi].fluxo.out_adj_alimentacao || 0) / 2600, escalaApos420: (X.meses[430].fluxo.out_adj_alimentacao || 0) / 2600, custoAntes: 12800 + 6500 / 12, custoDepois420: ['alimentacao', 'lazer', 'outros', 'transporte', 'saude'].reduce((a, id) => a + (X.meses[430].fluxo['out_' + (id === 'transporte' || id === 'saude' ? 'fix' : 'adj') + '_' + id] || 0), 0), maxGap, sust };
}

// ============================================================================================================
// S8. Fidelidade ao cliente e ao "Para o auditor" (frente H)
// ============================================================================================================
{
  const cas = plano.objectives.find(o => o.id === 'casacampo');
  // componente da venda na caixinha da casa de campo na data, semana a semana (taxas do mês verdadeiro) e em base mensal
  let comp = 0; for (let i = OPEN[saleMi]; i <= OPEN[cas.months]; i++) { const mi = miDaSemana(i); if (i === OPEN[saleMi]) comp = saleNet * gSem(taxaEsp(cas, mi)); else comp *= gSem(taxaEsp(cas, mi)); }
  const mensal = saleNet * Math.pow(1.006, 12) * Math.pow(1.004, 24);
  const fatorCasa = (Math.pow(1.006, 96) - 1) / 0.006 * Math.pow(1.004, 24) + (Math.pow(1.004, 24) - 1) / 0.004;
  const ann = (r, n) => (Math.pow(1 + r, n) - 1) / r;
  const fFilho = ann(0.005, 12) * Math.pow(1.004, 24) + ann(0.004, 24), fCasam = ann(0.004, 24);
  const sobraMed = (() => { let t = 0; for (let mi = 1; mi <= 12; mi++) { const f = X.meses[mi].fluxo; for (const k in f) { if (k.startsWith('in_')) t += f[k]; else if (k.startsWith('out_')) t -= f[k]; } } return t / 12; })();
  const receitaMed = (() => { let t = 0; for (let mi = 1; mi <= 12; mi++) for (const k in X.meses[mi].fluxo) if (k.startsWith('in_')) t += X.meses[mi].fluxo[k]; return t / 12; })();
  const gastoMed = (() => { let t = 0; for (let mi = 1; mi <= 12; mi++) for (const k in X.meses[mi].fluxo) if (/^out_(adj|fix)_/.test(k) && k !== 'out_fix_carro_compra') t += X.meses[mi].fluxo[k]; return t / 12; })();
  OUT.achados.casaVenda = { cenario: 413268, mensal, semanalDominio: comp, semanasEntre: OPEN[cas.months] - OPEN[saleMi], mesesEquivalentes: (OPEN[cas.months] - OPEN[saleMi]) * WEEK_M };
  OUT.achados.aporteCasaExato = (500000 - mensal) / fatorCasa;
  OUT.achados.aportesNecessarios = { casamento: 55000 / fCasam, filho: 40000 / fFilho };
  OUT.achados.sobraMed = { receitaMed, gastoMed, sobraMed };
  const T = X.parts[0].serie, obj = id => X.objetivos[ID_IDX[id]];
  const linhas = [
    ['Startup, valor no mês 36', 170561, T[36], 'o esperado do cenário supõe curva única de 90.000 a 400.000; o plano lançou o marco de 25% a.a. × 3 anos (175.781) e o motor o cumpre'],
    ['Startup, valor no mês 60', 261198, T[60], 'idem: 175.781 → 400.000 em 48 meses'],
    ['Startup, valor no mês 84', 400000, T[84], ''],
    ['Líquido da venda', 349500, X.parts[0].venda.liquido, ''],
    ['Casa de campo: componente da venda na data (base mensal × semanal do calendário)', 413268, comp, 'a mão: 12 meses a 0,6% + 24 a 0,4%; no calendário real são ' + (OPEN[cas.months] - OPEN[saleMi]) + ' semanas = ' + ((OPEN[cas.months] - OPEN[saleMi]) * WEEK_M).toFixed(2) + ' meses'],
    ['Casa de campo: aporte necessário', 518, obj('casacampo').required, 'planejado 518'],
    ['Consórcio: lance do bolso', 4744, 4744, 'amount da caixinha = teto de 4.743,75'],
    ['SAC do apartamento: 1ª parcela (mês 60)', 5670, X.meses[60].fluxo.out_fix_apto_compra, ''],
    ['Casamento: aporte necessário', 2188, obj('casamento').required, 'planejado 2.189'],
    ['Filho: aporte necessário', 1033, obj('filho').required, 'planejado 1.034'],
    ['Consórcio: aporte necessário', 89, obj('carro').required, 'planejado 90'],
    ['Apartamento: aporte necessário (cenário: sem patrimônio dedicado)', 1900, obj('apto').required, 'o plano dedica 120.000 (premissa P2 do consultor): aporte 0 e a caixinha chega a 157.856'],
    ['Receita média mensal (meses 1 a 12)', 24390, receitaMed, ''],
    ['Gasto médio mensal (meses 1 a 12, sem parcelas)', 13342, gastoMed, 'IPVA anual incluído'],
    ['Sobra média antes de aportes (meses 1 a 12)', 11000, sobraMed, 'o "≈ 11.000" do cenário não desconta as parcelas do consórcio (1.725); com elas a sobra é ' + fmt(sobraMed)]
  ].map(([n, esp, mot, obs]) => ({ item: n, cenario: esp, motor: mot, dif: mot - esp, obs }));
  OUT.tabelas.fidelidade = linhas;
}

// ============================================================================================================
// S9. Estresse extra (fora do cenário): tenta quebrar o motor de dívidas com contratos sintéticos
// ============================================================================================================
{
  const pmtf = (pv, i, n) => pv * i / (1 - Math.pow(1 + i, -n));
  const iof = (F, tab) => F * 0.0038 + tab.reduce((a, l, k) => a + l.am * 0.000082 * Math.min(365, 30 * (k + 1)), 0);        // regra: 0,38% + 0,0082%/dia por amortização (até 365 dias; 30 dias por parcela)
  const tabela = (F, i, n, sac, extras) => { const out = []; let bal = F, pm = pmtf(F, i, n), am = F / n; for (let k = 0; k < n && bal > 0.005; k++) { const j = bal * i, a = Math.min(bal, sac ? am : pm - j); bal -= a; const ex = extras && extras[k] && bal > 0 ? Math.min(bal, extras[k].valor) : 0; if (ex) { bal -= ex; const r = n - k - 1; if (extras[k].modo === 'parcela' && r > 0 && bal > 0) { pm = pmtf(bal, i, r); am = bal / r; } } out.push({ j, am: a, pay: j + a, ex, saldo: bal }); } return out; };
  const casos = [
    { nome: 'Price 100.000, 120x, 12% a.a., IOF isento', d: { credito: 100000, parcelas: 120, juros: 12, sistema: 'price', iof: 'isento', restantes: 120 }, sac: false, iofm: 'isento' },
    { nome: 'SAC 250.000, 240x, 9% a.a., IOF financiado', d: { credito: 250000, parcelas: 240, juros: 9, sistema: 'sac', iof: 'financiado', restantes: 240 }, sac: true, iofm: 'financiado' },
    { nome: 'SAC 520.000, 360x, 10,2% a.a., IOF financiado (o caso em que o consultor lançou iof: 0 por engano)', d: { credito: 520000, parcelas: 360, juros: 10.2, sistema: 'sac', iof: 'financiado', restantes: 360 }, sac: true, iofm: 'financiado' },
    { nome: 'Price 80.000, 60x, 18% a.a., IOF à vista', d: { credito: 80000, parcelas: 60, juros: 18, sistema: 'price', iof: 'avista', restantes: 60 }, sac: false, iofm: 'avista' },
    { nome: 'SAC 120.000, 96x, 10% a.a., amortização 20.000 no mês 11 (reduz prazo)', d: { credito: 120000, parcelas: 96, juros: 10, sistema: 'sac', iof: 'isento', restantes: 96, amortizacoes: [{ em: 11, valor: 20000, modo: 'prazo' }] }, sac: true, iofm: 'isento', ex: { 11: { valor: 20000, modo: 'prazo' } } },
    { nome: 'Price 120.000, 96x, 10% a.a., amortização 20.000 no mês 11 (reduz parcela)', d: { credito: 120000, parcelas: 96, juros: 10, sistema: 'price', iof: 'isento', restantes: 96, amortizacoes: [{ em: 11, valor: 20000, modo: 'parcela' }] }, sac: false, iofm: 'isento', ex: { 11: { valor: 20000, modo: 'parcela' } } }
  ];
  let eMax = 0; const resumo = [];
  casos.forEach(c => {
    const i = Math.pow(1 + c.d.juros / 100, 1 / 12) - 1, n = c.d.parcelas; let F = c.d.credito;
    if (c.iofm === 'financiado') { for (let r = 0; r < 30; r++) F = c.d.credito + iof(F, tabela(F, i, n, c.sac)); }
    else if (c.iofm === 'avista') { /* IOF pago à parte: parcelas sobre o crédito */ }
    const tab = tabela(F, i, n, c.sac, c.ex);
    const ct = E.contratoDaDivida(c.d);
    let e = abs(ct.linhas.length - tab.length) > 0 ? 1e6 : 0; for (let k = 0; k < Math.min(ct.linhas.length, tab.length); k++) e = Math.max(e, abs(ct.linhas[k].pay - tab[k].pay), abs(ct.linhas[k].saldo - tab[k].saldo), abs((ct.linhas[k].extra || 0) - tab[k].ex));
    eMax = Math.max(eMax, e); resumo.push({ caso: c.nome, erro: e, parcelas: tab.length, juros: tab.reduce((a, l) => a + l.j, 0), financiado: F, primeiraParcela: tab[0].pay });
  });
  check('S9.1', 'Estresse de dívidas (fora do cenário): Price/SAC, IOF financiado/à vista/isento, amortização antecipada por prazo e por parcela', 'tabelas próprias vs contratoDaDivida do motor (como observado)', `${casos.length} contratos, parcela a parcela`, eMax, eMax < 0.01);
  OUT.tabelas.estresse = resumo;
}
{ // estresse das participações (fora do cenário): taxa, taxa negativa, saltos pontuais, queda a zero, alvo seguido de taxa, venda sem preço
  const V = 90000, g = (p, n) => Math.pow(1 + p / 100, n / 12);
  const casos = [
    { nome: 'taxa +25% a.a. por 3 anos', p: { valor: V, valorizacao: [{ tipo: 'taxa', pct: 25, de: 0, anos: 3 }] }, esp: m => V * g(25, Math.min(m, 36)), n: 60 },
    { nome: 'taxa −10% a.a. por 5 anos', p: { valor: V, valorizacao: [{ tipo: 'taxa', pct: -10, de: 0, anos: 5 }] }, esp: m => V * g(-10, Math.min(m, 60)), n: 80 },
    { nome: 'salto pontual −50% no mês 12', p: { valor: V, valorizacao: [{ tipo: 'pontual', em: 12, pct: -50 }] }, esp: m => m >= 12 ? V * 0.5 : V, n: 30 },
    { nome: 'salto pontual −500.000 no mês 6 (não pode ficar negativa)', p: { valor: V, valorizacao: [{ tipo: 'pontual', em: 6, valor: -500000 }] }, esp: m => m >= 6 ? 0 : V, n: 30 },
    { nome: 'taxa 12% a.a. + salto pontual +30% no mês 10 (taxa do mês, depois o salto)', p: { valor: V, valorizacao: [{ tipo: 'taxa', pct: 12, de: 0, anos: 5 }, { tipo: 'pontual', em: 10, pct: 30 }] }, esp: m => V * g(12, m) * (m >= 10 ? 1.3 : 1), n: 40 },
    { nome: 'alvo 200.000 no mês 24, depois taxa 10% a.a. (de 24 por 2 anos)', p: { valor: V, valorizacao: [{ tipo: 'alvo', em: 24, valor: 200000 }, { tipo: 'taxa', pct: 10, de: 24, anos: 2 }] }, esp: m => m <= 24 ? V * Math.pow(200000 / V, m / 24) : 200000 * g(10, Math.min(m - 24, 24)), n: 60 },
    { nome: 'alvo 0 no mês 12 (empresa quebra)', p: { valor: V, valorizacao: [{ tipo: 'alvo', em: 12, valor: 0 }] }, esp: m => m <= 12 ? V + (0 - V) * m / 12 : 0, n: 20 }
  ];
  let eMax = 0; const rs = [];
  casos.forEach(c => { const tr = E.trajetoriaDaParticipacao(c.p); let e = 0; for (let m = 0; m <= c.n; m++) e = Math.max(e, abs(tr.serie[m] - c.esp(m))); eMax = Math.max(eMax, e); rs.push({ caso: c.nome, erro: e }); });
  // venda sem preço no mês 36 a 25% a.a., custos 2%: líquido = valor projetado·0,98
  const tv = E.trajetoriaDaParticipacao({ valor: V, valorizacao: [{ tipo: 'taxa', pct: 25, de: 0, anos: 3 }], venda: { em: 36, custos: [{ nome: 'x', pct: 2 }] } });
  const eV = Math.max(abs(tv.venda.projetado - V * 1.25 ** 3), abs(tv.venda.preco - V * 1.25 ** 3), abs(tv.venda.liquido - V * 1.25 ** 3 * 0.98));
  eMax = Math.max(eMax, eV); rs.push({ caso: 'venda sem preço no mês 36 (preço = valor projetado; custos 2%)', erro: eV });
  // a taxa some quando a venda tem preço (a regra que o consultor achou estranha): confere que é o desenho (alvo implícito) e não um acidente
  const tp = E.trajetoriaDaParticipacao({ valor: V, valorizacao: [{ tipo: 'taxa', pct: 25, de: 0, anos: 3 }], venda: { em: 84, preco: 400000 } });
  rs.push({ caso: 'taxa 25% + venda a 400.000 no mês 84 (taxa ignorada por desenho)', valorMes36: tp.serie[36], taxaEfetivaAnual: Math.pow(tp.serie[36] / V, 1 / 3) - 1 });
  check('S9.2', 'Estresse de participações (fora do cenário): taxa, taxa negativa, saltos pontuais, queda a zero, alvo seguido de taxa, venda sem preço', 'séries próprias vs trajetoriaDaParticipacao do motor (como observado)', casos.length + 1 + ' casos, mês a mês', eMax, eMax < 0.01);
  OUT.tabelas.estressePart = rs;
}

// ============================================================================================================
// S10. Sensibilidades OBSERVADAS (motor rodado com variações; não são "esperado", servem para dimensionar o impacto de desenhos)
// ============================================================================================================
{
  const rode = mod => { const p = JSON.parse(JSON.stringify({ dados: plano })); mod(p.dados); return H.extrato(p, H.carregar()); };
  const r = {};
  [['2026-10-14', 'plano'], ['2026-10-29', 'início no dia da auditoria (29/10/2026)']].forEach(([ini, nome]) => { const x = rode(d => { d.inicio = ini; }); r['inicio_' + ini] = { nome, M0: x.M0, W0: x.W0, ffMi: x.ff && x.ff.mi, finFF: x.ff && x.ff.finAfter }; });
  const x5 = rode(d => { d.rate = 0.005; }); r.taxaCaixa05 = { finFF: x5.ff.finAfter, finFinal: x5.meses[x5.meses.length - 1].fim.fin };
  const xn = rode(d => { d.objectives.find(o => o.id === 'apto').dedicated = 0; }); r.aptoSemDedicado = { aporteNecessario: xn.objetivos.find(o => o.id === 'apto').required };
  OUT.achados.sensibilidades = r;
  console.log('Sensibilidades observadas:', JSON.stringify(r));
}

// ============================================================================================================
const falhas = OUT.checks.filter(c => !c.ok);
console.log(`\n${OUT.checks.length} conferências; ${OUT.checks.length - falhas.length} sem erro; ${falhas.length} com desvio:`);
falhas.forEach(c => console.log(' - ' + c.id + ' ' + c.nome + ' | erro ' + (typeof c.erroMax === 'number' ? fmt(c.erroMax) : c.erroMax) + (c.nota ? ' | ' + c.nota : '')));
if (process.env.AUDIT_OUT) fs.writeFileSync(process.env.AUDIT_OUT, JSON.stringify(OUT, null, 1));
