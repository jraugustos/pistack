'use client'

import { useState, useEffect } from 'react'
import { LucideIcon } from 'lucide-react'
import { BaseCard } from './base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface GenericTextCardProps {
  cardId: string
  cardTitle: string
  icon: LucideIcon
  stageColor: string
  content?: string
  placeholder?: string
  onAiClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onSave?: (content: { content: string }) => Promise<void>
  showAiButton?: boolean
}

/**
 * GenericTextCard - Reusable card component for all stages
 *
 * Features:
 * - Inline editing with autosave
 * - Configurable icon and colors
 * - Click to edit functionality
 * - Keyboard shortcuts (Enter, Escape, Cmd+Enter)
 */
export function GenericTextCard({
  cardId,
  cardTitle,
  icon: Icon,
  stageColor,
  content = '',
  placeholder = 'Clique para adicionar conteúdo...',
  onAiClick,
  onEdit,
  onDelete,
  onSave,
  showAiButton = true,
}: GenericTextCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localContent, setLocalContent] = useState(content)

  useEffect(() => {
    setLocalContent(content)
  }, [content])

  useAutosave(localContent, {
    delay: 2000,
    onSave: async (value) => {
      if (onSave && value.trim()) {
        await onSave({ content: value })
      }
    },
  })

  return (
    <BaseCard
      cardId={cardId}
      cardTitle={cardTitle}
      icon={Icon}
      stageColor={stageColor}
      onAiClick={onAiClick}
      onEdit={onEdit}
      onDelete={onDelete}
      showAiButton={showAiButton}
    >
      {isEditing ? (
        <textarea
          value={localContent}
          onChange={(e) => setLocalContent(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.metaKey) setIsEditing(false)
            if (e.key === 'Escape') {
              setLocalContent(content)
              setIsEditing(false)
            }
          }}
          className="w-full bg-white/10 border border-current rounded px-3 py-2 text-sm focus:outline-none focus:border-current min-h-[100px] resize-none"
          placeholder={placeholder}
          autoFocus
          style={{ borderColor: stageColor }}
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="text-sm text-[#E6E9F2]/80 leading-relaxed cursor-text hover:bg-white/5 rounded px-1 -mx-1 py-2 transition-colors min-h-[100px]"
        >
          {localContent || (
            <span className="text-[#E6E9F2]/40">{placeholder}</span>
          )}
        </div>
      )}
    </BaseCard>
  )
}
