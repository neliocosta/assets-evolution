# Área logada do cliente — outline

Documento de direção, não de código. Serve para orientar os prompts que vão desenvolver a nova área logada do cliente
na plataforma Nord Liberta. Escrito em 23/10/2026 a partir de dois levantamentos: a plataforma atual em
`liberta.nordinvestimentos.com.br` (área do consultor, área do cliente, pipeline) e a ferramenta deste repositório
(portal do consultor e apresentação do plano).

| Arquivo | O que contém |
|---|---|
| [README.md](README.md) (este) | Premissas, o que já existe, os degraus de profundidade e a tese do produto |
| [UX.md](UX.md) | A experiência tela a tela: navegação, estados por degrau, a mecânica das tarefas e lembretes, o orçado × realizado |
| [ETAPAS.md](ETAPAS.md) | O plano do projeto: etapas na ordem de construção, critério de pronto e dependências |
| [PROMPT-MOCK.md](PROMPT-MOCK.md) | O prompt pronto para gerar o mock navegável da primeira versão |
| [avaliacao-2026-10-24.md](avaliacao-2026-10-24.md) e [rodada 2](avaliacao-2026-10-24-rodada-2.md) | As duas rodadas de avaliação com personas que revisaram o UX.md antes do mock |

## A tese em uma frase

O valor do planejador não está no plano desenhado, está em garantir que o cliente faz, mês a mês, o que o plano pede.
A área logada existe para fechar esse ciclo: **o plano diz o que fazer → o cliente recebe o lembrete no WhatsApp → marca
se fez → o plano se ajusta e mostra a diferença entre o planejado e o realizado**. Tudo o mais (calculadoras, relatório,
open banking) alimenta ou enriquece esse ciclo.

Com duas convicções por trás: **o protagonista é o objetivo, não o plano** (nunca "guarde R$ 1.500", sempre "para a
Itália são R$ 1.500 por mês"), e **o esqueleto é a escalada** (Sobreviver → Descobrir → Construir → Focar → Proteger → Otimizar → Desfrutar), em que o passo mais importante depende do
mundo em que o cliente está e o exame de saúde financeira serve para situá-lo. Ver [UX.md](UX.md).

Objetivo é o que a pessoa quer alcançar agora, e nem sempre é um sonho de consumo: quitar o cartão, ter a primeira
reserva ou cumprir o que foi combinado na clínica também são objetivos. A avaliação de 24/10 mostrou que o ciclo foi
desenhado, sem perceber, para uma pessoa só, com salário mensal fixo, sobra positiva e um objetivo por vez; o UX.md
revisado cobre também o casal, a renda irregular, quem está endividado e quem ainda não consegue guardar.

Critério de sucesso (do dono do produto): um cliente dizer que não sabia o que fazer com o dinheiro e, depois do
processo, ficou claro; que pagou menos imposto, poupou mais, os investimentos renderam mais e chegou antes a um
objetivo; e que, cada vez que não guardou, recebeu um lembrete claro do que fazer e de como o plano se ajustou.

## O que já existe (não reconstruir)

### Na plataforma atual (`/arealogada` e vizinhas)

- **Jornada:** Embarque → Entrega do relatório → Acompanhamento #1 → Acompanhamento #2 → Renovação. Datas "a definir".
- **Lembretes por WhatsApp:** título, conteúdo, data de envio, assinatura, recorrência (semanal, quinzenal, mensal, N
  vezes). Criados à mão pelo consultor ou pelo cliente. Não estão ligados a nenhuma tarefa nem a nenhum número do plano.
- **Minhas Tarefas** (`/minhastarefas`): lista com título, data e estado pendente/concluída, "3 de 5 concluídas". Hoje
  avulsa: não nasce do plano, não dispara lembrete, não registra valor.
- **Calculadoras com valores salvos** (cada uma com "Recalcular" e "Ver meus valores"): Meu Orçamento (50/30/20),
  Exame de Saúde Financeira (0–100 com cinco pilares: Patrimônio, Atitude, Consciência, Proteção, Poupança), Reserva
  (mínima, aceitável, ideal), Liberdade Financeira (patrimônio projetado, renda por perpetuidade e por consumo),
  Objetivos (`/meusobjetivos`), Patrimônio Ideal por fase, IR e previdência, Fase financeira, Valor/hora, Seguros.
  Direção (24/10): cada uma é uma **vertical** do planejamento. O cliente precisa de uma tela de **Status** que resuma
  os valores principais de cada vertical, leve à calculadora correspondente e mostre a **evolução das respostas**: o
  que ele respondeu em cada janela de tempo. Ver "Plano → Status" em [UX.md](UX.md).
- **Calculadoras sem valores salvos:** rendimento real de investimento e de imóvel. São acessórios para decidir; a
  direção é um bloco grande delas, uma **aba de Utilitários**, sem misturar com o plano.
- **Vídeo "Como utilizar a plataforma"** e o texto "Primeiros passos", que já descreve o roteiro da clínica: exame →
  reserva → liberdade → objetivos → lembretes.
- **Pipeline do consultor:** Topo do funil → Reunião agendada → Montar relatório → Apresentar relatório → Aguardando
  aprovação → Aguardando execução. É a fonte natural da jornada que o cliente vê, mas vale para o **planejamento de
  vida e de investimentos**. A clínica financeira tem o seu próprio: **Exame realizado → Clínica realizada →
  (quando o consultor pede) Conversa de aprofundamento → Aguardando o check anual**, que só fica disponível 12 meses
  depois da clínica.
- **Coleta de dados** (`/coletadedados`): 211 campos em 11 blocos, inclusive o bloco 11 "Próximas tarefas"
  (`tarefasList`: título, prazo, responsável consultor/cliente, status). Hoje o plano não usa essa lista, e a coleta
  ainda não está ligada à montagem do relatório (a montagem acabou de ser lançada). A direção: o cliente tem **um
  vetor só das variáveis atuais**, populado pela reunião de coleta ou por uma interação dele com a plataforma
  (atualizando um dado ou outro); a cada atualização, calculadoras, ferramentas e o resumo do planejamento se
  reajustam.
- **Marcar tarefa sem login** (`/taskChecker?id=…&code=…&complete=true|false`): já existe. Um link com o id da
  tarefa, um código e o resultado grava no perfil do cliente se fez ou não fez. É a peça que faz o lembrete de
  WhatsApp fechar o ciclo com um toque.

### Neste repositório

- **Portal do consultor** (`tela-consultor.html`): 15 passos que montam o plano a partir de uma variável só
  (`VARIAVEIS.md`). Grava sozinho no armazém. O botão **"Gerar versão final para cliente"** publica uma foto
  do plano com data, hora e o comentário do consultor (`versoes/<cliente>`, `{ lista: [{ id, n, em, comentario,
  consultor, dados }] }`, a mais nova primeiro). A área logada deve mostrar ao cliente a versão mais recente como o
  relatório dele e o histórico das anteriores com os comentários ("ajuste da renda mensal", "atualização de 6
  meses"); o plano em edição no portal nunca é o que o cliente vê. A tela do cliente deste repositório já lê só a
  versão mais recente (sem nenhuma, avisa que o relatório está sendo preparado); falta a área logada mostrar o
  histórico.
- **Apresentação do plano** (`evolucao-patrimonial.html`): dez capítulos como um livro (Propósito, Diagnóstico, Gestão
  financeira, Tributário, Patrimônio, Riscos, Objetivos, Política, Carteira, Evolução patrimonial). Já é chamada de
  "área do cliente" e já tem a mecânica de **propostas**: o cliente simula valores e envia, o consultor aprova ou recusa.
- **Acompanhamento guardado em `reaproveitar/acompanhamento.js`:** o modelo `foto` (orçado congelado numa data) e
  `realizado` (aporte, saldo e remanejamento por mês), a conta cumprido/coberto/faltou e os cartões de resumo. Foi
  retirado da apresentação em 17/10 porque pertence à área logada: é o embrião da ferramenta de acompanhamento que
  se desenha aqui.
- **Apresentação do plano:** ainda em evolução, mas o formato atual serve de base para o mock.
- **Design** (`DESIGN.md`): tokens, tipografia (Sora, DM Sans), regras Horizon/Aurora/tons suaves, cartões, chips de
  estado, barra de progresso de capítulos.

## Premissas (confirmadas pelo dono do produto em 24/10/2026)

1. **Uma só área do cliente.** A nova área substitui `/arealogada`, `/minhastarefas` e `/meusobjetivos`; as calculadoras
   atuais continuam existindo, mas passam a ser lidas como verticais do mesmo modelo de dados, não como páginas
   soltas. Nada é pedido duas vezes (`variavel-num-lugar-so`).
2. **Dois ambientes sobre um vetor só.** O cliente tem um vetor único das variáveis atuais (populado pela coleta ou
   por ele mesmo na plataforma). Sobre ele há o **ambiente de planejamento** (o plano desenhado, o que ele pede por
   mês: aporte por objetivo, reserva, liberdade, teto de gastos) e o **ambiente de execução** (o que aconteceu:
   aporte feito, gasto do mês, saldo, patrimônio), que é registro datado com origem: cliente marcou, consultor
   lançou, open banking trouxe. Derivados nunca gravados.
3. **Desktop para sentar e falar sério; celular para o dia a dia.** Montar o plano (consultor) e rever o plano de
   vida inteiro (cliente) são de desktop. Receber o lembrete, ver um valor, conferir o próximo passo e marcar tarefas
   é majoritariamente no celular, saindo do WhatsApp. Painel, Tarefas e Status nascem no celular (e estão na barra
   inferior); Plano completo e Realizado nascem no desktop com leitura aceitável no celular.
4. **Marcar "fiz" é um toque na mensagem.** O `/taskChecker` já grava fez/não fez sem login, por link com id e
   código. O lembrete de WhatsApp leva dois links (fiz / não fiz); "fiz parte" e "adiar" abrem a tarefa na área,
   porque precisam de um valor ou de uma data. Os links são pessoais e de uso único; sem login, a página só registra
   a resposta, e qualquer mudança no plano pede sessão. O que falta é a tarefa nascer de um número do plano, ter
   categoria (dinheiro, comportamental, burocrática, interação, educacional, carteira) e a resposta "não fiz"
   devolver o efeito no objetivo e uma saída que caiba no bolso. Os lembretes só vão a quem consentiu, ficam entre
   10 e 15 por mês (os aportes juntos num lembrete só, no dia do salário) e não levam ofertas.
5. **Open banking é a origem de despesas, entradas e aporte mensal.** Não se espera que o cliente lance o extrato à
   mão como regime permanente. A tela do orçado × realizado é desenhada agora, com lançamento manual como caminho
   provisório, justamente para alinhar com o parceiro o que precisa chegar e em que forma.
6. **O plano tem versões datadas, e cada mês é comparado com a versão vigente.** Um plano feito em abril prevê um
   patrimônio para outubro; quando outubro chega, compara-se com o plano de abril. Se em novembro o plano é ajustado,
   os meses seguintes são comparados com a versão de novembro. Toda alteração ou ajuste cria uma versão nova, com
   data; a versão anterior fica no histórico. (Detalhe técnico que isso resolve: o motor hoje usa uma data fixa como
   "hoje", 19/09/2026, item 20 das pendências; a data precisa vir do relógio e a da versão, do plano.)

Acrescentadas na revisão de 24/10, a partir da avaliação com personas e das decisões do dono do produto no mesmo
dia (UX.md › Decisões de 24/10):

7. **O plano é de uma pessoa ou de um domicílio.** Um casal tem uma conta de domicílio com dois membros, cada um
   com login; o vetor guarda por membro o que é de cada um (renda, datas, respostas pessoais) e por domicílio o que
   é dos dois. Tarefas têm responsável e a resposta grava quem respondeu.
8. **A tarefa segue a renda de quem a faz.** Nem todo mundo recebe salário no dia 5: há quem receba por plantão, por
   distribuição semestral ou por bônus. As tarefas de dinheiro podem ser no dia em que a entrada cai, por evento de
   renda, em parcelas ou como meta anual, e o realizado é lido no ritmo combinado, não só mês a mês.
9. **Cada pessoa chega por algum lugar.** A entrada continua a conversa de onde a pessoa veio: um link por tema para
   quem chega por uma postagem, uma entrada própria (com a promessa de que a empresa não vê os dados) para quem chega
   pelo programa de bem-estar financeiro de uma empresa, e a escolha entre explorar e criar a conta para quem chega
   sem origem.
10. **O consultor prevalece sobre a régua.** O nivelamento da escalada sugere o mundo e o passo; na Clínica e no
    Completo, o foco escolhido pelo consultor é o que define o próximo passo. A escalada fica numa versão básica e
    será redesenhada depois.
11. **Mudar de degrau não apaga nada.** O que o cliente criou continua dele; o que sai do degrau vira histórico
    datado; cada mudança (subir, terminar o contrato, cancelar) tem uma mensagem dizendo o que muda.

## Os degraus de profundidade

Um esqueleto só, acumulativo. O que muda de um degrau para o outro é **quem preenche e prioriza** (o próprio cliente,
o consultor numa conversa curta, o consultor em profundidade) e o **grau de profundidade, complexidade e precisão**.
O degrau não é escolhido pelo cliente; é derivado do estágio no pipeline e dos dados que existem. O que falta some,
em vez de aparecer vazio ou bloqueado. Muitas funções da clínica e do planejamento completo ficam disponíveis em
**modo self-service**; por ora o cliente self-service tem acesso às ferramentas disponíveis, e a assinatura fica
para depois (decisão de 24/10).

| | **Visitante** (sem login) | **Cadastrado** (self-service) | **Clínica** (orientação curta) | **Completo** (planejamento contratado) |
|---|---|---|---|---|
| Quem é | Chegou por uma postagem, pelo link de indicação, pelo exame público ou pela Nord; usa por curiosidade | Criou login para guardar os dados e ver o planejamento cruzado; ou chegou pelo **programa de bem-estar financeiro da empresa** (junta tokens para pedir a clínica) | Fez a clínica financeira com um consultor | Passou por coleta, montagem e apresentação do plano |
| Quem preenche e prioriza | Ele, sem salvar | Ele (ou o casal), organizando as próprias prioridades | O consultor, na conversa, escolhendo onde focar; o foco dele prevalece sobre a régua | O consultor, em profundidade, com a coleta |
| Dados que existem | Nenhum guardado: os dados podem ser apagados ao sair | O que ele preencher no vetor (por membro e por domicílio, quando há dois) | Os do cadastrado + as **orientações da clínica** registradas pelo consultor | As quatro camadas: exame, coleta, decisões do consultor, calculado |
| Painel | Não há: é a **entrada** antes do login, que continua o assunto de onde a pessoa veio, e o exame em linguagem direta | O plano numa página: o objetivo protagonista no alto (os sonhos, ou a dívida a quitar, ou a primeira reserva), o próximo passo, as próximas tarefas, quatro números, o ritmo | O mesmo; sem objetivo combinado, o alto mostra "O que combinamos" com as orientações da consultora | O mesmo, com os números do plano; antes da apresentação, "Seu plano está em montagem" |
| Objetivos | Não (sem onde guardar) | O ambiente de cada objetivo, planejado por ele, e a tela "os objetivos juntos" | Os combinados na clínica e os que ele criar (a consultora vê) | Os do plano, com a liberdade e a carteira como objetivos complementares; é onde a reunião semestral acontece |
| Tarefas e lembretes | Não (sem onde guardar) | O sistema propõe as primeiras a partir do exame e ele aceita ou descarta; depois cria as suas a partir do Status; sem a categoria Carteira | Nascem das orientações da clínica, no ritmo da renda do cliente; o consultor pode acrescentar | Nascem do plano (aportes por objetivo, teto da semana, próximos passos, tarefas da coleta, carteira, educacionais) |
| Plano | As calculadoras do tema de entrada e do passo, sem Status | **Status**: todas as verticais com os seus valores, levando a cada calculadora, com o histórico | **Status** com as orientações da clínica em destaque | O livro completo (`evolucao-patrimonial.html`) dentro da área, e o Status como resumo |
| Conteúdos | Os públicos | A biblioteca, o comitê e as lives mensais | O mesmo | O mesmo, mais os materiais de atualização e as monitorias mensais |
| Utilitários | ✓ | ✓ | ✓ | ✓ |
| Orçado × realizado | Não | A partir do primeiro registro: dinheiro dedicado, sobra, dívidas, orçamento por grupo, teto da semana e patrimônio, lançados à mão | O mesmo, mais o colchão de renda irregular e o orçamento refeito na clínica; em estudo um **acesso pontual de open banking** | Aportes, orçamento por categoria e patrimônio, em 3, 6 e 12 meses e no ano; open banking quando conectado |
| Falar com alguém | **Agendar uma clínica**; ou **um planejador da Nord** pelo WhatsApp se a qualificação do domicílio passar (renda ≥ R$ 8.000, ou poupança ≥ R$ 1.500/mês, ou patrimônio ≥ R$ 150.000); senão, o grupo das **lives mensais** de planejamento e a orientação do próximo passo | O mesmo; no programa da empresa, todo colaborador é elegível à clínica e a pede com 5 tokens | Com a **própria consultora da clínica**, pelo nome; o **check-up anual** depois de 12 meses, ou a conversa de aprofundamento se a consultora a marcou | Com o próprio consultor, pelo **WhatsApp da Nord, livre**; dúvida e proposta de mudança no plano, com resposta em 2 dias úteis; a data prevista da **reunião semestral** |
| Jornada | Explorar calculadoras → saber como funciona o planejamento → eventualmente criar a conta | Cadastro → o próximo marco dele; a clínica oferecida ao lado | Exame → Clínica → (Conversa de aprofundamento, se o consultor marcar) → Check-up anual, 12 meses depois | Embarque → Coleta → Montagem → Apresentação → Execução → Reuniões semestrais → Renovação; materiais de atualização e monitorias mensais entre elas |

**As orientações da clínica não são sempre as mesmas.** Quem já tem a reserva ideal recebe foco em outro bloco; quem
não tem objetivo porque a prioridade é quitar dívida recebe o bloco de dívidas; quem fecha o mês em zero recebe o
bloco de orçamento e sobra; quem tem renda irregular recebe o colchão. O consultor escolhe, por vertical, onde focar
e o que pedir, no ritmo da renda do cliente (por mês, por entrada de renda, por evento ou como tarefa única); o
modelo precisa aceitar qualquer combinação de blocos, inclusive os que ainda serão elaborados. "Três números"
(reserva, objetivo, liberdade) é só o caso mais comum, não a regra.

O desenho começa pelo degrau **Clínica**: é o processo que a Nord já roda, é o que gera as primeiras tarefas com
lembrete e é o degrau que o cadastrado sobe e o cliente completo já passou. Ver a ordem em [ETAPAS.md](ETAPAS.md).

## Fora deste outline

- Preços, cobrança, o que entra na assinatura self-service e o que distingue comercialmente clínica de planejamento
  completo.
- O contrato do programa de bem-estar com cada empresa. O que já está decidido: todo colaborador é elegível, a
  clínica se pede com 5 tokens, e a empresa vê um painel só com dados agregados (uso, exame, evolução da saúde
  financeira, categorias de objetivos), nunca dados de uma pessoa. Ver UX.md › O programa de bem-estar da empresa.
- A área do consultor (pipeline, bônus, NPS, Programa Contínuo): só é tocada onde precisa gravar algo que o cliente vê
  (tarefas, respostas, jornada).
- A escolha do parceiro de open banking e o contrato de dados; aqui só o que a tela precisa receber dele.
