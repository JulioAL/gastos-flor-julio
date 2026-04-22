import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getPendingExpenses } from '@/lib/data/expenses'
import { getPowerTotal } from '@/lib/data/power'
import { getCortes } from '@/lib/data/cortes'
import { getBudgetByAccount } from '@/lib/data/budgetMonths'
import CorteClient from './CorteClient'

async function CorteContent() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  const user = session.user

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [pendingExpenses, cortes, powerTotal, { budgetMonthId, budgetByAccount }] = await Promise.all([
    getPendingExpenses(user.id, 2026),
    getCortes(),
    getPowerTotal(),
    getBudgetByAccount(currentYear, currentMonth),
  ])

  return (
    <CorteClient
      pendingExpenses={pendingExpenses}
      cortes={cortes}
      userId={user.id}
      budgetByAccount={budgetByAccount}
      powerTotal={powerTotal}
      budgetMonthId={budgetMonthId}
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
