import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const sb = supabaseServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })

  const body = await req.json()
  const { user_id, role } = body as { user_id: string, role: 'org_admin'|'org_member'|'viewer' }

  // fetch caller org
  const { data: me } = await sb.from('profiles').select('org_id, role').eq('id', user.id).single()
  if (!me || me.role !== 'org_admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { error } = await sb.from('profiles').update({ role }).eq('id', user_id).eq('org_id', me.org_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
