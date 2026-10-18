// O ACOMPANHAMENTO DO PLANO (orçado x realizado por objetivo), guardado para reaproveitar.
//
// Fica FORA da ferramenta de desenho do plano (portal do consultor e área do cliente), por decisão do usuário em
// 17/10/2026: a ferramenta serve para o consultor desenhar o plano e apresentá-lo ao cliente; depois vem o vai e volta dos
// ajustes. Revisitar os objetivos (o que foi guardado, o que foi realizado) é da futura área logada do cliente, e é lá que
// este código deve ser reaproveitado. Nenhuma das duas telas carrega este arquivo.
//
// O modelo: objectives[].foto (o orçado mês a mês, guardado numa data; não é fonte de nada) e objectives[].realizado
// ([{ mes: 'AAAA-MM', aporte, deOutro: [{ objetivo, valor }], saldo }]). O orçado sai do motor: ENGINE.orcadoDoObjetivo(o, s).
// A parte 1 roda sozinha (node) e é testada no verificar.js; as partes 2 a 4 são as telas como estavam no protótipo, para
// referência: dependem das utilidades de cada tela (fmt, money, unmoney, esc, tip, MESES, plano, SIM, ENGINE, renderAll,
// renderGoals, save, blocosAbertos; na área do cliente, escH, nomes, mesAnoISO).

// ===================== 1. A conta =====================
const num = v => v == null || v === '' || isNaN(+v) ? null : +v;
// A foto recebe o orçado pronto (orcado = ENGINE.orcadoDoObjetivo(o, s)), em vez de rodar a simulação aqui.
// A foto do orçado: o que o plano diz hoje, guardado com a data (objectives[].foto). É a referência do acompanhamento e não
// é fonte de nada: o plano continua mudando, a foto não.
function fotoDoObjetivo(o, M, em) {
  if (!M) return null;
  const r2 = v => Math.round(v * 100) / 100;
  return { em, alvo: M[M.length - 1].mes, valor: +o.amount || 0, meses: M.map(m => ({ mes: m.mes, aporte: r2(m.aporte), extra: r2(m.extra), saldo: r2(m.saldo) })) };
}
// O acompanhamento compara a foto com o realizado (objectives[].realizado: [{ mes: 'AAAA-MM', aporte, deOutro: [{ objetivo,
// valor }], saldo }]): o aporte que saiu do bolso, o que veio de outro objetivo para cobrir o mês e o saldo do extrato.
// Conta os meses em que a foto pedia aporte, até o último mês informado: cumpridos (o aporte do bolso chegou ao orçado),
// cobertos (faltou do bolso, mas o que veio de outro objetivo completou) e os que faltaram. Mês sem registro conta como
// aporte zero.
function acompanhamentoDoObjetivo(o) {
  const F = o.foto; if (!F || !Array.isArray(F.meses)) return null;
  const R = new Map((Array.isArray(o.realizado) ? o.realizado : []).filter(r => r && r.mes).map(r => [r.mes, r]));
  const ultimo = [...R.keys()].sort().pop();
  const linhas = ultimo ? F.meses.filter(m => m.mes <= ultimo).map(m => {
    const r = R.get(m.mes), ap = r ? +r.aporte || 0 : 0, outro = r ? (r.deOutro || []).reduce((a, x) => a + (+x.valor || 0), 0) : 0, pede = m.aporte > 0.5;
    const cumprido = pede ? ap >= m.aporte - 0.5 : null, coberto = pede && !cumprido && ap + outro >= m.aporte - 0.5;
    return { mes: m.mes, orcado: { aporte: m.aporte, saldo: m.saldo }, realizado: r ? { aporte: ap, deOutro: outro, origens: r.deOutro || [], saldo: num(r.saldo) } : null, cumprido, coberto };
  }) : [];
  const op = linhas.filter(l => l.cumprido != null), comSaldo = linhas.slice().reverse().find(l => l.realizado && l.realizado.saldo != null);
  return { foto: F, linhas, oportunidades: op.length, cumpridos: op.filter(l => l.cumprido).length, cobertos: op.filter(l => l.coberto).length,
    faltaram: op.filter(l => !l.cumprido && !l.coberto).length,
    saldo: comSaldo ? { mes: comSaldo.mes, orcado: comSaldo.orcado.saldo, realizado: comSaldo.realizado.saldo, diferenca: comSaldo.realizado.saldo - comSaldo.orcado.saldo } : null };
}
if (typeof module !== 'undefined') module.exports = { fotoDoObjetivo, acompanhamentoDoObjetivo };

if (typeof document !== 'undefined') {   // partes 2 e 3: só no navegador

// ===================== 2. Portal: guardar a foto (página Apresentação, capítulo Objetivos) =====================
// No portal, o capítulo Objetivos da página Apresentação chamava ${cid === 'objetivos' ? fotoDosObjetivos() : ''}.
// Com este arquivo, a foto é fotoDoObjetivo(o, ENGINE.orcadoDoObjetivo(o, SIM), em).
/* CSS:
.ac-cab{display:flex;align-items:baseline;gap:10px;cursor:pointer}
.ac-cab h4{margin-bottom:0} .ac-cab .ac-res{font:500 11.5px 'DM Sans',sans-serif;color:#8d8d8d;flex:1} .ac-cab .chev{font-size:10px;color:#9a9a9a}
.ac-tab{min-width:0;margin-top:10px} .ac-tab th{font:600 11px 'DM Sans',sans-serif;color:#8d8d8d;text-align:left;padding:4px 6px}
.ac-tab td{padding:3px 6px;font-size:12.5px;color:var(--nl-gray-700)} .ac-tab td.txt{white-space:nowrap}
.ac-tab input,.ac-tab select{padding:5px 8px;font-size:12.5px} .ac-tab .ac-outro{display:flex;gap:6px} .ac-tab .ac-outro select{flex:1.3} .ac-tab .ac-outro input{flex:1}
.ac-st{display:inline-block;font:600 11px 'DM Sans',sans-serif;padding:2px 9px;border-radius:9999px;white-space:nowrap}
.ac-st.ok{background:#E7F5EC;color:#22794a} .ac-st.cob{background:#FFF1E6;color:#964400} .ac-st.falta{background:#FDECEC;color:#B53434} .ac-st.nada{background:#F0EEE9;color:#8a8a8a}
.ac-resumo{background:var(--nl-cream-50);border-radius:10px;padding:9px 13px;font-size:12.5px;color:var(--nl-navy-900);margin-top:10px;line-height:1.55}
.ap-foto{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center;margin:14px 0 4px;padding:12px 14px;border-radius:10px;background:#faf8f5} .ap-foto b{font:600 13px 'DM Sans',sans-serif;color:var(--nl-navy-900)} .ap-foto small{display:block;font-size:12px;color:#6b6a66;margin-top:2px;max-width:720px}
*/
// A foto do plano dos objetivos (objectives[].foto): o orçado mês a mês de cada objetivo, com a data de hoje. É a referência
// do acompanhamento (orçado x realizado) nas revisões; o plano continua mudando, a foto não. Refazer substitui a anterior.
const dataBR = iso => String(iso || '').split('-').reverse().join('/');
function fotoDosObjetivos() {
  const com = plano.objectives.filter(o => o.amount > 0), fotos = com.map(o => o.foto && o.foto.em).filter(Boolean).sort();
  return `<div class="ap-foto"><div><b>Foto do plano dos objetivos</b><small>${fotos.length ? `Guardada em ${dataBR(fotos[fotos.length - 1])}${fotos.length < com.length ? ` (${com.length - fotos.length} ${com.length - fotos.length > 1 ? 'objetivos sem foto' : 'objetivo sem foto'})` : ''}. É com ela que o acompanhamento compara o realizado: os aportes de cada mês e o saldo de cada objetivo.` : 'Ainda sem foto. Guarde quando o cliente aprovar o plano: é a referência do acompanhamento, que compara o realizado (os aportes de cada mês e o saldo de cada objetivo) com o que foi planejado.'}</small></div>
    <button class="btn btn-secondary btn-small" data-foto-obj>${fotos.length ? 'Refazer a foto com o plano de hoje' : 'Guardar a foto do plano'}</button></div>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-foto-obj]'); if (!b) return;
  const hoje = new Date(), em = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
  const tira = () => plano.objectives.forEach(o => { if (!(o.amount > 0)) return; const f = fotoDoObjetivo(o, ENGINE.orcadoDoObjetivo(o, SIM), em); if (f) o.foto = f; });
  if (plano.objectives.some(o => o.foto) && !b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Substituir a foto anterior?'; b.classList.add('armed'); return; }
  tira(); renderAll();
});

// ===================== 3. Portal: lançar o realizado (cartão do objetivo, página Objetivos) =====================
// No cartão de cada objetivo com foto, depois da Apresentação ao cliente: ${o.foto ? htmlAcompanhamento(o) : ''}.
// Aqui a conta é a da parte 1 (acompanhamentoDoObjetivo), não ENGINE.acompanhamentoDoObjetivo.
/* CSS:
.ac-cab{display:flex;align-items:baseline;gap:10px;cursor:pointer}
.ac-cab h4{margin-bottom:0} .ac-cab .ac-res{font:500 11.5px 'DM Sans',sans-serif;color:#8d8d8d;flex:1} .ac-cab .chev{font-size:10px;color:#9a9a9a}
.ac-tab{min-width:0;margin-top:10px} .ac-tab th{font:600 11px 'DM Sans',sans-serif;color:#8d8d8d;text-align:left;padding:4px 6px}
.ac-tab td{padding:3px 6px;font-size:12.5px;color:var(--nl-gray-700)} .ac-tab td.txt{white-space:nowrap}
.ac-tab input,.ac-tab select{padding:5px 8px;font-size:12.5px} .ac-tab .ac-outro{display:flex;gap:6px} .ac-tab .ac-outro select{flex:1.3} .ac-tab .ac-outro input{flex:1}
.ac-st{display:inline-block;font:600 11px 'DM Sans',sans-serif;padding:2px 9px;border-radius:9999px;white-space:nowrap}
.ac-st.ok{background:#E7F5EC;color:#22794a} .ac-st.cob{background:#FFF1E6;color:#964400} .ac-st.falta{background:#FDECEC;color:#B53434} .ac-st.nada{background:#F0EEE9;color:#8a8a8a}
.ac-resumo{background:var(--nl-cream-50);border-radius:10px;padding:9px 13px;font-size:12.5px;color:var(--nl-navy-900);margin-top:10px;line-height:1.55}
*/
const dataDaFoto = o => String(o.foto.em).split('-').reverse().join('/');
// ---------- acompanhamento: o realizado de cada mês contra a foto do plano ----------
// Uma linha por mês da foto, do primeiro até o mês de hoje (ou a data alvo). O orçado vem da foto (só leitura); o que a
// consultora lança vai para objectives[].realizado ({ mes, aporte, deOutro: [{ objetivo, valor }], saldo }). Mês sem nada
// lançado não fica gravado. A conta é a do motor (acompanhamentoDoObjetivo), a mesma da área do cliente.
const mesAnoBR = mes => { const [y, m] = mes.split('-'); return MESES[+m - 1] + '/' + y; };
const mesDeHoje = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
const mesesDoAcompanhamento = o => o.foto.meses.filter(m => m.mes <= mesDeHoje());
function resumoAcompanhamento(o) {
  const A = acompanhamentoDoObjetivo(o);
  if (!A || !A.linhas.length) return { curto: 'nenhum mês lançado', longo: 'Lance o que o cliente aportou em cada mês e, se tiver, o saldo do extrato. O resumo e os pontos do extrato aparecem na página do objetivo, na área do cliente.' };
  const s = A.saldo, cob = A.cobertos ? `, ${A.cobertos} ${A.cobertos > 1 ? 'cobertos' : 'coberto'} com dinheiro de outro objetivo` : '';
  return { A, curto: `${A.cumpridos} de ${A.oportunidades} aportes cumpridos${A.faltaram ? ` · ${A.faltaram} em falta` : ''}`,
    longo: `Aportes: <b>${A.cumpridos} de ${A.oportunidades}</b> cumpridos${cob}${A.faltaram ? `, <b>${A.faltaram}</b> em falta` : ''}. ` +
      (s ? `Saldo do extrato em ${mesAnoBR(s.mes)}: <b>${fmt(s.realizado)}</b>; o plano previa ${fmt(s.orcado)} (${s.diferenca >= 0 ? '+ ' : '− '}${fmt(Math.abs(s.diferenca))}).` : 'Sem saldo do extrato lançado.') };
}
function estadoDoMes(A, mes) {
  const l = A && A.linhas.find(x => x.mes === mes); if (!l) return '';
  if (l.cumprido == null) return '<span class="ac-st nada">sem aporte no plano</span>';
  return l.cumprido ? '<span class="ac-st ok">cumprido</span>' : l.coberto ? '<span class="ac-st cob">coberto por outro</span>' : '<span class="ac-st falta">faltou</span>';
}
function htmlAcompanhamento(o) {
  const aberto = blocosAbertos.has(o.id + ':acomp'), R = resumoAcompanhamento(o);
  const cab = `<div class="ac-cab" data-acomp-abrir="${o.id}"><h4>Acompanhamento</h4><span class="ac-res" data-acomp-curto="${o.id}">plano de ${dataDaFoto(o)} · ${R.curto}</span><span class="chev">${aberto ? '▲' : '▼'}</span></div>`;
  if (!aberto) return `<div class="secao">${cab}</div>`;
  const ms = mesesDoAcompanhamento(o), outros = plano.objectives.filter(x => x !== o);
  const linha = m => { const r = (o.realizado || []).find(x => x.mes === m.mes) || {}, d = (r.deOutro || [])[0] || {}, c = `${o.id}|${m.mes}|`;
    const din = (k, v) => `<input data-acomp="${c}${k}" data-money-opt inputmode="decimal" value="${v != null && v !== '' ? money(v) : ''}" placeholder="—">`;
    return `<tr><td class="txt">${mesAnoBR(m.mes)}</td><td class="txt">${m.aporte > 0.5 ? fmt(m.aporte) : '—'}</td><td>${din('aporte', r.aporte)}</td>
      <td><div class="ac-outro"><select data-acomp="${c}objetivo"><option value="">—</option>${outros.map(x => `<option value="${x.id}"${d.objetivo === x.id ? ' selected' : ''}>${esc(x.name || 'Objetivo sem nome')}</option>`).join('')}</select>${din('valor', d.valor)}</div></td>
      <td>${din('saldo', r.saldo)}</td><td data-acomp-st="${c}">${estadoDoMes(R.A, m.mes)}</td></tr>`; };
  return `<div class="secao">${cab}
    ${ms.length ? `<table class="rkc-tab ac-tab"><thead><tr><th>Mês</th><th>Aporte do plano</th><th>Aporte realizado ${tip('O que o cliente guardou do próprio bolso para este objetivo no mês.')}</th><th>Veio de outro objetivo ${tip('Dinheiro remanejado de outro objetivo para cobrir o aporte deste mês: de qual e quanto.')}</th><th>Saldo do extrato ${tip('Opcional: o saldo do objetivo no fim do mês, como no extrato. Vira um ponto sobre a curva na área do cliente.')}</th><th></th></tr></thead>
      <tbody>${ms.map(linha).join('')}</tbody></table>
      <div class="ac-resumo" data-acomp-longo="${o.id}">${R.longo}</div>` : `<div class="muted" style="margin-top:8px">A foto começa em ${mesAnoBR(o.foto.meses[0].mes)}: o primeiro mês para lançar ainda não chegou.</div>`}</div>`;
}
document.addEventListener('click', e => {
  const c = e.target.closest('[data-acomp-abrir]'); if (!c) return;
  const k = c.dataset.acompAbrir + ':acomp'; blocosAbertos.has(k) ? blocosAbertos.delete(k) : blocosAbertos.add(k); renderGoals();
});
function lancaAcompanhamento(t) {
  const [id, mes, campo] = t.dataset.acomp.split('|'), o = plano.objectives.find(x => x.id === id); if (!o) return;
  const lista = o.realizado = Array.isArray(o.realizado) ? o.realizado : [];
  let r = lista.find(x => x.mes === mes); if (!r) { r = { mes }; lista.push(r); lista.sort((a, b) => a.mes < b.mes ? -1 : 1); }
  const v = t.value.replace(/\D/g, '') === '' ? null : unmoney(t.value);
  if (campo === 'aporte' || campo === 'saldo') { if (v == null) delete r[campo]; else r[campo] = v; }
  else {
    const d = (r.deOutro && r.deOutro[0]) || {}, resto = (r.deOutro || []).slice(1);
    if (campo === 'objetivo') d.objetivo = t.value || undefined; else d.valor = v == null ? undefined : v;
    const tem = d.objetivo || d.valor != null; r.deOutro = tem ? [{ objetivo: d.objetivo || '', valor: d.valor || 0 }, ...resto] : resto;
    if (!r.deOutro.length) delete r.deOutro;
  }
  if (r.aporte == null && r.saldo == null && !r.deOutro) lista.splice(lista.indexOf(r), 1);   // mês vazio não fica gravado
  if (!lista.length) delete o.realizado;
  // o resumo e o estado dos meses acompanham, sem redesenhar a tabela (o campo em digitação fica como está)
  const R = resumoAcompanhamento(o), cu = document.querySelector(`[data-acomp-curto="${id}"]`), lo = document.querySelector(`[data-acomp-longo="${id}"]`);
  if (cu) cu.textContent = `plano de ${dataDaFoto(o)} · ${R.curto}`; if (lo) lo.innerHTML = R.longo;
  document.querySelectorAll(`[data-acomp-st^="${id}|"]`).forEach(td => { td.innerHTML = estadoDoMes(R.A, td.dataset.acompSt.split('|')[1]); });
  save();
}
document.addEventListener('input', e => { if (e.target.dataset && e.target.dataset.acomp != null) lancaAcompanhamento(e.target); });

}

// ===================== 4. Área do cliente: o bloco "O acompanhamento" e os saldos do extrato =====================
// Na página "Como realizar cada objetivo" (renderRealizacao), com A = acompanhamentoDoObjetivo(o): os pontos do extrato
// entravam no gráfico "O caminho até lá" (com "saldo no extrato" na legenda) e o bloco ia depois dele.
/* CSS:
.ro-graf .real{fill:var(--nl-navy-900)} .ro-graf .lb{font:500 12px 'DM Sans',sans-serif;fill:#6b6a66} .ro-graf .lb.dt{font-weight:700;fill:var(--nl-navy-900)}
.ro-leg i.nec{border-top:2px dashed rgba(32,52,76,.5)} .ro-leg i.real{width:8px;height:8px;border:0;border-radius:50%;background:var(--nl-navy-900)}
*/
/* os pontos do extrato sobre a curva:
  const R = A ? new Map(A.linhas.filter(l => l.realizado && l.realizado.saldo != null).map(l => [l.mes, l.realizado.saldo])) : new Map();
  R.forEach((v, mes) => { const mi = miDe(mes); if (mi >= 0) g += `<circle cx="${x(mi)}" cy="${y(v)}" r="4" class="real"><title>${mesAnoISO(mes)}: ${fmt(v)} no extrato</title></circle>`; });
*/
/* o bloco:
  // o acompanhamento: a foto do plano contra o realizado
  const acomp = A && A.linhas.length ? `<section class="gf-sec rev"><div class="lp-rot">O acompanhamento · plano de ${escH(A.foto.em.split('-').reverse().join('/'))}</div><div class="gf-cards q4">
      <div class="gf-c"><span>Aportes cumpridos</span><b>${A.cumpridos} de ${A.oportunidades}</b><small>meses em que o aporte combinado saiu do orçamento</small></div>
      <div class="gf-c"><span>Cobertos por outro objetivo</span><b>${A.cobertos}</b><small>${A.cobertos ? 'meses em que o dinheiro veio de ' + nomes([...new Set(A.linhas.filter(l => l.coberto).flatMap(l => l.realizado.origens.map(x => escH((ENGINE.OBJ.find(y => y.id === x.objetivo) || {}).name || 'outro objetivo'))))]) : 'nenhum remanejamento'}</small></div>
      <div class="gf-c${A.faltaram ? ' fut neg' : ''}"><span>Aportes que faltaram</span><b>${A.faltaram}</b><small>${A.faltaram ? 'meses sem o aporte combinado' : 'nenhum mês em falta'}</small></div>
      <div class="gf-c${A.saldo && A.saldo.diferenca < -0.5 ? ' fut neg' : ''}"><span>Saldo em ${A.saldo ? mesAnoISO(A.saldo.mes) : '—'}</span><b>${A.saldo ? fmt(A.saldo.realizado) : '—'}</b><small>${A.saldo ? 'o plano previa ' + fmt(A.saldo.orcado) + ' (' + (A.saldo.diferenca >= 0 ? '+ ' : '− ') + fmt(Math.abs(A.saldo.diferenca)) + ')' : 'sem saldo informado'}</small></div></div></section>` : '';
*/
