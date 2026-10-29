# Dificuldades do cenário 01 (Beatriz Almeida)

Plano gravado em `ux/auditoria/planos/plano-01.json`; extrato em `ux/auditoria/extratos/extrato-01.json` (harness rodou sem erro; liberdade financeira aos 55,0 anos, mês 221).
Relógio do plano: `inicio: "2026-10-10"`, para o mês 0 ser outubro/2026 (out/2027 = mês 12, out/2029 = 36, out/2034 = 96, out/2036 = 120, INSS aos 65 = mês 341).

## (a) Como traduzi

| Realidade da cliente | Onde / como lancei |
|---|---|
| Beatriz, 36 anos, nasceu em mar/1990, solteira, sem filhos | `name`, `nascimento: "1990-03"`, `age: 36`, `tipo: "individual"` (sem `conjuge*`) |
| Sócia-administradora | `profissao`, `natureza: "Empresário"` |
| Pró-labore líquido R$ 14.000/mês | `incomes[]` `prolabore`: `origin "Pró-labore"`, mensal, dia 5, `steps [{from 0, value 14000}]`, `taxable true`, sem `gross` |
| Lucros R$ 30.000 em março e R$ 30.000 em setembro, livres de imposto | `incomes[]` `lucros`: `origin "Distribuição de lucros"`, `frequency "anual"`, `dates [{m:2,d:20},{m:8,d:20}]` (m = mês base 0), `taxable false`, `steps [{0, 30000},{96, 0}]` (zera na venda da agência) |
| Aluguel + condomínio R$ 4.200 | `expenses[]` `moradia`, `group "fix"`, `endObj: "apto"` (termina na compra do apartamento) |
| Plano de saúde R$ 1.100 | `expenses[]` `saude`, fixa |
| Mercado 2.200 / transporte 900 / lazer e viagens 1.800 / diversos 1.300 | `expenses[]` `mercado`, `transporte`, `lazer`, `diversos`, `group "adj"`, `week 0` (total do mês = R$ 11.500) |
| Investimentos R$ 350.000 em um banco de investimento | `patrimonio.financeiro[0]`: "Banco de investimento", 350000, titular; `initialWealth: 350000` |
| Reserva de emergência R$ 70.000 (CDB liquidez diária) | `politica.reserva: 70000` e `riscos.liquidez.d0: 70000` (D+0). É só rótulo/caixinha: não bloqueia o dinheiro na simulação |
| R$ 20.000 separados para o sabático | `objectives[sabatico].dedicated: 20000` |
| Participação de 40% na agência, R$ 400.000 | `patrimonio.participacoes[0]`: `valor 400000`; `partValue: 400000` |
| Valuation de R$ 1,2 mi (a fatia) em 2032, depois +3% ao ano real | `valorizacao: [{tipo:"alvo", em:72, valor:1200000}, {tipo:"taxa", pct:3, de:72, anos:2}]` (a taxa não tem efeito, ver dificuldade 1) |
| Venda em out/2034 por R$ 1,5 mi, 2% de assessoria e R$ 165 mil de imposto | `participacoes[0].venda: {em:96, preco:1500000, custos:[{nome:"Assessoria jurídica", pct:2},{nome:"Imposto sobre o ganho de capital", valor:165000}]}`; líquido calculado R$ 1.305.000 |
| R$ 600 mil da venda vão para o apartamento; o resto livre | `venda.destinos: [{objetivo:"apto", valor:600000}]` (o resto de R$ 705.000 vai ao financeiro, como o motor descreve no marco) |
| Sabático, 6 meses de viagem a partir de out/2027, R$ 60.000, risco moderado | `objectives[sabatico]`: `kind "consumo"`, `months 12`, `amount 60000`, `profile "moderado"`, `planned` = necessário (R$ 3.181), `segueNecessario true` |
| MBA R$ 120.000 em out/2029, só junta a partir de out/2027, risco moderado | `objectives[mba]`: `months 36`, `amount 120000`, `aporteDe 12`, `dedicated 0`, `moderado`, `planned` R$ 4.774 |
| Apartamento à vista R$ 900.000 em out/2036, risco agressivo | `objectives[apto]`: `kind "bem"`, `months 120`, `amount 900000`, `profile "agressivo"`, `planned` R$ 1.432 (resto depois dos R$ 600 mil da venda) |
| Parar de trabalhar aos 55, viver até os 90 | `retireAge 55`, `lifeExp 90` |
| R$ 16.000/mês em valores de hoje | `desired 16000`, `mode "desej"` |
| INSS R$ 6.500 aos 65 | `passive[]`: "INSS", `net 6500`, `startMi 341`, `dur null`, `pessoa "titular"` |
| Sem dívidas, sem bens | `patrimonio.bens []`, `dividas []`, `initialBens 0`, `dividas 0` |

## (b) Dificuldades

1. **Valorização da agência incoerente com o preço de venda.**
   - Cliente: fatia vale R$ 1,2 mi em 2032, "depois" cresce 3% ao ano real, e vende em 2034 por R$ 1,5 mi. 1,2 mi a 3% ao ano por 2 anos dá cerca de R$ 1,27 mi, não R$ 1,5 mi (seriam cerca de 11,8% ao ano).
   - Sistema: `alvo` + `taxa` + `venda.preco`. O preço de venda vira outro `alvo` no mês 96, e a taxa só vale depois do último alvo, então a de 3% é ignorada.
   - Aproximação: lancei os três como ditos. O motor segue de R$ 1,2 mi (mês 72) a R$ 1,5 mi (mês 96) em ritmo constante. Distorção da série: baixa para o resultado (a venda sai pelos R$ 1,5 mi que ela declarou); a taxa de 3% é letra morta.
   - Tipo: DADO FALTANDO / inconsistente do cliente (o consultor precisaria perguntar qual vale). Também COMPORTAMENTO SURPREENDENTE: a taxa digitada some sem aviso quando há venda com preço.

2. **O que a Beatriz faz entre a venda (2034) e a aposentadoria (2045), e durante o sabático.**
   - Cliente: não diz se mantém pró-labore depois de vender a parte (aos 44 anos), nem se recebe pró-labore nos 6 meses de sabático.
   - Sistema: renda é uma linha com degraus; não há "evento de vida" ligado à venda da participação.
   - Aproximação: lucros zeram no mês da venda (acompanham a participação); pró-labore de R$ 14.000 segue até os 55 e também durante o sabático. Distorção: potencialmente alta (R$ 14 mil/mês por 11 anos de renda que pode não existir; é cerca de R$ 1,8 mi nominais). Tipo: DADO FALTANDO do cliente, e LACUNA (a venda da participação não encerra a renda que vinha dela; o consultor tem de lembrar de zerar a linha à mão, e o link entre as duas coisas é só por mês).

3. **Sabático de 6 meses vira uma saída única no mês 12.**
   - Cliente: 6 meses de viagem a partir de out/2027, R$ 60.000.
   - Sistema: objetivo de consumo é um gasto de uma vez só na data (`out_obj_` no mês 12); custos recorrentes só vêm depois da realização, e não existe "gasto distribuído em N meses".
   - Aproximação: um pagamento de R$ 60.000 em out/2027. Distorção: pequena no total, mas o desembolso real é diluído em out/2027 a mar/2028. Tipo: LACUNA.

4. **Risco "moderado" do sabático e do MBA quase não vale.**
   - Cliente: aceita risco moderado nos dois; agressivo no apartamento "enquanto o prazo for longo".
   - Sistema: nos 24 últimos meses antes da data a caixinha vai para a conservadora (0,4%/mês), automaticamente. O sabático (12 meses) fica todo na conservadora; o MBA (36) só tem 12 meses no moderado; o apartamento troca para conservadora em out/2034, 24 meses antes.
   - Aproximação: registrei o perfil pedido; o motor ignora no que cabe. Distorção: o campo "profile" do sabático não tem efeito algum, e a cliente lê "moderado" na tela. Tipo: COMPORTAMENTO SURPREENDENTE (a regra está no código; a tela do consultor mostra o perfil escolhido, não o efetivo).

5. **"R$ 600 mil vão para o apartamento" vira R$ 600 mil que rendem.**
   - Cliente: dos R$ 1,5 mi, R$ 600.000 vão ao apartamento.
   - Sistema: o valor do destino fica na caixinha do objetivo do mês 96 ao 120 e rende (agressivo 0,6%/mês e depois conservador 0,4%). A caixinha chega a R$ 789 mil no mês 96 (inclui R$ 185 mil de aportes anteriores, ver abaixo) e a R$ 900 mil no 120. O aporte necessário caiu para R$ 1.432/mês.
   - Aproximação: aceitei o aporte calculado. Distorção: o plano diz que o apartamento "quase se paga sozinho"; a cliente imaginou R$ 600 mil de lá + R$ 300 mil de outro lugar. Tipo: COMPORTAMENTO SURPREENDENTE (o destino é um valor semente, não um limite do que sai da venda).

6. **Aporte dos objetivos: a cliente não disse quanto guarda por mês.**
   - Cliente: só dá datas e valores.
   - Sistema: exige `planned`.
   - Aproximação: `segueNecessario: true` com `planned = ceil(required)`, como o portal faz (R$ 3.181, 4.774, 1.432). A sobra média da cliente é cerca de R$ 7.500/mês (14.000 + 5.000 de lucro médio − 11.500); os aportes somam R$ 4.613 no primeiro ano (sabático + apartamento) e R$ 6.206 de out/2027 a out/2029 (MBA + apartamento), então cabem sem corte. Aportei o apartamento desde o mês 0, o que ela não pediu (ela só disse que o MBA começa em out/2027). Tipo: DADO FALTANDO do cliente e CAMPO CONFUSO (`planned`, `aporteDe`, `dedicadoEm`, `segueNecessario` só se descobrem lendo o código; o README não explica `segueNecessario`).

7. **Imposto sobre o ganho de capital: valor fixo.**
   - Cliente: R$ 165 mil (15% sobre ganho de R$ 1,1 mi; base R$ 400 mil).
   - Sistema: `custos` aceita `pct` ou `valor`. Usei `valor 165000` e `pct 2` para o jurídico.
   - Distorção: nenhuma na venda; mas se o preço mudar o imposto não acompanha, e o IR do ganho não tem campo próprio com alíquota e custo de aquisição. Tipo: LACUNA leve.

8. **Aluguel + condomínio e a compra do apartamento.**
   - Cliente: paga R$ 4.200 de aluguel e condomínio; ao comprar, deixa de pagar aluguel; mas o apartamento próprio tem condomínio e IPTU (valor não informado).
   - Sistema: `endObj` encerra a linha inteira; o custo do bem entra como `costs` do objetivo.
   - Aproximação: a linha toda termina no mês 120 e não incluí condomínio/IPTU do novo apartamento (cliente não deu). Distorção: subestima o custo de vida a partir de 2036 em um valor que não sei estimar sem inventar. Tipo: DADO FALTANDO do cliente e LACUNA (aluguel e condomínio vêm juntos na fala dela e não dá para separar).

9. **Reserva de emergência e "separado só para o sabático" dentro dos R$ 350 mil.**
   - Cliente: dos R$ 350 mil, R$ 70 mil são reserva e R$ 20 mil são do sabático.
   - Sistema: só uma instituição "Banco de investimento" sem composição; a reserva vira `politica.reserva` e `riscos.liquidez.d0`, e o separado vira `dedicated` do objetivo. A reserva não é bloqueada na simulação (é só uma caixinha da política; neste plano o cofre nunca chegou perto de R$ 70 mil). Distorção: nenhuma numérica, mas a classe de ativo (renda fixa e fundos) não tem onde ser dita sem montar carteira. Tipo: CAMPO CONFUSO (reserva e liquidez aparecem em três lugares: `politica.reserva`, `riscos.reserva.atual`, `riscos.liquidez`).

10. **Liberdade financeira "forçada" apesar de o patrimônio crescer até os 90.**
    - Cliente: quer R$ 16.000/mês dos 55 aos 90, com INSS de R$ 6.500 aos 65.
    - Sistema/motor: no mês 221 o motor marca `ff.forced = true` e `sustentavel = R$ 14.553` ("Requer revisão: sustenta R$ 14.553, não R$ 16.000"). O teste é uma perpetuidade (`patrimônio × 0,4% >= maior lacuna mensal`) e ignora o INSS e o horizonte finito até os 90. Mas na simulação o patrimônio financeiro vai de R$ 3,64 mi (aos 55) a R$ 5,9 mi (aos 90).
    - Aproximação: nenhuma, não mexi. Distorção: a tela dirá "não sustenta" quando o próprio extrato mostra que sobra muito. Tipo: COMPORTAMENTO SURPREENDENTE.

11. **Gastos na aposentadoria são reescalados para R$ 16.000, inclusive o plano de saúde.**
    - Cliente: quer R$ 16.000 "para viver", em valores de hoje.
    - Motor: depois da liberdade, todas as despesas são multiplicadas por 16.000 ÷ custo de vida do momento (R$ 7.300, sem aluguel); mercado vai a R$ 4.822 (era 2.200), saúde a R$ 2.411 (era 1.100), transporte a R$ 1.973. Não dá para dizer que R$ 16.000 inclui moradia própria.
    - Distorção: o total bate com o desejado; a composição é fictícia. Tipo: COMPORTAMENTO SURPREENDENTE.

12. **Idade de aposentadoria e prazos: "55 anos (daqui a 19)".**
    - Ela nasceu em mar/1990; aos 55 será mar/2045, daqui a 18,4 anos, não 19. Usei 55 anos (mês 221). Distorção: sete meses. Tipo: DADO FALTANDO / imprecisão da cliente. O INSS aos 65 caiu no mês 341 (mar/2055).

13. **INSS: líquido ou bruto?**
    - Cliente: "estima INSS de R$ 6.500". O sistema pede `gross`, `tax`, `net`. Lancei `net 6500`, `gross 6500`, `tax 0`. O INSS tem teto por volta de R$ 8.500 e é tributado; não sei se a estimativa é líquida. Tipo: DADO FALTANDO.

14. **Pró-labore sem bruto.**
    - O IR e as telas do tributário pedem `gross` do pró-labore; a cliente só deu o líquido. Deixei sem `gross`, `taxable true`. Tipo: DADO FALTANDO (só afeta a tela de IR/sócios, não o fluxo).

15. **Campos do portal fora deste cenário e que não preenchi.**
    - `riscos`, `experiencia`, `diagnostico`, `tributario`, `orcamento`, `videos`, `consultor`, seguros e coberturas: a conversa não deu nada. Deixei fora. Não validei se a tela do cliente abre bem sem esses blocos; o harness só roda o motor. Tipo: DADO FALTANDO.

16. **Formato de `dates` em renda anual não está claro.**
    - Descobri no código que `dates: [{m, d}]` usa `m` com base 0 (março = 2) e que, em renda anual com `dates`, o primeiro degrau define quando começa. Não há exemplo disso no `plano-exemplo.json`. Tipo: FORMATO NÃO DOCUMENTADO (tentei conferir no extrato: lucros caem nos meses 5, 11, 17, ... = mar e set).

## (c) Premissas que assumi

- Hoje = outubro/2026 (`inicio 2026-10-10`), pelo "daqui a 12 meses = out/2027" da cliente.
- Pró-labore de R$ 14.000 continua até os 55 anos, inclusive depois da venda da agência e durante o sabático (dificuldade 2). Lucros acabam com a venda.
- Rentabilidade real: perfis padrão da ferramenta (conservador 0,4%, moderado 0,5%, agressivo 0,6% ao mês) e 0,4%/mês na liberdade. Cliente não deu retorno esperado.
- Aportes dos objetivos = o necessário (`segueNecessario`), sem dividir por prioridade; o apartamento recebe aportes desde o mês 0.
- Condomínio/IPTU do apartamento comprado: zero (não informado).
- INSS R$ 6.500 líquido, em valores de hoje, aos 65 anos.
- Despesas da cliente são constantes em valores de hoje (nenhum degrau); lucros e pró-labore também (sem reajuste real).
- A cliente não paga imposto sobre o rendimento dos investimentos (a ferramenta trabalha em retorno real líquido).

## (d) Coisas estranhas que notei no resultado

- **Mês 0**: despesas "adj" aparecem a 75% (mercado R$ 1.650 em vez de R$ 2.200) e sem aluguel nem pró-labore; é o mês parcial (início em 10/out), mas parece um erro de leitura para quem olha o extrato.
- **Mês 96 (out/2034)**: `mov_obj_apto = 601.432` (R$ 600.000 da venda + R$ 1.432 de aporte); caixinha do apartamento sobe a R$ 789.220 (de R$ 185.366 no mês 95), e R$ 706.068 entram no cofre (R$ 705.000 + sobra do mês). Venda líquida R$ 1.305.000 conferida (1,5 mi − 30 mil − 165 mil).
- **Mês 120 (out/2036)**: a caixinha do apartamento chega a R$ 900.373,56, compra-se o bem por R$ 900.000 (`mov_bens`) e o excedente volta ao cofre. Esperado (aporte arredondado para cima). O aluguel já não aparece no mês 120.
- **Mês 12 (out/2027)**: sabático retira `mov_obj_sabatico = −60.036,92` e `out_obj_sabatico = 60.000`; sobra R$ 36,92 de rendimento no mês, que volta ao cofre. Em mar-set/2027 e mar/2028 os lucros entram (meses 5, 11, 17).
- **Mês 36 (out/2029)**: MBA retira R$ 120.187,78 da caixinha e paga R$ 120.000; os R$ 188 voltam ao cofre. O objetivo mostra `projected` 120.004 e `real` 120.188: dois números para o mesmo saldo, sem explicação.
- **Mês 221 (mar/2045)**: liberdade aos 55,003 anos com patrimônio financeiro de R$ 3.638.141; `forced: true`, `sustentavel` R$ 14.553 contra R$ 16.000 (dificuldade 10). `cost: 0` (sem renda contratada).
- **Meses 221 a 340**: `mov_cofre = −16.000` por mês, saldo financeiro cai de R$ 3,63 mi a R$ 3,50 mi (mês 300) e depois sobe: no mês 400 R$ 3,69 mi; no 648 (aos 90) R$ 5,90 mi. Isto não parece um plano apertado.
- **Meses 221+**: `out_fix_saude` R$ 2.411 (era R$ 1.100); mercado R$ 4.822 (era R$ 2.200) — a reescala descrita na dificuldade 11.
- O extrato vai até o mês 761 (cerca de 99 anos) apesar de `lifeExp 90`: a simulação segue normalmente depois dos 90 (patrimônio de R$ 6,7 mi no mês 700). Não é erro, mas `lifeExp` não limita o horizonte.
