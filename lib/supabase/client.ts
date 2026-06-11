import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      // Disable background token auto-refresh — it fires every ~20s and
      // triggers onAuthStateChange events that cause full-page re-renders.
      // Sessions are refreshed explicitly via getSessionOrClearToken().
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
)

export function createClient() {
  return supabase
}

export async function getSessionOrClearToken() {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error?.message?.includes('Invalid Refresh Token')) {
      await supabase.auth.signOut()
      return null
    }

    if (error) {
      throw error
    }

    return data.session
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error)

    if (message.includes('Invalid Refresh Token')) {
      await supabase.auth.signOut()
      return null
    }

    throw error
  }
}
