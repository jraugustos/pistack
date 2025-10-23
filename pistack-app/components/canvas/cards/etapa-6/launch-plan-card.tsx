'use client'

import { Rocket, Plus, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

function toArrayOfStrings(input: unknown): string[] {
  if (!input) return []
  if (Array.isArray(input)) return input.map((i) => String(i || ''))
  if (typeof input === 'string') return [input]
  return []
}

interface PhaseItem {
  name?: string
  date?: string
  activities?: string[]
}

interface LaunchPlanCardProps {
  cardId: string
  content?: {
    launchDate?: string
    strategy?: string
    phases?: PhaseItem[]
  }
  onAiClick?: () => void
  onSave?: (content: any) => Promise<void>
}

function toPhaseArray(input: unknown): PhaseItem[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map((i) =>
      typeof i === 'string'
        ? { name: i, date: '', activities: [] }
        : {
            name: i?.name || '',
            date: i?.date || '',
            activities: toArrayOfStrings(i?.activities),
          }
    )
  }
  return []
}

export function LaunchPlanCard({ cardId, content, onAiClick, onSave }: LaunchPlanCardProps) {
  const [localLaunchDate, setLocalLaunchDate] = useState(content?.launchDate || '')
  const [localStrategy, setLocalStrategy] = useState(content?.strategy || '')
  const [localPhases, setLocalPhases] = useState<PhaseItem[]>(() => toPhaseArray(content?.phases))

  const dataToSave = useMemo(
    () => ({
      launchDate: localLaunchDate.trim(),
      strategy: localStrategy.trim(),
      phases: localPhases
        .map((p: PhaseItem) => ({
          name: p.name?.trim() || '',
          date: p.date?.trim() || '',
          activities: (p.activities || []).map((a: string) => a.trim()).filter(Boolean),
        }))
        .filter((p: PhaseItem) => p.name),
    }),
    [localLaunchDate, localStrategy, localPhases]
  )

  useAutosave(dataToSave, { onSave: onSave || (async () => {}), delay: 1500 })

  // Phase handlers
  const addPhase = () => {
    setLocalPhases([...localPhases, { name: '', date: '', activities: [] }])
  }

  const removePhase = (index: number) => {
    setLocalPhases(localPhases.filter((_, i) => i !== index))
  }

  const updatePhase = (index: number, field: keyof PhaseItem, value: string) => {
    setLocalPhases(localPhases.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
  }

  // Activity handlers
  const addActivity = (phaseIndex: number) => {
    setLocalPhases(
      localPhases.map((p, i) =>
        i === phaseIndex ? { ...p, activities: [...(p.activities || []), ''] } : p
      )
    )
  }

  const removeActivity = (phaseIndex: number, activityIndex: number) => {
    setLocalPhases(
      localPhases.map((p, i) =>
        i === phaseIndex
          ? { ...p, activities: p.activities?.filter((_, ai) => ai !== activityIndex) }
          : p
      )
    )
  }

  const updateActivity = (phaseIndex: number, activityIndex: number, value: string) => {
    setLocalPhases(
      localPhases.map((p, i) =>
        i === phaseIndex
          ? { ...p, activities: p.activities?.map((a, ai) => (ai === activityIndex ? value : a)) }
          : p
      )
    )
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Plano de Lançamento"
      icon={Rocket}
      stageColor="#9B8AFB"
      onAiClick={onAiClick}
    >
      <div className="space-y-4">
        {/* Launch Date and Strategy */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Data de Lançamento</label>
            <input
              type="date"
              value={localLaunchDate}
              onChange={(e) => setLocalLaunchDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estratégia</label>
            <select
              value={localStrategy}
              onChange={(e) => setLocalStrategy(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Selecione...</option>
              <option value="Big Bang">Big Bang (Lançamento Total)</option>
              <option value="Soft Launch">Soft Launch (Lançamento Gradual)</option>
              <option value="Beta">Beta Fechado</option>
              <option value="Phased">Lançamento Faseado</option>
            </select>
          </div>
        </div>

        {/* Phases */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Fases do Lançamento</label>
            <button
              onClick={addPhase}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>

          <div className="space-y-3">
            {localPhases.map((phase, pIdx) => (
              <div key={pIdx} className="border rounded-md p-3 bg-gray-50 space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    value={phase.name || ''}
                    onChange={(e) => updatePhase(pIdx, 'name', e.target.value)}
                    placeholder="Nome da fase"
                    className="flex-1 px-2 py-1 border rounded text-sm font-medium"
                  />
                  <input
                    type="date"
                    value={phase.date || ''}
                    onChange={(e) => updatePhase(pIdx, 'date', e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <button
                    onClick={() => removePhase(pIdx)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Activities */}
                <div className="pl-2 border-l-2 border-purple-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Atividades</span>
                    <button
                      onClick={() => addActivity(pIdx)}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <Plus className="w-3 h-3" />
                      Atividade
                    </button>
                  </div>

                  {phase.activities?.map((activity, aIdx) => (
                    <div key={aIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={activity}
                        onChange={(e) => updateActivity(pIdx, aIdx, e.target.value)}
                        placeholder="Descrição da atividade"
                        className="flex-1 px-2 py-1 border rounded text-xs"
                      />
                      <button
                        onClick={() => removeActivity(pIdx, aIdx)}
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
