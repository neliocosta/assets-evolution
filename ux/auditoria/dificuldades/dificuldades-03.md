# Dificuldades do cenário 03: Jorge e Marta (aposentados com sobra, padaria à venda, ajuda ao filho)

Plano gravado em `ux/auditoria/planos/plano-03.json`; extrato em `ux/auditoria/extratos/extrato-03.json` (harness rodou sem erro: 343 meses, 3 objetivos, liberdade aos 71,5 anos, sem ruína).

Aviso de método: ao ler o cenário com um limite de linhas, o arquivo inteiro veio na tela e eu vi, sem querer, a seção "Para o auditor" (valores esperados). Montei o plano só com a conversa do cliente e conferi o extrato contra a conta que fiz à mão a partir dos dados do cliente, mas o consultor "puro" não teria visto aquela seção. Pese isso ao ler a parte (d).

## (a) Como traduzi

| Realidade do cliente | Onde / como lancei (caminho no plano) |
|---|---|
| Jorge, 71 anos, nasc. abril/1955; Marta, 69, nasc. agosto/1957; casal | `name`, `nascimento: 1955-04-15`, `conjugeNascimento: 1957-08-15`, `conjugeNome`, `tipo: familia`, `age: 71`, `spouseAge: 69` |
| Hoje = outubro/2026 (os "meses" do cliente contam daí) | `inicio: 2026-10-14` (mês 0 do motor = out/2026) |
| Já pararam de trabalhar | `retireAge: 71`, `spouseRetireAge: 69` (= as idades de hoje; a liberdade nasce no mês 1) |
| Renda desejada R$ 20.000 em valores de hoje | `desired: 20000`, `desiredSteps: []`, `mode: desej` |
| Ele vive até 95, ela até 97 | `lifeExp: 99` (só há uma expectativa, na idade do titular; 99 do Jorge = 97 da Marta) e a morte do Jorge aos 95 vira o fim de duas rendas (ver abaixo) |
| INSS do Jorge R$ 9.400 | `passive[0]`: origin INSS, net 9400, `startMi: 0`, `dur: 282`, pessoa titular |
| INSS da Marta R$ 4.100 | `passive[1]`: origin INSS, net 4100, `startMi: 0`, `dur: null`, pessoa conjuge |
| Fundo de pensão do Jorge R$ 6.200 (já recebendo) | `passive[2]`: origin Fundo de pensão, net 6200, `startMi: 0`, `dur: 282`, `cost: 0` |
| Reversão de 60% à Marta | `passive[3]`: net 3720 (= 60% de 6.200), `startMi: 282`, vitalícia, pessoa conjuge |
| Aluguel do apartamento R$ 4.500 | `incomes[0]` (id `aluguel`, kind passiva, origin Aluguéis, steps [{0, 4500}]) ligado ao bem por `patrimonio.bens[1].renda = "aluguel"` |
| Investimentos R$ 2.600.000 (R$ 300.000 em liquidez diária) | `patrimonio.financeiro[0]` valor 2600000, titularidade casal; a liquidez em `riscos.liquidez.d0: 300000` |
| Casa própria R$ 1,8 mi, apartamento R$ 750 mil | `patrimonio.bens[0]` e `[1]` (mercado, saldoDevedor 0, titularidade casal) |
| Sítio R$ 900 mil, valoriza 2% a.a. real "para sempre" | `bens[2].valorizacao = [{tipo: taxa, pct: 2, de: 0, anos: 30}]` |
| 30% da Pão Nobre, R$ 500 mil | `patrimonio.participacoes[0]` valor 500000 |
| Venda em abril/2028 por R$ 650 mil, 3% de corretagem | `participacoes[0].venda = {em: 18, preco: 650000, custos: [{nome: Corretagem, pct: 3}]}` |
| R$ 300 mil da venda pagam a adaptação da casa | `venda.destinos = [{objetivo: adaptacao, valor: 300000}]` (o resto do líquido, R$ 330.500, vai ao financeiro) |
| Dívidas: nenhuma | `patrimonio.dividas: []` |
| Despesas R$ 17.000 | 6 linhas em `expenses[]`: Plano de saúde 6.200 (fix), Cuidadora 3.500 (fix), Condomínio/IPTU/contas 2.100 (fix), Alimentação 2.800 (adj), Lazer 1.400 (adj), Transporte 1.000 (adj); todas mensais, dia 10 |
| R$ 24.000 todo abril ao Gustavo, 2027 a 2031 | `expenses[gustavo]`: frequency anual, `dates: [{m: 3, d: 10}]`, steps [{from 6, 24000}, {from 55, 0}] (abril/2027 = mês 6; o último é abril/2031 = mês 54) |
| Bodas de ouro: R$ 40.000 em março/2027, R$ 30.000 já separados | objetivo `bodas`: months 5, amount 40000, dedicated 30000, profile conservador, planned 1865 |
| Adaptação da casa: R$ 300.000 em 30 meses, risco moderado | objetivo `adaptacao`: months 30, amount 300000, dedicated 0, profile moderado, planned 0 (a venda financia) |
| Fundo dos netos: R$ 200.000 em out/2031, R$ 100.000 já separados, 0,7% a.m. | objetivo `netos`: months 60, amount 200000, dedicated 100000, `rateM: 0.007`, profile agressivo, planned 836 |
| Netos (12, 9, 6 anos), filho Gustavo | não há campo útil (o filho adulto não é dependente); só aparecem nos nomes dos objetivos e da linha de despesa |

## (b) Dificuldades

1. **O motor "estica" as despesas do aposentado até gastar toda a renda disponível, e estica junto a ajuda ao Gustavo.**
   - Cliente: gasta R$ 17.000 (mais R$ 24.000 por ano ao filho) e recebe R$ 24.200; quer R$ 20.000 por mês.
   - Sistema: na liberdade financeira o padrão de vida "se ajusta à renda disponível" (`m.scale`).
   - O que fiz: nada além de lançar as linhas reais; não há como desligar.
   - Distorção: grande. No extrato, mês 1 (nov/2026) saem R$ 24.200 (saúde 8.826 em vez de 6.200, cuidadora 4.982 em vez de 3.500...), ou seja, 42% a mais que o real; em abril/2027 (mês 6) a "ajuda ao Gustavo" sai R$ 30.568 em vez de 24.000. A sobra real de R$ 5.200 a R$ 7.200 por mês desaparece do fluxo. O gasto passa de R$ 20.000 desejados mesmo com renda passiva acima deles.
   - Tipo: COMPORTAMENTO SURPREENDENTE do motor.

2. **Os aportes mensais aos objetivos não acontecem para quem já está em liberdade financeira.**
   - Cliente: tem sobra e quer guardar R$ 1.864/mês (bodas) e R$ 836/mês (netos).
   - Sistema: o cartão calcula o aporte necessário e o "planejado", mas na simulação só entra o aporte do mês 0; depois não há mais depósitos (consequência do item 1: `invest = 0`).
   - O que fiz: planned = necessário (1.865 e 836), como o portal faz com "usar o necessário".
   - Distorção: o saldo "real" do fundo dos netos chega a R$ 142.482 em vez de R$ 200.007 projetado e o das bodas a R$ 32.482 em vez de R$ 40.005; a diferença (R$ 57.518 e R$ 7.518) sai da reserva livre na data. O cartão fica "Alcançável com ajustes" (netos 71%, bodas 81%) para uma família com R$ 2,6 milhões. Financeiramente quase neutro, mas o cartão do cliente passa uma imagem falsa de risco.
   - Tipo: COMPORTAMENTO SURPREENDENTE do motor.

3. **Morte/sobrevivência: o plano tem uma só expectativa de vida e nenhuma regra de reversão.**
   - Cliente: ele vive até 95, ela até 97; o fundo paga 60% à Marta depois; INSS do Jorge acaba (e existiria pensão por morte, que o cliente não informou).
   - Sistema: `lifeExp` único (idade do titular); rendas com início e duração por linha.
   - O que fiz: `lifeExp: 99` (cobre a Marta aos 97) e quebrei o fundo e o INSS do Jorge em linhas que acabam no mês 282 (Jorge aos 95), com uma linha nova de R$ 3.720 para a Marta. O INSS do Jorge simplesmente termina.
   - Distorção: moderada. A renda desejada de R$ 20.000 e as despesas não caem depois da morte do Jorge; a pensão por morte do INSS não existe. Tudo é manual e invisível para o cliente (aparece como "Fim: INSS do Jorge · Início: reversão...").
   - Tipo: LACUNA do sistema (casal com idades de vida diferentes, reversão, pensão por morte) e DADO FALTANDO do cliente (regra da pensão por morte e quanto o gasto cai).

4. **"Hoje" muda o mês 0 do motor.**
   - Cliente: "daqui a 18 meses = abril/2028", contando de outubro/2026.
   - Sistema: o mês 0 é o mês do ciclo (dia 5) da semana de hoje. Com `inicio: 2026-10-28` o mês 0 virou novembro/2026, e a venda caiu no mês 17 e as bodas no mês 4; com `inicio: 2026-10-14` o mês 0 é outubro e tudo bate.
   - O que fiz: usei 14/10/2026 como início do desenho.
   - Distorção: nenhuma depois de acertado, mas só descobri rodando o harness; o consultor precisa saber converter "daqui a N meses" em mês do motor e escolher a data de início com cuidado.
   - Tipo: CAMPO CONFUSO / COMPORTAMENTO SURPREENDENTE.

5. **Valorização "para sempre".**
   - Cliente: sítio valoriza 2% a.a. real sem fim.
   - Sistema: `anos` (vazio = 10, e o portal sugere 10); não há "sem prazo".
   - O que fiz: `anos: 30` (o horizonte do motor termina aos 100 anos, ~28,5 anos).
   - Distorção: nenhuma na prática, mas quem deixar o campo vazio vê a valorização parar em 10 anos sem aviso.
   - Tipo: CAMPO CONFUSO.

6. **Despesa pontual anual com fim: não há objetivo recorrente.**
   - Cliente: R$ 24.000 todo abril por 5 anos.
   - Sistema: linha anual no Fluxo com `dates` e degrau final em zero.
   - O que fiz: `frequency: anual`, `dates: [{m: 3, d: 10}]`, degraus 24000 a partir do mês 6 e 0 a partir do mês 55.
   - Distorção: baixa. Foi fácil para quem conhece o motor, mas o formato (`dates` com mês 0 a 11, `from` em meses do motor, degrau 0 como fim) só se aprende lendo o código.
   - Tipo: FORMATO NÃO DOCUMENTADO.

7. **Fundo de pensão já em pagamento, sem saldo.**
   - Cliente: recebe R$ 6.200 vitalícios; não sabe o saldo; reversão 60%.
   - Sistema: o fundo de pensão em `financeiro` (tipo fechada + `conv`) exige saldo > 0 e simula a conversão em renda; o caminho para quem já recebe seria `passive` com origem "Fundo de pensão".
   - O que fiz: `passive` com `cost: 0`. Não há campo de reversão em renda já concedida.
   - Distorção: baixa no valor, mas o motor não sabe que é um fundo de pensão (não aparece como patrimônio nem usa a tábua).
   - Tipo: LACUNA do sistema.

8. **Taxa digitada acima do perfil e prazos de 24 meses.**
   - Cliente: quer 0,7% a.m. no fundo dos netos.
   - Sistema: `rateM: 0.007` vale nos primeiros 36 meses e cai para 0,4% nos últimos 24 (corte conservador). O consultor não vê isso no campo da taxa.
   - O que fiz: `rateM: 0.007`, profile agressivo.
   - Distorção: a promessa do gerente "0,7% sempre" não é respeitada; o motor usa o teto do conservador nos 24 meses finais. Correto como regra de prudência, mas não dito ao cliente nem ao consultor no ponto onde se digita.
   - Tipo: COMPORTAMENTO SURPREENDENTE do motor (regra de negócio).

9. **Patrimônio "já separado" dentro ou fora dos R$ 2,6 milhões?**
   - Cliente: "R$ 30.000 já separados" e "R$ 100.000 separados"; não diz se estão dentro dos R$ 2.600.000.
   - Sistema: `dedicated` sai do financeiro livre (o extrato mostra mov_cofre -130.000 no mês 0).
   - O que fiz: assumi que estão dentro dos R$ 2,6 milhões (premissa).
   - Tipo: DADO FALTANDO do cliente.

10. **Quase nenhum campo da conversa cabe nos blocos de riscos, IR, previdência, experiência.**
    - Cliente: plano de saúde dos dois, cuidadora, idosos, reserva em liquidez diária, filho adulto.
    - Sistema: o plano de saúde tem lugar próprio em `riscos.saude` (prêmio por vida, `linha`), a reserva em `riscos.reserva`/`liquidez`, etc. Não preenchi nada além de `riscos.liquidez.d0`, porque a conversa não dá prêmios por vida, apólices, IR, etc.
    - O que fiz: plano de saúde como linha comum no Fluxo (R$ 6.200) e cuidadora idem.
    - Distorção: o plano de saúde não está ligado ao capítulo de riscos; a cuidadora (gasto de saúde crescente com a idade) não tem tratamento específico.
    - Tipo: LACUNA do sistema / DADO FALTANDO do cliente.

11. **Ajuda ao filho como objetivo × despesa.**
    - Cliente a chama de "sonho 4"; o sistema só tem objetivos com data única.
    - O que fiz: despesa recorrente anual (ver item 6); o cartão do cliente não mostra como sonho.
    - Distorção: o sonho 4 some da lista de objetivos da área do cliente.
    - Tipo: LACUNA do sistema.

12. **Participação com venda: bom encaixe, mas o destino do líquido exige o id do objetivo.**
    - Cliente: vende a parte por R$ 650.000; R$ 300.000 pagam a casa; o resto fica investido.
    - Sistema: `venda.destinos` com `objetivo` = id do objetivo e valor; o id (`adaptacao`) precisa ser combinado à mão ao gravar o JSON.
    - Distorção: nenhuma; o líquido (R$ 630.500) e a divisão (R$ 300.000 / R$ 330.500) saíram certos.
    - Tipo: FORMATO NÃO DOCUMENTADO (a ordem: precisa existir o objetivo com aquele id).

## (c) Premissas que assumi

- Dia do aniversário: 15 (a conversa só dá o mês e o ano).
- Hoje = 14/10/2026 no motor, para que "daqui a 5/18/30/60 meses" caiam em mar/2027, abr/2028, abr/2029 e out/2031.
- Os R$ 130.000 "separados" (bodas e netos) estão dentro dos R$ 2,6 milhões.
- Os valores das rendas são líquidos; lancei bruto = líquido, imposto 0. O aluguel é tributável com bruto = líquido.
- Os R$ 2,6 milhões são um bloco só, do casal, sem divisão por instituição.
- Jorge morre aos 95 (mês 282): o INSS dele e o fundo dele acabam, a Marta passa a receber R$ 3.720 de reversão; nenhuma pensão por morte do INSS (não informada). A renda desejada de R$ 20.000 e as despesas não mudam depois disso.
- `lifeExp: 99` cobre os 97 anos da Marta (idade do titular).
- Sítio: 2% a.a. real por 30 anos (equivale a "para sempre" dentro do horizonte).
- Retorno do financeiro livre: o padrão do motor (0,4% a.m.), sem premissa do cliente. Perfis dos objetivos: bodas conservador (prazo curto), adaptação moderado (dito pelo cliente), netos agressivo com taxa digitada.
- Adaptação da casa e bodas são `consumo` (o dinheiro sai e não vira bem novo); a adaptação não valoriza a casa.
- Aportes planejados = aporte necessário (R$ 1.865 e R$ 836; adaptação 0, porque a venda paga).
- Plano de saúde e cuidadora lançados como despesas fixas sem reajuste acima da inflação.
- Sem IR, sem previdência, sem seguros, sem riscos (a conversa não dá dados).

## (d) Coisas estranhas que notei no resultado

- **Mês 1 (nov/2026)**: despesas somam R$ 24.200 (plano de saúde R$ 8.826 em vez de R$ 6.200; cuidadora R$ 4.982 em vez de R$ 3.500; contas R$ 2.989 em vez de R$ 2.100; alimentação R$ 3.986; lazer R$ 1.993; transporte R$ 1.424). É a renda passiva inteira, e passa dos R$ 20.000 desejados.
- **Mês 6 (abr/2027)**: "ajuda ao Gustavo" sai R$ 30.568 (e não R$ 24.000), e as outras linhas ficam 27% acima (saúde R$ 7.897). Mesmo padrão em abr/2028, 2029, 2030 e 2031 (meses 18, 30, 42, 54). Nos meses 55 em diante o fator volta a 1,42.
- **Mês 282 (abr/2050, Jorge aos 95)**: despesas caem para R$ 20.000 exatos (fator 1,176), com saque da reserva de R$ 7.680 por mês. O evento "Fim: INSS do Jorge · Fim: Fundo de pensão do Jorge · Início: reversão" aparece certo.
- **Mês 0**: movimento de R$ 132.701 saindo do cofre (R$ 130.000 separados mais R$ 1.865 e R$ 836 do primeiro aporte), mas nos meses seguintes não há mais aportes (nenhuma linha `mov_obj_*` positiva entre os meses 1 e 4).
- **Mês 5 (mar/2027)**: as bodas pagam R$ 40.000, dos quais só R$ 32.482 vêm da caixinha; R$ 7.518 saem da reserva livre. O cartão do objetivo diz "projetado R$ 40.005 / real R$ 32.482".
- **Mês 60 (out/2031)**: o fundo dos netos paga R$ 200.000, dos quais R$ 142.482 da caixinha e R$ 57.518 da reserva; projetado R$ 200.007.
- **Mês 30 (abr/2029)**: a caixinha da adaptação devolve R$ 314.669 ao financeiro (projetado R$ 314.721; diferença de R$ 52 entre `projected` e `real`, por arredondamento de meses).
- **Mês 18 (abr/2028)**: a venda entra certa (R$ 650.000 menos R$ 19.500 de corretagem = R$ 630.500; R$ 300.000 para a adaptação e R$ 330.500 para o financeiro). A participação vale R$ 570.088 no mês 9 e R$ 650.000 no mês 18, em ritmo constante.
- **Liberdade financeira**: o extrato marca `ff.age = 71,54` e `ff.mi = 1`, ou seja, "alcançada aos 71,5 anos" para quem já está livre; pode confundir o texto do cliente. `ff.forced = false`, `sustentavel` R$ 22.750.
- O patrimônio financeiro termina (mês 342) em ~R$ 10,1 milhões reais; nunca há ruína, com e sem as despesas esticadas, e cresce porque a sobra nunca é gasta e o retorno real de 4,9% a.a. é alto para o horizonte.
- Se eu tivesse mantido `inicio: 2026-10-28` (primeira tentativa), o mês 0 virava novembro e a venda caía no mês 17: um erro silencioso de um mês.
