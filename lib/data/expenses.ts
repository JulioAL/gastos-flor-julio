import { cacheTag, cacheLife } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { PersonalExpense } from '@/lib/supabase/types'

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getPersonalExpenses(userId: string, year: number): Promise<PersonalExpense[]> {
  'use cache'
  cacheTag(`expenses-${userId}`)
  cacheLife('hours')

  const { data } = await admin()
    .from('personal_expenses')
    .select('*')
    .eq('user_id', userId)
    .eq('year', year)
    .order('date', { ascending: false })
  return data ?? []
}

export async function getPendingExpenses(userId: string, year: number): Promise<PersonalExpense[]> {
  'use cache'
  cacheTag(`expenses-${userId}`)
  cacheLife('hours')

  const { data } = await admin()
    .from('personal_expenses')
    .select('*')
    .eq('user_id', userId)
    .is('corte_id', null)
    .eq('year', year)
    .order('date', { ascending: true })
  return data ?? []
}

export async function getAllExpenses(year: number): Promise<PersonalExpense[]> {
  'use cache'
  cacheTag('all-expenses')
  cacheLife('hours')

  const { data } = await admin()
    .from('personal_expenses')
    .select('*')
    .eq('year', year)
    .order('date')
  return data ?? []
}
