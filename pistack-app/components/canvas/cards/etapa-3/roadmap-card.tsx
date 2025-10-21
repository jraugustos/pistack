'use client'

import { Map } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface RoadmapCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function RoadmapCard(props: RoadmapCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Roadmap"
      icon={Map}
      stageColor="#FFC24B"
      placeholder="Esboce o roadmap de desenvolvimento: o que será implementado em cada fase/sprint?"
    />
  )
}
