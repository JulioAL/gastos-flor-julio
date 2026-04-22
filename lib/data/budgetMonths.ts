import { cacheTag, cacheLife } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { BudgetMonth } from '@/lib/supabase/types'
import { ACCOUNTS } from '@/lib/utils/accounts'

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getBudgetMonths(year?: number): Promise<BudgetMonth[]> {
  'use cache'
  cacheTag('budget-months')
  cacheLife('hours')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (admin().from('budget_months') as any).select('*').order('year').order('month')
  if (year !== undefined) query = query.eq('year', year)
  const { data } = await query
  return data ?? []
}

export async function getBudgetByAccount(
  year: number,
  month: number
): Promise<{ budgetMonthId: string | null; budgetByAccount: Record<string, number> }> {
  'use cache'
  cacheTag('budget-months')
  cacheLife('hours')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: budgetMonth } = await (admin().from('budget_months') as any)
    .select('id')
    .eq('year', year)
    .eq('month', month)
    .maybeSingle()

  const budgetByAccount: Record<string, number> = {}
  if (!budgetMonth) return { budgetMonthId: null, budgetByAccount }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: budgetExpenses } = await (admin().from('budget_expenses') as any)
    .select('*')
    .eq('budget_month_id', (budgetMonth as { id: string }).id)

  const rows = (budgetExpenses ?? []) as { account: string; category: string; amount: number | null }[]
  for (const acc of ACCOUNTS) {
    const direct = rows.find(e => e.account === acc.key && e.category === acc.key)
    budgetByAccount[acc.key] = direct
      ? (direct.amount ?? 0)
      : rows.filter(e => e.account === acc.key && e.category !== acc.key).reduce((s, e) => s + (e.amount ?? 0), 0)
  }

  return { budgetMonthId: (budgetMonth as { id: string }).id, budgetByAccount }
}
