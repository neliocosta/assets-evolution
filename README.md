# Evolução Patrimonial — Nord Liberta

Protótipo funcional de duas telas que se conversam. Ambas são arquivos HTML autocontidos, sem dependências
além das fontes do Google, e abrem direto no navegador.

| Arquivo | Para quem | O que faz |
|---|---|---|
| `tela-consultor.html` | Consultor | Configura o plano em cinco páginas: Cliente, Patrimônio e premissas, Objetivos, Fluxo de caixa e Liberdade financeira. |
| `evolucao-patrimonial.html` | Cliente | Mostra a trajetória do patrimônio ao longo da vida, apresentada ao vivo pelo consultor. |

## Por onde começar

- `node verificar.js` confere as invariantes do motor sem abrir o navegador.
- `PENDENCIAS.md` lista o que falta, em ordem de prioridade, com o contexto dos testes com usuários.
- `node sync-motor.js` copia o motor da tela do cliente para a do consultor. **Rode sempre que mexer no motor**:
  as duas telas são autocontidas e por isso carregam uma cópia cada.

## Como as duas telas se conectam

O consultor configura o plano e tem dois caminhos para levá-lo à tela do cliente:

1. **Botão "Abrir visão do cliente"** — abre a tela do cliente com o plano codificado no final da URL
   (`evolucao-patrimonial.html#plano=<base64>`). É o caminho de um clique.
2. **Botão "Baixar plano (.json)"** — salva um arquivo que o cliente carrega pelo botão "Plano", no topo
   da tela de Evolução Patrimonial. Funciona em qualquer navegador, inclusive quando a abertura de abas
   é bloqueada ou quando os arquivos estão em máquinas diferentes.

O plano também fica salvo no `localStorage` do navegador, então a tela do consultor reabre no ponto em que parou.

## Formato do plano

```jsonc
{
  "name": "Ana Ribeiro", "age": 35, "lifeExp": 95,
  "initialWealth": 500000,     // patrimônio financeiro do cliente hoje: ponto de partida do gráfico
  "capacityOverride": null,    // capacidade de poupança informada pelo cliente; null = salário − despesas
  "desired": 25000,            // renda familiar desejada na aposentadoria (R$/mês)
  "rate": 0.004,               // retorno real líquido da reserva (ao mês)
  "partValue": 150000,         // planos antigos traziam "rent": vira a linha de despesa "moradia"
  "profiles": { "conservador": 0.004, "moderado": 0.005, "agressivo": 0.006 },

  // Entradas e saídas são linhas do tempo em degraus. Cada degrau vale a partir do mês
  // indicado (0 = set/2026) e o último vale indefinidamente.
  "incomes": [
    { "id": "salario", "label": "Salário da família",
      "kind": "ativa",                      // ativa (trabalho) ou passiva (patrimônio)
      "origin": "Salário",                  // Salário, Pró-labore, Distribuição de lucros, Bônus,
                                            // Comissões, Rendimentos recorrentes, Outras receitas
      "gross": 19500,                       // bruto; o fluxo de caixa usa sempre o líquido dos degraus
      "frequency": "mensal",                // pontual, semanal, mensal, anual (trimestral e semestral ainda são lidos)
      "days": [5, 20],                      // mensal: dias do mês; o valor do degrau vale para cada dia
      "taxable": true, "description": "",
      "steps": [ {"from": 0, "value": 7500}, {"from": 13, "value": 9000} ],
      "exc": { "10": 0, "14:3": 8000 } }    // ajustes de uma só ocorrência: "mês" ou "mês:semana"
  ],
  "expenses": [
    { "id": "moradia", "label": "Moradia (aluguel)", "group": "fix", "week": 1,
      "endObj": "casa",                     // deixa de existir quando este objetivo é realizado
      "steps": [ {"from": 0, "value": 3000} ] },
    { "id": "ipva", "label": "IPVA", "group": "fix", "frequency": "anual",
      "dates": [ {"m": 0, "d": 5}, {"m": 1, "d": 5}, {"m": 2, "d": 5} ],   // 5/jan, 5/fev e 5/mar
      "steps": [ {"from": 0, "value": 1400} ] },
    { "id": "feira", "label": "Feira", "group": "adj", "frequency": "semanal", "weekday": 6,
      "steps": [ {"from": 0, "value": 300} ] },
    { "id": "guia", "label": "Guia de imposto", "group": "fix", "frequency": "pontual",
      "date": "2027-05-20", "days": [20], "steps": [ {"from": 8, "value": 15000} ] },
    { "id": "mercado", "label": "Mercado", "group": "adj",
      "week": 0,                            // formato antigo, sem days: 0 = diluída no mês; 1 a 4 = semana
      "steps": [ {"from": 0, "value": 2700} ] },
    { "id": "faculdade", "label": "Faculdade do filho", "group": "fix", "week": 1,
      "steps": [ {"from": 80, "value": 2500}, {"from": 128, "value": 0} ] }   // o degrau zero encerra a linha
  ],
  "objectives": [
    {
      "id": "casa", "name": "Casa própria", "icon": "home",
      "kind": "bem",           // "bem" migra para patrimônio; "consumo" é uma saída
      "months": 46,            // data alvo, em meses a partir de set/2026
      "amount": 180000,        // custo pontual
      "recurring": { "value": 4000, "months": 420, "label": "Financiamento", "amort": 0.45 },
      "dedicated": 45000,      // patrimônio já dedicado a este objetivo
      "profile": "moderado",
      "planned": 1500,         // aporte mensal definido pelo consultor
      "photo": "",             // endereço de uma imagem, opcional; sem foto o card usa o ícone
      "iconData": "",          // SVG ou PNG enviado pelo consultor, embutido como data URL
      "iconFA": "",            // ou uma classe do Font Awesome, por exemplo "fa-solid fa-car"
      "strategy": "texto apresentado ao cliente"
    }
  ],
  "passive": [
    { "name": "INSS", "gross": 5000, "tax": 800, "net": 4200,
      "startMi": 333, "dur": null, "cost": 0 },  // data fixa (mês 333 = jun/2054); dur em meses, null = vitalícia
    { "name": "Fundo de pensão por 5 anos", "gross": 8750, "tax": 1750, "net": 7000,
      "start": 0, "dur": 60, "cost": 372000 }    // sem startMi: começa `start` meses depois da liberdade
  ]
}
```

Campos vazios são válidos: o card do objetivo mostra travessão e mantém a mesma estrutura para todos.

## Como os números são calculados

A simulação é semanal, dos 0 aos 100 anos, e roda por inteiro a cada mudança de plano.

**Identidade contábil.** Em qualquer período, movimentações no patrimônio = entradas − saídas. O cofre
recebe cada entrada e paga cada saída, semana a semana. Transferências entre cofre, objetivos e bens somam
zero. Isso é verificado mês a mês e o erro é zero.

**Objetivos.** Com taxa `r` do perfil e `n` meses até a data alvo:

- aporte necessário = (custo − dedicado × (1+r)ⁿ) ÷ [((1+r)ⁿ − 1) ÷ r]
- projeção = dedicado × (1+r)ⁿ + aporte definido × [((1+r)ⁿ − 1) ÷ r]
- status: 98% ou mais é Alcançável, 70% ou mais é Alcançável com ajustes, abaixo disso é Requer revisão

Esse é o cálculo teórico. O status exibido, porém, vem da simulação: o portal roda o mesmo motor da tela
do cliente e lê o saldo que cada objetivo realmente acumulou na data alvo. Quando a soma dos aportes passa
da capacidade de poupança, os objetivos mais distantes recebem menos do que o definido, e a coluna
**Efetivo** do resumo mostra isso. Um objetivo só aparece como alcançável se couber no orçamento.

As duas telas são autocontidas e por isso o motor é duplicado. Depois de mexer nele na tela do cliente,
rode `node sync-motor.js` para copiar o bloco para o portal.

**Liberdade Financeira.** Acontece quando o patrimônio, descontado o custo de contratar as rendas passivas
e o que ainda falta para os objetivos pendentes, rende o suficiente para cobrir a diferença entre a renda
desejada e as rendas passivas ativas. Não depende da ordem dos objetivos: adiar um sonho não empurra a
aposentadoria junto. Se aos 68 anos o patrimônio ainda não sustentar a renda desejada, o marco aparece
mesmo assim, mas sem celebração: o card informa quanto o patrimônio de fato sustenta por mês e aponta os
três caminhos para fechar a diferença.

- **Perpetuidade**: retirada mensal = patrimônio × taxa. O principal fica estável.
- **Consumo**: retirada mensal = PMT até a expectativa de vida. O patrimônio chega a zero na data.

**Fluxo de caixa.** No portal, entradas e saídas aparecem como uma planilha com o tempo na horizontal,
na mesma estrutura da tela do cliente: Movimentações no patrimônio no topo, Entradas, e Saídas dividida
em Fixas e Ajustáveis. A rodinha do mouse aproxima e afasta, de décadas até semanas, e arrastar anda no
tempo. Os valores das células vêm da simulação, então a linha de Movimentações é sempre entradas menos
saídas. Uma linha sem valor no período à vista fica escondida, e o grupo avisa quantas linhas têm valor
antes ou depois da janela.

- Numa coluna de ano ou maior, clicar aproxima até o mês. Numa coluna de mês ou de semana, clicar abre a
  edição: **a partir daqui** (cria um degrau), **só nesta ocorrência** (grava em `exc`) ou **encerrar aqui**
  (degrau zero).
- A linha em branco no fim de cada grupo cria uma linha nova já na data da célula clicada.
- O botão **+** de cada grupo abre o cadastro completo: nome, valor, pontual ou recorrente, frequência
  (semanal, mensal em um ou mais dias, anual em uma ou mais datas), início, até quando, mudanças de valor
  e ajustes de uma ocorrência.
- Aportes e custos dos objetivos e as rendas da aposentadoria aparecem como linhas só de leitura, com o
  caminho para a página onde são editados.

**Frequência.** O valor do degrau é o de cada ocorrência: o salário de 10 mil pago nos dias 5 e 20 é uma
linha de 5 mil com `days: [5, 20]`. Cada ocorrência cai na semana do calendário que contém a sua data, e
na planilha as semanas aparecem pelo intervalo de datas (20–26/09/26, 27/09–03/10/26). Como o mês vai de
salário a salário, os dias 1 a 4 fecham o ciclo anterior. Uma despesa semanal cai em todas as semanas do
mês, que são quatro ou cinco. Para orçamento, o portal usa o equivalente mensal, então um bônus de
12 mil por ano pesa mil por mês e uma despesa semanal de 300 pesa cerca de 1.304 (52 semanas ÷ 12).

**Aposentadoria.** Na liberdade financeira, a renda ativa (trabalho) para. A renda passiva, como o aluguel
de um imóvel, continua, e entra no cálculo de quanto o patrimônio precisa sustentar. As rendas contratadas
começam numa data fixa (o INSS, numa idade definida) ou na liberdade financeira, com ou sem alguns meses
de espera. Uma renda de data fixa que começa antes da liberdade já entra no fluxo. O portal mostra a data e
a idade de início e de fim de cada uma.

**Ícones dos objetivos.** O consultor envia um SVG ou PNG, que viaja embutido no plano, ou cola uma classe
do Font Awesome. O ícone aparece no marco do gráfico e no card do cliente. O Font Awesome é carregado de
um CDN e só funciona com internet; o arquivo enviado funciona offline.

**Degraus de valor.** Entradas e saídas não crescem por percentual: o consultor informa o valor de hoje
e, a cada mudança, acrescenta um degrau com o mês em que ela passa a valer. Uma despesa que só começa
depois, como a faculdade, recebe o primeiro degrau nesse mês e vale zero antes. Para encerrar uma despesa,
basta um degrau com valor zero. Depois do último degrau, o valor se repete indefinidamente.

**Mês do motor.** O mês do fluxo vai de salário a salário, não de dia 1 a dia 30. Assim todo mês tem
exatamente um salário e um conjunto de despesas, mesmo quando cai em cinco semanas do calendário.
Trimestres, anos e décadas agregam esses meses, então todo trimestre tem três meses e todo ano tem doze.

**Suavização.** A curva usa média móvel de no mínimo um mês, e o hover lê exatamente a mesma série. Sem
isso o salário entrando em uma única semana apareceria como um salto de patrimônio de quase 3%.

## Decisões de projeto

- Escala de tempo logarítmica leve, `u = sinal(t)·ln(1+|t|/6 anos)`, mais densa perto de hoje.
- Eixo de valores em `asinh(P / 500 mil)`, para não achatar os primeiros anos.
- Cores: financeiro `#2E9E5B`, bens `#3B6FCB`, participações `#D9952A`, movimentações `#7C5CBF`.
- Status: verde `#2E9E5B`, laranja `#FA7A35`, vermelho `#D64545`. O laranja da marca substitui o amarelo,
  que não teria contraste suficiente sobre fundo branco.
- Participações societárias têm valor constante, sem remuneração modelada.
- Desktop-first. Abaixo de 1080 px as grades colapsam, mas não há versão mobile.

## Fora de escopo

Herança, versão mobile, múltiplos clientes no portal e persistência em servidor.
A planilha do fluxo de caixa foi feita para mouse e trackpad; não há gesto de pinça em tela de toque.

## Arquivos

| Arquivo | O que é |
|---|---|
| `evolucao-patrimonial.html` | Tela do cliente. Contém o motor de simulação, que é a fonte de verdade. |
| `tela-consultor.html` | Portal do consultor. Carrega uma cópia do mesmo motor. |
| `sync-motor.js` | Copia o motor de uma tela para a outra. |
| `verificar.js` | Roda a simulação em Node e confere as invariantes. |
| `PENDENCIAS.md` | O que falta fazer e o contexto dos testes com usuários. |
