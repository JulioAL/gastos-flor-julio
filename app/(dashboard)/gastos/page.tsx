import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getPersonalExpenses } from '@/lib/data/expenses'
import GastosClient from './GastosClient'

async function GastosContent() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session!.user
  const expenses = await getPersonalExpenses(user.id, 2026)
  const isJulio = (user.email ?? '').toLowerCase().includes('julio')
  return <GastosClient initialExpenses={expenses} userId={user.id} isJulio={isJulio} />
}

export default function GastosPage() {
  return (
    <Suspense fallback={null}>
      <GastosContent />
    </Suspense>
  )
}
