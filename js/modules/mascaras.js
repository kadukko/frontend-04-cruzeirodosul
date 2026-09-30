// Máscaras de entrada (CPF, telefone e CEP). Funções puras, fáceis de testar.

export const somenteDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

export const mascaras = {
  cpf(v) {
    v = somenteDigitos(v).slice(0, 11);
    return v
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  },
  telefone(v) {
    v = somenteDigitos(v).slice(0, 11);
    if (v.length > 10) return v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    return v
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  },
  cep(v) {
    v = somenteDigitos(v).slice(0, 8);
    return v.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
  }
};

/** Aplica as máscaras aos campos com atributo data-mascara dentro de `raiz`. */
export function aplicarMascaras(raiz) {
  raiz.querySelectorAll('[data-mascara]').forEach((campo) => {
    const mascara = mascaras[campo.dataset.mascara];
    if (!mascara) return;
    campo.addEventListener('input', () => { campo.value = mascara(campo.value); });
  });
}
