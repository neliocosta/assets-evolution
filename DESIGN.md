---
name: Nord Liberta
**Destaques em laranja suave** (escolha do usuário em 16/10/2026, comparada com a versão em marinho): os números em
destaque dos resumos e dos heróis tributários vão no Laranja Horizonte Texto. As trilhas, a teia dos riscos, as barras do
imposto, a fase atual e as referências da fase, a história da Nord e os sliders da previdência usam aurora e pêssego, nunca
o laranja forte em área larga. O que impressionava mal era a cor forte, não o laranja.

description: O planejamento financeiro da família como uma travessia, de hoje à liberdade financeira.
colors:
  laranja-horizonte: "#FA7A35"
  laranja-horizonte-texto: "#E06600"
  pessego-claro: "#FFF3EB"
  marinho-profundo: "#20344C"
  marinho-noite: "#131F2E"
  creme-papel: "#FDFCFA"
  branco: "#FFFFFF"
  grafite: "#555555"
  cinza-legenda: "#6B6A66"
  cinza-nevoa: "#8A8A8A"
  areia-linha: "#F1EEE8"
  cinza-borda: "#DDDDDD"
  ardosia-presente: "#DCE3EC"
  verde-em-dia: "#2E9E5B"
  verde-em-dia-texto: "#22794A"
  vermelho-alerta: "#D64545"
  vermelho-alerta-texto: "#B53434"
  atencao-texto: "#964400"
  azul-bens: "#3B6FCB"
  ocre-participacoes: "#D9952A"
  violeta-movimentos: "#7C5CBF"
  verde-em-dia-meio: "#77C094"
  azul-bens-meio: "#7FA1DD"
  ocre-participacoes-meio: "#E6BA74"
  fixas-bruma: "#4B6584"
  ajustaveis-media: "#9FB0C4"
  futuro-aurora: "#F6A06B"
  liberado-pessego: "#FCD9C2"
  trilho-azulado: "#EEF1F5"
typography:
  display:
    fontFamily: "Sora, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.15
  numero:
    fontFamily: "Sora, sans-serif"
    fontSize: "28px"
    fontWeight: 600
  title:
    fontFamily: "Sora, sans-serif"
    fontSize: "17px"
    fontWeight: 600
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  body-small:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.14em"
  citacao:
    fontFamily: "DM Serif Display, serif"
    fontWeight: 400
rounded:
  sm: "8px"
  control: "11px"
  md: "12px"
  card: "16px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "22px"
  xl: "30px"
components:
  button-primary:
    backgroundColor: "{colors.laranja-horizonte}"
    textColor: "{colors.marinho-profundo}"
    rounded: "{rounded.pill}"
    padding: "9px 18px"
  button-secondary:
    backgroundColor: "{colors.branco}"
    textColor: "{colors.marinho-profundo}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  button-tertiary:
    backgroundColor: "{colors.pessego-claro}"
    textColor: "{colors.marinho-profundo}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  toggle-on:
    backgroundColor: "{colors.marinho-profundo}"
    textColor: "{colors.branco}"
    rounded: "{rounded.sm}"
    padding: "7px 18px"
  card:
    backgroundColor: "{colors.branco}"
    textColor: "{colors.grafite}"
    rounded: "{rounded.card}"
    padding: "20px 22px"
  status-em-dia:
    backgroundColor: "#E3F3E9"
    textColor: "{colors.verde-em-dia-texto}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  status-alerta:
    backgroundColor: "#FBE6E6"
    textColor: "{colors.vermelho-alerta-texto}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
---

# Design System: Nord Liberta

## Overview

**Creative North Star: "O mapa da travessia"**

Cada tela mostra um trecho da travessia da família, da vida de hoje à liberdade financeira. O tempo é o eixo de tudo:
linhas do tempo que se preenchem, marcos de objetivos, a trajetória do patrimônio, o relógio das horas do mês. O
laranja marca o que está à frente (o futuro, o próximo passo). O azul-marinho dá firmeza ao caminho já percorrido e aos
números.

O clima é acolhedor e sofisticado. É acolhedor porque fala direto com a família, em papel creme, com cantos macios e
movimento calmo. É sofisticado porque é contido: muito espaço, poucos destaques, números em Sora grandes e exatos, e
nenhum enfeite que não carregue informação. A densidade é de relatório lido com calma, não de painel de operação.

O conteúdo vive em cartões brancos que flutuam com uma sombra leve sobre o creme. Os gráficos são desenhados à mão no
próprio código (rosca, relógio, barras do orçamento, linha do tempo) e seguem a mesma paleta. Nada vem de biblioteca de gráficos.

**Key Characteristics:**
- O tempo como eixo: linhas, marcos e trajetórias organizam as páginas.
- O laranja só para o futuro e para a ação principal.
- Cartões brancos com sombra leve sobre papel creme.
- Números grandes em Sora, texto em DM Sans.
- Movimento que revela, calmo e de uma vez por página, sempre com a versão só de opacidade.

## Colors

É uma paleta quente e contida: creme e branco de fundo, marinho para o que é firme, laranja para o que está à frente.

### Primary
- **Laranja Horizonte** (`laranja-horizonte`): o futuro e a ação principal. É o que vai para o futuro na rosca da renda e
  as horas do futuro no relógio do mês, o botão "Próximo" e as palavras do propósito. O laranja não aparece em texto
  pequeno: ele não passa no contraste. A versão escura **Laranja Horizonte Texto** (`laranja-horizonte-texto`) fica para
  números grandes (a partir de 18px em negrito), e o texto pequeno ligado ao futuro vai em marinho.
- **Pêssego Claro** (`pessego-claro`): fundo do botão terciário e de destaques suaves em laranja.

### Secondary
- **Marinho Profundo** (`marinho-profundo`): títulos, números principais, o botão de alternância ligado e as marcas de
  referência tracejadas. **Marinho Noite** (`marinho-noite`) aparece só nos fundos escuros raros.
- **Ardósia do Presente** (`ardosia-presente`): o padrão de vida, ou seja, o que a renda paga hoje, ao lado do laranja
  do futuro.

### Tertiary
- **Verde Em Dia** e **Vermelho Alerta** (`verde-em-dia`, `vermelho-alerta`, com as versões de texto): estados do
  diagnóstico (em dia, atenção, ruim). O orçamento não usa vermelho (veja Orçamento). O estado de atenção usa fundo pêssego com o texto em
  `atencao-texto`. Em texto, use sempre as versões de texto.
- **Categorias do patrimônio**: financeiro em verde (`verde-em-dia`), bens em azul (`azul-bens`), participações em ocre
  (`ocre-participacoes`) e movimentações em violeta (`violeta-movimentos`). Valem só na evolução patrimonial e no
  patrimônio. Em áreas largas (as barras da página de patrimônio), vale a versão do meio: `verde-em-dia-meio`,
  `azul-bens-meio` e `ocre-participacoes-meio`. A cor cheia fica para pontos, legendas e traços. As dívidas, e tudo o que
  sai de uma escada, usam um degradê suave de `#E2928D` a `#F7D7D4`, com a setinha para a esquerda: o valor faz o
  patrimônio voltar. Na evolução patrimonial, a dívida é uma faixa nesse tom abaixo do zero, e o patrimônio líquido é
  uma linha marinho por cima das faixas.
- **Dívidas, na gaveta de evolução** (escolha do usuário em 16/10/2026: "nada de cor forte"): amortização `#8EAAD6`,
  adiantamento `#4F6F9E` (o mesmo azul, mais fundo, porque os dois abatem o saldo), juros `#DF9A90` e seguro `#A891C9`,
  com 2 px de vão entre os pedaços, legenda e a tabela ao lado. O saldo devedor é `#E2928D`; o que já foi pago, cinza.

### Orçamento
Na bancada do orçamento, os grupos usam tons do meio, de peso parecido, para nenhum gritar: **Fixas Bruma**
(`fixas-bruma`, texto branco em cima), **Ajustáveis Média** (`ajustaveis-media`, texto marinho) e **Futuro Aurora**
(`futuro-aurora`, texto marinho). O que sai de uma despesa para o futuro é **Pêssego Liberado** (`liberado-pessego`),
liso, nunca listrado; o trilho vazio é **Trilho Azulado** (`trilho-azulado`). Nada de vermelho no orçamento: o que falta
vai no texto de atenção.

### Classes da carteira
Cada uma das 15 classes tem uma cor viva (`ENGINE.CLASSES_CARTEIRA[].cor`), e cada grande classe é uma família bem
distinta das outras (pedido do usuário em 18/10/2026: "as grandes classes diferentes têm que ter cores bem diferentes"):
a renda fixa nos azuis (liquidez diária `#8FD0F5`, pós-fixado `#3D79D1`, pré-fixado `#1F4E9C`, inflação `#2BB0C9`), a
renda variável nos quentes (multimercado `#E9A23B`, imobiliários `#C8655A`, ações Brasil `#E5743A`, fundo de ações Brasil
`#F0B27A`, ouro `#C9A227`, cripto `#C060A1`, alternativos `#8D6E57`) e o internacional nos verdes (cambial `#8BC34A`,
renda fixa global `#3DA66A`, ações globais `#1E7F5C`, fundo de ações globais `#6FCF97`). Valem no anel de fora do sunburst,
no traço do controle, na marca da linha e nos pontos das legendas; nas etiquetas, entram misturadas ao branco (34%). A
diferença em reais vai em texto (verde para mais, o texto de atenção para menos).

**Sunburst.** É a exceção pedida pelo usuário à regra dos tons suaves: o anel de dentro (os grupos) é pastel, um pouco mais firme que o primeiro (o usuário achou o primeiro apagado demais) (renda fixa
`#B3CAEE`, renda variável `#F1CA9C`, internacional `#B5DFC1`) e o de fora, com as classes, é vivo, sem nenhuma cor igual
à de dentro. O gráfico não tem rótulos: o nome e o % de cada classe ficam na legenda ao lado e, com o mouse, no centro.
1,5 px de branco entre os arcos; com o mouse num arco, os outros vão a 35%. Na microalocação, a decisão de cada ativo é uma etiqueta em tom do meio: manter `#9FCFB1`,
resgate parcial `#F0CF8F`, resgate integral `#EDB3A2`, portabilidade `#C4B5E0`; "a decidir" é tracejada no laranja de
atenção.

**The Aurora Rule.** Em áreas largas (segmentos de barra a partir de uns 12px de altura), o futuro vai em aurora. Em
traços, marcas, anéis de foco e na ação principal, continua o Laranja Horizonte. O número grande do futuro usa o
Laranja Horizonte Texto.

### Neutral
- **Creme Papel** (`creme-papel`): o fundo de todas as páginas.
- **Branco** (`branco`): os cartões.
- **Grafite** (`grafite`): o texto corrido.
- **Cinza Legenda** (`cinza-legenda`): texto secundário pequeno, como legendas, unidades e notas.
- **Cinza Névoa** (`cinza-nevoa`): só em texto grande ou em números de referência. Em texto pequeno não passa no
  contraste.
- **Areia** (`areia-linha`) e **Cinza Borda** (`cinza-borda`): divisórias dentro dos cartões e a borda dos controles.

### Named Rules
**The Horizon Rule.** O laranja significa "à frente": futuro, próximo passo, ação principal. Não o use como enfeite nem
para chamar atenção a um número do presente.

**The Present Is Slate Rule.** O que o dinheiro faz hoje (padrão de vida, horas para as contas) fica em ardósia. Laranja
e ardósia sempre aparecem juntos quando a página mostra a divisão entre presente e futuro.

## Typography

**Display Font:** Sora (com sans-serif)
**Body Font:** DM Sans (com system-ui, sans-serif)
**Citação:** DM Serif Display, só na voz do planejador (a frase do propósito e a mensagem final)

**Character:** a Sora é geométrica e firme, feita para títulos e números grandes. A DM Sans é amigável e legível, e
carrega o texto e as legendas. A serifada aparece só na voz do planejador: na frase do propósito, que abre o livro, e na mensagem final, que o fecha.

### Hierarchy
- **Display** (Sora 600, 32px, 1.15): o título de cada página.
- **Número** (Sora 600, de 22px a 34px): os valores principais dos cartões. O valor mais importante do cartão é o maior.
- **Title** (Sora 600, 17px): o título de cada cartão.
- **Body** (DM Sans 400, 15px a 15.5px, 1.6): o subtítulo da página e os textos explicativos. A largura máxima fica
  perto de 820px.
- **Body small** (DM Sans 500, 13px a 14px): legendas, linhas de lista e notas.
- **Label** (DM Sans 600, 11px, espaçamento 0.14em, maiúsculas, marinho): o rótulo acima de um bloco de conteúdo.

### Named Rules
**The Same Door Rule.** Toda página abre pela mesma porta (o cabeçalho padrão) e sai pela mesma (o rodapé com anterior e
próximo). O número principal de uma página vai no primeiro cartão, nunca no título. A única exceção é o gráfico da
evolução, que não ganha faixa de título nem rodapé.

**The Numbers Speak Sora Rule.** Todo valor monetário, hora ou percentual que é o assunto do cartão vai em Sora 600.
Texto que só explica vai em DM Sans.

## Layout

A coluna de conteúdo tem até 1120px, centralizada, com 24px a 28px de margem lateral. Toda página começa pelo mesmo
cabeçalho (rótulo do capítulo, título em Sora 32px e subtítulo), na mesma altura; a capa usa "Capítulo" como rótulo. A
evolução é a exceção: o gráfico é a estrela e ocupa a tela; o título e a navegação ficam só no cabeçalho do topo. Seguem seções separadas por 30px, cada uma com o próprio rótulo, e o rodapé
com "anterior" e "próximo".

Os cartões lado a lado formam uma grade de colunas iguais com 16px de espaço. A regra que manda é a dos cartões
alinhados: em cartões vizinhos, as bordas e as linhas internas batem. Quando não cabem, empilham. Abaixo de 860px, as
grades viram uma coluna e os gráficos ficam centralizados acima do texto.

Composições de patrimônio são mostradas como soma (partes que se somam a um todo), nunca como proporções soltas.

## Elevation & Depth

A profundidade é estrutural e leve. Toda superfície de conteúdo é um cartão branco com uma sombra suave sobre o creme.
É essa sombra que separa o conteúdo do fundo, e não bordas.

### Shadow Vocabulary
- **Cartão** (`box-shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04)`): todos os cartões de conteúdo.
- **Módulo em destaque** (`box-shadow: 0 4px 10px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.10)`): um cartão que se
  eleva sobre os outros, como um módulo aberto ou selecionado.
- **Flutuante** (`box-shadow: 0 20px 50px rgba(0,0,0,.25)`): camadas sobre a página, como o detalhe que abre na tela
  toda.

### Named Rules
**The Soft Lift Rule.** A sombra sempre tem deslocamento para baixo e desfoque largo. Não use halo colorido nem sombra
dura.

## Shapes

Os cantos são macios e generosos: 16px nos cartões, 12px em blocos internos, 11px nos botões quadrados e nos controles,
8px nos itens pequenos. As pílulas (9999px) ficam para a ação principal e para as etiquetas de estado. Nos gráficos, as
pontas das linhas são arredondadas e as marcas de referência são tracejadas.

## Components

Macios e confiantes: cantos generosos, a ação principal em pílula laranja e o resto quieto.

### Buttons
- **Shape:** pílula na ação principal (9999px). Cantos de 11px nos secundários e terciários.
- **Primary:** fundo laranja e texto marinho, 9px × 18px, DM Sans 600 13px. É um por tela, e é o "Próximo" no rodapé.
- **Hover / Focus:** escurece levemente (brilho a 94%) e encolhe um pouco ao clicar (escala .97). O foco usa contorno
  laranja.
- **Secondary:** branco com borda cinza e texto marinho, para "anterior" e ações de apoio.
- **Tertiary:** pêssego com texto marinho, para ações suaves ligadas ao futuro.

### Chips
- **Style:** etiquetas de estado em pílula, com fundo claro e texto escuro da mesma cor (verde em dia, vermelho em
  alerta, areia neutra).
- **State:** a cor diz o estado, e o texto sempre o nomeia ("em dia", "atenção").

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** branco.
- **Shadow Strategy:** a sombra do cartão (veja Elevation & Depth).
- **Border:** nenhuma. As divisórias internas são linhas de 1px em areia.
- **Internal Padding:** 20px × 22px nos cartões menores, 24px × 32px nos cartões de destaque.

### Navigation
- **Cabeçalho:** o capítulo em rótulo marinho e a página em DM Sans 600 marinho, entre setas de anterior e próxima. Embaixo
  fica a barra de progresso dividida por capítulo, com os trechos vistos em laranja. Um clique abre o sumário.
- **Alternância:** grupo de botões com borda e o selecionado em marinho cheio (Mês | Ano).
- **Rodapé da página:** "‹ anterior" secundário à esquerda e "Próximo: …" primário à direita.

### Gráficos desenhados à mão (signature)
A rosca da renda, o relógio do mês, as barras do orçamento e a linha do tempo da evolução são desenhadas no próprio código. Eles
seguem três convenções:
- o futuro em laranja sai do alto e anda no sentido horário;
- a referência (20% para o futuro) é uma marca tracejada em marinho;
- o valor central vai em Sora marinho, com a legenda em DM Sans.
Ao aparecer, o gráfico se revela uma vez, por exemplo com as marquinhas do relógio acendendo em sequência. Com menos
movimento no sistema, ele só aparece pela opacidade.

## Do's and Don'ts

### Do:
- **Do** usar o laranja só para o futuro e para a ação principal (The Horizon Rule).
- **Do** pôr todo conteúdo em cartões brancos de 16px com a sombra leve sobre o fundo creme.
- **Do** alinhar as bordas e as linhas internas de cartões vizinhos, e empilhar quando não couberem.
- **Do** escrever números em Sora 600 e o texto em DM Sans.
- **Do** oferecer a versão só de opacidade de toda entrada animada (`prefers-reduced-motion`).
- **Do** usar o Cinza Legenda em texto secundário pequeno, e nenhum texto abaixo de 11px.
- **Do** deixar tabelas largas rolarem dentro de si no celular, e quebrar o rodapé em duas linhas em vez de cortar.

### Don't:
- **Don't** usar o Cinza Névoa nem o laranja em texto pequeno, porque não passam no contraste.
- **Don't** pôr texto branco sobre o laranja.
- **Don't** usar bibliotecas de gráficos nem de componentes. As telas são autocontidas.
- **Don't** mostrar a composição do patrimônio como proporções soltas. Mostre como soma.
- **Don't** numerar capítulos.
- **Don't** usar sombra colorida, halo ou sombra dura.
