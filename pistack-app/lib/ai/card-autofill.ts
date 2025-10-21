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
      id?: string
      card_id?: string
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

  const schemaPrompt = CARD_SCHEMA_PROMPTS[cardType] || '{}'

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
    '⚠️ SCHEMA OBRIGATÓRIO DO CARD (siga exatamente esta estrutura):',
    schemaPrompt,
    '',
    'Instruções CRÍTICAS sobre arrays:',
    '1. Arrays DEVEM ser JSON válido: ["item1", "item2", "item3"]',
    '2. NUNCA use strings com quebras de linha para representar listas',
    '3. NUNCA use formato de texto como "- item1\\n- item2"',
    '4. Arrays de objetos devem seguir o schema exato mostrado acima',
    '5. Exemplo CORRETO de painPoints: ["Dificuldade em X", "Problema com Y"]',
    '6. Exemplo ERRADO: "- Dificuldade em X\\n- Problema com Y"',
    '',
    'Instruções de execução:',
    '- Analise o contexto e utilize insights relevantes.',
    '- Gere conteúdo claro, conciso e acionável em português brasileiro.',
    '- Retorne o card utilizando a função `create_card`.',
    `- Utilize stage=${stageNumber} e card_type="${cardType}".`,
    '- Inclua TODOS os campos esperados no schema acima.',
    '- Respeite os tipos de dados: strings, arrays, objetos.',
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
  // Etapa 1
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
}
IMPORTANTE: painPoints DEVE ser um array de strings simples, não um objeto ou string com quebras de linha.`,
  solution: `{
  "solution": "Descrição clara de como o produto resolve o problema",
  "differentiators": ["Diferencial 1", "Diferencial 2", "Diferencial 3"]
}
IMPORTANTE: differentiators DEVE ser um array de strings simples.`,
  'target-audience': `{
  "primaryAudience": "Descrição do público primário",
  "secondaryAudience": "Descrição do público secundário (opcional)"
}`,
  'initial-kpis': `{
  "kpis": [
    { "name": "Nome do KPI", "target": "Meta mensurável" },
    { "name": "Nome do KPI", "target": "Meta mensurável" }
  ]
}
IMPORTANTE: kpis DEVE ser um array de objetos com {name: string, target: string}.`,

  // Etapa 2
  'validation-hypotheses': `{
  "hypotheses": [
    {
      "label": "H1",
      "category": "Problema",
      "statement": "Acreditamos que [persona] enfrenta [dor] porque [causa].",
      "successMetric": "Validar com X entrevistas onde Y% mencionam a dor.",
      "confidence": "Alta/Média/Baixa (opcional)",
      "risk": "Alto/Médio/Baixo (opcional)"
    },
    {
      "label": "H2",
      "category": "Solução",
      "statement": "Se oferecermos [solução], esperamos reduzir [dor] em [métrica].",
      "successMetric": "Teste com 20 usuários; 80% devem concluir o fluxo sem ajuda."
    }
  ]
}
IMPORTANTE: hypotheses DEVE ser um array de objetos. Cada objeto DEVE ter label, category, statement e successMetric.`,
  'primary-persona': `{
  "name": "Nome da persona",
  "age": "Faixa etária",
  "occupation": "Profissão/ocupação",
  "bio": "Breve biografia",
  "goals": ["Objetivo 1", "Objetivo 2", "Objetivo 3"],
  "frustrations": ["Frustração 1", "Frustração 2"],
  "motivations": ["Motivação 1", "Motivação 2"]
}
IMPORTANTE: goals, frustrations e motivations DEVEM ser arrays de strings.`,
  'value-proposition': `{
  "headline": "Proposta de valor principal em uma frase",
  "subheadline": "Explicação complementar",
  "benefits": ["Benefício 1", "Benefício 2", "Benefício 3"],
  "forWho": "Para quem é o produto"
}
IMPORTANTE: benefits DEVE ser um array de strings.`,
  benchmarking: `{
  "competitors": [
    {
      "name": "Nome do concorrente",
      "strengths": ["Força 1", "Força 2"],
      "weaknesses": ["Fraqueza 1", "Fraqueza 2"],
      "pricing": "Modelo de precificação"
    }
  ],
  "opportunities": ["Oportunidade 1", "Oportunidade 2"]
}
IMPORTANTE: competitors DEVE ser array de objetos, strengths/weaknesses/opportunities DEVEM ser arrays de strings.`,

  // Etapa 3
  'mvp-definition': `{
  "description": "Descrição do MVP",
  "scope": "O que está incluído no MVP",
  "outOfScope": "O que NÃO está incluído",
  "timeline": "Prazo estimado"
}`,
  'essential-features': `{
  "features": [
    {
      "name": "Nome da feature",
      "description": "Descrição breve",
      "priority": "Alta/Média/Baixa",
      "effort": "Alto/Médio/Baixo"
    }
  ]
}
IMPORTANTE: features DEVE ser um array de objetos.`,
  'user-stories': `{
  "stories": [
    {
      "title": "Título da user story",
      "asA": "Como [persona]",
      "iWant": "Eu quero [ação]",
      "soThat": "Para que [benefício]",
      "acceptanceCriteria": ["Critério 1", "Critério 2"]
    }
  ]
}
IMPORTANTE: stories DEVE ser array de objetos, acceptanceCriteria DEVE ser array de strings.`,
  'acceptance-criteria': `{
  "criteria": [
    {
      "feature": "Nome da feature",
      "conditions": ["Condição 1", "Condição 2", "Condição 3"]
    }
  ]
}
IMPORTANTE: criteria DEVE ser array de objetos, conditions DEVE ser array de strings.`,
  roadmap: `{
  "phases": [
    {
      "name": "Fase 1: MVP",
      "duration": "2-3 meses",
      "milestones": ["Marco 1", "Marco 2"],
      "deliverables": ["Entrega 1", "Entrega 2"]
    }
  ]
}
IMPORTANTE: phases, milestones e deliverables DEVEM ser arrays.`,
  'scope-constraints': `{
  "constraints": ["Restrição 1", "Restrição 2"],
  "assumptions": ["Premissa 1", "Premissa 2"],
  "dependencies": ["Dependência 1", "Dependência 2"]
}
IMPORTANTE: Todos os campos DEVEM ser arrays de strings.`,

  // Etapa 4
  'user-flows': `{
  "flows": [
    {
      "name": "Nome do fluxo",
      "description": "Descrição",
      "steps": ["Passo 1", "Passo 2", "Passo 3"]
    }
  ]
}
IMPORTANTE: flows DEVE ser array de objetos, steps DEVE ser array de strings.`,
  wireframes: `{
  "screens": [
    {
      "name": "Nome da tela",
      "description": "Descrição",
      "elements": ["Elemento 1", "Elemento 2"]
    }
  ]
}
IMPORTANTE: screens DEVE ser array de objetos, elements DEVE ser array de strings.`,
  'design-system': `{
  "colors": {
    "primary": "#hexadecimal",
    "secondary": "#hexadecimal"
  },
  "typography": {
    "headings": "Fonte para títulos",
    "body": "Fonte para texto"
  },
  "spacing": "Sistema de espaçamento (ex: 4px, 8px, 16px...)"
}`,
  components: `{
  "components": [
    {
      "name": "Nome do componente",
      "description": "Descrição",
      "variants": ["Variante 1", "Variante 2"]
    }
  ]
}
IMPORTANTE: components DEVE ser array de objetos, variants DEVE ser array de strings.`,
  accessibility: `{
  "guidelines": ["Guideline 1", "Guideline 2"],
  "wcagLevel": "A/AA/AAA",
  "considerations": ["Consideração 1", "Consideração 2"]
}
IMPORTANTE: guidelines e considerations DEVEM ser arrays de strings.`,

  // Etapa 5
  'tech-stack': `{
  "frontend": ["Tecnologia 1", "Tecnologia 2"],
  "backend": ["Tecnologia 1", "Tecnologia 2"],
  "database": "Nome do banco de dados",
  "infrastructure": ["Serviço 1", "Serviço 2"],
  "justification": "Justificativa das escolhas"
}
IMPORTANTE: frontend, backend e infrastructure DEVEM ser arrays de strings.`,
  architecture: `{
  "type": "Tipo de arquitetura (ex: Microserviços, Monolito)",
  "description": "Descrição da arquitetura",
  "components": [
    {
      "name": "Nome do componente",
      "responsibility": "Responsabilidade"
    }
  ]
}
IMPORTANTE: components DEVE ser array de objetos.`,
  database: `{
  "type": "SQL/NoSQL",
  "schema": "Descrição do schema",
  "tables": [
    {
      "name": "Nome da tabela",
      "fields": ["campo1", "campo2"]
    }
  ]
}
IMPORTANTE: tables DEVE ser array de objetos, fields DEVE ser array de strings.`,
  'api-design': `{
  "endpoints": [
    {
      "method": "GET/POST/PUT/DELETE",
      "path": "/api/endpoint",
      "description": "Descrição"
    }
  ],
  "authentication": "Tipo de autenticação"
}
IMPORTANTE: endpoints DEVE ser array de objetos.`,
  infrastructure: `{
  "hosting": "Provedor de hospedagem",
  "services": ["Serviço 1", "Serviço 2"],
  "cicd": "Pipeline de CI/CD",
  "monitoring": ["Ferramenta 1", "Ferramenta 2"]
}
IMPORTANTE: services e monitoring DEVEM ser arrays de strings.`,
  security: `{
  "measures": ["Medida 1", "Medida 2"],
  "authentication": "Estratégia de autenticação",
  "dataProtection": "Como proteger dados sensíveis",
  "compliance": ["Regulamentação 1", "Regulamentação 2"]
}
IMPORTANTE: measures e compliance DEVEM ser arrays de strings.`,

  // Etapa 6
  'sprint-planning': `{
  "sprints": [
    {
      "number": 1,
      "duration": "2 semanas",
      "goals": ["Objetivo 1", "Objetivo 2"],
      "stories": ["Story 1", "Story 2"]
    }
  ]
}
IMPORTANTE: sprints DEVE ser array de objetos, goals e stories DEVEM ser arrays de strings.`,
  timeline: `{
  "milestones": [
    {
      "name": "Marco 1",
      "date": "2025-03-01",
      "deliverables": ["Entrega 1", "Entrega 2"]
    }
  ],
  "totalDuration": "X meses"
}
IMPORTANTE: milestones DEVE ser array de objetos, deliverables DEVE ser array de strings.`,
  resources: `{
  "team": [
    {
      "role": "Desenvolvedor",
      "quantity": 2,
      "skills": ["Skill 1", "Skill 2"]
    }
  ],
  "tools": ["Ferramenta 1", "Ferramenta 2"]
}
IMPORTANTE: team DEVE ser array de objetos, skills e tools DEVEM ser arrays de strings.`,
  budget: `{
  "totalEstimate": "R$ X.XXX,XX",
  "breakdown": [
    {
      "category": "Desenvolvimento",
      "amount": "R$ X.XXX,XX",
      "items": ["Item 1", "Item 2"]
    }
  ]
}
IMPORTANTE: breakdown DEVE ser array de objetos, items DEVE ser array de strings.`,
  milestones: `{
  "milestones": [
    {
      "name": "Marco 1",
      "description": "Descrição",
      "deadline": "2025-03-01",
      "deliverables": ["Entrega 1", "Entrega 2"]
    }
  ]
}
IMPORTANTE: milestones DEVE ser array de objetos, deliverables DEVE ser array de strings.`,
  'success-criteria': `{
  "criteria": [
    {
      "metric": "Nome da métrica",
      "target": "Meta",
      "measurement": "Como medir"
    }
  ]
}
IMPORTANTE: criteria DEVE ser array de objetos.`,
  'risk-management': `{
  "risks": [
    {
      "description": "Descrição do risco",
      "probability": "Alta/Média/Baixa",
      "impact": "Alto/Médio/Baixo",
      "mitigation": "Estratégia de mitigação"
    }
  ]
}
IMPORTANTE: risks DEVE ser array de objetos.`,
  'launch-plan': `{
  "phases": [
    {
      "name": "Fase 1",
      "activities": ["Atividade 1", "Atividade 2"],
      "timeline": "Data/período"
    }
  ],
  "channels": ["Canal 1", "Canal 2"],
  "metrics": ["Métrica 1", "Métrica 2"]
}
IMPORTANTE: phases DEVE ser array de objetos, activities/channels/metrics DEVEM ser arrays de strings.`,
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
