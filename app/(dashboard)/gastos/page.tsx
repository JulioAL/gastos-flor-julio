import { createClient } from '@/lib/supabase/server'
import GastosClient from './GastosClient'

export default async function GastosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: expenses } = await supabase
    .from('personal_expenses')
    .select('*')
    .eq('year', 2026)
    .order('date', { ascending: false })

  const userEmail = user!.email ?? ''
  const isJulio = userEmail.toLowerCase().includes('julio')

  return <GastosClient initialExpenses={expenses ?? []} userId={user!.id} isJulio={isJulio} />
}
