'use client'

import { Box } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface ComponentsCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function ComponentsCard(props: ComponentsCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Componentes"
      icon={Box}
      stageColor="#FF6B6B"
      placeholder="Liste os componentes reutilizáveis que serão criados (botões, cards, formulários, etc)."
    />
  )
}
