import { cacheTag, cacheLife } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { BudgetMonth } from '@/lib/supabase/types'

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
