import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  ensureSupabaseUser,
  getServiceRoleClient,
} from '@/lib/supabase/admin'
import { generateCardWithAssistant } from '@/lib/ai/card-autofill'

type AutoPopulateJob = {
  projectId: string
  stageId: string
  stageNumber: number
  stageName: string
  cardType: string
  userId: string
  cardId: string
}

function buildBaselineContent(
  cardType: string,
  project: { name: string; description?: string | null }
) {
  const projectName = project.name || 'Projeto sem nome'
  const baseDescription =
    project.description?.trim() ||
    `Detalhamento inicial do projeto ${projectName}.`

  switch (cardType) {
    case 'project-name':
      return {
        projectName,
        description: baseDescription,
        createdAt: new Date().toISOString(),
      }
    case 'problem':
      return {
        problem: baseDescription,
        painPoints: [
          `Clientes enfrentam obstáculos para obter ${projectName}.`,
          'Processos atuais geram atrito e baixo engajamento.',
        ],
        impact:
          'Impacta a experiência do usuário e a eficiência operacional.',
      }
    case 'solution':
      return {
        solution: `Solução inicial para ${projectName}, oferecendo experiência guiada e centralizada.`,
        differentiators: [
          'Fluxo integrado ponta a ponta.',
          'Curadoria personalizada baseada em dados do cliente.',
        ],
      }
    case 'pitch':
      return {
        pitch: `${projectName} entrega uma experiência completa: ${baseDescription}`,
      }
    case 'target-audience':
      return {
        primaryAudience: `Usuários que precisam de ${projectName} no dia a dia.`,
        secondaryAudience: 'Aliados estratégicos e parceiros de negócio.',
      }
    case 'initial-kpis':
      return {
        kpis: [
          { name: 'Adoção inicial', target: '50 usuários no primeiro mês' },
          { name: 'Satisfação', target: 'NPS >= 60 em 90 dias' },
        ],
      }
    case 'primary-persona':
      return {
        name: 'Persona inicial',
        role: 'Usuário chave do projeto',
        goals: [
          'Ganhar eficiência em tarefas críticas',
          'Monitorar resultados em tempo real',
        ],
        frustrations: [
          'Processos manuais e lentos',
          'Falta de visibilidade sobre entregas',
        ],
      }
    case 'validation-hypotheses':
      return {
        hypotheses: [
          {
            statement: `Clientes com perfil do ${projectName} desejam ${projectName} para resolver ${baseDescription}`,
            metric: 'Validação via entrevistas',
            successCriteria: '80% sinalizando interesse em piloto',
          },
          {
            statement: 'Usuários priorizam autonomia e concierge digital',
            metric: 'Teste de conceito',
            successCriteria: 'Taxa de conclusão ≥ 60%',
          },
        ],
      }
    case 'value-proposition':
      return {
        proposition: {
          promise: `${projectName} entrega uma experiência completa end-to-end.`,
          valuePoints: [
            { text: 'Centraliza jornadas e reduz ações manuais.' },
            { text: 'Personaliza ofertas com base no perfil do cliente.' },
          ],
        },
        proof: 'Protótipo validado em entrevistas qualitativas.',
      }
    case 'benchmarking':
      return {
        benchmarking: [
          {
            name: 'Concorrente A',
            category: 'Apps de viagem',
            strengths: ['Rede de parceiros ampla'],
            weaknesses: ['Experiência fragmentada'],
          },
          {
            name: 'Concorrente B',
            category: 'Assistentes financeiros',
            strengths: ['Automação de concierge'],
            weaknesses: ['Foco limitado em lifestyle'],
          },
        ],
      }
    case 'mvp-definition':
      return {
        scope: `${projectName} MVP foca em orquestrar experiências prioritárias.`,
        mustHave: ['Dashboard do cliente', 'Acesso a concierge humano', 'Catálogo curado'],
        niceToHave: ['Integração com parceiros externos', 'Programa de pontos'],
      }
    case 'essential-features':
      return {
        features: [
          {
            name: 'Hub de experiências',
            description: 'Explorar, reservar e gerenciar viagens em um lugar único.',
            priority: 'Alta',
          },
          {
            name: 'Assistência proativa',
            description: 'Alertas de upgrade, eventos e concierge digital 24/7.',
            priority: 'Alta',
          },
        ],
      }
    case 'user-stories':
      return {
        stories: [
          {
            role: 'Cliente Private',
            goal: 'Solicitar experiências personalizadas',
            benefit: 'Receber retorno prioritário sem ligações',
          },
          {
            role: 'Concierge',
            goal: 'Visualizar preferências do cliente',
            benefit: 'Oferecer recomendações certeiras',
          },
        ],
      }
    case 'acceptance-criteria':
      return {
        criteria: [
          {
            feature: 'Solicitação de concierge',
            conditions: [
              'Usuário envia briefing pelo app',
              'Concierge responde em até 2 horas úteis',
              'Usuário acompanha status em tempo real',
            ],
          },
        ],
      }
    case 'roadmap':
      return {
        phases: [
          {
            name: 'Descoberta',
            quarter: 'Q1',
            milestones: ['Entrevistas com clientes', 'Mapeamento de processos'],
            deliverables: ['Personas', 'Mapa de jornada'],
          },
          {
            name: 'Entrega MVP',
            quarter: 'Q2',
            milestones: ['Desenvolvimento núcleo', 'Piloto restrito'],
            deliverables: ['App interno', 'Concierge digital'],
          },
        ],
      }
    case 'scope-constraints':
      return {
        inScope: ['Clientes Private no Brasil', 'Viagens e experiências exclusivas'],
        outOfScope: ['Clientes pessoa jurídica', 'Produtos massificados'],
        constraints: ['Dependência do CRM atual', 'Equipe concierge limitada'],
      }
    case 'user-flows':
      return {
        flows: [
          {
            name: 'Solicitar experiência',
            steps: ['Escolher tipo de experiência', 'Enviar briefing', 'Acompanhar resposta'],
          },
          {
            name: 'Concierge sugere opções',
            steps: ['Receber briefing', 'Selecionar parceiros', 'Enviar proposta'],
          },
        ],
      }
    case 'wireframes':
      return {
        screens: [
          {
            name: 'Home',
            sections: ['Resumo do cliente', 'Atalhos rápidos', 'Próximos eventos'],
          },
          {
            name: 'Solicitar experiência',
            sections: ['Formulário guiado', 'Preferências salvas', 'Status do pedido'],
          },
        ],
      }
    case 'design-system':
      return {
        foundations: {
          colors: ['Primary #7AA2FF', 'Secondary #5AD19A'],
          typography: ['Display/700', 'Body/400'],
        },
        components: ['Card de experiência', 'Timeline de concierge', 'Modal de confirmação'],
      }
    case 'components':
      return {
        library: [
          { name: 'ExperienceCard', usage: 'Listar sugestões personalizadas' },
          { name: 'ConciergeBadge', usage: 'Exibir status do atendimento' },
        ],
        guidelines: 'Componentes devem manter contraste AA e estados focáveis.',
      }
    case 'accessibility':
      return {
        checklist: [
          'Teclas de atalho para ações frequentes',
          'Descrições para imagens de destinos',
          'Compatibilidade com leitores de tela',
        ],
        risks: ['Conteúdo rico em mídia', 'Uso intenso de mapas'],
      }
    case 'tech-stack':
      return {
        frontend: ['Next.js 14', 'Tailwind', 'React Server Components'],
        backend: ['Supabase', 'LangGraph para IA', 'Node 18'],
        integrations: ['CRM Private', 'Serviços de viagens parceiros'],
      }
    case 'architecture':
      return {
        overview: 'Arquitetura modular com BFF e integrações por webhooks/queues.',
        diagrams: ['Context Diagram v1', 'Sequence Concierge Request'],
        decisions: ['Usar event-driven para atualizar concierge e cliente em tempo real'],
      }
    case 'database':
      return {
        entities: [
          { name: 'ClientProfile', fields: ['preferences', 'restrictions', 'history'] },
          { name: 'ExperienceRequest', fields: ['status', 'briefing', 'conciergeNotes'] },
        ],
        considerations: ['Criptografar dados sensíveis', 'Auditar alterações de concierge'],
      }
    case 'api-design':
      return {
        apis: [
          {
            name: 'POST /concierge/requests',
            payload: '{ clientId, experienceType, preferences }',
            response: '{ requestId, status }',
          },
          {
            name: 'PATCH /concierge/requests/:id',
            payload: '{ status, notes }',
            response: '{ success: true }',
          },
        ],
      }
    case 'infrastructure':
      return {
        hosting: ['Vercel para front', 'Supabase para dados', 'Render para workers'],
        observability: ['Grafana dashboards', 'Alertas PagerDuty'],
        deployment: 'CI com testes automatizados e feature flags por segmento.',
      }
    case 'security':
      return {
        measures: [
          'Autenticação multifator para concierge',
          'Criptografia em repouso (AES-256)',
          'Monitoramento de anomalias de acesso',
        ],
        authentication: 'Clerk com políticas adaptativas',
        dataProtection: 'Tokenizar dados sensíveis dos clientes Private',
        compliance: ['LGPD', 'ISO 27001 baseline'],
      }
    case 'sprint-planning':
      return {
        sprints: [
          {
            number: 1,
            duration: '2 semanas',
            goals: ['Finalizar fluxos principais', 'Configurar integrações básicas'],
            stories: ['Cadastro de experiência', 'Painel do concierge'],
          },
          {
            number: 2,
            duration: '2 semanas',
            goals: ['Entregar piloto', 'Instrumentar métricas'],
            stories: ['Notificações push', 'Dashboard do cliente'],
          },
        ],
      }
    case 'timeline':
      return {
        milestones: [
          {
            name: 'Piloto interno',
            date: '2025-05-01',
            deliverables: ['App concierge v1', 'Treinamento da equipe'],
          },
          {
            name: 'Lançamento controlado',
            date: '2025-07-01',
            deliverables: ['Ferramenta de sugestões', 'Programa VIP'],
          },
        ],
        totalDuration: '6 meses para lançamento completo',
      }
    case 'resources':
      return {
        team: [
          { role: 'Product Manager', quantity: 1, skills: ['Discovery', 'Stakeholder mgmt'] },
          { role: 'Fullstack Engineer', quantity: 3, skills: ['Next.js', 'Supabase', 'IA'] },
          { role: 'Concierge Specialist', quantity: 2, skills: ['Relacionamento', 'Operação'] },
        ],
        tools: ['Linear', 'Figma', 'Retool', 'Amplitude'],
      }
    case 'budget':
      return {
        totalEstimate: 'R$ 850.000 no ano 1',
        breakdown: [
          {
            category: 'Equipe interna',
            amount: 'R$ 450.000',
            items: ['Squad produto/tech', 'Concierge dedicado'],
          },
          {
            category: 'Tecnologia e parceiros',
            amount: 'R$ 200.000',
            items: ['Infraestrutura', 'APIs de viagens'],
          },
          {
            category: 'Experiências piloto',
            amount: 'R$ 200.000',
            items: ['Curadoria exclusiva', 'Eventos para clientes'],
          },
        ],
      }
    case 'milestones':
      return {
        milestones: [
          {
            name: 'Go Live Concierge Digital',
            description: 'Clientes podem abrir solicitações via app',
            deadline: '2025-08-15',
            deliverables: ['Fluxo completo', 'Equipe treinada'],
          },
          {
            name: 'Expansão para parceiros internacionais',
            description: 'Integração com rede premium',
            deadline: '2025-10-30',
            deliverables: ['APIs homologadas', 'Contratos ativos'],
          },
        ],
      }
    case 'success-criteria':
      return {
        criteria: [
          {
            metric: 'NPS Concierge Digital',
            target: '≥ 70 após 3 meses',
            measurement: 'Pesquisa trimestral com clientes Private',
          },
          {
            metric: 'Tempo médio de resposta',
            target: '< 2h úteis',
            measurement: 'Logs do sistema + SLA concierge',
          },
        ],
      }
    case 'launch-plan':
      return {
        phases: [
          {
            name: 'Pré-lançamento',
            activities: ['Campanha teaser para clientes Private', 'Treinamento do concierge'],
            timeline: 'T-60 a T-15 dias',
          },
          {
            name: 'Lançamento controlado',
            activities: ['Convite para grupo piloto', 'Eventos exclusivos com parceiros'],
            timeline: 'Semana 0',
          },
          {
            name: 'Expansão',
            activities: ['Abertura para toda a base Private', 'Co-marketing com parceiros'],
            timeline: 'Semana +4 em diante',
          },
        ],
        channels: ['Relacionamento Private', 'Eventos presenciais', 'Comunicação in-app'],
        metrics: ['Número de solicitações no app', 'Satisfação pós-experiência'],
      }
    case 'risk-management':
      return {
        risks: [
          {
            description: 'Dependência de parceiros premium',
            probability: 'Média',
            impact: 'Alto',
            mitigation: 'Diversificar rede e garantir SLAs claros',
          },
          {
            description: 'Adoção lenta por clientes conservadores',
            probability: 'Alta',
            impact: 'Médio',
            mitigation: 'Plano de onboarding assistido + acompanhamento dedicado',
          },
        ],
      }
    default:
      return {
        summary: baseDescription,
        nextSteps: [
          `Detalhar campos específicos do card ${cardType}.`,
          'Validar hipóteses com stakeholders e clientes.',
        ],
      }
  }
}

function scheduleAutoPopulateCard(job: AutoPopulateJob) {
  ;(async () => {
    try {
      const supabaseClient = getServiceRoleClient()
      const result = await generateCardWithAssistant({
        supabase: supabaseClient,
        projectId: job.projectId,
        stageId: job.stageId,
        stageNumber: job.stageNumber,
        stageName: job.stageName,
        cardType: job.cardType,
        userId: job.userId,
        cardId: job.cardId,
      })

      if (!result.success) {
        console.error('[Cards][AutoPopulate] Background generation failed', {
          cardId: job.cardId,
          cardType: job.cardType,
          error: result.error,
        })
      }
    } catch (error) {
      console.error('[Cards][AutoPopulate] Unexpected error generating card', {
        cardId: job.cardId,
        cardType: job.cardType,
        error,
      })
    }
  })()
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const stageId = searchParams.get('stageId')
    const cardId = searchParams.get('cardId')

    const supabase = getServiceRoleClient()
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)

    if (cardId) {
      const { data: card, error } = await supabase
        .from('cards')
        .select(
          `
          *,
          definition:card_definitions(*),
          stage:stages!inner(
            id,
            project:projects!inner(
              id,
              user_id
            )
          )
        `
        )
        .eq('id', cardId)
        .eq('stage.project.user_id', supabaseUserId)
        .single()

      if (error || !card) {
        return NextResponse.json(
          { error: 'Card not found or unauthorized' },
          { status: 404 }
        )
      }

      return NextResponse.json({ card })
    }

    if (!stageId) {
      return NextResponse.json(
        { error: 'Missing stageId parameter' },
        { status: 400 }
      )
    }

    // Get all cards for this stage with card definitions
    const { data: cards, error } = await supabase
      .from('cards')
      .select(`
        *,
        definition:card_definitions(*),
        stage:stages!inner(
          id,
          project:projects!inner(
            id,
            user_id
          )
        )
      `)
      .eq('stage_id', stageId)
      .eq('stage.project.user_id', supabaseUserId)
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching cards:', error)
      return NextResponse.json(
        { error: 'Failed to fetch cards' },
        { status: 500 }
      )
    }

    return NextResponse.json({ cards })
  } catch (error) {
    console.error('Get cards error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { stageId, cardType, content, position, autoPopulate } = body

    if (!stageId || !cardType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)

    // Verify user owns this stage's project
    const { data: stage, error: stageError } = await supabase
      .from('stages')
      .select(`
        id,
        stage_number,
        stage_name,
        project:projects!inner(
          id,
          user_id,
          name,
          description
        )
      `)
      .eq('id', stageId)
      .eq('project.user_id', supabaseUserId)
      .single()

    if (stageError || !stage) {
      return NextResponse.json(
        { error: 'Stage not found or unauthorized' },
        { status: 404 }
      )
    }

    const stageProject = Array.isArray(stage.project)
      ? stage.project[0]
      : stage.project

    if (!stageProject) {
      console.error('Stage is missing related project information', {
        stageId,
        stage,
      })
      return NextResponse.json(
        { error: 'Stage project relationship is invalid' },
        { status: 500 }
      )
    }

    const initialContent =
      content && Object.keys(content).length > 0 ? content : {}

    const shouldAutoGenerate =
      autoPopulate || !content || Object.keys(content || {}).length === 0

    // Se não precisa auto-gerar, cria o card diretamente
    if (!shouldAutoGenerate) {
      const { data: card, error: createError } = await supabase
        .from('cards')
        .insert({
          stage_id: stageId,
          card_type: cardType,
          content: initialContent,
          position: position ?? 0,
        })
        .select()
        .single()

      if (createError || !card) {
        console.error('Error creating card:', createError)
        return NextResponse.json(
          { error: 'Failed to create card' },
          { status: 500 }
        )
      }

      return NextResponse.json({ card }, { status: 201 })
    }

    // Se precisa auto-gerar, cria o card vazio primeiro (necessário para ter o card_id)
    const { data: tempCard, error: createError } = await supabase
      .from('cards')
      .insert({
        stage_id: stageId,
        card_type: cardType,
        content: {},
        position: position ?? 0,
      })
      .select()
      .single()

    if (createError || !tempCard) {
      console.error('Error creating temporary card:', createError)
      return NextResponse.json(
        { error: 'Failed to create card' },
        { status: 500 }
      )
    }

    // Dispara a geração com IA em background para não bloquear o usuário
    const baselineContent = buildBaselineContent(cardType, stageProject)

    const { data: seededCard, error: seedError } = await supabase
      .from('cards')
      .update({
        content: baselineContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tempCard.id)
      .select()
      .single()

    if (seedError || !seededCard) {
      console.error('Error seeding baseline card content:', seedError)
    }

    scheduleAutoPopulateCard({
      projectId: stageProject.id,
      stageId: stage.id,
      stageNumber: stage.stage_number,
      stageName: stage.stage_name,
      cardType,
      userId,
      cardId: tempCard.id,
    })

    return NextResponse.json(
      {
        card: seededCard || tempCard,
        processing: true,
      },
      { status: 202 }
    )
  } catch (error) {
    console.error('Create card error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { cardId, content, position } = body

    if (!cardId) {
      return NextResponse.json(
        { error: 'Missing cardId' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)

    // Verify user owns this card
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select(`
        id,
        stage:stages!inner(
          id,
          project:projects!inner(
            id,
            user_id
          )
        )
      `)
      .eq('id', cardId)
      .eq('stage.project.user_id', supabaseUserId)
      .single()

    if (cardError || !card) {
      return NextResponse.json(
        { error: 'Card not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update the card
    const updateData: Record<string, unknown> = {}
    if (content !== undefined) updateData.content = content
    if (position !== undefined) updateData.position = position

    const { data: updatedCard, error: updateError } = await supabase
      .from('cards')
      .update(updateData)
      .eq('id', cardId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating card:', updateError)
      return NextResponse.json(
        { error: 'Failed to update card' },
        { status: 500 }
      )
    }

    return NextResponse.json({ card: updatedCard })
  } catch (error) {
    console.error('Update card error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    let cardId = searchParams.get('cardId')

    if (!cardId) {
      try {
        const body = await request.json()
        cardId = body?.cardId ?? null
      } catch {
        cardId = null
      }
    }

    if (!cardId) {
      return NextResponse.json(
        { error: 'Missing cardId parameter' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)

    // Verify user owns this card
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select(`
        id,
        stage:stages!inner(
          id,
          project:projects!inner(
            id,
            user_id
          )
        )
      `)
      .eq('id', cardId)
      .eq('stage.project.user_id', supabaseUserId)
      .single()

    if (cardError || !card) {
      return NextResponse.json(
        { error: 'Card not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete the card
    const { error: deleteError } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)

    if (deleteError) {
      console.error('Error deleting card:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete card' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete card error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
