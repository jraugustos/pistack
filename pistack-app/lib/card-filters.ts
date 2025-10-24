/**
 * Card Filtering Logic
 * Centralizes all filtering logic for cards
 */

import type { CardRecord, CompletionStatus } from './types/card'
import { calculateCompletionStatus } from './types/card'
import { getCardStageNumber, CARD_TITLES } from './card-constants'

export interface FilterOptions {
  stages: number[] // [1, 2, 3, 4, 5, 6]
  status: 'all' | CompletionStatus
  searchQuery: string
}

/**
 * Default filter options (show all)
 */
export const DEFAULT_FILTERS: FilterOptions = {
  stages: [1, 2, 3, 4, 5, 6],
  status: 'all',
  searchQuery: '',
}

/**
 * Filter cards by stage numbers
 */
export function filterByStage(cards: CardRecord[], stages: number[]): CardRecord[] {
  if (stages.length === 0 || stages.length === 6) {
    return cards // All stages selected
  }

  return cards.filter(card => {
    const stageNumber = getCardStageNumber(card.card_type)
    return stageNumber !== null && stages.includes(stageNumber)
  })
}

/**
 * Filter cards by completion status
 */
export function filterByStatus(
  cards: CardRecord[],
  status: 'all' | CompletionStatus
): CardRecord[] {
  if (status === 'all') {
    return cards
  }

  return cards.filter(card => calculateCompletionStatus(card) === status)
}

/**
 * Filter cards by search query (searches in title and content)
 */
export function filterBySearch(cards: CardRecord[], query: string): CardRecord[] {
  if (!query.trim()) {
    return cards
  }

  const normalizedQuery = query.toLowerCase().trim()

  return cards.filter(card => {
    // Search in card title
    const cardTitle = CARD_TITLES[card.card_type]?.toLowerCase() || ''
    if (cardTitle.includes(normalizedQuery)) {
      return true
    }

    // Search in card type
    if (card.card_type.toLowerCase().includes(normalizedQuery)) {
      return true
    }

    // Search in card content (stringified JSON)
    const contentString = JSON.stringify(card.content).toLowerCase()
    return contentString.includes(normalizedQuery)
  })
}

/**
 * Apply all filters to cards
 */
export function applyFilters(cards: CardRecord[], filters: FilterOptions): CardRecord[] {
  let filtered = cards

  // Apply stage filter
  filtered = filterByStage(filtered, filters.stages)

  // Apply status filter
  filtered = filterByStatus(filtered, filters.status)

  // Apply search filter
  filtered = filterBySearch(filtered, filters.searchQuery)

  return filtered
}

/**
 * Check if any filters are active (not default)
 */
export function hasActiveFilters(filters: FilterOptions): boolean {
  return (
    filters.stages.length < 6 ||
    filters.status !== 'all' ||
    filters.searchQuery.trim().length > 0
  )
}

/**
 * Count cards by status
 */
export function countByStatus(cards: CardRecord[]): Record<CompletionStatus | 'all', number> {
  const counts = {
    all: cards.length,
    empty: 0,
    partial: 0,
    complete: 0,
  }

  cards.forEach(card => {
    const status = calculateCompletionStatus(card)
    counts[status]++
  })

  return counts
}

/**
 * Count cards by stage
 */
export function countByStage(cards: CardRecord[]): Record<number, number> {
  const counts: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  }

  cards.forEach(card => {
    const stageNumber = getCardStageNumber(card.card_type)
    if (stageNumber !== null) {
      counts[stageNumber]++
    }
  })

  return counts
}
