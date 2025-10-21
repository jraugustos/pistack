'use client'

import { X, Link2 } from 'lucide-react'

interface CardReferenceBadgeProps {
  cardType: string
  cardTitle: string
  stageName: string
  stageColor: string
  onRemove: () => void
}

/**
 * CardReferenceBadge - Mostra o card atualmente referenciado no contexto da IA
 *
 * Baseado na referência visual fornecida:
 * - Badge destacado "Contexto ativo:"
 * - Nome do card + tipo
 * - Botão X para remover
 * - Fundo destacado com bordas
 */
export function CardReferenceBadge({
  cardType,
  cardTitle,
  stageName,
  stageColor,
  onRemove,
}: CardReferenceBadgeProps) {
  return (
    <div
      className="mb-4 p-3 border rounded-lg"
      style={{
        backgroundColor: `${stageColor}10`,
        borderColor: `${stageColor}30`,
      }}
    >
      {/* Header: "Contexto ativo:" */}
      <div className="flex items-center justify-between mb-2">
        <div
          className="flex items-center gap-2 text-xs font-medium"
          style={{ color: `${stageColor}` }}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Contexto ativo:</span>
        </div>
        <button
          onClick={onRemove}
          className="w-5 h-5 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
          aria-label="Remover contexto"
          style={{ color: `${stageColor}80` }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Card Info */}
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: stageColor }}
        />
        <div>
          <div className="font-semibold text-sm text-[#E6E9F2]">{cardTitle}</div>
          <div
            className="text-xs"
            style={{ color: `${stageColor}80` }}
          >
            {stageName}
          </div>
        </div>
      </div>
    </div>
  )
}
