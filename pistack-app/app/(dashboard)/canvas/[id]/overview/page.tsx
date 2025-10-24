import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import {
  ensureSupabaseUser,
  getServiceRoleClient,
} from '@/lib/supabase/admin'
import { ProjectOverview } from '@/components/overview/project-overview'
import {
  STAGE_CARD_TYPES,
  getTotalExpectedCards,
} from '@/lib/card-constants'

interface OverviewPageProps {
  params: Promise<{
    id: string
  }>
}

interface Card {
  id: string
  card_type: string
  content: Record<string, any>
  stage_id: string
  position: number
  created_at: string
  updated_at: string
}

interface Stage {
  id: string
  project_id: string
  stage_number: number
  stage_name: string
  stage_color: string
  created_at: string
}

interface Project {
  id: string
  name: string
  description: string | null
  user_id: string
  created_at: string
  updated_at: string
  last_opened_at: string | null
}

async function getProject(
  projectId: string,
  supabaseUserId: string,
  supabase = getServiceRoleClient()
): Promise<Project | null> {
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', supabaseUserId)
    .single()

  if (error || !project) {
    return null
  }

  return project as Project
}

async function getStages(
  projectId: string,
  supabase = getServiceRoleClient()
): Promise<Stage[]> {
  const { data: stages, error } = await supabase
    .from('stages')
    .select('*')
    .eq('project_id', projectId)
    .order('stage_number', { ascending: true })

  if (error) {
    console.error('Error fetching stages:', error)
    return []
  }

  return (stages || []) as Stage[]
}

async function getAllCards(
  projectId: string,
  supabase = getServiceRoleClient()
): Promise<Card[]> {
  const { data: cards, error } = await supabase
    .from('cards')
    .select('*')
    .eq('stage_id', projectId)
    .order('position', { ascending: true })

  if (error) {
    // Try alternative query - cards might be linked to stages, not directly to project
    const stages = await getStages(projectId, supabase)
    const stageIds = stages.map((s) => s.id)

    if (stageIds.length === 0) {
      return []
    }

    const { data: stageCards, error: stageError } = await supabase
      .from('cards')
      .select('*')
      .in('stage_id', stageIds)
      .order('position', { ascending: true })

    if (stageError) {
      console.error('Error fetching cards:', stageError)
      return []
    }

    return (stageCards || []) as Card[]
  }

  return (cards || []) as Card[]
}

/**
 * Calculate completion progress for the project
 */
function calculateProgress(cards: Card[], stages: Stage[]) {
  const totalExpected = getTotalExpectedCards()
  const filledCards = cards.filter((card) => {
    const content = card.content
    if (!content) return false

    // Check if card has meaningful content
    const values = Object.values(content)
    return values.some((value) => {
      if (typeof value === 'string') return value.trim().length > 0
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object' && value !== null)
        return Object.keys(value).length > 0
      return false
    })
  })

  const completedCount = filledCards.length
  const completionPercent = Math.round((completedCount / totalExpected) * 100)

  // Calculate per-stage completion
  const stageProgress = stages.map((stage) => {
    const expectedCards = STAGE_CARD_TYPES[stage.stage_number] || []
    const stageCards = cards.filter((c) => c.stage_id === stage.id)
    const filledStageCards = stageCards.filter((card) => {
      const content = card.content
      if (!content) return false
      const values = Object.values(content)
      return values.some((value) => {
        if (typeof value === 'string') return value.trim().length > 0
        if (Array.isArray(value)) return value.length > 0
        if (typeof value === 'object' && value !== null)
          return Object.keys(value).length > 0
        return false
      })
    })

    return {
      stageNumber: stage.stage_number,
      total: expectedCards.length,
      completed: filledStageCards.length,
      isComplete: filledStageCards.length === expectedCards.length,
    }
  })

  return {
    total: totalExpected,
    completed: completedCount,
    percentage: completionPercent,
    stageProgress,
  }
}

export default async function OverviewPage({ params }: OverviewPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const { id } = await params
  const supabase = getServiceRoleClient()
  const supabaseUserId = await ensureSupabaseUser(userId, supabase)
  const project = await getProject(id, supabaseUserId, supabase)

  if (!project) {
    redirect('/projects')
  }

  const stages = await getStages(id, supabase)
  const cards = await getAllCards(id, supabase)
  const progress = calculateProgress(cards, stages)

  return (
    <ProjectOverview
      project={project}
      stages={stages}
      cards={cards}
      progress={progress}
    />
  )
}
