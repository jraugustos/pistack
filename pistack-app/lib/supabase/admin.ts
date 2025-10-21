import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let serviceRoleClient: SupabaseClient | null = null

function assertEnv() {
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }
}

export function getServiceRoleClient() {
  if (!serviceRoleClient) {
    assertEnv()
    serviceRoleClient = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
      auth: {
        persistSession: false,
      },
    })
  }

  return serviceRoleClient
}

export async function ensureSupabaseUser(
  clerkUserId: string,
  supabase: SupabaseClient = getServiceRoleClient()
) {
  if (!clerkUserId) {
    throw new Error('Cannot ensure Supabase user without Clerk user ID')
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkUserId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (user?.id) {
    return user.id as string
  }

  const { data: insertedUser, error: insertError } = await supabase
    .from('users')
    .insert({
      clerk_id: clerkUserId,
    })
    .select('id')
    .single()

  if (insertError) {
    if (insertError.code === '23505') {
      const { data: retryUser, error: retryError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkUserId)
        .single()

      if (retryError) {
        throw retryError
      }

      return retryUser.id as string
    }

    throw insertError
  }

  return insertedUser.id as string
}
