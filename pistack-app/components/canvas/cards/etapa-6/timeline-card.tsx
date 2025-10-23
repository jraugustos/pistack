'use client'

import { Clock, Plus, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface MilestoneItem {
  name?: string
  date?: string
  deliverables?: string[]
}

interface TimelineCardProps {
  cardId: string
  content?: {
    startDate?: string
    endDate?: string
    milestones?: MilestoneItem[]
  }
  onAiClick?: () => void
  onSave?: (content: any) => Promise<void>
}

function toArrayOfStrings(input: unknown): string[] {
  if (!input) return []
  if (Array.isArray(input)) return input.map((i) => String(i || ''))
  if (typeof input === 'string') return [input]
  return []
}

function toMilestoneArray(input: unknown): MilestoneItem[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map((i) =>
      typeof i === 'string'
        ? { name: i, date: '', deliverables: [] }
        : {
            name: i?.name || '',
            date: i?.date || '',
            deliverables: toArrayOfStrings(i?.deliverables),
          }
    )
  }
  return []
}

export function TimelineCard({ cardId, content, onAiClick, onSave }: TimelineCardProps) {
  const [localStartDate, setLocalStartDate] = useState(content?.startDate || '')
  const [localEndDate, setLocalEndDate] = useState(content?.endDate || '')
  const [localMilestones, setLocalMilestones] = useState<MilestoneItem[]>(() =>
    toMilestoneArray(content?.milestones)
  )

  const dataToSave = useMemo(
    () => ({
      startDate: localStartDate.trim(),
      endDate: localEndDate.trim(),
      milestones: localMilestones
        .map((m: MilestoneItem) => ({
          name: m.name?.trim() || '',
          date: m.date?.trim() || '',
          deliverables: (m.deliverables || []).map((d: string) => d.trim()).filter(Boolean),
        }))
        .filter((m: MilestoneItem) => m.name),
    }),
    [localStartDate, localEndDate, localMilestones]
  )

  useAutosave(dataToSave, { onSave: onSave || (async () => {}), delay: 1500 })

  // Milestone handlers
  const addMilestone = () => {
    setLocalMilestones([...localMilestones, { name: '', date: '', deliverables: [] }])
  }

  const removeMilestone = (index: number) => {
    setLocalMilestones(localMilestones.filter((_, i) => i !== index))
  }

  const updateMilestone = (index: number, field: keyof MilestoneItem, value: string) => {
    setLocalMilestones(localMilestones.map((m, i) => (i === index ? { ...m, [field]: value } : m)))
  }

  // Deliverable handlers
  const addDeliverable = (milestoneIndex: number) => {
    setLocalMilestones(
      localMilestones.map((m, i) =>
        i === milestoneIndex ? { ...m, deliverables: [...(m.deliverables || []), ''] } : m
      )
    )
  }

  const removeDeliverable = (milestoneIndex: number, deliverableIndex: number) => {
    setLocalMilestones(
      localMilestones.map((m, i) =>
        i === milestoneIndex
          ? { ...m, deliverables: m.deliverables?.filter((_, di) => di !== deliverableIndex) }
          : m
      )
    )
  }

  const updateDeliverable = (milestoneIndex: number, deliverableIndex: number, value: string) => {
    setLocalMilestones(
      localMilestones.map((m, i) =>
        i === milestoneIndex
          ? {
              ...m,
              deliverables: m.deliverables?.map((d, di) => (di === deliverableIndex ? value : d)),
            }
          : m
      )
    )
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Cronograma"
      icon={Clock}
      stageColor="#9B8AFB"
      onAiClick={onAiClick}
    >
      <div className="space-y-4">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Data de Início</label>
            <input
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data de Término</label>
            <input
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>

        {/* Milestones */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Marcos do Projeto</label>
            <button
              onClick={addMilestone}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>

          <div className="space-y-3">
            {localMilestones.map((milestone, mIdx) => (
              <div key={mIdx} className="border rounded-md p-3 bg-gray-50 space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    value={milestone.name || ''}
                    onChange={(e) => updateMilestone(mIdx, 'name', e.target.value)}
                    placeholder="Nome do marco"
                    className="flex-1 px-2 py-1 border rounded text-sm font-medium"
                  />
                  <input
                    type="date"
                    value={milestone.date || ''}
                    onChange={(e) => updateMilestone(mIdx, 'date', e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <button
                    onClick={() => removeMilestone(mIdx)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Deliverables */}
                <div className="pl-2 border-l-2 border-purple-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Entregas</span>
                    <button
                      onClick={() => addDeliverable(mIdx)}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <Plus className="w-3 h-3" />
                      Entrega
                    </button>
                  </div>

                  {milestone.deliverables?.map((deliverable, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={deliverable}
                        onChange={(e) => updateDeliverable(mIdx, dIdx, e.target.value)}
                        placeholder="Descrição da entrega"
                        className="flex-1 px-2 py-1 border rounded text-xs"
                      />
                      <button
                        onClick={() => removeDeliverable(mIdx, dIdx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseCard>
  )
}
