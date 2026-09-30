# Testes com a consultora (Patrícia) — rodadas

Critério de aprovação: em nenhum momento a consultora fica em dúvida sobre onde clicar ou qual informação
preencher primeiro. Clientes cadastrados em cada rodada: `ux/personas/clientes-teste.md`.

## Rodada 1 — REPROVADO

22 dúvidas nos três clientes. As que bloquearam:
- Não havia como começar um cliente novo; o plano de exemplo sempre voltava.
- Idade travada em 35; sem idade para parar de trabalhar.
- Campos de valor dos objetivos perdiam o foco a cada tecla.
- A máscara de moeda lia "18000" como R$ 180,00.

Corrigido para a rodada 2:
- Botão "Novo cliente" (plano em branco) e "ver exemplo", com confirmação quando há plano em andamento.
- Idade editável, idade para parar de trabalhar e imóveis e bens de hoje; orientação para casal.
- Valores digitados em reais, formatados ao sair do campo; campos zerados aparecem vazios.
- Objetivos recalculam a cada tecla sem perder o foco nem o texto; objetivo novo em branco; o último pode sair;
  "usar o necessário" no aporte; texto explica o que é objetivo e o que é despesa futura do fluxo.
- Capacidade de poupança pela média real dos próximos 12 meses (inclui semestrais e anuais) e aviso no
  Fluxo de caixa ligando capacidade e aportes; antes do fluxo, o resumo dos objetivos pede para preenchê-lo.
- Fluxo: aviso de por onde começar, "+ nova linha" clicável, selos "◀ 2 antes" e "3 depois ▶",
  Movimentações aberta, anual pede as datas em vez de inventar uma, dica para valores diferentes por dia,
  linha nova vazia é descartada ao sair.
- Barra lateral marca os passos concluídos; a página Cliente diz o que falta.
- Tela do cliente: nome e idade do plano, "Você tem hoje" igual ao informado, nada simulado antes de hoje.

Registrado e não tratado nesta rodada: despesas fixas crescem depois da liberdade financeira (o motor ajusta
todas as despesas à renda disponível), e um salário com valores diferentes por dia exige duas linhas.

## Rodada 2 — REPROVADO

Os três clientes foram cadastrados até o fim (na rodada 1 não foram), com 19 dúvidas. As mais graves eram erros
silenciosos: prazo "360" virava 63, amortização "30" virava 3 e datas de outubro a dezembro viravam janeiro,
porque a tela era redesenhada no meio da digitação; uma data com ano errado sumia da planilha sem volta. Na visão
do cliente, a idade era sempre 35 e a liberdade aparecia como alcançada quando não sustentava a renda.

Corrigido para a rodada 3:
- Campos de mês e data viraram listas de dia, mês e ano (o campo nativo muda entre navegadores e avisa a cada
  parte digitada). Campos numéricos gravam ao sair do campo; nada é redesenhado durante a digitação.
- Datas fora do horizonte (passado, depois dos 100 anos do cliente) são recusadas com explicação; uma linha sem
  valor em lugar nenhum continua visível na planilha para ser corrigida.
- Motor: o mês de hoje recebe aporte e o patrimônio dedicado é reservado hoje. Com o aporte igual ao necessário,
  o objetivo fica alcançável (antes faltava um aporte e ele caía para "com ajustes").
- "Até quando" com três opções (sempre, até uma data, até um objetivo), a data começa vazia, e o resumo diz
  quando a linha termina e quando o valor muda. Anual começa sem datas e não lança nada até escolher.
- Objetivo novo aparece no fim, destacado, e não pula de lugar; status neutro até existir orçamento; aporte
  necessário aparece como número calculado; "patrimônio já reservado" diz de onde sai.
- Confirmações de apagar não somem sozinhas; o único dia de uma linha mensal explica como trocar.
- Liberdade financeira: fechamento com o que falta conferir e o botão para abrir a visão do cliente; aviso
  quando a renda desejada não é atingida, também nos indicadores ("renda parcial").
- Visão do cliente: idade real no marcador de hoje e no eixo; saudação ao casal ("Camila e Rafael").
- Categoria "Honorários (autônomo)"; explicação de renda ativa e passiva; indicadores do topo levam à página.

## Rodada 3 — REPROVADO

11 dúvidas (eram 19), nenhum erro de script, e a ordem sugerida pela tela funcionou nos três clientes. A mais
grave: na mesma tela, "dentro da capacidade" em verde, "aporte suficiente" e "0 em risco" junto com uma caixa
vermelha dizendo que o orçamento não comporta o aporte e mandando reduzir "objetivos anteriores" que não existiam.
A causa real (os plantões caem em 2028) não aparecia. A visão do cliente mostrava outro status que o portal.

Corrigido para a rodada 4:
- Um veredito por objetivo: o motor grava o saldo real de cada objetivo na data, e portal e visão do cliente usam
  o mesmo número. Quando o orçamento deixa de entregar o aporte, o cartão diz o mês, a causa provável (renda que
  cai, despesa que começa ou sobe, financiamento que começa) e as saídas; "objetivos anteriores" só quando existem.
  O resumo e o indicador do topo ("fora do orçamento") concordam com os cartões.
- Antes do Fluxo de caixa, o cartão mostra só quanto é preciso guardar e o próximo passo, sem vermelho.
- "Próximo" leva ao próximo passo que falta; a barra lateral marca os passos pelos dados e não oscila.
- Linha nova vem com nome e valor vazios (antes o texto digitado se misturava com "Nova entrada" e "R$ 0,00").
- Dia do mês: Enter adiciona, e o primeiro dia adicionado substitui o sugerido. Data recusada não é gravada e o
  aviso fica visível. Explicação de fixa e ajustável; bruto e tributável marcados como opcionais.
- Renda da aposentadoria: líquido primeiro, bruto e imposto opcionais, origem em lista, e início pela idade do
  titular ou do cônjuge (nova "Idade do cônjuge" na página Cliente).
- Cartão de objetivo mais curto: custo mensal depois de realizado e apresentação ao cliente (estratégia, foto,
  ícone) em blocos opcionais; "patrimônio já reservado" mostra quanto ainda está livre para reservar.
- Mês da planilha mostra as datas reais das semanas que o formam.

## Rodada 4 — REPROVADO

9 dúvidas (eram 11), nenhuma bloqueante, nenhum erro de script; a consultora conferiu de cabeça 2026 e 2027 dos
três clientes e tudo bateu. A principal: mudar o dia de uma linha existente somava um segundo dia e dobrava o
valor sem aviso.

Corrigido para a rodada 5:
- Dia do mês: "Trocar o dia" e "+ outro dia" são escolhas explícitas; com dois dias, a tela diz que cada dia
  recebe o valor inteiro.
- A categoria define ativa ou passiva (Aluguéis e Rendimentos → passiva); a origem INSS já marca idade fixa
  aos 65, com aviso; a tabela da Liberdade mostra a idade de quem recebe (titular ou cônjuge).
- Depois do Fluxo, um só próximo passo ("definir os aportes nos Objetivos") e "usar o necessário em todos";
  o indicador diz "aportes a definir" em vez de "fora do orçamento".
- Liberdade financeira no topo só depois de haver patrimônio ou fluxo. Textos sobre a reserva, a amortização
  (média do prazo) e a idade de referência do casal.
- A planilha começa hoje (o que já foi recebido está no patrimônio); a data sugerida de um pontual nunca é
  passada; título da gaveta acompanha o nome.
- Visão do cliente: a linha de bens sobe na compra, não antes; a dica some ao dar zoom.

## Rodada 5 — REPROVADO

4 dúvidas (eram 9), nenhuma bloqueante; a Juliana foi cadastrada sem nenhuma. As dúvidas: o Fluxo mandava definir
aportes antes das despesas; trocar o INSS para o cônjuge mudava a idade e deixava um aviso velho; a regra das
colunas de mês não estava explicada; nos objetivos do Marcos a tela não sugeria reservar o patrimônio livre, o
aporte não se atualizava depois da reserva e o selo ficava verde ao lado de uma caixa vermelha. Ela também achou
o ano corrente diferente entre a planilha (desde hoje) e a visão do cliente (setembro inteiro).

Corrigido para a rodada 6:
- Fluxo: com só entradas, o aviso e o "Próximo" pedem as despesas; os aportes vêm depois.
- Trocar titular/cônjuge mantém a idade de início e limpa o aviso.
- Legenda explica o mês de salário a salário ("uma despesa semanal cai 4 ou 5 vezes").
- Objetivos: "usar o necessário" passa a acompanhar custo, data e reserva; o resumo lembra do patrimônio livre;
  a caixa vermelha só aparece quando o objetivo não está alcançável.
- Motor: nada antes de hoje entra no fluxo; planilha e visão do cliente têm o mesmo ano corrente.
- Primeira coluna não corta o número; "Voltar para hoje" volta o zoom; financiamento mostra "(juros)";
  a Liberdade lembra de conferir as rendas de aposentadoria e explica o que o patrimônio sustenta.

## Rodada 6 — REPROVADO

8 dúvidas pequenas, nenhuma bloqueante; a visão do cliente bateu nos três clientes. As que ela considerou mais
importantes: "Trocar o dia" não fazia nada com o campo vazio, e não havia onde achar a frequência semestral. As
demais: o aviso "Entradas cadastradas" aparecia com uma linha ainda vazia; "Consumo / Vira bem" sem explicação;
colunas nas bordas da planilha cortadas ou vazias; liberdade no topo antes de haver renda; participações sem
dizer se contam; pontual com data recusada continuava contando.

Corrigido para a rodada 7:
- O dia do mês é um campo editável; "+ outro dia" acrescenta, e sem dia digitado o campo é destacado.
- A frequência anual virou "Em datas do ano", com o exemplo de semestral (30/jun e 30/dez) e de parcelas.
- Linha sem valor não conta como cadastrada; "Próximo" não pula páginas no plano de exemplo.
- "Consumo" e "Vira bem" explicados; liberdade no topo só com renda cadastrada; a Liberdade diz que imóveis e
  participações não pagam a renda desejada.
- Pontual com data recusada deixa de contar até ter uma data válida.
- Colunas recortadas nas duas bordas; coluna estreita não mostra número cortado.
- Visão do cliente: o gráfico também desenha bens e participações sem média, então a linha sobe na compra.

## Rodada 7 — REPROVADO

7 dúvidas (eram 8), uma bloqueante; os três clientes foram cadastrados até o fim, sem erro de script (só o 404
do favicon). A ordem sugerida pela tela funcionou nos três. A bloqueante: na Liberdade do Marcos, o ponto da
renda desejada por idade não sai com dois cliques, embora a dica diga "dois cliques removem"; arrastar de volta
não acerta R$ 40.000 (pula de 40.100 para 39.900) e a visão do cliente fica com "muda com a idade". As pequenas:
o aviso "Falta definir quanto guardar por mês em 1 objetivo(s)" continua com o necessário em R$ 0 e não diz qual;
o diálogo do orçamento não oferece reservar patrimônio livre e mostra os aportes aplicados atrás dele antes da
decisão; "Plano de: Uma pessoa" vem marcado mesmo com a idade do cônjuge preenchida; trocar de cliente não
lembra de baixar o plano; a legenda do mês fala em "salário do dia 5" para a Juliana, que não tem; o pontual
sugere uma data que já passou (19/set).

Mais grave que as dúvidas foram os números que não bateram na conferência de cabeça:
- 2026 conta ocorrências de antes de hoje (30/09): o adiantamento do Rafael de 20/09 (Entradas 2026 R$ 54.300 em
  vez de R$ 52.000), feiras de sábados passados (Saídas R$ 19.575 em vez de R$ 19.275) e plantões de sextas
  passadas (R$ 27.000 em vez de R$ 23.400). Causa provável: o motor fixa hoje em 19/09/2026 (`TODAY`/`HOJE`).
- A idade nos marcos dos objetivos sai um ano menor nos três clientes (Viagem set/2028 "34 anos", esperado 35;
  Faculdade set/2029 "50", esperado 51; Sala set/2031 "42", esperado 43).
- Visão do Marcos: "Retirada do patrimônio R$ 32.000/mês", contra saque de R$ 5.221 e rendas de R$ 14.000 no portal.
- Estratégia da liberdade: "INSS da Camila… a partir de 67 anos" (67 é a idade do Rafael; ela recebe aos 65).
- Diferença de R$ 1 entre o necessário mostrado e o gravado por "usar o necessário"; 99% no portal e 100% na visão.
- Plantões 2027 com 52 sextas (2027 tem 53).

Elogios: a frase-resumo no topo de cada gaveta; "Em datas do ano" com os exemplos (13º, lucros, IPVA, seguro e
conselho de primeira); o dia do mês editável; "+ mudança de valor"; Ctrl/Shift + rodinha e "Voltar para hoje";
"Até um objetivo ser realizado"; a sugestão de reservar o patrimônio livre; o diálogo do orçamento da Juliana
(mês, conta e redução visível como mudança de valor); gráfico arrastável e rentabilidade com o nome do perfil;
tabela de rendas com a gaveta "⋯"; a mensagem de data passada; o fechamento "Plano completo".

O ciclo de testes com a consultora foi encerrado nesta rodada, sem correções e sem rodada 8. O que continua
aberto está em `PENDENCIAS.md` (itens 20 a 31).
