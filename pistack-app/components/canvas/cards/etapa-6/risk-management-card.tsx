'use client'

import { AlertOctagon } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface RiskManagementCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function RiskManagementCard(props: RiskManagementCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Gestão de Riscos"
      icon={AlertOctagon}
      stageColor="#9B8AFB"
      placeholder="Identifique riscos potenciais e estratégias de mitigação para o projeto."
    />
  )
}
