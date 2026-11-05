// Gera VARIAVEIS-BANCO.md a partir do esquema.js: a tabela de variáveis para o programador (o que é cada uma, o tipo,
// onde cai no plano e como tratar no banco). Rode `node coleta/gerar-tabela.js` sempre que mudar o esquema.
const fs = require('fs'), path = require('path');
const { ESQUEMA, TIPOS } = require('./esquema.js');

const esc = s => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const tipoDe = c => (c.op && (c.t === 'select' || c.t === 'multi') ? TIPOS[c.t].rotulo + ': ' + c.op.join(', ') : TIPOS[c.t].rotulo);
const bancoDe = c => (c.t === 'select' ? 'varchar(60); valores: ' + c.op.map(o => '`' + o + '`').join(', ') : c.t === 'multi' ? TIPOS.multi.banco + '; valores: ' + c.op.map(o => '`' + o + '`').join(', ') : TIPOS[c.t].banco) + (c.ob ? '; **not null** ao finalizar' : '');
const origemDe = c => c.exame ? 'Exame (pergunta ' + c.exame + ', a resposta em `exame.respostas`) → coleta (o detalhado)' : c.novo ? 'Coleta (**novo**)' : 'Coleta';

let out = [];
out.push('# Variáveis da coleta e do plano: tipo e tratamento no banco');
out.push('');
out.push('Gerado por `node coleta/gerar-tabela.js` a partir de `coleta/esquema.js` (a parte 1) e escrito à mão (as partes 2 a 4).');
out.push('Para o programador que vai levar a versão nova para a plataforma. Data: ' + new Date().toISOString().slice(0, 10) + '.');
out.push('');
out.push('## Como ler');
out.push('');
out.push('- **Camadas.** Exame (o questionário de saúde financeira, amplo), coleta (a reunião, profunda), consultor (o que ele decide na');
out.push('  montagem) e calculada (sai das outras). A resposta do exame, o campo da coleta e o campo do plano que dizem a mesma coisa são');
out.push('  **uma variável só**: a camada mais funda vale, a mais rasa vira cálculo dela (`COLETA.md`, "uma mudança recalcula tudo").');
out.push('- **O que gravar.** Só as variáveis de origem (exame, coleta, consultor). As calculadas (idade, totais, notas, status, aportes');
out.push('  necessários, CET, saldo projetado) **não vão para o banco**: o motor recalcula a cada abertura. O que precisa ficar na história');
out.push('  (a nota do exame numa data, a versão final de um plano apresentado) é uma **fotografia datada**, numa tabela de versões, e não é fonte de nada.');
out.push('- **Rastreio.** Cada variável de origem guarda de onde veio (`origem`: exame, coleta, consultor ou proposta do cliente) e quando');
out.push('  mudou (`atualizado_em`, `atualizado_por`). O plano gerado da coleta leva `origem.coleta.campos` (caminho no plano → `name` na coleta).');
out.push('- **Tipos.** `name` é o nome do campo na coleta de produção (o mesmo no POST `/planejamentoController`). R$ em `decimal(14,2)`;');
out.push('  % em `decimal(5,2)` de 0 a 100; mês em `AAAA-MM`; datas em `date`; opções fixas em `varchar` com os valores listados (ou enum).');
out.push('  Sim/Não é `boolean` com `null` = não respondido. Todo campo da coleta é nulo até ser respondido: o rascunho grava parcial.');
out.push('- **Novo.** Os campos marcados **novo** não existem na coleta de produção: são a proposta desta versão (`COLETA-E-MONTAGEM.md` diz o porquê de cada um).');
out.push('- **Onde a coleta grava.** A coleta nova é o próprio portal no modo coleta (`tela-consultor.html?coleta`): cada campo grava direto no');
out.push('  caminho da coluna "Onde cai no plano", no mesmo documento do plano que a montagem abre. Não há tabela de coleta separada do plano');
out.push('  nem cópia: o `name` serve para migrar as coletas já feitas em produção (`coleta/plano.js`). Os fatos que nenhuma conta usa ficam');
out.push('  em `coleta.*` dentro do plano (perfil, diagnóstico, dados pessoais, outros ativos, apólices, documentos, tarefas, anotações); o detalhe de um item que já existe no plano (o tipo e a observação do bem, a categoria do objetivo, o detalhe do fundo de pensão) fica no próprio item.');
out.push('');
out.push('## 1. A coleta: ' + ESQUEMA.secoes.length + ' seções');
out.push('');
out.push('Tabela principal `coleta` (uma linha por coleta: `id`, `cliente_id`, `consultor_id`, `status` rascunho|finalizado, `criado_em`, `atualizado_em`, `finalizado_em`),');
out.push('com os campos soltos como colunas (ou um JSONB `respostas` com o `name` como chave, como o `submissao` de hoje) e uma tabela filha por lista');
out.push('(`coleta_id`, `ordem`, e os campos do item). A ordem dos itens importa nas listas de objetivos (é a prioridade do cliente).');
out.push('');
let total = 0, novos = 0;
ESQUEMA.secoes.forEach(sec => {
  out.push('### ' + sec.num + ' ' + sec.titulo);
  out.push('');
  out.push('| Variável (`name`) | O que é | Tipo | Origem | Onde cai no plano | No banco |');
  out.push('|---|---|---|---|---|---|');
  sec.itens.forEach(it => {
    if (it.lista) {
      out.push('| **`' + it.lista + '`** ' + (it.novo ? '**novo**' : '') + ' | **' + esc(it.r) + '**' + (it.ajuda || it.motivo ? ' — ' + esc(it.ajuda || it.motivo) : '') + ' | lista | ' + (it.novo ? 'Coleta (**novo**)' : 'Coleta') + ' | ' + esc(it.plano) + ' | tabela filha `' + it.tabela + '` (`coleta_id`, `ordem`)' + (it.naoPossui ? '; a marca `' + it.naoPossui + '` é boolean na `coleta`' : '') + (it.se ? '; só se `' + it.se[0] + '` = ' + it.se[1] : '') + ' |');
      it.campos.forEach(c => { total++; if (c.novo || it.novo) novos++; out.push('| ↳ `' + c.n + '` | ' + esc(c.r) + (c.ajuda || c.motivo ? ' — ' + esc(c.ajuda || c.motivo) : '') + (c.se ? ' (só se `' + c.se[0] + '` = ' + c.se[1] + ')' : '') + ' | ' + esc(tipoDe(c)) + ' | ' + origemDe(c) + ' | ' + esc(c.plano) + ' | ' + esc(bancoDe(c)) + ' |'); });
    } else {
      total++; if (it.novo) novos++;
      out.push('| `' + it.n + '` | ' + esc(it.r) + (it.ajuda || it.motivo ? ' — ' + esc(it.ajuda || it.motivo) : '') + (it.se ? ' (só se `' + it.se[0] + '` = ' + it.se[1] + ')' : '') + ' | ' + esc(tipoDe(it)) + ' | ' + origemDe(it) + ' | ' + esc(it.plano) + ' | ' + esc(bancoDe(it)) + ' |');
    }
  });
  out.push('');
});
out.push('### Fora das seções');
out.push('');
out.push('| Variável (`name`) | O que é | Tipo | Origem | Onde cai no plano | No banco |');
out.push('|---|---|---|---|---|---|');
ESQUEMA.soltos.forEach(c => { total++; out.push('| `' + c.n + '` | ' + esc(c.r) + (c.ajuda ? ' — ' + esc(c.ajuda) : '') + ' | ' + esc(tipoDe(c)) + ' | Coleta | ' + esc(c.plano) + ' | ' + esc(bancoDe(c)) + ' |'); });
out.push('| `nomeCliente` | Nome do cliente | texto | Cadastro da plataforma | `name` | não é da coleta: vem de `cliente.nome` |');
out.push('| `status` | Situação da coleta | opções: rascunho, finalizada | Coleta | `coleta.status` (vazio = rascunho) | varchar(12); o botão "Finalizar a coleta" grava `finalizada` |');
out.push('| — | Dia em que a coleta foi finalizada | data | Coleta | `coleta.finalizadaEm` ("AAAA-MM-DD") | date; aparece no rodapé da montagem |');
out.push('| `<lista>NaoPossui` | "O cliente não tem" de uma lista vazia (compromissos, participações, bens, outros ativos, dívidas, fundo de pensão, previdência aberta, seguro de vida, seguro de acidentes, plano de saúde, responsabilidade civil, tarefas) | Sim/Não | Coleta | `coleta.naoTem.<compromissos, participacoes, bens, outrosAtivos, dividas, fechada, aberta, vida, acidentes, saude, terceiros, tarefas>` | boolean; com um item na lista, a marca não vale |');
out.push('');
out.push('**Total:** ' + total + ' variáveis na coleta, ' + novos + ' delas novas (campos marcados novo e os das listas novas); as outras ' + (total - novos) + ' são os campos da coleta de produção (o inventário de 09/10/2026 conta 211 porque conta de outro jeito as caixas de marcar e os pares protegido/detalhe; nenhum campo foi removido).');
out.push('');

// ---- partes 2 a 4: o plano (camada consultor), as calculadas e as fotografias
out.push(fs.readFileSync(path.join(__dirname, 'VARIAVEIS-BANCO-plano.md'), 'utf8'));

fs.writeFileSync(path.join(__dirname, 'VARIAVEIS-BANCO.md'), out.join('\n'));
console.log('VARIAVEIS-BANCO.md:', total, 'variáveis da coleta (', novos, 'novas )');
