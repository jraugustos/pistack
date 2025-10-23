import { useEffect, useRef, useCallback, useState } from 'react'

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

interface UseAutosaveOptions {
  delay?: number // Delay in milliseconds before saving
  onSave: (value: any) => Promise<void>
}

/**
 * Hook for autosaving with debouncing and status tracking
 *
 * @param value - The value to autosave
 * @param options - Configuration options
 * @returns Object with saving state, status, last saved time, and manual save function
 */
export function useAutosave<T>(value: T, options: UseAutosaveOptions) {
  const { delay = 1000, onSave } = options
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousValueRef = useRef<T>(value)
  const isSavingRef = useRef(false)

  // Estados observáveis
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const save = useCallback(async () => {
    if (isSavingRef.current) return

    isSavingRef.current = true
    setSaveStatus('saving')
    setError(null)

    try {
      await onSave(value)
      previousValueRef.current = value
      setLastSaved(new Date())
      setSaveStatus('saved')

      // Auto-hide "saved" status após 2 segundos
      setTimeout(() => {
        setSaveStatus((current) => (current === 'saved' ? 'idle' : current))
      }, 2000)
    } catch (err) {
      console.error('Autosave error:', err)
      const error = err instanceof Error ? err : new Error('Failed to save')
      setError(error)
      setSaveStatus('error')
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

    // Marca como pendente (esperando debounce)
    setSaveStatus('pending')

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
    saveStatus,
    lastSaved,
    error,
    save, // Manual save function
  }
}
