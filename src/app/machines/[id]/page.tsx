import { requireUser } from '@/lib/rbac'
import { getMachines } from '@/lib/queries'
import Link from 'next/link'

export default async function MachinesPage() {
  const { profile } = await requireUser()
  const { data } = await getMachines(profile.org_id)

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Machines</h1>
      <table className="min-w-full text-sm border rounded">
        <thead>
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Line</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Last service</th>
          </tr>
        </thead>
        <tbody>
          {(data || []).map(m => (
            <tr key={m.id} className="border-t">
              <td className="p-2 underline">
                <Link href={`/machines/${m.id}`}>{m.name}</Link>
              </td>
              <td className="p-2">{m.line || '-'}</td>
              <td className="p-2">{m.status}</td>
              <td className="p-2">{m.last_service_at || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
