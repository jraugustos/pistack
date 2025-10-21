'use client'

import { Database } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface DatabaseCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function DatabaseCard(props: DatabaseCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Banco de Dados"
      icon={Database}
      stageColor="#E879F9"
      placeholder="Defina o modelo de dados, tabelas principais, relacionamentos e estratégia de persistência."
    />
  )
}
