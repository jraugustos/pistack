/**
 * Hook for tracking mentioned cards
 * Maintains a list of cards that have been mentioned in the current context
 */

import { useState, useCallback } from 'react'
import type { CardRecord } from '@/lib/types/card'

export interface MentionedCard {
  id: string
  type: string
  title: string
  addedAt: Date
}

export function useMentionTracking() {
  const [mentionedCards, setMentionedCards] = useState<MentionedCard[]>([])

  /**
   * Add a card to the mentioned list
   */
  const addMention = useCallback((id: string, type: string, title: string) => {
    setMentionedCards(prev => {
      // Check if already mentioned
      if (prev.some(card => card.id === id)) {
        return prev
      }

      return [
        ...prev,
        {
          id,
          type,
          title,
          addedAt: new Date(),
        },
      ]
    })
  }, [])

  /**
   * Remove a card from the mentioned list
   */
  const removeMention = useCallback((id: string) => {
    setMentionedCards(prev => prev.filter(card => card.id !== id))
  }, [])

  /**
   * Clear all mentions
   */
  const clearMentions = useCallback(() => {
    setMentionedCards([])
  }, [])

  /**
   * Get card IDs of all mentioned cards
   */
  const getMentionedCardIds = useCallback(() => {
    return mentionedCards.map(card => card.id)
  }, [mentionedCards])

  /**
   * Check if a card is mentioned
   */
  const isMentioned = useCallback(
    (id: string) => {
      return mentionedCards.some(card => card.id === id)
    },
    [mentionedCards]
  )

  return {
    mentionedCards,
    addMention,
    removeMention,
    clearMentions,
    getMentionedCardIds,
    isMentioned,
  }
}
