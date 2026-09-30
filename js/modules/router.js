// Roteador da SPA baseado em hash (#/rota?param=valor).
// O hash funciona em qualquer hospedagem estática (inclusive GitHub Pages),
// pois o navegador nunca envia a parte após "#" ao servidor.

import { carregarTemplate, renderizar } from './template.js';
import { fecharNavegacao, marcarRotaAtiva, mostrarToast } from './ui.js';

const ROTA_PADRAO = 'inicio';
let rotas = {};
let raiz;
let limpezaAtual = null;   // função devolvida pela página anterior (remove timers/listeners)
let navegacaoId = 0;       // evita que uma resposta lenta sobrescreva uma navegação mais nova

/** Converte "#/projetos?secao=x" em { nome: 'projetos', params: { secao: 'x' } }. */
export function lerHash(hash = location.hash) {
  const [caminho, query = ''] = hash.replace(/^#\/?/, '').split('?');
  return {
    nome: caminho || ROTA_PADRAO,
    params: Object.fromEntries(new URLSearchParams(query))
  };
}

export function navegar(nome, params = {}) {
  const query = new URLSearchParams(params).toString();
  location.hash = `#/${nome}${query ? `?${query}` : ''}`;
}

/** Renderiza novamente a rota atual (útil quando os dados mudam sem troca de hash). */
export const recarregar = () => renderizarRota();

async function renderizarRota() {
  const id = ++navegacaoId;
  const { nome, params } = lerHash();
  const rota = rotas[nome] ?? rotas['404'];

  raiz.setAttribute('aria-busy', 'true');
  try {
    const template = await carregarTemplate(rota.template);
    const dados = rota.dados ? await rota.dados(params) : {};
    if (id !== navegacaoId) return; // o usuário já navegou para outra página

    // Desmonta a página anterior antes de trocar o conteúdo
    limpezaAtual?.();
    limpezaAtual = null;

    raiz.innerHTML = renderizar(template, { ...dados, rota: nome });
    raiz.classList.remove('view-entrando');
    void raiz.offsetWidth;            // reinicia a animação de entrada
    raiz.classList.add('view-entrando');

    document.title = `${rota.titulo} | Instituto Mãos Solidárias`;
    marcarRotaAtiva(rota.menu ?? nome);
    fecharNavegacao();

    limpezaAtual = rota.montar?.(raiz, params) ?? null;
    posicionar(params);
  } catch (erro) {
    console.error('[router]', erro);
    raiz.innerHTML = `<section class="secao"><div class="container estado-vazio">
      <h1>Não foi possível carregar a página</h1>
      <p>Abra o projeto por um servidor local (ex.: extensão Live Server) ou pelo GitHub Pages.</p>
    </div></section>`;
    mostrarToast('Erro ao carregar a página.', 'erro');
  } finally {
    raiz.removeAttribute('aria-busy');
  }
}

/** Rola até a seção pedida (?secao=id) ou volta ao topo e move o foco para o título. */
function posicionar(params) {
  const alvo = params.secao && document.getElementById(params.secao);
  if (alvo) {
    alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  window.scrollTo({ top: 0 });
  // Acessibilidade: leitores de tela anunciam a nova página
  const titulo = raiz.querySelector('h1');
  if (titulo) {
    titulo.setAttribute('tabindex', '-1');
    titulo.focus({ preventScroll: true });
  }
}

/** Registra as rotas e começa a escutar mudanças no hash. */
export function iniciarRouter(elementoRaiz, tabelaRotas) {
  raiz = elementoRaiz;
  rotas = tabelaRotas;
  window.addEventListener('hashchange', renderizarRota);

  if (!location.hash) history.replaceState(null, '', `#/${ROTA_PADRAO}`);

  renderizarRota();
}
