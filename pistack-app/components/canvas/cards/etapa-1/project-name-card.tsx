'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, Calendar } from 'lucide-react'
import { BaseCard } from '../base-card'
import { useAutosave } from '@/hooks/use-autosave'

interface ProjectNameCardProps {
  cardId: string
  projectName?: string
  description?: string
  createdAt?: Date
  onAiClick?: () => void
  onSave?: (data: { projectName: string; description: string }) => Promise<void>
}

/**
 * ProjectNameCard - Card 1 of Etapa 1: Ideia Base
 *
 * Follows HTML structure from canvas-1-2.html lines 176-205
 * - Display project name
 * - Short description
 * - Creation date metadata
 *
 * IMPORTANT: Pixel-perfect implementation from HTML prototype
 */
export function ProjectNameCard({
  cardId,
  projectName = '',
  description = '',
  createdAt,
  onAiClick,
  onSave,
}: ProjectNameCardProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [localName, setLocalName] = useState(projectName)
  const [localDesc, setLocalDesc] = useState(description)

  // Update local state when props change
  useEffect(() => {
    setLocalName(projectName)
    setLocalDesc(description)
  }, [projectName, description])

  // Autosave when content changes
  useAutosave(
    { projectName: localName, description: localDesc },
    {
      delay: 2000, // 2 seconds debounce
      onSave: async (data) => {
        if (onSave && (data.projectName.trim() || data.description.trim())) {
          await onSave(data)
        }
      },
    }
  )

  const formatDate = (dateInput?: Date | string) => {
    if (!dateInput) return 'Recém criado'

    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Criado hoje'
    if (diffInDays === 1) return 'Criado ontem'
    if (diffInDays < 7) return `Criado há ${diffInDays} dias`
    if (diffInDays < 30) return `Criado há ${Math.floor(diffInDays / 7)} semanas`
    return `Criado há ${Math.floor(diffInDays / 30)} meses`
  }

  return (
    <BaseCard
      cardId={cardId}
      cardTitle="Ideia"
      icon={Lightbulb}
      stageColor="#7AA2FF"
      onAiClick={onAiClick}
      metadata={
        <div className="flex items-center gap-1 text-[#E6E9F2]/40">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(createdAt)}</span>
        </div>
      }
    >
      {/* Project Name */}
      {isEditingName ? (
        <input
          type="text"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          onBlur={() => setIsEditingName(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setIsEditingName(false)
            if (e.key === 'Escape') {
              setLocalName(projectName)
              setIsEditingName(false)
            }
          }}
          className="w-full font-semibold text-lg bg-white/10 border border-[#7AA2FF]/50 rounded px-2 py-1 focus:outline-none focus:border-[#7AA2FF]"
          autoFocus
        />
      ) : (
        <h3
          className="font-semibold text-lg cursor-text hover:bg-white/5 rounded px-2 -mx-2 py-1 transition-colors"
          onClick={() => setIsEditingName(true)}
        >
          {localName || 'Minha nova ideia'}
        </h3>
      )}

      {/* Description */}
      {isEditingDesc ? (
        <textarea
          value={localDesc}
          onChange={(e) => setLocalDesc(e.target.value)}
          onBlur={() => setIsEditingDesc(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.metaKey) setIsEditingDesc(false)
            if (e.key === 'Escape') {
              setLocalDesc(description)
              setIsEditingDesc(false)
            }
          }}
          className="w-full text-sm text-[#E6E9F2]/60 bg-white/10 border border-[#7AA2FF]/50 rounded px-2 py-1 focus:outline-none focus:border-[#7AA2FF] resize-none"
          rows={2}
          autoFocus
        />
      ) : (
        <p
          className="text-sm text-[#E6E9F2]/60 cursor-text hover:bg-white/5 rounded px-2 -mx-2 py-1 transition-colors"
          onClick={() => setIsEditingDesc(true)}
        >
          {localDesc || 'Descreva rapidamente a essência da sua ideia'}
        </p>
      )}
    </BaseCard>
  )
}
