'use client'

import { useEffect, useMemo, useState } from 'react'
import { Network, Plus, Trash2 } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface ComponentItem {
  name?: string
  responsibility?: string
}

interface ArchitectureCardProps {
  cardId: string
  type?: string
  description?: string
  components?: ComponentItem[]
  onAiClick?: () => void
  onSave?: (content: { type: string; description: string; components: ComponentItem[] }) => Promise<void>
}

function toComponentArray(input: unknown): ComponentItem[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map((i) =>
      typeof i === 'string' ? { name: i, responsibility: '' } : { name: i?.name || '', responsibility: i?.responsibility || '' }
    )
  }
  return []
}

export function ArchitectureCard({
  cardId,
  type: archType = '',
  description = '',
  components = [],
  onAiClick,
  onSave,
}: ArchitectureCardProps) {
  const initial = useMemo(() => toComponentArray(components), [components])
  const [local, setLocal] = useState({ type: archType, description, components: initial })

  useEffect(() => {
    setLocal({ type: archType || '', description: description || '', components: toComponentArray(components) })
  }, [archType, description, components])

  useAutosave(local, {
    delay: 1500,
    onSave: async (value) => {
      if (onSave) {
        await onSave({
          type: value.type.trim(),
          description: value.description.trim(),
          components: value.components
            .map((c: ComponentItem) => ({ name: c.name?.trim() || '', responsibility: c.responsibility?.trim() || '' }))
            .filter((c: ComponentItem) => c.name),
        })
      }
    },
  })

  const addComponent = () => setLocal((s) => ({ ...s, components: [...s.components, { name: '', responsibility: '' }] }))
  const removeComponent = (idx: number) => setLocal((s) => ({ ...s, components: s.components.filter((_, i) => i !== idx) }))
  const updateComponent = (idx: number, patch: Partial<ComponentItem>) =>
    setLocal((s) => ({ ...s, components: s.components.map((c, i) => (i === idx ? { ...c, ...patch } : c)) }))

  return (
    <BaseCard cardId={cardId} cardTitle="Arquitetura" icon={Network} stageColor="#E879F9" onAiClick={onAiClick}>
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium mb-1.5 text-[#E6E9F2]/80">Tipo de Arquitetura</div>
          <input
            value={local.type}
            onChange={(e) => setLocal((s) => ({ ...s, type: e.target.value }))}
            placeholder="ex: Microserviços, Monolito, Serverless"
            className="w-full bg-white/10 border border-[#E879F9]/50 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#E879F9]"
          />
        </div>
        <div>
          <div className="text-xs font-medium mb-1.5 text-[#E6E9F2]/80">Descrição</div>
          <textarea
            value={local.description}
            onChange={(e) => setLocal((s) => ({ ...s, description: e.target.value }))}
            placeholder="Descrição da arquitetura"
            className="w-full bg-white/10 border border-[#E879F9]/50 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#E879F9] min-h-[60px]"
          />
        </div>
        <div>
          <div className="text-sm font-semibold mb-2 text-[#E879F9]">Componentes</div>
          {local.components.map((comp, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/10 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <input
                  value={comp.name || ''}
                  onChange={(e) => updateComponent(idx, { name: e.target.value })}
                  placeholder="Nome do componente"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#E6E9F2]/30"
                />
                <button type="button" onClick={() => removeComponent(idx)} className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
                </button>
              </div>
              <input
                value={comp.responsibility || ''}
                onChange={(e) => updateComponent(idx, { responsibility: e.target.value })}
                placeholder="Responsabilidade"
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none placeholder:text-[#E6E9F2]/30"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addComponent}
            className="text-xs text-[#E879F9]/70 hover:text-[#E879F9] flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar componente
          </button>
        </div>
      </div>
    </BaseCard>
  )
}
