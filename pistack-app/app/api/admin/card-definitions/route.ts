import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { requireAdmin } from '@/lib/auth/admin'
import {
  ensureSupabaseUser,
  getServiceRoleClient,
} from '@/lib/supabase/admin'

/**
 * GET /api/admin/card-definitions
 * List all card definitions (PUBLIC - anyone can read)
 * Supports filtering by category
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')

    const supabase = getServiceRoleClient()

    let query = supabase
      .from('card_definitions')
      .select('*')
      .order('created_at', { ascending: true })

    // Filter by category if provided
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data: definitions, error } = await query

    if (error) {
      console.error('[CardDefinitions API] Error fetching:', error)
      return NextResponse.json(
        { error: 'Failed to fetch card definitions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ definitions })
  } catch (error) {
    console.error('[CardDefinitions API] GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/card-definitions
 * Create a new card definition (ADMIN ONLY)
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
    const { name, description, category, icon, fields } = body

    // Validate required fields
    if (!name || !category || !icon || !fields) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: name, category, icon, fields are required',
        },
        { status: 400 }
      )
    }

    // Validate category
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

    // Validate fields structure (must be array)
    if (!Array.isArray(fields)) {
      return NextResponse.json(
        { error: 'Fields must be an array' },
        { status: 400 }
      )
    }

    // Validate each field has required properties
    for (const field of fields) {
      if (!field.name || !field.type) {
        return NextResponse.json(
          { error: 'Each field must have name and type properties' },
          { status: 400 }
        )
      }

      // Validate field type
      const validTypes = [
        'text',
        'textarea',
        'number',
        'date',
        'select',
        'checkbox',
        'file',
        'url',
      ]
      if (!validTypes.includes(field.type)) {
        return NextResponse.json(
          {
            error: `Invalid field type "${field.type}". Must be one of: ${validTypes.join(', ')}`,
          },
          { status: 400 }
        )
      }

      // If type is select, must have options
      if (field.type === 'select' && !field.options) {
        return NextResponse.json(
          { error: 'Select fields must have options array' },
          { status: 400 }
        )
      }
    }

    const supabase = getServiceRoleClient()
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)

    // Insert card definition
    const { data: definition, error } = await supabase
      .from('card_definitions')
      .insert({
        name,
        description,
        category,
        icon,
        fields,
        is_system: true, // All admin-created cards are system cards
        created_by: supabaseUserId,
      })
      .select()
      .single()

    if (error) {
      console.error('[CardDefinitions API] Error creating:', error)
      return NextResponse.json(
        { error: 'Failed to create card definition' },
        { status: 500 }
      )
    }

    return NextResponse.json({ definition }, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    console.error('[CardDefinitions API] POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
