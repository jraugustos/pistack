'use client'

import { Calendar } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface SprintPlanningCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function SprintPlanningCard(props: SprintPlanningCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Planejamento de Sprints"
      icon={Calendar}
      stageColor="#9B8AFB"
      placeholder="Defina a duração das sprints, cerimônias ágeis e organização do backlog."
    />
  )
}
