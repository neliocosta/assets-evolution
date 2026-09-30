// Copia o motor e o armazém da tela do cliente para a tela do consultor.
// As duas telas são autocontidas, então os dois blocos são duplicados de propósito; rode isto após mexer neles.
const fs = require('fs');
const origem = fs.readFileSync('evolucao-patrimonial.html', 'utf8');
const p = 'tela-consultor.html';
let s = fs.readFileSync(p, 'utf8');
for (const id of ['engine', 'armazem']) {
  const re = new RegExp('<script id="' + id + '">[\\s\\S]*?<\\/script>');
  const bloco = origem.match(re)[0];
  if (re.test(s)) s = s.replace(re, () => bloco);
  else s = s.replace(/(<script id="engine">[\s\S]*?<\/script>)/, (m) => m + '\n' + bloco);   // primeira vez: logo depois do motor
  console.log(id + ' sincronizado (' + Math.round(bloco.length / 1024) + ' KB)');
}
fs.writeFileSync(p, s);
