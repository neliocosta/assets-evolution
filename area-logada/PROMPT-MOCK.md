# Prompt — mock navegável da área logada do cliente

Copiar daqui para baixo numa sessão nova do Claude Code aberta neste repositório. O prompt é autocontido; os arquivos
que ele manda ler estão todos no repositório. Revisado em 24/10/2026 com as duas rodadas de avaliação; onde este
prompt e o UX.md divergirem, vale o UX.md.

---

Quero um **mock navegável** da nova área logada do cliente da Nord Liberta. É um protótipo para alinhar a experiência
antes do desenvolvimento em produção: nada de backend, nada de integração, dados fixos de exemplo. Não é a versão
final, mas precisa parecer o produto, para o dono do produto e uma consultora reagirem a ele.

## Leia antes de começar, nesta ordem

1. `area-logada/README.md` — a tese, o que já existe, as premissas, os quatro degraus (Visitante, Cadastrado,
   Clínica, Completo). (Atenção: "degrau" é o nível de relação com a Nord; "mundo" é a etapa da escalada. Não
   confundir.)
2. `area-logada/UX.md` — a experiência tela a tela. É a especificação do mock. Siga-a; onde ela não decidir, decida
   você e registre a decisão num comentário no alto do arquivo. As "Decisões de 24/10" do fim já estão refletidas
   no texto; siga-as.
3. `area-logada/avaliacao-2026-10-24.md` e `area-logada/avaliacao-2026-10-24-rodada-2.md` — só os resumos e as
   tabelas de achados, para entender por que o UX.md é como é e quem são as personas.
4. `DESIGN.md` — tokens, tipografia, regras (Horizon, Aurora, tons suaves, sem vermelho no orçamento, Numbers Speak
   Sora), componentes. O mock usa exatamente esses tokens. O cabeçalho da área logada segue o UX.md (Princípios),
   não a Same Door Rule do livro.
5. `ux/plano-exemplo.json` — o plano da família de exemplo (Ana e Marcos). Os números da situação "padrão" saem dele.
6. `ux/personas/clientes-teste.md` — os perfis de onde saem as outras situações.
7. `VARIAVEIS.md` — os nomes dos campos, para que o mock leia o plano pelos nomes reais e não invente outros.
8. `reaproveitar/acompanhamento.js` — o modelo `foto`/`realizado` e os cartões do acompanhamento; reaproveitar a
   conta e a aparência na tela Realizado.
9. `evolucao-patrimonial.html`, só a constante `CAPITULOS` e o cabeçalho com a barra de capítulos vistos, para que a
   tela Plano do degrau Completo repita a mesma estrutura (não copie a tela inteira).

## Entrega

Um arquivo só: `area-logada/mock/index.html`, autocontido, sem bibliotecas além das fontes do Google (Sora, DM Sans,
DM Serif Display), como as outras telas do repositório. Os gráficos são desenhados em SVG no próprio código. Abre
direto no navegador, sem servidor.

## O que o mock tem

### Seletor de contexto, fixo no alto

- **Degrau:** Visitante | Cadastrado | Clínica | Completo. Muda o que cada tela mostra, conforme a tabela de
  degraus do README e as seções do UX.md. O que falta **some**; não aparece bloqueado nem em cinza.
- **Situação:** muda os dados e mostra que o desenho serve a mais de um tipo de cliente. Cada situação vale nos
  degraus em que faz sentido:
  - **Padrão** — Ana e Marcos, do `plano-exemplo.json`, em Construir, com a reserva mínima como passo atual.
  - **Casal** — Camila e Rafael (perfil 1), Cadastrado: domicílio com dois membros, salários no dia 5 e
    adiantamento no dia 20, quatro objetivos que juntos não cabem na sobra, o convite ao cônjuge pendente num dos
    estados.
  - **Sobreviver** — uma pessoa com R$ 4.800 no rotativo e R$ 3.700 de renda, Cadastrado: a dívida como objetivo
    protagonista.
  - **Começar a sobrar** — uma pessoa com R$ 3.700, sem dívida e sem sobra, que divide as contas com a mãe,
    Cadastrado pelo programa da empresa: a primeira reserva como objetivo, R$ 100 por mês (3% da renda), e 3 de 5
    tokens para pedir a clínica (empresa, exame e uma live).
  - **Renda irregular** — Marcos (perfil 2), Clínica: foco em reserva e colchão, sem objetivos combinados, "O que
    combinamos em 12/09" no alto, a reserva por remanejamento e as tarefas por evento (distribuição de dezembro).
  - **Plano em montagem** — Completo antes da apresentação.
- **Tela:** Celular (390 px, barra de navegação inferior) | Desktop (1280 px, menu lateral). O mesmo conteúdo,
  reorganizado. O celular é o primeiro: desenhe nele e abra para o desktop.
- **Mês de referência:** outubro de 2026 (fixo), para que "este mês", atrasadas e próximas façam sentido.

### A entrada (degrau Visitante)

No degrau Visitante não há área logada: o mock mostra a **entrada**, com um seletor de origem: **sem origem** (a
escolha com a promessa, quem somos e como somos remunerados, o exemplo do "não fiz" e as duas portas, sem
cronômetro), **por uma postagem** (o link do tema liberdade abrindo a calculadora com "a conta dos 300" citada e o
exame depois) e **pelo programa da empresa** (o nome do programa e "sua empresa não vê os seus dados; ela vê só
números do grupo, sem nomes" antes de qualquer pergunta, e o campo do código de indicação de um colega). O exame termina em linguagem direta, sem mapa e sem número de mundo, com a calculadora do passo e "ver
outras calculadoras". A calculadora da liberdade mostra as premissas e, quando a resposta é ruim, as três
alavancas. O aviso de que nada é guardado, "continuar no computador" e o cadastro ("só você ou vocês dois?",
consentimento, WhatsApp opcional).

### As duas ideias e o tom

Antes de tudo, as duas ideias que mandam no mock: **o protagonista é o objetivo** (todo número, tarefa e mensagem
nomeia o objetivo a que serve: "para a Itália", "para quitar o cartão", nunca "guarde R$ 1.500"; quem não tem sonho
tem a dívida, a primeira reserva ou o combinado da clínica como objetivo) e **o esqueleto é a escalada** (os sete
mundos Sobreviver → Descobrir → Construir → Focar → Proteger → Otimizar → Desfrutar, em três alturas: mundo, passo,
tarefa; o exame nivela o cliente; o foco do consultor prevalece sobre a régua; a área sempre aponta o próximo passo
mais importante). A escalada está numa **versão básica** e será redesenhada depois: use os sete nomes, um passo
atual e a régua simples do UX.md, e ignore a seção "Para o redesenho da escalada".

**Tom:** a escalada é referência macro e só aparece na Jornada, em desenho sóbrio de trilha; no Painel e na entrada,
o próximo passo vem em linguagem direta, sem nome de mundo, sem mapa. Nada de emoji (nem no WhatsApp), medalha,
mascote, montanha ilustrada, nome de objeto de aventura (corda, capacete) ou frase de jogo em lugar nenhum do mock.
Nada que julgue: nunca "sair do vermelho", nunca "não se qualifica". A estrutura é a dos mundos do Duolingo, a
estética é a do DESIGN.md, para um adulto cuidando do próprio dinheiro.

### Os destinos (UX.md, seção Navegação)

No celular, a barra inferior tem Painel, Objetivos, Tarefas, Plano e Mais (Realizado, Conteúdos, Jornada,
Utilitários); "Falar com alguém" fica no cabeçalho, com o contador, e abre Conversas.

1. **Painel** — o plano numa página (*One Page Financial Plan*), na ordem do UX.md: (a) o objetivo protagonista em
   faixa compacta no alto, que muda com a situação (objetivos com foto, data e traço; a dívida a quitar; a primeira
   reserva; "O que combinamos em 12/09"; "Seu plano está em montagem"), com o aviso "os objetivos juntos pedem…"
   quando não couberem; (b) o próximo passo mais importante, **acima da dobra em 390 × 844**, em linguagem direta e
   ligado a um objetivo, abrindo a **tela do passo**; (c) as próximas tarefas relevantes, três ou quatro, com "Fiz"
   e o cartão que abre as quatro respostas ali mesmo; (d) quatro números (sobra, reserva × alvo, patrimônio ×
   esperado, nota como evolução) e "ver todos", cada um com origem e "atualizar" no toque; em Sobreviver, renda,
   custo de vida, sobra e dívida total; (e) o ritmo no ritmo combinado (doze colunas para quem aporta por mês, os
   ciclos para a renda irregular, os meses com sobra para quem começa); (f) a pílula do próximo encontro.
2. **Objetivos** — a lista e, ao abrir um, a página de cinco blocos (o sonho; o plano para chegar lá; o que precisa
   ser feito, com o responsável; como está indo; mudar, com antes e depois). Mostre pelo menos três tipos: montante na
   data, dívida a quitar e despesa que começa (a escola). A tela **"Os objetivos juntos"**: soma dos aportes × sobra,
   prioridade arrastável e a distribuição do patrimônio existente. No Completo, a liberdade como objetivo
   complementar. Na situação Renda irregular, a reserva com "R$ 0 separado; R$ 240 mil disponíveis em D+1".
3. **Tarefas** — grupos Agora / Em seguida / Mais adiante / Feitas e adiadas; filtro por categoria, por objetivo e,
   no casal, por responsável; placar e sequência no ritmo de quem usa, em tom suave. Na lista, "Fiz" e "⋯"; aberto,
   as quatro respostas. Pelo menos uma tarefa de cada categoria (a Carteira só com consultor), um **aporte do mês**
   com a divisão por objetivo, uma tarefa por **evento de renda**, uma em **parcelas** do casal, uma burocrática com
   **roteiro** (renegociar o rotativo) e um **teto da semana** em barras. Ao tocar **Não fiz**, o efeito pela
   categoria e as saídas (manter a data, adiar, ajustar ao que coube, usei em outro objetivo), com números
   calculados; mostre o caso de duas faltas seguidas sugerindo reduzir, o caso do objetivo longo (dinheiro a menos na
   data) e o caso da dívida (juros a mais). No Completo, a escolha vira "ajuste provisório, aguardando a Patrícia",
   e a aprovação chega com uma mensagem dela à família; no Cadastrado, antes e depois e confirmação. **Fiz parte**
   pede o valor;
   **Adiar** pede a nova data e um motivo (opcional, em opções, no Cadastrado). A página da tarefa (editar, comentar,
   histórico com quem respondeu). O lembrete como atributo, editável. Interação real: marcar muda o placar, o Painel
   e o objetivo.
4. **Plano** — Em todos os degraus logados, o **Status** com a **lista canônica de verticais do UX.md, na ordem e com
   os nomes de lá** (Dívidas; Orçamento e sobra; Saúde financeira e fase da vida; Objetivos e liberdade; Reserva;
   Política de aportes; Seguros e liquidez; Carteira e IR; Patrimônio e estrutura; Sucessão e retirada), com os
   valores principais, o estado em tons suaves (sem vermelho), a validade, o caminho para a calculadora (e a volta
   com "o plano se ajustou"), o histórico de respostas (ao tocar, a lista datada) e "Transformar em tarefa" onde
   couber. Verticais sem dado **não aparecem**. **No celular**, lista vertical agrupada por estado; **no desktop**,
   duas formas de conjunto lado a lado, com um alternador: mapa de bolhas (tamanho pelo peso da vertical no plano,
   cor pelo estado) e radar dos cinco pilares com as verticais ao redor. Sem montanha. No Completo, além do Status, o
   sumário dos dez capítulos com a barra de vistos e uma página de exemplo aberta, com "Simular e propor" como ação
   terciária. Na Clínica, as verticais de foco sobem para o alto com o rótulo "combinado na clínica de dd/mm". Mais
   a tela **Utilitários**, com "Quanto a taxa me custa até a liberdade".
5. **Realizado** — seletor 3 | 6 | 12 meses | o ano | desde o plano, junto do gráfico, mostrando só os horizontes com
   dado. Lentes, cada uma só quando tem dado: Dinheiro dedicado (planejado × feito no ritmo combinado, estados
   cumprido / cumprido na nova meta / coberto / faltou, o objetivo nomeado, quem marcou), **Sobra**, **Dívidas**,
   **Colchão** (na situação Renda irregular), Orçamento (três visões com alternador: a mesa de comparação, com as
   maiores diferenças por categoria só quando o dado é categorizado; o fluxo de caixa planejado e o realizado, no
   layout da tabela do passo `fluxo` de `tela-consultor.html`; no celular, um mês em lista; sem vermelho), **Teto da
   semana** em ambiente próprio, Patrimônio (com a empresa à parte). O plano tem **duas versões** no exemplo (abril
   e novembro de 2026): o traço vertical tracejado "plano ajustado em 8/11", com alvo de toque de 44 px, muda o
   patamar do planejado dali em diante e, ao tocar, mostra o que mudou. Um exemplo de revisão semestral. O botão
   **"Revisar a minha gestão financeira"** com três achados de exemplo e, sem open banking, o roteiro "onde sobra".
6. **Conteúdos** — a biblioteca aberta, o comitê e as **lives mensais** de planejamento (a próxima ao vivo e as
   gravadas), "recomendado para o seu passo" e, no Completo, os **materiais de atualização e as monitorias
   mensais**.
7. **Jornada** — três blocos, nesta ordem, em seções recolhidas no celular: o **histórico das reuniões** (data,
   participantes, resumo, tarefas em aberto com o estado de hoje, a versão criada; no exemplo, a clínica, a
   apresentação e uma reunião semestral, para mostrar que o histórico não se perde ao subir de degrau); a
   **relação com a Nord**, por degrau, com os nomes do UX.md (Completo: … Execução → Reunião semestral → Reunião
   semestral → Renovação; Clínica: Exame → Clínica → Conversa de aprofundamento, quando a consultora a marcou →
   Check-up anual; Cadastrado: Cadastro → o próximo marco); e a **escalada** como referência macro (os sete mundos como
   trilha sóbria, os que não se aplicam indicados, o atual com a trilha de passos, o que está resolvido e o que
   falta, os marcos, o ano com os três números: caminho até a liberdade, o ano, ritmo; "foco escolhido pela Patrícia
   em 12/09").
8. **Conversas** — aberta por "Falar com alguém", com quem falar por degrau e o histórico (dúvidas, propostas,
   ajustes provisórios, comentários) com contador. Antes de abrir qualquer conversa, quem atende e o que verá. No
   Completo, "Falar com Patrícia" com o WhatsApp livre, tirar uma dúvida e propor mudança (resposta em 2 dias úteis),
   e a data da reunião semestral. Na Clínica, "Falar com Patrícia" com o check-up (desabilitado com a data em que
   abre, e habilitado) e, quando marcada, a conversa de aprofundamento com a data. No Cadastrado e no Visitante:
   "Agendar uma clínica" primeiro; a **qualificação do domicílio** com os dois desfechos (o WhatsApp de um planejador
   com a mensagem já começada, no singular ou no plural; e, para quem não alcança, o grupo das lives mensais com a
   data da próxima, mais a orientação do próximo passo, sem nunca dizer que a pessoa "não se qualifica"). Na
   situação Começar a sobrar (programa da empresa), os **tokens**: "3 de 5", como ganhar os que faltam, o código de
   indicação para copiar e, num segundo estado com 5 tokens, "Pedir a minha clínica".
9. **A tela do passo** — aberta pelo cartão do Painel: o que o passo pede, o critério com o andamento, por que
   importa, as tarefas do passo e "ver onde isso está na escalada".

### O lado do consultor (mínimo, para a consultora reagir)

Um seletor "Cliente | Consultor" no alto. Do lado do consultor, só três telas:

- **Registrar a clínica** da situação Renda irregular, de cima para baixo como no UX.md, terminando na **prévia** das
  tarefas, dos lembretes e da primeira mensagem antes de publicar.
- **A fila "Espera por mim"** com uma carteira de exemplo (uns dez itens de tipos diferentes, com prazo e "tratei").
- **Ver como o cliente**: a área do cliente em só leitura, com uma faixa no alto dizendo de quem é.

### A mensagem de WhatsApp

Um painel "Ver como chega no WhatsApp", acessível da tarefa e do seletor do alto, que mostra a conversa simulada,
com as regras de convivência do UX.md (prévia neutra na primeira linha, sem emoji, "parar lembretes", entre 10 e 15
por mês, com os aportes juntos num lembrete só no dia do salário):

- o lembrete do dia nomeando o objetivo, com as respostas em texto **Fiz · Fiz parte · Não fiz · Adiar** (Fiz e Não
  fiz gravam direto, como o `/taskChecker` da plataforma já faz sem login; Fiz parte e Adiar abrem a tarefa), e a
  versão curta;
- os aportes do mesmo dia agrupados numa mensagem só;
- a página curta que o toque em "Não fiz" abre, com o efeito e as saídas, e o pedido de confirmação ao escolher uma;
- a mensagem semanal do teto da semana, que pergunta o gasto da semana e então sugere o ajuste ("combinado
  R$ 1.200, gasto R$ 1.460; para fechar o mês nos R$ 6.000, até R$ 1.000 nesta semana e na próxima");
- a confirmação automática quando há open banking;
- o fechamento do mês pelo objetivo ("a Itália ficou R$ 1.500 mais perto") e, na situação Começar a sobrar, pela
  sobra ("sobraram R$ 120; é o seu segundo mês seguido com sobra");
- no casal, "Rafael marcou: fiz" chegando para a Camila.

Texto no plural para o casal, no singular para quem lê.

### Os estados

Em algum lugar acessível (um menu "Estados" no seletor do alto), mostre os estados da seção "Estados e transições"
do UX.md: tarefa já respondida, link de ocorrência vencida, valor recalculado depois do envio, sem conexão, erro de
gravação, "calculando o efeito", plano em revisão e a mensagem de transição do fim do contrato.

### Dados

- A situação Padrão é Ana e Marcos, do `ux/plano-exemplo.json`. Leia o JSON embutido no HTML (cole-o num `<script
  type="application/json">`) e calcule os números a partir dele; não digite números à mão nas telas.
- As outras situações saem de `ux/personas/clientes-teste.md` (perfis 1 e 2) e dos números citados acima, num
  objeto de dados por situação no alto do script.
- Para o Realizado, invente três meses de histórico (agosto, setembro, outubro de 2026) com um aporte faltando em
  setembro, um coberto por outro objetivo e um ajustado ao que coube, para que todos os estados apareçam.
- Para a Clínica da situação Padrão, use só: reserva ideal, um objetivo e o aporte para a liberdade do mesmo plano.
- Para o Cadastrado, use a nota do exame e quatro verticais preenchidas por ele (saúde, reserva, orçamento e sobra,
  um objetivo); as outras não aparecem.
- Os limites da qualificação (renda, poupança mensal, patrimônio), a faixa de mensagens por mês e os tokens (quantos
  para a clínica, quanto vale cada ação) ficam numa constante só, no
  alto do script, porque são parâmetros do produto.

## Regras

- Português do Brasil em tudo; casal no plural, pessoa e quem lê no singular.
- Tons suaves; cor cheia só em traço, ponto e na única pílula de ação por tela; laranja só para futuro e ação.
- Cada número com origem rastreável num toque e com o lugar onde se corrige.
- Nada vazio: se um degrau ou situação não tem aquilo, a seção não existe.
- Sem gamificação ruidosa: o placar e a sequência em tom neutro.
- Toda tela do dia a dia cabe em 390 px sem rolagem horizontal da página.
- Respeitar `prefers-reduced-motion`.
- Não toque em nenhum outro arquivo do repositório. Não faça commit.

## Como vou avaliar

Abro o arquivo, troco os quatro degraus, as situações e as duas telas, passo pela entrada (as três origens), pelas
telas em cada combinação, pela conversa de WhatsApp, pelos estados e pelas três telas do consultor. Verifico: (1) o
Painel se entende em dez segundos e o próximo passo está acima da dobra no celular; (2) marcar uma tarefa é um toque
e muda o placar; (3) "Não fiz" responde com o efeito pela categoria e saídas que cabem no bolso; (4) o que não existe
no degrau ou na situação some; (5) o casal, a renda irregular, a dívida e a falta de sobra têm um objetivo
protagonista e tarefas que fazem sentido; (6) a consultora entende onde clicar no registro da clínica e na fila;
(7) a aparência é a do DESIGN.md. Ao terminar, liste num comentário no alto do HTML as decisões que você tomou onde
o UX.md não decidia, e as dúvidas que surgiram, para irem para `PENDENCIAS.md`.
