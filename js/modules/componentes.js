// Componentes visuais reutilizáveis. Cada componente é uma função que recebe
// dados e devolve HTML gerado a partir de um template.

import { renderizar } from './template.js';
import { nomeCategoria, buscarProjeto, rotuloTipo } from '../data/dados.js';
import { tempoRelativo, formatarDataHora, formatarData } from './datas.js';

const TPL_CARTAO_PROJETO = `
<section aria-labelledby="titulo-{{categoria}}" data-categoria="{{categoria}}" class="cartao-projeto">
  <article class="cartao{{#if urgente}} cartao--destaque{{/if}}">
    <picture class="cartao__imagem">
      <source srcset="imagens/{{imagem}}.webp" type="image/webp">
      <img src="imagens/{{imagem}}.png" alt="{{alt}}" width="400" height="240" loading="lazy">
    </picture>
    <div class="cartao__corpo">
      <ul class="tags" aria-label="Categorias">
        <li><span class="badge badge--{{categoria}}" id="titulo-{{categoria}}">{{nomeCategoria}}</span></li>
        {{#if urgente}}<li><span class="badge badge--urgente">{{urgente}}</span></li>{{/if}}
      </ul>
      <h2 class="cartao__titulo">{{titulo}}</h2>
      <p>{{descricao}}</p>
      <h3>Como ajudar</h3>
      <ul class="cartao__lista">
        {{#each comoAjudar}}<li>{{this}}</li>{{/each}}
      </ul>
    </div>
    <div class="cartao__rodape">
      <a class="botao{{#if acao.destaque}} botao--secundario{{/if}}" href="{{acao.href}}">{{acao.texto}}</a>
    </div>
  </article>
</section>`;

export function cartaoProjeto(projeto) {
  return renderizar(TPL_CARTAO_PROJETO, { ...projeto, nomeCategoria: nomeCategoria(projeto.categoria) });
}

const TPL_ITEM_CADASTRO = `
<li class="item-cadastro" data-id="{{id}}">
  <div class="item-cadastro__cabecalho">
    <h2 class="item-cadastro__nome">{{nome}}</h2>
    <span class="badge badge--{{tipo}}">{{tipoRotulo}}</span>
  </div>
  <dl class="item-cadastro__dados">
    <div><dt>E-mail</dt><dd>{{email}}</dd></div>
    <div><dt>Telefone</dt><dd>{{telefone}}</dd></div>
    <div><dt>Nascimento</dt><dd>{{nascimentoFormatado}}</dd></div>
    <div><dt>Cidade</dt><dd>{{cidade}}/{{estado}}</dd></div>
    <div><dt>Projeto</dt><dd>{{projetoNome}}</dd></div>
    {{#if disponibilidade}}<div><dt>Disponibilidade</dt><dd>{{disponibilidade}} h/semana</dd></div>{{/if}}
  </dl>
  {{#if mensagem}}<p class="item-cadastro__mensagem">“{{mensagem}}”</p>{{/if}}
  <p class="item-cadastro__data">
    <time datetime="{{criadoEm}}" title="{{criadoEmFormatado}}">Enviado {{criadoEmRelativo}}</time>
    {{#if atualizadoEm}} · editado {{atualizadoEmRelativo}}{{/if}}
  </p>
  <div class="grupo-botoes">
    <a class="botao botao--contorno" href="#/cadastro?editar={{id}}">Editar</a>
    <button class="botao botao--contorno botao--perigo-texto" type="button" data-acao="excluir" data-id="{{id}}">Excluir</button>
  </div>
</li>`;

export function itemCadastro(registro) {
  return renderizar(TPL_ITEM_CADASTRO, {
    ...registro,
    tipoRotulo: rotuloTipo(registro.tipo),
    projetoNome: buscarProjeto(registro.projeto)?.titulo ?? 'Sem preferência',
    nascimentoFormatado: formatarData(registro.nascimento),
    criadoEmRelativo: tempoRelativo(registro.criadoEm),
    criadoEmFormatado: formatarDataHora(registro.criadoEm),
    atualizadoEmRelativo: registro.atualizadoEm ? tempoRelativo(registro.atualizadoEm) : ''
  });
}

/** Conteúdo do modal "Como doar" (reaproveitado na página de projetos). */
export const htmlComoDoar = `
<ol class="passos">
  <li>Faça seu cadastro marcando a opção "Doador".</li>
  <li>Você receberá por e-mail a chave PIX e os dados bancários oficiais.</li>
  <li>Envie o comprovante para contato@maossolidarias.org.br e receba seu recibo.</li>
</ol>`;
