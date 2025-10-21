'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { BarChart3, Plus, Trash2 } from 'lucide-react'
import { BaseCard } from '../base-card'
import { EditableField } from '@/components/canvas/editable-field'

interface Competitor {
  id?: string
  name?: string
  category?: string
  summary?: string
  strengths?: string[]
  weaknesses?: string[]
  differentiator?: string
  pricePoint?: string
  notes?: string[]
}

type BenchmarkingInput =
  | Competitor[]
  | string
  | {
      competitors?: Competitor[] | string
      benchmarking?: Competitor[] | string
      items?: Competitor[] | string
      list?: Competitor[] | string
      value?: Competitor[] | string
    }
  | null
  | undefined

interface BenchmarkingCardProps {
  cardId: string
  benchmarking?: BenchmarkingInput
  onSave?: (content: { benchmarking: Competitor[] }) => Promise<void>
}

const DEFAULT_COMPETITORS: Competitor[] = [
  {
    name: 'Concorrente direto',
    category: 'Direto',
    summary:
      'Descreva um produto que resolve o mesmo problema e destaque pontos fortes e fracos.',
  },
  {
    name: 'Alternativa indireta',
    category: 'Indireto',
    summary: 'Inclua soluções alternativas ou substitutos que os usuários usam hoje.',
  },
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

function toList(value: unknown): string[] {
  if (!value) return []

  if (Array.isArray(value)) {
    return value
      .map((item) => toStringValue(item))
      .filter((item): item is string => Boolean(item))
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return toList(parsed)
      }
    } catch {
      // fall back to string parsing
    }

    return value
      .split(/[\n•\-]/)
      .map((item) => toStringValue(item))
      .filter((item): item is string => Boolean(item))
  }

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map((item) => toStringValue(item))
      .filter((item): item is string => Boolean(item))
  }

  return []
}

function normalizeCompetitor(entry: unknown): Competitor | null {
  if (!entry) return null

  if (typeof entry === 'string') {
    const text = entry.trim()
    if (!text) return null
    return { name: text }
  }

  if (Array.isArray(entry)) {
    const [name, category, summary] = entry
    return {
      name: toStringValue(name),
      category: toStringValue(category),
      summary: toStringValue(summary),
    }
  }

  if (typeof entry === 'object') {
    const competitor = entry as Competitor & Record<string, unknown>
    return {
      id: competitor.id,
      name:
        toStringValue(competitor.name) ??
        toStringValue(competitor.product) ??
        toStringValue(competitor.company),
      category:
        toStringValue(competitor.category) ??
        toStringValue(competitor.type) ??
        toStringValue(competitor.segment) ??
        toStringValue(competitor.tag),
      summary:
        toStringValue(competitor.summary) ??
        toStringValue(competitor.description) ??
        toStringValue(competitor.overview),
      strengths: toList(
        competitor.strengths ??
          competitor.pros ??
          competitor.advantages ??
          competitor['strengths.list']
      ),
      weaknesses: toList(
        competitor.weaknesses ??
          competitor.cons ??
          competitor.fracos ??
          competitor['weaknesses.list']
      ),
      differentiator:
        toStringValue(competitor.differentiator) ??
        toStringValue(competitor.ourAdvantage) ??
        toStringValue(competitor.oQueNosDiferencia),
      pricePoint:
        toStringValue(competitor.pricePoint) ??
        toStringValue(competitor.pricing) ??
        toStringValue(competitor.preco),
      notes: toList(competitor.notes),
    }
  }

  return null
}

function parseBenchmarking(benchmarking?: BenchmarkingInput): Competitor[] {
  if (!benchmarking) return DEFAULT_COMPETITORS

  if (typeof benchmarking === 'string') {
    if (!benchmarking.trim()) return DEFAULT_COMPETITORS

    try {
      const parsed = JSON.parse(benchmarking)
      return parseBenchmarking(parsed as BenchmarkingInput)
    } catch {
      const lines = benchmarking
        .split(/\n{2,}/)
        .map((line) => line.trim())
        .filter(Boolean)

      if (lines.length === 0) {
        return DEFAULT_COMPETITORS
      }

      return lines
        .map((line) => normalizeCompetitor(line))
        .filter((item): item is Competitor => Boolean(item))
    }
  }

  if (Array.isArray(benchmarking)) {
    const normalized = benchmarking
      .map((item) => normalizeCompetitor(item))
      .filter((item): item is Competitor => Boolean(item))

    return normalized.length > 0 ? normalized : DEFAULT_COMPETITORS
  }

  if (typeof benchmarking === 'object') {
    const bag = benchmarking as Record<string, unknown>
    const source =
      bag.competitors ??
      bag.benchmarking ??
      bag.items ??
      bag.list ??
      bag.value ??
      benchmarking

    if (Array.isArray(source)) {
      const normalized = source
        .map((item) => normalizeCompetitor(item))
        .filter((item): item is Competitor => Boolean(item))
      return normalized.length > 0 ? normalized : DEFAULT_COMPETITORS
    }

    if (typeof source === 'string') {
      return parseBenchmarking(source)
    }
  }

  return DEFAULT_COMPETITORS
}

function sanitizeCompetitors(competitors: Competitor[]): Competitor[] {
  const sanitized: Competitor[] = []

  competitors.forEach((competitor) => {
    const name = competitor.name?.trim()
    const category = competitor.category?.trim()
    const summary = competitor.summary?.trim()
    const differentiator = competitor.differentiator?.trim()
    const pricePoint = competitor.pricePoint?.trim()

    const strengths = Array.from(
      new Set((competitor.strengths ?? []).map((item) => item.trim()).filter(Boolean))
    )
    const weaknesses = Array.from(
      new Set((competitor.weaknesses ?? []).map((item) => item.trim()).filter(Boolean))
    )

    const notes = (competitor.notes ?? []).map((item) => item.trim()).filter(Boolean)

    if (!name && !summary && strengths.length === 0 && weaknesses.length === 0) {
      return
    }

    sanitized.push({
      id: competitor.id,
      name: name || undefined,
      category: category || undefined,
      summary: summary || undefined,
      strengths,
      weaknesses,
      differentiator: differentiator || undefined,
      pricePoint: pricePoint || undefined,
      notes,
    })
  })

  return sanitized
}

interface EditableListProps {
  label: string
  values: string[]
  accentColor: string
  placeholder: string
  onChange: (values: string[]) => void
}

function EditableList({ label, values, accentColor, placeholder, onChange }: EditableListProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(values.join('\n'))

  useEffect(() => {
    setDraft(values.join('\n'))
  }, [values])

  const handleSave = () => {
    const normalized = Array.from(
      new Set(
        draft
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean)
      )
    )
    setIsEditing(false)
    onChange(normalized)
  }

  const handleCancel = () => {
    setDraft(values.join('\n'))
    setIsEditing(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[#E6E9F2]/40">
        <span>{label}</span>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                className="text-[11px] font-semibold text-[#5AD19A]"
                onClick={handleSave}
              >
                Salvar
              </button>
              <button
                type="button"
                className="text-[11px] text-[#E6E9F2]/50"
                onClick={handleCancel}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              className="text-[11px] text-[#5AD19A]"
              onClick={() => setIsEditing(true)}
            >
              Editar
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="w-full min-h-[90px] rounded-lg border border-[#5AD19A]/30 bg-white/5 px-3 py-2 text-xs text-[#E6E9F2]/80 focus:outline-none focus:ring-2 focus:ring-[#5AD19A]/40"
          placeholder={placeholder}
        />
      ) : values.length > 0 ? (
        <ul className="space-y-1.5">
          {values.map((item, index) => (
            <li key={`${item}-${index}`} className="flex items-start gap-2 text-xs text-[#E6E9F2]/70">
              <span
                className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-[#E6E9F2]/40">{placeholder}</p>
      )}
    </div>
  )
}

function CompetitorEditor({
  index,
  competitor,
  onChange,
  onRemove,
}: {
  index: number
  competitor: Competitor
  onChange: (updates: Partial<Competitor>) => void
  onRemove: () => void
}) {
  const [isNameEditing, setIsNameEditing] = useState(false)
  const [isCategoryEditing, setIsCategoryEditing] = useState(false)
  const [isSummaryEditing, setIsSummaryEditing] = useState(false)
  const [isDiffEditing, setIsDiffEditing] = useState(false)
  const [isPriceEditing, setIsPriceEditing] = useState(false)

  return (
    <div className="space-y-3 rounded-lg border border-white/5 bg-white/2 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1.5">
          <EditableField
            value={competitor.name ?? ''}
            placeholder={`Concorrente ${index + 1}`}
            className="text-xs font-semibold text-[#E6E9F2]/90"
            isEditing={isNameEditing}
            onStartEdit={() => setIsNameEditing(true)}
            onCancelEdit={() => setIsNameEditing(false)}
            onSave={(value) => {
              setIsNameEditing(false)
              onChange({ name: value.trim() || undefined })
            }}
          />
          <EditableField
            value={competitor.category ?? ''}
            placeholder="Categoria (Direto, Indireto, Substituto...)"
            className="text-[11px] uppercase tracking-wide text-[#5AD19A]"
            isEditing={isCategoryEditing}
            onStartEdit={() => setIsCategoryEditing(true)}
            onCancelEdit={() => setIsCategoryEditing(false)}
            onSave={(value) => {
              setIsCategoryEditing(false)
              onChange({ category: value.trim() || undefined })
            }}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/10 text-[#E6E9F2]/40 transition hover:border-[#FF6B6B]/40 hover:text-[#FF6B6B]"
          aria-label={`Remover concorrente ${index + 1}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#E6E9F2]/40">
            Resumo
          </span>
          <button
            type="button"
            className="text-[11px] text-[#5AD19A]"
            onClick={() => setIsSummaryEditing((previous) => !previous)}
          >
            {isSummaryEditing ? 'Concluir' : 'Editar'}
          </button>
        </div>
        <EditableField
          value={competitor.summary ?? ''}
          placeholder="Como o concorrente posiciona sua solução? Quais diferenciais percebidos?"
          multiline
          className="text-xs text-[#E6E9F2]/70 leading-relaxed"
          isEditing={isSummaryEditing}
          onStartEdit={() => setIsSummaryEditing(true)}
          onCancelEdit={() => setIsSummaryEditing(false)}
          onSave={(value) => {
            setIsSummaryEditing(false)
            onChange({ summary: value.trim() || undefined })
          }}
        />
      </div>

      <EditableList
        label="Pontos fortes"
        values={competitor.strengths ?? []}
        accentColor="#5AD19A"
        placeholder="Quais as vantagens percebidas pelos usuários? (um por linha)"
        onChange={(strengths) => onChange({ strengths })}
      />

      <EditableList
        label="Pontos fracos"
        values={competitor.weaknesses ?? []}
        accentColor="#FF6B6B"
        placeholder="Onde este concorrente falha? (um por linha)"
        onChange={(weaknesses) => onChange({ weaknesses })}
      />

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#E6E9F2]/40">
            Nosso diferencial
          </span>
          <button
            type="button"
            className="text-[11px] text-[#5AD19A]"
            onClick={() => setIsDiffEditing((previous) => !previous)}
          >
            {isDiffEditing ? 'Concluir' : 'Editar'}
          </button>
        </div>
        <EditableField
          value={competitor.differentiator ?? ''}
          placeholder="O que entregamos de único em relação a este concorrente?"
          multiline
          className="text-xs text-[#E6E9F2]/70 leading-relaxed"
          isEditing={isDiffEditing}
          onStartEdit={() => setIsDiffEditing(true)}
          onCancelEdit={() => setIsDiffEditing(false)}
          onSave={(value) => {
            setIsDiffEditing(false)
            onChange({ differentiator: value.trim() || undefined })
          }}
        />
      </div>

      <EditableField
        value={competitor.pricePoint ?? ''}
        placeholder="Faixa de preço / modelo de monetização (opcional)"
        className="text-xs text-[#E6E9F2]/60"
        isEditing={isPriceEditing}
        onStartEdit={() => setIsPriceEditing(true)}
        onCancelEdit={() => setIsPriceEditing(false)}
        onSave={(value) => {
          setIsPriceEditing(false)
          onChange({ pricePoint: value.trim() || undefined })
        }}
      />
    </div>
  )
}

export function BenchmarkingCard({
  cardId,
  benchmarking,
  onSave,
}: BenchmarkingCardProps) {
  const parsedCompetitors = useMemo(() => parseBenchmarking(benchmarking), [benchmarking])
  const [competitors, setCompetitors] = useState<Competitor[]>(parsedCompetitors)

  useEffect(() => {
    setCompetitors(parsedCompetitors)
  }, [parsedCompetitors])

  const updateCompetitors = useCallback(
    (next: Competitor[]) => {
      setCompetitors(next)
      void onSave?.({ benchmarking: sanitizeCompetitors(next) })
    },
    [onSave]
  )

  const updateCompetitor = useCallback(
    (index: number, updates: Partial<Competitor>) => {
      updateCompetitors(
        competitors.map((competitor, position) =>
          position === index ? { ...competitor, ...updates } : competitor
        )
      )
    },
    [competitors, updateCompetitors]
  )

  const removeCompetitor = useCallback(
    (index: number) => {
      const next = competitors.filter((_, position) => position !== index)
      updateCompetitors(next.length > 0 ? next : DEFAULT_COMPETITORS)
    },
    [competitors, updateCompetitors]
  )

  const addCompetitor = () => {
    updateCompetitors([
      ...competitors,
      {
        name: 'Novo concorrente',
        category: 'Direto',
        summary: '',
        strengths: [],
        weaknesses: [],
      },
    ])
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Benchmarking"
      icon={BarChart3}
      stageColor="#5AD19A"
      showAiButton={false}
    >
      <div className="space-y-3">
        {competitors.map((competitor, index) => (
          <CompetitorEditor
            key={competitor.id ?? competitor.name ?? index}
            index={index}
            competitor={competitor}
            onChange={(updates) => updateCompetitor(index, updates)}
            onRemove={() => removeCompetitor(index)}
          />
        ))}

        <button
          type="button"
          onClick={addCompetitor}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#5AD19A]/40 px-3 py-2 text-sm text-[#5AD19A] transition hover:border-[#5AD19A] hover:bg-[#5AD19A]/10"
        >
          <Plus className="h-4 w-4" />
          Adicionar concorrente
        </button>
      </div>
    </BaseCard>
  )
}
