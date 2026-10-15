# Revisão de UI/UX: Portal do consultor (`tela-consultor.html`), 15/10/2026

Feita com a definição do agente `ui-ux-designer` (Madina Gbotoe, CC BY 4.0), a pedido do usuário, com o objetivo "uma
aplicação que passe a impressão de profissionalismo e elegância". O revisor viu as capturas das 10 páginas do portal (1440×900,
com o exemplo completo, em trechos `-1`, `-2`, ...), leu o CSS e o HTML, o `PRODUCT.md`, o `DESIGN.md` e as decisões do
`PENDENCIAS.md`. As capturas não estão no repositório: refaça-as com `ux/capturas.cjs` (os nomes citados são os que ele gera).
Os números de linha são os de `tela-consultor.html` no commit `dfec810`. **Nada foi aplicado ainda.**

## Veredito

O esqueleto do portal é bom. A barra lateral separa os três momentos do trabalho. Cada página abre com "passo X de 9" e termina
em "Próximo: …". O sumário do patrimônio é uma soma, e o tributário mostra de onde vem cada número ("do Fluxo de caixa · mudar
no Fluxo"). O que tira a sensação de profissionalismo e elegância está em outro lugar, e é quase tudo CSS.

- **A tipografia saiu do sistema.** O texto corrido está em Montserrat, não na DM Sans do `DESIGN.md`. Com a Sora e a DM Sans,
  são três sem-serifas geométricas na mesma tela.
- **Há laranja demais.** Em cada tela ele aparece em 8 a 15 lugares, e o texto branco sobre laranja não passa no contraste. Com
  isso, a Regra do Horizonte deixa de valer.
- **Os cinzas de rótulos e textos de apoio não passam no contraste.** Ficam entre 2:1 e 4:1.
- **Não há foco visível** em nenhum controle.
- **Há cinco quebras de layout visíveis e uma dúzia de textos cortados.**

Na frente do cliente, esses defeitos pesam mais que qualquer escolha estética. Pela pesquisa, a credibilidade se julga em cerca
de 50 ms e, antes de tudo, pela aparência (Lindgaard et al., 2006; Fogg et al., 2003). A boa notícia é que dá para corrigir a
maior parte num patch só das linhas 9–120 do `<style>`.

## Problemas críticos (em ordem de impacto)

### 1. Foco invisível: o consultor que usa Tab não sabe onde está
**Problema**: `input:focus{outline:none;border-color:var(--nl-orange-500)}` (l. 56) troca o anel de foco por uma borda laranja
de 1px, com 2,66:1 sobre o branco. O WCAG 1.4.11 pede 3:1. O arquivo não tem nenhum `:focus-visible`. Os itens da barra
lateral são `<a role="button" tabindex="0">` (l. 529–540) e não têm foco visível. Os `.btn`, `.chipadd`, `.rkc-aba` e
`.lf-modo` também não.
**Evidência**: WCAG 2.2, critérios 2.4.7 (foco visível), 1.4.11 (contraste de componentes) e 2.4.11 (foco não encoberto). A
heurística 1 de Nielsen é a visibilidade do estado do sistema.
**Impacto**: quem digita muitos dados vai de campo em campo com Tab. Sem foco visível, o valor cai no campo errado, e esse é
exatamente o erro que o portal precisa evitar.
**Correção**:
```css
/* l. 56 */
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--nl-navy-900);box-shadow:0 0 0 3px rgba(250,122,53,.35)}
:focus-visible{outline:2px solid var(--nl-navy-900);outline-offset:2px;border-radius:inherit}
aside :focus-visible{outline-color:#fff}
html{scroll-padding-top:88px} /* para a faixa fixa do item 10 não encobrir o campo focado */
```
No item ativo da barra lateral, acrescente `aria-current="page"` no JS que liga a classe `.on`.
**Prioridade**: crítica. O esforço é baixo.

### 2. Cinzas abaixo do contraste: o portal parece "desbotado"
**Problema**: os rótulos usam `#8a8a8a` a 11,5px (l. 54), com 3,45:1. A frase da página usa `#7d7d7d` (l. 411), com cerca de
4,0:1 sobre o creme. Têm o mesmo problema as dicas `#8f8f8f` (l. 52), os rótulos dos indicadores `#8d8d8d` (l. 45),
`.pc-tile span` (l. 439), `.muted #9a9a9a` (l. 294), `.bloco .sub`/`.dir` (l. 414–415) e todos os `small` em `#9a9a9a` das
tabelas (l. 242, 335, 360). Aparece em todas as capturas. Os casos mais claros são os rótulos de `consultor-01-cliente-1.png`
e `consultor-07-tributario-3.png` e a linha de equivalências de `consultor-08-premissas.png`.
**Evidência**: WCAG 1.4.3 pede 4,5:1. O artigo da NN/g "Low-Contrast Text Is Not the Answer" mostra que o cinza claro passa
por elegante, mas diminui a confiança e a leitura. O próprio `DESIGN.md` já define o Cinza Legenda `#6B6A66` (5,4:1) para isso,
e o portal não o usa.
**Correção**:
```css
:root{ --nl-legenda:#6B6A66; --nl-linha:#F1EEE8; }
label{font:500 12px 'DM Sans',sans-serif;color:var(--nl-legenda)}                       /* l. 54 */
section.page>.hint{font:400 15px/1.6 'DM Sans',sans-serif;color:var(--nl-gray-700);max-width:720px} /* l. 411 */
section>.hint,.bloco .sub,.bloco h3 .dir,.muted,.chip span,.pc-tile span,
tbody td.txt small,.pr-tab td small,.lf-tab td small,.goalhead .when{color:var(--nl-legenda)}
```
**Prioridade**: crítica. O esforço é baixo (troca de tokens).

### 3. Cinco quebras de layout visíveis
São os sinais mais amadores do portal, e nenhum é de gosto.

1. **Faixa verde do fluxo com buracos e um "." solto** (`consultor-02-fluxo-1.png`). A causa é `.fxcap{display:flex;gap:14px}`
   (l. 130). Com ela, cada pedaço de texto e cada `<b>` vira um item do flex, e o conteúdo vem solto em l. 2553.
2. **"Antes de apresentar, confira:"** desmontado: "Objetivos" numa linha, um "." solto e ": Casa própria…" na linha seguinte
   (`consultor-06-liberdade-3.png`). É a mesma causa, em l. 3073.
3. **Tabela-resumo dos objetivos empurrada para a direita**, com "+ Adicionar objetivo" flutuando no meio da altura
   (`consultor-05-objetivos-2.png` e `-3.png`). O `#goalSum` está dentro de `.rowend` (l. 631, `display:flex`, l. 86).
4. **Tabela de experiência com investimentos mais estreita que o cartão.** As barras do cabeçalho param em ~1200px e o cartão
   vai até ~1355px (`consultor-01-cliente-2.png`). A causa é `.ex-t{max-width:900px}` (l. 506).
5. **Terceiro bem desalinhado** (`consultor-03-patrimonio-2.png`). "Titularidade: Do casal" empilha o "% de Ana" e empurra
   Bem, Valor e Saldo para baixo, e sobra um vazio no alto à esquerda. A causa é `.pc-linha.cinco` (l. 451) com
   `align-items:end`.

**Evidência**: heurística 4 de Nielsen (consistência). A NN/g mostra que a estética percebida aumenta a tolerância a problemas,
e um defeito visível tem o efeito inverso ("aesthetic-usability effect").
**Correção**:
```js
// l. 2553 e l. 3073: o texto num bloco só
`<div class="fxcap…"><div class="fxcap-txt">Capacidade de poupança: <b>…</b> …</div><button …></button></div>`
```
```css
.fxcap-txt{flex:1;min-width:0}
.ex-t{max-width:none}                                  /* l. 506 */
```
```html
<!-- l. 631: o resumo sai de .rowend e vem antes, em largura total -->
<div id="goalSum"></div>
<div class="rowend"><button class="btn btn-tertiary" id="btnAddGoal">+ Adicionar objetivo</button></div>
```
No bem do casal, o "% de Ana" vai para uma segunda linha (como `.pc-fin`) em vez de se empilhar sob o select. Assim a linha
mantém `align-items:end`.
**Prioridade**: crítica. O esforço é baixo.

### 4. Textos e valores cortados: o consultor não confere o que digitou
**Problema**:
- `consultor-03-patrimonio-1.png`: "Investimen", "do ca", "Previdênci", "Marc", "Icatu Seguros (VGE". A tabela de 4 colunas
  está espremida em meia largura (`.pc-dois`, l. 481).
- `consultor-02-fluxo-1.png`: "MOVIMENTAÇÕES NO PA…", a coluna de hoje "/09 a 03/" e a última "0/05 a 03/0".
- `consultor-02-fluxo-2.png`: o placeholder termina em "…do Fluxo de cai›".
- `consultor-06-liberdade-1.png`: "vitalíci".

**Evidência**: heurística 5 de Nielsen (prevenir erros). Um valor cortado num campo de dinheiro ou de titularidade é um erro que
não se vê.
**Impacto**: entre 1366 e 1440 px, a largura real do consultor, isso acontece sempre, e não só no exemplo.
**Correção**:
```css
@media (max-width:1560px){ .pc-dois{grid-template-columns:1fr} }       /* l. 481 */
.fx-l{flex:0 0 300px}                                                  /* l. 152 */
.fl.grp{text-transform:none;letter-spacing:0;font:600 12.5px Sora,sans-serif} /* l. 160 */
.pr-tab input[type=number]{min-width:84px}                             /* l. 336 */
```
O placeholder da l. 2212 fica mais curto: `'vazio: média de 12 meses (' + fmt(media12()) + ')'`. No cabeçalho do fluxo, mostre
só o mês quando a coluna tiver menos de 80px, e o intervalo de datas aparece ao passar o mouse.
**Prioridade**: crítica. O esforço é baixo a médio.

### 5. Montserrat no corpo e hierarquia diferente do sistema
**Problema**: `@import …Montserrat` (l. 9), `body{font-family:'Montserrat'}` (l. 19) e `textarea{font-family:Montserrat}`
(l. 57). Na mesma tela, o título está em Sora 700, os rótulos em DM Sans e as frases e dicas em Montserrat
(`consultor-01-cliente-1.png`: "Quem é o cliente, quem depende dele…"; `consultor-04-riscos-1.png`: a linha da regra). Também
divergem do `DESIGN.md`:
- título 700/26px (l. 410), quando o Display é 600;
- título do cartão 14,5px (l. 413), quando o Title é 17px;
- rótulo do topo em laranja (l. 409), quando o Label é marinho.

**Evidência**: Montserrat, Sora e DM Sans são geométricas parecidas o bastante para não fazer contraste e diferentes o bastante
para parecer descuido. O Montserrat é uma das fontes que mais denunciam um modelo genérico.
**Correção**:
```css
/* l. 9 */ @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
/* l. 19 */ body{…;font-family:'DM Sans',system-ui,sans-serif;font-size:14px}
/* l. 57 */ textarea{…;font-family:inherit;font-size:13.5px;color:var(--nl-navy-900)}
section.page>.kicker{font:600 11px 'DM Sans',sans-serif;letter-spacing:.14em;color:var(--nl-navy-900)} /* l. 409 */
section.page>h2{font:600 30px/1.15 Sora,sans-serif;letter-spacing:-.015em}                           /* l. 410 */
.bloco h3{font:600 16px Sora,sans-serif}                                                             /* l. 413 */
```
**Prioridade**: alta, com impacto altíssimo na elegância. O esforço é baixo.

### 6. Laranja em todo lugar e texto branco sobre laranja
**Problema**: só em `consultor-01-cliente-1.png` e `-2.png` o laranja aparece no item ativo da barra lateral, no botão
"Apresentar ao cliente", no rótulo do topo, em três "obrigatório", em dois "?" de ajuda, em "+ dependente" e em "Próximo". No
fluxo somam-se ainda a coluna de hoje, os "+" redondos, as pílulas "1 depois ▶" e as marcas nas células. Na prática:
- `aside nav a.on` (l. 32) e `.btn-primary` (l. 80) põem texto branco sobre `#FA7A35`, com 2,66:1. O `DESIGN.md` proíbe isso
  de forma explícita.
- `.btn-tertiary` (l. 82), que é todo "Próximo" e todo "+ Adicionar", tem `#E06600` sobre pêssego, com 3,17:1.
- `label em` (l. 97) tem 10,5px laranja, abaixo do mínimo de 11px do sistema.
- `details.ajuda>summary` (l. 417) e `.link` (l. 206) são texto pequeno em laranja.

**Evidência**: a Regra do Horizonte do próprio `DESIGN.md` reserva o laranja para o que está à frente e para a ação principal.
Quando tudo é laranja, nada é a ação principal (Lei de Hick e o efeito von Restorff, que só funciona com um destaque).
**Correção**: uma pílula laranja por tela, o "Apresentar ao cliente". O "Próximo" vira marinho, e o resto vai para marinho com
sublinhado.
```css
aside nav a.on{background:rgba(255,255,255,.10);color:#fff;box-shadow:inset 3px 0 0 var(--nl-orange-500)} /* l. 32 */
.btn-primary{background:var(--nl-orange-500);color:var(--nl-navy-900)}                                   /* l. 80: 4,8:1 */
.btn-tertiary{background:var(--nl-peach-100);color:var(--nl-navy-900)}                                   /* l. 82 */
.pagenav .btn{background:var(--nl-navy-900);color:#fff;border-radius:9999px;padding:10px 20px}
label em{color:var(--nl-legenda);font-weight:500;font-size:11px}                                         /* l. 97 */
.link,details.ajuda>summary{color:var(--nl-navy-900);text-decoration:underline;
  text-decoration-color:rgba(250,122,53,.7);text-underline-offset:3px}                                   /* l. 206, 417 */
```
Isto não contraria a decisão do laranja no status intermediário: esse uso continua, no item 8.
**Prioridade**: alta. O esforço é baixo.

### 7. Tabelas com barras marinho pesadas, cinza sobre marinho e checkbox azul do navegador
**Problema**:
- `thead th{background:var(--nl-navy-900)}`, com pontas arredondadas (l. 66–67), aparece em todas as tabelas: 2 em
  Patrimônio, 2 em Liberdade e 2 em dupla altura no Tributário. Com a barra lateral também marinho, o portal ganha cara de
  painel administrativo.
- Daí sai um defeito real: `.ex-t thead th` e `.dg-t thead th` (l. 508 e 511) pintam o texto de `#8a8a8a` sobre esse marinho. É
  o "ANA / ENTENDE…" de `consultor-01-cliente-2.png` e o "PRESENTE / FUTURO" de `consultor-09-apresentacao-1.png`, com 3,7:1 a
  11px.
- Os checkboxes e o rádio "Sim/Não" estão no azul padrão do Chrome (`consultor-01-cliente-1.png` e `-2.png`). Só os sliders
  têm `accent-color`.

**Correção**:
```css
thead th{background:transparent;color:var(--nl-navy-900);font:600 11px 'DM Sans',sans-serif;text-transform:uppercase;
  letter-spacing:.08em;padding:8px 10px;border-bottom:1.5px solid var(--nl-navy-900)}                     /* l. 66 */
thead th:first-child,thead th:last-child{border-radius:0}                                                  /* l. 67 */
.ex-t thead th,.dg-t thead th{color:var(--nl-navy-900)}                                                    /* l. 508, 511 */
input[type=checkbox],input[type=radio]{accent-color:var(--nl-navy-900);width:16px;height:16px}
```
**Prioridade**: alta. O esforço é baixo.

### 8. Três sistemas de etiqueta de status, e o dos objetivos falha no contraste
**Problema**:
- `.badge` (l. 279–281) põe texto branco sobre cor cheia: "Alcançável" com 3,4:1, "Alcançável com ajustes" com 2,66:1 e
  "Requer revisão" com 4,4:1, tudo a 11px (`consultor-05-objetivos-2.png`).
- Nos riscos, `.st-c` (l. 111) usa fundo claro e texto escuro, que é o padrão do `DESIGN.md` (`consultor-04-riscos-1.png`).
- No financiamento, `.pill-st` (l. 483–484) é um terceiro tamanho (`consultor-03-patrimonio-2.png`).
- Os valores dos indicadores `.chip b.good/.low` (l. 47) usam `#2E9E5B` e `#D64545` como texto, com 3,4:1.

**Correção**: um componente só, com o laranja do status intermediário mantido conforme a decisão.
```css
.badge,.st-c,.pill-st{display:inline-block;font:600 11px 'DM Sans',sans-serif;padding:3px 10px;border-radius:9999px;white-space:nowrap}
.badge.ok,.st-c.ok,.pill-st.ok{background:#E3F3E9;color:#22794A}
.badge.adj,.st-c.atencao{background:#FFF3EB;color:#964400}
.badge.risk,.st-c.critico,.pill-st.critico{background:#FBE6E6;color:#B53434}
.chip b.good{color:#22794A} .chip b.low{color:#B53434}                                                    /* l. 47 */
```
**Prioridade**: alta. O esforço é baixo.

### 9. A planilha do fluxo: números quase invisíveis e centralizados, controles minúsculos
**Problema** (`consultor-02-fluxo-1.png` e `-2.png`):
- O valor repetido do anterior usa `.fc{color:#b9b7b2}` (l. 175), com 1,98:1. É a maior parte das células.
- As linhas de objetivo estão em itálico `#a9a7a2` (l. 183).
- Os números estão centralizados (`justify-content:center`, l. 175) e sem algarismos tabulares, o que atrapalha comparar ordens
  de grandeza.
- Há textos de 9,5–10px (l. 159, 167 e 189), abaixo do mínimo de 11px do sistema.
- O "+" tem 19px (l. 166), abaixo dos 24px do WCAG 2.5.8.
- A coluna de hoje tem texto branco sobre laranja (l. 190).

**Evidência**: Lei de Jakob. O consultor "trabalha com planilhas" (`PRODUCT.md`), e no Excel o número fica alinhado à direita,
com algarismos de mesma largura. Também WCAG 1.4.3 e 2.5.8.
**Correção**:
```css
.fc{justify-content:flex-end;padding:0 8px;font:500 12px 'DM Sans',sans-serif;font-variant-numeric:tabular-nums;color:var(--nl-legenda)} /* l. 175 */
.fc.step,.fc.exc{color:var(--nl-navy-900);font-weight:600}
.fxrow.ro .fc{color:var(--nl-legenda);font-style:normal}                                                       /* l. 183 */
.fxhead .fc.hoje{background:#2C4563;box-shadow:inset 0 -3px 0 var(--nl-orange-500)}                            /* l. 190 */
.fxhead .fc small,.fl .tag{font-size:10.5px} .fl .jump{font-size:11px;padding:3px 8px}                           /* l. 189, 159, 167 */
.fl .plus{width:24px;height:24px;flex-basis:24px;background:#fff;color:var(--nl-navy-900);border:1px solid var(--nl-gray-300)} /* l. 166 */
```
A distinção "muda aqui" e "repetido" continua, agora pelo peso e pela cor marinho e cinza-legenda, e não por um cinza ilegível.
Uma observação: a decisão de 07/10 centralizou os números nas tabelas comparativas da área do cliente. Aqui o revisor recomenda
a direita só na planilha do portal, que é um instrumento de digitação, e não uma comparação lado a lado. Confira se aquela
decisão também valia para cá. A DM Sans servida pelo Google deve ter `tnum`; se não tiver, a regra simplesmente não faz efeito.
**Prioridade**: alta, porque é a tela onde o consultor passa mais tempo. O esforço é médio.

### 10. A entrada muda de altura e a gravação não aparece
**Problema**: em Fluxo, Objetivos e Liberdade, a faixa de indicadores empurra o título para y≈137. Em Cliente, Patrimônio e
Riscos, ele fica em y≈60 (compare `consultor-02-fluxo-1.png` com `consultor-03-patrimonio-1.png`). É a violação da regra
"Same Door" do `DESIGN.md`, e a causa é `.pagehead` com conteúdo opcional (l. 549, 39/42 e 407). O portal grava sozinho
(`PRODUCT.md`), mas nada na tela diz isso. A faixa verde do fluxo ainda repete os dois primeiros indicadores logo abaixo deles.
**Evidência**: heurística 1 de Nielsen (visibilidade do estado do sistema). Sem a confirmação de que gravou, o consultor perde
confiança, e diante do cliente isso aparece.
**Correção**: uma faixa fixa e sempre presente, com a gravação à esquerda e os indicadores à direita quando a página os tiver.
```css
.pagehead{display:flex;align-items:center;gap:16px;min-height:64px;margin:0 0 12px;position:sticky;top:0;z-index:5;background:var(--nl-cream-50)} /* l. 38/406 */
.pagehead .chips{position:static;margin:0 0 0 auto;padding:8px 0}                                                                                 /* l. 39/407 */
.gravado{font:500 12px 'DM Sans',sans-serif;color:var(--nl-legenda)} .gravado::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:#22794A;margin-right:6px;vertical-align:1px}
```
```html
<div class="pagehead"><span class="gravado" id="gravado">Gravado às 14:32</span><div class="chips" id="chips"></div></div>
```
Na faixa do fluxo (l. 2553), quando os indicadores estiverem visíveis, mostre só o aviso "Os aportes não cabem".
**Prioridade**: alta. O esforço é baixo.

### 11. Campos derivados parecem editáveis e o padrão parece valor digitado
**Problema**: em `consultor-04-riscos-1.png`, "Sim: 1, na página Cliente" e "CLT … na página Cliente" são `<input disabled>`
(l. 4117–4118) idênticos aos editáveis, porque não existe estilo `:disabled`. "vazio: R$ 12.678 do fluxo", "vazio: D+0 da
liquidez", "quitado" e "até quando paga" (`consultor-03-patrimonio-2.png`) são placeholders sem estilo próprio (não há
`::placeholder`) e se leem como valores.
**Evidência**: NN/g, "Placeholders in Form Fields Are Harmful". O Princípio 3 do `PRODUCT.md` diz que o consultor nunca fica em
dúvida sobre a ferramenta.
**Correção**:
```css
input::placeholder,textarea::placeholder{color:var(--nl-legenda);font-style:italic;font-weight:400;opacity:1}
input:disabled,select:disabled{background:transparent;border:1px dashed var(--nl-gray-300);box-shadow:none;color:var(--nl-gray-700);cursor:default}
```
O melhor, porém, é reaproveitar o padrão que já funciona no tributário: o valor como texto e, embaixo, "da página Cliente ·
editar" (`.tbc-fx`, l. 447, em `consultor-07-tributario-1.png`).
**Prioridade**: média-alta. O esforço é baixo.

### 12. Barra lateral: marca provisória, números que parecem tarefas pendentes e ruído diante do cliente
**Problema** (`consultor-01-cliente-1.png`):
- A marca é um ponto laranja com "Nord Liberta" (l. 23–24, 524), embora o ícone oficial exista em `marca/nord-icone-64.png` e
  já seja o favicon (l. 6).
- Os números dos passos estão a 10px (l. 140).
- O verde de "feito" segue critérios diferentes por página (l. 2215–2218): Riscos, Liberdade e Premissas só ficam verdes depois
  de visitadas. Com o exemplo completo, 4, 6, 8 e 9 aparecem apagados, e diante do cliente parece um checklist inacabado.
- "+ Novo cliente" e "ver exemplo" disputam com o nome do cliente.

**Correção**:
```html
<div class="brand"><img src="marca/nord-icone-64.png" alt="" width="22" height="22">Nord Liberta</div>
```
```css
aside .brand img{border-radius:6px}
aside nav a i{font:600 11px 'DM Sans',sans-serif;border:0;opacity:1;color:rgba(255,255,255,.4)}    /* l. 140 */
aside nav a.feito i{background:transparent;color:#8FD9AE;font-size:0}                                /* l. 100 */
aside nav a.feito i::before{content:'✓';font-size:12px}
```
O "passo X de 9" já está no rótulo do topo, então o número na barra lateral pode sair. Leve "Novo cliente" e "ver exemplo"
para um menu "⋯" ao lado do nome.
**Prioridade**: média. O esforço é baixo.

### 13. Liberdade financeira: sliders nativos e barras em tons pastel
**Problema**: os sliders usam `accent-color` (l. 346). O Chrome pinta a parte não preenchida quase de preto, e os do período
vêm acinzentados por `opacity:.5`, o que dá dois visuais (`consultor-06-liberdade-1.png` e `-2.png`). As barras "De onde vem"
usam `CORES_RENDA` (l. 2832): lilás, verde-água e areia, fora da paleta. É o mesmo tipo de "cor infantil" que o usuário já
recusou no treemap do orçamento, que ficou com cores sóbrias.
**Correção**:
```js
const CORES_RENDA = ['#B7C5D6', '#DCE3EC', '#D9C7A6', '#9FB1C7', '#E6DCCB', '#C9D4E2', '#CDBB98']; // l. 2832, texto marinho passa em todas
```
```css
.lf-sl input[type=range],.lf-r{-webkit-appearance:none;appearance:none;height:4px;border-radius:9999px;
  background:linear-gradient(to right,var(--nl-orange-500) var(--p,50%),#E6E3DD var(--p,50%))}
.lf-sl input[type=range]::-webkit-slider-thumb,.lf-r::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;
  background:#fff;border:2px solid var(--nl-navy-900);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:grab}
.lf-sl input[type=range]::-moz-range-thumb,.lf-r::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid var(--nl-navy-900)}
.lf-r.herdado{opacity:1;--p:0%}
```
No JS, no `input` de cada slider: `el.style.setProperty('--p', (el.value - el.min) / (el.max - el.min) * 100 + '%')`. O laranja
do preenchimento é renda futura, então a Regra do Horizonte é respeitada.
**Prioridade**: média. O esforço é baixo.

### 14. O resultado fica escondido numa frase cinza
**Problema**:
- No tributário, "economia de R$ 3.043 por ano", "R$ 34.990", "R$ 36.000" e "ganho de R$ 167.815" estão no fim de frases em
  caixa creme (`consultor-07-tributario-1.png` a `-3.png`).
- Na regra dos riscos, a conta é uma linha corrida (`consultor-04-riscos-1.png`).
- "Ver na tela do cliente" aparece 4 vezes no tributário, no alto à direita nos riscos e embaixo à esquerda no Patrimônio.

**Evidência**: a regra "Numbers Speak Sora" do `DESIGN.md` e o padrão de leitura em F (NN/g): o número que é o assunto do bloco
precisa ser a primeira coisa vista.
**Correção**: uma linha de resultado reutilizável, com o link para o cliente sempre no mesmo lugar (`.bloco h3 .dir`, l. 414).
```html
<div class="res"><div class="res-n"><span>Economia por ano</span><b>R$ 3.043</b></div>
  <p>Imposto devido em 2026: hoje R$ 29.337 · recomendado R$ 26.295</p></div>
```
```css
.res{display:flex;align-items:center;gap:22px;border-top:1px solid var(--nl-linha);padding-top:14px;margin-top:14px}
.res-n span{display:block;font:600 11px 'DM Sans',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--nl-navy-900)}
.res-n b{font:600 24px Sora,sans-serif;color:var(--nl-navy-900);font-variant-numeric:tabular-nums}
.res p{font-size:13px;color:var(--nl-legenda);line-height:1.5;margin:0}
```
**Prioridade**: média. O esforço é médio.

### 15. Contornos tracejados e estado vazio sem desenho
**Problema**: os botões "+ Valorização ao ano", "+ Valorização pontual" e "+ Venda" usam `.chipadd` tracejado (l. 396), e são
nove por página (`consultor-03-patrimonio-2.png`). Propostas vazias mostram uma frase cinza centralizada numa caixa tracejada
(`.goal-empty`, l. 134, em `consultor-10-propostas.png`). O tracejado se lê como "rascunho".
**Correção**:
```css
.chipadd{border:1px solid var(--nl-gray-300);color:var(--nl-navy-900)}                                        /* l. 396 */
.goal-empty{border:0;background:#fff;box-shadow:var(--shadow-card);border-radius:16px;padding:28px 32px;text-align:left;color:var(--nl-gray-700)} /* l. 134 */
```
No vazio de Propostas: um título curto em Sora ("Nenhuma proposta por enquanto"), uma linha explicando como o cliente propõe e
o link "Ver como o cliente vê ↗".
**Prioridade**: baixa. O esforço é baixo.

## Avaliação estética

**Tipografia**: hoje são Sora, DM Sans e Montserrat. A Sora com a DM Sans é um bom par e deve ficar. Sai o Montserrat (item 5),
e os títulos passam a 600 em vez de 700, porque a Sora 700 a 26px fica "startup". Um detalhe que melhora a passagem para a área
do cliente: no bloco Propósito de `consultor-05-objetivos-1.png`, mostre a frase em DM Serif Display, como o cliente vai vê-la,
e não em texto comum numa caixa creme.

**Cor**: o marinho com o laranja tem personalidade e não é genérico. O problema é a distribuição. A proporção alvo é cerca de
75% creme e branco, 20% marinho (barra lateral, títulos e números) e menos de 5% laranja (a ação principal e o futuro). Os
estados usam sempre as versões de texto (`#22794A`, `#B53434`, `#964400`).

**Layout**: há cartões brancos sobre creme e as bordas se alinham, então a base é boa. Os tokens, porém, derivaram:
- cantos de 12px em `section` (l. 49), 14px em `.bloco` (l. 412) e 16px no `DESIGN.md`;
- campos com 8px (l. 55), contra 11px de "control" no sistema;
- espaçamentos de 14, 16, 18, 20 e 22px misturados.

A proposta é fixar cartão 16px, campo 10px e espaços de 8, 12, 16, 24 e 32. A tela de Apresentação
(`consultor-09-apresentacao-1.png` a `-4.png`) é um cartão só, com mais de 25 campos de URL. Fica mais leve com um capítulo por
cartão.

**Movimento**: as transições de 0,15s são adequadas. Não há `prefers-reduced-motion` no portal, ao contrário do que o
`PRODUCT.md` pede. O que mais falta é feedback: o "Gravado às…" do item 10 e um realce breve (por exemplo
`background:#FFF3EB`, 600ms) na célula do fluxo que acabou de mudar.
```css
@media (prefers-reduced-motion:reduce){ *{transition:none!important;animation:none!important} .btn:active{transform:none} }
```

**O que o `DESIGN.md` deveria mudar**: hoje ele descreve só a área do cliente ("densidade de relatório lido com calma, não de
painel de operação"), e o portal é um painel de operação. Falta uma seção "Modo ferramenta (portal)" com:
- corpo 14px e rótulo 12px em Cinza Legenda;
- campos com canto de 10px, foco (contorno marinho mais halo laranja de 3px, que não é sombra de elevação e não fere a regra
  Soft Lift), placeholder em itálico e estado `:disabled`;
- cabeçalho de tabela claro, com filete marinho;
- planilha com números à direita e algarismos tabulares;
- uma pílula laranja por tela no portal ("Apresentar ao cliente"), com "Próximo" em marinho;
- uma paleta para categorias de gráfico (`CORES_RENDA`).

## O que funciona

- **Os três momentos na barra lateral** (dados do cliente, planejamento, com o cliente) seguem a ordem real do trabalho. Isso
  diminui a carga de lembrar onde cada coisa está (reconhecimento em vez de memória).
- **"Passo X de 9" com "Próximo: nome da página"** orienta bem, sem precisar de uma barra de progresso.
- **A origem de cada número aparece no tributário** ("do Fluxo de caixa: Salário da Ana · mudar no Fluxo"). É o melhor padrão
  do portal e traduz o "uma variável num lugar só". Vale levar para Riscos (item 11).
- **Os riscos usam abas com bolinha e o nome do estado.** O estado não depende só da cor (WCAG 1.4.1), e o 38% é um número
  dominante, como nas referências de painel do usuário.
- **Os blocos do patrimônio somam até o total em marinho**, o que respeita a regra de mostrar soma e não proporção.
- **As explicações longas ficam recolhidas em "?"** (revelação progressiva). As páginas ficaram mais limpas que na versão
  "poluída" de 02/10.

## Prioridade de implementação

### Crítica (primeiro)
1. Foco visível (item 1). Garante a digitação sem erro e o WCAG. Esforço baixo.
2. Contraste dos cinzas (item 2). Afeta todas as telas. Esforço baixo.
3. As cinco quebras de layout (item 3). São o sinal mais visível de amadorismo. Esforço baixo.
4. Truncamentos entre 1366 e 1440 px (item 4). Evitam erro em valores e titularidade. Esforço baixo a médio.

### Alta (logo em seguida)
1. Tirar o Montserrat e acertar a hierarquia (item 5). É o maior ganho de elegância por linha mudada.
2. Disciplina do laranja (item 6). Devolve o sentido de "ação principal" e corrige o contraste.
3. Cabeçalhos de tabela claros e checkbox na cor da marca (item 7).
4. Etiqueta de status única (item 8).
5. Planilha do fluxo legível (item 9).
6. Faixa fixa no topo com "Gravado às…" (item 10).

### Média
1. Campos derivados e placeholders (item 11).
2. Barra lateral (item 12).
3. Sliders e cores da Liberdade (item 13).
4. Resultado em destaque (item 14).
5. Contornos tracejados e estado vazio (item 15). Junto: tokens de canto e espaçamento, `prefers-reduced-motion` e a seção
   "Modo ferramenta" no `DESIGN.md`.

## Fontes

- Lindgaard, G. et al. (2006). "Attention web designers: You have 50 milliseconds to make a good first impression!"
  *Behaviour & Information Technology*, 25(2). A impressão visual se forma em cerca de 50 ms.
- Fogg, B. J. et al. (2003). "How Do Users Evaluate the Credibility of Web Sites?" Stanford Persuasive Technology Lab. A
  aparência foi o critério de credibilidade mais citado (46%).
- NN/g, "The Aesthetic-Usability Effect": https://www.nngroup.com/articles/aesthetic-usability-effect/
- NN/g, "Low-Contrast Text Is Not the Answer": https://www.nngroup.com/articles/low-contrast/
- NN/g, "Placeholders in Form Fields Are Harmful": https://www.nngroup.com/articles/form-design-placeholders/
- NN/g, "10 Usability Heuristics" (1: estado do sistema; 4: consistência; 5: prevenção de erros):
  https://www.nngroup.com/articles/ten-usability-heuristics/
- NN/g, "F-Shaped Pattern of Reading on the Web": https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
- WCAG 2.2: 1.4.3 (contraste de texto, 4,5:1), 1.4.11 (componentes, 3:1), 1.4.1 (cor como único indicador), 2.4.7 (foco
  visível), 2.4.11 (foco não encoberto), 2.5.8 (alvo mínimo de 24×24 px).
- Os documentos do próprio projeto: `DESIGN.md` (Regra do Horizonte, "Numbers Speak Sora", "Same Door", tokens de cor),
  `PRODUCT.md` (Princípio 3) e as decisões de `PENDENCIAS.md` (o laranja do status intermediário foi mantido; as cores sóbrias
  do orçamento são o precedente do item 13; os números centralizados de 07/10 são citados no item 9).

## Uma grande vitória

**Um único patch de tokens nas linhas 9–120 do `<style>`.** Ele troca o Montserrat pela DM Sans, os cinzas pelo `#6B6A66`, o
texto branco e laranja das ações por marinho, o cabeçalho de tabela por um filete claro e o foco por anel marinho com halo
laranja, e unifica as etiquetas de status. São cerca de 40 linhas de CSS, sem tocar no JS, e mudam as 9 páginas ao mesmo tempo.
O portal passa de "ferramenta interna caprichada" a "produto de uma gestora", e de quebra resolve a maior parte das falhas de
WCAG.
