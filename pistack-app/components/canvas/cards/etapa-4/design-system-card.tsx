'use client'

import { Palette } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface DesignSystemCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function DesignSystemCard(props: DesignSystemCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Design System"
      icon={Palette}
      stageColor="#FF6B6B"
      placeholder="Defina cores, tipografia, espaçamentos e outros elementos do design system."
    />
  )
}
