// Gera a cópia publicada a partir de uma pasta com as duas telas: abre na mesma aba e usa o Font Awesome local.
// uso: node gerar-publicacao.js . <pasta-destino>   (depois publique <destino>/index.html como a página e
//      <destino>/evolucao-patrimonial.html como arquivo de apoio, no mesmo link; fa/ e fotos/ já estão lá)
const fs = require('fs'), path = require('path');
const [src, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
const troca = (s, a, b, nome) => { const n = s.split(a).length - 1; if (n < 1) throw new Error(nome + ': trecho não encontrado'); return s.split(a).join(b); };
// tela do consultor
let c = fs.readFileSync(path.join(src, 'tela-consultor.html'), 'utf8').replace(/\r\n/g, '\n');
c = troca(c, CDN, 'fa/css/all.min.css', 'consultor: font awesome');
const antesBlank = (c.match(/target="_blank"/g) || []).length;
c = c.replace(/(<a[^>]*Ver como o cliente vê[^<]*<\/a>)/g, m => m.replace(/\s*target="_blank"/, ''));
c = c.replace(/(<a [^>]*?)\s*target="_blank"([^>]*data-como-cliente)/g, '$1$2');
c = c.replace(/(id="btnComoCliente"[^>]*?)\s*target="_blank"/, '$1');
const m = c.match(/function abrirCliente\([\s\S]*?\n}\n/); if (!m) throw new Error('abrirCliente não encontrada');
const nova = m[0].replace(/window\.open\(([^,]+),\s*'_blank'[^)]*\)/, 'location.href = $1');
if (nova === m[0]) throw new Error('window.open em abrirCliente não encontrado');
c = c.replace(m[0], nova);
fs.writeFileSync(path.join(out, 'index.html'), c);
// tela do cliente
let e = fs.readFileSync(path.join(src, 'evolucao-patrimonial.html'), 'utf8').replace(/\r\n/g, '\n');
e = troca(e, CDN, 'fa/css/all.min.css', 'cliente: font awesome');
const r = /let w = null; try \{ w = window\.open\(url, 'nl-fluxo'[\s\S]*?if \(!w\) location\.href = url;/;
if (!r.test(e)) throw new Error('cliente: abertura do fluxo não encontrada');
e = e.replace(r, 'location.href = url;');
fs.writeFileSync(path.join(out, 'evolucao-patrimonial.html'), e);
console.log('ok', out, 'target=_blank no consultor: antes', antesBlank, 'depois', (c.match(/target="_blank"/g) || []).length);
