'use client'
import { supabase } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(''); setMsg('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` }
    })
    if (error) setErr(error.message)
    else setMsg('Magic link sent to your email.')
  }

  return (
    <div className="max-w-md mx-auto p-6 border rounded-2xl mt-10">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input type="email" required placeholder="email@example.com"
          value={email} onChange={e => setEmail(e.target.value)}
          className="border rounded px-3 py-2"/>
        <button className="bg-black text-white rounded px-3 py-2">Send magic link</button>
        {msg && <p className="text-green-700 text-sm">{msg}</p>}
        {err && <p className="text-red-700 text-sm">{err}</p>}
      </form>
    </div>
  )
}
