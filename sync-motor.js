// Copia o bloco do motor da tela do cliente para a tela do consultor.
// As duas telas são autocontidas, então o motor é duplicado de propósito; rode isto após mexer nele.
const fs = require('fs');
const eng = fs.readFileSync('evolucao-patrimonial.html', 'utf8').match(/<script id="engine">[\s\S]*?<\/script>/)[0];
const p = 'tela-consultor.html';
const s = fs.readFileSync(p, 'utf8').replace(/<script id="engine">[\s\S]*?<\/script>/, eng);
fs.writeFileSync(p, s);
console.log('motor sincronizado (' + Math.round(eng.length / 1024) + ' KB)');
