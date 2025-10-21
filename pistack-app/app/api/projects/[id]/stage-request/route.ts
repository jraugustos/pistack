import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  ensureSupabaseUser,
  getServiceRoleClient,
} from '@/lib/supabase/admin'

export async function POST(
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
      .select('id, metadata')
      .eq('id', projectId)
      .eq('user_id', supabaseUserId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const description =
      typeof body.description === 'string' ? body.description.trim() : ''
    const stageNumber =
      typeof body.stageNumber === 'number'
        ? body.stageNumber
        : Number(body.stageNumber)

    if (!name) {
      return NextResponse.json(
        { error: 'Stage name is required' },
        { status: 400 }
      )
    }

    const metadata =
      (project.metadata && typeof project.metadata === 'object'
        ? project.metadata
        : {}) ?? {}

    const stageRequests = Array.isArray(metadata.stageRequests)
      ? metadata.stageRequests
      : []

    stageRequests.push({
      id: randomUUID(),
      name,
      description,
      stageNumber,
      createdAt: new Date().toISOString(),
    })

    const updatedMetadata = {
      ...metadata,
      stageRequests,
    }

    const { error: updateError } = await supabase
      .from('projects')
      .update({ metadata: updatedMetadata })
      .eq('id', projectId)

    if (updateError) {
      console.error('Error updating project metadata:', updateError)
      return NextResponse.json(
        { error: 'Failed to store stage request' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Stage request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
