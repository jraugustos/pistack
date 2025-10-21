/**
 * OpenAI Function Calling Definitions for PIStack Assistants
 * These functions allow the AI to interact with the canvas cards
 */

export interface FunctionCall {
  name: string
  arguments: string
}

export interface CreateCardArgs {
  stage: number
  card_type: string
  content: Record<string, any>
}

export interface UpdateCardArgs {
  card_id: string
  content: Record<string, any>
}

export interface SuggestContentArgs {
  card_type: string
  context?: string
}

export interface ValidateStageArgs {
  stage: number
  project_id: string
}

export interface GetProjectContextArgs {
  project_id: string
}

// Function definitions that match OpenAI Assistant configuration
export const FUNCTION_DEFINITIONS = [
  {
    name: 'create_card',
    description: 'Cria um novo card no canvas do PIStack',
    parameters: {
      type: 'object',
      properties: {
        stage: {
          type: 'integer',
          description: 'Numero da etapa (1 a 6)',
          enum: [1, 2, 3, 4, 5, 6],
        },
        card_type: {
          type: 'string',
          description: 'Tipo do card (ex: project-name, pitch, problem, solution, etc)',
        },
        content: {
          type: 'object',
          description: 'Conteudo do card em formato JSON',
        },
      },
      required: ['stage', 'card_type', 'content'],
    },
  },
  {
    name: 'update_card',
    description: 'Atualiza um card existente',
    parameters: {
      type: 'object',
      properties: {
        card_id: {
          type: 'string',
          description: 'ID unico do card',
        },
        content: {
          type: 'object',
          description: 'Novo conteudo do card',
        },
      },
      required: ['card_id', 'content'],
    },
  },
  {
    name: 'suggest_content',
    description: 'Sugere conteudo para um tipo de card especifico baseado no contexto do projeto',
    parameters: {
      type: 'object',
      properties: {
        card_type: {
          type: 'string',
          description: 'Tipo do card',
        },
        context: {
          type: 'string',
          description: 'Contexto adicional para a sugestao',
        },
      },
      required: ['card_type'],
    },
  },
  {
    name: 'validate_stage',
    description: 'Valida se uma etapa esta completa e consistente',
    parameters: {
      type: 'object',
      properties: {
        stage: {
          type: 'integer',
          description: 'Numero da etapa (1 a 6)',
          enum: [1, 2, 3, 4, 5, 6],
        },
        project_id: {
          type: 'string',
          description: 'ID do projeto',
        },
      },
      required: ['stage', 'project_id'],
    },
  },
  {
    name: 'get_project_context',
    description: 'Obtem o contexto completo do projeto incluindo todos os cards preenchidos',
    parameters: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'ID do projeto',
        },
      },
      required: ['project_id'],
    },
  },
]

// Card type mappings for each stage
export const CARD_TYPES_BY_STAGE: Record<number, string[]> = {
  1: ['project-name', 'pitch', 'problem', 'solution', 'target-audience', 'initial-kpis'],
  2: ['validation-hypotheses', 'primary-persona', 'value-proposition', 'benchmarking'],
  3: ['mvp-definition', 'essential-features', 'user-stories', 'acceptance-criteria', 'roadmap', 'scope-constraints'],
  4: ['user-flows', 'wireframes', 'design-system', 'components', 'accessibility'],
  5: ['tech-stack', 'architecture', 'database', 'api-design', 'infrastructure', 'security'],
  6: ['sprint-planning', 'timeline', 'resources', 'budget', 'milestones', 'success-criteria', 'risk-management', 'launch-plan'],
}

// Card type descriptions for AI context
export const CARD_TYPE_DESCRIPTIONS: Record<string, string> = {
  // Etapa 1
  'project-name': 'Nome e descrição do projeto',
  'pitch': 'Elevator pitch do projeto em poucas frases',
  'problem': 'Problema que o projeto resolve',
  'solution': 'Solução proposta pelo projeto',
  'target-audience': 'Público-alvo do projeto',
  'initial-kpis': 'KPIs iniciais de sucesso',

  // Etapa 2
  'validation-hypotheses': 'Hipóteses a serem validadas',
  'primary-persona': 'Persona principal do usuário',
  'value-proposition': 'Proposta de valor única',
  'benchmarking': 'Análise de concorrentes e referências',

  // Etapa 3
  'mvp-definition': 'Definição do MVP (Produto Mínimo Viável)',
  'essential-features': 'Features essenciais do produto',
  'user-stories': 'User stories principais',
  'acceptance-criteria': 'Critérios de aceitação',
  'roadmap': 'Roadmap de desenvolvimento',
  'scope-constraints': 'Restrições e limitações de escopo',

  // Etapa 4
  'user-flows': 'Fluxos de usuário principais',
  'wireframes': 'Wireframes e protótipos',
  'design-system': 'Sistema de design e identidade visual',
  'components': 'Componentes reutilizáveis',
  'accessibility': 'Diretrizes de acessibilidade',

  // Etapa 5
  'tech-stack': 'Stack tecnológica escolhida',
  'architecture': 'Arquitetura do sistema',
  'database': 'Modelo de dados e schema',
  'api-design': 'Design de APIs e endpoints',
  'infrastructure': 'Infraestrutura e deploy',
  'security': 'Segurança e proteção de dados',

  // Etapa 6
  'sprint-planning': 'Planejamento de sprints',
  'timeline': 'Cronograma do projeto',
  'resources': 'Recursos e equipe necessária',
  'budget': 'Orçamento estimado',
  'milestones': 'Marcos importantes do projeto',
  'success-criteria': 'Critérios de sucesso',
  'risk-management': 'Gestão de riscos',
  'launch-plan': 'Plano de lançamento',
}
