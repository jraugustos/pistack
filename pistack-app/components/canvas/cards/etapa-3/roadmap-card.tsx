'use client'

import { useEffect, useState } from 'react'
import { Map, Plus, Trash2 } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface PhaseItem {
  name?: string
  duration?: string
  milestones?: string[]
  deliverables?: string[]
}

interface RoadmapCardProps {
  cardId: string
  phases?: PhaseItem[] | string
  onAiClick?: () => void
  onSave?: (content: { phases: PhaseItem[] }) => Promise<void>
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

function toPhases(input: unknown): PhaseItem[] {
  if (!input) return []
  if (Array.isArray(input)) return input.map((p) => (typeof p === 'string' ? { name: p } : { ...p, milestones: toList((p as any).milestones), deliverables: toList((p as any).deliverables) }))
  if (typeof input === 'string') { try { return toPhases(JSON.parse(input)) } catch { return input.split(/\r?\n\r?\n|\r?\n-\s*/).map((s) => ({ name: s.trim() })).filter((p) => p.name) } }
  if (typeof input === 'object') return toPhases((input as any).phases ?? (input as any).value)
  return []
}

function sanitize(items: PhaseItem[]): PhaseItem[] {
  return items
    .map((p) => ({
      name: p.name?.trim() || '',
      duration: p.duration?.trim() || '',
      milestones: (p.milestones || []).map((s) => s.trim()).filter(Boolean),
      deliverables: (p.deliverables || []).map((s) => s.trim()).filter(Boolean),
    }))
    .filter((p) => p.name)
    .slice(0, 20)
}

export function RoadmapCard({ cardId, phases, onAiClick, onSave }: RoadmapCardProps) {
  const [items, setItems] = useState<PhaseItem[]>(toPhases(phases))

  useEffect(() => {
    setItems(toPhases(phases))
  }, [phases])

  useAutosave(items, {
    delay: 1500,
    onSave: async (value) => {
      if (onSave) await onSave({ phases: sanitize(value) })
    },
  })

  const add = () => setItems((prev) => [...prev, { name: '', duration: '', milestones: [], deliverables: [] }])
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i))
  const update = (i: number, patch: Partial<PhaseItem>) => setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  const updateList = (i: number, key: 'milestones' | 'deliverables', text: string) => update(i, { [key]: text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean) } as any)

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Roadmap"
      icon={Map}
      stageColor="#FFC24B"
      onAiClick={onAiClick}
    >
      <div className="space-y-3">
        {items.length === 0 && <div className="text-xs text-[#E6E9F2]/50">Esboce as fases do roadmap (nome, duração, marcos e entregas).</div>}
        {items.map((p, i) => (
          <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <input
                value={p.name || ''}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Nome da fase"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#E6E9F2]/30"
              />
              <input
                value={p.duration || ''}
                onChange={(e) => update(i, { duration: e.target.value })}
                placeholder="Duração (ex.: 2-3 meses)"
                className="w-40 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none"
              />
              <button type="button" onClick={() => remove(i)} className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <textarea
                value={(p.milestones || []).join('\n')}
                onChange={(e) => updateList(i, 'milestones', e.target.value)}
                placeholder="Marcos (um por linha)"
                className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none min-h-[60px]"
              />
              <textarea
                value={(p.deliverables || []).join('\n')}
                onChange={(e) => updateList(i, 'deliverables', e.target.value)}
                placeholder="Entregas (um por linha)"
                className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none min-h-[60px]"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 text-xs px-2 py-1.5 rounded border border-[#FFC24B]/30 hover:border-[#FFC24B]/60 text-[#FFC24B] hover:bg-[#FFC24B]/10"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar fase
        </button>
      </div>
    </BaseCard>
  )
}
