'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import {
  Gem,
  Zap,
  Brain,
  Trophy,
  Sparkles,
  Lightbulb,
  Target,
  Star,
  Plus,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { BaseCard } from '../base-card'
import { EditableField } from '@/components/canvas/editable-field'

interface ValuePoint {
  icon?: string
  title?: string
  text: string
}

interface ValuePropositionContent {
  headline?: string
  proposition?: string
  statement?: string
  pitch?: string
  summary?: string
  differentiators?: Array<ValuePoint | string>
  valuePoints?: Array<ValuePoint | string>
  benefits?: Array<ValuePoint | string>
  reasons?: Array<ValuePoint | string>
  proofPoints?: Array<ValuePoint | string>
  callToAction?: string
}

type PropositionInput =
  | ValuePropositionContent
  | string
  | {
      proposition?: ValuePropositionContent | string
      valuePoints?: Array<ValuePoint | string>
      differentiators?: Array<ValuePoint | string>
      headline?: string
      pitch?: string
    }
  | null
  | undefined

interface ValuePropositionCardProps {
  cardId: string
  proposition?: PropositionInput
  onAiClick?: () => void
  onSave?: (content: { proposition: ValuePropositionContent }) => Promise<void>
}

interface ValuePropositionState {
  headline: string
  callToAction: string
  valuePoints: ValuePoint[]
}

const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  brain: Brain,
  trophy: Trophy,
  sparkles: Sparkles,
  lightbulb: Lightbulb,
  target: Target,
  star: Star,
}

const ICON_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'zap', label: 'Impacto (Zap)' },
  { value: 'brain', label: 'Inteligência (Brain)' },
  { value: 'trophy', label: 'Resultado (Trophy)' },
  { value: 'sparkles', label: 'Experiência (Sparkles)' },
  { value: 'lightbulb', label: 'Ideia (Lightbulb)' },
  { value: 'target', label: 'Foco (Target)' },
  { value: 'star', label: 'Premium (Star)' },
]

const DEFAULT_HEADLINE =
  'Descreva a proposta de valor principal do seu produto. O que torna ele único?'

const DEFAULT_POINTS: ValuePoint[] = [
  { icon: 'zap', text: 'Primeiro diferencial' },
  { icon: 'brain', text: 'Segundo diferencial' },
  { icon: 'trophy', text: 'Terceiro diferencial' },
]

function toStringValue(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  if (typeof value === 'number') {
    return String(value)
  }
  return undefined
}

function firstString(values: unknown[]): string | undefined {
  for (const value of values) {
    const text = toStringValue(value)
    if (text) return text
  }
  return undefined
}

function normalizeIcon(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return ICON_MAP[normalized] ? normalized : undefined
  }
  if (typeof value === 'function') {
    const entry = Object.entries(ICON_MAP).find(([, component]) => component === value)
    return entry?.[0]
  }
  return undefined
}

function normalizeValuePoint(entry: ValuePoint | string | undefined, index: number): ValuePoint | null {
  if (!entry) return null

  if (typeof entry === 'string') {
    const text = entry.trim()
    if (!text) return null
    return {
      text,
      icon: index === 0 ? 'zap' : index === 1 ? 'brain' : index === 2 ? 'trophy' : undefined,
    }
  }

  const point = entry as ValuePoint & Record<string, unknown>
  const text =
    toStringValue(point.text) ??
    toStringValue(point.description) ??
    toStringValue(point.value) ??
    toStringValue(point.benefit) ??
    toStringValue(point.differential) ??
    ''

  if (!text) return null

  return {
    text,
    title: toStringValue(point.title),
    icon:
      normalizeIcon(point.icon) ??
      normalizeIcon((point as Record<string, unknown>).iconName) ??
      normalizeIcon((point as Record<string, unknown>).symbol) ??
      normalizeIcon((point as Record<string, unknown>).emoji),
  }
}

function normalizeValuePoints(content: ValuePropositionContent): ValuePoint[] {
  const candidates = [
    content.valuePoints,
    content.differentiators,
    content.benefits,
    content.reasons,
    content.proofPoints,
  ]

  for (const source of candidates) {
    if (Array.isArray(source) && source.length > 0) {
      const normalized = source
        .map((item, index) => normalizeValuePoint(item, index))
        .filter((item): item is ValuePoint => Boolean(item))
      if (normalized.length > 0) {
        return normalized
      }
    }
  }

  return DEFAULT_POINTS
}

function parseProposition(proposition: PropositionInput): ValuePropositionContent {
  if (!proposition) {
    return {}
  }

  if (typeof proposition === 'string') {
    if (!proposition.trim()) return {}
    try {
      const parsed = JSON.parse(proposition)
      if (parsed && typeof parsed === 'object') {
        return parseProposition(parsed as PropositionInput)
      }
    } catch {
      return { headline: proposition }
    }
  }

  if (typeof proposition === 'object') {
    if (Array.isArray(proposition)) {
      return { differentiators: proposition }
    }

    const data = proposition as ValuePropositionContent & Record<string, unknown>
    const nested =
      data.proposition && typeof data.proposition === 'object'
        ? (data.proposition as ValuePropositionContent)
        : undefined

    return {
      headline:
        firstString([
          data.headline,
          typeof data.proposition === 'string' ? data.proposition : undefined,
          data.statement,
          data.pitch,
          data.summary,
          nested?.headline,
          nested?.statement,
          nested?.pitch,
        ]) ?? '',
      callToAction: toStringValue(data.callToAction) ?? toStringValue(nested?.callToAction),
      differentiators: data.differentiators ?? nested?.differentiators,
      valuePoints: data.valuePoints ?? nested?.valuePoints,
      benefits: data.benefits ?? nested?.benefits,
      reasons: data.reasons ?? nested?.reasons,
      proofPoints: data.proofPoints ?? nested?.proofPoints,
    }
  }

  return {}
}

function sanitizeValuePoints(points: ValuePoint[]): ValuePoint[] {
  const sanitized: ValuePoint[] = []
  points.forEach((point) => {
    const text = point.text.trim()
    if (!text) return
    sanitized.push({
      text,
      title: point.title?.trim() || undefined,
      icon: point.icon,
    })
  })
  return sanitized
}

function preparePayload(state: ValuePropositionState): ValuePropositionContent {
  const sanitizedPoints = sanitizeValuePoints(state.valuePoints)
  const headline = state.headline.trim()
  const callToAction = state.callToAction.trim()

  return {
    headline: headline || undefined,
    statement: headline || undefined,
    callToAction: callToAction || undefined,
    differentiators: sanitizedPoints,
    valuePoints: sanitizedPoints,
  }
}

function resolveIcon(name?: string) {
  if (!name) return Zap
  return ICON_MAP[name] ?? Zap
}

function PointEditor({
  index,
  point,
  onChange,
  onRemove,
}: {
  index: number
  point: ValuePoint
  onChange: (updates: Partial<ValuePoint>) => void
  onRemove: () => void
}) {
  const [isTitleEditing, setIsTitleEditing] = useState(false)
  const [isTextEditing, setIsTextEditing] = useState(false)

  return (
    <div className="rounded-lg border border-white/10 bg-white/2 px-4 py-3 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <EditableField
          value={point.title ?? ''}
          placeholder="Título (opcional)"
          className="text-xs font-semibold text-[#E6E9F2]/80"
          isEditing={isTitleEditing}
          onStartEdit={() => setIsTitleEditing(true)}
          onCancelEdit={() => setIsTitleEditing(false)}
          onSave={(value) => {
            setIsTitleEditing(false)
            onChange({ title: value.trim() || undefined })
          }}
        />
        <button
          type="button"
          onClick={onRemove}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/10 text-[#E6E9F2]/40 transition hover:border-[#FF6B6B]/40 hover:text-[#FF6B6B]"
          aria-label={`Remover diferencial ${index + 1}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <EditableField
        value={point.text}
        placeholder="Descreva o benefício com foco no usuário."
        multiline
        className="text-xs leading-relaxed text-[#E6E9F2]/70"
        isEditing={isTextEditing}
        onStartEdit={() => setIsTextEditing(true)}
        onCancelEdit={() => setIsTextEditing(false)}
        onSave={(value) => {
          setIsTextEditing(false)
          onChange({ text: value.trim() || point.text })
        }}
      />

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#E6E9F2]/60">
        <span className="uppercase tracking-wide">Ícone</span>
        <select
          value={point.icon ?? ''}
          onChange={(event) => onChange({ icon: event.target.value || undefined })}
          className="rounded-md border border-white/10 bg-[#0F1115] px-2 py-1 text-[11px] text-[#E6E9F2]/70 focus:outline-none focus:ring-2 focus:ring-[#5AD19A]/30"
        >
          <option value="">Padrão</option>
          {ICON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function ValuePropositionCard({
  cardId,
  proposition,
  onAiClick,
  onSave,
}: ValuePropositionCardProps) {
  const parsed = useMemo(() => parseProposition(proposition), [proposition])
  const [state, setState] = useState<ValuePropositionState>({
    headline:
      parsed.headline ||
      parsed.proposition ||
      parsed.statement ||
      parsed.pitch ||
      parsed.summary ||
      '',
    callToAction: parsed.callToAction ?? '',
    valuePoints: normalizeValuePoints(parsed),
  })

  useEffect(() => {
    setState({
      headline:
        parsed.headline ||
        parsed.proposition ||
        parsed.statement ||
        parsed.pitch ||
        parsed.summary ||
        '',
      callToAction: parsed.callToAction ?? '',
      valuePoints: normalizeValuePoints(parsed),
    })
  }, [parsed])

  const updateState = useCallback(
    (updates: Partial<ValuePropositionState>) => {
      setState((previous) => {
        const next = { ...previous, ...updates }
        void onSave?.({ proposition: preparePayload(next) })
        return next
      })
    },
    [onSave]
  )

  const updatePoint = useCallback(
    (index: number, updates: Partial<ValuePoint>) => {
      updateState({
        valuePoints: state.valuePoints.map((point, position) =>
          position === index ? { ...point, ...updates } : point
        ),
      })
    },
    [state.valuePoints, updateState]
  )

  const removePoint = useCallback(
    (index: number) => {
      const next = state.valuePoints.filter((_, position) => position !== index)
      updateState({ valuePoints: next.length > 0 ? next : DEFAULT_POINTS })
    },
    [state.valuePoints, updateState]
  )

  const addPoint = useCallback(() => {
    updateState({
      valuePoints: [
        ...state.valuePoints,
        { icon: 'sparkles', text: 'Descreva outro diferencial relevante.' },
      ],
    })
  }, [state.valuePoints, updateState])

  const [isHeadlineEditing, setIsHeadlineEditing] = useState(false)
  const [isCtaEditing, setIsCtaEditing] = useState(false)

  return (
      <BaseCard
        cardId={cardId}
        cardTitle="Proposta de Valor"
        icon={Gem}
        stageColor="#5AD19A"
        onAiClick={onAiClick}
      >
      <EditableField
        value={state.headline}
        placeholder={DEFAULT_HEADLINE}
        className="text-sm font-semibold text-[#E6E9F2]/90 leading-relaxed"
        multiline
        isEditing={isHeadlineEditing}
        onStartEdit={() => setIsHeadlineEditing(true)}
        onCancelEdit={() => setIsHeadlineEditing(false)}
        onSave={(value) => {
          setIsHeadlineEditing(false)
          updateState({ headline: value.trim() })
        }}
      />

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#E6E9F2]/40">
            Chamada principal
          </span>
          <button
            type="button"
            className="text-[11px] text-[#5AD19A]"
            onClick={() => setIsCtaEditing((previous) => !previous)}
          >
            {isCtaEditing ? 'Concluir' : 'Editar'}
          </button>
        </div>
        <EditableField
          value={state.callToAction}
          placeholder="Ex.: Comece grátis em 2 minutos."
          className="text-xs text-[#E6E9F2]/70"
          multiline
          isEditing={isCtaEditing}
          onStartEdit={() => setIsCtaEditing(true)}
          onCancelEdit={() => setIsCtaEditing(false)}
          onSave={(value) => {
            setIsCtaEditing(false)
            updateState({ callToAction: value.trim() })
          }}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[#E6E9F2]/40">
          <span>Por que escolher este projeto</span>
          <button
            type="button"
            onClick={addPoint}
            className="flex items-center gap-1 rounded-full border border-dashed border-[#5AD19A]/40 px-2 py-1 text-[11px] text-[#5AD19A] transition hover:border-[#5AD19A]"
          >
            <Plus className="h-3 w-3" />
            Adicionar
          </button>
        </div>

        <ul className="space-y-2">
          {state.valuePoints.map((point, index) => {
            const IconComponent = resolveIcon(point.icon)
            return (
              <li key={`${point.text}-${index}`} className="space-y-2">
                <div className="flex items-start gap-2">
                  <IconComponent className="h-3.5 w-3.5 flex-shrink-0 text-[#5AD19A]" />
                  <div className="flex-1">
                    <PointEditor
                      index={index}
                      point={point}
                      onChange={(updates) => updatePoint(index, updates)}
                      onRemove={() => removePoint(index)}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </BaseCard>
  )
}
