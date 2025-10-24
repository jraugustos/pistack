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

    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const stageParam = searchParams.get('stage')
    const stageNumber = Number(stageParam)

    if (!projectId || Number.isNaN(stageNumber)) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    if (stageNumber < 1 || stageNumber > 6) {
      return NextResponse.json(
        { error: 'Invalid stage number' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)

    // Ensure project belongs to the authenticated user
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

    // Retrieve thread record for project + stage
    const { data: threadRows, error: threadError } = await supabase
      .from('ai_threads')
      .select('id, openai_thread_id')
      .eq('project_id', projectId)
      .eq('stage_number', stageNumber)
      .limit(1)

    if (threadError) {
      console.error('Error fetching AI thread history:', threadError)
      return NextResponse.json(
        { error: 'Failed to load AI history' },
        { status: 500 }
      )
    }

    const threadRecord = threadRows?.[0]

    if (!threadRecord) {
      return NextResponse.json({
        threadId: null,
        messages: [],
      })
    }

    const { data: messageRows, error: messageError } = await supabase
      .from('ai_messages')
      .select('id, role, content, created_at')
      .eq('thread_id', threadRecord.id)
      .order('created_at', { ascending: true })

    if (messageError) {
      console.error('Error fetching AI messages:', messageError)
      return NextResponse.json(
        { error: 'Failed to load AI messages' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      threadId: threadRecord.openai_thread_id,
      messages:
        messageRows?.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          createdAt: message.created_at,
        })) ?? [],
    })
  } catch (error) {
    console.error('AI history error:', error)
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
    const projectId = searchParams.get('projectId')
    const stageParam = searchParams.get('stage')
    const stageNumber = Number(stageParam)

    if (!projectId || Number.isNaN(stageNumber)) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    if (stageNumber < 1 || stageNumber > 6) {
      return NextResponse.json(
        { error: 'Invalid stage number' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)

    // Ensure project belongs to the authenticated user
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

    // Get thread record for this project + stage
    const { data: threadRows, error: threadError } = await supabase
      .from('ai_threads')
      .select('id')
      .eq('project_id', projectId)
      .eq('stage_number', stageNumber)
      .limit(1)

    if (threadError) {
      console.error('Error fetching AI thread:', threadError)
      return NextResponse.json(
        { error: 'Failed to clear chat history' },
        { status: 500 }
      )
    }

    const threadRecord = threadRows?.[0]

    // If no thread exists, nothing to delete
    if (!threadRecord) {
      return NextResponse.json({ success: true, deleted: 0 })
    }

    // Delete all messages for this thread
    const { error: deleteError, count } = await supabase
      .from('ai_messages')
      .delete({ count: 'exact' })
      .eq('thread_id', threadRecord.id)

    if (deleteError) {
      console.error('Error deleting AI messages:', deleteError)
      return NextResponse.json(
        { error: 'Failed to clear chat history' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      deleted: count ?? 0,
    })
  } catch (error) {
    console.error('Clear chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
