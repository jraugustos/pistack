import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  ensureSupabaseUser,
  getServiceRoleClient,
} from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(
        `
          id,
          name,
          description,
          metadata,
          created_at,
          updated_at,
          stages (
            id,
            stage_number,
            stage_name,
            stage_color,
            cards (
              id,
              card_type,
              content,
              position,
              created_at,
              updated_at
            )
          )
        `
      )
      .eq('id', projectId)
      .eq('user_id', supabaseUserId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 404 }
      )
    }

    const { data: threadRows, error: threadError } = await supabase
      .from('ai_threads')
      .select(
        `
          id,
          stage_number,
          openai_thread_id,
          ai_messages (
            id,
            role,
            content,
            created_at
          )
        `
      )
      .eq('project_id', projectId)

    if (threadError) {
      console.error('Error fetching AI threads for export:', threadError)
    }

    const sortedStages =
      project.stages
        ?.map((stage: any) => ({
          ...stage,
          cards: (stage.cards ?? []).sort(
            (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
          ),
        }))
        .sort(
          (a: any, b: any) =>
            (a.stage_number ?? 0) - (b.stage_number ?? 0)
        ) ?? []

    const aiHistory = (threadRows ?? []).map((thread) => ({
      stageNumber: thread.stage_number,
      openaiThreadId: thread.openai_thread_id,
      messages: (thread.ai_messages ?? [])
        .sort(
          (a: any, b: any) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
        )
        .map((message: any) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          createdAt: message.created_at,
        })),
    }))

    const payload = {
      exportedAt: new Date().toISOString(),
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        metadata: project.metadata,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        stages: sortedStages,
      },
      aiHistory,
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Project export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
