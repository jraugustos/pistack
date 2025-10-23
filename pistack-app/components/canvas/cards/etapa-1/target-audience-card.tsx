'use client'

import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface TargetAudienceCardProps {
  cardId: string
  primaryAudience?: string
  secondaryAudience?: string
  onAiClick?: () => void
  onSave?: (
    content: { primaryAudience?: string; secondaryAudience?: string; audience?: string }
  ) => Promise<void>
}

/**
 * TargetAudienceCard - Card 5 of Etapa 1: Ideia Base
 *
 * Follows HTML structure from canvas-1-2.html lines 334-371
 * - Primary target audience
 * - Secondary target audience
 *
 * IMPORTANT: Pixel-perfect implementation from HTML prototype
 */
export function TargetAudienceCard({
  cardId,
  primaryAudience = '',
  secondaryAudience = '',
  onAiClick,
  onSave,
}: TargetAudienceCardProps) {
  const [isEditingPrimary, setIsEditingPrimary] = useState(false)
  const [isEditingSecondary, setIsEditingSecondary] = useState(false)
  const [localPrimary, setLocalPrimary] = useState(primaryAudience)
  const [localSecondary, setLocalSecondary] = useState(secondaryAudience)

  const defaultPrimary =
    'Descreva seu público-alvo primário: idade, renda, comportamento, necessidades.'
  const defaultSecondary =
    'Público secundário que também pode se beneficiar da solução.'

  useEffect(() => {
    setLocalPrimary(primaryAudience)
    setLocalSecondary(secondaryAudience)
  }, [primaryAudience, secondaryAudience])

  useAutosave(
    { primary: localPrimary, secondary: localSecondary },
    {
      delay: 2000,
      onSave: async (data) => {
        if (onSave) {
          // Persist structured fields to avoid label duplication loops
          await onSave({
            primaryAudience: data.primary?.trim() || '',
            secondaryAudience: data.secondary?.trim() || '',
          })
        }
      },
    }
  )

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Público-Alvo"
      icon={Users}
      stageColor="#7AA2FF"
      onAiClick={onAiClick}
    >
      <div className="space-y-3">
        {/* Primary Audience */}
        <div>
          <div className="text-sm font-medium mb-1.5">Primário</div>
          {isEditingPrimary ? (
            <textarea
              value={localPrimary}
              onChange={(e) => setLocalPrimary(e.target.value)}
              onBlur={() => setIsEditingPrimary(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) setIsEditingPrimary(false)
                if (e.key === 'Escape') {
                  setLocalPrimary(primaryAudience)
                  setIsEditingPrimary(false)
                }
              }}
              className="w-full bg-white/10 border border-[#7AA2FF]/50 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#7AA2FF] min-h-[60px]"
              placeholder={defaultPrimary}
              autoFocus
            />
          ) : (
            <p
              onClick={() => setIsEditingPrimary(true)}
              className="text-xs text-[#E6E9F2]/70 cursor-text hover:bg-white/5 rounded px-1 -mx-1 transition-colors"
            >
              {primaryAudience || (
                <span className="text-[#E6E9F2]/40">{defaultPrimary}</span>
              )}
            </p>
          )}
        </div>

        {/* Secondary Audience */}
        <div>
          <div className="text-sm font-medium mb-1.5">Secundário</div>
          {isEditingSecondary ? (
            <textarea
              value={localSecondary}
              onChange={(e) => setLocalSecondary(e.target.value)}
              onBlur={() => setIsEditingSecondary(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) setIsEditingSecondary(false)
                if (e.key === 'Escape') {
                  setLocalSecondary(secondaryAudience)
                  setIsEditingSecondary(false)
                }
              }}
              className="w-full bg-white/10 border border-[#7AA2FF]/50 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#7AA2FF] min-h-[60px]"
              placeholder={defaultSecondary}
              autoFocus
            />
          ) : (
            <p
              onClick={() => setIsEditingSecondary(true)}
              className="text-xs text-[#E6E9F2]/70 cursor-text hover:bg-white/5 rounded px-1 -mx-1 transition-colors"
            >
              {secondaryAudience || (
                <span className="text-[#E6E9F2]/40">{defaultSecondary}</span>
              )}
            </p>
          )}
        </div>
      </div>
    </BaseCard>
  )
}
