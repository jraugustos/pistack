'use client'

import { Globe } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface ApiDesignCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function ApiDesignCard(props: ApiDesignCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Design de API"
      icon={Globe}
      stageColor="#E879F9"
      placeholder="Liste os principais endpoints da API, métodos HTTP e estrutura de dados."
    />
  )
}
