/**
 * Card type definitions
 * Centralized type definitions for cards
 */

export interface CardRecord {
  id: string
  stage_id: string
  card_type: string
  content: Record<string, any>
  position: number
  created_at: string
  updated_at: string
}

export type CompletionStatus = 'empty' | 'partial' | 'complete'

/**
 * Calculate completion status of a card based on its content
 */
export function calculateCompletionStatus(card: CardRecord): CompletionStatus {
  if (!card.content || Object.keys(card.content).length === 0) {
    return 'empty'
  }

  const values = Object.values(card.content)
  const hasContent = values.some(val => {
    if (typeof val === 'string') return val.trim().length > 0
    if (Array.isArray(val)) return val.length > 0
    if (typeof val === 'object' && val !== null) {
      return Object.values(val).some(v => v && String(v).trim().length > 0)
    }
    return Boolean(val)
  })

  if (!hasContent) {
    return 'empty'
  }

  // Check if all fields are filled
  const allFilled = values.every(val => {
    if (typeof val === 'string') return val.trim().length > 0
    if (Array.isArray(val)) return val.length > 0
    if (typeof val === 'object' && val !== null) {
      return Object.values(val).some(v => v && String(v).trim().length > 0)
    }
    return Boolean(val)
  })

  return allFilled ? 'complete' : 'partial'
}

/**
 * Get human-readable time since last update
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'agora mesmo'
  if (diffMins < 60) return `${diffMins}min atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays === 1) return 'ontem'
  if (diffDays < 7) return `${diffDays}d atrás`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem atrás`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}m atrás`
  return `${Math.floor(diffDays / 365)}a atrás`
}
