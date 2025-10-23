'use client'

import { useEffect, useMemo, useState } from 'react'
import { Box, Plus, Trash2 } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface ComponentItem {
  name?: string
  description?: string
  variants?: string[]
}

interface ComponentsCardProps {
  cardId: string
  components?: ComponentItem[] | string
  onAiClick?: () => void
  onSave?: (content: { components: ComponentItem[] }) => Promise<void>
}

function toComponentArray(input: unknown): ComponentItem[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input
      .map((i) => (typeof i === 'string' ? { name: i, variants: [] } : i))
      .map((i) => ({
        name: i?.name?.toString().trim() || '',
        description: i?.description?.toString().trim() || '',
        variants: Array.isArray(i?.variants)
          ? i.variants.map((v: any) => String(v).trim()).filter(Boolean)
          : [],
      }))
  }
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input)
      return toComponentArray(parsed)
    } catch {
      return input
        .split(/\r?\n|;/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name, variants: [] }))
    }
  }
  if (typeof input === 'object') {
    return toComponentArray((input as any).components ?? (input as any).value)
  }
  return []
}

function sanitize(items: ComponentItem[]): ComponentItem[] {
  const seen = new Set<string>()
  const result = items
    .map((i) => ({
      name: i.name?.trim() || '',
      description: i.description?.trim() || '',
      variants: (i.variants || []).map(v => String(v).trim()).filter(Boolean),
    }))
    .filter((i) => i.name)
    .filter((i) => {
      const key = i.name.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

  return result.slice(0, 30)
}

export function ComponentsCard({ cardId, components, onAiClick, onSave }: ComponentsCardProps) {
  const initial = useMemo(() => toComponentArray(components), [components])
  const [items, setItems] = useState<ComponentItem[]>(initial)

  useEffect(() => {
    setItems(toComponentArray(components))
  }, [components])

  useAutosave(items, {
    delay: 1500,
    onSave: async (value) => {
      if (onSave) {
        await onSave({ components: sanitize(value) })
      }
    },
  })

  const addItem = () => setItems((prev) => [...prev, { name: '', description: '', variants: [] }])
  const removeAt = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx))
  const updateAt = (idx: number, patch: Partial<ComponentItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))

  const addVariant = (compIdx: number) => {
    setItems(prev => prev.map((comp, i) =>
      i === compIdx
        ? { ...comp, variants: [...(comp.variants || []), ''] }
        : comp
    ))
  }

  const updateVariant = (compIdx: number, varIdx: number, value: string) => {
    setItems(prev => prev.map((comp, i) =>
      i === compIdx
        ? {
            ...comp,
            variants: (comp.variants || []).map((v, j) => j === varIdx ? value : v)
          }
        : comp
    ))
  }

  const removeVariant = (compIdx: number, varIdx: number) => {
    setItems(prev => prev.map((comp, i) =>
      i === compIdx
        ? { ...comp, variants: (comp.variants || []).filter((_, j) => j !== varIdx) }
        : comp
    ))
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Componentes"
      icon={Box}
      stageColor="#FF6B6B"
      onAiClick={onAiClick}
    >
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-xs text-[#E6E9F2]/50">
            Liste os componentes reutilizáveis (botões, cards, formulários, etc).
          </div>
        )}
        {items.map((comp, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <input
                value={comp.name || ''}
                onChange={(e) => updateAt(idx, { name: e.target.value })}
                placeholder="Nome do componente"
                className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[#E6E9F2]/30"
              />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
              </button>
            </div>

            <textarea
              value={comp.description || ''}
              onChange={(e) => updateAt(idx, { description: e.target.value })}
              placeholder="Descrição do componente"
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none min-h-[50px] mb-2"
            />

            <div className="space-y-1.5">
              <div className="text-xs text-[#E6E9F2]/70 font-medium">Variantes:</div>
              {(comp.variants || []).map((variant, varIdx) => (
                <div key={varIdx} className="flex items-center gap-2">
                  <input
                    value={variant}
                    onChange={(e) => updateVariant(idx, varIdx, e.target.value)}
                    placeholder="Nome da variante (ex: primary, secondary, large, small)"
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none placeholder:text-[#E6E9F2]/30"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(idx, varIdx)}
                    className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center"
                  >
                    <Trash2 className="w-3 h-3 text-[#FF6B6B]/70" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addVariant(idx)}
                className="text-xs text-[#FF6B6B]/70 hover:text-[#FF6B6B] flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Adicionar variante
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 text-xs px-2 py-1.5 rounded border border-[#FF6B6B]/30 hover:border-[#FF6B6B]/60 text-[#FF6B6B] hover:bg-[#FF6B6B]/10"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar componente
        </button>
      </div>
    </BaseCard>
  )
}
