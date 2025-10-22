'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calendar, Plus, Trash2 } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'
import { toArrayOfStrings } from '@/lib/array-normalizers'

interface SprintItem {
  number?: number
  duration?: string
  goals?: string[]
  stories?: string[]
}

interface SprintPlanningCardProps {
  cardId: string
  sprints?: SprintItem[]
  onAiClick?: () => void
  onSave?: (content: { sprints: SprintItem[] }) => Promise<void>
}

function toSprintArray(input: unknown): SprintItem[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map((i, idx) => ({
      number: i?.number || idx + 1,
      duration: i?.duration || '',
      goals: toArrayOfStrings(i?.goals),
      stories: toArrayOfStrings(i?.stories),
    }))
  }
  return []
}

export function SprintPlanningCard({
  cardId,
  sprints = [],
  onAiClick,
  onSave,
}: SprintPlanningCardProps) {
  const initial = useMemo(() => toSprintArray(sprints), [sprints])
  const [items, setItems] = useState<SprintItem[]>(initial)

  useEffect(() => {
    setItems(toSprintArray(sprints))
  }, [sprints])

  useAutosave(items, {
    delay: 1500,
    onSave: async (value) => {
      if (onSave) {
        await onSave({
          sprints: value.map((s: SprintItem, idx: number) => ({
            number: s.number || idx + 1,
            duration: s.duration?.trim() || '',
            goals: s.goals?.map((g: string) => g.trim()).filter(Boolean) || [],
            stories: s.stories?.map((st: string) => st.trim()).filter(Boolean) || [],
          })),
        })
      }
    },
  })

  const addSprint = () => setItems((prev) => [...prev, { number: prev.length + 1, duration: '2 semanas', goals: [], stories: [] }])
  const removeSprint = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx))
  const updateSprint = (idx: number, patch: Partial<SprintItem>) =>
    setItems((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))

  const addGoal = (sprintIdx: number) => {
    setItems(prev => prev.map((s, i) => i === sprintIdx ? { ...s, goals: [...(s.goals || []), ''] } : s))
  }

  const updateGoal = (sprintIdx: number, goalIdx: number, value: string) => {
    setItems(prev => prev.map((s, i) =>
      i === sprintIdx ? { ...s, goals: (s.goals || []).map((g, j) => j === goalIdx ? value : g) } : s
    ))
  }

  const removeGoal = (sprintIdx: number, goalIdx: number) => {
    setItems(prev => prev.map((s, i) =>
      i === sprintIdx ? { ...s, goals: (s.goals || []).filter((_, j) => j !== goalIdx) } : s
    ))
  }

  const addStory = (sprintIdx: number) => {
    setItems(prev => prev.map((s, i) => i === sprintIdx ? { ...s, stories: [...(s.stories || []), ''] } : s))
  }

  const updateStory = (sprintIdx: number, storyIdx: number, value: string) => {
    setItems(prev => prev.map((s, i) =>
      i === sprintIdx ? { ...s, stories: (s.stories || []).map((st, j) => j === storyIdx ? value : st) } : s
    ))
  }

  const removeStory = (sprintIdx: number, storyIdx: number) => {
    setItems(prev => prev.map((s, i) =>
      i === sprintIdx ? { ...s, stories: (s.stories || []).filter((_, j) => j !== storyIdx) } : s
    ))
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Planejamento de Sprints"
      icon={Calendar}
      stageColor="#9B8AFB"
      onAiClick={onAiClick}
    >
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-xs text-[#E6E9F2]/50">Adicione sprints ao planejamento.</div>
        )}
        {items.map((sprint, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm font-bold text-[#9B8AFB]">Sprint {sprint.number}</div>
              <input
                value={sprint.duration || ''}
                onChange={(e) => updateSprint(idx, { duration: e.target.value })}
                placeholder="Duração"
                className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none placeholder:text-[#E6E9F2]/30"
              />
              <button
                type="button"
                onClick={() => removeSprint(idx)}
                className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-xs text-[#E6E9F2]/70 font-medium mb-1">Objetivos:</div>
                {(sprint.goals || []).map((goal, goalIdx) => (
                  <div key={goalIdx} className="flex items-center gap-2 mb-1">
                    <input
                      value={goal}
                      onChange={(e) => updateGoal(idx, goalIdx, e.target.value)}
                      placeholder="Objetivo da sprint"
                      className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none placeholder:text-[#E6E9F2]/30"
                    />
                    <button type="button" onClick={() => removeGoal(idx, goalIdx)} className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center">
                      <Trash2 className="w-3 h-3 text-[#FF6B6B]/70" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addGoal(idx)} className="text-xs text-[#9B8AFB]/70 hover:text-[#9B8AFB] flex items-center gap-1">
                  <Plus className="w-3 h-3" />
                  Adicionar objetivo
                </button>
              </div>

              <div>
                <div className="text-xs text-[#E6E9F2]/70 font-medium mb-1">Stories:</div>
                {(sprint.stories || []).map((story, storyIdx) => (
                  <div key={storyIdx} className="flex items-center gap-2 mb-1">
                    <input
                      value={story}
                      onChange={(e) => updateStory(idx, storyIdx, e.target.value)}
                      placeholder="User story"
                      className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none placeholder:text-[#E6E9F2]/30"
                    />
                    <button type="button" onClick={() => removeStory(idx, storyIdx)} className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center">
                      <Trash2 className="w-3 h-3 text-[#FF6B6B]/70" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addStory(idx)} className="text-xs text-[#9B8AFB]/70 hover:text-[#9B8AFB] flex items-center gap-1">
                  <Plus className="w-3 h-3" />
                  Adicionar story
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addSprint}
          className="inline-flex items-center gap-2 text-xs px-2 py-1.5 rounded border border-[#9B8AFB]/30 hover:border-[#9B8AFB]/60 text-[#9B8AFB] hover:bg-[#9B8AFB]/10"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar sprint
        </button>
      </div>
    </BaseCard>
  )
}
