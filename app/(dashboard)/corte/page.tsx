import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CorteClient from './CorteClient'

export default async function CortePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pendingExpenses } = await supabase
    .from('personal_expenses')
    .select('*')
    .is('corte_id', null)
    .eq('year', 2026)
    .order('date', { ascending: true })

  const { data: cortes } = await supabase
    .from('cortes')
    .select('*, corte_account_totals(*)')
    .order('settled_date', { ascending: false })
    .limit(20)

  return (
    <CorteClient
      pendingExpenses={pendingExpenses ?? []}
      cortes={cortes ?? []}
      userId={user.id}
    />
  )
}
