'use client'

import { X, Edit3, Sparkles } from 'lucide-react'
import { CARD_TITLES } from '@/lib/card-constants'
import type { CardRecord } from '@/lib/types/card'

interface CardViewModalProps {
  card: CardRecord
  stageName: string
  stageColor: string
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onAI: () => void
}

export function CardViewModal({
  card,
  stageName,
  stageColor,
  isOpen,
  onClose,
  onEdit,
  onAI,
}: CardViewModalProps) {
  if (!isOpen) return null

  const cardTitle = CARD_TITLES[card.card_type] || card.card_type

  // Render field value based on type
  const renderFieldValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-[#E6E9F2]/30 italic">Não preenchido</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-[#E6E9F2]/30 italic">Nenhum item</span>
      }

      return (
        <ul className="list-disc list-inside space-y-1">
          {value.map((item, index) => (
            <li key={index} className="text-[#E6E9F2]/80">
              {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
            </li>
          ))}
        </ul>
      )
    }

    if (typeof value === 'object') {
      return (
        <div className="space-y-2">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="pl-4 border-l-2 border-white/10">
              <span className="text-[#E6E9F2]/60 text-xs font-medium uppercase tracking-wider">
                {key}:
              </span>
              <div className="mt-1">{renderFieldValue(val)}</div>
            </div>
          ))}
        </div>
      )
    }

    return <span className="text-[#E6E9F2]/80">{String(value)}</span>
  }

  // Get friendly field name
  const getFieldName = (key: string): string => {
    const fieldNames: Record<string, string> = {
      name: 'Nome',
      description: 'Descrição',
      pitch: 'Pitch',
      problem: 'Problema',
      solution: 'Solução',
      primaryAudience: 'Público Principal',
      secondaryAudience: 'Público Secundário',
      painPoints: 'Dores',
      kpis: 'KPIs',
      hypotheses: 'Hipóteses',
      persona: 'Persona',
      competitors: 'Concorrentes',
      features: 'Funcionalidades',
      stories: 'User Stories',
      criteria: 'Critérios',
      phases: 'Fases',
      differentiators: 'Diferenciais',
      // Add more as needed
    }

    return fieldNames[key] || key.charAt(0).toUpperCase() + key.slice(1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#13161C] rounded-xl shadow-2xl border border-white/10 flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b border-white/10"
          style={{
            background: `linear-gradient(to bottom, ${stageColor}15, transparent)`,
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-[#E6E9F2] truncate">
                {cardTitle}
              </h2>
              <span
                className="px-2 py-1 text-xs font-medium rounded whitespace-nowrap"
                style={{
                  backgroundColor: `${stageColor}20`,
                  color: stageColor,
                }}
              >
                {stageName}
              </span>
            </div>
            <p className="text-sm text-[#E6E9F2]/40">{card.card_type}</p>
          </div>

          <button
            onClick={onClose}
            className="ml-4 p-2 text-[#E6E9F2]/60 hover:text-[#E6E9F2] hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.keys(card.content).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#E6E9F2]/40 mb-4">
                Este card ainda não foi preenchido
              </p>
              <button
                onClick={onAI}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#7AA2FF] hover:bg-[#6690E8] text-white rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Preencher com IA
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(card.content).map(([key, value]) => (
                <div key={key}>
                  <h3 className="text-sm font-medium text-[#E6E9F2]/60 mb-2 uppercase tracking-wider">
                    {getFieldName(key)}
                  </h3>
                  <div className="text-sm">{renderFieldValue(value)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onAI}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#7AA2FF] hover:text-[#6690E8] hover:bg-[#7AA2FF]/10 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Preencher com IA
          </button>

          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-[#E6E9F2] rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Editar
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#E6E9F2]/60 hover:text-[#E6E9F2] hover:bg-white/5 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
