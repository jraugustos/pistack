import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  ensureSupabaseUser,
  getServiceRoleClient,
} from '@/lib/supabase/admin'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitForStageId(
  supabase: ReturnType<typeof getServiceRoleClient>,
  projectId: string,
  stageNumber: number,
  retries = 5,
  delayMs = 150
) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const { data, error } = await supabase
      .from('stages')
      .select('id')
      .eq('project_id', projectId)
      .eq('stage_number', stageNumber)
      .maybeSingle()

    if (error) {
      console.error('[Projects] Error fetching stage while seeding default card', {
        projectId,
        stageNumber,
        error,
      })
      return null
    }

    if (data?.id) {
      return data.id
    }

    if (attempt < retries - 1) {
      await wait(delayMs)
    }
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getServiceRoleClient()
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', supabaseUserId)
      .order('last_opened_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Get projects error:', error)
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
    const { name, description } = body

    const trimmedDescription = description?.trim() ?? ''

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: supabaseUserId,
        name: name.trim(),
        description: trimmedDescription || null,
        metadata: {},
      })
      .select()
      .single()

    if (projectError) {
      console.error('Error creating project:', projectError)
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      )
    }

    // Ensure Idea card is created with initial project data
    try {
      const ideaStageId = await waitForStageId(supabase, project.id, 1)

      if (ideaStageId) {
        const ideaContent = {
          projectName: project.name,
          description: trimmedDescription,
        }

        const { error: ideaCardError } = await supabase.from('cards').insert({
          stage_id: ideaStageId,
          card_type: 'project-name',
          content: ideaContent,
          position: 0,
        })

        if (ideaCardError) {
          console.error('Error creating default Idea card:', ideaCardError)
        }
      } else {
        console.warn('Idea stage not found after retries for project', project.id)
      }
    } catch (ideaError) {
      console.error('Unexpected error creating Idea card:', ideaError)
    }

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Create project error:', error)
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
    let projectId = searchParams.get('projectId')

    if (!projectId) {
      try {
        const body = await request.json()
        projectId = body?.projectId ?? null
      } catch {
        projectId = null
      }
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId parameter' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', supabaseUserId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 404 }
      )
    }

    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (deleteError) {
      console.error('Error deleting project:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
