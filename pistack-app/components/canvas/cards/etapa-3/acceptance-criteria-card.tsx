'use client'

import { useEffect, useState } from 'react'
import { CheckSquare, Plus, Trash2 } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface CriteriaItem {
  feature?: string
  conditions?: string[]
}

interface AcceptanceCriteriaCardProps {
  cardId: string
  criteria?: CriteriaItem[] | string
  onAiClick?: () => void
  onSave?: (content: { criteria: CriteriaItem[] }) => Promise<void>
}

function toList(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
  if (typeof value === 'string') {
    try { const arr = JSON.parse(value); return toList(arr) } catch {
      return value.split(/\r?\n|;/).map((s) => s.trim()).filter(Boolean)
    }
  }
  if (typeof value === 'object') return toList((value as any).list ?? (value as any).value)
  return []
}

function toCriteria(input: unknown): CriteriaItem[] {
  if (!input) return []
  if (Array.isArray(input)) return input.map((c) => (typeof c === 'string' ? { feature: c } : { feature: c?.feature, conditions: toList((c as any)?.conditions) }))
  if (typeof input === 'string') {
    try { return toCriteria(JSON.parse(input)) } catch {
      return input.split(/\r?\n\r?\n|\r?\n-\s*/).map((s) => ({ feature: s.trim() })).filter((c) => c.feature)
    }
  }
  if (typeof input === 'object') return toCriteria((input as any).criteria ?? (input as any).value)
  return []
}

function sanitize(items: CriteriaItem[]): CriteriaItem[] {
  return items
    .map((c) => ({
      feature: c.feature?.trim() || '',
      conditions: (c.conditions || []).map((s) => s.trim()).filter(Boolean),
    }))
    .filter((c) => c.feature)
    .slice(0, 30)
}

export function AcceptanceCriteriaCard({ cardId, criteria, onAiClick, onSave }: AcceptanceCriteriaCardProps) {
  const [items, setItems] = useState<CriteriaItem[]>(toCriteria(criteria))

  useEffect(() => {
    setItems(toCriteria(criteria))
  }, [criteria])

  useAutosave(items, {
    delay: 1500,
    onSave: async (value) => {
      if (onSave) await onSave({ criteria: sanitize(value) })
    },
  })

  const add = () => setItems((prev) => [...prev, { feature: '', conditions: [] }])
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i))
  const update = (i: number, patch: Partial<CriteriaItem>) => setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  const updateConditions = (i: number, text: string) => update(i, { conditions: text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean) })

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Critérios de Aceitação"
      icon={CheckSquare}
      stageColor="#FFC24B"
      onAiClick={onAiClick}
    >
      <div className="space-y-3">
        {items.length === 0 && <div className="text-xs text-[#E6E9F2]/50">Adicione critérios por feature e condições de aceite.</div>}
        {items.map((c, i) => (
          <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <input
                value={c.feature || ''}
                onChange={(e) => update(i, { feature: e.target.value })}
                placeholder="Nome da feature"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#E6E9F2]/30"
              />
              <button type="button" onClick={() => remove(i)} className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
              </button>
            </div>
            <textarea
              value={(c.conditions || []).join('\n')}
              onChange={(e) => updateConditions(i, e.target.value)}
              placeholder="Condições de aceitação (uma por linha)"
              className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none min-h-[60px]"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 text-xs px-2 py-1.5 rounded border border-[#FFC24B]/30 hover:border-[#FFC24B]/60 text-[#FFC24B] hover:bg-[#FFC24B]/10"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar critério
        </button>
      </div>
    </BaseCard>
  )
}
