'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Plus, Trash2 } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface ScopeConstraintsCardProps {
  cardId: string
  constraints?: string[] | string
  assumptions?: string[] | string
  dependencies?: string[] | string
  onAiClick?: () => void
  onSave?: (content: { constraints: string[]; assumptions: string[]; dependencies: string[] }) => Promise<void>
}

function toList(input: unknown): string[] {
  if (!input) return []
  if (Array.isArray(input)) return input.map((s) => String(s).trim()).filter(Boolean)
  if (typeof input === 'string') {
    try { const parsed = JSON.parse(input); return toList(parsed) } catch {
      return input.split(/\r?\n|;/).map((s) => s.trim()).filter(Boolean)
    }
  }
  if (typeof input === 'object') return toList((input as any).list ?? (input as any).value)
  return []
}

export function ScopeConstraintsCard({ cardId, constraints, assumptions, dependencies, onAiClick, onSave }: ScopeConstraintsCardProps) {
  const [state, setState] = useState({
    constraints: toList(constraints),
    assumptions: toList(assumptions),
    dependencies: toList(dependencies),
  })

  useEffect(() => {
    setState({ constraints: toList(constraints), assumptions: toList(assumptions), dependencies: toList(dependencies) })
  }, [constraints, assumptions, dependencies])

  useAutosave(state, {
    delay: 1500,
    onSave: async (value) => {
      if (onSave) await onSave({
        constraints: value.constraints.map((s: string) => s.trim()).filter(Boolean),
        assumptions: value.assumptions.map((s: string) => s.trim()).filter(Boolean),
        dependencies: value.dependencies.map((s: string) => s.trim()).filter(Boolean),
      })
    },
  })

  const add = (key: 'constraints' | 'assumptions' | 'dependencies') => setState((s) => ({ ...s, [key]: [...(s as any)[key], ''] }))
  const remove = (key: 'constraints' | 'assumptions' | 'dependencies', i: number) => setState((s) => ({ ...s, [key]: (s as any)[key].filter((_: any, idx: number) => idx !== i) }))
  const update = (key: 'constraints' | 'assumptions' | 'dependencies', i: number, v: string) => setState((s) => ({ ...s, [key]: (s as any)[key].map((val: string, idx: number) => (idx === i ? v : val)) }))

  const Section = ({ title, keyName }: { title: string; keyName: 'constraints' | 'assumptions' | 'dependencies' }) => (
    <div className="space-y-2">
      <div className="text-sm font-medium">{title}</div>
      {(state as any)[keyName].length === 0 && <div className="text-xs text-[#E6E9F2]/50">Adicione itens (um por linha)</div>}
      {(state as any)[keyName].map((val: string, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={val}
            onChange={(e) => update(keyName, i, e.target.value)}
            placeholder="Descrição breve"
            className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none"
          />
          <button type="button" onClick={() => remove(keyName, i)} className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center">
            <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => add(keyName)}
        className="inline-flex items-center gap-2 text-xs px-2 py-1.5 rounded border border-[#FFC24B]/30 hover:border-[#FFC24B]/60 text-[#FFC24B] hover:bg-[#FFC24B]/10"
      >
        <Plus className="w-3.5 h-3.5" />
        Adicionar item
      </button>
    </div>
  )

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Restrições de Escopo"
      icon={AlertTriangle}
      stageColor="#FFC24B"
      onAiClick={onAiClick}
    >
      <div className="space-y-4">
        <Section title="Restrições" keyName="constraints" />
        <Section title="Premissas" keyName="assumptions" />
        <Section title="Dependências" keyName="dependencies" />
      </div>
    </BaseCard>
  )
}
