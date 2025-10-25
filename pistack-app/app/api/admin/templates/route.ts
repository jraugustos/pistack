import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { requireAdmin } from '@/lib/auth/admin'
import {
  ensureSupabaseUser,
  getServiceRoleClient,
} from '@/lib/supabase/admin'

/**
 * GET /api/admin/templates
 * List all templates with their stages and cards (PUBLIC - anyone can read)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceRoleClient()

    // Fetch templates with nested stages and cards
    const { data: templates, error } = await supabase
      .from('templates')
      .select(`
        *,
        stages:template_stages(
          *,
          cards:template_cards(
            *,
            definition:card_definitions(*)
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Templates API] Error fetching:', error)
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      )
    }

    // Sort stages by stage_number and cards by position
    const templatesWithSortedData = templates?.map((template) => ({
      ...template,
      stages: template.stages
        ?.sort((a, b) => a.stage_number - b.stage_number)
        .map((stage) => ({
          ...stage,
          cards: stage.cards?.sort((a, b) => a.position - b.position) || [],
        })) || [],
    }))

    return NextResponse.json({ templates: templatesWithSortedData })
  } catch (error) {
    console.error('[Templates API] GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/templates
 * Create a new template (ADMIN ONLY)
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin()

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, category, icon, stages } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    // Validate stages if provided
    if (stages && !Array.isArray(stages)) {
      return NextResponse.json(
        { error: 'Stages must be an array' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)

    // Create template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .insert({
        name,
        description,
        category,
        icon,
        is_active: false, // New templates start inactive
        is_system: true, // Admin-created templates are system templates
        created_by: supabaseUserId,
      })
      .select()
      .single()

    if (templateError || !template) {
      console.error('[Templates API] Error creating template:', templateError)
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      )
    }

    // Create stages if provided
    if (stages && stages.length > 0) {
      for (const stageInput of stages) {
        const {
          stage_number,
          stage_name,
          stage_description,
          stage_color,
          assistant_instructions,
          card_definition_ids,
        } = stageInput

        // Create stage
        const { data: stage, error: stageError } = await supabase
          .from('template_stages')
          .insert({
            template_id: template.id,
            stage_number,
            stage_name,
            stage_description,
            stage_color: stage_color || '#7AA2FF',
            assistant_instructions,
            position: stage_number - 1,
          })
          .select()
          .single()

        if (stageError || !stage) {
          console.error('[Templates API] Error creating stage:', stageError)
          // Rollback: delete template
          await supabase.from('templates').delete().eq('id', template.id)
          return NextResponse.json(
            { error: 'Failed to create template stages' },
            { status: 500 }
          )
        }

        // Create template_cards if card_definition_ids provided
        if (card_definition_ids && Array.isArray(card_definition_ids)) {
          const templateCardsData = card_definition_ids.map(
            (cardDefId, index) => ({
              template_stage_id: stage.id,
              card_definition_id: cardDefId,
              position: index,
            })
          )

          const { error: cardsError } = await supabase
            .from('template_cards')
            .insert(templateCardsData)

          if (cardsError) {
            console.error(
              '[Templates API] Error creating template cards:',
              cardsError
            )
            // Rollback: delete template (cascade will delete stages)
            await supabase.from('templates').delete().eq('id', template.id)
            return NextResponse.json(
              { error: 'Failed to create template cards' },
              { status: 500 }
            )
          }
        }
      }
    }

    // Fetch complete template with stages and cards
    const { data: completeTemplate } = await supabase
      .from('templates')
      .select(`
        *,
        stages:template_stages(
          *,
          cards:template_cards(
            *,
            definition:card_definitions(*)
          )
        )
      `)
      .eq('id', template.id)
      .single()

    return NextResponse.json({ template: completeTemplate }, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    console.error('[Templates API] POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
