'use client'

import { memo } from 'react'
import {
  CARD_TO_STAGE,
  STAGE_COLORS,
  STAGE_NAMES,
} from './ai-suggestions'
import type { ChatMessageMetadata } from '@/lib/chat/messages'

interface ChatMessageBadgesProps {
  metadata?: ChatMessageMetadata | null
  align?: 'left' | 'right'
}

function getStageInfo(cardType: string) {
  const stageNumber = CARD_TO_STAGE[cardType]
  return {
    stageNumber,
    stageName: stageNumber ? STAGE_NAMES[stageNumber] : null,
    stageColor: stageNumber ? STAGE_COLORS[stageNumber] : '#7AA2FF',
  }
}

export const ChatMessageBadges = memo(function ChatMessageBadges({
  metadata,
  align = 'left',
}: ChatMessageBadgesProps) {
  if (!metadata) {
    return null
  }

  const badges: Array<{
    id: string
    cardType: string
    cardTitle: string
    label: string
  }> = []

  if (metadata.referencedCard) {
    badges.push({
      id: metadata.referencedCard.id,
      cardType: metadata.referencedCard.cardType,
      cardTitle: metadata.referencedCard.cardTitle,
      label: 'Contexto',
    })
  }

  if (metadata.mentionedCards?.length) {
    metadata.mentionedCards.forEach((card) => {
      badges.push({
        id: `${card.id}-mention`,
        cardType: card.cardType,
        cardTitle: card.cardTitle,
        label: 'Citado',
      })
    })
  }

  if (badges.length === 0) {
    return null
  }

  return (
    <div
      className={`mt-2 flex flex-wrap gap-2 text-[11px] ${
        align === 'right' ? 'justify-end' : 'justify-start'
      }`}
    >
      {badges.map((badge) => {
        const { stageColor, stageName } = getStageInfo(badge.cardType)
        return (
          <div
            key={`${badge.id}-${badge.label}`}
            className="px-2 py-1 rounded-full border flex items-center gap-1 bg-white/5 text-[#E6E9F2]/80"
            style={{
              borderColor: `${stageColor}40`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: stageColor }}
            />
            <span className="uppercase tracking-wide text-[10px] text-[#E6E9F2]/50">
              {badge.label}
            </span>
            <span className="font-medium">{badge.cardTitle}</span>
            {stageName && (
              <span className="text-[#E6E9F2]/40">({stageName})</span>
            )}
          </div>
        )
      })}
    </div>
  )
})
