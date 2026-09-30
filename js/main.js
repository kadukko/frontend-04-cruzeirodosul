// Ponto de entrada da SPA: registra as rotas e inicia os módulos globais.

import { iniciarRouter } from './modules/router.js';
import { iniciarUI, atualizarContador } from './modules/ui.js';
import { listarCadastros } from './modules/storage.js';
import { inicio } from './paginas/inicio.js';
import { projetosPagina } from './paginas/projetos.js';
import { cadastro } from './paginas/cadastro.js';
import { meusCadastros } from './paginas/meus-cadastros.js';

// Tabela de rotas: nome no hash -> configuração da página
const rotas = {
  inicio,
  projetos: projetosPagina,
  cadastro,
  'meus-cadastros': meusCadastros,
  404: { template: '404', titulo: 'Página não encontrada' }
};

iniciarUI();

// Mantém o contador do menu sincronizado com o localStorage
atualizarContador(listarCadastros().length);
document.addEventListener('cadastros:alterados', (e) => atualizarContador(e.detail.total));
// Sincroniza entre abas abertas do mesmo site
window.addEventListener('storage', () => atualizarContador(listarCadastros().length));

iniciarRouter(document.getElementById('app'), rotas);
