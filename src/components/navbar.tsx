'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import AlertsBell from './alerts-bell'

export default function Navbar() {
  const [email, setEmail] = useState('')
  const [org, setOrg] = useState<string>('')

  useEffect(() => {
    supabase.auth.getUser().then(async r => {
      const u = r.data.user
      setEmail(u?.email || '')
      if (u?.id) {
        const { data } = await supabase.from('profiles').select('org_id').eq('id', u.id).single()
        setOrg(data?.org_id || '')
      }
    })
  }, [])

  return (
    <header className="w-full border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-3">
        <nav className="flex gap-4 text-sm">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/machines">Machines</Link>
          <Link href="/inventory">Inventory</Link>
          <Link href="/maintenance">Maintenance</Link>
          <Link href="/alerts">Alerts</Link>
          {/* This is the new line you need to add */}
          {email && <Link href="/admin/users">Admin</Link>}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-xs opacity-70">{email}</span>
          {org && <AlertsBell org_id={org} />}
          <form action="/api/logout" method="post">
            <button className="text-sm underline">Logout</button>
          </form>
        </div>
      </div>
    </header>
  )
}
