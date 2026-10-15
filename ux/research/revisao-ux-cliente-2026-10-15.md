# Revisão de UI/UX: Área do cliente (`evolucao-patrimonial.html`), 15/10/2026

Feita com a definição do agente `ui-ux-designer` (Madina Gbotoe, CC BY 4.0), a pedido do usuário, com o objetivo "uma
aplicação que passe a impressão de profissionalismo e elegância". O revisor viu as 46 capturas de desktop (1440×900) e cerca de
30 do celular (390×844), com o exemplo completo; leu o CSS e o HTML, o `PRODUCT.md`, o `DESIGN.md`, as decisões do
`PENDENCIAS.md` e a revisão de 07/10. As capturas não estão no repositório: refaça-as com `ux/capturas.cjs` (**D/** é a pasta
de desktop, `W=390 H=844` dá a **C/** do celular; os nomes citados, como `23` ou `20-2`, são os números do arquivo
`cliente-NN-...` e o trecho). Os números de linha são os de `evolucao-patrimonial.html` no commit `dfec810`.
**Nada foi aplicado ainda.**

Dois pontos pedem decisão do usuário antes de aplicar, porque mexem em decisões registradas:
- o achado 2 recomenda reverter "Carrossel de riscos sem sobe e desce (07/10/2026)";
- o achado 1 deixa a trajetória inteira à vista antes de "Reproduzir" (hoje o futuro aparece apagado até a reprodução) e
  troca o eixo comprimido (`asinh`) por um linear.

## Veredito

A base está certa. A paleta marinho, laranja e creme é própria e não parece SaaS genérico. O texto fala a língua da família.
Algumas páginas já têm o acabamento de um relatório de private banking: o Hoje e depois (D/04-1), a rosca da renda (D/06-1), o
relógio do mês (D/07-1) e a comparação do IR na mesma escala (D/11-1). Quatro coisas impedem que o conjunto passe a impressão
de "profissionalismo e elegância":

1. **O gráfico-assinatura abre fraco.** A trajetória do patrimônio aparece apagada (a 30% de opacidade) e com o eixo de valor
   comprimido, por isso a curva parece plana.
2. **O sistema visual se desfez com o tempo.** A página tem duas margens esquerdas e três raios de canto, o texto explicativo
   usa uns dez tamanhos e há três famílias sem serifa. O laranja aparece em quase tudo e já não significa nada.
3. **As aberturas de capítulo parecem a mesma página-modelo dez vezes.** Só o Propósito tem cara de abertura de um relatório
   premium.
4. **No celular, os gráficos de escada se desmancham** e o cabeçalho e o rodapé desperdiçam espaço.

Nenhum desses pontos exige refazer o produto. Quase tudo se resolve em CSS, com alguns ajustes de JS.

## Problemas críticos

### 1. A trajetória do patrimônio abre apagada, com o eixo distorcido e com a legenda longe dos dados
**Problema** (D/23, C/23):
- Antes de clicar em "Reproduzir", `revealWeek()` (linha 2296) devolve `W0`. Com isso, todo o futuro é desenhado com
  `alpha 0.3` (2341) e os marcos também (2351). O gráfico mais importante do livro abre com cara de desativado: "Viagem a
  Fortaleza" e "Casa própria" quase não se leem.
- O eixo Y está em `asinh` com joelho em R$ 500 mil (2135, 2294). Em D/23, a faixa de R$ 0 a 500 mil ocupa cerca de 45% da
  altura e só contém a linha das participações. O crescimento de R$ 2,1 mi para R$ 3 mi parece um traço quase reto.
- Os rótulos do eixo usam `rgba(32,52,76,.45)` (2312), o que dá cerca de 2,5:1 de contraste.
- A legenda fica no canto do cabeçalho (`.legend`, linhas 30–33, HTML 748–755), em 11px, a uns 900px das faixas.
- A linha "Hoje" desce até o fim da tela (2378) e atravessa cerca de 190px vazios abaixo da tabela, porque `chartBot = 0.62·H`
  e `rowsTop = chartBot + 60` (2157).

**Evidência**:
- Tufte, *lie factor*: a altura desenhada deve ser proporcional ao valor.
- Cleveland & McGill (1984): ler posição numa escala comum é a tarefa mais precisa, mas só se a escala for linear.
- Rótulos diretos evitam o vaivém entre os dados e a legenda (Few, *Show Me the Numbers*).
- WCAG 1.4.3.

**Impacto**: o cliente leigo lê a altura literalmente. Hoje o gráfico diz "quase não cresce", o contrário do que o plano
promete. É a tela que mais pesa na percepção de valor do serviço.

**Correção**: o `yMax` já acompanha a janela visível (2305–2306), então a compressão não é necessária.
```js
// 2296: parado, o plano aparece inteiro; só a reprodução apaga o futuro e o revela
function revealWeek() { return !state.started || state.done ? NW : Math.floor(state.cursor); }
// 2294: eixo linear
const yOf = (v, top, bot) => bot - Math.max(0, v) / state.yMax * (bot - top);
// 2312: marcas lineares "redondas" e rótulo legível
const passo = [5e4, 1e5, 2.5e5, 5e5, 1e6, 2e6, 2.5e6, 5e6, 1e7, 2e7].find(p => state.yMax / p <= 5);
for (let v = passo; v < state.yMax; v += passo) { /* mesma linha pontilhada */ ctx.fillStyle = '#6B6A66'; /* ... */ }
// 2157: a tabela ocupa o que precisa; o gráfico fica com o resto
chartBot = FLUXO ? 0 : Math.round(Math.max(H * 0.62, H - 60 - Math.min(6, flatRows().length) * rowH - 24));
// 2378: a linha de hoje termina na última linha da tabela, não em H
```
Para os rótulos diretos, troque `PR = 24` por `PR = 132` (2156). Depois de `drawStack` (2340), escreva na ponta direita de
cada faixa o nome e o valor (por exemplo "Financeiro · R$ 2,1 mi"), na cor da série, com o verde escurecido para `#1F7A45`. A
`.legend` do cabeçalho fica só com os anéis de status dos objetivos.

**Prioridade**: Crítica. Esforço médio.

### 2. Gestão de riscos: um cartão com 700px em branco e slides vizinhos cortados
**Problema**:
- Em D/20-2 e D/20-3, o slide atual termina e sobra um cartão branco de cerca de 700px, porque todos os slides esticam até a
  altura do mais alto (`.rk-trilha{align-items:stretch}`, linhas 547 e 549).
- Em D/20-1, os vizinhos são cortados com corte seco na borda (aparecem "Probler" e "Possív") por causa de
  `.rk-car{margin:0 -24px;overflow:hidden}` (548).
- No topo, o 38% e a teia ficam separados por um vão enorme. No desktop a causa é `justify-content:space-between` (516). No
  celular (C/20-1) sobram cerca de 250px vazios, porque `.rk-topo.um .rk-hero-t{flex:0 0 300px}` (517) vence a media query da
  linha 584 por especificidade e, na coluna, vira 300px de altura.

**Evidência**: um vazio grande lê-se como "página quebrada ou carregando", e a estética percebida contamina a confiança (NN/g,
Aesthetic-Usability Effect). Carrosséis escondem conteúdo (NN/g, *Designing Effective Carousels*).

**Correção**: **o revisor recomenda reverter** a decisão "Carrossel de riscos sem sobe e desce (07/10)". O sobe e desce só move
o que está abaixo do carrossel, que é só o rodapé, porque o topo do slide não se mexe. Uma transição de altura resolve o
incômodo sem o vazio. O ideal é implementar logo o esboço já aprovado de "riscos em camadas" (pendência 2), que elimina o
carrossel. Enquanto isso:
```css
.rk-trilha{align-items:flex-start}
.rk-car{margin:0;transition:height .3s ease;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent);
          mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)}
.rk-topo.um .rk-hero{justify-content:center;gap:72px}
@media (max-width:1100px){.rk-topo.um .rk-hero-t{flex:none}}
@media (prefers-reduced-motion:reduce){.rk-car{transition:none}}
```
Em `posicionaCarrossel()` (3780), acrescente `car.style.height = s.offsetHeight + 'px';`.

**Prioridade**: Crítica. Esforço baixo.

### 3. As aberturas de capítulo são páginas-modelo, e o resumo tem um erro de rótulo
**Problema**:
- As capas (D/05, D/09, D/15, D/18, D/21) têm todas a mesma composição de página de detalhe. O cartão "Neste capítulo" tem
  420px de altura para dois a cinco itens e fica de 40% a 60% vazio.
- Os resumos (D/16-1, D/19-1, D/22-1) têm todos o mesmo título "Resumo do seu caso" e o mesmo subtítulo genérico. O cartão
  "Principais números" também fica meio vazio.
- Em D/22-1, os dois números aparecem com o rótulo "A TRAJETÓRIA DO PATRIMÔNIO". Na linha 3554, `varias` conta as páginas do
  capítulo, não as páginas que trouxeram números.
- No celular (C/10-1), o texto diz "Ao lado, os principais números", mas eles ficam embaixo (3556).
- O único momento de "abertura de livro" é o hero do Propósito (D/01-1).

**Evidência**: consistência e padrões (NN/g) pedem que a mesma função tenha a mesma forma. Aqui a mesma forma serve a funções
diferentes (abrir capítulo, resumir, detalhar), e a hierarquia some. A primeira impressão se forma em cerca de 50 ms (Lindgaard
et al., 2006).

**Correção**: as decisões ficam como estão (capa com o vídeo teórico e a lista de páginas; resumo com o vídeo do consultor, os
números e o que fazer). Muda só o layout:
```css
/* capa: faixa de abertura, a mesma linguagem do hero do Propósito */
.rc.abre .cp-um{grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);align-items:center;gap:40px;padding:48px;border-radius:24px;color:#fff;
  background:radial-gradient(120% 140% at 100% 0%,rgba(212,160,86,.28),transparent 55%),linear-gradient(160deg,#20344C,#131F2E)}
.rc.abre .cp-v{background:none;box-shadow:none;padding:0}
.cap-tit{font:500 44px/1.08 Sora,sans-serif;letter-spacing:-.025em;color:#fff}
.cap-sub{font-size:16px;line-height:1.6;color:rgba(255,255,255,.75);margin-top:14px;max-width:440px}
.cp-pags.trilha{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;background:none;box-shadow:none;padding:0}
.cp-pags.trilha .cp-p{background:#fff;border:0;border-radius:16px;box-shadow:var(--shadow-card);padding:16px 18px}
```
- Em `renderCapa` (3543–3548): adicione a classe `abre`, ponha o título e o subtítulo dentro da faixa, à esquerda do vídeo, e as
  páginas embaixo como blocos (`.cp-pags.trilha`).
- Em `renderResumo` (3551–3561): os números viram uma linha de cartões `.gf-cards` acima do vídeo; o título passa a ser
  `'O seu caso: ' + c.titulo`; a linha 3554 fica `rot: ds.length > 1 ? p.titulo : n.rot`; e o subtítulo da linha 3556 passa a
  dizer "os principais números e o que fazer", sem "ao lado" nem "embaixo".

**Prioridade**: Alta. Esforço médio.

### 4. A frase do Propósito usa uma fonte de título para texto corrido
**Problema** (D/01-1, D/01-2, C/01-2):
- A DM Serif Display é um corte para títulos (um peso só, contraste alto, espaçamento apertado), mas aqui carrega cerca de 70
  palavras em três parágrafos centralizados de 29px (124–125). Ao mesmo tempo, a frase empilha cinco ornamentos: balão com
  borda laranja de 2px (121–122), rabicho, aspas de 76px, três manchas coloridas à deriva (113–119) e uma entrada com desfoque
  de 3s (126). Uma captura no meio da animação mostra o texto borrado (D/01-1).
- No celular, o padding de 52px do balão deixa linhas de três a cinco palavras, centralizadas.
- O hero e a faixa da frase têm cantos retos e terminam em x=160 e x=1280, porque usam `margin:0 -24px` (100 e 113). Parecem um
  banner recortado.

**Evidência**: texto centralizado em várias linhas perde a borda esquerda que guia a leitura (NN/g, viés para a esquerda).
Medida de linha recomendada: 45 a 90 caracteres (Butterick, *Practical Typography*). A própria família DM tem a DM Serif Text,
feita para tamanhos de texto.

**Correção**: balão, serifa, duas cores e entrada lenta foram pedidos do usuário e ficam. Muda o corte, a contenção e o recorte.
```css
/* @import: acrescentar &family=DM+Serif+Text:ital@0;1 */
.lp-citacao p{font:400 24px/1.55 'DM Serif Text',Georgia,serif;filter:none;
  transition:opacity 3s ease,transform 3s cubic-bezier(.2,.7,.2,1)}
.lp-citacao p:first-child{font:400 38px/1.18 'DM Serif Display',Georgia,serif}
.lp-balao{border:1px solid rgba(224,102,0,.35);box-shadow:0 24px 60px rgba(32,52,76,.08)}
.lp-balao::after{border-right:1px solid rgba(224,102,0,.35);border-bottom:1px solid rgba(224,102,0,.35)}
.lp-hero,.lp-man{margin:0;border-radius:24px} .lp-man{margin-top:20px}
@media (max-width:600px){.lp-man{padding:40px 16px}.lp-balao{padding:22px 20px 26px;border-radius:20px}
  .lp-citacao p{font-size:19px;text-align:left}.lp-citacao p:first-child{font-size:27px;text-align:center}}
```
No texto, deixe no máximo um destaque laranja por parágrafo (hoje são cinco).

**Prioridade**: Alta, porque é a primeira tela do livro. Esforço baixo.

### 5. A tipografia não segue uma escala
**Problema**:
- A Montserrat continua sendo carregada (linha 9) e usada no `.hello` (28) e no cartão do objetivo (`.card`, 703). São três
  famílias sem serifa.
- O texto explicativo tem 12,5px nas páginas tributárias e de riscos (`.tb-notas li` 488, `.tb-card>.sub` 447,
  `.rk-card .expl` 593, `.nota-card .sub` 525) e de 14,5px a 15,5px no Diagnóstico e no Propósito (`.fm-inst p` 177,
  `.dg-sub` 190, `.lp-pl p` 149). Compare D/12-1 com D/03-1.
- Os rótulos em maiúsculas usam quatro espaçamentos diferentes: .06em (340, 451), .1em (222, 176), .12em (179) e .14em (110).
- Os títulos de cartão variam entre 14, 15, 17 e 18px (328, 446, 245, 524).
- Só `.gf-rel` (248) usa algarismos tabulares, e as colunas de R$ do IR (D/11-2) ficam desalinhadas.
- A Sora 600 a 32px, sem espaçamento negativo, parece título de aplicativo, não de relatório.

**Evidência**: hierarquia visual depende de poucos níveis bem distintos (NN/g, *Visual Hierarchy*). A credibilidade é julgada
sobretudo pelo visual (Fogg et al., Stanford, 2003).

**Correção**:
```css
:root{--fs-h1:36px;--fs-h3:17px;--fs-body:15px;--fs-small:13.5px;--fs-label:11px;--tr-display:-.025em;--tr-label:.12em}
.lp-cab h1{font:500 var(--fs-h1)/1.1 Sora,sans-serif;letter-spacing:var(--tr-display)}
.tb-notas li,.rk-card .expl,.pf-como .txt,.gf-veredito{font-size:14.5px;line-height:1.6}
.tb-card>.sub,.pf-comp>.sub,.nota-card .sub,.cp-vt span,.simula .muted{font-size:var(--fs-small)}
.lp-rot,.gf-c>span,.cp-n span,.fm-inst small,.fm-bl h3,.tb-col h4,.tb-grade h4,.pf-rot{letter-spacing:var(--tr-label)}
.cp-vt b,.tb-card>h3,.pf-comp>h3,.nota-card h2,.cp-pags h3,.gf-rel h2{font:600 var(--fs-h3) Sora,sans-serif}
.gf-c b,.cp-n b,.tb-eco,.pf-big,.rk-nota,.tb-pes .v,.tb-v,.pi-v,.oc-sl>span:last-child,.fm-ex td,.pf-tab td{font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.hello{font:500 13px 'DM Sans',sans-serif;color:#6B6A66} /* era Montserrat #777, 4,48:1 */
```
Tire `Montserrat` do `@import` (9) e de `.card` (703). Confirme se a Sora traz `tnum`; a DM Sans traz.

**Prioridade**: Alta. Esforço médio (buscar e substituir).

### 6. O laranja virou enfeite e deixou de dizer "à frente"
**Problema**: a Horizon Rule do próprio DESIGN.md é violada em vários lugares:
- barras de imposto em laranja (D/11-1, `.tb-barra i` 467), embora imposto não seja futuro;
- marcadores das listas (D/12-1, D/13-1, D/14-2; 489);
- anos da história da Nord (D/02-2; 165–167);
- avatares em degradê laranja e dourado (D/03-1; 147, 173);
- barras de referência da fase em pêssego e laranja (D/17-2; linha 3611);
- fases já vividas em pêssego (D/17-1; 360);
- teia inteira em laranja (D/20-1; 533), onde o laranja também quer dizer "atenção";
- guias tracejadas do orçamento (285).

**Evidência**: cor só orienta quando é rara e consistente. Elementos que se destacam por cor são percebidos antes de tudo
(processamento pré-atentivo; NN/g sobre gráficos e dashboards). Com o laranja em toda parte, o futuro e o próximo passo deixam
de saltar aos olhos.

**Correção**:
```css
.tb-barra i{background:#9FB0C4} .tb-grade>:nth-child(even) .tb-barra i{background:var(--nl-navy-900)}
.tb-notas li::before{background:#C9C3B8}
.lp-hist b{color:var(--nl-navy-900)} .lp-hist li::before{border-color:var(--nl-navy-900)} .lp-hist::before{background:#DCE3EC}
.lp-av,.fm-av{background:#DCE3EC;color:var(--nl-navy-900);box-shadow:none}
.pf-seg i em{background:#C7D1DD}
.teia-a{fill:rgba(32,52,76,.08);stroke:var(--nl-navy-900);stroke-width:1.5} /* os pontos continuam com a cor do status */
```
Na linha 3611, troque as cores das barras de referência por `['#E9EDF2','#C7D1DD','#9FB0C4']`.

**Prioridade**: Alta. Esforço baixo.

### 7. A página tem duas margens esquerdas e três raios de canto
**Problema**: em D/05 e D/09, o título começa em x=192 e os cartões em x=184. Em D/11-1, o cartão de destaque fica 8px à
esquerda do título, e o filete do rodapé vai de 184 a 1256. A causa é que `.lp-cab` (111), `.fm-sec` e `.gf-sec` (170, 216),
`.hd` (192) e os blocos `.oc-*` (255–297) têm 8px de recuo, e `.cp-um`, `.nota-card`, `.tb-card` e `.pf-*` não têm. Os raios
variam entre 14px (327, 330, 367, 445, 523, 587), 16px (172, 221) e 20px (193). O DESIGN.md manda 16px.

**Evidência**: alinhamento e consistência são o que um leitor lê, sem perceber, como cuidado e acabamento (NN/g, *Consistency
and Standards*).

**Correção**:
```css
.lp-cab,.fm-sec,.gf-sec,.lp-sec{padding-left:0;padding-right:0}
.hd,.oc-top,.oc-regua,.oc-palco,.oc-dica,.oc-ctl{margin-left:0;margin-right:0}
.cp-v,.cp-pags,.nota-card,.tb-card,.pf-card,.pf-ideal,.pf-comp,.pf-como,.rk-card,.hd-fundo,.video{border-radius:16px}
```
**Prioridade**: Alta. Esforço baixo.

### 8. No celular, as escadas se desmancham
**Problema**:
- Em C/17-2, as barras viram bolinhas: a barra de R$ 1,2 mi tem cerca de 20px.
- Em C/14-3, as barras e os valores somem além da borda do cartão. A pendência 5 só registra os valores.
- A causa: a coluna de rótulos tem 210px (`.pi-linhas` 381, `.pi-fundo` 377) ou 310px (`.tb-esc.largo` 470), mais uma margem
  direita de 92px a 110px (384, 473), e só existem media queries para 1080px (429, 510).

**Evidência**: o celular é um uso declarado ("volta sozinho, no laptop ou no celular"). Uma composição que não se lê no celular
falha justamente na revisita.

**Correção**:
```css
@media (max-width:760px){
  .pi-linhas,.tb-esc,.tb-esc.largo{grid-template-columns:1fr;row-gap:2px}
  .pi-rot,.tb-rot{text-align:left;padding:8px 0 0;font-size:12.5px}
  .pi-fundo{left:0;right:96px} .pi-tr{margin-right:96px} .tb-tr{margin-right:88px}
  .pi-b.liga::before,.tb-b.liga::before{display:none}
}
```
Com isso, a área da barra passa de cerca de 30px para cerca de 210px.

**Prioridade**: Alta. Esforço baixo.

### 9. No celular, o cabeçalho e o rodapé desperdiçam espaço e os alvos de toque são pequenos
**Problema**:
- Em todas as telas do celular (C/*), o logo ocupa uma linha sozinho: `#pgAtual{min-width:260px}` (83) força a quebra, e o
  cabeçalho gasta 108 dos 844px.
- No rodapé, o botão principal em pílula quebra em três linhas e vira um oval (C/08-2, C/14-3; 319 com o raio de 9999px da
  linha 49).
- As setas do cabeçalho têm 28×34px (80), os pontos do carrossel 10px (541–543) e a alternância Mês | Ano cerca de 31px de
  altura (228).

**Evidência**: alvo de toque recomendado de 44×44px (NN/g, *Touch Target Size*), com mínimo de 24×24px no WCAG 2.5.8. A
preensão do celular varia (Hoober).

**Correção**:
```css
@media (max-width:600px){
  header{flex-wrap:nowrap;padding:8px 12px;gap:8px} .brand img{width:26px;height:26px}
  #fases{flex:1;min-width:0} #pgAtual{min-width:0;flex:1}
  #fases>button[data-pg]{width:44px;height:44px}
  .pg-nav{flex-direction:column-reverse;align-items:stretch}
  .pg-nav .btn{max-width:none;width:100%;justify-content:center;text-align:center;border-radius:14px;min-height:48px}
  .pg-nav .btn-secondary{background:none;border:0;color:var(--nl-gray-700)}
  .gf-tog button{min-height:44px} .rk-ponto::before{inset:-17px -10px}
}
```
**Prioridade**: Alta. Esforço baixo.

### 10. A tabela do fluxo sob a trajetória é ruidosa e ambígua
**Problema** (D/23):
- Em cada célula, a barra clara fica à esquerda e o valor à direita, encostado na coluna seguinte. "R$ 38.800" parece pertencer
  a 2028.
- O ícone de saco se repete em todas as células.
- As colunas têm larguras desiguais por causa do tempo comprimido.
- "Movimentações no patrim…" sai truncado (2483).
- A célula "2026" tem texto branco sobre laranja em 10px (2458–2463), cerca de 2,7:1, e o DESIGN.md proíbe branco sobre
  laranja.

**Correção**:
```js
// 2458–2463: a coluna de hoje em pêssego com um filete laranja, texto marinho em 11px
ctx.font = '600 11px "DM Sans", sans-serif';
if (hoje) { ctx.fillStyle = '#FFF3EB'; ctx.fillRect(x0, rowsTop - 20, x1 - x0, 19); ctx.fillStyle = C.orange; ctx.fillRect(x0, rowsTop - 3, x1 - x0, 2); }
ctx.fillStyle = hoje ? C.navy : 'rgba(32,52,76,.7)';
```
Nas células (2512 em diante): valor alinhado à direita da própria coluna e a barra como um filete de 3px sob o número, com 35%
de opacidade. O ícone fica só no rótulo da linha. Use o rótulo curto "Movimentações" ou aumente `PL` para 260.

**Prioridade**: Média. Esforço médio.

### 11. Orçamento: as guias cortam o texto e a etiqueta não tem contraste
**Problema**:
- Em D/08-1 e D/08-2, as guias tracejadas atravessam os textos ("DES|PESAS", "R$ 4|.800", "2|3%"), porque `.oc-guia` vai de
  cima a baixo com `z-index:2` (285).
- O texto sai truncado: "acima do recomendado (…" (272).
- A etiqueta `#FFC2B5` sobre o bronze `#A87A3A` tem cerca de 2,5:1 (274, 3370).
- No celular (C/08-1) aparecem "DESPESA…" e "PARA…".
- Os blocos de 400px saturados são o elemento mais pesado do livro.

**Correção** (sem esperar o esboço aprovado de "orçamento por toque"):
```css
.oc-guia{top:auto;bottom:0;height:18px}   /* a régua de cima já mostra a referência */
.oc-palco{height:300px} @media (max-width:760px){.oc-palco{height:260px}}
.oc-b .oc-tx small{white-space:normal}
.oc-selo.no{color:#fff}
```
Em `OC_GRUPOS`, a cor de `ajustaveis` passa a `'#8A6129'` (cerca de 5,5:1 com texto branco). Isso também resolve a questão em
aberto da cor do futuro: use `'#B8501A'` (laranja queimado, cerca de 5:1 com branco) no lugar do verde. Assim o futuro tem a
mesma cor na rosca, no relógio e no treemap.

**Prioridade**: Média. Esforço baixo.

### 12. Previdência: controles nativos e texto do gráfico pequeno demais
**Problema**:
- Em D/14-1, os cinco sliders nativos (`accent-color`, 500) têm trilho preto pesado e não combinam com os sliders do orçamento
  (D/08-2, `.oc-sl` 300–302).
- O select é nativo (501).
- O SVG tem viewBox de 560 de largura (4091) e é exibido com cerca de 420px, então os rótulos de 11px aparecem com cerca de 8px.
- O cartão do gráfico fica 40% vazio.

**Correção**: os sliders em marinho, porque são controles e não o futuro:
```css
.tb-campo input[type=range]{-webkit-appearance:none;appearance:none;height:6px;border-radius:3px;
  background:linear-gradient(90deg,var(--nl-navy-900) var(--p,50%),#E6E2DA var(--p,50%))}
.tb-campo input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid var(--nl-navy-900);box-shadow:0 2px 6px rgba(32,52,76,.2)}
.tb-campo input[type=range]::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#fff;border:3px solid var(--nl-navy-900)}
.tb-gt{font-size:14.5px} .tb-fim{font-size:14.5px}   /* cerca de 11px depois da escala */
```
`--p` deve ser atualizado no evento `input`, como no orçamento.

**Prioridade**: Média. Esforço baixo.

### 13. Movimento sem a versão calma
**Problema**:
- O cartão do objetivo cresce a partir de `scale(.62)` em 2,2s (706–708) e tem Ken Burns de 10s (705, 707).
- O confete (2786) não tem guarda de `prefers-reduced-motion`. Só existem cinco blocos de CSS (212, 252, 307, 310, 323) e uma
  checagem em JS (3482).
- O pulso do "agora" (159–160) roda para sempre em D/02-1.

O PRODUCT.md promete "só opacidade" para quem pede menos movimento. 2,2s também é lento demais para uma interface (o ideal é
menos de 300 a 500ms).

**Correção**:
```css
@keyframes cardIn{from{transform:translateY(12px) scale(.98);opacity:0}to{transform:none;opacity:1}}
.card.enter{animation-duration:.5s}
.lp-trilha li.agora .lp-tr-no{animation-iteration-count:3}
@keyframes soOpacidade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.card.enter{animation:soOpacidade .3s ease both}.card .photo img{animation:none}}
```
No JS, use `const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;` e, se for verdadeiro, não dispare o confete.

**Prioridade**: Média (acessibilidade e compromisso do PRODUCT.md). Esforço baixo.

### 14. O livro termina sem fecho
**Problema** (D/24-2, C/24-4): o livro acaba num cartão branco com um único botão "‹ A trajetória do patrimônio". O epílogo
leva o rótulo "EVOLUÇÃO PATRIMONIAL" (D/24-1). Não há simetria com a abertura em marinho.

**Correção**: a mensagem final numa faixa que espelha o hero do Propósito, com o rótulo "Para terminar" em `cabPagina`
(3344–3357) e um botão principal "Voltar ao começo".
```css
.cm-msg{background:radial-gradient(120% 140% at 100% 0%,rgba(212,160,86,.28),transparent 55%),linear-gradient(160deg,#20344C,#131F2E);
  color:#fff;border-radius:24px;padding:48px 56px;box-shadow:none}
.cm-msg p{font:400 30px/1.35 'DM Serif Display',Georgia,serif;color:#fff}
.cm-ass{color:rgba(255,255,255,.8)} .cm-msg .lp-ct{background:rgba(255,255,255,.1);color:#fff}
```
**Prioridade**: Baixa a média. Esforço baixo.

## Avaliação estética

**Tipografia.** Hoje são Sora 600, DM Sans, Montserrat (resíduo) e DM Serif Display. A Sora funciona bem nos números, mas a 600
sem espaçamento negativo dá aos títulos ar de aplicativo de fintech, e o salto do título (32px) para o corpo (12,5px a 15,5px) é
irregular. Recomendação:
- Sora 500 com -0,025em nos títulos (36px nas páginas, 44px nas capas);
- algarismos tabulares em todos os valores;
- DM Sans 15px como corpo único;
- DM Serif Display só para frases curtas e DM Serif Text para o texto corrido na voz do planejador.

Não é preciso trocar a família: o problema é a disciplina, não a escolha.

**Cor.** Marinho, laranja e creme é uma paleta eficaz e distintiva. O que falta é disciplina:
- o laranja está em cerca de 10 usos sem relação com o futuro (achado 6);
- as páginas tributárias usam até sete matizes ao mesmo tempo (D/13-1: azul, ocre, verde, vermelho, marinho, violeta e rosa);
- o pró-labore usa um azul-aço avulso `#5B7BA6` e o verde do financeiro para os dividendos (4049), quando o DESIGN.md restringe
  as cores de categoria ao patrimônio e à evolução. Use marinho e ardósia, com o vermelho só para o que sai.

**Layout.** O padrão "cartão em tudo" é o que mais aproxima o relatório de um painel de SaaS. Num relatório premium, os blocos
explicativos ("O que muda nos lançamentos" em D/11-2, "De onde vem o seu patrimônio" em D/17-2, "O que fazer") ficam direto no
papel, separados por um filete de 1px em `#ECE8E1`. O cartão branco com sombra fica para o número ou o gráfico que importa. O
resultado é menos ruído e mais ar.

**Movimento.** A cascata do Hoje e depois (204–212) é o melhor exemplo do livro: calma, uma vez só e com a versão reduzida. O
cartão do objetivo (2,2s, zoom e confete) destoa do tom "contido" do DESIGN.md.

### Onde o DESIGN.md deve mudar
1. **Usos do laranja numa lista fechada**: valor futuro, ação principal, marca de "hoje" e a etiqueta "atenção" (texto
   `#964400` sobre pêssego). O laranja nunca deve aparecer em formas grandes de estado, como a teia ou barras de imposto.
2. **Escala tipográfica fechada**: 36/44, 22, 17, 15, 13,5 e 11px, com o espaçamento dos títulos (-0,025em), o dos rótulos
   (.12em), algarismos tabulares obrigatórios e a DM Serif Text para texto longo. Montserrat proibida.
3. **Regra dos cartões**: cartão só para número ou gráfico; texto explicativo vai no papel, com filete.
4. **Regras de gráfico**: eixo de valor linear, rótulo direto no lugar de legenda distante, texto renderizado nunca abaixo de
   11px (cuidado com SVG que encolhe) e o futuro com texto branco em `#B8501A`.
5. **Raios** só de 16, 12 e 8px. A borda do conteúdo é a borda da coluna, sem recuos de 8px.
6. **Componente "faixa de abertura e fecho"** (marinho), usado no Propósito, nas capas e na última página.

## O que funciona

- **Hoje e depois** (D/04-1): o antes sempre visível, o depois em cascata e o placar "1 de 8 → 7 de 8". É claro para o leigo e
  tem a versão de menos movimento.
- **Rosca da renda e relógio do mês** (D/06-1, D/07-1): um número dominante, a legenda com valores, a referência tracejada dos
  20% e o futuro em laranja. Seguem o DESIGN.md à risca.
- **A mesma porta e a mesma saída**: o cabeçalho e o rodapé "Próximo: [título]" são iguais em todas as páginas e dizem para onde
  se vai, o que ajuda a orientação.
- **IR na mesma escala, com as mudanças em pêssego na tabela** (D/11-1, D/11-2): a comparação é honesta e se lê em segundos.
- **Composição como soma (escadas) no desktop**: é uma decisão boa e rara em relatórios financeiros.
- **Linguagem**: "vocês", "por mês", subtítulos que respondem a uma pergunta da família.

## Prioridade de implementação

### Crítico
1. Trajetória: aparecer inteira em repouso, eixo linear, rótulos diretos, altura da tabela pelo conteúdo (achado 1). Esforço
   médio.
2. Riscos: acabar com o vazio de 700px e com o corte dos vizinhos; reverter a regra "altura do mais alto" (achado 2). Esforço
   baixo.

### Alto
1. Alinhamento e raios (achado 7). Esforço baixo e efeito em todas as páginas.
2. Laranja com significado (achado 6). Esforço baixo.
3. Escala tipográfica e algarismos tabulares, sem Montserrat (achado 5). Esforço médio.
4. Frase do Propósito: corte de texto, borda mais leve, sem desfoque, ajuste no celular (achado 4). Esforço baixo.
5. Aberturas de capítulo e o erro de rótulo da linha 3554 (achado 3). Esforço médio.
6. Celular: escadas, cabeçalho, rodapé e alvos de toque (achados 8 e 9). Esforço baixo.

### Médio
1. Tabela do fluxo (achado 10).
2. Orçamento: guias, contraste e a cor do futuro (achado 11).
3. Sliders e SVG da previdência (achado 12).
4. Menos movimento (achado 13).

### Baixo
1. Fecho em faixa marinho (achado 14).

## Fontes

- NN/g, The Aesthetic-Usability Effect: https://www.nngroup.com/articles/aesthetic-usability-effect/ (o visual cuidado aumenta
  a tolerância e a confiança).
- Lindgaard, Fernandes, Dudek e Brown (2006), "Attention web designers: You have 50 milliseconds to make a good first
  impression!", *Behaviour & Information Technology* 25(2).
- Fogg et al. (2003), "How do users evaluate the credibility of Web sites?", Stanford Persuasive Technology Lab (a aparência do
  design foi o critério de credibilidade mais citado).
- NN/g, Consistency and Standards: https://www.nngroup.com/articles/consistency-and-standards/
- NN/g, Visual Hierarchy: https://www.nngroup.com/articles/visual-hierarchy-ux-definition/
- NN/g, Horizontal Attention Leans Left: https://www.nngroup.com/articles/horizontal-attention-leans-left/
- NN/g, Designing Effective Carousels: https://www.nngroup.com/articles/designing-effective-carousels/
- NN/g, Touch Target Size: https://www.nngroup.com/articles/touch-target-size/
- Steven Hoober (2013), "How Do Users Really Hold Mobile Devices?", UXmatters.
- Edward Tufte (1983), *The Visual Display of Quantitative Information* (lie factor e relação dados-tinta).
- Cleveland e McGill (1984), "Graphical Perception", *JASA* 79(387).
- Stephen Few, *Show Me the Numbers* (rótulo direto no lugar de legenda).
- Matthew Butterick, *Practical Typography* (medida de linha e espaçamento).
- WCAG 2.2: 1.4.3 (contraste), 1.4.11 (contraste de componentes), 2.5.8 (tamanho de alvo) e 2.3.3 (animação por interação).

## Uma grande vitória

**Mostrar a trajetória do patrimônio inteira e verdadeira.** Na linha 2296, `revealWeek()` deve devolver `NW` quando a
reprodução não começou. Na 2294, o eixo Y vira linear. Os rótulos diretos substituem a legenda do cabeçalho, e a área da tabela
passa a ser medida pelo conteúdo. É a tela que o planejador apresenta como clímax e para onde o cliente volta sozinho. Hoje ela
diz "quase não cresce" num gráfico apagado. Com cerca de 20 linhas de mudança, passa a mostrar com nitidez e honestidade o que
o plano entrega, e é isso que um cliente de private banking espera ver.
