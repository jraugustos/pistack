/**
 * TypeScript types for Card Definitions and Templates System
 */

// Field types supported by card definitions
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'file'
  | 'url'

// Card category
export type CardCategory =
  | 'ideation'
  | 'research'
  | 'planning'
  | 'design'
  | 'development'
  | 'marketing'

// Field definition within a card
export interface CardField {
  name: string // field identifier (snake_case)
  type: FieldType
  placeholder?: string
  required: boolean
  options?: string[] // for select type
  defaultValue?: any
  validation?: {
    min?: number
    max?: number
    pattern?: string
    minLength?: number
    maxLength?: number
  }
}

// Card Definition (schema for dynamic cards)
export interface CardDefinition {
  id: string
  name: string
  description: string | null
  category: CardCategory
  icon: string // lucide icon name
  fields: CardField[]
  is_system: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

// Template category
export type TemplateCategory =
  | 'app-site'
  | 'discovery'
  | 'feature'
  | 'research'
  | 'campaign'
  | 'event'

// Template
export interface Template {
  id: string
  name: string
  description: string | null
  category: TemplateCategory | null
  icon: string | null
  is_active: boolean
  is_system: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  stages?: TemplateStage[] // populated via join
}

// Template Stage
export interface TemplateStage {
  id: string
  template_id: string
  stage_number: number
  stage_name: string
  stage_description: string | null
  stage_color: string
  assistant_instructions: string | null
  position: number
  created_at: string
  cards?: TemplateCard[] // populated via join
}

// Template Card (M:N relationship)
export interface TemplateCard {
  id: string
  template_stage_id: string
  card_definition_id: string
  position: number
  created_at: string
  definition?: CardDefinition // populated via join
}

// Helper type for creating new card definitions
export interface CreateCardDefinitionInput {
  name: string
  description?: string
  category: CardCategory
  icon: string
  fields: CardField[]
}

// Helper type for updating card definitions
export interface UpdateCardDefinitionInput {
  name?: string
  description?: string
  category?: CardCategory
  icon?: string
  fields?: CardField[]
}

// Helper type for creating templates
export interface CreateTemplateInput {
  name: string
  description?: string
  category?: TemplateCategory
  icon?: string
  stages: CreateTemplateStageInput[]
}

export interface CreateTemplateStageInput {
  stage_number: number
  stage_name: string
  stage_description?: string
  stage_color: string
  assistant_instructions?: string
  card_definition_ids: string[] // list of card definitions to include
}

// Category labels for UI
export const CARD_CATEGORY_LABELS: Record<CardCategory, string> = {
  ideation: 'Ideação',
  research: 'Pesquisa',
  planning: 'Planejamento',
  design: 'Design',
  development: 'Desenvolvimento',
  marketing: 'Marketing',
}

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  'app-site': 'App ou Website',
  'discovery': 'Discovery de Design',
  'feature': 'Nova Feature',
  'research': 'Pesquisa',
  'campaign': 'Campanha',
  'event': 'Evento',
}

// Field type labels for UI
export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Texto Curto',
  textarea: 'Texto Longo',
  number: 'Número',
  date: 'Data',
  select: 'Lista de Opções',
  checkbox: 'Checkbox',
  file: 'Arquivo/Imagem',
  url: 'URL',
}

// Helper function to validate field structure
export function isValidCardField(field: any): field is CardField {
  return (
    typeof field === 'object' &&
    typeof field.name === 'string' &&
    typeof field.type === 'string' &&
    ['text', 'textarea', 'number', 'date', 'select', 'checkbox', 'file', 'url'].includes(
      field.type
    ) &&
    typeof field.required === 'boolean'
  )
}

// Helper function to validate card definition
export function isValidCardDefinition(data: any): data is CardDefinition {
  return (
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.category === 'string' &&
    typeof data.icon === 'string' &&
    Array.isArray(data.fields) &&
    data.fields.every(isValidCardField)
  )
}
