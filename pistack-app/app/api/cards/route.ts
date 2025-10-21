import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  ensureSupabaseUser,
  getServiceRoleClient,
} from '@/lib/supabase/admin'
import { generateCardWithAssistant } from '@/lib/ai/card-autofill'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const stageId = searchParams.get('stageId')

    if (!stageId) {
      return NextResponse.json(
        { error: 'Missing stageId parameter' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)

    // Get all cards for this stage
    const { data: cards, error } = await supabase
      .from('cards')
      .select(`
        *,
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
          user_id
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

    const initialContent =
      content && Object.keys(content).length > 0 ? content : {}

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

    const shouldAutoGenerate =
      autoPopulate || !content || Object.keys(content || {}).length === 0

    if (!shouldAutoGenerate) {
      return NextResponse.json({ card }, { status: 201 })
    }

    const result = await generateCardWithAssistant({
      supabase,
      projectId: stage.project.id,
      stageId: stage.id,
      stageNumber: stage.stage_number,
      stageName: stage.stage_name,
      cardType,
      userId,
      cardId: card.id,
    })

    console.log('[AI][AutoPopulate]', {
      success: result.success,
      error: result.error,
      cardId: result.card?.id,
      cardType,
      stageNumber: stage.stage_number,
    })

    if (!result.success || !result.card) {
      if (result.error) {
        console.warn('[AI][AutoPopulate] restoring empty card due to error', {
          cardId: card.id,
          error: result.error,
        })
      }
      return NextResponse.json(
        {
          card: result.card ?? card,
          warning:
            result.error ||
            'Assistente não conseguiu preencher automaticamente. Card criado em branco.',
        },
        { status: result.success ? 201 : 202 }
      )
    }

    return NextResponse.json({ card: result.card }, { status: 201 })
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
