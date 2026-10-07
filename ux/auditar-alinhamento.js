// Auditoria de alinhamento da área do cliente. Cole no console de evolucao-patrimonial.html (ou rode pela ferramenta de
// prévia) e chame: await auditaAlinhamento(). Passa por todas as páginas, menos o gráfico da evolução, e devolve, por
// página, "ok" ou a lista do que está fora do lugar:
//   - Hoje × Recomendado: cada linha de um lado na mesma altura da linha do outro (grade do IR, escadas, rodapés);
//   - cartões lado a lado na mesma linha com a mesma altura;
//   - cartões lado a lado em linhas diferentes com as bordas batendo (a regra dos cartões alinhados);
//   - textos cortados por falta de espaço.
// Rode em duas larguras (1366 e 1100 px): a quebra de linha muda de uma para a outra.
async function auditaAlinhamento() {
  const R = e => e.getBoundingClientRect(), out = {};
  for (const pg of PAGINAS.filter(p => p.id !== 'evolucao')) {
    mostraFase(pg.id); await new Promise(r => setTimeout(r, 380));
    const box = document.getElementById(pg.capa || pg.resumo ? 'pagina' : pg.id === 'riscos' || pg.id === 'patrimonio' ? pg.id : 'tributos'), probs = [];
    box.querySelectorAll('.tb-grade').forEach(g => { const k = [...g.children]; for (let i = 0; i + 1 < k.length; i += 2) {
      if (Math.abs(R(k[i]).top - R(k[i + 1]).top) > 1) probs.push('grade: linha ' + i / 2 + ' em alturas diferentes');
      const ba = k[i].querySelector('.tb-barra'), bb = k[i + 1].querySelector('.tb-barra'); if (ba && bb && Math.abs(R(ba).top - R(bb).top) > 1) probs.push('grade: barra da linha ' + i / 2 + ' desalinhada'); } });
    box.querySelectorAll('.tb-dois').forEach(d => { const [c1, c2] = d.querySelectorAll(':scope > .tb-col'); if (!c2) return;
      for (const sel of ['h4', '.tb-rot', '.tb-b', '.tb-rodape', '.tb-custo', '.tb-sep']) { const x = c1.querySelectorAll(sel), y = c2.querySelectorAll(sel);
        if (x.length !== y.length) probs.push(sel + ': ' + x.length + ' linhas de um lado e ' + y.length + ' do outro');
        x.forEach((e, i) => { if (y[i] && Math.abs(R(e).top - R(y[i]).top) > 1) probs.push(sel + ' "' + e.textContent.trim().slice(0, 25) + '": ' + Math.round(R(e).top - R(y[i]).top) + ' px'); }); } });
    const cards = [...box.querySelectorAll('.nota-card,.tb-card,.pf-ideal,.pf-comp,.pf-como,.cp-v,.cp-pags,.pf-col')].filter(e => e.offsetParent && !e.closest('.rk-slide:not(.atual)'));
    const linhas = {}; cards.forEach(c => { const k = Math.round(R(c).top) + '|' + (c.parentElement.className || c.parentElement.id); (linhas[k] = linhas[k] || []).push(c); });
    const multi = Object.entries(linhas).filter(([, l]) => l.length > 1);
    multi.forEach(([k, l]) => { const h = l.map(c => Math.round(R(c).height)); if (Math.max(...h) - Math.min(...h) > 1) probs.push('alturas diferentes em ' + k.split('|')[1] + ': ' + h.join(', ')); });
    const bordas = multi.filter(([k]) => !k.includes('pf-cols')).map(([k, l]) => [k, l.flatMap(c => [Math.round(R(c).left), Math.round(R(c).right)]).sort((a, b) => a - b)]);
    for (let i = 0; i < bordas.length; i++) for (let j = i + 1; j < bordas.length; j++) { const a = bordas[i][1], b = bordas[j][1];
      if (a.length === b.length && a.some((v, z) => Math.abs(v - b[z]) > 1)) probs.push('bordas que não batem: ' + bordas[i][0] + ' × ' + bordas[j][0]); }
    box.querySelectorAll('button, .tb-rot, h3, h4, b, .pf-tag').forEach(e => { if (e.offsetParent && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible') probs.push('texto cortado: ' + e.textContent.trim().slice(0, 50)); });
    out[pg.id] = probs.length ? probs : 'ok';
  }
  return out;
}
