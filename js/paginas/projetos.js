// Página Projetos: cartões gerados por template + filtro por categoria + modal "Como doar".

import { categorias, projetos } from '../data/dados.js';
import { cartaoProjeto, htmlComoDoar } from '../modules/componentes.js';
import { abrirModal } from '../modules/ui.js';

export const projetosPagina = {
  template: 'projetos',
  titulo: 'Projetos sociais',
  dados: () => ({ categorias }),

  montar(raiz, params) {
    const lista = raiz.querySelector('[data-componente="lista-projetos"]');
    const semResultados = raiz.querySelector('[data-sem-resultados]');
    const botoes = raiz.querySelectorAll('[data-filtro]');

    function exibir(filtro) {
      const filtrados = filtro === 'todos' ? projetos : projetos.filter((p) => p.categoria === filtro);
      lista.innerHTML = filtrados.map(cartaoProjeto).join('');
      semResultados.hidden = filtrados.length > 0;
      botoes.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === filtro)));
    }

    // AbortController remove os listeners quando o usuário sai da página
    // (o elemento #app é reaproveitado entre as rotas)
    const controle = new AbortController();

    // Delegação de eventos: um único listener atende todos os botões da página
    raiz.addEventListener('click', (e) => {
      const filtro = e.target.closest('[data-filtro]');
      if (filtro) { exibir(filtro.dataset.filtro); return; }

      if (e.target.closest('[data-acao="como-doar"]')) {
        abrirModal({
          titulo: 'Como fazer sua doação',
          html: htmlComoDoar,
          acoes: [
            { texto: 'Ir para o cadastro', classe: 'botao--secundario', href: '#/cadastro?tipo=doador' },
            { texto: 'Fechar', classe: 'botao--contorno' }
          ]
        });
      }
    }, { signal: controle.signal });

    // Link do submenu (ex.: ?secao=titulo-educacao) já abre filtrado na categoria
    const categoria = categorias.find((c) => c.ancora === params.secao);
    exibir(categoria ? categoria.id : 'todos');

    return () => controle.abort();
  }
};
