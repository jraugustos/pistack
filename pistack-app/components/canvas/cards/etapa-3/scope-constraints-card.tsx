'use client'

import { AlertTriangle } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface ScopeConstraintsCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function ScopeConstraintsCard(props: ScopeConstraintsCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Restrições de Escopo"
      icon={AlertTriangle}
      stageColor="#FFC24B"
      placeholder="Identifique limitações técnicas, de tempo, orçamento ou recursos que podem impactar o escopo."
    />
  )
}
