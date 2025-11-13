import type { SupabaseClient } from '@supabase/supabase-js'
import {
  getOpenAIClient,
  getStageAssistantEnvKey,
  getStageAssistantId,
} from '@/lib/ai/assistants'
import { executeFunctionCall } from '@/lib/ai/function-handlers'
import { normalizeCardArrays } from '@/lib/array-normalizers'
import { CARD_TYPE_DESCRIPTIONS } from '@/lib/ai/functions'
import { AIRequestCache } from '@/lib/ai/request-cache'

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
    `⚠️ ATENÇÃO: Card a ser criado: "${cardType}"`,
    `⚠️ NÃO confunda com outros tipos de card!`,
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
    '🚫 ERROS COMUNS QUE VOCÊ DEVE EVITAR:',
    '1. NUNCA repita labels: "Primário: Primário: Primário: texto" ❌',
    '2. NUNCA retorne JSON como string: "{\\"field\\":\\"value\\"}" ❌',
    '3. NUNCA misture formatos: campo deve ser string OU objeto, não ambos',
    '4. NUNCA adicione formatação extra, markdown ou comentários',
    '',
    'Exemplos de OUTPUT CORRETO:',
    `- primaryAudience: "Arqueiros profissionais buscando melhorar desempenho" ✅`,
    `- kpis: [{"name": "Taxa de conversão", "target": "5%"}] ✅`,
    '',
    'Exemplos de OUTPUT INCORRETO:',
    `- primaryAudience: "Primário: Primário: Arqueiros..." ❌`,
    `- primaryAudience: "{\\"primaryAudience\\":\\"Arqueiros...\\"}" ❌`,
    '',
    `⚠️ VALIDAÇÃO CRÍTICA:`,
    `- Certifique-se de que está gerando o card tipo "${cardType}"`,
    `- NÃO gere conteúdo de outros tipos de card`,
    `- Verifique se os campos retornados correspondem ao schema de "${cardType}"`,
    '',
    'Instruções de execução:',
    '- Analise o contexto e utilize insights relevantes.',
    '- Gere conteúdo claro, conciso e acionável em português brasileiro.',
    '- Retorne o card utilizando a função `create_card`.',
    `- Utilize stage=${stageNumber} e card_type="${cardType}".`,
    '- Inclua TODOS os campos esperados no schema acima.',
    '- Respeite os tipos de dados: strings, arrays, objetos.',
    '- NUNCA adicione labels repetidos, JSON embutido ou formatação extra.',
    '- Não responda com texto livre; execute apenas a função.',
  ].join('\n')
}

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Sanitiza resposta da IA removendo padrões problemáticos
 */
export function sanitizeAIResponse(content: any, cardType: string): any {
  if (!content || typeof content !== 'object') {
    return content
  }

  const sanitized = { ...content }

  // Iterar sobre todos os campos do objeto
  Object.keys(sanitized).forEach((key) => {
    const value = sanitized[key]

    if (typeof value === 'string') {
      let cleaned = value

      // 1. Remover JSON embutido em strings
      // Se o valor inteiro é um JSON, tentar parsear
      if (cleaned.trim().startsWith('{') && cleaned.trim().endsWith('}')) {
        try {
          const parsed = JSON.parse(cleaned)
          sanitized[key] = parsed
          return // Substituir valor com objeto parseado
        } catch {
          // Se não conseguir parsear, continuar com sanitização
        }
      }

      // 2. Remover padrões repetidos em QUALQUER posição
      // Ex: "Primário: Primário: Primário: texto" ou "texto Primário: Primário:"
      const repeatedPatternStart = /^(\w+:\s*){3,}/gi
      cleaned = cleaned.replace(repeatedPatternStart, '')

      // Detecta padrões como "word: word: word:" em qualquer posição
      cleaned = cleaned.replace(/(\w+):\s*\1:\s*\1:/gi, '')

      // 3. Remover palavras repetidas consecutivamente (3+ vezes)
      cleaned = cleaned.replace(/\b(\w+)(\s+\1){2,}\b/gi, '$1')

      // 4. Limpar espaços múltiplos
      cleaned = cleaned.replace(/\s{2,}/g, ' ').trim()

      // 5. Remover JSON parcial no meio do texto
      // Ex: "texto {"field":"value"} mais texto"
      cleaned = cleaned.replace(/\{[^}]*"[^"]*"[^}]*\}/g, '')

      sanitized[key] = cleaned
    } else if (Array.isArray(value)) {
      // Sanitizar cada item do array
      sanitized[key] = value.map((item) => {
        if (typeof item === 'string') {
          return item
            .replace(/^(\w+:\s*){3,}/gi, '')
            .replace(/\b(\w+)(\s+\1){2,}\b/gi, '$1')
            .replace(/\s{2,}/g, ' ')
            .trim()
        } else if (typeof item === 'object') {
          return sanitizeAIResponse(item, cardType)
        }
        return item
      })
    } else if (typeof value === 'object' && value !== null) {
      // Recursivamente sanitizar objetos aninhados
      sanitized[key] = sanitizeAIResponse(value, cardType)
    }
  })

  return sanitized
}

function validateCardSchema(cardType: string, content: any): boolean {
  if (!content || typeof content !== 'object') {
    return false
  }

  // Validações específicas por tipo de card
  // IMPORTANTE: Validações devem ser PERMISSIVAS - só rejeitam se estiver MUITO errado
  switch (cardType) {
    case 'initial-kpis':
      // Verifica se NÃO tem campos de outros cards (solution, problem, etc)
      const hasWrongFields =
        ('solution' in content) ||
        ('problem' in content) ||
        ('pitch' in content)

      // Aceita se tem kpis OU se não tem campos errados
      return !hasWrongFields || Array.isArray(content.kpis)

    case 'problem':
      // DEVE ter o campo 'problem' - não aceita vazio
      return 'problem' in content && typeof content.problem === 'string' && content.problem.trim().length > 0

    case 'solution':
      // DEVE ter o campo 'solution' - não aceita vazio
      return 'solution' in content && typeof content.solution === 'string' && content.solution.trim().length > 0

    case 'pitch':
      // DEVE ter o campo 'pitch' - não aceita vazio
      return 'pitch' in content && typeof content.pitch === 'string' && content.pitch.trim().length > 0

    case 'project-name':
      // Aceita se tem 'projectName' ou 'name'
      return 'projectName' in content || 'name' in content

    case 'target-audience':
      // Aceita se tem 'primaryAudience' ou 'audience'
      return 'primaryAudience' in content || 'audience' in content

    case 'primary-persona':
      // Aceita se tem 'name' e não tem campos completamente errados
      return 'name' in content || Object.keys(content).length > 2

    case 'benchmarking':
      return (
        (Array.isArray(content.competitors) && content.competitors.length > 0) ||
        (Array.isArray(content.opportunities) && content.opportunities.length > 0)
      )

    case 'user-stories':
      if (!Array.isArray(content.stories)) {
        return false
      }
      return content.stories.some((story) => {
        if (!story) return false
        if (typeof story === 'string') {
          return story.trim().length > 0
        }
        const candidate = story as Record<string, any>
        return (
          typeof candidate.title === 'string' && candidate.title.trim().length > 0 ||
          typeof candidate.asA === 'string' && candidate.asA.trim().length > 0 ||
          typeof candidate.iWant === 'string' && candidate.iWant.trim().length > 0
        )
      })

    default:
      // Para outros tipos, aceita qualquer coisa com conteúdo
      return Object.keys(content).length > 0
  }
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
    { "name": "Nome do KPI 1", "target": "Meta mensurável" },
    { "name": "Nome do KPI 2", "target": "Meta mensurável" },
    { "name": "Nome do KPI 3", "target": "Meta mensurável" }
  ]
}
CRÍTICO: Este é o card "initial-kpis" - NÃO confunda com outros cards!
- O campo DEVE ser "kpis" (não "solution", "problem", ou outros)
- DEVE ser um array de objetos com {name: string, target: string}
- Exemplo correto: [{"name": "Taxa de conversão", "target": "5%"}, {"name": "Usuários ativos", "target": "1000/mês"}]
- NÃO retorne campos de outros cards como "solution" ou "differentiators"`,

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

// Cache global para requisições de IA
// Evita múltiplas requisições simultâneas com os mesmos parâmetros
const aiCache = new AIRequestCache()

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

export async function generateCardWithAssistant(options: GenerateCardOptions) {
  const {
    supabase,
    projectId,
    stageId,
    stageNumber,
    stageName,
    cardType,
    userId,
    cardId,
  } = options

  // Chave para deduplicação: evita múltiplas requisições simultâneas
  // para o mesmo card
  const cacheKey = {
    projectId,
    stageNumber,
    cardType,
    cardId,
  }

  // Usa o cache para deduplicar requisições
  return aiCache.deduplicate(cacheKey, async () => {
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

  const maxAttempts = 20
  let attempts = 0
  const runStart = Date.now()

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

    if (Date.now() - runStart > 25000) {
      console.warn('[AI][AutoPopulate] Tempo limite atingido antes da conclusão', {
        cardId,
        cardType,
        stageNumber,
        attempts,
      })
      break
    }

    await wait(1000)
    run = await openai.beta.threads.runs.retrieve(run.id, {
      thread_id: thread.id,
    })
  }

  if (run.status !== 'completed') {
    console.error('[AI][Timeout] Assistente não completou a tempo, acionando fallback', {
      cardId,
      cardType,
      stageNumber,
      attempts,
      finalStatus: run.status,
    })

    // Aciona o fallback em caso de timeout
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
        error: fallback.error || 'Timeout e fallback falharam.',
      }
    }

    // Verifica se o card ainda existe antes de tentar atualizar
    const { data: existingCard, error: checkError } = await supabase
      .from('cards')
      .select('id')
      .eq('id', cardId)
      .maybeSingle()

    if (checkError || !existingCard) {
      console.error('[AI][Fallback] Card não existe mais no banco', { cardId, checkError })
      return {
        success: false,
        error: 'Card foi removido durante processamento da IA',
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
        error: fallbackError?.message || 'Não foi possível salvar conteúdo do fallback.',
      }
    }

    return {
      success: true,
      card: fallbackCard,
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

  // SANITIZAR CONTEÚDO ANTES DE VALIDAR
  const sanitizedContent = sanitizeAIResponse(card.content, cardType)
  // NORMALIZAR ARRAYS CONFORME O TIPO DE CARD
  const normalizedContent = normalizeCardArrays(cardType, sanitizedContent)

  console.log('[AI][Sanitization]', {
    cardId,
    cardType,
    before: JSON.stringify(card.content).substring(0, 150),
    after: JSON.stringify(sanitizedContent).substring(0, 150),
  })

  // Atualizar card com conteúdo sanitizado se houve mudanças
  const needsSave = JSON.stringify(card.content) !== JSON.stringify(normalizedContent)
  if (needsSave) {
    const { error: updateError } = await supabase
      .from('cards')
      .update({ content: normalizedContent, updated_at: new Date().toISOString() })
      .eq('id', cardId)

    if (updateError) {
      console.error('[AI][Sanitization] Erro ao salvar conteúdo sanitizado:', updateError)
    } else {
      card.content = normalizedContent
      console.log('[AI][Sanitization] Conteúdo sanitizado/normalizado salvo com sucesso')
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

  // Validação: verificar se o conteúdo está correto para o tipo de card
  const hasCorrectSchema = validateCardSchema(cardType, card.content)

  console.log('[AI][Validation]', {
    cardId,
    cardType,
    hasContent,
    hasCorrectSchema,
    content: JSON.stringify(card.content).substring(0, 200),
  })

  // Aciona fallback se não tiver conteúdo OU se o schema estiver incorreto
  if (!hasContent || !hasCorrectSchema) {
    console.warn('[AI] card inválido após assistente, acionando fallback', {
      cardId,
      cardType,
      hasContent,
      hasCorrectSchema,
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

    // Verifica se o card ainda existe antes de tentar atualizar
    const { data: existingCard2, error: checkError2 } = await supabase
      .from('cards')
      .select('id')
      .eq('id', cardId)
      .maybeSingle()

    if (checkError2 || !existingCard2) {
      console.error('[AI][Fallback] Card não existe mais no banco', { cardId, checkError2 })
      return {
        success: false,
        error: 'Card foi removido durante processamento da IA',
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
  }) // Fecha a função deduplicate
}
