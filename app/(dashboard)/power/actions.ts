'use server'

import { updateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { PowerAccountEntry } from '@/lib/supabase/types'

export async function savePowerEntryAction(payload: Record<string, unknown>): Promise<PowerAccountEntry | null> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('power_account_entries') as any).insert(payload).select().single()
  updateTag('power-entries')
  return data
}

export async function deletePowerEntryAction(id: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('power_account_entries').delete().eq('id', id)
  updateTag('power-entries')
}

export async function bulkDeletePowerEntriesAction(ids: string[]): Promise<void> {
  const supabase = await createClient()
  await supabase.from('power_account_entries').delete().in('id', ids)
  updateTag('power-entries')
}
