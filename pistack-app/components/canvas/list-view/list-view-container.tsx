'use client'

import { useMemo } from 'react'
import { ListViewItem } from './list-view-item'
import type { CardRecord } from '@/lib/types/card'
import { calculateCompletionStatus } from '@/lib/types/card'
import { getCardStageNumber, STAGE_NAMES, STAGE_COLORS } from '@/lib/card-constants'
import { sortCards, type SortOption, SORT_OPTION_LABELS } from '@/lib/card-sorting'
import { FileQuestion, ArrowUpDown } from 'lucide-react'

interface ListViewContainerProps {
  cards: CardRecord[]
  onView?: (card: CardRecord) => void
  onEdit: (card: CardRecord) => void
  onAI: (card: CardRecord) => void
  onDelete: (card: CardRecord) => void
  emptyMessage?: string
  sortOption?: SortOption
  onSortChange?: (option: SortOption) => void
}

export function ListViewContainer({
  cards,
  onView,
  onEdit,
  onAI,
  onDelete,
  emptyMessage = 'Nenhum card encontrado',
  sortOption = 'stage-asc',
  onSortChange,
}: ListViewContainerProps) {
  // Sort cards based on selected option
  const sortedCards = useMemo(() => {
    return sortCards(cards, sortOption)
  }, [cards, sortOption])

  if (sortedCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <FileQuestion className="w-12 h-12 text-[#E6E9F2]/20 mb-4" />
        <p className="text-sm text-[#E6E9F2]/40">{emptyMessage}</p>
      </div>
    )
  }

  // Sort dropdown (optional)
  const SortDropdown = onSortChange && (
    <div className="mb-4 flex items-center gap-2 flex-wrap">
      <ArrowUpDown className="w-4 h-4 text-[#E6E9F2]/40" />
      <select
        value={sortOption}
        onChange={e => onSortChange(e.target.value as SortOption)}
        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-[#E6E9F2] focus:outline-none focus:ring-2 focus:ring-[#7AA2FF]/50 focus:border-[#7AA2FF]/50 transition-colors"
      >
        {(Object.keys(SORT_OPTION_LABELS) as SortOption[]).map(option => (
          <option key={option} value={option}>
            {SORT_OPTION_LABELS[option]}
          </option>
        ))}
      </select>
      <span className="text-xs text-[#E6E9F2]/40">
        {sortedCards.length} {sortedCards.length === 1 ? 'card' : 'cards'}
      </span>
    </div>
  )

  // Regular rendering
  return (
    <div>
      {SortDropdown}
      <div className="space-y-2" role="list">
        {sortedCards.map(card => {
          const stageNumber = getCardStageNumber(card.card_type) || 1
          const stageName = STAGE_NAMES[stageNumber]
          const stageColor = STAGE_COLORS[stageNumber]
          const completionStatus = calculateCompletionStatus(card)

          return (
            <ListViewItem
              key={card.id}
              card={card}
              stageName={stageName}
              stageColor={stageColor}
              completionStatus={completionStatus}
              onClick={onView ? () => onView(card) : undefined}
              onEdit={() => onEdit(card)}
              onAI={() => onAI(card)}
              onDelete={() => onDelete(card)}
            />
          )
        })}
      </div>
    </div>
  )
}
