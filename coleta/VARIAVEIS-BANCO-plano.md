## 2. O plano: o que o consultor decide na montagem (camada consultor)

É o documento `plano` de um cliente (um JSON por cliente; formato completo em `README.md`, "Formato do plano", e inventário em
`VARIAVEIS.md`). Na plataforma hoje ele vai e volta inteiro por `/montagemController`; dá para gravar como um JSONB `plano`
na tabela `planejamento` (`cliente_id`, `coleta_id` de origem, `versao`, `atualizado_em`), que é o mais simples e o que o portal
espera. Quem quiser colunas tira daqui as de consulta frequente (nome, tipo, datas de nascimento, `retireAge`, `desired`).

O plano nasce da coleta (`coleta/plano.js`, `planoDaColeta`): os campos abaixo marcados **da coleta** já chegam preenchidos e
guardam `origem.coleta.campos[caminho] = name`. Os marcados **consultor** ficam vazios até a montagem; os padrões são do motor.

| Variável (caminho no plano) | O que é | Tipo | Origem | No banco |
|---|---|---|---|---|
| `name`, `tipo` | nome do cliente; `individual` ou `familia` | texto; enum | cadastro; da coleta (`planoTipo`) | varchar; varchar(12) |
| `nascimento`, `conjugeNome`, `conjugeNascimento` | datas de nascimento (AAAA-MM-DD) e nome do cônjuge | date; texto | da coleta | date, varchar |
| `age`, `spouseAge` | idades de hoje | inteiro | **calculada** (`ENGINE.sincronizaIdades`) | não gravar |
| `inicio` | o "hoje" do plano (AAAA-MM-DD); mês 0 de toda a linha do tempo | date | consultor (um plano novo: a data de hoje) | date |
| `periodicidade` | `mensal` ou `anual` (como a sobra e os aportes são contados) | enum | da coleta (`orcamentoModo`) | varchar(6) |
| `lifeExp` | expectativa de vida (anos) da pessoa mais jovem | inteiro | consultor (premissa; padrão 95) | smallint |
| `retireAge`, `spouseRetireAge` | idade em que cada um para de trabalhar | inteiro | da coleta | smallint |
| `desired`, `desiredSteps[]` | renda desejada por mês na liberdade; mudanças a partir de um mês (`from`, `value`) | R$; lista | da coleta (`desired`); consultor (`desiredSteps`) | decimal(14,2); JSON |
| `mode` | forma de sacar: sempre `desej` | enum | fixo | varchar(5) |
| `rate`, `profiles.{conservador,moderado,agressivo}` | rentabilidade real líquida ao mês da reserva e de cada perfil | fração (0.004) | consultor (premissas; padrões do motor) | decimal(7,5) |
| `horizonte` | como o Fluxo abre: month, quarter, semester, year | enum | consultor (preferência de tela) | varchar(8) |
| `capacityOverride` | capacidade de poupança informada pelo cliente (R$/mês) | R$ | da coleta (`declaredmonthlysavings`) | decimal(14,2), nulo = calcular |
| `orcamento.vezesPoupou` | nenhuma, 1-3, 4-6, 7-9, 10+ | enum | da coleta (`recentsavingsfrequency`) | varchar(8) |
| `orcamento.combinado.{fixas,ajustaveis}.{meta,cortes[]}` | o orçamento combinado na apresentação (quanto liberar de cada grupo e de quais despesas) | JSON | consultor (com o cliente) | JSON |
| `rendasAtivas[]` | `pessoa`, `profissao`, `natureza` (as de `ENGINE.NATUREZAS`), `horas` | lista | da coleta (`rendaAtivaList`, `incomenature`) | JSON ou tabela `plano_renda_ativa` |
| `experiencia.<titular\|conjuge>.<classe>.{entende,investiu,restricao}`, `experiencia.observacoes` | experiência com as classes de ativos | JSON | da coleta (`expList`, `expObs`) | JSON |
| `incomes[]` | cada entrada: `id`, `label`, `pessoa`, `kind` (ativa/passiva), `origin` (Salário, Pró-labore…), `gross`, `frequency`, `days[]`/`dates[]`, `taxable`, `steps[{from,value}]`, `exc{}`, `de`, `segue`, `destino`, `certeza` (certa/estimada, **novo**) | lista de linhas do tempo | da coleta (o valor de hoje, de quem é, bruto, 13º, bônus, PLR, comissões); consultor (degraus futuros, ajustes pontuais, `destino`) | JSON (ou tabela `plano_linha` com `steps` em JSON) |
| `expenses[]` | cada saída: `id`, `label`, `group` (fix/adj), `frequency`, `days`/`dates`/`weekday`, `steps[]`, `exc{}`, `endObj` | lista de linhas do tempo | da coleta (`despList`; sem ela, o total declarado e os itens soltos: aluguel, parcelas, prêmios, previdência); consultor (o resto) | JSON |
| `creditos[]`, `jurosDivida` | créditos novos no futuro; juros quando o dinheiro acaba (% ao mês) | lista; % | consultor | JSON; decimal(5,2) |
| `patrimonio.comecou`, `patrimonio.conjugeComecou` | idade em que cada um começou a trabalhar | inteiro | da coleta | smallint |
| `patrimonio.financeiro[]` | `nome` (instituição), `valor`, `tipo` ('' investimento, pgbl, vgbl, fechada, fgts, consorcio, emprestimo), `titularidade`, `daCarteira`, `conv{}` (fundo de pensão/FGTS: como vira renda), `cons{}` (consórcio a contemplar) | lista | da coleta (soma da carteira por instituição; previdência fechada; FGTS); consultor (`conv`, `cons`, empréstimos) | JSON; os `daCarteira` são **calculados** da carteira (`ENGINE.sincronizaPatrimonio`): gravar só os digitados |
| `patrimonio.participacoes[]` | `nome`, `valor`, `pct`, `pessoa`, `valorizacao[]`, `venda{}`, `renda` | lista | da coleta (nome, valor, pessoa, intenção de vender); consultor (valorização, venda) | JSON |
| `patrimonio.bens[]` | `nome`, `tipo`, `mercado`, `titularidade` (titular/conjuge/casal), `titularPct`, `conjugePct`, `saldoDevedor`, `credito`, `parcelas`, `inicio` (AAAA-MM), `parcela`, `juros`, `jurosPeriodo`, `sistema` (sac/price), `iof`, `seguro{}`, `tarifas`, `situacao`, `amortizacoes[]`, `outrasLinhas[]`, `modalidade` (consorcio) + campos do consórcio, `renda` (id da linha), `protecao`, `apolice{}`, `valorizacao[]`, `venda{em,preco,custos[],destinos[],impostoGanhoPct,custoAquisicao}` | lista | da coleta (tudo até `situacao`, a renda, a proteção, a intenção de venda); consultor (valorização, custos da venda, adiantamentos) | JSON; `restantes`, CET, saldo projetado são **calculados** (`ENGINE.contratoDaDivida`), não gravar |
| `patrimonio.dividas[]` | o mesmo contrato dos bens, sem `mercado` | lista | da coleta (`dividasList`); consultor (detalhe do contrato quando faltar) | JSON |
| `patrimonio.liquidezIdealPct` | liquidez ideal, % do patrimônio total | % | consultor | decimal(5,2) |
| `patrimonio.contas.{titular,conjuge,casal}` | instituições onde só tem conta | listas de nomes | consultor | JSON |
| `carteira.ativos[]` | `id`, `instituicao`, `titular`, `nome`, `classe` (`ENGINE.CLASSES_CARTEIRA`), `subclasse`, `vencimento`, `tipo`, `valor`, `obs`, `emissor`, `acao` (manter/parcial/integral/portabilidade), `resgate` | lista | da coleta (`ativoFinList`, `prevAbertaList`); consultor (`classe` conferida, `acao`, `resgate`) | tabela `plano_ativo` ou JSON; `classe` vazia = a classificar |
| `carteira.modelo`, `carteira.ideal{}`, `carteira.recomendada{}`, `carteira.justificativa`, `carteira.aporte`, `carteira.novos[]` | macro e microalocação recomendadas | JSON | consultor | JSON |
| base de ativos (nome do ativo → classe) | a classificação compartilhada entre clientes | tabela | consultor (do escritório) | tabela `ativo_classe` (nome, classe), **não** no plano |
| `objectives[]` | `id`, `name`, `categoria`, `icon`, `iconFA`, `iconData`, `photo`, `kind` (bem/consumo), `ligado`, `months`, `amount`, `preco`, `compra{modo,…}`, `costs[]`, `dedicated`, `planned`, `aporteDe`, `dedicadoEm`, `programa{}`, `profile`, `rateM`, `alocacao{}`, `strategy`, `descricao`, `planoAtual`, `diagnostico{presente,futuro}` | lista | da coleta (nome, categoria, data, valores, aporte e saldo que o cliente já pratica, custo depois, modo de compra, descrição); consultor (perfil, rentabilidade, alocação, estratégia, foto, `aporteDe`, `dedicadoEm`, `programa`, o detalhe do financiamento/consórcio, `ligado`) | JSON (ou tabela `plano_objetivo`); `required`, `ratio`, a curva e os cortes são **calculados** |
| `objetivosOrdem[]` | ids na prioridade do cliente, com `seguranca` e `liberdade` | lista | da coleta (a ordem da lista) | JSON |
| `compromissos[]` | `id`, `titulo`, `descricao`, `em` (mês), `valor` | lista | da coleta (`comprList`) | JSON |
| `politica.reserva`, `politica.reservaMensal`, `politica.cortes{adj,fix}`, `politica.alocacao{reserva,compromissos}` | política de investimentos | JSON | consultor | JSON |
| `passive[]` | rendas da aposentadoria: `name`, `origin`, `pessoa`, `gross`, `tax`, `net`, `startMi` ou `start`, `dur`, `cost`, `converted` | lista | da coleta (INSS: tipo, idade, valor); consultor (as contratadas) | JSON |
| `riscos.dependentes[]` | `nome`, `relacao` (filho/conjuge/pai/outro), `nasc` (AAAA-MM), `ate` | lista | da coleta (`depList`) | JSON ou tabela `plano_dependente` |
| `riscos.reserva.{dependentes,custoVida,atual,alvo}` | tem dependentes; ajustes do custo de vida, reserva atual e alvo | boolean; R$ | da coleta (exame 26, 28, 10, 12) | JSON; a reserva ideal é **calculada** |
| `riscos.liquidez{}` | a escada D+0 a 1 ano e a avaliação | JSON | consultor (digitada; calculável de `carteira.ativos[].vencimento`) | JSON |
| `riscos.saude.{tipo,operadora,plano,vidas[],linha,hospitais[],alternativa{},avaliacao}` | plano de saúde: tipo, vidas (`nome`, `quem`, `premio`, `pagador`), a despesa no Fluxo, a alternativa | JSON | da coleta (tipo, operadora, vidas, prêmios, quem paga); consultor (hospitais, alternativa, avaliação) | JSON |
| `riscos.terceiros.{avaliado,itens[{nome,ideal,atual}]}` | danos a terceiros: cobertura atual e ideal | JSON | da coleta (`atual`: RCV-F do auto, RC familiar, RC profissional); consultor (`ideal`, `avaliado`) | JSON |
| `riscos.seguro.geradores[]` | `nome`, `pessoa`, `nasc`, `participacao` (% da renda), `passivaPct`, `patrimonioPct`, `coberturaVida`, `coberturaInvalidez`, `inssInvalidez`, `inssMorte` | lista | da coleta (coberturas, INSS por invalidez e morte, `participacao` pelo % das despesas); consultor (`passivaPct`, `patrimonioPct`) | JSON |
| `riscos.seguro.{renda,passiva,sucessaoPct}`, `riscos.pesos{}`, `riscos.ruina{}`, `riscos.bens{}`, `riscos.familia{}` | avaliações e pesos das oito ameaças | JSON | consultor (`renda` e `passiva` são **calculadas** do Fluxo) | JSON |
| `tributario.ir.{regimeAtual,pessoas[],atual{depsCom,lanc[]},recomendada{}}` | IR de hoje e recomendado: despesas médicas, instrução, PGBL de cada pessoa | JSON | da coleta (`irRegime`, `irDespesasMedicas`, `irInstrucao`, PGBL × 12); consultor (o dedutível, a estratégia recomendada) | JSON; rendimentos tributáveis e INSS são **calculados** do Fluxo (`rend`, `inss` só como reserva) |
| `tributario.prolabore.socios[]` | `quem`, `empresa`, `regime`, `faturamento`, `proRec`; `pro` e `div` são reserva | lista | da coleta (`participacoesList`); consultor (`proRec`) | JSON |
| `tributario.sucessao{itcmd,custos,paraPrevidencia}`, `tributario.previdencia{}` | parâmetros da sucessão e do simulador da previdência | JSON | consultor (parâmetros; o simulador pode abrir com `pa_saldo`, `pa_contribuicao`) | JSON |
| `diagnostico.{perfil,concentracao,liberdade,orcamento,reserva,protecao}.{presente,futuro}` | o diagnóstico de hoje e o futuro de cada linha | JSON | consultor (orçamento, reserva e proteção de hoje são **calculados**) | JSON |
| `consultor{nome,certificacao,telefone,email,foto}` | quem cuida do planejamento | JSON | cadastro do planejador (do escritório, não do cliente) | tabela `consultor`; **não** gravar no plano |
| `dataRelatorio`, `mensagemFinal`, `capitulosOcultos[]`, `videos{}` | data, mensagem final, capítulos fora e vídeos de cada capítulo | date; texto; listas | consultor (os vídeos teóricos são da biblioteca do escritório) | date, text, JSON |
| `coleta.{status, finalizadaEm, pessoal, perfil, diagnostico, moradia, moradiaObs, ir, declarado, outrosAtivos[], apolices[], prevPublica, aposentadoria, naoTem, anexos (com arquivos[]), tarefas[], reuniao, anotacoes}` | o que só a reunião de coleta pede e nenhuma conta usa (a parte 1 tem cada campo) | JSON | da coleta | dentro do JSON do plano; se o banco quiser consultar, colunas na tabela do plano |
| `origem.coleta.{id,em,campos{}}` | de que coleta o plano nasceu e qual campo alimentou cada caminho | JSON | gerado por `planoDaColeta` | JSON; `coleta_id` como coluna |

## 3. O que NÃO se grava: as calculadas

Saem do motor (`ENGINE`, o `<script id="engine">` das duas telas) a cada abertura, e mudam sempre que uma variável de origem muda:

- **Idades** de hoje e em cada marco (`age`, `spouseAge`, idade da liberdade, da fase da vida).
- **Totais**: `initialWealth` (soma do financeiro), `initialBens`, `partValue`, patrimônio total, custo de vida (média de 12
  meses das saídas), renda líquida, capacidade de poupança (entradas − saídas), sobra do mês.
- **Da dívida**: parcelas restantes, CET, IOF, saldo pelo contrato, saldo em cada mês, o líquido de uma venda, imposto sobre o ganho.
- **Dos objetivos**: aporte necessário, curva, cortes, trilha, cobertura de hoje, taxa mês a mês (a troca para a conservadora
  nos 24 meses finais), faltas da poupança para objetivos, folga a distribuir.
- **Da liberdade**: patrimônio na aposentadoria, renda por perpetuidade e por consumo, períodos e veredito, alternativas.
- **Dos riscos**: reserva mínima/aceitável/ideal, nota de proteção (%), status de cada ameaça, seguros necessários (vida e
  invalidez), renda a proteger, renda passiva.
- **Do IR e dos sócios**: rendimentos tributáveis, INSS do ano, imposto em cada modelo, economia; pró-labore e dividendos de hoje.
- **Da carteira**: financeiro por instituição (`daCarteira`), diferenças entre atual, ideal e recomendada, mínimos das caixinhas,
  liquidez diária (o restante), concentração patrimonial.
- **Do exame**: os cinco pilares e o score geral (hoje no `saudeFinanceiraController`; com as camadas unificadas, a nota deve
  ser recalculada das variáveis da coleta, e a nota de cada data é uma fotografia).

## 4. As fotografias datadas (histórico)

Tabelas de versões, só leitura, nunca fonte de cálculo:

| Tabela | O que guarda | Quando |
|---|---|---|
| `exame_resultado` | `cliente_id`, `em`, as respostas da época e os seis scores | a cada "SALVAR" do exame |
| `coleta_versao` | `coleta_id`, `em`, o `submissao` inteiro | ao finalizar a coleta (e a cada finalização nova) |
| `planejamento_versao` | `cliente_id`, `versao`, `em`, `nome` ("Versão 1", "Entrega do relatório"), o plano inteiro | "Versão final" e "Salvar status atual" no portal (hoje `versoes/<id>` no armazém) |
| `proposta` | `cliente_id`, `em`, `itens[]` (o que o cliente propôs), a resposta do consultor a cada item | a área do cliente grava; o consultor responde (hoje `propostas/<id>`) |
| `cenario` | cópias do plano com nome, até três por plano | ficam só no navegador do consultor (`nl-cenarios`); podem ir para o banco como `planejamento_cenario` |

Regras de ouro para quem implementa:

1. **Uma variável, um lugar.** O campo da coleta é a fonte; o plano lê dele por `origem.coleta.campos`. Mudou na coleta
   (reabrir a reunião), regenera a parte do plano que veio dela sem mexer no que o consultor decidiu. Mudou no portal
   um campo que veio da coleta (o portal mostra "veio da coleta"), a coleta é atualizada também: é a mesma variável.
2. **Abrir não grava.** O portal só grava o que o consultor mudou; a coleta grava rascunho a cada pausa (1,5 s), como hoje.
3. **Nada de JSON em arquivo.** O que troca entre coleta, portal e área do cliente passa pela API, como o `/montagemController`
   de hoje; "Exportar JSON" é só para levar um plano de um ambiente a outro.
4. **O cliente de teste nunca é real.** O código de cliente vem do `/internal`; a coleta e o plano são sempre do cliente da sessão.
