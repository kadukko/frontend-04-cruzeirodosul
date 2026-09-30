// Componentes de interface compartilhados: menu responsivo, dropdown, modal e toast.
// Como o cabeçalho e o modal ficam fixos na "casca" da SPA, os eventos são
// registrados uma única vez (em iniciarUI) e continuam valendo em todas as rotas.

import { escapar } from './template.js';

const MQ_DESKTOP = window.matchMedia('(min-width: 1024px)');
let toggle, menu, fundo, botoesSubmenu;
let ultimoFoco = null;

/* ---------- Menu mobile ---------- */
export function definirMenu(aberto) {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', String(aberto));
  toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  menu.classList.toggle('aberto', aberto);
  fundo?.classList.toggle('visivel', aberto);
  if (aberto) menu.querySelector('a, button')?.focus();
}

function fecharSubmenus() {
  botoesSubmenu.forEach((b) => {
    b.parentElement.classList.remove('aberto');
    b.setAttribute('aria-expanded', 'false');
  });
}

/** Fecha menu e submenus (chamado pelo roteador a cada troca de página). */
export function fecharNavegacao() {
  definirMenu(false);
  fecharSubmenus();
}

/** Marca no menu o item da rota atual (aria-current). */
export function marcarRotaAtiva(rota) {
  document.querySelectorAll('.menu [data-rota]').forEach((el) => {
    if (el.dataset.rota === rota) el.setAttribute('aria-current', 'page');
    else el.removeAttribute('aria-current');
  });
}

/* ---------- Modal ---------- */
const modal = () => document.getElementById('modal-global');

/**
 * Abre o modal global com conteúdo dinâmico.
 * @param {{titulo: string, html: string, acoes?: {texto: string, classe?: string, href?: string, aoClicar?: Function}[]}} opcoes
 */
export function abrirModal({ titulo, html, acoes = [{ texto: 'Fechar', classe: 'botao--contorno' }] }) {
  const m = modal();
  const conteudo = m.querySelector('.modal__conteudo');
  conteudo.innerHTML = `<h2 id="modal-global-titulo">${escapar(titulo)}</h2>${html}<div class="grupo-botoes modal__acoes"></div>`;

  const areaAcoes = conteudo.querySelector('.modal__acoes');
  acoes.forEach((acao) => {
    const el = document.createElement(acao.href ? 'a' : 'button');
    el.className = `botao ${acao.classe ?? ''}`.trim();
    el.textContent = acao.texto;
    if (acao.href) el.href = acao.href;
    else el.type = 'button';
    el.addEventListener('click', () => {
      acao.aoClicar?.();
      fecharModal();
    });
    areaAcoes.appendChild(el);
  });

  ultimoFoco = document.activeElement;
  m.classList.add('aberto');
  m.removeAttribute('aria-hidden');
  document.body.classList.add('sem-rolagem');
  m.querySelector('.modal__caixa').focus();
}

export function fecharModal() {
  const m = modal();
  if (!m.classList.contains('aberto')) return;
  m.classList.remove('aberto');
  m.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('sem-rolagem');
  if (ultimoFoco && document.contains(ultimoFoco)) ultimoFoco.focus();
}

/** Modal de confirmação que devolve uma Promise<boolean>. */
export function confirmar(titulo, mensagem, textoConfirmar = 'Confirmar') {
  return new Promise((resolver) => {
    let resposta = false;
    abrirModal({
      titulo,
      html: `<p>${escapar(mensagem)}</p>`,
      acoes: [
        { texto: textoConfirmar, classe: 'botao--perigo', aoClicar: () => { resposta = true; } },
        { texto: 'Cancelar', classe: 'botao--contorno' }
      ]
    });
    // Resolve quando o modal fechar (por botão, ESC ou clique fora)
    const observador = new MutationObserver(() => {
      if (!modal().classList.contains('aberto')) {
        observador.disconnect();
        resolver(resposta);
      }
    });
    observador.observe(modal(), { attributes: true, attributeFilter: ['class'] });
  });
}

/* ---------- Toast ---------- */
export function mostrarToast(mensagem, tipo = 'sucesso') {
  const area = document.querySelector('.toast-area');
  if (!area) return;
  const toast = document.createElement('div');
  toast.className = `toast${tipo === 'erro' ? ' toast--erro' : ''}${tipo === 'info' ? ' toast--info' : ''}`;
  toast.setAttribute('role', 'status');
  const icone = { erro: '✖', info: 'i' }[tipo] ?? '✔';
  toast.innerHTML = `<span aria-hidden="true">${icone}</span><p></p>
    <button type="button" class="toast__fechar" aria-label="Fechar notificação">×</button>`;
  toast.querySelector('p').textContent = mensagem;
  area.appendChild(toast);

  const remover = () => {
    toast.classList.add('saindo');
    setTimeout(() => toast.remove(), 300);
  };
  toast.querySelector('.toast__fechar').addEventListener('click', remover);
  setTimeout(remover, 5000);
}

/* ---------- Contador de cadastros no menu ---------- */
export function atualizarContador(total) {
  const el = document.querySelector('[data-contador-cadastros]');
  if (!el) return;
  el.hidden = total === 0;
  el.textContent = total;
  el.setAttribute('aria-label', `${total} cadastro(s)`);
}

/* ---------- Registro dos eventos globais ---------- */
export function iniciarUI() {
  toggle = document.querySelector('.menu-toggle');
  menu = document.getElementById('menu-principal');
  fundo = document.querySelector('.menu-fundo');
  botoesSubmenu = document.querySelectorAll('.menu__item--dropdown > button');

  toggle?.addEventListener('click', () => definirMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  fundo?.addEventListener('click', () => definirMenu(false));

  botoesSubmenu.forEach((botao) => {
    botao.addEventListener('click', () => {
      const item = botao.parentElement;
      const aberto = !item.classList.contains('aberto');
      item.classList.toggle('aberto', aberto);
      botao.setAttribute('aria-expanded', String(aberto));
    });
  });

  // Fecha o dropdown ao clicar fora (desktop)
  document.addEventListener('click', (e) => {
    if (!MQ_DESKTOP.matches) return;
    botoesSubmenu.forEach((b) => {
      if (!b.parentElement.contains(e.target)) {
        b.parentElement.classList.remove('aberto');
        b.setAttribute('aria-expanded', 'false');
      }
    });
  });

  MQ_DESKTOP.addEventListener('change', (mq) => { if (mq.matches) definirMenu(false); });

  // Modal: fechar pelo fundo ou botão × e manter o foco dentro (focus trap)
  const m = modal();
  m.addEventListener('click', (e) => {
    if (e.target === m || e.target.closest('[data-fechar-modal]')) fecharModal();
  });
  m.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focaveis = m.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focaveis.length) return;
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
  });

  // ESC fecha modal, depois submenus e o menu mobile
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (m.classList.contains('aberto')) { fecharModal(); return; }
    fecharSubmenus();
    if (menu?.classList.contains('aberto')) { definirMenu(false); toggle.focus(); }
  });
}
