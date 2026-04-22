import { cacheTag, cacheLife } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { CorteWithTotals } from '@/lib/supabase/types'

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getCortes(limit = 20): Promise<CorteWithTotals[]> {
  'use cache'
  cacheTag('cortes')
  cacheLife('hours')

  const { data } = await admin()
    .from('cortes')
    .select('*, corte_account_totals(*)')
    .order('settled_date', { ascending: false })
    .limit(limit)
  return (data ?? []) as CorteWithTotals[]
}
