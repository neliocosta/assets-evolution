// Copia o motor, o armazém e os gráficos compartilhados (o sunburst da carteira) da tela do cliente para as outras telas:
// a do consultor (os três blocos) e a do acompanhamento (o motor e o armazém). As telas são autocontidas, então os blocos
// são duplicados de propósito; rode isto após mexer neles.
const fs = require('fs');
const origem = fs.readFileSync('evolucao-patrimonial.html', 'utf8');
const DESTINOS = { 'tela-consultor.html': ['engine', 'armazem', 'graficos'], 'acompanhamento.html': ['engine', 'armazem'] };
for (const [p, ids] of Object.entries(DESTINOS)) {
  let s = fs.readFileSync(p, 'utf8');
  for (const id of ids) {
    const re = new RegExp('<script id="' + id + '">[\\s\\S]*?<\\/script>');
    const bloco = origem.match(re)[0];
    if (re.test(s)) s = s.replace(re, () => bloco);
    else s = s.replace(/(<script id="engine">[\s\S]*?<\/script>)/, (m) => m + '\n' + bloco);   // primeira vez: logo depois do motor
    console.log(p + ': ' + id + ' sincronizado (' + Math.round(bloco.length / 1024) + ' KB)');
  }
  fs.writeFileSync(p, s);
}
