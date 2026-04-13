import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: expenses }, { data: powerEntries }] = await Promise.all([
    supabase.from('personal_expenses').select('*').eq('year', 2026).order('date'),
    supabase.from('power_account_entries').select('entry_year, entry_month, ahorro_casa, ahorro_extra, sueldo, cts, intereses_ganados, emergencia, jf_baby, salud, carro, afp, gratificaciones, bonos_utilidades').order('entry_year').order('created_at'),
  ])

  return <DashboardClient expenses={expenses ?? []} powerEntries={powerEntries ?? []} />
}
