'use client'

import { Target } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface MvpDefinitionCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function MvpDefinitionCard(props: MvpDefinitionCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Definição do MVP"
      icon={Target}
      stageColor="#FFC24B"
      placeholder="Defina o escopo mínimo viável do seu produto. Quais são as funcionalidades essenciais para o lançamento?"
    />
  )
}
