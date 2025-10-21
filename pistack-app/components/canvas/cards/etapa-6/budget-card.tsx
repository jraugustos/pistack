'use client'

import { DollarSign } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface BudgetCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function BudgetCard(props: BudgetCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Orçamento"
      icon={DollarSign}
      stageColor="#9B8AFB"
      placeholder="Estime custos com infraestrutura, equipe, ferramentas e outros recursos."
    />
  )
}
