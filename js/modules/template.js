// Motor de templates simples, sem dependências.
// Sintaxe suportada nos arquivos de /html:
//   {{caminho.da.chave}}         -> valor com escape de HTML (seguro contra XSS)
//   {{{chave}}}                  -> valor sem escape (apenas para HTML confiável)
//   {{#each lista}} ... {{/each}}-> repete o trecho para cada item (o item vira o contexto)
//   {{#if chave}} ... {{/if}}    -> exibe o trecho se o valor for verdadeiro

const cache = new Map();

/** Escapa caracteres especiais para inserir texto com segurança no HTML. */
export function escapar(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Lê "a.b.c" dentro de um objeto. "this" devolve o próprio contexto. */
function ler(contexto, caminho) {
  if (caminho === 'this') return 'this' in contexto ? contexto.this : contexto;
  return caminho.split('.').reduce((obj, chave) => (obj == null ? undefined : obj[chave]), contexto);
}

/** Processa blocos {{#tipo chave}}...{{/tipo}}, tratando aninhamento corretamente. */
function processarBlocos(texto, dados) {
  const abertura = /{{#(each|if) ([\w.]+)}}/;
  let resultado = '';
  let resto = texto;
  let m;

  while ((m = abertura.exec(resto))) {
    const [marca, tipo, chave] = m;
    resultado += interpolar(resto.slice(0, m.index), dados);

    // Procura o fechamento correspondente contando blocos do mesmo tipo
    const reTag = new RegExp(`{{#${tipo} [\\w.]+}}|{{/${tipo}}}`, 'g');
    reTag.lastIndex = m.index + marca.length;
    let nivel = 1;
    let fim;
    let t;
    while ((t = reTag.exec(resto))) {
      nivel += t[0].startsWith('{{#') ? 1 : -1;
      if (nivel === 0) { fim = t; break; }
    }
    if (!fim) throw new Error(`Template: bloco {{#${tipo} ${chave}}} sem fechamento.`);

    const interno = resto.slice(m.index + marca.length, fim.index);
    const valor = ler(dados, chave);

    if (tipo === 'each') {
      resultado += (Array.isArray(valor) ? valor : [])
        .map((item, indice) => renderizar(interno, {
          ...dados, ...(typeof item === 'object' ? item : {}), this: item, indice
        }))
        .join('');
    } else if (Array.isArray(valor) ? valor.length : valor) {
      resultado += renderizar(interno, dados);
    }
    resto = resto.slice(fim.index + fim[0].length);
  }
  return resultado + interpolar(resto, dados);
}

/** Substitui {{chave}} e {{{chave}}} em um trecho sem blocos. */
function interpolar(texto, dados) {
  return texto
    .replace(/{{{\s*([\w.]+)\s*}}}/g, (_, c) => String(ler(dados, c) ?? ''))
    .replace(/{{\s*([\w.]+)\s*}}/g, (_, c) => escapar(ler(dados, c)));
}

/** Renderiza uma string de template com os dados informados. */
export function renderizar(template, dados = {}) {
  return processarBlocos(template, dados);
}

/** Busca um arquivo de template em /html (com cache em memória). */
export async function carregarTemplate(nome) {
  if (cache.has(nome)) return cache.get(nome);
  const resposta = await fetch(`html/${nome}.html`);
  if (!resposta.ok) throw new Error(`Template "${nome}" não encontrado (${resposta.status}).`);
  const texto = await resposta.text();
  cache.set(nome, texto);
  return texto;
}

/** Converte uma string HTML em nós do DOM. */
export function paraElemento(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content;
}
