import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  ensureSupabaseUser,
  getServiceRoleClient,
} from '@/lib/supabase/admin'

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
        description: description?.trim() || null,
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
      const { data: ideaStage } = await supabase
        .from('stages')
        .select('id')
        .eq('project_id', project.id)
        .eq('stage_number', 1)
        .single()

      if (ideaStage?.id) {
        const ideaContent = {
          projectName: project.name,
          description: project.description ?? '',
        }

        const { error: ideaCardError } = await supabase.from('cards').insert({
          stage_id: ideaStage.id,
          card_type: 'project-name',
          content: ideaContent,
          position: 0,
        })

        if (ideaCardError) {
          console.error('Error creating default Idea card:', ideaCardError)
        }
      } else {
        console.warn('Idea stage not found for project', project.id)
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
