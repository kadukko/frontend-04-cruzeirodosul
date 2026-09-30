// Testes automatizados das funções puras (validação, máscaras, templates e datas).
// Rodam no navegador (abra testes.html) ou no terminal: node js/testes/testes.js

import { cpfValido, emailValido, telefoneValido, cepValido, validarDados, regrasCadastro } from '../modules/validacao.js';
import { mascaras } from '../modules/mascaras.js';
import { renderizar, escapar } from '../modules/template.js';
import { calcularIdade, dataLimiteIdade, formatarData } from '../modules/datas.js';

const resultados = [];
function teste(descricao, fn) {
  try {
    fn();
    resultados.push({ descricao, ok: true });
  } catch (erro) {
    resultados.push({ descricao, ok: false, erro: erro.message });
  }
}
function igual(obtido, esperado) {
  if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
    throw new Error(`esperado ${JSON.stringify(esperado)}, obtido ${JSON.stringify(obtido)}`);
  }
}

/* ---------- Validação ---------- */
teste('CPF válido é aceito', () => igual(cpfValido('529.982.247-25'), true));
teste('CPF com dígito errado é rejeitado', () => igual(cpfValido('529.982.247-24'), false));
teste('CPF com dígitos repetidos é rejeitado', () => igual(cpfValido('111.111.111-11'), false));
teste('CPF incompleto é rejeitado', () => igual(cpfValido('529.982'), false));
teste('E-mail válido', () => igual(emailValido('ana@ong.org.br'), true));
teste('E-mail sem domínio é rejeitado', () => igual(emailValido('ana@'), false));
teste('Celular com 11 dígitos é aceito', () => igual(telefoneValido('(61) 98765-4321'), true));
teste('Fixo com 10 dígitos é aceito', () => igual(telefoneValido('(61) 3000-0000'), true));
teste('DDD inexistente é rejeitado', () => igual(telefoneValido('(01) 98765-4321'), false));
teste('Celular sem o 9 inicial é rejeitado', () => igual(telefoneValido('(61) 88765-4321'), false));
teste('CEP no formato correto', () => igual(cepValido('70000-000'), true));
teste('CEP zerado é rejeitado', () => igual(cepValido('00000-000'), false));

teste('Nome exige sobrenome', () => igual(regrasCadastro.nome('Maria'), 'Informe nome e sobrenome.'));
teste('Menor de 18 anos é rejeitado', () => {
  igual(regrasCadastro.nascimento(dataLimiteIdade(17)), 'É necessário ter pelo menos 18 anos.');
});
teste('Quem faz 18 anos hoje é aceito', () => igual(regrasCadastro.nascimento(dataLimiteIdade(18)), ''));
teste('Horas obrigatórias só para voluntários', () => {
  igual(regrasCadastro.disponibilidade('', { tipo: 'doador' }), '');
  igual(regrasCadastro.disponibilidade('', { tipo: 'voluntario' }) !== '', true);
});
teste('Horas fora do intervalo 1–40 são rejeitadas', () => {
  igual(regrasCadastro.disponibilidade('41', { tipo: 'ambos' }), 'Informe um número inteiro entre 1 e 40.');
});
teste('Formulário completo não gera erros', () => {
  const dados = {
    nome: 'Maria Souza', email: 'maria@exemplo.com', cpf: '529.982.247-25', telefone: '(61) 98765-4321',
    nascimento: '1990-05-10', cep: '70000-000', endereco: 'Rua A, 10', cidade: 'Brasília', estado: 'DF',
    tipo: 'voluntario', disponibilidade: '4', termos: true
  };
  igual(validarDados(dados), {});
});
teste('CPF duplicado é detectado via contexto', () => {
  const ctx = { cpfDuplicado: (cpf) => cpf === '529.982.247-25' };
  igual(regrasCadastro.cpf('529.982.247-25', {}, ctx), 'Já existe um cadastro com este CPF neste navegador.');
});

/* ---------- Máscaras ---------- */
teste('Máscara de CPF', () => igual(mascaras.cpf('52998224725'), '529.982.247-25'));
teste('Máscara de CPF ignora letras e excesso', () => igual(mascaras.cpf('529a98224725999'), '529.982.247-25'));
teste('Máscara de celular', () => igual(mascaras.telefone('61987654321'), '(61) 98765-4321'));
teste('Máscara de fixo', () => igual(mascaras.telefone('6130000000'), '(61) 3000-0000'));
teste('Máscara de CEP', () => igual(mascaras.cep('70000000'), '70000-000'));

/* ---------- Templates ---------- */
teste('Interpolação simples', () => igual(renderizar('Olá, {{nome}}!', { nome: 'Ana' }), 'Olá, Ana!'));
teste('Caminho aninhado', () => igual(renderizar('{{a.b}}', { a: { b: 1 } }), '1'));
teste('Escape contra XSS', () => igual(renderizar('{{x}}', { x: '<img onerror=1>' }), '&lt;img onerror=1&gt;'));
teste('HTML confiável com três chaves', () => igual(renderizar('{{{x}}}', { x: '<b>ok</b>' }), '<b>ok</b>'));
teste('Laço each com objetos', () => igual(renderizar('{{#each l}}[{{n}}]{{/each}}', { l: [{ n: 1 }, { n: 2 }] }), '[1][2]'));
teste('Laço each com textos ({{this}})', () => igual(renderizar('{{#each l}}[{{this}}]{{/each}}', { l: ['a', '<b>'] }), '[a][&lt;b&gt;]'));
teste('Condicional if', () => {
  igual(renderizar('{{#if v}}sim{{/if}}', { v: true }), 'sim');
  igual(renderizar('{{#if v}}sim{{/if}}', { v: [] }), '');
});
teste('Blocos aninhados', () => {
  igual(renderizar('{{#each l}}{{#if ok}}{{n}}{{/if}}{{/each}}', { l: [{ n: 1, ok: true }, { n: 2 }] }), '1');
});
teste('Dados do usuário não são reinterpretados como template', () => {
  igual(renderizar('{{#each l}}{{n}}{{/each}}', { l: [{ n: '{{segredo}}' }], segredo: 'X' }), '{{segredo}}');
});
teste('escapar trata aspas', () => igual(escapar(`"'`), '&quot;&#39;'));

/* ---------- Datas ---------- */
teste('Idade antes do aniversário', () => igual(calcularIdade('2000-12-31', new Date(2026, 5, 1)), 25));
teste('Idade no dia do aniversário', () => igual(calcularIdade('2000-06-01', new Date(2026, 5, 1)), 26));
teste('Formatação de data', () => igual(formatarData('1990-05-10'), '10/05/1990'));

/* ---------- Relatório ---------- */
const falhas = resultados.filter((r) => !r.ok);
const resumo = `${resultados.length - falhas.length}/${resultados.length} testes passaram`;

if (typeof document !== 'undefined') {
  document.getElementById('resumo').textContent = resumo;
  document.getElementById('resumo').className = falhas.length ? 'falhou' : 'passou';
  document.getElementById('resultados').innerHTML = resultados
    .map((r) => `<li class="${r.ok ? 'passou' : 'falhou'}">${r.ok ? '✔' : '✖'} ${escapar(r.descricao)}${r.ok ? '' : ` — ${escapar(r.erro)}`}</li>`)
    .join('');
} else {
  resultados.forEach((r) => console.log(`${r.ok ? '✔' : '✖'} ${r.descricao}${r.ok ? '' : ` — ${r.erro}`}`));
  console.log(`\n${resumo}`);
  if (falhas.length) process.exitCode = 1;
}
