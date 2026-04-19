import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import ResumenClient from './ResumenClient'

export default async function ResumenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Admin client bypasses RLS — used only to fetch shared hogar expenses from all users
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: months }, { data: myExpenses }, { data: allExpenses }] = await Promise.all([
    supabase.from('budget_months').select('*').eq('year', 2026).order('month', { ascending: true }),
    supabase.from('personal_expenses').select('*').eq('user_id', user!.id).eq('year', 2026).order('date'),
    admin.from('personal_expenses').select('*').eq('year', 2026).order('date'),
  ])

  return (
    <ResumenClient
      months={months ?? []}
      expenses={myExpenses ?? []}
      allExpenses={allExpenses ?? []}
    />
  )
}
