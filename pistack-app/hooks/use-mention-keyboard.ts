/**
 * Hook for handling keyboard navigation in mention dropdown
 * Handles Arrow Up/Down, Enter, Escape
 */

import { useState, useCallback, useEffect } from 'react'
import type { MentionSuggestion } from './use-mention-autocomplete'

interface UseMentionKeyboardProps {
  isActive: boolean
  suggestions: MentionSuggestion[]
  onSelect: (suggestion: MentionSuggestion) => void
  onClose: () => void
}

export function useMentionKeyboard({
  isActive,
  suggestions,
  onSelect,
  onClose,
}: UseMentionKeyboardProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(0)
  }, [suggestions])

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!isActive || suggestions.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => (prev + 1) % suggestions.length)
          break

        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
          break

        case 'Enter':
          e.preventDefault()
          if (suggestions[selectedIndex]) {
            onSelect(suggestions[selectedIndex])
          }
          break

        case 'Escape':
          e.preventDefault()
          onClose()
          break

        case 'Tab':
          // Allow tab to select first suggestion
          if (suggestions.length > 0) {
            e.preventDefault()
            onSelect(suggestions[0])
          }
          break
      }
    },
    [isActive, suggestions, selectedIndex, onSelect, onClose]
  )

  return {
    selectedIndex,
    handleKeyDown,
  }
}
