import { createClient } from '@/lib/supabase/server'
import PowerClient from './PowerClient'

export default async function PowerPage() {
  const supabase = await createClient()

  const { data: entries } = await supabase
    .from('power_account_entries')
    .select('*')
    .order('entry_year', { ascending: true })
    .order('created_at', { ascending: true })

  return <PowerClient initialEntries={entries ?? []} />
}
