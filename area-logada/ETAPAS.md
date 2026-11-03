# Área logada do cliente — etapas do projeto

A ordem segue o valor: primeiro o ciclo tarefa → lembrete → fez/não fez, que é o que o produto promete; depois o
plano completo dentro da área; depois o realizado manual; só então o open banking, que troca a origem dos dados sem
mudar a tela. Cada etapa termina usável por cliente real.

Cada etapa é pensada para virar um ou poucos prompts de desenvolvimento. O critério de pronto é o que se verifica
antes de passar à próxima.

## Visão geral

| # | Etapa | Entrega | Depende de |
|---|---|---|---|
| 0 | Mock navegável | HTML único com os quatro degraus e as situações (casal, Sobreviver, sem sobra, renda irregular, Clínica sem objetivo, plano em montagem), para alinhar antes de codar | este outline |
| 1 | Fundamentos | vetor de variáveis por membro e domicílio, degraus de acesso, modelo de tarefa/realizado no ritmo da renda, régua de nivelamento, versões do plano, estados | 0 aprovado |
| 2 | Tarefas e lembretes (degrau Clínica) | Painel + Tarefas + WhatsApp com resposta e regras de convivência; consultor registra a clínica com prévia, vê como o cliente e trabalha numa fila | 1 |
| 3 | Plano completo na área | o livro dentro da área, Conversas e propostas, plano em montagem, mudanças de degrau, jornada | 1 (anda em paralelo com 2) |
| 4 | Realizado manual | foto do plano, aportes, sobra, dívidas, colchão, orçamento e patrimônio lançados à mão; roteiro "onde sobra"; revisões de 3/6/12 meses | 2 e 3 |
| 5 | Open banking | conexão, conciliação de aportes, gastos por categoria, posições; tarefas auto-concluídas | 4 + contrato com o parceiro |
| 6 | Entradas, programa corporativo, conteúdos, oportunidades e self-service | links por tema, entrada do programa corporativo com os tokens e o painel agregado da empresa, Conteúdos com as lives e as monitorias, achados de economia do parceiro, cadastro | 5 (achados); 3 (o resto) |

## Etapa 0 — Mock navegável

**Objetivo:** ver a área inteira antes de escrever uma linha de produção, nos quatro degraus, com os dados da família
de exemplo (Ana e Marcos). Prompt pronto em [PROMPT-MOCK.md](PROMPT-MOCK.md).

**Entrega:** `area-logada/mock/index.html`, autocontido, com um seletor de degrau e de situação no alto, a entrada
do visitante (sem origem, por tema e pelo programa da empresa), as telas do cliente (Painel, Objetivos, Tarefas,
Plano, Realizado, Conteúdos, Jornada, Conversas, a tela do passo), a pré-visualização da mensagem de WhatsApp e, do
lado do consultor, o registro da clínica com a prévia e a fila "Espera por mim".

**Pronto quando:** o dono do produto e uma consultora passam pelas telas em cada degrau e situação e aprovam o que
aparece e o que some; a forma do Status no desktop está escolhida (UX.md › Decisões de 24/10); as dúvidas viram itens em
PENDENCIAS.md.

## Etapa 1 — Fundamentos

**Objetivo:** o que todas as telas precisam e que não aparece.

1. **O vetor de variáveis atuais**, um por cliente, com data e origem em cada valor (exame, coleta, clínica,
   cliente, consultor, open banking). As calculadoras atuais, a coleta e o portal de montagem passam a ler e gravar
   nele; é o que liga a coleta à montagem do relatório. Cada gravação guarda o valor anterior com a data, para o
   histórico de respostas do Status. **Por membro e por domicílio**: quando o plano é de um casal, a renda, as datas
   das entradas e as respostas pessoais ficam por membro; patrimônio, despesas, objetivos e poupança, no domicílio.
   O vetor guarda também **mudanças futuras conhecidas** com data (promoção, licença, nascimento, distribuição).
2. **Degrau do cliente** derivado do login, do pipeline e dos dados: Visitante (sem login, nada guardado),
   Cadastrado (login; por conta própria ou pelo programa de uma empresa), Clínica (orientações registradas),
   Completo (contrato assinado; plano em montagem até a apresentação). Uma função só, usada por toda a área. Os dois
   pipelines (planejamento e clínica) alimentam a mesma função. **Toda mudança de degrau** (subida, fim de
   contrato, cancelamento, troca de consultor) preserva o que o cliente criou, guarda o resto como histórico e
   dispara uma mensagem de transição.
3. **Modelo de tarefa:** título, **categoria** (dedicar dinheiro, comportamental, burocrática e contratação,
   interação com a Nord, educacional, carteira), o objetivo ou passo a que serve, origem (objetivo, liberdade,
   reserva, remanejamento, começar a sobrar, dívidas, colchão, eventos de renda, orçamento, evolução, coleta,
   carteira, educacional, oportunidade, manual), **responsável** (um membro, os dois, o consultor), a forma própria
   da categoria (valor, quando e destino; limite e período com semanas; prazo, responsável e roteiro; conteúdo e quiz;
   ativo e ação), **quando**: dia fixo, dia em que uma entrada cai, evento de renda com janela, parcelas, meta
   anual; lembrete (canal, hora, antecedência), comentários, e as respostas (data, estado
   fiz/parte/não/adiada/coberta por outro objetivo, valor, nova data e motivo, **quem respondeu**, por qual canal:
   cliente, outro membro, consultor, taskChecker, open banking). A primeira resposta fecha a ocorrência; a segunda
   não sobrescreve. Absorve a `tarefasList` da coleta, a página `/minhastarefas` e o `/taskChecker` que já existe,
   com links pessoais e de uso único.
4. **A escalada, versão básica:** os sete mundos (Sobreviver → Descobrir → Construir → Focar → Proteger → Otimizar
   → Desfrutar), um passo atual por cliente e a régua simples do UX.md (com "sem sobra" levando a "começar a
   sobrar"), mundo pulado como "não se aplica" e o **foco do consultor prevalecendo** sobre a régua na Clínica e no
   Completo. Devolve o mundo, o passo atual e os três números. A escalada será redesenhada depois (decisão de
   24/10); os refinamentos estão em UX.md › Para o redesenho da escalada e não entram nesta etapa.
5. **Modelo do realizado:** os registros datados de `reaproveitar/acompanhamento.js` (`foto`, `realizado` por mês),
   estendidos para orçamento por grupo, teto da semana, sobra mensal, saldo de dívidas por credor, saldo do colchão e
   patrimônio por bloco (com a participação na empresa à parte), sempre com origem, lidos no ritmo combinado (mês,
   evento ou ano).
6. **Versões datadas do plano.** Toda alteração ou ajuste cria uma versão com data; a comparação de um mês usa a
   versão vigente naquele mês. Para isso o "hoje" do motor passa a vir do relógio (PENDENCIAS.md, item 20) e a data
   da versão, do plano.
7. **Geração das tarefas a partir do plano:** a função que, dado o plano vigente e um período, devolve as tarefas
   pedidas, cada uma com categoria e objetivo (aportes por objetivo, liberdade, reserva, teto da semana e teto de
   ajustáveis, próximos passos, recomendações da carteira, conteúdos do mundo), juntando os aportes do mesmo dia num
   "aporte do mês" no dia do salário. Testada em `verificar.js` com o plano de exemplo.
8. **Efeito de uma falta:** a função que, dada uma tarefa e uma falta, devolve o efeito pela categoria e pelo
   horizonte (nova data e novo aporte num objetivo; dinheiro a menos na data num objetivo longo; data de quitação e
   juros numa dívida; mês em que acaba numa reserva ou colchão; teto restante numa comportamental) e as saídas
   (manter a data, adiar, ajustar ao que coube, usei em outro objetivo), sugerindo reduzir depois de duas faltas
   seguidas. Usa o motor que já existe.
9. **O caminho (antes "Os objetivos juntos"):** a função que soma os aportes pedidos contra a sobra, distribui o
   patrimônio existente entre a reserva e os objetivos e, dada a ordem de prioridade (o dinheiro vai todo para o 1
   até se pagar, depois para o 2; no máximo dividido entre 1 e 2), devolve a data em que cada marco se paga no
   ritmo de hoje. É a mesma função que alimenta as duas linhas do tempo, os sliders de aporte e de orçamento, o "no
   ritmo de hoje" do objetivo e o efeito do "não fiz" (decisão 16 do UX.md).
10. **Estados:** idempotência das respostas, ocorrência vencida, valor recalculado depois do envio, fila offline,
    erro de gravação e "plano em revisão" (tarefas na versão vigente enquanto a nova é preparada).

**Pronto quando:** `node verificar.js` cobre os itens 4, 7, 8 e 9 com o plano de exemplo e com um casal, uma renda
semestral e uma sobra zero; a página de tarefas atual e o `/taskChecker` leem e gravam no modelo novo sem perder as
tarefas existentes; uma calculadora (a reserva, por exemplo) lê e grava no vetor e o valor anterior fica datado.

## Etapa 2 — Tarefas e lembretes, no degrau Clínica

**Objetivo:** o ciclo completo funcionando para o processo que a Nord já roda hoje.

1. **Registro da clínica pelo consultor** (UX.md › O que o consultor vê › Registrar a clínica): as verticais na
   ordem canônica, as de foco marcadas, o alvo (com origem, editável) e o que pedir **no ritmo da renda** (por mês,
   por entrada, por evento, tarefa única), as orientações em frases, os temas para uma próxima conversa, a marca de
   "precisa de conversa de aprofundamento" (que agenda a reunião) e a **prévia** das tarefas, dos lembretes e da primeira mensagem antes de publicar. Blocos maleáveis, não um
   formulário fixo de três números. Sem isso, o degrau Clínica não existe.
2. **Painel** (celular primeiro), o plano numa página: o objetivo protagonista no alto em faixa compacta (os
   objetivos, a dívida a quitar, a primeira reserva ou "O que combinamos"), o próximo passo acima da dobra com a
   tela do passo, as próximas tarefas com as quatro respostas a um toque, quatro números e "ver todos", o ritmo, o
   próximo encontro.
3. **Tarefas:** lista agrupada no tempo com filtro por categoria, por objetivo e por responsável; o cartão com Fiz /
   Fiz parte / Não fiz / Adiar (motivo para o consultor, ou opcional no Cadastrado), o efeito da falta pela categoria
   e as saídas (manter a data, adiar, ajustar ao que coube, usei em outro objetivo); a página da tarefa (editar,
   comentar, histórico com quem respondeu); o lembrete como atributo; o teto da semana na comportamental.
3b. **Objetivos:** o ambiente de cada objetivo pelos tipos (montante, despesa que começa, troca de despesa, dívida,
   reserva, liberdade), com a calculadora embutida para o cadastrado e os combinados da clínica, e a tela "os
   objetivos juntos".
4. **WhatsApp:** a mensagem de lembrete gerada da tarefa, com os dois links pessoais do `/taskChecker` (fiz / não
   fiz) e os links que abrem a tarefa para "fiz parte" e "adiar"; o envio pelo serviço `liberta-whatsapp` com as
   **regras de convivência** (consentimento, "parar lembretes", entre 10 e 15 por mês, aportes juntos no dia do
   salário, prévia neutra, sem
   emoji, só tarefas, versão curta); a mensagem de fechamento do mês pelo objetivo ou pela sobra. A página de
   retorno do `taskChecker` em "não fiz" mostra o efeito e as saídas; escolher uma saída pede sessão.
5. **Consultor:** "ver como o cliente" e "lançar pelo cliente"; a fila única "Espera por mim" no painel interno
   (faltas repetidas, adiamentos repetidos, dúvidas, propostas, reuniões sem resumo, tarefas dele, pedidos de
   conversa), com prazo, "tratei" e resumo diário por WhatsApp.
6. Aposentar a página de lembretes avulsos: os lembretes existentes viram tarefas manuais com lembrete.

**Pronto quando:** um cliente de clínica recebe o lembrete no WhatsApp no dia em que a renda dele cai, marca "fiz"
com um toque, o Painel mostra "1 de 3" e o consultor vê a mesma coisa em "ver como o cliente"; um cliente com renda
semestral recebe a tarefa na janela da distribuição. Medidas de uso a acompanhar desde o primeiro dia: % de
lembretes respondidos em 48 h, % de meses com todas as tarefas feitas no ritmo combinado e % de clientes que
desligam os lembretes.

## Etapa 3 — Plano completo dentro da área

**Objetivo:** o cliente do planejamento completo encontra, na mesma área, o livro apresentado na reunião.

1. Embutir `evolucao-patrimonial.html` como o destino Plano, lendo do armazém da plataforma (o bloco `armazem` trocado
   por `window.__MONTAGEM__`/`/montagemController`, interface mantida), com sumário e páginas vistas.
2. Tarefas nascendo do plano: aportes por objetivo e liberdade, próximos passos do capítulo Evolução, recomendações
   da carteira, bloco 11 da coleta. Recalcular o valor pedido quando o plano muda.
3. "Simular e propor" visível em cada página com números do cliente, como ação terciária; o ambiente do objetivo
   como fonte única (o livro mostra uma linha e o link).
4. **Conversas:** a tela aberta por "Falar com alguém", com as opções do degrau e o histórico de dúvidas, propostas,
   ajustes provisórios e comentários, com contador. Dúvida em texto com a página de origem anexada; chega à fila do
   consultor; a resposta volta às Conversas, com aviso no WhatsApp; prazo visível. O "não fiz" do Completo vale
   como provisório até a aprovação. Na aprovação, o consultor vê o antes e o depois, a conta e as tarefas que mudam.
4b. **Registro e histórico de reuniões:** o consultor registra cada reunião a partir do rascunho da revisão (data,
   participantes, resumo para o cliente, nota interna, tarefas criadas ou ligadas, versão do plano criada no portal
   e ligada à reunião); o cliente vê o histórico na Jornada, com o estado atual de cada tarefa; o registro avança a
   etapa no pipeline.
5. **Jornada** derivada do pipeline e dos registros (Embarque → Coleta → Montagem → Apresentação → Execução →
   Reuniões semestrais → Renovação), com as datas e o que foi entregue em cada etapa, ao lado da escalada; versões
   Clínica (check-up anual, e a conversa de aprofundamento quando marcada) e Cadastrado (com o próximo marco). O
   "Falar com alguém" por degrau: a consultora pelo nome e o WhatsApp livre no Completo; a consultora e o check-up
   na Clínica; agendar uma clínica, a qualificação do domicílio (parâmetros) e o grupo das lives mensais para os
   demais; no programa da empresa, os tokens.
6. **Status:** o resumo pela lista canônica de verticais para os três degraus logados, cada uma levando à
   calculadora (e ao capítulo, no Completo) e voltando com "o plano se ajustou", com o histórico de respostas por
   janela, a validade dos valores e "Transformar em tarefa". No celular, lista vertical. **Utilitários** como bloco
   próprio, com "quanto a taxa me custa".
7. Jornada da clínica (Exame → Clínica → Conversa de aprofundamento, se marcada → Check-up anual) gravada pelo
   consultor no painel interno, no mesmo lugar em que registra a clínica.
8. **Plano em montagem e mudanças de degrau:** a mensagem de boas-vindas e o Painel "Seu plano está em montagem"
   com as tarefas de preparação da coleta; as mensagens de transição de cada mudança de degrau; o fim do contrato
   devolvendo o cliente a Cadastrado com o histórico só leitura.

**Pronto quando:** Adriano e Camila (primeiro cliente real) abrem a área, leem o plano, recebem as tarefas de aporte
geradas dele e mandam uma dúvida que chega à consultora.

## Etapa 4 — Realizado, com lançamento manual

**Objetivo:** o orçado × realizado existe e é validado com clientes reais antes de depender do parceiro.

1. **Versão do plano** gravada na apresentação (o botão de `reaproveitar/acompanhamento.js`, parte 2) e a cada
   ajuste ou revisão; a lista de versões com data e o que mudou entre elas.
2. **Aportes:** a lente planejado × feito por tarefa recorrente, no ritmo combinado, com os estados cumprido /
   cumprido na nova meta / coberto / faltou, origem de cada dado (e quem marcou), o horizonte 3 | 6 | 12 | o ano |
   desde o plano e o traço de troca de versão.
2b. **Sobra, dívidas e colchão:** a sobra mensal desde o Cadastrado; o saldo por credor com a data de quitação; o
   saldo do colchão subindo nos eventos e descendo nas saídas.
3. **Orçamento:** o orçado vem do Fluxo de caixa do portal (Completo), do orçamento da clínica ou do orçamento por
   grupo do cadastrado; três visões com alternador: a mesa de comparação (um cartão por mês, orçado × realizado; as
   maiores diferenças por categoria só com dado categorizado), o fluxo de caixa planejado (só leitura, na versão
   vigente) e o fluxo de caixa realizado. No celular, um mês em lista. Sem open banking, lançamento do total do mês
   por grupo ou colagem de extrato com classificação simples.
3b. **Teto da semana:** o ambiente próprio (as semanas do mês como barras, combinado × gasto em qualquer
   meio de pagamento, o que resta do teto), desde o Cadastrado, e a mensagem semanal de WhatsApp que pergunta o gasto
   da semana e então sugere o ajuste para as próximas, recalculado para fechar o mês no teto. A verificação
   automática entra na etapa 5.
3c. **Roteiro "onde sobra":** a tela "Revisar a minha gestão financeira" sem open banking, como lista guiada em que
   cada item vira tarefa, em todos os degraus.
4. **Patrimônio:** desde o Cadastrado, atualização dos totais por bloco (a empresa à parte), lembrada por uma tarefa
   trimestral; os pontos reais sobre a curva da Evolução no Completo.
5. **Revisões semestrais:** o registro datado gerado automaticamente antes de cada reunião semestral (e do check-up
   anual da Clínica), que é o rascunho do registro de reunião do consultor.
6. Pendências herdadas: o remanejamento entre objetivos baixa o saldo do objetivo de origem.

**Pronto quando:** seis meses depois da apresentação de um cliente real, a revisão sai sozinha com os aportes
marcados pelo cliente e os totais lançados, e a consultora a usa na reunião semestral.

## Etapa 5 — Open banking

**Objetivo:** trocar a origem dos dados do realizado, de manual para automático, sem mudar a tela.

Pré-requisito fora do código: contrato com o parceiro, consentimento do cliente (LGPD e o fluxo do Open Finance),
definição de quais dados chegam (transações classificadas, posições de investimento, saldos) e com que atraso.

1. **Conexão:** o cliente autoriza a conexão na Jornada/Realizado; estado visível ("conectado em 6/10, atualizado
   ontem"); desconectar a qualquer momento.
2. **Conciliação de aportes:** detectar a transferência para investimento no valor e na janela da tarefa; a tarefa se
   marca sozinha com origem "extrato"; o lembrete vira confirmação; o cliente pode desfazer.
3. **Orçamento por categoria:** as transações classificadas alimentam a lente de orçamento; o mapeamento das
   categorias do parceiro para fixas/ajustáveis/futuro e para as microcategorias do Fluxo de caixa do plano.
4. **Patrimônio:** as posições consolidadas viram os pontos da curva; o passo Carteira do portal passa a receber os
   ativos de lá em vez da planilha colada.
5. **Check-up anual da clínica com dados reais:** 12 meses depois da clínica, o registro compara as orientações
   combinadas com o que o open banking mostra que aconteceu, e abre a etapa na Jornada. Se o acesso pontual de open
   banking for aprovado, é aqui que ele entra: uma leitura única na clínica e outra no check-up.

**Pronto quando:** num cliente conectado, um mês inteiro fecha sem nenhum lançamento manual e a revisão sai igual à
da etapa 4.

## Etapa 6 — Entradas, programa corporativo, conteúdos, oportunidades e self-service

1. **Revisar a minha gestão financeira com open banking:** os achados do parceiro e do consultor somados ao roteiro
   da etapa 4, com a evidência, "Virar tarefa" e "Não se aplica"; a soma traduzida em "% do aporte de um objetivo";
   a revisão registrada com data e a próxima sugerida em três meses; o consultor vê antes no degrau Completo.
2. **Entradas:** os links por tema (cada postagem abre a calculadora do tema com a premissa citada); a escolha para
   quem chega sem origem (a promessa, quem somos e como somos remunerados, o exemplo do "não fiz", as duas portas);
   o exame em linguagem direta; "continuar no computador".
2b. **Programa de bem-estar da empresa:** a entrada própria, com a frase de privacidade; os **tokens** (1 da empresa,
   1 do exame, 1 por evento, 1 por indicação para quem indica e para quem foi indicado; 5 para pedir a clínica), com
   o código de indicação; e o **painel da empresa**, só com dados agregados (uso, resultados do exame, evolução da
   saúde financeira, categorias de objetivos), com um mínimo de pessoas por recorte.
3. **Self-service:** o cadastro ("só você ou vocês dois?", consentimento LGPD e dos lembretes, exclusão da conta)
   que leva os valores da sessão para o vetor sem pedir de novo; as primeiras tarefas propostas; o convite ao
   cônjuge. O cliente self-service tem acesso às ferramentas disponíveis; a assinatura fica para depois. Medir
   quantos visitantes criam login, quantos cadastrados aceitam as primeiras tarefas, quantos têm sobra três meses
   seguidos, quantos colaboradores chegam a 5 tokens e quantos pedem uma clínica.
4. **Conteúdos:** a biblioteca aberta a todo logado, o comitê e as **lives mensais** de planejamento (ao vivo e
   gravados), "recomendado para o seu passo", pelo perfil, e, no Completo, os materiais de atualização e as
   monitorias mensais.
5. Revisão do todo com uma consultora e dois clientes reais; retorno para PENDENCIAS.md.

## O que fica fora do roteiro (decidir à parte)

- Cobrança e níveis comerciais; o que, afinal, distingue a clínica do completo no preço.
- Notificações além do WhatsApp (e-mail, push).
- O redesenho da escalada: os critérios de saída de cada mundo, os refinamentos guardados em UX.md › Para o
  redesenho da escalada e quanto gamificar além dos marcos (a metodologia explorada antes está em
  `area-logada/referencias/`, não aprovada).
- A assinatura do self-service.
- Multi-família (um casal com planos separados), já em aberto em PENDENCIAS.md. O domicílio com dois membros num
  plano só entra na etapa 1.
- Reforma do exame de saúde financeira (prevista, independente desta área).

## Riscos a vigiar

- **O ciclo não pega.** Se o cliente não responde o lembrete, nada do resto importa. Por isso a etapa 2 é a primeira
  com cliente real, e mede resposta em 48 h desde o início.
- **Dupla digitação.** Clínica, coleta, calculadoras e plano pedindo o mesmo número em lugares diferentes. A etapa 1
  existe para que o modelo seja um só.
- **Open banking atrasa.** Se o contrato demorar, as etapas 2 a 4 já entregam o produto; a 5 só automatiza.
- **Tom.** Lembrete que cobra em vez de ajudar vira ruído silenciado. Toda mensagem traz o efeito no plano e uma
  saída que caiba no bolso, nunca só a falta.
- **Volume.** Somando aportes, teto da semana, burocráticas, educacionais e repetições, um cliente do Completo
  receberia de 13 a 18 mensagens por mês sem agrupamento. A faixa decidida é de 10 a 15, com os aportes juntos no
  dia do salário, desde a etapa 2, e a taxa de quem desliga os lembretes é medida desde o início.
- **Carga do consultor.** Numa carteira de 40 clientes, a avaliação estimou de 30 a 45 itens por mês na fila de
  cada consultora. Sem fila única, prazo e resumo diário, as promessas ao cliente (resposta, aprovação) atrasam e o
  ciclo perde a confiança.
- **O ciclo serve a quem já tem sobra.** Se as fontes "começar a sobrar" e "dívidas mapeadas" ficarem para depois,
  o produto não ajuda quem mais precisa, inclusive o público dos programas corporativos.
