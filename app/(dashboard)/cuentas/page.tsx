import { Suspense } from 'react'
import { getBudgetMonths } from '@/lib/data/budgetMonths'
import { getPowerTotal } from '@/lib/data/power'
import CuentasClient from './CuentasClient'

async function CuentasContent() {
  const [months, powerTotal] = await Promise.all([
    getBudgetMonths(),
    getPowerTotal(),
  ])

  return <CuentasClient initialMonths={months} powerTotal={powerTotal} />
}

export default function CuentasPage() {
  return (
    <Suspense fallback={null}>
      <CuentasContent />
    </Suspense>
  )
}
