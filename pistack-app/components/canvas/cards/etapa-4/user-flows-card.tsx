'use client'

import { GitBranch } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface UserFlowsCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function UserFlowsCard(props: UserFlowsCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Fluxos de Usuário"
      icon={GitBranch}
      stageColor="#FF6B6B"
      placeholder="Descreva os principais fluxos de navegação e interação do usuário na plataforma."
    />
  )
}
