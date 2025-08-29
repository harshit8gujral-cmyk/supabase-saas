import { requireUser } from '@/lib/rbac'
import { getInventory } from '@/lib/queries'
import Link from 'next/link'

export default async function InventoryPage() {
  const { profile } = await requireUser()
  const { data } = await getInventory(profile.org_id)

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Inventory</h1>
      <table className="min-w-full text-sm border rounded">
        <thead>
          <tr>
            <th className="p-2 text-left">SKU</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Qty</th>
            <th className="p-2 text-left">Location</th>
          </tr>
        </thead>
        <tbody>
          {(data || []).map(it => (
            <tr key={it.id} className="border-t">
              <td className="p-2 underline">
                <Link href={`/inventory/${it.id}`}>{it.sku}</Link>
              </td>
              <td className="p-2">{it.name}</td>
              <td className="p-2">{it.quantity}</td>
              <td className="p-2">{it.location || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
