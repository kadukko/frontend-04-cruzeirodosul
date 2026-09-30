// Página Início: dados do template + animação dos números de impacto.

import { instituicao, pilares, estatisticas } from '../data/dados.js';
import { listarCadastros } from '../modules/storage.js';

const formatar = new Intl.NumberFormat('pt-BR');

export const inicio = {
  template: 'inicio',
  titulo: 'Início',
  dados: () => ({ instituicao, pilares, estatisticas, totalCadastros: listarCadastros().length }),

  montar(raiz) {
    const numeros = raiz.querySelectorAll('[data-contar]');
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const quadros = new Set();

    const animar = (el) => {
      const final = Number(el.dataset.contar);
      if (reduzido) { el.textContent = formatar.format(final); return; }
      const inicioT = performance.now();
      const duracao = 1200;
      const passo = (agora) => {
        const p = Math.min((agora - inicioT) / duracao, 1);
        el.textContent = formatar.format(Math.round(final * (1 - (1 - p) ** 3)));
        if (p < 1) quadros.add(requestAnimationFrame(passo));
      };
      quadros.add(requestAnimationFrame(passo));
    };

    // Só anima quando os números aparecem na tela
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) { animar(e.target); observador.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    numeros.forEach((n) => observador.observe(n));

    // Função de limpeza chamada pelo roteador ao sair da página
    return () => {
      observador.disconnect();
      quadros.forEach(cancelAnimationFrame);
    };
  }
};
