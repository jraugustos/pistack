import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { executeFunctionCall } from '@/lib/ai/function-handlers'
import { ensureSupabaseUser } from '@/lib/supabase/admin'
import {
  STAGE_ASSISTANT_ENV_MAP,
  getOpenAIClient,
  getStageAssistantId,
} from '@/lib/ai/assistants'

export async function POST(request: NextRequest) {
  try {
    console.log('AI Chat API called')
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    let userId: string | null = null
    
    try {
      const authResult = await auth()
      userId = authResult.userId
      console.log('Auth result:', { userId })
    } catch (authError) {
      console.error('Auth error:', authError)
      // Em caso de erro de autenticação, tentar continuar sem auth para debug
      console.log('Continuing without authentication for debugging...')
    }

    if (!userId) {
      console.log('No user ID found - user not authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', userId)

    const body = await request.json()
    const { message, projectId, activeStage, threadId } = body

    const stageNumber = Number(activeStage)

    console.log('Request body:', {
      message,
      projectId,
      activeStage,
      threadId,
      stageNumber,
    })

    if (!message || !projectId || Number.isNaN(stageNumber)) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    if (stageNumber < 1 || stageNumber > 6) {
      console.log('Invalid stage number provided')
      return NextResponse.json(
        { error: 'Invalid stage number' },
        { status: 400 }
      )
    }

    // Verify user owns this project
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    console.log('Supabase client created, verifying project...')
    console.log('Project ID:', projectId, 'User ID:', userId)
    const supabaseUserId = await ensureSupabaseUser(userId, supabase)
    
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', supabaseUserId)
      .single()

    console.log('Project query result:', { project, projectError })

    if (projectError || !project) {
      console.log('Project verification failed:', projectError)
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 404 }
      )
    }

    console.log('Project verified:', project.id)

    const openai = getOpenAIClient()

    // Get or create thread per project + stage
    let currentThreadId: string | null = threadId ?? null
    let threadRecord:
      | {
          id: string
          openai_thread_id: string
        }
      | null = null

    console.log('Fetching existing AI thread record...')

    const { data: threadRows, error: threadQueryError } = await supabase
      .from('ai_threads')
      .select('id, openai_thread_id')
      .eq('project_id', projectId)
      .eq('stage_number', stageNumber)
      .limit(1)

    if (threadQueryError) {
      console.error('Error retrieving AI thread record:', threadQueryError)
    }

    if (threadRows && threadRows.length > 0) {
      threadRecord = threadRows[0]
      if (!currentThreadId) {
        currentThreadId = threadRecord.openai_thread_id
      }
    }

    if (currentThreadId && threadRecord && threadRecord.openai_thread_id !== currentThreadId) {
      console.log('Thread ID differs from stored record. Syncing...')
      const { data: updatedThread, error: updateThreadError } = await supabase
        .from('ai_threads')
        .update({ openai_thread_id: currentThreadId })
        .eq('id', threadRecord.id)
        .select('id, openai_thread_id')
        .single()

      if (updateThreadError) {
        console.error('Error syncing AI thread record:', updateThreadError)
      } else if (updatedThread) {
        threadRecord = updatedThread
      }
    }

    if (currentThreadId && !threadRecord) {
      console.log('No thread record found. Storing provided thread ID.')
      const { data: insertedThread, error: insertThreadError } = await supabase
        .from('ai_threads')
        .insert({
          project_id: projectId,
          stage_number: stageNumber,
          openai_thread_id: currentThreadId,
        })
        .select('id, openai_thread_id')
        .single()

      if (insertThreadError) {
        console.error('Error storing provided thread ID:', insertThreadError)
      } else if (insertedThread) {
        threadRecord = insertedThread
      }
    }

    if (!currentThreadId) {
      const thread = await openai.beta.threads.create()
      currentThreadId = thread.id

      console.log('Created new thread:', currentThreadId)

      const { data: insertedThread, error: insertNewThreadError } = await supabase
        .from('ai_threads')
        .insert({
          project_id: projectId,
          stage_number: stageNumber,
          openai_thread_id: currentThreadId,
        })
        .select('id, openai_thread_id')
        .single()

      if (insertNewThreadError) {
        console.error('Error storing new thread record:', insertNewThreadError)
      } else if (insertedThread) {
        threadRecord = insertedThread
      }
    }

    if (!threadRecord) {
      const { data: refreshedThreadRows } = await supabase
        .from('ai_threads')
        .select('id, openai_thread_id')
        .eq('project_id', projectId)
        .eq('stage_number', stageNumber)
        .limit(1)

      threadRecord = refreshedThreadRows?.[0] ?? null
    }

    if (!currentThreadId) {
      return NextResponse.json(
        { error: 'Failed to create or retrieve thread' },
        { status: 500 }
      )
    }

    // Add message to thread
    await openai.beta.threads.messages.create(currentThreadId, {
      role: 'user',
      content: message,
    })

    if (threadRecord?.id) {
      const { error: userMessageError } = await supabase
        .from('ai_messages')
        .insert({
          thread_id: threadRecord.id,
          role: 'user',
          content: message,
        })

      if (userMessageError) {
        console.error('Error storing user AI message:', userMessageError)
      }
    }

    // Get appropriate assistant for the stage
    const assistantId = getStageAssistantId(stageNumber)
    console.log('Assistant lookup:', {
      activeStage: stageNumber,
      assistantId,
      envKeys: STAGE_ASSISTANT_ENV_MAP,
    })
    
    if (!assistantId) {
      console.error(`No assistant configured for stage ${activeStage}`)
      console.error('Assistant env map:', STAGE_ASSISTANT_ENV_MAP)
      return NextResponse.json(
        {
          error: `No AI assistant configured for stage ${stageNumber}. Check environment variables.`,
        },
        { status: 400 }
      )
    }

    console.log(`Using assistant ${assistantId} for stage ${stageNumber}`)

    // Run the assistant
    let initialRun
    try {
      initialRun = await openai.beta.threads.runs.create(currentThreadId, {
        assistant_id: assistantId,
      })
      console.log('Run created successfully:', { runId: initialRun.id, runThreadId: initialRun.thread_id })
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError)
      return NextResponse.json(
        { error: `OpenAI API error: ${openaiError instanceof Error ? openaiError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    console.log('Run created:', { runId: initialRun.id, runThreadId: initialRun.thread_id, currentThreadId })

    if (!initialRun.id || !initialRun.thread_id) {
      console.error('Run creation failed - missing ID or thread_id:', initialRun)
      return NextResponse.json(
        { error: 'Failed to create run' },
        { status: 500 }
      )
    }

    // Store the original run ID to avoid losing it
    const originalRunId = initialRun.id
    const originalThreadId = currentThreadId // Use currentThreadId instead of initialRun.thread_id

    console.log('Stored original IDs:', { originalRunId, originalThreadId, initialRunThreadId: initialRun.thread_id })

    // Poll for completion and handle function calls
    const maxAttempts = 30 // 30 seconds timeout
    let attempts = 0
    const functionCallResults: Array<{ call: string; result: any }> = []
    let currentRun = initialRun

    while (attempts < maxAttempts) {
      // Wait before polling
      await new Promise((resolve) => setTimeout(resolve, 1000))
      attempts++

      console.log(`Polling attempt ${attempts}: currentThreadId=${currentThreadId}, originalRunId=${originalRunId}, originalThreadId=${originalThreadId}`)
      console.log('About to call retrieve with:', { threadId: originalThreadId, runId: originalRunId })

      // Get current run status - use the stored original IDs
      // Note: OpenAI API expects (thread_id, run_id) in this order
      currentRun = await openai.beta.threads.runs.retrieve(originalRunId, {
        thread_id: originalThreadId,
      })

      // Handle different run statuses
      if (currentRun.status === 'completed') {
        break
      } else if (currentRun.status === 'requires_action') {
        // Handle function calls
        const toolCalls = currentRun.required_action?.submit_tool_outputs?.tool_calls

        if (toolCalls && toolCalls.length > 0) {
          const toolOutputs = await Promise.all(
            toolCalls.map(async (toolCall) => {
              console.log('Function call:', toolCall.function.name, toolCall.function.arguments)

              // Execute the function
              const result = await executeFunctionCall(
                toolCall.function.name,
                toolCall.function.arguments,
                userId,
                projectId
              )

              console.log('Function result:', result)

              // Track function calls
              functionCallResults.push({
                call: toolCall.function.name,
                result,
              })

              return {
                tool_call_id: toolCall.id,
                output: JSON.stringify(result),
              }
            })
          )

          // Submit tool outputs back to the run
          currentRun = await openai.beta.threads.runs.submitToolOutputs(originalRunId, {
            thread_id: originalThreadId,
            tool_outputs: toolOutputs,
          })
        }
      } else if (currentRun.status === 'failed' || currentRun.status === 'cancelled' || currentRun.status === 'expired') {
        return NextResponse.json(
          { error: `Run ${currentRun.status}: ${currentRun.last_error?.message || 'Unknown error'}` },
          { status: 500 }
        )
      }
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 408 }
      )
    }

    if (currentRun.status !== 'completed') {
      return NextResponse.json(
        { error: `Run failed with status: ${currentRun.status}` },
        { status: 500 }
      )
    }

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(originalThreadId)
    const lastMessage = messages.data[0]

    if (lastMessage.role !== 'assistant') {
      return NextResponse.json(
        { error: 'No assistant response found' },
        { status: 500 }
      )
    }

    // Extract text content
    const textContent = lastMessage.content.find(
      (content) => content.type === 'text'
    )
    const responseText =
      textContent?.type === 'text' ? textContent.text.value : ''

    if (threadRecord?.id && responseText.trim()) {
      const { error: assistantMessageError } = await supabase
        .from('ai_messages')
        .insert({
          thread_id: threadRecord.id,
          role: 'assistant',
          content: responseText,
        })

      if (assistantMessageError) {
        console.error('Error storing assistant AI message:', assistantMessageError)
      }
    }

    return NextResponse.json({
      response: responseText,
      threadId: originalThreadId,
      messageId: lastMessage.id,
      functionCalls: functionCallResults.length > 0 ? functionCallResults : undefined,
    })
  } catch (error) {
    console.error('AI Chat Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
