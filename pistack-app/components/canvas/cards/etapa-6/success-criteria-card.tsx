'use client'

import { CheckCircle } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface SuccessCriteriaCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function SuccessCriteriaCard(props: SuccessCriteriaCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Critérios de Sucesso"
      icon={CheckCircle}
      stageColor="#9B8AFB"
      placeholder="Estabeleça métricas e KPIs para avaliar o sucesso do projeto."
    />
  )
}
