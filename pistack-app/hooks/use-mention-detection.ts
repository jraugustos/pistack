/**
 * Hook for detecting @ mentions in textarea/input
 * Detects when user types @ and provides autocomplete suggestions
 */

import { useState, useCallback, useEffect, useRef } from 'react'

export interface MentionTrigger {
  active: boolean
  query: string // text after @
  position: { top: number; left: number } // position for dropdown
  cursorIndex: number // cursor position in text
}

interface UseMentionDetectionProps {
  enabled?: boolean
  triggerChar?: string // default: '@'
}

export function useMentionDetection({
  enabled = true,
  triggerChar = '@',
}: UseMentionDetectionProps = {}) {
  const [trigger, setTrigger] = useState<MentionTrigger>({
    active: false,
    query: '',
    position: { top: 0, left: 0 },
    cursorIndex: -1,
  })

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  /**
   * Calculate dropdown position based on cursor
   */
  const calculateDropdownPosition = useCallback(
    (textarea: HTMLTextAreaElement, cursorIndex: number) => {
      // Create a mirror div to calculate cursor position
      const mirror = document.createElement('div')
      const computed = window.getComputedStyle(textarea)

      // Copy textarea styles to mirror
      mirror.style.position = 'absolute'
      mirror.style.visibility = 'hidden'
      mirror.style.whiteSpace = 'pre-wrap'
      mirror.style.wordWrap = 'break-word'
      mirror.style.font = computed.font
      mirror.style.padding = computed.padding
      mirror.style.border = computed.border
      mirror.style.width = computed.width
      mirror.style.lineHeight = computed.lineHeight

      // Get text up to cursor
      const textBeforeCursor = textarea.value.substring(0, cursorIndex)
      mirror.textContent = textBeforeCursor

      // Add span to measure cursor position
      const span = document.createElement('span')
      span.textContent = '|'
      mirror.appendChild(span)

      document.body.appendChild(mirror)

      // Get textarea and span positions
      const textareaRect = textarea.getBoundingClientRect()
      const spanRect = span.getBoundingClientRect()

      // Calculate absolute viewport position (for fixed positioning with portal)
      const top = spanRect.top + 20 // 20px below cursor
      const left = spanRect.left

      document.body.removeChild(mirror)

      return { top, left }
    },
    []
  )

  /**
   * Handle input change - detect @ trigger
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!enabled) return

      const textarea = e.target
      textareaRef.current = textarea

      const value = textarea.value
      const cursorIndex = textarea.selectionStart

      // Find last @ before cursor
      const textBeforeCursor = value.substring(0, cursorIndex)
      const lastAtIndex = textBeforeCursor.lastIndexOf(triggerChar)

      // Check if @ is valid trigger
      if (lastAtIndex === -1) {
        // No @ found
        if (trigger.active) {
          setTrigger({ active: false, query: '', position: { top: 0, left: 0 }, cursorIndex: -1 })
        }
        return
      }

      // Check if there's a space between @ and cursor (breaks mention)
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) {
        // Space found, deactivate
        if (trigger.active) {
          setTrigger({ active: false, query: '', position: { top: 0, left: 0 }, cursorIndex: -1 })
        }
        return
      }

      // Check if @ is at start or after space/newline (valid trigger)
      const charBeforeAt = lastAtIndex > 0 ? value[lastAtIndex - 1] : ' '
      const isValidTrigger = charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0

      if (!isValidTrigger) {
        if (trigger.active) {
          setTrigger({ active: false, query: '', position: { top: 0, left: 0 }, cursorIndex: -1 })
        }
        return
      }

      // Valid mention trigger!
      const query = textAfterAt
      const position = calculateDropdownPosition(textarea, cursorIndex)

      setTrigger({
        active: true,
        query,
        position,
        cursorIndex: lastAtIndex,
      })
    },
    [enabled, triggerChar, trigger.active, calculateDropdownPosition]
  )

  /**
   * Handle key down - detect Escape to close
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!trigger.active) return

      if (e.key === 'Escape') {
        e.preventDefault()
        setTrigger({ active: false, query: '', position: { top: 0, left: 0 }, cursorIndex: -1 })
      }
    },
    [trigger.active]
  )

  /**
   * Insert mention at cursor position
   */
  const insertMention = useCallback(
    (mentionText: string) => {
      if (!textareaRef.current || !trigger.active) return

      const textarea = textareaRef.current
      const value = textarea.value

      // Replace @query with mention
      const beforeMention = value.substring(0, trigger.cursorIndex)
      const afterCursor = value.substring(textarea.selectionStart)

      const newValue = beforeMention + mentionText + ' ' + afterCursor
      const newCursorPos = beforeMention.length + mentionText.length + 1

      // Update textarea value
      textarea.value = newValue

      // Set cursor position
      textarea.setSelectionRange(newCursorPos, newCursorPos)

      // Trigger change event
      const event = new Event('input', { bubbles: true })
      textarea.dispatchEvent(event)

      // Close dropdown
      setTrigger({ active: false, query: '', position: { top: 0, left: 0 }, cursorIndex: -1 })

      // Focus back on textarea
      textarea.focus()
    },
    [trigger]
  )

  /**
   * Close mention dropdown
   */
  const closeMention = useCallback(() => {
    setTrigger({ active: false, query: '', position: { top: 0, left: 0 }, cursorIndex: -1 })
  }, [])

  return {
    trigger,
    handleInputChange,
    handleKeyDown,
    insertMention,
    closeMention,
    textareaRef,
  }
}
