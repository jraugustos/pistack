const STORAGE_VERSION = 1

export interface ChatMessageMetadata {
  referencedCard?: {
    id: string
    cardType: string
    cardTitle: string
  } | null
  mentionedCards?: Array<{
    id: string
    cardType: string
    cardTitle: string
  }>
}

interface StoredChatMessagePayload {
  v: number
  content: string
  data?: ChatMessageMetadata | null
}

type SerializableMessageContent = string | Record<string, any> | null

export function serializeChatMessage(
  content: string,
  metadata?: ChatMessageMetadata | null
): string {
  const payload: StoredChatMessagePayload = {
    v: STORAGE_VERSION,
    content,
    data: metadata ?? null,
  }

  try {
    return JSON.stringify(payload)
  } catch {
    return content
  }
}

export function deserializeChatMessage(
  rawContent: SerializableMessageContent
): { content: string; data?: ChatMessageMetadata | null } {
  if (typeof rawContent === 'string') {
    try {
      const parsed = JSON.parse(rawContent) as StoredChatMessagePayload
      if (parsed && typeof parsed === 'object' && typeof parsed.content === 'string') {
        return {
          content: parsed.content,
          data: parsed.data ?? null,
        }
      }
    } catch {
      // Not a JSON payload, fall back to plain text
    }

    return { content: rawContent }
  }

  if (rawContent && typeof rawContent === 'object' && 'content' in rawContent) {
    const contentValue = (rawContent as { content: unknown }).content
    return {
      content: typeof contentValue === 'string' ? contentValue : JSON.stringify(contentValue ?? ''),
      data: (rawContent as { data?: ChatMessageMetadata | null }).data ?? null,
    }
  }

  return { content: '', data: null }
}
