import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import OpenAI from 'openai'
import type { CardField, CardCategory } from '@/lib/types/card-definition'

/**
 * POST /api/admin/card-definitions/generate
 * Generate card definition using OpenAI
 * PHASE 6.2: AI Card Creator
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface GenerateRequest {
  description: string
  category: CardCategory
  icon: string
}

interface AIGeneratedCard {
  name: string
  fields: CardField[]
  suggestion: string
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body: GenerateRequest = await request.json()
    const { description, category, icon } = body

    if (!description || !category) {
      return NextResponse.json(
        { error: 'Description and category are required' },
        { status: 400 }
      )
    }

    // Create prompt for OpenAI
    const prompt = `You are an expert UX designer and product manager helping to create a card definition for a project management tool.

The user wants to create a card with the following description:
"${description}"

Category: ${category}
Icon: ${icon}

Based on this description, generate a card definition with:
1. A clear, concise name for the card (max 50 characters)
2. A list of fields that should be in this card
3. A brief suggestion/explanation of what was generated

For each field, specify:
- name: The field name (clear and descriptive)
- type: One of: text, textarea, number, date, select, checkbox, file, url
- placeholder: Optional helpful placeholder text
- required: Whether the field is required (boolean)
- options: Only for "select" type - array of option strings

Return ONLY a valid JSON object with this structure:
{
  "name": "Card Name",
  "fields": [
    {
      "name": "Field Name",
      "type": "text",
      "placeholder": "Optional placeholder",
      "required": true
    }
  ],
  "suggestion": "Brief explanation of what was generated and why these fields were chosen"
}

Important guidelines:
- Keep field names clear and user-friendly
- Use "text" for short inputs, "textarea" for long text
- Use "select" only when there are clear, predefined options
- Mark fields as required only if they are essential
- Keep the suggestion brief (1-2 sentences)
- Return ONLY the JSON object, no markdown formatting or code blocks`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that generates structured card definitions in JSON format. Always return valid JSON without markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const responseText = completion.choices[0]?.message?.content

    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    // Parse AI response
    let generatedCard: AIGeneratedCard
    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      generatedCard = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('[Card Generate] Failed to parse AI response:', responseText)
      throw new Error('Failed to parse AI response as JSON')
    }

    // Validate generated card structure
    if (
      !generatedCard.name ||
      !Array.isArray(generatedCard.fields) ||
      !generatedCard.suggestion
    ) {
      throw new Error('Invalid card structure from AI')
    }

    // Validate field types
    const validFieldTypes = [
      'text',
      'textarea',
      'number',
      'date',
      'select',
      'checkbox',
      'file',
      'url',
    ]

    for (const field of generatedCard.fields) {
      if (!validFieldTypes.includes(field.type)) {
        throw new Error(`Invalid field type: ${field.type}`)
      }
    }

    return NextResponse.json({ card: generatedCard })
  } catch (error: any) {
    if (error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    console.error('[Card Generate] Error:', error)
    return NextResponse.json(
      {
        error:
          error.message || 'Failed to generate card definition with AI',
      },
      { status: 500 }
    )
  }
}
