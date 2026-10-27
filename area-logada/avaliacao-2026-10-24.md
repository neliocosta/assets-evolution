# Avaliação da área logada por personas (24/10/2026)

Rodada de avaliação de UX **em texto**, antes de gerar o mock a partir de [PROMPT-MOCK.md](PROMPT-MOCK.md). O objeto é
[UX.md](UX.md), lido junto com [README.md](README.md), `DESIGN.md` e `PRODUCT.md`. Nada foi editado nesses arquivos.

## Método

Três agentes (Opus), em paralelo, cada um assumindo uma persona escolhida pelo dono do produto. Cada um percorreu, em
primeira pessoa, o que o UX.md descreve e anotou, passo a passo: o que esperava ver, o que a especificação diz que
vê, as dúvidas sobre a ferramenta, onde ficou confuso, o que soou fora de tom e o que teve valor de verdade.

| | Persona | Situação | Degrau |
|---|---|---|---|
| **P1** | **Juliana Ramos**, 36, gerente de produto, sozinha, sem filhos. Ganha R$ 14.500 líquidos, gasta R$ 9.000, guarda de forma irregular e tem R$ 210 mil, sem dívida | Curiosa: quer saber se consegue parar aos 55 e se a plataforma ajuda de verdade. Desconfia de "banco que quer vender produto" | Visitante → Cadastrado |
| **P2** | **Rafael Moura**, 31, analista de logística CLT. Ganha R$ 3.700 líquidos e deve R$ 4.800 no rotativo, cerca de R$ 1.100 no cheque especial e um consignado de R$ 9 mil. Não poupa nada | Viu o programa de bem-estar financeiro da empresa e quer fazer a jornada toda. Tem vergonha da situação e medo de que o RH veja os dados | Visitante → Cadastrado → (Clínica pelo programa) |
| **P3** | **Rodrigo**, 42, engenheiro, casado com Camila, uma filha de 9 anos. Ganham R$ 18 mil, gastam R$ 16 mil e têm R$ 450 mil | Contrata o planejamento completo, faz a reunião de apresentação com a Patrícia e vive o dia a dia. Testa se a área tem valor próprio além da reunião | Completo |

Os nomes Juliana e Rafael coincidem com os de `ux/personas/clientes-teste.md`, mas são pessoas diferentes desta rodada.

## Resumo em uma página

**O que as três personas valorizaram, sem combinar.** A resposta ao "não fiz", que mostra o efeito no sonho e o que
fazer em vez disso, é a melhor coisa da especificação. A P1 diz que "nenhum app de banco faz", e a P3 que é o que
justifica parte do valor pago. Também foram elogiados o próximo passo em uma frase no Painel, a memória das reuniões
na Jornada (P3), a evolução datada das respostas no Status (P1, P2) e a mensagem de fechamento do mês pelo sonho (P3).

**Onde a especificação falha.** Cinco pontos bloqueiam a jornada de pelo menos uma persona:

1. **O WhatsApp não tem regra de convivência.** A P3 contou de 13 a 18 mensagens por mês, sem teto nem agrupamento.
   Não há opt-in nem forma de desligar. A prévia mostra valor e a palavra "dívida" na tela bloqueada. O link do
   `/taskChecker` sem login funciona para quem receber a mensagem encaminhada. E o exemplo traz quatro emojis, contra
   a regra da própria especificação.
2. **Quem está em Sobreviver não tem desenho.** O Painel abre pedindo um sonho, e a dívida não aparece em nenhum dos
   seis blocos. Nenhuma fonte gera tarefa de dívida, o "não fiz" calcula o efeito "no sonho" e as duas saídas
   pressupõem sobra. O Realizado não mostra a dívida caindo. A P2 resumiu: "a ferramenta foi feita para quem já tem
   sobra".
3. **O momento de maior valor tem estado indefinido.** No Completo, a escolha do "não fiz" vira proposta e fica
   parada: não há estado "aguardando", prazo nem valor vigente para o próximo lembrete (P3). No Cadastrado, o "ajuste
   direto" muda o plano sem confirmação e sem dizer se cria uma versão (P1).
4. **A entrada pede confiança antes de dá-la.** Antes das duas portas, a pessoa não sabe quem é a Nord, o que é
   grátis nem como o planejador é remunerado (P1). O colaborador não sabe o que a empresa vê, e o canal corporativo
   não existe na especificação (P2). Também não há consentimento LGPD descrito.
5. **"Falar com alguém" falha nas duas pontas.** Quem não passa na qualificação recebe um texto e um vídeo de
   navegação, e um programa que a empresa pagou para todos deixa o colaborador sem humano (P2). Quem passa não é
   avisado de que o contexto vai junto, nem de quem atende e como essa pessoa é remunerada (P1).

**Contradições internas que as personas acharam:**
- Emojis no exemplo de WhatsApp contra "nada de emoji".
- "Ainda não" no WhatsApp contra "Não fiz" na área.
- O README diz que o Cadastrado "cria as suas" tarefas, e o UX.md diz que ele cai no Painel "já com as primeiras
  tarefas".
- O Realizado está na barra do Cadastrado, mas a regra é que ele "nunca vê um cartão vazio de Realizado".
- O mapa dos sete mundos aparece na entrada, mas a regra é que "no uso diário ela não aparece".
- O ritmo dos acompanhamentos aparece como 3 meses, 6 meses e semestral, conforme a tela.
- O livro manda para o ambiente do objetivo, e o ambiente do objetivo "é a página do capítulo Objetivos".
- "Preferem" no plural, num exemplo lido por uma pessoa sozinha.
- Os nomes dos equipamentos (Corda, Capacete, Grampos, Barraca, Bandeira) contra "nada de frase de jogo".

**Veredito das personas.**
- **P1** fica dois ou três meses como Cadastrada, de graça, para testar o ciclo. Não assina, porque nada diz o que a
  assinatura acrescenta, e não contrata o Completo sem saber como o planejador ganha dinheiro.
- **P2** diz que a ferramenta ajudou a enxergar, mas não a se organizar.
- **P3** recomendaria com ressalvas, e diz que a ferramenta justificaria de 25% a 30% do valor pago se três coisas
  funcionarem: o "não fiz", a semanada com ajuste e a memória das reuniões. Sem isso, "vira um repositório do
  relatório com notificações".

## Achados por gravidade

Cada achado consolida o que mais de uma persona viu, quando for o caso. A coluna "Quem viu" usa P1, P2 e P3.

### Bloqueantes

| # | Quem viu | Seção do UX.md | Problema | Sugestão de correção |
|---|---|---|---|---|
| B1 | P1, P2, P3 | Tarefas › O lembrete no WhatsApp | Não há teto de mensagens: somando aportes, semanadas, burocráticas, educacionais, repetições do "ainda não" e fechamento, dá de 13 a 18 por mês (P3: "no segundo mês eu silencio"). Também não há opt-in nem descadastro (P1, P2). A prévia expõe valor, objetivo e "dívida" (P1, P2). O link sem login permite que outra pessoa marque a tarefa (P1, P2) | Teto de mensagens por semana (por exemplo, duas, mais o fechamento). Agrupar os aportes do mesmo dia numa mensagem só com a divisão por sonho. Juntar a semanada e as burocráticas na mensagem do começo da semana. Pedir consentimento explícito no primeiro envio e pôr "parar lembretes" em toda mensagem. Prévia neutra ("Seu lembrete da Nord"). Link de uso único com expiração |
| B2 | P2 | Painel › 1, 4 e 5; Tarefas › De onde nasce; A tarefa em si; Realizado | Em Sobreviver, o bloco maior do Painel é o convite a criar um sonho, e a dívida não aparece no Painel. O destino "dívida" existe em Dedicar dinheiro, mas nenhuma fonte gera essas tarefas. "Renegociar" é burocrática sem roteiro. O "não fiz" calcula o efeito "no sonho" e oferece "manter a data ou adiar", como se houvesse sobra. Não existe lente de saldo devedor no Realizado | Em Sobreviver, a saída da dívida **é** o objetivo protagonista: "Quitar o cartão · saldo R$ 4.800 · previsto para junho", com traço de progresso, e o convite ao sonho entra depois, pequeno. Criar a fonte "dívidas mapeadas" (credor, saldo, juro, ordem de quitação) e um roteiro de renegociação (canal do credor, Desenrola, portabilidade do consignado). No "não fiz" de dívida, mostrar a nova data de quitação e os juros a mais, com uma terceira saída: "não consigo agora". Criar a lente "Dívidas" no Realizado, com lançamento manual |
| B3 | P3, P1 | Tarefas › A tarefa em si (Não fiz); Objetivos › 5 | No Completo, a escolha vira proposta à consultora e não tem estado, prazo nem valor vigente: o próximo lembrete vem com R$ 771 ou R$ 841? No Cadastrado e na Clínica, o "ajuste direto" não mostra o antes e o depois, não pede confirmação e não diz se cria versão | No Completo, aplicar a escolha na hora como **provisória**, com o estado "aguardando a Patrícia", o prazo esperado e o aviso quando ela aprovar ou ajustar. No Cadastrado e na Clínica, o ajuste mostra o antes e o depois, pede confirmação e cria uma versão datada (README › Premissa 6) |
| B4 | P1, P2 | A entrada › 1 e 3; README › Os degraus | As duas portas pedem uma decisão antes de dar um motivo. Não dizem quem é a Nord, o que é grátis nem como o planejador é remunerado. "Menos de 30 segundos" soa como captura de lead (P1). Não há canal corporativo nem frase sobre o que a empresa vê (P2). Não estão descritos os dados pedidos no cadastro, o consentimento LGPD nem como apagar a conta | Acima das portas: uma linha de promessa, uma de "quem somos e como somos remunerados" e o exemplo real da tela do "não fiz". Criar a entrada "programa da sua empresa", com "sua empresa não vê seus dados, só se você participa", e definir em que degrau o colaborador entra. Descrever o cadastro: o que é obrigatório, o consentimento e a exclusão |
| B5 | P2, P1 | Jornada e falar com alguém › Falar com alguém | Quem não passa na qualificação recebe uma orientação em texto e o vídeo de navegação, e percebe a diferença ("me mandar um tutorial quando pedi uma pessoa é me dispensar"). No programa corporativo isso é injusto, porque a empresa pagou para todos (P2). Quem passa não é avisado de que o exame e o passo vão para o atendente, nem de quem é essa pessoa (planejadora ou comercial, como é remunerada, em que horário atende) (P1) | Convênio corporativo dispensa a qualificação. Fora dele, quem não passa recebe pelo menos um contato humano possível (uma conversa em grupo agendável, um horário de plantão), nunca só o vídeo. Antes de abrir o WhatsApp: "quem atende verá o seu exame e o seu passo", com o nome e o papel dessa pessoa |

### Importantes

| # | Quem viu | Seção do UX.md | Problema | Sugestão de correção |
|---|---|---|---|---|
| I1 | P1, P2, P3 | Tarefas › O lembrete no WhatsApp; Princípios | O exemplo usa ✅ ◐ ⏳ 📅, e a especificação proíbe emoji. O WhatsApp diz "Ainda não" e a área diz "Não fiz": "ainda não" sugere que vai fazer depois, mas o sistema grava falta | Botões só em texto e os mesmos quatro rótulos em todo lugar. Decidir se "ainda não" é uma quinta resposta (lembrar de novo sem contar falta) ou se é "não fiz" |
| I2 | P1, P2 | A entrada › 3; README › tabela dos degraus | Contradição sobre quem gera as tarefas do Cadastrado: "já com as primeiras tarefas" (UX) ou "cria as suas a partir do Status" (README). A categoria Carteira no self-service ("Aportar R$ 5.000 no Tesouro IPCA") soa como venda e não tem quem recomende (P1) | Definir: o sistema propõe as primeiras tarefas a partir do exame e o cliente aceita ou descarta cada uma. A categoria Carteira só existe com consultor (Clínica ou Completo) |
| I3 | P1, P2, P3 | Tarefas › A tarefa em si; De onde nasce | Faltam respostas e formas comuns: "guardei a mais" (bônus) e "pus em outro objetivo" (o estado "coberto" existe no Realizado, mas não como resposta) (P1). "Não consigo" (P2). Um aporte único por mês dividido entre os sonhos: quem faz uma transferência só não quer quatro tarefas (P3). Data do lembrete pelo dia em que o dinheiro entra, e não 9h fixo (P1) | Acrescentar "fiz a mais" (corrigindo o número no "Fiz") e "usei em outro objetivo". Criar a tarefa "aporte do mês", com a divisão pelos sonhos e um "fiz" só, ainda nomeando cada sonho. Perguntar uma vez o dia em que o dinheiro entra e propor as datas a partir dele |
| I4 | P1, P2 | Tarefas › A tarefa em si (Adiar) | A justificativa obrigatória "que o consultor vê" não tem leitor no Cadastrado. Escrever "faltou dinheiro de novo" para ninguém é humilhante (P2) | No Cadastrado, a justificativa é opcional e serve só ao cliente, ou vira uma escolha de motivo que sugere um ajuste. Obrigatória só com consultor |
| I5 | P3 | Jornada (Completo); Painel | Entre contratar e receber o plano, o Painel do Completo fica quase vazio por semanas, pela regra "o que falta some", justo quando o cliente está mais engajado. A passagem para o Completo não tem tela nem mensagem | Criar o estado "plano em montagem": as etapas com datas, as tarefas de preparação (documentos do bloco 11 da coleta), o que esperar da apresentação e quem preenche a coleta. Uma mensagem de boas-vindas no dia da contratação |
| I6 | P3 | Plano › O livro; Objetivos › 2; Realizado › Patrimônio | O livro remete ao ambiente do objetivo e o ambiente remete ao capítulo do livro, num ciclo. A curva do patrimônio real aparece em três lugares. Não se sabe se uma proposta feita no objetivo aparece no livro, e vice-versa | O ambiente do objetivo é a fonte única. O livro mostra um resumo de uma linha e o link. O patrimônio real mora em Realizado, e as outras telas citam a origem. As propostas são uma lista só, vista dos dois lados |
| I7 | P1 | Objetivos; Plano › Status; A entrada › 2 | No Cadastrado, a liberdade pode ser objetivo ou vertical do Status, com risco de pedir o dado duas vezes. A calculadora sugerida pelo nivelamento pode não ser a da liberdade, que é o que ela veio buscar, e nada diz como sair da sugestão nem que premissas a calculadora usa | A liberdade é um objetivo em todos os degraus, e o Status lê dele. Pôr o link "ver outras calculadoras" ao lado da sugerida. Expor e permitir editar as premissas (rentabilidade real, inflação, perpetuidade ou consumo) |
| I8 | P1, P2, P3 | A escalada; Os equipamentos; A entrada › 2 | Os nomes dos equipamentos são frase de jogo, contra a regra do próprio documento. O mapa dos sete mundos aparece na entrada, contra "não aparece no dia a dia". "Sobreviver" aparece "conquistado" para quem nunca passou por ele. Quem tem patrimônio e não tem objetivo formal cai em Descobrir e se sente rebaixado (P1). "1 de 7" desanima quem está endividado (P2) | Nomes funcionais: Orçamento, Plano, Reserva, Seguros, Carteira, Estrutura, Sucessão. Na entrada, o resultado do exame em linguagem direta, dizendo o que já está resolvido ("reserva: ok") e o próximo passo, sem número de mundo nem mapa. Mundo pulado aparece como "não se aplica", não como conquista |
| I9 | P1, P2, P3 | Navegação; Realizado; Princípios ("um cadastrado nunca vê um cartão vazio") | Realizado está na barra do Cadastrado e abre vazio (P1). O Cadastrado não pode registrar patrimônio, e a "Altitude" fica sem base (P1). Sem open banking, o orçamento manual de três totais não sustenta "as três maiores diferenças por categoria" (P3). A mensagem da semanada cita o gasto da semana sem dizer quem o informou (P3). A semanada depende de um orçamento que o Cadastrado não tem, e os exemplos (fatura de R$ 6.000) estão fora da escala da P2. "Revisar a minha gestão financeira" fica vazia sem open banking (P3) | Sem registro, o destino da barra no Cadastrado é o Status, e o Realizado entra quando houver o primeiro lançamento. Patrimônio manual por bloco desde o Cadastrado, com uma tarefa trimestral de interação "atualizar o patrimônio". Diferenças por categoria só com dado categorizado. A mensagem da semanada pergunta primeiro "quanto foi na semana passada?" e só depois sugere o ajuste. Semanada mínima a partir de renda e fixas do exame. Sem open banking, "Revisar" vira um roteiro de autoavaliação (assinaturas, tarifas, seguros) ou fica escondido |
| I10 | P1, P2, P3 | Painel › 4 e 5 | No Completo, o bloco 4 tem cerca de 13 números numa faixa "compacta" no celular (P3). Em Sobreviver, patrimônio esperado, idade da liberdade e nota baixa são uma vitrine do que falta (P2). O Cadastrado não tem nenhum sinal de progresso, porque os 12 meses são só da Clínica e do Completo (P1) | Quatro números fixos (sobra, reserva, patrimônio × esperado, nota) e "ver todos". Em Sobreviver: renda, custo, sobra e dívida total, com a nota como evolução e não como placar. No Cadastrado, mostrar o Ritmo (X de N aportes) desde o primeiro mês marcado |
| I11 | P3, P2 | Jornada; Painel › 6; README | O calendário é inconsistente: Acompanhamento #1 aos 3 meses, #2 aos 6, "reunião semestral", "acompanhamentos semestrais". Na Clínica, o próximo contato vem só 12 meses depois, o que é longo demais para quem está em Sobreviver (P2) | Um calendário único, com o mesmo nome em todas as telas. Na Clínica, em Sobreviver, um retorno curto em 60 a 90 dias por padrão |
| I12 | P3 | Falar com alguém (Completo) | WhatsApp direto, "tirar uma dúvida" e "propor mudança" se sobrepõem. Não há prazo de resposta, e a resposta à dúvida chega duas vezes (área e WhatsApp) | Dizer quando usar cada um ("pergunta sobre uma página do plano" × "conversa") e o tempo esperado de resposta. A resposta chega num canal só, com aviso no outro |
| I13 | P1, P2 | Jornada (Cadastrado e Clínica); README › Os degraus | A trilha do Cadastrado termina em "convite à clínica ou ao completo", o que soa a funil (P1). "Conhecer o planejamento completo" ao lado da Clínica soa comercial para quem está em Sobreviver (P2). Nada diz o que a assinatura acrescenta ao grátis, nem o que separa a Clínica do Completo para quem está decidindo (P1) | A trilha termina no próximo marco da pessoa, e o convite fica ao lado, discreto. Esconder o convite ao Completo enquanto o cliente estiver em Sobreviver. Uma tela "O que muda em cada forma de acompanhamento", sem preço se preço estiver fora do outline |

### Detalhes

| # | Quem viu | Seção do UX.md | Problema | Sugestão de correção |
|---|---|---|---|---|
| D1 | P1 | Tarefas › A tarefa em si (exemplo) | "Preferem manter a data" no plural, para uma pessoa sozinha | Aplicar a regra singular/plural também aos exemplos da especificação e do mock |
| D2 | P2 | Tarefas (rótulo do sonho) | "Para sair do vermelho" soa julgador | "Para quitar o cartão", "para fechar o mês" |
| D3 | P3 | Realizado › Semanadas | "Semanada" lembra mesada de criança (a P2 não reclamou do nome, só da escala) | Testar "teto da semana" |
| D4 | P1 | Temporadas e os três números | "Check de altitude" e "temporada" são jargão de montanhismo | "Revisão trimestral" e "o ano" |
| D5 | P1 | Painel › 1 | Não diz quem escreve a frase do propósito nem de onde vem a foto no self-service | Frase sugerida editável e foto opcional, com um banco de imagens neutro |
| D6 | P3 | Realizado (seletor) | O seletor 3/6/12 meses não diz o que mostra quando há menos meses de dado; os 12 meses do Painel no primeiro mês também não | Mostrar só os horizontes que já têm dado, e o primeiro mês como "começou em outubro" |
| D7 | P3 | Plano › O livro (apresentação) | Não há ponte entre a reunião de apresentação e a área | Ao fim da apresentação: "a Patrícia criou estas tarefas e lembretes; confira e ajuste os horários" |
| D8 | P2 | Plano › Status | O estado "ruim" pode sair em vermelho na vertical de dívidas, e as formas propostas (bolhas, montanha, radar) podem não caber em 375 px | Tom de atenção (pêssego), não vermelho; validar as formas em 375 px no mock |
| D9 | P2 | A escalada | O critério de Sobreviver não diz se consignado e cheque especial contam como "dívida cara", nem como sair dele com consignado ativo | Definir "dívida cara" por taxa, e o consignado em dia como dívida que não prende em Sobreviver |

## Onde as personas divergiram

- **A escalada.** A P1, com R$ 210 mil, sente-se rebaixada por cair no mundo 2. A P2 desanima ao ver "1 de 7" com
  "vivo de renda" no fim. A P3 aceita a estrutura e só critica os nomes dos equipamentos. As três concordam que o
  mapa não deve abrir a experiência.
- **A qualificação silenciosa.** A P1 passa nos três critérios, mas se sente vigiada por não saber o que vai junto.
  A P2 não passa e se sente dispensada. A P3 nem chega a usá-la. A mesma regra falha por motivos opostos:
  transparência para quem passa, alternativa humana para quem não passa.
- **O WhatsApp.** A P3 quer menos mensagens e agrupadas. A P2 quer discrição (a prévia na mesa do trabalho). A P1
  quer controle (dia, desligar). Ninguém pediu mais mensagens. O fechamento do mês é a única que a P3 diz que leria
  sempre.
- **A semanada.** A P3 a acha valiosa (com o ajuste sugerido) e só estranha o nome. A P2 a acha fora da sua escala e
  sem base, porque não tem orçamento salvo. A P1 não chegou a ter uma.
- **O "não fiz".** As três o põem como o maior valor do produto, e cada uma esbarra num ponto diferente: a P1 por
  faltar respostas ("guardei a mais", "pus em outro objetivo"), a P2 porque as saídas supõem sobra, a P3 porque a
  escolha fica parada esperando a consultora.
- **O valor percebido.** A P3 atribui à ferramenta de 25% a 30% do valor do planejamento. A P1 vê valor suficiente
  para testar de graça, mas não para pagar. A P2 vê valor em enxergar, não em se organizar.

## Feedbacks, nas palavras das personas

**P1, Juliana (curiosa)**
- "Antes de pedir conta, me diga em uma frase o que eu levo e quem paga essa conta."
- "A tela do 'não fiz' é a melhor coisa daqui. Coloquem isso na entrada como exemplo."
- "Eu tenho R$ 210 mil e vocês me põem no mundo 2? Me tratem pelo que eu tenho, não pelo formulário."
- "Corda, capacete, barraca… achei que era coisa séria."
- "Deixem eu escolher o dia do lembrete pelo dia do meu salário, e me deixem dizer que guardei mais."
- "Não me mostrem uma aba Realizado vazia, nem me mandem justificar um adiamento para ninguém."
- "Quero registrar o meu patrimônio, mesmo sem ser cliente do Completo."
- "Se alguém da Nord vai ver os meus números, me avisem antes de abrir o WhatsApp."
- "Quero saber como o planejador ganha dinheiro antes de falar com ele."

**P2, Rafael (colaborador do programa de bem-estar)**
- "Me diga logo na entrada que a empresa não vê nada."
- "Não me peça um sonho antes de me ajudar a pagar o cartão."
- "Quero ver a dívida diminuindo; esse é o meu objetivo."
- "Semanada de R$ 6.000 não é para mim; calcule com o meu salário."
- "'Renegociar' sem me dizer como não é tarefa, é bronca."
- "Quando eu digo 'não fiz', me dê uma saída que caiba no meu bolso."
- "Tire os emojis e não escreva 'dívida' na prévia da mensagem."
- "Me mandar um vídeo de como usar a plataforma quando pedi uma pessoa é me dispensar."
- "Um ano até o próximo contato é muito para quem está apertado."

**P3, Rodrigo (planejamento completo)**
- "Entre assinar e receber o plano, a área não me deu nada para fazer."
- "Faço uma transferência só por mês; não quero quatro lembretes de aporte."
- "Quinze mensagens por mês e eu silencio vocês."
- "Prometeram adulto, sem emoji, e a primeira mensagem tem quatro emojis."
- "Falei 'não fiz', escolhi manter a data… e agora? Ninguém me disse."
- "Sem conectar o banco, o orçamento vira dever de casa."
- "O livro e a página do objetivo me mostram a mesma coisa; nunca sei qual é a oficial."
- "Ver o histórico das reuniões com o que ficou combinado é o que me faz voltar."

## Dúvidas que a especificação não responde

Agrupadas por assunto; entre parênteses, quem perguntou.

**Entrada, cadastro e privacidade**
1. O que o cadastro pede (e-mail, WhatsApp, CPF)? O WhatsApp é obrigatório? (P1, P2)
2. Onde ficam o consentimento LGPD e a exclusão da conta? Quem na Nord vê os dados de um Cadastrado? (P1, P2)
3. Existe convênio corporativo? Em que degrau o colaborador entra, a clínica vem incluída e o que a empresa vê? (P2)
4. Quantas perguntas tem o exame e quanto tempo leva? (P1)

**Tarefas e lembretes**
5. Quem gera as tarefas do Cadastrado: o sistema ou o próprio cliente? (P1, P2)
6. Há limite e agrupamento de mensagens? Como funcionam o opt-in e o opt-out? O que aparece na prévia? (P1, P2, P3)
7. O link do `/taskChecker` sem login é seguro se a mensagem for encaminhada? (P1, P2)
8. "Ainda não" e "Não fiz" são a mesma resposta? (P3)
9. No "não fiz" sem objetivo (dívida), o efeito é calculado sobre o quê? (P2)
10. O "ajuste direto" do Cadastrado cria uma versão do plano? Em que difere da proposta? (P1)
11. No Completo, qual o prazo de resposta da consultora e o que vale enquanto ela não responde? (P3)
12. Quem lê a justificativa de adiamento quando não há consultor? (P1, P2)
13. De onde vêm as tarefas da categoria Carteira no self-service? (P1)

**Dados e Realizado**
14. A liberdade, no Cadastrado, é objetivo ou vertical do Status? (P1)
15. O Cadastrado registra patrimônio? Como a Altitude é calculada sem esse dado? (P1)
16. Semanada e orçamento existem no Cadastrado? Com que dado? (P2)
17. Sem open banking, quem informa o gasto da semana citado na mensagem da semanada? (P3)
18. "Revisar a minha gestão financeira" existe sem open banking? (P3)
19. O que o seletor 3/6/12 meses mostra quando há menos meses de dado? (P3)
20. Consignado e cheque especial são "dívida cara"? Como se sai de Sobreviver com consignado ativo? (P2)

**Relação com a Nord**
21. Em que momento o cliente vira Completo, e o que o Painel mostra antes de existir plano? (P3)
22. A coleta é preenchida pelo cliente, pelo consultor ou pelos dois? (P3)
23. Os acompanhamentos são trimestrais ou semestrais? (P3)
24. Uma proposta feita no objetivo aparece no livro, e vice-versa? (P3)
25. Quem atende o "Falar com alguém": planejador ou comercial? Em que horário? Como é remunerado? (P1)
26. A qualificação silenciosa vale para quem chegou por um programa pago pela empresa? (P2)
27. O que a assinatura acrescenta ao grátis, e o que separa a Clínica do Completo para quem está decidindo? (P1)

## O que mudar no UX.md antes de gerar o mock

Em ordem de prioridade. Os itens 1 a 5 mudam telas que o mock vai desenhar; os seguintes podem entrar como notas.

1. **WhatsApp com regra de convivência** (B1, I1): teto semanal, agrupamento, consentimento, "parar lembretes",
   prévia neutra, link de uso único, sem emoji e os mesmos rótulos da área. Reescrever o exemplo da mensagem.
2. **Desenho de Sobreviver** (B2, I10): a dívida como objetivo protagonista no Painel, a fonte "dívidas mapeadas"
   em "De onde nasce", o "não fiz" de dívida com a saída "não consigo agora", a lente "Dívidas" no Realizado e o
   Painel enxuto nesse mundo.
3. **Estado do "não fiz" e do ajuste** (B3, I3): "provisório / aguardando a consultora" no Completo; antes e depois,
   confirmação e versão no Cadastrado e na Clínica; as respostas "fiz a mais" e "usei em outro objetivo"; a tarefa
   "aporte do mês" com a divisão por sonho.
4. **Entrada com confiança** (B4, I8): promessa, quem somos, como ganhamos dinheiro e o exemplo do "não fiz" acima
   das portas; a entrada corporativa com a frase de privacidade; o resultado do exame em linguagem direta, sem
   mapa e sem número de mundo.
5. **"Falar com alguém" refeito** (B5, I12): convênio dispensa a qualificação; quem não passa recebe uma
   alternativa humana; aviso do que vai junto e de quem atende; no Completo, quando usar cada canal e o prazo.
6. **Resolver as contradições internas**: quem gera as tarefas do Cadastrado (I2); Realizado na barra do
   Cadastrado (I9); calendário único de acompanhamentos (I11); livro × ambiente do objetivo, com o ambiente como
   fonte única (I6); a liberdade sempre como objetivo (I7).
7. **Estado "plano em montagem"** no Completo (I5), com as tarefas de preparação da coleta.
8. **Tom**: nomes funcionais no lugar dos equipamentos, "revisão trimestral" no lugar de "check de altitude",
   singular/plural nos exemplos, "para quitar o cartão" no lugar de "para sair do vermelho", e avaliar o nome
   "semanada" (I8, D1 a D4).
9. **Adiar sem plateia** no Cadastrado (I4), **Carteira só com consultor** (I2) e **convites comerciais
   discretos** (I13).
