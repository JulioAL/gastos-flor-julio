import { Suspense } from 'react'
import { getPowerEntries } from '@/lib/data/power'
import PowerClient from './PowerClient'

async function PowerContent() {
  const entries = await getPowerEntries()
  return <PowerClient initialEntries={entries} />
}

export default function PowerPage() {
  return (
    <Suspense fallback={null}>
      <PowerContent />
    </Suspense>
  )
}
