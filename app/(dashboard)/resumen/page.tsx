import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getPersonalExpenses, getAllExpenses } from '@/lib/data/expenses'
import { getBudgetMonths } from '@/lib/data/budgetMonths'
import ResumenClient from './ResumenClient'

async function ResumenContent() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session!.user

  const [months, myExpenses, allExpenses] = await Promise.all([
    getBudgetMonths(2026),
    getPersonalExpenses(user.id, 2026),
    getAllExpenses(2026),
  ])

  return (
    <ResumenClient
      months={months}
      expenses={myExpenses}
      allExpenses={allExpenses}
    />
  )
}

export default function ResumenPage() {
  return (
    <Suspense fallback={null}>
      <ResumenContent />
    </Suspense>
  )
}
