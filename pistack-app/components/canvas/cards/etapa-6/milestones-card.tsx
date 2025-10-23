'use client'

import { Flag, Plus, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface MilestoneItem {
  title?: string
  date?: string
  status?: string
  deliverable?: string
}

interface MilestonesCardProps {
  cardId: string
  content?: {
    milestones?: MilestoneItem[]
  }
  onAiClick?: () => void
  onSave?: (content: any) => Promise<void>
}

function toMilestoneArray(input: unknown): MilestoneItem[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map((i) =>
      typeof i === 'string'
        ? { title: i, date: '', status: 'Pendente', deliverable: '' }
        : {
            title: i?.title || '',
            date: i?.date || '',
            status: i?.status || 'Pendente',
            deliverable: i?.deliverable || '',
          }
    )
  }
  return []
}

export function MilestonesCard({ cardId, content, onAiClick, onSave }: MilestonesCardProps) {
  const [localMilestones, setLocalMilestones] = useState<MilestoneItem[]>(() =>
    toMilestoneArray(content?.milestones)
  )

  const dataToSave = useMemo(
    () => ({
      milestones: localMilestones
        .map((m: MilestoneItem) => ({
          title: m.title?.trim() || '',
          date: m.date?.trim() || '',
          status: m.status?.trim() || 'Pendente',
          deliverable: m.deliverable?.trim() || '',
        }))
        .filter((m: MilestoneItem) => m.title),
    }),
    [localMilestones]
  )

  useAutosave(dataToSave, { onSave: onSave || (async () => {}), delay: 1500 })

  const addMilestone = () => {
    setLocalMilestones([
      ...localMilestones,
      { title: '', date: '', status: 'Pendente', deliverable: '' },
    ])
  }

  const removeMilestone = (index: number) => {
    setLocalMilestones(localMilestones.filter((_, i) => i !== index))
  }

  const updateMilestone = (index: number, field: keyof MilestoneItem, value: string) => {
    setLocalMilestones(localMilestones.map((m, i) => (i === index ? { ...m, [field]: value } : m)))
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Marcos do Projeto"
      icon={Flag}
      stageColor="#9B8AFB"
      onAiClick={onAiClick}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Marcos</label>
          <button
            onClick={addMilestone}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Plus className="w-3 h-3" />
            Adicionar
          </button>
        </div>

        <div className="space-y-3">
          {localMilestones.map((milestone, idx) => (
            <div key={idx} className="border rounded-md p-3 bg-gray-50 space-y-2">
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  value={milestone.title || ''}
                  onChange={(e) => updateMilestone(idx, 'title', e.target.value)}
                  placeholder="Título do marco"
                  className="flex-1 px-2 py-1 border rounded text-sm font-medium"
                />
                <button
                  onClick={() => removeMilestone(idx)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Data</label>
                  <input
                    type="date"
                    value={milestone.date || ''}
                    onChange={(e) => updateMilestone(idx, 'date', e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={milestone.status || 'Pendente'}
                    onChange={(e) => updateMilestone(idx, 'status', e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Progresso">Em Progresso</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Atrasado">Atrasado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Entrega</label>
                <input
                  type="text"
                  value={milestone.deliverable || ''}
                  onChange={(e) => updateMilestone(idx, 'deliverable', e.target.value)}
                  placeholder="Descrição da entrega principal"
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseCard>
  )
}
