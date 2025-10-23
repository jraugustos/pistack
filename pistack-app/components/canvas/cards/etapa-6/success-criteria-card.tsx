'use client'

import { CheckCircle, Plus, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface CriteriaItem {
  metric?: string
  target?: string
  measurement?: string
}

interface SuccessCriteriaCardProps {
  cardId: string
  content?: {
    criteria?: CriteriaItem[]
  }
  onAiClick?: () => void
  onSave?: (content: any) => Promise<void>
}

function toCriteriaArray(input: unknown): CriteriaItem[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map((i) =>
      typeof i === 'string'
        ? { metric: i, target: '', measurement: '' }
        : {
            metric: i?.metric || '',
            target: i?.target || '',
            measurement: i?.measurement || '',
          }
    )
  }
  return []
}

export function SuccessCriteriaCard({ cardId, content, onAiClick, onSave }: SuccessCriteriaCardProps) {
  const [localCriteria, setLocalCriteria] = useState<CriteriaItem[]>(() =>
    toCriteriaArray(content?.criteria)
  )

  const dataToSave = useMemo(
    () => ({
      criteria: localCriteria
        .map((c: CriteriaItem) => ({
          metric: c.metric?.trim() || '',
          target: c.target?.trim() || '',
          measurement: c.measurement?.trim() || '',
        }))
        .filter((c: CriteriaItem) => c.metric),
    }),
    [localCriteria]
  )

  useAutosave(dataToSave, { onSave: onSave || (async () => {}), delay: 1500 })

  const addCriteria = () => {
    setLocalCriteria([...localCriteria, { metric: '', target: '', measurement: '' }])
  }

  const removeCriteria = (index: number) => {
    setLocalCriteria(localCriteria.filter((_, i) => i !== index))
  }

  const updateCriteria = (index: number, field: keyof CriteriaItem, value: string) => {
    setLocalCriteria(localCriteria.map((c, i) => (i === index ? { ...c, [field]: value } : c)))
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Critérios de Sucesso"
      icon={CheckCircle}
      stageColor="#9B8AFB"
      onAiClick={onAiClick}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Métricas e KPIs</label>
          <button
            onClick={addCriteria}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Plus className="w-3 h-3" />
            Adicionar
          </button>
        </div>

        <div className="space-y-3">
          {localCriteria.map((criteria, idx) => (
            <div key={idx} className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  value={criteria.metric || ''}
                  onChange={(e) => updateCriteria(idx, 'metric', e.target.value)}
                  placeholder="Nome da métrica"
                  className="flex-1 px-2 py-1 border rounded text-sm font-medium"
                />
                <button
                  onClick={() => removeCriteria(idx)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Meta</label>
                  <input
                    type="text"
                    value={criteria.target || ''}
                    onChange={(e) => updateCriteria(idx, 'target', e.target.value)}
                    placeholder="Ex: 10.000 usuários ativos"
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Como Medir
                  </label>
                  <input
                    type="text"
                    value={criteria.measurement || ''}
                    onChange={(e) => updateCriteria(idx, 'measurement', e.target.value)}
                    placeholder="Ex: Analytics, Dashboard"
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {localCriteria.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Nenhum critério de sucesso definido. Clique em &quot;Adicionar&quot; para começar.
          </div>
        )}
      </div>
    </BaseCard>
  )
}
