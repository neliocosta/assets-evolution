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
