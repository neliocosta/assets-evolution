# Revisão de acabamento: Área do cliente (16/10/2026)

Esta revisão foi feita pelo agente `ui-ux-designer` a pedido do dono do produto: "garantir que nenhuma página fica pesada,
com contrastes gritantes ou com elementos brutos". A referência é a página "O orçamento da família", refinada e aprovada em
15–16/10:

- tons do meio de peso parecido (#4B6584, #9FB0C4, #F6A06B, pêssego #FCD9C2);
- trilho #EEF1F5;
- nada listrado;
- controles finos;
- o laranja forte só em traços, marcas e na ação principal.

O agente viu as 47 capturas e leu o código. **Os itens 1 a 22 foram aplicados em 16/10/2026.**

## Veredito

O resto do livro ainda falava a língua antiga. O problema se concentrava em três lugares:

- **O capítulo tributário**, com verde, azul, ocre, violeta e vermelho em degradê, um bloco rosa, sliders nativos de trilho
  preto e um select nativo.
- **O laranja forte em áreas largas**: a rosca da renda, a barra "Máximo desta fase" e as barras de imposto.
- **O marinho cheio** nas barras de total e nos detalhes brutos, como o "▾" e o "▸" de fonte, o emoji desenhado no gráfico
  e as caixas tracejadas.

## Aplicado

| # | Página | O que mudou |
|---|---|---|
| 1 | Sucessão | A escada num tom só (#9FB0C4), o total em #4B6584 e a previdência em aurora. O bloco rosa do custo virou uma linha com filete |
| 2 | Escadas (IR, sócios, sucessão, patrimônio) | O negativo liso em #EBB0AC, sem ponta de seta. O total em #4B6584, no lugar do marinho cheio. Ligações tracejadas de 1px |
| 3 | Previdência | Sliders e select finos, no padrão do orçamento. A linha da previdência em laranja (é traço). Os ganhos em pêssego liso. Rótulos do gráfico legíveis |
| 4 | Riscos | A régua da reserva lisa e fina, sem faixas de cor |
| 5 | Renda e custo de vida | O arco do futuro em aurora (#F6A06B). O 18% continua em laranja de texto |
| 6 | Capas e resumos, heróis tributários | Os números em marinho, o futuro em #E06600 e o risco em vermelho. O verde ficou só nas etiquetas |
| 7 | Pró-labore | Pró-labore em #9FB0C4 e dividendos em #C7D1DD, no lugar do azul-aço e do verde de categoria |
| 8 | Imposto de renda | Barras finas em tons do meio. As etiquetas da tabela em pêssego e ardósia |
| 9 | Fase da vida | A trilha das fases e as barras de referência em tons do meio. O marcador é branco com aro laranja |
| 10 | Hoje e depois | Sem caixa dentro de caixa: as linhas separadas por filete |
| 11 | Quem caminha ao seu lado | Trilha em #4B6584. O passo atual com aro laranja, sem pulso infinito. Avatares sem halo colorido |
| 12 | Riscos | "Simule outros valores" sem caixa tracejada, com campos finos e o placeholder em itálico |
| 13 | Cabeçalho e listas | O "▾" virou uma seta fina. As setas das listas em ardósia |
| 15 | "Como é calculado" | O "▸" virou uma seta fina que gira |
| 16 | Tabelas dos riscos | Cabeçalho claro, sem a barra marinho |
| 17 | Liquidez | Barras em tons do meio, sem degradê verde e sem cores de categoria |
| 18 | Quem é a família | A restrição em texto de atenção, e não em vermelho de erro. A nota sem o filete laranja |
| 19 | Renda e custo de vida | "Quantas vezes pouparam" com blocos finos e o selecionado em ardósia |
| 20 | O propósito | A linha e os ícones fixos em ardósia, no lugar do marinho cheio e do degradê |
| 21 | Tempo | "a hora" maior nos relógios pequenos |
| 22 | Trajetória | O emoji do canvas virou o ícone desenhado. A célula de hoje em pêssego com filete laranja e texto marinho |

Também entraram:

- o erro de rótulo dos resumos (os números repetiam o título da página quando só uma página trazia números), do achado 3
  de 15/10;
- a retirada do Montserrat, do achado 5 de 15/10;
- a teia, os anos da história e os avatares, do achado 6 de 15/10.

## Item 23, aplicado depois

O usuário viu a prévia e aprovou as categorias do Patrimônio em tom do meio (financeiro #77C094, participações #E6BA74, bens
#7FA1DD). Pediu que as dívidas voltassem ao degradê, agora suave (#E2928D a #F7D7D4), e à setinha para a esquerda, que diz
que o valor faz o patrimônio voltar. A variante está no DESIGN.md.

## Ficou para decisão

- **Item 14, as margens.** Alinhar os cartões das páginas tributárias, do patrimônio e dos riscos a x=192, como o orçamento.
  Não foi aplicado porque é preciso confirmar a estrutura das `.rc` com uma captura de cada página.
- **Riscos: o vazio de cerca de 700px embaixo do slide.** É consequência da decisão de 07/10 ("Carrossel de riscos sem sobe
  e desce"). Para resolver, é preciso rever essa decisão.
- **Trajetória do patrimônio**, do achado 1 de 15/10: aparecer inteira em repouso, eixo linear e rótulos diretos. Não é peso
  visual, mas é a tela-clímax.
- **Capas e resumos em faixa**, do achado 3 de 15/10, e **fecho em faixa marinho**, do achado 14 de 15/10. Os dois põem
  marinho cheio em áreas grandes, o contrário do que esta varredura buscou.
