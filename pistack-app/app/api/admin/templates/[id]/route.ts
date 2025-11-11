import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getServiceRoleClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/templates/[id]
 * Get a specific template by ID (PUBLIC)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const supabase = getServiceRoleClient()

    const { data: template, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Sort stages and cards
    template.stages = template.stages
      ?.sort((a: any, b: any) => a.stage_number - b.stage_number)
      .map((stage: any) => ({
        ...stage,
        cards: stage.cards?.sort((a: any, b: any) => a.position - b.position) || [],
      }))

    return NextResponse.json({ template })
  } catch (error) {
    console.error('[Templates API] GET [id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/templates/[id]
 * Update a template (ADMIN ONLY)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { id } = params
    const body = await request.json()
    const { name, description, category, icon, stages } = body

    const supabase = getServiceRoleClient()

    // Update template basic info
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (category !== undefined) updates.category = category
    if (icon !== undefined) updates.icon = icon

    if (Object.keys(updates).length > 0) {
      const { error: templateError } = await supabase
        .from('templates')
        .update(updates)
        .eq('id', id)

      if (templateError) {
        console.error('[Templates API] Error updating template:', templateError)
        return NextResponse.json(
          { error: 'Failed to update template' },
          { status: 500 }
        )
      }
    }

    // Update stages if provided
    if (stages && Array.isArray(stages)) {
      // Delete all existing stages (cascade will delete template_cards)
      await supabase.from('template_stages').delete().eq('template_id', id)

      // Recreate stages
      for (const stageInput of stages) {
        const {
          stage_number,
          stage_name,
          stage_description,
          stage_color,
          assistant_instructions,
          card_definition_ids,
        } = stageInput

        const { data: stage, error: stageError } = await supabase
          .from('template_stages')
          .insert({
            template_id: id,
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
          return NextResponse.json(
            { error: 'Failed to update template stages' },
            { status: 500 }
          )
        }

        // Create template_cards
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
            return NextResponse.json(
              { error: 'Failed to update template cards' },
              { status: 500 }
            )
          }
        }
      }
    }

    // Fetch updated template
    const { data: updatedTemplate } = await supabase
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
      .eq('id', id)
      .single()

    return NextResponse.json({ template: updatedTemplate })
  } catch (error: any) {
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    console.error('[Templates API] PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/templates/[id]
 * Delete a template (ADMIN ONLY)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { id } = params

    const supabase = getServiceRoleClient()

    // Check if template is active
    const { data: template } = await supabase
      .from('templates')
      .select('is_active')
      .eq('id', id)
      .single()

    if (template?.is_active) {
      return NextResponse.json(
        { error: 'Cannot delete active template' },
        { status: 400 }
      )
    }

    // Check if template is used in any projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('template_id', id)
      .limit(1)

    if (projects && projects.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete template: it is used in existing projects' },
        { status: 400 }
      )
    }

    // Delete template (cascade will delete stages and template_cards)
    const { error } = await supabase.from('templates').delete().eq('id', id)

    if (error) {
      console.error('[Templates API] Error deleting:', error)
      return NextResponse.json(
        { error: 'Failed to delete template' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    console.error('[Templates API] DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
