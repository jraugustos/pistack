'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles, Send } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AiSidebarProps {
  projectId: string
  activeStage: number
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

const formatCardReference = (cardType: string, cardId: string, content: Record<string, unknown>) => {
  const cardName = cardType
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const formattedContent =
    content && Object.keys(content).length > 0
      ? formatValue(content)
      : '- (card vazio)'

  return [
    `Analise o card ${cardName}`,
    `ID: ${cardId}`,
    'Conteúdo:',
    formattedContent,
    '',
    'Sugira melhorias focadas neste conteúdo.'
  ].join('\n')
}

export function AiSidebar({ projectId, activeStage }: AiSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

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

      const message = formatCardReference(detail.card.card_type, detail.card.id, detail.card.content ?? {})
      setInput(message)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }

    window.addEventListener('pistack:ai:reference-card', handler as EventListener)
    return () => {
      window.removeEventListener('pistack:ai:reference-card', handler as EventListener)
    }
  }, [activeStage, projectId])

  const handleSend = async () => {
    if (!input.trim() || isLoading || isHistoryLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <aside className="w-96 border-l border-white/5 bg-[#0F1115] flex flex-col transition-colors duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7AA2FF]/20 to-[#5AD19A]/20 border border-[#7AA2FF]/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#7AA2FF]" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Copiloto do Projeto</h3>
          </div>
        </div>
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
                <div
                  className={`rounded-lg p-3 text-sm leading-relaxed whitespace-pre-line ${
                    message.role === 'assistant'
                      ? 'bg-white/5'
                      : 'bg-[#7AA2FF]/10 ml-auto'
                  }`}
                >
                  {message.content}
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
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || isHistoryLoading}
            placeholder="Pergunte algo ou peça ajuda..."
            className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-sm placeholder:text-[#E6E9F2]/40 focus:outline-none focus:border-[#7AA2FF]/50 transition-colors disabled:opacity-50"
            ref={inputRef}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || isHistoryLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#7AA2FF] hover:bg-[#6690E8] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Enviar mensagem"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-2 text-xs text-[#E6E9F2]/40">
          <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px]">
            Cmd
          </kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px]">
            K
          </kbd>
          <span>para comandos rápidos</span>
        </div>
      </div>
    </aside>
  )
}
