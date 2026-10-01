# Evolução Patrimonial — Nord Liberta

Protótipo funcional de duas telas que se conversam. Ambas são arquivos HTML autocontidos, sem dependências
além das fontes do Google, e abrem direto no navegador.

| Arquivo | Para quem | O que faz |
|---|---|---|
| `tela-consultor.html` | Consultor | Configura o plano em cinco páginas: Cliente, Fluxo de caixa, Patrimônio e premissas, Objetivos e Liberdade financeira. |
| `evolucao-patrimonial.html` | Cliente | Mostra a trajetória do patrimônio ao longo da vida, apresentada ao vivo pelo consultor. |

## Por onde começar

- `node verificar.js` confere as invariantes do motor sem abrir o navegador.
- `PENDENCIAS.md` lista o que falta, em ordem de prioridade, com o contexto dos testes com usuários.
- `node sync-motor.js` copia o motor da tela do cliente para a do consultor. **Rode sempre que mexer no motor**:
  as duas telas são autocontidas e por isso carregam uma cópia cada.

## Como as duas telas se conectam

O consultor configura o plano no portal, e ele é gravado sozinho no armazém compartilhado (veja "Quem vê o quê e
onde os dados ficam", abaixo), de onde a área do cliente lê. Não há arquivo para trocar. O portal reabre no ponto
em que parou.

Na tela do cliente, o botão **"Fluxo de caixa"** abre a tabela numa janela própria, sem o gráfico e ocupando a tela
toda (`evolucao-patrimonial.html?fluxo`). Ela abre nos próximos 24 meses, mês a mês, com entradas e saídas já
detalhadas, e mostra o mesmo plano e a mesma proposta da tela principal.

## Jornada do cliente e gestão de riscos

A área do cliente é uma jornada de fases (os passos ao lado da marca, no cabeçalho): cada fase mostra um resultado do
planejamento e tem um espaço para o vídeo do consultor (link do YouTube, do Vimeo ou do arquivo, em `plano.videos`;
vazio, o espaço fica reservado). Hoje são duas: **Gestão de riscos** e **Evolução patrimonial** (a última). A fase
pode vir no endereço (`?fase=riscos`); senão, a tela abre na última vista.

**Gestão de riscos** avalia oito ameaças ao padrão de vida (`plano.riscos`, preenchido no portal, na página Gestão de
riscos). O status de cada uma sai de `ENGINE.avaliaRiscos`, no motor, igual nas duas telas:

| Ameaça | Em dia | Atenção | Crítico |
|---|---|---|---|
| Desemprego e emergência | reserva atual ≥ ideal | entre a mínima (40%) e o ideal | abaixo da mínima |
| Problema de saúde | plano adequado | pode ser otimizado | sem plano |
| Danos a terceiros | coberturas suficientes | cobertura menor que a ideal | necessidade sem cobertura |
| Ruína em investimentos | todos os itens verificados | algum item em atenção | algum item identificado |
| Risco de liquidez | avaliação do consultor | avaliação do consultor | avaliação do consultor |
| Proteção dos bens | todos protegidos | algum com proteção insuficiente | algum sem proteção |
| Proteção da renda / da família | todas as pessoas não precisam ou têm o necessário | alguém tem menos que o necessário | alguém precisa e não tem |

- Reserva ideal = custo de vida mensal × (d + t): d = 3 com dependentes financeiros, 0 sem; t pela natureza do
  trabalho (`ENGINE.NATUREZAS`, os da calculadora de reserva da Nord: servidor público e aposentado 3; estagiário e
  CLT 5; liberal, autônomo e empresário 7). O custo de vida vem do Fluxo de caixa (média das saídas dos próximos 12
  meses), a reserva atual vem do D+0 da liquidez; o consultor pode informar outros. Com a lista de dependentes do
  item 8, é ela que diz se há dependentes.
- A composição do patrimônio (financeiro, imóveis, participações) vem da página Patrimônio. O consultor informa a
  liquidez em reais (D+0 a 1 ano), e o cliente a vê em vezes o padrão de vida mensal (o custo de vida da reserva):
  R$ 60 mil com padrão de R$ 12.678 aparece como 4,7×.
- **Proteção da renda (seguro de acidentes pessoais) e da família (seguro de vida)**: a conta da calculadora de
  seguros da Nord (liberta.nordinvestimentos.com.br/seguros), em `ENGINE.calculaSeguros`, feita para cada gerador de
  renda da família (`plano.riscos.seguro.geradores`). Por pessoa:
  A renda que deseja proteger (a da família × a participação da pessoa; vazia, a renda do trabalho do fluxo);
  B renda passiva (a do fluxo × o percentual que o consultor dá à pessoa, 100% por padrão); C renda protegida (INSS
  por invalidez, ou pensão do INSS por morte); D renda a cobrir = A − B − C; E patrimônio financeiro × a parte da
  pessoa no patrimônio; F prazo; G valor presente de D por F, a 0,4% ao mês.
  Acidentes: F até os 95 anos da pessoa, necessidade = G − E. Vida: F até o último dependente deixar de depender
  (criança até os 25 anos, adulto até os 95, pela data de nascimento em `plano.riscos.dependentes`), H sucessão =
  5% a 20% (padrão 10%) × (financeiro + bens + participações) × a parte da pessoa, necessidade = G + H − E; sem
  dependentes, não é essencial. A cobertura atual de cada pessoa decide o status; a ameaça fica com o pior.
  O card do cliente segue a apresentação da Nord: a necessidade em destaque e a memória de cálculo de A a H.
  A doença grave, que a Nord pergunta, não entra na conta.
- Nota da família (0 a 100%): média ponderada dos status (em dia 1, atenção 0,5, crítico 0; não avaliados ficam de
  fora), com pesos editáveis em `plano.riscos.pesos` (todos 1 por padrão).
- O cliente simula à vontade (por exemplo, o custo de vida de 8.000 para 7.500 refaz a reserva na hora) e pode propor
  ao consultor, com justificativa, o custo de vida, o alvo de reserva, as idades e os prêmios do plano de saúde, os
  hospitais desejados e, nos seguros, o INSS (por invalidez e por morte) e a cobertura atual de cada pessoa. São alterações do tipo `campo` (qualquer caminho do plano), aprovadas como as outras.

## Propostas do cliente

A tela do cliente mostra o plano aprovado pelo consultor. O cliente pode, na própria tela:

- mudar o valor de uma entrada ou saída (clique na célula: a partir daquele mês ou só naquele mês);
- criar uma entrada ou saída nova (clique na célula de Entradas, Saídas, Fixas ou Ajustáveis, no mês em que ela
  começa) ou remover uma linha a partir de um mês (no mesmo clique da célula);
- mudar o custo e a data alvo de um objetivo (no card do marco, ou arrastando o marco);
- mudar a idade para parar de trabalhar (no card da Liberdade Financeira, ou arrastando-a).

**Nada disso muda o plano**: cada mudança vira uma alteração numa proposta, e a tela alterna entre "Plano atual" e
"Com as alterações" para o cliente ver o efeito. Ele revisa e envia; o consultor abre **Propostas do cliente** (no
menu, com o número de alterações), aprova ou recusa uma a uma, responde e conclui. Só as aprovadas entram no plano,
e a resposta fica registrada nele (`propostas: [{ id, em, decisoes, nota }]`).

## Quem vê o quê e onde os dados ficam

- **Cliente**: só a tela de Evolução Patrimonial (`evolucao-patrimonial.html`), com as ferramentas de proposta.
  Nada de preparo do consultor, nada para carregar ou baixar.
- **Consultor**: o portal (`tela-consultor.html`). "Abrir visão do cliente" apresenta o plano
  (`evolucao-patrimonial.html?apresentar`): sem editar, e mostrando a proposta que o cliente enviou.
  "Ver como o cliente vê" abre a tela exatamente como o cliente a tem.

O plano e a proposta ficam num armazém (`<script id="armazem">`, duplicado nas duas telas como o motor e sincronizado
pelo `sync-motor.js`). Na área logada da Nord Liberta, ele é a API da plataforma. No protótipo:

- **no link publicado no Claude**, é o banco compartilhado do próprio link (documentos `plano/atual` e
  `propostas/atual`): o consultor (dono do link) e o cliente (com quem o link foi compartilhado, como Contribuidor)
  usam cada um o seu computador e veem as mudanças do outro na hora. Quem não é dono cai na área do cliente;
- **em localhost**, é o armazenamento do navegador, com as duas telas no mesmo computador.

Não há troca de arquivos: o consultor grava o plano (sozinho, a cada pausa na edição), o cliente grava a proposta, e
cada tela ouve o que a outra gravou.
## Formato do plano

```jsonc
{
  "name": "Ana Ribeiro", "age": 35, "lifeExp": 95,
  "initialWealth": 500000,     // patrimônio financeiro do cliente hoje: ponto de partida do gráfico
  "capacityOverride": null,    // capacidade de poupança informada pelo cliente; null = salário − despesas
  "mode": "perp",              // liberdade financeira por "perp" (perpetuidade) ou "cons" (consumo até a expectativa de vida); a visão do cliente abre nela
  "tipo": "familia",           // "individual" ou "familia": sem família, o cônjuge some do cadastro
  "horizonte": "month",        // como o Fluxo de caixa abre: month, quarter, semester ou year
  "desired": 25000,
  "desiredSteps": [ {"from": 480, "value": 20000} ],   // a renda desejada muda a partir de um mês (0 = set/2026)            // renda familiar desejada na aposentadoria (R$/mês)
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
      "costs": [                // gastos depois de realizado; cada um vira uma linha de saída fixa
        { "id": "k1", "type": "fixo", "value": 800, "months": null, "label": "Condomínio" },           // months null = sem prazo
        { "id": "k2", "type": "sac", "principal": 756000, "rateYear": 0.095, "months": 360 }        // "price" ou "sac": juros e amortização mês a mês
      ],                        // planos antigos com "recurring" e "financing" são convertidos; "amort" num fixo é a fração antiga da parcela
      "dedicated": 45000,      // patrimônio já dedicado a este objetivo
      "profile": "moderado",   // nome da faixa; a taxa usada é rateM quando existe
      "rateM": 0.005,          // rentabilidade própria do objetivo, ao mês (o portal vai de 0,35% a 0,65%)
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

**Programação da renda.** No portal, a página Liberdade financeira mostra a renda desejada como uma barra e,
em cada janela de tempo (uma renda que começa ou termina abre uma janela nova), as rendas que entram: rendas de
aposentadoria e rendas passivas do fluxo. O saque do patrimônio completa até a renda desejada, limitado ao que o
patrimônio sustenta (o rendimento na perpetuidade, a parcela de consumo no outro modo); o resto aparece como falta.

- **Perpetuidade** (`mode: "perp"`): retirada mensal = patrimônio × taxa. O principal fica estável.
- **Consumo** (`"cons"`): retirada mensal = PMT até a expectativa de vida. O patrimônio chega a zero na data.
- **Renda desejada** (`"desej"`): retirada mensal = renda desejada − rendas que entram. O patrimônio pode acabar
  antes da expectativa de vida ou sobrar.

**Fluxo de caixa.** No portal, entradas e saídas aparecem como uma planilha com o tempo na horizontal,
na mesma estrutura da tela do cliente: Movimentações no patrimônio no topo, Entradas, e Saídas dividida
em Fixas e Ajustáveis. Ctrl + rodinha aproxima e afasta, de décadas até semanas; Shift + rodinha e arrastar andam no
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

**Gastos depois de realizado.** Cada objetivo tem uma lista `costs`: custo fixo por mês (com ou sem prazo) ou
financiamento, pelo sistema Price (parcela constante) ou SAC (amortização constante), com valor financiado,
taxa efetiva ao ano e prazo em meses. O motor calcula todo mês
o juro sobre o saldo devedor: os juros são despesa (linha "(juros)" nas saídas fixas) e a amortização vira
patrimônio em bens. O portal mostra a primeira e a última parcela, o total de juros e a tabela mês a mês.
Um custo fixo de plano antigo com `amort` (fração fixa da parcela) continua funcionando; trocar o tipo para
Price ou SAC passa a calcular mês a mês.

**Planejador do objetivo.** No portal, o objetivo abre com o básico (nome, tipo, data, valor e quanto guardar)
e um gráfico só dele: o saldo juntado até a data (tracejado, o caminho do aporte necessário), o que acontece na
data (vira bem ou é gasto) e, embaixo, o valor por mês antes e depois, com cada gasto na sua camada e no seu
prazo (a parcela SAC cai). A linha tracejada vertical arrasta só a data; a bolinha, só o valor; as barras,
quanto guardar e o primeiro custo fixo. Antes e depois da data o tempo tem escalas próprias. Gastos depois,
patrimônio reservado e perfil, e apresentação ao cliente entram pelos botões "+". É a conta do objetivo
sozinho; o status do cartão vem da simulação.

**Orçamento dos aportes.** Em cada mês antes da liberdade, sobra para aportes = entradas − despesas − gastos
dos objetivos já realizados (equivalente mensal, a mesma conta do motor). Um aumento de aporte que cria falta
em algum mês abre o orçamento desse mês e pede o que reduzir.

**Fotos do exemplo.** Ficam em `fotos/` e entram no plano pelo campo `photo`, como qualquer outro link.

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
isso o salário entrando em uma única semana apareceria como um salto de patrimônio de quase 3%. Saídas
únicas (contratação das rendas, compra de um bem, gasto de um objetivo) ficam fora da média: a curva cai
inteira na semana em que acontecem.

**Bem fora do alcance.** Um objetivo que vira bem e chega à data com menos de 70% do valor (Requer revisão)
não é comprado na simulação: o saldo fica na reserva e o bem e os gastos depois dele não entram. O portal
oferece usar como valor o que o cliente de fato junta até a data.

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
