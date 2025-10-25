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
   * Calculate dropdown position based on textarea
   * Position above textarea to avoid scrolling issues
   */
  const calculateDropdownPosition = useCallback(
    (textarea: HTMLTextAreaElement, cursorIndex: number) => {
      const textareaRect = textarea.getBoundingClientRect()

      // Position dropdown above textarea (280px is approx dropdown height)
      const top = textareaRect.top - 280
      const left = textareaRect.left

      console.log('[MentionDetection] Textarea rect:', textareaRect)
      console.log('[MentionDetection] Calculated position - TOP:', top, 'LEFT:', left)

      return { top, left }
    },
    []
  )

  /**
   * Handle input change - detect @ trigger
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!enabled) {
        console.log('[MentionDetection] Disabled')
        return
      }

      const textarea = e.target
      textareaRef.current = textarea

      const value = textarea.value
      const cursorIndex = textarea.selectionStart

      console.log('[MentionDetection] Input:', value, 'Cursor:', cursorIndex)

      // Find last @ before cursor
      const textBeforeCursor = value.substring(0, cursorIndex)
      const lastAtIndex = textBeforeCursor.lastIndexOf(triggerChar)

      console.log('[MentionDetection] lastAtIndex:', lastAtIndex)

      // Check if @ is valid trigger
      if (lastAtIndex === -1) {
        // No @ found
        console.log('[MentionDetection] No @ found')
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

      console.log('[MentionDetection] ACTIVATING! Query:', query, 'Position:', position)

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
      console.log('[MentionDetection] insertMention called with:', mentionText)

      if (!textareaRef.current || !trigger.active) {
        console.log('[MentionDetection] Cannot insert - no textarea or not active')
        return
      }

      const textarea = textareaRef.current
      const value = textarea.value

      console.log('[MentionDetection] Current value:', value)
      console.log('[MentionDetection] Cursor index:', trigger.cursorIndex)

      // Replace @query with mention
      const beforeMention = value.substring(0, trigger.cursorIndex)
      const afterCursor = value.substring(textarea.selectionStart)

      const newValue = beforeMention + mentionText + ' ' + afterCursor
      const newCursorPos = beforeMention.length + mentionText.length + 1

      console.log('[MentionDetection] New value:', newValue)
      console.log('[MentionDetection] New cursor pos:', newCursorPos)

      // Update textarea value
      textarea.value = newValue

      // Set cursor position
      textarea.setSelectionRange(newCursorPos, newCursorPos)

      // Trigger React's onChange by dispatching input event
      // Use native event with proper React hooks
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set

      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(textarea, newValue)
      }

      // Dispatch both input and change events to ensure React picks it up
      const inputEvent = new Event('input', { bubbles: true })
      const changeEvent = new Event('change', { bubbles: true })
      textarea.dispatchEvent(inputEvent)
      textarea.dispatchEvent(changeEvent)

      console.log('[MentionDetection] Events dispatched')

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
