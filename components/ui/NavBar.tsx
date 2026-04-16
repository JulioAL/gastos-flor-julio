'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useTheme } from './ThemeProvider'

const TABS = [
  { href: '/resumen',   label: 'Resumen' },
  { href: '/gastos',    label: 'Gastos' },
  { href: '/corte',     label: 'Corte' },
  { href: '/cuentas',   label: 'Cuentas' },
  { href: '/power',     label: 'Power' },
]

export default function NavBar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { isDark, setTheme, theme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function toggleTheme() {
    if (isDark) {
      setTheme('light')
    } else {
      setTheme(theme === 'light' ? 'system' : 'dark')
    }
  }

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">💰 Julio & Flor</span>

          {/* Desktop nav */}
          <nav className="hidden sm:flex gap-1">
            {TABS.map(tab => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  pathname.startsWith(tab.href)
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            <button
              onClick={signOut}
              className="hidden sm:block text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              Salir
            </button>

            {/* Hamburger button — mobile only */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="sm:hidden p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Menú"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <nav className="sm:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            {TABS.map(tab => (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center px-5 py-3.5 text-sm font-medium border-b border-gray-50 dark:border-gray-800 transition ${
                  pathname.startsWith(tab.href)
                    ? 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </Link>
            ))}
            <button
              onClick={signOut}
              className="w-full text-left px-5 py-3.5 text-sm text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Salir
            </button>
          </nav>
        )}
      </header>
    </>
  )
}
