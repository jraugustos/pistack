'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertOctagon, Plus, Trash2 } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

type Probability = 'Alta' | 'Média' | 'Baixa'
type Impact = 'Alto' | 'Médio' | 'Baixo'

interface RiskItem {
  description?: string
  probability?: Probability
  impact?: Impact
  mitigation?: string
}

interface RiskManagementCardProps {
  cardId: string
  risks?: RiskItem[]
  onAiClick?: () => void
  onSave?: (content: { risks: RiskItem[] }) => Promise<void>
}

function toRiskArray(input: unknown): RiskItem[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map((i) =>
      typeof i === 'string'
        ? { description: i, probability: undefined, impact: undefined, mitigation: '' }
        : {
            description: i?.description || '',
            probability: i?.probability,
            impact: i?.impact,
            mitigation: i?.mitigation || '',
          }
    )
  }
  return []
}

export function RiskManagementCard({
  cardId,
  risks = [],
  onAiClick,
  onSave,
}: RiskManagementCardProps) {
  const initial = useMemo(() => toRiskArray(risks), [risks])
  const [items, setItems] = useState<RiskItem[]>(initial)

  useEffect(() => {
    setItems(toRiskArray(risks))
  }, [risks])

  useAutosave(items, {
    delay: 1500,
    onSave: async (value) => {
      if (onSave) {
        await onSave({
          risks: value
            .map((r: RiskItem) => ({
              description: r.description?.trim() || '',
              probability: r.probability,
              impact: r.impact,
              mitigation: r.mitigation?.trim() || '',
            }))
            .filter((r: { description: string }) => r.description),
        })
      }
    },
  })

  const addRisk = () =>
    setItems((prev) => [...prev, { description: '', probability: undefined, impact: undefined, mitigation: '' }])
  const removeRisk = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx))
  const updateRisk = (idx: number, patch: Partial<RiskItem>) =>
    setItems((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Gestão de Riscos"
      icon={AlertOctagon}
      stageColor="#9B8AFB"
      onAiClick={onAiClick}
    >
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-xs text-[#E6E9F2]/50">Identifique riscos e estratégias de mitigação.</div>
        )}
        {items.map((risk, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-start gap-2 mb-2">
              <textarea
                value={risk.description || ''}
                onChange={(e) => updateRisk(idx, { description: e.target.value })}
                placeholder="Descrição do risco"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#E6E9F2]/30 min-h-[40px]"
              />
              <button
                type="button"
                onClick={() => removeRisk(idx)}
                className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <div className="text-xs text-[#E6E9F2]/70 mb-1">Probabilidade:</div>
                <select
                  value={risk.probability || ''}
                  onChange={(e) => updateRisk(idx, { probability: (e.target.value || undefined) as Probability })}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
              <div>
                <div className="text-xs text-[#E6E9F2]/70 mb-1">Impacto:</div>
                <select
                  value={risk.impact || ''}
                  onChange={(e) => updateRisk(idx, { impact: (e.target.value || undefined) as Impact })}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="Alto">Alto</option>
                  <option value="Médio">Médio</option>
                  <option value="Baixo">Baixo</option>
                </select>
              </div>
            </div>

            <div>
              <div className="text-xs text-[#E6E9F2]/70 mb-1">Estratégia de Mitigação:</div>
              <textarea
                value={risk.mitigation || ''}
                onChange={(e) => updateRisk(idx, { mitigation: e.target.value })}
                placeholder="Como mitigar este risco?"
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none min-h-[50px]"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addRisk}
          className="inline-flex items-center gap-2 text-xs px-2 py-1.5 rounded border border-[#9B8AFB]/30 hover:border-[#9B8AFB]/60 text-[#9B8AFB] hover:bg-[#9B8AFB]/10"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar risco
        </button>
      </div>
    </BaseCard>
  )
}
