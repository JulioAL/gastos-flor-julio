'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const TABS = [
  { href: '/resumen',    label: 'Resumen' },
  { href: '/gastos',     label: 'Gastos' },
  { href: '/dashboard',  label: 'Dashboard' },
  { href: '/cuentas',    label: 'Cuentas' },
  { href: '/power',      label: 'Power' },
]

export default function NavBar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="font-bold text-gray-800 text-sm">💰 Julio & Flor</span>

        {/* Desktop nav */}
        <nav className="hidden sm:flex gap-1">
          {TABS.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                pathname.startsWith(tab.href)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={signOut}
          className="text-xs text-gray-400 hover:text-gray-600 transition"
        >
          Salir
        </button>
      </div>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10">
        {TABS.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 py-3 text-center text-xs font-medium transition ${
              pathname.startsWith(tab.href)
                ? 'text-indigo-700'
                : 'text-gray-500'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
