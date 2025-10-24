/**
 * Hook for filtering cards based on mention query
 * Provides autocomplete suggestions for @ mentions
 */

import { useMemo } from 'react'
import type { CardRecord } from '@/lib/types/card'
import { CARD_TITLES } from '@/lib/card-constants'

export interface MentionSuggestion {
  id: string
  cardType: string
  title: string
  content: Record<string, any>
  stageNumber: number
  matchScore: number // relevance score for sorting
}

interface UseMentionAutocompleteProps {
  cards: CardRecord[]
  query: string
  maxSuggestions?: number
}

/**
 * Calculate relevance score for a card based on query
 */
function calculateMatchScore(cardTitle: string, query: string): number {
  const normalizedTitle = cardTitle.toLowerCase()
  const normalizedQuery = query.toLowerCase()

  if (normalizedTitle === normalizedQuery) {
    return 100 // Exact match
  }

  if (normalizedTitle.startsWith(normalizedQuery)) {
    return 80 // Starts with query
  }

  if (normalizedTitle.includes(normalizedQuery)) {
    return 60 // Contains query
  }

  // Check for fuzzy match (all characters of query appear in order)
  let queryIndex = 0
  for (const char of normalizedTitle) {
    if (char === normalizedQuery[queryIndex]) {
      queryIndex++
      if (queryIndex === normalizedQuery.length) {
        return 40 // Fuzzy match
      }
    }
  }

  return 0 // No match
}

/**
 * Extract stage number from card type
 */
function getStageFromCardType(cardType: string): number {
  if (cardType.startsWith('etapa-1-')) return 1
  if (cardType.startsWith('etapa-2-')) return 2
  if (cardType.startsWith('etapa-3-')) return 3
  if (cardType.startsWith('etapa-4-')) return 4
  if (cardType.startsWith('etapa-5-')) return 5
  if (cardType.startsWith('etapa-6-')) return 6
  return 1
}

export function useMentionAutocomplete({
  cards,
  query,
  maxSuggestions = 8,
}: UseMentionAutocompleteProps) {
  const suggestions = useMemo<MentionSuggestion[]>(() => {
    if (!query.trim()) {
      // No query - show recent/popular cards
      return cards
        .slice(0, maxSuggestions)
        .map(card => ({
          id: card.id,
          cardType: card.card_type,
          title: CARD_TITLES[card.card_type] || card.card_type,
          content: card.content,
          stageNumber: getStageFromCardType(card.card_type),
          matchScore: 50,
        }))
    }

    // Filter and score cards
    const scored = cards
      .map(card => {
        const title = CARD_TITLES[card.card_type] || card.card_type
        const matchScore = calculateMatchScore(title, query)

        return {
          id: card.id,
          cardType: card.card_type,
          title,
          content: card.content,
          stageNumber: getStageFromCardType(card.card_type),
          matchScore,
        }
      })
      .filter(item => item.matchScore > 0)

    // Sort by score (desc), then by stage (asc)
    scored.sort((a, b) => {
      if (a.matchScore !== b.matchScore) {
        return b.matchScore - a.matchScore
      }
      return a.stageNumber - b.stageNumber
    })

    // Limit results
    return scored.slice(0, maxSuggestions)
  }, [cards, query, maxSuggestions])

  return { suggestions }
}
