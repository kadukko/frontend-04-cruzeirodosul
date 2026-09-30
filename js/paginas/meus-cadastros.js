// Página Meus cadastros: lista, busca e exclusão dos registros do localStorage.

import { listarCadastros, removerCadastro, limparCadastros } from '../modules/storage.js';
import { itemCadastro } from '../modules/componentes.js';
import { confirmar, mostrarToast } from '../modules/ui.js';
import { recarregar } from '../modules/router.js';

const normalizar = (t) => String(t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const meusCadastros = {
  template: 'meus-cadastros',
  titulo: 'Meus cadastros',

  dados() {
    const total = listarCadastros().length;
    return { total, vazio: total === 0 };
  },

  montar(raiz) {
    const lista = raiz.querySelector('[data-componente="lista-cadastros"]');
    if (!lista) return null; // estado vazio: nada a montar

    const busca = raiz.querySelector('#busca-cadastros');
    const semResultados = raiz.querySelector('[data-sem-resultados]');
    const totalEl = raiz.querySelector('[data-total]');
    const controle = new AbortController();

    function exibir() {
      const todos = listarCadastros();
      if (!todos.length) { recarregar(); return; } // re-renderiza no estado vazio
      const termo = normalizar(busca.value);
      const filtrados = todos.filter((c) => normalizar(`${c.nome} ${c.email}`).includes(termo));
      lista.innerHTML = filtrados.map(itemCadastro).join('');
      semResultados.hidden = filtrados.length > 0;
      totalEl.textContent = todos.length;
    }

    busca.addEventListener('input', exibir, { signal: controle.signal });

    raiz.addEventListener('click', async (e) => {
      const excluir = e.target.closest('[data-acao="excluir"]');
      if (excluir) {
        const ok = await confirmar('Excluir cadastro', 'Esta ação não pode ser desfeita. Deseja continuar?', 'Excluir');
        if (!ok) return;
        removerCadastro(excluir.dataset.id);
        mostrarToast('Cadastro excluído.');
        exibir();
        return;
      }
      if (e.target.closest('[data-acao="limpar-tudo"]')) {
        const ok = await confirmar('Excluir todos os cadastros', 'Todos os cadastros salvos neste navegador serão apagados.', 'Excluir todos');
        if (!ok) return;
        limparCadastros();
        mostrarToast('Todos os cadastros foram excluídos.');
        exibir();
      }
    }, { signal: controle.signal });

    exibir();
    return () => controle.abort();
  }
};
