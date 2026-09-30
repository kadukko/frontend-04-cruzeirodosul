// Validação de formulários: regras puras (sem DOM) + funções que exibem o feedback.
// Separar "regra" de "exibição" permite testar as regras isoladamente (ver testes.html).

import { somenteDigitos } from './mascaras.js';
import { calcularIdade } from './datas.js';

/* ---------- Regras de consistência (funções puras) ---------- */

export function cpfValido(cpf) {
  const d = somenteDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (let t = 9; t < 11; t++) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += Number(d[i]) * (t + 1 - i);
    const digito = ((soma * 10) % 11) % 10;
    if (digito !== Number(d[t])) return false;
  }
  return true;
}

export const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(email).trim());

export function telefoneValido(tel) {
  const d = somenteDigitos(tel);
  if (d.length !== 10 && d.length !== 11) return false;
  if (Number(d.slice(0, 2)) < 11) return false;          // DDD inexistente
  if (d.length === 11 && d[2] !== '9') return false;     // celular começa com 9
  return true;
}

export const cepValido = (cep) => /^\d{5}-\d{3}$/.test(cep) && !/^0{5}-?0{3}$/.test(cep);

/**
 * Regras do formulário de cadastro. Cada regra recebe (valor, dados) e devolve
 * uma mensagem de erro ou string vazia. `dados` permite regras que dependem de outros campos.
 */
export const regrasCadastro = {
  nome: (v) => {
    const nome = v.trim();
    if (!nome) return 'Informe seu nome completo.';
    if (nome.length < 3) return 'O nome deve ter pelo menos 3 caracteres.';
    if (!/^[A-Za-zÀ-ÿ' -]+$/.test(nome)) return 'Use apenas letras no nome.';
    if (nome.split(/\s+/).length < 2) return 'Informe nome e sobrenome.';
    return '';
  },
  email: (v) => (!v.trim() ? 'Informe seu e-mail.' : !emailValido(v) ? 'Informe um e-mail válido, como nome@exemplo.com.' : ''),
  cpf: (v, dados, ctx = {}) => {
    if (!v) return 'Informe seu CPF.';
    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v)) return 'Complete o CPF no formato 000.000.000-00.';
    if (!cpfValido(v)) return 'CPF inválido. Confira os números digitados.';
    if (ctx.cpfDuplicado?.(v, dados.id)) return 'Já existe um cadastro com este CPF neste navegador.';
    return '';
  },
  telefone: (v) => (!v ? 'Informe um telefone para contato.' : !telefoneValido(v) ? 'Telefone inválido. Use (00) 00000-0000 ou (00) 0000-0000.' : ''),
  nascimento: (v) => {
    if (!v) return 'Informe sua data de nascimento.';
    const idade = calcularIdade(v);
    if (Number.isNaN(idade)) return 'Data inválida.';
    if (idade < 18) return 'É necessário ter pelo menos 18 anos.';
    if (idade > 120) return 'Confira o ano de nascimento.';
    return '';
  },
  cep: (v) => (!v ? 'Informe o CEP.' : !cepValido(v) ? 'CEP inválido. Use o formato 00000-000.' : ''),
  endereco: (v) => (v.trim().length < 5 ? 'Informe o logradouro e o número.' : ''),
  cidade: (v) => (v.trim().length < 2 ? 'Informe a cidade.' : ''),
  estado: (v) => (!v ? 'Selecione o estado.' : ''),
  tipo: (v) => (!v ? 'Escolha como deseja participar.' : ''),
  disponibilidade: (v, dados) => {
    const precisa = dados.tipo === 'voluntario' || dados.tipo === 'ambos';
    if (!v) return precisa ? 'Voluntários devem informar as horas disponíveis.' : '';
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 40) return 'Informe um número inteiro entre 1 e 40.';
    return '';
  },
  termos: (v) => (v ? '' : 'Você precisa aceitar os termos para continuar.')
};

/** Valida todos os campos e devolve um objeto { campo: mensagem } apenas com os erros. */
export function validarDados(dados, regras = regrasCadastro, ctx = {}) {
  return Object.entries(regras).reduce((erros, [campo, regra]) => {
    const msg = regra(dados[campo] ?? '', dados, ctx);
    if (msg) erros[campo] = msg;
    return erros;
  }, {});
}

/* ---------- Exibição do feedback no DOM ---------- */

/** Mostra (ou limpa, se `mensagem` for vazia) o erro de um campo. */
export function exibirErro(form, nome, mensagem) {
  const campos = form.querySelectorAll(`[name="${nome}"]`);
  const alvo = form.querySelector(`#erro-${nome}`);
  campos.forEach((c) => {
    // Sincroniza a validade nativa com a regra JS, para que :invalid/:valid do CSS reflitam o mesmo estado
    c.setCustomValidity(mensagem);
    if (mensagem) c.setAttribute('aria-invalid', 'true');
    else c.removeAttribute('aria-invalid');
    c.classList.toggle('valido', !mensagem && c.type !== 'radio' && c.type !== 'checkbox' && c.value !== '');
  });
  if (alvo) {
    alvo.textContent = mensagem;
    alvo.classList.toggle('visivel', Boolean(mensagem));
  }
}

export function limparErros(form) {
  form.querySelectorAll('.mensagem-erro').forEach((m) => { m.textContent = ''; m.classList.remove('visivel'); });
  form.querySelectorAll('[aria-invalid]').forEach((c) => c.removeAttribute('aria-invalid'));
  form.querySelectorAll('input, select, textarea').forEach((c) => c.setCustomValidity(''));
  form.querySelectorAll('.valido, .tocado').forEach((c) => c.classList.remove('valido', 'tocado'));
}
