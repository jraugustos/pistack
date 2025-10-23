'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Plus, Trash2 } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface StoryItem {
  title?: string
  asA?: string
  iWant?: string
  soThat?: string
  acceptanceCriteria?: string[]
}

interface UserStoriesCardProps {
  cardId: string
  stories?: StoryItem[] | string
  onAiClick?: () => void
  onSave?: (content: { stories: StoryItem[] }) => Promise<void>
}

function toStories(input: unknown): StoryItem[] {
  if (!input) return []
  if (Array.isArray(input)) {
    return input.map((s) => (typeof s === 'string' ? { title: s } : s))
  }
  if (typeof input === 'string') {
    try { return toStories(JSON.parse(input)) } catch { return input.split(/\r?\n\r?\n|\r?\n-\s*/).map((t) => ({ title: t.trim() })).filter((s) => s.title) }
  }
  if (typeof input === 'object') return toStories((input as any).stories ?? (input as any).value)
  return []
}

function sanitize(items: StoryItem[]): StoryItem[] {
  return items
    .map((s) => ({
      title: s.title?.trim() || '',
      asA: s.asA?.trim() || '',
      iWant: s.iWant?.trim() || '',
      soThat: s.soThat?.trim() || '',
      acceptanceCriteria: (s.acceptanceCriteria || []).map((c) => c.trim()).filter(Boolean),
    }))
    .filter((s) => s.title || (s.asA && s.iWant))
    .slice(0, 20)
}

export function UserStoriesCard({ cardId, stories, onAiClick, onSave }: UserStoriesCardProps) {
  const [items, setItems] = useState<StoryItem[]>(toStories(stories))

  useEffect(() => {
    setItems(toStories(stories))
  }, [stories])

  useAutosave(items, {
    delay: 1500,
    onSave: async (value) => {
      if (onSave) await onSave({ stories: sanitize(value) })
    },
  })

  const add = () => setItems((prev) => [...prev, {}])
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i))
  const update = (i: number, patch: Partial<StoryItem>) => setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))

  const updateCriteria = (i: number, text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    update(i, { acceptanceCriteria: lines })
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="User Stories"
      icon={BookOpen}
      stageColor="#FFC24B"
      onAiClick={onAiClick}
    >
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-xs text-[#E6E9F2]/50">Adicione histórias no formato: Como [persona], eu quero [ação] para [benefício].</div>
        )}
        {items.map((s, i) => (
          <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <input
                value={s.title || ''}
                onChange={(e) => update(i, { title: e.target.value })}
                placeholder="Título da user story"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#E6E9F2]/30"
              />
              <button type="button" onClick={() => remove(i)} className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                value={s.asA || ''}
                onChange={(e) => update(i, { asA: e.target.value })}
                placeholder="Como [persona]"
                className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none"
              />
              <input
                value={s.iWant || ''}
                onChange={(e) => update(i, { iWant: e.target.value })}
                placeholder="Eu quero [ação]"
                className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none"
              />
              <input
                value={s.soThat || ''}
                onChange={(e) => update(i, { soThat: e.target.value })}
                placeholder="Para que [benefício]"
                className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none"
              />
            </div>
            <textarea
              value={(s.acceptanceCriteria || []).join('\n')}
              onChange={(e) => updateCriteria(i, e.target.value)}
              placeholder="Critérios de aceitação (um por linha)"
              className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none min-h-[60px]"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 text-xs px-2 py-1.5 rounded border border-[#FFC24B]/30 hover:border-[#FFC24B]/60 text-[#FFC24B] hover:bg-[#FFC24B]/10"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar user story
        </button>
      </div>
    </BaseCard>
  )
}
