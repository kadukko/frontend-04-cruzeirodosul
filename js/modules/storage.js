// Camada de persistência com localStorage.
// Todo acesso ao armazenamento passa por aqui: o resto da aplicação
// não precisa saber como (nem onde) os dados são guardados.

const PREFIXO = 'maos-solidarias:';
const CHAVE_CADASTROS = 'cadastros';
const CHAVE_RASCUNHO = 'rascunho-cadastro';

/** Lê e converte um valor JSON. Devolve `padrao` se não existir ou estiver corrompido. */
export function ler(chave, padrao = null) {
  try {
    const bruto = localStorage.getItem(PREFIXO + chave);
    return bruto === null ? padrao : JSON.parse(bruto);
  } catch (erro) {
    console.warn(`[storage] Não foi possível ler "${chave}":`, erro);
    return padrao;
  }
}

/** Salva qualquer valor serializável. Devolve true/false conforme o sucesso. */
export function salvar(chave, valor) {
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    // Ex.: modo privado, cota excedida ou armazenamento bloqueado
    console.warn(`[storage] Não foi possível salvar "${chave}":`, erro);
    return false;
  }
}

export function remover(chave) {
  try { localStorage.removeItem(PREFIXO + chave); } catch { /* ignora */ }
}

/** Avisa o restante da aplicação que a lista de cadastros mudou. */
function notificar() {
  document.dispatchEvent(new CustomEvent('cadastros:alterados', { detail: { total: listarCadastros().length } }));
}

/* ---------- Repositório de cadastros (CRUD) ---------- */

export function listarCadastros() {
  const lista = ler(CHAVE_CADASTROS, []);
  return Array.isArray(lista) ? lista : [];
}

export function obterCadastro(id) {
  return listarCadastros().find((c) => c.id === id) ?? null;
}

/** Cria (sem id) ou atualiza (com id) um cadastro. Devolve o registro salvo ou null. */
export function salvarCadastro(dados) {
  const lista = listarCadastros();
  const agora = new Date().toISOString();
  let registro;

  if (dados.id) {
    const i = lista.findIndex((c) => c.id === dados.id);
    if (i === -1) return null;
    registro = { ...lista[i], ...dados, atualizadoEm: agora };
    lista[i] = registro;
  } else {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    registro = { ...dados, id, criadoEm: agora };
    lista.unshift(registro);
  }

  if (!salvar(CHAVE_CADASTROS, lista)) return null;
  notificar();
  return registro;
}

export function removerCadastro(id) {
  const lista = listarCadastros().filter((c) => c.id !== id);
  salvar(CHAVE_CADASTROS, lista);
  notificar();
}

export function limparCadastros() {
  remover(CHAVE_CADASTROS);
  notificar();
}

/** Verifica se já existe cadastro com o mesmo CPF (ignorando o próprio registro na edição). */
export function cpfJaCadastrado(cpf, ignorarId = '') {
  return listarCadastros().some((c) => c.cpf === cpf && c.id !== ignorarId);
}

/* ---------- Rascunho do formulário ---------- */

export const lerRascunho = () => ler(CHAVE_RASCUNHO);
export const salvarRascunho = (dados) => salvar(CHAVE_RASCUNHO, { ...dados, salvoEm: new Date().toISOString() });
export const limparRascunho = () => remover(CHAVE_RASCUNHO);
