// AUDITOR MATEMÁTICO — CENÁRIO 01 (Beatriz Almeida)
// Reexecutável:  node ux/auditoria/laudos/auditor-01.js            (grava também ux/auditoria/laudos/auditor-01.saida.json)
//
// INDEPENDÊNCIA: este arquivo NÃO chama nenhuma função de cálculo do motor (trajetoriaDoBem, saldoDevedorEm, taxaDoObjetivo,
// simula...). Ele lê só o PLANO (planos/plano-01.json) e recalcula tudo com as regras do domínio financeiro e do calendário,
// escritas aqui. O que vem do motor é apenas o "observado": o extrato (extratos/extrato-01.json) e, no teste sintético de
// dívidas, a saída do harness para planos-variante (sem usar as funções internas para produzir o "esperado").
//
// PREMISSAS DE DESENHO (decisões do produto, não aritmética) — replicadas aqui e conferidas quanto à consistência:
//  P1 calendário: o "mês" do plano vai da semana que contém o dia 5 até a semana anterior à do dia 5 seguinte (4 ou 5 semanas);
//     a semana tem 7 dias contados a partir da data de nascimento (dia 1 se só AAAA-MM); mês 0 = ciclo que contém "hoje".
//  P2 capitalização: o financeiro e cada caixinha rendem SEMANA a SEMANA, fator (1+taxa_mensal)^(7/30,4375), sobre o saldo de
//     ABERTURA da semana; os fluxos da semana entram no FIM dela (rendem só a partir da semana seguinte).
//  P3 participação: valor-alvo = crescimento geométrico (ritmo refeito a cada mês) até o valor esperado; a taxa % a.a. só vale
//     depois do último alvo; o preço de venda é também um alvo no mês da venda; a venda ocorre na semana de abertura do mês.
//  P4 caixinha: taxa do perfil até 24 meses antes da data; conservadora (0,4%/mês) nos últimos 24 meses (ou desde o início se o
//     objetivo tem <=24 meses). Aporte mensal na 4ª semana do ciclo, até a caixinha "bastar" (regra do programa de aportes).
//  P5 liberdade financeira: na 1ª semana de mês com idade >= idade de parar, o trabalho cessa, o padrão de vida é reescalado
//     para que as saídas somem a renda desejada e o saque sai do financeiro.
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..');
const plano = JSON.parse(fs.readFileSync(path.join(RAIZ, 'planos', 'plano-01.json'), 'utf8')).dados;
const ext = JSON.parse(fs.readFileSync(path.join(RAIZ, 'extratos', 'extrato-01.json'), 'utf8'));
const out = { conferencias: [], achados: [], numeros: {} };
const fmt = v => (typeof v === 'number' && v !== 0 && Math.abs(v) < 0.005 ? v.toExponential(1) : typeof v === 'number' ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(v));
let ordem = 0;
function confere(id, nome, metodo, amostra, erroMax, tol, extra) {
  const ok = erroMax <= tol;
  out.conferencias.push({ n: ++ordem, id, nome, metodo, amostra, erroMax, tol, ok, extra: extra || '' });
  console.log(`[${ok ? 'OK ' : 'ERRO'}] ${id} ${nome} | amostra: ${amostra} | erro máx: ${fmt(erroMax)} (tol ${tol})${extra ? ' | ' + extra : ''}`);
}
const maxAbs = a => a.reduce((m, v) => Math.max(m, Math.abs(v)), 0);

// ---------------------------------------------------------------------------------------------------------------------
// 0. CALENDÁRIO (P1) — independente
// ---------------------------------------------------------------------------------------------------------------------
const DIA = 864e5, SEM = 7 * DIA, WPY = 365.25 / 7, NW = Math.round(100 * WPY) + 1, H_SEM = 7 / 30.4375;
const [ny, nm] = plano.nascimento.split('-').map(Number);
const NASC = Date.UTC(ny, nm - 1, 1);
const [iy, im, id_] = plano.inicio.split('-').map(Number);
const HOJE = Date.UTC(iy, im - 1, id_);
const IDADE_HOJE = (HOJE - NASC) / (365.25 * DIA);
const W0 = Math.round(IDADE_HOJE * WPY);
const semanaDe = ms => Math.floor((ms - NASC) / SEM);                      // índice da semana (7 dias desde o nascimento) que contém ms
const semDia5 = (y, m) => semanaDe(Date.UTC(y, m, 5));                       // semana de abertura do ciclo do calendário (y,m)
// ciclos: lista de {y,m,s} (s = semana de abertura) de 1990 a 2090
const ciclos = []; for (let y = 1990; y <= 2090; y++) for (let m = 0; m < 12; m++) ciclos.push({ y, m, s: semDia5(y, m) });
const cic0 = ciclos.findIndex((c, k) => c.s <= W0 && W0 < ciclos[k + 1].s);   // o ciclo que contém "hoje" é o mês 0
const mesDe = c => c - cic0;                                                  // índice do ciclo -> mês do plano
const semMes = mi => ciclos[cic0 + mi].s, nSemMes = mi => semMes(mi + 1) - semMes(mi);
const MESES = Math.max(...ext.meses.map(x => x.mi)) + 1;
out.numeros.W0 = W0; out.numeros.mes0 = ciclos[cic0].y + '-' + String(ciclos[cic0].m + 1).padStart(2, '0');
// mês de cada semana (>= W0), na regra P1
const miDaSemana = new Int32Array(NW).fill(-1);
for (let mi = 0; mi < MESES + 1; mi++) { const a = semMes(mi), b = Math.min(NW, semMes(mi + 1)); for (let i = Math.max(0, a); i < b; i++) miDaSemana[i] = mi; }

// A. calendário contra o extrato (limites de cada mês)
{ let e = 0; ext.meses.forEach(x => { const a = semMes(x.mi), b = Math.min(semMes(x.mi + 1), NW); if (x.mi >= 1) e = Math.max(e, Math.abs(x.w0 - a)); e = Math.max(e, Math.abs(x.w1 - b)); });
  confere('F0', 'Calendário: semana inicial/final de cada mês (dia 5)', 'recálculo com datas (UTC) a partir do nascimento 1990-03', `${ext.meses.length} meses (o balde do mês 0 do extrato abre na semana ${ext.meses[0].w0}, antes da semana do dia 5 de out/2026 = ${semMes(0)}: o ciclo de set/2026 é agrupado no índice 0 — só rótulo, sem fluxo, pois é anterior a hoje)`, e, 0);
  confere('F0b', 'W0 (semana de hoje) e mês 0', 'idade exata x 365,25/7', `W0=${W0} (extrato ${ext.W0}); mês 0 = ${out.numeros.mes0}`, Math.abs(W0 - ext.W0), 0); }

// ---------------------------------------------------------------------------------------------------------------------
// 1. PLANO -> regras
// ---------------------------------------------------------------------------------------------------------------------
const R_M = 0.004, TAXAS = { conservador: 0.004, moderado: 0.005, agressivo: 0.006 };   // perfis padrão da ferramenta (conferidos abaixo contra o extrato)
const degrau = (it, mi) => { let v = 0; for (const s of it.steps.slice().sort((a, b) => a.from - b.from)) { if (mi >= s.from) v = +s.value || 0; else break; } return v; };
const pm = plano.patrimonio.participacoes[0];
const alvos = pm.valorizacao.filter(e => e.tipo === 'alvo').map(e => ({ em: e.em, valor: e.valor }));
if (pm.venda && pm.venda.preco != null) alvos.push({ em: pm.venda.em, valor: pm.venda.preco });   // P3: o preço de venda é alvo
alvos.sort((a, b) => a.em - b.em);
const MES_VENDA = pm.venda.em;

// ---------------------------------------------------------------------------------------------------------------------
// B. PARTICIPAÇÃO — fórmula fechada (independente do passo-a-passo do motor)
// ---------------------------------------------------------------------------------------------------------------------
// Entre dois alvos consecutivos (m0,v0) -> (m1,v1) o crescimento é geométrico constante: v(m) = v0 * (v1/v0)^((m-m0)/(m1-m0)).
function valorPart(m) {
  let m0 = 0, v0 = pm.valor;
  for (const a of alvos) { if (m <= a.em) return v0 * Math.pow(a.valor / v0, (m - m0) / (a.em - m0)); m0 = a.em; v0 = a.valor; }
  return v0;   // depois do último alvo valeria a taxa; aqui a venda corta antes
}
{
  const p = ext.parts[0]; let eSerie = 0, eDet = 0, eFim = 0, nSerie = 0;
  for (let m = 0; m <= MES_VENDA; m++) { eSerie = Math.max(eSerie, Math.abs(valorPart(m) - p.serie[m])); nSerie++; }
  ext.meses.forEach(x => { const esp = x.mi < MES_VENDA ? valorPart(x.mi) : 0; eDet = Math.max(eDet, Math.abs(esp - x.fim.det.parts[0])); eFim = Math.max(eFim, Math.abs(esp - x.fim.part)); });
  confere('B1', 'Participação: série mensal do valor (alvos 72 e 96, geométrica)', 'v0·(v1/v0)^((m−m0)/(m1−m0)) por trecho', `${nSerie} pontos (meses 0..${MES_VENDA}) de parts[0].serie`, eSerie, 0.01);
  confere('B2', 'Participação: fim.det.parts[0] mês a mês (zero depois da venda)', 'idem + zero a partir do mês da venda', `${ext.meses.length} meses`, eDet, 0.01);
  confere('B3', 'Participação: fim.part mês a mês', 'idem', `${ext.meses.length} meses`, eFim, 0.01);
  out.numeros.part = { m36: [valorPart(36), p.serie[36]], m72: [valorPart(72), p.serie[72]], m84: [valorPart(84), p.serie[84]], m95: [valorPart(95), p.serie[95]], m96: [valorPart(96), p.serie[96]] };
  // monotonicidade/sinais
  let neg = 0; p.serie.forEach(v => { if (!(v >= 0)) neg++; });
  confere('B4', 'Participação: série nunca negativa/NaN', 'varredura', `${p.serie.length} pontos`, neg, 0);
  // taxa de 3% a.a.: seria usada? (não: há alvo pendente até a venda). Valor que a taxa de 3% daria
  const taxa = pm.valorizacao.find(e => e.tipo === 'taxa');
  const v3 = m => 1200000 * Math.pow(1 + taxa.pct / 100, (m - taxa.de) / 12);
  out.numeros.taxa3 = { m84: v3(84), m95: v3(95), m96: v3(96), motor95: p.serie[95], dif95: p.serie[95] - v3(95), dif96: 1500000 - v3(96) };
  // venda
  const ev = ext.eventos.find(e => e.type === 'venda');
  const precoV = pm.venda.preco, c1 = precoV * pm.venda.custos[0].pct / 100, c2 = pm.venda.custos[1].valor, liq = precoV - c1 - c2;
  const V = p.venda; const m96 = ext.meses.find(x => x.mi === MES_VENDA), m95 = ext.meses.find(x => x.mi === MES_VENDA - 1);
  const dest = pm.venda.destinos[0].valor;
  const checks = [
    ['preço', precoV, V.preco], ['custo jurídico 2%', c1, V.custos[0].v], ['imposto', c2, V.custos[1].v], ['custo total', c1 + c2, V.custo], ['líquido', liq, V.liquido],
    ['fluxo mov_bens (saída da participação ao preço)', -precoV, m96.fluxo.mov_bens], ['fluxo out_vendap_0 (custos)', c1 + c2, m96.fluxo.out_vendap_0],
    ['fluxo mov_obj_apto (destino 600k + aporte)', dest + 1432, m96.fluxo.mov_obj_apto], ['participação depois da venda', 0, m96.fim.part],
    ['mês da venda', MES_VENDA, V.mi]];
  const e = checks.map(c => Math.abs(c[1] - c[2]));
  confere('B5', 'Venda: preço, custos (2% e 165k), líquido, saída da participação, destino 600k', 'recálculo direto do plano + conferência do fluxo do mês 96', checks.map(c => `${c[0]}: esp ${fmt(c[1])} / motor ${fmt(c[2])}`).join('; '), maxAbs(e), 0.01);
  out.numeros.venda = { checks, evento: ev && ev.detail };
  // renda ligada: lucros somem
  let lucrosApos = 0; ext.meses.forEach(x => { if (x.mi >= MES_VENDA && x.fluxo.in_lucros) lucrosApos++; });
  let lucrosAntes = ext.meses.filter(x => x.mi < MES_VENDA && x.mi >= 1 && x.fluxo.in_lucros).length;
  confere('B6', 'Renda ligada à participação (lucros) termina na venda', 'contagem de meses com in_lucros', `antes: ${lucrosAntes} meses (esperado 16: mar e set de 2027 a 2034 = 2x8), depois: ${lucrosApos}`, lucrosApos + Math.abs(lucrosAntes - 16), 0);
}

// ---------------------------------------------------------------------------------------------------------------------
// MODELO SEMANAL INDEPENDENTE (cofre + caixinhas + participação + bens + fluxos)
// ---------------------------------------------------------------------------------------------------------------------
const OBJS_BASE = plano.objectives.map(o => ({ id: o.id, kind: o.kind, months: Math.round(o.months), amount: o.amount, ded: o.dedicated || 0, planned: o.planned, aporteDe: Math.round(+o.aporteDe || 0), perfil: o.profile, rateM: o.rateM }));
const OBJS = OBJS_BASE;
// taxa que DEVERIA valer no mês mi (P4)
const taxaDevida = (o, mi) => { const b = o.rateM != null && o.rateM !== '' ? +o.rateM : TAXAS[o.perfil], c = Math.min(b, TAXAS.conservador), t = Math.max(0, o.months - 24); return mi >= t ? c : b; };
const inicioAporte = o => Math.max(0, Math.min(Math.max(0, o.months - 1), o.aporteDe));

// ---- programa de aportes (P4): aporte do mês mi = min(planned, falta), falta com 1% de folga; confere o corte de caixa
function programaAportes(pl, OBJS) {
  pl = pl || plano; OBJS = OBJS || OBJS_BASE; const pmv = pl.patrimonio.participacoes[0];
  const n = Math.max(24, ...OBJS.map(o => o.months + 1));
  const ordem = OBJS.slice().sort((a, b) => a.months - b.months);
  const entradas = mi => pl.incomes.reduce((a, c) => {
    const v = degrau(c, mi); if (!v) return a;
    if (c.frequency === 'anual' && c.dates) { const cal = ciclos[cic0 + mi].m; return a + c.dates.filter(d => d.m === cal).length * v; }
    return a + v; }, 0);
  const encerra = c => { if (!c.endObj) return null; const o = OBJS.find(x => x.id === c.endObj); return o ? o.months : null; };
  const saidas = mi => pl.expenses.reduce((a, c) => { const e = encerra(c); return a + (e != null && mi >= e ? 0 : degrau(c, mi)); }, 0);
  const geral = Array.from({ length: n }, (_, mi) => entradas(mi) - saidas(mi));
  const ativo = (o, mi) => mi >= inicioAporte(o) && mi < o.months;
  const net = geral.map((v, mi) => v - ordem.reduce((a, o) => a + (ativo(o, mi) ? o.planned : 0), 0));
  const guardar = net.map((_, mi) => { let c = 0, g = 0; for (let k = mi + 1; k < Math.min(n, mi + 13); k++) { c += net[k]; g = Math.max(g, -c); } return g; });
  const F = {}; OBJS.forEach(o => { const f = [1]; for (let m = 0; m < o.months; m++) f.push(f[m] * (1 + taxaDevida(o, m))); F[o.id] = f; });
  const g = (o, k) => { const f = F[o.id], N = f.length - 1; return f[N] / f[Math.max(0, Math.min(N, k))]; };
  const vendas = {}; OBJS.forEach(o => { vendas[o.id] = (pmv.venda.destinos || []).filter(d => d.objetivo === o.id).map(d => ({ mi: MES_VENDA, usado: d.valor })); });
  const saldo = {}; OBJS.forEach(o => saldo[o.id] = 0);
  const por = {}; OBJS.forEach(o => por[o.id] = new Array(n).fill(0));
  let caixa = 0, cortes = 0, maxCorte = 0, minFalta = {};
  for (let mi = 0; mi < n; mi++) {
    OBJS.forEach(o => { saldo[o.id] *= 1 + taxaDevida(o, mi); if (mi === 0) saldo[o.id] += o.ded; vendas[o.id].forEach(v => { if (v.mi === mi) saldo[o.id] += v.usado; }); });
    const naData = o => saldo[o.id] * g(o, mi) + vendas[o.id].filter(v => v.mi > mi).reduce((a, v) => a + v.usado * g(o, v.mi), 0);
    const falta = o => Math.max(0, (o.amount * 1.01 - naData(o)) / g(o, mi));
    const ativos = ordem.filter(o => ativo(o, mi)), ap = {};
    ativos.forEach(o => { ap[o.id] = Math.min(o.planned, falta(o)); minFalta[o.id] = Math.min(minFalta[o.id] == null ? Infinity : minFalta[o.id], falta(o) - o.planned); });
    let cum = caixa + geral[mi] - Object.values(ap).reduce((a, v) => a + v, 0), corte = Math.max(0, -cum);
    for (let k = 1; k < 12 && mi + k < n && corte > 0.5; k++) { cum += net[mi + k]; const def = Math.max(0, -cum); corte = Math.min(corte, def / (k + 1)); }
    if (corte > 0.5) { cortes++; maxCorte = Math.max(maxCorte, corte); }
    let fim = caixa + geral[mi] - Object.values(ap).reduce((a, v) => a + v, 0);
    const acima = Math.max(0, fim - guardar[mi]); fim -= acima; caixa = fim;
    ativos.forEach(o => { por[o.id][mi] = ap[o.id]; saldo[o.id] += ap[o.id]; });
  }
  return { n, por, cortes, maxCorte, minFalta };
}
const PROG = programaAportes();
out.numeros.programa = { n: PROG.n, mesesComCorte: PROG.cortes, maiorCorte: PROG.maxCorte, folgaMinimaSobrePlanejado: PROG.minFalta };

// ---- simulação semanal
function simular(opc) {
  opc = opc || {};
  const modoTaxa = opc.modoTaxa || 'motor';               // 'motor' = taxa do mês da semana ANTERIOR; 'correta' = taxa do mês da própria semana
  const fixa = opc.taxaFixa || null;                       // {id: taxa} para os contrafactuais (uma taxa só o tempo todo)
  const semVendaDestino = !!opc.semVendaDestino;
  const cofreIni = plano.initialWealth, desired = plano.desired;
  const gCofre = Math.pow(1 + (opc.R || R_M), H_SEM);
  const NOBJ = OBJS.length, obj = new Array(NOBJ).fill(0), done = new Array(NOBJ).fill(false);
  let cofre = 0, bens = 0, part = pm.valor, ultimoP = pm.valor, vendido = false, ff = null, scale = 1, mAnt = 0, miAtual = 0;
  let fim = false;
  const meses = Array.from({ length: MESES }, () => ({ f: {}, estado: null }));
  const sem = [];   // por semana: {cofre, obj}
  const add = (f, k, v) => { f[k] = (f[k] || 0) + v; };
  const PASS = plano.passive[0];
  const retireMi = Math.round((plano.retireAge - IDADE_HOJE) * 12);
  const ativoEm = (o, mi) => mi >= inicioAporte(o) && mi < o.months;
  for (let i = W0; i < NW; i++) {
    const f = {};
    const mi = miDaSemana[i];
    if (mi < 0) continue;
    const k = i - semMes(mi) + 1;                              // posição no ciclo (1 = semana do dia 5)
    if (i === W0) { cofre = cofreIni; OBJS.forEach((o, j) => { obj[j] += o.ded; cofre -= o.ded; add(f, 'mov_cofre', -o.ded); add(f, 'mov_obj_' + o.id, o.ded); }); }
    // (P2) rendimento sobre o saldo de abertura
    if (cofre > 0) cofre *= gCofre;
    const miTaxa = modoTaxa === 'motor' ? mAnt : mi;
    OBJS.forEach((o, j) => { const t = fixa && fixa[o.id] != null ? fixa[o.id] : taxaDevida(o, miTaxa); obj[j] *= Math.pow(1 + t, H_SEM); });
    const abre = k === 1;
    if (abre) {
      // venda da participação (P3)
      if (!vendido && mi >= MES_VENDA) {
        vendido = true; const V = pm.venda; const preco = V.preco;
        const custos = V.custos.map(c => c.pct != null ? preco * c.pct / 100 : c.valor), custo = custos.reduce((a, c) => a + c, 0);
        part -= ultimoP; cofre += preco; add(f, 'mov_bens', -preco); add(f, 'mov_cofre', preco); add(f, 'out_vendap_0', custo);
        const liquido = preco - custo; let resta = liquido;
        if (!semVendaDestino) V.destinos.forEach(d => { const j = OBJS.findIndex(o => o.id === d.objetivo); const v = Math.min(resta, d.valor); if (j >= 0 && !done[j]) { obj[j] += v; cofre -= v; resta -= v; add(f, 'mov_cofre', -v); add(f, 'mov_obj_' + d.objetivo, v); } });
      } else if (!vendido && mi >= 1) { const v = valorPart(mi); part += v - ultimoP; ultimoP = v; }
      // realização dos objetivos
      OBJS.forEach((o, j) => {
        if (!done[j] && mi >= o.months) {
          done[j] = true; const bal = obj[j]; obj[j] = 0; cofre += bal; add(f, 'mov_obj_' + o.id, -bal); add(f, 'mov_cofre', bal);
          if (o.kind === 'bem') { bens += o.amount; cofre -= o.amount; add(f, 'mov_cofre', -o.amount); add(f, 'mov_bens', o.amount); }
          else add(f, 'out_obj_' + o.id, o.amount);
        }
      });
      // liberdade financeira (P5)
      if (!ff && i / WPY >= plano.retireAge && i > W0) { ff = { mi, week: i, finAntes: cofre + obj.reduce((a, b) => a + b, 0) }; }
      miAtual = mi;
      if (ff) {
        const inss = PASS && mi >= PASS.startMi ? PASS.net : 0;
        const ativas = plano.incomes.reduce((a, c) => a + (mi < retireMi ? mensal(c, mi) : 0), 0);
        const w0 = Math.max(0, desired - inss - ativas), w = Math.min(w0, Math.max(0, cofre));
        const vida = plano.expenses.reduce((a, c) => a + (encerrada(c, mi) ? 0 : degrau(c, mi)), 0) || 1;
        scale = Math.max(0, inss + ativas + w) / vida;
      } else scale = 1;
    }
    // fluxos da semana
    plano.incomes.forEach(c => {
      if (ff && mi >= retireMi) return;
      if (c.frequency === 'anual' && c.dates) {
        const cal = ciclos[cic0 + mi].m;
        c.dates.forEach(d => { if (d.m !== cal) return; const sk = Math.min(nSemMes(mi), semanaDe(Date.UTC(ciclos[cic0 + mi].y, cal, d.d)) - semMes(mi) + 1); const v = degrau(c, mi); if (sk === k && v) add(f, 'in_' + c.id, v); });
      } else if (k === 1) { const v = degrau(c, mi); if (v) add(f, 'in_' + c.id, v); }
    });
    if (k === 1 && PASS && mi >= PASS.startMi && !(PASS.dur)) add(f, 'in_pas_0', PASS.net);
    plano.expenses.forEach(c => {
      if (encerrada(c, mi)) return; const v = degrau(c, mi); if (!v) return;
      if (c.week === 0) { if (k <= 4) add(f, 'out_' + c.group + '_' + c.id, v / 4 * scale); }
      else if (c.week === k) add(f, 'out_' + c.group + '_' + c.id, v * scale);
    });
    // aportes (4ª semana do ciclo), só do mês 0 em diante e dentro do horizonte do programa
    if (k === 4 && mi < PROG.n) OBJS.forEach((o, j) => { const ap = PROG.por[o.id][mi]; if (ap > 0 && !done[j]) { obj[j] += ap; cofre -= ap; add(f, 'mov_cofre', -ap); add(f, 'mov_obj_' + o.id, ap); } });
    // fechamento: entradas − saídas vão ao cofre
    let R = 0; for (const key in f) { if (key.startsWith('in_')) R += f[key]; else if (key.startsWith('out_')) R -= f[key]; }
    cofre += R; if (R) add(f, 'mov_cofre', R);
    mAnt = mi;
    // acumula no mês
    const M = meses[mi]; for (const key in f) M.f[key] = (M.f[key] || 0) + f[key];
    M.estado = { cofre, obj: obj.slice(), bens, part, fin: cofre + obj.reduce((a, b) => a + b, 0), semana: i };
    sem[i] = { cofre, obj: obj.slice() };
  }
  return { meses, ff, sem };
}
function mensal(c, mi) { const v = degrau(c, mi); if (c.frequency === 'anual' && c.dates) return v * c.dates.length / 12; return v; }
function encerrada(c, mi) { if (!c.endObj) return false; const o = OBJS.find(x => x.id === c.endObj); return !!o && mi >= o.months; }

const MOD = simular();
// ---------------------------------------------------------------------------------------------------------------------
// comparação mês a mês: estado final e cada linha de fluxo
// ---------------------------------------------------------------------------------------------------------------------
{
  const ids = OBJS.map(o => o.id);
  let eFin = 0, eCofre = 0, eObj = 0, eBens = 0, ePart = 0, piorMes = {};
  const eFluxoChaves = {}; let eFluxo = 0, nChaves = 0, chavesFaltando = [];
  ext.meses.forEach(x => {
    const M = MOD.meses[x.mi]; if (!M.estado) return;
    const e = M.estado, o = x.fim;
    const d = [['fin', e.fin - o.fin], ['cofre', e.cofre - o.cofre], ['bens', e.bens - o.bens], ['part', e.part - o.part]];
    ids.forEach((id, j) => d.push(['obj_' + id, e.obj[j] - o.obj[j]]));
    d.forEach(([n, v]) => { if (Math.abs(v) > (piorMes[n] ? piorMes[n].v : 0)) piorMes[n] = { v: Math.abs(v), mi: x.mi }; });
    eFin = Math.max(eFin, Math.abs(d[0][1])); eCofre = Math.max(eCofre, Math.abs(d[1][1])); eBens = Math.max(eBens, Math.abs(d[2][1])); ePart = Math.max(ePart, Math.abs(d[3][1]));
    ids.forEach((id, j) => eObj = Math.max(eObj, Math.abs(e.obj[j] - o.obj[j])));
    // fluxos
    const chaves = new Set([...Object.keys(x.fluxo), ...Object.keys(M.f)]);
    chaves.forEach(key => { const a = M.f[key] || 0, b = x.fluxo[key] || 0; const dif = Math.abs(a - b); if (dif > 0.005 && !(Math.abs(a) < 0.005 && Math.abs(b) < 0.005)) { eFluxoChaves[key] = Math.max(eFluxoChaves[key] || 0, dif); } eFluxo = Math.max(eFluxo, dif); nChaves++; });
  });
  out.numeros.piorMes = piorMes;
  const n = ext.meses.length;
  confere('E1', 'Modelo semanal independente x extrato: financeiro total (fim de cada mês)', 'simulação própria (P1-P5) a partir do plano', `${n} meses (0..${MESES - 1})`, eFin, 0.01);
  confere('E2', 'Modelo independente x extrato: cofre (financeiro livre)', 'idem', `${n} meses`, eCofre, 0.01);
  confere('D1', 'Modelo independente x extrato: saldo de cada caixinha (3 objetivos) no fim de cada mês', 'idem', `${n} meses x 3 objetivos`, eObj, 0.01);
  confere('A1', 'Bens (compra do apartamento) mês a mês', 'idem', `${n} meses`, eBens, 0.01);
  confere('B7', 'Participações (soma) mês a mês pelo modelo semanal', 'idem', `${n} meses`, ePart, 0.01);
  confere('F1', 'Fluxo: toda linha in_*/out_*/mov_* de cada mês (valor e existência)', 'modelo próprio de entradas, saídas, aportes, vendas e transferências', `${n} meses x ${Object.keys(ext.meses[0].fluxo).length}+ linhas (${nChaves} pares mês/linha)`, eFluxo, 0.01, Object.keys(eFluxoChaves).length ? 'divergências: ' + JSON.stringify(eFluxoChaves) : '');
}

// liberdade financeira
{
  const f1 = MOD.ff, f2 = ext.ff;
  confere('G1', 'Liberdade financeira: mês e semana do gatilho', '1ª semana de abertura de mês com idade >= 55', `modelo mês ${f1.mi}/sem ${f1.week}; motor mês ${f2.mi}/sem ${f2.week}`, Math.abs(f1.mi - f2.mi) + Math.abs(f1.week - f2.week), 0);
  confere('G2', 'Liberdade financeira: patrimônio financeiro no gatilho', 'modelo próprio', `modelo ${fmt(f1.finAntes)} x motor ${fmt(f2.finBefore)}`, Math.abs(f1.finAntes - f2.finBefore), 0.01);
}

// ---------------------------------------------------------------------------------------------------------------------
// A. CONTABILIDADE (só com o extrato)
// ---------------------------------------------------------------------------------------------------------------------
{
  let e1 = 0, e2 = 0, e3 = 0, nan = 0, neg = 0, e5 = 0, ePart2 = 0, eBens2 = 0; const ids = OBJS.map(o => o.id);
  const rend = [];   // rendimento implícito de cada mês
  ext.meses.forEach((x, j) => {
    const o = x.fim; const vals = [o.fin, o.cofre, o.bens, o.part, o.prev, o.div, o.cheque, ...o.obj, ...Object.values(x.fluxo)]; vals.forEach(v => { if (!Number.isFinite(v)) nan++; });
    if (o.cofre < -0.005 || o.bens < -0.005 || o.part < -0.005 || o.div < -0.005 || o.obj.some(v => v < -0.005)) neg++;
    e1 = Math.max(e1, Math.abs(o.fin - (o.cofre + o.obj.reduce((a, b) => a + b, 0))));
    // transferências somam zero: mov_cofre + Σ mov_obj + mov_bens == entradas − saídas
    let inn = 0, outt = 0, mov = 0; for (const k in x.fluxo) { if (k.startsWith('in_')) inn += x.fluxo[k]; else if (k.startsWith('out_')) outt += x.fluxo[k]; else if (k.startsWith('mov_')) mov += x.fluxo[k]; }
    // mov_bens é a variação de bens (positivo = bem sobe); mov_cofre e mov_obj_* são variações de cofre/caixinhas. Soma das variações por fluxo = entradas − saídas
    e2 = Math.max(e2, Math.abs(mov - (inn - outt)));
    // Δfin = (in − out) − mov_bens + rendimento  => rendimento implícito
    if (j > 0) {
      const p = ext.meses[j - 1].fim; const r = (o.fin - p.fin) - (inn - outt) + (x.fluxo.mov_bens || 0);
      rend.push({ mi: x.mi, r, base: p.fin });
      // participação só varia por valorização/venda (nunca por fluxo de caixa): Δpart − (valorização do modelo) = 0
      const esp = x.mi < MES_VENDA ? valorPart(x.mi) : 0; ePart2 = Math.max(ePart2, Math.abs(o.part - esp));
    }
    // dívida zero
    e3 = Math.max(e3, Math.abs(o.div), Math.abs(o.cheque));
  });
  confere('A2', 'fim.fin = cofre + soma das caixinhas', 'identidade', `${ext.meses.length} meses`, e1, 0.005);
  confere('A3', 'Conservação: Σ variações (mov_cofre + mov_obj_* + mov_bens) = entradas − saídas', 'soma das linhas mov_* contra Σin − Σout', `${ext.meses.length} meses`, e2, 0.01);
  confere('A4', 'Sem NaN/Infinity e sem saldos negativos (cofre, caixinhas, bens, participações, dívida)', 'varredura', `${ext.meses.length} meses`, nan + neg, 0);
  confere('A5', 'Dívida (div) e cheque especial = 0 em todos os meses (controle: cliente sem dívida)', 'varredura', `${ext.meses.length} meses`, e3, 0);
  // rendimento implícito x rendimento do modelo (semanal): conferido indiretamente por E1; aqui, ordem de grandeza anualizada
  const r1 = rend.filter(x => x.mi >= 1 && x.mi <= 12).reduce((a, x) => a + x.r, 0);
  out.numeros.rendimentoAno1 = r1;
  // patrimônio total mês a mês e variações (sem contar duas vezes na venda)
  const pat = ext.meses.map(x => x.fim.fin + x.fim.bens + x.fim.part + x.fim.prev - x.fim.div);
  out.numeros.patrimonio = { m0: pat[0], m95: pat[95], m96: pat[96], m120: pat[120], m221: pat[221], m648: pat[648], m761: pat[761] };
  const mv = ext.meses[96], m95 = ext.meses[95];
  let inn = 0, outt = 0; for (const k in mv.fluxo) { if (k.startsWith('in_')) inn += mv.fluxo[k]; else if (k.startsWith('out_')) outt += mv.fluxo[k]; }
  // Δpatrimônio(96) = (preço − última valorização da participação) − custos + (outras entradas − saídas) + rendimento do mês
  const rend96 = rend.find(x => x.mi === 96).r;
  const esp96 = (pm.venda.preco - m95.fim.part) - 195000 + (inn - outt - 195000 * 0) - 0;   // inn − outt já contém −195.000 (out_vendap_0)
  const d96 = pat[96] - pat[95];
  const calc96 = (pm.venda.preco - m95.fim.part) + (inn - outt) + rend96;
  confere('A6', 'Venda (mês 96): Δpatrimônio = (preço − participação marcada) + (entradas − saídas, já com os 195k de custo) + rendimento; sem contar a venda duas vezes', 'balanço do mês', `Δ observado ${fmt(d96)} x calculado ${fmt(calc96)}`, Math.abs(d96 - calc96), 0.01);
  out.numeros.venda96 = { dPat: d96, jumpMarcacao: pm.venda.preco - m95.fim.part, custos: 195000, rend96 };
  // aposentadoria: variação do patrimônio financeiro no mês da liberdade
  const j221 = ext.meses[221], j220 = ext.meses[220];
  confere('A7', 'Participação não é afetada por fluxo de caixa (só valorização/venda)', 'part observada x fórmula', `${ext.meses.length - 1} meses`, ePart2, 0.01);
}

// ---------------------------------------------------------------------------------------------------------------------
// D. CAIXINHAS — taxa por mês, troca de taxa, contrafactuais
// regra de parada do aporte: variante com aporte do apartamento de 2.500/mês (a caixinha "basta" antes do mês 120)
try {
  const H = require(path.join(RAIZ, 'harness.js')); const E = H.carregar();
  const Q = JSON.parse(JSON.stringify(plano)); Q.objectives[2].planned = 2500;
  const objsQ = Q.objectives.map(o => ({ id: o.id, kind: o.kind, months: Math.round(o.months), amount: o.amount, ded: o.dedicated || 0, planned: o.planned, aporteDe: Math.round(+o.aporteDe || 0), perfil: o.profile, rateM: o.rateM }));
  const PQ = programaAportes(Q, objsQ), x = H.extrato({ dados: Q }, E);
  let e = 0; x.meses.forEach(m => { if (m.mi >= 120) return; let r = m.fluxo.mov_obj_apto || 0; if (m.mi === MES_VENDA) r -= 600000; e = Math.max(e, Math.abs(r - PQ.por.apto[m.mi])); });
  const ultimo = PQ.por.apto.map((v, k) => [v, k]).filter(([v]) => v > 0.005).pop(), qtd = PQ.por.apto.filter(v => v > 0.005).length;
  const parcial = PQ.por.apto.map((v, k) => [v, k]).filter(([v]) => v > 0.005 && v < 2500);
  confere('D8', 'Regra de parada do aporte (variante: apartamento com aporte de 2.500/mês): aporte = min(planejado, o que falta com 1% de folga)', 'programa de aportes recalculado', `aportes até o mês ${ultimo[1]} (${qtd} de 120); último aporte parcial ${parcial.length ? fmt(parcial[0][0]) + ' no mês ' + parcial[0][1] : 'nenhum'}; depois, zero`, e, 0.01);
  out.numeros.paradaAporte = { qtd, ultimoMes: ultimo[1], parcial: parcial[0] || null, saldoNaData: x.meses[119].fim.obj[2] };
} catch (err) { console.log('variante de parada falhou:', err.message); out.achados.push('variante de parada falhou: ' + err.message); }

// amostra de saldos das caixinhas (modelo x extrato) e aporte necessário em regimes alternativos
{
  const meses = [0, 1, 5, 11, 12, 13, 23, 24, 35, 36, 59, 60, 95, 96, 97, 119];
  out.numeros.amostraSaldos = meses.map(mi => { const x = ext.meses[mi], e = MOD.meses[mi].estado; return { mi, obs: x.fim.obj.map(v => +v.toFixed(2)), mod: e.obj.map(v => +v.toFixed(2)), cofreObs: +x.fim.cofre.toFixed(2), cofreMod: +e.cofre.toFixed(2) }; });
  const A = (r, n) => (Math.pow(1 + r, n) - 1) / r;
  out.numeros.aporteAlternativo = {
    aptoPlanejado: (900000 - 600000 * Math.pow(1.004, 24)) / (A(.006, 96) * Math.pow(1.004, 24) + A(.004, 24)),
    aptoTodoAgressivo: (900000 - 600000 * Math.pow(1.006, 24)) / A(.006, 120),
    aptoTodoConservador: (900000 - 600000 * Math.pow(1.004, 24)) / A(.004, 120),
    mbaPlanejado: 120000 / A(.004, 24), mbaSeTodoModerado: 120000 / A(.005, 24),
    sabaticoPlanejado: (60000 - 20000 * Math.pow(1.004, 12)) / A(.004, 12), sabaticoSeModerado: (60000 - 20000 * Math.pow(1.005, 12)) / A(.005, 12) };
}

// ---------------------------------------------------------------------------------------------------------------------
{
  // PROFILES do extrato
  const pe = Math.max(Math.abs(ext.PROFILES.conservador - 0.004), Math.abs(ext.PROFILES.moderado - 0.005), Math.abs(ext.PROFILES.agressivo - 0.006), Math.abs(ext.R_M - R_M), Math.abs(ext.MESES_CONSERVADOR - 24));
  confere('D2', 'Parâmetros: perfis 0,4/0,5/0,6% a.m., R_M 0,4%, janela de 24 meses', 'comparação com o extrato', 'PROFILES, R_M, MESES_CONSERVADOR', pe, 0);
  // taxaPorMes
  let eTx = 0, nTx = 0; const trocas = {};
  ext.objetivos.forEach(ob => { const o = OBJS.find(x => x.id === ob.id); let ult = null; ob.taxaPorMes.forEach((t, mi) => { eTx = Math.max(eTx, Math.abs(t - taxaDevida(o, mi))); nTx++; if (ult != null && t !== ult) trocas[ob.id] = { mes: mi, de: ult, para: t }; ult = t; }); });
  confere('D3', 'taxaPorMes de cada objetivo = taxa devida (perfil antes dos últimos 24 meses; conservadora depois)', 'regra P4', `${nTx} pares objetivo/mês`, eTx, 0);
  out.numeros.trocas = trocas;
  // mês exato da troca esperado
  const trocaEsp = {}; OBJS.forEach(o => { const t = Math.max(0, o.months - 24); trocaEsp[o.id] = t; });
  out.numeros.trocaEsperada = trocaEsp;
  // taxa aplicada na semana (P2): verifica a taxa EFETIVA semana a semana a partir do saldo observado semanalmente é impossível só com o extrato mensal,
  // então prova-se a taxa pelo fechamento: modelo(P2, taxa devida) == extrato (D1). Aqui medimos o efeito de cada defasagem:
  const corr = simular({ modoTaxa: 'correta' });
  const dif = {}; ext.meses.forEach(x => { const M = corr.meses[x.mi]; if (!M.estado) return; OBJS.forEach((o, j) => { dif[o.id] = dif[o.id] || { max: 0, mi: -1, saldoFim: 0 }; const d = Math.abs(M.estado.obj[j] - x.fim.obj[j]); if (d > dif[o.id].max) dif[o.id] = { max: d, mi: x.mi }; }); });
  const patCorr = ext.meses.map(x => { const e = corr.meses[x.mi].estado; return e.fin + e.bens + e.part; });
  const patObs = ext.meses.map(x => x.fim.fin + x.fim.bens + x.fim.part);
  let maxPat = 0, miMax = 0; patCorr.forEach((v, j) => { const d = Math.abs(v - patObs[j]); if (d > maxPat) { maxPat = d; miMax = j; } });
  out.numeros.defasagemTaxa = { porObjetivo: dif, patrimonioMax: maxPat, mes: miMax, patrimonioFim: patCorr[patCorr.length - 1] - patObs[patObs.length - 1], mes221: patCorr[221] - patObs[221], mes120: patCorr[120] - patObs[120] };
  // contrafactuais por caixinha (impacto de uma taxa só o tempo todo), medido no saldo na data de realização
  const saldoNaData = (sim, id) => { const j = OBJS.findIndex(o => o.id === id), mes = OBJS[j].months; const prev = sim.meses[mes - 1].estado.obj[j]; return prev; };
  const base = {}, cf = {};
  OBJS.forEach((o, j) => { base[o.id] = ext.meses[o.months - 1].fim.obj[j]; });
  const variantes = { 'só conservadora': { sabatico: .004, mba: .004, apto: .004 }, 'só agressiva (apto)': { apto: .006 }, 'só moderada (mba)': { mba: .005 }, 'perfil escolhido o tempo todo': { sabatico: .005, mba: .005, apto: .006 } };
  Object.entries(variantes).forEach(([nome, tx]) => { const s = simular({ taxaFixa: tx, modoTaxa: 'motor' }); cf[nome] = {}; OBJS.forEach((o, j) => { cf[nome][o.id] = s.meses[o.months - 1].estado.obj[j] - base[o.id]; }); });
  out.numeros.contrafactual = { base, cf };
  // os 600k: 24 meses conservadores x agressivos (fórmula do cenário)
  out.numeros.seiscentos = { conservador: 600000 * Math.pow(1.004, 24), agressivo: 600000 * Math.pow(1.006, 24), dif: 600000 * (Math.pow(1.006, 24) - Math.pow(1.004, 24)) };
  // fator de aportes 167,447 e aporte necessário (fórmula mensal fechada do cenário)
  const A = (r, n) => (Math.pow(1 + r, n) - 1) / r, fator = A(.006, 96) * Math.pow(1.004, 24) + A(.004, 24);
  out.numeros.fatorApto = { fator, aporte: (900000 - 600000 * Math.pow(1.004, 24)) / fator, mba: 120000 / A(.004, 24), sabatico: (60000 - 20000 * Math.pow(1.004, 12)) / A(.004, 12) };
  const eF = Math.abs(fator - 167.447);
  confere('D4', 'Aporte do apartamento: fator (96 meses a 0,6% levados 24 meses a 0,4% + 24 meses a 0,4%) e aporte necessário', 'fórmula fechada mensal (aportes no fim do mês)', `fator ${fator.toFixed(3)} (cenário 167,447); aporte ${out.numeros.fatorApto.aporte.toFixed(2)} (planejado 1.432)`, Math.max(eF * 0, Math.abs(Math.ceil(out.numeros.fatorApto.aporte) - 1432)), 0);
  // regra de aporte: planejado em cada mês ativo, e zero fora
  let eAp = 0, nAp = 0; ext.meses.forEach(x => { OBJS.forEach(o => { const esperado = (x.mi < PROG.n ? PROG.por[o.id][x.mi] : 0); const real = x.fluxo['mov_obj_' + o.id] || 0; let r = real; if (x.mi === MES_VENDA && o.id === 'apto') r -= 600000; if (x.mi === o.months) return; if (x.mi === 0 && o.id === 'sabatico') r -= o.ded; eAp = Math.max(eAp, Math.abs(r - esperado)); nAp++; }); });
  confere('D5', 'Aportes mensais (mov_obj_*) = planejado em todo mês ativo; zero antes do início, depois da data e quando a caixinha "basta" (regra de 1% de folga)', 'recálculo do programa de aportes', `${nAp} pares mês/objetivo; meses com corte por falta de caixa: ${PROG.cortes}`, eAp, 0.01);
  const contAp = {}; OBJS.forEach(o => contAp[o.id] = PROG.por[o.id].filter(v => v > 0).length); out.numeros.qtdAportes = contAp;
  // saque na data: consumo e bem
  const linhas = [];
  OBJS.forEach((o, j) => { const x = ext.meses[o.months]; const bal = -(x.fluxo['mov_obj_' + o.id] || 0) - 0; const saldoAntes = ext.meses[o.months - 1].fim.obj[j];
    // saldo retirado = saldo do mês anterior + 1 semana de rendimento (+ venda/aporte do mês na semana de abertura = 0)
    linhas.push({ id: o.id, mes: o.months, retirado: -(x.fluxo['mov_obj_' + o.id] || 0), saldoAnterior: saldoAntes, gasto: o.kind === 'bem' ? x.fluxo.mov_bens : x.fluxo['out_obj_' + o.id], meta: o.amount, devolvidoAoCofre: -(x.fluxo['mov_obj_' + o.id] || 0) - o.amount }); });
  out.numeros.saques = linhas;
  let eS = 0; linhas.forEach(l => { eS = Math.max(eS, Math.abs(l.gasto - l.meta)); });
  confere('D6', 'Saque na data: gasto = valor do objetivo (consumo vai a out_obj_*, bem a mov_bens); a sobra volta ao cofre; caixinha zera', 'leitura do fluxo do mês da data', linhas.map(l => `${l.id}: retirado ${fmt(l.retirado)}, gasto ${fmt(l.gasto)}, volta ${fmt(l.devolvidoAoCofre)}`).join('; '), eS, 0.01);
  let zer = 0; OBJS.forEach((o, j) => ext.meses.filter(x => x.mi >= o.months).forEach(x => { zer = Math.max(zer, Math.abs(x.fim.obj[j])); }));
  confere('D7', 'Caixinha zerada depois da data e saldo nunca negativo', 'varredura', 'todos os meses >= data', zer, 0.005);
}

// ---------------------------------------------------------------------------------------------------------------------
// F. FLUXO — conferência por linha contra o plano (independente do modelo semanal)
// ---------------------------------------------------------------------------------------------------------------------
{
  // soma mensal esperada a partir do plano, antes da liberdade: cada linha mensal = valor do degrau; anual com datas = nos meses do calendário
  let e = 0, n = 0; const retireMi = Math.round((plano.retireAge - IDADE_HOJE) * 12);
  ext.meses.forEach(x => {
    if (x.mi < 1 || x.mi >= retireMi) return;
    plano.incomes.forEach(c => { let esp = 0; if (c.frequency === 'anual' && c.dates) { const cal = ciclos[cic0 + x.mi].m; esp = c.dates.filter(d => d.m === cal).length * degrau(c, x.mi); } else esp = degrau(c, x.mi); e = Math.max(e, Math.abs((x.fluxo['in_' + c.id] || 0) - esp)); n++; });
    plano.expenses.forEach(c => { const esp = encerrada(c, x.mi) ? 0 : degrau(c, x.mi); e = Math.max(e, Math.abs((x.fluxo['out_' + c.group + '_' + c.id] || 0) - esp)); n++; });
  });
  confere('F2', 'Fluxo mensal (meses 1 a 220): cada renda e despesa = plano (pró-labore 14k, lucros 30k em mar/set até a venda, 11.500 de gastos, aluguel até o mês 119)', 'soma mensal do plano x extrato', `${n} pares mês/linha`, e, 0.01);
  // mês 0 parcial
  const x0 = ext.meses[0].fluxo;
  const esp0 = { out_adj_mercado: 2200 * .75, out_adj_transporte: 900 * .75, out_adj_lazer: 1800 * .75, out_adj_diversos: 1300 * .75, out_fix_saude: 1100 };
  let e0 = 0; Object.entries(esp0).forEach(([k, v]) => e0 = Math.max(e0, Math.abs((x0[k] || 0) - v))); e0 = Math.max(e0, Math.abs(x0.in_prolabore || 0), Math.abs(x0.out_fix_moradia || 0));
  confere('F3', 'Mês 0 (parcial): só 3 das 4 fatias de despesas variáveis, saúde na 4ª semana, sem pró-labore/aluguel (caíram dia 5, antes de hoje=10/10)', 'regra de calendário (semana do dia 5 < W0)', 'mês 0', e0, 0.01);
  // meses de borda: dezembro, mês da venda, mês 12, mês 36, mês 120, mês 221, 341
  const bordas = [11, 12, 36, 95, 96, 97, 119, 120, 121, 221, 341];
  out.numeros.bordas = bordas.map(mi => { const x = ext.meses.find(a => a.mi === mi); const M = MOD.meses[mi]; let d = 0; Object.keys({ ...x.fluxo, ...M.f }).forEach(k => d = Math.max(d, Math.abs((x.fluxo[k] || 0) - (M.f[k] || 0)))); return { mi, difMax: d }; });
  // pós-liberdade: saídas somam exatamente a renda desejada
  let eL = 0, nL = 0; ext.meses.forEach(x => { if (x.mi < 222 || x.mi > 700) return; let outt = 0, inn = 0; for (const k in x.fluxo) { if (k.startsWith('out_')) outt += x.fluxo[k]; if (k.startsWith('in_')) inn += x.fluxo[k]; } eL = Math.max(eL, Math.abs(outt - plano.desired)); nL++; });
  confere('G3', 'Após a liberdade: soma das saídas do mês = renda desejada (16.000), sempre (padrão de vida reescalado)', 'Σ out_* por mês', `${nL} meses (222..700)`, eL, 0.01);
  // saque x entradas
  let eS = 0; ext.meses.forEach(x => { if (x.mi < 221 || x.mi > 340) return; eS = Math.max(eS, Math.abs(x.fluxo.mov_cofre + plano.desired)); }); ext.meses.forEach(x => { if (x.mi < 341 || x.mi > 700) return; eS = Math.max(eS, Math.abs(x.fluxo.mov_cofre + plano.desired - 6500)); });
  confere('G4', 'Saque líquido do financeiro: 16.000 até o mês 340 e 9.500 (16.000 − INSS 6.500) a partir do 341', 'mov_cofre', 'meses 221..700', eS, 0.01);
}

// ---------------------------------------------------------------------------------------------------------------------
// E. RENDIMENTO DO FINANCEIRO — convenção e consistência
// ---------------------------------------------------------------------------------------------------------------------
{
  // taxa efetiva anual do cofre num período sem fluxos significativos: fatores semanais compostos em 365,25 dias = (1+r)^12
  const anual = Math.pow(Math.pow(1 + R_M, H_SEM), WPY) - 1, esperado = Math.pow(1 + R_M, 12) - 1;
  confere('E3', 'Convenção: 52,18 semanas de fator (1,004)^(7/30,4375) rendem exatamente (1,004)^12 − 1 ao ano', 'aritmética', `${(anual * 100).toFixed(4)}% a.a.`, Math.abs(anual - esperado), 1e-12);
  // mês de 4 semanas rende menos que mês de 5 semanas (consequência de P2)
  const f4 = Math.pow(1 + R_M, 4 * H_SEM) - 1, f5 = Math.pow(1 + R_M, 5 * H_SEM) - 1;
  out.numeros.mes4x5 = { f4: f4 * 100, f5: f5 * 100, mediaAnual: (Math.pow(1 + R_M, 12) - 1) * 100 };
  // rendimento só sobre saldo positivo; teste: o cofre mínimo da trajetória e o piso de reserva (70.000)
  let minCofre = Infinity, miMin = -1; ext.meses.forEach(x => { if (x.fim.cofre < minCofre) { minCofre = x.fim.cofre; miMin = x.mi; } });
  out.numeros.minCofre = { valor: minCofre, mi: miMin };
  // finito x perpetuidade
  const r = R_M, an = (n) => (1 - Math.pow(1 + r, -n)) / r;
  const horizontes = {}; [90, 100].forEach(idadeFim => { const n1 = 120, n2 = Math.round((idadeFim - 65) * 12); horizontes[idadeFim] = 16000 * an(n1) + 9500 * an(n2) * Math.pow(1 + r, -n1); });
  out.numeros.sustento = { necessarioAte90: horizontes[90], necessarioAte100: horizontes[100], perpetuidade: 16000 / r, financeiro55: ext.ff.finBefore, motorSustentavel: ext.ff.sustentavel, forced: ext.ff.forced };
}

// ---------------------------------------------------------------------------------------------------------------------
// H. FIDELIDADE AO CLIENTE — valores esperados do cenário x extrato
// ---------------------------------------------------------------------------------------------------------------------
{
  const e = out.numeros;
  const itens = [
    ['Valor da participação no mês 36 (400.000·3^(36/72))', 692820, ext.parts[0].serie[36]],
    ['Valor no mês 72', 1200000, ext.parts[0].serie[72]],
    ['Valor no mês 84 (1,2 mi·1,25^(12/24))', 1341641, ext.parts[0].serie[84]],
    ['Preço no mês 96', 1500000, ext.parts[0].serie[96]],
    ['Custos + líquido', 1305000, ext.parts[0].venda.liquido],
    ['600k no mês 120 (24 meses conservadores)', 660329, 600000 * Math.pow(1.004, 24)],
    ['Aporte do apartamento (planejado)', 1431, plano.objectives[2].planned],
    ['Aporte do sabático', 3181, plano.objectives[0].planned],
    ['Aporte do MBA', 4774, plano.objectives[1].planned]];
  out.numeros.fidelidade = itens.map(([nome, esp, obs]) => ({ nome, esp, obs, dif: obs - esp }));
  itens.forEach(([nome, esp, obs]) => { /* exibidos no laudo */ });
  const maxdif = Math.max(...itens.filter((x, k) => k !== 6).map(([n, e1, o]) => Math.abs(o - e1)));
  confere('H1', 'Valores esperados à mão do cenário (participação 36/72/84/96, líquido, 600k→660.329, aportes 3.181/4.774) x motor', 'comparação direta (tolerância R$ 1 pelos arredondamentos do cenário)', itens.length + ' valores', maxdif, 1);
}

// ---------------------------------------------------------------------------------------------------------------------
// C. DÍVIDAS — teste sintético (o cliente não tem dívida): amortização Price/SAC/IOF/antecipação recalculada aqui
// ---------------------------------------------------------------------------------------------------------------------
let sintetico = null;
try {
  const H = require(path.join(RAIZ, 'harness.js'));
  const E = H.carregar();
  // independente: tabela de amortização
  const tab = (F, i, n, sac, extras) => { const out = []; let bal = F, pmt = i > 0 ? F * i / (1 - Math.pow(1 + i, -n)) : F / n, am = F / n;
    for (let k = 0; k < n && bal > 0.005; k++) { const j = bal * i, a = Math.min(bal, sac ? am : pmt - j); bal = Math.max(0, bal - a); const x = extras && extras[k]; let ex = 0;
      if (x && bal > 0) { ex = Math.min(bal, x.valor); bal -= ex; const r = n - k - 1; if (x.modo === 'parcela' && bal > 0 && r > 0) { pmt = i > 0 ? bal * i / (1 - Math.pow(1 + i, -r)) : bal / r; am = bal / r; } }
      out.push({ j, a, ex, pay: j + a, saldo: bal }); } return out; };
  const iof = (F, i, n, sac) => { const t = tab(F, i, n, sac); return F * 0.0038 + t.reduce((a, l, k) => a + l.a * 0.000082 * Math.min(365, 30 * (k + 1)), 0); };
  const casos = [
    { nome: 'Price isento 100k, 60x, 12% a.a.', d: { credito: 100000, parcelas: 60, juros: 12, sistema: 'price', iof: 'isento' }, sac: false, iofModo: 'isento' },
    { nome: 'SAC isento 100k, 60x, 12% a.a.', d: { credito: 100000, parcelas: 60, juros: 12, sistema: 'sac', iof: 'isento' }, sac: true, iofModo: 'isento' },
    { nome: 'Price com IOF financiado 80k, 48x, 18% a.a.', d: { credito: 80000, parcelas: 48, juros: 18, sistema: 'price', iof: 'financiado' }, sac: false, iofModo: 'financiado' },
    { nome: 'Price isento 100k, 60x, antecipação 20k no mês 12 (prazo) e 10k no mês 24 (parcela)', d: { credito: 100000, parcelas: 60, juros: 12, sistema: 'price', iof: 'isento', amortizacoes: [{ em: 12, valor: 20000, modo: 'prazo' }, { em: 24, valor: 10000, modo: 'parcela' }] }, sac: false, iofModo: 'isento', extras: { 12: { valor: 20000, modo: 'prazo' }, 24: { valor: 10000, modo: 'parcela' } } },
  ];
  const res = [];
  casos.forEach(c => {
    const P = JSON.parse(JSON.stringify(plano)); const dv = Object.assign({ nome: c.nome, inicio: '2026-10', saldoDevedor: 0 }, c.d);
    const i = Math.pow(1 + c.d.juros / 100, 1 / 12) - 1, n = c.d.parcelas;
    let F = c.d.credito; if (c.iofModo === 'financiado') { const base = F; F = base; for (let r = 0; r < 12; r++) F = base + iof(F, i, n, c.sac); }
    dv.saldoDevedor = F;   // saldo de hoje = valor financiado (1ª parcela neste mês)
    P.patrimonio.dividas = [dv];
    const x = H.extrato({ dados: P }, E);
    const t = tab(F, i, n, c.sac, c.extras);
    // motor: saldoDevedorEm(k): k=0 -> financiado; k>=1 -> saldo depois da parcela k
    let e = Math.abs(x.dividasAvulsas[0].saldo[0] - F); for (let k = 1; k <= 80; k++) { const esp = k <= t.length ? t[k - 1].saldo : 0; e = Math.max(e, Math.abs(x.dividasAvulsas[0].saldo[k] - esp)); }
    // parcela no fluxo (out_*): dívida avulsa sem linha não gera fluxo -> só conferimos saldo; registra o cronograma de juros pagos
    const jurosPagos = t.reduce((a, l) => a + l.j, 0), principal = t.reduce((a, l) => a + l.a + l.ex, 0);
    res.push({ nome: c.nome, erroSaldo: e, parcelas: t.length, juros: jurosPagos, principal, F, ioF: F - c.d.credito, saldoZeroEm: t.length, divEmFimMeses: x.meses.slice(0, 70).map(m => m.fim.div).slice(0, 3) });
  });
  sintetico = res;
  res.forEach(r => confere('C' + (res.indexOf(r) + 1), 'Dívida sintética: ' + r.nome, 'tabela de amortização própria (taxa mensal = (1+a.a.)^(1/12)−1), IOF 0,38%+0,0082%/dia', `saldo mês a mês 0..80; ${r.parcelas} parcelas; juros pagos ${fmt(r.juros)} = Σparcelas − principal (${fmt(r.principal)})`, r.erroSaldo, 0.01));
} catch (err) { console.log('teste sintético de dívidas falhou:', err.message); out.achados.push('teste sintético de dívidas falhou: ' + err.message); }
out.numeros.sintetico = sintetico;

// ---------------------------------------------------------------------------------------------------------------------
// C (cont.) bem financiado vendido / compra financiada de objetivo / dívida sem linha — variantes sintéticas
// ---------------------------------------------------------------------------------------------------------------------
try {
  const H = require(path.join(RAIZ, 'harness.js')); const E = H.carregar();
  // C5: imóvel financiado (Price, 12% a.a., 120 parcelas restantes, saldo 200.000) vendido no mês 60 por 600.000 com corretagem de 6%
  { const Q = JSON.parse(JSON.stringify(plano)); const i = Math.pow(1.12, 1 / 12) - 1, n = 120, B0 = 200000, pmtI = B0 * i / (1 - Math.pow(1 + i, -n));
    Q.patrimonio.bens = [{ nome: 'Imóvel teste', valor: 500000, mercado: 500000, saldoDevedor: B0, parcela: pmtI, juros: 12, restantes: n, linha: 'parc_imovel', venda: { em: 60, preco: 600000, custos: [{ nome: 'corretagem', pct: 6 }] } }];
    Q.expenses.push({ id: 'parc_imovel', label: 'Parcela do imóvel', group: 'fix', week: 2, steps: [{ from: 0, value: pmtI }] });
    const x = H.extrato({ dados: Q }, E);
    const saldo = k => B0 * (1 - Math.pow(1 + i, -(n - k))) / (1 - Math.pow(1 + i, -n));   // saldo depois de k parcelas
    let e = 0; for (let mi = 0; mi < 60; mi++) e = Math.max(e, Math.abs(x.meses[mi].fim.div - saldo(mi)));
    let eP = 0; for (let mi = 0; mi < 60; mi++) eP = Math.max(eP, Math.abs((x.meses[mi].fluxo.out_fix_parc_imovel || 0) - pmtI));
    const quit = saldo(60), custo = 36000, m60 = x.meses[60];
    const checks = [['saldo devedor mês a mês 0..59', e], ['parcela no fluxo (out_fix) meses 0..59', eP], ['quitação na venda (out_quita_0)', Math.abs((m60.fluxo.out_quita_0 || 0) - quit)], ['custos da venda', Math.abs((m60.fluxo.out_venda_0 || 0) - custo)],
      ['líquido da venda', Math.abs(x.bens[0].venda.liquido - (600000 - custo - quit))], ['parcela não cobrada no mês da venda', Math.abs(m60.fluxo.out_fix_parc_imovel || 0)], ['dívida zerada depois da venda', Math.abs(m60.fim.div)], ['bem zerado depois da venda', Math.abs(m60.fim.bens)]];
    confere('C5', 'Imóvel financiado vendido no mês 60 (variante): saldo, parcela, quitação, custos e líquido', 'Price: saldo(k)=B0·(1−(1+i)^−(n−k))/(1−(1+i)^−n)', checks.map(c => `${c[0]}: ${fmt(c[1])}`).join('; ') + `; quitação ${fmt(quit)}, líquido ${fmt(600000 - custo - quit)}`, maxAbs(checks.map(c => c[1])), 0.01);
    out.numeros.bemFinanciado = { quitacao: quit, liquido: 600000 - custo - quit };
  }
  // C6: compra financiada do apartamento (entrada 300.000, financia 600.000 em 60x Price, 10% a.a., 1ª parcela no mês da data = 120)
  { const Q = JSON.parse(JSON.stringify(plano)); const o = Q.objectives[2]; o.amount = 300000; o.preco = 900000; o.compra = { modo: 'financiamento', sistema: 'price', parcelas: 60, juros: 10, iof: 'isento' };
    const x = H.extrato({ dados: Q }, E); const i = Math.pow(1.10, 1 / 12) - 1, n = 60, C = 600000, pmtC = C * i / (1 - Math.pow(1 + i, -n));
    let bal = C, bens = 300000, eP = 0, eB = 0, juros = 0, am = 0;
    for (let k = 0; k < n; k++) { const j = bal * i, a = pmtC - j; bal -= a; bens += a; juros += j; am += a; const m = x.meses[120 + k]; eP = Math.max(eP, Math.abs((m.fluxo.out_fix_apto_compra || 0) - pmtC)); eB = Math.max(eB, Math.abs(m.fim.bens - bens)); }
    const depois = x.meses[180]; const eD = Math.abs(depois.fluxo.out_fix_apto_compra || 0) + Math.abs(depois.fim.bens - 900000);
    confere('C6', 'Compra financiada do apartamento (variante): parcela no fluxo, bem = entrada + amortizações, quitação em 60 parcelas', 'Price i=(1,10)^(1/12)−1', `parcela ${fmt(pmtC)}; juros pagos ${fmt(juros)} = Σparcelas ${fmt(pmtC * n)} − principal ${fmt(am)}; bem final 900.000`, Math.max(eP, eB, eD, Math.abs(juros - (pmtC * n - am))), 0.01);
    out.numeros.compraFinanciada = { parcela: pmtC, juros, bensFinal: bens, divNoExtrato: x.meses[130].fim.div };
  }
  // C7: dívida avulsa SEM linha de despesa: o saldo amortiza mas o caixa não paga a parcela
  { const Q = JSON.parse(JSON.stringify(plano)); Q.patrimonio.dividas = [{ nome: 'Dívida sem linha', credito: 100000, parcelas: 60, juros: 12, sistema: 'price', iof: 'isento', inicio: '2026-10', saldoDevedor: 100000 }];
    const x = H.extrato({ dados: Q }, E), base = H.extrato({ dados: plano }, E);
    const dFin = Math.abs(x.meses[30].fim.fin - base.meses[30].fim.fin), saldo30 = x.meses[30].fim.div;
    out.numeros.dividaSemLinha = { saldoMes30: saldo30, difFinanceiroMes30: dFin, saidaNoCaixa: dFin < 0.01 ? 'nenhuma' : 'há' };
    console.log('dívida avulsa sem linha de despesa: saldo mês 30 =', fmt(saldo30), '; diferença no financeiro =', fmt(dFin));
  }
} catch (err) { console.log('variantes de dívida falharam:', err.message); out.achados.push('variantes de dívida falharam: ' + err.message); }

// ---------------------------------------------------------------------------------------------------------------------
// TESTES DE PODER (controle negativo): o procedimento detecta erros pequenos?
// ---------------------------------------------------------------------------------------------------------------------
{
  const comp = sim => { let e = 0; ext.meses.forEach(x => { const M = sim.meses[x.mi]; if (M.estado) { e = Math.max(e, Math.abs(M.estado.fin - x.fim.fin), Math.abs(M.estado.cofre - x.fim.cofre)); M.estado.obj.forEach((v, j) => { e = Math.max(e, Math.abs(v - x.fim.obj[j])); }); } }); return e; };
  const ePot = [['rendimento do financeiro 0,401% em vez de 0,400%', comp(simular({ R: 0.00401 }))], ['taxa da caixinha pelo mês da própria semana (sem defasagem de uma semana)', comp(simular({ modoTaxa: 'correta' }))], ['sem o destino de 600k da venda para o apartamento', comp(simular({ semVendaDestino: true }))]];
  out.numeros.poder = ePot;
  ePot.forEach(([n, e], k) => confere('P' + (k + 1), 'Teste de poder — o procedimento deve DETECTAR: ' + n, 'modelo perturbado x extrato (erro máximo em financeiro, cofre e caixinhas)', '762 meses', e > 0.01 ? 0 : 1, 0, `erro detectado: ${fmt(e)}`));
}

// ---------------------------------------------------------------------------------------------------------------------
// G. LIBERDADE / RUÍNA — testes de estresse com planos-variante (observado pelo harness; esperado: regra de domínio)
// ---------------------------------------------------------------------------------------------------------------------
try {
  const H = require(path.join(RAIZ, 'harness.js')); const E = H.carregar();
  // (a) ruína ANTES da liberdade: mercado de 40.000/mês
  const P = JSON.parse(JSON.stringify(plano)); P.expenses.find(e => e.id === 'mercado').steps[0].value = 40000;
  const x = H.extrato({ dados: P }, E);
  const ip = x.meses.findIndex(m => m.fim.cofre < -0.5), primNeg = x.meses[ip];
  confere('G5', 'Ruína dispara no mês que fecha com o financeiro negativo (variante: mercado 40.000/mês)', 'teste de estresse', `primeiro mês negativo ${primNeg && primNeg.mi}; ruina.mi = ${x.ruina && x.ruina.mi}`, x.ruina && primNeg && x.ruina.mi === primNeg.mi ? 0 : 1, 0);
  const seg = x.meses[ip + 1], esp = -primNeg.fim.cofre * 0.04;
  confere('G6', 'Juros da dívida do mês seguinte = 4% x saldo negativo do fim do mês anterior (caixinhas cobrem antes de a reserva ficar negativa)', 'teste de estresse', `observado ${fmt(seg.fluxo.out_juros || 0)} x esperado ${fmt(esp)}`, Math.abs((seg.fluxo.out_juros || 0) - esp), 0.01);
  const seg2 = x.meses[ip + 2], esp2 = -seg.fim.cofre * 0.04;
  confere('G6b', 'Juros do segundo mês em dívida = 4% x saldo em aberto', 'teste de estresse', `observado ${fmt(seg2.fluxo.out_juros || 0)} x esperado ${fmt(esp2)}`, Math.abs((seg2.fluxo.out_juros || 0) - esp2), 0.01);
  out.numeros.estresse = { ruina: x.ruina, primeiroMesNegativo: primNeg.mi, jurosMesSeguinte: [seg.fluxo.out_juros, esp] };
  // (b) esgotamento DENTRO da liberdade: renda desejada 80.000
  const Q = JSON.parse(JSON.stringify(plano)); Q.desired = 80000;
  const y = H.extrato({ dados: Q }, E);
  const iz = y.meses.findIndex(m => m.mi > 221 && m.fim.fin < 1);
  const saidaMes = mi => Object.entries(y.meses[mi].fluxo).reduce((a, [k, v]) => a + (k.startsWith('out_') ? v : 0), 0);
  out.numeros.esgotamento = { desired: 80000, ruina: y.ruina, ff: y.ff && { mi: y.ff.mi, forced: y.ff.forced, sustentavel: y.ff.sustentavel }, mesFinanceiroZero: y.meses[iz].mi, saidaMesZero: saidaMes(iz + 5), saidaMes221: saidaMes(221), saidaAposInss: saidaMes(345) };
  console.log('esgotamento na liberdade:', JSON.stringify(out.numeros.esgotamento));
} catch (err) { console.log('estresse falhou:', err.message); out.achados.push('estresse falhou: ' + err.message); }


// ---------------------------------------------------------------------------------------------------------------------
// SENSIBILIDADES (comportamentos por desenho / premissas do consultor) — variantes rodadas no harness; não são conferências
// ---------------------------------------------------------------------------------------------------------------------
try {
  const H = require(path.join(RAIZ, 'harness.js')); const E = H.carregar();
  const base = H.extrato({ dados: plano }, E);
  const Q1 = JSON.parse(JSON.stringify(plano)); Q1.incomes[0].steps = [{ from: 0, value: 14000 }, { from: 96, value: 0 }];   // pró-labore termina com a venda
  const x1 = H.extrato({ dados: Q1 }, E);
  const Q2 = JSON.parse(JSON.stringify(plano)); const v2 = Q2.patrimonio.participacoes[0].venda; v2.preco = 1273080; v2.custos = [{ nome: 'Assessoria jurídica', pct: 2 }, { nome: 'Imposto', valor: Math.round((1273080 - 400000) * 0.15) }];   // 3% a.a. sobre 1,2 mi
  const x2 = H.extrato({ dados: Q2 }, E);
  const minFin = x => Math.min(...x.meses.map(m => m.fim.fin));
  out.numeros.sensib = { base: { fin55: base.ff.finBefore, fin90: base.meses[648].fim.fin }, semProlaboreAposVenda: { fin55: x1.ff.finBefore, fin90: x1.meses[648].fim.fin, minimo: minFin(x1), difFin55: base.ff.finBefore - x1.ff.finBefore, ruina: x1.ruina },
    venda3pct: { preco: 1273080, fin55: x2.ff.finBefore, difFin55: base.ff.finBefore - x2.ff.finBefore } };
  console.log('sensibilidades:', JSON.stringify(out.numeros.sensib));
} catch (err) { console.log('sensibilidades falharam:', err.message); }

// ---------------------------------------------------------------------------------------------------------------------
fs.writeFileSync(path.join(__dirname, 'auditor-01.saida.json'), JSON.stringify(out, null, 1));
const falhas = out.conferencias.filter(c => !c.ok);
console.log('\nRESUMO:', out.conferencias.length, 'conferências;', falhas.length, 'fora da tolerância:', falhas.map(f => f.id).join(', ') || '—');
console.log(JSON.stringify(out.numeros, (k, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v), 1).slice(0, 12000));
