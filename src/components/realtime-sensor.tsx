'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/library/supabase/client'
import { SensorSeries } from '@/components/charts'

type Pt = { ts: string; value: number }

export default function RealtimeSensor({ org_id, sensor_id, initial }: { org_id: string; sensor_id: string; initial: Pt[] }) {
  const [data, setData] = useState<Pt[]>(initial)

  useEffect(() => {
    const ch = supabase.channel(`sensor-${sensor_id}`)
      .on('postgres_changes',
        { schema: 'public', table: 'sensor_data', event: 'INSERT', filter: `org_id=eq.${org_id}` },
        (p: any) => {
          if (p.new.sensor_id !== sensor_id) return
          setData(d => [...d.slice(-999), { ts: new Date(p.new.ts).toLocaleTimeString(), value: p.new.value }])
        })
      .subscribe()
    return () => { ch.unsubscribe() }
  }, [org_id, sensor_id])

  const normalized = useMemo(() => data.map(d => ({ ts: d.ts, value: d.value })), [data])

  return <SensorSeries data={normalized} />
}
