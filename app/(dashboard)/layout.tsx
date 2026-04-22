import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavBar from '@/components/ui/NavBar'

async function DashboardShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isDev = process.env.NEXT_PUBLIC_ENV !== 'production'

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--t)', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {isDev && (
        <div className="bg-amber-400 text-amber-900 text-xs font-bold text-center py-1 tracking-widest uppercase flex-shrink-0">
          DEV — base de datos de prueba
        </div>
      )}
      <div className="app-shell" style={{ flex: 1, minHeight: 0 }}>
        <NavBar user={user} />
        <main
          style={{
            flex: 1,
            background: 'var(--bg)',
            overflowY: 'auto',
            height: '100%',
          }}
        >
          <div style={{ paddingTop: 24, paddingBottom: 100, paddingLeft: 32, paddingRight: 32, maxWidth: 720 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  )
}
