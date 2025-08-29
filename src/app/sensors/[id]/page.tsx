import { requireUser } from '@/lib/rbac'
import { getSensorSeries } from '@/lib/queries'
import RealtimeSensor from '@/components/realtime-sensor'

export default async function SensorDetail({ params, searchParams }: { params: { id: string }, searchParams: { hours?: string } }) {
  const { profile } = await requireUser()
  const hours = Math.max(1, Math.min(72, Number(searchParams.hours || 6)))
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
  const { data } = await getSensorSeries(profile.org_id, params.id, since)
  const initial = (data || []).map(r => ({ ts: new Date(r.ts).toLocaleTimeString(), value: r.value }))
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Sensor {params.id}</h1>
      <RealtimeSensor org_id={profile.org_id} sensor_id={params.id} initial={initial} />
    </div>
  )
}
