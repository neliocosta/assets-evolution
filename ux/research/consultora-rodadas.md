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
