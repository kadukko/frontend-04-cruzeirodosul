// Dados estáticos da aplicação. Separá-los da interface permite que os
// templates sejam reaproveitados: basta alterar este arquivo para mudar o conteúdo.

export const instituicao = {
  nome: 'Instituto Mãos Solidárias',
  fundacao: 2012,
  cidade: 'Brasília-DF',
  slogan: 'Transformando realidades por meio da educação, da alimentação e da inclusão digital desde 2012.',
  descricao: 'Somos uma organização da sociedade civil sem fins lucrativos que atua em comunidades de baixa renda, oferecendo apoio a crianças, jovens e famílias em situação de vulnerabilidade social.'
};

export const pilares = [
  { titulo: 'Missão', icone: '◎', classes: 'col-md-6 col-lg-4',
    conteudo: '<p>Promover o desenvolvimento humano e a cidadania por meio de ações educativas, sociais e tecnológicas.</p>' },
  { titulo: 'Visão', icone: '✦', classes: 'col-md-6 col-lg-4',
    conteudo: '<p>Ser referência regional em projetos sociais transparentes, sustentáveis e de impacto mensurável.</p>' },
  { titulo: 'Valores', icone: '♥', classes: 'col-md-12 col-lg-4',
    conteudo: '<ul class="cartao__lista"><li>Transparência na gestão dos recursos</li><li>Respeito à diversidade</li><li>Compromisso com a comunidade</li><li>Voluntariado como força de transformação</li></ul>' }
];

export const estatisticas = [
  { valor: 1200, rotulo: 'famílias atendidas por ano' },
  { valor: 350, rotulo: 'voluntários ativos' },
  { valor: 18, rotulo: 'comunidades parceiras' }
];

export const categorias = [
  { id: 'educacao', nome: 'Educação', ancora: 'titulo-educacao' },
  { id: 'alimentacao', nome: 'Segurança alimentar', ancora: 'titulo-alimentacao' },
  { id: 'digital', nome: 'Inclusão digital', ancora: 'titulo-digital' }
];

export const projetos = [
  {
    id: 'reforco',
    categoria: 'educacao',
    titulo: 'Reforço Escolar Comunitário',
    descricao: 'Aulas de reforço em português e matemática para crianças de 7 a 14 anos, no contraturno escolar.',
    imagem: 'reforco-escolar',
    alt: 'Crianças estudando com uma voluntária em sala de aula',
    comoAjudar: ['Seja voluntário educador (2 horas semanais)', 'Doe material escolar'],
    acao: { texto: 'Quero ajudar', href: '#/cadastro?projeto=reforco', destaque: false }
  },
  {
    id: 'cesta',
    categoria: 'alimentacao',
    titulo: 'Cesta Solidária',
    descricao: 'Arrecadação e distribuição mensal de cestas básicas para famílias cadastradas.',
    imagem: 'cesta-solidaria',
    alt: 'Voluntários montando cestas básicas',
    urgente: 'Campanha ativa',
    comoAjudar: ['Doe alimentos não perecíveis', 'Apoie a logística de distribuição'],
    acao: { texto: 'Doar agora', href: '#/cadastro?projeto=cesta&tipo=doador', destaque: true }
  },
  {
    id: 'conecta',
    categoria: 'digital',
    titulo: 'Conecta Jovem',
    descricao: 'Oficinas de informática básica, programação e preparação para o mercado de trabalho para jovens de 15 a 24 anos.',
    imagem: 'conecta-jovem',
    alt: 'Jovens aprendendo programação em computadores',
    comoAjudar: ['Doe computadores usados em bom estado', 'Ministre oficinas como voluntário'],
    acao: { texto: 'Quero ajudar', href: '#/cadastro?projeto=conecta', destaque: false }
  }
];

export const tiposParticipacao = [
  { valor: 'voluntario', rotulo: 'Voluntário' },
  { valor: 'doador', rotulo: 'Doador' },
  { valor: 'ambos', rotulo: 'Voluntário e doador' }
];

export const estados = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'], ['BA', 'Bahia'],
  ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'], ['GO', 'Goiás'],
  ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'], ['MG', 'Minas Gerais'],
  ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'], ['PE', 'Pernambuco'], ['PI', 'Piauí'],
  ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'], ['RS', 'Rio Grande do Sul'],
  ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'], ['SP', 'São Paulo'],
  ['SE', 'Sergipe'], ['TO', 'Tocantins']
].map(([sigla, nome]) => ({ sigla, nome }));

// Funções auxiliares de consulta
export const buscarProjeto = (id) => projetos.find((p) => p.id === id);
export const nomeCategoria = (id) => categorias.find((c) => c.id === id)?.nome ?? id;
export const rotuloTipo = (valor) => tiposParticipacao.find((t) => t.valor === valor)?.rotulo ?? valor;
