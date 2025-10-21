'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, Check } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface SolutionCardProps {
  cardId: string
  solution?: string
  differentiators?: string[]
  onAiClick?: () => void
  onSave?: (content: { solution: string; differentiators?: string[] }) => Promise<void>
}

/**
 * SolutionCard - Card 4 of Etapa 1: Ideia Base
 *
 * Follows HTML structure from canvas-1-2.html lines 288-331
 * - Display solution description
 * - List of differentiators with checkmarks
 *
 * IMPORTANT: Pixel-perfect implementation from HTML prototype
 */
export function SolutionCard({
  cardId,
  solution = '',
  differentiators = [],
  onAiClick,
  onSave,
}: SolutionCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localSolution, setLocalSolution] = useState(solution)

  const defaultSolution =
    'Como seu projeto resolve o problema? Descreva sua solução e o que a torna única.'

  useEffect(() => {
    setLocalSolution(solution)
  }, [solution])

  useAutosave(localSolution, {
    delay: 2000,
    onSave: async (value) => {
      if (onSave && value.trim()) {
        await onSave({ solution: value, differentiators })
      }
    },
  })

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Solução"
      icon={Lightbulb}
      stageColor="#7AA2FF"
      onAiClick={onAiClick}
    >
      {/* Solution Description */}
      {isEditing ? (
        <textarea
          value={localSolution}
          onChange={(e) => setLocalSolution(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.metaKey) setIsEditing(false)
            if (e.key === 'Escape') {
              setLocalSolution(solution)
              setIsEditing(false)
            }
          }}
          className="w-full bg-white/10 border border-[#7AA2FF]/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#7AA2FF] min-h-[80px]"
          placeholder={defaultSolution}
          autoFocus
        />
      ) : (
        <p
          onClick={() => setIsEditing(true)}
          className="text-sm text-[#E6E9F2]/80 leading-relaxed cursor-text hover:bg-white/5 rounded px-1 -mx-1 transition-colors"
        >
          {solution || <span className="text-[#E6E9F2]/40">{defaultSolution}</span>}
        </p>
      )}

      {/* Differentiators */}
      {differentiators.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-[#E6E9F2]/40">Diferenciais:</div>
          <ul className="space-y-1 text-xs text-[#E6E9F2]/70">
            {differentiators.map((diff, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="w-3 h-3 text-[#5AD19A] mt-0.5 flex-shrink-0" />
                <span>{diff}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </BaseCard>
  )
}
