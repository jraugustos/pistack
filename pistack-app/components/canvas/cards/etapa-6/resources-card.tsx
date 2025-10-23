'use client'

import { Users, Plus, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'
import { toArrayOfStrings } from '@/lib/array-normalizers'

interface TeamMemberItem {
  role?: string
  quantity?: number
  skills?: string[]
}

interface ResourcesCardProps {
  cardId: string
  content?: {
    team?: TeamMemberItem[]
    tools?: string[]
    budget?: string
  }
  onAiClick?: () => void
  onSave?: (content: any) => Promise<void>
}

function toTeamArray(input: unknown): TeamMemberItem[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map((i) =>
      typeof i === 'string'
        ? { role: i, quantity: 1, skills: [] }
        : {
            role: i?.role || '',
            quantity: Number(i?.quantity) || 1,
            skills: toArrayOfStrings(i?.skills),
          }
    )
  }
  return []
}

export function ResourcesCard({ cardId, content, onAiClick, onSave }: ResourcesCardProps) {
  const [localTeam, setLocalTeam] = useState<TeamMemberItem[]>(() => toTeamArray(content?.team))
  const [localTools, setLocalTools] = useState<string[]>(() => toArrayOfStrings(content?.tools))
  const [localBudget, setLocalBudget] = useState(content?.budget || '')

  const dataToSave = useMemo(
    () => ({
      team: localTeam
        .map((t: TeamMemberItem) => ({
          role: t.role?.trim() || '',
          quantity: Number(t.quantity) || 1,
          skills: (t.skills || []).map((s: string) => s.trim()).filter(Boolean),
        }))
        .filter((t: TeamMemberItem) => t.role),
      tools: localTools.map((t: string) => t.trim()).filter(Boolean),
      budget: localBudget.trim(),
    }),
    [localTeam, localTools, localBudget]
  )

  useAutosave(dataToSave, { onSave: onSave || (async () => {}), delay: 1500 })

  // Team handlers
  const addTeamMember = () => {
    setLocalTeam([...localTeam, { role: '', quantity: 1, skills: [] }])
  }

  const removeTeamMember = (index: number) => {
    setLocalTeam(localTeam.filter((_, i) => i !== index))
  }

  const updateTeamMember = (index: number, field: keyof TeamMemberItem, value: string | number) => {
    setLocalTeam(localTeam.map((t, i) => (i === index ? { ...t, [field]: value } : t)))
  }

  // Skills handlers
  const addSkill = (teamIndex: number) => {
    setLocalTeam(
      localTeam.map((t, i) =>
        i === teamIndex ? { ...t, skills: [...(t.skills || []), ''] } : t
      )
    )
  }

  const removeSkill = (teamIndex: number, skillIndex: number) => {
    setLocalTeam(
      localTeam.map((t, i) =>
        i === teamIndex ? { ...t, skills: t.skills?.filter((_, si) => si !== skillIndex) } : t
      )
    )
  }

  const updateSkill = (teamIndex: number, skillIndex: number, value: string) => {
    setLocalTeam(
      localTeam.map((t, i) =>
        i === teamIndex
          ? { ...t, skills: t.skills?.map((s, si) => (si === skillIndex ? value : s)) }
          : t
      )
    )
  }

  // Tools handlers
  const addTool = () => {
    setLocalTools([...localTools, ''])
  }

  const removeTool = (index: number) => {
    setLocalTools(localTools.filter((_, i) => i !== index))
  }

  const updateTool = (index: number, value: string) => {
    setLocalTools(localTools.map((t, i) => (i === index ? value : t)))
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Recursos"
      icon={Users}
      stageColor="#9B8AFB"
      onAiClick={onAiClick}
    >
      <div className="space-y-4">
        {/* Team */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Equipe</label>
            <button
              onClick={addTeamMember}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>

          <div className="space-y-3">
            {localTeam.map((member, tIdx) => (
              <div key={tIdx} className="border rounded-md p-3 bg-gray-50 space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    value={member.role || ''}
                    onChange={(e) => updateTeamMember(tIdx, 'role', e.target.value)}
                    placeholder="Papel/Função"
                    className="flex-1 px-2 py-1 border rounded text-sm font-medium"
                  />
                  <input
                    type="number"
                    min="1"
                    value={member.quantity || 1}
                    onChange={(e) => updateTeamMember(tIdx, 'quantity', parseInt(e.target.value))}
                    className="w-16 px-2 py-1 border rounded text-sm text-center"
                  />
                  <button
                    onClick={() => removeTeamMember(tIdx)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Skills */}
                <div className="pl-2 border-l-2 border-blue-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Skills Requeridas</span>
                    <button
                      onClick={() => addSkill(tIdx)}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <Plus className="w-3 h-3" />
                      Skill
                    </button>
                  </div>

                  {member.skills?.map((skill, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => updateSkill(tIdx, sIdx, e.target.value)}
                        placeholder="Ex: React, TypeScript, Git..."
                        className="flex-1 px-2 py-1 border rounded text-xs"
                      />
                      <button
                        onClick={() => removeSkill(tIdx, sIdx)}
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

        {/* Tools */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Ferramentas</label>
            <button
              onClick={addTool}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>

          <div className="space-y-2">
            {localTools.map((tool, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={tool}
                  onChange={(e) => updateTool(idx, e.target.value)}
                  placeholder="Ex: GitHub, Figma, Slack..."
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <button
                  onClick={() => removeTool(idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium mb-1">Orçamento Estimado</label>
          <input
            type="text"
            value={localBudget}
            onChange={(e) => setLocalBudget(e.target.value)}
            placeholder="Ex: R$ 50.000 - R$ 100.000"
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>
      </div>
    </BaseCard>
  )
}
