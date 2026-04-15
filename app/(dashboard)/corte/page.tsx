import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ACCOUNTS } from '@/lib/utils/accounts'
import CorteClient from './CorteClient'

const POWER_COLS = [
  'carro','ahorro_casa','ahorro_extra','sueldo','cts',
  'intereses_ganados','gratificaciones','afp','emergencia',
  'jf_baby','bonos_utilidades','salud',
] as const

export default async function CortePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [
    { data: pendingExpenses },
    { data: cortes },
    { data: budgetMonth },
    { data: powerEntries },
  ] = await Promise.all([
    supabase.from('personal_expenses').select('*').is('corte_id', null).eq('year', 2026).order('date', { ascending: true }),
    supabase.from('cortes').select('*, corte_account_totals(*)').order('settled_date', { ascending: false }).limit(20),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('budget_months') as any).select('id').eq('year', currentYear).eq('month', currentMonth).maybeSingle(),
    supabase.from('power_account_entries').select(POWER_COLS.join(',')),
  ])

  const powerTotal = (powerEntries ?? []).reduce((sum, e) => {
    return sum + POWER_COLS.reduce((s, col) => s + (((e as Record<string, number | null>)[col]) ?? 0), 0)
  }, 0)

  // Calculate budget per account for the current month (same logic as CuentasClient)
  const budgetByAccount: Record<string, number> = {}
  if (budgetMonth) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: budgetExpenses } = await (supabase.from('budget_expenses') as any)
      .select('*')
      .eq('budget_month_id', (budgetMonth as { id: string }).id)

    const rows = (budgetExpenses ?? []) as { account: string; category: string; amount: number | null }[]
    for (const acc of ACCOUNTS) {
      const direct = rows.find(e => e.account === acc.key && e.category === acc.key)
      budgetByAccount[acc.key] = direct
        ? (direct.amount ?? 0)
        : rows.filter(e => e.account === acc.key && e.category !== acc.key).reduce((s, e) => s + (e.amount ?? 0), 0)
    }
  }

  return (
    <CorteClient
      pendingExpenses={pendingExpenses ?? []}
      cortes={cortes ?? []}
      userId={user.id}
      budgetByAccount={budgetByAccount}
      powerTotal={powerTotal}
      budgetMonthId={(budgetMonth as { id: string } | null)?.id ?? null}
    />
  )
}
