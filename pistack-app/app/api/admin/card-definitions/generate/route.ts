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

// Helper function to provide category-specific guidance
function getCategoryGuidance(category: CardCategory): string {
  const guidance: Record<CardCategory, string> = {
    ideation: 'Focus on creative exploration and brainstorming. Use more open-ended textarea fields. Less structure, more freedom.',
    research: 'Data collection and analysis focus. Mix structured and unstructured fields. Include demographics, behaviors, insights.',
    planning: 'Structured with clear outcomes. Include dates, numbers, priorities. Often has checkboxes for status tracking.',
    design: 'Visual and technical specifications. Include file fields for mockups/screenshots and URLs for design references.',
    development: 'Technical details and specifications. Include URLs for repos/docs. Use select for technical choices.',
    marketing: 'Metrics and outcomes focus. Target audience details, campaign info, and performance metrics.'
  }
  return guidance[category] || 'General purpose card for project management.'
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

    // Create prompt for OpenAI (based on docs/assistant-instructions)
    const prompt = `You are a specialized AI assistant for PIStack, helping administrators create card definitions for project management.

**User Request**:
Description: "${description}"
Category: ${category}
Icon: ${icon}

**Your Task**: Generate a structured card definition based on this description.

**Output Format** (CRITICAL - Return ONLY this JSON, no markdown):
{
  "name": "Card Name in Portuguese (max 50 chars)",
  "fields": [
    {
      "name": "Field Name (Portuguese, specific)",
      "type": "text|textarea|number|date|select|checkbox|file|url",
      "placeholder": "Ex: helpful example",
      "required": true|false,
      "options": ["Only for select type"]
    }
  ],
  "suggestion": "1-2 sentences explaining your choices"
}

**Field Types - Decision Guide**:
- text: Short text (names, titles, ~100 chars)
- textarea: Long text (descriptions, notes, paragraphs)
- number: Numeric values (age, budget, quantity)
- date: Specific dates (deadlines, launch dates)
- select: 2-10 predefined options (priority, status)
- checkbox: Boolean yes/no (completed, validated)
- file: File URLs (documents, images, attachments)
- url: Web links (websites, references)

**Rules**:
1. Use Portuguese for ALL field names and placeholders
2. Create 3-8 fields (sweet spot: 4-6)
3. Mark ONLY 1-3 essential fields as required
4. Provide helpful placeholders with "Ex:" prefix
5. For select: provide 2-10 logical options
6. Field names must be specific: "Nome do Cliente" not "Nome"
7. Order fields logically (most important first)

**Quality Checklist**:
✓ All names in Portuguese
✓ 3-8 total fields
✓ 1-3 required fields
✓ Specific, clear field names
✓ Helpful placeholder examples
✓ Select fields have 2-10 options
✓ Suggestion explains reasoning

**Category Context** (${category}):
${getCategoryGuidance(category)}

Return ONLY the JSON object. No markdown, no code blocks, no explanations outside JSON.`

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
