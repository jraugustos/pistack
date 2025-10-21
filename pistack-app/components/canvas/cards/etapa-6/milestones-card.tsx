'use client'

import { Flag } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface MilestonesCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function MilestonesCard(props: MilestonesCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Marcos do Projeto"
      icon={Flag}
      stageColor="#9B8AFB"
      placeholder="Defina os principais marcos e entregas intermediárias do projeto."
    />
  )
}
