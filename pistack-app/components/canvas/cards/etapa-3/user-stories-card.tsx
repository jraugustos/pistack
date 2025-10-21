'use client'

import { BookOpen } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface UserStoriesCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function UserStoriesCard(props: UserStoriesCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="User Stories"
      icon={BookOpen}
      stageColor="#FFC24B"
      placeholder="Descreva histórias de usuário no formato: Como [persona], eu quero [ação] para [benefício]."
    />
  )
}
