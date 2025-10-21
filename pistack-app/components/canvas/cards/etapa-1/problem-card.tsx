'use client'

import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface ProblemCardProps {
  cardId: string
  problem?: string
  painPoints?: string[]
  onAiClick?: () => void
  onSave?: (content: { problem: string; painPoints?: string[] }) => Promise<void>
}

/**
 * ProblemCard - Card 3 of Etapa 1: Ideia Base
 *
 * Follows HTML structure from canvas-1-2.html lines 245-285
 * - Display problem statement
 * - List of pain points as tags
 *
 * IMPORTANT: Pixel-perfect implementation from HTML prototype
 */
export function ProblemCard({
  cardId,
  problem = '',
  painPoints = [],
  onAiClick,
  onSave,
}: ProblemCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localProblem, setLocalProblem] = useState(problem)

  const defaultProblem =
    'Qual problema seu projeto resolve? Descreva a dor ou necessidade que você identificou no mercado.'

  useEffect(() => {
    setLocalProblem(problem)
  }, [problem])

  useAutosave(localProblem, {
    delay: 2000,
    onSave: async (value) => {
      if (onSave && value.trim()) {
        await onSave({ problem: value, painPoints })
      }
    },
  })

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Problema"
      icon={AlertCircle}
      stageColor="#7AA2FF"
      onAiClick={onAiClick}
    >
      {/* Problem Statement */}
      {isEditing ? (
        <textarea
          value={localProblem}
          onChange={(e) => setLocalProblem(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.metaKey) setIsEditing(false)
            if (e.key === 'Escape') {
              setLocalProblem(problem)
              setIsEditing(false)
            }
          }}
          className="w-full bg-white/10 border border-[#7AA2FF]/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#7AA2FF] min-h-[80px]"
          placeholder={defaultProblem}
          autoFocus
        />
      ) : (
        <p
          onClick={() => setIsEditing(true)}
          className="text-sm text-[#E6E9F2]/80 leading-relaxed cursor-text hover:bg-white/5 rounded px-1 -mx-1 transition-colors"
        >
          {problem || <span className="text-[#E6E9F2]/40">{defaultProblem}</span>}
        </p>
      )}

      {/* Pain Points */}
      {painPoints.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-[#E6E9F2]/40">Dores principais:</div>
          <div className="flex flex-wrap gap-1.5">
            {painPoints.map((painPoint, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/5 rounded text-xs"
              >
                {painPoint}
              </span>
            ))}
          </div>
        </div>
      )}
    </BaseCard>
  )
}
