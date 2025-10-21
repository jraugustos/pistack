'use client'

import { CheckSquare } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface AcceptanceCriteriaCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function AcceptanceCriteriaCard(props: AcceptanceCriteriaCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Critérios de Aceitação"
      icon={CheckSquare}
      stageColor="#FFC24B"
      placeholder="Defina os critérios que determinam quando uma funcionalidade está pronta e atende aos requisitos."
    />
  )
}
