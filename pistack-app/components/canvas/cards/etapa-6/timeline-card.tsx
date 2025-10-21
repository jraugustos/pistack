'use client'

import { Clock } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface TimelineCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function TimelineCard(props: TimelineCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Cronograma"
      icon={Clock}
      stageColor="#9B8AFB"
      placeholder="Estabeleça prazos para cada fase do projeto e entregas principais."
    />
  )
}
