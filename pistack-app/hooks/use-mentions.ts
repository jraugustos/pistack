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
  onTextUpdate?: (newText: string) => void // Callback to update parent's input state
}

export function useMentions({ cards, enabled = true, onMentionInsert, onTextUpdate }: UseMentionsProps) {
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

      if (!textareaRef.current || !trigger.active) {
        console.log('[useMentions] Cannot select - no textarea or not active')
        return
      }

      const textarea = textareaRef.current
      const value = textarea.value
      const mentionText = `@${suggestion.title}`

      // Calculate new value
      const beforeMention = value.substring(0, trigger.cursorIndex)
      const afterCursor = value.substring(textarea.selectionStart)
      const newValue = beforeMention + mentionText + ' ' + afterCursor

      console.log('[useMentions] Old value:', value)
      console.log('[useMentions] New value:', newValue)

      // Update parent's state instead of DOM manipulation
      if (onTextUpdate) {
        onTextUpdate(newValue)
      }

      // Close dropdown
      closeMention()

      // Notify parent about mention
      if (onMentionInsert) {
        onMentionInsert(suggestion.id, suggestion.cardType)
      }

      console.log('[useMentions] handleSelect complete')

      // Focus back and set cursor position
      setTimeout(() => {
        const newCursorPos = beforeMention.length + mentionText.length + 1
        textarea.setSelectionRange(newCursorPos, newCursorPos)
        textarea.focus()
      }, 0)
    },
    [trigger, textareaRef, onMentionInsert, onTextUpdate, closeMention]
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
