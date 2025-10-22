'use client'

import { useEffect, useState } from 'react'
import { Code, Plus, Trash2 } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'
import { toArrayOfStrings } from '@/lib/array-normalizers'

interface TechStackCardProps {
  cardId: string
  frontend?: string[]
  backend?: string[]
  database?: string
  infrastructure?: string[]
  justification?: string
  onAiClick?: () => void
  onSave?: (content: {
    frontend: string[]
    backend: string[]
    database?: string
    infrastructure: string[]
    justification?: string
  }) => Promise<void>
}

function normalizeContent(input: any) {
  if (!input) return { frontend: [], backend: [], database: '', infrastructure: [], justification: '' }

  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input)
      return normalizeContent(parsed)
    } catch {
      return { frontend: [], backend: [], database: '', infrastructure: [], justification: '' }
    }
  }

  return {
    frontend: toArrayOfStrings(input.frontend),
    backend: toArrayOfStrings(input.backend),
    database: input.database || '',
    infrastructure: toArrayOfStrings(input.infrastructure),
    justification: input.justification || '',
  }
}

export function TechStackCard({
  cardId,
  frontend = [],
  backend = [],
  database = '',
  infrastructure = [],
  justification = '',
  onAiClick,
  onSave,
}: TechStackCardProps) {
  const [local, setLocal] = useState(normalizeContent({ frontend, backend, database, infrastructure, justification }))

  useEffect(() => {
    setLocal(normalizeContent({ frontend, backend, database, infrastructure, justification }))
  }, [frontend, backend, database, infrastructure, justification])

  useAutosave(local, {
    delay: 1500,
    onSave: async (data) => {
      if (onSave) {
        const clean = {
          frontend: data.frontend.map((f: string) => f.trim()).filter(Boolean),
          backend: data.backend.map((b: string) => b.trim()).filter(Boolean),
          database: data.database?.trim() || '',
          infrastructure: data.infrastructure.map((i: string) => i.trim()).filter(Boolean),
          justification: data.justification?.trim() || '',
        }
        await onSave(clean)
      }
    },
  })

  const addToArray = (key: 'frontend' | 'backend' | 'infrastructure') => {
    setLocal((s) => ({ ...s, [key]: [...s[key], ''] }))
  }

  const updateArrayItem = (key: 'frontend' | 'backend' | 'infrastructure', idx: number, value: string) => {
    setLocal((s) => ({
      ...s,
      [key]: s[key].map((item, i) => (i === idx ? value : item)),
    }))
  }

  const removeFromArray = (key: 'frontend' | 'backend' | 'infrastructure', idx: number) => {
    setLocal((s) => ({
      ...s,
      [key]: s[key].filter((_, i) => i !== idx),
    }))
  }

  const ArrayInput = ({ title, arrayKey }: { title: string; arrayKey: 'frontend' | 'backend' | 'infrastructure' }) => (
    <div>
      <div className="text-sm font-semibold mb-2 text-[#E879F9]">{title}</div>
      <div className="space-y-2">
        {local[arrayKey].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(e) => updateArrayItem(arrayKey, idx, e.target.value)}
              placeholder={`Tecnologia ${idx + 1}`}
              className="flex-1 bg-white/10 border border-[#E879F9]/50 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#E879F9]"
            />
            <button
              type="button"
              onClick={() => removeFromArray(arrayKey, idx)}
              className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addToArray(arrayKey)}
          className="text-xs text-[#E879F9]/70 hover:text-[#E879F9] flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar tecnologia
        </button>
      </div>
    </div>
  )

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Tech Stack"
      icon={Code}
      stageColor="#E879F9"
      onAiClick={onAiClick}
    >
      <div className="space-y-4">
        <ArrayInput title="Frontend" arrayKey="frontend" />
        <ArrayInput title="Backend" arrayKey="backend" />

        <div>
          <div className="text-sm font-semibold mb-2 text-[#E879F9]">Banco de Dados</div>
          <input
            value={local.database}
            onChange={(e) => setLocal((s) => ({ ...s, database: e.target.value }))}
            placeholder="ex: PostgreSQL, MongoDB, MySQL"
            className="w-full bg-white/10 border border-[#E879F9]/50 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#E879F9]"
          />
        </div>

        <ArrayInput title="Infraestrutura" arrayKey="infrastructure" />

        <div>
          <div className="text-sm font-semibold mb-2 text-[#E879F9]">Justificativa</div>
          <textarea
            value={local.justification}
            onChange={(e) => setLocal((s) => ({ ...s, justification: e.target.value }))}
            placeholder="Por que estas tecnologias foram escolhidas?"
            className="w-full bg-white/10 border border-[#E879F9]/50 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#E879F9] min-h-[60px]"
          />
        </div>
      </div>
    </BaseCard>
  )
}
