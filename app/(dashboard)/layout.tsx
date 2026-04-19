import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NavBar from '@/components/ui/NavBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {process.env.NEXT_PUBLIC_ENV !== 'production' && (
        <div className="bg-amber-400 text-amber-900 text-xs font-bold text-center py-1 tracking-widest uppercase">
          DEV — base de datos de prueba
        </div>
      )}
      <NavBar user={user} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  )
}
