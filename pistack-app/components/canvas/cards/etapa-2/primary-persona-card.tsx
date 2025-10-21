'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { User, Quote } from 'lucide-react'
import { BaseCard } from '../base-card'
import { EditableField } from '@/components/canvas/editable-field'

interface PersonaContent {
  name?: string
  age?: string | number
  role?: string
  income?: string
  company?: string
  goals?: string[]
  frustrations?: string[]
  quote?: string
  behaviors?: string[]
  motivations?: string[]
  pains?: string[]
}

type PersonaInput = PersonaContent | string | null | undefined

interface PrimaryPersonaCardProps {
  cardId: string
  persona?: PersonaInput
  onAiClick?: () => void
  onSave?: (content: { persona: PersonaContent }) => Promise<void>
}

const DEFAULT_GOALS = [
  'Descreva os objetivos e motivações da persona',
  'Liste o que ela deseja alcançar com o produto',
]

const DEFAULT_FRUSTRATIONS = [
  'Quais obstáculos a persona encontra hoje?',
  'Registre dores e comportamentos que seu produto resolve',
]

function toStringValue(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

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

function ensureArray(value: unknown): string[] {
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
        return ensureArray(parsed)
      }
    } catch {
      // ignore json parsing errors
    }
    return value
      .split(/[\n•|-]/)
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

function sanitizeList(list: string[]): string[] {
  return Array.from(
    new Set(
      list
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
}

function parsePersona(persona: PersonaInput): PersonaContent {
  if (!persona) {
    return {}
  }

  if (typeof persona === 'string') {
    try {
      const parsed = JSON.parse(persona)
      if (parsed && typeof parsed === 'object') {
        return parsePersona(parsed)
      }
    } catch {
      return { name: persona }
    }
  }

  if (typeof persona === 'object') {
    const data = persona as PersonaContent & Record<string, unknown>
    return {
      name: firstString([data.name, data.fullName, data.personaName, data.primaryPersona]),
      age: (() => {
        const rawAge = data.age ?? data.idade ?? data.personaAge
        if (typeof rawAge === 'number') return rawAge
        return toStringValue(rawAge)
      })(),
      role: firstString([
        data.role,
        data.profession,
        data.profissao,
        data.jobTitle,
        data.tituloProfissional,
      ]),
      income: firstString([data.income, data.renda, data.rendaMensal, data.salaryRange, data.faixaRenda]),
      company: toStringValue(data.company),
      goals: ensureArray(
        data.goals ??
          data.objetivos ??
          data.objectives ??
          data.motivations ??
          data.jobToBeDone ??
          data.jobs ??
          data['goals.list']
      ),
      frustrations: ensureArray(
        data.frustrations ??
          data.dores ??
          data.pains ??
          data.painPoints ??
          data['frustrations.list']
      ),
      quote:
        toStringValue(data.quote) ??
        toStringValue(data.citacao) ??
        toStringValue(data.catchphrase) ??
        toStringValue(data.personaQuote),
      behaviors: ensureArray(data.behaviors ?? data.habits ?? data.comportamentos),
      motivations: ensureArray(data.motivations),
      pains: ensureArray(data.pains ?? data.painPoints),
    }
  }

  return {}
}

function normalizePersonaForSave(persona: PersonaContent): PersonaContent {
  return {
    name: persona.name?.trim() || undefined,
    age: persona.age,
    role: persona.role?.trim() || undefined,
    income: persona.income?.trim() || undefined,
    company: persona.company?.trim() || undefined,
    goals: sanitizeList(persona.goals ?? []),
    frustrations: sanitizeList(persona.frustrations ?? (persona.pains ?? [])),
    quote: persona.quote?.trim() || undefined,
    behaviors: sanitizeList(persona.behaviors ?? []),
    motivations: sanitizeList(persona.motivations ?? []),
    pains: sanitizeList(persona.pains ?? []),
  }
}

interface EditableListSectionProps {
  title: string
  values: string[]
  emptyPlaceholder: string
  accentColor: string
  onChange: (values: string[]) => void
}

function EditableListSection({
  title,
  values,
  emptyPlaceholder,
  accentColor,
  onChange,
}: EditableListSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(values.join('\n'))

  useEffect(() => {
    setDraft(values.join('\n'))
  }, [values])

  const handleSave = () => {
    const normalized = sanitizeList(
      draft
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)
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
        <span>{title}</span>
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
          className="w-full min-h-[96px] resize-vertical rounded-lg border border-[#5AD19A]/30 bg-white/5 px-3 py-2 text-xs text-[#E6E9F2]/80 focus:outline-none focus:ring-2 focus:ring-[#5AD19A]/40"
          placeholder={emptyPlaceholder}
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
        <p className="text-xs text-[#E6E9F2]/40">{emptyPlaceholder}</p>
      )}
    </div>
  )
}

export function PrimaryPersonaCard({
  cardId,
  persona,
  onAiClick,
  onSave,
}: PrimaryPersonaCardProps) {
  const parsedPersona = useMemo(() => parsePersona(persona), [persona])
  const [personaState, setPersonaState] = useState<PersonaContent>(parsedPersona)
  const [quoteDraft, setQuoteDraft] = useState(parsedPersona.quote ?? '')

  useEffect(() => {
    setPersonaState(parsedPersona)
    setQuoteDraft(parsedPersona.quote ?? '')
  }, [parsedPersona])

  const updatePersona = useCallback(
    (updates: Partial<PersonaContent>) => {
      setPersonaState((previous) => {
        const next = {
          ...previous,
          ...updates,
        }
        void onSave?.({ persona: normalizePersonaForSave(next) })
        return next
      })
    },
    [onSave]
  )

  const goals = personaState.goals && personaState.goals.length > 0 ? personaState.goals : DEFAULT_GOALS
  const frustrations =
    (personaState.frustrations && personaState.frustrations.length > 0
      ? personaState.frustrations
      : personaState.pains && personaState.pains.length > 0
        ? personaState.pains
        : null) ?? DEFAULT_FRUSTRATIONS

  const displayBehaviors = personaState.behaviors ?? []

  const [isQuoteEditing, setIsQuoteEditing] = useState(false)
  const [isNameEditing, setIsNameEditing] = useState(false)
  const [isAgeEditing, setIsAgeEditing] = useState(false)
  const [isRoleEditing, setIsRoleEditing] = useState(false)
  const [isCompanyEditing, setIsCompanyEditing] = useState(false)
  const [isIncomeEditing, setIsIncomeEditing] = useState(false)

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Persona Primária"
      icon={User}
      stageColor="#5AD19A"
      onAiClick={onAiClick}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <EditableField
            value={personaState.name ?? ''}
            placeholder="Nome da persona"
            className="font-semibold text-sm text-[#E6E9F2]/90"
            isEditing={isNameEditing}
            onStartEdit={() => setIsNameEditing(true)}
            onCancelEdit={() => setIsNameEditing(false)}
            onSave={(value) => {
              setIsNameEditing(false)
              updatePersona({ name: value.trim() || undefined })
            }}
          />
          <EditableField
            value={personaState.age ? String(personaState.age) : ''}
            placeholder="Idade"
            className="text-xs text-[#E6E9F2]/60"
            isEditing={isAgeEditing}
            onStartEdit={() => setIsAgeEditing(true)}
            onCancelEdit={() => setIsAgeEditing(false)}
            onSave={(value) => {
              setIsAgeEditing(false)
              updatePersona({ age: value.trim() || undefined })
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#E6E9F2]/60">
          <EditableField
            value={personaState.role ?? ''}
            placeholder="Profissão/Cargo"
            className="text-xs text-[#E6E9F2]/70"
            isEditing={isRoleEditing}
            onStartEdit={() => setIsRoleEditing(true)}
            onCancelEdit={() => setIsRoleEditing(false)}
            onSave={(value) => {
              setIsRoleEditing(false)
              updatePersona({ role: value.trim() || undefined })
            }}
          />
          <span className="text-[#E6E9F2]/30">•</span>
          <EditableField
            value={personaState.company ?? ''}
            placeholder="Empresa/segmento"
            className="text-xs text-[#E6E9F2]/70"
            isEditing={isCompanyEditing}
            onStartEdit={() => setIsCompanyEditing(true)}
            onCancelEdit={() => setIsCompanyEditing(false)}
            onSave={(value) => {
              setIsCompanyEditing(false)
              updatePersona({ company: value.trim() || undefined })
            }}
          />
          <span className="text-[#E6E9F2]/30">•</span>
          <EditableField
            value={personaState.income ?? ''}
            placeholder="Faixa de renda"
            className="text-xs text-[#E6E9F2]/70"
            isEditing={isIncomeEditing}
            onStartEdit={() => setIsIncomeEditing(true)}
            onCancelEdit={() => setIsIncomeEditing(false)}
            onSave={(value) => {
              setIsIncomeEditing(false)
              updatePersona({ income: value.trim() || undefined })
            }}
          />
        </div>

        {!personaState.role && !personaState.company && !personaState.income && (
          <p className="text-xs text-[#E6E9F2]/40">
            Clique para informar profissão, empresa e faixa de renda.
          </p>
        )}
      </div>

      {(personaState.quote || isQuoteEditing) && (
        <div className="rounded-lg border border-[#5AD19A]/20 bg-[#5AD19A]/10 px-3 py-2 text-xs text-[#E6E9F2]/80 italic">
          <div className="mb-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] text-[#5AD19A] uppercase tracking-wide">
              <Quote className="h-3.5 w-3.5" />
              Citação
        </div>
        {isQuoteEditing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-[11px] font-semibold text-[#5AD19A]"
              onClick={() => {
                setIsQuoteEditing(false)
                updatePersona({ quote: quoteDraft.trim() || undefined })
              }}
            >
              Salvar
            </button>
            <button
              type="button"
              className="text-[11px] text-[#E6E9F2]/50"
              onClick={() => {
                setQuoteDraft(personaState.quote ?? '')
                setIsQuoteEditing(false)
              }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="text-[11px] text-[#5AD19A]"
            onClick={() => setIsQuoteEditing(true)}
          >
            Editar
          </button>
        )}
      </div>
      {isQuoteEditing ? (
        <textarea
          value={quoteDraft}
          onChange={(event) => setQuoteDraft(event.target.value)}
          className="w-full rounded-md border border-[#5AD19A]/30 bg-transparent px-2 py-1 text-xs text-[#E6E9F2]/80 focus:outline-none focus:ring-2 focus:ring-[#5AD19A]/40"
          placeholder="“Uma frase que a persona diria sobre o problema ou objetivo.”"
        />
      ) : (
        <p>{personaState.quote}</p>
      )}

      {!personaState.quote && !isQuoteEditing && (
        <button
          type="button"
          onClick={() => setIsQuoteEditing(true)}
          className="text-[11px] text-[#5AD19A] underline-offset-2 hover:underline"
        >
          Adicionar citação da persona
        </button>
      )}
    </div>
      )}

      <EditableListSection
        title="Objetivos"
        values={goals}
        accentColor="#5AD19A"
        emptyPlaceholder="Descreva os objetivos e motivações da persona."
        onChange={(nextGoals) => updatePersona({ goals: nextGoals })}
      />

      <EditableListSection
        title="Frustrações"
        values={frustrations}
        accentColor="#FF6B6B"
        emptyPlaceholder="Quais dores, obstáculos ou frustrações essa persona enfrenta hoje?"
        onChange={(nextFrustrations) => updatePersona({ frustrations: nextFrustrations })}
      />

      <EditableListSection
        title="Comportamentos e hábitos"
        values={displayBehaviors}
        accentColor="#7AA2FF"
        emptyPlaceholder="Ferramentas que ela usa, frequência com que realiza tarefas, comportamentos digitais..."
        onChange={(nextBehaviors) => updatePersona({ behaviors: nextBehaviors })}
      />
    </BaseCard>
  )
}
