import { createClient } from '@/lib/supabase/server'
import ResumenClient from './ResumenClient'

export default async function ResumenPage() {
  const supabase = await createClient()

  const [{ data: months }, { data: expenses }] = await Promise.all([
    supabase.from('budget_months').select('*').eq('year', 2026).order('month', { ascending: true }),
    supabase.from('personal_expenses').select('*').eq('year', 2026).order('date'),
  ])

  return <ResumenClient months={months ?? []} expenses={expenses ?? []} />
}
