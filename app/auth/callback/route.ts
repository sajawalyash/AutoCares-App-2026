import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    // ✅ Fix: createClient() is async — must be awaited
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // ✅ Fix: redirect to login (with verified flag) so all user types land correctly
  return NextResponse.redirect(new URL('/auth/login?verified=true', request.url))
}
