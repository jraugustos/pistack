import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import {
  ensureSupabaseUser,
  getServiceRoleClient,
} from '@/lib/supabase/admin'
import { CanvasWorkspace } from '@/components/canvas/canvas-workspace'

interface CanvasPageProps {
  params: {
    id: string
  }
}

async function getProject(
  projectId: string,
  supabaseUserId: string,
  supabase = getServiceRoleClient()
) {

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', supabaseUserId)
    .single()

  if (error || !project) {
    return null
  }

  // Update last_opened_at
  await supabase
    .from('projects')
    .update({ last_opened_at: new Date().toISOString() })
    .eq('id', projectId)

  return project
}

async function getStages(
  projectId: string,
  supabase = getServiceRoleClient()
) {

  const { data: stages, error } = await supabase
    .from('stages')
    .select('*')
    .eq('project_id', projectId)
    .order('stage_number', { ascending: true })

  if (error) {
    console.error('Error fetching stages:', error)
    return []
  }

  return stages || []
}

export default async function CanvasPage({ params }: CanvasPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Await params in Next.js 15
  const { id } = await params
  const supabase = getServiceRoleClient()
  const supabaseUserId = await ensureSupabaseUser(userId, supabase)
  const project = await getProject(id, supabaseUserId, supabase)

  if (!project) {
    redirect('/projects')
  }

  // Get stages for this project
  const stages = await getStages(id, supabase)

  return <CanvasWorkspace project={project} stages={stages} />
}
