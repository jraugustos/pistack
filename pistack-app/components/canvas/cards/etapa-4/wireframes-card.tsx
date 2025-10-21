'use client'

import { Layout } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface WireframesCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function WireframesCard(props: WireframesCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Wireframes"
      icon={Layout}
      stageColor="#FF6B6B"
      placeholder="Descreva ou anexe wireframes das principais telas do produto."
    />
  )
}
