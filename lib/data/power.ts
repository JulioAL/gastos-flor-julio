import { cacheTag, cacheLife } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { PowerAccountEntry } from '@/lib/supabase/types'

const POWER_COLS = [
  'carro','ahorro_casa','ahorro_extra','sueldo','cts',
  'intereses_ganados','gratificaciones','afp','emergencia',
  'jf_baby','bonos_utilidades','salud',
] as const

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getPowerEntries(): Promise<PowerAccountEntry[]> {
  'use cache'
  cacheTag('power-entries')
  cacheLife('hours')

  const { data } = await admin()
    .from('power_account_entries')
    .select('*')
    .order('entry_year', { ascending: true })
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function getPowerTotal(): Promise<number> {
  'use cache'
  cacheTag('power-entries')
  cacheLife('hours')

  const { data } = await admin()
    .from('power_account_entries')
    .select(POWER_COLS.join(','))

  return (data ?? []).reduce((sum, e) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return sum + POWER_COLS.reduce((s, col) => s + ((((e as any)[col]) as number | null) ?? 0), 0)
  }, 0)
}
