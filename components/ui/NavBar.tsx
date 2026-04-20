'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const TABS = [
  {
    href: '/resumen',
    label: 'Resumen',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="18" y="3" width="4" height="18" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/><rect x="2" y="13" width="4" height="8" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/gastos',
    label: 'Gastos',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8H8M16 12H8M12 16H8"/>
      </svg>
    ),
  },
  {
    href: '/corte',
    label: 'Corte',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
        <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    href: '/cuentas',
    label: 'Cuentas',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
  },
  {
    href: '/power',
    label: 'Power',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    href: '/ajustes',
    label: 'Ajustes',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
]

export default function NavBar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const userName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Usuario'
  const initials = userName.charAt(0).toUpperCase()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* ── Sidebar: desktop only ─────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col"
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-xl text-white text-sm font-bold flex-shrink-0"
              style={{ background: 'var(--accent)' }}
            >
              F
            </div>
            <div>
              <p className="text-sm font-bold leading-tight" style={{ color: 'var(--t)' }}>Flor &amp; Julio</p>
              <p className="text-xs" style={{ color: 'var(--t3)' }}>Gastos 2026</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ padding: '0 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TABS.map(tab => {
            const active = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={
                  active
                    ? { background: 'var(--asoft)', color: 'var(--atext)' }
                    : { color: 'var(--t2)' }
                }
              >
                <span style={{ color: active ? 'var(--accent)' : 'var(--t3)', flexShrink: 0 }}>
                  {tab.icon}
                </span>
                {tab.label}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div
          className="flex items-center gap-2.5"
          style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--t)' }}>{userName}</p>
            <button
              onClick={signOut}
              className="text-xs transition-opacity hover:opacity-60"
              style={{ color: 'var(--t3)' }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* ── Bottom nav: mobile only ───────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 flex"
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}
      >
        {TABS.map(tab => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 relative"
              style={{ color: active ? 'var(--accent)' : 'var(--t3)' }}
            >
              {active && (
                <span
                  className="absolute top-0"
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 32,
                    height: 3,
                    borderRadius: '0 0 2px 2px',
                    background: 'var(--accent)',
                  }}
                />
              )}
              {tab.icon}
              <span style={{ fontSize: 10, fontWeight: 500 }}>{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
