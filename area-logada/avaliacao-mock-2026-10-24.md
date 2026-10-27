# Avaliação do mock navegável · 24/10/2026

Cinco agentes navegaram em `area-logada/mock/index.html`:

| Agente | Papel | Onde navegou |
|---|---|---|
| Juliana | Mar Aberto (degrau gratuito) | do Visitante, vinda por uma postagem, ao Cadastrado |
| Rafael | Clínica | entrou pelo programa da Transportes Aurora |
| Ana | Consultoria completa | situação Padrão, Ana e Marcos |
| Patrícia Lemos | Consultora | lado do consultor |
| Especialista de UX | Avaliação geral | todos os degraus, celular e desktop |

Quatro agentes usaram o navegador. A Ana não achou aba livre e rodou o script do mock em Node; por isso conferiu textos e números, não o layout.

No total foram 119 achados. Primeiro vem a síntese, depois a tabela de cada agente, com os números próprios dela.

## O que mais de um agente encontrou

| # | Tema | Quem viu | Gravidade | O que corrigir |
|---|---|---|---|---|
| T1 | **A conta do teto da semana não fecha.** No "Não fiz" do teto, o valor por semana sai maior que o total que resta (R$ 1.930 por semana com R$ 1.660 restantes; R$ 680 com R$ 590). O quadro Antes/Depois troca teto por aporte ("R$ 1.200 no próximo aporte"), e o gráfico das semanas não muda. A sugestão também usa a semana 2 quando já estamos na semana 4. | UX 1, 2 · Rafael 2, 3 · Ana 8, 9 | Alta | Refazer `sugestaoTeto`: o que resta dividido pelas semanas restantes, sempre menor que o teto atual. O Antes/Depois fala do teto por semana, e o gráfico se atualiza. |
| T2 | **As respostas do teto não servem a um limite.** "Fiz / Fiz parte / Não fiz" não combina com um teto. Ninguém informa quanto gastou, "gasto ajustável" não é explicado e o "Fiz parte" sem valor grava R$ 600 sozinho. | UX 11 · Rafael 6 · Ana 9 | Alta | Respostas próprias: "Fiquei dentro", "Passei", "Informar o valor". Uma linha explicando "ajustável" com exemplos. Exigir o valor quando o cliente informa. |
| T3 | **Falta "Desfazer".** Não existe no "Fiz" e no "Não fiz" do cliente nem no "Tratei" da consultora, e o toast some em 4 segundos. | UX 4 · Juliana 16 · Rafael 13 · Patrícia 2, 3 | Alta | "Desfazer" no toast (6 a 8 s, com pausa ao focar) e no cartão tratado. |
| T4 | **O mesmo fato aparece com números diferentes em cada tela.** | Ana 1, 2, 6, 11, 12, 14 · UX 6 · Rafael 4 · Patrícia 4 | Alta | Uma variável só (regra do projeto): cada tela lê o mesmo registro. |
| T5 | **Falta a situação de quem está em cada degrau.** O Cadastrado vindo da postagem cai no Bruno, que veio pela empresa. A Clínica de quem está no zero a zero cai na Ana e no Marcos, com R$ 1,7 milhão. O Padrão não é a persona de R$ 450 mil. Depois do cadastro, a liberdade calculada some e o Painel é de outra pessoa. | Juliana 2, 3 · Rafael 1, 9 · Ana (nota final) | Alta | Novas situações: "Cadastrada pela postagem" (com a Liberdade da calculadora como primeiro objetivo) e "Clínica pela empresa" (R$ 4.200, zero a zero). Painel vazio logo depois do cadastro. |
| T6 | **O cadastro perde o que foi digitado e cria a conta sem contato.** O campo esvazia ao redesenhar a tela. O registro da clínica tem o mesmo problema. | Juliana 1 · Rafael 8 · Patrícia 5 | Alta | Guardar o estado dos campos ao redesenhar. Exigir e-mail ou celular. Reaproveitar o celular para o WhatsApp. |
| T7 | **Quem sobe de degrau perde a história.** O passo, o alvo da reserva, o Ritmo e tarefas abertas mudam ou somem de um degrau para o outro. | UX 7 | Alta | Carregar o histórico e as tarefas abertas. Se o alvo mudou, explicar ("o alvo mudou na clínica de 12/09"). |
| T8 | **A consultora não consegue decidir pela fila.** "Ver antes e depois" não mostra nada e "Aprovar" fica do lado. "Tratei" é o botão principal e não registra o que foi decidido. Aporte atrasado e falta de sobra não chegam à fila. | Patrícia 1, 2, 10, 13 · UX 8, 9 | Alta | Antes e depois embutido no cartão. Desfechos no lugar do "Tratei" (Aprovei, Ajustei, Recusei, Respondi). Alertas de risco do cliente na fila. |
| T9 | **O registro da clínica publica número errado.** A prévia diz "Resgatar R$ 240 mil" com alvo de R$ 195 mil e não recalcula. O que foi publicado não aparece para o cliente. Não dá para escolher o cliente. | Patrícia 4–8 · UX 27 | Alta | A prévia sai do alvo. Publicar pede confirmação e o cliente passa a ler o publicado. A tela começa pela escolha do cliente. |
| T10 | **Preço e caminho para subir de degrau não aparecem.** Não há preço da clínica nem do Completo, e o token não é explicado para quem veio pelas redes. "Escrever para a Patrícia" não abre. Para quem começa, um ano até o check-up é muito tempo. | Juliana 9, 13 · Rafael 7, 14, 15 | Média | Cartão de upgrade com o que muda, o preço e se a empresa ajuda. Uma frase sobre o token. Dizer quando dá para falar de novo antes do check-up. |
| T11 | **Falta "Conta" no menu Mais**, embora o cadastro prometa "Conta › Apagar". | Juliana 14 · Rafael 17 | Média | Pôr "Conta" no Mais. |
| T12 | **O WhatsApp está desalinhado com a área.** O valor do aporte é outro (R$ 360 contra R$ 100). A versão curta lembra de março. O fechamento diz "0 de 6" e "mais perto". São quatro botões, e o WhatsApp aceita três. A página sem login mostra números. | Rafael 4, 10, 11 · Ana 3, 10, 17 | Média | O WhatsApp lê a tarefa do dia. Três botões. Página sem login sem valores. A página do "Não fiz" fica presa à tarefa do link. |
| T13 | **Vocabulário instável e termos internos expostos.** Para a mesma nota aparecem Saúde financeira, Nota e Placar; o menu diz Plano e a tela diz Status. Termos internos chegam ao cliente: "No Completo…", "bloco 11", "D+0", "motor", "atributo da tarefa", "self-service". "RECOMENDADO" aparece duplicado. Fala-se em "filho" no lugar de "Luiza", e "Toque" aparece no desktop. | UX 10, 12, 23 · Rafael 18, 19 · Ana 5, 18 · Juliana 17 | Média | Um glossário fixo no UX.md e uma passada de texto. |
| T14 | **Desktop e acessibilidade.** A coluna da direita do Painel tem 180 px e o toast fica espremido. Os alvos de toque têm menos de 44 px. Os gráficos não têm aria-label e as bolhas não respondem ao teclado. O estado das verticais aparece só por cor. | UX 3, 5, 15, 17 · Juliana 21 | Média | Coluna com mínimo de 300 px. Toast em toda a largura. Alvos de 44 px. `role="img"` e rótulos nos gráficos. Estado escrito ao lado da cor. |
| T15 | **Calculadoras e telas que só dão aviso.** Reserva, criar objetivo, capítulos do livro, Responder e Abrir rascunho não funcionam. As calculadoras não usam os dados da pessoa. A da liberdade sumiu da área logada. | Juliana 5, 6, 11, 12 · Ana 20, 21 · Patrícia 10, 11 | Média | Prioridade no mock: a calculadora da reserva, criar o objetivo Liberdade, Responder e o rascunho da semestral. Pré-preencher com os dados do plano. |

**O que todos aprovaram:**
- O fluxo do "Não fiz", com o efeito dito em linguagem de objetivo e as saídas sempre na mesma ordem.
- O tom que não dá bronca ("Adiar não conta como falta").
- A entrada pela postagem com os números da pessoa.
- O cadastro curto, que diz "por que pedimos".
- A frase "Sua empresa não vê os seus dados".
- A prévia do WhatsApp na clínica.
- A consultora ver como o cliente, em só leitura.

**A forma do Status no desktop** (a decisão 12c), na opinião do especialista de UX:
- O radar fica como forma principal. Ele tem escala real e conversa com a nota de saúde financeira.
- As bolhas misturam números de naturezas diferentes e têm um "peso" que o cliente não sabe ler. Ficariam só como navegação, ou no lado do consultor.
- Ele tiraria o "As duas lado a lado".

---

## Juliana · Mar Aberto

Veio pela postagem, com 31 anos, renda de R$ 7 mil e nenhuma dívida. Navegou no navegador, no celular e no desktop.

| # | Tela / fluxo | Tipo | O que aconteceu ou o que sentiu | Gravidade | O que corrigir |
|---|---|---|---|---|---|
| 1 | Criar a minha conta | Bug | "Digitei meu e-mail, cliquei em 'Só meu' e o campo esvaziou. Cliquei em 'Criar a minha conta' e a conta foi criada mesmo assim, sem e-mail nenhum." | Alta | Guardar o valor dos campos ao redesenhar; não criar a conta sem e-mail ou celular válido. |
| 2 | Conta criada → Painel | Bug | "A tela dizia 'A liberdade que você calculou vira o seu primeiro objetivo'. Entrei e o Painel é de outra pessoa: 'viagens com a Luiza', R$ 1,7 milhão. Minha liberdade sumiu." | Alta | Abrir com os dados da calculadora e a Liberdade como objetivo a confirmar. |
| 3 | Degrau Cadastrado | Falta | "Não vim por empresa nenhuma, mas a área me chama de Bruno, fala da 'Transportes Aurora' e me dá o código BRUNO-7K2Q." | Alta | Situação de cadastrada vinda da postagem, sem empresa e sem tokens do empregador. |
| 4 | Calculadora › alavancas | Confuso | "'Aportar mais: R$ 4.418 por mês'. É a mais ou no total? Eu ganho R$ 7 mil. E 'Gastar menos depois: R$ 634 por mês'? Ninguém vive com isso. Me senti burra e fechei." | Alta | "Guardar R$ 4.418 no total (hoje R$ 400)". Quando a alavanca é irreal, dizer isso e sugerir uma combinação das três. |
| 5 | Abrir a calculadora da reserva | Bug | "O exame mandou abrir a calculadora da reserva e não abriu nada. Só um aviso: 'no mock, só a da liberdade está montada'." | Alta | Montar a calculadora da reserva. |
| 6 | Objetivos › Criar um objetivo | Falta | "Quis criar meu objetivo e só apareceu 'No mock, os objetivos são fixos'." | Alta | Montar ao menos o tipo Liberdade, preenchido pela calculadora. |
| 7 | Falar com alguém (Visitante) | Confuso | "O título promete WhatsApp e me mandaram para um 'grupo das lives' em 18/11, e ainda 'fazer o exame', que eu já fiz." | Média | Dizer desde o começo que, sem conta, a conversa é pelas lives; não repetir o exame. |
| 8 | Falar com alguém | Bug | "Pediu Renda, Poupa e Patrimônio, e eu já tinha dito R$ 400 e R$ 12 mil na calculadora." | Média | Preencher com o que a sessão já sabe. |
| 9 | Agendar uma clínica | Falta | "Quanto custa a clínica? 'Ver o detalhe' da remuneração mostra 'texto a confirmar'." | Média | Preço ou faixa de preço, e o que a pessoa leva da clínica, junto do botão. |
| 10 | Exame (resultado) | Falta | "Vim pela liberdade e o resultado só fala de dívidas, orçamento e reserva." | Média | Pôr a liberdade no quadro ("longe, e o caminho começa pela reserva"). |
| 11 | Mais › Utilitários | Falta | "Logada, não acho mais a calculadora da liberdade." | Média | Liberdade nos utilitários, com os meus números. |
| 12 | Quanto a taxa me custa | Confuso | "Vem com R$ 100.000 e 5%. Não são meus números, e a outra calculadora usava 4%." | Média | Partir dos dados da pessoa; mesma premissa de rentabilidade em todas as calculadoras. |
| 13 | Tokens para a clínica | Confuso | "O que é token? É de graça com 5? Quem não tem empresa também ganha?" | Média | Uma frase explicando o token e se vale para quem veio pelas redes. |
| 14 | Mais | Falta | "O cadastro diz que posso apagar em 'Conta › Apagar', mas não existe Conta." | Média | Pôr "Conta" no Mais. |
| 15 | Conteúdos › A biblioteca | Bug | "Cliquei em 'Liberdade' na biblioteca e nada aconteceu." | Média | Abrir a lista de cada tema. |
| 16 | Tarefas › Fiz | Falta | "Marquei 'Fiz' sem querer e não dá para desfazer." | Baixa | "Desfazer" no aviso. |
| 17 | Conteúdos | Texto | "'RECOMENDADO PARA O SEU PASSO' aparece repetido. A 'Live de novembro' aparece como vídeo de 8 a 12 minutos, e ela nem aconteceu." | Baixa | Tirar a duplicação; "ao vivo em 18/11". |
| 18 | Calculadora | Confuso | "No alto diz R$ 1,8 milhão; troquei para 'consumir até os 95', embaixo virou R$ 1,5 milhão, e o alto continuou 1,8." | Baixa | Dizer que 1,8 é a regra dos 300 e que a conta de baixo usa as minhas premissas. |
| 19 | Celular, título | Texto | "O título corta em 'Liberdade financ...'." | Baixa | Título mais curto. |
| 20 | Calculadora (desktop) | Sugestão | "No computador é só um número grande. Eu queria ver a curva até os 50." | Baixa | Gráfico simples: o que chego a ter contra o que preciso. |
| 21 | Cadastro, consentimento | Bug | Para o leitor de tela, as caixas se chamam "on"; os cartões das calculadoras não são botões. | Baixa | Ligar o rótulo à caixa; usar botões. |
| 22 | Entrada pela postagem | Gostei | "Adorei começar com 'Você veio da postagem A conta dos 300' e ver a conta com os meus números, sem cadastro." | Baixa | Manter. |
| 23 | Cadastro | Gostei | "Pede pouco, explica 'O que pedimos e por quê', limite de 10 a 15 lembretes 'sem ofertas'." | Baixa | Manter. |
| 24 | Objetivo › Minha reserva | Gostei | "Clara: o sonho, o plano, o que fazer, como está indo, mudar. 'Onde guardar' sem empurrar marca." | Baixa | Manter e fazer igual para a Liberdade. |

**Valeria pagar?** Ainda não.
- A calculadora fisgou a Juliana, mas logo depois diz que o caminho dela é impossível e não oferece um meio-termo.
- Depois de logada, ela perdeu os números dela e não achou o preço da clínica.

**Dúvidas que ela levaria à Nord:**
1. Quanto custa a clínica, e o que ela leva dela?
2. Com R$ 7 mil de renda, que combinação de aporte e idade é realista?
3. Quem vem pelas redes também ganha tokens?

## Rafael · Clínica

Chegou pela Transportes Aurora, com renda de R$ 4.200, no zero a zero e sem dívida. Navegou no navegador, mais no celular.

O mock não tem uma Clínica para alguém como ele. Por isso navegou no Cadastrado em "Começar a sobrar" (o Bruno) e na Clínica em "Padrão" e "Renda irregular".

| # | Tela / fluxo | Tipo | O que aconteceu ou o que sentiu | Gravidade | O que corrigir |
|---|---|---|---|---|---|
| 1 | Degrau Clínica | Falta | "Usei meu token na Clínica e o Painel me mostra 'Patrimônio R$ 1,7 milhão' e 'Resgatar R$ 42.133 do BTG'. Isso não sou eu." | Alta | Cenário Clínica de quem vem pela empresa, com "O que combinamos" e tarefas pequenas. |
| 2 | "Não fiz" no teto | Bug | "Restam R$ 590 até o fim de outubro, e ainda assim diz 'até R$ 680 por semana daqui em diante'." | Alta | O que resta dividido pelas semanas restantes, menor que R$ 360. |
| 3 | Manter o teto › Antes/Depois | Bug | "Antes: R$ 360 no próximo aporte. Meu aporte é R$ 100; R$ 360 é o teto. Depois de confirmar, a semana 5 continua '— / 310'." | Alta | Mostrar o teto antes e depois e atualizar o gráfico das semanas. |
| 4 | WhatsApp › Os aportes juntos | Bug | "No WhatsApp: R$ 360 para Minha reserva. Na área: R$ 100 no dia 5. Quanto eu mando?" | Alta | Usar o valor da tarefa de dedicar dinheiro. |
| 5 | Adiar (tarefa até 31/10) | Bug | "A nova data já vem 27/10, antes do prazo. Adiei e ficou mais apertada." | Alta | Sugerir data depois do prazo atual; bloquear data anterior. |
| 6 | Teto da semana | Confuso | "O que é gasto ajustável? Mostra 'sem. 4 140 / 360', mas eu nunca disse quanto gastei. Na segunda chega 'Já fez?'." | Alta | Explicar "ajustável" com exemplos, mostrar "sobram R$ 220", um jeito simples de informar o gasto, "Quanto foi?". |
| 7 | Tokens, 5 de 5 | Bug | "'5 de 5', mas 'Já ganhos' lista 3. Pedi a clínica e o histórico continua 'Nada esperando resposta'." | Alta | Listar os 5; registrar o pedido com o próximo passo. |
| 8 | Criar a conta | Bug | "Sem e-mail nem celular, a conta foi criada. E o celular é pedido duas vezes." | Média | Exigir o contato; reaproveitar o celular para o WhatsApp. |
| 9 | Logo depois do cadastro | Confuso | "Acabei de entrar e o Painel diz 'R$ 220 guardados' e 'dois meses seguidos com sobra'. O aviso de exemplo fica espremido sobre as tarefas." | Média | Primeiro Painel vazio ("vamos começar pelo exame"). |
| 10 | Página do "Não fiz" sem login | Confuso | "Mostra meu teto de R$ 1.600. Quem pegar meu celular vê minhas contas." | Média | Só a escolha, sem números, até entrar. |
| 11 | WhatsApp, botões | Bug | "Fiz · Fiz parte · Não fiz · Adiar: quatro botões, e o WhatsApp aceita três." | Média | Três botões ou uma lista. |
| 12 | Fiz parte › O que fazer em vez disso | Bug | "As opções começam em '2. Adiar'. 'Voltar' perde a escolha. O Painel diz junho de 2027, e a tela tinha dito julho." | Média | Numeração, salvar a escolha, alinhar a data. |
| 13 | Tarefas | Confuso | "'Outubro 1 de 5' do quê? A adiada foi para 'Feitas e adiadas'. Não há 'Desfazer'." | Média | "1 de 5 tarefas feitas"; a adiada em "Em seguida"; "Desfazer". |
| 14 | Conversas (Clínica) | Bug | "'Escrever para a Patrícia' não faz nada. O check-up só abre em 12/09/2027." | Média | Abrir o campo de mensagem; dizer quando posso falar antes do check-up. |
| 15 | Subir para o Completo | Falta | "Não tem preço, não diz se a empresa paga, não tem botão." | Média | Cartão com o que muda, o preço, se o programa ajuda e "Quero saber mais". |
| 16 | Estado "Fim do contrato" na Clínica | Confuso | "Fala do planejamento completo, que eu nunca tive, e de 'self-service'. E se eu sair da empresa?" | Média | Mensagem própria da Clínica e do fim do programa da empresa. |
| 17 | Mais (celular) | Falta | "Não existe Conta › Apagar, como prometeu o cadastro." | Média | Pôr "Conta" no Mais. |
| 18 | Textos técnicos | Texto | "O motor está refazendo as contas", "O lembrete é um atributo da tarefa", "liquidez", "D+1". | Baixa | Linguagem do dia a dia. |
| 19 | Conteúdos | Texto | "'RECOMENDADO' duas vezes, seguro para quem tem filhos, comitê da carteira. 'Me lembrar' não muda. A live não diz que vale um token." | Baixa | Recomendações do passo; "Lembrete marcado"; selo "vale 1 token". |
| 20 | Cadastro e tokens | Confuso | "O exemplo do campo é 'BRUNO-7K2Q', e depois esse é o meu código." | Baixa | Exemplo neutro ("ABCD-1234"). |
| 21 | Escalada (Jornada) | Confuso | "'Quando o mercado cai…' não diz nada para quem tem R$ 280." | Baixa | Mostrar só o degrau atual e o próximo. |
| 22 | Tarefa individual | Texto | "'COMPORTAMENTAL · BRUNO' mesmo com o plano só meu." | Baixa | Nome só no plano de casal. |
| 23 | Entrada pela empresa | Gostei | "'Sua empresa não vê os seus dados' e 'Como ganhar os tokens' me deram confiança." O título sai cortado no celular. | Baixa | Manter; encurtar o título. |
| 24 | Fiz parte e o Painel | Gostei | "Aceitou R$ 60 e o Painel foi para R$ 280. 'Adiar não conta como falta.' Não levo bronca." | Baixa | Manter. |

**Continuaria depois de um mês?** Pelo WhatsApp, sim, porque as mensagens são leves. A área ele abandonaria se o teto e o aporte continuarem com números que não batem e se não tiver como informar o gasto.

**Dúvidas que ele levaria à consultora:**
1. O que é gasto ajustável, e como digo quanto gastei?
2. O aporte é R$ 100 ou R$ 360?
3. Quando falo com alguém de novo, e quanto custa o Completo?

## Ana · Consultoria completa

Situação Padrão, com Ana e Marcos. Navegou rodando o script em Node, nos textos e números do celular e do desktop.

Os dados do Padrão (renda de R$ 15 mil, custo de R$ 12,5 mil, patrimônio de R$ 1,7 milhão) são os do plano de exemplo. Não são os da persona de R$ 450 mil.

| # | Tela / fluxo | Tipo | O que aconteceu ou o que sentiu | Gravidade | O que corrigir |
|---|---|---|---|---|---|
| 1 | Os objetivos juntos | Bug | "A tarefa manda R$ 1.500 para a Casa e R$ 300 para a Europa, mas aqui a Casa 'recebe R$ 2.079' e a Europa 'R$ 0 · a data anda para dez/2046'. Qual é o meu plano?" | Alta | Mostrar a divisão vigente; a ordem por prioridade só como simulação rotulada. |
| 2 | Status › Dívidas × Fluxo | Bug | "Financiamento do apartamento de R$ 368 mil, parcela R$ 4.870, mas o fluxo tem aluguel de R$ 3.000 e o objetivo é sair do aluguel. Pago os dois?" | Alta | Acertar o plano de exemplo. |
| 3 | WhatsApp › página do Não fiz | Bug | "Escolhi 'Ajustar ao que coube' e o topo passou a dizer 'Aporte de novembro'. Eu não marquei novembro!" | Alta | Prender a página ao id da tarefa do link. |
| 4 | Objetivo Liberdade | Confuso | "R$ 5,2 milhões de número, aporte necessário R$ 7.201, aporte de hoje R$ 0, R$ 1,9 milhão aos 57, e nenhum alerta. No Painel ela nem aparece." | Alta | Estado de atenção, frase da Patrícia sobre a lacuna, a Liberdade no Painel. |
| 5 | Objetivos (textos) | Texto | "'Intercâmbio do filho', 'Faculdade do filho'... a gente tem uma filha, a Luiza." | Média | Usar os dependentes reais. |
| 6 | Casa própria | Confuso | "Em todo lugar jul/2030; no detalhe, 'a data em que chega mai/2032'; o Não fiz diz agosto de 2030." | Média | Uma data do plano, com "no ritmo de hoje" ao lado. |
| 7 | Aporte › Não fiz › 4 saídas | Confuso | "O aporte cobre 5 objetivos, mas 'Adiar' fala só de Fortaleza. Posso 'usar em outro objetivo' que já está no aporte. '+R$ 72' sobe uma vez ou por 94 meses?" | Média | Efeito por objetivo em cada saída; tirar os que já estão na divisão; "+R$ 72 por mês até…"; mostrar o rateio. |
| 8 | Teto da semana | Confuso | "Estamos na semana 4 e a mensagem ainda fala da semana 2. A tarefa diz R$ 1.200, a sugestão R$ 1.110." | Média | Sugestão da semana atual, aplicada ao combinado e ao título. |
| 9 | Teto › Fiz parte | Bug | "Gravar sem digitar registrou R$ 600, e o gráfico não mudou." | Média | Exigir o valor; atualizar a barra. |
| 10 | WhatsApp › fechamento | Bug | "'0 de 6' e 'Fortaleza ficou R$ 450 mais perto'? E por que Fortaleza?" | Média | Só falar de avanço quando houve aporte; usar o objetivo do passo. |
| 11 | Números do plano × Status | Confuso | "Custo de vida R$ 12.500 e R$ 12.767: mesmo nome, número diferente." | Média | Rótulos distintos ou um número só. |
| 12 | Painel × Realizado | Confuso | "'Esperado para a fase: R$ 1,5 milhão' e 'o plano previa R$ 1,7 milhão'." | Média | Separar ou ficar com uma referência. |
| 13 | Realizado › Revisão | Texto | "'Versão vigente: plano de 19/03' depois da reunião que criou o plano de 19/09." | Média | "Versão criada: plano ajustado em 19/09". |
| 14 | Os objetivos juntos › patrimônio | Confuso | "'Cada real com um destino', e a soma dá R$ 171 mil de R$ 1,7 milhão." | Média | Incluir a liberdade e os bens, ou dizer o que fica de fora. |
| 15 | Revisar a gestão financeira | Confuso | "Lazer comparado com R$ 1.150, mas o teto já corta R$ 450; 'últimos 6 meses' com dados desde agosto." | Baixa | Comparar com o combinado depois do corte e com o período que existe. |
| 16 | "Falar com alguém" | Bug | "O contador pulou de 1 para 3 com uma conversa nova." | Baixa | Não somar duas vezes a mesma proposta. |
| 17 | WhatsApp, versão curta | Bug | "Em 20/10 me lembra do bônus de março." | Baixa | Usar a tarefa do dia. |
| 18 | Estados e textos | Texto | "'Já registrado em 5/10' com o aporte atrasado; 'alterada em 3/11', no futuro; '(texto a confirmar)'; 'para a Intercâmbio'; 'Casa própria para a Casa própria'; 'Toque' no desktop." | Baixa | Revisão de texto. |
| 19 | WhatsApp › código | Sugestão | "Pedir 'Código 4821' para escolher uma saída me faz desistir." | Baixa | O link de uso único basta; código só para mudanças maiores. |
| 20 | Utilitários | Falta | "3 de 4 calculadoras só dão aviso; a da taxa não usa meus 22 anos nem o VGBL." | Baixa | Pré-preencher com o plano; montar as outras. |
| 21 | O livro / versões | Falta | "Só Objetivos abre; a versão de 19/03 não abre." | Baixa | Capítulos e versões antigas em só leitura. |
| 22 | Fiz no aporte atrasado | Gostei | "Um toque e tudo andou: Fortaleza de 25% para 29%, o ritmo, o placar. Sem conexão, ficou na fila." | Baixa | Manter; atualizar o toast do Realizado. |
| 23 | Não fiz › efeito; Comparação | Gostei | "Ver objetivo por objetivo o que a falta causa, e 'R$ 430/mês = 29% do aporte da Casa', é concreto." | Baixa | Manter. |

**Ela sente que vale o que paga?** Sim. O mês fica claro e o Fiz/Não fiz é rápido. Mas números que não batem entre telas abalam a confiança justamente de quem confere conta.

**Dúvidas que ela levaria à Patrícia:**
1. Ela tem aluguel ou financiamento?
2. A liberdade aos 57 está de pé?
3. A casa sai em 2030 ou em 2032?

## Patrícia Lemos · Consultora

Viveu uma manhã de trabalho no lado do consultor, no desktop.

| # | Tela / fluxo | Tipo | O que aconteceu ou o que sentiu | Gravidade | O que corrigir |
|---|---|---|---|---|---|
| 1 | Fila › Proposta pendente | Falta | "'Ver antes e depois' só mostra 'simulação', e o 'Aprovar' fica do lado. Eu aprovaria às cegas." | Alta | Antes e depois no cartão; "Aprovar" só depois de abrir. |
| 2 | Fila › Tratei em proposta | Bug | "Apertei 'Tratei' sem decidir. Saiu da fila, e o cliente segue 'aguardando'. O cliente fica esquecido." | Alta | Desfechos obrigatórios (Aprovei, Ajustei, Recusei, Respondi) e o novo estado para o cliente. |
| 3 | Tratados hoje | Falta | "Não tem 'Desfazer'. Um clique errado tira o cliente da minha frente." | Alta | "Desfazer" e registro no histórico. |
| 4 | Registrar a clínica › alvo × prévia | Bug | "O alvo é R$ 195 mil (19.500 × 10), a prévia diz 'Resgatar R$ 240 mil'. Mudei para 150 mil e a prévia não mudou." | Alta | Tarefa e frase geradas do alvo, recalculadas a cada mudança. |
| 5 | Registrar a clínica › campos | Bug | "Marquei mais uma vertical e o valor que digitei voltou para R$ 195 mil." | Alta | Guardar o estado (rascunho a cada toque). |
| 6 | Publicar → área do cliente | Bug | "Editei a orientação, publiquei, e o cliente continua vendo o texto antigo." | Alta | O painel do cliente lê o publicado. |
| 7 | Registrar a clínica › prazos | Bug | "Prazo em 22/10, lembrete três dias antes: 19/10, que já passou." | Média | Avisar o lembrete no passado; propor uma data mínima. |
| 8 | Registrar a clínica › cliente | Falta | "Abre direto no Marcos; não consigo escolher outro cliente." | Alta | Começar pela escolha do cliente e da data. |
| 9 | Publicar | Confuso | "Um clique dispara o WhatsApp para o cliente, sem confirmação." | Média | Confirmação com resumo ("5 tarefas, 1 mensagem agora"). |
| 10 | Fila › ações | Falta | "Responder, Ajustar, Visto, Agendar e Abrir o rascunho só dizem 'simulação'. A manhã não fecha." | Alta | Ligar ao menos Responder (com a página do plano) e Abrir o rascunho. |
| 11 | Preparar a semestral | Falta | "Não há tela para preparar a semestral." | Alta | Tela com o que mudou, tarefas atrasadas, propostas e temas pendentes. |
| 12 | Ver como o cliente › seletor | Falta | "Três opções, sendo duas iguais, de 40 clientes. Quem está na fila não aparece." | Alta | "Ver como o cliente" em cada cartão; busca por nome. |
| 13 | Fila × situação do cliente | Falta | "O aporte atrasado e a falta de sobra da Ana e do Marcos não chegam à fila." | Alta | Alerta de aporte atrasado e de falta estrutural. |
| 14 | Cartão "Tarefa do bloco 11" | Bug | "Dois botões 'Tratei'." | Média | Um botão só. |
| 15 | Fila › organização | Falta | "10 itens soltos, o mesmo cliente 2 ou 3 vezes, sem filtro. Com 60 clientes vira uma lista enorme." | Média | Agrupar por cliente; filtros por tipo, plano e prazo. |
| 16 | "Casa de praia marcada para revisão" | Confuso | "No cliente aparece 'atenção', e a dúvida não está em Conversas." | Média | O mesmo rótulo; a dúvida no histórico. |
| 17 | Painel da empresa | Falta | "Não há visão da empresa." | Média | Adesão, quem está parado, pedidos de conversa. |
| 18 | Últimas mensagens de WhatsApp | Confuso | "Exemplos genéricos, não o que o Marcos recebeu. Esc não fecha." | Baixa | Histórico real; Esc; Fechar no alto. |
| 19 | Ver como o cliente › Fiz | Gostei | "'Só leitura' me protege de marcar por ele." | Baixa | Manter, com botões visivelmente desabilitados. |
| 20 | Registrar a clínica › verticais | Gostei | "Marcar a vertical abre o alvo com a origem, e a prévia mostra o WhatsApp como o Marcos vai receber." | Baixa | Manter; "Dívidas" abre com alvo e origem vazios. |
| 21 | Fila › cabeçalho | Gostei | "O resumo diário no WhatsApp, a cobertura de férias pela Renata e o 'há 3 dias' ajudam a priorizar." | Baixa | Destacar o que vence hoje ou amanhã. |

**Capacidade:** hoje a Patrícia não fecha a manhã com a ferramenta. Com as ações ligadas e a fila agrupada, daria conta de 40 a 60 clientes.

**O que ela pediria primeiro ao time:**
1. O antes e depois na aprovação, com o desfecho registrado.
2. Um registro da clínica confiável.
3. A fila agrupada por cliente, com os riscos do cliente.

## Especialista de UX

Percorreu os quatro degraus, o celular e o desktop, o lado do consultor e os estados, no navegador.

| # | Tela / fluxo | Tipo | Achado (heurística ou princípio) | Gravidade | O que corrigir |
|---|---|---|---|---|---|
| 1 | Não fiz do teto (Completo) | Bug | "Restam R$ 1.660: até R$ 1.930 por semana": o valor por semana passa do que resta e do teto que estourou (correspondência com o mundo real). | Alta | Corrigir `sugestaoTeto`. |
| 2 | Não fiz do teto › Antes/Depois | Bug | "Antes: R$ 1.200 no próximo aporte; Depois: semanas menores": mistura teto e aporte, e o Depois vem sem número. | Alta | Teto por semana antes e depois, com valor. |
| 3 | Desktop › Painel, coluna direita | Bug | Coluna de 180 px: "R$ 60 mil" em 3 linhas, "R$ 1,7 milhão" quebrado, o Ritmo ilegível. | Alta | Mínimo de cerca de 300 px, ou números em grade de 4 abaixo do passo. |
| 4 | Fiz no Painel e em Tarefas | Falta | Grava sem confirmar e sem "Desfazer"; o toast some em 4,2 s (prevenção de erro; WCAG 2.2.1). | Alta | "Desfazer" no toast, 6 a 8 s, pausa ao focar. |
| 5 | Toast do ajuste provisório | Bug | Espremido em meia largura, 8 linhas sobre o "Fiz" e os cartões. | Alta | `left:16px; right:16px; transform:none`, acima da navegação. |
| 6 | Casa própria › Como está indo | Bug | "3 de 3 cumpridos" e "set/2026: R$ 1.200, cumprido", com setembro parcial e o aporte de R$ 1.500 (uma variável só). | Alta | Derivar do mesmo registro; parcial é parcial em todo lugar. |
| 7 | Cadastrado › Clínica › Completo | Confuso | O passo e o alvo da reserva mudam, o Ritmo cai de R$ 1.500 para R$ 0 e tarefas somem. | Alta | Carregar o histórico e as tarefas; explicar mudança de alvo. |
| 8 | Consultor › Fila | Bug | O ajuste provisório recém-enviado não aparece na fila; há dois "Tratei". | Média | Ligar a fila às ações do cliente; um botão. |
| 9 | Fila › hierarquia | Confuso | "Tratei" é o primário e "Aprovar" é contornado; a grade de 2 colunas quebra a ordem por vencimento. | Média | Primário = decisão; "Tratei" como link; 1 coluna. |
| 10 | Termos | Texto | Saúde financeira 71 / Nota 71 / Placar; menu "Plano" para a tela "Status"; pilar e vertical "Patrimônio" (consistência). | Média | Glossário fixo. |
| 11 | Respostas do teto | Confuso | "Fiz / Fiz parte / Não fiz" para um limite; "Não fiz" quer dizer "passei". | Média | "Fiquei dentro", "Passei", "Informar o valor". |
| 12 | Texto no Completo | Texto | "No Completo, a escolha vale…", "Tarefa do bloco 11", "D+0", "D+1". | Média | Linguagem do cliente. |
| 13 | Objetivos (Completo) | Confuso | 4 de 5 objetivos em "atenção"; 5 verticais em "Pedem atenção"; o Painel não mostra nada disso (fadiga de alerta). | Média | "Atenção" só para o que pede ação agora; "fora do ritmo" em tom neutro. |
| 14 | Status desktop › Bolhas | Bug | Números heterogêneos e às vezes errados (reserva ideal no lugar da atual; patrimônio = a empresa); raios de 37 a 66 quase iguais. | Média | Mesmo tipo de número em cada bolha, coerente com a lista; escala mais aberta ou sem tamanho. |
| 15 | Gráficos | Falta | SVG sem `role`/`aria-label`; bolhas sem teclado; estado só por cor (WCAG 1.1.1, 1.4.1, 2.1.1). | Média | `role="img"` + `aria-label`; bolhas como `<button>`; estado escrito. |
| 16 | Painel › O Ritmo | Falta | Barras sem valores nem eixo; outubro ambíguo; título repetido. | Média | Valor na barra do mês; legenda "feito / planejado"; um título. |
| 17 | Alvos de toque | Falta | "⋯" 36×40, "Fiz" 52×40, links com 25 px, "Falar com alguém" 33 px (WCAG 2.5.8). | Média | Mínimo de 44×44. |
| 18 | Estado sem conexão | Falta | O app não mostra nada até o cliente tocar em "Fiz" (visibilidade do estado). | Média | Faixa "Sem conexão: as respostas ficam guardadas"; "na fila" na tarefa. |
| 19 | Painel › Próximas tarefas | Confuso | O atraso é só texto no fim da linha; "Agora" diz "Nada para esta semana" depois de um "não fiz" no teto. | Média | Bloco "Em atraso" no topo (pêssego + texto); o teto da semana em "Agora". |
| 20 | Tarefas › filtros | Confuso | 8 + 7 chips antes da primeira tarefa (carga cognitiva). | Baixa | Um botão "Filtrar"; filtro ativo como chip removível. |
| 21 | Feitas e adiadas | Confuso | Uma tarefa adiada para 27/10 aparece entre as feitas. | Baixa | Adiada volta para "Em seguida" com selo. |
| 22 | Cores dos progressos | Sugestão | O guardado em laranja; pelo DESIGN.md, o marinho é o caminho percorrido. | Baixa | Guardado em marinho; laranja para meta ou futuro. |
| 23 | Cadastrado › Painel | Texto | O propósito cita a Luiza e a liberdade, mas só existe a Casa; "para a Casa própria" repetido. | Baixa | Propósito com o que existe; a segunda linha diz o porquê. |
| 24 | Visitante | Confuso | O exemplo de "Não fiz" tem cara de botão e não faz nada (affordance falsa). | Baixa | Estilo de ilustração, ou demonstrável. |
| 25 | Re-render | Sugestão | "O próximo passo" reanima a cada ação e parece desabilitado por um instante. | Baixa | Animar só na primeira montagem. |
| 26 | Fluxo "Não fiz" | Gostei | Efeito em linguagem de objetivo, saídas sempre na mesma ordem, sugestão após duas faltas, "Adiar não conta como falta", erro com "Nada foi registrado ainda". | Baixa | Manter e levar o padrão ao teto. |
| 27 | Consultor › Registrar a clínica | Gostei | Segue a ordem da conversa, com a prévia das tarefas e do WhatsApp antes de publicar. Ressalva: custo de R$ 22.500 contra R$ 19.500 e resgate de R$ 240 mil. | Baixa | Manter e conferir os números. |

**As 3 mudanças de maior impacto:**
1. A matemática e as palavras do teto.
2. Uma fonte só para o realizado e a subida de degrau sem perda.
3. O "Desfazer" com um toast legível, e o layout do desktop.
