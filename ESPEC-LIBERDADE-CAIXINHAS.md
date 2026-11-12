# Especificação: a liberdade financeira como caixinha, a macroalocação na política e o caixa de curto prazo

Escrita em 12/11/2026. Documento de trabalho para o Nélio e o Claude implementarem depois. As referências de linha são de
`tela-consultor.html` no commit `9167084`. O motor é o mesmo em `evolucao-patrimonial.html` (bloco `<script id="engine">`,
sincronizado por `sync-motor.js`): toda mudança no motor vale para as duas telas.

**De onde vem:** um feedback recebido e a impressão do Nélio, em planos montados em produção (não conferidos no detalhe),
de que o dinheiro sem caixinha não estava indo para a liberdade financeira. A verificação abaixo foi feita no código e no
plano de exemplo (Ana Ribeiro).

## Regras que valem para tudo

- Cada caixinha tem o seu fluxo: o que entra nela, o que rende e o que sai dela são dela.
- A rentabilidade vale nos horizontes definidos.
- Cada caixinha rende pela sua própria taxa, sobre três fontes: o patrimônio dedicado hoje, os valores separados no Fluxo
  de 24 meses e a sobra do Fluxo vida toda.
- O perfil não muda com o tempo. A única exceção: faltando 24 meses para a data, o objetivo passa para a conservadora
  (`MESES_CONSERVADOR`, `mesDoConservador`), como hoje.
- Mudar o perfil com o tempo fica fora do escopo e vai para o backlog, no fim deste documento.

---

## 1. Diagnóstico: o que o sistema faz hoje

### 1.1 A liberdade é uma caixinha separada? Na tela, sim. Na simulação, não.

**Na Política de investimentos** (`politicaDeInvestimentos`, linha ~3787), a liberdade é a última caixinha e fica com o
restante: patrimônio = total − (compromissos + reserva + o que cada objetivo separa nos próximos 24 meses), e aporte
mensal = sobra média − aportes. A conta fecha. No plano de exemplo, as caixinhas somam R$ 860.000, igual ao patrimônio
financeiro. A liberdade fica com R$ 646.800 e R$ 830 por mês.

**Na simulação** (`run`, linhas ~2490–2690), a liberdade não existe como saldo. Ela fica misturada num saldo só, o `cofre`,
que junta:

- a reserva de emergência;
- o caixa de curto prazo (o `guardado` do Fluxo de 24 meses);
- a liberdade financeira;
- o patrimônio que um objetivo só separa depois (`inicioDoDedicado > 0`);
- o FGTS e a previdência fechada, que têm a caixa deles (`saldoPrevHoje`) e ficam fora do `cofre`.

O `cofre` rende uma taxa só, `R_M` = `plano.rate` (`if (cofre > 0) cofre *= GW`, linha ~2500). Só os objetivos têm caixinha
de verdade (`obj[k]`), cada um com a sua taxa (`TX[k]`, `taxaNoMes`).

O valor "liberdade" que o Fluxo de 24 meses calcula mês a mês (`programa`, linha ~2826: o que passa do que os 12 meses
seguintes precisam) é só um número exibido. Nenhum dinheiro sai do `cofre` para uma caixinha da liberdade.

**Consequências:**

1. **Não dá para mudar a estratégia da liberdade sem mexer na reserva e no caixa.** Hoje a liberdade aparece como
   "Conservadora, 0,4% ao mês" porque `estrategia: perfilDe(R_M)` só traduz a taxa do plano (linha ~3824). Trocar
   `plano.rate` para 0,6% faria a reserva e o caixa de curto prazo renderem como agressivos, o que está errado.
2. **A reserva e o caixa rendem a taxa da liberdade.** Hoje isso passa despercebido porque a taxa do plano é a conservadora
   (0,4%), igual à da reserva.
3. **A taxa do plano também é usada no valor da liberdade** (`rendasDaLiberdade`, linha ~3434; o valor presente da
   liberdade, linha ~8524). Ela é, de fato, a taxa da caixinha da liberdade, com outro nome.

### 1.2 O dinheiro sem caixinha vai para a liberdade? Vai, mas não dá para ver.

Na simulação, todo dinheiro sem caixinha cai no `cofre`: a sobra de cada semana (`cofre += R`, linha ~2673), o que sobra de
um objetivo na data, as vendas sem destino e o patrimônio que ainda não foi separado. Então nada se perde. O dinheiro está
lá, rendendo a taxa do plano.

O que pode ter dado a impressão de que ele não vai para a liberdade, em ordem de probabilidade:

1. **O caixa de curto prazo segura a sobra.** No Fluxo de 24 meses, a coluna Liberdade só recebe o que passa do que os 12
   meses seguintes vão precisar (`acima = fim − guardar[mi]`). Num plano com IPTU, imposto de janeiro ou um mês pesado, a
   sobra fica no caixa e a Liberdade aparece zerada por meses. O dinheiro está no `cofre`, mas não aparece como liberdade.
2. **A Política mostra uma média de 24 meses.** O aporte da liberdade é `sobra média − aportes médios`. Um objetivo que
   começa depois ou um mês negativo puxa a média para baixo.
3. **Depois de 24 meses, ninguém diz para onde vai a sobra.** O Fluxo vida toda soma a sobra no `cofre`, e o balanço o
   chama de "Reserva (patrimônio livre)" (linha ~5465). Não existe linha "Liberdade financeira" no balanço da simulação.
4. **Na tela, o patrimônio que um objetivo separa depois dos 24 meses fica na liberdade** (`separadoDepois`) e sai dela de
   uma vez quando o objetivo o separa. A liberdade cai num mês, o que pode parecer perda.

Nenhum desses casos perde dinheiro. Todos escondem onde ele está. A correção da seção 2 resolve os quatro, porque a
liberdade passa a ter saldo próprio.

### 1.3 O caixa de curto prazo hoje

O mesmo dinheiro aparece com três nomes:

| Onde | Como aparece | De onde vem |
|---|---|---|
| Fluxo de 24 meses | "Caixa de curto prazo no fim do mês" (`m.guardado`) | o acumulado do que fica para os 12 meses seguintes; pode ficar negativo de propósito (`caixaNegativoEm`) |
| Fluxo vida toda / balanço | "Reserva (patrimônio livre)" | o `cofre` inteiro: reserva + caixa + liberdade |
| Política de investimentos | não aparece; a reserva é `min(ideal, patrimônio livre)` | — |

Quando o caixa fica negativo, a simulação tira do `cofre`, ou seja, da reserva e da liberdade juntas, sem dizer de qual.

---

## 2. Correção: três saldos onde hoje existe um

O `cofre` se divide em três saldos na simulação, cada um com sua taxa:

| Saldo | Taxa | O que entra | O que sai |
|---|---|---|---|
| `caixa`: caixa de curto prazo | conservadora (`profiles.conservador`) | a sobra de cada semana (`R`) e o que o Fluxo de 24 meses guarda | as despesas e as faltas da semana; o que passa do que os 12 meses seguintes precisam vai para a liberdade no fim do mês |
| `res`: reserva de emergência | conservadora | o patrimônio da reserva em W0 (`politica.reserva`, até a ideal) e o aporte mensal da reserva | só uma falta que o caixa não cobre (ver 4.3) |
| `lib`: liberdade financeira | a da estratégia escolhida (seção 3) | o restante do patrimônio em W0; no fim de cada mês, o que passa do caixa; o que sobra de um objetivo na data; as vendas sem destino | os saques depois da liberdade financeira; uma falta que o caixa e a reserva não cobrem; o patrimônio que um objetivo separa mais adiante |

**Regras:**

- **W0:** `res` = a reserva da Política, `lib` = o restante (o mesmo `patrimonio` da caixinha da liberdade em
  `politicaDeInvestimentos`), `caixa` = 0. A soma é o `cofre` de hoje, para que a mudança não invente nem perca dinheiro.
- **Fim de cada mês, nos 24 meses do Fluxo:** o valor `liberdade` que o `programa` já calcula sai de verdade do `caixa` e
  entra na `lib` (uma transferência `mov_caixa → mov_lib`, com nota). A liberdade digitada (`liberdadePrograma`) segue a
  mesma regra.
- **Depois dos 24 meses:** a mesma regra, sem a tela. No fim de cada mês, o que passa do que os 12 meses seguintes precisam
  vai para a `lib`. Hoje, depois de 24 meses, a sobra fica no `cofre` sem nome.
- **Objetivo na data:** o que a caixinha tem acima do valor do objetivo volta para a `lib`, não para o `cofre`.
- **Patrimônio que um objetivo separa depois** (`inicioDoDedicado > 0`): fica na `lib` até o mês de separar e sai dela.
  Antes disso, rende a taxa da liberdade.
- **Depois da liberdade financeira** (`s.ff.mi`): os saques para o padrão de vida saem da `lib`. O caixa continua cobrindo
  as despesas do mês, e a `lib` repõe o caixa.
- **FGTS e previdência fechada:** continuam na caixa deles. Na Política, contam na liberdade como "sem liquidez", como hoje.
- **Saída da simulação:** `weeks[i]` ganha `caixa`, `res` e `lib`. O `cofre` continua existindo como a soma dos três, para
  não quebrar as telas que já o usam (gráficos, `scFaixas`, o balanço).
- **Balanço do Fluxo vida toda:** "Reserva (patrimônio livre)" vira três linhas: Caixa de curto prazo, Reserva de
  emergência e Liberdade financeira.

**Regressão:** com as três taxas iguais (liberdade conservadora), toda a evolução patrimonial tem que ficar idêntica à de
hoje, semana a semana (caso T1).

---

## 3. Estratégia da liberdade: conservadora, moderada ou agressiva

**Dado:** `plano.liberdadePerfil` ∈ {`conservador`, `moderado`, `agressivo`}. A taxa da liberdade é
`plano.profiles[plano.liberdadePerfil]`.

**Migração:** um plano sem `liberdadePerfil` recebe o perfil cuja taxa é a de `plano.rate` (`perfilDaTaxa`, linha ~5748).
Se `plano.rate` não bate com nenhum perfil, o perfil fica vazio e a taxa digitada continua valendo, como "personalizada". O
campo "taxa do plano" nas Premissas (`f-rate`) sai da tela e vira o seletor da liberdade, ou passa a mostrar a taxa da
liberdade sem edição (decidir na implementação; a preferência é tirar, já que é a mesma coisa).

**Tela, na Política, "As caixinhas, uma a uma":** a linha da liberdade ganha a mesma etiqueta dos objetivos
(`polEstrategia`, linha ~8710). Ela troca no clique, como a PGBL/VGBL; não é uma lista. Embaixo aparece a taxa, por exemplo
"0,60% ao mês". A liberdade nunca passa para a conservadora: ela não tem data de 24 meses finais.

**Onde a taxa da liberdade entra:**

- a `lib` na simulação (seção 2);
- `rendasDaLiberdade` e o valor presente da liberdade (linhas ~3434 e ~8524): trocar `plan.rate` pela taxa da liberdade;
- a macroalocação sugerida para a liberdade (seção 4): a carteira modelo do perfil escolhido.

**Não muda:** a taxa da reserva, a do caixa de curto prazo e a dos objetivos.

---

## 4. Macroalocação desenhada na Política de investimentos

**Hoje:** cada caixinha da Política tem uma alocação por classe (`alocacaoDaCaixinha`: a desenhada ou a sugerida pela
carteira modelo da estratégia), menos a liberdade: "a liberdade não tem alocação aqui" (linha ~3838). Na página
Macroalocação, a ideal é a soma dos mínimos das caixinhas mais o que o consultor digita acima. O que passa do mínimo é
chamado de "da liberdade" (`carteiraDoPlano`, linha ~3732).

**Proposta:** a liberdade passa a ter alocação como as outras caixinhas, e a ideal da Macroalocação passa a ser a soma das
caixinhas. Desenha-se na Política, caixinha a caixinha, e a Macroalocação mostra o resultado.

- **Alocação sugerida da liberdade:** a carteira modelo do perfil escolhido (`fracoesDoModelo(liberdadePerfil)`: conservador
  → perfil 0, moderado → perfil 1, agressivo → perfil 3, como nos objetivos).
- **Alocação desenhada:** `plan.politica.alocacao.liberdade`, no mesmo formato e com a mesma tela das outras caixinhas. A
  liquidez diária fica com o restante. Os botões "perfis 0 a 3" preenchem de uma vez.
- **Ideal da Macroalocação:** `ideal[classe] = Σ caixinhas (patrimônio da caixinha × fração da classe) / total`. A coluna
  "Ideal" deixa de ser digitada e passa a ser calculada. Ela mostra, por classe, de quais caixinhas vem.
- **"Recomendada":** continua digitável na Macroalocação, como o ajuste possível agora (um fundo que não se vende, por
  exemplo). Vazia, ela segue a ideal, como hoje.
- **Carteira modelo escolhida para a família inteira** (`carteira.modelo`): deixa de existir. O modelo passa a ser escolhido
  por caixinha.
- **Migração:** um plano com `carteira.ideal` digitada mantém o que foi digitado como "Recomendada". A ideal passa a ser a
  calculada. Avisar uma vez na tela.

**Pergunta em aberto:** a alocação da liberdade muda os rendimentos da simulação ou só a carteira? Hoje a taxa vem do
perfil, e a alocação não mexe nela. A proposta mantém assim: a taxa vem do perfil e a alocação é a carteira. Ligar a taxa à
alocação (a taxa de cada classe) é outra mudança e vai para o backlog.

---

## 5. Caixa de curto prazo: proposta para pensarmos juntos

**O que ele é:** o dinheiro que a família vai gastar nos próximos 12 meses e que ainda não tem dono. É o IPTU de fevereiro,
o imposto de janeiro, o mês em que o seguro e a escola vencem juntos. Não é reserva (a reserva é para o imprevisto) e não é
liberdade (a liberdade é para daqui a anos).

**Proposta:** o caixa vira uma caixinha de verdade, a primeira da lista, com o mesmo nome nas três telas.

| Onde | Como fica |
|---|---|
| Fluxo de 24 meses | como hoje: "Caixa de curto prazo no fim do mês", com o que entra e o que sai. A coluna Liberdade passa a ser uma transferência real para a `lib` |
| Fluxo vida toda | uma linha própria no balanço: Caixa de curto prazo, separada de Reserva de emergência e Liberdade financeira |
| Política de investimentos | uma caixinha "Caixa de curto prazo" antes da reserva: patrimônio = o caixa no mês 0 (normalmente zero, mais o que o consultor deixar para um mês pesado já conhecido); horizonte curtíssimo; estratégia conservadora fixa; alocação 100% liquidez diária |
| Macroalocação | soma na liquidez diária, junto com a reserva e os compromissos |

### 5.1 Decisões que são suas

1. **O caixa pode começar com patrimônio?** Hoje ele começa em zero, e um mês negativo logo no início sai do patrimônio
   (`caixaNegativoEm`, "de propósito"). A proposta: o caixa começa com o que os próximos 12 meses vão pedir, tirado da
   liberdade, e não da reserva. Alternativa: começa em zero, como hoje.
2. **Quando o caixa fica negativo, de onde sai?** Proposta: primeiro da liberdade, e a reserva só é usada se a liberdade
   acabar. A reserva é para o imprevisto, e um IPTU é previsto. Alternativa: primeiro da reserva, com a reposição da
   reserva como prioridade no mês seguinte.
3. **A janela de 12 meses fica?** Ela é `JANELA_CAIXA = 12`. A proposta é manter.
4. **O caixa aparece para o cliente** (`evolucao-patrimonial.html`) ou só para o consultor? Proposta: aparece só como
   parte de "dinheiro do dia a dia", sem uma caixinha própria na tela do cliente.

---

## 6. Casos de teste

Os casos entram em `verificar.js` (`ok(nome, cond, detalhe)`), no plano de exemplo, salvo onde dito. Os valores de
referência foram medidos hoje no plano de exemplo: patrimônio financeiro R$ 860.000; reserva R$ 102.200; objetivos com
patrimônio separado hoje somando R$ 111.000; liberdade R$ 646.800 e R$ 830 por mês; `cofre` em W0 R$ 744.138; taxa do
plano 0,4% ao mês; perfis de 0,4%, 0,5% e 0,6% ao mês.

| # | Caso | Como montar | Esperado |
|---|---|---|---|
| T1 | Regressão: separar o `cofre` não muda nada | liberdade conservadora (igual à reserva e ao caixa) | `weeks[i].fin` igual ao de hoje em toda semana (diferença < R$ 1) e `caixa + res + lib = cofre` em toda semana |
| T2 | W0 fecha a conta | plano de exemplo | `res(W0)` = R$ 102.200; `lib(W0) + res(W0) + caixa(W0)` = `cofre(W0)` = R$ 744.138; a soma das caixinhas da Política = R$ 860.000 |
| T3 | Estratégia da liberdade muda só a liberdade | `liberdadePerfil = 'agressivo'` | `lib` rende 0,6% ao mês; `res` e `caixa` rendem 0,4%; `obj[k]` igual ao do caso T1 em toda semana; `fin` maior que no T1 |
| T4 | A reserva não muda com a liberdade | T3 comparado com T1 | `res(i)` igual nos dois em toda semana |
| T5 | A sobra do Fluxo de 24 meses chega à liberdade | plano de exemplo | Σ `programa.meses[0..23].liberdade` (hoje R$ 19.915) = o que entrou na `lib` por transferência nesses meses |
| T6 | Depois de 24 meses, a sobra também chega | plano com sobra positiva e sem despesa anual depois do mês 24 | do mês 25 ao 36, o `caixa` no fim de cada mês ≤ o que os 12 meses seguintes precisam, e a `lib` cresce mais que a taxa |
| T7 | O caixa segura o mês pesado | plano com IPTU de R$ 3.200 em fevereiro e sobra de R$ 1.000 | nos meses antes de fevereiro, o `caixa` acumula até cobrir o IPTU; a Liberdade só recebe o que passa disso; em fevereiro, o `caixa` paga o IPTU e a `lib` não cai |
| T8 | O que sobra do objetivo volta para a liberdade | objetivo de R$ 50.000 com caixinha de R$ 55.000 na data | na semana da data, `lib` sobe R$ 5.000; `res` e `caixa` não mudam |
| T9 | Patrimônio separado mais adiante sai da liberdade | objetivo com `dedicated` de R$ 30.000 e `inicioDoDedicado` = 30 | até o mês 29, os R$ 30.000 estão na `lib`, rendendo a taxa dela; no mês 30, `lib` cai R$ 30.000 e `obj[k]` sobe R$ 30.000 |
| T10 | 24 meses finais continuam conservadores | objetivo moderado com data no mês 36 | do mês 12 em diante, `obj[k]` rende 0,4%; a mudança da liberdade não altera isso |
| T11 | Migração do perfil | plano antigo com `rate` = 0,005 e sem `liberdadePerfil` | `liberdadePerfil` = 'moderado'; resultado igual ao de hoje com taxa de 0,5%, exceto a reserva e o caixa, que passam a render 0,4% |
| T12 | Ideal da Macroalocação = soma das caixinhas | plano de exemplo, sem alocação desenhada | por classe, `ideal × total` = Σ (patrimônio da caixinha × fração do modelo dela), incluindo a liberdade pelo modelo do perfil; a soma das classes = 100% |
| T13 | Alocação desenhada da liberdade | `politica.alocacao.liberdade = { posFixado: 0,5 }` | a liberdade tem 50% em pós-fixado e 50% em liquidez diária, e a ideal da Macroalocação reflete isso |
| T14 | Saques depois da liberdade financeira | plano de exemplo, do mês `s.ff.mi` em diante | o padrão de vida sai da `lib`; `res` se mantém até a `lib` acabar |
| T15 | Rendas da liberdade usam a taxa da liberdade | T3 | `rendasDaLiberdade` e o valor presente da liberdade calculados a 0,6% |

---

## 7. Ordem de implementação

1. Separar o `cofre` em `caixa`, `res` e `lib`, com a mesma taxa para os três (T1, T2). É a mudança grande e a que mais pode
   quebrar coisas. Por isso entra sozinha, com a regressão.
2. Transferências do caixa para a liberdade, dentro e depois dos 24 meses; objetivo na data; patrimônio separado mais
   adiante (T5 a T9).
3. `liberdadePerfil`, a etiqueta na Política e a migração (T3, T4, T10, T11, T15).
4. Balanço do Fluxo vida toda em três linhas, e a caixinha do caixa de curto prazo na Política, depois das decisões da 5.1.
5. Alocação da liberdade e a ideal calculada na Macroalocação (T12, T13).
6. Saques depois da liberdade financeira (T14).

Cada etapa termina com `node verificar.js` em "Tudo certo".

---

## Feito (12/11/2026)

- Etapa 1: o cofre da simulação em três partes (caixa, reserva e liberdade); T1 e T2 no `verificar.js`.
- Etapa 2: no fim de cada mês, o aporte da reserva vai para a reserva e o que passa do que o caixa guarda vai para a
  liberdade; a sobra do objetivo na data vai para a liberdade; T5 e T8.
- Etapa 3: o seletor da estratégia da liberdade na Política (grava `liberdadePerfil` e a taxa em `plano.rate`); a reserva e
  o caixa rendem a conservadora; T3 e T4.

## Backlog

- **Caixa de curto prazo como linha da Política (feedback de 12/11/2026).** O Nélio esperava uma linha nova "Caixa de curto
  prazo" na Política de investimentos, para destinar valores do patrimônio e do mensal com mais liberdade entre o caixa e a
  liberdade financeira. No plano de exemplo, o mensal da liberdade aparece zerado. Retomar com a seção 5 e as decisões da 5.1.
- **A Política de investimentos desconectada dos fluxos (feedback de 12/11/2026).** No plano de exemplo, o valor da viagem de
  Fortaleza foi alterado na Política e a mudança não chegou ao Fluxo vida toda nem ao Fluxo de 24 meses. Proposta do Nélio:
  os valores da Política não se editam na própria tela; eles refletem o que foi programado nos fluxos (objetivos, Fluxo de
  24 meses), e a edição acontece lá. Verificar quais campos da Política gravam algo que a simulação não lê.

- **Perfil que muda com o tempo.** Hoje o perfil de cada caixinha é fixo, e a única exceção é a conservadora nos 24 meses
  finais de um objetivo. Fica para depois: a liberdade (ou um objetivo longo) com uma trilha de perfis por fase, por
  exemplo agressiva até 10 anos antes da liberdade, moderada até 3 anos antes e conservadora depois.
- **Taxa pela alocação.** Calcular a taxa de cada caixinha pela alocação desenhada (uma taxa esperada por classe), em vez
  de usar a taxa do perfil.
