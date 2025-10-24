/**
 * Mention Context Extraction
 * Extracts card mentions from text and prepares context for AI
 */

import type { CardRecord } from './types/card'
import { CARD_TITLES } from './card-constants'

export interface MentionReference {
  cardId: string
  cardType: string
  title: string
  mentionText: string // The actual @mention in the text
}

export interface ExtractedContext {
  originalMessage: string
  mentions: MentionReference[]
  contextCards: Array<{
    id: string
    type: string
    title: string
    content: Record<string, any>
  }>
  enrichedMessage: string // Message with mention metadata
}

/**
 * Extract @mentions from text
 * Returns array of mention patterns found
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@([a-zA-ZÀ-ÿ0-9\s\-]+?)(?=\s|$|[.,!?])/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[0]) // Include the @
  }

  return mentions
}

/**
 * Match mention text to actual cards
 */
export function matchMentionsToCards(
  mentionTexts: string[],
  allCards: CardRecord[]
): MentionReference[] {
  const references: MentionReference[] = []

  for (const mentionText of mentionTexts) {
    // Remove @ to get the title
    const titleQuery = mentionText.substring(1).trim().toLowerCase()

    // Find matching card
    const matchingCard = allCards.find(card => {
      const cardTitle = CARD_TITLES[card.card_type]?.toLowerCase() || ''
      return cardTitle === titleQuery || cardTitle.includes(titleQuery)
    })

    if (matchingCard) {
      references.push({
        cardId: matchingCard.id,
        cardType: matchingCard.card_type,
        title: CARD_TITLES[matchingCard.card_type] || matchingCard.card_type,
        mentionText,
      })
    }
  }

  return references
}

/**
 * Build context object for AI from mentioned cards
 */
export function buildMentionContext(
  message: string,
  cards: CardRecord[]
): ExtractedContext {
  // Extract mentions from message
  const mentionTexts = extractMentions(message)

  // Match to actual cards
  const mentions = matchMentionsToCards(mentionTexts, cards)

  // Build context cards with full content
  const contextCards = mentions.map(mention => {
    const card = cards.find(c => c.id === mention.cardId)
    return {
      id: mention.cardId,
      type: mention.cardType,
      title: mention.title,
      content: card?.content || {},
    }
  })

  // Build enriched message with metadata
  let enrichedMessage = message

  // Add context section if there are mentions
  if (contextCards.length > 0) {
    const contextSection = `\n\n---\n**Contexto dos Cards Mencionados:**\n\n${contextCards
      .map(
        card =>
          `**${card.title}** (${card.type}):\n${JSON.stringify(card.content, null, 2)}`
      )
      .join('\n\n')}\n---\n`

    enrichedMessage = message + contextSection
  }

  return {
    originalMessage: message,
    mentions,
    contextCards,
    enrichedMessage,
  }
}

/**
 * Format mention context for API payload
 */
export function formatContextForAPI(context: ExtractedContext) {
  return {
    message: context.originalMessage,
    mentions: context.mentions.map(m => ({
      cardId: m.cardId,
      cardType: m.cardType,
    })),
    contextCards: context.contextCards,
  }
}

/**
 * Check if text contains any mentions
 */
export function hasMentions(text: string): boolean {
  return /@[a-zA-ZÀ-ÿ0-9\s\-]+/.test(text)
}

/**
 * Get unique card IDs from mentions
 */
export function getUniqueMentionedCardIds(mentions: MentionReference[]): string[] {
  return Array.from(new Set(mentions.map(m => m.cardId)))
}
