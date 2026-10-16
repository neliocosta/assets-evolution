# Revisão de UX: Portal do consultor, campos e próximo passo (16/10/2026)

Esta revisão foi feita pelo agente `ui-ux-designer` a pedido do dono do produto, que relatou: "o consultor preenche uma
quantidade grande de informações, e muitos campos e páginas estão confusos: há textos cortados e não fica claro qual é
exatamente o próximo passo." O agente viu as capturas das 10 páginas (1440×900, com o exemplo completo) e leu o código.
Ela complementa a revisão de 15/10 (`revisao-ux-consultor-2026-10-15.md`), que foi aplicada na mesma sessão.
**Tudo o que está abaixo foi aplicado em 16/10/2026**, com os ajustes anotados.

## Veredito

O consultor se perdia por três razões, e nenhuma era visual:

1. **Havia quatro jeitos de dizer "falta"**:
   - o aviso da página Cliente;
   - o "Antes de apresentar" da Liberdade;
   - o "Falta definir quanto guardar" dos Objetivos;
   - o "Resolver" da Apresentação.

   A barra lateral marcava "feito" por um quinto critério: algumas páginas ficavam verdes só por terem sido abertas.
2. **Havia campos fora do assunto.** "Quantas vezes poupou" ficava longe da capacidade de poupança, o Propósito vinha antes
   dos objetivos e a situação do financiamento aparecia duas vezes.
3. **Os textos eram de planilha interna**: "(d = 3)", "(t)", "D+0 da liquidez", "3 depois ▶", "vitalíci anos", "Zoom: Mês"
   e "Efetivo". Havia também duas contradições: "4 de 5 fora do orçamento" ao lado de "dentro da capacidade", e
   "até jan/2050" ao lado de "em fev/2050".

## O padrão do "o que falta" (a maior mudança)

A função `pendencias()` reúne regras que já existiam e é lida em três lugares:

- **na linha do "Próximo" de cada página**: "Falta nesta página: …", com um link para cada campo, ou "✓ Página completa";
- **no ✓ da barra lateral**: o ✓ quer dizer "sem pendência", nunca "página vista";
- **no topo da Apresentação** ("Antes de apresentar"): tudo o que falta, com o link para a página, mais os objetivos que não
  chegam à meta.

As regras do padrão:

- O "Próximo" nunca trava, porque o dado pode vir depois, da coleta.
- O campo obrigatório vazio ganha borda pêssego e o rótulo "obrigatório · falta".
- Premissas tem valores sugeridos e nunca fica pendente.

O aviso da Cliente e o "Antes de apresentar" da Liberdade saíram.

## Os itens (todos aplicados)

| # | Página | O que mudou |
|---|---|---|
| 1 | Todas | O padrão do "o que falta", descrito acima |
| 2 | Todas | Campo obrigatório vazio marcado ("obrigatório · falta") |
| 3 | Todas | "vazio:" virou "automático:" nos placeholders. Dependentes e natureza, nos Riscos, viraram valor ligado ("da página Cliente · mudar"), no lugar de um campo desabilitado |
| 4 | Cliente | "O plano é de" vem primeiro, porque decide se os campos do cônjuge aparecem |
| 5 | Cliente | Espaço entre as linhas de cada pessoa. A frase da reserva foi para baixo do select da natureza. Rótulos "Idade em que o titular começou a trabalhar" e "Expectativa de vida (anos)" |
| 6 | Indicadores | "Objetivos fora do orçamento" virou "Objetivos abaixo da meta" (o status compara o saldo na data com a meta) |
| 7 | Objetivos | Ordem nova: cartões, + Adicionar, resumo, Propósito. Colunas "Necessário/mês", "Definido/mês" e "Entregue/mês" (com explicação), e a capacidade numa linha própria |
| 8 | Fluxo | "Quantas vezes poupou" foi para o bloco "O que o cliente diz sobre a poupança", junto da capacidade informada |
| 9 | Fluxo | Cabeçalho "Linha" no lugar de "Zoom: Mês". "Ao abrir a página, mostrar em". A legenda vem antes da planilha |
| 10 | Fluxo | "3 linhas ▶" e "◀ 2 linhas" no lugar de "3 depois ▶". A etiqueta some quando repete o nome da linha |
| 11 | Patrimônio | "Parte de Ana (%)" ganhou rótulo, numa segunda linha, só quando o bem é do casal. Placeholders "R$ 0 se quitado" e "ex.: 240" |
| 12 | Patrimônio | O financiamento ficou em duas linhas, contrato e hoje. A pílula de situação aparece só quando há inadimplência |
| 13 | Riscos | A regra da reserva em frase ("Reserva ideal … = custo de vida × 8 meses (3 por ter dependentes + 5 pela natureza)"). "Já avaliado. Sem nenhuma necessidade na lista, fica em dia." |
| 14 | Liberdade | Coluna "Dura (anos)", sem o "anos" solto depois do campo |
| 15 | Liberdade | O mês em que cada um para é o mesmo em todos os textos |
| 16 | Liberdade | "definida no alto da página". "Novo período a partir dos [ ] anos de [Ana], com renda de [ex.: R$ 18.000] [Criar período]" |
| 17 | Tributário | Os dividendos citam as linhas de lucros, e não a do pró-labore. O motor passou a devolver `linhasPro` e `linhasDiv` em `retiradaDosSocios` |
| 18 | Tributário | Previdência em três grupos (dados, investimento comum e previdência), com rótulos curtos e "Trocas de fundo no prazo" |
| 19 | Tributário | "Quem declara os dependentes". Placeholders "R$ 0" nos lançamentos |
| 20 | Premissas | A equivalência anual embaixo de cada campo |
| 21 | Patrimônio | "Outras contas de Ana/Marcos" e "Contas conjuntas". O texto da liquidez ideal foi para baixo do campo |
| 22 | Apresentação | "Antes de apresentar" no topo, com o botão "Apresentar desde o começo" |
| 23 | Fluxo, Liberdade, Apresentação | Frases de topo mais curtas |

Além dos 23 itens:

- O "Próximo" da Liberdade passou a levar à Otimização tributária, e não mais às Premissas.
- Os sliders ganharam um visual fino (trilho claro, trecho em laranja e botão branco com aro marinho).
- As barras "De onde vem" foram para tons do meio.
- O topo ganhou o "Gravado às …".
