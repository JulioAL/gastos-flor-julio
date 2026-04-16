import { createClient } from '@/lib/supabase/server'
import CuentasClient from './CuentasClient'

const POWER_COLS = [
  'carro','ahorro_casa','ahorro_extra','sueldo','cts',
  'intereses_ganados','gratificaciones','afp','emergencia',
  'jf_baby','bonos_utilidades','salud',
] as const

export default async function CuentasPage() {
  const supabase = await createClient()

  const [{ data: months }, { data: powerEntries }] = await Promise.all([
    supabase.from('budget_months').select('*').order('year').order('month'),
    supabase.from('power_account_entries').select(POWER_COLS.join(',')),
  ])

  const powerTotal = (powerEntries ?? []).reduce((sum, e) => {
    return sum + POWER_COLS.reduce((s, col) => s + (((e as Record<string, number | null>)[col]) ?? 0), 0)
  }, 0)

  return <CuentasClient months={months ?? []} powerTotal={powerTotal} />
}
