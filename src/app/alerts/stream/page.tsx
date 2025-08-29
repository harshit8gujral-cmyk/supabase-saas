'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AlertsStream() {
  const [rows, setRows] = useState<any[]>([])
  const [org, setOrg] = useState<string>('')

  useEffect(() => {
    (async () => {
      const u = await supabase.auth.getUser()
      if (!u.data.user) return
      const p = await supabase.from('profiles').select('org_id').eq('id', u.data.user.id).single()
      const org_id = p.data?.org_id || ''
      setOrg(org_id)
      const ch = supabase.channel(`alerts-${org_id}`)
        .on('postgres_changes', { schema: 'public', table: 'alerts', event: 'INSERT', filter: `org_id=eq.${org_id}` },
          (payload: any) => setRows(r => [payload.new, ...r].slice(0, 200)))
        .subscribe()
      return () => { ch.unsubscribe() }
    })()
  }, [])

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-2xl font-semibold">Live Alerts</h1>
      <ul className="text-sm list-disc pl-5">
        {rows.map(a => <li key={a.id}>{a.created_at} • {a.level.toUpperCase()} • {a.kind} • {a.message}</li>)}
      </ul>
    </div>
  )
}
