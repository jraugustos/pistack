'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { ClipboardCheck, Trash2, Plus } from 'lucide-react'
import { BaseCard } from '../base-card'
import { EditableField } from '@/components/canvas/editable-field'

interface Hypothesis {
  id?: string
  label?: string
  category?: string
  statement?: string
  description?: string
  successMetric?: string
  confidence?: string
  risk?: string
}

type HypothesesInput =
  | Hypothesis[]
  | string
  | {
      hypotheses?: Hypothesis[] | string
      items?: Hypothesis[] | string
      value?: Hypothesis[] | string
      list?: Hypothesis[] | string
    }
  | null
  | undefined

interface ValidationHypothesesCardProps {
  cardId: string
  hypotheses?: HypothesesInput
  onSave?: (content: { hypotheses: Hypothesis[] }) => Promise<void>
}

const DEFAULT_HYPOTHESES: Hypothesis[] = [
  {
    label: 'H1',
    category: 'Problema',
    statement: 'Acreditamos que [persona] enfrenta [dor] porque [causa].',
    successMetric: 'Validar com X entrevistas onde 70% mencionam a dor.',
  },
  {
    label: 'H2',
    category: 'Solução',
    statement: 'Se oferecermos [solução], esperamos reduzir [dor] em [métrica].',
    successMetric: 'Teste com 20 usuários; 80% devem concluir o fluxo sem ajuda.',
  },
  {
    label: 'H3',
    category: 'Valor',
    statement: 'Usuários pagarão [valor] se entregarmos [benefício].',
    successMetric: 'Pesquisa de intenção de pagamento com NPS > 30.',
  },
]

function toHypothesisArray(input: unknown): Hypothesis[] {
  if (!input) return []

  if (Array.isArray(input)) {
    return input.map((item) => toHypothesisObject(item)).filter((item): item is Hypothesis => Boolean(item))
  }

  if (typeof input === 'string') {
    if (!input.trim()) return []

    try {
      const parsed = JSON.parse(input)
      return toHypothesisArray(parsed)
    } catch {
      const lines = input
        .split(/\n{2,}/)
        .map((line) => line.trim())
        .filter(Boolean)

      return lines.map((line, index) => ({
        label: `H${index + 1}`,
        statement: line,
      }))
    }
  }

  if (typeof input === 'object') {
    const bag = input as Record<string, unknown>
    const source =
      bag.hypotheses ??
      bag.items ??
      bag.value ??
      bag.list ??
      input

    if (Array.isArray(source) || typeof source === 'string') {
      return toHypothesisArray(source)
    }
  }

  return []
}

function toHypothesisObject(entry: unknown): Hypothesis | null {
  if (!entry) return null

  if (typeof entry === 'string') {
    const trimmed = entry.trim()
    if (!trimmed) return null

    return {
      statement: trimmed,
    }
  }

  if (typeof entry === 'object') {
    const item = entry as Hypothesis & Record<string, unknown>
    return {
      id: item.id,
      label:
        (item.label as string) ||
        (typeof item.position === 'number' ? `H${item.position}` : undefined),
      category:
        (item.category as string) ||
        (item.type as string) ||
        (item.focus as string) ||
        (item['categoria'] as string) ||
        undefined,
      statement:
        (item.statement as string) ||
        (item.description as string) ||
        (item.hypothesis as string) ||
        (item.text as string) ||
        undefined,
      successMetric:
        (item.successMetric as string) ||
        (item.metric as string) ||
        (item.metricOfSuccess as string) ||
        (item.metricas as string) ||
        (item.indicator as string) ||
        undefined,
      confidence: (item.confidence as string) ?? undefined,
      risk: (item.risk as string) ?? undefined,
    }
  }

  return null
}

function parseHypotheses(hypotheses?: HypothesesInput): Hypothesis[] {
  const parsed = toHypothesisArray(hypotheses)
  if (parsed.length === 0) {
    return DEFAULT_HYPOTHESES
  }
  return parsed
}

function sanitizeHypotheses(items: Hypothesis[]): Hypothesis[] {
  return items
    .map((item, index) => {
      const label = item.label?.trim() || `H${index + 1}`
      const statement = (item.statement ?? item.description ?? '').trim()
      const category = item.category?.trim() || undefined
      const successMetric = item.successMetric?.trim() || undefined
      const confidence = item.confidence?.trim() || undefined
      const risk = item.risk?.trim() || undefined

      return {
        id: item.id,
        label,
        category,
        statement: statement || undefined,
        successMetric,
        confidence,
        risk,
      }
    })
    .filter((item) => item.statement || item.successMetric || item.category)
}

function HypothesisEditor({
  index,
  hypothesis,
  onChange,
  onRemove,
}: {
  index: number
  hypothesis: Hypothesis
  onChange: (updates: Partial<Hypothesis>) => void
  onRemove: () => void
}) {
  const [isLabelEditing, setIsLabelEditing] = useState(false)
  const [isCategoryEditing, setIsCategoryEditing] = useState(false)
  const [isStatementEditing, setIsStatementEditing] = useState(false)
  const [isSuccessEditing, setIsSuccessEditing] = useState(false)
  const [isConfidenceEditing, setIsConfidenceEditing] = useState(false)
  const [isRiskEditing, setIsRiskEditing] = useState(false)

  return (
    <div className="space-y-3 rounded-lg border border-white/5 bg-white/2 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1.5">
          <EditableField
            value={hypothesis.label ?? `H${index + 1}`}
            placeholder={`H${index + 1}`}
            className="text-xs font-semibold text-[#E6E9F2]/90"
            isEditing={isLabelEditing}
            onStartEdit={() => setIsLabelEditing(true)}
            onCancelEdit={() => setIsLabelEditing(false)}
            onSave={(value) => {
              setIsLabelEditing(false)
              onChange({ label: value.trim() || `H${index + 1}` })
            }}
          />
          <EditableField
            value={hypothesis.category ?? ''}
            placeholder="Categoria (Problema, Solução...)"
            className="text-[11px] font-semibold text-[#5AD19A]"
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
          aria-label="Remover hipótese"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#E6E9F2]/40">
            Hipótese
          </span>
          <button
            type="button"
            className="text-[11px] text-[#5AD19A]"
            onClick={() => setIsStatementEditing((previous) => !previous)}
          >
            {isStatementEditing ? 'Concluir' : 'Editar'}
          </button>
        </div>
        <EditableField
          value={hypothesis.statement ?? ''}
          placeholder="Descreva a hipótese de forma testável."
          className="text-xs leading-relaxed text-[#E6E9F2]/70"
          multiline
          isEditing={isStatementEditing}
          onStartEdit={() => setIsStatementEditing(true)}
          onCancelEdit={() => setIsStatementEditing(false)}
          onSave={(value) => {
            setIsStatementEditing(false)
            onChange({ statement: value.trim() || undefined })
          }}
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#E6E9F2]/40">
            Métrica de sucesso
          </span>
          <button
            type="button"
            className="text-[11px] text-[#5AD19A]"
            onClick={() => setIsSuccessEditing((previous) => !previous)}
          >
            {isSuccessEditing ? 'Concluir' : 'Editar'}
          </button>
        </div>
        <EditableField
          value={hypothesis.successMetric ?? ''}
          placeholder="Qual métrica comprova que a hipótese foi validada?"
          className="text-xs leading-relaxed text-[#E6E9F2]/70"
          multiline
          isEditing={isSuccessEditing}
          onStartEdit={() => setIsSuccessEditing(true)}
          onCancelEdit={() => setIsSuccessEditing(false)}
          onSave={(value) => {
            setIsSuccessEditing(false)
            onChange({ successMetric: value.trim() || undefined })
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2 text-[11px] text-[#E6E9F2]/60">
        <EditableField
          value={hypothesis.confidence ?? ''}
          placeholder="Nível de confiança (opcional)"
          className="rounded-full border border-white/10 px-3 py-1"
          isEditing={isConfidenceEditing}
          onStartEdit={() => setIsConfidenceEditing(true)}
          onCancelEdit={() => setIsConfidenceEditing(false)}
          onSave={(value) => {
            setIsConfidenceEditing(false)
            onChange({ confidence: value.trim() || undefined })
          }}
        />
        <EditableField
          value={hypothesis.risk ?? ''}
          placeholder="Risco associado (opcional)"
          className="rounded-full border border-white/10 px-3 py-1"
          isEditing={isRiskEditing}
          onStartEdit={() => setIsRiskEditing(true)}
          onCancelEdit={() => setIsRiskEditing(false)}
          onSave={(value) => {
            setIsRiskEditing(false)
            onChange({ risk: value.trim() || undefined })
          }}
        />
      </div>
    </div>
  )
}

export function ValidationHypothesesCard({
  cardId,
  hypotheses,
  onSave,
}: ValidationHypothesesCardProps) {
  const parsed = useMemo(() => parseHypotheses(hypotheses), [hypotheses])
  const [items, setItems] = useState<Hypothesis[]>(parsed)

  useEffect(() => {
    setItems(parsed)
  }, [parsed])

  const commit = useCallback(
    (nextItems: Hypothesis[]) => {
      setItems(nextItems)
      void onSave?.({ hypotheses: sanitizeHypotheses(nextItems) })
    },
    [onSave]
  )

  const updateItem = useCallback(
    (index: number, updates: Partial<Hypothesis>) => {
      commit(
        items.map((item, position) => (position === index ? { ...item, ...updates } : item))
      )
    },
    [commit, items]
  )

  const removeItem = useCallback(
    (index: number) => {
      const next = items.filter((_, position) => position !== index)
      commit(next.length > 0 ? next : DEFAULT_HYPOTHESES)
    },
    [commit, items]
  )

  const addItem = () => {
    const nextIndex = items.length + 1
    commit([
      ...items,
      {
        label: `H${nextIndex}`,
        category: 'Problema',
        statement: '',
      },
    ])
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Hipóteses de Validação"
      icon={ClipboardCheck}
      stageColor="#5AD19A"
      showAiButton={false}
    >
      <div className="space-y-3">
        {items.map((item, index) => (
          <HypothesisEditor
            key={item.id ?? item.label ?? index}
            index={index}
            hypothesis={item}
            onChange={(updates) => updateItem(index, updates)}
            onRemove={() => removeItem(index)}
          />
        ))}
        <button
          type="button"
          onClick={addItem}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#5AD19A]/40 px-3 py-2 text-sm text-[#5AD19A] transition hover:border-[#5AD19A] hover:bg-[#5AD19A]/10"
        >
          <Plus className="h-4 w-4" />
          Adicionar hipótese
        </button>
      </div>
    </BaseCard>
  )
}
