# Instituto Mãos Solidárias: SPA (Experiência Prática III)

Esta é a versão interativa do site da ONG fictícia **Instituto Mãos Solidárias**. A interface estática da Experiência Prática II foi transformada em uma **Single Page Application (SPA)** feita com JavaScript puro (ES Modules).

## Como executar

O projeto usa ES Modules e carrega os templates com `fetch`. Por isso, ele precisa ser aberto **por um servidor**, e não com duplo clique no arquivo (`file://`). Algumas opções:

- **VS Code:** clique com o botão direito em `index.html` e escolha *Open with Live Server*.
- **Python:** rode `python -m http.server 8000` e acesse `http://localhost:8000`.
- **GitHub Pages:** publique o repositório. Funciona sem configuração extra porque as rotas usam hash (`#/rota`).

Para rodar os testes, abra `testes.html` no navegador ou execute `npm test` (requer Node 18+).

## Estrutura de diretórios

```
/
├── index.html              → "casca" da SPA: cabeçalho, <main id="app"> e rodapé (carregados uma vez)
├── testes.html             → página que executa os testes automatizados
├── package.json            → script "npm test"
├── html/                   → templates de cada view (fragmentos HTML com {{marcações}})
│   ├── inicio.html
│   ├── projetos.html
│   ├── cadastro.html
│   ├── meus-cadastros.html
│   └── 404.html
├── css/
│   ├── style.css           → design system e componentes (herdado da EP II)
│   └── spa.css             → estilos dos novos componentes dinâmicos
├── imagens/                → imagens em WebP com fallback PNG
└── js/
    ├── main.js             → ponto de entrada: registra rotas e inicia os módulos
    ├── data/
    │   └── dados.js        → conteúdo (projetos, estatísticas, estados…) separado da interface
    ├── modules/            → módulos reutilizáveis, um por área de funcionalidade
    │   ├── router.js       → roteamento por hash, ciclo montar/desmontar das páginas
    │   ├── template.js     → motor de templates ({{var}}, {{{html}}}, {{#each}}, {{#if}})
    │   ├── componentes.js  → componentes visuais (cartão de projeto, item de cadastro)
    │   ├── ui.js           → menu, dropdown, modal, confirmação e toast
    │   ├── validacao.js    → regras de consistência + exibição de erros
    │   ├── mascaras.js     → máscaras de CPF, telefone e CEP
    │   ├── storage.js      → acesso ao localStorage (CRUD de cadastros e rascunho)
    │   └── datas.js        → formatação de datas com Day.js (biblioteca externa)
    ├── paginas/            → controladores de cada view (dados + eventos)
    │   ├── inicio.js
    │   ├── projetos.js
    │   ├── cadastro.js
    │   └── meus-cadastros.js
    └── testes/
        └── testes.js       → 37 testes das funções puras
```

## Funcionalidades

| Requisito | Implementação |
|---|---|
| Navegação SPA | `router.js` troca o conteúdo de `#app` sem recarregar a página. Os botões voltar/avançar funcionam, o título da aba é atualizado, o menu indica a página ativa (`aria-current`) e o foco vai para o `<h1>` a cada troca. Endereços desconhecidos mostram uma página 404. |
| Templates dinâmicos | `template.js` renderiza os arquivos de `/html` com dados de `dados.js`. Cartões de projeto, estatísticas, opções de estado/projeto e a lista de cadastros são gerados a partir de dados. O texto é escapado para evitar XSS. |
| Eventos | Filtro de projetos por categoria, menu e dropdown, modal (com ESC, clique fora e *focus trap*), busca em tempo real, contador de caracteres, campo condicional (as horas só aparecem para voluntários), exclusão com confirmação e contador de cadastros no menu. Para evitar vazamento de memória, os listeners são removidos com `AbortController` ao sair de cada página. |
| Validação de formulários | Regras reais: dígito verificador do CPF, DDD e 9º dígito do telefone, idade mínima de 18 anos, nome e sobrenome, CPF duplicado e horas obrigatórias para voluntários. O feedback aparece por campo (ao sair do campo e enquanto digita), e um resumo com links leva ao campo com erro. |
| localStorage | Os cadastros ficam salvos com CRUD completo (criar, listar, editar e excluir). O formulário guarda um **rascunho automático**, que é recuperado se a página for fechada. O contador é sincronizado entre abas pelo evento `storage`. |
| Biblioteca externa | **Day.js** (via CDN) mostra datas relativas em português ("há 5 minutos"). Se o CDN falhar, o código usa `Intl.DateTimeFormat` e a aplicação continua funcionando. |
| Modularização | Há 8 módulos por funcionalidade e 4 controladores de página, com responsabilidades separadas (dados, regras, interface e persistência). |
| Testes | `testes.html` / `npm test` rodam 37 testes. Também houve testes manuais de ponta a ponta (fluxos de cadastro, edição, exclusão, menu mobile e 404). |

## Acessibilidade

O projeto mantém o que já existia na EP II: link "pular para o conteúdo", ARIA no menu e no modal, contraste AA e `prefers-reduced-motion`. Na SPA foram adicionados o anúncio da troca de página via foco no título, `aria-live` nas mensagens de erro, `aria-invalid`, `aria-pressed` nos filtros e `aria-busy` durante o carregamento.
