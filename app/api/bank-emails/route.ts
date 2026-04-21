import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

// ----------------------------------------------------------------
// Card → account mapping
// TODO: fill in with real card last-4 digits and user IDs once confirmed
// Example:
//   '7176': { column: 'julio', user_id: 'uuid-de-julio' },  // BCP débito
//   '9399': { column: 'julio', user_id: 'uuid-de-julio' },  // BCP crédito
//   '1001': { column: 'julio', user_id: 'uuid-de-julio' },  // Scotia Free
// ----------------------------------------------------------------
const CARD_MAPPING: Record<string, { column: string; user_id: string }> = {}

type BankEmailPayload = {
  bank: string
  amount: number
  merchant: string
  card_type: string
  card_last4: string | null
  date: string
  operation_number: string | null
  gmail_message_id: string
}

function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.BANK_EMAIL_SECRET

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload: BankEmailPayload = await request.json()
  const { bank, amount, merchant, card_type, card_last4, date, operation_number, gmail_message_id } = payload

  const supabase = getServiceClient()

  // Deduplicate by Gmail message ID
  const { data: existing } = await supabase
    .from('bank_email_log')
    .select('id')
    .eq('gmail_message_id', gmail_message_id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ status: 'duplicate' })
  }

  const mapping = card_last4 ? CARD_MAPPING[card_last4] : undefined

  if (!mapping) {
    await supabase.from('bank_email_log').insert({
      gmail_message_id,
      bank,
      amount,
      merchant,
      card_last4: card_last4 ?? undefined,
      operation_number: operation_number ?? undefined,
      status: 'error',
      error_message: `Tarjeta no configurada: ${card_last4}`,
    })
    return NextResponse.json({ error: `Tarjeta no configurada: ${card_last4}` }, { status: 422 })
  }

  const expenseDate = new Date(date)
  const year = expenseDate.getFullYear()
  const month = expenseDate.getMonth() + 1
  const tabName = `${year}-${String(month).padStart(2, '0')}`

  const { error: insertError } = await supabase.from('personal_expenses').insert({
    user_id: mapping.user_id,
    date: expenseDate.toISOString().split('T')[0],
    description: merchant,
    [mapping.column]: amount,
    account_type: card_type === 'Crédito' ? 'credito' : 'debito',
    tab_name: tabName,
    year,
  })

  if (insertError) {
    await supabase.from('bank_email_log').insert({
      gmail_message_id,
      bank,
      amount,
      merchant,
      card_last4: card_last4 ?? undefined,
      operation_number: operation_number ?? undefined,
      status: 'error',
      error_message: insertError.message,
    })
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  await supabase.from('bank_email_log').insert({
    gmail_message_id,
    bank,
    amount,
    merchant,
    card_last4: card_last4 ?? undefined,
    operation_number: operation_number ?? undefined,
    status: 'ok',
  })

  return NextResponse.json({ status: 'created' })
}
