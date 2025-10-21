'use client'

import { Eye } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface AccessibilityCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function AccessibilityCard(props: AccessibilityCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Acessibilidade"
      icon={Eye}
      stageColor="#FF6B6B"
      placeholder="Defina diretrizes de acessibilidade (WCAG, contraste, navegação por teclado, screen readers)."
    />
  )
}
