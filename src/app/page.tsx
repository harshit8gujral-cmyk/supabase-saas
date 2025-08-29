import Link from 'next/link'

export default function Home() {
  return (
    <div className="p-8">
      <Link className="underline" href="/login">Login</Link>
    </div>
  )
}
