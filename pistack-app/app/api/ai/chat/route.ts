import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'
import {
  ensureSupabaseUser,
  getServiceRoleClient,
} from '@/lib/supabase/admin'
import {
  serializeChatMessage,
  type ChatMessageMetadata,
} from '@/lib/chat/messages'
import { FUNCTION_DEFINITIONS } from '@/lib/ai/functions'
import { executeFunctionCall } from '@/lib/ai/function-handlers'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type ChatRequestBody = {
  messages: Array<{
    id: string
    role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
    content: string
    data?: ChatMessageMetadata | null
  }>
  projectId: string
  stageNumber: number
  contextCard?: {
    id: string
    cardType: string
    content: Record<string, any>
  } | null
}

function formatCardSummary(cardType: string, content: Record<string, any>) {
  const entries = Object.entries(content ?? {})
    .map(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        return `${key}: ${value}`
      }
      if (Array.isArray(value)) {
        return `${key}: ${value
          .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
          .join(', ')}`
      }
      if (value && typeof value === 'object') {
        return `${key}: ${JSON.stringify(value)}`
      }
      return null
    })
    .filter(Boolean)
    .join('\n')

  return `Card "${cardType}":\n${entries || '(sem dados)'}`
}

function buildStageContext(
  projectName: string,
  stageName: string,
  cards: Array<{ card_type: string; content: Record<string, any> }>
) {
  const summaries = cards
    .slice(0, 8)
    .map((card) => formatCardSummary(card.card_type, card.content ?? {}))
    .join('\n\n')

  return `Projeto: ${projectName}\nEtapa atual: ${stageName}\nCards conhecidos:\n${summaries || 'Nenhum card preenchido ainda.'}`
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as ChatRequestBody
    const { messages, projectId, stageNumber, contextCard } = body

    if (!messages || !projectId || !stageNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)

    // Ensure stage belongs to the current user
    const { data: stageRecord, error: stageError } = await supabase
      .from('stages')
      .select(
        `
        id,
        stage_number,
        stage_name,
        project:projects!inner(
          id,
          user_id,
          name,
          description
        )
      `
      )
      .eq('project_id', projectId)
      .eq('stage_number', stageNumber)
      .eq('project.user_id', supabaseUserId)
      .single()

    if (stageError || !stageRecord) {
      return NextResponse.json(
        { error: 'Stage not found or unauthorized' },
        { status: 404 }
      )
    }

    const stageProject = Array.isArray(stageRecord.project)
      ? stageRecord.project[0]
      : stageRecord.project

    if (!stageProject) {
      return NextResponse.json(
        { error: 'Stage project relationship invalid' },
        { status: 500 }
      )
    }

    const { data: stageCards } = await supabase
      .from('cards')
      .select('card_type, content')
      .eq('stage_id', stageRecord.id)

    const stageContext = buildStageContext(
      stageProject.name,
      stageRecord.stage_name,
      stageCards ?? []
    )

    const referenceContext = contextCard
      ? `\n\nCard em foco (${contextCard.cardType}) [ID: ${contextCard.id}]:\n${formatCardSummary(
          contextCard.cardType,
          contextCard.content ?? {}
        )}\nUse update_card com esse card_id ao editar este card.`
      : ''

    const systemPrompt = [
      'Você é o Copiloto do PIStack. Ajude o usuário a preencher os cards do canvas com respostas práticas.',
      'Sempre responda em português brasileiro, em tom direto e aplicável.',
      'Use listas curtas e recomendações acionáveis. Sempre considere o contexto abaixo.',
      'Para criar ou atualizar cards use as funções disponíveis (create_card, update_card, suggest_content, validate_stage, get_project_context).',
      'Quando houver um card em foco, utilize update_card com o card_id fornecido. Descreva para o usuário o que foi atualizado.',
      '',
      stageContext,
      referenceContext,
    ].join('\n')

    // Persist user message (last one)
    const latestUserMessage = messages
      .slice()
      .reverse()
      .find((message) => message.role === 'user')

    let threadRecordId: string | null = null

    const { data: threadRow, error: threadError } = await supabase
      .from('ai_threads')
      .select('id')
      .eq('project_id', projectId)
      .eq('stage_number', stageNumber)
      .maybeSingle()

    if (threadError) {
      console.error('[AI][Chat] Failed to load thread:', threadError)
    }

    if (threadRow?.id) {
      threadRecordId = threadRow.id
    } else {
      const { data: newThread, error: insertThreadError } = await supabase
        .from('ai_threads')
        .insert({
          project_id: projectId,
          stage_number: stageNumber,
          openai_thread_id: `${projectId}-${stageNumber}`,
        })
        .select('id')
        .single()

      if (insertThreadError) {
        console.error('[AI][Chat] Failed to create thread:', insertThreadError)
      } else {
        threadRecordId = newThread?.id ?? null
      }
    }

    if (latestUserMessage && threadRecordId) {
      await supabase.from('ai_messages').insert({
        thread_id: threadRecordId,
        role: 'user',
        content: serializeChatMessage(
          latestUserMessage.content,
          latestUserMessage.data ?? null
        ),
      })
    }

    const contextMetadataMessage = contextCard
      ? {
          role: 'system' as const,
          content: JSON.stringify({
            card_context: {
              card_id: contextCard.id,
              card_type: contextCard.cardType,
              stage_number: stageNumber,
              instructions:
                'Use update_card para editar este card. Sempre inclua card_id e o objeto content completo conforme o schema da etapa.',
              current_content: contextCard.content ?? {},
            },
          }),
        }
      : null

    const preparedMessages = [
      { role: 'system', content: systemPrompt },
      ...(contextMetadataMessage ? [contextMetadataMessage] : []),
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ]

    const conversationMessages = [...preparedMessages]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: conversationMessages,
      stream: true,
      functions: FUNCTION_DEFINITIONS,
      function_call: 'auto',
    })

    const stream = OpenAIStream(response, {
      experimental_onFunctionCall: async (
        functionCallPayload,
        createFunctionCallMessages
      ) => {
        console.log('[AI][Chat] Function call requested', {
          name: functionCallPayload.name,
          args: functionCallPayload.arguments,
        })
        try {
          const result = await executeFunctionCall(
            functionCallPayload.name,
            JSON.stringify(functionCallPayload.arguments ?? {}),
            userId,
            projectId
          )

          const functionMessages = createFunctionCallMessages(result)
          conversationMessages.push(...functionMessages)

          return await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: conversationMessages,
            stream: true,
            functions: FUNCTION_DEFINITIONS,
            function_call: 'auto',
          })
        } catch (fnError) {
          console.error('[AI][Chat] Function call failed:', fnError)
          return 'Não consegui executar a ação solicitada. Tente novamente em instantes.'
        }
      },
      onCompletion: async (completion) => {
        if (!threadRecordId) return

        await supabase.from('ai_messages').insert({
          thread_id: threadRecordId,
          role: 'assistant',
          content: serializeChatMessage(completion),
        })
      },
    })

    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('[AI][Chat] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
