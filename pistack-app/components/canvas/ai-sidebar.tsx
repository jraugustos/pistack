'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, Send, X, Trash2 } from 'lucide-react'
import { CardReferenceBadge } from './card-reference-badge'
import { MessageContent } from './message-content'
import { QuickSuggestionsCarousel } from './quick-suggestions-carousel'
import { MentionDropdown } from '@/components/mentions'
import { useMentions } from '@/hooks/use-mentions'
import { useMentionTracking } from '@/hooks/use-mention-tracking'
import { buildMentionContext } from '@/lib/mention-context'
import type { CardRecord } from '@/lib/types/card'
import {
  CARD_TITLES,
  STAGE_COLORS,
  STAGE_NAMES,
  CARD_TO_STAGE,
  CONTEXTUAL_SUGGESTIONS,
  DEFAULT_SUGGESTIONS
} from './ai-suggestions'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  referencedCard?: {
    cardType: string
    cardTitle: string
  }
}

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
  allCards?: CardRecord[] // For @ mentions autocomplete
}

const formatValue = (value: unknown, indent = 0): string => {
  const prefix = `${'  '.repeat(indent)}- `

  if (value === null || value === undefined) {
    return `${prefix}(vazio)`
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return `${prefix}${value}`
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${prefix}(sem itens)`
    }
    return value
      .map((item) => formatValue(item, indent + 1))
      .join('\n')
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) {
      return `${prefix}(sem detalhes)`
    }

    return entries
      .map(([key, nestedValue]) => {
        const header = `${'  '.repeat(indent)}- ${key}:`
        const formattedNested =
          typeof nestedValue === 'object' && nestedValue !== null
            ? `\n${formatValue(nestedValue, indent + 1)}`
            : ` ${nestedValue ?? '(vazio)'}`
        return `${header}${formattedNested}`
      })
      .join('\n')
  }

  return `${prefix}${String(value)}`
}

// Mapeamento simplificado de schemas (apenas cards com arrays críticos)
const CARD_SCHEMAS: Record<string, string> = {
  'problem': 'painPoints: string[]',
  'solution': 'differentiators: string[]',
  'initial-kpis': 'kpis: {name, target}[]',
  'validation-hypotheses': 'hypotheses: {label, category, statement, successMetric}[]',
  'primary-persona': 'goals[], frustrations[], behaviors[]',
  'benchmarking': 'competitors: object[]',
  'user-stories': 'stories: object[]',
}

const formatCardReference = (cardType: string, cardId: string, content: Record<string, unknown>) => {
  const cardName = cardType
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const formattedContent =
    content && Object.keys(content).length > 0
      ? formatValue(content)
      : '- (card vazio)'

  const schemaInfo = CARD_SCHEMAS[cardType]

  return [
    `📋 Card: ${cardName} (ID: ${cardId})`,
    '',
    'Conteúdo atual:',
    formattedContent,
    schemaInfo ? `\n⚠️ Arrays esperados: ${schemaInfo}` : '',
    '',
    '⚠️ IMPORTANTE: Arrays devem ser JSON válido, não strings com \\n',
  ].join('\n')
}

export function AiSidebar({ projectId, activeStage, isOpen, onToggle, allCards = [] }: AiSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [referencedCard, setReferencedCard] = useState<ReferencedCard | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Only render portal on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Mentions functionality
  const {
    mentionedCards,
    addMention,
    clearMentions,
    getMentionedCardIds,
  } = useMentionTracking()

  const handleMentionInsert = useCallback((cardId: string, cardType: string) => {
    const card = allCards.find(c => c.id === cardId)
    if (card) {
      const title = CARD_TITLES[card.card_type] || card.card_type
      addMention(cardId, cardType, title)
    }
  }, [allCards, addMention])

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
  })

  const summarizeFunctionCall = (call: { call?: string; result?: any }) => {
    if (!call) return ''

    const name = call.call || 'função'
    const result = call.result

    if (result?.error) {
      return `⚠️ ${name}: ${result.error}`
    }

    if (typeof result?.message === 'string') {
      return `⚙️ ${name}: ${result.message}`
    }

    if (result?.success === true && result?.card_type) {
      return `⚙️ ${name}: card "${result.card_type}" atualizado com sucesso.`
    }

    if (result?.success === true) {
      return `⚙️ ${name}: ação concluída com sucesso.`
    }

    if (typeof result === 'string') {
      return `⚙️ ${name}: ${result}`
    }

    return `⚙️ ${name}: ação processada.`
  }

  useEffect(() => {
    let isMounted = true

    const loadHistory = async () => {
      setIsHistoryLoading(true)
      setMessages([])
      setThreadId(null)

      try {
        const params = new URLSearchParams({
          projectId,
          stage: String(activeStage),
        })

        const response = await fetch(`/api/ai/history?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to load AI history')
        }

        const data = await response.json()

        if (!isMounted) return

        const historyMessages: Message[] =
          data.messages?.map((message: any) => ({
            id: message.id || crypto.randomUUID(),
            role: message.role,
            content: message.content,
            timestamp: message.createdAt
              ? new Date(message.createdAt)
              : new Date(),
          })) ?? []

        setMessages(historyMessages)
        setThreadId(data.threadId || null)
      } catch (error) {
        console.error('Error loading AI history:', error)
        if (isMounted) {
          setMessages([])
          setThreadId(null)
        }
      } finally {
        if (isMounted) {
          setIsHistoryLoading(false)
        }
      }
    }

    loadHistory()

    return () => {
      isMounted = false
    }
  }, [projectId, activeStage])

  // Handle ESC key to close sidebar
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onToggle()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onToggle])

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{
        card: { id: string; card_type: string; content: Record<string, any> }
        stageNumber: number
        projectId: string
      }>).detail

      if (!detail) return
      if (detail.stageNumber !== activeStage) return
      if (detail.projectId && detail.projectId !== projectId) return

      // Define o card referenciado
      setReferencedCard(detail.card)

      // Envia mensagem automaticamente
      handleSendWithContext(detail.card)
    }

    window.addEventListener('pistack:ai:reference-card', handler as EventListener)
    return () => {
      window.removeEventListener('pistack:ai:reference-card', handler as EventListener)
    }
  }, [activeStage, projectId])

  // Scroll automático para o fim das mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendWithContext = async (card: ReferencedCard) => {
    if (isLoading || isHistoryLoading) return

    const cardTitle = CARD_TITLES[card.card_type] || card.card_type
    const contextMessage = formatCardReference(card.card_type, card.id, card.content ?? {})

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: `Me ajude com este card: ${cardTitle}`,
      timestamp: new Date(),
      referencedCard: {
        cardType: card.card_type,
        cardTitle: cardTitle,
      },
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: contextMessage,
          projectId,
          activeStage,
          threadId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      if (data.threadId) {
        setThreadId(data.threadId)
      }

      const functionSummaries: string[] = Array.isArray(data.functionCalls)
        ? data.functionCalls
            .map((call: { call?: string; result?: any }) =>
              summarizeFunctionCall(call)
            )
            .filter(Boolean)
        : []

      let assistantContent =
        typeof data.response === 'string' ? data.response.trim() : ''

      if (functionSummaries.length > 0) {
        const summaryText = functionSummaries.join('\n')
        assistantContent = assistantContent
          ? `${assistantContent}\n\n${summaryText}`
          : summaryText
      }

      if (!assistantContent) {
        assistantContent =
          'Ação registrada. Verifique os cards para ver as atualizações.'
      }

      const hasCardMutation =
        Array.isArray(data.functionCalls) &&
        data.functionCalls.some(
          (call: { call?: string; result?: any }) =>
            call?.result?.success === true &&
            (call.call === 'create_card' || call.call === 'update_card')
        )

      if (hasCardMutation) {
        window.dispatchEvent(
          new CustomEvent('pistack:cards:refresh', {
            detail: {
              projectId,
              stageNumber: activeStage,
            },
          })
        )
      }

      const assistantMessage: Message = {
        id: data.messageId || crypto.randomUUID(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading || isHistoryLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      ...(referencedCard && {
        referencedCard: {
          cardType: referencedCard.card_type,
          cardTitle: CARD_TITLES[referencedCard.card_type] || referencedCard.card_type,
        },
      }),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageToSend = input
    setInput('')
    setIsLoading(true)

    // Close mention dropdown if open
    if (isMentionActive) {
      closeMention()
    }

    try {
      // Build context from mentions
      const mentionContext = buildMentionContext(messageToSend, allCards)

      // Se houver card referenciado, inclui o contexto na mensagem
      let finalMessage = mentionContext.enrichedMessage
      if (referencedCard) {
        const contextMessage = formatCardReference(
          referencedCard.card_type,
          referencedCard.id,
          referencedCard.content ?? {}
        )
        finalMessage = `${contextMessage}\n\nPergunta do usuário: ${finalMessage}`
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: finalMessage,
          projectId,
          activeStage,
          threadId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      // Update thread ID if this was first message
      if (data.threadId) {
        setThreadId(data.threadId)
      }

      const functionSummaries: string[] = Array.isArray(data.functionCalls)
        ? data.functionCalls
            .map((call: { call?: string; result?: any }) =>
              summarizeFunctionCall(call)
            )
            .filter(Boolean)
        : []

      let assistantContent =
        typeof data.response === 'string' ? data.response.trim() : ''

      if (functionSummaries.length > 0) {
        const summaryText = functionSummaries.join('\n')
        assistantContent = assistantContent
          ? `${assistantContent}\n\n${summaryText}`
          : summaryText
      }

      if (!assistantContent) {
        assistantContent =
          'Ação registrada. Verifique os cards para ver as atualizações.'
      }

      const hasCardMutation =
        Array.isArray(data.functionCalls) &&
        data.functionCalls.some(
          (call: { call?: string; result?: any }) =>
            call?.result?.success === true &&
            (call.call === 'create_card' || call.call === 'update_card')
        )

      if (hasCardMutation) {
        window.dispatchEvent(
          new CustomEvent('pistack:cards:refresh', {
            detail: {
              projectId,
              stageNumber: activeStage,
            },
          })
        )
      }

      const assistantMessage: Message = {
        id: data.messageId || crypto.randomUUID(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // First, check if mention dropdown is active
    if (isMentionActive) {
      handleMentionKeyDown(e)
      // If key was handled by mention system, don't proceed
      if (e.defaultPrevented) return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Combined input change handler
  const handleInputChangeWithMentions = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    handleMentionInputChange(e)
  }

  const handleClearChat = async () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja limpar todo o histórico de chat desta etapa? Esta ação não pode ser desfeita.'
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `/api/ai/history?projectId=${projectId}&stage=${activeStage}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to clear chat')
      }

      // Clear frontend state
      setMessages([])
      setReferencedCard(null)
      setInput('')
    } catch (error) {
      console.error('Error clearing chat:', error)
      alert('Erro ao limpar chat. Por favor, tente novamente.')
    }
  }

  const stageColor = STAGE_COLORS[activeStage] || '#7AA2FF'
  const suggestions = referencedCard
    ? CONTEXTUAL_SUGGESTIONS[referencedCard.card_type] || DEFAULT_SUGGESTIONS
    : DEFAULT_SUGGESTIONS

  const handleQuickSuggestion = (suggestionText: string) => {
    setInput(suggestionText)
    textareaRef.current?.focus()
  }

  // Collapsed state
  if (!isOpen) {
    return (
      <aside className="w-14 border-l border-white/5 bg-[#0F1115] flex flex-col items-center py-4 transition-all duration-300">
        <button
          onClick={onToggle}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7AA2FF]/20 to-[#5AD19A]/20 border border-[#7AA2FF]/30 flex items-center justify-center hover:from-[#7AA2FF]/30 hover:to-[#5AD19A]/30 transition-all"
          aria-label="Abrir Copiloto do Projeto"
          title="Abrir Copiloto (clique no ✨ em qualquer card)"
        >
          <Sparkles className="w-5 h-5 text-[#7AA2FF]" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-96 border-l border-white/5 bg-[#0F1115] flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
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
              disabled={messages.length === 0 || isLoading}
              className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Limpar chat"
              title="Limpar histórico de chat"
            >
              <Trash2 className="w-4 h-4 text-[#E6E9F2]/60 hover:text-red-400" />
            </button>
            <button
              onClick={onToggle}
              className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              aria-label="Fechar Copiloto"
              title="Fechar (ESC)"
            >
              <X className="w-4 h-4 text-[#E6E9F2]/60" />
            </button>
          </div>
        </div>

        {/* Referenced Card Badge */}
        {referencedCard && (
          <CardReferenceBadge
            cardType={referencedCard.card_type}
            cardTitle={CARD_TITLES[referencedCard.card_type] || referencedCard.card_type}
            stageName={STAGE_NAMES[CARD_TO_STAGE[referencedCard.card_type]] || `Etapa ${activeStage}`}
            stageColor={stageColor}
            onRemove={() => setReferencedCard(null)}
          />
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isHistoryLoading ? (
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
          messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              {message.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-[#7AA2FF]/10 border border-[#7AA2FF]/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#7AA2FF]" />
                </div>
              )}
              <div className="flex-1">
                {/* Referenced Card Badge in Message */}
                {message.role === 'user' && message.referencedCard && (
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-[#E6E9F2]/50">
                    <span>📎</span>
                    <span>{message.referencedCard.cardTitle}</span>
                  </div>
                )}
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
          ))
        )}

        {!isHistoryLoading && isLoading && (
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

      {/* Quick Suggestions Carousel - Show BEFORE first message */}
      {!isHistoryLoading && messages.length === 0 && suggestions.length > 0 && (
        <QuickSuggestionsCarousel
          suggestions={suggestions}
          onSelect={handleQuickSuggestion}
          stageColor={stageColor}
          isLoading={isLoading}
        />
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-white/5">
        <div className="relative">
          <textarea
            value={input}
            onChange={handleInputChangeWithMentions}
            onKeyDown={handleKeyPress}
            disabled={isLoading || isHistoryLoading}
            placeholder="Pergunte algo ou peça ajuda... (use @ para mencionar cards)"
            className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/50 transition-colors disabled:opacity-50 resize-none"
            rows={2}
            ref={textareaRef}
          />

          {/* Mention Dropdown - Show when active, even with 0 suggestions */}
          {isMounted && isMentionActive &&
            createPortal(
              <MentionDropdown
                suggestions={mentionSuggestions}
                position={mentionPosition}
                selectedIndex={mentionSelectedIndex}
                onSelect={handleMentionSelect}
                onClose={closeMention}
              />,
              document.body
            )
          }

          <button
            onClick={handleSend}
            disabled={isLoading || isHistoryLoading || !input.trim()}
            className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center bg-[#7AA2FF] hover:bg-[#6690E8] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Enviar mensagem"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-2 text-xs text-[#E6E9F2]/40">
          <span>
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px]">@</kbd> mencionar card
          </span>
          <span>•</span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px]">Cmd</kbd>
            <span> + </span>
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px]">K</kbd> comandos
          </span>
        </div>
      </div>
    </aside>
  )
}
