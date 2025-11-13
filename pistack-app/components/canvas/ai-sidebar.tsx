'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react'
import { createPortal } from 'react-dom'
import { useChat, type Message as AIMessage } from 'ai/react'
import { Sparkles, Send, X, Trash2 } from 'lucide-react'
import { CardReferenceBadge } from './card-reference-badge'
import { MessageContent } from './message-content'
import { QuickSuggestionsCarousel } from './quick-suggestions-carousel'
import { ChatMessageBadges } from './chat-message-badges'
import { MentionDropdown } from '@/components/mentions'
import { useMentions } from '@/hooks/use-mentions'
import { useMentionTracking } from '@/hooks/use-mention-tracking'
import { buildMentionContext } from '@/lib/mention-context'
import type { ChatMessageMetadata } from '@/lib/chat/messages'
import type { CardRecord } from '@/lib/types/card'
import {
  CARD_TITLES,
  STAGE_COLORS,
  STAGE_NAMES,
  CARD_TO_STAGE,
  CONTEXTUAL_SUGGESTIONS,
  DEFAULT_SUGGESTIONS,
} from './ai-suggestions'

interface ReferencedCard {
  id: string
  card_type: string
  content: Record<string, any>
}

interface AiSidebarProps {
  projectId: string
  activeStage: number
  isOpen: boolean
  onToggle: () => void
  allCards?: CardRecord[]
}

const mapHistoryMessages = (rawMessages: any[] = []): AIMessage[] =>
  rawMessages.map((message) => ({
    id: message.id || crypto.randomUUID(),
    role: message.role,
    content: message.content,
    data: message.data ?? null,
  }))

function stageColorByNumber(stageNumber: number) {
  return STAGE_COLORS[stageNumber] || '#7AA2FF'
}

export function AiSidebar({
  projectId,
  activeStage,
  isOpen,
  onToggle,
  allCards = [],
}: AiSidebarProps) {
  const [initialMessages, setInitialMessages] = useState<AIMessage[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [historyKey, setHistoryKey] = useState(0)

  const loadHistory = useCallback(async () => {
    setIsHistoryLoading(true)
    setHistoryError(null)
    try {
      const params = new URLSearchParams({
        projectId,
        stage: String(activeStage),
      })
      const response = await fetch(`/api/ai/history?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Não foi possível carregar o histórico.')
      }
      const data = await response.json()
      setInitialMessages(mapHistoryMessages(data.messages ?? []))
      setHistoryKey((prev) => prev + 1)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o histórico.'
      setHistoryError(message)
      setInitialMessages([])
      setHistoryKey((prev) => prev + 1)
    } finally {
      setIsHistoryLoading(false)
    }
  }, [activeStage, projectId])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  return (
    <ChatPanel
      key={`${projectId}-${activeStage}-${historyKey}`}
      projectId={projectId}
      activeStage={activeStage}
      isOpen={isOpen}
      onToggle={onToggle}
      allCards={allCards}
      initialMessages={initialMessages}
      isHistoryLoading={isHistoryLoading}
      historyError={historyError}
      onRetryHistory={loadHistory}
    />
  )
}

interface ChatPanelProps extends AiSidebarProps {
  initialMessages: AIMessage[]
  isHistoryLoading: boolean
  historyError: string | null
  onRetryHistory: () => void
}

function ChatPanel({
  projectId,
  activeStage,
  isOpen,
  onToggle,
  allCards = [],
  initialMessages,
  isHistoryLoading,
  historyError,
  onRetryHistory,
}: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [referencedCard, setReferencedCard] = useState<ReferencedCard | null>(
    null
  )
  const [isMounted, setIsMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const stageColor = stageColorByNumber(activeStage)
  const quickSuggestions =
    CONTEXTUAL_SUGGESTIONS[activeStage] ?? DEFAULT_SUGGESTIONS

  const {
    messages,
    append,
    isLoading: isChatLoading,
    setMessages,
  } = useChat({
    api: '/api/ai/chat',
    body: {
      projectId,
      stageNumber: activeStage,
    },
    initialMessages,
  })

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages, setMessages])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const {
    mentionedCards,
    addMention,
    clearMentions,
  } = useMentionTracking()

  const handleMentionInsert = useCallback(
    (cardId: string, cardType: string) => {
      const card = allCards.find((card) => card.id === cardId)
      if (!card) return
      const title = CARD_TITLES[card.card_type] || card.card_type
      addMention(cardId, cardType, title)
    },
    [addMention, allCards]
  )

  const {
    isActive: isMentionActive,
    suggestions: mentionSuggestions,
    selectedIndex: mentionSelectedIndex,
    position: mentionPosition,
    handleInputChange: handleMentionInputChange,
    handleKeyDown: handleMentionKeyDown,
    handleSelect: handleMentionSelect,
    closeMention,
    textareaRef,
  } = useMentions({
    cards: allCards,
    enabled: true,
    onMentionInsert: handleMentionInsert,
    onTextUpdate: setInput,
  })

  const handleInputChangeWithMentions = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInput(event.target.value)
    handleMentionInputChange(event)
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isMentionActive) {
      handleMentionKeyDown(event)
      if (event.defaultPrevented) return
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const notifyCardProcessing = useCallback((card: ReferencedCard) => {
    window.dispatchEvent(
      new CustomEvent('pistack:ai:card-processing', {
        detail: {
          cardId: card.id,
          cardType: card.card_type,
          content: card.content ?? {},
        },
      })
    )
  }, [])

  const buildUserMessagePayload = useCallback(
    (rawInput: string, cardContext: ReferencedCard | null) => {
      const mentionContext = buildMentionContext(rawInput, allCards)
      let finalMessage = mentionContext.enrichedMessage

      if (cardContext) {
        const contextBlocks = [
          `Card em foco: ${
            CARD_TITLES[cardContext.card_type] || cardContext.card_type
          }`,
          `Card ID: ${cardContext.id}`,
          'Instrução: se for atualizar este card, utilize a função update_card com o card_id acima e envie o objeto content completo.',
          JSON.stringify(cardContext.content ?? {}),
        ]
        finalMessage = `${contextBlocks.join('\n')}\n\nPergunta: ${finalMessage}`
      }

      const metadata: ChatMessageMetadata = {
        referencedCard: cardContext
          ? {
              id: cardContext.id,
              cardType: cardContext.card_type,
              cardTitle: CARD_TITLES[cardContext.card_type] || cardContext.card_type,
            }
          : null,
        mentionedCards: mentionContext.mentions.map((mention) => ({
          id: mention.cardId,
          cardType: mention.cardType,
          cardTitle: mention.title,
        })),
      }

      const hasMetadata =
        Boolean(metadata.referencedCard) ||
        Boolean(metadata.mentionedCards && metadata.mentionedCards.length > 0)

      return {
        finalMessage,
        metadata: hasMetadata ? metadata : null,
      }
    },
    [allCards]
  )

  const handleSend = useCallback(
    async (options?: { message?: string; card?: ReferencedCard | null }) => {
      const rawMessage =
        typeof options?.message === 'string' ? options.message : input

      if (!rawMessage.trim() || isChatLoading) {
        return
      }

      const cardContext = options?.card ?? referencedCard
      const { finalMessage, metadata } = buildUserMessagePayload(
        rawMessage,
        cardContext
      )

      if (cardContext) {
        notifyCardProcessing(cardContext)
      }

      try {
        await append(
          {
            id: crypto.randomUUID(),
            role: 'user',
            content: finalMessage,
            data: metadata ?? undefined,
          },
          {
            body: {
              projectId,
              stageNumber: activeStage,
              contextCard: cardContext
                ? {
                    id: cardContext.id,
                    cardType: cardContext.card_type,
                    content: cardContext.content ?? {},
                  }
                : null,
            },
          }
        )
        setInput('')
      } finally {
        clearMentions()
      }
    },
    [
      activeStage,
      append,
      buildUserMessagePayload,
      clearMentions,
      input,
      isChatLoading,
      notifyCardProcessing,
      projectId,
      referencedCard,
    ]
  )

  const handleSendWithContext = useCallback(
    async (
      card: ReferencedCard,
      prompt?: string,
      options?: { autoSend?: boolean }
    ) => {
      setReferencedCard(card)
      setInput('')

      if (options?.autoSend === false) {
        return
      }

      const cardTitle = CARD_TITLES[card.card_type] || card.card_type
      const stageName =
        STAGE_NAMES[CARD_TO_STAGE[card.card_type]] || `Etapa ${activeStage}`
      const defaultPrompt = [
        `Preciso de ajuda para trabalhar no card "${cardTitle}" (${stageName}).`,
        'Analise o contexto atual e traga sugestões objetivas, dados práticos e próximos passos claros para completar este card.',
      ].join(' ')

      const resolvedPrompt =
        (prompt && prompt.trim().length > 0 ? prompt : defaultPrompt) ?? defaultPrompt

      await handleSend({
        message: resolvedPrompt,
        card,
      })
    },
    [activeStage, handleSend]
  )

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{
        card: ReferencedCard
        stageNumber: number
        projectId: string
        prompt?: string
        autoSend?: boolean
      }>).detail

      if (!detail) return
      if (detail.stageNumber !== activeStage) return
      if (detail.projectId !== projectId) return

      handleSendWithContext(detail.card, detail.prompt, {
        autoSend: detail.autoSend ?? true,
      })
    }

    window.addEventListener('pistack:ai:reference-card', handler as EventListener)
    return () => {
      window.removeEventListener(
        'pistack:ai:reference-card',
        handler as EventListener
      )
    }
  }, [activeStage, handleSendWithContext, projectId])

  const handleQuickSuggestion = useCallback(
    async (suggestion: string) => {
      await handleSend({ message: suggestion })
    },
    [handleSend]
  )

  const handleClearChat = useCallback(async () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja limpar todo o histórico desta etapa?'
    )
    if (!confirmed) return

    try {
      const response = await fetch(
        `/api/ai/history?projectId=${projectId}&stage=${activeStage}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Erro ao limpar histórico.')
      }

      setMessages([])
      clearMentions()
      setReferencedCard(null)
    } catch (error) {
      console.error('Error clearing chat:', error)
      alert('Erro ao limpar chat. Por favor, tente novamente.')
    }
  }, [activeStage, clearMentions, projectId, setMessages])

  const activeSuggestions = useMemo(() => {
    if (referencedCard) {
      const stage = CARD_TO_STAGE[referencedCard.card_type]
      return CONTEXTUAL_SUGGESTIONS[stage] ?? quickSuggestions
    }
    return quickSuggestions
  }, [quickSuggestions, referencedCard])

  const suggestionsVisible =
    !isHistoryLoading && messages.length === 0 && activeSuggestions.length > 0

  return (
    <aside className="w-96 border-l border-white/5 bg-[#0F1115] flex flex-col">
      <header className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7AA2FF]/20 to-[#5AD19A]/20 border border-[#7AA2FF]/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#7AA2FF]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Copiloto do Projeto</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              disabled={messages.length === 0 || isChatLoading}
              className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors disabled:opacity-30"
              aria-label="Limpar chat"
            >
              <Trash2 className="w-4 h-4 text-[#E6E9F2]/60 hover:text-red-400" />
            </button>
            <button
              onClick={onToggle}
              className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              aria-label="Fechar Copiloto"
            >
              <X className="w-4 h-4 text-[#E6E9F2]/60" />
            </button>
          </div>
        </div>

        {referencedCard && (
          <CardReferenceBadge
            cardType={referencedCard.card_type}
            cardTitle={
              CARD_TITLES[referencedCard.card_type] || referencedCard.card_type
            }
            stageName={
              STAGE_NAMES[CARD_TO_STAGE[referencedCard.card_type]] ||
              `Etapa ${activeStage}`
            }
            stageColor={stageColor}
            onRemove={() => setReferencedCard(null)}
          />
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {historyError ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 space-y-3">
            <div className="w-14 h-14 rounded-xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 flex items-center justify-center">
              <X className="w-6 h-6 text-[#FF6B6B]" />
            </div>
            <p className="text-xs text-[#FF9090] leading-relaxed">
              {historyError}
            </p>
            <button
              type="button"
              onClick={onRetryHistory}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/10 text-[#E6E9F2]/80 hover:bg-white/5 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : isHistoryLoading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7AA2FF]/10 to-[#5AD19A]/10 border border-[#7AA2FF]/20 flex items-center justify-center mb-4 animate-pulse">
              <Sparkles className="w-7 h-7 text-[#7AA2FF]" />
            </div>
            <p className="text-xs text-[#E6E9F2]/60 leading-relaxed">
              Carregando histórico da Etapa {activeStage}...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#7AA2FF]/10 to-[#5AD19A]/10 border border-[#7AA2FF]/20 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-[#7AA2FF]" />
            </div>
            <h4 className="font-semibold text-sm mb-2">Como posso ajudar?</h4>
            <p className="text-xs text-[#E6E9F2]/60 leading-relaxed">
              Estou aqui para te ajudar a estruturar sua ideia. Pergunte
              qualquer coisa sobre a Etapa {activeStage}!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const metadata =
              message.data && typeof message.data === 'object'
                ? (message.data as ChatMessageMetadata)
                : null

            return (
              <div key={message.id} className="flex flex-col gap-1">
                <div className="flex gap-3">
                  {message.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-[#7AA2FF]/10 border border-[#7AA2FF]/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-[#7AA2FF]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div
                      className={`rounded-lg p-3 text-sm leading-relaxed ${
                        message.role === 'assistant'
                          ? 'bg-white/5'
                          : 'bg-[#7AA2FF]/10 ml-auto'
                      }`}
                    >
                      <MessageContent
                        content={message.content}
                        isAssistant={message.role === 'assistant'}
                      />
                    </div>
                  </div>
                </div>
                <ChatMessageBadges
                  metadata={metadata}
                  align={message.role === 'assistant' ? 'left' : 'right'}
                />
              </div>
            )
          })
        )}

        {!isHistoryLoading && isChatLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#7AA2FF]/10 border border-[#7AA2FF]/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#7AA2FF]" />
            </div>
            <div className="flex-1">
              <div className="bg-white/5 rounded-lg p-3 text-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#7AA2FF] animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-[#7AA2FF] animate-pulse delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-[#7AA2FF] animate-pulse delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {suggestionsVisible && (
        <QuickSuggestionsCarousel
          suggestions={activeSuggestions}
          onSelect={handleQuickSuggestion}
          stageColor={stageColor}
          isLoading={isChatLoading}
        />
      )}

      <div className="p-4 border-t border-white/5">
        <div className="relative">
          <textarea
            value={input}
            onChange={handleInputChangeWithMentions}
            onKeyDown={handleKeyPress}
            disabled={isChatLoading}
            placeholder="Pergunte algo ou peça ajuda... (use @ para mencionar cards)"
            className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/50 transition-colors disabled:opacity-50 resize-none"
            rows={2}
            ref={textareaRef}
          />

          {isMounted &&
            isMentionActive &&
            createPortal(
              <MentionDropdown
                suggestions={mentionSuggestions}
                position={mentionPosition}
                selectedIndex={mentionSelectedIndex}
                onSelect={handleMentionSelect}
                onClose={closeMention}
              />,
              document.body
            )}

          <button
            onClick={handleSend}
            disabled={isChatLoading || !input.trim()}
            className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center bg-[#7AA2FF] hover:bg-[#6690E8] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Enviar mensagem"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-2 text-xs text-[#E6E9F2]/40">
          <span>
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px]">@</kbd>{' '}
            mencionar card
          </span>
          <span>•</span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px]">Cmd</kbd>
            <span> + </span>
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px]">K</kbd>{' '}
            comandos
          </span>
        </div>
      </div>
    </aside>
  )
}
