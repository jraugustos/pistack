'use client'

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
  ForwardRefRenderFunction,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'
import { Plus, Sparkles, Check, Info, Lightbulb, X } from 'lucide-react'
import type { ComponentType } from 'react'
import {
  ProjectNameCard,
  PitchCard,
  ProblemCard,
  SolutionCard,
  TargetAudienceCard,
  InitialKPIsCard,
} from '@/components/canvas/cards/etapa-1'
import {
  ValidationHypothesesCard,
  PrimaryPersonaCard,
  ValuePropositionCard,
  BenchmarkingCard,
} from '@/components/canvas/cards/etapa-2'
import {
  MvpDefinitionCard,
  EssentialFeaturesCard,
  UserStoriesCard,
  AcceptanceCriteriaCard,
  RoadmapCard,
  ScopeConstraintsCard,
} from '@/components/canvas/cards/etapa-3'
import {
  UserFlowsCard,
  WireframesCard,
  DesignSystemCard,
  ComponentsCard,
  AccessibilityCard,
} from '@/components/canvas/cards/etapa-4'
import {
  TechStackCard,
  ArchitectureCard,
  DatabaseCard,
  ApiDesignCard,
  InfrastructureCard,
  SecurityCard,
} from '@/components/canvas/cards/etapa-5'
import {
  SprintPlanningCard,
  TimelineCard,
  ResourcesCard,
  BudgetCard,
  MilestonesCard,
  SuccessCriteriaCard,
  RiskManagementCard,
  LaunchPlanCard,
} from '@/components/canvas/cards/etapa-6'
import { CardActionsProvider, CardActionsContextValue } from '@/components/canvas/cards/base-card'
import { CardEditModal } from '@/components/canvas/card-edit-modal'

interface StageSectionProps {
  projectId: string
  stage: {
    id: string
    stage_number: number
    stage_name: string
    stage_color: string
  }
  searchTerm?: string
  showOnlyFilled?: boolean
  zoom?: number
  onToggleFilled?: () => void
}

interface CardRecord {
  id: string
  stage_id: string
  card_type: string
  content: Record<string, any>
  position: number
  created_at: string
  updated_at: string
}

interface EditCardState {
  card: CardRecord
}

interface LoadingState {
  isVisible: boolean
  activeStep: number
  completedSteps: number[]
  messageIndex: number
}

const LOADING_MESSAGES = [
  'Analisando contexto do projeto...',
  'Consultando a IA para gerar conteúdo...',
  'Estruturando as informações...',
  'Processando resposta da IA...',
  'Finalizando os detalhes...',
  'Preparando o card para você...',
]

const LOADING_STEPS = [
  { id: 1, title: 'Processando contexto', showProgress: false },
  { id: 2, title: 'Gerando conteúdo com IA', showProgress: true },
  { id: 3, title: 'Estruturando informações', showProgress: false },
  { id: 4, title: 'Finalizando card', showProgress: false },
]

const createLoadingState = (isVisible: boolean): LoadingState => ({
  isVisible,
  activeStep: 2,
  completedSteps: [1],
  messageIndex: 0,
})

const addCompletedStep = (completedSteps: number[], step: number) =>
  completedSteps.includes(step) ? completedSteps : [...completedSteps, step]

const STAGE_CARD_TYPES: Record<number, string[]> = {
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

const STAGE_DESCRIPTION: Record<number, string> = {
  1: 'Conceito inicial, problema, solução e KPIs do projeto',
  2: 'Hipóteses, personas e proposta de valor',
  3: 'Definição do MVP, features essenciais, user stories e roadmap',
  4: 'Fluxos de usuário, wireframes e design system',
  5: 'Stack técnica, arquitetura e infraestrutura',
  6: 'Planejamento, recursos e critérios de sucesso',
}

const CARD_TITLES: Record<string, string> = {
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

const CARD_COMPONENTS: Record<string, ComponentType<any>> = {
  'project-name': ProjectNameCard,
  pitch: PitchCard,
  problem: ProblemCard,
  solution: SolutionCard,
  'target-audience': TargetAudienceCard,
  'initial-kpis': InitialKPIsCard,
  'validation-hypotheses': ValidationHypothesesCard,
  'primary-persona': PrimaryPersonaCard,
  'value-proposition': ValuePropositionCard,
  benchmarking: BenchmarkingCard,
  'mvp-definition': MvpDefinitionCard,
  'essential-features': EssentialFeaturesCard,
  'user-stories': UserStoriesCard,
  'acceptance-criteria': AcceptanceCriteriaCard,
  roadmap: RoadmapCard,
  'scope-constraints': ScopeConstraintsCard,
  'user-flows': UserFlowsCard,
  wireframes: WireframesCard,
  'design-system': DesignSystemCard,
  components: ComponentsCard,
  accessibility: AccessibilityCard,
  'tech-stack': TechStackCard,
  architecture: ArchitectureCard,
  database: DatabaseCard,
  'api-design': ApiDesignCard,
  infrastructure: InfrastructureCard,
  security: SecurityCard,
  'sprint-planning': SprintPlanningCard,
  timeline: TimelineCard,
  resources: ResourcesCard,
  budget: BudgetCard,
  milestones: MilestonesCard,
  'success-criteria': SuccessCriteriaCard,
  'risk-management': RiskManagementCard,
  'launch-plan': LaunchPlanCard,
}

function toStringOrUndefined(value: unknown) {
  if (!value) return undefined
  if (typeof value === 'string') return value.trim() || undefined
  if (typeof value === 'number') return String(value)
  if (
    typeof value === 'object' &&
    value !== null &&
    'value' in (value as Record<string, unknown>)
  ) {
    return toStringOrUndefined((value as Record<string, unknown>).value)
  }
  return undefined
}

function firstString(
  data: Record<string, any>,
  keys: string[],
  fallback?: string
) {
  for (const key of keys) {
    const normalizedKey = key
      .split('.')
      .map((part) => part.trim())
      .filter(Boolean)

    let value: any = data
    for (const part of normalizedKey) {
      if (value == null) break
      value = value[part]
    }

    const asString = toStringOrUndefined(value)
    if (asString) return asString
  }

  return fallback
}

function sanitizeListEntry(entry: string) {
  let cleaned = entry.replace(/^["']|["']$/g, '').trim()

  if (!cleaned) return ''

  cleaned = cleaned
    .replace(/^[-*•\d]+[).\-\s]*/, '')
    .replace(/^pontos? de dor[:\-]*/i, '')
    .trim()

  if (cleaned.length > 180) {
    const firstSentence = cleaned
      .split(/[.;]/)
      .map((segment) => segment.trim())
      .find(Boolean)
    if (firstSentence) {
      cleaned = firstSentence
    }
  }

  const words = cleaned.split(/\s+/)
  if (words.length > 20) {
    cleaned = words.slice(0, 20).join(' ').trim() + '…'
  }

  return cleaned
}

function toArrayOfStrings(value: unknown) {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === 'string'
          ? sanitizeListEntry(item)
          : sanitizeListEntry(String(item))
      )
      .filter((item) => item.length > 0)
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n|[,;•-]/)
      .map((item) => sanitizeListEntry(item))
      .filter(Boolean)
  }

  return []
}

function isPlaceholder(input?: string | null) {
  if (!input) return true
  const normalized = input.trim().toLowerCase()
  if (!normalized) return true

  const placeholders = [
    'texto em',
    'descreva',
    'preencha',
    'placeholder',
    'coloque',
    'exemplo',
  ]

  return placeholders.some((prefix) => normalized.startsWith(prefix))
}

interface NormalizedKpi {
  name: string
  target: string
}

function normalizeKpis(value: unknown): NormalizedKpi[] {
  const result: NormalizedKpi[] = []

  const pushKpi = (name: string | undefined, target: string | undefined) => {
    const trimmedName = name?.trim()
    const trimmedTarget = target?.trim()
    if (!trimmedName) {
      return
    }
    result.push({ name: trimmedName, target: trimmedTarget || '—' })
  }

  const parseString = (input: string) => {
    const cleaned = input.replace(/^"|"$/g, '').trim()
    if (!cleaned) return

    try {
      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (typeof item === 'object' && item) {
            pushKpi((item as any).name || (item as any).metric, (item as any).target || (item as any).value)
          } else if (typeof item === 'string') {
            const [namePart, ...targetParts] = item.split(/[:|-]/)
            pushKpi(namePart, targetParts.join(':'))
          }
        })
        return
      }
    } catch {
      // not JSON, continue parsing
    }

    cleaned
      .split(/\r?\n|;/)
      .map((segment) => segment.trim())
      .filter(Boolean)
      .forEach((segment) => {
        const [namePart, ...targetParts] = segment.split(/[:|-]/)
        pushKpi(namePart, targetParts.join(':'))
      })
  }

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (typeof item === 'object' && item) {
        pushKpi((item as any).name || (item as any).metric, (item as any).target || (item as any).value)
      } else if (typeof item === 'string') {
        parseString(item)
      }
    })
  } else if (typeof value === 'object' && value) {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.every(([, val]) => typeof val === 'object')) {
      entries.forEach(([key, val]) => {
        if (typeof val === 'object' && val) {
          pushKpi((val as any).name || key, (val as any).target || (val as any).value)
        }
      })
    } else {
      entries.forEach(([key, val]) => pushKpi(key, String(val ?? '')))
    }
  } else if (typeof value === 'string') {
    parseString(value)
  }

  return result
}

function findFirstMeaningfulString(data: Record<string, any>) {
  if (!data || typeof data !== 'object') return undefined

  for (const [key, value] of Object.entries(data)) {
    if (!value) continue
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.length > 0) {
        return trimmed
      }
    }
  }

  return undefined
}

function extractAudienceFromString(text: string) {
  const primaryMatch = text.match(/prim[aá]rio:?(.+?)(?:secund[aá]rio|$)/i)
  const secondaryMatch = text.match(/secund[aá]rio:?(.+)$/i)

  return {
    primaryAudience: primaryMatch
      ? primaryMatch[1].trim()
      : text.split('\n')[0]?.trim(),
    secondaryAudience: secondaryMatch ? secondaryMatch[1].trim() : undefined,
  }
}

function normalizeCardContent(cardType: string, content: any) {
  if (!content) return {}

  let data: Record<string, any>

  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content)
      data = typeof parsed === 'object' && parsed !== null ? { ...parsed } : { value: parsed }
    } catch {
      data = { value: content }
    }
  } else if (typeof content === 'object') {
    data = { ...content }
  } else {
    data = { value: content }
  }

  if (typeof data.Placeholder1 === 'string') {
    try {
      const parsedPlaceholder = JSON.parse(data.Placeholder1)
      if (parsedPlaceholder && typeof parsedPlaceholder === 'object') {
        data = {
          ...data,
          ...parsedPlaceholder,
        }
      }
    } catch {
      // keep as is
    }
  }

  switch (cardType) {
    case 'project-name': {
      const projectName = firstString(data, [
        'projectName',
        'nome',
        'name',
        'title',
        'project_title',
        'heading',
        'card_title',
        'value',
        'content',
      ])

      const description =
        firstString(data, [
          'description',
          'descricao',
          'summary',
          'tagline',
          'texto',
          'text',
          'content',
          'body',
          'markdown',
        ]) || ''

      return {
        ...data,
        projectName,
        description,
        createdAt: data.createdAt || data.created_at || data.metadata?.createdAt,
      }
    }

    case 'pitch': {
      let pitch =
        firstString(data, [
          'pitch',
          'pitch.markdown',
          'texto',
          'text',
          'text.markdown',
          'description',
          'descricao',
          'body',
          'markdown',
          'content',
          'value',
        ]) || ''

      if (!pitch) {
        const fallback = findFirstMeaningfulString(data)
        if (fallback) {
          pitch = fallback
        }
      }

      if (isPlaceholder(pitch)) {
        pitch = ''
      }

      return {
        ...data,
        pitch,
      }
    }

    case 'problem': {
      let problem =
        firstString(data, [
          'problem',
          'problem.markdown',
          'problema',
          'description',
          'descricao',
          'text',
          'text.markdown',
          'markdown',
          'body',
          'content',
          'value',
        ]) || ''

      if (!problem) {
        const fallback = findFirstMeaningfulString(data)
        if (fallback) {
          problem = fallback
        }
      }

      if (isPlaceholder(problem)) {
        problem = ''
      }

      const painPoints =
        data.painPoints ||
        data.pontos_de_dor ||
        data.dores ||
        data.pontos ||
        data.pain_points ||
        toArrayOfStrings(data.value)

      let normalizedPainPoints = Array.isArray(painPoints)
        ? toArrayOfStrings(painPoints)
        : toArrayOfStrings(painPoints)

      normalizedPainPoints = Array.from(new Set(normalizedPainPoints))

      const fallBackString = findFirstMeaningfulString(data)
      const normalizedFallback =
        fallBackString?.replace(/\s+/g, ' ').trim() ?? ''
      const normalizedProblem = problem.replace(/\s+/g, ' ').trim()
      if (normalizedPainPoints.length === 0 && fallBackString) {
        const arrayMatch = fallBackString.match(/\[[^\]]+\]/)
        if (arrayMatch) {
          try {
            const jsonArray = JSON.parse(arrayMatch[0])
            normalizedPainPoints = toArrayOfStrings(jsonArray)
          } catch {
            // ignore
          }
        }

        if (
          normalizedPainPoints.length === 0 &&
          normalizedFallback !== normalizedProblem &&
          /[-•\n;,]/.test(fallBackString)
        ) {
          normalizedPainPoints = toArrayOfStrings(fallBackString).slice(0, 5)
        }
      }

      const painPointsFromProblemMatch = problem.match(/pontos de dor[:\-]*(.*)/i)
      if (painPointsFromProblemMatch) {
        const [, listPart] = painPointsFromProblemMatch
        const extracted = listPart
          .split(/[-•]/)
          .map((item) => sanitizeListEntry(item))
          .filter(Boolean)

        problem = problem.replace(/pontos de dor[:\-]*.*$/i, '').trim()

        if (extracted.length > 0) {
          normalizedPainPoints = extracted
        }
      }

      return {
        ...data,
        problem,
        painPoints: normalizedPainPoints,
      }
    }

    case 'solution': {
      let solution =
        firstString(data, [
          'solution',
          'solution.markdown',
          'solucao',
          'description',
          'descricao',
          'text',
          'text.markdown',
          'markdown',
          'body',
          'content',
          'value',
        ]) || ''

      if (!solution) {
        const fallback = findFirstMeaningfulString(data)
        if (fallback) {
          solution = fallback
        }
      }

      if (isPlaceholder(solution)) {
        solution = ''
      }

      const differentiators =
        data.differentiators ||
        data.diferenciais ||
        data.features ||
        data.beneficios ||
        toArrayOfStrings(data.value)

      let normalizedDifferentiators = Array.isArray(differentiators)
        ? toArrayOfStrings(differentiators)
        : toArrayOfStrings(differentiators)

      normalizedDifferentiators = Array.from(new Set(normalizedDifferentiators))

      if (normalizedDifferentiators.length === 0) {
        const fallback = findFirstMeaningfulString(data)
        if (fallback) {
          normalizedDifferentiators = toArrayOfStrings(fallback).slice(0, 5)
        }
      }

      return {
        ...data,
        solution,
        differentiators: normalizedDifferentiators,
      }
    }

    case 'target-audience': {
      let primaryAudience =
        firstString(data, [
          'primaryAudience',
          'primaryAudience.markdown',
          'publicoPrimario',
          'primario',
          'primary',
          'primary_audience',
          'audience.primary',
          'públicoPrimário',
        ]) || ''

      let secondaryAudience =
        firstString(data, [
          'secondaryAudience',
          'secondaryAudience.markdown',
          'publicoSecundario',
          'secundario',
          'secondary',
          'secondary_audience',
          'audience.secondary',
          'públicoSecundário',
        ]) || ''

      if ((!primaryAudience || !secondaryAudience) && data.audience) {
        if (typeof data.audience === 'string') {
          const parsed = extractAudienceFromString(data.audience)
          if (parsed.primaryAudience) {
            primaryAudience = primaryAudience || parsed.primaryAudience
          }
          if (parsed.secondaryAudience) {
            secondaryAudience = secondaryAudience || parsed.secondaryAudience
          }
        } else if (typeof data.audience === 'object') {
          const audience = data.audience as { primary?: string; secondary?: string }
          if (audience.primary) {
            primaryAudience = primaryAudience || audience.primary
          }
          if (audience.secondary) {
            secondaryAudience = secondaryAudience || audience.secondary
          }
        }
      }

      if (!primaryAudience && typeof data.value === 'string') {
        const parsed = extractAudienceFromString(data.value)
        if (parsed.primaryAudience) {
          primaryAudience = parsed.primaryAudience
        }
        if (parsed.secondaryAudience) {
          secondaryAudience = parsed.secondaryAudience
        }
      }

      if (isPlaceholder(primaryAudience)) {
        primaryAudience = ''
      }

      if (isPlaceholder(secondaryAudience)) {
        secondaryAudience = ''
      }

      if (!primaryAudience) {
        const fallback = findFirstMeaningfulString(data)
        if (fallback) {
          const parsed = extractAudienceFromString(fallback)
          if (parsed.primaryAudience) {
            primaryAudience = parsed.primaryAudience
          } else {
            primaryAudience = fallback
          }
          if (parsed.secondaryAudience) {
            secondaryAudience = secondaryAudience || parsed.secondaryAudience
          }
        }
      }

      return {
        ...data,
        primaryAudience: primaryAudience || '',
        secondaryAudience: secondaryAudience || '',
      }
    }

    case 'initial-kpis': {
      let source =
        data.kpis ??
        data.metrics ??
        data.lista ??
        data.value ??
        data.content

      if (!source) {
        const fallback = findFirstMeaningfulString(data)
        if (fallback) {
          source = fallback
        }
      }

      const normalizedKpis = normalizeKpis(source)

      return {
        ...data,
        kpis: normalizedKpis,
      }
    }

    default:
      return data
  }
}

const StageSectionBase: ForwardRefRenderFunction<
  HTMLDivElement,
  StageSectionProps
> = ({ projectId, stage, searchTerm = '', showOnlyFilled = false, zoom = 100 }, ref) => {
  const [cards, setCards] = useState<CardRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
  const addMenuRef = useRef<HTMLDivElement | null>(null)
  const [editState, setEditState] = useState<EditCardState | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [loadingState, setLoadingState] = useState<LoadingState>(() =>
    createLoadingState(false)
  )

  const cardsByType = useMemo(() => {
    const lookup: Record<string, CardRecord> = {}
    cards.forEach((card) => {
      lookup[card.card_type] = card
    })
    return lookup
  }, [cards])

  const normalizedSearch = useMemo(
    () => searchTerm.trim().toLowerCase(),
    [searchTerm]
  )

  const startLoadingOverlay = useCallback(() => {
    setLoadingState(createLoadingState(true))
  }, [])

  const stopLoadingOverlay = useCallback(() => {
    setLoadingState(createLoadingState(false))
  }, [])

  const stageCardTypes = STAGE_CARD_TYPES[stage.stage_number] ?? []

  const selectableCardTypes = useMemo(
    () => stageCardTypes.filter((type) => !cardsByType[type]),
    [stageCardTypes, cardsByType]
  )

  const fetchCards = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!stage.id) {
        setCards([])
        setIsLoading(false)
        return
      }

      if (!options?.silent) {
        setIsLoading(true)
      }

      try {
        const response = await fetch(`/api/cards?stageId=${stage.id}`)
        const data = await response.json()
        const mapped = (data.cards || []).map((card: CardRecord) => ({
          ...card,
          content: normalizeCardContent(card.card_type, card.content),
        }))
        setCards(mapped)
      } catch (error) {
        console.error('Error loading cards:', error)
      } finally {
        if (!options?.silent) {
          setIsLoading(false)
        }
      }
    },
    [stage.id]
  )

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  useEffect(() => {
    if (!isAddMenuOpen) {
      return
    }

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        addMenuRef.current &&
        !addMenuRef.current.contains(event.target as Node)
      ) {
        setIsAddMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAddMenuOpen])

  useEffect(() => {
    setIsAddMenuOpen(false)
  }, [stage.id])

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{
        projectId: string
        stageNumber: number
      }>).detail

      if (
        detail &&
        detail.projectId === projectId &&
        detail.stageNumber === stage.stage_number
      ) {
        fetchCards({ silent: true })
      }
    }

    window.addEventListener('pistack:cards:refresh', handler as EventListener)

    return () => {
      window.removeEventListener(
        'pistack:cards:refresh',
        handler as EventListener
      )
    }
  }, [projectId, stage.stage_number, fetchCards])

  const getCardByType = useCallback(
    (cardType: string) => cardsByType[cardType],
    [cardsByType]
  )

  const cardHasContent = useCallback((card?: CardRecord) => {
    if (!card) return false
    const values = Object.values(card.content ?? {})

    return values.some((value) => {
      if (typeof value === 'string') {
        return value.trim().length > 0
      }

      if (typeof value === 'number') {
        return true
      }

      if (Array.isArray(value)) {
        return value.some((item) => {
          if (typeof item === 'string') {
            return item.trim().length > 0
          }
          return Boolean(item)
        })
      }

      if (value && typeof value === 'object') {
        return Object.values(value).some((nested) => {
          if (typeof nested === 'string') {
            return nested.trim().length > 0
          }

          if (Array.isArray(nested)) {
            return nested.some((item) => {
              if (typeof item === 'string') {
                return item.trim().length > 0
              }
              return Boolean(item)
            })
          }

          return Boolean(nested)
        })
      }

      return Boolean(value)
    })
  }, [])

  const cardMatchesFilters = useCallback(
    (card: CardRecord) => {
      if (showOnlyFilled && !cardHasContent(card)) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      const values = Object.values(card.content ?? {})
      return values.some((value) => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(normalizedSearch)
        }

        if (typeof value === 'number') {
          return value.toString().includes(normalizedSearch)
        }

        if (Array.isArray(value)) {
          return value.some((item) => {
            if (typeof item === 'string') {
              return item.toLowerCase().includes(normalizedSearch)
            }
            return String(item).toLowerCase().includes(normalizedSearch)
          })
        }

        if (value && typeof value === 'object') {
          return Object.values(value).some((nested) => {
            if (typeof nested === 'string') {
              return nested.toLowerCase().includes(normalizedSearch)
            }

            if (Array.isArray(nested)) {
              return nested.some((item) => {
                if (typeof item === 'string') {
                  return item.toLowerCase().includes(normalizedSearch)
                }
                return String(item).toLowerCase().includes(normalizedSearch)
              })
            }

            return false
          })
        }

        return false
      })
    },
    [cardHasContent, normalizedSearch, showOnlyFilled]
  )

  const shouldShowCard = useCallback(
    (cardType: string) => {
      const card = getCardByType(cardType)
      if (!card) {
        return cardType === 'project-name' && !normalizedSearch && !showOnlyFilled
      }
      return cardMatchesFilters(card)
    },
    [cardMatchesFilters, getCardByType, normalizedSearch, showOnlyFilled]
  )

  const zoomScale = useMemo(() => zoom / 100, [zoom])
  const scaledCanvasWidth = useMemo(
    () => `${(1 / zoomScale) * 100}%`,
    [zoomScale]
  )

  const saveCard = async (cardId: string, content: Record<string, any>) => {
    try {
      const response = await fetch('/api/cards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, content }),
      })

      if (response.ok) {
        const data = await response.json()

        // Normaliza o conteúdo antes de atualizar o estado
        const cardType = cards.find(c => c.id === cardId)?.card_type
        const normalizedCard = {
          ...data.card,
          content: cardType
            ? normalizeCardContent(cardType, data.card.content)
            : data.card.content
        }

        setCards((prev) =>
          prev.map((card) => (card.id === cardId ? normalizedCard : card))
        )

        console.log('[StageSection] Card saved successfully:', cardId)
      } else {
        const errorData = await response.json()
        console.error('[StageSection] Failed to save card:', errorData)
      }
    } catch (error) {
      console.error('Error saving card:', error)
    }
  }

  const createCard = async (cardType: string, content: Record<string, any>) => {
    const autoPopulate = !content || Object.keys(content).length === 0

    try {
      if (autoPopulate) {
        startLoadingOverlay()
      }

      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stageId: stage.id,
          cardType,
          content,
          autoPopulate,
          position: cards.length,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.debug('[StageSection] card created', data.card)
        }

        // Se houve warning, significa que a IA falhou
        if (data.warning) {
          console.warn('[StageSection] Card created with warning:', data.warning)
        }

        // Normaliza e adiciona o card ao estado
        const normalizedCard = {
          ...data.card,
          content: normalizeCardContent(cardType, data.card.content),
        }

        setCards((prev) => {
          const next = prev.filter((existing) => existing.id !== data.card.id)
          next.push(normalizedCard)
          return next
        })

        return data.card
      } else {
        const errorData = await response.json()
        console.error('[StageSection] Failed to create card:', errorData)
        throw new Error(errorData.error || 'Failed to create card')
      }
    } catch (error) {
      console.error('Error creating card:', error)
      // Em caso de erro, atualiza a lista de cards para garantir consistência
      fetchCards({ silent: true })
      throw error
    } finally {
      if (autoPopulate) {
        stopLoadingOverlay()
      }
    }
  }

  const deleteCard = async (cardId: string) => {
    try {
      const response = await fetch('/api/cards', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId }),
      })

      if (response.ok) {
        setCards((prev) => prev.filter((card) => card.id !== cardId))
      }
    } catch (error) {
      console.error('Error deleting card:', error)
    }
  }

  useEffect(() => {
    if (!loadingState.isVisible) {
      return
    }

    const timers: Array<ReturnType<typeof setTimeout>> = []

    timers.push(
      setTimeout(() => {
        setLoadingState((previous) => {
          if (!previous.isVisible) return previous
          return {
            ...previous,
            completedSteps: addCompletedStep(previous.completedSteps, 2),
            activeStep: 3,
          }
        })
      }, 2000)
    )

    timers.push(
      setTimeout(() => {
        setLoadingState((previous) => {
          if (!previous.isVisible) return previous
          return {
            ...previous,
            completedSteps: addCompletedStep(previous.completedSteps, 3),
            activeStep: 4,
          }
        })
      }, 4000)
    )

    timers.push(
      setTimeout(() => {
        setLoadingState((previous) => {
          if (!previous.isVisible) return previous
          return {
            ...previous,
            completedSteps: addCompletedStep(previous.completedSteps, 4),
          }
        })
      }, 6000)
    )

    const messageInterval = setInterval(() => {
      setLoadingState((previous) => {
        if (!previous.isVisible) return previous
        return {
          ...previous,
          messageIndex: (previous.messageIndex + 1) % LOADING_MESSAGES.length,
        }
      })
    }, 2000)

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      clearInterval(messageInterval)
    }
  }, [loadingState.isVisible])

  const handleEditCard = useCallback(
    (card: CardRecord) => {
      setEditState({ card })
    },
    []
  )

  const closeEditModal = useCallback(() => {
    if (isSavingEdit) return
    setEditState(null)
  }, [isSavingEdit])

  const handleSaveEdit = useCallback(async (content: Record<string, any>) => {
    if (!editState) return

    setIsSavingEdit(true)
    try {
      await saveCard(editState.card.id, content)
      setEditState(null)
    } catch (error) {
      console.error('Error saving card:', error)
    } finally {
      setIsSavingEdit(false)
    }
  }, [editState, saveCard])

  const emitReferenceCard = useCallback(
    (card: CardRecord) => {
      window.dispatchEvent(
        new CustomEvent('pistack:ai:reference-card', {
          detail: {
            card,
            stageNumber: stage.stage_number,
            projectId,
          },
        })
      )
    },
    [projectId, stage.stage_number]
  )

  const handleReferenceCard = useCallback(
    (card: CardRecord) => {
      emitReferenceCard(card)
    },
    [emitReferenceCard]
  )

  const handleAddCard = async (cardType: string) => {
    setIsAddMenuOpen(false)

    if (getCardByType(cardType)) {
      return
    }

    await createCard(cardType, {})
  }

  const handleDeleteCard = async (cardId: string) => {
    const canDelete =
      typeof window === 'undefined' ? true : window.confirm('Remover este card?')

    if (!canDelete) {
      return
    }

    await deleteCard(cardId)
  }

  const renderCard = (cardType: string) => {
    if (!shouldShowCard(cardType)) {
      return null
    }

    const card = getCardByType(cardType)
    const CardComponent = CARD_COMPONENTS[cardType]

    if (!CardComponent) {
      return null
    }

    const componentProps: Record<string, any> = {
      ...(card?.content ?? {}),
    }

    if (cardType === 'project-name' && card?.created_at) {
      componentProps.createdAt = card.created_at
    }

    const actionHandlers: CardActionsContextValue = card
      ? {
          onEdit: () => handleEditCard(card),
          onDelete: () => handleDeleteCard(card.id),
        }
      : {}

    return (
      <CardActionsProvider key={card?.id ?? cardType} value={actionHandlers}>
        <CardComponent
          cardId={card?.id ?? `${stage.id}-${cardType}`}
          {...componentProps}
          onAiClick={card ? () => emitReferenceCard(card) : undefined}
          onSave={async (content: Record<string, any>) => {
            if (card) {
              await saveCard(card.id, content)
            } else {
              await createCard(cardType, content)
            }
          }}
        />
      </CardActionsProvider>
    )
  }

  const currentLoadingMessage = LOADING_MESSAGES[
    loadingState.messageIndex % LOADING_MESSAGES.length
  ]

  const getStepStatus = useCallback(
    (stepId: number) => {
      if (loadingState.completedSteps.includes(stepId)) {
        return 'completed'
      }
      if (loadingState.activeStep === stepId) {
        return 'active'
      }
      return 'pending'
    },
    [loadingState.completedSteps, loadingState.activeStep]
  )

  if (isLoading) {
    return (
      <div ref={ref} className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-1 h-8 rounded-full"
            style={{ backgroundColor: stage.stage_color }}
          />
          <div>
            <h2 className="text-xl font-semibold text-white">
              {stage.stage_name}
            </h2>
            <p className="text-sm text-gray-400">
              {STAGE_DESCRIPTION[stage.stage_number]}
            </p>
          </div>
        </div>
        <div className="text-center text-gray-400 py-8">Carregando cards...</div>
      </div>
    )
  }

  const visibleCards = stageCardTypes.filter(shouldShowCard)
  const hasSelectableCards = selectableCardTypes.length > 0
  const stageColor = stage.stage_color

  return (
    <>
      <div ref={ref} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-10 rounded-full"
              style={{ backgroundColor: stageColor }}
          />
          <div>
            <h2 className="text-xl font-semibold text-white">
              {stage.stage_name}
            </h2>
            <p className="text-sm text-gray-400">
              {STAGE_DESCRIPTION[stage.stage_number]}
            </p>
          </div>
        </div>

        <div className="relative" ref={addMenuRef}>
          <button
            type="button"
            onClick={() =>
              hasSelectableCards && setIsAddMenuOpen((previous) => !previous)
            }
            disabled={!hasSelectableCards}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              hasSelectableCards
                ? 'hover:bg-white/5'
                : 'border-white/10 text-[#E6E9F2]/30 cursor-not-allowed'
            }`}
            style={
              hasSelectableCards
                ? {
                    backgroundColor: `${stageColor}10`,
                    borderColor: `${stageColor}40`,
                    color: stageColor,
                  }
                : undefined
            }
          >
            <Plus className="w-4 h-4" />
            Adicionar card
          </button>

          {isAddMenuOpen && hasSelectableCards && (
            <div className="absolute right-0 mt-2 w-60 rounded-lg border border-white/10 bg-[#0F1115] shadow-xl py-2 z-20">
              {selectableCardTypes.map((cardType) => (
                <button
                  key={cardType}
                  type="button"
                  onClick={() => handleAddCard(cardType)}
                  className="w-full px-3 py-2 text-left text-sm text-[#E6E9F2]/80 hover:text-[#E6E9F2] hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stageColor }}
                  />
                  {CARD_TITLES[cardType] ?? 'Novo card'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {visibleCards.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          {normalizedSearch || showOnlyFilled
            ? 'Nenhum card corresponde aos filtros'
            : 'Nenhum card nesta etapa'}
        </div>
      ) : (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top left',
            width: scaledCanvasWidth,
          }}
        >
          {stageCardTypes.map(renderCard)}
        </div>
      )}
      </div>

      {editState &&
        createPortal(
          <CardEditModal
            cardType={editState.card.card_type}
            cardTitle={CARD_TITLES[editState.card.card_type] || editState.card.card_type}
            content={editState.card.content}
            stageColor={stageColor}
            isOpen={!!editState}
            isSaving={isSavingEdit}
            onClose={closeEditModal}
            onSave={handleSaveEdit}
          />,
          document.body
        )}

      {loadingState.isVisible &&
        createPortal(
          <div className="fixed inset-0 z-[90]">
            <div className="absolute inset-0 bg-[#0A0B0E]/80 backdrop-blur-xl" />
            <div className="relative h-full flex items-center justify-center p-8">
              <div className="max-w-lg w-full animate-fadeIn">
                <div className="bg-gradient-to-br from-[#151821] to-[#1A1D29] rounded-2xl border border-[#9B8AFB]/30 shadow-2xl shadow-[#9B8AFB]/10 p-8">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-[#9B8AFB] border-r-[#7AA2FF] animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9B8AFB]/20 to-[#7AA2FF]/20 border border-[#9B8AFB]/30 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-[#9B8AFB]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold tracking-tight mb-2">
                      Criando seu card...
                    </h3>
                    <p className="text-sm text-[#E6E9F2]/60">
                      {currentLoadingMessage}
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {LOADING_STEPS.map((step) => {
                      const status = getStepStatus(step.id)
                      const isCompleted = status === 'completed'
                      const isActive = status === 'active'

                      return (
                        <div
                          key={step.id}
                          className={`flex items-center gap-3 p-3 bg-white/5 rounded-lg border transition-all ${
                            isActive
                              ? 'border-[#9B8AFB]/30'
                              : 'border-white/10'
                          } ${isCompleted ? '' : ''} ${
                            !isCompleted && !isActive ? 'opacity-50' : ''
                          }`}
                        >
                          {isCompleted ? (
                            <div className="w-5 h-5 rounded-full bg-[#5AD19A]/20 border-2 border-[#5AD19A] flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-[#5AD19A]" />
                            </div>
                          ) : isActive ? (
                            <div className="w-5 h-5 rounded-full border-2 border-[#9B8AFB] flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 rounded-full bg-[#9B8AFB] animate-pulse" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-white/30 flex items-center justify-center flex-shrink-0">
                              <div className="w-2 h-2 rounded-full bg-white/30" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className={`text-xs font-medium ${!isCompleted && !isActive ? 'text-[#E6E9F2]/60' : ''}`}>
                              {step.title}
                            </div>
                            {step.showProgress && isActive && (
                              <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#9B8AFB] to-[#7AA2FF] animate-shimmer" style={{ width: '60%' }} />
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-[#E6E9F2]/40">
                    <Info className="w-3.5 h-3.5" />
                    <span>Isso pode levar alguns segundos</span>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={stopLoadingOverlay}
                      className="px-4 py-2 text-xs font-medium text-[#E6E9F2]/60 hover:text-[#E6E9F2] hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#7AA2FF]/10 border border-[#7AA2FF]/20 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-[#7AA2FF]" />
                    <span className="text-xs text-[#E6E9F2]/80">
                      Dica: Você pode editar qualquer card após a criação
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export const StageSection = forwardRef<HTMLDivElement, StageSectionProps>(
  StageSectionBase
)
