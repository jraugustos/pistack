'use client'

import { useEffect, useMemo, useState } from 'react'
import { List, Plus, Trash2 } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

type Priority = 'Alta' | 'Média' | 'Baixa'
type Effort = 'Alto' | 'Médio' | 'Baixo'

interface FeatureItem {
  name?: string
  description?: string
  priority?: Priority
  effort?: Effort
}

interface EssentialFeaturesCardProps {
  cardId: string
  features?: FeatureItem[] | string
  onAiClick?: () => void
  onSave?: (content: { features: FeatureItem[] }) => Promise<void>
}

function toFeatureArray(input: unknown): FeatureItem[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input
      .map((i) => (typeof i === 'string' ? { name: i } : i))
      .map((i) => ({
        name: i?.name?.toString().trim() || '',
        description: i?.description?.toString().trim() || '',
        priority: (['Alta', 'Média', 'Baixa'] as Priority[]).includes(i?.priority as Priority)
          ? (i?.priority as Priority)
          : undefined,
        effort: (['Alto', 'Médio', 'Baixo'] as Effort[]).includes(i?.effort as Effort)
          ? (i?.effort as Effort)
          : undefined,
      }))
  }
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input)
      return toFeatureArray(parsed)
    } catch {
      return input
        .split(/\r?\n|;/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name }))
    }
  }
  if (typeof input === 'object') {
    return toFeatureArray((input as any).features ?? (input as any).value)
  }
  return []
}

function sanitize(items: FeatureItem[]): FeatureItem[] {
  const seen = new Set<string>()
  const result = items
    .map((i) => ({
      name: i.name?.trim() || '',
      description: i.description?.trim() || '',
      priority: i.priority,
      effort: i.effort,
    }))
    .filter((i) => i.name)
    .filter((i) => {
      const key = i.name.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

  return result.slice(0, 20)
}

export function EssentialFeaturesCard({ cardId, features, onAiClick, onSave }: EssentialFeaturesCardProps) {
  const initial = useMemo(() => toFeatureArray(features), [features])
  const [items, setItems] = useState<FeatureItem[]>(initial)

  useEffect(() => {
    setItems(toFeatureArray(features))
  }, [features])

  useAutosave(items, {
    delay: 1500,
    onSave: async (value) => {
      if (onSave) {
        await onSave({ features: sanitize(value) })
      }
    },
  })

  const addItem = () => setItems((prev) => [...prev, { name: '' }])
  const removeAt = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx))
  const updateAt = (idx: number, patch: Partial<FeatureItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Features Essenciais"
      icon={List}
      stageColor="#FFC24B"
      onAiClick={onAiClick}
    >
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-xs text-[#E6E9F2]/50">Adicione as funcionalidades principais do MVP.</div>
        )}
        {items.map((feat, idx) => (
          <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <input
                value={feat.name || ''}
                onChange={(e) => updateAt(idx, { name: e.target.value })}
                placeholder="Nome da feature"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#E6E9F2]/30"
              />
              <button type="button" onClick={() => removeAt(idx)} className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
              <textarea
                value={feat.description || ''}
                onChange={(e) => updateAt(idx, { description: e.target.value })}
                placeholder="Descrição breve"
                className="md:col-span-3 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none min-h-[46px]"
              />
              <select
                value={feat.priority || ''}
                onChange={(e) => updateAt(idx, { priority: (e.target.value || undefined) as Priority })}
                className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none"
              >
                <option value="">Prioridade</option>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
              <select
                value={feat.effort || ''}
                onChange={(e) => updateAt(idx, { effort: (e.target.value || undefined) as Effort })}
                className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none"
              >
                <option value="">Esforço</option>
                <option value="Alto">Alto</option>
                <option value="Médio">Médio</option>
                <option value="Baixo">Baixo</option>
              </select>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 text-xs px-2 py-1.5 rounded border border-[#FFC24B]/30 hover:border-[#FFC24B]/60 text-[#FFC24B] hover:bg-[#FFC24B]/10"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar feature
        </button>
      </div>
    </BaseCard>
  )
}
