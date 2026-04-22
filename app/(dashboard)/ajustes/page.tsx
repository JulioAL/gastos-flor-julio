'use client'

import { useTheme, COLOR_THEMES, type ColorTheme } from '@/components/ui/ThemeProvider'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AjustesPage() {
  const { colorTheme, setColorTheme, theme, setTheme } = useTheme()
  const supabase = createClient()
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserName(user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Usuario')
      setUserEmail(user.email ?? '')
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = userName.charAt(0).toUpperCase()

  return (
    <div className="space-y-6 pb-32 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--t)' }}>Ajustes</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>Personaliza la apariencia de tu app</p>
      </div>

      {/* Profile */}
      <div
        className="rounded-2xl border p-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            {initials || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate" style={{ color: 'var(--t)' }}>{userName}</p>
            <p className="text-xs truncate" style={{ color: 'var(--t3)' }}>{userEmail}</p>
          </div>
          <button
            onClick={signOut}
            className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
            style={{ background: 'var(--bg2)', color: 'var(--t2)' }}
          >
            Salir
          </button>
        </div>
      </div>

      {/* Color theme picker */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--t3)' }}>
          Tema de colores
        </p>
        <div
          className="rounded-2xl border p-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="text-sm mb-4" style={{ color: 'var(--t2)' }}>
            Escoge el tema que más te guste. Los colores se aplican a toda la app.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COLOR_THEMES.map(th => {
              const active = colorTheme === th.id
              return (
                <button
                  key={th.id}
                  onClick={() => setColorTheme(th.id as ColorTheme)}
                  className="rounded-2xl p-3 text-left transition-all"
                  style={
                    active
                      ? {
                          background: th.swatch + '18',
                          border: `2px solid ${th.swatch}`,
                          boxShadow: `0 4px 16px ${th.swatch}22`,
                        }
                      : {
                          background: 'var(--bg2)',
                          border: '2px solid transparent',
                        }
                  }
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className="w-9 h-9 rounded-full flex-shrink-0"
                      style={{
                        background: th.swatch,
                        boxShadow: `0 2px 8px ${th.swatch}66`,
                      }}
                    />
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: active ? th.swatch : 'var(--t)' }}
                      >
                        {th.label}
                      </p>
                      {active && (
                        <p className="text-xs" style={{ color: th.swatch }}>✓ Activo</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div style={{ flex: 2, height: 4, borderRadius: 2, background: th.swatch }} />
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: th.swatch, opacity: 0.5 }} />
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: th.swatch, opacity: 0.25 }} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Dark mode */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--t3)' }}>
          Modo de pantalla
        </p>
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {[
            { id: 'system', label: 'Automático', desc: 'Sigue las preferencias del sistema' },
            { id: 'light',  label: 'Claro',      desc: 'Siempre en modo claro' },
            { id: 'dark',   label: 'Oscuro',     desc: 'Siempre en modo oscuro' },
          ].map((opt, i, arr) => (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id as 'system' | 'light' | 'dark')}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--t)' }}>{opt.label}</p>
                <p className="text-xs" style={{ color: 'var(--t3)' }}>{opt.desc}</p>
              </div>
              {theme === opt.id && (
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--accent)' }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preferences (display only) */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--t3)' }}>
          Preferencias
        </p>
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {[
            { label: 'Moneda', value: 'Soles (S/)' },
            { label: 'Idioma', value: 'Español' },
            { label: 'Primer día del mes', value: 'Día 1' },
          ].map((item, i, arr) => (
            <div
              key={item.label}
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <span className="text-sm" style={{ color: 'var(--t)' }}>{item.label}</span>
              <span className="text-sm" style={{ color: 'var(--t3)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Version */}
      <div className="text-center py-4">
        <p className="text-xs" style={{ color: 'var(--t3)' }}>Flor &amp; Julio · Gastos</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>v2.0 · 2026</p>
      </div>
    </div>
  )
}
