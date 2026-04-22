import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ACCOUNTS } from '@/lib/utils/accounts'
import { getPendingExpenses } from '@/lib/data/expenses'
import { getPowerTotal } from '@/lib/data/power'
import { getCortes } from '@/lib/data/cortes'
import CorteClient from './CorteClient'

async function CorteContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [pendingExpenses, cortes, powerTotal] = await Promise.all([
    getPendingExpenses(user.id, 2026),
    getCortes(),
    getPowerTotal(),
  ])

  // Budget month + expenses are small and conditional — keep uncached
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: budgetMonth } = await (supabase.from('budget_months') as any)
    .select('id')
    .eq('year', currentYear)
    .eq('month', currentMonth)
    .maybeSingle()

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
      pendingExpenses={pendingExpenses}
      cortes={cortes}
      userId={user.id}
      budgetByAccount={budgetByAccount}
      powerTotal={powerTotal}
      budgetMonthId={(budgetMonth as { id: string } | null)?.id ?? null}
    />
  )
}

export default function CortePage() {
  return (
    <Suspense fallback={null}>
      <CorteContent />
    </Suspense>
  )
}
