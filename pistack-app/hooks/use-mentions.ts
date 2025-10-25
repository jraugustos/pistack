/**
 * Main hook for mentions functionality
 * Combines detection, autocomplete, and keyboard navigation
 */

import { useCallback } from 'react'
import { useMentionDetection } from './use-mention-detection'
import { useMentionAutocomplete } from './use-mention-autocomplete'
import { useMentionKeyboard } from './use-mention-keyboard'
import type { CardRecord } from '@/lib/types/card'

interface UseMentionsProps {
  cards: CardRecord[]
  enabled?: boolean
  onMentionInsert?: (cardId: string, cardType: string) => void
}

export function useMentions({ cards, enabled = true, onMentionInsert }: UseMentionsProps) {
  // Mention detection
  const {
    trigger,
    handleInputChange: handleDetectionChange,
    handleKeyDown: handleDetectionKeyDown,
    insertMention,
    closeMention,
    textareaRef,
  } = useMentionDetection({ enabled })

  // Autocomplete suggestions
  const { suggestions } = useMentionAutocomplete({
    cards,
    query: trigger.query,
    maxSuggestions: 8,
  })

  // Handle mention selection
  const handleSelect = useCallback(
    (suggestion: { id: string; cardType: string; title: string }) => {
      console.log('[useMentions] handleSelect called with:', suggestion)

      // Insert mention text (e.g., "@Público-alvo")
      insertMention(`@${suggestion.title}`)

      console.log('[useMentions] Calling onMentionInsert')

      // Notify parent about mention
      if (onMentionInsert) {
        onMentionInsert(suggestion.id, suggestion.cardType)
      }

      console.log('[useMentions] handleSelect complete')
    },
    [insertMention, onMentionInsert]
  )

  // Keyboard navigation
  const { selectedIndex, handleKeyDown: handleKeyboardKeyDown } = useMentionKeyboard({
    isActive: trigger.active,
    suggestions,
    onSelect: handleSelect,
    onClose: closeMention,
  })

  // Combined key down handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (trigger.active) {
        // When dropdown is open, keyboard handler takes priority
        handleKeyboardKeyDown(e)
      } else {
        // Otherwise, detection handler (for Escape)
        handleDetectionKeyDown(e)
      }
    },
    [trigger.active, handleKeyboardKeyDown, handleDetectionKeyDown]
  )

  return {
    // State
    isActive: trigger.active,
    suggestions,
    selectedIndex,
    position: trigger.position,

    // Handlers
    handleInputChange: handleDetectionChange,
    handleKeyDown,
    handleSelect,
    closeMention,

    // Refs
    textareaRef,
  }
}
