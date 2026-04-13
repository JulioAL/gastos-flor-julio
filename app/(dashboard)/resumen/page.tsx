import { createClient } from '@/lib/supabase/server'
import ResumenClient from './ResumenClient'

export default async function ResumenPage() {
  const supabase = await createClient()

  const { data: months } = await supabase
    .from('budget_months')
    .select('*')
    .eq('year', 2026)
    .order('month', { ascending: true })

  return <ResumenClient months={months ?? []} />
}
