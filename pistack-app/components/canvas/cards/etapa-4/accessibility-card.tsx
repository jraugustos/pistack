'use client'

import { useEffect, useState } from 'react'
import { Eye, Plus, Trash2 } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'
import { toArrayOfStrings } from '@/lib/array-normalizers'

interface AccessibilityCardProps {
  cardId: string
  guidelines?: string[]
  wcagLevel?: string
  considerations?: string[]
  onAiClick?: () => void
  onSave?: (content: {
    guidelines: string[]
    wcagLevel?: string
    considerations: string[]
  }) => Promise<void>
}

function normalizeContent(input: any) {
  if (!input) return { guidelines: [], wcagLevel: '', considerations: [] }

  // Se for string, tentar parsear como JSON
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input)
      return normalizeContent(parsed)
    } catch {
      return { guidelines: [], wcagLevel: '', considerations: [] }
    }
  }

  // Se for objeto, normalizar estrutura
  return {
    guidelines: toArrayOfStrings(input.guidelines),
    wcagLevel: input.wcagLevel || '',
    considerations: toArrayOfStrings(input.considerations),
  }
}

export function AccessibilityCard({
  cardId,
  guidelines = [],
  wcagLevel = '',
  considerations = [],
  onAiClick,
  onSave,
}: AccessibilityCardProps) {
  const [local, setLocal] = useState({
    guidelines: toArrayOfStrings(guidelines),
    wcagLevel: wcagLevel || '',
    considerations: toArrayOfStrings(considerations),
  })

  useEffect(() => {
    const normalized = normalizeContent({ guidelines, wcagLevel, considerations })
    setLocal(normalized)
  }, [guidelines, wcagLevel, considerations])

  useAutosave(local, {
    delay: 1500,
    onSave: async (data) => {
      if (onSave) {
        const clean = {
          guidelines: data.guidelines.map((g: string) => g.trim()).filter(Boolean),
          wcagLevel: data.wcagLevel?.trim() || '',
          considerations: data.considerations.map((c: string) => c.trim()).filter(Boolean),
        }
        await onSave(clean)
      }
    },
  })

  const addGuideline = () => {
    setLocal((s) => ({ ...s, guidelines: [...s.guidelines, ''] }))
  }

  const updateGuideline = (idx: number, value: string) => {
    setLocal((s) => ({
      ...s,
      guidelines: s.guidelines.map((g, i) => (i === idx ? value : g)),
    }))
  }

  const removeGuideline = (idx: number) => {
    setLocal((s) => ({
      ...s,
      guidelines: s.guidelines.filter((_, i) => i !== idx),
    }))
  }

  const addConsideration = () => {
    setLocal((s) => ({ ...s, considerations: [...s.considerations, ''] }))
  }

  const updateConsideration = (idx: number, value: string) => {
    setLocal((s) => ({
      ...s,
      considerations: s.considerations.map((c, i) => (i === idx ? value : c)),
    }))
  }

  const removeConsideration = (idx: number) => {
    setLocal((s) => ({
      ...s,
      considerations: s.considerations.filter((_, i) => i !== idx),
    }))
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Acessibilidade"
      icon={Eye}
      stageColor="#FF6B6B"
      onAiClick={onAiClick}
    >
      <div className="space-y-4">
        <div>
          <div className="text-sm font-semibold mb-2 text-[#FF6B6B]">Diretrizes</div>
          <div className="space-y-2">
            {local.guidelines.map((guideline, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  value={guideline}
                  onChange={(e) => updateGuideline(idx, e.target.value)}
                  placeholder="Diretriz de acessibilidade"
                  className="flex-1 bg-white/10 border border-[#FF6B6B]/50 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#FF6B6B]"
                />
                <button
                  type="button"
                  onClick={() => removeGuideline(idx)}
                  className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addGuideline}
              className="text-xs text-[#FF6B6B]/70 hover:text-[#FF6B6B] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar diretriz
            </button>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium mb-1.5 text-[#E6E9F2]/80">Nível WCAG</div>
          <select
            value={local.wcagLevel}
            onChange={(e) => setLocal((s) => ({ ...s, wcagLevel: e.target.value }))}
            className="w-full bg-white/10 border border-[#FF6B6B]/50 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#FF6B6B]"
          >
            <option value="">Selecione o nível</option>
            <option value="A">A (Básico)</option>
            <option value="AA">AA (Intermediário)</option>
            <option value="AAA">AAA (Avançado)</option>
          </select>
        </div>

        <div>
          <div className="text-sm font-semibold mb-2 text-[#FF6B6B]">Considerações</div>
          <div className="space-y-2">
            {local.considerations.map((consideration, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <textarea
                  value={consideration}
                  onChange={(e) => updateConsideration(idx, e.target.value)}
                  placeholder="Consideração de acessibilidade (contraste, navegação por teclado, screen readers, etc)"
                  className="flex-1 bg-white/10 border border-[#FF6B6B]/50 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#FF6B6B] min-h-[50px]"
                />
                <button
                  type="button"
                  onClick={() => removeConsideration(idx)}
                  className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center mt-1"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#FF6B6B]" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addConsideration}
              className="text-xs text-[#FF6B6B]/70 hover:text-[#FF6B6B] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar consideração
            </button>
          </div>
        </div>
      </div>
    </BaseCard>
  )
}
