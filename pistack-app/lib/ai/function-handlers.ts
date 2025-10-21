/**
 * Function handlers for OpenAI Assistant Function Calling
 * These functions execute the actual operations requested by the AI
 */

import { getServiceRoleClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import {
  CreateCardArgs,
  UpdateCardArgs,
  SuggestContentArgs,
  ValidateStageArgs,
  GetProjectContextArgs,
  CARD_TYPES_BY_STAGE,
  CARD_TYPE_DESCRIPTIONS,
} from './functions'

/**
 * Creates a new card in the database
 */
export async function handleCreateCard(
  args: CreateCardArgs,
  userId: string,
  projectId: string
) {
  try {
    const supabase = getServiceRoleClient()

    // Validate stage exists for this project
    const { data: stages } = await supabase
      .from('stages')
      .select('id')
      .eq('project_id', projectId)
      .eq('stage_number', args.stage)
      .single()

    if (!stages) {
      return {
        success: false,
        error: `Stage ${args.stage} not found for this project`,
      }
    }

    // Check if card type is valid for this stage
    const validTypes = CARD_TYPES_BY_STAGE[args.stage]
    if (!validTypes?.includes(args.card_type)) {
      return {
        success: false,
        error: `Card type "${args.card_type}" is not valid for stage ${args.stage}`,
      }
    }

    // Check if card already exists
    const { data: existingCard } = await supabase
      .from('cards')
      .select('id')
      .eq('stage_id', stages.id)
      .eq('card_type', args.card_type)
      .single()

    if (existingCard) {
      return {
        success: false,
        error: `Card of type "${args.card_type}" already exists in stage ${args.stage}. Use update_card instead.`,
        card_id: existingCard.id,
      }
    }

    // Get next position
    const { count } = await supabase
      .from('cards')
      .select('*', { count: 'exact', head: true })
      .eq('stage_id', stages.id)

    // Create the card
    const { data: newCard, error } = await supabase
      .from('cards')
      .insert({
        stage_id: stages.id,
        card_type: args.card_type,
        content: args.content,
        position: count || 0,
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: `Database error: ${error.message}`,
      }
    }

    return {
      success: true,
      card_id: newCard.id,
      card_type: newCard.card_type,
      content: newCard.content,
      message: `Card "${args.card_type}" created successfully in stage ${args.stage}`,
    }
  } catch (error) {
    console.error('Error in handleCreateCard:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Updates an existing card
 */
export async function handleUpdateCard(
  args: UpdateCardArgs,
  userId: string,
  projectId: string
) {
  try {
    const supabase = getServiceRoleClient()

    // Verify card exists and belongs to this project
    const { data: card, error: fetchError } = await supabase
      .from('cards')
      .select('id, card_type, stage_id, stages(project_id)')
      .eq('id', args.card_id)
      .single()

    if (fetchError || !card) {
      return {
        success: false,
        error: 'Card not found',
      }
    }

    const cardStage = Array.isArray(card.stages)
      ? card.stages[0]
      : card.stages

    // Verify card belongs to this project
    if (!cardStage || cardStage.project_id !== projectId) {
      return {
        success: false,
        error: 'Card does not belong to this project',
      }
    }

    // Update the card
    const { data: updatedCard, error: updateError } = await supabase
      .from('cards')
      .update({
        content: args.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', args.card_id)
      .select()
      .single()

    if (updateError) {
      return {
        success: false,
        error: `Database error: ${updateError.message}`,
      }
    }

    return {
      success: true,
      card_id: updatedCard.id,
      card_type: updatedCard.card_type,
      content: updatedCard.content,
      message: `Card "${card.card_type}" updated successfully`,
    }
  } catch (error) {
    console.error('Error in handleUpdateCard:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Suggests content for a card type based on project context
 */
export async function handleSuggestContent(
  args: SuggestContentArgs,
  userId: string,
  projectId: string
) {
  try {
    const supabase = getServiceRoleClient()

    // Get project context (all existing cards)
    const { data: project } = await supabase
      .from('projects')
      .select('name, description')
      .eq('id', projectId)
      .single()

    const { data: stages } = await supabase
      .from('stages')
      .select('id, stage_number, cards(*)')
      .eq('project_id', projectId)
      .order('stage_number')

    // Build context string
    const existingCards: Record<string, any> = {}
    stages?.forEach((stage) => {
      stage.cards?.forEach((card: any) => {
        existingCards[card.card_type] = card.content
      })
    })

    return {
      success: true,
      card_type: args.card_type,
      description: CARD_TYPE_DESCRIPTIONS[args.card_type] || 'Card type description',
      project_context: {
        project_name: project?.name,
        project_description: project?.description,
        existing_cards: existingCards,
      },
      message: `Context for "${args.card_type}" retrieved. Use this information to suggest relevant content.`,
    }
  } catch (error) {
    console.error('Error in handleSuggestContent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Validates if a stage is complete and consistent
 */
export async function handleValidateStage(
  args: ValidateStageArgs,
  userId: string,
  projectId: string
) {
  try {
    const supabase = getServiceRoleClient()

    // Get stage and its cards
    const { data: stage } = await supabase
      .from('stages')
      .select('id, stage_number, cards(*)')
      .eq('project_id', projectId)
      .eq('stage_number', args.stage)
      .single()

    if (!stage) {
      return {
        success: false,
        error: `Stage ${args.stage} not found`,
      }
    }

    // Check which cards exist
    const expectedCardTypes = CARD_TYPES_BY_STAGE[args.stage] || []
    const existingCardTypes = stage.cards?.map((c: any) => c.card_type) || []
    const missingCards = expectedCardTypes.filter(
      (type) => !existingCardTypes.includes(type)
    )

    // Check which cards are empty
    const emptyCards = stage.cards
      ?.filter((card: any) => {
        const content = card.content
        if (!content) return true
        // Check if all values in content are empty
        return Object.values(content).every(
          (val) => !val || (typeof val === 'string' && val.trim() === '')
        )
      })
      .map((card: any) => card.card_type) || []

    const isComplete = missingCards.length === 0 && emptyCards.length === 0
    const completionPercentage = Math.round(
      ((expectedCardTypes.length - missingCards.length - emptyCards.length) /
        expectedCardTypes.length) *
        100
    )

    return {
      success: true,
      stage: args.stage,
      is_complete: isComplete,
      completion_percentage: completionPercentage,
      total_cards: expectedCardTypes.length,
      existing_cards: existingCardTypes.length,
      missing_cards: missingCards,
      empty_cards: emptyCards,
      message: isComplete
        ? `Stage ${args.stage} is complete! All cards are filled.`
        : `Stage ${args.stage} is ${completionPercentage}% complete. ${missingCards.length} cards missing, ${emptyCards.length} cards empty.`,
    }
  } catch (error) {
    console.error('Error in handleValidateStage:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Gets the complete project context including all cards
 */
export async function handleGetProjectContext(
  args: GetProjectContextArgs,
  userId: string,
  projectId: string
) {
  try {
    const supabase = await createServerClient()

    // Get project with all stages and cards
    const { data: project } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        description,
        created_at,
        stages (
          id,
          stage_number,
          cards (
            id,
            card_type,
            content,
            created_at,
            updated_at
          )
        )
      `)
      .eq('id', projectId)
      .single()

    if (!project) {
      return {
        success: false,
        error: 'Project not found',
      }
    }

    // Organize cards by stage
    const cardsByStage: Record<number, any[]> = {}
    project.stages?.forEach((stage: any) => {
      cardsByStage[stage.stage_number] = stage.cards || []
    })

    // Calculate overall completion
    let totalExpectedCards = 0
    let totalExistingCards = 0

    Object.keys(CARD_TYPES_BY_STAGE).forEach((stageNum) => {
      const num = parseInt(stageNum)
      const expected = CARD_TYPES_BY_STAGE[num].length
      const existing = cardsByStage[num]?.filter((card: any) => {
        const content = card.content
        return content && Object.values(content).some((val) => val)
      }).length || 0

      totalExpectedCards += expected
      totalExistingCards += existing
    })

    const overallCompletion = Math.round(
      (totalExistingCards / totalExpectedCards) * 100
    )

    return {
      success: true,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        created_at: project.created_at,
      },
      cards_by_stage: cardsByStage,
      completion: {
        overall_percentage: overallCompletion,
        total_expected_cards: totalExpectedCards,
        total_existing_cards: totalExistingCards,
      },
      message: `Project context loaded. ${overallCompletion}% complete (${totalExistingCards}/${totalExpectedCards} cards).`,
    }
  } catch (error) {
    console.error('Error in handleGetProjectContext:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Main router for function calls
 */
export async function executeFunctionCall(
  functionName: string,
  functionArgs: string,
  userId: string,
  projectId: string
): Promise<any> {
  try {
    const args = JSON.parse(functionArgs)

    switch (functionName) {
      case 'create_card':
        return await handleCreateCard(args, userId, projectId)

      case 'update_card':
        return await handleUpdateCard(args, userId, projectId)

      case 'suggest_content':
        return await handleSuggestContent(args, userId, projectId)

      case 'validate_stage':
        return await handleValidateStage(args, userId, projectId)

      case 'get_project_context':
        return await handleGetProjectContext(args, userId, projectId)

      default:
        return {
          success: false,
          error: `Unknown function: ${functionName}`,
        }
    }
  } catch (error) {
    console.error('Error executing function call:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
