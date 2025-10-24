'use client'

import { Edit3, Sparkles, Trash2, Circle, CircleDot, CheckCircle2 } from 'lucide-react'
import type { CardRecord, CompletionStatus } from '@/lib/types/card'
import { getRelativeTime } from '@/lib/types/card'
import { CARD_TITLES } from '@/lib/card-constants'

interface ListViewItemProps {
  card: CardRecord
  stageName: string
  stageColor: string
  completionStatus: CompletionStatus
  onClick?: () => void
  onEdit: () => void
  onAI: () => void
  onDelete: () => void
}

const STATUS_CONFIG = {
  empty: {
    icon: Circle,
    label: 'Vazio',
    color: '#E6E9F2',
    opacity: '30',
  },
  partial: {
    icon: CircleDot,
    label: 'Parcial',
    color: '#FFC24B',
    opacity: '100',
  },
  complete: {
    icon: CheckCircle2,
    label: 'Completo',
    color: '#5AD19A',
    opacity: '100',
  },
}

export function ListViewItem({
  card,
  stageName,
  stageColor,
  completionStatus,
  onClick,
  onEdit,
  onAI,
  onDelete,
}: ListViewItemProps) {
  const statusConfig = STATUS_CONFIG[completionStatus]
  const StatusIcon = statusConfig.icon
  const cardTitle = CARD_TITLES[card.card_type] || 'Card'
  const relativeTime = getRelativeTime(card.updated_at)

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    onClick?.()
  }

  return (
    <div
      onClick={handleCardClick}
      className={`group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-3 bg-[#13161C] border border-white/5 rounded-lg hover:bg-white/5 hover:border-white/10 transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      role="listitem"
    >
      {/* Mobile/Desktop Layout */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Status Icon */}
        <div className="flex-shrink-0">
          <StatusIcon
            className="w-5 h-5"
            style={{
              color: statusConfig.color,
              opacity: parseInt(statusConfig.opacity) / 100,
            }}
          />
        </div>

        {/* Card Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-medium text-[#E6E9F2] truncate">
              {cardTitle}
            </h3>
            {/* Stage Badge */}
            <span
              className="px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap"
              style={{
                backgroundColor: `${stageColor}20`,
                color: stageColor,
              }}
            >
              {stageName}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#E6E9F2]/40 flex-wrap">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Circle className="w-2.5 h-2.5" style={{ color: statusConfig.color }} />
              {statusConfig.label}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="whitespace-nowrap">{relativeTime}</span>
          </div>
        </div>
      </div>

      {/* Actions - visible on hover (desktop) or always visible (mobile) */}
      <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-end sm:self-auto">
        <button
          onClick={onEdit}
          className="p-2 text-[#E6E9F2]/60 hover:text-[#E6E9F2] hover:bg-white/5 rounded transition-colors"
          title="Editar card"
          aria-label="Editar card"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button
          onClick={onAI}
          className="p-2 text-[#7AA2FF]/80 hover:text-[#7AA2FF] hover:bg-[#7AA2FF]/10 rounded transition-colors"
          title="Preencher com IA"
          aria-label="Preencher com IA"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        <button
          onClick={onDelete}
          className="p-2 text-[#FF6B6B]/60 hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded transition-colors"
          title="Excluir card"
          aria-label="Excluir card"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
