// Verificação do protótipo. Rode `node verificar.js` depois de qualquer mudança no motor.
// Não precisa de navegador: extrai o motor do HTML e roda a simulação em Node.
const fs = require('fs');
const vm = require('vm');

const CLIENTE = 'evolucao-patrimonial.html';
const PORTAL = 'tela-consultor.html';
let falhas = 0;

const ok = (nome, cond, detalhe) => {
  console.log((cond ? '  ok   ' : '  FALHA') + '  ' + nome + (detalhe ? '  ' + detalhe : ''));
  if (!cond) falhas++;
};
const bloco = arq => {
  const m = fs.readFileSync(arq, 'utf8').match(/<script id="engine">([\s\S]*?)<\/script>/);
  if (!m) { console.error('motor não encontrado em ' + arq); process.exit(2); }
  return m[1];
};
const carregar = src => {
  const ctx = { module: { exports: {} }, console };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return ctx.module.exports;
};

console.log('\n1. Motor sincronizado entre as duas telas');
const srcCliente = bloco(CLIENTE), srcPortal = bloco(PORTAL);
ok('o bloco do motor é idêntico nos dois arquivos', srcCliente === srcPortal,
  srcCliente === srcPortal ? '' : '→ rode: node sync-motor.js');

const E = carregar(srcCliente);

for (const modo of ['perp', 'cons']) {
  console.log('\n2. Simulação no modo ' + modo);
  const s = E.run(modo);

  // identidade contábil: movimentações = entradas − saídas, de hoje em diante
  let erro = 0;
  for (const b of s.buckets.month) {
    if (b.w1 <= E.W0) continue;
    let i = 0, o = 0, v = 0;
    for (const k in b.f) {
      if (k.startsWith('in_')) i += b.f[k];
      else if (k.startsWith('out_')) o += b.f[k];
      else if (k.startsWith('mov_')) v += b.f[k];
    }
    erro = Math.max(erro, Math.abs(i - o - v));
  }
  ok('movimentações = entradas − saídas em todos os meses', erro < 0.01, 'erro máximo ' + erro.toFixed(6));

  // nada de NaN nem patrimônio negativo
  let ruins = 0;
  for (let i = E.W0; i < E.NW; i += 7) {
    const w = s.weeks[i];
    if (!isFinite(w.fin) || !isFinite(w.bens) || !isFinite(w.part) || w.fin < -1) ruins++;
  }
  ok('sem valores inválidos ou patrimônio negativo', ruins === 0, ruins ? ruins + ' semanas com problema' : '');

  // um salário por mês enquanto há trabalho
  const mb = s.buckets.month, idx = mb.findIndex(b => b.w0 >= E.W0);
  const ffMes = s.ff ? mb.findIndex(b => b.w0 >= s.ff.week) : mb.length;
  let semSalario = 0;
  for (let k = idx; k < ffMes - 1; k++) {
    const sal = Object.entries(mb[k].f).filter(([c]) => c.startsWith('in_')).reduce((a, [, v]) => a + v, 0);
    if (sal <= 0) semSalario++;
  }
  ok('todo mês de trabalho tem entrada', semSalario === 0, semSalario ? semSalario + ' meses sem entrada' : '');

  // trimestres e anos com a mesma quantidade de meses
  const contaMeses = nivel => {
    const tam = new Set();
    s.buckets[nivel].filter(b => b.w0 > E.W0 && b.w1 < E.NW - 60).forEach(b => {
      let n = 0; for (const x of mb) if (x.mi >= b.mi && x.mi < b.mi + (nivel === 'quarter' ? 3 : 12)) n++;
      tam.add(n);
    });
    return [...tam];
  };
  const tq = contaMeses('quarter'), ty = contaMeses('year');
  ok('trimestres com 3 meses', tq.length === 1 && tq[0] === 3, 'tamanhos: ' + tq.join(','));
  ok('anos com 12 meses', ty.length === 1 && ty[0] === 12, 'tamanhos: ' + ty.join(','));

  // liberdade financeira
  ok('liberdade financeira acontece', !!s.ff, s.ff ? 'aos ' + s.ff.age.toFixed(1) + ' anos' + (s.ff.forced ? ' (sem sustentar a renda desejada)' : '') : '');
}

console.log('\n3. Objetivos');
E.OBJ.forEach(o => {
  const coerente = isFinite(o.required) && isFinite(o.projected) && ['ok', 'adj', 'risk'].includes(o.status);
  ok(o.name, coerente, 'necessário ' + Math.round(o.required) + ' / definido ' + o.planned + ' → ' + o.status);
});

console.log('\n4. Planos alternativos (não pode quebrar)');
const casos = [
  ['sem objetivos', { objectives: [{ id: 'z', name: 'Nada', icon: 'sun', kind: 'consumo', months: 1, amount: 0, recurring: null, dedicated: 0, profile: 'moderado', planned: 0, strategy: '' }] }],
  ['sem entradas', { incomes: [] }],
  ['despesas maiores que a renda', { expenses: [{ id: 'x', label: 'Tudo', group: 'fix', week: 1, frequency: 'mensal', steps: [{ from: 0, value: 40000 }] }] }],
  ['renda desejada altíssima', { desired: 500000 }],
  ['patrimônio inicial alto', { initialWealth: 5000000 }],
];
for (const [nome, plano] of casos) {
  const E2 = carregar(srcCliente);
  let passou = true, detalhe = '';
  try {
    E2.configure(plano);
    const s = E2.run('perp');
    let erro = 0;
    for (const b of s.buckets.month) {
      if (b.w1 <= E2.W0) continue;
      let i = 0, o = 0, v = 0;
      for (const k in b.f) {
        if (k.startsWith('in_')) i += b.f[k];
        else if (k.startsWith('out_')) o += b.f[k];
        else if (k.startsWith('mov_')) v += b.f[k];
      }
      erro = Math.max(erro, Math.abs(i - o - v));
    }
    passou = erro < 0.01 && isFinite(s.weeks[E2.NW - 1].fin);
    detalhe = 'liberdade aos ' + (s.ff ? s.ff.age.toFixed(0) : '—') + ' anos';
  } catch (e) { passou = false; detalhe = e.message; }
  ok(nome, passou, detalhe);
}

console.log('\n5. Periodicidades e regras do fluxo');
{
  const E3 = carregar(srcCliente);
  const oc = (it, mm, saida) => E3.ocorrencias(it, mm, saida).map(o => o.k + ':' + o.v).join(' ');
  const sal = { id: 's', label: 'Salário', kind: 'ativa', frequency: 'mensal', days: [5, 20], steps: [{ from: 0, value: 5000 }, { from: 13, value: 6000 }] };
  const k20 = mm => E3.semanaDoCiclo(mm, 20);
  ok('mensal nos dias 5 e 20: duas ocorrências por mês', oc(sal, 2) === '1:5000 ' + k20(2) + ':5000', oc(sal, 2));
  ok('mudança de valor em out/2027 (mês 13)', oc(sal, 12) === '1:5000 ' + k20(12) + ':5000' && oc(sal, 13) === '1:6000 ' + k20(13) + ':6000');
  const feira = { id: 'f', frequency: 'semanal', steps: [{ from: 0, value: 300 }] };
  let semOk = true; for (let mm = 0; mm < 24; mm++) semOk = semOk && E3.ocorrencias(feira, mm, true).length === E3.semanasNoCiclo(mm);
  ok('semanal cai em todas as semanas do mês (4 ou 5)', semOk);
  const ipva = { id: 'i', frequency: 'anual', dates: [{ m: 0, d: 5 }, { m: 1, d: 5 }, { m: 2, d: 5 }], steps: [{ from: 0, value: 1400 }] };
  const mesesIpva = []; for (let mm = 0; mm < 24; mm++) if (E3.valorEm(ipva, mm, true)) mesesIpva.push(E3.mesDoCiclo(mm));
  ok('anual em 5/jan, 5/fev e 5/mar', mesesIpva.join(',') === '0,1,2,0,1,2', 'meses ' + mesesIpva.join(','));
  ok('equivalente mensal do anual em três parcelas', Math.abs(E3.mensalizado(ipva, 0) - 350) < 0.01);
  const bonus = { id: 'b', frequency: 'pontual', days: [20], steps: [{ from: 10, value: 30000 }] };
  let nb = 0; for (let mm = 0; mm < 60; mm++) nb += E3.ocorrencias(bonus, mm).length;
  ok('pontual acontece uma única vez', nb === 1 && E3.valorEm(bonus, 10) === 30000);
  const net = { id: 'n', frequency: 'mensal', days: [12], steps: [{ from: 0, value: 55 }], exc: { 4: 0, '6:2': 80 } };
  ok('ajuste só nesta ocorrência', E3.valorEm(net, 4, true) === 0 && E3.valorEm(net, 6, true) === 80 && E3.valorEm(net, 7, true) === 55);
  const fim = { id: 'x', frequency: 'mensal', days: [10], steps: [{ from: 36, value: 2500 }, { from: 180, value: 0 }] };
  ok('linha que começa no futuro e termina numa data', E3.valorEm(fim, 35, true) === 0 && E3.valorEm(fim, 36, true) === 2500 && E3.valorEm(fim, 180, true) === 0);

  // o exemplo do consultor, simulado por inteiro
  E3.configure({
    incomes: [sal,
      { id: 'aluguelrec', label: 'Aluguel do imóvel', kind: 'passiva', frequency: 'mensal', days: [10], steps: [{ from: 0, value: 3000 }, { from: 13, value: 3400 }] },
      Object.assign({}, bonus, { label: 'Bônus', kind: 'ativa' }),
      { id: 'aulas', label: 'Aulas', kind: 'ativa', frequency: 'mensal', days: [5], steps: [{ from: 120, value: 4000 }] }],
    expenses: [Object.assign({}, feira, { label: 'Feira', group: 'adj' }), Object.assign({}, ipva, { label: 'IPVA', group: 'fix' }),
      Object.assign({}, net, { label: 'Netflix', group: 'fix' }), Object.assign({}, fim, { label: 'Escola', group: 'fix' }),
      { id: 'guia', label: 'Guia de imposto', group: 'fix', frequency: 'pontual', days: [20], steps: [{ from: 8, value: 15000 }] }],
  });
  const s = E3.run('perp');
  let erro = 0; const porMes = {};
  for (const b of s.buckets.month) {
    if (b.w1 <= E3.W0) continue;
    let i = 0, o = 0, v = 0;
    for (const k in b.f) { if (k.startsWith('in_')) i += b.f[k]; else if (k.startsWith('out_')) o += b.f[k]; else if (k.startsWith('mov_')) v += b.f[k]; }
    erro = Math.max(erro, Math.abs(i - o - v)); porMes[b.mi] = b.f;
  }
  ok('exemplo: movimentações = entradas − saídas', erro < 0.01, 'erro máximo ' + erro.toFixed(6));
  ok('exemplo: salário de 10 mil vira 12 mil em out/2027', porMes[12].in_s === 10000 && porMes[13].in_s === 12000);
  ok('exemplo: bônus e guia só no seu mês', porMes[10].in_b === 30000 && !porMes[11].in_b && porMes[8].out_fix_guia === 15000 && !porMes[9].out_fix_guia);
  ok('exemplo: aulas a partir de daqui a 10 anos', !porMes[119].in_aulas && porMes[120].in_aulas === 4000);
  // cada ocorrência cai na semana do calendário que contém a sua data
  const contem = (i, dias) => { for (let k = 0; k < 7; k++) if (dias.includes(new Date(E3.weekDate(i).getTime() + k * 864e5).getDate())) return true; return false; };
  let foraDaData = 0, vistas = 0;
  for (let i = E3.W0; i < s.ff.week; i++) {
    const f = s.weeks[i].f;
    if (f.in_s) { vistas++; if (!contem(i, [5, 20])) foraDaData++; }
    if (f.out_fix_n) { vistas++; if (!contem(i, [12])) foraDaData++; }
  }
  ok('cada ocorrência cai na semana que contém a sua data', vistas > 100 && foraDaData === 0, vistas + ' ocorrências, ' + foraDaData + ' fora da data');

  // aluguel pago termina quando a casa é comprada; renda ativa para na liberdade, a passiva continua
  const E4 = carregar(srcCliente); const s4 = E4.run('perp');
  const casa = E4.OBJ.find(o => o.id === 'casa').months, mes4 = {};
  s4.buckets.month.forEach(b => { if (b.w1 > E4.W0) mes4[b.mi] = b.f; });
  ok('aluguel é pago até a compra da casa e some depois', mes4[casa - 1].out_fix_moradia > 0 && !mes4[casa + 1].out_fix_moradia);
  const mff = s.buckets.month.find(b => b.w0 >= s.ff.week).mi + 2;
  ok('depois da liberdade, a renda ativa para e a passiva continua', !porMes[mff].in_s && !porMes[mff].in_aulas && porMes[mff].in_aluguelrec === 3400,
    'liberdade aos ' + s.ff.age.toFixed(1));

  // renda contratada em data fixa: não depende de quando a liberdade acontece
  const E6 = carregar(srcCliente); const inss = E6.PASSIVE.find(p => p.name === 'INSS');
  const inicioInss = sx => { const b = sx.buckets.month.find(b => b.w1 > E6.W0 && b.f['in_pas_' + E6.PASSIVE.indexOf(inss)]); return b && b.mi; };
  const a6 = inicioInss(E6.run('perp'));
  E6.configure({ desired: 40000 }); const s6 = E6.run('perp'), b6 = inicioInss(s6);
  ok('INSS em data fixa começa no mesmo mês mesmo com a liberdade mudando', a6 === inss.startMi && b6 === inss.startMi, 'mês ' + a6 + ' / ' + b6 + ', liberdade aos ' + s6.ff.age.toFixed(1));
  const E7 = carregar(srcCliente); E7.PASSIVE.find(p => p.name === 'INSS').startMi = 100;
  const s7 = E7.run('perp'), m7 = {}; s7.buckets.month.forEach(b => { if (b.w1 > E7.W0) m7[b.mi] = b.f; });
  const k7 = 'in_pas_' + E7.PASSIVE.findIndex(p => p.name === 'INSS');
  ok('renda de data fixa antes da liberdade já entra no fluxo', !m7[99][k7] && m7[100][k7] === 4200 && s7.ff.mi > 100);

  // casal: a liberdade começa quando o primeiro para; a renda ativa do outro continua até a idade dele e diminui o saque
  const Ec = carregar(srcCliente); Ec.configure({ tipo: 'familia', age: 35, retireAge: 57, spouseAge: 38, spouseRetireAge: 64 });
  const sc = Ec.run('desej'), ffc = sc.weeks[sc.ff.week].mi, pro = mi => { const b = sc.buckets.month.find(b => b.mi === mi && b.w1 > Ec.W0); return b ? b.f.in_prolabore || 0 : 0; };
  const fimPro = Math.round((64 - 38) * 12), salAna = mi => { const b = sc.buckets.month.find(b => b.mi === mi && b.w1 > Ec.W0); return b ? b.f.in_salario || 0 : 0; };
  ok('casal: a liberdade começa quando o primeiro para (Ana aos 57)', Math.abs(sc.ff.age - 57) < 0.1, 'aos ' + sc.ff.age.toFixed(2));
  ok('casal: o salário de quem parou some e o pró-labore do outro continua até os 64 dele', salAna(ffc + 1) === 0 && pro(ffc + 1) > 0 && pro(fimPro - 1) > 0 && pro(fimPro) === 0, 'pró-labore até o mês ' + (fimPro - 1));
  ok('casal: o saque desconta a renda de quem ainda trabalha', sc.weeks.find(w => w.mi === ffc + 1).saque < sc.weeks.find(w => w.mi === fimPro + 1).saque);
  const Ei = carregar(srcCliente); Ei.configure({ tipo: 'individual', age: 35, retireAge: 57, spouseAge: null }); const si = Ei.run('desej');
  ok('uma pessoa: a renda ativa toda para na liberdade', !si.buckets.month.some(b => b.mi > si.weeks[si.ff.week].mi && b.w1 > Ei.W0 && (b.f.in_prolabore || b.f.in_salario)));

  // data de nascimento: a idade de hoje é exata, e a idade num marco é a de verdade
  const En = carregar(srcCliente); En.configure({ nascimento: '1980-03-10', objectives: [] });
  const marcoN = Math.round((2040 - 2026) * 12 + (4 - 1) - 8);   // abr/2040, um mês depois do aniversário de 60 anos
  ok('nascimento: a idade de hoje sai da data (46 anos e meio em 19/09/2026)', Math.abs(En.CURRENT_AGE - 46.53) < 0.01, En.CURRENT_AGE.toFixed(3));
  ok('nascimento: em abr/2040 a pessoa já tem 60 anos', Math.floor(En.CURRENT_AGE + marcoN / 12) === 60);
  const pn = { nascimento: '1980-03-10', conjugeNascimento: '1982-11', tipo: 'familia', spouseAge: 1, age: 1 }; En.sincronizaIdades(pn);
  ok('nascimento: a idade do plano é calculada da data (sem o dia, o dia 1)', pn.age === 46 && pn.spouseAge === 43, pn.age + ' e ' + pn.spouseAge);
  const Ev = carregar(srcCliente); Ev.configure({ age: 48 }); ok('plano antigo, sem a data: vale a idade inteira', Ev.CURRENT_AGE === 48);

  // capítulo 1: a frase do propósito e os objetivos, com segurança e liberdade financeira sempre na lista
  const Ep = carregar(srcCliente), objsP = [{ id: 'b', name: 'Casa', months: 40, descricao: 'Sair do aluguel' }, { id: 'a', name: 'Viagem', months: 12 }];
  const lp = Ep.objetivosDoProposito({ objectives: objsP, desired: 30000 }, 260);
  ok('propósito: segurança primeiro, os objetivos pela data e a liberdade por último', lp.map(x => x.id).join() === 'seguranca,a,b,liberdade', lp.map(x => x.id).join());
  ok('propósito: a liberdade diz quando e quanto', /A partir de mai\/2048, conseguir uma renda passiva de R\$ 30\.000 por mês/.test(lp[3].descricao), lp[3].descricao);
  const lo = Ep.objetivosDoProposito({ objectives: objsP.concat({ id: 'c', name: 'Carro', months: 5 }), objetivosOrdem: ['liberdade', 'b', 'seguranca', 'a'] }, null);
  ok('propósito: vale a ordem declarada, e um objetivo novo entra antes da liberdade', lo.map(x => x.id).join() === 'c,liberdade,b,seguranca,a', lo.map(x => x.id).join());
  ok('propósito: no singular para uma pessoa, no plural para um casal, em três parágrafos', /vocês querem viver/.test(Ep.fraseDoProposito({ tipo: 'familia', spouseAge: 40 })) && /você quer viver/.test(Ep.fraseDoProposito({ tipo: 'individual' })) && /tornar estes objetivos realidade\.$/.test(Ep.fraseDoProposito({})) && Ep.fraseDoProposito({}).split('\n').length === 3);

  // capítulo 2: o diagnóstico, a família hoje e depois do planejamento
  const Ed = carregar(srcCliente), linha = (pl, id) => Ed.diagnosticoDaFamilia(pl).linhas.find(l => l.id === id);
  const fluxo = (e, sai) => ({ incomes: [{ id: 'r', frequency: 'mensal', steps: [{ from: 0, value: e }] }], expenses: [{ id: 'd', frequency: 'mensal', steps: [{ from: 0, value: sai }] }] });
  ok('diagnóstico: o orçamento sai do Fluxo de caixa (zero a zero com sobra ou falta de até 5% das entradas)',
    Ed.orcamentoDoFluxo(fluxo(10000, 9600)).estado === 'zero' && Ed.orcamentoDoFluxo(fluxo(10000, 10400)).estado === 'zero'
    && Ed.orcamentoDoFluxo(fluxo(10000, 9000)).estado === 'superavitario' && Ed.orcamentoDoFluxo(fluxo(10000, 11000)).estado === 'deficitario'
    && Ed.orcamentoDoFluxo({ incomes: [], expenses: [] }) === null);
  const resD = atual => linha({ riscos: { reserva: { natureza: 'CLT (empresa privada)', custoVida: 10000, atual } } }, 'reserva').presente;   // ideal R$ 50 mil
  ok('diagnóstico: a reserva nos quatro estados, pela mínima (40%), a aceitável (70%) e a ideal', [10000, 20000, 35000, 50000].map(resD).join() === 'abaixo,minima,aceitavel,ideal', [10000, 20000, 35000, 50000].map(resD).join());
  const objsD = { objectives: [{ id: 'a', diagnostico: { presente: 'sonho', futuro: 'caminho' } }, { id: 'b', diagnostico: { presente: 'meta', futuro: 'caminho' } }, { id: 'c' }] };
  ok('diagnóstico: os objetivos contam quantos estão definidos e quantos têm caminho', linha(objsD, 'definidos').presenteTxt === '1 de 3' && linha(objsD, 'definidos').futuroTxt === '2 de 3' && linha(objsD, 'caminho').presenteTxt === '0 de 3' && linha(objsD, 'caminho').futuroTxt === '2 de 3');
  ok('diagnóstico: sem nenhum degrau marcado, a linha fica vazia', linha({ objectives: [{ id: 'a' }] }, 'definidos').presente === null);
  ok('diagnóstico: o futuro e o presente sem conta são do consultor', linha({ diagnostico: { perfil: { presente: 'muito', futuro: 'adequado' } } }, 'perfil').presenteTxt === 'Muito desalinhado' && linha({ diagnostico: { protecao: { futuro: 90 } } }, 'protecao').futuroTxt === '90%');
  const conc = fin => Ed.concentracaoDoPatrimonio({ patrimonio: { financeiro: [{ valor: fin }], participacoes: [], bens: [{ mercado: 100 - fin }] } });
  ok('diagnóstico: o guia da concentração sugere preocupante com menos de 30% no financeiro', conc(29).sugestao === 'preocupante' && conc(30).sugestao === null && Math.abs(conc(29).pct.fin - 0.29) < 1e-9);

  const tomP = pr => linha({ diagnostico: { protecao: { futuro: pr } } }, 'protecao').futuroTom;
  ok('diagnóstico: o tom da proteção (em dia a partir de 80%, atenção a partir de 50%)', [90, 80, 79, 50, 49].map(tomP).join() === 'bom,bom,atencao,atencao,ruim');
  ok('diagnóstico: o tom dos objetivos pela fração no degrau', linha(objsD, 'definidos').presenteTom === 'atencao' && linha(objsD, 'caminho').presenteTom === 'ruim' && linha({ objectives: [{ id: 'a', diagnostico: { futuro: 'caminho' } }] }, 'caminho').futuroTom === 'bom');
  const plD = Ed.diagnosticoDaFamilia({ diagnostico: { perfil: { presente: 'adequado', futuro: 'adequado' }, liberdade: { presente: 'nao', futuro: 'sim' } } }).placar;
  ok('diagnóstico: o placar conta as linhas em dia entre as que têm valor', plD.futuro.emDia === 2 && plD.futuro.de === 2 && plD.presente.emDia === 1, JSON.stringify(plD));

  // quem é a família: a natureza do trabalho de cada pessoa, a da reserva, as instituições e as classes de ativos
  const renda = (pessoa, v) => ({ id: pessoa, kind: 'ativa', pessoa, frequency: 'mensal', steps: [{ from: 0, value: v }] });
  const casalN = { tipo: 'familia', spouseAge: 40, natureza: 'CLT (empresa privada)', conjugeNatureza: 'Empresário', incomes: [renda('titular', 8000), renda('conjuge', 12000)] };
  ok('natureza: a reserva usa a de quem tem a maior renda do trabalho', Ed.naturezaDaReserva(casalN).natureza === 'Empresário' && Ed.avaliaRiscos(casalN).itens.reserva.t === 7);
  ok('natureza: sem a natureza de quem ganha mais, vale a de quem a tem', Ed.naturezaDaReserva(Object.assign({}, casalN, { conjugeNatureza: '' })).quem === 'titular');
  ok('natureza: num plano antigo, a da reserva é a do titular', Ed.naturezaDe({ riscos: { reserva: { natureza: 'Aposentado' } } }, 'titular') === 'Aposentado');
  const famD = Ed.familiaDoPlano({ tipo: 'familia', spouseAge: 40, riscos: { dependentes: [{ nome: 'Bia', nasc: '2020-01' }] }, patrimonio: {
    financeiro: [{ nome: 'Nubank', valor: 1, titularidade: 'titular' }, { nome: 'Itaú', valor: 2 }, { nome: 'XP', valor: 3, titularidade: 'conjuge' }, { nome: 'Nubank', valor: 4, titularidade: 'titular' }],
    contas: { titular: ['Caixa', 'Nubank'], casal: ['Inter'] } } });
  const [anaD, marD] = famD.pessoas, txtI = l => l.map(x => x.nome + (x.conjunta ? '*' : '')).join();
  ok('família: cada pessoa com as instituições dela; a do casal (ou sem titularidade) nas duas, como conjunta', txtI(anaD.investe) === 'Nubank,Itaú*' && txtI(marD.investe) === 'XP,Itaú*', txtI(anaD.investe) + ' | ' + txtI(marD.investe));
  ok('família: a conta só onde a pessoa não investe, e a conjunta nas duas', txtI(anaD.conta) === 'Caixa,Inter*' && txtI(marD.conta) === 'Inter*', txtI(anaD.conta) + ' | ' + txtI(marD.conta));
  ok('família: uma pessoa só não tem nada conjunto', Ed.familiaDoPlano({ tipo: 'individual', patrimonio: { financeiro: [{ nome: 'Itaú', valor: 1 }], contas: { casal: ['Inter'] } } }).pessoas[0].conta.every(x => !x.conjunta));
  ok('família: os dependentes com a idade, e as duas pessoas do casal', famD.dependentes[0].idade === 6 && famD.pessoas.length === 2, famD.dependentes[0].idade);
  const expD = Ed.familiaDoPlano({ tipo: 'familia', spouseAge: 40, experiencia: { conjuge: { ouro: { restricao: true } } } }).classes;
  ok('família: a experiência é de cada pessoa, e sem nenhuma marca a tabela some', famD.classes === null && expD.find(c => c.id === 'ouro').pessoas.map(p => p.restricao).join() === 'false,true');

  // gestão financeira: renda, custo de vida e futuro pelo Fluxo de caixa; as horas de trabalho; o orçamento combinado
  const Eg = carregar(srcCliente), lin = (id, pessoa, v, extra) => Object.assign({ id, pessoa, kind: 'ativa', frequency: 'mensal', steps: [{ from: 0, value: v }] }, extra || {});
  const planoG = { tipo: 'familia', spouseAge: 40, horas: 160, conjugeHoras: 200, incomes: [lin('a', 'titular', 8000), lin('b', 'conjuge', 4000)],
    expenses: [{ id: 'f1', group: 'fix', label: 'Aluguel', steps: [{ from: 0, value: 5000 }] }, { id: 'a1', group: 'adj', label: 'Mercado', steps: [{ from: 0, value: 4000 }] }, { id: 'f2', group: 'fix', label: 'IPTU', frequency: 'anual', steps: [{ from: 0, value: 1200 }] }] };
  const gG = Eg.gestaoFinanceira(planoG);
  ok('gestão: renda, custo de vida e futuro no mês e no ano, pela média de 12 meses (o IPTU anual entra como R$ 100 por mês)', gG.mes.renda === 12000 && Math.round(gG.mes.custo) === 9100 && Math.round(gG.ano.futuro) === 34800, JSON.stringify(gG.mes));
  ok('gestão: as fixas são o grupo fix; o recomendado é 50/30/20 da renda', Math.round(gG.grupos.fixas) === 5100 && gG.grupos.ajustaveis === 4000 && gG.ideal.fixas === 6000 && gG.ideal.futuro === 2400);
  ok('gestão: sem os três envelopes gravados, não há orçamento combinado', gG.envelopes === null && Eg.gestaoFinanceira(Object.assign({}, planoG, { orcamento: { envelopes: { fixas: 6000, ajustaveis: 3500, futuro: 2500 } } })).envelopes.futuro === 2500);
  const hG = Eg.horasDoTrabalho(planoG), [aG, bG] = hG.pessoas;
  ok('tempo: o valor da hora é a renda do trabalho pelas horas', aG.valorHora === 50 && bG.valorHora === 20 && hG.familia.valorHora === 12000 / 360);
  ok('tempo: as horas se dividem na proporção do orçamento, e o futuro é o resto', Math.abs(aG.presente - 160 * 9100 / 12000) < 1e-9 && Math.abs(aG.presente + aG.futuro - 160) < 1e-9);
  ok('tempo: sem as horas de alguém, a família soma só quem informou', Eg.horasDoTrabalho(Object.assign({}, planoG, { conjugeHoras: null })).familia === null);

  // semanal: o mês do motor tem semanas inteiras, e cada semana tem exatamente um sábado
  const feiraSab = { id: 'fs', frequency: 'semanal', weekday: 6, steps: [{ from: 0, value: 150 }] };
  let sabOk = true, totalSab = 0;
  for (let mm = 0; mm < 120; mm++) { const n = E3.ocorrencias(feiraSab, mm, true).length; totalSab += n; if (n !== E3.semanasNoCiclo(mm)) sabOk = false; }
  ok('semanal: uma vez por semana, sem perder nem repetir semanas', sabOk && Math.abs(totalSab - 120 * 365.25 / 7 / 12) < 2, totalSab + ' sábados em 10 anos');
  ok('anual sem datas escolhidas não lança nada', E3.valorEm({ id: 'a0', frequency: 'anual', dates: [], steps: [{ from: 0, value: 999 }] }, 0, true) === 0);

  // aporte definido igual ao necessário: o objetivo fica alcançável na simulação
  const E10 = carregar(srcCliente);
  E10.configure({ objectives: [{ id: 'v', name: 'Viagem', icon: 'plane', kind: 'consumo', months: 24, amount: 20000, recurring: null, dedicated: 0, profile: 'moderado', planned: 0, strategy: '' }] });
  const ov = E10.OBJ[0]; ov.planned = Math.ceil(ov.required); E10.derive(ov);
  const s10 = E10.run('perp'), ev10 = s10.events.find(e => e.type === 'obj'), real10 = s10.weeks[ev10.week - 1].obj[0];
  ok('aporte igual ao necessário deixa o objetivo alcançável', real10 / ov.amount >= 0.98, Math.round(real10) + ' de ' + ov.amount);

  // idade de hoje, idade-alvo de aposentadoria, bens de hoje e plano vazio
  const E8 = carregar(srcCliente); E8.configure({ age: 48, retireAge: 60, initialBens: 900000, objectives: [] });
  const s8 = E8.run('perp');
  ok('cliente de 48 anos: hoje fica aos 48', E8.W0 === Math.round(48 * E8.WPY) && Math.abs(E8.ageOf(E8.W0) - 48) < 0.01);
  ok('idade-alvo: a liberdade acontece aos 60', s8.ff && Math.floor(s8.ff.age) === 60, s8.ff ? 'aos ' + s8.ff.age.toFixed(2) + (s8.ff.forced ? ' (sem sustentar)' : '') : '');
  ok('imóveis e bens de hoje entram no patrimônio', Math.abs(s8.weeks[E8.W0].bens - 900000) < 1);
  ok('plano sem objetivos roda', E8.OBJ.length === 0 && isFinite(s8.weeks[E8.NW - 1].fin));
  let hist = 0; for (let i = 0; i < E8.W0 - 6; i++) hist += Object.keys(s8.weeks[i].f).length;
  ok('nada é lançado antes de hoje', hist === 0);
  const E9 = carregar(srcCliente); E9.configure({ incomes: [], expenses: [], objectives: [], passive: [], desired: 0, initialWealth: 0 });
  const s9 = E9.run('perp');
  ok('plano totalmente vazio roda', isFinite(s9.weeks[E9.NW - 1].fin));

  // plano antigo, com o aluguel num campo solto
  const E5 = carregar(srcCliente); const antigo = { rent: 2000, expenses: [{ id: 'm', label: 'Mercado', group: 'adj', week: 0, steps: [{ from: 0, value: 1000 }] }] };
  E5.configure(antigo);
  const mo = antigo.expenses.find(e => e.id === 'moradia');
  ok('plano antigo: aluguel vira linha de despesa fixa', !!mo && mo.steps[0].value === 2000 && mo.endObj === 'casa' && antigo.rent === undefined);
}

console.log('\n6. Financiamento de bens (Price e SAC)');
{
  const EF = carregar(srcCliente);
  const price = { system: 'price', principal: 300000, rateYear: 0.1, months: 120 }, sac = Object.assign({}, price, { system: 'sac' });
  const cp = EF.cronogramaFin(price), cs = EF.cronogramaFin(sac);
  const soma = (c, k) => c.reduce((a, p) => a + p[k], 0);
  ok('Price: a amortização soma o valor financiado', Math.abs(soma(cp, 'amort') - 300000) < 0.01 && cp.length === 120 && cp[119].saldo < 0.01);
  ok('Price: parcela constante, juros caem e amortização sobe', Math.abs(cp[0].pay - cp[119].pay) < 0.01 && cp[0].juros > cp[119].juros && cp[0].amort < cp[119].amort, 'parcela ' + Math.round(cp[0].pay));
  ok('SAC: amortização constante e parcela cai', Math.abs(cs[0].amort - cs[119].amort) < 0.01 && cs[0].pay > cs[119].pay && Math.abs(soma(cs, 'amort') - 300000) < 0.01);
  ok('SAC paga menos juros no total que a Price', soma(cs, 'juros') < soma(cp, 'juros'), Math.round(soma(cs, 'juros')) + ' contra ' + Math.round(soma(cp, 'juros')));
  ok('juros zero: parcelas iguais ao principal ÷ prazo', Math.abs(EF.cronogramaFin({ system: 'price', principal: 12000, rateYear: 0, months: 12 })[0].pay - 1000) < 0.01);
  for (const [nome, fin] of [['Price', price], ['SAC', sac]]) {
    const E4 = carregar(srcCliente);
    E4.configure({ objectives: [{ id: 'c', name: 'Casa', icon: 'home', kind: 'bem', months: 24, amount: 100000, recurring: null, financing: fin, dedicated: 0, profile: 'moderado', planned: 3000, strategy: '' }] });
    const s4 = E4.run('perp');
    let erro = 0, juros = 0;
    for (const b of s4.buckets.month) {
      if (b.w1 <= E4.W0) continue;
      let i = 0, o = 0, v = 0;
      for (const k in b.f) { if (k.startsWith('in_')) i += b.f[k]; else if (k.startsWith('out_')) o += b.f[k]; else if (k.startsWith('mov_')) v += b.f[k]; }
      erro = Math.max(erro, Math.abs(i - o - v)); juros += b.f['out_fix_c_k2'] || 0;   // o financiamento antigo vira o custo k2 da lista
    }
    const total = fin === price ? soma(cp, 'juros') : soma(cs, 'juros');
    ok('financiamento ' + nome + ' na simulação: identidade contábil e juros iguais ao cronograma', erro < 0.01 && Math.abs(juros - total) < 1, 'juros ' + Math.round(juros) + ' de ' + Math.round(total));
  }
}

console.log('\n7. Custos depois de realizado (lista)');
{
  const E7 = carregar(srcCliente);
  const velho = { id: 'v', name: 'Casa', icon: 'home', kind: 'bem', months: 12, amount: 30000, dedicated: 0, profile: 'moderado', planned: 5000, strategy: '',
    recurring: { value: 900, months: null, label: 'Condomínio', amort: 0 }, financing: { system: 'sac', principal: 200000, rateYear: 0.1, months: 240 } };
  E7.configure({ objectives: [velho] });
  ok('plano antigo: custo fixo e financiamento viram itens da lista', velho.costs.length === 2 && velho.costs[0].type === 'fixo' && velho.costs[1].type === 'sac' && !('recurring' in velho) && !('financing' in velho));
  const sc = E7.serieCusto(velho.costs[1], 241), sf = E7.serieCusto({ type: 'fixo', value: 900, months: 24 }, 30);
  ok('série do SAC cai e termina no prazo', sc[0] > sc[239] && sc[239] > 0 && sc[240] === 0);
  ok('série do custo fixo com prazo termina no prazo', sf[23] === 900 && sf[24] === 0);
  const s7 = E7.run('perp');
  let erro = 0, fixo = 0;
  for (const b of s7.buckets.month) {
    if (b.w1 <= E7.W0) continue;
    let i = 0, o = 0, v = 0;
    for (const k in b.f) { if (k.startsWith('in_')) i += b.f[k]; else if (k.startsWith('out_')) o += b.f[k]; else if (k.startsWith('mov_')) v += b.f[k]; }
    erro = Math.max(erro, Math.abs(i - o - v)); fixo += b.f['out_fix_v_k1'] || 0;
  }
  ok('fixo e SAC juntos: identidade contábil', erro < 0.01 && fixo > 0, 'condomínio lançado: ' + Math.round(fixo));
  // bem que não chega a 70% do valor na data: não é comprado, e os gastos depois dele não entram
  const EN = carregar(srcCliente);
  const caro = { id: 'p', name: 'Casa de praia', icon: 'palm', kind: 'bem', months: 24, amount: 5000000, dedicated: 0, profile: 'moderado', planned: 1000, strategy: '', costs: [{ id: 'k1', type: 'fixo', value: 2000, months: null, label: 'Condomínio' }] };
  EN.configure({ objectives: [caro] });
  const sn = EN.run('perp'); let cond = 0, errN = 0;
  for (const b of sn.buckets.month) { if (b.w1 <= EN.W0) continue; let i = 0, o = 0, v = 0; for (const k in b.f) { if (k.startsWith('in_')) i += b.f[k]; else if (k.startsWith('out_')) o += b.f[k]; else if (k.startsWith('mov_')) v += b.f[k]; } errN = Math.max(errN, Math.abs(i - o - v)); cond += b.f['out_fix_p_k1'] || 0; }
  ok('bem abaixo de 70% do valor não é comprado nem gera gastos depois', caro.naoComprado && Math.max(...sn.weeks.map(w => w.bens)) === 0 && cond === 0 && errN < 0.01);
}

console.log('\n8. Saque na liberdade financeira: perpetuidade, consumo ou renda desejada');
{
  const Ed = carregar(srcCliente), fimI = Math.round(94 * Ed.WPY);
  const sp = Ed.run('perp'), sd = Ed.run('desej');
  // saque = renda desejada − rendas que entram: num ano depois da liberdade, o gasto médio (com a amortização,
  // que vira bem) é a renda desejada; mês a mês ele varia com as despesas semanais (4 ou 5 por mês)
  const ano = sd.buckets.month.filter(x => x.w0 > sd.ff.week + 60).slice(0, 12);
  let gasto = 0; ano.forEach(b => { for (const k in b.f) { if (k.startsWith('out_')) gasto += b.f[k]; if (k === 'mov_bens' && b.f[k] > 0) gasto += b.f[k]; } });
  const desejo = Ed.config().desired;
  ok('renda desejada: o gasto médio do ano é a renda desejada', Math.abs(gasto / 12 - desejo) < 1, Math.round(gasto / 12) + ' de ' + desejo);
  ok('renda desejada menor que o rendimento: o patrimônio cresce mais que na perpetuidade', sd.weeks[fimI].fin > sp.weeks[fimI].fin);
  const Ea = carregar(srcCliente); Ea.configure({ desired: 60000, retireAge: 60 });
  const sa = Ea.run('desej'); let acaba = null; for (let i = sa.ff.week + 1; i < Ea.NW; i++) if (sa.weeks[i].fin < 1) { acaba = i; break; }
  ok('renda desejada alta: o patrimônio acaba antes da expectativa de vida', acaba != null && Ea.ageOf(acaba) < 95, acaba ? 'acaba aos ' + Math.floor(Ea.ageOf(acaba)) : '');
}

console.log('\n9. Seguro de vida e de acidentes pessoais (calculadora da Nord)');
{
  const Es = carregar(srcCliente);
  // caso conferido no site da Nord: 40 anos, renda 10 mil, filho de 5 anos, financeiro 200 mil, bens 500 mil → R$ 1.410.933,03
  const um = g => ({ age: 40, initialWealth: 200000, initialBens: 500000, partValue: 0, incomes: [], riscos: { dependentes: [{ relacao: 'filho', nasc: '2021-09' }],
    seguro: { renda: 10000, passiva: 0, geradores: [Object.assign({ pessoa: 'titular', participacao: 100, patrimonioPct: 100, inssInvalidez: 3000, inssMorte: 0 }, g)] } } });
  const p = Es.calculaSeguros(um({})).pessoas[0];
  ok('vida: a mesma necessidade da calculadora da Nord', Math.abs(p.vida.necessidade - 1410933.03) < 0.01, p.vida.necessidade.toFixed(2));
  ok('acidentes: até os 95 anos, G − E', p.acidentes.F === 660 && Math.abs(p.acidentes.necessidade - (7000 * (1 - Math.pow(1.004, -660)) / 0.004 - 200000)) < 0.01);
  const sem = um({}); sem.riscos.dependentes = [];
  ok('sem dependentes: o seguro de vida não é essencial e a reserva perde o d', Es.calculaSeguros(sem).pessoas[0].vida.status === 'ok' && Es.avaliaRiscos(sem).itens.reserva.d === 0);
  ok('cobertura parcial: atenção; nenhuma: crítico', Es.avaliaRiscos(um({ coberturaVida: 500000 })).itens.familia.status === 'atencao' && Es.avaliaRiscos(um({})).itens.familia.status === 'critico');
  ok('plano sem o cálculo de seguro: não avaliado', Es.avaliaRiscos({ riscos: {} }).itens.renda.status === 'pendente');
}

console.log('\n10. Patrimônio de hoje e fase da vida financeira');
{
  const Ef = carregar(srcCliente), P = () => JSON.parse(JSON.stringify(Ef.PATRIMONIO_EXEMPLO));
  const pl = { age: 35, retireAge: 65, riscos: { reserva: { custoVida: 10000 } }, patrimonio: P() };
  Ef.sincronizaPatrimonio(pl);
  ok('as listas viram os totais do plano', pl.initialWealth === 860000 && pl.partValue === 50000 && pl.initialBens === 1210000);
  const f = Ef.faseDaVida(pl);
  ok('total = financeiro + participações + bens − saldo devedor', f.total === 860000 + 50000 + 1210000 - 368000, f.total);
  // começou aos 23, para aos 65: marcos em 23 / 32,3 / 51 / 65; aos 35, 14% da Consolidação (18× a 60×)
  ok('marcos das fases em 2/9 e 6/9 da vida de trabalho', Math.abs(f.fases[2].de - (23 + 42 * 2 / 9)) < 1e-9 && f.fases[3].de === 51 && f.fases[4].de === 65);
  ok('aos 35: Consolidação, esperado interpolado', f.fase === 2 && f.minimo === 180000 && f.maximo === 600000 && Math.abs(f.esperado - 10000 * (18 + 42 * (35 - 23 - 28 / 3) / (28 - 28 / 3))) < 0.01, Math.round(f.esperado));
  ok('antes de começar: Preparação, esperado zero', Ef.faseDaVida(Object.assign({}, pl, { age: 20 })).esperado === 0);
  ok('depois da idade alvo: Liberdade, 200×', Ef.faseDaVida(Object.assign({}, pl, { age: 70 })).esperado === 2000000);
  ok('dívida avulsa também desconta do total', Ef.faseDaVida(Object.assign({}, pl, { patrimonio: Object.assign(P(), { dividas: [{ nome: 'Consignado', saldoDevedor: 20000 }] }) })).total === f.total - 20000);
  ok('sem a idade em que começou: sem fase', Ef.faseDaVida({ age: 35, patrimonio: {} }).fase === null);
  const alt = Ef.aplicaAlteracoes(Object.assign({}, pl, { patrimonio: P() }), [{ tipo: 'campo', caminho: 'patrimonio.financeiro.2.valor', para: 700000 }]);
  ok('proposta num valor do detalhe atualiza o total', alt.initialWealth === 860000 - P().financeiro[2].valor + 700000, alt.initialWealth);
}

console.log('\n11. Otimização tributária (regras de 2026)');
{
  const Et = carregar(srcCliente), ir = Et.calculaIR;
  ok('até R$ 60 mil por ano o imposto zera (redução da Lei 15.270)', ir({ rend: 60000 }).devido === 0 && ir({ rend: 59000, inss: 6000 }).devido === 0);
  // 70 mil, simplificada: base 56 mil → 27,5% − 10.904,76 = 4.495,24; redução 8.429,73 − 0,095575 × 70 mil = 1.739,48
  ok('entre R$ 60 mil e R$ 88.200 a redução cai em linha reta', Math.abs(ir({ rend: 70000 }).devido - (56000 * 0.275 - 10904.76 - (8429.73 - 0.095575 * 70000))) < 0.01, ir({ rend: 70000 }).devido.toFixed(2));
  ok('desconto simplificado limitado a R$ 17.640', ir({ rend: 200000 }).desconto === 17640 && ir({ rend: 50000 }).desconto === 10000);
  const pg = ir({ rend: 200000, inss: 12000, pgbl: 50000 });
  ok('PGBL deduz até 12% da renda tributável, e só com INSS', pg.ded.pgbl === 24000 && pg.sobraPgbl === 26000 && ir({ rend: 200000, pgbl: 50000 }).ded.pgbl === 0);
  ok('fica com a declaração de menor imposto', pg.modelo === 'completa' && ir({ rend: 200000, inss: 12000 }).modelo === 'simplificada' && pg.devido === Math.min(pg.completa, pg.simplificada));
  const copia = o => JSON.parse(JSON.stringify(o));
  const plan = Object.assign({ name: 'Ana Ribeiro', age: 35 }, Et.FAMILIA_EXEMPLO, copia(Et.config()), { tributario: copia(Et.TRIBUTARIO_EXEMPLO), riscos: { dependentes: [{ nome: 'Luiza' }] }, patrimonio: copia(Et.PATRIMONIO_EXEMPLO) });
  const f = Et.irDaFamilia(plan);
  ok('os dependentes da página Cliente vão para quem os declara', f.nDeps === 1 && f.atual.pessoas[1].deps === 1 && f.recomendada.pessoas[0].deps === 1 && f.recomendada.pessoas[1].deps === 0);
  ok('economia = imposto atual − imposto recomendado', Math.abs(f.economia - (f.atual.total - f.recomendada.total)) < 1e-9 && f.economia > 0, Math.round(f.economia));
  // uma variável num lugar só: o que o fluxo de caixa já tem não é pedido de novo
  ok('nomes do casal vêm da página Cliente', f.atual.pessoas.map(p => p.nome).join() === 'Ana,Marcos' && Et.nomesDaFamilia({ name: 'Camila e Rafael Souza' }).conjuge === 'Rafael');
  ok('renda tributável e INSS vêm do fluxo: bruto × recebimentos em 12 meses', f.atual.pessoas[0].doFluxo && f.atual.pessoas[0].rend === 12 * 11700 && Math.abs(f.atual.pessoas[1].inss - 12 * 7800 * 0.11) < 1e-6);
  ok('renda isenta (lucros, PLR) fica de fora dos rendimentos tributáveis', !Et.rendaDaPessoa(plan, 'titular').linhas.includes('Bônus anual'));
  const solteira = Object.assign({}, plan, { tipo: 'individual' }), so = Et.irDaFamilia(solteira);
  ok('plano de uma pessoa: só o titular declara', so.atual.pessoas.length === 1);
  const semFluxo = Object.assign({}, plan, { incomes: [] }); semFluxo.tributario.ir.pessoas[0].rend = 50000;
  ok('sem linhas no fluxo, vale o digitado', !Et.irDaFamilia(semFluxo).atual.pessoas[0].doFluxo && Et.irDaFamilia(semFluxo).atual.pessoas[0].rend === 50000);
  const so2 = Et.retiradaDosSocios(plan).socios[0];
  ok('sócio: pró-labore e dividendos de hoje vêm das linhas do fluxo', so2.doFluxo && so2.atual.pro === 7800 && so2.atual.div === 0 && so2.nome === 'Marcos');
  const br = Et.bensDoRisco(plan);
  ok('bens da gestão de riscos são os do patrimônio, com a proteção no próprio bem', br.length === 3 && br[2].protecao === 'insuficiente' && br[0].valor === 160000);
  const antigo = Object.assign({}, plan, { patrimonio: { bens: [{ nome: 'Carro', mercado: 50000 }] }, riscos: { bens: { itens: [{ nome: 'carro', valor: 40000, protecao: 'total' }] } } });
  ok('plano antigo: a proteção da lista dos riscos passa para o bem de mesmo nome', Et.bensDoRisco(antigo)[0].protecao === 'total' && Et.bensDoRisco(antigo)[0].valor === 50000);
  const sa = Et.avaliaRiscos(Object.assign({}, plan, { riscos: copia(Et.RISCOS_EXEMPLO) })).itens.saude;
  ok('plano de saúde: o que a empresa paga não sai do bolso (exemplo: R$ 1.500 no fluxo)', sa.total === 2650 && sa.terceiros === 1150 && sa.doBolso === 1500
    && Et.config().expenses.find(e => e.id === 'saude').steps[0].value === sa.doBolso);
  const seg = Et.calculaSeguros(Object.assign({}, plan, { riscos: copia(Et.RISCOS_EXEMPLO) }));
  ok('seguros: a idade do titular e do cônjuge é a da página Cliente', seg.pessoas[0].idade === 35 && seg.pessoas[1].idade === 38);
  const tb = b => Et.titularidadeDoBem(plan, b);
  ok('titularidade: de uma pessoa ou do casal (metade, sem informar)', tb({ titularidade: 'conjuge' }).texto === 'de Marcos' && tb({ titularidade: 'casal' }).titular === 0.5
    && tb({ titularidade: 'casal', titularPct: 70 }).texto === 'do casal (70% de Ana)' && tb({}) === null);
  const r = Et.calculaRetirada(7000, 3000, 'presumido');
  ok('pró-labore: INSS de 11% e 20% patronal fora do Simples', r.inss === 770 && Math.abs(r.patronal - 1400) < 1e-9 && Et.calculaRetirada(7000, 0, 'simples').patronal === 0);
  ok('pró-labore: INSS limitado ao teto', Math.abs(Et.calculaRetirada(20000, 0, 'simples').inss - 8475.55 * 0.11) < 1e-9);
  ok('dividendos: isentos até R$ 50 mil no mês, 10% do total acima', Et.calculaRetirada(0, 50000).divIR === 0 && Et.calculaRetirada(0, 60000).divIR === 6000);
  ok('imposto mínimo acima de R$ 600 mil no ano', Et.calculaRetirada(0, 50000).minimo === 0 && Math.abs(Et.calculaRetirada(5000, 50000).minimo - 0.01 * 660000) < 0.01);
  const su = Et.sucessao(plan);
  ok('sucessão: a previdência fica fora do inventário', su.atual.prev === 120000 && su.atual.inventario === su.atual.total - su.atual.prev && Math.abs(su.economia - 300000 * 0.12) < 1e-6);
  ok('sucessão: o total não muda com a recomendação', su.atual.total === su.recomendada.total);
  const p = Et.simulaPrevidencia(plan.tributario.previdencia), soma = p.passos.reduce((a, x) => a + x[1], 0);
  ok('previdência: a escada soma do investimento comum à previdência', Math.abs(p.comum.final + soma - p.prev.final) < 0.01);
  ok('previdência: tabela regressiva de 35% a 10%', Et.aliqRegressiva(1) === 0.35 && Et.aliqRegressiva(10) === 0.15 && Et.aliqRegressiva(10.1) === 0.10);
  const sem = Et.simulaPrevidencia({ inicial: 100000, aporte: 0, anos: 10, rent: 0, trocas: 3 });
  ok('previdência: sem rendimento, sem imposto', Math.abs(sem.comum.final - 100000) < 0.01 && Math.abs(sem.prev.final - 100000) < 0.01);
}

console.log('\n12. Bens ao longo do tempo: valorização e venda');
{
  const Eb = carregar(srcCliente);
  const ap = { nome: 'Apartamento', mercado: 950000, saldoDevedor: 368000, parcela: 4870, juros: 9.5, linha: 'parc', renda: 'alug',
    valorizacao: [{ tipo: 'taxa', pct: 2, de: 0, anos: 10 }, { tipo: 'pontual', em: 24, valor: 100000, motivo: 'reforma' }],
    venda: { em: 60, preco: null, custos: [{ nome: 'Corretagem', pct: 6 }, { nome: 'Imposto sobre o ganho', valor: 20000 }] } };
  const alug = { id: 'alug', label: 'Aluguel do apartamento', kind: 'passiva', frequency: 'mensal', days: [10], steps: [{ from: 0, value: 3000 }] };
  Eb.configure({ patrimonio: { bens: [ap, { nome: 'Terreno', mercado: 100000 }] }, initialBens: 1050000, objectives: [], passive: [],
    incomes: [{ id: 'sal', label: 'Salário', kind: 'ativa', frequency: 'mensal', days: [5], steps: [{ from: 0, value: 20000 }] },
      alug],
    expenses: [{ id: 'parc', label: 'Parcela: Apartamento', group: 'fix', frequency: 'mensal', days: [10], steps: [{ from: 0, value: 4870 }] },
      { id: 'vida', label: 'Vida', group: 'adj', frequency: 'mensal', days: [10], steps: [{ from: 0, value: 8000 }] }] });
  const tr = Eb.trajetoriaDoBem(ap), esperado = (950000 * Math.pow(1.02, 2) + 100000) * Math.pow(1.02, 3);
  ok('valor projetado: 2% ao ano mais a reforma de R$ 100 mil', Math.abs(tr.venda.projetado - esperado) < 1, Math.round(tr.venda.projetado) + ' / ' + Math.round(esperado));
  ok('custos da venda: 6% do preço e R$ 20 mil', Math.abs(tr.venda.custo - (0.06 * tr.venda.preco + 20000)) < 0.01);
  ok('saldo devedor transferido: cai com as parcelas pagas até a venda', tr.venda.quitacao > 0 && tr.venda.quitacao < 368000, 'R$ ' + Math.round(tr.venda.quitacao));
  const curto = Object.assign({}, ap, { restantes: 20 });
  ok('com 20 parcelas faltando, não há saldo a transferir numa venda daqui a 5 anos', Eb.saldoDevedorEm(curto, 60) === 0 && Eb.trajetoriaDoBem(curto).venda.quitacao === 0);
  ok('com as parcelas que faltam, o saldo cai até zero na última', Eb.saldoDevedorEm(curto, 0) === 368000 && Eb.saldoDevedorEm(curto, 10) > 0 && Eb.saldoDevedorEm(curto, 10) < 368000 && Eb.saldoDevedorEm(curto, 20) === 0);
  const s = Eb.run('perp'), mes = {};
  let erro = 0;
  s.buckets.month.forEach(b => { if (b.w1 <= Eb.W0) return; mes[b.mi] = b.f; let i = 0, o = 0, v = 0;
    for (const k in b.f) { if (k.startsWith('in_')) i += b.f[k]; else if (k.startsWith('out_')) o += b.f[k]; else if (k.startsWith('mov_')) v += b.f[k]; }
    erro = Math.max(erro, Math.abs(i - o - v)); });
  ok('com a venda, movimentações = entradas − saídas', erro < 0.01, 'erro máximo ' + erro.toFixed(6));
  ok('na venda, o preço sai dos bens e os custos e o saldo transferido são saídas', Math.abs(mes[60].mov_bens + tr.venda.preco) < 0.01 && Math.abs(mes[60].out_venda_0 - tr.venda.custo) < 0.01 && Math.abs(mes[60].out_quita_0 - tr.venda.quitacao) < 0.01);
  ok('o aluguel e a parcela do bem terminam na venda', mes[59].in_alug === 3000 && !mes[60].in_alug && mes[59].out_fix_parc === 4870 && !mes[61].out_fix_parc);
  const wv = s.events.find(e => e.type === 'venda').week, antes = s.weeks[wv - 1].bens, depois = s.weeks[wv].bens;
  ok('depois da venda sobram só os outros bens', Math.abs(depois - 100000) < 0.01 && Math.abs(antes - (100000 + s.events.find(e => e.type === 'venda').antes)) < 0.01, 'bens de R$ ' + Math.round(antes) + ' para R$ ' + Math.round(depois));
  ok('o plano não é alterado pela venda (as linhas são cortadas numa cópia)', alug.steps.length === 1 && Eb.INCOMES.find(x => x.id === 'alug').steps.length === 2);
}

console.log('\n' + (falhas ? falhas + ' verificação(ões) falharam.' : 'Tudo certo.') + '\n');
process.exit(falhas ? 1 : 0);
