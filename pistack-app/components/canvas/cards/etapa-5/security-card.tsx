'use client'

import { Shield } from 'lucide-react'
import { GenericTextCard } from '../generic-text-card'

interface SecurityCardProps {
  cardId: string
  content?: string
  onAiClick?: () => void
  onSave?: (content: { content: string }) => Promise<void>
}

export function SecurityCard(props: SecurityCardProps) {
  return (
    <GenericTextCard
      {...props}
      cardTitle="Segurança"
      icon={Shield}
      stageColor="#E879F9"
      placeholder="Defina autenticação, autorização, criptografia, proteção de dados e compliance."
    />
  )
}
