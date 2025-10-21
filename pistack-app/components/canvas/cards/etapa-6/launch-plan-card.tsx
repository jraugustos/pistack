'use client'

import { Rocket } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface LaunchPlanCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function LaunchPlanCard(props: LaunchPlanCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Plano de Lançamento"
      icon={Rocket}
      stageColor="#9B8AFB"
      placeholder="Defina a estratégia de lançamento, comunicação e onboarding de usuários."
    />
  )
}
