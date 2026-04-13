import { createClient } from '@/lib/supabase/server'
import CuentasClient from './CuentasClient'

export default async function CuentasPage() {
  const supabase = await createClient()

  const { data: months } = await supabase
    .from('budget_months')
    .select('*')
    .eq('year', 2026)
    .order('month')

  return <CuentasClient months={months ?? []} />
}
