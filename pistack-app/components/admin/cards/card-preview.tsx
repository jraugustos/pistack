'use client'

/**
 * Card Preview Component
 * Shows preview of card with generated fields
 * Used in both AI and Manual modes
 */

import { Info } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import type { CardField, CardCategory } from '@/lib/types/card-definition'

interface CardPreviewProps {
  name: string
  category: CardCategory
  icon: string
  fields: CardField[]
  suggestion?: string
}

const CATEGORY_LABELS: Record<CardCategory, string> = {
  ideation: 'Ideação',
  research: 'Pesquisa',
  planning: 'Planejamento',
  design: 'Design',
  development: 'Desenvolvimento',
  marketing: 'Marketing',
}

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'Campo de texto',
  textarea: 'Campo de texto longo',
  number: 'Campo numérico',
  date: 'Campo de data',
  select: 'Lista de opções',
  checkbox: 'Checkbox',
  file: 'Upload de arquivo',
  url: 'URL',
}

export function CardPreview({
  name,
  category,
  icon,
  fields,
  suggestion,
}: CardPreviewProps) {
  // Get Lucide icon component
  const IconComponent =
    LucideIcons[icon as keyof typeof LucideIcons] || LucideIcons.FileText

  return (
    <div className="space-y-4">
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#7AA2FF]/10 border border-[#7AA2FF]/20 flex items-center justify-center">
            {IconComponent && <IconComponent className="w-5 h-5 text-[#7AA2FF]" />}
          </div>
          <div>
            <div className="font-semibold">{name || 'Card Gerado'}</div>
            <div className="text-xs text-[#E6E9F2]/60">
              {CATEGORY_LABELS[category] || category}
            </div>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          {fields.length === 0 ? (
            <div className="text-[#E6E9F2]/40 text-center py-4">
              Nenhum campo definido
            </div>
          ) : (
            fields.map((field, index) => (
              <div key={index}>
                <div className="text-xs text-[#E6E9F2]/60 mb-1">
                  Campo sugerido: {field.name}
                  {field.required && (
                    <span className="text-red-400 ml-1">*</span>
                  )}
                </div>
                <div className="px-3 py-2 bg-white/5 rounded border border-white/10">
                  {field.placeholder || FIELD_TYPE_LABELS[field.type]}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {suggestion && (
        <div className="p-3 bg-[#7AA2FF]/10 border border-[#7AA2FF]/20 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-[#7AA2FF] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-[#7AA2FF] mb-1">IA Sugestão</div>
              <div className="text-[#E6E9F2]/80">{suggestion}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
