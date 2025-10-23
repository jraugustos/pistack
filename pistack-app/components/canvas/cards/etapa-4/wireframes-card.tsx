'use client'

import { useEffect, useMemo, useState } from 'react'
import { Layout, Plus, Trash2 } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface ScreenItem {
  name?: string
  description?: string
  elements?: string[]
}

interface WireframesCardProps {
  cardId: string
  screens?: ScreenItem[] | string
  onAiClick?: () => void
  onSave?: (content: { screens: ScreenItem[] }) => Promise<void>
}

function toScreenArray(input: unknown): ScreenItem[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input
      .map((i) => (typeof i === 'string' ? { name: i, elements: [] } : i))
      .map((i) => ({
        name: i?.name?.toString().trim() || '',
        description: i?.description?.toString().trim() || '',
        elements: Array.isArray(i?.elements)
          ? i.elements.map((el: any) => String(el).trim()).filter(Boolean)
          : [],
      }))
  }
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input)
      return toScreenArray(parsed)
    } catch {
      return input
        .split(/\r?\n|;/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name, elements: [] }))
    }
  }
  if (typeof input === 'object') {
    return toScreenArray((input as any).screens ?? (input as any).value)
  }
  return []
}

function sanitize(items: ScreenItem[]): ScreenItem[] {
  const seen = new Set<string>()
  const result = items
    .map((i) => ({
      name: i.name?.trim() || '',
      description: i.description?.trim() || '',
      elements: (i.elements || []).map(el => String(el).trim()).filter(Boolean),
    }))
    .filter((i) => i.name)
    .filter((i) => {
      const key = i.name.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

  return result.slice(0, 20)
}

export function WireframesCard({ cardId, screens, onAiClick, onSave }: WireframesCardProps) {
  const initial = useMemo(() => toScreenArray(screens), [screens])
  const [items, setItems] = useState<ScreenItem[]>(initial)

  useEffect(() => {
    setItems(toScreenArray(screens))
  }, [screens])

  useAutosave(items, {
    delay: 1500,
    onSave: async (value) => {
      if (onSave) {
        await onSave({ screens: sanitize(value) })
      }
    },
  })

  const addItem = () => setItems((prev) => [...prev, { name: '', description: '', elements: [] }])
  const removeAt = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx))
  const updateAt = (idx: number, patch: Partial<ScreenItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))

  const addElement = (screenIdx: number) => {
    setItems(prev => prev.map((screen, i) =>
      i === screenIdx
        ? { ...screen, elements: [...(screen.elements || []), ''] }
        : screen
    ))
  }

  const updateElement = (screenIdx: number, elemIdx: number, value: string) => {
    setItems(prev => prev.map((screen, i) =>
      i === screenIdx
        ? {
            ...screen,
            elements: (screen.elements || []).map((el, j) => j === elemIdx ? value : el)
          }
        : screen
    ))
  }

  const removeElement = (screenIdx: number, elemIdx: number) => {
    setItems(prev => prev.map((screen, i) =>
      i === screenIdx
        ? { ...screen, elements: (screen.elements || []).filter((_, j) => j !== elemIdx) }
        : screen
    ))
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Wireframes"
      icon={Layout}
      stageColor="#FF6B6B"
      onAiClick={onAiClick}
    >
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-xs text-[#E6E9F2]/50">Adicione as principais telas do produto.</div>
        )}
        {items.map((screen, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <input
                value={screen.name || ''}
                onChange={(e) => updateAt(idx, { name: e.target.value })}
                placeholder="Nome da tela"
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
              value={screen.description || ''}
              onChange={(e) => updateAt(idx, { description: e.target.value })}
              placeholder="Descrição da tela"
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none min-h-[50px] mb-2"
            />

            <div className="space-y-1.5">
              <div className="text-xs text-[#E6E9F2]/70 font-medium">Elementos:</div>
              {(screen.elements || []).map((elem, elemIdx) => (
                <div key={elemIdx} className="flex items-center gap-2">
                  <input
                    value={elem}
                    onChange={(e) => updateElement(idx, elemIdx, e.target.value)}
                    placeholder="Elemento da UI"
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs outline-none placeholder:text-[#E6E9F2]/30"
                  />
                  <button
                    type="button"
                    onClick={() => removeElement(idx, elemIdx)}
                    className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center"
                  >
                    <Trash2 className="w-3 h-3 text-[#FF6B6B]/70" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addElement(idx)}
                className="text-xs text-[#FF6B6B]/70 hover:text-[#FF6B6B] flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Adicionar elemento
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
          Adicionar tela
        </button>
      </div>
    </BaseCard>
  )
}
