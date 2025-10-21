'use client'

import { List } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface EssentialFeaturesCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function EssentialFeaturesCard(props: EssentialFeaturesCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Features Essenciais"
      icon={List}
      stageColor="#FFC24B"
      placeholder="Liste as funcionalidades principais que devem estar no MVP. Priorize por importância e viabilidade."
    />
  )
}
