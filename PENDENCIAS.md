# Pendências e contexto

Este arquivo existe para que uma nova sessão de trabalho consiga continuar sem depender da conversa
anterior. Leia junto com o `README.md`, que descreve como as duas telas funcionam.

## Como continuar

1. `node verificar.js` — roda a simulação em Node e confere as invariantes. Deve terminar com "Tudo certo".
2. Abra `tela-consultor.html` e `evolucao-patrimonial.html` no navegador. Os arquivos são autocontidos.
3. Escolha um item de **P1** abaixo.

## Armadilhas deste repositório

- **O motor está duplicado.** O mesmo bloco `<script id="engine">` existe nas duas telas, porque cada uma
  precisa abrir sozinha. Depois de mexer no motor pelo lado do cliente, rode `node sync-motor.js`.
  O `verificar.js` acusa quando os dois estão diferentes.
- **A identidade contábil é sagrada.** Em qualquer período, movimentações = entradas − saídas. Toda mudança
  no fluxo precisa passar por `node verificar.js`. Já foi quebrada duas vezes por engano.
- **O painel de preview do Claude Code carrega os arquivos como `data:`**, o que descarta o `#plano=` da URL,
  bloqueia `confirm()` e bloqueia o seletor de arquivos. Testes de integração ali dão falso negativo.
  Para testar de verdade, abra no navegador ou sirva a pasta por HTTP.
- **Cuidado ao apagar blocos grandes de JS por script.** Uma vez isso levou junto a função `renderGoals`.
  Prefira âncoras curtas e confira com `grep -c` depois.

---

# P1 — Bloqueia o uso real

### 1. Vocabulário da tela do cliente
Origem: teste com persona de cliente leiga. Foi a queixa mais longa do relatório.
Palavras que a cliente não entendeu: **aporte**, **custo pontual**, **patrimônio dedicado**,
**perpetuidade**, **consumo até 95**, **participações societárias**, **amortização**,
**cofre genérico**, **ajustáveis**, **alocação do patrimônio financeiro**, **renda vitalícia**,
**perfil conservador/moderado/agressivo**, **requer revisão** (soou como carro na oficina).
Decidir se a tela do cliente passa a usar linguagem do dia a dia enquanto o portal mantém o termo técnico.
Sugestões da própria cliente: "aporte" → "quanto guardar por mês"; "custo pontual" → "quanto custa de uma
vez"; "perpetuidade / consumo até 95" → "o dinheiro nunca acaba / o dinheiro acaba aos 95".

### 2. Rendas passivas — resolvido
As rendas contratadas aparecem como linhas de Entradas no fluxo de caixa, e o cadastro e a tabela da página
Liberdade financeira mostram a data e a idade de início e de fim. Cada renda começa numa data fixa (o INSS)
ou na liberdade financeira. Rendas passivas que não dependem da aposentadoria (aluguel de um imóvel) são
linhas normais de entrada, do tipo passiva.

### 3. Cliente-casal
Só existe um titular, e o campo "Idade hoje" está travado. O caso mais comum da consultora é um casal com
duas rendas e duas idades. Afeta o modelo do plano, a linha do tempo e o cálculo da liberdade financeira.

---

# P2 — Atrito forte no trabalho do consultor

### 0. Saque na liberdade: renda desejada ou rendimento inteiro?
A programação da renda (página Liberdade) mostra saque = renda desejada − rendas que entram, como a consultoria
planeja. O motor, porém, saca na perpetuidade o rendimento inteiro do patrimônio (e no consumo, a parcela até a
expectativa de vida) e ajusta o padrão de vida a isso. Quando o patrimônio rende mais que o necessário, a visão
do cliente mostra o cliente gastando mais do que a renda desejada. Decidir se o motor passa a sacar só o necessário.

### 4. Botão "ajustar para o aporte necessário"
Adiar um objetivo derruba o aporte necessário, mas o aporte definido continua onde estava e é preciso
digitar de novo. Um botão por objetivo, e talvez um "encaixar tudo no orçamento", resolvem.

### 5. Aluguel fora da planilha — resolvido
O aluguel é uma linha de despesa fixa com `endObj`: deixa de existir quando o objetivo indicado é realizado.
Qualquer despesa pode usar a mesma regra. Planos antigos com o campo `rent` são migrados.

### 6. Objetivos não estão na planilha — resolvido
Aportes, compras e custos recorrentes dos objetivos aparecem no fluxo de caixa como linhas só de leitura,
com o caminho para a página Objetivos. A página de Fluxo de caixa vem depois da de Objetivos.

### 7. Não existe desfazer
Nem na planilha, nem ao arrastar um marco na tela do cliente, nem ao remover um item. A remoção pede
confirmação em dois cliques, o resto não tem volta. Com a edição direto na célula, isso ficou mais urgente.

### 8. Arrastar o marco no cliente não volta para o portal
A nova data (e a nova idade de parar, ao arrastar a Liberdade Financeira) vive só na sessão do navegador do cliente. Depois da reunião, o consultor precisa repetir a
alteração no portal.

### 9. Depreciação de bens
Um objetivo é "consumo" ou "vira bem". Um carro vira bem e nunca perde valor. Falta um terceiro
comportamento, ou um percentual de depreciação ao ano.

### 10. Prioridade explícita do objetivo
Hoje a ordem de alocação do aporte é a ordem das datas. Quando o orçamento não cobre tudo, quem decide o
que fica sem aporte é o calendário, não o consultor.

### 11. Carteira de clientes
O plano vive no `localStorage` de um navegador e viaja por arquivo `.json`. Não existe lista de clientes
nem histórico de versões do plano.

---

# P3 — Refino

### 12. Edição em zoom agregado — resolvido
Numa coluna de trimestre, ano ou maior, o clique aproxima até o mês; só se edita em mês ou semana.
O editor diz quando o valor é de cada ocorrência (por exemplo, "todo mês são 2 ocorrências, dias 5 e 20").

### 13. Descoberta do arraste
A cliente disse que nunca descobriria sozinha que os marcos podem ser arrastados. Falta uma dica visual.

### 14. Tamanho do plano
Ícones enviados e fotos viajam embutidos como data URL. O limite por ícone é 120 KB, mas um plano com
muitos objetivos ilustrados fica pesado para caber numa URL.

### 15. Font Awesome exige internet
O ícone por classe é lido em tempo de execução a partir do CSS do CDN. Sem internet, cai no traço padrão.
O arquivo enviado pelo consultor funciona offline.

### 16. Emojis do fluxo
A cliente leu 💳 como "gastei no cartão" e achou as setas verde e vermelha mais claras. Os emojis foram um
pedido explícito, então fica registrado como ponto a reavaliar, não como erro.

### 17. Área do fluxo em telas baixas
Num notebook, a tabela de fluxo mostra poucas linhas. Considerar um divisor arrastável entre o gráfico e a
tabela.

### 18. Semana do ciclo — resolvido para linhas novas
Linhas com dia ou data caem na semana do calendário que contém a data, e as colunas de semana mostram o
intervalo (20–26/09/26). Continuam no formato antigo, por posição na semana (`week` de 1 a 4), as despesas
do mock que não têm dia definido; ao receber um dia no cadastro, passam para a regra nova.

### 19. Rolagem vertical na planilha do fluxo
A rodinha sobre as células é o zoom, então a página rola pela coluna de nomes ou fora da planilha. Com muitas
linhas abertas, avaliar um cabeçalho fixo.

---

# O que os testes com persona encontraram

Duas sessões de teste foram feitas por agentes encarnando personas, cada uma usando a ferramenta de verdade.
O que está listado acima em P1–P3 são os itens que **continuam abertos**. O resumo abaixo guarda o contexto.

## Consultora (Patrícia, 8 anos de profissão)

Veredito na época: *"não usaria amanhã com cliente real"*, por três motivos, **todos já corrigidos**:
o portal mostrava um patrimônio de R$ 653 mil que ela nunca digitou; um objetivo aparecia como "Alcançável"
mesmo estourando o orçamento do cliente; e a expectativa de vida não mudava nada.

O que ela elogiou e deve ser preservado:

- O parágrafo da liberdade financeira no portal, que explica em números o que ela fala para o cliente.
  Ela conferiu a conta de cabeça e bateu.
- A matemática por objetivo reagindo na hora.
- **Arrastar o marco na tela do cliente**, que ela chamou de melhor momento do produto: é a conversa
  "e se a gente adiar dois anos?" acontecendo ao vivo.
- O card do objetivo com foto, data, custo, perfil, aportes e a estratégia escrita.

## Cliente (Ana, 35 anos, leiga em finanças)

Veredito: *"animada com o final e confusa no meio"*.

O que ela entendeu sozinha: que a linha verde é o dinheiro dela e sobe; que as bolinhas são os sonhos; que
verde, laranja e vermelho dizem se o sonho cabe; e que aos 59 anos poderia parar de trabalhar.

O que a emocionou: a tela chamá-la pelo nome, as fotos dos objetivos, e a janela final da liberdade
financeira terminando com "para sempre".

Onde ela ficou ansiosa, e que vale vigiar em qualquer mudança futura:

- A janela vermelha do intercâmbio do filho, com "34% do necessário". Era o futuro do filho em vermelho, e
  a janela sumiu antes de ela terminar de ler. Hoje a contagem congela com o mouse em cima, mas o impacto
  emocional do vermelho continua.
- A queda do patrimônio a zero no modo de consumo. Hoje há uma faixa explicando que é intencional.

---

# Decisões tomadas, e por quê

Registradas aqui porque não são óbvias no código:

- **Laranja no lugar de amarelo** no status intermediário: amarelo puro sobre fundo branco não tem
  contraste, e o laranja já é a cor de score médio da identidade visual.
- **O mês vai de salário a salário**, não do dia 1 ao 30. Assim todo mês tem exatamente uma entrada e um
  conjunto de despesas, mesmo quando cai em cinco semanas do calendário.
- **A curva usa média móvel de no mínimo um mês**, e o hover lê a mesma série. Sem isso, a entrada do
  salário numa única semana aparecia como um salto de patrimônio de quase 3%, e o número do hover não
  batia com a curva desenhada.
- **A liberdade financeira não depende da ordem dos objetivos.** Ela acontece quando o patrimônio sustenta
  a renda desejada, descontado o que ainda falta para os objetivos pendentes. Adiar um sonho não empurra a
  aposentadoria junto.
- **Se aos 68 anos o patrimônio não sustentar a renda desejada**, o marco aparece mesmo assim, mas sem
  celebração: o card diz quanto o patrimônio de fato paga por mês.
- **Um objetivo sem recursos não é comemorado.** O card troca "realizado!" por "data desejada do objetivo",
  com selo vermelho e sem confete.
- **Participações societárias têm valor constante.** O crescimento anterior era um chute e foi removido.
- **O status do objetivo vem da simulação, não da fórmula fechada.** A fórmula dá o aporte necessário; a
  simulação diz o que o orçamento realmente entrega, que é o número honesto.
- **Na liberdade financeira a renda do trabalho para.** Antes o salário continuava entrando depois da
  aposentadoria, e o patrimônio em perpetuidade subia para R$ 15 mi aos 90 anos. Agora ele fica estável
  (cerca de R$ 4 mi), e no modo consumo chega perto de zero na expectativa de vida. O fluxo antes da
  liberdade não mudou. Rendas passivas continuam e reduzem o que o patrimônio precisa sustentar.
- **O portal tem uma página por assunto**, na ordem em que o plano é montado: Cliente, Fluxo de caixa,
  Patrimônio e premissas, Objetivos, Liberdade financeira. O fluxo veio para o segundo lugar (pedido do
  consultor): a capacidade de poupança fica logo abaixo dele, e os aportes dos objetivos aparecem no fluxo
  depois de definidos. "Próximo" sempre leva à página seguinte.
- **Rodinha na planilha do fluxo**: Ctrl aproxima, Shift anda no tempo, a rodinha sozinha rola a página
  (como no Miro e no Excalidraw). A visão do cliente segue a mesma regra: a rodinha anda no tempo, Ctrl dá
  zoom e Shift também anda; sobre a tabela do fluxo, a rodinha sozinha rola a tabela. Durante a reprodução,
  "Pular animação" vai direto ao final.
- **As barras de Movimentações usam uma escala só para o período inteiro** (comprimida com asinh, para
  um valor de 1 milhão não achatar os outros), e não a do que está à vista; assim não mudam de tamanho ao andar.
- **O objetivo se planeja pelo gráfico e cresce aos poucos.** Abre com nome, tipo, data, valor e quanto
  guardar; gastos depois (lista de custo fixo, Price e SAC), patrimônio reservado e perfil, e apresentação
  entram pelos botões "+". No gráfico, a linha tracejada muda só a data e a bolinha só o valor. O gráfico usa
  a conta do objetivo sozinho, e o status continua vindo da simulação.
- **Bem abaixo de 70% do valor na data não é comprado.** Antes a reserva pagava a diferença e o bem entrava
  no patrimônio com o selo "Requer revisão" (a casa de praia do exemplo: R$ 75 mil juntados, R$ 225 mil da
  reserva). Objetivos de consumo continuam sendo gastos, com o selo vermelho.
- **A média da curva não espalha saídas únicas.** Com o zoom aberto a média chegava a 26 semanas para cada
  lado, e a contratação de R$ 1,1 mi da liberdade aparecia como uma queda de R$ 225 mil.
- **Rentabilidade por objetivo**, num controle de 0,35% a 0,65% ao mês ao lado do gráfico; o perfil é o nome
  da faixa mais próxima.
- **Financiamento é calculado por sistema (Price ou SAC), taxa ao ano e prazo**, no lugar do percentual de
  amortização informado à mão.
- **A planilha do fluxo mostra o que a simulação calcula**, não o que foi digitado. Assim a linha de
  Movimentações é sempre entradas menos saídas, e depois da liberdade aparece o ajuste das despesas à renda.
- **A semana é mostrada pelo intervalo de datas**, não por número. "Semana 3" dependia de em que dia o mês
  começava; "20–26/09/26" não deixa dúvida, e cada ocorrência cai na semana que contém a sua data.
- **O INSS do mock tem data fixa em jun/2054**, a mesma data em que ele começava antes (60 meses depois
  da liberdade). Os números não mudaram; agora a data não se move se a liberdade mudar.
- **O valor de uma linha é o de cada ocorrência.** Um salário pago nos dias 5 e 20 é uma linha só, e o
  aumento vira um único degrau.
