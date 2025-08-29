import './globals.css'
import { ReactNode } from 'react'
import Navbar from '@/components/navbar'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="max-w-7xl mx-auto p-4">{children}</main>
      </body>
    </html>
  )
}
