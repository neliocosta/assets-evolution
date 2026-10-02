# Pendências e contexto

Este arquivo existe para que uma nova sessão de trabalho consiga continuar sem depender da conversa
anterior. Leia junto com o `README.md`, que descreve como as duas telas funcionam.

## Como continuar

1. `node verificar.js` — roda a simulação em Node e confere as invariantes. Deve terminar com "Tudo certo".
2. Abra `tela-consultor.html` e `evolucao-patrimonial.html` no navegador. Os arquivos são autocontidos.
3. Escolha um item de **P1** abaixo.

## Gestão de riscos (em aberto)

A gestão de riscos já existe (fase 1 da jornada do cliente e página "Gestão de riscos" no portal; veja o README).
Resolvidos em 01/10/2026: o seguro de vida e de acidentes pessoais (a conta da calculadora de seguros da Nord, com
os ajustes do usuário: renda que deseja proteger dividida entre os geradores de renda, adulto até 95 anos, criança
até 25, sucessão de 5% a 20%, 0,4% ao mês) e o vetor da natureza do trabalho (o da calculadora de reserva da Nord,
conferido simulando no site). Falta:

1. **Cadastro de bens.** O cadastro anterior já existe: a página Patrimônio e premissas lista os bens com valor de
   mercado e saldo devedor (`plano.patrimonio.bens`, veja "Fase da vida e patrimônio" abaixo). Mas a Gestão de riscos
   ainda tem a sua própria lista (`plano.riscos.bens.itens`, com nome, valor e proteção), e as duas não se falam: no
   exemplo, os nomes e valores foram igualados à mão. Falta a proteção de cada bem ser marcada sobre a lista do
   Patrimônio. O usuário vai mandar o material de coleta da Nord, com as demais informações de cada bem.
2. **Geradores de renda vindos do cadastro.** Os dependentes já são perguntados na página Cliente (02/10/2026) e só
   lidos no item 8. Os geradores de renda (quem é, a participação na renda, o INSS) continuam no item 7.
3. **Apólices enviadas pelo cliente.** O usuário quer que o cliente, ao responder, possa enviar as apólices atuais
   (vida, acidentes, doenças graves). Hoje a cobertura atual é um valor digitado.
4. **Divisão da renda passiva e do patrimônio por propriedade.** Hoje o consultor informa, por pessoa, o percentual da
   renda passiva e do patrimônio. O ideal, segundo o usuário, é ler a propriedade de cada bem (quem é dono de quanto),
   que também é a base do ITCMD.

O usuário ainda vai avaliar as telas de gestão de riscos e pode pedir ajustes.

## Fase da vida e patrimônio (em aberto)

A página existe (capítulo 4 da área do cliente; cadastro na página Patrimônio e premissas do portal; veja o README).
Em aberto:

1. **Fatores do patrimônio esperado diferentes da calculadora no ar.** A calculadora da Nord
   (liberta.nordinvestimentos.com.br/patrimonioideal), conferida em 02/10/2026 com 16 casos, usa 0 a 9× no Início de
   carreira, 9× a 70× na Consolidação, 70× a 250× na Plenitude e 250× na Liberdade. O usuário pediu os fatores novos
   (0,5× a 18×, 18× a 60×, 60× a 200×, 200×), que são os do protótipo (`ENGINE.FASES_VIDA`). As fases (2/9 e 6/9) e o
   total (bens + financeiro − dívidas) batem com a calculadora; ela não conta participações societárias, o protótipo
   conta.
2. **O saldo devedor não entra na evolução patrimonial.** A parcela já vai para o Fluxo de caixa (02/10/2026), mas o
   gráfico da evolução usa os bens pelo valor de mercado, sem descontar o saldo devedor nem a amortização. No exemplo
   da Ana, a parcela do apartamento começa "ainda não lançada" porque o fluxo antigo do exemplo paga aluguel.
3. **O cliente não propõe nada na página de patrimônio.** Na Gestão de riscos, ele simula e propõe; aqui só vê. Se ele puder corrigir
   valores (do bem, de uma instituição), a proposta é do tipo `campo` (por exemplo `patrimonio.bens.2.mercado`), e o
   total do plano já acompanha (`sincronizaPatrimonio` roda ao aplicar as propostas).
4. **Idade de quem?** A fase usa a idade do titular (`plan.age`) e a idade para parar de trabalhar dele. Num casal, cada
   um tem a sua fase; hoje há uma só.

**Link publicado** (para o usuário testar de outra máquina): https://claude.ai/artifact/LRmPxMYFK7TcoUkjYXatLX.
É uma cópia ajustada dos dois HTML: abre as telas na mesma aba (o visualizador bloqueia janelas novas), usa o
Font Awesome publicado junto (o visualizador bloqueia o cdnjs) e tem o banco compartilhado (capacidades `db` e
`user`, regras: `plano` só o dono grava, `propostas` grava quem é Contribuidor). Para republicar, gere a cópia a
partir dos arquivos do repositório com essas três trocas e publique no mesmo link, mantendo as capacidades.

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

### 20. "Hoje" fixo em 19/09/2026 (rodada 7)
O motor usa `TODAY = new Date(2026, 8, 19)` e o portal usa `HOJE` com a mesma data. Com a data real de 30/09,
o ano de 2026 conta o adiantamento de 20/09 e as feiras e plantões que já passaram (Camila: Entradas 2026
R$ 54.300 em vez de R$ 52.000; Juliana: plantões R$ 27.000 em vez de R$ 23.400), e o pontual sugere 19/set, que
já passou. Decidir se "hoje" vem do relógio ou de uma data gravada no plano, sem quebrar a identidade contábil
nem o `verificar.js`.

### 21. Idade nos marcos dos objetivos um ano menor (rodada 7)
Na visão do cliente, todo objetivo em setembro mostra um ano a menos (Viagem set/2028 "34 anos", esperado 35;
Faculdade do Marcos set/2029 "50", esperado 51; Sala da Juliana set/2031 "42", esperado 43). Provavelmente o
aniversário assumido é 19/09 (`BIRTH`) e o marco cai antes dele. A idade de hoje e a da liberdade estão certas.

### 22. Ponto da renda desejada não é removido (rodada 7, a única dúvida bloqueante)
A dica diz "dois cliques removem", mas dois cliques no ponto não o removem (5 tentativas). O arraste pula de
R$ 40.100 para R$ 39.900 e não volta ao valor exato; o ponto fica em `desiredSteps`, e a visão do cliente mostra
"muda com a idade".

---

# P2 — Atrito forte no trabalho do consultor


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
Com a conferência do orçamento, um aporte novo não estoura mais o orçamento; mas planos antigos, ou uma despesa
nova no Fluxo de caixa, ainda podem deixar objetivos sem aporte, e aí vale a ordem das datas.
Hoje a ordem de alocação do aporte é a ordem das datas. Quando o orçamento não cobre tudo, quem decide o
que fica sem aporte é o calendário, não o consultor.

### 11. Carteira de clientes
O plano vive no `localStorage` de um navegador e viaja por arquivo `.json`. Não existe lista de clientes
nem histórico de versões do plano.

### 23. Aviso "Falta definir quanto guardar" que não some (rodada 7) — resolvido
O aviso conta só os objetivos sem aporte que ainda precisam de aporte (o necessário acima de zero) e diz quais são.

### 24. Diálogo do orçamento (rodada 7)
Não oferece reservar patrimônio livre, que era a saída natural do Marcos (R$ 1,8 mi), e a tabela e o topo atrás
dele já mostram os aportes aplicados ("Folga mensal R$ -13.369") antes da decisão. O rótulo "Guardar só o que
cabe (+R$ 1.568/mês)" não diz se vale desde hoje ou só a partir do mês que estoura.

### 25. Retirada do patrimônio na visão do cliente (rodada 7)
No Marcos, a visão diz "Retirada do patrimônio R$ 32.000/mês", e o portal diz rendas de R$ 14.000 e saque de
R$ 5.221 (renda parcial). Os aluguéis parecem ficar de fora.

### 26. Idade de início das rendas na estratégia (rodada 7)
"INSS da Camila… a partir de 67 anos": a estratégia da liberdade usa a idade do titular (`CURRENT_AGE`) para
todas as rendas, mesmo as do cônjuge (`evolucao-patrimonial.html`, bloco "Estratégia" do card da liberdade).

### 27. Casal e troca de cliente (rodada 7)
"Plano de: Uma pessoa" vem marcado mesmo com a idade do cônjuge preenchida. "+ Novo cliente" apaga o plano sem
lembrar de baixar o `.json`, e o portal não diz como reabrir um plano baixado (ligado ao item 11).

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

### 28. Arredondamento do necessário (rodada 7)
O necessário mostrado e o gravado por "usar o necessário" diferem em R$ 1 (786/787, 2.333/2.334); o portal
mostra 99% e a visão do cliente 100% do necessário.

### 29. Sextas de 2027 (rodada 7)
Plantões semanais às sextas somam 52 em 2027, que tem 53 (01/01 e 31/12). Conferir a regra das semanas do ano.

### 30. Textos (rodada 7)
Resolvidos em 02/10/2026: a página Objetivos vazia aponta para a Liberdade financeira; a gaveta de despesa pergunta
"Paga em mais de um dia?"; a linha "Cofre genérico (reserva)" virou "Reserva (patrimônio livre)", nas duas telas. Continuam:
- A explicação do mês de salário a salário (agora em "Como usar a planilha") fala do dia 5 para quem não recebe nele.
- Um objetivo sem nome e sem valor aparece como "Alcançável".
- Price e SAC pedem o valor financiado quando o cliente só sabe a parcela.
- O cartão da casa não oferece encerrar o aluguel. Isso só se faz pela linha do aluguel, com "Até um objetivo
  ser realizado".

### 31. Favicon (rodada 7)
A primeira carga gera um 404 do `favicon.ico` no console.

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
  a janela sumiu antes de ela terminar de ler. Hoje o botão de pausa do card (um clique pausa, outro continua)
  segura a contagem; a pausa automática com o mouse em cima foi tirada porque parecia travamento. O impacto
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
- **Aporte não passa do orçamento.** Aumentar um aporte que faz faltar dinheiro em algum mês abre o orçamento
  daquele mês (entradas, despesas, gastos dos objetivos, sobra e aportes pedidos) e obriga a escolher: reduzir
  despesas ou aportes de outros objetivos a partir daquele mês (um valor em cada item, quantos forem, até cobrir
  a falta), guardar só o que cabe, ou cancelar. A conta é
  a mesma do motor (equivalente mensal) e bate com o que a simulação entrega. Mudanças de despesa no Fluxo de
  caixa ainda não passam por essa conferência.
- **Liberdade financeira: primeiro o cadastro, depois o gráfico.** As rendas se cadastram na própria tabela
  (nome, valor, começo, duração, custo; o resto na gaveta "⋯"), e a programação da renda vem no fim, com valores
  exatos até o real e cores suaves. A renda desejada pode mudar com a idade: dois cliques na linha tracejada criam
  um ponto que arrasta para cima e para baixo (`desiredSteps`); dois cliques no ponto o removem.
- **Como sacar na liberdade é decisão do planejador** (premissa do plano, e botões na visão do cliente):
  saques da perpetuidade (o rendimento; o padrão de vida acompanha), consumo até a expectativa de vida, ou
  saques da renda desejada (só o que falta; o patrimônio pode acabar antes ou sobrar).
- **O gráfico do objetivo mostra o que o orçamento entrega**, não só o aporte definido, para concordar com o
  selo: um objetivo com aporte suficiente mas orçamento curto aparecia com 100% no gráfico e "com ajustes".
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
- **Tela do cliente mais enxuta (01/10/2026).** A jornada saiu da faixa própria e foi para o cabeçalho, ao lado da
  marca; a legenda virou um bloco de duas linhas (patrimônio em cima, status dos objetivos embaixo); o botão "Hoje"
  saiu do gráfico (a tecla Home faz o mesmo) e continua só na janela do fluxo de caixa. Abaixo de 1300 px o
  "Olá, …" some para o cabeçalho caber em duas linhas.
- **Jornada em capítulos (01/10/2026).** Com 20 a 25 páginas previstas, os passos lado a lado não cabiam. O cabeçalho
  mostra só a página atual, com anterior e próxima, e o sumário lista capítulos e páginas. Os capítulos 1 a 4 são um
  esqueleto (5 páginas cada, "em breve"): troque os títulos e o conteúdo em `CAPITULOS` quando as páginas existirem.
- **Gestão de riscos em painel (01/10/2026).** Referências do usuário: dashboards do Dribbble (InTeam, QClay, Virtual
  Sports): um número ou uma marca dominante por cartão, cor só onde informa, detalhe num cartão largo. A teia mostra
  quanto de cada ameaça está resolvido; as oito sanfonas viraram um detalhe único, da ameaça clicada.
- **Carrossel das ameaças (01/10/2026).** Pedido do usuário: o cliente deve passar por todas. Um slide por ameaça
  (essencial no alto, detalhe embaixo), começando pela primeira, com os vizinhos à mostra nas bordas. O status verde
  passou a se chamar "Protegido".
- **Fase da vida e patrimônio (02/10/2026).** Pedido do usuário, com duas telas de referência (curva da vida, cinco
  fases e barras de liquidez ideal, financeiro, bens, dívidas, total, mínimo, esperado e máximo). Entrou como capítulo 4
  (o esqueleto ficou nos capítulos 1 a 3), antes da Gestão de riscos e da Evolução patrimonial, que usam o mesmo
  patrimônio. O detalhe do patrimônio (`plano.patrimonio`) passou a ser a única fonte dos totais do plano: os três
  campos de valor da página Patrimônio viraram listas (instituições, empresas, bens com valor de mercado e saldo
  devedor). O exemplo da Ana usa os dados do usuário (R$ 860 mil no financeiro, R$ 50 mil em participações, R$ 1,21 mi
  em bens com R$ 368 mil de saldo devedor), e os bens da Gestão de riscos foram igualados a eles; com isso a simulação
  de exemplo mudou (antes, R$ 500 mil no financeiro, R$ 150 mil em participações e nenhum bem). O padrão de vida é o
  custo de vida da reserva, o mesmo da liquidez em vezes o padrão. Sem a idade em que começou a trabalhar, a página
  mostra o patrimônio sem a fase. O status protegido, atenção e crítico é só das ameaças: aqui a leitura é em
  palavras ("abaixo do mínimo", "entre o esperado e o máximo").
- **Patrimônio ideal refeito para o cliente (02/10/2026).** O usuário pediu: sem a curva da evolução do patrimônio (só as
  idades de cada fase) e sem copiar o slide, com as referências de UX já usadas na Gestão de riscos (dashboards do
  Dribbble: um número dominante por cartão, cor só onde informa). Ficou: a fase atual e a trilha das cinco fases com as
  idades; três cartões (patrimônio total com a composição, esperado para a idade numa régua mínimo–esperado–máximo,
  dinheiro disponível contra a liquidez ideal); as classes em colunas, com bens e dívidas que abrem o detalhe; e a conta
  do esperado recolhida, com a tabela das fases deste cliente. A régua tem posições fixas (mínimo 20%, esperado 50%,
  máximo 80%), como a régua da calculadora da Nord, para que um total muito acima do máximo não esmague as marcas.
- **Dívidas com detalhe e renda do bem (02/10/2026).** Pedido do usuário: toda dívida tem crédito contratado, parcelas
  contratadas, parcela atual, situação (em dia ou inadimplente) e juros contratados; e um bem pode gerar renda passiva.
  O detalhe vale igual para o financiamento de um bem (aparece quando o saldo devedor é maior que zero) e para as outras
  dívidas (lista nova: pessoal, consignado, cartão). A renda do bem não é um valor digitado de novo: o bem aponta para a
  linha de renda passiva do Fluxo de caixa, que o consultor escolhe ou cadastra dali mesmo, para o valor não ficar em
  dois lugares. Os detalhes da dívida do exemplo (crédito, parcelas, parcela, juros) são ilustrativos.
- **Revisão de UX do portal (02/10/2026).** O usuário achou o portal "poluído e contraintuitivo" e que Patrimônio e
  premissas são coisas de momentos diferentes. O que mudou:
  - Oito passos em três grupos na barra lateral: dados do cliente (Cliente, Fluxo de caixa, Patrimônio), planejamento
    (Gestão de riscos, Objetivos, Liberdade financeira, Premissas) e com o cliente (Apresentação, Propostas).
  - Cada campo foi para a página do seu momento: o tipo de plano (uma pessoa ou casal), a idade em que começou a
    trabalhar e os dependentes vão para Cliente; "abrir o fluxo em meses ou anos" vai para o Fluxo de caixa; o modo de
    saque vai para Liberdade financeira; as rentabilidades ficam sozinhas em Premissas; os vídeos de todas as páginas do
    cliente vão para Apresentação, que mostra também o que cada página vai exibir e o que falta.
  - Página sem moldura: título com o passo, uma frase do que se faz ali e blocos-cartão, um por assunto. As explicações
    longas (casal, planilha, rendas, objetivo ou despesa futura, dependentes, pesos) ficam recolhidas em "?".
  - Os indicadores do topo (capacidade, aportes, folga, liberdade) só aparecem onde ajudam a decidir: Fluxo de caixa,
    Objetivos e Liberdade financeira. "Plano de Ana Ribeiro" saiu do topo: o nome já está na barra lateral.
  - Gestão de riscos: uma ameaça por vez, escolhida em abas com o status de cada uma, com anterior e próxima no pé; os
    pesos ficam recolhidos.
  - A barra lateral tem um botão só ("Apresentar ao cliente") e o "Ver como o cliente vê" como link.
- **Patrimônio ideal em largura total e tudo mais conectado (02/10/2026).** Retorno do usuário: o cartão do esperado
  era pequeno; ele queria comparar o total com o mínimo e o máximo da fase e ver o financeiro contra a liquidez ideal
  pintada ao fundo. O dinheiro disponível passou a dizer só o ideal, o que o cliente tem e se está bom (sem
  percentual, também no portal). A parcela da dívida entra no Fluxo de caixa como a renda do bem já entrava. A página
  Liberdade financeira abre com o que o patrimônio sustenta (perpetuidade e consumo, já com as rendas na fase de menor
  renda), para o consultor decidir a renda desejada com esses números.
- **Cartões sempre alinhados e o patrimônio em escada (02/10/2026).** Regra do usuário, para qualquer página: cartões
  lado a lado em linhas diferentes têm as mesmas larguras (as bordas batem de uma linha para a outra); se não der, um vai
  em cima e o outro embaixo. Os cartões de patrimônio total e de dinheiro disponível usavam colunas diferentes das do topo
  (fase e vídeo) e saíram. A barra da composição parecia mostrar proporção, e o usuário quer mostrar soma: o patrimônio
  total foi para o gráfico do patrimônio ideal, como uma escada (financeiro, mais participações, mais bens, menos
  dívidas, igual ao total), na mesma escala do mínimo, do esperado e do máximo da fase. O dinheiro disponível ficou só na
  faixa da liquidez ideal, que diz quanto falta quando o financeiro está abaixo dela. As colunas de "De onde vem o seu
  patrimônio" também perderam o percentual.
