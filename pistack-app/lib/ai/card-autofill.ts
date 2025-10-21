import type { SupabaseClient } from '@supabase/supabase-js'
import {
  getOpenAIClient,
  getStageAssistantEnvKey,
  getStageAssistantId,
} from '@/lib/ai/assistants'
import { executeFunctionCall } from '@/lib/ai/function-handlers'
import { CARD_TYPE_DESCRIPTIONS } from '@/lib/ai/functions'

interface BuildPromptParams {
  project: {
    id: string
    name: string
    description?: string | null
  }
  stages: Array<{
    id: string
    stage_number: number
    stage_name: string
    cards: Array<{
      card_type: string
      content: Record<string, any>
    }>
  }>
  stageNumber: number
  stageName: string
  cardType: string
}

function formatCardContent(content: Record<string, any>) {
  try {
    const compact = JSON.stringify(content)
    return compact.length > 400 ? `${compact.substring(0, 400)}...` : compact
  } catch {
    return ''
  }
}

function buildPrompt({
  project,
  stages,
  stageNumber,
  stageName,
  cardType,
}: BuildPromptParams) {
  const stageContext = stages
    .map((stage) => {
      const cardsSummary =
        stage.cards && stage.cards.length > 0
          ? stage.cards
              .map((card) => {
                const cardId = card.id || card.card_id || 'sem-id'
                return `- ${card.card_type} [id: ${cardId}]: ${formatCardContent(card.content)}`
              })
              .join('\n')
          : '- (sem cards preenchidos)'

      return `Etapa ${stage.stage_number} — ${stage.stage_name}\n${cardsSummary}`
    })
    .join('\n\n')

  const cardDescription =
    CARD_TYPE_DESCRIPTIONS[cardType] ||
    'Preencha com conteúdo detalhado e estruturado.'

  return [
    `Você é o assistente especializado da Etapa ${stageNumber} (${stageName}) do PIStack.`,
    'Seu objetivo é criar um card completo e pragmático baseado no contexto atual do projeto.',
    '',
    `Projeto: ${project.name}`,
    `Descrição: ${project.description || 'Sem descrição informada.'}`,
    '',
    'Contexto atual do canvas:',
    stageContext,
    '',
    `Card a ser criado: "${cardType}"`,
    `Descrição do card: ${cardDescription}`,
    '',
    'Instruções obrigatórias:',
    '- Analise o contexto e utilize insights relevantes.',
    '- Gere conteúdo claro, conciso e acionável.',
    '- Retorne o card utilizando a função `create_card`.',
    `- Utilize stage=${stageNumber} e card_type="${cardType}".`,
    '- Inclua todos os campos esperados para o card no objeto `content`.',
    '- Não responda com texto livre; execute apenas a função.',
  ].join('\n')
}

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface GenerateCardOptions {
  supabase: SupabaseClient
  projectId: string
  stageId: string
  stageNumber: number
  stageName: string
  cardType: string
  userId: string
  cardId: string
}

const CARD_SCHEMA_PROMPTS: Record<string, string> = {
  'project-name': `{
  "projectName": "Nome memorável do produto",
  "description": "Frase curta que resume o produto",
  "createdAt": "2025-02-05T12:00:00.000Z" (opcional)
}`,
  pitch: `{
  "pitch": "Frase de 1-2 sentenças explicando o que o produto faz e por que é relevante"
}`,
  problem: `{
  "problem": "Texto em 2-3 parágrafos descrevendo a dor central",
  "painPoints": ["Pain point 1", "Pain point 2", "Pain point 3"]
}`,
  solution: `{
  "solution": "Descrição clara de como o produto resolve o problema",
  "differentiators": ["Diferencial 1", "Diferencial 2", "Diferencial 3"]
}`,
  'target-audience': `{
  "primaryAudience": "Descrição do público primário",
  "secondaryAudience": "Descrição do público secundário (opcional)"
}`,
  'initial-kpis': `{
  "kpis": [
    { "name": "Nome do KPI", "target": "Meta mensurável" },
    { "name": "Nome do KPI", "target": "Meta mensurável" }
  ]
}`,
}

async function generateFallbackContent(options: GenerateCardOptions & {
  project: any
  stages: any[]
}) {
  const schemaPrompt = CARD_SCHEMA_PROMPTS[options.cardType]
  if (!schemaPrompt) {
    return {
      success: false,
      error: `Sem schema configurado para card ${options.cardType}`,
    }
  }

  const openai = getOpenAIClient()

  const stageContext = options.stages
    .map((stage) => {
      const cardsSummary =
        stage.cards && stage.cards.length > 0
          ? stage.cards
              .map(
                (card: any) =>
                  `${card.card_type}: ${formatCardContent(card.content || {})}`
              )
              .join('\n')
          : '- (sem cards preenchidos)'

      return `Etapa ${stage.stage_number} — ${stage.stage_name}\n${cardsSummary}`
    })
    .join('\n\n')

  const prompt = `Você gera JSON para cards do PIStack.
Projeto: ${options.project.name}
Descrição: ${options.project.description || 'Sem descrição'}

Contexto do canvas:
${stageContext}

Card alvo: ${options.cardType}
Retorne apenas JSON válido obedecendo ao schema abaixo:
${schemaPrompt}

Regras:
- Use português brasileiro.
- KPIs devem conter unidade.
- Não escreva nada fora do JSON.`

  try {
    const response = await openai.responses.create({
      model: process.env.OPENAI_FALLBACK_MODEL || 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content:
            'Você entrega JSON válido para preencher cards. Nunca inclua comentários ou texto adicional.',
        },
        { role: 'user', content: prompt },
      ],
    })

    const text =
      (response as any).output?.[0]?.content?.[0]?.text ||
      (response as any).output_text ||
      (response as any).content?.[0]?.text ||
      ''

    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start === -1 || end === -1) {
      throw new Error('Resposta sem JSON válido')
    }

    const jsonText = text.substring(start, end + 1)
    const parsed = JSON.parse(jsonText)

    return {
      success: true,
      content: parsed,
      raw: jsonText,
    }
  } catch (error) {
    console.error('[AI][Fallback] falha ao gerar JSON', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

export async function generateCardWithAssistant({
  supabase,
  projectId,
  stageId,
  stageNumber,
  stageName,
  cardType,
  userId,
  cardId,
}: GenerateCardOptions) {
  const assistantId = getStageAssistantId(stageNumber)

  if (!assistantId) {
    const envKey = getStageAssistantEnvKey(stageNumber)
    return {
      success: false,
      error: `Assistente da etapa ${stageNumber} não configurado (defina ${envKey} no .env).`,
    }
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name, description')
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    return {
      success: false,
      error: 'Projeto não encontrado para gerar o card automaticamente.',
    }
  }

  const { data: stages, error: stagesError } = await supabase
    .from('stages')
    .select(
      `
        id,
        stage_number,
        stage_name,
        cards (
          id,
          card_type,
          content
        )
      `
    )
    .eq('project_id', projectId)
    .order('stage_number', { ascending: true })

  if (stagesError || !stages) {
    return {
      success: false,
      error: 'Não foi possível carregar o contexto das etapas.',
    }
  }

  const prompt = buildPrompt({
    project,
    stages: stages.map((stage) => ({
      id: stage.id,
      stage_number: stage.stage_number,
      stage_name: stage.stage_name,
      cards:
        stage.cards?.map((card: any) => ({
          card_type: card.card_type,
          content: card.content || {},
        })) ?? [],
    })),
    stageNumber,
    stageName,
    cardType,
  })

  const openai = getOpenAIClient()
  const thread = await openai.beta.threads.create()

  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: `${prompt}\n\nIMPORTANT: Atualize o card existente usando update_card com card_id="${cardId}". Não use create_card ou suggest_content.`,
  })

  let run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId,
  })

  const maxAttempts = 30
  let attempts = 0

  while (attempts < maxAttempts) {
    attempts += 1

    if (run.status === 'completed') {
      break
    }

    if (run.status === 'requires_action') {
      const toolCalls =
        run.required_action?.submit_tool_outputs?.tool_calls || []

      const outputs = await Promise.all(
        toolCalls.map(async (toolCall) => {
          if (
            toolCall.function.name === 'create_card' ||
            toolCall.function.name === 'suggest_content'
          ) {
            const result = {
              success: false,
              error: `Função ${toolCall.function.name} não permitida no modo auto-populate. Use update_card com card_id ${cardId}.`,
            }

            return {
              tool_call_id: toolCall.id,
              output: JSON.stringify(result),
            }
          }

          if (toolCall.function.name === 'update_card') {
            try {
              const parsedArgs = JSON.parse(toolCall.function.arguments || '{}')
              parsedArgs.card_id = cardId
              toolCall.function.arguments = JSON.stringify(parsedArgs)
            } catch {
              toolCall.function.arguments = JSON.stringify({
                card_id: cardId,
                content: {},
              })
            }
          }

          const result = await executeFunctionCall(
            toolCall.function.name,
            toolCall.function.arguments,
            userId,
            projectId
          )

          return {
            tool_call_id: toolCall.id,
            output: JSON.stringify(result),
          }
        })
      )

      run = await openai.beta.threads.runs.submitToolOutputs(run.id, {
        thread_id: thread.id,
        tool_outputs: outputs,
      })
      continue
    }

    if (
      run.status === 'failed' ||
      run.status === 'cancelled' ||
      run.status === 'expired'
    ) {
      return {
        success: false,
        error: `Assistente retornou status ${run.status}`,
      }
    }

    await wait(1000)
    run = await openai.beta.threads.runs.retrieve(run.id, {
      thread_id: thread.id,
    })
  }

  if (run.status !== 'completed') {
    return {
      success: false,
      error: 'Timeout ao aguardar resposta da IA.',
    }
  }

  const { data: card, error: cardError } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .maybeSingle()

  if (cardError) {
    return {
      success: false,
      error: `Falha ao recuperar card gerado: ${cardError.message}`,
    }
  }

  if (!card) {
    return {
      success: false,
      error:
        'Assistente executou, mas o card não foi encontrado. Verifique se o assistant chamou update_card corretamente.',
    }
  }

  const hasContent =
    card.content &&
    typeof card.content === 'object' &&
    Object.values(card.content).some((value) => {
      if (!value) return false
      if (typeof value === 'string') return value.trim().length > 0
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object')
        return Object.values(value).some(Boolean)
      return true
    })

  if (!hasContent) {
    console.warn('[AI] card sem conteúdo após assistente, acionando fallback', {
      cardId,
      cardType,
    })

    const fallback = await generateFallbackContent({
      supabase,
      projectId,
      stageId,
      stageNumber,
      stageName,
      cardType,
      userId,
      cardId,
      project,
      stages,
    })

    if (!fallback.success || !fallback.content) {
      return {
        success: false,
        error: fallback.error || 'Fallback não conseguiu gerar conteúdo.',
      }
    }

    const { data: fallbackCard, error: fallbackError } = await supabase
      .from('cards')
      .update({
        content: fallback.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cardId)
      .select()
      .single()

    if (fallbackError || !fallbackCard) {
      console.error('[AI][Fallback] falha ao salvar conteúdo', fallbackError)
      return {
        success: false,
        error: fallbackError?.message || 'Não foi possível salvar conteúdo gerado.',
      }
    }

    return {
      success: true,
      card: fallbackCard,
    }
  }

  return {
    success: true,
    card,
  }
}
