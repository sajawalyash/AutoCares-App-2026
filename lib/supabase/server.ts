import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client for direct database operations.
 * For client-side operations, use the browser client from './client.ts'
 */
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
