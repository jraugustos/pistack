import { useState, useCallback } from 'react'

interface UseCardEditorProps {
  initialContent: any
  onSave: (content: any) => Promise<void>
}

export function useCardEditor({ initialContent, onSave }: UseCardEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const startEditing = useCallback(() => {
    setIsEditing(true)
  }, [])

  const cancelEditing = useCallback(() => {
    setContent(initialContent)
    setIsEditing(false)
  }, [initialContent])

  const save = useCallback(async () => {
    setIsSaving(true)
    try {
      await onSave(content)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving card:', error)
    } finally {
      setIsSaving(false)
    }
  }, [content, onSave])

  const updateContent = useCallback((updates: any) => {
    setContent((prev: any) => ({ ...prev, ...updates }))
  }, [])

  return {
    content,
    isEditing,
    isSaving,
    startEditing,
    cancelEditing,
    save,
    updateContent,
  }
}
