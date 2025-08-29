'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Row = { id: string; email: string; role: 'org_admin'|'org_member'|'viewer' }

export default function AdminUsers() {
  const [org, setOrg] = useState<string>(''); const [rows, setRows] = useState<Row[]>([])
  const [meRole, setMeRole] = useState<string>('')

  useEffect(() => {
    (async () => {
      const u = await supabase.auth.getUser()
      if (!u.data.user) return
      const { data: me } = await supabase.from('profiles').select('org_id, role').eq('id', u.data.user.id).single()
      setOrg(me?.org_id || ''); setMeRole(me?.role || '')
      if (!me?.org_id) return
      const { data } = await supabase.from('profiles').select('id,email,role').eq('org_id', me.org_id)
      setRows((data || []) as Row[])
    })()
  }, [])

  async function setRole(user_id: string, role: Row['role']) {
    const res = await fetch('/api/admin/set-role', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ user_id, role }) })
    if (res.ok) setRows(r => r.map(x => x.id === user_id ? { ...x, role } : x))
  }

  if (!org) return <div className="p-6">Loading…</div>
  if (meRole !== 'org_admin') return <div className="p-6">Forbidden</div>

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-semibold">Users</h1>
      <table className="min-w-full text-sm border rounded">
        <thead><tr><th className="p-2 text-left">Email</th><th className="p-2 text-left">Role</th><th className="p-2 text-left">Actions</th></tr></thead>
        <tbody>
          {rows.map(u => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">
                <div className="flex gap-2">
                  <button className="px-2 py-1 border rounded" onClick={() => setRole(u.id, 'viewer')}>viewer</button>
                  <button className="px-2 py-1 border rounded" onClick={() => setRole(u.id, 'org_member')}>member</button>
                  <button className="px-2 py-1 border rounded" onClick={() => setRole(u.id, 'org_admin')}>admin</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Invite />
    </div>
  )
}

function Invite() {
  const [email, setEmail] = useState(''); const [msg, setMsg] = useState(''); const [err, setErr] = useState('')
  return (
    <div className="border rounded-2xl p-4 space-y-2">
      <h2 className="font-semibold">Invite user (magic link)</h2>
      <div className="flex gap-2">
        <input className="border rounded px-2 py-1" placeholder="email@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
        <button className="px-3 py-1 border rounded" onClick={async ()=>{
          setMsg(''); setErr('')
          const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` } })
          if (error) setErr(error.message); else setMsg('Invite sent')
        }}>Send</button>
      </div>
      {msg && <div className="text-green-700 text-sm">{msg}</div>}
      {err && <div className="text-red-700 text-sm">{err}</div>}
    </div>
  )
}
