/**
 * Card Sorting Logic
 * Centralizes all sorting logic for cards
 */

import type { CardRecord } from './types/card'
import { calculateCompletionStatus } from './types/card'
import { getCardStageNumber, CARD_TITLES } from './card-constants'

export type SortOption =
  | 'stage-asc' // Por etapa (1→6)
  | 'stage-desc' // Por etapa (6→1)
  | 'updated-desc' // Mais recentes primeiro
  | 'updated-asc' // Mais antigos primeiro
  | 'alphabetical' // Por título A→Z
  | 'completion' // Por % de preenchimento (completo → vazio)

/**
 * Sort cards by stage (ascending or descending)
 */
function sortByStage(cards: CardRecord[], direction: 'asc' | 'desc'): CardRecord[] {
  return [...cards].sort((a, b) => {
    const stageA = getCardStageNumber(a.card_type) || 0
    const stageB = getCardStageNumber(b.card_type) || 0

    const stageDiff = stageA - stageB

    if (stageDiff !== 0) {
      return direction === 'asc' ? stageDiff : -stageDiff
    }

    // Secondary sort by position
    return a.position - b.position
  })
}

/**
 * Sort cards by updated_at timestamp
 */
function sortByUpdated(cards: CardRecord[], direction: 'asc' | 'desc'): CardRecord[] {
  return [...cards].sort((a, b) => {
    const timeA = new Date(a.updated_at).getTime()
    const timeB = new Date(b.updated_at).getTime()

    return direction === 'desc' ? timeB - timeA : timeA - timeB
  })
}

/**
 * Sort cards alphabetically by title
 */
function sortAlphabetically(cards: CardRecord[]): CardRecord[] {
  return [...cards].sort((a, b) => {
    const titleA = CARD_TITLES[a.card_type] || a.card_type
    const titleB = CARD_TITLES[b.card_type] || b.card_type

    return titleA.localeCompare(titleB, 'pt-BR')
  })
}

/**
 * Sort cards by completion status (complete → partial → empty)
 */
function sortByCompletion(cards: CardRecord[]): CardRecord[] {
  const completionOrder = {
    complete: 3,
    partial: 2,
    empty: 1,
  }

  return [...cards].sort((a, b) => {
    const statusA = calculateCompletionStatus(a)
    const statusB = calculateCompletionStatus(b)

    const orderDiff = completionOrder[statusB] - completionOrder[statusA]

    if (orderDiff !== 0) {
      return orderDiff
    }

    // Secondary sort by stage
    const stageA = getCardStageNumber(a.card_type) || 0
    const stageB = getCardStageNumber(b.card_type) || 0

    return stageA - stageB
  })
}

/**
 * Apply sorting to cards based on selected option
 */
export function sortCards(cards: CardRecord[], sortOption: SortOption): CardRecord[] {
  switch (sortOption) {
    case 'stage-asc':
      return sortByStage(cards, 'asc')
    case 'stage-desc':
      return sortByStage(cards, 'desc')
    case 'updated-desc':
      return sortByUpdated(cards, 'desc')
    case 'updated-asc':
      return sortByUpdated(cards, 'asc')
    case 'alphabetical':
      return sortAlphabetically(cards)
    case 'completion':
      return sortByCompletion(cards)
    default:
      return cards
  }
}

/**
 * Sort option labels for UI
 */
export const SORT_OPTION_LABELS: Record<SortOption, string> = {
  'stage-asc': 'Etapa (1→6)',
  'stage-desc': 'Etapa (6→1)',
  'updated-desc': 'Mais recentes',
  'updated-asc': 'Mais antigos',
  alphabetical: 'Alfabética (A-Z)',
  completion: 'Completude',
}
