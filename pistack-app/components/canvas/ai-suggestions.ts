/**
 * Sugestões rápidas contextuais baseadas no tipo de card referenciado
 */

export const CARD_TITLES: Record<string, string> = {
  'project-name': 'Ideia',
  'pitch': 'Pitch',
  'problem': 'Problema',
  'solution': 'Solução',
  'target-audience': 'Público-alvo',
  'initial-kpis': 'KPIs Iniciais',
  'validation-hypotheses': 'Hipóteses de Validação',
  'primary-persona': 'Persona Principal',
  'value-proposition': 'Proposta de Valor',
  'benchmarking': 'Benchmarking',
  'mvp-definition': 'Definição do MVP',
  'essential-features': 'Features Essenciais',
  'user-stories': 'User Stories',
  'acceptance-criteria': 'Critérios de Aceitação',
  'roadmap': 'Roadmap',
  'scope-constraints': 'Restrições de Escopo',
  'user-flows': 'Fluxos de Usuário',
  'wireframes': 'Wireframes',
  'design-system': 'Design System',
  'components': 'Componentes',
  'accessibility': 'Acessibilidade',
  'tech-stack': 'Stack Tecnológica',
  'architecture': 'Arquitetura',
  'database': 'Banco de Dados',
  'api-design': 'Design de APIs',
  'infrastructure': 'Infraestrutura',
  'security': 'Segurança',
  'sprint-planning': 'Planejamento de Sprints',
  'timeline': 'Cronograma',
  'resources': 'Recursos',
  'budget': 'Orçamento',
  'milestones': 'Marcos',
  'success-criteria': 'Critérios de Sucesso',
  'risk-management': 'Gestão de Riscos',
  'launch-plan': 'Plano de Lançamento',
}

export const STAGE_COLORS: Record<number, string> = {
  1: '#7AA2FF',
  2: '#9B8AFB',
  3: '#FF9F66',
  4: '#5AD19A',
  5: '#FF6B9D',
  6: '#FFD166',
}

export const STAGE_NAMES: Record<number, string> = {
  1: 'Etapa 1: Ideia',
  2: 'Etapa 2: Validação',
  3: 'Etapa 3: MVP',
  4: 'Etapa 4: Design',
  5: 'Etapa 5: Técnico',
  6: 'Etapa 6: Planejamento',
}

/**
 * Mapeia cada tipo de card para sua etapa correspondente
 */
export const CARD_TO_STAGE: Record<string, number> = {
  'project-name': 1,
  'pitch': 1,
  'problem': 1,
  'solution': 1,
  'target-audience': 1,
  'initial-kpis': 1,
  'validation-hypotheses': 2,
  'primary-persona': 2,
  'value-proposition': 2,
  'benchmarking': 2,
  'mvp-definition': 3,
  'essential-features': 3,
  'user-stories': 3,
  'acceptance-criteria': 3,
  'roadmap': 3,
  'scope-constraints': 3,
  'user-flows': 4,
  'wireframes': 4,
  'design-system': 4,
  'components': 4,
  'accessibility': 4,
  'tech-stack': 5,
  'architecture': 5,
  'database': 5,
  'api-design': 5,
  'infrastructure': 5,
  'security': 5,
  'sprint-planning': 6,
  'timeline': 6,
  'resources': 6,
  'budget': 6,
  'milestones': 6,
  'success-criteria': 6,
  'risk-management': 6,
  'launch-plan': 6,
}

interface QuickSuggestion {
  icon: string
  text: string
}

/**
 * Sugestões contextuais baseadas no tipo de card
 */
export const CONTEXTUAL_SUGGESTIONS: Record<string, QuickSuggestion[]> = {
  'project-name': [
    { icon: '✨', text: 'Gerar um pitch elevator para esta ideia' },
    { icon: '🎯', text: 'Identificar o principal problema que resolve' },
    { icon: '💡', text: 'Sugerir um nome mais impactante' },
  ],
  'problem': [
    { icon: '🔬', text: 'Gerar hipóteses para validação do problema' },
    { icon: '👥', text: 'Criar 3 personas baseadas no público-alvo' },
    { icon: '📊', text: 'Sugerir métricas para medir o problema' },
  ],
  'solution': [
    { icon: '🎯', text: 'Expandir proposta de valor única' },
    { icon: '⚡', text: 'Identificar diferenciais competitivos' },
    { icon: '🚀', text: 'Sugerir features essenciais do MVP' },
  ],
  'target-audience': [
    { icon: '👤', text: 'Criar persona detalhada do público primário' },
    { icon: '📈', text: 'Estimar tamanho de mercado' },
    { icon: '🎨', text: 'Sugerir canais de aquisição' },
  ],
  'initial-kpis': [
    { icon: '📊', text: 'Validar se os KPIs são mensuráveis' },
    { icon: '🎯', text: 'Sugerir metas realistas para cada KPI' },
    { icon: '⏱️', text: 'Definir timeframe para alcançar as metas' },
  ],
  'validation-hypotheses': [
    { icon: '🔬', text: 'Criar experimentos para validar hipóteses' },
    { icon: '📋', text: 'Priorizar hipóteses por risco e valor' },
    { icon: '✅', text: 'Definir critérios de aceitação' },
  ],
  'primary-persona': [
    { icon: '🎭', text: 'Expandir motivações e dores da persona' },
    { icon: '📱', text: 'Mapear jornada do usuário' },
    { icon: '💬', text: 'Criar roteiro de entrevista' },
  ],
  'value-proposition': [
    { icon: '💎', text: 'Refinar a proposta de valor' },
    { icon: '🎯', text: 'Alinhar com as dores da persona' },
    { icon: '📝', text: 'Criar messaging framework' },
  ],
  'mvp-definition': [
    { icon: '⚡', text: 'Validar escopo do MVP' },
    { icon: '📦', text: 'Separar must-have de nice-to-have' },
    { icon: '⏱️', text: 'Estimar tempo de desenvolvimento' },
  ],
  'essential-features': [
    { icon: '🎯', text: 'Priorizar features por valor' },
    { icon: '📝', text: 'Converter em user stories' },
    { icon: '🔍', text: 'Identificar dependências técnicas' },
  ],
  'user-stories': [
    { icon: '✍️', text: 'Validar formato das user stories' },
    { icon: '📋', text: 'Criar critérios de aceitação' },
    { icon: '🎯', text: 'Estimar complexidade' },
  ],
  'wireframes': [
    { icon: '🎨', text: 'Revisar consistência visual' },
    { icon: '♿', text: 'Validar acessibilidade' },
    { icon: '📱', text: 'Verificar responsividade' },
  ],
  'tech-stack': [
    { icon: '⚙️', text: 'Validar compatibilidade das tecnologias' },
    { icon: '📊', text: 'Analisar trade-offs' },
    { icon: '🔒', text: 'Revisar aspectos de segurança' },
  ],
  'roadmap': [
    { icon: '🗓️', text: 'Validar realismo do cronograma' },
    { icon: '🎯', text: 'Identificar marcos críticos' },
    { icon: '⚠️', text: 'Mapear riscos e dependências' },
  ],
}

/**
 * Sugestões padrão quando não há contexto específico
 */
export const DEFAULT_SUGGESTIONS: QuickSuggestion[] = [
  { icon: '💡', text: 'Como estruturar minha ideia?' },
  { icon: '🎯', text: 'Qual a próxima etapa do projeto?' },
  { icon: '📊', text: 'Como validar minhas hipóteses?' },
  { icon: '🚀', text: 'Sugestões para o MVP' },
]
