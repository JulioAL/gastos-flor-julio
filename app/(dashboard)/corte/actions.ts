'use server'

import { updateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CORTE_ACCOUNT_GROUPS } from '@/lib/utils/accounts'
import type { CorteWithTotals } from '@/lib/supabase/types'

export async function revertCorteAction(corteId: string): Promise<void> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('cortes') as any).delete().eq('id', corteId)
  // DB constraint ON DELETE SET NULL handles personal_expenses.corte_id automatically
  updateTag('cortes')
  updateTag('all-expenses')
}

type PowerRow = Record<string, unknown>

export async function realizarCorteAction(params: {
  settledDate: string
  notes: string | null
  userId: string
  accountTotals: Record<string, number>
  expenseIds: string[]
  budgetMonthId: string | null
  powerRows: PowerRow[]
}): Promise<CorteWithTotals | null> {
  const { settledDate, notes, userId, accountTotals, expenseIds, budgetMonthId, powerRows } = params
  const supabase = await createClient()
  const now = new Date(settledDate + 'T12:00:00')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cortesClient = supabase.from('cortes') as any
  const { data: newCorte, error } = await cortesClient
    .insert({ settled_date: settledDate, year: now.getFullYear(), month: now.getMonth() + 1, notes: notes || null, created_by: userId })
    .select()
    .single()

  if (error || !newCorte) return null

  const totalsRows = CORTE_ACCOUNT_GROUPS
    .filter(g => accountTotals[g.accountKey] > 0)
    .map(g => ({ corte_id: newCorte.id, account_key: g.accountKey, total_amount: accountTotals[g.accountKey] }))

  if (totalsRows.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('corte_account_totals') as any).insert(totalsRows)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('personal_expenses') as any).update({ corte_id: newCorte.id }).in('id', expenseIds)

  if (budgetMonthId) {
    const accountsToDeduct = CORTE_ACCOUNT_GROUPS.filter(
      g => g.accountKey !== 'power' && (accountTotals[g.accountKey] ?? 0) > 0
    )
    if (accountsToDeduct.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const budgetClient = supabase.from('budget_expenses') as any
      const { data: existingRows } = await budgetClient.select('id, account, category, amount').eq('budget_month_id', budgetMonthId)
      const rows = (existingRows ?? []) as { id: string; account: string; category: string; amount: number | null }[]

      for (const group of accountsToDeduct) {
        const corteAmt = accountTotals[group.accountKey]
        const direct = rows.find(r => r.account === group.accountKey && r.category === group.accountKey)
        const currentBalance = direct
          ? (direct.amount ?? 0)
          : rows.filter(r => r.account === group.accountKey && r.category !== group.accountKey).reduce((s, r) => s + (r.amount ?? 0), 0)
        const newBalance = currentBalance - corteAmt
        if (direct) {
          await budgetClient.update({ amount: newBalance }).eq('id', direct.id)
        } else {
          await budgetClient.insert({ budget_month_id: budgetMonthId, account: group.accountKey, category: group.accountKey, amount: newBalance })
        }
      }
    }
  }

  if (powerRows.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('power_account_entries') as any).insert(powerRows)
    updateTag('power-entries')
  }

  updateTag('cortes')
  updateTag('all-expenses')

  return { ...newCorte, corte_account_totals: totalsRows.map((r, i) => ({ ...r, id: `temp-${i}` })) } as CorteWithTotals
}
