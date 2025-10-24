/**
 * Card type definitions and mappings
 * Centralized constants for card types, titles, stages, and colors
 */

export const STAGE_CARD_TYPES: Record<number, string[]> = {
  1: [
    'project-name',
    'pitch',
    'problem',
    'solution',
    'target-audience',
    'initial-kpis',
  ],
  2: [
    'validation-hypotheses',
    'primary-persona',
    'value-proposition',
    'benchmarking',
  ],
  3: [
    'mvp-definition',
    'essential-features',
    'user-stories',
    'acceptance-criteria',
    'roadmap',
    'scope-constraints',
  ],
  4: [
    'user-flows',
    'wireframes',
    'design-system',
    'components',
    'accessibility',
  ],
  5: [
    'tech-stack',
    'architecture',
    'database',
    'api-design',
    'infrastructure',
    'security',
  ],
  6: [
    'sprint-planning',
    'timeline',
    'resources',
    'budget',
    'milestones',
    'success-criteria',
    'risk-management',
    'launch-plan',
  ],
}

export const STAGE_NAMES: Record<number, string> = {
  1: 'Ideia Base',
  2: 'Entendimento',
  3: 'Escopo',
  4: 'Design & UX',
  5: 'Arquitetura',
  6: 'Planejamento',
}

export const STAGE_DESCRIPTION: Record<number, string> = {
  1: 'Conceito inicial, problema, solução e KPIs do projeto',
  2: 'Hipóteses, personas e proposta de valor',
  3: 'Definição do MVP, features essenciais, user stories e roadmap',
  4: 'Fluxos de usuário, wireframes e design system',
  5: 'Stack técnica, arquitetura e infraestrutura',
  6: 'Planejamento, recursos e critérios de sucesso',
}

export const CARD_TITLES: Record<string, string> = {
  'project-name': 'Ideia',
  pitch: 'Pitch',
  problem: 'Problema',
  solution: 'Solução',
  'target-audience': 'Público-alvo',
  'initial-kpis': 'KPIs Iniciais',
  'validation-hypotheses': 'Hipóteses de Validação',
  'primary-persona': 'Persona Principal',
  'value-proposition': 'Proposta de Valor',
  benchmarking: 'Benchmarking',
  'mvp-definition': 'Definição do MVP',
  'essential-features': 'Features Essenciais',
  'user-stories': 'User Stories',
  'acceptance-criteria': 'Critérios de Aceitação',
  roadmap: 'Roadmap',
  'scope-constraints': 'Restrições de Escopo',
  'user-flows': 'Fluxos de Usuário',
  wireframes: 'Wireframes',
  'design-system': 'Design System',
  components: 'Componentes',
  accessibility: 'Acessibilidade',
  'tech-stack': 'Stack Tecnológica',
  architecture: 'Arquitetura',
  database: 'Banco de Dados',
  'api-design': 'Design de APIs',
  infrastructure: 'Infraestrutura',
  security: 'Segurança',
  'sprint-planning': 'Planejamento de Sprints',
  timeline: 'Cronograma',
  resources: 'Recursos',
  budget: 'Orçamento',
  milestones: 'Marcos',
  'success-criteria': 'Critérios de Sucesso',
  'risk-management': 'Gestão de Riscos',
  'launch-plan': 'Plano de Lançamento',
}

export const STAGE_COLORS: Record<number, string> = {
  1: '#7AA2FF', // Blue
  2: '#5AD19A', // Green
  3: '#FFC24B', // Yellow/Orange
  4: '#FF6B6B', // Red
  5: '#9B8AFB', // Purple
  6: '#E879F9', // Pink
}

export const STAGE_ICONS: Record<number, string> = {
  1: 'lightbulb',
  2: 'brain',
  3: 'layout-grid',
  4: 'palette',
  5: 'code-2',
  6: 'calendar',
}

/**
 * Calculate total expected cards across all stages
 */
export function getTotalExpectedCards(): number {
  return Object.values(STAGE_CARD_TYPES).reduce(
    (total, cardTypes) => total + cardTypes.length,
    0
  )
}

/**
 * Get all card types for a specific stage
 */
export function getStageCardTypes(stageNumber: number): string[] {
  return STAGE_CARD_TYPES[stageNumber] ?? []
}

/**
 * Get stage number for a card type
 */
export function getCardStageNumber(cardType: string): number | null {
  for (const [stageNum, cardTypes] of Object.entries(STAGE_CARD_TYPES)) {
    if (cardTypes.includes(cardType)) {
      return parseInt(stageNum, 10)
    }
  }
  return null
}
