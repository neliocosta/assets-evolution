# Área logada do cliente — a experiência

Como o cliente vive a área, tela a tela. Os degraus (Visitante, Cadastrado, Clínica, Completo) estão definidos em
[README.md](README.md). Regra geral: **um esqueleto só, acumulativo, e cada tela mostra as camadas que existem para
aquele cliente**. Nada de cadeado nem de "disponível no plano completo" espalhado; onde falta, aparece o próximo
passo.

Revisado em 24/10/2026 a partir de duas rodadas de avaliação com personas
([avaliacao-2026-10-24.md](avaliacao-2026-10-24.md) e [avaliacao-2026-10-24-rodada-2.md](avaliacao-2026-10-24-rodada-2.md)).
As referências entre colchetes, como [B6] ou [I15], apontam para o achado que motivou a regra. As decisões que o dono
do produto tomou sobre as propostas da avaliação estão em "Decisões de 24/10", no fim.

Duas ideias atravessam todas as telas e vêm antes de qualquer layout:

1. **O protagonista é o objetivo, não o plano.** O planejamento nunca diz "guarde mais R$ 1.500 por mês". Diz "para
   a viagem à Itália em julho de 2028 são R$ 1.500 por mês; por isso estamos revendo o orçamento da casa para que
   sobrem esses R$ 1.500". Toda tarefa, todo número e todo lembrete nomeiam o sonho a que servem. O destaque maior
   da área é o mesmo das primeiras páginas do livro: o propósito do planejamento e os objetivos que ele realiza.
   **Objetivo é o que a pessoa quer alcançar agora**, e nem sempre é um sonho de consumo: para quem está endividado,
   o objetivo é quitar a dívida; para quem nunca guardou, é a primeira reserva; para quem fez a clínica, é o que foi
   combinado nela. Quem não tem um sonho com foto nunca fica sem protagonista [B2, B8, B11].
2. **O esqueleto é a escalada.** Não há calculadoras soltas. O passo mais importante muda conforme a etapa e o
   perfil: para quem está endividado, o passo não é a liberdade financeira. O exame de saúde financeira serve para
   situar o cliente na escalada, e a área sempre aponta o próximo passo. Em paralelo corre a jornada educacional.

Planejamento financeiro é uma tarefa que ninguém quer fazer. A interface precisa ser visual, intuitiva e dar senso
de progresso e realização a cada avanço, como o gráfico animado da Evolução patrimonial já faz. Mais sobre isso em
"Princípios de interface", no fim.

## Quem é o cliente: pessoa, casal ou casa dividida

O plano pode ser de uma pessoa ou de um domicílio, e quase todas as telas dependem disso [B6].

- **Na criação da conta**, uma pergunta: "O planejamento é só seu ou de vocês dois?". Se for de dois, a conta nasce
  como **domicílio** com dois membros, e o cônjuge recebe um convite para ter o próprio login. Até o convite ser
  aceito, o que falta dele aparece dito, nunca somado como zero: "a renda do Rafael ainda não foi informada".
- **O vetor guarda por membro o que é de cada um** (renda, data em que cada entrada cai, respostas pessoais do
  exame) e **por domicílio o que é dos dois** (patrimônio, despesas, objetivos, poupança). A sobra, a qualificação e
  o plano leem o domicílio.
- **O exame do casal**: Patrimônio e Poupança são do domicílio; Atitude e Consciência são de cada um e aparecem lado
  a lado, sem média.
- **Casa dividida sem ser casal** (quem mora com a mãe, com amigos): o exame pergunta "você divide as contas da
  casa? qual é a sua parte?". O custo de vida é a parte da pessoa.
- **Tarefas têm responsável**: uma pessoa ou "os dois". O lembrete vai ao responsável. A primeira resposta fecha a
  ocorrência e o outro recebe "Rafael marcou: fiz".
- **Mudanças no plano** seguem a regra do degrau (ver "A tarefa em si"): com consultor, ele aprova e escreve à
  família; não há mecanismo próprio de concordância entre os dois.
- **Linguagem**: ações no singular de quem lê ("você marcou"); plano e sonhos no plural ("a casa de vocês"); a ação
  do outro pelo nome ("Rafael marcou"). A autoria aparece no histórico, ao tocar, nunca como placar entre os dois.

## A escalada (o esqueleto de tudo)

A Nord já usa sete etapas: **Sobreviver → Descobrir → Construir → Focar → Proteger → Otimizar → Desfrutar**. Esses
nomes valem. A mecânica abaixo vem de uma metodologia explorada antes e **não aprovada**
([referencias/metodologia-escalada-nord.md](referencias/metodologia-escalada-nord.md)): fica aqui o que dela
serve, encaixado nos sete nomes, e cada critério é proposta até o dono do produto bater o martelo.

**Versão básica, por ora (decisão de 24/10).** A escalada inteira será redesenhada depois. Até lá, a área usa só o
necessário para funcionar: os sete nomes, um passo atual por cliente, a régua simples abaixo e o foco do consultor
acima da régua. Os refinamentos que a avaliação sugeriu ficam guardados em "Para o redesenho da escalada", no fim
desta seção, e não entram no mock nem no código da primeira versão.

**Onde a escalada aparece, e onde não.** A escalada é uma referência macro, paralela ao dia a dia: o cliente a
olha de vez em quando, no fechamento do ano ou na reunião anual, para saber onde está e quanto subiu. No uso
diário ela não aparece: o Painel mostra o próximo passo em linguagem direta ("completar a reserva mínima: faltam
R$ 20 mil"), sem nome de mundo, sem mapa. **Nem na entrada**: o resultado do exame é dito em linguagem direta, sem
mapa e sem número de mundo [I8]. Mundos, o que já está resolvido e marcos vivem na Jornada. A regra de tom é esta:
nada que soe bobo ou infantil para um adulto que está cuidando do próprio dinheiro; nada de emoji, de medalha, de
mascote, de nome de objeto de aventura. A sensação de progresso vem de números e de movimento sóbrio.

### Três alturas: mundo, passo, tarefa

A estrutura é a dos mundos do Duolingo, não a estética: o cliente tem um macro (em que mundo está e quanto falta),
um meso (o passo em que está dentro do mundo) e um micro (a tarefa de hoje), e vê evolução nos três quando olha.

| Altura | O que é | Quanto dura | Onde aparece |
|---|---|---|---|
| **Mundo** (etapa) | Uma das sete etapas; o cliente está sempre em exatamente uma | meses a anos | a Jornada |
| **Passo** | Um avanço com critério verificável dentro do mundo ("reserva mínima completa", "3 meses seguidos com sobra"); é o "próximo passo mais importante" | semanas a meses | o cartão do Painel e a **tela do passo** |
| **Tarefa** | O que se faz hoje ou nesta semana para cumprir o passo (as seis categorias de "Tarefas") | dias | Tarefas, WhatsApp |

**A tela do passo** [B13] é aberta pelo cartão do Painel: o que o passo pede em uma frase, o critério de conclusão
com o andamento ("R$ 8.900 de R$ 20.000"), por que importa (o sonho que ele protege), as tarefas do passo com as
respostas e, no pé, "ver onde isso está na escalada", que leva à Jornada. Não mostra o mapa.

Cada mundo é uma trilha de passos: os concluídos preenchidos, o atual em destaque, os seguintes em cinza. Concluir
um passo é registrado com movimento suave; concluir um mundo é um marco anotado na Jornada.

### Os sete mundos (proposta de critérios)

Princípios herdados da metodologia: um critério único e verificável por mundo; o cliente nunca está "entre dois";
o que é paralelo (seguro, tributário, sucessão) não é etapa, é algo **resolvido** que o cliente carrega; mundos
longos têm **marcos internos** baseados em transições do patrimônio, não em tempo.

A coluna "Resolvido ao sair" usa nomes funcionais [I8]; a metáfora de equipamento de escalada (corda, capacete,
grampos) fica de fora, porque soa a jogo.

| Mundo | Pergunta | Passos típicos (trilha) | Critério único de saída (proposta) | Resolvido ao sair |
|---|---|---|---|---|
| **1. Sobreviver** | Consigo fechar o mês sem afundar? | mapear dívidas; renegociar as caras; teto da semana; parar de gerar dívida nova | Sem dívida cara e 3 meses seguidos sem saldo negativo | Orçamento que fecha |
| **2. Descobrir** | Onde estou e para onde quero ir? | exame; fase da vida; **começar a sobrar**; objetivos com valor e data; o número da liberdade | Sobra positiva por 3 meses, cada objetivo com valor, data e aporte, e o número da liberdade definido | Plano |
| **3. Construir** | Tenho base para subir? | sobra automática; primeiros R$ 500; um mês de custo guardado; reserva mínima; reserva aceitável; aporte no dia certo | Reserva mínima completa e 3 meses seguidos de aporte feito | Reserva; aporte automático |
| **4. Focar** | Estou pondo o dinheiro onde o sonho está? | política de distribuição; caixinhas por objetivo; primeiros R$ 100 mil; 12 aportes seguidos no ritmo combinado | 12 aportes seguidos cumpridos (no ritmo combinado) e todo objetivo com caixinha e aporte | Política de aportes |
| **5. Proteger** | Um imprevisto derruba o que construí? | proteção do perfil (invalidez e saúde para todos; vida quando há dependentes); liquidez por prazo; reserva ideal; previdência básica | Proteção do perfil contratada e reserva ideal completa | Seguros |
| **6. Otimizar** | O dinheiro trabalha mais do que eu? | carteira recomendada; eficiência tributária; pró-labore e dividendos; estrutura patrimonial; rendimento > aporte; Coast FI | Rendimento médio mensal maior que o aporte e Coast FI atingido | Carteira; estrutura |
| **7. Desfrutar** | Vivo do que construí? | estratégia de retirada; sucessão e testamento; legado; check-up anual | Renda passiva sustenta o custo de vida; retirada definida e rodando | Sucessão; retirada |

Marcos internos para celebrar nos mundos longos (4 a 6): os primeiros R$ 100 mil, 25% / 50% / 75%
do número da liberdade, o rendimento pagando uma conta real (a escola, o aluguel), cobrindo metade e depois todo o
custo de vida. A narrativa de 4 → 6 é a transferência de esforço: em Focar o cliente empurra sozinho; em Otimizar
a montanha começa a empurrar; em Desfrutar ela faz quase tudo.

### O nivelamento (versão básica)

O exame é o **nivelamento**: acontece antes dos mundos e coloca o cliente onde ele está. A régua simples, pela
ordem:

1. tem dívida cara ou saldo negativo → 1;
2. não tem sobra, ou não tem objetivos com valor e data → 2 (sem sobra, o passo é "começar a sobrar" [B8]);
3. reserva abaixo da mínima → 3;
4. aportes irregulares ou objetivo sem caixinha → 4;
5. proteção necessária faltando → 5;
6. rendimento menor que o aporte → 6;
7. vive de renda → 7.

Duas regras valem já, porque outras telas dependem delas:

- **O consultor prevalece sobre a régua** [B11]. Na Clínica e no Completo, o foco escolhido pelo consultor define o
  próximo passo; o mundo calculado vira contexto na Jornada.
- **O que se pula aparece como "não se aplica"**, nunca como conquistado [I8].

### Para o redesenho da escalada

Sugestões da avaliação de 24/10, guardadas para quando a escalada for redesenhada (não entram na primeira versão):

- critério de sobra mais preciso (sobra média abaixo de 5% da renda em 3 meses) e janela de 3 meses para entrar e
  sair de Sobreviver, para que um mês ruim não rebaixe [B8];
- "dívida cara" definida por taxa, com o consignado em dia fora de Sobreviver [D9];
- quem tem patrimônio e não tem objetivos formais fica no mundo que o patrimônio indica, com a pendência destacada
  [I8];
- proteção pelo perfil: sem dependentes, invalidez e saúde; seguro de vida só com dependentes [I16];
- marcos para quem está começando (primeiros R$ 500, um mês de custo guardado) [I23];
- nomes funcionais para o que fica resolvido ao sair de cada mundo, sem metáfora de equipamento [I8].

### O que já está resolvido (e o que falta)

Na Jornada, uma lista sóbria do que já está resolvido (orçamento, plano, reserva, seguros, carteira, estrutura,
sucessão) e do que falta. Um cliente avançado com algo faltando (patrimônio alto e sem reserva separada) não é
rebaixado: o que falta aparece como **pendência destacada** dentro do mundo atual e vira um passo da trilha. É assim
que as orientações da clínica se encaixam: o consultor escolhe quais passos e pendências focar.

### O ano e os três números

O ritmo anual, igual para todos: **o planejamento do ano** (início do ano: meta de aporte e próximo marco), a
**revisão trimestral** e o **fechamento do ano** (fim do ano: quanto subiu, o que o mercado fez, marcos
conquistados) [D4]. As revisões de 3, 6 e 12 meses do Realizado são essas revisões.

Três números, em três velocidades, para que a motivação não dependa do mercado [D10]:

1. **Caminho até a liberdade** — % do número da liberdade (macro, muda devagar). Só existe quando o número da
   liberdade está definido; antes disso, o lugar dele é ocupado pelo próximo marco ("primeiros R$ 500").
2. **O ano** — o avanço do patrimônio nos últimos 12 meses (médio).
3. **Ritmo** — aportes feitos no ritmo combinado: "8 de 12" para quem aporta todo mês, "1 de 2" para quem aporta
   na distribuição semestral, "3 meses seguidos com sobra" para quem está começando (micro, 100% sob controle do
   cliente) [B7].

Quando o mercado cai e o caminho recua, os dois últimos sustentam a leitura: o mercado atrasou, o esforço não
parou. Os três ficam na Jornada e no fechamento do ano; no Painel só o Ritmo aparece.

### A jornada educacional

Corre ao lado da escalada: para cada mundo, os conteúdos (vídeo teórico do capítulo, comitê mensal, quiz opcional)
que explicam por que aquele passo importa. **Nada é bloqueado** [B15]: todo conteúdo fica na biblioteca, aberta a
qualquer cliente logado; o mundo e o perfil só decidem o que aparece como "recomendado para o seu passo".
Conteúdo pelo perfil: o empresário recebe pró-labore, dividendos e holding; quem está começando recebe orçamento e
primeira reserva [I25]. Assistir e responder são tarefas da categoria educacional quando o consultor ou o plano as
pedem. Em Conteúdos ficam também as **lives mensais de planejamento** (abertas a todo logado, com a gravação das
anteriores) e, no Completo, os **materiais de atualização e as monitorias mensais**, que fazem a ponte entre uma
reunião semestral e a próxima. Quanto gamificar além dos marcos é decisão pendente.

## A entrada (Visitante, antes do login)

**A pessoa chega por algum lugar**, e a entrada continua a conversa de onde ela veio [B15]:

- **Links por tema.** Cada postagem, campanha ou indicação aponta para um tema (liberdade, reserva, dívida,
  começar a sobrar), e o link abre direto a calculadora daquele tema, com a premissa da postagem citada ("a conta
  dos 300"). O exame vem depois, como "veja o resto do seu quadro".
- **Programa de bem-estar da empresa** [B4]. Uma entrada própria, com o nome do programa e, antes de qualquer
  pergunta, a frase de privacidade: "Sua empresa não vê os seus dados. Ela vê só números do grupo, sem nomes." O
  colaborador entra como Cadastrado com a origem "programa da empresa", já com o primeiro token (ver "O programa de
  bem-estar da empresa", abaixo). Quem chega pelo código de um colega também ganha um token.
- **Sem origem** (endereço digitado, busca): a escolha abaixo.

1. **A escolha.** Acima das duas portas, três linhas [B4]: o que a pessoa leva ("um plano para os seus objetivos e
   um lembrete do que fazer a cada mês"); quem é a Nord e como é remunerada; e um exemplo real da resposta ao "não
   fiz" (a tela que mostra o efeito no sonho), que é o que nenhum outro aplicativo faz. Depois as duas portas:
   "Explorar as calculadoras" (sem guardar nada) e "Criar a minha conta", que guarda o que você responder para
   montar o seu planejamento. Abaixo, em uma linha, "Como funciona" (o vídeo). Sem promessa de cronômetro ("em 30
   segundos" soa a captura) [B4].
2. **Explorar.** O visitante começa pelo exame (quantas perguntas e quanto tempo leva, ditos antes de começar) ou
   pela calculadora do tema. O resultado do exame vem em linguagem direta, dizendo o que já está resolvido
   ("reserva: em dia") e o próximo passo, sem mapa e sem número de mundo [I8]. A área sugere a calculadora do passo,
   com "ver outras calculadoras" ao lado [I7]. A calculadora da liberdade mostra as premissas (rentabilidade real,
   inflação, perpetuidade ou consumo do patrimônio) e deixa editá-las; quando a resposta é ruim ("aos 55 não dá"),
   mostra as três alavancas lado a lado: aportar mais, parar mais tarde, gastar menos depois [I7, D17]. Os valores
   vivem só na sessão; um aviso discreto no alto diz "nada é guardado; crie a conta para não perder", e o convite
   repete no fim de cada calculadora. **"Continuar no computador"** manda o link da sessão por e-mail ou WhatsApp
   [I26].
3. **Criar a conta.** O cadastro diz o que pede e por quê: e-mail ou celular para entrar, a pergunta "só você ou
   vocês dois?", e o consentimento de uso dos dados (LGPD) com a forma de apagar a conta. O WhatsApp é opcional e
   pedido à parte, com consentimento próprio para os lembretes [B1, B4]. A conta leva os valores da sessão para o
   vetor sem pedir de novo. A liberdade calculada na entrada já aparece como o primeiro objetivo, para confirmar
   [D17]. O cliente cai no Painel com o passo e **as primeiras tarefas propostas**, que ele aceita ou descarta uma a
   uma [I2].

Daqui em diante, tudo é área logada.

## O programa de bem-estar da empresa

Para o colaborador de uma empresa com o programa, a área é a mesma do Cadastrado, com duas peças a mais (decisão de
24/10).

### Os tokens

Todo colaborador é elegível à clínica, sem qualificação de renda. Para **pedir a clínica**, ele junta **5 tokens**:

| Como ganha | Tokens |
|---|---|
| A empresa dá ao entrar no programa | 1 |
| Fazer o exame de saúde financeira | 1 |
| Participar de uma palestra, live ou evento | 1 por evento |
| Indicar um colega que se cadastra com o seu código | 1 por indicação |
| Cadastrar-se pelo código de um colega | 1 (para quem foi indicado) |

Assim, quem entrou, fez o exame, assistiu a uma palestra e indicou dois colegas já pode pedir a clínica, e quem foi
indicado começa com dois tokens. O desenho incentiva compartilhar.

Na área, os tokens aparecem em linguagem adulta, sem placar nem medalha: uma linha no Painel ("Faltam 2 tokens para
a sua clínica"), e em Conversas a lista de como ganhar os que faltam, com o código de indicação para copiar. Ao
chegar a 5, "Pedir a minha clínica" vira a primeira opção.

### O que a empresa vê

A empresa tem um painel próprio, **só com dados agregados**, nunca de uma pessoa:

- o histórico de utilização (adesão, exames feitos, participação em eventos, clínicas realizadas);
- os resultados agregados do exame de saúde financeira e a **evolução da saúde financeira** do grupo ao longo do
  tempo;
- as **categorias de objetivos mais comuns** (compra de um bem, como carro ou casa; viver uma experiência, como uma
  viagem; conquista financeira, como segurança ou liberdade).

Nenhum recorte do painel mostra um grupo pequeno a ponto de identificar alguém (um mínimo de pessoas por recorte,
a definir). É isso que sustenta a frase da entrada.

## Navegação (Cadastrado, Clínica e Completo)

| Destino | Pergunta que responde | Cadastrado | Clínica | Completo |
|---|---|---|---|---|
| **Painel** | Qual é o próximo passo mais importante, e como está o conjunto? | ✓ | ✓ | ✓ |
| **Objetivos** | O que eu quero realizar, e como cada um está indo? | os dele | os combinados na clínica + os dele | os do plano, com a liberdade e a carteira como complementares |
| **Tarefas** | O que preciso fazer, e fiz? | ✓ (propostas pelo sistema e as suas) | ✓ | ✓ |
| **Plano** | O que combinamos, por quê, e onde estão todos os meus números? | Status | Status com as orientações da clínica | o livro completo + Status |
| **Realizado** | O que aconteceu de verdade contra o planejado? | a partir do primeiro registro | tarefas, sobra e colchão; open banking pontual em estudo | aportes, orçamento, patrimônio |
| **Conteúdos** | O que preciso entender para dar o próximo passo? | ✓ | ✓ | ✓ |
| **Jornada** | Onde estou na escalada e na relação com a Nord? | ✓ | ✓ | ✓ |
| **Conversas** | Com quem falo, e o que está esperando resposta? | ✓ | ✓ | ✓ |

**No celular** [I19], a barra inferior tem Painel, Objetivos, Tarefas, Plano (abre no Status) e "Mais" (Realizado,
Conteúdos, Jornada, Utilitários). O Status nasce no celular e por isso está na barra; o Realizado nasce no desktop
e fica em "Mais". **Conversas** é o botão "Falar com alguém" no cabeçalho, à direita, com o contador do que espera
resposta; não há botão flutuante disputando espaço com a barra. **No desktop**, o menu lateral mostra tudo, com
Conversas no pé. **Utilitários** são as calculadoras sem valores salvos: ajudam a decidir, não gravam nada no vetor.

Os lembretes não são um destino: são um atributo de cada tarefa. A tela atual de lembretes avulsos deixa de existir
como página; o que ela faz passa para dentro da tarefa.

Por trás de tudo há **um vetor só de variáveis atuais** por cliente (por membro e por domicílio, quando há dois),
com data e origem em cada valor (coleta, cliente, consultor, open banking). Qualquer tela que mostra um número lê
desse vetor; qualquer tela que pede um número grava nele; e a cada gravação o resumo, as calculadoras e o plano se
reajustam. Além das variáveis atuais, o vetor guarda **mudanças futuras conhecidas** com data (a promoção de março,
a licença-maternidade, o IPVA de janeiro a março, a distribuição de dezembro), que entram no plano a partir da data
[I16].

**Cada número sabe onde se corrige**: o toque mostra a origem e um "atualizar", que leva à vertical do Status ou à
calculadora correspondente; ao gravar, a pessoa volta à tela de onde saiu com o aviso "o plano se ajustou" [AV].

## Painel — o plano numa página

A referência é o *One Page Financial Plan*: numa tela só, as variáveis importantes do planejamento, com os
objetivos no alto e os números a serviço deles. É a primeira tela ao entrar e o destino do link do WhatsApp quando
não há tarefa específica. Celular primeiro; no desktop, os mesmos blocos em duas colunas.

**O próximo passo fica acima da dobra** [I20]. Em 390 × 844 sobram cerca de 640 px úteis: cabem o bloco 1 em faixa
compacta e o cartão do passo. Por isso o bloco 1 é uma faixa, não uma página de fotos.

1. **O propósito e os objetivos** (no alto, em faixa compacta de cerca de 140 px). A frase do propósito em uma linha
   e os objetivos em cartões pequenos com foto, rolando na horizontal, cada um com a data e um traço de progresso
   ("Itália · jul/2028 · 42% guardado"). Toque leva ao ambiente do objetivo. **O que ocupa este bloco depende da
   situação**, e nunca fica vazio:

   | Situação | O bloco 1 mostra |
   |---|---|
   | Tem objetivos | os objetivos, como acima |
   | Em Sobreviver, com dívida | "Quitar o cartão · saldo R$ 4.800 · previsto para junho", com traço de progresso; os sonhos, se houver, vêm depois e menores [B2] |
   | Sem sobra e sem objetivo | "Minha reserva · R$ 1.000 · até dezembro", sugerida pronta, na escala da renda [B8, I14] |
   | Cadastrado sem objetivo, com sobra | o convite para criar o primeiro, com exemplos na escala da renda dele; é o único convite grande da tela |
   | Clínica sem objetivo combinado | "O que combinamos em 12/09": as orientações da consultora, em frases dela, com o andamento de cada uma, e abaixo "temas para uma próxima conversa" [B11] |
   | Completo antes da apresentação | "Seu plano está em montagem", com as etapas e as datas (ver "Plano em montagem") [I5] |

   Quando a soma dos aportes dos objetivos passa da sobra, uma linha discreta abaixo dos cartões: "Os objetivos
   juntos pedem R$ 5.400 por mês; sobram R$ 4.900. Ver como priorizar", que leva a "O caminho" (as duas linhas do desejo e da realidade) [B9].
2. **O próximo passo mais importante.** Um cartão só, em linguagem direta: "O passo agora é completar a reserva
   mínima: faltam R$ 20 mil, previsto para março. É o que protege a Itália de um imprevisto." Vem da escalada (ou
   do foco do consultor), mas não a nomeia. Toque abre a **tela do passo**. Sem aporte não há previsão, e a frase
   muda: "no ritmo de hoje, sem data; com R$ 300 por mês, março de 2028" [I22].
3. **A próxima tarefa.** Uma só (decisão de 25/10): a vencida ou a de hoje, com o sonho a que serve e há quanto
   tempo está atrasada, se estiver. O cartão inteiro é o alvo: o toque o abre ali mesmo com as quatro respostas (Fiz,
   Fiz parte, Não fiz, Adiar), para que o "não fiz" esteja a um toque [B13]. Abaixo, uma linha "mais 3 nesta semana"
   leva a Tarefas, que é a área à parte das outras. O Painel nunca lista várias tarefas.
4. **Os números do plano, numa olhada.** Quatro números fixos e "ver todos" [I10]: a **sobra** do mês, a
   **reserva** atual × alvo, o **patrimônio** hoje × esperado para a fase, e a **nota de saúde financeira** (como
   evolução desde o último exame, não como placar). "Ver todos" abre a lista completa: renda e custo de vida,
   cobertura de seguros (%), aporte da liberdade e idade prevista, os cinco pilares. Cada número com origem e
   "atualizar" no toque. Só aparecem os preenchidos. **Em Sobreviver**, os quatro são renda, custo de vida, sobra e
   dívida total. No Clínica, os combinados vêm com o rótulo "combinado na clínica de 12/09" (que vira "combinado em
   12/09, ajustado por você em 3/11" quando o cliente edita) [I22].
5. **O ritmo.** Em todos os degraus a partir do primeiro registro [I10]: uma representação visual no **ritmo
   combinado**, não no calendário [B7]. Para quem aporta todo mês, doze colunas suaves com o planejado e o feito em
   dinheiro dedicado aos objetivos e a linha "Em 12 meses vocês dedicaram R$ 21.600 de R$ 24.000 planejados". Para
   quem aporta por evento (distribuição, bônus), os ciclos do ano ("distribuição de junho: R$ 30 mil de R$ 30 mil;
   dezembro: a caminho"). Para quem está começando, os meses com sobra ("3 meses seguidos com sobra; outubro:
   R$ 150, mais que setembro"). Toque leva a Realizado.
6. **O próximo encontro** (uma pílula): "Reunião semestral em 12/12 com Patrícia" / "Check-up disponível em
   12/09/2027" / "Próxima live: 18/11" / "Agendar uma clínica" / "Faltam 2 tokens para a sua clínica".

**A pílula de ação principal é uma só por tela** [D11]: no Painel, é o botão do cartão do passo.

## Objetivos — o ambiente de cada sonho

Fora do livro, um ambiente por objetivo, que é para onde o Painel leva e onde o consultor entra com o cliente na
reunião semestral. **É a fonte única do objetivo** [I6]: o capítulo Objetivos do livro mostra uma linha por objetivo e
o link para cá; uma proposta feita aqui ou no livro é a mesma proposta, vista dos dois lados. É acumulativo: o
cadastrado cria e planeja o seu; na clínica, o consultor planeja junto, e o que o cliente cria continua dele e é
visto pela consultora [B14]; no completo, vem do plano com toda a profundidade.

### Os tipos de objetivo

Nem todo objetivo é um montante numa data [I24]. A calculadora embutida muda conforme o tipo:

| Tipo | Exemplo | O que se planeja |
|---|---|---|
| **Montante na data** | Itália em jul/2028; entrada da casa | valor na data, o que já há, aporte |
| **Despesa que começa** | escola do filho a partir de 2029, R$ 2.000/mês | quando começa, quanto custa por mês, quanto guardar antes para a transição |
| **Troca de despesa** | a casa própria: sai o aluguel de R$ 2.800, entra a prestação de R$ 3.500 | o montante da entrada e o efeito no fluxo depois da data |
| **Dívida a quitar** | o cartão: saldo R$ 4.800, juro 12% a.m. | saldo, taxa, parcela, data de quitação, ordem entre credores |
| **Reserva** | a primeira reserva, R$ 1.000; a reserva mínima | alvo por liquidez e prazo, o que já há (ver "O que conta como reserva") |
| **Liberdade financeira** | parar aos 55 | é objetivo em todos os degraus; o Status lê dele, não o contrário [I7] |
| **Carteira** (Clínica e Completo) | a carteira recomendada | aderência à recomendação |

Todo objetivo também tem uma **categoria**, escolhida ao criar: **compra de um bem** (carro, casa), **viver uma
experiência** (viagem, ano sabático), **conquista financeira** (segurança, reserva, liberdade, quitar uma dívida).
Serve para a leitura do cliente e para o painel agregado da empresa no programa de bem-estar.

**O que conta como reserva** [I14]: dinheiro com liquidez diária (D+0 ou D+1) e sem risco de perda no resgate,
separado dos objetivos. O ambiente mostra "liquidez disponível × reserva separada": quem tem R$ 1,8 milhão com
liquidez D+1 não aparece com "reserva R$ 0"; aparece com "R$ 0 separado; R$ 240 mil disponíveis em D+1", e o passo
é separar. Para quem já tem patrimônio, a reserva se faz por **remanejamento** (uma tarefa única), não por aporte
mensal. A empresa do cliente não entra na reserva nem no patrimônio financeiro; aparece à parte, como
participação.

### Os cinco blocos

Cada objetivo tem cinco blocos, numa página só com rolagem:

1. **O sonho.** Foto, nome, por que importa (o texto do cliente; no casal, o de cada um ou um texto conjunto
   editável pelos dois [D21]), a data e o progresso em destaque ("42% guardado · jul/2028"). No celular, ocupa a
   primeira tela ao abrir. No self-service, a frase de propósito vem sugerida e editável, e a foto é opcional, com um
   banco de imagens neutro [D5].
2. **O plano para chegar lá.** O que custa na data, quanto já há, de onde vem o dinheiro (aporte mensal, aporte por
   evento como o bônus ou a distribuição, venda de um bem, 13º, remanejamento de outro objetivo), a estratégia e a
   curva até lá. No Cadastrado, é aqui que ele planeja, com a calculadora do tipo embutida; no Completo, é a página
   do capítulo Objetivos.
3. **O que precisa ser feito.** As tarefas ligadas ao objetivo, de todas as categorias, com o responsável quando há
   dois: o aporte do mês, a comportamental que libera o dinheiro ("fatura até R$ 6.000"), a burocrática ("abrir a
   conta onde o dinheiro vai ficar"), a educacional. Marca-se dali mesmo.
4. **Como está indo.** A curva planejada com os pontos reais, e os cartões do acompanhamento (aportes cumpridos,
   cobertos por outro objetivo, que faltaram, saldo), em grade 2 × 2 no celular. É a lente de Realizado deste
   objetivo.
5. **Mudar.** Simular outra data, outro valor, outro aporte e propor ao consultor (Completo) ou ajustar direto
   (Cadastrado e Clínica), sempre com o antes e o depois e a confirmação (ver "A tarefa em si").

A **liberdade financeira** e a **carteira recomendada** entram aqui com os mesmos cinco blocos: a liberdade é um
sonho com data (a idade), aporte e curva; a carteira é um objetivo com as tarefas de recomendação (bloco Carteira) e
o "como está indo" sendo a aderência à carteira recomendada. Assim a reunião semestral percorre uma lista só: cada
objetivo, como está, o que falta, o que muda.

### O caminho: o desejo e a realidade (antes "Os objetivos juntos")

A tela que mostra todos os objetivos de uma vez (decisão de 25/10). É a imagem do princípio 1: o protagonista é o
objetivo. Abre pelo chip do Painel ("pedem R$ 5.506; sobram R$ 2.500") e pelo alto da lista de Objetivos [B9].
Tem destaque alto, mas mora num lugar só: não entra no Painel, que responde "o que faço agora?"; esta tela
responde "estou no caminho, e o que mudaria se eu apertasse?".

**Duas linhas do tempo, uma sobre a outra**, na metáfora da travessia do DESIGN.md (tempo na horizontal, laranja
à frente):

- **A linha de cima é o desejo**: os marcos na data em que a família quer cada um. "Reserva em 2 meses, viagem em
  1 ano e meio, casa em 4 anos, intercâmbio em 6, parar de trabalhar aos 60."
- **A linha de baixo é a realidade**: a data em que cada marco se paga, seguindo o orçamento e os aportes de hoje.
  "Reserva em 8 meses, viagem em 3 anos, casa em 12, intercâmbio em 19." É a mesma conta do "no ritmo de hoje"
  do detalhe do objetivo e do efeito do "não fiz": uma variável só, três lugares.
- Cada marco liga as duas linhas por um fio; o comprimento do fio é a distância entre o sonho e o ritmo.

**Os controles ficam junto do gráfico**, nunca numa faixa à parte:

- **Dois sliders**: o aporte mensal (quanto a família dedica aos objetivos) e o ajuste do orçamento (quanto corta
  dos gastos ajustáveis, que vira aporte). Ao arrastar, os marcos da linha de baixo deslizam ao vivo, aproximando-se
  ou afastando-se da linha de cima. Os valores iniciais são os do plano.
- **A ordem de prioridade**, arrastável, decide quem recebe o dinheiro primeiro quando ele não dá para todos
  (decisão de 25/10): o dinheiro vai todo para o objetivo 1 até ele se pagar, depois para o 2, e assim por diante;
  no máximo, divide a atenção entre o 1 e o 2. Reordenar move as datas da linha de baixo, e a tela diz o que
  mudou ("a casa veio de 2038 para 2031; o intercâmbio foi de 2033 para 2045"). No casal, a ordem é decisão a dois
  (ver "Quem é o cliente").
- A **distribuição do patrimônio que já existe** entre a reserva e os objetivos ("os R$ 60 mil: R$ 25 mil na
  reserva, R$ 35 mil na casa"), feita uma vez e editável, aparece como o ponto de partida de cada marco.

**A linha de baixo nunca vem sozinha** (decisão de 25/10). Junto do diagnóstico vem sempre a saída: "com R$ 400 a
mais por mês, a casa volta para 2031". Quando a distância é grande (o intercâmbio de 6 para 19 anos), é essa frase
que segura a pessoa na tela, não o número; é a diferença entre a verdade que a cliente exigente pede e o "me senti
burra" de quem fecha a calculadora (a Ana e a Juliana da avaliação do mock).

**O que o slider faz muda com o degrau** (decisão de 25/10):

- **Cadastrado e Clínica**: mexer e confirmar muda o plano direto, com o antes e o depois (ver "A tarefa em si").
- **Completo**: o slider é **simulação**, rotulada assim na tela, e termina em "Propor à Patrícia", que leva a
  proposta à fila da consultora com o antes e o depois de cada objetivo. Nada muda até ela aprovar.

**A mesma peça em três momentos:**

1. **Na entrada (Visitante)**, a calculadora da liberdade já é esta peça com um marco só e as três alavancas. Fisga.
2. **Na reunião de apresentação do plano**, a consultora mostra a distância entre o desejo e a realidade e a
   fecha ao vivo, mexendo nos sliders na frente da família. É a cena central da apresentação, hoje ausente dela, e
   nasce na ferramenta de desenho do plano (ver `PRODUCT.md`): a área logada não a inventa, a herda.
3. **Na área logada**, a família revisita a imagem, e a reunião semestral começa por ela.

No Cadastrado, ordenar aqui é o que "ordenar as prioridades" quer dizer: a primeira prioridade define o próximo
passo do Painel e as tarefas propostas [I21]. No celular, as duas linhas ficam uma sobre a outra em 390 px, com
rolagem horizontal do tempo; os sliders abaixo do gráfico; a lista de prioridade abaixo dos sliders.

## Tarefas — o coração

### As categorias

As tarefas não são todas iguais. Cada categoria tem a sua forma, a sua recorrência típica e o seu jeito de marcar.

| Categoria | O que é | Forma da tarefa | Exemplos |
|---|---|---|---|
| **Dedicar dinheiro** | Separar dinheiro para um destino | valor, quando (ver abaixo), destino (objetivo, reserva, liberdade, dívida, colchão), de onde sai, responsável | "R$ 771 para a Faculdade do Pedro, no dia do salário"; "R$ 30 mil para o colchão, na distribuição de dezembro"; "R$ 400 para quitar o cartão" |
| **Comportamental** | Um hábito ou limite a manter num período | limite, período, como se verifica | Teto da semana: "até R$ 1.200 de gastos ajustáveis nesta semana, em qualquer meio: cartão, Pix, débito"; "nenhuma despesa pessoal no cartão da empresa" |
| **Burocrática e contratação** | Documento, conta, produto, pessoa | prazo, responsável, o que entregar, **roteiro** quando há um | "Renegociar o rotativo" (com o roteiro: canal do credor, o que pedir, Desenrola, portabilidade); "Abrir uma reserva com liquidez diária e garantia do FGC"; "Reunir os informes para o IR" |
| **Interação com a Nord Liberta** | Algo a fazer na plataforma ou com o consultor | prazo, link direto | "Marcar a reunião semestral"; "Enviar a apólice"; "Atualizar o patrimônio" (trimestral) |
| **Educacional** | Aprender o que sustenta o passo | prazo, conteúdo, quiz opcional | "Assistir ao comitê de novembro"; "Ver o vídeo do capítulo Proteção" |
| **Carteira** (só com consultor) | Recomendações de investimento, bloco próprio | ativo, ação, valor, prazo | "Resgatar R$ 110 mil do fundo X para a reserva em D+0"; "Aportar R$ 5.000 no Tesouro IPCA 2035" |

A categoria **Carteira só existe na Clínica e no Completo** [I2]: recomendação de ativo no self-service, sem
consultor, soa a venda. No Cadastrado, a orientação de onde guardar é sempre neutra e sem marca ("uma reserva com
liquidez diária e garantia do FGC"), ligada a um vídeo [I14].

Toda tarefa nomeia o objetivo ou o passo a que serve ("para a Itália", "para quitar o cartão", "para fechar o
mês"), mesmo as burocráticas. Nunca "para sair do vermelho" [D2].

### Quando a tarefa acontece

A renda não é igual para todos, e a tarefa segue a renda de quem a faz [B7, I3]:

- **No dia em que o dinheiro entra.** A área pergunta uma vez em que dia cada entrada cai (salário, adiantamento,
  consultório, plantão) e propõe as datas a partir delas. O padrão "no dia, às 9h" só vale quando não há essa
  informação.
- **Por evento de renda.** "Na distribuição de dezembro", "no bônus de março", "no 13º": a tarefa tem uma janela
  (dezembro) e um gatilho ("caiu?"), não um dia fixo. O 13º, as férias e a PLR são fontes de tarefa de dedicar
  dinheiro, lembradas com antecedência ("o 13º chega em novembro; quanto dele vai para a reserva?").
- **Em parcelas.** Uma tarefa de aporte pode ter partes em datas, origens e responsáveis diferentes: "R$ 1.500 no
  dia 5, da Camila; R$ 800 no dia 20, do Rafael".
- **O aporte do mês (o padrão).** As tarefas de dedicar dinheiro do mesmo dia viram **uma** tarefa no dia em que o
  salário cai, "Aporte de outubro: R$ 2.000", com a divisão pelos objetivos dentro ("R$ 900 para a casa, R$ 600 para
  o carro, R$ 500 para a liberdade") e um "Fiz" só. Cada objetivo continua nomeado; o que se junta é o gesto. É
  assim por padrão, e é o que mantém o WhatsApp entre 10 e 15 mensagens por mês [I3].
- **Meta anual.** Quem guarda de forma irregular planeja o ano: "R$ 40 mil no ano: R$ 1.500 por mês e R$ 22 mil no
  bônus de março". O Realizado e o Ritmo leem o ano, não só o mês [B7].
- **Colchão de renda irregular.** Para quem recebe por evento, uma fonte de mão dupla: entrar no evento ("R$ 30 mil
  da distribuição para o colchão") e **sair** nos meses magros ("transferir R$ 5 mil do colchão para a conta
  pessoal; restam R$ 20 mil") [B7].

### De onde nasce

Nenhuma tarefa é digitada do zero quando pode nascer de um número ou de uma decisão do plano. **No Cadastrado, o
sistema propõe as primeiras tarefas a partir do exame e do passo, e o cliente aceita ou descarta cada uma**; depois,
cria as suas a partir de qualquer vertical do Status [I2].

| Fonte | Categoria | Exemplo |
|---|---|---|
| Aporte de objetivo (`objectives[].planned`) | Dedicar dinheiro | "R$ 771 para a Faculdade", na recorrência do objetivo ou no aporte do mês |
| Aporte da liberdade (`desired`, `retireAge`) | Dedicar dinheiro | "R$ 3.131 para a liberdade" |
| Reserva abaixo do alvo (`politica.reservaMensal`) | Dedicar dinheiro | "R$ 1.000 na reserva" até atingir; no Cadastrado, o valor inicial é proposto pela sobra (ver "Começar a sobrar") |
| Remanejamento para a reserva (patrimônio sem liquidez separada) | Carteira | "Resgatar R$ 110 mil para a reserva em D+0" (tarefa única) |
| **Começar a sobrar** (sem sobra) | Dedicar dinheiro e Comportamental | "Agendar R$ 100 no dia do salário para a reserva"; "Escolher um gasto para cortar neste mês" [B8] |
| **Dívidas mapeadas** (credor, saldo, taxa) | Dedicar dinheiro e Burocrática | "R$ 400 para quitar o cartão"; "Renegociar o rotativo", com roteiro, na ordem do juro mais caro [B2] |
| Colchão de renda irregular | Dedicar dinheiro | entrada no evento, saída nos meses magros |
| Eventos de renda (13º, férias, PLR, bônus, distribuição) | Dedicar dinheiro | "Quanto do 13º vai para a reserva?" |
| Orçamento combinado e teto da semana | Comportamental | "Fatura até R$ 6.000", com as semanas |
| Próximos passos do capítulo Evolução | Burocrática | "Abrir a previdência PGBL" |
| Bloco 11 da coleta (`tarefasList`) | Burocrática ou Interação | "Enviar a apólice do seguro de vida"; as de responsável "consultor" vão para a fila dele |
| Recomendações da carteira (passo `micro`) | Carteira | "Resgatar o fundo X e aplicar em Y" |
| Jornada educacional do passo atual | Educacional | "Ver o vídeo do capítulo Proteção" |
| Oportunidades de economia (roteiro "onde sobra", open banking, consultor) | Comportamental ou Burocrática | "Cancelar a assinatura Z" |
| Patrimônio sem atualização há 3 meses | Interação | "Atualizar o patrimônio" |
| Criada à mão (cliente ou consultor) | qualquer | livre |

Quando o plano muda (o consultor aprova uma proposta, o cliente recebe aumento), as tarefas recorrentes recalculam o
valor a partir da próxima ocorrência. A tarefa guarda o valor pedido naquela ocorrência (é a foto); o plano segue
vivo.

### Começar a sobrar

Para quem fecha o mês em zero, o ciclo começa um passo antes: **achar o dinheiro, automatizar e ver o número
crescer** [B8]. A ordem:

1. **De onde tirar.** O roteiro "onde sobra" (assinaturas, tarifas, plano de celular, delivery, a divisão das contas
   da casa), feito à mão, cada item virando tarefa. Não depende de open banking.
2. **Um valor pequeno e automático.** No self-service, a primeira tarefa de dinheiro é proposta em até 3% da renda
   (editável), agendada no dia do salário: "R$ 100 para a sua reserva, no dia 5". Nunca a regra 50/30/20 de saída.
   **Quando há consultor (Clínica ou Completo), quem define o valor é o consultor.**
3. **Subir devagar.** Depois de três meses seguidos cumpridos, a área sugere subir um degrau ("que tal R$ 150?"). Nunca
   sobe sozinha.

### A tarefa em si

Um cartão: título, o objetivo a que serve, valor ou limite, quando, categoria, responsável (quando há dois), e as
respostas, grandes, no celular:

- **Fiz** — grava a data e o valor planejado. Se a pessoa guardou outro valor (a mais, com o bônus; a menos), toca
  no número e corrige [I3].
- **Fiz parte** — pede o valor (ou, numa comportamental, quanto gastou).
- **Não fiz** — e aqui está o valor do planejador: a tela responde na hora com **o que isso faz com o objetivo** e
  **o que fazer em vez disso**, calculado pelo motor:
  > Sem esse aporte, a Faculdade fica para março de 2040 em vez de janeiro. Para manter a data, os próximos 11 meses
  > passam de R$ 771 para R$ 841.

  Quando a tarefa cobre vários objetivos (o aporte do mês), a tela mostra **o efeito somado** numa frase ("todos
  os objetivos atrasam um mês; para manter as datas, o próximo aporte sobe R$ 72") e a saída sugerida em destaque;
  o efeito objetivo a objetivo fica em "ver por objetivo" (decisão de 25/10).

  As saídas, sempre na mesma ordem:
  1. **Manter a data** (o aporte seguinte sobe);
  2. **Adiar o objetivo** (a data anda);
  3. **Ajustar ao que coube** (o valor feito vira a nova meta e a data se estica) [B8];
  4. **Usei em outro objetivo** (o dinheiro foi para outro destino; conta como "coberto", não como falta) [I3].

  Depois de **duas faltas seguidas** da mesma tarefa, a área sugere a saída 3, nunca a 1: abaixar a meta, não
  aumentar [B8]. Quem já está em zero de sobra não vê a saída 1.
- **Adiar** — nova data e um motivo. Com consultor (Clínica e Completo), o motivo é uma frase curta que ele lê
  ("o corretor remarcou; fica para daqui a uma semana"). **No Cadastrado, não há leitor**: o motivo é uma escolha
  opcional ("o salário atrasou", "gasto inesperado", "esqueci") que serve a ele mesmo e sugere um ajuste, nunca uma
  justificativa escrita para ninguém [I4]. A tarefa não conta como falta; conta como adiada. Adiar a mesma tarefa
  duas vezes mostra um aviso suave e, com consultor, entra na fila dele.

**O efeito do "não fiz" depende da categoria e do horizonte** [I15, B2]:

| Caso | O que a tela mostra |
|---|---|
| Objetivo de prazo curto ou médio | a nova data e o novo aporte, como no exemplo |
| Objetivo longo (liberdade, 10 anos ou mais) | o dinheiro a menos na data ("R$ 6.800 a menos hoje são R$ 14 mil a menos aos 55") e o ritmo do ano; a data só quando ela muda de forma relevante |
| Dívida | a nova data de quitação e os juros a mais ("o cartão quita em agosto, não em junho, e custa R$ 380 a mais") |
| Reserva e colchão | o mês em que o dinheiro acaba e o compromisso que fica descoberto ("o colchão acaba em abril; a guia de maio sai do longo prazo"), com a saída "resgatar agora" |
| Comportamental | o teto que resta para o resto do mês |
| Burocrática | o risco que segue aberto ("sem o seguro, a casa fica descoberta") |
| Educacional | nada: só a nova data |

**Quem decide o que a escolha faz com o plano** [B3]:

- **No Cadastrado e na Clínica**, a escolha é um ajuste direto: a tela mostra o antes e o depois do objetivo, pede
  confirmação e cria uma versão datada do plano (README › Premissa 6).
- **No Completo**, a mudança é aprovada pela consultora, que normalmente escreve uma mensagem à família ao aprovar.
  Enquanto isso, a escolha vale **como provisória**: o próximo lembrete já sai com o valor escolhido, e o objetivo
  mostra "ajuste provisório, aguardando a Patrícia" com o prazo de resposta (2 dias úteis). Quando ela aprova, o
  provisório vira versão; quando ajusta, o cliente vê o que mudou e por quê. Se o prazo passa, o provisório continua
  valendo e a pendência sobe na fila dela.

Cada tarefa tem a sua **página**, aberta pelo título: editar (data, valor, lembrete, responsável), comentar, ver os
detalhes e o histórico (criada por quem, quando; cada resposta, com quem respondeu; cada adiamento e motivo; o que a
falta fez com o plano). É onde o cliente dá contexto e onde o consultor responde. Numa comportamental com teto da
semana, a página mostra as semanas como barras com o limite e o gasto de cada uma. No celular, as seções da página
ficam recolhidas, abertas pelo título.

Cada tarefa tem o **lembrete** como atributo, não como objeto à parte: canal (WhatsApp), dia e hora, antecedência. O
padrão vem da categoria e da renda (dedicar dinheiro: no dia em que a entrada cai, às 9h; por evento: na abertura da
janela e quando o dinheiro cai; burocrática: três dias antes do prazo; comportamental: no começo de cada semana;
educacional: na véspera do comitê). O cliente muda em um toque; o consultor vê e pode ajustar a hora e o canal a
pedido do cliente.

### O lembrete no WhatsApp

**Regras de convivência** [B1], antes do texto:

- **Consentimento.** O primeiro envio só acontece depois de o cliente autorizar os lembretes no cadastro ou na área.
  Toda mensagem termina com "parar lembretes", que desliga em um toque e pode ser religado na área.
- **Volume e agrupamento** (decisão de 24/10): **entre 10 e 15 mensagens por mês**, contando o fechamento e as
  repetições depois de um "não fiz". O volume se controla juntando o que é parecido: em vez de um lembrete para o
  carro, outro para a casa, outro para a reserva e outro para a liberdade, **um lembrete no dia em que o salário cai**
  para separar o valor de cada objetivo (o aporte do mês, abaixo). O consultor agrupa as tarefas de dedicar dinheiro
  ao registrar a clínica ou o plano, e o sistema faz o mesmo no self-service. O teto da semana vai com as
  burocráticas da semana na mensagem de segunda.
- **Prévia neutra.** A primeira linha, que aparece na tela bloqueada, nunca traz valor, objetivo nem a palavra
  "dívida": "Seu lembrete da Nord para hoje".
- **Só tarefas.** O número dos lembretes manda lembrete e fechamento, nada mais. Ofertas, se houver, vão por outro
  canal, com consentimento próprio [I25].
- **Sem emoji**, como em toda a área. As respostas são texto, com os mesmos rótulos da área: **Fiz · Fiz parte ·
  Não fiz · Adiar** [I1].
- **Tom pelo perfil** [I25]: a versão padrão explica em uma frase; a versão curta (para quem prefere, ou perfil
  avançado) traz só o número e a ação.

A mensagem já traz a decisão pronta e nomeia o objetivo. As respostas são os links do `/taskChecker`, que já grava
fez/não fez no perfil do cliente sem login (id da tarefa + código + `complete=true|false`); onde o canal permitir
botões, os links viram botões:

> Seu lembrete da Nord para hoje.
> Ana, hoje é dia de guardar R$ 771 para a Faculdade do Pedro. Já fez?
> Fiz → `/taskChecker?…&complete=true`
> Fiz parte → abre a tarefa na área, já com o campo de valor
> Não fiz → `/taskChecker?…&complete=false`
> Adiar → abre a tarefa na área, já na nova data
> Ver a tarefa · Parar lembretes

Versão curta:

> Seu lembrete da Nord para hoje.
> Distribuição de dezembro: R$ 30 mil para o colchão. Feito? Fiz · Fiz parte · Não fiz · Adiar

- **Os links são pessoais e de uso único** [B1, B12]: cada membro recebe os seus, e a resposta grava quem tocou.
  Expiram quando a ocorrência fecha (ver "Estados e transições").
- "Fiz" grava o valor planejado. "Fiz parte" e "Adiar" abrem a área, porque precisam de um número ou de uma data.
- "Não fiz" grava a falta, e a página de retorno do `taskChecker` (hoje uma confirmação seca) passa a mostrar o
  efeito no objetivo e as saídas. **Sem login, a página só registra e mostra**; escolher uma saída, que muda o
  plano, pede a sessão: o link abre a área com um acesso de uso único confirmado por código no próprio WhatsApp, e
  preserva o destino depois da confirmação [B12]. Em seguida, o lembrete é reagendado para três dias depois, uma
  vez. Na segunda falta da mesma ocorrência, com consultor, a pendência entra na fila dele.
- A comportamental manda a mensagem da semana. **Sem open banking, ela pergunta antes de sugerir** [I9]: "Semana 1
  de outubro: quanto foi de gastos ajustáveis? Responder". Com a resposta, vem a sugestão (ver "Teto da semana").
- O fechamento do mês fala do objetivo e, para quem está começando, da sobra [I23]:
  > Outubro: 3 de 3 feitas. A Itália ficou R$ 1.500 mais perto; faltam R$ 27 mil.

  > Outubro: sobraram R$ 120. É o seu segundo mês seguido com sobra.

  Esta é a mensagem que constrói o hábito; não pular. No casal, só o plural ("vocês fizeram 3 de 3"), sem dizer
  quem fez o quê [D15].

Quando o open banking estiver ligado, a tarefa de dedicar dinheiro é marcada sozinha ao detectar a transferência no
valor e na janela esperados, e o lembrete vira confirmação: "Vimos o aporte de R$ 771 em 5/10. Está contado." Se
não detectar até o dia seguinte ao combinado, aí pergunta. O teto da semana passa a ser verificado sozinho contra
os gastos.

### A lista

Agrupada no tempo: **Agora** (vencidas e desta semana), **Em seguida**, **Mais adiante**, **Feitas e adiadas**.
Filtro por **categoria**, por **objetivo** e, no casal, por **responsável** [D15]. No alto, o placar do período
("2 de 4") e a sequência no ritmo de quem usa ("3 meses seguidos com tudo feito", ou "3 meses seguidos com sobra",
ou "guardou mais que no mês passado") [I23], em tom suave. Na lista, cada cartão mostra só "Fiz" e "⋯"; as quatro
respostas aparecem com o cartão aberto [D13]. Os filtros são chips com rolagem horizontal. Quando "Agora" está
vazio: "Nada para esta semana. A próxima é em 5/11: R$ 771 para a Faculdade." O consultor vê a mesma lista na área
dele, com o nome do cliente, os motivos de adiamento e quem respondeu.

## Plano — o livro e o Status

### O livro (degrau Completo)

O livro de `evolucao-patrimonial.html` dentro da área, com o sumário e a barra de capítulos vistos que já existem.
É a leitura para sentar com calma, no desktop; no celular, abre o sumário e cada capítulo em leitura vertical, sem
os gráficos largos, com "ver no computador" onde eles fazem falta. O que muda ao vir para a área logada:

- O capítulo **Objetivos** mostra uma linha por objetivo e aponta para o ambiente de cada um, que é a fonte única
  [I6].
- A **Evolução patrimonial** mostra a curva planejada; os pontos do patrimônio real moram em Realizado › Patrimônio,
  e o livro os cita com a origem quando houver registros [I6].
- "Simular outros valores e propor ao consultor" sai do ícone de 16px e vira um botão visível em cada página que
  tem números do cliente (a auditoria de 18/10 já pedia isso), como ação terciária, sem disputar com o "Próximo"
  do rodapé [D11].
- O vídeo do caso e o vídeo teórico continuam por capítulo; o teórico também aparece em Conteúdos.
- Ao fim da apresentação, a primeira abertura da área mostra a ponte entre a reunião e o dia a dia: "A Patrícia
  criou estas tarefas e lembretes a partir do que vocês combinaram. Confiram e ajustem os horários." [D7]

### Status — todas as verticais com os seus valores (todos os degraus logados)

A versão resumida do planejamento, vertical por vertical. **A lista canônica**, na ordem dos mundos, é esta [I21],
e é a mesma no PROMPT-MOCK e no código:

1. **Dívidas** (Sobreviver)
2. **Orçamento e sobra** (Sobreviver e Descobrir)
3. **Saúde financeira e fase da vida** (Descobrir)
4. **Objetivos e liberdade** (Descobrir)
5. **Reserva** (Construir)
6. **Política de aportes** (Focar)
7. **Seguros e liquidez** (Proteger)
8. **Carteira e IR** (Otimizar)
9. **Patrimônio e estrutura** (Otimizar)
10. **Sucessão e retirada** (Desfrutar)

Para cada vertical:

- os **valores principais**, lidos do vetor de variáveis;
- o estado (em dia / atenção / ruim), quando há alvo, sempre em tons suaves: "ruim" usa o tom de atenção, nunca
  vermelho [D8]. O chip de estado nunca vem sozinho: carrega a razão em até cinco palavras ("aporte em 73% do
  necessário") ou é substituído pelo número que a explica (decisão de 25/10). Várias verticais em "atenção" não é
  raro em quem chega; depois de passar pelo planejamento, isso deve se arrumar em pouco tempo, e o chip serve para
  puxar a ação: cada "atenção" aponta para o passo ou para a tarefa que o resolve;
- o caminho para a **calculadora** correspondente (e para o capítulo, no Completo); a calculadora grava no vetor,
  volta para o Status e mostra "o plano se ajustou";
- a **evolução das respostas**: o que o cliente respondeu em cada janela (exame, clínica, check anual, atualização),
  com a lista datada ao tocar e, no casal, de quem foi cada resposta;
- a **validade**: um valor com mais de 12 meses aparece como "respondido em out/2025; atualizar" [I22];
- "Transformar em tarefa" quando a vertical pede uma ação; a tarefa criada aparece na hora, com "ver em Tarefas".

Uma vertical sem nenhum dado **não aparece** (o que falta some); no Cadastrado, o convite a preencher está no
próximo passo, não em cartões cinza [I21]. Acumulativo como o resto: na Clínica, as verticais de foco sobem com o
rótulo "combinado na clínica de 12/09"; no Completo, é o resumo do livro com os números do plano vigente.

**A forma ainda está em aberto**, com uma regra: o conjunto precisa caber em 390 px [I28]. No celular, as verticais
são uma lista vertical, agrupada por estado (atenção primeiro), com os valores em Sora. No desktop, vale desenhar
alternativas que mostrem as verticais como um conjunto: um mapa de bolhas em que o tamanho é o **peso da vertical no
plano** (o quanto ela pede de atenção e de dinheiro por mês), nunca a soma de reais patrimoniais solta como
proporção (referência visual citada pelo dono do produto: dribbble.com/shots/7567713), ou um radar dos cinco
pilares com as verticais ao redor. A montanha ilustrada fica de fora, pela regra de tom [I21]. O mock traz a lista
do celular e as duas formas de desktop, para escolher. O Status será revisto quando o livro estiver concluído.

### Utilitários

O bloco das calculadoras sem valores salvos: rendimento real de um investimento, rendimento real de um imóvel,
**quanto a taxa me custa até a liberdade** (taxa de administração, valor e prazo, terminando em "quer que alguém
olhe a sua carteira? Agendar uma clínica") [I29] e as que vierem. Grade com nome, uma linha do que responde e o
botão de abrir. Nada aqui grava no vetor; o resultado pode ser copiado ou virar uma tarefa manual ("Resgatar o CDB
em março").

## Realizado — "o que foi planejado e o que ele está executando"

As lentes, com o seletor de horizonte **3 meses | 6 meses | 12 meses | o ano | desde o plano** no alto, junto do que
controla (não na faixa do título). O seletor só mostra os horizontes que já têm dado; no primeiro mês, a tela diz
"começou em outubro" [D6]. **Nenhuma lente aparece vazia**: no Cadastrado, o Realizado surge a partir do primeiro
registro, e cada lente só aparece quando tem dado [I9].

**Contra qual plano se compara.** O plano tem versões datadas: a de abril, a ajustada em novembro. Cada mês é
comparado com a versão vigente naquele mês: outubro contra o plano de abril; dezembro contra o de novembro. Nos
gráficos, a troca de versão aparece como um traço vertical tracejado em marinho com a data ("plano ajustado em
8/11"), e o planejado muda de patamar a partir dali. O traço tem área de toque de 44 px [I28]; ao tocar, o que mudou
de uma versão para a outra. Nunca se recompara o passado com o plano novo; o histórico é fotografia.

**No ritmo combinado** [B7]: a comparação usa a recorrência da tarefa. Quem aporta no bônus de março não aparece com
"faltou" de abril a fevereiro; aparece com o ano ("ano: 22% feito; o bônus de março cobre 60%"). Quem ajustou ao que
coube aparece com "cumprido na nova meta", e "faltou" fica para o mês sem nada guardado [D16].

### Dinheiro dedicado (desde o Cadastrado)

Para cada tarefa recorrente de dedicar dinheiro, a comparação planejado × feito ocorrência a ocorrência: barras
suaves lado a lado, com o acumulado em cima e o objetivo nomeado. "Itália: planejado R$ 9.252 · feito R$ 8.481 ·
faltou R$ 771 (setembro)." Os estados cumprido / coberto por outro objetivo / faltou vêm da conta de
`acompanhamentoDoObjetivo`. Toque em um mês mostra de onde veio o dado (Camila marcou, consultor lançou, extrato do
open banking).

No degrau Clínica, está em estudo um **acesso pontual de open banking**: uma leitura única, na clínica ou no
check-up, que traz os últimos meses de entradas, despesas e aportes sem conexão permanente. A tela é a mesma; muda
só o rótulo da origem ("leitura de 12/09") e o fato de os meses seguintes voltarem a ser marcados pelo cliente.

### Sobra (desde o Cadastrado)

Para quem está começando, a sobra é o número principal [I23]: um número por mês (lançado à mão ou vindo do open
banking), em colunas suaves, com "3 meses seguidos com sobra" e "R$ 150 em outubro, mais que setembro". É a lente
que mostra progresso antes de haver qualquer objetivo.

### Dívidas (quando há dívida)

O saldo por credor ao longo dos meses, a data prevista de quitação de cada um e os meses sem cheque especial [B2].
Lançamento manual do saldo uma vez por mês (a tarefa de interação lembra); com open banking, vem sozinho.

### Colchão (renda irregular)

O saldo do colchão subindo nos eventos e descendo mês a mês nas saídas combinadas, com "o colchão cobre até abril" e
quanto passou da empresa para a pessoa física [B7].

### Orçamento (todos os degraus, com o detalhe que houver)

O orçado é o que foi lançado no **Fluxo de caixa** do portal (o passo `fluxo`, mês a mês, com as microcategorias),
no Completo; na Clínica, o orçamento refeito na clínica; no Cadastrado, o orçamento por grupo que ele mesmo
informou (entradas, fixas, ajustáveis, futuro) [I9]. O layout e a navegação do Fluxo de caixa são bons e são
reaproveitados aqui. Três visões, com um alternador:

1. **A mesa de comparação:** um cartão por mês, com o orçado e o realizado daquele mês lado a lado: entradas, fixas,
   ajustáveis, futuro (o que foi dedicado aos objetivos) e o saldo. Em cada cartão, a diferença em texto e tom de
   atenção. **As três maiores diferenças por categoria só aparecem quando o dado é categorizado** (open banking ou
   extrato classificado); com três totais à mão, o cartão mostra a diferença por grupo e mais nada [I9]. Toque abre
   o mês com todas as categorias. Sem vermelho no orçamento (regra do DESIGN.md). No desktop, os cartões em fila;
   no celular, um mês em lista com setas para o anterior e o seguinte [I28].
2. **O fluxo de caixa planejado:** a tabela do Fluxo de caixa como o cliente a viu no plano, só leitura, na versão
   vigente naquele mês. No celular, um mês por vez, em lista.
3. **O fluxo de caixa realizado:** a mesma tabela, com o que de fato aconteceu, mês a mês, nas mesmas categorias.
   Com open banking, preenchida pelas transações classificadas; sem, o cliente lança o total do mês por grupo (três
   números) ou cola o extrato, e as categorias sem dado ficam em cinza.

### Teto da semana

**Teto da semana** é o nome oficial, em toda tela e mensagem; "semanada" é como os consultores falam na conversa
com o cliente, e pode continuar assim (decisão de 24/10). O teto da semana é o combinado de gasto ajustável por
semana dentro do teto do mês ("até R$ 6.000 no mês: R$ 2.000,
R$ 1.200, R$ 900, R$ 900"), em **qualquer meio de pagamento** (cartão, Pix, débito, dinheiro) [D14], na escala da
renda de quem a faz. Existe desde o Cadastrado: sem orçamento salvo, nasce de renda, despesas fixas e sobra do exame
[I9]. Merece um ambiente próprio, com destaque: o mês como quatro ou cinco barras, uma por semana, com o combinado e
o gasto, a semana atual em evidência e o que resta do teto do mês. Toque numa semana mostra os gastos (com open
banking) ou pede o total (sem).

O mais valioso dela é a **mensagem de WhatsApp da semana**: pergunta o gasto da semana que passou (sem open banking),
e com a resposta mostra o combinado, o gasto e a **sugestão de ajuste** para as próximas, recalculada para fechar o
mês dentro do teto:

> Semana 2 de outubro. Combinado: R$ 1.200. Gasto: R$ 1.460. Para fechar o mês nos R$ 6.000, a sugestão é ficar em
> até R$ 1.000 de gastos ajustáveis nesta semana e na próxima.

O teto da semana é uma tarefa comportamental (ver "Tarefas") e a mensagem é o seu lembrete, enviado no começo de cada
semana; o fechamento do mês diz se o teto foi respeitado e o que isso fez com o dinheiro dedicado aos objetivos.

### Patrimônio (desde o Cadastrado)

A curva planejada da Evolução patrimonial (no Completo) ou a linha do patrimônio declarado (nos outros degraus) com
os pontos reais (financeiro, bens, participações, dívidas), um por mês ou por trimestre [I9]. "Hoje: R$ 312 mil · o
plano previa R$ 305 mil." A participação na empresa aparece separada do financeiro. Com open banking, os pontos vêm
das posições consolidadas; sem, o cliente atualiza os totais por bloco, lembrado por uma tarefa trimestral de
interação. É aqui, e só aqui, que mora o patrimônio real; o Painel e o livro citam daqui [I6].

### As revisões semestrais

Um registro datado, gerado automaticamente antes de cada reunião semestral (aos 6 e aos 12 meses, e assim por
diante; na Clínica, antes do check-up anual): a versão do plano vigente, o que foi feito, o que faltou,
o que mudou no plano desde então. **Com consultor, a revisão gerada é o rascunho da reunião** [I18]: a consultora a
abre, acrescenta o resumo e as decisões e publica como o registro da reunião. É um registro só, não dois. Se a
revisão ajusta o plano, nasce uma versão nova a partir dali. Aparece na Jornada com o nome do calendário (ver
"Jornada") e fica como histórico. É a fotografia, nunca a fonte (`mudanca-recalcula-tudo`).

### Revisar a minha gestão financeira (oportunidades de economia)

Não é uma lista passiva no meio do Realizado: é uma **ação consciente**. Um botão grande, "Revisar a minha gestão
financeira", leva a uma tela própria em que o cliente percorre os achados: assinaturas repetidas, tarifas, juros,
gasto acima do padrão da categoria, cada um com o valor por mês, a evidência e dois botões: "Virar tarefa" e "Não se
aplica". No fim, a soma pelo objetivo: "Se fizer tudo: R$ 430/mês, o equivalente a 56% do aporte da Faculdade." No
Completo, o consultor vê antes e pode comentar; a revisão fica registrada com data, e a próxima é sugerida em três
meses.

**Sem open banking** [I9, I23], a mesma tela vira o **roteiro "onde sobra"**: uma lista guiada para a pessoa
percorrer sozinha (assinaturas, tarifas do banco, plano de celular, seguros duplicados, delivery, a divisão das
contas da casa), cada item com uma pergunta e "Virar tarefa". Existe em todos os degraus.

## Jornada

Três coisas na mesma tela, nesta ordem. No celular, cada uma é uma seção recolhida, aberta pelo título [I28].

**As reuniões com o planejador.** O histórico de cada encontro (coleta, apresentação, acompanhamentos, reunião
semestral, clínica, retorno, check-up), do mais recente ao primeiro: data, quem participou, o **resumo da reunião**
(escrito pelo consultor para o cliente, curto), as **tarefas que ficaram em aberto naquela reunião** com o estado de
cada uma hoje (feita, adiada, pendente) e o que mudou no plano a partir dela (a versão criada). É a memória da
relação: o cliente chega à próxima reunião sabendo o que ficou combinado na anterior. **O histórico nunca se perde
ao mudar de degrau**: a clínica e o exame continuam no começo da lista de quem passou para o Completo [B14]. Sem
reuniões (Cadastrado), a seção mostra os conteúdos vistos e os comitês assistidos, que também são relação com a
Nord [D18].

**A relação com a Nord**, com a data de cada etapa e quem a conduziu, derivada do pipeline do consultor e dos
registros de reunião, não digitada. O registro de uma reunião avança a etapa correspondente [D20].

- **Completo** (calendário decidido em 24/10, um só em todas as telas [I11]): Embarque → Coleta de dados →
  Montagem do plano → Apresentação (com o link do capítulo) → Execução → **Reunião semestral** (6 meses) →
  **Reunião semestral** (12 meses, com a renovação) → … A conversa com o consultor é semestral; entre uma reunião e
  outra, o cliente tem os **materiais de atualização e as monitorias mensais** (em Conteúdos) e o **WhatsApp do
  consultor, livre**, quando quiser. As etapas futuras com a data prevista; as passadas com o que foi entregue (o
  relatório, a revisão). O mesmo nome aparece no Painel, na Jornada e no README.
- **Clínica:** Exame realizado → Clínica realizada (data, consultor, as orientações combinadas e os "temas para uma
  próxima conversa") → Conversa de aprofundamento (só quando o consultor marca, na clínica, que o cliente precisa
  dela; aí a reunião é agendada) → **Check-up anual** ("disponível em dd/mm", 12 meses depois da clínica, e vira a
  etapa ativa quando chega). É a regra dos programas de bem-estar e vale para toda clínica (decisão de 24/10). O
  convite ao planejamento
  completo, quando aparece, cita os temas que ficaram de fora ("faculdades no exterior, casa de praia, estrutura da
  empresa") e fica escondido enquanto o cliente está em Sobreviver [I13, I29].
- **Cadastrado:** Cadastro → o próximo marco dele ("primeiros R$ 500", "reserva mínima"). O convite a conhecer a
  clínica fica ao lado, discreto, e diz o que ela cobre [I13].
- **Visitante** (na entrada): explorar as calculadoras → saber como funciona o planejamento → eventualmente criar a
  conta.

**A escalada**, como referência macro: os sete mundos, os conquistados preenchidos, os que não se aplicam indicados
como tal, o atual com a trilha de passos, os próximos em cinza; o que já está resolvido e o que falta; os marcos do
mundo atual; o ano em curso com os três números. Desenho sóbrio, sem montanha ilustrada nem ícones lúdicos: é a tela
que se olha no fechamento do ano e na reunião anual, não todo dia. Na Clínica e no Completo, uma linha diz quem
definiu o foco atual ("foco escolhido pela Patrícia em 12/09") [B11].

## Conversas e falar com alguém

### Conversas

Uma tela só para tudo o que é troca com pessoas [B13], aberta pelo botão "Falar com alguém" do cabeçalho, com o
contador do que espera resposta:

- no alto, **com quem falar** (muda por degrau, abaixo);
- abaixo, **o histórico**: dúvidas e as respostas, propostas de mudança no plano e o estado de cada uma (aguardando,
  aprovada, ajustada, com a mensagem do consultor à família), comentários do consultor nas tarefas e ajustes
  provisórios do "não fiz" aguardando aprovação.

### Com quem falar (muda por degrau)

Ninguém quer "falar com o comercial". O que as pessoas querem é um humano que dê clareza sobre os próximos passos e
explique como usar a plataforma. Em todos os degraus, **antes de abrir uma conversa, a área diz quem vai atender e
o que essa pessoa verá** [B5]: "Quem atende é a equipe de planejadores da Nord. Ela verá o seu exame e o passo em
que você está." E diz como a Nord é remunerada, em uma linha com link para o detalhe.

- **Visitante e Cadastrado:**
  - **Agendar uma clínica**, com o que ela cobre e quanto tempo leva [I17]. É a primeira opção.
  - **Conversar com alguém da Nord pelo WhatsApp.** A área olha o que já sabe do vetor do domicílio (renda,
    poupança mensal, patrimônio, somados quando há dois) e, se faltar, pergunta em uma tela só ("renda de vocês
    dois", no casal) [B6]. Se o domicílio tem renda a partir de **R$ 8.000**, ou poupa a partir de **R$ 1.500 por
    mês**, ou tem patrimônio a partir de **R$ 150.000**, abre o WhatsApp de um planejador, com uma mensagem curta e
    adulta já começada ("Olá, sou a Ana. Quero entender melhor os próximos passos do meu planejamento."; no casal,
    "Somos a Camila e o Rafael"). O contexto vai por dentro, para quem atende, e a pessoa foi avisada antes.
  - **Quem ainda não alcança esses números** nunca recebe só um texto e um vídeo [B5, I17]: entra no **grupo das
    lives mensais de planejamento**, com a data da próxima e o link das anteriores, onde há gente da Nord falando e
    respondendo (decisão de 24/10), além da orientação clara do próximo passo e do vídeo de navegação. Nunca se diz
    que a pessoa "não se qualifica", e não se promete o WhatsApp "quando os números mudarem".
  - Os três limites são parâmetros, não constantes no código.
- **Programa de bem-estar da empresa:** todo colaborador é elegível, sem qualificação [B5]. A clínica se pede com
  **5 tokens** (ver "Os tokens do programa"), e a tela mostra quantos ele tem e como ganhar os que faltam. Enquanto
  não tem os 5, as lives mensais são a conversa com a Nord.
- **Clínica:** "Falar com Patrícia", com nome e foto da consultora que fez a clínica [I17], e o **check-up anual**
  (habilitado 12 meses depois da clínica; antes disso mostra a data em que abre). Se a consultora marcou a conversa
  de aprofundamento, ela aparece aqui com a data. Os temas que ficaram de fora da clínica aparecem como "para uma
  próxima conversa".
- **Completo:** "Falar com Patrícia", com a foto da consultora e três coisas, cada uma dizendo quando usar e em
  quanto tempo vem a resposta [I12]:
  - **Conversar** pelo WhatsApp da Nord da consultora, **livre, quando quiser** (um número da Nord por consultor,
    com a conversa anexada à ficha do cliente, não o celular pessoal [D19]).
  - **Tirar uma dúvida sobre o plano**: texto curto com a página do plano anexada, para quando a pergunta é sobre um
    número ou uma página; chega à consultora na fila dela; a resposta volta às Conversas da área, com aviso no
    WhatsApp (um canal para a resposta, o outro só avisa). Prazo visível: 2 dias úteis.
  - **Propor uma mudança no plano**: a mecânica de propostas que já existe (simular → enviar → consultor aprova),
    com o mesmo prazo e o estado visível em Conversas.
  - E a data prevista da **reunião semestral**.

## Plano em montagem (Completo, antes da apresentação)

Entre contratar e receber o plano há semanas, e é quando o cliente está mais engajado [I5]. A área não fica vazia:

- uma **mensagem de boas-vindas** no dia em que o degrau passa a Completo (pela assinatura do contrato no
  pipeline), dizendo o que vem a seguir e quando;
- no Painel, o bloco "Seu plano está em montagem": as etapas com as datas (coleta, montagem, apresentação), quem
  preenche a coleta (a consultora, na reunião; o cliente só envia documentos) e o que esperar da apresentação;
- **tarefas de preparação** vindas do bloco 11 da coleta: enviar os informes do IR, as apólices, os extratos;
- tudo o que o cliente já tinha como Cadastrado continua lá (objetivos, tarefas, exame).

## Estados e transições

O que a especificação não pode deixar para o código decidir [B12, B14, I27].

### Respostas e links

| Caso | O que acontece |
|---|---|
| Tarefa já respondida (por outro canal, pelo outro membro, pelo consultor ou pelo open banking) | O segundo toque não sobrescreve: "Já registrado em 5/10 por Rafael: fiz. Corrigir?" |
| Link de uma ocorrência vencida (o link de setembro tocado em outubro) | "Este lembrete era de setembro. Como ficou?" com as quatro respostas, gravando em setembro |
| Valor recalculado depois do envio (o link era de R$ 771, a tarefa agora pede R$ 841) | Grava contra o valor que estava na mensagem e mostra o novo valor da próxima ocorrência |
| Link expirado ou já usado | Abre a tarefa na área, depois do login, sem perder o destino |
| Sem conexão | A resposta entra numa fila no aparelho e é enviada quando a conexão volta, com "enviado às 14h" |
| Erro de gravação | Dito na hora, com "tentar de novo"; nunca um "Fiz" que parece gravado e não foi |
| O motor está calculando (o "não fiz", uma gravação) | O cartão mostra "calculando o efeito", com movimento só de opacidade; nunca uma tela branca |
| Tarefa apagada ou alterada pelo consultor depois do envio | O link abre a tarefa como ela está, com "alterada pela Patrícia em 3/11" |

### Plano em revisão

Quando a consultora prepara uma versão nova (numa revisão, depois de uma proposta, na renovação), o Painel mostra
"nova versão do plano em preparação"; as tarefas continuam na versão vigente; as propostas do cliente ficam
registradas e são respondidas junto com a publicação. Ao publicar, uma mensagem diz o que mudou [I27].

### Mudar de degrau

**Regra geral: nada criado pelo cliente some; o que sai do degrau vira histórico datado; cada mudança tem uma
mensagem de transição que diz o que muda** [B14].

- **Cadastrado → Clínica:** objetivos e tarefas do cliente continuam dele; as orientações da clínica entram por
  cima, com o rótulo e o foco da consultora. A consultora vê o que ele já tinha.
- **Clínica → Completo:** o histórico da clínica continua no começo da Jornada; os rótulos "combinado na clínica"
  continuam nos valores até que o plano os substitua; o plano em montagem (acima) cobre o intervalo.
- **Ganhar consultor tira o ajuste direto**: no Completo, as escolhas viram provisórias que a consultora aprova. A
  mensagem de transição diz isso, e por quê: "a partir de agora a Patrícia confere cada ajuste com vocês".
- **Fim do contrato Completo sem renovação:** o cliente volta a Cadastrado. O livro e as versões ficam como
  histórico, só leitura. As tarefas recorrentes continuam com os valores da última versão, e o cliente passa a
  ajustá-las direto. As propostas pendentes são encerradas com aviso. O WhatsApp da consultora sai; Conversas
  passa ao formato do Cadastrado.
- **Check-up anual da Clínica vencido sem agendamento:** a etapa fica "disponível" e a área lembra uma vez por mês, sem
  insistir.
- **Troca de consultor ou férias:** o cliente vê o nome de quem atende agora; a fila da consultora passa a quem a
  cobre, com o histórico.

## O que o consultor vê

Na área do consultor, por cliente: o mundo e o passo da escalada (com o foco que ele escolheu), as tarefas e
respostas (com adiamentos, motivos e quem respondeu), as faltas do período, as dúvidas abertas, as propostas e os
ajustes provisórios pendentes, o estado do open banking e a próxima revisão. **Um vocabulário só** em todas as
telas: verticais, passos e tarefas [B10].

### Registrar a clínica

Uma tela, de cima para baixo, na ordem em que a conversa acontece [B10]:

1. **As verticais**, na ordem canônica do Status, cada uma com o valor atual e a origem. O consultor marca as de
   foco (reserva, orçamento e sobra, dívidas, objetivos, liberdade ou as que vierem); o modelo aceita qualquer
   combinação.
2. **Em cada vertical de foco**: o alvo (vindo da calculadora ou do exame, com a origem, e editável) e o que pedir,
   **no ritmo da renda do cliente**: por mês, por entrada de renda ("a cada distribuição"), por evento, ou como
   tarefa única (o remanejamento) [B7].
3. **As orientações em frases**, como o cliente vai lê-las no Painel ("Separar a conta da empresa da sua conta
   pessoal"; "Guardar R$ 30 mil de cada distribuição e tirar R$ 5 mil por mês nos meses magros").
4. **Os temas para uma próxima conversa** (o que ficou de fora de propósito).
5. **A conversa de aprofundamento**: marcar se o cliente precisa dela; se sim, a reunião é agendada ali. Sem ela, o
   próximo contato é o check-up anual.
6. **A prévia**: as tarefas que vão nascer, os lembretes com dia e hora, e a primeira mensagem de WhatsApp como o
   cliente vai recebê-la. O consultor confere e ajusta antes de publicar.
7. **Publicar.** O cliente recebe a mensagem de boas-vindas da clínica.

### Registrar a reunião

Depois de cada reunião, a partir do rascunho da revisão quando houver [I18]: data, **quem participou**, o **resumo
para o cliente** (curto) e uma **nota interna** que o cliente não vê, as tarefas que ficaram em aberto (criadas dali
mesmo ou **ligadas** às que já existiam), e "criar versão do plano a partir desta reunião", que leva ao portal
(`tela-consultor.html`) e volta com a versão ligada à reunião. O resumo pode ficar como rascunho e ser publicado
depois. É o que alimenta o histórico na Jornada do cliente e avança a etapa no pipeline.

### Ver como o cliente e lançar pelo cliente

- **Ver como o cliente** [B10]: a área do cliente em modo só leitura, no degrau dele: Painel, Tarefas, Objetivos,
  Conversas e as últimas mensagens de WhatsApp enviadas. É o que a consultora abre ao telefone e antes de uma
  reunião.
- **Lançar pelo cliente**: marcar "fiz", lançar um saldo ou um gasto quando o cliente conta por telefone, com a
  origem "consultor lançou".
- O consultor edita a hora e o canal de um lembrete a pedido do cliente; mudar o valor de uma tarefa que nasceu do
  plano passa por uma versão nova.

### Aprovar uma proposta

Antes de aprovar, a consultora vê o antes e o depois do objetivo, a conta (saldo, meses, taxa), as tarefas que
mudam e a versão que será criada [I18]. Aprovar cria a versão e regera as tarefas a partir da próxima ocorrência.
Ajustar devolve ao cliente o que mudou, com uma frase dela.

### A fila "Espera por mim"

No painel interno (`/internal`), o bloco "Minhas Tarefas Pendentes" vira uma **fila única** [B10], com tipo,
cliente, há quanto tempo, prazo e "tratei":

- dúvidas sem resposta e propostas e ajustes provisórios pendentes (com prazo);
- clientes com tarefa de dinheiro em falta pela segunda vez (com degrau, valor e quantas seguidas), de Clínica e de
  Completo;
- adiamentos repetidos, com o motivo e as ações "responder", "reagendar junto" e "visto";
- reuniões sem resumo (a reunião é dada como realizada pela data agendada no pipeline);
- tarefas do bloco 11 com responsável "consultor";
- pedidos de conversa: os de clientes de Clínica e Completo vão à consultora deles; os de Visitante e Cadastrado vão
  à fila comercial da Nord, não à carteira de um consultor [I18].

Ordenada por vencimento. **Os avisos chegam num resumo diário** por WhatsApp, não um por evento. Quando a
consultora está de férias, a fila passa a quem a cobre.

## Princípios de interface (herdados de DESIGN.md e do que foi aprendido)

- O objetivo antes do número: toda tela que pede algo mostra primeiro a que serve.
- Senso de progresso e realização: o progresso de cada objetivo, o ritmo e a escalada são visuais e se movem
  quando avançam (o gráfico animado da Evolução patrimonial é a referência). Movimento só por opacidade quando o
  sistema pedir menos movimento. Há progresso visível para quem está começando, não só para quem já tem patrimônio.
- Adulto, nunca infantil: nada de emoji (nem nas mensagens de WhatsApp), medalha, mascote, montanha ilustrada, nome
  de objeto de aventura ou frase de jogo. A escalada é referência macro, olhada de vez em quando; o dia a dia fala de
  dinheiro e de objetivos em linguagem direta.
- Sem julgar: nunca "sair do vermelho", nunca "você não se qualifica", nunca uma justificativa escrita para ninguém.
  Uma falta sempre vem com uma saída que cabe no bolso de quem falhou.
- Engajar sem gritar: tons suaves em tudo; cor cheia só em traço, ponto e na pílula da ação principal (uma por
  tela). Laranja só para futuro e ação. Gamificação, se houver, é decisão pendente.
- Números em Sora, texto em DM Sans. Cartão branco de raio 16, sem borda, mas não só cartões: onde um conjunto de
  valores forma um todo (o Status, a escalada), desenhar o todo.
- O cabeçalho da área logada é do produto, não do livro [D12]: título da tela em 22 a 24 px no celular, sem o
  rótulo de capítulo nem o rodapé anterior/próximo, que continuam valendo só dentro do livro. A metáfora visual do
  tempo continua a travessia do DESIGN.md (tempo na horizontal, laranja à frente); a escalada é só a estrutura dos
  mundos, desenhada como trilha, nunca como montanha.
- Cada número com origem rastreável ("do plano de 22/10", "Camila marcou em 5/10", "extrato de 6/10") e com o
  lugar onde se corrige.
- Um nome por número: "cobertura de seguros" é a porcentagem da proteção contratada; "Proteção" é o pilar do exame
  [D10].
- O que falta some. Um cadastrado nunca vê um cartão vazio de "Realizado".
- Cabe em 390 px: toda tela do dia a dia é desenhada no celular primeiro; o que só funciona largo (tabelas do fluxo,
  bolhas) tem uma forma de celular própria.
- Casal no plural, pessoa no singular, quem lê no singular, em toda mensagem, inclusive no WhatsApp.

## Decisões de 24/10

O dono do produto decidiu as propostas da avaliação assim; o texto acima já as reflete.

1. **Volume de WhatsApp**: entre 10 e 15 mensagens por mês. O volume se controla juntando tarefas parecidas: os
   aportes viram um lembrete só, no dia em que o salário cai, com o valor de cada objetivo.
2. **Prazo da consultora**: 2 dias úteis para dúvidas e propostas; nas férias, a fila passa a uma colega definida.
3. **Escalada**: será redesenhada depois. Por ora, uma versão básica (sete nomes, régua simples, foco do consultor
   acima da régua); os refinamentos ficam em "Para o redesenho da escalada".
4. **Primeiro valor de quem começa a sobrar**: até 3% da renda no self-service; com consultor, ele define.
5. **Quem não alcança a qualificação**: entra no grupo das lives mensais de planejamento.
6. **Programa de bem-estar**: todo colaborador é elegível; a clínica se pede com 5 tokens (a empresa dá um, o exame
   dá um, cada evento dá um, cada indicação dá um ao que indica e ao indicado); a empresa vê um painel só com dados
   agregados (uso, exame, evolução da saúde financeira, categorias de objetivos).
7. **Depois da clínica**: check-up anual em 12 meses, salvo quando o consultor marca a conversa de aprofundamento,
   que então é agendada.
8. **Completo**: reunião com o consultor a cada semestre; materiais de atualização e monitorias mensais; WhatsApp do
   consultor livre.
9. **Casal**: sem mecanismo de concordância entre os dois. Mudança pedida pelo cliente é aprovada pelo consultor,
   que escreve à família.
10. **Nome**: "teto da semana" é o oficial; os consultores continuam dizendo "semanada" na conversa.
11. **Assinatura**: fica para depois; o cliente self-service tem acesso às ferramentas disponíveis.
12. **Forma do Status no desktop**: decidir depois de ver o mock com as duas formas.

## Decisões de 25/10

Respostas às perguntas da avaliação de clareza do mock (`avaliacao-mock-2026-10-24-clareza.md`):

13. **Tarefas no Painel**: só a próxima. As outras ficam em Tarefas, uma área à parte.
14. **Chip "atenção"**: não é raro nem absurdo em quem chega, mas depois do planejamento deve se arrumar em
    relativamente pouco tempo. Por isso o chip carrega a razão e aponta para a ação que o resolve.
15. **"Não fiz" com vários objetivos**: efeito somado, com a saída sugerida em destaque; o detalhe por objetivo
    sob pedido.
16. **O caminho: desejo e realidade.** A tela "Os objetivos juntos" vira duas linhas do tempo (o desejo em cima, a
    realidade no ritmo de hoje embaixo) com sliders de aporte e de orçamento que movem os marcos ao vivo. Destaque
    alto, mas num lugar só (não no Painel), e também a cena central da apresentação do plano. Regras: a ordem de
    prioridade decide quem recebe o dinheiro primeiro (tudo para o 1, depois o 2; no máximo dividir entre 1 e 2);
    no Completo o slider é simulação que termina em "Propor à Patrícia"; a linha de baixo nunca vem sem a saída.

Ainda em aberto: o mínimo de pessoas por recorte no painel da empresa; o redesenho da escalada.
