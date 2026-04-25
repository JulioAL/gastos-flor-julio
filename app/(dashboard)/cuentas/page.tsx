import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import CuentasClient from './CuentasClient'
import type { PersonalExpense } from '@/lib/supabase/types'

const POWER_COLS = [
  'carro','ahorro_casa','ahorro_extra','sueldo','cts',
  'intereses_ganados','gratificaciones','afp','emergencia',
  'jf_baby','bonos_utilidades','salud',
] as const

export default async function CuentasPage() {
  const supabase = await createClient()
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { data: months },
    { data: powerEntries },
    { data: allExpenses },
  ] = await Promise.all([
    supabase.from('budget_months').select('*').order('year').order('month'),
    supabase.from('power_account_entries').select(POWER_COLS.join(',')),
    admin.from('personal_expenses').select('*').eq('year', 2026).order('date'),
  ])

  const powerTotal = (powerEntries ?? []).reduce((sum, e) => {
    return sum + POWER_COLS.reduce((s, col) => s + (((e as Record<string, number | null>)[col]) ?? 0), 0)
  }, 0)

  return (
    <CuentasClient
      initialMonths={months ?? []}
      powerTotal={powerTotal}
      allExpenses={(allExpenses ?? []) as PersonalExpense[]}
    />
  )
}
