'use client'

import { Network } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface ArchitectureCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function ArchitectureCard(props: ArchitectureCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Arquitetura"
      icon={Network}
      stageColor="#E879F9"
      placeholder="Descreva a arquitetura do sistema: microserviços, monolito, serverless, etc."
    />
  )
}
