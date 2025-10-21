'use client'

import { Users } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface ResourcesCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function ResourcesCard(props: ResourcesCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Recursos"
      icon={Users}
      stageColor="#9B8AFB"
      placeholder="Liste a equipe necessária, papéis e ferramentas essenciais para o desenvolvimento."
    />
  )
}
