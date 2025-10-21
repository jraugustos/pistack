import { useEffect, useRef, useCallback } from 'react'

interface UseAutosaveOptions {
  delay?: number // Delay in milliseconds before saving
  onSave: (value: any) => Promise<void>
}

/**
 * Hook for autosaving with debouncing
 *
 * @param value - The value to autosave
 * @param options - Configuration options
 * @returns Object with saving state and manual save function
 */
export function useAutosave<T>(value: T, options: UseAutosaveOptions) {
  const { delay = 1000, onSave } = options
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousValueRef = useRef<T>(value)
  const isSavingRef = useRef(false)

  const save = useCallback(async () => {
    if (isSavingRef.current) return

    isSavingRef.current = true
    try {
      await onSave(value)
      previousValueRef.current = value
    } catch (error) {
      console.error('Autosave error:', error)
    } finally {
      isSavingRef.current = false
    }
  }, [value, onSave])

  useEffect(() => {
    // Skip if value hasn't changed
    if (value === previousValueRef.current) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save()
    }, delay)

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay, save])

  return {
    isSaving: isSavingRef.current,
    save, // Manual save function
  }
}
