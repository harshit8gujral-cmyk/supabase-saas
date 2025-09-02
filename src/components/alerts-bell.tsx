'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/library/supabase/client'

export default function AlertsBell({ org_id }: { org_id: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const ch = supabase.channel(`alerts-${org_id}`)
      .on('postgres_changes', { schema: 'public', table: 'alerts', event: 'INSERT', filter: `org_id=eq.${org_id}` },
        () => setCount(c => c + 1))
      .subscribe()
    return () => { ch.unsubscribe() }
  }, [org_id])
  return <span className="text-xs px-2 py-1 border rounded">New alerts: {count}</span>
}
