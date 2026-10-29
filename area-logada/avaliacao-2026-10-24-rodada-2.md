# Avaliação da área logada: segunda rodada (24/10/2026)

Esta é a segunda rodada de avaliação de UX em texto, ainda antes do mock. O objeto continua sendo [UX.md](UX.md),
lido com [README.md](README.md), [ETAPAS.md](ETAPAS.md), [PROMPT-MOCK.md](PROMPT-MOCK.md) e `DESIGN.md`. A
primeira rodada está em [avaliacao-2026-10-24.md](avaliacao-2026-10-24.md) e continua valendo: seus achados
(B1–B5, I1–I13, D1–D9) não são repetidos aqui, só citados quando uma persona desta rodada os confirma ou os vê de
outro jeito. A numeração continua a da primeira rodada (B6 em diante, I14 em diante, D10 em diante). Nada foi
editado em UX.md nem nos outros arquivos.

## Método

Seis agentes (Opus) em paralelo, cada um com instrução de não repetir a primeira rodada:

| | Quem | Situação | Degrau |
|---|---|---|---|
| **JU** | **Juliana Ramos**, 36, gerente de produto, sozinha. Ganha R$ 14.500 e gasta R$ 9.000. Tem R$ 210 mil, guarda de forma irregular (bônus em março) e não tem dívida | Segue a Nord nas redes há meses e chegou pelo carrossel "A conta dos 300", pelo link da bio. Vem aberta, com confiança prévia | Visitante → Cadastrado |
| **RM** | **Rafael Moura**, 31, analista de logística CLT. Ganha R$ 3.700 e mora com a mãe, dividindo as contas | Chegou pelo programa de bem-estar da empresa. Está no zero a zero, **sem dívida**: o salário acaba com o mês, não tem reserva nem objetivo e nunca investiu | Cadastrado → (Clínica pelo programa) |
| **CR** | **Camila (31) e Rafael (33)**, casal CLT do perfil 1 de `ux/personas/clientes-teste.md` | Chegaram pelo exame público. Ganham R$ 13 mil juntos, têm R$ 60 mil e quatro objetivos. O foco é o casal como usuário | Cadastrado |
| **MA** | **Marcos** (48), empresário do perfil 2. Tem renda irregular, com distribuição em junho e dezembro, R$ 1,8 mi investidos e R$ 2 mi na empresa | A clínica com a Patrícia focou em reserva e em organizar a renda irregular, sem objetivos | Clínica |
| **PA** | **Patrícia**, consultora (`ux/personas/consultora-patricia.md`), com uma carteira de cerca de 40 clientes | Do lado dela: registra a clínica do Marcos, uma reunião da Juliana (perfil 3), trata tarefas e propostas e vê o que o cliente vê | Área do consultor |
| **AV** | Avaliador de UX sem persona | Contradições, telas sem volta, o que some entre degraus, carga do Painel, 390 px, dados ausentes, estados não descritos | — |

## Resumo em uma página

**A tese, vista de fora.** A primeira rodada mostrou que o ciclo plano → lembrete → resposta → ajuste é a melhor
ideia do produto. Esta rodada mostra **para quem ele foi desenhado sem perceber: uma pessoa só, com salário mensal
fixo, sobra positiva e um objetivo por vez**. Cada persona quebra uma dessas premissas:

- O casal tem duas pessoas, duas datas de salário e quatro sonhos para uma sobra só (CR).
- O empresário recebe duas vezes por ano e faz a reserva remanejando patrimônio, não com aporte (MA).
- A Juliana guarda pelo bônus (JU).
- O Rafael não tem sobra para dedicar (RM).

**Os dez bloqueantes desta rodada**, em uma linha cada:

1. **Não existe modelo de casal (B6).** A conta é de uma pessoa, a renda entra pela metade, o lembrete não tem
   destinatário definido, a resposta não diz quem tocou e um muda o plano do outro sem avisar.
2. **A renda irregular não cabe (B7).** Toda tarefa de dinheiro é mensal, com dia fixo. Faltam gatilho por evento
   ("na distribuição de dezembro"), meta anual com bônus, colchão com entrada e saída, e leitura do Realizado por
   ciclo.
3. **Quem precisa começar a sobrar fica sem caminho (B8).** A régua de nivelamento não mede sobra, então quem
   fecha em zero "conquista" o orçamento sem ter um. Nenhuma fonte de tarefa cria sobra. E o "não fiz" com sobra
   zero vira espiral: cada falta aumenta o pedido seguinte.
4. **Os objetivos são planejados um a um (B9).** Nenhuma tela soma os aportes contra a sobra nem distribui o
   patrimônio que já existe. Cada sonho cabe sozinho, e juntos não cabem.
5. **O lado do consultor não está descrito (B10).** Faltam três coisas: a tela de registro da clínica (só existe
   em ETAPAS, com outro vocabulário), o "ver como o cliente" e uma fila única do que espera por ela. Com 40
   clientes, ela teria de abrir ficha por ficha.
6. **A Clínica não tem identidade própria (B11).** A régua manda o Marcos para Descobrir e contraria o foco que a
   Patrícia escolheu. O bloco maior do Painel pede objetivos que a clínica não trabalhou. As orientações em si não
   aparecem em lugar nenhum.
7. **Links e estados não estão definidos (B12).** A página do `taskChecker` aplica a saída do "não fiz" sem login.
   Os links que abrem a área não dizem como sobrevivem ao login. Também faltam os estados de link expirado, tarefa
   já respondida, offline e erro.
8. **Faltam telas que a navegação promete (B13).** O cartão do passo "abre o passo", mas não existe tela de
   passo. A caixa de marcar do Painel não alcança o "não fiz". Dúvidas, respostas e propostas não têm casa.
9. **Mudar de degrau não tem regra (B14).** Não se diz o que acontece com o que o Cadastrado criou quando sobe,
   nem o que acontece no fim do contrato, no cancelamento ou na troca de consultor.
10. **A porta de entrada real, as redes, não tem continuidade (B15).** O post prometeu "calcule o seu número", e a
    plataforma abre com duas portas e um exame. O conteúdo, motivo de a Juliana seguir a Nord, não tem destino e
    fica bloqueado por mundo.

**O que mudou em relação à primeira rodada.**
- A Juliana desta rodada, que já confia, quase não precisa do "quem somos" do B4. Ela precisa de continuidade com
  a postagem.
- O Rafael sem dívida mostra que o problema do B2 é mais largo do que dívida: é a **falta de sobra**.
- O Marcos e a Patrícia mostram que a Clínica, que o README chama de "o degrau por onde o desenho começa", é o
  degrau menos especificado.

## Achados por gravidade

Siglas da coluna "Quem viu": JU, RM, CR, MA, PA e AV, como na tabela do método.

### Bloqueantes

| # | Quem viu | Seção do UX.md | Problema | Sugestão de correção |
|---|---|---|---|---|
| B6 | CR, RM | A entrada › 3; Navegação (vetor); Tarefas › O lembrete; A tarefa em si; Falar com alguém | **Não há modelo de domicílio.** "Criar a minha conta" faz da conta de um o plano dos dois, e o exame pergunta "sua renda". Com só a renda da Camila (R$ 7.200), o Painel mostra a sobra errada e a qualificação **recusa** um casal que passaria com R$ 13 mil. O lembrete vai para "o cliente": a Camila recebe e o Rafael transfere. O `taskChecker` não sabe quem tocou, e respostas conflitantes ou duplicadas não têm regra. O Rafael escolheu "adiar a viagem" pelo WhatsApp e a Camila descobriu dois dias depois. Quem divide a casa sem ser casal (RM, com a mãe) também não tem lugar | Na criação da conta, perguntar "só você ou vocês dois?". Criar um vetor de domicílio com membros (renda, data de salário, parte nas contas) e convidar o cônjuge com login próprio. Cada tarefa ganha um responsável (uma pessoa ou "os dois"), e o lembrete vai para ele. A primeira resposta fecha a ocorrência e o outro recebe "Rafael marcou: fiz". Links por pessoa, para gravar a autoria. O ajuste feito por um fica "proposto por Rafael" até o outro concordar (ou por 48 h). A qualificação soma o domicílio. Para a casa dividida, perguntar no exame "qual a sua parte nas contas?" |
| B7 | MA, JU, CR, PA | Tarefas › As categorias e De onde nasce; Objetivos › 2; Realizado; Painel › 5; Temporadas (Ritmo) | **O modelo é de salário mensal fixo.** O Marcos recebe R$ 60 mil em junho e em dezembro, e a orientação da clínica é de mão dupla: guardar na distribuição e **tirar** do colchão nos meses magros. A Juliana guarda pelo bônus de março, e a tarefa mensal fixa a condena desde o primeiro mês. O casal tem salários no dia 5 e adiantamento no dia 20. A Patrícia não consegue pedir "R$ 20 mil de cada distribuição". O Realizado, os 12 meses do Painel e o Ritmo ("X de 12 aportes") mostram fracasso mês a mês em quem cumpre no ciclo combinado | Recorrência por **evento de renda** ("a cada entrada de X", ligada às datas de renda do vetor), com janela em vez de dia fixo. Meta anual com padrão de entrada (mensal mais bônus no mês X). A fonte "colchão de renda irregular", com entrada semestral e saída mensal ("transferir R$ 5 mil para a PF; restam R$ 20 mil"). A tarefa de aporte com parcelas ("R$ 1.500 no dia 5, da Camila; R$ 800 no dia 20, do Rafael"). Realizado, 12 meses e Ritmo medidos no ritmo combinado, com o horizonte "o ano" |
| B8 | RM | A escalada › Dúvida a decidir (régua); Os sete mundos; Tarefas › De onde nasce; A tarefa em si | **Quem fecha o mês em zero sem dívida não tem caminho.** A régua mede dívida e saldo negativo, não sobra. O Rafael pula Sobreviver, "conquista" o Motor (o orçamento) sem ter orçamento e cai em Descobrir, que pede aportes impossíveis. O passo de que ele precisa ("sobra automática") mora em Construir, dois mundos adiante. Toda fonte de tarefa de dinheiro supõe um aporte que já existe. Com sobra zero, "manter a data" faz o pedido subir a cada falta (R$ 370 → R$ 395 → …), uma **espiral**. Viver "por pouco" faz o cliente pular entre Sobreviver e Descobrir a cada mês ruim | A régua ganha um critério: "sobra média abaixo de 5% da renda em 3 meses → passo 'começar a sobrar'", antes dos objetivos. O Motor só é conquistado com sobra verificada, e há uma janela de 3 meses para entrar e sair de Sobreviver. Nova fonte de tarefas, "começar a sobrar": transferência automática pequena no dia do salário (1% a 3%, editável), um corte escolhido e o 13º, as férias e a PLR como tarefas de dedicar dinheiro. Terceira saída padrão no "não fiz" e no "fiz parte": **"ajustar ao que coube"**, em que o valor feito vira a meta e a data se estica. Depois de duas faltas, sugerir reduzir, nunca aumentar |
| B9 | CR | Objetivos › 2; Painel › 1 e 4 | **Os objetivos não são vistos juntos.** O casal criou casa, viagem, carro e escola. Os aportes somam mais de R$ 5 mil para uma sobra de cerca de R$ 5 mil antes do lazer, e nenhuma tela confronta a soma. Também não se diz onde ficam os R$ 60 mil já investidos: reserva, casa ou divididos (confirma a "transferência única" da P3 no I3) | Uma tela "os objetivos juntos": soma dos aportes × sobra, ordem de prioridade arrastável e o que muda em cada sonho ao reordenar. Distribuir o patrimônio existente entre a reserva e os objetivos. No Painel, um aviso discreto quando não couber |
| B10 | PA | O que o consultor vê | **O consultor não tem as telas de que precisa.** O registro da clínica não está no UX.md; só ETAPAS 2.1 o descreve, falando de "verticais", enquanto "Os equipamentos" fala de "passos e equipamentos". Não existe "ver como o cliente": ao telefone, a Juliana diz "o app pede R$ 841" e a Patrícia não vê. Não existe "lançar pelo cliente". Dúvidas, propostas e adiamentos repetidos estão na ficha de cada cliente, fora do painel. A estimativa dela, para uma carteira de 40: de 30 a 45 itens por mês, perto de dois por dia útil, cada um tocando o WhatsApp | Descrever a tela da clínica: verticais em ordem → alvo (com origem e editável) → pedido → **prévia das tarefas, dos lembretes e da primeira mensagem** → publicar. Um vocabulário só. Modo "ver como o cliente", só leitura, no degrau dele (Painel, Tarefas, Objetivos, última mensagem enviada), e "lançar pelo cliente", com origem "consultor". Uma fila única, "Espera por mim", com tipo, cliente, idade e prazo, ordenada por vencimento, com "tratei". Avisos num resumo diário, não um WhatsApp por evento |
| B11 | MA, PA, AV | A escalada › Dúvida a decidir; Os equipamentos; Painel › 1; Navegação (coluna Clínica) | **A Clínica não se sustenta.** Quando a régua ("sem objetivo → mundo 2") e o foco escolhido pela consultora (reserva e fluxo) discordam, nada diz quem vence: o Marcos, com R$ 3,8 mi, fica em "Descobrir". O bloco 1 do Painel, o maior, é de objetivos, e o estado vazio só está definido para o Cadastrado: na Clínica, parece que a Patrícia esqueceu. O rótulo "combinado na clínica de 12/09" marca números, mas as **orientações em si** (as frases da consultora) não aparecem no dia a dia. A Clínica também não tem frase de propósito (AV) | **O foco do consultor prevalece sobre a régua.** O mundo vira contexto, e "objetivos não definidos" vira pendência, não rebaixamento. Na Clínica sem objetivo, o bloco 1 vira "O que combinamos em 12/09": as orientações, o andamento de cada uma e, abaixo, "temas para uma próxima conversa" (faculdades, casa de praia), registrados pela consultora |
| B12 | AV, CR | Tarefas › O lembrete no WhatsApp; (não existe seção de estados) | **Links e estados não estão definidos.** A página de retorno do `taskChecker` oferece "manter a data ou adiar" fora da área, ou seja, **muda o plano sem login**. O B1 tratou só de marcar a tarefa. "Fiz parte", "Adiar" e o link curto abrem a área sem regra de login: se o login descartar o destino, o toque único morre. Também não estão descritos: o link de setembro tocado em outubro, o link de R$ 771 depois que a tarefa passou a R$ 841, a tarefa já respondida por outro canal, por outra pessoa, pelo consultor ou pelo open banking, o offline e o erro de gravação | A página sem login só registra a resposta; qualquer ajuste ao plano exige sessão. Link mágico de uso único que preserva o destino. Uma seção "Estados" no UX.md, com texto para cada caso: idempotência ("já registrado em 5/10 por Rafael"), ocorrência vencida, valor recalculado, fila offline e erro visível |
| B13 | AV | Painel › 2 e 3; Navegação | **A navegação promete telas que não existem.** O cartão do passo "abre o passo com as suas tarefas", mas não há tela de passo (a trilha mora na Jornada, que não é diária). A "caixa de marcar" do Painel equivale a quê? Ela não alcança o "não fiz", o momento de maior valor. O toque numa tarefa leva à lista, não à tarefa. Respostas a dúvidas, comentários do consultor e propostas pendentes não têm destino | Criar a tela do passo, ou levar à tarefa principal dele. No Painel, o toque abre o cartão da tarefa com as quatro respostas. Criar "Conversas e propostas" (destino ou seção da Jornada), com contador |
| B14 | AV, MA, PA | Navegação; README › Os degraus | **Mudar de degrau não tem regra.** Na subida, não se diz se os objetivos e tarefas criados pelo Cadastrado ficam. O cliente do Completo perde o "ajuste direto" que tinha, sem explicação. A Jornada da Clínica some no Completo. Não se diz se o rótulo "combinado na clínica" continua. O cliente do Clínica que cria um objetivo não sabe se ele entra no plano nem se a consultora vê (MA). A descida não está descrita: fim de contrato, assinante que cancela, check anual vencido, troca de consultor, férias da consultora (PA) | Regra geral: **nada criado pelo cliente some**; o que sai do degrau vira histórico datado (foto); cada mudança de degrau tem uma mensagem de transição dizendo o que muda. A Clínica herda o Cadastrado, e a consultora vê o que o cliente cria. Descrever o que acontece, no fim do contrato, com o livro, as versões, os lembretes recorrentes, as propostas pendentes e o contato da consultora |
| B15 | JU | A entrada › 1 e 2; A escalada › A jornada educacional; Navegação | **A entrada ignora de onde a pessoa vem.** O carrossel diz "calcule o seu número", e a plataforma abre com duas portas e o exame. Para quem já segue, as portas não pedem confiança, só atrasam. O conteúdo, motivo de seguir a Nord, não tem destino na navegação, fica "desbloqueado ao entrar no mundo" (o vídeo de Proteção que ela já viu no Instagram ficaria bloqueado) e o comitê mensal não tem lugar, formato nem degrau | Links profundos por tema (liberdade, reserva, dívida, sobra): cada um abre a calculadora do post com a premissa citada ("a conta dos 300"), e o exame vem depois, como "veja o resto do seu quadro". Destino **Conteúdos**: biblioteca aberta a todo logado, o comitê (ao vivo e gravado) e "recomendado para o seu passo" em destaque, sem bloquear nada |

### Importantes

| # | Quem viu | Seção do UX.md | Problema | Sugestão de correção |
|---|---|---|---|---|
| I14 | MA, RM | Plano › Status; Painel › 1, 2 e 4; Tarefas › De onde nasce | **"Reserva" não está definida.** O Marcos aparece com "reserva R$ 0 · ruim" tendo R$ 1,8 mi, boa parte com liquidez D+1, e contesta o número com razão. A reserva dele se faz por remanejamento (resgatar R$ 110 mil para um DI D+0), uma tarefa única de Carteira, e nenhuma fonte gera isso. Para o Rafael, a primeira reserva é **o** sonho, mas ela não é objetivo e não pode ocupar o bloco 1. Ninguém diz, de forma neutra, onde guardar a primeira reserva. Não está dito se a empresa entra em "patrimônio × esperado" | Definir reserva por liquidez e prazo, e mostrar "liquidez disponível × reserva separada". Separar empresa e financeiro no patrimônio. A reserva pode ser objetivo protagonista ("Minha reserva · R$ 1.000 · dez/2026"), sugerida pronta para quem não tem nenhuma e como objetivo complementar quando é o foco da clínica. Fonte "remanejamento" para quem já tem patrimônio. Tarefa neutra, sem marca: "abrir uma reserva com liquidez diária e garantia do FGC", ligada a um vídeo |
| I15 | JU, MA, AV | Tarefas › A tarefa em si (Não fiz) | **O efeito do "não fiz" não serve a todos os casos.** Num objetivo de 20 anos, uma falta move a data em semanas, e a Juliana aprende que faltar não importa. Para a reserva e para o colchão, "a data do sonho" não existe: o útil seria "o colchão acaba em abril; a guia de maio sai do longo prazo". Para as tarefas burocráticas, educacionais e comportamentais, o efeito não está definido | Uma tabela de efeito por categoria e horizonte. Objetivo longo: o dinheiro perdido na data do sonho ("R$ 6.800 a menos hoje são R$ 14 mil a menos aos 55") e o ritmo do ano. Reserva e colchão: o mês em que acaba e o compromisso que fica descoberto, com a saída "resgatar agora". Burocrática: o risco que segue aberto. Comportamental: o teto que resta |
| I16 | JU, CR | A escalada › régua; Os equipamentos; Plano › Status; README › Premissa 2 | **A régua e o vetor não acompanham a vida.** "Proteção necessária" não depende do perfil: a Juliana, sem dependentes, pode ouvir que precisa de seguro de vida. Não há eventos de vida (o filho chegou e nada mudou) nem mudanças futuras conhecidas (a promoção do Rafael em março, a licença, o IPVA de janeiro a março): o vetor guarda só "variáveis atuais" | Proteção por perfil: sem dependentes, invalidez e saúde. "Algo mudou ou vai mudar": evento datado que entra no plano a partir da data. A chegada de um dependente reordena o próximo passo para Proteger |
| I17 | MA, JU, RM | Falar com alguém › Clínica e Cadastrado; Jornada › Clínica | **O contato humano não acompanha a relação.** Na Clínica, o Marcos, que sentou com a Patrícia, volta a falar com "um humano da Nord", enquanto no Completo o botão tem nome e foto. O primeiro momento difícil dele foi a distribuição de janeiro, e a Nord só aparece em setembro. A "Conversa de aprofundamento" só existe se a consultora pedir. No Cadastrado, a Juliana queria **agendar uma clínica** pelo botão, e a opção não existe. Para o Rafael, "o botão fica para quando os números mudarem" é inalcançável (poupar R$ 1.500 é metade do salário) | "Falar com Patrícia" também na Clínica. Retorno curto disparado pelo primeiro evento combinado (a primeira distribuição), não pelo calendário. O cliente pode pedir a conversa de aprofundamento. No Cadastrado, "Agendar uma clínica", dizendo o que ela cobre, com o WhatsApp como segunda opção. Tirar a promessa "quando os números mudarem" (complementa B5) |
| I18 | PA | O que o consultor vê; A tarefa em si; Falar com alguém (Completo); Realizado › As revisões | **O fluxo de trabalho da consultora tem lacunas.** Para aprovar R$ 771 → R$ 841, ela não vê a conta nem o que mais muda, nem se aprovar cria versão e regera as tarefas. Não há prazo de resposta nem quem cubra nas férias. O resumo da reunião vai direto ao cliente, sem nota interna. Falta "quem participou", e não dá para ligar tarefas que já existiam. Não se diz como a versão nova do plano (feita no portal) se liga à reunião. A revisão automática de 3/6/12 meses e o registro da reunião se sobrepõem. Ela só "vê" o lembrete, não o ajusta. Não está dito quem recebe os pedidos de conversa de Visitante e Cadastrado. As tarefas com responsável "consultor" (bloco 11 da coleta) não aparecem | Na aprovação: antes e depois, a conta, as tarefas que mudam e a versão que será criada. Prazo visível (por exemplo, 2 dias úteis); passado o prazo, vale o provisório do B3. Registro de reunião com dois campos (para o cliente / interno), participantes, "ligar tarefas existentes" e "criar versão a partir desta reunião", que leva ao portal e volta. Um registro só: a revisão gerada vira o rascunho da reunião. O consultor edita a hora e o canal do lembrete; mudar o valor de uma tarefa do plano passa por versão. Roteamento: Visitante e Cadastrado vão à fila comercial, Clínica à consultora da clínica. As tarefas dela entram em "Espera por mim" |
| I19 | AV | Navegação; README › Premissa 3 | **A barra do celular contradiz a premissa.** O README diz que o Status nasce no celular e o Realizado no desktop, mas a barra põe o Realizado e esconde o Status em "Mais". "Falar com" aparece duas vezes (em "Mais" e como botão fixo), e o botão fixo disputa espaço com a barra | Barra: Painel, Objetivos, Tarefas, Status, Mais. "Falar com" num lugar só |
| I20 | AV | Painel › 1 a 4 | **O próximo passo fica abaixo da dobra.** Em 390 × 844 sobram cerca de 640 px úteis, e cabem a frase do propósito e um a um e meio cartões de objetivo. O passo, que é a pergunta do Painel, fica escondido. A contagem de elementos é de 15 a 20 no Cadastrado, 45 a 55 na Clínica e 70 a 80 no Completo (o bloco 4 tem 16 valores) (confirma e amplia I10) | Objetivos numa faixa compacta (cerca de 140 px, foto pequena, rolagem horizontal) e o cartão do passo acima da dobra |
| I21 | AV, JU | Plano › Status; PROMPT-MOCK.md | **O Status diverge entre os documentos.** A ordem e os grupos das verticais são outros no PROMPT, que diz seguir a escalada e não segue. A "montanha" é proibida pelos Princípios. O PROMPT faz da grade uma das duas formas e pede "convite em cinza" e "o que o planejamento completo acrescentaria", contra "o que falta some". O PROMPT fala em "uma saída" do "não fiz", e o UX.md em duas. As bolhas proporcionais aos reais repetem a proporção solta que a memória do projeto proíbe. No Cadastrado, "ordenar as prioridades" não diz o que a ordem muda (JU) | Uma lista canônica de verticais no UX.md, que o PROMPT copia. Tirar a montanha. Rever as bolhas (tamanho por peso no plano, não por reais). A primeira prioridade vira o próximo passo do Painel; se a ordem não mudar nada, tirar a função |
| I22 | AV, CR | Painel › 4; Status; Tarefas › O lembrete | **Não há regra para dado ausente, parcial ou velho.** Custo de vida, proteção % (numerador e denominador), idade da liberdade ("nunca" não tem texto), nota de um exame de 18 meses mostrada como atual, "previsto para março" sem aporte, "faltam R$ 27 mil" num objetivo sem valor, rótulo "combinado na clínica" depois que o cliente editou o valor. A renda pela metade do casal aparece como completa | Para cada número: frase de ausência, validade e "atualizar", que leva à vertical. O rótulo da clínica vira "combinado em 12/09, ajustado por você em 3/11". Dado parcial avisa: "a renda de Rafael não foi informada" |
| I23 | RM, JU | Realizado; O lembrete no WhatsApp (fechamento); Os sete mundos (marcos); Tarefas › A lista (sequência) | **Não há progresso para quem está começando ou guarda de forma irregular.** A sobra realizada não é métrica em lugar nenhum, e o fechamento só fala do sonho. Os marcos começam em R$ 100 mil (mundos 4 a 6), e a sequência só conta "tudo feito", que o Rafael nunca alcança. Quem não tem orçamento salvo e não tem open banking não tem ferramenta para achar de onde tirar dinheiro | Lente "Sobra" no Realizado desde o Cadastrado (um número manual por mês). Fechamento: "Outubro: sobraram R$ 120. É o seu segundo mês com sobra." Marcos em Construir (primeiros R$ 500, um mês de custo guardado, 3 meses seguidos com sobra). Sequência "meses com sobra" e "guardou mais que no mês anterior". Roteiro manual "onde sobra" (assinaturas, tarifas, celular, delivery) em todos os degraus |
| I24 | CR | Objetivos › 2 | **A calculadora só conhece "um montante na data".** A escola é uma despesa que começa e não acaba. A casa troca o aluguel de R$ 2.800 pela prestação de R$ 3.500 | Tipos de objetivo: "despesa que começa em…" e "troca de despesa", com o efeito no fluxo depois da data |
| I25 | JU, MA, RM | Tarefas › O lembrete no WhatsApp; A jornada educacional | **Um tom só não serve a todos.** A Juliana exige que o número dos lembretes não leve ofertas ("se virar canal de venda, eu saio"). O Marcos acha "Hoje é dia de guardar…", quiz e vídeo de capítulo coisa de iniciante e quer uma linha com o número e a ação. O Rafael precisa de mensagens que não o façam sentir que falhou | Regra: o número de lembretes só manda lembrete e fechamento; ofertas, se houver, vão em outro canal com consentimento próprio. Variante curta para perfil avançado. Educacional pelo perfil (empresário: dividendos, pró-labore, holding), com o quiz opcional |
| I26 | JU | A entrada › 2 | **A sessão do visitante se perde entre aparelhos.** Começar no celular (navegador do Instagram) e continuar no notebook perde tudo; o login social costuma falhar dentro do Instagram | "Continuar no computador": enviar o link da sessão por e-mail ou WhatsApp, ou criar a conta só com e-mail |
| I27 | AV | (não existe) | **Não há estado de "plano em revisão".** Durante uma revisão ou montagem de versão nova, não se diz em que versão ficam as tarefas e o Painel, nem o que acontece com as propostas (o I5 tratou só do primeiro plano) | Aviso "nova versão em preparação", tarefas na versão vigente, propostas congeladas até a publicação |
| I28 | AV | Realizado › Orçamento; Status | **Três telas não cabem em 390 px.** A mesa "em fila" vira um cartão por tela e perde a comparação. As tabelas do fluxo (12 meses × cerca de 30 categorias) ficam ilegíveis. Bolhas e radar não acomodam rótulos de 11 px. O traço tocável da versão tem alvo menor que 44 px (complementa D8) | No celular, um mês em lista; o Status em forma vertical; alvo de toque de 44 px |
| I29 | JU, MA | Plano › Utilitários; Jornada › Clínica | **A conversão para um serviço maior não usa o que a plataforma sabe.** O convite ao Completo é genérico. O que levaria a Juliana à clínica é saber quanto a taxa do fundo do banco custa até os 55. O que levaria o Marcos ao Completo é a faculdade do filho, que ficou de fora da clínica | Utilitário "Quanto a taxa me custa até a liberdade", terminando em "quer que alguém olhe? Agende a clínica". O convite ao Completo cita os temas que a consultora registrou como "para uma próxima conversa" |

### Detalhes

| # | Quem viu | Seção do UX.md | Problema | Sugestão de correção |
|---|---|---|---|---|
| D10 | AV | Painel › 4 e 5; Temporadas | "Ritmo" é contagem e "os últimos 12 meses" é em reais, com o mesmo nome. "Proteção %" e o pilar Proteção também têm o mesmo nome | Um nome por número: "Cobertura de seguros" × pilar "Proteção" |
| D11 | AV | Princípios; Plano › O livro | Mais de uma pílula de ação por tela (no Painel; no livro, "Simular" × "Próximo") | Eleger a pílula de cada tela; "Simular" como terciário |
| D12 | AV | (DESIGN.md) | A Same Door Rule e o título de 32 px não estão definidos fora do livro. A "travessia" (DESIGN.md) e a "escalada" (UX.md) convivem sem regra | Declarar o cabeçalho da área logada (título de 22 a 24 px no celular) e qual metáfora manda |
| D13 | AV | Tarefas › A lista | Quatro botões grandes em cada cartão da lista | "Fiz" e "⋯" na lista; as quatro respostas no cartão aberto |
| D14 | RM | Realizado › Semanadas; Tarefas › As categorias | A semanada é toda pensada em fatura de cartão | Teto semanal em qualquer meio (Pix, débito, dinheiro), com o total informado pela pessoa |
| D15 | CR | Princípios (casal no plural); Realizado; Tarefas › A lista | A regra de plural não define o leitor ("você marcou" × "Bom dia, Camila"). A autoria pode virar placar dentro do casal. Falta filtro por responsável | Ações no singular de quem lê, plano e sonhos no plural, a autoria do outro pelo nome. No fechamento, só "vocês fizeram 3 de 3", com a autoria no histórico e nunca em ranking. Filtro "por responsável" |
| D16 | RM | Realizado › Dinheiro dedicado | "Faltou" em todo mês desanima quem está começando | Com o ajuste ao que coube (B8), o estado é "cumprido na nova meta" |
| D17 | JU | Painel › 1; A entrada › 2 | A liberdade calculada na entrada não vira objetivo sozinha. A má notícia do diagnóstico ("não dá aos 55") não tem forma | Ao criar a conta, a liberdade calculada aparece como primeiro objetivo, para confirmar. Mostrar as três alavancas (aporte, idade, custo de vida) |
| D18 | JU | Jornada (Cadastrado) | A Jornada do Cadastrado fica vazia de relação | Conteúdos vistos e comitês assistidos contam como parte da relação com a Nord |
| D19 | PA | O que o consultor vê; ETAPAS 2.5; Falar com alguém (Completo) | O ETAPAS lista dois blocos do painel interno e o UX.md lista três. O WhatsApp pessoal da consultora fica exposto e a conversa não fica registrada | Alinhar o ETAPAS. Um número da Nord por consultor, com a conversa anexada à ficha |
| D20 | PA, AV | Jornada (Completo) | O pipeline termina em "Aguardando execução" e não alimenta #1, #2 e Revisão | O registro de reunião avança a etapa |
| D21 | CR | Objetivos › 1 | O "por que importa" e a foto não têm autor no casal | Texto de cada um, ou um texto conjunto editável pelos dois |

## Onde as personas divergiram

- **A régua de nivelamento falha em três direções.** Para o Rafael ela é **frouxa** (deixa passar quem não tem
  sobra). Para o Marcos ela é **teimosa** (contraria a consultora). Para a Juliana ela é **genérica** (cobra seguro
  de vida de quem não tem dependentes). A correção não é ajustar um critério: é fazer da régua uma sugestão que o
  consultor sobrepõe, com critérios de sobra e de perfil.
- **Velocidade × consentimento.** A P3 da primeira rodada pediu que a escolha do "não fiz" valesse na hora. O
  casal pede que a escolha de um espere a concordância do outro. A Patrícia pede para ler cada lembrete antes de ir
  ao cliente. As três coisas convivem se o ajuste for **provisório e visível** (vale já, o outro ou a consultora
  revê), e não bloqueante.
- **A confiança muda o que a entrada precisa.** A Juliana desconfiada da primeira rodada pedia "quem somos e como
  ganham dinheiro". A Juliana que já segue a Nord pede o contrário: menos porta e mais continuidade com o post. A
  entrada genérica precisa do B4; a entrada por tema (B15) precisa de quase nada além do número prometido.
- **Tom.** O Marcos quer uma linha seca com número e ação. O Rafael quer não se sentir reprovado. A Juliana quer o
  tom das postagens. Um texto só não serve aos três: variantes por perfil (I25).
- **Conteúdo.** A Juliana quer a biblioteca aberta e o comitê como lugar. O Marcos acha quiz e vídeo de capítulo
  infantis e quer conteúdo do perfil dele. O UX.md desbloqueia por mundo. Os dois concordam que o desbloqueio por
  mundo não serve.
- **O valor da área.** O casal vê valor no ciclo, desde que decidido a dois. O Rafael vê valor em registrar a
  sobra, não em produzi-la. O Marcos diz que aos seis meses já teria desligado os lembretes, e que contrataria o
  Completo pelo que a clínica deixou de fora, não pela área. A Juliana procuraria a clínica e pagaria a assinatura
  pelo comitê ao vivo e pela biblioteca. A Patrícia diz que a memória das reuniões é o que a faria usar a
  ferramenta amanhã.

## Feedbacks, nas palavras das personas

**Juliana (chegou pelas redes)**
- "Vim de um post sobre o número da liberdade. Me deixem calcular o número antes de me fazer exame."
- "Comecei no celular e terminei no notebook. Perdi tudo."
- "Eu não guardo todo mês, guardo no bônus. Planejem comigo como eu ganho."
- "Pular um mês e ver a data mexer três semanas me ensina que pular não faz diferença."
- "Cadê os vídeos? Eu sigo vocês por causa deles."
- "Se o WhatsApp de tarefas virar canal de venda, eu saio."
- "Quero poder marcar a clínica pelo botão, não só puxar conversa."

**Rafael Moura (zero a zero, sem dívida)**
- "Vocês me deram o orçamento de presente só porque não devo nada. Eu não tenho orçamento."
- "Não me peça a Itália. Meu sonho agora é ter R$ 1.000 na conta."
- "Comece com R$ 100. Se pedir R$ 370, eu falho no primeiro mês e não volto."
- "Cada vez que eu não consigo, vocês pedem mais. Abaixe a meta, não aumente."
- "Me diga de onde tirar o dinheiro antes de me dizer para onde mandar."
- "Comemore quando sobrar mais que no mês passado, não só quando eu fizer tudo."
- "O 13º é a minha chance. Me lembre dele em novembro."

**Camila e Rafael (casal)**
- Camila: "Criei a conta e ela virou minha. O plano é nosso."
- Rafael: "Eu transfiro, ela recebe o lembrete. Ou vem para mim, ou vem para os dois com uma resposta só."
- Camila: "Ele adiou a nossa viagem pelo WhatsApp e eu não fiquei sabendo."
- Os dois: "Cada objetivo cabia sozinho. Juntos não cabem, e ninguém nos disse."
- Camila: "O bebê chegou e nada no app mudou."
- Rafael: "Mostrem quem marcou, mas não transformem isso em placar."

**Marcos (Clínica)**
- "Minha clínica foi sobre reserva e fluxo. Por que a maior parte da tela me pede sonhos?"
- "Tenho R$ 1,8 milhão. Não me mandem guardar R$ 1.000 por mês: me digam quanto resgatar e para onde."
- "O combinado era guardar na distribuição e tirar nos meses magros. Cadê a segunda metade?"
- "Sentei com a Patrícia, e o botão me manda para 'um humano da Nord'."
- "O momento difícil foi janeiro, e a Nord só aparece em setembro."
- "Quero ver o que ficou de fora da clínica. É isso que me faria contratar o resto."

**Patrícia (consultora)**
- "Onde eu registro a clínica? Achei no plano do projeto, não na tela."
- "O Marcos recebe duas vezes por ano. Não me obrigue a pedir 'por mês'."
- "Resumo que o cliente lê não é a minha anotação. Preciso das duas."
- "Se eu não consigo ver o que a Juliana vê, não consigo atendê-la ao telefone."
- "Não vou abrir 40 fichas para achar proposta pendente. Quero uma fila."
- "A memória das reuniões é o que me faria usar isto amanhã."

## Dúvidas que a especificação não responde

Só as novas; as 27 da primeira rodada continuam abertas.

**Quem é o cliente**
1. A conta é individual ou do domicílio? O cônjuge tem login próprio? O exame é por pessoa ou do casal? (CR)
2. O vetor guarda renda e patrimônio por pessoa ou somados, e a qualificação usa qual? (CR)
3. Como o exame trata quem divide a casa sem ser casal? (RM)

**Régua e escalada**
4. Quando a régua e a escolha do consultor discordam, qual define o próximo passo? (MA)
5. Quem fecha o mês em zero sem dívida cai em que mundo, e o Motor é dado como conquistado? (RM)
6. Há janela de tempo para entrar e sair de Sobreviver? (RM)
7. O que é "proteção necessária" para quem não tem dependentes? (JU)
8. O que conta como reserva: produto, prazo de liquidez ou conta separada? A empresa entra no patrimônio? (MA)

**Tarefas e plano**
9. Uma tarefa pode ter janela ou gatilho de evento em vez de data? Pode ter parcelas de pessoas diferentes? (MA, CR, PA)
10. Existe tarefa de saída (complementar a renda a partir de um colchão)? (MA)
11. Existe meta anual ou aporte sazonal? (JU)
12. O "não fiz" recorrente pode baixar o valor em vez de subir? (RM)
13. Quando a soma dos aportes passa da sobra, o que a área faz? Como se distribui o patrimônio existente? (CR)
14. Onde se registra uma mudança futura conhecida (promoção, licença, nascimento)? (CR)
15. No Cadastrado, quem define o valor de `reservaMensal`, e com que regra? (RM)
16. O que muda quando o Cadastrado ordena as prioridades no Status? (JU)

**Navegação e estados**
17. Existe tela de passo? A caixa do Painel equivale a "Fiz"? (AV)
18. Onde ficam as respostas a dúvidas, os comentários e as propostas? (AV)
19. O que acontece com um link antigo, com uma tarefa já respondida e com uma resposta dada offline? (AV)
20. O que acontece com os dados e os lembretes quando o contrato termina ou o cliente desce de degrau? (AV)
21. Um post pode levar direto a uma calculadora? Como continuar no notebook o que se começou no celular? (JU)
22. Onde ficam os conteúdos e o comitê mensal, e o Cadastrado tem acesso? (JU)

**Lado do consultor**
23. Como é a tela de registro da clínica, por vertical ou por passo e equipamento? (PA)
24. O resumo de reunião tem nota interna? É o mesmo registro da revisão de 3/6/12 meses? (PA)
25. Aprovar uma proposta cria versão e regera as tarefas? O consultor vê o efeito antes? (PA)
26. Existe "ver como o cliente" e "lançar pelo cliente"? (PA)
27. Quem recebe os pedidos de conversa de Visitante e Cadastrado? Quem cobre a carteira nas férias? (PA)
28. Faltas e adiamentos de clientes de Clínica chegam ao consultor? (PA, MA)

## O que mudar no UX.md antes de gerar o mock

Somam-se à lista da primeira rodada (WhatsApp com regra, desenho de Sobreviver, estado do "não fiz", entrada com
confiança, "Falar com alguém"), que continua valendo. Em ordem de prioridade:

1. **Modelo de domicílio e responsável** (B6): conta "só você ou vocês dois", vetor com membros, responsável por
   tarefa, autoria da resposta, ajuste provisório que avisa o outro, qualificação pelo domicílio.
2. **Ritmo de renda real** (B7, B9): recorrência por evento de renda, parcelas por pessoa, meta anual com bônus,
   colchão com entrada e saída, a tela "os objetivos juntos" e o Realizado medido no ritmo combinado.
3. **Começar a sobrar** (B8, I14, I23): critério de sobra na régua, fonte "começar a sobrar", saída "ajustar ao
   que coube", reserva como objetivo, marcos iniciais e lente "Sobra".
4. **A Clínica com identidade** (B11, I17): o foco do consultor prevalece sobre a régua; o bloco "O que combinamos
   em 12/09" no Painel; "Falar com Patrícia"; retorno por evento; "temas para uma próxima conversa".
5. **O lado do consultor** (B10, I18): tela de registro da clínica com prévia, "ver como o cliente", "lançar pelo
   cliente", fila "Espera por mim", aprovação com antes e depois, nota interna e prazo.
6. **Uma seção "Estados e transições"** (B12, B14, I27): links sem login que só registram, link mágico que
   preserva o destino, idempotência, offline, erro, plano em revisão, subida e descida de degrau.
7. **As telas que faltam na navegação** (B13, I19, I20): tela do passo, cartão de tarefa com as quatro respostas
   no Painel, "Conversas e propostas", Status na barra, passo acima da dobra.
8. **Entrada por tema e destino Conteúdos** (B15, I26): links profundos com a calculadora do post, "continuar no
   computador", biblioteca e comitê abertos.
9. **Alinhar o PROMPT-MOCK.md ao UX.md** (I21): lista canônica de verticais, sem montanha, sem "convite em
   cinza", sem "o que o completo acrescentaria", "duas saídas".
10. **Efeito do "não fiz" por categoria e horizonte** (I15) e **regra para dado ausente ou velho** (I22).
