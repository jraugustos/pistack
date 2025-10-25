import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getServiceRoleClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/card-definitions/[id]
 * Get a specific card definition by ID (PUBLIC)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const supabase = getServiceRoleClient()

    const { data: definition, error } = await supabase
      .from('card_definitions')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !definition) {
      return NextResponse.json(
        { error: 'Card definition not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ definition })
  } catch (error) {
    console.error('[CardDefinitions API] GET [id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/card-definitions/[id]
 * Update a card definition (ADMIN ONLY)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { id } = params
    const body = await request.json()
    const { name, description, category, icon, fields } = body

    // Build update object (only include provided fields)
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (category !== undefined) updates.category = category
    if (icon !== undefined) updates.icon = icon
    if (fields !== undefined) {
      // Validate fields if provided
      if (!Array.isArray(fields)) {
        return NextResponse.json(
          { error: 'Fields must be an array' },
          { status: 400 }
        )
      }
      updates.fields = fields
    }

    // Validate category if provided
    if (category) {
      const validCategories = [
        'ideation',
        'research',
        'planning',
        'design',
        'development',
        'marketing',
      ]
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        )
      }
    }

    const supabase = getServiceRoleClient()

    const { data: definition, error } = await supabase
      .from('card_definitions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error || !definition) {
      console.error('[CardDefinitions API] Error updating:', error)
      return NextResponse.json(
        { error: 'Failed to update card definition' },
        { status: 500 }
      )
    }

    return NextResponse.json({ definition })
  } catch (error: any) {
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    console.error('[CardDefinitions API] PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/card-definitions/[id]
 * Delete a card definition (ADMIN ONLY)
 * ⚠️ Warning: This will fail if the definition is used in any template_cards
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const { id } = params

    const supabase = getServiceRoleClient()

    // Check if definition is used in any templates
    const { data: usageCheck } = await supabase
      .from('template_cards')
      .select('id')
      .eq('card_definition_id', id)
      .limit(1)

    if (usageCheck && usageCheck.length > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete card definition: it is used in one or more templates',
        },
        { status: 400 }
      )
    }

    // Check if definition is used in any actual cards
    const { data: cardsUsage } = await supabase
      .from('cards')
      .select('id')
      .eq('card_definition_id', id)
      .limit(1)

    if (cardsUsage && cardsUsage.length > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete card definition: it is used in existing project cards',
        },
        { status: 400 }
      )
    }

    // Delete the definition
    const { error } = await supabase
      .from('card_definitions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[CardDefinitions API] Error deleting:', error)
      return NextResponse.json(
        { error: 'Failed to delete card definition' },
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

    console.error('[CardDefinitions API] DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
