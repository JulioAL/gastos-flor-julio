'use server'

import { updateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { PersonalExpense } from '@/lib/supabase/types'

export async function saveExpenseAction(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, unknown>,
  editId?: string
): Promise<PersonalExpense | null> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = supabase.from('personal_expenses') as any

  let data: PersonalExpense | null = null
  if (editId) {
    const result = await table.update(payload).eq('id', editId).select().single()
    data = result.data
  } else {
    const result = await table.insert(payload).select().single()
    data = result.data
  }

  updateTag(`expenses-${userId}`)
  updateTag('all-expenses')
  return data
}

export async function deleteExpenseAction(userId: string, id: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('personal_expenses').delete().eq('id', id)
  updateTag(`expenses-${userId}`)
  updateTag('all-expenses')
}

export async function bulkDeleteExpensesAction(userId: string, ids: string[]): Promise<void> {
  const supabase = await createClient()
  await supabase.from('personal_expenses').delete().in('id', ids)
  updateTag(`expenses-${userId}`)
  updateTag('all-expenses')
}
