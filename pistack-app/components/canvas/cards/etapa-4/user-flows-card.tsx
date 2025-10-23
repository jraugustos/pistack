'use client'

import { useEffect, useMemo, useState } from 'react'
import { GitBranch, Plus, Trash2 } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'
import { toArrayOfStrings } from '@/lib/array-normalizers'

interface FlowItem {
  name?: string
  description?: string
  steps?: string[]
}

interface UserFlowsCardProps {
  cardId: string
  flows?: FlowItem[]
  onAiClick?: () => void
  onSave?: (content: { flows: FlowItem[] }) => Promise<void>
}

function toFlowArray(input: unknown): FlowItem[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map((i) =>
      typeof i === 'string'
        ? { name: i, description: '', steps: [] }
        : { name: i?.name || '', description: i?.description || '', steps: toArrayOfStrings(i?.steps) }
    )
  }
  return []
}

export function UserFlowsCard({
  cardId,
  flows = [],
  onAiClick,
  onSave,
}: UserFlowsCardProps) {
  const initial = useMemo(() => toFlowArray(flows), [flows])
  const [items, setItems] = useState<FlowItem[]>(initial)

  useEffect(() => {
    setItems(toFlowArray(flows))
  }, [flows])

  useAutosave(items, {
    delay: 1500,
    onSave: async (value) => {
      if (onSave) {
        await onSave({
          flows: value
            .map((f: FlowItem) => ({
              name: f.name?.trim() || '',
              description: f.description?.trim() || '',
              steps: f.steps?.map((s: string) => s.trim()).filter(Boolean) || [],
            }))
            .filter((f: FlowItem) => f.name),
        })
      }
    },
  })

  const addFlow = () => setItems((prev) => [...prev, { name: '', description: '', steps: [] }])
  const removeFlow = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx))
  const updateFlow = (idx: number, patch: Partial<FlowItem>) =>
    setItems((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)))

  const addStep = (flowIdx: number) => {
    setItems(prev => prev.map((f, i) =>
      i === flowIdx ? { ...f, steps: [...(f.steps || []), ''] } : f
    ))
  }

  const updateStep = (flowIdx: number, stepIdx: number, value: string) => {
    setItems(prev => prev.map((f, i) =>
      i === flowIdx ? { ...f, steps: (f.steps || []).map((s, j) => j === stepIdx ? value : s) } : f
    ))
  }

  const removeStep = (flowIdx: number, stepIdx: number) => {
    setItems(prev => prev.map((f, i) =>
      i === flowIdx ? { ...f, steps: (f.steps || []).filter((_, j) => j !== stepIdx) } : f
    ))
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Fluxos de Usuário"
      icon={GitBranch}
      stageColor="#FF6B6B"
      onAiClick={onAiClick}
    >
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-xs text-[#E6E9F2]/50">Adicione os principais fluxos de navegação.</div>
        )}
        {items.map((flow, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <input
                value={flow.name || ''}
                onChange={(e) => updateFlow(idx, { name: e.target.value })}
                placeholder="Nome do fluxo (ex: Onboarding, Login)"
                className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[#E6E9F2]/30"
              />
              <button
                type="button"
                onClick={() => removeFlow(idx)}
                className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
              </button>
            </div>

            <textarea
              value={flow.description || ''}
              onChange={(e) => updateFlow(idx, { description: e.target.value })}
              placeholder="Descrição do fluxo"
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none min-h-[50px] mb-2"
            />

            <div className="space-y-1.5">
              <div className="text-xs text-[#E6E9F2]/70 font-medium">Passos:</div>
              {(flow.steps || []).map((step, stepIdx) => (
                <div key={stepIdx} className="flex items-center gap-2">
                  <div className="text-xs text-[#E6E9F2]/50 w-6">{stepIdx + 1}.</div>
                  <input
                    value={step}
                    onChange={(e) => updateStep(idx, stepIdx, e.target.value)}
                    placeholder="Descrição do passo"
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none placeholder:text-[#E6E9F2]/30"
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(idx, stepIdx)}
                    className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center"
                  >
                    <Trash2 className="w-3 h-3 text-[#FF6B6B]/70" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addStep(idx)}
                className="text-xs text-[#FF6B6B]/70 hover:text-[#FF6B6B] flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Adicionar passo
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addFlow}
          className="inline-flex items-center gap-2 text-xs px-2 py-1.5 rounded border border-[#FF6B6B]/30 hover:border-[#FF6B6B]/60 text-[#FF6B6B] hover:bg-[#FF6B6B]/10"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar fluxo
        </button>
      </div>
    </BaseCard>
  )
}
