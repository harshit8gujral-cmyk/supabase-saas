import { NextResponse } from 'next/server'
import { supabaseServer } from '@/library/supabase/server'

export async function POST() {
  const sb = supabaseServer()
  await sb.auth.signOut()
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
}
