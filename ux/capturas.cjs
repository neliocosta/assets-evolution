// Capturas de tela das duas ferramentas, com o exemplo completo (ux/plano-exemplo.json), para revisões de UX.
// Usa o Chrome pelo protocolo do DevTools: viewport real, espera as animações, rola a página (ou o contêiner que rola)
// para disparar as entradas e tira a página em trechos (-1, -2, ...).
// uso: node ux/servir.cjs . 8137 (noutro terminal) e depois node ux/capturas.cjs <pasta-saida> [consultor|cliente] [pagina]
// Celular: W=390 H=844 node ux/capturas.cjs <pasta> cliente. MAXT limita os trechos por página (padrão 5).
const { spawn } = require('child_process'), fs = require('fs'), path = require('path'), os = require('os');
const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', PORTA = 9333;
const out = path.resolve(process.argv[2] || 'capturas'), so = process.argv[3], uma = process.argv[4];
const W = +(process.env.W || 1440), H = +(process.env.H || 900), MAXT = +(process.env.MAXT || 5);
fs.mkdirSync(out, { recursive: true });
const plano = JSON.parse(fs.readFileSync(path.join(__dirname, 'plano-exemplo.json'), 'utf8')).dados;
const b64 = Buffer.from(JSON.stringify(plano), 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
const base = 'http://localhost:8137/';
const consultor = ['cliente', 'fluxo', 'patrimonio', 'riscos', 'objetivos', 'liberdade', 'tributario', 'premissas', 'apresentacao', 'propostas'];
const cliente = ['proposito', 'proposito-nos', 'diagnostico', 'hoje-depois', 'capa-gestao', 'renda-custo', 'tempo', 'orcamento', 'capa-tributario', 'resumo-tributario', 'ir', 'prolabore', 'sucessao', 'previdencia', 'capa-patrimonio', 'resumo-patrimonio', 'patrimonio', 'capa-riscos', 'resumo-riscos', 'riscos', 'capa-evolucao', 'resumo-evolucao', 'evolucao', 'caminho'];
// o portal sem plano no navegador abre o exemplo completo; a área do cliente recebe o plano pelo endereço
const alvos = [].concat(so === 'cliente' ? [] : consultor.map((p, i) => [`consultor-${String(i + 1).padStart(2, '0')}-${p}`, `${base}tela-consultor.html#${p}`]),
  so === 'consultor' ? [] : cliente.map((p, i) => [`cliente-${String(i + 1).padStart(2, '0')}-${p}`, `${base}evolucao-patrimonial.html?fase=${p}#plano=${b64}`]))
  .filter(([n]) => !uma || n.endsWith('-' + uma));
const espera = ms => new Promise(r => setTimeout(r, ms));

async function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl); await new Promise((ok, erro) => { ws.onopen = ok; ws.onerror = erro; });
  let id = 0; const pend = new Map(), ouvintes = [];
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { const [ok, erro] = pend.get(d.id); pend.delete(d.id); d.error ? erro(new Error(d.error.message)) : ok(d.result); } else ouvintes.forEach(f => f(d)); };
  return { manda: (method, params = {}) => new Promise((ok, erro) => { const i = ++id; pend.set(i, [ok, erro]); ws.send(JSON.stringify({ id: i, method, params })); }),
    espera: nome => new Promise(ok => { const f = d => { if (d.method === nome) { ouvintes.splice(ouvintes.indexOf(f), 1); ok(d.params); } }; ouvintes.push(f); }),
    fecha: () => ws.close() };
}

(async () => {
  const perfil = path.join(os.tmpdir(), 'nl-capturas-chrome');
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORTA}`, `--user-data-dir=${perfil}`, 'about:blank'], { stdio: 'ignore' });
  for (let k = 0; k < 50; k++) { try { await fetch(`http://127.0.0.1:${PORTA}/json/version`); break; } catch (e) { await espera(200); } }
  try {
    for (const [nome, url] of alvos) {
      const alvo = await (await fetch(`http://127.0.0.1:${PORTA}/json/new?about:blank`, { method: 'PUT' })).json();
      const c = await cdp(alvo.webSocketDebuggerUrl);
      await c.manda('Page.enable'); await c.manda('Runtime.enable');
      await c.manda('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 768 });
      const carregou = c.espera('Page.loadEventFired'); await c.manda('Page.navigate', { url }); await carregou;
      await espera(2500);
      // quem rola: a página ou um contêiner interno (a área do cliente rola dentro de um contêiner)
      const ev = async e => (await c.manda('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result.value;
      const alt = await ev(`(() => { const d = document.scrollingElement; let sc = d.scrollHeight > innerHeight + 10 ? d : null;
        if (!sc) [...document.querySelectorAll('*')].forEach(el => { const s = getComputedStyle(el).overflowY; if ((s === 'auto' || s === 'scroll') && el.scrollHeight > el.clientHeight + 10 && el.clientHeight > 300 && (!sc || el.scrollHeight > sc.scrollHeight)) sc = el; });
        window.__sc = sc || d; return window.__sc.scrollHeight; })()`);
      const vis = await ev('window.__sc === document.scrollingElement ? innerHeight : window.__sc.clientHeight');
      // rola até o fim e volta, devagar, para disparar as entradas que esperam a rolagem
      for (let y = 0; y < alt; y += 600) { await ev(`window.__sc.scrollTop = ${y}`); await espera(450); }
      await ev('window.__sc.scrollTop = 0'); await espera(3500);
      // um trecho por altura visível, com uma pequena sobreposição
      const passo = Math.max(300, vis - 80), n = Math.min(MAXT, Math.ceil((alt - vis) / passo) + 1);
      for (let k = 0; k < n; k++) {
        if (k) { await ev(`window.__sc.scrollTop = ${k * passo}`); await espera(1200); }
        const shot = await c.manda('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(out, nome + (n > 1 ? '-' + (k + 1) : '') + '.png'), Buffer.from(shot.data, 'base64'));
      }
      console.log(nome, alt + 'px', n + ' trecho(s)');
      c.fecha(); await fetch(`http://127.0.0.1:${PORTA}/json/close/${alvo.id}`);
    }
  } finally { chrome.kill(); }
})().catch(e => { console.error(e); process.exit(1); });
