// servidor estático mínimo, para as capturas e testes: node ux/servir.cjs <pasta> <porta>
// Cache-Control no-store: o navegador não guarda cópia, e cada recarga traz a versão do disco
const http = require('http'), fs = require('fs'), path = require('path');
const [root, port] = [path.resolve(process.argv[2] || '.'), +(process.env.PORT || process.argv[3] || 8137)];   // PORT: a porta que o app do Claude atribui quando a pedida está ocupada
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]); if (p.endsWith('/')) p += 'tela-consultor.html';
  const f = path.join(root, p); if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end('404'); } res.writeHead(200, { 'Content-Type': tipos[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(d); });
}).listen(port, () => console.log('servindo', root, 'em http://localhost:' + port));
