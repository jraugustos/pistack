'use client'

import { useState, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'
import { SaveIndicatorCompact } from '@/components/canvas/save-indicator'

interface PitchCardProps {
  cardId: string
  pitch?: string
  onAiClick?: () => void
  onExpand?: () => void
  onRefine?: () => void
  onSave?: (content: { pitch: string }) => Promise<void>
}

/**
 * PitchCard - Card 2 of Etapa 1: Ideia Base
 *
 * Follows HTML structure from canvas-1-2.html lines 208-242
 * - Display elevator pitch
 * - Action buttons: Expand and Refine
 *
 * IMPORTANT: Pixel-perfect implementation from HTML prototype
 */
export function PitchCard({
  cardId,
  pitch = '',
  onAiClick,
  onExpand,
  onRefine,
  onSave,
}: PitchCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localPitch, setLocalPitch] = useState(pitch)

  const defaultPitch =
    'Descreva sua ideia em uma ou duas frases. Como você explicaria seu projeto para alguém em um elevador?'

  // Update local state when props change
  useEffect(() => {
    if (pitch && pitch !== localPitch) {
      setLocalPitch(pitch)
    }
  }, [pitch, localPitch])

  // Autosave when content changes
  const { saveStatus, lastSaved, error } = useAutosave(localPitch, {
    delay: 2000,
    onSave: async (value) => {
      if (onSave && value.trim()) {
        await onSave({ pitch: value })
      }
    },
  })

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Pitch"
      icon={MessageSquare}
      stageColor="#7AA2FF"
      onAiClick={onAiClick}
      saveIndicator={
        <SaveIndicatorCompact
          status={saveStatus}
          lastSaved={lastSaved}
          error={error}
        />
      }
      footer={
        <div className="flex items-center gap-2">
          <button
            onClick={onExpand}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors"
          >
            Expand
          </button>
          <button
            onClick={onRefine}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors"
          >
            Refine
          </button>
        </div>
      }
    >
      {/* Pitch Text */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={localPitch}
            onChange={(e) => setLocalPitch(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) setIsEditing(false)
              if (e.key === 'Escape') {
                setLocalPitch(pitch)
                setIsEditing(false)
              }
            }}
            className="w-full bg-white/10 border border-[#7AA2FF]/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#7AA2FF] min-h-[80px]"
            placeholder={defaultPitch}
            autoFocus
          />
        </div>
      ) : (
        <p
          onClick={() => setIsEditing(true)}
          className="text-sm text-[#E6E9F2]/80 leading-relaxed cursor-text hover:bg-white/5 rounded px-1 -mx-1 transition-colors"
        >
          {pitch || <span className="text-[#E6E9F2]/40">{defaultPitch}</span>}
        </p>
      )}
    </BaseCard>
  )
}
