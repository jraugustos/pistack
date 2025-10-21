import OpenAI from 'openai'

export const STAGE_ASSISTANT_ENV_MAP: Record<number, string> = {
  1: 'OPENAI_ASSISTANT_ETAPA_1',
  2: 'OPENAI_ASSISTANT_ETAPA_2',
  3: 'OPENAI_ASSISTANT_ETAPA_3',
  4: 'OPENAI_ASSISTANT_ETAPA_4',
  5: 'OPENAI_ASSISTANT_ETAPA_5',
  6: 'OPENAI_ASSISTANT_ETAPA_6',
}

export function getStageAssistantEnvKey(stageNumber: number) {
  return STAGE_ASSISTANT_ENV_MAP[stageNumber]
}

export function getStageAssistantId(stageNumber: number) {
  const envKey = getStageAssistantEnvKey(stageNumber)
  if (!envKey) return undefined
  return process.env[envKey]
}

export function getOrchestratorAssistantId() {
  return process.env.OPENAI_ORCHESTRATOR_ASSISTANT
}

export function assertOpenAIKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY environment variable')
  }
}

let openaiClient: OpenAI | null = null

export function getOpenAIClient() {
  if (!openaiClient) {
    assertOpenAIKey()
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })
  }
  return openaiClient
}
