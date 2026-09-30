// Página Cadastro: validação com feedback, rascunho automático e gravação no localStorage.
// Também atende à edição de um cadastro existente (#/cadastro?editar=<id>).

import { estados, projetos, tiposParticipacao } from '../data/dados.js';
import { aplicarMascaras } from '../modules/mascaras.js';
import { regrasCadastro, validarDados, exibirErro, limparErros } from '../modules/validacao.js';
import * as storage from '../modules/storage.js';
import { abrirModal, mostrarToast } from '../modules/ui.js';
import { navegar } from '../modules/router.js';
import { dataLimiteIdade, tempoRelativo } from '../modules/datas.js';
import { escapar } from '../modules/template.js';

const CAMPOS = ['nome', 'email', 'cpf', 'telefone', 'nascimento', 'cep', 'endereco', 'cidade',
  'estado', 'tipo', 'projeto', 'disponibilidade', 'mensagem', 'termos'];

/** Lê os valores do formulário e devolve um objeto simples. */
function coletar(form) {
  const fd = new FormData(form);
  const dados = Object.fromEntries(CAMPOS.map((c) => [c, (fd.get(c) ?? '').toString().trim()]));
  dados.termos = form.termos.checked;
  if (form.id.value) dados.id = form.id.value;
  return dados;
}

/** Preenche o formulário a partir de um objeto (rascunho, edição ou parâmetros da URL). */
function preencher(form, dados) {
  CAMPOS.forEach((c) => {
    const valor = dados[c];
    if (valor === undefined || valor === null) return;
    if (c === 'termos') form.termos.checked = Boolean(valor);
    else if (c === 'tipo') form.querySelectorAll('[name="tipo"]').forEach((r) => { r.checked = r.value === valor; });
    else if (form[c]) form[c].value = valor;
  });
}

export const cadastro = {
  template: 'cadastro',
  titulo: 'Cadastro',

  dados(params) {
    const registro = params.editar ? storage.obterCadastro(params.editar) : null;
    return {
      registro: registro ?? {},
      editando: Boolean(registro),
      titulo: registro ? 'Editar cadastro' : 'Cadastro de voluntários e doadores',
      textoBotao: registro ? 'Salvar alterações' : 'Enviar cadastro',
      dataMaxima: dataLimiteIdade(18),
      estados, projetos, tiposParticipacao
    };
  },

  montar(raiz, params) {
    const form = raiz.querySelector('#form-cadastro');
    const resumo = raiz.querySelector('#resumo-erros');
    const status = raiz.querySelector('#status-rascunho');
    const contador = raiz.querySelector('#contador-mensagem');
    const blocoHoras = raiz.querySelector('[data-somente-voluntario]');
    const controle = new AbortController();
    const opts = { signal: controle.signal };
    const ctx = { cpfDuplicado: storage.cpfJaCadastrado };
    let timerRascunho;

    const editando = params.editar ? storage.obterCadastro(params.editar) : null;
    if (params.editar && !editando) mostrarToast('Cadastro não encontrado. Iniciando um novo.', 'info');

    aplicarMascaras(form);

    /* ----- Preenchimento inicial ----- */
    if (editando) {
      preencher(form, editando);
    } else {
      const rascunho = storage.lerRascunho();
      if (rascunho) {
        preencher(form, rascunho);
        status.hidden = false;
        status.innerHTML = `Rascunho recuperado (salvo ${escapar(tempoRelativo(rascunho.salvoEm))}).
          <button type="button" class="link-botao" data-acao="descartar-rascunho">Descartar rascunho</button>`;
      }
      // Parâmetros vindos de outros botões do site (ex.: "Quero ser voluntário")
      if (params.tipo && !form.querySelector('[name="tipo"]:checked')) preencher(form, { tipo: params.tipo });
      if (params.projeto && !form.projeto.value) preencher(form, { projeto: params.projeto });
    }

    /* ----- Comportamentos dinâmicos ----- */
    function atualizarHoras() {
      const tipo = form.querySelector('[name="tipo"]:checked')?.value;
      const precisa = tipo === 'voluntario' || tipo === 'ambos';
      blocoHoras.classList.toggle('campo--oculto', tipo === 'doador');
      form.disponibilidade.required = precisa;
      if (tipo === 'doador') { form.disponibilidade.value = ''; exibirErro(form, 'disponibilidade', ''); }
    }

    function atualizarContador() {
      const n = form.mensagem.value.length;
      contador.textContent = `${n}/500 caracteres`;
      contador.classList.toggle('contador-caracteres--limite', n > 450);
    }

    function validarCampo(nome) {
      const dados = coletar(form);
      const msg = regrasCadastro[nome]?.(dados[nome] ?? '', dados, ctx) ?? '';
      exibirErro(form, nome, msg);
      return !msg;
    }

    function agendarRascunho() {
      if (editando) return; // na edição, só salva ao confirmar
      clearTimeout(timerRascunho);
      timerRascunho = setTimeout(() => {
        const { termos, id, ...dados } = coletar(form);
        if (storage.salvarRascunho(dados)) {
          status.hidden = false;
          status.textContent = 'Rascunho salvo automaticamente.';
        }
      }, 500);
    }

    atualizarHoras();
    atualizarContador();

    /* ----- Eventos ----- */
    // blur não "borbulha"; focusout sim, então um listener no form atende todos os campos
    form.addEventListener('focusout', (e) => {
      const campo = e.target;
      if (!campo.name || campo.type === 'radio' || campo.type === 'hidden') return;
      campo.classList.add('tocado');
      validarCampo(campo.name);
    }, opts);

    form.addEventListener('input', (e) => {
      const campo = e.target;
      if (campo.classList.contains('tocado')) validarCampo(campo.name);
      if (campo.name === 'mensagem') atualizarContador();
      agendarRascunho();
    }, opts);

    form.addEventListener('change', (e) => {
      if (e.target.name === 'tipo') {
        atualizarHoras();
        validarCampo('tipo');
        if (form.disponibilidade.classList.contains('tocado')) validarCampo('disponibilidade');
      }
      if (e.target.name === 'termos') validarCampo('termos');
      agendarRascunho();
    }, opts);

    raiz.addEventListener('click', (e) => {
      // Clique em um item do resumo de erros leva ao campo
      const link = e.target.closest('[data-ir-para]');
      if (link) {
        e.preventDefault();
        form.querySelector(`[name="${link.dataset.irPara}"]`)?.focus();
        return;
      }
      if (e.target.closest('[data-acao="descartar-rascunho"]')) {
        storage.limparRascunho();
        form.reset();
      }
    }, opts);

    form.addEventListener('reset', () => {
      // Aguarda o navegador limpar os campos antes de atualizar a interface
      setTimeout(() => {
        limparErros(form);
        resumo.hidden = true;
        if (!editando) {
          storage.limparRascunho();
          status.hidden = true;
        } else {
          preencher(form, editando);
        }
        atualizarHoras();
        atualizarContador();
      });
    }, opts);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const dados = coletar(form);
      const erros = validarDados(dados, regrasCadastro, ctx);

      // Atualiza o feedback de todos os campos de uma vez
      Object.keys(regrasCadastro).forEach((nome) => exibirErro(form, nome, erros[nome] ?? ''));
      form.querySelectorAll('input, select, textarea').forEach((c) => c.classList.add('tocado'));

      const nomes = Object.keys(erros);
      if (nomes.length) {
        resumo.hidden = false;
        resumo.querySelector('.alerta__conteudo p').textContent =
          `Encontramos ${nomes.length} campo(s) com problema:`;
        resumo.querySelector('.resumo-erros__lista').innerHTML = nomes
          .map((n) => `<li><a href="#" data-ir-para="${n}">${escapar(erros[n])}</a></li>`)
          .join('');
        resumo.focus();
        mostrarToast('Não foi possível enviar. Verifique os campos.', 'erro');
        return;
      }

      resumo.hidden = true;
      const botao = form.querySelector('button[type="submit"]');
      botao.classList.add('carregando');
      botao.setAttribute('aria-busy', 'true');

      // Simula o tempo de envio a um servidor
      setTimeout(() => {
        const { termos, ...registro } = dados;
        const salvo = storage.salvarCadastro({ ...registro, aceitouTermos: termos });
        botao.classList.remove('carregando');
        botao.removeAttribute('aria-busy');

        if (!salvo) {
          mostrarToast('Não foi possível salvar no navegador. Verifique se o armazenamento está habilitado.', 'erro');
          return;
        }

        if (editando) {
          mostrarToast('Cadastro atualizado!');
          navegar('meus-cadastros');
          return;
        }

        form.reset(); // também descarta o rascunho (ver evento reset)
        mostrarToast('Cadastro enviado com sucesso!');
        abrirModal({
          titulo: 'Cadastro recebido!',
          html: `<div class="alerta alerta--sucesso"><span class="alerta__icone" aria-hidden="true">✔</span>
            <p class="alerta__conteudo">Obrigado, ${escapar(salvo.nome.split(' ')[0])}! Nossa equipe entrará em contato em breve.</p></div>`,
          acoes: [
            { texto: 'Ver meus cadastros', classe: 'botao--secundario', href: '#/meus-cadastros' },
            { texto: 'Fazer outro cadastro', classe: 'botao--contorno' }
          ]
        });
      }, 800);
    }, opts);

    return () => {
      controle.abort();
      clearTimeout(timerRascunho);
    };
  }
};
