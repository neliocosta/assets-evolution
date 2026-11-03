# Dificuldades do cenário 05 (Marcos Pereira)

Plano: `ux/auditoria/planos/plano-05.json`. Extrato: `ux/auditoria/extratos/extrato-05.json`. "Mês N" = meses a partir de hoje (mês 0 = out/2026).

## (a) Como traduzi

| Realidade do cliente | Onde / como lancei |
|---|---|
| Marcos, 58 anos, nascido em 07/1968, divorciado, filha adulta que se sustenta | `name`, `nascimento: "1968-07"`, `age: 58`, `tipo: "individual"`. A filha não entra em lugar nenhum (nem como dependente) |
| "Hoje" é out/2026 (18 meses até abr/2028, 30 até abr/2029) | `inicio: "2026-10-20"` (o padrão do sistema é 19/09/2026, que daria mês 0 = set) |
| Para de trabalhar aos 60 (jul/2028) | `retireAge: 60` |
| Quer R$ 14.000/mês em valores de hoje; vive até 95 | `desired: 14000`, `lifeExp: 95` |
| Salário R$ 11.000 líquidos | `incomes[]` `salario`: `kind: ativa`, `origin: Salário`, `gross: 11000` (bruto não informado), `steps: [{from:0, value:11000}]` |
| Sala comercial rende R$ 3.000 | `incomes[]` `aluguel`: `kind: passiva`, `origin: Aluguéis`, 3000, e `patrimonio.bens[1].renda = "aluguel"` (liga o bem à renda) |
| Despesas R$ 12.500: casa e contas 3.200, saúde 2.600, carro 1.500 | `expenses[]` grupo `fix`, mensais, dia 5 |
| Alimentação 2.400, lazer 1.800, outros 1.000 | `expenses[]` grupo `adj` |
| Consignado R$ 90.000, 72 x R$ 2.337, 1,95% a.m., Price, 48 restantes | `patrimonio.dividas[0]`: `credito 90000`, `parcelas 72`, `restantes 48`, `parcela 2337`, `juros 1.95`, `jurosPeriodo "mes"`, `sistema "price"`, `iof "isento"`, `saldoDevedor 72412` (calculado pelo motor, ver 3), `linha "divconsig"`. Linha "Parcela: Consignado" em `expenses`: 2.337 nos meses 0 a 47, degrau zero no mês 48 |
| Cartão R$ 6.500 em 10 x R$ 780, 7 restantes | `patrimonio.dividas[1]`: `credito 6500`, `parcelas 10`, `restantes 7`, `parcela 780`, `iof "isento"`, `saldoDevedor 4776` (calculado), linha "Parcela: Cartão parcelado" 780 nos meses 0 a 6 |
| Crédito novo R$ 60.000 em abr/2028, 36 x, 2,1% a.m., SAC | `creditos[0]`: `valor 60000`, `em 18`, `parcelas 36`, `juros 2.1`, `sistema "sac"`, `linha "crparc"`. A linha "Parcela: Crédito do banco" foi montada com os degraus do contrato (2.927 caindo até 1.702), como o portal faz |
| Investimentos R$ 780.000, tudo líquido, sem reserva separada | `patrimonio.financeiro[0]` (sem `tipo`) e `initialWealth`. Não criei reserva nem caixinha |
| Casa R$ 1,1 mi quitada; sala R$ 380 mil quitada; carro R$ 60 mil | `patrimonio.bens[]` com `mercado` e `saldoDevedor 0`; `initialBens 1.540.000` |
| 30% da Cantina do Zé, R$ 250.000, perde 10% a.a. por 2,5 anos e fecha em abr/2029 | `patrimonio.participacoes[0]`: `valor 250000`, `valorizacao: [{tipo:"taxa", pct:-10, de:0, anos:2.5}, {tipo:"pontual", em:30, pct:-100}]` |
| O sócio deve R$ 400.000 à sociedade ("não conto") | Não lancei |
| INSS R$ 5.200 a partir dos 65 | `passive[0]`: `net 5200`, `startMi 81` (mês em que ele faz 65: `ceil((65 - 58,30) x 12)`) |
| Sem sonhos além da aposentadoria | `objectives: []` |
| Experiência, riscos, tributário, diagnóstico, consultor | Não preenchi: a conversa não dá |

## (b) Dificuldades

1. **Parcelas que faltam: "24 pagas, 48 restantes" não fecha com a data da 1ª parcela.**
   - Cliente: consignado com 1ª parcela em nov/2024, "24 pagas, 48 restantes". Cartão com 1ª em ago/2026, "3 pagas, 7 restantes". Hoje é out/2026.
   - Sistema: com `inicio` (AAAA-MM) o motor conta as parcelas que faltam incluindo a deste mês, e daria 49 e 8.
   - Aproximação: não usei `inicio`; usei `restantes` 48 e 7 (o que o cliente disse). As linhas terminam nos meses 47 e 6.
   - Distorção: pequena. Perde-se a data da 1ª parcela no cartão da dívida.
   - Tipo: COMPORTAMENTO SURPREENDENTE (a contagem trata a parcela do mês corrente como "a pagar") e CAMPO CONFUSO (`inicio` x `restantes`, sem aviso de qual vale).

2. **IOF somado ao crédito por padrão distorce a taxa e o saldo.**
   - Cliente: consignado de R$ 90.000, parcela R$ 2.337, 1,95% a.m. (as três coisas são coerentes entre si).
   - Sistema: sem `iof` o motor soma IOF ao valor financiado (R$ 3.025 no consignado, R$ 119 no cartão). A parcela informada passa a "mandar" e a taxa deduzida sai 1,83% a.m. (cliente: 1,95%), com saldo de hoje R$ 74.185. O cartão sai 3,10% a.m. (a conta do cliente dá 3,46%) e saldo de R$ 4.841. Nenhum aviso aparece além da diferença entre taxa informada e deduzida.
   - Aproximação: marquei `iof: "isento"` nas duas dívidas (o valor contratado já é o financiado). Com isso a taxa fecha em 1,95% e 3,46%, e o saldo vira R$ 72.412 e R$ 4.776.
   - Distorção: sem o `isento`, o saldo devedor ficaria R$ 1.800 acima. Com ele, nenhuma.
   - Tipo: CAMPO CONFUSO e COMPORTAMENTO SURPREENDENTE (o padrão presume que o IOF ainda não está no valor liberado; quem só tem o contrato do cliente não sabe disso).

3. **Saldo devedor de hoje não foi dado.**
   - Cliente: deu valor contratado, parcelas, parcela e taxa, não o saldo.
   - Sistema: `saldoDevedor` é necessário para a dívida entrar no patrimônio.
   - Aproximação: rodei `contratoDaDivida` e gravei `ct.saldoHoje` arredondado: R$ 72.412 (consignado) e R$ 4.776 (cartão).
   - Distorção: pequena, mas invisível ao cliente (o campo parece "digitado do extrato", mas é calculado).
   - Tipo: DADO FALTANDO do cliente e CAMPO CONFUSO (o portal não calcula o saldo sozinho ao salvar).

4. **13º e bruto não foram dados.** Gerente comercial CLT recebe 13º; o cliente só deu o líquido mensal. Não lancei 13º. O bruto ficou igual ao líquido (afeta IR e INSS). Distorção: o déficit antes da aposentadoria fica superestimado. Tipo: DADO FALTANDO.

5. **Aposentadoria "aos 60" força a liberdade financeira.**
   - Cliente: quer parar aos 60 mesmo que o dinheiro não dure.
   - Sistema: com `retireAge: 60` o evento Liberdade Financeira cai no mês 21 com `forced: true` e `sustentavel: 6.518`. Sem `retireAge` o sistema calcula a primeira idade possível (67,9 anos).
   - Aproximação: `retireAge: 60`, único jeito de refletir o plano do cliente.
   - Distorção: nenhuma na entrada; o resultado é enganoso (ver 6).
   - Tipo: COMPORTAMENTO SURPREENDENTE.

6. **O dinheiro acaba e o sistema não aponta ruína: corta o consumo.**
   - Cliente: quer R$ 14.000/mês até os 95 anos.
   - Sistema: o patrimônio financeiro zera no mês 154 (cerca de 71 anos). `ruina` fica nulo e `cheque` fica 0. Do mês 154 em diante o motor reduz todas as despesas para igualar a renda (R$ 8.200 = INSS 5.200 + aluguel 3.000), e o plano parece fechado até os 95. O alerta de ruína, o crédito sugerido e os juros de 4% ao mês da dívida nunca disparam.
   - Aproximação: nenhuma possível; é resultado.
   - Distorção: grave. O cliente leria um plano "sustentável" que não é. O único sinal é `ff.sustentavel = 6.518`, no objeto `ff`.
   - Tipo: COMPORTAMENTO SURPREENDENTE do motor.

7. **A retirada de R$ 14.000 engole e encolhe as parcelas das dívidas.**
   - Cliente: "R$ 14.000 para viver", sem dizer se inclui as dívidas.
   - Sistema: depois da aposentadoria o motor escala todas as linhas de despesa, parcelas inclusive, para somar `desired`. Mês 22: consignado 1.853 (contrato: 2.337) e crédito novo 2.237 (contrato: 2.927 caindo). Mês 60, dívidas já quitadas: casa 3.584 (cliente: 3.200) e alimentação 2.688 (cliente: 2.400), tudo escalado em 12%.
   - Aproximação: nenhuma; não há como dizer "R$ 14.000 fora as dívidas".
   - Distorção: moderada. As linhas do fluxo mostram valores que não são os do cliente, e as dívidas continuam amortizando pelo contrato (`dividasAvulsas`: consignado zera no mês 48) enquanto o fluxo paga menos que o contrato.
   - Tipo: COMPORTAMENTO SURPREENDENTE e LACUNA do sistema (falta "renda desejada fora as dívidas" ou "parcelas contratuais fixas na liberdade").

8. **Crédito novo condicional.** Cliente: "pretendo pegar se o dinheiro apertar". `creditos[]` é incondicional (cai em abr/2028, mês 18). Lancei como certo. Com ele o dinheiro acaba no mês 154; sem ele, no mês 138. Como a ruína nunca é acusada (item 6), o portal nem sugeriria o crédito. Tipo: LACUNA do sistema.

9. **Participação em queda com fechamento.**
   - Cliente: -10% a.a. por 2,5 anos e fecha no mês 30 (valor zero).
   - Sistema: `taxa` e `pontual`; o pontual aceita `pct` ou `valor`.
   - Aproximação: `pontual` com `pct: -100` no mês 30 (zera sem depender de um valor), em vez de `valor: -400.000`. Confere: mês 12 = 225.000; mês 29 = 193.803; mês 30 em diante = 0.
   - Distorção: nenhuma.
   - Tipo: FORMATO NÃO DOCUMENTADO (`pct: -100` funciona e `anos` aceita fração, mas VARIAVEIS.md não diz).

10. **Dívida do sócio (R$ 400.000).** O cliente disse "não conto". Não lancei. Poderia ser `financeiro` com `tipo: "emprestimo"` (sem liquidez), mas seria inventar um recebível que ele descartou. Tipo: decisão do consultor. O risco de crédito sobre esse ativo não tem onde ser anotado.

11. **Filha adulta e sem reserva.** Não há lugar para "filha independente" sem custo; `riscos.dependentes` ficou vazio. O cliente não separa reserva; `riscos.reserva` e `liquidezIdeal` ficaram vazios. Sem impacto no motor.

12. **Id da linha da parcela sem aviso.** Ao montar a linha da parcela à mão, esqueci o `id` e o motor gerou a chave `out_fix_undefined` sem reclamar. A linha e o `linha` da dívida precisam do mesmo id. Tipo: FORMATO NÃO DOCUMENTADO.

## (c) Premissas que assumi

- Hoje = out/2026 (18 meses até abr/2028 leva a isso); `inicio` 20/10/2026.
- Dia de nascimento = 1 (só se sabe julho/1968), então 60 anos caem em jul/2028, como o cliente diz.
- Salário e INSS de R$ 5.200 tratados como líquidos; INSS em reais de hoje, sem reajuste.
- Rendimento: padrão do sistema (0,4% a.m. conservador), porque o cliente não deu retorno esperado.
- Titularidade de todos os bens: do titular.
- Consignado e cartão: o número de parcelas restantes do cliente vale mais que a data da 1ª parcela; contratos sem IOF adicional.
- Saldos devedores (72.412 e 4.776) calculados pelo motor.
- Crédito novo contratado com certeza em abr/2028.
- Sem 13º, sem bônus, sem aporte (não há objetivo de poupança).
- A dívida do sócio fica fora, como o cliente pediu.

## (d) Coisas estranhas que notei no resultado

- **Ruína ausente (item 6):** `ruina: null`, `cheque: 0` o tempo todo. O financeiro chega a zero no mês 154 e o consumo cai de 14.000 para 8.200 de uma vez.
- **Mês 21 (jul/2028, aposentadoria):** a despesa total vira R$ 14.000 exatos: consignado 1.849 (contrato 2.337) e crédito novo 2.260 (contrato 2.892). O fluxo do mês traz uma chave `out_rendas: 0` que nenhuma linha minha tem.
- **Mês 60:** casa 3.584 e alimentação 2.688 (cliente: 3.200 e 2.400). Todo o consumo cresce 12% sem aviso.
- **Mês 18:** a dívida salta de 53.983 (mês 17) para 112.699 (+ 60.000 do crédito, menos a amortização do mês) e o financeiro sobe de 816.703 para 879.036 (+ 60.000 mais rendimento). O patrimônio líquido não muda na liberação, como deveria.
- **Meses 12, 29 e 30:** participação 225.000, 193.803 e 0. Confere com a conta à mão.
- **Meses 0 a 6 e 7 em diante:** déficit de R$ 1.617 e R$ 837 (com o cartão quitado), como previsto. O consignado termina no mês 47 (última linha) e o cartão no mês 6.
- **Sem aposentadoria fixada:** o motor sugere liberdade financeira só aos 67,9 anos (renda sustentável de R$ 14.041). Mostra o quão distante dos 60 está o que o patrimônio sustenta.
- **Crédito novo:** adia a falta de dinheiro de 138 para 154 meses. Os juros de 4% ao mês nunca aparecem, porque a reserva nunca fica negativa (o consumo é cortado antes).
