'use client'

import { Server } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface InfrastructureCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function InfrastructureCard(props: InfrastructureCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Infraestrutura"
      icon={Server}
      stageColor="#E879F9"
      placeholder="Defina hosting, CI/CD, monitoramento, logs e ferramentas de deploy."
    />
  )
}
