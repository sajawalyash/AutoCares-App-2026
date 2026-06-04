import type { User } from '@supabase/supabase-js'

export type ProfileNameFields = {
  first_name?: string | null
  last_name?: string | null
}

/** First name (or best available label) for greetings and chat personalization. */
export function getUserDisplayName(
  user: User | null | undefined,
  profile?: ProfileNameFields | null,
): string {
  if (profile?.first_name) {
    return String(profile.first_name).trim()
  }

  if (!user) return 'there'

  const meta = user.user_metadata ?? {}

  if (meta.first_name) {
    return String(meta.first_name).trim()
  }

  if (meta.full_name) {
    const first = String(meta.full_name).trim().split(/\s+/)[0]
    if (first) return first
  }

  if (user.email) {
    const local = user.email.split('@')[0]?.replace(/[._-]+/g, ' ').trim()
    if (local) {
      return local.split(/\s+/)[0] || local
    }
  }

  return 'there'
}

export function buildChatWelcomeMessage(displayName: string): string {
  return `Hello, ${displayName}! I'm your AutoCares AI Assistant. I can help with vehicle troubleshooting, OBD diagnostics, and DTC analysis. Ask me about diagnostic codes, engine issues, vehicle health, or connect your OBD scanner for real-time insights. What can I help you with today?`
}
