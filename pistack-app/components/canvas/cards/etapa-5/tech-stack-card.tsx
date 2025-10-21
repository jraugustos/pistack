'use client'

import { Code } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface TechStackCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function TechStackCard(props: TechStackCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Tech Stack"
      icon={Code}
      stageColor="#E879F9"
      placeholder="Defina as tecnologias: frontend, backend, banco de dados, ferramentas, etc."
    />
  )
}
