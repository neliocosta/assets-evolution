# Revisão de UX da área do cliente (07/10/2026)

Revisão crítica feita por um especialista de UX e design simulado, a pedido do usuário, sobre as telas finais do
cliente (`evolucao-patrimonial.html`): navegação da jornada, capítulos 3 a 6 e o esqueleto dos capítulos 1 e 2.
Critérios: heurísticas de Nielsen, carga cognitiva, hierarquia visual, lei de Fitts e o tom da marca (um número dominante
por cartão, cor só onde informa). Prioridade: **bloqueia** a jornada, **atrapalha** o uso, **acabamento**.

## Primeira impressão

A cliente abre a área e cai na Gestão de riscos (a página padrão), sem saber que existe um livro antes e depois. Cada página
abre com um vídeo que ocupa quase metade da primeira tela, e o conteúdo, que é o que ela veio ver, começa abaixo. Para
avançar, ela volta ao alto e procura uma seta de 28 px dentro de uma pílula no cabeçalho. O sumário mostra 10 páginas
"Página 1.1 … 2.5" que não existem para ela.

## Achados

### Bloqueia

1. **Não há começo nem fim de capítulo (Nielsen 1, visibilidade do estado).** O capítulo só existe como rótulo pequeno
   ("Capítulo 3 · 11 de 17"). A cliente não sabe quantas páginas o capítulo tem, sobre o que ele é, nem quando terminou.
   → Uma **capa** por capítulo: título, uma frase do assunto, o que ela vai ver em cada página (com o resultado principal
   de cada uma) e o botão para começar.
2. **Vídeo repetido em todas as páginas (carga cognitiva, hierarquia).** Cinco a seis vídeos curtos, cada um disputando a
   primeira dobra com o resultado. O usuário já propôs a saída: o vídeo vai para a capa, em dois tempos, o **teórico** (mais
   longo, o mesmo para todos os clientes) e o **do seu caso** (personalizado). As páginas ficam só com o resultado.
3. **Páginas que não existem aparecem na jornada (Nielsen 8, estética e minimalismo).** As 10 páginas de esqueleto dos
   capítulos 1 e 2 entram em "anterior" e "próxima" e no total "17". Para a cliente, isso é ruído e quebra a confiança.
   → Os capítulos ainda vazios aparecem só no sumário, como "em breve", fora da sequência.

### Atrapalha

4. **Avançar exige voltar ao topo (Fitts, fluidez).** Só as páginas de esqueleto tinham "anterior/próxima" no fim. Riscos,
   patrimônio e as tributárias terminam sem saída. → Rodapé de navegação em toda página: "‹ anterior" e "Próximo: título ›"
   (ou "Próximo capítulo: título ›"), com alvo grande.
5. **Sem noção de progresso (Nielsen 1).** "11 de 17" é um número, não um caminho. → Uma barra fina de progresso na pílula
   da página, dividida por capítulo, e o sumário marcando o que já foi visto.
6. **A troca de página é seca e herda a rolagem.** O conteúdo troca de uma vez e, ao voltar a uma página, ela reabre no meio.
   → Entrada suave (opacidade e 8 px de deslocamento, 200 ms, desligada para quem pede menos movimento) e toda página nova
   começa do alto.
7. **Página inicial errada.** Sem histórico, a área abre na Gestão de riscos. → Abre na capa do primeiro capítulo.
8. **Topo das páginas desequilibrado sem o vídeo.** Os cartões de destaque foram desenhados para meia largura. Em largura
   total, o número fica sozinho à esquerda e a teia dos riscos cresce demais. → Destaques em linha: o resultado à esquerda,
   a comparação ("de … para …") ou a teia à direita, com largura máxima.

### Acabamento

9. **Botão "Vídeo" na evolução patrimonial.** Sai junto com os vídeos das páginas; o cabeçalho da evolução fica com um
   controle a menos.
10. **Sumário como lista longa.** Vira um índice por capítulo: número, título, "capa" e páginas, com a página atual e as
    vistas marcadas; capítulos vazios esmaecidos.
11. **Rótulos da pílula.** "Capítulo 3 · 11 de 17" vira "Capítulo 3 · Otimização tributária" (o que importa é onde se está;
    o progresso fica na barra).
12. **Contraste.** Alguns textos informativos em #a9a59d sobre branco (cerca de 2,5:1) ficam abaixo do mínimo de 4,5:1;
    os que carregam informação (faixas de idade da trilha, sumário) escurecem.

## O que fica para depois

- Atalhos de teclado para passar página: as setas já são usadas no gráfico da evolução e no carrossel dos riscos.
- Versão para celular (fora de escopo do protótipo).
- Teste com a persona da cliente (Ana, `ux/personas/`) depois desta rodada, sobretudo a capa: se ela assiste aos dois
  vídeos ou pula para as páginas.
